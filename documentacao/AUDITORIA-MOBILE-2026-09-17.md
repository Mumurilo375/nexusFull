# Auditoria do mobile e propostas de evolução

Data: 17/09/2026. Escopo: `mobile/`, com consulta aos contratos e regras do backend utilizados pelo aplicativo. Esta é uma auditoria; nenhuma correção funcional foi implementada.

## Resultado e limites

O aplicativo já possui uma base funcional ampla. A prioridade é tornar preços, paginação, sessão e operações administrativas consistentes antes de acrescentar funcionalidades. Foram registrados **24 pontos: 9 P1, 14 P2 e 1 P3**. Não foi confirmado um bloqueio geral P0 no aplicativo nativo.

- **P1:** corrigir prioritariamente; afeta compra, acesso, integridade ou acesso a registros.
- **P2:** próxima etapa; confiabilidade, acessibilidade, manutenção da experiência ou verificação.
- **P3:** melhoria gradual de manutenção.
- **Código:** comportamento identificado no código, sem executar o cenário completo no aparelho.
- **Reprodução isolada:** código real transpilado e executado com dependências controladas; não equivale a teste integrado.
- **Aparelho:** observação efetiva no dispositivo conectado.

Foram inventariados 129 arquivos JS/TS/TSX, aproximadamente 9.860 linhas, incluindo rotas, componentes, serviços e configurações. A análise combinou buscas globais, leitura dos fluxos por domínio e verificação dos contratos relevantes. Não equivale a uma prova de ausência de bugs ou a um pentest completo.

### Verificações executadas

| Verificação | Resultado e alcance |
| --- | --- |
| `cd mobile && npm run lint` | Passou. |
| `cd mobile && ./node_modules/.bin/tsc --noEmit` | Passou. Não existe script `typecheck` no manifest. |
| `cd mobile && npm audit --omit=dev --json` | Retornou 16 pacotes afetados: 14 moderados, 2 altos, 0 críticos. Inclui ferramentas transitivas de build. |
| `npm ls @xmldom/xmldom js-yaml decode-uri-component uuid --omit=dev` | Identificadas as cadeias de dependências; detalhes em A10. |
| Cliente HTTP em execução isolada | Reproduzidos cancelamento prévio ignorado, logout por resposta antiga e falha de GET público com implementação web vazia do SecureStore. |
| Moto G62 5G, Android 13, Expo Go | Inspecionados carrinho vazio, loja e detalhes de Hades; navegação loja → detalhes → voltar executada. Nomes de abas inativas ocultos confirmados. Retorno à aba do carrinho ao terminar. |
| API local, somente GET público | Catálogo informou 26 jogos. Comparadas consultas de promoções com e sem `activeNow=true`; a única campanha atual estava dentro do período. |
| `git diff --check` | Executado na documentação ao concluir. |

Não foram executados compra, alteração de dados, uploads, logout/login, exploração de vulnerabilidades, TalkBack, aumento de fonte, teste offline, iOS ou um segundo tamanho de tela. Não foi gerado novo build. A execução no Expo Go não certifica um binário de produção. Capturas de inspeção ficaram temporariamente em `/tmp`, fora do repositório.

## O que vale preservar

- Expo SDK 57 e React Native 0.86.3; o AGENTS.md ainda menciona SDK 54, portanto o manifest foi usado como referência.
- Rotas finas no Expo Router, componentes por domínio e cliente HTTP compartilhado.
- SecureStore nativo, validação da sessão armazenada e HTTPS obrigatório na API em produção.
- Autorização real no backend: JWT validado, permissões atuais carregadas do banco e restrição por proprietário nos recursos consultados.
- Valores e disponibilidade recalculados pelo backend no checkout, com transação e seleção de keys.
- Home, grade de catálogo e trilhos com virtualização; trailer carregado sob demanda.
- Redução de movimento, componentes de interação reutilizáveis, estados vazios e confirmações de exclusão.
- Uploads com normalização de MIME, limite de tamanho no cliente e transporte multipart dedicado. Isso não substitui validação de conteúdo no servidor.

## Achados prioritários

