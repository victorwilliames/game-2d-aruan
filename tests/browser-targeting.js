(()=>{
 const check=(v,m)=>{if(!v)throw Error('Targeting: '+m);};
 const original=Object.getOwnPropertyDescriptor(navigator,'getGamepads');
 const pad={index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
 const button=(i,on)=>{pad.buttons[i]={pressed:on,value:on?1:0};};
 const step=n=>{for(let i=0;i<n;i++)update(1/120);};
 try{
  setToggle('paused',false);resetPlayer();window.dispatchEvent(new Event('focus'));Input.pollGamepad();
  const [a,b]=WorldScene.props.filter(o=>o.kind==='dummy');check(a&&b,'two real training enemies');
  Player.pos=[0,0,0];Player.vel=[0,0];Player.facing=0;Player.visualFacing=0;a.x=140;a.y=0;b.x=140;b.y=110;
  step(1);button(11,true);step(1);check(Pilot.targeting?.locked?.position[0]===140&&Pilot.targeting.locked.position[1]===0,'R3 acquires first enemy');
  const first=Pilot.targeting.locked.id;step(10);check(Pilot.targeting.locked.id===first,'holding R3 does not toggle');
  button(11,false);step(40);pad.axes[2]=.2;step(10);check(Pilot.targeting.locked.id===first,'small stick drift cannot switch');pad.axes[2]=0;step(1);pad.axes[2]=.7071;pad.axes[3]=.7071;step(1);
  check(Pilot.targeting.locked.id!==first&&Pilot.targeting.locked.position[1]===110,'right-stick deliberate switch');
  const second=Pilot.targeting.locked.id;step(40);check(Pilot.targeting.locked.id===second,'held stick does not repeat');
  pad.axes[2]=0;pad.axes[3]=0;step(1);pad.axes[0]=-1;step(20);
  const d=Pilot.targeting.locked.direction;check(Math.abs(angDiff(Player.facing,Math.atan2(d[1],d[0])))<.35,'movement faces locked enemy');
  pad.axes[0]=0;step(1);button(2,true);step(1);
  check(Player.state==='attack'&&Math.abs(angDiff(Player.facing,Math.atan2(d[1],d[0])))<.1,'X attack points at locked target');
  button(2,false);b.hp=0;b.enemyState='dead';b.stateTimer=1.8;step(1);check(!Pilot.targeting.locked,'dead target releases hard lock');
  resetPlayer();Player.pos=[0,0,0];Player.facing=0;Player.visualFacing=0;a.x=140;a.y=0;b.x=140;b.y=110;pad.axes.fill(0);step(1);
  const wall={kind:'column',x:70,y:0,r:22};WorldScene.props.push(wall);
  check(Targeting.acquire({...targetingFrame(),targets:[a]})===null,'world obstacle blocks acquisition');WorldScene.props.pop();
  button(11,true);step(1);button(11,false);step(1);check(Pilot.targeting.locked,'R3 reacquires');
  button(11,true);step(1);button(11,false);step(1);check(!Pilot.targeting.locked,'second R3 releases');
  window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyL'}));step(1);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyL'}));check(Pilot.targeting.locked,'keyboard L reacquires for visual capture');
  Game.paused=true;render();
  window.__restoreTargetingTest=()=>{if(original)Object.defineProperty(navigator,'getGamepads',original);else delete navigator.getGamepads;setToggle('paused',false);resetPlayer();};
  return {targeting:'R3 toggle, keyboard L, two targets, stick drift/switch/hold, movement, locked X attack, obstacle and death release passed',gamepad:'simulated',physical:false};
 }catch(e){if(original)Object.defineProperty(navigator,'getGamepads',original);else delete navigator.getGamepads;throw e;}
})()
