// Revalidate only existing artifacts after validator/solver changes. Never
// download, convert a missing clip, or overwrite an existing gzip artifact.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {prepareMotion} from './prepare-mixamo.mjs';
const require=createRequire(import.meta.url),{createMixamoLibrary}=require('../service/mixamo-library.cjs'),{createCache}=require('../service/mixamo-cache.cjs');
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
export async function revalidateCache(root){
 const library=createMixamoLibrary(root),catalog=await library.catalog();if(!catalog.enabled)throw Error(catalog.reason);const cache=createCache(root);await cache.ensure();
 const sources=new Set();for(const e of await fs.readdir(cache.directory,{withFileTypes:true})){
  if(!e.isFile()||!/^[a-f0-9]{64}\.meta\.json$/.test(e.name))continue;const file=path.join(cache.directory,e.name);if((await fs.stat(file)).size>1024*1024)continue;
  const meta=JSON.parse(await fs.readFile(file,'utf8'));if(meta.options?.loop===false&&/^[a-f0-9]{64}$/.test(meta.sourceSha256))sources.add(meta.sourceSha256);
 }
 const selected=catalog.motions.filter(m=>sources.has(m.sha256)),results=[];
 for(const m of selected){
  try{const r=await prepareMotion(root,m.id,{reuseOnly:true});if(!r.cacheHit&&!r.reusedArtifact&&!r.reusedPilot)throw Error('Unexpected conversion');results.push({id:m.id,filename:m.filename,key:r.key,cacheHit:r.cacheHit,reusedArtifact:r.reusedArtifact||r.reusedPilot||false,artifactPath:r.meta.artifactPath,clipSha256:r.meta.clipSha256,gzipSha256:r.meta.gzipSha256,validation:r.meta.validation,elapsedMs:r.elapsedMs});}
  catch(e){results.push({id:m.id,filename:m.filename,error:e.message});}
 }
 return {schema:'mixamo-cache-revalidation.v1',checkedAt:new Date().toISOString(),sourceRoot:path.resolve(root),selected:selected.length,converted:0,downloads:0,results,failures:results.filter(r=>r.error).length};
}
if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url)){
 const root=process.argv[2];if(!root)throw Error('Informe a raiz do snapshot existente');const report=await revalidateCache(root);await fs.writeFile(path.join(project,'tools/movalab/docs/mixamo-cache-revalidation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({selected:report.selected,converted:0,downloads:0,failures:report.failures}));if(report.failures)process.exitCode=1;
}
