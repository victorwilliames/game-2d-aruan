import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {CompatibleFBXLoader} from '../app/fbx-loader.js';
import {convertMotion} from '../app/converter.js';
const require=createRequire(import.meta.url),runtime=require('../../../js/clip-player.js');
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../..');
const context=vm.createContext({console,Math});
vm.runInContext(fs.readFileSync(path.join(root,'js/math.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/rig.js'),'utf8')+'\nglobalThis.api={solveRig,BASE_POSE,BODY};',context);
assert.deepEqual(runtime.fields,Object.keys(context.api.BASE_POSE));
const filename='MixamoOriginalsPack/Animations/Male Locomotion Pack/walking.fbx';
const input=fs.readFileSync(path.join(root,'tools/movalab/workspace/sources',filename));
const source=new CompatibleFBXLoader().parse(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),'');
const clip=await convertMotion(source,{name:'Mixamo Walking',sha256:createHash('sha256').update(input).digest('hex'),relativeSource:filename,status:'imported'},{loop:true});
runtime.parse(JSON.stringify(clip));
assert.ok(clip.humanoid.bones.length===65&&clip.poses.length>30);
assert.ok(Math.abs(clip.humanoid.hips[0][1]-clip.humanoid.hips.at(-1)[1])<1e-4,'Root motion horizontal virou queda vertical');
assert.throws(()=>runtime.validate({...clip,times:[0,0]}));
assert.throws(()=>runtime.validate({...clip,root:[[NaN,0,0]]}));
assert.throws(()=>runtime.validate({...clip,contacts:[{side:'L',start:-1,end:1,anchor:[0,0,0]}]}));
assert.throws(()=>runtime.validate({...clip,humanoid:{...clip.humanoid,bones:[{name:'loop',parent:0,rest:[0,0,0]}]}}));
let maxFootClamp=0,maxArmClamp=0,maxBoneError=0,maxContactSlip=0;
for(let direction=0;direction<8;direction++)for(let step=0;step<=Math.ceil(clip.duration*120);step++){
 const time=Math.min(clip.duration,step/120),s=runtime.sample(clip,time,{loop:false}),facing=direction*Math.PI/4;
 const rotate=p=>[Math.cos(facing)*p[0]-Math.sin(facing)*p[1],Math.sin(facing)*p[0]+Math.cos(facing)*p[1],p[2]];
 const rig=context.api.solveRig(s.pose,rotate(s.root),facing);
 for(const [key,lengths]of [['legL',[27,27]],['legR',[27,27]],['armL',[23,22]],['armR',[23,22]]]){
  const b=rig[key],distance=(x,y)=>Math.hypot(...x.map((v,i)=>v-y[i]));
  maxBoneError=Math.max(maxBoneError,Math.abs(distance(b.a,b.b)-lengths[0]),Math.abs(distance(b.b,b.c)-lengths[1]));
  if(key.startsWith('leg'))maxFootClamp=Math.max(maxFootClamp,distance(b.c,b.target));else maxArmClamp=Math.max(maxArmClamp,distance(b.c,b.target));
 }
 for(const [side,anchor]of Object.entries(s.contacts)){
  const solved=rig[side==='L'?'legL':'legR'].c,target=rotate(anchor);
  maxContactSlip=Math.max(maxContactSlip,Math.hypot(solved[0]-target[0],solved[1]-target[1],solved[2]-5-target[2]));
 }
 const joints=runtime.hierarchy(clip,time,{loop:false});assert.ok(joints.every(j=>j.position.every(Number.isFinite)));
}
assert.ok(maxBoneError<1e-6,'Ossos alterados');
assert.ok(maxFootClamp<1e-6&&maxArmClamp<1e-6&&maxContactSlip<1e-6,'IK ou apoios fora do alcance');
assert.ok(clip.loop&&clip.contacts.some(e=>e.side==='L')&&clip.contacts.some(e=>e.side==='R'),'Caminhada sem loop/apoios bilaterais');
const report={procedural:'experimental',samples:clip.times.length,duration:clip.duration,contacts:clip.contacts.length,loop:clip.loop,maxBoneError,maxFootClamp,maxArmClamp,maxContactSlip,bytes:JSON.stringify(clip).length};
console.log(JSON.stringify(report));
if(process.argv.includes('--write')){
 const output=path.join(root,'tools/movalab/workspace/exports');fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'mixamo-walking.aruan-clip.v1.json'),JSON.stringify(clip)+'\n');
 fs.writeFileSync(path.join(root,'tools/movalab/docs/procedural-walking-report.json'),JSON.stringify(report,null,2)+'\n');
}
