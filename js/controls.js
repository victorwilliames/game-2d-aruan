'use strict';
class Controls {
  constructor(canvas) {
    this.canvas=canvas;this.keys=new Set();this.mouse=[0,0];this.hasMouse=false;
    this.clicks=[];this.actions={};this.suspended=false;this.lastEvent=0;this.source='keyboard';
    const editable=t=>t&&(t.isContentEditable||(typeof t.matches==='function'&&t.matches('input,select,button,textarea,[contenteditable="true"]')));
    addEventListener('keydown',e=>{
      if(editable(e.target))return;
      this.lastEvent=performance.now();this.source='keyboard';
      if(!e.repeat&&this.actions[e.code])this.actions[e.code]();
      if(!this.suspended)this.keys.add(e.code);
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    });
    addEventListener('keyup',e=>this.keys.delete(e.code));
    addEventListener('blur',()=>this.clear());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
    const point=e=>{
      const r=canvas.getBoundingClientRect();
      this.mouse=[(e.clientX-r.left)*Cam.dpr,(e.clientY-r.top)*Cam.dpr];
      this.hasMouse=true;this.lastEvent=performance.now();this.source='mouse';
    };
    canvas.addEventListener('pointermove',point);
    canvas.addEventListener('pointerdown',e=>{
      if(e.button!==0||this.suspended)return;
      point(e);this.enqueue(this.mouse.slice());canvas.focus({preventScroll:true});e.preventDefault?.();
    });
    canvas.addEventListener('pointercancel',()=>this.clear());
    canvas.addEventListener('pointerleave',()=>{this.hasMouse=false;});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
  }
  enqueue(point){if(this.clicks.length<16)this.clicks.push(point);}
  clear(){this.keys.clear();this.clicks.length=0;this.hasMouse=false;this.onClear?.();}
  movement(){
    if(this.suspended)return [0,0];
    const x=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'));
    const y=Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'));
    if(!x&&!y)return [0,0];const l=Math.hypot(x,y);
    return [(y-x)*SQ1_2/l,(y+x)*SQ1_2/l];
  }
  diagnostics(){return {source:this.source,vector:this.movement(),buffer:this.clicks.length,ageMs:Math.max(0,performance.now()-this.lastEvent)};}
}
