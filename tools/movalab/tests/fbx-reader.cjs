'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {parseBinaryFbx,extractAnimation,sampleBoneChannels,TICKS_PER_SECOND}=require('../src/fbx-binary.cjs');
const {buildHierarchy,evaluateSkeleton,quatFromEulerXYZ,rotate}=require('../src/rig-v2.cjs');
assert.throws(()=>parseBinaryFbx(Buffer.from('not an FBX')),/Unsupported FBX/);
assert.deepEqual(rotate(quatFromEulerXYZ([0,0,0]),[1,2,3]),[1,2,3]);
const file=process.argv[2];if(!file){
 console.log('Unit checks OK. Optional integration: node tools/movalab/tests/fbx-reader.cjs /path/to/Walking.fbx');
 process.exit(0);
}
const anim=extractAnimation(parseBinaryFbx(fs.readFileSync(file)));
assert.equal(anim.version,7700);assert.equal(anim.bones.length,65);assert.equal(anim.curveCount,315);
assert.equal(anim.times.length,32);
assert.ok(Math.abs((anim.times.at(-1)-anim.times[0])/TICKS_PER_SECOND-1.0333)<0.0001);
assert.deepEqual(anim.bones.filter(b=>!b.parent).map(b=>b.name),['Hips']);
assert.equal(buildHierarchy(anim).length,anim.bones.length);
for(const name of ['Hips','LeftHand','RightHand','LeftUpLeg','RightUpLeg','LeftToeBase','RightToeBase'])assert.ok(anim.bones.some(x=>x.name===name),'Missing '+name);
assert.ok(Array.isArray(sampleBoneChannels(anim,0,'Hips')['Lcl Rotation']));
const duration=(anim.times.at(-1)-anim.times[0])/TICKS_PER_SECOND;
const first=evaluateSkeleton(anim,0),half=evaluateSkeleton(anim,duration/2),last=evaluateSkeleton(anim,duration);
for(const frame of [first,half,last]){
 assert.equal(Object.keys(frame).length,65);
 for(const name in frame){const joint=frame[name];assert.ok(joint.position.every(Number.isFinite));assert.ok(joint.rotation.every(Number.isFinite));if(joint.parent)assert.ok(frame[joint.parent]);}
}
const diff=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
assert.ok(diff(first.LeftFoot.position,half.LeftFoot.position)>1,'Left foot should move');
assert.ok(diff(first.RightFoot.position,half.RightFoot.position)>1,'Right foot should move');
assert.ok(diff(first.Hips.position,last.Hips.position)<0.05,'In-place cycle root should loop');
console.log(JSON.stringify({ok:true,bones:anim.bones.length,curves:anim.curveCount,samples:anim.times.length,durationSeconds:+duration.toFixed(4),motionCm:{leftFoot:+diff(first.LeftFoot.position,half.LeftFoot.position).toFixed(2),rightFoot:+diff(first.RightFoot.position,half.RightFoot.position).toFixed(2)}},null,2));
