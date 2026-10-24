'use strict';
const sheet=document.querySelector('#inspection'),c=sheet.getContext('2d'),turn=document.querySelector('#turnaround'),tc=turn.getContext('2d');
const ui=id=>document.getElementById(id);
let time=0,paused=false,motion='idle',rate=1,direction=1,framing='body',zoom=1;
let studioDirty=true,studioDpr=Math.min(devicePixelRatio||1,2);
function invalidateStudio(){studioDirty=true;}
const names=['S · FRENTE','SE · TRÊS QUARTOS','L · PERFIL DIREITO','NE · COSTAS','N · COSTAS','NO · COSTAS','O · PERFIL ESQUERDO','SO · TRÊS QUARTOS'];
const duration=()=>motion==='idle'?2.4:motion==='walk'?1.28:motion==='run'?.9:motion==='dodge'?DODGE_DURATION:ATTACKS[+motion].total;
function pause(v){paused=v;invalidateStudio();ui('freeze').setAttribute('aria-pressed',String(v));ui('freeze').textContent=v?'Reproduzir':'Pausar';}
ui('freeze').onclick=()=>pause(!paused);ui('back').onclick=()=>{pause(true);time=Math.max(0,time-1/60);};ui('forward').onclick=()=>{pause(true);time=Math.min(duration(),time+1/60);};ui('restart').onclick=()=>{time=0;invalidateStudio();};
ui('scrub').oninput=e=>{pause(true);time=+e.target.value/1000*duration();};ui('motion').onchange=e=>{motion=e.target.value;time=0;invalidateStudio();};ui('rate').onchange=e=>{rate=+e.target.value;invalidateStudio();};
ui('direction').onchange=e=>{direction=+e.target.value;invalidateStudio();};ui('framing').onchange=e=>{framing=e.target.value;invalidateStudio();};ui('zoom').oninput=e=>{zoom=+e.target.value;invalidateStudio();};
for(const key of ['bones','joints','feet','travel'])ui(key).addEventListener('change',invalidateStudio);
addEventListener('resize',invalidateStudio);
for(const target of [sheet,turn])target.addEventListener('contextrestored',invalidateStudio);
if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(invalidateStudio);observer.observe(sheet);observer.observe(turn);}
function studioSample(t,dir,travel=true){const facing=Math.PI/4+dir*Math.PI/4;let pose,dist=0,phase='RESPIRAÇÃO';
 if(motion==='idle')pose=lerpPose(IDLE_A,IDLE_B,(1-Math.cos(t/2.4*TAU))/2);
 else if(motion==='walk'||motion==='run'){const run=motion==='run'?1:0,period=duration()/2,cyc=2*lerp(20,28,run)/lerp(.62,.43,run);pose=locomotionPose(t/period,run);dist=(t/period-1)*cyc;phase=run?'CORRIDA':'CAMINHADA';}
 else if(motion==='dodge'){pose=dodgePose(t);dist=dodgeTravel(t)-dodgeTravel(DODGE_DURATION)*.5;phase=t<.16?'AGACHAR':t<.64?'ROLAR':'RECUPERAR';}
 else{const s=sampleAttack(+motion,t);pose=s.pose;dist=s.lunge*ATTACKS[+motion].lunge;phase=s.phase<2?'ANTECIPAÇÃO':s.trail?'GOLPE':'RECUPERAÇÃO';}
 const u=t/duration(),cyclic=motion==='walk'||motion==='run';
 const energy=motion==='run'?.7:motion==='walk'?.25:motion==='idle'?.08:Math.sin(u*Math.PI)*.5;
 pose.secondary=Math.sin(u*TAU*(cyclic?2:1)-.75)*energy;
 pose.effort=['0','1','2'].includes(motion)?Math.sin(u*Math.PI)*.85:motion==='dodge'?Math.sin(u*Math.PI)*.5:0;
 if(!travel)dist=0;const root=[Math.cos(facing)*dist,Math.sin(facing)*dist,0],rig=solveRig(pose,root,facing);return {rig,phase};
}
function grid(ctx,x,y,scale,size=300){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 for(let i=-size;i<size;i+=25)for(let j=-size;j<size;j+=25){const pts=[[i,j,0],[i+25,j,0],[i+25,j+25,0],[i,j+25,0]].map(pj2);polygon(ctx,pts,((i+j)/25)%2?'#c2c6b9':'#d0d2c4',null);}
 for(let i=-size;i<=size;i+=25){line(ctx,[pj2([i,-size,0]),pj2([i,size,0])],'#a9b4a7',.35);line(ctx,[pj2([-size,i,0]),pj2([size,i,0])],'#a9b4a7',.35);}
 line(ctx,[pj2([-size,0,0]),pj2([size,0,0])],'#b47b65',.7);line(ctx,[pj2([0,-size,0]),pj2([0,size,0])],'#668c8a',.7);ctx.restore();}
