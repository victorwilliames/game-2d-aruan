import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),context=vm.createContext({console,Math});
vm.runInContext(['math.js','rig.js','clip-player.js','humanoid-rig.js'].map(n=>fs.readFileSync(path.join(root,'js',n),'utf8')).join('\n'),context);
const full=context.AruanHumanoid,clips=context.AruanClips;
const walk=clips.parse(fs.readFileSync(path.join(root,'tools/movalab/workspace/exports/mixamo-walking.aruan-clip.v1.json'),'utf8')),gesture=structuredClone(walk);
// Independently authored finger/neck channels must survive the whole fade.
for(const [name,q]of [['LeftHandIndex2',[0,0,Math.SQRT1_2,Math.SQRT1_2]],['Neck',[0,.5,0,Math.sqrt(.75)]]]){
 const index=gesture.humanoid.bones.findIndex(b=>b.name===name);for(const frame of gesture.humanoid.rotations)frame.splice(index*4,4,...q);
}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
let poses=0,maxBoneError=0,maxFootClamp=0,maxContactSlip=0,maxEndpointError=0,maxInterruptError=0;
const from=t=>full.sample(walk,.12+t),transition=full.createTransition(from,gesture,{duration:.3,startTime:0});
assert.ok(transition.steady);assert.throws(()=>full.createTransition(()=>({...from(0),humanoid:null}),gesture),/mesmo perfil/);
const invalid=from(0);invalid.humanoid.rotations.splice(0,4,0,0,0,0);assert.throws(()=>full.createTransition(()=>invalid,gesture),/não normalizado/);
const incompatible=structuredClone(gesture);incompatible.humanoid.bones[2].rest[1]+=.1;
assert.throws(()=>full.createTransition(from,incompatible),/mesmo perfil/);
assert.throws(()=>transition.sample(NaN),/tempo de transição/);
for(let direction=0;direction<8;direction++){
 const facing=direction*Math.PI/4,world=[123,-45,0],rig=s=>full.solve(gesture,0,world,facing,{state:s,contacts:true,floorSafe:true});
 const initial=rig(from(0)),first=rig(transition.sample(0));
 for(const n of Object.keys(first.humanoid.joints))maxEndpointError=Math.max(maxEndpointError,distance(first.humanoid.joints[n].position,initial.humanoid.joints[n].position));
 const settled=rig(transition.steady.sample(.3)),last=rig(transition.sample(.3));
 for(const n of Object.keys(last.humanoid.joints))maxEndpointError=Math.max(maxEndpointError,distance(last.humanoid.joints[n].position,settled.humanoid.joints[n].position));
 const interrupted=full.createTransition(t=>transition.sample(.13+t),walk,{duration:.21,startTime:.2}),before=rig(transition.sample(.13)),after=rig(interrupted.sample(0));
 for(const n of Object.keys(before.humanoid.joints))maxInterruptError=Math.max(maxInterruptError,distance(before.humanoid.joints[n].position,after.humanoid.joints[n].position));
 for(const active of [transition,interrupted])for(let i=0;i<=90;i++){
  const s=active.sample(i/120),r=rig(s);poses++;
  for(const [name,joint]of Object.entries(r.humanoid.joints)){
   const bone=gesture.humanoid.bones.find(b=>b.name===name);if(bone.parent<0)continue;
   const parent=r.humanoid.joints[gesture.humanoid.bones[bone.parent].name];
   maxBoneError=Math.max(maxBoneError,Math.abs(distance(joint.position,parent.position)-Math.hypot(...bone.rest)));
  }
  for(const chain of [r.legL,r.legR])maxFootClamp=Math.max(maxFootClamp,distance(chain.c,chain.target));
  // Convert the held anchor using the same authoritative world root/facing.
  for(const [side,anchor]of Object.entries(s.contacts)){
   const local=anchor.map((v,k)=>v-s.root[k]+(k===2?5:0));
   const expected=[world[0]+local[0]*Math.cos(facing)-local[1]*Math.sin(facing),world[1]+local[0]*Math.sin(facing)+local[1]*Math.cos(facing),local[2]];
   maxContactSlip=Math.max(maxContactSlip,distance(r[side==='L'?'legL':'legR'].c,expected));
  }
 }
}
assert.ok(maxBoneError<1e-6,'Bone length '+maxBoneError);assert.ok(maxFootClamp<1e-5&&maxContactSlip<1e-5,'Contact '+maxContactSlip);
assert.ok(maxEndpointError<1e-8&&maxInterruptError<1e-8,'Transition discontinuity');
const mid=transition.sample(.15),index=gesture.humanoid.bones.findIndex(b=>b.name==='LeftHandIndex2')*4;
const finger=mid.humanoid.rotations.slice(index,index+4),expected=clips.slerp(from(.15).humanoid.rotations.slice(index,index+4),full.sample(gesture,.15).humanoid.rotations.slice(index,index+4),.5);
assert.ok(distance(finger,expected)<1e-9,'Finger must use quaternion interpolation, independent of scalar poses');
console.log(JSON.stringify({fullHierarchyTransitions:true,poses,maxBoneError,maxFootClamp,maxContactSlip,maxEndpointError,maxInterruptError,fingerQuaternionBlend:true,gameplayIntegration:false}));
