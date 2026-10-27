// Teste de Precisão e Sensação de Combate Estilo "No Rest for the Wicked":
// Cadeia de esquivas, cancelamentos por parry, follow-ups de rolamento,
// riposte crítico, ataque em corrida, telegraphs e tracking de inimigos.
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

vm.runInNewContext(code + String.raw`
const Pilot = window.Pilot;
const dt = 1/120, step = n => { for (let i = 0; i < n; i++) update(dt); };
const gp = { index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
gamepads[0] = gp;
const button = (i, down = true) => {
  gp.buttons[i] = { pressed: down, value: down ? 1 : 0 };
  Input.pollGamepad();
};
const padReset = () => {
  gp.axes.fill(0);
  gp.buttons.forEach((_, i) => gp.buttons[i] = { pressed: false, value: 0 });
  Input.pollGamepad();
  setToggle('paused', false);
  resetPlayer();
  handlers.focus();
  Input.pollGamepad();
};

// =========================================================================
// TESTE 1: Encadeamento de Rolamentos no Cancel Frame (Dodge Chaining)
// =========================================================================
padReset();
button(1, true); // Primeiro rolamento (B)
step(1);
button(1, false);
assert.equal(Player.state, 'dodge', 'Primeiro rolamento iniciado');
const rollSpec = ARUAN_GAME_FEEL.dodge.roll;
// Avanca ate antes da janela de cancelamento
while (Player.anim.dodge.t < rollSpec.recoveryCancelAt - 0.08) step(1);
assert.equal(Player.state, 'dodge');
// Pressiona o segundo rolamento antecipadamente
button(1, true);
step(1);
button(1, false);
// Deve ter sido bufferizado
assert.equal(Player.state, 'dodge');
const firstActionId = Player.actionInstanceId;
// Avanca ate alcancar recoveryCancelAt
while (Player.anim.dodge && Player.actionInstanceId === firstActionId) step(1);
assert.equal(Player.state, 'dodge', 'Segundo rolamento executado no cancel frame');
assert.notEqual(Player.actionInstanceId, firstActionId, 'Nova instancia de esquiva disparada sem esperar o termino completo da animacao anterior');
console.log('OK: Encadeamento fluido de rolamentos no recoveryCancelAt');

// =========================================================================
// TESTE 2: Cancelamento de Rolamento para Parry no Cancel Frame
// =========================================================================
padReset();
button(1, true); // Rolamento
step(1);
button(1, false);
while (Player.anim.dodge.t < rollSpec.recoveryCancelAt - 0.05) step(1);
// Aperta Parry (LT) durante a esquiva
button(6, true);
step(1);
button(6, false);
// Ao atingir recoveryCancelAt, deve acionar o parry imediatamente
while (Player.state === 'dodge') step(1);
assert.equal(Player.state, 'parry', 'Parry dispara automaticamente ao atingir o recoveryCancelAt da esquiva');
console.log('OK: Cancelamento de esquiva para parry no cancel frame');

// =========================================================================
// TESTE 3: Ataque em Corrida (Running Attack Momentum)
// =========================================================================
padReset();
gp.axes[0] = -0.707;
gp.axes[1] = 0.707;
step(20);
button(10, true); // L3 ativa sprint toggle
step(1);
button(10, false);
step(60);
assert.ok(Player.sprint, 'Aruan em sprint');
assert.ok(Math.hypot(...Player.vel) > 250, 'Velocidade de corrida atingida (>250 u/s)');
button(2, true); // Pressiona X (ataque)
step(1);
button(2, false);
assert.equal(Player.state, 'attack', 'Ataque em corrida ativado');
assert.equal(Player.attackSpec.id, 'RUNNING_ATTACK', 'Especificacao de Running Attack selecionada');
assert.equal(Player.sprint, false, 'Sprint cancelado no inicio do ataque (sem dreno indevido de stamina)');
assert.equal(Player.sprintTime, 0, 'Tempo de sprint zerado');
console.log('OK: Running attack acionado com cancelamento correto de sprint');

// =========================================================================
// TESTE 4: Riposte Critico e Restauracao de Vulnerabilidade
// =========================================================================
padReset();
const dummy = WorldScene.props.find(o => o.kind === 'dummy');
dummy.x = Player.pos[0] + 80;
dummy.y = Player.pos[1];
dummy.hp = 120;
dummy.poise = 0;
dummy.enemyState = 'stagger';
dummy.stateTimer = 1.35;
dummy.riposteUntil = Game.t + 1.25;
step(1);
// Aperta X na proximidade do inimigo vulneravel
button(2, true);
step(1);
button(2, false);
assert.equal(Player.state, 'attack', 'Ataque iniciado');
assert.equal(Player.attackSpec.id, 'RIPOSTE', 'Ataque classificado como RIPOSTE CRITICO');
assert.equal(Player.invulnerable, true, 'Jogador invulneravel durante o golpe critico');
// Avanca ate o acerto do golpe
while (Player.state === 'attack' && Player.anim.atk.t < Player.anim.atk.def.hitTime * 0.85) step(1);
assert.ok(dummy.hp < 120, 'Riposte causou dano massivo');
// Avanca ate o termino completo do golpe
while (Player.state === 'attack') step(1);
assert.equal(Player.state, 'move', 'Aruan retornou ao estado normal de movimento');
assert.equal(Player.invulnerable, false, 'Invulnerabilidade foi resetada corretamente para false (sem bug residual)');
console.log('OK: Riposte critico com hitstop pesado e restauracao de vulnerabilidade');

// =========================================================================
// TESTE 5: Windup do Inimigo: Tracking Inicial e Trava de Direcao Final
// =========================================================================
padReset();
const guardian = TrainingEnemy;
guardian.x = 200;
guardian.y = 130;
Player.pos = [300, 130, 0];
step(1);
startEnemyAttack(guardian, 'ENEMY_SLASH_1');
assert.equal(guardian.enemyState, 'windup', 'Inimigo em windup');
const trackLimit = guardian.attack.windup * guardian.attack.trackRatio;
// Move o jogador enquanto o inimigo ainda rastreia
Player.pos = [200, 230, 0];
step(5);
assert.ok(guardian.stateTimer < trackLimit, 'Ainda na fase de rastreamento do windup');
// Avanca ate passar o trackRatio (fase onde a direcao deve travar)
while (guardian.stateTimer < trackLimit + 0.03) step(1);
const lockedAngle = guardian.facing;
// Move o jogador bruscamente para o lado oposto
Player.pos = [100, 130, 0];
step(5);
assert.ok(Math.abs(angDiff(guardian.facing, lockedAngle)) < 0.001, 'Direcao do golpe do inimigo travou nos ultimos 30% do windup, permitindo esquiva tatica');
console.log('OK: Windup do inimigo com telegraph e trava direcional justa estilo Wicked');

// =========================================================================
// TESTE 6: Whiff sem Hitstop e sem Camera Shake
// =========================================================================
padReset();
Player.pos = [0, 400, 0]; // Longe de qualquer inimigo
Game.hitstop = 0;
Game.shake = 0;
beginAttack(0, 0); // Golpe 1 no vazio
step(60);
assert.equal(Game.hitstop, 0, 'Golpe no vazio (whiff) tem zero hitstop');
assert.equal(Game.shake, 0, 'Golpe no vazio tem zero camera shake');
console.log('OK: Honest combat feedback: zero hitstop e shake em whiff');

// =========================================================================
// TESTE 7: Direcionamento Dinamico durante Windup do Ataque (Free Aim)
// =========================================================================
padReset();
Player.facing = 0; // Olhando para a direita
beginAttack(0, 0);
step(2);
assert.equal(Player.state, 'attack');
assert.equal(Player.phase, 'windup');
// Jogador ajusta a mira com o analogico direito para cima (axes[3] = -1)
gp.axes[3] = -1;
Input.pollGamepad();
step(6);
assert.ok(Player.facing < -0.05, 'Direcao do ataque ajusta suavemente no windup seguindo a intencao do jogador');
console.log('OK: Steer dinamico no windup de ataque');

console.log('\nTODOS OS 7 TESTES AVANCADOS DE COMBATE WICKED PASSARAM COM 100% DE SUCESSO!\n');
`, scope, { filename: 'wicked-combat-feel-test.js' });
