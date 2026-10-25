# Etapa 4 — Câmera (#13)

Câmera segue o personagem com damping 7,5 e deadzone de 3 pixels físicos. A antecipação vem da velocidade projetada (160 ms), limitada a 40/25 unidades em X/Y e suavizada com damping 8. Cursor não participa do alvo. Em telas estreitas, a influência do follow cresce de 0,72 a 1, para manter o herói inteiro no quadro. O centro é limitado a uma fração do raio projetado do campo.

Reset limpa shake/antecipação e posiciona a câmera no alvo inicial; o passo seguinte não produz salto. A pausa congela a simulação. Zoom, altura isométrica e mundo em cache permanecem os mesmos. O fundo externo ao platô é parte intencional do cenário existente, não um buraco de renderização.

Validação Node e Chrome headless: oito bordas × 1600×900/360×740 × DPR1/2. Pés e cabeça permanecem dentro da área segura; estado finito, reset estável. Movimento, dodge e combo continuam passando. Console do jogo/estúdio sem erros, capturas 009 revisadas; cache=1. Shake mantém amplitude3/6 e decaimento25, com ajustes de acessibilidade previstos na Etapa6. Sem FPS de display nem teste físico de enjoo ou hardware móvel.
