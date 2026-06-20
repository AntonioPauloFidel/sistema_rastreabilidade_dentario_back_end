-- CreateTable
CREATE TABLE "alertas_estoque" (
    "id" TEXT NOT NULL,
    "tipo_dente" "TipoDente" NOT NULL,
    "limiteMinimo" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_estoque_pkey" PRIMARY KEY ("id")
);
