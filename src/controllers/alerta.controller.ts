import { NextFunction, Request, Response } from 'express';
import { alertaEstoqueSchema } from '../schemas/sirde.schema';
import { AlertaEstoqueService } from '../services/alerta.service';

const service = new AlertaEstoqueService();

export class AlertaEstoqueController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ alertas: await service.listar() });
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = alertaEstoqueSchema.parse(req.body);
      return res.status(201).json({ alerta: await service.criar(data) });
    } catch (error) {
      return next(error);
    }
  }

  async remover(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await service.remover(id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export const alertaEstoqueController = new AlertaEstoqueController();
