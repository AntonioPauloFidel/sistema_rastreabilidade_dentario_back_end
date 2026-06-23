import { prisma } from '../prisma/client';

export class BuscaService {
  async buscar(q: string) {
    const termo = q.trim();

    const [dentes, clinicas, instituicoes, dentistas] = await Promise.all([
      prisma.dente.findMany({
        where: {
          OR: [
            { codigoRastreio: { contains: termo, mode: 'insensitive' } }
          ]
        },
        select: { id: true, codigoRastreio: true, tipo: true, condicao: true, statusAtual: true },
        take: 10
      }),
      prisma.clinica.findMany({
        where: { nome: { contains: termo, mode: 'insensitive' } },
        select: { id: true, nome: true, cnpj: true, status: true },
        take: 10
      }),
      prisma.instituicao.findMany({
        where: {
          OR: [
            { nome: { contains: termo, mode: 'insensitive' } },
            { cnpj: { contains: termo, mode: 'insensitive' } }
          ]
        },
        select: { id: true, nome: true, tipo: true, cnpj: true, status: true },
        take: 10
      }),
      prisma.dentista.findMany({
        where: { nome: { contains: termo, mode: 'insensitive' } },
        select: { id: true, nome: true, cro: true, ufCro: true, status: true, clinica: { select: { id: true, nome: true } } },
        take: 10
      })
    ]);

    return {
      dentes: { total: dentes.length, itens: dentes },
      clinicas: { total: clinicas.length, itens: clinicas },
      instituicoes: { total: instituicoes.length, itens: instituicoes },
      dentistas: { total: dentistas.length, itens: dentistas }
    };
  }
}
