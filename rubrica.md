# Rubrica do Projeto Nexus Full

Documento de acompanhamento baseado na rubrica enviada em `rubrica.pdf` e no estado do repositório em **08/08/2026**.

## Legenda

| Status | Significado |
|---|---|
| ✅ Implementado | Há implementação ou evidência suficiente no repositório para considerar o requisito atendido. |
| 🟡 Parcial | Existe uma parte do requisito, mas ainda faltam documentação, integração, cobertura, validação ou evidência formal. |
| ⬜ Zerado | Não encontrei implementação ou evidência do requisito no repositório. |

> Os status abaixo são uma avaliação de acompanhamento, não a nota oficial dos professores. A rubrica permite níveis de atendimento de 100%, 75%, 50%, 25% e 0%; “Parcial” não significa automaticamente 50%.

## Resumo atual

| Bloco | Pontuação máxima indicada na rubrica | Implementados | Parciais | Zerados | Situação geral |
|---|---:|---:|---:|---:|---|
| Desenvolvimento para Dispositivos Móveis | 4,0 | 3 | 1 | 1 | 🟡 Bom avanço técnico; falta comprovar compatibilidade/usabilidade e segurança de forma completa. |
| Engenharia e Análise de Projetos de Software | 4,0 | 1 | 1 | 3 | 🟡 Implementação existe, mas faltam entregáveis formais de análise. |
| Tech Forge | 4,0 | 0 | 2 | 2 | 🟡 E2E e GitFlow existem; Husky e gestão do projeto precisam ser concluídos/documentados. |
| Avaliação do projeto | até 0,8 | 0 | 1 | 0 | 🟡 A persona está definida, mas falta evidência formal de validação. |

## 1. Desenvolvimento para Dispositivos Móveis

| # | Critério da rubrica | Peso máximo | Status | Evidências encontradas | O que falta ou como comprovar |
|---:|---|---:|---|---|---|
| 1 | Arquitetura e padronização de projeto | 0,5 | ✅ Implementado | frontend e backend separados; backend organizado em `routes`, `controllers`, `services`, `validators`, `models` e `middlewares`; padrões descritos em `AGENTS.md`. | Manter a convenção e, se necessário, produzir um diagrama simples da arquitetura para a apresentação. |
| 2 | Componentização e boas práticas de desenvolvimento com clean code | 1,0 | ✅ Implementado | frontend dividido em páginas, componentes, contexts e services; backend separado por camadas; há TypeScript, validações e testes. | Fazer uma revisão final de duplicações, nomes e funções muito extensas antes da entrega. |
| 3 | Desenvolvimento de pelo menos um CRUD completo com comunicação aplicativo ↔ API ↔ banco de dados | 1,0 | ✅ Implementado | CRUDs de jogos e categorias aparecem nas rotas, controllers, services, models/migrations e testes E2E em `tests/crudGame.spec.ts` e `tests/crudCategoria.spec.ts`. | Guardar evidências de execução com sucesso, edição, listagem e exclusão para a banca. |
| 4 | Regra de negócio respeitada entre cada funcionalidade | 0,5 | ✅ Implementado | Há regras de autenticação/JWT, validação de payloads, estoque, carrinho, checkout, keys, permissões administrativas e tratamento de erros. | Relacionar cada regra a um requisito ou caso de uso documentado. |
| 5 | Usabilidade, funcionalidade principal, compatibilidade entre dispositivos e segurança da aplicação | 1,0 | 🟡 Parcial | Fluxo principal implementado; há HTTPS local, headers de segurança no Nginx, JWT e mensagens amigáveis. | Validar desktop e mobile em diferentes larguras, documentar os testes, revisar acessibilidade e apresentar evidências de segurança. |

### Compatibilidade do banco

A rubrica/imateriais anteriores mencionam MySQL em alguns pontos, mas o projeto usa PostgreSQL. O repositório documenta PostgreSQL como escolha do projeto e a rubrica deve ser confirmada com os professores caso MySQL seja uma exigência literal.

## 2. Engenharia e Análise de Projetos de Software

| # | Critério da rubrica | Peso máximo | Status | Evidências encontradas | O que falta ou como comprovar |
|---:|---|---:|---|---|---|
| 1 | Contextualização do problema a ser resolvido, com documentação sobre a ideia do projeto e as etapas necessárias | 0,5 | ✅ Implementado | `README.md` explica o problema, objetivo acadêmico, fluxo, funcionalidades, stack e execução; `PRODUCT.md` registra usuários, propósito, posicionamento e contexto. | Se a disciplina exigir um documento separado, criar uma versão acadêmica com problema, objetivos, escopo e etapas. |
| 2 | Requisitos funcionais e não funcionais do projeto | 1,0 | 🟡 Parcial | Funcionalidades, rotas, segurança, infraestrutura e restrições aparecem em `README.md`, `AGENTS.md` e `PRODUCT.md`. | Criar uma seção/documento formal com identificadores, descrição, prioridade, critérios de aceite e requisitos não funcionais. |
| 3 | Apresentar no mínimo 2 diagramas de casos de uso encontrados nas funcionalidades do projeto | 0,5 | ⬜ Zerado | Não encontrei diagramas de casos de uso no repositório. | Criar pelo menos dois diagramas, por exemplo: usuário realizando compra de key e administrador gerenciando catálogo. Exportar para PDF/PNG e versionar. |
| 4 | Apresentar no mínimo 2 diagramas de atividades representativos dos fluxos do projeto | 1,0 | ⬜ Zerado | Não encontrei diagramas de atividades/fluxogramas versionados. | Criar pelo menos dois: compra completa (catálogo → carrinho → checkout → key) e cadastro/gerenciamento de jogo no painel. |
| 5 | Apresentar no mínimo 2 diagramas de sequência que representem fluxos do projeto | 1,0 | ⬜ Zerado | Não encontrei diagramas de sequência no repositório. | Criar pelo menos dois: login/autenticação e checkout com criação de pedido e entrega da key. |

