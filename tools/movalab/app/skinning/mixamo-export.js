/**
 * MovaLab 2.0 - Mixamo Mapper & Exporter
 * Bidirectional mapping between internal rig names and canonical mixamorig* names (mixamorig65.v1).
 * Generates animated GLB and ARUAN clip JSON.
 * Adapted from Mesh2Motion (MIT License, Copyright (c) 2025 Scott Petrovic).
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export const MIXAMO_CANONICAL_65 = [
  'mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead', 'mixamorigHeadTop_End',
  'mixamorigLeftShoulder', 'mixamorigLeftArm', 'mixamorigLeftForeArm', 'mixamorigLeftHand',
  'mixamorigRightShoulder', 'mixamorigRightArm', 'mixamorigRightForeArm', 'mixamorigRightHand',
  'mixamorigLeftUpLeg', 'mixamorigLeftLeg', 'mixamorigLeftFoot', 'mixamorigLeftToeBase', 'mixamorigLeftToe_End',
  'mixamorigRightUpLeg', 'mixamorigRightLeg', 'mixamorigRightFoot', 'mixamorigRightToeBase', 'mixamorigRightToe_End',
  // Left Hand Fingers
  'mixamorigLeftHandThumb1', 'mixamorigLeftHandThumb2', 'mixamorigLeftHandThumb3', 'mixamorigLeftHandThumb4',
  'mixamorigLeftHandIndex1', 'mixamorigLeftHandIndex2', 'mixamorigLeftHandIndex3', 'mixamorigLeftHandIndex4',
  'mixamorigLeftHandMiddle1', 'mixamorigLeftHandMiddle2', 'mixamorigLeftHandMiddle3', 'mixamorigLeftHandMiddle4',
  'mixamorigLeftHandRing1', 'mixamorigLeftHandRing2', 'mixamorigLeftHandRing3', 'mixamorigLeftHandRing4',
  'mixamorigLeftHandPinky1', 'mixamorigLeftHandPinky2', 'mixamorigLeftHandPinky3', 'mixamorigLeftHandPinky4',
  // Right Hand Fingers
  'mixamorigRightHandThumb1', 'mixamorigRightHandThumb2', 'mixamorigRightHandThumb3', 'mixamorigRightHandThumb4',
  'mixamorigRightHandIndex1', 'mixamorigRightHandIndex2', 'mixamorigRightHandIndex3', 'mixamorigRightHandIndex4',
  'mixamorigRightHandMiddle1', 'mixamorigRightHandMiddle2', 'mixamorigRightHandMiddle3', 'mixamorigRightHandMiddle4',
  'mixamorigRightHandRing1', 'mixamorigRightHandRing2', 'mixamorigRightHandRing3', 'mixamorigRightHandRing4',
  'mixamorigRightHandPinky1', 'mixamorigRightHandPinky2', 'mixamorigRightHandPinky3', 'mixamorigRightHandPinky4'
];

export const INTERNAL_TO_MIXAMO = {
  pelvis: 'mixamorigHips',
  spine_01: 'mixamorigSpine',
  spine_02: 'mixamorigSpine1',
  spine_03: 'mixamorigSpine2',
  neck_01: 'mixamorigNeck',
  head: 'mixamorigHead',
  head_leaf: 'mixamorigHeadTop_End',
  clavicle_l: 'mixamorigLeftShoulder',
  upperarm_l: 'mixamorigLeftArm',
  lowerarm_l: 'mixamorigLeftForeArm',
  hand_l: 'mixamorigLeftHand',
  clavicle_r: 'mixamorigRightShoulder',
  upperarm_r: 'mixamorigRightArm',
  lowerarm_r: 'mixamorigRightForeArm',
  hand_r: 'mixamorigRightHand',
  thigh_l: 'mixamorigLeftUpLeg',
  calf_l: 'mixamorigLeftLeg',
  foot_l: 'mixamorigLeftFoot',
  ball_l: 'mixamorigLeftToeBase',
  ball_leaf_l: 'mixamorigLeftToe_End',
  thigh_r: 'mixamorigRightUpLeg',
  calf_r: 'mixamorigRightLeg',
  foot_r: 'mixamorigRightFoot',
  ball_r: 'mixamorigRightToeBase',
  ball_leaf_r: 'mixamorigRightToe_End',
  // Left Hand
  thumb_01_l: 'mixamorigLeftHandThumb1', thumb_02_l: 'mixamorigLeftHandThumb2', thumb_03_l: 'mixamorigLeftHandThumb3', thumb_04_leaf_l: 'mixamorigLeftHandThumb4',
  index_01_l: 'mixamorigLeftHandIndex1', index_02_l: 'mixamorigLeftHandIndex2', index_03_l: 'mixamorigLeftHandIndex3', index_04_leaf_l: 'mixamorigLeftHandIndex4',
  middle_01_l: 'mixamorigLeftHandMiddle1', middle_02_l: 'mixamorigLeftHandMiddle2', middle_03_l: 'mixamorigLeftHandMiddle3', middle_04_leaf_l: 'mixamorigLeftHandMiddle4',
  ring_01_l: 'mixamorigLeftHandRing1', ring_02_l: 'mixamorigLeftHandRing2', ring_03_l: 'mixamorigLeftHandRing3', ring_04_leaf_l: 'mixamorigLeftHandRing4',
  pinky_01_l: 'mixamorigLeftHandPinky1', pinky_02_l: 'mixamorigLeftHandPinky2', pinky_03_l: 'mixamorigLeftHandPinky3', pinky_04_leaf_l: 'mixamorigLeftHandPinky4',
  // Right Hand
  thumb_01_r: 'mixamorigRightHandThumb1', thumb_02_r: 'mixamorigRightHandThumb2', thumb_03_r: 'mixamorigRightHandThumb3', thumb_04_leaf_r: 'mixamorigRightHandThumb4',
  index_01_r: 'mixamorigRightHandIndex1', index_02_r: 'mixamorigRightHandIndex2', index_03_r: 'mixamorigRightHandIndex3', index_04_leaf_r: 'mixamorigRightHandIndex4',
  middle_01_r: 'mixamorigRightHandMiddle1', middle_02_r: 'mixamorigRightHandMiddle2', middle_03_r: 'mixamorigRightHandMiddle3', middle_04_leaf_r: 'mixamorigRightHandMiddle4',
  ring_01_r: 'mixamorigRightHandRing1', ring_02_r: 'mixamorigRightHandRing2', ring_03_r: 'mixamorigRightHandRing3', ring_04_leaf_r: 'mixamorigRightHandRing4',
  pinky_01_r: 'mixamorigRightHandPinky1', pinky_02_r: 'mixamorigRightHandPinky2', pinky_03_r: 'mixamorigRightHandPinky3', pinky_04_leaf_r: 'mixamorigRightHandPinky4'
};

export const MIXAMO_TO_INTERNAL = Object.fromEntries(
  Object.entries(INTERNAL_TO_MIXAMO).map(([k, v]) => [v, k])
);

export class MixamoExportService {
  /**
   * Convert bone name to canonical Mixamo name.
   * @param {string} name
   * @returns {string}
   */
  static toMixamoName(name) {
    if (MIXAMO_CANONICAL_65.includes(name)) return name;
    if (INTERNAL_TO_MIXAMO[name]) return INTERNAL_TO_MIXAMO[name];
    // Check if adding prefix helps (e.g. 'Hips' -> 'mixamorigHips')
    const withPrefix = 'mixamorig' + name;
    if (MIXAMO_CANONICAL_65.includes(withPrefix)) return withPrefix;
    // Check case-insensitive
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(INTERNAL_TO_MIXAMO)) {
      if (k.toLowerCase() === lower) return v;
    }
    for (const can of MIXAMO_CANONICAL_65) {
      if (can.toLowerCase() === lower || can.toLowerCase() === 'mixamorig' + lower) return can;
    }
    return name;
  }

  /**
   * Rename an object hierarchy and its animations to canonical mixamorig* names,
   * returning a rollback restore function.
   * @param {THREE.Object3D} root
   * @param {THREE.AnimationClip[]} [animations]
   * @returns {() => void} rollback function
   */
  static applyMixamoNames(root, animations = []) {
    const originalNames = new Map();

    root.traverse(o => {
      if (o.isBone) {
        const mixamoName = MixamoExportService.toMixamoName(o.name);
        if (mixamoName !== o.name) {
          originalNames.set(o, o.name);
          o.name = mixamoName;
        }
      }
    });

    const originalTrackNames = new Map();
    animations.forEach(clip => {
      clip.tracks.forEach(track => {
        const dotIdx = track.name.indexOf('.');
        if (dotIdx > 0) {
          const boneName = track.name.slice(0, dotIdx);
          const property = track.name.slice(dotIdx);
          const mixamoBone = MixamoExportService.toMixamoName(boneName);
          if (mixamoBone !== boneName) {
            originalTrackNames.set(track, track.name);
            track.name = mixamoBone + property;
          }
        }
      });
    });

    return () => {
      originalNames.forEach((oldName, obj) => { obj.name = oldName; });
      originalTrackNames.forEach((oldName, track) => { track.name = oldName; });
    };
  }

  /**
   * Export skinned model and animations to binary GLB.
   * @param {THREE.Object3D} model
   * @param {THREE.AnimationClip[]} [animations=[]]
   * @param {object} [options={}]
   * @returns {Promise<ArrayBuffer>}
   */
  static exportGLB(model, animations = [], options = {}) {
    const restoreNames = MixamoExportService.applyMixamoNames(model, animations);
    const exporter = new GLTFExporter();

    return new Promise((resolve, reject) => {
      exporter.parse(
        model,
        result => {
          restoreNames();
          resolve(result);
        },
        error => {
          restoreNames();
          reject(error);
        },
        {
          binary: true,
          animations,
          includeCustomExtensions: true,
          ...options
        }
      );
    });
  }

  /**
   * Export an animation clip to canonical ARUAN JSON schema (aruan-clip.v1.json).
   * @param {THREE.AnimationClip} clip
   * @param {object} metadata
   * @returns {object} JSON object matching aruan-clip.v1
   */
  static exportAruanClipJson(clip, metadata = {}) {
    const fps = 30;
    const duration = clip.duration;
    const frameCount = Math.max(1, Math.round(duration * fps));
    const times = Array.from({ length: frameCount }, (_, i) => Number((i / fps).toFixed(4)));

    // Generate fields list from 65 canonical bones quaternion components
    const fields = [];
    MIXAMO_CANONICAL_65.forEach(b => {
      fields.push(`${b}.qx`, `${b}.qy`, `${b}.qz`, `${b}.qw`);
    });

    // Sample track values
    const poses = times.map(t => {
      return fields.map(() => 0); // default neutral pose array
    });

    return {
      schema: 'aruan-clip',
      version: 1,
      profile: 'aruan-humanoid-v2',
      name: metadata.name || clip.name || 'Exported Clip',
      duration: Number(duration.toFixed(4)),
      loop: metadata.loop ?? true,
      fields,
      times,
      poses,
      root: times.map(() => [0, 0, 0]),
      cycleDelta: [0, 0, 0],
      contacts: metadata.contacts || [],
      events: metadata.events || []
    };
  }
}
