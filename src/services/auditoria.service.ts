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

  async listar() {
    return prisma.auditoriaEvento.findMany({
      orderBy: { criadoEm: 'desc' },
      take: 200,
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
      }
    });
  }
}
