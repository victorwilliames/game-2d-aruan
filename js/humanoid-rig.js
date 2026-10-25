'use strict';
// Optional full-hierarchy Canvas adapter. Pure arrays/Canvas math: no 3D engine.
// Controller root is authoritative; imported horizontal root is never added twice.
const AruanHumanoid=(()=>{
 const layouts=new WeakMap(),digits=['Thumb','Index','Middle','Ring','Pinky'];
 const fail=message=>{throw Error('Rig humanoide: '+message);};
 function layout(clip){
  if(layouts.has(clip))return layouts.get(clip);AruanClips.validate(clip);
  const bones=clip.humanoid?.bones;if(!bones)fail('clipe sem hierarquia');
  const expected={Hips:null,Spine:'Hips',Spine1:'Spine',Spine2:'Spine1',Neck:'Spine2',Head:'Neck',HeadTop_End:'Head'};
  for(const side of ['Left','Right']){
   Object.assign(expected,{[side+'Shoulder']:'Spine2',[side+'Arm']:side+'Shoulder',[side+'ForeArm']:side+'Arm',[side+'Hand']:side+'ForeArm',[side+'UpLeg']:'Hips',[side+'Leg']:side+'UpLeg',[side+'Foot']:side+'Leg',[side+'ToeBase']:side+'Foot',[side+'Toe_End']:side+'ToeBase'});
   for(const digit of digits)for(let i=1;i<=4;i++)expected[side+'Hand'+digit+i]=i===1?side+'Hand':side+'Hand'+digit+(i-1);
  }
  const indices=new Map(bones.map((b,i)=>[b.name,i]));
  if(bones.length!==65||indices.size!==65||Object.keys(expected).some(n=>!indices.has(n)))fail('65 canais canônicos completos são necessários');
  for(const b of bones){const parent=b.parent<0?null:bones[b.parent].name;if(parent!==expected[b.name])fail('pai divergente em '+b.name);}
  const length=name=>Math.hypot(...bones[indices.get(name)].rest);
  const result={indices,length};layouts.set(clip,result);return result;
 }
 function floorLift(joints,axis=2){
  const height=name=>joints[name].position[axis];
  return Math.max(0,35-height('Head'),5-height('LeftFoot'),5-height('RightFoot'),4-height('LeftHand'),4-height('RightHand'),8-height('LeftLeg'),8-height('RightLeg'));
 }
 function solve(clip,time,root=[0,0,0],facing=0,options={}){
  if(!Array.isArray(root)||root.length!==3||!root.every(Number.isFinite)||!Number.isFinite(facing))fail('raiz ou direção inválida');
  const config=layout(clip),sample=AruanClips.sample(clip,time,{loop:options.loop??clip.loop}),source=AruanClips.hierarchy(clip,time,{loop:options.loop??clip.loop});
  const hips=source[config.indices.get('Hips')].position,base=frameAt(root,facing),joints={};
  const direction=(q,canvas)=>{const r=AruanClipsRotate(q,[canvas[1],canvas[2],canvas[0]]);return fDir(base,[r[2],r[0],r[1]]);};
  for(const j of source){const position=fPoint(base,[j.position[2]-hips[2],j.position[0]-hips[0],j.position[1]]),frame={o:position,x:direction(j.rotation,[1,0,0]),y:direction(j.rotation,[0,1,0]),z:direction(j.rotation,[0,0,1])};joints[j.name]={position,frame,sourceRotation:j.rotation};}
  const lift=options.floorSafe?floorLift(joints):0;
  if(lift)for(const j of Object.values(joints)){j.position=vAdd(j.position,[0,0,lift]);j.frame.o=j.position;}
  const point=name=>joints[name].position,frame=name=>joints[name].frame;
  const foot=side=>{
   if(options.feet?.[side])return vAdd(options.feet[side],[0,0,BODY.ankleH]);
   const anchor=options.contacts&&sample.contacts[side];
   return anchor?fPoint(base,anchor.map((v,i)=>v-sample.root[i]+(i===2?BODY.ankleH:0))):null;
  };
  const targets={L:foot('L'),R:foot('R')};let pelvisCorrection=0;
  for(const [side,key]of [['Left','L'],['Right','R']])if(targets[key]){
   const target=targets[key],hip=point(side+'UpLeg'),ankle=point(side+'Foot'),reach=config.length(side+'Leg')+config.length(side+'Foot')-.001,horizontal=Math.hypot(hip[0]-target[0],hip[1]-target[1]);
   pelvisCorrection=Math.min(pelvisCorrection,target[2]-ankle[2]);
   if(horizontal<reach)pelvisCorrection=Math.min(pelvisCorrection,target[2]+Math.sqrt(reach*reach-horizontal*horizontal)-hip[2]);
  }
  // Contact-based height recovery changes translation, never bone lengths. Head
  // clearance remains a hard limit; impossible combinations keep a diagnostic.
  if(options.floorSafe)pelvisCorrection=Math.max(pelvisCorrection,Math.min(0,35-point('Head')[2]));
  if(pelvisCorrection)for(const j of Object.values(joints)){j.position=vAdd(j.position,[0,0,pelvisCorrection]);j.frame.o=j.position;}
  function chain(side,a,b,c,target){
   const pa=point(side+a),pb=point(side+b),pc=point(side+c),axis=vNorm(vSub(pc,pa));let pole=vSub(vSub(pb,pa),vScale(axis,vDot(vSub(pb,pa),axis)));if(vLen(pole)<1e-8)pole=base.x;
   const lengths=[config.length(side+b),config.length(side+c)];
   const solved=target?solveIK(pa,target,lengths[0],lengths[1],pole,1):{a:pa,b:pb,c:pc,target:pc.slice(),pole:vNorm(pole),clamped:false};
   solved.lengths=lengths;
   if(target){joints[side+b].position=solved.b;joints[side+b].frame.o=solved.b;const delta=vSub(solved.c,pc);joints[side+c].position=solved.c;joints[side+c].frame.o=solved.c;
    const descendants=c==='Hand'?digits.flatMap(d=>[1,2,3,4].map(n=>side+'Hand'+d+n)):[side+'ToeBase',side+'Toe_End'];
    for(const name of descendants){joints[name].position=vAdd(joints[name].position,delta);joints[name].frame.o=joints[name].position;}
   }
   return solved;
  }
  if(options.floorSafe)for(const [side,key]of [['Left','L'],['Right','R']])if(!targets[key]&&point(side+'Foot')[2]<BODY.ankleH)targets[key]=[point(side+'Foot')[0],point(side+'Foot')[1],BODY.ankleH];
  const legL=chain('Left','UpLeg','Leg','Foot',targets.L),legR=chain('Right','UpLeg','Leg','Foot',targets.R);
  const armL=chain('Left','Arm','ForeArm','Hand',options.hands?.L),armR=chain('Right','Arm','ForeArm','Hand',options.hands?.R);
  const pose={...sample.pose,...options.pose},yaw=facing+pose.sYaw*DEG,pitch=pose.sPitch*DEG,weaponDir=[Math.cos(yaw)*Math.cos(pitch),Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch)];
  const hands={};for(const [side,key]of [['Left','L'],['Right','R']])hands[key]={frame:frame(side+'Hand'),digits:digits.map(d=>({name:d,joints:[1,2,3,4].map(n=>joints[side+'Hand'+d+n])}))};
  return {pose,root:root.slice(),facing,base,pel:frame('Hips'),chest:frame('Spine2'),neck:point('Neck'),head:frame('Head'),armL,armR,legL,legR,ftL:frame('LeftFoot'),ftR:frame('RightFoot'),toeL:frame('LeftToeBase'),toeR:frame('RightToeBase'),toeTipL:point('LeftToe_End'),toeTipR:point('RightToe_End'),hands,weaponDir,swordDir:weaponDir,guard:armR.c.slice(),tip:vAddS(armR.c,weaponDir,BODY.bowLength-7),humanoid:{joints,source,contacts:sample.contacts,floorLift:lift,pelvisCorrection,rootMotion:'controller',contract:'mixamorig65.v1'}};
 }
 function AruanClipsRotate(q,v){const [x,y,z,w]=q,[a,b,c]=v,tx=2*(y*c-z*b),ty=2*(z*a-x*c),tz=2*(x*b-y*a);return [a+w*tx+y*tz-z*ty,b+w*ty+z*tx-x*tz,c+w*tz+x*ty-y*tx];}
 function inspect(clip){
  layout(clip);const count=Math.min(36000,Math.ceil(clip.duration*120));let maxBoneError=0,maxFootClamp=0,maxArmClamp=0,maxContactSlip=0,maxFloorLift=0,minHeadBottom=Infinity,minJointHeight=Infinity;
  for(let i=0;i<=count;i++){
   const time=clip.duration*i/count,s=AruanClips.sample(clip,time,{loop:false}),r=solve(clip,time,s.root,0,{loop:false,contacts:true,floorSafe:true});
   for(const key of ['legL','legR','armL','armR']){const b=r[key];maxBoneError=Math.max(maxBoneError,Math.abs(vDist(b.a,b.b)-b.lengths[0]),Math.abs(vDist(b.b,b.c)-b.lengths[1]));minJointHeight=Math.min(minJointHeight,b.a[2],b.b[2],b.c[2]);if(key.startsWith('leg'))maxFootClamp=Math.max(maxFootClamp,vDist(b.c,b.target));else maxArmClamp=Math.max(maxArmClamp,vDist(b.c,b.target));}
   for(const [side,anchor]of Object.entries(s.contacts))maxContactSlip=Math.max(maxContactSlip,vDist(r[side==='L'?'legL':'legR'].c,vAdd(anchor,[0,0,BODY.ankleH])));
   minHeadBottom=Math.min(minHeadBottom,r.head.o[2]-35);maxFloorLift=Math.max(maxFloorLift,r.humanoid.floorLift);
  }
  return {status:maxBoneError<1e-6&&maxFootClamp<1e-5&&maxArmClamp<1e-5&&maxContactSlip<1e-5&&minHeadBottom>=-1e-6&&minJointHeight>=-.5?'numeric-pass':'needs-adjustment',samples:count+1,maxBoneError,maxFootClamp,maxArmClamp,maxContactSlip,minHeadBottom,minJointHeight,maxFloorLift,renderer:'hierarchy',note:'Pose completa com IK de contato e correção vertical visual; não certifica arte, física ou integração de combate.'};
 }
 function inspectLoop(clip){
  layout(clip);if(!clip.loop)return {status:'not-looped',maxFootSeam:0,maxJointSeam:0,rootSeam:0};
  const a=AruanClips.sample(clip,clip.duration,{loop:false}),b=AruanClips.sample(clip,clip.duration,{loop:true});
  const ra=solve(clip,clip.duration,a.root,0,{loop:false,contacts:true,floorSafe:true}),rb=solve(clip,clip.duration,b.root,0,{loop:true,contacts:true,floorSafe:true});
  const maxFootSeam=Math.max(vDist(ra.legL.c,rb.legL.c),vDist(ra.legR.c,rb.legR.c)),maxJointSeam=Math.max(...Object.keys(ra.humanoid.joints).map(n=>vDist(ra.humanoid.joints[n].position,rb.humanoid.joints[n].position))),rootSeam=vDist(a.root,b.root);
  return {status:maxFootSeam<1e-5&&maxJointSeam<.01&&rootSeam<1e-5?'numeric-pass':'needs-adjustment',maxFootSeam,maxJointSeam,rootSeam};
 }
 return Object.freeze({solve,layout,floorLift,inspect,inspectLoop});
})();
if(typeof globalThis!=='undefined')globalThis.AruanHumanoid=AruanHumanoid;
if(typeof module!=='undefined')module.exports=AruanHumanoid;
