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
const {explore,synchronize,safeSource}=require('./pack-library.cjs');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'app');
const WORKSPACE = path.resolve(process.env.MOVALAB_WORKSPACE || path.join(ROOT, 'workspace'));
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
    const index=await readIndex(),motion=index.motions.find(m=>m.id===id);
    if(!motion)return null;
    if(obj.name!==undefined) motion.name=String(obj.name).trim().slice(0,120)||motion.name;
    if(obj.source!==undefined) motion.source=String(obj.source).trim().slice(0,64);
    if(obj.license!==undefined) motion.license=String(obj.license).trim().slice(0,240);
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
  const index=await readIndex(),motion=index.motions.find(m=>m.id===id);
  if(!motion)return error(res,404,'Motion not found');
  if(cache.has(id))return send(res,200,cache.get(id));
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
  cache.set(id,payload);
  send(res,200,payload);
}
async function sendBinary(res,file,kind='application/octet-stream'){
  const resolved=await fsp.realpath(file);
  const sourceRoot=await fsp.realpath(path.join(WORKSPACE,'sources'));
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
  const file=safeSource(WORKSPACE,rel);
  return sendBinary(res,file);
}
async function motionRaw(res,id){
  const index=await readIndex(),motion=index.motions.find(m=>m.id===id);
  if(!motion)return error(res,404,'Animação não encontrada');
  const file=motion.relativeSource?safeSource(WORKSPACE,motion.relativeSource):path.join(WORKSPACE,'sources',motion.sha256+'.fbx');
  return sendBinary(res,file);
}

async function serveStatic(res, pathname) {
  if(pathname.startsWith('/vendor/')){
    const suffix=pathname.slice('/vendor/'.length);
    const threeRoot=path.resolve(PUBLIC,'node_modules','three');
    const filename=path.resolve(threeRoot,suffix.startsWith('addons/')?'examples/jsm/'+suffix.slice(7):'build/'+suffix);
    if(!filename.startsWith(threeRoot+path.sep)||!filename.endsWith('.js'))return error(res,403,'Caminho inválido');
    const contents=await fsp.readFile(filename);
    res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'});return res.end(contents);
  }
  const map={'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/main.js':'main.js','/viewer3d.js':'viewer3d.js'};
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
    'Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'"+hash+"; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'"});
  res.end(contents);
}
async function handle(req,res) {
  if(!['GET','POST','PATCH'].includes(req.method)) return error(res,405,'Method not allowed');
  const url=new URL(req.url,'http://127.0.0.1:'+PORT);
  const origin=req.headers.origin;
  if(origin && !['http://127.0.0.1:'+PORT,'http://localhost:'+PORT].includes(origin))return error(res,403,'Origin not allowed');
  if(req.method==='GET'&&url.pathname==='/favicon.ico'){res.writeHead(204,{'Cache-Control':'public, max-age=86400'});return res.end();}
  if(req.method==='GET'&&url.pathname==='/api/health')return send(res,200,{ok:true,workspace:WORKSPACE,version:'0.2.0'});
  if(req.method==='GET'&&url.pathname==='/api/assets')return send(res,200,{assets:await explore(WORKSPACE)});
  if(req.method==='GET'&&url.pathname==='/api/assets/raw')return assetRaw(req,res,url);
  if(req.method==='POST'&&url.pathname==='/api/library/sync'){
    const result=await atomic(()=>synchronize(WORKSPACE,readIndex,writeIndex));autoSynced=true;
    return send(res,200,result);
  }
  if(req.method==='GET'&&url.pathname==='/api/motions'){
    await autoSync();return send(res,200,await readIndex());
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
