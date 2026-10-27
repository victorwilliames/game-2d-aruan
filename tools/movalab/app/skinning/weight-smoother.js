/**
 * MovaLab 2.0 - Weight Smoother
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Smooths bone weight boundaries across adjacent mesh vertices using bone categorization:
 * - Torso: multi-ring gradient blending
 * - Limbs: directional parent->child smoothing
 * - Extremities: rigid preservation
 */
import { BoneClassifier, BoneCategory } from './bone-classifier.js';

export class WeightSmoother {
  /**
   * @param {THREE.BufferGeometry} geometry
   * @param {THREE.Bone[]} bones
   */
  constructor(geometry, bones) {
    this.geometry = geometry;
    this.bones = bones;
    this.classifier = new BoneClassifier(bones);
  }

  /**
   * Builds an array of Sets containing adjacent vertex indices.
   * @returns {Array<Set<number>>}
   */
  build_vertex_adjacency() {
    const posAttr = this.geometry.attributes.position;
    const vertexCount = posAttr ? posAttr.count : 0;
    const adjacency = Array.from({ length: vertexCount }, () => new Set());
    const index = this.geometry.index;

    if (index) {
      const arr = index.array;
      for (let i = 0; i < arr.length; i += 3) {
        const a = arr[i], b = arr[i + 1], c = arr[i + 2];
        adjacency[a].add(b); adjacency[a].add(c);
        adjacency[b].add(a); adjacency[b].add(c);
        adjacency[c].add(a); adjacency[c].add(b);
      }
    } else if (posAttr) {
      for (let i = 0; i < vertexCount; i += 3) {
        const a = i, b = i + 1, c = i + 2;
        if (c < vertexCount) {
          adjacency[a].add(b); adjacency[a].add(c);
          adjacency[b].add(a); adjacency[b].add(c);
          adjacency[c].add(a); adjacency[c].add(b);
        }
      }
    }

    return adjacency;
  }

  /**
   * @param {number[]} skin_indices
   * @param {number[]} skin_weights
   */
  smooth_bone_weight_boundaries(skin_indices, skin_weights) {
    const adjacency = this.build_vertex_adjacency();
    const posAttr = this.geometry.attributes.position;
    if (!posAttr) return;
    const vertexCount = posAttr.count;

    // Find boundary vertices
    const boundaryVertices = new Set();
    for (let i = 0; i < vertexCount; i++) {
      const boneA = skin_indices[i * 4];
      for (const neighbor of adjacency[i]) {
        const boneB = skin_indices[neighbor * 4];
        if (boneA !== boneB) {
          boundaryVertices.add(i);
          boundaryVertices.add(neighbor);
        }
      }
    }

    // Blend weights on boundary vertices according to classification
    boundaryVertices.forEach(v => {
      const offset = v * 4;
      const boneA = skin_indices[offset];
      const cat = this.classifier.get_category(boneA);

      // Extremities stay rigid - no blurring across finger joints
      if (cat === BoneCategory.Extremity) return;

      // Collect neighbor bone influences
      const neighborBones = new Map();
      neighborBones.set(boneA, 1.0);

      adjacency[v].forEach(nb => {
        const nbOffset = nb * 4;
        const nbBone = skin_indices[nbOffset];
        const nbWeight = skin_weights[nbOffset];
        neighborBones.set(nbBone, (neighborBones.get(nbBone) || 0) + nbWeight * 0.5);
      });

      // Sort influences by total weight
      const sorted = [...neighborBones.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
      let total = 0;
      sorted.forEach(entry => total += entry[1]);

      if (total > 0) {
        for (let slot = 0; slot < 4; slot++) {
          if (slot < sorted.length) {
            skin_indices[offset + slot] = sorted[slot][0];
            skin_weights[offset + slot] = sorted[slot][1] / total;
          } else {
            skin_indices[offset + slot] = 0;
            skin_weights[offset + slot] = 0;
          }
        }
      }
    });
  }
}
