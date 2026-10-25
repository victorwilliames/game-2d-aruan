import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {FBXLoader} from '../app/node_modules/three/examples/jsm/loaders/FBXLoader.js';
import {CompatibleFBXLoader,normalizeBinaryFooter} from '../app/fbx-loader.js';
const pack=new URL('../workspace/sources/MixamoOriginalsPack/',import.meta.url);
function bytes(file){const b=fs.readFileSync(new URL(file,pack));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}
const broken=bytes('Animations/Action Adventure Pack/idle.fbx'),copy=broken.slice(0);
assert.throws(()=>new FBXLoader().parse(broken,''),/Unknown property type/);
const repaired=new CompatibleFBXLoader().parse(broken,'');
assert.ok(repaired.animations[0].tracks.length>0);
assert.deepEqual(new Uint8Array(broken),new Uint8Array(copy),'Original alterado');
const valid=bytes('Animations/Start Pack/Start Walking.fbx');
const a=new FBXLoader().parse(valid,''),b=new CompatibleFBXLoader().parse(valid,'');
const digest=root=>createHash('sha256').update(JSON.stringify(root.animations.map(c=>{
  const {uuid,...data}=c.toJSON(c);return data;
}))).digest('hex');
assert.equal(digest(a),digest(b),'Tracks mudaram ao normalizar apenas rodapé');
assert.equal(normalizeBinaryFooter(new ArrayBuffer(10)).byteLength,10);
console.log('FBX footer PASS: 7700 com alinhamento legado, original preservado, tracks válidas idênticas');
