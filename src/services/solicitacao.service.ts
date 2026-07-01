import { Prisma, StatusSolicitacao, StatusDente } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { CessaoInput, SolicitacaoInput } from '../schemas/sirde.schema';
import { solicitacaoListSelect } from '../prisma/selects';
import { enviarNotificacaoSolicitacao } from './email.service';

export class SolicitacaoService {
  async listar(filters?: { status?: StatusSolicitacao; instituicaoId?: string; page?: number; limit?: number }, usuarioInstituicaoId?: string) {
    const where: Prisma.SolicitacaoDenteWhereInput = {};

    // usuário vinculado a instituição: filtro forçado e não sobreposto pelo query param
    const instId = usuarioInstituicaoId ?? filters?.instituicaoId;
    if (instId) {
      where.instituicaoId = instId;
    }

    if (filters?.status) {
      where.status = filters.status;
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
    const solicitacao = await prisma.solicitacaoDente.findUnique({
      where: { id },
      include: { instituicao: { select: { email: true } } }
    });
    if (!solicitacao) throw new AppError('Solicitacao nao encontrada', 404);

    const atualizada = await prisma.solicitacaoDente.update({
      where: { id },
      data: { status, motivoDecisao: motivo }
    });

    if ((status === 'APROVADA' || status === 'RECUSADA') && solicitacao.instituicao.email) {
      enviarNotificacaoSolicitacao(solicitacao.instituicao.email, status, motivo).catch(() => {});
    }

    return atualizada;
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

  async listar(filters?: { instituicaoId?: string; page?: number; limit?: number }, usuarioInstituicaoId?: string) {
    const where: Prisma.CessaoDenteWhereInput = {};
    const instId = usuarioInstituicaoId ?? filters?.instituicaoId;
    if (instId) where.instituicaoId = instId;

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.cessaoDente.count({ where });
    const data = await prisma.cessaoDente.findMany({
      where,
      orderBy: { dataCessao: 'desc' },
      select: {
        id: true,
        dataCessao: true,
        prazoUso: true,
        observacao: true,
        instituicao: { select: { id: true, nome: true } },
        dente: { select: { id: true, codigoRastreio: true, tipo: true } }
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  async vencidas(filters?: { page?: number; limit?: number }) {
    const agora = new Date();
    const where: Prisma.CessaoDenteWhereInput = {
      prazoUso: { lt: agora, not: null }
    };

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.cessaoDente.count({ where });
    const data = await prisma.cessaoDente.findMany({
      where,
      orderBy: { prazoUso: 'asc' },
      select: {
        id: true,
        dataCessao: true,
        prazoUso: true,
        observacao: true,
        instituicao: { select: { id: true, nome: true } },
        dente: { select: { id: true, codigoRastreio: true, tipo: true } }
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
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
