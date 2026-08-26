<div align="center">

# Nexus Full

### Uma plataforma de jogos. Duas experiências. Um único ecossistema.

E-commerce full stack com aplicações **Web** e **Mobile**, API REST compartilhada,
autenticação JWT, checkout, entrega de keys e painel administrativo.

<p>
  <img alt="React" src="https://img.shields.io/badge/Web-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=0B1020" />
  <img alt="React Native" src="https://img.shields.io/badge/Mobile-React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=0B1020" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/API-Node.js_+_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/Dados-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Infra-Docker_+_Nginx-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

</div>

<img width="100%" alt="Home do Nexus Full no frontend web" src="https://github.com/user-attachments/assets/fd338ec2-fa29-457d-b402-11b45a3add3f" />

<!-- TODO(MANUAL): CAPA WEB + MOBILE
Crie uma composição 1600x900 e salve em:
docs/images/readme/nexus-multiplatform.webp

Composição sugerida:
- screenshot web da Home ocupando o fundo/esquerda;
- screenshot mobile da Home no centro-direita;
- screenshot mobile da Loja parcialmente sobreposto à direita;
- fundo escuro, sem textos extras e usando o mesmo usuário/jogos nas telas.

Depois substitua a imagem acima por:
<img width="100%" alt="Nexus Full nas experiências web e mobile" src="./docs/images/readme/nexus-multiplatform.webp" />
-->

> **Status:** em desenvolvimento. O fluxo principal de compra, a API, o banco de dados,
> as aplicações Web e Mobile, o painel administrativo e a infraestrutura Docker estão implementados.

## Visão geral

O **Nexus Full** simula uma loja digital de jogos de ponta a ponta. O usuário pode
descobrir títulos, comparar plataformas e ofertas, montar o carrinho, finalizar a
compra e acessar pedidos e keys. Administradores contam com ferramentas para operar
catálogo, estoque, promoções, pedidos e histórico de preços.

O projeto não é apenas uma interface: Web e Mobile consomem a mesma API e compartilham
as mesmas regras de negócio e dados.

<table>
  <tr>
    <td align="center"><strong>🖥️ Web</strong><br />React, Vite e Tailwind CSS</td>
    <td align="center"><strong>📱 Mobile</strong><br />React Native, Expo e Expo Router</td>
    <td align="center"><strong>⚙️ Backend</strong><br />Node.js, Express e Sequelize</td>
    <td align="center"><strong>🐘 Dados</strong><br />PostgreSQL, migrations e seeders</td>
  </tr>
</table>

## Uma API, duas experiências

| Experiência | Destaques |
| --- | --- |
| **Frontend Web** | Navegação desktop responsiva, catálogo com filtros, galeria de produto, checkout, área do usuário e administração. |
| **Frontend Mobile** | Navegação por abas, componentes adaptados para toque, armazenamento seguro da sessão e fluxos de compra e administração no celular. |
| **Backend compartilhado** | Autenticação, catálogo, listings, estoque, promoções, carrinho, checkout, pedidos, biblioteca, avaliações e upload de mídia. |

### Cobertura funcional

| Fluxo | Web | Mobile | API |
| --- | :---: | :---: | :---: |
| Cadastro, login e sessão | ✅ | ✅ | ✅ |
| Catálogo, busca e filtros | ✅ | ✅ | ✅ |
| Detalhes, galeria e plataformas | ✅ | ✅ | ✅ |
| Favoritos e carrinho | ✅ | ✅ | ✅ |
| Checkout e pedidos | ✅ | ✅ | ✅ |
| Biblioteca e entrega de keys | ✅ | ✅ | ✅ |
| Perfil e configurações | ✅ | ✅ | ✅ |
| Painel administrativo | ✅ | ✅ | ✅ |

## Produto em ação

### Descoberta e compra

<table>
  <tr>
    <td width="50%" align="center">
      <img width="100%" alt="Catálogo web com jogos, ofertas e filtros" src="https://github.com/user-attachments/assets/dfe81638-e5f1-47bc-bcfb-f1d3bf000e11" />
      <br /><strong>Catálogo, ofertas e filtros</strong>
    </td>
    <td width="50%" align="center">
      <img width="100%" alt="Detalhes de um jogo com galeria, preço e seleção de plataforma" src="https://github.com/user-attachments/assets/2d657028-18ee-437c-b813-12975869ca5b" />
      <br /><strong>Detalhes e seleção de plataforma</strong>
    </td>
  </tr>
</table>

### Pós-compra e operação

