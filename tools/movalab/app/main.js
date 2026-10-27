/**
 * MovaLab 2.0 Studio — Main Application Controller
 * Connects 5-step workflow, Three.js 3D Viewport, auto-rigging,
 * skinning pipeline, Mixamo catalog, Canvas 2D preview, and game publisher.
 */

import { MovaViewer } from './viewer3d.js';

const $ = id => document.getElementById(id);

// Application state
const state = {
  currentStep: 1,
  viewer: null,
  motions: [],
  filteredMotions: [],
  selectedMotionId: null,
  selectedCategory: 'all',
  selectedStatus: 'all',
  searchQuery: '',
  selectedBoneName: null,
  isDrawerOpen: false
};

function showToast(text, type = 'info') {
  const toast = $('toast');
  toast.textContent = text;
  toast.className = 'show' + (type === 'error' ? ' error' : type === 'success' ? ' success' : '');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.className = '';
  }, 4200);
}

async function api(endpoint, options = {}) {
  const res = await fetch(endpoint, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Resposta inválida do servidor MovaLab.');
  }
  if (!res.ok) throw new Error(data.error || `Erro HTTP ${res.status}`);
  return data;
}

function timeText(sec = 0) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  const ms = String(Math.floor((sec % 1) * 100)).padStart(2, '0');
  return `${m}:${s}.${ms}`;
}

// ===========================================================================
// WORKFLOW STEP NAVIGATION (Steps 1 to 5)
// ===========================================================================

function goToStep(step) {
  state.currentStep = step;

  // Update top workflow tracker buttons
  for (let s = 1; s <= 5; s++) {
    const tab = $(`step-tab-${s}`);
    if (tab) {
      tab.classList.toggle('active', s === step);
      tab.classList.toggle('completed', s < step);
    }
    const pane = $(`step-${s}-pane`);
    if (pane) {
      pane.hidden = s !== step;
    }
  }

  // Update tool panel header title
  const titles = [
    '',
    'Importar Modelo 3D',
    'Escolher Esqueleto Base',
    'Ajustar Rig & Pesos de Skin',
    'Escolher e Testar Animações',
    'Exportar ou Aplicar no ARUAN'
  ];
  $('panel-step-eyebrow').textContent = `ETAPA ${step} DE 5`;
  $('panel-step-title').textContent = titles[step];

  // Viewport context adjustments
  if (state.viewer) {
    if (step === 3) {
      // Step 3: show bone handles, guide planes according to settings
      state.viewer.boneHandles.visible = true;
      if (state.viewer.skeletonHelper) state.viewer.skeletonHelper.visible = true;
      const headCb = $('head-correction-cb');
      const armCb = $('arm-correction-cb');
      state.viewer.setHeadCorrectionPlane(headCb?.checked, Number($('head-height-slider')?.value || 0.75));
      state.viewer.setArmCorrectionPlane(armCb?.checked, Number($('arm-offset-slider')?.value || 0));
    } else {
      state.viewer.setHeadCorrectionPlane(false);
      state.viewer.setArmCorrectionPlane(false);
      state.viewer.detachGizmo();
      if (step > 3) {
        state.viewer.boneHandles.visible = false;
      }
    }

    // Hide empty view if model loaded
    if (state.viewer.character) {
      $('empty-view').style.display = 'none';
    }
  }
}

// ===========================================================================
// INITIALIZATION
// ===========================================================================

window.addEventListener('DOMContentLoaded', async () => {
  const stage = $('stage-viewport');

  // Instantiate 3D Viewport
  state.viewer = new MovaViewer(stage, {
    onWarning: msg => {
      if (msg) showToast(msg, 'info');
    },
    onInfo: info => {
      if (info.meshes) {
        $('viewport-note').textContent = `${info.meshes} malha(s) · ${info.vertices || 0} vértices`;
      }
    },
    onBoneSelect: boneName => {
      state.selectedBoneName = boneName;
      const overlay = $('selected-bone-overlay');
      const nameEl = $('selected-bone-name');
      if (boneName) {
        nameEl.textContent = boneName;
        overlay.style.display = 'block';
      } else {
        overlay.style.display = 'none';
      }
      updateUndoRedoButtons();
    },
    onTimeUpdate: (current, duration) => {
      $('player-timecode').textContent = `${timeText(current)} / ${timeText(duration)}`;
      if (duration > 0) {
        $('player-scrubber').value = (current / duration).toString();
      }
    }
  });

  setupNavigationEvents();
  setupStep1Events();
  setupStep2Events();
  setupStep3Events();
  setupStep4Events();
  setupStep5Events();
  setupPlayerEvents();
  setupDrawerEvents();
  setupKeyboardShortcuts();

  // Load animation catalog from server
  await loadCatalog();

  showToast('MovaLab 2.0 Studio pronto!', 'success');
});

