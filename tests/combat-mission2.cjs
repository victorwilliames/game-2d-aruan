// Comprehensive test suite for ARUAN Missão 02:
// Combate, Controles Xbox, Postura de Combate, Esquivas Direcionais, Indicadores de Chão e Prioridades.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const handlers = {}, nodes = new Map(), noop = () => {};
const ctx = new Proxy({
  createLinearGradient: () => ({ addColorStop: noop }),
  createRadialGradient: () => ({ addColorStop: noop }),
  measureText: t => ({ width: t.length * 7 })
}, { get: (o, k) => k in o ? o[k] : noop });

function node(id = "canvas") {
  return {
    style: { setProperty: noop },
    setPointerCapture: noop,
    releasePointerCapture: noop,
    width: 1280,
    height: 720,
    textContent: '',
    classList: { toggle: noop },
    setAttribute: noop,
    focus: noop,
    matches: () => false,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    addEventListener: (k, f) => handlers[id + ':' + k] = f
  };
}

const document = {
  body: node("body"),
  hidden: false,
  addEventListener: (k, f) => handlers["document:" + k] = f,
  createElement: node,
  querySelector: s => {
    if (!nodes.has(s)) nodes.set(s, node(s === "#game" ? "canvas" : s));
    return nodes.get(s);
  },
  querySelectorAll: () => []
};

