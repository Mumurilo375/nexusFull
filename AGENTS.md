# AGENTS.md

## 1. Visão geral

O Nexus Full é um projeto acadêmico de e-commerce de jogos. O objetivo é manter uma aplicação completa, organizada e fácil de explicar durante a apresentação da faculdade.

O projeto possui três aplicações independentes:

- `frontend/`: aplicação web com React 19, Vite, TypeScript, Tailwind CSS 4, Axios e React Router 7;
- `mobile/`: aplicativo React Native com Expo SDK 54, Expo Router e TypeScript;
- `backend/`: API Node.js com TypeScript, Express 5, Sequelize, PostgreSQL, JWT e Multer.

O `docker-compose.yml` integra quatro serviços:

- `db`;
- `backend`;
- `frontend`;
- `mobile`.

Este não é um monorepo com npm workspaces. Cada aplicação mantém seu próprio `package.json` e suas próprias dependências. A raiz possui apenas scripts auxiliares de lint e testes E2E.

Interface, mensagens de erro e documentação do projeto ficam majoritariamente em português. Preserve o tom e os rótulos em português ao alterar qualquer experiência do usuário.

## 2. Princípios do projeto

Ao implementar ou revisar código:

1. prefira soluções simples, tipadas, seguras e fáceis de explicar;
2. mantenha responsabilidades separadas sem criar abstrações desnecessárias;
3. leia os arquivos de entrada e o domínio afetado antes de editar;
4. preserve os padrões já usados naquela parte do projeto;
5. limite a mudança ao pedido do usuário e ao que for necessário para concluí-lo corretamente;
6. corrija problemas próximos apenas quando bloquearem ou prejudicarem diretamente a tarefa;
7. evite refatorações amplas, renomeações cosméticas e trocas de tecnologia sem necessidade;
8. não reverta nem sobrescreva alterações existentes que não sejam suas;
9. confirme o uso de um campo, rota ou arquivo com `rg` antes de removê-lo;
10. trate o código atual como fonte de verdade quando este guia estiver desatualizado.

## 3. Estrutura do repositório

```text
.
├── AGENTS.md
├── README.md
├── PRODUCT.md
├── README_DIAGRAMAS.md
├── rubrica.md
├── .env.example
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── Dockerfile.mobile
├── playwright.config.ts
├── tests/                       # testes E2E com Playwright
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── __tests__/
│   ├── public/
│   ├── nginx.conf
│   └── package.json
├── mobile/
│   ├── app/                     # rotas do Expo Router
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
│   ├── components/              # componentes globais ligados à navegação/home
│   ├── assets/
│   ├── app.config.js
│   └── package.json
└── backend/
    ├── src/
    │   ├── app.ts
    │   ├── server.ts
    │   ├── config/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── migrations/
    │   ├── models/
    │   ├── routes/
    │   ├── seeders/
    │   ├── services/
    │   ├── utils/
    │   └── validators/
    ├── __tests__/
    └── package.json
```

Não mantenha no repositório dependências, builds, caches, dados locais ou segredos. Isso inclui, entre outros:

- `node_modules/`;
- `dist/`, `build/` e relatórios de cobertura;
- `.expo/`;
- `.env` e variações locais;
- uploads em `backend/storage/`;
- volumes e certificados locais dentro de `.docker/`;
- resultados e relatórios do Playwright.

## 4. Comandos do projeto

Execute comandos dentro da aplicação correspondente. Não presuma que existe um único comando de build ou teste para todo o projeto.

### Raiz

```bash
npm run lint:frontend
npm run lint:backend
npm run check
npm run test:e2e
npm run test:e2e:ci
```

Observações:

- `npm run check` executa somente os lints do frontend e backend;
- os testes E2E usam Playwright e podem depender da aplicação e do banco em execução;
- não existe script de build conjunto na raiz.

