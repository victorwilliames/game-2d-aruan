'use strict';
/**
 * Test suite for MovaLab 2.0 Skinning, Rigging, and Auto-Rig Pipeline.
 */
const assert = require('node:assert/strict');

async function runTests() {
  const THREE = await import('three');
  const { BoneClassifier, BoneCategory } = await import('../app/skinning/bone-classifier.js');
  const { WeightCalculator } = await import('../app/skinning/weight-calculator.js');
  const { ExtremityWeightCorrector } = await import('../app/skinning/extremity-corrector.js');
  const { ArmWeightCorrector } = await import('../app/skinning/arm-corrector.js');
  const { HeadWeightCorrector } = await import('../app/skinning/head-corrector.js');
  const { WeightSmoother } = await import('../app/skinning/weight-smoother.js');
  const { WeightNormalizer } = await import('../app/skinning/weight-normalizer.js');
  const { SkinningPipeline } = await import('../app/skinning/skinning-pipeline.js');
  const { UndoRedoSystem } = await import('../app/skinning/undo-redo.js');
  const { IndependentBoneMovement } = await import('../app/skinning/independent-movement.js');
  const { MixamoExportService, MIXAMO_CANONICAL_65 } = await import('../app/skinning/mixamo-export.js');
  const { RigTemplateService, RIG_TEMPLATES } = await import('../app/skinning/rig-templates.js');

  console.log('--- TEST 1: BoneClassifier ---');
  const testBones = [
    { name: 'root' },
    { name: 'mixamorigHips' },
    { name: 'mixamorigSpine1' },
    { name: 'mixamorigHead' },
    { name: 'mixamorigLeftArm' },
    { name: 'mixamorigLeftForeArm' },
    { name: 'mixamorigLeftHand' },
    { name: 'mixamorigLeftHandIndex1' },
    { name: 'mixamorigRightUpLeg' },
    { name: 'mixamorigRightFoot' }
  ];
  const classifier = new BoneClassifier(testBones);
  assert.equal(classifier.get_category(0), BoneCategory.Root);
  assert.equal(classifier.get_category(1), BoneCategory.Torso);
  assert.equal(classifier.get_category(2), BoneCategory.Torso);
  assert.equal(classifier.get_category(3), BoneCategory.Torso);
  assert.equal(classifier.get_category(4), BoneCategory.Limb);
  assert.equal(classifier.get_category(5), BoneCategory.Limb);
  assert.equal(classifier.get_category(6), BoneCategory.Extremity);
  assert.equal(classifier.get_category(7), BoneCategory.Extremity);
  assert.equal(classifier.get_category(8), BoneCategory.Limb);
  assert.equal(classifier.get_category(9), BoneCategory.Extremity);
  assert.equal(classifier.is_extremity_boundary(6, 7), true, 'hand <-> finger is extremity boundary');
  assert.equal(classifier.is_extremity_boundary(5, 6), false, 'forearm <-> hand is NOT extremity-only');
  assert.equal(classifier.is_torso_boundary(1, 2), true, 'hips <-> spine is torso boundary');
  console.log('OK: BoneClassifier categorizes Mixamo 65 bones correctly.');

  console.log('--- TEST 2: WeightNormalizer ---');
  const geom = new THREE.BoxGeometry(10, 10, 10);
  const normalizer = new WeightNormalizer(geom);
  const testWeights = [
    0.5, 0.3, 0.1, 0.0,
    0.005, 0.002, 0.0, 0.0,
    0.8, 0.4, 0.0, 0.0
  ];
  normalizer.normalize_weights(testWeights);
  assert.ok(Math.abs(testWeights[0] + testWeights[1] + testWeights[2] + testWeights[3] - 1.0) < 1e-4);
  assert.ok(Math.abs(testWeights[4] + testWeights[5] + testWeights[6] + testWeights[7] - 1.0) < 1e-4);
  assert.ok(Math.abs(testWeights[8] + testWeights[9] + testWeights[10] + testWeights[11] - 1.0) < 1e-4);
  const errors = normalizer.find_vertices_with_incorrect_weight_sum(testWeights);
  assert.equal(errors.length, 0, 'No vertices with incorrect sum');
  console.log('OK: WeightNormalizer normalizes and prunes correctly.');

  console.log('--- TEST 3: HeadWeightCorrector (Chibi protection) ---');
  const headGeom = new THREE.BufferGeometry();
  const positions = new Float32Array([
    0, 150, 0,
    0, 50, 0
  ]);
  headGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const headBone = new THREE.Bone(); headBone.name = 'mixamorigHead';
  const armBone = new THREE.Bone(); armBone.name = 'mixamorigLeftArm';
  const headBones = [headBone, armBone];
  const headIndices = [
    1, 0, 0, 0,
    1, 0, 0, 0
  ];
  const headWeights = [
    1.0, 0, 0, 0,
    1.0, 0, 0, 0
  ];
  const headCorrector = new HeadWeightCorrector(headGeom, headBones, 120);
  headCorrector.apply_head_weight_correction(headIndices, headWeights);
  assert.equal(headIndices[0], 0, 'Vertex 0 reassigned to head bone (0)');
  assert.equal(headIndices[4], 1, 'Vertex 1 kept on arm bone (1)');
  console.log('OK: HeadWeightCorrector protects Chibi heads from arm pull.');

  console.log('--- TEST 4: Undo / Redo System ---');
  const boneA = new THREE.Bone(); boneA.name = 'BoneA'; boneA.position.set(0, 0, 0);
  const boneB = new THREE.Bone(); boneB.name = 'BoneB'; boneB.position.set(0, 10, 0);
  boneA.add(boneB);
  const undoSkeleton = new THREE.Skeleton([boneA, boneB]);
  const undoSys = new UndoRedoSystem();
  undoSys.setSkeleton(undoSkeleton);
  assert.equal(undoSys.canUndo(), false);
  undoSys.pushState();
  boneB.position.set(5, 15, 0);
  undoSys.pushState();
  boneB.position.set(20, 30, 0);
  assert.equal(undoSys.canUndo(), true);
  undoSys.undo();
  assert.equal(boneB.position.x, 5);
  undoSys.undo();
  assert.equal(boneB.position.x, 0);
  assert.equal(undoSys.canRedo(), true);
  undoSys.redo();
  assert.equal(boneB.position.x, 5);
  console.log('OK: Undo / Redo restores bone poses faithfully.');

  console.log('--- TEST 5: Symmetry & Independent Movement ---');
  const leftArm = new THREE.Bone(); leftArm.name = 'mixamorigLeftArm'; leftArm.position.set(20, 100, 0);
  const rightArm = new THREE.Bone(); rightArm.name = 'mixamorigRightArm'; rightArm.position.set(-20, 100, 0);
  const symSkeleton = new THREE.Skeleton([leftArm, rightArm]);
  const mirror = IndependentBoneMovement.findMirrorBone(leftArm, symSkeleton);
  assert.equal(mirror.name, 'mixamorigRightArm', 'Left arm mirrors to Right arm');
  leftArm.position.set(25, 105, 5);
  IndependentBoneMovement.applyMirror(leftArm, mirror);
  assert.equal(mirror.position.x, -25);
  assert.equal(mirror.position.y, 105);
  assert.equal(mirror.position.z, 5);
  console.log('OK: Symmetric mirror bone detection and transform reflection verified.');

  console.log('--- TEST 6: Mixamo 65 Canonical Mapping & ARUAN JSON Export ---');
  assert.equal(MIXAMO_CANONICAL_65.length, 65, 'Exact 65 bones in canonical contract');
  assert.equal(MixamoExportService.toMixamoName('pelvis'), 'mixamorigHips');
  assert.equal(MixamoExportService.toMixamoName('upperarm_l'), 'mixamorigLeftArm');
  assert.equal(MixamoExportService.toMixamoName('hand_r'), 'mixamorigRightHand');
  assert.equal(MixamoExportService.toMixamoName('mixamorigLeftHandIndex1'), 'mixamorigLeftHandIndex1');

  const clip = new THREE.AnimationClip('TestAttack', 1.0, []);
  const aruanJson = MixamoExportService.exportAruanClipJson(clip, { name: 'Aruan Ataque 1', loop: false });
  assert.equal(aruanJson.schema, 'aruan-clip');
  assert.equal(aruanJson.version, 1);
  assert.equal(aruanJson.profile, 'aruan-humanoid-v2');
  assert.equal(aruanJson.fields.length, 65 * 4, 'All 65 bones quaternion components exported');
  assert.equal(aruanJson.name, 'Aruan Ataque 1');
  console.log('OK: Mixamo 65 mapping and ARUAN clip JSON format verified.');

  console.log('--- TEST 7: RigTemplateService & Auto-Fit Bounds ---');
  assert.ok(RIG_TEMPLATES.length >= 6, 'Contains Human, Fox, Bird, Dragon, Kaiju, Spider');
  const dummyMesh = new THREE.Mesh(new THREE.BoxGeometry(40, 160, 30));
  dummyMesh.position.set(0, 80, 0);
  const dummySkelRoot = new THREE.Group();
  const dummySkelBone1 = new THREE.Bone(); dummySkelBone1.position.set(0, 0, 0);
  const dummySkelBone2 = new THREE.Bone(); dummySkelBone2.position.set(0, 100, 0);
  dummySkelRoot.add(dummySkelBone1);
  dummySkelBone1.add(dummySkelBone2);
  const fitResult = RigTemplateService.autoFitSkeletonToMesh(dummySkelRoot, dummyMesh);
  assert.ok(fitResult.scale > 1.5, 'Skeleton scaled up to match mesh height');
  console.log('OK: Auto-fit aligns scale and position to mesh bounds.');

  console.log('--- TEST 8: Full SkinningPipeline End-to-End ---');
  const charGeom = new THREE.CylinderGeometry(15, 15, 180, 8, 16);
  const rootBone = new THREE.Bone(); rootBone.name = 'root'; rootBone.position.set(0, 0, 0);
  const hipsBone = new THREE.Bone(); hipsBone.name = 'mixamorigHips'; hipsBone.position.set(0, 90, 0);
  const spineBone = new THREE.Bone(); spineBone.name = 'mixamorigSpine'; spineBone.position.set(0, 120, 0);
  const headBoneReal = new THREE.Bone(); headBoneReal.name = 'mixamorigHead'; headBoneReal.position.set(0, 160, 0);
  rootBone.add(hipsBone);
  hipsBone.add(spineBone);
  spineBone.add(headBoneReal);
  const skeleton = new THREE.Skeleton([rootBone, hipsBone, spineBone, headBoneReal]);

  const pipeline = new SkinningPipeline(skeleton.bones, charGeom, {
    skeletonType: 'human',
    useHeadCorrection: true,
    headPlaneHeight: 140
  });
  const res = pipeline.compute();
  assert.ok(res.indices.length === charGeom.attributes.position.count * 4);
  assert.ok(res.weights.length === charGeom.attributes.position.count * 4);

  const charMesh = new THREE.Mesh(charGeom, new THREE.MeshBasicMaterial());
  const skinned = SkinningPipeline.applySkinning(charMesh, skeleton);
  assert.ok(skinned.isSkinnedMesh, 'Returned object is SkinnedMesh');
  assert.ok(charGeom.attributes.skinIndex, 'skinIndex attribute created');
  assert.ok(charGeom.attributes.skinWeight, 'skinWeight attribute created');
  const colors = SkinningPipeline.generateWeightColors(charGeom, 3);
  assert.ok(colors && colors.length === charGeom.attributes.position.count * 3);
  console.log('OK: SkinningPipeline completed successfully and generated SkinnedMesh with weights!');
}

runTests().catch(err => {
  console.error('Skinning test FAILED:', err);
  process.exitCode = 1;
});
