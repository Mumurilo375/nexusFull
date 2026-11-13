# Runbook de incidentes — Nexus Full

## 1. Objetivo

Este runbook orienta a identificação e a recuperação de falhas no Nexus Full, que executa frontend, API e pagamentos em serviços Docker Compose.

## 2. Identificação de incidentes

Considere um incidente quando o site HTTPS não carregar, `https://nexus.store/api/health` não retornar estado saudável ou uma função essencial, como catálogo ou checkout, falhar. Consulte `docker compose ps` para verificar estado e health checks. O Compose verifica PostgreSQL, Redis, backend e payments. O frontend Nginx não tem health check próprio, então confirme o acesso HTTPS e consulte seus logs. Para investigar um serviço, use `docker compose logs -f <serviço>`.

## 3. Procedimentos de recuperação

| Situação | Verificação | Ação |
|---|---|---|
| Frontend não abre | Acesse o endereço HTTPS; verifique `docker compose ps` e `docker compose logs -f frontend`. | Confira a configuração e os certificados TLS montados pelo Compose. Após corrigir a causa, reconstrua e inicie os serviços pelo procedimento de deploy. |
| API não responde | Consulte `/api/health`; verifique o health check e `docker compose logs -f backend`. Confira também os estados de PostgreSQL e Redis, dos quais o backend depende. | Corrija primeiro a dependência indisponível. Depois, inicie novamente a versão aprovada pelo procedimento de deploy e confira os logs do backend. |
| PostgreSQL indisponível | Confira o health check `pg_isready`, o estado em `docker compose ps` e os logs do serviço `db`. | Verifique configuração e disponibilidade do armazenamento persistente. Não remova volumes ou diretórios de dados; se o banco não recuperar, encaminhe para análise antes de qualquer ação sobre os dados. |
| Serviço de pagamentos com falha | Confira o health check `/health`, `docker compose ps` e `docker compose logs -f payments`. | Verifique a configuração do serviço e sua comunicação interna com backend e gateway. Corrija a causa e reinicie a versão aprovada; não exponha nem registre credenciais nos logs. |
| Problemas após atualização | Consulte `docker compose ps`, os logs dos serviços afetados e `/api/health`. Verifique também se o backend registrou o resultado das migrations iniciadas no bootstrap. | Se a falha persistir, siga o rollback manual da seção 4. |

## 4. Rollback

O rollback atual é manual, conforme a [estratégia de deploy](estrategia-deploy.md). Retorne o ambiente à última versão estável e execute o procedimento documentado `docker compose up --build -d`; depois valide os serviços novamente. Preserve os dados persistentes de PostgreSQL e mídia. Como o backend tenta aplicar migrations ao iniciar, avalie mudanças de esquema separadamente; este runbook não orienta desfazer migrations nem restaurar banco.

O job **Deploy demonstrativo** do GitHub Actions apenas publica artefatos da execução. Ele não atualiza o ambiente nem realiza rollback. Alertas automáticos, logs centralizados e implantação real automatizada não estão configurados atualmente.

## 5. Validação e registro

Considere a recuperação confirmada quando o site HTTPS carregar, `/api/health` indicar estado saudável, os health checks dos serviços essenciais estiverem saudáveis e uma operação básica, como consultar o catálogo, funcionar. Registre data e hora, serviço afetado, sintomas, impacto, causa identificada, solução aplicada e resultado da validação. Remova tokens, senhas e outros dados sensíveis de qualquer registro.
