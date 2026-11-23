# Estratégia de deploy — Nexus Full

## 1. Estratégia escolhida

O projeto adotará deploy simples com rollback manual. A publicação será conduzida por uma pessoa responsável no ambiente configurado, usando Docker Compose.

## 2. Publicação

O pipeline valida build e testes e guarda os artefatos da execução. Seu job **Deploy demonstrativo** apenas baixa e publica esses artefatos no GitHub Actions; ele não atualiza um servidor.

Para uma publicação real, a pessoa responsável seleciona uma versão aprovada do código e executa `docker compose up --build -d` no ambiente de execução. O Compose constrói frontend, backend e payments e inicia também PostgreSQL e Redis. O ambiente precisa ter `.env`, certificados TLS do Nginx e caminhos persistentes configurados. Na inicialização do backend, o entrypoint tenta aplicar as migrations; os logs devem ser conferidos para confirmar o resultado.

## 3. Validação

- Abrir o endereço HTTPS do site e confirmar que o frontend carrega. O Nginx redireciona HTTP para HTTPS e encaminha `/api` ao backend.
- Consultar `/api/health` pelo endereço do site e confirmar resposta saudável da API.
- Verificar no Docker Compose se os health checks de PostgreSQL (`pg_isready`), Redis (`redis-cli ping`), backend (`/health`) e payments (`/health`) estão saudáveis. O frontend não possui health check próprio; sua verificação é feita pelo acesso HTTPS.
- Conferir os logs do backend e realizar uma operação básica da aplicação, como consultar o catálogo.

## 4. Rollback

Se a validação falhar, a pessoa responsável retorna o código à última versão estável e executa novamente `docker compose up --build -d`, recriando os serviços com essa versão. Depois, repete as verificações de saúde e consulta os logs.

O rollback da aplicação não deve apagar volumes nem diretórios persistentes de PostgreSQL e mídia. Como o backend tenta aplicar migrations ao iniciar, mudanças de esquema precisam ser avaliadas separadamente antes de reverter; não se deve executar rollback de banco sem um procedimento específico e cópia de segurança.

**Limite atual:** a publicação real e o rollback são manuais. O pipeline do GitHub Actions é demonstrativo e não possui acesso ao ambiente de execução.
