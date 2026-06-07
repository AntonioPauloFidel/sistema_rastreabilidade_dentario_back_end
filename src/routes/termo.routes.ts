import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { TermoController } from '../controllers/termo.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new TermoController();

router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));

export { router as termoRoutes };
