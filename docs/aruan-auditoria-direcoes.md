# Auditoria das oito direções — #4

Base: 02c7a74. Evidências: capturas 005-antes/depois (campo, estúdio e grade). Chrome headless, DPR 1, viewport 1600×900. Referência principal: referencia_rosto_aruan.png, estudada localmente; nenhum asset foi introduzido em runtime.

## Decisão visual

As maiores diferenças de rosto eram sobrancelhas triangulares muito altas, pupilas sem área de branco legível e linhas claras radiais no cabelo. Reduzi a altura das sobrancelhas, mantive a pupila dentro do olho e reduzi contraste/densidade das pinceladas. Os painéis agora têm uma separação menor e franja com recorte mais irregular. Mantidos proporção chibi, pele acobreada, faixa vermelha, chevrons, cabelo escuro e pena azul/ocre.

| Direção | Inspeção antes/depois |
|---|---|
| S | Dois olhos e boca legíveis; sobrancelhas suavizadas; orelhas com volume |
| SE | Olho distante ocluído pela curvatura; mecha enquadra a bochecha |
| L | Apenas a borda frontal do rosto aparece; nuca não recebe rosto |
| NE | Nuca contínua, orelha parcialmente ocluída e pena presa ao crânio |
| N | Nenhum olho/boca nas costas; orelhas em lados consistentes |
| NO | Mesmo comportamento de nuca, preservando assimetria do equipamento |
| O | Mecha e orelha ocluem o rosto de forma coerente |
| SO | Olho frontal legível; pena preserva o lado do personagem |

Grade revisada em tamanho nativo e reduzida; campo revisado em escala de jogo. O rosto conserva expressão determinada sem acrescentar detalhes minúsculos. Pena aparece de perfil em L: é a projeção da superfície, não flutuação. O equipamento ainda merece auditoria dedicada na #5; esta tarefa não certifica as animações como polidas.

## Verificação

npm test antes/depois: 5.816 poses, ossos/grip/apoios dentro da tolerância; 3 acertos no combo, cache do chão = 1. Jogo e estúdio sem erros de console. Sete animações renderizadas nas oito direções sem exceção. Nenhum arquivo preservado alterado. Não medidos FPS reais, celular ou Xbox físico.
