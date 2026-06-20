import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { CessaoController } from '../controllers/cessao.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new CessaoController();

router.get('/exportar', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.exportar.bind(controller));
router.get('/vencidas', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.vencidas.bind(controller));
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));

export { router as cessaoRoutes };
