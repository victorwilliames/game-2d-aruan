// Exercise the real browser consumer with standard Gamepad-shaped input, not physical hardware.
(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);},descriptor=Object.getOwnPropertyDescriptor(navigator,'getGamepads');
 const native=navigator.getGamepads?.bind(navigator);check(typeof native==='function','Gamepad API unavailable');
 const nativeExposed=Array.from(native()).filter(Boolean).length,pads=[],gp={index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};pads[0]=gp;
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>pads});
 const button=(i,v)=>gp.buttons[i]={pressed:v,value:v?1:0};
 const neutral=()=>{gp.axes.fill(0);gp.buttons.forEach((_,i)=>button(i,false));setToggle('paused',false);resetPlayer();window.dispatchEvent(new Event('focus'));Input.pollGamepad();};
 const step=n=>{for(let i=0;i<n;i++)update(1/120);};
 try{
  neutral();check(Input.pad.connected,'hot connect');
  for(const [x,y]of [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]){neutral();gp.axes[0]=x;gp.axes[1]=y;step(1);check(Math.abs(Math.hypot(...Input.movement())-1)<1e-12,'pad diagonal');}
  neutral();Input.activate('keyboard');for(let n=1;n<=50;n++){gp.axes[0]=n/100;step(1);}check(Input.source==='gamepad','gradual stick handoff');
  neutral();Input.activate('keyboard');gp.axes[0]=.1;gp.axes[1]=.1;step(1);check(Input.source==='keyboard'&&Math.hypot(...Input.movement())===0,'anti-drift');
  const target=WorldScene.props.find(o=>o.kind==='dummy');Input.setPreset('LEGACY');neutral();Player.pos=[target.x+90,target.y+90,0];Game.hits=0;gp.axes[3]=-1;Input.pollGamepad();
  button(0,true);step(200);check(Game.hits===1&&Player.state==='move','held A repeated');
  neutral();Player.pos=[target.x+90,target.y+90,0];Game.hits=0;gp.axes[3]=-1;Input.pollGamepad();for(let n=0;n<3;n++){button(0,true);step(1);button(0,false);step(1);}step(260);check(Game.hits===3&&Player.state==='move','pad combo');
  neutral();button(1,true);step(1);check(Player.state==='dodge','pad dodge');step(120);check(Player.state==='move','held B repeated');button(1,false);Input.pollGamepad();
  Input.setPreset('ARUAN_FLUIDO');neutral();button(0,true);step(1);check(Player.state==='dodge','ARUAN_FLUIDO pad A dodge');step(120);button(0,false);Input.pollGamepad();
  neutral();Player.pos=[target.x+90,target.y+90,0];Game.hits=0;gp.axes[3]=-1;Input.pollGamepad();button(2,true);step(200);check(Game.hits===1&&Player.state==='move','ARUAN_FLUIDO pad X attack');button(2,false);Input.pollGamepad();
  const t=Game.t;button(9,true);Input.pollGamepad();check(Game.paused,'Menu pause');Input.pollGamepad();check(Game.paused,'held Menu toggled');button(9,false);Input.pollGamepad();button(9,true);Input.pollGamepad();check(!Game.paused&&Game.t===t,'Menu resume without simulation advance');
  neutral();gp.axes[0]=1;step(1);window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD'}));step(1);check(Input.source==='keyboard','held pad stole keyboard');gp.axes[0]=.5;step(1);check(Input.source==='gamepad'&&Input.keys.size===0,'pad takeover');
  Input.activate('touch');Input.touch.move=[1,0];step(1);check(Input.source==='touch','held pad stole touch');gp.axes[0]=.8;step(1);check(Input.source==='gamepad'&&Math.hypot(...Input.touch.move)===0,'pad releases old touch');
  neutral();window.dispatchEvent(new Event('blur'));button(0,true);Input.pollGamepad();check(Input.clicks.length===0,'background pad action');window.dispatchEvent(new Event('focus'));Input.pollGamepad();check(Input.clicks.length===0,'focus ghost');
  pads[0]=null;Input.pollGamepad();check(!Input.pad.connected&&Math.hypot(...Input.movement())===0,'disconnect release');pads[0]=gp;neutral();check(Input.pad.connected,'hot reconnect');
  neutral();gp.axes[3]=-1;Input.pollGamepad();Game.paused=true;Input.suspended=false;Game.hits=0;render();
  window.__restorePadTest=()=>{if(descriptor)Object.defineProperty(navigator,'getGamepads',descriptor);else delete navigator.getGamepads;Input.pollGamepad();resetPlayer();setToggle('paused',true);};
  return {gamepad:'standard mapping, 8 directions, drift, combo, edge buttons, pause, focus, hot-plug and three-way handoff passed',nativeAPI:true,nativeDevicesExposed:nativeExposed,physicalControllerVerified:false};
 }catch(e){if(descriptor)Object.defineProperty(navigator,'getGamepads',descriptor);else delete navigator.getGamepads;throw e;}
})()
