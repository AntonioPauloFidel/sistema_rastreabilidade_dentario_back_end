import { NextFunction, Request, Response } from 'express';
import { denteSchema, alterarStatusDenteSchema, denteListQuerySchema, idParamSchema } from '../schemas/sirde.schema';
import { DenteService } from '../services/biobanco.service';

const denteService = new DenteService();

export class DenteController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = denteListQuerySchema.parse(req.query);
      return res.status(200).json({ dentes: await denteService.listar(filtros) });
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = denteSchema.parse(req.body);
      return res.status(201).json({ dente: await denteService.criar(data, req.usuario?.id) });
    } catch (error) {
      return next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      return res.status(200).json({ dente: await denteService.buscarPorId(id) });
    } catch (error) {
      return next(error);
    }
  }

  async alterarStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = alterarStatusDenteSchema.parse(req.body);
      const dente = await denteService.alterarStatus(
        id,
        data.statusNovo,
        data.motivo,
        data.destinoLocalId,
        data.observacao,
        req.usuario?.id
      );
      return res.status(200).json({ dente });
    } catch (error) {
      return next(error);
    }
  }
}
