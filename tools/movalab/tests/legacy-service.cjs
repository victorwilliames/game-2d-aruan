'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {createLegacy}=require('../service/legacy-service.cjs');
const {glbInfo}=require('../service/glb-info.cjs');
const {explore,synchronize}=require('../service/pack-library.cjs');
async function main(){
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'movalab-legacy-api-'));
 const pack=path.resolve(__dirname,'../workspace/sources/MixamoOriginalsPack');
 const files=['Characters3D/y-bot.fbx','Characters3D/theboss.fbx','Characters3D/male-realista.fbx','Characters3D/gordo.fbx','Animations/Male Locomotion Pack/Y Bot.fbx'];
 try{
  const service=createLegacy(temp),status=await service.status();assert.equal(status.installed,true,JSON.stringify(status));
  await assert.rejects(service.convert('../outside.fbx'));
  const reports=[],outputs=[];
  for(const relative of files){
   const original=await fs.readFile(path.join(pack,relative)),hash=crypto.createHash('sha256').update(original).digest('hex');
   const copy=path.join(temp,'sources',relative);await fs.mkdir(path.dirname(copy),{recursive:true});await fs.writeFile(copy,original);
   const result=await service.convert(relative);assert.equal(result.cached,false);
   assert.equal(result.asset.sourceSha256,hash);assert.equal(result.asset.report.source.fbxVersion,6100);assert.ok(result.asset.report.counts.skins>0);
   const output=await service.raw(result.asset.id),converted=await fs.readFile(output),info=glbInfo(converted);
   assert.ok(info.meshes>0&&info.bones>20);assert.equal(info.animations,0);
   assert.deepEqual(await fs.readFile(copy),original);assert.deepEqual(await fs.readFile(path.join(pack,relative)),original);
   assert.equal((await service.convert(relative)).cached,true);outputs.push(output);
   reports.push({name:relative,...info,hashes:true,cached:true});
  }
  const verify=spawnSync(process.execPath,[path.resolve(__dirname,'../legacy/verify_glb.mjs'),...outputs],{encoding:'utf8',windowsHide:true,timeout:30000});
  assert.equal(verify.status,0,verify.stderr);
  // A generated GLB copied into the user's source folder becomes a character.
  await fs.copyFile(outputs[0],path.join(temp,'sources','static.glb'));
  const assets=await explore(temp);assert.equal(assets.find(a=>a.name==='static.glb').category,'personagem');
  let index={schemaVersion:1,motions:[]};const sync=await synchronize(temp,async()=>index,async next=>index=next);
  assert.equal(sync.added,0,'Malha estática virou animação');
  const modern='AnimationsWithSkin/Start Pack/Start Walking-com-skin-mixamo.fbx';
  await fs.mkdir(path.dirname(path.join(temp,'sources',modern)),{recursive:true});await fs.copyFile(path.join(pack,modern),path.join(temp,'sources',modern));
  const animation=await service.convert(modern),animationFile=await service.raw(animation.asset.id);
  await fs.copyFile(animationFile,path.join(temp,'sources','Walking.glb'));
  const added=await synchronize(temp,async()=>index,async next=>index=next);
  assert.equal(added.added,2,'FBX/GLB animados não foram catalogados');
  const glbMotion=index.motions.find(m=>m.format==='glb');assert.ok(glbMotion&&glbMotion.duration>2&&glbMotion.bones>=50,JSON.stringify(glbMotion));
  const changed=path.join(temp,'sources',files[0]);await fs.appendFile(changed,Buffer.from([0]));
  const newAsset=(await explore(temp)).find(a=>a.path===files[0]);assert.equal(await service.matches(newAsset,(await service.read()).assets[0]),false,'Derivado antigo serviu para fonte alterada');
  assert.throws(()=>glbInfo(Buffer.alloc(32)),/inválido/);
  const report={legacyService:'PASS',reports,animatedGlb:{duration:glbMotion.duration,bones:glbMotion.bones,samples:glbMotion.samples},three:verify.stdout.trim().split('\n').map(line=>JSON.parse(line))};
  console.log(JSON.stringify({legacyService:'PASS',files:reports.length,allOriginalsUnchanged:true,glbMeshes:reports.map(r=>r.meshes)}));
  if(process.argv.includes('--report')){
   report.three.forEach(r=>delete r.file);await fs.writeFile(path.resolve(__dirname,'../docs/legacy-service-report.json'),JSON.stringify(report,null,2)+'\n');
  }
 }finally{await fs.rm(temp,{recursive:true,force:true,maxRetries:5});}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
