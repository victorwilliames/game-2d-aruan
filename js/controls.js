'use strict';
const ARUAN_GAME_FEEL={
  input:{
    moveDeadzone:.14,aimDeadzone:.18,runThreshold:.72,keyboardEightWayNormalize:true,
    buffer:{attackMs:150,dodgeMs:165,parryMs:140,skillMs:165,interactMs:120,maxBufferedNextAttacks:1},
    hold:{sprintHoldThresholdMs:170,chargedAttackHoldMs:260}
  },
  locomotion:{
    walkSpeed:125,runSpeed:290,sprintSpeed:365,accelGround:22,decelGround:36,turnBlendSpeed:16,
    pivotAngleDeg:135,pivotDurationMs:140,stopDistanceMaxPx:14
  },
  dodge:{
    quickstep:{staminaCost:16,duration:.46,distance:138,iFrameStart:.04,iFrameEnd:.24,recoveryCancelAt:.34},
    roll:{staminaCost:22,duration:.84,distance:202,iFrameStart:.05,iFrameEnd:.34,recoveryCancelAt:.56}
  },
  guard:{
    guardAngleDegrees:140,moveSpeedMultiplier:.55,staminaRegenMultiplier:.35,passiveDrainPerSecond:0,
    damageReduction:.72,chipDamageMultiplier:.28,staminaCostFactor:1.05,guardBreakRecoverySec:.95
  },
  parry:{
    staminaCost:12,startupSec:.06,activeSec:.15,whiffRecoverySec:.28,focusGain:35,enemyStaggerSec:1.35,riposteWindowSec:1.25
  }
};
const COMBAT_RESOURCES_CONFIG={
  hp:{max:100,initial:100},
  stamina:{max:100,initial:100,regenPerSec:26,regenDelaySec:.48,exhaustedRecoveryThreshold:18},
  focus:{max:100,initial:30,gainOnHit:8,gainOnHeavyHit:15,gainOnParry:35,runeCost:30},
  poise:{max:60,initial:60,regenPerSec:18,regenDelaySec:1.1}
};
const CONTROL_PRESETS={
  ARUAN_FLUIDO:{
    id:'ARUAN_FLUIDO',label:'Aruan Fluido (Padrão)',
    gamepad:{dodge:'PadA',backstep:'PadB',attack:'PadX',heavy:'PadRT',sprint:'PadL3',guard:'PadLB',parry:'PadLT',rune:'PadRB'},
    keyboard:{dodge:'Space',attack:'Mouse0',sprint:'ShiftLeft',guard:'Mouse2',parry:'KeyQ',rune:'KeyE',reset:'KeyR',debugOverlay:'F3'}
  },
  WICKED_CLASSIC:{
    id:'WICKED_CLASSIC',label:'Wicked Classic',
    gamepad:{dodgeTapSprintHold:'PadA',backstep:'PadB',attackTapChargeHold:'PadX',heavy:'PadRT',guard:'PadLB',parry:'PadLT',rune:'PadRB'},
    keyboard:{dodge:'Space',attack:'Mouse0',sprint:'ShiftLeft',guard:'Mouse2',parry:'KeyQ',rune:'KeyE',reset:'KeyR',debugOverlay:'F3'}
  },
  LEGACY:{
    id:'LEGACY',label:'Legado V1',
    gamepad:{attack:'PadA',dodge:'PadB',sprint:'PadL3',guard:'PadLB',parry:'PadLT',rune:'PadRB'},
    keyboard:{dodge:'Space',attack:'Mouse0',sprint:'ShiftLeft',guard:'Mouse2',parry:'KeyQ',rune:'KeyE',reset:'KeyR',debugOverlay:'F3'}
  }
};
const ACTION_SPECS={
  LIGHT_1:{id:'LIGHT_1',comboIndex:0,clip:'bow_club_attack_01',staminaCost:14,damage:22,poiseDamage:24,focusGain:8,lunge:24,hitStart:.29,hitEnd:.43,cancelWindowStart:.41,steer:{windup:.55,active:.15,recovery:.35}},
  LIGHT_2:{id:'LIGHT_2',comboIndex:1,clip:'bow_club_attack_02',staminaCost:16,damage:26,poiseDamage:28,focusGain:9,lunge:23,hitStart:.19,hitEnd:.33,cancelWindowStart:.32,steer:{windup:.55,active:.15,recovery:.35}},
  LIGHT_3:{id:'LIGHT_3',comboIndex:2,clip:'bow_club_attack_03',staminaCost:22,damage:38,poiseDamage:45,focusGain:14,lunge:32,hitStart:.36,hitEnd:.53,cancelWindowStart:.56,steer:{windup:.45,active:.08,recovery:.30}},
  CHARGED:{id:'CHARGED',comboIndex:2,clip:'bow_club_charge',staminaCost:28,damage:52,poiseDamage:65,focusGain:18,lunge:38,hitStart:.40,hitEnd:.58,cancelWindowStart:.60,steer:{windup:.50,active:.10,recovery:.25}},
  RUNNING_ATTACK:{id:'RUNNING_ATTACK',comboIndex:0,clip:'bow_club_running',staminaCost:18,damage:28,poiseDamage:32,focusGain:10,lunge:34,hitStart:.22,hitEnd:.38,cancelWindowStart:.38,steer:{windup:.40,active:.15,recovery:.35}},
  DODGE_FOLLOWUP:{id:'DODGE_FOLLOWUP',comboIndex:1,clip:'bow_club_dodge_atk',staminaCost:16,damage:27,poiseDamage:30,focusGain:10,lunge:26,hitStart:.18,hitEnd:.32,cancelWindowStart:.32,steer:{windup:.60,active:.15,recovery:.35}},
  RIPOSTE:{id:'RIPOSTE',comboIndex:2,clip:'riposte',staminaCost:10,damage:68,poiseDamage:80,focusGain:20,lunge:28,hitStart:.24,hitEnd:.46,cancelWindowStart:.48,invulnerable:true,steer:{windup:.20,active:0,recovery:.25}},
  RUNE_SLAM:{id:'RUNE_SLAM',comboIndex:2,clip:'rune_slam',staminaCost:12,focusCost:30,damage:58,poiseDamage:70,focusGain:0,lunge:36,hitStart:.32,hitEnd:.54,cancelWindowStart:.56,steer:{windup:.45,active:.10,recovery:.30}}
};
const ANIMATION_REGISTRY={
  idle:{id:'idle',movalabSlot:'idle',preferredFile:'mixamo-idle.aruan-clip.v1.json',fallback:'IDLE_A/IDLE_B',driver:'controller+FootPlant'},
  walk:{id:'walk',movalabSlot:'walk',preferredFile:'mixamo-walking.aruan-clip.v1.json',fallback:'locomotionPose(phase,0)',driver:'controller+FootPlant'},
  run:{id:'run',movalabSlot:'run',preferredFile:'mixamo-run.aruan-clip.v1.json',fallback:'locomotionPose(phase,1)',driver:'controller+FootPlant'},
  sprint:{id:'sprint',movalabSlot:'run',preferredFile:'mixamo-run.aruan-clip.v1.json',fallback:'locomotionPose(phase,1.18)',driver:'controller+FootPlant'},
  quickstep:{id:'quickstep',movalabSlot:'native-dodge',preferredFile:null,fallback:'quickstepPose',driver:'dodgeCurve'},
  roll:{id:'roll',movalabSlot:'native-dodge',preferredFile:null,fallback:'dodgePose',driver:'dodgeCurve'},
  bow_club_attack_01:{id:'bow_club_attack_01',movalabSlot:'action',preferredFile:null,fallback:'ATTACKS[0]',driver:'attackLunge+FootPlant'},
  bow_club_attack_02:{id:'bow_club_attack_02',movalabSlot:'action',preferredFile:null,fallback:'ATTACKS[1]',driver:'attackLunge+FootPlant'},
  bow_club_attack_03:{id:'bow_club_attack_03',movalabSlot:'action',preferredFile:null,fallback:'ATTACKS[2]',driver:'attackLunge+FootPlant'},
  bow_club_charge:{id:'bow_club_charge',movalabSlot:'action',preferredFile:null,fallback:'ATTACKS[2]:charged',driver:'attackLunge+FootPlant'},
  bow_club_running:{id:'bow_club_running',movalabSlot:'action',preferredFile:null,fallback:'ATTACKS[0]:running',driver:'attackLunge+FootPlant'},
  bow_club_dodge_atk:{id:'bow_club_dodge_atk',movalabSlot:'action',preferredFile:null,fallback:'ATTACKS[1]:dodgeFollowup',driver:'attackLunge+FootPlant'},
  block_loop:{id:'block_loop',movalabSlot:null,preferredFile:null,fallback:'guardPose',driver:'controller+FootPlant'},
  parry:{id:'parry',movalabSlot:null,preferredFile:null,fallback:'parryPose',driver:'controller+FootPlant'},
  riposte:{id:'riposte',movalabSlot:null,preferredFile:null,fallback:'ripostePose',driver:'attackLunge+FootPlant'}
};

