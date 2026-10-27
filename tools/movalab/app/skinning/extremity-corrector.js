/**
 * MovaLab 2.0 - Extremity Weight Corrector
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Reassigns vertices behind the start joint of finger/toe bones back to their parent
 * (e.g. keeping knuckles and palms on the hand bone rather than deforming with finger tips).
 */
import * as THREE from 'three';
import { BoneClassifier, BoneCategory } from './bone-classifier.js';

export class ExtremityWeightCorrector {
  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Bone[]} bones
   */
  constructor(geometry, bones) {
    this.geometry = geometry;
    this.bones = bones;
    this.classifier = new BoneClassifier(bones);
    /** @type {Map<THREE.Bone, number>} */
    this.bone_to_index = new Map();
    bones.forEach((b, idx) => this.bone_to_index.set(b, idx));
  }

  /**
   * @param {number[]} skin_indices
   * @param {number[]} skin_weights
   */
  apply_extremity_weight_correction(skin_indices, skin_weights) {
    const posAttr = this.geometry.attributes.position;
    if (!posAttr) return;
    const vertexCount = posAttr.count;
    const boneAxes = this.build_extremity_bone_axes();
    const v = new THREE.Vector3();

    for (let i = 0; i < vertexCount; i++) {
      const offset = i * 4;
      const boneIndex = skin_indices[offset];
      const axis = boneAxes.get(boneIndex);
      if (!axis) continue;

      v.fromBufferAttribute(posAttr, i);
      const toVertex = v.clone().sub(axis.head);

      // Negative projection means vertex is behind the start joint, on the parent side
      if (toVertex.dot(axis.direction) < 0) {
        skin_indices[offset] = axis.parent_index;
      }
    }
  }

  /**
   * @returns {Map<number, {head: THREE.Vector3, direction: THREE.Vector3, parent_index: number}>}
   */
  build_extremity_bone_axes() {
    const axes = new Map();

    this.bones.forEach((bone, idx) => {
      if (this.classifier.get_category(idx) !== BoneCategory.Extremity) return;
      const parent = bone.parent;
      if (!parent || !parent.isBone) return;
      const parentIndex = this.bone_to_index.get(parent);
      if (parentIndex === undefined) return;

      const head = new THREE.Vector3();
      bone.getWorldPosition(head);

      let direction = new THREE.Vector3();
      const childBone = bone.children.find(c => c.isBone);
      if (childBone) {
        const childHead = new THREE.Vector3();
        childBone.getWorldPosition(childHead);
        direction.subVectors(childHead, head).normalize();
      } else {
        const parentHead = new THREE.Vector3();
        parent.getWorldPosition(parentHead);
        direction.subVectors(head, parentHead).normalize();
      }

      if (direction.lengthSq() < 1e-6) {
        direction.set(0, 1, 0);
      }

      axes.set(idx, { head, direction, parent_index: parentIndex });
    });

    return axes;
  }
}
