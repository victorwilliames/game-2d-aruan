/**
 * MovaLab 2.0 - Mesh Volume Bone Drag Placement
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 * Automatically centers a dragged bone in the 3D volume of the character mesh.
 */
import * as THREE from 'three';
import { IndependentBoneMovement } from './independent-movement.js';

export class MeshDragBonePlacement {
  /**
   * @param {THREE.Camera} camera
   * @param {THREE.Object3D} scene
   */
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.firstHitOnly = false;
    this.independentMovement = new IndependentBoneMovement();
    this.mirrorEnabled = true;
    this.isDragging = false;
    /** @type {THREE.Bone|null} */
    this.selectedBone = null;
    /** @type {THREE.Bone|null} */
    this.mirrorBone = null;
    /** @type {THREE.Mesh|THREE.SkinnedMesh|null} */
    this.targetMesh = null;
  }

  setTargetMesh(mesh) {
    this.targetMesh = mesh;
  }

  /**
   * @param {THREE.Bone} bone
   * @param {THREE.Skeleton} skeleton
   */
  startDrag(bone, skeleton) {
    this.selectedBone = bone;
    this.mirrorBone = this.mirrorEnabled ? IndependentBoneMovement.findMirrorBone(bone, skeleton) : null;
    this.independentMovement.recordDragStart(this.selectedBone, this.mirrorBone);
    this.isDragging = true;
  }

  /**
   * @param {THREE.Vector2} normalizedMouse - Mouse coordinates in [-1, 1] range
   */
  dragTo(normalizedMouse) {
    if (!this.isDragging || !this.selectedBone || !this.selectedBone.parent) return;

    this.raycaster.setFromCamera(normalizedMouse, this.camera);

    let targetWorldPos = null;
    if (this.targetMesh) {
      const intersections = this.raycaster.intersectObject(this.targetMesh, true);
      if (intersections.length >= 2) {
        // Midpoint between entry and exit of the 3D volume
        const first = intersections[0].point;
        const last = intersections[intersections.length - 1].point;
        targetWorldPos = first.clone().add(last).multiplyScalar(0.5);
      } else if (intersections.length === 1) {
        targetWorldPos = intersections[0].point;
      }
    }

    // Fallback: unproject ray at current bone plane depth
    if (!targetWorldPos) {
      const plane = new THREE.Plane();
      const boneWorldPos = new THREE.Vector3();
      this.selectedBone.getWorldPosition(boneWorldPos);
      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      plane.setFromNormalAndCoplanarPoint(camDir.negate(), boneWorldPos);
      targetWorldPos = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(plane, targetWorldPos);
    }

    if (targetWorldPos) {
      const local = targetWorldPos.clone();
      this.selectedBone.parent.worldToLocal(local);
      this.selectedBone.position.copy(local);
      this.selectedBone.updateMatrix();
      this.selectedBone.updateWorldMatrix(true, true);

      if (this.mirrorEnabled && this.mirrorBone) {
        IndependentBoneMovement.applyMirror(this.selectedBone, this.mirrorBone);
      }

      this.independentMovement.apply(this.selectedBone, this.mirrorBone);
    }
  }

  stopDrag() {
    if (this.isDragging && this.selectedBone) {
      this.independentMovement.finalizeDrop(this.selectedBone, this.mirrorBone);
    }
    this.isDragging = false;
    this.selectedBone = null;
    this.mirrorBone = null;
  }
}
