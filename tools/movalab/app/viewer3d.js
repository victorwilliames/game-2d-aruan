/**
 * MovaLab Preview 3D — Three.js isolated from the Aruan Canvas 2D game.
 * Uses the original FBXLoader and AnimationMixer instead of an improvised Euler skeleton.
 */
import * as THREE from 'three';
import {CompatibleFBXLoader} from './fbx-loader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {captureRest,restoreRest,HumanoidRetarget,normalize} from './humanoid.js';
import {createAruanProxy} from './aruan-proxy.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const BG = 0x1c2023;
const meshCount = root => {
  let meshes=0, skinned=0;
  root?.traverse(o=>{if(o.isMesh){meshes++;if(o.isSkinnedMesh)skinned++;}});
  return {meshes,skinned};
};
function dispose(root) {
  if(!root) return;
  const released=new Set();
  const release=value=>{if(value&&!released.has(value)){released.add(value);value.dispose?.();}};
  root.traverse(o=>{
    if(o.isMesh||o.isLine){
      release(o.geometry);release(o.skeleton);
      const materials=Array.isArray(o.material)?o.material:[o.material];
      for(const m of materials)if(m){for(const v of Object.values(m))if(v?.isTexture){
        const url=v.source?.data?.src;if(url?.startsWith('blob:'))URL.revokeObjectURL(url);release(v);
      }release(m);}
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
    this.stageGroup=new THREE.Group();this.scene.add(this.stageGroup);
    this.placement={yaw:0,x:0,z:0};
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
    this.ground=ground;this.scene.add(ground);
    const ambient=new THREE.HemisphereLight(0xdbe5ff,0x2a3432,2.0);this.scene.add(ambient);
    const key=new THREE.DirectionalLight(0xfff3e4,3.2);
    key.position.set(-150,300,200);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);
    key.shadow.camera.left=-320;key.shadow.camera.right=320;
    key.shadow.camera.top=320;key.shadow.camera.bottom=-320;
    key.shadow.bias=-.00015;this.scene.add(key);
    this.scene.add(new THREE.AmbientLight(0xffffff,.25));
    this.loader=new CompatibleFBXLoader();
    this.motion=null;this.character=null;this.active=null;this.helper=null;this.mixer=null;
    this.mode='mesh';this.duration=0;this.position=0;this.motionRequest=0;this.characterRequest=0;this.retarget=null;this.loop=true;this.inPlace=false;this.orientation=0;this.wireframe=false;
    this.onResize=()=>this.resize();
    this.resizeObserver=new ResizeObserver(this.onResize);
    this.resizeObserver.observe(host);
    this.resize();
    this.dirty=true;
    this.animate();
  }
  resize(){
    const w=Math.max(1,this.host.clientWidth),h=Math.max(1,this.host.clientHeight);
    this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h,false);
    this.dirty=true;
  }
  load(url,format=null){
    return new Promise((resolve,reject)=>{
      const fail=e=>reject(e instanceof Error?e:new Error(String(e)));
      if(format==='glb'||url.includes('.glb')||url.includes('/api/legacy/assets/')){
        new GLTFLoader().load(url,data=>{
          const model=data.scene;model.animations=data.animations;
          // glTF2 uses meters; the MovaLab/FBX/Canvas comparison uses centimeters.
          model.scale.multiplyScalar(100);model.updateMatrixWorld(true);model.userData.sourceUnits='meters';resolve(model);
        },undefined,fail);
      }else this.loader.load(url,resolve,undefined,fail);
    });
  }
  async loadMotion(url,format=null){
    const requested=++this.motionRequest;
    this.onWarning('');
    const model=await this.load(url,format);
    if(requested!==this.motionRequest){dispose(model);return null;}
    if(!model.animations.length){
      dispose(model);throw new Error('Este arquivo não contém animação. Escolha um clipe em Animações.');
    }
    captureRest(model);
    const old=this.motion;
    this.motion=model;
    this.duration=model.animations[0].duration||0;
    this.position=0;
    await this.attach();
    if(old && old!==this.active)dispose(old);
    return {duration:this.duration,...meshCount(model),tracks:model.animations[0].tracks.length};
  }
  async loadCharacter(url){
    const request=++this.characterRequest;
    const model=url==='aruan-proxy'?createAruanProxy():url?await this.load(url):null;
    if(request!==this.characterRequest){dispose(model);return null;}
    if(model)captureRest(model);
    const old=this.character;
    this.character=model;
    await this.attach();
    if(old&&old!==this.active)dispose(old);
    return model?meshCount(model):null;
  }
  async attach() {
    if(this.mixer){const root=this.mixer.getRoot();this.mixer.stopAllAction();this.mixer.uncacheRoot(root);this.mixer=null;}
    if(this.helper){this.scene.remove(this.helper);this.helper.geometry?.dispose();this.helper.material?.dispose();this.helper=null;}
    if(this.active){this.stageGroup.remove(this.active);this.active=null;}
    this.stageGroup.position.set(0,0,0);this.stageGroup.rotation.set(0,0,0);this.stageGroup.updateMatrixWorld(true);
    if(!this.motion&&!this.character)return;
    const source=this.motion;
    const clip=source?.animations[0];
    let model=this.character||source;
    let play=clip,warning='';
    this.retarget=null;
    this._sampled=false;
    if(model)restoreRest(captureRest(model));
    if(source&&model!==source&&clip){
      try{
        this.retarget=new HumanoidRetarget(source,model);
        const report=this.retarget.report;
        warning='Retarget humanoide '+report.status+': '+report.mapped+' ossos mapeados. '+
          (report.missingFingers.length?report.missingFingers.length+' canais de dedos sem destino. ':'')+
          'Proporções e pose neutra do destino preservadas; confira contatos e ombros.';
      }catch(e){
        warning=e.message+'. A prévia mantém a animação original.';
        model=source;
      }
    }
    this.active=model;this.stageGroup.add(model);
    model.traverse(o=>{
      if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
        if(o.material?.isMeshPhongMaterial){o.material.shininess=20;}
      }
    });
    this.helper=skeletonFrom(model);this.scene.add(this.helper);
    this.modeSet(this.mode);
    if(play&&play.tracks.length){
      this.mixer=new THREE.AnimationMixer(this.retarget?source:model);
      const action=this.mixer.clipAction(play);
      this.action=action;
      action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;
      action.play();
      this.mixer.setTime(this.position);
    }
    this.setTime(this.position);
    this.frameCamera();
    this.onWarning(warning);
    const counts=meshCount(model);
    this.onInfo({
      ...counts,bones:captureRest(model).bones.length, duration:this.duration,renderType:counts.meshes?'malha 3D original':'esqueleto FBX',
      mapped:Boolean(this.retarget),compatibility:this.retarget?.report||null
    });
  }
  modeSet(mode){
    this.mode=mode;
    this.dirty=true;
    if(!this.active)return;
    const hasMesh=meshCount(this.active).meshes>0;
    this.active.traverse(o=>{if(o.isMesh){o.visible=mode!=='skeleton';for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)m.wireframe=this.wireframe;}});
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
    this.dirty=true;
  }
  setTime(seconds){
    if(this._sampled&&seconds===this.position)return;
    this._sampled=true;this.dirty=true;
    this.stageGroup.position.set(0,0,0);this.stageGroup.rotation.set(0,0,0);this.stageGroup.updateMatrixWorld(true);
    this.position=Math.max(0,Math.min(this.duration,Number(seconds)||0));
    if(this.mixer){
      this.action.paused=false;this.action.enabled=true;
      this.mixer.setTime(this.position);
      this.motion?.updateMatrixWorld(true);
      this.retarget?.apply();
    }
    if(this.active){
      const rest=captureRest(this.active);
      const hip=rest.byName.get('hips');
      if(this.inPlace&&hip){
        const p=hip.bone.getWorldPosition(new THREE.Vector3());
        p.x=hip.position.x;p.z=hip.position.z;
        hip.bone.position.copy(hip.bone.parent.worldToLocal(p));
      }
      this.active.updateMatrixWorld(true);
    }
    this.stageGroup.rotation.y=this.placement.yaw*Math.PI/180;
    this.stageGroup.position.set(this.placement.x,0,this.placement.z);
    this.stageGroup.updateMatrixWorld(true);
  }
  setPlacement(placement){Object.assign(this.placement,placement);this._sampled=false;this.setTime(this.position);}
  setLoop(enabled){this.loop=Boolean(enabled);}
  setInPlace(enabled){this.inPlace=Boolean(enabled);this._sampled=false;this.setTime(this.position);}
  setWireframe(enabled){this.wireframe=Boolean(enabled);this.modeSet(this.mode);}
  cameraView(view){
    const target=this.controls.target,dist=this.camera.position.distanceTo(target);
    const offset=view==='front'?[0,.15,1]:view==='side'?[1,.15,0]:[0,.15,-1];
    this.camera.position.copy(target).add(new THREE.Vector3(...offset).normalize().multiplyScalar(dist));
    this.controls.update();
    this.dirty=true;
  }
  animate(){
    if(!this.renderer)return;
    this._raf=requestAnimationFrame(()=>this.animate());
    if(this.controls.update())this.dirty=true;
    if(this.dirty){this.renderer.render(this.scene,this.camera);this.dirty=false;}
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