function drawView(ctx,w,h,t,dir,large){const dpr=Math.min(devicePixelRatio||1,2),sample=studioSample(t,dir,large&&ui('travel').checked&&framing!=='face'),rig=sample.rig;
 ctx.fillStyle='#d8d8cb';ctx.fillRect(0,0,w,h);
 const close=large&&framing==='face';let scale=large?Math.min(w/330,h/220)*zoom:Math.min(w/190,h/210),ox=w/2,oy=large?h*.79:h*.91;
 if(close)scale=Math.min(w/155,h/140)*zoom;
 if(!large){
  equipmentParts([],rig);const f=rig.bowFrame;
  const points=[rig.legL.c,rig.legR.c,rig.armL.c,rig.armR.c,...[[-38,0,0],[38,0,0],[0,-40,0],[0,40,0],[0,0,76]].map(p=>fPoint(rig.head,p)),fPoint(f,[0,0,0]),fPoint(f,[0,19,52]),fPoint(f,[0,0,BODY.bowLength])].map(pj2);
  const xs=points.map(p=>p[0]),left=Math.min(...xs)-8,right=Math.max(...xs)+8;
  scale=Math.min(scale,w/(right-left+16));ox=w/2-(left+right)*.5*scale;
 }
 if(!(large&&framing==='face'))grid(ctx,ox,oy,scale,large?320:90);
 ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);Cam.px=scale*dpr;
 if(close){const q=pj2(rig.head.o);ctx.translate(-q[0],-q[1]-h*.28/scale);}
 const q=pj2(rig.root);ellipse(ctx,q[0],q[1]+2,24,10,'#3d514e38');drawCharacter(ctx,rig);
 const opts={bones:ui('bones').checked,joints:ui('joints').checked,feet:ui('feet').checked};if(opts.bones||opts.joints||opts.feet)drawSkeleton(ctx,rig,opts);
 ctx.restore();return sample;
}
function renderStudio(){studioDirty=false;const dpr=Math.min(devicePixelRatio||1,2);studioDpr=dpr;const r=sheet.getBoundingClientRect(),w=r.width,h=r.height;
 if(sheet.width!==Math.round(w*dpr)||sheet.height!==Math.round(h*dpr)){sheet.width=Math.round(w*dpr);sheet.height=Math.round(h*dpr);}c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,sheet.width,sheet.height);c.setTransform(dpr,0,0,dpr,0,0);const s=drawView(c,w,h,time,direction,true);
 ui('view-label').textContent=names[direction];ui('pose-label').textContent=s.phase;ui('time-label').textContent=time.toFixed(2)+' s';ui('duration-label').textContent=duration().toFixed(2)+' s';ui('scrub').value=Math.round(time/duration()*1000);ui('weapon-state').textContent=s.rig.pose.equip>.95?'Na mão · pela ponta':s.rig.pose.equip>.05?'Equipando / guardando':'Nas costas';
 const tw=turn.getBoundingClientRect().width,cols=tw<700?2:4,cw=tw/cols,ch=330,th=ch*(8/cols);
 if(turn.width!==Math.round(tw*dpr)||turn.height!==Math.round(th*dpr)){turn.width=Math.round(tw*dpr);turn.height=Math.round(th*dpr);turn.style.aspectRatio=`${tw}/${th}`;}
 tc.setTransform(1,0,0,1,0,0);tc.clearRect(0,0,turn.width,turn.height);tc.setTransform(dpr,0,0,dpr,0,0);
 for(let i=0;i<8;i++){const x=i%cols*cw,y=Math.floor(i/cols)*ch;tc.save();tc.beginPath();tc.rect(x,y,cw,ch);tc.clip();tc.translate(x,y);drawView(tc,cw,ch,time,i,false);tc.fillStyle='#3d5554';tc.font='10px system-ui';tc.fillText(names[i],15,23);tc.strokeStyle='#80958b';tc.lineWidth=.7;tc.strokeRect(0,0,cw,ch);tc.restore();}
}
let last=performance.now();function loop(now){const dt=clamp((now-last)/1000,0,.05);last=now;if(!paused){time+=dt*rate;if(time>duration())time%=duration();}if(studioDpr!==Math.min(devicePixelRatio||1,2))invalidateStudio();if(!paused||studioDirty)renderStudio();requestAnimationFrame(loop);}requestAnimationFrame(loop);
