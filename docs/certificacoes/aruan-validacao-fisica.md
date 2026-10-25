# Revisão física pendente — Etapas8/9 e portão10

A instrução desta execução determina Em Revisão quando o hardware não está disponível. A auditoria corrigiu a conclusão prematura: #17/#18 estão abertas Em Revisão, #19 aberta Bloqueada e a Sprint1#3 aberta Em Revisão. Os critérios originais aceitavam registrar a limitação, mas a instrução mais recente do autor exige manter a revisão pendente. O código e os testes automatizados continuam aprovados; não se inventa teste físico.

| Issue | O que já foi verificado | O que falta |
|---|---|---|
| #17 / toque | Multitouch CDP nativo no Chrome, emulação360×740/740×360/320×568, combo/mira/dodge, alternância e alvos | Celular real: conforto, safe area/notch, scroll/zoom, retrato/paisagem e sensação |
| #18 / Xbox | Gamepad API real com dados standard simulados,8direções, deadzone/hot-plug/botões/alternância | Controle Xbox real, conexão, deriva real, sticks, botões e resposta |
| #19 / portão10 | npm test, hashesLF, cópia limpa,7animações/8direções e smoke sem erros | Fechamento17/18 após verificação física ou aceite explícito do autor para o escopo simulado |

Não foi aberto navegador visível nem procurado hardware inexistente. O harness expôs0controles físicos; teste virtual não é conexão física. A revisão ficará pendente, sem pausar as melhorias seguras de arte/animação/performance que dependem apenas do código já verificado. O autor pode executar a matriz quando tiver os aparelhos ou registrar explicitamente seu aceite de escopo; nenhum aceite é presumido.

As dependências nativas existentes não foram removidas para liberar cards: Sprint2#22 continua Bloqueada pelaSprint1#3. As etapas técnicas23/25 e tarefa28 já concluídas permanecem válidas. Etapa14#27 pode consolidar seus critérios técnicos, pois seu blocker direto25 está fechado. A implementação de personalização20 foi entregue após o portão automatizado então fechado; a auditoria reabriu o aceite total, sem apagar código ou reescrever história.
