// Actual redraw counts, not an FPS estimate. Exercises every preview control.
(async()=>{
 const check=(v,m)=>{if(!v)throw Error('Studio economy: '+m);},frames=async n=>{for(let i=0;i<n;i++)await new Promise(requestAnimationFrame);};
 const original=renderStudio,old={motion,time,paused,rate,direction,framing,zoom,appearance:Appearance.current,flags:Object.fromEntries(['bones','joints','feet','travel'].map(k=>[k,ui(k).checked]))};
 let paints=0,cost=0;
 try{
  pause(true);motion='idle';time=0;original();await frames(3);
  renderStudio=function(...args){const start=performance.now();paints++;try{return original(...args);}finally{cost+=performance.now()-start;}};
  await frames(12);const stable={frames:12,paints,paintWorkMs:cost};check(paints===0,'paused stable redraws '+JSON.stringify(stable));
  const changed=async(fn,label)=>{const before=paints;fn();await frames(2);check(paints>before,label+' updates');check(paints-before<=2,label+' coalesces');};
  const value=(id,v,event='change')=>{ui(id).value=v;ui(id).dispatchEvent(new Event(event,{bubbles:true}));};
  await changed(()=>value('motion','walk'),'motion');check(ui('pose-label').textContent==='CAMINHADA','pose label');
  await changed(()=>value('rate','0.25'),'rate');await changed(()=>value('direction','2'),'direction');await changed(()=>value('framing','face'),'framing');await changed(()=>value('zoom','1.2','input'),'zoom');
  for(const key of ['bones','joints','feet','travel'])await changed(()=>ui(key).click(),key);
  await changed(()=>value('scrub','500','input'),'scrub');await changed(()=>ui('back').click(),'back');await changed(()=>ui('forward').click(),'forward');await changed(()=>ui('restart').click(),'restart');check(time===0,'restart time');
  await changed(()=>Appearance.preset('mata'),'appearance');await changed(()=>window.dispatchEvent(new Event('resize')),'resize event');
  const controlPaints=paints;ui('freeze').click();const start=time,n=paints;await frames(6);check(time>start&&paints-n>=5,'animation continues when playing');ui('freeze').click();await frames(3);const settled=paints;await frames(8);check(paints===settled,'pause becomes stable again');
  return {studio:'all controls invalidate; animation plays; pause stable',stable,controlPaints};
 }finally{renderStudio=original;motion=old.motion;time=old.time;rate=old.rate;direction=old.direction;framing=old.framing;zoom=old.zoom;for(const [key,val]of Object.entries(old.flags))ui(key).checked=val;for(const key of ['motion','rate','direction','framing','zoom'])ui(key).value=old[key];Appearance.set(old.appearance);pause(old.paused);renderStudio();}
})()
