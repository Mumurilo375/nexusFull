FLUXOS DE E-MAIL E MENSAGERIA




1. CONFIRMAÇÃO DE COMPRA — order.paid

1. processPayment confirma o pagamento e registra a entrega das chaves. Na linha 86, chama publishOrderPaidEmail(order.id).

   [backend/src/services/order-payment.service.ts:36](../../backend/src/services/order-payment.service.ts#L36)
   [order-payment.service.ts:86](../../backend/src/services/order-payment.service.ts#L86)

2. publishOrderPaidEmail busca pedido, comprador e itens. Na linha 134, monta o evento e chama publishEmail.

   [backend/src/services/email-events.service.ts:102](../../backend/src/services/email-events.service.ts#L102)
   [email-events.service.ts:134](../../backend/src/services/email-events.service.ts#L134)

3. publishEmail verifica se já existe registro de aceitação e, na linha 81, publica o evento no canal Redis nexus:emails.

   [backend/src/services/email-events.service.ts:67](../../backend/src/services/email-events.service.ts#L67)
   [email-events.service.ts:81](../../backend/src/services/email-events.service.ts#L81)

4. O serviço escuta o canal. Ao receber a mensagem, handleMessage valida o evento.

   [email-service/src/server.ts:321](../../email-service/src/server.ts#L321)
   [email-service/src/server.ts:274](../../email-service/src/server.ts#L274)

5. buildEmail monta o conteúdo. Depois, resend.emails.send solicita o envio ao Resend.

   [email-service/src/server.ts:106](../../email-service/src/server.ts#L106)
   [email-service/src/server.ts:297](../../email-service/src/server.ts#L297)

6. O serviço publica a resposta no Redis. O backend recebe e registra a aceitação no banco.

   [email-service/src/server.ts:304](../../email-service/src/server.ts#L304)
   [backend/src/services/email-events.service.ts:26](../../backend/src/services/email-events.service.ts#L26)
   [backend/src/services/email-events.service.ts:85](../../backend/src/services/email-events.service.ts#L85)











2. PROMOÇÃO INICIADA — offer.started

1. O backend inicia o agendador, que verifica as promoções imediatamente e a cada 30 segundos.

   [backend/src/services/runtime.service.ts:24](../../backend/src/services/runtime.service.ts#L24)
   [email-events.service.ts:240](../../backend/src/services/email-events.service.ts#L240)

2. announceStartedPromotions busca promoções ativas e ainda não notificadas. publishPromotionEmails busca os jogos e usuários que aceitaram ofertas.

   [backend/src/services/email-events.service.ts:221](../../backend/src/services/email-events.service.ts#L221)
   [backend/src/services/email-events.service.ts:144](../../backend/src/services/email-events.service.ts#L144)

3. Monta um evento offer.started por destinatário. publishEmail verifica o registro e publica o evento no Redis, na linha 81.

   [backend/src/services/email-events.service.ts:183](../../backend/src/services/email-events.service.ts#L183)
   [backend/src/services/email-events.service.ts:67](../../backend/src/services/email-events.service.ts#L67)
   [email-events.service.ts:81](../../backend/src/services/email-events.service.ts#L81)

4. O serviço recebe e valida a mensagem, buildEmail monta o conteúdo e resend.emails.send solicita o envio ao Resend.

   [email-service/src/server.ts:328](../../email-service/src/server.ts#L328)
   [email-service/src/server.ts:274](../../email-service/src/server.ts#L274)
   [email-service/src/server.ts:106](../../email-service/src/server.ts#L106)
   [email-service/src/server.ts:297](../../email-service/src/server.ts#L297)

5. O serviço publica a resposta; o backend registra as notificações aceitas e, ao concluir o processamento, marca a promoção como notificada.

   [email-service/src/server.ts:304](../../email-service/src/server.ts#L304)
   [backend/src/services/email-events.service.ts:26](../../backend/src/services/email-events.service.ts#L26)
   [backend/src/services/email-events.service.ts:85](../../backend/src/services/email-events.service.ts#L85)
   [backend/src/services/email-events.service.ts:227](../../backend/src/services/email-events.service.ts#L227)







3. DESCONTO NA LISTA DE DESEJOS — wishlist.discount

1. O mesmo agendador verifica as promoções e chama publishPromotionEmails para cada promoção elegível.

   [backend/src/services/runtime.service.ts:24](../../backend/src/services/runtime.service.ts#L24)
   [email-events.service.ts:240](../../backend/src/services/email-events.service.ts#L240)
   [email-events.service.ts:221](../../backend/src/services/email-events.service.ts#L221)

2. publishPromotionEmails prepara jogos e preços promocionais e busca usuários que têm esses jogos na lista de desejos e aceitaram ofertas.

   [backend/src/services/email-events.service.ts:194](../../backend/src/services/email-events.service.ts#L194)
   [backend/src/services/email-events.service.ts:202](../../backend/src/services/email-events.service.ts#L202)

3. Monta um evento wishlist.discount por usuário e jogo. publishEmail verifica o registro e publica o evento no Redis, na linha 81.

   [backend/src/services/email-events.service.ts:211](../../backend/src/services/email-events.service.ts#L211)
   [backend/src/services/email-events.service.ts:67](../../backend/src/services/email-events.service.ts#L67)
   [email-events.service.ts:81](../../backend/src/services/email-events.service.ts#L81)

4. O serviço recebe e valida a mensagem, buildEmail monta o conteúdo e resend.emails.send solicita o envio ao Resend.

   [email-service/src/server.ts:328](../../email-service/src/server.ts#L328)
   [email-service/src/server.ts:274](../../email-service/src/server.ts#L274)
   [email-service/src/server.ts:106](../../email-service/src/server.ts#L106)
   [email-service/src/server.ts:297](../../email-service/src/server.ts#L297)

5. O serviço publica a resposta; o backend registra as notificações aceitas e, ao concluir o processamento, marca a promoção como notificada.

   [email-service/src/server.ts:304](../../email-service/src/server.ts#L304)
   [backend/src/services/email-events.service.ts:26](../../backend/src/services/email-events.service.ts#L26)
   [backend/src/services/email-events.service.ts:85](../../backend/src/services/email-events.service.ts#L85)
   [backend/src/services/email-events.service.ts:227](../../backend/src/services/email-events.service.ts#L227)


IMPORTANTE

O Redis Pub/Sub não guarda mensagens para serviços desconectados. A aceitação do Resend não garante que o e-mail chegou à caixa de entrada. Se uma promoção falhar, o agendador pode tentar novamente. A falha no e-mail de compra não desfaz o pedido confirmado.
