import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new DashboardController();

router.get('/resumo', controller.resumo.bind(controller));

export { router as dashboardRoutes };
