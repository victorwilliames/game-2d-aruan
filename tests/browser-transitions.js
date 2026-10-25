(async()=>{
 const byFile=name=>externalClips.find(e=>e.clip.metadata.sourceFile.endsWith('/'+name+'.fbx'));
 const walk=byFile('walking'),run=byFile('standard run'),idle=byFile('idle');
 if(!walk||!run||!idle)throw Error('Walking/corrida/idle reais ausentes');
 const choose=entry=>{ui('external-clip').value=String(externalClips.indexOf(entry));ui('external-clip').dispatchEvent(new Event('change'));};
 externalClip=walk.clip;setRigMode('v2');time=.35;pause(true);ui('external-fade').value='0.3';ui('external-phase').checked=true;
 const original=studioSample(time,1,true).rig;choose(run);const first=externalTransition;
 if(!first||!paused||time!==0||first.quality.status!=='numeric-pass')throw Error('Transição no seletor não respeita pausa/qualidade');
 const switched=studioSample(0,1,true).rig;
 for(const key of ['legL','legR','armL','armR'])if(vDist(original[key].c,switched[key].c)>1e-7)throw Error('Junta saltou ao trocar clipe');
 let maxFootClamp=0,maxSlip=0;
 for(let dir=0;dir<8;dir++)for(let i=0;i<=240;i++){
  const {rig:r,sample:s}=studioSample(i/120,dir,true),facing=Math.PI/4+dir*Math.PI/4;
  for(const b of [r.legL,r.legR])maxFootClamp=Math.max(maxFootClamp,vDist(b.c,b.target));
  for(const [side,a]of Object.entries(s.contacts)){const target=[Math.cos(facing)*a[0]-Math.sin(facing)*a[1],Math.sin(facing)*a[0]+Math.cos(facing)*a[1],a[2]+5];maxSlip=Math.max(maxSlip,vDist(r[side==='L'?'legL':'legR'].c,target));}
  equipmentParts([],r);if(r.arrowTips.length!==3)throw Error('Transição perdeu flechas');
 }
 if(maxFootClamp>1e-6||maxSlip>1e-6)throw Error('Apoio resolvido falhou: '+JSON.stringify({maxFootClamp,maxSlip}));
 const stable=JSON.stringify(studioSample(.12,1,true).sample);studioSample(.28,4,false);studioSample(.03,0,true);
 if(JSON.stringify(studioSample(.12,1,true).sample)!==stable)throw Error('Direção/travel alterou estado do mixer');
 time=.12;const beforeInterrupt=studioSample(time,1,true).rig;choose(idle);const interrupted=externalTransition;
 if(vDist(beforeInterrupt.armL.c,studioSample(0,1,true).rig.armL.c)>1e-7||interrupted.quality.status!=='numeric-pass')throw Error('Interrupção perdeu continuidade/IK');
 const fpsRoots=[];for(const fps of [30,60,144]){let elapsed=0;for(let i=0;i<fps;i++)elapsed+=1/fps;fpsRoots.push(studioSample(elapsed,1,true).rig.root);}
 if(vDist(fpsRoots[0],fpsRoots[1])>1e-8||vDist(fpsRoots[1],fpsRoots[2])>1e-8)throw Error('Transição depende do refresh');
 const before=interrupted.steady.sample(.31);time=.31;pause(false);await new Promise(r=>setTimeout(r,80));pause(true);
 if(externalTransition.steady!==null||externalTransition.fadeDuration!==0)throw Error('Histórico de origem não foi liberado após fade');
 const settled=externalTransition.sample(.31);if(vDist(before.root,settled.root)>1e-8)throw Error('Encerrar fade deslocou raiz');
 // Build a second complete switch for the consolidated visual strip.
 externalClip=run.clip;setRigMode('v2');time=.31;choose(idle);const second=externalTransition;
 window.__transitionExamples=[first,second];
 ui('external-fade').value='0';choose(walk);if(externalTransition!==null)throw Error('Troca imediata não respeitada');ui('external-fade').value='0.3';
 time=.35;ui('external-phase').checked=false;choose(run);if(externalTransition.startTime!==0)throw Error('Fase automática não foi desativada');ui('external-phase').checked=true;
 ui('external-fade').value='0.15';choose(walk);if(externalTransition.fadeDuration!==.15)throw Error('Duração0,15 não aplicada');
 ui('external-fade').value='0.6';choose(idle);if(externalTransition.fadeDuration!==.6)throw Error('Duração0,60 não aplicada');ui('external-fade').value='0.3';
 const s=AruanClips.sample(walk.clip,.35),staticPose=AruanClips.fields.map(k=>s.pose[k]),short={schema:'aruan-clip',version:1,profile:'aruan-humanoid-v2',name:'Teste de clipe curto',duration:.1,loop:false,fields:[...AruanClips.fields],times:[0,.1],poses:[staticPose,staticPose.slice()],root:[[0,0,0],[0,0,0]],cycleDelta:[0,0,0],contacts:Object.entries(s.contacts).map(([side,anchor])=>({side,start:0,end:.1,anchor:anchor.map((v,i)=>v-s.root[i])})),events:[]};
 loadExternalClip(JSON.stringify(short),'Teste curto');const shortEntry=externalClips.at(-1);externalClip=walk.clip;setRigMode('v2');time=.35;pause(false);choose(shortEntry);
 for(let i=0;i<100&&(!paused||time<.3-1e-6);i++)await new Promise(r=>setTimeout(r,25));
 if(!paused||time<.3-1e-6||externalTransition.fadeDuration!==0)throw Error('Clipe menor que o fade parou no meio da transição');
 return {transitions:'seletor real, pausa/interrupção,8direções,2ciclos,30/60/144Hz e liberação de histórico',maxFootClamp,maxSlip};
})()
