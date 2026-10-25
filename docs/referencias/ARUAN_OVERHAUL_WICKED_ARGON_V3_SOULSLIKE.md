# ARUAN | OVERHAUL DE CONTROLE, COMBATE, ANIMAÇÕES E GAME FEEL

**Prompt executável para o agente Argon / Antigravity — V3: GAME FEEL TOTAL + SISTEMA DE COMBATE SOULSLIKE**  
**Referência principal:** *No Rest for the Wicked* (Moon Studios), com princípios de *Dark Souls*: combate soulslike de tempo, postura, leitura do inimigo, defesa e contra-ataque. Atenção às melhorias da atualização *Together* (2026).  
**Projeto de destino:** `D:\.GITHUB\games\game-2d-aruan`  
**Banco de animações prioritário:** `D:\.GITHUB\games\game-2d-aruan\tools\movalab`  
**Prazo solicitado:** sprint de **30 minutos** para uma versão jogável e demonstrável. Não confundir esse timebox com uma garantia de reconstrução integral de um ARPG comercial.

> **ARGON, EXECUTE.** Este documento não é pedido de brainstorm, relatório hipotético, refatoração cosmética ou criação de projeto novo. Abra o jogo Aruan existente, investigue a implementação atual, edite o código real, aproveite o MovaLab, rode/teste e entregue um overhaul funcional de controle, locomoção, combate, transições de animação, feedback audiovisual e HUD. Preserve a identidade do Aruan, seu cenário, seu visual 2D/2.5D, o arco utilizado como porrete e as funcionalidades que já estão funcionando. Não troque a engine ou reescreva o projeto inteiro sem necessidade.

---

## 0. MISSÃO: O RESULTADO QUE EU QUERO SEGURANDO O CONTROLE

O Aruan precisa ter o **peso, fluidez, leitura, agressividade e resposta tátil** de *No Rest for the Wicked*, com **gramática de combate soulslike** no estilo *Dark Souls*: esquivar no timing, bloquear, acertar parry, gerenciar stamina, quebrar postura e punir aberturas.

**Cenário obrigatório de aceitação:** movo o analógico, o personagem anda na direção correta; acelero para correr; aperto ataque três vezes e ele encadeia três golpes DIFERENTES, sem reiniciar o mesmo golpe; durante o segundo golpe decido esquivar para trás: **a esquiva tem prioridade e ocorre assim que a janela de interrupção permitir, sem esperar o combo inteiro acabar**. Saio da esquiva e já posso atacar, correr, virar de direção, defender ou iniciar uma habilidade conforme regras explícitas. Se o golpe conecta, o inimigo responde com hit reaction, dano, impulso, efeitos, som e vibração. Se erra, nada de vibração de impacto ou hitstop de acerto. O personagem nunca fica congelado esperando uma animação acabar sem motivo.

**Prioridade número 1: game feel + núcleo soulslike verdadeiro (dodge com i-frames, block, parry, stamina e IA de ataques) > quantidade de mecânicas > quantidade de animações > decoração de interface.**

**ATUALIZAÇÃO CRÍTICA DE CONTROLE:** a esquiva NÃO é a única ação prioritária. Todos os comandos de movimento/direção, ataque, defesa, parry, sprint, habilidades, travessia e interação precisam ser amostrados continuamente, resolvidos por regras contextuais e transicionados sem travas desnecessárias. As seções **4.6–4.14** e **7A.1–7A.12** são os contratos centrais de sensação e combate soulslike nas mãos do jogador. Não sacrificar *game feel* apenas para terminar um clip bonito, nem eliminar o peso permitindo cancelamento absurdo em todos os frames.

Critérios inegociáveis:

1. Entrada em controle e teclado confiável; nenhum comando de ataque ou esquiva perdido silenciosamente.
2. Combos encadeados, cancelamento de recuperação e mistura suave entre golpes e movimentos.
3. **Movimento, esquiva, mudança de direção, defesa, contra-ataque, habilidades e ataque responsivos**, cada qual com prioridade e cancelamento contextual; liberdade direcional real em 360°.
4. Ataques produzem contato convincente: alcance, janela de hit, reação e recuperação sincronizados com o movimento da arma.
5. Sem teleportes, travamento de direção, T-pose, pose congelada ou animações duplicadas competindo pelo esqueleto/sprite.
6. Haptics no controle quando suportados, desativáveis e com fallback silencioso quando não disponíveis.
7. Projeto existente permanece executável; entregar alterações integradas, não uma demonstração isolada.
8. O combate é **SOULSLIKE COMPLETO**, não um combo arcade com esquiva decorativa: block direcional, parry com timing e falha punida, i-frames reais, guard break, poise, stamina, telegraphs inimigos e punição/contra-ataque precisam funcionar de verdade, conforme seção 7A.

**Importante sobre fidelidade:** reproduzir os **princípios jogáveis, ritmos, categorias de movimento e arquitetura visual** do Wicked com implementação e recursos próprios do Aruan. Não importar arquivos, música, UI artística, modelos ou animações proprietárias do Wicked. Para conseguir esquiva ainda mais responsiva que a original, adotar intencionalmente cancelamentos extras: isso é uma melhoria projetada para o Aruan, NÃO uma alegação de que o Wicked original deixa cancelar qualquer golpe a qualquer momento.

---

## 1. PRIMEIROS 4 MINUTOS: AUDITORIA OBRIGATÓRIA DO PROJETO

Antes de escrever código:

- Abra o diretório do jogo real e examine `package.json`, ponto de entrada, estrutura de pastas, engine/framework, loop de jogo, renderizador, física, controller do Aruan, sistema de animações, input/gamepad, câmera, HUD, inimigos e assets.
- Descubra se o personagem usa spritesheets 2D, skeletal 2D, Spine/Rive, modelo 3D, Three.js, Babylon, Canvas/WebGL, custom engine ou combinação. **Nunca presuma um formato de animação.**
- Faça inventário automático e legível de `tools/movalab`: nomes, extensões, dimensões, FPS quando disponível, número de frames/clipes, metadados, licenças, rigs e direção das animações.
- Procure no projeto por implementações já existentes de `attack`, `dodge`, `roll`, `sprint`, `hit`, `stamina`, `combo`, `animation`, `vibration`, `gamepad` etc. Reutilize o que funciona e elimine só conflitos/duplicações.
- Identifique o personagem Aruan, a arma atual, inimigos de treino e a cena de testes. **Não substitua a identidade do Aruan por um guerreiro genérico.** Para golpes corpo a corpo com o arco como porrete, ele deve **segurar numa extremidade do arco, como uma espada ou bastão de pancada**, jamais segurando no meio.
- Confira qual gerenciador de pacotes é usado. Execute o build inicial se couber no timebox. Proteja qualquer alteração destrutiva e não apague assets.
- Descubra o padrão de direção e unidades de mundo. Toda movimentação e hitbox deve funcionar na projeção atual 2D/2.5D/isométrica. Não mude para jogo 3D real só porque Wicked usa 3D.

Produza internamente uma tabela `ação desejada → asset MovaLab encontrado → formato compatível? → integração → fallback`. Não fique travado analisando; após a auditoria, implemente.

**Ordem obrigatória para recursos:** (1) animações existentes do Aruan e MovaLab, (2) bibliotecas/fontes externas autorizadas, gratuitas ou compatíveis COM LICENÇA conferida, (3) procedural como último fallback. Nenhum download de asset proprietário, nenhuma dependência pesada instalada sem necessidade. Se usar recurso externo, registrar URL e licença em `docs/animation-sources.md`.

---

## 2. ANÁLISE DE REFERÊNCIA: O QUE DEFINE O FEEL DE NO REST FOR THE WICKED

### 2.1 Fatos de jogabilidade documentados

- Perspectiva isométrica/oblíqua, personagem móvel em várias direções, direção de golpe legível, cenário com desníveis e travessia contextual.
- Ataque principal que pode virar **ataque carregado ao segurar**, combos específicos de arma, ataques de corrida, pós-esquiva, golpes críticos e runas/habilidades.
- O jogo valoriza **stamina**, posicionamento, antecipação e timings de ataque, parry e dodge. **Focus** alimenta habilidades/runes; habilidades podem usar recursos diferentes dependendo da runa.
- Peso de equipamento muda a esquiva: **carga leve = quickstep**, **carga normal = rolamento**, **carga pesada = rolamento mais lento** e possibilidade de *shoulder barge*.
- Não tem botão universal de salto livre como plataforma tradicional: saltos em lacunas ocorrem em travessia contextual/corrida, e escalar certos obstáculos é contextual.
- Estão documentados ataques em corrida, ataques após esquiva/rolamento, carregados, quebra de postura/poise, backstabs, parry, defesa, reações a golpes e diferentes famílias de armas.
- A atualização *Together* de **22 de janeiro de 2026** ajustou enfileiramento de combos, regeneração básica de stamina, animações de bloqueio/impacto, canalização/cura e outros sistemas; o hotfix de **10 de abril de 2026** ajustou efeitos de parry/crítico e penalidade de parry falho.
- A configuração e os bindings de controles variaram com atualizações. **Não use um guia não oficial que confunda Y com ataque pesado e B com dodge como verdade universal**; o preset clássico abaixo se baseia em guias que fotografaram a tela dos controles. A lógica interna do Aruan deverá ser totalmente remapeável.

### 2.2 Interpretação técnica, NÃO código interno comprovado da Moon Studios

Os seguintes mecanismos são uma **engenharia reversa conceitual para recriar a sensação**, não alegações sobre o código-fonte real do Wicked:

- Motor de locomoção separado de *intentions/actions*.
- Máquina de estados hierárquica ou behavior graph combinada com camadas de animação.
- Blending curto para locomotion e transições de combate.
- Metadados por animação: *startup*, *active/hit frames*, *recovery*, janelas de combo e de cancelamento.
- Input buffer intencional e curto, com limpeza de comandos obsoletos.
- Seleção contextual de animações por arma, ação, direção, velocidade e situação.
- Hitstop, antecipação de golpe, inércia controlada, impactos, stagger, audiovisual e rumble.
- Alvo assistido levemente para evitar ataques frustrantes, sem auto-teleporte ou travamento excessivo.

**Diferença fundamental:** Wicked usa comprometimento com certos ataques, e há relatos de jogadores sobre esquiva atrasada após animações. O requisito do Aruan é **mais responsivo do que o Wicked nesses casos**: manter peso visual, mas não prender o jogador em recuperação desnecessária.

---

## 3. MAPEAMENTO DE CONTROLE: XBOX / PLAYSTATION / TECLADO

### 3.1 Referência histórica documentada do Wicked (layout gamepad clássico, 2024)

| Ação | Xbox | PlayStation |
|---|---|---|
| Direcionar personagem | Analógico esquerdo | Analógico esquerdo |
| Esquivar | **A (toque)** | **X/Cruz (toque)** |
| Sprint | **A (segurar)** | **X/Cruz (segurar)** |
| Atacar | **X (toque)** | **Quadrado (toque)** |
| Ataque carregado | **X (segurar)** | **Quadrado (segurar)** |
| Interagir | **Y** | **Triângulo** |
| Parry | **LT** | **L2** |
| Runa/mão principal | **RB** | **R1** |
| Alternar/usar offhand conforme modo | **LB** | **L1** |
| Consumir comida / seletor | D-pad cima / segurar | D-pad cima / segurar |
| Item rápido / seletor | D-pad baixo / segurar | D-pad baixo / segurar |
| Alternar arma/mão principal | D-pad direita | D-pad direita |
| Alternar offhand | D-pad esquerda | D-pad esquerda |
| Agachar/furtividade | L3 | L3 |
| Voltar/cancelar em menus | B | Círculo |
| Menu geral | Menu | Options |
| Atalho mapa/gestos | Conforme versão/binding | Conforme versão/binding |

A referência acima é **histórica e mutável**. O Wicked de 2026 introduziu revisões em gamepad/controles, toggle-run e remapeamento. Há layouts experimentais com **LB = toque parry / segurar block**, e configurações alteráveis. NÃO congelar o Aruan em um suposto único layout oficial atemporal.

### 3.2 Implementação obrigatória no Aruan: DOIS presets

**Preset A: `ARUAN_FLUIDO` (selecionado por padrão)**, privilegiando resposta imediata:

| Ação | Xbox | PlayStation | Teclado/mouse |
|---|---|---|---|
| Mover 360° | Stick esquerdo | Stick esquerdo | WASD |
| Andar suave | Inclinar pouco | Inclinar pouco | Shift modificador opcional / analógico |
| Correr | Stick forte / locomoção normal | Stick forte | WASD |
| Sprint | **L3 segurar / toggle configurável** | **L3** | Shift |
| Esquiva/quickstep/roll | **A ao pressionar** | **Cruz** | Espaço |
| Ataque leve / combo | **X** | **Quadrado** | Clique esquerdo |
| Ataque carregado | **Segurar X** | **Segurar Quadrado** | Segurar clique esquerdo |
| Interagir | **Y** | **Triângulo** | E |
| Parry | **LT toque** | **L2 toque** | Q |
| Defender com escudo/offhand | **LB segurar**, se equipado | **L1 segurar** | Clique direito segurar |
| Habilidade / runa ativa | **RB** | **R1** | R |
| Selecionar habilidades | **RT + X/Y/B/A** | **R2 + face buttons** | 1-4 |
| Travar alvo | **R3** | **R3** | Tab ou clique do meio |
| Trocar alvo | Stick direito com lock | Stick direito com lock | Mouse/rodinha |
| Furtividade | D-pad esquerda segurado, remapeável | Idem | C |
| Consumir cura | D-pad cima | Idem | F |
| Item rápido | D-pad baixo | Idem | G |
| Trocar arma | D-pad direita | Idem | Z |
| Menu/Inventário | Menu | Options | Esc / I |
| Mapa | View | Touchpad | M |
| Pulo em borda/escala | Contextual | Contextual | Contextual |

**Preset B: `WICKED_CLASSIC`**, baseado no layout histórico:

- **A toque = esquiva; A segurar = sprint**; **X toque = ataque; X segurar = carregar**; Y = interagir; LT = parry; LB/RB = offhand/runa; demais ações mapeadas como na tabela histórica.
- **Questão técnica inevitável:** se toque e segurar usam o MESMO botão, o motor não consegue saber no primeiro milissegundo se ele será solto ou mantido. NÃO invente uma falsa promessa de esquiva instantânea perfeita nesse preset. Resolver com limiar curto configurável (`tapHoldThresholdMs`: inicial 90-120 ms), transições preditivas discretas e indicador debug de latência. A opção default **ARUAN_FLUIDO** evita essa ambiguidade separando sprint e dodge.
- Em qualquer preset, permitir trocar botões e salvar configurações no armazenamento que o projeto já utiliza. Exibir ícones corretos Xbox/PlayStation e teclado. Preservar keyboard/mouse.

**Se o projeto já tem controle funcional diferente, não destrua às cegas**: crie adaptador de bindings, mantenha compatibilidade e disponibilize o novo preset. Não usar B para esquiva como se fosse o esquema clássico verificado.

