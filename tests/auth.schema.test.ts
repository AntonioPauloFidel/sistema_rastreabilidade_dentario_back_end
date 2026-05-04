import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../src/schemas/auth.schema';

describe('schemas de autenticação', () => {
  it('normaliza nome e e-mail no cadastro', () => {
    const parsed = registerSchema.parse({
      nome: '  Antonio Fidel  ',
      email: '  ANTONIO@EXEMPLO.COM  ',
      senha: 'senha-forte'
    });

    expect(parsed).toEqual({
      nome: 'Antonio Fidel',
      email: 'antonio@exemplo.com',
      senha: 'senha-forte'
    });
  });

  it('rejeita senha curta no cadastro', () => {
    expect(() =>
      registerSchema.parse({
        nome: 'Ana Silva',
        email: 'ana@example.com',
        senha: '123'
      })
    ).toThrow();
  });

  it('normaliza e-mail no login', () => {
    const parsed = loginSchema.parse({
      email: '  USER@EXAMPLE.COM ',
      senha: 'qualquer'
    });

    expect(parsed.email).toBe('user@example.com');
  });
});
