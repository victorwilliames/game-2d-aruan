'use strict';
const fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {safeSource}=require('./pack-library.cjs');
const ROOT=path.resolve(__dirname,'..');
function run(exe,args,env,timeout=90000){
 return new Promise((resolve,reject)=>{
  const child=spawn(exe,args,{windowsHide:true,shell:false,env,stdio:['ignore','pipe','pipe']});let out='',err='',done=false;
  const timer=setTimeout(()=>{child.kill();finish(Error('Conversão excedeu o limite de tempo'));},timeout);
  function finish(error,result){if(done)return;done=true;clearTimeout(timer);error?reject(error):resolve(result);}
  child.stdout.on('data',b=>{out+=b;if(out.length>1024*1024){child.kill();finish(Error('Resposta do conversor excedeu o limite'));}});
  child.stderr.on('data',b=>err=(err+b).slice(-10000));child.once('error',e=>finish(e));
  child.once('exit',code=>finish(code===0?null:Error((err||out||'Processo de conversão falhou').slice(-2000)),out));
 });
}
async function python(){
 if(process.env.MOVALAB_PYTHON){if(!fs.existsSync(process.env.MOVALAB_PYTHON))throw Error('MOVALAB_PYTHON não aponta para um executável existente');return process.env.MOVALAB_PYTHON;}
 const candidates=[path.join(ROOT,'legacy/.venv/Scripts/python.exe'),path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe')];
 if(process.platform==='win32'){
  try{const result=await run('where.exe',['python.exe'],process.env,5000);candidates.push(...result.trim().split(/\r?\n/).filter(p=>!p.includes('WindowsApps')));}catch{}
 }else return 'python3';
 const found=candidates.find(p=>fs.existsSync(p));if(!found)throw Error('Python não encontrado. Instale Python3.12 ou configure MOVALAB_PYTHON.');return found;
}
function environment(){return {...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONPATH:[path.join(ROOT,'legacy/.python'),path.join(ROOT,'.python'),process.env.PYTHONPATH].filter(Boolean).join(path.delimiter)};}
async function digest(file){return new Promise((resolve,reject)=>{const hash=crypto.createHash('sha256'),stream=fs.createReadStream(file);stream.on('data',b=>hash.update(b));stream.once('error',reject);stream.once('end',()=>resolve(hash.digest('hex')));});}
function createLegacy(workspace){
 const indexPath=path.join(workspace,'derived.json');
 const fingerprints=new Map();
 async function read(){try{const value=JSON.parse(await fsp.readFile(indexPath,'utf8'));if(value.schemaVersion!==1||!Array.isArray(value.assets))throw Error('Índice de derivados inválido');return value;}catch(e){if(e.code==='ENOENT')return {schemaVersion:1,assets:[]};throw e;}}
 async function status(){try{const exe=await python(),version=(await run(exe,['-c','import importlib.metadata; print(importlib.metadata.version("ufbx"))'],environment(),15000)).trim();return {installed:version==='0.0.5',version};}catch(e){return {installed:false,error:e.message};}}
 async function setup(){const exe=await python();await run(exe,['-m','pip','--disable-pip-version-check','install','--target',path.join(ROOT,'legacy/.python'),'--only-binary=:all:','-r',path.join(ROOT,'legacy/requirements.txt'),'--upgrade'],environment(),120000);return status();}
 async function convert(relative){
  if(typeof relative!=='string'||!relative.toLowerCase().endsWith('.fbx'))throw Error('Escolha um arquivo FBX do catálogo');
  const file=await fsp.realpath(safeSource(workspace,relative)),sourceRoot=await fsp.realpath(path.join(workspace,'sources'));
  if(!file.startsWith(sourceRoot+path.sep))throw Error('Fonte fora da biblioteca');
  const stat=await fsp.stat(file);if(stat.size>96*1024*1024)throw Error('FBX excede96MiB');
  const converterSha256=await digest(path.join(ROOT,'legacy/convert_fbx.py'));
  const hash=await digest(file),index=await read(),existing=index.assets.find(a=>a.sourcePath===relative&&a.sourceSha256===hash&&a.converterSha256===converterSha256);
  if(existing){const location=path.join(workspace,'derived',existing.relativeDerived);if(fs.existsSync(location)&&await digest(location)===existing.report.output.sha256)return {asset:existing,cached:true};}
  const dir=hash+'/'+Date.now().toString(36)+'-'+crypto.randomBytes(3).toString('hex'),destination=path.join(workspace,'derived',dir,'model.glb');
  await fsp.mkdir(path.dirname(destination),{recursive:true});
  const executable=await python();
  await run(executable,[path.join(ROOT,'legacy/convert_fbx.py'),file,destination],environment());
  const report=JSON.parse(await fsp.readFile(destination.replace(/\.glb$/,'.conversion.json'),'utf8'));
  if(report.source.sha256!==hash||await digest(file)!==hash||await digest(destination)!==report.output.sha256)throw Error('Hashes da conversão não conferem');
  const asset={id:hash,sourcePath:relative,sourceSha256:hash,converterSha256,relativeDerived:dir+'/model.glb',report};
  const found=index.assets.findIndex(a=>a.sourcePath===relative);
  if(found>=0){const {history=[],...previous}=index.assets[found];asset.history=[...history,previous];index.assets[found]=asset;}else index.assets.push(asset);
  const temporary=indexPath+'.tmp-'+process.pid;await fsp.writeFile(temporary,JSON.stringify(index,null,2)+'\n');await fsp.rename(temporary,indexPath);
  return {asset,cached:false};
 }
 async function raw(id){
  if(!/^[a-f0-9]{64}$/.test(id))throw Error('Derivado inválido');
  const asset=(await read()).assets.find(a=>a.id===id);if(!asset)throw Object.assign(Error('Derivado não encontrado'),{status:404});
  const derivedRoot=await fsp.realpath(path.join(workspace,'derived')),file=await fsp.realpath(path.resolve(derivedRoot,asset.relativeDerived));
  if(!file.startsWith(derivedRoot+path.sep))throw Error('Derivado fora da biblioteca');return file;
 }
 async function matches(asset,converted){
  if(converted.converterSha256!==await digest(path.join(ROOT,'legacy/convert_fbx.py')))return false;
  if(asset.bytes!==converted.report.source.bytes)return false;
  const key=asset.path+':'+asset.bytes+':'+asset.modifiedMs;
  if(!fingerprints.has(key))fingerprints.set(key,await digest(safeSource(workspace,asset.path)));
  if(fingerprints.size>500)fingerprints.delete(fingerprints.keys().next().value);
  return fingerprints.get(key)===converted.sourceSha256;
 }
 return {status,setup,convert,read,raw,matches};
}
module.exports={createLegacy};
