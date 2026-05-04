import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { AppError } from '../errors/app-error';
 
const authService = new AuthService();
 
export class AuthController {
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.registrar(data);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }
 
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      return res.status(200).json(result);
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
}
