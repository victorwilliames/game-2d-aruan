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
const ARUAN={skin:{base:'#d98652',shadow:'#a84b34',light:'#efad71'},red:{base:'#bd3028',shadow:'#75292b',light:'#e85838'},hair:{base:'#30241f',shadow:'#171b1d',light:'#634132'},wood:{base:'#b47a40',shadow:'#654029',light:'#e5b56d'},rope:{base:'#dbc28a',shadow:'#826443',light:'#f4dfad'}};
function surfacePart(list,points,tones,seed=1,opt={}){const pts=points.map(pj2),depth=points.reduce((s,p)=>s+proj(p)[2],0)/points.length+(opt.bias||0);list.push({depth,draw(c){const build=q=>pathSoftPoly(q,pts,opt.soft??.18);celFill(c,build,tones,opt.shade??4,opt.hl??.65);brush(c,pts,seed,tones.light, opt.marks??14,.10);inkStroke(c,build,opt.lw??1.3);if(opt.detail)opt.detail(c,pts);}});}
function ropePart(list,points,width=2,color='#d6b982',bias=0){const pts=points.map(pj2),depth=points.reduce((s,p)=>s+proj(p)[2],0)/points.length+bias;list.push({depth,draw(c){line(c,pts,'#302420',width+1.2);line(c,pts,color,width);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3.5));for(let j=0;j<n;j++){const t=j/n,x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);line(c,[[x-width*.4,y-1],[x+width*.4,y+1]],'#826445',.45);}}}});}
function fleshLimb(parts,a,b,ra,rb,front,seed){const L=vDist(a,b),f=boneFrame(a,b,front);volume(parts,f,[[0,ra*.85,ra*.9],[L*.17,ra,ra],[L*.52,lerp(ra,rb,.45),lerp(ra,rb,.45)],[L*.88,rb,rb],[L,rb*.9,rb*.9]],ARUAN.skin,seed,10,{lw:1.2});}
function featherParts(parts,f,length=30,width=8,seed=1){
 const p=q=>fPoint(f,q),outline=[[0,0,0],[0,-width*.75,length*.22],[0,-width,length*.53],[0,-width*.4,length*.82],[0,width*.3,length],[0,width*.8,length*.72],[0,width,length*.4],[0,width*.55,length*.12]].map(p);
 surfacePart(parts,outline,{base:'#1479a7',shadow:'#12435e',light:'#389abb'},seed,{shade:3,lw:.85});
 const gold=[[.2,0,0],[.2,-width*.75,length*.22],[.2,-width*.9,length*.43],[.2,-width*.35,length*.33],[.2,-width*.5,length*.58],[.2,width*.32,length*.53],[.2,width*.65,length*.34],[.2,width*.65,length*.23],[.2,width*.55,length*.12]].map(p);
 addFace(parts,gold,{base:'#eac37a',shadow:'#b78249',light:'#ffdc91'},seed,{color:'#eac37a',lw:.35});ropePart(parts,[p([.5,0,-2]),p([.5,0,length*.49]),p([.5,width*.3,length])],.65,'#b7854b',.3);
}
function equipmentParts(parts,rig){
 const ch=rig.chest,q={...ch,o:fPoint(ch,[-14,5,-13])};const qf=fRoll(fPitch(q,-.15),-.18);
 volume(parts,qf,[[0,7,9],[38,8,10],[41,8.4,10.4]],ARUAN.wood,601,10,{lw:1.5});
 for(let i=0;i<7;i++){const a=i/7*TAU,pts=[[Math.cos(a)*7.8,Math.sin(a)*9.8,2],[Math.cos(a)*8.2,Math.sin(a)*10,38]].map(p=>fPoint(qf,p));if(vDot(fDir(qf,[Math.cos(a),Math.sin(a),0]),Cam.toCam)>0)ropePart(parts,pts,.6,'#4c3024');}
 for(const z of [5,35,39]){const pts=[];for(let i=0;i<=24;i++){const a=i/24*TAU;pts.push(fPoint(qf,[Math.cos(a)*8.8,Math.sin(a)*10.8,z]));}for(let i=0;i<24;i++)ropePart(parts,pts.slice(i,i+2),1.7);}
 for(let i=0;i<3;i++){const af=fRoll({...qf,o:fPoint(qf,[0,(i-1)*6,36])},(i-1)*-.12);ropePart(parts,[fPoint(af,[0,0,0]),fPoint(af,[0,0,23+i%2*5])],1.8,'#e4bb76');featherParts(parts,{...af,o:fPoint(af,[0,0,20+i%2*5])},15,4,610+i);}
 // Strap wraps around the torso, rather than mirroring with screen orientation.
 const strap=[[ -10,13,13],[3,15,12],[10,12,7],[13,6,0],[13,-2,-8],[11,-10,-19],[0,-15,-24],[-11,-12,-23]].map(p=>fPoint(ch,p));for(let i=0;i<strap.length-1;i++)ropePart(parts,strap.slice(i,i+2),2.2);
 const stowed={...ch,o:fPoint(ch,[-21,-10,-24])};stowed.z=vNorm(fDir(ch,[0,.20,1]));stowed.y=vNorm(fDir(ch,[0,1,-.2]));stowed.x=ch.x;
 // One bow only. Its frame blends from the back to the right hand during equip.
 const d=rig.weaponDir;let side=vNorm(vCross(d,rig.base.x));if(vLen(side)<.01)side=rig.base.y;
 const hand={o:vAddS(vAddS(rig.armR.c,d,-7),side,-Math.sin(7/BODY.bowLength*Math.PI)*19),z:d,y:side,x:vNorm(vCross(side,d))};
 const e=rig.pose.equip;const bf={o:vLerp(stowed.o,hand.o,e),z:vNorm(vLerp(stowed.z,hand.z,e)),y:vNorm(vLerp(stowed.y,hand.y,e)),x:vNorm(vLerp(stowed.x,hand.x,e))};
 // Re-orthogonalize: prevents a sheared bow through equip/unequip transitions.
 bf.y=vNorm(vSub(bf.y,vScale(bf.z,vDot(bf.y,bf.z))));if(vLen(bf.y)<.01)bf.y=vPerp(bf.z);bf.x=vNorm(vCross(bf.y,bf.z));
 drawBowParts(parts,bf);rig.bowFrame=bf;rig.bowGrip=fPoint(bf,[0,Math.sin(7/BODY.bowLength*Math.PI)*19,7]);
}
function drawBowParts(parts,f){
 const n=24,pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push(fPoint(f,[0,Math.sin(t*Math.PI)*19,t*BODY.bowLength]));}
 for(let i=0;i<n;i++){const t=(i+.5)/n,A=pts[i],B=pts[i+1],w=1.6+Math.sin(t*Math.PI)*.8;const color=t<.07||t>.93?{base:'#292625',shadow:'#151d20',light:'#655842'}:t>.36&&t<.64?ARUAN.red:{base:'#dfb275',shadow:'#a07141',light:'#f5d8a1'};
 const face=[vAddS(A,f.x,-w),vAddS(B,f.x,-w),vAddS(B,f.x,w),vAddS(A,f.x,w)];surfacePart(parts,face,color,650+i,{lw:.5,shade:1,hl:.2,marks:3});}
 ropePart(parts,[pts[1],pts[n-1]],1.5,'#e8d3a4');
 for(const t of [.065,.48,.52,.935]){const center=fPoint(f,[0,Math.sin(t*Math.PI)*19,t*BODY.bowLength]);for(let j=0;j<3;j++){const p=vAddS(center,f.z,(j-1)*1.5);ropePart(parts,[vAddS(p,f.x,-2.6),vAddS(vAddS(p,f.y,1),f.x,2.6)],1.3);}}
}
function characterParts(rig){
 const list=[],front=rig.base.x;
 // Feet and toes are volumes attached to solved ankles; legs retain calf/knee contours.
 for(const [side,leg,foot]of [[1,rig.legL,rig.ftL],[-1,rig.legR,rig.ftR]]){
  fleshLimb(list,leg.a,leg.b,10.6,7.5,front,31+side);fleshLimb(list,leg.b,leg.c,7.6,5.6,front,41+side);
  const f={...foot,o:fPoint(foot,[5,0,-2])};volume(list,f,[[-3,10,7],[0,13,8],[4,11,7],[6,5,5]],ARUAN.skin,51+side,10,{lw:1.3});
  for(let t=0;t<4;t++){const pts=[[12,(t-1.5)*3,2],[16,(t-1.5)*3,-1]].map(p=>fPoint(f,p));list.push({depth:proj(f.o)[2]+10,draw:c=>line(c,pts.map(pj2),'#8d4933',.65)});}
 }
 volume(list,rig.pel,[[-7,8,13],[4,9,15],[11,9,14]],ARUAN.skin,62,12,{lw:1.2});
 volume(list,rig.chest,[[-24,9,14],[-13,9.4,13],[0,11,16],[9,8,13],[13,6,9]],ARUAN.skin,64,12,{lw:1.3});
 volume(list,{...rig.chest,o:fPoint(rig.chest,[0,0,13])},[[0,5,6],[14,5.5,6]],ARUAN.skin,66,10);
 // Red wrap, triangular front fold, tied at the character's right hip.
 volume(list,{...rig.pel,o:fPoint(rig.pel,[0,0,0])},[[-12,10,14],[0,11,16],[5,10.5,15]],ARUAN.red,70,12,{lw:1.2});
 surfacePart(list,[[11,-15,2],[12,15,2],[12,12,-9],[12,1,-22],[12,-12,-11]].map(p=>fPoint(rig.pel,p)),ARUAN.red,72,{shade:5,lw:1.2,detail(c){line(c,[[11,-11,-3],[12,0,-10],[11,11,-3]].map(p=>pj2(fPoint(rig.pel,p))),'#e25638',1.2);}});
 const knot={...rig.pel,o:fPoint(rig.pel,[4,-16,1])};volume(list,knot,[[-3,3.5,4],[0,5,5],[4,3,4]],ARUAN.red,76,8);
 for(const pts of [[[2,-2,0],[5,-11,-5],[3,-13,-21],[0,-5,-16]],[[0,1,-2],[2,-1,-19],[3,6,-15],[2,6,-6]]])surfacePart(list,pts.map(p=>fPoint(knot,p)),ARUAN.red,78,{lw:1});
 for(const [side,arm]of [[1,rig.armL],[-1,rig.armR]]){
  fleshLimb(list,arm.a,arm.b,8.8,6.2,front,90+side);fleshLimb(list,arm.b,arm.c,6.3,5.2,front,100+side);
  const axis=vNorm(vSub(arm.c,arm.b)),hf=boneFrame(arm.c,vAddS(arm.c,axis,8),front);
  volume(list,hf,[[-2,5,5],[3,6.1,6],[9,5.5,5.6],[12,3.7,4]],ARUAN.skin,110,10,{lw:1.2});
  for(let j=0;j<3;j++){const pts=[[5,(j-1)*2.3,5],[5.1,(j-1)*2.3,9]].map(p=>fPoint(hf,p));list.push({depth:proj(hf.o)[2]+7,draw:c=>line(c,pts.map(pj2),'#8c4631',.6)});}
  volume(list,{...hf,o:fPoint(hf,[3,-5,2])},[[0,2.8,2.8],[5,3,3],[7,1.5,2]],ARUAN.skin,115,8,{lw:.8});
 }
 equipmentParts(list,rig);buildHead(list,rig.head);return list.sort((a,b)=>a.depth-b.depth);
}
function drawCharacter(c,rig,debug=false){c.save();c.lineJoin='round';for(const p of characterParts(rig))p.draw(c);if(debug)drawSkeleton(c,rig,typeof debug==='object'?debug:{});c.restore();}
function drawSkeleton(c,r,options={}){
 const joints=options.joints!==false,feet=options.feet!==false,bones=options.bones!==false;
 for(const b of [r.legL,r.legR,r.armL,r.armR]){if(bones){line(c,[b.a,b.b,b.c].map(pj2),'#14222c',3);line(c,[b.a,b.b,b.c].map(pj2),'#68f4e4',1.1);line(c,[pj2(b.b),pj2(vAddS(b.b,b.pole,12))],'#ed60ac',.8);}if(joints)for(const p of [b.a,b.b,b.c]){const q=pj2(p);ellipse(c,q[0],q[1],2.1,2.1,'#ffe586','#1f3341',.7);}}
 if(bones)line(c,[r.pel.o,r.chest.o,r.head.o].map(pj2),'#68f4e4',1.5);
 if(feet)for(const b of [r.legL,r.legR]){const p=pj2([b.target[0],b.target[1],0]);ellipse(c,p[0],p[1],10,10*Cam.sinP,b.target[2]<=BODY.ankleH+.5?'#77e3ac88':'#e4a84b55','#9df7c6',.8);line(c,[p,pj2(b.target)],'#f1cb76',.7);}
}
