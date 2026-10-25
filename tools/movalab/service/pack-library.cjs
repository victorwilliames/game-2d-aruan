'use strict';
// Descobre e cadastra animações existentes no workspace/sources sem duplicar arquivos.
// Dependência zero. O Git decide quais fontes são versionadas no repositório.
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {parseBinaryFbx,extractAnimation,TICKS_PER_SECOND}=require('../src/fbx-binary.cjs');

const MAGIC=Buffer.from('Kaydara FBX Binary  \x00\x1a\x00','binary');
const MAX_MOTION=96*1024*1024;
function classify(relative){
  const x=relative.replace(/\\/g,'/').toLowerCase();
  if(/(^|\/)(characters3d|characters|models|actors)\//.test(x))return 'personagem';
  if(/(^|\/)(animationswithskin|withskin)\//.test(x))return 'animação com malha';
  return 'animação';
}
function safeSource(root,relative){
  if(typeof relative!=='string'||!relative||relative.includes('\0'))throw new Error('Caminho inválido');
  const base=path.resolve(root,'sources');
  const absolute=path.resolve(base,relative);
  if(!absolute.startsWith(base+path.sep))throw new Error('Caminho fora da biblioteca');
  return absolute;
}
async function explore(root){
  const folder=path.resolve(root,'sources');
  const result=[];
  async function visit(dir,depth=0){
    if(depth>12)return;
    let entries;
    try{entries=await fsp.readdir(dir,{withFileTypes:true});}
    catch(e){if(e.code==='ENOENT')return;throw e;}
    entries.sort((a,b)=>a.name.localeCompare(b.name));
    for(const e of entries){
      if(e.isSymbolicLink())continue;
      const abs=path.join(dir,e.name);
      if(e.isDirectory()){await visit(abs,depth+1);continue;}
      if(!e.isFile()||!/\.(fbx|glb)$/i.test(e.name))continue;
      const st=await fsp.stat(abs);
      const rel=path.relative(folder,abs).split(path.sep).join('/');
      const fd=await fsp.open(abs,'r'),header=Buffer.alloc(32);
      try{await fd.read(header,0,32,0);}finally{await fd.close();}
      const isFbx=path.extname(e.name).toLowerCase()==='.fbx';
      const binary=isFbx&&header.subarray(0,23).equals(MAGIC);
      const version=binary?header.readUInt32LE(23):null;
      result.push({path:rel,name:e.name,category:classify(rel),bytes:st.size,
        format:isFbx?'FBX':'GLB',
        fbxVersion:version,
        supported:binary&&version>=7000&&version<=7900,
        legacy:binary&&version<7000,
        compatibleFor:!isFbx?'Prévia 3D (planejada)':!binary?'FBX não binário':version<7000?'Converter FBX antigo':version>7900?'Versão FBX futura':'Leitura de animação ou malha'});
    }
  }
  await visit(folder);
  return result;
}
async function digestFile(file){
  return await new Promise((resolve,reject)=>{
    const hash=crypto.createHash('sha256');
    const stream=fs.createReadStream(file);
    stream.on('data',b=>hash.update(b));stream.once('error',reject);
    stream.once('end',()=>resolve(hash.digest('hex')));
  });
}
async function synchronize(root,readIndex,writeIndex,{maxMotions=250}={}){
  const files=await explore(root),index=await readIndex();
  let added=0,duplicates=0;
  const skipped=[];
  const knownHash=new Set(index.motions.map(m=>m.sha256));
  const knownPath=new Set(index.motions.map(m=>m.relativeSource).filter(Boolean));
  for(const file of files){
    if(file.category==='personagem') {skipped.push({path:file.path,reason:'Personagem: disponível para visualização, não é clipe'});continue;}
    if(!file.supported){skipped.push({path:file.path,reason:file.compatibleFor});continue;}
    if(file.bytes>MAX_MOTION){skipped.push({path:file.path,reason:'Clipe excede 96 MiB'});continue;}
    if(knownPath.has(file.path)) {duplicates++;continue;}
    if(index.motions.length>=maxMotions){skipped.push({path:file.path,reason:'Limite do catálogo atingido'});continue;}
    try{
      const source=safeSource(root,file.path);
      const hash=await digestFile(source);
      if(knownHash.has(hash)){duplicates++;continue;}
      const anim=extractAnimation(parseBinaryFbx(await fsp.readFile(source)));
      if(!anim.bones.length||!anim.times.length){skipped.push({path:file.path,reason:'Sem animação esquelética: usar como personagem'});continue;}
      const duration=(anim.times.at(-1)-anim.times[0])/TICKS_PER_SECOND;
      if(!Number.isFinite(duration)||duration<=0||duration>300){skipped.push({path:file.path,reason:'Duração inválida'});continue;}
      const motion={id:hash.slice(0,16),sha256:hash,name:path.basename(file.name,'.fbx'),
        filename:file.name,format:'fbx',source:'Mixamo',license:'Direitos de uso a conferir',
        status:'imported',bones:anim.bones.length,curves:anim.curveCount,samples:anim.times.length,
        duration:+duration.toFixed(5),bytes:file.bytes,relativeSource:file.path,
        importedAt:new Date().toISOString()};
      index.motions.push(motion);knownHash.add(hash);knownPath.add(file.path);added++;
    }catch(e){skipped.push({path:file.path,reason:e.message.slice(0,180)});}
  }
  if(added)await writeIndex(index);
  return {totalFiles:files.length,added,duplicates,skipped,indexCount:index.motions.length};
}
module.exports={explore,synchronize,safeSource,MAX_MOTION};
