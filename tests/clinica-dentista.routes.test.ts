import type { Express } from 'express';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const clinicaServiceMock = {
  buscarPorId: vi.fn(),
  atualizar: vi.fn()
};

const dentistaServiceMock = {
  buscarPorId: vi.fn(),
  atualizar: vi.fn()
};

vi.doMock('../src/middlewares/auth.middleware', () => ({
  ensureAuthenticated: vi.fn((req, res, next) => next())
}));

vi.doMock('../src/middlewares/authorization.middleware', () => ({
  authorize: () => (req, res, next) => next()
}));

vi.doMock('../src/services/cadastros.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/cadastros.service')>();

  const clinicaServiceMockStatic = {
    listar: vi.fn(),
    buscarPorId: clinicaServiceMock.buscarPorId,
    criar: vi.fn(),
    atualizar: clinicaServiceMock.atualizar
  };

  const dentistaServiceMockStatic = {
    listar: vi.fn(),
    buscarPorId: dentistaServiceMock.buscarPorId,
    criar: vi.fn(),
    atualizar: dentistaServiceMock.atualizar
  };

  return {
    ...actual,
    ClinicaService: vi.fn().mockImplementation(function () {
      return clinicaServiceMockStatic;
    }),
    DentistaService: vi.fn().mockImplementation(function () {
      return dentistaServiceMockStatic;
    })
  };
});

let app: Express;

beforeAll(async () => {
  const module = await import('../src/app');
  app = module.app;
});

describe('Clinica e Dentista routes', () => {
  beforeEach(() => {
    clinicaServiceMock.buscarPorId.mockReset();
    clinicaServiceMock.atualizar.mockReset();
    dentistaServiceMock.buscarPorId.mockReset();
    dentistaServiceMock.atualizar.mockReset();
  });

  describe('Clinica', () => {
    it('GET /api/clinicas/:id retorna a clínica', async () => {
      clinicaServiceMock.buscarPorId.mockResolvedValue({
        id: '00000000-0000-4000-8000-000000000001',
        nome: 'Clinica Teste',
        tipo: 'LABORATORIO',
        cnpj: '12345678000199',
        email: 'teste@clinica.com',
        telefone: '123456789'
      });

      const response = await request(app).get('/api/clinicas/00000000-0000-4000-8000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        clinica: {
          id: '00000000-0000-4000-8000-000000000001',
          nome: 'Clinica Teste',
          tipo: 'LABORATORIO',
          cnpj: '12345678000199',
          email: 'teste@clinica.com',
          telefone: '123456789'
        }
      });
    });

    it('PUT /api/clinicas/:id atualiza a clínica', async () => {
      clinicaServiceMock.atualizar.mockResolvedValue({
        id: '00000000-0000-4000-8000-000000000001',
        nome: 'Clinica Atualizada',
        tipo: 'LABORATORIO',
        cnpj: '12345678000199',
        email: 'novo@clinica.com',
        telefone: '987654321'
      });

      const response = await request(app)
        .put('/api/clinicas/00000000-0000-4000-8000-000000000001')
        .send({
          nome: 'Clinica Atualizada',
          cnpj: '12345678000199',
          tipo: 'LABORATORIO',
          email: 'novo@clinica.com',
          telefone: '987654321'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        clinica: {
          id: '00000000-0000-4000-8000-000000000001',
          nome: 'Clinica Atualizada',
          tipo: 'LABORATORIO',
          cnpj: '12345678000199',
          email: 'novo@clinica.com',
          telefone: '987654321'
        }
      });
    });
  });

  describe('Dentista', () => {
    it('GET /api/dentistas/:id retorna o dentista', async () => {
      dentistaServiceMock.buscarPorId.mockResolvedValue({
        id: '00000000-0000-4000-8000-000000000002',
        nome: 'Dentista Teste',
        cro: '12345',
        ufCro: 'SP',
        email: 'teste@dentista.com',
        telefone: '123456789',
        clinicaId: '00000000-0000-4000-8000-000000000001'
      });

      const response = await request(app).get('/api/dentistas/00000000-0000-4000-8000-000000000002');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        dentista: {
          id: '00000000-0000-4000-8000-000000000002',
          nome: 'Dentista Teste',
          cro: '12345',
          ufCro: 'SP',
          email: 'teste@dentista.com',
          telefone: '123456789',
          clinicaId: '00000000-0000-4000-8000-000000000001'
        }
      });
    });

    it('PUT /api/dentistas/:id atualiza o dentista', async () => {
      dentistaServiceMock.atualizar.mockResolvedValue({
        id: '00000000-0000-4000-8000-000000000002',
        nome: 'Dentista Atualizado',
        cro: '12345',
        ufCro: 'SP',
        email: 'novo@dentista.com',
        telefone: '987654321',
        clinicaId: '00000000-0000-4000-8000-000000000001'
      });

      const response = await request(app)
        .put('/api/dentistas/00000000-0000-4000-8000-000000000002')
        .send({
          nome: 'Dentista Atualizado',
          cro: '12345',
          ufCro: 'SP',
          email: 'novo@dentista.com',
          telefone: '987654321',
          clinicaId: '00000000-0000-4000-8000-000000000001'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        dentista: {
          id: '00000000-0000-4000-8000-000000000002',
          nome: 'Dentista Atualizado',
          cro: '12345',
          ufCro: 'SP',
          email: 'novo@dentista.com',
          telefone: '987654321',
          clinicaId: '00000000-0000-4000-8000-000000000001'
        }
      });
    });
  });
});
