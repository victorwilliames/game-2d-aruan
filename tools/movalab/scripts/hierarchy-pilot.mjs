// Bounded offline pilot. Existing source files only; no network or mass conversion.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import * as T from '../app/node_modules/three/build/three.module.js';
import {CompatibleFBXLoader} from '../app/fbx-loader.js';
import {convertMotion} from '../app/converter.js';
import {createAruanProxy} from '../app/aruan-proxy.js';
import {captureRest,restoreRest,HumanoidRetarget} from '../app/humanoid.js';
const require=createRequire(import.meta.url),runtime=require('../../../js/clip-player.js');
const {LIMIT,RESERVE}=require('../../mixamo/scripts/acquire.cjs');
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),data=process.env.MIXAMO_ROOT;
if(!data)throw Error('Set MIXAMO_ROOT to the already acquired dataset; this script never downloads');
const sha=b=>createHash('sha256').update(b).digest('hex');
const codeFiles=['tools/movalab/app/converter.js','tools/movalab/app/humanoid.js','tools/movalab/app/aruan-profile.js','tools/movalab/app/aruan-proxy.js','tools/movalab/docs/mixamorig65.v1.json','js/clip-player.js','js/rig.js','js/humanoid-rig.js'];
const components=Object.fromEntries(codeFiles.map(p=>[p,sha(fs.readFileSync(path.join(project,p)))]));
const inventory=JSON.parse(fs.readFileSync(path.join(data,'metadata/inventory.json'))),context=vm.createContext({console,Math});
const descriptions=JSON.parse(fs.readFileSync(path.join(data,'metadata/raw/animation_motion_prompts.json')));
vm.runInContext(['math.js','rig.js','clip-player.js','humanoid-rig.js'].map(n=>fs.readFileSync(path.join(project,'js',n),'utf8')).join('\n')+'\nglobalThis.full=AruanHumanoid;',context);
const names=['Walking.fbx','Running.fbx','Falling_To_Roll.fbx','Hard_Landing.fbx','Punching.fbx','180_Turn_W_Briefcase.fbx','Standing_Thumbs_Up.fbx'];
const armed=inventory.files.find(e=>e.kind==='animation'&&/Standing_Melee_Attack_Horizontal\.fbx$/.test(e.path))||inventory.files.find(e=>e.kind==='animation'&&/Sword_And_Shield_Slash\.fbx$/.test(e.path));
if(!armed)throw Error('Select a confirmed armed attack for the pilot');names.push(path.basename(armed.path));
const cache=path.join(data,'cache/hierarchy-pilot');fs.mkdirSync(cache,{recursive:true});
const bytes=root=>fs.readdirSync(root,{withFileTypes:true}).reduce((s,e)=>s+(e.isSymbolicLink()?0:e.isDirectory()?bytes(path.join(root,e.name)):fs.statSync(path.join(root,e.name)).size),0);
const free=()=>{const s=fs.statfsSync(data);return Number(s.bavail)*Number(s.bsize);};
const dispose=root=>root.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])m.dispose();});
const report={schema:'hierarchy-pilot.v1',dataset:inventory.dataset,revision:inventory.revision,components,startedAt:new Date().toISOString(),freeBefore:free(),occupiedBefore:bytes(data),results:[]};
let peakRSS=process.memoryUsage().rss;
const pilotClips=[];
for(const name of names){
 const entry=inventory.files.find(e=>e.path==='animation_motion/'+name);if(!entry)throw Error('Source absent from fixed inventory: '+name);
 const input=fs.readFileSync(path.join(data,entry.path));if(sha(input)!==entry.sha256)throw Error('Source hash mismatch: '+name);
 const source=new CompatibleFBXLoader().parse(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),'');
 const sourceRest=captureRest(source),id=sha(JSON.stringify({source:entry.sha256,components,profile:'aruan-humanoid-v2',loop:false})),file=path.join(cache,id+'.json.gz'),start=performance.now(),cpu=process.cpuUsage();let clip,cacheHit=false;
 if(fs.existsSync(file)){clip=runtime.parse(gunzipSync(fs.readFileSync(file)).toString('utf8'));cacheHit=true;}
 else{clip=await convertMotion(source,{name:name.replace(/\.fbx$/i,'').replaceAll('_',' '),filename:name,relativeSource:entry.path,sha256:entry.sha256,status:'source-present'},{loop:false});clip.metadata.canvasRig='hierarchy';clip.metadata.rigContract='mixamorig65.v1';}
 const quality=context.full.inspect(clip),loopQuality=context.full.inspectLoop(clip);clip.metadata.hierarchyQuality=quality;
 const json=Buffer.from(JSON.stringify(clip)),compressed=gzipSync(json,{level:9});if(!gunzipSync(compressed).equals(json))throw Error('Lossy compression roundtrip');
 if(json.length>16*1024*1024)throw Error('Clip exceeds legacy JSON parse limit; compact/chunked format required');
 if(bytes(data)+compressed.length+500_000_000>LIMIT||free()-compressed.length<RESERVE)throw Error('Storage budget prevents pilot cache');
 if(!cacheHit)fs.writeFileSync(file,compressed,{flag:'wx'});
 const proxy=createAruanProxy(),target=captureRest(proxy),retarget=new HumanoidRetarget(source,proxy),mixer=new T.AnimationMixer(source),action=mixer.clipAction(source.animations[0]);restoreRest(sourceRest);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();
 let maxRawFKError=0,worstRawSample=null,maxVisualLift=0,maxPelvisCorrection=0,minUnconstrainedHeadClearance=Infinity;
 for(let i=0;i<48;i++){
  const ratio=i/47,time=clip.duration*ratio;action.paused=false;action.enabled=true;mixer.setTime(source.animations[0].duration*ratio);retarget.apply();
  const hips=target.byName.get('hips').bone.getWorldPosition(new T.Vector3()),raw=context.full.solve(clip,time,[0,0,0],0,{loop:false});
  for(const b of target.bones){const p=b.bone.getWorldPosition(new T.Vector3()),expected=[p.z-hips.z,p.x-hips.x,p.y],actual=raw.humanoid.joints[b.bone.name].position,error=Math.hypot(...expected.map((v,k)=>v-actual[k]));if(error>maxRawFKError){maxRawFKError=error;worstRawSample={bone:b.bone.name,time,expected,actual};}}
  const s=runtime.sample(clip,time,{loop:false}),solved=context.full.solve(clip,time,s.root,0,{loop:false,contacts:true,floorSafe:true});maxVisualLift=Math.max(maxVisualLift,solved.humanoid.floorLift);maxPelvisCorrection=Math.max(maxPelvisCorrection,Math.abs(solved.humanoid.pelvisCorrection));minUnconstrainedHeadClearance=Math.min(minUnconstrainedHeadClearance,raw.head.o[2]-35);
 }
 const sourceKeyGrid={counts:[...new Set(source.animations[0].tracks.map(t=>t.times.length))],nearWorst:Array.from(source.animations[0].tracks[0].times).filter(t=>Math.abs(t-(worstRawSample?.time||0))<.04)};
 mixer.stopAllAction();mixer.uncacheRoot(source);dispose(proxy);dispose(source);peakRSS=Math.max(peakRSS,process.memoryUsage().rss);const used=process.cpuUsage(cpu);
 const result={name,sha256:entry.sha256,sourceBytes:entry.size,id,cacheFile:path.relative(data,file).replaceAll('\\','/'),cacheHit,jsonBytes:json.length,gzipBytes:compressed.length,compressionRoundtripError:0,duration:clip.duration,samples:clip.times.length,quality,loopQuality,maxRawFKError,worstRawSample,maxVisualLift,maxPelvisCorrection,minUnconstrainedHeadClearance,elapsedMs:performance.now()-start,cpuUserMs:used.user/1000,cpuSystemMs:used.system/1000,status:quality.status==='numeric-pass'&&maxRawFKError<.1?'technically-validated':'needs-adjustment',visualApproval:false,gameplayIntegration:false};
 result.sourceKeyGrid=sourceKeyGrid;result.sourceDescription=descriptions[name]?.description||null;pilotClips.push(clip);report.results.push(result);console.log(JSON.stringify({name,status:result.status,gzipBytes:result.gzipBytes,maxRawFKError,footClamp:quality.maxFootClamp,head:quality.minHeadBottom,sourceKeyGrid}));global.gc?.();
}
report.transitions=[];
for(let i=0;i<pilotClips.length;i++){
 const outgoing=pilotClips[i],incoming=pilotClips[(i+1)%pilotClips.length],start=outgoing.duration*.4;
 const transition=context.full.createTransition(t=>context.full.sample(outgoing,start+t),incoming,{duration:.3,startTime:0});
 const distance=(a,b)=>Math.hypot(...a.map((v,k)=>v-b[k]));let maxLengthError=0,maxFootClamp=0,maxContactSlip=0,minHeadClearance=Infinity;
 for(let j=0;j<=48;j++){
  const elapsed=j/120,state=transition.sample(elapsed),r=context.full.solve(incoming,elapsed,state.root,0,{state,contacts:true,floorSafe:true});
  for(const key of ['legL','legR','armL','armR']){const b=r[key];maxLengthError=Math.max(maxLengthError,Math.abs(distance(b.a,b.b)-b.lengths[0]),Math.abs(distance(b.b,b.c)-b.lengths[1]));}
  for(const b of [r.legL,r.legR])maxFootClamp=Math.max(maxFootClamp,distance(b.c,b.target));
  for(const [side,a]of Object.entries(state.contacts))maxContactSlip=Math.max(maxContactSlip,distance(r[side==='L'?'legL':'legR'].c,a.map((v,k)=>v+(k===2?5:0))));
  minHeadClearance=Math.min(minHeadClearance,r.head.o[2]-35);
 }
 report.transitions.push({from:outgoing.name,to:incoming.name,samples:49,maxLengthError,maxFootClamp,maxContactSlip,minHeadClearance,status:maxLengthError<1e-6&&maxFootClamp<1e-5&&maxContactSlip<1e-5&&minHeadClearance>=-1e-6?'numeric-pass':'needs-adjustment'});
}
report.freeAfter=free();report.occupiedAfter=bytes(data);report.peakObservedRSS=peakRSS;report.summary={clips:report.results.length,technicallyValidated:report.results.filter(e=>e.status==='technically-validated').length,needsAdjustment:report.results.filter(e=>e.status!=='technically-validated').length,sourceBytes:report.results.reduce((s,e)=>s+e.sourceBytes,0),jsonBytes:report.results.reduce((s,e)=>s+e.jsonBytes,0),gzipBytes:report.results.reduce((s,e)=>s+e.gzipBytes,0),visualApproved:0,gameplayIntegrated:0};
fs.writeFileSync(path.join(project,'tools/movalab/docs/hierarchy-pilot-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary));
if(report.summary.needsAdjustment||report.transitions.some(t=>t.status!=='numeric-pass'))process.exitCode=1;
