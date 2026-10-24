# MEMÓRIA DO PROJETO — VIGÍLIA / ARUAN

> **LEIA PRIMEIRO.** Este é o handoff entre IAs e pessoas. Se você é uma IA (Codex, Antigravity, OpenCode, Claude etc.), atualize o bloco **“ÚLTIMA SESSÃO”** e acrescente uma linha no **“REGISTRO DE IAs”** antes de terminar. Nunca apague o histórico.
>
> **Arquivo canônico:** `memory-ai.md` — renomeado de `memory-ai.md.txt` em 23/10/2026 (a extensão dupla era acidente).
> **Projeto:** `D:\.GITHUB\games\game-2d-aruan`
> **Servidor local:** `http://localhost:5317`

---

## 0. ÚLTIMA SESSÃO (quem escreveu/atualizou por último)

| Campo | Valor |
|---|---|
| Data e hora | **2026-10-23 23:35 (UTC−3)** |
| Ferramenta | **OpenCode** |
| Modelo / IA | **DeepSeek V4.1 Flash Free** (`provider: opencode`, `model: deepseek-v4.1-flash-free`) |
| Autor humano | Victor Williames |
| Tipo de sessão | Auditoria + organização do repositório + sincronização com o GitHub |
| Commit base | `2b3fcf6` — branch `master` |
| Última verificação | `npm test` **OK**; smoke real no navegador **OK** |
| Estado do Git | Limpo e sincronizado com `origin/master` ao fim desta sessão |

### O que esta sessão fez
- Reconstruiu o `memory-ai.md` (o antigo `.md.txt` estava com **0 byte**) e depois o expandiu com registro de IAs e roadmap.
- Fez auditoria de Git, sintaxe, links, assets, hashes, capturas, console e gameplay no navegador real.
- Corrigiu o handler de teclado em `js/controls.js` para não quebrar quando o evento não tem `.matches`.
- Adicionou regressão disso em `tests/game.cjs` e incluiu os dois testes em `npm test`.
- Renomeou as capturas de `.png` para `.jpg` (o conteúdo real sempre foi JPEG).
- Corrigiu textos legados do cavaleiro em `index.html` e `turnaround.html`.
- Criou `README.md` (visão humana) e `AGENTS.md` (regras para IAs).
- Ajustou `package.json` com scripts separados e metadados do repositório.
- Organizou o `.gitignore` e iniciou o versionamento das referências ativas.
- Adicionou `.gitattributes` para normalizar texto e marcar imagens como binárias.
- Configurou `origin` e sincronizou com o repositório oficial do GitHub.

### Como a próxima IA deve se registrar
Copie o bloco acima, troque os dados e acrescente uma linha no registro abaixo. Diga também o que **não** conseguiu verificar. Transparência vale mais que parecer completo.

---

## 1. REGISTRO DE IAs (append-only)

| # | Data | Ferramenta | Modelo | O que fez | Evidência |
|---|---|---|---|---|---|
| 1 | 17–18/10/2026 | **Claude** (Anthropic) | não registrado | Criou o piloto original do cavaleiro (Fase 1), com IK, combo, cenário e agente crítico. | `docs/fase1-mensagens.txt`, `docs/fase1-historico.txt` |
| 2 | 23/10/2026 20:39–20:52 | **não registrado** | não registrado | Migrou do cavaleiro para o **Aruan procedural**, criou o estúdio, corrigiu rosto/pena/pegada e registrou as capturas 001–002. | commits `d49497d`, `20ebb0c`, `2b3fcf6` |
| 3 | 23/10/2026 23:09 | **OpenCode** | DeepSeek V4.1 Flash Free | Primeira auditoria; reconstruiu a memória zerada, atualizou README do timelapse e `npm test`; validou testes e páginas. | esta sessão |
| 4 | 23/10/2026 23:17–23:35 | **OpenCode** | DeepSeek V4.1 Flash Free | Segunda auditoria; guard do teclado; renomeação das capturas para `.jpg`; README/AGENTS; versionamento das referências; commits `9bd1c73`, `1c8a0ac`, `e48f87b`; sincronização com o GitHub. | esta sessão |

