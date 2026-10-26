'use strict';
// External, read-only source root. Only metadata/cache written by later stages.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const taxonomy=require('./mixamo-taxonomy.cjs');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const readJson=async(file,fallback)=>{try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT'&&fallback!==undefined)return fallback;throw e;}};
function safeRelative(relative){
 if(typeof relative!=='string'||!relative||relative.includes('\0')||relative.includes('\\')||relative.includes(':')||path.isAbsolute(relative)||path.win32.isAbsolute(relative)||relative.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Caminho Mixamo inválido');
 if(!/^(animation_motion|character_refined)\/[^/]+\.fbx$/i.test(relative))throw Error('Fonte fora das coleções autorizadas');
 return relative;
}
function createMixamoLibrary(root){
 root=path.resolve(root);let loaded=null,pending=null;
 async function load(){if(loaded)return loaded;if(pending)return pending;pending=loadData();try{return loaded=await pending;}finally{pending=null;}}
 async function sourcePath(relative){
  safeRelative(relative);const library=await load();if(!library.allowed.has(relative))throw Error('Fonte não consta no inventário seletivo');
  const base=await fs.realpath(root),file=await fs.realpath(path.join(root,relative));
  if(!file.startsWith(base+path.sep))throw Error('Fonte Mixamo fora da raiz autorizada');return file;
 }
 async function loadData(){
  const inventory=await readJson(path.join(root,'metadata/inventory.json'),null),prompts=await readJson(path.join(root,'metadata/raw/animation_motion_prompts.json'),null);
  if(!inventory||!prompts)return {enabled:false,reason:'Configure MOVALAB_MIXAMO_ROOT para o snapshot já adquirido; nenhuma fonte será baixada',motions:[],assets:[],allowed:new Map()};
  if(!/^[a-f0-9]{40}$/.test(inventory.revision)||inventory.dataset!=='Linzhan/Mixamo-Animations-Characters'||!Array.isArray(inventory.files))throw Error('Inventário Mixamo inválido');
  const frames=await readJson(path.join(root,'metadata/raw/animation_motion_frames.json'),{}),integrity=await readJson(path.join(root,'metadata/integrity.json'),{});
  const verified=new Map(integrity.revision===inventory.revision?(integrity.files||[]).map(e=>[e.path,e]):[]),allowed=new Map(),motions=[],assets=[],ids=new Set();
  const entries=inventory.files.filter(e=>e.kind==='animation'||e.kind==='character'),base=await fs.realpath(root),present=new Map();
  // Metadata-only probes, bounded independently of the total catalogue size.
  // Resolve the source root once; never open/parse all FBXs during startup.
  for(let start=0;start<entries.length;start+=8)await Promise.all(entries.slice(start,start+8).map(async entry=>{
   safeRelative(entry.path);let available=false;
   try{const file=await fs.realpath(path.join(root,entry.path));if(file.startsWith(base+path.sep)){const st=await fs.stat(file);available=st.isFile()&&st.size===entry.size;}}catch(e){if(e.code!=='ENOENT')throw e;}
   present.set(entry.path,available);
  }));
  for(const entry of entries){
   safeRelative(entry.path);if(allowed.has(entry.path)||!Number.isSafeInteger(entry.size)||entry.size<1||!/^[a-f0-9]{64}$/.test(entry.sha256))throw Error('Entrada Mixamo inválida');
   if((entry.kind==='animation')!==entry.path.startsWith('animation_motion/'))throw Error('Coleção Mixamo divergente');
   allowed.set(entry.path,entry);const filename=path.posix.basename(entry.path),id=digest(inventory.dataset+'/'+inventory.revision+'/'+entry.path).slice(0,16);
   if(ids.has(id))throw Error('ID Mixamo duplicado');ids.add(id);
   const available=present.get(entry.path);
   const provenance={dataset:inventory.dataset,revision:inventory.revision,path:entry.path,sha256:entry.sha256,integrityCheckedAt:verified.get(entry.path)?.valid?integrity.checkedAt:null};
   if(entry.kind==='character'){assets.push({path:'mixamo:'+entry.path,name:filename,category:'personagem',format:'FBX',bytes:entry.size,supported:available,available,externalSource:true,provenance,compatibility:'pending-inspection'});continue;}
   const labels=taxonomy.hints(filename,prompts[filename]?.description),frameCount=Number.isInteger(frames[filename])?frames[filename]:null;
   motions.push({id,sha256:entry.sha256,name:labels.nameOriginal,filename,format:'fbx',source:'Mixamo · HF',license:'Fonte Adobe Mixamo; uso interno; conferir termos antes de redistribuir',
    relativeSource:'mixamo:'+entry.path,externalSource:true,status:'imported',available,bytes:entry.size,bones:65,curves:null,samples:frameCount,
    duration:frameCount?Math.max(0,(frameCount-1)/30):0,durationEstimated:true,fps:null,fpsEstimate:30,...labels,
    provenance,compatibility:{status:'pending-inspection',expectedContract:'mixamorig65.v1',verified:false},events:[],contacts:[],favorite:false,skillUses:[],
    pipeline:{state:available?'source-present':'catalogued',catalogued:true,sourcePresent:available,converted:false,technicallyValidated:false,canvasPreviewAvailable:false,visuallyApproved:false,gameplayIntegrated:false},
    warnings:['Nome/tradução/taxonomia inferidos; FPS30/duração estimados por metadados, não medidos no FBX.','Prévia e qualidade não certificadas para este arquivo.']});
  }
  loaded={enabled:true,dataset:inventory.dataset,revision:inventory.revision,motions,assets,allowed};return loaded;
 }
 async function catalog({refresh=false}={}){if(refresh){if(pending)await pending;loaded=null;}const data=await load();const {allowed,...publicData}=data;return publicData;}
 async function inspect(id){return (await load()).motions.find(m=>m.id===id)||null;}
 async function raw(idOrPath){const data=await load(),entry=data.motions.find(m=>m.id===idOrPath);return sourcePath(entry?entry.provenance.path:String(idOrPath).replace(/^mixamo:/,''));}
 async function verify(id){const motion=await inspect(id);if(!motion)throw Error('Movimento Mixamo não encontrado');const file=await raw(id),buffer=await fs.readFile(file);if(digest(buffer)!==motion.sha256)throw Error('SHA-256 da fonte Mixamo divergente');return {motion,file,buffer};}
 return {root,catalog,inspect,raw,verify,search:async(query,filters)=>taxonomy.search((await catalog()).motions,query,filters)};
}
module.exports={createMixamoLibrary,safeRelative,digest};
