## Cache-aside: MISS e HIT

O backend controla a leitura e o preenchimento do cache:

1. Ao pedir os detalhes de um jogo, o backend procura o resultado no Redis.
2. **MISS:** se não encontrar, consulta o PostgreSQL, monta a resposta e a salva no Redis.
3. **HIT:** em uma próxima consulta igual, encontra a resposta no Redis e a reutiliza sem executar a busca correspondente no banco.

## TTL

Cada resultado é salvo com TTL de **300 segundos (5 minutos)**. Após expirar, a próxima consulta gera um MISS e busca novamente no banco. O TTL não é renovado por uma leitura.

## Invalidação após alterações

Depois de uma alteração relevante, o backend incrementa no Redis a versão global do catálogo. As próximas buscas usam chaves com a nova versão, geram MISS e carregam dados atualizados. As entradas antigas deixam de ser usadas e expiram pelo TTL.

A invalidação é chamada em alterações de jogos, promoções e seus vínculos, listings, categorias, plataformas, imagens, tags, avaliações e chaves de jogos, além de operações de checkout e pagamento que afetam o catálogo. Ela é global: uma alteração pode invalidar também outras consultas do catálogo.

Se o Redis falhar durante a invalidação, dados antigos podem continuar disponíveis até expirarem ou ocorrer uma nova invalidação.

## Demonstração de MISS e HIT

Com os serviços em execução, na raiz do projeto:

```bash
docker compose ps
docker compose exec redis redis-cli ping
```

O Redis deve responder `PONG`. Em outro terminal, acompanhe os logs:

```bash
docker compose logs -f backend
```

Consulte duas vezes os detalhes de um jogo existente, trocando `7` pelo ID correto:

```bash
curl -k https://localhost/api/games/7/details
curl -k https://localhost/api/games/7/details
```

Se a entrada ainda não estiver no cache, observe `CACHE MISS` na primeira consulta e `CACHE HIT` na segunda. O log informa o tipo e o ID consultado, um resumo do resultado e `tempoMs`, medido dentro da função de cache. A primeira consulta também pode ser HIT se alguém já tiver consultado o jogo. O `-k` permite usar o certificado HTTPS local.

## Resultado real: MISS × HIT

As medições foram registradas no backend em **25/11/2026**. Em cada exemplo, as duas buscas usam os mesmos parâmetros ou ID e mostram o mesmo resumo de resultado.

### 1. Lista de jogos

**Consulta:** página 1, limite de 60 jogos. **Resultado:** 26 jogos.

```text
MISS · PostgreSQL → 278,87 ms
HIT  · Redis      →   1,55 ms
                       ────────
Diferença           277,32 ms a menos no HIT
```

### 2. Detalhes de um jogo

**Consulta:** jogo ID 1. **Resultado:** Elden Ring.

```text
MISS · PostgreSQL → 101,15 ms
HIT  · Redis      →  16,04 ms
                       ───────
Diferença            85,11 ms a menos no HIT
```

### 3. Lista de ofertas de jogos

**Consulta:** página 1, limite de 100 ofertas, com estoque. **Resultado:** 93 ofertas.

```text
MISS · PostgreSQL → 118,39 ms
HIT  · Redis      →   1,33 ms
                       ────────
Diferença           117,06 ms a menos no HIT
```

### 4. Lista de promoções

**Consulta:** página 1, limite de 100 promoções. **Resultado:** 6 promoções.

```text
MISS · PostgreSQL → 82,30 ms
HIT  · Redis      →  0,82 ms
                      ───────
Diferença           81,48 ms a menos no HIT
```

### 5. Detalhes de uma promoção

**Consulta:** promoção ID 8. **Resultado:** Nintendo Switch.

```text
MISS · PostgreSQL → 57,02 ms
HIT  · Redis      → 29,78 ms
                      ───────
Diferença           27,24 ms a menos no HIT
```

**Origem dos exemplos:** os detalhes do jogo e da promoção vieram do log enviado. Para as três listas, esse log tinha apenas HITs; os pares acima foram obtidos em testes complementares no ambiente em execução, com os mesmos parâmetros.

**Como interpretar:** `tempoMs` mede o trecho da função de cache. No MISS, inclui a consulta ao banco e a tentativa de salvar no Redis; não é o tempo total percebido pelo usuário. Os valores são medições pontuais, não uma média ou garantia de ganho em toda consulta.
