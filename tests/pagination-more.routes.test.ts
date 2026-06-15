import type { Express } from 'express';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const usuariosData = [
  { id: 'u-1', nome: 'User A' },
  { id: 'u-2', nome: 'User B' },
  { id: 'u-3', nome: 'User C' }
];

const dentesData = Array.from({ length: 3 }).map((_, i) => ({ id: `d-${i + 1}` }));
const movimentacoesData = Array.from({ length: 4 }).map((_, i) => ({ id: `m-${i + 1}` }));
const auditoriaData = Array.from({ length: 5 }).map((_, i) => ({ id: `a-${i + 1}` }));

vi.doMock('../src/middlewares/auth.middleware', () => ({
  ensureAuthenticated: vi.fn((req, res, next) => next())
}));

vi.doMock('../src/middlewares/authorization.middleware', () => ({
  authorize: () => (req, res, next) => next()
}));

vi.doMock('../src/services/biobanco.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/biobanco.service')>();

  const denteServiceMock = {
    listar: vi.fn().mockImplementation(({ page, limit }: any) => Promise.resolve({ data: dentesData.slice((page - 1) * limit, page * limit), total: dentesData.length })),
    buscarPorId: vi.fn(),
    criar: vi.fn(),
    alterarStatus: vi.fn()
  };

  const movimentacaoServiceMock = {
    listar: vi.fn().mockImplementation(({ page, limit }: any) => Promise.resolve({ data: movimentacoesData.slice((page - 1) * limit, page * limit), total: movimentacoesData.length })),
    porDente: vi.fn(),
    criar: vi.fn()
  };

  const remessaServiceMock = {
    listar: vi.fn().mockImplementation(({ page, limit }: any) => Promise.resolve({ data: [], total: 0 })),
    criar: vi.fn()
  };

  return {
    ...actual,
    DenteService: vi.fn().mockImplementation(function () { return denteServiceMock; }),
    MovimentacaoService: vi.fn().mockImplementation(function () { return movimentacaoServiceMock; }),
    RemessaEntradaService: vi.fn().mockImplementation(function () { return remessaServiceMock; })
  };
});

vi.doMock('../src/services/solicitacao.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/solicitacao.service')>();
  const solicitacaoServiceMock = {
    listar: vi.fn().mockImplementation(({ page, limit }: any) => Promise.resolve({ data: [], total: 0 })),
    criar: vi.fn(),
    decidir: vi.fn()
  };
  return { ...actual, SolicitacaoService: vi.fn().mockImplementation(function () { return solicitacaoServiceMock; }) };
});

vi.doMock('../src/services/auditoria.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/auditoria.service')>();
  const auditoriaServiceMock = {
    listar: vi.fn().mockImplementation(({ page, limit }: any) => Promise.resolve({ data: auditoriaData.slice((page - 1) * limit, page * limit), total: auditoriaData.length })),
    registrar: vi.fn()
  };
  return { ...actual, AuditoriaService: vi.fn().mockImplementation(function () { return auditoriaServiceMock; }) };
});

vi.doMock('../src/prisma/client', async () => ({
  prisma: {
    usuario: {
      count: vi.fn().mockResolvedValue(usuariosData.length),
      findMany: vi.fn().mockImplementation(({ skip, take }) => Promise.resolve(usuariosData.slice(skip, skip + take)))
    }
  }
}));

let app: Express;

beforeAll(async () => {
  const module = await import('../src/app');
  app = module.app;
});

describe('Paginação - demais endpoints', () => {
  it('GET /api/usuarios retorna data/meta', async () => {
    const res = await request(app).get('/api/usuarios?page=2&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ total: 3, page: 2, limit: 1, totalPages: 3 });
    expect(res.body.data.length).toBe(1);
  });

  it('GET /api/dentes retorna data/meta', async () => {
    const res = await request(app).get('/api/dentes?page=2&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ total: 3, page: 2, limit: 1, totalPages: 3 });
  });

  it('GET /api/movimentacoes retorna data/meta', async () => {
    const res = await request(app).get('/api/movimentacoes?page=2&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ total: 4, page: 2, limit: 1, totalPages: 4 });
  });

  it('GET /api/auditoria retorna data/meta', async () => {
    const res = await request(app).get('/api/auditoria?page=2&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ total: 5, page: 2, limit: 2, totalPages: 3 });
  });
});
