import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import * as T from '../app/node_modules/three/build/three.module.js';
import {CompatibleFBXLoader} from '../app/fbx-loader.js';
import {createAruanProxy} from '../app/aruan-proxy.js';
import {aruanProfile,aruanHierarchy,createHumanoidProfile,humanoidArchetypes} from '../app/aruan-profile.js';
import {captureRest,HumanoidRetarget,normalize} from '../app/humanoid.js';
import {calibrateDestinationBind} from '../app/humanoid-calibration.js';
const require=createRequire(import.meta.url),C=require('../src/mixamorig-contract.cjs');
const contract=require('../docs/mixamorig65.v1.json');
const root=process.env.MIXAMO_ROOT;
for(const body of [{upper:0},{fore:NaN},{shin:-1},{spine:Infinity},{unknown:2}])assert.throws(()=>createHumanoidProfile({body}));
assert.throws(()=>createHumanoidProfile({shape:{headScale:0}}));
for(const p of [aruanProfile,...Object.values(humanoidArchetypes)]){
 assert.equal(C.auditTopology(aruanHierarchy(p).map(([name,parent])=>({name,parent})),contract).compatible,true);
 const proxy=createAruanProxy(p);let mesh;proxy.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});assert.ok(mesh);
 assert.equal(calibrateDestinationBind(proxy).requiresRepair,false);const positions=mesh.geometry.getAttribute('position').array.slice();
 // A bad inverse-bind transform is detected and repaired without changing the
 // rest geometry, vertex weights, hierarchy or the source asset.
 mesh.skeleton.boneInverses[0].elements[12]+=2;
 assert.equal(calibrateDestinationBind(proxy).requiresRepair,true);
 assert.equal(calibrateDestinationBind(proxy,{repair:true}).repaired,true);
 assert.deepEqual(mesh.geometry.getAttribute('position').array,positions);
 mesh.geometry.dispose();mesh.material.dispose();mesh.skeleton.dispose();
}
if(!root){console.log('OK: immutable profiles, 65-channel topology and bind repair without geometry changes; real FBX audit not run (set MIXAMO_ROOT).');process.exit(0);}
// Numeric skin/rig audit only: image decoding belongs to browser QA. Never claim
// decoded textures from placeholder Texture objects in this Node-only test.
const manager=new T.LoadingManager();manager.addHandler(/.*/,{path:'',setPath(p){this.path=p;return this;},load(){return new T.Texture();}});
const objectURLs=[];globalThis.window={URL:{createObjectURL(blob){const url=URL.createObjectURL(blob);objectURLs.push(url);return url;}}};
function load(file){const bytes=fs.readFileSync(file),warnings=[],old=console.warn;let model;try{console.warn=(...v)=>warnings.push(v.join(' '));model=new CompatibleFBXLoader(manager).parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');}finally{console.warn=old;for(const url of objectURLs.splice(0))URL.revokeObjectURL(url);}return {model,warnings};}
function dispose(root){root.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});}
const {model:source}=load(path.join(root,'animation_motion/Walking.fbx'));const sourceRest=captureRest(source);
const names=['Walking.fbx','Running.fbx','Falling_To_Roll.fbx','Hard_Landing.fbx','Punching.fbx','180_Turn_W_Briefcase.fbx'];
const clips=names.map(name=>{const {model}=load(path.join(root,'animation_motion',name));const clip=model.animations[0];dispose(model);return {name,clip};});
const inventory=JSON.parse(fs.readFileSync(path.join(root,'metadata/inventory.json')));
const targets=[{name:'Aruan',profile:aruanProfile},...Object.entries(humanoidArchetypes).map(([name,profile])=>({name,profile})),...inventory.files.filter(e=>e.kind==='character').map(e=>({name:path.basename(e.path,'.fbx'),file:path.join(root,e.path)}))];
const result=[];let peakRSS=process.memoryUsage().rss;const started=performance.now();
for(const item of targets){
 const {model:target,warnings}=item.file?load(item.file):{model:createAruanProxy(item.profile),warnings:[]};target.updateMatrixWorld(true);
 const bindCalibration=calibrateDestinationBind(target,{repair:true});
 const rest=captureRest(target),retarget=new HumanoidRetarget(source,target),meshes=[];
 target.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});assert.ok(meshes.length,'Skinned mesh required: '+item.name);
 const semantic=contract.bones.filter(b=>rest.byName.has(normalize(b.name))).map(b=>{const bone=rest.byName.get(normalize(b.name)).bone;let parent=bone.parent;while(parent&&!parent.isBone)parent=parent.parent;while(parent?.isBone&&normalize(parent.name)===normalize(b.name))parent=parent.parent;return {name:b.name,parent:parent?.isBone?C.normalize(parent.name):null};});
 const topology=C.auditTopology(semantic,contract),lengths=new Map(rest.bones.map(e=>[e.bone,rest.local.get(e.bone).position.length()]));
 let vertices=0,weightError=0,maxBindError=0,maxLengthError=0,skinMotion=0,maxAimError=0,fingerMotion=0;
 const probes=[];
 for(const mesh of meshes){
  mesh.skeleton.update();const weights=mesh.geometry.getAttribute('skinWeight'),indices=mesh.geometry.getAttribute('skinIndex'),positions=mesh.geometry.getAttribute('position');vertices+=positions.count;
  assert.ok(mesh.bindMatrix.elements.every(Number.isFinite));for(const inverse of mesh.skeleton.boneInverses)assert.ok(inverse.elements.every(Number.isFinite));
  for(let i=0;i<positions.count;i++){let sum=0;for(let j=0;j<4;j++){const w=weights.getComponent(i,j),index=indices.getComponent(i,j);assert.ok(Number.isFinite(w)&&w>=0&&Number.isInteger(index)&&index>=0&&index<mesh.skeleton.bones.length,'Invalid skin weights/index');sum+=w;}weightError=Math.max(weightError,Math.abs(sum-1));}
  for(let i=0;i<positions.count;i+=Math.max(1,Math.floor(positions.count/128))){const raw=new T.Vector3().fromBufferAttribute(positions,i),skin=mesh.getVertexPosition(i,new T.Vector3());maxBindError=Math.max(maxBindError,raw.distanceTo(skin));probes.push({mesh,index:i,rest:skin.clone()});}
 }
 assert.ok(weightError<1e-5,item.name+' normalized weights');assert.ok(maxBindError<.001,item.name+' bind pose '+maxBindError);
 const finger=rest.byName.get('lefthandindex2')?.bone,hand=rest.byName.get('lefthand')?.bone;
 const relativeFinger=()=>hand.getWorldQuaternion(new T.Quaternion()).invert().multiply(finger.getWorldQuaternion(new T.Quaternion())).normalize();
 const fingerStart=finger&&hand?relativeFinger():null;
 const mixer=new T.AnimationMixer(source);let samples=0;
 for(const {name,clip}of clips){mixer.stopAllAction();const action=mixer.clipAction(clip);action.play();
  for(const ratio of [0,.17,.43,.71,.93]){
   mixer.setTime(clip.duration*ratio);source.updateMatrixWorld(true);retarget.apply();samples++;
   for(const entry of rest.bones){const b=entry.bone;assert.ok(b.matrixWorld.elements.every(Number.isFinite));if(normalize(b.name)!=='hips')maxLengthError=Math.max(maxLengthError,Math.abs(b.position.length()-lengths.get(b)));}
   // Hips is the authorized root motion channel; every other local translation
   // remains exactly the destination rest offset after the shared calibration.
   for(const entry of rest.bones)if(normalize(entry.bone.name)!=='hips')assert.ok(entry.bone.position.distanceTo(rest.local.get(entry.bone).position)<1e-8);
   for(const [bone,aim]of retarget.aims){const slot=retarget.targetSlots.get(bone),s=retarget.source.byName.get(slot),sourceAim=aim.child.bone.getWorldPosition(new T.Vector3()).sub(s.bone.getWorldPosition(new T.Vector3())).normalize().applyQuaternion(retarget.align),child=rest.byName.get(normalize(aim.child.bone.name))?.bone;if(child){const actual=child.getWorldPosition(new T.Vector3()).sub(bone.getWorldPosition(new T.Vector3())).normalize();maxAimError=Math.max(maxAimError,sourceAim.distanceTo(actual));}}
   if(fingerStart)fingerMotion=Math.max(fingerMotion,1-Math.abs(relativeFinger().dot(fingerStart)));
   for(const mesh of meshes)mesh.skeleton.update();for(const probe of probes){const p=probe.mesh.getVertexPosition(probe.index,new T.Vector3());assert.ok(p.toArray().every(Number.isFinite));skinMotion=Math.max(skinMotion,p.distanceTo(probe.rest));}
  }
  mixer.uncacheAction(clip);
 }
 assert.ok(skinMotion>.01,'Actual skinning motion required');assert.ok(maxAimError<1e-6,item.name+' anatomical direction '+maxAimError);
 result.push({name:item.name,profile:item.profile?.id||null,status:retarget.report.status,topology,bindCalibration,meshes:meshes.length,vertices,weightError,maxBindError,maxAimError,maxLengthError,skinMotion,fingerMotion,samples,calibrations:1,warnings,textures:'not decoded in Node audit'});
 mixer.stopAllAction();mixer.uncacheRoot(source);dispose(target);global.gc?.();peakRSS=Math.max(peakRSS,process.memoryUsage().rss);
}
const report={contract:contract.schema,sourceRevision:inventory.revision,clips:names,destinations:result,elapsedMs:performance.now()-started,peakRSS,limitations:['Numerical retarget and skin validity do not certify art, collision, contact or Canvas parity.','Partial fingers remain absent; none are generated on third-party meshes.','Texture decoding is intentionally not claimed by this Node audit.']};
if(process.argv.includes('--write'))fs.writeFileSync(new URL('../docs/humanoid-profiles-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,destinations:result.map(r=>({name:r.name,status:r.status,missing:r.topology.missing.length,vertices:r.vertices,maxAimError:r.maxAimError,maxBindError:r.maxBindError,fingerMotion:r.fingerMotion}))},null,2));
dispose(source);
