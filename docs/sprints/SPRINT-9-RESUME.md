# Retomar Sprint 9 — GOAL #75

SINCRONIZAÇÃO26/10: fetch confirmou master/origin bae71f1 sem divergência; CI40352410146 de8d856d3 terminou verde. Project2 vivo:75/83EmAndamento,76–78Concluído,79–82EmRevisão,68EmRevisão. Autor pediu sincronizar também mudanças locais: idle pessoal export293b146 + clips/game-bindings, sem alterar conteúdo. Clipe/hash/bindings válidos; diagnóstico original needs-adjustment preservado, sem aceite artístico. npm test329JPEGs/5hashes/10.552poses verde. Este registro atualiza a pendência de CI do parágrafo histórico abaixo.

PUBLICADO:8d856d3 namaster/origin; sliceXbox+Mixamo disponível em5317semreinício. npmtestfinal329JPEGs/hashesHEAD e Chromeheadlesscompleto verdes; ensaioA–H também verde no5317real com workspaceMAIN,3arquivospessoaisiguaisporSHA. #83atualizada/EmAndamento,0dependentesdiretos. CI40352410146 aindaEmExecução nofechamento; verificarresultadoantesdealegarverde. Meta curta entregueparaavaliaçãofísica/artísticadoautor; nãoencerrarSprint9/#75/#68 nem expandirestamarcaporcontaprópria.

CHECKPOINT26/10 — meta curta Xbox+Mixamo: gameplay agora recebe65ossos via js/locomotion.js com idle/walking/standard run reais já exportados, blend, cadência por distância, apoio em mundo e comparador no/?dev=1. Deadzone14% e inversão analógica parcial corrigidas. Ver docs/tecnico/aruan-xbox-mixamo-slice.md / xbox-locomotion-report.json / captura071. #83 segue mais ampla: combate nativo preservado, transição para combate e publicação genérica de ciclos pendentes; aceite físico/artístico é do autor. Slots pessoais não foram sobrescritos; camada usa seleção curada, ações MovaLab continuam operacionais. Não repetir aquisição/conversão. Registros históricos abaixo descrevem marcos anteriores.

ESTADOOPERACIONAL26/10: master/origin5faeb50 integrado (CI40332047157verde), MovaLab5320serveMAINcomworkspacepessoalMAINeMixamoRootMAIN; PIDpróprio5156 emtools/mixamo/temp/movalab-5320-owned.json. Reinício5320AGORAautorizadoeexecutado; não repetirpergunta. 2317movimentos/19personagens/10préviasvalidadas/0aprovadosvisualmente/0integrados. Focalindex+inspecao0erros/325JPEGs, hashHEADpreservado,3arquivospessoaisiguais. Continuarbranch83publicação/blendV1↔hierarquia/runtime; nãoeditarpessoais ourefazeraquisição. MarcadorGoalaindausageLimited, normalrodadamanualdisponível; nãocriaroutroGoal ouforçarestado. ServidorestávelMAINpermitedesenvolvimentoisoladonocheckoutsemalterarserviçoativo.

Checkpoint83M3: alteraçãoRightHand→direção/torçãodoarco noHumanRig, V1inalterado. npmtest pós-character/968poses/1456transições/Chromepunho verdes; captura069conferida. Dezartefatos revalidadosmesmogzip,0reconversões/0downloads. tools/movalab/scripts/revalidate-cache.mjs RAIZ usa reuseOnly; conversão incompatível requerpreparoexplícito. CI83M2f359f40/40269466916verde; publicarmarcoM3/CI e smokeindex+inspecaoaindapendentes. AUTORAGORAautorizoureiniciarapenasMovaLab5320; validarPID/caminho antes deparar, lançarocódigoatualcomworkspacepessoalMAINpreservado e rootMixamoMAIN. NãoreiniciarGoal/nãorebaixarfontes. Revisãoautomáticaporcota falhouantes, novaoperaçãonesta rodadafuncionou. Seguir83publicação/blendV1↔hierarquiaaté integraçãoverificada e depoisbackloginteiro.

