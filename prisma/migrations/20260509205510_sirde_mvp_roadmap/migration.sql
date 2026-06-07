-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'BIOBANCO_OPERADOR', 'BIOBANCO_GESTOR', 'CLINICA', 'DENTISTA', 'INSTITUICAO_SOLICITANTE', 'AUDITOR');

-- CreateEnum
CREATE TYPE "StatusCadastro" AS ENUM ('ATIVA', 'INATIVA');

-- CreateEnum
CREATE TYPE "TipoInstituicao" AS ENUM ('ESCOLA', 'FACULDADE', 'UNIVERSIDADE', 'LABORATORIO', 'EMPRESA', 'SUS', 'OUTRA');

-- CreateEnum
CREATE TYPE "StatusDente" AS ENUM ('RECEBIDO', 'EM_TRIAGEM', 'HIGIENIZADO', 'ESTERILIZADO', 'ARMAZENADO', 'RESERVADO', 'CEDIDO', 'DESCARTADO', 'PERDIDO', 'DIVERGENTE');

-- CreateEnum
CREATE TYPE "TipoDente" AS ENUM ('INCISIVO', 'CANINO', 'PRE_MOLAR', 'MOLAR', 'DECIDUO', 'OUTRO');

-- CreateEnum
CREATE TYPE "CondicaoDente" AS ENUM ('INTEGRO', 'RESTAURADO', 'CARIADO', 'FRAGMENTADO', 'OUTRA');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE_ANALISE', 'APROVADA', 'RECUSADA', 'PARCIALMENTE_ATENDIDA', 'ATENDIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "FinalidadeSolicitacao" AS ENUM ('ENSINO', 'PESQUISA', 'TREINAMENTO', 'OUTRA');

-- DropForeignKey
ALTER TABLE "enderecos" DROP CONSTRAINT "enderecos_usuario_id_fkey";

-- AlterTable
ALTER TABLE "enderecos" ALTER COLUMN "usuario_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "perfil" "PerfilUsuario" NOT NULL DEFAULT 'BIOBANCO_OPERADOR';