### Frontend web

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run preview
```

### Backend

```bash
cd backend
npm run dev
npm run build
npm run lint
npm run test
npm run start
npm run db:migrate
npm run db:migrate:undo
npm run db:seed
npm run db:seed:catalog
npm run db:seed:undo
```

No backend, `npm run lint` executa o TypeScript com `--noEmit`. O build compila para `backend/dist/`.

### Aplicativo mobile

```bash
cd mobile
npm run start
npm run android
npm run ios
npm run web
npm run start:tunnel
npm run lint
```

O mobile ainda não possui script próprio de testes automatizados ou typecheck. Não afirme que testes mobile passaram quando somente o lint foi executado.

### Docker

```bash
docker compose up --build
```

Esse comando sobe banco, backend, frontend web e Expo. Para investigar um serviço específico, consulte primeiro `docker-compose.yml` e use comandos Docker não destrutivos sempre que possível.

## 5. Ambiente, Docker e portas

A referência principal de configuração é `.env.example`. O arquivo `.env` real fica na raiz e não deve ser versionado.

### Portas

| Serviço | Porta no container/processo | Acesso no host |
| --- | ---: | --- |
| PostgreSQL | `5432` | `localhost:5434` por padrão |
| Backend | `3000` | `http://localhost:3001` por padrão |
| Frontend HTTP | `80` | redireciona para HTTPS |
| Frontend HTTPS | `443` | `https://nexus.store` ou `https://localhost` |
| Expo/Metro | `8081` | `http://localhost:8081` |
| Portas auxiliares do Expo | `19000–19002` | mesmas portas no host |

A porta `8081` pertence ao Expo/Metro. Ela não é uma porta legada nem redireciona para o frontend web.

### Variáveis importantes

- `PORT`: porta interna usada pelo backend, normalmente `3000`;
- `BACKEND_PORT_HOST`: porta publicada pelo Docker, normalmente `3001`;
- `DB_PORT`: porta do PostgreSQL publicada no host, normalmente `5434`;
- `DOCKER_DB_PORT`: porta interna do PostgreSQL, normalmente `5432`;
- `VITE_API_BASE_URL`: base usada pelo frontend, normalmente `/api`;
- `VITE_API_PROXY_TARGET`: alvo do proxy durante desenvolvimento web;
- `EXPO_PUBLIC_API_URL`: endereço do backend acessível pelo celular;
- `REACT_NATIVE_PACKAGER_HOSTNAME`: IP local da máquina para o Expo Go;
- `JWT_SECRET`: segredo do JWT, nunca exposto ao frontend ou ao mobile;
- `CORS_ORIGINS`: origens permitidas pelo backend.

O backend tenta carregar variáveis locais e também o `.env` da raiz durante o bootstrap. O mobile usa `mobile/app.config.js` para carregar explicitamente o `.env` compartilhado da raiz.

Em um celular físico, `localhost` aponta para o próprio aparelho. Use o IP local da máquina em `EXPO_PUBLIC_API_URL` e `REACT_NATIVE_PACKAGER_HOSTNAME`. Variáveis `EXPO_PUBLIC_*` ficam disponíveis no aplicativo e nunca devem conter segredos.

### Frontend web no Docker

O fluxo principal do Compose usa:

- `frontend/Dockerfile` para gerar a imagem web;
- `frontend/nginx.conf` para HTTPS, SPA fallback e proxy reverso;
- certificados locais em `.docker/nginx/certs/`;
- `/api/` como proxy para `backend:3000`;
- `/media/` como proxy para os arquivos servidos pelo backend.

Existe também um `Dockerfile.frontend` na raiz. Antes de alterá-lo, confirme se ele faz parte do fluxo solicitado, pois o `docker-compose.yml` atual referencia `frontend/Dockerfile`.

Ao mudar variáveis, portas, scripts ou serviços, mantenha sincronizados os arquivos funcionais relacionados, especialmente `.env.example`, `docker-compose.yml`, Dockerfiles e manifests. READMEs só devem ser alterados quando o usuário pedir explicitamente.