Marco83M2: js/animation-timeline.js + teste2.166amostras, ainda sem loader noindex. Lê clocks reais ATTACKS/ARUAN_GAME_FEEL e marcasativas explícitasfonte; zerowritesroot/combate. Ver tools/movalab/docs/animation-timeline.md. CI83M1/40268515417verde. Hipóteseclocksesquivadescartada:0,84/0,46s jábatemrig; docSprint8histórico ganhouaviso. Continuarpublicação/bindings +blendV1↔hierarquia; nãomudarcontroladorparamascararfonte e nãodeclararintegraçãoaindainexistente.

Checkpoint83M1: branch codex/83-sprint8-integration, base88a495c/CI40268160115verde e merge de masterb863bd3(documentação). NativeTouchbaselineeraerrode fixture pausada, corrigido semmudar proteção runtime; npm run test:browser completo verde(2páginas/3touchviewports/7anims/8dirs/0erros). NovoCIincluismokecompleto. Continuar publicação explícita de bindings hierárquicos, fontes de animação nas timelinesS8 e blendV1↔hierarquia; ler sprint8-integration-qa.json. PerfilcanônicoBODYtemmesmoscomprimentosV1, mas reposoV2pelvis62vsV152exige transiçãogeométricareal; não trocar rig instantaneamente. #83cardEmAndamento; #79–82EmRevisão, gateshumanos/físicospreservados.

Final #82: Input.modalActive bloqueia teclado/Menu/View durante janela, neutro ao fechar; npmtest pós-controls/portãoDEV/CLIassignidempotente/Punchingisolado verdes. AlocaçãoNTFS1.939.025.752bytes (storage-after-dev.json). Métricafria atual1,76–42,2s noChrome, último servidor489ms eheaders493ms, atraso restantepipelinebrowser registrado. Não declarar instantâneo/FPS; investigar em83. Fontes/transferências não aumentaram.

Checkpoint #82 (26/10): codex/82-dev-catalog sobree7ae296/CI40265535975verde (#81EmRevisão). DEV local `/?dev=1&movalab=http://127.0.0.1:PORTA` usa servidor próprio; não reiniciar5320herdado. Preview/pausa/input/Punching/draftassign verificados emChromeheadless, captura068ElbowPunching revisada, cacheagora10semnovodownload. API/CLIassign é rascunho emlibrary.json, não altera game-bindings/exports. Ler tools/movalab/docs/dev-catalog.md e mixamo-dev-browser.json. npmtest324JPEGs/API/bindings/portãoDEV verdes. Primeiraconsulta variou41s→1,76s nos ensaios; ServerTiming/rede no relatório, não certificaFPS. Publicar marco82+CI; depois83integraçãoS8 com timelines autoritativas e investigar nativeTouchattackbaseline. Continuar backlog apósSprint9; conservar gateshumanos/físicos e autorworkspace. Master9919f98aindacheckpointdocumental antigo, atualizar checkpointsemcopiarcódigoexperimental até integraçãoverificada.

Checkpoint26/10: branch codex/81-humanoid-preview sobre38e359f/CI40259695785verde. #81:23destinos/90mapas no Chrome headless, bind em memória e diagnóstico honesto de nove prévias parciais; captura067 revisada. Relatório tools/movalab/docs/mixamo-model-preview.json. Nenhum download/reinício de servidor herdado/novoGoal. Fontes na raiz principaltools/mixamo, arquivos pessoais intactos. Próximo: publicar este marco e CI; #82DEV/API, #83integraçãoS8/QA. #79/#80 seguem Em Revisão; dependências nativas preservadas, autor autoriza avançar sobre entregas técnicas verificadas. Desenvolvimento contínuo depois daSprint9 conforme docs/aruan-desenvolvimento-continuo.md. Marcador persistente doGoal haviausageLimited; não prometer retomada sem suporte real.

