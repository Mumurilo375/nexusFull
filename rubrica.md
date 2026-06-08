**Rubrica do Projeto**

**Legenda de status**

- **Não iniciado**: não encontrei implementação/configuração no repositório.
- **Parcial**: há parte implementada, mas falta integração, cobertura ou requisito completo.
- **Implementado**: encontrei implementação funcional ou configuração compatível com o item.

**Observação sobre banco de dados**

A rubrica original fala que o banco precisa ser em MySQL, mas foi alinhado com os professores que o projeto pode usar PostgreSQL. Portanto, nos itens abaixo, onde a rubrica cita MySQL, o status considera PostgreSQL como equivalente aceito e não precisa haver ajuste/migração para MySQL.

**DevOps e Cloud Computing**

- **Organização do docker-compose.yml** (Código bem indentado, com separação clara de serviços, uso de volumes, redes e variáveis de ambiente.)

- [x] **Status:** Implementado
- **Evidência:** `docker-compose.yml` está bem separado em `db`, `backend` e `frontend`, usa `env_file`, `volumes`, `depends_on`, `healthcheck`, rede nomeada e variáveis para portas/caminhos.

- **Integração entre serviços** (Backend conecta ao MySQL, frontend consome o backend, Nginx atua como proxy.)

- [x] **Status:** Implementado
- **Evidência:** backend conecta ao banco PostgreSQL usando host `db`; frontend Docker usa `Frontend/Dockerfile` de produção com Nginx; `Frontend/nginx.conf` serve o React estático e faz proxy reverso de `/api/` e `/media/` para `backend:3000`.
- **Nota:** PostgreSQL aceito pelos professores no lugar de MySQL.

- **Persistência de dados no Postgres**: Uso correto de volumes para manter os dados mesmo após reinício.

- [x] **Status:** Implementado
- **Evidência:** serviço `db` usa PostgreSQL 15 com bind mount `${POSTGRES_DATA_PATH_HOST}` apontando para `/var/lib/postgresql/data`, mantendo dados após reinício.
- **Nota:** PostgreSQL aceito pelos professores no lugar de MySQL.

- **Configuração do Nginx como proxy reverso**: Redirecionamento de requisições para frontend e backend de forma funcional.

- [x] **Status:** Implementado
- **Evidência:** `Frontend/nginx.conf` tem `upstream backend`, proxy de `/api/` e `/media/` para `backend:3000`, fallback `try_files` para React Router e é carregado pelo container `frontend` via `Frontend/Dockerfile`.

- **Configuração do ambiente de desenvolvimento**: Uso de .env, comandos simples para iniciar, flexibilidade no uso.

- [x] **Status:** Implementado
- **Evidência:** existem `.env.example`, `.env.db.docker.example`, `.env.backend.docker.example`, `.env.frontend.docker.example`, scripts `npm run dev/build/test`, Docker Compose e proxy configurável por `VITE_API_PROXY_TARGET`.

**Sistemas Operacionais, Redes e Cybersegurança**

- **Diretivas básicas de segurança no Nginx**: Configurar cabeçalhos de segurança HTTP no Nginx (ex: X-Frame-Options, X-Content-Type-Options, Content-Security-Policy), demonstrando preocupação com proteção básica contra ataques como clickjacking e execução de scripts maliciosos.

- [x] **Status:** Implementado
- **Evidência:** `Frontend/nginx.conf` ativo no Docker define `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` e `Content-Security-Policy`; resposta HTTPS de `https://nexus.store` retorna esses headers.

- **Senhas e Dados Sensíveis**: Evitar hardcoding de usuários, senhas e nomes de banco de dados no docker-compose.yml e arquivos de configuração. Utilizar variáveis de ambiente ou arquivos .env para esse fim, desde que não fiquem expostos no repositório (ex: GitHub).

- [x] **Status:** Implementado
- **Evidência:** `docker-compose.yml` usa `env_file` e variáveis de ambiente. `.gitignore` ignora `.env` e `.env.*`, mantendo apenas arquivos `.example` versionáveis.
- **Atenção:** antes de subir para GitHub, confirmar que arquivos reais como `.env`, `.env.db.docker`, `.env.backend.docker` e `.env.frontend.docker` não estão versionados.

- **Uso de HTTPS com Host Customizado**: Expor o serviço via porta 443 com HTTPS utilizando um certificado local (ex: mkcert), permitindo acesso seguro via um host configurado no /etc/hosts (ex: meuapp.local).

- [x] **Status:** Implementado
- **Evidência:** `docker-compose.yml` expõe `443:443` e monta `./.docker/nginx/certs:/etc/nginx/certs:ro`; `Frontend/nginx.conf` escuta `443 ssl` com certificados `nexus.store.pem` e `nexus.store-key.pem`; host customizado usado: `https://nexus.store`.

- **Redirecionamento HTTP para HTTPS**: Configurar o Nginx para redirecionar automaticamente todas as requisições HTTP (porta 80) para HTTPS (porta 443), reforçando o uso seguro da aplicação.

- [x] **Status:** Implementado
- **Evidência:** `Frontend/nginx.conf` tem bloco `listen 80` com `return 301 https://$host$request_uri;`; `http://nexus.store` redireciona para `https://nexus.store/`.

**Tech Forge**

- **Criação de testes end-to-end**: Login (caso de sucesso e de falha), Criação de usuário (caso de sucesso e falha), Outros 2 CRUDS completos (testar o fluxo de cadastrar, editar, listar e excluir no mesmo cenário de teste. Testar casos de sucesso e falha).

- [ ] **Status:** Não iniciado
- **Evidência:** não encontrei Playwright, Cypress ou outra estrutura E2E. Existem testes Jest/Vitest unitários e de serviço para autenticação, usuário, catálogo, checkout, helpers e mensagens da API.
- **Falta:** login sucesso/falha, criação de usuário sucesso/falha e dois CRUDs completos com cadastrar, editar, listar e excluir no mesmo cenário, incluindo sucesso e falha.

- **Configuração de pre-commit e pre-push utilizando Husky** (validação da mensagem de commit e execução dos testes end-to-end).

- [ ] **Status:** Não iniciado
- **Evidência:** não encontrei diretório `.husky`, dependência `husky` ou scripts de hook nos `package.json`.
- **Falta:** validar mensagem de commit e executar testes end-to-end no fluxo de pre-commit/pre-push.

- **Organização das branchs do GitHub de acordo com o GitFlow** (dev, main e feature branchs).

- [x] **Status:** Implementado
- **Evidência:** existem branches remotas `origin/main`, `origin/dev`, `origin/release/1.0.0`, `origin/feature/nginx-https`, `origin/feature/docs-gitflow`, `origin/feature/login-social` e `origin/hotfix/corrige-token-expirado`. Histórico recente evidencia fluxo `feature/docs-gitflow -> dev -> release/1.0.0 -> main`.

**Próximos ajustes mais importantes**

- Adicionar suíte E2E com Playwright ou Cypress cobrindo fluxos exigidos.
- Configurar Husky com validação de mensagem e execução dos testes E2E.
