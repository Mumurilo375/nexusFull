# Plano de observabilidade

## Monitoramento já existente

- O Docker Compose verifica o PostgreSQL com `pg_isready`, o Redis com `redis-cli ping` e os endpoints `/health` do backend e do serviço de pagamentos.
- Os serviços produzem logs básicos: erros não tratados e de inicialização no backend, eventos e falhas de cache Redis e falhas no serviço de pagamentos.
- O Sequelize pode registrar comandos SQL quando `DB_LOGGING=true`.
- O backend agora coleta métricas HTTP em memória: total de requisições, respostas 5xx, taxa de erro e p95 das durações recentes. A janela do p95 mantém no máximo 1.000 amostras; a rota de métricas não entra na própria contagem.

O resumo fica disponível em `GET /internal/metrics`, protegido pelo mesmo bearer token interno usado pelo middleware de tarefas (`CRON_SECRET`). A taxa de erro é apresentada como percentual. A coleta é volátil: reiniciar o processo zera os totais e as amostras. Os endpoints `/health` atuais confirmam resposta da aplicação, mas não verificam de forma completa os serviços dos quais ela depende.

## Limitações e plano futuro

Ainda não existem histórico permanente de métricas, monitoramento externo contínuo de disponibilidade, alertas automáticos ou dashboard Grafana/Prometheus. As metas de SLO/SLI continuam propostas acadêmicas e não são resultados comprovados por essa coleta em memória.

Como melhorias futuras, manter um histórico durável, verificar disponibilidade de fora da aplicação, padronizar logs e criar alertas simples para erros e indisponibilidade.
