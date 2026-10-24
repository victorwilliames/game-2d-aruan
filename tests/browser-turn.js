// A controlled six-frame turn, with support markers hidden to inspect toes and palms.
(()=>{const out=document.createElement('canvas');out.width=1600;out.height=900;const ctx=out.getContext('2d'),old={motion,time,framing,feet:ui('feet').checked,bones:ui('bones').checked,joints:ui('joints').checked};
 try{motion='idle';time=0;framing='body';for(const key of ['feet','bones','joints'])ui(key).checked=false;for(let i=0;i<6;i++){const angle=110+i*8;ctx.save();ctx.beginPath();ctx.rect(i%3*1600/3,Math.floor(i/3)*450,1600/3,450);ctx.clip();ctx.translate(i%3*1600/3,Math.floor(i/3)*450);drawView(ctx,1600/3,450,0,(angle-45)/45,false);ctx.fillStyle='#263d3d';ctx.font='16px system-ui';ctx.fillText('Giro · '+angle+'° · '+(i/60).toFixed(3)+' s',18,28);ctx.restore();}return out.toDataURL('image/jpeg',.94);}
 finally{motion=old.motion;time=old.time;framing=old.framing;for(const key of ['feet','bones','joints'])ui(key).checked=old[key];renderStudio();}
})()
