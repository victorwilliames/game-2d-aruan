'use strict';
// Facial coordinates are authored here from the identity reference, not sampled from PNGs.
// Features follow a curved front surface; rear views reveal hair and never a second face.
function buildHead(parts,f,pose=BASE_POSE){
 const skin=ARUAN.skin,hair=ARUAN.hair;
 volume(parts,f,[[-37,11,15],[-33,22,27],[-23,28,33],[-2,29,35],[13,28,34],[27,20,26],[34,8,12]],skin,300,20,{lw:1.4});
 const front=vDot(f.x,Cam.toCam);
 const face=(y,z,raise=.5)=>fPoint(f,[29*Math.sqrt(Math.max(.03,1-(y/36)**2))*(z< -16?lerp(1,.76,clamp((-z-16)/13,0,1)):1)+raise,y,z]);
 const normal=y=>vNorm(fDir(f,[Math.sqrt(Math.max(.01,1-(y/36)**2)),y/36,0]));
 const patch=(coords,fill,seed=1,opt={})=>{const mid=coords.reduce((a,p)=>a+p[0],0)/coords.length;if(vDot(normal(mid),Cam.toCam)<.05)return;addFace(parts,coords.map(p=>face(...p)),skin,seed,{color:fill,ink:false,texture:false,...opt});};
 // Round ears, simple inner plane, no jewellery.
 for(const s of [-1,1]){const ef={...f,o:fPoint(f,[0,s*34,-8])};const ear=[[-2,-4,7],[3,1,9],[6,6,4],[5,9,-3],[1,7,-11],[-2,0,-12]].map(p=>fPoint(ef,[p[0],p[1]*s,p[2]]));
 surfacePart(parts,ear,skin,315+s,{soft:.6,lw:1.1,shade:4,detail(c){line(c,[[4,s*3,3],[5,s*5,0],[2,s*4,-5]].map(p=>pj2(fPoint(ef,p))),'#a85136',1.8);}});}
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
    const coords=[[s*5,2],[s*26,6],[s*24,1],[s*20,-2],[s*12,-3],[s*6,-1]],eyes=coords.map(p=>face(...p,.95)),depth=eyes.reduce((a,p)=>a+proj(p)[2],0)/eyes.length;
    parts.push({depth:depth+.35,draw(c){const pts=eyes.map(pj2),build=q=>{q.moveTo(...pts[0]);q.lineTo(...pts[1]);q.bezierCurveTo(...pts[2],...pts[3],...pts[4]);q.quadraticCurveTo(...pts[5],...pts[0]);q.closePath();};
     c.beginPath();build(c);c.fillStyle='#f5e4bf';c.fill();c.save();c.clip();
     const pupil=[];for(let i=0;i<24;i++){const a=i/24*TAU;pupil.push(pj2(face(s*16+Math.cos(a)*5.6,2.5+Math.sin(a)*4.2,1.1)));}polygon(c,pupil,'#292321',null);c.restore();
     line(c,[pts[0],pts[1]],'#251d1b',1.5);
     const brow=[[s*5,8-pose.effort*1.4],[s*10,11.5],[s*27,12],[s*22,9.5-pose.effort*.5]].map(p=>pj2(face(...p,1)));polygon(c,brow,'#2c221e',null);
    }});
   }
  }
  if(front>0){
   const noseF={...f,o:face(0,-7,1)};volume(parts,noseF,[[-3,2,3],[0,4.2,4.5],[3,2.4,3]],{base:'#db8b55',shadow:'#ad5237',light:'#efa36a'},381,12,{lw:.4,texture:false});
   const mouth=[face(-5,-27,3),face(-1,-25.7,3),face(3,-26,3),face(5,-27,3)];parts.push({depth:proj(face(0,-26,3))[2]+1,draw:c=>line(c,mouth.map(pj2),'#773a2c',.85)});
  }
 }
 // Side locks descend below the bangs and frame the cheeks.
 for(const s of [-1,1]){
  const pts=[[14,s*29,16],[22,s*32,14],[21,s*33,-14],[15,s*30,-20],[9,s*29,-10]].map(p=>fPoint(f,[p[0]+(p[2]<0?pose.secondary*1.2:0),p[1],p[2]*(Appearance.current.hair==='cropped'&&p[2]<0?.5:1)]));surfacePart(parts,pts,hair,400+s,{shade:3,hl:.4,lw:1.2});
 }
 // Hair is a continuous dark cap with individually curved, blunt-cut fringe panels.
 // The curved panels already close the cap. An extra convex hull here would
 // paint the back of the haircut over the eyes in an elevated camera.
 for(let i=0;i<14;i++){
  const a=(i/14)*TAU,b=((i+1)/14)*TAU,mid=(a+b)/2;
  const cropped=Appearance.current.hair==='cropped';
  const bottom=theta=>Math.cos(theta)>.25?(cropped?17:12)+Math.sin(theta*3)*2.2+(Math.abs(Math.sin(theta))<.24?3:0):(cropped?-4:-10);
  const point=(t,theta)=>{const rad=Math.sin(t*Math.PI/2);return fPoint(f,[-3+Math.cos(theta)*32*rad,Math.sin(theta)*39*rad,40*Math.cos(t*Math.PI/2)+bottom(theta)*Math.pow(t,4)]);};
  const points=[];for(let k=0;k<=8;k++)points.push(point(k/8,a+.003));for(let k=8;k>=0;k--)points.push(point(k/8,b-.003));
  const P=points.map(pj2),depth=points.reduce((v,p)=>v+proj(p)[2],0)/points.length+1;
  parts.push({depth,draw(c){const build=q=>pathSoftPoly(q,P,.18);celFill(c,build,{base:i%3===0?hair.capAlt:hair.capBase,shadow:hair.shadow,light:hair.capLight},2,.12);inkStroke(c,build,.55,hair.ink);
   c.save();c.beginPath();build(c);c.clip();const rng=makeRng(540+i);
   for(let j=0;j<22;j++){const theta=lerp(a,b,rng()),start=rng.range(.18,.65),end=Math.min(.91,start+rng.range(.05,.18));const pts=[];for(let k=0;k<4;k++)pts.push(pj2(point(lerp(start,end,k/3),theta)));c.globalAlpha=.055+rng()*.08;line(c,pts,j%4?hair.mark:hair.dark,rng.range(.25,.7));}c.restore();
  }});
 }
 // Small crown tufts, matching the silhouette without adding a new accessory.
 for(const pts of [[[-3,-4,35],[-12,-15,43],[-15,-14,36],[-8,2,31]],[[-2,2,36],[3,9,43],[-5,17,39],[-10,8,32]]])surfacePart(parts,pts.map(p=>fPoint(f,p)),hair,560,{lw:1,shade:2});
 const ff=fRoll(fPitch({...f,o:fPoint(f,[-8,24,29])},-.12),-.38+pose.secondary*.08);featherParts(parts,ff,35,8.5,590);
}
