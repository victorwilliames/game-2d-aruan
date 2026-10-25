# Etapa24 / #58 — Primeira revisão da locomoção

Prioridade corrigida pelo autor: personagem, movimento natural e fidelidade visual; cenário fora de escopo. Esta é uma alteração do gesto, não um ajuste de cor ou uma alegação de mocap.

## O que mudou

- Braços contralaterais às pernas. A versão anterior avançava a mão e o pé do mesmo lado.
- Mãos com arco vertical e variação de alcance, cotovelos mais flexionados na corrida.
- Transferência lateral de peso e rotação de quadril; tórax defasado e contrabalançado, cabeça compensada.
- Pé em balanço com recuo/passagem/aterrissagem, velocidade horizontal contínua no contato e elevação suave; articulação do pé também na caminhada.
- Absorção de carga na corrida e altura de quadril ajustada ao alcance das pernas. A primeira tentativa excedeu o alcance; foi corrigida sem relaxar os testes.

Não mudaram velocidades máximas, comandos, cenário, comprimentos de osso, grip, equipamento, cache do mundo ou simulação1/120s. Ainda é animação procedural; não foi importado nenhum clipe Mixamo.

## Evidência

npm test antes/depois e uma rodada completa de Chrome headless verdes.10.552poses, cinco hashes, apoios reais, transições, três presets/sete animações/oito direções. Regressão específica em240poses: correlação braço/perna negativa, mãos com arco vertical de3u/12u, transferência lateral de4,6u/2,2u e velocidade dos pés contínua nos contatos. Erros de apoio/clamp do jogo real abaixo de1,6e-14.

[Vídeo comparativo](../capturas/timelapse/027-locomocao-comparacao.webm): antes à esquerda, depois à direita. Usa Animator/FootPlant antigos de a0425ef e atuais dentro do update/render reais do jogo, com o mesmo comando, câmera, cenário e física. Não é a animação independente do estúdio. São180amostras renderizadas, seis segundos simulados em1/120s, caminhada seguida de corrida. O trecho de corrida é reposicionado igualmente nas duas versões para manter espaço; o final inclui aproximação de obstáculo e desaceleração. O recorte é ampliado, sem alterar o zoom do index.

A gravação headless foi mais lenta que a simulação; somente a escala temporal do contêiner WebM foi normalizada para os seis segundos simulados, sem alterar os quadros. Decodificação no Chrome confirmou1600×900, duração5,999991s e nenhum erro. Não é benchmark deFPS.

As tentativas com duas páginas simultâneas falharam por encerramento do navegador; o ensaio final compartilha um único mundo em cache e estados de simulação separados, reduzindo memória. Processos/perfis próprios foram encerrados/limpos. Nenhuma janela visível foi aberta.

Tiras027 antes/depois: seis frames da caminhada no jogo real, mesmos tempos/enquadramento. Par012 em progressao/sprint-7. São somente dois JPEGs e um vídeo deste marco, sem novo lote de31capturas.

## O que falta

A qualidade visual geral continua em revisão; esta entrega não declara o personagem polido nem equivalente ao Mixamo. Próximas prioridades no mesmo bloco: cobertura/fidelidade dos movimentos (#59) e formas/volumes/dobras mais próximas da referência (#56). Hardware físico eFPS de display não certificados. As remoções de pesquisas do usuário foram preservadas fora destes commits.
