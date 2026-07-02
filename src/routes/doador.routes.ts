import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { DoadorController } from '../controllers/doador.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new DoadorController();

router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));
router.get('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.listar.bind(controller));
router.get('/cpf/:cpf', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.buscarPorCpf.bind(controller));
router.get('/:id', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.buscarPorId.bind(controller));
router.put('/:id', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.atualizar.bind(controller));

export { router as doadorRoutes };
