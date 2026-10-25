import * as T from 'three';
import {createAruanProxy} from './aruan-proxy.js';
import {aruanProfile} from './aruan-profile.js';
import {captureRest,restoreRest,HumanoidRetarget} from './humanoid.js';
import {validateCorrections,defaultCorrections} from './converter-settings.js';

export {defaultCorrections};
const neutral={px:0,py:0,pz:52,pYaw:0,pPitch:0,pRoll:0,cYaw:0,cPitch:0,cRoll:0,hYaw:0,hPitch:0,
 lfx:3,lfy:12,lfz:0,lfYaw:6,lfPitch:0,rfx:-3,rfy:-12,rfz:0,rfYaw:-6,rfPitch:0,
 lha:84,lhd:24,lhh:43,rha:-84,rhd:24,rhh:43,sYaw:0,sPitch:0,sRoll:0,twoHand:0,
 lePx:-.6,lePy:.8,lePz:-.25,rePx:-.6,rePy:-.8,rePz:-.25,kOut:.05,equip:0,roll:0,tuck:0,secondary:0,effort:0,blink:0};
const toCanvas=v=>[v.z,v.x,v.y];
function orientation(q){
 const forward=new T.Vector3(0,0,1).applyQuaternion(q),left=new T.Vector3(1,0,0).applyQuaternion(q),up=new T.Vector3(0,1,0).applyQuaternion(q);
 const matrix=new T.Matrix4().makeBasis(new T.Vector3(...toCanvas(forward)),new T.Vector3(...toCanvas(left)),new T.Vector3(...toCanvas(up)));
 const e=new T.Euler().setFromRotationMatrix(matrix,'ZYX');return [e.z*180/Math.PI,e.y*180/Math.PI,e.x*180/Math.PI];
}
function percentile(values,p){const list=values.slice().sort((a,b)=>a-b);return list[Math.floor((list.length-1)*p)];}
const round=v=>Math.abs(v)<.0000005?0:+v.toFixed(6);
export async function convertMotion(source,motion,options={},onProgress=()=>{}){
 const runtime=globalThis.AruanClips;if(!runtime)throw Error('Player procedural não carregado');
 const corrections=validateCorrections(options.corrections);
 const clip=source?.animations?.[0];if(!clip||clip.duration<=0||clip.duration>300)throw Error('Animação sem duração válida');
 const proxy=createAruanProxy(),sourceRest=captureRest(source),targetRest=captureRest(proxy);
 const parent=source.parent;if(parent)parent.remove(source);restoreRest(sourceRest);
 const retarget=new HumanoidRetarget(source,proxy),mixer=new T.AnimationMixer(source),action=mixer.clipAction(clip);
 action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();
 const at=name=>targetRest.byName.get(name.toLowerCase()).bone;
 const position=name=>at(name).getWorldPosition(new T.Vector3());
 const q=name=>at(name).getWorldQuaternion(new T.Quaternion());
 const count=Math.min(18000,Math.ceil(clip.duration*60)),frames=[];let reachCorrections=0,maxReachCorrection=0;
 const bones=targetRest.bones.map(e=>({name:e.bone.name,parent:targetRest.bones.findIndex(p=>p.bone===e.bone.parent),rest:targetRest.local.get(e.bone).position.toArray().map(round)}));
 try{
  for(let i=0;i<=count;i++){
   const time=clip.duration*i/count;action.enabled=true;action.paused=false;mixer.setTime(time);retarget.apply();
   const hips=position('Hips'),p= {...neutral},angles=orientation(q('Hips'));
   [p.pYaw,p.pPitch,p.pRoll]=angles;
   [p.cYaw,p.cPitch,p.cRoll]=orientation(q('Hips').invert().multiply(q('Spine2')));
   const head=orientation(q('Spine2').invert().multiply(q('Head')));
   p.hYaw=head[0];p.hPitch=head[1]+.65*(p.cPitch+p.pPitch);
   const feet={},hands={},elbows={};
   for(const [side,prefix]of [['Left','l'],['Right','r']]){
    feet[prefix]=toCanvas(position(side+'Foot'));
    // V1 has a fixed shoulder socket on a single rigid chest, whereas humanoid
    // FK has clavicles and a curved multi-bone spine. Transfer the arm vector
    // relative to its socket, then keep the target inside the analytic IK reach.
    const socket=hips.clone().add(new T.Vector3(0,24,0).applyQuaternion(q('Hips')))
      .add(new T.Vector3(side==='Left'?15:-15,7,0).applyQuaternion(q('Spine2')));
    const offset=socket.clone().sub(position(side+'Arm'));
    const hand=position(side+'Hand').add(offset),elbow=position(side+'ForeArm').add(offset);
    const vector=hand.clone().sub(socket),length=vector.length();
    if(length>44.1){const correction=length-44.1;reachCorrections++;maxReachCorrection=Math.max(maxReachCorrection,correction);hand.copy(socket).add(vector.multiplyScalar(44.1/length));}
    hands[prefix]=toCanvas(hand);elbows[prefix]=toCanvas(elbow);
    const f=orientation(q(side+'Foot'));p[prefix+'fYaw']=f[0];p[prefix+'fPitch']=f[1];
   }
   frames.push({time,p,hips:toCanvas(hips),feet,hands,elbows,
    rotations:targetRest.bones.flatMap(e=>e.bone.quaternion.toArray().map(round)),hipLocal:at('Hips').position.toArray().map(round)});
   if(i%60===0){onProgress(i/count);await new Promise(resolve=>setTimeout(resolve,0));}
  }
 }finally{
  mixer.stopAllAction();mixer.uncacheRoot(source);restoreRest(sourceRest);if(parent)parent.add(source);
  proxy.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();o.material?.dispose();});
 }
 const first=frames[0].hips,rawRoots=frames.map(f=>[f.hips[0]-first[0],f.hips[1]-first[1],0]);
 const roots=rawRoots.map(r=>r.map(v=>v*corrections.rootScale));
 const floor=percentile(frames.flatMap(f=>[f.feet.l[2],f.feet.r[2]]),.025);
 const poses=frames.map((f,i)=>{
  const p=f.p,root=rawRoots[i];
  p.px=first[0];p.py=first[1];
  p.pz=f.hips[2]-10-floor+5+corrections.hipHeight;
  p.hYaw+=corrections.headYaw;
  for(const [side,prefix]of [['L','l'],['R','r']]){
   const foot=f.feet[prefix],hand=f.hands[prefix],elbow=f.elbows[prefix];
   p[prefix+'fx']=(foot[0]-root[0])*corrections.stride;p[prefix+'fy']=foot[1]-root[1];p[prefix+'fz']=Math.max(0,foot[2]-floor)*corrections.footLift;
   const hx=(hand[0]-root[0])*corrections.armSwing,hy=hand[1]-root[1];
   p[prefix+'ha']=Math.atan2(hy,hx)*180/Math.PI;p[prefix+'hd']=Math.hypot(hx,hy);p[prefix+'hh']=hand[2]-10-floor+5;
   const pole=[elbow[0]-hand[0],elbow[1]-hand[1],elbow[2]-hand[2]],length=Math.hypot(...pole)||1;
   p[prefix+'ePx']=pole[0]/length;p[prefix+'ePy']=pole[1]/length;p[prefix+'ePz']=pole[2]/length;
  }
  for(const key of ['pYaw','pPitch','pRoll','cYaw','cPitch','cRoll','hYaw','hPitch'])p[key]*=corrections.intensity;
  return p;
 });
 const contacts=[];
 if(corrections.footLock)for(const [side,prefix]of [['L','l'],['R','r']]){
  let start=null,anchor=null;
  for(let i=0;i<frames.length;i++){
   const p=poses[i],pre=prefix+'f',next=Math.min(i+1,frames.length-1),prev=Math.max(0,i-1);
   const dt=frames[next].time-frames[prev].time;
   const speed=dt?Math.hypot(frames[next].feet[prefix][0]-frames[prev].feet[prefix][0],frames[next].feet[prefix][1]-frames[prev].feet[prefix][1])/dt:0;
   const contact=p[pre+'z']<=2.5&&speed<45;
   if(contact&&start===null){start=i;anchor=[p[pre+'x']+roots[i][0],p[pre+'y']+roots[i][1],0];}
   if(start!==null&&(!contact||i===frames.length-1)){
    const end=contact?i:Math.max(start,i-1);
    if(frames[end].time-frames[start].time>=.035)contacts.push({side,start:round(frames[start].time),end:round(frames[end].time),anchor:anchor.map(round),yaw:round(poses[start][prefix+'fYaw'])});
    start=null;
   }
  }
 }
 contacts.sort((a,b)=>a.start-b.start||a.side.localeCompare(b.side));
 const result={schema:'aruan-clip',version:1,profile:aruanProfile.id,name:motion.name.slice(0,120),duration:round(clip.duration),loop:Boolean(options.loop),
  fields:[...runtime.fields],times:frames.map(f=>round(f.time)),poses:poses.map(p=>runtime.fields.map(k=>round(p[k]))),root:roots.map(r=>r.map(round)),
  cycleDelta:roots.at(-1).map(round),contacts,events:contacts.map(e=>({name:'contato-'+e.side,time:e.start})),
  humanoid:{bones,rotations:frames.map(f=>f.rotations),hips:frames.map(f=>f.hipLocal)},
  metadata:{sourceSha256:motion.sha256,sourceFile:motion.relativeSource||motion.filename,sourceStatus:motion.status,converter:'movalab-experimental-0.3',sampleRate:60,corrections,
   reachCorrections,maxReachCorrection:round(maxReachCorrection),warnings:['Adaptação experimental: joelhos do solver Canvas usam polo frontal.','Clavículas adaptadas aos encaixes fixos do Canvas; alvos das mãos limitados a98% do alcance.','Dedos preservados na hierarquia; o renderer Canvas V1 desenha punhos fixos.','Ataques externos não ativam automaticamente arco ou acertos.']}};
 // Apply contact constraints to exported frames as well as continuous runtime sampling.
 runtime.validate(result);
 for(let i=0;i<result.times.length;i++)result.poses[i]=runtime.fields.map(k=>runtime.sample(result,result.times[i],{loop:false}).pose[k]);
 const seam=Math.max(...['lfx','lfy','lfz','rfx','rfy','rfz'].map(k=>Math.abs(poses[0][k]-poses.at(-1)[k])));
 if(result.loop&&seam>5){result.loop=false;result.metadata.warnings.push('Loop desativado: extremidades diferem '+seam.toFixed(1)+' unidades. Recorte/ajuste o clipe antes de repetir.');}
 if(result.loop)for(const side of ['L','R']){
  const firstContact=result.contacts.find(e=>e.side===side&&e.start===0);
  const lastContact=result.contacts.find(e=>e.side===side&&Math.abs(e.end-result.duration)<1e-5);
  if(firstContact&&lastContact&&firstContact!==lastContact)firstContact.anchor=lastContact.anchor.map((v,i)=>round(v-result.cycleDelta[i]));
 }
 for(let i=0;i<result.times.length;i++)result.poses[i]=runtime.fields.map(k=>runtime.sample(result,result.times[i],{loop:false}).pose[k]);
 onProgress(1);return runtime.validate(result);
}
