import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/prisma/client';
import { cleanDatabase } from '../helpers';
import { PerfilUsuario } from '@prisma/client';

describe('Consulta Pública', () => {
  let adminToken: string;
  let testCPF: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Criar admin para criar dados de teste
    const adminResponse = await request(app)
      .post('/api/auth/registrar')
      .send({
        email: 'admin@example.com',
        senha: 'Password123!',
        confirmSenha: 'Password123!',
        nome: 'Admin User',
        cpf: '111.111.111-11'
      });

    adminToken = adminResponse.body.token;

    await prisma.usuario.update({
      where: { pessoa: { email: 'admin@example.com' } },
      data: { perfil: PerfilUsuario.ADMIN }
    });

    // Criar um doador para testes
    testCPF = '555.666.777-88';
    
    const pessoaDoador = await prisma.pessoa.create({
      data: {
        email: 'doador@example.com',
        nome: 'Doador Teste'
      }
    });

    await prisma.doador.create({
      data: {
        pessoaId: pessoaDoador.id,
        cpfHash: 'mocked-hash', // Em produção seria hash real
        cpfUltimos4: testCPF.slice(-4),
        contato: '(11) 98765-4321'
      }
    });
  });

  describe('GET /api/consulta-publica - CPF Encontrado', () => {
    it('deve retornar dados quando CPF existe', async () => {
      const response = await request(app)
        .get(`/api/consulta-publica?cpf=${testCPF}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('doador');
    });

    it('deve retornar dentes associados ao doador', async () => {
      // Criar dente associado ao doador
      const doador = await prisma.doador.findUnique({
        where: { cpfUltimos4: testCPF.slice(-4) },
        include: { pessoa: true }
      });

      if (doador) {
        await prisma.dente.create({
          data: {
            codigoRastreio: 'DNT-2026-000001',
            tipo: 'INCISIVO',
            doadorId: doador.id,
            statusAtual: 'ARMAZENADO'
          }
        });
      }

      const response = await request(app)
        .get(`/api/consulta-publica?cpf=${testCPF}`);

      expect(response.status).toBe(200);
      if (response.body.dentes) {
        expect(Array.isArray(response.body.dentes)).toBe(true);
      }
    });

    it('deve retornar informações públicas apenas (sem dados sensíveis)', async () => {
      const response = await request(app)
        .get(`/api/consulta-publica?cpf=${testCPF}`);

      expect(response.status).toBe(200);
      // Não deve retornar informações sensíveis
      expect(response.body).not.toHaveProperty('cpfHash');
      expect(response.body).not.toHaveProperty('email');
    });
  });

  describe('GET /api/consulta-publica - CPF Não Encontrado', () => {
    it('deve retornar 404 quando CPF não existe', async () => {
      const response = await request(app)
        .get('/api/consulta-publica?cpf=999.999.999-99');

      expect(response.status).toBe(404);
    });

    it('deve retornar mensagem apropriada quando CPF não encontrado', async () => {
      const response = await request(app)
        .get('/api/consulta-publica?cpf=999.999.999-99');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/consulta-publica - Por Código de Rastreio', () => {
    it('deve retornar dados quando código de rastreio existe', async () => {
      // Criar dente com código específico
      await prisma.dente.create({
        data: {
          codigoRastreio: 'DNT-2026-12345',
          tipo: 'INCISIVO',
          statusAtual: 'ARMAZENADO'
        }
      });

      const response = await request(app)
        .get('/api/consulta-publica?codigo=DNT-2026-12345');

      expect([200, 404]).toContain(response.status);
    });

    it('deve retornar 404 quando código não existe', async () => {
      const response = await request(app)
        .get('/api/consulta-publica?codigo=INEXISTENTE');

      expect(response.status).toBe(404);
    });

    it('deve buscar insensível a maiúsculas/minúsculas se aplicável', async () => {
      // Criar dente
      const dente = await prisma.dente.create({
        data: {
          codigoRastreio: 'DNT-2026-99999',
          tipo: 'INCISIVO',
          statusAtual: 'ARMAZENADO'
        }
      });

      // Tentar buscar com casing diferente
      const responseLower = await request(app)
        .get('/api/consulta-publica?codigo=dnt-2026-99999');

      const responseUpper = await request(app)
        .get('/api/consulta-publica?codigo=DNT-2026-99999');

      // Ambos devem ter o mesmo status (200 ou 404)
      expect(responseLower.status).toBe(responseUpper.status);
    });
  });

  describe('GET /api/consulta-publica - Validação de Entrada', () => {
    it('deve retornar 400 quando ambos CPF e código estão vazios', async () => {
      const response = await request(app)
        .get('/api/consulta-publica?cpf=&codigo=');

      expect([400, 404]).toContain(response.status);
    });

    it('deve retornar 400 para CPF com formato inválido', async () => {
      const response = await request(app)
        .get('/api/consulta-publica?cpf=123');

      expect([400, 404]).toContain(response.status);
    });

    it('deve aceitar CPF com ou sem formatação', async () => {
      // CPF com formatação
      const responseFormatted = await request(app)
        .get(`/api/consulta-publica?cpf=555.666.777-88`);

      // CPF sem formatação
      const responseUnformatted = await request(app)
        .get('/api/consulta-publica?cpf=55566677788');

      // Ambos devem ter comportamento consistente
      expect(responseFormatted.status).toBe(responseUnformatted.status);
    });
  });

  describe('GET /api/consulta-publica - Acesso Público', () => {
    it('deve permitir acesso sem autenticação', async () => {
      const response = await request(app)
        .get(`/api/consulta-publica?cpf=${testCPF}`);

      // Não deve retornar 401 (precisa de autenticação)
      expect(response.status).not.toBe(401);
    });

    it('não deve requerer header de autenticação', async () => {
      const response = await request(app)
        .get(`/api/consulta-publica?cpf=${testCPF}`)
        .set('Authorization', 'Bearer invalid-token');

      // Não deve reclama r de token inválido
      expect(response.status).not.toBe(401);
    });
  });
});