## 3. Tech Forge

| # | Critério da rubrica | Peso máximo | Status | Evidências encontradas | O que falta ou como comprovar |
|---:|---|---:|---|---|---|
| 1 | Gestão do trabalho e progresso via Jira: issues (stories, tasks e bugs), atribuições e atualizações de status | 1,0 | ⬜ Zerado | Não encontrei exportação, link, prints ou documentação de um quadro Jira no repositório. | Manter o projeto no Jira, criar/organizar stories, tasks e bugs, atribuir responsáveis, mover os cards e salvar prints/exportação como evidência. |
| 2 | Análise do contexto do projeto com Cynefin e escolha da abordagem | 1,0 | ⬜ Zerado | Não encontrei análise Cynefin nem justificativa formal de abordagem. | Classificar o contexto/domínios do projeto com Cynefin e justificar a escolha de gestão preditiva, ágil ou híbrida. |
| 3 | Planejamento e execução do ciclo de vida do projeto | 2,0 | 🟡 Parcial | Há código funcional, Docker, testes, branches, releases e documentação de execução. | Documentar as fases do ciclo de vida, plano do projeto, PM Canvas, papéis e responsabilidades, cronograma, monitoramento/controle e encerramento. |
| 4 | Para projetos ágeis/Scrum: Product Backlog claro, priorizado e gerenciado; User Stories com critérios de aceite; padronização e implementação de versões | — | 🟡 Parcial | Existem branches `feature`, `release`, `hotfix`, `dev` e `main`, além de funcionalidades que podem compor o backlog. | Criar um Product Backlog versionado ou exportado, priorizar itens, escrever User Stories com critérios de aceite e relacioná-los às versões/releases. |

> A rubrica apresenta o item de Scrum dentro do critério de planejamento/ciclo de vida; ele deve ser entregue se a abordagem escolhida para o projeto for ágil/Scrum.

## 4. Avaliação do projeto

| # | Critério da rubrica | Peso máximo | Status | Evidências encontradas | O que falta ou como comprovar |
|---:|---|---:|---|---|---|
| 1 | A proposta desenvolvida tem conexão com a persona/cliente? | 0,2 por avaliador, conforme a rubrica | 🟡 Parcial | `PRODUCT.md` define gamers como usuários principais; o fluxo de catálogo, plataforma, compra simulada e consulta da key atende essa persona. | Registrar validação da proposta com a persona: roteiro de teste, feedback de usuários/colegas, ajustes realizados e prints da aplicação. |

## Entregáveis que ainda precisam ser priorizados

1. Requisitos funcionais e não funcionais formais.
2. Dois diagramas de casos de uso.
3. Dois diagramas de atividades.
4. Dois diagramas de sequência.
5. Evidências do Jira com issues, responsáveis e progresso.
6. Análise Cynefin e justificativa da abordagem de gestão.
7. Plano de ciclo de vida, PM Canvas, papéis, cronograma e encerramento.
8. Product Backlog priorizado com User Stories e critérios de aceite.
9. Validação da solução com a persona e registro dos feedbacks.
10. Teste final responsivo, de acessibilidade, segurança e execução para a apresentação.

## Evidências técnicas já disponíveis

- `README.md`: objetivo, fluxo, funcionalidades, rotas, stack, execução e infraestrutura.
- `PRODUCT.md`: usuários, propósito, posicionamento, contexto, capacidades, restrições e princípios.
- `frontend/` e `backend/`: implementação full stack.
- `tests/`: testes E2E de login, cadastro e CRUDs.
- `backend/__tests__/` e `frontend/src/__tests__/`: testes unitários.
- `docker-compose.yml`: banco, backend, frontend, volumes, healthchecks e rede.
- `frontend/nginx.conf`: HTTPS local, redirecionamento HTTP, proxy reverso e headers de segurança.
- Branches Git: `main`, `dev`, `feature/*`, `release/*` e `hotfix/*`.

## Observações de entrega

- O Nexus Full é um projeto acadêmico e uma simulação; não deve ser apresentado como loja comercial real.
- Não afirmar integração oficial, venda real ou afiliação com Steam, Xbox ou PlayStation.
- Confirmar com os professores se PostgreSQL é aceito no lugar de MySQL, caso essa exigência apareça literalmente na rubrica.
- Antes da entrega, atualizar os status deste arquivo com links para os documentos, imagens, exports do Jira e evidências de execução.
