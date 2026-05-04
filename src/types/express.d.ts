declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
      };
    }
  }
}
 
export {};
