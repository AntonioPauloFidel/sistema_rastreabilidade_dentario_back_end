import { NextFunction, Request, Response } from 'express';
import { AuditoriaService } from '../services/auditoria.service';
import { auditoriaListQuerySchema } from '../schemas/sirde.schema';
import { paginatedResponse } from '../utils/pagination';

const auditoriaService = new AuditoriaService();

export class AuditoriaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = auditoriaListQuerySchema.parse(req.query);
      const result = await auditoriaService.listar(filtros);
      return res.status(200).json(paginatedResponse(result, { page: filtros.page, limit: filtros.limit }));
    } catch (error) {
      return next(error);
    }
  }
}
