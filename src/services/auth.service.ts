import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { AppError } from '../errors/app-error';
import { prisma } from '../prisma/client';
import { usuarioPublicSelect } from '../prisma/selects';
import { AlterarSenhaInput, EditarPerfilInput, LoginInput, RegisterInput } from '../schemas/auth.schema';
import { gerarRefreshToken, gerarToken, gerarTokenRecuperacao, verificarRefreshToken, verificarTokenRecuperacao } from './jwt.service';
import { enviarRecuperacaoSenha } from './email.service';

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export class AuthService {
  async registrar(data: RegisterInput) {
    const totalUsuarios = await prisma.usuario.count();

    if (totalUsuarios > 0) {
      throw new AppError('Registro publico desativado. Solicite acesso a um administrador.', 403);
    }

    const pessoaExistente = await prisma.pessoa.findUnique({
      where: { email: data.email },
      select: { id: true }
    });

    if (pessoaExistente) {
      throw new AppError('E-mail ja cadastrado', 409);
    }

    const senhaHash = await bcrypt.hash(data.senha, env.BCRYPT_SALT_ROUNDS);

    try {
      const usuario = await prisma.usuario.create({
        data: {
          senhaHash,
          perfil: 'ADMIN',
          pessoa: {
            create: {
              nome: data.nome,
              email: data.email
            }
          }
        },
        select: usuarioPublicSelect
      });

      const token = gerarToken({
        sub: usuario.id,
        email: data.email,
        perfil: usuario.perfil
      });
      const refreshToken = gerarRefreshToken({
        sub: usuario.id,
        email: data.email,
        perfil: usuario.perfil
      });

      return { usuario, token, refreshToken };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError('E-mail ja cadastrado', 409);
      }

      throw error;
    }
  }

  async login(data: LoginInput) {
    const pessoa = await prisma.pessoa.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        ativo: true,
        email: true,
        usuario: {
          select: {
            senhaHash: true,
            perfil: true,
            instituicaoId: true
          }
        }
      }
    });

    if (!pessoa) {
      throw new AppError('Credenciais invalidas', 401);
    }

    if (!pessoa.ativo) {
      throw new AppError('Usuario inativo', 403);
    }

    const senhaValida = await bcrypt.compare(data.senha, pessoa.usuario.senhaHash);

    if (!senhaValida) {
      throw new AppError('Credenciais invalidas', 401);
    }

    const token = gerarToken({
      sub: pessoa.id,
      email: pessoa.email,
      perfil: pessoa.usuario.perfil
    });
    const refreshToken = gerarRefreshToken({
      sub: pessoa.id,
      email: pessoa.email,
      perfil: pessoa.usuario.perfil
    });

    return { token, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = verificarRefreshToken(refreshToken);

    const pessoa = await prisma.pessoa.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        ativo: true,
        usuario: {
          select: {
            perfil: true,
            instituicaoId: true
          }
        }
      }
    });

    if (!pessoa || !pessoa.ativo) {
      throw new AppError('Sessao invalida', 401);
    }

    if (pessoa.email !== payload.email || pessoa.usuario.perfil !== payload.perfil) {
      throw new AppError('Sessao expirada por alteracao no usuario', 401);
    }

    const token = gerarToken({
      sub: pessoa.id,
      email: pessoa.email,
      perfil: pessoa.usuario.perfil
    });

    return {
      token,
      usuario: {
        id: pessoa.id,
        email: pessoa.email,
        perfil: pessoa.usuario.perfil,
        instituicaoId: pessoa.usuario.instituicaoId ?? undefined
      }
    };
  }

  async editarPerfil(usuarioId: string, data: EditarPerfilInput) {
    if (data.email) {
      const emailEmUso = await prisma.pessoa.findFirst({
        where: { email: data.email, NOT: { id: usuarioId } },
        select: { id: true }
      });
      if (emailEmUso) throw new AppError('E-mail ja esta em uso', 409);
    }

    const pessoa = await prisma.pessoa.update({
      where: { id: usuarioId },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.email && { email: data.email })
      },
      select: { id: true, nome: true, email: true, ativo: true, atualizadoEm: true }
    });

    return { pessoa };
  }

  async alterarSenha(usuarioId: string, data: AlterarSenhaInput) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { senhaHash: true }
    });

    if (!usuario) throw new AppError('Usuario nao encontrado', 404);

    const senhaValida = await bcrypt.compare(data.senhaAtual, usuario.senhaHash);
    if (!senhaValida) throw new AppError('Senha atual incorreta', 400);

    const novaSenhaHash = await bcrypt.hash(data.novaSenha, env.BCRYPT_SALT_ROUNDS);
    await prisma.usuario.update({ where: { id: usuarioId }, data: { senhaHash: novaSenhaHash } });

    return { message: 'Senha alterada com sucesso' };
  }

  async esqueceuSenha(email: string) {
    const pessoa = await prisma.pessoa.findUnique({ where: { email }, select: { id: true, ativo: true } });
    if (!pessoa || !pessoa.ativo) return;

    const token = gerarTokenRecuperacao(email);
    await enviarRecuperacaoSenha(email, token);
  }

  async redefinirSenha(token: string, novaSenha: string) {
    let email: string;
    try {
      email = verificarTokenRecuperacao(token);
    } catch {
      throw new AppError('Token invalido ou expirado', 400);
    }

    const pessoa = await prisma.pessoa.findUnique({
      where: { email },
      select: { id: true, ativo: true }
    });

    if (!pessoa || !pessoa.ativo) throw new AppError('Usuario nao encontrado', 404);

    const senhaHash = await bcrypt.hash(novaSenha, env.BCRYPT_SALT_ROUNDS);
    await prisma.usuario.update({ where: { id: pessoa.id }, data: { senhaHash } });

    return { message: 'Senha redefinida com sucesso' };
  }
}
