# Sprint 1 — Baseline e critérios de saída (#10)

Base: 7306470. Etapa 0 auditada: testes, hashes, cache e páginas continuam íntegros; #1/#2 permanecem fechadas. #4 e #8 estão concluídas. Evidências: 005 antes/depois e 006-baseline (campo, estúdio, oito direções e sete tiras de seis frames).

## Estado medido e intencional

Canvas 2D procedural; passo fixo de 1/120 s; caminhada 125 u/s, corrida 290 u/s; dodge 240 u/s por 0,84 s. Integração de 0,6 s: caminhada 66,584 u, corrida 154,475 u. Ossos/grip/apoio com erro máximo ~7e-14 nas 5.816 poses; cache do chão = 1. O arco é porrete e muda costas/mão; aljava com três flechas é permanente. Não há tiro, inimigos, progressão ou mecânica nova nesta execução.

Aceleração e frenagem atuais usam damping 14: tempo analítico até 90% de velocidade ≈164 ms; giro usa damping 16 (≈144 ms até 90%). Há inércia ao inverter o movimento. Câmera segue 63% da projeção com damping 3; não possui deadzone/look-ahead. Dodge percorre nominalmente 201,6 u antes de colisões.

| Golpe | Contato | Encadeamento | Total | Avanço |
|---|---:|---:|---:|---:|
| Horizontal | 0,42 s | 0,43 s | 0,98 s | 24 u |
| Revés | 0,32 s | 0,34 s | 0,86 s | 23 u |
| De cima | 0,51 s | 0,59 s | 1,13 s | 32 u |

A sequência por cliques espaçados acerta três vezes. O buffer atual é um booleano: múltiplos cliques rápidos podem virar uma única intenção; a fila não tem idade/limite. Dodge só começa em move; não há cancelamento da recuperação. Estes são problemas a tratar, não features certificadas.

## Inventário priorizado e dono

| Prioridade | Problema observável ou lacuna | Etapa / arquivos |
|---|---|---|
| P0 | Falta limpeza por visibilitychange/pointercancel; textarea/contenteditable não protegidos; input pode acumular durante pausa | 2 / controls.js, main.js, tests/game.cjs |
| P0 | Frenagem/reversão dependem da mesma curva lenta de aceleração; parada precisa de teste junto à borda e pés | 3 / main.js, rig.js, #7 |
| P1 | Câmera não tem deadzone/look-ahead; reset deixa câmera anterior | 4 / main.js |
| P0 | Cliques rápidos colapsam em booleano; cancelamento de dodge ausente | 5 / main.js, rig.js, #6 |
| P1 | Finalizador tem rastro potencialmente degenerado em frente/costas; efeitos precisam de medição controlada | 6 / effects.js, main.js |
| P1 | Retorno do dodge e troca brusca da pose merecem revisão; equipamento atravessa a projeção do cabelo nas costas (distinguir oclusão de interseção) | 7 / rig.js, character.js, head.js, #5 |
| P1 | Toque e gamepad ainda não implementados; HUD pequeno sem layout dedicado | 8–9 / controls.js, index.html, style.css |
| P0 | Falta matriz completa de inputs, viewports, DPR e limites; benchmark físico indisponível | 10 / testes, #9 |
| P2 | Personalização procedural ainda ausente; só depois do portão | 11 / painel e pintores |

## Metas mensuráveis

- Input consumido até o próximo passo fixo (≤8,333 ms de simulação; não é latência física ponta a ponta). Vetores de oito direções com norma ≤1, diagonal sem bônus. Perder foco/ocultar documento esvazia teclas e buffer.
- Reversão começa na direção nova no próximo passo; frenagem abaixo de 5 u/s em ≤150 ms. Medir deslocamento real após colisão para animar, manter IK/grip/stance <1e-6.
- Combate preserva três intenções válidas, trava direção por golpe e permite dodge só após a janela ativa. Testar antecipação, contato, recuperação, spam, alvo à frente/atrás e borda.
- Câmera independente do cursor, convergente em idle, sem descontinuidade ao pausar; reset coerente. Comparar 1600×900 e tela pequena, DPR 1/2.
- Animação: comparar seis frames por ação no mesmo enquadramento, grade 8 direções em 1x e close; rejeitar popping e clipping grave. Expressão e silhueta orientadas pelas referências locais, sem importar PNG em runtime.
- Toque: alvos ≥48 CSS px, movimento e ataque simultâneos, cancelamento de ponteiros. Gamepad: deadzone, botões por borda, desconexão e troca de dispositivo sem tecla presa. Testes simulados obrigatórios; hardware explicitamente pendente se indisponível.
- Performance: coletar custo de update/render em amostra controlada, sem chamar frameMs de FPS. Cache continua 1 e efeitos limitados. Nenhuma dependência nova.

## Referências e leitura visual

Comparação efetiva com a identidade aprovada em referencias/hero-aruan: cabeça grande, pele acobreada, cabelo escuro em massas, expressão determinada, faixa vermelha, pintura preta geométrica e pena azul/ocre. #4 reduziu as maiores diferenças no rosto. Hades/Diablo/League são referências de sensação e hierarquia do pedido, não benchmarks executados nem assets copiados. Cenário fica preservado. Não acrescentar armadura incompatível com o traje vermelho simples aprovado.

## Verificação e limites

npm test verde e Chrome headless nas duas páginas, console sem erro. Sequências de idle/walk/run/dodge/3 golpes renderizadas, JPEG/MIME conferidos. A pedido explícito do autor, todas as verificações são headless: não foi aberta janela real. Portanto não foi medido desempenho de display nem sensação física dos controles; não há celular ou Xbox físico disponível. Isso não bloqueia o trabalho simulável. A Etapa 2 pode começar com os critérios acima sem decisão de produto pendente.
