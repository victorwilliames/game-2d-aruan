'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d',{alpha:false});
let fieldDirty=true,paintedView=[];
function invalidateField(){fieldDirty=true;}
function fieldViewState(){const dir=Input.pad.aim||Input.lastDirection||[Math.cos(Player.facing),Math.sin(Player.facing)];return [Game.paused,Game.debug,Game.slow,Game.hits,Game.t,Player.state,Player.combo,...Player.pos,Player.facing,Player.rig,Input.source,Input.hasMouse,...Input.mouse,...dir,Input.clicks.length,Player.pending.length,Game.debug?Input.lastEvent:0,Appearance.current,Cam.W,Cam.H,Cam.dpr,Cam.px,Cam.offX,Cam.offY];}
const Input=new Controls(canvas),WorldScene=new World(),FX=new Effects();
const Game={t:0,slow:false,debug:false,debugOverlay:false,paused:false,hitstop:0,shake:0,shakeDir:[1,0],frameMs:0,frames:0,hits:0,reducedMotion:false,notice:'',noticeTimer:0};
const motionPreference=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
Game.reducedMotion=!!motionPreference?.matches;motionPreference?.addEventListener('change',e=>{Game.reducedMotion=e.matches;if(e.matches){Game.shake=0;Cam.shakeX=0;Cam.shakeY=0;camUpdateOffsets();}invalidateField();});
function makeResources(){
  const c=COMBAT_RESOURCES_CONFIG;
  return {hp:c.hp.initial,maxHp:c.hp.max,stamina:c.stamina.initial,maxStamina:c.stamina.max,staminaDelay:0,focus:c.focus.initial,maxFocus:c.focus.max,poise:c.poise.initial,maxPoise:c.poise.max,poiseDelay:0};
}
const Player={pos:[130,130,0],vel:[0,0],facing:Math.PI/4,visualFacing:Math.PI/4,turn:null,pivot:null,anim:new Animator(),feet:new FootPlant(),trail:new SwordTrail(),rig:null,state:'move',phase:'idle',dodgeKind:'roll',invulnerable:false,parryActive:false,staggerDuration:0,sprint:false,moveIntent:[0,0],actionInstanceId:0,hitTargets:new Set(),prevTip:null,attackSpec:null,resources:makeResources(),combo:-1,queued:false,pending:[],aim:Math.PI/4,lunge:0,footstep:0};
const CameraRig={look:[0,0]};
const names=['PORRETADA DIAGONAL','REVÉS DE ARCO','QUEBRA-GUARDA VERTICAL'];
const ENEMY_ATTACKS={
  ENEMY_SLASH_1:{id:'ENEMY_SLASH_1',label:'CORTE HORIZONTAL',windup:.48,active:.14,recovery:.55,range:138,arcDeg:130,trackRatio:.70,damage:18,staminaDamage:26,poiseDamage:22},
  ENEMY_OVERHEAD:{id:'ENEMY_OVERHEAD',label:'GOLPE ESMAGADOR',windup:.68,active:.16,recovery:.75,range:148,arcDeg:75,trackRatio:.62,damage:32,staminaDamage:52,poiseDamage:45}
};
let TrainingEnemy=null;
function initEnemyProp(o,idx=0){
  if(o.homeX===undefined){o.homeX=o.x;o.homeY=o.y;}
  o.x=o.homeX;o.y=o.homeY;o.maxHp=180;o.hp=180;o.maxPoise=75;o.poise=75;o.poiseDelay=0;
  o.enemyState='idle';o.stateTimer=0;o.facing=Math.atan2(Player.pos[1]-o.y,Player.pos[0]-o.x);
  o.riposteUntil=0;o.attack=null;o.attackSeq=0;o.hitPlayerThisSwing=false;o.aggro=false;
  o.aiEnabled=idx===1;o.fade=1;o.flash=0;o.kick=0;
  return o;
}
function initEnemies(){
  const dummies=WorldScene.props.filter(o=>o.kind==='dummy');
  dummies.forEach((o,idx)=>initEnemyProp(o,idx));
  TrainingEnemy=dummies[1]||dummies[0]||null;
  if(typeof window!=='undefined')window.TrainingEnemy=TrainingEnemy;
}
function startEnemyAttack(e,atkId='ENEMY_SLASH_1'){
  if(!e||e.enemyState==='dead')return false;
  const spec=ENEMY_ATTACKS[atkId]||ENEMY_ATTACKS.ENEMY_SLASH_1;
  e.attack=spec;e.enemyState='windup';e.stateTimer=0;e.hitPlayerThisSwing=false;
  e.facing=Math.atan2(Player.pos[1]-e.y,Player.pos[0]-e.x);
  invalidateField();return true;
}
function updateEnemies(dt){
  for(const e of WorldScene.props){
    if(e.kind!=='dummy'||e.enemyState===undefined)continue;
    e.poiseDelay=Math.max(0,e.poiseDelay-dt);
    if(e.poiseDelay<=0&&e.enemyState!=='stagger'&&e.enemyState!=='dead')e.poise=Math.min(e.maxPoise,e.poise+20*dt);
    if(e.enemyState==='dead'){
      e.stateTimer-=dt;e.fade=clamp(e.stateTimer/1.8,0.15,1);
      if(e.stateTimer<=0){initEnemyProp(e,e===TrainingEnemy?1:0);Game.notice='GUARDIÃO RENASCEU';Game.noticeTimer=1.0;}
      continue;
    }
    if(e.enemyState==='stagger'||e.enemyState==='hit_react'){
      e.stateTimer-=dt;
      if(e.stateTimer<=0){e.enemyState=e.aggro?'approach':'idle';e.riposteUntil=0;e.poise=e.maxPoise;}
      continue;
    }
    const dx=Player.pos[0]-e.x,dy=Player.pos[1]-e.y,dist=Math.hypot(dx,dy),toPlayer=Math.atan2(dy,dx);
    if(e.enemyState==='idle'){
      if(e.aiEnabled&&e.aggro)e.enemyState='approach';
      continue;
    }
    if(e.enemyState==='approach'){
      e.facing+=angDiff(e.facing,toPlayer)*(1-Math.exp(-10*dt));
      if(dist>440){e.aggro=false;e.enemyState='idle';continue;}
      if(dist>112){
        e.x+=Math.cos(toPlayer)*92*dt;e.y+=Math.sin(toPlayer)*92*dt;
        const dHome=Math.hypot(e.x,e.y),maxR=edgeR(Math.atan2(e.y,e.x))-55;
        if(dHome>maxR){e.x*=maxR/dHome;e.y*=maxR/dHome;}
      }else{
        startEnemyAttack(e,(e.attackSeq++%2===0)?'ENEMY_SLASH_1':'ENEMY_OVERHEAD');
      }
      continue;
    }
    if(e.enemyState==='windup'){
      e.stateTimer+=dt;
      if(e.stateTimer<=e.attack.windup*e.attack.trackRatio){
        e.facing+=angDiff(e.facing,toPlayer)*(1-Math.exp(-12*dt));
      }
      if(e.stateTimer>=e.attack.windup){e.enemyState='active';e.stateTimer=0;e.kick=.85;}
      continue;
    }
    if(e.enemyState==='active'){
      e.stateTimer+=dt;
      if(!e.hitPlayerThisSwing){
        const inRange=dist<=e.attack.range,inArc=Math.abs(angDiff(e.facing,toPlayer))<=(e.attack.arcDeg*.5)*DEG;
        if(inRange&&inArc){
          e.hitPlayerThisSwing=true;
          resolveIncomingHit({fromX:e.x,fromY:e.y,damage:e.attack.damage,staminaDamage:e.attack.staminaDamage,poiseDamage:e.attack.poiseDamage,attacker:e});
        }
      }
      if(e.enemyState==='active'&&e.stateTimer>=e.attack.active){
        e.enemyState='recovery';e.stateTimer=e.attack.recovery;
      }
      continue;
    }
    if(e.enemyState==='recovery'){
      e.stateTimer-=dt;
      if(e.stateTimer<=0)e.enemyState=e.aggro?'approach':'idle';
    }
  }
}
function resize(){const r=canvas.getBoundingClientRect(),oldDpr=Cam.dpr||1;Cam.dpr=Math.min(devicePixelRatio||1,2);if(Cam.dpr!==oldDpr)Input.mouse=Input.mouse.map(n=>n*Cam.dpr/oldDpr);Cam.cssW=r.width;Cam.cssH=r.height;Cam.W=canvas.width=Math.round(r.width*Cam.dpr);Cam.H=canvas.height=Math.round(r.height*Cam.dpr);Cam.S=clamp(Math.min(r.width/1320,r.height/850),.55,1.2);Cam.px=Cam.S*Cam.dpr;camUpdateOffsets();invalidateField();}
addEventListener('resize',resize);canvas.addEventListener('contextrestored',invalidateField);resize();
Input.onClear=()=>{Player.queued=false;Player.pending.length=0;invalidateField();};
function setToggle(name,v){Game[name]=v;invalidateField();if(name==='paused'){Input.suspended=v;Input.clear();}const b=document.querySelector('#'+name);if(b)b.setAttribute('aria-pressed',String(v));}
Input.actions={KeyB:()=>setToggle('debug',!Game.debug),F3:()=>setToggle('debugOverlay',!Game.debugOverlay),KeyT:()=>setToggle('slow',!Game.slow),KeyP:()=>setToggle('paused',!Game.paused),KeyR:()=>resetPlayer(),Space:()=>beginDodge(),KeyQ:()=>beginParry(),KeyE:()=>beginRuneSkill(),KeyF:()=>beginRuneSkill()};
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
function spendStamina(cost){
  const r=Player.resources;
  if(r.stamina<=0){
    Input.lastCancelReason='insufficient_stamina';Game.notice='SEM STAMINA';Game.noticeTimer=1.0;invalidateField();return false;
  }
  r.stamina=Math.max(0,r.stamina-cost);r.staminaDelay=COMBAT_RESOURCES_CONFIG.stamina.regenDelaySec;invalidateField();return true;
}
function updateResources(dt){
  const r=Player.resources,c=COMBAT_RESOURCES_CONFIG;
  if(Game.noticeTimer>0){Game.noticeTimer=Math.max(0,Game.noticeTimer-dt);if(Game.noticeTimer===0)Game.notice='';}
  r.staminaDelay=Math.max(0,r.staminaDelay-dt);
  if(r.staminaDelay<=0&&(Player.state==='move'||Player.state==='guard')){
    const mult=Player.state==='guard'?ARUAN_GAME_FEEL.guard.staminaRegenMultiplier:1;
    r.stamina=Math.min(r.maxStamina,r.stamina+c.stamina.regenPerSec*mult*dt);
  }
  r.poiseDelay=Math.max(0,r.poiseDelay-dt);
  if(r.poiseDelay<=0&&Player.state!=='stagger')r.poise=Math.min(r.maxPoise,r.poise+c.poise.regenPerSec*dt);
}
function resetPlayer(){Input.clear();Player.pos=[130,130,0];Player.vel=[0,0];Player.facing=Math.PI/4;Player.visualFacing=Math.PI/4;Player.turn=null;Player.pivot=null;Player.state='move';Player.phase='idle';Player.dodgeKind='roll';Player.invulnerable=false;Player.parryActive=false;Player.staggerDuration=0;Player.sprint=false;Player.moveIntent=[0,0];Player.actionInstanceId=0;Player.hitTargets.clear();Player.prevTip=null;Player.attackSpec=null;Player.resources=makeResources();Player.combo=-1;Player.queued=false;Player.pending.length=0;Player.anim=new Animator();Player.feet.reset();Player.trail=new SwordTrail();FX.clear();Game.hitstop=0;Game.notice='';Game.noticeTimer=0;initEnemies();Player.rig=solveRig(Player.anim.pose,Player.pos,Player.visualFacing);resetCamera();}
function findRiposteTarget(){
  for(const o of WorldScene.props){
    if(o.riposteUntil&&o.riposteUntil>Game.t&&Math.hypot(o.x-Player.pos[0],o.y-Player.pos[1])<=175)return o;
  }
  return null;
}
function beginAttack(i,angle,specOverride=null){
  if(Game.paused||Player.state==='stagger'||Player.state==='parry')return false;
  const p=Player,riposteTarget=!specOverride&&i===0?findRiposteTarget():null;
  const spec=riposteTarget?ACTION_SPECS.RIPOSTE:(specOverride||ACTION_SPECS['LIGHT_'+(i+1)]||ACTION_SPECS.LIGHT_1);
  if(!spendStamina(spec.staminaCost??14))return false;
  if(riposteTarget){
    angle=Math.atan2(riposteTarget.y-p.pos[1],riposteTarget.x-p.pos[0]);
    i=2;riposteTarget.riposteUntil=0;Game.notice='RIPOSTE CRÍTICO!';Game.noticeTimer=1.2;
  }
  if(p.state==='guard')p.anim.endGuard();
  if(i===0)p.pending.length=0;p.actionInstanceId++;p.hitTargets.clear();p.prevTip=null;p.combo=i;p.attackSpec=spec;p.state='attack';p.phase='windup';p.invulnerable=Boolean(spec.invulnerable);p.parryActive=false;p.queued=p.pending.length>0;p.turn={from:p.visualFacing,to:angle,t:0,duration:.12};p.facing=angle;p.aim=angle;p.lunge=0;p.vel=[0,0];p.anim.startAttack(i);return true;
}
function beginGuard(){
  if(Game.paused||Player.state==='stagger'||Player.state==='parry'||Player.state==='dodge')return false;
  if(Player.state==='attack'){
    const a=Player.anim.atk,minCancel=Math.max(a.def.cancel,a.def.activeEnd);
    if(a.t<minCancel){Input.pushIntent('guard',{down:true});Input.lastCancelReason='buffered_guard_until_cancel';return false;}
    endAttack();
  }
  if(Player.state==='guard')return true;
  Player.pending.length=0;Player.queued=false;Input.clicks.length=0;Input.clearIntents(['attack','charged_attack','guard']);
  Player.actionInstanceId++;Player.state='guard';Player.phase='guard_loop';Player.invulnerable=false;Player.parryActive=false;
  Player.anim.startGuard();return true;
}
function endGuard(){
  if(Player.state!=='guard')return;
  Player.state='move';Player.phase='idle';Player.anim.endGuard();
}
function beginParry(fromBuffer=false){
  if(Game.paused||Player.state==='stagger'||Player.state==='parry')return false;
  Player.pending.length=0;Player.queued=false;Input.clicks.length=0;Input.clearIntents(['attack','charged_attack']);
  if(Player.state==='attack'){
    const a=Player.anim.atk,minCancel=Math.max(a.def.cancel,a.def.activeEnd);
    if(a.t<minCancel){if(!fromBuffer){Input.pushIntent('parry',{});Input.lastCancelReason='buffered_parry_until_cancel';}return false;}
    endAttack();
  }else if(Player.state==='dodge'){
    const spec=ARUAN_GAME_FEEL.dodge[Player.dodgeKind||'roll'];
    if(!Player.anim.dodge||Player.anim.dodge.t<spec.recoveryCancelAt){if(!fromBuffer)Input.pushIntent('parry',{});return false;}
    Player.state='move';Player.anim.endDodge();
  }else if(Player.state==='guard'){
    Player.state='move';Player.anim.endGuard();
  }
  if(!spendStamina(ARUAN_GAME_FEEL.parry.staminaCost))return false;
  Input.clearIntents(['parry','attack','charged_attack']);
  Player.actionInstanceId++;Player.state='parry';Player.phase='startup';Player.invulnerable=false;Player.parryActive=false;Player.vel=[0,0];
  Player.anim.startParry();return true;
}
function beginRuneSkill(){
  if(Game.paused||Player.state==='stagger'||Player.state==='parry')return false;
  const spec=ACTION_SPECS.RUNE_SLAM,r=Player.resources;
  if(r.focus<(spec.focusCost||30)){Input.lastCancelReason='insufficient_focus';Game.notice='FOCO INSUFICIENTE';Game.noticeTimer=1.0;return false;}
  if(Player.state==='guard')endGuard();
  if(Player.state!=='move')return false;
  if(!spendStamina(spec.staminaCost))return false;
  r.focus=Math.max(0,r.focus-(spec.focusCost||30));Game.notice='RUNA · QUEBRA-TERRA';Game.noticeTimer=1.2;
  return beginAttack(2,Player.facing,spec);
}
function resolveIncomingHit(atk={}){
  const p=Player,r=p.resources;
  if(p.invulnerable){Input.lastCancelReason='evaded_by_iframes';return {outcome:'evaded',damage:0};}
  const ax=(atk.fromX??(p.pos[0]+Math.cos(p.facing)*60))-p.pos[0],ay=(atk.fromY??(p.pos[1]+Math.sin(p.facing)*60))-p.pos[1],alen=Math.hypot(ax,ay)||1;
  const dot=(ax/alen)*Math.cos(p.facing)+(ay/alen)*Math.sin(p.facing);
  const inFrontCone=dot>=Math.cos(ARUAN_GAME_FEEL.guard.guardAngleDegrees*.5*DEG);
  if(p.state==='parry'&&p.parryActive&&inFrontCone){
    r.focus=Math.min(r.maxFocus,r.focus+ARUAN_GAME_FEEL.parry.focusGain);
    Game.hitstop=.075;Game.notice='PARRY PERFEITO!';Game.noticeTimer=1.4;
    if(atk.attacker){atk.attacker.enemyState='stagger';atk.attacker.stateTimer=ARUAN_GAME_FEEL.parry.enemyStaggerSec;atk.attacker.riposteUntil=Game.t+ARUAN_GAME_FEEL.parry.riposteWindowSec;atk.attacker.flash=1;}
    FX.burst([p.pos[0]+Math.cos(p.facing)*42,p.pos[1]+Math.sin(p.facing)*42,60],18);
    invalidateField();return {outcome:'parried',damage:0};
  }
  if(p.state==='guard'&&inFrontCone){
    const stamCost=(atk.staminaDamage??28)*ARUAN_GAME_FEEL.guard.staminaCostFactor;
    const chip=Math.round((atk.damage??20)*ARUAN_GAME_FEEL.guard.chipDamageMultiplier);
    r.stamina=Math.max(0,r.stamina-stamCost);r.staminaDelay=COMBAT_RESOURCES_CONFIG.stamina.regenDelaySec;
    r.hp=Math.max(0,r.hp-chip);
    if(r.stamina<=0){
      p.anim.endGuard();p.state='stagger';p.phase='guard_break';p.staggerDuration=ARUAN_GAME_FEEL.guard.guardBreakRecoverySec;
      p.anim.startStagger(p.staggerDuration);p.vel=[0,0];Game.hitstop=.06;Game.notice='GUARDA QUEBRADA!';Game.noticeTimer=1.5;
      invalidateField();return {outcome:'guard_break',damage:chip};
    }
    if(p.anim.guard)p.anim.guard.recoil=1;
    Game.hitstop=.035;Game.notice='BLOQUEADO';Game.noticeTimer=.9;
    FX.burst([p.pos[0]+Math.cos(p.facing)*36,p.pos[1]+Math.sin(p.facing)*36,52],8);
    invalidateField();return {outcome:'blocked',damage:chip};
  }
  const dmg=atk.damage??20,poiseDmg=atk.poiseDamage??25;
  r.hp=Math.max(0,r.hp-dmg);r.poise=Math.max(0,r.poise-poiseDmg);r.poiseDelay=COMBAT_RESOURCES_CONFIG.poise.regenDelaySec;
  if(r.poise<=0||p.state==='parry'){
    r.poise=r.maxPoise;p.state='stagger';p.phase='hit_react';p.staggerDuration=.42;p.parryActive=false;p.anim.startStagger(.42);p.vel=[0,0];
  }
  Game.hitstop=.045;Game.notice='ATINGIDO';Game.noticeTimer=.9;invalidateField();
  return {outcome:'hit',damage:dmg};
}
function beginDodge(kind='roll',fromBuffer=false){if(Game.paused||Player.state==='stagger')return false;
  const dodgeKind=kind==='quickstep'?'quickstep':'roll';
  // Defensive priority: pressing dodge immediately cancels any queued follow-up attack and overrides guard (S27).
  Player.pending.length=0;Player.queued=false;Input.clicks.length=0;Input.clearIntents(['attack','charged_attack']);
  if(Player.state==='parry')return false;
  if(Player.state==='guard'){Player.state='move';Player.anim.endGuard();Input.lastCancelReason='dodge_cancelled_guard';}
  if(Player.state==='attack'){
    const a=Player.anim.atk,minCancel=Math.max(a.def.cancel,a.def.activeEnd);
    if(a.t<minCancel){
      if(!fromBuffer){
        Input.pushIntent('dodge',{kind:dodgeKind,direction:Input.movement()});
        Input.lastCancelReason='buffered_until_cancel_window';
      }
      return false;
    }
    endAttack();Input.clearIntents(['dodge']);Input.lastCancelReason='dodge_cancelled_attack_recovery';Player.trail=new SwordTrail();
  }else if(Player.state==='dodge'){
    const spec=ARUAN_GAME_FEEL.dodge[Player.dodgeKind||'roll'];
    if(!Player.anim.dodge||Player.anim.dodge.t<spec.recoveryCancelAt){
      if(!fromBuffer){Input.pushIntent('dodge',{kind:dodgeKind,direction:Input.movement()});Input.lastCancelReason='buffered_in_dodge';}
      return false;
    }
    Player.state='move';Player.anim.endDodge();
  }
  if(Player.state!=='move')return false;
  const spec=ARUAN_GAME_FEEL.dodge[dodgeKind];
  if(!spendStamina(spec.staminaCost))return false;
  Input.clearIntents(['dodge','attack','charged_attack']);
  const mv=Input.movement();if(Math.hypot(...mv)>.1)Player.facing=Math.atan2(mv[1],mv[0]);
  Player.actionInstanceId++;Player.hitTargets.clear();Player.prevTip=null;Player.turn={from:Player.visualFacing,to:Player.facing,t:0,duration:.08};
  Player.state='dodge';Player.phase='startup';Player.dodgeKind=dodgeKind;Player.invulnerable=false;Player.parryActive=false;
  Player.anim.startDodge(dodgeKind);Player.feet.reset();Player.vel=[0,0];return true;}
