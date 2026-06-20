import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { alertaEstoqueController } from '../controllers/alerta.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();

// Visualizar: todos os perfis do biobanco
router.get('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), alertaEstoqueController.listar.bind(alertaEstoqueController));

// Gerenciar: ADMIN e BIOBANCO_GESTOR
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), alertaEstoqueController.criar.bind(alertaEstoqueController));
router.delete('/:id', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), alertaEstoqueController.remover.bind(alertaEstoqueController));

export { router as alertaRoutes };
