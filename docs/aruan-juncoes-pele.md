# Sprint3 / Etapa15 — Junções da pele

A referência aprovada tem pele contínua; o render mostrava uma divisão rígida entre os volumes do braço/antebraço e coxa/canela. A mudança conserva os dois preenchimentos, raios, seeds e profundidades, mas recorta a tinta interna coberta pelo segmento vizinho. O Canvas2D faz o recorte nativo por regra evenodd; não há interseções JavaScript por aresta nem hull atravessando a dobra. A sombra dos membros é menos espessa para aproximar a leitura da pele.

O rig, BODY, poses, tempos, mãos/pés, equipamento e material de pele não mudam. Ombros/cotovelos/joelhos continuam acompanhando os mesmos pontos IK. O preenchimento de um segmento nunca preenche o espaço entre os dois ossos. Arco/aljava/três flechas e a ordenação de profundidade mantêm seus dados anteriores. Nenhum arquivo preservado mudou.

## Evidência visual e geométrica

Canvas real: tinta dentro do segmento vizinho alpha0, contorno exposto alpha255; junção alpha255 e interior de uma dobra controlada alpha0. Esse teste observa pixels e protege tanto a continuidade quanto o espaço vazio. npm test mantém10.552poses e os mesmos erros de ossos/grip/apoios. A regressão de giro dos dedos continua em0,5404 por grau.

Capturas021 revisadas em oito direções, três presets, sete animações e tiras de seis frames, inclusive cambalhota e golpes. O par008 daSprint3 compara o preset Original no instante0, câmera e1600×900 iguais. O antes é o marco019; a comparação acumulada inclui também a suavização pequena de visibilidade dos dedos do020, sem atribuí-la à mudança de junção. Os marcadores de apoio são iguais nas duas imagens.

## Trabalho de pintura, sem alegar FPS

Comparação focal no mesmo Chrome headless/host,740×360/DPR2,240amostras por condição e30de aquecimento, usando tests/browser-performance.js com PilotBenchmarkSamples240. Cada amostra mede update/render explícitos; perfis novos e condições equivalentes. Valores emms:

| Código / condição | Mediana | p95 | p99 | Máximo |
|---|---|---|---|---|
| Base37dc7e6 / normal | 3,5 | 5,0 | 7,3 | 8,4 |
| Base37dc7e6 /192partículas | 3,5 | 4,9 | 7,4 | 15,2 |
| Junção nativa / normal | 3,4 | 4,8 | 12,3 | 22,0 |
| Junção nativa /192partículas | 3,6 | 4,6 | 5,2 | 5,7 |

O custo típico permaneceu próximo, mas houve picos isolados; não se conclui estabilidade de FPS ou performance de celular real a partir desses números. O smoke completo adicional também passou, com zero erro de console/rede ou PNG de referência em runtime.180JPEGs técnicos e8pares curados conferem. Hardware físico e seus gates continuam pendentes, conforme aruan-validacao-fisica.md.
