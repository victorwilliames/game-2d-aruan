// Canonical bytes must survive a fresh checkout with .gitattributes eol=lf.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/aruan-preservacao.json')));
assert.deepEqual(Object.keys(manifest).sort(),['js/effects.js','js/math.js','js/paint.js','js/world.js','server.cjs'].sort(),'The preserved file set must remain complete');
for(const [file,expected]of Object.entries(manifest)){
 const bytes=fs.readFileSync(path.join(root,file));assert.ok(!bytes.includes(Buffer.from('\r\n')),'Normalize preserved source to LF before hashing: '+file);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected,'preserved working bytes: '+file);
 if(process.argv.includes('--git')){
  const blob=require('node:child_process').execFileSync('git',['show','HEAD:'+file],{cwd:root});
  assert.equal(crypto.createHash('sha256').update(blob).digest('hex'),expected,'preserved committed bytes: '+file);
 }
}
console.log('OK: 5 hashes canônicos LF'+(process.argv.includes('--git')?' e blobs de HEAD':'')+'.');
