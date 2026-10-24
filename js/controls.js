'use strict';
class Controls {
  constructor(canvas) {
    this.canvas=canvas;this.keys=new Set();this.mouse=[0,0];this.hasMouse=false;
    this.clicks=[];this.actions={};this.suspended=false;this.lastEvent=0;this.source='keyboard';
    this.touch={move:[0,0],aim:null,joystick:null,attack:null};this.lastDirection=null;
    this.coarse=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;
    const editable=t=>t&&(t.isContentEditable||(typeof t.matches==='function'&&t.matches('input,select,button,textarea,[contenteditable="true"]')));
    addEventListener('keydown',e=>{
      if(editable(e.target))return;
      this.activate('keyboard');
      if(!e.repeat&&this.actions[e.code])this.actions[e.code]();
      if(!this.suspended)this.keys.add(e.code);
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    });
    addEventListener('keyup',e=>{this.keys.delete(e.code);this.lastEvent=performance.now();});
    addEventListener('blur',()=>this.clear());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
    const point=e=>{
      const r=canvas.getBoundingClientRect();
      this.mouse=[(e.clientX-r.left)*Cam.dpr,(e.clientY-r.top)*Cam.dpr];
      this.activate(e.pointerType==='touch'?'touch':'mouse');this.hasMouse=e.pointerType!=='touch';
    };
    canvas.addEventListener('pointermove',point);
    canvas.addEventListener('pointerdown',e=>{
      if(e.button!==0||this.suspended)return;
      point(e);this.enqueue(this.mouse.slice());canvas.focus({preventScroll:true});e.preventDefault?.();
    });
    canvas.addEventListener('pointercancel',()=>this.clear());
    canvas.addEventListener('pointerleave',()=>{this.hasMouse=false;});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    this.initTouch();if(this.coarse)this.activate('touch');
  }
  enqueue(point){if(this.clicks.length<16)this.clicks.push(point);}
  activate(source){
    const family=s=>s==='touch'?'touch':'desktop';
    if(family(source)!==family(this.source)){this.keys.clear();this.resetTouch();this.hasMouse=false;}
    this.source=source;this.lastEvent=performance.now();
    if(this.hint)this.hint.textContent=source==='touch'?'Toque novamente para encadear. Arraste para mirar.':'Clique novamente durante o golpe para encadear.';
    document.body?.setAttribute('data-input',source);document.body?.classList.toggle('touch-ui',this.coarse||source==='touch');
  }
  resetTouch(){
    this.touch={move:[0,0],aim:null,joystick:null,attack:null};
    this.touchUI?.zone?.classList.toggle('engaged',false);this.touchUI?.attack?.classList.toggle('aiming',false);
    if(this.touchUI?.knob)this.touchUI.knob.style.transform='translate(0px,0px)';
  }
  clear(){this.keys.clear();this.clicks.length=0;this.hasMouse=false;this.resetTouch();this.onClear?.();}
  moveSpeed(){if(this.source==='touch'){const u=clamp((Math.hypot(...this.touch.move)-.45)/.55,0,1);return lerp(125,290,u*u*(3-2*u));}return this.running()?290:125;}
  running(){return this.source==='touch'?Math.hypot(...this.touch.move)>.8:this.keys.has('ShiftLeft')||this.keys.has('ShiftRight');}
  screenVector(x,y,analog=false){
    const length=Math.hypot(x,y);if(length<.001)return [0,0];
    const angle=Math.round(Math.atan2(y,x)/(Math.PI/4))*(Math.PI/4),strength=analog?clamp((length/44-.15)/.85,0,1):1;
    x=Math.cos(angle)*strength;y=Math.sin(angle)*strength;return [(y-x)*SQ1_2,(y+x)*SQ1_2];
  }
  touchAttack(){if(!this.suspended)this.enqueue({direction:this.touch.aim?.slice()||this.lastDirection?.slice()||null});}
  initTouch(){
    const zone=document.querySelector('#touch-zone'),knob=document.querySelector('#touch-knob'),attack=document.querySelector('#touch-attack'),dodge=document.querySelector('#touch-dodge');
    if(!zone||!attack||!dodge)return;this.hint=document.querySelector('#combo-hint');this.touchUI={zone,knob,attack,dodge};
    const capture=(el,e)=>{e.preventDefault?.();try{el.setPointerCapture?.(e.pointerId);}catch{}};
    const stick=e=>{
      const j=this.touch.joystick;if(!j||j.id!==e.pointerId)return;
      this.lastEvent=performance.now();const dx=e.clientX-j.x,dy=e.clientY-j.y,l=Math.hypot(dx,dy),scale=l>44?44/l:1;
      this.touch.move=this.screenVector(dx,dy,true);if(l>7)this.lastDirection=this.touch.move.slice();
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
    const x=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'));
    const y=Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'));
    if(!x&&!y)return [0,0];const l=Math.hypot(x,y);
    const vector=[(y-x)*SQ1_2/l,(y+x)*SQ1_2/l];this.lastDirection=vector.slice();return vector;
  }
  diagnostics(){return {source:this.source,vector:this.movement(),buffer:this.clicks.length,ageMs:Math.max(0,performance.now()-this.lastEvent)};}
}
