# Guia rápido: API e diagramas

Este arquivo serve como base para representar o funcionamento do Nexus Full em
diagramas. Use os nomes abaixo como referência; não é necessário colocar cada
endpoint em todos os diagramas.

## 1. Atores

| Ator | O que faz |
| --- | --- |
| Visitante | Consulta jogos, ofertas e avaliações; cria conta e faz login. |
| Cliente | Mantém perfil, favoritos e carrinho; compra jogos; consulta pedidos, biblioteca e keys; avalia jogos. |
| Administrador | Gerencia usuários, catálogo, plataformas, estoque de keys, promoções, pedidos e histórico de preços. |
| API | Valida dados, aplica regras de negócio, controla permissões e grava os dados. |
| Banco de dados | Armazena usuários, catálogo, carrinho, pedidos, keys, promoções e histórico. |

## 2. Regras de acesso

- **Pública:** não precisa de login.
- **Cliente:** precisa do cabeçalho `Authorization: Bearer <token>`.
- **Admin:** precisa de token de um usuário administrador.
- O login devolve o token. Token ausente, inválido ou expirado retorna `401`.
- Uma ação sem permissão retorna `403`.
- `:id`, `:gameId`, `:listingId` e similares são identificadores numéricos.
- Listas podem aceitar `page` e `limit` e devolvem `items` e `meta`.

## 3. Mapa de endpoints

Base via Nginx: `/api`. Exemplo: `GET /api/games`.

| Área | Endpoints | Acesso | Finalidade |
| --- | --- | --- | --- |
| Sistema | `GET /`; `GET /health`; `GET /media/:arquivo` | Pública | Identificar a API, verificar saúde e servir arquivos de mídia. |
| Sessão e conta | `POST /auth/login`; `POST /users`; `GET/PUT/DELETE /users/:id`; `GET /users` | Pública para login/cadastro; cliente para perfil; admin para listar | Entrar, registrar e manter conta. |
| Catálogo | `GET /games`, `GET /games/:id`, `GET /games/:id/details`; `GET /listings`, `GET /listings/:id`, `GET /listings/:id/stock`, `GET /listings/:id/details` | Pública | Consultar jogos, plataformas de venda, preço, estoque e detalhes. |
| Ofertas e opiniões | `GET /promotions`, `GET /promotions/:id`; `GET /reviews`, `GET /reviews/:id`, `POST /reviews`, `PUT/DELETE /reviews/:id`; `GET /review-votes`, `POST/DELETE /review-votes/:reviewId` | Leitura pública; escrever requer cliente | Ver promoções, criar avaliações e votar nelas. |
| Favoritos e carrinho | `GET /wishlists`, `POST/DELETE /wishlists/:gameId`; `GET /cart`, `POST/PATCH/DELETE /cart/:listingId`, `DELETE /cart` | Cliente | Manter jogos favoritos e itens que serão comprados. |
| Compra e pós-venda | `POST /checkout`; `GET /orders`, `GET /orders/:id`; `GET /order-items`, `GET /order-items/:id`; `GET /delivered-keys`, `GET /delivered-keys/:id`; `GET /library/keys`; `GET /history/purchases` | Cliente | Criar pedido e consultar compra, biblioteca e keys entregues. |
| Categorias e plataformas | `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT/DELETE /categories/:id`; `GET /platforms`, `GET /platforms/:id`, `POST /platforms`, `PUT/DELETE /platforms/:id` | Leitura com login; escrita admin | Organizar jogos e plataformas. |
| Jogos e listings | `POST /games`, `PUT/DELETE /games/:id`; `GET /games/:id/platforms`; `PUT /games/:id/platforms/:platformId`; `POST /games/:id/platforms/:platformId/keys`; `POST /listings`, `PUT/DELETE /listings/:id` | Admin | Criar jogo, definir venda por plataforma, preço e disponibilidade. |
| Keys e mídias | `GET /game-keys`, `GET /game-keys/:id`, `POST /game-keys`, `PUT/DELETE /game-keys/:id`, `POST /game-keys/bulk`, `POST /game-keys/bulk-delete`; `GET /game-images`, `GET /game-images/:id`, `POST /game-images`, `PUT/DELETE /game-images/:id`; `GET /game-tags`, `POST /game-tags`, `DELETE /game-tags/:gameId/:tagId` | Leitura de imagens/tags pública; demais operações admin | Controlar estoque digital, imagens e tags. |
| Promoções e operação | `POST /promotions`, `PUT/DELETE /promotions/:id`; `POST/DELETE /promotions/:id/listings/:listingId`; `GET /admin/orders`; `GET /admin/orders/:id`; `GET /admin/price-history` | Admin | Aplicar descontos, consultar todos os pedidos e auditar preços. |

