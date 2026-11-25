# C4 — Containers

O sistema possui clientes web e mobile que acessam a API do Nexus. O backend usa PostgreSQL para persistência e Redis para cache do catálogo, além de delegar operações de pagamento a um serviço integrado ao Mercado Pago; imagens podem ser armazenadas no Supabase Storage quando configurado.

```mermaid
flowchart LR
    visitante[Visitante / Cliente]
    admin[Administrador]
    web[Frontend web<br/>React + Nginx]
    mobile[Aplicativo mobile<br/>React Native / Expo]
    api[Backend API<br/>Node.js / Express]
    pagamentos[Serviço de pagamentos<br/>Node.js / Express]
    postgres[(PostgreSQL)]
    redis[(Redis<br/>Cache de catálogo)]
    mercado[Mercado Pago<br/>Serviço externo]
    supabase[Supabase Storage<br/>Opcional]

    visitante -->|Usa a loja| web
    admin -->|Administra a loja| web
    visitante -->|Usa o aplicativo| mobile
    admin -->|Administra pelo aplicativo| mobile
    web -->|HTTPS: chamadas da aplicação| api
    mobile -->|HTTPS: chamadas da API| api
    api -->|Lê e grava dados| postgres
    api -->|Lê e atualiza cache do catálogo| redis
    api -->|Solicita operações de pagamento| pagamentos
    pagamentos -->|Cria e consulta pagamentos| mercado
    mercado -->|Webhook de pagamento via Nginx| web
    web -->|Encaminha webhook| pagamentos
    pagamentos -->|Confirma pagamento| api
    api -->|Armazena e consulta imagens, se configurado| supabase
```

apenas um teste pra testar a pipeline
