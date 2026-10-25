'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const runtime=require('../../../js/clip-player.js'),schema=require('../../../js/movalab-bindings.js');
(async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'movalab-bindings-'));
 try{
  const clip=JSON.parse(await fs.readFile(path.join(__dirname,'../workspace/exports/mixamo-walking.aruan-clip.v1.json'),'utf8'));
  const id=crypto.createHash('sha256').update(JSON.stringify(clip)).digest('hex'),filename=id+'.aruan-clip.v1.json';
  await fs.mkdir(path.join(temp,'exports'));await fs.writeFile(path.join(temp,'exports',filename),JSON.stringify(clip));await fs.writeFile(path.join(temp,'clips.json'),JSON.stringify({clips:[{id,filename}]}));
  const service=require('../service/game-bindings.cjs')(temp,runtime);
  assert.equal(schema.suggest('Jump Forward').key,'Space');assert.equal(schema.suggest('Running').slot,'run');
  await service.apply({clipId:id,slot:'walk'});assert.equal((await service.read()).bindings.length,1);
  await assert.rejects(()=>service.apply({clipId:id,slot:'walk'}),e=>e.status===409);
  await assert.rejects(()=>service.apply({clipId:id,slot:'action',key:'Space'}),e=>e.status===409);
  await service.apply({clipId:id,slot:'action',key:'Space',replace:true});
  await assert.rejects(()=>service.apply({clipId:id,slot:'action',key:'KeyW',replace:true}));
  assert.equal((await service.read()).bindings.length,2,'Rejeição alterou configuração');
  await fs.writeFile(path.join(temp,'exports',filename),JSON.stringify({...clip,name:'alterado'}));
  await assert.rejects(()=>service.apply({clipId:id,slot:'idle'}),/Hash/);
  assert.throws(()=>schema.validate({version:1,bindings:[{slot:'walk',name:'x',filename:'../x.aruan-clip.v1.json'}]}));
  await service.apply({clear:true});assert.equal((await service.read()).bindings.length,0);
  console.log('PASS: persistência de gatilhos, sugestões, conflitos409, substituição explícita, caminhos/hash e restauraçãoV1.');
 }finally{await fs.rm(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
