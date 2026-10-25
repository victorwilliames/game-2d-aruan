import assert from 'node:assert/strict';
import {Group,Bone,Quaternion,Vector3} from '../app/node_modules/three/build/three.module.js';
import {aruanHierarchy} from '../app/aruan-profile.js';
import {captureRest,restoreRest,HumanoidRetarget} from '../app/humanoid.js';

function rig(angle=0,scale=1,yaw=0){
 const root=new Group(),bones=new Map();root.scale.setScalar(scale);root.rotation.y=yaw;
 for(const [name,parent,position]of aruanHierarchy()){
  const b=new Bone();b.name=name;b.position.fromArray(position);(parent?bones.get(parent):root).add(b);bones.set(name,b);
 }
 bones.get('LeftArm').rotation.z=-angle;bones.get('RightArm').rotation.z=angle;root.updateMatrixWorld(true);return root;
}
const pos=b=>b.getWorldPosition(new Vector3());
const pairs=[['Spine','Spine1'],['Spine1','Spine2'],['Neck','Head'],...['Left','Right'].flatMap(s=>[['Arm','ForeArm'],['ForeArm','Hand'],['Hand','HandMiddle1'],['UpLeg','Leg'],['Leg','Foot'],['Foot','ToeBase']].map(([a,b])=>[s+a,s+b]))];
let maxAimError=0,maxTwistError=0,maxLengthError=0;
for(const [sourceAngle,targetAngle,scale,yaw]of [[.7,0,1,0],[0,.7,1,0],[.65,.2,2,.9],[0,0,.6,-1.2]]){
 const source=rig(sourceAngle,scale,yaw),target=rig(targetAngle),retarget=new HumanoidRetarget(source,target),rest=captureRest(source),neutral=captureRest(target);
 for(const turn of [0,.2,1,Math.PI-1e-6,Math.PI,Math.PI+1e-6,4,6]){
  restoreRest(rest);
  const arm=rest.byName.get('leftarm').bone;
  arm.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0,0,1),turn)).multiply(new Quaternion().setFromAxisAngle(new Vector3(1,0,0),.9));
  rest.byName.get('righthand').bone.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(1,0,0),-.8));
  rest.byName.get('hips').bone.position.x+=3;source.updateMatrixWorld(true);retarget.apply();
  for(const [a,b]of pairs){
   const sa=rest.byName.get(a.toLowerCase()).bone,sb=rest.byName.get(b.toLowerCase()).bone,ta=neutral.byName.get(a.toLowerCase()).bone,tb=neutral.byName.get(b.toLowerCase()).bone;
   const expected=pos(sb).sub(pos(sa)).normalize().applyQuaternion(retarget.align),actual=pos(tb).sub(pos(ta)).normalize();
   maxAimError=Math.max(maxAimError,expected.distanceTo(actual));
  }
  const expectedQ=retarget.align.clone().multiply(arm.getWorldQuaternion(new Quaternion())),actualQ=neutral.byName.get('leftarm').bone.getWorldQuaternion(new Quaternion());
  maxTwistError=Math.max(maxTwistError,expectedQ.angleTo(actualQ));
  for(const e of neutral.bones){assert.ok(e.bone.quaternion.toArray().every(Number.isFinite));if(e.bone.name!=='Hips')maxLengthError=Math.max(maxLengthError,e.bone.position.distanceTo(neutral.local.get(e.bone).position));}
 }
 // Animated child offsets must affect direction without changing target lengths.
 restoreRest(rest);rest.byName.get('leftforearm').bone.position.y+=4;source.updateMatrixWorld(true);retarget.apply();
 const expected=pos(rest.byName.get('leftforearm').bone).sub(pos(rest.byName.get('leftarm').bone)).normalize().applyQuaternion(retarget.align);
 const actual=pos(neutral.byName.get('leftforearm').bone).sub(pos(neutral.byName.get('leftarm').bone)).normalize();assert.ok(expected.distanceTo(actual)<1e-7);
}
assert.ok(maxAimError<1e-7,'DireçãoT/A incorreta: '+maxAimError);assert.ok(maxTwistError<1e-6,'Torção não preservada: '+maxTwistError);assert.ok(maxLengthError<1e-8);
console.log(JSON.stringify({restAlignment:'PASS',cases:4,maxAimError,maxTwistError,maxLengthError,includes:'T↔A, twist,180graus, yaw,escala e translação de filho'}));
