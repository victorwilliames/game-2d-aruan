/**
 * MovaLab 2.0 - Independent Bone Movement & Symmetry
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Allows moving joint pivots without altering the world space positions of child bones.
 */
import * as THREE from 'three';

export class IndependentBoneMovement {
  constructor() {
    this.enabled = true;
    /** @type {Map<string, {pos: THREE.Vector3, rot: THREE.Quaternion}>} */
    this.childrenSnapshots = new Map();
  }

  /**
   * @param {THREE.Bone} bone
   * @param {THREE.Bone} [mirrorBone]
   */
  recordDragStart(bone, mirrorBone) {
    this.childrenSnapshots.clear();
    this.snapshotChildren(bone);
    if (mirrorBone) this.snapshotChildren(mirrorBone);
  }

  snapshotChildren(bone) {
    if (!bone) return;
    bone.children.forEach(child => {
      if (child.isBone) {
        const pos = new THREE.Vector3();
        const rot = new THREE.Quaternion();
        child.getWorldPosition(pos);
        child.getWorldQuaternion(rot);
        this.childrenSnapshots.set(child.uuid, { pos, rot });
      }
    });
  }

  /**
   * Keep children stationary in world space while bone is moved.
   * @param {THREE.Bone} bone
   * @param {THREE.Bone} [mirrorBone]
   */
  apply(bone, mirrorBone) {
    if (!this.enabled) return;
    this.repinChildren(bone);
    if (mirrorBone) this.repinChildren(mirrorBone);
  }

  repinChildren(bone) {
    if (!bone) return;
    bone.updateWorldMatrix(true, false);
    bone.children.forEach(child => {
      if (child.isBone) {
        const snap = this.childrenSnapshots.get(child.uuid);
        if (snap) {
          const localPos = snap.pos.clone();
          bone.worldToLocal(localPos);
          child.position.copy(localPos);
          child.updateMatrix();
          child.updateWorldMatrix(true, true);
        }
      }
    });
  }

  /**
   * @param {THREE.Bone} bone
   * @param {THREE.Bone} [mirrorBone]
   */
  finalizeDrop(bone, mirrorBone) {
    this.finalizeBone(bone);
    if (mirrorBone) this.finalizeBone(mirrorBone);
  }

  finalizeBone(bone) {
    if (!bone) return;
    this.repinChildren(bone);
  }

  /**
   * Find symmetric mirror bone (Left <-> Right)
   * @param {THREE.Bone} bone
   * @param {THREE.Skeleton} skeleton
   * @returns {THREE.Bone|null}
   */
  static findMirrorBone(bone, skeleton) {
    if (!bone || !skeleton) return null;
    const name = bone.name;
    let mirrorName = null;

    if (name.includes('Left')) mirrorName = name.replace('Left', 'Right');
    else if (name.includes('Right')) mirrorName = name.replace('Right', 'Left');
    else if (name.endsWith('_l') || name.endsWith('_L')) mirrorName = name.slice(0, -2) + (name.endsWith('_l') ? '_r' : '_R');
    else if (name.endsWith('_r') || name.endsWith('_R')) mirrorName = name.slice(0, -2) + (name.endsWith('_r') ? '_l' : '_L');
    else if (name.startsWith('L_')) mirrorName = 'R_' + name.slice(2);
    else if (name.startsWith('R_')) mirrorName = 'L_' + name.slice(2);

    if (!mirrorName) return null;
    return skeleton.bones.find(b => b.name === mirrorName) || null;
  }

  /**
   * Apply mirrored transform to the mirror bone.
   * @param {THREE.Bone} bone
   * @param {THREE.Bone} mirrorBone
   */
  static applyMirror(bone, mirrorBone) {
    if (!bone || !mirrorBone) return;
    // Mirror position across X axis
    mirrorBone.position.set(-bone.position.x, bone.position.y, bone.position.z);
    // Mirror rotation
    mirrorBone.quaternion.set(bone.quaternion.x, -bone.quaternion.y, -bone.quaternion.z, bone.quaternion.w);
    mirrorBone.updateMatrix();
    mirrorBone.updateWorldMatrix(true, true);
  }
}
