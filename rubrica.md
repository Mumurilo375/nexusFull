# Controle da Rubrica — Nexus Full

Última revisão: **25/08/2026**

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
| Arquitetura e padronização | 0,5 | ✅ | O app está separado em rotas, componentes, contextos e serviços dentro de `mobile/`. A API também usa camadas bem definidas. |
| Componentização e clean code | 1,0 | ✅ | Existem componentes compartilhados, helpers, tipos, TypeScript e ESLint. Manter esse padrão nas próximas alterações. |
| CRUD completo: app ↔ API ↔ banco | 1,0 | ✅ | O CRUD de categorias possui telas mobile, rotas, controller, service, validator, model e banco. Falta apenas guardar prints ou vídeo do fluxo completo. |
| Regras de negócio | 0,5 | ✅ | Há validações, JWT, controle de estoque, carrinho, checkout, pedidos, keys e permissões de administrador. |
| Usabilidade, compatibilidade e segurança | 1,0 | 🟡 | O app usa Expo, SecureStore, autenticação e recursos de acessibilidade. Ainda é necessário testar e documentar o funcionamento em aparelhos/telas diferentes. |

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
| Receber e salvar imagens com Multer | 1,0 | *✅ | Existem uploads para jogos, avatar, plataformas e promoções. Os arquivos são salvos e servidos por `/media`. |
| Validar imagens | 1,0 | ✅ | Há filtro de imagem, limite de tamanho e geração de nomes únicos. Falta guardar evidências dos testes negativos. |
| Controle de administrador e usuário | 2,0 | ✅ | O backend implementa RBAC com `roles`, `permissions`, `user_roles` e `role_permissions`. Cada rota administrativa exige uma permissão específica carregada do banco; frontend web e mobile protegem o painel com `admin.access`, sem confiar em um booleano enviado pelo cliente. |

### Evidências que ainda devem ser registradas

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
