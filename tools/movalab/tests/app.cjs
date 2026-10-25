'use strict';
/* Regression of local MovaLab server and persistent library; optional real FBX. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
// Small, generated FBX 7700 fixture: fully legal to commit, no third-party assets.
// Tests real import/persistence even when the user's Walking.fbx is not available in CI.
function tinyFbx(boneName='Hips'){
 function str(s){const b=Buffer.from(s);const p=Buffer.alloc(5);p.write('S',0);p.writeUInt32LE(b.length,1);return Buffer.concat([p,b]);}
 function int64(n){const b=Buffer.alloc(9);b.write('L');b.writeBigInt64LE(BigInt(n),1);return b;}
 function array(kind,arr){
  const unit=kind==='l'?8:4,values=Buffer.alloc(arr.length*unit);
  arr.forEach((n,i)=>kind==='l'?values.writeBigInt64LE(BigInt(n),i*unit):values.writeFloatLE(n,i*unit));
  const h=Buffer.alloc(13);h.write(kind,0);h.writeUInt32LE(arr.length,1);h.writeUInt32LE(0,5);h.writeUInt32LE(values.length,9);
  return Buffer.concat([h,values]);
 }
 const node=(name,props=[],children=[])=>({name,props,children});
 function write(n,start){
  const name=Buffer.from(n.name),props=Buffer.concat(n.props.map(p=>{
    if(typeof p==='string')return str(p);
    if(typeof p==='number'||typeof p==='bigint')return int64(p);
    return array(p.kind,p.values);
  }));
  const headerSize=25+name.length;
  const children=[];let at=start+headerSize+props.length;
  for(const child of n.children){const buf=write(child,at);children.push(buf);at+=buf.length;}
  if(n.children.length){children.push(Buffer.alloc(25));at+=25;}
  const h=Buffer.alloc(25);
  h.writeBigUInt64LE(BigInt(at),0);
  h.writeBigUInt64LE(BigInt(n.props.length),8);
  h.writeBigUInt64LE(BigInt(props.length),16);
  h.writeUInt8(name.length,24);
  return Buffer.concat([h,name,props,...children]);
 }
 const objects=node('Objects',[],[
   node('Model',[1n,boneName,'LimbNode']),
   node('AnimationCurveNode',[2n,'T','']),
   node('AnimationCurve',[3n,'TX',''],[
    node('KeyTime',[{kind:'l',values:[0n,46186158000n]}]),
    node('KeyValueFloat',[{kind:'f',values:[0,8]}])
   ])
 ]);
 const links=node('Connections',[],[
  node('C',['OP',2n,1n,'Lcl Translation']),
  node('C',['OP',3n,2n,'d|X'])
 ]);
 const header=Buffer.alloc(27);Buffer.from('Kaydara FBX Binary  \x00\x1a\x00','binary').copy(header);header.writeUInt32LE(7700,23);
 const one=write(objects,27),two=write(links,27+one.length);
 return Buffer.concat([header,one,two,Buffer.alloc(25)]);
}
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
  {
   const raw=source?await fs.readFile(source):tinyFbx();
   const upload=()=>fetch(root+'/api/import?filename=Walking.fbx&source=Mixamo',{method:'POST',body:raw,headers:{'Content-Type':'application/octet-stream'}});
   const one=await upload();assert.equal(one.status,201,await one.text().catch(()=>'')); // response body consumed only if failure
   const two=await upload();assert.equal(two.status,200);
   const again=await two.json();assert.equal(again.duplicate,true);
   const id=again.motion.id;
   const library=await (await fetch(root+'/api/motions')).json();
   assert.equal(library.motions.length,1);
   const played=await (await fetch(root+'/api/motions/'+id+'/clip')).json();
   assert.equal(played.bones.length,source?65:1);assert.equal(played.frames.length,source?32:2);
   assert.ok(played.duration>.9&&played.duration<1.2);
   assert.ok(played.frames.every(f=>Number.isFinite(f.joints.Hips?.[1])));
   const changed=await fetch(root+'/api/motions/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'approved',license:'Test local only'})});

   assert.equal(changed.status,200);
   // O pack já versionado deve entrar na biblioteca SEM copiar/duplicar bytes.
   const pack=path.join(temp,'sources','MixamoOriginalsPack','Animations');
   await fs.mkdir(pack,{recursive:true});
   const secondBytes=tinyFbx('Spine');
   await fs.writeFile(path.join(pack,'Second Walking.fbx'),secondBytes);
   const detected=await (await fetch(root+'/api/assets')).json();
   assert.ok(detected.assets.some(a=>a.path.endsWith('Second Walking.fbx')&&a.supported));
   const sync=await fetch(root+'/api/library/sync',{method:'POST'});
   assert.equal(sync.status,200);
   const result=await sync.json();
   assert.equal(result.added,1,JSON.stringify(result));
   const listed=await (await fetch(root+'/api/motions')).json();
   assert.equal(listed.motions.length,2);
   const indexed=listed.motions.find(m=>m.relativeSource?.includes('Second Walking.fbx'));
   assert.ok(indexed);
   const rawSource=await fetch(root+'/api/motions/'+indexed.id+'/raw');
   assert.deepEqual(Buffer.from(await rawSource.arrayBuffer()),secondBytes);
   const rawAsset=await fetch(root+'/api/assets/raw?path='+encodeURIComponent(indexed.relativeSource));
   assert.deepEqual(Buffer.from(await rawAsset.arrayBuffer()),secondBytes);
   const repeat=await (await fetch(root+'/api/library/sync',{method:'POST'})).json();
   assert.equal(repeat.added,0);
   await stop();await start();
   const persisted=await (await fetch(root+'/api/motions')).json();
   assert.equal(persisted.motions.length,2);
   assert.equal(persisted.motions[0].status,'approved');
   assert.equal(persisted.motions[0].license,'Test local only');
   const saved=await fs.readFile(path.join(temp,'sources',again.motion.sha256+'.fbx'));
   assert.deepEqual(saved,raw);
   console.log('MovaLab FBX integration OK: '+played.bones.length+' bones / '+played.frames.length+' frames / persistent library / duplicate detection'+(source?' (real Walking.fbx)':' (synthetic fixture)'));
  }
 }finally{
  await stop();
  await fs.rm(temp,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('MovaLab tests FAIL:',e);process.exitCode=1;});
