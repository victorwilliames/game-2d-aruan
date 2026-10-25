import {Quaternion,Vector3,Matrix4} from 'three';
import {aruanHierarchy} from './aruan-profile.js';
import {validateMapping} from './converter-settings.js';
export const humanoidSlots=Object.freeze(aruanHierarchy().map(b=>b[0]));

// A semantic profile is independent of the mesh. Missing fingers are partial support;
// a missing limb is incompatible. No source translation track is copied to a limb.
export const essential=['Hips','Spine','Head',...['Left','Right'].flatMap(s=>
  ['Arm','ForeArm','Hand','UpLeg','Leg','Foot'].map(n=>s+n))];
export const normalize=name=>String(name||'').replace(/^.*:/,'').replace(/^mixamorig\d*/i,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const restCache=new WeakMap();
export function captureRest(root){
  if(restCache.has(root))return restCache.get(root);
  root.updateMatrixWorld(true);
  const bones=[],byName=new Map(),local=new Map();
  root.traverse(b=>{
    local.set(b,{position:b.position.clone(),quaternion:b.quaternion.clone(),scale:b.scale.clone()});
    if(!b.isBone)return;
    const entry={bone:b,position:b.getWorldPosition(new Vector3()),rotation:b.getWorldQuaternion(new Quaternion())};
    bones.push(entry);byName.set(normalize(b.name),entry);
  });
  const result={root,bones,byName,local};restCache.set(root,result);return result;
}
export function restoreRest(rest){
  for(const [b,t]of rest.local){b.position.copy(t.position);b.quaternion.copy(t.quaternion);b.scale.copy(t.scale);}
  rest.root.updateMatrixWorld(true);
}
function aliasRoot(rest,bone){
 while(bone.parent?.isBone&&normalize(bone.parent.name)===normalize(bone.name)&&rest.local.get(bone).position.lengthSq()<1e-8)bone=bone.parent;
 return bone;
}
export function mapRest(rest,overrides={}){
 validateMapping(overrides);const byName=new Map(rest.byName),allowed=new Set(humanoidSlots.map(normalize));
 const explicit=new Set(Object.keys(overrides).map(normalize));
 for(const key of allowed){const group=rest.bones.filter(e=>normalize(e.bone.name)===key);if(group.length<2||explicit.has(key))continue;
  const roots=group.filter(e=>!group.some(p=>e.bone.parent===p.bone&&rest.local.get(e.bone).position.lengthSq()<1e-8));
  if(roots.length!==1)throw Error('Nome duplicado em ramos distintos: '+key+'. Escolha o nó no perfil manual.');
 }
 for(const [slot,name]of Object.entries(overrides)){
  const key=normalize(slot);if(!allowed.has(key))throw Error('Canal humanoide desconhecido: '+slot);
  if(name===null){byName.delete(key);continue;}
  const indexed=/^@bone:(\d+):(.*)$/.exec(name),matches=indexed?rest.bones.slice(Number(indexed[1]),Number(indexed[1])+1).filter(e=>e.bone.name===indexed[2]):rest.bones.filter(e=>e.bone.name===name);
  if(matches.length!==1)throw Error('Osso ausente ou ambíguo: '+name);
  byName.set(key,matches[0]);
 }
 const used=new Map();for(const slot of humanoidSlots){const entry=byName.get(normalize(slot));if(!entry)continue;const root=aliasRoot(rest,entry.bone);
  if(used.has(root))throw Error('Osso usado por dois canais: '+used.get(root)+' e '+slot);used.set(root,slot);
 }
 return {...rest,byName};
}
function at(rest,name){return rest.byName.get(normalize(name));}
function referenceFrame(rest){
  const hips=at(rest,'Hips'),left=at(rest,'LeftUpLeg'),right=at(rest,'RightUpLeg'),spine=at(rest,'Spine');
  if(!hips||!left||!right||!spine)throw Error('Rig sem quadril, coluna ou pernas para orientar a pose neutra');
  // An anatomical spine leans even in bind pose. Using that lean as scene-up
  // rotates forward root motion into the floor (13 units over this walk).
  // Snap to the dominant file axis; the rig profile then supplies true Y-up.
  const spineDirection=spine.position.clone().sub(hips.position);
  const components=spineDirection.toArray(),axis=components.reduce((best,v,i)=>Math.abs(v)>Math.abs(components[best])?i:best,0);
  const up=new Vector3().setComponent(axis,Math.sign(components[axis])||1);
  const across=left.position.clone().sub(right.position);across.addScaledVector(up,-across.dot(up)).normalize();
  if(up.lengthSq()<.9||across.lengthSq()<.9)throw Error('Pose neutra degenerada');
  const forward=new Vector3().crossVectors(across,up).normalize();
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(across,up,forward));
}
function legLength(rest){
  let sum=0;
  for(const s of ['Left','Right']){
    const a=at(rest,s+'UpLeg'),b=at(rest,s+'Leg'),c=at(rest,s+'Foot');
    if(a&&b&&c)sum+=a.position.distanceTo(b.position)+b.position.distanceTo(c.position);
  }
  return sum/2;
}
export function compatibility(source,target){
  const missing=essential.filter(n=>!at(source,n)||!at(target,n));
  const mapped=humanoidSlots.filter(n=>at(source,n)&&at(target,n));
  const fingerSlots=humanoidSlots.filter(n=>/hand(thumb|index|middle|ring|pinky)/.test(normalize(n)));
  const fingers=fingerSlots.filter(n=>at(target,n));
  const missingFingers=fingerSlots.filter(n=>!at(source,n)||!at(target,n)).map(n=>at(source,n)?.bone.name||at(target,n)?.bone.name||n);
  return {compatible:missing.length===0,status:missing.length?'incompatível':missingFingers.length?'parcial':'compatível',
    missing,mapped:mapped.length,fingers:fingers.length,missingFingers};
}
export class HumanoidRetarget {
  constructor(source,target,mapping={}){
    this.source=mapRest(captureRest(source),mapping.source);this.target=mapRest(captureRest(target),mapping.target);
    this.targetSlots=new Map();
    // FBXLoader may create a transform bone and a zero-offset skin bone with
    // the same name. Both automatic aliases must receive the animated global.
    for(const slot of humanoidSlots){const key=normalize(slot),entry=at(this.target,slot);if(!entry)continue;const root=aliasRoot(this.target,entry.bone);
      for(const e of this.target.bones.filter(e=>aliasRoot(this.target,e.bone)===root))this.targetSlots.set(e.bone,key);
    }
    this.report=compatibility(this.source,this.target);
    if(!this.report.compatible)throw Error('Falta mapeamento: '+this.report.missing.join(', '));
    this.align=referenceFrame(this.target).multiply(referenceFrame(this.source).invert());
    this.inverseAlign=this.align.clone().invert();
    this.scale=legLength(this.target)/legLength(this.source);
    if(!Number.isFinite(this.scale)||this.scale<=0)throw Error('Escala de rig inválida');
  }
  apply(){
    const {source,target}=this;
    source.root.updateMatrixWorld(true);
    // Parent-before-child traversal permits recovering local rotations from desired globals.
    for(const entry of target.bones){
      const b=entry.bone,slot=this.targetSlots.get(b),s=slot&&source.byName.get(slot),neutral=target.local.get(b);
      b.position.copy(neutral.position);b.scale.copy(neutral.scale);b.quaternion.copy(neutral.quaternion);
      if(s){
        const delta=s.bone.getWorldQuaternion(new Quaternion()).multiply(s.rotation.clone().invert());
        const desired=this.align.clone().multiply(delta).multiply(this.inverseAlign).multiply(entry.rotation);
        const parent=b.parent?.getWorldQuaternion(new Quaternion())||new Quaternion();
        b.quaternion.copy(parent.invert().multiply(desired)).normalize();
        if(slot==='hips'){
          const offset=s.bone.getWorldPosition(new Vector3()).sub(s.position).applyQuaternion(this.align).multiplyScalar(this.scale);
          const position=entry.position.clone().add(offset);
          b.position.copy(b.parent?b.parent.worldToLocal(position):position);
        }
      }
      b.updateMatrixWorld(true);
    }
  }
}
