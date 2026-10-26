'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),driver=require('../../../js/animation-timeline.js');
const {ATTACKS,feel}=vm.runInNewContext(['math','rig','controls'].map(f=>fs.readFileSync(path.join(root,'js',f+'.js'),'utf8')).join('\n')+'\n;({ATTACKS,feel:ARUAN_GAME_FEEL})',{console,performance,Math});
const epsilon=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
let samples=0;
for(const [i,def]of ATTACKS.entries())for(const role of [driver.roles.filter(r=>/^bow_club_attack_/.test(r))[i],'bow_club_charge','bow_club_running','bow_club_dodge_atk','riposte','rune_slam']){
 const player={state:'attack',phase:'active',combo:i,anim:{atk:{t:0,def}},attackSpec:{clip:role,hitStart:999,hitEnd:999},actionInstanceId:17,resources:{stamina:50,hp:80},pos:[10,20,0],invulnerable:false};
 const target=driver.binding({role,range:[.1,1.9],markers:{activeStart:.6,activeEnd:1.2}},{name:'Unrelated filename',duration:2,loop:false});
 let last=-Infinity;
 for(let n=0;n<=Math.ceil(def.total*120);n++){
  player.anim.atk.t=n/120;const before=JSON.stringify(player),frame=driver.resolve(player,feel),time=driver.sourceTime(frame,target);assert.equal(JSON.stringify(player),before,'Sampling must never mutate gameplay');assert.ok(time>=last&&time>=.1&&time<=1.9);last=time;samples++;
  assert.equal(frame.instanceId,17);epsilon(frame.hitStart,def.hitTime*.82);epsilon(frame.hitEnd,def.activeEnd);epsilon(frame.cancelAt,Math.max(def.cancel,def.activeEnd));
 }
 for(const [time,expected]of [[0,.1],[def.hitTime*.82,.6],[def.activeEnd,1.2],[def.total,1.9]]){player.anim.atk.t=time;epsilon(driver.sourceTime(driver.resolve(player,feel),target),expected);}
}
for(const kind of ['roll','quickstep']){
 const d=feel.dodge[kind],target=driver.binding({role:kind},{duration:1.7,loop:false});
 const player={state:'dodge',phase:'startup',dodgeKind:kind,anim:{dodge:{t:d.duration/2}},actionInstanceId:9,invulnerable:true};
 const frame=driver.resolve(player,feel);epsilon(frame.duration,d.duration);epsilon(driver.sourceTime(frame,target),.85);assert.equal(frame.invulnerable,true);assert.equal(frame.cancelAt,d.recoveryCancelAt);
}
for(const [speed,sprint,role]of [[0,false,'idle'],[100,false,'walk'],[240,false,'run'],[365,true,'sprint']]){
 const p={state:'move',vel:[speed,0],sprint,anim:{t:5.5,phase:2.25}},target=driver.binding({role},{duration:2,loop:true}),frame=driver.resolve(p,feel);assert.equal(frame.role,role);epsilon(driver.sourceTime(frame,target),role==='idle'?1.5:.5);
}
const pivot=driver.resolve({state:'move',pivot:{t:.07,duration:.14},anim:{}},feel);epsilon(driver.sourceTime(pivot,driver.binding({role:'pivot'},{duration:1,loop:false})),.5);
for(const [state,anim,role,extra]of [['parry',{parry:{t:.12}},'parry',{}],['guard',{guard:{t:.4}},'block_loop',{}],['stagger',{stagger:{t:.2}},'hurt',{staggerDuration:.65}],['stagger',{stagger:{t:.2}},'guard_break',{phase:'guard_break',staggerDuration:.95}]]){const p={state,anim,...extra},before=JSON.stringify(p),f=driver.resolve(p,feel);assert.equal(f.role,role);assert.ok(Number.isFinite(driver.sourceTime(f,driver.binding({role},{duration:1,loop:role==='block_loop'}))));assert.equal(JSON.stringify(p),before);}
assert.throws(()=>driver.binding({role:'bow_club_attack_01'},{duration:2,loop:false}),/explicitamente/);
assert.throws(()=>driver.binding({role:'walk'},{duration:2,loop:false}),/loop/);
assert.throws(()=>driver.binding({role:'walk',range:[.1,2]},{duration:2,loop:true}),/loop/);
assert.throws(()=>driver.binding({role:'parry',markers:{activeStart:.2,activeEnd:.3}},{duration:1,loop:false}),/incompatíveis/);
assert.equal(driver.resolve({state:'unhandled'},feel),null);
console.log('Native animation timeline PASS: '+JSON.stringify({samples,attacks:ATTACKS.length,sourceMarkersExplicit:true,gameplayMutations:0,rootMotionWrites:0}));
