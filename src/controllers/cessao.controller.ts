import { NextFunction, Request, Response } from 'express';
import { cessaoSchema, paginationQuerySchema } from '../schemas/sirde.schema';
import { CessaoService } from '../services/solicitacao.service';
import { paginatedResponse } from '../utils/pagination';
import { objectsToCsv } from '../utils/csv';

function fmtDate(d?: Date | string | null) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toISOString().slice(0,10);
}

const cessaoService = new CessaoService();

export class CessaoController {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = cessaoSchema.parse(req.body);
      return res.status(201).json({ cessao: await cessaoService.criar(data, req.usuario?.id) });
    } catch (error) {
      return next(error);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const instituicaoId = req.query.instituicaoId as string | undefined;
      const result = await cessaoService.listar({ instituicaoId, page, limit }, req.usuario?.instituicaoId);
      return res.status(200).json(paginatedResponse(result, { page, limit }));
    } catch (error) {
      return next(error);
    }
  }

  async vencidas(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await cessaoService.vencidas({ page, limit });
      return res.status(200).json(paginatedResponse(result, { page, limit }));
    } catch (error) {
      return next(error);
    }
  }

  async exportar(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query as any;
      const cessoes = await cessaoService.exportar({ from, to });

      const csv = objectsToCsv(cessoes, [
        { label: 'Id', key: 'id' },
        { label: 'Dente', key: 'dente', transform: (v: any) => v ? v.codigoRastreio : '' },
        { label: 'Instituicao', key: 'instituicao', transform: (v: any) => v ? v.nome : '' },
        { label: 'Data Cessao', key: 'dataCessao', transform: (v: any) => fmtDate(v) },
        { label: 'Data Limite Uso', key: 'dataLimiteUso', transform: (v: any) => fmtDate(v) },
        { label: 'Observacao', key: 'observacao' }
      ]);

      const filename = `cessoes-${new Date().toISOString().slice(0,10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return res.status(200).send(csv);
    } catch (error) {
      return next(error);
    }
  }
}
