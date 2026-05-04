import { z } from 'zod';
 
export const registerSchema = z.object({
  nome: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  senha: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres')
});
 
export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  senha: z.string().min(1, 'Senha é obrigatória')
});
 
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