**Importante:** os commits têm autor humano `Victor Williames`; a ferramenta de IA da sessão 2 não foi registrada em lugar nenhum. Não atribua a Codex, Antigravity ou OpenCode sem evidência. Se a sessão 2 foi sua, corrija esta tabela.

---

## 2. RESUMO EXECUTIVO

- **O que é:** piloto de RPG de ação 2.5D em **Canvas 2D puro**, sem engine, sem WebGL, sem dependências e sem imagens em runtime.
- **Herói:** Aruan, menino arqueiro indígena, desenhado **proceduralmente** (esqueleto 3D invisível + IK + pintura em facetas).
- **Combate:** o arco é usado como **porrete** em um combo de 3 golpes. Não há tiro de flecha.
- **Cenário:** campo de treino isométrico com praça de pedras, ruínas, vegetação e dois bonecos.
- **Objetivo atual:** consolidar o personagem e o combate como base de um futuro jogo, não entregar um produto final ainda.
- **O que ainda não existe:** inimigos com IA, vida/dano, morte, ondas, áudio, menu inicial, save, controles mobile e deploy.

---

## 3. ESTADO ATUAL VERIFICADO

### 3.1 Git
- Branch: `master`.
- Remoto oficial: `origin` → <https://github.com/victorwilliames/game-2d-aruan> (privado).
- Último commit da base anterior: `2b3fcf6` — “fix: corrigir rosto pena e pegada articulada do Aruan”.
- Commits desta sessão (antes do commit de documentação):
  - `9bd1c73` — `chore: versionar capturas 003, referências e housekeeping`
  - `1c8a0ac` — `fix: robustez do teclado e textos herdados do cavaleiro`
  - `e48f87b` — `test: adicionar integração de gameplay e scripts separados`
  - commit de documentação: o mais recente no `git log` (contém este arquivo, `README.md` e `AGENTS.md`).
- Versionado nesta sessão:
  - capturas 003 e renomeação de todas as capturas para `.jpg`;
  - `referencias/hero-aruan` + `referencias/pesquisas` (~42 MB);
  - `tests/game.cjs`, `README.md`, `AGENTS.md`, `memory-ai.md`.
- Ignorados pelo `.gitignore` e presentes só localmente:
  - `referencias/rafaxlab/` (11,3 MB);
  - `docs/fase1-historico.txt`, `docs/fase1-acoes.json`, `docs/fase1-mensagens.txt`, `docs/acao-*.txt`.
- O repositório oficial estava vazio; o histórico completo foi publicado no primeiro push em 23/10/2026. Branch padrão: `master`.
- Estado no fim da sessão: `git status` limpo, `master` rastreando `origin/master`.

### 3.2 Testes (executados em 23/10/2026)
`npm test` → **OK** (Node v24.16.0 / npm 11.13.0).

- `tests/rig.cjs`
  - **5.816** amostras de poses.
  - `maxBoneError` ≈ **7,1e-14**.
  - `maxGripGap` ≈ **2,9e-14**.
  - `maxFootClamp` / `maxStanceSlip` ≈ **2,9e-14**.
  - 80 braços clampeados (limite de alcance esperado).
  - Hashes de `docs/aruan-preservacao.json` conferem.
- `tests/game.cjs`
  - Caminhada ≈ **66,6 u**; corrida ≈ **154,5 u** (corrida > 1,8× caminhada).
  - Cambalhota volta a `move` e limpa `anim.dodge`.
  - Combo por cliques: **3 acertos**, retorno ao idle, `equip` volta a 0.
  - `WorldScene.cacheBuilds === 1`.
  - Estado do rig finito.
  - Novo teste: `keydown` sem `.matches` não lança exceção.

