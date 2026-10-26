'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {createMixamoLibrary,safeRelative,digest}=require('../service/mixamo-library.cjs');
const {hints}=require('../service/mixamo-taxonomy.cjs');
async function main(){
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'aruan-mixamo-library-'));
 try{
  for(const p of ['../secret.fbx','C:/secret.fbx','C:secret.fbx','animation_motion/../secret.fbx','animation_motion\\Walking.fbx','animation_motion/Walking.fbx/extra','animation_motion//Walking.fbx','metadata/raw/token.txt'])assert.throws(()=>safeRelative(p));
  assert.equal(hints('Great_Sword_High_Spin_Attack.fbx','Great Sword High Spin Attack From Run').category,'Ataques','Ancillary run description must not override the named attack');
  assert.equal(hints('Hard_Landing.fbx').category,'Saltos');
  const absent=await createMixamoLibrary(temp).catalog();assert.equal(absent.enabled,false);
  await fs.mkdir(path.join(temp,'metadata/raw'),{recursive:true});await fs.mkdir(path.join(temp,'animation_motion'));await fs.mkdir(path.join(temp,'character_refined'));
  const fixtures=[['animation_motion/Running.fbx','run-roll'],['animation_motion/Hard_Landing.fbx','landing'],['character_refined/Y_Bot.fbx','character']];
  const files=[];for(const [relative,data]of fixtures){await fs.writeFile(path.join(temp,relative),data);files.push({path:relative,size:Buffer.byteLength(data),sha256:digest(data),kind:relative.startsWith('animation')?'animation':'character'});}
  const inventory={dataset:'Linzhan/Mixamo-Animations-Characters',revision:'7f134bc734557b1d9516cb476d25ea1f577e45c1',files};
  await fs.writeFile(path.join(temp,'metadata/inventory.json'),JSON.stringify(inventory));
  await fs.writeFile(path.join(temp,'metadata/raw/animation_motion_prompts.json'),JSON.stringify({'Running.fbx':{description:'Action Move Running And Rolling'},'Hard_Landing.fbx':{description:'Hard landing after a jump'}}));
  await fs.writeFile(path.join(temp,'metadata/raw/animation_motion_frames.json'),JSON.stringify({'Running.fbx':77,'Hard_Landing.fbx':61}));
  const library=createMixamoLibrary(temp),catalog=await library.catalog();assert.equal(catalog.motions.length,2);assert.equal(catalog.assets.length,1);
  const running=catalog.motions.find(m=>m.filename==='Running.fbx');assert.equal(running.pipeline.state,'source-present');assert.equal(running.pipeline.converted,false);assert.equal(running.pipeline.visuallyApproved,false);assert.equal(running.compatibility.verified,false);assert.equal(running.fps,null);assert.equal(running.durationEstimated,true);assert.equal(running.provenance.integrityCheckedAt,null);
  assert.ok(running.tags.includes('rolamento')||running.tags.includes('Esquiva'));
  assert.equal((await library.search('rolamento'))[0].id,running.id);assert.equal((await library.search('pouso'))[0].filename,'Hard_Landing.fbx');assert.equal((await library.search('rolling'))[0].id,running.id);
  assert.equal((await library.search('',{state:'converted'})).length,0);assert.equal((await library.search('',{favorites:true})).length,0);
  assert.equal((await library.verify(running.id)).buffer.toString(),'run-roll');await assert.rejects(()=>library.raw('mixamo:character_refined/Not_Selected.fbx'),/inventário/);
  await fs.writeFile(path.join(temp,'animation_motion/Running.fbx'),'run-bad!');await assert.rejects(()=>library.verify(running.id),/SHA-256/);
  await fs.unlink(path.join(temp,'animation_motion/Running.fbx'));const refreshed=await library.catalog({refresh:true}),missing=refreshed.motions.find(m=>m.id===running.id);assert.equal(missing.pipeline.state,'catalogued');assert.equal(missing.available,false);
  assert.equal((await createMixamoLibrary(temp).catalog()).motions.find(m=>m.filename==='Running.fbx').id,running.id,'IDs survive missing source/reload');
  console.log('Mixamo external catalogue PASS: bilingual search, honest states, stable IDs, integrity and source allowlist.');
 }finally{assert.equal(path.dirname(path.resolve(temp)),path.resolve(os.tmpdir()));assert.ok(path.basename(temp).startsWith('aruan-mixamo-library-'));await fs.rm(temp,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