function endAttack(){Player.state='move';Player.phase='idle';Player.combo=-1;Player.attackSpec=null;Player.hitTargets.clear();Player.prevTip=null;Player.queued=false;Player.pending.length=0;Player.anim.endAttack();}
function distToSegment2D(px,py,ax,ay,bx,by){
  const abx=bx-ax,aby=by-ay,len2=abx*abx+aby*aby;
  const u=len2>1e-6?clamp(((px-ax)*abx+(py-ay)*aby)/len2,0,1):0;
  return Math.hypot(px-(ax+abx*u),py-(ay+aby*u));
}
function hit(i,directCall=true){
  if(directCall)Player.hitTargets.clear();
  const p=Player,dir=[Math.cos(p.facing),Math.sin(p.facing)];
  const guard=p.rig?.guard||[p.pos[0]+dir[0]*18,p.pos[1]+dir[1]*18,45];
  const tip=p.rig?.tip||[p.pos[0]+dir[0]*98,p.pos[1]+dir[1]*98,45];
  const impact=[p.pos[0]+dir[0]*86,p.pos[1]+dir[1]*86,0];let count=0;
  for(const o of WorldScene.props){
    if(o.kind!=='dummy'||p.hitTargets.has(o))continue;
    const origin=i===2?impact:p.pos,dx=o.x-origin[0],dy=o.y-origin[1],d=Math.hypot(dx,dy);
    const forward=(o.x-p.pos[0])*dir[0]+(o.y-p.pos[1])*dir[1];
    if(i===2&&forward<=0)continue;
    const segDist=distToSegment2D(o.x,o.y,guard[0],guard[1],tip[0],tip[1]);
    const sweptDist=p.prevTip?distToSegment2D(o.x,o.y,p.prevTip[0],p.prevTip[1],tip[0],tip[1]):segDist;
    const inCone=i===2?d<=115:(d<=174&&(dx*dir[0]+dy*dir[1])/(d||1)>=.25);
    const inSweep=forward>0&&Math.min(segDist,sweptDist)<=(o.r||57)+32;
    if(!inCone&&!inSweep)continue;
    p.hitTargets.add(o);o.flash=1;o.kick=1;o.hits++;count++;Game.hits++;
    if(o.hp===undefined){o.maxHp=180;o.hp=180;o.maxPoise=75;o.poise=75;}
    const dmg=p.attackSpec?.damage??(i===2?38:i===1?26:22),poiseDmg=p.attackSpec?.poiseDamage??(i===2?45:i===1?28:24);
    o.hp=Math.max(0,o.hp-dmg);o.poise=Math.max(0,(o.poise??75)-poiseDmg);o.poiseDelay=1.3;
    if(o.aiEnabled)o.aggro=true;
    if(o.hp<=0&&o.enemyState!=='dead'){
      o.enemyState='dead';o.stateTimer=1.8;o.riposteUntil=0;Game.notice='GUARDIÃO DERROTADO!';Game.noticeTimer=1.5;
    }else if(o.poise<=0&&o.enemyState!=='stagger'&&o.enemyState!=='dead'){
      o.enemyState='stagger';o.stateTimer=1.35;o.riposteUntil=Game.t+1.25;o.poise=o.maxPoise;Game.notice='POSTURA QUEBRADA · RIPOSTE!';Game.noticeTimer=1.3;
    }else if(o.enemyState==='idle'||o.enemyState==='approach'){
      o.enemyState='hit_react';o.stateTimer=.22;
    }
    const gain=p.attackSpec?.focusGain??(i===2?COMBAT_RESOURCES_CONFIG.focus.gainOnHeavyHit:COMBAT_RESOURCES_CONFIG.focus.gainOnHit);
    p.resources.focus=Math.min(p.resources.maxFocus,p.resources.focus+gain);
    FX.burst([o.x,o.y,90],12);
  }
  if(i===2){FX.impact(impact);for(const o of WorldScene.props)if(o.kind!=='dummy'&&Math.hypot(o.x-impact[0],o.y-impact[1])<360)o.kick=Math.max(o.kick,.8);}
  // Honest combat feedback: hitstop and camera shake ONLY occur on actual target contact (never on whiff).
  if(count>0){Game.hitstop=i===2?.065:.04;Game.shake=Game.reducedMotion?0:i===2?6:3;Game.shakeDir=[(dir[1]-dir[0])*SQ1_2,(dir[0]+dir[1])*SQ1_2*.6];invalidateField();}
  return count;
}
function update(dt){
  Input.pollGamepad();const p=Player;Game.t+=dt;updateResources(dt);const before=p.pos.slice(),mv=Input.movement(),wasDodge=p.state==='dodge';
  if(p.state==='stagger'){
    p.invulnerable=false;p.parryActive=false;
    if(p.anim.stagger&&p.anim.stagger.t>=p.staggerDuration){p.state='move';p.phase='idle';p.anim.endStagger();}
  }
  if(p.state==='parry'){
    const t=p.anim.parry?p.anim.parry.t:0,cfg=ARUAN_GAME_FEEL.parry;
    p.parryActive=t>=cfg.startupSec&&t<=cfg.startupSec+cfg.activeSec;
    p.phase=t<cfg.startupSec?'startup':p.parryActive?'active':'recovery';
    if(t>=cfg.startupSec+cfg.activeSec+cfg.whiffRecoverySec){p.state='move';p.phase='idle';p.parryActive=false;p.anim.endParry();}
  }
  if(Input.guarding()&&p.state==='move')beginGuard();
  else if(!Input.guarding()&&p.state==='guard')endGuard();
  // Preserve up to two follow-up intents; one event cannot create extra attacks.
  // Handle charged attack intent or contextual attacks (running / dodge follow-up)
  const chargedIntent=Input.peekIntent('charged_attack',Game.t);
  if(chargedIntent&&(p.state==='move'||p.state==='guard'||(p.state==='attack'&&p.anim.atk.t>=p.anim.atk.def.cancel))){
    Input.consumeIntent('charged_attack',Game.t);p.pending.length=0;Input.clicks.length=0;
    beginAttack(2,p.facing,ACTION_SPECS.CHARGED);
  }
  while(Input.clicks.length){
    const click=Input.clicks.shift();let angle=p.facing;
    if(Array.isArray(click)){const g=screenToGround(...click);angle=Math.atan2(g[1]-p.pos[1],g[0]-p.pos[0]);}
    else if(click.direction&&Math.hypot(...click.direction)>.01)angle=Math.atan2(click.direction[1],click.direction[0]);
    if(p.state==='move'||p.state==='guard'){
      const isRunAtk=p.sprint&&Math.hypot(...p.vel)>250;
      beginAttack(0,angle,isRunAtk?ACTION_SPECS.RUNNING_ATTACK:ACTION_SPECS.LIGHT_1);
    }else if(p.state==='dodge'){
      const spec=ARUAN_GAME_FEEL.dodge[p.dodgeKind||'roll'];
      if(p.anim.dodge&&p.anim.dodge.t>=spec.recoveryCancelAt*.75){
        p.state='move';p.invulnerable=false;p.anim.endDodge();
        beginAttack(1,angle,ACTION_SPECS.DODGE_FOLLOWUP);
      }else if(p.pending.length<1){
        p.pending.push({angle,expires:Game.t+.45,dodgeFollowup:true});
      }
    }else if(p.state==='attack'&&p.pending.length<2-p.combo){
      p.pending.push({angle,expires:Game.t+1.2});
    }
  }
  while(p.pending[0]&&p.pending[0].expires<Game.t)p.pending.shift();p.queued=p.pending.length>0;
  Input.pruneIntents(Game.t);
  if(p.state==='attack'){
    const a=p.anim.atk,d=a.def,minCancel=Math.max(d.cancel,d.activeEnd);
    p.phase=a.t<d.keys[0].end?'windup':a.t<=d.activeEnd?'active':a.t<minCancel?'recovery':'cancelable_recovery';
    const bufferedDodge=Input.peekIntent('dodge',Game.t),bufferedParry=Input.peekIntent('parry',Game.t);
    if(bufferedDodge&&a.t>=minCancel){
      Input.consumeIntent('dodge',Game.t);beginDodge(bufferedDodge.payload?.kind||'roll',true);
    }else if(bufferedParry&&a.t>=minCancel){
      Input.consumeIntent('parry',Game.t);beginParry(true);
    }else if(Input.guarding()&&a.t>=minCancel){
      beginGuard();
    }else if(!bufferedDodge&&p.queued&&a.t>=d.cancel&&p.combo<2){const intent=p.pending.shift();beginAttack(p.combo+1,intent.angle);}
    else if(a.t>=d.total)endAttack();
  }
  if(p.state==='dodge'){
    const kind=p.dodgeKind||'roll',spec=ARUAN_GAME_FEEL.dodge[kind],t=p.anim.dodge.t;
    p.invulnerable=t>=spec.iFrameStart&&t<=spec.iFrameEnd;
    p.phase=t<spec.iFrameStart?'startup':t<=spec.iFrameEnd?'active':t<spec.recoveryCancelAt?'recovery':'cancelable_recovery';
    const travel=dodgeTravel(t+dt,kind)-dodgeTravel(t,kind);
    p.pos[0]+=Math.cos(p.facing)*travel;p.pos[1]+=Math.sin(p.facing)*travel;WorldScene.collide(p.pos);
    if(t>=spec.recoveryCancelAt&&p.pending[0]?.dodgeFollowup){
      const intent=p.pending.shift();p.state='move';p.invulnerable=false;p.anim.endDodge();
      beginAttack(1,intent.angle,ACTION_SPECS.DODGE_FOLLOWUP);
    }else if(p.anim.dodge.t>=spec.duration){p.state='move';p.phase='idle';p.invulnerable=false;p.anim.endDodge();p.feet.reset();}
  }
  const baseSpeed=p.resources.stamina<=0?ARUAN_GAME_FEEL.locomotion.walkSpeed:Input.moveSpeed();
  const speed=p.state==='guard'?baseSpeed*ARUAN_GAME_FEEL.guard.moveSpeedMultiplier:baseSpeed;
  p.moveIntent=mv.slice();p.sprint=p.resources.stamina>0&&Input.sprinting();
  if((p.state==='move'||p.state==='guard')&&!wasDodge){
    p.invulnerable=false;
    // Remove opposing momentum immediately; retain the perpendicular turn arc and trigger pivot on >=135 deg reversal.
    const moving=Math.hypot(...mv)>.01,prevSpeed=Math.hypot(...p.vel),opposing=p.vel[0]*mv[0]+p.vel[1]*mv[1];
    if(moving&&opposing<0){
      if(prevSpeed>140&&opposing/(prevSpeed*Math.hypot(...mv))<-.707)p.pivot={t:0,duration:ARUAN_GAME_FEEL.locomotion.pivotDurationMs/1000,from:p.facing,to:Math.atan2(mv[1],mv[0])};
      p.vel[0]-=mv[0]*opposing;p.vel[1]-=mv[1]*opposing;
    }
    if(p.pivot){p.pivot.t+=dt;if(p.pivot.t>=p.pivot.duration)p.pivot=null;}
    const response=moving?ARUAN_GAME_FEEL.locomotion.accelGround:ARUAN_GAME_FEEL.locomotion.decelGround;
    p.vel[0]=damp(p.vel[0],mv[0]*speed,response,dt);p.vel[1]=damp(p.vel[1],mv[1]*speed,response,dt);
    if(!moving&&Math.hypot(...p.vel)<.4)p.vel=[0,0];
    p.pos[0]+=p.vel[0]*dt;p.pos[1]+=p.vel[1]*dt;WorldScene.collide(p.pos);
    p.vel=[(p.pos[0]-before[0])/dt,(p.pos[1]-before[1])/dt];
    const curSpeed=Math.hypot(...p.vel);
    if(p.state==='move')p.phase=!moving&&curSpeed<1?'idle':p.pivot?'pivot':p.sprint?'sprint':curSpeed>170?'run':'walk';
    if(moving||curSpeed>12)p.facing+=angDiff(p.facing,Math.atan2(moving?mv[1]:p.vel[1],moving?mv[0]:p.vel[0]))*(1-Math.exp(-ARUAN_GAME_FEEL.locomotion.turnBlendSpeed*dt));
  }
  const oldT=p.anim.atk?p.anim.atk.t:0,sample=p.anim.update(dt,p.state==='move'?Math.hypot(...p.vel):0);
  if(p.state==='attack'){
    const d=p.anim.atk.def;let amount=(sample.lunge-p.lunge)*d.lunge;p.lunge=sample.lunge;const dx=Math.cos(p.facing),dy=Math.sin(p.facing);
    for(const o of WorldScene.props){if(o.kind!=='dummy')continue;const x=o.x-p.pos[0],y=o.y-p.pos[1],along=x*dx+y*dy,side=Math.abs(y*dx-x*dy);if(along>0&&side<75)amount=Math.min(amount,Math.max(0,along-92));}
    p.pos[0]+=dx*amount;p.pos[1]+=dy*amount;WorldScene.collide(p.pos);
  }
  if(p.turn){p.turn.t+=dt;const u=clamp(p.turn.t/p.turn.duration,0,1);p.visualFacing=p.turn.from+angDiff(p.turn.from,p.turn.to)*Ease.inOutSine(u);if(u===1)p.turn=null;}
  else p.visualFacing=p.facing;
  const external=globalThis.MovaGame?.pose(dt,p,sample.pose),drawPose=external?.pose||sample.pose;
  const planted=p.state==='dodge'?null:p.feet.update(drawPose,p.pos,p.visualFacing,dt,p.state==='attack');p.rig=solveRig(drawPose,p.pos,p.visualFacing,planted);
  p.trail.add(p.rig,dt,sample.trail);
  if(p.state==='attack'){
    if((sample.trail||oldT<p.anim.atk.def.hitTime)&&p.anim.atk.t>=p.anim.atk.def.hitTime*.82)hit(p.combo,false);
    p.prevTip=p.rig.tip.slice();
  }
  const dist=vDist(p.pos,before);p.footstep+=dist;if(p.state==='move'&&p.footstep>90){p.footstep=0;FX.dust(p.pos);}
  updateEnemies(dt);
  FX.update(dt);WorldScene.update(dt,Game.t,p.pos);Game.shake*=Math.exp(-dt*25);
  followCamera(dt);
  Cam.shakeX=Math.sin(Game.t*160)*Game.shake*Game.shakeDir[0];Cam.shakeY=Math.sin(Game.t*160)*Game.shake*Game.shakeDir[1];camUpdateOffsets();
}
function render(){
  const p=Player;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#122530';ctx.fillRect(0,0,Cam.W,Cam.H);
  const bg=ctx.createRadialGradient(Cam.W*.44,Cam.H*.3,20,Cam.W*.5,Cam.H*.5,Cam.W*.7);bg.addColorStop(0,'#41666a');bg.addColorStop(1,'#101e2b');ctx.fillStyle=bg;ctx.fillRect(0,0,Cam.W,Cam.H);
  setWorldTransform(ctx);WorldScene.drawGround(ctx);FX.wind(ctx,Game.t);FX.ground(ctx);
  for(const e of WorldScene.props){
    if(e.kind!=='dummy')continue;
    if((e.enemyState==='windup'||e.enemyState==='active')&&e.attack){
      const ratio=e.enemyState==='active'?1:clamp(e.stateTimer/e.attack.windup,0,1);
      const half=(e.attack.arcDeg*.5)*DEG,steps=12,pts=[pj2([e.x,e.y,2])];
      for(let s=0;s<=steps;s++){const a=e.facing-half+(s/steps)*half*2,r=e.attack.range*(.35+.65*ratio);pts.push(pj2([e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,2]));}
      polygon(ctx,pts,e.enemyState==='active'?'#e8523d66':'#e8a84438',e.enemyState==='active'?'#ff8b6b':'#f3cb78',1.4);
    }else if(e.riposteUntil&&e.riposteUntil>Game.t){
      const q=pj2([e.x,e.y,2]);ellipse(ctx,q[0],q[1],38,38*Cam.sinP,'#f2c96d28','#ffe28a',1.8);
    }
  }
  const shadow=pj2(p.pos);ellipse(ctx,shadow[0]+6,shadow[1]+3,27,12,'#112e39b0');
  const entries=WorldScene.props.concat(WorldScene.tufts).map(o=>({depth:hDepth([o.x,o.y,0]),draw:c=>{
    WorldScene.drawProp(c,o,Game.t);
    if(o.kind==='dummy'&&o.maxHp&&(o.hp<o.maxHp||o.aggro||o.enemyState!=='idle')){
      const top=pj2([o.x,o.y,145]);
      c.save();c.fillStyle='#0d1b22cc';c.fillRect(top[0]-32,top[1]-10,64,6);
      c.fillStyle=o.riposteUntil>Game.t?'#ffd875':'#d9594c';c.fillRect(top[0]-31,top[1]-9,62*clamp(o.hp/o.maxHp,0,1),4);
      c.fillStyle='#0d1b22cc';c.fillRect(top[0]-32,top[1]-3,64,3);
      c.fillStyle='#7ce0c3';c.fillRect(top[0]-31,top[1]-2.5,62*clamp((o.poise??75)/(o.maxPoise||75),0,1),2);
      c.restore();
    }
  }}));
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
window.Pilot={Game,Player,WorldScene,FX,step:update,render,reset:resetPlayer,attack:beginAttack,dodge:beginDodge,guard:beginGuard,parry:beginParry,rune:beginRuneSkill,resolveIncomingHit,startEnemyAttack,get enemy(){return TrainingEnemy;}};
globalThis.MovaGame?.init(Input);
console.info('Piloto pronto: Canvas 2D. Cache inicial:',WorldScene.buildMs.toFixed(0),'ms');
