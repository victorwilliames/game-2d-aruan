import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {FBXLoader} from '../app/node_modules/three/examples/jsm/loaders/FBXLoader.js';
import {AnimationMixer,LoopOnce,LoadingManager,Texture,Vector3,Group,Bone} from '../app/node_modules/three/build/three.module.js';
import {HumanoidRetarget,captureRest,restoreRest,compatibility} from '../app/humanoid.js';
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
  const first=new Vector3();let maxChange=0,maxLengthError=0;
  for(let frame=0;frame<=60;frame++){
    action.paused=false;action.enabled=true;mixer.setTime(source.animations[0].duration*frame/60);
    retarget.apply();
    const pos=hand.getWorldPosition(new Vector3());
    if(!frame)first.copy(pos);else maxChange=Math.max(maxChange,pos.distanceTo(first));
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
  restoreRest(neutral);
  reports.push({name,...retarget.report,scale:retarget.scale,maxChange,maxLengthError});
}
const bad=new Group();bad.add(new Bone());
assert.equal(compatibility(captureRest(source),captureRest(bad)).compatible,false);
assert.throws(()=>new HumanoidRetarget(source,bad),/Falta mapeamento/);
console.log(JSON.stringify({retarget:'PASS',reports},null,2));
