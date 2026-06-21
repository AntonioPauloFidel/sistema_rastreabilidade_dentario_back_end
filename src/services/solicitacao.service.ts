import { Prisma, StatusSolicitacao, StatusDente } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { AuditoriaService } from './auditoria.service';
import { CessaoInput, SolicitacaoInput } from '../schemas/sirde.schema';

const auditoriaService = new AuditoriaService();

export class SolicitacaoService {
  async listar(filters?: { status?: StatusSolicitacao; instituicaoId?: string; page?: number; limit?: number }) {
    const where: Prisma.SolicitacaoDenteWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.instituicaoId) {
      where.instituicaoId = filters.instituicaoId;
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.solicitacaoDente.count({ where });

    const data = await prisma.solicitacaoDente.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: { instituicao: true, itens: true, cessoes: true },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  async criar(data: SolicitacaoInput) {
    return prisma.solicitacaoDente.create({
      data: {
        instituicaoId: data.instituicaoId,
        finalidade: data.finalidade,
        justificativa: data.justificativa,
        itens: {
          create: data.itens
        }
      },
      include: { itens: true }
    });
  }

  async decidir(id: string, status: StatusSolicitacao, motivo?: string) {
    const solicitacao = await prisma.solicitacaoDente.findUnique({ where: { id } });
    if (!solicitacao) throw new AppError('Solicitacao nao encontrada', 404);

    return prisma.solicitacaoDente.update({
      where: { id },
      data: { status, motivoDecisao: motivo }
    });
  }
}

export class CessaoService {
  async criar(data: CessaoInput, usuarioId?: string) {
    const dente = await prisma.dente.findUnique({ where: { id: data.denteId } });
    if (!dente) throw new AppError('Dente nao encontrado', 404);

    if (['CEDIDO', 'DESCARTADO', 'PERDIDO'].includes(dente.statusAtual)) {
      throw new AppError('Dente indisponivel para cessao', 400);
    }

    return prisma.$transaction(async (tx) => {
      const cessao = await tx.cessaoDente.create({
        data: {
          ...data,
          responsavelId: usuarioId
        }
      });

      await tx.dente.update({
        where: { id: data.denteId },
        data: { statusAtual: StatusDente.CEDIDO }
      });

      await tx.movimentacaoDente.create({
        data: {
          denteId: data.denteId,
          statusAnterior: dente.statusAtual,
          statusNovo: StatusDente.CEDIDO,
          motivo: 'Cessao registrada',
          observacao: data.observacao,
          responsavelId: usuarioId
        }
      });

      return cessao;
    });
  }

  async listarVencidas(usuarioId?: string) {
    const hoje = new Date();
    const cessoes = await prisma.cessaoDente.findMany({
      where: {
        dataLimiteUso: {
          lt: hoje
        }
      } as any,
      include: {
        solicitacao: true,
        instituicao: true,
        dente: true
      }
    });

    await Promise.all(
      cessoes.map(async (cessao) => {
        const eventoExistente = await prisma.auditoriaEvento.findFirst({
          where: {
            entidade: 'CessaoDente',
            entidadeId: cessao.id,
            acao: 'CESSAO_VENCIDA'
          }
        });

        if (!eventoExistente) {
          const dataLimiteUso = (cessao as any).dataLimiteUso as Date | undefined;

          return auditoriaService.registrar({
            usuarioId,
            acao: 'CESSAO_VENCIDA',
            entidade: 'CessaoDente',
            entidadeId: cessao.id,
            dados: {
              dataLimiteUso: dataLimiteUso?.toISOString()
            }
          });
        }

        return null;
      })
    );

    return cessoes;
  }
}