### A01 — P1 — Preço do carrinho não corresponde ao preço promocional do pedido

**Evidência: código.** `mobile/src/components/user/cart/Cart.tsx:21`, `mobile/src/components/user/checkout/Checkout.tsx:59`, `backend/src/services/cart.service.ts` e `backend/src/services/checkout.service.ts:103`.

Carrinho e resumo somam `listing.price`. O backend aplica a promoção ao criar o pedido, usando `pricing.finalPrice`. Exemplo: preço-base de R$ 100 com desconto de 50% pode aparecer como R$ 100 antes da confirmação e R$ 50 no pedido. O backend não confia no total do cliente; o problema é a informação apresentada para a decisão de compra.

**Melhoria:** a API devolver preço-base, desconto, preço final e totais do carrinho; mobile e web consumirem o mesmo contrato. Revalidar valores antes de concluir e comunicar alterações. **Aceite:** produto em promoção mantém a composição de preço coerente em detalhe, carrinho, checkout e pedido, incluindo promoção vencendo durante a compra.

### A02 — P1 — Loja pode anunciar promoções futuras ou vencidas

**Evidência: código; condição ainda não presente na campanha atual.** `mobile/src/components/loja/ProductCatalog.tsx:72` e `backend/src/services/promotion.service.ts:167`.

A loja consulta promoções sem `activeNow=true` e filtra apenas `isActive`. O backend só filtra o período quando recebe esse parâmetro; ainda calcula preços promocionais na serialização das campanhas retornadas. A home já usa o parâmetro correto em `HomeShowcase.tsx`.

**Melhoria:** alinhar a consulta da loja à home, respeitar disponibilidade dos listings e validar o período no servidor. **Aceite:** campanhas futura, vencida e desativada não aparecem como desconto vigente.

### A03 — P1 — Paginação visual esconde o limite real do catálogo

**Evidência: código; limite não atingido no banco atual de 26 jogos.** `mobile/src/components/loja/catalogData.ts:47` e `mobile/src/components/loja/ProductCatalog.tsx:41`.

Somente a primeira página de 60 jogos e de 200 listings é buscada; busca, filtros e paginação são aplicados sobre esses arrays. O 61º jogo nunca entra na busca local. Dados de plataforma e estoque também ficam condicionados ao subconjunto carregado e aos listings embutidos nos jogos.

**Melhoria:** paginação, busca e filtros na API, com metadados reais. Não resolver apenas aumentando um limite fixo. Opções de filtros precisam representar o catálogo completo. **Aceite:** encontrar por nome e categoria um jogo fora da primeira página, usando uma base maior que 60 jogos.

### A04 — P1 — Pedidos antigos deixam de ser acessíveis pela listagem

**Evidência: código.** `mobile/src/components/user/orders/Orders.tsx:27`.

Pedidos e histórico buscam `page=1&limit=30`, ignoram os metadados e não oferecem próxima página. Quem tiver mais de 30 pedidos não consegue consultar os anteriores por esse caminho.

**Melhoria:** paginação real ou carregamento incremental, com filtro por período/status. **Aceite:** acessar o 31º pedido pela interface. A biblioteca já usa paginação e pode servir de referência.

### A05 — P1 — Avaliação própria pode desaparecer do fluxo de edição

**Evidência: código.** `mobile/src/components/loja/Rating.tsx:27` e `:37`.

São carregadas apenas 20 avaliações. A avaliação do usuário é procurada dentro dessa página; se estiver fora dela, o app oferece publicar outra, e a API pode rejeitar por duplicidade. Contagem e média da seção também representam somente as avaliações carregadas.

**Melhoria:** buscar a avaliação própria separadamente, paginar as demais e usar estatísticas agregadas do backend. **Aceite:** usuário com avaliação antiga continua conseguindo editar/excluir quando há mais de 20 avaliações, com média e quantidade globais corretas.

### A06 — P1 — Promoção pode ficar parcialmente salva e ser duplicada na tentativa seguinte

**Evidência: código.** `mobile/src/components/admin/offers/AdminOffers.tsx:194`.

