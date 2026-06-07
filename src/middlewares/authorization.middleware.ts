import { NextFunction, Request, Response } from 'express';
import { PerfilUsuario } from '@prisma/client';

export function authorize(...perfisPermitidos: PerfilUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'Usuario nao autenticado' });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({ message: 'Usuario sem permissao para esta acao' });
    }

    return next();
  };
}
