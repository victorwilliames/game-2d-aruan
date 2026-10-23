'use strict';
// Paint the world once. Sprites hold only Canvas 2D pixels produced here.
// Animation transforms cached foliage; it never generates random paint each frame.
const WORLD_RADIUS=810;
const GROUND={base:'#375448',shadow:'#223c3c',light:'#718254'};
const STONE={base:'#737b72',shadow:'#354951',light:'#b5b69a'};
const LEAF={base:'#3c6952',shadow:'#183e3d',light:'#8b9c59'};
const WOOD={base:'#735543',shadow:'#302f36',light:'#ad8556'};
const groundPoint=(sx,sy)=>[(sy/Cam.sinP-sx)*SQ1_2,(sy/Cam.sinP+sx)*SQ1_2,0];
function edgeR(a){return WORLD_RADIUS+28*Math.sin(a*5+.3)+18*Math.sin(a*9+1.2);}
function inside(x,y,margin=0){return Math.hypot(x,y)<edgeR(Math.atan2(y,x))-margin;}
function offscreen(w,h,scale=1.5){const canvas=document.createElement('canvas');canvas.width=Math.ceil(w*scale);canvas.height=Math.ceil(h*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);return {canvas,ctx,w,h,scale};}
function leafShape(c,x,y,rx,ry,seed,tones=LEAF){
  const rnd=makeRng(seed),pts=[];for(let i=0;i<13;i++){const a=i/13*TAU,r=rnd.range(.82,1.1);pts.push([x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r]);}
  paintedPoly(c,pts,tones,seed,2,24);
  c.save();c.beginPath();pathPoly(c,pts);c.clip();
  for(let i=0;i<20;i++){const px=x+rnd.range(-rx,rx),py=y+rnd.range(-ry,ry);polygon(c,[[px,py],[px+12,py-5],[px+18,py-2],[px+4,py+2]],i%3?tones.light:tones.shadow,null);}
  c.restore();
}
function makeTree(seed,variant=0){
  const s=offscreen(330,390),c=s.ctx,rnd=makeRng(seed),x=165;
  // Winding trunk with tapered, angular branches.
  paintedPoly(c,[[x-22,376],[x-12,328],[x-14,255],[x-35,206],[x-58,188],[x-36,188],[x-15,214],[x-8,164],[x+6,152],[x+10,239],[x+34,205],[x+52,190],[x+43,216],[x+16,258],[x+12,329],[x+32,379],[x+6,373]],WOOD,seed,3,38);
  line(c,[[x-2,366],[x-5,310],[x+1,248],[x-4,192]],'#bc8a54',3);
  line(c,[[x+10,362],[x+5,304],[x+9,260]],'#302d30',2);
  const foliage=variant===1?[[0,110,65,116],[-25,178,72,62],[31,197,64,58],[-2,60,40,55]]:[[-79,169,71,61],[72,154,75,59],[-18,110,94,74],[-67,100,63,57],[47,80,71,62],[-6,45,67,43],[14,162,94,60]];
  for(let i=0;i<foliage.length;i++){const [dx,dy,rx,ry]=foliage[i];leafShape(c,x+dx,dy+20,rx,ry,seed+i*19,{base:i%2?'#486d50':'#385d4b',shadow:'#1b3e3d',light:i%2?'#91a15c':'#6d8953'});}
  return {...s,ax:165,ay:380};
}
function makeBush(seed){const s=offscreen(160,100),c=s.ctx;for(let i=0;i<4;i++)leafShape(c,35+i*27,62-(i%2)*15,36,27,seed+i*5,{base:'#54774e',shadow:'#21463f',light:'#a0a360'});
  const r=makeRng(seed);for(let i=0;i<9;i++){const x=r.range(25,130),y=r.range(30,70);ellipse(c,x,y,2.2,2.7,'#d97855',INK,.6);}return {...s,ax:80,ay:88};}
function makeRock(seed){const s=offscreen(140,90),c=s.ctx,r=makeRng(seed);const top=[[18,36],[45,13],[90,9],[119,28],[96,52],[42,58]];
  polygon(c,[[18,36],[42,58],[96,52],[119,28],[126,69],[93,81],[25,75]],'#3c4e50',INK,2.5);paintedPoly(c,top,STONE,seed,2.2,35);
  polygon(c,[[18,36],[42,58],[39,74],[25,75]],'#647471',INK,1.1);polygon(c,[[96,52],[119,28],[126,69],[94,80]],'#394a50',INK,1.3);
  leafShape(c,69,28,31,12,seed+3,{base:'#5c7652',shadow:'#415c47',light:'#a1a26b'});
  line(c,[[68,50],[76,40],[88,41]],'#364145',1.5);return {...s,ax:70,ay:78};}
