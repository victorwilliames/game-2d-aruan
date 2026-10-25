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
// Trim internal ink with a native Canvas hole; never join the two fills/depths.
function joinedSkinInk(c,hull,peer,width,color){
 let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
 for(const p of hull){left=Math.min(left,p[0]);right=Math.max(right,p[0]);top=Math.min(top,p[1]);bottom=Math.max(bottom,p[1]);}
 const pad=width*2+2;c.save();c.beginPath();c.rect(left-pad,top-pad,right-left+pad*2,bottom-top+pad*2);pathSoftPoly(c,peer,.25);c.clip('evenodd');
 inkStroke(c,q=>pathSoftPoly(q,hull,.25),width,color);c.restore();
}
function volume(list,frame,rings,tones,seed=1,n=8,opt={}) {
  const rows=rings.map(([z,rx,ry])=>Array.from({length:n},(_,i)=>fPoint(frame,[Math.cos(i/n*TAU)*rx,Math.sin(i/n*TAU)*ry,z])));
  const vertices=rows.flat(), hull=convexHull(vertices.map(pj2));
  // A volume defines the silhouette, not a visible wire mesh. Shade in broad ink planes.
  const depth=vertices.reduce((v,p)=>v+proj(p)[2],0)/vertices.length;
  list.push({depth,draw(c){const build=q=>pathSoftPoly(q,hull,.25);
    celFill(c,build,tones,opt.shade??Math.max(3,Math.min(8,(Math.max(...hull.map(p=>p[0]))-Math.min(...hull.map(p=>p[0])))*.26)),1.1);
    if(opt.texture!==false)brush(c,hull,seed,tones.light||'#d4bd83',7,.1);
    if(opt.join?.peer)joinedSkinInk(c,hull,opt.join.peer,opt.lw??1.65,opt.ink||INK);else inkStroke(c,build,opt.lw??1.65,opt.ink||INK);
  }});
  return hull;
}
function boneFrame(a,b,front=[1,0,0]){
  const z=vNorm(vSub(b,a));let x=vSub(front,vScale(z,vDot(front,z)));x=vLen(x)<.01?vPerp(z):vNorm(x);
  return {o:a,x,y:vCross(z,x),z};
}
const ARUAN={skin:{base:'#d98652',shadow:'#a84b34',light:'#efad71'},get red(){return Appearance.materials().cloth;},get hair(){return Appearance.materials().hair;},get wood(){return Appearance.materials().wood;},get bow(){return Appearance.materials().bow;},get feather(){return Appearance.materials().feather;},rope:{base:'#dbc28a',shadow:'#826443',light:'#f4dfad'}};
function surfacePart(list,points,tones,seed=1,opt={}){const pts=points.map(pj2),depth=points.reduce((s,p)=>s+proj(p)[2],0)/points.length+(opt.bias||0);list.push({depth,draw(c){const build=q=>pathSoftPoly(q,pts,opt.soft??.18);celFill(c,build,tones,opt.shade??4,opt.hl??.65);brush(c,pts,seed,tones.light, opt.marks??14,.10);inkStroke(c,build,opt.lw??1.3,opt.ink||INK);if(opt.detail)opt.detail(c,pts);}});}
function ropePart(list,points,width=2,color='#d6b982',bias=0){const pts=points.map(pj2),depth=points.reduce((s,p)=>s+proj(p)[2],0)/points.length+bias;list.push({depth,draw(c){line(c,pts,'#302420',width+1.2);line(c,pts,color,width);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3.5));for(let j=0;j<n;j++){const t=j/n,x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);line(c,[[x-width*.4,y-1],[x+width*.4,y+1]],'#826445',.45);}}}});}
function fleshLimb(parts,a,b,ra,rb,front,seed,join){const L=vDist(a,b),f=boneFrame(a,b,front);return volume(parts,f,[[0,ra*.85,ra*.9],[L*.17,ra,ra],[L*.52,lerp(ra,rb,.45),lerp(ra,rb,.45)],[L*.88,rb,rb],[L,rb*.9,rb*.9]],ARUAN.skin,seed,12,{lw:.8,ink:'#79432f',shade:2.6,join});}
function fleshPair(parts,bone,radii,front,seed){
 const upper={peer:null},lower={peer:null};
 const a=fleshLimb(parts,bone.a,bone.b,radii[0],radii[1],front,seed,upper),b=fleshLimb(parts,bone.b,bone.c,radii[2],radii[3],front,seed+10,lower);
 upper.peer=b;lower.peer=a;
 return {upper:a,lower:b};
}
function featherParts(parts,f,length=30,width=8,seed=1){
 const layers=[];
 const p=q=>fPoint(f,q),outline=[[0,0,0],[0,-width*.75,length*.22],[0,-width,length*.53],[0,-width*.4,length*.82],[0,width*.3,length],[0,width*.8,length*.72],[0,width,length*.4],[0,width*.55,length*.12]].map(p);
 surfacePart(layers,outline,ARUAN.feather,seed,{shade:3,lw:.85});
 const gold=[[.2,0,0],[.2,-width*.75,length*.22],[.2,-width*.9,length*.43],[.2,-width*.35,length*.33],[.2,-width*.5,length*.58],[.2,width*.32,length*.53],[.2,width*.65,length*.34],[.2,width*.65,length*.23],[.2,width*.55,length*.12]].map(p);
 addFace(layers,gold,{base:'#eac37a',shadow:'#b78249',light:'#ffdc91'},seed,{color:'#eac37a',lw:.35});ropePart(layers,[p([.5,0,-2]),p([.5,0,length*.49]),p([.5,width*.3,length])],.65,'#b7854b',.3);
 // Pigment layers share one surface; sorting them separately hides the ochre.
 parts.push({depth:outline.reduce((sum,v)=>sum+proj(v)[2],0)/outline.length,draw(c){for(const layer of layers)layer.draw(c);}});
}
function equipmentParts(parts,rig){
 const ch=rig.chest,q={...ch,o:fPoint(ch,[-19,7,-28])};const qf=fRoll(fPitch(q,-.48),-.18);rig.quiverFrame=qf;rig.arrowTips=[];
 volume(parts,qf,[[0,7,9],[38,8,10],[41,8.4,10.4]],ARUAN.wood,601,10,{lw:1.5});
 for(let i=0;i<7;i++){const a=i/7*TAU,pts=[[Math.cos(a)*7.8,Math.sin(a)*9.8,2],[Math.cos(a)*8.2,Math.sin(a)*10,38]].map(p=>fPoint(qf,p));if(vDot(fDir(qf,[Math.cos(a),Math.sin(a),0]),Cam.toCam)>0)ropePart(parts,pts,.6,'#4c3024');}
 for(const z of [5,35,39]){const pts=[];for(let i=0;i<=24;i++){const a=i/24*TAU;pts.push(fPoint(qf,[Math.cos(a)*8.8,Math.sin(a)*10.8,z]));}for(let i=0;i<24;i++)ropePart(parts,pts.slice(i,i+2),1.7);}
 for(let i=0;i<3;i++){const af=fRoll({...qf,o:fPoint(qf,[0,(i-1)*6,36])},(i-1)*-.12+rig.pose.secondary*.015);rig.arrowTips.push(fPoint(af,[0,0,35+i%2*5]));ropePart(parts,[fPoint(af,[0,0,0]),fPoint(af,[0,0,23+i%2*5])],1.8,'#e4bb76');featherParts(parts,{...af,o:fPoint(af,[0,0,20+i%2*5])},15,4,610+i);}
 // Strap wraps around the torso, rather than mirroring with screen orientation.
 const strap=[[ -10,13,13],[3,15,12],[10,12,7],[13,6,0],[13,-2,-8],[11,-10,-19],[0,-15,-24],[-11,-12,-23]].map(p=>fPoint(ch,p));for(let i=0;i<strap.length-1;i++)ropePart(parts,strap.slice(i,i+2),2.2);
 // Back harness keeps the quiver/bow behind the oversized head volume.
 const backStrap=[[-11,-12,-23],[-19,7,-26],[-32,12,4],[-14,15,13],[3,15,12]].map(p=>fPoint(ch,p));
 for(let i=0;i<backStrap.length-1;i++)ropePart(parts,backStrap.slice(i,i+2),2.2);
 const stowed={...ch,o:fPoint(ch,[-24,-16,-30])};stowed.z=vNorm(fDir(ch,[-.36,.20,1]));stowed.y=vNorm(fDir(ch,[0,1,-.2]));stowed.x=ch.x;
 // One bow only. Its frame blends from the back to the right hand during equip.
 const d=rig.weaponDir;let side=vNorm(vCross(d,rig.base.x));if(vLen(side)<.01)side=rig.base.y;
 const hand={o:vAddS(vAddS(rig.armR.c,d,-7),side,-Math.sin(7/BODY.bowLength*Math.PI)*19),z:d,y:side,x:vNorm(vCross(side,d))};
 const e=rig.pose.equip;const bf={o:vAddS(vLerp(stowed.o,hand.o,e),rig.base.y,-Math.sin(e*Math.PI)*90),z:vNorm(vLerp(stowed.z,hand.z,e)),y:vNorm(vLerp(stowed.y,hand.y,e)),x:vNorm(vLerp(stowed.x,hand.x,e))};
 // Re-orthogonalize: prevents a sheared bow through equip/unequip transitions.
 bf.y=vNorm(vSub(bf.y,vScale(bf.z,vDot(bf.y,bf.z))));if(vLen(bf.y)<.01)bf.y=vPerp(bf.z);bf.x=vNorm(vCross(bf.y,bf.z));
 drawBowParts(parts,bf);rig.bowFrame=bf;rig.bowGrip=fPoint(bf,[0,Math.sin(7/BODY.bowLength*Math.PI)*19,7]);
}
function drawBowParts(parts,f){
 const n=24,pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push(fPoint(f,[0,Math.sin(t*Math.PI)*19,t*BODY.bowLength]));}
 for(let i=0;i<n;i++){const t=(i+.5)/n,A=pts[i],B=pts[i+1],w=1.6+Math.sin(t*Math.PI)*.8;const color=t<.07||t>.93?{base:'#292625',shadow:'#151d20',light:'#655842'}:t>.36&&t<.64?ARUAN.red:ARUAN.bow;
 const face=[vAddS(A,f.x,-w),vAddS(B,f.x,-w),vAddS(B,f.x,w),vAddS(A,f.x,w)];surfacePart(parts,face,color,650+i,{lw:.5,shade:1,hl:.2,marks:3});}
 ropePart(parts,[pts[1],pts[n-1]],1.5,'#e8d3a4');
 for(const t of [.065,.48,.52,.935]){const center=fPoint(f,[0,Math.sin(t*Math.PI)*19,t*BODY.bowLength]);for(let j=0;j<3;j++){const p=vAddS(center,f.z,(j-1)*1.5);ropePart(parts,[vAddS(p,f.x,-2.6),vAddS(vAddS(p,f.y,1),f.x,2.6)],1.3);}}
}
function softCrease(list,points,visibility,width){
 const opacity=Ease.inOutSine(visibility),depth=points.reduce((n,p)=>n+proj(p)[2],0)/points.length+.15;
 list.push({depth,draw(c){c.save();c.globalAlpha*=opacity;line(c,points.map(pj2),'#99543a',width);c.restore();}});
}
function humanoidHandParts(list,rig,key,arm,armHulls){
 const hand=rig.hands[key],side=key==='L'?1:-1,f=hand.frame;
 const hf={o:arm.c,x:f.x,z:vScale(f.y,side)};hf.y=vCross(hf.z,hf.x);
 if(side===1&&Appearance.current.accessory==='wrist-wrap')volume(list,hf,[[-7,5.6,4.8],[-1,5.8,5]],ARUAN.red,108,10,{lw:1});
 volume(list,hf,[[-3,4.2,3.7],[0,4.9,4.1],[4,4.8,3.8],[6,3.7,3.2]],ARUAN.skin,110,12,{lw:.7,ink:'#683b2d',join:{peer:armHulls.lower}});
 hand.digits.forEach((digit,d)=>{
  for(let i=0;i<3;i++){
   const a=digit.joints[i].position,b=digit.joints[i+1].position,length=vDist(a,b),radius=(digit.name==='Thumb'?1.6:1.3)*(1-i*.12);
   if(length<1e-6)continue;
   volume(list,boneFrame(a,b,f.x),[[0,radius,radius],[length*.72,radius*.95,radius*.9],[length,radius*.8,radius*.8]],ARUAN.skin,120+d*3+i,6,{lw:.32,ink:'#79432f',shade:1.1,texture:false});
  }
 });
}
function characterParts(rig){
 const list=[],front=rig.base.x;
 // Feet and toes are volumes attached to solved ankles; legs retain calf/knee contours.
 for(const [side,leg,foot]of [[1,rig.legL,rig.ftL],[-1,rig.legR,rig.ftR]]){
  fleshPair(list,leg,[10.8,8.2,8.3,6.1],front,31+side);
  const kf=boneFrame(leg.b,leg.c,front),kv=clamp(vDot(kf.x,Cam.toCam)/.45,0,1);
  if(kv>0)softCrease(list,[fPoint(kf,[7.4,-4,.6]),fPoint(kf,[7.9,0,-.4]),fPoint(kf,[7.4,4,.6])],kv,.65);
  const f={...foot,o:fPoint(foot,[5,0,-2])};volume(list,f,[[-3,10,7],[0,13,8],[4,11,7],[6,5,5]],ARUAN.skin,51+side,14,{lw:.95,ink:'#683b2d'});
  for(let t=0;t<5;t++){
   const ty=-side*(t-2)*2.6,r=1.25+t*.12,toe=side===1?rig.toeL:rig.toeR,tip=side===1?rig.toeTipL:rig.toeTipR;
   const tf=toe?{o:vAddS(vAddS(tip,toe.y,ty),toe.z,1.2),x:toe.y,y:toe.z,z:toe.x}:{...f,o:fPoint(f,[12,ty,1.2]),x:f.y,y:f.z,z:f.x};
   volume(list,tf,[[0,r*1.05,r*.95],[1.1,r*.95,r*.85]],ARUAN.skin,54+t,8,{lw:.25,ink:'#79432f',shade:1.2,texture:false});
  }
  const toeView=clamp(vDot(foot.x,Cam.toCam)/.42,0,1);
  if(toeView>0)for(let t=0;t<4;t++){
   const y=(t-1.5)*2.65,pts=[2.6,1.4,.5].map(z=>{const rx=lerp(13,11,z/4),ry=lerp(8,7,z/4);return fPoint(f,[rx*Math.sqrt(1-(y/ry)**2)*.94,y,z]);});
   softCrease(list,pts,toeView,.6);
  }
 }
 volume(list,rig.pel,[[-7,9,14],[4,10,16],[11,10,15]],ARUAN.skin,62,12,{lw:.9,ink:'#79432f'});
 volume(list,rig.chest,[[-24,10,15],[-13,10.4,14],[0,12,17],[9,9,14],[13,6.5,9.5]],ARUAN.skin,64,12,{lw:.95,ink:'#79432f'});
 volume(list,{...rig.chest,o:fPoint(rig.chest,[0,0,13])},[[0,5.5,6.5],[14,6,6.5]],ARUAN.skin,66,10,{lw:.8,ink:'#79432f'});
 const navel=fPoint(rig.chest,[9.8,0,7.2]);
 list.push({depth:proj(navel)[2]+.35,draw(c){const p=pj2(navel);ellipse(c,p[0],p[1],.65,1.1,'#a95338',null);}});
 for(const s of [-1,1]){
  const nip=fPoint(rig.chest,[9.3,s*5,8.5]);
  list.push({depth:proj(nip)[2]+.3,draw(c){const p=pj2(nip);ellipse(c,p[0],p[1],.5,.7,'#a95338',null);}});
 }
 // Red wrap covers the hips; the broad front flap hangs to mid-thigh.
 volume(list,{...rig.pel,o:fPoint(rig.pel,[0,0,0])},[[-13,10,14],[0,11,16],[6,10.5,15]],ARUAN.red,70,12,{lw:.9,ink:ARUAN.red.shadow});
 const wrap=Appearance.current.outfit==='layered'
  ?[[10,-15,5],[11,-9,5.2],[12,-1,5.2],[11.8,6,5],[11,15,4],[12,13,-6],[12.5,10,-17],[12.8,0,-22],[11.8,-10,-17],[10.6,-13,-6]]
  :[[9.8,-14,5],[10.8,-8,5.2],[11.8,-1,5.2],[11.6,6,5],[10.8,14,4],[11.6,12,-6],[12.2,9,-17],[12.6,0,-21],[11.6,-9,-17],[10.4,-12,-6]];
 surfacePart(list,wrap.map(p=>fPoint(rig.pel,p)),ARUAN.red,72,{shade:4.5,lw:.9,ink:ARUAN.red.shadow,detail(c,outline){
  c.save();c.beginPath();pathSoftPoly(c,outline,.18);c.clip();
  // Soft folds widen toward the hem instead of forming a rigid V.
  for(const [points,color,width,alpha]of [
   [[[12.2,0,4],[12.4,1,-8],[12.6,0,-20]],ARUAN.red.shadow,.8,.18],
   [[[11,-11,3],[11.4,-7,-8],[11.8,-4,-15]],ARUAN.red.shadow,.8,.24],
   [[[11.4,11,3],[11.8,7,-8],[12.2,4,-15]],ARUAN.red.shadow,.8,.22],
   [[[11,-6,3],[11.5,-2,-7],[12,2,-14]],ARUAN.red.stitch,.65,.18]]){
   const p=points.map(q=>pj2(fPoint(rig.pel,q)));c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(...p[0]);c.quadraticCurveTo(...p[1],...p[2]);c.stroke();
  }
  const hl=[[11.2,-4,4],[12.2,0,4],[12.6,0,-18],[11.8,4,-16],[11.2,3,-4]].map(q=>pj2(fPoint(rig.pel,q)));
  c.globalAlpha=.13;c.fillStyle=ARUAN.red.light;c.beginPath();c.moveTo(...hl[0]);for(const p of hl.slice(1))c.lineTo(...p);c.closePath();c.fill();
  c.restore();
 }});
 if(Appearance.current.outfit==='layered')surfacePart(list,[[10.2,-15,5],[11.8,7,-4],[11.8,3,-15],[10.8,-13,-8]].map(p=>fPoint(rig.pel,p)),ARUAN.red,74,{shade:3,lw:.8,ink:ARUAN.red.shadow,soft:.32});
 const knot={...rig.pel,o:fPoint(rig.pel,[8,-17,3])};volume(list,knot,[[-3,3,3.5],[0,4.2,4.2],[4,2.6,3.2]],ARUAN.red,76,8,{lw:.8,ink:ARUAN.red.shadow});
 const knotBand=[fPoint(knot,[-2,-4,3]),fPoint(knot,[0,0,4.5]),fPoint(knot,[2,4,3])];
 list.push({depth:proj(knotBand[1])[2]+.5,draw(c){line(c,knotBand.map(pj2),ARUAN.red.shadow,1.1);}});
 // Long tail is a thin cloth volume so it reads from the isometric camera.
 const tail={...rig.pel,o:fPoint(rig.pel,[10,-20,2])};
 volume(list,tail,[[0,.6,3.4],[-5,.7,4.2],[-10,.7,4],[-14,.5,3]],ARUAN.red,78,10,{lw:.8,ink:ARUAN.red.shadow});
 const tailFold=[fPoint(tail,[.6,0,-1]),fPoint(tail,[.7,0,-7]),fPoint(tail,[.5,0,-13])];
 list.push({depth:proj(tailFold[1])[2]+.4,draw(c){c.save();c.globalAlpha*=.35;line(c,tailFold.map(pj2),ARUAN.red.shadow,.7);c.restore();}});
 // Short tail flares behind the knot.
 surfacePart(list,[[1,1,0],[6,3,-5],[8,7,-11],[4,8,-14],[1,5,-8],[-1,2,-3]].map(p=>fPoint(knot,p)),ARUAN.red,79,{lw:.8,ink:ARUAN.red.shadow,shade:3.5});
 for(const [side,arm]of [[1,rig.armL],[-1,rig.armR]]){
  const armHulls=fleshPair(list,arm,[9,7.1,7,5.7],front,90+side);
  if(rig.hands){humanoidHandParts(list,rig,side===1?'L':'R',arm,armHulls);continue;}
  const axis=vNorm(vSub(arm.c,arm.b)),hf=boneFrame(arm.c,vAddS(arm.c,axis,8),front);
  if(side===1&&Appearance.current.accessory==='wrist-wrap')volume(list,hf,[[-8,6.5,6.5],[-1,6.8,6.8]],ARUAN.red,108,10,{lw:1.1});
  // A squared palm reads as a fist; its top edge is trimmed against the forearm.
  const palm=volume(list,hf,[[-4,4.2,4.4],[-1,4.9,5.1],[3,5.4,5.6],[7,5.5,5.7],[10,5.1,5.4],[12,4.1,4.6],[13,2.4,2.9]],ARUAN.skin,110,14,{lw:.8,ink:'#683b2d',join:{peer:armHulls.lower}});
  const handView=clamp((vDot(hf.x,Cam.toCam)-.03)/.42,0,1);
  if(handView>0)for(let j=0;j<3;j++){
   const y=(j-1)*2.45,pts=[[5.3,5.8],[5.2,8.4],[4.3,11]].map(([rx,z])=>fPoint(hf,[rx*Math.sqrt(1-(y/5.6)**2),y,z]));
   softCrease(list,pts,handView,.62);
  }
  // Thumb stays on the inner side of each hand, with its base hidden inside the palm.
  const t0=fPoint(hf,[1.8,3.8*side,-2.5]),t1=fPoint(hf,[2.8,5.2*side,5.5]),thumb=boneFrame(t0,t1,hf.x);
  volume(list,thumb,[[0,1.6,1.8],[2.5,2.2,2.4],[5,2.3,2.5],[7,1.8,2],[8,.8,1]],ARUAN.skin,115,12,{lw:.45,ink:'#7a4a38',texture:false,join:{peer:palm}});
 }
 equipmentParts(list,rig);buildHead(list,rig.head,rig.pose);return list.sort((a,b)=>a.depth-b.depth);
}
function drawCharacter(c,rig,debug=false){c.save();c.lineJoin='round';for(const p of characterParts(rig))p.draw(c);if(debug)drawSkeleton(c,rig,typeof debug==='object'?debug:{});c.restore();}
function drawSkeleton(c,r,options={}){
 const joints=options.joints!==false,feet=options.feet!==false,bones=options.bones!==false;
 for(const b of [r.legL,r.legR,r.armL,r.armR]){if(bones){line(c,[b.a,b.b,b.c].map(pj2),'#14222c',3);line(c,[b.a,b.b,b.c].map(pj2),'#68f4e4',1.1);line(c,[pj2(b.b),pj2(vAddS(b.b,b.pole,12))],'#ed60ac',.8);}if(joints)for(const p of [b.a,b.b,b.c]){const q=pj2(p);ellipse(c,q[0],q[1],2.1,2.1,'#ffe586','#1f3341',.7);}}
 if(bones)line(c,[r.pel.o,r.chest.o,r.head.o].map(pj2),'#68f4e4',1.5);
 if(feet)for(const b of [r.legL,r.legR]){const p=pj2([b.target[0],b.target[1],0]);ellipse(c,p[0],p[1],10,10*Cam.sinP,b.target[2]<=BODY.ankleH+.5?'#77e3ac88':'#e4a84b55','#9df7c6',.8);line(c,[p,pj2(b.target)],'#f1cb76',.7);}
}
