'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const {digest}=require('./mixamo-library.cjs'),runtime=require('../../../js/clip-player.js');
const {LIMIT,RESERVE}=require('../../mixamo/scripts/acquire.cjs');
const schema='mixamo-cache.v1',project=path.resolve(__dirname,'../../..');
const components=['tools/movalab/app/converter.js','tools/movalab/app/converter-settings.js','tools/movalab/app/fbx-loader.js','tools/movalab/app/humanoid.js','tools/movalab/app/aruan-profile.js','tools/movalab/app/aruan-proxy.js','tools/movalab/app/package-lock.json','tools/movalab/scripts/prepare-mixamo.mjs','tools/movalab/docs/mixamorig65.v1.json','js/math.js','js/clip-player.js','js/rig.js','js/humanoid-rig.js'];
const componentHash=bytes=>digest(Buffer.from(bytes.toString().replace(/\r\n/g,'\n')));
async function versions(){return Object.fromEntries(await Promise.all(components.map(async p=>[p,componentHash(await fs.readFile(path.join(project,p)))])));}
function keyFor(motion,version,options={loop:false}){return digest(JSON.stringify({schema,source:motion.sha256,rigContract:'mixamorig65.v1',profile:'aruan-humanoid-v2',version,options}));}
async function usedBytes(folder){let total=0;for(const entry of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isSymbolicLink())continue;total+=entry.isDirectory()?await usedBytes(file):(await fs.stat(file)).size;}return total;}
function createCache(root){
 root=path.resolve(root);const directory=path.join(root,'cache/processed');
 async function ensure(){await fs.mkdir(directory,{recursive:true});const base=await fs.realpath(root),real=await fs.realpath(directory);if(!real.startsWith(base+path.sep))throw Error('Cache fora da raiz Mixamo');return real;}
 async function guard(extraBytes){if(!Number.isSafeInteger(extraBytes)||extraBytes<0)throw Error('Reserva de cache inválida');const stat=await fs.statfs(root),free=Number(stat.bavail)*Number(stat.bsize),occupied=await usedBytes(root),margin=500_000_000;
  if(occupied+extraBytes+margin>LIMIT||free-extraBytes<RESERVE)throw Error('Preparo suspenso: teto10GB ou reserva2GB ameaçados');return {occupied,free,margin,extraBytes};}
 async function file(key,suffix){if(!/^[a-f0-9]{64}$/.test(key))throw Error('Chave de cache inválida');const folder=await ensure(),target=path.join(folder,key+suffix);try{if((await fs.lstat(target)).isSymbolicLink()||!(await fs.realpath(target)).startsWith(folder+path.sep))throw Error('Arquivo de cache fora da raiz autorizada');}catch(e){if(e.code!=='ENOENT')throw e;}return target;}
 async function artifact(relative){if(!/^(processed|hierarchy-pilot)\/[a-f0-9]{64}\.json\.gz$/.test(relative))throw Error('Referência de cache inválida');const cacheRoot=await fs.realpath(path.join(root,'cache')),resolved=await fs.realpath(path.join(root,'cache',relative));if(!resolved.startsWith(cacheRoot+path.sep))throw Error('Artefato fora da raiz de cache');return resolved;}
 async function lookup(key){
  const metaFile=await file(key,'.meta.json');let meta;try{meta=JSON.parse(await fs.readFile(metaFile,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw Error('Metadados de cache inválidos: '+key);}
  if(meta.schema!==schema||meta.key!==key||!Number.isSafeInteger(meta.gzipBytes)||meta.gzipBytes<=0||meta.gzipBytes>16*1024*1024||!/^[a-f0-9]{64}$/.test(meta.gzipSha256)||!/^[a-f0-9]{64}$/.test(meta.clipSha256))throw Error('Cache não reconhecido: '+key);
  const compressed=await fs.readFile(await artifact(meta.artifactPath||'processed/'+key+'.json.gz'));if(compressed.length!==meta.gzipBytes||digest(compressed)!==meta.gzipSha256)throw Error('Hash gzip divergente: '+key);
  const json=zlib.gunzipSync(compressed,{maxOutputLength:16*1024*1024});if(digest(json)!==meta.clipSha256)throw Error('Hash JSON divergente: '+key);
  const clip=runtime.parse(json.toString('utf8'));if(clip.metadata?.sourceSha256!==meta.sourceSha256||clip.profile!==meta.profile)throw Error('Fonte/perfil do cache divergente');return {meta,clip};
 }
 async function lock(){
  const lockFile=path.join(await ensure(),'prepare.lock'),owner={schema,pid:process.pid,token:crypto.randomUUID(),createdAt:new Date().toISOString()};
  let handle;
  try{handle=await fs.open(lockFile,'wx');}catch(e){if(e.code!=='EEXIST')throw e;const previous=JSON.parse(await fs.readFile(lockFile,'utf8'));if(previous.schema!==schema||!Number.isSafeInteger(previous.pid)||previous.pid<=0)throw Error('Lock de cache desconhecido; preservado');let alive=true;try{process.kill(previous.pid,0);}catch(error){if(error.code==='ESRCH')alive=false;else throw error;}if(alive)throw Error('Outro preparo Mixamo está em execução');await fs.unlink(lockFile);handle=await fs.open(lockFile,'wx');}
  await handle.writeFile(JSON.stringify(owner));return async()=>{await handle.close();const current=JSON.parse(await fs.readFile(lockFile,'utf8'));if(current.token!==owner.token)throw Error('Propriedade do lock mudou; preservado');await fs.unlink(lockFile);};
 }
 async function publish(key,clip,details){
  runtime.validate(clip);const json=Buffer.from(JSON.stringify(clip));if(json.length>16*1024*1024)throw Error('Clipe excede16MiB; recorte antes de preparar');const compressed=zlib.gzipSync(json,{level:9});if(!zlib.gunzipSync(compressed).equals(json))throw Error('Compressão não preservou JSON');
  const meta={...details,schema,key,profile:clip.profile,sourceSha256:clip.metadata.sourceSha256,jsonBytes:json.length,gzipBytes:compressed.length,clipSha256:digest(json),gzipSha256:digest(compressed),convertedAt:new Date().toISOString(),visuallyApproved:false,gameplayIntegrated:false};
  const encoded=Buffer.from(JSON.stringify(meta,null,2)+'\n'),budget=await guard(compressed.length+encoded.length+4096);meta.budget=budget;
  // Exclusive hardlink publication never overwrites an existing cache or source.
  for(const [suffix,bytes]of [['.json.gz',compressed],['.meta.json',Buffer.from(JSON.stringify(meta,null,2)+'\n')]]){
   const target=await file(key,suffix),temporary=target+'.tmp-'+process.pid+'-'+crypto.randomUUID();
   try{await fs.writeFile(temporary,bytes,{flag:'wx'});try{await fs.link(temporary,target);}catch(e){if(e.code!=='EEXIST')throw e;if(suffix==='.json.gz'&&digest(await fs.readFile(target))===digest(bytes))continue;const existing=await lookup(key);if(existing?.meta.clipSha256===meta.clipSha256)return existing.meta;throw Error('Cache existente divergente; preservado');}}finally{await fs.unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}
  }
  return meta;
 }
 async function adopt(key,artifactPath,details){
  const compressed=await fs.readFile(await artifact(artifactPath));if(compressed.length>16*1024*1024)throw Error('Artefato piloto excede16MiB');
  const json=zlib.gunzipSync(compressed,{maxOutputLength:16*1024*1024}),clip=runtime.parse(json.toString('utf8'));
  if(clip.metadata?.sourceSha256!==details.sourceSha256)throw Error('Piloto pertence a outra fonte');
  const meta={...details,schema,key,artifactPath,profile:clip.profile,jsonBytes:json.length,gzipBytes:compressed.length,clipSha256:digest(json),gzipSha256:digest(compressed),convertedAt:new Date().toISOString(),origin:details.origin||'pilot-revalidated',visuallyApproved:false,gameplayIntegrated:false};
  meta.budget=await guard(Buffer.byteLength(JSON.stringify(meta))+4096);const target=await file(key,'.meta.json'),temporary=target+'.tmp-'+process.pid+'-'+crypto.randomUUID();
  try{await fs.writeFile(temporary,JSON.stringify(meta,null,2)+'\n',{flag:'wx'});await fs.link(temporary,target);}finally{await fs.unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}
  return meta;
 }
 return {root,directory,ensure,guard,artifact,lookup,lock,publish,adopt};
}
module.exports={schema,componentHash,versions,keyFor,usedBytes,createCache};
