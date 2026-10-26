'use strict';
// Generated source bytes exercise routing/persistence, not FBX/retarget quality.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {digest}=require('../service/mixamo-library.cjs');
async function main(){
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'aruan-mixamo-api-'));let server;
 try{
  const data=path.join(temp,'data'),workspace=path.join(temp,'workspace');await fs.mkdir(path.join(data,'metadata/raw'),{recursive:true});await fs.mkdir(path.join(data,'animation_motion'));
  const bytes=Buffer.from('Generated routing fixture'),file='animation_motion/Hard_Landing.fbx';await fs.writeFile(path.join(data,file),bytes);
  const revision='7f134bc734557b1d9516cb476d25ea1f577e45c1';
  await fs.writeFile(path.join(data,'metadata/inventory.json'),JSON.stringify({dataset:'Linzhan/Mixamo-Animations-Characters',revision,files:[{kind:'animation',path:file,size:bytes.length,sha256:digest(bytes)}]}));
  await fs.writeFile(path.join(data,'metadata/raw/animation_motion_prompts.json'),JSON.stringify({'Hard_Landing.fbx':{description:'Hard landing after a fall'}}));
  process.env.MOVALAB_MIXAMO_ROOT=data;process.env.MOVALAB_WORKSPACE=workspace;
  server=require('../service/server.cjs').server;await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  const request=async(route,options)=>{const r=await fetch(base+route,options);return {status:r.status,body:await r.json()};};
  const catalogue=await request('/api/mixamo/catalog?q=pouso');assert.equal(catalogue.status,200);assert.equal(catalogue.body.total,1);assert.equal(catalogue.body.motions.length,1);assert.equal(catalogue.body.counts.converted,0);
  const motion=catalogue.body.motions[0],raw=await fetch(base+'/api/motions/'+motion.id+'/raw');assert.equal(raw.status,200);assert.ok(Buffer.from(await raw.arrayBuffer()).equals(bytes));
  const patch=value=>request('/api/motions/'+motion.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
  assert.equal((await patch({favorite:true,category:'Reações'})).status,200);
  const favorite=(await request('/api/mixamo/catalog?favorites=1')).body.motions[0];assert.equal(favorite.favorite,true);assert.equal(favorite.category,'Reações');assert.equal(favorite.pipeline.visuallyApproved,false);
  assert.equal((await patch({status:'approved'})).status,400,'Form cannot invent visual/technical approval');
  const saved=JSON.parse(await fs.readFile(path.join(workspace,'library.json')));assert.equal(saved.motions.length,0,'External source records are not copied into the workspace library');assert.equal(saved.externalSources.mixamo.overrides[motion.id].favorite,true);
  const merged=(await request('/api/motions')).body;assert.equal(merged.motions.length,1);assert.equal(merged.motions[0].favorite,true);assert.equal(merged.motions[0].sha256,motion.sha256);
  const forbidden=await fetch(base+'/api/assets/raw?path='+encodeURIComponent('mixamo:character_refined/Not_Selected.fbx'));assert.equal(forbidden.status,400);
  assert.equal((await fetch(base+'/api/assets/raw?path='+encodeURIComponent('mixamo:animation_motion/../../secret.fbx'))).status,400);
  assert.equal((await fetch(base+'/api/motions',{headers:{Origin:'https://example.com'}})).status,403);
  assert.equal((await request('/api/motions/'+motion.id+'/clip')).status,409,'Legacy approximate diagnostic cannot certify canonical Canvas');
  console.log('Mixamo API PASS: external raw allowlist, bilingual query, persistent favorites/category, no invented approval or source copy.');
 }finally{if(server?.listening)await new Promise(resolve=>server.close(resolve));assert.equal(path.dirname(path.resolve(temp)),path.resolve(os.tmpdir()));assert.ok(path.basename(temp).startsWith('aruan-mixamo-api-'));await fs.rm(temp,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
