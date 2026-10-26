'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {createCache,versions,keyFor,schema}=require('./mixamo-cache.cjs');
function createPreparation(library){
 const cache=createCache(library.root),jobs=new Map(),waiting=[];let running=null,child=null,closed=false,metadataPromise=null;
 const versionPromise=versions();
 async function metadata(){
  if(metadataPromise)return metadataPromise;
  metadataPromise=(async()=>{
   const result=[],version=await versionPromise;let entries;
   try{await fs.access(cache.directory);await cache.ensure();entries=await fs.readdir(cache.directory,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return result;throw e;}
   for(const e of entries){
    if(!e.isFile()||!/^[a-f0-9]{64}\.meta\.json$/.test(e.name))continue;
    const file=path.join(cache.directory,e.name);if((await fs.stat(file)).size>1024*1024)continue;
    try{
     const m=JSON.parse(await fs.readFile(file,'utf8'));if(m.schema!==schema||m.key+'.meta.json'!==e.name||!/^[a-f0-9]{64}$/.test(m.sourceSha256)||typeof m.options?.loop!=='boolean'||Object.keys(m.options).some(k=>k!=='loop')||keyFor({sha256:m.sourceSha256},version,m.options)!==m.key)continue;
     const artifact=await cache.artifact(m.artifactPath||'processed/'+m.key+'.json.gz'),stat=await fs.stat(artifact);if(stat.size!==m.gzipBytes)continue;
     result.push(m);
    }catch(e){if(e.code!=='ENOENT')console.warn('[Mixamo cache]',e.message);}
   }
   return result;
  })();try{return await metadataPromise;}finally{metadataPromise=null;}
 }
 async function annotate(records){
  const metas=await metadata(),history=new Map(),version=await versionPromise,folder=path.join(library.root,'cache/jobs');let entries=[];
  try{const base=await fs.realpath(path.join(library.root,'cache')),real=await fs.realpath(folder);if(!real.startsWith(base+path.sep))throw Error('Histórico fora da raiz');entries=await fs.readdir(real,{withFileTypes:true});}catch(e){if(e.code!=='ENOENT')throw e;}
  const sourceById=new Map(records.map(m=>[m.id,m]));
  for(const e of entries){if(!e.isFile()||!/^[a-f0-9]{64}\.json$/.test(e.name))continue;try{const file=path.join(folder,e.name);if((await fs.stat(file)).size>65536)continue;const j=JSON.parse(await fs.readFile(file,'utf8')),m=sourceById.get(j.motionId);if(!m||j.id+'.json'!==e.name||j.key!==keyFor(m,version,j.options)||typeof j.requestedAt!=='string')continue;const previous=history.get(m.id);if(!previous||j.requestedAt>previous.requestedAt)history.set(m.id,j);}catch(e){if(e.code!=='ENOENT')console.warn('[Mixamo job]',e.message);}}
  return records.map(m=>{
   const previous=history.get(m.id),lastPreparation=previous?{jobId:previous.id,state:jobs.get(previous.id)?.state||(['queued','running'].includes(previous.state)?'interrupted':previous.state),error:previous.error||null,requestedAt:previous.requestedAt}:null;
   const failed=lastPreparation&&['failed','interrupted'].includes(lastPreparation.state);m={...m,lastPreparation,pipeline:{...m.pipeline,preparationFailed:Boolean(failed)}};
   const prepared=metas.find(p=>p.sourceSha256===m.sha256&&!p.options.loop)||metas.find(p=>p.sourceSha256===m.sha256);
   if(!prepared)return failed?{...m,pipeline:{...m.pipeline,state:'prepare-failed'}}:m;
   const valid=prepared.validation?.technicallyValidated===true,preview=prepared.canvasPreviewAvailable===true;
   return {...m,duration:prepared.duration,durationEstimated:false,preparedSamples:prepared.samples,preparedKey:prepared.key,preparedOptions:prepared.options,
    contacts:prepared.contacts||[],events:prepared.events||[],compatibility:{...m.compatibility,status:prepared.validation?.topology?.compatible?'compatible':'needs-adjustment',verified:Boolean(prepared.validation?.topology?.compatible)},
    pipeline:{...m.pipeline,state:valid?(preview?'canvas-preview':'technically-validated'):'needs-adjustment',converted:true,technicallyValidated:valid,canvasPreviewAvailable:preview,visuallyApproved:false,gameplayIntegrated:false},
    warnings:['Duração medida no clipe preparado; FPS original ainda não certificado.','Aprovação visual e integração ao gameplay pendentes.',...(valid?[]:['Inspeção numérica requer ajuste; consulte o diagnóstico antes de usar.'])],
    preparation:{key:prepared.key,validation:prepared.validation,converter:prepared.sourceConverter,gzipBytes:prepared.gzipBytes,origin:prepared.origin||'offline-converted'}};
  });
 }
 async function prepared(id){const motion=await library.inspect(id);if(!motion)throw Error('Movimento Mixamo não encontrado');const version=await versionPromise,metas=await metadata(),m=metas.find(p=>p.sourceSha256===motion.sha256&&!p.options.loop)||metas.find(p=>p.sourceSha256===motion.sha256);const key=m?.key||keyFor(motion,version);const result=await cache.lookup(key);if(!result)throw Object.assign(Error('Clipe ainda não preparado'),{status:409});return result;}
 async function journal(job){
  await cache.ensure();await cache.guard(8192);const folder=path.join(library.root,'cache/jobs');await fs.mkdir(folder,{recursive:true});
  const base=await fs.realpath(path.join(library.root,'cache')),real=await fs.realpath(folder);if(!real.startsWith(base+path.sep))throw Error('Fila fora da raiz de cache');
  const file=path.join(real,job.id+'.json'),temp=file+'.tmp-'+process.pid+'-'+crypto.randomUUID();
  try{await fs.writeFile(temp,JSON.stringify(job)+'\n',{flag:'wx'});await fs.rename(temp,file);}finally{await fs.unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}
 }
 async function enqueue(id,{loop=false}={}){
  if(closed)throw Error('Fila de preparo encerrada');if(typeof loop!=='boolean')throw Error('Loop inválido');const motion=await library.inspect(id);if(!motion)throw Error('Movimento Mixamo não encontrado');
  const version=await versionPromise,key=keyFor(motion,version,{loop}),ongoing=jobs.get(key);if(ongoing&&['queued','running'].includes(ongoing.state))return ongoing;
  const cached=await cache.lookup(key);if(cached)return {id:key,motionId:id,state:cached.meta.validation.technicallyValidated?'ready':'needs-adjustment',cacheHit:true,key};
  const raced=jobs.get(key);if(raced&&['queued','running'].includes(raced.state))return raced;
  if([...jobs.values()].filter(j=>['queued','running'].includes(j.state)).length>=16)throw Object.assign(Error('Fila cheia; aguarde um preparo concluir'),{status:429});
  const job={id:key,key,motionId:id,options:{loop},state:'queued',requestedAt:new Date().toISOString()};jobs.set(key,job);await journal(job);waiting.push(job);pump();return job;
 }
 function pump(){
  if(running||closed||!waiting.length)return;running=waiting.shift();const job=running;job.state='running';job.startedAt=new Date().toISOString();
  (async()=>{
   try{
    await journal(job);
    if(closed)throw Error('Servidor encerrado antes do preparo; solicite novamente para retomar');
    const worker=path.resolve(__dirname,'../scripts/prepare-mixamo.mjs');let output='',error='';
    const result=await new Promise((resolve,reject)=>{
     child=spawn(process.execPath,[worker,library.root,job.motionId,String(job.options.loop)],{windowsHide:true,stdio:['ignore','pipe','pipe']});
     const owned=child,timer=setTimeout(()=>{owned.kill();reject(Error('Preparo excedeu120s; fontes e cache anterior preservados'));},120000);
     owned.stdout.on('data',b=>{output+=b.toString();if(output.length>2*1024*1024){owned.kill();reject(Error('Saída de preparo excedeu limite'));}});
     owned.stderr.on('data',b=>{error=(error+b.toString()).slice(-8192);});owned.once('error',e=>{clearTimeout(timer);reject(e);});
     owned.once('close',code=>{clearTimeout(timer);if(code!==0)return reject(Error(error||'Preparo falhou'));try{resolve(JSON.parse(output.trim().split('\n').at(-1)));}catch{reject(Error('Resposta inválida do preparo offline'));}});
    });
    if(result.key!==job.key)throw Error('Componentes mudaram durante preparo; reinicie o servidor para atualizar versões');
    job.state=result.meta.validation.technicallyValidated?'ready':'needs-adjustment';job.cacheHit=result.cacheHit;job.reusedPilot=Boolean(result.reusedPilot);job.elapsedMs=result.elapsedMs;job.gzipBytes=result.meta.gzipBytes;
   }catch(e){job.state='failed';job.error=e.message.slice(0,8192);}
   finally{job.finishedAt=new Date().toISOString();try{await journal(job);}catch(e){job.journalError=e.message;}running=null;child=null;pump();}
  })();
 }
 async function job(id){
  if(!/^[a-f0-9]{64}$/.test(id))throw Error('Job inválido');if(jobs.has(id))return jobs.get(id);
  const folder=path.join(library.root,'cache/jobs'),file=path.join(folder,id+'.json');try{const root=await fs.realpath(path.join(library.root,'cache')),real=await fs.realpath(file);if(!real.startsWith(root+path.sep))throw Error('Job fora da raiz');const saved=JSON.parse(await fs.readFile(real,'utf8'));if(saved.id!==id)throw Error('Job divergente');return {...saved,...(['queued','running'].includes(saved.state)?{state:'interrupted',note:'Solicite novamente; artefatos válidos serão reutilizados'}:{})};}catch(e){if(e.code==='ENOENT')return null;throw e;}
 }
 function close(){closed=true;waiting.length=0;child?.kill();}
 return {annotate,prepared,enqueue,job,metadata,close,get busy(){return Boolean(running);}};
}
module.exports={createPreparation};