const gamepads = [];
const files = ['math', 'paint', 'rig', 'appearance', 'character', 'head', 'world', 'effects', 'targeting', 'locomotion', 'controls', 'main'];
const code = files.map(f => fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8')).join('\n');
const scope = {
  gamepads,
  navigator: { getGamepads: () => gamepads },
  assert,
  console,
  Math,
  performance,
  document,
  window: {},
  devicePixelRatio: 1,
  requestAnimationFrame: noop,
  addEventListener: (k, f) => handlers[k] = f,
  handlers
};

const testScript = String.raw`
const dt = 1 / 120;
const step = n => { for (let i = 0; i < n; i++) update(dt); };
const pad = {
  index: 0,
  connected: true,
  mapping: 'standard',
  axes: [0, 0, 0, 0],
  buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }))
};
gamepads[0] = pad;

const button = (idx, down = true) => {
  pad.buttons[idx] = { pressed: down, value: down ? 1 : 0 };
  Input.pollGamepad();
};
const clearPad = () => {
  pad.axes.fill(0);
  pad.buttons.forEach((_, i) => pad.buttons[i] = { pressed: false, value: 0 });
  Input.pollGamepad();
};

let passed = 0;
function test(name, fn) {
  clearPad();
  resetPlayer();
  Game.paused = false;
  Input.suspended = false;
  Input.focused = true;
  Input.activate('gamepad');
  clearPad();
  Input.setPreset('ARUAN_FLUIDO');
  fn();
  passed++;
  console.log('OK: ' + name);
}

// -------------------------------------------------------------
// Test 1: Orientação e Postura de Combate (The Witcher 3 / Dark Souls)
// -------------------------------------------------------------
test('A. Postura de combate: recuo (retreat), strafe lateral e avanco mantendo foco no inimigo', () => {
  const dummy = WorldScene.props.find(o => o.kind === 'dummy');
  assert.ok(dummy, 'Training dummy exists');
  dummy.hp = 100;
  dummy.x = 250;
  dummy.y = 130;
  Player.pos = [130, 130, 0];
  step(10);
  
  // Lock on dummy (R3 toggle)
  button(11, true);
  step(1);
  button(11, false);
  step(10);
  assert.ok(targetState && targetState.locked, 'Target locked via R3');

  // Move backwards (world [-1, 0], away from target at [1, 0])
  pad.axes[0] = 0.707;
  pad.axes[1] = -0.707;
  step(20);
  assert.equal(Player.combatGait, 'retreat', 'Walking away triggers retreat gait');
  assert.ok(Math.abs(Player.facing) < 0.6, 'Facing remains toward target while retreating');

  // Move laterally (world [0, 1], strafe)
  Player.pos = [130, 130, 0];
  pad.axes[0] = 0.707;
  pad.axes[1] = 0.707;
  step(20);
  assert.equal(Player.combatGait, 'strafe', 'Walking sideways triggers strafe gait');
  assert.ok(Math.abs(Player.facing) < 0.8, 'Facing remains toward target while strafing');

  // Move forward (world [1, 0], advance)
  Player.pos = [130, 130, 0];
  pad.axes[0] = -0.707;
  pad.axes[1] = 0.707;
  step(20);
  assert.equal(Player.combatGait, 'advance', 'Walking forward triggers advance gait');
});

// -------------------------------------------------------------
// Test 2: Esquiva sem antecipação visual (Dodge indicator appears ONLY on dodge)
// -------------------------------------------------------------
test('B. Esquiva sem antecipacao visual: mover analogico nao ativa marcacao previa no chao', () => {
  for (const [ax, ay] of [[1, 0], [0, 1], [-1, 0], [0, -1], [0.707, 0.707]]) {
    pad.axes[0] = ax;
    pad.axes[1] = ay;
    step(20);
    assert.equal(GameplayIndicators.dodgeTrail.active, false, 'No dodge trail active while merely moving stick');
  }
});

// -------------------------------------------------------------
// Test 3: Esquiva com marcacao posterior imediata (Quickstep)
// -------------------------------------------------------------
test('C. Esquiva com marcacao posterior: ativacao imediata no frame 0 e marcacao no chao', () => {
  pad.axes[0] = -0.707; // World east [1, 0]
  pad.axes[1] = 0.707;
  step(10);
  assert.equal(GameplayIndicators.dodgeTrail.active, false);

  // Press A (tap quickstep)
  button(0, true);
  step(1);
  button(0, false);
  step(1);
  assert.equal(Player.state, 'dodge', 'Dodge starts immediately');
  assert.equal(Player.dodgeKind, 'quickstep', 'A tap triggers quickstep');
  assert.equal(GameplayIndicators.dodgeTrail.active, true, 'Dodge trail appears immediately upon pressing dodge');
  assert.equal(GameplayIndicators.dodgeTrail.kind, 'quickstep', 'Trail kind is quickstep');
  assert.ok(Player.dodgeDirection[0] > 0.9, 'Dodge travels in left stick direction (east)');
});

// -------------------------------------------------------------
// Test 4: Cambalhota com marcacao e deslocamento (Roll)
// -------------------------------------------------------------
test('D. Cambalhota (B / Espaco): rastro e deslocamento fisico real', () => {
  pad.axes[0] = 0.707; // World south [0, 1]
  pad.axes[1] = 0.707;
  step(10);

  // Press B (Roll)
  button(1, true);
  step(1);
  assert.equal(Player.state, 'dodge', 'B roll starts immediately');
  assert.equal(Player.dodgeKind, 'roll', 'B triggers roll');
  assert.equal(GameplayIndicators.dodgeTrail.active, true, 'Roll trail is active');
  assert.equal(GameplayIndicators.dodgeTrail.kind, 'roll', 'Roll trail kind');
  assert.ok(Player.dodgeDirection[1] > 0.9, 'Roll travels south');
  const startY = Player.pos[1];
  step(45);
  assert.ok(Player.pos[1] > startY + 50, 'Player physically displaced during roll');
  assert.ok(GameplayIndicators.dodgeTrail.endPos[1] > startY + 50, 'Indicator endPos tracks real physical displacement');
});

// -------------------------------------------------------------
// Test 5: Corrida para esquiva (Interrupcao Imediata)
// -------------------------------------------------------------
test('E. Corrida para esquiva: interrupcao no frame 0 sem esperar desaceleracao', () => {
  pad.axes[0] = -0.707;
  pad.axes[1] = 0.707;
  step(20);
  // Activate sprint via L3 toggle
  button(10, true);
  button(10, false);
  step(60);
  assert.ok(Player.sprint, 'Player sprinting');
  assert.ok(Math.hypot(...Player.vel) > 300, 'Sprint speed reached');

  // Press B to dodge
  button(1, true);
  step(1);
  assert.equal(Player.sprint, false, 'Sprint interrupted immediately at frame 0');
  assert.equal(Player.state, 'dodge', 'Dodge active at frame 0');
});

// -------------------------------------------------------------
// Test 6: REGRA DEFINITIVA: Analogico direito NAO altera esquiva
// -------------------------------------------------------------
test('F. Analogico direito NAO controla esquiva: exclusividade absoluta do analogico esquerdo', () => {
  // Left stick pointing WEST (world [-1, 0]), Right stick pointing EAST (world [1, 0])
  pad.axes[0] = 0.707;
  pad.axes[1] = -0.707;
  pad.axes[2] = -0.707;
  pad.axes[3] = 0.707;
  step(10);

  // Press dodge (B)
  button(1, true);
  step(1);
  assert.equal(Player.state, 'dodge', 'Dodge begins');
  // Must dodge WEST (left stick), NOT EAST (right stick)
  assert.ok(Player.dodgeDirection[0] < -0.9, 'Dodge travels WEST following left stick');
  assert.ok(Math.abs(Player.dodgeDirection[1]) < 0.2, 'Dodge strictly horizontal west');

  // Test neutral left stick with focused target: contextual backstep
  clearPad();
  resetPlayer();
  const dummy = WorldScene.props.find(o => o.kind === 'dummy');
  dummy.hp = 100;
  dummy.x = 250;
  dummy.y = 130;
  Player.pos = [130, 130, 0];
  step(10);
  button(11, true);
  step(1);
  button(11, false);
  step(10); // Target locked to east
  // Both sticks neutral: dodge must be backstep (west, away from target)
  button(1, true);
  step(1);
  assert.equal(Player.state, 'dodge');
  assert.ok(Player.dodgeDirection[0] < -0.9, 'Neutral dodge in combat executes tactical backstep');
});

// -------------------------------------------------------------
// Test 7: Mira de Habilidade com RB (Estilo LoL)
// -------------------------------------------------------------
test('G. Habilidade com RB: indicador de mira no solo e direcionamento pelo analogico direito', () => {
  assert.equal(Input.rbHeld(), false, 'RB not held initially');
  // Hold RB (button 5)
  button(5, true);
  assert.equal(Input.rbHeld(), true, 'Input detects rbHeld');
  
  // Right stick aims north-east (world [0, -1])
  pad.axes[2] = -0.707;
  pad.axes[3] = -0.707;
  step(2);
  // Verify indicators can render without throwing
  assert.doesNotThrow(() => render());
});

// -------------------------------------------------------------
// Test 8: Habilidade para Esquiva (Cancelamento Imediato)
// -------------------------------------------------------------
test('H. Habilidade para esquiva: cancela mira de habilidade e esquiva no analogico esquerdo', () => {
  button(5, true); // Hold RB
  pad.axes[2] = -0.707; // Right stick aiming EAST (world [1, 0])
  pad.axes[3] = 0.707;
  step(5);
  assert.equal(Input.rbHeld(), true);

  // Left stick pointing SOUTH (world [0, 1])
  pad.axes[0] = 0.707;
  pad.axes[1] = 0.707;
  // Press Dodge (B)
  button(1, true);
  step(1);
  assert.equal(Player.state, 'dodge', 'Dodge interrupts skill mode immediately');
  assert.ok(Player.dodgeDirection[1] > 0.9, 'Dodge travels SOUTH along left stick, ignoring right stick aim');
});

// -------------------------------------------------------------
// Test 9: Indicadores de Ataques Carregados e Especiais
// -------------------------------------------------------------
test('I. Indicadores de ataques carregados e especiais durante o windup', () => {
  // Light attack (Combo 1): no special ground telegraph
  beginAttack(0, 0);
  assert.equal(Player.state, 'attack');
  assert.equal(Player.attackSpec.id, 'LIGHT_1');
  assert.doesNotThrow(() => render());

  step(120);
  assert.equal(Player.state, 'move');

  // Charged attack (RT): ground cone telegraph
  button(7, true);
  step(1);
  assert.equal(Player.state, 'attack', 'Charged attack starts');
  assert.equal(Player.attackSpec.id, 'CHARGED', 'Attack spec is CHARGED');
  assert.doesNotThrow(() => render());

  // Cancel / interrupção clears attack and ground indicators
  step(10);
  beginDodge('roll');
  step(1);
  assert.equal(Player.state, 'dodge', 'Dodge cancels charged attack recovery/cancel window');
});

// -------------------------------------------------------------
// Test 10: Bloqueio (Velocidade 95%, Reducao de 50% de Dano)
// -------------------------------------------------------------
test('J. Bloqueio: velocidade ~95%, reducao de 50% de dano frontal', () => {
  assert.equal(ARUAN_GAME_FEEL.guard.moveSpeedMultiplier, 0.95, 'Guard move speed is 95%');
  assert.equal(ARUAN_GAME_FEEL.guard.damageReduction, 0.50, 'Guard damage reduction is 50%');
  assert.equal(ARUAN_GAME_FEEL.guard.chipDamageMultiplier, 0.50, 'Guard chip damage is 50%');

  // Test block damage reduction on 60 dmg hit
  Player.facing = 0;
  beginGuard();
  assert.equal(Player.state, 'guard');
  const hpBefore = Player.resources.hp;
  const res = resolveIncomingHit({ fromX: Player.pos[0] + 60, fromY: Player.pos[1], damage: 60, staminaDamage: 10 });
  assert.equal(res.outcome, 'blocked');
  assert.equal(res.damage, 30, '60 damage reduced by 50% to 30 damage');
  assert.equal(Player.resources.hp, hpBefore - 30, 'Player HP correctly reflects 50% reduced chip damage');
});

// -------------------------------------------------------------
// Test 11: Parry (Prioridade 1 Absoluta)
// -------------------------------------------------------------
test('K. Parry: prioridade 1 absoluta, custo 35 stamina, janelas ativas e whiff recovery', () => {
  assert.equal(ARUAN_GAME_FEEL.parry.staminaCost, 35, 'Parry costs 35 stamina');
  assert.equal(ARUAN_GAME_FEEL.parry.startupSec, 0.05, 'Parry startup is 50ms');
  assert.equal(ARUAN_GAME_FEEL.parry.activeSec, 0.15, 'Parry active window is 150ms');
  assert.equal(ARUAN_GAME_FEEL.parry.whiffRecoverySec, 0.30, 'Parry whiff recovery is 300ms');

  // Parry interrupts guard immediately
  beginGuard();
  assert.equal(Player.state, 'guard');
  beginParry();
  assert.equal(Player.state, 'parry', 'Parry overrides guard immediately at frame 0');
  assert.equal(Player.resources.stamina, 100 - 35, '35 stamina spent on parry');

  // Startup -> Active window
  step(10);
  assert.equal(Player.parryActive, true, 'Parry window active after 50ms');
  
  // Whiff recovery
  step(20);
  assert.equal(Player.parryActive, false, 'Parry active window closes');
  assert.equal(Player.state, 'parry', 'In whiff recovery');
  step(36);
  assert.equal(Player.state, 'move', 'Returns to move after recovery');
});

// -------------------------------------------------------------
// Test 12: Pivot Turn em 180° a alta velocidade (No Rest for the Wicked)
// -------------------------------------------------------------
test('L. Pivot e frenagem estilo Wicked: inversao em 180 graus ativa pivot e transicao suave', () => {
  // Run east at high speed
  pad.axes[0] = -0.707;
  pad.axes[1] = 0.707;
  step(40);
  const eastSpeed = Math.hypot(...Player.vel);
  assert.ok(eastSpeed > 180, 'Player moving at high speed');

  // Instant 180 degree reversal to west
  pad.axes[0] = 0.707;
  pad.axes[1] = -0.707;
  step(1);
  assert.ok(Player.pivot, 'High speed reversal triggers grounded pivot');
  assert.ok(Player.turn, 'Turn rotation tracks the pivot smoothly');
  assert.ok(Player.phase === 'pivot' || Player.state === 'move', 'Locomotion phase acknowledges pivot');
  step(25);
  assert.equal(Player.pivot, null, 'Pivot completes within 140ms');
});

// -------------------------------------------------------------
// Test 13: Riposte Critico e Hit Feel (No Rest for the Wicked)
// -------------------------------------------------------------
test('M. Riposte critico estilo Wicked: ataque em inimigo vulneravel consome riposte com 68 dano e hitstop', () => {
  const dummy = WorldScene.props.find(o => o.kind === 'dummy');
  dummy.hp = 180;
  dummy.x = Player.pos[0] + 60;
  dummy.y = Player.pos[1];
  dummy.enemyState = 'stagger';
  dummy.riposteUntil = Game.t + 1.25;

  // Attack while close to staggered enemy triggers critical riposte
  beginAttack(0, 0);
  assert.equal(Player.state, 'attack');
  assert.equal(Player.attackSpec.id, 'RIPOSTE', 'Attack transitions into critical RIPOSTE spec');
  assert.equal(Player.invulnerable, true, 'Riposte grants invulnerability during critical execution');

  // Advance into active hit
  while (Player.state === 'attack' && dummy.hp === 180) step(1);
  assert.equal(dummy.hp, 180 - 68, 'Riposte delivers 68 critical damage');
  assert.ok(Game.hitstop >= 0.05, 'Extended hitstop on riposte impact');
});

// -------------------------------------------------------------
// Test 14: Feedback tatil e visual de Esquiva
// -------------------------------------------------------------
test('N. Feedback de esquiva: acionamento imediato, invulnerabilidade em i-frames e rastro no solo', () => {
  pad.axes[0] = -0.707;
  pad.axes[1] = 0.707;
  button(1, true);
  step(1);
  assert.equal(Player.state, 'dodge');
  assert.equal(GameplayIndicators.dodgeTrail.active, true);
  
  // Advance to i-frames
  step(10);
  assert.equal(Player.invulnerable, true, 'i-Frames active during dodge');
  
  // Advance past i-frames to recovery
  step(45);
  assert.equal(Player.invulnerable, false, 'i-Frames end safely in recovery');
});

console.log('\nTodos os ' + passed + ' cenarios da Missao 02 passaram com sucesso!');
`;

vm.runInNewContext(code + '\n' + testScript, scope);
