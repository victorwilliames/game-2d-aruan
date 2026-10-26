'use strict';
// Real Mixamo channels drive the existing Canvas painter. World motion stays in main.
globalThis.MovaLocomotion=(()=>{
 const clips={},plants=new FootPlant();let ready=false,error='',mode='mixamo',phase=0,idleTime=0,walkWeight=0,runWeight=0,weight=0,last=null;
 const debug={mode,source:'V1',name:'Animator V1',fallback:true,transition:0,magnitude:0,speed:0,state:'idle'};
 const mix=(a,b,u)=>a+(b-a)*u;
 function localBlend(a,b,u){
  const pose={};for(const k of AruanClips.fields)pose[k]=mix(a.pose[k],b.pose[k],u);
  return {...b,pose,contacts:{},root:[0,0,0],humanoid:{bones:b.humanoid.bones,
   hips:a.humanoid.hips.map((v,i)=>mix(v,b.humanoid.hips[i],u)),
   rotations:b.humanoid.bones.flatMap((_,i)=>AruanClips.slerp(a.humanoid.rotations.slice(i*4,i*4+4),b.humanoid.rotations.slice(i*4,i*4+4),u))}};
 }
 function frameBlend(a,b,u){
  const x=vNorm(vLerp(a.x,b.x,u)),z0=vLerp(a.z,b.z,u),y=vNorm(vCross(z0,x)),z=vNorm(vCross(x,y));
  return {o:vLerp(a.o,b.o,u),x,y,z};
 }
 function rigBlend(a,b,u){
  if(u>=1)return b;if(u<=0)return a;
  const r={...a,pose:{...a.pose},root:b.root.slice(),facing:b.facing};
  for(const k of ['base','pel','chest','head','ftL','ftR','toeL','toeR'])if(a[k]&&b[k])r[k]=frameBlend(a[k],b[k],u);
  for(const k of ['neck','toeTipL','toeTipR'])if(a[k]&&b[k])r[k]=vLerp(a[k],b[k],u);
  for(const k of ['armL','armR','legL','legR']){
   const x=a[k],y=b[k],l1=vDist(x.a,x.b),l2=vDist(x.b,x.c);
   r[k]=solveIK(vLerp(x.a,y.a,u),vLerp(x.c,y.c,u),l1,l2,vNorm(vLerp(x.pole||[0,0,1],y.pole||[0,0,1],u)),1);
  }
  r.weaponDir=vNorm(vLerp(a.weaponDir||a.swordDir,b.weaponDir||b.swordDir,u));r.swordDir=r.weaponDir;
  r.guard=r.armR.c.slice();r.tip=vAddS(r.guard,r.weaponDir,BODY.bowLength-7);
  // Geometric bridge uses the V1 hand painter until the 65-channel pose settles.
  delete r.humanoid;delete r.hands;return r;
 }
 async function init(){
  ready=false;error='';
  try{
   await Promise.all(['idle','walking','run'].map(async key=>{
    const r=await fetch('tools/movalab/workspace/exports/mixamo-'+key+'.aruan-clip.v1.json',{cache:'no-store'});
    if(!r.ok)throw Error(key+' indisponível');const c=AruanClips.validate(await r.json());
    AruanHumanoid.sample(c,0);if(!c.loop)throw Error(key+' não é um ciclo');clips[key]=c;
   }));
   const profile=JSON.stringify(clips.walking.humanoid.bones);
   if(['idle','run'].some(k=>JSON.stringify(clips[k].humanoid.bones)!==profile))throw Error('perfis de destino divergentes');
   ready=true;
  }catch(e){error=e.message;console.warn('Locomoção Mixamo: '+error+'; fallback V1.');}
  const dev=typeof location!=='undefined'&&new URLSearchParams(location.search).get('dev')==='1';
  if(dev&&!document.querySelector('#locomotion-compare')){const b=document.createElement('button');b.id='locomotion-compare';b.textContent='Animação: Mixamo 65 · alternar V1';
   b.style.cssText='position:fixed;right:16px;top:76px;z-index:21;padding:8px;background:#152925;color:#d5efae';
   b.onclick=()=>{setMode(mode==='mixamo'?'v1':'mixamo');b.textContent=mode==='mixamo'?'Animação: Mixamo 65 · alternar V1':'Animação: V1 · alternar Mixamo 65';};document.body.append(b);}
 }
 function setMode(next){if(!['v1','mixamo'].includes(next))throw Error('Modo inválido');mode=next;debug.mode=mode;}
 function reset(){phase=0;idleTime=0;walkWeight=0;runWeight=0;weight=0;last=null;plants.reset();}
 function rig(dt,p,native,input){
  const speed=Math.hypot(...p.vel),moving=p.state==='move'&&!globalThis.MovaGame?.actionActive;
  const intentMagnitude=Math.hypot(...p.moveIntent),magnitude=input?.source==='gamepad'?Math.min(1,Math.hypot(...input.pad.axes.slice(0,2))):intentMagnitude;
  Object.assign(debug,{mode,speed,magnitude,intentMagnitude,state:p.phase,error});
  if(!ready||!moving){weight=0;last=null;plants.reset();Object.assign(debug,{source:'V1',name:'Animator V1',fallback:true,transition:0});return native;}
  idleTime+=dt;
  // Cadence follows distance, rather than elapsed time at every stick strength.
  const walkStride=Math.max(1,Math.hypot(...clips.walking.cycleDelta)),runStride=Math.max(1,Math.hypot(...clips.run.cycleDelta));
  const targetRun=clamp((speed-140)/120,0,1);runWeight=damp(runWeight,targetRun,18,dt);
  phase+=speed*dt/mix(walkStride,runStride,runWeight);
  walkWeight=damp(walkWeight,clamp(speed/32,0,1),24,dt);if(speed===0&&walkWeight<.001)walkWeight=0;
  const idle=AruanHumanoid.sample(clips.idle,idleTime),walk=AruanHumanoid.sample(clips.walking,phase*clips.walking.duration),run=AruanHumanoid.sample(clips.run,phase*clips.run.duration);
  const state=localBlend(idle,localBlend(walk,run,runWeight),walkWeight);
  const full=AruanHumanoid.solve(clips.walking,0,p.pos,p.visualFacing,{state,floorSafe:true});
  // Reuse world-space FootPlant, deriving its targets from the full hierarchy.
  // FootPlant's reach reserve is calibrated to the V1 support-policy height;
  // the hierarchy solver independently lowers its anatomical pelvis for IK.
  const footPose={...state.pose};
  for(const [side,k]of [['L','lf'],['R','rf']]){
   const d=vSub(full['leg'+side].c,p.pos);footPose[k+'x']=vDot(d,full.base.x);footPose[k+'y']=vDot(d,full.base.y);
   // Converted contact channels describe sole height. The floor-safe FK lift
   // protects fingers/toes too, so using its ankle height would make idle hover.
   footPose[k+'z']=Math.max(0,state.pose[k+'z']);
  }
  const feet=plants.update(footPose,p.pos,p.visualFacing,dt);
  const solved=AruanHumanoid.solve(clips.walking,0,p.pos,p.visualFacing,{state,feet,floorSafe:true});
  weight=clamp(weight+(mode==='mixamo'?1:-1)*dt/.12,0,1);
  const u=weight*weight*(3-2*weight);last=rigBlend(native,solved,u);
  Object.assign(debug,{source:weight>0?'Mixamo · mixamorig65.v1':'V1',name:walkWeight<.01?'idle':runWeight>.5?'standard run':'walking',fallback:weight===0,transition:weight,phase:phase%1,walkWeight,runWeight,bones:weight===1?65:0});
  return last;
 }
 return {init,rig,reset,setMode,debug,get ready(){return ready;},get supports(){return plants.feet;}};
})();
