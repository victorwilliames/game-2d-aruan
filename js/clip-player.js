'use strict';
// Optional numerical clip player. No FBX, Three.js, renderer or dependency here.
// V1 Animator/gameplay never imports or activates it automatically.
const AruanClips=(()=>{
 const fields=['px','py','pz','pYaw','pPitch','pRoll','cYaw','cPitch','cRoll','hYaw','hPitch','lfx','lfy','lfz','lfYaw','lfPitch','rfx','rfy','rfz','rfYaw','rfPitch','lha','lhd','lhh','rha','rhd','rhh','sYaw','sPitch','sRoll','twoHand','lePx','lePy','lePz','rePx','rePy','rePz','kOut','equip','roll','tuck','secondary','effort','blink'];
 const angles=new Set(['pYaw','pPitch','pRoll','cYaw','cPitch','cRoll','hYaw','hPitch','lfYaw','lfPitch','rfYaw','rfPitch','lha','rha','sYaw','sPitch','sRoll']);
 const fail=text=>{throw Error('Clipe procedural: '+text);};
 const vector=(a,n,limit=10000)=>Array.isArray(a)&&a.length===n&&a.every(x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=limit);
 const qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
 const rotate=(q,v)=>{const r=qmul(qmul(q,[...v,0]),[-q[0],-q[1],-q[2],q[3]]);return r.slice(0,3);};
 function slerp(a,b,t){
  let dot=a.reduce((s,x,i)=>s+x*b[i],0);if(dot<0){b=b.map(x=>-x);dot=-dot;}
  let x,y;if(dot>.9995){x=1-t;y=t;}else{const theta=Math.acos(Math.min(1,dot)),s=Math.sin(theta);x=Math.sin((1-t)*theta)/s;y=Math.sin(t*theta)/s;}
  const q=a.map((v,i)=>v*x+b[i]*y),len=Math.hypot(...q);return q.map(v=>v/len);
 }
 function validate(c){
  if(!c||c.schema!=='aruan-clip'||c.version!==1||c.profile!=='aruan-humanoid-v2')fail('formato ou perfil não reconhecido');
  if(typeof c.name!=='string'||!c.name.trim()||c.name.length>120)fail('nome inválido');
  if(typeof c.duration!=='number'||!Number.isFinite(c.duration)||c.duration<=0||c.duration>300)fail('duração inválida');
  if(typeof c.loop!=='boolean'||!vector(c.cycleDelta,3,1e6))fail('loop ou deslocamento inválido');
  if(!Array.isArray(c.fields)||c.fields.length!==fields.length||c.fields.some((k,i)=>k!==fields[i]))fail('canais não reconhecidos');
  if(!Array.isArray(c.times)||c.times.length<2||c.times.length>36001||c.times[0]!==0||Math.abs(c.times.at(-1)-c.duration)>1e-5)fail('tempos inválidos');
  if(c.times.some((t,i)=>!Number.isFinite(t)||t<0||(i&&t<=c.times[i-1])))fail('tempos fora de ordem');
  if(!Array.isArray(c.poses)||c.poses.length!==c.times.length||c.poses.some(p=>!vector(p,fields.length)))fail('poses inválidas');
  if(!Array.isArray(c.root)||c.root.length!==c.times.length||c.root.some(p=>!vector(p,3,1e6)))fail('raiz inválida');
  if(!Array.isArray(c.contacts)||c.contacts.length>2000)fail('contatos inválidos');
  const ends={L:-1,R:-1};
  for(const e of c.contacts){
   if(!e||!['L','R'].includes(e.side)||!Number.isFinite(e.start)||!Number.isFinite(e.end)||e.start<0||e.end<e.start||e.end>c.duration+1e-5||e.start<ends[e.side]||!vector(e.anchor,3,1e6)||(e.yaw!==undefined&&!Number.isFinite(e.yaw)))fail('intervalo de apoio inválido');
   ends[e.side]=e.end;
  }
  if(!Array.isArray(c.events)||c.events.length>2000||c.events.some(e=>!e||typeof e.name!=='string'||e.name.length>80||!Number.isFinite(e.time)||e.time<0||e.time>c.duration))fail('eventos inválidos');
  if(c.metadata!==undefined){
   const m=c.metadata;if(!m||typeof m!=='object'||Array.isArray(m))fail('metadados inválidos');
   if(m.trim&&(!Number.isFinite(m.trim.start)||!Number.isFinite(m.trim.end)||m.trim.start<0||m.trim.end<=m.trim.start||Math.abs(m.trim.end-m.trim.start-c.duration)>1e-5))fail('recorte inválido');
   if(m.customEvents!==undefined&&(!Array.isArray(m.customEvents)||m.customEvents.length>2000||m.customEvents.some(e=>!e||typeof e.name!=='string'||e.name.length>80||!Number.isFinite(e.time)||e.time<0||e.time>c.duration)))fail('marcadores inválidos');
   if(m.warnings!==undefined&&(!Array.isArray(m.warnings)||m.warnings.some(w=>typeof w!=='string'||w.length>2000)))fail('diagnóstico inválido');
  }
  if(c.humanoid){
   const h=c.humanoid;
   if(!Array.isArray(h.bones)||h.bones.length<15||h.bones.length>100)fail('hierarquia inválida');
   const names=new Set();h.bones.forEach((b,i)=>{
    if(!b||typeof b.name!=='string'||names.has(b.name)||!Number.isInteger(b.parent)||b.parent>=i||b.parent< -1||!vector(b.rest,3))fail('osso inválido');names.add(b.name);
   });
   if(!Array.isArray(h.rotations)||h.rotations.length!==c.times.length||h.rotations.some(q=>!vector(q,h.bones.length*4,1.001)))fail('rotações inválidas');
   for(const frame of h.rotations)for(let i=0;i<frame.length;i+=4)if(Math.abs(Math.hypot(...frame.slice(i,i+4))-1)>.002)fail('quaternion não normalizado');
   if(!Array.isArray(h.hips)||h.hips.length!==c.times.length||h.hips.some(p=>!vector(p,3,1e6)))fail('quadril inválido');
  }
  return c;
 }
 function parse(text){if(typeof text!=='string'||text.length>16*1024*1024)fail('limite de16MiB excedido');return validate(JSON.parse(text));}
 function interval(c,time,loop=c.loop){
  if(!Number.isFinite(time))fail('tempo de reprodução inválido');
  time=Math.max(0,time);const cycles=loop?Math.floor(time/c.duration):0,t=loop?time%c.duration:Math.min(time,c.duration);
  let low=0,high=c.times.length-1;
  while(low+1<high){const mid=(low+high)>>1;if(c.times[mid]<=t)low=mid;else high=mid;}
  return {a:low,b:high,u:Math.max(0,Math.min(1,(t-c.times[low])/(c.times[high]-c.times[low]))),t,cycles};
 }
 function sample(c,time,options={}){
  const {a,b,u,t,cycles}=interval(c,time,options.loop??c.loop),pose={};
  fields.forEach((k,i)=>{const x=c.poses[a][i],y=c.poses[b][i];let d=y-x;if(angles.has(k))d=((d+180)%360+360)%360-180;pose[k]=x+d*u;});
  const root=c.root[a].map((x,i)=>x+(c.root[b][i]-x)*u+cycles*c.cycleDelta[i]),contacts={};
  for(const e of c.contacts)if(t>=e.start&&t<=e.end){
   const pre=e.side==='L'?'lf':'rf',anchor=e.anchor.map((x,i)=>x+cycles*c.cycleDelta[i]);contacts[e.side]=anchor;
   pose[pre+'x']=anchor[0]-root[0];pose[pre+'y']=anchor[1]-root[1];pose[pre+'z']=Math.max(0,anchor[2]-root[2]);
   pose[pre+'Pitch']=0;if(e.yaw!==undefined)pose[pre+'Yaw']=e.yaw;
  }
  return {pose,root,contacts,time:t,cycles};
 }
 function hierarchy(c,time,options={}){
  if(!c.humanoid)return null;const h=c.humanoid,{a,b,u}=interval(c,time,options.loop??c.loop),joints=[];
  h.bones.forEach((bone,i)=>{
   const rotation=slerp(h.rotations[a].slice(i*4,i*4+4),h.rotations[b].slice(i*4,i*4+4),u);
   const local=bone.parent===-1?h.hips[a].map((x,k)=>x+(h.hips[b][k]-x)*u):bone.rest;
   const parent=joints[bone.parent];joints.push({name:bone.name,parent:bone.parent,
    rotation:parent?qmul(parent.rotation,rotation):rotation,
    position:parent?rotate(parent.rotation,local).map((x,k)=>x+parent.position[k]):local.slice()});
  });return joints;
 }
 function inspect(c,solve){
  validate(c);if(typeof solve!=='function')fail('solver de inspeção ausente');
  const count=Math.min(36000,Math.ceil(c.duration*120)),distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  let maxFootClamp=0,maxArmClamp=0,maxContactSlip=0,minHeadBottom=Infinity,minJointHeight=Infinity,maxBoneError=0;
  for(let i=0;i<=count;i++){
   const s=sample(c,c.duration*i/count,{loop:false}),r=solve(s.pose,s.root,0);
   for(const [key,l1,l2]of [['legL',27,27],['legR',27,27],['armL',23,22],['armR',23,22]]){
    const b=r[key],gap=distance(b.c,b.target);maxBoneError=Math.max(maxBoneError,Math.abs(distance(b.a,b.b)-l1),Math.abs(distance(b.b,b.c)-l2));
    minJointHeight=Math.min(minJointHeight,b.a[2],b.b[2],b.c[2]);
    if(key.startsWith('leg'))maxFootClamp=Math.max(maxFootClamp,gap);else maxArmClamp=Math.max(maxArmClamp,gap);
   }
   for(const [side,anchor]of Object.entries(s.contacts))maxContactSlip=Math.max(maxContactSlip,distance(r[side==='L'?'legL':'legR'].c,[anchor[0],anchor[1],anchor[2]+5]));
   minHeadBottom=Math.min(minHeadBottom,r.head.o[2]-35);
  }
  const passes=maxFootClamp<1e-5&&maxArmClamp<1e-5&&maxContactSlip<1e-5&&maxBoneError<1e-6&&minHeadBottom>=0&&minJointHeight>=-.5;
  return {status:passes?'numeric-pass':'needs-adjustment',samples:count+1,maxFootClamp,maxArmClamp,maxContactSlip,maxBoneError,minHeadBottom,minJointHeight,
   note:'Diagnóstico numérico: não certifica arte, equipamento ou dedos. Limite inferior da cabeça estimado por35unidades.'};
 }
 return Object.freeze({fields:Object.freeze(fields),validate,parse,sample,hierarchy,slerp,inspect});
})();
if(typeof globalThis!=='undefined')globalThis.AruanClips=AruanClips;
if(typeof module!=='undefined')module.exports=AruanClips;
