'use strict';
// =============================================================================
// core.js — matemática, aleatoriedade com semente, ruído e a câmera isométrica.
// Mundo: x/y no chão, z para cima. Unidade ~ 1 cm (o cavaleiro tem ~185).
// =============================================================================

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const SQ1_2 = Math.SQRT1_2;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };

const Ease = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => t * (2 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  inCubic: t => t * t * t,
  outCubic: t => 1 - (1 - t) * (1 - t) * (1 - t),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: t => { const c = 1.6; const u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; },
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};

// ---------- vetores 3D (arrays [x, y, z]) ----------
const vAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vScale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const vAddS = (a, b, s) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const vDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vLen = a => Math.hypot(a[0], a[1], a[2]);
const vNorm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const vLerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const vDist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const vMid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
function vPerp(u) { // um vetor qualquer perpendicular a u
  const a = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  return vNorm(vCross(u, a));
}

// ---------- referenciais (origem + eixos ortonormais) ----------
// x = frente, y = esquerda, z = cima (no espaço local de cada osso)
const fPoint = (f, p) => [
  f.o[0] + f.x[0] * p[0] + f.y[0] * p[1] + f.z[0] * p[2],
  f.o[1] + f.x[1] * p[0] + f.y[1] * p[1] + f.z[1] * p[2],
  f.o[2] + f.x[2] * p[0] + f.y[2] * p[1] + f.z[2] * p[2],
];
const fDir = (f, d) => [
  f.x[0] * d[0] + f.y[0] * d[1] + f.z[0] * d[2],
  f.x[1] * d[0] + f.y[1] * d[1] + f.z[1] * d[2],
  f.x[2] * d[0] + f.y[2] * d[1] + f.z[2] * d[2],
];
function fYaw(f, a) { // gira em torno do próprio z (positivo = vira à esquerda)
  const c = Math.cos(a), s = Math.sin(a);
  return { o: f.o, x: vAdd(vScale(f.x, c), vScale(f.y, s)), y: vAdd(vScale(f.x, -s), vScale(f.y, c)), z: f.z };
}
function fPitch(f, a) { // positivo = inclina para a frente (z vai em direção a x)
  const c = Math.cos(a), s = Math.sin(a);
  return { o: f.o, x: vAdd(vScale(f.x, c), vScale(f.z, -s)), y: f.y, z: vAdd(vScale(f.z, c), vScale(f.x, s)) };
}
function fRoll(f, a) { // positivo = tomba para a direita (z vai em direção a -y)
  const c = Math.cos(a), s = Math.sin(a);
  return { o: f.o, x: f.x, y: vAdd(vScale(f.y, c), vScale(f.z, s)), z: vAdd(vScale(f.z, c), vScale(f.y, -s)) };
}

// ---------- aleatoriedade com semente ----------
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seed) {
  const r = mulberry32(seed);
  r.range = (a, b) => a + (b - a) * r();
  r.int = (a, b) => Math.floor(a + (b - a + 1) * r());
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  r.sign = () => (r() < 0.5 ? -1 : 1);
  return r;
}

// ---------- ruído de valor 2D + fbm ----------
function makeNoise2D(seed) {
  const rnd = mulberry32(seed);
  const p = new Uint8Array(512);
  const base = [];
  for (let i = 0; i < 256; i++) base.push(i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = base[i]; base[i] = base[j]; base[j] = t; }
  for (let i = 0; i < 512; i++) p[i] = base[i & 255];
  const vals = new Float32Array(256);
  for (let i = 0; i < 256; i++) vals[i] = rnd() * 2 - 1;
  const h = (i, j) => vals[p[(i & 255) + p[j & 255]]];
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  noise.fbm = (x, y, oct = 4) => {
    let s = 0, amp = 0.5, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) { s += noise(x * f, y * f) * amp; norm += amp; amp *= 0.5; f *= 2.03; }
    return s / norm;
  };
  return noise;
}

// =============================================================================
// Câmera 3/4 ortográfica: yaw de 45° e inclinação (pitch) fixa.
//   tela x = (x - y)·√½
//   tela y = (x + y)·√½·sen(p) − z·cos(p)
//   profundidade (rumo à câmera) = (x + y)·√½·cos(p) + z·sen(p)
// As coordenadas "projetadas" ficam em unidades do mundo; Cam.px converte
// para pixels do dispositivo.
// =============================================================================
const Cam = {
  pitch: 0, sinP: 0, cosP: 0,
  S: 1, dpr: 1, px: 1,
  W: 0, H: 0, cssW: 0, cssH: 0,
  cx: 0, cy: 0,           // centro da vista (unidades projetadas)
  shakeX: 0, shakeY: 0,
  offX: 0, offY: 0,       // dispositivo = projetado·px + off
  toCam: [0, 0, 1],       // direção do mundo que aponta para a câmera
  light2D: [-0.52, -0.85],// direção (na tela) de onde vem a luz
  lightW: [0, 0, 1],      // direção do mundo que aponta para o sol
};

function camSetPitch(deg) {
  Cam.pitch = deg * DEG;
  Cam.sinP = Math.sin(Cam.pitch);
  Cam.cosP = Math.cos(Cam.pitch);
  Cam.toCam = [Cam.cosP * SQ1_2, Cam.cosP * SQ1_2, Cam.sinP];
  Cam.lightW = vNorm([0.35, -0.65, 0.85]);
}
camSetPitch(34);

const projX = (x, y) => (y - x) * SQ1_2;
const projY = (x, y, z) => (x + y) * SQ1_2 * Cam.sinP - z * Cam.cosP;
const projD = (x, y, z) => (x + y) * SQ1_2 * Cam.cosP + z * Cam.sinP;
const hDepth = p => (p[0] + p[1]) * SQ1_2; // profundidade só no plano do chão
function proj(p) { return [projX(p[0], p[1]), projY(p[0], p[1], p[2]), projD(p[0], p[1], p[2])]; }

function camUpdateOffsets() {
  Cam.offX = Cam.W / 2 - (Cam.cx + Cam.shakeX) * Cam.px;
  Cam.offY = Cam.H / 2 - (Cam.cy + Cam.shakeY) * Cam.px;
}
function setWorldTransform(ctx) { ctx.setTransform(Cam.px, 0, 0, Cam.px, Cam.offX, Cam.offY); }
function screenToGround(x, y) {
  const sx = (x - Cam.offX) / Cam.px, sy = (y - Cam.offY) / Cam.px / Cam.sinP;
  return [(sy - sx) * SQ1_2, (sy + sx) * SQ1_2, 0];
}
function frameAt(o, yaw = 0) {
  return { o: o.slice(), x: [Math.cos(yaw), Math.sin(yaw), 0], y: [-Math.sin(yaw), Math.cos(yaw), 0], z: [0, 0, 1] };
}
const pj2 = p => [projX(p[0], p[1]), projY(p[0], p[1], p[2])];
const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));
