# ADR-002 — Estilo arquitetural do Nexus Full

## 1. Contexto

O Nexus Full reúne aplicações web e mobile que usam um backend em Node.js e Express. Esse backend organiza rotas, controllers, services, models, validators e middlewares em uma aplicação. O repositório também contém `payments/`, com servidor Express e configuração próprios. Era necessário registrar qual estilo descreve essa organização.

## 2. Alternativas

- **Monólito tradicional:** uma aplicação concentra as funcionalidades, normalmente sem uma separação clara por responsabilidades ou áreas do sistema.
- **Monólito modular:** uma aplicação principal reúne módulos organizados por responsabilidades, mas executados juntos e compartilhando recursos.
- **Microsserviços:** várias aplicações menores, executadas e implantadas de forma independente, que se comunicam por interfaces definidas.

## 3. Decisão

Formaliza-se a arquitetura existente como um **monólito modular no backend principal, acompanhado de um serviço de pagamentos separado**. O backend reúne módulos em uma aplicação Express. Pagamentos tem código, servidor e configuração próprios, comunica-se com o backend por HTTP e integra-se ao Mercado Pago. O projeto não é um monólito único nem uma arquitetura inteiramente baseada em microsserviços. Este registro descreve o código atual, sem afirmar uma decisão histórica da equipe.

## 4. Justificativa

Essa organização é adequada a um projeto acadêmico porque mantém a maior parte do sistema em uma estrutura simples de desenvolver, executar e explicar. A divisão interna facilita localizar responsabilidades sem transformar cada área em uma aplicação independente. O serviço de pagamentos também evidencia a integração com um provedor externo, sem classificar todo o projeto como microsserviços.

## 5. Consequências

**Vantagens:**

- A estrutura por responsabilidades facilita encontrar e manter partes do backend.
- A solução mantém a execução geral simples e separa o fluxo de pagamentos.

**Limitações:**

- Os módulos do backend principal compartilham a mesma aplicação; uma falha ou mudança pode afetar mais de uma área.
- O serviço de pagamentos precisa ser configurado e acompanhado junto ao backend, e sua comunicação HTTP pode falhar independentemente.
