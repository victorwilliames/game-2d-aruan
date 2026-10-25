// Numerical audit with the same FBXLoader as the browser. Does not modify originals.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {CompatibleFBXLoader as FBXLoader} from '../app/fbx-loader.js';
import {LoadingManager,Texture,AnimationMixer,LoopOnce} from '../app/node_modules/three/build/three.module.js';
import {captureRest,restoreRest,HumanoidRetarget} from '../app/humanoid.js';
const here=path.dirname(fileURLToPath(import.meta.url)),pack=path.resolve(here,'../workspace/sources/MixamoOriginalsPack');
globalThis.window={URL};
const manager=new LoadingManager();manager.addHandler(/.*/,{setPath(){return this;},load(){return new Texture();}});
const load=relative=>{const b=fs.readFileSync(path.join(pack,relative));return new FBXLoader(manager).parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
const warnings=[];console.warn=(...args)=>warnings.push(args.join(' '));
const targets=['kid','cabecudo'].map(name=>({name,root:load('Characters3D/'+name+'.fbx')}));
for(const t of targets)captureRest(t.root);
const files=fs.readdirSync(pack,{recursive:true}).filter(f=>f.toLowerCase().endsWith('.fbx'));
const results=[];let combinations=0;
for(const file of files){
  const bytes=fs.readFileSync(path.join(pack,file));const version=bytes.readUInt32LE(23);
  if(version<7000){results.push({file:file.replaceAll('\\','/'),version,status:'precisa de conversão'});continue;}
  let root;
  try{root=load(file);}catch(e){results.push({file:file.replaceAll('\\','/'),version,status:'erro do loader',error:e.message});continue;}
  const rest=captureRest(root);
  let meshes=0,skinned=0;root.traverse(o=>{if(o.isMesh)meshes++;if(o.isSkinnedMesh)skinned++;});
  const clips=root.animations;
  const result={file:file.replaceAll('\\','/'),version,status:clips.length?'animação':'personagem',bones:rest.bones.length,meshes,skinned,clips:clips.length,targets:[]};
  if(clips.length){
    const mixer=new AnimationMixer(root),action=mixer.clipAction(clips[0]);action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
    for(const target of targets){
      restoreRest(captureRest(target.root));const r=new HumanoidRetarget(root,target.root);let maxError=0;
      for(const ratio of [0,.25,.5,.75,1]){
        action.enabled=true;action.paused=false;mixer.setTime(clips[0].duration*ratio);r.apply();
        for(const b of r.target.bones){
          assert.ok(b.bone.matrixWorld.elements.every(Number.isFinite),file+': NaN');
          if(b!==r.target.byName.get('hips'))maxError=Math.max(maxError,b.bone.position.distanceTo(r.target.local.get(b.bone).position));
        }
      }
      assert.ok(maxError<1e-8,file+': comprimentos');
      result.targets.push({name:target.name,status:r.report.status,mapped:r.report.mapped,maxLocalPositionError:maxError});combinations++;
    }
    mixer.stopAllAction();mixer.uncacheRoot(root);
  }
  root.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});
  results.push(result);
}
const report={schemaVersion:1,source:'FBXLoader three@0.180.0; imagem não decodificada no teste numérico',
  summary:{files:results.length,animations:results.filter(r=>r.status==='animação').length,characters:results.filter(r=>r.status==='personagem').length,
    legacy:results.filter(r=>r.status==='precisa de conversão').length,loaderErrors:results.filter(r=>r.status==='erro do loader').length,combinations,peakRssMiB:+(process.resourceUsage().maxRSS/1024).toFixed(1)},warnings:[...new Set(warnings)],results};
if(process.argv.includes('--report'))fs.writeFileSync(path.resolve(here,'../docs/real-pack-2026-10-25.json'),JSON.stringify(report,null,2)+'\n');
assert.equal(report.summary.loaderErrors,0,'FBX moderno falhou no loader');
assert.ok(report.summary.animations>=34,'Animações do pack ausentes');
console.log(JSON.stringify(report.summary));
