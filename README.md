# Nexus Full
Nexus Full é um e-commerce educativo de jogos feito com React 19, Vite, TypeScript, Tailwind CSS 4, Node.js, Express 5, Sequelize, PostgreSQL, JWT, Docker e Nginx.

This is an academic project developed by **Murilo Pereira Macedo** and **Izaac Eduardo**, students of **Análise e Desenvolvimento de Sistemas**.

> Status: Em desenvolvimento acadêmico. Fluxo principal, API, banco, Docker, Nginx, HTTPS local e painel admin implementados; testes E2E e Husky ainda pendentes conforme rubrica.

## Por Que Esse Projeto Existe
O projeto existe para praticar construção de uma aplicação full stack completa, simulando uma loja de jogos com catálogo, autenticação, carrinho, checkout, pedidos, administração e infraestrutura conteinerizada.
- Aplicar conceitos de frontend, backend, banco de dados, segurança básica e DevOps em um único produto funcional.
- Demonstrar domínio de rotas protegidas, CRUDs, upload de mídia, persistência, proxy reverso, HTTPS local e organização de código por camadas.

## Demonstração Do Fluxo
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fd338ec2-fa29-457d-b402-11b45a3add3f" />


1. Usuário acessa a home, navega para `/loja` e pesquisa jogos disponíveis.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/dfe81638-e5f1-47bc-bcfb-f1d3bf000e11" />


2. Usuário abre `/loja/:gameId`, escolhe plataforma/listing, adiciona ao carrinho e segue para `/checkout`.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2d657028-18ee-437c-b813-12975869ca5b" />


3. Usuário conclui a compra e consulta pedidos e keys em `/meus-pedidos`.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ab8735df-1298-446e-b188-0bf22e7332bf" />


4. Administrador gerencia jogos, categorias, plataformas, ofertas, pedidos e histórico de preços.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a72dc8f3-661e-4d35-96a6-c592dee55eac" />



## Funcionalidades
### Loja E Catálogo
- Listagem de jogos com busca, filtros e navegação para detalhes.
- Página de produto com galeria, informações, plataformas, preço, estoque e ações de compra.
- Ofertas em `/ofertas` e detalhe de promoção em `/ofertas/:offerId`.

### Autenticação E Conta
<img width="1920" height="799" alt="image" src="https://github.com/user-attachments/assets/de02ad13-6073-4e27-a715-7767b23732f3" />

- Cadastro, login e persistência de sessão com JWT.
- Token salvo no frontend e limpeza automática da sessão em resposta `401`.
- Rotas protegidas para favoritos, carrinho, checkout, pedidos e configurações.

### Carrinho, Checkout E Pedidos
> Substitua por uma print da página `/carrinho` mostrando itens selecionados
- Carrinho com itens, quantidades, estoque e total.
- Checkout com criação de pedido e resumo da compra.
- Histórico em `/meus-pedidos`, incluindo pedidos e keys entregues.

### Painel Administrativo
> Substitua por uma print da página `/admin/games` mostrando CRUD de jogos
- Dashboard admin com acesso a módulos operacionais.
- CRUD de jogos, categorias e plataformas.
- Gerenciamento de listings por plataforma, mídias de jogo, ofertas, pedidos e histórico de preço.

### Infraestrutura Docker E Nginx
> Substitua por uma print da página `https://nexus.store` mostrando aplicação rodando via HTTPS local
- `docker-compose.yml` sobe PostgreSQL, backend e frontend.
- Nginx serve build React, redireciona HTTP para HTTPS e faz proxy de `/api/` e `/media/`.
- Headers de segurança configurados no Nginx: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` e `Content-Security-Policy`.

## Rotas Principais
| Rota | Função |
| --- | --- |
| `/` | Home da aplicação |
| `/loja` | Catálogo de jogos |
| `/loja/:gameId` | Detalhes de jogo |
| `/ofertas` | Lista de ofertas |
| `/ofertas/:offerId` | Detalhe de oferta |
| `/comofunciona` | Página explicativa do fluxo |
| `/login` | Login de usuário |
| `/cadastro` | Cadastro de usuário |
| `/favoritos` | Jogos favoritos do usuário autenticado |
| `/carrinho` | Carrinho do usuário autenticado |
| `/checkout` | Finalização de compra |
| `/meus-pedidos` | Pedidos e keys do usuário |
| `/configuracoes` | Configurações de conta |
| `/admin/*` | Painel administrativo protegido |
| `/health` | Health check direto do backend |
| `/api/health` | Health check via Nginx |

## Stack
**Frontend**
- React 19
- Vite
- TypeScript
- Tailwind CSS 4
- Axios
- React Router 7
- Vitest

**Backend**
- Node.js
- TypeScript
- Express 5
- Sequelize
- PostgreSQL
- JWT
- Multer
- Jest

**Infra e desenvolvimento**
- Docker Compose
- PostgreSQL 15
- Nginx 1.27 Alpine
- HTTPS local com certificados em `.docker/nginx/certs/`
- Proxy reverso para `/api/` e `/media/`
- Variáveis de ambiente por `.env.example` e arquivos `.env.*.docker`

## Competências Demonstradas
- Criação de SPA com rotas públicas, protegidas e administrativas.
- Integração frontend-backend com Axios, JWT e tratamento de erro amigável.
- Organização backend por `routes`, `controllers`, `services`, `validators`, `models` e `middlewares`.
- Modelagem relacional com Sequelize, migrations, seeders e PostgreSQL.
- CRUDs administrativos, upload de mídia e serviço estático em `/media`.
- Carrinho, checkout, pedidos, keys entregues, favoritos, avaliações e histórico.
- Docker Compose com serviços separados, health checks, volumes persistentes e rede nomeada.
- Nginx com HTTPS local, redirect HTTP para HTTPS, proxy reverso e headers de segurança.
- Uso de GitFlow conforme rubrica, com branches `main`, `dev`, `release`, `feature` e `hotfix`.

## Como Rodar Localmente
```bash
# 1. Copie os exemplos de ambiente e ajuste valores sensíveis
cp .env.example .env
cp .env.db.docker.example .env.db.docker
cp .env.backend.docker.example .env.backend.docker
cp .env.frontend.docker.example .env.frontend.docker

# 2. Suba banco, backend e frontend com Docker
docker compose up --build

# 3. Acesse
# Frontend via HTTPS local: https://nexus.store
# Alternativa: https://localhost
# API via Nginx: https://nexus.store/api/health
# API direta: http://localhost:3001/health
```

```bash
# Frontend em desenvolvimento
cd Frontend
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

```bash
# Backend em desenvolvimento
cd Backend
npm install
npm run dev
npm run build
npm run lint
npm run test
npm run db:migrate
npm run db:seed
```

## Autores
**Murilo Pereira Macedo** — Tecnólogo em Análise e Desenvolvimento de Sistemas.  
**Izaac Eduardo** — Tecnólogo em Análise e Desenvolvimento de Sistemas.
