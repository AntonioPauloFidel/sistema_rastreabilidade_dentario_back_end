import { NextFunction, Request, Response } from 'express';
import { cessaoSchema, paginationQuerySchema } from '../schemas/sirde.schema';
import { CessaoService } from '../services/solicitacao.service';
import { paginatedResponse } from '../utils/pagination';

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

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const instituicaoId = req.query.instituicaoId as string | undefined;
      const result = await cessaoService.listar({ instituicaoId, page, limit });
      return res.status(200).json(paginatedResponse(result, { page, limit }));
    } catch (error) {
      return next(error);
    }
  }

  async vencidas(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await cessaoService.vencidas({ page, limit });
      return res.status(200).json(paginatedResponse(result, { page, limit }));
    } catch (error) {
      return next(error);
    }
  }
}
