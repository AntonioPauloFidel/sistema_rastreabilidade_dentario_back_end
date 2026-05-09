import { NextFunction, Request, Response } from 'express';
import { cessaoSchema } from '../schemas/sirde.schema';
import { CessaoService } from '../services/solicitacao.service';

const cessaoService = new CessaoService();

export class CessaoController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = cessaoSchema.parse(req.body);
      return res.status(201).json({ cessao: await cessaoService.criar(data, req.usuario?.id) });
    } catch (error) {
      return next(error);
    }
  }
}
