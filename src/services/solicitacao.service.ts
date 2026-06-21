import { Prisma, StatusSolicitacao, StatusDente } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { CessaoInput, SolicitacaoInput } from '../schemas/sirde.schema';
import { solicitacaoListSelect } from '../prisma/selects';

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
      select: solicitacaoListSelect,
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
}