### 3.3 Navegador (smoke real, 23/10/2026)
- `index.html` carrega sem erros no console.
- Loop rodou de verdade com a aba visível: `Game.frames` avançou.
- Tecla real `KeyD` moveu o jogador ≈ **72,8 u** no tempo medido.
- Cliques reais (`PointerEvent`) encadearam o combo: **3 golpes, 3 acertos**, fim em `move`, arco de volta às costas (simulação avançada em passos manuais de 1/120 s por causa do throttling da automação).
- `Pilot.render()` executou sem exceção; rig finito; 8 árvores; cache = 1.
- `inspecao.html` renderizou **todas as 6 animações**: idle, walk, run, dodge, golpes 0/1/2. Turnaround com 8 direções; close do rosto renderizou.
- DPR do teste: 1,25; canvas do jogo 1250×875; estúdio 859×688 e turnaround 1161×825.
- **Ressalva:** o navegador de automação estrangula `requestAnimationFrame` quando a aba está oculta. `Game.frameMs` (~5–6 ms) é tempo de trabalho auto-medido, **não** é benchmark de FPS. Medir desempenho manualmente numa janela real.

### 3.4 Auditoria estática
- `node --check` em todos os `js/*.js`, testes e servidor: **OK**.
- Todos os `src`/`href` locais de `index.html` e `inspecao.html` existem: **OK**.
- Manifesto do pack: **37/37 assets presentes**, 0 ausentes.
- Nenhum arquivo vazio fora do `.git`.
- Nenhum `TODO/FIXME/HACK` no código.
- Hashes de preservação: **5/5 OK**.

---

## 4. O QUE JÁ FUNCIONA

- Andar, correr, cambalhota e colisão com borda/props.
- Câmera isométrica elevada acompanhando o herói, com shake e câmera lenta.
- Combo de 3 porretadas com buffer de clique, antecipação, golpe, recuperação, hitstop e rastro.
- Acerto nos bonecos com flash, recuo, faísca, poeira, anel de impacto e “KRAK!”.
- IK de braços/pernas, pé plantado no mundo, empunhadura do arco pela extremidade.
- Arco guardado nas costas que vai para a mão durante o golpe; aljava com 3 flechas sempre nas costas.
- Rosto com faixa vermelha, faixas pretas nas bochechas, olhos, cabelo em painéis e pena.
- Estúdio com 8 direções, timeline, close do rosto, inspeção de ossos/juntas/pés e deslocamento.
- HUD de combo, contador de acertos, botões de debug, pausa, reset e link do estúdio.
- Mundo pintado uma vez em canvas offscreen; só personagem, rastro, vento e efeitos são redesenhados.

---

## 5. LINHA DO TEMPO

### Fase 1 — cavaleiro (17–18/10/2026)
- Pedido original: piloto isométrico Canvas 2D, sem imagens, com esqueleto 3D invisível, IK e combo de espada.
- Executado pelo **Claude**, com duas rodadas de um agente crítico.
- Correções históricas: projeção espelhada, capa voando, pés deslizando, rastro degenerado, 23 árvores em vez de 8, ordem de profundidade, tassets etc.
- Limitações aceitas: rastro vertical no finalizador de frente/para longe; cabelo carregado de costas; `file://` não testado.
- Todo o material está em `docs/`, inclusive `revisao-referencia.md` com checklist de 20 pontos.

### Fase 2 — Aruan (23/10/2026)
- `20:39` `d49497d`: versiona o piloto existente e as capturas 000.
- `20:46` `20ebb0c`: substitui o cavaleiro por Aruan procedural; cria o estúdio; captura 001.
- `20:52` `2b3fcf6`: corrige rosto/pena e pegada articulada; amplia a regressão para 5.816 poses; capturas 002.
- Depois: capturas 003 (campo e combo), `tests/game.cjs`, pacote de referências e a memória (que nasceu zerada).
- Em 23/10 23:09–23:17: auditoria, memória reconstruída, pequenos fixes e roadmap (esta sessão).

---

## 6. ARQUITETURA

