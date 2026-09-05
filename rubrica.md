# Controle da Rubrica — Nexus Full

Última revisão: **04/09/2026**

Este arquivo mostra o que já foi feito e o que ainda falta para atender à rubrica da faculdade.

## Regra para futuras IAs

Sempre que uma IA alterar o projeto, ela deve:

1. verificar se a mudança afeta algum item abaixo;
2. atualizar o status e as evidências desse item;
3. adicionar uma linha no histórico ao final do arquivo.

Os diagramas serão feitos pelo autor no Excalidraw. A IA só deve alterar o status deles quando o autor confirmar que estão prontos.

## Legenda

- ✅ **Concluído:** já existe implementação suficiente.
- 🟡 **Parcial:** existe uma parte, mas ainda falta implementação ou comprovação.
- 👤 **Externo:** será produzido pelo autor fora do código.
- ⬜ **Pendente:** ainda não foi feito.

## Resumo

| Área | Máximo | Estimativa atual |
| --- | ---: | ---: |
| Desenvolvimento Mobile | 4,0 | 3,5 |
| Engenharia de Software | 4,0 | 1,0 |
| Tech Forge | 4,0 | 4,0 |
| **Total** | **12,0** | **8,5** |

> A pontuação é apenas uma estimativa. Itens parciais e diagramas pendentes não foram somados.

## 1. Desenvolvimento para Dispositivos Móveis — 4,0 pontos

| Critério | Pontos | Status | Evidências e pendências |
| --- | ---: | --- | --- |
| Arquitetura e padronização | 0,5 | ✅ | O Expo Router em `mobile/app` é a camada de páginas e rotas, organizada por pastas e ligada diretamente aos componentes por domínio em `mobile/src/components`, além de contextos e serviços próprios. A API também usa camadas bem definidas. |
| Componentização e clean code | 1,0 | ✅ | O mobile possui uma única raiz de componentes organizada por domínio, sem uma camada redundante de páginas, com helpers, tipos, TypeScript e ESLint. |
| CRUD completo: app ↔ API ↔ banco | 1,0 | ✅ | O CRUD de categorias possui telas mobile, rotas, controller, service, validator, model e banco. Falta apenas guardar prints ou vídeo do fluxo completo. |
| Regras de negócio | 0,5 | ✅ | Há validações, JWT, controle de estoque, carrinho, checkout, pedidos, keys e permissões de administrador. |
| Usabilidade, compatibilidade e segurança | 1,0 | 🟡 | O app usa Expo SDK 57, SecureStore, autenticação e recursos de acessibilidade. A interface mobile adota tipografia própria, navegação com largura estável, transições curtas executadas pelo driver nativo e desativadas quando “Reduzir movimento” está ativo, rótulos completos na aba ativa mesmo com cinco abas administrativas, cards de catálogo com proporção controlada, paginação que reposiciona o catálogo no topo, confirmações de avaliações temporárias, menu de conta sobreposto sem alterar o fluxo das telas principais, home e footer reorganizados, perfil com ações separadas e formulários administrativos com hierarquia e erros próximos da ação. Os grids da loja e do carrinho calculam a largura real dos containers, mantendo duas colunas nos celulares. O login mobile usa a API compartilhada, validação no cliente, SecureStore e agora permite HTTP apenas no desenvolvimento Android para conexão com o backend local; produção exige HTTPS. No frontend web, os cards de jogos da loja, ofertas, destaques, favoritos e administração usam capas mais baixas; os cards compactos priorizam título, plataforma, preço e ação, com categoria removida e altura vertical reduzida. A versão web responsiva também divide todas as rotas, posterga conteúdo fora da tela, usa imagens responsivas e remove efeitos caros no mobile; o build de produção foi corrigido para não incluir o runtime de desenvolvimento do React. No mobile, o card principal da loja, os destaques e as rails de descoberta também usam proporções mais horizontais; o card principal não repete a categoria e concentra o espaço em título, preço, plataformas e acesso aos detalhes. O carrinho mobile agora apresenta o resumo do pedido e a ação de checkout antes dos itens, usa linhas de item de largura total com controles de toque maiores e avisos de estoque junto ao item. A atualização de senha no perfil envia somente a senha e o backend aceita esse payload isolado. As rails horizontais da home e da descoberta agora virtualizam cards e imagens, os cards do catálogo são memoizados para limitar re-renderizações ao favoritar e o WebView do trailer só é carregado após interação. A home vertical agora também virtualiza as seções, os destaques são carregados após as interações iniciais, imagens remotas são redimensionadas na decodificação e apenas os três pesos de fonte usados bloqueiam a primeira renderização. A grade vertical do catálogo agora usa uma única `FlatList` com paginação, cabeçalho e trilhos horizontais, evitando montar a grade inteira dentro de um `ScrollView`. Lint, TypeScript, export web do bundle mobile e diff foram executados; ainda é necessário testar e documentar o funcionamento em aparelhos/telas diferentes. |

