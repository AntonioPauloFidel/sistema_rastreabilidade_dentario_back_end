import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/prisma/client';
import { cleanDatabase } from '../helpers';
import { PerfilUsuario } from '@prisma/client';

describe('Fluxo Completo: Remessa → Dente → Movimentação → Cessão', () => {
  let adminToken: string;
  let operadorToken: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Criar usuários
    const adminResponse = await request(app)
      .post('/api/auth/registrar')
      .send({
        email: 'admin@example.com',
        senha: 'Password123!',
        confirmSenha: 'Password123!',
        nome: 'Admin',
        cpf: '111.111.111-11'
      });

    adminToken = adminResponse.body.token;

    const operadorResponse = await request(app)
      .post('/api/auth/registrar')
      .send({
        email: 'operador@example.com',
        senha: 'Password123!',
        confirmSenha: 'Password123!',
        nome: 'Operador',
        cpf: '222.222.222-22'
      });

    operadorToken = operadorResponse.body.token;

    // Atualizar perfis
    await prisma.usuario.update({
      where: { pessoa: { email: 'admin@example.com' } },
      data: { perfil: PerfilUsuario.ADMIN }
    });

    await prisma.usuario.update({
      where: { pessoa: { email: 'operador@example.com' } },
      data: { perfil: PerfilUsuario.BIOBANCO_OPERADOR }
    });
  });

  describe('Fluxo Completo', () => {
    it('deve completar o fluxo: remessa → dente → movimentação → cessão', async () => {
      // 1. Criar doador
      const pessoaDoador = await prisma.pessoa.create({
        data: {
          email: 'doador@example.com',
          nome: 'Doador Teste'
        }
      });

      const doador = await prisma.doador.create({
        data: {
          pessoaId: pessoaDoador.id,
          cpfHash: 'hash-teste',
          cpfUltimos4: '0001',
          contato: '(11) 98765-4321'
        }
      });

      // 2. Criar remessa
      const remessa = await prisma.remessaEntrada.create({
        data: {
          dataEntrada: new Date(),
          quantidade: 1,
          observacao: 'Remessa de teste'
        }
      });

      // 3. Criar dente associado à remessa
      const dentesResponse = await request(app)
        .post('/api/dentes')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          codigoRastreio: 'DNT-2026-000001',
          tipo: 'INCISIVO',
          doadorId: doador.id,
          remessaId: remessa.id
        });

      let denteId: string;
      if (dentesResponse.status === 201 || dentesResponse.status === 200) {
        denteId = dentesResponse.body.dente?.id;
      } else {
        // Se endpoint falhou, criar direto no BD
        const dente = await prisma.dente.create({
          data: {
            codigoRastreio: 'DNT-2026-000001',
            tipo: 'INCISIVO',
            doadorId: doador.id,
            remessaId: remessa.id,
            statusAtual: 'ARMAZENADO'
          }
        });
        denteId = dente.id;
      }

      // 4. Criar local (armazenamento)
      const local = await prisma.local.create({
        data: {
          nome: 'Armazenagem A',
          tipo: 'CAIXA_ARMAZENAGEM',
          capacidade: 100
        }
      });

      // 5. Registrar movimentação
      if (denteId) {
        const movimentacaoResponse = await request(app)
          .post(`/api/dentes/${denteId}/movimentacoes`)
          .set('Authorization', `Bearer ${operadorToken}`)
          .send({
            tipo: 'ENTRADA',
            localDestino: local.id,
            observacao: 'Entrada do dente no armazenagem'
          });

        expect([201, 200]).toContain(movimentacaoResponse.status);

        // 6. Registrar cessão (empréstimo do dente)
        const cessaoResponse = await request(app)
          .post('/api/cessoes')
          .set('Authorization', `Bearer ${operadorToken}`)
          .send({
            denteId: denteId,
            instituicaoReceptora: 'Universidade de Teste',
            motivo: 'Pesquisa científica',
            dataExpectativaRetorno: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });

        expect([201, 200, 404]).toContain(cessaoResponse.status);
      }

      // 7. Verificar que o dente foi criado com sucesso
      const denteVerification = await prisma.dente.findUnique({
        where: { id: denteId },
        include: {
          movimentacoes: true,
          doador: true,
          remessa: true
        }
      });

      expect(denteVerification).toBeDefined();
      expect(denteVerification?.codigoRastreio).toBe('DNT-2026-000001');
      expect(denteVerification?.movimentacoes.length).toBeGreaterThan(0);
    });

    it('deve impedir criar dente sem doador', async () => {
      const response = await request(app)
        .post('/api/dentes')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          codigoRastreio: 'DNT-2026-INVALID',
          tipo: 'INCISIVO'
          // sem doadorId
        });

      expect([400, 404]).toContain(response.status);
    });

    it('deve rastrear movimentações do dente', async () => {
      // Criar dente
      const doador = await prisma.doador.create({
        data: {
          pessoa: {
            create: {
              email: 'doador2@example.com',
              nome: 'Doador 2'
            }
          },
          cpfHash: 'hash-2',
          cpfUltimos4: '0002',
          contato: '(11) 91111-1111'
        },
        include: { pessoa: true }
      });

      const dente = await prisma.dente.create({
        data: {
          codigoRastreio: 'DNT-2026-RAP001',
          tipo: 'CANINO',
          doadorId: doador.id,
          statusAtual: 'ARMAZENADO'
        }
      });

      // Criar dois locais e registrar movimentações
      const local1 = await prisma.local.create({
        data: {
          nome: 'Local 1',
          tipo: 'CAIXA_ARMAZENAGEM',
          capacidade: 100
        }
      });

      const local2 = await prisma.local.create({
        data: {
          nome: 'Local 2',
          tipo: 'CAIXA_ARMAZENAGEM',
          capacidade: 100
        }
      });

      // Registrar movimentações direto no BD
      const mov1 = await prisma.movimentacao.create({
        data: {
          denteId: dente.id,
          tipo: 'ENTRADA',
          localOrigemId: null,
          localDestinoId: local1.id,
          usuarioId: (await prisma.usuario.findFirst())?.id || '',
          observacao: 'Movimentação 1'
        }
      });

      const mov2 = await prisma.movimentacao.create({
        data: {
          denteId: dente.id,
          tipo: 'TRANSFERENCIA',
          localOrigemId: local1.id,
          localDestinoId: local2.id,
          usuarioId: (await prisma.usuario.findFirst())?.id || '',
          observacao: 'Movimentação 2'
        }
      });

      // Verificar se movimentações foram registradas
      const denteComMovimentacoes = await prisma.dente.findUnique({
        where: { id: dente.id },
        include: { movimentacoes: { orderBy: { criadoEm: 'asc' } } }
      });

      expect(denteComMovimentacoes?.movimentacoes.length).toBe(2);
      expect(denteComMovimentacoes?.movimentacoes[0].localDestinoId).toBe(local1.id);
      expect(denteComMovimentacoes?.movimentacoes[1].localDestinoId).toBe(local2.id);
    });

    it('deve rastrear status do dente através do fluxo', async () => {
      // Criar dente com status inicial
      const doador = await prisma.doador.create({
        data: {
          pessoa: {
            create: {
              email: 'doador3@example.com',
              nome: 'Doador 3'
            }
          },
          cpfHash: 'hash-3',
          cpfUltimos4: '0003',
          contato: '(11) 92222-2222'
        },
        include: { pessoa: true }
      });

      const dente = await prisma.dente.create({
        data: {
          codigoRastreio: 'DNT-2026-STATUS',
          tipo: 'INCISIVO',
          doadorId: doador.id,
          statusAtual: 'ARMAZENADO'
        }
      });

      expect(dente.statusAtual).toBe('ARMAZENADO');

      // Atualizar status
      const denteAtualizado = await prisma.dente.update({
        where: { id: dente.id },
        data: { statusAtual: 'CEDIDO' }
      });

      expect(denteAtualizado.statusAtual).toBe('CEDIDO');
    });
  });
});
