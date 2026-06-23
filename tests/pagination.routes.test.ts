import type { Express } from 'express';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const clinicasData = [
  { id: '00000000-0000-4000-8000-000000000011', nome: 'Clinica A' },
  { id: '00000000-0000-4000-8000-000000000012', nome: 'Clinica B' }
];

const dentistasData = [
  { id: '00000000-0000-4000-8000-000000000021', nome: 'Dentista A' },
  { id: '00000000-0000-4000-8000-000000000022', nome: 'Dentista B' }
];

vi.doMock('../src/middlewares/auth.middleware', () => ({
  ensureAuthenticated: vi.fn((req, res, next) => next())
}));

vi.doMock('../src/middlewares/authorization.middleware', () => ({
  authorize: () => (req, res, next) => next()
}));

vi.doMock('../src/services/cadastros.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/cadastros.service')>();

  const clinicaServiceMock = {
    listar: vi.fn().mockImplementation(({ page, limit }: any) => Promise.resolve({ data: clinicasData.slice((page - 1) * limit, page * limit), total: clinicasData.length })),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    desativar: vi.fn()
  };

  const dentistaServiceMock = {
    listar: vi.fn().mockImplementation(({ page, limit }: any) => Promise.resolve({ data: dentistasData.slice((page - 1) * limit, page * limit), total: dentistasData.length })),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    desativar: vi.fn()
  };

  return {
    ...actual,
    ClinicaService: vi.fn().mockImplementation(function () {
      return clinicaServiceMock;
    }),
    DentistaService: vi.fn().mockImplementation(function () {
      return dentistaServiceMock;
    })
  };
});

let app: Express;

beforeAll(async () => {
  const module = await import('../src/app');
  app = module.app;
});

describe('Paginação - Clinicas e Dentistas', () => {
  it('GET /api/clinicas retorna data/meta e aplica page/limit', async () => {
    const res1 = await request(app).get('/api/clinicas?page=1&limit=1');
    expect(res1.status).toBe(200);
    expect(res1.body).toHaveProperty('data');
    expect(Array.isArray(res1.body.data)).toBe(true);
    expect(res1.body.data.length).toBe(1);
    expect(res1.body.meta).toEqual({ total: 2, page: 1, limit: 1, totalPages: 2 });
    expect(res1.body.data[0].id).toBe(clinicasData[0].id);

    const res2 = await request(app).get('/api/clinicas?page=2&limit=1');
    expect(res2.status).toBe(200);
    expect(res2.body.data.length).toBe(1);
    expect(res2.body.data[0].id).toBe(clinicasData[1].id);
  });

  it('GET /api/dentistas retorna data/meta e aplica page/limit', async () => {
    const res1 = await request(app).get('/api/dentistas?page=1&limit=1');
    expect(res1.status).toBe(200);
    expect(res1.body.data.length).toBe(1);
    expect(res1.body.meta).toEqual({ total: 2, page: 1, limit: 1, totalPages: 2 });
    expect(res1.body.data[0].id).toBe(dentistasData[0].id);

    const res2 = await request(app).get('/api/dentistas?page=2&limit=1');
    expect(res2.status).toBe(200);
    expect(res2.body.data[0].id).toBe(dentistasData[1].id);
  });
});
