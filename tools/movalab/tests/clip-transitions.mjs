import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {CompatibleFBXLoader} from '../app/fbx-loader.js';
import {convertMotion} from '../app/converter.js';
const require=createRequire(import.meta.url),runtime=require('../../../js/clip-player.js'),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const context=vm.createContext({console,Math});vm.runInContext(fs.readFileSync(path.join(root,'js/math.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'js/rig.js'),'utf8')+'\nglobalThis.solve=solveRig;',context);
const clips={};
for(const [key,file]of [['walk','walking'],['run','standard run'],['idle','idle']]){
 const relative='MixamoOriginalsPack/Animations/Male Locomotion Pack/'+file+'.fbx',input=fs.readFileSync(path.join(root,'tools/movalab/workspace/sources',relative));
 const source=new CompatibleFBXLoader().parse(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),'');
 const c=await convertMotion(source,{name:'Mixamo '+({walk:'Caminhada',run:'Corrida',idle:'Idle'})[key],relativeSource:relative,sha256:createHash('sha256').update(input).digest('hex'),status:'imported'},{loop:true});
 c.metadata.quality=runtime.inspect(c,context.solve);assert.equal(c.metadata.quality.status,'numeric-pass');
 c.metadata.loopQuality=runtime.inspectLoop(c,context.solve);assert.equal(c.metadata.loopQuality.status,'numeric-pass',key+': '+JSON.stringify(c.metadata.loopQuality));clips[key]=c;
}
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i])),epsilon=1e-5,reports=[];
for(const [a,b,at]of [['walk','run',.35],['run','idle',.31],['idle','walk',1],['walk','walk',.95]]){
 const from=t=>runtime.sample(clips[a],at+t),transition=runtime.createTransition(from,clips[b],{duration:.3,solve:context.solve}),first=transition.sample(0),original=from(0);
 assert.ok(dist(first.root,original.root)<1e-9);for(const key of runtime.fields)assert.ok(Math.abs(first.pose[key]-original.pose[key])<1e-8,key+' saltou na troca');
 const beforeVelocity=from(epsilon).root.map((v,i)=>(v-original.root[i])/epsilon),afterVelocity=transition.sample(epsilon).root.map((v,i)=>(v-first.root[i])/epsilon);
 assert.ok(dist(beforeVelocity,afterVelocity)<1e-4,'Velocidade interrompida no início: '+a+'→'+b);
 const steady=transition.steady.sample(.3),end=transition.sample(.3);assert.deepEqual(end.pose,steady.pose);assert.deepEqual(end.root,steady.root);
 const endBefore=end.root.map((v,i)=>(v-transition.sample(.3-epsilon).root[i])/epsilon),baseEndBefore=end.root.map((v,i)=>(v-transition.steady.sample(.3-epsilon).root[i])/epsilon);
 // Match the destination's same-sided derivative: piecewise-linear FBX samples
 // may themselves change velocity at a keyframe, independent of the fade.
 assert.ok(dist(endBefore,baseEndBefore)<1e-4,'Fade acrescentou salto de velocidade no fim');
 const stable=JSON.stringify(transition.sample(.12));for(const t of [.19,.12,.03,.12,.3,.12]){transition.sample(t);assert.equal(JSON.stringify(transition.sample(.12)),stable,'Amostragem depende da ordem');}
 const interrupted=runtime.createTransition(t=>transition.sample(.12+t),clips[a],{duration:.2,solve:context.solve});
 assert.ok(dist(interrupted.sample(0).root,transition.sample(.12).root)<1e-9,'Interrupção deslocou raiz');
 const interruptedBefore=transition.sample(.12+epsilon).root.map((v,i)=>(v-transition.sample(.12).root[i])/epsilon),interruptedAfter=interrupted.sample(epsilon).root.map((v,i)=>(v-interrupted.sample(0).root[i])/epsilon);
 assert.ok(dist(interruptedBefore,interruptedAfter)<1e-4,'Interrupção mudou velocidade');
 const q=runtime.inspectTransition(transition,context.solve),qi=runtime.inspectTransition(interrupted,context.solve);
 reports.push({from:a,to:b,sourceTime:at,targetPhase:transition.startTime,quality:q,interrupted:qi,rootVelocityError:{start:dist(beforeVelocity,afterVelocity),end:dist(endBefore,baseEndBefore),interruption:dist(interruptedBefore,interruptedAfter)}});
 assert.equal(q.status,'numeric-pass',a+'→'+b+': '+JSON.stringify(q));assert.equal(qi.status,'numeric-pass','Interrupção: '+JSON.stringify(qi));
}
assert.throws(()=>runtime.createTransition(()=>({}),clips.walk),/estado/);
assert.throws(()=>runtime.createTransition(t=>runtime.sample(clips.walk,t),clips.run,{duration:Infinity}),/duração/);
const drifting=structuredClone(clips.idle);drifting.cycleDelta=[.001,0,0];drifting.root=drifting.times.map(t=>[.001*t/drifting.duration,0,0]);
assert.equal(runtime.inspectLoop(drifting,context.solve).status,'needs-adjustment','Drift de um apoio cobrindo o ciclo inteiro passou despercebido');
const loops=Object.fromEntries(Object.entries(clips).map(([key,c])=>[key,c.metadata.loopQuality]));
console.log(JSON.stringify({transitions:'PASS',loops,cases:reports.length,maxContactSlip:Math.max(...reports.flatMap(r=>[r.quality.maxContactSlip,r.interrupted.maxContactSlip])),maxRootVelocityError:Math.max(...reports.flatMap(r=>Object.values(r.rootVelocityError)))}));
if(process.argv.includes('--write')){
 const folder=path.join(root,'tools/movalab/workspace/exports'),indexFile=path.join(folder,'../clips.json'),index=JSON.parse(fs.readFileSync(indexFile,'utf8'));
 for(const [key,filename]of [['run','mixamo-run.aruan-clip.v1.json'],['idle','mixamo-idle.aruan-clip.v1.json']]){
  const value=clips[key],text=JSON.stringify(value),entry={id:createHash('sha256').update(text).digest('hex'),name:value.name,duration:value.duration,profile:value.profile,filename,sourceSha256:value.metadata.sourceSha256};
  fs.writeFileSync(path.join(folder,filename),text+'\n');const at=index.clips.findIndex(c=>c.filename===filename);if(at<0)index.clips.push(entry);else index.clips[at]=entry;
 }
 fs.writeFileSync(indexFile,JSON.stringify(index,null,2)+'\n');fs.writeFileSync(path.join(root,'tools/movalab/docs/clip-transitions-report.json'),JSON.stringify({schemaVersion:1,loops,reports},null,2)+'\n');
}
