// Tool-only rest rig. Three: X left, Y up, Z forward. Canvas: X forward,Y left,Z up.
// Dimensions mirror BODY V1; the neutral legs are straight (pelvis62 rather than52).
export const aruanProfile=Object.freeze({id:'aruan-humanoid-v2',version:1,
  axes:{left:'+X',up:'+Y',forward:'+Z'},body:{upper:23,fore:22,thigh:27,shin:27,spine:24,hipWidth:10,shoulderWidth:15,ankleHeight:5}});
export function aruanHierarchy(){
  const bones=[['Hips',null,[0,62,0]],['Spine','Hips',[0,8,0]],['Spine1','Spine',[0,8,0]],
    ['Spine2','Spine1',[0,8,0]],['Neck','Spine2',[0,15,0]],['Head','Neck',[0,22,0]],['HeadTop_End','Head',[0,34,0]]];
  for(const [side,sign]of [['Left',1],['Right',-1]]){
    bones.push([side+'Shoulder','Spine2',[sign*7,7,0]],[side+'Arm',side+'Shoulder',[sign*8,0,0]],
      [side+'ForeArm',side+'Arm',[sign*23,0,0]],[side+'Hand',side+'ForeArm',[sign*22,0,0]],
      [side+'UpLeg','Hips',[sign*10,-3,0]],[side+'Leg',side+'UpLeg',[0,-27,0]],
      [side+'Foot',side+'Leg',[0,-27,0]],[side+'ToeBase',side+'Foot',[0,-2,12]],[side+'Toe_End',side+'ToeBase',[0,0,5]]);
    for(const [digit,z]of [['Thumb',-5],['Index',-3],['Middle',0],['Ring',3],['Pinky',5]]){
      for(let joint=1;joint<=4;joint++)bones.push([side+'Hand'+digit+joint,
        joint===1?side+'Hand':side+'Hand'+digit+(joint-1),[sign*(joint===1?5:joint===4?1.3:2.2),joint===1&&digit==='Thumb'?-1.5:0,joint===1?z:0]]);
    }
  }
  return bones;
}
