import { Prisma, StatusDente, TipoDente } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import {
  DenteInput,
  DoadorInput,
  MovimentacaoInput,
  RemessaInput,
  TermoInput
} from '../schemas/sirde.schema';
import { denteListSelect } from '../prisma/selects';
import { hashCpf, onlyDigits } from '../utils/hash';
import { AuditoriaService } from './auditoria.service';

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

const auditoriaService = new AuditoriaService();

export class DoadorService {
  async criar(data: DoadorInput, usuarioId?: string) {
    const cpf = onlyDigits(data.cpf);

    try {
      const doador = await prisma.doador.create({
        data: {
          cpfHash: hashCpf(cpf),
          cpfUltimos4: cpf.slice(-4),
          nome: data.nome,
          dataNascimento: data.dataNascimento,
          contato: data.contato
        }
      });

      await auditoriaService.registrar({
        usuarioId,
        acao: 'CRIAR_DOADOR',
        entidade: 'Doador',
        entidadeId: doador.id
      });

      return doador;
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('Doador ja cadastrado para este CPF', 409);
      throw error;
    }
  }

  async buscarPorId(id: string) {
    const doador = await prisma.doador.findUnique({
      where: { id },
      include: { dentes: true, termos: true }
    });
    if (!doador) throw new AppError('Doador nao encontrado', 404);
    return doador;
  }
}

export class TermoConsentimentoService {
  async criar(data: TermoInput, usuarioId?: string) {
    const termo = await prisma.termoConsentimento.create({ data });
    await auditoriaService.registrar({
      usuarioId,
      acao: 'CRIAR_TERMO_CONSENTIMENTO',
      entidade: 'TermoConsentimento',
      entidadeId: termo.id
    });
    return termo;
  }
}

export class RemessaEntradaService {
  async listar(filters?: { page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.remessaEntrada.count();

    const data = await prisma.remessaEntrada.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { clinica: true },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  async criar(data: RemessaInput) {
    return prisma.remessaEntrada.create({ data });
  }
}

export class DenteService {
  async listar(filters?: { status?: StatusDente; tipo?: TipoDente; remessaId?: string; page?: number; limit?: number }) {
    const where: Prisma.DenteWhereInput = {};

    if (filters?.status) {
      where.statusAtual = filters.status;
    }

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.remessaId) {
      where.remessaId = filters.remessaId;
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.dente.count({ where });

    const data = await prisma.dente.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      select: denteListSelect,
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  async buscarPorId(id: string) {
    const dente = await prisma.dente.findUnique({
      where: { id },
      include: {
        doador: true,
        remessa: true,
        localAtual: true,
        movimentacoes: { orderBy: { criadoEm: 'desc' } }
      }
    });
    if (!dente) throw new AppError('Dente nao encontrado', 404);
    return dente;
  }

  async criar(data: DenteInput, usuarioId?: string) {
    try {
      const dente = await prisma.dente.create({ data });

      await auditoriaService.registrar({
        usuarioId,
        acao: 'CRIAR_DENTE',
        entidade: 'Dente',
        entidadeId: dente.id,
        dados: { codigoRastreio: dente.codigoRastreio }
      });

      return dente;
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new AppError('Codigo de rastreio ja cadastrado', 409);
      throw error;
    }
  }

  async alterarStatus(id: string, statusNovo: StatusDente, motivo: string, destinoLocalId?: string, observacao?: string, usuarioId?: string) {
    const dente = await this.buscarPorId(id);

    return prisma.$transaction(async (tx) => {
      const atualizado = await tx.dente.update({
        where: { id },
        data: {
          statusAtual: statusNovo,
          localAtualId: destinoLocalId ?? dente.localAtualId
        }
      });

      await tx.movimentacaoDente.create({
        data: {
          denteId: id,
          origemLocalId: dente.localAtualId,
          destinoLocalId,
          statusAnterior: dente.statusAtual,
          statusNovo,
          motivo,
          observacao,
          responsavelId: usuarioId
        }
      });

      await tx.auditoriaEvento.create({
        data: {
          usuarioId,
          acao: 'ALTERAR_STATUS_DENTE',
          entidade: 'Dente',
          entidadeId: id,
          dados: { statusAnterior: dente.statusAtual, statusNovo }
        }
      });

      return atualizado;
    });
  }
}

export class MovimentacaoService {
  async listar(filters?: { denteId?: string; localId?: string; page?: number; limit?: number }) {
    const where: Prisma.MovimentacaoDenteWhereInput = {};

    if (filters?.denteId) {
      where.denteId = filters.denteId;
    }

    if (filters?.localId) {
      where.OR = [
        { origemLocalId: filters.localId },
        { destinoLocalId: filters.localId }
      ];
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const total = await prisma.movimentacaoDente.count({ where });

    const data = await prisma.movimentacaoDente.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: { dente: true, origemLocal: true, destinoLocal: true },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data, total };
  }

  async porDente(denteId: string) {
    return prisma.movimentacaoDente.findMany({
      where: { denteId },
      orderBy: { criadoEm: 'desc' },
      include: { origemLocal: true, destinoLocal: true }
    });
  }

  async criar(data: MovimentacaoInput, usuarioId?: string) {
    const dente = await prisma.dente.findUnique({ where: { id: data.denteId } });
    if (!dente) throw new AppError('Dente nao encontrado', 404);

    return prisma.$transaction(async (tx) => {
      const movimentacao = await tx.movimentacaoDente.create({
        data: {
          ...data,
          statusAnterior: dente.statusAtual,
          responsavelId: usuarioId
        }
      });

      await tx.dente.update({
        where: { id: data.denteId },
        data: {
          statusAtual: data.statusNovo,
          localAtualId: data.destinoLocalId ?? dente.localAtualId
        }
      });

      return movimentacao;
    });
  }
}
