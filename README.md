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

## Referência da API

Esta seção descreve a API que está efetivamente registrada no backend. Ela é a
fonte de consulta para integrações e, principalmente, para a produção futura dos
diagramas de caso de uso, atividades e sequência.

### Endereço, formato e convenções

- **Backend direto no Docker:** `http://localhost:3001` (o servidor local sem
  Docker usa `http://localhost:3000`, salvo alteração de `PORT`)
- **Via Nginx/Docker:** `https://nexus.store/api` (ou `https://localhost/api`)
- As rotas abaixo são relativas à raiz do backend. Portanto, `GET /games` é
  consumida como `GET /api/games` quando passa pelo Nginx.
- O corpo padrão é JSON (`Content-Type: application/json`). Rotas com envio de
  imagem usam `multipart/form-data`.
- `:id`, `:gameId`, `:listingId`, `:platformId` e demais parâmetros de rota são
  inteiros positivos.
- Paginação, quando disponível: `page` (padrão `1`) e `limit` (padrão `20`,
  máximo `100`). As coleções paginadas respondem no formato
  `{ items: [...], meta: { page, limit, total, totalPages } }`.
- Os valores monetários são números. Preços e descontos efetivos retornam já
  calculados pelo servidor; o cliente não deve recalculá-los como fonte de
  verdade.

### Autorização e respostas de erro

`Pública` significa que não requer token; `Autenticada` requer o cabeçalho
`Authorization: Bearer <JWT>`; `Admin` requer JWT de um usuário com `isAdmin`
verdadeiro. O token é emitido no login e vence em 24 horas.

| Situação | HTTP | Formato/efeito |
| --- | --- | --- |
| Sucesso de leitura/alteração | `200` | Recurso ou coleção em JSON |
| Criação | `201` | Recurso criado em JSON |
| Remoção | `204` | Sem corpo |
| Dados inválidos | `400` | `{ code: "VALIDATION_ERROR", message }` |
| Sem token, token inválido/expirado | `401` | `{ code: "UNAUTHORIZED", message }` |
| Usuário autenticado sem permissão | `403` | `{ code: "FORBIDDEN", message }` |
| Recurso/rota inexistente | `404` | Código específico ou `ROUTE_NOT_FOUND` |
| Conflito de negócio | `409` | Ex.: estoque insuficiente, email duplicado |
| Corpo grande demais | `413` | `{ code: "PAYLOAD_TOO_LARGE", message }` |

O middleware de erro traduz as mensagens apresentadas ao usuário para
português. Para diagramas, trate validação, autenticação, autorização, ausência
do recurso e conflito de estoque como caminhos alternativos explícitos.

### Endpoints públicos e de identidade

| Método e rota | Acesso | Entrada principal | Resultado e regra de negócio |
| --- | --- | --- | --- |
| `GET /` | Pública | — | Identificação simples da API (`nexus-backend`, `ok`). |
| `GET /health` | Pública | — | Health check: `{ status: "healthy" }`. |
| `POST /auth/login` | Pública | `email`, `password` | Valida credenciais, compara a senha armazenada e retorna `{ user, token }`; credenciais inválidas retornam `401`. |
| `POST /users` | Pública | `email`, `username`, `password`, `fullName`, `cpf`; opcional `avatarUrl` ou `avatarFile` | Cria conta. Email, nome de usuário e CPF devem ser únicos; senha tem 8+ caracteres, maiúscula, minúscula, número e caractere especial. |
| `GET /users` | Admin | Paginação | Lista usuários sem expor hash de senha. |
| `GET /users/:id` | Autenticada | — | Retorna o perfil solicitado; o serviço impede a leitura da conta de outro usuário. |
| `PUT /users/:id` | Autenticada | `username`, `fullName`, `cpf`; opcionais `password`, `avatarUrl`/`avatarFile` | Atualiza apenas a própria conta. O email não pode ser alterado. |
| `DELETE /users/:id` | Autenticada | — | Exclui apenas a própria conta. |

### Catálogo público

