'use strict';
globalThis.MovaPublish=(()=>{
 let current=null,config={version:1,bindings:[]};
 const gameStep=document.querySelector('[data-step="4"]');gameStep.setAttribute('aria-disabled','true');gameStep.onclick=e=>{if(gameStep.getAttribute('aria-disabled')==='true'){e.preventDefault();message('Primeiro aplique a animação na etapa3.',true);}};
 const names={idle:'Parado / idle',walk:'Movimento: caminhar',run:'Movimento: correr',action:'Ação (Xbox / Teclado)','native-dodge':'Ação nativa'};
 function formatBinding(b){
  if(b.slot==='action'||b.slot==='native-dodge'){
   const pad=b.pad?(MovaBindings.padLabels?.[b.pad]||b.pad)+' + ':'';
   return `${names[b.slot]} (${pad}${b.key.replace('Key','')}): ${b.name}`;
  }
  return `${names[b.slot]}: ${b.name}`;
 }
 function conflicts(){
  gameStep.setAttribute('aria-disabled',String(!config.bindings.length));
  $('publish-current').textContent=config.bindings.map(formatBinding).join(' · ')||'Nenhum clipe externo aplicado. O jogo usa as animações originais.';
  const slot=$('publish-slot').value,isAction=slot==='action',key=isAction?$('publish-key').value:null,pad=isAction?$('publish-pad').value:null;
  $('publish-pad-wrap').hidden=!isAction;$('publish-key-wrap').hidden=!isAction;
  $('publish-pad').disabled=!isAction;$('publish-key').disabled=!isAction;
  const existing=config.bindings.filter(b=>b.slot===slot&&(!isAction||b.key===key||pad&&b.pad===pad)||key&&b.key===key||pad&&b.pad===pad);
  const nativeConflict=(key==='Space'&&!config.bindings.some(b=>b.key==='Space'))||(pad==='PadB'&&!config.bindings.some(b=>b.pad==='PadB'))?['Cambalhota (Xbox B / Espaço)']:[];
  const conflict=[...existing.map(b=>b.name),...nativeConflict];
  $('publish-conflict').textContent=conflict.length?'Conflito com: '+conflict.join(', ')+'. Escolha como resolver abaixo:':'Gatilho disponível (sem conflitos).';
  $('publish-resolution-box').hidden=!conflict.length;
  const isNativeOnly=nativeConflict.length>0&&!existing.length;
  for(const opt of $('relocate-slot').options)if(opt.value!=='action')opt.disabled=isNativeOnly;
  if(isNativeOnly)$('relocate-slot').value='action';
  const relocSlot=$('relocate-slot').value,relocIsAction=relocSlot==='action';
  $('relocate-pad-wrap').hidden=!relocIsAction;$('relocate-key-wrap').hidden=!relocIsAction;
  $('relocate-pad').disabled=!relocIsAction;$('relocate-key').disabled=!relocIsAction;
  $('publish-relocate-panel').hidden=!conflict.length||!$('publish-relocate').checked;
  const sameReloc=relocSlot===slot&&(!relocIsAction||$('relocate-key').value===key||$('relocate-pad').value===pad)||relocIsAction&&($('relocate-key').value===key||$('relocate-pad').value===pad);
  const resolved=!conflict.length||$('publish-replace').checked||($('publish-relocate').checked&&!sameReloc);
  $('publish-apply').disabled=!current||!resolved;
 }
 async function show(){
  current=globalThis.MovaLabProcedural?.clip;
  if(!current){message('Converta ou carregue um clipe no Laboratório primeiro.',true);return;}
  state.playing=false;$('library-section').hidden=true;$('procedural-section').hidden=true;$('publish-section').hidden=false;
  document.querySelectorAll('[data-step]').forEach(b=>b.classList.toggle('active',b.dataset.step==='3'));
  const suggested=MovaBindings.suggest(current.name);$('publish-slot').value=suggested.slot;$('publish-key').value=suggested.key;$('publish-pad').value=suggested.pad||'PadX';
  $('publish-replace').checked=false;$('publish-relocate').checked=false;
  $('publish-name').textContent=current.name+' · '+current.duration.toFixed(2)+' s · sugestão: '+names[suggested.slot];
  $('publish-note').textContent='A sugestão usa o nome do clipe; confirme o uso. Foco em Controle Xbox (1º) e Teclado/Mouse (2º); botões touch desativados para esta etapa.';
  try{config=await api('/api/game-bindings');conflicts();}catch(e){message(e.message,true);}
 }
 $('publish-slot').onchange=$('publish-key').onchange=$('publish-pad').onchange=()=>{$('publish-replace').checked=false;$('publish-relocate').checked=false;conflicts();};
 $('publish-replace').onchange=()=>{if($('publish-replace').checked)$('publish-relocate').checked=false;conflicts();};
 $('publish-relocate').onchange=()=>{
  if($('publish-relocate').checked){
   $('publish-replace').checked=false;
   const curKey=$('publish-slot').value==='action'?$('publish-key').value:null,curPad=$('publish-slot').value==='action'?$('publish-pad').value:null;
   const freeKey=['KeyV','KeyF','KeyC','KeyE','KeyQ','KeyZ','KeyX'].find(k=>k!==curKey&&!config.bindings.some(b=>b.key===k))||'KeyV';
   const freePad=['PadY','PadX','PadRB','PadLB','PadRT','PadLT'].find(p=>p!==curPad&&!config.bindings.some(b=>b.pad===p))||'PadY';
   $('relocate-key').value=freeKey;$('relocate-pad').value=freePad;
  }
  conflicts();
 };
 $('relocate-slot').onchange=$('relocate-key').onchange=$('relocate-pad').onchange=conflicts;
 $('publish-back').onclick=()=>{$('publish-section').hidden=true;switchTab(false);};
 $('publish-apply').onclick=async()=>{
  if(!current)return;const button=$('publish-apply');button.disabled=true;
  try{
   const saved=await api('/api/procedural/clips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(current)});
   const resolution=$('publish-relocate').checked?'relocate':$('publish-replace').checked?'replace':null;
   const isAction=$('publish-slot').value==='action',relocIsAction=$('relocate-slot').value==='action';
   config=await api('/api/game-bindings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clipId:saved.clip.id,slot:$('publish-slot').value,key:isAction?$('publish-key').value:null,pad:isAction?$('publish-pad').value:null,replace:$('publish-replace').checked||$('publish-relocate').checked,resolution,relocateSlot:$('relocate-slot').value,relocateKey:relocIsAction?$('relocate-key').value:null,relocatePad:relocIsAction?$('relocate-pad').value:null})});
   $('publish-result').textContent='Aplicado! Abra ou recarregue o jogo. '+current.name+' será usado em '+names[$('publish-slot').value]+(resolution==='relocate'?' (animação anterior realocada).':'.');$('publish-game').hidden=false;conflicts();
  }catch(e){$('publish-result').textContent=e.message;}finally{conflicts();}
 };
 $('publish-reset').onclick=async()=>{try{config=await api('/api/game-bindings',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"clear":true}'});$('publish-result').textContent='Animações originais restauradas. Recarregue o jogo.';conflicts();}catch(e){message(e.message,true);}};
 api('/api/game-bindings').then(value=>{config=value;gameStep.setAttribute('aria-disabled',String(!config.bindings.length));}).catch(()=>{});
 $('lab-publish').onclick=show;$('step-publish').onclick=show;
 $('quality-high').onchange=e=>{state.player?.setQuality(e.target.checked);$('lab-canvas').contentWindow?.postMessage({type:'movalab.quality',high:e.target.checked},location.origin);};
 return {show};
})();
