import { NextFunction, Request, Response } from 'express';
import { idParamSchema, remessaListQuerySchema, remessaSchema } from '../schemas/sirde.schema';
import { RemessaEntradaService } from '../services/biobanco.service';
import { paginatedResponse } from '../utils/pagination';

const remessaService = new RemessaEntradaService();

export class RemessaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = remessaListQuerySchema.parse(req.query);
      const result = await remessaService.listar(filtros);
      return res.status(200).json(paginatedResponse(result, { page: filtros.page, limit: filtros.limit }));
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

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = remessaSchema.parse(req.body);
      return res.status(200).json({ remessa: await remessaService.atualizar(id, data) });
    } catch (error) {
      return next(error);
    }
  }
}
