# Sprint4 / Etapa18 — Mechas do cabelo

Comparação de estudo: turnaround aprovado do Aruan, vista frontal/três quartos/costas, e render021. A referência tem franja recortada e mechas largas em massa escura; os painéis procedurais estavam sendo contornados e sombreados individualmente com sulcos contínuos do topo à base, dando leitura rígida de gomos.

O primeiro experimento, só reduzindo o traço, não resolveu a sombra de cada painel e foi descartado como marco visual. O resultado mantido reduz o deslocamento de sombra de2 para0,35unidades, fecha a pequena fresta angular entre painéis adjacentes e usa um traço interno no próprio tom do cabelo. O contorno escuro fica na borda inferior recortada da franja. Cores selecionadas pelo usuário, textura determinística de fios,14painéis, tufos, laterais, pena e profundidade continuam ativos. Sem convex hull extra sobre a face.

A geometria de cada painel e seu fundo classic/cropped seguem os mesmos parâmetros; só as bordas deixam de recuar0,003rad em cada lado. O volume da cabeça, olhos, pintura, rig, equipamento e simulação não mudam. O mapa de rosto permanece exposto nas mesmas poses. Não foi feita alegação de identidade idêntica pixel a pixel: esta é uma alteração de desenho avaliada por comparação controlada.

Validação: npm test antes/depois de head.js verde,10.552poses/5hashesLF; Chrome headless focal do giro de6ângulos sem erros. O conjunto023 registra a regressão ampla e o par009 deve comparar as grades de aparência original021/023 com a mesma pose, câmera, preset e1600×900. As capturas transitórias dos experimentos não foram versionadas; o registro técnico guarda o resultado aceito.

Limites: sem hardware físico/aceite de celular ou Xbox, notch real ou FPS de display; gates3/17/18/19/22 conservados. O polimento do cabelo não acrescenta expressão, acessório ou mecânica; todo desenho continua procedural.

Revisão final: oito direções, finalizador, esquiva, campo e presetMata/cabelo curto inspecionados; ganho mantido, sem clipping novo observado. Chrome headless completo passou: duas páginas,3presets/7animações/8direções,0erros/referênciasruntime e211JPEGs técnicos. Os buffers novos continuam equivalentes emDPR1/1,25/2 e estáveis sem redraw. Par009 compara021/023 em grade original1600×900. A pequena leitura triangular no topo durante o finalizador já existe na021 e fica registrada para estudo posterior; não foi causada por esta alteração.