### 3.3 Regras de entrada de input

- Ler `Gamepad API` uma vez por frame no loop certo, usar `gamepadconnected`/`gamepaddisconnected`, lidar com vários pads e pad preferido, mapeamento `standard` e variações.
- Eixos analógicos: zona morta radial inicial `0.14` (configurável), magnitude normalizada, curva opcional e `snap` leve para 8 direções APENAS se a implementação do sprite exigir.
- Capturar `pressed`, `released`, `held`, `holdDuration`, `directionAtPress`, *timestamp*, intensidade analógica e origem (teclado/pad).
- Evitar duplicar input por leitura no React render ou registrar eventos em todo frame.
- Foco da janela, reconexão, perda de foco, gamepad desconectado, menus abertos e troca teclado↔controle devem limpar *held states* para evitar corrida ou golpe preso.
- Input buffer curto, por ação; pressionei esquiva durante o golpe → **registrar intenção mesmo quando a transição ainda não é permitida** e consumir na primeira janela válida. **Esquiva substitui ataque pendente**, não vai para trás de uma fila de 3 ataques.
- Inputs para combos devem ser por **bordas de botão (`justPressed`)**, não por `held` repetido; segurar X significa charge e não spam infinito de combos.

---

## 4. ARQUITETURA DE ESTADOS: NADA DE `if (isAttacking) return` GLOBAL

O anti-padrão que precisa desaparecer:

```ts
if (player.isAttacking || player.isRolling) return; // ERRADO como bloqueio geral de input
```

Isso mata o game feel. Substituir por **arbitragem de ações centralizada**, com entrada contínua independente da ação/clip.

### 4.1 Camadas lógicas

1. **InputRouter**: teclado, mouse, gamepad → intenções sem dependência do personagem.
2. **ActionResolver**: contexto, prioridade, stamina, cooldown, estados, buffer e decisão do que iniciar.
3. **CharacterMotor**: velocidade, aceleração, direção, colisão, deslocamento, dash, gravidade/elevação quando aplicável.
4. **CombatSystem**: timeline, recursos, hitboxes, hurtboxes, hit confirmation, target assist, poise, críticos e dano.
5. **AnimationController**: nomes de clips, subestados, camadas, blend, root motion opcional, eventos e fallback procedural.
6. **CameraDirector**: seguimento suave, enquadramento, inclinação/isometria existente, zoom e lock.
7. **FeedbackBus**: hitstop, partículas, trails, som, câmera, haptics e HUD.
8. **HUD/ViewModel**: estado do jogo, números e feedback, sem decidir combate.

Pode adaptar nomes e arquivos à arquitetura REAL existente. Não introduzir abstrações vazias/boilerplate por esporte.

### 4.2 Estados principais

```text
Locomotion:
  IDLE, START_WALK, WALK, RUN, SPRINT, BRAKE, TURN, STRAFE,
  SNEAK, LEDGE_APPROACH, AUTO_JUMP, FALL, LAND, CLIMB

Combat actions:
  ATTACK_LIGHT_1, ATTACK_LIGHT_2, ATTACK_LIGHT_3,
  ATTACK_CHARGE_WINDUP, ATTACK_CHARGE_RELEASE,
  ATTACK_RUNNING, ATTACK_DODGE_FOLLOWUP,
  DODGE_QUICKSTEP, DODGE_ROLL, DODGE_HEAVY,
  PARRY_START, PARRY_ACTIVE, PARRY_RECOVERY,
  BLOCK_START, BLOCK_LOOP, BLOCK_IMPACT, BLOCK_END,
  RIPOSTE, BACKSTAB, RUNE_CAST, RUNE_CHARGE,
  HIT_REACT_LIGHT, HIT_REACT_HEAVY, STAGGER, KNOCKDOWN,
  GET_UP, HEAL, INTERACT, DEATH
```

`Locomotion` e `Combat actions` não precisam ser mutuamente exclusivos. Quando compatíveis, pernas seguem direção e torso/braço executam ação; para spritesheet sem divisão corporal, usar transição entre clips e movimento do motor que respeite a pose, sem prometer blending ósseo inexistente.

### 4.3 Ordem de prioridade sugerida

| Prioridade | Ação | Regra |
|---|---|---|
| Absoluta | Morte / cena bloqueada | Interrompe tudo, exceto transições de sistema essenciais |
| 100 | Esquiva válida | Cancela recuperação e combos enfileirados; também pode cancelar startup de golpes leves sob configuração |
| 95 | Parry válido | Interrompe recuperação leve; não força parry infinito |
| 90 | Stagger/hit reaction pesado | Interrompe ataque sem hiperarmadura; respeita i-frames |
| 85 | Riposte/execução contextual | Prevalece se alvo vulnerável e comando apropriado |
| 80 | Defesa e habilidades defensivas | Entram nas janelas de cancelamento permitidas |
| 70 | Habilidade/runa | Consome custo e aplica restrições próprias |
| 60 | Próximo golpe do combo | Encadeia se válido; nunca bloqueia esquiva |
| 55 | Ataque normal/carregado | Respeita a janela temporal e recurso |
| 40 | Sprint/corrida/virada | Disponível sempre que não existe ação motora bloqueante |
| 20 | Caminhar/idle | Padrão |

**Não aplicar prioridades sem contexto:** morte, stun efetivo, queda física, travessia perigosa, interações e ações cinematográficas podem bloquear. Essas exceções precisam ser explicitadas e testadas, não escondidas num `return` genérico.

### 4.4 Política de cancelamento desejada

| Transição pedida | Comportamento |
|---|---|
| `idle/walk/run → attack` | Começa imediatamente após validação, mirando direção adequada |
| `attack1 → attack2` | Enfileira durante combo window; executa no ponto de encadeamento, sem pose neutra |
| `attack2 → attack3` | Mesmo comportamento com clip de golpe diferente |
| `attack recovery → dodge` | **Prioridade alta; interromper recuperação** |
| `light attack startup → dodge` | Modo responsivo: permitido até a janela de impacto; aplicar custo/cancel apropriado |
| `light attack active → dodge` | Modo padrão: ao encerrar active frames; modo acessível configurável: cancelamento antecipado |
| `heavy charge → dodge` | Abortar carga se ainda não liberou o golpe; sem dano fantasma |
| `heavy impact → dodge` | Após um curtíssimo compromisso de contato configurável |
| `attack → sprint` | Depois do golpe ativo ou do cancel permitido; sem esperar a animação completa de retorno |
| `roll → attack` | Permitir ataque de saída/pós-rolamento em janela específica |
| `roll → roll` | Chain condicionado por stamina e janela anti-spam |
| `parry → riposte` | Janela de resposta imediata após sucesso |
| `block → dodge` | Liberar bloco e executar dodge, não virar ataque acidental |
| `run → turn 180°` | Reduzir inércia e rodar sem giro esquisito de pose |
| `any non-locked → menu` | Pausar input de combate e abrir o menu correto |

**Atenção: cancelamento não é bug.** Ao interromper uma ação, desligar imediatamente hitboxes residuais, root motion antigo, som/trail persistente, efeitos que não deveriam continuar e timers órfãos. A animação de destino assume autoridade.

### 4.5 Buffers e janelas recomendadas (TUNING, não estatísticas oficiais de Wicked)

- `inputBufferMs`: ataque 100-140 ms; esquiva 140-200 ms; parry 80-130 ms; interação 120 ms.
- `comboLinkWindowNormalized`: por golpe, ex. `0.45–0.83`, com abertura perto do hit e fechamento na recuperação.
- `dodgeRecoveryCancelStart`: após a parte ativa do golpe (configurar por arma), e nunca após animação inteira por regra global.
- `transitionBlendMs`: combate 55-110 ms; locomotion 90-160 ms; esquiva emergencial 35-75 ms.
- `tapHoldThresholdMs` somente no preset com botão combinado; preferir inputs separados para latência mínima.
- `comboResetDelayMs`: inicial 450-650 ms após conclusão, sem acumular ataques velhos.
- `dodgeIFrames`: intervalo explícito dentro da animação, ex. `0.08–0.35` do clip, com ajuste por tipo de esquiva.
- `hitstopMs`: 30-55 ms hit leve; 65-95 ms hit pesado; 90-125 ms crítico, sem congelar UI/control input nem a câmera inteira involuntariamente.

Não aplicar tempo em ms como constantes mágicas na lógica. Centralizar em uma tabela de tuning por arma/ação.

### 4.6 REGRA-MÃE: CONTROLE CONTÍNUO, AÇÕES ARBITRADAS, PESO PRESERVADO

**Esta seção complementa e prevalece sobre qualquer regra anterior que dê prioridade exclusiva à esquiva.** O objetivo NÃO é `dodge > attack` e acabou. É implementar uma **arquitetura de game feel integrada** em que o jogador controla movimento, orientação, esquiva, ataques, defesa, habilidades e interações **de maneira contínua**, enquanto um resolvedor decide quais transições são legais em cada fase. **Animação não é autoridade sobre game logic.** A ação decide o que o personagem consegue fazer; a animação comunica isso da forma mais natural possível.

Os três contratos são independentes:

1. **Responsividade:** ler todo input imediatamente, preservando o comando relevante, com resposta visual e/ou de movimento na primeira oportunidade legítima.
2. **Continuidade:** nunca inserir `idle` forçado, reiniciar um clip ou zerar movimento só porque duas ações foram encadeadas. Manter pose, velocidade, direção, fase do passo e trajetória coerentes durante as transições.
3. **Peso e consequência:** startup/active/recovery, contato, colisões, momentum, consumo de recursos e compromisso intencional com golpes pesados. **Não** liberar esquiva/defesa/viradas absurdas em todos os frames de qualquer ação.

**Distinção essencial:** *receber input* é sempre possível; *executar a ação* depende de validade e janelas explícitas; *responder visualmente* pode começar com transição/antecipação curta sem conceder hitbox, teleporte ou invulnerabilidade prematura. Se o jogo negar uma ação, comunicar o motivo com feedback discreto, não silêncio nem congelamento.

**Não implementar `if (isAttacking) return`, `if (isRolling) return` ou `if (animationPlaying) return` sobre o controller inteiro.** O que pode existir são *locks específicos e rastreáveis*, por canal e por fase.

### 4.7 SEPARAÇÃO DOS CANAIS: O QUE CONTINUA FUNCIONANDO ENQUANTO OUTRA AÇÃO ACONTECE

| Canal | Exemplo de responsabilidade | Durante um golpe leve | Durante golpe pesado ativo | Durante roll |
|---|---|---|---|---|
| `InputCapture` | Ler stick/botões e gerar intenções | **Sempre lê** | **Sempre lê** | **Sempre lê** |
| `IntentQueue` | Guardar último comando relevante com validade temporal | **Sempre recebe** | **Sempre recebe** | **Sempre recebe** |
| `CharacterMotor` | Colisão, aceleração, deslocamento | Steering parcial, baseado no golpe | Lunge/control limitado pela fase | Deslocamento da esquiva, colisão ativa |
| `Facing/Aim` | Direção do corpo e alvo | Giro progressivo/assist pequeno | Foco majoritário no alvo escolhido | Orientação compatível com direção capturada |
| `ActionTimeline` | Startup, hit, recuperação, custo, cancels | Golpe corre normalmente | Compromisso real em frames ativos | I-frames só na janela cadastrada |
| `AnimationGraph` | Pose/clip, blend, layers, foot placement | Corpo/transição adequados | Follow-through com peso | Clip da esquiva, sem `idle` intermediário |
| `Camera/Audio/Haptics` | Realce do feedback | Executa eventos | Impacto mais forte se conectar | Whoosh/feedback sutil, sem hitstop falso |
| `UI` | HP, stamina, habilidade e botões | Atualiza sem bloquear combate | Atualiza sem bloquear combate | Atualiza sem bloquear combate |

**Se o Aruan usar sprites completos sem rig independente**, NÃO fingir que é possível rodar um walk-loop nas pernas enquanto o torso usa outro clip. Nesse caso, o motor continua processando a intenção de movimento, aplica deslocamento/steering permitido e escolhe **clips direcionais completos de ataque-em-movimento, pivô ou transições curtas**; procedural complementar apenas se necessário. Camadas upper/lower body, aditivas, IK e motion matching só se houver dados/formato compatíveis.

### 4.8 MATRIZ GLOBAL DE TRANSIÇÕES (NÃO É UMA ÚNICA FILA DE PRIORIDADES)

Estados especiais têm regras próprias. `VALID` exige recursos, alcance/contexto, ausência de stun/death e compatibilidade da fase atual. **O comportamento depende do par origem → destino e da fase**, não só da comparação de números de prioridade. Cada transição deve indicar: `allow`, `bufferUntil`, `cancelFrom`, `blend`, `movementControl`, `cleanup`.

| Situação atual + novo comando | Resultado desejado | Compromisso/peso a preservar |
|---|---|---|
| Idle/andar → correr/sprint | Acelera imediatamente sem clip de espera | Pequena aceleração, passos coerentes |
| Correndo → stick 180° | Desacelera e vira; **não** precisa soltar stick | Pivot/turn-in-place se disponível; sem derrapagem longa |
| Sprint → ataque | *Running attack* ou golpe com entrada de avanço | Impulso curto, colisão real; não teleportar |
| Golpe leve → stick lateral/para trás | **Aceitar direção sempre**; steering controlado na janela permitida | Não girar 180° no frame exato do contato |
| Golpe leve → esquiva | Cancela recuperação e combo pendente na janela configurada | Durante hit ativo, respeitar compromisso mínimo do golpe |
| Golpe leve → bloquear | Preparar defesa imediatamente quando o golpe deixa de estar ativo | Sem escudo mágico no meio do impacto já confirmado |
| Golpe leve → parry | Permitir se houver janela de cancel/parry específica | Parry só vale quando o estado defensivo realmente iniciou |
| Golpe leve → habilidade | Enfileirar/encadear segundo regras da habilidade | Não executar custo/efeito enquanto ainda não ativada |
| Golpe leve → novo ataque | Enfileirar **no máximo 1** e encadear golpe distinto | Hit do golpe atual não pode ser cortado acidentalmente |
| Ataque em recuperação → correr | Reassume aceleração e pose de locomoção **antes** do clip terminar | Preservar follow-through por blend curto |
| Ataque carregando → mudar direção | Ajusta mira/posição limitada durante charge | Mantém pose de carga e pé plantado quando necessário |
| Ataque carregando → esquiva | Cancela carga e inicia dodge se recurso permite | Charge cancelada não dá dano nem emite ataque atrasado |
| Golpe pesado ativo → esquiva/parry/correr | Capturar comando, executar ao primeiro *cancel point* legal | Preserva impacto/comprometimento intencional |
| Esquiva → mudar direção | Em geral captura input para saída; steering de dodge limitado | Não quebrar i-frames, colisões ou deslocamento iniciado |
| Esquiva → ataque | *Dodge follow-up* no primeiro link point legal | Sem 1 frame neutro obrigatório |
| Esquiva → nova esquiva | Encadear se janela, stamina e antispam permitirem | Sem invulnerabilidade perpétua |
| Defesa segurada → mover-se | Strafe/recuo defensivo (ou movimento reduzido) | Guarda permanece coerente com facing/alvo |
| Defesa → esquiva | Larga guarda e inicia esquiva na janela válida | Limpar redução de dano do bloqueio ao sair |
| Parry bem-sucedido → contra-ataque | Prioridade para riposte/counter contextual | Janela curta, alvo e hit confirmados |
| Tomando hit leve → esquiva | Só se reação permitir cancel/escape definido | Não anular hitstun gratuitamente |
| Stagger forte, queda, morte → ações | Capturar apenas o que o design permitir | Nada de teleporte ou ação em estado impossível |
| Abrir menu → comandos do combate | UI recebe input e gameplay deixa de reagir | Limpar held states ao voltar |
| Alterar alvo durante combo | Atualizar `aimDirection`/próximo golpe | Sem virar o corpo/arma instantaneamente no meio do hit |

