'use strict';
globalThis.MovaPublish=(()=>{
 let current=null,config={version:1,bindings:[]};
 const gameStep=document.querySelector('[data-step="4"]');gameStep.setAttribute('aria-disabled','true');gameStep.onclick=e=>{if(gameStep.getAttribute('aria-disabled')==='true'){e.preventDefault();message('Primeiro aplique a animação na etapa3.',true);}};
 const names={idle:'Parado / idle',walk:'Movimento: caminhar',run:'Movimento: correr',action:'Ação por tecla'};
 function conflicts(){
  gameStep.setAttribute('aria-disabled',String(!config.bindings.length));
  $('publish-current').textContent=config.bindings.map(b=>names[b.slot]+(b.key?' ('+b.key.replace('Key','')+')':'')+': '+b.name).join(' · ')||'Nenhum clipe externo aplicado. O jogo usa as animações originais.';
  const slot=$('publish-slot').value,key=slot==='action'?$('publish-key').value:null;
  const existing=config.bindings.filter(b=>b.slot===slot&&(slot!=='action'||b.key===key)||key&&b.key===key);
  const conflict=[...(key&&MovaBindings.reserved[key]?[MovaBindings.reserved[key]]:[]),...existing.map(b=>b.name)];
  $('publish-conflict').textContent=conflict.length?'Conflito com: '+conflict.join(', ')+'. Escolha outra tecla/uso ou confirme a substituição abaixo.':'Gatilho disponível.';
  $('publish-key').disabled=slot!=='action';$('publish-apply').disabled=!current||(conflict.length>0&&!$('publish-replace').checked);
 }
 async function show(){
  current=globalThis.MovaLabProcedural?.clip;
  if(!current){message('Converta ou carregue um clipe no Laboratório primeiro.',true);return;}
  state.playing=false;$('library-section').hidden=true;$('procedural-section').hidden=true;$('publish-section').hidden=false;
  document.querySelectorAll('[data-step]').forEach(b=>b.classList.toggle('active',b.dataset.step==='3'));
  const suggested=MovaBindings.suggest(current.name);$('publish-slot').value=suggested.slot;$('publish-key').value=suggested.key;$('publish-replace').checked=false;
  $('publish-name').textContent=current.name+' · '+current.duration.toFixed(2)+' s · sugestão: '+names[suggested.slot];
  $('publish-note').textContent='A sugestão usa o nome do clipe; confirme o uso. Ações por tecla reproduzem a animação, sem criar dano, colisões ou mecânicas de salto. Movimentação continua sob o controle do jogo.';
  try{config=await api('/api/game-bindings');$('publish-current').textContent=config.bindings.map(b=>names[b.slot]+(b.key?' ('+b.key.replace('Key','')+')':'')+': '+b.name).join(' · ')||'Nenhum clipe externo aplicado. O jogo usa as animações originais.';conflicts();}catch(e){message(e.message,true);}
 }
 $('publish-slot').onchange=$('publish-key').onchange=()=>{$('publish-replace').checked=false;conflicts();};$('publish-replace').onchange=conflicts;
 $('publish-back').onclick=()=>{$('publish-section').hidden=true;switchTab(false);};
 $('publish-apply').onclick=async()=>{
  if(!current)return;const button=$('publish-apply');button.disabled=true;
  try{
   const saved=await api('/api/procedural/clips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(current)});
   config=await api('/api/game-bindings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clipId:saved.clip.id,slot:$('publish-slot').value,key:$('publish-key').value,replace:$('publish-replace').checked})});
   $('publish-result').textContent='Aplicado! Abra ou recarregue o jogo. '+current.name+' será usado em '+names[$('publish-slot').value]+'.';$('publish-game').hidden=false;conflicts();
  }catch(e){$('publish-result').textContent=e.message;}finally{conflicts();}
 };
 $('publish-reset').onclick=async()=>{try{config=await api('/api/game-bindings',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"clear":true}'});$('publish-result').textContent='Animações originais restauradas. Recarregue o jogo.';conflicts();}catch(e){message(e.message,true);}};
 api('/api/game-bindings').then(value=>{config=value;gameStep.setAttribute('aria-disabled',String(!config.bindings.length));}).catch(()=>{});
 $('lab-publish').onclick=show;$('step-publish').onclick=show;
 $('quality-high').onchange=e=>{state.player?.setQuality(e.target.checked);$('lab-canvas').contentWindow?.postMessage({type:'movalab.quality',high:e.target.checked},location.origin);};
 return {show};
})();
