'use strict';
// Offline contract extraction/evaluation. No Three dependency in this module.
const fs=require('node:fs'),crypto=require('node:crypto');
const {parseBinaryFbx,extractAnimation,sampleCurve,TICKS_PER_SECOND}=require('./fbx-binary.cjs');
const {buildHierarchy,quatMultiply,rotate}=require('./rig-v2.cjs');
const VERSION='mixamorig65.v1',ORDERS=['XYZ','XZY','YZX','YXZ','ZXY','ZYX'];
const props=node=>Object.fromEntries((node?.children.find(x=>x.name==='Properties70')?.children||[]).filter(x=>x.name==='P').map(x=>[x.properties[0],x.properties.slice(4)]));
function normalize(name){const s=String(name).split('\0')[0];if(s.includes(':')&&!/^mixamorig\d*:[^:]+$/i.test(s))throw Error('Unsupported bone namespace: '+s);return s.replace(/^mixamorig\d*:/i,'').replace(/^mixamorig\d*(?=[A-Z])/,'');}
function vec(value,fallback){const v=value??fallback;if(!Array.isArray(v)||v.length!==3||!v.every(Number.isFinite))throw Error('Invalid transform vector');return v.slice();}
function eulerFBX(degrees,order=0){
 const axes=ORDERS[order];if(!axes)throw Error('Unsupported FBX rotation order '+order);
 let q=[0,0,0,1];for(const axis of axes){const i='XYZ'.indexOf(axis),half=degrees[i]*Math.PI/360,a=[0,0,0,Math.cos(half)];a[i]=Math.sin(half);q=quatMultiply(a,q);}return q;
}
function localQuaternion(p,rotation){const pre=eulerFBX(vec(p.PreRotation,[0,0,0])),post=eulerFBX(vec(p.PostRotation,[0,0,0])),inverse=[-post[0],-post[1],-post[2],post[3]];return quatMultiply(quatMultiply(pre,eulerFBX(rotation,p.RotationOrder?.[0]??0)),inverse);}
function slerp(a,b,t){let d=a.reduce((s,v,i)=>s+v*b[i],0);if(d<0){b=b.map(v=>-v);d=-d;}d=Math.min(1,d);let q;if(d>.9995)q=a.map((v,i)=>v+(b[i]-v)*t);else{const theta=Math.acos(d),s=Math.sin(theta);q=a.map((v,i)=>(v*Math.sin((1-t)*theta)+b[i]*Math.sin(t*theta))/s);}const n=Math.hypot(...q);return q.map(v=>v/n);}
function supported(p){
 for(const name of ['RotationPivot','RotationOffset','ScalingPivot','ScalingOffset','GeometricTranslation','GeometricRotation'])if(p[name]?.some(v=>Math.abs(v)>1e-9))throw Error('Unsupported nonzero '+name);
 if(vec(p['Lcl Scaling'],[1,1,1]).some(v=>Math.abs(v-1)>1e-7))throw Error('Non-unit bone scale requires explicit calibration');
}
function read(file){const bytes=fs.readFileSync(file),scene=parseBinaryFbx(bytes),animation=extractAnimation(scene);return {bytes,scene,animation};}
function restBones(scene,animation){
 const models=scene.children.find(x=>x.name==='Objects').children.filter(x=>x.name==='Model'),raw=new Map();
 for(const m of models){const name=normalize(m.properties[1]);if(raw.has(name))throw Error('Ambiguous normalized bone: '+name);raw.set(name,m);}
 return buildHierarchy(animation).map(b=>{const name=normalize(b.name),p=props(raw.get(name));supported(p);return {name,parent:b.parent?normalize(b.parent):null,sourceName:String(raw.get(name).properties[1]).split('\0')[0],fbx:p,translation:vec(p['Lcl Translation'],[0,0,0]),quaternion:localQuaternion(p,vec(p['Lcl Rotation'],[0,0,0])),scale:vec(p['Lcl Scaling'],[1,1,1])};});
}
function globals(bones,locals=bones){
 const result={},active=new Set();const map=new Map(bones.map((b,i)=>[b.name,{b,i}]));if(map.size!==bones.length)throw Error('Duplicate bone in hierarchy');
 function visit(name){if(result[name])return result[name];if(active.has(name))throw Error('Cyclic skeleton');active.add(name);const entry=map.get(name);if(!entry)throw Error('Missing parent '+name);const {b,i}=entry,l=locals[i],parent=b.parent?visit(b.parent):null;
  if(l.translation?.length!==3||l.quaternion?.length!==4||!l.translation.every(Number.isFinite)||!l.quaternion.every(Number.isFinite)||Math.abs(Math.hypot(...l.quaternion)-1)>1e-6)throw Error('Invalid local transform '+name);
  const position=parent?rotate(parent.quaternion,l.translation).map((v,i)=>v+parent.position[i]):l.translation.slice(),quaternion=parent?quatMultiply(parent.quaternion,l.quaternion):l.quaternion.slice();active.delete(name);return result[name]={position,quaternion};}
 for(const b of bones)visit(b.name);return result;
}
function extractContract(file,boneMetadata,provenance={}){
 const {bytes,scene,animation}=read(file),bones=restBones(scene,animation),expected=boneMetadata.mixamo.map(normalize);
 if(expected.length!==65||new Set(expected).size!==65||bones.length!==65||expected.some(n=>!bones.some(b=>b.name===n)))throw Error('Source does not match the actual 65 metadata channels');
 const globalSettings=props(scene.children.find(x=>x.name==='GlobalSettings'));
 if(globalSettings.UpAxis?.[0]!==1||globalSettings.UpAxisSign?.[0]!==1||globalSettings.CoordAxis?.[0]!==0||globalSettings.FrontAxis?.[0]!==2||globalSettings.UnitScaleFactor?.[0]!==1)throw Error('Unexpected source coordinate system');
 const restWorld=globals(bones);for(const b of bones)b.restWorld=restWorld[b.name];
 return {schema:VERSION,version:1,provenance:{...provenance,sha256:crypto.createHash('sha256').update(bytes).digest('hex')},coordinates:{unit:'centimeter',up:'+Y',coordinate:'+X',frontAxis:'+Z',quaternion:'xyzw',rotation:'FBX extrinsic; pre * local * inverse(post)',localRotationOrderDefault:'XYZ extrinsic / ZYX intrinsic'},globalSettings,bones,sourceAnimation:{curveCount:animation.curveCount,keyInstants:animation.times.length,duration:(animation.times.at(-1)-animation.times[0])/TICKS_PER_SECOND},limitations:['This contract records source rest transforms; destination proportions are independent.','Bind/skin deformation is audited separately on skinned destinations; motion-only FBX has no mesh.','Nonzero pivots and non-unit bone scales require a separate explicit path.']};
}
function auditTopology(bones,contract){
 const seen=new Map(),duplicates=[];for(const b of bones){const name=normalize(b.name);if(seen.has(name))duplicates.push(name);seen.set(name,b.parent?normalize(b.parent):null);}
 const missing=[],mismatched=[];for(const b of contract.bones){if(!seen.has(b.name))missing.push(b.name);else if(seen.get(b.name)!==b.parent)mismatched.push({name:b.name,expected:b.parent,actual:seen.get(b.name)});}
 const extra=[...seen.keys()].filter(n=>!contract.bones.some(b=>b.name===n));return {compatible:!missing.length&&!mismatched.length&&!duplicates.length&&!extra.length,found:seen.size,missing,mismatched,duplicates,extra};
}
function createSampler(animation,contract){
 const topology=auditTopology(animation.bones,contract);if(!topology.compatible)throw Error('Incompatible topology '+JSON.stringify(topology));
 const byName=new Map(animation.bones.map(b=>[normalize(b.name),b])),tracks=new Map();for(const t of animation.tracks){const name=normalize(t.bone);if(!tracks.has(name))tracks.set(name,[]);tracks.get(name).push(t);}
 const rotations=new Map();
 for(const [name,ts]of tracks){const r=ts.find(t=>t.property==='Lcl Rotation');if(!r)continue;const {X,Y,Z}=r.channels;
  if(!X||!Y||!Z||!X.times.every((v,i)=>v===Y.times[i]&&v===Z.times[i])||X.times.length!==Y.times.length||X.times.length!==Z.times.length)throw Error('Unaligned Euler axes require offline quaternion baking: '+name);
  for(const c of [X,Y,Z])if(c.values.some((v,i)=>i&&Math.abs(v-c.values[i-1])>=180))throw Error('Large Euler step requires offline rotation subdivision: '+name);
  const p=byName.get(name).properties;rotations.set(name,{times:X.times.map(t=>Math.fround(t/TICKS_PER_SECOND)),values:X.times.map((_,i)=>localQuaternion(p,[X.values[i],Y.values[i],Z.values[i]]))});
 }
 const duration=(animation.times.at(-1)-animation.times[0])/TICKS_PER_SECOND;
 return function sample(seconds){if(!Number.isFinite(seconds))throw Error('Invalid time');const tick=animation.times[0]+Math.round(Math.max(0,Math.min(duration,seconds))*TICKS_PER_SECOND);
  const locals=contract.bones.map(b=>{const p=byName.get(b.name).properties;supported(p);const values={};for(const t of tracks.get(b.name)||[]){const fallback=p[t.property]||(t.property==='Lcl Scaling'?[1,1,1]:[0,0,0]);values[t.property]=['X','Y','Z'].map((a,i)=>sampleCurve(t.channels[a],tick)??fallback[i]);}
   const scale=vec(values['Lcl Scaling']??p['Lcl Scaling'],[1,1,1]);if(scale.some(v=>Math.abs(v-1)>1e-6))throw Error('Animated non-unit bone scale');
   const r=rotations.get(b.name);let quaternion;
   if(r){const time=tick/TICKS_PER_SECOND;let lo=0,hi=r.times.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(r.times[mid]<=time)lo=mid;else hi=mid;}const alpha=r.times[hi]===r.times[lo]?0:Math.max(0,Math.min(1,(time-r.times[lo])/(r.times[hi]-r.times[lo])));quaternion=slerp(r.values[lo],r.values[hi],alpha);}else quaternion=localQuaternion(p,vec(p['Lcl Rotation'],[0,0,0]));
   return {translation:vec(values['Lcl Translation']??p['Lcl Translation'],[0,0,0]),quaternion,scale};});
  return {locals,world:globals(contract.bones,locals)};
 };
}
module.exports={VERSION,normalize,eulerFBX,localQuaternion,read,restBones,globals,extractContract,auditTopology,createSampler};