### Para concluir a parte mobile

- [ ] Testar em pelo menos dois celulares ou tamanhos de tela.
- [ ] Registrar dispositivo, sistema operacional, resultado e prints.
- [ ] Validar cadastro, login, catálogo, carrinho, checkout e acesso à key.
- [ ] Revisar contraste, tamanho das áreas de toque, labels e teclado.
- [ ] Registrar lint, build e testes antes da entrega.

## 2. Engenharia e Análise de Projeto de Software — 4,0 pontos

| Critério | Pontos | Status | Evidências e pendências |
| --- | ---: | --- | --- |
| Contextualização e evolução do produto | 1,0 | ✅ | `README.md` e `PRODUCT.md` explicam o problema, o público, o produto, a arquitetura e as funcionalidades. |
| Diagrama entidade-relacionamento | 0,5 | 👤 | Será feito no Excalidraw. Usar os models, associações e migrations do backend como referência. |
| Requisitos funcionais e não funcionais | 1,0 | 🟡 | As informações existem espalhadas na documentação, mas ainda precisam virar listas formais de RFs e RNFs. |
| Dois diagramas de casos de uso | 0,5 | 👤 | Sugestões: compra de jogo e gerenciamento do catálogo. |
| Dois diagramas de atividades | 0,5 | 👤 | Sugestões: checkout e cadastro de jogo com imagens. |
| Dois diagramas de sequência | 0,5 | 👤 | Sugestões: login e checkout com entrega da key. |

O arquivo `README_DIAGRAMAS.md` possui atores, fluxos, regras e endpoints que podem ajudar na criação dos diagramas.

### Para concluir a parte de engenharia

- [ ] Criar requisitos funcionais identificados como RF01, RF02 etc.
- [ ] Criar requisitos não funcionais identificados como RNF01, RNF02 etc.
- [ ] Criar o DER no Excalidraw.
- [ ] Criar dois diagramas de casos de uso.
- [ ] Criar dois diagramas de atividades.
- [ ] Criar dois diagramas de sequência.

## 3. Tech Forge — 4,0 pontos

| Critério | Pontos | Status | Evidências e pendências |
| --- | ---: | --- | --- |
| Receber e salvar imagens com Multer | 1,0 | *✅ | Um middleware Multer compartilhado recebe jogos, avatar, plataformas e promoções, salva temporariamente e organiza os arquivos por recurso em `backend/storage`, servidos por `/media`. Web e mobile enviam `FormData` para essas rotas. |
| Validar imagens | 1,0 | ✅ | A API valida extensão e MIME permitidos, limite único de 5 MB, campos permitidos e colisão de nomes com gravação exclusiva. Web e mobile restringem o seletor aos formatos aceitos. |
| Controle de administrador e usuário | 2,0 | ✅ | O backend implementa RBAC com `roles`, `permissions`, `user_roles` e `role_permissions`. Cada rota administrativa exige uma permissão específica carregada do banco; frontend web e mobile protegem o painel com `admin.access`, sem confiar em um booleano enviado pelo cliente. |

### Evidências que ainda devem ser registradas

- [x] Testes automatizados para extensão/MIME, limite configurado e nomes diferentes para arquivos com o mesmo nome original.

- [ ] Upload válido e imagem salva após reiniciar a aplicação.
- [ ] Rejeição de arquivo que não seja imagem.
- [ ] Rejeição de arquivo acima do tamanho permitido.
- [ ] Upload de dois arquivos com o mesmo nome sem colisão.
- [ ] Visitante recebendo erro 401.
- [ ] Usuário comum recebendo erro 403 em rota administrativa.
- [ ] Administrador acessando e alterando dados com sucesso.

## Próximas prioridades

1. Escrever os requisitos funcionais e não funcionais.
2. Testar o app em dispositivos diferentes.
3. Guardar prints ou vídeo do CRUD mobile e dos uploads.
4. Fazer o DER e os seis diagramas no Excalidraw.

## Histórico

