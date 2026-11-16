# SLOs e SLIs

Um **SLI** é um indicador medido para acompanhar um serviço. Um **SLO** é a meta desejada para esse indicador.

As metas abaixo são **propostas acadêmicas**. Atualmente, o Nexus não coleta esses indicadores de forma contínua; portanto, elas não representam resultados medidos nem garantias de funcionamento.

| Indicador (SLI) | Meta proposta (SLO) | Como medir futuramente |
| --- | --- | --- |
| Tempo de resposta | p95 de até 500 ms para rotas comuns | Registrar a duração de cada requisição e calcular o percentil 95 em um período definido. |
| Disponibilidade da API | 99% por mês | Verificar periodicamente uma rota de prontidão e calcular a proporção de verificações bem-sucedidas no mês. |
| Taxa de erros HTTP 5xx | Inferior a 1% por mês | Dividir o número de respostas 5xx pelo total de respostas HTTP no mês e multiplicar por 100. |

Para que esses SLOs possam ser acompanhados, será necessário coletar e guardar as medições ao longo do tempo. Os health checks atuais do Docker Compose não produzem esse histórico.
