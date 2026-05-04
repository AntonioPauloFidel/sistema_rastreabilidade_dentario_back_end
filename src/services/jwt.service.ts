import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
 
export interface JwtPayload {
  sub: string;
  email: string;
}
 
export function gerarToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  };
 
  return jwt.sign(payload, env.JWT_SECRET, options);
}
 
export function verificarToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET);
 
  if (typeof decoded === 'string') {
    throw new Error('Token inválido');
  }
 
  if (!decoded.sub || typeof decoded.sub !== 'string') {
    throw new Error('Token sem subject válido');
  }
 
  if (!decoded.email || typeof decoded.email !== 'string') {
    throw new Error('Token sem e-mail válido');
  }
 
  return {
    sub: decoded.sub,
    email: decoded.email
  };
}

