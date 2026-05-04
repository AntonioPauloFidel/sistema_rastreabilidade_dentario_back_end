import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
 
const router = Router();
const usuarioController = new UsuarioController();
 
router.get('/', usuarioController.listar.bind(usuarioController));
router.get('/:id', usuarioController.buscarPorId.bind(usuarioController));
 
export { router as usuarioRoutes };
