/** Compare real FBXLoader and converted GLTFLoader joint trajectories in meters. */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.env.MOVALAB_THREE_ROOT||path.resolve(import.meta.dirname,'../app/node_modules/three');
const THREE=await import(pathToFileURL(path.join(root,'build/three.module.js')));
const {FBXLoader}=await import(pathToFileURL(path.join(root,'examples/jsm/loaders/FBXLoader.js')));
const {GLTFLoader}=await import(pathToFileURL(path.join(root,'examples/jsm/loaders/GLTFLoader.js')));
// This test compares transforms, not texture fidelity. No image/network loading.
globalThis.window={URL};
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
const bytes=p=>{const b=fs.readFileSync(p);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);};
const [sourcePath,derivedPath]=process.argv.slice(2);
if(!sourcePath||!derivedPath)throw Error('Informe FBX com animação e GLB convertido');
const source=new FBXLoader().parse(bytes(sourcePath),'');
const target=await new GLTFLoader().parseAsync(bytes(derivedPath),'');
if(!source.animations.length||!target.animations.length)throw Error('Falta animação real para comparar');
const sourceMixer=new THREE.AnimationMixer(source),targetMixer=new THREE.AnimationMixer(target.scene);
sourceMixer.clipAction(source.animations[0]).play();
targetMixer.clipAction(target.animations[0]).play();
const normalize=name=>name.replace(/^.*:/,'').replace(/^mixamorig\d*/i,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const sourceBones=new Map(),targetBones=new Map();
source.traverse(o=>{if(o.isBone)sourceBones.set(normalize(o.name),o);});
target.scene.traverse(o=>{targetBones.set(normalize(o.name),o);});
let maxPositionError=0,maxQuaternionError=0,measurements=0;
for(const time of [0,1/30,.5,1]){
  sourceMixer.setTime(time);targetMixer.setTime(time);
  source.updateMatrixWorld(true);target.scene.updateMatrixWorld(true);
  for(const [name,bone] of sourceBones){
    const other=targetBones.get(name);if(!other)throw Error('Osso perdido: '+name);
    const a=bone.getWorldPosition(new THREE.Vector3()).multiplyScalar(.01),b=other.getWorldPosition(new THREE.Vector3());
    maxPositionError=Math.max(maxPositionError,a.distanceTo(b));
    const qa=bone.getWorldQuaternion(new THREE.Quaternion()),qb=other.getWorldQuaternion(new THREE.Quaternion());
    maxQuaternionError=Math.max(maxQuaternionError,qa.angleTo(qb));measurements++;
  }
}
if(maxPositionError>1e-4||maxQuaternionError>1e-3)throw Error('Conversão diverge do FBX: '+JSON.stringify({maxPositionError,maxQuaternionError}));
console.log(JSON.stringify({measurements,maxPositionError,maxQuaternionError,sourceDuration:source.animations[0].duration,targetDuration:target.animations[0].duration}));
