import { Router } from 'express';
import { configController } from '../controllers/config.controller';
import { authorize } from '../middlewares/authorization.middleware';
import { PerfilUsuario } from '@prisma/client';

const router = Router();

router.get('/', configController.get.bind(configController));
router.put('/', authorize(PerfilUsuario.ADMIN), configController.upsert.bind(configController));

export default router;
