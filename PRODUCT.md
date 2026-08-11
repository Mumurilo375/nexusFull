# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing web application: React 19, Vite, TypeScript, Tailwind CSS 4, Axios, React Router 7, Node.js, Express 5, Sequelize, PostgreSQL, JWT, Docker Compose and Nginx.

## Users

O usuário principal é um gamer que deseja comprar jogos online e já possui, ou pretende usar, uma das plataformas atendidas pela loja: Steam, Xbox ou PlayStation. Ele navega pelo catálogo, escolhe um jogo e uma plataforma compatível, realiza uma compra simulada e consulta a key de ativação entregue para resgatar o jogo na conta da plataforma.

Administradores gerenciam o catálogo, plataformas, ofertas, listings, mídias, pedidos e demais dados operacionais da aplicação.

## Product Purpose

O Nexus Full é um e-commerce educativo que simula a compra e a entrega de keys de jogos digitais por plataforma. Ele existe como projeto de faculdade do segundo ano do curso de Análise e Desenvolvimento de Sistemas, permitindo praticar a construção de um produto full stack com frontend, API, banco de dados, autenticação, administração e infraestrutura.

O sucesso do produto, neste contexto, significa demonstrar um fluxo coerente e funcional de descoberta do jogo, seleção da plataforma, compra simulada e acesso à key, além de uma implementação organizada e apresentável para avaliação acadêmica.

## Positioning

O produto se posiciona pela ampla variedade simulada de jogos e plataformas em um único catálogo. Para um mesmo jogo, o usuário pode escolher a edição/listing correspondente à Steam, Xbox ou PlayStation, de acordo com a plataforma que possui ou prefere usar.

## Operating Context

O produto é usado em contexto acadêmico, para demonstração, desenvolvimento e avaliação do projeto. A operação é local ou em ambiente de demonstração, com banco PostgreSQL, serviços conteinerizados e HTTPS local via Nginx quando executado pelo fluxo Docker documentado.

O fluxo principal é: acessar a home, pesquisar ou filtrar jogos, abrir os detalhes, selecionar a plataforma/listing, adicionar ao carrinho, concluir o checkout simulado e consultar o pedido e a key entregue. Administradores usam o painel protegido para manter os dados que sustentam esse fluxo.

## Capabilities and Constraints

- Catálogo com busca, filtros, categorias, plataformas, detalhes, galeria, estoque, preços e ofertas.
- Listings de jogos associados a plataformas Steam, Xbox e PlayStation.
- Cadastro, login, persistência de sessão com JWT e rotas protegidas.
- Favoritos, carrinho, checkout simulado, pedidos, biblioteca e consulta de keys entregues.
- Avaliações, votos, histórico de preços e gerenciamento administrativo.
- API organizada em rotas, controllers, services, validators, models e middlewares.
- Persistência relacional com PostgreSQL e Sequelize, migrations e seeders.
- Upload e entrega de mídia pelo backend, além de Docker Compose, Nginx, proxy reverso e HTTPS local.
- O projeto não é uma loja comercial real: não deve insinuar vendas reais, disponibilidade real, processamento financeiro real, afiliação com Steam, Xbox ou PlayStation, nem inventar provas de clientes, métricas ou depoimentos.
- A rubrica enviada pelo usuário é uma restrição acadêmica durável. Ela orienta a demonstração de arquitetura e padronização, boas práticas, requisitos e funcionalidades, documentação/diagramas, gestão ágil e backlog, implementação full stack e avaliação do projeto. Fonte: `/home/murilopm/Downloads/rubrica.pdf`.

## Brand Commitments

O nome Nexus Full e a comunicação principal em português devem ser preservados. A interface deve manter linguagem clara e adequada a um projeto acadêmico de e-commerce de jogos, sem apresentar a simulação como uma operação comercial real.

## Evidence on Hand

- README do projeto em `README.md`, com a finalidade acadêmica, autores, fluxo demonstrável, funcionalidades, rotas, stack e instruções de execução.
- Aplicação implementada em `frontend/` e `backend/`, incluindo catálogo, autenticação, carrinho, checkout, pedidos, painel administrativo e infraestrutura Docker/Nginx.
- Testes unitários e E2E no repositório, incluindo autenticação, CRUDs e validações.
- Imagens e logos do produto em `frontend/src/assets/` e `frontend/public/`.
- Rubrica acadêmica em `/home/murilopm/Downloads/rubrica.pdf`.
- Não há evidência de clientes reais, vendas reais, integrações oficiais ou métricas de uso; trabalhos futuros não devem fabricar esses elementos.

## Product Principles

- Tornar explícita a relação entre jogo, plataforma e key antes da compra.
- Priorizar uma experiência de catálogo ampla, pesquisável e fácil de comparar.
- Tratar a compra como fluxo demonstrável e consistente, sem alegações comerciais reais.
- Manter separação clara entre experiência do gamer e operações administrativas.
- Usar a implementação como demonstração de boas práticas full stack, segurança básica e organização arquitetural.

## Accessibility & Inclusion

Nenhum padrão específico foi estabelecido pelo usuário além da necessidade geral de uma interface web utilizável. Requisitos detalhados de acessibilidade permanecem como decisão aberta para trabalhos futuros; novas telas devem preservar navegação por teclado, contraste legível, rótulos claros e feedback compreensível.
