import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../errors/app-error';
import { usuarioPublicSelect } from '../prisma/selects';
 
export class UsuarioController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: usuarioPublicSelect,
        orderBy: { criadoEm: 'desc' }
      });
 
      return res.status(200).json({ usuarios });
    } catch (error) {
      return next(error);
    }
  }
 
  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = this.getParamId(req.params.id);
 
      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: usuarioPublicSelect
      });
 
      if (!usuario) {
        throw new AppError('Usuário não encontrado', 404);
      }
 
      return res.status(200).json({ usuario });
    } catch (error) {
      return next(error);
    }
  }

  private getParamId(id: string | string[] | undefined) {
    if (!id || Array.isArray(id)) {
      throw new AppError('ID de usuário inválido', 400);
    }

    return id;
  }
}
