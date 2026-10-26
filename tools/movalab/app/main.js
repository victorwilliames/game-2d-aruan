'use strict';
/**
 * MovaLab — interface PT-BR com catalogação automática do workspace.
 * Prévia 3D importada dinamicamente; o jogo Aruan continua Canvas 2D independente.
 */
const $=id=>document.getElementById(id);
const state={motions:[],assets:[],motionId:null,characterPath:null,filter:'all',search:'',
  category:'all',pipeline:'all',favorites:false,player:null,duration:0,time:0,playing:false,loop:true,speed:1,frame:0,started:performance.now(),
  request:0,characterRequest:0,loading:false,view:'mesh',viewerError:null,externalMixamo:false,mixamoSearch:null,searchRequest:0,listLimit:80};
const pipelineNames={'catalogued':'Catalogada · fonte ausente','source-present':'Arquivo presente · preparo pendente','converted':'Convertida','technically-validated':'Validada tecnicamente','canvas-preview':'Prévia Canvas disponível','needs-adjustment':'Requer ajuste','prepare-failed':'Falha no preparo','visually-approved':'Aprovada visualmente','gameplay-integrated':'Integrada ao gameplay'};
const categories=['Caminhada','Corrida','Idle','Combate','Ataques','Esquiva','Saltos','Gestos','Reações','Dança','Cinemática','Outros'];
const statusNames={
 'imported':'Importada','needs-mapping':'Precisa de mapeamento','ready':'Pronta para revisão',
 'approved':'Aprovada','exported':'Exportada','error':'Erro'
};
function message(text,bad=false){
 const n=$('toast');n.textContent=text;n.className=(bad?'error ':'')+'show';
 clearTimeout(message.timer);message.timer=setTimeout(()=>n.className='',4400);
}
async function api(endpoint,options={}){
 const r=await fetch(endpoint,options);const body=await r.text();
 let value;
 try{value=JSON.parse(body);}catch{throw Error('O servidor enviou uma resposta inválida.');}
 if(!r.ok)throw Error(value.error||('Erro HTTP '+r.status));
 return value;
}
function timeText(sec=0){
 const m=String(Math.floor(sec/60)).padStart(2,'0');
 const s=String(Math.floor(sec%60)).padStart(2,'0');
 return m+':'+s+'.'+String(Math.floor((sec%1)*100)).padStart(2,'0');
}
const fileSize=n=>!n?'—':(n<1048576?(n/1024).toFixed(0)+' KB':(n/1048576).toFixed(1)+' MB');
function setWarning(text){
 $('rig-warning').textContent=text||'';
 $('rig-warning').hidden=!text;
 $('viewport-note').textContent=text||'Modelo original do FBX. Sem alterações procedurais.';
}
function switchTab(lib){
 $('publish-section').hidden=true;
 document.querySelectorAll('[data-step]').forEach(b=>b.classList.toggle('active',b.dataset.step===(lib?'1':'2')));
 $('library-section').hidden=!lib;
 $('procedural-section').hidden=lib;
 $('nav-library').classList.toggle('active',lib);
 $('nav-procedural').classList.toggle('active',!lib);
 globalThis.MovaLabProcedural?.show(!lib);
}
function element(tag,css,text){
 const n=document.createElement(tag);
 if(css)n.className=css;
 if(text!==undefined)n.textContent=String(text);
 return n;
}
function activeMotion(){return state.motions.find(m=>m.id===state.motionId)||null;}
function filterMotions(){
 const found=state.motions.filter(m=>(state.category==='all'||(m.category||'Outros')===state.category)&&(state.pipeline==='all'||(state.pipeline==='pending'?m.pipeline?.sourcePresent&&!m.pipeline.converted:m.pipeline?.[state.pipeline]))&&(!state.favorites||m.favorite)&&(state.filter==='all'||(m.externalSource&&state.filter==='imported'?!m.pipeline.converted:m.status===state.filter))&&
  (m.externalSource&&state.mixamoSearch?.query===state.search?state.mixamoSearch.ids.has(m.id):[m.name,m.namePt,m.descriptionEn,m.descriptionPt,m.source,m.filename,m.relativeSource,m.tags?.join(' ')].join(' ').toLocaleLowerCase('pt-BR').includes(state.search)));
 return state.mixamoSearch?.query===state.search?found.sort((a,b)=>(state.mixamoSearch.ranks.get(a.id)??1e6)-(state.mixamoSearch.ranks.get(b.id)??1e6)):found;
}
async function searchMixamo(){
 const query=state.search,request=++state.searchRequest;state.mixamoSearch=null;
 if(!query||!state.externalMixamo){listMotions();return;}
 try{const found=await api('/api/mixamo/catalog?limit=500&q='+encodeURIComponent(query));if(request!==state.searchRequest)return;state.mixamoSearch={query,ids:new Set(found.motions.map(m=>m.id)),ranks:new Map(found.motions.map((m,i)=>[m.id,i]))};listMotions();}catch(e){message(e.message,true);}
}
function listMotions(){
 const list=$('motion-list');list.replaceChildren();
 $('total-count').textContent=state.motions.length;
 const visible=filterMotions();
 $('shown-count').textContent=visible.length>state.listLimit?state.listLimit+' de '+visible.length:visible.length+' itens';
 if(!visible.length){
  list.append(element('div','empty-list',state.motions.length?'Nenhum resultado para esta busca.':
     'Nenhuma animação encontrada. Coloque seus arquivos nas pastas do workspace e clique em Atualizar pasta.'));
 }else for(const m of visible.slice(0,state.listLimit)){
  const card=element('button','motion-card'+(state.motionId===m.id?' active':''));card.type='button';
  card.disabled=m.available===false&&!m.externalSource;
  const avatar=element('span','motion-icon','♧'),copy=element('span','motion-copy');
  const title=element('strong','',m.name+(m.available===false?' · arquivo ausente':'')),meta=element('small','',
   (m.durationEstimated?'~':'')+m.duration.toFixed(2)+' s · '+(m.externalSource?m.namePt+' · '+pipelineNames[m.pipeline.state]:m.bones+' ossos · '+(m.relativeSource?.split('/').slice(-2,-1)[0]||m.source)));
  copy.append(title,meta);
  const tag=element('span','motion-tag',m.favorite?'★':m.status==='approved'?'✓':'▶');
  card.append(avatar,copy,tag);
  card.addEventListener('click',()=>selectMotion(m.id));
  list.append(card);
 }
 if(visible.length>state.listLimit){const more=element('button','sub-btn','Mostrar mais80');more.type='button';more.onclick=()=>{state.listLimit+=80;listMotions();};list.append(more);}
 const unplayable=state.assets.filter(a=>a.category!=='personagem'&&!a.supported&&a.format==='FBX');
 if(unplayable.length){
  const label=element('div','list-title');
  label.append(element('span','', 'ARQUIVOS PARA CONVERTER'),element('span','',unplayable.length));
  list.append(label);
  for(const a of unplayable){
   const card=element('button','motion-card unavailable');card.type='button';
   card.append(element('span','motion-icon','!'));
   const copy=element('span','motion-copy');
   copy.append(element('strong','',a.name),element('small','',a.fbxVersion?'FBX '+a.fbxVersion+' · não suportado':'Formato não suportado'));
   card.append(copy);card.addEventListener('click',()=>message(a.name+': '+a.compatibleFor,true));
   list.append(card);
  }
 }
}
function characterOptions(){
 const out=[{name:'Personagem da animação',path:null,supported:true,note:'Malha original quando disponível'}];
 out.push({name:'Aruan 3D Proxy',path:'aruan-proxy',supported:true,note:'Rig humanoide técnico · malha skinned · experimental'});
 const chars=state.assets.filter(a=>a.category==='personagem'||a.category==='animação com malha');
 for(const a of chars){
  out.push({name:a.name.replace(/\.(fbx|glb)$/i,''),path:a.derived?'legacy:'+a.derived.id:a.path,
    supported:a.supported,bytes:a.bytes,version:a.fbxVersion,
    note:a.derived?'FBX'+a.fbxVersion+' convertido · '+(a.derived.report.counts.images||0)+' imagens':a.category==='personagem'?'Modelo 3D do pack':'Animação com malha do Mixamo'});
 }
 return out;
}
function listCharacters(){
 const list=$('character-list');list.replaceChildren();
 const options=characterOptions();
 for(const opt of options){
  const card=element('button','character-option'+(state.characterPath===opt.path?' active':''));
  card.type='button';
  card.disabled=!opt.supported;
  card.append(element('span','character-symbol',opt.path?'♙':'◆'));
  const text=element('span','character-copy');
  text.append(element('strong','',opt.name),element('small','',
   opt.supported?(opt.note+(opt.bytes?' · '+fileSize(opt.bytes):'')):
   ('FBX '+(opt.version||'desconhecido')+' · converter primeiro')));
  card.append(text);
  card.addEventListener('click',()=>selectCharacter(opt.path));
  list.append(card);
 }
}
function showDetails(m){
 $('motion-name').textContent=m?.name||'Nenhuma animação selecionada';
 $('motion-status').textContent=m?(m.externalSource?pipelineNames[m.pipeline.state]:statusNames[m.status]||m.status):'Aguardando seleção';
 $('motion-description').textContent=m?.externalSource?m.descriptionPt+' EN: '+m.descriptionEn+' · Metadados sugeridos, ainda não aprovados visualmente.':'';
 $('mixamo-prepare').hidden=!m?.externalSource||Boolean(m?.pipeline?.canvasPreviewAvailable);$('mixamo-prepare').disabled=m?.available===false;
 $('mixamo-preview').hidden=!m?.externalSource||!m?.pipeline?.canvasPreviewAvailable;
 $('mixamo-progress').textContent=m?.externalSource&&m?.preparation?(m.pipeline.technicallyValidated?'Validação numérica passou. ':'Requer ajuste numérico. ')+'Prévia isolada; aplicação ao gameplay pendente.':'';
 if(m?.lastPreparation&&['failed','interrupted'].includes(m.lastPreparation.state))$('mixamo-progress').textContent=m.lastPreparation.error||'Preparo anterior interrompido. Solicite novamente para retomar.';
 for(const id of ['motion-source','motion-license','motion-state'])$(id).disabled=Boolean(m?.externalSource);
 $('meta-format').textContent=m?.format?.toUpperCase()||'—';
 $('meta-duration').textContent=m?(m.durationEstimated?'~':'')+m.duration.toFixed(3)+' s'+(m.durationEstimated?' (estimada)':''):'—';
 $('meta-frames').textContent=m?.samples??'—';
 $('meta-bones').textContent=m?.bones??'—';
 $('meta-curves').textContent=m?.curves??'—';
 $('meta-bytes').textContent=m?fileSize(m.bytes):'—';
 $('motion-source').value=m?.source||'';
 $('motion-license').value=m?.license||'';
 $('motion-state').value=m?.status||'imported';
 $('motion-category').value=m?.category||'Outros';$('motion-favorite').checked=Boolean(m?.favorite);
 $('breadcrumb').textContent=m?.name||'Nenhuma animação selecionada';
 $('time-end').textContent=timeText(state.duration||m?.duration||0);
 $('empty-view').hidden=Boolean(m);
 $('viewport-title').textContent='PRÉVIA FBX ORIGINAL';
}
async function refreshCatalog({sync=false}={}){
 const btn=$('refresh-folder');btn.disabled=true;btn.textContent='⏳ Lendo arquivos...';
 try{
  if(sync){
   const details=await api('/api/library/sync',{method:'POST'});
   message('Pasta atualizada: '+details.added+' animações novas, '+details.indexCount+' no catálogo.');
  }
  const [lib,source]=await Promise.all([api('/api/motions'),api('/api/assets')]);
  state.motions=lib.motions||[];state.assets=source.assets||[];
  state.externalMixamo=Boolean(lib.externalSources?.mixamo?.enabled);
  globalThis.MovaLabLegacy?.render();
  listCharacters();listMotions();
  const selected=activeMotion();
  if(selected)showDetails(selected);
  if(!selected&&state.motions.length)await selectMotion(state.motions[0].id);
  const n=state.assets.filter(a=>a.category==='personagem').length;
  $('footer-message').textContent=state.motions.length+' animações · '+n+' personagens · '+(state.externalMixamo?'workspace + Mixamo externo':'GitHub/workspace');
 }catch(e){message('Falha ao ler a pasta: '+e.message,true);}
 finally{btn.disabled=false;btn.textContent='⟳ Atualizar pasta';}
}
async function startViewer(){
 try{
  const {MovaViewer}=await import('/viewer3d.js');
  state.player=new MovaViewer($('three-stage'),{
   onWarning:warning=>setWarning(warning),
   onInfo:info=>{
    $('empty-view').hidden=Boolean(info.meshes||state.motionId);
    if(info?.bones)$('meta-bones').textContent=info.bones;
    $('compatibility-report').textContent=info.compatibility?info.compatibility.status+' · '+info.compatibility.mapped+' ossos · '+info.compatibility.missingFingers.length+' canais de dedos sem destino':'Prévia original: sem retarget';
    if(info?.meshes){
      $('viewport-title').textContent=info.skinned?'PERSONAGEM 3D RIGADO':'MALHA 3D ORIGINAL';
      $('viewport-note').textContent=info.mapped?'Animação aplicada ao personagem selecionado':'Prévia do arquivo original';
    }else{
      $('viewport-title').textContent='ESQUELETO ORIGINAL';
      $('viewport-note').textContent='Animação sem malha. Escolha um personagem 3D à direita.';
    }
   }
  });
  if(state.motionId)await selectMotion(state.motionId);
 }catch(e){
  state.viewerError='Falha no visualizador 3D: '+e.message+
    '. Rode npm install --prefix tools/movalab/app e reinicie o MovaLab.';
  setWarning(state.viewerError);message(state.viewerError,true);
 }
}
async function selectMotion(id){
 if(state.converting)return message('Aguarde a conversão em andamento.');
 const m=state.motions.find(x=>x.id===id);if(!m)return;
 if(m.available===false){state.motionId=id;showDetails(m);setWarning('Fonte ausente: recoloque o arquivo do snapshot antes de visualizar.');return;}
 const current=++state.request,previous=state.motionId,previousTime=state.time;
 state.loading=true;
 state.motionId=id;state.playing=false;state.time=0;state.duration=m.duration;
 $('play').textContent='▶';
 $('timeline').max=String(state.duration);
 $('timeline').value=0;$('time-now').textContent=timeText();
 listMotions();showDetails(m);
 if(!state.player){setWarning('Aguardando carregamento do visualizador Three.js...');return;}
 $('viewport-note').textContent='Carregando o FBX original...';
 try{
  const info=await state.player.loadMotion('/api/motions/'+m.id+'/raw',m.format);
  if(current!==state.request||!info)return;
  if(m.externalSource&&!state.characterPath)await selectCharacter('aruan-proxy');
  state.duration=info?.duration||m.duration;
  $('timeline').max=String(state.duration);
  $('time-end').textContent=timeText(state.duration);
  state.player.modeSet(state.view);
  state.playing=true;$('play').textContent='Ⅱ';
 }catch(e){
  if(current===state.request){state.motionId=previous;state.time=previousTime;state.playing=false;state.duration=state.player.duration;listMotions();showDetails(activeMotion());setWarning('Não foi possível reproduzir '+m.name+': '+e.message);message(e.message,true);}
 }finally{if(current===state.request)state.loading=false;
 }
}
async function selectCharacter(path){
 if(state.converting)return message('Aguarde a conversão em andamento.');
 const request=++state.characterRequest,previous=state.characterPath;
 state.characterPath=path;listCharacters();
 if(!state.player){message('Instale o visualizador 3D antes de escolher um personagem.',true);return;}
 $('viewport-note').textContent='Carregando modelo 3D...';
 try{
  const url=path==='aruan-proxy'?path:path?.startsWith('legacy:')?'/api/legacy/assets/'+path.slice(7):path?'/api/assets/raw?path='+encodeURIComponent(path):null;
  const result=await state.player.loadCharacter(url);
  if(request!==state.characterRequest)return;
  if(result&&result.meshes===0)setWarning('Este FBX não contém malha 3D. Escolha outro personagem.');
  message(path?'Personagem selecionado: '+path.split('/').at(-1):'Visualização original restaurada.');
 }catch(e){
  if(request!==state.characterRequest)return;state.characterPath=previous;listCharacters();
  setWarning('Este personagem não pôde ser carregado: '+e.message);
  message(e.message,true);
 }
}
async function saveMetadata(){
 const id=state.motionId;if(!id)return message('Escolha uma animação primeiro.',true);
 try{
  const result=await api('/api/motions/'+id,{method:'PATCH',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({source:$('motion-source').value,license:$('motion-license').value,
       status:$('motion-state').value,category:$('motion-category').value,favorite:$('motion-favorite').checked})});
  const idx=state.motions.findIndex(x=>x.id===id);
  if(idx>=0)state.motions[idx]=result.motion;
  listMotions();showDetails(result.motion);
  message('Informações salvas em workspace/library.json. Versione o arquivo no Git para publicá-las.');
 }catch(e){message(e.message,true);}
}
function animationTick(now){
 const delta=Math.min(.09,Math.max(0,(now-state.started)/1000));
 state.started=now;
 if(state.playing&&state.duration>0){
  state.time+=delta*state.speed;
  if(state.time>=state.duration){
   state.time=state.loop?state.time%state.duration:state.duration;
   if(!state.loop){state.playing=false;$('play').textContent='▶';}
  }
  $('timeline').value=state.time;
  $('time-now').textContent=timeText(state.time);
 }
 $('frame-number').textContent=Math.round(state.time*30);
 $('timeline').value=state.time;$('time-now').textContent=timeText(state.time);
 $('play').textContent=state.playing?'Ⅱ':'▶';
 if(!state.converting&&$('publish-section').hidden)state.player?.setTime(globalThis.MovaLabProcedural?.referenceTime(state.time)??state.time);
 globalThis.MovaLabProcedural?.tick();
 requestAnimationFrame(animationTick);
}
$('search').addEventListener('input',e=>{state.search=e.target.value.trim().toLocaleLowerCase('pt-BR');state.listLimit=80;listMotions();clearTimeout(searchMixamo.timer);searchMixamo.timer=setTimeout(searchMixamo,150);});
document.querySelectorAll('[data-filter]').forEach(btn=>{
 btn.addEventListener('click',()=>{
  state.filter=btn.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('current',x===btn));
  listMotions();
 });
});
document.querySelectorAll('[data-view]').forEach(btn=>{
 btn.addEventListener('click',()=>{
  state.view=btn.dataset.view;
  document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('selected',x===btn));
  state.player?.modeSet(state.view);
 });
});
$('play').addEventListener('click',()=>{if(!state.motionId)return;
 state.playing=!state.playing;$('play').textContent=state.playing?'Ⅱ':'▶';});
