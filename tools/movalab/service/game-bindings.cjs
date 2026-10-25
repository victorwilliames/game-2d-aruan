'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const schema=require('../../../js/movalab-bindings.js');
module.exports=function(workspace,runtime){
 const file=path.join(workspace,'game-bindings.json');
 async function read(){try{return schema.validate(JSON.parse(await fs.readFile(file,'utf8')));}catch(e){if(e.code==='ENOENT')return {version:1,bindings:[]};throw e;}}
 async function apply(input){
  const config=await read();
  if(input.clear===true){await fs.writeFile(file,JSON.stringify({version:1,bindings:[]},null,2)+'\n');return {version:1,bindings:[]};}
  if(!/^[a-f0-9]{64}$/.test(input.clipId||''))throw Error('Salve o clipe antes de aplicar');
  const index=JSON.parse(await fs.readFile(path.join(workspace,'clips.json'),'utf8')),entry=index.clips.find(e=>e.id===input.clipId);
  if(!entry||!/^[-a-zA-Z0-9]+\.aruan-clip\.v1\.json$/.test(entry.filename))throw Error('Clipe salvo não encontrado');
  const folder=await fs.realpath(path.join(workspace,'exports')),real=await fs.realpath(path.join(folder,entry.filename));if(!real.startsWith(folder+path.sep))throw Error('Clipe fora da biblioteca');
  const clip=runtime.parse(await fs.readFile(real,'utf8'));
  if(crypto.createHash('sha256').update(JSON.stringify(clip)).digest('hex')!==entry.id)throw Error('Hash do clipe não confere');
  const binding={slot:input.slot,key:input.slot==='action'?input.key:null,filename:entry.filename,name:clip.name};schema.validate({version:1,bindings:[binding]});
  const conflicts=config.bindings.filter(b=>b.slot===binding.slot&&(b.slot!=='action'||b.key===binding.key)||binding.key&&b.key===binding.key);
  if((conflicts.length||schema.reserved[binding.key])&&input.replace!==true)throw Object.assign(Error('Conflito: '+(schema.reserved[binding.key]||conflicts.map(b=>b.name).join(', '))+'. Troque o gatilho ou confirme a substituição.'),{status:409});
  config.bindings=config.bindings.filter(b=>!conflicts.includes(b));config.bindings.push(binding);schema.validate(config);
  const tmp=file+'.tmp-'+process.pid;await fs.writeFile(tmp,JSON.stringify(config,null,2)+'\n');await fs.rename(tmp,file);return config;
 }return {read,apply};
};
