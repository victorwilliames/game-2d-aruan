'use strict';
/* Regression of local MovaLab server and persistent library; optional real FBX. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
async function main(){
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'movalab-test-'));
 const port=21000+Math.floor(Math.random()*24000);
 const root='http://127.0.0.1:'+port;
 let proc,logs='';
 const start=async()=>{
  proc=spawn(process.execPath,[path.resolve(__dirname,'../service/server.cjs')],{
   env:{...process.env,MOVALAB_WORKSPACE:temp,MOVALAB_PORT:String(port)},stdio:['ignore','pipe','pipe']
  });
  proc.stdout.on('data',x=>logs+=x.toString());
  proc.stderr.on('data',x=>logs+=x.toString());
  for(let i=0;i<80;i++){
   if(proc.exitCode!==null)throw new Error('server exited: '+logs);
   try{const r=await fetch(root+'/api/health');if(r.ok)return;}catch{}
   await delay(70);
  }
  throw new Error('server did not start: '+logs);
 };
 const stop=async()=>{
  if(!proc)return;
  if(proc.exitCode!==null)return;
  await new Promise(resolve=>{proc.once('exit',resolve);proc.kill('SIGTERM');setTimeout(()=>{proc.kill('SIGKILL');resolve();},1500).unref();});
 };
 try{
  await start();
  const health=await fetch(root+'/api/health');
  assert.equal((await health.json()).ok,true);
  const first=await fetch(root+'/api/motions');
  assert.deepEqual((await first.json()).motions,[]);
  for(const asset of ['','styles.css','main.js']){
   const r=await fetch(root+'/'+asset);assert.equal(r.status,200,asset);
   const text=await r.text();assert.ok(text.length>200,asset);
  }
  const missing=await fetch(root+'/api/motions/0123456789abcdef/clip');assert.equal(missing.status,404);
  const unsupported=await fetch(root+'/api/import?filename=invalid.fbx',{method:'POST',body:Buffer.from('bad FBX')});
  assert.equal(unsupported.status,400);
  const traversal=await fetch(root+'/..%2f..%2fREADME.md');assert.equal(traversal.status,404);
  const source=process.env.MOVALAB_TEST_FBX;
  if(source){
   const raw=await fs.readFile(source);
   const upload=()=>fetch(root+'/api/import?filename=Walking.fbx&source=Mixamo',{method:'POST',body:raw,headers:{'Content-Type':'application/octet-stream'}});
   const one=await upload();assert.equal(one.status,201,await one.text().catch(()=>'')); // response body consumed only if failure
   const two=await upload();assert.equal(two.status,200);
   const again=await two.json();assert.equal(again.duplicate,true);
   const id=again.motion.id;
   const library=await (await fetch(root+'/api/motions')).json();
   assert.equal(library.motions.length,1);
   const played=await (await fetch(root+'/api/motions/'+id+'/clip')).json();
   assert.equal(played.bones.length,65);assert.equal(played.frames.length,32);
   assert.ok(played.duration>.9&&played.duration<1.2);
   assert.ok(played.frames.every(f=>Number.isFinite(f.joints.Hips?.[1])));
   const changed=await fetch(root+'/api/motions/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'approved',license:'Test local only'})});
   assert.equal(changed.status,200);
   await stop();await start();
   const persisted=await (await fetch(root+'/api/motions')).json();
   assert.equal(persisted.motions.length,1);
   assert.equal(persisted.motions[0].status,'approved');
   assert.equal(persisted.motions[0].license,'Test local only');
   const saved=await fs.readFile(path.join(temp,'sources',again.motion.sha256+'.fbx'));
   assert.deepEqual(saved,raw);
   console.log('MovaLab real FBX integration OK: 65 bones / 32 frames / persistent library / duplicate detection');
  }else console.log('MovaLab server smoke OK. Set MOVALAB_TEST_FBX for real FBX import/player/persistence integration.');
 }finally{
  await stop();
  await fs.rm(temp,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('MovaLab tests FAIL:',e);process.exitCode=1;});
