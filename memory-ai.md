# MEMÓRIA DO PROJETO — GAME 2D - ARUAN

> **LEIA PRIMEIRO.** Este é o handoff entre IAs e pessoas. Se você é uma IA (Codex, Antigravity, OpenCode, Claude etc.), atualize o bloco **“ÚLTIMA SESSÃO”** e acrescente uma linha no **“REGISTRO DE IAs”** antes de terminar. Nunca apague o histórico.
>
> **Arquivo canônico:** `memory-ai.md` — renomeado de `memory-ai.md.txt` em 23/10/2026 (a extensão dupla era acidente).
> **Projeto:** `D:\.GITHUB\games\game-2d-aruan`
> **Servidor local:** `http://localhost:5317`

---

## 0. ÚLTIMA SESSÃO (checkpoint autônomo)

| Campo | Valor |
|---|---|
| Data | 2026-10-25 (UTC−3) |
| Ferramenta | ChatGPT, GitHub Connector (MovaLab interface alpha) |
| Modelo / IA | GPT-6 |
| Base | `master`, preservação V1: tag `aruan-v1-rig-original` / commit `1aadd07f` |
| Issue | #61 Aruan Rig V2 / MovaLab |
| Resultado | **Implementado MovaLab Alpha 0.1 real:** `tools/movalab/service/server.cjs` com API local FBX Binary, hash SHA-256, deduplicação, `workspace/library.json` persistente, arquivos de source fora do Git, PATCH de metadados; `tools/movalab/app/{index.html,styles.css,main.js}` com UI escura, biblioteca, filtros, upload, play/pause, timeline, zoom/orbit, source skeleton projetado em Canvas e proxy chibi técnico aproximado. Documentação e testes `tools/movalab/tests/app.cjs`. Browser WebGL/SkinnedMesh ainda não existem. |
| Verificações | GitHub Actions [run 40164633537](https://github.com/victorwilliames/game-2d-aruan/actions/runs/40164633537) **verde**: syntax check, MovaLab HTTP/UI smoke, `npm test` legado verde. Teste de import do `Walking.fbx` em serviço UI novo **não foi executado nesta CI**, por não publicar arquivo de terceiro no Git. Leitor FBX tinha teste real anterior feito pelo OpenCode. |
| Sem alterações | Nenhum arquivo do jogo `js/`, Canvas, arena, animações V1, câmera ou rig ativo foi modificado. `workspace/` ignorado pelo Git. |
| Limites | Preview é projeção 3D de ossos; proxy usa geometria Canvas 2D/cápsulas derivadas de posição 3D, **não** é malha skinned calibrada. Tela Procedural Lab é somente estágio anunciado, sem retarget/export. Formatos adicionais (.glb, FBX ASCII) não suportados pela importação atual. Sem benchmark de FPS físico. |
| Próximo passo | Usuário abrir em `http://127.0.0.1:5320`, importar `C:\Users\willi\Downloads\Walking.fbx` e conferir movimento real; depois implementar viewport Three.js isolado, Aruan Proxy skinned, bind/rest pose, calibração para Rig V2, player Canvas e export procedural com aceitação em 8 direções. |

**Comando:** `node tools/movalab/service/server.cjs` na raiz; teste sem FBX: `node tools/movalab/tests/app.cjs`. Teste com FBX local via `MOVALAB_TEST_FBX`; não commitar o arquivo externo.

**Referências:** [plano](tools/movalab/docs/movalab-app-architecture.md), [README](tools/movalab/README.md) e issue #61. Há outros agentes trabalhando na mesma `master` em momentos diferentes; verificar `fetch` antes de prosseguir e não sobrescrever `workspace`.


---

## 1. REGISTRO DE IAs (append-only)

| # | Data | Ferramenta | Modelo | O que fez | Evidência |
|---|---|---|---|---|---|
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
- Checkpoint funcional atual:`e2df137` (leitor FBX e perfil Rig V2 do ChatGPT), em master; o commit documental desta sincronização fica no topo do histórico. A tag anotada `aruan-v1-rig-original` aponta para `1aadd07`.
- Desde 25/10/2026 a única branch principal é **master**; 59 branches locais e 4 remotas já incorporadas foram removidas. Evitar criar branches novas sem necessidade e integrar trabalho temporário ao final.
- Etapas1–17 e Sprints1–7 têm commits/evidências em docs/status-codex.md e no histórico; gates físicos3/17/18/19/22 permanecem pendentes.
- Material histórico ignorado continua local; nenhuma dependência nova ou PNG de referência em runtime. Remoções de pesquisas do usuário não foram commitadas.

### 3.2 Testes atuais
- npm test verde:10.552 poses, ossos/grip/apoios~2e-14, transições, piscada e clearance de equipamento.
- Integração: teclado/mouse/toque/gamepad,3 cliques rápidos, cancelamento,24 contatos, bordas, câmera e reset. Apoio real na locomoção~1,5e-14 e ataques~1,7e-14; cache=1.
- Cinco hashes canônicosLF passam no disco, nos blobs de HEAD e em clone limpo. #21 corrigiu os quatro hashes legados; effects.js já era canônico desde#15.
- Capturas atuais:281JPEGs técnicos,26curados e13pares; captura034 é o recorte de mãos contra c33c108 e a031 é a comparação de corpo/tecido.
- MovaLab: teste unitário sem FBX OK; com `Walking.fbx` real, 65 ossos, 315 curvas, 32 instantes, 1,0333s e deslocamento dos pés 16,32/18,79. Isso valida leitura/avaliação offline, **não** retarget ou caminhada no Aruan.

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
- **MovaLab Procedural:** ferramenta offline em `tools/movalab/`; leitor FBX binário e perfil de 65 ossos implementados e testados com `Walking.fbx` real, mas **sem retarget, playback ou integração no Canvas**. Sem dependência de runtime.
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
- `referencias/pesquisas/` — 5 imagens de pesquisa (0,33 MB).
- `referencias/rafaxlab/` — código/conversa históricos (11,3 MB), **ignorado pelo Git**; módulos truncados, não executar como jogo atual.
- `docs/revisao-referencia.md` — checklist histórico de 20 pontos; guia de QA, não aprovação do estado atual.
- Extratos históricos locais em `docs/` — mensagens, ações e imagens do piloto original, ignorados pelo Git.

---

## 11. COMO VAMOS CONTINUAR (direção definida)

> **Decisões do autor em 23–24/10/2026.** O foco é o personagem e suas animações; cenário, arena e novos sistemas ficam para depois.

### Decisões fechadas
1. **Foco atual:** Aruan, rosto, corpo, equipamento, animações e os três inputs. **Não** priorizar cenário/arena por enquanto.
2. **Arco:** continua como **porrete**. Tiro com flecha pode existir no futuro, mas **não no Sprint 1**.
3. **Cenário:** manter o campo de treino como está até nova ordem.
4. **Referências:** `referencias/hero-aruan` e `referencias/pesquisas` entram no Git/GitHub. `referencias/rafaxlab` e os extratos de mensagens/ações em `docs/` continuam fora do Git; o catálogo `docs/pre-aruan-imagens.json` é versionado.
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
- [x] Etapa 8 — toque mobile.
- [x] Etapa 9 — gamepad Xbox.
- [x] Etapa 10 — certificação Aruan 100% polido.
- [ ] Etapa 11 — personalização (P2, depois da 10).
- [ ] Testar `index.html` e `inspecao.html` manualmente numa janela real, DPR 1 e 2.
- [ ] Medir desempenho real (sem automação) e registrar números.
- [ ] Teste de fumaça automatizado do estúdio (`inspection.js`).

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