| Arquivo | Papel |
|---|---|
| `index.html` | Jogo: canvas, HUD, controles. |
| `inspecao.html` | Estúdio: 8 direções, timeline, close, inspeção do rig. |
| `style.css` / `studio.css` | Estilo do jogo / estúdio. |
| `js/math.js` | Vetores, referenciais, easing, RNG, ruído, projeção, câmera. **Hash preservado.** |
| `js/paint.js` | Pinceladas, polígonos, contorno, cel-shading, textura. **Hash preservado.** |
| `js/rig.js` | Corpo, poses, ataques, `solveIK`, `solveRig`, `FootPlant`, `Animator`. |
| `js/character.js` | Corpo, roupa, membros, arco, aljava, `drawSkeleton`. |
| `js/head.js` | Cabeça, rosto, cabelo e pena. |
| `js/world.js` | Campo, praça, props, colisão, oclusão, chão em cache. **Hash preservado.** |
| `js/effects.js` | `SwordTrail`, partículas, impacto, poeira, vento. **Hash preservado.** |
| `js/controls.js` | Teclado/mouse, fila de cliques, movimento isométrico. |
| `js/main.js` | Loop fixo 1/120 s, estados, combo, colisão, câmera, HUD, render. |
| `js/inspection.js` | Loop e desenho do estúdio/turnaround. |
| `server.cjs` | HTTP local sem dependências, `Cache-Control: no-store`. **Hash preservado.** |
| `tests/rig.cjs` | Regressão de IK, arma, apoios, combo e hashes. |
| `tests/game.cjs` | Integração de teclas, corrida, cambalhota, combo e cache. |
| `docs/aruan-preservacao.json` | SHA-256 dos arquivos preservados. |
| `capturas/timelapse/` | Registro visual numerado. |

### Fluxo por quadro
1. `Controls` acumula teclas/cliques.
2. `main.update` resolve `move`/`attack`/`dodge`, movimento, colisão e lunge.
3. `Animator` escolhe a pose; `FootPlant` fixa os pés; `solveRig` resolve o IK.
4. `characterParts` monta facetas e ordena por profundidade de câmera.
5. `render` ordena mundo, props, efeitos, rastro e personagem.
6. Simulação em passo fixo de 1/120 s; render independente do refresh.

### Coordenadas
- Mundo: `x/y` no chão, `z` para cima; unidade ≈ 1 cm.
- Local dos ossos: `x` = frente, `y` = esquerda, `z` = cima.
- Projeção isométrica de 45°, inclinação de 34° (`Cam.sinP`).
- Profundidade sempre por câmera (`proj`), nunca só por Y de tela.

---

## 7. INVARIANTES — NÃO QUEBRAR

1. **Canvas 2D puro**, sem engine, WebGL ou dependências externas.
2. **Passo fixo de 1/120 s**; render separado.
3. **Comprimentos de osso invariantes** no IK (teste falha acima de 1e-6).
4. **Arco pela extremidade**: `bowGrip` coincide com a mão direita (erro < 1e-6). Não mover a pegada para o centro.
5. **Pé de apoio no mundo**, não em coordenada local; levantar antes de reposicionar; sem patinar.
6. **Cache do chão = 1**: não repintar o mundo por quadro.
7. **8 árvores reais** (`oak`/`cypress`), não 23. Não usar `count('tree')`.
8. **Um único arco**: alterna costas ↔ mão via `pose.equip`; aljava e 3 flechas ficam sempre nas costas.
9. **Rosto nunca aparece nas costas**; pena e franja preservam o lado correto.
10. **Rastro separa frente/trás** e mantém largura mínima perpendicular à trajetória.
11. **Arquivos de referência não são runtime**: nenhum PNG é carregado pelo jogo.
12. **Hashes**: alterar `world.js`, `math.js`, `paint.js`, `effects.js` ou `server.cjs` exige atualizar `docs/aruan-preservacao.json` conscientemente.
13. **Determinismo**: nada de `Math.random()` na pintura do mundo; usar RNG com semente. Efeitos podem usar `Math.random()`.

