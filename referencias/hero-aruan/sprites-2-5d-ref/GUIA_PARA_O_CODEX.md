# Aruan — pack visual 2.5D

## O que este pack entrega

37 PNGs separados: 8 vistas, 2 poses de idle, 4 de caminhada, 4 de corrida, 9 de combate, 4 de esquiva, 3 acessórios e 3 efeitos. Todos têm transparência alpha real. Não há pranchetas para recortar nesta pasta.

O objetivo é orientar a reconstrução e a animação procedural do personagem. As imagens são poses-chave independentes, com variações de escala, perspectiva e detalhes. Não constituem animações prontas para reproduzir em sequência, um rig ou um modelo 3D. A alternância dos membros, os pivôs e a continuidade precisam ser definidos ao construir a animação.

## Referências principais

- Corpo, acabamento e câmera: 01_VISTAS/vista_3_4_frente_oposta.png.
- Identidade do rosto e desenho da pintura: 01_VISTAS/pedacos/referencia_rosto_aruan.png. Esta referência prevalece sobre pequenas variações das poses.
- Arco definitivo: 04_PROPS/arco_artesanal_final.png.
- Aljava: 04_PROPS/aljava_com_tres_flechas.png.
- Flecha: 04_PROPS/flecha_artesanal.png.

## Aparência a preservar

- Cabeça grande, corpo pequeno, pele acobreada, pés descalços e roupa vermelha simples.
- Olhos estreitos e horizontais conforme o desenho de referência.
- Faixa vermelha sobre os olhos e faixa geométrica preta nas bochechas: preservar desenho, posição e proporção.
- Cabelo preto/castanho muito escuro, franja em blocos e mechas laterais. Uma pena azul e ocre.
- Contornos escuros, sombras em blocos e textura pintada discreta. Aparência de HQ com cel-shading, inspirada em Hades 1.
- A câmera permanece elevada: aparecem o topo da cabeça, ombros e pés.

## Direções

Os nomes indicam orientações visuais; não representam uma câmera matematicamente calibrada.

| Arquivo em 01_VISTAS | Orientação na tela |
| --- | --- |
| vista_frente_3_4_cima.png | Frente |
| vista_3_4_frente_oposta.png | Frente para a direita |
| vista_perfil_3_4_direita.png | Perfil direito |
| vista_costas_diagonal.png | Costas para a direita |
| vista_costas_frontal_cima.png | Costas |
| vista_costas_3_4_oposta.png | Costas para a esquerda |
| vista_perfil_3_4_esquerda.png | Perfil esquerdo |
| vista_3_4_frente_diagonal.png | Frente para a esquerda |

## Equipamento e combate

Em idle, caminhada, corrida e esquiva, as mãos ficam livres e o arco permanece preso nas costas junto da aljava. A bandoleira atravessa o peito. Durante as porretadas, somente o arco vai para as mãos: aljava e flechas continuam nas costas.

Há um único arco. Madeira clara, vermelho desgastado no meio, pontas pretas e corda clara grossa, trançada como cipó, com nós visíveis. Segurar pela extremidade, deixando a maior parte do arco livre como alavanca. Nunca deslocar a pegada para o centro durante a porretada. O arco deve continuar fino e rústico.

Padronizar três flechas na aljava ao reconstruir o personagem; a perspectiva e a sobreposição nas ilustrações podem ocultar partes delas. A flecha isolada faz parte da referência do equipamento. Não há sequência de tiro neste pack.

## Poses

| Pasta em 02_ANIMACOES | Conteúdo |
| --- | --- |
| idle | Neutro e inspiração |
| andar | Extensão, passagem, contato oposto e passagem oposta |
| correr | Apoio, voo, apoio oposto e voo oposto |
| combate_porretada/01_horizontal | Preparação, varrido e recuperação |
| combate_porretada/02_reves | Preparação, impacto e recuperação |
| combate_porretada/03_de_cima | Erguer, impacto descendente e recuperação |
| esquiva | Agachar, entrar no rolamento, rolar e recuperar |

Os nomes descrevem a intenção de cada pose. Ao animar proceduralmente, verificar apoios e alternância dos membros; não pressupor que trocar esses PNGs diretamente produza um ciclo fluido. Para rolar, usar o movimento do corpo e das articulações, mantendo o equipamento preso ao tronco.

## Uso dos arquivos

- O manifesto_assets.json informa dimensões reais, transparência, limites visíveis e caminhos.
- Os limites visíveis são medidos no arquivo; não são pivôs de articulação.
- Não usar o centro da imagem automaticamente como o ponto de contato com o chão.
- Não esticar a imagem para encaixar em outra proporção. Quando usada como sprite, preservar proporção e definir escala e âncora manualmente.
- 03_EFEITOS contém rastro, impacto e poeira isolados. O varrido horizontal também tem um pequeno rastro incorporado à ilustração; tratá-lo como referência ao separar corpo e efeitos na reconstrução.
- Os efeitos de poeira e rastro têm bordas suaves semitransparentes.
- Não espelhar cegamente equipamentos, pena e bandoleira: manter sua posição no corpo ao mudar a direção.

## Organização

A pasta atual do pack é sprites-2-5d-ref. Use como assets ativos somente os 37 arquivos listados em manifesto_assets.json. As imagens auxiliares em 01_VISTAS/pedacos servem apenas como referências visuais. As antigas pastas de versões laterais e de poses substituídas não fazem parte desta pasta.

CATALOGO.html abre uma galeria local com filtros e fundos claros/escuros para consultar os PNGs. Não necessita internet.

## Verificação realizada

As imagens foram inspecionadas visualmente. A leitura dos 37 PNGs confirmou pixels totalmente transparentes em todos eles, nenhum pixel visível com alpha maior que 8 encostado na borda externa, e arquivo legível para cada entrada do manifesto. Essa verificação não avalia a fluidez de uma animação nem transforma as poses em um rig.

As novas imagens foram criadas com o gerador de imagens integrado. Os prompts desta complementação estão em PROMPTS_DA_COMPLEMENTACAO.json.




