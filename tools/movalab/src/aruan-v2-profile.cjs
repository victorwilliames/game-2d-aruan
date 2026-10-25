'use strict';
// Semantic humanoid skeleton proposal: Mixamo naming and parent/child structure.
// This is a TOOL profile, not the character's bind pose or Canvas geometry.
const BODY_V1=Object.freeze({spine:24,shoulderW:15,shoulderUp:7,hipW:10,hipDown:3,upper:23,fore:22,thigh:27,shin:27,ankleH:5,headUp:37,bowLength:105});
function humanoidHierarchy(){
 const h={Hips:null,Spine:'Hips',Spine1:'Spine',Spine2:'Spine1',Neck:'Spine2',Head:'Neck',HeadTop_End:'Head'};
 for(const side of ['Left','Right']){
  h[side+'Shoulder']='Spine2';h[side+'Arm']=side+'Shoulder';h[side+'ForeArm']=side+'Arm';h[side+'Hand']=side+'ForeArm';
  for(const digit of ['Thumb','Index','Middle','Ring','Pinky']){
   for(let joint=1;joint<=4;joint++)h[side+'Hand'+digit+joint]=joint===1?side+'Hand':side+'Hand'+digit+(joint-1);
  }
  h[side+'UpLeg']='Hips';h[side+'Leg']=side+'UpLeg';h[side+'Foot']=side+'Leg';h[side+'ToeBase']=side+'Foot';h[side+'Toe_End']=side+'ToeBase';
 }
 return h;
}
const CANONICAL_TO_V1={Hips:['px','py','pz','pYaw','pPitch','pRoll'],Spine2:['cYaw','cPitch','cRoll'],Head:['hYaw','hPitch'],LeftHand:['lha','lhd','lhh'],RightHand:['rha','rhd','rhh'],LeftFoot:['lfx','lfy','lfz','lfYaw','lfPitch'],RightFoot:['rfx','rfy','rfz','rfYaw','rfPitch']};
function checkMixamoTopology(animation){
 const expected=humanoidHierarchy(),missing=[],unexpected=[],mismatched=[];
 const seen=new Map(animation.bones.map(b=>[b.name,b.parent]));
 for(const [name,parent] of Object.entries(expected)){
  if(!seen.has(name))missing.push(name);
  else if(seen.get(name)!==parent)mismatched.push({bone:name,expectedParent:parent,actualParent:seen.get(name)});
 }
 for(const name of seen.keys())if(!(name in expected))unexpected.push(name);
 return {compatible:missing.length===0&&mismatched.length===0,expectedCount:Object.keys(expected).length,foundCount:seen.size,missing,unexpected,mismatched};
}
module.exports={BODY_V1,humanoidHierarchy,CANONICAL_TO_V1,checkMixamoTopology};
