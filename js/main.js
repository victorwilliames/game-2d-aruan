'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d',{alpha:false});
let fieldDirty=true,paintedView=[];
function invalidateField(){fieldDirty=true;}
function fieldViewState(){const dir=Input.pad.aim||Input.lastDirection||[Math.cos(Player.facing),Math.sin(Player.facing)];return [Game.paused,Game.debug,Game.slow,Game.hits,Game.t,Player.state,Player.combo,...Player.pos,Player.facing,Player.rig,Input.source,Input.hasMouse,...Input.mouse,...dir,Input.clicks.length,Player.pending.length,Game.debug?Input.lastEvent:0,Appearance.current,Cam.W,Cam.H,Cam.dpr,Cam.px,Cam.offX,Cam.offY];}
const Input=new Controls(canvas),WorldScene=new World(),FX=new Effects();
const Game={t:0,slow:false,debug:false,paused:false,hitstop:0,shake:0,shakeDir:[1,0],frameMs:0,frames:0,hits:0,reducedMotion:false};
const motionPreference=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
Game.reducedMotion=!!motionPreference?.matches;motionPreference?.addEventListener('change',e=>{Game.reducedMotion=e.matches;if(e.matches){Game.shake=0;Cam.shakeX=0;Cam.shakeY=0;camUpdateOffsets();}invalidateField();});
const Player={pos:[130,130,0],vel:[0,0],facing:Math.PI/4,visualFacing:Math.PI/4,turn:null,anim:new Animator(),feet:new FootPlant(),trail:new SwordTrail(),rig:null,state:'move',combo:-1,queued:false,pending:[],aim:Math.PI/4,lunge:0,footstep:0};
const CameraRig={look:[0,0]};
const names=['PORRETADA HORIZONTAL','PORRETADA DE REVÉS','PORRETADA DE CIMA'];
function resize(){const r=canvas.getBoundingClientRect(),oldDpr=Cam.dpr||1;Cam.dpr=Math.min(devicePixelRatio||1,2);if(Cam.dpr!==oldDpr)Input.mouse=Input.mouse.map(n=>n*Cam.dpr/oldDpr);Cam.cssW=r.width;Cam.cssH=r.height;Cam.W=canvas.width=Math.round(r.width*Cam.dpr);Cam.H=canvas.height=Math.round(r.height*Cam.dpr);Cam.S=clamp(Math.min(r.width/1320,r.height/850),.55,1.2);Cam.px=Cam.S*Cam.dpr;camUpdateOffsets();invalidateField();}
addEventListener('resize',resize);canvas.addEventListener('contextrestored',invalidateField);resize();
Input.onClear=()=>{Player.queued=false;Player.pending.length=0;invalidateField();};
function setToggle(name,v){Game[name]=v;invalidateField();if(name==='paused'){Input.suspended=v;Input.clear();}const b=document.querySelector('#'+name);if(b)b.setAttribute('aria-pressed',String(v));}
Input.actions={KeyB:()=>setToggle('debug',!Game.debug),KeyT:()=>setToggle('slow',!Game.slow),KeyP:()=>setToggle('paused',!Game.paused),KeyR:()=>resetPlayer(),Space:()=>beginDodge()};
for(const id of ['debug','slow','paused'])document.querySelector('#'+id).onclick=()=>setToggle(id,!Game[id]);
document.querySelector('#reset').onclick=resetPlayer;
function cameraTarget(){
  const q=pj2(Player.pos),influence=clamp(1-(Cam.cssW-400)/1800,.72,1);
  return [clamp(q[0]*influence+CameraRig.look[0],-WORLD_RADIUS*.85,WORLD_RADIUS*.85),
    clamp(q[1]*influence-35+CameraRig.look[1],-WORLD_RADIUS*Cam.sinP*.9,WORLD_RADIUS*Cam.sinP*.9)];
}
function resetCamera(){CameraRig.look=[0,0];[Cam.cx,Cam.cy]=cameraTarget();Game.shake=0;Cam.shakeX=Cam.shakeY=0;camUpdateOffsets();}
function followCamera(dt){
  const velocity=pj2([Player.vel[0],Player.vel[1],0]);
  CameraRig.look[0]=damp(CameraRig.look[0],clamp(velocity[0]*.16,-40,40),8,dt);
  CameraRig.look[1]=damp(CameraRig.look[1],clamp(velocity[1]*.16,-25,25),8,dt);
  const target=cameraTarget(),deadzone=3/Cam.px;
  for(const [i,key]of [[0,'cx'],[1,'cy']]){
    const d=target[i]-Cam[key];if(Math.abs(d)>deadzone)Cam[key]=damp(Cam[key],target[i]-Math.sign(d)*deadzone,7.5,dt);
  }
}
function resetPlayer(){Input.clear();Player.pos=[130,130,0];Player.vel=[0,0];Player.facing=Math.PI/4;Player.visualFacing=Math.PI/4;Player.turn=null;Player.state='move';Player.combo=-1;Player.queued=false;Player.pending.length=0;Player.anim=new Animator();Player.feet.reset();Player.trail=new SwordTrail();FX.clear();Game.hitstop=0;Player.rig=solveRig(Player.anim.pose,Player.pos,Player.visualFacing);resetCamera();}
function beginAttack(i,angle){const p=Player;if(i===0)p.pending.length=0;p.combo=i;p.state='attack';p.queued=p.pending.length>0;p.turn={from:p.visualFacing,to:angle,t:0,duration:.12};p.facing=angle;p.aim=angle;p.lunge=0;p.vel=[0,0];p.anim.startAttack(i);}
function beginDodge(){if(Game.paused)return;
  if(Player.state==='attack'){
    const a=Player.anim.atk;if(a.t<Math.max(a.def.cancel,a.def.activeEnd))return;
    endAttack();Input.clicks.length=0;Player.trail=new SwordTrail();
  }
  if(Player.state!=='move')return;const mv=Input.movement();if(Math.hypot(...mv)>.1)Player.facing=Math.atan2(mv[1],mv[0]);Player.turn={from:Player.visualFacing,to:Player.facing,t:0,duration:.08};Player.state='dodge';Player.anim.startDodge();Player.feet.reset();Player.vel=[0,0];}
