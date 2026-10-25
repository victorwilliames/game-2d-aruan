import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {CompatibleFBXLoader} from '../app/fbx-loader.js';
import {convertMotion} from '../app/converter.js';
import {LoadingManager,Texture} from '../app/node_modules/three/build/three.module.js';
const require=createRequire(import.meta.url),runtime=require('../../../js/clip-player.js');
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../..'),pack=path.join(root,'tools/movalab/workspace/sources/MixamoOriginalsPack');
const context=vm.createContext({console,Math});vm.runInContext(fs.readFileSync(path.join(root,'js/math.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/rig.js'),'utf8')+'\nglobalThis.solve=solveRig;',context);
globalThis.window={URL};const manager=new LoadingManager();manager.addHandler(/.*/,{setPath(){return this;},load(){return new Texture();}});
const files=fs.readdirSync(pack,{recursive:true}).filter(f=>/\.fbx$/i.test(f));const results=[];
for(const file of files){
 const input=fs.readFileSync(path.join(pack,file));if(input.readUInt32LE(23)<7000||file.startsWith('Characters3D'))continue;
 const source=new CompatibleFBXLoader(manager).parse(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),'');if(!source.animations.length)continue;
 const clip=await convertMotion(source,{name:path.basename(file,'.fbx'),filename:file,status:'imported'},{loop:true});
 let foot=0,arm=0,headBottom=Infinity;
 for(let i=0;i<=Math.ceil(clip.duration*120);i++){
  const s=runtime.sample(clip,Math.min(clip.duration,i/120),{loop:false}),r=context.solve(s.pose,s.root,0);
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  foot=Math.max(foot,distance(r.legL.c,r.legL.target),distance(r.legR.c,r.legR.target));
  arm=Math.max(arm,distance(r.armL.c,r.armL.target),distance(r.armR.c,r.armR.target));headBottom=Math.min(headBottom,r.head.o[2]-35);
 }
 const result={file:file.replaceAll('\\','/'),duration:clip.duration,loop:clip.loop,contacts:clip.contacts.length,
  maxFootClamp:+foot.toFixed(4),maxArmClamp:+arm.toFixed(4),minHeadBottom:+headBottom.toFixed(4),status:foot<1e-5&&arm<1e-5&&headBottom>=0?'IK válido':'requer ajuste'};
 results.push(result);source.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});
}
const report={schemaVersion:1,note:'Diagnóstico numérico do adaptador Canvas, sem certificação artística ou de ataques.',
 summary:{clips:results.length,validIK:results.filter(r=>r.status==='IK válido').length,needsAdjustment:results.filter(r=>r.status!=='IK válido').length},results};
fs.writeFileSync(path.join(root,'tools/movalab/docs/procedural-pack-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary));console.log(JSON.stringify(results.filter(r=>r.status!=='IK válido')));
