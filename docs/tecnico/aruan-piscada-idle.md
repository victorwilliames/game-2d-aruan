# Sprint6 / Etapa22 — Piscada de idle

Estudo visual: olhos fechados nas expressões aprovadas do Aruan. A alteração mantém sobrancelhas, pintura, silhueta e identidade; só as pálpebras fecham e reabrem brevemente durante o idle.

Uma variável numérica blink integra a pose. A cada4,8s, a janela3,16–3,28s fecha em40ms e abre em80ms com easing. Não usa aleatoriedade nem relógio de parede. A respiração mantém2,4s; o ciclo idle do estúdio passa a4,8s, contendo duas respirações e uma piscada, sem cortar o loop. Movimento secundário do idle preserva o período anterior.

Campo e estúdio compartilham idleBlink. A locomoção mistura o fechamento com a pose de movimento; ataque e esquiva interpolam da pose atual para as poses de olhos abertos. Portanto iniciar uma ação durante o fechamento não dá um salto direto ao olho aberto, e todos os três golpes estão com olhos abertos antes do primeiro key terminar, antes do ativo. Pausar congela a mesma pose da simulação1/120s.

## Evidência focal

- Animator real por9,6s: duas piscadas, pico1, exposição total0,2333s amostrada e variação máxima0,3208 por passo1/120s.
- Cinco transições reais verificadas: três ataques, movimento e esquiva; abertura suave e olhos abertos no ativo.
- Canvas real:144renders=3presets×8direções×2estados×3DPR. Esclera no fechamento completo=0pixels. Frente originalDPR1 passou de362pixels de esclera para0; perfis35→0. Costas/diagonais posteriores idênticas byte a byte entre aberto/fechado.
- Momento do fechamento em campo e estúdio coincide; tira de seis frames em3,14/3,17/3,20/3,23/3,26/3,30s revisada, sem mudança de identidade.

O antes do par curado deve vir do checkout limpo00dfb35, com o mesmo drawView, tempos absolutos, câmera frontal/close e1600×900. O renderer anterior não pisca; a nova inspeção contém duas respirações, mas a fórmula respiratória e o movimento secundário permanecem os mesmos nesses tempos. A tira mostra a diferença temporal de forma controlada; não é uma nova mecânica ou um preset de humor.

Nenhum arquivo preservado foi alterado. O teste completo antes da mudança passou; a rodada posterior de npm test e Chrome headless será registrada no checkpoint. Sem hardware físico, notch real, sensação dos controles ou FPS de display; gates3/17/18/19/22 mantidos. Nenhuma janela visível, dependência, build, engine, WebGL ou PNG de referência emruntime.


Resultado final: npm test antes/depois verde,10.552poses/5hashesLF e continuidade real. Chrome headless completo passou com144renders de pálpebras,216casos de rastro,3presets/7animações/8direções, inputs/JSON/buffers e0erros/referênciasruntime.31JPEGs025, total272técnicos/11pares; tira facial, sequênciaidle e par011 revisados. O ganho de naturalidade foi mantido sem alterar identidade ou leitura de combate.