**Resolução de conflitos no mesmo frame:** primeiro bloquear ações impossíveis, depois considerar interrupção contextual (hit/death/parry), escolher intenção válida mais recente/prioritária, aplicar **uma transição atômica** e limpar efeitos da anterior. Input de movimento **nunca entra numa fila FIFO**, pois precisa ser atualizado continuamente com o vetor do frame atual. `Dodge` não deve ficar atrás de `Attack2`, mas também não deve vencer `Death`, stun não cancelável ou falta de stamina.

**Importante:** o jogador deve conseguir *recuperar o controle* sem necessariamente recuperar **velocidade máxima** instantaneamente. `InputCapture` continua ativo; `Motor` pode ter restrição passageira; `AnimationGraph` pode manter follow-through parcial, e todos liberam de forma coordenada.

### 4.9 PADRÕES CONSAGRADOS DE GAME FEEL PARA APLICAR, SEM INSTALAR UMA ENGINE NOVA

Técnicas de animação/gameplay amplamente usadas no setor. Implementar os princípios no stack existente; **não** copiar classes de Unreal/Unity como se fossem bibliotecas do projeto web.

| Técnica | O que resolve no Aruan | Quando usar | Nível |
|---|---|---|---|
| **Input buffering** com expiração | Apertei ligeiramente antes, o comando não some | Ataque/dodge/parry/skill | P0 |
| **Cancel windows por fase** | Sai de recovery sem esperar o clip completo | Golpes, esquiva, defesa, corrida | **P0** |
| **Action arbitration / contextual interrupt** | Não deixa ataque pendente impedir uma defesa | Todas as transições | **P0** |
| **Continuous movement intent + motor independente** | Stick não fica morto durante combate | 360° e mudanças de direção | **P0** |
| **Animation-driven events / notifies** | Hitbox só liga no instante do impacto | Todos os golpes | **P0** |
| **Hit confirm + hitstop seletivo** | Contato tem peso sem atrasar controle | Hit acertado, parry, crítico | P0/P1 |
| **Anticipation → contact → follow-through** | Soco/pancada comunica força | Arco como porrete | **P0** |
| **SFX/VFX/haptics contextuais** | Acerto parece concreto, erro parece whiff | Impactos, dodge, block | P1 |
| **Short transition blending / pose continuity** | Evita saltos de pose, retorno ao idle | Attack→attack, attack→dodge | **P0** |
| **Directional starts/stops/pivots** | Giro de 90°/180° deixa de parecer robótico | Corrida, desaceleração, lock-on | P0/P1 |
| **Acceleration/deceleration/braking tuning** | Movimento tem peso mas responde logo | Andar, sprint, parar e inverter | **P0** |
| **Analog speed mapping + 8-way selection** | Andar suave, trote, correr, strafing | Locomoção 2D/2.5D | **P0** |
| **Facing desacoplado da velocidade** | Pode se afastar do inimigo mantendo ameaça | Lock-on e ataque em movimento | P1 |
| **Movement warping / attack lunge clamp** | Golpe chega perto sem deslizar ou teleportar | Running attacks, finishers | P1 |
| **Inertial blending / dead blending** | Mantém impressão de momentum entre poses | Apenas se o renderer/rig permitir | P1/P2 |
| **Blend trees, layers e poses aditivas** | Pernas e torso cooperam | Apenas com rig compatível | P1/P2 |
| **Motion matching / pose search** | Seleção de poses por velocidade e trajetória | Só se houver banco suficiente, não no sprint de 30 min | P2 |
| **Distance matching, stride warping** | Evita pés patinando ao acelerar/parar | Se anim skeletal e dados permitirem | P2 |
| **IK / foot planting / hand constraints** | Pés tocam o chão, mão fixa na ponta do arco | Se rig permitir; senão anchors 2D | P1/P2 |
| **Camera follow com amortecimento discreto** | Legibilidade sem atraso ruim de controle | Corrida, combate, dodge | P1 |
| **Hitbox sweep + hurtbox + poise** | Contato segue trajetória real do arco | Golpes, reações de inimigo | **P0** |
| **Micro-correção direcional (target assist)** | Erros mínimos de mira não frustram | 1 alvo próximo no cone, com limite | P1 |
| **Coyote/buffer contextual** | Salto/vault detectado perto da borda | Só se já houver travessia no jogo | P2 |
| **Deterministic action timelines / ownership token** | Nada de timer do golpe antigo mexer no novo | Trocas rápidas de estado | **P0** |
| **Fixed timestep + render interpolation, se aplicável** | Controles e colisões estáveis com FPS variável | Respeitar engine atual | P0/P1 |

**Regra de implementação:** P0 é possível com máquina de estados, metadados de ações e blends simples. **Não prometer motion matching, IK de produção, foot planting ou inertialization reais em spritesheets completos sem rig**. Se não tiver formato adequado, registrar como evolução e usar direção/motor/transições curtas verificáveis agora. Não gastar o timebox instalando um grande framework de animação.

### 4.10 COMO DEIXAR O MOVIMENTO REALMENTE GOSTOSO NO ANALÓGICO

**Direção:** usar deadzone radial e vetor contínuo; o personagem deve refletir a nova intenção do analógico imediatamente **na trajetória do motor quando legal**, mesmo que a pose precise de 2-6 frames para acompanhar. Movimento visual e físico jamais podem divergir por longos períodos.

**Inverter sentido 180°:** o personagem não pode precisar esperar `run_stop` finalizar e depois `turn` finalizar para andar para trás. Fazer frenagem curta + pivot contextual, ou simplificar para transição direta com pose de apoio se faltar clip. Em combate/lock-on, o player pode andar para trás como strafe/backpedal mantendo facing no alvo, conforme a velocidade.

**Arrancada:** saída de idle→walk/run sem delay artificial de start; aceleração curta configurável e pose antecipatória de 1-3 frames só se não bloquear o motor.

**Parada:** soltar stick zera a intenção já, motor freia brevemente e visual encerra no apoio mais próximo; *overshoot* leve só quando coerente. Não usar easing lento que deixe controle pesado.

**Durante golpe:** `steerMultiplier` por fase (`startup`, `active`, `recovery`) em vez de bloquear todo deslocamento. Exemplo de teste: leve `[0.45, 0.12, 0.70]`, pesado `[0.20, 0.03, 0.45]` e dodge governado pela trajetória capturada. Estes são **coeficientes iniciais do Aruan, não números do Wicked**. Ajustar com gamepad real e conferir que nenhuma curva causa deslizamento.

**Orientação independente:** `desiredMoveDirection`, `actualVelocityDirection`, `facingDirection`, `attackAimDirection` e `lockedTargetDirection` são conceitos diferentes. Uma rolagem captura `dodgeDirection` no botão, um ataque pode capturar o alvo ao iniciar e permitir correção limitada durante startup, e a caminhada pode seguir o stick com liberdade.

**A câmera:** precisa acompanhar a intenção sem exagerar o atraso nem causar enjoo; aplicar look-ahead mínimo em corrida, acomodar mudança de direção e evitar tremor sustentado em ataques leves.

### 4.11 COMBATE QUE ENCAIXA: CANCELAMENTO NÃO É TROCAR O GIF

Para cada golpe, cadastrar **quatro tipos de dado**, não apenas nome do clip:

- **Timeline de gameplay:** startup, hitbox ativa, hitbox desativada, combo window, cancel window, recovery, custo.
- **Timeline de apresentação:** pose de preparação, peak de força, impacto, follow-through, *blend profile*, som/VFX e posição da ponta do arco.
- **Controle durante golpe:** `steering`, `turnRate`, velocidade/lunge, permissões de defesa/cancelamento, locks de mão/arma, camera assist.
- **Cleanup obrigatório:** cancelar hitboxes/poise damage antigos, encerrar hitstop ligado à ação, liberar buffs temporários, remover trails/loops, invalidar callbacks com `actionInstanceId`.

**Hit confirm:** o hitstop, VFX forte, rumble de contato e reação do inimigo só podem ser executados após uma colisão válida. Em miss/whiff: som de vento e animação de follow-through; não simular impacto inexistente. Em block/parry: feedback distinto. No acerto, hitstop deve interromper **a percepção do contato** por poucos milissegundos, mas o sistema continua capturando input e expirando buffers pelo relógio correto; não congelar toda a UI/input.

**Combo fluido:** `attack1 → attack2 → attack3` com ataque seguinte começando durante a janela prevista, entrada já registrada antes dela, mudança de direção dentro de limites no intervalo entre golpes, variação clara de arco/trajetória e sem idle intermediário. Se o jogador apertar esquiva em vez do terceiro golpe, **descartar Attack3 pendente** na janela de decisão; se apertar bloquear/parry/skill, decidir segundo a matriz, não automaticamente executar o terceiro golpe.

**Recuperação com peso sem travar:** a pose de follow-through pode continuar sendo misturada enquanto o controle retorna; isso é diferente de obrigar o jogador a assistir ao clip completo. Respeitar a restrição na microfase de impacto de golpe pesado, com cancel point cedo o bastante para preservar responsividade.

**Direção e golpe:** evitar attack auto-aim 180° instantâneo. Correção pequena durante startup (`maxAutoAimAngle`, `maxTargetAssistDistance`), sem ultrapassar paredes ou atravessar inimigos; preservar orientação de golpes mirando na direção intencional.

### 4.12 RESOLVER DE AÇÕES: VALIDADE, PRIORIDADE E INTERRUPÇÃO SÃO TRÊS PERGUNTAS DIFERENTES

Não decidir ação só com `sort(priority)`. Toda tentativa responde:

1. **É válida?** (input, stamina, situação, cooldown, state, alvo, equipamento, colisão).
2. **A ação atual pode ser cancelada NESTA fase para a nova?** (matriz origem-destino, flags de interrupção, janela, emergency cancel).
3. **Se não pode agora, vale guardar?** (buffer com prazo por tipo; intenção mais recente substitui obsoleta e tem `requestedAt`, `expiresAt`).

Pseudocódigo de intenção **adaptável**:

```ts
function tickCharacter(dt: number, nowMs: number) {
  const raw = controls.sample();                 // Sempre, mesmo atacando
  const movement = controls.currentMoveVector(); // Contínuo: não entra em FIFO  intentions.captureEdges(raw, nowMs);           // attack/dodge/parry/etc.
  intentions.dropExpired(nowMs);

  const ctx = character.snapshot();
  const decision = resolveEligibleIntent({
    intentions,
    ctx,
    currentAction: actions.current,
    currentPhase: actions.phase,
    transitionMatrix,
  });

  if (decision.kind === 'TRANSITION') {
    const oldAction = actions.current;
    oldAction?.cancelAndCleanup();              // Transação atômica
    actions.start(decision.action, {             // Gasta recurso UMA vez
      direction: decision.capturedDirection,
      instanceId: nextActionId(),
    });
    intentions.consume(decision.sourceIntentId);
    animator.blendFromCurrentPose(decision.action.clip);
  }

  motor.step({ movement, actionConstraints: actions.movementPolicy }, dt);
  actions.stepTimeline(dt);
  animator.step(dt);
  feedback.stepWithoutBlockingInput(dt);
  debug.recordInputToVisibleReaction(nowMs, decision);
}
```

**Detalhes anti-bug obrigatórios:** a ordem exata deve respeitar física/loop existentes; registrar eventos de input no frame real; usar a intenção **mais recente e ainda válida** em conflitos; jamais consumir stamina por input que não virou ação; impedir callbacks tardios de eventos do clip cancelado; preservar `move` enquanto espera cancel; não deixar hitstop paralisar leitura do controle; não deixar *button held* disparar a cada frame; evitar movimentos impossíveis com colisão real e temporização baseada em `dt`/tempo monotônico.

### 4.13 TUNING CENTRALIZADO E TELEMETRIA DE RESPONSIVIDADE

Os valores abaixo são **pontos de partida para playtest**, não parâmetros da Moon Studios. Eles NÃO devem ser espalhados como constantes mágicas:

```ts
const ARUAN_GAME_FEEL = {
  intentBufferMs: { lightAttack: 120, dodge: 165, parry: 115, skill: 130 },
  movement: {
    deadzone: 0.14,
    startResponseMsTarget: 33,  // medir entrada -> primeiro movimento visível
    turnResponseMsTarget: 50,   // medir intenção -> mudança perceptível
    attackSteer: { lightStartup: 0.45, lightActive: 0.12,
                   lightRecovery: 0.70, heavyActive: 0.03 },
    turn180UsesPivotIfAvailable: true,
    noIdleBetweenTransitions: true,
  },
  animation: {
    combatBlendMs: 65,
    emergencyDodgeBlendMs: 45,
    locomotionBlendMs: 110,
    keepOutgoingPoseContinuity: true,
  },
  action: {
    maxBufferedNextAttacks: 1,
    cleanupOnCancel: true,
    dodgeCancelsQueuedCombo: true,
    doNotLockInputDuringHitstop: true,
    recoveryCanBeInterruptedBeforeClipEnd: true,
  },
};
```

**Targets são hipóteses de tuning**, sujeitos a taxa de quadros, hardware, tipo de clip e método de apresentação; medir em navegador real, não declarar atingidos sem evidência. Em 30 FPS um frame vale ~33,3 ms; em 60 FPS vale ~16,7 ms. Latência de TV/controle fica fora das medições do motor quando não houver hardware de captura.

Adicionar overlay de desenvolvimento (pode ser textual discreto): `input`, `timestamp`, `action`, `phase`, `queued`, `queuedExpiry`, `cancellationReason`, `transitionTo`, `pressedToAcceptedMs`, `pressedToAnimationMs`, `moveIntent`, `motorVelocity`, `facingAngle`, `weaponHitboxActive`, `fps`. Desativável com tecla ou flag. **Mostrar por que o comando NÃO foi executado**, não só a última animação.

### 4.14 CENÁRIOS ADVERSARIAIS: TESTAR A FLUIDEZ REAL, NÃO SÓ O COMBO BONITINHO

Acrescentar aos testes da seção 13:

