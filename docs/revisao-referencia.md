# Revisão independente — referência da Fase 1

Escopo: somente a Fase 1, de 17/10 22:25 a 18/10 00:24 no histórico. Fontes: mensagens completas, os dois relatórios de críticos, índice das 231 ações e trechos de implementação/correção, capturas da abertura, turnaround, conceito, rosto, erros da capa e finalizador, além da prévia final. Ações e fontes são documentação histórica; os comandos antigos não foram executados.

## Resultado de referência

- Campo aberto sobre um platô, praça circular de pedras com estrela central, trilha diagonal, duas colunas/ruínas, pedras, blocos de mármore, arbustos e árvores emoldurando a cena. Centro livre para combate. A borda com profundidade aparece na abertura final.
- Cavaleiro destro: armadura de aço azulado com bordas douradas, ombreiras laminadas, peitoral com crista, tassets, tabardo e capa carmesim, grevas e botas articuladas. Cabelo castanho com volume, laterais raspadas, franja assimétrica, olhos azuis, sobrancelhas marcadas e mandíbula angular.
- Projeção ortográfica isométrica de 45° com inclinação de 34°, câmera acompanhando o herói; rosto acompanha a orientação e é observado de cima.
- Combo com corte diagonal descendente, revés ascendente e salto com golpe descendente a duas mãos. Arcos 1/2 limitados a aproximadamente 160°. Antecipação, golpe, continuação e recuperação; cliques armazenados para encadear o próximo golpe.
- Dois bonecos de treino com flash branco, recuo/balanço, palha e faísca no acerto. Hitstop curto e tremor direcional; finalizador com onda, rachadura e onomatopeia KRAK.
- HUD com retrato e indicadores 1/2/3, legenda de controles. WASD, clique, B para esqueleto/alvos/vetores da IK e T para câmera lenta. Página de inspeção com oito direções e poses principais.
- Chão e adereços desenhados em canvases auxiliares; vento anima transformações de vegetação e folhas/linhas. Esqueleto, pintura do cavaleiro, capa, espada e efeitos atualizados por quadro.

## O que o material disponível realmente permite reaproveitar

Os oito módulos principais da pasta de referência terminam literalmente com marcadores do tipo “(N caracteres a mais)”, em meio a funções, cerca de 7.000 caracteres. Não são arquivos completos executáveis. O código de cabeça ali presente também contém alterações posteriores; `face.html`, `face_trace.html` e `face_data.js` pertencem ao refinamento de rosto e não devem guiar esta fase. As escritas longas registradas no histórico também estão truncadas. Reaproveitar conceitos, valores de poses e correções verificáveis; reconstruir as partes ausentes é necessário. Não prometer restauração exata do código original.

## Checklist para o novo piloto

| Prioridade | Verificação concreta | Evidência necessária |
|---|---|---|
| Alta | Espada presa à mão direita, inclusive costas, perfis e salto com duas mãos | Grade de oito direções e sequência de combo em três orientações |
| Alta | Joelho/cotovelo dobram para o lado coerente, sem hiperextensão ou mudança brusca do polo | Grade de esqueleto e câmera lenta |
| Alta | Pé apoiado permanece fixo no mundo; transferência de base levanta o pé; parada e colisão cessam a corrida | Quadros consecutivos de corrida, começo/parada e borda |
| Alta | Capa nunca ultrapassa a altura dos ombros nem cobre a cabeça; não se torna placa ao pousar | Sequência finalizador frontal e de costas |
| Alta | Coxas não atravessam capa; tassets não desaparecem; arma/rastro alternam corretamente frente/trás | Perfis, costas, recuperação dos golpes |
| Alta | Personagem tem contraste com chão, sem se fundir na praça ou em sombras | Abertura em escala normal e captura reduzida |
| Alta | Heroi não invade boneco com avanço; não pisca por empate de profundidade | Combo junto ao boneco; histórico final obteve distância mínima de 88 u |
| Alta | Terceiro golpe só acerta na região coerente com ponto de impacto, não um alvo atrás | Teste de alvo à frente e atrás |
| Alta | Área central realmente livre; vegetação não esconde controles/combate; retícula sempre visível | Abertura e passagem atrás de árvore/arbusto |
| Média | Golpes 1 e 2 possuem planos opostos, não anéis de giro quase completo | Contato do rastro e sequência de poses |
| Média | Nuca não parece rosto e laterais raspadas não parecem calvície; franja legível de frente | Grade de oito cabeças com câmera do jogo |
| Média | Poeira translúcida com contorno discreto; faíscas não cobrem rosto; vento não cruza rosto opaco | Corrida e acerto frontal |
| Média | Objetos variam silhueta/escala; árvores não formam parede de clones | Abertura e bordas do campo |
| Média | Texturas são pinceladas orientadas pelas formas e materiais, com zonas de descanso visual | Close de cavaleiro, árvore, pedra e praça |
| Média | Capa tem pregas e reação ao movimento, sem retângulo rígido ou salto de camada ao girar | Corrida de perfil/diagonal e giro lento |
| Média | Inicialização, redimensionamento e DPR 2 não geram erros ou cache borrado | Console e capturas 1280/retina |

