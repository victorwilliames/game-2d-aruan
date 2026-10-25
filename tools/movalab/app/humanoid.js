import {Quaternion,Vector3,Matrix4} from 'three';

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
function at(rest,name){return rest.byName.get(normalize(name));}
function referenceFrame(rest){
  const hips=at(rest,'Hips'),left=at(rest,'LeftUpLeg'),right=at(rest,'RightUpLeg'),spine=at(rest,'Spine');
  if(!hips||!left||!right||!spine)throw Error('Rig sem quadril, coluna ou pernas para orientar a pose neutra');
  const up=spine.position.clone().sub(hips.position).normalize();
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
  const mapped=target.bones.filter(e=>source.byName.has(normalize(e.bone.name)));
  const fingers=target.bones.filter(e=>/hand(thumb|index|middle|ring|pinky)/.test(normalize(e.bone.name)));
  const missingFingers=source.bones.filter(e=>/hand(thumb|index|middle|ring|pinky)/.test(normalize(e.bone.name))&&!target.byName.has(normalize(e.bone.name))).map(e=>e.bone.name);
  return {compatible:missing.length===0,status:missing.length?'incompatível':missingFingers.length?'parcial':'compatível',
    missing,mapped:mapped.length,fingers:fingers.length,missingFingers};
}
export class HumanoidRetarget {
  constructor(source,target){
    this.source=captureRest(source);this.target=captureRest(target);
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
      const b=entry.bone,s=source.byName.get(normalize(b.name)),neutral=target.local.get(b);
      b.position.copy(neutral.position);b.scale.copy(neutral.scale);b.quaternion.copy(neutral.quaternion);
      if(s){
        const delta=s.bone.getWorldQuaternion(new Quaternion()).multiply(s.rotation.clone().invert());
        const desired=this.align.clone().multiply(delta).multiply(this.inverseAlign).multiply(entry.rotation);
        const parent=b.parent?.getWorldQuaternion(new Quaternion())||new Quaternion();
        b.quaternion.copy(parent.invert().multiply(desired)).normalize();
        if(normalize(b.name)==='hips'){
          const offset=s.bone.getWorldPosition(new Vector3()).sub(s.position).applyQuaternion(this.align).multiplyScalar(this.scale);
          const position=entry.position.clone().add(offset);
          b.position.copy(b.parent?b.parent.worldToLocal(position):position);
        }
      }
      b.updateMatrixWorld(true);
    }
  }
}
