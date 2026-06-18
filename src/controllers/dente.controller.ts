import { NextFunction, Request, Response } from 'express';
import { denteSchema, alterarStatusDenteSchema, denteListQuerySchema, idParamSchema } from '../schemas/sirde.schema';
import { DenteService } from '../services/biobanco.service';
import { QRCodeService } from '../services/qrcode.service';
import { paginatedResponse } from '../utils/pagination';

const denteService = new DenteService();
const qrCodeService = new QRCodeService();

export class DenteController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = denteListQuerySchema.parse(req.query);
      const result = await denteService.listar(filtros);
      return res.status(200).json(paginatedResponse(result, { page: filtros.page, limit: filtros.limit }));
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

  async gerarQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { format } = req.query;
      
      // Buscar dente para validar existência
      const dente = await denteService.buscarPorId(id);
      
      if (format === 'base64') {
        const qrCodeBase64 = await qrCodeService.gerarQRCodeBase64(dente.codigoRastreio);
        return res.status(200).json({ qrcode: qrCodeBase64 });
      }
      
      // Retornar como PNG
      const qrCodeBuffer = await qrCodeService.gerarQRCodePNG(dente.codigoRastreio);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', qrCodeBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(qrCodeBuffer);
    } catch (error) {
      return next(error);
    }
  }
}
