# MEMÓRIA DO PROJETO — GAME 2D - ARUAN

> Estado verificado26/10: vertical slice Xbox + Mixamo #83 agora aplica idle/walking/standard run reais de65ossos no gameplay por padrão, com comparador DEV V1, cadência por distância e apoios em mundo. Combate Sprint8 e ações explícitas MovaLab preservam caminho nativo/anterior. Revisão humana/física pendente; #83/Sprint9 não declaradas concluídas. Workspace pessoalMAIN preservado; sem downloads. Ver docs/tecnico/aruan-xbox-mixamo-slice.md e relatório xbox-locomotion-report.json.

> **LEIA PRIMEIRO.** Este é o handoff entre IAs e pessoas. Se você é uma IA (Codex, Antigravity, OpenCode, Claude etc.), atualize o bloco **“ÚLTIMA SESSÃO”** e acrescente uma linha no **“REGISTRO DE IAs”** antes de terminar. Nunca apague o histórico.
>
> **Arquivo canônico:** `docs/memory-ai.md` — movido para `docs/` em 25/10/2026 a pedido do autor.
> **Projeto:** `D:\.GITHUB\games\game-2d-aruan`
> **Servidor local:** `http://localhost:5317`

> **Foco operacional atual:** Sprint 9 / GOAL #75: fundação Mixamorig, fontes seletivas, Proxy existente, Canvas completo e catálogo MovaLab/DEV. Contrato integral em docs/sprints/aruan-sprint-9-contrato-autoral.md; preservar Sprint 8 e #68 em revisão humana.

---

## 0. ÚLTIMA SESSÃO — Sprint 9, integração Sprint8 #83

### Missão 02 — motor modular de alvos #86 — 26/10/2026, Codex desktop

Objetivo anexado lido integralmente. Agente 02 isolado na worktree gerenciada `C:/Users/willi/.codex/worktrees/targeting-core/game-2d-aruan`, branch `codex/targeting-core`, base `bae71f1`. Issue #86 criada/assumida, adicionada ao Project2 com Sprint9/Etapa39/P0/Em Andamento e filha nativa de #83; blocked_by e blocking consultados vazios. Fundação independente; integração posterior aguarda Missão01. Arquivos locais da master e agentes Xbox/runas preservados, sem merge/push na master nem reinício de servidores herdados.

`js/targeting.js`: módulo puro global/CommonJS; seleção por distância/orientação/mira/golpe/histórico/persistência, cone e LOS injetável; assistência angular limitada respeita mira explícita. Hard lock toggle, retenção, morte/remoção/alcance/oclusão contínua e troca intencional com threshold/neutro/debounce/histerese. Snapshot congelado com posição/direção/distância; contrato e parâmetros em `docs/tecnico/aruan-targeting-core.md`. Sem DOM/Gamepad/renderer/rig. NÃO conectado ao R3, HUD, órbita, animações, voadora ou runas do gameplay.

Verificado: npm test baseline/pós verde (5 hashes,10.552poses,329JPEGs); nova suíte integrada no npmtest com20cenários,1.200passos sem oscilação,1.000passos de drift sem troca,302ângulos de assistência. Chromeheadless focal index+inspecao/7animações/8direções/0erros passou fora do sandbox após crash handler bloqueado na primeira tentativa. Sem mudança visual/captura duplicada, download ou dependência nova. Referências oficiais EldenRing/Witcher3/Wicked verificadas com limites explícitos; manualDarkSouls indisponível, sem regra inferida dele. Hardware/gamefeel, integração e CI remota desta branch não certificados. Autor informou seleção GPT-6.1Terra/médio durante a sessão; variante efetiva não reinspecionada. Commit/push/status final registrados no fechamento da issue.

### Vertical slice Xbox + Mixamo — 26/10/2026, Codex desktop / GPT-6 (variante não verificada)

Fechamento: código/evidências publicados em8d856d3, integrado porfast-forward e enviado àmaster. npmtestfinal329JPEGs/5hashes/10.552poses e blobsHEAD verdes; regressãoheadlesscompleta final2páginas/3viewports touch/7animações/8direções/0erros verde. Bindings/API MovaLab passaram fora do sandbox após EPERM de rename na fixture temporária (nenhum arquivo pessoal envolvido). Ensaio Xboxfocal também repetido no servidor real5317 com workspaceMAIN:996apoios e0erros; servidor não reiniciado. Três arquivos pessoaisMAIN iguais porSHA antes/depois. Issue83 recebeu checklist/evidências emissuecomment-6420338804; statusEmAndamento preservado pelo escopo restante, dependentesdiretos=0. CI40352410146 de8d856d3 estavaEmExecução neste fechamento, não certificada verde. AceiteXboxfísico/artístico permanece pendente. Handoff desta meta curta concluído para avaliação do autor, semencerrar#75/#68/#83.

Objetivo autoral anexado lido integralmente. Base real ef6d589, checkout limpo codex/83-sprint8-integration reutilizado e atualizado por fast-forward; processos conferidos, nenhuma edição concorrente observada neste checkout. Causa principal: main sempre resolvia V1 e MovaGame descartava a hierarquia dos exports. Novo locomotion.js amostra/blenda65quaternions e resolve o rig completo no gameplay com idle/walking/standard run já existentes (nenhuma reconversão/download). Cadência por distância/cycleDelta, transição visual V1↔Mixamo120ms, comparador em/?dev=1 e F3 com fonte/nome/magnitude/velocidade/estado/blend/fallback. Deadzone movimento usa configuração14%, mira18% preservada; projeção oposta dividida por magnitude² para resposta imediata nas inversões parciais.

FootPlant separado para a camada hierárquica e IK original preservados. Teste reforçado detectou pés suspensos por usar elevação FK como sola e passos indefinidos por usar altura anatômica no limite de apoio V1; adaptador agora usa canais de contato/altura da política V1, com posições horizontais da hierarquia e pelve anatômica resolvida pelo solver. Captura070 é diagnóstico;071 é correção revisada. 996amostras de apoio real, slip1,46e−14, erro comprimento6,04e−14, headstep máximo3,28u por passo no ensaio contínuo. Velocidades20/50/100%:5,12/43,96/289,96u/s. GamepadAPI simulada A–H/X/A/B/LB/LT/RB, L3, ciclos/stop, trajetoV1=Mixamo, fallback de asset inválido e gatilhos MovaLab reais verdes. npmtest baseline/pós-arquivoscríticos verde; Chromeheadlesscompleto index+inspecao verde/0erros; ensaio final focal e CI registrados no fechamento. CI anterior não certifica este novo marco.

Limites: qualidade artística/gamefeel e Xbox físico não certificados. Entrada em combate volta diretamente ao rig nativo para preservar hitbox; suavização dessa entrada e publicação genérica de novos ciclos continuam na#83. Camada usa os três ciclos curados; slots pessoais continuam salvos, ações explícitas continuam funcionando. #68 e gates17/18/19/3/22 preservados. Nenhum servidor herdado encerrado, nenhuma janela visível, dependência nova ou arquivo preservado alterado. Arquivos pessoaisMAIN não entram no commit.

### Atendimento operacional — 26/10/2026, Codex desktop / GPT-6

Atendimento operacional26/10: autor relatou indisponibilidade de localhost:5317/?dev=1. Nenhum listener5317 ativo; iniciado node server.cjs na master em segundo plano/janela oculta, PID6116. HTTP200 confirmado no link DEV, inspecao.html e MovaLab5320 já existente. Smoke Chrome headless focal passou duas páginas/7animações/8direções/zeroerros de console ou rede. Sem mudança de runtime/visual, sem novos downloads; arquivos pessoais preexistentes preservados. npm test não repetido nesta operação de serviço; hardware/aceite artístico não verificados.

| Campo | Valor |
|---|---|
| Data | 26/10/2026 (UTC−3) |
| Ferramenta/modelo | Codex desktop / GPT-6 (variante exata não verificada) |
| Base e isolamento | master/origin 28da803; checkout .worktrees/sprint-9, codex/79-canvas-hierarchy; master da5ede8 no início da etapa; alterações locais do autor preservadas |
| Entrega em andamento | Goal persistente #75; oito issues #76–#83 com cards/campos Sprint 9/P0/Etapas 32–39, subissues e blockers nativos; aquisição seletiva concluída #77/c95b37d; #76 contrato real publicado 667ae56/a29b15e e CI40233385318 verde; #78 perfis imutáveis e rebind explícito de preview, 19 modelos + Aruan/3arquétipos/6clipes |
| Dry-run | HF 7f134bc734557b1d9516cb476d25ea1f577e45c1; 2.317 animações + 19 personagens + 10 metadados = 1.678.158.728 bytes; aquisição concluída: 2.317/2.317 movimentos, 19/19 personagens, 10/10 metadados com tamanho/hash (SHA-256 LFS ou Git blob) |
| Testes | npm test baseline verde, 5 hashes/10.552 poses/311 JPEGs; test:movalab verde fora do sandbox após loopback bloqueado; seleção/orçamento/traversal verdes; browser baseline falhou em native touch attack, antes de mudanças de runtime; smoke focal --studio-only passou ambas páginas, 7animações/8direções/3presets, zero erros de console/rede |
| Limites | Autenticação HF cache padrão HTTP 401; rota pública funcional. Revisão automática rejeitou uso de arquivo alternativo de credencial sem autorização explícita. Sem runtime/visual modificado, sem aprovação humana/física |
| Próximo passo | Publicação #77 concluída em c95b37d; #78 publicada da5ede8/CI40234664847verde; #79 primeiro marco em branch isolada, ainda não concluída. Continuar piloto real de clipes difíceis/cache e transições, sem repetir downloads. DOWNLOAD_REPORT pronto; fontes1.678.158.728bytes, transferência conhecida1.680.560.376bytes; reserva conservadora1.714.804.684bytes; alocação fontes+checkout1.926.166.136bytes na medição20:40UTC. Ler docs/sprints/SPRINT-9-RESUME.md |
| Marco mais recente | #79: CI40239156326/3030504 verde; piloto oito fontes adquirido com FK máximo0,000303cm, apoios/comprimentos~1e−14, gzip881.155bytes sem perda. Corrigidas chaves irregulares omitidas e joelhos abaixo do chão. Chrome headless32quadros pelo banco temporário, capturas058 revisadas; npmtest317JPEGs/procedural/API/smoke focal2páginas verdes. Código continua branch79; transições, comparação visual adicional e integração pendentes; servidor5320herdado não reiniciado sem resposta do autor. |
| Atualização transições | CI19d03af/40240569412 verde. Fade completo65quaternions/interrupção implementados no banco MovaLab; 1.456poses/oito direções, oito trocas reais/392poses, comprimentos/apoios/continuidade~1e−14. Corrigido reset assíncrono de relógio durante carregamento (salto~2→~5,8e−14). Captura059 revisada; npmtest318JPEGs/transiçõesV1/conversor/hierarquia/browser completo34clipes e trêsdestinos verdes. Este marco requer sua CI; V1↔hierarquia/combate posterior e servidorherdado sem reinício. |
| Estado operacional atual | #79 em fd4782b, CI40241451752 verde, card Em Revisão; integração ao master/backend herdado pendente. #80 com blockers #77/#78 fechados, card Em Andamento, branch codex/80-mixamo-catalog sobre fd4782b, checkout sem outro agente. Catálogo externo real com 2.317 movimentos/19 personagens, busca EN/PT-BR, proveniência e inferências explícitas, 80 cards iniciais, favoritos em overrides da library existente e proteção de estados. HardLanding real no Proxy; câmera considera pose skinned atual. Capturas 060 (diagnóstico)/061 (correção) revisadas. npm test (320 JPEGs), unidades/API/CLI, browser com 34 clipes/V1 e smoke focal das duas páginas verdes. Cache/fila/preparo de produção pendentes; zero novos downloads. |
| Continuidade | Sinal de retomada recebido do chat da automação existente enquanto esta rodada já executava. get_goal retornou usageLimited no registro persistente; nenhuma tentativa de recriar/forçar estado do GOAL ou contornar cota. Trabalho autorizado desta rodada segue disponível. Não prometer que o status persistente foi retomado só pelo sinal recebido. |
| Cache/fila — marco atual | #80: nove clipes preparados/validados com prévia Canvas. Oito pilotos revalidados e referenciados sem copiar gzip; Waving convertido pelo botão real em7,6s. Cache por fonte/contrato/conversor/perfil/player/opções, hashes e gzip sem perda; fila serial/até16, duplicatas concorrentes, timeout e journal/falhas/retomada. CLI list/search/inspect/prepare/validate/preview; assign fica #82/#83. Cache lê emcerca de4–12ms após preparo; UI preparada em529–717ms, sem alegar FPS. NTFS fontes+checkout1.938.120.536bytes; transferências não aumentaram. npmtest322JPEGs/cache/API/fila/CLI/browser real/V1/focal2páginas verdes,062/063revisadas. Marco276ba72/CI40254458461verde; novo marco precisa CI. Master9919f98 contém somente checkpoint documental; código na branch80. |

### Última sessão anterior (preservada)