## 6. Frontend web

### Pontos de entrada

- `frontend/src/main.tsx`: router, providers, guards e carregamento das páginas;
- `frontend/src/pages/`: composição das páginas de rota;
- `frontend/src/components/`: interface organizada por domínio;
- `frontend/src/contexts/AuthContext.tsx`: estado global de autenticação;
- `frontend/src/services/api.ts`: cliente Axios e tratamento de sessão expirada;
- `frontend/src/services/http.ts`: normalização de erros da API;
- `frontend/src/index.css`: estilos globais e utilitários visuais.

Para confirmar as rotas atuais, leia `frontend/src/main.tsx`. Não dependa de uma lista copiada em documentação.

### Autenticação e autorização

- o token fica em `localStorage` na chave `token`;
- o usuário fica em `localStorage` na chave `authUser`;
- mudanças de sessão usam o evento interno `nexus:auth-changed`;
- uma resposta `401` limpa a sessão e redireciona para `/login`;
- `RequireAuth` protege rotas autenticadas;
- `RequireAdmin` protege a interface administrativa verificando a permissão `admin.access`.

Ao alterar autenticação, revise em conjunto:

- `services/auth.ts`;
- `services/api.ts`;
- `contexts/AuthContext.tsx`;
- guards e navegação;
- contrato de login e JWT no backend.

Um guard no React melhora a experiência, mas não substitui a autorização no backend.

### Interface e serviços

- preserve o visual escuro, o azul como destaque e o padrão de painéis/glass existente;
- reutilize `nexus-page-shell`, `nexus-panel`, `nexus-card` e `nexus-scrollbar` quando apropriado;
- mantenha layout, navegação e rodapé em `frontend/src/components/globals/`;
- use o cliente Axios compartilhado em vez de criar clientes HTTP paralelos;
- passe erros destinados ao usuário pelo padrão de `services/http.ts`;
- preserve estados de carregamento, vazio, erro e sucesso;
- mantenha acessibilidade de teclado, foco, labels e contraste ao alterar componentes.

O projeto mistura nomes de arquivos em português e inglês. Siga o padrão do domínio alterado e não renomeie arquivos antigos apenas para uniformizar estilo.

### Testes web

Os testes unitários existentes concentram-se em `frontend/src/__tests__/services/`. Ao alterar autenticação, armazenamento local ou mensagens da API, atualize ou crie testes nesse domínio.

Os testes E2E ficam em `tests/` na raiz e cobrem fluxos como login, cadastro e CRUD administrativo. Execute-os somente quando o ambiente necessário estiver disponível e a mudança afetar um fluxo coberto ou justificar um novo cenário.

## 7. Aplicativo mobile

### Organização e navegação

- `mobile/app/`: rotas baseadas em arquivos do Expo Router;
- `mobile/app/(tabs)/`: navegação principal por abas;
- `mobile/app/admin/`: rotas administrativas;
- `mobile/src/pages/`: composição das páginas;
- `mobile/src/components/`: componentes por domínio;
- `mobile/src/components/admin/shared/`: layout e controles reutilizados pelo painel;
- `mobile/components/`: componentes globais ligados à home e navegação;
- `mobile/src/contexts/`: autenticação e eventos compartilhados;
- `mobile/src/services/`: API, sessão segura, erros e resolução de assets;
- `mobile/assets/`: imagens empacotadas com o aplicativo.

Para descobrir as telas e parâmetros atuais, consulte `mobile/app/` e use `rg`. Não crie uma segunda fonte manual com todas as rotas.

### API e sessão