-- CreateTable
CREATE TABLE "instituicoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoInstituicao" NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "status" "StatusCadastro" NOT NULL DEFAULT 'ATIVA',
    "endereco_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instituicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinicas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "responsavel" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "status" "StatusCadastro" NOT NULL DEFAULT 'ATIVA',
    "endereco_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dentistas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cro" TEXT NOT NULL,
    "uf_cro" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "status" "StatusCadastro" NOT NULL DEFAULT 'ATIVA',
    "clinica_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dentistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doadores" (
    "id" TEXT NOT NULL,
    "cpf_hash" TEXT NOT NULL,
    "cpf_ultimos_4" TEXT NOT NULL,
    "nome" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "contato" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "termos_consentimento" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "data_assinatura" TIMESTAMP(3) NOT NULL,
    "validade" TIMESTAMP(3),
    "observacao" TEXT,
    "doador_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "termos_consentimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remessas_entrada" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "origem_tipo" TEXT NOT NULL,
    "data_envio" TIMESTAMP(3),
    "data_recebimento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RECEBIDA',
    "clinica_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remessas_entrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dentes" (
    "id" TEXT NOT NULL,
    "codigo_rastreio" TEXT NOT NULL,
    "tipo" "TipoDente" NOT NULL,
    "numeracao" TEXT,
    "condicao" "CondicaoDente" NOT NULL,
    "status_atual" "StatusDente" NOT NULL DEFAULT 'RECEBIDO',
    "observacao" TEXT,
    "doador_id" TEXT,
    "remessa_id" TEXT,
    "local_atual_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locais_armazenamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "sala" TEXT,
    "armario" TEXT,
    "prateleira" TEXT,
    "caixa" TEXT,
    "status" "StatusCadastro" NOT NULL DEFAULT 'ATIVA',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locais_armazenamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_dente" (
    "id" TEXT NOT NULL,
    "dente_id" TEXT NOT NULL,
    "origem_local_id" TEXT,
    "destino_local_id" TEXT,
    "status_anterior" "StatusDente",
    "status_novo" "StatusDente" NOT NULL,
    "motivo" TEXT NOT NULL,
    "observacao" TEXT,
    "responsavel_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_dente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_dente" (
    "id" TEXT NOT NULL,
    "instituicao_id" TEXT NOT NULL,
    "finalidade" "FinalidadeSolicitacao" NOT NULL,
    "justificativa" TEXT NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE_ANALISE',
    "motivo_decisao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_dente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_solicitacao" (
    "id" TEXT NOT NULL,
    "solicitacao_id" TEXT NOT NULL,
    "tipo_dente" "TipoDente" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "requisitos" TEXT,
    "quantidade_atendida" INTEGER NOT NULL DEFAULT 0,
    "dente_id" TEXT,

    CONSTRAINT "itens_solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cessoes_dente" (
    "id" TEXT NOT NULL,
    "solicitacao_id" TEXT NOT NULL,
    "instituicao_id" TEXT NOT NULL,
    "dente_id" TEXT NOT NULL,
    "responsavel_id" TEXT,
    "data_cessao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,

    CONSTRAINT "cessoes_dente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas_publicas" (
    "id" TEXT NOT NULL,
    "cpf_hash" TEXT NOT NULL,
    "ip_hash" TEXT,
    "encontrado" BOOLEAN NOT NULL,
    "quantidade_registros" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultas_publicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_eventos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT,
    "dados" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instituicoes_cnpj_key" ON "instituicoes"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "instituicoes_endereco_id_key" ON "instituicoes"("endereco_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinicas_cnpj_key" ON "clinicas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "clinicas_endereco_id_key" ON "clinicas"("endereco_id");

-- CreateIndex
CREATE UNIQUE INDEX "dentistas_cro_uf_cro_key" ON "dentistas"("cro", "uf_cro");

-- CreateIndex
CREATE UNIQUE INDEX "doadores_cpf_hash_key" ON "doadores"("cpf_hash");

-- CreateIndex
CREATE UNIQUE INDEX "remessas_entrada_codigo_key" ON "remessas_entrada"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "dentes_codigo_rastreio_key" ON "dentes"("codigo_rastreio");

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instituicoes" ADD CONSTRAINT "instituicoes_endereco_id_fkey" FOREIGN KEY ("endereco_id") REFERENCES "enderecos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinicas" ADD CONSTRAINT "clinicas_endereco_id_fkey" FOREIGN KEY ("endereco_id") REFERENCES "enderecos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dentistas" ADD CONSTRAINT "dentistas_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "termos_consentimento" ADD CONSTRAINT "termos_consentimento_doador_id_fkey" FOREIGN KEY ("doador_id") REFERENCES "doadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remessas_entrada" ADD CONSTRAINT "remessas_entrada_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dentes" ADD CONSTRAINT "dentes_doador_id_fkey" FOREIGN KEY ("doador_id") REFERENCES "doadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dentes" ADD CONSTRAINT "dentes_remessa_id_fkey" FOREIGN KEY ("remessa_id") REFERENCES "remessas_entrada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dentes" ADD CONSTRAINT "dentes_local_atual_id_fkey" FOREIGN KEY ("local_atual_id") REFERENCES "locais_armazenamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_dente" ADD CONSTRAINT "movimentacoes_dente_dente_id_fkey" FOREIGN KEY ("dente_id") REFERENCES "dentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_dente" ADD CONSTRAINT "movimentacoes_dente_origem_local_id_fkey" FOREIGN KEY ("origem_local_id") REFERENCES "locais_armazenamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_dente" ADD CONSTRAINT "movimentacoes_dente_destino_local_id_fkey" FOREIGN KEY ("destino_local_id") REFERENCES "locais_armazenamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_dente" ADD CONSTRAINT "movimentacoes_dente_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_dente" ADD CONSTRAINT "solicitacoes_dente_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_solicitacao" ADD CONSTRAINT "itens_solicitacao_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "solicitacoes_dente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_solicitacao" ADD CONSTRAINT "itens_solicitacao_dente_id_fkey" FOREIGN KEY ("dente_id") REFERENCES "dentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cessoes_dente" ADD CONSTRAINT "cessoes_dente_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "solicitacoes_dente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cessoes_dente" ADD CONSTRAINT "cessoes_dente_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cessoes_dente" ADD CONSTRAINT "cessoes_dente_dente_id_fkey" FOREIGN KEY ("dente_id") REFERENCES "dentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_eventos" ADD CONSTRAINT "auditoria_eventos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