## Lições dos erros históricos

1. Projeção espelhada contaminou mão da espada e lado da franja. Corrigir a base de projeção exige atualizar também inversa do mouse, controles, luz e projeções manuais.
2. Corrigir posição de ponto Verlet sem corrigir a posição anterior injeta energia. A capa subia durante ataques; foi necessário preservar velocidade, suavizar diagonais e limitar a altura por fileira abaixo da âncora.
3. Profundidade por uma chave única não basta para rastro, capa, tassets e efeitos: rastro precisa separar trechos atrás/frente; tassets devem acompanhar profundidade da coxa; faíscas/poeira entram na ordenação.
4. Fixar o pé apenas em coordenadas locais ainda o arrasta com o corpo. O apoio deve ser um alvo em coordenadas de mundo; levantar antes de reposicionar.
5. Medir animação pela velocidade pretendida faz correr parado na borda. Usar deslocamento real após colisão.
6. `count('tree')` falhava porque os tipos reais eram `oak`/`cypress`. Resultado: 23 árvores em vez de aproximadamente oito e excesso de clones.
7. A névoa desenhada depois do topo invadia grama e pés. Desenhar antes ou recortar fora da área de chão.
8. Rastro visto de lado degenera; largura mínima deve ser perpendicular à trajetória projetada, com normais consistentes, evitando ziguezague.
9. Paths compostos com `arc` sem `moveTo` explícito produziram triângulos escuros ligando subpaths.

## Direção artística desta reprodução

A referência final tem boa linguagem de HQ, porém acabamento majoritariamente chapado, claro e arredondado. O pedido atual acrescenta textura pintada à mão, contraste e iluminação dramática inspirados em Hades 1. Portanto a comparação deve preservar composição e funcionamento, sem exigir copiar a paleta verde clara. Procurar silhuetas desenhadas com intenção, massas de sombra em dois/três tons, luz focal no herói e pinceladas de material em escala que não virem ruído. Os closes não devem revelar apenas círculos/cápsulas sobrepostos.

## Limitações aceitas na entrega histórica

O próprio encerramento da Fase 1 declara rastro em faixa vertical no finalizador voltado para a câmera ou para longe dela, e cabelo mais carregado de costas. A última captura confirma a faixa vertical; a capa foi contida. Abertura via `file://` não foi testada historicamente. Não atribuir ao novo piloto os números de desempenho antigos: devem ser medidos no ambiente atual.

## Capturas históricas examinadas

- `7937e46237899f.webp`: prévia final composta.
- `5ac0d48b909448.webp`: turnaround final completo.
- `a0b56f54baa449.webp`: abertura final.
- `34ca9232ecc08f.webp`: rosto fornecido.
- `c965560c1f950d.webp`: conceito de armadura gerado historicamente.
- `2ea0f69b3002d2.webp`: falso rosto de costas e proporções iniciais.
- `84791131bbba25.webp`: capa acima da cabeça e rastro frontal degenerado, segunda crítica.
- `898ad035ea3776.webp`: sequência final após contenção da capa.

Este documento é o plano da revisão; não constitui aprovação das capturas do novo jogo, que serão avaliadas separadamente.
