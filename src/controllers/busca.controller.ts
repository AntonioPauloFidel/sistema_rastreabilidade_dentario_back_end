import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error';
import { BuscaService } from '../services/busca.service';

const buscaService = new BuscaService();

const querySchema = z.object({
  q: z.string().trim().min(2, 'Termo de busca deve ter pelo menos 2 caracteres')
});

export class BuscaController {
  async buscar(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = querySchema.parse(req.query);
      const resultado = await buscaService.buscar(q);
      return res.status(200).json({ resultado });
    } catch (error) {
      return next(error);
    }
  }
}
