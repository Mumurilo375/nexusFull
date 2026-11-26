# Fluxo do e-mail de confirmação de compra

```text
Mercado Pago confirma o pagamento
   │
   ▼
Microsserviço de pagamentos consulta o pagamento e informa o backend
   │
   ▼
Backend valida o pagamento, confirma o pedido e entrega as chaves
   │
   ▼
Backend monta o evento order.paid e publica no Redis
   │
   ▼
Redis transmite o evento pelo canal nexus:emails
   │
   ▼
Microsserviço de e-mails recebe o evento e monta a mensagem
   │
   ▼
Resend recebe a solicitação de envio
   │
   ▼
Microsserviço informa o resultado pelo canal nexus:emails:accepted
   │
   ▼
Backend recebe a confirmação e registra a aceitação no banco
```

## Onde acontece cada etapa

1. **Receber a notificação:** [handleWebhook](../../payments/src/app.ts#L47) verifica o webhook, consulta o pagamento no Mercado Pago e informa o backend. O pagamento também pode ser consultado por outros caminhos, como a verificação manual.
2. **Confirmar a compra:** [processPayment](../../backend/src/services/order-payment.service.ts#L36) confere o pagamento, registra a entrega das chaves e marca o pedido como pago.
3. **Disparar o e-mail:** após a transação, [processPayment chama `publishOrderPaidEmail`](../../backend/src/services/order-payment.service.ts#L82) para o pedido confirmado.
4. **Montar o evento:** [publishOrderPaidEmail](../../backend/src/services/email-events.service.ts#L102) busca o cliente e os itens e monta o evento `order.paid`, incluindo destinatário e dados do pedido.
5. **Publicar no Redis:** [publishEmail](../../backend/src/services/email-events.service.ts#L67) publica a mensagem no canal `nexus:emails` e aguarda uma resposta.
6. **Receber e montar o e-mail:** [start](../../email-service/src/server.ts#L314) inscreve o serviço no canal; [handleMessage](../../email-service/src/server.ts#L267) valida o evento e chama [buildEmail](../../email-service/src/server.ts#L106) para montar a confirmação.
7. **Solicitar o envio e responder:** [handleMessage](../../email-service/src/server.ts#L282) solicita o envio ao Resend e publica o resultado em `nexus:emails:accepted`.
8. **Registrar a aceitação:** o backend recebe a resposta em [handleAcknowledgement](../../backend/src/services/email-events.service.ts#L26). Quando aceita dentro do prazo, [publishEmail](../../backend/src/services/email-events.service.ts#L81) registra o comprovante no banco.

## Pontos importantes

- O **backend** dispara o evento; o microsserviço de pagamentos não envia o e-mail diretamente.
- A aceitação pelo Resend confirma a solicitação, não a entrega ou leitura pelo cliente.
- Se o e-mail falhar, a compra já confirmada não é desfeita. O Redis Pub/Sub não é uma fila persistente que garante nova entrega quando o serviço voltar.
