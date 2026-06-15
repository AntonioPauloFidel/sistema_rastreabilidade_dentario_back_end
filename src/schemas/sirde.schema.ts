import { z } from 'zod';

const optionalText = z.string().trim().min(1).optional();

export const idParamSchema = z.object({
  id: z.string().uuid('ID invalido')
});

export const instituicaoSchema = z.object({
  nome: z.string().trim().min(2),
  tipo: z.enum(['ESCOLA', 'FACULDADE', 'UNIVERSIDADE', 'LABORATORIO', 'EMPRESA', 'SUS', 'OUTRA']),
  cnpj: z.string().trim().min(11).max(18),
  email: z.string().trim().email().optional(),
  telefone: optionalText
});

export const clinicaSchema = z.object({
  nome: z.string().trim().min(2),
  cnpj: optionalText,
  responsavel: optionalText,
  email: z.string().trim().email().optional(),
  telefone: optionalText
});

export const dentistaSchema = z.object({
  nome: z.string().trim().min(2),
  cro: z.string().trim().min(3),
  ufCro: z.string().trim().length(2).transform((uf) => uf.toUpperCase()),
  email: z.string().trim().email().optional(),
  telefone: optionalText,
  clinicaId: z.string().uuid().optional()
});

export const alterarStatusCadastroSchema = z.object({
  ativo: z.boolean().refine((value) => value === false, {
    message: 'Apenas a desativacao eh suportada',
    path: ['ativo']
  })
});

export const doadorSchema = z.object({
  cpf: z.string().trim().min(11),
  nome: optionalText,
  dataNascimento: z.coerce.date().optional(),
  contato: optionalText
});

export const termoSchema = z.object({
  doadorId: z.string().uuid(),
  tipo: z.string().trim().min(2),
  versao: z.string().trim().min(1),
  dataAssinatura: z.coerce.date(),
  validade: z.coerce.date().optional(),
  observacao: optionalText
});

export const remessaSchema = z.object({
  codigo: z.string().trim().min(3),
  origemTipo: z.string().trim().min(2),
  dataEnvio: z.coerce.date().optional(),
  dataRecebimento: z.coerce.date().optional(),
  clinicaId: z.string().uuid().optional()
});

export const denteSchema = z.object({
  codigoRastreio: z.string().trim().min(3),
  tipo: z.enum(['INCISIVO', 'CANINO', 'PRE_MOLAR', 'MOLAR', 'DECIDUO', 'OUTRO']),
  numeracao: optionalText,
  condicao: z.enum(['INTEGRO', 'RESTAURADO', 'CARIADO', 'FRAGMENTADO', 'OUTRA']),
  doadorId: z.string().uuid().optional(),
  remessaId: z.string().uuid().optional(),
  localAtualId: z.string().uuid().optional(),
  observacao: optionalText
});

export const alterarStatusDenteSchema = z.object({
  statusNovo: z.enum([
    'RECEBIDO',
    'EM_TRIAGEM',
    'HIGIENIZADO',
    'ESTERILIZADO',
    'ARMAZENADO',
    'RESERVADO',
    'CEDIDO',
    'DESCARTADO',
    'PERDIDO',
    'DIVERGENTE'
  ]),
  motivo: z.string().trim().min(3),
  destinoLocalId: z.string().uuid().optional(),
  observacao: optionalText
});

export const localSchema = z.object({
  nome: z.string().trim().min(2),
  tipo: z.string().trim().min(2),
  sala: optionalText,
  armario: optionalText,
  prateleira: optionalText,
  caixa: optionalText
});

export const movimentacaoSchema = z.object({
  denteId: z.string().uuid(),
  origemLocalId: z.string().uuid().optional(),
  destinoLocalId: z.string().uuid().optional(),
  statusNovo: alterarStatusDenteSchema.shape.statusNovo,
  motivo: z.string().trim().min(3),
  observacao: optionalText
});

export const solicitacaoSchema = z.object({
  instituicaoId: z.string().uuid(),
  finalidade: z.enum(['ENSINO', 'PESQUISA', 'TREINAMENTO', 'OUTRA']),
  justificativa: z.string().trim().min(10),
  itens: z.array(
    z.object({
      tipoDente: denteSchema.shape.tipo,
      quantidade: z.coerce.number().int().positive(),
      requisitos: optionalText
    })
  ).min(1)
});

