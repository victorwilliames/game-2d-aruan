'use strict';
class Controls {
  constructor(canvas){this.canvas=canvas;this.keys=new Set();this.mouse=[0,0];this.hasMouse=false;this.clicks=[];this.actions={};
    addEventListener('keydown',e=>{if(e.target.matches('input,select,button'))return;this.keys.add(e.code);if(!e.repeat&&this.actions[e.code])this.actions[e.code]();if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();});
    addEventListener('keyup',e=>this.keys.delete(e.code));addEventListener('blur',()=>{this.keys.clear();this.clicks=[];});
    const point=e=>{const r=canvas.getBoundingClientRect();this.mouse=[(e.clientX-r.left)*Cam.dpr,(e.clientY-r.top)*Cam.dpr];this.hasMouse=true;};
    canvas.addEventListener('pointermove',point);canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;point(e);this.clicks.push(this.mouse.slice());canvas.focus();});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
  }
  movement(){let x=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft')),y=Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'));
    if(!x&&!y)return [0,0];const l=Math.hypot(x,y);return [(y-x)*SQ1_2/l,(y+x)*SQ1_2/l];}
}
