'use strict';
// Head for Phase 1: a small faceted sculpture with curved brown locks and an undercut.
// No traced image and no texture map. Facial features live on the front/side planes.
function buildHead(parts,frame){
  const f={...frame,x:vScale(frame.x,1.12),y:vScale(frame.y,1.12),z:vScale(frame.z,1.12)};
  volume(parts,f,[[-14,5,5.7],[-10,8.5,9],[-3,11,11.5],[7,10.8,12],[15,7.5,9],[19,2,3]],PAL.skin,300,12,{lw:.9,marks:3});
  // Clipped undercut cap. The front hairline stays high, nape descends to the neck.
  for(let i=0;i<14;i++){
    const a=i/14*TAU,b=(i+1)/14*TAU;
    const low=t=>Math.cos(t)>.6?10:Math.cos(t)<-.3?-6:1;
    const p=(t,z,r)=>fPoint(f,[Math.cos(t)*r*.91,Math.sin(t)*r,z]);
    const quad=[p(a,low(a),12),p(b,low(b),12),p(b,14,8.5),p(a,14,8.5)];
    addFace(parts,quad,PAL.buzz,321+i,{cull:true,ink:false,marks:6});
  }
  // Ears: narrow outer contour, warm inner planes; never a black ring.
  for(const s of [-1,1]){
    const e=[[0,s*11,5],[2,s*14,3],[2.7,s*14.5,-2],[1,s*12.5,-6],[-1,s*11,-5]].map(p=>fPoint(f,p));
    addFace(parts,e,PAL.skin,350+s,{lw:1,draw(c){line(c,[[2,s*12.5,2],[3,s*13,-1],[2,s*12,-3]].map(p=>pj2(fPoint(f,p))),'#8f4939',.8);}});
  }
  const faceTo=vDot(frame.x,Cam.toCam);
  const local=(p)=>fPoint(f,p);
  if(faceTo>-.12){
    // Angular cheek shadow on the opposite side from the key light.
    addFace(parts,[[10,-9,1],[11,-5,-4],[8,-5,-10],[6,-7,-10],[8,-10,-4]].map(local),PAL.skin,370,{color:'#b87553',lw:.15,texture:false});
    for(const s of [-1,1]){
      const visibility=vDot(vNorm(fDir(frame,[.86,s*.45,0])),Cam.toCam);
      if(visibility<.08)continue;
      const eye=[[11.4,s*2.1,1],[10.6,s*8.5,2],[11.3,s*7.2,-.9],[11.8,s*3.4,-1.3]].map(local);
      const dep=eye.reduce((t,p)=>t+proj(p)[2],0)/4;
      parts.push({depth:dep+.15,draw(c){
        const P=eye.map(pj2);polygon(c,P,'#e9dfc4',INK,.65);
        const center=pj2(local([11.95,s*5.3,.1]));
        c.save();c.beginPath();pathPoly(c,P);c.clip();ellipse(c,center[0],center[1],1.55,1.9,'#42b9e8','#193859',.6);ellipse(c,center[0],center[1],.62,1.2,'#141e30');ellipse(c,center[0]-.35,center[1]-.6,.35,.35,'#e5ffff');c.restore();
        polygon(c,[[11.3,s*1.9,3.2],[10.1,s*9,5.4],[10.8,s*7.7,6],[11.7,s*2,4.8]].map(p=>pj2(local(p))),'#3a201b',null);
        line(c,[eye[0],eye[1]].map(pj2),'#28151a',.9);
      }});
    }
    addFace(parts,[[11,0,3],[14.8,0,-4.4],[12,-2,-5],[11.6,0,-5.4]].map(local),PAL.skin,380,{color:'#e6a06b',lw:.45,texture:false});
    addFace(parts,[[11,0,3],[11.3,2,-4.5],[14.8,0,-4.4]].map(local),PAL.skin,381,{color:'#ffd098',lw:.15,texture:false});
    const mouth=[local([10.9,-3.7,-7.4]),local([12,-1,-7]),local([12,1,-7.3]),local([10.9,3.7,-7.4])];
    parts.push({depth:proj(local([12,0,-7]))[2]+.1,draw(c){line(c,mouth.map(pj2),'#734432',.75);line(c,[local([10.4,-2.4,-10]),local([10.7,2.4,-10])].map(pj2),'#f4bd8b',.8);}});
  }
  // Broad hair mass supports the locks so the hairstyle reads as volume, not a crown.
  volume(parts,{...f,o:fPoint(f,[-1,0,9])},[[0,9,8],[8,11,10],[15,7,7],[18,2,3]],{base:'#603724',shadow:'#30212a',light:'#a56435'},410,10,{lw:.6,marks:4});
  const locks=[];
  for(let row=0;row<3;row++)for(let s=-1;s<=1;s++){
    const x=8-row*7,y=s*(7-row*.3);
    locks.push({b:[x,y,15+row],c1:[x+3,y+s*2,25+row*2],c2:[x-1,y+s*4,34-row*2],t:[x-9,y+s*6,31-row*3+s*2],w:7-row*.45,tone:(row+s+3)%3});
  }
  locks.push({b:[13,-6,16],c1:[22,-4,29],c2:[24,7,19],t:[18,5,-2.8],w:7,tone:1});
  locks.push({b:[10,3,16],c1:[19,10,26],c2:[17,16,20],t:[12,15,7],w:6,tone:0});
  locks.push({b:[-8,0,12],c1:[-14,0,19],c2:[-18,1,13],t:[-16,1,4],w:6.1,tone:0});
  for(let i=0;i<locks.length;i++){
    const h=locks[i],b=local(h.b),c1=local(h.c1),c2=local(h.c2),tip=local(h.t),side=f.y;
    const A=pj2(vAddS(b,side,-h.w)),B=pj2(vAddS(b,side,h.w)),C=pj2(vAddS(c1,side,-h.w*.8)),D=pj2(vAddS(c2,side,-h.w*.35)),T=pj2(tip),E=pj2(vAddS(c2,side,h.w*.4)),F=pj2(vAddS(c1,side,h.w*.7));
    const depth=(proj(b)[2]+proj(c1)[2]+proj(c2)[2]+proj(tip)[2])/4+1;
    parts.push({depth,draw(c){const build=q=>{q.moveTo(...A);q.bezierCurveTo(...C,...D,...T);q.bezierCurveTo(...E,...F,...B);q.quadraticCurveTo(...pj2(b),...A);q.closePath();};
      celFill(c,build,[{base:'#693d29',shadow:'#2c2026',light:'#ad6b3d'},{base:'#995a31',shadow:'#42262a',light:'#d7974c'},{base:'#7e472c',shadow:'#352129',light:'#bd7a43'}][h.tone],2.5,.8);
      inkStroke(c,build,1.05,'#291b23');c.save();c.beginPath();build(c);c.clip();line(c,[pj2(vLerp(b,c1,.3)),pj2(vLerp(c1,c2,.55)),T],'#d48c47',.65);c.restore();
    }});
  }
}
