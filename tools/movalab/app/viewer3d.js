/**
 * MovaLab Preview 3D — Three.js isolated from the Aruan Canvas 2D game.
 * Uses the original FBXLoader and AnimationMixer instead of an improvised Euler skeleton.
 */
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const BG = 0x1c2023;
const normalize = name => String(name || '')
  .replace(/^.*:/, '').replace(/^mixamorig/i, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
const stripTrack = name => {
  const match = /^(.*)\.(position|quaternion|scale|rotation)$/.exec(name);
  return match ? {name:match[1],property:match[2]} : null;
};
const meshCount = root => {
  let meshes=0, skinned=0;
  root?.traverse(o=>{if(o.isMesh){meshes++;if(o.isSkinnedMesh)skinned++;}});
  return {meshes,skinned};
};
function dispose(root) {
  if(!root) return;
  root.traverse(o=>{
    if(o.isMesh||o.isLine){
      o.geometry?.dispose();
      const materials=Array.isArray(o.material)?o.material:[o.material];
      for(const m of materials)if(m){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}
    }
  });
}
function skeletonFrom(root) {
  const helper=new THREE.SkeletonHelper(root);
  helper.material.depthTest=false;
  helper.material.transparent=true;
  helper.material.opacity=.85;
  helper.material.color.set(0xa9e17f);
  helper.visible=false;
  return helper;
}

export class MovaViewer {
  constructor(host,{onWarning=()=>{},onInfo=()=>{}}={}) {
    this.host=host;this.onWarning=onWarning;this.onInfo=onInfo;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(BG);
    this.scene.fog=new THREE.Fog(BG,400,1400);
    this.camera=new THREE.PerspectiveCamera(42,1,.1,5000);
    this.camera.position.set(170,145,255);
    this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.45;
    this.renderer.domElement.className='movalab-webgl-canvas';
    host.append(this.renderer.domElement);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);
    this.controls.enableDamping=true;this.controls.dampingFactor=.08;
    this.controls.minDistance=20;this.controls.maxDistance=1100;
    this.controls.maxPolarAngle=Math.PI*.56;
    this.grid=new THREE.GridHelper(500,20,0x576d69,0x354345);
    this.grid.material.transparent=true;this.grid.material.opacity=.43;
    this.scene.add(this.grid);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.ShadowMaterial({opacity:.26}));
    ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.position.y=-.3;
    this.scene.add(ground);
    const ambient=new THREE.HemisphereLight(0xdbe5ff,0x2a3432,2.0);this.scene.add(ambient);
    const key=new THREE.DirectionalLight(0xfff3e4,3.2);
    key.position.set(-150,300,200);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);
    key.shadow.camera.left=-320;key.shadow.camera.right=320;
    key.shadow.camera.top=320;key.shadow.camera.bottom=-320;
    key.shadow.bias=-.00015;this.scene.add(key);
    this.scene.add(new THREE.AmbientLight(0xffffff,.25));
    this.loader=new FBXLoader();
    this.motion=null;this.character=null;this.active=null;this.helper=null;this.mixer=null;
    this.mode='mesh';this.duration=0;this.position=0;this.request=0;
    this.onResize=()=>this.resize();
    this.resizeObserver=new ResizeObserver(this.onResize);
    this.resizeObserver.observe(host);
    this.resize();
    this.clock=new THREE.Clock();
    this.animate();
  }
  resize(){
    const w=Math.max(1,this.host.clientWidth),h=Math.max(1,this.host.clientHeight);
    this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h,false);
  }
  load(url){
    return new Promise((resolve,reject)=>{
      this.loader.load(url,resolve,undefined,e=>reject(e instanceof Error?e:new Error(String(e))));
    });
  }
  async loadMotion(url){
    const requested=++this.request;
    this.onWarning('');
    const model=await this.load(url);
    if(requested!==this.request){dispose(model);return null;}
    if(!model.animations.length){
      dispose(model);throw new Error('Este arquivo não contém animação. Escolha um clipe em Animações.');
    }
    const old=this.motion;
    this.motion=model;
    this.duration=model.animations[0].duration||0;
    this.position=0;
    await this.attach();
    if(old && old!==this.active)dispose(old);
    return {duration:this.duration,...meshCount(model),tracks:model.animations[0].tracks.length};
  }
  async loadCharacter(url){
    const request=++this.request;
    const model=url?await this.load(url):null;
    if(request!==this.request){dispose(model);return null;}
    const old=this.character;
    this.character=model;
    await this.attach();
    if(old&&old!==this.active)dispose(old);
    return model?meshCount(model):null;
  }
  async attach() {
    if(this.mixer){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.active);this.mixer=null;}
    if(this.helper){this.scene.remove(this.helper);this.helper.geometry?.dispose();this.helper.material?.dispose();this.helper=null;}
    if(this.active){this.scene.remove(this.active);this.active=null;}
    if(!this.motion&&!this.character)return;
    const source=this.motion;
    const clip=source?.animations[0];
    let model=this.character||source;
    let play=clip,warning='';
    if(source&&model!==source&&clip){
      const jointNames=new Map();
      model.traverse(o=>{if(o.isBone)jointNames.set(normalize(o.name),o.name);});
      const tracks=[];
      let okBones=0,missing=[];
      for(const track of clip.tracks){
        const parsed=stripTrack(track.name);
        if(!parsed)continue;
        const renamed=jointNames.get(normalize(parsed.name));
        if(!renamed){missing.push(parsed.name);continue;}
        const clone=track.clone();
        clone.name=renamed+'.'+parsed.property;
        tracks.push(clone);okBones++;
      }
      // Static hierarchy retarget only for similar Mixamo rigs. Never claim universal retargeting.
      if(okBones<Math.max(5,clip.tracks.length*.55)){
        warning='Esqueletos incompatíveis: a prévia mostra o personagem original. Selecione outro personagem compatível com a animação.';
        model=source;play=clip;
      }else {
        if(missing.length)warning='Mapeamento parcial: '+missing.length+' canais não encontrados neste personagem. Confira os movimentos.';
        play=new THREE.AnimationClip(clip.name,clip.duration,tracks);
      }
    }
    this.active=model;this.scene.add(model);
    model.traverse(o=>{
      if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
        if(o.material?.isMeshPhongMaterial){o.material.shininess=20;}
      }
    });
    this.helper=skeletonFrom(model);this.scene.add(this.helper);
    this.modeSet(this.mode);
    if(play&&play.tracks.length){
      this.mixer=new THREE.AnimationMixer(model);
      const action=this.mixer.clipAction(play);
      action.setLoop(THREE.LoopRepeat,Infinity);
      action.play();
      this.mixer.setTime(this.position);
    }
    this.frameCamera();
    this.onWarning(warning);
    const counts=meshCount(model);
    this.onInfo({
      ...counts, duration:this.duration,renderType:counts.meshes?'malha 3D original':'esqueleto FBX',
      mapped:model===this.character&&Boolean(source&&clip)
    });
  }
  modeSet(mode){
    this.mode=mode;
    if(!this.active)return;
    const hasMesh=meshCount(this.active).meshes>0;
    this.active.traverse(o=>{if(o.isMesh)o.visible=mode!=='skeleton';});
    if(this.helper)this.helper.visible=mode!=='mesh'||!hasMesh;
  }
  frameCamera(){
    if(!this.active)return;
    this.active.updateMatrixWorld(true);
    let box=new THREE.Box3();
    const meshes=[];
    this.active.traverse(o=>{if(o.isMesh&&o.geometry?.attributes?.position)meshes.push(o);});
    if(meshes.length){for(const m of meshes)box.expandByObject(m);}
    else{
      this.active.traverse(o=>{if(o.isBone)box.expandByPoint(o.getWorldPosition(new THREE.Vector3()));});
    }
    if(box.isEmpty())return;
    const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    let span=Math.max(50,size.y,size.x,size.z);
    if(span>9000)span=170;
    this.camera.position.set(center.x+span*.82,center.y+span*.45,center.z+span*1.65);
    this.controls.target.copy(center);
    this.controls.minDistance=span*.26;
    this.controls.maxDistance=span*8;
    this.controls.update();
  }
  setTime(seconds){
    this.position=Math.max(0,Number(seconds)||0);
    if(this.mixer){
      this.mixer.setTime(this.position);
      this.active?.updateMatrixWorld(true);
    }
  }
  animate(){
    if(!this.renderer)return;
    this._raf=requestAnimationFrame(()=>this.animate());
    this.controls.update();
    this.renderer.render(this.scene,this.camera);
  }
  destroy(){
    cancelAnimationFrame(this._raf);
    this.resizeObserver.disconnect();
    if(this.motion)dispose(this.motion);
    if(this.character)dispose(this.character);
    this.controls.dispose();this.renderer.dispose();this.renderer.domElement.remove();
    this.renderer=null;
  }
}
