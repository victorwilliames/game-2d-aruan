# Game 2D - Aruan

Piloto de RPG de ação 2.5D em **Canvas 2D puro**, sem engine, sem WebGL e sem dependências de runtime. O herói, o cenário e os efeitos são desenhados por código; a aparência escolhida no estúdio pode ser salva localmente no navegador e exportada em JSON.

- **Herói:** Aruan, menino arqueiro indígena, reconstruído proceduralmente com esqueleto + IK.
- **Combate:** o arco é usado como porrete em um combo de três golpes.
- **Cenário:** campo de treino isométrico com praça de pedras, ruínas, vegetação e dois bonecos.
- **Sprint atual:** Sprint 7 — Coerência dos contornos ([plano](docs/sprints/aruan-sprint-7.md)). Software daSprint1, Etapas0–11, entregue; aceite físico [Em Revisão](docs/certificacoes/aruan-validacao-fisica.md). Novas mecânicas continuam fora do escopo autorizado.

## Rodar

```powershell
npm start
```

Abre em `http://localhost:5317`. A porta pode ser trocada com a variável `PORT`.

Para a ferramenta de animação, execute `npm run movalab` e acesse `http://127.0.0.1:5320`. [MovaLab Procedural](tools/movalab/README.md) converte animações offline e exporta clipes para o modo experimental do estúdio; o jogo principal continua no Rig V1.

## Testes

```powershell
npm test           # preservação, rig, integração, aparência e JPEGs
npm run test:rig   # IK, arma, apoios, combo e hashes
npm run test:game  # teclas, corrida, cambalhota, combo e cache
npm run test:continuity # giro dos detalhes e assentamento de expressão
npm run test:browser # Chrome/Edge headless, sem janela
```

A suíte Node verifica 10.552 poses, integração de inputs, esquema de aparência e artefatos. O smoke usa o Chrome/Edge instalado, CDP nativo e nenhuma dependência: duas páginas, sete animações, oito direções, teclado, toque, Gamepad API simulada, JSON e persistência. O smoke também verifica que campo e estúdio pausados não repintam sem mudanças; controles, MENU, resize/DPR e retícula continuam respondendo. A inspeção das capturas complementa as verificações automáticas. Celular e Xbox físicos ainda não foram certificados.

## Controles

| Tecla | Ação |
|---|---|
| `WASD` / setas | Andar |
| `Shift` | Correr |
| `Espaço` | Cambalhota |
| Clique | Atacar/mirar; clicar de novo encadeia o combo |
| `B` | Mostrar esqueleto |
| `T` | Câmera lenta |
| `P` | Pausa |
| `R` | Reset |

O link **Estúdio Aruan** abre `inspecao.html`, com oito direções, timeline, close do rosto, inspeção do rig e personalização procedural. Troque roupa, cabelo, faixa e quatro cores; experimente os conjuntos Original/Mata/Terra. **Usar no campo** salva neste navegador. Em **Salvar / carregar JSON**, baixe ou importe uma aparência. **Restaurar** volta ao Aruan original; clique em Usar no campo para também salvar o reset.

## Estrutura

```text
index.html              jogo
inspecao.html           estúdio do personagem
style.css, studio.css   estilos
js/math.js              vetores, projeção isométrica, câmera
js/paint.js             pinceladas, contorno e cel-shading
js/rig.js               corpo, poses, IK, pés e animador
js/appearance.js        esquema, presets, materiais e persistência local
js/customization.js     controles de aparência no estúdio
js/character.js         pintura do corpo, arco e aljava
js/head.js              cabeça, rosto, cabelo e pena
js/world.js             campo, props, colisão e chão em cache
js/effects.js           rastro, partículas, impacto e vento
js/controls.js          teclado, mouse, toque e Gamepad API
js/main.js              loop, estados, combo, HUD e render
js/inspection.js        loop do estúdio
tests/                  regressões em Node
capturas/timelapse/     registro visual numerado
capturas/progressao/    pares curados para retrospectiva
referencias/            material visual de apoio (não usado em runtime)
docs/                   roadmap, documentação histórica e checklist de QA
memory-ai.md            handoff entre IAs (leia antes de alterar)
AGENTS.md               regras rápidas para agentes
```

## Documentação

- **[Checklist completo do projeto](docs/aruan-checklist-completo.md)** — jogo, arte, controles, Rig V2, MovaLab, QA, pendências e inventário das65issues; distingue entrega técnica de aceite físico/artístico.

- **`memory-ai.md`** — estado atual, linha do tempo, arquitetura, invariantes, autoria das sessões de IA, decisões e roadmap. É a fonte de contexto.
- **`docs/roadmap.md`** (e `docs/sprints/aruan-11-etapas.md`) — Sprint 1, Etapas 0–11, dependências e regras de trabalho paralelo.
- **Board oficial (GitHub Projects):** <https://github.com/users/victorwilliames/projects/2> — Sprint 1, Etapas 0–11, tarefas, dependências e status.
- **`docs/auditorias/revisao-referencia.md`** — checklist histórico de QA do piloto do cavaleiro (pré-Aruan).
- **`capturas/timelapse/README.md`** — registro visual do desenvolvimento.
- **`referencias/hero-aruan/sprites-2-5d-ref/GUIA_PARA_O_CODEX.md`** — regras do pack visual.

## Estado e limitações

- Sem inimigos com IA, vida/dano, morte, ondas, áudio, menu inicial, save de progressão ou deploy.
- Toque e gamepad estão implementados e testados por automação; validação em celular e Xbox físicos continua pendente.
- Sem tiro de flecha: o arco é porrete nesta etapa.
- Sem sprites em runtime; as referências são apenas guia visual.
- Capturas são geradas em navegador headless e inspecionadas; comparação visual continua necessária para aceite artístico.
- Arquivos preservados por hash: `js/world.js`, `js/math.js`, `js/paint.js`, `js/effects.js` e `server.cjs`. Alterá-los exige atualizar `docs/aruan-preservacao.json`.

## Repositório

- Código: <https://github.com/victorwilliames/game-2d-aruan>
- Board: <https://github.com/users/victorwilliames/projects/2>
- Roadmap: [`docs/roadmap.md`](docs/roadmap.md)

Smoke sem janela e sem dependências: `npm run test:browser` (Node24 + Chrome instalado; Edge disponível como fallback). Para capturar, use `node tests/headless.cjs NNN-descricao`, substituindo NNN por um número novo. Prefixos existentes são recusados. O servidor usa porta própria, o perfil é temporário e ambos são encerrados; não é benchmark deFPS. `ARUAN_BROWSER` permite selecionar um executável instalado.

Toque: joystick flutuante à esquerda (amplie para correr), botão ATACAR (toque ou arraste e solte para mirar), ROLAR para dodge. Movimento e ataque funcionam com dois dedos. Validação: Chrome headless em retrato/paisagem; celular físico ainda não verificado. Detalhes em [docs/tecnico/aruan-toque.md](docs/tecnico/aruan-toque.md).

Controle Xbox padrão: stick esquerdo andar/correr, direito mirar; A atacar, B rolar, Menu pausar, View esqueleto. Solte botões/sticks após conectar ou recuperar foco. Teclado, toque e controle alternam sem reiniciar. Gamepad API validada com entradas simuladas no Chrome; hardware físico ainda não verificado.