function endAttack(){Player.state='move';Player.combo=-1;Player.queued=false;Player.pending.length=0;Player.anim.endAttack();}
function hit(i){invalidateField();const p=Player,dir=[Math.cos(p.facing),Math.sin(p.facing)];const impact=[p.pos[0]+dir[0]*86,p.pos[1]+dir[1]*86,0];let count=0;
  for(const o of WorldScene.props){if(o.kind!=='dummy')continue;const origin=i===2?impact:p.pos,dx=o.x-origin[0],dy=o.y-origin[1],d=Math.hypot(dx,dy);
    if(i===2&&((o.x-p.pos[0])*dir[0]+(o.y-p.pos[1])*dir[1])<=0)continue;
    if(d>(i===2?115:174)||(i!==2&&(dx*dir[0]+dy*dir[1])/(d||1)<.25))continue;
    o.flash=1;o.kick=1;o.hits++;count++;Game.hits++;FX.burst([o.x,o.y,90],12);}
  if(i===2){FX.impact(impact);for(const o of WorldScene.props)if(Math.hypot(o.x-impact[0],o.y-impact[1])<360)o.kick=Math.max(o.kick,.8);}
  if(count||i===2){Game.hitstop=i===2?.065:.04;Game.shake=Game.reducedMotion?0:i===2?6:3;Game.shakeDir=[(dir[1]-dir[0])*SQ1_2,(dir[0]+dir[1])*SQ1_2*.6];}
}
function update(dt){
  Input.pollGamepad();const p=Player;Game.t+=dt;const before=p.pos.slice(),mv=Input.movement(),wasDodge=p.state==='dodge';
  // Preserve up to two follow-up intents; one event cannot create extra attacks.
  while(Input.clicks.length){
    const click=Input.clicks.shift();let angle=p.facing;
    if(Array.isArray(click)){const g=screenToGround(...click);angle=Math.atan2(g[1]-p.pos[1],g[0]-p.pos[0]);}
    else if(click.direction&&Math.hypot(...click.direction)>.01)angle=Math.atan2(click.direction[1],click.direction[0]);
    if(p.state==='move')beginAttack(0,angle);
    else if(p.state==='attack'&&p.pending.length<2-p.combo)p.pending.push({angle,expires:Game.t+1.2});
  }
  while(p.pending[0]&&p.pending[0].expires<Game.t)p.pending.shift();p.queued=p.pending.length>0;
  if(p.state==='attack'){
    const a=p.anim.atk,d=a.def;
    if(p.queued&&a.t>=d.cancel&&p.combo<2){const intent=p.pending.shift();beginAttack(p.combo+1,intent.angle);}
    else if(a.t>=d.total)endAttack();
  }
  if(p.state==='dodge'){const travel=dodgeTravel(p.anim.dodge.t+dt)-dodgeTravel(p.anim.dodge.t);p.pos[0]+=Math.cos(p.facing)*travel;p.pos[1]+=Math.sin(p.facing)*travel;WorldScene.collide(p.pos);if(p.anim.dodge.t>=DODGE_DURATION){p.state='move';p.anim.endDodge();p.feet.reset();}}
  const speed=Input.moveSpeed();
  if(p.state==='move'&&!wasDodge){
    // Remove opposing momentum immediately; retain the perpendicular turn arc.
    const moving=Math.hypot(...mv)>.01,opposing=p.vel[0]*mv[0]+p.vel[1]*mv[1];
    if(moving&&opposing<0){p.vel[0]-=mv[0]*opposing;p.vel[1]-=mv[1]*opposing;}
    const response=moving?22:36;
    p.vel[0]=damp(p.vel[0],mv[0]*speed,response,dt);p.vel[1]=damp(p.vel[1],mv[1]*speed,response,dt);
    if(!moving&&Math.hypot(...p.vel)<.4)p.vel=[0,0];
    p.pos[0]+=p.vel[0]*dt;p.pos[1]+=p.vel[1]*dt;WorldScene.collide(p.pos);
    p.vel=[(p.pos[0]-before[0])/dt,(p.pos[1]-before[1])/dt];
    if(moving||Math.hypot(...p.vel)>12)p.facing+=angDiff(p.facing,Math.atan2(moving?mv[1]:p.vel[1],moving?mv[0]:p.vel[0]))*(1-Math.exp(-16*dt));
  }
  const oldT=p.anim.atk?p.anim.atk.t:0,sample=p.anim.update(dt,p.state==='move'?Math.hypot(...p.vel):0);
  if(p.state==='attack'){
    const d=p.anim.atk.def;let amount=(sample.lunge-p.lunge)*d.lunge;p.lunge=sample.lunge;const dx=Math.cos(p.facing),dy=Math.sin(p.facing);
    for(const o of WorldScene.props){if(o.kind!=='dummy')continue;const x=o.x-p.pos[0],y=o.y-p.pos[1],along=x*dx+y*dy,side=Math.abs(y*dx-x*dy);if(along>0&&side<75)amount=Math.min(amount,Math.max(0,along-92));}
    p.pos[0]+=dx*amount;p.pos[1]+=dy*amount;WorldScene.collide(p.pos);
  }
  if(p.turn){p.turn.t+=dt;const u=clamp(p.turn.t/p.turn.duration,0,1);p.visualFacing=p.turn.from+angDiff(p.turn.from,p.turn.to)*Ease.inOutSine(u);if(u===1)p.turn=null;}
  else p.visualFacing=p.facing;
  const planted=p.state==='dodge'?null:p.feet.update(sample.pose,p.pos,p.visualFacing,dt,p.state==='attack');p.rig=solveRig(sample.pose,p.pos,p.visualFacing,planted);
  p.trail.add(p.rig,dt,sample.trail);
  if(p.state==='attack'&&oldT<p.anim.atk.def.hitTime&&p.anim.atk.t>=p.anim.atk.def.hitTime)hit(p.combo);
  const dist=vDist(p.pos,before);p.footstep+=dist;if(p.state==='move'&&p.footstep>90){p.footstep=0;FX.dust(p.pos);}
  FX.update(dt);WorldScene.update(dt,Game.t,p.pos);Game.shake*=Math.exp(-dt*25);
  followCamera(dt);
  Cam.shakeX=Math.sin(Game.t*160)*Game.shake*Game.shakeDir[0];Cam.shakeY=Math.sin(Game.t*160)*Game.shake*Game.shakeDir[1];camUpdateOffsets();
}
function render(){
  const p=Player;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#122530';ctx.fillRect(0,0,Cam.W,Cam.H);
  const bg=ctx.createRadialGradient(Cam.W*.44,Cam.H*.3,20,Cam.W*.5,Cam.H*.5,Cam.W*.7);bg.addColorStop(0,'#41666a');bg.addColorStop(1,'#101e2b');ctx.fillStyle=bg;ctx.fillRect(0,0,Cam.W,Cam.H);
  setWorldTransform(ctx);WorldScene.drawGround(ctx);FX.wind(ctx,Game.t);FX.ground(ctx);
  const shadow=pj2(p.pos);ellipse(ctx,shadow[0]+6,shadow[1]+3,27,12,'#112e39b0');
  const entries=WorldScene.props.concat(WorldScene.tufts).map(o=>({depth:hDepth([o.x,o.y,0]),draw:c=>WorldScene.drawProp(c,o,Game.t)}));
  entries.push(...FX.entries());entries.push({depth:hDepth(p.pos)+6,draw(c){p.trail.draw(c,p.rig,false);drawCharacter(c,p.rig,Game.debug);p.trail.draw(c,p.rig,true);}});
  entries.sort((a,b)=>a.depth-b.depth);for(const e of entries)e.draw(ctx);FX.wordsDraw(ctx);
  ctx.setTransform(1,0,0,1,0,0);
  // Quiet vignette protects the edge composition without hiding the playable center.
  const vg=ctx.createRadialGradient(Cam.W*.5,Cam.H*.48,Cam.H*.25,Cam.W*.5,Cam.H*.5,Cam.W*.7);vg.addColorStop(0,'#10182700');vg.addColorStop(1,'#10182788');ctx.fillStyle=vg;ctx.fillRect(0,0,Cam.W,Cam.H);
  if(Input.hasMouse||Input.source==='gamepad'){let [x,y]=Input.mouse;
    if(Input.source==='gamepad'){const dir=Input.pad.aim||Input.lastDirection||[Math.cos(p.facing),Math.sin(p.facing)],length=Math.hypot(...dir)||1,projected=pj2([dir[0]/length,dir[1]/length,0]),distance=clamp(Cam.S*150+20,90,200)/(Cam.S*Math.hypot(...projected)),q=pj2([p.pos[0]+dir[0]/length*distance,p.pos[1]+dir[1]/length*distance,0]);x=clamp(q[0]*Cam.px+Cam.offX,14*Cam.dpr,Cam.W-14*Cam.dpr);y=clamp(q[1]*Cam.px+Cam.offY,14*Cam.dpr,Cam.H-14*Cam.dpr);}ctx.save();ctx.translate(x,y);ctx.scale(Cam.dpr,Cam.dpr);ctx.strokeStyle='#f5df9a';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.stroke();line(ctx,[[-12,0],[-5,0]],'#f5df9a',1.2);line(ctx,[[5,0],[12,0]],'#f5df9a',1.2);line(ctx,[[0,-12],[0,-5]],'#f5df9a',1.2);line(ctx,[[0,5],[0,12]],'#f5df9a',1.2);ctx.restore();}
  document.querySelector('#attack-name').textContent=p.state==='attack'?names[p.combo]:p.state==='dodge'?'CAMBALHOTA':'ARUAN · PRONTO';
  document.querySelector('#hit-count').textContent=String(Game.hits).padStart(2,'0');
  document.querySelectorAll('.combo-step').forEach((el,i)=>el.classList.toggle('active',p.combo===i));
  document.querySelector('#status').textContent=Game.paused?'PAUSADO':Game.slow?'CÂMERA LENTA · 25%':'CAMPO DE TREINO';
  const input=Input.diagnostics();
  document.querySelector('#diagnostics').textContent=`${Game.frameMs.toFixed(1)} ms · ${WorldScene.cacheBuilds} pintura do chão · ${WorldScene.props.filter(x=>x.kind==='oak'||x.kind==='cypress').length} árvores${Game.debug?` · ${input.source} [${input.vector.map(n=>n.toFixed(2))}] · fila ${input.buffer+Player.pending.length} · evento ${input.ageMs.toFixed(0)} ms`:""}`;
  paintedView=fieldViewState();fieldDirty=false;
}
// Fixed simulation steps make IK/cape/trail independent of display refresh rate.
let last=performance.now(),acc=0;
function loop(now){const start=performance.now(),elapsed=clamp((now-last)/1000,0,.05);last=now;Input.pollGamepad();if(Cam.dpr!==Math.min(devicePixelRatio||1,2))resize();
  if(!Game.paused){let time=elapsed*(Game.slow?.25:1);if(Game.hitstop>0){Game.hitstop=Math.max(0,Game.hitstop-elapsed);time*=.08;}acc+=time;
    while(acc>=1/120){update(1/120);acc-=1/120;}}
  // Keep polling/RAF alive in pause; only painting is skipped. Timing shows the last painted frame.
  if(!Game.paused||fieldDirty||fieldViewState().some((value,i)=>value!==paintedView[i])){render();Game.frameMs=damp(Game.frameMs,performance.now()-start,5,elapsed);}
  Game.frames++;requestAnimationFrame(loop);
}
resetPlayer();update(1/120);requestAnimationFrame(loop);
// Deliberately documented diagnostics for local regression tests; no external service.
window.Pilot={Game,Player,WorldScene,FX,step:update,render,reset:resetPlayer,attack:beginAttack};
console.info('Piloto pronto: Canvas 2D. Cache inicial:',WorldScene.buildMs.toFixed(0),'ms');
