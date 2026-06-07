import { NextFunction, Request, Response } from 'express';
import { idParamSchema, movimentacaoSchema } from '../schemas/sirde.schema';
import { MovimentacaoService } from '../services/biobanco.service';

const movimentacaoService = new MovimentacaoService();

export class MovimentacaoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ movimentacoes: await movimentacaoService.listar() });
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
      return res.status(200).json({ movimentacoes: await movimentacaoService.porDente(id) });
    } catch (error) {
      return next(error);
    }
  }
}
