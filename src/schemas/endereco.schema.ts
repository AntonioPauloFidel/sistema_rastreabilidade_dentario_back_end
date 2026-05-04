import { z } from 'zod';

export const enderecoSchema = z.object({
  bairro: z.string().trim().min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  complemento: z.string().trim().max(120).optional(),
  quadra: z.string().trim().min(1, 'Quadra é obrigatória'),
  uf: z
    .string()
    .trim()
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .transform((uf) => uf.toUpperCase()),
  cidade: z.string().trim().min(2, 'Cidade deve ter pelo menos 2 caracteres')
});

export type EnderecoInput = z.infer<typeof enderecoSchema>;