| Método e rota | Acesso | Query/entrada | Resultado |
| --- | --- | --- | --- |
| `GET /games` | Pública | `page`, `limit`, `q` | Catálogo paginado; `q` pesquisa título. |
| `GET /games/:id` | Pública | — | Jogo, categorias, imagens e listings relacionados. |
| `GET /games/:id/details` | Pública | — | Visão de compra do jogo, limitada a listings ativos, com preço, promoções e estoque. |
| `GET /listings` | Pública | `page`, `limit`, `gameId`, `includeStock` | Listings (combinação jogo + plataforma), com filtro opcional. |
| `GET /listings/:id` | Pública | — | Listing individual. |
| `GET /listings/:id/stock` | Pública | — | Resumo de estoque da listing. |
| `GET /listings/:id/details` | Pública | — | Listing com jogo, plataforma, avaliações, promoções ativas, precificação e estoque. |
| `GET /promotions` | Pública | `page`, `limit`, `activeNow` | Promoções; `activeNow=true` filtra as ativas no período atual. |
| `GET /promotions/:id` | Pública | — | Promoção e suas listings; retorna somente itens ativos e disponíveis. |
| `GET /reviews` | Pública | `page`, `limit`, `gameId` | Avaliações, opcionalmente filtradas por jogo. |
| `GET /reviews/:id` | Pública | — | Avaliação, autor e votos associados. |
| `GET /review-votes` | Pública | `page`, `limit`, `reviewId` | Votos de utilidade de avaliações. |
| `GET /game-images` | Pública | `page`, `limit`, `gameId` | Galeria de imagens, com filtro opcional por jogo. |
| `GET /game-images/:id` | Pública | — | Imagem individual da galeria. |
| `GET /game-tags` | Pública | `page`, `limit`, `gameId` | Vínculos entre jogos e tags. |

> **Observação importante:** categorias e plataformas têm leitura protegida no
> backend atual (`GET /categories`, `GET /platforms` e seus `/:id` exigem JWT),
> embora façam parte do catálogo. Isto foi mantido na documentação para refletir
> a implementação real e deve aparecer como pré-condição nos diagramas.

### Carrinho, favoritos, compra e biblioteca

