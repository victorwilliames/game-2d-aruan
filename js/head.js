'use strict';
// Facial coordinates are authored here from the identity reference, not sampled from PNGs.
// Features follow a curved front surface; rear views reveal hair and never a second face.
function buildHead(parts,f,pose=BASE_POSE){
 // The drawn reference keeps a three-quarter face at lateral body headings.
 // Smooth view correction belongs to the illustration, never the simulation rig.
 const viewX=vDot(f.x,Cam.toCam),viewY=vDot(f.y,Cam.toCam);
 const faceTurn=Math.atan2(viewY,viewX);
 f=fYaw(f,Math.sin(faceTurn)*28*DEG*smoothstep(-.55,.15,viewX));
 const skin=ARUAN.skin,hair=ARUAN.hair,openness=1-clamp(pose.blink||0,0,1);
 volume(parts,f,[[-31,18,22],[-28,26,29],[-18,30,34],[-3,30,35],[13,28,34],[25,20,26],[31,8,12]],{...skin,shadow:'#ba603f'},300,20,{lw:1.1,ink:'#683b2d',shade:3.2});
 const front=vDot(f.x,Cam.toCam);
 const face=(y,z,raise=.5)=>fPoint(f,[29*Math.sqrt(Math.max(.03,1-(y/36)**2))*(z< -16?lerp(1,.76,clamp((-z-16)/13,0,1)):1)+raise,y,z]);
 const normal=y=>vNorm(fDir(f,[Math.sqrt(Math.max(.01,1-(y/36)**2)),y/36,0]));
 const patch=(coords,fill,seed=1,opt={})=>{const mid=coords.reduce((a,p)=>a+p[0],0)/coords.length;if(vDot(normal(mid),Cam.toCam)<.05)return;addFace(parts,coords.map(p=>face(...p)),skin,seed,{color:fill,ink:false,texture:false,...opt});};
 // Small flat ears tucked behind the cheek and against the skull.
 for(const side of [-1,1]){
  const earY=x=>side*34.9*Math.sqrt(Math.max(.12,1-(x/30)**2));
  const ear=[[-8.2,-7.4],[-5.2,-8.6],[-1.4,-6.4],[.6,-2.2],[.2,2.0],[-2.2,5.0],[-5.2,6.0],[-8.0,3.2],[-9.0,-1.6]].map(([x,z])=>fPoint(f,[x,earY(x),z-4.2]));
  surfacePart(parts,ear,{base:'#c9764a',shadow:'#ad5438',light:'#d98a56'},315+side,{soft:.3,lw:.55,ink:'#7d4634',shade:1.2,hl:.12,marks:0});
  const inner=[[-6.4,-5.6],[-4.4,-6.4],[-2.0,-4.6],[-1.2,-.8],[-2.0,2.0],[-3.8,3.2],[-5.4,1.2]].map(([x,z])=>fPoint(f,[x,earY(x)+side*.18,z-4.2]));
  const id=inner.reduce((v,p)=>v+proj(p)[2],0)/inner.length;
  parts.push({depth:id+.05,draw:c=>{c.save();c.globalAlpha=.3;polygon(c,inner.map(pj2),'#9e4d34',null);c.restore();}});
 }
 if(front>-.65){
  // Red band spans eyes; black geometry is confined to the two cheek bands.
  for(let y=-32;y<32;y+=4){patch([[y,2],[y+4,2],[y+4,-8],[y,-8]],y>8?'#b72c26':'#d93c29',330+y);}
  for(const s of [-1,1]){
   const ys=[7,12,17,22,27,31];
   for(let i=0;i<ys.length-1;i++){
    const a=ys[i]*s,b=ys[i+1]*s;patch([[a,-10],[b,-10],[b,-16],[a,-16]],'#342b25');
    // Nested chevrons reproduce the reference's copper gaps inside black paint.
    for(let n=0;n<2;n++){const z=-10.8-n*2.4;const pts=[[a+.5*s,z-3],[lerp(a,b,.5),z],[b-.5*s,z-3]].map(p=>face(p[0],p[1],.8));
     if(vDot(normal((a+b)/2),Cam.toCam)>.08)parts.push({depth:pts.reduce((v,p)=>v+proj(p)[2],0)/3+.2,draw:c=>line(c,pts.map(pj2),'#df9560',.75)});
    }
   }
   if(vDot(normal(s*16),Cam.toCam)>.12){
    const coords=[[s*5,2],[s*26,6],[s*24,1],[s*20,-2],[s*12,-3],[s*6,-1]].map(([y,z])=>[y,lerp(1.5,z,openness)]),eyes=coords.map(p=>face(...p,.95)),depth=eyes.reduce((a,p)=>a+proj(p)[2],0)/eyes.length;
    parts.push({depth:depth+.35,draw(c){const pts=eyes.map(pj2),build=q=>{q.moveTo(...pts[0]);q.lineTo(...pts[1]);q.bezierCurveTo(...pts[2],...pts[3],...pts[4]);q.quadraticCurveTo(...pts[5],...pts[0]);q.closePath();};
     c.beginPath();build(c);c.fillStyle='#f5e4bf';c.fill();c.save();c.clip();
     const pupil=[];for(let i=0;i<24;i++){const a=i/24*TAU;pupil.push(pj2(face(s*16+Math.cos(a)*5.6,2.5+Math.sin(a)*4.2,1.1)));}polygon(c,pupil,'#292321',null);c.restore();
     line(c,[pts[0],pts[1]],'#251d1b',1.5);
     const brow=[[s*5,8-pose.effort*1.4],[s*11,14],[s*28,16],[s*25,11-pose.effort*.5]].map(p=>pj2(face(...p,1)));polygon(c,brow,'#2c221e',null);
    }});
   }
  }
  if(front>0){
   // A shallow outward volume reads as a button nose in front and in profile.
   const noseFrame={o:face(0,-9.6,1),x:f.y,y:f.z,z:f.x},noseParts=[];
   volume(noseParts,noseFrame,[[0,4.0,3.4],[1.1,3.7,3.1],[2.1,2.8,2.3],[2.7,1.2,1.0]],{base:'#d98652',shadow:'#ad5438',light:'#e79b63'},381,10,{lw:.45,ink:'#a85a3c',shade:2,texture:false});
   for(const p of noseParts){p.depth+=.6;parts.push(p);}
   const nShadow=[[-2.8,-12.2],[-1.4,-12.6],[0,-12.7],[1.4,-12.6],[2.8,-12.2]].map(([y,z])=>face(y,z,1.2));
   parts.push({depth:proj(face(0,-12.5,1.2))[2]+.8,draw:c=>{c.save();c.globalAlpha=.45;line(c,nShadow.map(pj2),'#a95338',.6);c.restore();}});
   // The lip band is gently lifted at the corners; the lower lip stays a soft shadow.
   const mTopZ=y=>-19.6+Math.abs(y)*.2,mBotZ=y=>mTopZ(y)-(.15+.8*(1-Math.pow(Math.abs(y)/6.1,1.5)));
   const my=[-5.8,-3.6,-1.8,0,1.8,3.6,5.8],mouth=[...my.map(y=>face(y,mTopZ(y),1.5)),...my.slice().reverse().map(y=>face(y,mBotZ(y),1.45))];
   const md=mouth.reduce((v,p)=>v+proj(p)[2],0)/mouth.length;
   parts.push({depth:md+.35,draw:c=>{
    polygon(c,mouth.map(pj2),'#743a2c',null);
    const lipY=[-3.0,-1.5,0,1.5,3.0],lip=[...lipY.map(y=>face(y,mBotZ(y)-.4,1.5)),...lipY.slice().reverse().map(y=>face(y,mBotZ(y)-1.6,1.5))];
    c.save();c.globalAlpha=.16;polygon(c,lip.map(pj2),'#9e4d34',null);c.restore();
   }});
  }
 }
 // Cheek side locks removed at the author's request.
 // Hair is a continuous dark cap with individually curved, blunt-cut fringe panels.
 // The curved panels already close the cap. An extra convex hull here would
 // paint the back of the haircut over the eyes in an elevated camera.
 for(let i=0;i<14;i++){
  const a=(i/14)*TAU,b=((i+1)/14)*TAU,mid=(a+b)/2;
  const cropped=Appearance.current.hair==='cropped';
  const bottom=theta=>{const front=Math.cos(theta),side=Math.abs(Math.sin(theta));return lerp(cropped?-1:-9,cropped?22:19,smoothstep(-.6,.25,front))+side*.5+Math.sin(theta*7+1)*2;};
  const point=(t,theta)=>{const rad=Math.sin(t*Math.PI/2);return fPoint(f,[-5+Math.cos(theta)*(37+Math.sin(theta*7+1)*1.1)*rad,Math.sin(theta)*40*rad,39*Math.cos(t*Math.PI/2)+bottom(theta)*Math.pow(t,4)]);};
  const points=[];for(let k=0;k<=8;k++)points.push(point(k/8,a));for(let k=1;k<6;k++)points.push(point(1,lerp(a,b,k/6)));for(let k=8;k>=0;k--)points.push(point(k/8,b));
  const P=points.map(pj2),depth=points.reduce((v,p)=>v+proj(p)[2],0)/points.length+1;
  parts.push({depth,draw(c){const build=q=>pathSoftPoly(q,P,.18);celFill(c,build,{base:i%3===0?hair.capAlt:hair.capBase,shadow:hair.shadow,light:hair.capLight},.35,.08);
   // Keep panel shading, but reserve dark ink for the blunt fringe rim.
   inkStroke(c,build,.22,hair.capBase);const rim=[];for(let k=0;k<=5;k++)rim.push(pj2(point(1,lerp(a,b,k/5))));line(c,rim,hair.ink,.7);
   c.save();c.beginPath();build(c);c.clip();const rng=makeRng(540+i);
   for(let j=0;j<22;j++){const theta=lerp(a,b,rng()),start=rng.range(.18,.65),end=Math.min(.91,start+rng.range(.05,.18));const pts=[];for(let k=0;k<4;k++)pts.push(pj2(point(lerp(start,end,k/3),theta)));c.globalAlpha=.055+rng()*.08;line(c,pts,j%4?hair.mark:hair.dark,rng.range(.25,.7));}c.restore();
  }});
 }
 // Small crown tufts, matching the silhouette without adding a new accessory.
 for(const pts of [[[-3,-4,30],[-16,-18,38],[-18,-13,31],[-8,2,27]],[[-2,2,31],[9,13,38],[-5,20,33],[-10,8,27]]])surfacePart(parts,pts.map(p=>fPoint(f,p)),hair,560,{lw:1,shade:2,ink:hair.ink});
 const ff=fRoll(fPitch({...f,o:fPoint(f,[-9,23,27])},-.18),-.48+pose.secondary*.08);
 // Art-directed vane follows the attached stem, with readable width in every view.
 // Only the vane's width axis faces the viewer; anchor, tilt and secondary motion stay in world space.
 ff.y=vNorm(vCross(ff.z,Cam.toCam));ff.x=vNorm(vCross(ff.y,ff.z));
 featherParts(parts,ff,43,12.5,590);
}
