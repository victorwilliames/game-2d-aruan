# Continuidade imediata — MovaLab → jogo

Checkpoint de 25/10/2026, solicitado pelo autor antes do limite de uso. Ler `AGENTS.md` e `memory-ai.md` antes de alterar. Não recomeçar o projeto.

## Publicado e disponível

- `225423a`: primeira integração de animações externas ao jogo; quatro etapas no MovaLab, gatilhos/conflitos, persistência e modo leve básico.
- `b399b63`: corrige guard histórico do CI, que ainda proibia o player no jogo. A nova autorização permite JSONs aplicados explicitamente, sem Three/FBX no gameplay.
- CI de `b399b63`: [40209288739](https://github.com/victorwilliames/game-2d-aruan/actions/runs/40209288739), **em execução na consulta deste checkpoint**. Verificar conclusão; não declarar verde sem consultar. CI anterior40209038233 falhou no guard antigo, após passar Lab/legados.
- `master` sincronizada com origin; nenhum force push. Issue #67/P0 e Project #2 atualizados; #61/#66/#67 continuam abertas. Gates físicos3/17/18/19/22 preservados.
- Servidores deixados ligados a pedido do autor: jogo5317 e MovaLab5320. Processos que iniciamos: jogoPID15560, MovaLabPID19372; conferir comando/identidade antes de encerrar, pois PIDs podem ser reutilizados. Não abrir navegador visível por automação.

## Fluxo que o autor deve usar agora

1. Recarregar o MovaLab em `http://127.0.0.1:5320/`.
2. Escolher animação/personagem e conferir/converter no Canvas.
3. Avançar para gatilho; escolher parado, andar, correr ou ação por tecla. A sugestão vem do nome. Espaço conflita com cambalhota e exige trocar tecla ou confirmar substituição. Vínculos existentes também exigem resolução.
4. **Aplicar no jogo**, depois abrir/recarregar `http://127.0.0.1:5317/`. A etapa4 fica bloqueada antes da aplicação. Não há etapa obrigatória no `inspecao.html`.

**A configuração versionada inicia vazia.** Até o autor aplicar, o jogo continua usando as animações originais. Não dizer que abrir o jogo por si só já ativa Mixamo. `tools/movalab/workspace/game-bindings.json` guarda os vínculos; clipes ficam em `exports/`, com índice/hash em `clips.json`. Aplicações do usuário podem criar mudanças locais: preservar, não sobrescrever nem restaurar arquivos indiscriminadamente.

## O que foi verificado

- `npm test` antes/depois:10.552poses; cinco hashes canônicosLF e blobsHEAD intactos.
- `node tools/movalab/tests/game-bindings.cjs`: persistência,409, substituição explícita, teclas/caminhos/hash inválidos e restauração.
- `node tools/movalab/tests/app.cjs`: API em workspace temporário.
- Chromeheadless Lab/publicação: fonte3D limpa, banco/recorte/perfil, Space, etapa4 e qualidade; previewError0/pristineError1,90e-14.
- `npm run test:browser`: regressão V1 completa verde, sem erros de console/rede.
- `node tests/headless.cjs --smoke --movalab-game-only`: idle/andar/correr reais, oito direções de movimento, F/Space; erroossos≤1,82e-13, clamp pés≤1,07e-14.
- `node tests/headless.cjs --smoke --clip-only`: fallback/configuração vazia, importação histórica e transições verdes após corrigir o guard.
- Capturas053/054 inspecionadas;311JPEGs técnicos. Nenhuma certificação artística/física/200FPS.

## Limites que não devem ser escondidos

- O controlador continua dono da translação no mundo; não somar root motion doFBX novamente. FootPlant existente mantém os apoios. Teste novo mede ossos/alcance; não equivale a aceite visual nem mede todo deslizamento perceptual.
- Gatilho de ação reproduz a animação no estado de movimento; não cria física de pulo, dano, acertos, skills ou cadeias. Combate/dodge originais são preservados quando não substituídos. Não vender isso como mecânica completa.
- Fade inicial0,18s usa pose de origem congelada; evolução para continuidade de velocidade/fase e sincronização com velocidade de locomoção ainda merece trabalho. Não confundir com as transições mais completas do estúdio histórico.
- Modo leve básico: semMSAA/sombras3D, DPR1; melhorias habilitam sombras/atéDPR2. Não há LOD/decimação automática. Meta200FPS exige medição em tela/hardware adequados e otimização; não prometer resultado.
- Roll/landing, dedos Canvas, hierarquia/transições completas e calibração de equipamento continuam pendentes. Não substituir renderer nem alterar cenário.
- A inspeção antiga foi retirada do fluxo/link principal, mas permanece como ferramenta histórica de regressão. Não gastar a prioridade atual redesenhando-a.

## Próximo trabalho

1. Consultar CI40209288739 e corrigir eventual falha real. Evitar repetir baterias verdes sem mudança/risco novo.
2. Receber avaliação do autor no novo fluxo e corrigir problemas de animação/ativação; foco atual é movimento natural, não arte.
3. Melhorar sincronização/transições e condições de ativação; separar animação de mecânica de jogo ao planejar salto/skills.
4. Medir e otimizar pintura/geometria; seguir #67/P0 e checklist completo. Sem criar nova sprint/view.

Ao finalizar outro marco: atualizar última sessão e registro append-only, checklist, issue/board, testes pertinentes, commit e push. A missão MovaLab1.0 não está concluída.
