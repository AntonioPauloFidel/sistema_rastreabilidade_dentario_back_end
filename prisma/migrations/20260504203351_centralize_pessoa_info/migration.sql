/*
  Warnings:

  - You are about to drop the column `ativo` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `atualizado_em` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `senha_hash` on the `usuarios` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "usuarios_email_key";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "ativo",
DROP COLUMN "atualizado_em",
DROP COLUMN "criado_em",
DROP COLUMN "email",
DROP COLUMN "nome",
DROP COLUMN "senha_hash";

-- CreateTable
CREATE TABLE "pessoas" (
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pessoas_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pessoas_email_key" ON "pessoas"("email");

-- AddForeignKey
ALTER TABLE "pessoas" ADD CONSTRAINT "pessoas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