function makeColumn(seed,broken){const s=offscreen(150,280),c=s.ctx,h=broken?134:224,top=246-h;
  paintedPoly(c,[[17,246],[75,220],[133,245],[77,274]],STONE,seed,2.5,20);
  polygon(c,[[17,246],[77,274],[133,245],[133,256],[77,280],[17,258]],'#48595b',INK,2);
  paintedPoly(c,[[45,top+10],[76,top-3],[108,top+9],[108,239],[77,254],[45,239]],STONE,seed+1,2,35);
  polygon(c,[[77,top-3],[108,top+9],[108,239],[77,254]],'#586767',INK,1);
  for(let i=0;i<5;i++){const x=51+i*11;line(c,[[x,top+16],[x,239-(i===0||i===4?4:0)]],i<2?'#c4c2a4':'#3a5055',2.4);}
  if(!broken){paintedPoly(c,[[34,top+8],[76,top-11],[119,top+7],[119,top+20],[77,top+38],[34,top+22]],STONE,seed+7,1.8,16);}
  else polygon(c,[[45,top+10],[48,top-5],[57,top+8],[68,top-14],[78,top+2],[93,top-7],[108,top+9],[77,top+23]],'#c2bf9c',INK,1.5);
  const points=[];for(let i=0;i<14;i++){const y=top+25+i*(h-20)/14,x=76+Math.sin(i*.6)*24;points.push([x,y]);}
  line(c,points,'#213c33',2);
  for(let i=0;i<points.length;i++){const [x,y]=points[i],sg=i%2?1:-1;paintedPoly(c,[[x,y],[x+sg*17,y-8],[x+sg*13,y+6],[x,y+3]],{base:'#4d714d',shadow:'#274d40',light:'#829b5c'},seed+i,1,3);}
  return {...s,ax:76,ay:265};
}
function makeDummy(){const s=offscreen(130,165),c=s.ctx;
  ellipse(c,65,153,31,10,'#6f5b41',INK,2);paintedPoly(c,[[58,87],[70,87],[70,151],[58,153]],WOOD,51,2,18);
  paintedPoly(c,[[16,62],[27,46],[106,46],[116,63],[109,72],[23,72]],WOOD,52,2,20);
  for(const [x,y] of [[24,65],[111,66],[62,127]])for(let i=0;i<4;i++)line(c,[[x,y],[x+(i-2)*4,y+13]],'#d4ab63',1.5);
  paintedPoly(c,[[43,40],[85,40],[90,86],[79,112],[50,112],[38,87]],{base:'#b29154',shadow:'#6c5c41',light:'#e0c385'},55,2.4,26);
  ellipse(c,64,27,18,20,'#b49b64',INK,2);line(c,[[54,22],[60,29],[54,29],[60,22]],INK,1.2);line(c,[[68,22],[74,29],[68,29],[74,22]],INK,1.2);
  ellipse(c,64,69,19,21,'#692e36','#ead7a1',2);ellipse(c,64,69,11,12,'#b76647','#ead7a1',1.7);ellipse(c,64,69,4,4,'#eee0b5');
  return {...s,ax:65,ay:153};}
