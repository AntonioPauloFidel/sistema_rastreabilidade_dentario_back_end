import { exec } from 'child_process';
import { promisify } from 'util';
import { afterAll, beforeAll } from 'vitest';
import dotenv from 'dotenv';

const execAsync = promisify(exec);

// Carregar variáveis de teste
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  console.log('🔧 Configurando banco de dados de teste...');
  
  try {
    // Executar migrations no banco de teste
    await execAsync('npx prisma migrate deploy --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });
    console.log('✅ Banco de dados pronto para testes');
  } catch (error) {
    console.error('❌ Erro ao preparar banco de dados:', error);
    throw error;
  }
});

afterAll(async () => {
  console.log('🧹 Limpando banco de dados de teste...');
  
  try {
    // Opcional: resetar o banco de dados após os testes
    // await execAsync('npx prisma migrate reset --force --skip-generate', {
    //   env: {
    //     ...process.env,
    //     DATABASE_URL: process.env.DATABASE_URL,
    //   },
    // });
    console.log('✅ Limpeza concluída');
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
  }
});

export {};