| ID | Teste de estresse de input | Aceitação verificável |
|---|---|---|
| G01 | Correr para direita → stick instantaneamente à esquerda | Motor responde/começa a frear no próximo tick; pivot se houver, sem esperar terminar `run_stop` |
| G02 | Atacar → mudar stick 90° → 180° | Steering por fase; sem virada teleportada nem stick morto por clip inteiro |
| G03 | Ataque1 → ataque2 enfileirado → esquiva | Esquiva substitui combo pendente no primeiro cancel point legal |
| G04 | Ataque1 → ataque2 enfileirado → bloquear | Bloqueio entra na janela de cancel válida; ataque2 não dispara depois por callback velho |
| G05 | Ataque pesado ativo → parry → dodge em sequência | Apenas a intenção legal/relevante mais recente é conservada; sem executar parry fantasma após dodge |
| G06 | Sprint + virar + ataque | Sem `idle` intermediário; ataque contextual e deslocamento sem atravessar alvo |
| G07 | Esquiva para trás → mudar stick durante roll → atacar | Roll preserva trajetória e i-frames; ataque de saída respeita nova intenção de mira |
| G08 | Defesa segurada + recuo + esquiva + correr | Sem interrupção de leitura, guard state e stamina coerentes |
| G09 | Combo em inimigo muito perto de parede | Aruan não atravessa parede; arco/hitboxes respeitam colisão e orientação |
| G10 | Spam de 4 ações diferentes dentro de 150 ms | No máximo uma transição confirmada por decisão; buffers não vazam nem causam ataques atrasados |
| G11 | Input recebido durante hitstop/impacto | Intenção preservada; a câmera/efeito não congela o roteador de comandos |
| G12 | Apertar ataque, cancelar, deixar callback antigo terminar | Animação/hitbox antigas jamais sobrepõem novo estado |
| G13 | Alternar lock-on durante strafe e ataque | `facing`/`move` independentes, sem snapping violento |
| G14 | Soltar analógico e apertar esquiva | Dodge segue fallback direcional escolhido e não eixo residual de deadzone |
| G15 | Alternar 30/60 FPS no mesmo percurso | Distâncias, recurso e janelas de cancel consistentes (dentro da tolerância) |
| G16 | Hold de ataque + mash de esquiva/defesa | Charge cancela sem hit fantasma; held não gera ataques repetidos involuntários |
| G17 | Gamepad desconectado no meio de combo/sprint | Sem ação presa; reset de `held`, estado recuperável |
| G18 | Teste ABC: fluidez sem efeitos, com áudio/VFX, com rumble | Gameplay correto mesmo sem efeitos; feedback acrescenta peso, não oculta bugs |

**Obrigação de QA:** ao final, registrar em relatório quais testes realmente foram executados e quais dependem de hardware/asset ainda ausente. Não inventar resultado para gamepad, rumble, pose matching ou animações do MovaLab que não foram inspecionadas.

---

## 5. MOTORES DE MOVIMENTO E COMBATE

### 5.1 Locomoção analógica

- Movimento 360°, direção da tela corrigida pela projeção atual. `stick X/Y` deve virar vetor do chão, normalizado sem ganho diagonal.
- **Magnitude analógica controla velocidade**, não só o estado andar/parado: inclinação pequena = caminhada, intermediária = corrida leve, extrema = corrida normal; sprint só pelo modificador escolhido.
- Parâmetros iniciais RELATIVOS à escala do jogo: `walkSpeed=0.45`, `runSpeed=1.0`, `sprintSpeed=1.38` em relação à velocidade existente. Não presumir metros/segundo sem auditar unidade.
- Aceleração para corrida rápida `0.10–0.18 s`; desaceleração `0.08–0.16 s`; mudança brusca de direção com `turn`/`pivot` se disponível; evitar o efeito patinagem.
- Posição física, deslocamento visual, `facing` e `aimDirection` separados: o personagem pode avançar numa direção e atacar em outra quando há lock ou assistência.
- Em 2D direcional: escolher sprite/clip de orientação 4/8 direções, sem inverter sprite com arma assimétrica do lado errado. Se apenas 1 direção, produzir fallback espelhado auditado com correção de mão e arma.
- Durante ataque, conservar controle direcional parcial conforme ação, não deslocar o personagem de forma absurda. O ataque pode ter *lunge* breve configurado e colisão ativa.
- Mudanças de velocidade devem ativar `start`, `loop`, `stop` ou `pivot` conforme disponibilidade, com blend e tempos curtos. Não exigir completar `stop_walk` antes de aceitar dodge/attack.

### 5.2 Corrida, sprint e ataques de deslocamento

- Walk/run/sprint diferenciados visualmente e na distância percorrida.
- Sprint inicia em comando válido; não cancela automaticamente o ataque no início dos active frames, mas pode iniciar no primeiro cancel point.
- Ao atacar durante sprint: preferir clip `running_attack` (ou ataque normal com impulso controlado como fallback), não entrar instantaneamente em golpe parado.
- Ao atacar imediatamente após esquiva: `dodge_followup_attack` se houver; senão ataque1 com blend curto e lunge coerente.
- Soltar sprint sem movimento deve transicionar para idle, não andar num eixo residual.
- Colisão lateral e limitação nas bordas: evitar correr para dentro de objeto ou atravessar parede.

### 5.3 Esquiva: três categorias ligadas ao peso

- `LIGHT`: quickstep curto, rápido, silhueta estável, deslocamento ágil e recovery curto.
- `NORMAL`: rolamento/cambalhota direcional, maior compromisso visual, recovery médio.
- `HEAVY`: rolamento lento com recovery maior e deslocamento menor, mas ainda com controle funcionando e leitura clara.
- Para o MVP, implemente **quickstep e roll**; terceira categoria pode usar mesmo clip com timing/offset próprios se faltarem assets.
- Direção da esquiva é capturada **no momento do comando**: stick contrário durante ataque → esquiva para trás; sem stick → para trás do facing ou vetor de segurança, configurável.
- Deslocamento físico deve acompanhar o arco do clip; não teletransportar no final. Se a animação for in-place, gerar trajetória `easeOut` com colisão e correção contínua.
- I-frames atuam na lógica do dano, não apenas visual. Não tornar invulnerável a animação inteira.
- Cooldown curto e stamina impedem spam infinito; ainda assim mostrar feedback quando ação for recusada, sem congelar o boneco.
- Rolar e atacar logo após rolar precisa ser agradável: *roll → recovery cancel → attack*.
- Se o Aruan usa sprites, a orientação da rolagem deve seguir a direção do movimento; camadas e draw order devem ocultar partes corretamente na cambalhota.

### 5.4 Salto, obstáculos, beiradas e travessia

A referência Wicked prioriza **ações contextuais**:

- Em movimento de corrida, se existir vão marcado como atravessável e alcance adequado → `AUTO_JUMP`; não saltar automaticamente sobre qualquer buraco suicida.
- Em ledge baixo e escalável, com input/direção coerentes → `CLIMB` ou `VAULT`.
- Em borda perigosa sem trigger válido → manter colisão/frenagem ou queda conforme design da fase.
- Em plataforma com desnível → `FALL`, `LAND`, e eventual reação à altura.
- `INTERACT` abre ações/portas/itens próximos, sem disparar golpe.
- Se o nível do Aruan ainda não possui vãos, criar detectores opcionais DESATIVADOS até existir geometria; nunca quebrar os cenários atuais.
- Nada de inventar botão de pulo universal como se fosse requisito do Wicked. Se o jogo Aruan já usa pulo livre como mecânica central, preservar e torná-lo configurável.

---

## 6. SISTEMA DE COMBOS CORPO A CORPO DO ARUAN: ARCO COMO PORRETE

O conjunto de golpes deve ser construído para o **Aruan batendo com uma das pontas do arco**. A mão segura **na extremidade**, exatamente como se o arco fosse uma espada/bastão. Nunca reverter para segurar no centro durante o combo.

### 6.1 Combo básico de três ataques distintos

| Golpe | Anticipação | Movimento e pose-chave | Contato | Continuação / saída |
|---|---|---|---|---|
| `LIGHT_1` | Curta | Golpe diagonal de cima para baixo com ponta do arco | 1 hit | Recuperação curta, janela para LIGHT_2 ou esquiva |
| `LIGHT_2` | Curta | Revés lateral, corpo gira e pés reposicionam | 1 hit | Janela para LIGHT_3, dodge/parry conforme tuning |
| `LIGHT_3` | Média | Pancada horizontal/ascendente mais forte, follow-through completo | 1 hit com poise maior | Recuperação média, cancel para esquiva após contato |
| `CHARGED` | Segurar | Recuo, peso transferido, pose carregada, impulso | 1 hit forte | Cancel antes do release ou após hit ativo |
| `RUNNING_ATTACK` | Curta | Aproximação, golpe de avanço | 1 hit | Continua correndo ou entra em recovery curta |
| `DODGE_FOLLOWUP` | Muito curta | Levanta da esquiva e ataca com ponta do arco | 1 hit | Combina para LIGHT_2 ou idle |
| `PARRY_COUNTER` | Após sucesso | Golpe aproveitando abertura do inimigo | 1 hit forte | Feedback especial |

Esses são **movesets originais do Aruan inspirados na responsividade e variedade da referência**, não cópias frame a frame das animações da Moon Studios.

### 6.2 Timeline de um golpe (dados)

Exemplo ilustrativo, ajustar ao clip real:

```ts
type AttackTimeline = {
  id: string;
  clip: string;
  durationMs: number;
  staminaCost: number;
  damageMultiplier: number;
  poiseDamage: number;
  events: Array<{
    at: number; // normalized 0..1
    type: 'SFX_SWING' | 'HITBOX_ON' | 'HITBOX_OFF' |
          'COMBO_OPEN' | 'COMBO_CLOSE' | 'DODGE_CANCEL_OPEN' |
          'FOOTSTEP' | 'VFX_TRAIL_ON' | 'VFX_TRAIL_OFF';
  }>;
};

const light1: AttackTimeline = {
  id: 'light1',
  clip: 'aruan_bow_club_light_01',
  durationMs: 440,
  staminaCost: 12,
  damageMultiplier: 1.0,
  poiseDamage: 10,
  events: [
    { at: 0.12, type: 'SFX_SWING' },
    { at: 0.25, type: 'VFX_TRAIL_ON' },
    { at: 0.29, type: 'HITBOX_ON' },
    { at: 0.43, type: 'HITBOX_OFF' },
    { at: 0.46, type: 'VFX_TRAIL_OFF' },
    { at: 0.48, type: 'COMBO_OPEN' },
    { at: 0.50, type: 'DODGE_CANCEL_OPEN' },
    { at: 0.86, type: 'COMBO_CLOSE' },
  ],
};
```

**Esses números não são números oficiais de Wicked**. São valores iniciais de teste para se aproximar do feel e devem ser medidos/ajustados dentro do Aruan.

### 6.3 Lógica essencial dos combos

- O golpe `LIGHT_2` não começa antes da janela designada, mas o botão pode ser pressionado pouco antes e ficar no buffer.
- Buffer comporta no máximo **um próximo ataque** por janela. Dois presses rápidos não significam dois futuros ataques enfileirados involuntariamente.
- Esquiva limpa a intenção de próximo ataque, independente de qual golpe do combo está rodando.
- Se jogador altera direção durante o combo, permitir giro/troca de alvo limitado no intervalo de encadeamento.
- Não criar `setTimeout` descontrolado para cada golpe: amarrar eventos à timeline atual e cancelar ao mudar de ação.
- `attackId` e `swingId` são identificadores únicos; cada alvo só toma dano **uma vez por janela de hit**, a menos que ataque declare multihit.
- O registro de dano depende de hitbox/hurtbox, posição, alcance, camada, direção, colisão, timing e estados defensivos. Não depender só de distância ao centro.
- Sem inimigo perto, ataque anima normalmente e gasta recurso como definido, porém **não** cria hitstop/vibração de contato.

### 6.4 Hitbox do arco como porrete

- Forma preferida: varredura (*swept capsule*, setor angular, arco de colisão ou hitbox animada) acompanhando a **ponta que golpeia** e a orientação do corpo.
- Base do arco permanece ligada à mão/IK/attachment; ponta de impacto descreve trajetória. Evitar *hitbox* invisível grande que acerta atrás do corpo em golpes frontais.
- Para sprites sem bones, usar **anchors por frame** ou curva procedural de ponta; desenhar *debug overlay* da arma, arco do swing e hitbox.
- Se usar modelo 3D, attachment por osso e sockets; para 2D, pivot consistente e camadas corretas. Não misturar coordenadas de tela com físicas do chão sem projeção explícita.

---

## 7. DEFESA, PARRY, STAGGER, BACKSTAB E IA DE INIMIGOS

### 7.1 Stamina, vida e focus

Criar `CombatResources` sem valores mágicos espalhados:

```json
{
  "health": { "max": 100 },
  "stamina": {
    "max": 100,
    "regenPerSecond": 26,
    "regenDelayAfterSpendingMs": 500,
    "lightAttackCost": 12,
    "heavyAttackCost": 25,
    "dodgeCost": 18,
    "sprintCostPerSecond": 5,
    "blockDrainPerSecond": 0
  },
  "focus": { "max": 100, "gainOnHit": 8, "skillCost": 45 },
  "poise": { "max": 100, "regenDelayMs": 1000 }
}
```

Valores **do protótipo Aruan**, não números extraídos do Wicked. Ajustar ao jogo e evitar punir o controle com stamina curta demais. Sem stamina: ataque/esquiva recusado com feedback leve; locomoção normal nunca paralisa. Em sprint, ao esgotar stamina retornar para run, não congelar.

### 7.2 Parry

- `PARRY_START` → `PARRY_ACTIVE` (*perfect timing*) → `PARRY_RECOVERY`.
- Parry bem-sucedido cancela dano recebido, reproduz contato, som metálico/seco, partículas direcionais, flash e vibração breve; gera foco/abertura de riposte quando apropriado.
- Falhou: pequeno recovery explícito, custo e vulnerabilidade; **não** permitir spam sem consequência.
- Sugestão inicial: janela ativa de 120-180 ms, recovery ao falhar ~250-320 ms; tunar após teste, não alegar que o Wicked usa exatamente isso.
- Ao tocar em parry durante uma recuperação cancelável, o input é aceito assim que permitido. Não prender em combo antigo.

### 7.3 Block/Offhand

- Se escudo equipado, segurar defesa ativa `BLOCK_LOOP`; orientada para origem do golpe com ângulo de cobertura.
- Ao receber hit bloqueável, `BLOCK_IMPACT`: gastar stamina proporcional, gerar som/VFX, pequena reação e rumble. **O gasto é por impacto; não obrigar drenagem passiva de stamina por segundo parado. Ver regra prevalente em 7A.5.**
- *Guard break*: stamina zerada ou poise vencida → `STAGGER` + janela de punição.
- Se não há escudo, não mostrar um bloqueio invisível; LB pode alternar offhand/runa como preset determinar.
- Ao apertar esquiva enquanto bloqueia, soltar defesa com prioridade correta e esquivar. **Nunca converter inadvertidamente esse comando em ataque de avanço**.

### 7.4 Poise, hit reactions e inimigo de demonstração

