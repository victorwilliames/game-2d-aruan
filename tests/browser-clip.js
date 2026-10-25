(()=>{
 if(rigMode!=='v2'||!externalClip||!ui('motion').disabled)throw Error('Modo V2 não ativado');
 let maxFootClamp=0,maxGripGap=0,maxSlip=0;const data=[];
 for(let dir=0;dir<8;dir++)for(let i=0;i<250;i++){
  const t=i/120,{rig:r,sample:s}=studioSample(t,dir,true),facing=Math.PI/4+dir*Math.PI/4;
  for(const b of [r.legL,r.legR])maxFootClamp=Math.max(maxFootClamp,vDist(b.c,b.target));
  equipmentParts([],r);if(r.arrowTips.length!==3)throw Error('Três flechas não preservadas');
  // Equipment remains stowed on unarmed imported walking; V1 grip is unchanged.
  if(r.pose.equip!==0)maxGripGap=Math.max(maxGripGap,vDist(r.bowGrip,r.armR.c));
  for(const [side,anchor]of Object.entries(s.contacts)){
   const target=[Math.cos(facing)*anchor[0]-Math.sin(facing)*anchor[1],Math.sin(facing)*anchor[0]+Math.cos(facing)*anchor[1],anchor[2]+5];
   maxSlip=Math.max(maxSlip,vDist(r[side==='L'?'legL':'legR'].c,target));
  }
 }
 if(maxFootClamp>1e-6||maxSlip>1e-6||maxGripGap>1e-6)throw Error('Clips/contatos: '+JSON.stringify({maxFootClamp,maxSlip,maxGripGap}));
 for(const fps of [30,60,144]){
  // Same absolute time, independent of number of render samples.
  let elapsed=0;for(let i=0;i<fps;i++)elapsed+=1/fps;
  data.push(studioSample(elapsed,1,true).rig.armL.c);
 }
 if(vDist(data[0],data[1])>1e-8||vDist(data[0],data[2])>1e-8)throw Error('Reprodução depende do refresh');
 const previous=externalClip;
 try{loadExternalClip('{"schema":"wrong"}');throw Error('JSON inválido foi aceito');}catch(e){if(externalClip!==previous)throw Error('Importação inválida alterou o clipe');}
 return {clip:'V2 opt-in, oito direções, dois ciclos, três flechas, JSON atômico,30/60/144Hz',maxFootClamp,maxSlip,source:externalClip.metadata.sourceFile};
})()