---

## 8. COMO RODAR E TESTAR

```powershell
# na pasta do projeto
npm start                 # http://localhost:5317
npm test                  # rig + integração
node tests/rig.cjs
node tests/game.cjs
```

- Porta padrão 5317; `PORT` sobrescreve.
- `server.cjs` serve só este workspace e desativa cache.
- Testes rodam em Node com DOM/canvas simulados.
- Verificação visual é manual, em `index.html` e `inspecao.html`.

### Controles
- `WASD` / setas: andar.
- `Shift`: correr.
- `Espaço`: cambalhota.
- Clique: atacar/mirar; clicar de novo durante o golpe encadeia.
- `B`: esqueleto; `T`: câmera lenta; `P`: pausa; `R`: reset.
- Link “Estúdio Aruan ↗”: página de inspeção.

### Checklist de sessão (Definition of Done)
- [ ] `npm test` passa antes e depois.
- [ ] `index.html` e `inspecao.html` abrem sem erro de console.
- [ ] Se mudou visual, gerar captura numerada e atualizar `capturas/timelapse/README.md`.
- [ ] Se mudou arquivo preservado, atualizar os hashes.
- [ ] Atualizar este `memory-ai.md` (última sessão + registro de IAs).
- [ ] Commitar com mensagem no padrão `feat:`, `fix:` ou `chore:`.

---

## 9. IDENTIDADE VISUAL DO ARUAN

Referência que prevalece: `referencias/hero-aruan/sprites-2-5d-ref/01_VISTAS/pedacos/referencia_rosto_aruan.png`.

Preservar:
- Cabeça grande, corpo pequeno (chibi), pele acobreada, pés descalços, roupa vermelha simples.
- Olhos estreitos e horizontais.
- Faixa vermelha sobre os olhos; faixas geométricas pretas nas bochechas com chevrons de pele.
- Cabelo preto/castanho muito escuro, franja em blocos, mechas laterais e uma pena azul/ocre.
- Contorno escuro, sombras em blocos, textura pintada discreta (HQ/cel-shading inspirado em Hades 1).
- Câmera elevada: topo da cabeça, ombros e pés visíveis.
- Arco: madeira clara, vermelho gasto no meio, pontas pretas, corda clara grossa com nós.
- Aljava fixa com três flechas; bandoleira cruzando o peito.

Cuidados:
- Não espelhar cegamente equipamento, pena e bandoleira.
- Não reintroduzir a capa do cavaleiro.
- Evitar close que pareça “círculos/cápsulas sobrepostas”: facetas e silhueta precisam de intenção.

---

## 10. MATERIAL DE REFERÊNCIA (fora do runtime)

- `referencias/hero-aruan/concept-art/` — 2 fichas conceituais (3,8 MB).
- `referencias/hero-aruan/sprites-2-5d-ref/` — **37 PNGs** (8 vistas, 2 idle, 4 caminhada, 4 corrida, 9 combate, 4 esquiva, 3 props, 3 efeitos) + 3 imagens auxiliares em `01_VISTAS/pedacos`. ~37,8 MB, 40 PNGs no total.
  - `manifesto_assets.json` — caminhos/dimensões; 37/37 conferem.
  - `CATALOGO.html` — galeria local.
  - `GUIA_PARA_O_CODEX.md` — regras de reconstrução.
  - `CHECKLIST_PACK.md`, `PROMPTS_DA_COMPLEMENTACAO.json`.
  - São poses-chave independentes: não formam rig, animação ou turnaround calibrado.
- `referencias/pesquisas/` — 5 imagens de pesquisa (0,33 MB).
- `referencias/rafaxlab/` — código/conversa históricos (11,3 MB), **ignorado pelo Git**; módulos truncados, não executar como jogo atual.
- `docs/revisao-referencia.md` — checklist histórico de 20 pontos; guia de QA, não aprovação do estado atual.
- `docs/fase1-*` e `docs/acao-*` — extrações históricas locais, ignoradas pelo Git.

