/**
 * MovaLab 2.0 - Arm Weight Corrector
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Pulls torso/ribcage vertices back off arm bones when arms are in A-pose or hanging down.
 */
import * as THREE from 'three';

export class ArmWeightCorrector {
  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Bone[]} bones
   * @param {number} armPlaneOffset
   */
  constructor(geometry, bones, armPlaneOffset = 0) {
    this.geometry = geometry;
    this.bones = bones;
    this.armPlaneOffset = armPlaneOffset;
  }

  static shoulder_anchor_x(bones) {
    const shoulder = bones.find(b => {
      const n = b.name.toLowerCase();
      return (n.includes('arm') || n.includes('shoulder')) && !n.includes('forearm');
    });
    if (!shoulder) return null;
    const pos = new THREE.Vector3();
    shoulder.getWorldPosition(pos);
    return Math.abs(pos.x);
  }

  /**
   * @param {number[]} skin_indices
   * @param {number[]} skin_weights
   */
  apply_arm_weight_correction(skin_indices, skin_weights) {
    const anchorX = ArmWeightCorrector.shoulder_anchor_x(this.bones);
    if (anchorX === null || anchorX <= 0) return;

    const planeX = anchorX + this.armPlaneOffset;
    if (planeX <= 0) return;

    const armBones = this.find_arm_bone_indices();
    if (armBones.size === 0) return;

    const fallbackCandidates = this.find_fallback_candidates(armBones);
    if (fallbackCandidates.length === 0) return;

    const posAttr = this.geometry.attributes.position;
    if (!posAttr) return;
    const vertexCount = posAttr.count;
    const v = new THREE.Vector3();

    for (let i = 0; i < vertexCount; i++) {
      v.fromBufferAttribute(posAttr, i);
      // Only vertices inboard of the arm plane (|x| < planeX)
      if (Math.abs(v.x) >= planeX) continue;

      const offset = i * 4;
      const primaryBone = skin_indices[offset];
      if (armBones.has(primaryBone)) {
        // Find nearest fallback (torso/spine/hips) bone
        let nearestIdx = fallbackCandidates[0].index;
        let nearestDist = Infinity;
        for (const candidate of fallbackCandidates) {
          const dist = candidate.position.distanceTo(v);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIdx = candidate.index;
          }
        }
        skin_indices[offset] = nearestIdx;
      }
    }
  }

  find_arm_bone_indices() {
    const armIndices = new Set();
    this.bones.forEach((bone, idx) => {
      const n = bone.name.toLowerCase();
      if (n.includes('arm') || n.includes('hand') || n.includes('finger') || n.includes('thumb') || n.includes('forearm')) {
        armIndices.add(idx);
      }
    });
    return armIndices;
  }

  find_fallback_candidates(armIndices) {
    const candidates = [];
    this.bones.forEach((bone, idx) => {
      if (armIndices.has(idx)) return;
      const n = bone.name.toLowerCase();
      if (n.includes('spine') || n.includes('hips') || n.includes('pelvis') || n.includes('chest')) {
        const pos = new THREE.Vector3();
        bone.getWorldPosition(pos);
        candidates.push({ index: idx, position: pos });
      }
    });
    return candidates;
  }
}
