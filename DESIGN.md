---
name: Nexus Full
description: Vitrine digital neon para descobrir jogos e escolher a plataforma certa.
colors:
  primary: "#2563eb"
  primary-hover: "#3b82f6"
  electric-cyan: "#22d3ee"
  success: "#10b981"
  danger: "#f43f5e"
  canvas-black: "#000000"
  surface-deep: "#020617"
  surface-slate: "#0f172a"
  border-slate: "#334155"
  text-primary: "#ffffff"
  text-secondary: "#cbd5e1"
  text-muted: "#94a3b8"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.12em"
rounded:
  control: "12px"
  card: "16px"
  panel: "24px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  input:
    backgroundColor: "{colors.surface-slate}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  product-card:
    backgroundColor: "{colors.surface-slate}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "16px"

# Design System: Nexus Full

## Overview

**Creative North Star: "A Vitrine Digital Neon"**

O Nexus Full apresenta jogos como peças de uma vitrine digital: o fundo escuro cria o espaço de exposição, enquanto azul elétrico, ciano e verde aparecem como sinais de disponibilidade, ação e descoberta. A direção é futurista e confiável, mas a confiança vem da clareza da plataforma, do preço, do estoque e do próximo passo — não de efeitos decorativos.

O sistema atual usa uma composição escura, imagens de capa em destaque e superfícies empilhadas para organizar o catálogo, o checkout e o painel administrativo. A evolução visual deve manter a identidade gamer, porém reduzir blur, transparência e sombras concorrentes em favor de planos mais sólidos, bordas discretas e hierarquia tipográfica explícita.

**Key Characteristics:**

- Vitrine escura com acentos neon funcionais.
- Futurismo legível, sem aparência de interface técnica por decoração.
- Superfícies planas e separadas por contraste tonal.
- Informação de plataforma, preço, estoque e ação sempre escaneável.
- Imagens de jogos como principal elemento expressivo.

## Colors

A paleta é quase preta e azul-marinho, com azul elétrico como ação primária, ciano como sinal de descoberta e verde como confirmação/oferta. Cores de estado devem carregar significado e não ornamentar cada componente.

### Primary

- **Azul elétrico** (`#2563eb`): ações principais, links de compra, foco de navegação e seleção ativa.
- **Azul luminoso** (`#3b82f6`): hover e reforço da ação primária.

### Secondary

- **Ciano de descoberta** (`#22d3ee`): destaques de catálogo, informações de plataforma e affordances secundárias.
- **Verde de confirmação** (`#10b981`): ofertas, disponibilidade e estados positivos.

### Tertiary

- **Rosa de alerta** (`#f43f5e`): erro, indisponibilidade e remoção destrutiva.

### Neutral

- **Canvas preto** (`#000000`): fundo de navegação e áreas de maior contraste.
- **Superfície profunda** (`#020617`): fundo principal e painéis de leitura.
- **Superfície ardósia** (`#0f172a`): cards, campos e blocos de informação.
- **Borda ardósia** (`#334155`): separadores finos e limites de componentes.
- **Texto primário** (`#ffffff`): títulos, valores e ações de alta prioridade.
- **Texto secundário** (`#cbd5e1`): descrições e conteúdo de suporte.
- **Texto atenuado** (`#94a3b8`): metadados, labels e informação auxiliar.

**The Signal Color Rule.** Azul é ação; ciano é descoberta; verde é confirmação; rosa é problema. Não use a mesma cor para estados semanticamente diferentes.

## Typography

**Display Font:** Inter (with `sans-serif` fallback)

**Body Font:** Inter (with `sans-serif` fallback)

**Character:** A tipografia é direta, compacta e contemporânea. Pesos fortes dão presença aos títulos e preços; texto secundário permanece aberto e confortável para leitura em telas densas.

### Hierarchy

- **Display** (900, `clamp(2.25rem, 5vw, 3.75rem)`, line-height 1.05): heróis e mensagens de entrada.
- **Headline** (800, `clamp(1.875rem, 4vw, 3rem)`, line-height 1.1): títulos de página e seções principais.
- **Title** (700, `1.25rem`, line-height 1.25): títulos de cards, produtos e blocos.
- **Body** (400, `1rem`, line-height 1.6): descrição e orientação; manter parágrafos em medida confortável, idealmente entre 65 e 75ch.
- **Label** (700, `0.75rem`, line-height 1.3, tracking `0.12em`): categorias, plataforma, estado e metadados curtos.

**The Weight Before Glow Rule.** Resolva hierarquia com tamanho, peso e espaço antes de adicionar cor neon ou efeito de brilho.

## Layout

O layout usa um container central com largura máxima próxima de `1280px`, padding lateral responsivo e seções empilhadas. O catálogo alterna entre filtros laterais e grade de produtos; em telas menores, filtros e navegação tornam-se controles recolhíveis ou menus móveis. Carrosséis usam rolagem horizontal com snap e cards parcialmente visíveis para sinalizar continuidade.

