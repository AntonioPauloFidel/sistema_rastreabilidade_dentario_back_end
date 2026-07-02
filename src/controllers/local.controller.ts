import { NextFunction, Request, Response } from 'express';
import { idParamSchema, localListQuerySchema, localSchema } from '../schemas/sirde.schema';
import { LocalArmazenamentoService } from '../services/cadastros.service';
import { paginatedResponse } from '../utils/pagination';

const localService = new LocalArmazenamentoService();

export class LocalController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = localListQuerySchema.parse(req.query);
      const result = await localService.listar(filtros);
      return res.status(200).json(paginatedResponse(result, { page: filtros.page, limit: filtros.limit }));
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

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = localSchema.parse(req.body);
      return res.status(200).json({ local: await localService.atualizar(id, data) });
    } catch (error) {
      return next(error);
    }
  }
}
