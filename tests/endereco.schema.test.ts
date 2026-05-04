import { describe, expect, it } from 'vitest';
import { enderecoSchema } from '../src/schemas/endereco.schema';

describe('schema de endereço', () => {
  it('normaliza UF para maiúsculas', () => {
    const parsed = enderecoSchema.parse({
      bairro: 'Centro',
      complemento: 'Sala 2',
      quadra: 'Q1',
      uf: 'go',
      cidade: 'Goiânia'
    });

    expect(parsed.uf).toBe('GO');
  });

  it('rejeita UF fora do padrão brasileiro', () => {
    expect(() =>
      enderecoSchema.parse({
        bairro: 'Centro',
        quadra: 'Q1',
        uf: 'GOI',
        cidade: 'Goiânia'
      })
    ).toThrow();
  });
});
