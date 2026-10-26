'use strict';
/**
 * MovaLab local-first API. Zero dependencies and no changes to Aruan runtime.
 * node tools/movalab/service/server.cjs
 */
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { parseBinaryFbx, extractAnimation, TICKS_PER_SECOND } = require('../src/fbx-binary.cjs');
const { evaluateSkeleton } = require('../src/rig-v2.cjs');
const {explore,synchronize,safeSource,CATEGORIES}=require('./pack-library.cjs');
const {createLegacy}=require('./legacy-service.cjs');
const {createMixamoLibrary}=require('./mixamo-library.cjs');
const mixamoTaxonomy=require('./mixamo-taxonomy.cjs');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'app');
const WORKSPACE = path.resolve(process.env.MOVALAB_WORKSPACE || path.join(ROOT, 'workspace'));
const mixamo=createMixamoLibrary(process.env.MOVALAB_MIXAMO_ROOT||path.resolve(ROOT,'../mixamo'));
const clipRuntime=require(path.resolve(ROOT,'../../js/clip-player.js'));
const gameBindings=require('./game-bindings.cjs')(WORKSPACE,clipRuntime);
const legacy=createLegacy(WORKSPACE);
const HOST = '127.0.0.1';
const PORT = Number(process.env.MOVALAB_PORT || 5320);
const LIMIT = 96 * 1024 * 1024; // Para arquivos de animação via upload. Personagens grandes são lidos por URL de asset.
const allowedStatus = new Set(['imported','needs-mapping','ready','approved','exported','error']);
const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
let writing = Promise.resolve();
const cache = new Map();
let autoSynced = false;
async function autoSync(){
  if(autoSynced)return;
  // Catalogação automática: lê assets já versionados sem duplicar os FBX.
  await atomic(()=>synchronize(WORKSPACE,readIndex,writeIndex));
  autoSynced=true;
}

