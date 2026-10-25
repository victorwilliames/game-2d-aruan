'use strict';
const view=document.querySelector('#aruan-canvas'),paint=view.getContext('2d'),notice=document.querySelector('#canvas-notice');
let converted=null,frameTime=0,viewDirection=1,travel=false,bones=false,dirty=true,highQuality=false;
function sampleConverted(t=frameTime,dir=viewDirection,withTravel=travel){
 const sample=AruanClips.sample(converted,t),facing=Math.PI/4+dir*Math.PI/4;
 const root=withTravel?[Math.cos(facing)*sample.root[0]-Math.sin(facing)*sample.root[1],Math.sin(facing)*sample.root[0]+Math.cos(facing)*sample.root[1],0]:[0,0,0];
 return {rig:solveRig(sample.pose,root,facing),sample};
}
function draw(){
 dirty=false;const r=view.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,highQuality?2:1);
 if(view.width!==Math.round(r.width*dpr)||view.height!==Math.round(r.height*dpr)){view.width=Math.round(r.width*dpr);view.height=Math.round(r.height*dpr);}
 paint.setTransform(dpr,0,0,dpr,0,0);paint.fillStyle='#d8d8cb';paint.fillRect(0,0,r.width,r.height);
 if(!converted)return;
 const {rig,sample}=sampleConverted(),scale=Math.min(r.width/280,r.height/220),origin=pj2(rig.root);
 view.dataset.direction=String(viewDirection);view.dataset.time=String(frameTime);
 paint.save();paint.translate(r.width/2-origin[0]*scale,r.height*.8-origin[1]*scale);paint.scale(scale,scale);Cam.px=scale*dpr;
 for(let i=-200;i<=200;i+=25){
  line(paint,[pj2([i,-200,0]),pj2([i,200,0])],'#b3bdaf',.4);line(paint,[pj2([-200,i,0]),pj2([200,i,0])],'#b3bdaf',.4);
 }
 const root=pj2(rig.root);ellipse(paint,root[0],root[1]+2,24,10,'#3d514e38');drawCharacter(paint,rig);
 if(bones)drawSkeleton(paint,rig,{bones:true,joints:true,feet:true});paint.restore();
 notice.textContent=converted.name+' · Canvas 2D real · '+sample.time.toFixed(2)+' s · '+Object.keys(sample.contacts).map(s=>'apoio '+s).join(' / ')+(travel?' · raiz em mundo':' · visualização no lugar');
}
addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent)return;
 const message=event.data;if(!message||typeof message.type!=='string')return;
 try{
  if(message.type==='movalab.quality'){highQuality=Boolean(message.high);dirty=true;}
  else if(message.type==='movalab.clear'){converted=null;notice.textContent='Converta a animação selecionada.';dirty=true;}
  else if(message.type==='movalab.clip'){
   converted=AruanClips.validate(message.clip);frameTime=0;dirty=true;
   const quality=AruanClips.inspect(converted,solveRig),loopQuality=AruanClips.inspectLoop(converted,solveRig);
   parent.postMessage({type:'movalab.canvas-ready',requestId:message.requestId,name:converted.name,contacts:converted.contacts.length,quality,loopQuality},location.origin);
  }else if(message.type==='movalab.time'&&converted){
   if(!Number.isFinite(message.time)||!Number.isInteger(message.direction)||message.direction<0||message.direction>7)return;
   if(frameTime!==message.time||viewDirection!==message.direction||travel!==Boolean(message.travel)||bones!==Boolean(message.bones))dirty=true;
   frameTime=message.time;viewDirection=message.direction;travel=Boolean(message.travel);bones=Boolean(message.bones);
  }
 }catch(error){notice.textContent=error.message;parent.postMessage({type:'movalab.canvas-error',error:error.message},location.origin);}
});
new ResizeObserver(()=>dirty=true).observe(view);addEventListener('resize',()=>dirty=true);
function tick(){if(dirty)draw();requestAnimationFrame(tick);}requestAnimationFrame(tick);
parent.postMessage({type:'movalab.canvas-mounted'},location.origin);
