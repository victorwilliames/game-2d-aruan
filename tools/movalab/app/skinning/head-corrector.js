/**
 * MovaLab 2.0 - Head Weight Corrector
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Tailored for Chibi characters like Aruan, where large heads can incorrectly
 * grab weight from nearby arm and shoulder bones.
 */
import * as THREE from 'three';

export class HeadWeightCorrector {
  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Bone[]} bones
   * @param {number} previewPlaneHeight
   */
  constructor(geometry, bones, previewPlaneHeight = 1.4) {
    this.geometry = geometry;
    this.bones = bones;
    this.previewPlaneHeight = previewPlaneHeight;
  }

  /**
   * @param {number[]} skin_indices
   * @param {number[]} skin_weights
   */
  apply_head_weight_correction(skin_indices, skin_weights) {
    const headIndex = this.find_head_bone_index();
    if (headIndex === -1) return;

    const armIndices = this.find_arm_bone_indices();
    if (armIndices.size === 0) return;

    const posAttr = this.geometry.attributes.position;
    if (!posAttr) return;
    const vertexCount = posAttr.count;
    const v = new THREE.Vector3();

    for (let i = 0; i < vertexCount; i++) {
      v.fromBufferAttribute(posAttr, i);
      // Skip vertices below the head threshold
      if (v.y <= this.previewPlaneHeight) continue;

      const offset = i * 4;
      const primaryBone = skin_indices[offset];
      const primaryWeight = skin_weights[offset];

      // If vertex above head plane was given to arm bone with > 50% weight, reassign to head
      if (armIndices.has(primaryBone) && primaryWeight > 0.4) {
        skin_indices[offset] = headIndex;
        skin_indices[offset + 1] = 0;
        skin_indices[offset + 2] = 0;
        skin_indices[offset + 3] = 0;
        skin_weights[offset] = 1.0;
        skin_weights[offset + 1] = 0.0;
        skin_weights[offset + 2] = 0.0;
        skin_weights[offset + 3] = 0.0;
        continue;
      }

      // Check secondary slots
      for (let j = 0; j < 4; j++) {
        const boneIdx = skin_indices[offset + j];
        const weight = skin_weights[offset + j];
        if (armIndices.has(boneIdx) && weight > 0.25) {
          let headSlot = -1;
          for (let k = 0; k < 4; k++) {
            if (skin_indices[offset + k] === headIndex) { headSlot = k; break; }
          }
          if (headSlot === -1) {
            skin_indices[offset + j] = headIndex;
          } else {
            skin_weights[offset + headSlot] += weight;
            skin_weights[offset + j] = 0;
            skin_indices[offset + j] = 0;
          }
        }
      }

      // Normalize vertex
      const sum = skin_weights[offset] + skin_weights[offset + 1] + skin_weights[offset + 2] + skin_weights[offset + 3];
      if (sum > 0) {
        skin_weights[offset] /= sum;
        skin_weights[offset + 1] /= sum;
        skin_weights[offset + 2] /= sum;
        skin_weights[offset + 3] /= sum;
      }
    }
  }

  find_head_bone_index() {
    return this.bones.findIndex(b => {
      const n = b.name.toLowerCase();
      return n === 'head' || n === 'def-head' || n.includes('head');
    });
  }

  find_arm_bone_indices() {
    const indices = new Set();
    this.bones.forEach((bone, idx) => {
      const n = bone.name.toLowerCase();
      if (n.includes('arm') || n.includes('shoulder') || n.includes('hand') || n.includes('finger') || n.includes('forearm')) {
        indices.add(idx);
      }
    });
    return indices;
  }
}
