# Sprint 9 — Fundação universal de animações

Direção autoral de 25/10/2026: [contrato integral](aruan-sprint-9-contrato-autoral.md). GOAL [#75](https://github.com/victorwilliames/game-2d-aruan/issues/75), Project #2. O contrato autoral prevalece sobre resumos e prioridades históricas.

| Etapa | Issue | Entrega | Blockers nativos |
|---|---|---|---|
| 32 | #76 | Auditoria baseline e contrato real do rig | nenhum |
| 33 | #77 | Download seletivo íntegro sob 10 GB | nenhum |
| 34 | #78 | Canonização/proxy/perfis | #76, #77 |
| 35 | #79 | Player/Canvas completo | #78 |
| 36 | #80 | Banco/cache/piloto | #77, #78 |
| 37 | #81 | Preview 19 personagens + Aruan | #79, #80 |
| 38 | #82 | Catálogo DEV/API para IA | #79, #80 |
| 39 | #83 | Integração Sprint 8 e QA | #81, #82 |

Os oito cards, subissues e blockers foram criados via API. Campos Sprint 9/P0/Etapa configurados preservando as opções anteriores. Etapas dependentes começam Bloqueadas; #75 Em Andamento. IDs auditáveis em `sprint-9-issues.json`. Reusar #61/#64/#66/#67; #68 permanece revisão humana.

Baseline: `28da803`, master/origin sincronizadas, tag V1 alvo `1aadd07`. `npm test` passou (5 hashes, 10.552 poses, 311 JPEGs/13 pares); `test:movalab` passou fora do sandbox após falha de loopback nele. Alterações preexistentes `workspace/clips.json`, `game-bindings.json`, um export e `tools/externas/` preservadas. Checkout temporário `.worktrees/sprint-9`, branch `codex/sprint-9`; integrar na master ao concluir marcos seguros.

Dry-run real: revisão HF `7f134bc734557b1d9516cb476d25ea1f577e45c1`. 2.317 movimentos = 1.370.579.632 bytes; 19 personagens = 306.511.338; 10 metadados = 1.067.758. Total 1.678.158.728 bytes. Apenas rota pública; autenticação do cache padrão retornou 401. Não afirmar autenticação bem-sucedida. Fontes e cache locais ignorados; nenhum FBX novo deve entrar no Git.

Status artístico/humano não é resultado de teste numérico. Download não significa conversão; conversão não significa preview, aprovação ou binding de gameplay.