Entrega operacional26/10:5faeb50 criado/enviado primeiro conforme pedido do autor e depois integrado à master após CI40332047157verde; hashes canônicos e blobsHEAD verdes. Smoke focal index+inspecao passou7animações/8direções/0erros/0referências/325JPEGs. Autorização recebida para reiniciar5320; não havia listener, serviço iniciado e depois relocado do checkout à master estável, semworkerativo. Serviço próprio atual:5156; registro operacional ignorado emtools/mixamo/temp/movalab-5320-owned.json. APIs reais:2317fontes/19personagens/10convertidos/10validados/10prévias/0aprovaçõesvisuais/0integrados. Três arquivos pessoais iguais porSHAantes/depoisda integração. Não usar mais a pendência histórica de autorização5320 como bloqueio. Marcador persistente doGoal aindausageLimited; rodada manualdisponível, semrecriarGoal/forçarestado oucontornarcota. Seguir83publicação/blend/runtime e depoisbackloginteiro; gateshumanos/físicosabertos.

Marco83M3: punho canônico RightHand passa a dirigir direção e torção do arco no Canvas hierárquico; renderer V1 preserva seu caminho. Captura069 conferida (fonteWalking + três canais independentes de teste), pegada pela extremidade com erro máximo2,4e−14 e trêsflechas preservadas. Testes968poses/1.456transições e npmtest pós-character verdes; cachetest passou fora do sandbox. Dez caches revalidados sob solver atualizado usando o mesmo gzip, zeroreconversões/zerodownloads; novo revalidate-cache.mjs usa reuseOnly e recusa converter artefato ausente. Solver/validador mudam a chave, mas conversor/perfil/FBXLoader/clip-player precisam coincidir para reutilizar dados. CI83M2/f359f40/40269466916verde; CI deste marco e smoke focal pós-visual ainda pendentes. Autor autorizou reiniciar somenteMovaLab5320 (resposta à pergunta anterior); reinício ainda não executado. Revisão automática havia falhado por cota, tentativa autorizada mais recente funcionou. Não recriarGoal nem repetir aquisição.

Marco83M2: ponte pura animation-timeline.js para estados/clocks nativos e marcas explícitas da fonte.2.166amostras sobre ATTACKS reais/variantes e demais estados, monotonicidade/fronteiras/loops inválidos/zero mutação verdes. Ainda não carregada pelo jogo: publicação e blend precisam consumi-la. Nenhum tempo de gameplay alterado. Correção de hipótese: clocks de esquiva já eram0,84/0,46s no código;0,42/0,30s pertencem ao relatório histórico, que ganhou nota de auditoria. Não criar bug/trabalho a partir dessa hipótese descartada. CI83M1/3f02921/40268515417verde; novo marco precisaCI. Próximo: integrar fonte visual e blend com continuidade e invariantes, mantendofallback.

Início #83: codex/83-sprint8-integration sobre88a495c + merge do checkpoint masterb863bd3. CI82/40268160115verde. Falha baseline nativeTouchattack resolvida no harness: não era defeito do ataque, fixture estava pausada; agora um passo ativo síncrono valida estado/actionInstanceId/stamina e pausa novamente. npm run test:browser completo passou index+inspecao, toque nativo3viewports, teclado/gamepad simulado,7animações/8direções, zeroerros/referências. Proteção de pausa do jogo intacta; hardware/arte não certificados. PipelineCI agora inclui smoke completo. Relatório sprint8-integration-qa.json. Integração hierárquica/timelines e latência DEV ainda pendentes; continuar83semfecharGoal/Sprint9nemgatesfísicos.

Verificação final #82: trava modal explícita emInput impede Menu/View de despausar/agir, exige neutro ao fechar; simulação de Menu, WASD nativo e CLIassign idempotente passaram. npmtest pós-controls verde (324JPEGs), gateDEV semfontes verde. NTFS fontes+checkout1.939.025.752bytes, storage-after-dev.json, semtransferênciasnovas. Correção da métrica preliminar: catálogo frio variou1,76–42,2s noChrome; últimoServerTiming489ms/headers493ms, evento de resposta tardio nopipeline do navegador. QA dessa latência permanece83; não declarar carregamento frio instantâneo nemFPS. Relatório mixamo-dev-browser.json contém execução final, sem maquiar amostras anteriores.

Atualização #82: branch codex/82-dev-catalog sobree7ae296 (#81CI40265535975verde/cardEmRevisão). Janela `/?dev=1` somente loopback, iframe Canvas real sem Three/FBX no runtime;60registros por página, busca/filtros/favoritos/preparo/falhas/pausa/tempo/velocidade/direção/loop. Pausa anterior e input restaurados ao fechar, foco volta ao Canvas para WASD. API/CLIassign grava só rascunho emlibrary.json, protege teclas/botõesSprint8 e bindings atuais; publicação fica83. Chrome headless: Punching sem alterar recursos/inimigo/posição/fila; teclado funciona depois; pausa anterior e portão semDEV verificados. ElbowPunching preparado offline pela UI no ensaio inicial (cacheagora10), captura068revisada. Sondagens de presença limitadasa8 e raiz realpath resolvidauma vez; CLIbusca1,7s nesta máquina, primeiraAPI1,76s no último ensaio. Ensaios anteriores tiveram41s noChrome; métricas ServerTiming/rede registradas, latência variável sem promessa deFPS. npmtest324JPEGs, API/bindings/perfis e regressões verdes; memória/relatório emtools/movalab/docs/dev-catalog.md e mixamo-dev-browser.json. Nenhum download novo; fontes/pessoais/servidor5320preservados. Próximo: commit/push/CI do marco82, depois83integraçãoS8 e bugbaseline nativeTouchattack.

Atualização #81: branch codex/81-humanoid-preview sobre38e359f (#80CI40259695785verde). Seletor com Aruan + três proporções e19 modelos reais; bind calibrado uma vez por modelo carregado, sem alterar FBX/geometria. Chrome headless:23destinos,90mapas requisitados/decodificados, quatro instantes, três câmeras/modos, comprimentos locais invariantes e seleção concorrente da mesmaURL. Cinco reparos de bind, quatro rigs com dedos ausentes. Prévia de nove importados é parcial: seis perdem pesos acima de quatro, cinco possuem mapa de brilho não suportado (conjuntos sobrepostos); diagnóstico visível distingue rig/material/skin e não declara aceite artístico. Captura067 revisada,23personagens presentes; ensaios064–066 descartados por falha de leitura do framebuffer, teste agora rejeita quadro vazio. Regressão34clipes/legados e perfis23destinos×6clipes verdes. npmtest verde; nenhum download novo, nenhum runtime de gameplay integrado. Próximo82/83; master9919f98 ainda sócheckpoint documental. Goal persistente registravausageLimited; rodada disponível não comprova retomada do marcador. Servidor5320herdado não reiniciado, arquivos locais do autor preservados.

### Histórico — ÚLTIMA SESSÃO (Implementação Sprint 8 Soulslike V3 — Checkpoint #68 / #69–#74)

| Campo | Valor |
|---|---|
| Data | 2026-10-25 (UTC−3) |
| Ferramenta | Antigravity |
| Modelo | Claude Opus 4.6 (Thinking) |
| Pedido | Executar a Sprint 8 (`GOAL #68`, Etapas `#69`–`#74`) — Overhaul Total de Game Feel e Combate Soulslike; em seguida, parar de forma limpa no ponto atual, sincronizar tudo no GitHub, atualizar `docs/memory-ai.md` e documentação de handoff para inspeção por outra IA e reportar o que foi feito. |
| Entregue | Configuração completa do GitHub Project #2 (`Sprint 8`, `Etapa 26`–`Etapa 31`, prioridades `P0`, sub-issues e dependências nativas `blocked by`); implementação e commits na `master` das Etapas `#69` (`7b76dfa`), `#70` (`96ea599`), `#71` (`ad5071a`), `#72` (`4644f22`), `#73` (`2b050f2`) e `#74` (HUD de HP/Stamina/Focus, seletor de preset `ARUAN_FLUIDO`/`WICKED_CLASSIC`/`LEGACY`, botão/tecla de Duelo `V`, Debug Overlay `F3`, WebAudio procedural `SoundFX`, Gamepad Haptics seguro e relatório `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md`). |
| Testes | `npm test` (5 hashes canônicos LF, 23 poses base, jogo completo + suíte Sprint 8 G01–G18/T01–T20/S21–S29, 185 poses ciclo, 10.552 poses IK/aparência, 1.440 passos secundários, 311 JPEGs/13 pares) e `npm run test:movalab` (`game-bindings.cjs`, `app.cjs`, `retarget.cjs`, `procedural-lab.cjs`, `procedural-pack.cjs`) **100% verdes**. |
| Board | `#69`, `#70`, `#71`, `#72`, `#73` e `#74` fechadas e marcadas como `Concluído` no Project #2; GOAL `#68` mantido aberto em `Em Revisão` aguardando avaliação humana do autor e novas instruções. Gates físicos `#3/#17/#18/#19/#22` preservados intactos. |
| Estado técnico | Locomoção 360° contínua, pivô `>= 135°`, Sprint, Quickstep/Roll com `Player.invulnerable` estrito nos i-frames, combo de 3 golpes distintos com arco-porrete + ataque em corrida/pós-dodge/carregado, cancelamento limpo no 1º frame pós-ativo sem *combo lock*, hitbox varrida na ponta do arco sem hitstop no whiff, Stamina/HP/Focus/Poise, Block direcional (`140°`), Parry (`60/150/280ms`), Guard Break, Riposte, `TrainingEnemy` com 2 telegraphs no chão e HUD/F3 funcionais em `http://localhost:5317/`. Arquivos locais do usuário em `tools/movalab/workspace/` preservados sem sobrescrita. |
| Próximo passo | Outra IA ou autor inspecionar `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md` e `docs/auditorias/aruan-handoff-atual.md`, testar em `http://localhost:5317/` e prosseguir com as novas instruções do autor. |

---
## 1. REGISTRO DE IAs (append-only)

| # | Data | Ferramenta | Modelo | O que fez | Evidência |
|---|---|---|---|---|---|
| Codex-S9-MASTER | 26/10/2026 | Codex desktop | GPT-6 (variante não verificada) | Publicou5faeb50/CIverde, integrou marcos79–83M3 na master e iniciouMovaLab5320autorizado com código estável, preservando3arquivospessoais porhash. Focal2páginas0erros; integração de gameplay83continua pendente. | CI40332047157; master5faeb50; APIs2317/19/10; owned.json local |
| Codex-S9-83-M3 | 26/10/2026 | Codex desktop | GPT-6 (variante não verificada) | Punho dirige arco hierárquico, pegada/torção verificadas; cache revalidado10/10 sem reconversão/download. Captura069, npmtest e testesdehierarquia/transições verdes. Integração de gameplay ainda pendente; restart5320agora autorizado. | humanoid-wrist-preview.json; mixamo-cache-revalidation.json; captura069 |
| Codex-S9-83-M2 | 26/10/2026 | Codex desktop | GPT-6 (variante não verificada) | Ponte pura para clocks S8→clipe, marcas explícitas e zero mutação;2.166amostras. Corrigiu interpretação de relatório histórico, sem alterar clocks do jogo. Publicação/blend/consumo runtime ainda pendentes. | animation-timeline.js; animation-timeline.cjs; animation-timeline.md; CI83M1verde |
| Codex-S9-83-M1 | 26/10/2026 | Codex desktop | GPT-6 (variante não verificada) | #83baseline: corrigiu fixture pausada de toque nativo sem alterar runtime; smoke completo das duas páginas verde e incluído naCI. Integração de clipes/timelines ainda pendente. | sprint8-integration-qa.json; npm run test:browser; base88a495c/CI40268160115verde |
| Codex-S9-82 | 26/10/2026 | Codex desktop | GPT-6.1 conforme sessão | #82: catálogo local in-gameDEV, preview Canvas isolado de combate e restauração da pausa/foco/input; API/CLI rascunhos com conflitosSprint8. PreparouElbowPunching com fonte existente; zerodownloads. Publicação runtime ainda83. | captura068; mixamo-dev-browser.json; testes API/assignments/browser/np mtest |
| Codex-S9-81 | 26/10/2026 | Codex desktop | GPT-6.1 conforme sessão | #81:23destinos, materiais decodificados e limites do importador explícitos; bind em memória, seleção concorrente, captura com rejeição de quadro vazio. Fontes/gameplay preservados; sem aceite artístico/físico. | mixamo-model-preview.json; captura067; humanoid-profiles/browser3d/npmtest |
| AGY-S8 | 25/10/2026 | **Antigravity** | Claude Opus 4.6 (Thinking) | Executou a Sprint 8 Soulslike V3 (`#69`–`#74`): configurou Project #2 (`Sprint 8`, `Etapa 26–31`, blockers nativos); implementou `ARUAN_GAME_FEEL`, presets `ARUAN_FLUIDO`/`WICKED_CLASSIC`/`LEGACY` e `IntentQueue` (`7b76dfa`, `#69`); motor 360°, pivô `>=135°`, sprint, quickstep/roll e i-frames estritos (`96ea599`, `#70`); combo de 3 golpes + variantes, correção de combo lock e hitbox varrida na ponta do arco sem hitstop no whiff (`ad5071a`, `#71`); Stamina/HP/Focus/Poise, Block direcional `140°`, Parry, Guard Break e Riposte (`4644f22`, `#72`); `TrainingEnemy` com 2 telegraphs e máquina de estados completa (`2b050f2`, `#73`); HUD real, Debug `F3`, WebAudio/Haptics e relatório `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md` (`#74`). `npm test` e `npm run test:movalab` verdes; 5 hashes LF intactos; workspace local do MovaLab preservado. | commits `7b76dfa`..`HEAD`, issues `#68`–`#74`, `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md` |
| GOAL-S8 | 25/10/2026 | **ChatGPT** | GPT-6 | Reorganizou prioridades para overhaul soulslike V3: GOAL #68, etapas #69–#74, contratos de movimento/combate, docs, checklist e instruções Codex. Sem implementar gameplay nem testar runtime; Project #2 precisa conferir cards/campos. | issues #68–#74; docs/sprints/aruan-sprint-8-gameplay-feel.md |
| 1 | 17–18/10/2026 | **Claude** (Anthropic) | não registrado | Criou o piloto original do cavaleiro (pré-Aruan), com IK, combo, cenário e agente crítico. | extratos históricos locais em `docs/` |
| 2 | 23/10/2026 20:39–20:52 | **não registrado** | não registrado | Migrou do cavaleiro para o **Aruan procedural**, criou o estúdio, corrigiu rosto/pena/pegada e registrou as capturas 001–002. | commits `d49497d`, `20ebb0c`, `2b3fcf6` |
| 3 | 23/10/2026 23:09 | **OpenCode** | DeepSeek V4.1 Flash Free | Primeira auditoria; reconstruiu a memória zerada, atualizou README do timelapse e `npm test`; validou testes e páginas. | esta sessão |
| 4 | 23/10/2026 23:17–23:35 | **OpenCode** | DeepSeek V4.1 Flash Free | Segunda auditoria; guard do teclado; renomeação das capturas para `.jpg`; README/AGENTS; versionamento das referências; commits `9bd1c73`, `1c8a0ac`, `e48f87b`; sincronização com o GitHub. | esta sessão |
| 5 | 24/10/2026 00:00–00:10 | **OpenCode** | DeepSeek V4.1 Flash Free | Criou o Project #2 (hoje **Game 2D - Aruan**); configurou as Etapas 0–2, issues #1–#9, labels, campos, views, sub-issues e README do board. | <https://github.com/users/victorwilliames/projects/2> |
| 6 | 24/10/2026 00:26 | **OpenCode** | DeepSeek V4.1 Flash Free | Renomeou o board para **Game 2D - Aruan**; adotou **Sprint 1** + Etapas 0–11; criou #10–#20; redistribuiu #4–#9; adicionou travas nativas `blocked by`/`blocking`, status `Bloqueado`, labels e views; criou `docs/aruan-11-etapas.md`; atualizou nomes e hash do servidor; registrou a preferência por headless/mínimo de janelas. | issues #1–#20, Project #2, commit `f1d7da1` |

