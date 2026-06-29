import { NextFunction, Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { verificarToken } from '../services/jwt.service';
import { AuthService } from '../services/auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  getCookie,
  REFRESH_TOKEN_COOKIE,
  setAccessTokenCookie
} from '../utils/cookies';

const authService = new AuthService();

export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = getAccessToken(req);
    const payload = verificarToken(token);

    const pessoa = await prisma.pessoa.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        ativo: true,
        usuario: {
          select: {
            perfil: true,
            instituicaoId: true
          }
        }
      }
    });

    if (!pessoa || !pessoa.ativo) {
      return res.status(401).json({ message: 'Usuario nao autorizado' });
    }

    req.usuario = {
      id: pessoa.id,
      email: pessoa.email,
      perfil: pessoa.usuario.perfil,
      instituicaoId: pessoa.usuario.instituicaoId ?? undefined
    };

    return next();
  } catch {
    try {
      const refreshToken = getCookie(req, REFRESH_TOKEN_COOKIE);

      if (!refreshToken) {
        return res.status(401).json({ message: 'Token invalido ou expirado' });
      }

      const result = await authService.refresh(refreshToken);
      setAccessTokenCookie(res, result.token);
      req.usuario = result.usuario;

      return next();
    } catch {
      return res.status(401).json({ message: 'Token invalido ou expirado' });
    }
  }
}

function getAccessToken(req: Request) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const [type, token] = authHeader.trim().split(/\s+/);

    if (type === 'Bearer' && token) {
      return token;
    }
  }

  const cookieToken = getCookie(req, ACCESS_TOKEN_COOKIE);

  if (cookieToken) {
    return cookieToken;
  }

  throw new Error('Token nao informado');
}
