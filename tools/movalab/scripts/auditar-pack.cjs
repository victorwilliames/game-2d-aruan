#!/usr/bin/env node
'use strict';
/**
 * Audita packs externos de FBX/GLB sem alterar, importar nem descartar nenhum asset.
 * Uso: node tools/movalab/scripts/auditar-pack.cjs "D:\...\MixamoOriginalsPack" [--json]
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const FBX_MAGIC=Buffer.from('Kaydara FBX Binary  \x00\x1a\x00','binary');
const ALLOWED_EXT=new Set(['.fbx','.glb','.gltf']);
const MAX_LEGACY_APP=24*1024*1024;
const bad=(msg)=>{throw new Error(msg);};
function identify(file){
 const ext=path.extname(file).toLowerCase();
 if(!ALLOWED_EXT.has(ext))return {format:'ignorado',fbxVersion:null,readable:false,reason:'Extensão não suportada'};
 const fd=fs.openSync(file,'r');const header=Buffer.alloc(32);
 try{
  const bytes=fs.readSync(fd,header,0,32,0);
  if(ext==='.fbx'){
   if(bytes>=27&&header.subarray(0,23).equals(FBX_MAGIC)){
    const version=header.readUInt32LE(23);
    return {format:'FBX binário',fbxVersion:version,readable:version>=7000&&version<=7900,
      reason:version>=7000&&version<=7900?'Leitor atual suporta':'FBX legado (ou futuro) precisa de conversão/adaptador'};
   }
   const text=header.toString('ascii',0,bytes);
   if(text.includes('FBX')&&text.includes(';'))return {format:'FBX ASCII',fbxVersion:null,readable:false,reason:'Leitor atual não suporta FBX ASCII'};
   return {format:'FBX desconhecido',fbxVersion:null,readable:false,reason:'Cabeçalho inválido ou não reconhecido'};
  }
  if(ext==='.glb'){
   const ok=bytes>=12&&header.subarray(0,4).toString('ascii')==='glTF'&&header.readUInt32LE(4)===2;
   return {format:'GLB 2.0',fbxVersion:null,readable:false,reason:ok?'Requer GLTFLoader na próxima etapa':'GLB inválido'};
  }
  return {format:'glTF JSON',fbxVersion:null,readable:false,reason:'Requer GLTFLoader na próxima etapa'};
 }finally{fs.closeSync(fd);}
}
function category(file){
 const p=file.replace(/\\/g,'/').toLowerCase();
 if(/\/(characters3d|characters|models|actors)\//.test(p))return 'personagem';
 if(/\/(animationswithskin|withskin)\//.test(p))return 'animação com malha';
 if(/\/(animations|motions)\//.test(p))return 'animação';
 return 'não classificado';
}
function readFiles(root,opts={}){
 const absolute=path.resolve(root);
 if(!fs.existsSync(absolute)||!fs.statSync(absolute).isDirectory())bad('Pasta não encontrada: '+absolute);
 const results=[],hashes=new Map();
 const visit=(directory,depth)=>{
  if(depth>15)bad('Pasta profunda demais: '+directory);
  for(const e of fs.readdirSync(directory,{withFileTypes:true})){
   if(e.isSymbolicLink())continue; // Não seguir atalhos fora do pack.
   const full=path.join(directory,e.name);
   if(e.isDirectory()){visit(full,depth+1);continue;}
   if(!e.isFile()||!ALLOWED_EXT.has(path.extname(e.name).toLowerCase()))continue;
   const size=fs.statSync(full).size;
   const format=identify(full),relative=path.relative(absolute,full).split(path.sep).join('/');
   const digest=crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
   const previous=hashes.get(digest);if(!previous)hashes.set(digest,relative);
   results.push({path:relative,category:category(full),bytes:size,megabytes:+(size/1048576).toFixed(2),
     sha256:digest,duplicateOf:previous||null,overOldAppUploadLimit:size>MAX_LEGACY_APP,
     ...format});
  }
 };
 visit(absolute,0);
 results.sort((a,b)=>a.path.localeCompare(b.path,'pt-BR'));
 const summary={root:absolute,files:results.length,totalMiB:+(results.reduce((s,x)=>s+x.bytes,0)/1048576).toFixed(2),
   animations:results.filter(x=>x.category.startsWith('animação')).length,
   characters:results.filter(x=>x.category==='personagem').length,
   currentReaderCompatible:results.filter(x=>x.readable).length,
   oldFbx:results.filter(x=>x.fbxVersion!==null&&x.fbxVersion<7000).length,
   sizeBlockedByCurrentApp:results.filter(x=>x.overOldAppUploadLimit).length,
   duplicates:results.filter(x=>x.duplicateOf).length,
   note:'Auditoria de cabeçalho: compatibilidade real de malha/animador depende de importação e teste visual'};
 return {summary,files:results};
}
if(require.main===module){
 try{
  const root=process.argv[2];if(!root)bad('Uso: node tools/movalab/scripts/auditar-pack.cjs "CAMINHO_DO_PACK" [--json]');
  const r=readFiles(root);
  if(process.argv.includes('--json'))console.log(JSON.stringify(r,null,2));
  else{
   console.log('\nMOVALAB · AUDITORIA DO PACK');
   for(const [k,v] of Object.entries(r.summary))console.log(k+': '+v);
   for(const file of r.files)console.log((file.readable?'✓':'!')+' '+file.path+' | '+file.format+(file.fbxVersion?' '+file.fbxVersion:'')+' | '+file.megabytes+' MiB'+(file.overOldAppUploadLimit?' | acima do limite antigo':'')+(file.duplicateOf?' | DUPLICADO DE '+file.duplicateOf:''));
  }
 }catch(e){console.error('Erro: '+e.message);process.exitCode=1;}
}
module.exports={identify,readFiles,category};