- Manter `health`, `poise`, `guardState`, `damageReaction`, `knockback`, `stunUntil` por inimigo.
- Golpe leve: flinch compatível com direção e força; golpe pesado: reação maior; quebra de poise: stagger visível e oportunidade de riposte.
- Inimigo deve telegravar golpes com `windup → active → recovery`, nunca dar dano antes do hitbox ativo. Ataques podem ser esquivados com iframes ou espaço.
- Fornecer pelo menos **um inimigo de treino funcional**, que permita: receber 3-hit combo, atacar para testar dodge/parry, bloquear opcionalmente e ser derrotado.
- Acerto fatal ativa morte/queda e desabilita collider ofensivo sem deixar hitbox fantasma.
- Opcional quando já houver sistema: backstab com ângulo traseiro e vulnerabilidade; não gastar o MVP inventando stealth inteiro.

### 7.5 Habilidades / runas mínimas do Aruan

Criar estrutura de *abilities* reutilizável por ID, custo, clip, cooldown, hitbox, VFX, cancel windows e keybind.

Implementar **ao menos uma habilidade funcionando de ponta a ponta** usando recurso `Focus`, idealmente compatível com o personagem:

1. **`IMPACTO_ANCESTRAL`**: pancada mais forte com a ponta do arco, deslocamento curto, poise alto e efeito original Aruan.
2. **`PASSO_DA_MATA`**: evasão especial/quickstep com breve rastro sutil, se já existirem assets.
3. **`DISPARO_DO_ARCO`**: opcional, para quando Aruan voltar a usar o arco como arma de projétil; não comprometer o foco principal de pancadas.

As demais podem existir **somente como slots desabilitados rotulados**, não como botões mentirosos que aparentemente ativam habilidades inexistentes. Se desenvolver skills, evitar poderes visuais genéricos que descaracterizem o tema do Aruan.

---

## 7A. CONTRATO DE COMBATE SOULSLIKE — DARK SOULS × NO REST FOR THE WICKED × IDENTIDADE ARUAN

> **OBRIGATÓRIO E COM PRIORIDADE P0:** a expressão "combate soulslike" aqui não significa simplesmente adicionar uma animação de rolamento. Significa construir o ciclo **ler telegraph inimigo → escolher ação (atacar, manter distância, defender, esquivar, parry) → assumir risco/custo → executar timing → receber consequência clara → aproveitar a janela de punição → retornar ao neutral sem travar**. O Aruan deve ter direção, peso, hitboxes honestas, stamina, defesa real, risco e contra-ataques executáveis. Referências: *Dark Souls* pelo compromisso/punição; *No Rest for the Wicked* pela perspectiva, fluidez e combate de curta distância. NÃO copiar interface artística, animações ou recursos proprietários desses jogos.

### 7A.1 Os oito pilares obrigatórios

1. **Commitment (compromisso inteligente):** ataque forte expõe, ataque leve recupera cedo; todos possuem startup, active e recovery; a ação tem janelas contextuais de cancelamento e nunca bloqueia inputs globalmente.
2. **Leitura de animações:** inimigos sinalizam direção, alcance, tipo e timing do golpe com pose, áudio e antecipação. Dano não começa antes do contato.
3. **Defesa com escolhas:** **dodge com i-frames**, **block com guard angle + stamina + chip damage**, **parry no timing correto com punição por falha**, e **posicionamento** sem gastar recurso quando possível.
4. **Recursos e consequências:** cada opção tem custo; stamina esgotada muda decisão mas não tira controle direcional normal. Vida, stamina, poise/postura e Focus são sistemas diferentes.
5. **Golpes que encaixam:** três ataques distintos do arco-porete, pesado/carregado e ataques contextuais (corrida, pós-dodge, riposte); contato gera knockback/reação proporcional.
6. **Jogo justo:** hitboxes seguem a arma; hurtbox acompanha personagem; i-frames são reais; invulnerabilidade só dentro da janela; sem dano fantasma nem hits múltiplos ilegais.
7. **Ritmo deliberado e responsivo:** confirmação de input no primeiro frame elegível, buffers curtos, cancelamento autorizado e continuidade visual; sem "teleportar" da pose de ataque para defesa sem blend.
8. **Treino verificável:** um inimigo com pelo menos dois ataques diferentes e telegraphs distinguíveis testa block, parry, dodge, stagger, riposte e falha defensiva.

**Política de prioridade**: dodges, parries, guard releases, mudança de movimento e ataques podem vencer comandos anteriores **somente na janela válida de acordo com o estado**. Não tornar tudo cancelável em qualquer frame. Porrada pesada que já conectou deve ter microcompromisso; se o jogador apertar esquiva nesse intervalo, registrar o comando e ativar no PRIMEIRO frame liberado, sem esperar o final inteiro do clip. Inputs nunca se perdem silenciosamente: iniciar, bufferizar ou rejeitar com motivo/feedback.

### 7A.2 Gramática dos controles no preset ARUAN_FLUIDO

| Intenção | Xbox | PlayStation | Teclado | Semântica de jogo |
|---|---|---|---|---|
| Locomoção/afastar/strafe | Stick esquerdo | Stick esquerdo | WASD | Sempre ler, inclusive atacando e defendendo; aplicar restrição de velocidade por ação, não ignorar eixo |
| Sprint | L3 (segurar/toggle configurável) | L3 | Shift | Começa no cancel point; termina instantaneamente ao soltar, sem root motion residual |
| Esquiva / roll / quickstep | A | Cruz | Espaço | Ação de defesa ativa, buffer e direção capturada na borda do input; i-frames + stamina |
| Ataque leve 1→2→3 | X | Quadrado | Mouse esquerdo | Tap para um golpe; próximo tap em janela específica avança combo, sem auto-spam |
| Ataque carregado | Segurar X | Segurar Quadrado | Segurar mouse esquerdo | Windup/charge/release distintos; evitar conflito com taps do combo |
| Guard/bloqueio | LB segurar, quando disponível | L1 segurar | Mouse direito | Defesa real enquanto mantido; cone frontal; impacto e stamina; soltar cancela rapidamente |
| Parry | LT toque | L2 toque | Q | Janela ativa limitada; sucesso abre riposte; falha dá recovery e cooldown |
| Riposte | X perto do alvo vulnerável | Quadrado | Mouse esquerdo | É ação contextual com confirmação de alvo; não desferir golpe normal se a prioridade contextual for verdadeira |
| Habilidade/runa | RB | R1 | R | Ativa se há Focus e janela permitida |
| Lock on / alternar alvo | R3 / stick direito | R3 / stick direito | Tab / mouse | Orientação ao alvo sem impedir deslocamento/esquiva |

**Conflito real de equipamento:** se Aruan usa arco como porrete, **não inventar escudo visual inexistente**. Para o primeiro slice, pode bloquear usando a parte rígida do próprio arco **apenas se o rig/poses permitirem visual crível**, com stamina/cobertura honestas e defesa menos eficiente que um futuro escudo; se ainda não houver rig adequado, integrar uma pose defensiva provisória marcada como fallback. Reservar sistema de escudo/offhand para equipamento real mais tarde. Preservar preset `WICKED_CLASSIC` como alternativa opcional; `ARUAN_FLUIDO` é o padrão de menor latência. Os comandos históricos de Wicked variaram entre versões: isto é o DESIGN DO ARUAN, não uma afirmação de que esses são os bindings oficiais atuais do Wicked.

### 7A.3 Linha temporal por ação: gameplay primeiro, animação representa

TODO golpe, defesa, parry, dodge, habilidade e reação precisa de dados próprios. Não derivar o evento de dano da porcentagem visual adivinhada; sincronizar com marcador do movimento da ponta do arco. Tabela ilustrativa de tuning (não valores internos de Wicked ou Dark Souls):

| Ação | Startup estimado | Active/janela útil | Recovery / lock mínimo | Interrompível por |
|---|---:|---:|---:|---|
| Ataque leve 1 | 110–180ms | hit 80–130ms | 170–260ms | esquiva/parry/block ao fim do active; combo na janela; pivô parcial |
| Ataque leve 2 | 130–190ms | hit 85–135ms | 190–280ms | mesmas regras, stamina/recurso válido |
| Ataque leve 3 | 160–240ms | hit 110–170ms | 240–380ms | esquiva/bloqueio em recuperação permitida; **não** iniciar ataque 1 automaticamente |
| Ataque pesado | 240–450ms de windup | 110–180ms | 310–520ms | charge pré-release pode abortar; após contato conserva compromisso mínimo |
| Dodge leve | entrada imediata | i-frames em trecho parcial de ~120–240ms | ~130–210ms após ativo | follow-up ataque no trecho de saída; roll em sequência com custo |
| Dodge normal | entrada imediata | i-frames em trecho parcial de ~140–240ms | ~170–290ms após ativo | follow-up/locomotion na janela de saída |
| Parry | ~50–90ms | ~120–210ms válidos | ~240–340ms se falhar | sucesso abre riposte; falha não permite spam instantâneo |
| Guard | ~40–100ms para levantar | mantém proteção enquanto segurado | ~30–90ms ao soltar | esquiva, sprint ou golpe quando a saída permitir |
| Reação fraca | contato imediatamente sinalizado | flinch/poise loss | ~120–220ms | resposta depende de armadura/poise |
| Stagger/guard break | imediato | vulnerabilidade explícita | ~550–1000ms no inimigo comum | só morte, física crítica, recuperação definida |

Os números acima são **hipóteses iniciais configuráveis**; ajustar por arma, escala e FPS após teste em jogo. `inputBufferMs` deve caber nas janelas reais; iniciar o estado/feedback visual assim que possível, sem "roubar" frames de recuperação do oponente. Exemplo de esquema de dados:

```ts
// Exemplo de CONTRATO, adaptar aos tipos/repositório real (não instalar TypeScript).
type ActionSpec = {
  id: string;
  phase: 'startup' | 'active' | 'recovery' | 'finished';
  cost: { stamina?: number; focus?: number };
  durationMs: { startup: number; active: number; recovery: number };
  hitWindows?: Array<{ fromMs: number; toMs: number; hitboxId: string }>;
  invulnerabilityWindows?: Array<{ fromMs: number; toMs: number; kind: 'melee'|'all-dodgeable' }>;
  cancelWindows: Array<{ fromMs: number; toMs: number; toActions: string[] }>;
  events: Array<{ atMs: number; kind: 'sfx'|'vfx'|'impact'|'footstep'|'trail'|'rumble' }>;
  facingPolicy: 'free'|'soft-track'|'lock-on'|'fixed-during-active';
  motionPolicy: 'full'|'reduced'|'root-motion-limited'|'none';
  animationId: string;
};
```

**Separar `simulationClock` de `renderClock`**: janelas de acerto, stamina, parry e i-frames usam tempo da simulação; animador recebe fase sincronizada. Ao cair FPS, ninguém deve ganhar/ perder i-frames arbitrários. A pausa de hitstop não pode engolir input.

### 7A.4 Dodge e i-frames de verdade

- Checar `justPressed` no frame; ler vetor stick atual ou último vetor válido; calcular esquiva lateral/traseira/frontal em world space compatível com câmera isométrica.
- Na entrada, validar stamina e lock; debitá-la uma única vez; cancelar qualquer hitbox antiga na transição autorizada; iniciar deslocamento com sweep collision, slide onde apropriado e **sem atravessar inimigo/parede gratuitamente**.
- Só ignorar dano de tipos elegíveis nas janelas de invulnerabilidade de gameplay; agarrões, perigos ambientais e áreas persistentes podem ter regras explícitas distintas e indicadores próprios.
- Renderizar quickstep ou roll seguindo equip load; velocidade/distância ajustadas ao peso. Não permitir invencibilidade repetida infinita em dodge chain.
- Durante o roll, continuar amostrando direção, mas limitar *steering* para não virar 180° de maneira antinatural no meio da cambalhota; retomar controle total ao fim do trecho comprometido.
- Se player pede esquiva DURANTE ataque: buffer → cancelar no primeiro `canDodgeFrom(action.phase, now)`; se o golpe acertou, fechar hitbox no cancel; se errou, não inventar dano.
- Se player pede ataque durante o final da esquiva: iniciar `dodge_followup` ou `light_1`, SEM ida ao idle.
- Uma esquiva válida precisa superar o ataque pelo posicionamento ou i-frame. O inimigo não pode fazer tracking perfeito na última fração do swing só para atingir o jogador.

### 7A.5 Guard/Block, defesa perfeita opcional e guard break

- `BLOCK_START → BLOCK_LOOP → BLOCK_IMPACT → BLOCK_LOOP/BLOCK_END`. Defender exige pose + cobertura angular configurável (ex.: arco inicial de 140° centrado no facing), não imunidade 360°.
- Ao ser atingido no cone e sem propriedade unblockable: absorver porcentagem de dano de HP de acordo com equipamento, aplicar eventual **chip damage** e descontar stamina por `attack.guardDamage`/`attack.staminaPressure`; reproduzir reação de impacto sem sumir visualmente com a arma.
- A stamina pode recuperar mais devagar enquanto o block está mantido; **não obrigatoriamente gastar stamina por segundo parado**. O gasto principal vem dos impactos, e qualquer custo passivo deve ser justificado/configurável. O arquivo V2 sugeria `blockDrainPerSecond=2`, mas **sobrescreva esse default para zero** no protótipo, mantendo penalidade de regeneração durante a guarda se desejado.
- Ao reduzir stamina a zero num block: `GUARD_BREAK` → animação de abertura, bloqueio desabilitado por intervalo definido, som forte/vibração e possibilidade de riposte pelo inimigo. Nunca ficar indefinidamente invulnerável com guarda ativa.
- Ataques por trás/laterais fora do cone atravessam guard. Ataque marcado como `unblockable` tem telegraph exclusivo e é melhor responder com dodge/posicionamento.
- `PERFECT_BLOCK` (defesa erguida no último instante) é **opcional P2** e diferente de `PARRY`: pode poupar stamina/criar contragolpe leve, sem automaticamente abrir riposte. Não colocar o mesmo evento como sucesso das duas mecânicas.
- Soltar LB deve iniciar `BLOCK_END` imediatamente; se o jogador pediu esquiva, **preferir esquiva no ponto válido**, não escolher ataque de corrida por colisão de bindings. Guard→attack e guard→parry também possuem transições próprias.

### 7A.6 Parry, erro, vulnerabilidade e riposte

