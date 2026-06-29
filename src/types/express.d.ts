declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        perfil: import('@prisma/client').PerfilUsuario;
        instituicaoId?: string;
      };
    }
  }
}
 
export {};
