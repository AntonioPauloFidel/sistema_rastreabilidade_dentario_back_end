import { StatusSolicitacao, StatusDente } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { AuditoriaService } from './auditoria.service';
import { CessaoInput, SolicitacaoInput } from '../schemas/sirde.schema';

const auditoriaService = new AuditoriaService();

export class SolicitacaoService {
  async listar() {
    return prisma.solicitacaoDente.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { instituicao: true, itens: true, cessoes: true }
    });
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

  async exportar(filters: { status?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    return prisma.solicitacaoDente.findMany({ where, orderBy: { criadoEm: 'desc' }, include: { instituicao: true, itens: true, cessoes: true } });
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

      // Verifica alertas de estoque configurados para o tipo do dente
      const alerta = await (tx as any).alertaEstoque.findFirst({ where: { tipoDente: dente.tipo, ativo: true } });
      if (alerta) {
        const estoqueAtual = await tx.dente.count({
          where: {
            tipo: dente.tipo,
            statusAtual: { notIn: [StatusDente.CEDIDO, StatusDente.DESCARTADO, StatusDente.PERDIDO] }
          }
        });

        if (estoqueAtual < alerta.limiteMinimo) {
          await tx.auditoriaEvento.create({
            data: {
              acao: 'ALERTA_ESTOQUE',
              entidade: 'AlertaEstoque',
              entidadeId: alerta.id,
              usuarioId: usuarioId,
              dados: {
                tipoDente: dente.tipo,
                limiteMinimo: alerta.limiteMinimo,
                estoqueAtual
              }
            }
          });
        }
      }

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

  async exportar(filters: { from?: string; to?: string }) {
    const where: any = {};
    if (filters.from || filters.to) {
      where.dataCessao = {};
      if (filters.from) where.dataCessao.gte = new Date(filters.from);
      if (filters.to) where.dataCessao.lte = new Date(filters.to);
    }

    return prisma.cessaoDente.findMany({ where, include: { dente: true, instituicao: true } });
  }
}
