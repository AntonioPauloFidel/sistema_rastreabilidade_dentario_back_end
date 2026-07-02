import { NextFunction, Request, Response } from 'express';
import { doadorSchema, idParamSchema, doadorListQuerySchema, cpfParamSchema } from '../schemas/sirde.schema';
import { DoadorService } from '../services/biobanco.service';

const doadorService = new DoadorService();

export class DoadorController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = doadorSchema.parse(req.body);
      const criado = await doadorService.criar(data, req.usuario?.id);
      return res.status(201).json({ doador: criado, data: criado });
    } catch (error) {
      return next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const doador = await doadorService.buscarPorId(id);
      return res.status(200).json({ doador, data: doador });
    } catch (error) {
      return next(error);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const query = doadorListQuerySchema.parse(req.query);
      const result = await doadorService.listar({ page: query.page, limit: query.limit });
      return res.status(200).json({ data: result.data, total: result.total });
    } catch (error) {
      return next(error);
    }
  }

  async buscarPorCpf(req: Request, res: Response, next: NextFunction) {
    try {
      const { cpf } = cpfParamSchema.parse(req.params);
      const doador = await doadorService.buscarPorCpf(cpf);
      return res.status(200).json({ doador, data: doador });
    } catch (error) {
      return next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = doadorSchema.parse(req.body);
      const doador = await doadorService.atualizar(id, data, req.usuario?.id);
      return res.status(200).json({ doador, data: doador });
    } catch (error) {
      return next(error);
    }
  }
}
