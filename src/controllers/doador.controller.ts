import { NextFunction, Request, Response } from 'express';
import { doadorSchema, idParamSchema } from '../schemas/sirde.schema';
import { DoadorService } from '../services/biobanco.service';

const doadorService = new DoadorService();

export class DoadorController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = doadorSchema.parse(req.body);
      return res.status(201).json({ doador: await doadorService.criar(data, req.usuario?.id) });
    } catch (error) {
      return next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      return res.status(200).json({ doador: await doadorService.buscarPorId(id) });
    } catch (error) {
      return next(error);
    }
  }
}
