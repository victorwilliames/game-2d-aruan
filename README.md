# Game 2D - Aruan

Piloto de RPG de ação 2.5D em **Canvas 2D puro**, sem engine, sem WebGL e sem dependências de runtime. O herói, o cenário e os efeitos são desenhados por código; o único estado persistente é o código-fonte.

- **Herói:** Aruan, menino arqueiro indígena, reconstruído proceduralmente com esqueleto + IK.
- **Combate:** o arco é usado como porrete em um combo de três golpes.
- **Cenário:** campo de treino isométrico com praça de pedras, ruínas, vegetação e dois bonecos.
- **Sprint atual:** Sprint 1 — Aruan (personagem, animação e controles). Cenário, arena e novos sistemas ficam para depois da Etapa 10.

## Rodar

```powershell
npm start
```

Abre em `http://localhost:5317`. A porta pode ser trocada com a variável `PORT`.

## Testes

```powershell
npm test           # rig + integração
npm run test:rig   # IK, arma, apoios, combo e hashes
npm run test:game  # teclas, corrida, cambalhota, combo e cache
```

Os testes rodam em Node com DOM/canvas simulados. A verificação visual é manual.

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

O link **Estúdio Aruan** abre `inspecao.html`, com oito direções, timeline, close do rosto e inspeção do rig.

## Estrutura

```text
index.html              jogo
inspecao.html           estúdio do personagem
style.css, studio.css   estilos
js/math.js              vetores, projeção isométrica, câmera
js/paint.js             pinceladas, contorno e cel-shading
js/rig.js               corpo, poses, IK, pés e animador
js/character.js         pintura do corpo, arco e aljava
js/head.js              cabeça, rosto, cabelo e pena
js/world.js             campo, props, colisão e chão em cache
js/effects.js           rastro, partículas, impacto e vento
js/controls.js          teclado e mouse
js/main.js              loop, estados, combo, HUD e render
js/inspection.js        loop do estúdio
tests/                  regressões em Node
capturas/timelapse/     registro visual numerado
referencias/            material visual de apoio (não usado em runtime)
docs/                   roadmap, documentação histórica e checklist de QA
memory-ai.md            handoff entre IAs (leia antes de alterar)
AGENTS.md               regras rápidas para agentes
```

## Documentação

- **`memory-ai.md`** — estado atual, linha do tempo, arquitetura, invariantes, autoria das sessões de IA, decisões e roadmap. É a fonte de contexto.
- **`docs/aruan-11-etapas.md`** — Sprint 1, Etapas 0–11, dependências e regras de trabalho paralelo.
- **Board oficial (GitHub Projects):** <https://github.com/users/victorwilliames/projects/2> — Sprint 1, Etapas 0–11, tarefas, dependências e status.
- **`docs/revisao-referencia.md`** — checklist histórico de QA do piloto do cavaleiro (pré-Aruan).
- **`capturas/timelapse/README.md`** — registro visual do desenvolvimento.
- **`referencias/hero-aruan/sprites-2-5d-ref/GUIA_PARA_O_CODEX.md`** — regras do pack visual.

## Estado e limitações

- Sem inimigos com IA, vida/dano, morte, ondas, áudio, menu, save, controles mobile/gamepad implementados ou deploy.
- Sem tiro de flecha: o arco é porrete nesta etapa.
- Sem sprites em runtime; as referências são apenas guia visual.
- Capturas são feitas manualmente e não têm diff automatizado.
- Arquivos preservados por hash: `js/world.js`, `js/math.js`, `js/paint.js`, `js/effects.js` e `server.cjs`. Alterá-los exige atualizar `docs/aruan-preservacao.json`.

## Repositório

- Código: <https://github.com/victorwilliames/game-2d-aruan>
- Board: <https://github.com/users/victorwilliames/projects/2>
- Roadmap: [`docs/aruan-11-etapas.md`](docs/aruan-11-etapas.md)

Smoke/capturas sem janela e sem dependências: `node tests/headless.cjs 006-baseline` (Node 24 + Chrome instalado no Windows). Gera campo, estúdio, oito direções e sete tiras de seis frames JPEG. Usa servidor próprio na porta 15317 e perfil temporário exclusivo; encerra os processos que criou. Não é benchmark de FPS. Escolha um prefixo novo para preservar o timelapse.

Toque: joystick flutuante à esquerda (amplie para correr), botão ATACAR (toque ou arraste e solte para mirar), ROLAR para dodge. Movimento e ataque funcionam com dois dedos. Validação: Chrome headless em retrato/paisagem; celular físico ainda não verificado. Detalhes em [docs/aruan-toque.md](docs/aruan-toque.md).

Controle Xbox padrão: stick esquerdo andar/correr, direito mirar; A atacar, B rolar, Menu pausar, View esqueleto. Solte botões/sticks após conectar ou recuperar foco. Teclado, toque e controle alternam sem reiniciar. Gamepad API validada com entradas simuladas no Chrome; hardware físico ainda não verificado.
