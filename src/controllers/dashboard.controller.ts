import { NextFunction, Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  async resumo(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ resumo: await dashboardService.resumo() });
    } catch (error) {
      return next(error);
    }
  }
}
