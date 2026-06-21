import { PerfilUsuario } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  email: string;
  perfil?: PerfilUsuario;
  tokenUse?: 'access' | 'refresh';
}

export interface RefreshTokenPayload extends JwtPayload {
  perfil: PerfilUsuario;
  tokenUse: 'refresh';
}

function assinarToken(payload: JwtPayload, expiresIn: SignOptions['expiresIn']) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function gerarToken(payload: Omit<JwtPayload, 'tokenUse'>): string {
  return assinarToken(
    { ...payload, tokenUse: 'access' },
    env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  );
}

export function gerarRefreshToken(payload: Omit<RefreshTokenPayload, 'tokenUse'>): string {
  return assinarToken(
    { ...payload, tokenUse: 'refresh' },
    env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
  );
}

export function verificarToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === 'string') {
    throw new Error('Token invalido');
  }

  if (!decoded.sub || typeof decoded.sub !== 'string') {
    throw new Error('Token sem subject valido');
  }

  if (!decoded.email || typeof decoded.email !== 'string') {
    throw new Error('Token sem e-mail valido');
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    perfil: typeof decoded.perfil === 'string' ? decoded.perfil as PerfilUsuario : undefined,
    tokenUse: decoded.tokenUse === 'refresh' ? 'refresh' : 'access'
  };
}

export function gerarTokenRecuperacao(email: string): string {
  return jwt.sign({ sub: email, tokenUse: 'reset' }, env.JWT_SECRET, { expiresIn: '15m' });
}

export function verificarTokenRecuperacao(token: string): string {
  const decoded = jwt.verify(token, env.JWT_SECRET) as any;
  if (decoded.tokenUse !== 'reset' || !decoded.sub) throw new Error('Token de recuperacao invalido');
  return decoded.sub as string;
}

export function verificarRefreshToken(token: string): RefreshTokenPayload {
  const payload = verificarToken(token);

  if (payload.tokenUse !== 'refresh' || !payload.perfil) {
    throw new Error('Refresh token invalido');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    perfil: payload.perfil,
    tokenUse: 'refresh'
  };
}
