// Executed inside a real Chrome document by tests/headless.cjs.
(()=>{
 const check=(v,m)=>{if(!v)throw Error(m);};
 setToggle('paused',false);resetPlayer();
 const key=(code,target=window)=>target.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true,cancelable:true}));
 for(const codes of [['KeyW'],['KeyW','KeyD'],['KeyD'],['KeyS','KeyD'],['KeyS'],['KeyS','KeyA'],['KeyA'],['KeyW','KeyA']]){Input.clear();codes.forEach(c=>key(c));check(Math.abs(Math.hypot(...Input.movement())-1)<1e-12,'diagonal speed');}
 Input.clear();const edit=document.createElement('textarea');document.body.append(edit);key('KeyD',edit);check(Input.keys.size===0,'textarea stole movement');edit.remove();
 key('KeyD');window.dispatchEvent(new Event('blur'));check(Input.keys.size===0,'blur stuck key');
 const q=pj2([Player.pos[0]+120,Player.pos[1],0]);
 canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,clientX:(q[0]*Cam.px+Cam.offX)/Cam.dpr,clientY:(q[1]*Cam.px+Cam.offY)/Cam.dpr,bubbles:true}));
 update(1/120);check(Player.state==='attack'&&Math.abs(angDiff(Player.facing,0))<1e-8,'aim/next step latency');
 setToggle('paused',true);key('Space');canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,clientX:1,clientY:1}));check(Input.clicks.length===0,'pause ghost click');
 setToggle('paused',false);resetPlayer();setToggle('paused',true);render();
 return {input:'8 directions, editable target, blur, next-step aim and pause passed',simulationLatencyMs:1000/120};
})()