export const decisaoSolicitacaoSchema = z.object({
  motivo: z.string().trim().min(3).optional()
});

export const cessaoSchema = z.object({
  solicitacaoId: z.string().uuid(),
  instituicaoId: z.string().uuid(),
  denteId: z.string().uuid(),
  dataLimiteUso: z.coerce.date().optional(),
  observacao: optionalText
});

export const alertaEstoqueSchema = z.object({
  tipoDente: denteSchema.shape.tipo,
  limiteMinimo: z.coerce.number().int().min(0),
  ativo: z.boolean().optional()
});

export const consultaPublicaSchema = z.object({
  cpf: z.string().trim().min(11)
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20)
});

export const denteListQuerySchema = z.object({
  status: alterarStatusDenteSchema.shape.statusNovo.optional(),
  tipo: denteSchema.shape.tipo.optional(),
  remessaId: z.string().uuid().optional()
}).merge(paginationQuerySchema);

export const solicitacaoListQuerySchema = z.object({
  status: z.enum([
    'PENDENTE_ANALISE',
    'APROVADA',
    'RECUSADA',
    'PARCIALMENTE_ATENDIDA',
    'ATENDIDA',
    'CANCELADA'
  ]).optional(),
  instituicaoId: z.string().uuid().optional()
}).merge(paginationQuerySchema);

export const movimentacaoListQuerySchema = z.object({
  denteId: z.string().uuid().optional(),
  localId: z.string().uuid().optional()
}).merge(paginationQuerySchema);

export const criarUsuarioSchema = z.object({
  nome: z.string().trim().min(3),
  email: z.string().trim().email().toLowerCase(),
  senha: z.string().min(8).max(72),
  perfil: z.enum([
    'ADMIN',
    'BIOBANCO_OPERADOR',
    'BIOBANCO_GESTOR',
    'CLINICA',
    'DENTISTA',
    'INSTITUICAO_SOLICITANTE',
    'AUDITOR'
  ]).default('BIOBANCO_OPERADOR')
});

export const usuarioListQuerySchema = z.object({
  ativo: z.coerce.boolean().optional(),
  perfil: criarUsuarioSchema.shape.perfil.optional()
}).merge(paginationQuerySchema);

export const instituicaoListQuerySchema = z.object({
  tipo: instituicaoSchema.shape.tipo.optional()
}).merge(paginationQuerySchema);

export const clinicaListQuerySchema = z.object({
  nome: z.string().trim().min(1).optional()
}).merge(paginationQuerySchema);

export const dentistaListQuerySchema = z.object({
  clinicaId: z.string().uuid().optional()
}).merge(paginationQuerySchema);

export const localListQuerySchema = z.object({}).merge(paginationQuerySchema);

export const remessaListQuerySchema = z.object({}).merge(paginationQuerySchema);

export const auditoriaListQuerySchema = z.object({}).merge(paginationQuerySchema);

export const alterarStatusUsuarioSchema = z.object({
  ativo: z.boolean()
});

export const alterarPerfilUsuarioSchema = z.object({
  perfil: criarUsuarioSchema.shape.perfil
});

export type InstituicaoInput = z.infer<typeof instituicaoSchema>;
export type ClinicaInput = z.infer<typeof clinicaSchema>;
export type DentistaInput = z.infer<typeof dentistaSchema>;
export type DoadorInput = z.infer<typeof doadorSchema>;
export type TermoInput = z.infer<typeof termoSchema>;
export type RemessaInput = z.infer<typeof remessaSchema>;
export type DenteInput = z.infer<typeof denteSchema>;
export type LocalInput = z.infer<typeof localSchema>;
export type MovimentacaoInput = z.infer<typeof movimentacaoSchema>;
export type SolicitacaoInput = z.infer<typeof solicitacaoSchema>;
export type CessaoInput = z.infer<typeof cessaoSchema>;
export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;
export type AlertaEstoqueInput = z.infer<typeof alertaEstoqueSchema>;
