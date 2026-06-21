import { prisma } from '../prisma/client';
import { AlertaEstoqueInput } from '../schemas/sirde.schema';

export class AlertaEstoqueService {
  async listar() {
    return prisma.alertaEstoque.findMany({ orderBy: { criadoEm: 'desc' } });
  }

  async criar(data: AlertaEstoqueInput) {
    return prisma.alertaEstoque.create({ data });
  }

  async remover(id: string) {
    return prisma.alertaEstoque.delete({ where: { id } });
  }
}

export const alertaEstoqueService = new AlertaEstoqueService();
