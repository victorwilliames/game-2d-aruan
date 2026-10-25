# Sprint 7 / Etapa 24 — Coerência dos contornos

O turnaround aprovado usa contorno de pele castanho. Desde a Sprint 2, braços, mãos, pés e tronco já seguem essa leitura; a mandíbula e as orelhas ainda tinham preto mais pesado. O close 025 mostra a diferença entre cabeça e corpo.

A mandíbula agora usa a tinta castanha dos pés/mãos (#683b2d), com largura 1,1 em vez de 1,4. As orelhas usam a mesma tinta e largura 0,95 em vez de 1,1. As mechas laterais e os tufos passam a usar hair.ink, coerente com a paleta escolhida pelo usuário. surfacePart aceita tinta opcional; chamadas que não a fornecem preservam a tinta padrão. Nenhuma forma ou preenchimento foi alterado.

A comparação controlada em close mostrou uma borda de pele menos pesada e mais coerente com o corpo e a referência. Campo em tamanho de jogo e preset Mata nas oito direções foram revisados: a silhueta, mandíbula, orelhas, franja e pena permanecem legíveis. O ajuste foi mantido por esse ganho; não foram acrescentados detalhes.

Verificação: npm test antes/depois com 10.552 poses e cinco hashes LF; Chrome headless completo com duas páginas, três presets, sete animações, oito direções e console/rede sem erros. Os 144 renders de pálpebras, cinco transições e 216 casos de rastro continuam verdes. Buffers em DPR 1/1,25/2 equivalentes e pausas estáveis.

O conjunto 026 tem 31 JPEGs; total de 303 técnicos. O par012 deve comparar as tiras faciais 025/026 nos mesmos seis tempos, pose, câmera e resolução de 1600×900. É o marco consolidado de coerência da cabeça; não foram guardados ajustes intermediários no curado.

Nenhum arquivo preservado mudou. Sem hardware físico, notch real, sensação dos controles ou FPS de display; gates #3/#17/#18/#19/#22 mantidos. Nenhuma janela visível, dependência, engine, build, WebGL, PNG de referência em runtime ou mecânica nova.

O autor informou troca de modelo durante a tarefa. O registro local do turno confirmou gpt-6.1-sol com esforço medium; o checkpoint passa a registrar essa identificação sem atribuí-la retroativamente às sessões anteriores.
