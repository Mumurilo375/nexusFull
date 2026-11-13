# ADR-001 — Escolha do PostgreSQL como banco de dados principal

- **Identificador:** ADR-001
- **Data:** 12 de novembro de 2026
- **Sistema:** Nexus Full

## 1. Status da decisão

**Aceita para a arquitetura documentada.** O backend atual usa PostgreSQL por meio do Sequelize. Este ADR formaliza e justifica essa escolha para fins de arquitetura e apresentação acadêmica. Os critérios abaixo foram reconstruídos a partir dos requisitos e do código existente; não afirmam que houve um processo histórico de avaliação ou aprovação registrado anteriormente.

## 2. Contexto e problema arquitetural

O Nexus Full é um e-commerce acadêmico de jogos digitais. A compra associa usuários, carrinho, anúncios de jogos por plataforma, pedidos, itens de pedido, pagamentos e chaves digitais. Durante o checkout, o backend reserva chaves e cria itens associados ao pedido; após a confirmação, o fluxo de pagamento atualiza o pedido e a entrega.

O backend é desenvolvido em Node.js, Express e TypeScript, usa Sequelize para persistência, possui models relacionais, associações centralizadas, migrations e seeders. O problema arquitetural é escolher uma base que mantenha esses dados relacionados coerentes, sobretudo quando uma operação de compra altera estoque e pedido em conjunto.

## 3. Requisitos que influenciaram a decisão

- Persistir entidades com relações claras: usuários, jogos, plataformas, anúncios, categorias, pedidos, itens e chaves.
- Preservar integridade referencial e regras de unicidade, por exemplo nas relações e nas chaves de jogo.
- Executar transações em operações coordenadas de checkout, reserva e atualização de estoque.
- Consultar e filtrar catálogo, pedidos, histórico e permissões com consultas relacionais.
- Manter compatibilidade com Node.js, TypeScript e Sequelize já usados no backend.
- Evoluir esquema com migrations reproduzíveis e preparar dados de demonstração com seeders.
- Facilitar manutenção, testes locais e execução por Docker Compose.

## 4. Alternativas tecnológicas avaliadas

### PostgreSQL

Banco relacional de código aberto, com transações ACID, constraints e recursos SQL maduros. Ajusta-se às associações do domínio e é o dialeto configurado no Sequelize do backend. Requer modelagem e manutenção de schema, além de operação de um serviço de banco.

### MySQL

Banco relacional amplamente utilizado, com transações e integridade referencial quando configurado com mecanismo transacional apropriado. Atenderia grande parte do domínio e também possui suporte no ecossistema Sequelize. A escolha exigiria configurar e manter outro dialeto, revisar migrations e validar diferenças de SQL, tipos, índices e comportamento transacional. Não há evidência no repositório de que MySQL tenha sido testado para esta aplicação.

### MongoDB

Banco documental que oferece flexibilidade para dados com estrutura variável e pode ser adequado a sistemas centrados em documentos. O Nexus, porém, tem entidades com vínculos frequentes e regras de consistência entre pedidos, itens e chaves. Modelar esses vínculos poderia exigir referências e coordenação de operações entre documentos; transações multi-documento existem, mas aumentam dependência de configuração e não eliminam a necessidade de projetar cuidadosamente a consistência. A camada de Sequelize e as associações relacionais existentes não seriam aproveitadas diretamente, exigindo mudança relevante de persistência e acesso a dados.

## 5. Decisão arquitetural

Adotar **PostgreSQL como banco de dados principal** do backend, com Sequelize como ORM, mantendo migrations versionadas e seeders para os dados iniciais e de demonstração.

## 6. Justificativas técnicas

- **Consistência transacional:** PostgreSQL fornece transações ACID. O código já usa transações Sequelize em operações que criam pedido, reservam chaves e criam itens, permitindo confirmar ou reverter mudanças coordenadas.
- **Integridade relacional:** o domínio expressa relações entre usuários, pedidos, itens, anúncios, chaves, catálogo e permissões. Constraints relacionais, chaves estrangeiras e unicidade ajudam a impedir referências inválidas e duplicações.
- **Consultas SQL:** listagens e serviços combinam filtros, ordenação, paginação, contagens e associações. SQL relacional é adequado a essas consultas e às consultas administrativas e de histórico.
- **Compatibilidade com Sequelize:** o backend já configura `dialect: "postgres"`, importa os models e centraliza associações Sequelize. A decisão preserva a camada de persistência e evita migração tecnológica sem requisito que a justifique.
- **Evolução e repetibilidade:** migrations e seeders existentes permitem evoluir o esquema e preparar ambientes de forma controlada, com histórico de alterações versionado.
- **Manutenção:** a estrutura relacional torna explícitos os vínculos de negócio e permite que a equipe acadêmica explique o modelo com ERD, models e migrations.

## 7. Consequências positivas

- Transações apropriadas para coordenar pedido, itens e reserva de estoque.
- Integridade referencial para entidades centrais do e-commerce e do RBAC.
- Consultas relacionais e agregações disponíveis para catálogo, pedidos e administração.
- Alinhamento com o código, os testes, migrations, seeders e Docker Compose atuais.
- Ecossistema conhecido e documentação ampla para operação e desenvolvimento.

## 8. Consequências negativas e trade-offs

- O esquema relacional demanda migrations coordenadas quando o domínio muda; alterações não podem ser tratadas como documentos independentes.
- A operação exige provisionar, configurar, proteger, monitorar e manter um serviço PostgreSQL, incluindo backups e política de atualização.
- A modelagem SQL é menos flexível que documentos para atributos muito variáveis; estruturas realmente variáveis podem demandar decisões explícitas de modelagem.
- Consultas com muitas associações precisam ser acompanhadas para evitar custo excessivo, e índices devem refletir os filtros reais.
- MySQL também poderia atender ao núcleo relacional, então a escolha não significa incapacidade técnica dessa alternativa; neste projeto, PostgreSQL reduz divergência com a implementação já configurada.
- MongoDB poderia atender a outros formatos de domínio, mas sua adoção aqui implicaria redesenhar persistência, consistência e integração ORM, sem benefício demonstrado que compense essa mudança.

## 9. Conclusão

PostgreSQL é a escolha adequada para o Nexus Full porque o domínio depende de relações explícitas e consistência entre compras, itens e chaves digitais, e o backend já está construído em torno de Sequelize, migrations, seeders e modelos relacionais. A decisão equilibra integridade e transações com o custo normal de manter schema e serviço de banco. A justificativa documenta a arquitetura observada e uma avaliação técnica reconstruída; não atribui ao projeto uma comparação histórica que não está registrada.
