'use strict';
/* MovaLab local preview. Draws a projected 3D skeleton/proxy, not Aruan's game Canvas rig. */
const $=id=>document.getElementById(id);
const canvas=$('viewport'),ctx=canvas.getContext('2d');
let library=[],clip=null,selectedId=null,elapsed=0,playing=false,looping=true,speed=1;
let filter='all',mode='skeleton',yaw=-0.40,pitch=0.22,zoom=1;
let lastFrame=performance.now(),frameNumber=0,drag=null,stageW=1,stageH=1;
const statuses={'imported':'Imported','needs-mapping':'Needs mapping','ready':'Ready to review','approved':'Approved','exported':'Exported','error':'Error'};
function toast(message,error=false){
 const node=$('toast');node.textContent=message;node.className=(error?'error ':'')+'show';
 clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.className='',3300);
}
async function request(url,options={}){
 const res=await fetch(url,options),text=await res.text();
 let data;try{data=JSON.parse(text);}catch{throw new Error('Resposta inválida do servidor');}
 if(!res.ok)throw new Error(data.error||('HTTP '+res.status));return data;
}
function formatTime(s){s=Math.max(0,s||0);const m=Math.floor(s/60).toString().padStart(2,'0');const sec=Math.floor(s%60).toString().padStart(2,'0');return m+':'+sec+'.'+String(Math.floor(s%1*100)).padStart(2,'0');}
function bytes(n){return n>=1048576?(n/1048576).toFixed(2)+' MB':(n/1024).toFixed(1)+' KB';}
async function refresh(keep=true){
 const response=await request('/api/motions');
 library=response.motions||[];
 $('total-count').textContent=library.length;
 if(!keep&&!selectedId&&library.length)selectedId=library[0].id;
 renderList();
}
function renderList(){
 const search=$('search').value.toLowerCase().trim();
 const motions=library.filter(m=>(filter==='all'||m.status===filter)&&
 (m.name+' '+m.source+' '+m.status).toLowerCase().includes(search));
 $('shown-count').textContent=motions.length+' items';
 const list=$('motion-list');list.replaceChildren();
 if(!motions.length){const el=document.createElement('div');el.className='empty-list';el.textContent=library.length?'No motion matches this filter':'Your animation library is empty. Import an FBX to begin.';list.append(el);return;}
 for(const m of motions){
  const item=document.createElement('button');item.type='button';item.className='motion-card'+(m.id===selectedId?' active':'');
  const icon=document.createElement('span');icon.className='motion-icon';icon.textContent='♧';
  const copy=document.createElement('span');copy.className='motion-copy';
  const name=document.createElement('strong');name.textContent=m.name;
  const small=document.createElement('small');small.textContent=Number(m.duration).toFixed(2)+'s · '+m.bones+' bones · '+m.source;
  const tag=document.createElement('span');tag.className='motion-tag';tag.textContent=m.status==='approved'?'✓':'›';
  copy.append(name,small);item.append(icon,copy,tag);
  item.addEventListener('click',()=>loadClip(m.id));list.append(item);
 }
}
function details(m){
 $('motion-name').textContent=m?.name||'Nothing selected';
 $('motion-status').textContent=m?statuses[m.status]||m.status:'Waiting for import';
 $('meta-format').textContent=m?.format?.toUpperCase()||'—';
 $('meta-duration').textContent=m?m.duration.toFixed(3)+'s':'—';
 $('meta-frames').textContent=m?.samples??'—';
 $('meta-bones').textContent=m?.bones??'—';
 $('meta-curves').textContent=m?.curves??'—';
 $('meta-bytes').textContent=m?bytes(m.bytes):'—';
 $('motion-source').value=m?.source||'';
 $('motion-license').value=m?.license||'';
 $('motion-state').value=m?.status||'imported';
 $('breadcrumb').textContent=m?.name||'No animation selected';
 $('time-end').textContent=formatTime(m?.duration||0);
 $('viewport-note').textContent=m?(mode==='proxy'?'Approximate chibi proportions · not game retarget':'Mixamo-style diagnostic FBX preview'):'Import an FBX to start preview';
 $('viewport-title').textContent=m?(mode==='proxy'?'ARUAN TECH PROXY':'3D SOURCE SKELETON'):'3D VIEWPORT';
 $('empty-view').hidden=!!m;
}
async function loadClip(id){
 try{
  playing=false;$('play').textContent='▶';
  const data=await request('/api/motions/'+id+'/clip');
  clip=data;selectedId=id;elapsed=0;frameNumber=0;
  details(library.find(m=>m.id===id));
  $('timeline').max=String(data.duration);$('timeline').value='0';$('time-now').textContent=formatTime(0);
  renderList();fitCamera();
  playing=true;$('play').textContent='Ⅱ';
 }catch(e){toast('Unable to preview FBX: '+e.message,true);}
}
async function importFiles(files){
 if(!files.length)return;
 for(const file of files){
  if(!/\.fbx$/i.test(file.name)){toast('Formato ainda não suportado: '+file.name+' (use FBX Binary)',true);continue;}
  const label=document.querySelector('.upload-btn');
  const old=label.textContent;label.textContent='Importing...';
  try{
   const source='Mixamo';
   const result=await request('/api/import?filename='+encodeURIComponent(file.name)+'&source='+encodeURIComponent(source),{
    method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file});
   await refresh();await loadClip(result.motion.id);
   toast(result.duplicate?'Already in library · '+result.motion.name:'Imported into local library · '+result.motion.name);
  }catch(e){toast('Import failed · '+e.message,true);}
  finally{label.textContent=old;}
 }
}
function vectorsAt(t){
 if(!clip?.frames?.length)return null;
 const frames=clip.frames;
 if(t<=frames[0].t)return frames[0].joints;
 if(t>=frames.at(-1).t)return frames.at(-1).joints;
 let lo=0,hi=frames.length-1;
 while(hi-lo>1){const mid=(hi+lo)>>1;if(frames[mid].t<=t)lo=mid;else hi=mid;}
 const a=frames[lo],b=frames[hi],fraction=Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t||1)));
 const result={};
 for(const bone of clip.bones){
  const x=a.joints[bone.name],y=b.joints[bone.name];
  if(!x||!y)continue;
  result[bone.name]=x.map((v,i)=>v+(y[i]-v)*fraction);
 }
 return result;
}
function proxySkeleton(joints){
 // Rig-debug visualization only: scale each skeletal segment by body region,
 // using actual 3D source vectors, not a calibrated bind-pose retarget.
 const out={},byName=new Map(clip.bones.map(b=>[b.name,b]));
 function visit(b){
  if(out[b.name]||!joints[b.name])return;
  if(b.parent&&byName.has(b.parent))visit(byName.get(b.parent));
  const src=joints[b.name];
  if(!b.parent||!joints[b.parent]||!out[b.parent]){out[b.name]=src.slice();return;}
  const parent=joints[b.parent],base=out[b.parent];
  let factor=1;
  if(/(UpLeg|Leg|Foot|Toe)/.test(b.name))factor=.77;
  else if(/(Arm|ForeArm|Shoulder|Hand)/.test(b.name))factor=.82;
  if(/Hand(Thumb|Index|Middle|Ring|Pinky)/.test(b.name))factor=.62;
  if(/Spine|Neck/.test(b.name))factor=.83;
  if(/Head/.test(b.name))factor=1.15;
  out[b.name]=src.map((v,i)=>base[i]+(v-parent[i])*factor);
 }
 for(const b of clip.bones)visit(b);
 return out;
}
function fitCamera(){
 yaw=-.4;pitch=.23;zoom=1;
}
function resize(){
 const box=canvas.getBoundingClientRect();
 const dpi=Math.min(2,window.devicePixelRatio||1);
 stageW=Math.max(1,box.width);stageH=Math.max(1,box.height);
 canvas.width=Math.round(stageW*dpi);canvas.height=Math.round(stageH*dpi);
 ctx.setTransform(dpi,0,0,dpi,0,0);
}
new ResizeObserver(resize).observe(canvas);
function info(joints){
 let min=Infinity,max=-Infinity,root=[0,0,0],count=0;
 const values=Object.values(joints||{});
 for(const p of values){if(!p||p.some(v=>!Number.isFinite(v)))continue;min=Math.min(min,p[1]);max=Math.max(max,p[1]);count++;}
 if(!count)return null;
 const hip=joints.Hips||values[0];root=[hip[0],min,hip[2]];
 return {floor:min,height:Math.max(1,max-min),root,center:[hip[0],min+(max-min)*.52,hip[2]]};
}
function projector(stat){
 const scale=Math.min(stageW*.66,stageH*.83)/stat.height*zoom;
 const co=Math.cos(yaw),si=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 return (p)=>{
  const x=p[0]-stat.center[0],y=p[1]-stat.center[1],z=p[2]-stat.center[2];
  const horizontal=x*co-z*si;
  const depth=x*si+z*co;
  return {x:stageW/2+horizontal*scale,y:stageH*.49+(-y*cp+depth*sp)*scale,depth,scale};
 };
}
function line(a,b,color,width=2,alpha=1){
 ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1;
}
function joint(p,r,color){
 ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
}
function grid(proj,stat){
 const w=stat.height*.68,floor=stat.floor-1;
 for(let i=-5;i<=5;i++){
  const q=i/5*w;
  const a=proj([stat.center[0]-w,floor,stat.center[2]+q]);
  const b=proj([stat.center[0]+w,floor,stat.center[2]+q]);
  const c=proj([stat.center[0]+q,floor,stat.center[2]-w]);
  const d=proj([stat.center[0]+q,floor,stat.center[2]+w]);
  line(a,b,'#64706a',i===0?1:.65,.22);
  line(c,d,'#64706a',i===0?1:.65,.22);
 }
 const shadow=proj([stat.center[0],floor,stat.center[2]]);
 ctx.save();ctx.translate(shadow.x,shadow.y);ctx.scale(1,.30);
 const gradient=ctx.createRadialGradient(0,0,0,0,0,stat.height*proj(stat.center).scale*.35);
 gradient.addColorStop(0,'#05090a75');gradient.addColorStop(1,'#05090a00');
 ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,stat.height*proj(stat.center).scale*.35,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawBoneScene(joints,proj,proxy=false){
 const segments=[];
 for(const b of clip.bones){
  if(!b.parent||!joints[b.name]||!joints[b.parent])continue;
  const a=proj(joints[b.parent]),z=proj(joints[b.name]);
  segments.push({a,z,name:b.name,depth:(a.depth+z.depth)/2});
 }
 segments.sort((a,b)=>b.depth-a.depth);
 if(!proxy){
  for(const s of segments){
   const left=s.name.startsWith('Left'),right=s.name.startsWith('Right');
   line(s.a,s.z,left?'#9ed7ff':right?'#c0e786':'#d0d5d0',
     /(Hand(Thumb|Index|Middle|Ring|Pinky))/.test(s.name)?1.5:3, .88);
  }
  for(const s of segments){if(/(Thumb|Index|Middle|Ring|Pinky)/.test(s.name))continue;joint(s.z,3,'#e5efda');joint(s.z,1.3,'#5d7654');}
  return;
 }
 // 3D technical proxy with shaded screen-projected volumes, NOT a skinned mesh.
 for(const s of segments){
  const digit=/(Thumb|Index|Middle|Ring|Pinky)/.test(s.name);
  if(digit)continue;
  let color='#c49a77',width=9;
  if(/Spine|Hips|Shoulder/.test(s.name)){color='#a83f41';width=21;}
  if(/Arm|ForeArm/.test(s.name)){color='#b98059';width=12;}
  if(/UpLeg|Leg/.test(s.name)){color='#a36547';width=17;}
  if(/Foot|Toe/.test(s.name)){color='#a57950';width=9;}
  if(/Head/.test(s.name)){color='#bd8058';width=9;}
  line({x:s.a.x+2,y:s.a.y+2},{x:s.z.x+2,y:s.z.y+2},'#171716',width+4,.75);
  line(s.a,s.z,color,width);
  line({x:s.a.x-2,y:s.a.y-2},{x:s.z.x-2,y:s.z.y-2},'#eac295',Math.max(2,width*.23),.50);
 }
 for(const side of ['Left','Right']){
  for(const b of ['Hand','Foot','Arm','ForeArm','UpLeg','Leg']){
   const j=joints[side+b];if(j&&b==='Hand')joint(proj(j),8,'#ca9168');
  }
 }
 const head=joints.Head,neck=joints.Neck;
 if(head){
  const h=proj(head),neckP=neck?proj(neck):{x:h.x,y:h.y+20};
  const radius=Math.max(18,Math.min(49,Math.abs(h.y-neckP.y)*1.38+15)*zoom);
  // Oversized chibi head + hair cap in view-dependent projected space.
  ctx.fillStyle='#18191a';ctx.beginPath();ctx.ellipse(h.x+2,h.y+2,radius+4,radius*1.08,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#bf825e';ctx.beginPath();ctx.ellipse(h.x,h.y,radius,radius*1.07,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2a2525';ctx.beginPath();ctx.ellipse(h.x,h.y-radius*.55,radius*.98,radius*.53,0,Math.PI,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#923b3e';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(h.x-radius*.78,h.y-radius*.12);ctx.lineTo(h.x+radius*.8,h.y-radius*.1);ctx.stroke();
  ctx.fillStyle='#282321';ctx.beginPath();ctx.ellipse(h.x-radius*.28,h.y+radius*.07,3,2.2,0,0,Math.PI*2);ctx.ellipse(h.x+radius*.28,h.y+radius*.07,3,2.2,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#57a0b3';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(h.x+radius*.6,h.y-radius*.7);ctx.quadraticCurveTo(h.x+radius*1.1,h.y-radius*1.35,h.x+radius*.85,h.y-radius*1.6);ctx.stroke();
 }
}
function draw(){
 const width=stageW,height=stageH;
 ctx.clearRect(0,0,width,height);
 if(!clip)return;
 const source=vectorsAt(elapsed);
 if(!source)return;
 const joints=mode==='proxy'?proxySkeleton(source):source;
 const stat=info(joints);if(!stat)return;
 const project=projector(stat);
 grid(project,stat);
 drawBoneScene(joints,project,mode==='proxy');
 ctx.font='10px Consolas,monospace';ctx.fillStyle='#bac2c3';ctx.fillText('FRAME '+String(frameNumber).padStart(3,'0')+'  /  '+clip.frames.length,22,height-53);
}
function tick(now){
 const delta=Math.min(.075,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
 if(playing&&clip){
  elapsed+=delta*speed;
  if(elapsed>=clip.duration){elapsed=looping?elapsed%clip.duration:clip.duration;if(!looping){playing=false;$('play').textContent='▶';}}
  $('timeline').value=elapsed;$('time-now').textContent=formatTime(elapsed);
  frameNumber=Math.min(clip.frames.length-1,Math.floor(elapsed/Math.max(.001,clip.duration)*(clip.frames.length-1)));
 }
 draw();requestAnimationFrame(tick);
}
function switchScreen(screen){
 const libraryMode=screen==='library';
 $('library-section').hidden=!libraryMode;$('procedural-section').hidden=libraryMode;
 $('nav-library').classList.toggle('active',libraryMode);
 $('nav-procedural').classList.toggle('active',!libraryMode);
}
$('file-input').addEventListener('change',async e=>{await importFiles(Array.from(e.target.files));e.target.value='';});
$('search').addEventListener('input',renderList);
document.querySelectorAll('[data-filter]').forEach(el=>el.addEventListener('click',()=>{
 filter=el.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('current',b===el));renderList();
}));
document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>{
 mode=el.dataset.view;
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b===el));details(library.find(m=>m.id===selectedId));
}));
$('save-meta').addEventListener('click',async()=>{
 if(!selectedId)return toast('Select a motion first',true);
 try{
  const response=await request('/api/motions/'+selectedId,{
   method:'PATCH',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({source:$('motion-source').value,license:$('motion-license').value,status:$('motion-state').value})
  });await refresh();details(response.motion);toast('Metadata saved in your local library');
 }catch(e){toast(e.message,true);}
});
$('play').addEventListener('click',()=>{if(!clip)return;playing=!playing;$('play').textContent=playing?'Ⅱ':'▶';});
$('rewind').addEventListener('click',()=>{elapsed=0;$('timeline').value=0;$('time-now').textContent=formatTime(0);});
$('loop').addEventListener('click',()=>{looping=!looping;$('loop').classList.toggle('on',looping);});
$('speed').addEventListener('change',()=>{speed=Number($('speed').value);});
$('timeline').addEventListener('input',()=>{if(!clip)return;elapsed=Number($('timeline').value);$('time-now').textContent=formatTime(elapsed);});
$('reset-camera').addEventListener('click',fitCamera);
$('nav-library').addEventListener('click',()=>switchScreen('library'));
$('nav-procedural').addEventListener('click',()=>switchScreen('procedural'));
$('go-procedural').addEventListener('click',()=>switchScreen('procedural'));
$('back-library').addEventListener('click',()=>switchScreen('library'));
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;
 yaw+=(e.clientX-drag.x)*.008;pitch=Math.max(-.5,Math.min(.75,pitch+(e.clientY-drag.y)*.006));drag={x:e.clientX,y:e.clientY};
});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.4,Math.min(3,zoom*(e.deltaY>0?.9:1.1)));},{passive:false});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('play').click();}});
details(null);refresh(false).then(async()=>{if(library.length)await loadClip(library[0].id);}).catch(e=>toast('Cannot connect to local API: '+e.message,true));
requestAnimationFrame(tick);
