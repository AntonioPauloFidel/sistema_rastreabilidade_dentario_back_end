-- Mantém o banco alinhado ao schema atual sem reescrever a migration inicial.
ALTER TABLE "usuarios"
ADD COLUMN "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "endereco" RENAME TO "enderecos";
ALTER TABLE "enderecos" RENAME COLUMN "usuarioId" TO "usuario_id";
ALTER TABLE "enderecos" ALTER COLUMN "complemento" DROP NOT NULL;

ALTER INDEX "endereco_pkey" RENAME TO "enderecos_pkey";
ALTER INDEX "endereco_usuarioId_key" RENAME TO "enderecos_usuario_id_key";
ALTER TABLE "enderecos" RENAME CONSTRAINT "endereco_usuarioId_fkey" TO "enderecos_usuario_id_fkey";

ALTER TABLE "enderecos"
ADD COLUMN "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
