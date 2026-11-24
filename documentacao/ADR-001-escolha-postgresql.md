# ADR-001 — PostgreSQL como banco de dados principal

**Status:** decisão formalizada para documentar a arquitetura existente do Nexus Full. Esta justificativa foi reconstruída a partir do código e dos requisitos; não afirma que houve um processo histórico de avaliação registrado.

## 1. Contexto

O Nexus Full é um e-commerce acadêmico de jogos digitais. O sistema relaciona usuários, jogos, anúncios por plataforma, pedidos, itens de pedido e chaves digitais. Uma compra precisa reservar chaves e registrar o pedido de forma consistente. O backend usa Node.js, Express, TypeScript e Sequelize, com models relacionais, migrations e seeders.

## 2. Decisão

Documentar o PostgreSQL como banco de dados principal do Nexus Full, acessado pelo Sequelize. Essa é a tecnologia configurada e utilizada atualmente pelo backend.

## 3. Justificativa

O domínio tem relações claras entre suas entidades. Um usuário possui pedidos; cada pedido possui itens; cada item se relaciona a um anúncio e a uma chave digital. O PostgreSQL permite representar essas relações com tabelas, chaves e restrições de integridade.

As transações ajudam a coordenar etapas da compra, como criar o pedido e reservar as chaves. Assim, falhas podem cancelar as alterações da transação e reduzir o risco de registrar uma compra incompleta. O banco também atende às consultas relacionais do catálogo e dos pedidos. A integração com Sequelize já está implementada e acompanha migrations e seeders existentes.

## 4. Alternativas consideradas

- **PostgreSQL:** atende às relações, transações e consultas do sistema, além de ser o banco configurado no projeto.
- **MySQL:** também é relacional e poderia atender a esse domínio. A adoção exigiria configurar outro dialeto e conferir migrations e consultas.
- **MongoDB:** oferece flexibilidade para dados documentais, mas os vínculos frequentes entre pedidos, itens e chaves exigiriam outro desenho de persistência. A estrutura relacional e a integração Sequelize atuais não seriam aproveitadas diretamente.

## 5. Consequências

O PostgreSQL oferece integridade referencial e transações adequadas às operações de compra, além de manter o projeto alinhado ao Sequelize e às migrations já existentes. Em contrapartida, mudanças no esquema precisam ser registradas e aplicadas por migrations, e o serviço de banco exige configuração, backups e manutenção. A decisão atende ao modelo atual do Nexus; outras tecnologias poderiam ser adequadas a requisitos diferentes.
