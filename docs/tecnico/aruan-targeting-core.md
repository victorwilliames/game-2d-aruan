# Motor de alvos — Missão 02 / #86

Motor criado em `codex/targeting-core`, base `bae71f1`. Esta continuação integra alvo automático ao jogo sobre a Missão 01 (`f91832c`); consulte o Git/PR para o estado de publicação.

Para testar: aproxime-se de um boneco; o ponto branco aparece automaticamente. O stick direito troca de alvo; **R3** torna o ponto vermelho e fixa o hard lock. Aperte R3 novamente para voltar ao branco. Ande com o stick esquerdo enquanto o corpo acompanha o alvo; ataque com X. Sem inimigos próximos, o stick direito orienta a mira livre. No teclado, **L** alterna o hard lock e WASD move. O campo mantém seus dois bonecos; testes usam um terceiro apenas em memória.

Integração: `main.js` injeta candidatos vivos e visibilidade aproximada pelos círculos de colisão dos props sólidos. O alvo escolhido orienta combate, defesa, parry e golpes; a direção em mundo está em `Player.combatDirection`. A transição distribui rotação limitada entre tronco e cabeça em V1 e nos ossos Mixamo, enquanto o movimento e a direção da esquiva usam o stick esquerdo. A mira livre transforma o stick direito pela projeção isométrica e mantém a última direção por 0,65 s. Não há retícula artificial. A câmera e as regras de ações seguem autoritativas; LOS, animação lateral e game feel precisam da avaliação do autor e da futura integração de inimigos.

## Contrato

`js/targeting.js` expõe `globalThis.AruanTargeting` no navegador e o mesmo objeto via CommonJS. Sem imports, dependências, DOM, câmera, Gamepad API, HUD ou tipo específico de inimigo.

```js
const targeting = AruanTargeting.create({}, {
  getId: enemy => enemy.id,                    // string ou número estável, único
  getPosition: enemy => [enemy.x, enemy.y],    // chão, coordenadas de MUNDO
  isAlive: enemy => enemy.hp > 0,
  isValid: enemy => enemy.targetable === true,
  hasLineOfSight: (origin, position, enemy, frame) =>
    worldQuery.canSee(origin, position, enemy) // consulta fornecida pelo integrador
});

// Exemplo simplificado do contrato; a integração real está em main.js:
const frame = {
  origin: [player.x, player.y],
  facing: [Math.cos(player.facing), Math.sin(player.facing)],
  aim: aimWorld,                      // opcional; preserva magnitude do stick
  attackDirection: attackWorld,       // opcional; direção planejada do golpe
  targets: currentTargetables         // array atualizado de TODOS os candidatos
};
const state = targeting.update(1 / 120, frame, {
  toggleLock: r3Pressed,              // BORDA de pressionamento, nunca held
  switchVector: rightStickWorld       // todo passo; [0,0] quando neutro
});
// Apenas depois de um acerto/interação real decidido pelo combate:
targeting.recordCombat(hitEnemyId);
// Consumidores futuros: state.locked.direction, .position, .distance;
// state.suggested; state.assist.direction e .correctionAngle.
```

O adaptador deve converter os eixos de tela/stick para o mesmo plano x/y de mundo usado pelas posições. `origin`, `facing`, `aim`, `attackDirection` e `switchVector` usam os dois primeiros componentes; z não participa. Vetor zero de mira/golpe significa ausência de intenção, mas `facing` precisa ser não nulo. IDs não são índices temporários do array. Ausência no array significa remoção do mundo e perde o lock imediatamente; occlusão deve manter o alvo no array e retornar false na consulta de visibilidade.

Defaults de alvo: `{id, position:[x,y], alive, valid}`; `alive`/`valid` só excluem quando false. A visibilidade padrão é true para mundos sem obstáculos; **para o campo real, injetar a consulta correta**. Não existe raycast novo neste módulo. Callbacks são síncronos, sem efeitos colaterais; visibilidade retorna boolean true para permitir aquisição. Exceções do provedor propagam ao chamador. Alvo com posição não finita é ignorado, IDs ausentes/duplicados e configuração/frame inválidos geram erro explícito.

## Operações

