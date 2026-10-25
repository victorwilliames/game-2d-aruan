# Aruan V2 — rig humanoide + MovaLab Procedural

**Status:** arquitetura proposta / início da V2. **O jogo ativo ainda usa o rig V1.**

**Referência imutável da V1:** commit [`1aadd07`](https://github.com/victorwilliames/game-2d-aruan/tree/1aadd07f4bef562d347f5366b8918f5a1cf559cf) e tag anotada `aruan-v1-rig-original` — [registro V1](aruan-v1.md).

**Sincronização:** documentação integrada em `master` pelo PR #62 (merge `ac8b558`, 25/10/2026). Em seguida, o ChatGPT publicou `175d220..e2df137` com o leitor FBX binário offline, o avaliador de hierarquia e o perfil de 65 ossos. Nenhum código de rig, renderer ou animação do jogo foi alterado por essas integrações.

## Como interpretar as versões

- **Aruan V1:** estado já versionado no commit/tag acima, com `js/rig.js` e arte procedurais originais.
- **Aruan V2 em desenvolvimento:** evolução estrutural do rig e importação de clips sem descartar o funcionamento atual.
- **MovaLab Procedural:** ferramenta de desenvolvimento **offline**, em `tools/movalab/`, que pretende converter animações de outros esqueletos para as poses do Aruan. Já lê FBX binário e avalia a hierarquia de 65 ossos do Mixamo; ainda não faz retarget nem playback no Canvas. Não é uma engine nem deve entrar como dependência runtime.
- `master` é a **branch principal atual** (equivalente ao que muitos chamam de `main`). Nenhum ZIP ou cópia de projeto é necessário.

## Princípios inegociáveis

1. **Renderer:** Canvas 2D procedural, sem substituir sprites/artwork nem adotar WebGL.
2. **Pose e rig:** suporte humanoide hierárquico V2, com pais, transforms locais, convenções de eixos, escala e rest pose documentadas.
3. **IK/contato:** comprimentos invariantes; pés apoiados em mundo; retargeting nunca substitui automaticamente o FootPlant.
4. **Identidade:** estilo chibi, cabeça grande, equipamento/aljava/flechas, arco segurado pela ponta e combo de três golpes.
5. **Animações atuais:** não apagar `BASE_POSE`, `Animator` ou `solveRig` do V1 até equivalência funcional/visual.
6. **Handoff:** toda IA deve ler `memory-ai.md`, este documento e o registro V1 antes de alterar rig ou pipeline.

## Caminho de migração

**1. Fundamento, paralelo:** adicionar `rig-v2` isolado, com hierarquia de bones e transformações globais calculadas a partir das locais. Não ativar no jogo por padrão.

**2. Compatibilidade V1:** construir adaptador que reproduza/represente os estados atuais a partir do V2; antes/depois em oito direções, headless e invariantes.

**3. MovaLab:** o leitor FBX binário offline e o perfil de 65 ossos já foram implementados e testados com o `Walking.fbx` real enviado pelo autor (o FBX **não** é commitado). Falta validar base/bind, root motion, escala, orientações de joelho/cotovelo e exportar um conjunto controlado de amostras.

**4. Evoluir a renderização:** se houver dedos articulados, adicionar controle das formas desenhadas pela arte procedural; ossos não tornam dedos visíveis sozinhos. Não assumir que todos os movimentos Mixamo são compatíveis.

**5. Aceite e ativação:** `npm test`, `npm run test:browser`, avaliação visual de caminhada/combate/roll, apoio dos pés, performance, sem regressão de arte e autorização do autor.

## Fluxo de branches — decisão do autor

O autor prefere trabalhar na branch principal e evitar criação acumulada de branches. Branches abertas anteriormente devem ser auditadas antes de mesclar; não integrar trabalho antigo já contido em `master` nem conteúdo incompleto/conflitante sem inspeção. Branches temporárias que precisarem existir devem ser integradas e descartadas ao final. **Não apagar ou reescrever o histórico para limpar branches.** A V1 fica preservada pelo commit e pela tag `aruan-v1-rig-original`.

## Estado atual (sincronização de 25/10/2026)

- PR [#62](https://github.com/victorwilliames/game-2d-aruan/pull/62) integrado em `master` no merge `ac8b558`; `tools/movalab/` e este documento estão versionados.
- Commits `175d220..e2df137`: leitor FBX binário offline, avaliador de hierarquia, perfil de 65 ossos e testes com `Walking.fbx` real (65 ossos, 315 curvas, 32 instantes, 1,0333 s). O FBX original não é versionado.
- Issue [#60](https://github.com/victorwilliames/game-2d-aruan/issues/60): estrutura documental concluída; o leitor é uma ferramenta offline, não um conversor completo.
- Issue [#61](https://github.com/victorwilliames/game-2d-aruan/issues/61): Rig V2/MovaLab **em andamento**; marcos A–F ainda não concluídos.
- **Ainda não entregue:** retarget aplicado à bind pose chibi, player/playback no Canvas, animação retargetada reproduzida no Aruan, dedo articulado e aceitação visual.
