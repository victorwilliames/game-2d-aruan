# MovaLab — diagnóstico de apoios e inversão

Auditoria em 25/10/2026 sobre `ee811c1`. É um diagnóstico para orientar a correção, não uma declaração de animações prontas. O lote continua com 32/34 clipes numericamente válidos.

## Hard landing

O FBX pousa na ponta dos pés. Em 0,6 s, as alturas dos tornozelos na fonte são 30,7728/21,8718 e as pontas dos dedos estão em 0,54884/0,17678. Inferir o chão pelo percentil dos tornozelos e achatar a orientação dos apoios perde essa geometria.

No Canvas, o pior fundo da cabeça é −1,55453 em 0,833333 s; a mão esquerda chega a −16,118815 em 0,6 s. Não há inversão global: a menor componente vertical do eixo superior do quadril é +0,435619. Não inventar uma cambalhota para esse clipe.

## Falling to roll

Há inversão real do corpo. O pitch contínuo do eixo frontal vai de −21,017° a 354,031°; a menor componente vertical do eixo superior do quadril é −0,679526 em 0,55 s. A pior altura do fundo da cabeça no Canvas é −47,8962 em 0,583333 s; o joelho direito chega a −20,9554 em 0,958333 s.

O apoio direito detectado em 1–1,066667 s conflita com a elevação automática de uma rotação global: nove amostras de apoio seriam deslocadas. A correção precisa preservar ou reavaliar esses contatos, além da continuidade da orientação.

## Limitação do ajuste de altura

O ajuste atual de quadril desloca apenas `pz`, deixando os alvos de mãos em alturas antigas. Um offset de +2 faz o clamp dos braços crescer para 1,54/1,75 unidades nos dois clipes. Transladar também os alvos preserva o alcance, mas não resolve a geometria do chão.

## Ordem de correção

1. Medir sola, ponta e calcanhar nos frames reais; conferir a convenção de tornozelo `fz + 5` do solver e a geometria desenhada pelo pé.
2. Tratar orientação e ponto de apoio juntos, mantendo os anchors em mundo. Não chamar de foot lock um tornozelo imobilizado com a ponta escorregando.
3. Decompor a inversão real em rotação global e pose residual; manter translações, polos e orientação dos pés. Evitar interpolar 359° diretamente para 0°.
4. Reexecutar o lote, transições, junções dos loops e inspeção visual A/B. Não ocultar falhas com altura arbitrária ou diagnósticos mais permissivos.

Uma decomposição investigada, ainda não implementada, usa `Qresidual = Ry(-roll) * Qhips` e `Ppre = pivot + Ry(-roll) * (P - pivot)`, com o pivô V1 `[10, 0, 55]`. O solver pode elevar o corpo durante o roll, por isso a correção não está validada para apoios ativos.