| 7 | 24/10/2026 | **Codex** | Modelo exato não verificado; troca para Luna informada pelo autor | Verificou permissões de repositório e Project #2, push dry-run e fetch sem novidades; npm test OK. Sem mudança visual ou mutação de cards/issues. | API: admin/push e viewerCanUpdate; base `4cad2d5` |

| Codex-4 | 24/10/2026 | **Codex** | GPT-6 | #4: Auditoria das 8 direções e ajuste de olhos/sobrancelhas/cabelo; capturas 005 antes/depois e primeiro par da progressão. | docs/status-codex.md; capturas/timelapse/ |

| Codex-8 | 24/10/2026 | **Codex** | GPT-6 | #8: Smoke CDP nativo versionado, capturas 006 de campo/estúdio/8 direções e 7 tiras de 6 frames; JPEG real e MIME image/jpeg verificados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-10 | 24/10/2026 | **Codex** | GPT-6 | #10: Baseline consolidada com velocidades, janelas de ataques, evidências 005/006, problemas priorizados e critérios mensuráveis por etapa; #4/#8 concluídas. | docs/status-codex.md; capturas/timelapse/ |

| Codex-11 | 24/10/2026 | **Codex** | GPT-6 | #11: Input com limpeza de foco/aba/ponteiro/pausa/reset, proteção de campos editáveis, fila limitada e diagnóstico; regressão de 8 direções e DOM real do Chrome verde. | docs/status-codex.md; capturas/timelapse/ |

| Codex-7 | 24/10/2026 | **Codex** | GPT-6 | #7: Corrigidos impulso residual no pouso e apoio fora do alcance na reversão; regressão real em 8 direções/bordas: slip ~2e-14, clamp ~1e-14; capturas 007. | docs/status-codex.md; capturas/timelapse/ |

| Codex-12 | 24/10/2026 | **Codex** | GPT-6 | #12: Etapa 3 concluída com #7; aceleração/frenagem distintas, reversão no próximo passo, parada exata; 150ms até 1,31u/s; capturas 008, IK/apoios verdes. | docs/status-codex.md; capturas/timelapse/ |

| Codex-13 | 24/10/2026 | **Codex** | GPT-6 | #13: Câmera com deadzone3px, antecipação de movimento e influência adaptada a telas estreitas; reset estabilizado; matriz 8 bordas×2 viewports×DPR1/2 Node/Chrome verde; capturas009. | docs/status-codex.md; capturas/timelapse/ |

| Codex-6 | 24/10/2026 | **Codex** | GPT-6 | #6: Matriz 3 golpes×8 direções e grades010; corrigido acerto traseiro do finalizador; rastro descendente frontal anotado para Etapa6, sem alegar polimento final. | docs/status-codex.md; capturas/timelapse/ |

| Codex-14 | 24/10/2026 | **Codex** | GPT-6 | #14: Etapa5 concluída com #6; buffer de duas intenções adicionais com direção/expiração, três cliques rápidos=três golpes; dodge cancel após ativo; regressões Node/DOM verdes, capturas011. | docs/status-codex.md; capturas/timelapse/ |

| Codex-15 | 24/10/2026 | **Codex** | GPT-6 | #15: Etapa6: rastro descendente legível sem faixa opaca; efeitos limitados/reset completo e shake respeita movimento reduzido. SHA effects atualizado; custo p95 4,1/4,3ms com pacing (não FPS); capturas012 e progressão002. | docs/status-codex.md; capturas/timelapse/ |

| Codex-5 | 24/10/2026 | **Codex** | GPT-6 | #5: Equipamento apoiado e inclinado fora da cabeça; poses/rota de equipar corrigidas. Clearance do arco e3flechas em5.816amostras; capturas013 e progressão003. #21 criada para hashes em checkout limpo na Etapa10. | docs/status-codex.md; capturas/timelapse/ |

| Codex-16 | 24/10/2026 | **Codex** | GPT-6 | #16: Etapa7 concluída com #5: transições sem giro reverso, entrada/saída de dodge contínuas, giros na antecipação e movimentos secundários/expressão. 9.880poses, apoio em24ataques~1,7e-14; capturas014 e progressão004. | docs/status-codex.md; capturas/timelapse/ |

| Codex-17 | 24/10/2026 | **Codex** | GPT-6 | #17: Etapa8: joystick flutuante analógico, mira por arrasto, combo/dodge multitouch e HUD com safe areas. DOM e multitouch nativo em3viewports verdes;9.880poses; capturas015/progressão005. Sem aparelho físico; reset pausado corrigido. | docs/status-codex.md; capturas/timelapse/ |

| Codex-18 | 24/10/2026 | **Codex** | GPT-6 | #18: Etapa9: Gamepad API standard com sticks analógicos, A/B/Menu/View por borda, foco/neutralização/hot-plug e alternância entre3inputs. Testes Node/Chrome simulados verdes; capturas016. Nenhum Xbox físico validado. | docs/status-codex.md; capturas/timelapse/ |

| Codex-21 | 24/10/2026 | **Codex** | GPT-6 | #21: Corrigida regressão em clone novo: manifesto agora descreve os5blobs LF; nenhuma mudança semântica. npm test/9.880poses, modo--git e smoke completo verdes em cópia isolada limpa (eea306b). Conjunto preservado protegido contra remoção. | docs/status-codex.md; capturas/timelapse/ |

| Codex-9 | 24/10/2026 | **Codex** | GPT-6 | #9: Regressão final e clone limpo23fbfe2 verdes:9.880poses,3inputs,teclado/toque nativos,7loops,8direções,cadências30/60/144Hz,acessibilidade e0erros/referências.113JPEGs técnicos e5pares curados; harness isolado/limpo e sem sobrescrita. | docs/status-codex.md; capturas/timelapse/ |

| Codex-19 | 24/10/2026 | **Codex** | GPT-6 | #19: Etapa10: blockers1–9 e filhas#9/#21 fechados ao vivo. npm test9.880poses/5hashes/113JPEGs verde, evidências em clone limpo e capturas017 revisadas. Portão técnico cumprido sem bugP0/P1 conhecido; hardware físico/FPS de display não certificados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-20 | 24/10/2026 | **Codex** | GPT-6 | #20: Personalização procedural: roupa/cabelo/faixa e quatro cores; presets Original/Mata/Terra, random/reset, JSON atômico e persistência opcional. Commit 030a910; npm test10.552poses/5hashes/142JPEGs; Chrome headless3×7×8renders, arquivos JSON e toque3telas sem erros. Capturas018 e par006 revisados; preview visível em landscape. | docs/status-codex.md; capturas/timelapse/ |

| Codex-3 | 24/10/2026 | **Codex** | GPT-6 | #3: Sprint1: Etapas0–11 e todas as filhas fechadas ao vivo. Etapa0 mantida; implementação até030a910/checkpointacad83c em origin/master. Testes10.552poses,5hashesLF,142JPEGs/6pares; Chrome headless sem erros, inputs e personalização. Portão e limites documentados; sem validação física/FPS de display. | docs/status-codex.md; capturas/timelapse/ |

| Codex-22 | 24/10/2026 | **Codex** | GPT-6 | #22: Sprint2 criada no Project2:guarda-chuva#22, Etapas12#23/13#25/14#27 e filhas#24/#26/#28, parents e blockers nativos em cadeia. Opções Sprint2/Etapas12–14 preservam as anteriores; labels reutilizadas e nenhuma view nova. Plano em docs/aruan-sprint-2.md; Sprint1 fechada em0f37f50. Sem mudança de runtime neste checkpoint. | docs/status-codex.md; capturas/timelapse/ |

| Codex-24 | 24/10/2026 | **Codex** | GPT-6 | #24: Pele com contorno castanho leve e extremidades arredondadas; marcas de dedos aderem à superfície/profundidade e pano usa vincos curvos. a7ea846; npm test antes/depois10.552poses,5hashesLF,150JPEGs/7pares. Chrome headless completo e3×7×8renders verdes. Capturas019 revisadas e par007 inicia progressãoSprint2. | docs/status-codex.md; capturas/timelapse/ |

| Codex-23 | 24/10/2026 | **Codex** | GPT-6 | #23: Etapa12 consolidada após filha#24 fechada; a7ea846/345432b em master, npm test10.552poses e Chrome headless completo verdes. Refinamento das extremidades/tecido,150JPEGs técnicos/7pares. Mesmo rig/grip/apoios e nenhum arquivo preservado alterado. Dependentes#25/#26 serão desbloqueados ao fechar este portão. | docs/status-codex.md; capturas/timelapse/ |

| Codex-26 | 24/10/2026 | **Codex** | GPT-6 | #26: a11db2c: detalhes de dedos surgem suavemente no giro; salto de opacidade por grau4→0,5404 mantendo leitura0–14. Auditoria1/120s:secondary passo máximo0,0491/effort0,0440, assentamento verde; tempos preservados. npm test10.552poses/5hashesLF/151JPEGs/7pares e Chrome headless completo sem erros. Tira020 controlada revisada, sem par curado extra para microajuste. | docs/status-codex.md; capturas/timelapse/ |

| Codex-25 | 24/10/2026 | **Codex** | GPT-6 | #25: Etapa13 consolidada após filha#26 fechada; a11db2c/9d11139 em master. Opacidade dos detalhes sem salto abrupto, secundários/expressão auditados em1/120s sem alterar tempos. npm test e Chrome headless completo verdes;151JPEGs/7pares, tira020 técnica. Dependentes#27/#28 reavaliados ao fechar. | docs/status-codex.md; capturas/timelapse/ |

| Codex-28 | 24/10/2026 | **Codex** | GPT-6 | #28: commit37dc7e6 local, estúdio pausado12→0pinturas,15controles e resize/DPR; npm test/5blobsLF/Chrome headless completo em cópia limpa verdes.151JPEGs/7pares. Publicação e board pendentes por limite de uso na revisão automática; sem hardware físico. | docs/status-codex.md; docs/aruan-estudio-economico.md |

| Codex-17 | 24/10/2026 | **Codex** | GPT-6 | #17: Auditoria de completude corrigiu o fechamento prematuro por hardware ausente:17/18 abertas Em Revisão;19 aberto Bloqueado;3 aberto Em Revisão;22 Bloqueado pela3. Software permanece verde e personalização20 entregue.37dc7e6/0ea6832 publicados; cópia limpa37dc passou npm test,5hashesLF+blobs e Chrome headless completo.28 concluída:12→0redraws estáveis,15controles/resize/DPR. Falha temporária de revisão por uso foi superada sem contornar a revisão. | docs/status-codex.md; capturas/timelapse/ |

| Codex-27 | 24/10/2026 | **Codex** | GPT-6 | #27: Etapa14 consolidada após filha28 fechada.37dc7e6 verificado em cópia limpa: npm test10.552poses/continuidade/aparência/151JPEGs/7pares,5hashesLF+blobs e Chrome headless completo verdes.12→0redraws pausados;15controles/resize/DPR preservados. SoftwareSprint2Etapas12–14 entregue;22 permanece Bloqueada pelo aceite físico daSprint1#3, sem remover relações.17/18 Em Revisão física,19 Bloqueada. | docs/status-codex.md; capturas/timelapse/ |

