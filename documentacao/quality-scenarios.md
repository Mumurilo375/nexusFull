# Quality Scenarios — Nexus Full

Quality Scenarios descrevem como o sistema deve reagir a situações importantes de qualidade. 

| Cenário | Estímulo | Contexto | Resposta esperada | Medida de resposta |
| --- | --- | --- | --- | --- |
| **Desempenho na consulta ao catálogo** | Um cliente solicita a lista de jogos. | Uso normal, considerando até 100 usuários simultâneos. | O Nexus retorna o catálogo sem demora excessiva. | A `PROPOSTA.md` prevê que 95% das operações comuns respondam em até 2 segundos. Não há medição que comprove o cumprimento dessa meta. |
| **Disponibilidade da API** | Um cliente envia uma requisição à API. | Durante o período de um mês. | A API responde às requisições quando os serviços próprios estão operacionais; falhas devem ser identificáveis. | A `PROPOSTA.md` propõe disponibilidade mensal de pelo menos 99,5%. O projeto não mantém monitoramento contínuo nem histórico para confirmar a disponibilidade real. |
| **Resiliência com Redis indisponível** | O Redis para de responder durante uma consulta ao catálogo. | O backend está ativo e o PostgreSQL está disponível. | O catálogo é consultado no PostgreSQL e a requisição pode continuar sem cache; a indisponibilidade do Redis não interrompe essa consulta. | Em uma verificação futura, confirmar que a consulta retorna dados do banco e que o backend registra a falha do cache. Não há meta numérica proposta para esse cenário nem evidência de que essa verificação foi executada. |

