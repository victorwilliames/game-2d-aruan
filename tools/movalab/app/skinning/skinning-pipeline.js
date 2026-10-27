/**
 * MovaLab 2.0 - Skinning Pipeline
 * Orchestrates the full automatic skinning workflow:
 * WeightCalculator -> ExtremityCorrector -> ArmCorrector -> WeightSmoother -> Normalizer -> HeadCorrector.
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 */
import * as THREE from 'three';
import { WeightCalculator } from './weight-calculator.js';
import { ExtremityWeightCorrector } from './extremity-corrector.js';
import { ArmWeightCorrector } from './arm-corrector.js';
import { HeadWeightCorrector } from './head-corrector.js';
import { WeightSmoother } from './weight-smoother.js';
import { WeightNormalizer } from './weight-normalizer.js';

export class SkinningPipeline {
  /**
   * @param {THREE.Bone[]} bones
   * @param {THREE.BufferGeometry} geometry
   * @param {object} [options]
   * @param {string} [options.skeletonType='human']
   * @param {boolean} [options.useHeadCorrection=true]
   * @param {number} [options.headPlaneHeight=120]
   * @param {boolean} [options.useArmCorrection=false]
   * @param {number} [options.armPlaneOffset=0]
   */
  constructor(bones, geometry, options = {}) {
    this.bones = bones;
    this.geometry = geometry;
    this.options = {
      skeletonType: 'human',
      useHeadCorrection: true,
      headPlaneHeight: 120,
      useArmCorrection: false,
      armPlaneOffset: 0,
      ...options
    };
  }

  /**
   * Compute skin indices and weights.
   * @returns {{indices: Float32Array, weights: Float32Array}}
   */
  compute() {
    const skinIndices = [];
    const skinWeights = [];

    // Step 1: Initial bone weight calculation via distance to segment midpoints
    const calculator = new WeightCalculator(this.bones, this.geometry, this.options.skeletonType);
    calculator.initialize_caches();
    calculator.calculate_median_bone_weights(skinIndices, skinWeights);

    // Step 2: Extremity correction (fingers/toes pulling knuckle/palm vertices)
    const extremityCorrector = new ExtremityWeightCorrector(this.geometry, this.bones);
    extremityCorrector.apply_extremity_weight_correction(skinIndices, skinWeights);

    // Step 3: Arm plane correction (A-pose arms grabbing ribcage/torso)
    if (this.options.useArmCorrection) {
      const armCorrector = new ArmWeightCorrector(this.geometry, this.bones, this.options.armPlaneOffset);
      armCorrector.apply_arm_weight_correction(skinIndices, skinWeights);
    }

    // Step 4: Category-aware smoothing across adjacent vertices
    const smoother = new WeightSmoother(this.geometry, this.bones);
    smoother.smooth_bone_weight_boundaries(skinIndices, skinWeights);

    // Step 5: Normalize weights
    const normalizer = new WeightNormalizer(this.geometry);
    normalizer.normalize_weights(skinWeights, skinIndices);

    // Step 6: Head weight correction (especially for Chibi characters like Aruan)
    if (this.options.useHeadCorrection) {
      const headCorrector = new HeadWeightCorrector(this.geometry, this.bones, this.options.headPlaneHeight);
      headCorrector.apply_head_weight_correction(skinIndices, skinWeights);
      normalizer.normalize_weights(skinWeights, skinIndices);
    }

    const indicesArray = new Float32Array(skinIndices);
    const weightsArray = new Float32Array(skinWeights);

    return { indices: indicesArray, weights: weightsArray };
  }

  /**
   * Compute skin indices and weights without binding.
   * @param {THREE.Mesh|THREE.SkinnedMesh} mesh
   * @param {THREE.Skeleton} skeleton
   * @param {object} [options]
   * @returns {{indices: Float32Array, weights: Float32Array, positions: Float32Array}}
   */
  static computeSkinWeights(mesh, skeleton, options = {}) {
    const geometry = mesh.geometry;
    const pipeline = new SkinningPipeline(skeleton.bones, geometry, options);
    const { indices, weights } = pipeline.compute();
    const pos = geometry.attributes.position;
    return {
      indices,
      weights,
      positions: pos ? pos.array : new Float32Array()
    };
  }

