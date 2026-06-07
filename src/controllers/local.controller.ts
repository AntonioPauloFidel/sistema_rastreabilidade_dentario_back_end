import { NextFunction, Request, Response } from 'express';
import { localSchema } from '../schemas/sirde.schema';
import { LocalArmazenamentoService } from '../services/cadastros.service';

const localService = new LocalArmazenamentoService();

export class LocalController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ locais: await localService.listar() });
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = localSchema.parse(req.body);
      return res.status(201).json({ local: await localService.criar(data) });
    } catch (error) {
      return next(error);
    }
  }
}
