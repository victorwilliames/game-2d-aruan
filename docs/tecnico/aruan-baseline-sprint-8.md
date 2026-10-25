# Baseline Técnico da Sprint 8 — Game Feel & Combate Soulslike (#69)

## 1. Inventário do Estado Atual (Pré-Overhaul)

### 1.1 Máquina de estados e leitura de input (`js/main.js`, `js/controls.js`)
- **Estados atuais do `Player`:** `'move'`, `'attack'`, `'dodge'`.
- **Leitura de comandos:**
  - Teclado (`WASD` / Setas) normalizado em 8 direções isométricas (`[(y-x)*SQ1_2/l, (y+x)*SQ1_2/l]`).
  - `Controls.screenVector(x, y, analog)` atualmente quantiza o ângulo em múltiplos de `Math.PI / 4` (`Math.round(Math.atan2(y,x)/(Math.PI/4))*(Math.PI/4)`), impedindo locomoção 360° real no stick analógico.
  - Cliques de ataque entram em `Input.clicks` (fila bruta de até 16 cliques) e em `Player.pending` com `p.pending.length < 2 - p.combo` e TTL de `1.2s` (excessivo; permite que cliques rápidos agendem até 3 ataques seguidos).
  - `beginDodge()` é chamado diretamente no evento `keydown` (`Space`) ou `PadB`, sem `IntentQueue` com TTL (`165ms`). Se o jogador apertar esquiva poucos frames antes de `Math.max(a.def.cancel, a.def.activeEnd)`, o comando é descartado silenciosamente em vez de ficar no buffer até o primeiro frame legal da janela de cancelamento.
- **Combate e colisão:**
  - `hit(i)` executa em um único instante (`oldT < hitTime && t >= hitTime`) por teste radial/angular simples contra `o.kind === 'dummy'`.
  - No golpe 3 (`i === 2`), `if (count || i === 2)` aplica `Game.hitstop = 0.065` e `Game.shake = 6` mesmo errando no vazio (whiff), violando `T11`/`T12`.
  - Ausência de `CombatResources` (HP, Stamina, Focus, Poise), `BLOCK` direcional, `PARRY`, `GUARD_BREAK`, `RIPOSTE` e IA de inimigo com ataques telegrafados.

---

## 2. Auditoria de Animações e MovaLab (`ANIMATION_REGISTRY`)

