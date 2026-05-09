import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { MovimentacaoController } from '../controllers/movimentacao.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new MovimentacaoController();

router.get('/', controller.listar.bind(controller));
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));

export { router as movimentacaoRoutes };
