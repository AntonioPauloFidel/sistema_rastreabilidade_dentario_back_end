import express from 'express';
import cors from 'cors';
import path from 'path';
import { router } from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { env } from './config/env';
import { prisma } from './prisma/client';
 
const packageJson = require('../package.json') as { version?: string };
 
export const app = express();
 
app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
 
function bytesToMB(bytes: number) {
  return Number((bytes / 1024 / 1024).toFixed(2));
}
 
async function checkDatabase() {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok' as const,
      latencia_ms: Date.now() - start
    };
  } catch {
    return {
      status: 'degraded' as const,
      latencia_ms: Date.now() - start
    };
  }
}
 
app.get('/health', async (req, res) => {
  const db = await checkDatabase();
  const healthStatus = db.status === 'ok' ? 'ok' : 'degraded';
  const statusCode = healthStatus === 'ok' ? 200 : 503;

  return res.status(statusCode).json({
    status: healthStatus,
    versao: packageJson.version ?? 'unknown',
    ambiente: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    banco: db,
    memoria: {
      usada_mb: bytesToMB(process.memoryUsage().heapUsed),
      total_mb: bytesToMB(process.memoryUsage().heapTotal)
    }
  });
});
 
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use('/api', router);
 
app.use(notFound);
app.use(errorHandler);

app.get('/ping-sirde', (req, res) => {
  console.log('PING SIRDE OK');
  return res.json({ projeto: 'SIRDE OK' });
});
