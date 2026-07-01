import { NextFunction, Request, Response } from 'express';
import { confirmarCodigoSchema, consultaPublicaSchema, solicitarCodigoSchema } from '../schemas/sirde.schema';
import { ConsultaPublicaService } from '../services/consulta-publica.service';

const consultaPublicaService = new ConsultaPublicaService();

export class ConsultaPublicaController {
  async consultar(req: Request, res: Response, next: NextFunction) {
    try {
      const { cpf } = consultaPublicaSchema.parse(req.body);
      return res.status(200).json(await consultaPublicaService.consultar(cpf, req.ip));
    } catch (error) {
      return next(error);
    }
  }

  async solicitarCodigo(req: Request, res: Response, next: NextFunction) {
    try {
      const { cpf } = solicitarCodigoSchema.parse(req.body);
      const resultado = await consultaPublicaService.solicitarCodigo(cpf);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async confirmarCodigo(req: Request, res: Response, next: NextFunction) {
    try {
      const { cpf, codigo } = confirmarCodigoSchema.parse(req.body);
      const resultado = await consultaPublicaService.confirmarCodigo(cpf, codigo);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }
}
