import { Request, Response, NextFunction } from 'express';
import { configService, ConfigInput } from '../services/config.service';
import { AppError } from '../errors/app-error';

class ConfigController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const cfg = await configService.getConfig();

      if (!cfg) {
        // return empty object if not configured yet
        return res.status(200).json({ configuracao: null });
      }

      return res.status(200).json({ configuracao: cfg });
    } catch (error) {
      return next(error);
    }
  }

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as ConfigInput;

      if (!data || !data.nomeOficial || !data.sigla || !data.responsavelTecnico || !data.email || !data.endereco) {
        throw new AppError('Dados de configuracao incompletos', 400);
      }

      const cfg = await configService.upsertConfig(data);
      return res.status(200).json({ configuracao: cfg });
    } catch (error) {
      return next(error);
    }
  }
}

export const configController = new ConfigController();