function makeTuft(seed){const s=offscreen(64,46),c=s.ctx,r=makeRng(seed);for(let i=0;i<11;i++){const x=r.range(8,55),h=r.range(10,32);polygon(c,[[x-2,42],[x+r.range(-12,8),42-h],[x+3,36],[x+6,42]],i%3?'#759263':'#b3ac6e',null);}return {...s,ax:32,ay:42};}
class World {
  constructor(){this.props=[];this.tufts=[];this.sprites={};this.cacheBuilds=0;this.build();}
  build(){
    const t=performance.now();this.sprites.oak=[makeTree(12),makeTree(43),makeTree(71)];this.sprites.cypress=[makeTree(33,1)];
    this.sprites.bush=[makeBush(45),makeBush(78),makeBush(19)];this.sprites.rock=[makeRock(15),makeRock(38),makeRock(62)];
    this.sprites.column=[makeColumn(13,false),makeColumn(77,true)];this.sprites.dummy=[makeDummy()];this.sprites.tuft=[makeTuft(18),makeTuft(28)];
    const place=(kind,sx,sy,v=0,scale=1)=>{const p=groundPoint(sx,sy);this.props.push({kind,x:p[0],y:p[1],z:0,v,s:scale,r:kind==='dummy'?57:kind==='column'?34:kind==='rock'?43:kind==='bush'?0:28,flash:0,kick:0,hits:0,fade:1});};
    place('dummy',-150,-15);place('dummy',150,-15);
    for(const [x,y,v] of [[-310,-85,0],[310,-135,1],[-470,120,1],[470,160,0]])place('column',x,y,v,.82);
    for(const [x,y,v,s] of [[-570,-40,0,1.1],[550,30,1,1.05],[-350,-260,2,.85],[310,-265,0,.8],[-660,170,1,.76],[650,185,2,.74]])place('oak',x,y,v,s);
    for(const [x,y] of [[-600,-175],[560,-175]])place('cypress',x,y,0,.78);
    const rnd=makeRng(643);
    for(let i=0;i<25;i++){const a=rnd()*TAU,d=rnd.range(380,720),p=[Math.cos(a)*d,Math.sin(a)*d];const q=pj2([...p,0]);place(i%3?'bush':'rock',q[0],q[1],i%3,rnd.range(.65,1.1));}
    for(let i=0;i<130;i++){const x=rnd.range(-780,780),y=rnd.range(-780,780);if(!inside(x,y,35)||Math.hypot(x,y)<310)continue;this.tufts.push({kind:'tuft',x,y,z:0,v:i%2,s:rnd.range(.6,1),kick:0,fade:1});}
    this.paintGround();this.buildMs=performance.now()-t;
  }
  paintGround(){
    const s=offscreen(1800,1190,1.4),c=s.ctx;c.translate(900,515);const rnd=makeRng(781),noise=makeNoise2D(13);
    const edge=[];for(let i=0;i<120;i++){const a=i/120*TAU,r=edgeR(a);edge.push([Math.cos(a)*r,Math.sin(a)*r,0]);}
    // Vertical rock strata. Fog belongs behind the island, never on top of it.
    for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];if((a[0]+a[1]+b[0]+b[1])<0)continue;
      const drop=170+noise(a[0]*.01,a[1]*.01)*80;const pts=[pj2(a),pj2(b),pj2(vAdd(b,[0,0,-drop])),pj2(vAdd(a,[0,0,-drop]))];
      polygon(c,pts,i%4===0?'#293b48':i%3?'#4d514b':'#69624f','#25343c',.7);
      for(let j=1;j<5;j++)line(c,[pj2(vAdd(a,[0,0,-j*30])),pj2(vAdd(b,[0,0,-j*31]))],j%2?'#8b7756':'#233744',1.3);
    }
    const perimeter=edge.map(pj2);polygon(c,perimeter,GROUND.base,'#101e2c',4);
    c.save();c.beginPath();pathPoly(c,perimeter);c.clip();
    // Large painterly masses, then small dry-brush strokes. No uncorrelated pixel noise.
    for(let i=0;i<240;i++){const x=rnd.range(-850,850),y=rnd.range(-480,480),rx=rnd.range(25,150),ry=rnd.range(10,55);const pts=[];
      for(let j=0;j<8;j++){const a=j/8*TAU;pts.push([x+Math.cos(a)*rx*rnd.range(.7,1.2),y+Math.sin(a)*ry]);}
      polygon(c,pts,rnd.pick(['#294941','#304d43','#3c5c49','#496b4c','#526d4d','#243f40']),null);
    }
    // An old ochre path winds behind the circular training court.
    c.beginPath();c.moveTo(-950,30);c.bezierCurveTo(-400,25,-220,-130,0,-140);c.bezierCurveTo(300,-150,430,-230,880,-180);
    c.strokeStyle='#263d38';c.lineWidth=75;c.stroke();c.strokeStyle='#8b7b53';c.lineWidth=67;c.stroke();c.strokeStyle='#b19a64';c.lineWidth=43;c.stroke();
    for(let i=0;i<11500;i++){
      const x=rnd.range(-860,860),y=rnd.range(-490,490);const w=rnd.range(2,16),h=rnd.range(.5,2.3);
      c.globalAlpha=rnd.range(.07,.22);polygon(c,[[x,y],[x+w,y-h],[x+w*.8,y+h],[x-2,y+h]],rnd.pick(['#c5bf7a','#8caa70','#132f3a','#d9c48c']),null);
    }c.globalAlpha=1;
    // Cached prop shadows: coherent light direction and soft-edged painterly silhouettes.
    for(const p of this.props){const q=pj2([p.x,p.y,0]),r=p.kind==='oak'?130:p.kind==='column'?80:p.kind==='dummy'?42:45;
      c.globalAlpha=.33;polygon(c,[[q[0]-r*.35,q[1]-7],[q[0]+r*.3,q[1]-9],[q[0]+r*1.7,q[1]+r*.36],[q[0]+r*.65,q[1]+r*.5]],'#102f39',null);c.globalAlpha=1;}
    this.plaza(c,rnd);
    for(let i=0;i<330;i++){const a=rnd()*TAU,d=rnd.range(350,780),p=[Math.cos(a)*d,Math.sin(a)*d,0],q=pj2(p);if(!inside(p[0],p[1],15))continue;
      if(i%4===0){ellipse(c,q[0],q[1],2,1.6,'#d1ac6f');ellipse(c,q[0]+2,q[1]-2,1.6,1.7,'#d69868');}
      else line(c,[[q[0]-3,q[1]],[q[0]-6,q[1]-6],[q[0],q[1]],[q[0]+4,q[1]-8]],'#728960',1);
    }
    c.restore();line(c,perimeter.concat([perimeter[0]]),'#9c9c68',2);
    this.ground={...s,ax:900,ay:515};this.cacheBuilds++;
  }
  plaza(c,rnd){
    const pp=(r,a)=>pj2([Math.cos(a)*r,Math.sin(a)*r,0]);
    ellipse(c,0,0,311,311*Cam.sinP,'#203d3f',INK,3);
    for(let row=0;row<4;row++){
      const r0=56+row*62,r1=r0+56,N=12+row*6;
      for(let i=0;i<N;i++){
        const a=i/N*TAU+.012+(row%2)*.06,b=(i+1)/N*TAU-.012+(row%2)*.06;
        const pts=[pp(r0,a),pp(r1,a),pp(r1,b),pp(r0,b)];
        const tone={base:rnd.pick(['#72786a','#7e806e','#646f66','#8a876e']),shadow:'#34484b',light:'#adad87'};
        paintedPoly(c,pts,tone,i+row*30,1.6,13);
        if(i%5===1)line(c,[pp(r0+12,a+.04),pp(r0+27,a+.08),pp(r0+37,a+.05)],'#344c4b',1.1);
      }
    }
    ellipse(c,0,0,52,52*Cam.sinP,'#5d7067','#baad76',2);
    const star=[];for(let i=0;i<16;i++)star.push(pp(i%2?17:45,i/16*TAU));polygon(c,star,'#c9ad69','#2b4144',1.5);ellipse(c,0,0,9,9*Cam.sinP,'#efcd83');
    for(let i=0;i<8;i++){const a=i/8*TAU;line(c,[pp(316,a),pp(328,a)],'#c8b278',2);}
  }
  update(dt,t,player){for(const p of this.props){p.flash=Math.max(0,p.flash-dt*5);p.kick*=Math.exp(-dt*7);const q=pj2([p.x,p.y,0]),h=pj2(player);
    const occluding=['oak','cypress','column'].includes(p.kind)&&h[0]>q[0]-130*p.s&&h[0]<q[0]+130*p.s&&h[1]<q[1]+12&&h[1]>q[1]-320*p.s;
    p.fade=damp(p.fade,occluding?.3:1,10,dt);}}
  drawGround(c){c.drawImage(this.ground.canvas,-this.ground.ax,-this.ground.ay,this.ground.w,this.ground.h);}
  drawProp(c,p,t){const s=this.sprites[p.kind][p.v%this.sprites[p.kind].length],q=pj2([p.x,p.y,0]);
    c.save();c.translate(...q);c.scale(p.s,p.s);c.globalAlpha=p.fade??1;
    if(['oak','cypress','bush','tuft'].includes(p.kind))c.rotate(Math.sin(t*1.5+p.x*.006+p.y*.003)*.014+(p.kick||0)*.04);
    if(p.kind==='dummy')c.rotate(Math.sin(t*35)*p.kick*.1);
    c.drawImage(s.canvas,-s.ax,-s.ay,s.w,s.h);
    if(p.flash){c.globalAlpha*=p.flash*.8;c.globalCompositeOperation='source-atop';c.fillStyle='#fff1bc';c.fillRect(-29,-118,58,83);c.globalCompositeOperation='source-over';}
    c.restore();
  }
  collide(pos){
    const r=Math.hypot(pos[0],pos[1]),max=edgeR(Math.atan2(pos[1],pos[0]))-38;if(r>max){pos[0]*=max/r;pos[1]*=max/r;}
    for(const p of this.props){if(!p.r)continue;const dx=pos[0]-p.x,dy=pos[1]-p.y,d=Math.hypot(dx,dy),min=p.r+19;if(d<min){const ux=d>.0001?dx/d:1,uy=d>.0001?dy/d:0;pos[0]=p.x+ux*min;pos[1]=p.y+uy*min;}}
  }
}
