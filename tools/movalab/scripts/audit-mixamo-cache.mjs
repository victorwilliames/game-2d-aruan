// Bounded cache adoption/latency audit. No network; never prepares the whole bank.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {prepareMotion} from './prepare-mixamo.mjs';
const require=createRequire(import.meta.url),{createCache}=require('../service/mixamo-cache.cjs');
const root=process.env.MIXAMO_ROOT||process.env.MOVALAB_MIXAMO_ROOT;if(!root)throw Error('Set MIXAMO_ROOT to the existing snapshot');
const cache=createCache(root),before=await cache.guard(0),results=[];
for(const name of ['Walking.fbx','Running.fbx','Falling_To_Roll.fbx','Hard_Landing.fbx','Punching.fbx','180_Turn_W_Briefcase.fbx','Standing_Thumbs_Up.fbx','Standing_Melee_Attack_Horizontal.fbx']){
 const prepared=await prepareMotion(root,name),started=performance.now(),read=await cache.lookup(prepared.key),loadMs=performance.now()-started;
 if(!read||read.clip.metadata.sourceSha256!==prepared.meta.sourceSha256)throw Error('Cache roundtrip failed: '+name);
 const result={name,key:prepared.key,cacheHit:prepared.cacheHit,reusedPilot:prepared.reusedPilot||prepared.meta.origin==='pilot-revalidated',gzipBytes:prepared.meta.gzipBytes,jsonBytes:prepared.meta.jsonBytes,artifactPath:prepared.meta.artifactPath||'processed/'+prepared.key+'.json.gz',loadMs,prepareMs:prepared.elapsedMs,validation:prepared.meta.validation,visuallyApproved:prepared.meta.visuallyApproved,gameplayIntegrated:prepared.meta.gameplayIntegrated};
 results.push(result);console.log(JSON.stringify({name,cacheHit:result.cacheHit,reusedPilot:result.reusedPilot,loadMs,status:result.validation.technicallyValidated?'numeric-pass':'needs-adjustment'}));
}
const after=await cache.guard(0),report={schema:'mixamo-cache-audit.v1',checkedAt:new Date().toISOString(),before,after,newStoredBytes:after.occupied-before.occupied,networkBytes:0,results,
 summary:{clips:results.length,technicallyValidated:results.filter(r=>r.validation.technicallyValidated).length,pilotArtifactsReused:results.filter(r=>r.reusedPilot).length,gzipBytes:results.reduce((s,r)=>s+r.gzipBytes,0),minLoadMs:Math.min(...results.map(r=>r.loadMs)),maxLoadMs:Math.max(...results.map(r=>r.loadMs)),visuallyApproved:0,gameplayIntegrated:0}};
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');fs.writeFileSync(path.join(project,'tools/movalab/docs/mixamo-cache-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary));
if(report.summary.technicallyValidated!==results.length)process.exitCode=1;
