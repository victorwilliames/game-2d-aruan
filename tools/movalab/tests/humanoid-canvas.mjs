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
// A wrist-only channel must move/twist the bow without translating its grip.
const wristBase=structuredClone(clip),wristIndex=wristBase.humanoid.bones.findIndex(b=>b.name==='RightHand');
for(const frame of wristBase.humanoid.rotations)frame.splice(wristIndex*4,4,0,0,0,1);
for(let direction=0;direction<8;direction++){
 const baseline=context.solveFull(wristBase,.3,[37,-22,0],direction*Math.PI/4,{loop:false}),bend=structuredClone(wristBase),twist=structuredClone(wristBase);
 for(const frame of bend.humanoid.rotations)frame.splice(wristIndex*4,4,Math.SQRT1_2,0,0,Math.SQRT1_2);
 for(const frame of twist.humanoid.rotations)frame.splice(wristIndex*4,4,0,0,Math.SQRT1_2,Math.SQRT1_2);
 const b=context.solveFull(bend,.3,[37,-22,0],direction*Math.PI/4,{loop:false}),t=context.solveFull(twist,.3,[37,-22,0],direction*Math.PI/4,{loop:false});
 assert.ok(dist(baseline.armR.c,b.armR.c)<1e-9&&dist(baseline.armR.c,t.armR.c)<1e-9,'Wrist rotation must not translate the grip');
 assert.ok(dist(baseline.weaponDir,b.weaponDir)>1&&dist(baseline.weaponDir,t.weaponDir)<1e-9,'Bow direction must follow the canonical wrist');
 assert.ok(dist(baseline.weaponSide,t.weaponSide)>1,'Wrist twist must rotate the bow plane');
 for(const r of [baseline,b,t]){assert.ok(Math.abs(Math.hypot(...r.weaponDir)-1)<1e-9);assert.ok(Math.abs(r.weaponDir.reduce((s,v,i)=>s+v*r.weaponSide[i],0))<1e-9);assert.ok(Math.abs(dist(r.guard,r.tip)-98)<1e-9);}
}
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
// An irregular authored turn must survive conversion. A fixed 60Hz bake misses
// this breakpoint, even though every output quaternion remains normalized.
const T=await import('../app/node_modules/three/build/three.module.js');
const {createAruanProxy}=await import('../app/aruan-proxy.js'),{captureRest,HumanoidRetarget}=await import('../app/humanoid.js');
const rotationTrack=source.animations[0].tracks.find(t=>/Head\.quaternion$/.test(t.name));assert.ok(rotationTrack);
const keyTime=.407123,original=rotationTrack.createInterpolant().evaluate(0).slice();
rotationTrack.times=new Float32Array([0,keyTime,source.animations[0].duration]);
rotationTrack.values=new Float32Array([...original,...new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),1.2).toArray(),...original]);
const irregular=await convertMotion(source,{name:'Irregular turn',filename:'synthetic-turn.fbx',status:'test'},{loop:false});
assert.ok(irregular.times.includes(keyTime),'Preserve an authored key between uniform sample times');assert.ok(irregular.metadata.sourceKeyExtras>0);
const proxy=createAruanProxy(),target=captureRest(proxy),retarget=new HumanoidRetarget(source,proxy),mixer=new T.AnimationMixer(source),action=mixer.clipAction(source.animations[0]);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();let irregularParity=0;
for(const time of [keyTime-.001,keyTime,keyTime+.001]){
 action.enabled=true;action.paused=false;mixer.setTime(time);retarget.apply();
 const hip=target.byName.get('hips').bone.getWorldPosition(new T.Vector3()),raw=context.solveFull(irregular,time,[0,0,0],0,{loop:false});
 for(const e of target.bones){const p=e.bone.getWorldPosition(new T.Vector3());irregularParity=Math.max(irregularParity,dist([p.z-hip.z,p.x-hip.x,p.y],raw.humanoid.joints[e.bone.name].position));}
}
assert.ok(irregularParity<.005,'Irregular turn parity: '+irregularParity);mixer.stopAllAction();mixer.uncacheRoot(source);
proxy.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();o.material?.dispose();});
source.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])m.dispose();});
console.log(JSON.stringify({fullHierarchy:'numeric adapter prototype',frames,maxLengthError,maxFrameError,maxRootDuplication,fingerMotion,contacts:quality,independentFingerChannels:true,float32FrameGrid:'177 keys / 176 intervals',irregularKeyParity:irregularParity,limitations:'Game integration and difficult-clip QA still pending; new mode not enabled automatically.'}));
