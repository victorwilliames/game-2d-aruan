// Actual RAF redraws and Menu polling; standard API input is simulated, not physical hardware.
(async()=>{
 const check=(v,m)=>{if(!v)throw Error('Game economy: '+m);},frames=async n=>{for(let i=0;i<n;i++)await new Promise(requestAnimationFrame);};
 const original=render,descriptor=Object.getOwnPropertyDescriptor(navigator,'getGamepads'),old={paused:Game.paused,debug:Game.debug,slow:Game.slow,t:Game.t,hits:Game.hits,acc,source:Input.source,mouse:Input.mouse.slice(),hasMouse:Input.hasMouse,appearance:Appearance.current};
 let paints=0,cost=0;
 try{
  setToggle('paused',true);resetPlayer();render();await frames(3);const t=Game.t;
  render=function(...args){const start=performance.now();paints++;try{return original(...args);}finally{cost+=performance.now()-start;}};
  await frames(12);const stable={frames:12,paints,paintWorkMs:cost};check(paints===0,'paused stable redraws '+JSON.stringify(stable));check(Game.t===t,'paused simulation does not advance');
  const changed=async(fn,label)=>{const before=paints;fn();await frames(2);check(paints>before,label+' updates');check(paints-before<=2,label+' coalesces');};
  await changed(()=>document.querySelector('#debug').click(),'debug');await changed(()=>document.querySelector('#debug').click(),'debug off');await changed(()=>document.querySelector('#slow').click(),'slow');await changed(()=>document.querySelector('#slow').click(),'slow off');
  await changed(()=>canvas.dispatchEvent(new PointerEvent('pointermove',{pointerId:80,pointerType:'mouse',clientX:211,clientY:171,bubbles:true})),'pointer');check(Input.hasMouse&&Input.source==='mouse','pointer state');
  await changed(()=>canvas.dispatchEvent(new PointerEvent('pointerleave',{pointerId:80,pointerType:'mouse'})),'pointer leave');
  await changed(()=>Input.activate('touch'),'touch handoff');await changed(()=>Input.activate('keyboard'),'desktop handoff');
  await changed(()=>Appearance.preset('mata'),'appearance');await changed(()=>Appearance.reset(),'appearance reset');await changed(()=>document.querySelector('#reset').click(),'reset');await changed(()=>window.dispatchEvent(new Event('resize')),'resize event');await changed(()=>canvas.dispatchEvent(new Event('contextrestored')),'context restored');check(Game.t===t,'controls preserve paused simulation');
  const controlPaints=paints,gp={index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[gp]});window.dispatchEvent(new Event('focus'));Input.pollGamepad();
  gp.buttons[9]={pressed:true,value:1};const before=paints;await frames(3);check(!Game.paused&&Game.t>t&&paints>before,'RAF polling Menu resumes simulation/render');gp.buttons[9]={pressed:false,value:0};await frames(2);gp.buttons[9]={pressed:true,value:1};await frames(2);check(Game.paused,'RAF polling Menu pauses');gp.buttons[9]={pressed:false,value:0};await frames(3);const settled=paints,time=Game.t;await frames(8);check(paints===settled&&Game.t===time,'Menu pause settles without stopping polling');
  return {game:'all controls invalidate, paused simulation stable, simulated Menu works through RAF',stable,controlPaints,physicalControllerVerified:false};
 }finally{render=original;if(descriptor)Object.defineProperty(navigator,'getGamepads',descriptor);else delete navigator.getGamepads;Input.pollGamepad();resetPlayer();setToggle('debug',old.debug);setToggle('slow',old.slow);setToggle('paused',old.paused);Input.activate(old.source);Input.mouse=old.mouse;Input.hasMouse=old.hasMouse;Appearance.set(old.appearance);Game.t=old.t;Game.hits=old.hits;acc=old.acc;render();}
})()
