import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { authorize } from '../middlewares/authorization.middleware';
import { PerfilUsuario } from '@prisma/client';
 
const router = Router();
const usuarioController = new UsuarioController();
 
router.get('/', usuarioController.listar.bind(usuarioController));
router.post('/', authorize(PerfilUsuario.ADMIN), usuarioController.criar.bind(usuarioController));
router.patch('/:id/status', authorize(PerfilUsuario.ADMIN), usuarioController.alterarStatus.bind(usuarioController));
router.patch('/:id/perfil', authorize(PerfilUsuario.ADMIN), usuarioController.alterarPerfil.bind(usuarioController));
router.get('/:id', usuarioController.buscarPorId.bind(usuarioController));
 
export { router as usuarioRoutes };
