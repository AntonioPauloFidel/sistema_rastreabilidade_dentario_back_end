import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { AuditoriaController } from '../controllers/auditoria.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new AuditoriaController();

router.get('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.AUDITOR), controller.listar.bind(controller));

export { router as auditoriaRoutes };
