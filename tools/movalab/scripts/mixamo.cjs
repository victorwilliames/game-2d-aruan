#!/usr/bin/env node
'use strict';
// Explicit preparation is offline; catalogue commands never download/install.
const path=require('node:path');
const {createMixamoLibrary}=require('../service/mixamo-library.cjs');
const {createPreparation}=require('../service/mixamo-preparation.cjs'),taxonomy=require('../service/mixamo-taxonomy.cjs');
async function main(){
 const args=process.argv.slice(2),command=args.shift(),options={},words=[];
 while(args.length){const next=args.shift();if(next==='--favorites')options.favorites=true;else if(next.startsWith('--')){const key=next.slice(2);if(!['root','category','state','limit','offset','slot','key','pad','service'].includes(key)||!args.length)throw Error('Opção inválida: '+next);options[key]=args.shift();}else words.push(next);}
 if(command==='assign'){const base=new URL(options.service||'http://127.0.0.1:5320');if(base.protocol!=='http:'||!['127.0.0.1','localhost'].includes(base.hostname)||base.username||base.password||base.pathname!=='/'||base.search||base.hash)throw Error('Serviço deve ser HTTP local');const response=await fetch(base.origin+'/api/mixamo/assign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:words.join(' '),slot:options.slot,key:options.key,pad:options.pad})}),result=await response.json();if(!response.ok)throw Error(result.error||'Falha na atribuição');process.stdout.write(JSON.stringify(result,null,2)+'\n');return;}
 const root=options.root||process.env.MOVALAB_MIXAMO_ROOT||process.env.MIXAMO_ROOT||path.resolve(__dirname,'../../mixamo');
 if(command==='prepare'){const {prepareMotion}=await import('./prepare-mixamo.mjs');process.stdout.write(JSON.stringify(await prepareMotion(root,words.join(' ')),null,2)+'\n');return;}
 const library=createMixamoLibrary(root),data=await library.catalog();if(!data.enabled)throw Error(data.reason);
 const preparation=createPreparation(library),records=await preparation.annotate(data.motions);
 let result;
 if(command==='list'||command==='search')result={dataset:data.dataset,revision:data.revision,total:records.length,characters:data.assets.length,motions:taxonomy.search(records,words.join(' '),{...options,limit:Number(options.limit)||100,offset:Number(options.offset)||0})};
 else if(['inspect','validate','preview'].includes(command)){
  const id=words.join(' '),motion=records.find(m=>m.id===id||m.filename===id);if(!motion)throw Error('Movimento não encontrado');
  if(command==='inspect')result=motion;else{const prepared=await preparation.prepared(motion.id);result={motionId:motion.id,filename:motion.filename,key:prepared.meta.key,integrityVerifiedNow:true,numericValidation:'recorded-at-prepare',validatedAt:prepared.meta.convertedAt,validation:prepared.meta.validation,visuallyApproved:false,gameplayIntegrated:false,...(command==='preview'?{kind:'canvas-preview-source',endpoint:'/api/mixamo/motions/'+motion.id+'/prepared',open:'MovaLab → Ver prévia Canvas; a CLI não abre janela de navegador'}:{})};}
 }else throw Error('Comandos: list | search | inspect | prepare | validate | preview | assign (rascunho DEV, publicação gameplay separada).');
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
main().catch(e=>{console.error(JSON.stringify({error:e.message}));process.exitCode=1;});
