import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';

export function notFound(req: Request, res: Response) {
  return res.status(404).json({
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`
  });
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  void req;
  void next;

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Erro de validação',
      issues: error.issues
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message
    });
  }

  console.error(error);
  return res.status(500).json({
    message: 'Erro interno do servidor'
  });
}
