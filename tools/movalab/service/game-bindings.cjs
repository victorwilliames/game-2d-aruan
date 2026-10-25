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
  const isAction=input.slot==='action';
  const binding={slot:input.slot,key:isAction?input.key:null,pad:isAction?(input.pad||null):null,filename:entry.filename,name:clip.name};schema.validate({version:1,bindings:[binding]});
  const conflicts=config.bindings.filter(b=>b.slot===binding.slot&&(b.slot!=='action'||b.key===binding.key||binding.pad&&b.pad===binding.pad)||binding.key&&b.key===binding.key||binding.pad&&b.pad===binding.pad);
  const hasNativeDodge=(binding.key==='Space'&&!config.bindings.some(b=>b.key==='Space'))||(binding.pad==='PadB'&&!config.bindings.some(b=>b.pad==='PadB'));
  const mode=input.resolution||(input.replace===true?'replace':null);
  if((conflicts.length||hasNativeDodge||schema.reserved[binding.key]&&binding.key!=='Space')&&!mode)throw Object.assign(Error('Conflito: '+(conflicts.map(b=>b.name).join(', ')||schema.reserved[binding.key]||schema.padReserved?.[binding.pad])+'. Troque o gatilho ou confirme a resolução.'),{status:409});
  if(schema.reserved[binding.key]&&binding.key!=='Space')throw Error('Tecla reservada do sistema');
  const old=conflicts[0];
  config.bindings=config.bindings.filter(b=>!conflicts.includes(b));
  if(mode==='relocate'){
   const rSlot=input.relocateSlot||'action',rKey=rSlot==='action'?input.relocateKey:null,rPad=rSlot==='action'?(input.relocatePad||null):null;
   if(rSlot===binding.slot&&(rSlot!=='action'||rKey===binding.key||rPad&&rPad===binding.pad)||rKey&&rKey===binding.key||rPad&&rPad===binding.pad)throw Error('Escolha outro destino para realocar a animação anterior');
   config.bindings=config.bindings.filter(b=>!(b.slot===rSlot&&(b.slot!=='action'||b.key===rKey||rPad&&b.pad===rPad)||rKey&&b.key===rKey||rPad&&b.pad===rPad));
   if(old)config.bindings.push({slot:rSlot,key:rKey,pad:rPad,filename:old.filename,name:old.name});
   else if(hasNativeDodge){if(rSlot!=='action')throw Error('Cambalhota nativa precisa ser realocada para um botão/tecla de ação');config.bindings.push({slot:'native-dodge',key:rKey,pad:rPad,filename:'',name:'Cambalhota'});}
  }
  config.bindings.push(binding);schema.validate(config);
  const tmp=file+'.tmp-'+process.pid;await fs.writeFile(tmp,JSON.stringify(config,null,2)+'\n');await fs.rename(tmp,file);return config;
 }return {read,apply};
};
