import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { TermoController } from '../controllers/termo.controller';
import { UploadController } from '../controllers/upload.controller';
import { authorize } from '../middlewares/authorization.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
const controller = new TermoController();
const uploadController = new UploadController();

router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));
router.post('/:id/pdf', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_OPERADOR, PerfilUsuario.BIOBANCO_GESTOR), upload.single('pdf'), uploadController.uploadPdfTermo.bind(uploadController));

export { router as termoRoutes };
