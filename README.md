# SIRDE — Sistema de Rastreabilidade de Dentes

> Frontend do sistema de biobanco odontológico para gestão, rastreamento e cessão de dentes humanos doados.

---

## O Problema

Estudantes de Odontologia precisam de dentes humanos reais para realizar atividades laboratoriais pré-clínicas, treinamentos práticos, pesquisas científicas e aulas com simuladores. Sem acesso a esses materiais em quantidade e variedade suficiente, o aprendizado torna-se incompleto e superficial.

Durante anos, a ausência de uma estrutura organizada para coleta, higienização, armazenamento e distribuição de dentes deixou instituições de ensino sem condições adequadas de treinar seus alunos. Dentes extraídos eram obtidos de forma informal, sem rastreabilidade, sem controle de biossegurança e, em muitos casos, de maneira ilegal — ferindo o artigo 210 do Código Penal e a Lei dos Transplantes (Lei nº 9.434/1997), que classifica tecidos humanos como material protegido pelo Estado.

### Impacto Social

A falta de prática adequada durante a formação gera profissionais com insegurança técnica ao entrar no mercado de trabalho. Estudos e relatos do setor apontam que:

- Recém-formados em Odontologia relatam dificuldade de execução de procedimentos que exigem habilidade manual desenvolvida em laboratório com material humano real.
- O mercado acumula profissionais tecnicamente deficientes para procedimentos que dependem de sensibilidade tátil e visual aprendida com dentes naturais — algo que manequins sintéticos não reproduzem fielmente.
- Pacientes que buscam tratamento em clínicas-escola ou com recém-formados sem prática suficiente estão sujeitos a procedimentos de menor qualidade.
- A ausência de bancos regulamentados alimenta o comércio clandestino de dentes humanos, com riscos de infecção cruzada e violação de direitos.

De acordo com pesquisas publicadas no *Brazilian Journal of Health Review* e no *Journal of Medical and Biosciences Research*, os Biobancos de Dentes Humanos (BDH) surgiram como resposta direta a esse cenário: entidades sem fins lucrativos vinculadas a instituições de ensino superior, responsáveis por toda a cadeia — recebimento, higienização, catalogação, armazenamento e distribuição ética dos dentes doados.

### O SIRDE como solução

O **SIRDE** (Sistema de Rastreabilidade de Dentes) é a plataforma digital que viabiliza a operação de um biobanco com controle total do ciclo de vida de cada dente. Desde o momento da doação, passando pela higienização, triagem, armazenamento, solicitação de uso e cessão para instituições, tudo fica registrado, rastreável e auditável — garantindo conformidade legal, biossegurança e transparência operacional.

---

## Visão Geral do Sistema

O SIRDE é uma aplicação web desenvolvida para clínicas, dentistas, gestores de biobanco e instituições de ensino que participam do ciclo de doação e uso de dentes humanos. O sistema cobre:

- Cadastro e rastreamento completo de dentes com histórico de movimentações e status
- Gestão de doadores com privacidade (CPF armazenado apenas como hash + 4 últimos dígitos)
- Controle de remessas recebidas vinculadas a clínicas de origem
- Fluxo de solicitações com workflow de análise, aprovação e recusa
- Registro de cessões para instituições com prazo de uso monitorado
- Painel administrativo com controle de usuários, perfis de acesso e auditoria completa
- Dashboard com métricas de estoque e atividade recente

---

## Stack Tecnológica

| Tecnologia     | Versão |
|----------------|--------|
| React          | 19     |
| Vite           | 7      |
| Ant Design     | 6      |
| React Router   | 7      |
| Axios          | 1      |
| Tailwind CSS   | 4      |
| Day.js         | —      |

Autenticação via **cookie httpOnly** (JWT — access token 5 min / refresh token 7 dias).

---

## Módulos e Funcionalidades

### Dashboard `/home`
Painel inicial com visão geral do sistema: total de dentes em estoque por status, remessas recentes, alertas de estoque e atividade do biobanco.

