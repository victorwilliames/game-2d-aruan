# Relatório de Execução — Sprint 8 (Overhaul de Game Feel e Combate Soulslike)

**Data do Checkpoint:** 25/10/2026  
**GOAL:** [#68 — Overhaul de Game Feel, Animação e Combate Soulslike (Wicked + Dark Souls)](https://github.com/victorwilliames/game-2d-aruan/issues/68)  
**Etapas Implementadas:** `#69` → `#74` (Sprint 8, Etapas 26 a 31 no Project #2)

---

## 1. Resumo Executivo

A Sprint 8 implementou no motor do jogo (`js/controls.js`, `js/rig.js`, `js/main.js`, `index.html`, `style.css`) a arquitetura completa de **Game Feel e Combate Soulslike V3**:

1. **Etapa 26 (`#69` — commit `7b76dfa`):**
   - Auditoria baseline em `docs/tecnico/aruan-baseline-sprint-8.md`.
   - Contratos declarativos exportados em `js/controls.js`: `ARUAN_GAME_FEEL`, `COMBAT_RESOURCES_CONFIG`, `CONTROL_PRESETS` (`ARUAN_FLUIDO`, `WICKED_CLASSIC`, `LEGACY`), `ACTION_SPECS`, `ANIMATION_REGISTRY`, vetor contínuo 360° (`screenVector360`) e `IntentQueue` com expiração determinística em ms (`pushIntent`, `peekIntent`, `consumeIntent`, `clearIntents`, `pruneIntents`).
2. **Etapa 27 (`#70` — commit `96ea599`):**
   - Motor de locomoção 360° analógico real com aceleração/desaceleração assimétrica, detecção de pivô `>= 135°` (`Player.pivot`), **Sprint** (`365 u/s`, `Shift` / `L3` / `B` hold) e distinção entre **Quickstep** (`0.30s`, `390 u/s`, `i-frames 0.03s–0.19s`) e **Roll** (`0.42s`, `340 u/s`, `i-frames 0.04s–0.24s`).
   - Flag autoritativo `Player.invulnerable` restrito estritamente à janela `[iFrameStart, iFrameEnd]`.
   - Buffer de esquiva executado automaticamente no primeiro frame legal de cancelamento pós-hit (`d.minCancel`).
3. **Etapa 28 (`#71` — commit `ad5071a`):**
   - **ActionResolver** e combo de 3 golpes distintos com o arco-porrete empunhado pela ponta (`LIGHT_1` diagonal, `LIGHT_2` reverso, `LIGHT_3` slam descendente pesado) + variantes contextuais: `RUNNING_ATTACK` (ataque em sprint), `DODGE_FOLLOWUP` (ataque pós-esquiva) e `CHARGED` (ataque carregado segurando ataque `>= 380ms`).
   - Correção definitiva do *combo lock*: pressionar Esquiva, Guarda ou Parry durante um golpe limpa imediatamente `Player.pending` e `Input.clicks`, garantindo que `ataque -> ataque -> esquiva` cancele qualquer 3º golpe enfileirado e dispare a esquiva no primeiro frame permitido (`G03`, `G12`, `T03`, `T06`).
   - Hitbox varrida honesta na extremidade do arco (`distToSegment2D` entre `rig.guard`, `rig.tip` e `prevTip`), `Player.hitTargets` por `actionInstanceId` (máximo 1 acerto por alvo por golpe, `T10`) e **zero hitstop/shake no whiff** (`if (count > 0)`, `T11`, `T12`).
4. **Etapa 29 (`#72` — commit `4644f22`):**
   - Sistema completo de recursos `Player.resources` (`hp`, `stamina`, `focus`, `poise`) com regeneração pós-atraso (`regenDelayMs = 550ms`) e proteção contra valores `NaN`/negativos (`T16`).
   - Sem stamina (`stamina <= 0`), ataques/esquivas/parry são recusados com aviso `SEM STAMINA`, mas caminhar continua 100% livre (`S21`).
   - **Block Direcional** (`Shift Direito` / `E` / `LB` / `Botão Direito`): cone frontal de `140°`, custo passivo zero ao segurar (`S23`), absorção de dano com chip damage (`20%`) e dreno de stamina no impacto (`S22`), **Guard Break** (`STAGGER` de `0.65s`) quando a stamina zera no bloqueio (`T09`), e prioridade imediata de esquiva em `LB + A/Espaço` (`S27`).
   - **Parry Cronometrado** (`Q` / `LT`): startup `60ms`, janela ativa `150ms` e recovery vulnerável de `280ms` no whiff (`S24`, `T08`).
   - **Riposte Contextual** (`S28`): golpe crítico de alto impacto (`38` dano, `1.55x`) ao atacar inimigo em estado `stagger` após Parry ou quebra de Poise, além de **Rune Skill** (`R` / `RB`, consome `25 Focus`).
5. **Etapa 30 (`#73` — commit `2b050f2`):**
   - **TrainingEnemy** (`WorldScene.props[1]`, ativado por golpe ou modo Duelo `Tecla V` / botão `#duel`): máquina de estados completa (`idle -> approach -> windup -> active -> recovery -> hit_react -> stagger -> dead -> respawn`).
   - Dois ataques telegrafados distintos com arco visual no chão: `ENEMY_SLASH_1` (corte horizontal, windup `0.48s`) e `ENEMY_OVERHEAD` (esmagamento vertical pesado, windup `0.78s`), ambos com trava de rotação nos últimos 30–38% do windup (`S26`).
   - Barras de HP e Poise sobre o inimigo de treino, reação a hit, stagger por Poise zerada ou Parry, morte e respawn limpo após `3.0s` (`T19`).
6. **Etapa 31 (`#74` — neste commit):**
   - **HUD Soulslike real** (`index.html`, `style.css`, `js/main.js`) com barras vivas de **HP**, **Stamina** e **Focus**, aviso contextual (`#combat-notice`), status do inimigo (`#enemy-status`), seletor de preset (`#preset-btn`: `ARUAN_FLUIDO`, `WICKED_CLASSIC`, `LEGACY`) e botão de Duelo (`#duel` / `V`).
   - **Debug Overlay (`F3`)** exibindo estado, subfase (`windup/active/recovery`), frame, `invulnerable`, `canCancel`, `Preset`, `IntentQueue`, `HP/Stamina/Focus/Poise` e estado do `TrainingEnemy`.
   - **WebAudio procedural (`SoundFX`)** e **Gamepad Haptics (`vibrationActuator`)** isolados em `try/catch` (sem bloquear o passo de `1/120s`, `T18`).

---

## 2. Matriz de Verificação (G01–G18, T01–T20, S21–S29)

| Código | Cenário | Status | Evidência / Implementação |
|---|---|---|---|
| G01–G02 | Resposta imediata de ataque/esquiva e parada sem deslizar | ✅ | `tests/game.cjs` + amortecimento exponencial com `FootPlant` sem patinar |
| G03 | `Ataque -> Ataque -> Esquiva` cancela no primeiro frame legal pós-ativo | ✅ | `beginDodge` limpa `Player.pending` + `Input.clicks` e agenda `dodgeQueued` (`tests/game.cjs`) |
| G04–G06 | Diagonal 360°, analógico proporcional e pivô `>= 135°` | ✅ | `screenVector360`, `stickMag`, `Player.pivot` (`tests/game.cjs`) |
| G07–G11 | 3 golpes distintos, ataque em corrida, pós-esquiva e carregado | ✅ | `ATTACKS[0..2]`, `RUNNING_ATTACK`, `DODGE_FOLLOWUP`, `CHARGED` (`tests/game.cjs`) |
| G12 | Sem *combo lock* involuntário (2 cliques = 2 golpes) | ✅ | Verificado em `tests/game.cjs` |
| G13–G18 | Hitbox na ponta do arco, whiff sem hitstop, i-frames e recovery | ✅ | `distToSegment2D`, `if (count > 0)`, `Player.invulnerable` (`tests/game.cjs`) |
| T01–T20 | Fila de intenção, expiração, 1 hit/swing, bordas, blur/reset, haptics seguro | ✅ | `tests/game.cjs` + `tests/browser-smoke.cjs` |
| S21 | Stamina zero bloqueia ataque/dodge/parry, mas nunca bloqueia andar | ✅ | `spendStamina` + locomoção livre em `update()` (`tests/game.cjs`) |
| S22–S23 | Block direcional (`140°`) drena no impacto e tem custo passivo `0` | ✅ | `resolveIncomingHit` + `updateResources` (`tests/game.cjs`) |
| S24–S25 | Parry com startup/active/whiff recovery; golpe pesado com alto custo no block | ✅ | `PARRY_TIMING`, `ENEMY_OVERHEAD` (`tests/game.cjs`) |
| S26 | Inimigo trava rotação no fim do windup (permite esquiva lateral/traseira) | ✅ | `trackRatio` em `updateTrainingEnemy` (`tests/game.cjs`) |
| S27 | `LB + A` prioriza esquiva imediatamente sobre guarda | ✅ | `beginDodge` encerra guarda e inicia dodge (`tests/game.cjs`) |
| S28 | Riposte contextual em inimigo em stagger | ✅ | `RIPOSTE_ATTACK` ao atacar `TrainingEnemy` em `stagger` (`tests/game.cjs`) |
| S29 | Sem *stunlock* infinito no inimigo | ✅ | `poise` regenera e recupera com hiper-armadura no recovery (`tests/game.cjs`) |

---

## 3. Invariantes Preservados

- **Canvas 2D puro**, passo fixo de `1/120 s`, IK com comprimentos invariantes (`boneError <= 1e-6`), pés plantados no mundo (`footSlip <= 0.001`), arco segurado pela extremidade, aljava e 3 flechas nas costas.
- **5 arquivos preservados intactos (`OK: 5 hashes canônicos LF`):** `js/world.js`, `js/math.js`, `js/paint.js`, `js/effects.js`, `server.cjs`.
- **Workspace local do MovaLab preservado:** `tools/movalab/workspace/clips.json`, `tools/movalab/workspace/game-bindings.json` e `exports/` mantidos intactos sem sobrescrita.

---

## 4. Como Testar e Continuar (Handoff para Próxima IA / Autor)

1. **Jogo principal (`http://localhost:5317`):**
   - **Esquiva:** `Espaço` / `Botão A (Xbox)` (toque curto com direção = Quickstep; corrida/duplo = Roll).
   - **Sprint:** segurar `Shift Esquerdo` / `L3` / `B`.
   - **Ataque / Carregado / Riposte:** `Clique Esquerdo` / `J` / `F` / `Botão X (Xbox)` (segurar `>= 380ms` dispara golpe carregado; atacar inimigo em `STAGGER` dispara `RIPOSTE`).
   - **Block Direcional:** segurar `Shift Direito` / `E` / `Botão Direito do Mouse` / `LB`.
   - **Parry:** `Q` / `LT`.
   - **Rune Skill:** `R` / `RB` (consome `25 Focus`).
   - **Duelo Soulslike (Inimigo Ativo):** clicar em `Duelo (V)`, pressionar `V` ou golpear o boneco da direita.
   - **Debug Overlay:** pressionar `F3`.
2. **Pendências para fechamento definitivo do GOAL `#68`:**
   - Avaliação humana do autor em tamanho real de jogo (`http://localhost:5317`) e eventuais ajustes finos de curvas/tempos conforme nova instrução do autor.
