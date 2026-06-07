import { Prisma, StatusDente } from '@prisma/client';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import {
  DenteInput,
  DoadorInput,
  MovimentacaoInput,
  RemessaInput,
  TermoInput
} from '../schemas/sirde.schema';
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
  async listar() {
    return prisma.remessaEntrada.findMany({ orderBy: { criadoEm: 'desc' }, include: { clinica: true } });
  }

  async criar(data: RemessaInput) {
    return prisma.remessaEntrada.create({ data });
  }
}

export class DenteService {
  async listar() {
    return prisma.dente.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { doador: true, remessa: true, localAtual: true }
    });
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
  async listar() {
    return prisma.movimentacaoDente.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { dente: true, origemLocal: true, destinoLocal: true }
    });
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
