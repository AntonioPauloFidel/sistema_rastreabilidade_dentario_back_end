import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/services/consulta-publica.service', () => {
  return {
    ConsultaPublicaService: vi.fn().mockImplementation(function () {
      return {
        consultar: vi.fn().mockResolvedValue({
          encontrado: false,
          quantidadeRegistros: 0,
          dentes: []
        })
      };
    })
  };
});

import { app } from '../src/app';

describe('Rate limiter em /api/public/consulta-dentes', () => {
  it('permite até 10 requisições e bloqueia a 11ª', async () => {
    for (let i = 0; i < 10; i += 1) {
      const response = await request(app)
        .post('/api/public/consulta-dentes')
        .send({ cpf: '00000000000' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        resultado: {
          encontrado: false,
          quantidadeRegistros: 0,
          dentes: []
        }
      });
    }

    const blocked = await request(app)
      .post('/api/public/consulta-dentes')
      .send({ cpf: '00000000000' });

    expect(blocked.status).toBe(429);
    expect(blocked.headers['retry-after']).toBeDefined();
    expect(blocked.body).toEqual({ erro: 'Muitas tentativas. Tente novamente em 15 minutos.' });
  });
});
