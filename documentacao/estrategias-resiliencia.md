# Estratégias de resiliência

- **Timeouts HTTP:** chamadas do backend ao serviço de pagamentos têm limite de 15 segundos. O serviço de pagamentos limita a 10 segundos as chamadas ao Mercado Pago e o encaminhamento de confirmações ao backend. Chamadas ao armazenamento externo de mídia têm limite de 15 segundos.
- **Reconexão do Redis:** o cliente usa timeout de conexão de 3 segundos e limita as tentativas de reconexão a três.
- **Catálogo sem cache:** se o Redis estiver indisponível ou houver falha ao ler ou gravar o cache, a consulta do catálogo segue pelo PostgreSQL.
- **Reconciliação de pagamentos:** existe uma rota protegida que consulta novamente pagamentos relacionados a pedidos pendentes. Se uma conferência falhar, o pedido é registrado para nova verificação em uma execução posterior.

## Limitações atuais

- **Circuit breaker:** não está implementado.
- **Retry HTTP automático:** não está implementado. A reconciliação posterior de pagamentos não é uma repetição automática imediata da chamada HTTP que falhou.
- **PostgreSQL:** a aplicação depende do banco para iniciar; não há modo de operação sem ele.
