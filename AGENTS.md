# AGENTS.md

## Visao geral

Projeto da faculdade para fins de aprendizado, Nexus Full e um e-commerce de jogos com:

- `Frontend/`: React 19 + Vite + TypeScript + Tailwind CSS 4 + Axios + React Router 7
- `Backend/`: Node.js + TypeScript + Express 5 + Sequelize + PostgreSQL + JWT
- `docker-compose.yml`: sobe `db`, `backend` e `frontend`

Interface e mensagens ficam majoritariamente em portugues. Preserve tom, rotulos e textos nesse idioma ao editar UX.

## Estrutura do repositorio

```text
.
├── AGENTS.md
├── .env.example
├── docker-compose.yml
├── DOCKER.md
├── Backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/database/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── __tests__/
└── Frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── services/
    │   └── __tests__/
    └── public/
```

Nao e monorepo com workspace. Frontend e backend rodam como apps separadas.

## Comandos uteis

### Frontend

```bash
cd Frontend
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

### Backend

```bash
cd Backend
npm run dev
npm run build
npm run lint
npm run test
npm run db:migrate
npm run db:seed
```

### Docker

```bash
docker compose up --build
```

Fluxo Docker de entrega usa Nginx no frontend:

- `Frontend/Dockerfile`: build de produção React/Vite e imagem `nginx:1.27-alpine`
- `Frontend/nginx.conf`: HTTPS, redirect `80 -> 443`, headers de segurança, proxy `/api/` e `/media/` para `backend:3000`
- certificados locais em `.docker/nginx/certs/`
- host customizado esperado: `nexus.store`

## Variaveis e portas

Referencia principal: `.env.example`

- backend local: `PORT=3000`
- frontend local via docker: `https://nexus.store`
- frontend alternativo via docker: `https://localhost`
- porta legada `8081`: redireciona para `https://localhost`
- banco local: `5434`
- frontend usa `VITE_API_BASE_URL`, padrao `/api`
- proxy alvo comum: `VITE_API_PROXY_TARGET=http://localhost:3001`
- API via Nginx: `https://nexus.store/api/health`
- API direta backend: `http://localhost:3001/health`

Backend tenta ler env local e tambem `../.env` durante bootstrap.

## Frontend: mapa rapido

Entradas principais:

- `Frontend/src/main.tsx`: monta router e providers
- `Frontend/src/pages/`: paginas de rota
- `Frontend/src/components/`: UI por dominio
- `Frontend/src/services/api.ts`: cliente Axios com token e redirect em `401`
- `Frontend/src/services/http.ts`: normalizacao de erros para mensagens amigaveis
- `Frontend/src/contexts/AuthContext.tsx`: estado global de autenticacao

Rotas relevantes:

- publicas: `/`, `/loja`, `/ofertas`, `/ofertas/:offerId`, `/comofunciona`, `/login`, `/cadastro`, `/loja/:gameId`
- protegidas: `/favoritos`, `/carrinho`, `/checkout`, `/meus-pedidos`, `/configuracoes`
- admin: `/admin/*`

Guards:

- `RequireAuth`
- `RequireAdmin`

Auth no frontend:

- token salvo em `localStorage` chave `token`
- usuario salvo em `localStorage` chave `authUser`
- evento interno: `nexus:auth-changed`
- resposta `401` limpa auth e redireciona para `/login`

Convencoes visuais:

- estilos globais em `Frontend/src/index.css`
- classes utilitarias reaproveitadas: `nexus-page-shell`, `nexus-panel`, `nexus-card`, `nexus-scrollbar`
- visual atual usa fundo escuro, azul como cor de destaque e bastante glass/panel UI

Observacoes de codigo:

- nomes de arquivos misturam portugues e ingles; preserve padrao ja existente no dominio editado
- textos de erro para usuario devem passar pelo padrao de `services/http.ts` quando possivel
- testes atuais concentram-se em `Frontend/src/__tests__/services`

## Backend: mapa rapido

Entradas principais:

- `Backend/src/server.ts`: bootstrap, conexao DB, storage e migracao legada de midia
- `Backend/src/app.ts`: Express, CORS, parsers, `/media`, rotas e middleware de erro
- `Backend/src/routes/index.ts`: registra endpoints

Arquitetura principal:

- `routes/` recebe HTTP
- `controllers/` traduz req/res
- `services/` concentra regra de negocio
- `validators/` valida payload/params
- `models/` define entidades Sequelize
- `middlewares/` trata auth, admin, upload e erros
- `utils/` contem helpers compartilhados

Rotas base expostas:

- `/auth`
- `/admin`
- `/users`
- `/games`
- `/categories`
- `/platforms`
- `/wishlists`
- `/cart`
- `/checkout`
- `/orders`
- `/order-items`
- `/library`
- `/history`
- `/delivered-keys`
- `/reviews`
- `/review-votes`
- `/game-keys`
- `/listings`
- `/promotions`
- `/game-images`
- `/game-tags`
- `/health`

Banco e Sequelize:

- dialect: PostgreSQL
- `underscored: true`
- SSL pode ligar automaticamente em producao
- migrations e seeders ficam em `Backend/src/migrations` e `Backend/src/seeders`

Midia e uploads:

- arquivos servidos em `/media`
- storage local em `Backend/storage/` ou volume bindado no Docker
- ha middlewares especificos para avatar, promocao, plataforma e midia de jogo

## Regras para futuras IAs

1. Leia primeiro arquivos de entrada e dominio afetado antes de editar.
2. Nao assuma monorepo com script unico na raiz; execute comandos dentro de `Frontend/` ou `Backend/`.
3. Preserve textos em portugues na UX, inclusive mensagens de erro.
4. Ao mexer em auth, confira fluxo completo: `services/auth.ts`, `services/api.ts`, `AuthContext.tsx`, guards e backend JWT.
5. Ao mexer em API, mantenha separacao `route -> controller -> service -> validator`.
6. Ao mexer em dados, revise model, migration, validator, service e impacto no frontend.
7. Antes de remover campos ou tabelas, procure uso com `rg`.
8. Preserve convencoes visuais existentes no frontend; nao introduza design fora do padrao sem necessidade.
9. Evite renomear arquivos antigos so por estilo. Projeto ja mistura PT-BR e EN.
10. Se aparecer worktree suja, nao reverta mudancas que nao foram suas.

## Checklist curto antes de concluir mudancas

- frontend compila? `cd Frontend && npm run build`
- backend compila? `cd Backend && npm run build`
- testes do dominio alterado passam?
- rotas protegidas/admin continuam respeitando auth?
- mensagens para usuario continuam em portugues?
- upload/static media continua funcional se mudanca tocar backend?

## Onde procurar por tipo de tarefa

- layout global/nav/footer: `Frontend/src/components/globals/`
- login/cadastro: `Frontend/src/components/login/`, `Frontend/src/components/cadastro/`
- loja, produto, ofertas: `Frontend/src/components/loja/`, `Frontend/src/pages/Loja.tsx`, `Frontend/src/pages/Ofertas.tsx`
- conta do usuario, carrinho, checkout, pedidos: `Frontend/src/components/user/`
- integracao API frontend: `Frontend/src/services/`
- auth backend: `Backend/src/controllers/auth.controller.ts`, `Backend/src/services/auth.service.ts`
- catalogo e jogos backend: `Backend/src/controllers/game.controller.ts`, `Backend/src/services/game.service.ts`
- pedidos/checkout backend: `Backend/src/services/checkout.service.ts`, `Backend/src/services/orders.service.ts`

Use este arquivo como guia rapido. Fonte de verdade continua sendo codigo atual.
ab