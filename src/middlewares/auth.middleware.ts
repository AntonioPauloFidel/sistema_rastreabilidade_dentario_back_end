import { NextFunction, Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { verificarToken } from '../services/jwt.service';
 
// Valida o JWT e garante que o usuário continua ativo antes da rota protegida.
export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
 
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não informado' });
    }
 
    const [type, token] = authHeader.trim().split(/\s+/);
 
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Formato do token inválido' });
    }
 
    const payload = verificarToken(token);
 
    const pessoa = await prisma.pessoa.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        ativo: true
      }
    });
 
    if (!pessoa || !pessoa.ativo) {
      return res.status(401).json({ message: 'Usuário não autorizado' });
    }
 
    req.usuario = {
      id: pessoa.id,
      email: pessoa.email
    };
 
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
