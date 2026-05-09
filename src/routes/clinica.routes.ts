import { PerfilUsuario } from '@prisma/client';
import { Router } from 'express';
import { ClinicaController } from '../controllers/clinica.controller';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const controller = new ClinicaController();

router.get('/', controller.listar.bind(controller));
router.post('/', authorize(PerfilUsuario.ADMIN, PerfilUsuario.BIOBANCO_GESTOR), controller.criar.bind(controller));

export { router as clinicaRoutes };
