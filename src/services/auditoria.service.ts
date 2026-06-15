import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';

type RegistrarAuditoriaParams = {
  usuarioId?: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  dados?: Prisma.InputJsonValue;
};

export class AuditoriaService {
  async registrar(params: RegistrarAuditoriaParams) {
    return prisma.auditoriaEvento.create({
      data: {
        usuarioId: params.usuarioId,
        acao: params.acao,
        entidade: params.entidade,
        entidadeId: params.entidadeId,
        dados: params.dados
      }
    });
  }

  async listar(filters?: { page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.auditoriaEvento.count();

    const data = await prisma.auditoriaEvento.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            perfil: true,
            pessoa: {
              select: { nome: true, email: true }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }
}