---

## 11. COMO VAMOS CONTINUAR (direção definida)

> **Decisões do autor em 23/10/2026.** O foco é o personagem e suas animações; cenário, arena e novos sistemas ficam para depois.

### Decisões fechadas
1. **Foco atual:** Aruan, rosto, corpo, equipamento e animações. **Não** priorizar cenário/arena por enquanto.
2. **Arco:** continua como **porrete**. Tiro com flecha pode existir no futuro, mas **não agora**.
3. **Cenário:** manter o campo de treino como está até nova ordem.
4. **Referências:** `referencias/hero-aruan` e `referencias/pesquisas` entram no Git/GitHub. `referencias/rafaxlab` e os históricos `docs/fase1-*` / `docs/acao-*` continuam locais e ignorados.
5. **Sincronização:** o repositório oficial é <https://github.com/victorwilliames/game-2d-aruan> (privado). Commitar e enviar para `origin`.
6. **Memória:** o arquivo canônico é `memory-ai.md`.

### Fase A — Fechar o Aruan (agora, P0)
Objetivo: personagem e combate com qualidade “gold master” para servir de base.
- Revisar as 8 direções: rosto, nuca, franja, pena, orelhas.
- Revisar arco nas costas e na mão, aljava, bandoleira e empunhadura.
- Revisar golpes 1/2/3 nas 8 direções: rastro frente/trás, impacto do terceiro golpe, hitstop e câmera.
- Revisar pé plantado em corrida, parada, cambalhota e borda.
- Gerar capturas 004+ e atualizar o timelapse.
- Fechar com `npm test` + smoke no navegador.

### Fase B — Combate vivo (P1)
Objetivo: deixar de ser campo de treino e virar loop de jogo.
- Substituir os bonecos por inimigos simples (idle, perseguir, atacar, levar dano, morrer).
- Vida do jogador, invulnerabilidade curta, knockback, morte/respawn.
- Ondas ou arena com condição de vitória/derrota.
- Medidor de combo/score e feedback de dano.
- Arco continua porrete; tiro fica fora desta fase.

### Fase C — Vertical slice (P2)
- Mundo maior, oclusão, câmera e limites.
- Menu inicial, pausa, opções, HUD final.
- Áudio (WebAudio procedural ou assets).
- Progressão/save se o rumo for roguelite (a inspiração declarada é Hades).
- Gamepad e layout mobile.

### Fase D — Produção (P3)
- Build/deploy estático, cache, domínio.
- Performance em DPR 2, telas grandes e máquinas modestas.
- QA cross-browser, acessibilidade, localização, licença.

### Ainda em aberto
- Estrutura de longo prazo (arena de ondas, roguelite ou aventura) — decidir só depois do personagem.
- Se e quando o tiro com arco entra.
- Licença do projeto.

---

## 12. BACKLOG PRIORIZADO

### P0 — imediato
- [x] Commitar o estado atual (003, `tests/game.cjs`, `memory-ai.md`, fixes, README do timelapse).
- [x] Configurar `origin` e enviar para o repositório oficial.
- [ ] Revisão visual “gold master” do Aruan e captura 004+.
- [ ] Testar `index.html` e `inspecao.html` manualmente numa janela real, DPR 1 e 2.
- [ ] Medir desempenho real (sem automação) e registrar números.

### P1 — próximo ciclo
- [ ] Inimigos com IA simples e vida.
- [ ] Vida/dano/morte/respawn do jogador.
- [ ] Loop de arena/ondas + score.
- [ ] Áudio.
- [x] Criar README raiz para humanos.
- [ ] Teste de fumaça automatizado do estúdio (`inspection.js`).

### P2 — depois
- [ ] Tiro com arco (se aprovado).
- [ ] Menu/título/pausa/opções.
- [ ] Progressão/save.
- [ ] Gamepad/mobile.
- [ ] Deploy e QA cross-browser.
- [x] Re-encodar as capturas para PNG real ou renomear para `.jpg` (feito: renomeadas para `.jpg`).

