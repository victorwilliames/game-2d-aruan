/**
 * MovaLab 2.0 - Undo / Redo System for Skeleton Posing and Bone Editing
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 */
import * as THREE from 'three';

export class UndoRedoSystem {
  /**
   * @param {number} maxHistorySize
   */
  constructor(maxHistorySize = 50) {
    this.maxHistorySize = maxHistorySize;
    /** @type {Array<Array<{name: string, pos: THREE.Vector3, rot: THREE.Quaternion, scale: THREE.Vector3}>>} */
    this.undoStack = [];
    /** @type {Array<Array<{name: string, pos: THREE.Vector3, rot: THREE.Quaternion, scale: THREE.Vector3}>>} */
    this.redoStack = [];
    /** @type {THREE.Skeleton|null} */
    this.skeleton = null;
    /** @type {Function[]} */
    this.listeners = [];
  }

  /**
   * @param {THREE.Skeleton} skeleton
   */
  setSkeleton(skeleton) {
    this.skeleton = skeleton;
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn({ canUndo: this.canUndo(), canRedo: this.canRedo() }));
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  snapshot() {
    if (!this.skeleton) return null;
    return this.skeleton.bones.map(b => ({
      name: b.name,
      pos: b.position.clone(),
      rot: b.quaternion.clone(),
      scale: b.scale.clone()
    }));
  }

  applySnapshot(snap) {
    if (!this.skeleton || !snap) return;
    const map = new Map(snap.map(s => [s.name, s]));
    this.skeleton.bones.forEach(b => {
      const s = map.get(b.name);
      if (s) {
        b.position.copy(s.pos);
        b.quaternion.copy(s.rot);
        b.scale.copy(s.scale);
        b.updateMatrix();
        b.updateWorldMatrix(true, true);
      }
    });
  }

  pushState() {
    if (!this.skeleton) return;
    const snap = this.snapshot();
    if (!snap) return;
    this.undoStack.push(snap);
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notify();
  }

  undo() {
    if (!this.canUndo() || !this.skeleton) return false;
    const current = this.snapshot();
    this.redoStack.push(current);
    const prev = this.undoStack.pop();
    this.applySnapshot(prev);
    this.notify();
    return true;
  }

  redo() {
    if (!this.canRedo() || !this.skeleton) return false;
    const current = this.snapshot();
    this.undoStack.push(current);
    const next = this.redoStack.pop();
    this.applySnapshot(next);
    this.notify();
    return true;
  }
}
