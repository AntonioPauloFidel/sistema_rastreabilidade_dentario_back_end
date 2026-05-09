import { NextFunction, Request, Response } from 'express';
import { consultaPublicaSchema } from '../schemas/sirde.schema';
import { ConsultaPublicaService } from '../services/consulta-publica.service';

const consultaPublicaService = new ConsultaPublicaService();

export class ConsultaPublicaController {
  async consultar(req: Request, res: Response, next: NextFunction) {
    try {
      const { cpf } = consultaPublicaSchema.parse(req.body);
      return res.status(200).json({
        resultado: await consultaPublicaService.consultar(cpf, req.ip)
      });
    } catch (error) {
      return next(error);
    }
  }
}
