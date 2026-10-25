# Continuidade imediata — Checkpoint Sprint 8 (Combate Soulslike + MovaLab)

> **Marco atual #79 em desenvolvimento:** #76/#77/#78 publicadas, CI corretiva40233385318 e perfis40234664847 verdes. Branch isolada codex/79-canvas-hierarchy contém primeiro Canvas por65canais com dedos, capturas056/057; não é conclusão daSprint9 nem integração de combate. Ler o final de docs/sprints/SPRINT-9-RESUME.md. Processo5320herdado aguarda autorização de reinício; testes temporários seguem independentes.

> **Continuidade Sprint 9 / GOAL #75:** contrato integral em `docs/sprints/aruan-sprint-9-contrato-autoral.md`; estado executável e comandos em `docs/sprints/SPRINT-9-RESUME.md`. Base 28da803 preservada; novo trabalho em checkout isolado `.worktrees/sprint-9` para proteger alterações locais. Project #2 configurado realmente com #76–#83, Sprint 9/P0/Etapas 32–39 e blockers nativos. Aquisição seletiva em andamento, sem conversão massiva. Baseline npm/MovaLab verdes; browser baseline falhou em `native touch attack` (sem alteração de runtime). O texto Sprint 8 abaixo é histórico, não certificado como QA browser atual.

Checkpoint de 25/10/2026, solicitado pelo autor para sincronizar GitHub, documentação e `docs/memory-ai.md` antes da próxima etapa e inspeção por outra IA. Ler `AGENTS.md`, `docs/memory-ai.md` e `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md` antes de alterar qualquer arquivo.

## 1. Estado Atual Publicado na `master`

### Sprint 8 — Overhaul Total de Game Feel e Combate Soulslike (`GOAL #68`)
Todas as 6 etapas técnicas (`#69` a `#74`) foram implementadas, testadas (`npm test` + `npm run test:movalab` verdes) e publicadas na branch `master`:

- **`7b76dfa` (`#69` — Etapa 26):** Baseline Sprint 8 (`docs/tecnico/aruan-baseline-sprint-8.md`), presets `ARUAN_FLUIDO` / `WICKED_CLASSIC` / `LEGACY`, `ARUAN_GAME_FEEL`, `COMBAT_RESOURCES_CONFIG`, `ACTION_SPECS`, `ANIMATION_REGISTRY`, vetor 360° (`screenVector360`) e `IntentQueue` com expiração determinística em `js/controls.js`.
- **`96ea599` (`#70` — Etapa 27):** Locomoção 360° contínua, detecção de pivô `>= 135°` (`Player.pivot`), Sprint (`365 u/s`), `quickstep` (`0.30s`, i-frames `0.03s–0.19s`) vs `roll` (`0.42s`, i-frames `0.04s–0.24s`), `Player.invulnerable` autoritativo e buffer de esquiva no primeiro frame legal pós-ativo.
- **`ad5071a` (`#71` — Etapa 28):** Combo de 3 golpes distintos com arco-porrete empunhado pela extremidade + `RUNNING_ATTACK`, `DODGE_FOLLOWUP` e `CHARGED` attack; correção de *combo lock* (`beginDodge`/`beginParry`/`beginGuard` limpam `Player.pending` e `Input.clicks` imediatamente); hitbox varrida por segmento (`distToSegment2D`), 1 hit por alvo por `actionInstanceId` e zero hitstop/shake no whiff.
- **`4644f22` (`#72` — Etapa 29):** Recursos `HP` (`100`), `Stamina` (`100`), `Focus` (`100`) e `Poise` (`60`); recusa de ação sem stamina mantendo caminhada livre (`S21`); Block direcional (`140°`, custo passivo zero, dreno no impacto + chip damage, `GUARD_BREAK` ao zerar stamina, `LB + A` prioriza esquiva); Parry cronometrado (`60ms` startup / `150ms` ativo / `280ms` whiff recovery); `RIPOSTE` contextual (`38` dano) e `RUNE_SKILL` (`25 Focus`).
- **`2b050f2` (`#73` — Etapa 30):** `TrainingEnemy` (`WorldScene.props[1]`) com máquina de estados completa (`idle`, `approach`, `windup`, `active`, `recovery`, `hit_react`, `stagger`, `dead`, `respawn`), 2 ataques telegrafados no chão (`ENEMY_SLASH_1` e `ENEMY_OVERHEAD`) com trava de rotação no fim do windup (`S26`), barras de HP/Poise e modo Duelo (`Tecla V` / botão `#duel` / despertar ao ser golpeado).
- **`#74` (Etapa 31 — neste commit):** HUD Soulslike real (`HP`, `Stamina`, `Focus`, avisos de combate, seletor de preset `#preset-btn`, botão `#duel`), Debug Overlay (`F3`), WebAudio procedural (`SoundFX`), Gamepad Haptics (`vibrationActuator` seguro em `try/catch`) e relatório completo em `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md`.

### Integração MovaLab (`#67`)
- Mantida 100% compatível: `225423a` e `b399b63` preservados, e os arquivos locais do usuário em `tools/movalab/workspace/` (`clips.json`, `game-bindings.json` e `exports/`) foram preservados sem sobrescrita.

## 2. Servidores e Verificação Técnica

- **Servidores locais ativos:**
  - Jogo principal: `http://localhost:5317/`
  - MovaLab: `http://127.0.0.1:5320/`
- **Testes verificados antes do push:**
  - `npm test`: `OK: 5 hashes canônicos LF`, `OK: 23 poses base e comprimentos de osso invariantes`, `OK: jogo completo (locomoção, ataques, câmera, colisão, reset, sem deslizar)`, `OK: 185 poses do ciclo completo sem violar IK`, `OK: aparência procedural, presets, JSON e 10.552 poses com IK invariante`, `OK: continuidade das 5 transições principais e 1.440 passos de secundários em 1/120s`, `OK: 311 capturas JPEG válidas e 13 pares antes/depois`.
  - `npm run test:movalab`: todos os testes de banco, vínculos do jogo, API, retarget, solver IK, transições e calibração verdes.

## 3. Próximo Passo

- Outra IA ou o próprio autor pode inspecionar `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md`, `docs/memory-ai.md` e os commits `#69`–`#74` na `master`.
- O GOAL `#68` permanece aberto (`Em Revisão` no Project `#2`) aguardando a avaliação do autor no jogo real e as novas instruções mencionadas pelo autor.
