'use strict';
// Aruan: same world units, projection and analytic two-bone IK as the pilot.
// Local X = forward, Y = left, Z = up. All poses are numeric, never PNG frames.
const BODY={spine:24,shoulderW:15,shoulderUp:7,hipW:10,hipDown:3,upper:23,fore:22,thigh:27,shin:27,ankleH:5,headUp:37,bowLength:105};
const BASE_POSE={px:0,py:0,pz:52,pYaw:0,pPitch:0,pRoll:0,cYaw:0,cPitch:0,cRoll:0,hYaw:0,hPitch:0,
 lfx:3,lfy:12,lfz:0,lfYaw:6,lfPitch:0,rfx:-3,rfy:-12,rfz:0,rfYaw:-6,rfPitch:0,
 lha:84,lhd:24,lhh:43,rha:-84,rhd:24,rhh:43,sYaw:0,sPitch:0,sRoll:0,twoHand:0,
 lePx:-.6,lePy:.8,lePz:-.25,rePx:-.6,rePy:-.8,rePz:-.25,kOut:.05,equip:0,roll:0,tuck:0,secondary:0,effort:0,blink:0};
const POSE_FIELDS=Object.keys(BASE_POSE),mkPose=(o,from=BASE_POSE)=>Object.assign({},from,o),clonePose=p=>({...p});
function lerpPose(a,b,t){const o={};for(const k of POSE_FIELDS)o[k]=lerp(a[k],b[k],t);return o;}
const IDLE_A=mkPose({pYaw:-3,cYaw:3}),IDLE_B=mkPose({pz:52.7,cPitch:-1,lhh:43.6,rhh:43.6},IDLE_A);
const RUN_CYCLE_DIST=132;
function locomotionPose(phase,run=0){
 const p=mkPose({pPitch:lerp(3,11,run),cPitch:lerp(2,8,run),hPitch:-4}),stride=lerp(20,28,run),stance=lerp(.62,.43,run);
 for(const [pre,offset,side]of [['lf',0,1],['rf',.5,-1]]){
  const u=((phase+offset)%1+1)%1;let x,z;
  if(u<stance){x=lerp(stride,-stride,u/stance);z=0;}
  else{const t=(u-stance)/(1-stance);x=lerp(-stride,stride,Ease.inOutSine(t));z=Math.sin(t*Math.PI)*lerp(12,25,run);}
  p[pre+'x']=x;p[pre+'y']=12*side;p[pre+'z']=z;p[pre+'Pitch']=z>1?Math.sin((u-stance)/(1-stance)*TAU)*18*run:0;
 }
 const swing=Math.cos(phase*TAU);p.pz=lerp(51,49,run)+Math.sin(phase*TAU*2)*lerp(1.1,2.4,run);p.pYaw=swing*lerp(4,9,run);p.cYaw=-p.pYaw*.8;
 p.lha=85-swing*lerp(20,35,run);p.rha=-85-swing*lerp(20,35,run);p.lhh=44+run*14+swing*run*7;p.rhh=44+run*14-swing*run*7;
 p.lhd=p.rhd=25;return p;
}
const runPose=phase=>locomotionPose(phase,1),walkPose=phase=>locomotionPose(phase,0);
// Grip stays 7 units from the lower end; left hand may support the same end.
const combatBase=mkPose({pz:49,lfx:14,rfx:-14,lfy:14,rfy:-14,equip:1,twoHand:1,rha:-25,rhd:31,rhh:65,sPitch:30});
const atkPose=o=>mkPose(o,combatBase);
const ATTACKS=[
 {name:'horizontal',lunge:24,cancel:.43,hitKey:2,keys:[
  {dur:.13,ease:'inOutCubic',pose:atkPose({rha:-70,rhd:48,rhh:80,sYaw:-100,sPitch:65,twoHand:0,equip:1})},
  {dur:.17,ease:'outCubic',pose:atkPose({pYaw:-20,cYaw:-24,hYaw:28,rha:-70,rhd:31,rhh:68,sYaw:-85,sPitch:24,lfx:14,rfx:-18})},
  {dur:.12,ease:'inQuad',trail:true,lunge:.8,pose:atkPose({pz:47,pYaw:18,cYaw:22,hYaw:-28,rha:29,rhd:40,rhh:65,sYaw:66,sPitch:4,lfx:23,rfx:-19,rfz:5})},
  {dur:.10,ease:'outCubic',trail:true,lunge:.2,pose:atkPose({pYaw:22,cYaw:24,hYaw:-30,rha:42,rhd:34,rhh:60,sYaw:87,sPitch:-8,lfx:23,rfx:-19})},
  {dur:.28,ease:'inOutCubic',pose:atkPose({rha:-25,rhd:28,rhh:54,sYaw:5,sPitch:-25})},
  {dur:.18,ease:'inOutSine',pose:IDLE_A}
 ]},
 {name:'reves',lunge:23,cancel:.34,hitKey:1,keys:[
  {dur:.19,ease:'outCubic',pose:atkPose({pz:48,pYaw:19,cYaw:24,hYaw:-30,rha:46,rhd:31,rhh:62,sYaw:92,sPitch:-16,rfx:16,lfx:-13})},
  {dur:.13,ease:'inQuad',trail:true,lunge:.8,pose:atkPose({pYaw:-20,cYaw:-24,hYaw:28,rha:-42,rhd:38,rhh:78,sYaw:-62,sPitch:27,rfx:23,lfx:-18,lfz:5})},
  {dur:.10,ease:'outCubic',trail:true,lunge:.2,pose:atkPose({pYaw:-24,cYaw:-22,hYaw:30,rha:-62,rhd:32,rhh:84,sYaw:-85,sPitch:38,rfx:23,lfx:-18})},
  {dur:.26,ease:'inOutCubic',pose:atkPose({rha:-28,rhd:29,rhh:57,sYaw:-10,sPitch:20})},
  {dur:.18,ease:'inOutSine',pose:IDLE_A}
 ]},
 {name:'de-cima',lunge:32,cancel:.59,hitKey:2,keys:[
  {dur:.16,ease:'outCubic',pose:atkPose({pz:46,cPitch:8,rha:-15,rhd:40,rhh:75,sYaw:-25,sPitch:60})},
  {dur:.21,ease:'outCubic',pose:atkPose({pz:55,pPitch:-5,cPitch:-5,rha:-15,rhd:40,rhh:83,sYaw:0,sPitch:75,rfx:-15,lfx:15})},
  {dur:.14,ease:'inQuad',trail:true,lunge:1,pose:atkPose({pz:43,pPitch:14,cPitch:18,hPitch:2,rha:-12,rhd:40,rhh:46,sYaw:0,sPitch:-21,lfx:25,rfx:-20,rfz:7})},
  {dur:.13,ease:'outCubic',pose:atkPose({pz:42,pPitch:10,cPitch:15,rha:-12,rhd:37,rhh:44,sYaw:0,sPitch:-23,lfx:25,rfx:-20})},
  {dur:.29,ease:'inOutCubic',pose:atkPose({pz:50,rha:-27,rhd:28,rhh:55,sYaw:0,sPitch:10})},
  {dur:.20,ease:'inOutSine',pose:IDLE_A}
 ]}
];
for(const d of ATTACKS){let t=0;d.keys.forEach((k,i)=>{k.start=t;t+=k.dur;k.end=t;if(i===d.hitKey)d.hitTime=t;});d.total=t;d.activeEnd=Math.max(...d.keys.filter(k=>k.trail).map(k=>k.end));}
function sampleAttack(index,t,from=IDLE_A){const d=ATTACKS[index];let prev=from,lunge=0;for(let i=0;i<d.keys.length;i++){const k=d.keys[i];if(t<=k.end){const u=clamp((t-k.start)/k.dur,0,1),v=Ease[k.ease](u);return {pose:lerpPose(prev,k.pose,v),trail:!!k.trail,phase:i,lunge:lunge+(k.lunge||0)*v};}lunge+=k.lunge||0;prev=k.pose;}return {pose:clonePose(IDLE_A),trail:false,phase:d.keys.length-1,lunge};}
const DODGE_DURATION=.84;
function dodgeTravel(t){return 240*DODGE_DURATION*Ease.inOutSine(clamp((t/DODGE_DURATION-.10)/.78,0,1));}
function dodgePose(t){
 const u=clamp(t/DODGE_DURATION,0,1),p=mkPose({pz:48});
 const keys=[{t:0,p:IDLE_A},{t:.16,p:mkPose({pz:34,pPitch:22,cPitch:15,lhh:21,rhh:21,lha:45,rha:-45,lhd:34,rhd:34,lfx:17,rfx:-12,hPitch:10,tuck:.4})},
 {t:.32,p:mkPose({pz:37,pPitch:24,cPitch:15,lhh:40,rhh:40,lha:20,rha:-20,lhd:32,rhd:32,lfx:20,rfx:5,lfz:12,rfz:20,roll:80,tuck:1,hPitch:20})},
 {t:.64,p:mkPose({pz:37,pPitch:24,cPitch:15,lhh:40,rhh:40,lha:20,rha:-20,lhd:32,rhd:32,lfx:20,rfx:5,lfz:12,rfz:20,roll:290,tuck:1,hPitch:20})},
 {t:.84,p:mkPose({pz:35,pPitch:20,cPitch:14,lhh:22,rhh:22,lha:35,rha:-35,lhd:34,rhd:34,lfx:20,rfx:-15,roll:360,tuck:.3})},{t:1,p:mkPose({roll:360},IDLE_A)}];
 for(let i=1;i<keys.length;i++)if(u<=keys[i].t)return lerpPose(keys[i-1].p,keys[i].p,Ease.inOutSine((u-keys[i-1].t)/(keys[i].t-keys[i-1].t)));return p;
}
function solveIK(a,target,l1,l2,pole) {
  const delta=vSub(target,a),len=vLen(delta),u=len>1e-6?vScale(delta,1/len):[0,0,-1];
  const d=clamp(len,Math.abs(l1-l2)+.01,(l1+l2)*.985);
  let bend=vSub(pole,vScale(u,vDot(pole,u)));
  bend=vLen(bend)<1e-5?vPerp(u):vNorm(bend);
  const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
  return {a:a.slice(),b:vAdd(vAddS(a,u,along),vScale(bend,height)),c:vAddS(a,u,d),target:target.slice(),pole:bend,clamped:len>d+.02};
}
function solveRig(pose,root,facing,feet=null){
 const base=frameAt(root,facing);let pel=frameAt(fPoint(base,[pose.px,pose.py,pose.pz]),facing+pose.pYaw*DEG);pel=fRoll(fPitch(pel,pose.pPitch*DEG),pose.pRoll*DEG);
 let chest={...pel,o:fPoint(pel,[0,0,BODY.spine])};chest=fRoll(fPitch(fYaw(chest,pose.cYaw*DEG),pose.cPitch*DEG),pose.cRoll*DEG);
 const neck=fPoint(chest,[0,0,15]);let head={...chest,o:fPoint(chest,[0,0,BODY.headUp-pose.tuck*9])};head=fYaw(head,pose.hYaw*DEG);head=fPitch(head,(pose.hPitch-.65*(pose.cPitch+pose.pPitch))*DEG);
 const hand=(a,d,h)=>fPoint(base,[Math.cos(a*DEG)*d,Math.sin(a*DEG)*d,h]);
 const shL=fPoint(chest,[0,BODY.shoulderW,BODY.shoulderUp]),shR=fPoint(chest,[0,-BODY.shoulderW,BODY.shoulderUp]);
 const yaw=facing+pose.sYaw*DEG,pitch=pose.sPitch*DEG,weaponDir=[Math.cos(yaw)*Math.cos(pitch),Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch)];
 let side=vNorm(vCross(weaponDir,base.x));if(vLen(side)<.01)side=base.y;
 const supportOffset=vAdd(vScale(weaponDir,7),vScale(side,(Math.sin(14/BODY.bowLength*Math.PI)-Math.sin(7/BODY.bowLength*Math.PI))*19));
 const reach=(BODY.upper+BODY.fore)*.96;
 const limit=(p,center)=>vDist(p,center)>reach?vAddS(center,vNorm(vSub(p,center)),reach):p;
 let desired=hand(pose.rha,pose.rhd,pose.rhh),supported=desired;
 // Project the grip into the intersection of both arms' reachable volumes.
 // This prevents the supporting hand hovering away from the curved bow.
 for(let i=0;i<6;i++)supported=limit(limit(supported,vSub(shL,supportOffset)),shR);
 desired=vLerp(desired,supported,pose.twoHand);
 const armR=solveIK(shR,desired,BODY.upper,BODY.fore,fDir(base,[pose.rePx,pose.rePy,pose.rePz]));
 const leftTarget=vLerp(hand(pose.lha,pose.lhd,pose.lhh),vAdd(armR.c,supportOffset),pose.twoHand);
 const armL=solveIK(shL,leftTarget,BODY.upper,BODY.fore,fDir(base,[pose.lePx,pose.lePy,pose.lePz]));
 const foot=s=>{const pre=s==='L'?'lf':'rf',p=feet&&feet[s]?vAdd(feet[s],[0,0,BODY.ankleH]):fPoint(base,[pose[pre+'x'],pose[pre+'y'],BODY.ankleH+Math.max(0,pose[pre+'z'])]);return fPitch(frameAt(p,facing+pose[pre+'Yaw']*DEG),pose[pre+'Pitch']*DEG);};
 const ftL=foot('L'),ftR=foot('R'),legL=solveIK(fPoint(pel,[0,10,-3]),ftL.o,27,27,fDir(base,[1,.05,-.1])),legR=solveIK(fPoint(pel,[0,-10,-3]),ftR.o,27,27,fDir(base,[1,-.05,-.1]));ftL.o=legL.c;ftR.o=legR.c;
 const rig={pose,root,facing,base,pel,chest,neck,head,armL,armR,legL,legR,ftL,ftR,weaponDir,swordDir:weaponDir};
 // Rotate the articulated, tucked rig, including its local frames. Equipment follows chest.
 if(pose.roll>0&&pose.roll<360){const rot=fPitch(base,pose.roll*DEG),pivot=fPoint(base,[10,0,55]);
  const dir=d=>fDir(rot,[vDot(d,base.x),vDot(d,base.y),d[2]]);
  const point=p=>vAdd(pivot,dir(vSub(p,pivot)));
  for(const f of [pel,chest,head,ftL,ftR]){f.o=point(f.o);f.x=dir(f.x);f.y=dir(f.y);f.z=dir(f.z);}rig.neck=point(neck);
  for(const b of [armL,armR,legL,legR]){b.a=point(b.a);b.b=point(b.b);b.c=point(b.c);b.target=point(b.target);b.pole=dir(b.pole);}rig.weaponDir=dir(weaponDir);rig.swordDir=rig.weaponDir;
  // Keep the head volume above the floor; feet unfold after the roll, not through it.
  const low=Math.min(rig.head.o[2]-35,legL.c[2]-5,legR.c[2]-5,armL.c[2]-4,armR.c[2]-4),lift=Math.max(0,2-low);
  if(lift){for(const f of [pel,chest,head,ftL,ftR])f.o=vAdd(f.o,[0,0,lift]);rig.neck=vAdd(rig.neck,[0,0,lift]);for(const b of [armL,armR,legL,legR])for(const k of ['a','b','c','target'])b[k]=vAdd(b[k],[0,0,lift]);}
 }
 rig.guard=armR.c.slice();rig.tip=vAddS(armR.c,rig.weaponDir,BODY.bowLength-7);return rig;
}
class FootPlant {
 constructor(){this.feet={L:null,R:null};}
 reset(){this.feet={L:null,R:null};}
 update(pose,root,facing,dt,attack=false){
  const base=frameAt(root,facing),out={};
  let pelvis=frameAt(fPoint(base,[pose.px,pose.py,pose.pz]),facing+pose.pYaw*DEG);
  pelvis=fRoll(fPitch(pelvis,pose.pPitch*DEG),pose.pRoll*DEG);
  for(const side of ['L','R']){
   const pre=side==='L'?'lf':'rf',z=Math.max(0,pose[pre+'z']);
   const target=fPoint(base,[pose[pre+'x'],pose[pre+'y'],z]);
   let f=this.feet[side];
   if(!f)f=this.feet[side]={p:target.slice(),start:target.slice(),t:1,swing:false};
   const d=Math.hypot(target[0]-f.p[0],target[1]-f.p[1]);
   const hip=fPoint(pelvis,[0,side==='L'?10:-10,-3]);
   const reach=vDist(hip,vAdd(f.p,[0,0,BODY.ankleH]));
   if(z>1){f.p=target.slice();f.swing=false;}
   else if(f.p[2]>1&&!f.swing)f.p=target.slice();
   else if((d>(attack?23:14)||(!attack&&reach>50))&&!f.swing){
    f.start=f.p.slice();f.end=target.slice();f.t=0;f.swing=true;
   }
   if(f.swing){
    if(!attack)f.end=target.slice();
    f.t=Math.min(1,f.t+dt/(attack?.15:.08));
    f.p=vLerp(f.start,f.end,Ease.inOutSine(f.t));
    f.p[2]+=Math.sin(f.t*Math.PI)*9;
    if(f.t>=1)f.swing=false;
   }else if(z<=1)f.p[2]=0;
   out[side]=f.p.slice();
  }
  return out;
 }
}
// One short eyelid pulse per two breathing cycles; no random or wall-clock state.
function idleBlink(t){const u=((t%4.8)+4.8)%4.8;if(u<3.16||u>3.28)return 0;const v=(u-3.16)/.12;return v<1/3?Ease.inOutSine(v*3):1-Ease.inOutSine((v-1/3)*1.5);}
class Animator {
 constructor(){this.phase=0;this.blend=0;this.runBlend=0;this.t=0;this.pose=clonePose(IDLE_A);this.atk=null;this.dodge=null;this.transition=null;this.sway=0;this.effort=0;}
 startAttack(i){this.dodge=null;this.transition=null;this.atk={index:i,t:0,from:clonePose(this.pose),def:ATTACKS[i]};}
 endAttack(){this.atk=null;this.transition={from:clonePose(this.pose),t:0,duration:.10};}
 startDodge(){this.atk=null;this.transition=null;const from=clonePose(this.pose);from.roll=0;this.dodge={t:0,from};}
 endDodge(){this.dodge=null;this.pose.roll=0;this.transition={from:clonePose(this.pose),t:0,duration:.12};}
 finish(sample,dt){
  const target=Math.sin((this.phase-.12)*TAU)*this.blend*(.25+.45*this.runBlend)+Math.sin(this.t/2.4*TAU)*.08;
  this.sway=damp(this.sway,target,10,dt);this.effort=damp(this.effort,this.atk?(sample.trail?1:.55):this.dodge?.5:0,10,dt);
  sample.pose.secondary=this.sway;sample.pose.effort=this.effort;return sample;
 }
 update(dt,speed){
  this.t+=dt;this.runBlend=damp(this.runBlend,clamp((speed-125)/150,0,1),12,dt);
  const run=this.runBlend,cycle=2*lerp(20,28,run)/lerp(.62,.43,run);
  this.phase+=speed*dt/cycle;this.blend=damp(this.blend,clamp(speed/95,0,1),13,dt);
  if(this.dodge){
   this.dodge.t+=dt;const target=dodgePose(this.dodge.t);
   this.pose=this.dodge.t<.10?lerpPose(this.dodge.from,target,Ease.inOutSine(this.dodge.t/.10)):target;
   return this.finish({pose:this.pose,trail:false,lunge:0,phase:-1},dt);
  }
  if(this.atk){this.atk.t+=dt;const s=sampleAttack(this.atk.index,this.atk.t,this.atk.from);this.pose=s.pose;return this.finish(s,dt);}
  const idle=lerpPose(IDLE_A,IDLE_B,(1-Math.cos(this.t/2.4*TAU))/2);idle.blink=idleBlink(this.t);
  const target=lerpPose(idle,locomotionPose(this.phase,run),this.blend);
  if(this.transition){this.transition.t+=dt;this.pose=lerpPose(this.transition.from,target,Ease.inOutSine(clamp(this.transition.t/this.transition.duration,0,1)));if(this.transition.t>=this.transition.duration)this.transition=null;}
  else this.pose=target;
  return this.finish({pose:this.pose,trail:false,lunge:0,phase:-1},dt);
 }
}
