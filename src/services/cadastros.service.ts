import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { ClinicaInput, DentistaInput, InstituicaoInput, LocalInput } from '../schemas/sirde.schema';

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export class InstituicaoService {
  async listar() {
    return prisma.instituicao.findMany({ orderBy: { nome: 'asc' }, include: { endereco: true } });
  }

  async buscarPorId(id: string) {
    const instituicao = await prisma.instituicao.findUnique({ where: { id }, include: { endereco: true } });
    if (!instituicao) throw new AppError('Instituicao nao encontrada', 404);
    return instituicao;
  }

  async criar(data: InstituicaoInput) {
    try {
      return await prisma.instituicao.create({ data });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('CNPJ ja cadastrado', 409);
      throw error;
    }
  }

  async atualizar(id: string, data: InstituicaoInput) {
    await this.buscarPorId(id);
    try {
      return await prisma.instituicao.update({ where: { id }, data });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('CNPJ ja cadastrado', 409);
      throw error;
    }
  }
}

export class ClinicaService {
  async listar() {
    return prisma.clinica.findMany({ orderBy: { nome: 'asc' }, include: { endereco: true } });
  }

  async criar(data: ClinicaInput) {
    try {
      return await prisma.clinica.create({ data });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('CNPJ da clinica ja cadastrado', 409);
      throw error;
    }
  }
}

export class DentistaService {
  async listar() {
    return prisma.dentista.findMany({ orderBy: { nome: 'asc' }, include: { clinica: true } });
  }

  async criar(data: DentistaInput) {
    try {
      return await prisma.dentista.create({ data });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('CRO ja cadastrado para esta UF', 409);
      throw error;
    }
  }
}

export class LocalArmazenamentoService {
  async listar() {
    return prisma.localArmazenamento.findMany({ orderBy: { nome: 'asc' } });
  }

  async criar(data: LocalInput) {
    return prisma.localArmazenamento.create({ data });
  }
}
