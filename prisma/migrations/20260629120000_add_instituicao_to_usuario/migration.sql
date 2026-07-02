-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "instituicao_id" TEXT;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