- `mobile/src/services/api.ts` usa `fetch`, não Axios;
- a base da API vem de `EXPO_PUBLIC_API_URL`;
- requisições usam timeout, caminhos relativos e tratamento centralizado de erros;
- o token é enviado como Bearer token;
- uma resposta `401` aciona a limpeza da sessão;
- token e usuário são armazenados com `expo-secure-store`;
- em produção, a URL da API deve usar HTTPS.

Não substitua SecureStore por AsyncStorage ou armazenamento inseguro para credenciais. Não registre token, senha ou payload de autenticação em logs.

### Perfis e painel administrativo

- `AuthContext` expõe autenticação e perfil administrativo;
- `AdminGuard` impede acesso visual de usuários comuns;
- a navegação administrativa só deve aparecer para administradores;
- o backend continua responsável pela decisão final de autorização;
- nunca confie em roles ou permissões enviadas pelo cliente.

Ao mudar um fluxo administrativo, valide tanto a interface mobile quanto a rota protegida correspondente no backend.

### Upload de imagens

O mobile usa `expo-image-picker` e envia arquivos em `FormData` para os endpoints compatíveis. Ao alterar uploads:

- mantenha o nome do campo multipart compatível com o middleware Multer;
- preserve URI, MIME e nome do arquivo ao montar o `FormData`;
- trate cancelamento do seletor sem exibir erro;
- mostre estado de envio e mensagem amigável em caso de rejeição;
- verifique o resultado usando a URL de mídia devolvida pela API.

### Compatibilidade e validação manual

Como não existe suíte automatizada mobile configurada, toda alteração de fluxo ou interface deve ter:

- `npm run lint` executado em `mobile/`;
- validação manual do caminho alterado quando houver dispositivo, emulador ou Expo web disponível;
- conferência de carregamento, vazio, erro, sucesso e navegação;
- conferência de áreas de toque, teclado, Safe Area e tamanhos de tela relevantes;
- relato explícito quando a validação manual não puder ser feita.

Não afirme compatibilidade com Android, iOS ou dispositivos específicos sem ter executado ou recebido evidência desses testes.

## 8. Backend

### Pontos de entrada

- `backend/src/server.ts`: bootstrap, banco, storage e migração legada de mídia;
- `backend/src/app.ts`: Express, CORS, parsers, `/media`, rotas e middleware de erro;
- `backend/src/routes/index.ts`: registro atual das rotas base;
- `backend/src/config/database/`: conexão Sequelize;
- `backend/src/models/associations.ts`: associações entre models.

Consulte `backend/src/routes/index.ts` para descobrir os módulos expostos e depois abra o arquivo de rota do domínio. Não mantenha uma lista duplicada de todos os endpoints neste guia.

### Arquitetura da API

Preserve o fluxo principal:

```text
route → controller → service → validator → model/banco
```

Responsabilidades:

- `routes/`: método HTTP, caminho e composição de middlewares;
- `controllers/`: tradução entre HTTP e caso de uso;
- `services/`: regras de negócio, transações e acesso coordenado aos models;
- `validators/`: validação e normalização de params, query e body;
- `models/`: entidades Sequelize e mapeamento do banco;
- `middlewares/`: autenticação, autorização, upload e erros transversais;
- `utils/`: helpers compartilhados sem regra exclusiva de um controller.

Evite colocar regra de negócio diretamente em routes ou controllers. Reutilize `AppError` e a normalização existente de erros em vez de retornar formatos incompatíveis.

### Autenticação e autorização

- `auth.middleware.ts` valida o JWT, confirma que o usuário ainda existe e carrega suas roles e permissões atuais do banco;
- `admin.middleware.ts` aplica autorização RBAC pela permissão exigida em cada rota;
- rotas administrativas devem aplicar autenticação antes da autorização;
- identificadores e privilégios vindos do cliente nunca são fonte confiável;
- respostas devem diferenciar ausência/invalidade de sessão (`401`) de falta de permissão (`403`).

Ao alterar auth, confira login, criação/verificação do JWT, middlewares, tipos de Express, contratos dos clientes e testes em `backend/__tests__/autenticacao/`.

