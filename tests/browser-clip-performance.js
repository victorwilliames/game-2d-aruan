(async()=>{
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=900;const context=canvas.getContext('2d',{alpha:false});
 const transition=window.__transitionExamples[0],previousPixelScale=Cam.px,rows=[];
 const percentile=(values,p)=>{const a=values.slice().sort((x,y)=>x-y);return +a[Math.floor((a.length-1)*p)].toFixed(3);};
 try{
  Cam.px=.7;
  for(const actors of [1,5,10]){
   const core=[],draw=[];
   for(let frame=0;frame<35;frame++){
    const rigs=[],start=performance.now();
    for(let i=0;i<actors;i++){
     const s=transition.sample(.05+(frame%20)/120+i*.003),facing=Math.PI/4+(i%8)*Math.PI/4;
     const root=[Math.cos(facing)*s.root[0]-Math.sin(facing)*s.root[1],Math.sin(facing)*s.root[0]+Math.cos(facing)*s.root[1],s.root[2]];rigs.push(solveRig(s.pose,root,facing));
    }
    const sampled=performance.now();context.fillStyle='#d8d8cb';context.fillRect(0,0,1600,900);
    for(let i=0;i<actors;i++){
     const r=rigs[i],q=pj2(r.root);context.save();context.translate((i%5+.5)*320,(Math.floor(i/5)+.85)*450);context.scale(.7,.7);context.translate(-q[0],-q[1]);drawCharacter(context,r);context.restore();
    }
    const end=performance.now();if(frame>=5){core.push(sampled-start);draw.push(end-sampled);}
   }
   rows.push({actors,samples:core.length,samplingAndIKms:{p50:percentile(core,.5),p95:percentile(core,.95)},geometryAndCanvasCommandsMs:{p50:percentile(draw,.5),p95:percentile(draw,.95)}});
   await new Promise(requestAnimationFrame);
  }
 }finally{Cam.px=previousPixelScale;}
 return {schemaVersion:1,browser:navigator.userAgent.match(/(?:Chrome|Edg)\/[\d.]+/)?.[0]||'headless',gpuDisabled:true,hardwareConcurrency:navigator.hardwareConcurrency,canvas:[1600,900],rows,
  note:'Custos de JavaScript no Chrome headless: amostragem/IK e geometria/comandosCanvas. Sem sincronizarGPU/display; não sãoFPS nem certificação dehardware modesto. Cenário, inputs eIA não estão incluídos.'};
})()
