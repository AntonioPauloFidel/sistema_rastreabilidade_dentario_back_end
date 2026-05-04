import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_SECRET: z.string().min(12, 'JWT_SECRET deve ter pelo menos 12 caracteres'),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'JWT_EXPIRES_IN deve usar formatos como 15m, 1h ou 7d')
    .default('30m'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10)
}).superRefine((env, ctx) => {
  if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) {
    ctx.addIssue({
      code: 'custom',
      path: ['JWT_SECRET'],
      message: 'JWT_SECRET deve ter pelo menos 32 caracteres em produção'
    });
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Variáveis de ambiente inválidas:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