| Método e rota | Acesso | Entrada | Resultado/regra |
| --- | --- | --- | --- |
| `GET /wishlists` | Autenticada | — | Lista os jogos favoritos do usuário atual. |
| `POST /wishlists/:gameId` | Autenticada | — | Adiciona jogo existente aos favoritos; é idempotente. |
| `DELETE /wishlists/:gameId` | Autenticada | — | Remove o favorito do usuário atual. |
| `GET /cart` | Autenticada | — | Itens do carrinho, listing, quantidade, totais e disponibilidade de estoque. |
| `POST /cart/:listingId` | Autenticada | — | Adiciona uma unidade ou incrementa a quantidade; listing precisa existir e estar ativa. |
| `PATCH /cart/:listingId` | Autenticada | `{ "quantity": número positivo }` | Ajusta a quantidade do item do próprio usuário. |
| `DELETE /cart/:listingId` | Autenticada | — | Remove um item. |
| `DELETE /cart` | Autenticada | — | Limpa todo o carrinho. |
| `POST /checkout` | Autenticada | `{ "paymentMethod": "card" \| "paypal" \| "pix" }` | Executa checkout transacional e retorna `{ order }`. Detalhado em [Fluxo de checkout](#fluxo-de-checkout-principal). |
| `GET /orders` | Autenticada | Paginação | Lista somente pedidos do usuário atual. |
| `GET /orders/:id` | Autenticada | — | Detalhe de pedido, desde que pertença ao usuário atual. |
| `GET /order-items` | Autenticada | Paginação | Itens de pedido pertencentes ao usuário atual. |
| `GET /order-items/:id` | Autenticada | — | Item de pedido, protegido por propriedade. |
| `GET /delivered-keys` | Autenticada | Paginação | Keys digitais entregues ao usuário atual. |
| `GET /delivered-keys/:id` | Autenticada | — | Uma key entregue, protegida por propriedade. |
| `GET /library/keys` | Autenticada | Paginação | Biblioteca de keys de itens de pedidos pagos. |
| `GET /history/purchases` | Autenticada | Paginação | Histórico de compras do usuário atual. |

### Avaliações e votos

| Método e rota | Acesso | Corpo | Regra |
| --- | --- | --- | --- |
| `POST /reviews` | Autenticada | `gameId`, `rating` (inteiro de 1 a 5), `comment` (até 500 caracteres) | Cria uma avaliação; cada usuário pode avaliar um jogo uma única vez. |
| `PUT /reviews/:id` | Autenticada | `rating`, `comment` | Atualiza apenas a própria avaliação. |
| `DELETE /reviews/:id` | Autenticada | — | Remove apenas a própria avaliação. |
| `POST /review-votes/:reviewId` | Autenticada | — | Registra voto do usuário na avaliação; não duplica voto do mesmo usuário. |
| `DELETE /review-votes/:reviewId` | Autenticada | — | Remove o voto do próprio usuário. |

### Administração: cadastro de catálogo

As operações de escrita desta seção e o monitor de plataformas exigem
`Authorization: Bearer <JWT>` de administrador. As leituras de categorias e
plataformas exigem apenas um JWT válido, conforme indicado abaixo.

| Método e rota | Acesso | Corpo/query | Resultado/regra |
| --- | --- | --- | --- |
| `GET /categories`, `GET /categories/:id` | Autenticada | Paginação no primeiro | Consulta categorias. |
| `POST /categories` | Admin | `name` (máx. 100) | Cria categoria única. |
| `PUT /categories/:id` | Admin | `name` | Renomeia categoria. |
| `DELETE /categories/:id` | Admin | — | Exclui categoria quando permitido pelas relações. |
| `GET /platforms`, `GET /platforms/:id` | Autenticada | Paginação no primeiro | Consulta plataformas. |
| `POST /platforms` | Admin | `name`, `slug`, opcional `iconUrl` ou `iconFile` | Cria plataforma. |
| `PUT /platforms/:id` | Admin | Campos anteriores e/ou `isActive` | Atualiza plataforma. |
| `DELETE /platforms/:id` | Admin | — | Exclui plataforma. |
| `POST /games` | Admin | Dados do jogo abaixo; aceita mídia | Cria jogo, categorias e galeria em transação. |
| `PUT /games/:id` | Admin | Campos parciais do jogo; aceita mídia | Atualiza jogo, categorias e/ou galeria em transação. |
| `DELETE /games/:id` | Admin | — | Exclui jogo e dependências permitidas; jogos com histórico de pedido não podem ser excluídos. |
| `GET /games/:id/platforms` | Admin | — | Monitor administrativo: todas as plataformas, listing associada e estoque por plataforma. |
| `PUT /games/:id/platforms/:platformId` | Admin | `price` e/ou `isActive` | Cria ou atualiza a listing do jogo naquela plataforma; alteração de preço gera histórico. |
| `POST /games/:id/platforms/:platformId/keys` | Admin | `{ "keyValues": ["XXXX-XXXX-XXXX"] }` | Insere keys no estoque da listing já configurada. |
| `POST /listings` | Admin | `gameId`, `platformId`, `price` | Cria listing única para o par jogo/plataforma e cria evento de preço. |
| `PUT /listings/:id` | Admin | `price` e/ou `isActive` | Atualiza listing; mudança de preço é auditada. |
| `DELETE /listings/:id` | Admin | — | Exclui listing. |
| `GET /game-keys` | Admin | `page`, `limit`, `listingId` | Lista estoque de keys. |
| `GET /game-keys/:id` | Admin | — | Consulta uma key. |
| `POST /game-keys` | Admin | `listingId`, `keyValue` | Insere uma key. |
| `PUT /game-keys/:id` | Admin | `status`: `available`, `reserved` ou `sold` | Altera o estado de uma key. |
| `DELETE /game-keys/:id` | Admin | — | Exclui uma key. |
| `POST /game-keys/bulk` | Admin | `listingId`, `keyValues[]` | Insere várias keys. |
| `POST /game-keys/bulk-delete` | Admin | `listingId`, `ids[]` | Exclui em lote keys da listing. |
| `POST /game-images` | Admin | `gameId`, `imageUrl`, opcional `sortOrder` | Cria registro de imagem. |
| `PUT /game-images/:id` | Admin | `imageUrl` e/ou `sortOrder` | Atualiza imagem. |
| `DELETE /game-images/:id` | Admin | — | Remove imagem. |
| `POST /game-tags` | Admin | `gameId`, `tagId` | Associa tag a jogo. |
| `DELETE /game-tags/:gameId/:tagId` | Admin | — | Desfaz associação jogo-tag. |

**Dados de jogo:** `title`, `description`, `longDescription`, `releaseDate`
(`AAAA-MM-DD`), `categoryIds` (ao menos uma categoria), `galleryItems` e,
opcionalmente, `coverImageUrl` e `isActive`. A capa é obrigatória, seja por URL
ou arquivo. `galleryItems` é um array JSON de itens `{ kind: "existing", id }`,
`{ kind: "file", fileIndex }` ou `{ kind: "url", url }`.

### Administração: promoções, pedidos e auditoria

Todos os endpoints desta seção exigem acesso `Admin`.

| Método e rota | Corpo/query | Resultado/regra |
| --- | --- | --- |
| `POST /promotions` | `name`, `discountPercentage` (1–100), `startDate`, `endDate`; opcionais `description`, `coverImageUrl`, `bannerImageUrl`, `isActive` e arquivos | Cria promoção. |
| `PUT /promotions/:id` | Campos parciais acima | Atualiza promoção e suas mídias. |
| `DELETE /promotions/:id` | — | Exclui promoção e vínculos com listings. |
| `POST /promotions/:id/listings/:listingId` | — | Associa uma listing à promoção; é idempotente. |
| `DELETE /promotions/:id/listings/:listingId` | — | Remove a associação. |
| `GET /admin/orders` | `page`, `limit`, `q`, `status`, `paymentStatus` | Lista todos os pedidos para operação/administração. |
| `GET /admin/orders/:id` | — | Detalhe administrativo de pedido. |
| `GET /admin/price-history` | `page`, `limit`, `q`, `listingId` | Histórico de alterações de preço, listing e usuário responsável. |

### Uploads e mídia estática

Arquivos aceitos são imagens e são publicados em `GET /media/<arquivo>`. Os
limites atuais são: avatar e ícone de plataforma, 5 MB e um arquivo; jogo, até
1 capa + 12 imagens de galeria, 10 MB por arquivo; promoção, capa + banner, 10
MB por arquivo. Campos: usuário `avatarFile`; plataforma `iconFile`; jogo
`coverFile` e `galleryFiles`; promoção `coverFile` e `bannerFile`. O limite
geral de corpo JSON/urlencoded é 5 MB.

## Base Para Diagramas UML

### Atores e responsabilidades

| Ator | Objetivos/casos de uso principais |
| --- | --- |
| Visitante | Consultar catálogo, jogo, listing, promoção e avaliações; cadastrar-se; fazer login. |
| Usuário autenticado (cliente) | Gerenciar o próprio perfil, favoritos e carrinho; finalizar compra; consultar pedidos, histórico, biblioteca e keys; publicar e administrar as próprias avaliações/votos. |
| Administrador | Tudo que o cliente pode fazer, além de administrar usuários, catálogo, categorias, plataformas, listings, estoque de keys, promoções, pedidos e histórico de preços. |
| Sistema de pagamento simulado | No checkout atual, a confirmação é imediata: o pedido nasce `paid` e o pagamento `succeeded`; não há gateway externo. |
| PostgreSQL/armazenamento de mídia | Participantes técnicos: persistem entidades transacionais e arquivos de imagem. |

### Relações principais do domínio

```text
Usuário ──< CarrinhoItem >── Listing ── pertence a ── Jogo
   │                              │                     │
   ├──< Favorito >─────────────────┘                     ├──< Imagem
   ├──< Avaliação >── Jogo                            Jogo >──< Categoria
   ├──< VotoAvaliação >── Avaliação                   Jogo >──< Tag
   └──< Pedido ──< ItemPedido >── Key do jogo ──> KeyEntregue

Listing = jogo + plataforma + preço + status
Promoção >──< Listing      HistóricoDePreço ──> Listing e Administrador
```

Use `Listing` como conceito central de venda: o jogo pode ter várias plataformas,
cada plataforma possui uma listing própria, e cada listing possui seu preço,
estoque de keys, status e promoções aplicáveis.

### Fluxo de checkout principal

Este é o fluxo mais importante para um diagrama de atividades e um diagrama de
sequência.

1. Cliente autenticado solicita `POST /checkout` com a forma de pagamento.
2. API inicia **uma transação do banco** e carrega os itens do carrinho do
   cliente.
3. Se o carrinho estiver vazio, encerra com `400 CART_EMPTY`.
4. Para cada item, valida que a listing existe e está ativa, lê a quantidade,
   seleciona keys disponíveis e verifica estoque.
5. Se listing estiver indisponível ou faltarem keys, a transação é desfeita e a
   API retorna `409 LISTING_UNAVAILABLE` ou `409 OUT_OF_STOCK`.
6. Para cada listing válida, obtém promoções ativas no intervalo de datas e
   calcula subtotal, desconto e total no servidor.
7. Cria `Order` com `status: paid`, `paymentStatus: succeeded` e método
   (`card`, `paypal` ou `pix`).
8. Para cada key selecionada, muda seu estado para `sold`, cria um `OrderItem`
   e cria um `DeliveredKey` para o cliente.
9. Remove todos os itens do carrinho, confirma a transação e retorna o pedido
   completo com seus itens e keys entregues.

### Fluxos administrativos que merecem diagramas

- **Cadastrar/editar jogo:** Admin autentica → envia dados e mídia → valida
  categorias e capa → grava jogo, categorias e galeria em transação → publica
  mídias em `/media` → devolve jogo. Falha de validação ou upload impede a
  persistência e limpa arquivos temporários.
- **Configurar venda por plataforma:** Admin consulta plataformas de um jogo →
  define preço/status para uma plataforma → sistema cria ou atualiza `Listing`
  → se o preço mudou, registra `ListingPriceChange` → admin adiciona keys.
- **Criar promoção:** Admin cria promoção com período e percentual → associa uma
  ou mais listings → catálogo calcula o desconto apenas quando a promoção está
  ativa e a listing está disponível.
- **Gerenciar avaliação:** Cliente autenticado cria uma avaliação por jogo →
  sistema impede duplicidade → somente o autor pode editar/remover → qualquer
  cliente autenticado pode votar uma vez e remover seu próprio voto.

### Pré-condições, pós-condições e exceções úteis

| Caso de uso | Pré-condições | Pós-condições | Alternativas/exceções |
| --- | --- | --- | --- |
| Registrar usuário | Email, CPF e username ainda não existem; dados válidos | Usuário criado, com avatar opcional | Dados inválidos ou conflito `409` |
| Login | Conta existente e senha correta | JWT de 24h é devolvido | Credenciais inválidas `401` |
| Adicionar ao carrinho | Login; listing ativa | Quantidade é criada/incrementada | Listing inexistente/inativa |
| Checkout | Login; carrinho não vazio; listings ativas; keys suficientes | Pedido pago, keys vendidas e entregues, carrinho vazio | Carrinho vazio, listing indisponível, estoque alterado; transação faz rollback |
| Avaliar jogo | Login; jogo existe; ainda não avaliou o jogo | Avaliação vinculada ao usuário e jogo | Jogo inexistente ou avaliação duplicada `409` |
| Alterar preço | Login admin; jogo/plataforma/listing válida | Listing atualizada e histórico de preço gravado | Dados inválidos/recurso inexistente |
| Excluir jogo | Login admin; jogo sem histórico de vendas impeditivo | Jogo e dependências removidas | Jogo com pedidos: operação bloqueada; recomenda-se desativar |

### Sugestão de recorte para entrega acadêmica

Para manter os diagramas legíveis, uma boa divisão é: (1) autenticação e conta,
(2) navegação/consulta do catálogo, (3) carrinho e checkout, (4) pedidos,
biblioteca e keys, e (5) administração de catálogo, estoque e promoções. Para
o diagrama de sequência, priorize **checkout**; para atividade, use checkout e
cadastro de jogo; para casos de uso, represente Visitante, Cliente e
Administrador com os objetivos da tabela de atores.

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
- Variáveis de ambiente centralizadas em `.env.example`

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

# 2. Suba banco, backend, frontend e mobile com Docker
docker compose up --build

# 3. Acesse
# Frontend via HTTPS local: https://nexus.store
# Alternativa: https://localhost
# API via Nginx: https://nexus.store/api/health
# API direta: http://localhost:3001/health
# Expo Go: leia o QR code exibido pelo serviço mobile
```

```bash
# Frontend em desenvolvimento
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

```bash
# Backend em desenvolvimento
cd backend
npm install
npm run dev
npm run build
npm run lint
npm run test
npm run db:migrate
npm run db:seed
```

```bash
# Mobile com Expo Go
cd mobile
cp .env.example .env
# ajuste EXPO_PUBLIC_API_URL para o IP da sua máquina na rede local
npm start
```

## Autores
**Murilo Pereira Macedo** — Tecnólogo em Análise e Desenvolvimento de Sistemas.  
**Izaac Eduardo** — Tecnólogo em Análise e Desenvolvimento de Sistemas.
