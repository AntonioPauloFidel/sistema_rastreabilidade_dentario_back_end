import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { UploadService } from '../services/upload.service';

const uploadService = new UploadService();

export class UploadController {
  async uploadFotoDente(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('Nenhum arquivo enviado', 400);
      const result = await uploadService.uploadFotoDente(String(req.params.id), req.file.filename);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async uploadPdfTermo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('Nenhum arquivo enviado', 400);
      const result = await uploadService.uploadPdfTermo(String(req.params.id), req.file.filename);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
