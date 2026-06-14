import { describe, it, expect, vi, beforeEach } from 'vitest';


vi.mock('../src/prisma/client', () => {
  const findUnique = vi.fn();
  const upsert = vi.fn();

  return {
    prisma: {
      configuracaoBiobanco: {
        findUnique,
        upsert
      }
    },
    __mocks: {
      findUnique,
      upsert
    }
  };
});

import { prisma as mockedPrisma, __mocks } from '../src/prisma/client';
import { configService } from '../src/services/config.service';

beforeEach(() => {
  __mocks.findUnique.mockReset();
  __mocks.upsert.mockReset();
});

describe('ConfigService', () => {
  it('getConfig retorna null quando nao existe', async () => {
    __mocks.findUnique.mockResolvedValue(null);
    const result = await configService.getConfig();
    expect(result).toBeNull();
    expect(__mocks.findUnique).toHaveBeenCalledWith({ where: { id: 'singleton' } });
  });

  it('upsertConfig cria e retorna a configuracao', async () => {
    const input = {
      nomeOficial: 'Biobanco X',
      sigla: 'BBX',
      responsavelTecnico: 'Maria',
      email: 'contato@bbx.org',
      telefone: '123',
      endereco: 'Rua A',
      logotipoUrl: 'http://img'
    };

    const created = { id: 'singleton', ...input, atualizadoEm: new Date() };
    __mocks.upsert.mockResolvedValue(created);

    const result = await configService.upsertConfig(input);
    expect(result).toEqual(created);
    expect(__mocks.upsert).toHaveBeenCalled();
  });
});
