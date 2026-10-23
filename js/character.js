'use strict';
// Character painter. Every plate is a small projected volume, painted as inked facets.
// Shared with head.js; sorting uses camera-space depth, never screen Y alone.
function facePart(points, tones, seed=0, opt={}) {
  const n=vNorm(vCross(vSub(points[1],points[0]),vSub(points[2],points[0])));
  if(opt.cull&&vDot(n,Cam.toCam)<-.02)return null;
  const pts=points.map(pj2),depth=points.reduce((s,p)=>s+proj(p)[2],0)/points.length+(opt.bias||0);
  const dot=vDot(n,Cam.lightW),color=dot>.48?(tones.light||tones.base):dot>-.18?tones.base:(tones.shadow||tones.base);
  return {depth,draw(c){polygon(c,pts,opt.color||color,opt.ink===false?null:(opt.stroke||INK),opt.lw??1.1);if(opt.texture!==false)brush(c,pts,seed,tones.light||'#d3d7bf',opt.marks??5,.12);if(opt.draw)opt.draw(c,pts);}};
}
function addFace(list,pts,tones,seed=0,opt={}){const p=facePart(pts,tones,seed,opt);if(p)list.push(p);}
function volume(list,frame,rings,tones,seed=1,n=8,opt={}) {
  const rows=rings.map(([z,rx,ry])=>Array.from({length:n},(_,i)=>fPoint(frame,[Math.cos(i/n*TAU)*rx,Math.sin(i/n*TAU)*ry,z])));
  const vertices=rows.flat(), hull=convexHull(vertices.map(pj2));
  // A volume defines the silhouette, not a visible wire mesh. Shade in broad ink planes.
  const depth=vertices.reduce((v,p)=>v+proj(p)[2],0)/vertices.length;
  list.push({depth,draw(c){const build=q=>pathSoftPoly(q,hull,.25);
    celFill(c,build,tones,Math.max(3,Math.min(8,(Math.max(...hull.map(p=>p[0]))-Math.min(...hull.map(p=>p[0])))*.26)),1.1);
    if(opt.texture!==false)brush(c,hull,seed,tones.light||'#d4bd83',7,.1);
    inkStroke(c,build,opt.lw??1.65);
  }});
}
function boneFrame(a,b,front=[1,0,0]){
  const z=vNorm(vSub(b,a));let x=vSub(front,vScale(z,vDot(front,z)));x=vLen(x)<.01?vPerp(z):vNorm(x);
  return {o:a,x,y:vCross(z,x),z};
}
function plateLimb(list,a,b,ra,rb,tones,seed,front){
  const L=vDist(a,b),f=boneFrame(a,b,front);
  volume(list,f,[[0,ra*.78,ra*.8],[L*.18,ra,ra*.9],[L*.7,rb*1.1,rb],[L,rb*.75,rb*.78]],tones,seed,7);
  for(const t of [.16,.8])volume(list,{...f,o:fPoint(f,[0,0,L*t])},[[0,lerp(ra,rb,t)*1.02,lerp(ra,rb,t)*.99],[2.1,lerp(ra,rb,t)*1.04,lerp(ra,rb,t)]],PAL.gold,seed+88,8,{texture:false,lw:.7});
}
class Cape {
  constructor(){this.points=null;this.previous=null;this.clock=0;this.R=6;this.C=5;}
  rest(rig,r,c,time,vel){
    const u=c/(this.C-1),v=r/(this.R-1),w=lerp(18,33,v);
    const ripple=Math.sin(time*3.4+v*5+u*2)*v*3.3;
    const speed=Math.min(1,Math.hypot(...vel)/300);
    const p=fPoint(rig.chest,[-13-v*(10+speed*26)+ripple,(u*2-1)*w,12-v*86+Math.sin(u*Math.PI)*v*5]);
    p[0]-=vel[0]*v*v*.055;p[1]-=vel[1]*v*v*.055;
    p[2]=Math.max(7,Math.min(p[2],rig.chest.o[2]+12-r*12));return p;
  }
  update(rig,dt,vel=[0,0]){
    this.clock+=dt;
    if(!this.points){this.points=[];this.previous=[];for(let r=0;r<this.R;r++)for(let c=0;c<this.C;c++){const p=this.rest(rig,r,c,this.clock,vel);this.points.push(p);this.previous.push(p.slice());}}
    const h=Math.min(dt,1/30),anchors=[];
    for(let i=0;i<this.points.length;i++){
      const r=Math.floor(i/this.C),c=i%this.C,rest=this.rest(rig,r,c,this.clock,vel),p=this.points[i],old=this.previous[i];
      if(r===0){this.points[i]=rest;this.previous[i]=rest.slice();anchors[c]=rest;continue;}
      const next=p.map((x,k)=>x+(x-old[k])*.83+(rest[k]-x)*Math.min(1,h*13));
      const anchor=this.points[c];next[2]=clamp(next[2],6,anchor[2]-r*11);
      // Keep cloth on the back half-space, below its shoulder anchors.
      const d=vSub(next,rig.chest.o),front=vDot(d,rig.base.x);
      if(front>-10){next[0]-=rig.base.x[0]*(front+10);next[1]-=rig.base.x[1]*(front+10);}
      this.previous[i]=p.slice();this.points[i]=next;
    }
    for(let iter=0;iter<3;iter++)for(let r=1;r<this.R;r++)for(let c=0;c<this.C;c++){
      const i=r*this.C+c,a=this.points[i-this.C],p=this.points[i],d=vSub(p,a),L=vLen(d),max=22;
      if(L>max){const fix=vScale(d,(L-max)/L);this.points[i]=vSub(p,fix);this.previous[i]=vSub(this.previous[i],fix);}
    }
    // Constraints can move a row upward; reapply the safety envelope last, preserving velocity.
    for(let i=this.C;i<this.points.length;i++){const maxZ=this.points[i%this.C][2]-Math.floor(i/this.C)*11;const dz=Math.min(0,maxZ-this.points[i][2]);this.points[i][2]+=dz;this.previous[i][2]+=dz;}
  }
  parts(list,rig){if(!this.points)return;const at=(r,c)=>this.points[r*this.C+c];
    for(let r=0;r<this.R-1;r++)for(let c=0;c<this.C-1;c++){
      const pts=[at(r,c),at(r,c+1),at(r+1,c+1),at(r+1,c)];
      addFace(list,pts,PAL.crimson,550+r*5+c,{color:c%2?'#8e233d':'#b43a4c',ink:false,bias:-2,marks:3});
    }
    const border=[];for(let r=0;r<this.R;r++)border.push(at(r,0));for(let c=1;c<this.C;c++)border.push(at(this.R-1,c));for(let r=this.R-2;r>=0;r--)border.push(at(r,this.C-1));
    list.push({depth:proj(rig.chest.o)[2]-1,draw(c){line(c,border.map(pj2),INK,3);line(c,border.map(pj2),'#d0a16b',1);}});
  }
}
function knightParts(rig,cape){
  const list=[],front=rig.base.x;
  if(cape)cape.parts(list,rig);
  // Legs: flexible dark under-armor, cuisses, sculpted knees and ridged greaves.
  for(const [side,leg,foot] of [[1,rig.legL,rig.ftL],[-1,rig.legR,rig.ftR]]){
    plateLimb(list,leg.a,leg.b,9.3,7.5,PAL.cloth,side+70,front);
    plateLimb(list,vLerp(leg.b,leg.c,.13),leg.c,8.1,5.5,PAL.steel,side+80,front);
    const kf={...rig.base,o:leg.b};volume(list,kf,[[-8,5,5],[-2,10,8],[5,7,7],[9,2,3]],PAL.gold,87,6);
    const kp=[[-4,-5,3],[8,-5,3],[11,0,0],[8,5,3],[-4,5,3]].map(p=>fPoint(kf,[p[0]+4,p[1],p[2]+1]));addFace(list,kp,PAL.steel,9);
    volume(list,foot,[[-6,13,6],[-2,18,7],[5,12,6],[8,5,4]],PAL.steel,90,8);
    for(let i=0;i<3;i++){let x=6+i*4;const pts=[fPoint(foot,[x,-5,1]),fPoint(foot,[x,0,5]),fPoint(foot,[x,5,1])];list.push({depth:proj(foot.o)[2]+6,draw:c=>line(c,pts.map(pj2),INK,.8)});}
  }
  volume(list,rig.pel,[[-8,10,13],[3,12,15],[12,11,14]],PAL.leather,9,8);
  // Short split tabard; tassets are separate volumes with their own depths.
  for(const side of [-1,1]){
    addFace(list,[[12,side*1,-4],[12,side*15,-4],[15,side*18,-39],[16,side*2,-43]].map(p=>fPoint(rig.pel,p)),PAL.crimson,117+side,{lw:1.7});
    const tf={...rig.pel,o:fPoint(rig.pel,[1,side*17,-5])};
    volume(list,tf,[[-31,9,6],[-17,11,6],[0,10,5]],PAL.gold,121,6);
    volume(list,{...tf,o:fPoint(tf,[2,0,0])},[[-28,8.3,5.2],[-15,10,5],[0,9,4]],PAL.steelDk,123,6);
  }
  // Anatomical torso: broad shoulder ring, pinched waist, pointed breastplate.
  volume(list,rig.chest,[[-30,10,14],[-15,13,18],[5,16,23],[16,10,18]],PAL.steel,23,10,{lw:1.2,marks:7});
  volume(list,{...rig.chest,o:fPoint(rig.chest,[0,0,-24])},[[-4,11,15],[1,12,16]],PAL.gold,26,10);
  volume(list,{...rig.chest,o:fPoint(rig.chest,[0,0,17])},[[0,8,10],[7,8,10]],PAL.steelDk,30,8);
  const chestFace=[[12,-16,10],[16,0,-8],[12,16,10],[14,14,3],[17,0,-15],[14,-14,3]].map(p=>fPoint(rig.chest,p));
  addFace(list,chestFace,PAL.gold,35,{cull:true,marks:3});
  if(vDot(rig.chest.x,Cam.toCam)>.08){const pp=[[16,0,9],[18,0,-8],[12,0,-27]].map(p=>fPoint(rig.chest,p));list.push({depth:proj(pp[1])[2]+1,draw(c){line(c,pp.map(pj2),'#c9d9ca',1.2);}});}
  // Sun sigil on the breastplate, catches a warm light against the cool steel.
  const sigil=[[17,0,2],[17,3,-3],[17,0,-8],[17,-3,-3]].map(p=>fPoint(rig.chest,p));addFace(list,sigil,PAL.gold,36,{cull:true,lw:.7});
  for(const [side,arm] of [[1,rig.armL],[-1,rig.armR]]){
    plateLimb(list,arm.a,arm.b,8.2,6.3,PAL.leather,100+side,front);
    plateLimb(list,vLerp(arm.b,arm.c,.06),arm.c,8,5.5,PAL.steelDk,110+side,front);
    const pa={...rig.chest,o:vAdd(arm.a,[0,0,2])};
    // Layered flared pauldrons, gilded lower lip.
    volume(list,pa,[[-9,10,14],[-5,14,18],[3,14,18],[10,9,12],[12,5,7]],PAL.steel,40+side,9);
    volume(list,{...pa,o:fPoint(pa,[0,0,-10])},[[-2,11,14],[1,14,17]],PAL.gold,60+side,9);
    for(let tier=0;tier<2;tier++){const q=vLerp(arm.a,arm.b,.24+tier*.17),f=boneFrame(q,vAddS(q,vNorm(vSub(arm.b,arm.a)),8),front);volume(list,f,[[0,10-tier,10-tier],[4,10-tier,10-tier],[7,8-tier,8-tier]],PAL.steelDk,160+tier,8);}
    const bolt=fPoint(pa,[13,0,1]);if(vDot(rig.chest.x,Cam.toCam)>0){const q=pj2(bolt);list.push({depth:proj(bolt)[2]+1,draw(c){ellipse(c,q[0],q[1],3.1,3.5,'#e6c57e',INK,.8);ellipse(c,q[0]-.6,q[1]-1,1,1.2,'#f9e8b2');}});}
    const fist=boneFrame(arm.c,vAddS(arm.c,side<0?rig.swordDir:front,9),front);
    volume(list,fist,[[-4,5,5],[3,5.5,5.2],[6,4,4]],PAL.leather,151,6);
    for(let i=-1;i<=1;i++)addFace(list,[[5,i*2-1,1],[6,i*2-1,4],[6,i*2+1,4],[5,i*2+1,1]].map(p=>fPoint(fist,p)),PAL.gold,153,{lw:.5});
  }
  // The blade shares the solved hand position. Segment depths keep it behind/in front correctly.
  const dir=rig.swordDir,guard=rig.guard,edge=vNorm(vCross(dir,rig.base.y));
  const width=vNorm(vCross(dir,edge));
  const sf={o:rig.armR.c,x:edge,y:width,z:dir};
  volume(list,sf,[[-14,2.6,2.6],[5,2.4,2.4]],PAL.leather,211,6);
  volume(list,sf,[[-17,3,3],[-14,4,4],[-11,2,2]],PAL.gold,213,6);
  addFace(list,[[-2,-17,7],[1,-16,11],[2,-7,9],[2,7,9],[1,16,11],[-2,17,7],[-3,4,4],[-3,-4,4]].map(p=>fPoint(sf,p)),PAL.gold,214,{lw:1.5});
  for(let j=0;j<5;j++){
    const a=j/5*BODY.bladeLen,b=(j+1)/5*BODY.bladeLen,wa=lerp(5.3,.2,j/5),wb=lerp(5.3,.2,(j+1)/5);
    const A=vAddS(guard,dir,a),B=vAddS(guard,dir,b);
    addFace(list,[vAddS(A,width,-wa),A,B,vAddS(B,width,-wb)],PAL.blade,221+j,{color:'#e6efe3',lw:.6,marks:2});
    addFace(list,[A,vAddS(A,width,wa),vAddS(B,width,wb),B],PAL.steelDk,231+j,{color:'#6f98b3',lw:.7,marks:2});
  }
  buildHead(list,rig.head);
  return list.sort((a,b)=>a.depth-b.depth);
}
function drawKnight(c,rig,cape,debug=false){
  c.save();c.lineJoin='round';const parts=knightParts(rig,cape);for(const p of parts)p.draw(c);if(debug)drawSkeleton(c,rig);c.restore();
}
function drawSkeleton(c,r){
  for(const b of [r.legL,r.legR,r.armL,r.armR]){line(c,[b.a,b.b,b.c].map(pj2),'#000',4);line(c,[b.a,b.b,b.c].map(pj2),'#6dfff1',1.6);
    for(const p of [b.a,b.b,b.c]){const q=pj2(p);ellipse(c,q[0],q[1],2.8,2.8,'#ffe66e',INK,.8);}const t=pj2(b.target);line(c,[[t[0]-4,t[1]-4],[t[0]+4,t[1]+4]],'#ff52a8',1);line(c,[pj2(b.b),pj2(vAddS(b.b,b.pole,14))],'#ff52a8',1.3);}
  line(c,[r.pel.o,r.chest.o,r.head.o].map(pj2),'#7effd9',2);
}

