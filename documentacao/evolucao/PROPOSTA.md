# Nexus Full — proposta de evolução

## Pagamentos, dashboard administrativo e experiência de compra

**Versão:** 1.1 · **Data:** 14/09/2026 · **Escopo:** funcionalidades futuras para web, mobile e API.

Esta proposta descreve a evolução do Nexus Full para processar pagamentos por gateway, oferecer indicadores de negócio aos administradores e ampliar a gestão de pedidos. As melhorias de experiência acompanham o cliente desde a revisão da compra até o recebimento das chaves dos jogos.

O documento contém **15 requisitos: 10 funcionais e 5 não funcionais**, um modelo de dados futuro em DBML, dois diagramas de casos de uso, dois diagramas de sequência e dois fluxogramas.

### Como usar este material

- **Leitura:** abra [DOCUMENTACAO.html](DOCUMENTACAO.html) no navegador ou visualize este Markdown.
- **DER no dbdiagram:** copie todo o conteúdo de [der.dbml](der.dbml) para o editor do [dbdiagram](https://dbdiagram.io). Os comentários e as cores distinguem tabelas novas e existentes.
- **Slides:** use os arquivos **PNG** em [diagramas/](diagramas/). Clique nas imagens para abri-las no tamanho original.
- **Edição:** todos os diagramas possuem fontes `.puml`. Os fluxogramas mantêm seu desenho original em Graphviz dentro do arquivo PlantUML.

## 1. Objetivos e limites da proposta

| Frente | Resultado esperado |
| --- | --- |
| Pagamentos | Cobranças por cartão de crédito, Pix e boleto; confirmação pelo gateway; entrega das chaves após aprovação. |
| Dashboard | Indicadores de vendas, estornos, clientes e produtos, com filtros, comparações e relatórios exportáveis. |
| Pedidos | Consulta detalhada, histórico de eventos, observações internas, cancelamentos elegíveis e solicitação de estorno integral. |
| Experiência web e mobile | Instruções claras, acompanhamento da compra, retomada de pagamentos pendentes e tratamento consistente de erros. |

**Gateway de referência:** Mercado Pago. O desenho admite outro provedor que ofereça os métodos e as operações necessários. A contratação, os métodos habilitados e os prazos de cada meio de pagamento deverão ser definidos na integração. A documentação oficial apresenta as opções de integração de pagamentos e a configuração de notificações. [Mercado Pago — visão geral](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-payments/overview).

O escopo inicial considera BRL, um provedor ativo, cartão de crédito, Pix e boleto e **estorno integral**. Parcelamento, estorno parcial, assinaturas e tratamento completo de disputas ficam fora desta versão da proposta.

### Base técnica consultada

O modelo foi elaborado a partir dos **models, associações, migrations e serviços do repositório**. Não houve consulta a uma instância ativa do PostgreSQL: `docker compose ps` não apresentou serviços em execução.

Na versão consultada:

- `orders` já possui método, situação do pagamento, confirmação e cancelamento; esses campos serão reaproveitados.
- O checkout cria o pedido com `status = paid` e `payment_status = succeeded`, entregando as chaves na mesma transação.
- As rotas administrativas de pedidos oferecem listagem e detalhes. Já existem filtros por situação, comprador e número do pedido, além de informações de itens, valores e datas.
- `order_items` representa **uma unidade por linha**. Seu `game_key_id` já aceita nulo e possui unicidade.
- `game_keys` já possui situação e data da reserva, mas não identifica o pedido responsável nem o vencimento da reserva.
- Os campos específicos de provedor adicionados por uma migration de março foram removidos pela migration posterior `20260326130000-remove-stripe-fields-from-orders.js`.
- A administração utiliza as tabelas de usuários, papéis e permissões existentes. Não será criada uma entidade separada de administrador.

Esses pontos justificam as alterações propostas; não descrevem funcionalidades futuras como se já estivessem implementadas.

## 2. Requisitos funcionais

Requisitos funcionais descrevem **o que o sistema deverá fazer**. Todos os requisitos desta seção se referem à evolução proposta.

| ID | Requisito | Critério de aceitação |
| --- | --- | --- |
| **RF01** | **Integrar um gateway de pagamento.** O sistema deverá criar e consultar cobranças no provedor, vinculando cada tentativa ao pedido, com identificador externo e chave de idempotência. | Repetir a mesma solicitação deverá recuperar a mesma tentativa, sem gerar cobrança adicional. Valores serão calculados pelo backend. |
| **RF02** | **Oferecer cartão de crédito, Pix e boleto.** O cliente deverá escolher o método e receber instruções apropriadas, incluindo ambiente seguro para cartão, QR Code/código Pix ou boleto, com prazo quando aplicável. | Cada método habilitado deverá permitir iniciar o pagamento na web e no mobile, exibindo o total e as instruções fornecidas pelo gateway. |
| **RF03** | **Confirmar pagamentos automaticamente.** O sistema deverá receber notificações autenticadas, consultar a situação oficial no gateway e atualizar a situação financeira do pedido. Uma rotina de conciliação deverá recuperar notificações perdidas. | Aprovações, recusas, cancelamentos e expirações deverão ser refletidos corretamente; notificações repetidas ou fora de ordem não deverão duplicar efeitos nem regredir estados válidos. |
| **RF04** | **Reservar e entregar as chaves dos jogos.** O sistema deverá reservar estoque durante o pagamento e entregar as chaves na biblioteca somente após confirmação financeira. | Duas compras não poderão reservar ou receber a mesma chave. Uma cobrança encerrada sem pagamento liberará a reserva após conciliação; aprovação sem possibilidade de entrega iniciará estorno integral. |
| **RF05** | **Ampliar o acompanhamento e as notificações do pedido.** O cliente deverá consultar itens, valores, situação financeira, entrega e histórico público, retomar cobranças pendentes válidas e receber e-mail sobre aprovação, cancelamento, expiração, estorno e entrega. | O cliente verá somente seus pedidos, poderá retomar uma cobrança sem criar outra e receberá mensagens em português com orientação para a próxima ação. Falha no e-mail não impedirá a consulta. |
| **RF06** | **Ampliar a gestão administrativa de pedidos.** O administrador autorizado deverá filtrar pedidos, consultar tentativas e histórico, registrar observações internas, cancelar pedidos elegíveis e solicitar estorno integral com justificativa. | Cada ação registrará autor, motivo e data. Pagamentos confirmados serão alterados somente conforme resposta do gateway; itens e totais históricos não serão livremente editáveis. |
| **RF07** | **Disponibilizar um dashboard de indicadores.** O sistema deverá apresentar vendas aprovadas, valor recebido, estornos, receita após estornos, ticket médio, clientes compradores, novos usuários e jogos mais vendidos. | Os indicadores deverão seguir as fórmulas da seção 3, exibir período e atualização e permitir chegar aos pedidos que compõem os resultados. |
| **RF08** | **Filtrar e comparar resultados.** O administrador deverá filtrar indicadores compatíveis por período, jogo, plataforma e método de pagamento e comparar o período selecionado com outro de igual duração. | Cards e gráficos aplicáveis usarão os mesmos filtros. Consultas sem registros exibirão estado vazio; comparação sem base anterior será apresentada como “Sem base de comparação”. |
| **RF09** | **Gerar e exportar relatórios.** O administrador com permissão específica deverá solicitar relatórios de vendas, produtos e clientes em CSV ou PDF, acompanhando processamento, conclusão e falha. | O arquivo deverá conter filtros, período e referência dos dados, corresponder ao snapshot usado na geração e permitir download autorizado na web ou compartilhamento pelo mobile. |
| **RF10** | **Melhorar a jornada de compra na web e no mobile.** O sistema deverá apresentar revisão de itens e total, etapas do checkout, erros próximos dos campos, feedback de carregamento e resultado e retomada após interrupção. | Após falha de rede ou reabertura do app, o cliente poderá consultar o pedido existente e continuar uma cobrança válida. Botões deverão indicar processamento e evitar envios involuntariamente repetidos. |

## 3. Requisitos não funcionais e definição dos KPIs

### 3.1 Requisitos não funcionais

Requisitos não funcionais descrevem **qualidade, limites e condições de operação**. Os números abaixo são metas de aceitação propostas.

| ID | Categoria e requisito | Critério de verificação |
| --- | --- | --- |
| **RNF01** | **Desempenho e capacidade.** Suportar 100 usuários simultâneos, com base de referência de 50 mil pedidos. Em 95% das requisições, as consultas comuns deverão responder em até 2 s e as consultas do dashboard em até 3 s. Relatórios de até 10 mil linhas deverão concluir em até 60 s. | Teste de carga em ambiente equivalente ao de produção, com distribuição documentada das operações. Medir o tempo da API; medir separadamente a latência do gateway. Dados do dashboard deverão refletir alterações confirmadas em até 60 s. |
| **RNF02** | **Segurança e privacidade.** Utilizar HTTPS; manter credenciais do provedor apenas no servidor; verificar autenticação, propriedade do pedido e permissões administrativas na API; utilizar captura de cartão pelo gateway, sem armazenar número completo ou CVV. | Visitante sem sessão receberá 401 e usuário comum em operação administrativa receberá 403. Testes deverão rejeitar eventos sem autenticidade, acesso a pedidos de terceiros e download não autorizado. Logs e relatórios não conterão credenciais ou chaves de jogos. |
| **RNF03** | **Integridade e recuperação.** Processar confirmações com transações, unicidade e idempotência, preservando a consistência entre pagamento, pedido, estoque, entrega e histórico. Manter conciliação e repetição de tarefas após falhas. | Reenvio de eventos, concorrência e queda do processador não produzirão cobrança ou entrega duplicada. Backups e recuperação deverão limitar perda de dados a 15 min e permitir restauração em até 2 h, com conciliação financeira após recuperação. |
| **RNF04** | **Disponibilidade e observabilidade.** Manter disponibilidade mensal mínima de 99,5% para os serviços próprios de compra e consulta, com monitoramento e alertas de indisponibilidade em até 5 min. | Medir por sondas a cada minuto, incluindo manutenção no cálculo. Em um mês de 30 dias, o limite equivale a 3 h e 36 min de indisponibilidade. Falhas de dependências externas terão medição separada e mensagem clara ao usuário. |
| **RNF05** | **Usabilidade, acessibilidade e compatibilidade.** Oferecer fluxos consistentes em português na web responsiva e no aplicativo, com foco visível, rótulos acessíveis, mensagens compreensíveis e suporte a leitores de tela. | Validar larguras de 360 a 1440 px sem perda de ações; navegação por teclado na web; VoiceOver/TalkBack no mobile; alvos de toque de pelo menos 44 × 44 unidades lógicas e contraste mínimo de 4,5:1 para texto comum. Matriz proposta: duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari e versões Android/iOS suportadas pelo Expo adotado. |

### 3.2 Indicadores do dashboard

**Convenções:** datas serão armazenadas em UTC e exibidas em `America/Sao_Paulo`. O intervalo será fechado no início e aberto no fim: `[início, fim)`. O período padrão será de 30 dias. Valores monetários usarão cálculo decimal, em BRL.

| KPI | Regra de cálculo | Utilidade |
| --- | --- | --- |
| **Pedidos com pagamento aprovado** | Quantidade de pedidos distintos com confirmação financeira no período. Um pedido estornado depois permanece nessa contagem histórica. | Medir volume de vendas inicialmente aprovadas. |
| **Valor recebido** | Soma dos valores dos pagamentos confirmados no período, uma confirmação principal por pedido, mesmo se estornada depois. Cobranças excedentes ficam fora das vendas e são tratadas como exceção. | Acompanhar entradas das vendas antes de estornos. |
| **Estornos confirmados** | Soma dos estornos de pagamentos principais concluídos no período, pela data da confirmação do estorno. Pendentes e devoluções de cobranças excedentes não entram na soma. | Acompanhar devoluções efetivadas das vendas. |
| **Receita após estornos** | Valor recebido no período menos estornos confirmados no período. Não desconta taxas, tributos ou custos e não representa lucro. | Observar o resultado financeiro definido para o painel. |
| **Ticket médio** | Valor recebido dividido pelo número de pedidos com pagamento aprovado no período. Sem pedidos, exibir “—”. | Identificar o valor médio das compras. |
| **Clientes compradores** | Quantidade de usuários distintos dos pedidos com pagamento aprovado no período. | Medir alcance das vendas. |
| **Novos usuários** | Quantidade de registros em `users` criados no período. | Acompanhar novos cadastros. |
| **Jogos mais vendidos** | Contagem de linhas de `order_items` dos pedidos confirmados no período, agrupada por jogo e plataforma. Cada linha equivale a uma unidade. | Identificar os produtos com maior volume aprovado. |

**Coerência dos filtros:** jogo e plataforma restringem as linhas vendidas; os valores recebidos são então calculados pela soma dos preços desses itens, sem atribuir o total inteiro do pedido a cada produto. Estornos integrais seguem a mesma distribuição por itens. Método restringe o pagamento confirmado. Contagens de pedidos e clientes usam `DISTINCT`. O card de novos usuários responde somente ao período e informa essa regra na interface. A listagem operacional de pedidos aceita filtro de status; o card de vendas aprovadas mantém sua definição financeira e não será recalculado como “vendas pendentes”.

**Comparação:** variação percentual = `(atual − anterior) ÷ anterior × 100`, quando o valor anterior for diferente de zero. Com base anterior zero, mostrar os valores absolutos e “Sem base de comparação”.

**Exemplo:** 40 pedidos aprovados, R$ 4.000 recebidos e R$ 200 de estornos confirmados no período resultarão em ticket médio de R$ 100 e receita após estornos de R$ 3.800. Um estorno de venda antiga pode reduzir o resultado do período atual; por isso, a receita após estornos pode ser negativa.

Os KPIs serão calculados por consultas agregadas, com snapshot consistente por resposta. **Não será criada uma tabela `dashboard`**: o painel apresenta informações derivadas das tabelas de negócio. Os relatórios serão calculados com as mesmas definições; diferenças em relação a uma tela aberta anteriormente deverão ser explicadas pela referência de atualização.

## 4. Modelo de dados futuro — DER resumido

### 4.1 Arquivo para o dbdiagram

**[Abrir der.dbml](der.dbml)** — contém **6 tabelas, 28 colunas e 5 relacionamentos**. Copie o arquivo inteiro no editor do [dbdiagram](https://dbdiagram.io) e organize as tabelas ao redor de `orders` para fazer uma única captura.

Este é um recorte dos dados essenciais para explicar a compra, o pagamento e os indicadores. As tabelas e colunas não desenhadas continuam fazendo parte do projeto; sua ausência neste DER não significa que serão excluídas do banco.

As tabelas cinza já existem. `orders`, em azul, terá seu fluxo de situação ampliado. `payments`, em verde, será a nova tabela da integração. [Referência da sintaxe DBML](https://dbml.dbdiagram.io/docs/).

### 4.2 As seis tabelas

| Tabela | Explicação simples | Situação |
| --- | --- | --- |
| `users` | Quem realiza a compra. Nome, e-mail e data do cadastro também ajudam a analisar os clientes. | Existente. |
| `games` | Identifica os jogos vendidos. | Existente. |
| `game_platform_listings` | Representa a oferta de um jogo. É o vínculo real que os itens do pedido usam no banco atual. | Existente. |
| `orders` | Registra comprador, número, total, situação e data do pedido. | Existente; passará a aguardar confirmação do gateway antes de ficar pago. |
| `order_items` | Identifica as ofertas compradas e o preço de cada unidade. | Existente; uma linha por unidade, sem adicionar quantidade. |
| `payments` | Registra tentativa, provedor, referência externa, método, valor, situação e datas de aprovação e estorno. | Nova. |

### 4.3 Como explicar os relacionamentos

1. Um **usuário** pode fazer vários **pedidos**.
2. Um **pedido** possui seus **itens**.
3. Cada **item** aponta para uma **oferta**, que pertence a um **jogo**.
4. Um **pedido** pode ter mais de uma **tentativa de pagamento**, mas será cobrado e entregue uma única vez com sucesso.

Os vínculos já existentes com plataformas e chaves dos jogos foram omitidos para manter o desenho pequeno. O recorte também não detalha histórico administrativo, notificações ou controle de geração de relatórios.

### 4.4 Pagamentos e dashboard

O pedido começa **pendente** e passa para **pago** somente após a confirmação validada do gateway. Cancelamento e estorno continuam sujeitos às regras do pedido; um administrador não marca uma compra como paga manualmente.

A nova tabela `payments` guardará a referência necessária para consultar a cobrança no provedor. Em um estorno integral, `refunded_at` registrará quando a devolução foi confirmada, e `amount` indicará seu valor. A data original de aprovação será preservada. Dados de cartão não serão armazenados.

O dashboard consultará essas tabelas para calcular vendas, ticket médio, clientes e jogos mais vendidos. Não será necessária uma tabela `dashboard`. Relatórios serão gerados a partir dessas consultas; detalhes de filas, auditoria e tratamento de falhas ficam fora deste DER resumido.

Os demais campos existentes de pedidos, como descontos e situação do pagamento, serão preservados. A integração deverá manter esses dados coerentes e impedir cobranças ou entregas duplicadas. Alterações físicas no banco serão feitas por novas migrations.

## 5. Diagramas de casos de uso

### Convenções de leitura

O retângulo delimita o sistema Nexus. Cliente, administrador e serviços externos são atores; API, banco e processadores internos não são atores nesses diagramas. Uma relação `<<include>>` aponta para um comportamento obrigatório; `<<extend>>` parte do comportamento adicional e aponta para o caso ampliado, sob a condição indicada. As fontes usam a notação de casos de uso do PlantUML. [Referência oficial](https://plantuml.com/use-case-diagram).

### 5.1 Pagamentos

[![Casos de uso de pagamentos](diagramas/01-casos-uso-pagamento.png)](diagramas/01-casos-uso-pagamento.png)

**Atores:** cliente, gateway de pagamento e serviço de e-mail. **Pré-condição:** cliente autenticado para realizar a compra e consultar seus pedidos.

- Realizar compra inclui escolher o método e criar a cobrança.
- O gateway participa da criação da cobrança e da sincronização do pagamento.
- Sincronizar a situação inclui validar a confirmação e atualizar o pedido.
- Entregar chaves estende a sincronização quando o pagamento é aprovado e a entrega é elegível.
- Notificar o cliente estende a sincronização quando existe mudança relevante. Não há novo envio para mera repetição de evento.
- Consultar status é uma ação independente; o cliente não precisa manter a tela aberta para que a confirmação ocorra.

O cliente autoriza ou efetua o pagamento no gateway. **A confirmação financeira é responsabilidade da integração**, e não de um botão que altere o pedido para pago.

**Cobertura:** RF01 a RF05 e RF10. **[Fonte editável](diagramas/01-casos-uso-pagamento.puml).**

### 5.2 Dashboard administrativo

[![Casos de uso do dashboard](diagramas/02-casos-uso-dashboard.png)](diagramas/02-casos-uso-dashboard.png)

**Ator:** administrador. **Pré-condição:** sessão válida e permissão para consultar indicadores; exportação exige permissão própria.

- Consultar dashboard inclui aplicar filtros e calcular indicadores. Na ausência de escolha explícita, aplica-se o período padrão.
- Comparar períodos estende a consulta quando solicitado.
- Consultar detalhes de um pedido estende a consulta quando o administrador seleciona um pedido.
- Exportar relatório estende a consulta quando solicitado e inclui gerar arquivo CSV ou PDF.

A API calculará as métricas; o administrador não precisará operar diretamente o banco. As ações de gestão do pedido previstas em RF06 serão acessíveis na tela de detalhes, respeitando permissões específicas.

**Cobertura:** RF07 a RF09, com acesso ao detalhamento de RF06. **[Fonte editável](diagramas/02-casos-uso-dashboard.puml).**

## 6. Diagramas de sequência

Cada seta representa uma mensagem. Leia de cima para baixo, seguindo a numeração. Os dois diagramas mostram somente o caminho principal, com quatro participantes em cada um.

### 6.1 Compra e pagamento

[![Sequência simplificada de pagamento](diagramas/03-sequencia-pagamento.png)](diagramas/03-sequencia-pagamento.png)

**Participantes:** cliente, Sistema Nexus, banco de dados e gateway. O Sistema Nexus reúne a interface e a API para facilitar a leitura.

**Como explicar:** o cliente escolhe como pagar; o Nexus cria o pedido e solicita a cobrança; o cliente paga no gateway; o Nexus valida a aprovação e registra a entrega das chaves. Ao consultar o pedido, o cliente vê a confirmação.

Este diagrama apresenta uma compra aprovada, com cliente autenticado e estoque disponível. Os caminhos alternativos, como pagamento pendente ou recusado, estão no fluxograma de pagamento.

**[PNG](diagramas/03-sequencia-pagamento.png) · [Fonte editável](diagramas/03-sequencia-pagamento.puml).**

### 6.2 Consulta do dashboard

[![Sequência simplificada do dashboard](diagramas/04-sequencia-dashboard.png)](diagramas/04-sequencia-dashboard.png)

**Participantes:** administrador, dashboard, API e banco de dados.

**Como explicar:** o administrador escolhe um período; a API verifica sua permissão, consulta os dados e calcula os indicadores; o dashboard apresenta os números e gráficos.

Este diagrama apresenta uma consulta autorizada. A geração e o download de relatórios são explicados separadamente no fluxograma de relatório.

**[PNG](diagramas/04-sequencia-dashboard.png) · [Fonte editável](diagramas/04-sequencia-dashboard.puml).**

## 7. Diagramas de fluxo — fluxogramas

Os fluxogramas usam **elipses** para início e fim, **retângulos** para ações, **losangos** para decisões e **paralelogramo** para saída de arquivo. As setas indicam a ordem e os caminhos de repetição.

### 7.1 Fluxo de pagamento

[![Fluxograma de pagamento](diagramas/05-fluxograma-pagamento.png)](diagramas/05-fluxograma-pagamento.png)

O fluxo começa com a revisão da compra, passa por validação, reserva e cobrança e aguarda confirmação. Há caminhos explícitos para revisão do carrinho, pagamento pendente, encerramento sem aprovação, entrega e estorno por impossibilidade de entrega.

“Fim deste processamento” não significa que não haverá novos eventos: uma confirmação de estorno, por exemplo, gerará outra atualização do pedido. Eventos não autenticados serão rejeitados antes do processamento. Uma tentativa de cobrança com resultado incerto permanecerá em recuperação, sem criação de cobrança adicional.

**[Fonte editável](diagramas/05-fluxograma-pagamento.puml).**

### 7.2 Fluxo de geração de relatório

[![Fluxograma de geração de relatório](diagramas/06-fluxograma-relatorio.png)](diagramas/06-fluxograma-relatorio.png)

O fluxo verifica a autorização, recebe os filtros, registra a solicitação, consulta dados e gera o arquivo. Distingue ausência de registros, falha de geração e download bloqueado ou expirado. Erros de consulta também encerram a tarefa como falha; perda de permissão durante o processamento impede a geração ou o download.

**[Fonte editável](diagramas/06-fluxograma-relatorio.puml).**

## 8. Relação entre requisitos e diagramas

| Requisitos | Onde são explicados |
| --- | --- |
| RF01–RF05 e RF10 | Caso de uso, sequência e fluxograma de pagamento. O DER mostra a ligação entre comprador, pedido, itens e pagamento. |
| RF06 | Gestão administrativa descrita nos requisitos; acesso ao pedido pelo caso de uso do dashboard. Histórico e observações ficam fora do DER resumido. |
| RF07–RF08 | Caso de uso e sequência do dashboard; fórmulas da seção 3. |
| RF09 | Caso de uso do dashboard e fluxograma de relatório. |
| RNF01–RNF05 | Qualidades exigidas nos dois módulos, conforme a seção 3. |

## 9. Sugestão de organização dos slides

| Slide | Conteúdo |
| --- | --- |
| 1 | Objetivo da evolução. |
| 2 | Requisitos funcionais RF01–RF05. |
| 3 | Requisitos funcionais RF06–RF10. |
| 4 | Requisitos não funcionais RNF01–RNF05. |
| 5 | KPIs do dashboard. |
| 6 | DER resumido, com as seis tabelas. |
| 7 | Caso de uso de pagamentos. |
| 8 | Caso de uso do dashboard. |
| 9 | Sequência simplificada de pagamento. |
| 10 | Sequência simplificada do dashboard. |
| 11 | Fluxograma de pagamento. |
| 12 | Fluxograma de geração de relatório. |

Use uma imagem por slide. As duas sequências agora cabem, cada uma, em um único slide. Se necessário, divida somente os fluxogramas verticais em capturas consecutivas.

## 10. Referências do projeto e da notação

### Base do repositório

- [Order.ts](../../backend/src/models/Order.ts), [OrderItem.ts](../../backend/src/models/OrderItem.ts), [GameKey.ts](../../backend/src/models/GameKey.ts) e [DeliveredKey.ts](../../backend/src/models/DeliveredKey.ts): pedidos, unidades, estoque e entrega.
- [GamePlatformListing.ts](../../backend/src/models/GamePlatformListing.ts), [Users.ts](../../backend/src/models/Users.ts) e [associations.ts](../../backend/src/models/associations.ts): catálogo, usuários e relacionamentos.
- [Migration inicial](../../backend/src/migrations/20260305000000-init-schema.js), [campos financeiros](../../backend/src/migrations/20260326090000-add-real-payment-fields-to-orders.js) e [remoção de campos do provedor](../../backend/src/migrations/20260326130000-remove-stripe-fields-from-orders.js): evolução do schema.
- [checkout.service.ts](../../backend/src/services/checkout.service.ts), [admin-order.service.ts](../../backend/src/services/admin-order.service.ts) e [admin.routes.ts](../../backend/src/routes/admin.routes.ts): comportamento atual considerado no planejamento.

### Ferramentas de edição

- O DER poderá ser editado no [dbdiagram](https://dbdiagram.io), utilizando [a sintaxe DBML](https://dbml.dbdiagram.io/docs/).
- As fontes `.puml` poderão ser editadas com [PlantUML](https://plantuml.com/). As fontes dos fluxogramas usam blocos `@startdot` com a sintaxe [Graphviz](https://graphviz.org/), preservando os desenhos aprovados.

As funcionalidades, metas, regras de negócio e estruturas adicionais deste documento constituem o projeto da evolução. A implementação deverá validar os contratos específicos do gateway escolhido e os critérios de aceitação definidos.