| Codex-29 | 24/10/2026 | **Codex** | GPT-6 | #29: Sprint3#29 criada:Etapas15#30/16#32/17#34 e filhas31/33/35 com parents/dependências nativos. CamposSprint3/Etapas15–17 adicionados preservando IDs anteriores; labels existentes e nenhuma view nova. Depende do marco técnico27 fechado, sem remover os gates físicos3/17/18/19/22 pendentes. Plano em docs/aruan-sprint-3.md; sem alteração de runtime neste checkpoint. | docs/status-codex.md; capturas/timelapse/ |

| Codex-31 | 24/10/2026 | **Codex** | GPT-6 | #31: 6841de8: junções de pele com recorte nativo Canvas, preenchimentos/profundidades dos ossos separados e sombra menos rígida. npm test10.552poses/5hashesLF/continuidade e Chrome headless completo verdes. Pixels:tinta interna0/externa255,dobra vazia0,junção255;3presets×7animações×8direções.180JPEGs/8pares;021 e par008 revisados. Benchmark240amostras:mediana3,4–3,6ms/p954,6–4,8ms, picos até22ms registrados; sem alegar FPS/hardware. | docs/status-codex.md; capturas/timelapse/ |

| Codex-30 | 24/10/2026 | **Codex** | GPT-6 | #30: Etapa15 consolidada após filha31 fechada;6841de8/9e96db3 publicados. Pele com contornos internos recortados nativamente, preenchimentos separados e dobra vazia comprovada por pixels. npm test10.552poses/5hashesLF/continuidade e Chrome headless completo verdes.180JPEGs/8pares,021 e par008 revisados. Custo típico próximo e picos registrados; sem alegar FPS/hardware. Gates físicos3/17/18/19/22 preservados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-33 | 24/10/2026 | **Codex** | GPT-6 | #33: a787ce5: campo pausado12→0repinturas estáveis (58,2→0ms no painter, não CPU total).13ações de atualização, Menu standard simulado peloRAF real e simulação parada/retomada passaram. Retícula200×150CSS preservada emDPR1/2; movimento reduzido limpa shake congelado e contextrestored invalida o campo. npm test10.552poses/5hashesLF/continuidade e Chrome headless completo+focal verdes.181JPEGs/8pares, captura022 revisada; sem par novo para otimização. Hardware não certificado. | docs/status-codex.md; capturas/timelapse/ |

| Codex-32 | 24/10/2026 | **Codex** | GPT-6 | #32: Etapa16 consolidada após filha33 fechada;a787ce5/6c71d4c publicados. Campo pausado0pinturas, RAF/Menuativos, simulação1/120s preservada;13ações, retículaCSS/DPR, movimento reduzido e contexto passaram. npm test10.552poses/5hashesLF/continuidade e Chrome headless completo+focal verdes;181JPEGs/8pares,022 revisada. Nova36 naEtapa17 cobrirá recuperação/hash dos buffers;35 depende36 e34 depende35/36. Gates físicos preservados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-36 | 24/10/2026 | **Codex** | GPT-6 | #36: 98ddb92: buffers pausados restaurados e bitmap inteiro limpo em DPR fracionario. npm test passou com 10.552 poses e 5 hashes; Chrome headless completo verde, 3 presets, 7 animacoes, 8 direcoes, sem erros. Hashes retido/forcado/restaurado iguais em DPR 1/1.25/2; zero repinturas estaveis. Sem GPU fisica; 181 JPEGs e 8 pares preservados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-35 | 24/10/2026 | **Codex** | GPT-6 | #35: Certificacao da copia limpa ffa1c33 concluida: npm test10.552poses,5hashesLF/blobsHEAD e Chrome headless completo verdes. 3presets/7animacoes/8direcoes, inputs, buffersDPR1/1.25/2 e economia passaram; console/rede0erros,0referenciasruntime. 181JPEGs/8pares. Relatorio aruan-certificacao-sprint-3.md; limites fisicos preservados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-34 | 24/10/2026 | **Codex** | GPT-6 | #34: Etapa17 consolidada com filhas35/36 fechadas. ffa1c33 certificada em copia limpa e relatorio933ae69 publicado; npm test,5hashesLF/blobs e Chrome headless completo verdes. Buffers/campo/estudio/inputs/presets preservados;181JPEGs/8pares. Nenhum aceite fisico alegado. | docs/status-codex.md; capturas/timelapse/ |

| Codex-29 | 24/10/2026 | **Codex** | GPT-6 | #29: Sprint3 tecnica concluida: Etapas15/16/17 e filhas31/33/35/36 fechadas; pele continua, pausa economica e recuperacao DPR verificadas. Certificacao limpa ffa1c33 com npm test10.552poses/5hashesLF/blobs e Chrome headless completo sem erros.181JPEGs/8pares. Gates fisicos Sprint1/2 permanecem pendentes. | docs/status-codex.md; capturas/timelapse/ |

| Codex-37 | 24/10/2026 | **Codex** | GPT-6 | #37: Sprint4 criada no Project2:37,Etapas38/40 e tarefas39/41; Sprint4 e Etapas18/19 adicionadas preservando opcoes. Blocker tecnico29 fechado; gates fisicos mantidos. Foco em mechas do cabelo e regressao, sem mecanicas/dependencias. Referencia aprovada estudada; baseline021 preservada. | docs/status-codex.md; capturas/timelapse/ |

| Codex-39 | 24/10/2026 | **Codex** | GPT-6 | #39: cdaa265: cabelo com menos sulcos entre14paineis, franja/laterais/pena preservadas. npm test antes/depois10.552poses/5hashesLF e Chrome headless completo3presets/7animacoes/8direcoes verdes,0erros/referenciasruntime. 30JPEGs023 revisados;211tecnicos/9pares, par009curado1600x900. Sem clipping novo; pequeno artefato do topo no finalizador ja existia na021, documentado para estudo posterior. Gates fisicos mantidos. | docs/status-codex.md; capturas/timelapse/ |

| Codex-38 | 24/10/2026 | **Codex** | GPT-6 | #38: Etapa18 consolidada apos39 fechada. cdaa265/caa1f24 publicados: cabelo menos rigido, franja preservada,211JPEGs/9pares. npm test antes/depois e Chrome headless completo verdes; revisao visual em campo,8direcoes,Mata,finalizador e esquiva. Gates fisicos pendentes preservados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-41 | 24/10/2026 | **Codex** | GPT-6 | #41: 9c633c8 certificado em copia limpa: npm test10.552poses/5hashesLF/blobsHEAD e Chrome headless completo verdes;3presets/7animacoes/8direcoes, inputs, JSON, buffersDPR1/1.25/2 e pausa passaram;0erros/referenciasruntime.211JPEGs/9pares. Revisao visual023 aprovada; faceta antiga do finalizador documentada para diagnostico, sem clipping novo. Gates fisicos mantidos. | docs/status-codex.md; capturas/timelapse/ |

| Codex-40 | 24/10/2026 | **Codex** | GPT-6 | #40: Etapa19 consolidada apos41 fechada; relatorio884c7e5. Copia limpa9c633c8 npm test10.552poses/5hashesLF/blobs e Chrome headless completo sem erros;3presets/7animacoes/8direcoes,211JPEGs/9pares. Etapas18/19 entregues tecnicamente; gates fisicos pendentes preservados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-37 | 24/10/2026 | **Codex** | GPT-6 | #37: Sprint4 tecnica concluida:38/40 e filhas39/41 fechadas. cdaa265 cabelo continuo/franja preservada; par009 e211JPEGs/9pares. Certificacao limpa9c633c8 em884c7e5: npm test10.552poses/5hashesLF/blobs e Chrome headless completo sem erros. Gates fisicos Sprint1/2 mantidos. Proxima frente segura: faceta antiga no topo durante finalizador, diagnostico antes de editar. | docs/status-codex.md; capturas/timelapse/ |

| Codex-42 | 24/10/2026 | **Codex** | GPT-6 | #42: Sprint5 criada no Project2:42,Etapas43/45 e tarefas44/46; Sprint5/Etapas20/21 adicionadas com IDs anteriores preservados.37 fechado; gates fisicos mantidos. Diagnostico da faceta antiga do topo em finalizador precedera qualquer correcao. Sem produto novo; ensaio headless isolando cabeca/equipamento/rastro preparado. | docs/status-codex.md; capturas/timelapse/ |

| Codex-44 | 24/10/2026 | **Codex** | GPT-6 | #44: bf43bdf: diagnostico isolou brilho estreito do rastro, nao cabelo. Exclusao da cabeca agora cobre ambos os ramos e acompanha referencial;944pixels alterados na baseline frontal passaram a0,216casos verdes, efeitos externos/contexto preservados. effects.js SHA atualizado conscientemente;5hashesLF/blobs conferidos. npm test10.552poses e Chrome headless completo3presets/7animacoes/8direcoes sem erros.30JPEGs024 revisados;241tecnicos/10pares, par0101600x900. Gates fisicos mantidos. | docs/status-codex.md; capturas/timelapse/ |

| Codex-43 | 24/10/2026 | **Codex** | GPT-6 | #43: Etapa20 consolidada apos44 fechada. bf43bdf/c536e16 publicados; causa real era brilho estreito antes do clip.944pixels→0 na baseline frontal,216casos verdes; npm test10.552poses/5hashesLF/blobs e Chrome headless completo sem erros.241JPEGs/10pares, par010 e024 revisados. Gates fisicos mantidos. | docs/status-codex.md; capturas/timelapse/ |

| Codex-46 | 24/10/2026 | **Codex** | GPT-6 | #46: Copia limpa00dfb35 certificada: npm test10.552poses/5hashesLF/blobs e Chrome headless completo verdes.216casos de pixels da cabeca,3presets/7animacoes/8direcoes, inputs/JSON/buffersDPR1/1.25/2 e pausas passaram;0erros/referenciasruntime.241JPEGs/10pares; relatorio aruan-certificacao-sprint-5.md. Gates fisicos mantidos. | docs/status-codex.md; capturas/timelapse/ |

| Codex-45 | 24/10/2026 | **Codex** | GPT-6 | #45: Etapa21 consolidada apos46 fechada. Relatoriof948171 confirma copia limpa00dfb35: npm test10.552poses/5hashesLF/blobs e Chrome headless completo verdes,216casos de oclusao,3presets/7animacoes/8direcoes,241JPEGs/10pares. Gates fisicos permanecem pendentes e preservados. | docs/status-codex.md; capturas/timelapse/ |

| Codex-42 | 24/10/2026 | **Codex** | GPT-6 | #42: Sprint5 tecnica concluida:43/45 e filhas44/46 fechadas. bf43bdf corrigiu brilho estreito sobre cabeca;944→0pixels,216casos e efeitos externos preservados. Certificacao limpa00dfb35/f948171 com npm test10.552poses/5hashesLF/blobs e Chrome headless completo sem erros.241JPEGs/10pares, par010. Gates fisicos mantidos. | docs/status-codex.md; capturas/timelapse/ |

| Codex-47 | 24/10/2026 | **Codex** | GPT-6 | #47: Sprint6 criada:47,Etapas48/50,tarefas49/51, campos Sprint6/Etapas22/23 e relacoes nativas com IDs anteriores preservados. Blocker42 fechado; gates fisicos mantidos. Piscada idle120ms/4.8s com continuidade e leitura de identidade, sem produto novo. npm test baseline10.552poses/5hashesLF verde. | docs/status-codex.md; capturas/timelapse/ |

| Codex-49 | 24/10/2026 | **Codex** | GPT-6 | #49: 83c78c6: piscada idle120ms/4.8s integrada a pose; respiracao2.4s preservada e loopestudio4.8s limpo.144renders Canvas: esclera fechada0, costas identicas;5transicoes reais suaves e olhos abertos no ativo. npm test antes/depois10.552poses/5hashesLF e Chrome headless completo3presets/7animacoes/8direcoes,216casos rastro,0erros/referenciasruntime.31JPEGs025/272tecnicos/11pares; par011contra00dfb35 e tiras revisados. Gates fisicos mantidos. | docs/status-codex.md; capturas/timelapse/ |

| Codex-48 | 24/10/2026 | **Codex** | GPT-6 | #48: Etapa22 consolidada apos49 fechada.83c78c6/d143e5e publicados: piscada120ms/4.8s, respiracao2.4s e looplimpo. npm test antes/depois10.552poses/5hashesLF e Chrome headless completo sem erros;144rendersolhos,5transicoes,216casosrastro,3presets/7animacoes/8direcoes.272JPEGs/11pares, par011 e025 revisados; gates fisicos mantidos. | docs/status-codex.md; capturas/timelapse/ |

| Codex-51 | 24/10/2026 | **Codex** | GPT-6 | #51: Cópia limpa 3bcb6c5 certificada: npm test com 10.552 poses, cinco hashes LF/blobs e Chrome headless completo verdes. 144 renders de pálpebras, cinco transições reais e 216 casos de rastro passaram; três presets, sete animações e oito direções sem erros. 272 JPEGs técnicos e 11 pares curados. Relatório aruan-certificacao-sprint-6.md. Hardware físico continua pendente. | docs/status-codex.md; capturas/timelapse/ |

| Codex-50 | 24/10/2026 | **Codex** | GPT-6 | #50: Etapa 23 consolidada após #51 fechada. Relatório 4a74724 confirma cópia limpa 3bcb6c5: npm test com 10.552 poses/cinco hashes LF/blobs e Chrome headless completo verdes. 144 renders de olhos, cinco transições reais e 216 casos de rastro; três presets/sete animações/oito direções sem erros. 272 JPEGs/11 pares; hardware físico pendente. | docs/status-codex.md; capturas/timelapse/ |

