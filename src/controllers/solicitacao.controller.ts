import { StatusSolicitacao } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { decisaoSolicitacaoSchema, idParamSchema, solicitacaoSchema } from '../schemas/sirde.schema';
import { SolicitacaoService } from '../services/solicitacao.service';

const solicitacaoService = new SolicitacaoService();

export class SolicitacaoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ solicitacoes: await solicitacaoService.listar() });
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
}
