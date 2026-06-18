import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/prisma/client';
import { cleanDatabase } from '../helpers';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/registrar', () => {
    it('deve registrar um novo usuário com dados válidos', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'newuser@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'New User',
          cpf: '123.456.789-10'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body).toHaveProperty('token');
      expect(response.body.usuario.email).toBe('newuser@example.com');
    });

    it('deve retornar 400 para payload inválido', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'invalid-email',
          senha: '123',
          confirmSenha: '456',
          nome: ''
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 409 se email já existe', async () => {
      // Primeiro registro
      await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'duplicate@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'First User',
          cpf: '123.456.789-10'
        });

      // Tentativa de registrar com mesmo email
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'duplicate@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'Second User',
          cpf: '987.654.321-10'
        });

      expect(response.status).toBe(409);
    });

    it('deve retornar 400 se senhas não coincidem', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'user@example.com',
          senha: 'Password123!',
          confirmSenha: 'DifferentPassword!',
          nome: 'User',
          cpf: '123.456.789-10'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Criar usuário para testes de login
      await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'testuser@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'Test User',
          cpf: '123.456.789-10'
        });
    });

    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          senha: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('deve retornar 400 para payload inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          senha: ''
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 401 para credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          senha: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
    });

    it('deve retornar 404 se usuário não existe', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          senha: 'Password123!'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeEach(async () => {
      // Registrar e fazer login para obter token
      const registerResponse = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'meuser@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'Me User',
          cpf: '123.456.789-10'
        });

      token = registerResponse.body.token;
    });

    it('deve retornar informações do usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario.email).toBe('meuser@example.com');
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('deve retornar 401 com token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'refreshuser@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'Refresh User',
          cpf: '123.456.789-10'
        });

      // Extrair refresh token do cookie
      const setCookieHeader = response.headers['set-cookie'];
      if (Array.isArray(setCookieHeader)) {
        const refreshCookie = setCookieHeader.find(c => c.includes('refreshToken'));
        if (refreshCookie) {
          refreshToken = refreshCookie.split('=')[1].split(';')[0];
        }
      }
    });

    it('deve refrescar o token com refresh token válido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('deve retornar 401 sem refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let token: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'logoutuser@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'Logout User',
          cpf: '123.456.789-10'
        });

      token = registerResponse.body.token;
    });

    it('deve fazer logout limpar cookies', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});
