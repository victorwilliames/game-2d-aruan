#!/usr/bin/env node
/**
 * MovaLab 2.0 - AI Agent CLI & Authoring API
 * Enables AI coding agents to inspect, autorig, edit, sequence combos, validate, and publish
 * animations to the ARUAN engine and catalog.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WORKSPACE = path.resolve(process.env.MOVALAB_WORKSPACE || path.join(ROOT, 'workspace'));

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (fallback !== null) return fallback;
    throw err;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp-' + process.pid;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  await fs.rename(tmp, file);
}

// 1. LIST: Characters, Rigs, and Animations
async function cmdList() {
  const library = await readJson(path.join(WORKSPACE, 'library.json'), { motions: [] });
  const clips = await readJson(path.join(WORKSPACE, 'clips.json'), { clips: [] });
  const bindings = await readJson(path.join(WORKSPACE, 'game-bindings.json'), { bindings: {} });

  const templates = [
    { id: 'human', name: 'Humano (Mixamo 65 ossos)', bones: 65, isHumanoid: true },
    { id: 'fox', name: 'Raposa / Quadrúpede (Fox)', bones: 38, isHumanoid: false },
    { id: 'bird', name: 'Pássaro (Bird)', bones: 28, isHumanoid: false },
    { id: 'dragon', name: 'Dragão / Criatura Alada (Dragon)', bones: 48, isHumanoid: false },
    { id: 'kaiju', name: 'Monstro / Bípede Gigante (Kaiju)', bones: 34, isHumanoid: false }
  ];

  const characters = [
    'cabecudo.fbx', 'gordo.fbx', 'kid.fbx', 'male-realista.fbx', 'theboss.fbx', 'y-bot.fbx'
  ];

  const output = {
    totalMotions: library.motions.length,
    totalProceduralClips: clips.clips.length,
    templates,
    characters,
    activeBindings: bindings.bindings,
    sampleMotions: library.motions.slice(0, 10).map(m => ({ id: m.id, name: m.name, duration: m.duration, category: m.category }))
  };

  console.log(JSON.stringify(output, null, 2));
}

// 2. INSPECT: Inspect an animation clip or procedural JSON
async function cmdInspect(clipIdOrFile) {
  if (!clipIdOrFile) {
    console.error('Usage: movalab-cli inspect <clipIdOrFile>');
    process.exit(1);
  }

  let clip = null;
  // Check if file exists
  try {
    clip = JSON.parse(await fs.readFile(clipIdOrFile, 'utf8'));
  } catch {
    // Look up in clips.json or exports
    const clipsIndex = await readJson(path.join(WORKSPACE, 'clips.json'), { clips: [] });
    const entry = clipsIndex.clips.find(c => c.id === clipIdOrFile || c.name === clipIdOrFile);
    if (entry) {
      clip = await readJson(path.join(WORKSPACE, 'exports', entry.filename));
    }
  }

  if (!clip) {
    console.error(`Clip not found: ${clipIdOrFile}`);
    process.exit(1);
  }

  const report = {
    name: clip.name,
    schema: clip.schema,
    version: clip.version,
    profile: clip.profile,
    duration: clip.duration,
    frameCount: clip.times ? clip.times.length : (clip.frames ? clip.frames.length : 0),
    boneChannels: clip.fields ? clip.fields.length : (clip.bones ? clip.bones.length : 0),
    events: clip.events || [],
    contacts: clip.contacts || []
  };

  console.log(JSON.stringify(report, null, 2));
}

// 3. EDIT: Trim, retime, add event markers (e.g. activeStart, activeEnd for combat)
async function cmdEdit(clipId, args) {
  const clipsIndex = await readJson(path.join(WORKSPACE, 'clips.json'), { schemaVersion: 1, clips: [] });
  const entry = clipsIndex.clips.find(c => c.id === clipId || c.name === clipId);
  if (!entry) {
    console.error(`Clip not found: ${clipId}`);
    process.exit(1);
  }

  const filePath = path.join(WORKSPACE, 'exports', entry.filename);
  const clip = await readJson(filePath);

  // Parse args
  let trimStart = 0;
  let trimEnd = clip.duration;
  let speed = 1.0;
  const newMarkers = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--trim-start' && args[i + 1]) trimStart = parseFloat(args[++i]);
    if (args[i] === '--trim-end' && args[i + 1]) trimEnd = parseFloat(args[++i]);
    if (args[i] === '--speed' && args[i + 1]) speed = parseFloat(args[++i]);
    if (args[i] === '--marker' && args[i + 1]) {
      const [tStr, name] = args[++i].split(':');
      newMarkers.push({ t: parseFloat(tStr), name });
    }
  }

  // Apply edits
  if (trimEnd > trimStart) {
    clip.duration = Number(((trimEnd - trimStart) / speed).toFixed(4));
  }
  if (!clip.events) clip.events = [];
  newMarkers.forEach(m => clip.events.push(m));

  await writeJson(filePath, clip);
  console.log(JSON.stringify({ ok: true, message: `Clip ${clip.name} updated successfully`, clip: { duration: clip.duration, events: clip.events } }));
}

// 4. COMBO: Assemble attack chains (e.g. X1 -> X2 -> X3 for Mission #92)
async function cmdCombo(clipsNames, outputName) {
  if (clipsNames.length < 2) {
    console.error('Usage: movalab-cli combo <clip1> <clip2> ... --name <comboName>');
    process.exit(1);
  }

  const comboSequence = {
    schema: 'aruan-combo-sequence',
    version: 1,
    name: outputName || 'Aruan Combo Chain',
    profile: 'aruan-humanoid-v2',
    steps: clipsNames.map((name, idx) => ({
      stepIndex: idx + 1,
      attackSlot: `X${idx + 1}`,
      sourceClip: name,
      cancelWindowStart: 0.65,
      activeHitStart: 0.18,
      activeHitEnd: 0.38,
      staminaCost: 15 + idx * 5,
      blendTransitionSec: 0.12
    })),
    createdAt: new Date().toISOString()
  };

  const comboFile = path.join(WORKSPACE, 'exports', `${(outputName || 'combo').toLowerCase().replace(/\s+/g, '-')}.aruan-combo.json`);
  await writeJson(comboFile, comboSequence);
  console.log(JSON.stringify({ ok: true, comboFile, sequence: comboSequence }, null, 2));
}

// 5. VALIDATE: Check against mixamorig65.v1 contract
async function cmdValidate(clipIdOrFile) {
  let clip = null;
  try {
    clip = JSON.parse(await fs.readFile(clipIdOrFile, 'utf8'));
  } catch {
    const clipsIndex = await readJson(path.join(WORKSPACE, 'clips.json'), { clips: [] });
    const entry = clipsIndex.clips.find(c => c.id === clipIdOrFile || c.name === clipIdOrFile);
    if (entry) clip = await readJson(path.join(WORKSPACE, 'exports', entry.filename));
  }

  if (!clip) {
    console.error(`Clip not found: ${clipIdOrFile}`);
    process.exit(1);
  }

  const issues = [];
  if (clip.schema !== 'aruan-clip') issues.push('Invalid schema (expected "aruan-clip")');
  if (clip.profile !== 'aruan-humanoid-v2') issues.push('Profile must be "aruan-humanoid-v2"');
  if (!Array.isArray(clip.times) || clip.times.length === 0) issues.push('Missing times array');
  if (!Array.isArray(clip.poses) || clip.poses.length !== clip.times.length) issues.push('Poses length must match times length');

  const valid = issues.length === 0;
  console.log(JSON.stringify({ valid, issues, clipName: clip.name, duration: clip.duration }));
}

// 6. PUBLISH: Bind to game slot (Idle, Walk, Run, Action)
async function cmdPublish(clipId, slot, padButton, key) {
  const bindingsPath = path.join(WORKSPACE, 'game-bindings.json');
  const bindings = await readJson(bindingsPath, { schemaVersion: 1, bindings: {} });

  bindings.bindings[slot] = {
    clipId,
    padButton: padButton || null,
    key: key || null,
    appliedAt: new Date().toISOString()
  };

  await writeJson(bindingsPath, bindings);
  console.log(JSON.stringify({ ok: true, message: `Bound ${clipId} to slot ${slot}`, bindings: bindings.bindings }));
}

// CLI Router
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'list';

  switch (command) {
    case 'list':
      await cmdList();
      break;
    case 'inspect':
      await cmdInspect(args[1]);
      break;
    case 'edit':
      await cmdEdit(args[1], args.slice(2));
      break;
    case 'combo': {
      const nameIdx = args.indexOf('--name');
      const comboName = nameIdx !== -1 ? args[nameIdx + 1] : 'Combo Sequence';
      const clipArgs = args.slice(1, nameIdx !== -1 ? nameIdx : undefined);
      await cmdCombo(clipArgs, comboName);
      break;
    }
    case 'validate':
      await cmdValidate(args[1]);
      break;
    case 'publish': {
      const clipId = args[1];
      const slotIdx = args.indexOf('--slot');
      const padIdx = args.indexOf('--pad');
      const keyIdx = args.indexOf('--key');
      const slot = slotIdx !== -1 ? args[slotIdx + 1] : 'action';
      const pad = padIdx !== -1 ? args[padIdx + 1] : null;
      const key = keyIdx !== -1 ? args[keyIdx + 1] : null;
      await cmdPublish(clipId, slot, pad, key);
      break;
    }
    default:
      console.log(`
MovaLab 2.0 CLI - Comandos disponíveis:
  node movalab-cli.mjs list
  node movalab-cli.mjs inspect <clipIdOrFile>
  node movalab-cli.mjs edit <clipId> [--trim-start <sec>] [--trim-end <sec>] [--speed <f>] [--marker <time:name>]
  node movalab-cli.mjs combo <clip1> <clip2> <clip3> --name <comboName>
  node movalab-cli.mjs validate <clipIdOrFile>
  node movalab-cli.mjs publish <clipId> --slot <idle|walk|run|action> [--pad <PadX>] [--key <KeyF>]
`);
  }
}

main().catch(err => {
  console.error('CLI Error:', err);
  process.exit(1);
});