| API da instância | Efeito |
|---|---|
| `acquire(frame)` | Melhor candidato soft, sem alterar estado. |
| `updateSuggestion(frame)` | Atualiza sugestão/persistência, sem avançar relógio. |
| `update(dt, frame, input={})` | Avança relógio em segundos, poda histórico, valida lock, atualiza sugestão, processa toggle OU troca. Chamar uma vez por passo lógico; dt=0 em pausa. |
| `toggleHardLock(frame)` | Destrava ou adquire sugestão válida; se não houver sugestão, busca no alcance/cone de aquisição hard. |
| `unlock(reason='manual')` | Limpa hard lock; mantém sugestão independente. |
| `switchTarget(frame, vector)` | Mesma proteção de gesto/debounce da atualização, sem avançar tempo. |
| `validate(frame)` | Valida lock sem avançar tempo; para contar oclusão usar `update`. |
| `recordCombat(id)` | Registra evento recente no tempo da simulação. |
| `query(frame, id?)` | Posição, direção normalizada, distância e visibilidade; padrão lock ou sugestão. |
| `snapshot(frame)` | Consulta sem mutação. Atualizar/validar antes de consumir perdas de lock. |
| `reset()` | Limpa lock, sugestão, histórico, relógio e gesto; usar em reset/troca de cena. |

Snapshots são cópias congeladas, sem referências a inimigos: `{mode:'free'|'soft'|'hard', suggested, locked, selected, assist, occludedSeconds, lossReason, time}`; `selected` prioriza o alvo hard. Alvos incluem `{id, position, direction, distance, visible, score}`; score só existe numericamente em candidatos classificados. `lossReason` guarda a última perda (`manual`, `missing`, `invalid-or-dead`, `range`, `visibility`, ou motivo explícito); aquisição hard limpa-o. Vetor de alvo coincidente usa facing como direção estável, distância zero.

## Seleção e proteções

1. Exclui inválidos/mortos, fora do alcance/cone ou sem linha de visão. Cone é **meio ângulo** em radianos. O jogo configura cone de 180° e prioriza distância para aquisição automática; o motor suporta outras configurações.
2. Score = distância normalizada + cosseno com facing + cosseno com mira + cosseno com golpe + histórico com decaimento linear + bônus de persistência. Cada termo tem peso configurável; ausência de mira/golpe remove seu termo. Empates: distância e chave estável do ID (tipo+número/string), independentes da ordem do array.
3. Mantém sugestão elegível pelo período mínimo/margem de melhoria. Com `softManualSwitch:1`, gesto deliberado seleciona outro alvo branco e mantém a escolha até ela se tornar inválida, inclusive após retornar do hard lock.
4. Assistência só retorna uma direção corrigida quando o alvo está dentro do cone de assistência em relação à intenção base (mira > golpe > facing). Multiplica ângulo por força e limita correção; fora do cone retorna a intenção original. Não escreve orientação, movimento ou golpe. O integrador decide quando aplicar; em hard lock deve consumir `locked` para órbita futura.
5. Hard lock não troca porque a sugestão mudou nem porque o jogador virou. Morreu/sumiu/invalidou/saiu do alcance de liberação: destrava imediatamente. Oclusão conta tempo contínuo e tem tolerância; voltou a enxergar, zera contador. Após perda não adquire outro hard lock automaticamente.
6. Troca usa deslocamento **do alvo atual ao candidato**, projetado contra o vetor manual em mundo. Classifica alinhamento (peso 2) menos separação normalizada. Exige candidato vivo/visível dentro de alcance hard de aquisição e cone de troca. Não exige cone de facing durante hard lock.
7. Ativação hard desarma troca até neutro. Gesto exige magnitude ≥ threshold; só rearma ≤ release threshold. Um gesto é consumido mesmo sem candidato ou durante debounce; manter inclinado nunca repete. Input omitido equivale a neutro. Após perda de foco/modal, o adaptador também deve exigir neutro real antes de voltar a enviar eventos.

## Configuração (opções passadas a `create`; defaults exportados)

