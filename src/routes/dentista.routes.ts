import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { DentistaController } from '../controllers/dentista.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new DentistaController();

router.get('/', controller.listar.bind(controller));
router.post(
  '/',
  authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR, PerfilUsuario.CLINICA),
  controller.criar.bind(controller)
);
router.get('/:id', controller.buscarPorId.bind(controller));
router.put('/:id', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR, PerfilUsuario.CLINICA), controller.atualizar.bind(controller));
router.patch('/:id/status', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.desativar.bind(controller));

export { router as dentistaRoutes };