Não inclua tokens, senhas, hashes, secrets ou dados pessoais completos em logs. Remova logs de depuração antes de concluir código destinado à entrega.

### Banco, models e migrations

- banco: PostgreSQL;
- ORM: Sequelize;
- convenção: `underscored: true`;
- migrations: `backend/src/migrations/`;
- seeders: `backend/src/seeders/`;
- SSL pode ser ativado automaticamente em produção.

Para qualquer alteração de schema:

1. não edite migrations antigas;
2. crie uma nova migration com `up` e `down` coerentes;
3. atualize o model correspondente;
4. revise associations, validators e services;
5. procure consumidores no frontend e mobile;
6. avalie seeders e testes afetados;
7. preserve dados existentes sempre que possível.

Não execute undo, exclusão de dados, recriação de banco ou outra ação destrutiva sem pedido explícito e alvo confirmado.

### Mídia e Multer

- arquivos são expostos em `/media`;
- o armazenamento local fica em `backend/storage/` ou no volume configurado pelo Docker;
- os uploads passam primeiro pela área temporária;
- `backend/src/utils/media-storage.ts` move e remove arquivos gerenciados;
- existem middlewares para avatar, jogo, promoção e ícone de plataforma.

Ao criar ou alterar upload de imagem:

- use Multer no middleware da rota;
- defina limite de tamanho e quantidade;
- valide MIME e uma lista explícita de extensões permitidas;
- gere nomes únicos sem confiar no nome original;
- sanitize segmentos usados em caminhos;
- impeça path traversal;
- remova arquivos temporários em falhas;
- mantenha banco e filesystem consistentes em erros/transações;
- devolva mensagens compreensíveis em português ao usuário.

Não confie apenas na extensão enviada pelo cliente. Se o requisito de segurança exigir validação real do conteúdo, inspecione a assinatura do arquivo além do MIME informado.

### Testes do backend

Os testes ficam em `backend/__tests__/`, organizados por domínio. Há cobertura para autenticação, validações comuns, catálogo, usuário e checkout.

Ao alterar uma regra de negócio:

- atualize ou crie o teste no domínio correspondente;
- cubra sucesso e rejeições importantes;
- prefira testar services e validators diretamente quando não for necessário subir a API completa;
- execute apenas o conjunto relacionado durante a implementação e amplie a verificação quando o risco justificar.

## 9. Regras obrigatórias para futuras IAs

1. Leia este arquivo e os pontos de entrada do domínio antes de editar.
2. Use `rg` ou `rg --files` para localizar usos e arquivos.
3. Preserve textos de UX em português, inclusive mensagens de erro.
4. Mantenha frontend web, mobile e backend compatíveis quando um contrato mudar.
5. Não crie um cliente HTTP paralelo quando já existir um serviço compartilhado.
6. Não mova regras de autorização para o cliente; a API sempre deve protegê-las.
7. Não confie em roles, permissões, IDs de usuário, preços ou totais enviados pelo cliente.
8. Use novas migrations para alterações de schema; nunca reescreva o histórico existente.
9. Não versione segredos, ambientes locais, uploads, dependências, caches ou builds.
10. Não faça mudanças visuais amplas ou troque o design system fora do pedido.
11. Não renomeie arquivos antigos somente para padronizar idioma ou estilo.
12. Não altere READMEs automaticamente, salvo solicitação explícita.
13. Sincronize `.env.example`, Dockerfiles, Compose e manifests quando a funcionalidade exigir.
14. Preserve a worktree do usuário e não reverta mudanças alheias.
15. Se encontrar um problema não relacionado, informe-o; só o corrija quando for necessário para a tarefa atual.
16. Registre verificações realmente executadas e nunca declare que algo passou sem executar.
17. Se um teste não puder rodar, explique o motivo e o risco restante.
18. Consulte `rubrica.md` antes de concluir uma implementação que possa afetar a avaliação acadêmica.

