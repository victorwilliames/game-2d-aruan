# Catálogo DEV e API para agentes

O jogo local aceita `/?dev=1`. O botão **DEV · Animações** abre o catálogo do serviço MovaLab (`http://127.0.0.1:5320` por padrão). Para outro servidor próprio, use `?dev=1&movalab=http://127.0.0.1:PORTA`. Somente HTTP loopback sem credenciais/path adicional é aceito. Fora de DEV local não há botão nem consulta ao catálogo. As fontes FBX continuam fora do Git/build; o painel solicita60 registros por página e somente o JSON preparado selecionado.

A janela pausa a simulação e suspende/limpa o input. O preview usa o mesmo `drawCharacter`/rig Canvas, em iframe separado do estado de combate; dano/stamina/hitboxes não são executados. Fechar restaura a pausa anterior e o foco. Busca EN/PT-BR, categoria/estado/favoritos, preparo offline, falhas, pausa/velocidade/direção/loop/scrub/ossos reutilizam os serviços e preview existentes. O loop é repetição da prévia, sem certificar costura do clipe.

API JSON no serviço local, sem acesso por origem externa:

| Operação | Rota |
|---|---|
| list/search | `GET /api/mixamo/catalog?q=giro&category=Ataques&state=canvas-preview&limit=60&offset=0` |
| inspect | `GET /api/mixamo/motions/ID` |
| prepare | `POST /api/mixamo/prepare` com `{ "id": "ID", "loop": false }`; acompanhar `GET /api/mixamo/jobs/KEY` |
| validate | `GET /api/mixamo/motions/ID/validate`; verifica integridade agora, resultado numérico registrado no preparo |
| preview | `GET /api/mixamo/motions/ID/prepared`; JSON Canvas, sem FBX/Three no jogo |
| favorite | `PATCH /api/motions/ID` com `{ "favorite": true }` |
| assign | `POST /api/mixamo/assign` com `{ "id": "ID", "slot": "action", "key": "KeyC", "pad": "PadY" }` |
| assignments | `GET /api/mixamo/assignments` |

`assign` nesta etapa grava **rascunho DEV** em `library.json → externalSources.mixamo.assignments`: fonte/hash/cache/slot/gatilho e flags de aprovação falsas. Não altera `game-bindings.json`/exports nem instala a animação. A publicação em gameplay e timelines autoritativas é #83. Exige cache tecnicamente válido; rejeita conflitos existentes e gatilhos reservados da Sprint8. Ações usam C/Z/X e opcional Y; locomoção usa idle/walk/run sem tecla. Repetir exatamente o mesmo rascunho é idempotente. Nenhum nome de clipe certifica papel de gameplay ou qualidade visual.

CLI existente: `node tools/movalab/scripts/mixamo.cjs list|search|inspect|prepare|validate|preview ... --root RAIZ`. Atribuição explícita: `node tools/movalab/scripts/mixamo.cjs assign ID --slot action --key KeyC --service http://127.0.0.1:5320`. A escrita passa pela API serializada do serviço; nenhuma outra operação exige servidor. Sem downloads/instalações implícitas.

Teste real com banco existente: `MOVALAB_DEV=1 MOVALAB_MIXAMO_ROOT=RAIZ node tools/movalab/tests/browser3d.cjs` (adaptar variáveis ao shell). CI usa `MOVALAB_DEV_GATE_ONLY=1` para verificar portão DEV/pausa sem exigir fontes ignoradas. Testes API usam bytes gerados e não certificam FBX. Testes físicos/arte permanecem pendentes.

O input possui trava modal explícita: Menu/View do gamepad não retiram a pausa nem ativam ações durante a janela; exige neutro após fechar. Teste simula Menu e verifica WASD depois de fechar. `assign` também foi exercitado pela CLI, idempotente e sem criar `game-bindings.json` no workspace temporário.

Medições locais: primeiro catálogo variou de1,76s a42,2s noChrome; na última execução o servidor respondeu em489ms e os headers chegaram em493ms, mas o evento de resposta no navegador só chegou depois. Buscas e cache após aquecimento foram rápidos. `Server-Timing` cobre indexação/filtros/busca; fases da rede estão no relatório. A demora restante no pipeline do Chrome continua como QA de desempenho #83; não certificar carregamento frio instantâneo/FPS. Fontes+checkout alocaram1.939.025.752bytes emNTFS após encerrar os processos próprios (storage-after-dev.json), abaixo do teto10GB; nenhuma transferência externa nova.
