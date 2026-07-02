import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';
import { AppError } from '../errors/app-error';
import { usuarioPublicSelect } from '../prisma/selects';
import { env } from '../config/env';
import { paginatedResponse } from '../utils/pagination';
import {
  alterarPerfilUsuarioSchema,
  alterarStatusUsuarioSchema,
  criarUsuarioSchema,
  usuarioListQuerySchema
} from '../schemas/sirde.schema';

export class UsuarioController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = usuarioListQuerySchema.parse(req.query);
      const where: any = {};

      if (filtros.perfil) {
        where.perfil = filtros.perfil;
      }

      if (filtros.ativo !== undefined) {
        where.pessoa = { ativo: filtros.ativo };
      }

      const total = await prisma.usuario.count({ where });
      const usuarios = await prisma.usuario.findMany({
        where,
        select: usuarioPublicSelect,
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit
      });

      return res.status(200).json(paginatedResponse({ data: usuarios, total }, { page: filtros.page, limit: filtros.limit }));
    } catch (error) {
      return next(error);
    }
  }
 
  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = this.getParamId(req.params.id);
 
      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: usuarioPublicSelect
      });
 
      if (!usuario) {
        throw new AppError('Usuário não encontrado', 404);
      }
 
      return res.status(200).json({ usuario });
    } catch (error) {
      return next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = criarUsuarioSchema.parse(req.body);
      const senhaHash = await bcrypt.hash(data.senha, env.BCRYPT_SALT_ROUNDS);

      const usuario = await prisma.usuario.create({
        data: {
          senhaHash,
          perfil: data.perfil,
          pessoa: {
            create: {
              nome: data.nome,
              email: data.email
            }
          }
        },
        select: usuarioPublicSelect
      });

      return res.status(201).json({ usuario });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return next(new AppError('E-mail ja cadastrado', 409));
      }
      return next(error);
    }
  }

  async alterarStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = this.getParamId(req.params.id);
      const { ativo } = alterarStatusUsuarioSchema.parse(req.body);

      const usuario = await prisma.usuario.update({
        where: { id },
        data: {
          pessoa: {
            update: { ativo }
          }
        },
        select: usuarioPublicSelect
      });

      return res.status(200).json({ usuario });
    } catch (error) {
      return next(error);
    }
  }

  async alterarPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const id = this.getParamId(req.params.id);
      const { perfil } = alterarPerfilUsuarioSchema.parse(req.body);

      const usuario = await prisma.usuario.update({
        where: { id },
        data: { perfil },
        select: usuarioPublicSelect
      });

      return res.status(200).json({ usuario });
    } catch (error) {
      return next(error);
    }
  }

  private getParamId(id: string | string[] | undefined) {
    if (!id || Array.isArray(id)) {
      throw new AppError('ID de usuário inválido', 400);
    }

    return id;
  }
}