- `PARRY_START` com antecipação curta, `PARRY_ACTIVE` delimitado e `PARRY_WHiff` ou `PARRY_SUCCESS`; não aceitar repetição contínua segurando LT. Usar borda de botão.
- Validar **interseção temporal** entre hitbox atacante e janela parry ativa, direcionalidade de contato (frontal), tag `parryable` do golpe e não estar incapacitado. Parry não é botão mágico de "cancelar dano recebido" se foi acionado cedo/demorado ou contra ataque não-parryable.
- Parry bem-sucedido: impedir dano correspondente, evento único, faísca e som marcantes, pequeno recoil no atacante, Focus, feedback háptico e **janela de punição/riposte**. Em chefes, parry pode conceder Focus e dano à postura, mas **não necessariamente stagger completo**, como no Wicked.
- Parry falho: animação de whiff, vulnerabilidade durante recuperação e cooldown apropriado; não bloquear ou esquivar imediatamente antes da penalidade mínima, salvo modo assistência explícito. Evitar permitir spam que anule toda decisão.
- Botão de ataque durante `enemy.staggered && insideRiposteRadius && facingTarget && riposteWindowActive` usa `RIPOSTE` prioritariamente. Fora dessas condições executa ataque normal; não teleportar para costas e não acertar inimigo fora de alcance.
- Garantir que o "golpe crítico" acerta com evento sincronizado e não dobra o dano duas vezes devido a hitbox ordinária. Bosses podem exigir sequência de posture damage antes do crítico.
- Para P0, fazer 1 parry simples contra o inimigo de treino; riposte pode usar animação real do MovaLab ou uma variação autorizada do `heavy_attack` com marcação de fallback. O **sistema de oportunidade** deve existir, não só a pose do parry.

### 7A.7 Stamina, poise, posture, hyperarmor e feedback

- **Stamina:** ataque, esquiva, sprint e block-hit têm custos independentes. Usar regeneração com delay após gasto, modulação ao defender/sprintar e feedback discreto de insuficiência. **Nunca impedir andar normalmente por falta de stamina.**
- **Poise**: resistência a flinch durante ação; quando esgota, entra em `STAGGER`, perde ação ofensiva/hitboxes antigas e abre oportunidade. Poise não é HP.
- **Hyperarmor**: durante parte do pesado, reduzir/ignorar interrupção por golpes leves, MAS ainda perder HP/poise conforme regras. Não usar "invulnerável" no lugar de hyperarmor; golpes enormes, guard breaks ou dano letal ainda podem interromper.- **Postura inimiga**: barra opcional contextual perto de chefe/elite; pode subir com ataques pesados, guard pressure e parry. Ao quebrar, emitir `POSTURE_BREAK` com vulnerabilidade bem visível.
- **Hit reaction** adequada ao vetor de impacto/arma e força: leve flinch, grande stagger, bloco segurando, escudo quebrado, riposte, knockdown e morte; não tocar mesma reação genérica para tudo.
- Acerto confirmado deve disparar (uma vez) shake discreto, hitstop curto, som do material, trail, partículas, degradação de HP e rumble; defesa gera som mais seco e vibração menos ofensiva; aparo perfeito recebe identidade audiovisual própria. Sem acerto = sem efeitos de contato.
- HUD de stamina informa o risco: baixa stamina, consumo no início da ação, regen e quebra de guard; Focus só ganha quando a regra do evento se cumpre.

### 7A.8 IA INIMIGA: sem isto o sistema soulslike não existe

**Criar ou adaptar 1 inimigo de arena testável** com `IDLE → ACQUIRE → APPROACH/STRAFE → WINDUP → ACTIVE → RECOVERY → REPOSITION` e estados de defesa/receber golpe/stagger/morte.

**Conjunto mínimo de ataques:**

- `ENEMY_SLASH_1`: golpe horizontal frontal, telegraph legível, parryable/blockable/dodgeable.
- `ENEMY_OVERHEAD`: golpe vertical forte, windup mais demorado, alto guard damage e alto posture damage; parryable ou não **conforme tag documentada**.
- Opcional: `ENEMY_THRUST`: golpe estreito de alcance maior para testar esquiva lateral versus esquiva para trás.

**Requisitos de justiça:**

- Telegraph visual precede o hitbox (ex.: 300–600 ms para inimigo básico, inicial e tunável); hitbox ativa somente durante swing (ex.: 90–180 ms); recovery pós-ataque oferece contra-ataque legível (ex.: 450–750 ms). Timings variam por ataque, nunca usar um número fixo universal.
- `Facing` pode seguir jogador durante windup inicial, mas **congela/limita tracking no trecho final antes do active**, para dodge lateral funcionar.
- AI não lê inputs do jogador para decidir em tempo zero o golpe perfeito; usa distância, linha de visão, cooldown, estado e chance; nunca "cola" no personagem por teleporte invisível.
- Contato com mundo: não atravessar paredes; hurtbox não permanecer ativa após morte, stagger ou cancel.
- Inimigo bloqueia um golpe de teste se já houver anim correspondente; guard break deve ser visível quando aplicável. Não tornar todos os adversários sacos de pancada sempre interrompidos pelo primeiro leve.
- Reação a parry versus block é diferente: block não abre riposte por padrão, parry correto gera janela de punição; boss/elite podem ter resistência especial.
- Exibir telegraph + janela útil + abertura após erro para o jogador aprender o ciclo de combate.

### 7A.9 Matriz de situações obrigatórias (com entradas reais)

| Situação | Input e resultado obrigatório |
|---|---|
| Inimigo inicia golpe frontal | Stick sai do cone de acerto → golpe erra fisicamente, sem depender de esquiva mágica |
| Golpe inimigo vem e Aruan rola cedo demais | i-frame acaba antes do hit e, se hurtbox estiver na trajetória, sofre dano |
| Aruan rola no timing certo | i-frames ou posição negam o dano, mesmo com efeito gráfico do inimigo passando perto |
| Aruan segura guarda de frente | dano reduzido, stamina consumida no impacto, feedback de BLOCK_IMPACT |
| Aruan segura guarda de costas | defesa não absorve golpe fora do cone |
| Guarda absorve golpe muito forte com stamina insuficiente | GUARD_BREAK e abertura, não bloqueio infinito |
| Aruan aperta parry antecipadamente | falha e recebe ataque se ainda na hurtbox, com recuperação/cooldown |
| Aruan aperta parry no encontro exato do golpe | PARRY_SUCCESS, Focus/recoil, janela de riposte contextual |
| Aruan aperta parry tarde | leva o dano normalmente; não "corrigir" automaticamente para perfect parry |
| Ataque inimigo explicitamente não-parryable | parry não funciona, dodge ou posicionamento continuam opções |
| Aruan acerta leve em inimigo com alta poise | dano entra, mas inimigo não fica stunlocked no primeiro golpe |
| Aruan acerta pesado durante windup inimigo sem hyperarmor | pode quebrar poise, cancelar ataque inimigo e abrir pressão |
| Aruan recebe hit durante hyperarmor do próprio ataque | perde HP mas pode completar golpe conforme resistência restante |
| Aruan pressiona X,X,A para trás | se antes do active cancelável: cancela; se durante parte comprometida: buffer executa primeiro frame liberado, sem repetir combo pendente |
| Aruan segura LB e toca A | sai de guard e rola; nunca dispara attack ou run attack por conflito de binding |
| Aruan termina dodge e toca X | animação `dodge_followup` ou `attack1` conecta sem passar por idle |
| Aruan ataca inimigo fora de alcance | swing completo sem damage, rumble de impacto ou hitstop de hit |
| Aruan segura ataque até carregar e pede dodge antes do release | interrompe carga, cancela custo que ainda não foi comprometido conforme regra e esquiva |
| O inimigo entra em stagger | botão contextual de ataque aciona riposte se distância/ângulo válidos |
| Aruan fica sem stamina | move/recua normalmente; feedback explica rejeição de ação que exige recurso |
| 30 segundos de spam de LB, LT, A, X + stick | sem hitboxes fantasmas, softlock, filas de input infinitas nem clip preso |

### 7A.10 Clips e eventos novos obrigatórios no AnimationRegistry

Adicionar/validar *nomes sem duplicar assets*: `guard_start`, `guard_loop`, `guard_hit_front`, `guard_break`, `guard_end`, `parry_start`, `parry_active`, `parry_whiff`, `parry_success`, `riposte_entry`, `riposte_impact`, `riposte_exit`, `dodge_start`, `dodge_active`, `dodge_recover`, `quickstep`, `attack_light_1/2/3`, `heavy_windup/release/recover`, `attack_dodge_followup`, `attack_run`, `enemy_telegraph_slash`, `enemy_attack_slash`, `enemy_telegraph_overhead`, `enemy_attack_overhead`, `enemy_recovery`, `enemy_block_hit`, `enemy_stagger`, `enemy_guard_break`, `hit_react_light`, `hit_react_heavy`, `death`.

- Para **cada** clip: asset real do Aruan/MovaLab → substituição legal com licença validada → procedural mínimo somente em último caso. Se `MovaLab` não contiver parry/guard/riposte, não inventar que encontrou; usar fallback e registrar lacuna.
- Cada ação deve mapear **input → validação → estado → clip → evento ativo (hitbox/i-frame/block/parry) → efeito → cancel window → estado seguinte**, e o documento de entrega deve conter esse percurso para ao menos ataque1, dodge, guard, parry e riposte.
- Se há IK/rig, mão do Aruan segura **a extremidade do arco como porrete**, com ponto de impacto na extremidade oposta. Para sprite 2D, marque pivô/offset do arco e colisão compatível com poses. Evitar membro atravessando o corpo, arma flutuando e contato antes do swing.

### 7A.11 Tuning central e opções de acessibilidade/controle

Presets de qualidade de jogo, NÃO "cheats" nem imitação literal de timings comerciais:

```json
{
  "combatStyle": "ARUAN_SOULSLIKE_FLUIDO",
  "gamepadPreset": "ARUAN_FLUIDO",
  "sprintMode": "hold_or_toggle",
  "targetAssist": "soft",
  "stamina": { "max": 100, "regenDelayMs": 480, "regenPerSecond": 26 },
  "dodge": { "cost": 18, "inputBufferMs": 160, "steerDuringRoll": 0.15, "iframesAreGameplayAuthoritative": true },
  "block": { "guardAngleDegrees": 140, "passiveDrainPerSecond": 0, "regenMultiplierWhileHeld": 0.55, "chipDamageEnabled": true },
  "parry": { "inputBufferMs": 100, "successAddsFocus": true, "failedParryPenaltyMs": 300 },
  "attack": { "inputBufferMs": 125, "hitboxFollowsWeapon": true, "comboQueuedMax": 1 },
  "enemy": { "telegraphRequired": true, "lateTrackingLimitEnabled": true },
  "options": { "rumble": true, "rumbleIntensity": 0.7, "screenShake": 0.65, "cameraMotionReduction": false, "assistParryWindow": "normal" }
}
```

- Separar `assistParryWindow: normal/assist` para acessibilidade sem alterar versão padrão; assistência pode tornar janela um pouco mais permissiva sem fingir que é o timing oficial de Dark Souls ou Wicked.
- HUD com barra de HP/stamina/Focus, marcador contextual de poise do alvo em elite, feedback de guard break e hints do comando que realmente está ativo. UI de combate original, inspirada em **hierarquia e legibilidade**, não cópia pixel a pixel.
- Vibração: hit normal um pulso curto, parry perfeito pulso duplo curto, guard break pulso grave/mais intenso, dodge opcional impulso suave; desativar sem efeitos colaterais quando o browser/pad não oferece suporte. Rumble não deve ocorrer a cada frame da animação.
- Ferramentas de debug (dev-only): visualizar `enemy.windup/active/recovery`, arco/cone de guarda, hitboxes/hurtboxes, `iframeActive`, `parryActive`, custo stamina, `poiseDamage`, `actionCancelAllowed`, `bufferAgeMs`, latência input→ação e nome do clip. **Sem esse debug, é difícil afinar um soulslike.**

### 7A.12 Prioridade REAL no sprint de 30 minutos

**P0 — vertical slice COM MECÂNICA SOULSLIKE FUNCIONANDO** (não é só efeitos):

1. Mapeamento de controle, locomoção 360°, sprint e esquiva direcional com colisão e i-frames reais.
2. Combo de **três ataques distintos** com hitbox por janela de impacto, stamina e cancelamento contextual.
3. **Block direcional** com stamina por impacto e guard break; defesa não pode ser invisível sem feedback.
4. **Parry com janela correta**, punição por falha e reação do inimigo, com oportunidade contextual de contra-ataque.
5. **Um inimigo com windup/active/recovery**, dois ataques com telegraphs legíveis, HP, reação a golpes e poise básica.
6. HUD real de HP/stamina/Focus, áudio mínimo e feedback de contato; gamepad funcional e vibração quando suportada.
7. Testes de `dodge timing`, `guard`, `parry cedo/tarde/certo`, `ataque1→2→dodge`, `block→dodge`, `riposte` e build.

**P1**: pesado carregado mais refinado, corrida→ataque, dodge→followup, lock avançado, balanceamento refinado, follow-up de parry em elite, hitstop/fx/haptics diferenciados, habilidades Focus originais. **P2**: múltiplas armas e movesets, postura de chefes, ataques unblockable, perfect block separado do parry, backstab, equipamento com peso real, execuções especiais, traversal avançado, mais tipos de inimigos.

**REALISMO DO PRAZO:** 30 minutos é um **timebox de integração prioritária**, não garantia de desenvolver jogo comercial completo. Se o código/rig atual inviabilizar todo P0 nesse período, não crie botões falsos nem tabelas anunciadas como implementadas: entregue um núcleo jogável validado e relatório factual do restante. Ao escolher entre tela sofisticada e **guard/parry/dodge reais**, priorizar o segundo. Use a estrutura existente do repositório e evite refatoração grande que destrói o jogo.


---

## 8. INVENTÁRIO DE ANIMAÇÕES: MATRIZ CLIP → INPUT → EVENTO

O Argon deve resolver cada ação com esta ordem: **clip Aruan → MovaLab → fonte externa legal compatível → procedural**. Cadastrar clips no `AnimationRegistry` em vez de fazer ifs por nome de arquivo.

