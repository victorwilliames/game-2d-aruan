import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),runtime=require('../../../js/clip-player.js');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),context=vm.createContext({console,Math});
vm.runInContext(['math.js','rig.js','clip-player.js','humanoid-rig.js'].map(n=>fs.readFileSync(path.join(root,'js',n),'utf8')).join('\n')+'\nglobalThis.solveFull=AruanHumanoid.solve;globalThis.inspectFull=AruanHumanoid.inspect;',context);
const clip=runtime.parse(fs.readFileSync(path.join(root,'tools/movalab/workspace/exports/mixamo-walking.aruan-clip.v1.json'),'utf8'));
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
let maxLengthError=0,maxFrameError=0,maxRootDuplication=0,frames=0,fingerMotion=0;let firstFinger;
for(let direction=0;direction<8;direction++)for(let step=0;step<=120;step++){
 const time=clip.duration*step/120,facing=direction*Math.PI/4,root=[123,-45,0],rig=context.solveFull(clip,time,root,facing,{loop:false});frames++;
 for(const key of ['armL','armR','legL','legR']){const b=rig[key];maxLengthError=Math.max(maxLengthError,Math.abs(dist(b.a,b.b)-b.lengths[0]),Math.abs(dist(b.b,b.c)-b.lengths[1]));}
 for(const j of Object.values(rig.humanoid.joints)){assert.ok(j.position.every(Number.isFinite));for(const axis of ['x','y','z'])maxFrameError=Math.max(maxFrameError,Math.abs(Math.hypot(...j.frame[axis])-1));}
 maxRootDuplication=Math.max(maxRootDuplication,Math.hypot(rig.pel.o[0]-root[0],rig.pel.o[1]-root[1]));
 const finger=rig.hands.L.digits[1].joints[3].position;if(!firstFinger)firstFinger=finger.slice();fingerMotion=Math.max(fingerMotion,dist(finger,firstFinger));
 const neutral=context.solveFull(clip,time,[0,0,0],facing,{loop:false});assert.ok(dist(rig.head.o,neutral.head.o.map((v,i)=>v+root[i]))<1e-9,'Controller root must translate once');
}
assert.ok(maxLengthError<1e-6&&maxFrameError<1e-8&&maxRootDuplication<1e-8);assert.ok(fingerMotion>1);
assert.throws(()=>context.solveFull({...clip,humanoid:null},0),/sem hierarquia/);
const wrong=structuredClone(clip);wrong.humanoid.bones.find(b=>b.name==='Head').parent=0;assert.throws(()=>context.solveFull(wrong,0),/pai divergente/);
const gesture=structuredClone(clip),fingerIndex=gesture.humanoid.bones.findIndex(b=>b.name==='LeftHandIndex2');
for(const frame of gesture.humanoid.rotations)frame.splice(fingerIndex*4,4,0,0,Math.SQRT1_2,Math.SQRT1_2);
const before=context.solveFull(clip,0),after=context.solveFull(gesture,0);
assert.ok(dist(before.hands.L.digits[1].joints[3].position,after.hands.L.digits[1].joints[3].position)>1,'Finger quaternion must affect its tip independently of V1 poses');
assert.ok(dist(before.hands.L.digits[0].joints[3].position,after.hands.L.digits[0].joints[3].position)<1e-9,'Independent thumb must stay unchanged');
assert.ok(dist(before.armL.c,after.armL.c)<1e-9);
const quality=context.inspectFull(clip);assert.equal(quality.status,'numeric-pass');
const {CompatibleFBXLoader}=await import('../app/fbx-loader.js'),{convertMotion}=await import('../app/converter.js');
const input=fs.readFileSync(path.join(root,'tools/movalab/workspace/sources/MixamoOriginalsPack/AnimationsWithSkin/Start Pack/Start Walking-com-skin-mixamo.fbx'));
const source=new CompatibleFBXLoader().parse(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),'');
const fresh=await convertMotion(source,{name:'Frame grid regression',filename:'Start Walking-com-skin-mixamo.fbx',status:'test'},{loop:false});
assert.equal(fresh.times.length,177,'Float32 176-frame source must not become 177 resampling intervals');
assert.equal(context.inspectFull(fresh).status,'numeric-pass');
source.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])m.dispose();});
console.log(JSON.stringify({fullHierarchy:'numeric adapter prototype',frames,maxLengthError,maxFrameError,maxRootDuplication,fingerMotion,contacts:quality,independentFingerChannels:true,float32FrameGrid:'177 keys / 176 intervals',limitations:'Game integration and difficult-clip QA still pending; new mode not enabled automatically.'}));
