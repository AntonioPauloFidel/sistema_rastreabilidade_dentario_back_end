import { NextFunction, Request, Response } from 'express';
import { idParamSchema, movimentacaoListQuerySchema, movimentacaoSchema } from '../schemas/sirde.schema';
import { MovimentacaoService } from '../services/biobanco.service';
import { paginatedResponse } from '../utils/pagination';

const movimentacaoService = new MovimentacaoService();

export class MovimentacaoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = movimentacaoListQuerySchema.parse(req.query);
      const result = await movimentacaoService.listar(filtros);
      return res.status(200).json(paginatedResponse(result, { page: filtros.page, limit: filtros.limit }));
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = movimentacaoSchema.parse(req.body);
      return res.status(201).json({ movimentacao: await movimentacaoService.criar(data, req.usuario?.id) });
    } catch (error) {
      return next(error);
    }
  }

  async porDente(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const movimentacoes = await movimentacaoService.porDente(id);
      return res.status(200).json({ movimentacoes, data: movimentacoes });
    } catch (error) {
      return next(error);
    }
  }
}