| Contexto | Animação / estado desejado | Quando ativa | Evento relevante | Prioridade MVP |
|---|---|---|---|---|
| Sem input | `idle_breath` | stick neutro, sem ação | respiração/idle | P0 |
| Começa a andar | `walk_start` | magnitude supera deadzone | primeiro apoio de pé | P1 |
| Caminhar | `walk_loop` | analógico baixo | passadas sincronizadas | P0 |
| Correr | `run_loop` | analógico alto | passadas/poeira | P0 |
| Sprint | `sprint_loop` | comando de sprint e direção | passada forte | P0 |
| Frear | `run_stop` | solta direção após velocidade | desaceleração visual | P1 |
| Virar 90°/180° | `pivot_left/right/back` | diferença angular alta | apoio e orientação | P1 |
| Combate parado | `combat_idle` | alvo próximo ou combat flag | pose da arma | P0 |
| Circular inimigo | `strafe_8dir` | lock + movimento lateral | mantém alvo encarado | P1 |
| Primeiro golpe | `bow_club_attack_01` | X no idle/run | swing/hit window | **P0** |
| Segundo golpe | `bow_club_attack_02` | X durante janela do ataque 1 | segundo arco de golpe | **P0** |
| Terceiro golpe | `bow_club_attack_03` | X durante janela do ataque 2 | terceiro impacto | **P0** |
| Carregar | `charge_start/loop` | segurar X | pose/feedback crescente | P1 |
| Soltar carga | `charged_release` | soltar X após threshold | contato pesado | P1 |
| Golpe em corrida | `running_attack` | X com sprint | dash/impacto | P1 |
| Golpe pós-esquiva | `dodge_attack` | X em janela de saída | ação de retomada | P1 |
| Esquiva leve | `quickstep_8dir` | A + equip load leve | i-frames + deslocamento | **P0** |
| Cambalhota normal | `roll_8dir` | A + equip load normal | i-frames + deslocamento | **P0** |
| Rolamento pesado | `heavy_roll` | A + equip load alto | i-frames menores, recovery | P2 |
| Preparar parry | `parry_start` | LT toque | janela/parry | P1 |
| Acertar parry | `parry_success` | incoming hit dentro da janela | flash/SFX/focus | P1 |
| Errar parry | `parry_recovery` | sem contato | recovery curto | P1 |
| Bloquear | `block_start/loop` | LB segurado com escudo | cobertura de dano | P1 |
| Impacto no escudo | `block_hit` | hit bloqueado | impacto/haptics | P1 |
| Riposte | `riposte` | alvo em stagger + ataque | crítico | P2 |
| Golpe nas costas | `backstab` | contexto valido | crítico/posição | P2 |
| Receber golpe leve | `hit_react_light` | dano recebido | flinch | **P0** |
| Receber golpe forte | `hit_react_heavy` | dano alto | recuo | P1 |
| Perder poise | `stagger` | poise zerado | vulnerabilidade | P1 |
| Cair/levantar | `knockdown/getup` | ataque de queda | física/colisão | P2 |
| Curar | `consume/heal` | D-pad cima | aplicação em evento do clip | P1 |
| Conjurar habilidade | `rune_cast` | usar skill | custo/projétil/hit | P1 |
| Pulo contextual | `auto_jump` | corrida + vão | momento de impulso | P2 |
| Escalar/vault | `climb/vault` | ledge contextual | prende/desprende | P2 |
| Queda/aterrissar | `fall/land` | sair do chão | som/poeira | P2 |
| Interação | `interact/pickup` | Y próximo a objeto | coleta/evento | P1 |
| Morte | `death` | HP=0 | desabilitar controles | P1 |

**Em cada clip cadastrado**, registrar: `source`, `license`, `fps`, `duration`, `loop`, `direction`, `weaponGrip`, `speed`, `rootMotion`, `blendIn`, `blendOut`, `interruptibleFrom`, `cancelWindows`, `events`, `frameAnchors`, `hitboxProfile`. Se não houver metadados reais, começar com valores estimados e marcar como `provisional`.

### 8.1 Não quebrar os assets por formato

- Sprite 2D → carregar texturas e frames com atlas, normalizar pivot de pés e camadas, interpolar transform do objeto principal; crossfade sprite se suportado sem gerar ghosting feio.
- Animação skeletal 2D → respeitar ossos, skins, eventos e blends da biblioteca já usada.
- GLB/FBX 3D → auditar rig, bones, rest pose, root motion, escalas, retarget. **Não inserir clip 3D diretamente numa entidade sprite 2D** e fingir que vai funcionar.
- Procedural → fallback pequeno, preservando paleta e proporção chubby/cabeçuda do personagem. Nunca transformar o Aruan num palito robótico para ganhar movimentos.
- IK → se houver rig, manter mão fixa numa **ponta do arco** e a ponta de impacto alinhada ao golpe; resolver restrições de ombro/cotovelo sem deformar torso.

### 8.2 Princípio de continuidade visual

Ao transitar `LIGHT_2 → DODGE_BACK`, congelar por apenas um frame a **pose de saída** como referência do blend; iniciar a animação nova a partir do estado corrente, preservar continuidade de posição e corrigir pé no solo. Não voltar instantaneamente a `idle` entre as duas animações. Se o renderer não permite verdadeiro crossfade, fazer sobreposição curta de poses/offsets e retiming sem duplicar silhuetas.

---

## 9. HIT FEEL: PORRADA QUE ENCAIXA E TEM CONSEQUÊNCIA

Cada golpe possui 5 fases perceptíveis:

1. **Antecipação (windup)**: ombro, pé e arco sinalizam direção e peso; curta em ataque leve, longa no carregado.
2. **Aceleração do swing**: ponta do arco lidera movimento; pequeno trail e som de ar.
3. **Contato exato**: hitbox ativa somente na passagem da arma, aplicar dano **uma vez** e resposta do alvo.
4. **Impacto**: hitstop sutil, sacudida de câmera localizada, recoil da mão/corpo, efeito curto, som e haptics condicionais.
5. **Follow-through / recuperação cancelável**: arma e corpo continuam sem rigidez; próximo input inicia blend antes da pose neutra quando autorizado.

### 9.1 Tuning inicial do feedback (valores de projeto)

| Evento | Hitstop | Câmera | Vibração (weak/strong) | Som |
|---|---:|---|---|---|
| Swing sem contato | 0 ms | nenhuma | nenhuma | whoosh |
| Contato leve | 35 ms | shake curtíssimo e suave | 0.20 / 0.12 por 40-65 ms | impacto seco |
| Contato de terceiro golpe | 65 ms | shake curto | 0.38 / 0.42 por 65-90 ms | impacto encorpado |
| Ataque carregado | 75-95 ms | shake moderado | 0.38 / 0.55 por 90-120 ms | impacto pesado |
| Parry bem-sucedido | 65 ms | micro-zoom/shake | 0.48 / 0.34 por 70-100 ms | clang curto |
| Defesa que recebe golpe | 20-40 ms | leve | 0.28 / 0.25 por 60 ms | block |
| Sofrer dano | 40-65 ms | deslocamento direcional | 0.20 / 0.45 por 100 ms | hit/voz |
| Dodge comum | 0 ms | acompanhamento suave | **0 por padrão** | roupa/passada |
| Sprint | 0 ms | zoom mínimo, se necessário | **0 por padrão** | passos/respiração |
| Corrida em colisão forte | 0-25 ms | muito leve | pulso discreto opcional | colisão |

**Não vibrar em toda passada ou em toda corrida continuamente**: isso cansa a mão e dilui o impacto. Haptics priorizam contato, parry, dano e quedas importantes. Expor intensidade ajustável 0-100%, toggle e modo reduzido.

### 9.2 Implementação Web Gamepad haptics

Se o Aruan roda no browser:

```ts
async function playRumble(
  gamepad: Gamepad | null,
  { duration = 65, weak = 0.22, strong = 0.15 } = {}
) {
  const actuator = gamepad?.vibrationActuator;
  if (!actuator || typeof actuator.playEffect !== 'function') return false;
  try {
    await actuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration,
      weakMagnitude: Math.max(0, Math.min(1, weak)),
      strongMagnitude: Math.max(0, Math.min(1, strong)),
    });
    return true;
  } catch {
    return false; // navegador/controle não suporta: nunca quebra gameplay
  }
}
```

**Não chamar `await` dentro do loop crítico de física**: no uso real, despachar `FeedbackBus` sem bloquear frame, limitar concorrência e priorizar eventos importantes. Nova chamada de `playEffect` pode substituir a anterior; consolidar pulsos próximos. `vibrationActuator` possui suporte variável por browser/sistema/controle. Tentar `hapticActuators[0]` somente como fallback após detecção cuidadosa, sem presumir suporte. Não ficar imprimindo erro a cada frame.

### 9.3 Som e efeitos visuais

- Variação discreta de pitch em swings/hits para tirar repetição.
- Whoosh tem que acompanhar a velocidade da ponta do arco, não disparar no início genérico do clip.
- Partícula direcional no ponto de impacto, quantidade contida. Poeira de sola ao correr/frear. Trail apenas nos *active frames*.
- Leitura dos golpes em dimensão reduzida: manter silhueta e contraste local, sem partículas encobrindo o boneco.
- Hit numbers opcionais e discretos. Em combate corpo a corpo, priorizar **reação do inimigo** sobre número voando.
- Camera shake e zoom escaláveis/reduzíveis por acessibilidade, não tremer a interface inteira.

---

## 10. CÂMERA ISOMÉTRICA / 2.5D

Manter exatamente o tipo de câmera já presente no Aruan, mas refinar seu **comportamento**, não copiar enquadramento artístico protegido:

- `cameraFollow` por amortecimento (*critically damped*/lerp dependente de delta), seguindo centro/âncora do personagem sem microtremores.
- Look-ahead leve na direção do movimento e, em lock-on, enquadrar Aruan + alvo sem afastar tanto que eles fiquem microscópicos.
- Sprint: zoom-out sutil de 3-6% e retorno suave opcional.
- Hit forte: shake e ligeiro impacto por 50-100 ms, com deslocamentos pequenos.
- Oclusão: cenários altos devem reduzir opacidade, ocultar seletivamente ou ajustar enquadramento se já houver suporte.
- Não permitir que a câmera atravesse limites ou que trancos de física contaminem a interpolação visual.
- Câmera e personagens devem usar o mesmo tempo de render para evitar judder.
- A mira deve priorizar direção de stick + alvo próximo em cone razoável, com `R3` para lock-on. Se o jogo é 2D sem câmera livre, analógico direito serve para selecionar alvo em vez de girar uma câmera que não existe.

---

## 11. HUD E UI: LEGÍVEL, BONITA, ORIGINAL, FUNCIONAL

**Inspiração funcional**: HUD de action RPG soulslike isométrico: saúde/focus/stamina, quick slots, estados e feedback de combate. **Não copiar ícones originais, fontes, ornamentos ou layouts pixel por pixel** do Wicked; manter identidade visual do Aruan, com hierarquia e economia de espaço equivalentes.

### 11.1 Elementos obrigatórios

- **Canto superior esquerdo**: vida (barra de alto contraste), focus/energia de habilidades e, se fizer sentido, retrato/ícone próprio do Aruan.
- **Stamina**: barra compacta e/ou círculo contextual que aparece quando consumida, recupera fluido, destaca insuficiência sem poluir a tela.
- **Canto inferior esquerdo**: armas/slot principal, item rápido, cura, habilidade ativa e atalhos do controle; ícones dinâmicos Xbox/PS/teclado.
- **Inimigo**: barra de vida próxima ao inimigo ou no topo em boss; poise discretamente separado; indicador de alvo lockado.
- **Contextual**: `Y Interagir`, `A Escalar`, indicações de atravessar borda, coletar item etc., somente quando possíveis.
- **Avisos transitórios**: sem stamina, sem focus, parry bem-sucedido, crítico, poise quebrada, dano recebido.
- **Configurações**: preset gamepad, remap, intensidade rumble, mostrar HUD, shake, zoom, dificuldade/tuning quando houver.

### 11.2 UI não pode bloquear os comandos

- Menus têm modo de foco próprio: enquanto menu aberto, botões navegam HUD, não atacam no mundo.
- Ao fechar menu, limpar botões que estavam `held` para evitar ataque acidental.
- Ao conectar gamepad, trocar hints para Xbox/PS se identificável; se incerto, esquema genérico e opção manual.
- Nada de desenhar só barras falsas. Conectar as barras ao `CombatResources` real via store/eventos.
- Se o projeto já possui HUD, aprimorar seus componentes; evitar segunda UI sobreposta.

### 11.3 Tela de debug para desenvolvimento

Adicionar modo `F3` ou equivalente, inicialmente **desativado**:

```text
STATE: ATTACK_LIGHT_2 | PHASE: RECOVERY 0.64
BUFFER: DODGE_BACK (expires 112ms)
DODGE_ALLOWED: true | stamina: 63/100
INPUT: pad#0 | LX -0.11 LY +0.91 | X up | A down
CLIP: bow_club_attack_02 | blend: 72ms
HITBOX: off | TARGET: training_enemy_01
FPS: 59 | dt: 16.7ms | action transition latency: 16.7ms
```

Fundamental para provar que o input está sendo aceito e identificar se alguma animação está travando o personagem.

---

## 12. IMPLEMENTAÇÃO MODULAR SUGERIDA (ADAPTAR AO REPOSITÓRIO REAL)

Não criar estas pastas se o projeto já tiver equivalentes; reorganizar minimamente:

```text
src/game/
  input/
    InputRouter.*
    GamepadAdapter.*
    KeybindProfiles.*
  character/
    CharacterMotor.*
    ActionResolver.*
    CharacterState.*
    CombatResources.*
  animation/
    AnimationRegistry.*
    AnimationController.*
    AnimationEvents.*
    MovaLabManifest.*
  combat/
    ComboController.*
    AttackData.*
    CombatCollision.*
    HitResolver.*
    DefenseController.*
    AbilityController.*
  feedback/
    FeedbackBus.*
    HapticsManager.*
    CameraFeedback.*
  hud/
    CombatHUD.*
    GamepadHints.*
    ControlsSettings.*
  debug/
    CombatDebugOverlay.*

docs/
  ARUAN_COMBAT_OVERHAUL_REPORT.md
  animation-sources.md
```

### 12.1 Resolver: pseudocódigo orientador

```ts
function updatePlayer(dt: number) {
  const input = inputRouter.sample();
  actionResolver.record(input); // SEM isAttacking global aqui

  const context = getCharacterContext();
  const next = actionResolver.resolve(context);

  if (next && canTransition(currentAction, next, currentTimelineTime)) {
    cancelEffectsOwnedBy(currentAction);       // hitboxes, root movement etc.
    animator.transitionTo(next.clip, next.blendMs);
    currentAction = startAction(next);
    actionResolver.consume(next);
  }

  motor.update(input.movementVector, currentAction, dt);
  combat.advanceTimeline(currentAction, dt);
  animator.update(dt);
  cameraDirector.update(dt);
  feedbackBus.flushNonBlocking();
}
```

O pseudocódigo é só referência. Integrar **à engine, tipos, loop e ciclo de vida que já existem**. Se o loop de física precisa rodar em passo fixo, não substituir por um `requestAnimationFrame` solto paralelo.

### 12.2 Condições cruciais de `canTransition`

- `DODGE` pode superar `ATTACK_NEXT` enfileirado.
- `DEATH`, `STAGGER` e `CRITICAL_EXECUTION` podem ter *locks* próprios.
- `isInvulnerable` depende da janela atual da esquiva, não do nome de state.
- Custos de stamina/focus são debitados **uma única vez no start confirmado da ação**, jamais no botão pressionado caso a ação seja recusada.
- Ações canceladas não podem terminar por callback atrasado e resetar `currentAction` depois que outra começou; usar token/ID de execução.
- `animationended` não é pré-requisito para toda transição: saber `cancelAt` de cada clip.
- Troca de target ou direção precisa acontecer sem reiniciar a mesma animação a cada frame.
- Não registrar eventos ou timers duplicados quando React re-renderizar.

### 12.3 Qualidade e performance

- Alvo de **60 FPS** quando hardware suportar; loop responsivo mesmo a 30 FPS; basear timing em `dt` e timestamp, não em frame fixo para o input.
- Não instanciar partículas, colisores ou objetos por golpe sem pooling quando houver sistema pronto.
- Evitar alocações grandes no loop; hitboxes reutilizáveis; eventos por timeline sem arrays recriados indiscriminadamente.
- Testar mudança rápida de direção, 10 ataques sucessivos, 10 esquivas, entrada/sair de menu, perda de foco e reconexão do gamepad.
- Log limpo; não deixar debug ativo em produção.

