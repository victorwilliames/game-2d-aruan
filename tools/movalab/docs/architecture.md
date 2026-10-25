# MovaLab Procedural — arquitetura inicial

> Documento de projeto, **não é código funcional**.

## Objetivo e separação

- **Entrada (somente ferramenta):** animação 3D baseada em ossos, como FBX exportado por Mixamo ou Blender.
- **Conversor (somente ferramenta):** extrair tracks, normalizar coordenadas/escala, associar articulações a um perfil, calcular alvos cinemáticos e exportar movimento compatível.
- **Saída (asset leve):** proposta de clip JSON versionado contendo amostras de pose e metadados.
- **Runtime Aruan (futuro):** player interpolando poses do clip e aplicando correções IK antes de desenhar via Canvas 2D. Sem processar FBX ou carregar Three.js no jogo.

## Realidade do rig atual

Segundo `js/rig.js`, a pose é um objeto de campos numéricos: posição/rotação da pelve (`px,py,pz,pYaw,pPitch,pRoll`), tórax (`cYaw,cPitch,cRoll`), cabeça (`hYaw,hPitch`), alvos dos pés (`lfx,lfy,lfz,rfx,rfy,rfz`), posição das mãos (`lha,lhd,lhh,rha,rhd,rhh`) e demais controles. `solveRig` resolve IK analítico de dois ossos. `Animator` usa equações para locomoção e transições de poses para golpes; `FootPlant` gerencia contatos.

O rig NÃO é uma hierarquia padrão de bones do Mixamo. Movimentos de dedo e torções detalhadas podem não ter campo de destino. **Não basta renomear bones.** Precisaremos extrair alvos de extremidades e orientação do tronco, convertê-los ao sistema local, respeitar comprimentos/limites e compensar proporções estilizadas.

## Fluxo incremental

### Marco A — prova de conceito sem alterar o jogo principal

1. Obter um arquivo de caminhada legítimo.
2. Inspecionar seus bones, duração, fps e coordenadas; documentar amostras.
3. Escolher um leitor testável offline, isolado em `tools/movalab/`.
4. Gerar uma pequena sequência em campos da `BASE_POSE` do Aruan.
5. Comparar referência e resultado com validação visual: ritmo, quadril, braços, contato dos pés; não afirmar sucesso apenas por testes automatizados.

### Marco B — runtime opcional

1. Validar clip e campos permitidos; interpolar com passo fixo de 1/120s.
2. Integrar novo estado de animação sem quebrar `Animator` atual.
3. Distinguir translação do personagem (*root motion*) de movimentação local dos pés.
4. Manter `FootPlant`/IK responsável pelo contato do pé em coordenadas de mundo, evitando duplicar controle.
5. Verificar oito direções, escalas do personagem, entrada/saída de estados, uso do arco e desempenho.

### Marco C — aplicativo para diferentes personagens

- Interface para importar arquivo local e escolher perfil de rig.
- Diagnóstico de compatibilidade (bones ausentes, canais ignorados, membros extras).
- Preview A/B e exportação de clip reutilizável.
- Perfis por personagem, sem prometer compatibilidade universal.

## Segurança técnica

- Não mexer em `js/world.js`, `js/math.js`, `js/paint.js`, `js/effects.js` ou `server.cjs`.
- Não publicar/exportar FBX brutos de terceiros no Git ou num pacote comercial.
- Não adicionar dependências ao jogo para atender ao conversor.
- Não atribuir suporte a FBX/Mixamo sem importar e comparar um arquivo real.
- Preservar as decisões do autor sobre gênero do jogo, sprites, renderer e mecânicas.

## Critérios de aceite da prova de conceito

- Um FBX real identificado e inspecionado (não sintético).
- Conversão reproduzível com entrada e saída documentadas.
- Pose coerente frente, lateral e costas, mais oito direções em tamanho de jogo.
- Pés sem deslizar durante apoio, transição sem estalos, arcadas naturais.
- Testes do repositório e evidência visual, com limitações registradas.
- Relatório de custo de CPU/memória antes de prometer escala para NPCs/MMO.

## Dependências pendentes

- Escolha de um arquivo FBX da animação de caminhada pelo autor.
- Aprovação específica antes de acrescentar bibliotecas ao conversor (por exemplo, parser de FBX), caso a prova exija.
- Ambiente capaz de executar testes Node/Chrome para integração posterior.
