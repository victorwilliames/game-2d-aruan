const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
// Test the actual pose solver and geometry builders, without mocking their math.
const code=['math','paint','rig','character','head'].map(f=>fs.readFileSync(path.join(root,'js',f+'.js'),'utf8')).join('\n');
vm.runInNewContext(code+String.raw`
const stats={samples:0,maxBoneError:0,maxGripGap:0,maxFootClamp:0,clampedArms:0};
function check(pose,dir){
 const r=solveRig(pose,[0,0,0],dir*TAU/8);
 for(const [b,l1,l2]of [[r.armL,BODY.upper,BODY.fore],[r.armR,BODY.upper,BODY.fore],[r.legL,BODY.thigh,BODY.shin],[r.legR,BODY.thigh,BODY.shin]]){
  assert.ok([...b.a,...b.b,...b.c,...b.pole].every(Number.isFinite),'finite IK');
  stats.maxBoneError=Math.max(stats.maxBoneError,Math.abs(vDist(b.a,b.b)-l1),Math.abs(vDist(b.b,b.c)-l2));
 }
 stats.clampedArms+=Number(r.armL.clamped)+Number(r.armR.clamped);
 stats.maxFootClamp=Math.max(stats.maxFootClamp,vDist(r.legL.c,r.legL.target),vDist(r.legR.c,r.legR.target));
 const parts=[];equipmentParts(parts,r);
 if(pose.equip===1)stats.maxGripGap=Math.max(stats.maxGripGap,vDist(r.bowGrip,r.armR.c));
 
 assert.equal(r.arrowTips.length,3,'three arrows stay on the back');
 // Conservative head ellipsoid: equipment centers must remain outside the solid head.
 const headDistance=p=>{const q=vSub(p,r.head.o);return (vDot(q,r.head.x)/40)**2+(vDot(q,r.head.y)/46)**2+(vDot(q,r.head.z)/45)**2;};
 for(const tip of r.arrowTips)assert.ok(headDistance(tip)>1,'arrow fletchings intersect head');
 for(const z of [0,20,40,65])assert.ok(headDistance(fPoint(r.quiverFrame,[0,0,z]))>1,'quiver/shafts intersect head');
 // A tighter ellipsoid encloses the painted head; check the entire bow at every equip phase.
 const bowHeadDistance=p=>{const q=vSub(p,r.head.o);return (vDot(q,r.head.x)/35)**2+(vDot(q,r.head.y)/43)**2+(vDot(q,r.head.z)/42)**2;};
 for(let z=0;z<=BODY.bowLength;z+=3.5)assert.ok(bowHeadDistance(fPoint(r.bowFrame,[0,Math.sin(z/BODY.bowLength*Math.PI)*19,z]))>1,'bow intersects head during equip/strike');
 if(pose.equip===0)for(let z=0;z<=BODY.bowLength;z+=7)assert.ok(headDistance(fPoint(r.bowFrame,[0,Math.sin(z/BODY.bowLength*Math.PI)*19,z]))>1,'stowed bow intersects head');
 assert.ok(parts.every(p=>Number.isFinite(p.depth)),'finite equipment');
 assert.ok(Math.abs(vDot(r.bowFrame.z,r.bowFrame.y))<1e-6,'orthogonal bow frame');
 stats.samples++;
}
for(let d=0;d<8;d++){
 for(let i=0;i<=120;i++){
  check(walkPose(i/120),d);check(runPose(i/120),d);check(dodgePose(i/120*DODGE_DURATION),d);
  for(let a=0;a<3;a++)check(sampleAttack(a,i/120*ATTACKS[a].total).pose,d);
 }
 check(IDLE_A,d);
}
assert.ok(stats.maxBoneError<1e-6,'bone lengths are invariant');
assert.ok(stats.maxGripGap<1e-6,'bow endpoint grip follows hand');
let maxSlip=0;
for(const run of [0,1]){
 const stance=lerp(.62,.43,run),stride=lerp(20,28,run),cycle=2*stride/stance;
 let prev;
 for(let i=0;i<100;i++){
  const phase=i/100*stance,r=solveRig(locomotionPose(phase,run),[phase*cycle,0,0],0);
  if(prev)maxSlip=Math.max(maxSlip,vDist(prev,r.legL.c));prev=r.legL.c;
 }
}
stats.maxStanceSlip=maxSlip;assert.ok(maxSlip<.2,'stance foot does not skate');
for(let a=0;a<3;a++){
 const def=ATTACKS[a];assert.ok(def.hitTime<=def.cancel,'queued combo must not skip its impact');
 assert.deepEqual(sampleAttack(a,def.total+.01).pose,IDLE_A,'bow returns to back');
}
console.log(JSON.stringify(stats,null,2));
`,{console,assert,Math,performance});
const preserved=JSON.parse(fs.readFileSync(path.join(root,'docs/aruan-preservacao.json')));
for(const [file,hash]of Object.entries(preserved)){
 const bytes=fs.readFileSync(path.join(root,file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hash,'preserved: '+file);
}
console.log('OK: IK, arma, apoios, combo e módulos preservados.');