$('rewind').addEventListener('click',()=>{state.time=0;$('timeline').value=0;$('time-now').textContent=timeText();state.player?.setTime(0);});
$('loop').addEventListener('click',()=>{
 state.loop=!state.loop;state.player?.setLoop(state.loop);$('loop').classList.toggle('on',state.loop);
});
$('speed').addEventListener('change',e=>state.speed=Number(e.target.value));
$('timeline').addEventListener('input',e=>{
 state.time=Number(e.target.value);state.player?.setTime(state.time);
 $('time-now').textContent=timeText(state.time);
});
for(const [id,key]of [['preview-yaw','yaw'],['preview-x','x'],['preview-z','z']])$(id).addEventListener('input',e=>{const value=Number(e.target.value);if(Number.isFinite(value))state.player?.setPlacement({[key]:Math.max(-500,Math.min(500,value))});});
$('in-place').addEventListener('change',e=>state.player?.setInPlace(e.target.checked));
$('wireframe').addEventListener('change',e=>state.player?.setWireframe(e.target.checked));
$('show-grid').addEventListener('change',e=>{if(state.player){state.player.grid.visible=e.target.checked;state.player.ground.visible=e.target.checked;state.player.dirty=true;}});
document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>state.player?.cameraView(b.dataset.camera)));
$('reset-camera').addEventListener('click',()=>state.player?.frameCamera());
$('save-meta').addEventListener('click',saveMetadata);
$('mixamo-preview').addEventListener('click',()=>{const m=activeMotion();if(m)MovaLabProcedural.openPrepared(m.id).catch(e=>message(e.message,true));});
$('mixamo-prepare').addEventListener('click',async()=>{
 const m=activeMotion();if(!m?.externalSource)return;const id=m.id;$('mixamo-prepare').disabled=true;
 try{
  let job=await api('/api/mixamo/prepare',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
  while(['queued','running'].includes(job.state)){
   if(state.motionId===id)$('mixamo-progress').textContent=job.state==='queued'?'Aguardando na fila de preparo…':'Preparando o movimento localmente…';
   await new Promise(resolve=>setTimeout(resolve,750));job=await api('/api/mixamo/jobs/'+job.id);
  }
  if(!['ready','needs-adjustment'].includes(job.state))throw Error(job.error||job.note||'Preparo interrompido; solicite novamente para retomar.');
  await refreshCatalog();if(state.motionId===id)await MovaLabProcedural.openPrepared(id);
 }catch(e){if(state.motionId===id)$('mixamo-progress').textContent=e.message;message(e.message,true);}finally{if(state.motionId===id)$('mixamo-prepare').disabled=false;}
});
$('refresh-folder').addEventListener('click',()=>refreshCatalog({sync:true}));
$('refresh-empty').addEventListener('click',()=>refreshCatalog({sync:true}));
$('nav-library').addEventListener('click',()=>switchTab(true));
$('nav-procedural').addEventListener('click',()=>switchTab(false));
$('go-procedural').addEventListener('click',()=>switchTab(false));
$('back-library').addEventListener('click',()=>switchTab(true));
$('step-library').onclick=()=>switchTab(true);$('step-canvas').onclick=()=>switchTab(false);
document.addEventListener('keydown',e=>{
 if(e.code==='Space'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){
  e.preventDefault();$('play').click();
 }
});
for(const c of categories){$('category-filter').append(element('option','',c));$('motion-category').append(element('option','',c));}
$('category-filter').addEventListener('change',e=>{state.category=e.target.value;listMotions();});
$('pipeline-filter').addEventListener('change',e=>{state.pipeline=e.target.value;state.listLimit=80;listMotions();});
$('favorites-filter').addEventListener('change',e=>{state.favorites=e.target.checked;listMotions();});
showDetails(null);
startViewer();
refreshCatalog();
requestAnimationFrame(animationTick);
