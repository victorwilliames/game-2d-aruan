'use strict';
// Official HF HTTP API; no CLI dependency, global cache, duplicate blob or token logs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {once}=require('node:events');
const DATASET='Linzhan/Mixamo-Animations-Characters';
const LIMIT=10_000_000_000, RESERVE=2_000_000_000;
const CHARACTERS=['Claire','Passive_Marker_Man','Peasant_Man','Aj','Paladin_J_Nordstrom','Kaya','Doozy','Y_Bot','Castle_Guard_01','Timmy','Michelle','Mremireh_O_Desbiens','Goblin_D_Shareyko','Big_Vegas','Brute','Ty','Paladin_WProp_J_Nordstrom','Ortiz','Amy'];
const METADATA=['animation_bones.json','animation_motion_prompts.json','animation_motion_frames.json','metadata.csv','characters.csv','characters.json','character_bones.json','character_bone_fix_applied.txt','character_nonstandard_rig.txt','README.md'];
function assertBudget({reservedTransferBytes,additionalBytes,occupiedBytes,freeBytes}){if(![reservedTransferBytes,additionalBytes,occupiedBytes,freeBytes].every(x=>Number.isSafeInteger(x)&&x>=0))throw Error('Invalid budget measurement');if(reservedTransferBytes+additionalBytes>LIMIT||occupiedBytes+additionalBytes>LIMIT||freeBytes-additionalBytes<RESERVE)throw Error('Storage/transfer budget exceeded');}
function safePath(root,relative){if(relative.includes('\\')||relative.split('/').some(p=>!p||p==='.'||p==='..')||path.isAbsolute(relative)||path.win32.isAbsolute(relative)||/^[a-z]:/i.test(relative))throw Error('Unsafe source path');const p=path.resolve(root,relative);if(!p.startsWith(path.resolve(root)+path.sep))throw Error('Path outside root');return p;}
function writeJSON(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p+'.tmp',JSON.stringify(v,null,2)+'\n');for(let i=0;;i++){try{fs.renameSync(p+'.tmp',p);break;}catch(e){if(i>=10||!['EPERM','EBUSY','EACCES'].includes(e.code))throw e;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,25);}}}
async function hash(p){const h=crypto.createHash('sha256');for await(const b of fs.createReadStream(p))h.update(b);return h.digest('hex');}
async function gitHash(p){const h=crypto.createHash('sha1');h.update('blob '+fs.statSync(p).size+'\0');for await(const b of fs.createReadStream(p))h.update(b);return h.digest('hex');}
function bytes(root){if(!fs.existsSync(root))return 0;return fs.readdirSync(root,{withFileTypes:true}).reduce((s,e)=>s+(e.isSymbolicLink()?0:e.isDirectory()?bytes(path.join(root,e.name)):fs.statSync(path.join(root,e.name)).size),0);}
function free(root){return Number(fs.statfsSync(root).bavail)*Number(fs.statfsSync(root).bsize);}
function select(entries){
 const animations=entries.filter(e=>e.type==='file'&&/^animation_motion\/[^/]+\.fbx$/i.test(e.path));
 const models=CHARACTERS.map(name=>{const e=entries.find(e=>e.type==='file'&&e.path.toLowerCase()===('character_refined/'+name+'.fbx').toLowerCase());if(!e)throw Error('Selected character absent: '+name);return e;});
 const metadata=entries.filter(e=>e.type==='file'&&METADATA.includes(e.path.split('/').pop())&&!e.path.includes('render/'));
 if(animations.length!==2317)throw Error('Snapshot animation count differs: '+animations.length);
 const files=[...animations,...models,...metadata].map(e=>({path:e.path,size:e.size,sha256:e.lfs?.oid?.replace(/^sha256:/,''),gitOid:e.oid,kind:e.path.startsWith('animation_motion/')?'animation':e.path.startsWith('character_refined/')?'character':'metadata'}));
 for(const e of files)if(e.kind==='metadata')e.localPath='metadata/raw/'+path.basename(e.path);
 if(new Set(files.map(e=>e.path)).size!==files.length)throw Error('Duplicate paths in remote inventory');
 if(files.some(e=>!Number.isSafeInteger(e.size)||e.size<=0))throw Error('Unknown/invalid file size');
 const total=files.reduce((n,e)=>n+e.size,0);if(total>LIMIT)throw Error('Selected source bytes exceed 10 GB');
 return {files,total};
}
function credentials(){
 if(process.env.HF_TOKEN)return process.env.HF_TOKEN.trim();
 const home=process.env.USERPROFILE||process.env.HOME;
 const candidates=[process.env.HF_HOME&&path.join(process.env.HF_HOME,'token'),home&&path.join(home,'.cache/huggingface/token')].filter(Boolean);
 for(const p of candidates)if(fs.existsSync(p)){const value=fs.readFileSync(p,'utf8').trim();const match=value.match(/hf_[A-Za-z0-9]+/);if(match)return match[0];}
 return null;
}
async function main(){
 const args=process.argv.slice(2),mode=args[0]||'inventory';const opt=n=>args.find(x=>x.startsWith('--'+n+'='))?.split('=').slice(1).join('=');
 const root=path.resolve(opt('root')||path.join(__dirname,'..')),meta=path.join(root,'metadata');fs.mkdirSync(meta,{recursive:true});
 if(mode==='download'){
  const lock=path.join(root,'download.lock');let fd;
  try{fd=fs.openSync(lock,'wx');}catch(e){if(e.code==='EEXIST')throw Error('Download lock exists; verify the previous process stopped before removing this tool-owned lock');throw e;}
  fs.writeFileSync(fd,JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));fs.closeSync(fd);
  process.once('exit',()=>{try{fs.unlinkSync(lock);}catch{}});
 }
 const ledgerPath=path.join(root,'transfer-ledger.json');let ledger=fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath)): {version:1,reservedTransferBytes:0,actualTransferBytes:0,initialRootBytes:bytes(root),initialFreeBytes:free(root),files:{}};
 const token=args.includes('--public')?null:credentials();const headers=token?{Authorization:'Bearer '+token}:{};
 async function json(url){const r=await fetch(url,{headers,signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('HF API HTTP '+r.status);const text=await r.text();ledger.actualTransferBytes+=Buffer.byteLength(text);ledger.reservedTransferBytes+=Buffer.byteLength(text);writeJSON(ledgerPath,ledger);if(ledger.reservedTransferBytes>LIMIT)throw Error('Transfer budget');return JSON.parse(text);}
 if(mode==='inventory'){
  let auth={configured:!!token,verified:false};if(token){const who=await json('https://huggingface.co/api/whoami-v2');auth.verified=!!who.name;auth.account=who.name;}
  const info=await json('https://huggingface.co/api/datasets/'+DATASET);const revision=info.sha;if(!/^[a-f0-9]{40}$/.test(revision))throw Error('Invalid snapshot SHA');
  const entries=[];
  for(const dir of ['', 'animation_motion','character_refined']){
   let url='https://huggingface.co/api/datasets/'+DATASET+'/tree/'+revision+(dir?'/'+dir:'')+'?recursive=false&limit=1000';
   while(url){const r=await fetch(url,{headers,signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Tree HTTP '+r.status);const text=await r.text();ledger.actualTransferBytes+=Buffer.byteLength(text);ledger.reservedTransferBytes+=Buffer.byteLength(text);writeJSON(ledgerPath,ledger);entries.push(...JSON.parse(text));const link=r.headers.get('link');url=link?.match(/<([^>]+)>; rel="next"/)?.[1]||null;if(url&&!url.startsWith('https://huggingface.co/api/'))throw Error('Untrusted pagination');}
  }
  const chosen=select(entries);const inventory={version:1,dataset:DATASET,revision,createdAt:new Date().toISOString(),auth,limitBytes:LIMIT,reserveBytes:RESERVE,freeBytes:free(root),...chosen};
  writeJSON(path.join(meta,'inventory.json'),inventory);console.log(JSON.stringify({revision,auth,animations:2317,characters:19,metadata:chosen.files.filter(e=>e.kind==='metadata').map(e=>e.path),selectedBytes:chosen.total,freeBytes:inventory.freeBytes}));return;
 }
 const inventory=JSON.parse(fs.readFileSync(path.join(meta,'inventory.json')));
 if(mode==='organize'){
  for(const e of inventory.files.filter(e=>e.kind==='metadata'&&!e.localPath)){
   const original=safePath(root,e.path),relative='metadata/raw/'+path.basename(e.path),dest=safePath(root,relative);
   if(!fs.existsSync(original))continue;
   if(!ledger.files[e.path]||await hash(original)!==ledger.files[e.path].sha256)throw Error('Unowned/modified metadata preserved: '+e.path);
   if(fs.existsSync(dest))throw Error('Metadata destination exists; preserved both paths');
   fs.mkdirSync(path.dirname(dest),{recursive:true});fs.renameSync(original,dest);e.localPath=relative;
  }
  writeJSON(path.join(meta,'inventory.json'),inventory);console.log('Downloaded source metadata organized under metadata/raw; source paths retained in manifest.');return;
 }
 if(mode==='report'){
  const report=JSON.parse(fs.readFileSync(path.join(meta,'integrity.json'))),good=report.files.filter(e=>e.valid),missing=report.files.filter(e=>!e.valid),byKind=k=>good.filter(e=>e.kind===k).reduce((n,e)=>n+e.size,0);
  const hashes=new Set(good.filter(e=>e.kind==='animation').map(e=>e.sha256)),overhead=opt('overhead-root')?bytes(path.resolve(opt('overhead-root'))):null;
  const text=`# Mixamo — relatório de aquisição Sprint 9\n\nVerificação: ${report.checkedAt}. Dataset: [${DATASET}](https://huggingface.co/datasets/${DATASET}/tree/${inventory.revision}). Revisão fixa: ${inventory.revision}.\n\n| Tipo | Íntegros | Bytes de fontes |\n|---|---:|---:|\n| Movimentos | ${report.counts.animation}/2317 | ${byKind('animation')} |\n| Personagens escolhidos | ${report.counts.character}/19 | ${byKind('character')} |\n| Metadados | ${report.counts.metadata}/10 | ${byKind('metadata')} |\n\n- Total selecionado no dry-run: ${inventory.total} bytes.\n- Arquivos de movimento com SHA distintos: ${hashes.size}; duplicações exatas: ${report.counts.animation-hashes.size}. Fontes mantidas sem alteração.\n- Transferência efetivamente contada pelo downloader/API: ${ledger.actualTransferBytes} bytes; reserva conservadora acumulada por tentativas: ${ledger.reservedTransferBytes} bytes. Consultas iniciais de diagnóstico e overhead HTTP não foram medidos; não são apresentados como tráfego exato.\n- Pasta local neste momento: ${bytes(root)} bytes lógicos; checkout adicional medido: ${overhead??'não medido'} bytes lógicos. Bytes lógicos não certificam alocação física de clusters.\n- Espaço livre D: antes: ${ledger.initialFreeBytes} bytes; agora: ${free(root)} bytes.\n- Teto independente de transferência e armazenamento novo: ${LIMIT} bytes; reserva livre mínima: ${RESERVE}. Fontes/temporários ficaram apenas no D:, sem cache global duplicado.\n- Download público. Cache HF padrão retornou HTTP 401; autenticação bem-sucedida não comprovada. Caminho alternativo de credencial bloqueado pela revisão automática e não usado.\n- Sem animation_motion_ybot, animation_motion_render, animation completo, renders ou GLB. Exatamente os 19 nomes autorizados, confirmados na API.\n- Proveniência/licença declarada: adobe-mixamo-terms. Uso interno; fontes brutas ignoradas, sem redistribuição no Git.\n\n## Estados posteriores\n\nConversões desta biblioteca: 0. Prévia Canvas aprovada: 0. Aprovação visual: 0. Integração ao gameplay desta biblioteca: 0. Os clipes preexistentes do workspace não são contados como novos derivados. Aquisição íntegra não certifica retarget ou arte.\n\n## Ausências/falhas\n\n${missing.length?missing.map(e=>'- '+e.path).join('\n'):'Nenhuma fonte selecionada ausente ou inválida na verificação.'}\n`;
  fs.writeFileSync(path.join(root,'DOWNLOAD_REPORT.md'),text);console.log(JSON.stringify({counts:report.counts,missing:missing.length,rootBytes:bytes(root),checkoutBytes:overhead}));return;
 }
 if(mode==='verify'){
  const results=[];for(const e of inventory.files){const p=safePath(root,e.localPath||e.path);const present=fs.existsSync(p)&&fs.statSync(p).size===e.size;const sha256=present?await hash(p):null;const gitOid=present&&!e.sha256?await gitHash(p):null;results.push({...e,present,valid:present&&(e.sha256?e.sha256===sha256:e.gitOid===gitOid),sha256});}
  const report={revision:inventory.revision,checkedAt:new Date().toISOString(),files:results,counts:Object.fromEntries(['animation','character','metadata'].map(k=>[k,results.filter(e=>e.kind===k&&e.valid).length])),rootBytes:bytes(root),freeBytes:free(root),transfer:{reservedBytes:ledger.reservedTransferBytes,actualBytes:ledger.actualTransferBytes}};
  writeJSON(path.join(meta,'integrity.json'),report);console.log(JSON.stringify({...report,files:undefined}));return;
 }
 if(mode!=='download')throw Error('Use inventory | download | organize | verify | report');
 let selected=inventory.files;const max=Number(opt('max')||selected.length);if(!Number.isSafeInteger(max)||max<1)throw Error('Invalid max');
 // Metadata and one canonical walking clip first; only then the full bounded queue.
 selected=[...selected.filter(e=>e.kind==='metadata'),...selected.filter(e=>e.kind==='character'),...selected.filter(e=>e.kind==='animation').sort((a,b)=>(/\/Walking\.fbx$/i.test(a.path)?-1:/\/Walking\.fbx$/i.test(b.path)?1:a.path.localeCompare(b.path)))].slice(0,max);
 let cursor=0,complete=0;const errors=[];
 async function download(e){
  const dest=safePath(root,e.localPath||e.path);fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(fs.existsSync(dest)){if(fs.statSync(dest).size===e.size&&(!e.sha256||await hash(dest)===e.sha256))return;throw Error('Existing file failed integrity; preserved: '+e.path);}
  const part=dest+'.part',offset=fs.existsSync(part)?fs.statSync(part).size:0;if(offset>e.size)throw Error('Oversized partial preserved');
  const remaining=e.size-offset;
  // Reserve 500 MB for the isolated checkout, small reports and Git objects.
  assertBudget({reservedTransferBytes:ledger.reservedTransferBytes,additionalBytes:remaining,occupiedBytes:bytes(root)+500_000_000,freeBytes:free(root)});
  ledger.reservedTransferBytes+=remaining;writeJSON(ledgerPath,ledger);
  if(remaining){const url='https://huggingface.co/datasets/'+DATASET+'/resolve/'+inventory.revision+'/'+e.path.split('/').map(encodeURIComponent).join('/');
   const r=await fetch(url,{headers:{...headers,...(offset?{Range:'bytes='+offset+'-'}:{})},signal:AbortSignal.timeout(180000)});
   if(!r.ok||(offset&&r.status!==206))throw Error('Download HTTP '+r.status+' for '+e.path);
   if(offset&&!r.headers.get('content-range')?.startsWith('bytes '+offset+'-'))throw Error('Incorrect resume range');
   const out=fs.createWriteStream(part,{flags:offset?'a':'w'});let received=0;const outError=()=>{};out.on('error',outError);
   try{for await(const b of r.body){received+=b.length;ledger.actualTransferBytes+=b.length;if(received>remaining)throw Error('Response exceeds remote size');if(!out.write(b))await once(out,'drain');}out.end();await once(out,'finish');}catch(err){out.destroy();throw err;}finally{writeJSON(ledgerPath,ledger);}
  }
  if(fs.statSync(part).size!==e.size)throw Error('Incomplete '+e.path);const sha256=await hash(part);if(e.sha256&&sha256!==e.sha256)throw Error('Hash mismatch '+e.path);
  if(!e.sha256&&e.gitOid!==await gitHash(part))throw Error('Git blob hash mismatch '+e.path);
  fs.renameSync(part,dest);ledger.files[e.path]={size:e.size,sha256,verifiedAt:new Date().toISOString()};writeJSON(ledgerPath,ledger);
 }
 async function worker(){while(cursor<selected.length){const e=selected[cursor++];try{await download(e);complete++;if(complete%50===0)console.log(JSON.stringify({complete,total:selected.length,actualBytes:ledger.actualTransferBytes,rootBytes:bytes(root)}));}catch(err){errors.push({path:e.path,error:err.message});console.error(err.message);if(/budget/.test(err.message))break;}}}
 await Promise.all([worker(),worker(),worker()]);writeJSON(path.join(meta,'download-errors.json'),errors);console.log(JSON.stringify({complete,total:selected.length,errors:errors.length,actualBytes:ledger.actualTransferBytes,reservedBytes:ledger.reservedTransferBytes,rootBytes:bytes(root),freeBytes:free(root)}));if(errors.length)process.exitCode=1;
}
module.exports={select,safePath,assertBudget,CHARACTERS,LIMIT,RESERVE};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
