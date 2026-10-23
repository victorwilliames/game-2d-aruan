const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');const files=['math','paint','rig','character','head'];
const code=files.map(f=>fs.readFileSync(path.join(root,'js',f+'.js'),'utf8')).join('\n');
const checks=String.raw`
const results={samples:0,maxBoneError:0,maxGripGap:0,maxFootClamp:0,capeViolations:0,nonFinite:0,clampedArms:0,clampedLegs:0};
for(let dir=0;dir<8;dir++)for(let a=0;a<3;a++){
 const cape=new Cape(),feet=new FootPlant();
 for(let step=0;step<=150;step++){
  const t=ATTACKS[a].total*step/150,s=sampleAttack(a,t),facing=dir*TAU/8,root=[Math.cos(facing)*s.lunge*ATTACKS[a].lunge,Math.sin(facing)*s.lunge*ATTACKS[a].lunge,0];
  const ft=feet.update(s.pose,root,facing,ATTACKS[a].total/150,true),r=solveRig(s.pose,root,facing,ft);cape.update(r,ATTACKS[a].total/150);
  for(const [b,L1,L2]of [[r.armL,28,30],[r.armR,28,30],[r.legL,44,44],[r.legR,44,44]]){
   results.maxBoneError=Math.max(results.maxBoneError,Math.abs(vDist(b.a,b.b)-L1),Math.abs(vDist(b.b,b.c)-L2));
   if(![...b.a,...b.b,...b.c].every(Number.isFinite))results.nonFinite++;
  }
  results.clampedArms+=Number(r.armL.clamped)+Number(r.armR.clamped);results.clampedLegs+=Number(r.legL.clamped)+Number(r.legR.clamped);
  results.maxFootClamp=Math.max(results.maxFootClamp,vDist(r.legL.target,r.legL.c),vDist(r.legR.target,r.legR.c));
  if(s.pose.twoHand>.99)results.maxGripGap=Math.max(results.maxGripGap,vDist(r.armL.c,vAddS(r.armR.c,r.swordDir,-10)));
  for(let i=cape.C;i<cape.points.length;i++){if(cape.points[i][2]>cape.points[i%cape.C][2]-Math.floor(i/cape.C)*10+.1)results.capeViolations++;}
  results.samples++;
 }
}
let maxSupportSlip=0,supportCount=0;const fp=new FootPlant();let prev=null;
for(let i=0;i<360;i++){const x=i/120*290,pose=runPose(x/RUN_CYCLE_DIST),feet=fp.update(pose,[x,0,0],0,1/120),r=solveRig(pose,[x,0,0],0,feet);
 if(prev)for(const s of ['L','R']){const foot=s==='L'?r.legL.c:r.legR.c;if(foot[2]<9&&prev[s][2]<9){maxSupportSlip=Math.max(maxSupportSlip,vDist(foot,prev[s]));supportCount++;}}
 prev={L:r.legL.c,R:r.legR.c};}
results.runSupportMaxSlipPerStep=maxSupportSlip;results.supportSamples=supportCount;
const failures=[];if(results.nonFinite)failures.push('Non-finite rig');if(results.maxBoneError>1e-6)failures.push('Bone length');if(results.maxGripGap>2)failures.push('Two-hand grip');if(results.capeViolations)failures.push('Cape height');if(maxSupportSlip>2)failures.push('Support slip');
console.log(JSON.stringify({results,failures},null,2));if(failures.length)process.exitCode=1;
`;
vm.runInNewContext(code+'\n'+checks,{console,process,Math,performance},{filename:'rig-regression.js'});