### Dentes `/dentes`
Listagem paginada de todos os dentes cadastrados com filtros por status e tipo. Permite criar novos dentes (código de rastreio gerado automaticamente no formato `DENTE-AAAA-XXXXXX`), alterar status com registro de motivo e acessar o histórico completo de movimentações de cada unidade.

### Detalhe do Dente `/dentes/:id`
Página dedicada com todas as informações de um dente específico: tipo, condição, doador, remessa de origem, local de armazenamento atual e linha do tempo de movimentações.

### Doadores `/doadores`
Cadastro de doadores com proteção de dados pessoais. O CPF completo nunca é exibido — o sistema armazena apenas hash + 4 últimos dígitos para manter rastreabilidade sem expor dados sensíveis. Permite criação e edição de cadastros.

### Remessas `/remessas`
Controle das remessas de dentes recebidas. Cada remessa é vinculada à clínica de origem e recebe um código gerado automaticamente (`REM-AAAA-XXXXXX`). Permite registro de datas de envio e recebimento.

### Solicitações `/solicitacoes`
Fluxo completo de solicitação de dentes por instituições de ensino. A instituição abre uma solicitação selecionando dentes específicos disponíveis (filtráveis por status: Recebido, Em triagem, Higienizado, Armazenado, etc.) e informando a finalidade (Ensino, Pesquisa, Treinamento ou Outra). Gestores do biobanco podem aprovar ou recusar cada solicitação com registro de motivo.

### Cessões `/cessoes`
Registro de cessões formalizadas de dentes para instituições. Cada cessão vincula uma solicitação aprovada, uma instituição e um dente específico, com prazo de uso monitorado.

### Instituições `/instituicoes`
Cadastro das instituições de ensino parceiras que solicitam e recebem dentes para fins acadêmicos e de pesquisa.

### Clínicas `/clinicas`
Cadastro das clínicas odontológicas que realizam doações de dentes extraídos para o biobanco.

### Dentistas `/dentistas`
Cadastro de dentistas vinculados às clínicas parceiras, incluindo número de CRO e UF de registro.

### Locais de Armazenamento `/locais`
Gestão dos locais físicos onde os dentes são armazenados (freezer, geladeira, nitrogênio, armário, sala, etc.) com identificação de sala, armário, prateleira e caixa para rastreabilidade física precisa.

### Usuários `/usuarios`
Administração de usuários do sistema com controle de perfis de acesso (Admin, Gestor do Biobanco, Operador do Biobanco, Dentista, Instituição). Permite ativar/inativar usuários e alterar perfis.

### Auditoria `/auditoria`
Registro imutável de todas as ações realizadas no sistema: criação de dentes, alterações de status, aprovações, cessões e demais eventos. Cada registro contém o usuário responsável, a data/hora e os dados da operação.

### Perfil `/perfil`
Área do usuário logado para visualização e edição de dados pessoais.

---

## Perfis de Acesso

| Perfil              | Permissões principais                                                |
|---------------------|----------------------------------------------------------------------|
| ADMIN               | Acesso total ao sistema                                              |
| BIOBANCO_GESTOR     | Gestão de dentes, remessas, locais, solicitações, cessões, usuários |
| BIOBANCO_OPERADOR   | Operação diária: dentes, remessas, locais                           |
| DENTISTA            | Visualização de dentes e criação de remessas                        |
| INSTITUICAO         | Abertura e acompanhamento de solicitações                           |

---

## Como Rodar

### Pré-requisitos

- Node.js 20+
- Backend SIRDE rodando em `localhost:3000`

### Instalação

```bash
git clone https://github.com/AntonioPauloFidel/sistema_rastreabilidade_dentario_frontend.git
cd sistema_rastreabilidade_dentario_frontend
npm install
```

### Configuração

```bash
cp .env.example .env
```

> Em desenvolvimento o Vite já faz proxy de `/api` para `localhost:3000` automaticamente.

### Executar

```bash
npm run dev
```

Acesse `http://localhost:5173`.

### Build de produção

