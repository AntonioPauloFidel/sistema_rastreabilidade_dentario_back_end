import { Router } from 'express';
import { BuscaController } from '../controllers/busca.controller';

const router = Router();
const controller = new BuscaController();

router.get('/', controller.buscar.bind(controller));

export { router as buscaRoutes };
