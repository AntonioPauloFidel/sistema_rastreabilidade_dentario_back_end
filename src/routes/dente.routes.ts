import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { DenteController } from '../controllers/dente.controller';
import { MovimentacaoController } from '../controllers/movimentacao.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new DenteController();
const movimentacaoController = new MovimentacaoController();

router.get('/exportar', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.exportar.bind(controller));

router.get('/', controller.listar.bind(controller));
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));
router.get('/:id', controller.buscarPorId.bind(controller));
router.patch('/:id/status', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.alterarStatus.bind(controller));
router.get('/:id/movimentacoes', movimentacaoController.porDente.bind(movimentacaoController));

export { router as denteRoutes };
