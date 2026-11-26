# C4 — Containers

O Nexus Full reúne clientes web e mobile, um backend principal organizado como monólito modular e dois serviços independentes: pagamentos e o worker de notificações. O backend persiste dados no PostgreSQL, usa Redis para cache do catálogo e publica notificações por Redis Pub/Sub. O serviço de pagamentos integra-se ao Mercado Pago por HTTP e o worker solicita o envio de emails ao Resend. Imagens podem ser armazenadas no Supabase Storage quando configurado.

```mermaid
flowchart LR
    visitante[Visitante / Cliente]
    admin[Administrador]

    subgraph nexus[Nexus Full]
        web[Frontend web<br/>React + Nginx]
        mobile[Aplicativo mobile<br/>React Native / Expo]
        api[Backend principal<br/>Node.js / Express<br/>Monólito modular]
        pagamentos[Serviço de pagamentos<br/>Node.js / Express]
        email[email-service<br/>Worker Node.js]
    end

    subgraph infraestrutura[Infraestrutura]
        postgres[(PostgreSQL<br/>Banco de dados)]
        redis[(Redis<br/>Cache e Pub/Sub)]
    end

    subgraph externos[Sistemas externos]
        mercado[Mercado Pago<br/>Pagamentos]
        resend[Resend<br/>Envio de emails]
        supabase[Supabase Storage<br/>Armazenamento opcional de imagens]
    end

    visitante -->|Usa a loja| web
    admin -->|Administra a loja| web
    visitante -->|Usa o aplicativo| mobile
    admin -->|Administra pelo aplicativo| mobile
    web -->|HTTPS público e HTTP interno pelo proxy| api
    mobile -->|HTTPS: chamadas da API| api
    api -->|Lê e grava dados| postgres
    api -->|Lê, atualiza e invalida cache do catálogo| redis
    api -->|HTTP interno: operações de pagamento| pagamentos
    pagamentos -->|HTTPS: cria e consulta pagamentos| mercado
    mercado -->|Webhook HTTPS via Nginx| pagamentos
    pagamentos -->|HTTP interno: confirma pagamento| api
    api -->|Publica eventos de email<br/>Redis Pub/Sub| redis
    redis -->|Entrega eventos publicados<br/>Redis Pub/Sub| email
    email -->|Publica resultado de aceitação<br/>Redis Pub/Sub| redis
    redis -->|Entrega resultado ao backend<br/>Redis Pub/Sub| api
    email -->|HTTPS: solicita envio de email| resend
    api -->|Armazena e consulta imagens, se configurado| supabase
```
