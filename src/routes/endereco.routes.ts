import { Router } from 'express';
import { EnderecoController } from '../controllers/endereco.controller';

const router = Router();
const enderecoController = new EnderecoController();

router.get('/me', enderecoController.buscarMeuEndereco.bind(enderecoController));
router.put('/me', enderecoController.salvarMeuEndereco.bind(enderecoController));

export { router as enderecoRoutes };
