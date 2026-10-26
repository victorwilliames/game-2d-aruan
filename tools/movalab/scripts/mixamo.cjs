#!/usr/bin/env node
'use strict';
// Read-only catalogue CLI; never downloads, installs, converts or assigns implicitly.
const path=require('node:path');
const {createMixamoLibrary}=require('../service/mixamo-library.cjs');
async function main(){
 const args=process.argv.slice(2),command=args.shift(),options={},words=[];
 while(args.length){const next=args.shift();if(next==='--favorites')options.favorites=true;else if(next.startsWith('--')){const key=next.slice(2);if(!['root','category','state','limit','offset'].includes(key)||!args.length)throw Error('Opção inválida: '+next);options[key]=args.shift();}else words.push(next);}
 const root=options.root||process.env.MOVALAB_MIXAMO_ROOT||process.env.MIXAMO_ROOT||path.resolve(__dirname,'../../mixamo');
 const library=createMixamoLibrary(root),data=await library.catalog();if(!data.enabled)throw Error(data.reason);
 let result;
 if(command==='list'||command==='search')result={dataset:data.dataset,revision:data.revision,total:data.motions.length,characters:data.assets.length,motions:await library.search(words.join(' '),{...options,limit:Number(options.limit)||100,offset:Number(options.offset)||0})};
 else if(command==='inspect'){const id=words.join(' '),motion=data.motions.find(m=>m.id===id||m.filename===id);if(!motion)throw Error('Movimento não encontrado');result=motion;}
 else throw Error('Comando disponível neste marco: list | search | inspect. Preparo/cache está em implementação na #80.');
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
main().catch(e=>{console.error(JSON.stringify({error:e.message}));process.exitCode=1;});
