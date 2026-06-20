import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { SolicitacaoController } from '../controllers/solicitacao.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new SolicitacaoController();

router.get('/', controller.listar.bind(controller));
router.get('/exportar', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.exportar.bind(controller));
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.INSTITUICAO_SOLICITANTE, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));
router.patch('/:id/aprovar', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.aprovar.bind(controller));
router.patch('/:id/recusar', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.recusar.bind(controller));

export { router as solicitacaoRoutes };
