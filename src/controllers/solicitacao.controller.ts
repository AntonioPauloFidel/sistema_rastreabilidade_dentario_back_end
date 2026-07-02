import { StatusSolicitacao } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { decisaoSolicitacaoSchema, idParamSchema, solicitacaoListQuerySchema, solicitacaoSchema } from '../schemas/sirde.schema';
import { SolicitacaoService } from '../services/solicitacao.service';
import { paginatedResponse } from '../utils/pagination';
import { objectsToCsv } from '../utils/csv';

function fmtDate(d?: Date | string | null) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toISOString().slice(0,10);
}

const solicitacaoService = new SolicitacaoService();

export class SolicitacaoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = solicitacaoListQuerySchema.parse(req.query);
      const result = await solicitacaoService.listar(filtros, req.usuario?.instituicaoId);
      return res.status(200).json(paginatedResponse(result, { page: filtros.page, limit: filtros.limit }));
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = solicitacaoSchema.parse(req.body);
      return res.status(201).json({ solicitacao: await solicitacaoService.criar(data) });
    } catch (error) {
      return next(error);
    }
  }

  async aprovar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { motivo } = decisaoSolicitacaoSchema.parse(req.body);
      return res.status(200).json({ solicitacao: await solicitacaoService.decidir(id, StatusSolicitacao.APROVADA, motivo) });
    } catch (error) {
      return next(error);
    }
  }

  async recusar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { motivo } = decisaoSolicitacaoSchema.parse(req.body);
      return res.status(200).json({ solicitacao: await solicitacaoService.decidir(id, StatusSolicitacao.RECUSADA, motivo) });
    } catch (error) {
      return next(error);
    }
  }

  async exportar(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query as any;
      const solicitacoes = await solicitacaoService.exportar({ status });

      const csv = objectsToCsv(solicitacoes, [
        { label: 'Id', key: 'id' },
        { label: 'Instituicao', key: 'instituicao', transform: (v: any) => v ? v.nome : '' },
        { label: 'Status', key: 'status' },
        { label: 'Finalidade', key: 'finalidade' },
        { label: 'Criado Em', key: 'criadoEm', transform: (v: any) => fmtDate(v) }
      ]);

      const filename = `solicitacoes-${new Date().toISOString().slice(0,10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return res.status(200).send(csv);
    } catch (error) {
      return next(error);
    }
  }
}
