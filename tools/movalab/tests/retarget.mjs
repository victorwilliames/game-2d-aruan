import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {FBXLoader} from '../app/node_modules/three/examples/jsm/loaders/FBXLoader.js';
import {AnimationMixer,LoopOnce,LoadingManager,Texture,Vector3,Group,Bone} from '../app/node_modules/three/build/three.module.js';
import {HumanoidRetarget,captureRest,restoreRest,compatibility,humanoidSlots,normalize} from '../app/humanoid.js';
const here=path.dirname(fileURLToPath(import.meta.url));
const pack=path.resolve(here,'../workspace/sources/MixamoOriginalsPack');
// Headless numerical test deliberately skips image decoding. Browser QA checks textures.
globalThis.window={URL};
const textureLoader={setPath(){return this;},load(){return new Texture();}};
const manager=new LoadingManager();manager.addHandler(/.*/,textureLoader);
function load(file){
  const data=fs.readFileSync(path.join(pack,file));
  return new FBXLoader(manager).parse(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
}
const source=load('Animations/Start Pack/Start Walking.fbx');
captureRest(source);
const mixer=new AnimationMixer(source),action=mixer.clipAction(source.animations[0]);
action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
const reports=[];
for(const name of ['kid','cabecudo']){
  const target=load('Characters3D/'+name+'.fbx');
  const retarget=new HumanoidRetarget(source,target),neutral=captureRest(target);
  const hand=neutral.byName.get('lefthand').bone;
  const first=new Vector3();let maxChange=0,maxLengthError=0,maxAimError=0;
  for(let frame=0;frame<=60;frame++){
    action.paused=false;action.enabled=true;mixer.setTime(source.animations[0].duration*frame/60);
    retarget.apply();
    const pos=hand.getWorldPosition(new Vector3());
    if(!frame)first.copy(pos);else maxChange=Math.max(maxChange,pos.distanceTo(first));
    for(const side of ['Left','Right'])for(const [a,b]of [['Arm','ForeArm'],['ForeArm','Hand'],['UpLeg','Leg'],['Leg','Foot'],['Foot','ToeBase']]){
      const direction=rest=>rest.byName.get((side+b).toLowerCase()).bone.getWorldPosition(new Vector3()).sub(rest.byName.get((side+a).toLowerCase()).bone.getWorldPosition(new Vector3())).normalize();
      maxAimError=Math.max(maxAimError,direction(retarget.source).applyQuaternion(retarget.align).distanceTo(direction(neutral)));
    }
    for(const entry of neutral.bones){
      const b=entry.bone,rest=neutral.local.get(b);
      if(entry===neutral.byName.get('hips'))continue;
      maxLengthError=Math.max(maxLengthError,b.position.distanceTo(rest.position));
      assert.ok(b.quaternion.toArray().every(Number.isFinite));
      assert.ok(Math.abs(b.quaternion.length()-1)<1e-6);
      assert.ok(b.scale.distanceTo(rest.scale)<1e-9);
    }
  }
  assert.ok(maxChange>1,'Mão não se move em '+name);
  assert.ok(maxLengthError<1e-9,'Comprimentos alterados em '+name);
  assert.ok(maxAimError<1e-7,'Direção anatômica difere em '+name+': '+maxAimError);
  restoreRest(neutral);
  reports.push({name,...retarget.report,scale:retarget.scale,maxChange,maxLengthError,maxAimError});
}
const bad=new Group();bad.add(new Bone());
assert.equal(compatibility(captureRest(source),captureRest(bad)).compatible,false);
assert.throws(()=>new HumanoidRetarget(source,bad),/Falta mapeamento/);
// Rename both real FBX rigs. Profiles must recover the same animated globals.
const renamedSource=load('Animations/Start Pack/Start Walking.fbx'),renamedTarget=load('Characters3D/kid.fbx');
function renameRig(root,prefix){const mapping={},names=new Map();let index=0;
 root.traverse(b=>{if(!b.isBone)return;const slot=humanoidSlots.find(n=>normalize(n)===normalize(b.name));
  const old=b.name;b.name=prefix+(index++);names.set(old,b.name);if(slot)mapping[slot]=b.name;});
 for(const animation of root.animations)for(const track of animation.tracks){const dot=track.name.lastIndexOf('.'),old=track.name.slice(0,dot);if(names.has(old))track.name=names.get(old)+track.name.slice(dot);}
 return mapping;
}
const sourceMap=renameRig(renamedSource,'origem_'),targetMap=renameRig(renamedTarget,'destino_');
assert.throws(()=>new HumanoidRetarget(renamedSource,renamedTarget),/Falta mapeamento/);
const mapped=new HumanoidRetarget(renamedSource,renamedTarget,{source:sourceMap,target:targetMap});
const originalTarget=load('Characters3D/kid.fbx'),baseline=new HumanoidRetarget(source,originalTarget);
const renamedMixer=new AnimationMixer(renamedSource),renamedAction=renamedMixer.clipAction(renamedSource.animations[0]);renamedAction.play();
let mappingError=0;
for(const t of [0,.13,.37,.7]){
 action.enabled=true;action.paused=false;mixer.setTime(t);renamedMixer.setTime(t);baseline.apply();mapped.apply();
 for(const slot of humanoidSlots){const a=baseline.target.byName.get(normalize(slot)),b=mapped.target.byName.get(normalize(slot));if(a&&b)mappingError=Math.max(mappingError,a.bone.getWorldPosition(new Vector3()).distanceTo(b.bone.getWorldPosition(new Vector3())));}
}
assert.ok(mappingError<1e-6,'Mapeamento explícito alterou o retarget: '+mappingError);
assert.throws(()=>new HumanoidRetarget(source,originalTarget,{source:{Hips:'não-existe'}}),/ausente/);
assert.throws(()=>new HumanoidRetarget(source,originalTarget,{source:{Hips:null}}),/Falta mapeamento/);
const sourceHips=captureRest(source).byName.get('hips').bone.name;
assert.throws(()=>new HumanoidRetarget(source,originalTarget,{source:{Head:sourceHips}}),/dois canais/);
console.log('Perfis explícitos em65ossos renomeados: erro máximo='+mappingError);
const skinSource=load('Animations/Start Pack/Start Walking.fbx'),skinTarget=load('AnimationsWithSkin/Start Pack/Start Walking-com-skin-mixamo.fbx');
const skinRetarget=new HumanoidRetarget(skinSource,skinTarget),skinMixer=new AnimationMixer(skinSource);skinMixer.clipAction(skinSource.animations[0]).play();skinMixer.setTime(.45);skinRetarget.apply();
assert.equal(skinRetarget.target.bones.length,117);assert.equal(skinRetarget.targetSlots.size,117,'Aliases de skin/transform não podem perder movimento');
const aim=rest=>rest.byName.get('leftforearm').bone.getWorldPosition(new Vector3()).sub(rest.byName.get('leftarm').bone.getWorldPosition(new Vector3())).normalize();
assert.ok(aim(skinRetarget.source).applyQuaternion(skinRetarget.align).dot(aim(skinRetarget.target))>.999,'Braço ficou emT apesar da animação');
for(const e of skinRetarget.target.bones){const parent=e.bone.parent;if(parent?.isBone&&parent.name===e.bone.name){assert.ok(e.bone.position.distanceTo(skinRetarget.target.local.get(e.bone).position)<1e-8);assert.ok(e.bone.quaternion.angleTo(skinRetarget.target.local.get(e.bone).quaternion)<1e-6,'Alias de skin alterou rotação local');}}
const duplicateName=skinRetarget.target.byName.get('hips').bone.name;
assert.throws(()=>new HumanoidRetarget(skinSource,skinTarget,{target:{Hips:duplicateName}}),/ambíguo/);
assert.equal(new HumanoidRetarget(skinSource,skinTarget,{target:{Hips:'@bone:1:'+duplicateName}}).targetSlots.size,117);
const ambiguous=new Group(),a=new Bone(),b=new Bone();a.name=b.name='Hips';ambiguous.add(a,b);
assert.throws(()=>new HumanoidRetarget(ambiguous,originalTarget),/ramos distintos/);
console.log(JSON.stringify({retarget:'PASS',reports},null,2));
