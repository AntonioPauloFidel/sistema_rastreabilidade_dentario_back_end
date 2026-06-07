import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { AppError } from '../errors/app-error';
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
}
