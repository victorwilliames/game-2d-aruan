# Retomar Sprint 9 — GOAL #75

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
