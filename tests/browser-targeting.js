(()=>{
 const check=(v,m)=>{if(!v)throw Error('Targeting: '+m);};
 const original=Object.getOwnPropertyDescriptor(navigator,'getGamepads');
 const pad={index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
 const button=(i,on)=>{pad.buttons[i]={pressed:on,value:on?1:0};},step=n=>{for(let i=0;i<n;i++)update(1/120);};
 const release=()=>{pad.axes.fill(0);pad.buttons.forEach((_,i)=>button(i,false));Input.pollGamepad();};
 let extra=null;
 try{
  setToggle('paused',false);resetPlayer();window.dispatchEvent(new Event('focus'));release();
  const [a,b]=WorldScene.props.filter(o=>o.kind==='dummy');check(a&&b,'two training enemies');
  extra={...b,homeX:130,homeY:210,x:130,y:210};WorldScene.props.push(extra);initEnemyProp(extra,0);
  const setup=()=>{release();resetPlayer();Player.pos=[0,0,0];Player.vel=[0,0];Player.facing=0;Player.visualFacing=0;a.x=130;a.y=0;b.x=130;b.y=100;extra.x=130;extra.y=210;step(1);};
  const pixel=()=>{render();const pos=Pilot.targeting.selected.position,q=pj2([pos[0],pos[1],110]);return [...ctx.getImageData(Math.round(q[0]*Cam.px+Cam.offX),Math.round(q[1]*Cam.px+Cam.offY),1,1).data];};
  const right=()=>{pad.axes[2]=.88;pad.axes[3]=.49;};
  const rigReport=[];
  for(const mode of ['mixamo','v1']){
   MovaLocomotion.setMode(mode);setup();step(100);a.x=0;a.y=120;let maxTurn=0,maxBoneError=0,maxSlip=0,last=null;
   for(let i=0;i<240;i++){
    const beforeFacing=Player.facing;pad.axes[0]=i<120?-.55:.55;step(1);
    maxTurn=Math.max(maxTurn,Math.abs(angDiff(beforeFacing,Player.facing)));
    for(const side of ['L','R']){
     const limb=Player.rig['leg'+side],lengths=limb.lengths||[27,27];
     maxBoneError=Math.max(maxBoneError,Math.abs(vDist(limb.a,limb.b)-lengths[0]),Math.abs(vDist(limb.b,limb.c)-lengths[1]));
     const support=(mode==='mixamo'?MovaLocomotion.supports:Player.feet.feet)[side];
     if(support?.p&&last?.[side]&&support.p[2]===0&&last[side].p[2]===0&&vDist(support.p,last[side].p)<1e-8)maxSlip=Math.max(maxSlip,vDist(limb.c,last[side].c));
    }
    const supports=mode==='mixamo'?MovaLocomotion.supports:Player.feet.feet;
    last=Object.fromEntries(['L','R'].filter(s=>supports[s]?.p).map(s=>[s,{p:supports[s].p.slice(),c:Player.rig['leg'+s].c.slice()}]));
   }
   check(maxTurn<.45,'bounded body turn '+mode);check(maxBoneError<1e-5,'bone lengths '+mode);check(maxSlip<1e-5,'planted foot '+mode);
   check(Math.abs(Player.lookOffset)<=1.15+1e-9,'bounded neck and torso twist '+mode);
   setup();Player.facing=1.8;Player.visualFacing=1.8;step(6);
   const goal=Math.atan2(Pilot.targeting.selected.direction[1],Pilot.targeting.selected.direction[0]);
   const baseYaw=Math.atan2(Player.rig.base.x[1],Player.rig.base.x[0]),headYaw=Math.atan2(Player.rig.head.x[1],Player.rig.head.x[0]);
   const baseError=Math.abs(angDiff(baseYaw,goal)),headError=Math.abs(angDiff(headYaw,goal));
   check(headError<baseError,'head turns toward target during body transition '+mode+' base='+baseError+' head='+headError);
   rigReport.push({mode,maxTurn,maxBoneError,maxSlip,baseError,headError});
  }
  MovaLocomotion.setMode('mixamo');setup();Player.facing=Math.PI;Player.visualFacing=Math.PI;step(150);
  check(Pilot.targeting.mode==='soft'&&Pilot.targeting.selected.position[1]===0,'nearest automatic soft target even behind');
  check(Math.abs(angDiff(Player.facing,0))<.08,'standing faces white target');
  let color=pixel();check(color[0]>230&&color[1]>230&&color[2]>230,'soft marker white');window.__targetWhite=canvas.toDataURL('image/jpeg',.9);
  a.x=0;a.y=120;step(100);check(Math.abs(angDiff(Player.facing,Math.PI/2))<.1,'moving target tracked while idle');
  pad.axes[0]=-1;step(36);
  const moveAngle=Math.atan2(Input.movement()[1],Input.movement()[0]);
  check(Math.abs(angDiff(Player.facing,moveAngle))<.3,'locomotion body faces movement direction');
  check(Math.abs(Player.lookOffset)>.08,'head tracks nearby soft target');
  pad.axes[0]=0;setup();step(40);const first=Pilot.targeting.selected.id;right();step(1);
  check(Pilot.targeting.mode==='soft'&&Pilot.targeting.selected.id!==first&&Pilot.targeting.selected.position[1]===100,'right stick switches white target without R3');
  const second=Pilot.targeting.selected.id;step(40);check(Pilot.targeting.selected.id===second,'held stick does not repeat');
  pad.axes[2]=0;pad.axes[3]=0;step(120);check(Pilot.targeting.selected.id===second,'manual selection persists after neutral');
  check(Math.abs(angDiff(Player.facing,Math.atan2(Pilot.targeting.selected.direction[1],Pilot.targeting.selected.direction[0])))<.1,'body tracks switched target');
  button(11,true);step(1);check(Pilot.targeting.mode==='hard'&&Pilot.targeting.locked.id===second,'R3 hard locks selected target');
  color=pixel();check(color[0]>180&&color[1]<120&&color[2]<120,'hard marker red');window.__targetRed=canvas.toDataURL('image/jpeg',.9);
  step(10);check(Pilot.targeting.mode==='hard','held R3 does not toggle');button(11,false);step(40);right();step(1);
  check(Pilot.targeting.locked.position[1]===210,'hard switch to third target');pad.axes[2]=0;pad.axes[3]=0;step(1);
  button(11,true);step(1);button(11,false);step(1);check(Pilot.targeting.mode==='soft'&&Pilot.targeting.selected.position[1]===210,'second R3 returns to white on selected target');
  window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyL'}));step(1);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyL'}));check(Pilot.targeting.mode==='hard','keyboard L enables hard lock');
  window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyL'}));step(1);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyL'}));check(Pilot.targeting.mode==='soft','keyboard L releases hard lock');
  extra.hp=0;extra.enemyState='dead';extra.stateTimer=1.8;step(1);check(Pilot.targeting.selected?.position[1]!==210,'dead target replaced');
  setup();step(5);const removedId=Pilot.targeting.selected.id,removedIndex=WorldScene.props.indexOf(a);WorldScene.props.splice(removedIndex,1);step(1);
  check(Pilot.targeting.selected&&Pilot.targeting.selected.id!==removedId,'removed enemy replaced');WorldScene.props.splice(removedIndex,0,a);
  setup();step(30);button(11,true);step(1);button(11,false);step(1);const locked=Pilot.targeting.locked.id;
  const lockedEnemy=WorldScene.props.find(o=>targetIds.get(o)===locked);lockedEnemy.x=800;lockedEnemy.y=0;step(1);check(!Pilot.targeting.locked&&Pilot.targeting.lossReason==='range','hard lock drops beyond range');
  setup();button(11,true);step(1);button(11,false);step(1);const wall={kind:'column',x:65,y:0,r:25};WorldScene.props.push(wall);
  step(20);check(Pilot.targeting.locked,'temporary occlusion retained');step(30);check(!Pilot.targeting.locked&&Pilot.targeting.lossReason==='visibility','prolonged occlusion releases');WorldScene.props.pop();
  setup();step(30);const d=Pilot.targeting.selected.direction;button(2,true);step(1);check(Player.state==='attack'&&Math.abs(angDiff(Player.facing,Math.atan2(d[1],d[0])))<.1,'soft target directs X attack');button(2,false);
  setup();step(30);button(11,true);step(1);button(11,false);step(1);const hardDirection=Pilot.targeting.locked.direction;button(2,true);step(1);
  check(Player.state==='attack'&&Math.abs(angDiff(Player.facing,Math.atan2(hardDirection[1],hardDirection[0])))<.1,'hard target directs X attack');button(2,false);
  setup();step(30);button(11,true);step(1);button(11,false);step(1);pad.axes[0]=.707;pad.axes[1]=.707;step(90);
  const hardMove=Math.atan2(Input.movement()[1],Input.movement()[0]);
  check(Pilot.targeting.locked&&Math.abs(angDiff(Player.facing,hardMove))<.3,'movement follows stick direction during hard lock');
  check(Math.abs(Player.lookOffset)>.08,'head tracks hard target during movement');
  setup();step(30);button(11,true);step(1);button(11,false);step(1);pad.axes[0]=.88;pad.axes[1]=-.49;button(1,true);step(20);
  check(Player.state==='dodge'&&Player.pos[0]<-5,'B dodge travels in left-stick direction '+Player.state+' '+Player.pos);
  check(Math.abs(angDiff(Player.facing,Math.atan2(Player.dodgeDirection[1],Player.dodgeDirection[0])))<.1,'dodge body faces dodge direction');button(1,false);
  setup();step(30);button(11,true);step(1);button(11,false);step(1);pad.axes[0]=.88;pad.axes[1]=-.49;button(0,true);step(1);button(0,false);step(15);
  check(Player.state==='dodge'&&Player.dodgeKind==='quickstep'&&Player.pos[0]<-5,'A quickstep follows left stick with lock');
  check(Math.abs(angDiff(Player.facing,Math.atan2(Player.dodgeDirection[1],Player.dodgeDirection[0])))<.1,'quickstep body faces dodge direction');
  setup();step(30);button(11,true);step(1);button(11,false);step(1);button(0,true);step(1);button(0,false);step(15);
  check(Player.state==='dodge'&&Player.dodgeKind==='quickstep'&&Player.pos[0]<-5,'neutral quickstep backsteps away from target');
  setup();step(30);button(4,true);step(1);check(Player.state==='guard','LB guard');
  check(resolveIncomingHit({fromX:a.x,fromY:a.y,damage:1,staminaDamage:1,attacker:a}).outcome==='blocked','guard uses selected target orientation');
  button(4,false);step(1);button(6,true);step(12);check(Player.parryActive,'LT parry window');
  check(resolveIncomingHit({fromX:a.x,fromY:a.y,damage:1,attacker:a}).outcome==='parried','parry uses selected target orientation');button(6,false);
  setup();b.x=700;extra.x=700;step(5);Game.hits=0;button(2,true);step(1);button(2,false);a.x=340;step(120);check(Game.hits===0,'escaping target is not a guaranteed hit');
  setup();for(const e of [a,b,extra]){e.hp=0;e.enemyState='dead';e.stateTimer=20;}step(1);check(Pilot.targeting.mode==='free','no valid enemy enters free aim');
  pad.axes[0]=-1;pad.axes[3]=-1;step(45);const projected=pj2([...Player.combatDirection,0]);
  check(projected[1]<-.35&&Math.abs(projected[0])<.01,'right stick up projects to screen up');check(pj2([...Player.vel,0])[0]<-1,'left stick moves left while aiming up');
  const free=Player.combatDirection.slice();button(2,true);step(1);check(Math.abs(angDiff(Player.facing,Math.atan2(free[1],free[0])))<.1,'free aim directs attack');button(2,false);
  setup();for(const e of [a,b,extra]){e.hp=0;e.enemyState='dead';e.stateTimer=20;}step(1);pad.axes[0]=-1;pad.axes[3]=-1;step(50);pad.axes[3]=0;step(40);
  check(Player.aimHold>0&&pj2([...Player.combatDirection,0])[1]<0,'neutral stick retains free direction briefly');step(80);check(Player.aimHold===0,'free aim expires');
  Game.paused=true;Input.hasMouse=false;render();const before=ctx.getImageData(0,0,Cam.W,Cam.H).data;Input.hasMouse=true;Input.mouse=[Cam.W*.3,Cam.H*.3];render();const after=ctx.getImageData(0,0,Cam.W,Cam.H).data;
  check(before.every((v,i)=>v===after[i]),'mouse/gamepad reticle removed');check(getComputedStyle(canvas).cursor!=='none','system cursor visible');window.__targetFree=canvas.toDataURL('image/jpeg',.9);
  window.__restoreTargetingTest=()=>{if(extra){const i=WorldScene.props.indexOf(extra);if(i>=0)WorldScene.props.splice(i,1);}if(original)Object.defineProperty(navigator,'getGamepads',original);else delete navigator.getGamepads;setToggle('paused',false);resetPlayer();};
  return {targeting:'automatic white, idle tracking, strafe, three-target soft switch/persistence, R3 red/toggle, hard switch, loss, attack, free aim and no reticle',rigReport,gamepad:'simulated',physical:false};
 }catch(e){if(extra){const i=WorldScene.props.indexOf(extra);if(i>=0)WorldScene.props.splice(i,1);}if(original)Object.defineProperty(navigator,'getGamepads',original);else delete navigator.getGamepads;throw e;}
})()
