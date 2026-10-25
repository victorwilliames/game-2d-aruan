/** Three.js GLTFLoader consumer test. No WebGL, browser or source-file writes. */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const threeRoot=process.env.MOVALAB_THREE_ROOT||path.resolve(import.meta.dirname,'../app/node_modules/three');
const THREE=await import(pathToFileURL(path.join(threeRoot,'build/three.module.js')));
const {GLTFLoader}=await import(pathToFileURL(path.join(threeRoot,'examples/jsm/loaders/GLTFLoader.js')));
const reports=[];
for(const file of process.argv.slice(2)){
  const buf=fs.readFileSync(file);
  const parsed=await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'');
  parsed.scene.updateMatrixWorld(true);
  let meshes=0,skins=0,bones=0,maxBindError=0,vertices=0;
  parsed.scene.traverse(o=>{
    if(o.isBone)bones++;
    if(!o.isMesh)return;
    meshes++;vertices+=o.geometry.attributes.position.count;
    if(!o.isSkinnedMesh)return;
    skins++;
    o.skeleton.update();
    for(let i=0;i<o.skeleton.bones.length;i++){
      const actual=new THREE.Matrix4().multiplyMatrices(o.skeleton.bones[i].matrixWorld,o.skeleton.boneInverses[i]);
      for(let j=0;j<16;j++)maxBindError=Math.max(maxBindError,Math.abs(actual.elements[j]-o.matrixWorld.elements[j]));
    }
    for(let i=0;i<o.geometry.attributes.position.count;i+=Math.max(1,Math.floor(o.geometry.attributes.position.count/100))){
      const vertex=new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.position,i);
      o.applyBoneTransform(i,vertex);
      if(!vertex.toArray().every(Number.isFinite))throw Error('Skinning produziu NaN: '+file);
    }
  });
  if(!meshes||!skins||bones<20)throw Error('GLB sem rig/malha esperados: '+file);
  if(maxBindError>1e-4)throw Error('Bind pose divergente '+maxBindError+': '+file);
  const info={file,meshes,skins,bones,vertices,animations:parsed.animations.length,maxBindError};
  reports.push(info);console.log(JSON.stringify(info));
}
if(!reports.length)throw Error('Informe pelo menos um arquivo GLB gerado');
