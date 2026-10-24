'use strict';
// Project a head-local ellipsoid so the trail exclusion follows turns and rolls.
function clipTrailHead(c,head){
 const center=fPoint(head,[-2,0,4]),h=pj2(center),axes=[[34,0,0],[0,40,0],[0,0,42]].map(axis=>{const p=pj2(vAdd(center,fDir(head,axis)));return [p[0]-h[0],p[1]-h[1]];});
 let xx=0,yy=0,xy=0;for(const a of axes){xx+=a[0]*a[0];yy+=a[1]*a[1];xy+=a[0]*a[1];}
 const spread=Math.hypot(xx-yy,2*xy),angle=.5*Math.atan2(2*xy,xx-yy),rx=Math.sqrt((xx+yy+spread)/2)+1.5,ry=Math.sqrt(Math.max(0,(xx+yy-spread)/2))+1.5;
 c.beginPath();c.rect(-10000,-10000,20000,20000);c.ellipse(h[0],h[1],rx,ry,angle,0,TAU);c.clip('evenodd');
}
class SwordTrail {
  constructor(){this.samples=[];}
  add(rig,dt,active){for(const s of this.samples)s.age+=dt;this.samples=this.samples.filter(s=>s.age<.12);if(active)this.samples.push({tip:rig.tip.slice(),base:vLerp(rig.guard,rig.tip,.48),age:0});}
  draw(c,rig,front){
    if(this.samples.length<2)return;
    const depth=hDepth(rig.chest.o);c.save();if(front)clipTrailHead(c,rig.head);
    for(let i=1;i<this.samples.length;i++){
      const a=this.samples[i-1],b=this.samples[i];if((hDepth(vMid(a.tip,b.tip))>=depth)!==front)continue;
      let A=pj2(a.tip),B=pj2(b.tip),I=pj2(a.base),J=pj2(b.base);
      const dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy);if(l<.15)continue;
      // A minimum screen-space width keeps an edge-on slam legible.
      let nx=-dy/l,ny=dx/l;if((I[0]-A[0])*nx+(I[1]-A[1])*ny<0){nx=-nx;ny=-ny;}
      const width=Math.abs((I[0]-A[0])*nx+(I[1]-A[1])*ny),min=5;
      if(width<min){
        // Edge-on motion reads as a tapered glint, not an opaque vertical slab.
        const mid=[(A[0]+B[0])/2,(A[1]+B[1])/2];c.save();c.globalAlpha=(1-b.age/.12)*.45;
        polygon(c,[A,[mid[0]+nx*2,mid[1]+ny*2],B,[mid[0]-nx,mid[1]-ny]],'#e2fff1',null);c.restore();continue;
      }
      const alpha=(1-b.age/.12)*.6;c.save();c.globalAlpha=alpha;
      polygon(c,[A,B,J,I],'#65d5db',null);
      const K=[lerp(A[0],I[0],.18),lerp(A[1],I[1],.18)],L=[lerp(B[0],J[0],.18),lerp(B[1],J[1],.18)];
      polygon(c,[A,B,L,K],'#fff9cb',null);line(c,[A,B],'#e2fff1',1.3);c.restore();
    }
    c.restore();
  }
}
class Effects {
  constructor(){this.particles=[];this.rings=[];this.words=[];this.time=0;}
  clear(){this.particles.length=0;this.rings.length=0;this.words.length=0;}
  burst(pos,count,color='#e4bf6f',power=140){count=Math.min(count,192-this.particles.length);for(let i=0;i<count;i++){const a=i/count*TAU+Math.random()*.4,s=power*(.4+Math.random()*.6);this.particles.push({p:pos.slice(),v:[Math.cos(a)*s,Math.sin(a)*s,70+Math.random()*120],life:.35+Math.random()*.3,max:.65,color,size:1.4+Math.random()*2});}}
  dust(pos){if(this.particles.length>=192)return;this.particles.push({p:vAdd(pos,[0,0,3]),v:[12,8,14],life:.25,max:.3,color:'#aa9b73',size:3});}
  impact(pos){if(this.rings.length>=8)this.rings.shift();if(this.words.length>=8)this.words.shift();this.rings.push({p:pos.slice(),age:0});this.burst(vAdd(pos,[0,0,6]),24,'#d8bd79',230);this.words.push({p:vAdd(pos,[0,0,140]),age:0});}
  update(dt){this.time+=dt;for(const p of this.particles){p.life-=dt;p.p=vAddS(p.p,p.v,dt);p.v[2]-=300*dt;}this.particles=this.particles.filter(p=>p.life>0&&p.p[2]>-2);
    for(const p of this.rings)p.age+=dt;this.rings=this.rings.filter(p=>p.age<.5);for(const p of this.words)p.age+=dt;this.words=this.words.filter(p=>p.age<.55);}
  ground(c){for(const r of this.rings){const q=pj2(r.p),a=1-r.age/.5,radius=35+r.age*260;c.save();c.globalAlpha=a*.7;c.beginPath();c.ellipse(q[0],q[1],radius,radius*Cam.sinP,0,0,TAU);c.strokeStyle='#eac786';c.lineWidth=3*a;c.stroke();
    const rnd=makeRng(68);for(let i=0;i<9;i++){let ang=i/9*TAU;let p=[r.p[0]+Math.cos(ang)*radius,r.p[1]+Math.sin(ang)*radius,0];line(c,[q,pj2(vLerp(r.p,p,.5)),pj2(vAdd(p,[rnd.range(-15,15),rnd.range(-15,15),0]))],'#142e39',1.8*a);}c.restore();}}
  entries(){return this.particles.map(p=>({depth:hDepth(p.p),draw(c){const q=pj2(p.p);c.save();c.globalAlpha=Math.min(1,p.life/p.max);polygon(c,[[q[0]-p.size,q[1]],[q[0],q[1]-p.size*1.8],[q[0]+p.size,q[1]],[q[0],q[1]+p.size]],p.color,null);c.restore();}}));}
  wordsDraw(c){for(const w of this.words){const q=pj2(w.p);c.save();c.translate(q[0],q[1]-w.age*24);c.rotate(-.12);c.globalAlpha=clamp((.55-w.age)*6,0,1);c.font='italic 900 24px Georgia';c.lineWidth=4;c.strokeStyle='#172731';c.fillStyle='#fbe2a4';c.strokeText('KRAK!',0,0);c.fillText('KRAK!',0,0);c.restore();}}
  wind(c,t){c.save();c.globalAlpha=.23;for(let i=0;i<8;i++){const x=((t*32+i*233)%1700)-850,y=Math.sin(i*72)*370;line(c,[[x,y],[x+27,y-3],[x+52,y-2]],'#b0c8a6',.7);}c.restore();}
}