class Controls {
  constructor(canvas) {
    this.canvas=canvas;this.keys=new Set();this.mouse=[0,0];this.hasMouse=false;
    this.clicks=[];this.actions={};this.padActions={};this.suspended=false;this.modalActive=false;this.lastEvent=0;this.source='keyboard';
    this.preset='ARUAN_FLUIDO';this.intents=[];this.intentSeq=0;this.lastCancelReason='none';this.lastLatencyMs=0;
    this.guardDown=false;this.sprintToggle=false;this.keyDownAt={};this.padDownAt={};this.padChargeFired={};
    this.touch={move:[0,0],aim:null,joystick:null,attack:null};this.lastDirection=null;
    this.pad={connected:false,index:null,move:[0,0],aim:null,axes:[0,0,0,0],handoffAxes:[0,0,0,0],buttons:Array(17).fill(false),neutral:true};this.focused=!document.hidden;
    this.coarse=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;
    const editable=t=>t&&(t.isContentEditable||(typeof t.matches==='function'&&t.matches('input,select,button,textarea,[contenteditable="true"]')));
    addEventListener('keydown',e=>{
      if(this.modalActive||editable(e.target))return;
      this.activate('keyboard');
      if(!e.repeat){
        this.keyDownAt[e.code]=performance.now();
        if(this.actions[e.code])this.actions[e.code]();
      }
      if(!this.suspended)this.keys.add(e.code);
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','F3'].includes(e.code))e.preventDefault?.();
    });
    addEventListener('keyup',e=>{
      this.keys.delete(e.code);delete this.keyDownAt[e.code];this.lastEvent=performance.now();
    });
    addEventListener('blur',()=>{this.focused=false;this.clear();});
    addEventListener('focus',()=>{this.focused=true;this.pad.neutral=true;});
    addEventListener('gamepaddisconnected',e=>{if(e.gamepad.index===this.pad.index)this.disconnectPad();});
    document.addEventListener('visibilitychange',()=>{this.focused=!document.hidden;if(document.hidden)this.clear();else this.pad.neutral=true;});
    const point=e=>{
      const r=canvas.getBoundingClientRect();
      this.mouse=[(e.clientX-r.left)*Cam.dpr,(e.clientY-r.top)*Cam.dpr];
      this.activate(e.pointerType==='touch'?'touch':'mouse');this.hasMouse=e.pointerType!=='touch';
    };
    canvas.addEventListener('pointermove',point);
    canvas.addEventListener('pointerdown',e=>{
      if(this.suspended)return;
      if(e.button===2){point(e);this.guardDown=true;this.pushIntent('guard',{down:true});e.preventDefault?.();return;}
      if(e.button!==0)return;
      point(e);this.keyDownAt.Mouse0=performance.now();this.enqueue(this.mouse.slice());canvas.focus({preventScroll:true});e.preventDefault?.();
    });
    canvas.addEventListener('pointerup',e=>{
      if(e.button===2){this.guardDown=false;return;}
      if(e.button===0){
        const held=this.keyDownAt.Mouse0?performance.now()-this.keyDownAt.Mouse0:0;
        delete this.keyDownAt.Mouse0;
        if(held>=ARUAN_GAME_FEEL.input.hold.chargedAttackHoldMs&&!this.suspended){
          this.pushIntent('charged_attack',{point:this.mouse.slice(),heldMs:held});
        }
      }
    });
    canvas.addEventListener('pointercancel',()=>this.clear());
    canvas.addEventListener('pointerleave',()=>{this.hasMouse=false;});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    this.initTouch();if(this.coarse)this.activate('touch');
  }
  setPreset(name){
    if(!CONTROL_PRESETS[name])return this.preset;
    this.preset=name;this.sprintToggle=false;
    document.body?.setAttribute('data-preset',name);
    this.updateHints();
    return this.preset;
  }
  updateHints(){
    if(!this.hint)return;
    const s=this.source;
    if(s==='touch')this.hint.textContent='Toque para encadear · Segure/arraste para mirar · Rolar cancela recuperação.';
    else if(s==='gamepad'){
      this.hint.textContent=this.preset==='WICKED_CLASSIC'
        ?'Xbox: X atacar (segure p/ carregado) · A toque esquiva / segure sprint · LB defender · LT parry'
        :this.preset==='LEGACY'
        ?'Xbox Legado: A atacar · B esquivar · LB defender · LT parry'
        :'Xbox: X atacar · A/B esquivar · L3 sprint · LB defender · LT parry · RB runa';
    }else{
      this.hint.textContent='Clique atacar · Espaço esquivar · Botão direito defender · Q parry · E runa';
    }
  }
  pushIntent(type,payload={},ttlMs){
    if(this.suspended)return null;
    const ttl=(ttlMs??ARUAN_GAME_FEEL.input.buffer[type+'Ms']??150)/1000;
    const now=typeof Game==='object'?Game.t:0,pressedAtMs=performance.now();
    const item={id:++this.intentSeq,type,payload,createdAt:now,expiresAt:now+ttl,pressedAtMs};
    if(type==='dodge'||type==='parry'||type==='guard'){
      this.intents=this.intents.filter(i=>i.type!=='attack'&&i.type!=='charged_attack'&&i.type!==type);
    }else if(type==='attack'||type==='charged_attack'){
      const maxAtk=ARUAN_GAME_FEEL.input.buffer.maxBufferedNextAttacks;
      const existing=this.intents.filter(i=>i.type==='attack'||i.type==='charged_attack');
      if(existing.length>=maxAtk)return null;
    }
    this.intents.push(item);
    return item;
  }
  pruneIntents(nowSec){
    while(this.intents.length&&this.intents[0].expiresAt<nowSec)this.intents.shift();
  }
  peekIntent(types,nowSec=0){
    this.pruneIntents(nowSec);
    const set=Array.isArray(types)?types:[types];
    return this.intents.find(i=>set.includes(i.type))||null;
  }
  consumeIntent(types,nowSec=0){
    this.pruneIntents(nowSec);
    const set=Array.isArray(types)?types:[types];
    const idx=this.intents.findIndex(i=>set.includes(i.type));
    if(idx===-1)return null;
    const [item]=this.intents.splice(idx,1);
    this.lastLatencyMs=Math.max(0,performance.now()-item.pressedAtMs);
    return item;
  }
  clearIntents(types=null){
    if(!types){this.intents.length=0;return;}
    const set=Array.isArray(types)?types:[types];
    this.intents=this.intents.filter(i=>!set.includes(i.type));
  }
  enqueue(point){
    if(this.clicks.length<16)this.clicks.push(point);
    this.pushIntent('attack',{point});
  }
  activate(source,interactive=true){
    const family=s=>s==='touch'?'touch':s==='gamepad'?'gamepad':'desktop',changed=source!==this.source;
    if(interactive)this.focused=true;
    if(family(source)!==family(this.source)){if(source!=='gamepad')this.pad.handoffAxes=this.pad.axes.slice();this.keys.clear();this.guardDown=false;this.resetTouch();this.resetPadMotion();this.hasMouse=false;}
    this.source=source;this.lastEvent=performance.now();
    if(changed){
      if(this.toolKeys?.debug)this.toolKeys.debug.textContent=source==='gamepad'?'VIEW':'B';
      if(this.toolKeys?.pause)this.toolKeys.pause.textContent=source==='gamepad'?'MENU':'P';
      this.updateHints();
      document.body?.setAttribute('data-input',source);document.body?.classList.toggle('touch-ui',this.coarse||source==='touch');
    }
  }
  resetTouch(){
    this.touch={move:[0,0],aim:null,joystick:null,attack:null};
    this.touchUI?.zone?.classList.toggle('engaged',false);this.touchUI?.attack?.classList.toggle('aiming',false);
    if(this.touchUI?.knob)this.touchUI.knob.style.transform='translate(0px,0px)';
  }
  clear(){this.keys.clear();this.clicks.length=0;this.intents.length=0;this.guardDown=false;this.sprintToggle=false;this.keyDownAt={};this.padDownAt={};this.padChargeFired={};this.hasMouse=false;this.resetTouch();this.resetPadMotion();this.pad.neutral=true;this.onClear?.();}
  sprinting(){
    if(this.suspended)return false;
    if(this.source==='gamepad'){
      const mag=Math.hypot(...this.pad.move);
      if(mag<.2)this.sprintToggle=false;
      if(this.preset==='WICKED_CLASSIC'){
        const heldA=this.pad.buttons[0]&&this.padDownAt[0]&&(performance.now()-this.padDownAt[0])>=ARUAN_GAME_FEEL.input.hold.sprintHoldThresholdMs;
        return mag>.25&&Boolean(heldA||this.sprintToggle||this.pad.buttons[10]);
      }
      return mag>.25&&Boolean(this.sprintToggle||this.pad.buttons[10]);
    }
    if(this.source==='touch')return false;
    return this.keys.has('ShiftLeft')||this.keys.has('ShiftRight');
  }
  guarding(){
    if(this.suspended)return false;
    if(this.source==='gamepad')return Boolean(this.pad.buttons[4]);
    return Boolean(this.guardDown||this.keys.has('KeyC')||this.keys.has('ShiftRight')&&false);
  }
  moveSpeed(){
    const cfg=ARUAN_GAME_FEEL.locomotion;
    if(this.source==='touch'||this.source==='gamepad'){
      const vector=this.source==='touch'?this.touch.move:this.pad.move,mag=Math.hypot(...vector);
      if(this.sprinting())return cfg.sprintSpeed;
      const u=clamp((mag-.45)/.55,0,1);
      return lerp(cfg.walkSpeed,cfg.runSpeed,u*u*(3-2*u));
    }
    return this.running()?cfg.runSpeed:cfg.walkSpeed;
  }
  running(){return this.source==='touch'||this.source==='gamepad'?Math.hypot(...(this.source==='touch'?this.touch.move:this.pad.move))>.8||this.sprinting():this.keys.has('ShiftLeft')||this.keys.has('ShiftRight');}
  resetPadMotion(){if(this.pad){this.pad.move=[0,0];this.pad.aim=null;}}
  disconnectPad(){
    this.pad.connected=false;this.pad.index=null;this.pad.axes=[0,0,0,0];this.pad.handoffAxes=[0,0,0,0];this.pad.buttons=Array(17).fill(false);this.pad.neutral=true;this.padDownAt={};this.padChargeFired={};this.sprintToggle=false;this.resetPadMotion();
    if(this.source==='gamepad')this.activate('keyboard',false);
  }
  padVector(x,y,deadzone=ARUAN_GAME_FEEL.input.moveDeadzone){
    const length=Math.hypot(x,y);if(length<=deadzone)return [0,0];
    const unit=this.screenVector360(x,y),strength=Math.pow(clamp((length-deadzone)/(1-deadzone),0,1),1.2);return unit.map(n=>n*strength);
  }
  screenVector360(x,y,analog=false){
    const length=Math.hypot(x,y);if(length<.001)return [0,0];
    const ux=x/length,uy=y/length,strength=analog?clamp((length/44-.15)/.85,0,1):1;
    return [(uy-ux)*SQ1_2*strength,(uy+ux)*SQ1_2*strength];
  }
  screenVector(x,y,analog=false){
    const length=Math.hypot(x,y);if(length<.001)return [0,0];
    if(analog)return this.screenVector360(x,y,true);
    const angle=Math.round(Math.atan2(y,x)/(Math.PI/4))*(Math.PI/4);
    x=Math.cos(angle);y=Math.sin(angle);return [(y-x)*SQ1_2,(y+x)*SQ1_2];
  }
  pollGamepad(){
    let devices;try{devices=typeof navigator!=='undefined'&&typeof navigator.getGamepads==='function'?Array.from(navigator.getGamepads()||[]):[];}catch{devices=[];}
    const gp=devices.find(p=>p&&p.connected!==false&&p.mapping==='standard');
    if(!gp){if(this.pad.connected)this.disconnectPad();return;}
    const p=this.pad,axes=Array.from({length:4},(_,i)=>Number.isFinite(gp.axes[i])?clamp(gp.axes[i],-1,1):0);
    const buttons=Array.from({length:17},(_,i)=>!!gp.buttons[i]?.pressed||gp.buttons[i]?.value>.5);
    if(!p.connected||p.index!==gp.index){p.connected=true;p.index=gp.index;p.axes=axes.slice();p.handoffAxes=axes.slice();p.buttons=buttons.slice();p.neutral=true;}
    const nowMs=performance.now(),edge=i=>buttons[i]&&!p.buttons[i],released=i=>!buttons[i]&&p.buttons[i],finish=()=>{p.axes=axes;p.buttons=buttons;};
    const left=this.padVector(axes[0],axes[1]),right=this.padVector(axes[2],axes[3],ARUAN_GAME_FEEL.input.aimDeadzone);
    if(this.modalActive){p.move=[0,0];p.aim=null;p.neutral=true;finish();return;}
    if(Math.hypot(...left)===0&&Math.hypot(...right)===0&&buttons.every(b=>!b)){p.neutral=false;p.handoffAxes=axes.slice();}
    if(this.focused&&edge(9)){this.activate('gamepad');this.actions.KeyP?.();finish();return;}
    if(this.focused&&edge(8)){this.activate('gamepad');this.actions.KeyB?.();}
    if(!this.focused||this.suspended||p.neutral){p.move=[0,0];finish();return;}
    const reference=this.source==='gamepad'?p.axes:p.handoffAxes;
    const moved=axes.some((n,i)=>Math.abs(n-reference[i])>.035)&&(Math.hypot(...left)>.01||Math.hypot(...right)>.01);
    const actionEdge=Array.from({length:17},(_,i)=>edge(i)).some(Boolean);
    if((moved||actionEdge)&&this.source!=='gamepad')this.activate('gamepad');
    if(this.source==='gamepad'){
      p.move=left;if(Math.hypot(...left)>.001)this.lastDirection=left.map(n=>n/Math.hypot(...left));
      const rlen=Math.hypot(...right);if(rlen>.001)p.aim=right.map(n=>n/rlen);else p.aim=null;
      if(moved||actionEdge)this.lastEvent=nowMs;
      for(let i=0;i<17;i++){
        if(edge(i)){this.padDownAt[i]=nowMs;delete this.padChargeFired[i];}
      }
      if(edge(10))this.sprintToggle=!this.sprintToggle;
      const aimDir=()=>p.aim?.slice()||this.lastDirection?.slice()||null;
      const fireDodge=()=>this.padActions?.PadB?this.padActions.PadB():this.actions.Space?.();
      const fireAttack=()=>this.enqueue({direction:aimDir()});
      // Legacy harness compatibility: when right-stick aim is held or LEGACY preset is active, A attacks.
      if(this.preset==='LEGACY'){
        if(edge(0))fireAttack();
        if(edge(1))fireDodge();
        if(edge(2))fireAttack();
      }else if(this.preset==='WICKED_CLASSIC'){
        if(released(0)){
          const held=this.padDownAt[0]?nowMs-this.padDownAt[0]:0;
          if(held<ARUAN_GAME_FEEL.input.hold.sprintHoldThresholdMs)fireDodge();
        }
        if(edge(1))fireDodge();
        if(edge(2))fireAttack();
        if(buttons[2]&&!this.padChargeFired[2]&&this.padDownAt[2]&&(nowMs-this.padDownAt[2])>=ARUAN_GAME_FEEL.input.hold.chargedAttackHoldMs){
          this.padChargeFired[2]=true;this.pushIntent('charged_attack',{direction:aimDir()});
        }
      }else{
        // ARUAN_FLUIDO default: A and B dodge, X attacks (tap light, hold charged).
        if(edge(0)){if(this.padActions?.PadA)this.padActions.PadA();else fireDodge();}
        if(edge(1))fireDodge();
        if(edge(2)){if(this.padActions?.PadX)this.padActions.PadX();else fireAttack();}
        if(buttons[2]&&!this.padChargeFired[2]&&this.padDownAt[2]&&(nowMs-this.padDownAt[2])>=ARUAN_GAME_FEEL.input.hold.chargedAttackHoldMs){
          this.padChargeFired[2]=true;this.pushIntent('charged_attack',{direction:aimDir()});
        }
      }
      if(edge(4))this.pushIntent('guard',{down:true});
      if(edge(6)){if(this.padActions?.PadLT)this.padActions.PadLT();else this.actions.KeyQ?.();}
      if(edge(5)){if(this.padActions?.PadRB)this.padActions.PadRB();else this.actions.KeyE?.();}
      if(edge(7)){if(this.padActions?.PadRT)this.padActions.PadRT();else this.pushIntent('charged_attack',{direction:aimDir()});}
      const padMap={3:'PadY',4:'PadLB',5:'PadRB',6:'PadLT',7:'PadRT'};
      for(const [idx,code]of Object.entries(padMap))if(edge(Number(idx)))this.padActions?.[code]?.();
      for(let i=0;i<17;i++)if(released(i))delete this.padDownAt[i];
    }
    finish();
  }
  touchAttack(){if(!this.suspended)this.enqueue({direction:this.touch.aim?.slice()||this.lastDirection?.slice()||null});}
  initTouch(){
    const zone=document.querySelector('#touch-zone'),knob=document.querySelector('#touch-knob'),attack=document.querySelector('#touch-attack'),dodge=document.querySelector('#touch-dodge');
    if(!zone||!attack||!dodge)return;this.hint=document.querySelector('#combo-hint');this.toolKeys={debug:document.querySelector('#debug kbd'),pause:document.querySelector('#paused kbd')};this.touchUI={zone,knob,attack,dodge};
    const capture=(el,e)=>{e.preventDefault?.();try{el.setPointerCapture?.(e.pointerId);}catch{}};
    const stick=e=>{
      const j=this.touch.joystick;if(!j||j.id!==e.pointerId)return;
      this.lastEvent=performance.now();const dx=e.clientX-j.x,dy=e.clientY-j.y,l=Math.hypot(dx,dy),scale=l>44?44/l:1;
      this.touch.move=this.screenVector360(dx,dy,true);if(l>7){const m=Math.hypot(...this.touch.move)||1;this.lastDirection=this.touch.move.map(n=>n/m);}
      if(knob)knob.style.transform='translate('+dx*scale+'px,'+dy*scale+'px)';
    };
    zone.addEventListener('pointerdown',e=>{
      if(this.suspended||this.touch.joystick||(e.button!==undefined&&e.button!==0))return;this.activate('touch');capture(zone,e);
      const r=zone.getBoundingClientRect();this.touch.joystick={id:e.pointerId,x:e.clientX,y:e.clientY};
      zone.style.setProperty('--stick-x',clamp(e.clientX-r.left,52,Math.max(52,r.width-52))+'px');
      zone.style.setProperty('--stick-y',clamp(e.clientY-r.top,52,Math.max(52,r.height-52))+'px');zone.classList.toggle('engaged',true);stick(e);
    });
    zone.addEventListener('pointermove',stick);
    const releaseStick=e=>{if(this.touch.joystick?.id!==e.pointerId)return;this.touch.joystick=null;this.touch.move=[0,0];zone.classList.toggle('engaged',false);if(knob)knob.style.transform='translate(0px,0px)';};
    for(const name of ['pointerup','pointercancel','lostpointercapture'])zone.addEventListener(name,releaseStick);
    attack.addEventListener('pointerdown',e=>{
      if(this.suspended||this.touch.attack||(e.button!==undefined&&e.button!==0))return;this.activate('touch');capture(attack,e);this.touch.aim=null;
      this.touch.attack={id:e.pointerId,x:e.clientX,y:e.clientY};
    });
    attack.addEventListener('pointermove',e=>{
      const a=this.touch.attack;if(!a||a.id!==e.pointerId)return;
      this.lastEvent=performance.now();const dx=e.clientX-a.x,dy=e.clientY-a.y;if(Math.hypot(dx,dy)<10)return;
      this.touch.aim=this.screenVector(dx,dy);attack.classList.toggle('aiming',true);attack.style.setProperty('--aim-angle',(Math.atan2(dy,dx)*180/Math.PI+90)+'deg');
    });
    attack.addEventListener('pointerup',e=>{
      if(this.touch.attack?.id!==e.pointerId)return;if(this.touch.aim)this.lastDirection=this.touch.aim.slice();this.touchAttack();this.touch.attack=null;attack.classList.toggle('aiming',false);
    });
    const cancelAttack=e=>{if(this.touch.attack?.id===e.pointerId){this.touch.attack=null;this.touch.aim=null;attack.classList.toggle('aiming',false);}};
    for(const name of ['pointercancel','lostpointercapture'])attack.addEventListener(name,cancelAttack);
    dodge.addEventListener('pointerdown',e=>{if(this.suspended||(e.button!==undefined&&e.button!==0))return;this.activate('touch');capture(dodge,e);this.actions.Space?.();});
    attack.addEventListener('click',e=>{if(e.detail===0){this.activate('touch');this.touchAttack();}});
    dodge.addEventListener('click',e=>{if(e.detail===0&&!this.suspended){this.activate('touch');this.actions.Space?.();}});
    for(const el of [zone,attack,dodge])el.addEventListener('contextmenu',e=>e.preventDefault());
  }
  movement(){
    if(this.suspended)return [0,0];
    if(this.source==='touch')return this.touch.move.slice();
    if(this.source==='gamepad')return this.pad.move.slice();
    const x=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'));
    const y=Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'));
    if(!x&&!y)return [0,0];const l=Math.hypot(x,y);
    const vector=[(y-x)*SQ1_2/l,(y+x)*SQ1_2/l];this.lastDirection=vector.slice();return vector;
  }
  diagnostics(){
    return {
      source:this.source,preset:this.preset,gamepadConnected:this.pad.connected,
      vector:this.movement(),buffer:this.clicks.length+this.intents.length,
      intents:this.intents.map(i=>i.type),cancelReason:this.lastCancelReason,
      latencyMs:this.lastLatencyMs,ageMs:Math.max(0,performance.now()-this.lastEvent)
    };
  }
}
