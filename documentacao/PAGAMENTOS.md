# Pagamentos com Mercado Pago

O backend calcula preços e reserva as keys por 30 minutos. O serviço independente em `payments/` cria o Checkout Pro e recebe os webhooks. O pedido só muda de `pending` para `paid` depois de uma confirmação consultada no Mercado Pago, com referência, valor e moeda conferidos. Em falha ou expiração, muda para `failed` e libera a reserva.

```text
Web / Mobile → Backend → payments → Mercado Pago
                  ↑          ↑
             confirmação   webhook
```

## Configuração

Preencha o `.env` da raiz usando os campos novos de `.env.example`:

- `PAYMENTS_SERVICE_SECRET`: segredo aleatório de pelo menos 32 caracteres, compartilhado apenas entre backend e payments. Gere com `openssl rand -hex 32`.
- `MERCADO_PAGO_ACCESS_TOKEN`: Access Token da aplicação criada no Mercado Pago Developers.
- `MERCADO_PAGO_WEBHOOK_SECRET`: assinatura secreta exibida ao configurar Webhooks nessa aplicação.
- `MERCADO_PAGO_WEBHOOK_URL`: URL HTTPS **pública** terminada em `/payments/webhook`.
- `PAYMENTS_RETURN_URL`: origem HTTPS do frontend. O serviço acrescenta `/checkout?orderId=...` ao retorno.
- `MERCADO_PAGO_SANDBOX=true`: mantém o checkout em teste. Use contas e cartões de teste do Mercado Pago. Somente mude para `false` com credenciais de produção e a integração validada.

No painel do Mercado Pago, selecione **Checkout Pro via Preferences** e ative o evento **Pagamentos**, usando a mesma URL de webhook e o ambiente correspondente. O Nginx encaminha apenas esse caminho público para o microserviço. As demais operações usam autenticação entre serviços.

`https://nexus.store` é um endereço local: o Mercado Pago precisa de uma URL acessível pela internet e com certificado confiável. Em desenvolvimento, use um túnel HTTPS para o Nginx e configure sua origem tanto no webhook quanto no retorno. Preserve a query string e os cabeçalhos `x-signature` e `x-request-id` no encaminhamento.

Após configurar:

```bash
docker compose up --build -d
```

O entrypoint do backend executa a nova migration. Fora do Docker, execute `npm run db:migrate` e `npm run dev` em `backend/`; em outro terminal, execute `npm ci` e `npm run dev` em `payments/`. Nesse caso, `BACKEND_INTERNAL_URL` aponta para a porta local do backend e `PAYMENTS_SERVICE_URL` para `http://localhost:3002`.

## Comportamento

- O carrinho é preservado até o pagamento. Ao confirmar, apenas itens com as quantidades compradas são removidos; alterações feitas enquanto o usuário pagava permanecem.
- Abrir o checkout novamente retoma o pedido pendente, sem reservar outro conjunto de keys.
- Web e mobile abrem o checkout hospedado; dados de cartão e senhas de pagamento são preenchidos no Mercado Pago. No mobile, volte ao app após pagar.
- O backend confere pagamentos a cada 30 segundos e após a ação “Já paguei”. Isso recupera confirmações mesmo quando um webhook se perde.
- Na expiração, cobranças ainda pendentes são canceladas antes de liberar o estoque. Se o gateway estiver indisponível, a reserva é mantida até ser possível conferir o resultado.
- Notificações repetidas não duplicam entregas. Cobranças duplicadas, com valor/moeda incorretos ou aprovadas após o encerramento são estornadas automaticamente, com chave de idempotência.
- Keys já entregues nunca voltam ao estoque após estorno. Pedidos antigos continuam compatíveis.
- O serviço de pagamentos não acessa o banco da loja. Referências, URL e resultado ficam persistidos no pedido; credenciais do gateway ficam apenas no serviço.

## Verificações

`payments/`: `npm test` e `npm run lint`. `backend/`: `npm run lint`, `npm run build` e `npm test -- --runInBand __tests__/checkout`. `frontend/`: `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`. `mobile/`: `npm run lint` e conferência manual do fluxo.

O teste `backend/__tests__/checkout/pagamento.service.test.ts` só roda com `PAYMENT_TEST_DATABASE_URL` apontando para um PostgreSQL isolado em `127.0.0.1`, com banco chamado `nexus_payments_test` e todas as migrations aplicadas. Ele testa concorrência e o `down`/`up` da nova migration; não use o banco da loja. Sem essa variável, esse conjunto é ignorado.

Referências: [Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/overview), [webhooks](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications), [prazo da preferência](https://www.mercadopago.com.br/developers/en/docs/checkout-pro-preferences/additional-settings/term-of-preference), [estornos e cancelamentos](https://www.mercadopago.com.br/developers/en/docs/checkout-pro-preferences/additional-settings/refunds-and-cancellations).
