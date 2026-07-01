import { Prisma } from '@prisma/client';

export const usuarioPublicSelect = {
  id: true,
  perfil: true,
  instituicaoId: true,
  pessoa: {
    select: {
      nome: true,
      email: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true
    }
  }
} satisfies Prisma.UsuarioSelect;

export const pessoaPublicSelect = {
  id: true,
  nome: true,
  email: true,
  ativo: true,
  criadoEm: true,
  atualizadoEm: true
} satisfies Prisma.PessoaSelect;

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

export const clinicaListSelect = {
  id: true,
  nome: true,
  cnpj: true,
  responsavel: true,
  email: true,
  telefone: true,
  status: true
} satisfies Prisma.ClinicaSelect;

export const dentistaListSelect = {
  id: true,
  nome: true,
  cro: true,
  ufCro: true,
  email: true,
  telefone: true,
  status: true,
  clinica: { select: { id: true, nome: true } }
} satisfies Prisma.DentistaSelect;

export const instituicaoListSelect = {
  id: true,
  nome: true,
  tipo: true,
  cnpj: true,
  email: true,
  telefone: true,
  status: true
} satisfies Prisma.InstituicaoSelect;

export const denteListSelect = {
  id: true,
  codigoRastreio: true,
  tipo: true,
  condicao: true,
  statusAtual: true,
  criadoEm: true,
  localAtual: { select: { id: true, nome: true } }
} satisfies Prisma.DenteSelect;

export const solicitacaoListSelect = {
  id: true,
  finalidade: true,
  status: true,
  criadoEm: true,
  instituicao: { select: { id: true, nome: true } }
} satisfies Prisma.SolicitacaoDenteSelect;
