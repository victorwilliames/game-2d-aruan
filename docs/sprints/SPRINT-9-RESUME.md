# Retomar Sprint 9 — GOAL #75

Leia o contrato autoral integral, AGENTS, memória e handoff. Não recrie o goal existente. Não sobreponha outra execução; conferir `git status`, worktrees, issues/board e processos próprios antes de retomar.

## Checkpoint em execução

- Base `28da803`; checkout `D:\.GITHUB\games\game-2d-aruan\.worktrees\sprint-9`, branch `codex/sprint-9`.
- Fontes compartilhadas só em `D:\.GITHUB\games\game-2d-aruan\tools\mixamo`; não duplicar no checkout.
- #75 Em Andamento, #77 em execução. #76 A Fazer; #78–#83 bloqueadas por relações nativas. IDs em `sprint-9-issues.json`.
- Download iniciado via `acquire.cjs download --public --root=...`, três workers. Consultar processo/sessão atual antes de disparar outra instância. Ledger registra reservas de transferência e bytes efetivos, manifestos em `tools/mixamo/metadata/`.
- Cache HF padrão retornou 401. Caminho alternativo de credencial foi rejeitado pela revisão automática; não acessá-lo sem autorização explícita. Rota pública funciona e não precisa de token.

## Próximos comandos

```powershell
# Só quando o processo anterior tiver terminado:
node tools/mixamo/scripts/acquire.cjs download --public --root=D:\.GITHUB\games\game-2d-aruan\tools\mixamo
node tools/mixamo/scripts/acquire.cjs verify --public --root=D:\.GITHUB\games\game-2d-aruan\tools\mixamo
node tools/mixamo/tests/acquire.cjs
```

Depois gerar DOWNLOAD_REPORT factual, versionar manifestos leves, atualizar memória/#77/board, testar, commitar e integrar/push sem incluir alterações preexistentes. Então assumir #76 (sem blockers) e extrair contrato completo do Walking real já presente; não usar a duração/contagem histórica do outro Walking do workspace. O Walking deste snapshot tem 65 ossos, 315 curvas e 43 instantes segundo o parser existente; ainda falta auditoria de transforms e comparação com FBXLoader.

Testes baseline: npm test verde; test:movalab verde fora do sandbox (loopback bloqueado dentro). Browser baseline **falhou** em `native touch attack` após passar teclado, câmera, gamepad e o primeiro viewport touch. Falha reproduzida antes de qualquer edição de runtime; investigar na etapa de QA, sem alegar browser verde. Nenhum renderer/gameplay mudou, nenhuma captura nova necessária até haver mudança visual. Preservação: 5 hashes intactos.

## Retomada automática existente

O chat “Automatizar retomada após reset” configurou, a pedido direto do usuário, a automação `retomar-sprint-9-ap-s-renova-o-da-cota` (checagem a cada 15 minutos) para este chat. Não criar uma segunda automação de 05:00. Aquele chat reporta monitor ativo, mas o ciclo completo de reset real ainda não foi comprovado. Não remover locks nem alterar bancos internos.
