/**
 * MovaLab 2.0 - Weight Calculator
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Calculates initial bone-to-vertex weight assignments based on bone segment midpoints
 * and humanoid pelvis bounds.
 */
import * as THREE from 'three';

export class WeightCalculator {
  /**
   * @param {THREE.Bone[]} bones
   * @param {THREE.BufferGeometry} geometry
   * @param {string} skeletonType - 'human' | 'other'
   */
  constructor(bones, geometry, skeletonType = 'human') {
    this.bones = bones;
    this.geometry = geometry;
    this.skeletonType = skeletonType;

    /** @type {THREE.Vector3[]} */
    this.cached_median_child_bone_positions = [];
    /** @type {Map<THREE.Bone, number>} */
    this.bone_object_to_index = new Map();
    /** @type {Set<number>} */
    this.skipped_bone_indices = new Set();
    this.distance_to_bottom_of_position_tracking_bone = 0;
  }

  /**
   * Compute world midpoint of bone to its primary child, or its world position if leaf.
   * @param {THREE.Bone} bone
   * @returns {THREE.Vector3}
   */
  static bone_midpoint(bone) {
    const start = new THREE.Vector3();
    bone.getWorldPosition(start);
    const boneChild = bone.children.find(c => c.isBone);
    if (!boneChild) return start;
    const end = new THREE.Vector3();
    boneChild.getWorldPosition(end);
    return start.clone().add(end).multiplyScalar(0.5);
  }

  initialize_caches() {
    this.bones.forEach((b, idx) => {
      this.bone_object_to_index.set(b, idx);
      this.cached_median_child_bone_positions.push(WeightCalculator.bone_midpoint(b));
      const name = b.name.toLowerCase();
      // Skip global roots and end leaves from deforming vertices directly
      if (name === 'root' || name === 'armature' || (b.children.filter(c => c.isBone).length === 0 && (name.includes('end') || name.includes('leaf')))) {
        this.skipped_bone_indices.add(idx);
      }
    });

    if (this.skeletonType === 'human') {
      this.distance_to_bottom_of_position_tracking_bone = this.calculate_pelvis_cutoff();
    }
  }

  calculate_pelvis_cutoff() {
    const hips = this.bones.find(b => {
      const n = b.name.toLowerCase();
      return n.includes('hips') || n.includes('pelvis');
    });
    if (!hips) return 0;
    const hipsIdx = this.bones.indexOf(hips);
    const hipsPos = this.cached_median_child_bone_positions[hipsIdx];

    // Find lowest extent of geometry near center X/Z to approximate crotch
    const posAttr = this.geometry.attributes.position;
    if (!posAttr) return 0;
    let minY = Infinity;
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      if (Math.abs(v.x) < 25 && Math.abs(v.z) < 25 && v.y < hipsPos.y && v.y > hipsPos.y - 120) {
        if (v.y < minY) minY = v.y;
      }
    }
    return Number.isFinite(minY) ? minY * 0.95 : hipsPos.y * 0.85;
  }

  /**
   * @param {number[]} skin_indices
   * @param {number[]} skin_weights
   */
  calculate_median_bone_weights(skin_indices, skin_weights) {
    const posAttr = this.geometry.attributes.position;
    if (!posAttr) return;
    const vertexCount = posAttr.count;
    const v = new THREE.Vector3();

    for (let i = 0; i < vertexCount; i++) {
      v.fromBufferAttribute(posAttr, i);
      let closestDistance = Infinity;
      let closestIndex = 0;

      for (let idx = 0; idx < this.bones.length; idx++) {
        if (this.skipped_bone_indices.has(idx)) continue;
        const bone = this.bones[idx];
        const name = bone.name.toLowerCase();

        // Humanoid hips boundary: vertices below pelvis threshold belong to legs, not hips
        if (this.skeletonType === 'human' && (name.includes('hips') || name.includes('pelvis'))) {
          if (this.distance_to_bottom_of_position_tracking_bone !== 0 && v.y < this.distance_to_bottom_of_position_tracking_bone) {
            continue;
          }
        }

        const dist = this.cached_median_child_bone_positions[idx].distanceTo(v);
        if (dist < closestDistance) {
          closestDistance = dist;
          closestIndex = idx;
        }
      }

      // Initial assignment: 100% weight to closest bone
      skin_indices.push(closestIndex, 0, 0, 0);
      skin_weights.push(1.0, 0, 0, 0);
    }
  }
}