Leia o contrato autoral integral, AGENTS, memória e handoff. Não recrie o goal existente. Não sobreponha outra execução; conferir `git status`, worktrees, issues/board e processos próprios antes de retomar.

## Checkpoint em execução

- Base `28da803`; checkout `D:\.GITHUB\games\game-2d-aruan\.worktrees\sprint-9`, branch `codex/79-canvas-hierarchy`.
- Fontes compartilhadas só em `D:\.GITHUB\games\game-2d-aruan\tools\mixamo`; não duplicar no checkout.
- #75 Em Andamento; #77 concluída em master c95b37d. #76 concluída em 667ae56/a29b15e (CI40233385318verde); #78 com implementação/testes locais finalizados, publicar e concluir para liberar #79/#80. IDs em `sprint-9-issues.json`.
- Download concluído e processos encerrados: 2.317 movimentos,19personagens,10metadados íntegros. Timmy falhou inicialmente por EPERM do ledger; retomada concluiu somente o faltante. Ledger local preservado; fontes em pastas canônicas, metadados brutos em metadata/raw. DOWNLOAD_REPORT e manifestos leves versionados.
- Cache HF padrão retornou 401. Caminho alternativo de credencial foi rejeitado pela revisão automática; não acessá-lo sem autorização explícita. Rota pública funciona e não precisa de token.

## Próximos comandos

```powershell
# Só quando o processo anterior tiver terminado:
node tools/mixamo/scripts/acquire.cjs download --public --root=D:\.GITHUB\games\game-2d-aruan\tools\mixamo
node tools/mixamo/scripts/acquire.cjs verify --public --root=D:\.GITHUB\games\game-2d-aruan\tools\mixamo
node tools/mixamo/tests/acquire.cjs
```

DOWNLOAD_REPORT factual e manifestos prontos; finalizar publicação #77 sem incluir alterações preexistentes. Então assumir #76 (sem blockers) e extrair contrato completo do Walking real já presente; não usar a duração/contagem histórica do outro Walking do workspace. O Walking deste snapshot tem 65 ossos, 315 curvas e 43 instantes segundo o parser existente; ainda falta auditoria de transforms e comparação com FBXLoader.

Testes baseline: npm test verde; test:movalab verde fora do sandbox (loopback bloqueado dentro). Browser baseline **falhou** em `native touch attack` após passar teclado, câmera, gamepad e o primeiro viewport touch. Falha reproduzida antes de qualquer edição de runtime; investigar na etapa de QA, sem alegar browser verde. Nenhum renderer/gameplay mudou, nenhuma captura nova necessária até haver mudança visual. Preservação: 5 hashes intactos.

## Retomada automática existente

O chat “Automatizar retomada após reset” configurou, a pedido direto do usuário, a automação `retomar-sprint-9-ap-s-renova-o-da-cota` (checagem a cada 15 minutos) para este chat. Não criar uma segunda automação de 05:00. Aquele chat reporta monitor ativo, mas o ciclo completo de reset real ainda não foi comprovado. Não remover locks nem alterar bancos internos.

## Auditoria #76 — marco local atual

Contrato real e relatório em tools/movalab/docs/mixamorig65.v1.json e mixamorig-contract-audit.json. Seis FBXs/94instantes/65ossos contra FBXLoader: erro posição6,1e−5cm, quaternion2,13e−13, repouso1,75e−13cm. Novo avaliador independente corrige convenção Euler e faz slerp; legado offline diverge200,62cm e não deve ser autoridade. Proxy65pais corretos, offsets próprios exigemcalibração. Quatro dos19modelos com canais ausentes nos metadados: Peasant_Man/Castle_Guard_01(-24), Doozy/Mremireh(-8). Bind/skin real dos19, trêsarquétipos e Canvas ainda não certificados. npmtest pós-marco verde, proxy/retarget-rest e test:mixamo verdes. Concluir commit/push #76, fechar checklist técnico, conferir dependentes e assumir #78.

