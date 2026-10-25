# Aruan V2 — rig humanoide + MovaLab Procedural

**Status:** arquitetura proposta / início da V2. **O jogo ativo ainda usa o rig V1.**

**Referência imutável da V1:** [`1aadd07`](https://github.com/victorwilliames/game-2d-aruan/tree/1aadd07f4bef562d347f5366b8918f5a1cf559cf) — [registro V1](aruan-v1.md).

## Como interpretar as versões

- **Aruan V1:** estado já versionado no commit acima, com `js/rig.js` e arte procedurais originais.
- **Aruan V2 em desenvolvimento:** evolução estrutural do rig e importação de clips sem descartar o funcionamento atual.
- **MovaLab Procedural:** ferramenta de desenvolvimento **offline**, em `tools/movalab/`, que pretende converter animações de outros esqueletos para as poses do Aruan. Não é uma engine nem deve entrar como dependência runtime.
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

**3. MovaLab:** importar e inspecionar o FBX real de caminhada enviado pelo autor (amostra recebida nesta conversa; `Walking.fbx` **não** deve ser commitado). Exportar primeiro um conjunto controlado de amostras; validar base/bind, root motion, escala e orientações de joelho/cotovelo.

**4. Evoluir a renderização:** se houver dedos articulados, adicionar controle das formas desenhadas pela arte procedural; ossos não tornam dedos visíveis sozinhos. Não assumir que todos os movimentos Mixamo são compatíveis.

**5. Aceite e ativação:** `npm test`, `npm run test:browser`, avaliação visual de caminhada/combate/roll, apoio dos pés, performance, sem regressão de arte e autorização do autor.

## Fluxo de branches — decisão do autor

O autor prefere trabalhar na branch principal e evitar criação acumulada de branches. Branches abertas anteriormente devem ser auditadas antes de mesclar; não integrar trabalho antigo já contido em `master` nem conteúdo incompleto/conflitante sem inspeção. Branches temporárias que precisarem existir devem ser integradas e descartadas ao final. **Não apagar ou reescrever o histórico para limpar branches.** Guardar V1 por commit é suficiente para restauração.

## Estado no começo

- Issue [#60](https://github.com/victorwilliames/game-2d-aruan/issues/60): infraestrutura/documentação MovaLab.
- Issue [#61](https://github.com/victorwilliames/game-2d-aruan/issues/61): Rig V2 humanoide e compatibilidade.
- **Ainda não entregue:** parser FBX, bone solver V2, animação retargetada reproduzida no Aruan, dedo articulado e aceitação visual.