Primeiro a campanha é criada/atualizada; depois vários vínculos são enviados em `Promise.all`. Se um vínculo falhar, a campanha e os vínculos já concluídos permanecem. Na criação, o ID recebido fica apenas na variável local: repetir a ação pode criar outra campanha. O seletor também só carrega os primeiros 100 listings (`:81`).

**Melhoria:** endpoint que salve campanha e conjunto de vínculos atomicamente, tratando mídia e falhas; ou preservar o ID e reconciliar explicitamente o resultado parcial. Paginar/pesquisar o seletor na API. **Aceite:** falha no segundo vínculo não deixa uma campanha indevidamente publicada nem gera duplicação ao tentar novamente.

### A07 — P1 — Troca de senha sem confirmação da identidade e sem revogação de sessão

**Evidência: código, não houve tentativa de alteração.** `mobile/src/components/user/settings/AccountSettings.tsx:264`, `mobile/src/components/user/userForm.payload.utils.ts`, `backend/src/services/user.service.ts:168` e `backend/src/middlewares/auth.middleware.ts`.

A atualização envia apenas a nova senha. O servidor verifica o proprietário, mas não exige senha atual ou autenticação recente. A verificação do JWT não consulta versão/revogação de sessão associada à troca de senha. Uma sessão comprometida pode permitir alterar a senha, e tokens antigos não são invalidados por esse evento.

**Melhoria:** exigir reautenticação no backend para a troca, adicionar mecanismo de revogação e sincronizar o contrato entre web/mobile. A orientação de confirmar a identidade em operações sensíveis está na [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html). **Aceite:** senha atual incorreta é rejeitada e uma sessão revogada não continua autorizada.

### A08 — P1 — Resposta antiga pode derrubar uma sessão nova

**Evidência: reprodução isolada.** `mobile/src/services/api.ts:102` e `mobile/src/contexts/AuthContext.tsx`.

Uma requisição iniciada com o token A pode receber `401` depois de um login com token B. O handler global limpa a sessão sem conferir se a resposta pertence à sessão atual. Vários `401` também podem iniciar vários logouts/redirecionamentos.

**Melhoria:** associar requisições à geração da sessão, invalidar somente a sessão correspondente e executar a expiração uma vez. **Aceite:** `401` atrasado de A não apaga B; respostas simultâneas não provocam múltiplas navegações.

### A09 — P1 — Expo web não possui implementação de armazenamento de sessão

**Evidência: código e reprodução isolada com a implementação web instalada.** `mobile/src/services/auth.ts:37` e `mobile/src/services/api.ts:63`.

O SecureStore é chamado sem alternativa por plataforma; sua implementação web instalada exporta um objeto vazio. Toda requisição, inclusive catálogo público e login, tenta ler o token antes de chamar o transporte. Assim, uma exportação web bem-sucedida não significa que os fluxos HTTP funcionem no navegador.

**Melhoria:** definir se Expo web faz parte da entrega. Se fizer, criar um adaptador web de sessão adequado, mantendo SecureStore em Android/iOS; uma sessão apenas em memória pode atender testes sem persistir credenciais de forma insegura. A disponibilidade nativa é descrita na [documentação do SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/). **Aceite:** catálogo anônimo e login funcionam no navegador sem chamadas nativas ausentes. Não foi reproduzido em navegador nesta auditoria.

## Melhorias da próxima etapa

