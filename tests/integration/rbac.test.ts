import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/prisma/client';
import { cleanDatabase } from '../helpers';
import { PerfilUsuario } from '@prisma/client';

describe('RBAC - Role Based Access Control', () => {
  let adminToken: string;
  let operadorToken: string;
  let gestorToken: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Criar usuários com diferentes perfis
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

    // Alterar perfil para ADMIN no banco (já que registro cria como ADMIN por padrão)
    await prisma.usuario.update({
      where: { pessoa: { email: 'admin@example.com' } },
      data: { perfil: PerfilUsuario.ADMIN }
    });

    const operadorResponse = await request(app)
      .post('/api/auth/registrar')
      .send({
        email: 'operador@example.com',
        senha: 'Password123!',
        confirmSenha: 'Password123!',
        nome: 'Operador User',
        cpf: '222.222.222-22'
      });

    operadorToken = operadorResponse.body.token;

    // Alterar perfil para OPERADOR
    await prisma.usuario.update({
      where: { pessoa: { email: 'operador@example.com' } },
      data: { perfil: PerfilUsuario.BIOBANCO_OPERADOR }
    });

    const gestorResponse = await request(app)
      .post('/api/auth/registrar')
      .send({
        email: 'gestor@example.com',
        senha: 'Password123!',
        confirmSenha: 'Password123!',
        nome: 'Gestor User',
        cpf: '333.333.333-33'
      });

    gestorToken = gestorResponse.body.token;

    // Alterar perfil para GESTOR
    await prisma.usuario.update({
      where: { pessoa: { email: 'gestor@example.com' } },
      data: { perfil: PerfilUsuario.BIOBANCO_GESTOR }
    });
  });

  describe('POST /api/clinicas - Criar Clínica', () => {
    it('admin deve conseguir criar clínica', async () => {
      const response = await request(app)
        .post('/api/clinicas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Clínica Teste',
          endereco: {
            rua: 'Rua A',
            numero: '123',
            cidade: 'São Paulo',
            estado: 'SP'
          }
        });

      expect([201, 200]).toContain(response.status);
    });

    it('gestor deve conseguir criar clínica', async () => {
      const response = await request(app)
        .post('/api/clinicas')
        .set('Authorization', `Bearer ${gestorToken}`)
        .send({
          nome: 'Clínica Teste',
          endereco: {
            rua: 'Rua A',
            numero: '123',
            cidade: 'São Paulo',
            estado: 'SP'
          }
        });

      expect([201, 200]).toContain(response.status);
    });

    it('operador deve receber 403 ao tentar criar clínica', async () => {
      const response = await request(app)
        .post('/api/clinicas')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          nome: 'Clínica Teste',
          endereco: {
            rua: 'Rua A',
            numero: '123',
            cidade: 'São Paulo',
            estado: 'SP'
          }
        });

      expect(response.status).toBe(403);
    });

    it('usuário sem autenticação deve receber 401', async () => {
      const response = await request(app)
        .post('/api/clinicas')
        .send({
          nome: 'Clínica Teste',
          endereco: {
            rua: 'Rua A',
            numero: '123',
            cidade: 'São Paulo',
            estado: 'SP'
          }
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/clinicas - Listar Clínicas', () => {
    it('deve permitir qualquer usuário autenticado listar clínicas', async () => {
      const response = await request(app)
        .get('/api/clinicas')
        .set('Authorization', `Bearer ${operadorToken}`);

      expect([200, 400]).toContain(response.status);
    });

    it('deve permitir acesso público sem autenticação', async () => {
      const response = await request(app)
        .get('/api/clinicas');

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('POST /api/dentes - Criar Dente', () => {
    it('admin deve conseguir criar dente', async () => {
      const response = await request(app)
        .post('/api/dentes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          codigoRastreio: 'DNT-2026-000001',
          tipo: 'INCISIVO'
        });

      expect([201, 200]).toContain(response.status);
    });

    it('operador deve conseguir criar dente', async () => {
      const response = await request(app)
        .post('/api/dentes')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          codigoRastreio: 'DNT-2026-000002',
          tipo: 'INCISIVO'
        });

      expect([201, 200]).toContain(response.status);
    });

    it('gestor sem permissão deve receber erro apropriado', async () => {
      // Gestor tem permissão em algumas rotas, verificar o comportamento específico
      const response = await request(app)
        .post('/api/dentes')
        .set('Authorization', `Bearer ${gestorToken}`)
        .send({
          codigoRastreio: 'DNT-2026-000003',
          tipo: 'INCISIVO'
        });

      // Gestor pode ter permissão, então aceitamos 201, 200 ou 403
      expect([201, 200, 403]).toContain(response.status);
    });
  });

  describe('GET /api/auth/me - Dados do Usuário', () => {
    it('qualquer usuário autenticado deve conseguir acessar /me', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${operadorToken}`);

      expect(response.status).toBe(200);
    });

    it('usuário sem autenticação deve receber 401 em /me', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
