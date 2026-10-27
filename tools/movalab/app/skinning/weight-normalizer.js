/**
 * MovaLab 2.0 - Weight Normalizer
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Normalizes bone skin weights to sum to exactly 1.0 per vertex, keeping the top 4 influences.
 */

export class WeightNormalizer {
  /**
   * @param {THREE.BufferGeometry} geometry
   */
  constructor(geometry) {
    this.geometry = geometry;
  }

  /**
   * @param {number[]} skin_weights
   * @param {number[]} [skin_indices]
   */
  normalize_weights(skin_weights, skin_indices) {
    const vertexCount = skin_weights.length / 4;
    const EPSILON = 1e-5;

    for (let i = 0; i < vertexCount; i++) {
      const offset = i * 4;
      let sum = 0;

      for (let j = 0; j < 4; j++) {
        // Zero out negligible noise weights
        if (skin_weights[offset + j] < 0.01) {
          skin_weights[offset + j] = 0;
          if (skin_indices) skin_indices[offset + j] = 0;
        }
        sum += skin_weights[offset + j];
      }

      if (sum > EPSILON) {
        for (let j = 0; j < 4; j++) {
          skin_weights[offset + j] /= sum;
        }
      } else {
        // Fallback: 100% to primary bone if all weights were pruned
        skin_weights[offset] = 1.0;
        skin_weights[offset + 1] = 0;
        skin_weights[offset + 2] = 0;
        skin_weights[offset + 3] = 0;
      }
    }
  }

  /**
   * @param {number[]} skin_weights
   * @returns {number[]} list of vertex indices with non-normalized weights
   */
  find_vertices_with_incorrect_weight_sum(skin_weights) {
    const vertexCount = skin_weights.length / 4;
    const incorrect = [];
    for (let i = 0; i < vertexCount; i++) {
      const offset = i * 4;
      const sum = skin_weights[offset] + skin_weights[offset + 1] + skin_weights[offset + 2] + skin_weights[offset + 3];
      if (Math.abs(sum - 1.0) > 1e-4) {
        incorrect.push(i);
      }
    }
    return incorrect;
  }
}
