import fs from 'fs';
import path from 'path';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { env } from '../config/env';

function urlArquivo(filename: string): string {
  return `${env.APP_URL}/uploads/${filename}`;
}

function removerArquivoAntigo(urlAntiga: string | null) {
  if (!urlAntiga) return;
  const filename = path.basename(urlAntiga);
  const filePath = path.resolve(process.cwd(), 'uploads', filename);
  fs.unlink(filePath, () => {});
}

export class UploadService {
  async uploadFotoDente(denteId: string, filename: string) {
    const dente = await prisma.dente.findUnique({ where: { id: denteId }, select: { id: true, fotoUrl: true } });
    if (!dente) {
      removerArquivoAntigo(`/uploads/${filename}`);
      throw new AppError('Dente nao encontrado', 404);
    }

    removerArquivoAntigo(dente.fotoUrl);

    return prisma.dente.update({
      where: { id: denteId },
      data: { fotoUrl: urlArquivo(filename) },
      select: { id: true, codigoRastreio: true, fotoUrl: true }
    });
  }

  async uploadPdfTermo(termoId: string, filename: string) {
    const termo = await prisma.termoConsentimento.findUnique({ where: { id: termoId }, select: { id: true, pdfUrl: true } });
    if (!termo) {
      removerArquivoAntigo(`/uploads/${filename}`);
      throw new AppError('Termo nao encontrado', 404);
    }

    removerArquivoAntigo(termo.pdfUrl);

    return prisma.termoConsentimento.update({
      where: { id: termoId },
      data: { pdfUrl: urlArquivo(filename) },
      select: { id: true, tipo: true, pdfUrl: true }
    });
  }
}
