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
 
export const editarPerfilSchema = z.object({
  nome: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  email: z.string().trim().email('E-mail inválido').toLowerCase().optional()
}).refine(data => data.nome || data.email, { message: 'Informe ao menos nome ou email para atualizar' });

export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z
    .string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .max(72, 'Nova senha deve ter no máximo 72 caracteres')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;
export type AlterarSenhaInput = z.infer<typeof alterarSenhaSchema>;