  /**
   * Bind skeleton to mesh using computed weights.
   * @param {THREE.Mesh|THREE.SkinnedMesh} mesh
   * @param {THREE.Skeleton} skeleton
   * @param {object} weightsData
   * @returns {THREE.SkinnedMesh}
   */
  static bindSkeletonToMesh(mesh, skeleton, weightsData) {
    const geometry = mesh.geometry;
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(weightsData.indices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weightsData.weights, 4));

    let skinnedMesh;
    if (mesh.isSkinnedMesh) {
      skinnedMesh = mesh;
    } else {
      skinnedMesh = new THREE.SkinnedMesh(geometry, mesh.material);
      skinnedMesh.name = mesh.name;
      skinnedMesh.position.copy(mesh.position);
      skinnedMesh.rotation.copy(mesh.rotation);
      skinnedMesh.scale.copy(mesh.scale);
    }
    skinnedMesh.bind(skeleton);
    return skinnedMesh;
  }

  /**
   * Apply heat-map vertex colors for a selected bone directly onto geometry.
   * @param {THREE.BufferGeometry} geometry
   * @param {number} selectedBoneIndex
   * @param {object} [weightsData]
   */
  static applyHeatmapColors(geometry, selectedBoneIndex, weightsData = null) {
    const colors = SkinningPipeline.generateWeightColors(geometry, selectedBoneIndex);
    if (colors) {
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
  }

  /**
   * Apply computed weights to a mesh and bind to a skeleton.
   * Converts a standard THREE.Mesh to a THREE.SkinnedMesh if needed.
   * @param {THREE.Mesh|THREE.SkinnedMesh} mesh
   * @param {THREE.Skeleton} skeleton
   * @param {object} [options]
   * @returns {THREE.SkinnedMesh}
   */
  static applySkinning(mesh, skeleton, options = {}) {
    const geometry = mesh.geometry;
    const pipeline = new SkinningPipeline(skeleton.bones, geometry, options);
    const { indices, weights } = pipeline.compute();

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));

    let skinnedMesh;
    if (mesh.isSkinnedMesh) {
      skinnedMesh = mesh;
    } else {
      skinnedMesh = new THREE.SkinnedMesh(geometry, mesh.material);
      skinnedMesh.name = mesh.name;
      skinnedMesh.position.copy(mesh.position);
      skinnedMesh.rotation.copy(mesh.rotation);
      skinnedMesh.scale.copy(mesh.scale);
      if (mesh.parent) {
        mesh.parent.add(skinnedMesh);
        mesh.parent.remove(mesh);
      }
    }

    skinnedMesh.bind(skeleton);
    return skinnedMesh;
  }

  /**
   * Generate heat-map vertex colors for a selected bone for debugging / weight visualization.
   * @param {THREE.BufferGeometry} geometry
   * @param {number} selectedBoneIndex
   * @returns {Float32Array} RGB color array (3 floats per vertex)
   */
  static generateWeightColors(geometry, selectedBoneIndex) {
    const indices = geometry.attributes.skinIndex;
    const weights = geometry.attributes.skinWeight;
    if (!indices || !weights) return null;

    const count = indices.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      let boneWeight = 0;
      for (let slot = 0; slot < 4; slot++) {
        if (indices.getComponent(i, slot) === selectedBoneIndex) {
          boneWeight += weights.getComponent(i, slot);
        }
      }

      // Heatmap: 0.0 -> Blue, 0.5 -> Green/Yellow, 1.0 -> Red
      const color = new THREE.Color();
      if (boneWeight === 0) {
        color.setRGB(0.15, 0.15, 0.3); // Inactive dark blue-grey
      } else if (boneWeight < 0.25) {
        color.setRGB(0, boneWeight * 4, 1); // Blue to Cyan
      } else if (boneWeight < 0.5) {
        color.setRGB(0, 1, 1 - (boneWeight - 0.25) * 4); // Cyan to Green
      } else if (boneWeight < 0.75) {
        color.setRGB((boneWeight - 0.5) * 4, 1, 0); // Green to Yellow
      } else {
        color.setRGB(1, 1 - (boneWeight - 0.75) * 4, 0); // Yellow to Red
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return colors;
  }
}
