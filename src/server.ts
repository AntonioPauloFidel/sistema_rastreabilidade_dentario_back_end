import { app } from './app';
import { env } from './config/env';
import { prisma } from './prisma/client';

const server = app.listen(env.PORT, () => {
  console.log(`Servidor SIRDE rodando na porta ${env.PORT}`);
});

async function shutdown(signal: NodeJS.Signals) {
  console.log(`Recebido ${signal}. Encerrando servidor...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