| Grupo | Defaults |
|---|---|
| Alcance em unidades do mundo (≈cm) | `softRange:350`, `hardAcquireRange:450`, `hardReleaseRange:600` |
| Cones de aquisição | `softAngle:75°`, `hardAcquireAngle:100°` (API usa radianos) |
| Intenção | `aimDeadzone:.25` |
| Pesos | `distanceWeight:1`, `facingWeight:.8`, `aimWeight:3`, `attackWeight:.9`, `recentWeight:.65` |
| Histórico/persistência | `recentSeconds:2`, `persistenceBonus:.25`, `switchMargin:.15`, `minSuggestionSeconds:.18` |
| Correção | `assistStrength:.35`, `assistCone:35°`, `maxAssistAngle:8°`, `maxManualAssistAngle:3°` |
| Perda de visibilidade | `losGraceSeconds:.4` |
| Troca deliberada | `switchThreshold:.72`, `switchReleaseThreshold:.3`, `switchDebounceSeconds:.25`, `switchCone:65°` |
| Seleção manual soft | `softManualSwitch:0` no motor; `1` no jogo |

Todos são parâmetros iniciais do ARUAN, sem alegação de equivalência aos jogos de referência. Sem aleatoriedade ou relógio de parede. Complexidade por atualização O(n log n), memória O(n + eventos recentes); não há lista fixa de inimigos. Não foi certificado orçamento de CPU nem game feel.

## Referências verificadas em 26/10/2026

- [Elden Ring — guia oficial Bandai Namco](https://en.bandainamcoent.eu/elden-ring/news/elden-ring-starter-guide-tips-know-playing-the-game): R3/R para lock/remove e right stick para troca. É a referência confirmada para o evento pedido pelo autor; nenhum threshold interno foi publicado nessa fonte.
- [The Witcher 3 — manual oficial PC, p.4](https://cdn-l-thewitcher.cdprojektred.com/media/TW3/Pdf/Manuals/PC/The_Witcher_3_Wild_Hunt_Game_Manual_PC_EN.pdf): lock em Z no teclado. Não foi inferido que o esquema de troca seja idêntico a Elden Ring.
- [No Rest for the Wicked — notas oficiais The Breach Refined](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212): melhoria de targeting, troca durante antecipação de ataque e correção de hard lock persistindo longe demais. Motivam atualização independente do estado de animação e alcance de liberação; não fornecem pesos/controles completos.
- [Dark Souls Remastered — página oficial/manual](https://en.bandainamcoent.eu/dark-souls/dark-souls-remastered): link de manual Xbox encontrado, destino indisponível no navegador de pesquisa. Nenhuma regra específica de controles foi consolidada a partir desse manual; a inspiração não é certificação de paridade. Não usamos relatos de jogadores como especificação.

## Verificação e limites

`npm run test:targeting` (também incluído em `npm test`): 20 cenários executando o motor real, 1.200 passos anti-oscilação, 1.000 passos de drift, 302 ângulos de assistência. Cobre um/três/zero inimigos, mira, golpe, histórico/expiração, trás, callbacks/visibilidade, morte/remoção, alcance, toggle, troca intencional/neutralidade/debounce/histerese, oclusão temporária/contínua, snapshots/IDs/adaptadores/export global em VM sem DOM, reset e entradas inválidas. Timeout de visibilidade comparado em 120Hz, 60Hz e passos variáveis.

`npm test` antes/depois verde (5 hashes, 10.552 poses, 329 JPEGs; suíte nova incluída no pós). Smoke Chrome headless `node tests/headless.cjs --smoke --studio-only`: duas páginas, sete animações, oito direções, zero erros de console/rede, nenhuma captura nova. O primeiro lançamento foi bloqueado no crash handler pelo sandbox; execução autorizada fora dele passou e limpou seus processos. Nenhum servidor herdado reiniciado. Não houve mudança visual, por isso não foi criada captura duplicada. CI remota desta branch não foi executada: workflow atual só dispara por push na master.

Na consolidação autoral, `tests/browser-targeting.js` cobre três alvos em fixture, marcadores branco/vermelho por pixels, mira livre sem retícula, troca e persistência, perda, A/B, defesa/parry e golpe sem acerto garantido. Em ambos os rigs, a cabeça se aproxima da direção alvo durante a transição; o ensaio de apoio mediu erro de osso e deslizamento abaixo de 2e-14. Capturas 075 revisadas. Hardware Xbox e aceite visual/jogável permanecem pendentes; módulos de runas não foram modificados.