---

## 13. RISCOS E ARMADILHAS CONHECIDAS

1. **Hashes de preservação**: editar `world.js`, `math.js`, `paint.js`, `effects.js` ou `server.cjs` sem atualizar o JSON quebra o teste.
2. **Regressão visual invisível**: os testes não enxergam arte. Sempre olhar as capturas e o navegador.
3. **Automação de navegador**: `requestAnimationFrame` é estrangulado em aba oculta; `Game.frameMs` não é FPS real.
4. **Capturas**: os arquivos eram **JPEG com extensão `.png`**; em 23/10/2026 foram renomeados para **`.jpg`**, refletindo o formato real. Se novas capturas forem geradas, salvar já com a extensão correta.
5. **Referências grandes**: ~42 MB de `hero-aruan` + `pesquisas` entram no repositório. `rafaxlab` (11,3 MB) fica local. Evitar adicionar mais binários sem necessidade.
6. **Código histórico truncado**: `referencias/rafaxlab` não é executável nem fonte de verdade.
7. **Nomes legados**: `SwordTrail` e `swordDir` vêm do cavaleiro; são internos e inofensivos. Não renomear sem necessidade (um deles está em arquivo preservado).
8. **Texto legado**: “a lâmina desperta” foi corrigido nesta sessão; procurar outras referências ao cavaleiro antes de publicar.
9. **Deriva entre IAs**: cada ferramenta tem contexto próprio. Se não atualizar este arquivo, a próxima sessão vai repetir trabalho ou desfazer decisões.
10. **Memória zerada**: já aconteceu uma vez. Se ocorrer de novo, reconstruir a partir do Git, `docs/` e capturas; não inventar estado.

---

## 14. REGRAS PARA A PRÓXIMA IA

1. Leia este arquivo inteiro, `docs/revisao-referencia.md` e `capturas/timelapse/README.md` antes de mexer no visual.
2. Rode `npm test` antes e depois de qualquer mudança.
3. Não troque arte procedural por sprites PNG nem adicione dependências sem pedido explícito.
4. Não edite arquivos preservados por hash sem atualizar `docs/aruan-preservacao.json`.
5. Preserve a proporção chibi, o rosto, a pena, o arco como porrete e a aljava nas costas.
6. Registre todo marco visual em `capturas/timelapse/` com número sequencial.
7. Atualize o bloco “ÚLTIMA SESSÃO” e o “REGISTRO DE IAs”. Diga o que verificou e o que não verificou.
8. Use mensagens de commit no padrão existente (`feat:`, `fix:`, `chore:`) e descreva a verificação.
9. Se uma decisão for do Victor, pergunte; não invente rumo de produto.
10. Deixe o projeto melhor do que encontrou — mas sem reescrever o que já funciona.

---

## 15. CHANGELOG DESTA MEMÓRIA

| Data | Autor | Mudança |
|---|---|---|
| 23/10/2026 (após 20:52) | não registrado | Arquivo criado, mas salvo com **0 byte**. |
| 23/10/2026 23:09 | OpenCode / DeepSeek V4.1 Flash Free | Primeira reconstrução: estado, linha do tempo, arquitetura, invariantes, pendências. |
| 23/10/2026 23:17 | OpenCode / DeepSeek V4.1 Flash Free | Segunda versão: registro de IAs, auditoria profunda, achados de PNG, roadmap por fases, decisões pendentes, correções e renomeação para `memory-ai.md`. |
| 23/10/2026 23:35 | OpenCode / DeepSeek V4.1 Flash Free | Terceira versão: decisões do autor, organização do repositório, referências versionadas, README/AGENTS, sincronização com o GitHub e registro dos commits. |

---

**Fim da memória.** Se você chegou até aqui e vai trabalhar no projeto: atualize este arquivo antes de sair.
