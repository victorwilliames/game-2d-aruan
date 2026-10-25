# Retomar Sprint 9 — GOAL #75

Leia o contrato autoral integral, AGENTS, memória e handoff. Não recrie o goal existente. Não sobreponha outra execução; conferir `git status`, worktrees, issues/board e processos próprios antes de retomar.

## Checkpoint em execução

- Base `28da803`; checkout `D:\.GITHUB\games\game-2d-aruan\.worktrees\sprint-9`, branch `codex/78-humanoid-profiles`.
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