| Ação / Estado | Clipe Primário (MovaLab / Mixamo) | Fallback Procedural V1 (`js/rig.js`) | Root Motion / Driver | Status |
|---|---|---|---|---|
| `idle` | `293b1463...aruan-clip.v1.json` / `mixamo-idle.aruan-clip.v1.json` | `lerpPose(IDLE_A, IDLE_B)` + `idleBlink` | Controller (`vel = 0`) + `FootPlant` | Ativo |
| `walk` | `mixamo-walking.aruan-clip.v1.json` | `locomotionPose(phase, 0)` | Controller 360° + `FootPlant` | Ativo |
| `run` / `sprint` | `mixamo-run.aruan-clip.v1.json` | `locomotionPose(phase, runBlend)` | Controller 360° + `FootPlant` | Ativo |
| `pivot_90` / `pivot_180` | Procedural dinâmico + blend MovaLab | `pivotPose` / inclinação de torso e pelve | Controller (`turn` + desaceleração rápida) | Etapa 27 (#70) |
| `quickstep` / `roll` | `native-dodge` (procedural otimizado) | `quickstepPose(t)` / `dodgePose(t)` | Curva `dodgeTravel(t)` c/ i-frames explícitos | Etapa 27 (#70) |
| `bow_club_attack_01` | Procedural V1/V2 (`ATTACKS[0]`: Diagonal/Horizontal) | `ATTACKS[0]` (`horizontal`) | Lunge controlado por fase + `FootPlant` | Etapa 28 (#71) |
| `bow_club_attack_02` | Procedural V1/V2 (`ATTACKS[1]`: Revés lateral) | `ATTACKS[1]` (`reves`) | Lunge controlado por fase + `FootPlant` | Etapa 28 (#71) |
| `bow_club_attack_03` | Procedural V1/V2 (`ATTACKS[2]`: Slam vertical de cima) | `ATTACKS[2]` (`de-cima`) | Lunge controlado por fase + `FootPlant` | Etapa 28 (#71) |
| `bow_club_charge` | Procedural V1/V2 (`ATTACK_CHARGED`) | `ATTACKS[2]` c/ windup estendido | Lunge pesado + `FootPlant` | Etapa 28 (#71) |
| `bow_club_running` | Procedural V1/V2 (`ATTACK_RUNNING`) | `ATTACKS[0]` c/ entrada rápida em corrida | Impulso de corrida + `FootPlant` | Etapa 28 (#71) |
| `bow_club_dodge_atk` | Procedural V1/V2 (`ATTACK_DODGE_FOLLOWUP`) | `ATTACKS[1]` c/ saída baixa da esquiva | Avanço curto + `FootPlant` | Etapa 28 (#71) |
| `block_loop` / `block_hit` | Procedural V1/V2 (`guardPose`) | `guardPose` (arco firme pela extremidade) | Controller (`moveSpeed * 0.55`) | Etapa 29 (#72) |
| `parry` | Procedural V1/V2 (`parryPose`) | `parryPose` (`startup` → `active` → `recovery`) | Controller travado na janela | Etapa 29 (#72) |
| `riposte` | Procedural V1/V2 (`ripostePose`) | `ripostePose` (golpe crítico frontal) | Lunge curto travado no alvo | Etapa 29 (#72) |

---

## 3. Resolução Oficial de Conflitos de Input

| Conflito Identificado | Decisão Aplicada na Sprint 8 |
|---|---|
| `KeyR` (`resetPlayer` vs `Rune / Skill`) | `KeyR` permanece exclusivamente como `resetPlayer()` (invariante de testes e atalho de treino). Habilidade/Runa usa `KeyE` / `KeyF` no teclado e `RB` (`button 5`) no controle Xbox. |
| `Space` (Esquiva vs Sprint no Teclado) | No teclado, `Space` é Esquiva imediata (`quickstep`/`roll`) e `ShiftLeft`/`ShiftRight` é Sprint contínuo. |
| Controle Xbox (`ARUAN_FLUIDO` vs `WICKED_CLASSIC` vs `LEGACY`) | **`ARUAN_FLUIDO` (padrão):** `A` (`button 0`) = Esquiva, `B` (`button 1`) = Esquiva/Backstep, `X` (`button 2`) = Ataque (toque = leve, segurar = carregado), `L3` (`button 10`) = Sprint, `LB` (`button 4`) = Block, `LT` (`button 6`) = Parry, `RB` (`button 5`) = Runa/Skill.<br>**`WICKED_CLASSIC` (opcional):** `A` toque (< 170 ms) = Esquiva, `A` segurar (≥ 170 ms) = Sprint; `X` toque = Ataque leve, `X` segurar (≥ 260 ms) = Ataque carregado.<br>**`LEGACY` (compatibilidade):** `A` = Ataque, `B` = Esquiva. |
| Mouse Direito (`contextmenu` vs `BLOCK`) | `RMB` (`button 2`) sustenta `BLOCK` direcional; `KeyQ` ou `Mouse4` aciona `PARRY`. |
| MovaLab `game-bindings.json` | O registro MovaLab continua carregando `idle`, `walk`, `run` e ações customizadas sem sobrescrever a arbitragem de prioridade do `ActionResolver`. |

---

## 4. Baseline Inicial da Matriz de Cenários (`G01–G18`, `T01–T20`, `S21–S29`)

- **Locomoção (`G01, G02, G06, G07, G14, G15` / `T01, T02`):** Parcial no baseline (8 direções no teclado funcionam; analógico ainda quantizado em 45°; sem quickstep vs roll diferenciados; sem i-frame separado da duração total). Será entregue na Etapa 27 (#70).
- **Combate, Combo e Cancelamentos (`G03–G05, G08–G13, G16–G18` / `T03–T07, T10–T20`):** Parcial no baseline (`Player.pending` aceita 2 ataques extras; esquiva antes do frame `cancel` não entra em buffer; golpe 3 tem hitstop no vazio). Contrato de `IntentQueue` e `ACTION_SPECS` criado nesta Etapa 26 (#69); resolução completa na Etapa 28 (#71).
- **Mecânicas Soulslike e Inimigo (`S21–S29` / `T08, T09`):** Ausentes no baseline; contratos configurados em `COMBAT_RESOURCES_CONFIG` e `ACTION_SPECS` nesta Etapa 26 (#69) para implementação nas Etapas 29 (#72) e 30 (#73).
