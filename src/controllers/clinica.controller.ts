import { NextFunction, Request, Response } from 'express';
import { alterarStatusCadastroSchema, clinicaListQuerySchema, clinicaSchema, idParamSchema } from '../schemas/sirde.schema';
import { ClinicaService } from '../services/cadastros.service';
import { paginatedResponse } from '../utils/pagination';

const clinicaService = new ClinicaService();

export class ClinicaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = clinicaListQuerySchema.parse(req.query);
      const result = await clinicaService.listar(filtros);
      return res.status(200).json(paginatedResponse(result, { page: filtros.page, limit: filtros.limit }));
    } catch (error) {
      return next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      return res.status(200).json({ clinica: await clinicaService.buscarPorId(id) });
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = clinicaSchema.parse(req.body);
      return res.status(201).json({ clinica: await clinicaService.criar(data) });
    } catch (error) {
      return next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = clinicaSchema.parse(req.body);
      return res.status(200).json({ clinica: await clinicaService.atualizar(id, data) });
    } catch (error) {
      return next(error);
    }
  }

  async desativar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      alterarStatusCadastroSchema.parse(req.body);
      return res.status(200).json({ clinica: await clinicaService.desativar(id) });
    } catch (error) {
      return next(error);
    }
  }
}
