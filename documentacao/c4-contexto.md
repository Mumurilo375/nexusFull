# C4 — Contexto

O Nexus Full é uma loja digital de jogos utilizada por visitantes, clientes e administradores. Para pagamentos, integra-se ao Mercado Pago; o armazenamento de imagens pode usar o Supabase Storage quando essa opção estiver configurada.

```mermaid
flowchart LR
    visitante[Visitante / Cliente]
    admin[Administrador]
    nexus[Nexus Full]
    mercado[Mercado Pago<br/>Serviço externo de pagamentos]
    supabase[Supabase Storage<br/>Armazenamento externo opcional de imagens]

    visitante -->|Consulta e compra jogos| nexus
    admin -->|Gerencia a loja| nexus
    nexus -->|Cria e consulta pagamentos| mercado
    mercado -->|Envia notificações de pagamento| nexus
    nexus -->|Armazena e consulta imagens, quando configurado| supabase
```
