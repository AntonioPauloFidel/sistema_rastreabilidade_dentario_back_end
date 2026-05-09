import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
 
export const app = express();
 
app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
 
// Endpoint simples para health checks de container/orquestrador.
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});
 
app.use('/api', router);
 
app.use(notFound);
app.use(errorHandler);

app.get('/ping-sirde', (req, res) => {
  console.log('PING SIRDE OK');
  return res.json({ projeto: 'SIRDE OK' });
});
