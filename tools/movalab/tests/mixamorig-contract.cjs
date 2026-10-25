'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const C=require('../src/mixamorig-contract.cjs');
const {evaluateSkeleton}=require('../src/rig-v2.cjs');
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const dot=(a,b)=>Math.min(1,Math.abs(a.reduce((s,v,i)=>s+v*b[i],0))/(Math.hypot(...a)*Math.hypot(...b)));
const fixture=path.resolve(__dirname,'../docs/mixamorig65.v1.json');
async function main(){
 assert.equal(C.normalize('mixamorig:Hips'),'Hips');assert.equal(C.normalize('mixamorig2:LeftHandIndex1'),'LeftHandIndex1');assert.throws(()=>C.normalize('unregistered:Hips'),/namespace/);
 assert.throws(()=>C.eulerFBX([1,2,3],6),/rotation order/);
 const {rotate}=require('../src/rig-v2.cjs');assert.ok(dist(rotate(C.eulerFBX([90,90,0]),[0,1,0]),[1,0,0])<1e-12,'FBX XYZ must apply X, then Y in world axes');
 const root=process.env.MIXAMO_ROOT;
 if(!root){if(fs.existsSync(fixture)){const c=JSON.parse(fs.readFileSync(fixture));assert.equal(c.bones.length,65);assert.equal(C.auditTopology(c.bones,c).compatible,true);const world=C.globals(c.bones);for(const b of c.bones){assert.ok(dist(world[b.name].position,b.restWorld.position)<1e-9);assert.ok(1-dot(C.localQuaternion(b.fbx,b.fbx['Lcl Rotation']||[0,0,0]),b.quaternion)<1e-12);}const wrong=c.bones.map(b=>({...b,parent:b.name==='Head'?'Hips':b.parent}));assert.equal(C.auditTopology(wrong,c).compatible,false);assert.throws(()=>C.globals([{name:'A',parent:'B'},{name:'B',parent:'A'}],[{translation:[0,0,0],quaternion:[0,0,0,1]},{translation:[0,0,0],quaternion:[0,0,0,1]}]),/Cyclic/);}console.log('OK: contract unit checks; real FBX parity not run (set MIXAMO_ROOT).');return;}
 const inventory=JSON.parse(fs.readFileSync(path.join(root,'metadata/inventory.json'))),meta=JSON.parse(fs.readFileSync(path.join(root,'metadata/raw/animation_bones.json')));
 const source=path.join(root,'animation_motion/Walking.fbx');const contract=C.extractContract(source,meta,{dataset:inventory.dataset,revision:inventory.revision,path:'animation_motion/Walking.fbx'});
 assert.equal(contract.provenance.sha256,inventory.files.find(e=>e.path==='animation_motion/Walking.fbx').sha256);
 const app=path.resolve(__dirname,'../app');const T=await import(pathToFileURL(path.join(app,'node_modules/three/build/three.module.js')));const {CompatibleFBXLoader}=await import(pathToFileURL(path.join(app,'fbx-loader.js')));
 const {aruanHierarchy}=await import(pathToFileURL(path.join(app,'aruan-profile.js')));
 const proxyBones=aruanHierarchy().map(([name,parent,translation])=>({name,parent,translation}));assert.equal(C.auditTopology(proxyBones,contract).compatible,true);
 // Exact source names/parents are shared; different rest translations are expected.
 assert.ok(proxyBones.some(b=>dist(b.translation,contract.bones.find(c=>c.name===b.name).translation)>1));
 const metadataBones=JSON.parse(fs.readFileSync(path.join(root,'metadata/raw/character_bones.json'))),characterDiagnostics=inventory.files.filter(e=>e.kind==='character').map(e=>{const names=metadataBones[path.basename(e.path)].map(C.normalize),missing=contract.bones.filter(b=>!names.includes(b.name)).map(b=>b.name);return {path:e.path,channels:names.length,status:missing.length?'partial':'names-only',missing,warning:'Metadata channel count does not prove hierarchy, bind pose or skin compatibility.'};});
 let maxPositionError=0,maxQuaternionError=0,oldEvaluatorError=0,restMaxPositionError=0,totalSamples=0;const clips=[];
 const names=['Walking.fbx','Running.fbx','Falling_To_Roll.fbx','Hard_Landing.fbx','Punching.fbx','180_Turn_W_Briefcase.fbx'];
 for(const name of names){
  const entry=inventory.files.find(e=>e.path==='animation_motion/'+name);assert.ok(entry,'Representative source must exist: '+name);
  const file=path.join(root,entry.path),{bytes,animation,scene}=C.read(file);const sourceRest=C.restBones(scene,animation);assert.equal(C.auditTopology(sourceRest,contract).compatible,true);
  const model=new CompatibleFBXLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');const bones=new Map();model.traverse(b=>{if(b.isBone)bones.set(C.normalize(b.name),b);});assert.equal(bones.size,65);
  model.updateMatrixWorld(true);const rest=C.globals(sourceRest);for(const b of sourceRest){const p=bones.get(b.name).getWorldPosition(new T.Vector3()).toArray();restMaxPositionError=Math.max(restMaxPositionError,dist(p,rest[b.name].position));}assert.ok(restMaxPositionError<1e-6,'Raw rest transforms must match the independent loader');
  const sampler=C.createSampler(animation,contract),mixer=new T.AnimationMixer(model),action=mixer.clipAction(model.animations[0]);action.play();
  const duration=(animation.times.at(-1)-animation.times[0])/animation.ticksPerSecond;let maxP=0,maxQ=0,worst;
  // Exact keys isolate transform convention from Euler-vs-quaternion interpolation.
  const times=[...new Set([...animation.times.filter((_,i)=>i%Math.max(1,Math.floor(animation.times.length/12))===0).map(t=>(t-animation.times[0])/animation.ticksPerSecond).filter(t=>t<duration-1e-6),...[.1234,.3333,.8765].map(t=>t*duration)])].sort((a,b)=>a-b);
  for(const time of times){mixer.setTime(time);model.updateMatrixWorld(true);const actual=sampler(time).world,old=evaluateSkeleton(animation,time);
   for(const b of contract.bones){const ref=bones.get(b.name),p=ref.getWorldPosition(new T.Vector3()).toArray(),q=ref.getWorldQuaternion(new T.Quaternion()).toArray();const error=dist(p,actual[b.name].position);if(error>maxP)worst={time,bone:b.name,reference:p,actual:actual[b.name].position,sourceStart:animation.times[0]/animation.ticksPerSecond,loaderDuration:model.animations[0].duration};maxP=Math.max(maxP,error);maxQ=Math.max(maxQ,1-dot(q,actual[b.name].quaternion));oldEvaluatorError=Math.max(oldEvaluatorError,dist(p,old[b.name].position));}
   totalSamples++;
  }
  mixer.stopAllAction();mixer.uncacheRoot(model);assert.ok(maxP<0.0001,`${name}: spatial mismatch ${maxP} ${JSON.stringify(worst)}`);assert.ok(maxQ<1e-8,`${name}: quaternion mismatch ${maxQ}`);maxPositionError=Math.max(maxPositionError,maxP);maxQuaternionError=Math.max(maxQuaternionError,maxQ);clips.push({path:entry.path,sha256:entry.sha256,samples:times.length,duration,maxPositionError:maxP,maxQuaternionError:maxQ});
 }
 const report={contract:C.VERSION,sourceSha256:contract.provenance.sha256,proxyTopology:C.auditTopology(proxyBones,contract),proxyRequiresRestCalibration:true,totalSamples,restMaxPositionError,maxPositionError,maxQuaternionError,oldEvaluatorError,clips,characters:characterDiagnostics,limitations:['Proxy deformation and destination calibration are not certified by this source parity test.','Queries include union-of-curve times: individual rotations interpolate by quaternion. Unaligned axes or Euler steps >=180 degrees require further offline baking and are rejected explicitly.','No Canvas migration or gameplay binding in this milestone.']};
 if(process.argv.includes('--write')){fs.writeFileSync(fixture,JSON.stringify(contract,null,2)+'\n');fs.writeFileSync(path.resolve(__dirname,'../docs/mixamorig-contract-audit.json'),JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify({...report,characters:characterDiagnostics.map(c=>({name:path.basename(c.path),status:c.status,missing:c.missing.length}))},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
