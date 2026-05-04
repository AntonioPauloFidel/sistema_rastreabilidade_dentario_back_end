import { Prisma } from '@prisma/client';

export const usuarioPublicSelect = {
  id: true,
  nome: true,
  email: true,
  ativo: true,
  criadoEm: true,
  atualizadoEm: true
} satisfies Prisma.UsuarioSelect;

export const enderecoPublicSelect = {
  id: true,
  bairro: true,
  complemento: true,
  quadra: true,
  uf: true,
  cidade: true,
  criadoEm: true,
  atualizadoEm: true
} satisfies Prisma.EnderecoSelect;
