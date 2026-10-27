/**
 * MovaLab 2.0 - Rig Templates & Auto-Fit
 * Manages skeleton templates (Mixamo Humanoid 65, Fox, Bird, Dragon, etc.)
 * and automatically scales/aligns the template skeleton to fit character mesh bounds.
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const RIG_TEMPLATES = [
  {
    id: 'human',
    name: 'Humano (Mixamo 65 ossos)',
    rigFile: '/templates/rigs/rig-human.glb',
    referenceModel: '/templates/models/model-human.glb',
    previewImage: '/templates/rigs/reference/human.png',
    positionTrackingBone: 'mixamorigHips',
    isHumanoid: true
  },
  {
    id: 'fox',
    name: 'Raposa / Quadrúpede (Fox)',
    rigFile: '/templates/rigs/rig-fox.glb',
    referenceModel: '/templates/models/model-fox.glb',
    previewImage: '/templates/rigs/reference/fox.png',
    positionTrackingBone: 'hips',
    isHumanoid: false
  },
  {
    id: 'bird',
    name: 'Pássaro (Bird)',
    rigFile: '/templates/rigs/rig-bird.glb',
    referenceModel: '/templates/models/model-bird.glb',
    previewImage: '/templates/rigs/reference/bird.png',
    positionTrackingBone: 'hips',
    isHumanoid: false
  },
  {
    id: 'dragon',
    name: 'Dragão / Criatura Alada (Dragon)',
    rigFile: '/templates/rigs/rig-dragon.glb',
    referenceModel: '/templates/models/model-dragon.glb',
    previewImage: '/templates/rigs/reference/dragon.png',
    positionTrackingBone: 'hips',
    isHumanoid: false
  },
  {
    id: 'kaiju',
    name: 'Monstro / Bípede Gigante (Kaiju)',
    rigFile: '/templates/rigs/rig-kaiju.glb',
    referenceModel: '/templates/models/model-kaiju.glb',
    previewImage: '/templates/rigs/reference/kaiju.png',
    positionTrackingBone: 'hips',
    isHumanoid: false
  },
  {
    id: 'spider',
    name: 'Aranha / Artrópode (Spider)',
    rigFile: '/templates/rigs/rig-spider.glb',
    referenceModel: '/templates/models/model-spider.glb',
    previewImage: '/templates/rigs/reference/spider.png',
    positionTrackingBone: 'hips',
    isHumanoid: false
  }
];

export class RigTemplateService {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  /**
   * Load a rig template by ID or file path.
   * @param {string} templateId - e.g. 'human' or '/templates/rigs/rig-human.glb'
   * @returns {Promise<{skeleton: THREE.Skeleton, root: THREE.Object3D, template: object}>}
   */
  static async loadTemplate(templateId = 'human') {
    if (!RigTemplateService._instance) {
      RigTemplateService._instance = new RigTemplateService();
    }
    return RigTemplateService._instance.loadTemplate(templateId);
  }

  async loadTemplate(templateId = 'human') {
    const template = RIG_TEMPLATES.find(t => t.id === templateId || t.rigFile === templateId) || RIG_TEMPLATES[0];
    let gltf;
    if (this.cache.has(template.rigFile)) {
      gltf = this.cache.get(template.rigFile);
    } else {
      gltf = await this.loader.loadAsync(template.rigFile);
      this.cache.set(template.rigFile, gltf);
    }

    const sceneClone = gltf.scene.clone(true);
    const bones = [];
    sceneClone.traverse(o => {
      if (o.isBone) bones.push(o);
    });

    const skeleton = new THREE.Skeleton(bones);
    return { skeleton, root: sceneClone, template };
  }

  static filterHandBones(skeleton, handOption = 'all-fingers') {
    return RigTemplateService.configureHandBones(skeleton, handOption);
  }

  /**
   * Automatically fit and scale a template skeleton to the bounding box of a character mesh.
   * @param {THREE.Object3D} skeletonRoot
   * @param {THREE.Object3D} mesh
   * @returns {{scale: number, floorOffset: number, bounds: THREE.Box3}}
   */
  static autoFitSkeletonToMesh(skeletonRoot, mesh) {
    mesh.updateWorldMatrix(true, true);
    skeletonRoot.updateWorldMatrix(true, true);

    const meshBox = new THREE.Box3().setFromObject(mesh);
    const skelBox = new THREE.Box3();
    skeletonRoot.traverse(o => {
      if (o.isBone) {
        const p = new THREE.Vector3();
        o.getWorldPosition(p);
        skelBox.expandByPoint(p);
      }
    });

    const meshSize = new THREE.Vector3();
    const skelSize = new THREE.Vector3();
    meshBox.getSize(meshSize);
    skelBox.getSize(skelSize);

    // Compute uniform scale based on Y (height)
    const scaleY = skelSize.y > 0.001 ? meshSize.y / skelSize.y : 1.0;
    skeletonRoot.scale.setScalar(scaleY);
    skeletonRoot.updateWorldMatrix(true, true);

    // Recompute bounds after scaling
    const scaledBox = new THREE.Box3();
    skeletonRoot.traverse(o => {
      if (o.isBone) {
        const p = new THREE.Vector3();
        o.getWorldPosition(p);
        scaledBox.expandByPoint(p);
      }
    });

    const meshCenter = new THREE.Vector3();
    const skelCenter = new THREE.Vector3();
    meshBox.getCenter(meshCenter);
    scaledBox.getCenter(skelCenter);

    // Align center X/Z and floor Y
    skeletonRoot.position.x += (meshCenter.x - skelCenter.x);
    skeletonRoot.position.z += (meshCenter.z - skelCenter.z);
    skeletonRoot.position.y += (meshBox.min.y - scaledBox.min.y);
    skeletonRoot.updateWorldMatrix(true, true);

    return {
      scale: scaleY,
      floorOffset: meshBox.min.y,
      bounds: meshBox
    };
  }

  /**
   * Filter finger bones according to chosen hand configuration.
   * @param {THREE.Skeleton} skeleton
   * @param {string} handOption - 'all-fingers' | 'thumb-and-index' | 'simplified' | 'single-bone'
   */
  static configureHandBones(skeleton, handOption = 'all-fingers') {
    if (handOption === 'all-fingers') return;

    skeleton.bones.forEach(b => {
      const name = b.name.toLowerCase();
      if (!name.includes('hand') && !name.includes('finger') && !name.includes('thumb') && !name.includes('index') && !name.includes('middle') && !name.includes('ring') && !name.includes('pinky')) {
        return;
      }
      if (name.endsWith('hand') || name === 'mixamoriglefthand' || name === 'mixamorigrighthand') {
        return; // Always keep the main hand bone
      }

      if (handOption === 'single-bone') {
        // Remove all fingers
        b.visible = false;
        b.scale.set(0, 0, 0);
      } else if (handOption === 'thumb-and-index') {
        // Keep only thumb and index
        if (!name.includes('thumb') && !name.includes('index')) {
          b.visible = false;
          b.scale.set(0, 0, 0);
        }
      } else if (handOption === 'simplified') {
        // Keep first joint of each finger only
        if (name.includes('2') || name.includes('3') || name.includes('4') || name.includes('end') || name.includes('leaf')) {
          b.visible = false;
          b.scale.set(0, 0, 0);
        }
      }
    });
  }
}