| ID | Prioridade / evidência | Ponto e impacto | Ação e verificação sugeridas |
| --- | --- | --- | --- |
| A10 | P2 · ferramenta | **Dependências com alertas.** Audit apontou 16 pacotes afetados, sem comprovação de exploração no Nexus. | Atualizar de modo compatível com o SDK e revisar as cadeias abaixo; não executar correção forçada que proponha downgrade do Expo. Validar tipos, bundles e navegação após atualizar. |
| A11 | P2 · código | **Trocar avatar pode apagar dados em edição.** O efeito de `AccountSettings.tsx:105` depende de `authUser.avatarUrl` e recarrega todos os campos. O upload chama `syncUser`, alterando essa dependência. | Separar sincronização da foto e formulário; preservar campos alterados. Testar editar nome → trocar foto → conferir o nome antes de salvar. |
| A12 | P2 · código | **Biblioteca mostra preço atual, não o valor da compra.** `OrderLibrary.tsx:77` usa `item.listing.price`, embora o item comprado tenha `price`. | Usar o preço histórico do item, ou retirar o preço se não for útil. Alterar o preço do catálogo e conferir que a compra antiga permanece consistente. |
| A13 | P2 · reprodução isolada | **Cancelamento prévio ignorado e cancelamento confundido com timeout.** `api.ts:85` só adiciona listener, sem testar `externalSignal.aborted`; `:118` converte qualquer abort em `408`. | Verificar sinal previamente cancelado e distinguir cancelamento intencional de demora. Nenhuma chamada deve sair se já foi abortada; sair da tela não deve produzir alerta de conexão lenta. |
| A14 | P2 · código | **Consultas redundantes e estado duplicado.** Carrinho e favoritos são carregados por efeito e foco; mutações do carrinho recarregam e emitem evento que dispara novas consultas em outros componentes. | Centralizar estado por usuário, compartilhar requisições em andamento e invalidar após mutações. Medir chamadas por entrada na aba e por alteração de quantidade; não instalar uma biblioteca apenas para esconder a duplicação. |
| A15 | P2 · código | **Feedback de recarga incorreto e erro do checkout apagado.** `ProductCatalog.tsx:150` encerra `refreshing` antes da consulta; `Checkout.tsx:81` define erro e chama `loadCart`, que limpa o mesmo erro. | Separar erro de consulta e erro da ação; aguardar a atualização real. Testar rede lenta e rejeição por estoque. A mensagem precisa permanecer visível após a atualização do carrinho. |
| A16 | P2 · código | **Busca promete categoria, mas só consulta título e descrição.** `store.utils.ts:121`; também não reinicia `page` quando termo/filtro muda. | Incluir categorias/tags, normalizar acentos e reiniciar na primeira página. Buscar uma categoria ausente do título/descrição e trocar filtros a partir da página 3. Integrar à solução de A03. |
| A17 | P2 · aparelho + código | **Nomes das abas inativas ficam invisíveis.** `AnimatedBottomTabBar.tsx:162` aplica opacidade zero ao texto inativo. Na navegação administrativa, só a aba ativa renderiza o nome. | Exibir rótulos persistentes, mantendo a largura estável. Conferir quatro e cinco abas com fonte ampliada. A rubrica descreve nomes sempre visíveis, mas isso não corresponde à implementação atual. |
| A18 | P2 · código | **Acessibilidade incompleta em campos e avaliações.** `adminShared.tsx:97` e `RegisterPage.tsx` não associam o label ao input; notas não anunciam seleção em `Rating.tsx:154`; há alvos de 38/40 unidades em `Rating.tsx:182`. | Rótulos acessíveis, estados selecionado/ocupado, foco no erro e áreas de toque adequadas. Testar TalkBack/VoiceOver, fonte ampliada e contraste. Os textos React Native continuam escaláveis por padrão; tamanho numérico sozinho não prova bloqueio de escala. |
| A19 | P2 · código | **Voltar administrativo adiciona outra rota.** `adminShared.tsx:150` usa `router.push(backTo)`. Listas dependem principalmente de montagem, podendo mostrar dados antigos ao retornar. | Usar retorno da pilha com fallback e atualizar/invalidate dados ao concluir edição. Testar lista → editar → voltar repetidamente, inclusive após salvar, sem acumular telas. |
| A20 | P2 · código | **Keys reveladas permanecem no estado ao sair da tela/background.** `OrderLibrary.tsx` e `OrderDetails.tsx` mantêm `visibleKeys`; `CopyKeyButton` observa AppState somente para animação. | Ocultar ao perder foco/background e considerar proteção da prévia no seletor de apps. Biometria opcional pode complementar. Conferir ida ao background e retorno sem revelar automaticamente. Isso é exposição visual local, não um bypass comprovado da API. |
| A21 | P2 · código | **Falha de sincronização vira estado vazio silencioso.** `ProductCatalog.loadFavorites`, `ProductDetails.loadCartSelections` e `AnimatedBottomTabBar.loadCartQuantity` zeram dados no catch. | Manter último estado conhecido e indicar falha; distinguir ausência real de dados de erro de rede. Testar abrir detalhe com carrinho já preenchido e consulta falhando, evitando sugerir adição duplicada. |
| A22 | P2 · código | **Monitor de keys aceita resposta de plataforma anterior.** `AdminGamePlatforms.tsx:18` atualiza um estado único sem identificar/cancelar a requisição. Fechar A e abrir B antes da resposta pode mostrar keys de A no modal B. | Invalidar resultados por listing e geração da requisição; limpar o estado ao trocar plataforma e evitar alterações concorrentes. Testar respostas fora de ordem. Nenhuma remoção indevida foi executada nem comprovada. |
| A23 | P2 · estrutura | **Mobile fora da verificação principal e sem suíte própria.** `mobile/package.json` não tem testes/typecheck; o `check` da raiz só inclui web/backend; Playwright aponta por padrão para o frontend web. | Incluir lint e tipos do mobile na rotina; testes de sessão, HTTP, uploads, datas e preços; fluxos nativos de compra/admin com ferramenta E2E. O Expo documenta [Jest e testes de componentes](https://docs.expo.dev/develop/unit-testing/). |
| A24 | P3 · código | **Manutenção difícil apesar da separação por domínio.** Foram encontradas 56 ocorrências de `as never`, controles/estados repetidos, cores espalhadas e funções administrativas inteiras em uma linha. | Usar rotas tipadas, formatar os módulos mais densos, extrair pequenas operações por domínio e compartilhar tokens/estados. Fazer gradualmente ao tocar cada área, preservando o visual escuro e evitando uma reestruturação geral. |

### Detalhamento dos alertas de dependências

`npm ls` confirmou:

- `expo-router@57.0.19 → query-string@7.1.3 → decode-uri-component@0.2.2`. Há um aviso de negação de serviço por entrada codificada malformada; precisa avaliar alcance no processamento de links do app. [Advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr).
- `expo → @expo/cli → @expo/plist → @xmldom/xmldom@0.8.14` e `expo → @expo/config-plugins → xcode → plist → @xmldom/xmldom@0.9.11`: alertas altos transitivos, associados aqui a ferramentas/configuração nativa.
- `expo → @expo/cli → @expo/xcpretty → js-yaml@4.3.1`: alerta alto de consumo de CPU ao processar certas entradas YAML. [Advisory](https://github.com/advisories/GHSA-2883-xcg3-v3hh).
- `xcode → uuid@7.0.3`: outro alerta moderado transitivo.

Os 16 registros não representam 16 explorações independentes: o audit também propaga o impacto aos pacotes ancestrais. A classificação de risco para o produto depende de onde a dependência é executada e de receber ou não dados controlados externamente.

## Interface, adaptação e experiência nativa

O app usa estrutura nativa de abas/pilhas, mas ainda tem padrões de página web, como cabeçalhos extensos, rodapé e muitos painéis. Isso não exige redesenho: preservar a identidade e priorizar descoberta, compra e biblioteca.

Avaliação preliminar por código e três telas em um Android; não é nota da rubrica acadêmica nem certificação de acessibilidade:

| Dimensão | Estimativa / 4 | Motivo |
| --- | --- | --- |
| Acessibilidade | 2 | Bons exemplos de roles e redução de movimento; labels, estados e alvos ainda inconsistentes. |
| Desempenho | 3 | Virtualização e carregamento adiado já existem; consultas repetidas e favoritos sem virtualização merecem revisão. Não houve medição de FPS/memória. |
| Tema e consistência | 2 | Identidade escura coerente; tokens só parcialmente compartilhados e manifest declara aparência automática. |
| Convenções de plataforma | 3 | Navegação básica funcionou no Android; nomes de abas e retorno administrativo precisam melhoria. Gestos/iOS não certificados. |
| Adaptação | 2 | Breakpoints e insets existem; teclado administrativo, fonte ampliada, landscape e tablets ainda precisam ser exercitados. |
| **Total preliminar** | **12/20** | Base utilizável com melhorias relevantes; dimensões sem teste completo têm confiança limitada. |

Revisões adicionais dirigidas:

- `AdminLayout` e o modal de keys não possuem tratamento de teclado equivalente aos formulários de login/perfil. Verificar último campo e botão de salvar no iOS e em Android com teclado aberto.
- Telas como pedidos, biblioteca e checkout usam SafeArea apenas no topo e padding inferior fixo. Validar navegação por gestos e landscape; não houve sobreposição comprovada nas telas observadas.
- Favoritos usa `ScrollView` com todos os itens. Migrar para lista virtualizada se crescer; não há necessidade de trocar bibliotecas das listas que já funcionam.
- `app.json` declara aparência automática, mas o app usa cores escuras fixas. Alinhar a configuração à experiência escura pretendida; tema claro é opcional.
- A seção de plataformas alterna automaticamente a seleção a cada 4,2 segundos. Parar a alternância após escolha manual e enquanto houver interação evita trocar o destino de “Explorar catálogo”.
- Desacoplar o hub de conta do formulário completo pode tornar biblioteca, pedidos e favoritos mais fáceis de encontrar. Fazer como melhoria de navegação, preservando as rotas existentes.
- O login não conserva a intenção ao passar pelo cadastro: o link de criar conta não transporta `from`. Manter esse contexto e mostrar confirmação de cadastro evita voltar ao perfil depois de iniciar uma compra.

Para tratar a interface em etapas: `$impeccable harden` para estados de erro, `$impeccable adapt` para teclado/insets/tamanhos, `$impeccable clarify` para busca e preços, `$impeccable audit` para nova verificação e `$impeccable polish` após as correções. Podem ser solicitados individualmente ou em conjunto.

## Novas implementações recomendadas

As propostas abaixo são escolhas para o Nexus, com base no código e em documentação oficial consultada. Complexidade relativa: pequena, média ou grande; não representa prazo contratado. Pagamentos, reserva de keys e dashboard **já estão planejados** em [PROPOSTA.md](evolucao/PROPOSTA.md), mas não foram encontrados implementados nos fluxos atuais. São continuação do planejamento existente.

| Ordem | Funcionalidade | MVP e benefício | Reaproveitamento / dependências | Complexidade |
| --- | --- | --- | --- | --- |
| 1 | **Recuperação de senha** | Solicitar link/código, definir nova senha e voltar ao login; elimina o bloqueio explicitamente anunciado no login atual. | Novos endpoints, token de uso único com expiração, envio de email e revogação de sessões. Mensagens não devem revelar se uma conta existe. | Média |
| 2 | **Alertas de preço e reposição** | Escolher jogo + plataforma e preço-alvo; receber aviso quando baixar ou voltar ao estoque. | Favoritos, promoções, listings e estoque já existem. Acrescentar preferências, dispositivos e envio no backend; deduplicar avisos. | Média |
| 3 | **Biblioteca com biometria e instruções de ativação** | Solicitar autenticação local antes de revelar/copiar; mostrar instrução específica para Steam, Xbox ou PlayStation. | Biblioteca e clipboard existentes; módulo nativo de biometria, fallback e ocultação ao sair. Autorização do backend permanece necessária. | Pequena–média |
| 4 | **Compartilhamento de jogos por link** | Compartilhar um produto e abrir exatamente seus detalhes; se o app não estiver instalado, abrir o site. | Expo Router e domínio web existentes; Android App Links/iOS Universal Links e arquivos de associação do domínio. Evitar IDs privados de pedidos em links públicos. | Média |
| 5 | **Catálogo disponível sem conexão** | Mostrar últimos dados sincronizados, com indicação de atualização e tentativa de reconectar. | Cache persistente público via SQLite; preços/estoque sempre revalidados ao comprar. Não colocar tokens ou keys em cache público. | Média |
| 6 | **Histórico de preços para o comprador** | Gráfico simples por jogo/plataforma e comparação com o preço atual. | Auditoria de preços existente, mas requer endpoint público limitado e política de retenção; não expor dados administrativos. | Média |
| 7 | **Pagamento integrado e reserva de keys** | Começar por Pix com QR Code/copia e cola, expiração e retomada; entregar key após confirmação confiável. | Proposta RF01–RF05; migrations, pedido pendente, reserva, idempotência, webhook validado e reconciliação. O código atual cria pedido pago imediatamente. | Grande |
| 8 | **Dashboard de operação** | Vendas por período, ticket médio, estoque baixo e produtos mais vendidos; links para ações administrativas. | O dashboard atual é um menu. Implementar agregados na API com permissão e filtros; aproveitar RF07–RF09, começando com consultas simples ao PostgreSQL. | Média–grande |

### Fontes e restrições relevantes para os MVPs

- **Recuperação de senha:** seguir expiração, uso único e respostas uniformes da [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). Não basta acrescentar o formulário.
- **Alertas:** a associação entre wishlist e notificações de promoção é documentada pelo [Steamworks](https://partner.steamgames.com/doc/marketing/wishlist); serve como referência de produto, sem implicar integração oficial com Steam. O [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) e o [guia de configuração push](https://docs.expo.dev/push-notifications/push-notifications-setup/) orientam tokens, permissões e credenciais. Push remoto no Android exige development build, não apenas Expo Go. O aviso deve abrir o item pertinente, nunca conter a key.
- **Biometria:** [Expo LocalAuthentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/) oferece autenticação local; Face ID precisa de development build para teste. Não substitui login/JWT nem demonstra posse de uma conta ao servidor.
- **Links:** [guia de linking do Expo](https://docs.expo.dev/linking/overview/) explica links de aplicação e associação a domínio. O scheme genérico `mobile` atual não equivale a Universal Links/App Links verificados.
- **Offline:** [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) oferece persistência local. A proposta é consulta offline; finalização da compra continua online.
- **Pagamento:** [Pix com Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/pix) fornece QR Code e copia e cola; [notificações de orders](https://www.mercadopago.com.br/developers/en/docs/checkout-api-orders/notifications) documenta validação da origem. A confirmação e a entrega devem ocorrer no servidor; retornar ao app após pagar não comprova aprovação.

Funcionalidades opcionais para depois: filtros por faixa de preço/ordenação, recomendação simples por categorias/plataformas, aviso de jogo já comprado, favoritos de visitante com sincronização no login, suporte associado ao pedido e lembrete para avaliar compras. Estas são propostas de produto, não funcionalidades encontradas prontas.

## Sequência sugerida

1. **Confiabilidade comercial:** A01, A02, A03, A04, A05, A06 e A15. Validar catálogo grande, promoções por período e falhas parciais.
2. **Sessão e segurança:** A07, A08, A09, A10, A13 e A20. Definir formalmente se Expo web é alvo de entrega.
3. **Experiência e manutenção:** demais achados; priorizar acessibilidade, nomes de abas e preservação de dados em edição. Adicionar testes dos bugs corrigidos.
4. **Primeira nova entrega:** recuperação de senha; depois alertas de favoritos e biometria, que aproveitam os diferenciais do celular.
5. **Evolução arquitetural:** pagamento + reserva de keys + acompanhamento, seguidos do dashboard analítico já proposto.

Para a avaliação acadêmica, o maior ganho imediato é comprovar os fluxos que já existem: dois tamanhos de tela, CRUD, uploads válidos/inválidos, permissões 401/403/admin e compra até a biblioteca. A inspeção parcial desta auditoria não conclui esses critérios nem os diagramas externos.

## Ajustes documentais identificados

A documentação contém algumas divergências: AGENTS.md menciona SDK 54 e diretórios antigos, enquanto o código usa SDK 57; `rubrica.md` referencia `documentacao/README-1-IDEIAS.md`, que não foi encontrado; a evidência de rótulos sempre visíveis nas abas não corresponde à opacidade atual. Estes pontos foram registrados, sem alterar READMEs ou marcar requisitos externos como concluídos.