<!-- TODO(MANUAL): CAPTURA DE PEDIDOS
Refaça a captura de pedidos com todas as keys ocultas, salve em
docs/images/readme/web/pedidos.webp e troque o src da primeira imagem abaixo por
./docs/images/readme/web/pedidos.webp. Mesmo sendo dados de demonstração, a versão
mascarada comunica melhor o cuidado com informações sensíveis.
-->

<table>
  <tr>
    <td width="50%" align="center">
      <img width="100%" alt="Área de pedidos e biblioteca de keys do usuário" src="https://github.com/user-attachments/assets/ab8735df-1298-446e-b188-0bf22e7332bf" />
      <br /><strong>Pedidos, biblioteca e keys</strong>
    </td>
    <td width="50%" align="center">
      <img width="100%" alt="Dashboard administrativo do Nexus Full" src="https://github.com/user-attachments/assets/a72dc8f3-661e-4d35-96a6-c592dee55eac" />
      <br /><strong>Painel administrativo</strong>
    </td>
  </tr>
</table>

### Experiência mobile

A aplicação mobile leva o mesmo fluxo ao celular com navegação por abas, componentes
otimizados para toque e rotas dedicadas para loja, produto, carrinho, checkout,
favoritos, pedidos, biblioteca, perfil e administração.

<!-- TODO(MANUAL): GALERIA MOBILE
Faça as capturas no mesmo aparelho/emulador, preferencialmente em 1080x2400, sem
notificações pessoais na barra de status. Use o mesmo jogo e usuário das imagens web.

Crie a pasta docs/images/readme/mobile e adicione:
- home.webp       -> Home com ofertas e jogos em destaque
- catalogo.webp   -> Loja com produtos e filtros abertos
- produto.webp    -> Detalhes do mesmo jogo exibido na versão web
- checkout.webp   -> Resumo da compra antes da confirmação
- pedidos.webp    -> Pedidos ou biblioteca com keys ocultas
- admin.webp      -> Dashboard ou listagem administrativa

Depois, cole logo abaixo do título "Experiência mobile" este bloco:

<p align="center">
  <img width="30%" alt="Home do Nexus Full no celular" src="./docs/images/readme/mobile/home.webp" />
  &nbsp;
  <img width="30%" alt="Catálogo mobile de jogos" src="./docs/images/readme/mobile/catalogo.webp" />
  &nbsp;
  <img width="30%" alt="Detalhes de um jogo no aplicativo mobile" src="./docs/images/readme/mobile/produto.webp" />
</p>
<p align="center">
  <img width="30%" alt="Checkout no aplicativo mobile" src="./docs/images/readme/mobile/checkout.webp" />
  &nbsp;
  <img width="30%" alt="Pedidos e biblioteca no aplicativo mobile" src="./docs/images/readme/mobile/pedidos.webp" />
  &nbsp;
  <img width="30%" alt="Painel administrativo no aplicativo mobile" src="./docs/images/readme/mobile/admin.webp" />
</p>
-->

## Arquitetura

```mermaid
flowchart LR
    WEB["Web<br/>React + Vite"] -->|HTTPS /api| NGINX["Nginx<br/>proxy reverso"]
    MOBILE["Mobile<br/>React Native + Expo"] -->|REST + JWT| API["API<br/>Node.js + Express"]
    NGINX --> API
    API --> ORM["Sequelize<br/>models + services"]
    ORM --> DB[(PostgreSQL)]
    API --> MEDIA[(Storage de mídia)]
```

No backend, as responsabilidades seguem o fluxo:

```text
route → controller → service → validator/model → PostgreSQL
```

- O frontend web usa Nginx para servir o build, redirecionar HTTP para HTTPS e encaminhar `/api/` e `/media/`.
- O aplicativo Expo acessa a API pelo endereço da máquina na rede local durante o desenvolvimento.
- A API centraliza regras de autenticação, catálogo, compra, estoque, entrega e administração.
- Migrations e seeders mantêm a evolução e a carga inicial do banco reproduzíveis.

## Funcionalidades

### Loja e catálogo

- Listagem de jogos com busca, filtros, categorias e plataformas.
- Ofertas ativas e histórico de preços por listing.
- Página de produto com galeria, estoque, avaliações e escolha de plataforma.
- Favoritos, carrinho e validação de disponibilidade.

### Autenticação e conta

- Cadastro e login com JWT.
- Rotas protegidas para conta, carrinho, checkout, pedidos e favoritos.
- Limpeza automática da sessão ao receber uma resposta `401`.
- Sessão web persistida no navegador e sessão mobile protegida com SecureStore.
- Separação de permissões entre usuário e administrador.

