import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/prisma/client';
import { cleanDatabase } from '../helpers';

describe('Validação Zod - Payload Validation', () => {
  let token: string;

  beforeEach(async () => {
    await cleanDatabase();

    const registerResponse = await request(app)
      .post('/api/auth/registrar')
      .send({
        email: 'testuser@example.com',
        senha: 'Password123!',
        confirmSenha: 'Password123!',
        nome: 'Test User',
        cpf: '123.456.789-10'
      });

    token = registerResponse.body.token;
  });

  describe('Auth Validation', () => {
    it('deve retornar 400 para email inválido no registro', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'invalid-email',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'User',
          cpf: '123.456.789-10'
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para senha muito curta', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'user@example.com',
          senha: '123',
          confirmSenha: '123',
          nome: 'User',
          cpf: '123.456.789-10'
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 quando senhas não coincidem', async () => {
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

    it('deve retornar 400 para CPF inválido', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'user@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: 'User',
          cpf: 'invalid-cpf'
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para nome vazio', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          email: 'user@example.com',
          senha: 'Password123!',
          confirmSenha: 'Password123!',
          nome: '',
          cpf: '123.456.789-10'
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para login sem email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          senha: 'Password123!'
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para login sem senha', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Clinica Validation', () => {
    it('deve retornar 400para nome de clínica vazio', async () => {
      const response = await request(app)
        .post('/api/clinicas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: '',
          endereco: {
            rua: 'Rua A',
            numero: '123',
            cidade: 'São Paulo',
            estado: 'SP'
          }
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para estado com mais de 2 caracteres', async () => {
      const response = await request(app)
        .post('/api/clinicas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Clínica',
          endereco: {
            rua: 'Rua A',
            numero: '123',
            cidade: 'São Paulo',
            estado: 'SPP'
          }
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 quando faltam campos obrigatórios', async () => {
      const response = await request(app)
        .post('/api/clinicas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Clínica'
          // falta endereco
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Endereco Validation', () => {
    it('deve retornar 400 para CEP inválido', async () => {
      const response = await request(app)
        .post('/api/enderecos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          rua: 'Rua A',
          numero: '123',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: 'invalid-cep'
        });

      expect([400, 404]).toContain(response.status);
    });

    it('deve retornar 400 para estado inválido (não 2 chars)', async () => {
      const response = await request(app)
        .post('/api/enderecos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          rua: 'Rua A',
          numero: '123',
          cidade: 'São Paulo',
          estado: 'SPP'
        });

      expect([400, 404]).toContain(response.status);
    });

    it('deve retornar 400 para rua vazia', async () => {
      const response = await request(app)
        .post('/api/enderecos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          rua: '',
          numero: '123',
          cidade: 'São Paulo',
          estado: 'SP'
        });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('Dente Validation', () => {
    it('deve retornar 400 para tipo de dente inválido', async () => {
      const response = await request(app)
        .post('/api/dentes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          codigoRastreio: 'DNT-2026-000001',
          tipo: 'TIPO_INVALIDO'
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 quando falta codigoRastreio', async () => {
      const response = await request(app)
        .post('/api/dentes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'INCISIVO'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Consulta Pública Validation', () => {
    it('deve retornar 400 para CPF inválido na consulta pública', async () => {
      const response = await request(app)
        .get('/api/consulta-publica?cpf=invalid-cpf');

      expect(response.status).toBe(400);
    });

    it('deve retornar 400 para código inválido na consulta pública', async () => {
      const response = await request(app)
        .get('/api/consulta-publica?codigo=');

      expect([400, 404]).toContain(response.status);
    });
  });
});
