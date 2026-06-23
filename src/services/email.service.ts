import nodemailer from 'nodemailer';
import { env } from '../config/env';

function criarTransporter() {
  if (!env.SMTP_HOST) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
  });
}

const transporter = criarTransporter();

export async function enviarRecuperacaoSenha(email: string, token: string) {
  const link = `${env.APP_URL}/redefinir-senha?token=${token}`;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'SIRDE — Recuperação de senha',
    html: `
      <p>Você solicitou a redefinição de senha no SIRDE.</p>
      <p>Clique no link abaixo para criar uma nova senha. O link expira em <strong>15 minutos</strong>.</p>
      <p><a href="${link}">${link}</a></p>
      <p>Se não foi você, ignore este email.</p>
    `
  });
}

export async function enviarNotificacaoSolicitacao(
  email: string,
  status: 'APROVADA' | 'RECUSADA',
  motivo?: string
) {
  const statusTexto = status === 'APROVADA' ? 'aprovada' : 'recusada';
  const corTexto = status === 'APROVADA' ? 'green' : 'red';

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: `SIRDE — Solicitação ${statusTexto}`,
    html: `
      <p>Sua solicitação de dentes no SIRDE foi <strong style="color:${corTexto}">${statusTexto}</strong>.</p>
      ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
      <p>Acesse o sistema para mais detalhes.</p>
    `
  });
}
