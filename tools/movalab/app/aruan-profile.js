// Tool-only rest rig. Three: X left, Y up, Z forward. Canvas: X forward,Y left,Z up.
// Dimensions mirror BODY V1; the neutral legs are straight (pelvis62 rather than52).
const DEFAULT_BODY=Object.freeze({upper:23,fore:22,thigh:27,shin:27,spine:24,hipWidth:10,shoulderWidth:15,ankleHeight:5,hipDrop:3,shoulderUp:7,neckLength:15,headOffset:22,headTop:34});
const DEFAULT_SHAPE=Object.freeze({headScale:1,torsoWidth:1,torsoDepth:1,belly:1,limbThickness:1,handScale:1,footScale:1});
export function createHumanoidProfile({id='humanoid-custom',body={},shape={}}={}){
  if(typeof id!=='string'||!/^[a-z0-9-]{1,80}$/i.test(id))throw Error('Identificador de perfil inválido');
  function dimensions(values,defaults,max){
    for(const key of Object.keys(values))if(!Object.hasOwn(defaults,key))throw Error('Parâmetro de perfil desconhecido: '+key);
    const result={...defaults,...values};for(const [key,value]of Object.entries(result))if(!Number.isFinite(value)||value<=0||value>max)throw Error('Dimensão inválida: '+key);
    return Object.freeze(result);
  }
  return Object.freeze({schema:'humanoid-profile.v1',id,version:1,axes:Object.freeze({left:'+X',up:'+Y',forward:'+Z'}),body:dimensions(body,DEFAULT_BODY,500),shape:dimensions(shape,DEFAULT_SHAPE,5)});
}
export const aruanProfile=createHumanoidProfile({id:'aruan-humanoid-v2'});
export const humanoidArchetypes=Object.freeze({
  small:createHumanoidProfile({id:'humanoid-small',body:{upper:18,fore:17,thigh:20,shin:20,spine:20,hipWidth:8,shoulderWidth:12,ankleHeight:4,neckLength:12,headOffset:18},shape:{headScale:.9,handScale:.85,footScale:.8,limbThickness:.8}}),
  heavy:createHumanoidProfile({id:'humanoid-heavy',body:{upper:26,fore:24,thigh:26,shin:26,spine:28,hipWidth:16,shoulderWidth:23,ankleHeight:6},shape:{torsoDepth:1.4,belly:1.3,limbThickness:1.4,handScale:1.1,footScale:1.2}}),
  tallMuscular:createHumanoidProfile({id:'humanoid-tall-muscular',body:{upper:33,fore:31,thigh:41,shin:41,spine:37,hipWidth:14,shoulderWidth:24,ankleHeight:7,neckLength:18,headOffset:20},shape:{headScale:.85,torsoDepth:1.2,limbThickness:1.3,handScale:1.2,footScale:1.4}})
});
export function aruanHierarchy(profile=aruanProfile){
  const {body:b,shape:s}=profile===aruanProfile?profile:createHumanoidProfile(profile);
  const pelvis=b.ankleHeight+b.thigh+b.shin+b.hipDrop,spine=b.spine/3,shoulder=b.shoulderWidth*7/15;
  const bones=[['Hips',null,[0,pelvis,0]],['Spine','Hips',[0,spine,0]],['Spine1','Spine',[0,spine,0]],
    ['Spine2','Spine1',[0,spine,0]],['Neck','Spine2',[0,b.neckLength,0]],['Head','Neck',[0,b.headOffset,0]],['HeadTop_End','Head',[0,b.headTop*s.headScale,0]]];
  for(const [side,sign]of [['Left',1],['Right',-1]]){
    bones.push([side+'Shoulder','Spine2',[sign*shoulder,b.shoulderUp,0]],[side+'Arm',side+'Shoulder',[sign*(b.shoulderWidth-shoulder),0,0]],
      [side+'ForeArm',side+'Arm',[sign*b.upper,0,0]],[side+'Hand',side+'ForeArm',[sign*b.fore,0,0]],
      [side+'UpLeg','Hips',[sign*b.hipWidth,-b.hipDrop,0]],[side+'Leg',side+'UpLeg',[0,-b.thigh,0]],
      [side+'Foot',side+'Leg',[0,-b.shin,0]],[side+'ToeBase',side+'Foot',[0,-2*s.footScale,12*s.footScale]],[side+'Toe_End',side+'ToeBase',[0,0,5*s.footScale]]);
    for(const [digit,z]of [['Thumb',-5],['Index',-3],['Middle',0],['Ring',3],['Pinky',5]]){
      for(let joint=1;joint<=4;joint++)bones.push([side+'Hand'+digit+joint,
        joint===1?side+'Hand':side+'Hand'+digit+(joint-1),[sign*(joint===1?5:joint===4?1.3:2.2)*s.handScale,(joint===1&&digit==='Thumb'?-1.5:0)*s.handScale,(joint===1?z:0)*s.handScale]]);
    }
  }
  return bones;
}
