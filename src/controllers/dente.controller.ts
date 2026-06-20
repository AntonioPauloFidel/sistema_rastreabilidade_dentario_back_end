import { NextFunction, Request, Response } from 'express';
import { denteSchema, alterarStatusDenteSchema, idParamSchema, descarteDenteSchema } from '../schemas/sirde.schema';
import { DenteService } from '../services/biobanco.service';
import { objectsToCsv } from '../utils/csv';

function formatDate(d?: Date | string | null) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

const denteService = new DenteService();

export class DenteController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ dentes: await denteService.listar() });
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

  async descartar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = descarteDenteSchema.parse(req.body);
      const dente = await denteService.descartar(id, data.motivo, data.observacao, data.dataDescarte, req.usuario?.id);
      return res.status(200).json({ dente });
    } catch (error) {
      return next(error);
    }
  }

  async exportar(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, tipo, from, to } = req.query as any;
      const dentes = await denteService.exportar({ status, tipo, from, to });

      const csv = objectsToCsv(dentes, [
        { label: 'Codigo', key: 'codigoRastreio' },
        { label: 'Tipo', key: 'tipo' },
        { label: 'Condicao', key: 'condicao' },
        { label: 'Status', key: 'statusAtual' },
        { label: 'Doador (ultimos 4 digitos)', key: 'doador', transform: (v: any) => (v ? v.cpfUltimos4 : '') },
        { label: 'Local', key: 'localAtual', transform: (v: any) => (v ? v.nome : '') },
        { label: 'Data Entrada', key: 'criadoEm', transform: (v: any) => formatDate(v) },
        { label: 'Ultima Atualizacao', key: 'atualizadoEm', transform: (v: any) => formatDate(v) }
      ]);

      const filename = `dentes-${new Date().toISOString().slice(0,10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return res.status(200).send(csv);
    } catch (error) {
      return next(error);
    }
  }
}