// ===========================================================================
// STEP 1: IMPORT MODEL
// ===========================================================================

function setupStep1Events() {
  const uploadInput = $('model-upload');
  const dropzone = $('upload-dropzone');

  uploadInput.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast(`Carregando ${file.name}...`, 'info');
      const stats = await state.viewer.loadModelFromFile(file);
      onModelLoaded(file.name, stats);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', async e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      try {
        showToast(`Carregando ${file.name}...`, 'info');
        const stats = await state.viewer.loadModelFromFile(file);
        onModelLoaded(file.name, stats);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });

  $('btn-load-ref').addEventListener('click', async () => {
    const url = $('ref-model-select').value;
    try {
      showToast('Carregando modelo de referência...', 'info');
      const stats = await state.viewer.loadModelFromUrl(url);
      onModelLoaded(url.split('/').pop(), stats);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  $('btn-empty-load-human').addEventListener('click', async () => {
    try {
      showToast('Carregando modelo humano base...', 'info');
      const stats = await state.viewer.loadModelFromUrl('/templates/models/model-human.glb');
      onModelLoaded('model-human.glb', stats);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Rotation buttons
  $('btn-rot-x').addEventListener('click', () => state.viewer.rotateModel('x', 90));
  $('btn-rot-y').addEventListener('click', () => state.viewer.rotateModel('y', 90));
  $('btn-rot-z').addEventListener('click', () => state.viewer.rotateModel('z', 90));

  // Placement buttons
  $('btn-align-floor').addEventListener('click', () => state.viewer.alignModelToFloor());
  $('btn-reset-pos').addEventListener('click', () => state.viewer.resetModelPosition());

  // Proceed button
  $('btn-to-step-2').addEventListener('click', async () => {
    goToStep(2);
    // Automatically load template skeleton if none loaded
    if (!state.viewer.templateSkeleton) {
      await loadCurrentTemplateSkeleton();
    }
  });
}

function onModelLoaded(name, stats) {
  $('empty-view').style.display = 'none';
  $('btn-to-step-2').disabled = false;
  $('viewport-title').textContent = name;

  const pre = $('analysis-pre');
  if (stats) {
    pre.textContent = [
      `Nome: ${name}`,
      `Malhas: ${stats.meshes} (${stats.skinned} skinned)`,
      `Vértices: ${stats.vertices.toLocaleString('pt-BR')}`,
      `Triângulos: ${stats.triangles.toLocaleString('pt-BR')}`,
      `Dimensões: ${stats.width} × ${stats.height} × ${stats.depth} cm`,
      `Rig Existente: ${stats.hasRig ? `SIM (${stats.existingBones} ossos)` : 'NÃO (Pronto para auto-rig)'}`
    ].join('\n');
    $('analysis-summary').textContent = `Diagnóstico: ${stats.vertices.toLocaleString('pt-BR')} vértices · ${stats.hasRig ? 'Com Rig' : 'Sem Rig'}`;
  }

  showToast(`Modelo ${name} importado com sucesso!`, 'success');
}

// ===========================================================================
// STEP 2: CHOOSE SKELETON
// ===========================================================================

function setupStep2Events() {
  $('skeleton-template-select').addEventListener('change', async () => {
    await loadCurrentTemplateSkeleton();
  });

  $('hand-options-select').addEventListener('change', async () => {
    await loadCurrentTemplateSkeleton();
  });

  const scaleSlider = $('skeleton-scale-slider');
  scaleSlider.addEventListener('input', e => {
    const val = Number(e.target.value);
    $('skeleton-scale-label').textContent = `${Math.round(val * 100)}%`;
    state.viewer.scaleSkeleton(val);
  });

  $('btn-reset-skeleton-scale').addEventListener('click', () => {
    scaleSlider.value = '1.0';
    $('skeleton-scale-label').textContent = '100%';
    state.viewer.scaleSkeleton(1.0);
  });

  $('btn-autofit-skeleton').addEventListener('click', () => {
    state.viewer.autoFitSkeleton();
    showToast('Esqueleto ajustado aos limites da malha!', 'info');
  });

  $('btn-back-to-1').addEventListener('click', () => goToStep(1));
  $('btn-to-step-3').addEventListener('click', () => goToStep(3));
}

async function loadCurrentTemplateSkeleton() {
  const template = $('skeleton-template-select').value;
  const hand = $('hand-options-select').value;
  try {
    showToast('Carregando esqueleto template...', 'info');
    await state.viewer.loadSkeletonTemplate(template, hand);
    showToast('Esqueleto carregado e alinhado!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===========================================================================
// STEP 3: ADJUST RIG & SKINNING
// ===========================================================================

function setupStep3Events() {
  // Positioning mode (Mesh volume raycast vs Gizmo)
  const posVolume = $('pos-mode-volume');
  const posGizmo = $('pos-mode-gizmo');
  const gizmoOptions = $('gizmo-options-row');

  function updatePosMode() {
    state.viewer.positioningMode = posVolume.checked ? 'volume' : 'gizmo';
    gizmoOptions.style.display = posGizmo.checked ? 'flex' : 'none';
    if (posGizmo.checked && state.viewer.selectedBone) {
      state.viewer.transformControls.attach(state.viewer.selectedBone);
    } else {
      state.viewer.detachGizmo();
    }
  }

  posVolume.addEventListener('change', updatePosMode);
  posGizmo.addEventListener('change', updatePosMode);

  // Gizmo manipulation type
  $('gizmo-translate').addEventListener('change', () => {
    state.viewer.transformControls.setMode('translate');
  });
  $('gizmo-rotate').addEventListener('change', () => {
    state.viewer.transformControls.setMode('rotate');
  });

  // Move bone children
  $('child-move-yes').addEventListener('change', () => {
    state.viewer.independentChildren = false;
  });
  $('child-move-no').addEventListener('change', () => {
    state.viewer.independentChildren = true;
  });

  // Mirror symmetry
  $('mirror-skeleton-cb').addEventListener('change', e => {
    state.viewer.mirrorSkeleton = e.target.checked;
  });

  // Display mode
  document.querySelectorAll('input[name="mesh-display"]').forEach(input => {
    input.addEventListener('change', e => {
      state.viewer.setDisplayMode(e.target.value);
    });
  });

  // Head weight correction controls
  const headCb = $('head-correction-cb');
  const headSlider = $('head-height-slider');
  function updateHeadPlane() {
    const val = Number(headSlider.value);
    $('head-height-label').textContent = val.toFixed(2);
    state.viewer.setHeadCorrectionPlane(headCb.checked, val);
  }
  headCb.addEventListener('change', updateHeadPlane);
  headSlider.addEventListener('input', updateHeadPlane);

  // Arm plane correction controls
  const armCb = $('arm-correction-cb');
  const armSlider = $('arm-offset-slider');
  function updateArmPlane() {
    const val = Number(armSlider.value);
    $('arm-offset-label').textContent = val.toFixed(2);
    state.viewer.setArmCorrectionPlane(armCb.checked, val);
  }
  armCb.addEventListener('change', updateArmPlane);
  armSlider.addEventListener('input', updateArmPlane);

  // Undo / Redo
  $('btn-undo').addEventListener('click', () => {
    if (state.viewer.undo()) {
      showToast('Desfeito', 'info');
      updateUndoRedoButtons();
    }
  });
  $('btn-redo').addEventListener('click', () => {
    if (state.viewer.redo()) {
      showToast('Refeito', 'info');
      updateUndoRedoButtons();
    }
  });

  // Bind Pose / Calculate Weights
  $('btn-bind-pose').addEventListener('click', () => {
    try {
      showToast('Calculando pesos de deformação e conectando malha...', 'info');
      const result = state.viewer.applySkinning({
        useHeadCorrection: headCb.checked,
        headHeight: Number(headSlider.value),
        useArmCorrection: armCb.checked,
        armPlaneOffset: Number(armSlider.value)
      });
      showToast(`Skin aplicado! ${result.vertices} vértices vinculados a ${result.bones} ossos.`, 'success');
      goToStep(4);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  $('btn-back-to-2').addEventListener('click', () => goToStep(2));
}

function updateUndoRedoButtons() {
  const undoBtn = $('btn-undo');
  const redoBtn = $('btn-redo');
  if (state.viewer) {
    undoBtn.disabled = !state.viewer.undoRedo.canUndo();
    redoBtn.disabled = !state.viewer.undoRedo.canRedo();
  }
}

// ===========================================================================
// STEP 4: ANIMATIONS & AUTHORING
// ===========================================================================

async function loadCatalog() {
  try {
    const data = await api('/api/motions');
    state.motions = data.motions || [];
    renderMotionList();
  } catch (err) {
    console.warn('Erro ao ler motions do servidor:', err);
  }
}

function setupStep4Events() {
  $('search-animations').addEventListener('input', e => {
    state.searchQuery = e.target.value.toLowerCase();
    renderMotionList();
  });

  $('category-filter').addEventListener('change', e => {
    state.selectedCategory = e.target.value;
    renderMotionList();
  });

  $('status-filter').addEventListener('change', e => {
    state.selectedStatus = e.target.value;
    renderMotionList();
  });

  $('motion-inplace-cb').addEventListener('change', e => {
    state.viewer.setInPlace(e.target.checked);
  });

  $('motion-wireframe-cb').addEventListener('change', e => {
    state.viewer.setWireframe(e.target.checked);
  });

  $('btn-open-canvas-drawer').addEventListener('click', () => {
    setCanvasDrawerOpen(true);
  });

  $('btn-back-to-3').addEventListener('click', () => goToStep(3));
  $('btn-to-step-5').addEventListener('click', () => goToStep(5));
}

function renderMotionList() {
  const container = $('motion-list');
  container.innerHTML = '';

  const filtered = state.motions.filter(m => {
    const matchCat = state.selectedCategory === 'all' || m.category === state.selectedCategory;
    const matchStatus = state.selectedStatus === 'all' || m.status === state.selectedStatus;
    const matchSearch =
      !state.searchQuery ||
      m.name.toLowerCase().includes(state.searchQuery) ||
      (m.namePt && m.namePt.toLowerCase().includes(state.searchQuery));
    return matchCat && matchStatus && matchSearch;
  });

  if (!filtered.length) {
    container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem;">Nenhuma animação encontrada.</div>';
    return;
  }

  for (const motion of filtered.slice(0, 80)) {
    const card = document.createElement('div');
    card.className = `motion-card-item${state.selectedMotionId === motion.id ? ' active' : ''}`;
    card.innerHTML = `
      <div class="motion-card-icon">▶</div>
      <div class="motion-card-info">
        <div class="motion-card-title">${motion.namePt || motion.name}</div>
        <div class="motion-card-meta">${motion.duration?.toFixed(2) || '0.00'}s · ${motion.bones || 65} ossos</div>
      </div>
      <div class="motion-card-tag">${motion.category || 'Geral'}</div>
    `;

    card.addEventListener('click', () => selectMotion(motion));
    container.append(card);
  }
}

async function selectMotion(motion) {
  state.selectedMotionId = motion.id;
  renderMotionList();

  $('sel-motion-title').textContent = motion.namePt || motion.name;
  $('sel-motion-meta').textContent = `${motion.duration?.toFixed(2)}s · Formato ${motion.format?.toUpperCase() || 'FBX'}`;
  $('player-clip-name').textContent = motion.namePt || motion.name;

  try {
    showToast(`Carregando animação ${motion.name}...`, 'info');
    const url = motion.url || `/api/motions/file?id=${encodeURIComponent(motion.id)}`;
    await state.viewer.loadMotion(url, motion.format);
    state.viewer.play();
    $('player-play-btn').textContent = '❚❚';
    showToast('Animação em reprodução!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===========================================================================
// STEP 5: EXPORT OR APPLY TO ARUAN
// ===========================================================================

function setupStep5Events() {
  $('btn-export-glb').addEventListener('click', async () => {
    try {
      showToast('Gerando GLB canônico Mixamo 65 ossos...', 'info');
      const blob = await state.viewer.exportGLB();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aruan-character-mixamo.glb';
      a.click();
      URL.revokeObjectURL(url);
      showToast('GLB exportado com sucesso!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  $('btn-export-aruan-json').addEventListener('click', () => {
    try {
      const json = state.viewer.exportAruanJSON();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aruan-clip-${state.selectedMotionId || 'motion'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('JSON ARUAN exportado com sucesso!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  $('btn-publish-game').addEventListener('click', async () => {
    if (!state.selectedMotionId) {
      showToast('Selecione uma animação na Etapa 4 primeiro.', 'error');
      return;
    }
    const slot = $('publish-slot-select').value;
    const pad = $('publish-pad-select').value;
    const key = $('publish-key-select').value;

    try {
      showToast('Aplicando animação ao jogo...', 'info');
      const res = await api('/api/movalab/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motionId: state.selectedMotionId,
          slot,
          padButton: slot === 'action' ? pad : null,
          keyButton: slot === 'action' ? key : null
        })
      });
      $('publish-status-feedback').textContent = `✓ Ativada no slot "${slot}" com sucesso!`;
      showToast('Animação publicada no ARUAN! Abra o jogo para testar.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  $('btn-publish-reset').addEventListener('click', async () => {
    try {
      await api('/api/movalab/bindings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true })
      });
      $('publish-status-feedback').textContent = 'Vínculos restaurados para o padrão original.';
      showToast('Animações originais restauradas!', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  $('btn-back-to-4').addEventListener('click', () => goToStep(4));
}

// ===========================================================================
// TRANSPORT PLAYER & CONTROLS
// ===========================================================================

function setupPlayerEvents() {
  const playBtn = $('player-play-btn');
  const rewindBtn = $('player-rewind-btn');
  const scrubber = $('player-scrubber');
  const loopBtn = $('player-loop-btn');
  const speedSelect = $('player-speed-select');
  const gridBtn = $('player-grid-toggle');

  playBtn.addEventListener('click', () => {
    if (state.viewer.playing) {
      state.viewer.pause();
      playBtn.textContent = '▶';
    } else {
      state.viewer.play();
      playBtn.textContent = '❚❚';
    }
  });

  rewindBtn.addEventListener('click', () => {
    state.viewer.setTime(0);
  });

  scrubber.addEventListener('input', e => {
    const ratio = Number(e.target.value);
    state.viewer.setTime(ratio * state.viewer.duration);
  });

  loopBtn.addEventListener('click', () => {
    state.viewer.setLoop(!state.viewer.loop);
    loopBtn.classList.toggle('outline-button', !state.viewer.loop);
    showToast(state.viewer.loop ? 'Repetição em loop ligada' : 'Repetição desligada', 'info');
  });

  speedSelect.addEventListener('change', e => {
    state.viewer.setSpeed(Number(e.target.value));
  });

  gridBtn.addEventListener('click', () => {
    const isVisible = state.viewer.grid.visible;
    state.viewer.setGridVisible(!isVisible);
    gridBtn.classList.toggle('outline-button', isVisible);
  });
}

// ===========================================================================
// CANVAS 2D DRAWER
// ===========================================================================

function setCanvasDrawerOpen(open) {
  state.isDrawerOpen = open;
  $('canvas-comparison-drawer').classList.toggle('open', open);
}

function setupDrawerEvents() {
  $('btn-close-canvas-drawer').addEventListener('click', () => {
    setCanvasDrawerOpen(false);
  });

  const hipSlider = $('proc-hip-height');
  const armSlider = $('proc-arm-swing');
  const strideSlider = $('proc-stride');

  hipSlider.addEventListener('input', e => {
    $('label-hip-height').textContent = Number(e.target.value).toFixed(1);
    postToCanvasPreview({ type: 'hipHeight', value: Number(e.target.value) });
  });

  armSlider.addEventListener('input', e => {
    $('label-arm-swing').textContent = Number(e.target.value).toFixed(2);
    postToCanvasPreview({ type: 'armSwing', value: Number(e.target.value) });
  });

  strideSlider.addEventListener('input', e => {
    $('label-stride').textContent = Number(e.target.value).toFixed(2);
    postToCanvasPreview({ type: 'stride', value: Number(e.target.value) });
  });

  $('proc-foot-lock').addEventListener('change', e => {
    postToCanvasPreview({ type: 'footLock', value: e.target.checked });
  });
}

function postToCanvasPreview(msg) {
  const iframe = $('canvas-preview-iframe');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(msg, '*');
  }
}

// ===========================================================================
// NAVIGATION & TOPBAR
// ===========================================================================

function setupNavigationEvents() {
  for (let s = 1; s <= 5; s++) {
    const btn = $(`step-tab-${s}`);
    if (btn) {
      btn.addEventListener('click', () => goToStep(s));
    }
  }

  $('top-reset-cam').addEventListener('click', () => {
    state.viewer.frameCamera();
  });

  $('refresh-folder').addEventListener('click', async () => {
    showToast('Atualizando arquivos do workspace...', 'info');
    await loadCatalog();
    showToast('Biblioteca atualizada!', 'success');
  });

  // Quick view radio buttons
  document.querySelectorAll('input[name="quick-view"]').forEach(input => {
    input.addEventListener('change', e => {
      state.viewer.setDisplayMode(e.target.value);
    });
  });
}

// ===========================================================================
// KEYBOARD SHORTCUTS
// ===========================================================================

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', e => {
    // Avoid triggering when typing in inputs
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      $('player-play-btn').click();
    } else if (e.ctrlKey && e.code === 'KeyZ') {
      e.preventDefault();
      $('btn-undo').click();
    } else if (e.ctrlKey && e.code === 'KeyY') {
      e.preventDefault();
      $('btn-redo').click();
    } else if (e.code === 'Digit1') {
      goToStep(1);
    } else if (e.code === 'Digit2') {
      goToStep(2);
    } else if (e.code === 'Digit3') {
      goToStep(3);
    } else if (e.code === 'Digit4') {
      goToStep(4);
    } else if (e.code === 'Digit5') {
      goToStep(5);
    }
  });
}
