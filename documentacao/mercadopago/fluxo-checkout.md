# Fluxo de preparação do checkout


checkout-preparation.ts
   │
   │ busca e valida os dados do pedido
   │ chama createPreference(dadosDoPedido)
   ▼
mercadopago.ts
   │
   │ envia os dados para a API do Mercado Pago
   ▼
Mercado Pago
   │
   │ devolve os dados da preferência, incluindo a URL
   ▼
mercadopago.ts devolve a URL ao checkout-preparation.ts
   │
   ▼
checkout-preparation.ts pede ao backend para salvar a URL

## Onde acontece cada etapa

1. Buscar e validar o pedido: [prepareCheckout](../../payments/src/checkout-preparation.ts#L20) consulta o backend e valida os dados recebidos. No backend, [getCheckoutPreparation](../../backend/src/services/checkout-preparation.service.ts#L13) busca o pedido elegível.

2. Montar a preferência: [createPreference](../../payments/src/mercadopago.ts#L99) reúne valor, referência, prazo e URLs para o Mercado Pago.

3. Enviar a requisição: [request](../../payments/src/mercadopago.ts#L63) faz a chamada HTTP para a API do Mercado Pago.

4. Obter e retornar a URL: [createPreference](../../payments/src/mercadopago.ts#L132) escolhe a URL de teste ou de produção e a devolve ao `prepareCheckout`.

5. Salvar a URL: [prepareCheckout](../../payments/src/checkout-preparation.ts#L35) pede ao backend para salvá-la; [savePreparedCheckout](../../backend/src/services/checkout-preparation.service.ts#L22) valida o endereço e atualiza o pedido.



docker compose logs payments (ver os logs do MP que o arquivo logger.ts faz)