### Checkout e biblioteca

- Criação de pedidos a partir dos itens válidos do carrinho.
- Resumo da compra e histórico de pedidos.
- Entrega e visualização protegida das keys adquiridas.
- Biblioteca do usuário disponível na experiência mobile.

### Administração

- CRUD de jogos, categorias e plataformas.
- Listings, estoque e mídias por jogo e plataforma.
- Criação e acompanhamento de promoções.
- Consulta de pedidos e detalhes da operação.
- Auditoria do histórico de preços.

## Stack

| Camada | Tecnologias |
| --- | --- |
| **Web** | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Axios, Vitest |
| **Mobile** | React Native, Expo SDK 54, Expo Router, SecureStore, Axios |
| **Backend** | Node.js, TypeScript, Express 5, Sequelize, JWT, Multer, Jest |
| **Banco de dados** | PostgreSQL 15, migrations e seeders |
| **Infraestrutura** | Docker Compose, Nginx 1.27 Alpine, HTTPS local, proxy reverso e volumes persistentes |

## Rotas e módulos principais

| Área | Web | Mobile | Backend |
| --- | --- | --- | --- |
| Descoberta | `/`, `/loja`, `/ofertas` | Início e Loja | `/games`, `/categories`, `/platforms`, `/promotions` |
| Produto | `/loja/:gameId`, `/ofertas/:offerId` | Detalhes do jogo | `/games`, `/listings`, `/game-images`, `/reviews` |
| Conta | `/login`, `/cadastro`, `/configuracoes` | Login, Cadastro e Perfil | `/auth`, `/users` |
| Compra | `/carrinho`, `/checkout`, `/meus-pedidos` | Carrinho, Checkout, Pedidos e Biblioteca | `/cart`, `/checkout`, `/orders`, `/library`, `/delivered-keys` |
| Administração | `/admin/*` | Área administrativa protegida | `/admin`, `/game-keys`, `/history` |
| Operação | `/api/health` | Consumo da API pela rede local | `/health`, `/media` |

## Estrutura do projeto

```text
.
├── frontend/          # Aplicação web React + Vite
├── mobile/            # Aplicação React Native + Expo Router
├── backend/           # API REST Express + Sequelize
├── .docker/           # Certificados e volumes locais
├── docker-compose.yml # Orquestra banco, API, web e mobile
└── .env.example       # Referência central de configuração
```

As aplicações são independentes e não usam um workspace de monorepo. Dependências e
comandos devem ser executados dentro de `frontend/`, `mobile/` ou `backend/`.

## Como executar

### Projeto completo com Docker

Pré-requisitos: Docker, Docker Compose e uma entrada local para `nexus.store` caso
queira utilizar o domínio customizado.

```bash
# Na raiz do repositório
cp .env.example .env

# Ajuste os valores do ambiente e suba todos os serviços
docker compose up --build
```

Depois da inicialização:

| Serviço | Endereço |
| --- | --- |
| Frontend web | `https://nexus.store` ou `https://localhost` |
| API via Nginx | `https://nexus.store/api/health` |
| API direta | `http://localhost:3001/health` |
| Mobile | QR code exibido pelo serviço Expo |
| PostgreSQL | `localhost:5434` |

> No celular, `localhost` aponta para o próprio aparelho. Configure
> `EXPO_PUBLIC_API_URL` e `REACT_NATIVE_PACKAGER_HOSTNAME` no `.env` da **raiz** com o
> IP da máquina na rede local. Não crie outro `.env` dentro de `mobile/`.

<details>
<summary><strong>Executar cada aplicação separadamente</strong></summary>

### Frontend web

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Mobile com Expo Go

```bash
# O arquivo .env continua na raiz do repositório
cd mobile
npm install
npm start
```

</details>

## Qualidade e segurança

- Testes unitários com Vitest no frontend e Jest no backend.
- TypeScript nas três aplicações.
- Validação de payloads e separação da API em camadas.
- Guards de autenticação e autorização administrativa.
- Headers de segurança e HTTPS local configurados no Nginx.
- CORS configurável por ambiente e arquivos de mídia servidos por rota dedicada.
- Segredos centralizados em variáveis de ambiente; variáveis `EXPO_PUBLIC_*` são tratadas como públicas.

## Autores

Desenvolvido por **Murilo Pereira Macedo** e **Izaac Eduardo**, estudantes de
Análise e Desenvolvimento de Sistemas.