```bash
npm run build
```

---

## Estrutura do Projeto

```
src/
├── assets/          # Imagens e recursos estáticos
├── components/      # Componentes reutilizáveis (PageHeader, EmptyState, Breadcrumb...)
├── constants/       # Enums do sistema (STATUS_DENTE, TIPO_DENTE, PERFIL_USUARIO...)
├── contexts/        # AuthContext — estado global de autenticação
├── hooks/           # Hooks customizados (useAuth)
├── layouts/         # LayoutAutenticado (Navbar + Footer) e LayoutPublico
├── pages/
│   ├── Login/       # Tela de login
│   └── modules/     # Páginas protegidas (herdam Navbar + Footer automaticamente)
├── routes/          # AppRoutes, ProtectedRoute, PublicRoute
└── services/        # Chamadas à API (axios) organizadas por domínio
```

---

## Deploy

O sistema é containerizado com Docker. O frontend é servido via Nginx e exposto através de Cloudflare Tunnel. O rebuild e redeploy são feitos via Docker Compose:

```bash
docker compose build frontend
docker compose up -d frontend
docker compose restart nginx
```

---

## Referências

- BRASILEIRA, J. **A importância dos bancos de dentes humanos na odontologia: desafios éticos e legais para o ensino e pesquisa no Brasil**. *Brazilian Journal of Health Review*, 2024. Disponível em: [https://ojs.brazilianjournals.com.br/ojs/index.php/BJHR/article/view/80532](https://ojs.brazilianjournals.com.br/ojs/index.php/BJHR/article/view/80532)

- JOURNALMBR. **A importância dos bancos de dentes humanos na pesquisa e na prática clínica odontológica**. *Journal of Medical and Biosciences Research*, 2024. Disponível em: [https://journalmbr.com.br/index.php/jmbr/article/view/866](https://journalmbr.com.br/index.php/jmbr/article/view/866)

- SCIELO. **Estruturação de um Banco de Dentes Humanos**. *Pesquisa Odontológica Brasileira*, 2001. Disponível em: [http://www.scielo.br/j/pob/a/XH6qLXJYxXr6vcxjX79g3vk/?lang=pt](http://www.scielo.br/j/pob/a/XH6qLXJYxXr6vcxjX79g3vk/?lang=pt)

- UPF. **Dentes humanos são utilizados para o ensino e a pesquisa**. *Universidade de Passo Fundo*, 2022. Disponível em: [https://www.upf.br/noticia/dentes-humanos-sao-utilizados-para-o-ensino-e-a-pesquisa](https://www.upf.br/noticia/dentes-humanos-sao-utilizados-para-o-ensino-e-a-pesquisa)

- PET ODONTOLOGIA UFPEL. **Banco de Dentes Humanos**. Disponível em: [https://wp.ufpel.edu.br/petodonto/banco-de-dentes/](https://wp.ufpel.edu.br/petodonto/banco-de-dentes/)

- RESEARCHGATE. **A importância dos bancos de dentes humanos na odontologia**. Disponível em: [https://www.researchgate.net/publication/392945717](https://www.researchgate.net/publication/392945717_A_importancia_dos_bancos_de_dentes_humanos_na_odontologia_desafios_eticos_e_legais_para_o_ensino_e_pesquisa_no_Brasil)

- BRASIL. **Lei nº 9.434, de 4 de fevereiro de 1997** — Dispõe sobre a remoção de órgãos, tecidos e partes do corpo humano para fins de transplante e tratamento. Disponível em: [https://www.planalto.gov.br/ccivil_03/leis/l9434.htm](https://www.planalto.gov.br/ccivil_03/leis/l9434.htm)

- SURYADENTAL. **Desafios da odontologia: quais são as dificuldades da profissão?** Disponível em: [https://blog.suryadental.com.br/desafios-da-odontologia/](https://blog.suryadental.com.br/desafios-da-odontologia/)

---

## Licença

MIT © 2026 Antonio Paulo Fidel, Savio e Leydson Luis