function send(res, status, body) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(body));
}
function error(res, status, message) { send(res, status, {error:message}); }
async function readIndex() {
  try { const index = JSON.parse(await fsp.readFile(path.join(WORKSPACE,'library.json'), 'utf8'));
    if (!Array.isArray(index.motions) || index.schemaVersion !== 1) throw new Error('Invalid library schema');
    return index;
  } catch(e) {
    if(e.code === 'ENOENT') return {schemaVersion:1,motions:[]};
    throw e;
  }
}
async function writeIndex(index) {
  await fsp.mkdir(WORKSPACE, {recursive:true});
  const tmp = path.join(WORKSPACE,'library.json.tmp-' + process.pid);
  await fsp.writeFile(tmp, JSON.stringify(index,null,2));
  await fsp.rename(tmp,path.join(WORKSPACE,'library.json'));
}
function mixamoOverrides(index,motion){return {...motion,...(index.externalSources?.mixamo?.overrides?.[motion.id]||{})};}
async function allMotions(){const index=await readIndex(),external=await mixamo.catalog();return {...index,motions:[...index.motions,...external.motions.map(m=>mixamoOverrides(index,m))],externalSources:{...index.externalSources,mixamo:{enabled:external.enabled,revision:external.revision,count:external.motions.length}}};}
function atomic(operation) {
  const p = writing.then(operation);
  writing = p.catch(()=>{});
  return p;
}
function body(req, max=LIMIT) {
  return new Promise((resolve,reject)=>{
    const chunks=[]; let size=0,failed=false;
    req.on('data',c=>{ if(failed)return; size+=c.length;
      if(size>max){failed=true;reject(Object.assign(new Error('File too large'),{status:413}));req.resume();return;}
      chunks.push(c);
    });
    req.on('end',()=>{if(!failed)resolve(Buffer.concat(chunks));});
    req.on('error',reject);
  });
}
function canonicalName(name) { return String(name||'motion.fbx').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').slice(0,120); }
function analyze(buf) {
  const anim=extractAnimation(parseBinaryFbx(buf));
  if(!anim.bones.length || !anim.times.length) throw new Error('FBX has no playable skeletal animation');
  const duration=(anim.times.at(-1)-anim.times[0])/TICKS_PER_SECOND;
  if(!(duration>0 && duration<300) || anim.bones.length>250) throw new Error('FBX exceeds animation limits');
  return {anim,duration};
}
async function importMotion(req,res,url) {
  const buf=await body(req);
  const {anim,duration}=analyze(buf);
  const hash=crypto.createHash('sha256').update(buf).digest('hex');
  const filename=canonicalName(url.searchParams.get('filename'));
  const source=String(url.searchParams.get('source')||'Manual').slice(0,64);
  const result=await atomic(async()=>{
    const index=await readIndex();
    const found=index.motions.find(m=>m.sha256===hash);
    if(found) return {motion:found,duplicate:true};
    const sources=path.join(WORKSPACE,'sources');
    await fsp.mkdir(sources,{recursive:true});
    // Content-addressed local storage. Original names live only in metadata.
    await fsp.writeFile(path.join(sources,hash+'.fbx'),buf,{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
    const motion={id:hash.slice(0,16),sha256:hash,name:filename.replace(/\.fbx$/i,''),
      filename,format:'fbx',source,license:'Not recorded',status:'imported',
      bones:anim.bones.length,curves:anim.curveCount,samples:anim.times.length,
      duration:Number(duration.toFixed(5)),bytes:buf.length,importedAt:new Date().toISOString()};
    index.motions.unshift(motion);
    await writeIndex(index);
    return {motion,duplicate:false};
  });
  send(res,result.duplicate?200:201,result);
}
async function updateMotion(req,res,id) {
  const obj=JSON.parse((await body(req,32768)).toString('utf8'));
  const result=await atomic(async()=>{
    const index=await readIndex(),local=index.motions.find(m=>m.id===id),external=local?null:await mixamo.inspect(id),motion=local||(external?mixamoOverrides(index,external):null);
    if(!motion)return null;
    if(external){
      const changes={};if(obj.name!==undefined)changes.name=String(obj.name).trim().slice(0,120)||motion.name;
      if(obj.category!==undefined){if(!CATEGORIES.includes(obj.category))throw Error('Categoria inválida');changes.category=obj.category;}
      if(obj.favorite!==undefined){if(typeof obj.favorite!=='boolean')throw Error('Favorito deve ser verdadeiro ou falso');changes.favorite=obj.favorite;}
      // Source provenance and pipeline states come from evidence, not this form.
      if(obj.status&&obj.status!==motion.status)throw Error('Estado técnico Mixamo só muda após preparo/validação; aprovação visual exige evidência');
      index.externalSources||={};index.externalSources.mixamo||={overrides:{}};index.externalSources.mixamo.overrides||={};
      index.externalSources.mixamo.overrides[id]={...(index.externalSources.mixamo.overrides[id]||{}),...changes};await writeIndex(index);return {...motion,...changes};
    }
    if(obj.name!==undefined) motion.name=String(obj.name).trim().slice(0,120)||motion.name;
    if(obj.source!==undefined) motion.source=String(obj.source).trim().slice(0,64);
    if(obj.license!==undefined) motion.license=String(obj.license).trim().slice(0,240);
    if(obj.category!==undefined){
      if(!CATEGORIES.includes(obj.category))throw new Error('Categoria inválida');
      motion.category=obj.category;
    }
    if(obj.favorite!==undefined){
      if(typeof obj.favorite!=='boolean')throw new Error('Favorito deve ser verdadeiro ou falso');
      motion.favorite=obj.favorite;
    }
    if(obj.status!==undefined) {
      if(!allowedStatus.has(obj.status))throw new Error('Invalid status');
      motion.status=obj.status;
    }
    await writeIndex(index);
    return motion;
  });
  result?send(res,200,{motion:result}):error(res,404,'Motion not found');
}
async function clip(req,res,id) {
  if(await mixamo.inspect(id))return error(res,409,'Fonte Mixamo catalogada; prepare o clipe hierárquico offline para a prévia Canvas');
  const index=await readIndex(),motion=index.motions.find(m=>m.id===id);
  if(!motion)return error(res,404,'Motion not found');
  const cacheKey=id+':'+motion.sha256;
  if(cache.has(cacheKey))return send(res,200,cache.get(cacheKey));
  const file=motion.relativeSource?safeSource(WORKSPACE,motion.relativeSource):path.join(WORKSPACE,'sources',motion.sha256+'.fbx');
  const {anim,duration}=analyze(await fsp.readFile(file));
  const first=anim.times[0];
  const times=anim.times.map(t=>(t-first)/TICKS_PER_SECOND);
  // Preview only: local FBX rotations & world positions, NOT Aruan retargeting.
  const frames=times.map(t=>{
    const skeleton=evaluateSkeleton(anim,t),joints={};
    for(const b of anim.bones){ const j=skeleton[b.name]; if(!j)continue;
      joints[b.name]=j.position.map(v=>Number(v.toFixed(4)));
    }
    return {t:Number(t.toFixed(6)),joints};
  });
  const payload={id,motion,duration,bones:anim.bones.map(b=>({name:b.name,parent:b.parent})),frames,
    warning:'3D diagnostic preview: FBX bind/axis conventions need cross-validation. Proxy is approximate, not exported procedural animation.'};
  if(cache.size>=8)cache.delete(cache.keys().next().value);
  cache.set(cacheKey,payload);
  send(res,200,payload);
}
async function sendBinary(res,file,kind='application/octet-stream',allowedRoot=path.join(WORKSPACE,'sources')){
  const resolved=await fsp.realpath(file);
  const sourceRoot=await fsp.realpath(allowedRoot);
  if(!resolved.startsWith(sourceRoot+path.sep))throw Object.assign(new Error('Arquivo fora do workspace'),{status:403});
  const st=await fsp.stat(resolved);
  if(!st.isFile())throw new Error('Arquivo inválido');
  res.writeHead(200,{'Content-Type':kind,'Content-Length':st.size,'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff','Access-Control-Allow-Origin':'http://127.0.0.1:'+PORT});
  await new Promise((resolve,reject)=>{
    const s=fs.createReadStream(resolved);
    s.once('error',reject);s.once('end',resolve);s.pipe(res);
  });
}
async function assetRaw(req,res,url){
  const rel=url.searchParams.get('path');
  if(!rel||!/\.(fbx|glb)$/i.test(rel))return error(res,400,'Arquivo inválido');
  if(rel.startsWith('mixamo:'))return sendBinary(res,await mixamo.raw(rel),'application/octet-stream',mixamo.root);
  const file=safeSource(WORKSPACE,rel);
  return sendBinary(res,file);
}
async function motionRaw(res,id){
  if(await mixamo.inspect(id))return sendBinary(res,await mixamo.raw(id),'application/octet-stream',mixamo.root);
  const index=await readIndex(),motion=index.motions.find(m=>m.id===id);
  if(!motion)return error(res,404,'Animação não encontrada');
  const file=motion.relativeSource?safeSource(WORKSPACE,motion.relativeSource):path.join(WORKSPACE,'sources',motion.sha256+'.fbx');
  return sendBinary(res,file);
}
async function workspaceJson(name,fallback){
  try{return JSON.parse(await fsp.readFile(path.join(WORKSPACE,name),'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}
}
async function writeWorkspaceJson(name,value){
  await fsp.mkdir(WORKSPACE,{recursive:true});const target=path.join(WORKSPACE,name),temp=target+'.tmp-'+process.pid;
  await fsp.writeFile(temp,JSON.stringify(value,null,2)+'\n');await fsp.rename(temp,target);
}
async function saveProceduralClip(req,res){
  const text=(await body(req,16*1024*1024)).toString('utf8'),value=clipRuntime.parse(text);
  const canonical=JSON.stringify(value),hash=crypto.createHash('sha256').update(canonical).digest('hex');
  const saved=await atomic(async()=>{
    const folder=path.join(WORKSPACE,'exports');await fsp.mkdir(folder,{recursive:true});
    const filename=hash+'.aruan-clip.v1.json';
    await fsp.writeFile(path.join(folder,filename),canonical+'\n',{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
    const index=await workspaceJson('clips.json',{schemaVersion:1,clips:[]});
    const entry={id:hash,name:value.name,duration:value.duration,profile:value.profile,filename,sourceSha256:value.metadata?.sourceSha256||null};
    if(!index.clips.some(c=>c.id===hash)){index.clips.push(entry);await writeWorkspaceJson('clips.json',index);}
    return entry;
  });send(res,201,{clip:saved});
}
async function savePreset(req,res){
  const input=JSON.parse((await body(req,32768)).toString('utf8'));
  if(typeof input.name!=='string'||!input.name.trim()||input.name.length>80)throw Error('Nome de preset inválido');
    const {validateCorrections,validateMapping}=await import('../app/converter-settings.js');
    const preset={name:input.name.trim(),profile:'aruan-humanoid-v2',version:1,corrections:validateCorrections(input.corrections),mapping:validateMapping(input.mapping)};
  await atomic(async()=>{const index=await workspaceJson('presets.json',{schemaVersion:1,presets:[]});
    const found=index.presets.findIndex(p=>p.name===preset.name);if(found>=0)index.presets[found]=preset;else index.presets.push(preset);
    if(index.presets.length>1000)throw Error('Limite de presets atingido');await writeWorkspaceJson('presets.json',index);
  });send(res,200,{preset});
}

async function serveStatic(res, pathname) {
  if(pathname.startsWith('/aruan/js/')){
    const name=pathname.slice('/aruan/js/'.length);
    if(!['math.js','paint.js','appearance.js','rig.js','character.js','head.js','clip-player.js','humanoid-rig.js','movalab-bindings.js'].includes(name))return error(res,404,'Módulo não permitido');
    const content=await fsp.readFile(path.resolve(ROOT,'../../js',name));
    res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(content);
  }
  if(pathname.startsWith('/vendor/')){
    const suffix=pathname.slice('/vendor/'.length);
    const threeRoot=path.resolve(PUBLIC,'node_modules','three');
    const filename=path.resolve(threeRoot,suffix.startsWith('addons/')?'examples/jsm/'+suffix.slice(7):'build/'+suffix);
    if(!filename.startsWith(threeRoot+path.sep)||!filename.endsWith('.js'))return error(res,403,'Caminho inválido');
    const contents=await fsp.readFile(filename);
    res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'});return res.end(contents);
  }
  const map={'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/main.js':'main.js','/viewer3d.js':'viewer3d.js','/humanoid.js':'humanoid.js'};
  map['/fbx-loader.js']='fbx-loader.js';
  map['/aruan-proxy.js']='aruan-proxy.js';map['/aruan-profile.js']='aruan-profile.js';
  for(const name of ['converter.js','converter-settings.js','procedural-lab.js','legacy-ui.js','aruan-preview.html','canvas-preview.js','canvas-preview.css','game-publish.js'])map['/'+name]=name;
  const filename=map[pathname];
  if(!filename)return error(res,404,'Not found');
  const type=filename.endsWith('.js')?'text/javascript':filename.endsWith('.css')?'text/css':'text/html';
  const contents=await fsp.readFile(path.join(PUBLIC,filename));
  // Import maps são inline por definição. Liberar exclusivamente o hash deste mapa, não 'unsafe-inline'.
  const html=filename==='index.html'?contents.toString('utf8'):'';
  const openTag='<script type="importmap">',closeTag='</script>';
  const start=html.indexOf(openTag);
  const stop=start<0?-1:html.indexOf(closeTag,start+openTag.length);
  const importMap=start>=0&&stop>start?html.slice(start+openTag.length,stop):null;
  const hash=importMap?" 'sha256-"+crypto.createHash('sha256').update(importMap).digest('base64')+"'":'';
  res.writeHead(200,{'Content-Type':type+'; charset=utf-8','X-Content-Type-Options':'nosniff',
    'Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'"+hash+"; style-src 'self'; img-src 'self' data: blob:; connect-src 'self' blob:; object-src 'none'; frame-ancestors "+(filename==='aruan-preview.html'?"'self'":"'none'")+"; base-uri 'none'"});
  res.end(contents);
}
async function handle(req,res) {
  if(!['GET','POST','PATCH'].includes(req.method)) return error(res,405,'Method not allowed');
  const url=new URL(req.url,'http://127.0.0.1:'+PORT);
  const origin=req.headers.origin;
  if(origin && !['http://127.0.0.1:'+PORT,'http://localhost:'+PORT].includes(origin))return error(res,403,'Origin not allowed');
  if(req.method==='GET'&&url.pathname==='/favicon.ico'){res.writeHead(204,{'Cache-Control':'public, max-age=86400'});return res.end();}
  if(req.method==='GET'&&url.pathname==='/api/health')return send(res,200,{ok:true,workspace:WORKSPACE,version:'0.2.0'});
  if(req.method==='GET'&&url.pathname==='/api/game-bindings')return send(res,200,await gameBindings.read());
  if(req.method==='POST'&&url.pathname==='/api/game-bindings'){
    const value=JSON.parse((await body(req,32768)).toString('utf8'));return send(res,200,await atomic(()=>gameBindings.apply(value)));
  }
  if(req.method==='GET'&&url.pathname==='/api/assets'){
    const assets=await explore(WORKSPACE),derived=await legacy.read();
    for(const asset of assets){const converted=derived.assets.find(a=>a.sourcePath===asset.path);if(converted&&await legacy.matches(asset,converted)){asset.derived=converted;asset.supported=true;asset.category=converted.report.counts.animations?'animação com malha':'personagem';asset.compatibleFor='GLB convertido; confira as perdas no relatório';}}
    return send(res,200,{assets:[...assets,...(await mixamo.catalog()).assets]});
  }
  if(req.method==='GET'&&url.pathname==='/api/legacy/status')return send(res,200,await legacy.status());
  if(req.method==='POST'&&url.pathname==='/api/legacy/setup')return send(res,200,await atomic(()=>legacy.setup()));
  if(req.method==='POST'&&url.pathname==='/api/legacy/convert'){
    const value=JSON.parse((await body(req,32768)).toString('utf8'));return send(res,200,await atomic(()=>legacy.convert(value.path)));
  }
  const legacyAsset=url.pathname.match(/^\/api\/legacy\/assets\/([a-f0-9]{64})$/);
  if(req.method==='GET'&&legacyAsset){
    const file=await legacy.raw(legacyAsset[1]),stat=await fsp.stat(file);
    res.writeHead(200,{'Content-Type':'model/gltf-binary','Content-Length':stat.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);return;
  }
  if(req.method==='GET'&&url.pathname==='/api/assets/raw')return assetRaw(req,res,url);
  if(req.method==='POST'&&url.pathname==='/api/procedural/clips')return saveProceduralClip(req,res);
  if(req.method==='GET'&&url.pathname==='/api/procedural/clips')return send(res,200,await workspaceJson('clips.json',{schemaVersion:1,clips:[]}));
  const procedural=url.pathname.match(/^\/api\/procedural\/clips\/([a-f0-9]{64})$/);
  if(req.method==='GET'&&procedural){
      const index=await workspaceJson('clips.json',{schemaVersion:1,clips:[]}),entry=index.clips.find(c=>c.id===procedural[1]);
      if(!entry||!/^[-a-zA-Z0-9]+\.aruan-clip\.v1\.json$/.test(entry.filename))return error(res,404,'Clipe salvo não encontrado');
      const file=path.join(WORKSPACE,'exports',entry.filename),real=await fsp.realpath(file),folder=await fsp.realpath(path.join(WORKSPACE,'exports'));
      if(!real.startsWith(folder+path.sep))return error(res,404,'Clipe fora da biblioteca');
      const value=clipRuntime.parse(await fsp.readFile(real,'utf8'));
      if(crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')!==entry.id)throw Error('Hash do clipe salvo não confere; salve novamente');
      return send(res,200,value);
  }
  if(req.method==='GET'&&url.pathname==='/api/presets')return send(res,200,await workspaceJson('presets.json',{schemaVersion:1,presets:[]}));
  if(req.method==='POST'&&url.pathname==='/api/presets')return savePreset(req,res);
  if(req.method==='POST'&&url.pathname==='/api/library/sync'){
    const result=await atomic(()=>synchronize(WORKSPACE,readIndex,writeIndex));autoSynced=true;
    const external=await mixamo.catalog({refresh:true});result.mixamo={enabled:external.enabled,motions:external.motions.length,characters:external.assets.length};
    return send(res,200,result);
  }
  if(req.method==='GET'&&url.pathname==='/api/motions'){
    await autoSync();return send(res,200,await allMotions());
  }
  if(req.method==='GET'&&url.pathname==='/api/mixamo/catalog'){
    const data=await mixamo.catalog(),index=await readIndex(),records=data.motions.map(m=>mixamoOverrides(index,m));
    return send(res,200,{enabled:data.enabled,reason:data.reason,dataset:data.dataset,revision:data.revision,total:records.length,characters:data.assets.length,
      counts:{sourcePresent:records.filter(m=>m.pipeline.sourcePresent).length,converted:0,technicallyValidated:0,canvasPreviewAvailable:0,visuallyApproved:0,gameplayIntegrated:0},
      motions:mixamoTaxonomy.search(records,url.searchParams.get('q'),{category:url.searchParams.get('category'),state:url.searchParams.get('state'),favorites:url.searchParams.get('favorites')==='1',offset:Number(url.searchParams.get('offset'))||0,limit:Number(url.searchParams.get('limit'))||100})});
  }
  if(req.method==='POST'&&url.pathname==='/api/import')return importMotion(req,res,url);
  const match=url.pathname.match(/^\/api\/motions\/([a-f0-9]{16})(\/(clip|raw))?$/);
  if(match&&req.method==='GET'&&match[2]==='/raw')return motionRaw(res,match[1]);
  if(match&&req.method==='GET'&&match[2]==='/clip')return clip(req,res,match[1]);
  if(match&&req.method==='PATCH'&&!match[2])return updateMotion(req,res,match[1]);
  if(req.method==='GET')return serveStatic(res,url.pathname);
  return error(res,404,'Not found');
}
const server=http.createServer((req,res)=>{Promise.resolve().then(()=>handle(req,res)).catch(e=>{
  console.error('[MovaLab]',e.message);
  if(!res.headersSent)error(res,e.status||((e instanceof SyntaxError)?400:((e.code==='ENOENT')?404:400)),e.message);
  else res.destroy();
})});
if(require.main===module){
  server.listen(PORT,HOST,()=>console.log('MovaLab http://'+HOST+':'+PORT+' | library: '+WORKSPACE));
}
module.exports={server,readIndex,WORKSPACE};
