// Compare actual RGBA, independent of render invalidation implementation.
(async()=>{
 const check=(v,m)=>{if(!v)throw Error('Game buffer: '+m);},frames=async n=>{for(let i=0;i<n;i++)await new Promise(requestAnimationFrame);};
 const hash=()=>{const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,pixels=new Uint32Array(data.buffer,data.byteOffset,data.byteLength/4);let value=2166136261;for(const pixel of pixels)value=Math.imul(value^pixel,16777619);return value>>>0;};
 const original=render,old={paused:Game.paused,t:Game.t,hits:Game.hits,acc,source:Input.source,mouse:Input.mouse.slice(),hasMouse:Input.hasMouse};let paints=0;
 try{setToggle('paused',true);resetPlayer();Input.activate('keyboard');Input.hasMouse=false;Game.t=0;render();await frames(3);const base=hash();render();check(hash()===base,'retained frame differs from forced repaint');render=function(...args){paints++;return original(...args);};
  canvas.dispatchEvent(new PointerEvent('pointermove',{pointerId:81,pointerType:'mouse',clientX:250,clientY:200,bubbles:true}));await frames(2);check(hash()!==base,'reticle did not update pixels');canvas.dispatchEvent(new PointerEvent('pointerleave',{pointerId:81,pointerType:'mouse'}));await frames(2);check(hash()===base,'reticle left a ghost');
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.restore();check(hash()!==base,'buffer erase fixture failed');const before=paints;canvas.dispatchEvent(new Event('contextrestored'));await frames(3);check(hash()===base&&paints>before,'context restoration did not recover original pixels');const settled=paints;await frames(6);check(paints===settled,'recovery did not settle');
  return {gameBuffer:'retained/forced equal, reticle erased, simulated context recovered',hash:base.toString(16),stablePaints:0};
 }finally{render=original;resetPlayer();setToggle('paused',old.paused);Input.activate(old.source);Input.mouse=old.mouse;Input.hasMouse=old.hasMouse;Game.t=old.t;Game.hits=old.hits;acc=old.acc;render();}
})()
