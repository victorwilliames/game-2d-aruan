/**
 * MovaLab 2.0 Studio — High-Performance Three.js Viewport
 * Complete auto-rigging, interactive skeleton editing, skin weights,
 * and animation player matching Mesh2Motion workflow.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { CompatibleFBXLoader } from './fbx-loader.js';
import { captureRest, restoreRest, HumanoidRetarget, normalize } from './humanoid.js';
import { createAruanProxy } from './aruan-proxy.js';
import { humanoidArchetypes } from './aruan-profile.js';
import { calibrateDestinationBind } from './humanoid-calibration.js';

// Ported core skinning & rigging modules
import { SkinningPipeline } from './skinning/skinning-pipeline.js';
import { RigTemplateService } from './skinning/rig-templates.js';
import { UndoRedoSystem } from './skinning/undo-redo.js';
import { IndependentBoneMovement } from './skinning/independent-movement.js';
import { MeshDragBonePlacement } from './skinning/mesh-drag-placement.js';
import { MixamoExportService } from './skinning/mixamo-export.js';

const BG = 0x14232e;

function meshCount(root) {
  let meshes = 0, skinned = 0, vertices = 0, triangles = 0;
  root?.traverse(o => {
    if (o.isMesh) {
      meshes++;
      if (o.isSkinnedMesh) skinned++;
      if (o.geometry) {
        const pos = o.geometry.attributes.position;
        if (pos) vertices += pos.count;
        if (o.geometry.index) triangles += o.geometry.index.count / 3;
        else if (pos) triangles += pos.count / 3;
      }
    }
  });
  return { meshes, skinned, vertices, triangles: Math.round(triangles) };
}

function disposeObject(root) {
  if (!root) return;
  const released = new Set();
  const release = value => {
    if (value && !released.has(value)) {
      released.add(value);
      value.dispose?.();
    }
  };
  root.traverse(o => {
    if (o.isMesh || o.isLine) {
      release(o.geometry);
      release(o.skeleton);
      const materials = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of materials) {
        if (m) {
          for (const v of Object.values(m)) {
            if (v?.isTexture) {
              const url = v.source?.data?.src;
              if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
              release(v);
            }
          }
          release(m);
        }
      }
    }
  });
}

export class MovaViewer {
  constructor(host, { onWarning = () => {}, onInfo = () => {}, onBoneSelect = () => {}, onTimeUpdate = () => {} } = {}) {
    this.host = host;
    this.onWarning = onWarning;
    this.onInfo = onInfo;
    this.onBoneSelect = onBoneSelect;
    this.onTimeUpdate = onTimeUpdate;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BG);
    this.stageGroup = new THREE.Group();
    this.scene.add(this.stageGroup);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
    this.camera.position.set(160, 140, 240);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.domElement.className = 'movalab-webgl-canvas';
    host.append(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 1400;
    this.controls.maxPolarAngle = Math.PI * 0.55;

    // Floor grid & shadow receiver
    this.grid = new THREE.GridHelper(500, 25, 0x38bdf8, 0x1e3a5f);
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.35;
    this.scene.add(this.grid);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.ShadowMaterial({ opacity: 0.28 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.1;
    this.ground = ground;
    this.scene.add(ground);

    // Studio Lighting
    const ambient = new THREE.HemisphereLight(0xdbeafe, 0x111827, 2.2);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    keyLight.position.set(-160, 320, 220);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0001;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    fillLight.position.set(160, 180, -180);
    this.scene.add(fillLight);

    // Interactive Transform Controls (for bone manipulation)
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.size = 0.75;
    this.transformControls.space = 'local';
    this.transformControls.addEventListener('dragging-changed', event => {
      this.controls.enabled = !event.value;
    });
    this.transformControls.addEventListener('mouseDown', () => {
      if (this.templateSkeleton) {
        this.undoRedo.snapshot(this.templateSkeleton);
      }
    });
    this.transformControls.addEventListener('objectChange', () => {
      this.onGizmoChange();
    });
    this.scene.add(this.transformControls.getHelper());

    // Undo/Redo System
    this.undoRedo = new UndoRedoSystem(30);

    // Interactive Guide Planes (Head & Arms)
    this.initGuidePlanes();

    // Raycasting for bone selection & mesh volume placement
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.renderer.domElement.addEventListener('pointerdown', e => this.onPointerDown(e));

    // Internal state
    this.character = null;
    this.characterMesh = null;
    this.templateSkeleton = null;
    this.skeletonHelper = null;
    this.selectedBone = null;
    this.boneHandles = new THREE.Group();
    this.scene.add(this.boneHandles);

    this.motion = null;
    this.mixer = null;
    this.action = null;
    this.duration = 0;
    this.position = 0;
    this.playing = false;
    this.loop = true;
    this.speed = 1.0;
    this.inPlace = false;
    this.wireframe = false;
    this.displayMode = 'textured'; // 'textured', 'weights', 'xray'
    this.weightsData = null;

    // Rigging Settings
    this.positioningMode = 'volume'; // 'volume' or 'gizmo'
    this.independentChildren = false; // preserve children world pos
    this.mirrorSkeleton = true;

    // Resize observer
    this.onResize = () => this.resize();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(host);
    this.resize();

    this.dirty = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }

  initGuidePlanes() {
    // Head plane (cyan translucent)
    const headGeo = new THREE.PlaneGeometry(160, 160);
    const headMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.headPlane = new THREE.Mesh(headGeo, headMat);
    this.headPlane.rotation.x = -Math.PI / 2;
    this.headPlane.position.y = 80;
    this.headPlane.visible = false;
    this.scene.add(this.headPlane);

    // Arm planes (orange translucent)
    const armGeo = new THREE.PlaneGeometry(160, 160);
    const armMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.armPlaneL = new THREE.Mesh(armGeo, armMat);
    this.armPlaneL.rotation.y = Math.PI / 2;
    this.armPlaneL.position.x = 22;
    this.armPlaneL.position.y = 70;
    this.armPlaneL.visible = false;
    this.scene.add(this.armPlaneL);

    this.armPlaneR = new THREE.Mesh(armGeo, armMat.clone());
    this.armPlaneR.rotation.y = Math.PI / 2;
    this.armPlaneR.position.x = -22;
    this.armPlaneR.position.y = 70;
    this.armPlaneR.visible = false;
    this.scene.add(this.armPlaneR);
  }

  resize() {
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.dirty = true;
  }

  // =========================================================================
  // MODEL LOADING & MANIPULATION (Step 1)
  // =========================================================================

  async loadModelFromUrl(url) {
    this.clearCharacter();
    let model;

    if (url.startsWith('aruan-proxy:')) {
      const profile = humanoidArchetypes[url.slice('aruan-proxy:'.length)];
      if (!profile) throw Error('Perfil procedural não cadastrado');
      model = createAruanProxy(profile);
    } else if (url === 'aruan-proxy') {
      model = createAruanProxy();
    } else if (url.endsWith('.glb') || url.includes('.glb')) {
      const gltf = await new Promise((resolve, reject) => {
        new GLTFLoader().load(url, resolve, undefined, reject);
      });
      model = gltf.scene;
      // glTF default meters -> cm for studio
      if (model.scale.x === 1) {
        model.scale.set(100, 100, 100);
      }
    } else {
      model = await new Promise((resolve, reject) => {
        new CompatibleFBXLoader().load(url, resolve, undefined, reject);
      });
    }

    this.setCharacterModel(model);
    return this.analyzeModel();
  }

  async loadModelFromFile(file) {
    this.clearCharacter();
    const ext = file.name.split('.').pop().toLowerCase();
    const url = URL.createObjectURL(file);

    try {
      let model;
      if (ext === 'glb' || ext === 'gltf') {
        const gltf = await new Promise((resolve, reject) => {
          new GLTFLoader().load(url, resolve, undefined, reject);
        });
        model = gltf.scene;
        if (model.scale.x === 1) model.scale.set(100, 100, 100);
      } else {
        model = await new Promise((resolve, reject) => {
          new CompatibleFBXLoader().load(url, resolve, undefined, reject);
        });
      }
      this.setCharacterModel(model);
      return this.analyzeModel();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  setCharacterModel(model) {
    this.character = model;
    this.stageGroup.add(model);

    // Find main mesh for auto-rigging & skinning
    this.characterMesh = null;
    model.traverse(o => {
      if (o.isMesh && !this.characterMesh) {
        this.characterMesh = o;
      }
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
      }
    });

    this.alignModelToFloor();
    this.frameCamera();
    this.dirty = true;
  }

  clearCharacter() {
    this.detachGizmo();
    if (this.character) {
      this.stageGroup.remove(this.character);
      disposeObject(this.character);
      this.character = null;
      this.characterMesh = null;
    }
    this.clearTemplateSkeleton();
  }

  rotateModel(axis, angleDeg = 90) {
    if (!this.character) return;
    const rad = (angleDeg * Math.PI) / 180;
    if (axis === 'x') this.character.rotation.x += rad;
    if (axis === 'y') this.character.rotation.y += rad;
    if (axis === 'z') this.character.rotation.z += rad;
    this.character.updateMatrixWorld(true);
    this.dirty = true;
  }

  alignModelToFloor() {
    if (!this.character) return;
    this.character.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.character);
    if (!box.isEmpty()) {
      const center = box.getCenter(new THREE.Vector3());
      this.character.position.x -= center.x;
      this.character.position.z -= center.z;
      this.character.position.y -= box.min.y;
      this.character.updateMatrixWorld(true);
    }
    this.dirty = true;
  }

  resetModelPosition() {
    if (!this.character) return;
    this.character.position.set(0, 0, 0);
    this.character.rotation.set(0, 0, 0);
    this.character.updateMatrixWorld(true);
    this.dirty = true;
  }

  analyzeModel() {
    if (!this.character) return null;
    const stats = meshCount(this.character);
    const box = new THREE.Box3().setFromObject(this.character);
    const size = box.getSize(new THREE.Vector3());

    let existingBones = 0;
    this.character.traverse(o => {
      if (o.isBone) existingBones++;
    });

    return {
      ...stats,
      existingBones,
      hasRig: existingBones > 0 || stats.skinned > 0,
      width: Math.round(size.x),
      height: Math.round(size.y),
      depth: Math.round(size.z)
    };
  }

  // =========================================================================
  // SKELETON TEMPLATE & AUTO-FIT (Step 2)
  // =========================================================================

  async loadSkeletonTemplate(templateUrl, handOption = 'all-fingers') {
    this.clearTemplateSkeleton();

    const res = await RigTemplateService.loadTemplate(templateUrl);
    const skeleton = res.skeleton || res;
    const root = res.root || skeleton.bones[0];

    if (handOption !== 'all-fingers') {
      RigTemplateService.filterHandBones(skeleton, handOption);
    }

    this.templateSkeleton = skeleton;
    this.templateSkeletonRoot = root;
    this.stageGroup.add(root);
    root.updateWorldMatrix(true, true);

    // Create SkeletonHelper
    this.skeletonHelper = new THREE.SkeletonHelper(root);
    this.skeletonHelper.material.depthTest = false;
    this.skeletonHelper.material.depthWrite = false;
    this.skeletonHelper.material.transparent = true;
    this.skeletonHelper.material.opacity = 0.95;
    this.skeletonHelper.material.color.set(0x38bdf8);
    this.skeletonHelper.renderOrder = 999;
    this.skeletonHelper.visible = true;
    this.scene.add(this.skeletonHelper);

    // Build interactive handle pickers for each bone
    this.buildBoneHandles();

    // Auto-fit bounds to mesh
    if (this.characterMesh) {
      this.autoFitSkeleton();
    }

    this.undoRedo.snapshot(this.templateSkeleton);
    this.dirty = true;
    return skeleton;
  }

  autoFitSkeleton() {
    if (!this.templateSkeleton || !this.characterMesh) return;
    const root = this.templateSkeletonRoot || this.templateSkeleton.bones[0];
    const fitResult = RigTemplateService.autoFitSkeletonToMesh(root, this.characterMesh);
    root.updateWorldMatrix(true, true);
    this.updateBoneHandles();
    this.undoRedo.snapshot(this.templateSkeleton);
    this.dirty = true;
    return fitResult;
  }

  scaleSkeleton(scale) {
    if (!this.templateSkeleton) return;
    const root = this.templateSkeletonRoot || this.templateSkeleton.bones[0];
    root.scale.set(scale, scale, scale);
    root.updateWorldMatrix(true, true);
    this.updateBoneHandles();
    this.dirty = true;
  }

  clearTemplateSkeleton() {
    this.detachGizmo();
    if (this.skeletonHelper) {
      this.scene.remove(this.skeletonHelper);
      this.skeletonHelper.geometry?.dispose();
      this.skeletonHelper = null;
    }
    if (this.templateSkeleton) {
      const root = this.templateSkeletonRoot || this.templateSkeleton.bones[0];
      if (root) {
        this.stageGroup.remove(root);
        disposeObject(root);
      }
      this.templateSkeleton = null;
      this.templateSkeletonRoot = null;
    }
    this.boneHandles.clear();
    this.selectedBone = null;
  }

  // =========================================================================
  // INTERACTIVE BONE EDITING & GIZMO (Step 3)
  // =========================================================================

  buildBoneHandles() {
    this.boneHandles.clear();
    if (!this.templateSkeleton) return;

    const geo = new THREE.SphereGeometry(2.2, 12, 12);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false
    });

    for (const bone of this.templateSkeleton.bones) {
      const handle = new THREE.Mesh(geo.clone(), mat.clone());
      handle.renderOrder = 1000;
      handle.userData.bone = bone;
      handle.name = 'handle_' + bone.name;
      this.boneHandles.add(handle);
    }
    this.boneHandles.visible = true;
    this.updateBoneHandles();
  }

  updateBoneHandles() {
    if (this.templateSkeletonRoot) {
      this.templateSkeletonRoot.updateWorldMatrix(true, true);
    }
    for (const handle of this.boneHandles.children) {
      const bone = handle.userData.bone;
      if (bone) {
        handle.position.copy(bone.getWorldPosition(new THREE.Vector3()));
        if (bone === this.selectedBone) {
          handle.material.color.set(0xaf3abe);
          handle.scale.set(1.5, 1.5, 1.5);
        } else {
          handle.material.color.set(0x38bdf8);
          handle.scale.set(1.0, 1.0, 1.0);
        }
      }
    }
    if (this.skeletonHelper) {
      this.skeletonHelper.updateMatrixWorld(true);
    }
    this.dirty = true;
  }

  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check if clicking on bone handles
    const handleHits = this.raycaster.intersectObjects(this.boneHandles.children, false);
    if (handleHits.length > 0) {
      const hitBone = handleHits[0].object.userData.bone;
      if (hitBone) {
        this.selectBone(hitBone);
        return;
      }
    }

    // 2. If in Volume Placement mode and clicking on mesh with a selected bone
    if (this.positioningMode === 'volume' && this.selectedBone && this.characterMesh) {
      const meshHits = this.raycaster.intersectObject(this.characterMesh, false);
      if (meshHits.length > 0) {
        this.undoRedo.snapshot(this.templateSkeleton);
        MeshDragBonePlacement.placeBoneInsideMesh(this.raycaster, this.characterMesh, this.selectedBone, this.camera);

        if (this.mirrorSkeleton) {
          IndependentBoneMovement.mirrorBoneTransform(this.selectedBone, this.templateSkeleton, true);
        }

        this.updateBoneHandles();
      }
    }
  }

  selectBone(bone) {
    this.selectedBone = bone;
    if (this.positioningMode === 'gizmo' && bone) {
      this.transformControls.attach(bone);
    } else {
      this.transformControls.detach();
    }
    this.updateBoneHandles();
    this.onBoneSelect(bone ? bone.name : null);
  }

  detachGizmo() {
    this.transformControls.detach();
  }

  onGizmoChange() {
    if (!this.selectedBone || !this.templateSkeleton) return;

    if (this.mirrorSkeleton) {
      IndependentBoneMovement.mirrorBoneTransform(this.selectedBone, this.templateSkeleton, this.transformControls.mode === 'translate');
    }

    this.updateBoneHandles();
  }

  undo() {
    if (this.templateSkeleton && this.undoRedo.canUndo()) {
      this.undoRedo.undo(this.templateSkeleton);
      this.updateBoneHandles();
      return true;
    }
    return false;
  }

  redo() {
    if (this.templateSkeleton && this.undoRedo.canRedo()) {
      this.undoRedo.redo(this.templateSkeleton);
      this.updateBoneHandles();
      return true;
    }
    return false;
  }

  // =========================================================================
  // SKINNING & BIND POSE (Step 3 -> 4)
  // =========================================================================

  applySkinning(options = {}) {
    if (!this.characterMesh || !this.templateSkeleton) {
      throw new Error('Malha ou esqueleto ausente para calcular pesos de skin.');
    }

    // 1. Compute skin weights using ported algorithm
    this.weightsData = SkinningPipeline.computeSkinWeights(this.characterMesh, this.templateSkeleton, options);

    // 2. Bind skeleton to mesh (creates functional SkinnedMesh)
    const skinnedMesh = SkinningPipeline.bindSkeletonToMesh(this.characterMesh, this.templateSkeleton, this.weightsData);

    // Replace original mesh in scene
    this.character.remove(this.characterMesh);
    disposeObject(this.characterMesh);
    this.characterMesh = skinnedMesh;
    this.character.add(skinnedMesh);

    // Hide handles and gizmo after skinning
    this.detachGizmo();
    this.boneHandles.visible = false;
    if (this.skeletonHelper) this.skeletonHelper.visible = false;

    this.dirty = true;
    return {
      vertices: this.weightsData.positions.length / 3,
      bones: this.templateSkeleton.bones.length,
      influencesPerVertex: 4
    };
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    if (!this.characterMesh) return;

    if (mode === 'skeleton') {
      this.characterMesh.visible = false;
      if (this.skeletonHelper) this.skeletonHelper.visible = true;
      this.boneHandles.visible = true;
    } else if (mode === 'mesh') {
      this.characterMesh.visible = true;
      if (this.characterMesh.material) {
        this.characterMesh.material.vertexColors = false;
        this.characterMesh.material.transparent = false;
        this.characterMesh.material.opacity = 1.0;
        this.characterMesh.material.wireframe = this.wireframe;
        this.characterMesh.material.needsUpdate = true;
      }
      if (this.skeletonHelper) this.skeletonHelper.visible = false;
      this.boneHandles.visible = false;
    } else if (mode === 'both') {
      this.characterMesh.visible = true;
      if (this.characterMesh.material) {
        this.characterMesh.material.vertexColors = false;
        this.characterMesh.material.transparent = false;
        this.characterMesh.material.opacity = 1.0;
        this.characterMesh.material.wireframe = this.wireframe;
        this.characterMesh.material.needsUpdate = true;
      }
      if (this.skeletonHelper) this.skeletonHelper.visible = true;
      this.boneHandles.visible = true;
    } else if (mode === 'weights' && this.weightsData && this.selectedBone) {
      this.characterMesh.visible = true;
      const boneIndex = this.templateSkeleton?.bones.indexOf(this.selectedBone) ?? 0;
      SkinningPipeline.applyHeatmapColors(this.characterMesh.geometry, Math.max(0, boneIndex), this.weightsData);
      if (this.characterMesh.material) {
        this.characterMesh.material.vertexColors = true;
        this.characterMesh.material.needsUpdate = true;
      }
      if (this.skeletonHelper) this.skeletonHelper.visible = true;
      this.boneHandles.visible = true;
    } else if (mode === 'xray') {
      this.characterMesh.visible = true;
      if (this.characterMesh.material) {
        this.characterMesh.material.vertexColors = false;
        this.characterMesh.material.transparent = true;
        this.characterMesh.material.opacity = 0.45;
        this.characterMesh.material.wireframe = this.wireframe;
        this.characterMesh.material.needsUpdate = true;
      }
      if (this.skeletonHelper) this.skeletonHelper.visible = true;
      this.boneHandles.visible = true;
    }

    this.dirty = true;
  }

  setHeadCorrectionPlane(enabled, heightY) {
    this.headPlane.visible = Boolean(enabled);
    if (heightY !== undefined) {
      this.headPlane.position.y = heightY * 100; // cm scale
    }
    this.dirty = true;
  }

  setArmCorrectionPlane(enabled, offset) {
    this.armPlaneL.visible = Boolean(enabled);
    this.armPlaneR.visible = Boolean(enabled);
    if (offset !== undefined) {
      this.armPlaneL.position.x = 22 + offset * 100;
      this.armPlaneR.position.x = -22 - offset * 100;
    }
    this.dirty = true;
  }

  // =========================================================================
  // ANIMATION PLAYBACK (Step 4)
  // =========================================================================

  async loadMotion(url, format = null) {
    let model;
    if (url.endsWith('.glb') || url.includes('.glb')) {
      const gltf = await new Promise((resolve, reject) => {
        new GLTFLoader().load(url, resolve, undefined, reject);
      });
      model = gltf.scene;
      model.animations = gltf.animations;
      if (model.scale.x === 1) model.scale.set(100, 100, 100);
    } else {
      model = await new Promise((resolve, reject) => {
        new CompatibleFBXLoader().load(url, resolve, undefined, reject);
      });
    }

    if (!model.animations || !model.animations.length) {
      disposeObject(model);
      throw new Error('Arquivo não contém dados de animação.');
    }

    if (this.motion) disposeObject(this.motion);
    this.motion = model;
    const clip = model.animations[0];
    this.duration = clip.duration || 0;
    this.position = 0;

    // Attach animation to character or motion model
    this.attachAnimation(clip);
    return { duration: this.duration, tracks: clip.tracks.length };
  }

  attachAnimation(clip) {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.mixer.getRoot());
      this.mixer = null;
    }

    const targetModel = this.character || this.motion;
    if (!targetModel) return;

    this.mixer = new THREE.AnimationMixer(targetModel);
    this.action = this.mixer.clipAction(clip);
    this.action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    this.action.clampWhenFinished = true;
    this.action.play();
    this.setTime(0);
  }

  play() {
    this.playing = true;
    if (this.action) this.action.paused = false;
  }

  pause() {
    this.playing = false;
    if (this.action) this.action.paused = true;
  }

  setTime(seconds) {
    this.position = Math.max(0, Math.min(this.duration, seconds));
    if (this.mixer) {
      this.mixer.setTime(this.position);
    }
    this.onTimeUpdate(this.position, this.duration);
    this.dirty = true;
  }

  setLoop(enabled) {
    this.loop = Boolean(enabled);
    if (this.action) {
      this.action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    }
  }

  setSpeed(speed) {
    this.speed = Math.max(0.1, Math.min(4.0, speed));
    if (this.mixer) this.mixer.timeScale = this.speed;
  }

  setInPlace(enabled) {
    this.inPlace = Boolean(enabled);
    this.dirty = true;
  }

  setWireframe(enabled) {
    this.wireframe = Boolean(enabled);
    if (this.characterMesh?.material) {
      this.characterMesh.material.wireframe = this.wireframe;
      this.characterMesh.material.needsUpdate = true;
    }
    this.dirty = true;
  }

  setGridVisible(visible) {
    this.grid.visible = Boolean(visible);
    this.dirty = true;
  }

  // =========================================================================
  // EXPORT (Step 5)
  // =========================================================================

  async exportGLB() {
    if (!this.characterMesh || !this.templateSkeleton) {
      throw new Error('Nenhum personagem com rig ativo para exportar.');
    }
    const anims = this.motion?.animations || [];
    return MixamoExportService.exportCanonicalMixamoGLB(this.characterMesh, this.templateSkeleton, anims, GLTFExporter);
  }

  exportAruanJSON() {
    if (!this.motion?.animations?.length) {
      throw new Error('Nenhuma animação carregada para exportar em JSON ARUAN.');
    }
    return MixamoExportService.exportAruanClipJSON(this.motion.animations[0], this.templateSkeleton);
  }

  // =========================================================================
  // CAMERA & RENDER LOOP
  // =========================================================================

  frameCamera() {
    const target = this.character || this.motion;
    if (!target) return;

    const box = new THREE.Box3().setFromObject(target);
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const span = Math.max(50, size.y, size.x, size.z);

    this.camera.position.set(center.x + span * 0.9, center.y + span * 0.5, center.z + span * 1.5);
    this.controls.target.copy(center);
    this.controls.update();
    this.dirty = true;
  }

  animate() {
    if (!this.renderer) return;
    this._raf = requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    if (this.playing && this.mixer && this.duration > 0) {
      this.position += dt * this.speed;
      if (this.position > this.duration) {
        if (this.loop) {
          this.position = this.position % this.duration;
        } else {
          this.position = this.duration;
          this.pause();
        }
      }
      this.setTime(this.position);
    }

    if (this.controls.update()) this.dirty = true;

    if (this.dirty) {
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
    }
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    this.resizeObserver.disconnect();
    this.clearCharacter();
    this.controls.dispose();
    this.transformControls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.renderer = null;
  }
}
