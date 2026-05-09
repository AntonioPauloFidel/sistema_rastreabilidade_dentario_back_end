import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
 
const router = Router();
const authController = new AuthController();
 
router.post('/register', authController.registrar.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/me', ensureAuthenticated, authController.me.bind(authController));
 
export { router as authRoutes };
