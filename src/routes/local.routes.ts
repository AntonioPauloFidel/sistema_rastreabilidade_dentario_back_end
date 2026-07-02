import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { LocalController } from '../controllers/local.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new LocalController();

router.get('/', controller.listar.bind(controller));
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));
router.put('/:id', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.atualizar.bind(controller));

export { router as localRoutes };
