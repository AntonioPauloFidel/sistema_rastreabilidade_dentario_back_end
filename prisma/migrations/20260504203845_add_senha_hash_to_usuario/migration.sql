/*
  Warnings:

  - You are about to drop the column `senha_hash` on the `pessoas` table. All the data in the column will be lost.
  - Added the required column `senha_hash` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pessoas" DROP COLUMN "senha_hash";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "senha_hash" TEXT NOT NULL;
