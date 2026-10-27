const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {create,defaults}=require('../js/targeting.js');
const enemy=(id,x,y,extra={})=>({id,position:[x,y],alive:true,...extra});
const frame=(targets,extra={})=>({origin:[0,0],facing:[1,0],targets,...extra});
const id=s=>s.suggested?.id,locked=s=>s.locked?.id;
let cases=0;function test(name,fn){fn();cases++;console.log('OK:',name);}
test('one enemy, acquisition, direction, detached immutable snapshot',()=>{
 const t=create(),f=frame([enemy('a',100,20)]),before=JSON.stringify(f);
 assert.equal(t.acquire(f).id,'a');assert.equal(t.suggestedId,null);
 const s=t.update(1/120,f);assert.equal(id(s),'a');assert.equal(s.mode,'soft');
 assert.ok(Math.abs(t.query(f).distance-Math.hypot(100,20))<1e-12);
 assert.ok(Math.abs(Math.hypot(...s.suggested.direction)-1)<1e-12);
 assert.ok(Object.isFrozen(s.suggested.position));f.targets[0].position[0]=300;
 assert.equal(s.suggested.position[0],100);f.targets[0].position[0]=100;assert.equal(JSON.stringify(f),before);
});
test('three nearby enemies, deterministic ordering and distance preference',()=>{
 const targets=[enemy('right',130,50),enemy('center',100,0),enemy('left',120,-50)],t=create();
 assert.equal(id(t.update(0,frame(targets))),'center');
 assert.equal(create().acquire(frame([enemy('b',100,0),enemy('a',100,0)])).id,'a');
 assert.equal(create().acquire(frame([enemy('a',100,0),enemy('b',100,0)])).id,'a');
});
test('manual aim overrides facing, persistence and recent combat immediately',()=>{
 const t=create(),f=frame([enemy('front',90,0),enemy('aimed',0,140)]);
 assert.equal(id(t.update(0,f)),'front');t.recordCombat('front');
 assert.equal(id(t.update(1/120,{...f,aim:[0,1]})),'aimed');
 assert.equal(id(t.update(1/120,{...f,aim:[0,-1]})),undefined);
});
test('recent combat preference decays on simulation time',()=>{
 const t=create(),f=frame([enemy('a',100,-20),enemy('b',100,20)]);
 t.recordCombat('b');assert.equal(t.acquire(f).id,'b');t.update(3,frame([]));
 assert.equal(t.acquire(f).id,'a');assert.equal(t.recent.size,0);
});
test('attack alignment participates independently in scoring',()=>{
 const f=frame([enemy('a',100,-50),enemy('b',100,50)],{attackDirection:[1,.5]});
 assert.equal(create().acquire(f).id,'b');
});
test('rear target excluded unless explicitly aimed at; configurable cone',()=>{
 const f=frame([enemy('rear',-100,0)]),t=create();assert.equal(t.acquire(f),null);
 assert.equal(t.acquire({...f,aim:[-1,0]}).id,'rear');
 assert.equal(create({softAngle:Math.PI}).acquire(f).id,'rear');
});
test('world visibility and validity callbacks filter acquisition',()=>{
 const targets=[enemy('wall',50,0),enemy('dead',60,0,{alive:false}),enemy('invalid',65,0,{valid:false}),enemy('ok',100,0)];
 const calls=[],t=create({}, {hasLineOfSight:(from,to,target)=>{calls.push([from,to,target.id]);return target.id!=='wall';}});
 assert.equal(id(t.update(0,frame(targets))),'ok');assert.ok(calls.length>=2);
 assert.deepEqual(calls[0][0],[0,0]);
});
test('hard lock toggles, persists behind player, does not chase a new suggestion',()=>{
 const t=create(),f=frame([enemy('a',100,0),enemy('b',120,50)]);
 assert.equal(locked(t.update(0,f,{toggleLock:true})),'a');
 assert.equal(locked(t.update(.1,{...f,facing:[-1,0],aim:[0,1]})),'a');
 assert.equal(locked(t.update(0,f,{toggleLock:true})),undefined);
 assert.equal(t.snapshot(f).lossReason,'manual');
});
test('death, invalidity and removal release lock without automatic retarget',()=>{
 for(const change of ['dead','invalid','missing']){
  const t=create(),a=enemy('a',100,0),f=frame([a,enemy('b',120,0)]);t.toggleHardLock(f);
  if(change==='dead')a.alive=false;if(change==='invalid')a.valid=false;if(change==='missing')f.targets.shift();
  const s=t.update(1/120,f);assert.equal(s.locked,null);assert.equal(id(s),'b');
  assert.equal(s.lossReason,change==='missing'?'missing':'invalid-or-dead');
 }
});
test('acquire/release ranges provide hysteresis; no acquisition outside limit',()=>{
 const t=create(),a=enemy('a',100,0),f=frame([a]);t.toggleHardLock(f);
 a.position=[defaults.hardAcquireRange+1,0];assert.equal(locked(t.update(.1,f)),'a');
 a.position=[defaults.hardReleaseRange,0];assert.equal(locked(t.update(.1,f)),'a');
 a.position[0]++;assert.equal(t.update(.1,f).locked,null);assert.equal(t.lossReason,'range');
 assert.equal(t.toggleHardLock(f).locked,null);
 a.position=[400,0];assert.equal(t.acquire(f),null);assert.equal(locked(t.toggleHardLock(f)),'a');
});
test('temporary visibility loss survives, recovery resets timer, prolonged loss unlocks',()=>{
 let visible=true;const t=create({}, {hasLineOfSight:()=>visible}),f=frame([enemy('a',100,0)]);t.toggleHardLock(f);
 visible=false;let s=t.update(.2,f);assert.equal(locked(s),'a');assert.equal(s.locked.visible,false);assert.equal(s.suggested,null);
 visible=true;assert.equal(t.update(.01,f).occludedSeconds,0);
 visible=false;assert.equal(locked(t.update(.39,f)),'a');s=t.update(.01,f);assert.equal(s.locked,null);assert.equal(s.lossReason,'visibility');
 assert.equal(t.toggleHardLock(f).locked,null);
});
test('intentional world-direction switch, neutral latch, debounce and hysteresis',()=>{
 const t=create(),f=frame([enemy('a',100,0),enemy('b',100,80),enemy('c',100,160)]);t.toggleHardLock(f);
 // Stick already held during activation cannot change the new lock.
 assert.equal(locked(t.update(.3,f,{switchVector:[0,1]})),'a');
 t.update(0,f,{switchVector:[0,0]});assert.equal(locked(t.update(0,f,{switchVector:[0,1]})),'b');
 for(let i=0;i<120;i++)assert.equal(locked(t.update(1/120,f,{switchVector:[0,1]})),'b');
 t.update(0,f,{switchVector:[0,.29]});assert.equal(locked(t.update(0,f,{switchVector:[0,.71]})),'b');
 assert.equal(locked(t.update(0,f,{switchVector:[0,.73]})),'c');
 t.update(0,f,{switchVector:[0,0]});assert.equal(locked(t.update(.1,f,{switchVector:[0,-1]})),'c');
 // Failed cooldown flick is consumed, even if held past cooldown.
 assert.equal(locked(t.update(.3,f,{switchVector:[0,-1]})),'c');
 t.update(0,f,{switchVector:[0,0]});assert.equal(locked(t.update(0,f,{switchVector:[0,-1]})),'b');
});
test('small stick drift and threshold chatter never switch lock',()=>{
 const t=create(),f=frame([enemy('a',100,0),enemy('b',100,80)]);t.toggleHardLock(f);
 for(let i=0;i<1000;i++)assert.equal(locked(t.update(1/120,f,{switchVector:[.1,(i%2)*.5]})),'a');
});
test('switch skips invisible, dead, out-of-range and opposite-direction candidates',()=>{
 const t=create({}, {hasLineOfSight:(_o,_p,e)=>e.id!=='hidden'}),f=frame([enemy('a',100,0),enemy('hidden',100,20),enemy('dead',100,30,{alive:false}),enemy('far',100,700),enemy('wrong',100,-60)]);
 t.toggleHardLock(f);t.update(.3,f,{switchVector:[0,0]});assert.equal(locked(t.switchTarget(f,[0,1])),'a');
});
test('no enemies gives free state and finite unchanged manual direction',()=>{
 const t=create(),f=frame([],{aim:[0,-1]});const s=t.update(.1,f,{toggleLock:true});
 assert.equal(s.mode,'free');assert.equal(s.locked,null);assert.equal(s.suggested,null);assert.equal(t.query(f),null);
 assert.ok(Math.abs(s.assist.direction[1]+1)<1e-12);assert.equal(s.assist.correctionAngle,0);
});
test('jitter and array reorder do not oscillate; material improvement can replace',()=>{
 const t=create(),a=enemy('a',100,-5),b=enemy('b',101,5),f=frame([a,b]);assert.equal(id(t.update(0,f)),'a');
 for(let i=0;i<1200;i++){a.position[0]=100+Math.sin(i)*2;b.position[0]=100-Math.sin(i)*2;f.targets.reverse();assert.equal(id(t.update(1/120,f)),'a');}
 a.position=[330,0];b.position=[20,0];assert.equal(id(t.update(.2,f)),'b');
});
test('assist obeys angle/strength limits, manual intention and assist cone',()=>{
 for(const manual of [false,true])for(let deg=-75;deg<=75;deg++){
  const a=deg*Math.PI/180,t=create(),f=frame([enemy('a',100*Math.cos(a),100*Math.sin(a))],manual?{aim:[1,0]}:{});
  const s=t.update(0,f),limit=manual?defaults.maxManualAssistAngle:defaults.maxAssistAngle;
  assert.ok(Math.abs(s.assist.correctionAngle)<=limit+1e-12);if(Math.abs(a)>defaults.assistCone+1e-12)assert.equal(s.assist.correctionAngle,0);
  assert.ok(Math.abs(Math.hypot(...s.assist.direction)-1)<1e-12);
 }
 assert.equal(create({assistStrength:0}).update(0,frame([enemy('a',100,30)])).assist.correctionAngle,0);
});
test('custom enemy adapter, numeric zero ID, no DOM or Gamepad globals',()=>{
 const sandbox={};vm.runInNewContext(fs.readFileSync(require.resolve('../js/targeting.js'),'utf8'),sandbox);
 const t=sandbox.AruanTargeting.create({}, {getId:e=>e.key,getPosition:e=>[e.x,e.y],isAlive:e=>e.hp>0});
 const f=frame([{key:0,x:90,y:0,hp:10}]);assert.equal(locked(t.toggleHardLock(f)),0);assert.equal(t.query(f,0).id,0);
});
test('invalid configuration/frames fail explicitly; duplicate IDs rejected; reset clears history',()=>{
 for(const c of [{softRange:0},{softAngle:4},{switchReleaseThreshold:.8},{hardReleaseRange:10},{assistStrength:2},{typo:1},{recentSeconds:NaN}])assert.throws(()=>create(c));
 const t=create(),f=frame([enemy('a',100,0)]);assert.throws(()=>t.update(-1,f));assert.throws(()=>t.update(Infinity,f));
 assert.throws(()=>t.update(0,{...f,facing:[0,0]}));assert.throws(()=>t.update(0,frame([enemy('a',1,0),enemy('a',2,0)])));
 assert.throws(()=>t.update(0,f,{switchVector:[NaN,0]}));t.recordCombat('a');t.toggleHardLock(f);t.reset();
 assert.equal(t.time,0);assert.equal(t.lockedId,null);assert.equal(t.recent.size,0);
});
test('soft manual selection persists, converts to hard and falls back on death',()=>{
 const t=create({softManualSwitch:1,softAngle:Math.PI,facingWeight:0,aimWeight:0}),a=enemy('a',100,0),b=enemy('b',100,90),c=enemy('c',100,180),f=frame([a,b,c]);
 assert.equal(t.update(0,f,{switchVector:[0,0]}).selected.id,'a');
 assert.equal(t.update(.3,f,{switchVector:[0,1]}).selected.id,'b');
 for(let i=0;i<120;i++)assert.equal(t.update(1/120,f,{switchVector:[0,0]}).selected.id,'b');
 assert.equal(t.update(0,f,{toggleLock:true}).locked.id,'b');
 t.update(.3,f,{switchVector:[0,0]});assert.equal(t.update(0,f,{switchVector:[0,1]}).locked.id,'c');
 const s=t.update(0,f,{toggleLock:true});assert.equal(s.mode,'soft');assert.equal(s.selected.id,'c');
 c.alive=false;assert.notEqual(t.update(1/120,f).selected.id,'c');
});
test('public validation, explicit unlock and partition-independent visibility timeout',()=>{
 const a=enemy('a',100,0),f=frame([a]),t=create();t.toggleHardLock(f);a.alive=false;
 assert.equal(t.validate(f).locked,null);a.alive=true;t.updateSuggestion(f);t.toggleHardLock(f);t.unlock('cancelled');
 assert.equal(t.snapshot(f).locked,null);assert.equal(t.snapshot(f).lossReason,'cancelled');
 for(const steps of [Array(48).fill(1/120),Array(24).fill(1/60),[.1,.2,.1]]){
  let visible=true;const motor=create({}, {hasLineOfSight:()=>visible});motor.toggleHardLock(f);visible=false;
  for(const dt of steps)motor.update(dt,f);assert.equal(motor.snapshot(f).locked,null);assert.equal(motor.lossReason,'visibility');
 }
});
console.log(JSON.stringify({targetingScenarios:cases,jitterFrames:1200,driftFrames:1000,assistAngles:302}));
