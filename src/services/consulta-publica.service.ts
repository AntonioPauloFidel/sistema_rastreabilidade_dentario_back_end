import { prisma } from '../prisma/client';
import { hashCpf } from '../utils/hash';

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
  async consultar(cpf: string, ip?: string) {
    const cpfHash = hashCpf(cpf);

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

    const dentes = doador?.dentes.map((dente) => ({
      codigoPublico: dente.codigoRastreio,
      statusResumo: statusPublico[dente.statusAtual],
      ultimaAtualizacao: dente.atualizadoEm.toISOString().slice(0, 10)
    })) ?? [];

    await prisma.consultaPublica.create({
      data: {
        cpfHash,
        ipHash: ip ? hashCpf(ip) : undefined,
        encontrado: dentes.length > 0,
        quantidadeRegistros: dentes.length
      }
    });

    return {
      encontrado: dentes.length > 0,
      quantidadeRegistros: dentes.length,
      dentes
    };
  }
}
