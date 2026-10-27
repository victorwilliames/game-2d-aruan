(async()=>{
 const check=(v,m)=>{if(!v)throw Error(m);},gap=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 const original=Object.getOwnPropertyDescriptor(navigator,'getGamepads');
 const pad={id:'Xbox simulated',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
 Game.paused=true;Input.suspended=false;
 const poll=()=>Input.pollGamepad(),step=n=>{for(let i=0;i<n;i++){poll();update(1/120);}},neutral=()=>{pad.axes=[0,0,0,0];pad.buttons.forEach(b=>{b.pressed=false;b.value=0;});poll();};
 const press=(i,down)=>{pad.buttons[i].pressed=down;pad.buttons[i].value=down?1:0;poll();};
 const start=()=>{neutral();resetPlayer();Game.paused=false;Input.suspended=false;Player.pos=[0,100,0];neutral();previous=null;previousFeet={};};
 let maxBoneError=0,maxClamp=0,maxSlip=0,maxJointStep=0,lockedSamples=0,previous=null,previousFeet={};
 function inspect(){
  const r=Player.rig;
  for(const [k,a,b]of [['legL',27,27],['legR',27,27],['armL',23,22],['armR',23,22]]){const x=r[k];maxBoneError=Math.max(maxBoneError,Math.abs(gap(x.a,x.b)-a),Math.abs(gap(x.b,x.c)-b));maxClamp=Math.max(maxClamp,gap(x.c,x.target));}
  check(Object.values(r.humanoid?.joints||{}).every(j=>j.position.every(Number.isFinite)),'Finite hierarchy');
  const localHead=r.head.o.map((v,i)=>v-Player.pos[i]);if(previous)maxJointStep=Math.max(maxJointStep,gap(previous,localHead));previous=localHead;
  for(const s of ['L','R']){const c=r['leg'+s].c,old=previousFeet[s],support=MovaLocomotion.supports[s];if(old&&support&&!support.swing&&c[2]<5.000001&&old.foot[2]<5.000001&&gap(support.p,old.anchor)<1e-8){lockedSamples++;maxSlip=Math.max(maxSlip,gap(c,old.foot));}if(support)previousFeet[s]={foot:c.slice(),anchor:support.p.slice()};}
 }
 const speeds=[];
 try{
  for(const magnitude of [.2,.5,1]){start();pad.axes=[magnitude,0,0,0];step(48);speeds.push({raw:magnitude,magnitude:Math.hypot(...Input.movement()),speed:Math.hypot(...Player.vel)});inspect();}
  check(speeds[0].speed>1&&speeds[0].speed<15,'20% slow precision');check(speeds[1].speed>speeds[0].speed*3&&speeds[1].speed<100,'50% proportional');check(speeds[2].speed>280&&speeds[2].speed<291,'100% normal speed');
  start();pad.axes=[.65,0,0,0];step(24);previous=null;
  for(let i=0;i<240;i++){const a=i*Math.PI*2/240;pad.axes=[Math.cos(a)*.65,Math.sin(a)*.65,0,0];step(1);inspect();}
  check(Player.rig.humanoid&&Object.keys(Player.rig.humanoid.joints).length===65,'65 bones reach actual gameplay');
  start();pad.axes=[1,0,0,0];step(30);const old=Player.vel.slice();pad.axes=[-1,0,0,0];step(1);check(Player.vel[0]*old[0]+Player.vel[1]*old[1]<0,'Reversal responds on first step');check(Player.pivot,'Reversal pivot');
  // Partial-stick reversal must remove the entire opposing projection too.
  pad.axes=[.5,0,0,0];step(1);check(Player.vel[0]*old[0]+Player.vel[1]*old[1]>0,'Partial-stick reversal');
  neutral();step(90);check(Math.hypot(...Player.vel)===0,'Release stops');check(MovaLocomotion.debug.walkWeight===0,'No perpetual idle steps');
  // Continuous start/stop and multiple complete gait cycles, excluding fixture resets.
  start();step(20);previous=null;for(let i=0;i<600;i++){pad.axes=[i<360?.6:0,0,0,0];step(1);inspect();}
  check(maxJointStep<5,'Continuous head motion: '+maxJointStep);check(lockedSamples>20,'Real world support samples: '+JSON.stringify({lockedSamples,supports:MovaLocomotion.supports,legL:Player.rig.legL.c,legR:Player.rig.legR.c}));check(maxSlip<1e-6,'World support slips: '+maxSlip);
  check(Object.values(MovaLocomotion.supports).every(f=>!f.swing&&f.p[2]===0),'Idle feet settle on the ground');
  start();pad.axes=[1,0,0,0];step(30);press(10,true);step(36);check(Player.sprint&&Math.hypot(...Player.vel)>340,'L3 sprint');press(10,false);
  start();pad.axes=[.5,0,0,0];step(20);press(2,true);step(1);check(Player.state==='attack','Xbox X attack');check(!Player.rig.humanoid,'Combat stays native');check(Player.resources.stamina<100,'Attack stamina');
  for(const button of [0,1]){start();pad.axes=[.5,0,0,0];step(20);press(button,true);if(button===0)press(button,false);step(1);check(Player.state==='dodge','Xbox A/B dodge');}
  start();pad.axes=[.5,0,0,0];step(20);press(4,true);step(1);check(Player.state==='guard','Xbox LB block');press(4,false);
  start();pad.axes=[.5,0,0,0];step(20);press(6,true);step(1);check(Player.state==='parry','Xbox LT parry');
  start();pad.axes=[.5,0,0,0];step(20);press(5,true);step(1);check(Player.state==='attack'&&Player.attackSpec.id==='RUNE_SLAM','Xbox RB rune');
  // Same controller state, clock and location; only the visual driver changes.
  start();pad.axes=[.6,0,0,0];step(36);const before={pos:Player.pos.slice(),vel:Player.vel.slice(),resources:JSON.stringify(Player.resources)};
  document.querySelector('#locomotion-compare').click();check(gap(before.pos,Player.pos)===0&&gap(before.vel,Player.vel)===0&&before.resources===JSON.stringify(Player.resources),'Comparator cannot mutate gameplay');
  step(20);check(!Player.rig.humanoid&&MovaLocomotion.debug.fallback,'V1 fallback');document.querySelector('#locomotion-compare').click();step(20);check(Player.rig.humanoid,'Mixamo restored');
  const trajectories=[];
  for(const mode of ['v1','mixamo']){start();MovaLocomotion.setMode(mode);pad.axes=[.7,0,0,0];step(80);trajectories.push(JSON.stringify({pos:Player.pos,vel:Player.vel,resources:Player.resources}));}
  check(trajectories[0]===trajectories[1],'Animation cannot duplicate root motion or change resources');MovaLocomotion.setMode('mixamo');
  const fetchOriginal=globalThis.fetch;
  try{globalThis.fetch=(url,options)=>String(url).endsWith('mixamo-walking.aruan-clip.v1.json')?Promise.resolve(new Response('{}',{status:200})):fetchOriginal(url,options);await MovaLocomotion.init();check(!MovaLocomotion.ready,'Invalid clip is rejected');start();step(20);check(!Player.rig.humanoid&&MovaLocomotion.debug.fallback,'Invalid asset falls back to V1');}
  finally{globalThis.fetch=fetchOriginal;await MovaLocomotion.init();}
  // Side-by-side frames of the actual painter, with fixed camera and game scale.
  const out=document.createElement('canvas');out.width=1600;out.height=900;const c=out.getContext('2d');c.fillStyle='#142b31';c.fillRect(0,0,1600,900);
  for(let row=0;row<2;row++){
   start();MovaLocomotion.setMode(row?'mixamo':'v1');pad.axes=[.6,0,0,0];step(30);
   for(let col=0;col<4;col++){
    step(12);resetCamera();render();
    const sx=Cam.W/2-200,sy=Cam.H/2-180;
    c.drawImage(canvas,sx,sy,400,400,col*400,row*450+35,400,400);c.fillStyle='#e6edda';c.font='16px system-ui';c.fillText((row?'Mixamo 65':'V1')+' · '+(col*.1).toFixed(1)+' s',col*400+16,row*450+24);
   }
  }
  window.__locomotionSheet=out.toDataURL('image/jpeg',.93);
  check(maxBoneError<1e-6,'Invariant bone lengths '+maxBoneError);check(maxClamp<1e-5,'Reachable targets '+maxClamp);
  start();MovaLocomotion.setMode('mixamo');step(30);Game.debugOverlay=true;render();Game.paused=true;
  return {actualCanvas:true,simulatedXbox:true,physicalApproval:false,speeds,scenarios:['A light','B medium','C full','D circle','E reversal','F release','G L3 sprint','H X/A/B/LB/LT/RB'],maxBoneError,maxClamp,maxSlip,lockedSamples,maxJointStep,clips:['Male Locomotion Pack/idle.fbx','Male Locomotion Pack/walking.fbx','Male Locomotion Pack/standard run.fbx'],combat:'native Sprint 8',fallback:true};
 }finally{Game.paused=true;neutral();if(original)Object.defineProperty(navigator,'getGamepads',original);else delete navigator.getGamepads;}
})()