## Continuidade ampliada pelo autor

Orientação posterior de25/10: o mesmo GOAL continua além daSprint9 por qualquer issue/área útil doARUAN. Resolver blockers técnicos em vez deaguardar status; pode criarbugs/melhorias e reorganizarProject2. Preservar dependências reais, gateshumanos/físicos e limites deescopo/risco. Não criaroutroGOAL, repetir downloads nem fabricartrabalho. Documento: docs/aruan-desenvolvimento-continuo.md. O suposto anexoV2 separado não chegou; somente asmensagens decontinuidade recebidas foram incorporadas, semalegar leitura dearquivo ausente.

## Perfis #78 — marco local a publicar

createHumanoidProfile/arquétipos em aruan-profile.js; createAruanProxy(profile) mantém defaultidêntico e adapta bind geometry dos novosperfís. calibrateDestinationBind repara explicitamente cópia em memória, sem FBXescrita. 23destinos (Ar+3+19),6clipes,690poses, comprimento0erro/aim3,11e−8, bindmáx0,000128cm apósreparo. Cinco reparados:Doozy,CastleGuard,Mremireh,Goblin,PaladinWProp. Quatro parciais continuamausentesdedos. Unidade/perfil/bind,proxy,retarget-rest,procedural,npmtest e smokeindex/inspecao focais verdes;312JPEGs. Galeria055headlessrevisada, nenhumpackcopiado. Relatórios em tools/movalab/docs/humanoid-profiles-audit.json e profile-browser-audit.json. Publicar commit/CI e fechar #78 técnico; UI modelos faz parte#81 e Canvas#79 ainda nãoimplementado. Ver o status vivo antes de agir para não repetir etapaconcluída.

## Estado mais recente — #79 em andamento

#78 já publicada em da5ede8, CI40234664847 verde, board Concluído. #79 Em Andamento e #80 A Fazer (blockers fechados). Primeiro vertical slice de hierarquia Canvas no checkout/branch79, docs/tecnico/aruan-canvas-hierarquia.md. Driver js/humanoid-rig.js, dedos/toes no painter, IK opt-in; seletor experimental no MovaLab. Capturas056/057 revisadas,315JPEGs. npmtest pós-rig/character e smokeV1 focal verdes, API/procedural e testehierarquia968poses verdes. GradeFloat32 corrigida no conversor0.6, FKparity0,000128cm no instante0,4s do FBXantigo StartWalking.

Próximo: publicar checkpoint da branch79, validar CI dessa branch sem alegar integração pronta, executar piloto em poucos FBXs novos do dataset (Walking/Running/roll/landing/punch/turn/gesto), medir gzip/erro/memória e corrigir falhas antes de conversão massiva. Depois transições e pipeline/catálogo80. #79 não pode ser encerrada apenas pelo primeiro clipe. Sem UI/runtime novo de combate ativo.

O processo herdado em5320 continua ativo com backend anterior. Pedido assíncrono ao autor para reiniciar apenas esse serviço, conforme regra AGENTS6 sobre processos alheios; não tomar silêncio como autorização. Continuar fixtures próprios/servidores temporários. Nenhum servidor alheio foi encerrado. Goal original continua ativo e a autorização de desenvolvimento contínuo apósSprint9 permanece.

## Checkpoint — piloto #79 de oito clipes