| Data | Alteração | Autor |
| --- | --- | --- |
| 25/08/2026 | Documento adaptado para a rubrica atual. | IA |
| 25/08/2026 | Conteúdo resumido e reorganizado para facilitar a leitura. | IA |
| 25/08/2026 | Controle binário por `isAdmin` substituído por RBAC com roles e permissões no banco, API, frontend web e mobile. | IA |
| 31/08/2026 | Frontend mobile reorganizado com o Expo Router como camada de páginas e uma única árvore de componentes por domínio, sem `src/pages` redundante. | IA |
| 02/09/2026 | Uploads reorganizados em middleware Multer compartilhado, com validação de imagens, limite de 5 MB, extensão/MIME, limpeza de temporários e nomes exclusivos; web e mobile alinhados ao contrato. | IA |
| 03/09/2026 | Ajustes de usabilidade no mobile: menu expansível de conta na home, feedback temporário para avaliações, grade do catálogo com espaçamento consistente e refinamentos nos fluxos de compra e perfil. | IA |
| 03/09/2026 | Reestruturação visual mobile com Space Grotesk, home e loja refinadas, navegação estabilizada, perfil simplificado e fluxos administrativos de jogos e plataformas reorganizados; validações executadas com lint, TypeScript e export web. | IA |
| 03/09/2026 | Mobile atualizado para Expo SDK 57, com dependências compatíveis, configuração corrigida, peers ausentes adicionados e validação com expo-doctor, expo install --check, TypeScript e export web. | IA |
| 03/09/2026 | Atualização de senha do perfil isolada dos dados pessoais no payload mobile e no validator da API; teste de validação somente com senha adicionado. | IA |
| 03/09/2026 | Espaçamentos verticais da home mobile reduzidos em aproximadamente 25%, com a transição da hero para “Uma prévia do que vem por aí” significativamente compactada. | IA |
| 02/09/2026 | Paginação da loja mobile passou a voltar o catálogo para o topo automaticamente ao trocar de página. | IA |
| 02/09/2026 | Confirmações de avaliações no mobile passaram a desaparecer após 1,5 segundo e a ação “Marcar como útil” foi removida. | IA |
| 03/09/2026 | Barra inferior mobile passou a empilhar ícone e rótulo na aba ativa compacta, evitando o corte de “Carrinho” e de outros nomes quando o painel administrativo adiciona uma quinta aba. | IA |
| 03/09/2026 | Menu de conta do header mobile passou a usar posicionamento sobreposto, evitando que a abertura crie espaço e desloque o conteúdo das telas principais. | IA |
| 03/09/2026 | Grids da loja (`/jogo`) e do carrinho passaram a medir a largura real dos containers e arredondar a largura dos cards para baixo, preservando duas colunas nos celulares. | IA |
| 03/09/2026 | Logout no mobile passou a exigir confirmação nativa antes de encerrar a sessão, tanto nas configurações da conta quanto no menu da home. | IA |
| 03/09/2026 | Transições mobile ajustadas para movimento curto entre abas, navegação hierárquica nativa, redirects sem animação e feedback da barra inferior no driver nativo, com suporte a “Reduzir movimento”. | IA |
| 03/09/2026 | Chip “Trailer” removido do cabeçalho da prévia na home mobile, mantendo o player e seu controle de reprodução. | IA |
| 03/09/2026 | Altura das capas reduzida de forma consistente nos cards de jogos da loja, ofertas, carrosséis, favoritos e administração no web e no mobile. | IA |
| 03/09/2026 | Carrinho mobile reorganizado com resumo do pedido e checkout no topo, itens em lista de largura total, controles de quantidade mais claros, avisos de estoque junto ao item e skeleton de carregamento. | IA |
| 04/09/2026 | Performance mobile do frontend web otimizada com build React de produção, divisão das rotas públicas e administrativas, carregamento diferido, imagens responsivas, cache curto dos contadores e redução de efeitos de pintura em telas pequenas. | IA |
| 04/09/2026 | Proporção das imagens ajustada por contexto: aproximadamente +10% de altura nos cards da home e +30% nos cards e carrosséis da loja. | IA |
| 04/09/2026 | Card principal da loja mobile passou a ocultar a categoria e reduzir espaçamentos verticais, mantendo a ação de abrir detalhes com área de toque adequada. | IA |
| 04/09/2026 | Login mobile: tráfego HTTP para o backend local foi habilitado somente no desenvolvimento Android; produção continua exigindo HTTPS. Lint, TypeScript, configuração Expo, export web e diff foram verificados. | IA |
| 04/09/2026 | Corrigido o tratamento de `401` no cliente mobile: credenciais inválidas permanecem no formulário e exibem o erro, sem disparar logout/redirecionamento global. | IA |
| 04/09/2026 | Performance mobile otimizada: rails horizontais passaram a virtualizar itens, cards da loja foram memoizados com callbacks estáveis, a requisição duplicada de favoritos foi removida e o WebView do trailer passou a carregar sob demanda. Lint, TypeScript, export web, diff e detector foram verificados. | IA |
| 04/09/2026 | Performance mobile refinada: a home passou a virtualizar a rolagem vertical, os destaques foram adiados após as interações iniciais, imagens remotas passaram a usar redimensionamento nativo e o carregamento inicial foi reduzido aos três pesos de fonte usados. Lint, TypeScript, export Android e detector foram verificados; testes em aparelhos continuam pendentes. | IA |
| 04/09/2026 | Catálogo mobile passou a usar uma única `FlatList` vertical para a grade paginada, com cabeçalho, rodapé e trilhos horizontais preservados; a montagem dos cards deixou de ocorrer dentro de um `ScrollView`. Lint, TypeScript, export web do bundle mobile e medição estrutural foram verificados. | IA |
