// Work cost in headless software rendering; this is deliberately not an FPS claim.
(async()=>{
 resize();setToggle('paused',true);const result={};
 for(const stress of [false,true]){
  resetPlayer();beginAttack(0,0);const samples=[];
  for(let n=0;n<150;n++){
   await new Promise(resolve=>requestAnimationFrame(resolve));
   if(stress){FX.burst([Player.pos[0],Player.pos[1],60],192);if(n%15===0)FX.impact(Player.pos);}
   if(Player.state==='move')beginAttack(0,0);
   const start=performance.now();update(1/120);render();const work=performance.now()-start;
   if(n>=30)samples.push(work);
  }
  samples.sort((a,b)=>a-b);result[stress?'effects192':'baseline']={medianMs:samples[60],p95Ms:samples[114],samples:samples.length};
 }
 resetPlayer();return result;
})()

