import nodemailer from 'nodemailer';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { env } from '../config/env';
import { hashCpf, onlyDigits } from '../utils/hash';

const statusPublico: Record<string, string> = {
  RECEBIDO: 'Recebido pelo biobanco.',
  EM_TRIAGEM: 'Em processamento.',
  HIGIENIZADO: 'Preparado para armazenamento ou uso autorizado.',
  ESTERILIZADO: 'Preparado para armazenamento ou uso autorizado.',
  ARMAZENADO: 'Armazenado no biobanco.',
  RESERVADO: 'Reservado para finalidade autorizada.',
  CEDIDO: 'Encaminhado para instituicao autorizada.',
  DESCARTADO: 'Descartado conforme procedimento interno.',
  PERDIDO: 'Informacao indisponivel; orientar contato com o biobanco.',
  DIVERGENTE: 'Informacao indisponivel; orientar contato com o biobanco.'
};

export class ConsultaPublicaService {
  private readonly codigoCache = new Map<string, { codigo: string; expiresAt: Date }>();
  private readonly ttlMs = 10 * 60 * 1000;

  private limparExpirados() {
    const agora = Date.now();
    for (const [cpfHash, item] of this.codigoCache.entries()) {
      if (item.expiresAt.getTime() <= agora) {
        this.codigoCache.delete(cpfHash);
      }
    }
  }

  private async buscarDoador(cpf: string) {
    const cpfNumerico = onlyDigits(cpf);
    const cpfHash = hashCpf(cpfNumerico);

    const doador = await prisma.doador.findUnique({
      where: { cpfHash },
      include: {
        dentes: {
          select: {
            codigoRastreio: true,
            statusAtual: true,
            atualizadoEm: true
          }
        }
      }
    });

    return { cpfHash, doador, cpfNumerico };
  }

  private montarResposta(doador: Awaited<ReturnType<ConsultaPublicaService['buscarDoador']>>['doador']) {
    const dentes = doador?.dentes.map((dente) => ({
      codigoPublico: dente.codigoRastreio,
      statusResumo: statusPublico[dente.statusAtual],
      ultimaAtualizacao: dente.atualizadoEm.toISOString().slice(0, 10)
    })) ?? [];

    return {
      encontrado: dentes.length > 0,
      quantidadeRegistros: dentes.length,
      dentes
    };
  }

  private extrairEmail(contato?: string | null) {
    if (!contato) return null;
    const valor = contato.trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      return valor.toLowerCase();
    }

    return null;
  }

  private gerarCodigo() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private async enviarCodigoPorEmail(email: string, codigo: string) {
    const transporter = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
      ? nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
          }
        })
      : null;

    if (!transporter) {
      console.warn('SMTP não configurado. O código não foi enviado por e-mail.');
      return;
    }

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Código de confirmação da consulta pública SIRDE',
      text: `Seu código de confirmação é: ${codigo}`
    });
  }

  async consultar(cpf: string, ip?: string) {
    const { cpfHash, doador } = await this.buscarDoador(cpf);
    const resposta = this.montarResposta(doador);

    return {
      ...resposta,
      ipHash: ip ? hashCpf(ip) : undefined
    };
  }

  async solicitarCodigo(cpf: string) {
    const { cpfHash, doador } = await this.buscarDoador(cpf);
    const email = this.extrairEmail(doador?.contato);

    if (!doador || !email) {
      throw new AppError('Não foi possível enviar o código para este CPF.', 404);
    }

    this.limparExpirados();
    const codigo = this.gerarCodigo();

    this.codigoCache.set(cpfHash, {
      codigo,
      expiresAt: new Date(Date.now() + this.ttlMs)
    });

    await this.enviarCodigoPorEmail(email, codigo);

    return {
      mensagem: 'Código enviado com sucesso.'
    };
  }

  async confirmarCodigo(cpf: string, codigo: string) {
    const { cpfHash, doador } = await this.buscarDoador(cpf);
    this.limparExpirados();

    const codigoSalvo = this.codigoCache.get(cpfHash);
    if (!codigoSalvo || codigoSalvo.codigo !== codigo.trim() || codigoSalvo.expiresAt.getTime() <= Date.now()) {
      throw new AppError('Código inválido ou expirado.', 401);
    }

    this.codigoCache.delete(cpfHash);
    return this.montarResposta(doador);
  }
}
