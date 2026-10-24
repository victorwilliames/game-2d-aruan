// Independent JPEG/header and curated-pair checks; no imaging dependency.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),captureRoot=path.join(root,'capturas');
function jpeg(file){
 const b=fs.readFileSync(file);assert.ok(b[0]===255&&b[1]===216&&b[2]===255,'real JPEG: '+file);
 for(let p=2;p<b.length;){
  assert.equal(b[p],255,'JPEG marker: '+file);while(b[p]===255)p++;const marker=b[p++];
  if(marker===217||marker===218)break;if(marker===1||(marker>=208&&marker<=215))continue;
  const length=b.readUInt16BE(p);assert.ok(length>=2&&p+length<=b.length,'valid JPEG segment: '+file);
  if([192,193,194].includes(marker))return {width:b.readUInt16BE(p+5),height:b.readUInt16BE(p+3)};
  p+=length;
 }
 throw Error('JPEG dimensions missing: '+file);
}
let technical=0,curated=0;const pairs=new Map();
for(const f of fs.readdirSync(path.join(captureRoot,'timelapse')).filter(f=>f.endsWith('.jpg'))){jpeg(path.join(captureRoot,'timelapse',f));technical++;}
const progression=path.join(captureRoot,'progressao');
for(const sprint of fs.readdirSync(progression).filter(f=>/^sprint-\d+$/.test(f))){
 for(const f of fs.readdirSync(path.join(progression,sprint)).filter(f=>f.endsWith('.jpg'))){
  const info=jpeg(path.join(progression,sprint,f)),m=f.match(/^(\d+)-(antes|depois)-(.+)\.jpg$/);assert.ok(m,'curated naming: '+f);assert.deepEqual(info,{width:1600,height:900},'video framing: '+f);
  const key=sprint+'/'+m[1]+'/'+m[3],pair=pairs.get(key)||new Set();pair.add(m[2]);pairs.set(key,pair);curated++;
 }
}
for(const [key,pair]of pairs)assert.equal(pair.size,2,'before/after pair: '+key);
assert.ok(pairs.size>0,'at least one curated pair');
const readme=fs.readFileSync(path.join(progression,'README.md'),'utf8');for(const match of readme.matchAll(/\]\(([^)]+\.jpg)\)/g))assert.ok(fs.existsSync(path.join(progression,match[1])),'curated README link: '+match[1]);
console.log(JSON.stringify({technicalJPEGs:technical,curatedJPEGs:curated,curatedPairs:pairs.size}));