| Codex-47 | 24/10/2026 | **Codex** | GPT-6 | #47: Sprint 6 técnica concluída: etapas #48/#50 e filhas #49/#51 fechadas. Piscada procedural em 83c78c6, par011 e tira de seis frames preservados. Cópia limpa 3bcb6c5/4a74724: npm test com 10.552 poses/cinco hashes LF/blobs e Chrome headless completo verdes; 144 renders de olhos, cinco transições e 216 casos de rastro. 272 JPEGs técnicos/11 pares. Hardware físico continua pendente. | docs/status-codex.md; capturas/timelapse/ |

| Codex-52 | 24/10/2026 | **Codex** | GPT-6 | #52: Sprint 7 criada no Project2: #52, etapas #53/#55 e tarefas #54/#56, campos Sprint7/Etapas24/25 e relações nativas preservados. Blocker #47 fechado; hardware físico pendente. Comparação de tinta da cabeça com corpo/referência, sem geometria, identidade ou mecânica nova. npm test baseline verde com 10.552 poses/cinco hashes LF. | docs/status-codex.md; capturas/timelapse/ |

| Codex-54 | 24/10/2026 | **Codex** | GPT-6.1 Sol / medium | #54: 7d5e41a: contornos da cabeça harmonizados; npm test antes/depois e Chrome headless completo verdes, 10.552 poses/cinco hashes LF, 144 renders de olhos e 216 casos de rastro. Autor apontou pouco avanço visual: confirmado no campo parado. Ajuste classificado como pequeno; apenas uma captura026 retida, 30 duplicatas de QA não versionadas descartadas; 273 técnicos/11 pares, sem par012. Auditoria global solicitada: index local correto carrega JS novos sem erro; impacto visual ficou abaixo do esperado. Modelo atual verificado: GPT-6.1 Sol/medium. | docs/status-codex.md; capturas/timelapse/ |

| Codex-57 | 24/10/2026 | **Codex** | GPT-6.1 Sol / medium | #57: Auditoria solicitada pelo autor: ele abriu o index correto; ensaio direto porfile eHTTP confirmou scripts atuais e zero erros. Comparacao controlada4cad2d5/51eea91 mostra ganhos reais em pele/cabelo/equipamento/rastro, mas pouco salto na tela parada. Execucao superpriorizou microajustes e validacao; numero de sprints nao mede arte. Relatorio aruan-auditoria-meta.md e duas comparacoes reais publicados. 273JPEGs/11pares; grande salto visual e aceite fisico ainda pendentes. | docs/status-codex.md; capturas/timelapse/ |

| Codex-58 | 24/10/2026 | **Codex** | GPT-6.1 Sol / medium | #58: Autor corrigiu prioridade: personagem apenas; P0 locomoção natural, P1 repertório/fidelidade visual. GitHub #52/#53/#55/#56 reescritos e #58/#59 criados com campos e dependências; sem novas sprints. Encontrada coordenação ipsilateral braço/perna e mãos planas. Pack principal23poses/3golpes, sem FBX local; Mixamo pesquisado em fontes Adobe, sem importação realizada. npm test baseline verde. Deleções preexistentes de pesquisas do usuário não serão alteradas ou commitadas. | docs/status-codex.md; capturas/timelapse/ |

| Codex-58 | 24/10/2026 | **Codex** | GPT-6.1 Sol / medium | #58: Primeiro marco de locomoção em34a0f2f: braços opostos às pernas, mãos em arco, peso/quadril/tórax, pés com contato contínuo e corrida absorvendo carga. npm test antes/depois e Chrome headless completo verdes;240poses novas,10.552posesIK,apoios sem clamp. Vídeo027 do jogo real antes/depois decodificado1600x900/6s; par012,275JPEGs/12pares. GitHub repriorizado P0#58/P1#59/#56, sem cenário e sem novas microsprints. Qualidade visual ainda em revisão; não equivalente aMixamo. Nenhum clipeMixamo importado. Remoções de pesquisas do usuário preservadas fora dos commits. | docs/status-codex.md; capturas/timelapse/ |

| OpenCode-56 | 24/10/2026 | **OpenCode** | DeepSeek V4.1 Flash Free | #56: continuação do Codex; orelhas reduzidas e encostadas na cabeça, nariz em volume único sem sobreposição e boca visível com cantos levemente erguidos. Captura030 contra8bfd676 em frente/3/4/perfil. npm test antes/depois10.552poses/5hashesLF/279JPEGs e Chrome headless completo3presets/7animações/8direções,0erros/0referências. #56 aberta para corpo/mãos/pés/tecido; gates físicos preservados. Remoções de pesquisas do usuário não commitadas. | 8665bb0; captura030; docs/status-codex.md |

| OpenCode-56b | 25/10/2026 | **OpenCode** | DeepSeek V4.1 Flash Free | #56: corpo/tecido; volumes de pernas, braços e tronco, pontas de dedos nos pés, vincos de joelho, umbigo/mamilos discretos e tecido maior com cauda curta. Captura031 contra8665bb0 em frente/3/4/perfil/costas. npm test10.552poses/5hashesLF/280JPEGs/13pares e Chrome headless completo3presets/7animações/8direções,0erros/0referências. #56 aberta para mãos/silhueta; gates físicos preservados. Remoções de pesquisas do usuário não commitadas. | 2812421; captura031; docs/status-codex.md |

| OpenCode-56c | 25/10/2026 | **OpenCode** | DeepSeek V4.1 Flash Free | #56: mãos; punho quadrado, topo recortado contra o antebraço, polegar arredondado/espelhado no lado interno e três sulcos de dedos. Captura034 é recorte ampliado do braço contra c33c108. npm test10.552poses/5hashesLF/281JPEGs/13pares e Chrome headless completo3presets/7animações/8direções,0erros/0referências. `fleshPair` devolve hulls; rig/IK/locomoção preservados. #56 aberta para silhueta/aceite; gates físicos preservados. Remoções de pesquisas do usuário não commitadas. | 1aadd07; captura034; docs/status-codex.md |

**Importante:** os commits têm autor humano `Victor Williames`; a ferramenta de IA da sessão 2 não foi registrada em lugar nenhum. Não atribua a Codex, Antigravity ou OpenCode sem evidência. Se a sessão 2 foi sua, corrija esta tabela.

---

| Codex-56 | 24/10/2026 | **Codex** | Identificação exata não reinspecionada nesta continuação | e9b1b49: implementação real da cabeça/perfil após cobrança do autor. Nova silhueta do cabelo, orelhas redesenhadas, rosto lateral com correção ilustrativa contínua até28graus e pena43×25 com largura orientada à câmera. Rig/IK/locomoção não alterados. npm test antes/depois e Chrome headless completo verdes (2páginas,7animações,8direções,3presets,0erros/0referências runtime). Capturas028 e par013;278JPEGs técnicos/13pares. #56 promovida aP0 independente de53/59, com blocker47fechado; permanece aberta, corpo/mãos/pés/tecido e semelhança final pendentes. Remoções do usuário preservadas. | e9b1b49; capturas028/par013 |

| ChatGPT-61 | 25/10/2026 | **ChatGPT** | GPT-6 | #61: implementou parser FBX binário e avaliador offline de 65 bones, perfil humanoide de 65 pais/filhos, CLI de diagnóstico e teste Node sobre `Walking.fbx` real (315 curvas, 32 instantes, duração 1,0333s); sem retargeting para Canvas e sem mexer no jogo. `npm test`/Chrome não executados neste ambiente remoto. | `tools/movalab/src/`, `tests/fbx-reader.cjs`, `docs/rig-v2-prototype.md`; commit `cb1682f` e próximos |

| OpenCode-Sync | 25/10/2026 | **OpenCode** | DeepSeek V4.1 Flash Free | Sincronização final: PR #62 integrado (merge `ac8b558`), tag anotada `aruan-v1-rig-original` publicada em `1aadd07`, V1/V2/MovaLab documentados, #60 concluída (estrutura) e #61 em andamento. Integrou os commits do ChatGPT `175d220..e2df137` (leitor FBX binário, perfil de 65 ossos, testes com `Walking.fbx` real) sem alterar o runtime. Auditadas e removidas 59 branches locais e 4 remotas já incorporadas; resta `master`. `npm test` + `test:browser` + MovaLab verdes. Remoções de Albion preservadas fora do commit. | `ac8b558`; `175d220..e2df137`; tag `aruan-v1-rig-original`; `docs/versions/`; Project #2 |

