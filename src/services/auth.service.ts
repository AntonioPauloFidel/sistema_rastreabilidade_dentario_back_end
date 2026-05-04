import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client';
import { env } from '../config/env';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { gerarToken } from './jwt.service';
import { AppError } from '../errors/app-error';
import { usuarioPublicSelect } from '../prisma/selects';

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export class AuthService {
  async registrar(data: RegisterInput) {
    const pessoaExistente = await prisma.pessoa.findUnique({
      where: { email: data.email },
      select: { id: true }
    });
 
    if (pessoaExistente) {
      throw new AppError('E-mail já cadastrado', 409);
    }
 
    const senhaHash = await bcrypt.hash(data.senha, env.BCRYPT_SALT_ROUNDS);

    try {
      const usuario = await prisma.usuario.create({
        data: {
          senhaHash,
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
        email: usuario.pessoa?.email
      });
 
      return { usuario, token };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError('E-mail já cadastrado', 409);
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
        usuario: {
          select: {
            senhaHash: true
          }
        }
      }
    });
 
    if (!pessoa) {
      throw new AppError('Credenciais inválidas', 401);
    }
 
    if (!pessoa.ativo) {
      throw new AppError('Usuário inativo', 403);
    }
 
    const senhaValida = await bcrypt.compare(data.senha, pessoa.usuario.senhaHash);
 
    if (!senhaValida) {
      throw new AppError('Credenciais inválidas', 401);
    }
 
    const token = gerarToken({
      sub: pessoa.id,
      email: data.email
    });
 
    return { token };
  }
}