O ritmo espacial base é de `8px`, `12px`, `16px`, `24px` e `32px`, com aproximadamente `48px` entre seções importantes. A barra de navegação permanece fixa no topo. A hierarquia deve sobreviver sem depender de hover, e conteúdo de produto não deve exigir rolagem horizontal acidental.

**The Showcase Frame Rule.** Cada tela deve ter um palco visual claro: container, título, conteúdo e ação. Não empilhe painéis apenas para preencher espaço.

## Elevation & Depth

O sistema atual é híbrido: camadas tonais escuras e bordas finas fazem a maior parte do trabalho; sombras suaves e gradientes radiais aparecem como acentos de vitrine. A direção aprovada para evolução é mais plana e limpa: reservar sombra e blur para estados ou elementos que realmente precisam se separar, não para todas as superfícies.

### Shadow Vocabulary

- **Ambient low** (`0 14px 32px rgba(2, 6, 23, 0.22)`): separação suave de cards sobre o canvas.
- **Panel depth** (`0 18px 48px rgba(2, 6, 23, 0.28)`): painéis grandes e modais, usado com parcimônia.
- **Focus/hover glow**: preferir mudança de borda e contraste; brilho colorido não é padrão de repouso.

**The Flat Surface Rule.** Uma superfície usa borda ou sombra como separador principal; não combine borda pesada, sombra ampla e blur ornamental no mesmo bloco.

## Shapes

A linguagem de formas usa cantos arredondados, mas com uma escala controlada: controles em torno de `12px`, cards em `16px`, painéis em `24px` e pills apenas para ações compactas, badges e filtros. As bordas são finas, em ardósia, e ficam mais luminosas apenas no hover, foco ou seleção. Imagens de capa usam clipping arredondado e proporções estáveis.

Campos devem manter fundo escuro sólido o bastante para leitura, labels visíveis e foco perceptível. Estados de erro usam rosa com mensagem de recuperação; estados positivos usam verde sem depender apenas da cor.

## Components

### Navigation

Barra fixa escura, com logo à esquerda, links de texto no desktop, busca e ações de favoritos/carrinho/conta. No mobile, os links entram em menu expansível. Ícones devem ter labels acessíveis e badges só aparecem quando há contagem relevante.

### Primary Button

Pill azul elétrico, texto branco, peso 700, padding próximo de `12px 20px`. Hover clareia para azul luminoso; disabled reduz opacidade e impede o cursor. O texto deve nomear a ação: “Adicionar ao carrinho”, “Entrar” ou “Continuar”.

### Secondary Button

Pill ou controle arredondado com fundo de superfície profunda, borda ardósia e texto secundário. Hover aumenta contraste da borda; usar para voltar, cancelar e ações de menor prioridade.

### Product Card

Card de superfície ardósia com borda fina, imagem de capa, categoria, título, plataforma, preço, estoque e ação. A seleção de plataforma deve ser local ao card e visualmente inequívoca. O preço é o dado dominante depois do título; disponibilidade e desconto usam estados semânticos.

### Panel

Painel amplo para formulário, checkout, página de conta ou agrupamento de catálogo. Usa fundo profundo, borda discreta e padding de `24px` a `32px`; evitar painéis aninhados sem necessidade.

### Input

Campo escuro com label acima, borda ardósia, texto branco, placeholder atenuado e foco azul visível. Autofill deve preservar contraste. Erros aparecem próximos ao campo ou ao formulário e descrevem a recuperação.

### Status Chip

Pill compacta para desconto, plataforma, estoque e estado do pedido. Use azul/ciano para informação, verde para confirmação e rosa para problema. O texto deve continuar compreensível em monocromia.

## Do's and Don'ts

### Do

- **Do** usar azul elétrico para orientar a próxima ação.
- **Do** deixar jogo, plataforma, preço e estoque visíveis no mesmo contexto.
- **Do** preferir superfícies sólidas e bordas finas ao adicionar novas telas.
- **Do** manter o texto da interface em português e os labels orientados à ação.
- **Do** testar navegação por teclado, foco, estados vazios, loading, erro e mobile.
- **Do** usar imagens reais do catálogo como foco visual da vitrine.

### Don't

- **Don't** transformar cada seção em um card arredondado aninhado.
- **Don't** usar gradiente de texto como recurso padrão de ênfase.
- **Don't** espalhar blur, glow e sombras coloridas em todos os componentes.
- **Don't** usar neon para substituir hierarquia, contraste ou feedback de estado.
- **Don't** inventar claims comerciais, avaliações, métricas ou integrações oficiais.
- **Don't** usar emoji ou glifos Unicode como substitutos do sistema de ícones Lucide.
