import { NextFunction, Request, Response } from 'express';
import { alterarStatusCadastroSchema, dentistaListQuerySchema, dentistaSchema, idParamSchema } from '../schemas/sirde.schema';
import { DentistaService } from '../services/cadastros.service';
import { paginatedResponse } from '../utils/pagination';

const dentistaService = new DentistaService();

export class DentistaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = dentistaListQuerySchema.parse(req.query);
      const result = await dentistaService.listar(filtros);
      return res.status(200).json(paginatedResponse(result, { page: filtros.page, limit: filtros.limit }));
    } catch (error) {
      return next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      return res.status(200).json({ dentista: await dentistaService.buscarPorId(id) });
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

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = dentistaSchema.parse(req.body);
      return res.status(200).json({ dentista: await dentistaService.atualizar(id, data) });
    } catch (error) {
      return next(error);
    }
  }

  async desativar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      alterarStatusCadastroSchema.parse(req.body);
      return res.status(200).json({ dentista: await dentistaService.desativar(id) });
    } catch (error) {
      return next(error);
    }
  }
}
