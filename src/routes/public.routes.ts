import { Router } from 'express';
import { ConsultaPublicaController } from '../controllers/consulta-publica.controller';

const router = Router();
const controller = new ConsultaPublicaController();

router.post('/consulta-dentes', controller.consultar.bind(controller));

export { router as publicRoutes };
