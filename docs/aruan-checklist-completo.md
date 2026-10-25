# Checklist completo — Game 2D Aruan e MovaLab

Auditoria de 25/10/2026, solicitada pelo autor. Integração inicial MovaLab→jogo publicada em `225423a`, com correção do guard em `b399b63`; regressões locais verdes. CI [40209288739](https://github.com/victorwilliames/game-2d-aruan/actions/runs/40209288739) concluído com sucesso (`completed/success`). Consulte o [handoff atual](auditorias/aruan-handoff-atual.md) para continuar sem refazer trabalho.

Legenda: `[x]` implementação/evidência técnica existente; `[ ]` falta, revisão ou decisão pendente. Software entregue não equivale a aceite artístico, teste em hardware ou jogo finalizado. Estados GitHub foram consultados ao vivo; as caixas abaixo descrevem o produto, não alteram os gates oficiais.

**Retomada autorizada pelo autor em 25/10/2026 — #67/P0.** MovaLab passa a ser o estúdio principal, em quatro etapas até testar no jogo. Há agora 66 issues/51 fechadas/15 abertas e66cards no Project #2. #61/#66/#67 permanecem Em Andamento; #64 aguarda revisão. Meta200FPS e migração completa não estão certificadas.

- [x] Primeira integração no jogo: slots idle/andar/correr e ação por tecla, sem Three/FBX no gameplay.
- [x] Sugestão pelo nome, conflito com Espaço/cambalhota e vínculos existentes, confirmação de substituição, persistência/hash e restauração das animações originais.
- [x] Etapas com cores distintas; MovaLab → Canvas → gatilho → jogo, sem inspeção antiga obrigatória.
- [x] Modo leve básico: sombras3D desligadas, sem MSAA e resolução limitada; qualidade adicional opcional.
- [ ] LOD/decimação geométrica, otimização aprofundada e medição para a meta200FPS.
- [ ] Física/mecânicas de salto, dano/skills e condições/encadeamento de movimentos; gatilho inicial reproduz animação, sem criar essas mecânicas.

## 1. Fundação e preservação

- [x] Jogo em Canvas 2D procedural, sem engine, WebGL, Three.js ou parserFBX no gameplay.
- [x] Simulação fixa em1/120 s, separada da renderização.
- [x] IK com comprimentos invariantes e pés de apoio em coordenadas de mundo.
- [x] Arco pela ponta; um arco alterna mão/costas; aljava com três flechas nas costas.
- [x] Cenário pintado em cache; pausa evita repintura redundante e restaura buffers.
- [x] Referências visuais fora do runtime; cinco arquivos protegidos por SHA-256/LF.
- [x] `master` é a principal; commits e checkpoints publicados.
- [x] V1 preservada no commit `1aadd07f4bef562d347f5366b8918f5a1cf559cf` e tag `aruan-v1-rig-original`.
- [x] Project #2 oficial, issues, dependências nativas e histórico entre IAs.
- [ ] Certificação final do produto, sem substituir aceite por contagem de testes/commits.

## 2. Jogo que já pode ser executado

- [x] Campo isométrico, props/colisões, dois bonecos de treino e câmera acompanhando o herói.
- [x] Andar, correr, parar, mudar direção e cambalhota.
- [x] Combo de três porretadas, fila/buffer de intenção, antecipação, recuperação e cancelamento.
- [x] Equipar/guardar arco, impacto, rastro, hitstop, partículas e feedback nos bonecos.
- [x] Mouse/teclado, pausa, reset, câmera lenta e inspeção do esqueleto.
- [x] Toque: joystick, mirar por arrasto, atacar/rolar e multitouch; testes automatizados.
- [x] Gamepad standard: sticks, A/B/Menu/View, hot-plug, foco e alternância de inputs; testes simulados.
- [ ] Validar toque em celular real: conforto, notch/safe-area, orientação, scroll/zoom e resposta — #17.
- [ ] Validar controle Xbox real: conexão, deriva, sticks, botões e resposta — #18.
- [ ] Encerrar o portão de qualidade #19 após os aceites; Sprint 1 #3 permanece em revisão.

## 3. Arte, identidade e animação do personagem

- [x] Aruan chibi procedural, oito vistas, cabeça grande, cabelo/franja, faixa, marcas faciais e pena.
- [x] Revisões técnicas de mãos/pés/tecido, junções, contornos e profundidade.
- [x] Cabelo menos nervurado, oclusão em combate, piscada e expressão de idle.
- [x] Contrabalanço e peso da locomoção implementados; comparação animada publicada.
- [ ] Aceitar visualmente caminhada/corrida e transições em tamanho de jogo — #58 Em Revisão.
- [ ] Consolidar Etapa 24 após #58 — #53 Bloqueada.
- [ ] Terminar/aceitar fidelidade de silhueta, volumes, tecido, mãos e pés — #56 Em Andamento/P0.
- [ ] Completar inventário e fidelidade de idle, giro, entrada/parada, esquiva, equipar e três golpes — #59 depende de #53.
- [ ] Consolidar Etapa 25 #55 e Sprint 7 #52; não criar sprints de microajustes.
- [ ] Aceite artístico do autor com comparações equivalentes; testes verdes não aprovam arte.

## 4. Estúdio e personalização

- [x] Oito direções, timeline, reprodução/pausa, velocidade, avanço, zoom e close do rosto.
- [x] Inspeção de ossos, juntas, pés, equipamento e deslocamento.
- [x] Roupa, cabelo, faixa/acessórios, quatro cores e presets Original/Mata/Terra.
- [x] Aleatorizar/restaurar, persistência local opcional e importar/exportar aparência JSON.
- [x] Animações originais são o fallback; MovaLab pode aplicar clipes ao jogo por configuração explícita. Inspeção antiga permanece técnica/histórica.
- [x] Regresso ao V1 produz os mesmos pixels no teste de importação.
- [ ] Aceite final das novas animações no estilo do Aruan; sem migração automática do jogo.

## 5. MovaLab — biblioteca e formatos

- [x] Descoberta recursiva ao abrir/atualizar, sem exigir upload individual.
- [x] Separar animações de modelos estáticos; catálogo persistente e fontes preservadas.
- [x] Busca, filtros, categorias editáveis, favoritos, origem/licença e status.
- [x] Deduplicação, hash/histórico de substituição, fontes ausentes/recolocadas e cache invalidado.
- [x] Biblioteca versionável; copiar arquivo não faz push automaticamente.
- [x] Pack real:41 FBX,34 animações,2 personagens modernos e5 legados.
- [x] FBX 7300/7700 no loader; correção do rodapé 7700 só em memória, sem alterar original.
- [x] FBX 6100→GLB por conversor Python/ufbx opcional e offline, individual/lote, sem Blender manual.
- [x] Histórico/hash da fonte, versão do conversor, derivado e diagnóstico de perdas.
- [x] GLB 2 com skin; classificação de modelo estático/animação e escala em metros convertida para o palco.
- [x] Texturas difusas PNG/JPEG embutidas preservadas e decodificadas em navegador.
- [ ] Suporte integral a mapas normais/especulares/materiais de qualquer origem; perdas atuais são explícitas.
- [ ] Compatibilidade universal com outros fornecedores/rigs: não prometida nem certificada.

## 6. MovaLab — preview e retarget

- [x] Malha, materiais, bones, skin weights e animação reais via Three.js isolado na ferramenta.
- [x] Escolha de clipe/personagem: fonte com skin, kid, cabecudo, modelos legados e proxy.
- [x] Play/pause/reset/scrub/loop/velocidade; órbita/zoom/câmeras, malha/ossos/aramado e chão/grade.
- [x] Orientação, posição, root motion/in-place e avisos de incompatibilidade/fallback.
- [x] Aliases de transformação/skin preservados; in-place move o quadril anatômico.
- [x] Perfis manuais de65 canais, presets/clipes, nomes repetidos por índice+nome e rejeição de mapeamento inválido.
- [x]34 clipes × kid/cabecudo =68 combinações numéricas verificadas; cabecudo parcial por oito canais Pinky ausentes.
- [x] Fonte, conversão offline e preview não concorrem sobre os mesmos transforms.
- [x] Calibração T/A e torção publicada e verificada no CI, inclusive180°, escala e eixos.
- [ ] Comparação/aceite visual equivalente ao Mixamo — #64 Em Revisão.

## 7. Aruan Proxy, Rig V2 e Procedural Lab

- [x] Proxy técnico chibi: SkinnedMesh real,65 ossos,37.896 vértices e4.680 vértices com pesos mistos.
- [x] Perfil humanoide separado da geometria, hierarquia e quaternions executáveis.
- [x] Fluxo real FBX→humanoide→proxy→poses/alvosIK→JSON→Canvas 2D.
- [x] Comparação A/B sincronizada com a malha3D e o renderer Canvas real.
- [x] Ajustes de quadril, braços, passo, altura dos pés, foot-lock, cabeça, intensidade e raiz.
- [x] Presets persistentes, recorte início/fim, loop compatível e raiz inicial normalizada.
- [x] Marcadores personalizados: adicionar, buscar/remover, persistir e acompanhar recorte.
- [x] Banco procedural: salvar/reabrir com hash verificado; fixture Walking registrada sem duplicação.
- [x] Exportação JSON versionada/validada, contatos/eventos/root/hierarquia/proveniência e limite16 MiB.
- [x] Player opcional sem dependência3D; interpolação independente de30/60/144Hz.
- [x] Estúdio importa JSON por arquivo ou caminho local restrito e mantém V1 recuperável.
- [x] Walking externo real no Canvas: oito direções, dois ciclos e três flechas.
- [x] Diagnóstico do solver a120 Hz;32/34 clipes passam numericamente.
- [ ] Corrigir `falling to roll` e `hard landing`: cabeça atravessa o piso; não são animações prontas. [Diagnóstico de apoios e inversão](tecnico/aruan-movalab-apoios.md).
- [x] Transições de pose/raiz no player e estúdio, com ajuste de fase, apoios, pausa e interrupção; demonstrações caminhada/corrida/idle.
- [x] Diagnóstico da junção dos pés em loop e fechamento durante trecho aéreo: 22/22 loops do pack passam; 32/34 clipes passam no diagnóstico geral de IK.
- [ ] Mistura da hierarquia3D e compatibilidade V1↔V2 completa; não confundir com o fade de poses Canvas.
- [ ] Controles avançados de mãos/punhos/dedos, offsets, suavização e limites articulares.
- [ ] Desenhar dedos articulados no Canvas: hoje os canais existem na hierarquia, mas as mãos são punhos fixos.
- [ ] Calibrar equipamento e combate externo; clipes não equipam arco nem geram hits automaticamente.
- [ ] Timeline visual de keyframes/contatos/eventos mais completa e controle de antecipação/recuperação.
- [x] Perfil inicial com 1/5/10 instâncias: custos JS de amostragem/IK e geometria/comandos Canvas, documentados sem alegar FPS.
- [ ] Otimização da pintura em múltiplas instâncias e certificação de desempenho em hardware modesto.
- [ ] Polimento do proxy e do resultado Canvas em tamanho de jogo.
- [ ] Aceite final MovaLab 1.0 — #61/#66 continuam Em Andamento.
- [x] Autor autorizou ativação explícita de clipes no jogo pela etapa de gatilhos; regressões locais passam, sem substituir renderer/rig V1.
- [ ] Aceite artístico/físico e migração completa V2; a integração inicial não encerra esses gates.

## 8. QA, entrega e governança

- [x] `npm test`:10.552 poses, cinco hashes, integração, aparência, continuidade e capturas.
- [x] CI publicada de `ee811c1` verde, incluindo transições, T/A, API, pack, proxy, Lab, legados e estúdio.
- [x] Testes headless do jogo/estúdio; nenhuma janela visível sem autorização.
- [x] Testes de banco/presets, caminhos inseguros, JSON inválido, hash adulterado e persistência.
- [x] Capturas numeradas e pares curados; artefatos são inspecionados, não só gerados.
- [x] Worktrees temporárias dos agentes foram integradas e arquivadas com recuperação.
- [x] Regressão automatizada/CI da calibração T/A publicada; o aceite artístico continua pendente.
- [ ] Testes físicos mobile/Xbox e desempenho real em máquinas modestas/DPR2.
- [ ] QA cross-browser abrangente e acessibilidade de produto final.
- [ ] Licença final do projeto e inventário final de direitos antes de distribuição pública.

## 9. Futuro do jogo — fora da execução atual

Estes itens existem como rumo futuro, não como autorização para implementá-los agora.

- [ ] Inimigos com IA, vida/dano e estados de combate/morte.
- [ ] Vida do jogador, invulnerabilidade, knockback e morte/respawn.
- [ ] Loop de arena/ondas, vitória/derrota, score/progressão conforme decisão do autor.
- [ ] Áudio, menu inicial, opções e HUD final. A pausa/debug atual já existe.
- [ ] Save/progressão do jogo; a persistência atual é de aparência/presets/bibliotecas.
- [ ] Deploy/empacotamento e distribuição.
- [ ] Decidir arena, roguelite ou aventura.
- [ ] Tiro com arco somente se o autor autorizar; hoje o arco é porrete.
- [ ] Cenário novo/inimigos/sprites/LPC/build não entram como efeito colateral do MovaLab.

## 10. Pendências oficiais e ordem de continuidade

São66 issues:51 fechadas e15 abertas, no Project #2. #67/P0 registra a nova direção. Nenhuma foi fechada por esta auditoria.

| Grupo | Estado real |
|---|---|
| Sprint 1 #3 | Em Revisão; #17/#18 aguardam hardware; #19 bloqueada por esses aceites |
| Sprint 2 #22 | Bloqueada por #3; Etapas 12–14 tecnicamente concluídas |
| Sprints 3–6 | Concluídas tecnicamente; não encerram os gates físicos daSprint 1 |
| Sprint 7 #52 | Em Andamento; #56 P0, #58 em revisão; #53/#55/#59 bloqueadas |
| MovaLab #60/#63/#65 | Concluídas tecnicamente |
| Preview #64 | Em Revisão artística |
| Rig V2/MovaLab #61/#66 | Em Andamento; pipeline funcional, conclusão ainda pendente |
| MovaLab → jogo #67 | Em Andamento/P0; etapas, gatilhos/conflitos e integração inicial entregues; performance/condições avançadas pendentes |

Ordem imediata: controles avançados e correção de landing/roll → QA de equipamento/dedos/performance e hierarquia/transições completas → polimento e aceite. Os aceites #17/#18/#58/#64 são independentes e não devem ser inventados para liberar o restante.

Evidências principais: [memória](memory-ai.md), [MovaLab](../tools/movalab/README.md), [handoff](../tools/movalab/docs/codex-astra-handoff.md), [relatório do loteCanvas](../tools/movalab/docs/procedural-pack-report.json), [validação física](certificacoes/aruan-validacao-fisica.md), [Sprint 7](sprints/aruan-sprint-7.md), [timelapse](../capturas/timelapse/README.md).

## 11. Inventário integral das issues

Snapshot consultado em25/10/2026, acrescido da #67 autorizada nesta sessão; #62 é PR, portanto não conta como issue. Uma issue fechada registra o marco técnico da época, não certificação artística total do jogo.

| Issue | Título oficial | Estado da issue | Status no Project #2 | Sprint / etapa |
|---|---|---|---|---|
| [#1](https://github.com/victorwilliames/game-2d-aruan/issues/1) | [ETAPA 0] Start — fundação, memória e sincronização | Fechada | Concluído | Sprint 1 / Etapa 0 |
| [#2](https://github.com/victorwilliames/game-2d-aruan/issues/2) | [ETAPA 0] Aruan base — personagem procedural, campo e combate | Fechada | Concluído | Sprint 1 / Etapa 0 |
| [#3](https://github.com/victorwilliames/game-2d-aruan/issues/3) | [SPRINT 1] Aruan — Etapas 0–11 (PP) | Aberta | Em Revisão | Sprint 1 |
| [#4](https://github.com/victorwilliames/game-2d-aruan/issues/4) | [VISUAL] Auditar as 8 direções do Aruan | Fechada | Concluído | Sprint 1 / Etapa 1 |
| [#5](https://github.com/victorwilliames/game-2d-aruan/issues/5) | [VISUAL] Revisar arco, aljava, bandoleira e empunhadura | Fechada | Concluído | Sprint 1 / Etapa 7 |
| [#6](https://github.com/victorwilliames/game-2d-aruan/issues/6) | [ANIM] Revisar os 3 golpes × 8 direções e o rastro | Fechada | Concluído | Sprint 1 / Etapa 5 |
| [#7](https://github.com/victorwilliames/game-2d-aruan/issues/7) | [ANIM] Revisar pés, cambalhota e borda do mapa | Fechada | Concluído | Sprint 1 / Etapa 3 |
| [#8](https://github.com/victorwilliames/game-2d-aruan/issues/8) | [VISUAL] Gerar capturas 005+ e atualizar o timelapse | Fechada | Concluído | Sprint 1 / Etapa 1 |
| [#9](https://github.com/victorwilliames/game-2d-aruan/issues/9) | [TEC] Rodar regressão final e smoke do navegador | Fechada | Concluído | Sprint 1 / Etapa 10 |
| [#10](https://github.com/victorwilliames/game-2d-aruan/issues/10) | [ETAPA 1] (PP) Baseline e diagnóstico do personagem | Fechada | Concluído | Sprint 1 / Etapa 1 |
| [#11](https://github.com/victorwilliames/game-2d-aruan/issues/11) | [ETAPA 2] (PP) Input de mouse + teclado com resposta imediata | Fechada | Concluído | Sprint 1 / Etapa 2 |
| [#12](https://github.com/victorwilliames/game-2d-aruan/issues/12) | [ETAPA 3] (PP) Locomoção com peso, direção e transições | Fechada | Concluído | Sprint 1 / Etapa 3 |
| [#13](https://github.com/victorwilliames/game-2d-aruan/issues/13) | [ETAPA 4] (PP) Câmera e leitura espacial | Fechada | Concluído | Sprint 1 / Etapa 4 |
| [#14](https://github.com/victorwilliames/game-2d-aruan/issues/14) | [ETAPA 5] (PP) Combate: intenção, buffer e cancelamento | Fechada | Concluído | Sprint 1 / Etapa 5 |
| [#15](https://github.com/victorwilliames/game-2d-aruan/issues/15) | [ETAPA 6] (PP) Impacto e feedback visual | Fechada | Concluído | Sprint 1 / Etapa 6 |
| [#16](https://github.com/victorwilliames/game-2d-aruan/issues/16) | [ETAPA 7] (PP) Animação profissional e movimentos secundários | Fechada | Concluído | Sprint 1 / Etapa 7 |
| [#17](https://github.com/victorwilliames/game-2d-aruan/issues/17) | [ETAPA 8] (PP) Toque mobile estilo Wild Rift | Aberta | Em Revisão | Sprint 1 / Etapa 8 |
| [#18](https://github.com/victorwilliames/game-2d-aruan/issues/18) | [ETAPA 9] (PP) Gamepad Xbox e input híbrido | Aberta | Em Revisão | Sprint 1 / Etapa 9 |
| [#19](https://github.com/victorwilliames/game-2d-aruan/issues/19) | [ETAPA 10] (PP) Certificação Aruan 100% polido | Aberta | Bloqueado | Sprint 1 / Etapa 10 |
| [#20](https://github.com/victorwilliames/game-2d-aruan/issues/20) | [ETAPA 11] (PP) Personalização e evolução visual do Aruan | Fechada | Concluído | Sprint 1 / Etapa 11 |
| [#21](https://github.com/victorwilliames/game-2d-aruan/issues/21) | [TAREFA] Certificar hashes LF em checkout limpo | Fechada | Concluído | Sprint 1 / Etapa 10 |
| [#22](https://github.com/victorwilliames/game-2d-aruan/issues/22) | [SPRINT 2] Polimento visual e animação — Etapas 12–14 | Aberta | Bloqueado | Sprint 2 / Etapa 12 |
| [#23](https://github.com/victorwilliames/game-2d-aruan/issues/23) | [ETAPA 12] Leitura visual de mãos, pés e tecido | Fechada | Concluído | Sprint 2 / Etapa 12 |
| [#24](https://github.com/victorwilliames/game-2d-aruan/issues/24) | [TAREFA] Refinar mãos, pés e dobras a partir das referências | Fechada | Concluído | Sprint 2 / Etapa 12 |
| [#25](https://github.com/victorwilliames/game-2d-aruan/issues/25) | [ETAPA 13] Continuidade e movimento secundário | Fechada | Concluído | Sprint 2 / Etapa 13 |
| [#26](https://github.com/victorwilliames/game-2d-aruan/issues/26) | [TAREFA] Auditar transições rápidas e assentamento dos detalhes | Fechada | Concluído | Sprint 2 / Etapa 13 |
| [#27](https://github.com/victorwilliames/game-2d-aruan/issues/27) | [ETAPA 14] Estúdio econômico e regressão visual | Fechada | Concluído | Sprint 2 / Etapa 14 |
| [#28](https://github.com/victorwilliames/game-2d-aruan/issues/28) | [TAREFA] Evitar repintura redundante do estúdio pausado | Fechada | Concluído | Sprint 2 / Etapa 14 |
| [#29](https://github.com/victorwilliames/game-2d-aruan/issues/29) | [SPRINT 3] Pintura contínua e eficiência do campo — Etapas15–17 | Fechada | Concluído | Sprint 3 / Etapa 15 |
| [#30](https://github.com/victorwilliames/game-2d-aruan/issues/30) | [ETAPA 15] Pintura contínua dos membros | Fechada | Concluído | Sprint 3 / Etapa 15 |
| [#31](https://github.com/victorwilliames/game-2d-aruan/issues/31) | [TAREFA] Suavizar junções anatômicas sem alterar o rig | Fechada | Concluído | Sprint 3 / Etapa 15 |
| [#32](https://github.com/victorwilliames/game-2d-aruan/issues/32) | [ETAPA 16] Campo econômico durante a pausa | Fechada | Concluído | Sprint 3 / Etapa 16 |
| [#33](https://github.com/victorwilliames/game-2d-aruan/issues/33) | [TAREFA] Redesenhar o campo pausado somente quando necessário | Fechada | Concluído | Sprint 3 / Etapa 16 |
| [#34](https://github.com/victorwilliames/game-2d-aruan/issues/34) | [ETAPA 17] Regressão de pintura e eficiência | Fechada | Concluído | Sprint 3 / Etapa 17 |
| [#35](https://github.com/victorwilliames/game-2d-aruan/issues/35) | [TAREFA] Certificar membros e pausa em presets e inputs | Fechada | Concluído | Sprint 3 / Etapa 17 |
| [#36](https://github.com/victorwilliames/game-2d-aruan/issues/36) | [TAREFA] Garantir restauração dos buffers pausados de campo e estúdio | Fechada | Concluído | Sprint 3 / Etapa 17 |
| [#37](https://github.com/victorwilliames/game-2d-aruan/issues/37) | [SPRINT 4] Cabelo procedural e leitura da identidade — Etapas18–19 | Fechada | Concluído | Sprint 4 / Etapa 18 |
| [#38](https://github.com/victorwilliames/game-2d-aruan/issues/38) | [ETAPA 18] Mechas e continuidade do cabelo | Fechada | Concluído | Sprint 4 / Etapa 18 |
| [#39](https://github.com/victorwilliames/game-2d-aruan/issues/39) | [TAREFA] Reduzir nervuras do cabelo preservando franja e silhueta | Fechada | Concluído | Sprint 4 / Etapa 18 |
| [#40](https://github.com/victorwilliames/game-2d-aruan/issues/40) | [ETAPA 19] Regressao da identidade procedural | Fechada | Concluído | Sprint 4 / Etapa 19 |
| [#41](https://github.com/victorwilliames/game-2d-aruan/issues/41) | [TAREFA] Certificar cabelo em poses, direcoes e presets | Fechada | Concluído | Sprint 4 / Etapa 19 |
| [#42](https://github.com/victorwilliames/game-2d-aruan/issues/42) | [SPRINT 5] Profundidade da cabeca em combate — Etapas20–21 | Fechada | Concluído | Sprint 5 / Etapa 20 |
| [#43](https://github.com/victorwilliames/game-2d-aruan/issues/43) | [ETAPA 20] Profundidade da cabeca no finalizador | Fechada | Concluído | Sprint 5 / Etapa 20 |
| [#44](https://github.com/victorwilliames/game-2d-aruan/issues/44) | [TAREFA] Isolar e corrigir faceta no topo do cabelo em combate | Fechada | Concluído | Sprint 5 / Etapa 20 |
| [#45](https://github.com/victorwilliames/game-2d-aruan/issues/45) | [ETAPA 21] Regressao da profundidade em poses | Fechada | Concluído | Sprint 5 / Etapa 21 |
| [#46](https://github.com/victorwilliames/game-2d-aruan/issues/46) | [TAREFA] Certificar oclusao da cabeca em combate e esquiva | Fechada | Concluído | Sprint 5 / Etapa 21 |
| [#47](https://github.com/victorwilliames/game-2d-aruan/issues/47) | [SPRINT 6] Expressao de idle e continuidade facial — Etapas22–23 | Fechada | Concluído | Sprint 6 / Etapa 22 |
| [#48](https://github.com/victorwilliames/game-2d-aruan/issues/48) | [ETAPA 22] Piscada e expressao de idle | Fechada | Concluído | Sprint 6 / Etapa 22 |
| [#49](https://github.com/victorwilliames/game-2d-aruan/issues/49) | [TAREFA] Animar piscada procedural sem popping nas transicoes | Fechada | Concluído | Sprint 6 / Etapa 22 |
| [#50](https://github.com/victorwilliames/game-2d-aruan/issues/50) | [ETAPA 23] Regressao facial e transicoes | Fechada | Concluído | Sprint 6 / Etapa 23 |
| [#51](https://github.com/victorwilliames/game-2d-aruan/issues/51) | [TAREFA] Certificar piscada e expressoes em poses e inputs | Fechada | Concluído | Sprint 6 / Etapa 23 |
| [#52](https://github.com/victorwilliames/game-2d-aruan/issues/52) | [SPRINT 7] Personagem — movimento natural e fidelidade visual | Aberta | Em Andamento | Sprint 7 / Etapa 24 |
| [#53](https://github.com/victorwilliames/game-2d-aruan/issues/53) | [ETAPA 24] Locomoção natural — andar, correr e transições | Aberta | Bloqueado | Sprint 7 / Etapa 24 |
| [#54](https://github.com/victorwilliames/game-2d-aruan/issues/54) | [TAREFA] Harmonizar contornos da pele e cabelo preservando leitura | Fechada | Concluído | Sprint 7 / Etapa 24 |
| [#55](https://github.com/victorwilliames/game-2d-aruan/issues/55) | [ETAPA 25] Fidelidade visual e repertório de movimentos | Aberta | Bloqueado | Sprint 7 / Etapa 25 |
| [#56](https://github.com/victorwilliames/game-2d-aruan/issues/56) | [TAREFA] Aproximar silhueta, volumes e tecido da referência | Aberta | Em Andamento | Sprint 7 / Etapa 25 |
| [#57](https://github.com/victorwilliames/game-2d-aruan/issues/57) | [TAREFA] Auditar impacto visual da meta e carregamento do index | Fechada | Concluído | Sprint 7 / Etapa 24 |
| [#58](https://github.com/victorwilliames/game-2d-aruan/issues/58) | [TAREFA] Reconstruir caminhada e corrida com peso e contrabalanço | Aberta | Em Revisão | Sprint 7 / Etapa 24 |
| [#59](https://github.com/victorwilliames/game-2d-aruan/issues/59) | [TAREFA] Auditar e completar movimentos das referências | Aberta | Bloqueado | Sprint 7 / Etapa 25 |
| [#60](https://github.com/victorwilliames/game-2d-aruan/issues/60) | [TAREFA/PP] MovaLab Procedural — estrutura da ferramenta de conversão | Fechada | Concluído |  |
| [#61](https://github.com/victorwilliames/game-2d-aruan/issues/61) | [ETAPA/PP] Aruan Rig V2 — hierarquia humanoide e migração segura para MovaLab | Aberta | Em Andamento |  |
| [#63](https://github.com/victorwilliames/game-2d-aruan/issues/63) | [MOVALAB M1] Catálogo automático do workspace e interface PT-BR | Fechada | Concluído |  |
| [#64](https://github.com/victorwilliames/game-2d-aruan/issues/64) | [MOVALAB M2] Visualizador 3D real de FBX com seleção de personagens | Aberta | Em Revisão |  |
| [#65](https://github.com/victorwilliames/game-2d-aruan/issues/65) | [MOVALAB M3] Compatibilidade FBX antigo, performance e UX do clone Mixamo | Fechada | Concluído |  |
| [#66](https://github.com/victorwilliames/game-2d-aruan/issues/66) | [MOVALAB M4] Aruan Proxy, Procedural Lab e exportação Canvas experimental | Aberta | Em Andamento |  |

| [#67](https://github.com/victorwilliames/game-2d-aruan/issues/67) | [P0] MovaLab como estúdio: etapas, gatilhos e animação externa no jogo | Aberta | Em Andamento | Integração urgente |
