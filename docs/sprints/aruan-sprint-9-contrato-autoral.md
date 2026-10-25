/goal go — Concluir a Sprint 9 do ARUAN (GOAL #75): biblioteca Mixamo de 2.317 animações + 19 personagens, Rig Mixamorig canônico com Aruan Proxy 3D sem Blender, animação completa no Canvas 2D, catálogo MovaLab/in-game e integração segura à Sprint 8. EXECUTE todas as seções deste documento como instruções do objetivo persistente, registrando cada etapa no GitHub Project #2 e mantendo testes verdes.
ARUAN — PROMPT MESTRE DEFINITIVO PARA CODEX 6.1
Sprint 9 · Fundação Universal de Animações Mixamo / MovaLab / Canvas 2D
> **AUTORIZAÇÃO DO AUTOR — 25/10/2026.** Esta é a direção operacional mais recente e prevalece quando conflitar com prioridades históricas de Sprint 7/8. Não é pedido para responder com um plano e parar: investigar, implementar, testar, versionar, continuar e documentar resultados verificáveis. O Codex deve usar o `/goal` da sua interface quando disponível. Caso a interface trate `/goal go` como comando inválido ou objetivo curto, configure corretamente um objetivo equivalente com `/goal <objetivo>` e mantenha **este documento inteiro** como contrato de execução. Não reinicie outra sessão de Goal se já houver uma execução desta Sprint em andamento.
Repositório: `https://github.com/victorwilliames/game-2d-aruan`  
Projeto oficial: `https://github.com/users/victorwilliames/projects/2` (não usar PlanW #1)  
GOAL Sprint 9: `https://github.com/victorwilliames/game-2d-aruan/issues/75`  
Overhaul pré-existente: `https://github.com/victorwilliames/game-2d-aruan/issues/68`  
Raiz local Windows: `D:\.GITHUB\games\game-2d-aruan`  
Biblioteca-fonte local: `D:\.GITHUB\games\game-2d-aruan\tools\mixamo`  
Estúdio interno: `tools/movalab/`  
Modelo/agente alvo: Codex 6.1, trabalhando no ambiente de desenvolvimento local do autor. Não é Antigravity.
---
1. RESULTADO QUE O AUTOR QUER
Criar um único sistema profissional de animação para todos os humanoides do jogo:
O proxy 3D procedural existente do Aruan é nosso modelo de referência. Não usar Blender.
O esqueleto de animação canônico é o `mixamorig` verificado a partir de arquivos reais, com seus 65 canais, dedos incluídos. Não basta contar 65 nomes semelhantes.
Aruan cabeçudo, inimigos grandões, barrigudos, NPCs pequenos e outros humanoides mantêm proporções próprias, mas reutilizam animações compatíveis graças a um contrato rigoroso e calibração uma vez por personagem.
O MovaLab disponibiliza as 2.317 animações Mixamo com movimento, além de exatamente 19 personagens escolhidos pelo autor, organizados e pesquisáveis, com conversão automática/cache e preview.
No jogo, o Aruan continua desenhado proceduralmente em Canvas 2D/2.5D. O esqueleto/movimento pode ser calculado em 3D internamente e projetado para o renderer Canvas; não migrar o jogo para Three.js, Blender, Unreal ou Unity.
Em modo desenvolvedor, abrir um catálogo in-game, buscar qualquer animação catalogada e visualizar imediatamente as já processadas no Aruan real. Para clipe pendente, mostrar claramente o status e disponibilizar preparação offline em um clique quando possível.
A IA, ao criar novos combos ou a futura habilidade “Tempestade Ancestral”, consulta primeiro os clipes existentes e prioriza movimento real → recorte/composição/blend → ajuste por IK → procedural de corpo criado do zero apenas como última opção.
Reaproveitar, não reescrever, o gameplay soulslike tecnicamente implementado na Sprint 8; migrar as animações gradativamente sem mudar cancel windows, i-frames, stamina, hitbox, armas ou colisões.
Invariante visual: personagem chibi, cabeçudo, traje vermelho, rosto/pintura, cabelo e pena azul/amarela; arco empunhado pela ponta como porrete, nunca pelo meio; aljava e três flechas nas costas. Não transformar arte original em um Y Bot adulto.
Não confundir: 2.317 catalogadas ≠ 2.317 convertidas ≠ 2.317 visualmente perfeitas ≠ 2.317 integradas ao gameplay. Medir cada estado separadamente.
---
2. ESTADO ATUAL: NÃO PERDER O TRABALHO PRONTO
ANTES DE EDITAR, conferir `git status`, HEAD, branches, worktrees, commits pendentes, PRs, issues e logs de CI. O checkpoint conhecido antes desta nova direção foi `28da803` na `master` em 25/10/2026; não assumir que continua sendo HEAD sem verificar.
Leia inteiros: `AGENTS.md`, `docs/memory-ai.md`, `docs/auditorias/aruan-handoff-atual.md`, `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md`, `docs/sprints/aruan-sprint-8-gameplay-feel.md`, `docs/tecnico/aruan-gameplay-feel-criterios.md`, `tools/movalab/README.md` e docs de MovaLab/Rig V2 existentes. Confira `docs/aruan-preservacao.json` e a tag `aruan-v1-rig-original`.
Arquivos relevantes para inspeção:
`tools/movalab/app/aruan-proxy.js`: proxy 3D já criado por código, SkinnedMesh real, geometria procedural e pesos de skin.
`tools/movalab/app/aruan-profile.js`: hierarquia humanoide existente e proporções.
`tools/movalab/app/humanoid.js`: calibração e retarget.
`tools/movalab/app/viewer3d.js`, `converter.js`, `procedural-lab.js`, `canvas-preview.js`, `game-publish.js`.
`js/clip-player.js`, `js/movalab-game.js`, `js/movalab-bindings.js` quando presente, `js/rig.js`, `js/character.js`, `js/head.js`, `js/main.js`, `js/controls.js`.
`tools/movalab/workspace/`: arquivo local do autor, não apagar/substituir.
A Sprint 8 implementou, segundo o handoff, movimento 360°, sprint, esquiva/roll e i-frames, combo de 3 golpes + variantes, block/parry/riposte, recursos, inimigo com telegraphs, HUD, F3, áudio e haptics. Issues #69–#74 concluídas tecnicamente; #68 segue em revisão humana. Não fechar #68 sem aceite do autor e não “desfazer” essa Sprint para construir a biblioteca.
Primeiro registro de execução: criar baseline factual do repositório, testes e espaço em disco; verificar se há outro agente trabalhando em arquivos/branches antes de mudar código; seguir AGENTS.md para worktree/branch, conflitos e commits.
---
3. ARMAZENAMENTO: LIMITE DURO DE 10 GB, SSD D: TEM +20 GB LIVRES
O autor informa que a unidade D: tem mais de 20 GB disponíveis, mas NÃO AUTORIZA BAIXAR MAIS DE 10 GB para este projeto de Mixamo. Respeitar o menor dos limites de transferência e de novo armazenamento gerado pela iniciativa (fontes + cache + derivados + temporários controlados) de 10 GB. Não usar a margem livre do D: como autorização para baixar 20 GB.
Medir espaço D: e uso atual de `tools/mixamo/` + cache relevante. Inventariar antes.
Consultar inventário remoto e tamanhos reais de cada arquivo selecionado, inclusive dos 19 personagens, antes do download.
Realizar dry-run com estimativa de bytes, sem baixar assets grandes.
Configurar cache, temp e diretório de saída para não duplicar os FBXs em C: nem D:. Preferir links/reuso de blobs locais quando seguro; informar o espaço físico realmente ocupado.
Controlar o orçamento incluindo arquivos temporários e derivados novos, com medição entre lotes. Se chegar perto do teto, pausar conversões/baixar apenas o estritamente necessário, jamais ultrapassar deliberadamente.
Não apagar arquivos pessoais, outros caches, downloads, assets existentes do MovaLab nem alterações alheias.
Não clonar todo o dataset, não usar `git lfs clone` completo nem baixar zips/vídeos/duplicações de dezenas de GB.
Fazer downloads retomáveis, idempotentes, seletivos, com concorrência moderada, hashes quando possível. Não refazer downloads válidos.
NÃO iniciar a conversão total para JSON volumoso sem provar custo de armazenamento com lote-piloto. Preferir armazenamento compacto/lazy e limpeza apenas de caches próprios regeneráveis, com logging.
Meta de segurança secundária: manter pelo menos 2 GB livres no D:; se limite de 10 GB ou reserva for ameaçado, prevalece o mais restritivo.
Registrar espaço livre antes/depois, bytes transferidos conhecidos, tamanho dos FBXs, tamanho dos derivados, e arquivos faltantes. Não inventar números.
---
4. HUGGING FACE: USAR AUTENTICAÇÃO JÁ CONFIGURADA NO TERMINAL
Fonte escolhida: `https://huggingface.co/datasets/Linzhan/Mixamo-Animations-Characters`.
O terminal da máquina já tem acesso/token Hugging Face configurado via Codex. Aproveitar credenciais existentes. Diagnosticar com método seguro (`hf auth whoami`, ou API equivalente); NÃO pedir token novamente sem necessidade, não imprimir token em logs, não colocar token no `.md`, Git, CI ou URL. A autenticação não exige usar endpoint pago nem baixar tudo de novo.
Usar download seletivo com CLI `hf download`/`huggingface_hub` ou API oficial, apenas após validar a listagem remota, revisão do repositório e padrões. Evitar instalação pesada; se precisar instalar CLI, checar se já existe antes. Se a configuração for via credencial de outro usuário/serviço, não a copiar.
Baixar TODAS as animações com movimento, exclusivamente os FBX dentro de `animation_motion/` (alvo documentado: 2.317 arquivos, aproximadamente 1,37 GB, mas confirmar contagem e bytes reais no snapshot acessado). Não baixar `animation_motion_ybot/` (cópias com skin, ~6,8 GB), `animation_motion_render/` (vídeos), `animation/` completo com estáticos redundantes, imagens e renders.
Metadados pequenos, somente os que realmente existirem no snapshot: `animation_bones.json`, `animation_motion_prompts.json`, `animation_motion_frames.json`, `metadata.csv`, `characters.csv`, `characters.json`, `character_bones.json`, `character_bone_fix_applied.txt`, `character_nonstandard_rig.txt`; descobrir caminhos reais, não assumir localização se não houver confirmação. Metadados podem orientar tradução/taxonomia/compatibilidade. Guardar versão/revision/commit do dataset.
Baixar exatamente 19 modelos FBX de `character_refined/`, não 114:
Nº	Personagem desejado	Nome de arquivo esperado, conferir via API
1	Claire	`Claire.fbx`
2	Passive Mark	`Passive_Marker_Man.fbx`
3	Peasant Man	`Peasant_Man.fbx`
4	Aj	`Aj.fbx`
5	Paladin J	`Paladin_J_Nordstrom.fbx`
6	Kaya	`Kaya.fbx`
7	Doozy	`Doozy.fbx`
8	Y Bot	`Y_Bot.fbx`
9	castle guard 01	`Castle_Guard_01.fbx`
10	Timmy	`Timmy.fbx`
11	Micheelele / Michelle	`Michelle.fbx`
12	Mremireh o desbiens	`Mremireh_O_Desbiens.fbx`
13	Goblin D hareyko	`Goblin_D_Shareyko.fbx`
14	Big Vegas	`Big_Vegas.fbx`
15	Brute	`Brute.fbx`
16	Ty	`Ty.fbx`
17	Paladin W/prop	`Paladin_WProp_J_Nordstrom.fbx`
18	Ortiz	`Ortiz.fbx`
19	Amy	`Amy.fbx`
A tabela preserva o conjunto escolhido pelo autor; nomes de arquivo são candidatos a confirmar pela API/listagem remota. Não substituir personagem por outro só porque não achou um nome: procurar variante real, documentar ausência, não inventar. Baixar modelos incompletos de dedos também, para teste de incompatibilidade. `character_refined/` é a coleção preferida porque padroniza namespaces de ossos de vários personagens; não duplicar em GLB ou pastas `character/`.
Estrutura autorizada:
```text
D:\.GITHUB\games\game-2d-aruan\tools\mixamo\
  animation_motion\            # 2.317 FBX sem skin
  character_refined\            # somente os 19 FBX selecionados
  metadata\                     # índices auxiliares
  DOWNLOAD_REPORT.md             # relatório com tamanhos e checks
```
Proteção Git: criar `.gitignore` seletivo que ignore FBXs, arquivos binários/caches grandes e segredos, preservando scripts, documentações e metadados leves úteis. Como o repo está público agora, não subir pacotões brutos de terceiros para GitHub/GitHub Actions. O MovaLab é ferramenta interna de estudo; manter proveniência e restrições do dataset/adobe-mixamo-terms, sem travar desenvolvimento interno ou redistribuir pack cru.
Fim da fase: 2.317 FBXs reais no D: se viável sob orçamento; 19 personagens escolhidos; índices validados, hashes/tamanhos e relatório. Se não completar, mostrar total real e motivos, sem mentir.
---
5. RIG MIXAMORIG CANÔNICO: COMPATIBILIDADE REAL, SEM BLENDER
Decisão do autor: utilizar o próprio Aruan Proxy 3D existente; desenvolver e ajustar o proxy inteiramente por código. Não instalar Blender, nem pedir export manual para Mixamo como dependência obrigatória. Se enviar ao Auto-Rigger não for necessário, não enviar. Se um teste optativo com Mixamo for útil, pedir aceite específico antes de upload de arquivo para serviço externo; desenvolver primeiro a via offline.
Extrair o contrato do esqueleto canônico da fonte FBX real e `animation_bones.json`. Conferir 65 canais, nomes/namespaces, pais, hierarquia, rest/bind pose, eixos, quaternions/offsets e coordenadas.
Auditar `aruanHierarchy()` + `aruanProfile` + proxy SkinnedMesh. Já existem ~65 canais por nome, mas isso NÃO significa que a hierarquia, rest transforms e direção estejam exatamente iguais aos do dataset.
Fixar uma versão de RigContract Mixamorig65 testável (transformações/semântica/normalização). Preserve a integridade dos dados de origem; tolerar prefixo/namespace por normalização controlada, não mapeamento manual de 2.317 arquivos.
Fazer o Aruan Proxy seguir o contrato sem alterar suas proporções: cabeça grande, corpo baixo, membros curtos, mãos/dedos, pose T/A adequada e weights válidos. Separar topologia/hierarquia compartilhada de proporções/rest pose individuais. Não exigir os mesmos comprimentos do Y Bot.
Calibração uma vez por personagem, se precisa: proporção, bind pose, quaternions, orientação, escala do root e constraints; depois todos os clipes estruturalmente compatíveis devem aplicar sem ajuste manual clipe a clipe.
Implementar `HumanoidProfile` paramétrico para futuros inimigos/NPCs com corpos curtos, gordos, altos e musculosos. Testar ao menos três arquétipos e Y Bot.
Dedos completos: polegar, indicador, médio, anelar e mínimo, articulações e apertos. Se um dos 19 modelos não tiver todos os dedos, status “parcial” e fallback com diagnóstico, sem inventar ossos.
Corrigir limitações do proxy atual de forma incremental; não substituir a arte do personagem sem comparação visual aprovada.
Criar testes automáticos de compatibilidade exata do contrato, deformação por skinning, validade numérica, comprimentos/pose e correspondência espacial ao longo de clipes diversos.
Aceite do rig: usar um clipe real diretamente na hierarquia canônica; reproduzir no Aruan Proxy, Y Bot e arquétipos, preservando o corpo de cada um; corrigir possíveis diferenças de rest pose automaticamente uma única vez por destino. Compatibilidade estrutural ≠ garantia de resultado artístico universal.
---
6. CANVAS 2D / 2.5D: O ESQUELETO REAL DEVE DIRIGIR O DESENHO
O renderer continua Canvas 2D puro. Three.js/FBXLoader/GLTFLoader ficam no MovaLab como ferramentas offline e preview 3D. Não criar runtime com WebGL nem importar malhas Mixamo no jogo final.
Arquitetura proposta (ajustar após auditoria):
`FBX Mixamo → RigContract 65 → player hierárquico/pose 3D → constraints, IK, equipamentos → projeção 2.5D → drawCharacter(Canvas 2D)`.
O renderer precisa ganhar informação, não perder. Exigir rotação de ombro/tronco/quadril/cabeça, braços/mãos, dedos individuais, joelhos/tornozelos/toes, profundidade/oclusão e giros/rolls/agachamentos mantendo a silhueta chibi original, HQ pintada/cel-shading. Não aproximar todos os movimentos por um subset que torna clipes diferentes iguais.
Reutilizar/estender `js/clip-player.js` e Rig V2 onde fizer sentido, mantendo fallback V1.
Converter clipes offline para formato leve e fiel às transformações requeridas. Se `aruan-clip.v1.json` não comportar hierarquia completa ou ocupar muito espaço, especificar/implementar formato v2 versionado com mapeamento, compressão adequada, compatibilidade e testes de roundtrip; não quebrar os clips antigos.
Manter 1/120s, IK de comprimentos invariantes, foot-lock em mundo e root motion sem deslocamento duplicado. Input e colisões continuam autoridade sobre raiz em gameplay; distinguir preview do jogo.
Recriar dedos visualmente no Canvas, inclusive pegada na extremidade do arco; manter a aljava, flechas, rosto, pena, cabelo, roupas e profundidade correta.
Revisar pose neutra e comparar Canvas V1 x Canvas rigado em oito direções e ao longo de movimentos (idle, walk, run, turn, dodge, roll, combo, acrobacia).
Evitar salto visual entre movimento Mixamo e fallback: transições/blending, fase de apoio e pose recovery. Corrigir tremor, skate de pés, atravessamento e oclusão com testes/capturas reais.
Não reescrever grandes partes do desenho sem melhorar o resultado verificável. Preservar arquivos protegidos por SHA de `docs/aruan-preservacao.json` ou atualizá-los conscientemente segundo AGENTS.md.
Aceite do Canvas: selecionar um clipe no MovaLab, tocá-lo no Aruan Proxy 3D e no personagem Canvas real com a mesma timeline; os movimentos devem corresponder de forma convincente, com ajuste documentado para proporções e câmera; dedos devem participar de gestos observáveis.
---
7. MOVALAB: BANCO COMPLETO, EFICIENTE E CONSULTÁVEL
Não reescrever o estúdio. Reaproveitar o catalogador, as APIs, previews, transições, testes, `workspace/library.json`, `game-bindings.json` e sistema de exports existentes. Fazer `tools/mixamo` ser um source root externo oficial sem copiar os assets para outra pasta.
Pipeline em lote: inventário remoto/local → integridade/hash → deduplicação → análise FBX → extração de eventos/contactos/metadados → conversão → validação numérica → preview real → aprovação visual → vinculação ao jogo. Fazer filas idempotentes/resumíveis, logs, paralelismo limitado e cachê versionado pelo hash do FBX + RigContract + versão do conversor + perfil corporal. Medir CPU, RAM e disco.
Catálogo PT-BR + EN com: ID estável, filename, hash, origem/proveniência, nome original, nome amigável, descrição útil, categoria/subcategoria, tags/sinônimos, frames/FPS/duração, loop ou ação, in-place/root motion, direção, uso previsto/arma, compatibilidade, eventos, contatos, status, preview, versão, alertas, favoritos e uso por habilidade. Criar busca local sem API paga obrigatória; apoiar descrições inicialmente em `animation_motion_prompts.json` e outros metadados. Marcar inferência se não foi validada por inspeção visual.
Estados explícitos: catalogado → arquivo presente → convertido → validado tecnicamente → prévia Canvas disponível → aprovado visualmente → integrado ao gameplay. Não classificar automaticamente 2.317 como perfeitos. Guardar métricas/falhas dos 2.317 e auditar os casos problemáticos. O banco pode listar todos mesmo que nem todos estejam convertidos.
Orçamento de armazenamento: executar lote-piloto representativo (incluindo roll/landing, ataque armado e giro); medir tamanho comprimido, erro de amostragem, CPU/RAM/tempo. Só depois conversão massiva. Se conversão total não couber no teto de 10 GB de novo espaço ocupado, construir prepare-on-demand com cache e fila e comprovar que clipes já preparados abrem instantaneamente. Evitar milhares de JSON gigantes.
API/CLI para agentes: operações simples equivalentes a `list/search/inspect/prepare/validate/preview/assign`, com estrutura e documentação; uma IA deve conseguir procurar algo como “giro com porretada, preparação curta, pé firme” sem vasculhar FBXs à mão.
---
8. PREVIEW: 19 PERSONAGENS + ARUAN PROXY E CATÁLOGO IN-GAME
No MovaLab interno: seleção do Aruan Proxy ou qualquer um dos 19 personagens, animação, play/pause, scrub, loop, velocidade, câmera frente/lado/costas/orbital, bones/skin/contacts, direção, root motion, A/B, blend de clipes, custo e diagnóstico. Ex.: escolher `Timmy` + `Running`; depois `Aruan Proxy` + `Running` e comparar. Troca deve preservar arquivo-fonte e não recarregar todas as 2.317 animações na memória.
No jogo ARUAN (somente DEV): janela de busca por categoria/nome/descrição, filtro de estado, favorito, preview da animação selecionada no mesmo renderer Canvas do jogo, pausa/velocidade/direção/loop, restauração do movimento anterior e acesso às falhas. Preview isolado de combate: reproduzir golpe não pode causar dano, consumir stamina ou disparar hitbox/skill. Manter input normal fora de preview. Não enviar catálogo inteiro/assets brutos para build pública do executável.
Aplicação definitiva de uma animação deve ser operação separada e explícita: gerar binding/manifesto e referenciar clipe aprovado, com verificação de conflitos de teclas/presets e transição de estado. Evitar script jogando FBX bruto para runtime por conveniência.
---
9. SOULSLIKE SPRINT 8: SUBSTITUIR A ANIMAÇÃO, NÃO QUEBRAR A MECÂNICA
Aproveitar contratos implementados em #69–#74 (`ActionResolver`, `IntentQueue`, `ANIMATION_REGISTRY`, timelines, stamina, i-frames, block/parry, hits, inimigo). Fazer a biblioteca atuar como fonte de clipes de animação e associar fases/eventos nos gatilhos existentes.
Prioridade de ações para melhoria: idle, walk, run, sprint, start/stop, pivot 180°, dodge/roll, light1/2/3 com arco porrete, running attack, dodge follow-up, charged, block, parry, riposte, hurt/stagger/death e dois telegraphs do inimigo. Procurar primeiro clipes da biblioteca; combinar/cortar/blend antes de inventar movimento procedural de corpo.
Vincular hitboxes, dano, cancel windows, i-frames, invulnerabilidade, stamina, guard break e riposte a eventos de gameplay autoritativos, jamais inferi-los somente pelo nome do clipe. Preservar `actionInstanceId`, 1 hit por swing, whiff sem hitstop, esquiva substituindo combo pendente no primeiro cancel legal e arco pela ponta. A troca de animação não pode modificar o controle analógico 360° ou causar root motion duplo.
Não fechar GOAL #68 sem teste humano do autor, apesar dos testes automatizados da Sprint 8 verdes. Pode manter #68 “Em Revisão” enquanto a Sprint 9 é prioridade operacional. Não apagar o inimigo de treino nem o HUD.
---
10. ORGANIZAÇÃO REAL NO GITHUB PROJECT #2 — ISSUES E SPRINT 9
Trabalhar pelo GitHub, não só citar URLs. Sincronizar com a branch/worktree local sem apagar trabalhos alheios. Primeiro auditar issues já abertas para não duplicar escopo. GOAL principal #75. Relacionar/reusar #61 (Rig V2), #66 (Proxy/Procedural Lab), #67 (MovaLab→jogo) e #68 (overhaul, em revisão). Preservar gates físicos #3/#17/#18/#19/#22 pendentes.
Criar issues filhas úteis para a Sprint 9, com critérios de aceite, arquivos afetados, dependências e P0/P1:
Auditoria/contrato e baseline do proxy/Rig 65.
Download seletivo, orçamento de 10 GB, 19 personagens e manifesto.
Canonização Mixamorig e rig paramétrico reutilizável.
Player hierárquico completo + Canvas/IK/dedos + paridade visual.
Importação em lote, banco, descriptions/taxonomia e cache compacto.
Preview MovaLab multi-personagem, comparador e QA.
Catálogo in-game DEV + API local para IA.
Integração gameplay soulslike + regressões, documentação, aceite.
A sequência pode mudar por dependência técnica comprovada, mas mantenha o GOAL P0 e um vertical slice rig real → clipe real → Aruan Proxy → Canvas real antes de escalar a conversão massiva.
Usar `gh` CLI/API GraphQL ou integrações GitHub conectadas somente se disponíveis, conferindo permissões. Adicionar #75 e filhas como itens do Project #2; setar Sprint 9/Status/Prioridade/Etapa e subissues/blockers reais, não apenas descrever. Se limitação impedir algum campo, registrar claramente o item pendente com comandos úteis; não afirmar atualização que não ocorreu. Atualizar issue/comentário no início e fechamento de cada etapa. Abrir PRs/commits com escopo limpo e push somente após testes adequados, sem force push.
Atualizar e manter coerentes: `AGENTS.md` prioridade atual, `docs/memory-ai.md` (última sessão + registro append-only), `docs/roadmap.md`, checklist, README, plano Sprint 9, docs técnicas de Rig/Canvas/banco/download e `GOAL #75`. Documentar o que realmente foi implementado e o que ainda é meta.
---
11. TESTES, EVIDÊNCIAS E CRITÉRIOS DE PRONTO
Baseline antes de alterações nos arquivos críticos e testes depois, conforme `AGENTS.md`. Candidatos: `npm test`, `npm run test:movalab`, `npm run test:browser` quando presentes; Chrome/Edge headless, nunca janela headed inesperada. Capturas numeradas segundo `capturas/timelapse/` e README, com visual comparativo.
Verificar automaticamente:
Contagem, integridade, hashes, duplicações e status de exatamente 2.317 animações pretendidas e 19 personagens escolhidos.
Nome/hierarquia/rest/bind/quaternion/axes do Rig Mixamorig65 e erros claros para ossos faltantes.
Skinweights/deformações válidas, todos os dedos e perfis de proporções variáveis.
Reproduzir clipe real no Y Bot, Aruan Proxy e três perfis corporais, sem NaNs/bone scale corrupta.
Paridade de movimento Proxy→Canvas, oito direções e casos difíceis: rolamento, queda, sentar/agachar, gesto dos dedos, grande giro e golpe com arma.
Root motion, loop, transições, foot-lock, IK/apoios, pegada pela ponta e equipamento persistente.
Conversão retomável, cache invalidável, catálogo correto, busca, filtros, favoritos e preview isolado.
Custo de memória/disco/CPU e carregamento sob demanda (sem carregar 2.317 FBXs ou JSONs simultaneamente no jogo).
Regressão completa Sprint 8: G01–G18, T01–T20, S21–S29, i-frames, block/parry, stamina, hitbox na ponta, inimigo e controle.
Não modificar o mundo/cenário nem quebrar hashes protegidos; não colocar Three/FBX em runtime.
Pronto técnico por fases:
A. Download íntegro, até 10 GB, relatório factual.  
B. Rig canônico validado e proxy Aruan chibi animado por FBX real.  
C. Canvas usa hierarquia completa, dedos/profundidade/IK e reproduz o movimento real sem destruir o estilo.  
D. Banco inteiro catalogado; conversões armazenadas dentro do orçamento, com status verdadeiro.  
E. MovaLab lista 19 personagens + Aruan, reproduz clipes selecionados; painel in-game funciona em DEV.  
F. Sprint 8 mantém mecânicas e usa animações reais com timelines compatíveis; testes passam.  
G. Relatório final informa indicadores, pendências, evidências, issues, commits e o que não foi possível comprovar; aceite humano do autor fica pendente até ele testar.
Aprovação técnica não substitui avaliação artística e física. Não marcar “100% aprovado” por não haver exceções numéricas.
---
12. AUTONOMIA DO CODEX ENQUANTO O AUTOR ESTÁ FORA
O autor sairá e deixará o PC ligado, voltando por volta de meia-noite. Quer progresso autônomo contínuo enquanto houver sessão, permissão, tokens e tarefas úteis. Não aguardar instruções a cada etapa normal: ler docs, decidir próxima issue desbloqueada, implementar, testar, commitar, enviar e continuar conforme este objetivo. Priorizar funcionalidade real em vez de produzir só relatórios.
Ritmo operacional:
Auditoria + baseline + `git status` + medição de SSD.
Planejar issues/dependências no Project #2 e iniciar vertical slice/primeiro download sem desperdiçar armazenamento.
Trabalhar uma issue desbloqueada por vez ou paralelizar somente módulos isolados, em branches/worktrees distintos. Nunca dois agentes sobrescrevendo os mesmos arquivos.
A cada marco: teste, evidência, commit, push/PR correto, comentário na issue e update da memória. Não acumular horas de trabalho local não versionado.
Depois de cada marco, escolher a próxima dependência desbloqueada. Iterar em bugs/performance/qualidade com benchmark e teste, sem mudar requisitos ou desviar para cenários, assets aleatórios e feature creep.
Sem pausas artificiais: continuar até cumprir o escopo verificável, alcançar limite real de recursos, precisar de ação humana indispensável ou atingir bloqueio técnico documentado. Trabalho infinito sem critério não é objetivo; avançar na Sprint 9 e no QA até o máximo possível.
Nunca usar código para burlar limite de tokens/rate limits/cotas, expor credenciais, disparar requisições em loop agressivo ou ocultar falhas.
Se atingir limite de tokens/cota ou o ambiente interromper:
Antes de parar, SE POSSÍVEL, sincronizar checkpoint seguro: mudanças testadas e commitadas, issue atual e próximo passo, estado da branch, logs, erros, dados baixados, percentual e custos; atualizar `docs/memory-ai.md` e `docs/auditorias/aruan-handoff-atual.md` sem apagar histórico.
Criar/atualizar arquivo operacional `docs/sprints/SPRINT-9-RESUME.md` com o próximo comando/issue, testes necessários, paths, commits, bloqueios e instruções para retomar. O próximo Codex deve conseguir continuar sem perguntar nada.
Se houver suporte real e habilitado a tarefas agendadas/retomada persistente do Codex, e as permissões do ambiente autorizarem, configurar uma retomada única por volta das 05:00, horário America/Belem, lendo este mesmo documento e o último checkpoint, sem iniciar duas sessões concorrentes. Documentar o mecanismo e sua confirmação. Não inventar a existência desse agendamento.
Se não houver suporte confiável, não prometer continuidade automática às 05:00. Deixar comando/instrução precisos para o autor ou mecanismo externo retomar, como usar a função de sessão `codex resume` quando aplicável; evitar agendador improvisado que execute comandos perigosos sem controle ou sessão duplicada.
Se a sessão permanecer ativa, seguir progredindo depois da meia-noite e após as 05:00 enquanto as condições permitirem; não aguardar o relógio nem reiniciar só porque virou o dia.
O usuário autorizou usar sua máquina ligada para trabalhar no escopo da Sprint 9, não para acessar outros projetos, apagar arquivos, gastar dinheiro, tornar conteúdo público ou efetuar ações externas não relacionadas. Se uma etapa exigir aprovação humana irredutível, trabalhar nas outras etapas independentes; registrar o bloqueio com clareza.
---
13. ENTREGÁVEIS OBRIGATÓRIOS E ORDEM DE SAÍDA
GOAL #75 e issues da Sprint 9 corretamente estruturadas, de preferência com cards/campos no Project #2.
Fontes Mixamo seletivas e relatório `tools/mixamo/DOWNLOAD_REPORT.md` (sem pack FBX no Git).
Contrato Mixamorig65 testável + validação/proporções do Aruan Proxy existente, zero Blender.
Rig/player 65 canais conectado ao renderer Canvas real, com dedos, IK, orientação e proteção da arte V1.
Catálogo MovaLab de 2.317 registros com metadados PT-BR e status de preparo reais, importador/caching eficiente.
Preview 3D com os 19 personagens escolhidos e Aruan Proxy, prévia Canvas e janela DEV in-game.
Consulta/API para futuras IAs e seleção de clipes em habilidades.
Integração paulatina ao combate soulslike já existente, sem regressões.
Documentação atualizada, testes, capturas, relatórios, commits e handoff retomável.
PRIMEIRO CICLO PRÁTICO AGORA: confirmar HEAD e testes → medir espaço D: → verificar Hugging Face autenticado sem expor token → dry-run dos 2.317 clipes + 19 personagens → validar seletividade/10 GB → iniciar download → criar contratos e issues → aplicar primeiro clipe real ao Aruan Proxy → reproduzir esse clipe no Canvas real → continuar etapa por etapa.
NÃO PERGUNTAR DE NOVO SOBRE BLENDER, QUANTIDADE DE PERSONAGENS, ESCOLHA DO DATASET, PASTA OU TETO DE DISCO. TUDO ISSO JÁ ESTÁ DECIDIDO. Se surgir detalhe de implementação não essencial, tomar decisão técnica prudente, documentar e avançar.
META FINAL: poder abrir o ARUAN, pesquisar um movimento entre milhares de animações Mixamo, ver o Aruan cabeçudo executá-lo no Canvas 2D, reaproveitar esse movimento em outro humanoide e depois associá-lo corretamente a uma habilidade ou ao combate, com um pipeline sustentável para a equipe e para as IAs.