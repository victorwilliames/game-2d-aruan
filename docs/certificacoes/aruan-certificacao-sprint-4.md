# Sprint 4 — Certificação da identidade procedural

Base: `9c633c8`, cópia limpa destacada do repositório, sem instalar dependências. Alteração de arte em `cdaa265`, checkpoint/par curado em `caa1f24`. Escopo: continuidade das mechas e preservação da franja/face em classic/cropped. Não certifica os gates físicos3/17/18/19/22.

## Cobertura

- npm test:10.552poses, IK/grip/apoios e integração em agendas30/60/144, aparência/importação/persistência, continuidade e artefatos.
- Cinco SHA-256 canônicosLF e blobs deHEAD conferem com docs/aruan-preservacao.json; nenhum arquivo preservado alterado.
- Chrome headless completo: duas páginas,3presets×7animações×8direções; teclado/foco, CDPtouch3viewports, GamepadAPIstandard simulada, JSON por download/arquivo e aplicação no campo.
- Pausa do campo/estúdio estável sem repinturas; controles e Menu porRAF respondem. Buffers retido/forçado/restaurado equivalentes emDPR1/1,25/2; resize e retículaCSS preservados.
- 211JPEGs técnicos com assinatura/MIME conferidos,18JPEGs curados em9pares. O conjunto023 tem30capturas; par009 compara021/023 original, câmera/pose/resolução1600×900 iguais.

Revisão visual: grades frontal/perfis/costas, finalizador, esquiva, campo em tamanho de jogo e presetMata/cabelo curto. Os sulcos escuros deixaram de dividir rigidamente a massa do cabelo; a borda inferior da franja, face, laterais e pena permanecem legíveis. Textura/cor selecionada pelo usuário e profundidade continuam procedurais. Não foi observado clipping novo.

A pequena faceta clara no topo do cabelo durante o finalizador frontal já é visível na021. Foi registrada para diagnóstico posterior, sem atribuir sua causa antes de isolar cabeça, equipamento e rastro. Não bloqueia a comparação desta alteração, pois antecede o refinamento.

## Limites

Testes não certificam celular/Xbox físicos, notch real, sensação de controle ou FPS de display. Perda de buffer é simulada por apagamento+evento, não por falha física deGPU. Nenhuma janela visível aberta. Sem nova mecânica, dependência, build, engine, WebGL ou referênciaPNG em runtime. Simulação1/120s, IK, grip pela extremidade, aljava/três flechas, apoios e mundo em cache permanecem cobertos.

Project2 auditado ao vivo: tarefa39 e etapa38 fechadas;41 depende38;40 aguarda41;37 aguarda38/40. Cards17/18EmRevisão,19Bloqueado,3EmRevisão e22Bloqueado conservam suas relações. Nova frente segura futura: diagnosticar a faceta do topo com comparação isolada, mantendo só correção mensurável e sem mascarar geometria com um hull que cubra a face.

Trabalho de pintura observado nesta execução headless: desktop120amostras mediana8,6ms/p95 15,1ms; estresse192partículas8,8/12,6ms. Mobile40amostras:360×740=8/11,1ms;740×360=8,7/11,2ms;320×568=7,3/13,2ms. Números instrumentados, variáveis entre execuções e sem equivalência a FPS físico. Não justificam mudar qualidade de arte isoladamente.

Resultado final: OK; duas páginas,7animações/8direções,3presets; console/rede0erros,0referênciasPNG emruntime;211JPEGsMIME; sem novas capturas nesta rodada limpa.
