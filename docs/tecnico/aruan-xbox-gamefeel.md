# Missão 01 — Xbox A/B/L3, corrida e stamina (#84)

Base: bae71f1. Branch exclusiva: codex/xbox-gamefeel. Modelo no fechamento: GPT-6.1 Sol. Data: 26/10/2026 (UTC−3).

## Comportamento

- ARUAN_FLUIDO e WICKED_CLASSIC: A curto executa quickstep direcional na soltura; A mantido por 170 ms solicita corrida. Soltar depois dessa janela não esquiva.
- B executa o rolamento existente por borda. L3 alterna corrida; ficar segurando L3 não força o modo ligado. A seleção permanece após parar e retomar o analógico.
- Inclinação total sozinha continua movimento normal, até 290 u/s; corrida selecionada chega a 365 u/s. Resposta normal e inversão proporcional preservadas. Sprint usa resposta exponencial 8/s: após já andar a 290, primeira etapa 294,84; após mais 300 ms, 358,63 u/s (ensaio).
- Stamina: 18 pontos/s durante deslocamento efetivo em sprint. Parada/colisão sem deslocamento não drenam. Exaustão cancela o toggle e exige recuperar 18 pontos; A mantido precisa ser solto e pressionado novamente. Recuperação existente: atraso 0,48 s + 26 pontos/s.
- Mixamo65: movimento normal usa walking com mistura de run limitada a 35%; corrida usa standard run. Cadência por distância, IK e FootPlant continuam ativos. LEGACY preserva A ataque; X/LB/LT/RB/RT/Y continuam nos caminhos existentes.

## Latência de A

Classificação não pode decidir toque antes da soltura. No Chrome com relógio controlado e Gamepad API simulada, toques de 35/80/160 ms disparam exatamente na consulta da soltura, sem espera adicional de 170 ms. Atraso desde pressionar = duração do toque; segurar passa a corrida na primeira consulta depois de 170 ms. Esses valores não medem transporte do controle, frequência física de polling ou latência de apresentação. A simulação permanece 120 Hz (8,33 ms/passo); o teste chama polling diretamente. B continua imediato na borda.

## Verificação

- npm test antes e depois: cinco hashes canônicos, 10.552 poses, gameplay, aparência e continuidade verdes.
- node tests/headless.cjs 072-xbox-gamefeel --xbox-only: A toque/hold, B, L3, stamina temporal, exaustão/recuperação, analógico parcial/reversão, parada/retomada e X/LB/LT/RB/RT/Y; Mixamo65 e V1. Duas páginas, zero erros de console/rede. Relatório: xbox-gamefeel-report.json.
- node tests/headless.cjs --smoke --locomotion-only: 996 apoios; slip 1,46e−14, erro de comprimento 6,04e−14, fallback de asset inválido, mesma trajetória V1/Mixamo e ações nativas verdes.
- Capturas 072 de comparação normal/corrida e campo revisadas; qualidade artística e Xbox físico continuam pendentes.
- npm run test:browser completo verde: duas páginas, três viewports touch, sete animações/oito direções, zero erros de console/rede; 331 JPEGs conferidos. A expectativa antiga de A ao pressionar foi atualizada para quickstep na soltura.
- Issue #84 sem blockers ou dependentes nativos; filha da #83, P0/Sprint9/Etapa39, encaminhada para revisão física.

## Integração

Commit/push somente na branch da missão. Para integrar, revisar a branch e fazer merge de codex/xbox-gamefeel na master em checkout livre, resolvendo possíveis mudanças concorrentes em controls/main. Reexecutar npm test, npm run test:browser e node tests/headless.cjs --smoke --xbox-only após combinar as missões. Nenhum módulo de mira/runas, arquivo pessoal MovaLab, asset bruto ou arquivo preservado foi alterado. Os gates humanos existentes continuam abertos.

## Arquivos alterados

Runtime: js/controls.js, js/main.js, js/locomotion.js. Testes: tests/game.cjs, tests/browser-gamepad.js, tests/browser-locomotion.js, tests/browser-xbox-gamefeel.js, tests/headless.cjs. Registros: este documento, xbox-gamefeel-report.json, docs/memory-ai.md, capturas/timelapse/README.md e dois JPEGs072.

## Integração para teste do autor — 26/10/2026

Pedido posterior: integrar a missão à master. f60ca64 combinado com50b4758, preservando os dois registros da memória e o workspace pessoal atual. npm test antes/depois e Xbox headless sobre o servidor real5317 passaram. Serviço iniciado oculto na master, PID25624, mantido para teste do autor. Acesso: http://localhost:5317/?dev=1; recarregar com Ctrl+F5. Publicação via branch/PR para evitar push direto àmaster. Xbox físico e arte ainda aguardam o autor.
