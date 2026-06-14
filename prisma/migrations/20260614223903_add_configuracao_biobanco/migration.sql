-- CreateTable
CREATE TABLE "configuracoes_biobanco" (
    "id" TEXT NOT NULL,
    "nomeOficial" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "responsavelTecnico" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT NOT NULL,
    "logotipoUrl" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_biobanco_pkey" PRIMARY KEY ("id")
);