---

## 13. TESTES DE ACEITAÇÃO: ARGON, JOGUE/VERIFIQUE OS FLUXOS

Executar testes automatizados onde houver framework e testes manuais/simulados na engine. Não afirmar que testou vibração física sem um gamepad e navegador compatíveis disponíveis.

| ID | Sequência de comandos | Resultado esperado |
|---|---|---|
| T01 | Stick esquerdo gradual | Idle → walk → run, velocidade analógica progressiva, sem drift |
| T02 | Stick 100% + sprint, soltar sprint | Entra em sprint e volta a run sem pose travada |
| T03 | X, X, X com timing de combo | Três golpes diferentes e dano uma vez por swing |
| T04 | X, X, A + stick para trás | O próximo golpe é descartado; esquiva para trás na primeira janela válida |
| T05 | Segurar X, depois A antes do release | Carga cancela corretamente e esquiva acontece |
| T06 | Sprint + X | Ataque em corrida, sem interromper física/bruscamente resetar posição |
| T07 | A, então X na saída da esquiva | Ataque pós-esquiva imediato na janela configurada |
| T08 | LT no timing de ataque inimigo | Parry, foco/reação/hit FX e áudio |
| T09 | Segurar defesa + A | Sai do bloco e esquiva; não aciona ataque por bug de combinação |
| T10 | X durante combo + A com stamina baixa | Sem ataque fantasma; esquiva negada com feedback e locomotion continua |
| T11 | Golpe longe do inimigo | Anima/som de swing, **sem dano, hitstop de hit ou rumble de contato** |
| T12 | Golpe conectado | Encaixe visual, HP diminui, reação do alvo, som, VFX, rumble se disponível |
| T13 | Trocar ângulo do stick durante ataque | Retarget controlado, sem giro instantâneo absurdo |
| T14 | R3 perto de dois inimigos | Lock no mais adequado, troca alvo, indicador coerente |
| T15 | Abrir menu no combate | Input navega UI, não ataca por baixo do menu |
| T16 | Desconectar gamepad segurando sprint | Não fica correndo preso; teclado mantém controle |
| T17 | Alternar preset A/B | Comandos atualizam HUD e comportamento sem reiniciar jogo se possível |
| T18 | Gamepad sem vibração / navegador sem API | Nenhum crash, resto do combate normal |
| T19 | 30s de spam de ataque/esquiva/direções | Nenhum estado sem saída, T-pose, hitbox fantasma ou combo infinito |
| T20 | Build, lint, testes do repositório | Sem novos erros; jogo inicializa no caminho original || S21 | Segurar guard frontal e receber golpe | Block real por impacto, custo stamina, dano mitigado e reação |
| S22 | Segurar guard de costas e receber golpe | Defesa não cobre 360°, recebe dano |
| S23 | Defender golpe com stamina insuficiente | Guard break, janela de punição, animação/feedback |
| S24 | Tentar parry cedo, certo e tarde | Apenas janela correta acerta; erro tem recuperação/punição |
| S25 | Dodge antecipado x dodge no timing correto | I-frames na simulação; só o timing/posicionamento correto evita o dano |
| S26 | Inimigo avisa horizontal e vertical | Telegraphs distintos, hitboxes apenas durante active e recovery punível |
| S27 | Parry correto → riposte no alcance | Janela contextual, 1 hit crítico, sem dano duplicado/teleporte |
| S28 | Esquiva/block/parry sem stamina | Ação recusada com indicação; caminhar/virar permanece operacional |
| S29 | Pressionar comando em janela comprometida | Buffer executa primeira janela válida ou expira sem anim fantasma |

**Métrica de latência**: em `ARUAN_FLUIDO`, input de esquiva válido deve trocar de estado até a próxima atualização do loop (idealmente 1 frame lógico) e iniciar a transição visível imediatamente, ressalvadas as janelas intencionais de compromisso do ataque. Monitorar eventos e medir `press timestamp → accepted → clip started`.

**Métrica de fluidez**: combos não passam por `idle` no meio; esquiva não herda hitbox do golpe anterior; o jogador recupera comando sem esperar o clip inteiro quando existe janela de cancelamento.

---

## 14. TIMEBOX DE 30 MINUTOS: IMPLEMENTE, NÃO FIQUE PLANEJANDO

**Meta:** entregar o melhor *vertical slice* real possível em 30 minutos, **com os fundamentos do combate soulslike (dodge/block/parry/stamina/inimigo) priorizados**, conforme seção 7A.12. Não fingir que é viável terminar um sistema comercial completo de combate, dezenas de animações e UI final nesse intervalo. Se faltar tempo, priorizar o que dá diferença nas mãos do jogador.

### Plano pragmático

| Janela aproximada | Fazer | Evidência |
|---|---|---|
| 00:00–04:00 | Auditar engine/input/assets MovaLab e identificar integração | Arquivos identificados, não chute |
| 04:00–09:00 | InputRouter, gamepad, direção 360, walk/run/sprint, dodge + fallback | Movimento consistente |
| 09:00–17:00 | ActionResolver, 3-hit combo, buffer/cancel windows, clips reais | X-X-X e X-X-dodge fluindo |
| 17:00–22:00 | Hit detection, stamina, block direcional, parry básico com janela, inimigo com telegraph e reação | Combate soulslike realmente reage |
| 22:00–26:00 | HUD conectado, som/hitstop/trail/haptics com fallback | Feedback claro e sem crash |
| 26:00–30:00 | Testes críticos, build, corrigir regressões, commit e relatório | Projeto inicia e mudanças entregues |

**Caso um bloco dependa de asset ausente**, substitua por fallback procedural pontual e prossiga. Não gaste 15 minutos procurando um roll perfeito enquanto o ataque ainda não aceita dodge.

### Hierarquia explícita de entrega

**SOBRESCRITA DA V3:** o núcleo soulslike é mandatório na prioridade P0. A distribuição anterior de `parry/block` em P1 está revogada. Consultar 7A.12. Se não for viável concluir tudo no timebox, priorizar uma versão realmente jogável e informar pendências verificadas.

**P0: obrigatório primeiro (a arquitetura de responsividade é transversal; NÃO implementar só esquiva prioritária)**

- Controle Xbox/teclado respondendo;
- walk/run/sprint + rolagem/quickstep direcional;
- combo básico 3 golpes distintos usando assets disponíveis;
- **arbitragem contextual de ações**: combo→esquiva/defesa/sprint/habilidade com buffers, cancel windows e limpeza;
- leitura contínua do stick durante ações, troca de direção 90°/180° sem travar no clip, motor/pose coordenados;
- hitbox/dano/hit reaction do inimigo;
- stamina real e HUD básico;
- **block direcional por impacto + guard break, parry com janela correta + penalidade por erro, inimigo com dois ataques telegráficos, oportunidade de riposte** (núcleo soulslike V3);
- game buildando/rodando.

**P1: somente após P0 funcionar**

- aprimorar variantes de block/parry (perfect block, diversidade de animações e tuning fino);
- golpe carregado, em corrida e após esquiva;
- target lock;
- habilidade de focus;
- vibração e som por impacto;
- tunagem de câmera e UI.

**P2: se ainda houver tempo, ou deixar preparado**

- carga pesada + shoulder barge;
- escalada/salto contextual;
- 8 direções refinadas e IK dos braços;
- backstab/riposte;
- menus avançados, remapeamento de tudo e múltiplos perfis;
- conjunto completo de inimigos/skills.

**Não desperdiçar tempo criando uma tela bonita que não conversa com as ações reais.** Se P0 não concluiu, documentar precisamente o que faltou. Preferir 5 sistemas funcionando a 20 arquivos vazios.

---

## 15. ENTREGA OBRIGATÓRIA, REGISTRO E GIT

Ao terminar:

1. Liste os arquivos editados/criados e por quê.
2. Execute o build/teste disponível e **reporte resultados reais**, inclusive erros que não conseguiu corrigir.
3. Gere `docs/ARUAN_COMBAT_OVERHAUL_REPORT.md` com: implementado, não implementado, bugs conhecidos, mapa de comandos, decisões de animações MovaLab e fontes de assets externos.
4. Informe quais clips foram usados (`source → action → real/fallback → license`) e quais ainda precisam de substituição para versão definitiva.
5. Se houver Git disponível e o usuário normalmente trabalha com commit/deploy, faça **commit local descritivo** das alterações testadas. **Não dê push/deploy sem conferir a política/fluxo do repositório e não alegue push realizado se não executou.** Não inclua arquivos pessoais, binários pesados não permitidos ou segredos.
6. Mantenha os arquivos existentes de cena/câmera/engine e os controles anteriores compatíveis quando possível.
7. A resposta ao usuário deve começar com **o que de fato ficou jogável**, depois testes, commit/hash (se ocorreu) e pendências objetivas. Sem “implementei tudo” se faltam funcionalidades.

### Definição de pronto do overhaul inicial

O trabalho só merece ser chamado de **primeira versão jogável do overhaul** quando for possível controlar o Aruan num cenário existente e realizar, com gamepad ou teclado: **andar → correr → inverter 180° → sprint → ataque1 → ataque2 → trocar direção → esquiva ou defesa → ataque de retorno → acertar um inimigo com reação e feedback**, sem travamentos nem delay artificial entre comandos. O resto amplia isso.

---

## 16. FONTES E CHECAGEM DA REFERÊNCIA (PARA NÃO INVENTAR COMANDOS)

Fontes consultadas em **25/10/2026**; as versões do Wicked podem mudar. Os valores técnicos deste prompt são **propostas de implementação do Aruan** e não parâmetros publicados do código interno da Moon Studios.

- **Patch oficial Together, 22/01/2026:** https://forum.norestforthewicked.com/t/no-rest-for-the-wicked-together-update-patch-notes-sneak-peak/21726
  - menciona tuning de ataques enfileirados, animações, ataques em corrida, regen de stamina, reações de bloqueio e backstab.
- **Hotfix 3, 26/01/2026:** https://forum.norestforthewicked.com/t/patch-notes-together-hotfix-3/22273
  - mudanças de bindings e hard lock; sprint separado de dodge em teclado/mouse por padrão.
- **Hotfix 8, 10/04/2026:** https://forum.norestforthewicked.com/t/patch-notes-together-hotfix-8/26065
  - melhorias de VFX de parry/crítico; parry falho passou de 0,1 s para 0,3 s no Wicked.
- **Guia com imagem dos controles clássicos de 2024:** https://progameguides.com/no-rest-for-the-wicked/all-controls-in-no-rest-for-the-wicked-keyboard-controller-controls/
- **Outra transcrição dos controles clássicos:** https://www.gameskinny.com/tips/all-no-rest-for-the-wicked-controls-for-keyboard-controller/
- **Guia sobre esquiva e equip load:** https://www.gamerguides.com/no-rest-for-the-wicked/guide/gameplay/basics/equip-load-and-dodging
- **Wiki de estatísticas/equip load (não oficial):** https://nrftw.wiki.gg/wiki/Stats
- **Runes / recursos e armas (não oficial):** https://nrftw.wiki.gg/wiki/Equipment
- **Discussão de bug e configurações de gamepad, 2026:** https://forum.norestforthewicked.com/t/controller-and-keybind-problems/21287
- **Discussão sobre cancelamento e esquiva em 2026 (relatos de jogadores, não declaração oficial):** https://forum.norestforthewicked.com/t/animation-cancelling-for-dodge-or-blink/26261
- **MDN, vibração do Gamepad API:** https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/vibrationActuator e https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator/playEffect

---

### Fontes técnicas adicionais: princípios de programação e animação, não código do Wicked

- **Unreal Gameplay Ability System (bloqueios, cancelamento, habilidades em andamento, tags):** https://dev.epicgames.com/documentation/en-us/unreal-engine/understanding-the-unreal-engine-gameplay-ability-system
- **Unreal Animation Blueprint Blend Nodes (inertialization, pose continuity e limitações):** https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-blend-nodes-in-unreal-engine
- **Unreal Motion Matching (seleção de poses por trajetória e banco de dados):** https://dev.epicgames.com/documentation/unreal-engine/motion-matching-in-unreal-engine
- **Unreal Distance Matching (relação da animação com distância percorrida):** https://dev.epicgames.com/documentation/en-us/unreal-engine/distance-matching-in-unreal-engine
- **Unity AnimatorStateTransition (interrupção e exit time):** https://docs.unity3d.com/ScriptReference/Animations.AnimatorStateTransition.html
- **Unreal Game Animation Sample (offset root, trajectory e IK):** https://dev.epicgames.com/documentation/unreal-engine/game-animation-sample-project-in-unreal-engine

**Essas são referências conceituais verificáveis para o Argon estudar e adaptar; não são requisitos para instalar Unreal/Unity.**

### Referências verificadas para combate soulslike (adicionadas na V3)

- Atualização oficial Together (22/01/2026) com mudanças de parry/Focus, reações de bloqueio, punição a aparos falhos e resistência de chefes ao stagger: https://forum.norestforthewicked.com/t/no-rest-for-the-wicked-together-update-patch-notes-sneak-peak/21726
- Patch oficial Together Hotfix 8 (10/04/2026), penalidade do parry falho reajustada para 0,3s e melhorias de efeito crítico/parry: https://steamdb.info/patchnotes/22725628/
- Discussão técnica COMUNITÁRIA de frames de parry de Wicked (não tomar números do estudo como especificação oficial): https://forum.norestforthewicked.com/t/parrying-frame-data/26049
- Hotfix 3: Run e Dodge podem ser separados nos bindings, melhorias de hard lock em teclado/mouse: https://steamdb.info/patchnotes/21645555/

**Observação de engenharia:** os tempos da seção 7A são *valores iniciais do Aruan*, não engenharia reversa confirmada dos jogos originais.


---

## 17. INSTRUÇÃO FINAL PARA O ARGON

**COMECE A IMPLEMENTAR AGORA, NO PROJETO EXISTENTE.** Seu produto é **o jogo Aruan melhorado**, não outro Markdown. Use este Markdown como contrato de implementação e priorização.

Foco absoluto: **input contínuo + action arbitration + cancel windows para TODAS as ações pertinentes, locomoção 360° e pivôs, transição de golpe para golpe, esquiva/defesa/habilidade sem delay desnecessário, impacto verdadeiro, resposta visual e tátil do controle**. Não aceite soluções em que `attack` bloqueia `dodge`, em que só há uma animação de porrada repetida, em que dano ocorre antes da arma atingir o inimigo ou em que o combate funciona só no teclado.

**Faça a versão P0 testável no timebox de 30 minutos, incluindo o ciclo SOULSLIKE de dodge, block, parry e punição contra inimigo telegráfico, depois P1 se couber.** Se algo não couber, não invente sucesso: entregue o que funciona, registre o restante e preserve o projeto saudável. Não interrompa o fluxo para pedir escolhas que podem ser resolvidas pela auditoria e pelos defaults deste documento.