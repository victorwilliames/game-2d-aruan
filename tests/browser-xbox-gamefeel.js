(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);},gap=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 const original=Object.getOwnPropertyDescriptor(navigator,'getGamepads'),clock=Object.getOwnPropertyDescriptor(performance,'now');
 let ms=1000;Object.defineProperty(performance,'now',{configurable:true,value:()=>ms});
 const pad={index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
 const poll=()=>Input.pollGamepad(),button=(i,v)=>{pad.buttons[i]={pressed:v,value:v?1:0};poll();};
 const step=n=>{for(let i=0;i<n;i++){ms+=1000/120;update(1/120);}};
 const neutral=()=>{pad.axes.fill(0);pad.buttons.forEach((_,i)=>pad.buttons[i]={pressed:false,value:0});poll();};
 const start=()=>{neutral();resetPlayer();Game.paused=false;Input.suspended=false;Input.setPreset('ARUAN_FLUIDO');neutral();Player.pos=[0,100,0];};
 const report={simulatedXbox:true,physicalXbox:false,clock:'controlled performance.now; direct Gamepad API polls',releaseLatencyMeaning:'No additional classification delay after the release poll; real input polling/render latency is not measured',thresholdMs:ARUAN_GAME_FEEL.input.hold.sprintHoldThresholdMs,taps:[],modes:[]};
 const sheet=document.createElement('canvas');sheet.width=1600;sheet.height=900;const c=sheet.getContext('2d');c.fillStyle='#142b31';c.fillRect(0,0,1600,900);
 try{
  for(const mode of ['mixamo','v1']){
   MovaLocomotion.setMode(mode);
   for(const duration of [35,80,160]){start();pad.axes[0]=.7;poll();button(0,true);const down=ms;ms+=duration;poll();check(Player.state==='move'&&!Input.sprinting(),'Tap must not sprint');button(0,false);check(Player.state==='dodge'&&Player.dodgeKind==='quickstep','A tap quickstep');check(Player.resources.stamina===84,'Quickstep cost');report.taps.push({mode,pressToActionMs:ms-down,releaseToActionMs:0});}
   start();pad.axes[0]=1;step(48);check(!Player.sprint&&Math.hypot(...Player.vel)>280,'Full stick normal movement');
   const normal=Math.hypot(...Player.vel),normalName=MovaLocomotion.debug.name;button(0,true);step(20);check(!Player.sprint&&Player.state==='move','Before 170ms classification');step(1);check(Player.sprint&&Player.state==='move','Hold begins sprint without dodge');
   const firstSprintSpeed=Math.hypot(...Player.vel);check(firstSprintSpeed<310,'Sprint has progressive acceleration');step(36);const fullSprintSpeed=Math.hypot(...Player.vel);check(fullSprintSpeed>355,'Sprint reaches speed');
   const sprintName=MovaLocomotion.debug.name;button(0,false);step(1);check(Player.state==='move'&&!Player.sprint&&Player.actionInstanceId===0,'Hold release cannot quickstep');
   start();pad.axes[0]=1;step(24);button(10,true);button(10,false);step(36);const stamina=Player.resources.stamina;step(60);check(Math.abs(stamina-Player.resources.stamina-9)<1e-7,'18 stamina/sec');
   pad.axes[0]=0;step(90);check(Input.sprintToggle&&!Player.sprint&&Math.hypot(...Player.vel)===0,'L3 selection survives normal stop');const stop=Player.pos.slice();step(30);check(gap(stop,Player.pos)===0,'No autonomous displacement');
   pad.axes[0]=1;step(1);check(Player.sprint,'L3 resumes selected sprint');button(10,true);step(1);check(!Player.sprint&&!Input.sprintToggle,'Second click disables even while held');button(10,false);
   start();pad.axes[0]=1;step(24);button(0,true);step(24);Player.resources.stamina=.2;Player.resources.staminaDelay=.48;step(2);check(Player.sprintExhausted&&!Input.sprintToggle&&!Player.sprint,'Exhaustion cancels');step(160);check(!Player.sprint,'Held A cannot automatically restart after recovery');button(0,false);check(Player.state==='move','Exhausted hold release no dodge');button(0,true);step(24);check(Player.sprint,'New hold after recovery works');
   start();pad.axes[0]=1;step(24);button(10,true);button(10,false);Player.resources.stamina=.1;Player.resources.staminaDelay=.48;step(1);check(Player.sprintExhausted&&!Input.sprintToggle,'Exhaustion cancels L3');button(10,true);button(10,false);step(30);check(!Player.sprint&&Math.hypot(...Player.vel)>280,'Insufficient recovery keeps normal fast movement');
   start();pad.axes[0]=.5;step(24);const partial=Math.hypot(...Player.vel);pad.axes[0]=-.5;step(1);check(Player.vel[0]*Input.movement()[0]+Player.vel[1]*Input.movement()[1]>0,'Partial reversal first step');check(partial>30&&partial<100,'Partial analog proportional');
   for(const [idx,state]of [[1,'dodge'],[2,'attack'],[4,'guard'],[6,'parry'],[5,'attack'],[7,'attack']]){start();pad.axes[0]=.5;step(12);button(idx,true);step(1);check(Player.state===state,'Button '+idx);if(idx===1)check(Player.dodgeKind==='roll'&&Player.resources.stamina===78,'B roll and cost');if(idx===5)check(Player.attackSpec.id==='RUNE_SLAM','RB preserved');if(idx===7)check(Player.attackSpec.id==='CHARGED','RT preserved');}
   let y=0;const oldY=Input.padActions.PadY;Input.padActions.PadY=()=>y++;start();button(3,true);step(1);check(y===1,'Y contextual once');if(oldY)Input.padActions.PadY=oldY;else delete Input.padActions.PadY;
   report.modes.push({mode,normal,normalName,firstSprintSpeed,fullSprintSpeed,sprintName,partial});
   for(let col=0;col<2;col++){start();pad.axes[0]=1;step(30);if(col){button(10,true);button(10,false);}step(36);resetCamera();render();const row=mode==='mixamo'?0:1;c.drawImage(canvas,Cam.W/2-400,Cam.H/2-200,800,400,col*800,row*450+40,800,400);c.fillStyle='#e6edda';c.font='20px system-ui';c.fillText(mode+' | '+(col?'corrida selecionada':'movimento normal')+' | '+Math.hypot(...Player.vel).toFixed(0)+' u/s',col*800+20,row*450+28);}
  }
  check(report.modes[0].normalName!==report.modes[0].sprintName,'Different Mixamo walk/run presentation');
  window.__xboxSheet=sheet.toDataURL('image/jpeg',.93);start();MovaLocomotion.setMode('mixamo');pad.axes[0]=1;button(10,true);button(10,false);step(48);Game.debugOverlay=true;render();
  report.drainPerSecond=18;report.recoveryThreshold=18;report.scenarios=['A tap/hold boundary','B roll','L3 toggle while held','stop/resume','drain','exhaustion/recovery','partial/reversal','X/LB/LT/RB/RT/Y','Mixamo65/V1'];return report;
 }finally{Game.paused=true;neutral();if(original)Object.defineProperty(navigator,'getGamepads',original);else delete navigator.getGamepads;if(clock)Object.defineProperty(performance,'now',clock);else delete performance.now;}
})()

