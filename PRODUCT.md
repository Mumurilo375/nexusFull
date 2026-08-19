# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing web application: React 19, Vite, TypeScript, Tailwind CSS 4, Axios, React Router 7, Node.js, Express 5, Sequelize, PostgreSQL, JWT, Docker Compose and Nginx.

## Users

O usuário principal é um gamer que deseja comprar jogos online e já possui, ou pretende usar, uma das plataformas atendidas pela loja: Steam, Xbox ou PlayStation. Ele navega pelo catálogo, escolhe um jogo e uma plataforma compatível, realiza um pedido e consulta a key de ativação entregue para resgatar o jogo na conta da plataforma.

Administradores gerenciam o catálogo, plataformas, ofertas, listings, mídias, pedidos e demais dados operacionais da aplicação.

## Product Purpose

O Nexus Full é um e-commerce de jogos digitais por plataforma, com catálogo, pedidos e entrega de keys. A aplicação reúne frontend, API, banco de dados, autenticação, administração e infraestrutura.

O sucesso do produto significa oferecer um fluxo coerente e funcional de descoberta do jogo, seleção da plataforma, pedido e acesso à key, com uma implementação organizada e apresentável.

## Positioning

O produto se posiciona pela variedade de jogos e plataformas em um único catálogo. Para um mesmo jogo, o usuário pode escolher a edição/listing correspondente à Steam, Xbox ou PlayStation, de acordo com a plataforma que possui ou prefere usar.

## Operating Context

A operação usa banco PostgreSQL, serviços conteinerizados e HTTPS local via Nginx quando executada pelo fluxo Docker documentado.

O fluxo principal é: acessar a home, pesquisar ou filtrar jogos, abrir os detalhes, selecionar a plataforma/listing, adicionar ao carrinho, concluir o checkout e consultar o pedido e a key entregue. Administradores usam o painel protegido para manter os dados que sustentam esse fluxo.

## Capabilities and Constraints

- Catálogo com busca, filtros, categorias, plataformas, detalhes, galeria, estoque, preços e ofertas.
- Listings de jogos associados a plataformas Steam, Xbox e PlayStation.
- Cadastro, login, persistência de sessão com JWT e rotas protegidas.
- Favoritos, carrinho, checkout, pedidos, biblioteca e consulta de keys entregues.
- Avaliações, votos, histórico de preços e gerenciamento administrativo.
- API organizada em rotas, controllers, services, validators, models e middlewares.
- Persistência relacional com PostgreSQL e Sequelize, migrations e seeders.
- Upload e entrega de mídia pelo backend, além de Docker Compose, Nginx, proxy reverso e HTTPS local.
- Não inventar integrações oficiais, avaliações, métricas, depoimentos ou outros dados sem evidência no produto.

## Brand Commitments

O nome Nexus Full e a comunicação principal em português devem ser preservados. A interface deve manter linguagem clara, orientada à ação e adequada a um e-commerce de jogos.

## Frontend Copy

- Nunca incluir no frontend textos que descrevam o produto como acadêmico, educativo, demonstrativo, fictício ou simulado.
- Não inserir avisos, confirmações, checkboxes ou mensagens que expliquem que vendas, pagamentos, pedidos ou keys não são reais. Esse contexto não pertence à interface.
- Evitar metaexplicações sobre o projeto, a implementação ou a finalidade do produto. Cada texto da interface deve orientar uma ação, explicar um estado ou apresentar conteúdo útil ao usuário.

## Evidence on Hand

- README do projeto em `README.md`, com autores, funcionalidades, rotas, stack e instruções de execução.
- Aplicação implementada em `frontend/` e `backend/`, incluindo catálogo, autenticação, carrinho, checkout, pedidos, painel administrativo e infraestrutura Docker/Nginx.
- Testes unitários e E2E no repositório, incluindo autenticação, CRUDs e validações.
- Imagens e logos do produto em `frontend/src/assets/` e `frontend/public/`.
- Não há evidência de integrações oficiais ou métricas de uso; trabalhos futuros não devem fabricar esses elementos.

## Product Principles

- Tornar explícita a relação entre jogo, plataforma e key antes da compra.
- Priorizar uma experiência de catálogo ampla, pesquisável e fácil de comparar.
- Manter o fluxo de compra consistente e com informações claras em cada etapa.
- Manter separação clara entre experiência do gamer e operações administrativas.
- Preservar boas práticas full stack, segurança básica e organização arquitetural.

## Accessibility & Inclusion

Nenhum padrão específico foi estabelecido pelo usuário além da necessidade geral de uma interface web utilizável. Requisitos detalhados de acessibilidade permanecem como decisão aberta para trabalhos futuros; novas telas devem preservar navegação por teclado, contraste legível, rótulos claros e feedback compreensível.
