import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { alterarSenhaSchema, editarPerfilSchema, loginSchema, registerSchema } from '../schemas/auth.schema';
import { AppError } from '../errors/app-error';
import { z } from 'zod';

const esqueceuSenhaSchema = z.object({ email: z.string().email() });
const redefinirSenhaSchema = z.object({
  token: z.string().min(1),
  novaSenha: z.string().min(8).max(72)
});
import {
  clearAuthCookies,
  getCookie,
  REFRESH_TOKEN_COOKIE,
  setAccessTokenCookie,
  setAuthCookies
} from '../utils/cookies';
 
const authService = new AuthService();
 
export class AuthController {
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.registrar(data);
      setAuthCookies(res, result.token, result.refreshToken);
      return res.status(201).json({ usuario: result.usuario, token: result.token });
    } catch (error) {
      return next(error);
    }
  }
 
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      setAuthCookies(res, result.token, result.refreshToken);
      return res.status(200).json({ token: result.token });
    } catch (error) {
      return next(error);
    }
  }
 
  async me(req: Request, res: Response, next: NextFunction) {
    if (!req.usuario) {
      return next(new AppError('Usuário não autenticado', 401));
    }

    return res.status(200).json({ usuario: req.usuario });
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getCookie(req, REFRESH_TOKEN_COOKIE);

      if (!refreshToken) {
        throw new AppError('Refresh token nao informado', 401);
      }

      const result = await authService.refresh(refreshToken);
      setAccessTokenCookie(res, result.token);

      return res.status(200).json({ token: result.token });
    } catch (error) {
      clearAuthCookies(res);
      return next(error);
    }
  }

  async logout(req: Request, res: Response) {
    clearAuthCookies(res);
    return res.status(204).send();
  }

  async editarPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) return next(new AppError('Nao autenticado', 401));
      const data = editarPerfilSchema.parse(req.body);
      const result = await authService.editarPerfil(req.usuario.id, data);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async alterarSenha(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.usuario) return next(new AppError('Nao autenticado', 401));
      const data = alterarSenhaSchema.parse(req.body);
      const result = await authService.alterarSenha(req.usuario.id, data);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async esqueceuSenha(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = esqueceuSenhaSchema.parse(req.body);
      await authService.esqueceuSenha(email);
      return res.status(200).json({ message: 'Se o e-mail existir, um link de recuperacao sera enviado.' });
    } catch (error) {
      return next(error);
    }
  }

  async redefinirSenha(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, novaSenha } = redefinirSenhaSchema.parse(req.body);
      const result = await authService.redefinirSenha(token, novaSenha);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
