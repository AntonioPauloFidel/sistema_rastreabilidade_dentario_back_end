import { prisma } from '../prisma/client';

export class DashboardService {
  async resumo() {
    const [
      totalDentes,
      totalInstituicoes,
      totalSolicitacoes,
      dentesPorStatus
    ] = await Promise.all([
      prisma.dente.count(),
      prisma.instituicao.count(),
      prisma.solicitacaoDente.count(),
      prisma.dente.groupBy({
        by: ['statusAtual'],
        _count: { statusAtual: true }
      })
    ]);

    return {
      totalDentes,
      totalInstituicoes,
      totalSolicitacoes,
      dentesPorStatus: dentesPorStatus.map((item) => ({
        status: item.statusAtual,
        total: item._count.statusAtual
      }))
    };
  }
}
