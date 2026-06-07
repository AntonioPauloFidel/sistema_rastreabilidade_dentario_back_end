import { NextFunction, Request, Response } from 'express';
import { termoSchema } from '../schemas/sirde.schema';
import { TermoConsentimentoService } from '../services/biobanco.service';

const termoService = new TermoConsentimentoService();

export class TermoController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = termoSchema.parse(req.body);
      return res.status(201).json({ termo: await termoService.criar(data, req.usuario?.id) });
    } catch (error) {
      return next(error);
    }
  }
}
