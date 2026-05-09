declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        perfil: import('@prisma/client').PerfilUsuario;
      };
    }
  }
}
 
export {};
