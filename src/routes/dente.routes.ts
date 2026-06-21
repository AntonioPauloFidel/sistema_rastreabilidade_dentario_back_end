import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { DenteController } from '../controllers/dente.controller';
import { MovimentacaoController } from '../controllers/movimentacao.controller';
import { authorize } from '../middlewares/authorization.middleware';
import { ensureAuthenticated } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DenteController();
const movimentacaoController = new MovimentacaoController();

router.get('/', controller.listar.bind(controller));
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));
router.get('/:id', controller.buscarPorId.bind(controller));
router.get('/:id/qrcode', ensureAuthenticated, controller.gerarQRCode.bind(controller));
router.patch('/:id/status', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.alterarStatus.bind(controller));
router.post('/:id/descartar', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.descartar.bind(controller));
router.get('/:id/movimentacoes', movimentacaoController.porDente.bind(movimentacaoController));

export { router as denteRoutes };
