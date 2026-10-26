// Offline, single-clip preparation. Existing sources only; no download/install.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {gunzipSync} from 'node:zlib';
import * as T from '../app/node_modules/three/build/three.module.js';
import {CompatibleFBXLoader} from '../app/fbx-loader.js';
import {convertMotion} from '../app/converter.js';
import {createAruanProxy} from '../app/aruan-proxy.js';
import {captureRest,restoreRest,HumanoidRetarget} from '../app/humanoid.js';
const require=createRequire(import.meta.url),{createMixamoLibrary,digest}=require('../service/mixamo-library.cjs'),{createCache,versions,keyFor,conversionComponents}=require('../service/mixamo-cache.cjs');
const contractTools=require('../src/mixamorig-contract.cjs'),runtime=require('../../../js/clip-player.js');
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const dispose=root=>root?.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])m.dispose();});
export async function prepareMotion(root,identifier,{loop=false,reuseOnly=false}={}){
 if(typeof loop!=='boolean'||typeof reuseOnly!=='boolean')throw Error('Opção de preparo deve ser booleana');
 const started=performance.now(),cpu=process.cpuUsage(),library=createMixamoLibrary(root),catalog=await library.catalog();
 const motion=catalog.motions.find(m=>m.id===identifier||m.filename===identifier);if(!motion)throw Error('Movimento não encontrado no inventário seletivo');
 const version=await versions(),options={loop},key=keyFor(motion,version,options),cache=createCache(root),existing=await cache.lookup(key);
 if(existing)return {cacheHit:true,motionId:motion.id,key,meta:existing.meta,elapsedMs:performance.now()-started};
 const release=await cache.lock();let source,proxy,mixer;
 try{
  const raced=await cache.lookup(key);if(raced)return {cacheHit:true,motionId:motion.id,key,meta:raced.meta,elapsedMs:performance.now()-started};
  await cache.guard(32*1024*1024);
  const verified=await library.verify(motion.id),canonical=JSON.parse(fs.readFileSync(path.join(project,'tools/movalab/docs/mixamorig65.v1.json'))),boneMetadata=JSON.parse(fs.readFileSync(path.join(root,'metadata/raw/animation_bones.json')));
  const extracted=contractTools.extractContract(verified.file,boneMetadata,{dataset:catalog.dataset,revision:catalog.revision}),topology=contractTools.auditTopology(extracted.bones,canonical);
  if(!topology.compatible)throw Error('Topologia Mixamorig incompatível: '+JSON.stringify(topology));
  const input=verified.buffer;source=new CompatibleFBXLoader().parse(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),'');const sourceRest=captureRest(source);
  const context=vm.createContext({console,Math});vm.runInContext(['math.js','rig.js','clip-player.js','humanoid-rig.js'].map(n=>fs.readFileSync(path.join(project,'js',n),'utf8')).join('\n'),context);
  let clip,pilotPath=null,reuseOrigin=null;
  const matchesComponent=(name,hash)=>Object.hasOwn(version,name)&&(hash===version[name]||hash===digest(fs.readFileSync(path.join(project,name))));
  if(!loop){
   const reportFile=path.join(project,'tools/movalab/docs/hierarchy-pilot-report.json');
   if(fs.existsSync(reportFile)){
    const report=JSON.parse(fs.readFileSync(reportFile)),candidate=report.results?.find(r=>r.sha256===motion.sha256);
    if(report.revision===catalog.revision&&candidate&&Object.entries(report.components||{}).every(([name,hash])=>matchesComponent(name,hash))&&/^cache\/hierarchy-pilot\/[a-f0-9]{64}\.json\.gz$/.test(candidate.cacheFile)){
     try{const file=path.join(root,candidate.cacheFile),base=fs.realpathSync(path.join(root,'cache')),resolved=fs.realpathSync(file);
      if(!resolved.startsWith(base+path.sep))throw Error('Piloto fora da raiz de cache');
      clip=runtime.parse(gunzipSync(fs.readFileSync(resolved),{maxOutputLength:16*1024*1024}).toString('utf8'));pilotPath=candidate.cacheFile.replace(/^cache\//,'');reuseOrigin='pilot-revalidated';
     }catch(e){if(e.code!=='ENOENT')throw e;}
    }
   }
  }
  // Validator/solver changes get a new key and fresh numeric validation. Reuse
  // data only if every actual conversion input matches; no duplicate gzip.
  if(!clip&&!loop)for(const name of fs.readdirSync(cache.directory)){
   if(!/^[a-f0-9]{64}\.meta\.json$/.test(name)||fs.lstatSync(path.join(cache.directory,name)).isSymbolicLink())continue;
   if(fs.statSync(path.join(cache.directory,name)).size>1024*1024)continue;let previous;
   try{previous=JSON.parse(fs.readFileSync(path.join(cache.directory,name)));}catch{continue;}
   if(previous.sourceSha256!==motion.sha256||previous.options?.loop!==false||!conversionComponents.every(n=>matchesComponent(n,previous.version?.[n])))continue;
   const artifact=await cache.lookup(previous.key);if(!artifact)continue;clip=artifact.clip;pilotPath=previous.artifactPath||'processed/'+previous.key+'.json.gz';reuseOrigin='cache-revalidated';break;
  }
  if(!clip&&reuseOnly)throw Error('Artefato compatível ausente; reconversão explícita necessária');
  if(!clip){clip=await convertMotion(source,motion,{loop});clip.metadata.canvasRig='hierarchy';clip.metadata.rigContract='mixamorig65.v1';}
  if(clip.metadata?.sourceSha256!==motion.sha256||clip.metadata?.canvasRig!=='hierarchy')throw Error('Proveniência do clipe preparado divergente');
  if(pilotPath&&(Math.abs(clip.duration-source.animations[0].duration)>1e-5||clip.metadata?.trim?.start!==0))throw Error('Artefato recortado não corresponde ao preparo integral solicitado');
  const quality=context.AruanHumanoid.inspect(clip),loopQuality=context.AruanHumanoid.inspectLoop(clip);
  proxy=createAruanProxy();const target=captureRest(proxy),retarget=new HumanoidRetarget(source,proxy);restoreRest(sourceRest);
  mixer=new T.AnimationMixer(source);const action=mixer.clipAction(source.animations[0]);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();let maxRawFKError=0;
  for(let i=0;i<24;i++){
   const ratio=i/23,time=clip.duration*ratio;action.enabled=true;action.paused=false;mixer.setTime(source.animations[0].duration*ratio);retarget.apply();
   const hip=target.byName.get('hips').bone.getWorldPosition(new T.Vector3()),raw=context.AruanHumanoid.solve(clip,time,[0,0,0],0,{loop:false});
   for(const e of target.bones){const p=e.bone.getWorldPosition(new T.Vector3()),a=raw.humanoid.joints[e.bone.name].position;maxRawFKError=Math.max(maxRawFKError,Math.hypot(p.z-hip.z-a[0],p.x-hip.x-a[1],p.y-a[2]));}
  }
  const technicallyValidated=quality.status==='numeric-pass'&&loopQuality.status!=='needs-adjustment'&&maxRawFKError<.005;
  if(!pilotPath)clip.metadata.hierarchyQuality=quality;
  const used=process.cpuUsage(cpu),details={motionId:motion.id,sourceSha256:motion.sha256,dataset:catalog.dataset,revision:catalog.revision,version,options,sourceConverter:clip.metadata.converter,hashPolicy:'text-components-LF',origin:reuseOrigin||'offline-converted',
   validation:{topology,quality,loopQuality,maxRawFKError,paritySamples:24,technicallyValidated},duration:clip.duration,samples:clip.times.length,contacts:clip.contacts,events:clip.events,canvasPreviewAvailable:true,
   elapsedMs:performance.now()-started,cpuUserMs:used.user/1000,cpuSystemMs:used.system/1000,observedRSS:process.memoryUsage().rss};
  const meta=pilotPath?await cache.adopt(key,pilotPath,details):await cache.publish(key,clip,details);
  return {cacheHit:false,reusedPilot:reuseOrigin==='pilot-revalidated',reusedArtifact:Boolean(pilotPath),motionId:motion.id,key,meta,elapsedMs:performance.now()-started};
 }finally{mixer?.stopAllAction();if(mixer&&source)mixer.uncacheRoot(source);dispose(proxy);dispose(source);await release();}
}
if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url)){
 const [root,identifier,loop]=process.argv.slice(2);
 prepareMotion(root,identifier,{loop:loop==='true'}).then(result=>console.log(JSON.stringify(result))).catch(e=>{console.error(JSON.stringify({error:e.message}));process.exitCode=1;});
}
