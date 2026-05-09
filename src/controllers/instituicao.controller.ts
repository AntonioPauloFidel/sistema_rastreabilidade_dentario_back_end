import { NextFunction, Request, Response } from 'express';
import { idParamSchema, instituicaoSchema } from '../schemas/sirde.schema';
import { InstituicaoService } from '../services/cadastros.service';

const instituicaoService = new InstituicaoService();

export class InstituicaoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ instituicoes: await instituicaoService.listar() });
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = instituicaoSchema.parse(req.body);
      return res.status(201).json({ instituicao: await instituicaoService.criar(data) });
    } catch (error) {
      return next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      return res.status(200).json({ instituicao: await instituicaoService.buscarPorId(id) });
    } catch (error) {
      return next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = instituicaoSchema.parse(req.body);
      return res.status(200).json({ instituicao: await instituicaoService.atualizar(id, data) });
    } catch (error) {
      return next(error);
    }
  }
}