CI3030504/40239156326 verde. Piloto novo8/8numericamente válido, erroFKmáx0,000303cm; conversor0.7 mantém chavesirregulares (corrigiu2,31cm), pisojoelhos/apoios preservados. gzip881.155bytes sem perda; nenhuma transferência nova. Chromeheadless32quadros pelo banco temporário, capturas058revisadas; npmtest317JPEGs, procedural/API/focal2páginas verdes. hierarchy-pilot.mjs usa MIXAMO_ROOT do banco já existente; não baixar novamente. Running.fbx inclui rolamento conforme metadados; não escolher por nome. Próximo: commit/push/CI deste marco, transições completas e comparação fonte/Canvas; #79 permanece Em Andamento. Reinício5320 ainda depende da resposta à autorização solicitada, sem impedir testes isolados.

## Checkpoint — transições completas #79

CI19d03af/40240569412 verde. LocalHierarchy+sample/createTransition completos65quaternions, banco com fade/interrupção; regressão1.456poses/8direções, piloto8trocas/392poses, browsercontinuidade~5,8e−14. Corrigido salto durante carregamento da fonte; capture059revisada. npmtest318JPEGs/transiçõesV1/conversor/hierarquia/browserMovaLab34clipes/3destinos verdes. Código ainda branch79, CI novo marco conferir. V1↔hierarquia/combate posterior; #80desbloqueada pode avançar sobre base técnica após checkpoint. Nenhum reinício/download/novoGoal.

## Checkpoint — #80 catálogo externo (primeiro marco)

Branch atual codex/80-mixamo-catalog, base fd4782b (#79CI40241451752verde/cardEmRevisão, não integrada ao master). #80cardEmAndamento, blockers77/78fechados. Fonte oficialexterna MOVALAB_MIXAMO_ROOT ou MIXAMO_ROOT=D:\.GITHUB\games\game-2d-aruan\tools\mixamo. Catálogo2317/19 presente/semcópia, busca EN/PT-BR/inferências explícitas, library overrides para favoritos; CLI list/search/inspect. Banco produção ainda0convertidos (8cachespiloto79 não adotados). Próximo: cacheversionado/adoçãosegura dos8pilotos e preparooffline sobdemanda comfila/orçamento; depois81/82/83, sem encerrar trabalho apósSprint9.
Testes: npmtest320JPEGs/unidadeAPI/busca/integridade/rotas/browser34clipes e focalindex-inspecao verdes. Capturas060câmeracortada/061correçãoverificadas. Backend5320herdado semreinício; autorização anterior ainda semresposta. Goalget retornouusageLimitedapesar da rodada atualdisponível; sinalautomação recebidosozinhonão comprova statusdoGoal ativo. Não criaroutroGoal/nãorebaixar fontes/nãoburlarquotas.

## Checkpoint — #80 cache e preparo sob demanda

Primeiro marco 276ba72/CI40254458461 verde; master9919f98 publicou apenas docs/capturas. Branch80 incorporou esse checkpoint no merge17ec8da. Agora cache/fila/worker e UI funcionam:8pilotos referenciados sem copiar gzip, Waving convertido pelo botão em7,6s;9prévia/9validados/0aprovados/0integrados. CLI list/search/inspect/prepare/validate/preview; assign fica82/83. Dados continuam somente no source root existente D:\.GITHUB\games\game-2d-aruan\tools\mixamo. Nenhum download novo.
Fila serial,16pedidos, duplicatas concorrentes, timeout120s, journal/falhas/retomada; cache por fonte/contrato/conversor/perfil/player/opções, gzip/hash/limite16MiB. Leitura quentecerca de4–12ms, aberturaUI529–717ms. NTFS fontes+checkout1.938.120.536bytes; report storage-after-cache.json. npmtest322JPEGs/cache/API/fila/CLI/browser real e V1/focal2páginas verdes;062/063revisadas. Próximo: commit/push/CI deste marco; #81 modelos/materiais/calibração e #82DEV, depois83 integraçãoS8/QA (falha baseline native touch attack continua a investigar). Backend5320herdado não reiniciado; pergunta de autorização anterior segue sem resposta. Não recriarGoal/rebaixar fontes/alterarbindings pessoais.
