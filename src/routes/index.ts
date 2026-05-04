import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { enderecoRoutes } from './endereco.routes';
import { usuarioRoutes } from './usuario.routes';
import { ensureAuthenticated } from '../middlewares/auth.middleware';

const router = Router();
 
router.use('/auth', authRoutes);
router.use('/usuarios', ensureAuthenticated, usuarioRoutes);
router.use('/enderecos', ensureAuthenticated, enderecoRoutes);
 
export { router };