> Nas rotas combinadas acima, use o método correspondente: por exemplo,
> criar é `POST`, atualizar é `PUT` ou `PATCH` e remover é `DELETE`.

## 4. Dados importantes

| Recurso | Dados essenciais |
| --- | --- |
| Usuário | `email`, `username`, `password`, `fullName`, `cpf`, `isAdmin`. |
| Jogo | `title`, descrições, `releaseDate`, capa, categorias e imagens. |
| Plataforma | `name`, `slug`, ícone e status. |
| Listing | Combina **jogo + plataforma + preço + status**. É o item realmente vendido. |
| GameKey | Key digital de uma listing; estados: `available`, `reserved` ou `sold`. |
| Carrinho | Cliente, listing e quantidade. |
| Pedido | Cliente, número, subtotal, desconto, total, forma e status de pagamento. |
| Item do pedido | Pedido, listing, key vendida e preço final. |
| Key entregue | Liga o cliente à key comprada. |
| Promoção | Nome, desconto percentual, datas de início/fim e listings participantes. |
| Avaliação | Cliente, jogo, nota de 1 a 5 e comentário. |

## 5. Relacionamentos para o diagrama de classes/domínio

```text
Usuário -> CarrinhoItem -> Listing -> Jogo
                              -> Plataforma
                              -> GameKey

Usuário -> Favorito -> Jogo
Usuário -> Avaliação -> Jogo
Usuário -> Pedido -> ItemPedido -> GameKey
ItemPedido -> KeyEntregue -> Usuário
Promoção <-> Listing
Jogo <-> Categoria
Jogo <-> Tag
```

## 6. Fluxo principal: checkout

1. Cliente autenticado envia `POST /checkout` com `paymentMethod` (`card`,
   `paypal` ou `pix`).
2. A API carrega o carrinho. Se estiver vazio, encerra o fluxo.
3. Para cada item, verifica se a listing está ativa e se há keys suficientes.
4. A API consulta promoções ativas e calcula subtotal, desconto e total.
5. A API cria o pedido já confirmado: `paid` e `succeeded`.
6. Para cada key selecionada, muda o estado para `sold`, cria o item do pedido
   e registra a key entregue.
7. A API limpa o carrinho e retorna o pedido completo.

Se faltar estoque ou uma listing ficar inativa, o checkout falha e nada é
gravado: a operação é uma transação única.

## 7. Outros fluxos úteis

### Cadastro e login

1. Visitante envia cadastro.
2. API valida formato e verifica se email, CPF e username já existem.
3. API cria usuário; no login válido, devolve token.

### Configurar venda de um jogo

1. Admin cria ou edita um jogo e relaciona categorias/imagens.
2. Admin define preço e status para uma plataforma.
3. A API cria ou atualiza a listing e grava histórico se o preço mudar.
4. Admin adiciona keys à listing para disponibilizar estoque.

### Criar promoção

1. Admin informa nome, desconto e período.
2. Admin associa uma ou mais listings.
3. A API aplica o desconto somente quando a promoção está ativa.

### Criar avaliação

1. Cliente autenticado envia nota e comentário para um jogo.
2. A API impede uma segunda avaliação do mesmo cliente para o mesmo jogo.
3. Somente o autor pode editar ou apagar a avaliação.

## 8. Como separar os diagramas

| Diagrama | Inclua |
| --- | --- |
| Caso de uso | Visitante, Cliente e Administrador; login, catálogo, carrinho, checkout, pedidos, avaliações e administração. |
| Atividades | Checkout como fluxo principal; decisões: carrinho vazio, listing ativa, estoque disponível e promoção ativa. |
| Sequência | Cliente -> Frontend -> API -> Banco no checkout; mostrar criação de pedido, baixa de key e limpeza do carrinho. |

## 9. Exceções que valem aparecer

- Dados inválidos: `400`.
- Token ausente ou inválido: `401`.
- Acesso sem permissão: `403`.
- Recurso inexistente: `404`.
- Email, username, CPF, avaliação ou vínculo duplicado: `409`.
- Carrinho vazio, listing inativa ou estoque insuficiente no checkout: fluxo
  interrompido sem criar pedido.
