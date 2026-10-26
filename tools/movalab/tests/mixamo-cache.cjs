'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {createCache,keyFor,versions,componentHash}=require('../service/mixamo-cache.cjs');
async function main(){
 const parent=path.resolve(__dirname,'../../mixamo/temp');await fs.mkdir(parent,{recursive:true});const temp=await fs.mkdtemp(path.join(parent,'aruan-mixamo-cache-'));
 try{
  assert.equal(componentHash(Buffer.from('code\r\nnext\r\n')),componentHash(Buffer.from('code\nnext\n')),'Windows checkout line endings must not invalidate unchanged code');
  const cache=createCache(temp),version=await versions(),motion={sha256:'a'.repeat(64)},key=keyFor(motion,version);
  assert.notEqual(key,keyFor(motion,{...version,converter:'changed'}));assert.notEqual(key,keyFor({...motion,sha256:'b'.repeat(64)},version));assert.notEqual(key,keyFor(motion,version,{loop:true}));
  const clip=JSON.parse(await fs.readFile(path.resolve(__dirname,'../workspace/exports/mixamo-walking.aruan-clip.v1.json')));clip.metadata.sourceSha256=motion.sha256;
  assert.equal(await cache.lookup(key),null);await assert.rejects(()=>cache.lookup('../secret'),/Chave/);await assert.rejects(()=>cache.guard(-1),/inválida/);await assert.rejects(()=>cache.guard(10_000_000_000),/teto10GB/);
  const release=await cache.lock();await assert.rejects(()=>cache.lock(),/Outro preparo/);
  const meta=await cache.publish(key,clip,{version,quality:{status:'numeric-pass'},visuallyApproved:true,gameplayIntegrated:true});await release();
  assert.equal(meta.visuallyApproved,false);assert.equal(meta.gameplayIntegrated,false);const read=await cache.lookup(key);assert.deepEqual(read.clip,clip);assert.ok(read.meta.gzipBytes<read.meta.jsonBytes);
  // Interrupted metadata publication may reuse identical gzip without rewriting it.
  const gzip=path.join(cache.directory,key+'.json.gz'),before=await fs.stat(gzip);await fs.unlink(path.join(cache.directory,key+'.meta.json'));
  await cache.publish(key,clip,{version,quality:{status:'numeric-pass'}});assert.equal((await fs.stat(gzip)).mtimeMs,before.mtimeMs);assert.deepEqual((await cache.lookup(key)).clip,clip);
  const pilot=path.join(temp,'cache/hierarchy-pilot');await fs.mkdir(pilot);const pilotName='c'.repeat(64)+'.json.gz';await fs.link(gzip,path.join(pilot,pilotName));
  const adoptedKey=keyFor(motion,{...version,validation:'current'}),adopted=await cache.adopt(adoptedKey,'hierarchy-pilot/'+pilotName,{sourceSha256:motion.sha256,version,quality:{status:'numeric-pass'}});
  assert.equal(adopted.origin,'pilot-revalidated');assert.deepEqual((await cache.lookup(adoptedKey)).clip,clip);await assert.rejects(()=>fs.stat(path.join(cache.directory,adoptedKey+'.json.gz')),/ENOENT/,'Adoption must reuse the pilot bytes');
  await assert.rejects(()=>cache.adopt('d'.repeat(64),'../secret.gz',{sourceSha256:motion.sha256}),/Referência/);
  await fs.writeFile(gzip,'corrupt');await assert.rejects(()=>cache.lookup(key),/Hash gzip/);
  console.log('Mixamo cache PASS: version invalidation, lossless gzip, hashes, orphan recovery, live lock, budget and no invented approval.');
 }finally{assert.equal(path.dirname(path.resolve(temp)),parent);assert.ok(path.basename(temp).startsWith('aruan-mixamo-cache-'));await fs.rm(temp,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
