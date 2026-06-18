import { prisma } from '../src/prisma/client';
import app from '../src/app';

export async function cleanDatabase() {
  // Limpar dados em ordem de dependência (respeitar foreign keys)
  try {
    await prisma.movimentacao.deleteMany({});
    await prisma.cessao.deleteMany({});
    await prisma.dente.deleteMany({});
    await prisma.remessaEntrada.deleteMany({});
    await prisma.termoConsentimento.deleteMany({});
    await prisma.doador.deleteMany({});
    await prisma.clinica.deleteMany({});
    await prisma.local.deleteMany({});
    await prisma.usuario.deleteMany({});
    await prisma.pessoa.deleteMany({});
    await prisma.endereco.deleteMany({});
    await prisma.instituicao.deleteMany({});
    await prisma.configuracaoBiobanco.deleteMany({});
  } catch (error) {
    console.error('Erro ao limpar banco:', error);
    throw error;
  }
}

export async function createTestUser(userData?: any) {
  const defaultData = {
    email: 'test@example.com',
    cpf: '123.456.789-10',
    nome: 'Test User',
    perfil: 'ADMIN',
  };

  const user = await prisma.usuario.create({
    data: {
      perfil: defaultData.perfil,
      pessoa: {
        create: {
          email: defaultData.email,
          nome: defaultData.nome,
        },
      },
    },
    include: { pessoa: true },
  });

  return user;
}

export function getTestApp() {
  return app;
}
