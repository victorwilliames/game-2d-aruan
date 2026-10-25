import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CompatibleFBXLoader} from '../app/fbx-loader.js';
import {AnimationMixer,LoopOnce,Vector3} from '../app/node_modules/three/build/three.module.js';
import {createAruanProxy} from '../app/aruan-proxy.js';
import {captureRest,HumanoidRetarget} from '../app/humanoid.js';
const proxy=createAruanProxy(),rest=captureRest(proxy);let mesh;
proxy.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});
assert.ok(mesh);assert.equal(mesh.skeleton.bones.length,65);
const g=mesh.geometry,weight=g.getAttribute('skinWeight'),index=g.getAttribute('skinIndex');
let blends=0;
for(let i=0;i<weight.count;i++){
  const w=[weight.getX(i),weight.getY(i),weight.getZ(i),weight.getW(i)];
  assert.ok(Math.abs(w.reduce((a,b)=>a+b,0)-1)<1e-6);
  if(w[1]>0)blends++;
  assert.ok(index.getX(i)<65&&index.getY(i)<65);
}
assert.ok(blends>100,'Pesos de articulação ausentes');
const input=fs.readFileSync(new URL('../workspace/sources/MixamoOriginalsPack/Animations/Male Locomotion Pack/walking.fbx',import.meta.url));
const source=new CompatibleFBXLoader().parse(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),'');
captureRest(source);const retarget=new HumanoidRetarget(source,proxy);
const mixer=new AnimationMixer(source),action=mixer.clipAction(source.animations[0]);
action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
mesh.skeleton.update();const before=mesh.getVertexPosition(500,new Vector3());
let maxLengthError=0,motion=0;const first=rest.byName.get('leftfoot').bone.getWorldPosition(new Vector3());
for(let i=0;i<=60;i++){
  action.paused=false;action.enabled=true;mixer.setTime(source.animations[0].duration*i/60);retarget.apply();mesh.skeleton.update();
  motion=Math.max(motion,first.distanceTo(rest.byName.get('leftfoot').bone.getWorldPosition(new Vector3())));
  for(const e of rest.bones)if(e!==rest.byName.get('hips'))maxLengthError=Math.max(maxLengthError,e.bone.position.distanceTo(rest.local.get(e.bone).position));
}
const vertexMotion=before.distanceTo(mesh.getVertexPosition(500,new Vector3()));
assert.ok(motion>10&&vertexMotion>.1,'Malha não recebeu animação');assert.ok(maxLengthError<1e-9);
console.log(JSON.stringify({proxy:'PASS',bones:65,vertices:g.attributes.position.count,blendedVertices:blends,motion,vertexMotion,maxLengthError}));
