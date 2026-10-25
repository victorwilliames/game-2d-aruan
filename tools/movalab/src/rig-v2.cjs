'use strict';
// Skeletal hierarchy evaluator for offline MovaLab development.
// This is NOT a replacement for js/rig.js or the production Canvas renderer.
const {sampleBoneChannels}=require('./fbx-binary.cjs');
const DEG=Math.PI/180;
function quatMultiply(a,b){return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]+a[1]*b[3]+a[2]*b[0]-a[0]*b[2],a[3]*b[2]+a[2]*b[3]+a[0]*b[1]-a[1]*b[0],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];}
function quatInverse(a){return [-a[0],-a[1],-a[2],a[3]];}
function quatFromEulerXYZ(d){
 const [x,y,z]=d.map(v=>v*DEG/2);
 const xq=[Math.sin(x),0,0,Math.cos(x)],yq=[0,Math.sin(y),0,Math.cos(y)],zq=[0,0,Math.sin(z),Math.cos(z)];
 return quatMultiply(quatMultiply(xq,yq),zq);
}
function rotate(q,v){
 const [x,y,z,w]=q,[vx,vy,vz]=v;
 const tx=2*(y*vz-z*vy),ty=2*(z*vx-x*vz),tz=2*(x*vy-y*vx);
 return [vx+w*tx+y*tz-z*ty,vy+w*ty+z*tx-x*tz,vz+w*tz+x*ty-y*tx];
}
function buildHierarchy(animation){
 const byName=new Map(animation.bones.map(b=>[b.name,b]));
 if(byName.size!==animation.bones.length)throw new Error('Duplicate bone name');
 for(const b of animation.bones)if(b.parent&&!byName.has(b.parent))throw new Error('Missing parent for '+b.name);
 const result=[],visited=new Set(),active=new Set();
 function visit(b){if(visited.has(b.name))return;
  if(active.has(b.name))throw new Error('Cyclic skeleton hierarchy');
  active.add(b.name);if(b.parent)visit(byName.get(b.parent));active.delete(b.name);
  visited.add(b.name);result.push(b);
 }
 for(const b of animation.bones)visit(b);
 return result;
}
function evaluateSkeleton(animation,timeSeconds){
 const joints={},bones=buildHierarchy(animation);
 for(const bone of bones){
  const p=bone.properties||{},sample=sampleBoneChannels(animation,timeSeconds,bone.name);
  const t=sample['Lcl Translation']||p['Lcl Translation']||[0,0,0];
  const r=sample['Lcl Rotation']||p['Lcl Rotation']||[0,0,0];
  const pre=p.PreRotation||[0,0,0],post=p.PostRotation||[0,0,0];
  const q=quatMultiply(quatMultiply(quatFromEulerXYZ(pre),quatFromEulerXYZ(r)),quatInverse(quatFromEulerXYZ(post)));
  const parent=bone.parent?joints[bone.parent]:null;
  const pos=parent?rotate(parent.rotation,t).map((v,i)=>v+parent.position[i]):t.slice();
  const rotation=parent?quatMultiply(parent.rotation,q):q;
  joints[bone.name]={parent:bone.parent,position:pos,rotation};
 }
 return joints;
}
module.exports={quatMultiply,quatFromEulerXYZ,rotate,buildHierarchy,evaluateSkeleton};
