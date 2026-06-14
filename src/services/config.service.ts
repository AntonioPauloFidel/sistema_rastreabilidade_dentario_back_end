import { prisma } from '../prisma/client';

export type ConfigInput = {
  nomeOficial: string;
  sigla: string;
  responsavelTecnico: string;
  email: string;
  telefone?: string | null;
  endereco: string;
  logotipoUrl?: string | null;
};

export class ConfigService {
  private readonly SINGLETON_ID = 'singleton';

  async getConfig() {
    const cfg = await prisma.configuracaoBiobanco.findUnique({
      where: { id: this.SINGLETON_ID }
    });

    return cfg;
  }

  async upsertConfig(data: ConfigInput) {
    const cfg = await prisma.configuracaoBiobanco.upsert({
      where: { id: this.SINGLETON_ID },
      update: {
        nomeOficial: data.nomeOficial,
        sigla: data.sigla,
        responsavelTecnico: data.responsavelTecnico,
        email: data.email,
        telefone: data.telefone ?? null,
        endereco: data.endereco,
        logotipoUrl: data.logotipoUrl ?? null
      },
      create: {
        id: this.SINGLETON_ID,
        nomeOficial: data.nomeOficial,
        sigla: data.sigla,
        responsavelTecnico: data.responsavelTecnico,
        email: data.email,
        telefone: data.telefone ?? null,
        endereco: data.endereco,
        logotipoUrl: data.logotipoUrl ?? null
      }
    });

    return cfg;
  }
}

export const configService = new ConfigService();
