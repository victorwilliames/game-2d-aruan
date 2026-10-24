# Instruções para agentes de IA

Este projeto é usado por várias ferramentas (OpenCode, Codex, Antigravity, Claude etc.). Leia estas regras antes de alterar qualquer coisa.

## 1. Leia a memória primeiro

Abra **`memory-ai.md`** inteiro. Ele contém:

- quem foi a última IA e o que ela fez;
- estado verificado do projeto;
- arquitetura e invariantes;
- decisões já tomadas e decisões pendentes;
- roadmap e backlog.

## 2. Registre sua sessão

Antes de terminar, atualize em `memory-ai.md`:

1. o bloco **“ÚLTIMA SESSÃO”** (data, ferramenta, modelo, o que fez);
2. uma linha no **“REGISTRO DE IAs”** (append-only, nunca apague).

Diga o que verificou e o que **não** conseguiu verificar.

## 3. Rode os testes

```powershell
npm test
```

Antes e depois de mudanças em `rig.js`, `character.js`, `head.js`, `main.js` ou `controls.js`.

## 4. Respeite os invariantes

- Canvas 2D puro; sem engine, WebGL ou dependências novas sem pedido explícito.
- Simulação em passo fixo de 1/120 s.
- IK com comprimentos de osso invariantes.
- Arco segurado pela extremidade; aljava e três flechas sempre nas costas.
- Pé de apoio em coordenadas de mundo, sem patinar.
- Mundo pintado uma vez em cache.
- Nenhum PNG de referência é carregado em runtime.

## 5. Cuidado com os hashes

Estes arquivos são preservados por SHA-256 em `docs/aruan-preservacao.json`:

- `js/world.js`
- `js/math.js`
- `js/paint.js`
- `js/effects.js`
- `server.cjs`

Se precisar alterá-los, atualize o JSON de forma consciente e rode `npm test`.

## 6. Verificação visual

Mudou algo visual? Abra `index.html` e `inspecao.html`, confira o console e gere uma captura numerada em `capturas/timelapse/`. Atualize a tabela do README do timelapse.

## 7. Commits

- Padrão: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.
- Descreva o que foi verificado.
- Não faça commit de segredos.
- `referencias/rafaxlab/` e os históricos `docs/fase1-*` / `docs/acao-*` são locais e ignorados pelo Git.

## 8. Decisões que são do autor

Não invente rumo de produto. Pergunte antes de:

- adicionar tiro com arco;
- mudar a estrutura de arena/roguelite;
- trocar arte procedural por sprites;
- adicionar dependências ou build;
- publicar material histórico/privado.

## 9. Definition of Done

- [ ] `npm test` passa.
- [ ] Páginas abrem sem erro de console.
- [ ] Captura atualizada, se mudou visual.
- [ ] Hashes atualizados, se mudou arquivo preservado.
- [ ] `memory-ai.md` atualizado.
- [ ] Commit criado e enviado ao remoto.
