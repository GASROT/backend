# AgroShop Backend

API do AgroShop, marketplace B2C/B2B para venda de fertilizantes, defensivos agricolas, sementes, itens de irrigacao, maquinario e outros insumos do agronegocio.

Este backend e uma aplicacao NestJS com TypeScript e Prisma ORM, exposta por padrao em `/api/v1`. A API centraliza regras de negocio sensiveis do marketplace, como validacao de CPF/CNPJ, catalogo, carrinho, checkout, pedidos e integracao com banco PostgreSQL.

## Stack

- Node.js LTS
- NestJS
- TypeScript strict
- Prisma ORM
- PostgreSQL
- class-validator e class-transformer
- Jest
- Docker e Docker Compose

## Modulos principais

- `auth`: autenticacao e validacao de documentos.
- `admin`: metricas administrativas, cadastro de produtos e gestao do ciclo de pedidos.
- `catalog`: consulta e regras de catalogo de produtos.
- `cart`: gerenciamento de carrinho.
- `checkout`: finalizacao de compra e criacao de pedido.
- `orders`: consulta e acompanhamento de pedidos.
- `profile`: dados de perfil do usuario.
- `common/prisma`: modulo compartilhado de acesso ao Prisma.
- `config`: validacao das variaveis de ambiente.

## Pre-requisitos

- Node.js 22 ou LTS compativel
- npm
- PostgreSQL 16, ou Docker com Docker Compose

## Variaveis de ambiente

Crie um arquivo `.env` dentro da pasta `backend` usando `.env.example` como base:

```bash
cp .env.example .env
```

Variaveis usadas pela aplicacao:

| Variavel | Obrigatoria | Descricao |
| --- | --- | --- |
| `DATABASE_URL` | Sim | URL de conexao PostgreSQL usada pelo Prisma. |
| `PORT` | Nao | Porta HTTP da API quando executada diretamente. Padrao: `3000`. |
| `CORS_ORIGIN` | Nao | Lista de origens permitidas separadas por virgula. Se ausente, o CORS fica aberto no ambiente local. |

Variaveis auxiliares usadas pelo `docker-compose.yml`:

| Variavel | Descricao |
| --- | --- |
| `POSTGRES_USER` | Usuario do container PostgreSQL. |
| `POSTGRES_PASSWORD` | Senha do container PostgreSQL. |
| `POSTGRES_DB` | Banco criado no container PostgreSQL. |
| `POSTGRES_PORT` | Porta exposta do PostgreSQL no host. |
| `API_PORT` | Porta exposta da API via Docker Compose. O compose repassa este valor para `PORT`. |

Exemplo para rodar localmente sem Docker:

```env
DATABASE_URL="postgresql://agroshop:agroshop@localhost:5432/agroshop?schema=public"
PORT=3000
CORS_ORIGIN="http://localhost:8081,http://127.0.0.1:8081"
```

## Como iniciar com Docker Compose

Na raiz do monorepo:

```bash
docker compose up --build
```

O compose sobe:

- `postgres`: banco PostgreSQL com healthcheck.
- `backend`: API NestJS, executando migrations, seed e depois `node dist/main.js`.

Depois de subir, valide a saude da API:

```bash
curl http://localhost:3000/api/v1/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "agroshop-api",
  "timestamp": "..."
}
```

## Como iniciar localmente

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependencias:

```bash
npm install
```

Gere o Prisma Client:

```bash
npm run prisma:generate
```

Execute as migrations:

```bash
npm run prisma:migrate
```

Popule o banco com dados iniciais:

```bash
npm run prisma:seed
```

Inicie a API em modo desenvolvimento:

```bash
npm run start:dev
```

Por padrao, a API fica disponivel em:

```text
http://localhost:3000/api/v1
```

## Scripts disponiveis

| Script | Descricao |
| --- | --- |
| `npm run start` | Inicia a aplicacao via Nest CLI. |
| `npm run start:dev` | Inicia em modo desenvolvimento com watch. |
| `npm run build` | Compila o backend para `dist/`. |
| `npm run start:prod` | Executa a versao compilada em `dist/main.js`. |
| `npm run docker:start` | Fluxo usado no container: migrations, seed e start de producao. |
| `npm run prisma:generate` | Gera o Prisma Client. |
| `npm run prisma:migrate` | Executa `prisma migrate dev`. |
| `npm run prisma:seed` | Executa o seed configurado no Prisma. |
| `npm run typecheck` | Executa verificacao de tipos TypeScript sem emitir arquivos. |
| `npm run test` | Executa testes com Jest. |
| `npm run test:ci` | Executa Jest em modo CI, aceitando projeto ainda sem testes. |

## Banco de dados e Prisma

O schema principal fica em:

```text
prisma/schema.prisma
```

As migrations ficam em:

```text
prisma/migrations
```

Regras importantes:

- Mudancas no schema devem ser feitas via migration.
- Nao edite arquivos gerados pelo Prisma.
- Revise migrations antes de versionar, principalmente alteracoes destrutivas.
- Nunca use credenciais reais no `.env` versionado.

## Seguranca e arquitetura

- Todas as entradas externas devem passar por DTOs com validacao.
- Controllers devem tratar apenas detalhes HTTP.
- Regras de negocio ficam em services.
- Acesso ao banco deve passar por Prisma e services/repositories apropriados.
- A API usa `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e `transform`.
- Dados sensiveis, tokens, senhas, CPF/CNPJ e dados de cartao nao devem aparecer em logs.

## Rotas base

- Base da API: `/api/v1`
- Healthcheck: `GET /api/v1/health`
- Login: `POST /api/v1/auth/login`
- Metricas admin: `GET /api/v1/admin/metrics` com `Authorization: Bearer <accessToken>`
- Criar produto admin: `POST /api/v1/admin/products` com `Authorization: Bearer <accessToken>`
- Pedidos admin: `GET /api/v1/admin/orders` com `Authorization: Bearer <accessToken>`
- Atualizar status admin: `PATCH /api/v1/admin/orders/:id/status` com `Authorization: Bearer <accessToken>`

## Credenciais demo

As credenciais abaixo sao criadas pela seed do Prisma para desenvolvimento local:

| Perfil | E-mail | Senha | Redirecionamento |
| --- | --- | --- | --- |
| Cliente | `cliente@agroshop.com.br` | `Cliente@12345` | App principal |
| Administrador | `admin@agroshop.com.br` | `Admin@12345` | Dashboard administrativo |

## Validacao antes de abrir PR

Execute dentro de `backend`:

```bash
npm run typecheck
npm run test:ci
npm run build
```

Se a alteracao afetar banco, execute tambem:

```bash
npm run prisma:generate
npm run prisma:migrate
```
