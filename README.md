# SirdePrisma

API em TypeScript com Express, Prisma e PostgreSQL para autenticação, usuários e endereço do usuário autenticado.

## Escopo Atual

- `POST /api/auth/register`: cadastra usuário e retorna JWT.
- `POST /api/auth/login`: autentica usuário e retorna JWT.
- `GET /api/auth/me`: retorna o usuário autenticado.
- `GET /api/usuarios`: lista usuários sem expor senha.
- `GET /api/usuarios/:id`: busca usuário por ID sem expor senha.
- `GET /api/enderecos/me`: retorna o endereço do usuário autenticado.
- `PUT /api/enderecos/me`: cria ou atualiza o endereço do usuário autenticado.
- `GET /health`: health check da aplicação.

## Arquivos Principais

- `src/app.ts`: configura middlewares globais, health check, rotas e tratamento de erro.
- `src/server.ts`: inicializa o servidor HTTP e encerra conexões do Prisma com segurança.
- `src/config/env.ts`: valida e normaliza variáveis de ambiente antes da aplicação subir.
- `src/prisma/client.ts`: instancia o Prisma Client com adapter PostgreSQL e singleton em desenvolvimento.
- `src/services/auth.service.ts`: concentra regras de cadastro, login, hash de senha e geração de token.
- `src/middlewares/auth.middleware.ts`: protege rotas validando JWT e status ativo do usuário.
- `src/middlewares/error.middleware.ts`: centraliza respostas de erro previsíveis e inesperadas.
- `prisma/schema.prisma`: define os modelos `Usuario` e `Endereco`.

## Setup Local

1. Copie `.env.example` para `.env` e ajuste os valores.
2. Suba o PostgreSQL:

```bash
docker compose up -d
```

3. Aplique migrations e gere o client:

```bash
npm run prisma:migrate:dev
npm run prisma:generate
```

4. Rode em desenvolvimento:

```bash
npm run dev
```

## Validação

```bash
npm run typecheck
npm test
npm run build
```
