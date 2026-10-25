# Etapa 10 — Portão técnico do Aruan

> Auditoria posterior: este é o registro da certificação **automatizada**. O aceite total foi reaberto:17/18 Em Revisão física,19 Bloqueada eSprint1#3 Em Revisão. Ver aruan-validacao-fisica.md; nenhum teste físico é presumido.

Base certificada: `02a7b7f` (regressão executável em `23fbfe2`). Em 24/10/2026, o board ao vivo confirmou as Etapas 1–9 e as filhas #9/#21 fechadas. Nenhum bug P0/P1 conhecido permaneceu aberto; as únicas issues abertas eram a Sprint, este portão e a personalização futura.

| Área | Evidência | Resultado |
|---|---|---|
| Rig e equipamento | 9.880 poses, clearance, três flechas e grip pela ponta | Erros de ossos/grip/apoios abaixo de 3e-14 |
| Movimento | Oito direções, reversão/parada, dodge e bordas | Apoio real abaixo de 1,7e-14; pouso sem impulso residual |
| Combate | 24 contatos direcionais, três cliques rápidos, spam e cancelamento | Um contato por golpe; antecipação preservada; recuperação cancelável |
| Câmera | Oito bordas, dois viewports, DPR 1/2, pausa/reset | Cabeça/pés dentro do quadro e reset estável |
| Inputs | Teclado/mouse, toque nativo CDP, Gamepad API simulada | Troca, foco, multitouch, botões por borda e hot-plug passaram |
| Animação | Sete loops, transições, giros na antecipação e movimentos secundários | Loops fechados, sem giro reverso; silhueta revisada nas oito direções |
| Efeitos | Rastro frente/trás, leitura do rosto, limites e movimento reduzido | Finalizador distinto; coleções limitadas; shake opcional pelo sistema |
| Preservação | Cinco hashes LF, blobs de HEAD e cópia limpa | Todos conferem; nenhum PNG de referência em runtime |
| Artefatos | 113 JPEGs técnicos e cinco pares curados | MIME, assinatura, dimensões 1600×900 e links conferem |
| Acessibilidade | Teclado/Tab nativos, foco visível, nomes/estados e alvos | Desktop ≥32 px e toque ≥48 px |

`npm test` foi executado novamente nesta branch. O mesmo código já passou o smoke completo no checkout limpo da #9: zero erros de console/rede, sete animações, oito direções e três viewports móveis. As capturas 017 foram revisadas, inclusive campo e turnaround. A comparação considera a identidade do rosto, roupa vermelha simples, proporção chibi, pele acobreada, pena azul/ocre e equipamento; não exige copiar pixels de poses independentes.

A simulação permaneceu em 1/120 s. Cadências simuladas de 30/60/144 Hz diferiram em no máximo um passo. Custos de update/render com pacing ficaram em poucos milissegundos nos relatórios, sem serem apresentados como FPS de display. Mundo/cache e as oito árvores foram preservados; não há engine, WebGL, build, dependência nova ou mecânica de produto acrescentada.

Celular/Xbox físicos, notch real, sensação dos controles e desempenho de display não foram verificados. O portão registra qualidade no ambiente automatizado disponível; não é certificação de hardware físico. Nenhuma janela visível foi aberta. A Etapa 11 pode começar; tiros, mapa, inimigos, ondas e progressão continuam fora do escopo.
