import { NextFunction, Request, Response } from 'express';
import { dentistaSchema } from '../schemas/sirde.schema';
import { DentistaService } from '../services/cadastros.service';

const dentistaService = new DentistaService();

export class DentistaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ dentistas: await dentistaService.listar() });
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dentistaSchema.parse(req.body);
      return res.status(201).json({ dentista: await dentistaService.criar(data) });
    } catch (error) {
      return next(error);
    }
  }
}
