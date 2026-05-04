import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { enderecoPublicSelect } from '../prisma/selects';
import { enderecoSchema } from '../schemas/endereco.schema';

export class EnderecoController {
  async buscarMeuEndereco(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = this.getUsuarioId(req);

      const endereco = await prisma.endereco.findUnique({
        where: { usuarioId },
        select: enderecoPublicSelect
      });

      if (!endereco) {
        throw new AppError('Endereço não cadastrado', 404);
      }

      return res.status(200).json({ endereco });
    } catch (error) {
      return next(error);
    }
  }

  async salvarMeuEndereco(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = this.getUsuarioId(req);
      const data = enderecoSchema.parse(req.body);

      // O endereço é 1:1 com usuário; upsert mantém o endpoint idempotente.
      const endereco = await prisma.endereco.upsert({
        where: { usuarioId },
        update: data,
        create: {
          ...data,
          usuarioId
        },
        select: enderecoPublicSelect
      });

      return res.status(200).json({ endereco });
    } catch (error) {
      return next(error);
    }
  }

  private getUsuarioId(req: Request) {
    if (!req.usuario) {
      throw new AppError('Usuário não autenticado', 401);
    }

    return req.usuario.id;
  }
}
