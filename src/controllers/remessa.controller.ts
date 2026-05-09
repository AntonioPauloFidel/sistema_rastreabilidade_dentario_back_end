import { NextFunction, Request, Response } from 'express';
import { remessaSchema } from '../schemas/sirde.schema';
import { RemessaEntradaService } from '../services/biobanco.service';

const remessaService = new RemessaEntradaService();

export class RemessaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ remessas: await remessaService.listar() });
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = remessaSchema.parse(req.body);
      return res.status(201).json({ remessa: await remessaService.criar(data) });
    } catch (error) {
      return next(error);
    }
  }
}
