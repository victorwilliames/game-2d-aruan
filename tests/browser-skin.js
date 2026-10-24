// Protect the unfilled inner elbow/knee space: joined ink must never become a hull across bones.
(()=>{const old=Cam.px,out=document.createElement('canvas');out.width=400;out.height=400;const ctx=out.getContext('2d'),parts=[];
 try{Cam.px=3;ctx.translate(150,150);ctx.scale(3,3);
  joinedSkinInk(ctx,[[-10,-4],[10,-4],[10,4],[-10,4]],[[0,-8],[20,-8],[20,8],[0,8]],2,'#000000');
  const internalInk=ctx.getImageData(165,162,1,1).data[3],externalInk=ctx.getImageData(135,162,1,1).data[3];if(internalInk!==0||externalInk!==255)throw Error('Skin ink clipping lost exposed edge or retained internal seam');ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,400,400);ctx.restore();
  fleshPair(parts,{a:[0,0,0],b:[50,0,0],c:[50,50,0]},[5,5,5,5],[0,0,1],31);parts.sort((a,b)=>a.depth-b.depth);for(const part of parts)part.draw(ctx);const alpha=p=>{const q=pj2(p);return ctx.getImageData(Math.round(q[0]*3+150),Math.round(q[1]*3+150),1,1).data[3];};const gap=alpha([25,25,0]),joint=alpha([50,0,0]);if(gap!==0||joint!==255||alpha([25,0,0])!==255||alpha([50,25,0])!==255)throw Error('Skin joint union lost negative space or continuity');return {skinJoint:'separate fills, connected joint and empty inner bend',innerGapAlpha:gap,jointAlpha:joint,internalInkAlpha:internalInk,externalInkAlpha:externalInk};}
 finally{Cam.px=old;}
})()
