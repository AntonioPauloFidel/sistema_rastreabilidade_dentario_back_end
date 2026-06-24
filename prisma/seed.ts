import { PerfilUsuario, TipoInstituicao, TipoDente, CondicaoDente, StatusDente, FinalidadeSolicitacao, StatusSolicitacao } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

function hashCpf(cpf: string) {
  return createHash('sha256').update(cpf.replace(/\D/g, '')).digest('hex');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Iniciando seed...');

  // ── Usuários ────────────────────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash('Senha@123', 10);

  const admin = await prisma.usuario.upsert({
    where: { id: 'seed-admin-0001' },
    update: {},
    create: {
      id: 'seed-admin-0001',
      senhaHash,
      perfil: PerfilUsuario.ADMIN,
      pessoa: { create: { nome: 'Admin SIRDE', email: 'admin@sirde.com' } },
    },
  });

  const gestor = await prisma.usuario.upsert({
    where: { id: 'seed-gestor-001' },
    update: {},
    create: {
      id: 'seed-gestor-001',
      senhaHash,
      perfil: PerfilUsuario.BIOBANCO_GESTOR,
      pessoa: { create: { nome: 'Maria Gestora', email: 'gestora@sirde.com' } },
    },
  });

  const operador = await prisma.usuario.upsert({
    where: { id: 'seed-operad-001' },
    update: {},
    create: {
      id: 'seed-operad-001',
      senhaHash,
      perfil: PerfilUsuario.BIOBANCO_OPERADOR,
      pessoa: { create: { nome: 'João Operador', email: 'operador@sirde.com' } },
    },
  });

  const auditor = await prisma.usuario.upsert({
    where: { id: 'seed-audito-001' },
    update: {},
    create: {
      id: 'seed-audito-001',
      senhaHash,
      perfil: PerfilUsuario.AUDITOR,
      pessoa: { create: { nome: 'Carlos Auditor', email: 'auditor@sirde.com' } },
    },
  });

  console.log('✓ Usuários criados');

  // ── Configuração do biobanco ─────────────────────────────────────────────────
  await prisma.configuracaoBiobanco.upsert({
    where: { id: 'seed-config-0001' },
    update: {},
    create: {
      id: 'seed-config-0001',
      nomeOficial: 'Biobanco de Dentes Humanos da UnB',
      sigla: 'BDH-UnB',
      responsavelTecnico: 'Prof. Dr. Ricardo Alves',
      email: 'biobanco@unb.br',
      endereco: 'Campus Darcy Ribeiro, Asa Norte, Brasília-DF',
    },
  });

  console.log('✓ Configuração criada');

  // ── Instituições ─────────────────────────────────────────────────────────────
  const inst1 = await prisma.instituicao.upsert({
    where: { cnpj: '12345678000195' },
    update: {},
    create: {
      nome: 'Faculdade de Odontologia de Brasília',
      tipo: TipoInstituicao.FACULDADE,
      cnpj: '12345678000195',
      email: 'odonto@fob.edu.br',
      telefone: '(61) 3333-1111',
    },
  });

  const inst2 = await prisma.instituicao.upsert({
    where: { cnpj: '98765432000188' },
    update: {},
    create: {
      nome: 'Laboratório de Pesquisa Dental DF',
      tipo: TipoInstituicao.LABORATORIO,
      cnpj: '98765432000188',
      email: 'contato@labdental.com.br',
      telefone: '(61) 3222-9900',
    },
  });

  const inst3 = await prisma.instituicao.upsert({
    where: { cnpj: '11223344000177' },
    update: {},
    create: {
      nome: 'Escola Técnica de Saúde do DF',
      tipo: TipoInstituicao.ESCOLA,
      cnpj: '11223344000177',
      email: 'saude@etecdf.edu.br',
      telefone: '(61) 3111-5566',
    },
  });

  console.log('✓ Instituições criadas');

  // ── Clínicas ─────────────────────────────────────────────────────────────────
  const clinica1 = await prisma.clinica.upsert({
    where: { id: 'seed-clinic-0001' },
    update: {},
    create: {
      id: 'seed-clinic-0001',
      nome: 'Clínica Sorriso Pleno',
      cnpj: '55667788000111',
      responsavel: 'Dr. Paulo Mendes',
      email: 'contato@sorrisopleno.com.br',
      telefone: '(61) 3444-2222',
    },
  });

  const clinica2 = await prisma.clinica.upsert({
    where: { id: 'seed-clinic-0002' },
    update: {},
    create: {
      id: 'seed-clinic-0002',
      nome: 'OdontoCenter Asa Sul',
      cnpj: '99887766000122',
      responsavel: 'Dra. Ana Lima',
      email: 'info@odontocenter.com.br',
      telefone: '(61) 3555-8877',
    },
  });

  console.log('✓ Clínicas criadas');

  // ── Dentistas ─────────────────────────────────────────────────────────────────
  const dent1 = await prisma.dentista.upsert({
    where: { id: 'seed-dentis-0001' },
    update: {},
    create: {
      id: 'seed-dentis-0001',
      nome: 'Dr. Paulo Mendes',
      cro: 'DF-12345',
      ufCro: 'DF',
      email: 'paulo.mendes@sorrisopleno.com.br',
      telefone: '(61) 99111-2233',
      clinicaId: clinica1.id,
    },
  });

  const dent2 = await prisma.dentista.upsert({
    where: { id: 'seed-dentis-0002' },
    update: {},
    create: {
      id: 'seed-dentis-0002',
      nome: 'Dra. Ana Lima',
      cro: 'DF-54321',
      ufCro: 'DF',
      email: 'ana.lima@odontocenter.com.br',
      telefone: '(61) 99222-3344',
      clinicaId: clinica2.id,
    },
  });

  const dent3 = await prisma.dentista.upsert({
    where: { id: 'seed-dentis-0003' },
    update: {},
    create: {
      id: 'seed-dentis-0003',
      nome: 'Dr. Felipe Souza',
      cro: 'DF-99001',
      ufCro: 'DF',
      email: 'felipe.souza@odontocenter.com.br',
      clinicaId: clinica2.id,
    },
  });

  console.log('✓ Dentistas criados');

  // ── Doadores ─────────────────────────────────────────────────────────────────
  const doador1 = await prisma.doador.upsert({
    where: { cpfHash: hashCpf('12345678901') },
    update: {},
    create: {
      id: 'seed-doador-0001',
      cpfHash: hashCpf('12345678901'),
      cpfUltimos4: '8901',
      nome: 'Roberto Ferreira',
      dataNascimento: new Date('1985-03-15'),
      contato: '(61) 98888-7766',
    },
  });

  const doador2 = await prisma.doador.upsert({
    where: { cpfHash: hashCpf('98765432100') },
    update: {},
    create: {
      id: 'seed-doador-0002',
      cpfHash: hashCpf('98765432100'),
      cpfUltimos4: '2100',
      nome: 'Cláudia Santos',
      dataNascimento: new Date('1992-07-22'),
      contato: '(61) 97777-5544',
    },
  });

  const doador3 = await prisma.doador.upsert({
    where: { cpfHash: hashCpf('11122233344') },
    update: {},
    create: {
      id: 'seed-doador-0003',
      cpfHash: hashCpf('11122233344'),
      cpfUltimos4: '3344',
      nome: 'Marcos Oliveira',
      dataNascimento: new Date('1978-11-08'),
      contato: '(61) 96666-3322',
    },
  });

  console.log('✓ Doadores criados');

  // ── Termos de consentimento ──────────────────────────────────────────────────
  await prisma.termoConsentimento.upsert({
    where: { id: 'seed-termo-00001' },
    update: {},
    create: {
      id: 'seed-termo-00001',
      doadorId: doador1.id,
      tipo: 'DOACAO_DENTES',
      versao: '2.0',
      dataAssinatura: new Date('2025-01-10'),
      validade: new Date('2027-01-10'),
    },
  });

  await prisma.termoConsentimento.upsert({
    where: { id: 'seed-termo-00002' },
    update: {},
    create: {
      id: 'seed-termo-00002',
      doadorId: doador2.id,
      tipo: 'DOACAO_DENTES',
      versao: '2.0',
      dataAssinatura: new Date('2025-03-20'),
    },
  });

  await prisma.termoConsentimento.upsert({
    where: { id: 'seed-termo-00003' },
    update: {},
    create: {
      id: 'seed-termo-00003',
      doadorId: doador3.id,
      tipo: 'DOACAO_DENTES',
      versao: '2.1',
      dataAssinatura: new Date('2025-05-05'),
      validade: new Date('2027-05-05'),
    },
  });

  console.log('✓ Termos de consentimento criados');

  // ── Locais de armazenamento ──────────────────────────────────────────────────
  const local1 = await prisma.localArmazenamento.upsert({
    where: { id: 'seed-local-00001' },
    update: {},
    create: {
      id: 'seed-local-00001',
      nome: 'Freezer A',
      tipo: 'FREEZER',
      sala: 'Sala 101',
      armario: 'Armário 1',
      prateleira: 'P1',
      caixa: 'CX-001',
    },
  });

  const local2 = await prisma.localArmazenamento.upsert({
    where: { id: 'seed-local-00002' },
    update: {},
    create: {
      id: 'seed-local-00002',
      nome: 'Freezer B',
      tipo: 'FREEZER',
      sala: 'Sala 101',
      armario: 'Armário 2',
      prateleira: 'P2',
      caixa: 'CX-002',
    },
  });

  const local3 = await prisma.localArmazenamento.upsert({
    where: { id: 'seed-local-00003' },
    update: {},
    create: {
      id: 'seed-local-00003',
      nome: 'Estufa de Esterilização',
      tipo: 'ESTUFA',
      sala: 'Sala 102',
    },
  });

  const local4 = await prisma.localArmazenamento.upsert({
    where: { id: 'seed-local-00004' },
    update: {},
    create: {
      id: 'seed-local-00004',
      nome: 'Bancada de Triagem',
      tipo: 'BANCADA',
      sala: 'Sala 103',
    },
  });

  console.log('✓ Locais de armazenamento criados');

  // ── Remessas de entrada ──────────────────────────────────────────────────────
  const remessa1 = await prisma.remessaEntrada.upsert({
    where: { codigo: 'REM-2025-001' },
    update: {},
    create: {
      codigo: 'REM-2025-001',
      origemTipo: 'CLINICA',
      dataEnvio: new Date('2025-02-01'),
      dataRecebimento: new Date('2025-02-03'),
      clinicaId: clinica1.id,
    },
  });

  const remessa2 = await prisma.remessaEntrada.upsert({
    where: { codigo: 'REM-2025-002' },
    update: {},
    create: {
      codigo: 'REM-2025-002',
      origemTipo: 'CLINICA',
      dataEnvio: new Date('2025-04-10'),
      dataRecebimento: new Date('2025-04-12'),
      clinicaId: clinica2.id,
    },
  });

  const remessa3 = await prisma.remessaEntrada.upsert({
    where: { codigo: 'REM-2025-003' },
    update: {},
    create: {
      codigo: 'REM-2025-003',
      origemTipo: 'DOACAO_DIRETA',
      dataEnvio: new Date('2025-06-01'),
      dataRecebimento: new Date('2025-06-01'),
    },
  });

  console.log('✓ Remessas criadas');

  // ── Dentes ───────────────────────────────────────────────────────────────────
  const dentesData = [
    // Remessa 1 — Clínica Sorriso Pleno
    { id: 'seed-dente-00001', codigo: 'BDH-2025-0001', tipo: TipoDente.INCISIVO,  condicao: CondicaoDente.INTEGRO,     status: StatusDente.ARMAZENADO,  local: local1.id, remessa: remessa1.id, doador: doador1.id, numeracao: '11' },
    { id: 'seed-dente-00002', codigo: 'BDH-2025-0002', tipo: TipoDente.INCISIVO,  condicao: CondicaoDente.INTEGRO,     status: StatusDente.ARMAZENADO,  local: local1.id, remessa: remessa1.id, doador: doador1.id, numeracao: '21' },
    { id: 'seed-dente-00003', codigo: 'BDH-2025-0003', tipo: TipoDente.CANINO,    condicao: CondicaoDente.RESTAURADO,  status: StatusDente.HIGIENIZADO, local: local4.id, remessa: remessa1.id, doador: doador1.id, numeracao: '13' },
    { id: 'seed-dente-00004', codigo: 'BDH-2025-0004', tipo: TipoDente.MOLAR,     condicao: CondicaoDente.CARIADO,     status: StatusDente.EM_TRIAGEM,  local: local4.id, remessa: remessa1.id, doador: doador1.id, numeracao: '36' },
    { id: 'seed-dente-00005', codigo: 'BDH-2025-0005', tipo: TipoDente.PRE_MOLAR, condicao: CondicaoDente.INTEGRO,     status: StatusDente.ESTERILIZADO, local: local3.id, remessa: remessa1.id, doador: doador1.id, numeracao: '14' },
    // Remessa 2 — OdontoCenter
    { id: 'seed-dente-00006', codigo: 'BDH-2025-0006', tipo: TipoDente.MOLAR,     condicao: CondicaoDente.INTEGRO,     status: StatusDente.ARMAZENADO,  local: local2.id, remessa: remessa2.id, doador: doador2.id, numeracao: '46' },
    { id: 'seed-dente-00007', codigo: 'BDH-2025-0007', tipo: TipoDente.MOLAR,     condicao: CondicaoDente.FRAGMENTADO, status: StatusDente.DESCARTADO,  local: null,      remessa: remessa2.id, doador: doador2.id, numeracao: '47' },
    { id: 'seed-dente-00008', codigo: 'BDH-2025-0008', tipo: TipoDente.DECIDUO,   condicao: CondicaoDente.INTEGRO,     status: StatusDente.ARMAZENADO,  local: local2.id, remessa: remessa2.id, doador: doador2.id, numeracao: '51' },
    { id: 'seed-dente-00009', codigo: 'BDH-2025-0009', tipo: TipoDente.DECIDUO,   condicao: CondicaoDente.INTEGRO,     status: StatusDente.ARMAZENADO,  local: local2.id, remessa: remessa2.id, doador: doador2.id, numeracao: '52' },
    { id: 'seed-dente-00010', codigo: 'BDH-2025-0010', tipo: TipoDente.CANINO,    condicao: CondicaoDente.INTEGRO,     status: StatusDente.RESERVADO,   local: local1.id, remessa: remessa2.id, doador: doador2.id, numeracao: '23' },
    // Remessa 3 — Doação direta
    { id: 'seed-dente-00011', codigo: 'BDH-2025-0011', tipo: TipoDente.INCISIVO,  condicao: CondicaoDente.INTEGRO,     status: StatusDente.RECEBIDO,    local: null,      remessa: remessa3.id, doador: doador3.id, numeracao: '12' },
    { id: 'seed-dente-00012', codigo: 'BDH-2025-0012', tipo: TipoDente.PRE_MOLAR, condicao: CondicaoDente.RESTAURADO,  status: StatusDente.HIGIENIZADO, local: local4.id, remessa: remessa3.id, doador: doador3.id, numeracao: '24' },
    { id: 'seed-dente-00013', codigo: 'BDH-2025-0013', tipo: TipoDente.MOLAR,     condicao: CondicaoDente.INTEGRO,     status: StatusDente.ESTERILIZADO, local: local3.id, remessa: remessa3.id, doador: doador3.id, numeracao: '37' },
    { id: 'seed-dente-00014', codigo: 'BDH-2025-0014', tipo: TipoDente.INCISIVO,  condicao: CondicaoDente.INTEGRO,     status: StatusDente.CEDIDO,      local: null,      remessa: remessa3.id, doador: doador3.id, numeracao: '22' },
    { id: 'seed-dente-00015', codigo: 'BDH-2025-0015', tipo: TipoDente.CANINO,    condicao: CondicaoDente.CARIADO,     status: StatusDente.EM_TRIAGEM,  local: local4.id, remessa: remessa3.id, doador: doador3.id, numeracao: '43' },
  ];

  for (const d of dentesData) {
    await prisma.dente.upsert({
      where: { codigoRastreio: d.codigo },
      update: {},
      create: {
        id: d.id,
        codigoRastreio: d.codigo,
        tipo: d.tipo,
        numeracao: d.numeracao,
        condicao: d.condicao,
        statusAtual: d.status,
        localAtualId: d.local,
        remessaId: d.remessa,
        doadorId: d.doador,
      },
    });
  }

  console.log('✓ 15 dentes criados');

  // ── Solicitações ─────────────────────────────────────────────────────────────
  const sol1 = await prisma.solicitacaoDente.upsert({
    where: { id: 'seed-solici-00001' },
    update: {},
    create: {
      id: 'seed-solici-00001',
      instituicaoId: inst1.id,
      finalidade: FinalidadeSolicitacao.ENSINO,
      justificativa: 'Necessitamos de dentes para aulas práticas de endodontia no curso de graduação.',
      status: StatusSolicitacao.APROVADA,
      motivoDecisao: 'Solicitação dentro dos critérios do biobanco.',
      itens: {
        create: [
          { tipoDente: TipoDente.INCISIVO, quantidade: 3, requisitos: 'Preferencialmente íntegros' },
          { tipoDente: TipoDente.MOLAR,    quantidade: 2 },
        ],
      },
    },
  });

  const sol2 = await prisma.solicitacaoDente.upsert({
    where: { id: 'seed-solici-00002' },
    update: {},
    create: {
      id: 'seed-solici-00002',
      instituicaoId: inst2.id,
      finalidade: FinalidadeSolicitacao.PESQUISA,
      justificativa: 'Pesquisa sobre resistência de materiais restauradores em dentes naturais. Projeto aprovado pelo CEP.',
      status: StatusSolicitacao.PENDENTE_ANALISE,
      itens: {
        create: [
          { tipoDente: TipoDente.PRE_MOLAR, quantidade: 5, requisitos: 'Restaurados ou cariados' },
          { tipoDente: TipoDente.MOLAR,     quantidade: 5 },
        ],
      },
    },
  });

  const sol3 = await prisma.solicitacaoDente.upsert({
    where: { id: 'seed-solici-00003' },
    update: {},
    create: {
      id: 'seed-solici-00003',
      instituicaoId: inst3.id,
      finalidade: FinalidadeSolicitacao.TREINAMENTO,
      justificativa: 'Treinamento de técnicos em radiologia odontológica. Necessitamos de dentes para simulação em manequim.',
      status: StatusSolicitacao.RECUSADA,
      motivoDecisao: 'Documentação incompleta. Reenviar com aprovação do coordenador.',
      itens: {
        create: [
          { tipoDente: TipoDente.INCISIVO, quantidade: 10 },
          { tipoDente: TipoDente.CANINO,   quantidade: 4 },
        ],
      },
    },
  });

  console.log('✓ Solicitações criadas');

  // ── Cessão ───────────────────────────────────────────────────────────────────
  await prisma.cessaoDente.upsert({
    where: { id: 'seed-cessao-00001' },
    update: {},
    create: {
      id: 'seed-cessao-00001',
      solicitacaoId: sol1.id,
      instituicaoId: inst1.id,
      denteId: 'seed-dente-00014',
      prazoUso: new Date('2026-12-31'),
      observacao: 'Dente cedido para uso em aula prática de endodontia — Turma 2025/2.',
    },
  });

  console.log('✓ Cessão criada');

  // ── Movimentações ────────────────────────────────────────────────────────────
  await prisma.movimentacaoDente.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-movm-000001',
        denteId: 'seed-dente-00001',
        statusNovo: StatusDente.RECEBIDO,
        motivo: 'Entrada via remessa REM-2025-001',
        responsavelId: operador.id,
        criadoEm: new Date('2025-02-03'),
      },
      {
        id: 'seed-movm-000002',
        denteId: 'seed-dente-00001',
        statusNovo: StatusDente.HIGIENIZADO,
        motivo: 'Higienização realizada conforme protocolo',
        responsavelId: operador.id,
        criadoEm: new Date('2025-02-05'),
      },
      {
        id: 'seed-movm-000003',
        denteId: 'seed-dente-00001',
        statusNovo: StatusDente.ESTERILIZADO,
        motivo: 'Esterilização em estufa a 180°C por 1 hora',
        destinoLocalId: local3.id,
        responsavelId: operador.id,
        criadoEm: new Date('2025-02-06'),
      },
      {
        id: 'seed-movm-000004',
        denteId: 'seed-dente-00001',
        statusNovo: StatusDente.ARMAZENADO,
        motivo: 'Transferido para armazenamento permanente',
        destinoLocalId: local1.id,
        responsavelId: gestor.id,
        criadoEm: new Date('2025-02-07'),
      },
      {
        id: 'seed-movm-000005',
        denteId: 'seed-dente-00007',
        statusNovo: StatusDente.RECEBIDO,
        motivo: 'Entrada via remessa REM-2025-002',
        responsavelId: operador.id,
        criadoEm: new Date('2025-04-12'),
      },
      {
        id: 'seed-movm-000006',
        denteId: 'seed-dente-00007',
        statusNovo: StatusDente.DESCARTADO,
        motivo: 'Dente fragmentado sem condições de uso',
        responsavelId: gestor.id,
        criadoEm: new Date('2025-04-13'),
      },
      {
        id: 'seed-movm-000007',
        denteId: 'seed-dente-00014',
        statusNovo: StatusDente.CEDIDO,
        motivo: 'Cedido à Faculdade de Odontologia de Brasília — Sol. seed-solici-00001',
        responsavelId: gestor.id,
        criadoEm: new Date('2025-06-15'),
      },
    ],
  });

  console.log('✓ Movimentações criadas');

  console.log('\n✅ Seed concluído com sucesso!\n');
  console.log('Usuários disponíveis (senha: Senha@123):');
  console.log('  admin@sirde.com       → ADMIN');
  console.log('  gestora@sirde.com     → BIOBANCO_GESTOR');
  console.log('  operador@sirde.com    → BIOBANCO_OPERADOR');
  console.log('  auditor@sirde.com     → AUDITOR');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
