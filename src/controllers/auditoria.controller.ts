import { NextFunction, Request, Response } from 'express';
import { AuditoriaService } from '../services/auditoria.service';

const auditoriaService = new AuditoriaService();

export class AuditoriaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ eventos: await auditoriaService.listar() });
    } catch (error) {
      return next(error);
    }
  }
}
