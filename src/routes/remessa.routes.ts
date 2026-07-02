import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { RemessaController } from '../controllers/remessa.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new RemessaController();

router.get('/', controller.listar.bind(controller));
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));
router.put('/:id', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.atualizar.bind(controller));

export { router as remessaRoutes };
