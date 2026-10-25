# Contratos e testes — ARUAN Gameplay Feel V3

Fonte autoral: `ARUAN_OVERHAUL_WICKED_ARGON_V3_SOULSLIKE.md` (25/10/2026). Este resumo operacional não substitui a especificação V3.

## Critérios de jogo
- Stick movimento 360°, magnitude continua e direção projetada no chão, teclado preservado.
- Intenção lida em todo frame lógico mesmo durante ataque/dodge/parry/hitstop; comando aceito, bufferizado ou rejeitado com motivo.
- Condições de transição representadas por origem, destino, fase, recurso, expiração e cleanup; cancel não é liberado universalmente.
- Attack1→Attack2→Attack3 são visualmente e mecanicamente diferentes; máximo um follow-up pendente, nunca um terceiro golpe fantasma após dodge.
- Dodge durante Attack2 substitui follow-up e sai no primeiro cancel legal, mantendo posição/apoios, trajetória, animação e i-frames de gameplay sem atravessar parede.
- Defesa direcional não funciona por trás; block não exige escudo inexistente; custo por hit/guard break.
- Parry tem early/correct/late com resultados diferentes; parry certo abre riposte somente no contexto válido.
- Ataques inimigos avisam antes, têm hitbox ativa em tempo delimitado e deixam recovery punível.
- Golpe sem colisão real não causa dano, hitstop de contato nem rumble; golpe com hit gera reação, HP/poise e feedback uma vez.

## Matriz de testes da V3
- **G01–G18:** stress de controles: reversão 180°, stick durante golpe, combo→dodge/guard, parry→dodge, sprint→attack, dodge→followup, FPS variável, input durante hitstop, callbacks velhos, reconexão.
- **T01–T20:** progressão analógica, 3 hit combo, cancel, charge, corrida, haptics fallback, hits/whiffs, gamepad presets, menus e build.
- **S21–S29:** bloqueio frente/costas, guard break, parry cedo/certo/tarde, i-frames por timing, telegraphs, riposte, stamina zerada, buffers em fases comprometidas.
- Marcar cada caso `pass`, `fail`, `not-run` e **evidência**: automação/arquivo, captura, vídeo ou hardware.
- Métricas recomendadas: `pressedToAcceptedMs`, `pressedToAnimationMs`, `cancelReason`, `actionInstanceId`, `footSlip`, `hitboxActive`, `iframeActive`, FPS medido pelo contexto correto. Valores sugeridos na V3 são de tuning do Aruan, **não** oficiais do Wicked.

## Guardrails
`npm test` antes/depois em arquivos críticos; `npm run test:browser` headless, sem navegador headed; `npm run test:movalab` quando relevante. Preservar SHA de world/math/paint/effects/server e atualizá-los conscientemente se mudar. Só certificar sensação de jogo após avaliação em tela com controle/teclado real; smoke não prova isso.
