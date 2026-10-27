/**
 * MovaLab 2.0 - Bone Classifier
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Classifies skeleton bones into anatomical categories for specialized skinning and smoothing:
 * - Torso: spine, chest, hips, pelvis, neck (gets wider multi-ring smoothing)
 * - Limb: arms, legs, shoulders (gets directional child-only smoothing)
 * - Extremity: hands, feet, fingers, toes (rigid preservation, no excessive blur)
 * - Root: root / origin (skipped from skinning deformations)
 * - Other: unclassified
 */

export const BoneCategory = {
  Torso: 'torso',
  Limb: 'limb',
  Extremity: 'extremity',
  Root: 'root',
  Other: 'other'
};

export class BoneClassifier {
  /**
   * @param {Array<{name: string}>} bones
   */
  constructor(bones = []) {
    /** @type {Map<number, string>} */
    this.bone_categories = new Map();
    this.classify_all_bones(bones);
  }

  /**
   * @param {number} bone_index
   * @returns {string}
   */
  get_category(bone_index) {
    return this.bone_categories.get(bone_index) || BoneCategory.Other;
  }

  /**
   * Returns true if boundary between bones is a limb boundary (directional smoothing).
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  is_limb_boundary(a, b) {
    const catA = this.get_category(a);
    const catB = this.get_category(b);
    return catA === BoneCategory.Limb || catB === BoneCategory.Limb;
  }

  /**
   * Returns true if boundary is between two extremities (hands/fingers, feet/toes).
   * Keeps small parts rigid instead of mushy.
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  is_extremity_boundary(a, b) {
    return this.get_category(a) === BoneCategory.Extremity &&
           this.get_category(b) === BoneCategory.Extremity;
  }

  /**
   * Returns true if boundary should get wider torso multi-ring smoothing.
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  is_torso_boundary(a, b) {
    const catA = this.get_category(a);
    const catB = this.get_category(b);
    return (catA === BoneCategory.Torso || catB === BoneCategory.Torso) &&
           catA !== BoneCategory.Extremity && catB !== BoneCategory.Extremity;
  }

  /**
   * @param {Array<{name: string}>} bones
   */
  classify_all_bones(bones) {
    bones.forEach((bone, idx) => {
      this.bone_categories.set(idx, this.classify_bone(bone));
    });
  }

  /**
   * @param {{name: string}} bone
   * @returns {string}
   */
  classify_bone(bone) {
    const name = String(bone?.name || '').toLowerCase();

    if (name === 'root' || name === 'armature' || name === 'origin') {
      return BoneCategory.Root;
    }

    // Extremity: hands, feet, fingers, toes
    const extremityKeywords = [
      'hand', 'foot', 'feet', 'toe', 'ball', 'thumb', 'index', 'middle', 'ring', 'pinky',
      'finger', 'righthandthumb', 'lefthandthumb', 'righthandindex', 'lefthandindex',
      'righthandmiddle', 'lefthandmiddle', 'righthandring', 'lefthandring',
      'righthandpinky', 'lefthandpinky', 'lefttoebase', 'righttoebase', 'lefttoe_end', 'righttoe_end'
    ];
    if (extremityKeywords.some(kw => name.includes(kw))) {
      return BoneCategory.Extremity;
    }

    // Limb: arms, legs, thighs, knees, elbows, shoulders
    const limbKeywords = [
      'arm', 'upperarm', 'lowerarm', 'forearm', 'elbow', 'wrist', 'shoulder', 'clavicle',
      'thigh', 'calf', 'shin', 'knee', 'leg', 'upleg', 'lowleg', 'ankle',
      'leftarm', 'rightarm', 'leftforearm', 'rightforearm', 'leftupleg', 'rightupleg',
      'leftleg', 'rightleg', 'leftfoot', 'rightfoot', 'leftshoulder', 'rightshoulder'
    ];
    if (limbKeywords.some(kw => name.includes(kw))) {
      return BoneCategory.Limb;
    }

    // Torso: spine, hips, pelvis, chest, neck, head
    const torsoKeywords = [
      'spine', 'chest', 'hips', 'pelvis', 'torso', 'abdomen', 'neck', 'head',
      'mixamorighips', 'mixamorigspine', 'mixamorigspine1', 'mixamorigspine2',
      'mixamorigneck', 'mixamorighead', 'headtop_end'
    ];
    if (torsoKeywords.some(kw => name.includes(kw))) {
      return BoneCategory.Torso;
    }

    return BoneCategory.Other;
  }
}
