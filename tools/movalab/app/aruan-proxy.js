import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {aruanProfile,aruanHierarchy} from './aruan-profile.js';

// Real SkinnedMesh: all geometry is in bind space and vertices have normalized
// bone weights. Joint regions blend two influences; no fake bone-attached mesh.
export function createAruanProxy(){
  const root=new T.Group();root.name='Aruan 3D Proxy';
  const bones=[],byName=new Map(),index=new Map();
  for(const [name,parent,position]of aruanHierarchy()){
    const bone=new T.Bone();bone.name=name;bone.position.fromArray(position);
    (parent?byName.get(parent):root).add(bone);index.set(name,bones.length);byName.set(name,bone);bones.push(bone);
  }
  root.updateMatrixWorld(true);
  const skeleton=new T.Skeleton(bones),parts=[];
  const pos=name=>byName.get(name).getWorldPosition(new T.Vector3());
  function part(geometry,color,bone,blend=null){
    const g=geometry.index?geometry.toNonIndexed():geometry;
    const n=g.attributes.position.count,colors=[],weights=[],indices=[];
    const c=new T.Color(color),v=new T.Vector3();
    for(let i=0;i<n;i++){
      v.fromBufferAttribute(g.attributes.position,i);let w=0;
      if(blend){
        const along=v.clone().sub(blend.a).dot(blend.axis)/blend.length;
        w=T.MathUtils.smoothstep(along,.72,1)*.7;
      }
      colors.push(c.r,c.g,c.b);indices.push(index.get(bone),blend?index.get(blend.bone):0,0,0);weights.push(1-w,w,0,0);
    }
    g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    g.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));
    g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
    g.deleteAttribute('uv');parts.push(g);
    if(g!==geometry)geometry.dispose();
  }
  function ellipsoid(center,radii,color,bone,detail=12){
    const g=new T.SphereGeometry(1,detail,8);g.scale(...radii);g.translate(...center);part(g,color,bone);
  }
  function segment(a,b,ra,rb,color,bone,endBone=null){
    a=new T.Vector3(...a);b=new T.Vector3(...b);
    const length=a.distanceTo(b),axis=b.clone().sub(a).normalize();
    const g=new T.CylinderGeometry(rb,ra,length,10,5);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),axis));
    g.translate(...a.clone().add(b).multiplyScalar(.5).toArray());
    part(g,color,bone,endBone?{a,axis,length,bone:endBone}:null);
  }
  const skin='#d98652',red='#bd3028',hair='#30241f',dark='#292321';
  ellipsoid([0,65,0],[14,11,10],skin,'Hips');
  segment([0,65,0],[0,88,0],11,16,skin,'Spine','Spine2');
  ellipsoid([0,94,0],[6,12,6],skin,'Neck');
  ellipsoid([0,123,0],[34,31,28],skin,'Head',20);
  for(const sign of [-1,1]){
    ellipsoid([sign*33,119,0],[5,8,4],skin,'Head');
    ellipsoid([sign*12,124,25],[8,3,2.5],'#f5e4bf','Head');
    ellipsoid([sign*11,124,27],[3.4,3,1.4],dark,'Head');
    const brow=new T.BoxGeometry(18,3,2);brow.rotateZ(sign*-.15);brow.translate(sign*12,130,25);part(brow,dark,'Head');
    const cheek=new T.BoxGeometry(21,4,1.5);cheek.translate(sign*13,116,25);part(cheek,dark,'Head');
  }
  ellipsoid([0,120,28],[3.5,3,3],skin,'Head');
  const mouth=new T.BoxGeometry(10,.9,1);mouth.translate(0,109,25);part(mouth,'#743a2c','Head');
  const cap=new T.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI*.49);cap.scale(36,34,30);cap.translate(0,123,0);part(cap,hair,'Head');
  for(let i=-3;i<=3;i++){
    const fringe=new T.BoxGeometry(9,14,5);fringe.rotateZ(i*.05);fringe.translate(i*8,135+Math.abs(i)*.6,24-Math.abs(i));part(fringe,hair,'Head');
  }
  const band=new T.TorusGeometry(28,2.8,6,28);band.rotateX(Math.PI/2);band.scale(1.12,1,.98);band.translate(0,121,0);part(band,red,'Head');
  const feather=new T.SphereGeometry(1,8,8);feather.scale(7,23,1.8);feather.rotateZ(-.4);feather.translate(22,163,-2);part(feather,'#1479a7','Head');
  const featherBase=new T.SphereGeometry(1,8,6);featherBase.scale(6,9,2);featherBase.rotateZ(-.4);featherBase.translate(17,149,-2);part(featherBase,'#eac37a','Head');
  const wrap=new T.CylinderGeometry(15,16,17,14);wrap.translate(0,60,0);part(wrap,red,'Hips');
  const flap=new T.BoxGeometry(20,19,2);flap.translate(0,48,13);part(flap,red,'Hips');
  for(const side of ['Left','Right']){
    for(const [a,b,ra,rb]of [[side+'Arm',side+'ForeArm',7.6,6],[side+'ForeArm',side+'Hand',6,4.5],
      [side+'UpLeg',side+'Leg',9.5,7.5],[side+'Leg',side+'Foot',7.5,5.5]]){
      segment(pos(a).toArray(),pos(b).toArray(),ra,rb,skin,a,b);
      ellipsoid(pos(a).toArray(),[ra,ra,ra],skin,a);
    }
    const hand=pos(side+'Hand');ellipsoid(hand.toArray(),[7,3.5,6],skin,side+'Hand');
    const foot=pos(side+'Foot').add(new T.Vector3(0,0,5));ellipsoid(foot.toArray(),[8,5,13],skin,side+'Foot');
    for(const digit of ['Thumb','Index','Middle','Ring','Pinky'])for(let joint=1;joint<4;joint++){
      const a=side+'Hand'+digit+joint,b=side+'Hand'+digit+(joint+1);
      segment(pos(a).toArray(),pos(b).toArray(),1.5,1.15,skin,a,b);
    }
  }
  // Stowed technical equipment follows the chest. The Canvas equipment remains V1.
  segment([12,65,-16],[12,99,-16],7,8,'#b47a40','Spine2');
  for(let i=0;i<3;i++){
    const x=8+i*4;segment([x,90,-16],[x,119+i%2*4,-16],.8,.8,'#dfb275','Spine2');
    ellipsoid([x,113+i%2*4,-16],[2,5,1],'#1479a7','Spine2');
  }
  const bow=[];for(let i=0;i<=16;i++)bow.push([-18+Math.sin(i/16*Math.PI)*16,43+i/16*82,-19]);
  for(let i=0;i<16;i++)segment(bow[i],bow[i+1],1.5,1.5,'#dfb275','Spine2');
  segment(bow[0],bow[16],.45,.45,'#dbc28a','Spine2');
  const geometry=mergeGeometries(parts,false);for(const g of parts)g.dispose();
  const mesh=new T.SkinnedMesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:.9,flatShading:true}));
  mesh.name='Aruan proxy técnico skinned';root.add(mesh);root.updateMatrixWorld(true);mesh.bind(skeleton);
  root.userData.profile=aruanProfile;root.userData.technicalProxy=true;
  return root;
}
