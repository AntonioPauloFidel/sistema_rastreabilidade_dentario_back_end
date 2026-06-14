import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ConsultaPublicaController } from '../controllers/consulta-publica.controller';

const router = Router();
const controller = new ConsultaPublicaController();

const consultaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});

router.post('/consulta-dentes', consultaLimiter, controller.consultar.bind(controller));

export { router as publicRoutes };
