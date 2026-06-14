import { NextFunction, Request, Response } from 'express';
import { clinicaListQuerySchema, clinicaSchema } from '../schemas/sirde.schema';
import { ClinicaService } from '../services/cadastros.service';

const clinicaService = new ClinicaService();

export class ClinicaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = clinicaListQuerySchema.parse(req.query);
      return res.status(200).json({ clinicas: await clinicaService.listar(filtros) });
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
}
