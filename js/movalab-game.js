'use strict';
globalThis.MovaGame=(()=>{
 const slots=new Map();let config=null,active=null,clock=0,selected=null,transition=null,input=null,lastPose=null;
 function start(binding){if(!binding||!slots.has(binding))return;selected=binding;clock=0;transition=null;}
 async function init(controls){
  input=controls;
  try{
   const r=await fetch('tools/movalab/workspace/game-bindings.json',{cache:'no-store'});if(!r.ok)throw Error('Configuração indisponível');config=MovaBindings.validate(await r.json());
   const loaded=await Promise.all(config.bindings.map(async b=>{const r=await fetch('tools/movalab/workspace/exports/'+b.filename,{cache:'no-store'});if(!r.ok)throw Error('Clipe indisponível: '+b.name);return [b,AruanClips.validate(await r.json())];}));slots.clear();active=null;selected=null;transition=null;
   for(const [b,c]of loaded)slots.set(b,c);
   for(const b of config.bindings)if(b.slot==='action')input.actions[b.key]=()=>{if(!input.suspended)start(b);};
   if(loaded.length){const label=document.createElement('a');label.href='http://127.0.0.1:5320/';label.textContent='MovaLab ativo · '+loaded.map(([b])=>b.slot==='action'?b.key.replace('Key','')+': '+b.name:b.slot+': '+b.name).join(' · ');label.id='movalab-active';label.style.cssText='position:fixed;top:76px;left:16px;max-width:80vw;background:#152925e8;color:#d5efae;padding:8px 12px;font:12px system-ui;z-index:20';document.body.append(label);}
  }catch(e){console.warn('MovaLab: '+e.message+'; animações originais mantidas.');slots.clear();}
 }
 function pose(dt,player,fallback){
  const speed=Math.hypot(...player.vel);
  if(selected&&clock>=slots.get(selected).duration){selected=null;active=null;transition=null;}
  const desired=selected||config?.bindings.find(b=>b.slot===(speed>170?'run':speed>1?'walk':'idle'));
  if(!desired||!slots.has(desired)||player.state!=='move'){active=null;transition=null;selected=null;lastPose=fallback;return null;}
  const c=slots.get(desired);
  if(active!==desired){
   active=desired;clock=0;
   const initial={pose:{...(lastPose||fallback)},root:[0,0,0],contacts:{},time:0,cycles:0};
   transition=AruanClips.createTransition(()=>initial,c,{duration:.18,startTime:0});
  }
  clock+=dt;if(transition&&clock>=.18)transition=null;
  const s=transition?transition.sample(clock):AruanClips.sample(c,clock,{loop:!selected&&c.loop});
  const p=s.pose;lastPose=p;
  // The controller owns world movement; existing FootPlant holds support in world.
  // External root translation is deliberately not added a second time.
  return {pose:p,name:c.name};
 }
 return {init,pose,get bindings(){return config?.bindings||[];},get active(){return active?.name||null;}};
})();