| ChatGPT-61-M0-M1 | 25/10/2026 | **ChatGPT** | GPT-6 | Implementou UI MovaLab Alpha 0.1 + servidor Node local, import FBX, biblioteca persistente com hash e metadados, viewer 3D de esqueleto projetado, proxy chibi técnico e documentação. GitHub Actions `40164633537` verde: syntax/API smoke/`npm test`. **Ainda não** exporta para Aruan Canvas nem possui malha skinned/WebGL. FBX real não executado na suíte remota por restrição de mídia. | `tools/movalab/app`, `tools/movalab/service`, `tools/movalab/tests/app.cjs`, `tools/movalab/README.md`, [CI](https://github.com/victorwilliames/game-2d-aruan/actions/runs/40164633537) |

| OpenCode-61 | 25/10/2026 | **OpenCode** | DeepSeek V4.1 Flash Free | #61: sincronizou `938fb9d..b8ccd7e`, commitou a remoção das 5 imagens de Albion (`c01fcea`) e aplicou a decisão do autor de versionar a biblioteca MovaLab: `.gitignore` sem `workspace/`, 41 FBX/113,6 MB em `ac3c2ea`, README/arquitetura atualizados. Zerou `library.json` (entrada órfã cujo `sources/<sha>.fbx` sumiu). Diagnóstico do pack: 34/41 FBX importáveis; 5 em FBX 6100 recusados pelo leitor, 2 personagens 7300 sem curvas. `npm test` e `npm run test:movalab` verdes; servidor em 5320 conferido por HTTP, sem janela de navegador. | `c01fcea`; `ac3c2ea`; `tools/movalab/workspace/` |

| Codex-Sync-517a94c | 25/10/2026 | **Codex desktop** | GPT-6; variante exata não verificada | A pedido do autor, consultou GitHub e integrou 25 commits por fast-forward 52f740a..517a94c: catálogo/PT-BR/preview Three.js isolado, issues #63–#66. npm test e test:movalab sintético verdes (este fora do sandbox após falha de conexão local). Importações locais preservadas. Sem browser, teste FBX real, aceite visual ou alteração de card; aguardando prompt. | 517a94c; testes locais; issues #63–#66 |
| ChatGPT-MovaLab-Mixamo-63-64 | 25/10/2026 | **ChatGPT** | GPT-6 | Implementou catálogo recursivo sem upload, escolha de modelos originais, interface PT-BR, Three.js/FBXLoader/AnimationMixer e testes Chrome headless reais. Criou issues #63–#66 e handoff Codex Astra. CI verde no checkpoint `517a94c1`; compatibilidade de rigs e aceite visual ainda pendentes. | [Handoff](tools/movalab/docs/codex-astra-handoff.md), [CI](https://github.com/victorwilliames/game-2d-aruan/actions/runs/40168584059) |

| Codex-M1 | 25/10/2026 | **Codex desktop** | GPT-6 | Missão autônoma iniciada; #63 assumida. Catálogo: categorias/favoritos, substituição no mesmo caminho com hash/histórico, disponibilidade, cache invalidado por hash. Corrigido palco 3012px para571px; captures035/036 revisadas, 34 clipes/6 personagens/5legados. API sintética e Chrome completo jogo/estúdio verdes; tag V1 conferida; sem js/ modificado. Preview/retarget ainda pendente #64. | tests/app.cjs; tests/browser3d.cjs; capturas035/036; relatório pack-audit |

| Codex-M2 | 25/10/2026 | **Codex desktop** | GPT-6 | #64: retarget por pose neutra/eixos em humanoid.js, source FBXLoader verdadeiro, limbs sem translação importada, root proporcional, aliases/dedos; loads concorrentes, endpoint/scrub e redraw pausado corrigidos. fbx-loader.js normaliza só rodapé da cópia em memória (17falhas7700→0). Real pack41:34animações/2personagens/5legados;68combinações sem NaN/comprimento alterado. Chrome real kid/cabecudo+walking/run/idle, controles e zero redraws; capturas037/038 revisadas. Sem liveMixamo/hardware/Canvas V2 certificado. API e npm test verdes,5hashes/290JPEGs. Pesquisa ufbx opcional isolada, conversor6100 ainda pendente. | docs/real-pack-2026-10-25.json; tests/retarget.mjs; tests/browser3d.cjs; capturas037/038 |

| Codex-M3-M4 | 25/10/2026 | **Codex desktop** | GPT-6 | Primeira caminhada Mixamo real no Aruan Canvas: proxy skinned65ossos, retarget/IK, schema+playerJSsemThree, LabA/B/presets/export, estúdioV1/V2opt-in com arquivo/URLrestrita. walking63frames/3apoios/loop;8direções/2ciclos, pé1,08e-14/apoio6,39e-14,trêsflechas eV1pixelidêntica. npm test e browsercompletosverdes,296JPEGs;039–041revisadas. Corrigida basevertical (coluna neutra inclinada não pode inclinar rootmotion). Conversorlegado334658d integrado27b100b;UI/visuaisGLBpendentes. Sem aceite humano/hardware ou migraçãojogo. | tests/procedural.mjs; tests/browser-clip.js; capturas039–041; workspace/exports/mixamo-walking.aruan-clip.v1.json |

| Codex-M5 | 25/10/2026 | **Codex desktop** | GPT-6 | Integração6100/GLB naUI/API com subprocesso/cache/histórico/hash; texturas difusas preservadas/decodificadas; diagnósticoCanvas120Hz:32/34passam,roll/landing pendentes. Doisimports locais preservados ecatálogo34. Capturas042–044revisadas; npm test299JPEGs/10.552poses/5hashesverde, browser5legados/Lab eAPI verdes. CI3e8b999verde; novo checkpointCIpendente. Semaceiteartístico/hardware;V1intacta. | relatórioslegacy-service/procedural-pack;capturas042–044 |

| Codex-M6 | 25/10/2026 | **Codex desktop** | GPT-6 | Banco procedural reabre JSON com hash verificado; recorte fonte sincronizado/raiz zero, marcadores salvos/removidos/buscáveis,16MiBguard e fixture única registrada. Chromeeditor/banco/390–740px verdes; trecho0,2–0,8s corresponde àhierarquiaoriginal, IK/apoiospassam. Estúdio8vistas/V1retornopixelverde; npm test/301JPEGs;045/046revisadas. CIformatos40176355867verde,#65fechada,semdependentes. Mapeamento/transições/arte ainda pendentes. | testesprocedural/app/browser3d/browser-clip;capturas045/046 |

| Codex-M7 | 25/10/2026 | **Codex desktop** | GPT-6 | Perfis manuais65canais UI/presets/clipes, API source/target; nomesambíguos/ausentes/mesmoosso rejeitados eíndice+nome paranósrepetidos. Teste real de65ossosrenomeados errozero. Corrigida regressãoaliases117nós/65nomes noFBXcomskin, in-placeagora movequadril anatômico. Previewmixer suspenso duranteconversão ebindingrecriado. Chromecompara matrizes antes/depoisbanco ecomcarregamentolimpo. Capturas047falha/050correçãorevisadas, semcertificararte. CI20a3397verde. | testesretarget/app/browser3d;capturas047/050 |

| Codex-M8-QA | 25/10/2026 | **Codex desktop** | Modelo alterado pelo autor; variante não verificada | Checklist completo solicitado:65issues/51fechadas/14abertas, Project2 eblockers nativos auditados; README/AGENTS/memória corrigidos semapagarregistro. Calibração anatômicaT/A e180° testada:errovetorial~1e-15 sintético e<7e-9 kid/cabecudo, ossosconstantes. ChromeLab/banco/5GLBs/estúdio verdes;32/34Canvas, roll/landing ainda no piso;051inspecionada. npm test/305JPEGs. CI12ef40everde, novo marcoCIpendente. Semaceiteartístico/hardware. | docs/aruan-checklist-completo.md;tests/retarget-rest.mjs;captura051 |

| Codex-QA-CI | 25/10/2026 | **Codex desktop** | Variante exata não verificada | Checklist completo e calibração publicados emf02af6a; CI40198762437verde comT/A,Lab,banco,5GLBs eestúdioCanvas. TagV11aadd07 e5blobsHEADconfirmados; árvorelimpa antesdoregistro. Checklist atualiza publicação/CI, semfecharpendênciasdearte/hardware oumetaMovaLab1.0. | docs/aruan-checklist-completo.md;Actions40198762437 |

| Codex-M9 | 25/10/2026 | **Codex desktop** | Variante exata não verificada | PlayerV2: fade comorigem ainda amostrada, fase porapoios, anchors em mundo, lift/relax emvoo, pausa/interrupção e steady semreterorigem. Estúdio0/0,15/0,30/0,60s, faseon/off, clipe0,1s terminafade0,3antesdeparar. Trêsdemosreais no banco. Looppés22/22passam; remove drift pequeno emapoio integral e salto1,15run. Native8vistas/2ciclos/fps:slip1,28e-13; npmtest307JPEGs eChromeV1completoverdes;052revisada. PerfilCPUJS1/5/10:IKp95.1/.5/.5ms,pintura5.2/106.5/143.2ms; nãoFPS. Semaceiteartístico/hardware;rawhierarquia/V1↔V2 ainda pendentes. | tests/clip-transitions.mjs;tests/browser-transitions.js;docs/clip-transitions-report.json;captura052 |

| Codex-M9-CI | 25/10/2026 | **Codex** | Variante exata não verificada | Confirmou CI40203266999 verde de ee811c1, master sincronizada e issues61/66 atualizadas. Checklist completo atualizado e diagnóstico de apoios/roll registrado sem alegar correção ou aceite físico/artístico. | docs/aruan-checklist-completo.md; docs/aruan-movalab-apoios.md |

| Codex-M9-pausa | 25/10/2026 | **Codex** | Variante exata não verificada | Pausou por pedido explícito do autor; interrompeu o subagente somente leitura antes de alterações. Checklist/Project2 auditados:65issues,51fechadas/14abertas,65cards; gates físicos e61/64/66 pendentes mantidos. Memória/handoff/GitHub atualizados; não implementou controles/apoios novos nem declarou1.0final. | ee811c1 CI40203266999verde; fd8dc4d checklist/diagnóstico; commit de fechamento |

| Codex-M10 | 25/10/2026 | **Codex** | Variante exata não verificada | #67/P0 criada/assumida noProject2. Quatro etapas e aplicação persistente de clipes no jogo real, slots/teclas/sugestão/conflitos/restore; modo leve básico e qualidade opcional. Testes npm/API/ChromeLab+publicação/jogo real/V1 verdes, capturas053/054. Corrigida espera de gravação assíncrona no QA e lista de vínculos após aplicar. Não criou física de pulo/dano/skills, não certificou200FPS nem migração completa. | #67; capturas/timelapse; testes novos naCI |

| Codex-M10-CI | 25/10/2026 | **Codex** | Variante exata não verificada | Publicou225423a. CI40209038233 passou API/retarget/Lab/legados, mas guard histórico de index semplayer conflitou com autorização nova; atualizado para configuração vazia/fallbacksemThree. Smoke clip-only completo/transições verde após correção. Não declarouCIverde prematuramente. | tests/headless.cjs; tools/movalab/docs/codex-astra-handoff.md |

| Codex-M10-handoff | 25/10/2026 | **Codex** | Variante exata não verificada | Checkpoint solicitado pelo autor devido ao uso restante. Registrou commits225423a/b399b63, CI40209288739 emexecução, servidores mantidos e passos/limites concretos para outraIA. Checklist e GitHub atualizados; não declarou conclusão nem CIverde sem prova. | docs/auditorias/aruan-handoff-atual.md; memory-ai.md; #67 |
| Antigravity-Docs-67 | 25/10/2026 | **Antigravity** | Gemini 4 Argon (Medium) | Concluiu a organização de `docs/` interrompida por limite de tokens do Codex (`sprints/`, `certificacoes/`, `tecnico/`, `auditorias/`, `referencias/`, `historico/`, `versions/`, mantendo `roadmap.md`, `aruan-checklist-completo.md` e `aruan-preservacao.json` na frente); confirmou CI `40209288739` verde; `npm test` e `preservation --git` verdes; religou servidores 5317 e 5320 em background. | `docs/`; CI `40209288739`; `docs/memory-ai.md` |
| Antigravity-Mixamo-Default | 25/10/2026 | **Antigravity** | Gemini 4 Argon (Medium) | Moveu `memory-ai.md` para `docs/memory-ai.md` conforme pedido do autor; pré-configurou `Mixamo Idle`, `Mixamo Walking` e `Mixamo Corrida` em `tools/movalab/workspace/game-bindings.json` para o jogo já iniciar com as animações do Mixamo; validou schema e `npm test`. | `docs/memory-ai.md`; `tools/movalab/workspace/game-bindings.json` |
| Antigravity-Etapa3-Xbox-Relocate | 25/10/2026 | **Antigravity** | Gemini 4 Argon (Medium) | Refinou a Etapa 3 do MovaLab conforme direção do autor: ocultou seleção de botão/tecla em `idle`/`walk`/`run`; adicionou escolha de botão do Controle Xbox em 1º lugar (`PadX`, `PadY`, `PadB`, `PadRB`, `PadLB`, `PadRT`, `PadLT`) e Teclado em 2º lugar; separou resolução de conflito em duas opções claras (**Substituir vínculo existente completamente** vs **Substituir animação existente — e realocar a que estava para outro aspecto** com painel de realocação para novo slot/botão Xbox/tecla, incluindo realocação da Cambalhota nativa). | `js/controls.js`; `js/movalab-bindings.js`; `js/movalab-game.js`; `tools/movalab/app/game-publish.js`; `tools/movalab/service/game-bindings.cjs` |


| Codex-S9-inicio | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | #75 ativo; #76–#83 estruturadas com cards/campos e blockers reais no Project2; baseline npm/MovaLab verde; download seletivo público sob teto10GB verificado. Credencial alternativa bloqueada pela revisão automática, não acessada; sem runtime novo ou aceite humano. Checkout isolado preserva alterações locais. | docs/sprints/SPRINT-9-RESUME.md; tools/mixamo/scripts/acquire.cjs |

| Codex-S9-download | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | #77: 2.317 FBX de movimento,19personagens,10metadados íntegros; 1.678.158.728bytes fontes; 1.680.560.376bytes transferência conhecida, reserva1.714.804.684. Timmy recuperado após EPERM; demais arquivos reutilizados sem transferência. Manifestos/hash/proveniência/relatório e medição NTFS. npm test pós-marco, seleção/orçamento e browser focal duas páginas verdes; smoke completo conserva falha nativa touch preexistente. Sem FBX novo no Git nem mudança de renderer. | tools/mixamo/DOWNLOAD_REPORT.md; metadata/integrity.json |

| Codex-S9-rig | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | #76: contratoMixamorig65 deFBX+metadata reais, pais/rest/eixos/quaternions. SeisFBXs×94instantes×65ossos comparadosFBXLoader, posição6,1e−5cm/quat2,13e−13; rest1,75e−13cm. ComposiçãoEuler e interpolação corrigidas no novo avaliadoroffline; legado difere200,62cm. Proxytopologia65 correta, calibração/skin dos19 eCanvaspendentes; quatroparciais nosmetadados. npmtest/contrato/proxy/T-A verdes. Autor ampliou mesmoGoal para desenvolvimento contínuo alémSprint9, semrepetirdownloads. | docs/tecnico/aruan-mixamorig-contrato.md; docs/aruan-desenvolvimento-continuo.md |

| Codex-S9-CI | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | CI40233116012 falhou em caminho Windows aceito como relativo no Linux. Corrigido validador portátil e teste drive-relative. test:mixamo local verde; novaCI ainda precisa ser confirmada. Sem alterar runtime ou repetir downloads. | tools/mixamo/scripts/acquire.cjs; #76 |

| Codex-S9-perfis | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | #78: perfis pequeno/robusto/alto com topologia65; defaultProxy arrays de geometria/pesos idênticos a a29b15e. 19modelos+4proxies/6clipes/690poses, calibração única por destino, comprimento0erro/aim3,11e−8. Cinco binds corrigidos só em memória; quatro parciais preservados. Numeric skin/pesos válidos, materiais dos19 ainda não decodificados. Chromeheadless055 revisada, Walking no Aruan/3arquétipos/YBot; index/inspecao zeroerros focal, npmtest312JPEGs verde. #76 CI corretiva40233385318verde. Canvas completo/catálogo/UI ainda pendentes. | docs/tecnico/aruan-humanoid-profiles.md; 055-mixamo-perfis-galeria.jpg |

| Codex-S9-Canvas-M1 | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | #79 aberta: prévia MovaLab com hierarquia65, dedos/toes no painter real, raiz externa única e IK de apoio. 968poses/8direções, dedos independentes dos camposV1; FBX StartWalking real em8vistas/6tempos, FK do proxy erro0,000128cm no instante comparado. Corrigida gradeFloat32 do conversor0.6. npmtest pós-rig, API/procedural e V1focal2páginas/7animações/8direções/3presets verdes;315JPEGs. 056/057revisadas. Publicação do modo ao gameplay bloqueada; clipes difíceis/cache/transições pendentes. Servidor5320herdado requer reinício, aprovação solicitada por AGENTS6; testes isolados continuam. | docs/tecnico/aruan-canvas-hierarquia.md; branch codex/79-canvas-hierarchy |
| Codex-S9-Canvas-M2 | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | MesmoGoal: piloto8FBXs adquiridos,65juntas×48tempos; erroFKmáx0,000303cm. Chavesirregulares preservadas no conversor0.7 (antes2,31cm), piso/polojoelho corrigidos sem alongarossos/deslocarapoio. Cachegzip881.155bytes sem perda/sem download; Chromeheadless32quadros pelo banco real temporário/capturas058revisadas. npmtest317JPEGs, regressãochaveirregular, procedural/API/smokefocal2páginas verdes. Running descrito originalmente Running And Rolling, sem selecionar por nome para gameplay. CI3030504verde; CI deste marco pendente. #79 aberta/transições e integraçãopendentes; gatesfísicos/5320preservados. | hierarchy-pilot-report.json; humanoid-canvas-browser.json; 058-canvas-piloto |
| Codex-S9-Canvas-M3 | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | Fade65quaternions/raízes/apoios e interrupção no player e banco MovaLab;1.456poses×oito direções e oito trocas reais392poses verdes, comprimentos/continuidade~1e−14. Carregamento assíncrono não zera mais a pose antes do fade. Chromeheadless/banco/059revisada; npmtest318JPEGs/transiçõesV1/conversor/hierarquia/browser34clipes/trêsdestinos verdes. CI19d03afverde; CI novo marco pendente. V1↔hierarquia no gameplay/aceite artístico e backend5320ainda pendentes, sem downloads. | humanoid-transitions.mjs; docs/tecnico/aruan-canvas-hierarquia.md |
| Codex-S9-banco-M1 | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | #79 fd4782b, CI40241451752 verde, Em Revisão. #80 Em Andamento em branch própria: catálogo externo com 2.317 movimentos/19 personagens sem cópia, metadados EN/PT-BR inferidos e estimativas explícitas, busca por sinônimos, lista inicial de 80 cards e favoritos em library.json. Rotas com allowlist/realpath e estados não fictícios; CLI list/search/inspect. Browser: busca pouso e HardLanding real no Proxy; enquadramento skinned corrigido após captura 060 cortada, 061 revisada. npm test (320 JPEGs), unidades/API, browser com 34 clipes e smoke focal das duas páginas verdes. Fila/cache/preparo de produção pendentes; sinal da automação recebido sem recriar GOAL. | docs/tecnico/aruan-mixamo-catalogo.md; mixamo-catalog-browser.json |
| Codex-S9-banco-M2 | 25/10/2026 | **Codex desktop** | GPT-6, variante exata não verificada | Cache versionado com hashes/gzip sem perda; oito pilotos revalidados e referenciados sem cópia, Waving preparado pelo botão/fila em7,6s. Nove prévias Canvas validadas numericamente; zero aprovação visual/integração. Fila serial/até16, deduplicação concorrente, timeout, journal/falhas/estado interrompido; CLI de preparo/validação/preview. Leitura quentecerca de4–12ms, UI529–717ms, sem FPS certificado. NTFS fontes+checkout1.938.120.536bytes, transferência inalterada. npm test322JPEGs, cache/API/fila/CLI/browser real e V1/smoke focal verdes;062/063revisadas. CI276ba72verde; CI deste marco pendente. Master9919f98 só checkpoint, implementação branch80; próximos #81/#82/#83 sem fechar gates humanos. | docs/tecnico/aruan-mixamo-catalogo.md; mixamo-cache-audit.json; storage-after-cache.json |

| Codex-localhost-5317 | 26/10/2026 | Codex desktop | GPT-6 | Restaurou servidor5317 parado (PID6116, oculto); linkDEV/inspecao/MovaLab HTTP200 e smoke headless duas páginas sem erros. Sem alterações de runtime, npm test não repetido, sem validação física. | logs TEMP aruan-5317; tests/headless.cjs --smoke --studio-only |

| Codex-XBOX-MIXAMO | 26/10/2026 | Codex desktop | GPT-6 (variante não verificada) | Vertical slice #83:65canais reais no gameplay, idle/walk/run, cadência por distância, blend e comparadorDEV; deadzone14%/inversão parcial corrigidos. 996apoios/slip1,46e−14, Xboxsimulado A–H e açõesMovaLab verdes.070diagnóstico/071correção; hardware/arte pendentes. | docs/tecnico/aruan-xbox-mixamo-slice.md; xbox-locomotion-report.json; capturas071 |

| Codex-TARGETING-86 | 26/10/2026 | Codex desktop | Modelo selecionado informado pelo autor: GPT-6.1 Terra/médio; execução não reinspecionada | Missão02: motor puro soft/hardlock, callbacks de mundo e contrato,20cenários/1.200passos antioscilação/1.000drift/302ângulos; npmtest baseline/pós e Chromeheadless2páginas0erros verdes. Branch exclusiva sem integração no gameplay ou master, arquivosXbox/runas preservados. Hardware/CI remota não certificados. | #86; js/targeting.js; tests/targeting.cjs; docs/tecnico/aruan-targeting-core.md |

## 2. RESUMO EXECUTIVO

- **O que é:** piloto de RPG de ação 2.5D em **Canvas 2D puro**, sem engine, sem WebGL, sem dependências e sem imagens em runtime.
- **Herói:** Aruan, menino arqueiro indígena, desenhado **proceduralmente** (esqueleto 3D invisível + IK + pintura em facetas).
- **Combate:** o arco é usado como **porrete** em um combo de 3 golpes. Não há tiro de flecha.
- **Cenário:** campo de treino isométrico com praça de pedras, ruínas, vegetação e dois bonecos.
- **Sprint atual:** **Sprint 7 — Personagem**. P0 em fidelidade visual (#56) e locomoção natural (#58); P1 em repertório/poses (#59). As Sprints 1–6 foram entregues tecnicamente, mas os gates físicos 3/17/18/19/22 seguem pendentes. A **Etapa 10** continua sendo o portão **Aruan 100% polido**; a **Etapa 11** é a personalização/evolução visual.
- **O que ainda não existe:** inimigos com IA, vida/dano, morte, ondas, áudio, menu inicial, save e deploy.

---

## 3. ESTADO ATUAL VERIFICADO

### 3.1 Git
- Checkpoint publicado auditado: `12ef40e` emmaster, CI40196908721verde. CalibraçãoT/A e checklist geral estão no próximo marco; consultar ÚLTIMA SESSÃO e gitlog. A tag aruan-v1-rig-original preserva1aadd07.
- Desde 25/10/2026 a única branch principal é **master**; 59 branches locais e 4 remotas já incorporadas foram removidas. Evitar criar branches novas sem necessidade e integrar trabalho temporário ao final.
- Etapas1–17 e Sprints1–7 têm commits/evidências em docs/status-codex.md e no histórico; gates físicos3/17/18/19/22 permanecem pendentes.
- Material histórico ignorado continua local; nenhuma dependência nova ou PNG de referência em runtime. As 5 imagens de pesquisa de Albion foram removidas no commit `c01fcea`, a pedido do autor.

### 3.2 Testes atuais
- npm test verde:10.552 poses, ossos/grip/apoios~2e-14, transições, piscada e clearance de equipamento.
- Integração: teclado/mouse/toque/gamepad,3 cliques rápidos, cancelamento,24 contatos, bordas, câmera e reset. Apoio real na locomoção~1,5e-14 e ataques~1,7e-14; cache=1.
- Cinco hashes canônicosLF passam no disco, nos blobs de HEAD e em clone limpo. #21 corrigiu os quatro hashes legados; effects.js já era canônico desde#15.
- Capturas atuais:307JPEGs técnicos,26curados e13pares;051 registra calibração do proxy. 031/034 preservam comparações de corpo/mãos;042–050 mostram formatos/editor/aliases.
- MovaLab: catálogo34animações/41FBX, preview/retarget, cinco6100→GLB comtexturas, perfis, LabA/B, presets/banco/recortes/marcadores/export e playerCanvas opt-in implementados. Walkingreal63samples/1,033333s/3apoios/oito direções.32/34clips passam diagnóstico;roll/landing exigemcorreção. T/A e torção testados no novo marco; não é aceite artístico.

### 3.3 Navegador atual
- Chrome exclusivamente headless; index.html e inspecao.html sem erros de console,7loops e8direções.
- Câmera:8bordas×2viewports×DPR1/2. Toque:3viewports, DOM real e multitouch nativo viaCDP.
- Capturas005–034 e13pares curados em capturas/progressao/; o último par é012, da locomoção.
- Custos com pacing estão nos relatórios por etapa; não sãoFPS de display. Sem janela visível, celular físico ou Xbox físico nesta execução.

### 3.4 Auditoria da fundação (Etapa 0, histórico preservado)
- `node --check` em todos os `js/*.js`, testes e servidor: **OK**.
- Todos os `src`/`href` locais de `index.html` e `inspecao.html` existem: **OK**.
- Manifesto do pack: **37/37 assets presentes**, 0 ausentes.
- Nenhum arquivo vazio fora do `.git`.
- Nenhum `TODO/FIXME/HACK` no código.
- Hashes de preservação: **5/5 OK**.
- HTTP local: `index.html`, `inspecao.html`, `turnaround.html`, `README.md`, `memory-ai.md`, capturas `.jpg` e referências `.png` retornam **200** com MIME correto.

### 3.5 GitHub Issues e Projects
- Board oficial:Game 2D - Aruan, Project#2 (nunca PlanW#1), consultado ao vivo viaAPI.
- Sprint1#3:reaberta Em Revisão na auditoria de completude;17/18 Em Revisão por hardware ausente,19 Bloqueada pelo aceite destas. Implementação técnica0–11 entregue; Etapa0#1/#2 mantida concluída.
- Sprint2#22:Bloqueada pela revisão física daSprint1#3; Etapas12#23/filha#24 e13#25/filha#26 Concluídas; Etapa14#27/filha#28 Concluídas. Parent/blockedBy nativos e campos Sprint2/Etapas12–14 configurados no Project2.
- Etapas1–7#10–#16 concluídas;17/18 reabertas Em Revisão por hardware físico. Filhas#4/#8/#7/#6/#5 fechadas.
- Etapa9#18:Em Revisão física. Etapa10#19:Bloqueada pelo aceite17/18; certificação automatizada verde e filhas#9/#21 Concluídas. Etapa11#20:implementação Concluída; personalização030a910, capturas018 e par006, sem alegar aceite físico do portão.
- #21 é nova tarefa técnica, filha nativa#19, com blockers nativos#17/#18 agora fechados, campos Sprint1/Etapa10/P0 e StatusConcluído. Certificou hashes em checkout limpo.
- Sprint3#29: tecnicamente concluída (Etapas15–17 e filhas31/33/35/36 fechadas); Sprint4–6 também entregues tecnicamente. Sprint7#52 é a atual: #56 Em Andamento (corpo/tecido), #58 Em Revisão, #59 Bloqueado; gates físicos3/17/18/19/22 preservados.
- V2/MovaLab: #60 Concluída (estrutura; o leitor FBX offline foi adicionado depois, sem retarget) e #61 Em Andamento/P1 (Rig V2/MovaLab; Sprint/Etapa ainda não definidos). PR #62 integrado e tag V1 publicada.
- Relações nativas são a trava. Ao fechar blockers, dependentes diretos são reavaliados. Labels/campos/views permanecem os aprovados; detalhes em AGENTS.md e docs/aruan-11-etapas.md.

### 3.6 Versões e rumo

- **Aruan V1:** versão histórica preservada pelo commit `1aadd07f4bef562d347f5366b8918f5a1cf559cf` e pela tag anotada `aruan-v1-rig-original`. Não é ZIP, cópia duplicada nem certificação de jogo finalizado.
- **Aruan V2:** evolução em desenvolvimento (rig humanoide hierárquico + compatibilidade Mixamo). O jogo ativo continua usando o rig V1 até testes e aprovação visual.
- **MovaLab Procedural:** ferramenta offline em `tools/movalab/`; leitor FBX binário e perfil de 65 ossos implementados e testados com `Walking.fbx` real, com retarget, exportJSON e playbackCanvas experimental no estúdio. O jogo principal continuaV1 e semdependência3D.
- **Biblioteca MovaLab (política do autor, 25/10/2026):** `tools/movalab/workspace/` é versionado no Git, inclusive os FBX importados. Commit `ac3c2ea` trouxe 41 FBX / 113,6 MB. GitHub recusa arquivo acima de 100 MB por push; packs futuros precisam ser fatiados ou reduzidos.
- Documentos: `docs/versions/aruan-v1.md`, `docs/versions/aruan-v2.md`, `tools/movalab/README.md` e `tools/movalab/docs/rig-v2-prototype.md`. Nenhum renderer, cenário ou animação atual foi alterado nesta sincronização.

---

## 4. O QUE JÁ FUNCIONA

- Andar, correr, cambalhota, apoio no mundo e colisão com borda/props.
- Gamepad standard Xbox:A/B/Menu/View, sticks, foco/hot-plug e input híbrido; verificado por simulação, sem hardware físico.
- Toque multitouch:joystick flutuante, mira por arrasto, combo/dodge e troca para teclado/mouse.
- Câmera isométrica elevada acompanhando o herói, com shake e câmera lenta.
- Combo de 3 porretadas com buffer de clique, antecipação, golpe, recuperação, hitstop e rastro.
- Acerto nos bonecos com flash, recuo, faísca, poeira, anel de impacto e “KRAK!”.
- IK de braços/pernas, pé plantado no mundo, empunhadura do arco pela extremidade.
- Arco guardado nas costas que vai para a mão durante o golpe; aljava com 3 flechas sempre nas costas.
- Rosto com faixa vermelha, faixas pretas nas bochechas, olhos, cabelo em painéis e pena.
- Estúdio com 8 direções, timeline, close do rosto, inspeção de ossos/juntas/pés e deslocamento.
- Personalização procedural no estúdio: roupa/cabelo/faixa, quatro cores, presets, aleatorizar/reset, JSON e persistência local opcional no campo.
- HUD de combo, contador de acertos, botões de debug, pausa, reset e link do estúdio.
- Mundo pintado uma vez em canvas offscreen; só personagem, rastro, vento e efeitos são redesenhados.

---

## 5. LINHA DO TEMPO

### Pré-Aruan — cavaleiro (17–18/10/2026)
- Pedido original: piloto isométrico Canvas 2D, sem imagens, com esqueleto 3D invisível, IK e combo de espada.
- Executado pelo **Claude**, com duas rodadas de um agente crítico.
- Correções históricas: projeção espelhada, capa voando, pés deslizando, rastro degenerado, 23 árvores em vez de 8, ordem de profundidade, tassets etc.
- Limitações aceitas: rastro vertical no finalizador de frente/para longe; cabelo carregado de costas; `file://` não testado.
- Todo o material está em `docs/`, inclusive `revisao-referencia.md` com checklist de 20 pontos.

### Sprint 1 — Aruan (23/10/2026 em diante)
- `20:39` `d49497d`: versiona o piloto existente e as capturas 000.
- `20:46` `20ebb0c`: substitui o cavaleiro por Aruan procedural; cria o estúdio; captura 001.
- `20:52` `2b3fcf6`: corrige rosto/pena e pegada articulada; amplia a regressão para 5.816 poses; capturas 002.
- Depois: capturas 003 (campo e combo), `tests/game.cjs`, pacote de referências e a memória (que nasceu zerada).
- Em 23/10 23:09–23:17: auditoria, memória reconstruída, pequenos fixes e roadmap.
- Em 24/10: board renomeado para **Game 2D - Aruan**; **Sprint 1** com Etapas 0–11; travas nativas de dependência; `docs/aruan-11-etapas.md`; Etapa 11 de personalização.

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
| `js/appearance.js` | Schema v1, materiais em cache, presets, JSON e armazenamento local opcional. |
| `js/customization.js` | Painel de aparência, preview e importação/exportação. |
| `js/character.js` | Corpo, roupa, membros, arco, aljava, `drawSkeleton`. |
| `js/head.js` | Cabeça, rosto, cabelo e pena. |
| `js/world.js` | Campo, praça, props, colisão, oclusão, chão em cache. **Hash preservado.** |
| `js/effects.js` | `SwordTrail`, partículas, impacto, poeira, vento. **Hash preservado.** |
| `js/controls.js` | Teclado/mouse/toque, fila de intenções e movimento isométrico. |
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
- `referencias/pesquisas/` — removida em `c01fcea` (a pedido do autor); a pasta ficou vazia.
- `referencias/rafaxlab/` — código/conversa históricos (11,3 MB), **ignorado pelo Git**; módulos truncados, não executar como jogo atual.
- `docs/revisao-referencia.md` — checklist histórico de 20 pontos; guia de QA, não aprovação do estado atual.
- Extratos históricos locais em `docs/` — mensagens, ações e imagens do piloto original, ignorados pelo Git.

---

## 11. COMO VAMOS CONTINUAR (direção definida)
> Auditoria atual emdocs/aruan-checklist-completo.md. As seções de roadmap de23–24/10 abaixo preservam decisões históricas; a Sprint atual é7 e a missão ativa éMovaLab. Menções antigas aausência deFBX/retarget não descrevem o estado atual.


> **Decisões do autor em 23–24/10/2026.** O foco é o personagem e suas animações; cenário, arena e novos sistemas ficam para depois.

### Decisões fechadas
1. **Foco atual:** Aruan, rosto, corpo, equipamento, animações e os três inputs. **Não** priorizar cenário/arena por enquanto.
2. **Arco:** continua como **porrete**. Tiro com flecha pode existir no futuro, mas **não no Sprint 1**.
3. **Cenário:** manter o campo de treino como está até nova ordem.
4. **Referências:** `referencias/hero-aruan` entra no Git/GitHub. `referencias/pesquisas` foi removida em `c01fcea` (25/10/2026), a pedido do autor. `referencias/rafaxlab` e os extratos de mensagens/ações em `docs/` continuam fora do Git; o catálogo `docs/pre-aruan-imagens.json` é versionado.
5. **Sincronização:** o repositório oficial é <https://github.com/victorwilliames/game-2d-aruan> (privado). Commitar e enviar para `origin`.
6. **Memória:** o arquivo canônico é `memory-ai.md`.
7. **Nomenclatura:** **Sprint** (bloco) → **Etapa** (passo) → **Tarefa** (issue filha). Sprint atual: **Sprint 1 — Aruan**.
8. **Travas:** cada etapa/tarefa tem `blocked by`/`blocking` nativo no GitHub e `Status = Bloqueado` enquanto houver blocker aberto.
9. **Janelas:** abrir o mínimo possível. Verificação visual e capturas devem usar navegador headless; janela visível só quando indispensável, com aviso e fechamento imediato. O agente crítico também segue essa regra.

### Sprint 1 — Aruan (agora, P0)
Objetivo: chegar à **Etapa 10 — Aruan 100% polido** e, depois, à **Etapa 11 — personalização e evolução visual**.
- **Etapa 1:** baseline e diagnóstico; capturas 005+.
- **Etapa 2:** mouse + teclado com resposta imediata.
- **Etapa 3:** locomoção com peso, pé plantado e dodge.
- **Etapa 4:** câmera e leitura espacial.
- **Etapa 5:** combate, buffer e cancelamento.
- **Etapa 6:** impacto e feedback visual.
- **Etapa 7:** animação profissional e movimentos secundários.
- **Etapa 8:** toque mobile estilo Wild Rift.
- **Etapa 9:** gamepad Xbox e input híbrido.
- **Etapa 10:** certificação Aruan 100% polido.
- **Etapa 11:** painel de personalização (roupas, cabelo, acessórios), inspirado na organização do LPC, mas procedural.
- Grafo completo, dependências e paralelismo: `docs/aruan-11-etapas.md`.

### Depois da Etapa 10 — Mundo e combate (P1)
Objetivo: deixar de ser campo de treino e virar loop de jogo.
- Substituir os bonecos por inimigos simples (idle, perseguir, atacar, levar dano, morrer).
- Vida do jogador, invulnerabilidade curta, knockback, morte/respawn.
- Ondas ou arena com condição de vitória/derrota.
- Medidor de combo/score e feedback de dano.
- Arco continua porrete; tiro fica fora do Sprint 1.

### Depois — Vertical slice (P2)
- Mundo maior, oclusão, câmera e limites.
- Menu inicial, pausa, opções, HUD final.
- Áudio (WebAudio procedural ou assets).
- Progressão/save se o rumo for roguelite (a inspiração declarada é Hades).
- Gamepad e layout mobile já devem estar cobertos pelas Etapas 8 e 9.

### Depois — Produção (P3)
- Build/deploy estático, cache, domínio.
- Performance em DPR 2, telas grandes e máquinas modestas.
- QA cross-browser, acessibilidade, localização, licença.

### Ainda em aberto
- Estrutura de longo prazo (arena de ondas, roguelite ou aventura) — decidir só depois do personagem.
- Se e quando o tiro com arco entra.
- Se a personalização da Etapa 11 será só procedural ou se o autor aprovará spritesheets.
- Licença do projeto.

---

## 12. BACKLOG PRIORIZADO

### Sprint 1 — agora (P0)
- [x] Renomear o board para **Game 2D - Aruan**.
- [x] Consolidar **Sprint 1 — Aruan** e as Etapas 0–11.
- [x] Criar as issues #10–#20 e redistribuir #4–#9.
- [x] Adicionar travas nativas `blocked by`/`blocking` e `Status = Bloqueado`.
- [x] Criar `docs/aruan-11-etapas.md`.
- [x] Etapa 1 — baseline, capturas 005+ e priorização.
- [x] Etapa 2 — input mouse + teclado.
- [x] Etapa 3 — locomoção, pés e dodge.
- [x] Etapa 4 — câmera.
- [x] Etapa 5 — combate, buffer e cancelamento.
- [x] Etapa 6 — impacto visual.
- [x] Etapa 7 — animação profissional.
- [x] Etapa 8 — software de toque mobile; aceite físico #17 pendente.
- [x] Etapa 9 — software GamepadAPI; aceite físico #18 pendente.
- [ ] Etapa 10 — certificação final; testes técnicos passam, #19 aguarda os aceites físicos.
- [x] Etapa 11 — personalização implementada; não encerra a revisão do portão10.
- [ ] Aceite físico pelo autor, com hardware real; não abrir janela visível sem autorização.
- [ ] Medir desempenho real (sem automação) e registrar números.
- [x] Smoke automatizado do jogo/estúdio, incluindo modoV2 opt-in.

### Depois da Etapa 10 (P1)
- [ ] Inimigos com IA simples e vida.
- [ ] Vida/dano/morte/respawn do jogador.
- [ ] Loop de arena/ondas + score.
- [ ] Áudio.

### Depois (P2)
- [ ] Tiro com arco (se aprovado).
- [ ] Menu/título/pausa/opções.
- [ ] Progressão/save.
- [ ] Deploy e QA cross-browser.
- [x] Re-encodar as capturas para PNG real ou renomear para `.jpg` (feito: renomeadas para `.jpg`).

---

## 13. RISCOS E ARMADILHAS CONHECIDAS

1. **Hashes de preservação**: editar `world.js`, `math.js`, `paint.js`, `effects.js` ou `server.cjs` sem atualizar o JSON quebra o teste.
2. **Regressão visual invisível**: os testes não enxergam arte. Sempre olhar as capturas e verificar no navegador, de preferência em modo headless.
3. **Automação de navegador**: `requestAnimationFrame` é estrangulado em aba oculta; `Game.frameMs` não é FPS real.
4. **Capturas**: os arquivos eram **JPEG com extensão `.png`**; em 23/10/2026 foram renomeados para **`.jpg`**, refletindo o formato real. Se novas capturas forem geradas, salvar já com a extensão correta.
5. **Referências grandes**: ~42 MB de `hero-aruan` + `pesquisas` entram no repositório. `rafaxlab` (11,3 MB) fica local. Evitar adicionar mais binários sem necessidade.
6. **Código histórico truncado**: `referencias/rafaxlab` não é executável nem fonte de verdade.
7. **Nomes legados**: `SwordTrail` e `swordDir` vêm do cavaleiro; são internos e inofensivos. Não renomear sem necessidade (um deles está em arquivo preservado).
8. **Texto legado**: “a lâmina desperta” foi corrigido nesta sessão; procurar outras referências ao cavaleiro antes de publicar.
9. **Deriva entre IAs**: cada ferramenta tem contexto próprio. Se não atualizar este arquivo, a próxima sessão vai repetir trabalho ou desfazer decisões.
10. **Memória zerada**: já aconteceu uma vez. Se ocorrer de novo, reconstruir a partir do Git, `docs/` e capturas; não inventar estado.
11. **Dependência ignorada**: começar uma issue com `Status = Bloqueado` ou com blocker aberto quebra a ordem e faz dois agentes mexerem no mesmo arquivo. Sempre conferir as Relationships antes de assumir.
12. **Paralelismo sem isolamento**: dois agentes na mesma working tree se atropelam. Usar branch/worktree por issue e combinar arquivos compartilhados.
13. **Janelas visíveis**: o autor não quer janelas abrindo sozinhas. Preferir navegador headless para smoke e capturas; abrir janela visível só se indispensável, avisar e fechar em seguida. O agente crítico também foi orientado a fazer o mesmo.

---

## 14. REGRAS PARA A PRÓXIMA IA

1. Leia este arquivo inteiro, `docs/aruan-11-etapas.md`, `docs/revisao-referencia.md` e `capturas/timelapse/README.md` antes de mexer no visual.
2. Rode `npm test` antes e depois de qualquer mudança.
3. Não troque arte procedural por sprites PNG nem adicione dependências sem pedido explícito.
4. Não edite arquivos preservados por hash sem atualizar `docs/aruan-preservacao.json`.
5. Preserve a proporção chibi, o rosto, a pena, o arco como porrete e a aljava nas costas.
6. Registre todo marco visual em `capturas/timelapse/` com número sequencial.
7. Atualize o bloco “ÚLTIMA SESSÃO” e o “REGISTRO DE IAs”. Diga o que verificou e o que não verificou.
8. Use mensagens de commit no padrão existente (`feat:`, `fix:`, `chore:`) e descreva a verificação.
9. Se uma decisão for do Victor, pergunte; não invente rumo de produto.
10. Deixe o projeto melhor do que encontrou — mas sem reescrever o que já funciona.
11. Antes de começar, confira `blocked by` e `Status` no board. Se estiver `Bloqueado`, não comece. Assuma a issue e use branch/worktree própria.
12. Ao fechar uma issue, verifique os dependentes diretos e desbloqueie os que não têm mais blockers.
13. **Navegador:** use Chrome/Edge headless para smoke e capturas. Não abra janela visível sem necessidade; se precisar, avise o autor e feche ao terminar. O autor não quer janelas aparecendo durante o trabalho.

---

## 15. CHANGELOG DESTA MEMÓRIA

| Data | Autor | Mudança |
|---|---|---|
| 23/10/2026 (após 20:52) | não registrado | Arquivo criado, mas salvo com **0 byte**. |
| 23/10/2026 23:09 | OpenCode / DeepSeek V4.1 Flash Free | Primeira reconstrução: estado, linha do tempo, arquitetura, invariantes, pendências. |
| 23/10/2026 23:17 | OpenCode / DeepSeek V4.1 Flash Free | Segunda versão: registro de IAs, auditoria profunda, achados de PNG, roadmap por etapas, decisões pendentes, correções e renomeação para `memory-ai.md`. |
| 23/10/2026 23:35 | OpenCode / DeepSeek V4.1 Flash Free | Terceira versão: decisões do autor, organização do repositório, referências versionadas, README/AGENTS, sincronização com o GitHub e registro dos commits. |
| 24/10/2026 00:10 | OpenCode / DeepSeek V4.1 Flash Free | Quarta versão: Project #2, Etapas 0–2, issues #1–#9, labels, campos, views, sub-issues e regras de uso do board. |
| 24/10/2026 00:26 | OpenCode / DeepSeek V4.1 Flash Free | Quinta versão: board **Game 2D - Aruan**, Sprint 1, Etapas 0–11, Etapa 11 de personalização, travas nativas, redistribuição #4–#9, `docs/aruan-11-etapas.md` e a preferência por headless/mínimo de janelas. |

---

**Fim da memória.** Se você chegou até aqui e vai trabalhar no projeto: atualize este arquivo antes de sair.
