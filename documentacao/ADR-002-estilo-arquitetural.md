# ADR-002 — Estilo arquitetural do Nexus Full

## 1. Contexto

O Nexus Full reúne aplicações web e mobile que usam um backend principal em Node.js e Express. Esse backend organiza rotas, controllers, services, models, validators e middlewares em uma aplicação. O repositório também contém `payments/`, com servidor Express e configuração próprios, e `email-service/`, um worker independente de notificações. O backend e o serviço de pagamentos comunicam-se por HTTP. O backend e o worker usam Redis Pub/Sub para eventos de email e resultados de aceitação. Era necessário registrar qual estilo descreve essa organização.

## 2. Alternativas

- **Monólito tradicional:** uma aplicação concentra as funcionalidades, normalmente sem uma separação clara por responsabilidades ou áreas do sistema.
- **Monólito modular:** uma aplicação principal reúne módulos organizados por responsabilidades, mas executados juntos e compartilhando recursos.
- **Microsserviços:** várias aplicações menores, executadas e implantadas de forma independente, que se comunicam por interfaces definidas.

## 3. Decisão

Formaliza-se a arquitetura existente como um **monólito modular no backend principal, acompanhado por dois serviços independentes**. O backend reúne módulos em uma aplicação Express. `payments/` tem código, servidor e configuração próprios, comunica-se com o backend por HTTP e integra-se ao Mercado Pago. `email-service/` é um worker independente, que recebe eventos e publica resultados de aceitação por canais Redis Pub/Sub, além de solicitar o envio de emails ao Resend. Redis também é usado pelo backend para cache do catálogo. O projeto não é um monólito único nem uma arquitetura inteiramente baseada em microsserviços. Este registro descreve o código atual, sem afirmar uma decisão histórica da equipe.

## 4. Justificativa

Essa organização é adequada a um projeto acadêmico porque mantém a maior parte do sistema em uma estrutura simples de desenvolver, executar e explicar. A divisão interna facilita localizar responsabilidades sem transformar cada área em uma aplicação independente. Pagamentos e notificações possuem processos próprios, mas isso não altera a classificação do backend principal como monólito modular nem torna todo o projeto uma arquitetura inteiramente baseada em microsserviços.

## 5. Consequências

**Vantagens:**

- A estrutura por responsabilidades facilita encontrar e manter partes do backend.
- Serviços independentes isolam os processos de pagamentos e de envio de notificações do processo do backend principal.

**Limitações:**

- Os módulos do backend principal compartilham a mesma aplicação; uma falha ou mudança pode afetar mais de uma área.
- Os serviços independentes precisam ser configurados e acompanhados junto ao backend, e suas comunicações HTTP ou por Redis podem falhar independentemente.
- Redis atende ao cache e à mensageria, criando uma dependência de infraestrutura compartilhada. Pub/Sub entrega mensagens aos assinantes ativos e não oferece, neste fluxo, persistência ou replay de mensagens. O fluxo não estabelece garantia de entrega do email.
