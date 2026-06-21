import { prisma } from '../prisma/client';

export class DashboardService {
  async resumo() {
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const [
      dentesPorStatus,
      solicitacoesPorStatus,
      totalRemessas,
      remessasUltimoMes,
      clinicasAtivas,
      dentistasAtivos,
      instituicoesAtivas
    ] = await Promise.all([
      prisma.dente.groupBy({ by: ['statusAtual'], _count: { statusAtual: true } }),
      prisma.solicitacaoDente.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.remessaEntrada.count(),
      prisma.remessaEntrada.count({ where: { criadoEm: { gte: umMesAtras } } }),
      prisma.clinica.count({ where: { status: 'ATIVA' } }),
      prisma.dentista.count({ where: { status: 'ATIVA' } }),
      prisma.instituicao.count({ where: { status: 'ATIVA' } })
    ]);

    const statusDentes = Object.fromEntries(
      dentesPorStatus.map((i) => [i.statusAtual, i._count.statusAtual])
    );

    const statusSolicitacoes = Object.fromEntries(
      solicitacoesPorStatus.map((i) => [i.status, i._count.status])
    );

    return {
      dentes: {
        total: dentesPorStatus.reduce((acc, i) => acc + i._count.statusAtual, 0),
        por_status: statusDentes
      },
      solicitacoes: {
        total: solicitacoesPorStatus.reduce((acc, i) => acc + i._count.status, 0),
        pendentes: statusSolicitacoes['PENDENTE_ANALISE'] ?? 0,
        aprovadas: statusSolicitacoes['APROVADA'] ?? 0,
        recusadas: statusSolicitacoes['RECUSADA'] ?? 0
      },
      remessas: {
        total: totalRemessas,
        ultimo_mes: remessasUltimoMes
      },
      clinicas_ativas: clinicasAtivas,
      dentistas_ativos: dentistasAtivos,
      instituicoes_ativas: instituicoesAtivas
    };
  }
}
