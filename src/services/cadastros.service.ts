import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { ClinicaInput, DentistaInput, InstituicaoInput, LocalInput } from '../schemas/sirde.schema';

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export class InstituicaoService {
  async listar(filters?: { tipo?: string; page?: number; limit?: number }) {
    const where: Prisma.InstituicaoWhereInput = { status: 'ATIVA' };
    if (filters?.tipo) {
      where.tipo = filters.tipo as any;
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.instituicao.count({ where });

    const data = await prisma.instituicao.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { endereco: true },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
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
  async listar(filters?: { nome?: string; page?: number; limit?: number }) {
    const where: Prisma.ClinicaWhereInput = { status: 'ATIVA' };
    if (filters?.nome) {
      where.nome = { contains: filters.nome, mode: 'insensitive' };
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.clinica.count({ where });

    const data = await prisma.clinica.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { endereco: true },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  async buscarPorId(id: string) {
    const clinica = await prisma.clinica.findUnique({ where: { id }, include: { endereco: true } });
    if (!clinica) throw new AppError('Clinica nao encontrada', 404);
    return clinica;
  }

  async criar(data: ClinicaInput) {
    try {
      return await prisma.clinica.create({ data });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('CNPJ da clinica ja cadastrado', 409);
      throw error;
    }
  }

  async atualizar(id: string, data: ClinicaInput) {
    await this.buscarPorId(id);
    try {
      return await prisma.clinica.update({ where: { id }, data });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('CNPJ da clinica ja cadastrado', 409);
      throw error;
    }
  }

  async desativar(id: string) {
    await this.buscarPorId(id);
    return prisma.clinica.update({ where: { id }, data: { status: 'INATIVA' } });
  }
}

export class DentistaService {
  async listar(filters?: { clinicaId?: string; page?: number; limit?: number }) {
    const where: Prisma.DentistaWhereInput = { status: 'ATIVA' };
    if (filters?.clinicaId) {
      where.clinicaId = filters.clinicaId;
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.dentista.count({ where });

    const data = await prisma.dentista.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { clinica: true },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  async buscarPorId(id: string) {
    const dentista = await prisma.dentista.findUnique({ where: { id }, include: { clinica: true } });
    if (!dentista) throw new AppError('Dentista nao encontrado', 404);
    return dentista;
  }

  async criar(data: DentistaInput) {
    try {
      return await prisma.dentista.create({ data });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('CRO ja cadastrado para esta UF', 409);
      throw error;
    }
  }

  async atualizar(id: string, data: DentistaInput) {
    await this.buscarPorId(id);
    try {
      return await prisma.dentista.update({ where: { id }, data });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('CRO ja cadastrado para esta UF', 409);
      throw error;
    }
  }

  async desativar(id: string) {
    await this.buscarPorId(id);
    return prisma.dentista.update({ where: { id }, data: { status: 'INATIVA' } });
  }
}

export class LocalArmazenamentoService {
  async listar(filters?: { page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.localArmazenamento.count();

    const data = await prisma.localArmazenamento.findMany({
      orderBy: { nome: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  async criar(data: LocalInput) {
    return prisma.localArmazenamento.create({ data });
  }
}
