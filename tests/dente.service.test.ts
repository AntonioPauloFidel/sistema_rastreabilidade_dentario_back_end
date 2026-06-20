import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/prisma/client', () => {
  const findUnique = vi.fn();
  const denteUpdate = vi.fn();
  const movimentacaoCreate = vi.fn();
  const auditoriaCreate = vi.fn();

  const $transaction = vi.fn().mockImplementation(async (fn: any) => {
    const tx = {
      dente: { update: denteUpdate },
      movimentacaoDente: { create: movimentacaoCreate },
      auditoriaEvento: { create: auditoriaCreate }
    };
    return fn(tx);
  });

  return {
    prisma: {
      dente: { findUnique },
      $transaction,
      // exports for tests to assert
    },
    __mocks: {
      findUnique,
      denteUpdate,
      movimentacaoCreate,
      auditoriaCreate,
      $transaction
    }
  };
});

import { prisma as mockedPrisma, __mocks } from '../src/prisma/client';
import { DenteService } from '../src/services/biobanco.service';
import { AppError } from '../src/errors/app-error';

beforeEach(() => {
  __mocks.findUnique.mockReset();
  __mocks.denteUpdate.mockReset();
  __mocks.movimentacaoCreate.mockReset();
  __mocks.auditoriaCreate.mockReset();
  __mocks.$transaction.mockReset();
});

describe('DenteService.descartar', () => {
  it('descarta um dente valido e cria movimentacao + auditoria', async () => {
    const service = new DenteService();
    const dente = { id: 'd1', statusAtual: 'ARMAZENADO', localAtualId: 'local1' } as any;

    __mocks.findUnique.mockResolvedValue(dente);
    __mocks.denteUpdate.mockResolvedValue({ ...dente, statusAtual: 'DESCARTADO' });
    __mocks.movimentacaoCreate.mockResolvedValue({ id: 'm1' });
    __mocks.auditoriaCreate.mockResolvedValue({ id: 'a1' });

    const dataDescarte = new Date('2026-06-20T10:00:00Z');

    await service.descartar(dente.id, 'FRAGMENTADO', 'Quebrou', dataDescarte, 'u1');

    expect(__mocks.$transaction).toHaveBeenCalled();
  });

  it('rejeita descarte quando dente estiver CEDIDO', async () => {
    const service = new DenteService();
    const dente = { id: 'd2', statusAtual: 'CEDIDO', localAtualId: 'local1' } as any;
    __mocks.findUnique.mockResolvedValue(dente);

    await expect(service.descartar(dente.id, 'CONTAMINADO', 'obs', new Date(), 'u1')).rejects.toBeInstanceOf(AppError);
    expect(__mocks.$transaction).not.toHaveBeenCalled();
  });

  it('rejeita descarte quando status nao permitido', async () => {
    const service = new DenteService();
    const dente = { id: 'd3', statusAtual: 'RECEBIDO', localAtualId: 'local1' } as any;
    __mocks.findUnique.mockResolvedValue(dente);

    await expect(service.descartar(dente.id, 'OUTRO', 'obs', new Date(), 'u1')).rejects.toBeInstanceOf(AppError);
    expect(__mocks.$transaction).not.toHaveBeenCalled();
  });
});
