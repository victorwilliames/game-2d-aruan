'use strict';
globalThis.MovaLabProcedural=(()=>{
 let visible=false,clip=null,presets=[],bank=[],mapping={},mounted=false,previousCharacter=null,queued=false,timer=null,revision=0,referenceReady=Promise.resolve();
 const iframe=$('lab-canvas');
 const post=value=>iframe.contentWindow?.postMessage(value,location.origin);
 const corrections=()=>Object.fromEntries([...document.querySelectorAll('[data-correction]')].map(el=>[el.dataset.correction,Number(el.value)]).concat([['footLock',$('lab-foot-lock').checked]]));
 function setCorrections(value){
  for(const el of document.querySelectorAll('[data-correction]')){if(value[el.dataset.correction]!==undefined)el.value=value[el.dataset.correction];$('out-'+el.dataset.correction).textContent=el.value;}
  $('lab-foot-lock').checked=value.footLock!==false;
 }
 async function loadPresets(){
  try{presets=(await api('/api/presets')).presets||[];const select=$('lab-preset');select.replaceChildren(new Option('Escolha um preset',''));
   for(const preset of presets)select.append(new Option(preset.name,preset.name));
  }catch(e){$('lab-status').textContent=e.message;}
 }
 async function loadBank(){
  bank=(await api('/api/procedural/clips')).clips||[];const select=$('lab-bank'),selected=select.value;
  select.replaceChildren(new Option('Escolha um clipe salvo',''));
  for(const entry of bank)select.append(new Option(entry.name+' · '+entry.duration.toFixed(2)+' s',entry.id));select.value=selected;
 }
 async function mappingUI(){
  const source=state.player?.motion;if(!source)return;
  const {humanoidSlots,captureRest,mapRest,essential,normalize}=await import('/humanoid.js');
  const rest=captureRest(source),container=$('lab-mapping');container.replaceChildren();
  for(const slot of humanoidSlots){
   const label=document.createElement('label'),select=document.createElement('select');label.textContent=slot;select.dataset.slot=slot;
   const auto=rest.byName.get(normalize(slot));select.append(new Option('Automático · '+(auto?.bone.name||'ausente'),'@auto'),new Option('Sem canal','@none'));
   for(const [i,entry]of rest.bones.entries()){const duplicate=rest.bones.filter(e=>e.bone.name===entry.bone.name).length>1;select.append(new Option(entry.bone.name+(duplicate?' · nó '+i:''),duplicate?'@bone:'+i+':'+entry.bone.name:entry.bone.name));}select.value=Object.hasOwn(mapping,slot)?mapping[slot]??'@none':'@auto';
   select.onchange=()=>{if(select.value==='@auto')delete mapping[slot];else mapping[slot]=select.value==='@none'?null:select.value;diagnose();};label.append(select);container.append(label);
  }
  function diagnose(){try{const resolved=mapRest(rest,mapping),missing=essential.filter(n=>!resolved.byName.has(normalize(n)));
   $('lab-map-status').textContent=missing.length?'Falta mapeamento: '+missing.join(', '):'Canais essenciais presentes. '+Object.keys(mapping).length+' escolhas manuais; converta para verificar IK e apoios.';
  }catch(e){$('lab-map-status').textContent=e.message;}}
  diagnose();
 }
 function markers(){
  const list=$('lab-markers');list.replaceChildren();
  for(const event of clip?.metadata?.customEvents||[]){
   const row=document.createElement('li'),seek=document.createElement('button'),remove=document.createElement('button');
   seek.type=remove.type='button';seek.className=remove.className='sub-btn';seek.textContent=event.time.toFixed(3)+' s · '+event.name;remove.textContent='Remover';
   seek.onclick=()=>{state.playing=false;state.time=event.time;};
   remove.onclick=()=>{const i=clip.events.findLastIndex(e=>e.name===event.name&&e.time===event.time);if(i>=0)clip.events.splice(i,1);clip.metadata.customEvents=clip.metadata.customEvents.filter(e=>e!==event);markers();};
   row.append(seek,remove);list.append(row);
  }
 }
 function present(){
  state.playing=false;state.duration=clip.duration;state.time=0;state.loop=clip.loop;
  $('lab-timeline').max=clip.duration;$('timeline').max=clip.duration;
  $('lab-contacts').textContent=clip.contacts.map(e=>'Apoio '+e.side+': '+e.start.toFixed(2)+'–'+e.end.toFixed(2)+' s').join(' · ')||'Nenhum apoio estável detectado; revise o clipe.';
  $('lab-status').textContent=clip.times.length+' amostras · '+clip.contacts.length+' apoios · '+(clip.loop?'loop':'sem repetição')+'. '+(clip.metadata?.warnings||[]).join(' ');
  revision++;if(mounted)post({type:'movalab.clip',clip,requestId:revision});markers();
  $('lab-export').disabled=false;$('lab-save-clip').disabled=false;
 }
 async function loadSaved(){
  if(state.converting)return;const entry=bank.find(e=>e.id===$('lab-bank').value);if(!entry)return;
  try{
   const candidate=await api('/api/procedural/clips/'+entry.id);AruanClips.validate(candidate);
   const source=state.motions.find(m=>m.sha256===candidate.metadata?.sourceSha256&&m.available!==false);
   if(source){await selectMotion(source.id);if(activeMotion()?.sha256!==source.sha256)throw Error('Não foi possível restaurar a referência3D');}
   clip=candidate;clip.metadata||={};$('lab-convert').disabled=!source;$('lab-trim').disabled=!source;$('lab-source-stage').hidden=!source;$('lab-source-name').textContent=source?source.name:'Fonte ausente: somente Canvas disponível; recoloque o original para comparar.';
   setCorrections(clip.metadata?.corrections||{});mapping={...(clip.metadata.mapping||{})};await mappingUI();$('lab-start').value=clip.metadata?.trim?.start||0;$('lab-end').value=clip.metadata?.trim?.end??clip.duration;$('lab-loop').checked=clip.loop;
   present();$('lab-studio').href='http://127.0.0.1:5317/inspecao.html?clip=tools/movalab/workspace/exports/'+entry.filename;$('lab-studio').hidden=false;
  }catch(e){message(e.message,true);}
 }
 function show(value){
  visible=value;const host=$('three-stage');
  if(value){
   $('lab-source-stage').append(host);previousCharacter=state.characterPath;
   const selector=$('lab-reference');selector.replaceChildren();
   for(const option of characterOptions().filter(o=>o.supported&&o.path!=='aruan-proxy'))selector.append(new Option(option.name,option.path||''));
   let hasMesh=false;state.player?.motion?.traverse(o=>{if(o.isMesh)hasMesh=true;});
   const defaultModel=hasMesh?null:state.assets.find(a=>a.supported&&a.category==='animação com malha');
   const selected=defaultModel?.derived?'legacy:'+defaultModel.derived.id:defaultModel?.path||null;
   selector.value=selected||'';referenceReady=selectCharacter(selected);
   state.player?.setInPlace(!$('lab-travel').checked);
   $('lab-source-name').textContent=activeMotion()?.name||'Selecione uma animação na biblioteca.';
   if(clip&&clip.metadata.sourceSha256!==activeMotion()?.sha256){clip=null;mapping={};post({type:'movalab.clear'});$('lab-export').disabled=true;$('lab-save-clip').disabled=true;$('lab-studio').hidden=true;}
   $('lab-source-stage').hidden=false;$('lab-convert').disabled=false;$('lab-trim').disabled=false;
   if(clip){present();$('lab-start').value=clip.metadata?.trim?.start||0;$('lab-end').value=clip.metadata?.trim?.end??clip.duration;}
   else{$('lab-start').value=0;$('lab-end').value=state.player?.duration||state.duration;}
   loadPresets();loadBank().catch(e=>message(e.message,true));mappingUI().catch(e=>message(e.message,true));
  }else{
   state.time=referenceTime(state.time,true);state.duration=state.player?.duration||state.duration;
   $('stage').prepend(host);state.player?.setInPlace($('in-place').checked);
   if(previousCharacter)selectCharacter(previousCharacter);
  }
 }
 function referenceTime(time,force=false){return (visible||force)&&clip&&activeMotion()?.sha256===clip.metadata?.sourceSha256?time+(clip.metadata?.trim?.start||0):time;}
 async function convert(){
  await referenceReady;
  if(state.converting){queued=true;return null;}
  const motion=activeMotion(),source=state.player?.motion;if(!motion||!source){$('lab-status').textContent='Escolha e carregue uma animação na biblioteca.';return null;}
  state.playing=false;state.converting=true;$('lab-convert').disabled=true;$('lab-save-clip').disabled=true;$('lab-export').disabled=true;$('lab-studio').hidden=true;
  try{
   // Give the offline mixer exclusive ownership of source transforms.
   if(state.player.mixer){state.player.mixer.stopAllAction();state.player.mixer.uncacheRoot(source);state.player.mixer=null;}
   const {convertMotion}=await import('/converter.js');
   const oldStart=clip?.metadata?.trim?.start||0,newStart=Number($('lab-start').value);
   const customEvents=(clip?.metadata?.customEvents||[]).map(e=>({...e,time:+(e.time+oldStart-newStart).toFixed(6)}));
   clip=await convertMotion(source,motion,{mapping,loop:$('lab-loop').checked,start:Number($('lab-start').value),end:Number($('lab-end').value),corrections:corrections()},progress=>$('lab-status').textContent='Convertendo hierarquia e alvos IK: '+Math.round(progress*100)+'%');
   clip.metadata.customEvents=customEvents.filter(e=>e.time>=0&&e.time<=clip.duration);clip.events.push(...clip.metadata.customEvents);clip.events.sort((a,b)=>a.time-b.time);
   present();return clip;
  }catch(e){$('lab-status').textContent='Conversão falhou: '+e.message;message(e.message,true);return null;}
  finally{
   // Conversion samples/restores source bones with another mixer. Rebuild bindings:
   // the preview mixer's cached values otherwise leave constant channels in rest pose.
   if(state.player){await state.player.attach();state.player._sampled=false;state.player.setTime(referenceTime(state.time));}
   state.converting=false;$('lab-convert').disabled=false;
   if(queued){queued=false;setTimeout(convert,0);}
  }
 }
 function tick(){
  if(!visible)return;$('lab-play').textContent=state.playing?'Ⅱ':'▶';$('lab-timeline').value=state.time;$('lab-time').textContent=state.time.toFixed(2)+' s';
  if(clip&&mounted)post({type:'movalab.time',time:state.time,direction:Number($('lab-direction').value),travel:$('lab-travel').checked,bones:$('lab-bones').checked});
 }
 $('lab-convert').addEventListener('click',()=>convert());
 $('lab-trim').addEventListener('click',()=>convert());
 $('lab-load').addEventListener('click',loadSaved);
 $('lab-map-reset').addEventListener('click',()=>{mapping={};mappingUI();});
 $('lab-marker-add').addEventListener('click',()=>{
  if(!clip)return;const name=$('lab-marker-name').value.trim();if(!name)return;
  if(clip.events.length>=2000)return message('Limite de marcadores atingido.',true);
  const event={name,time:+Math.min(clip.duration,Math.max(0,state.time)).toFixed(6)};
  clip.metadata.customEvents||=[];clip.metadata.customEvents.push(event);clip.events.push(event);clip.events.sort((a,b)=>a.time-b.time);markers();$('lab-marker-name').value='';
 });
 $('lab-reference').addEventListener('change',e=>{referenceReady=selectCharacter(e.target.value||null);});
 $('lab-play').addEventListener('click',()=>{if(state.player&&!state.converting)state.playing=!state.playing;});
 $('lab-rewind').addEventListener('click',()=>{state.playing=false;state.time=0;});
 $('lab-speed').addEventListener('change',e=>{state.speed=Number(e.target.value);$('speed').value=e.target.value;});
 $('lab-timeline').addEventListener('input',e=>{state.playing=false;state.time=Number(e.target.value);});
 $('lab-travel').addEventListener('change',()=>state.player?.setInPlace(!$('lab-travel').checked));
 for(const el of document.querySelectorAll('[data-correction]'))el.addEventListener('input',()=>{
  $('out-'+el.dataset.correction).textContent=el.value;clearTimeout(timer);if(clip)timer=setTimeout(convert,400);
 });
 $('lab-foot-lock').addEventListener('change',()=>{if(clip)convert();});
 $('lab-save-preset').addEventListener('click',async()=>{
  try{await api('/api/presets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('lab-preset-name').value,corrections:corrections(),mapping})});await loadPresets();message('Preset salvo.');}catch(e){message(e.message,true);}
 });
 $('lab-preset').addEventListener('change',e=>{const preset=presets.find(p=>p.name===e.target.value);if(preset){setCorrections(preset.corrections);mapping={...(preset.mapping||{})};mappingUI();if(clip)convert();}});
 $('lab-export').addEventListener('click',()=>{
  if(!clip)return;const url=URL.createObjectURL(new Blob([JSON.stringify(clip)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=clip.name.replace(/[^\p{L}\p{N}-]/gu,'-')+'.aruan-clip.v1.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 $('lab-save-clip').addEventListener('click',async()=>{
  if(!clip)return;$('lab-studio').hidden=true;try{
   const saved=await api('/api/procedural/clips',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(clip)});
   await loadBank();$('lab-bank').value=saved.clip.id;
   $('lab-studio').href='http://127.0.0.1:5317/inspecao.html?clip=tools/movalab/workspace/exports/'+saved.clip.filename;$('lab-studio').hidden=false;
   message('Clipe salvo na biblioteca procedural. O estúdio usa o servidor do jogo em5317.');
  }catch(e){message(e.message,true);}
 });
 addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==iframe.contentWindow)return;
  if(event.data?.type==='movalab.canvas-mounted'){mounted=true;if(clip)post({type:'movalab.clip',clip,requestId:revision});}
  if(event.data?.type==='movalab.canvas-ready'&&event.data.requestId===revision&&clip){
   clip.metadata.quality=event.data.quality;
   clip.metadata.loopQuality=event.data.loopQuality;
   const quality=event.data.quality;
   $('lab-status').textContent+=(quality.status==='numeric-pass'?' Diagnóstico IK/apoios passou; arte não certificada.':' Requer ajuste: desvio dos pés '+quality.maxFootClamp.toFixed(2)+'; limite inferior da cabeça '+quality.minHeadBottom.toFixed(2)+'. Não classificado como animação pronta.');
   if(event.data.loopQuality?.status==='needs-adjustment')$('lab-status').textContent+=' Requer ajuste na junção do loop: '+event.data.loopQuality.maxFootSeam.toFixed(2)+' unidades no pé.';
  }
  if(event.data?.type==='movalab.canvas-error')$('lab-status').textContent=event.data.error;
 });
 return Object.freeze({show,tick,convert,loadSaved,referenceTime,get clip(){return clip;}});
})();