## 10. Rubrica acadêmica

O acompanhamento oficial do projeto fica em `rubrica.md`. Não copie toda a rubrica para este arquivo.

Quando uma implementação afetar um critério:

1. atualize o status e as evidências em `rubrica.md`;
2. registre a mudança no histórico daquele arquivo;
3. a implementação existente pode ser marcada como concluída mesmo que prints ou vídeo continuem pendentes;
4. diferencie claramente implementação de evidência para apresentação;
5. não crie diagramas sem solicitação explícita;
6. não marque DER, casos de uso, atividades ou sequências como concluídos sem confirmação do autor, pois esses materiais são produzidos externamente no Excalidraw.

Mudanças apenas neste guia, sem impacto funcional ou nova evidência da rubrica, não exigem alteração em `rubrica.md`.

## 11. Verificações mínimas

Use verificações proporcionais ao módulo e ao risco da mudança.

| Área alterada | Verificação mínima |
| --- | --- |
| Somente documentação | `git diff --check` e confirmação dos caminhos/comandos citados |
| Frontend web | lint, typecheck e teste diretamente relacionado |
| Estrutura ou produção web | verificações do frontend mais build |
| Backend | lint/compilação e teste do domínio alterado |
| Banco/migration | build do backend, teste relacionado e revisão de `up`/`down` |
| Mobile | lint e validação manual do fluxo alterado |
| Contrato API compartilhado | verificar backend, frontend web e mobile consumidores |
| Fluxo integrado coberto | Playwright quando o ambiente necessário estiver disponível |
| Upload/mídia | tipo inválido, tamanho excedido, nome repetido e persistência do arquivo |
| Auth/admin | visitante `401`, usuário comum `403` e administrador autorizado |

Comandos usuais:

```bash
cd frontend && npm run lint && npm run typecheck
cd backend && npm run lint
cd mobile && npm run lint
```

Execute testes específicos do domínio sempre que houver código coberto. Build não substitui testes, e lint não comprova funcionamento manual.

## 12. Onde procurar por domínio

### Interface web

- layout, navegação e rodapé: `frontend/src/components/globals/`;
- login e cadastro: `frontend/src/components/login/` e `frontend/src/components/cadastro/`;
- loja e produto: `frontend/src/components/loja/` e páginas relacionadas;
- conta, carrinho, checkout e pedidos: `frontend/src/components/user/`;
- painel administrativo: `frontend/src/components/admin/`;
- integração HTTP: `frontend/src/services/`.

### Aplicativo mobile

- rotas e navegação: `mobile/app/`;
- login e cadastro: `mobile/src/components/login/` e `mobile/src/components/cadastro/`;
- catálogo e detalhes: `mobile/src/components/loja/`;
- conta e carrinho: `mobile/src/components/user/`;
- painel administrativo: `mobile/src/components/admin/`;
- autenticação: `mobile/src/contexts/` e `mobile/src/services/auth.ts`;
- integração HTTP: `mobile/src/services/api.ts` e `mobile/src/services/http.ts`.

### Backend

- registro de módulos: `backend/src/routes/index.ts`;
- autenticação: arquivos `auth.*` em routes, controllers, services e validators;
- usuários: arquivos `user.*` e `backend/src/models/Users.ts`;
- catálogo e jogos: arquivos de game, category, platform, listing, tag e image;
- pedidos e checkout: `checkout.service.ts`, `orders.service.ts` e serviços relacionados;
- uploads: `backend/src/middlewares/*upload.middleware.ts` e `backend/src/utils/media-storage.ts`;
- banco: `backend/src/models/`, `backend/src/migrations/` e `backend/src/seeders/`;
- testes: `backend/__tests__/`.

Use esses caminhos apenas como ponto de partida. Confirme sempre a implementação atual com `rg` antes de modificar o domínio.
