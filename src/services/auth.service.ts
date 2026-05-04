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
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email },
      select: { id: true }
    });
 
    if (usuarioExistente) {
      throw new AppError('E-mail já cadastrado', 409);
    }
 
    const senhaHash = await bcrypt.hash(data.senha, env.BCRYPT_SALT_ROUNDS);

    try {
      const usuario = await prisma.usuario.create({
        data: {
          nome: data.nome,
          email: data.email,
          senhaHash
        },
        select: usuarioPublicSelect
      });

      const token = gerarToken({
        sub: usuario.id,
        email: usuario.email
      });
 
      return { usuario, token };
    } catch (error) {
      // Protege contra corrida entre a checagem de e-mail e a criação do usuário.
      if (isUniqueConstraintError(error)) {
        throw new AppError('E-mail já cadastrado', 409);
      }

      throw error;
    }
  }
 
  async login(data: LoginInput) {
    const usuario = await prisma.usuario.findUnique({
      where: { email: data.email }
    });
 
    if (!usuario) {
      throw new AppError('Credenciais inválidas', 401);
    }
 
    if (!usuario.ativo) {
      throw new AppError('Usuário inativo', 403);
    }
 
    const senhaValida = await bcrypt.compare(data.senha, usuario.senhaHash);
 
    if (!senhaValida) {
      throw new AppError('Credenciais inválidas', 401);
    }
 
    const token = gerarToken({
      sub: usuario.id,
      email: usuario.email
    });
 
    return { token };
  }
}
