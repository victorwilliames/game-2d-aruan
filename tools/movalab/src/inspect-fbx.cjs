#!/usr/bin/env node
'use strict';
const path=require('node:path');
const {parseBinaryFbx,extractAnimation,sampleBoneChannels,TICKS_PER_SECOND}=require('./fbx-binary.cjs');
if(require.main===module){
 const file=process.argv[2];if(!file){console.error('Usage: node tools/movalab/src/inspect-fbx.cjs /path/to/Walking.fbx');process.exit(2)}
 try{
  const anim=extractAnimation(parseBinaryFbx(file));
  const start=anim.times[0]??0,end=anim.times.at(-1)??0;
  const summary={file:path.basename(file),fbxVersion:anim.version,bones:anim.bones.length,animationCurves:anim.curveCount,channelGroups:anim.tracks.length,sampledTimePoints:anim.times.length,durationSeconds:Number(((end-start)/TICKS_PER_SECOND).toFixed(4)),rootBones:anim.bones.filter(x=>!x.parent).map(x=>x.name),boneNames:anim.bones.map(x=>x.name),exampleSamples:{HipsStart:sampleBoneChannels(anim,0,'Hips'),HipsEnd:sampleBoneChannels(anim,(end-start)/TICKS_PER_SECOND,'Hips')}};
  console.log(JSON.stringify(summary,null,2));
 }catch(e){console.error('FBX import failed: '+e.message);process.exitCode=1;}
}
