'use strict';
// =============================================================================
// ink.js — "pincéis" do estilo HQ: formas chapadas em 2–3 tons + contorno de
// tinta. Tudo trabalha com funções que constroem caminhos (build(ctx)), para
// que a mesma forma possa ser preenchida, recortada e contornada.
// =============================================================================

const INK = '#16111c';       // tinta do personagem
const INK_LEAF = '#14261b';  // tinta da vegetação
const INK_ROCK = '#1d1820';  // tinta das pedras / chão

const PAL = {
  steel:   { base: '#aab8c9', shadow: '#6b7a92', light: '#eef3f8' },
  steelDk: { base: '#7f8da4', shadow: '#55627a', light: '#c4d0dd' },
  gold:    { base: '#e2a63c', shadow: '#9c6420', light: '#ffe596' },
  crimson: { base: '#a51d3c', shadow: '#6c112b', light: '#d24660' },
  lining:  { base: '#561024', shadow: '#3a0a19' },
  cloth:   { base: '#553828', shadow: '#36231a', light: '#74503b' },
  leather: { base: '#603b27', shadow: '#3d2418', light: '#8a5a3c' },
  skin:    { base: '#e9a878', shadow: '#b87150', light: '#f8caa0' },
  hair:    { dark: '#3e1f10', base: '#7d4322', mid: '#a5592c', light: '#cf8240' },
  buzz:    { base: '#a08773', shadow: '#7a6250' },
  blade:   { base: '#d3dde7', shadow: '#8e9fb3', light: '#ffffff' },
  eye: { iris: '#2f86e0', irisDk: '#16447f', sclera: '#f6f0e6', pupil: '#0a0f1c' },
  brow: '#3a1d10', lip: '#9c4f3c',
};

// ---------- geometria 2D ----------
function convexHull(points) {
  if (points.length < 3) return points.slice();
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

function polyCentroid(pts) {
  let x = 0, y = 0;
  for (const p of pts) { x += p[0]; y += p[1]; }
  return [x / pts.length, y / pts.length];
}

// ---------- construtores de caminho ----------
function pathPoly(ctx, pts) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

// curva fechada suave passando pelos pontos médios (arredonda os cantos)
function pathSmooth(ctx, pts) {
  const n = pts.length;
  if (n < 3) { pathPoly(ctx, pts); return; }
  const a = pts[n - 1], b = pts[0];
  ctx.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
}

// mistura: cantos arredondados só parcialmente (k=0 polígono, k=1 suave)
function pathSoftPoly(ctx, pts, k) {
  const n = pts.length;
  if (n < 3) { pathPoly(ctx, pts); return; }
  const P = (i) => pts[(i + n) % n];
  for (let i = 0; i < n; i++) {
    const p = P(i), prev = P(i - 1), next = P(i + 1);
    const a = [p[0] + (prev[0] - p[0]) * 0.5 * k, p[1] + (prev[1] - p[1]) * 0.5 * k];
    const b = [p[0] + (next[0] - p[0]) * 0.5 * k, p[1] + (next[1] - p[1]) * 0.5 * k];
    if (i === 0) ctx.moveTo(a[0], a[1]); else ctx.lineTo(a[0], a[1]);
    ctx.quadraticCurveTo(p[0], p[1], b[0], b[1]);
  }
  ctx.closePath();
}

// cápsula afunilada entre dois círculos (membros)
function pathCapsule(ctx, ax, ay, ra, bx, by, rb) {
  const dx = bx - ax, dy = by - ay;
  const d = Math.hypot(dx, dy);
  if (d <= Math.abs(ra - rb) + 0.01) {
    const big = ra >= rb;
    const cx = big ? ax : bx, cy = big ? ay : by, r = big ? ra : rb;
    ctx.moveTo(cx + r, cy);
    ctx.arc(cx, cy, r, 0, TAU);
    return;
  }
  const ang = Math.atan2(dy, dx);
  const off = Math.acos(clamp((ra - rb) / d, -1, 1));
  ctx.moveTo(ax + Math.cos(ang + off) * ra, ay + Math.sin(ang + off) * ra);
  ctx.arc(ax, ay, ra, ang + off, ang + TAU - off);
  ctx.arc(bx, by, rb, ang - off, ang + off);
  ctx.closePath();
}

function pathCircle(ctx, x, y, r) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
function pathEllipse(ctx, x, y, rx, ry, rot = 0) { ctx.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); }

// traço afunilado: polígono ao redor de uma polilinha com larguras variáveis
function pathTaper(ctx, pts, widthFn) {
  const n = pts.length;
  if (n < 2) return;
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = widthFn(i / (n - 1)) / 2;
    L.push([p[0] - dy * w, p[1] + dx * w]);
    R.push([p[0] + dy * w, p[1] - dx * w]);
  }
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
}

// contorno "recortado" de folhagem / nuvem (pontos pré-calculados)
function makeScallop(cx, cy, rx, ry, n, bulge, rnd, jitter = 0.16, phase = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * TAU;
    const j = 1 + (rnd() - 0.5) * jitter;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return { cx, cy, pts, bulge };
}
function pathScallop(ctx, s, dx = 0, dy = 0, k = 1) {
  const { cx, cy, pts, bulge } = s;
  const n = pts.length;
  const X = p => cx + (p[0] - cx) * k + dx, Y = p => cy + (p[1] - cy) * k + dy;
  ctx.moveTo(X(pts[0]), Y(pts[0]));
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2 - cx, my = (p[1] + q[1]) / 2 - cy;
    ctx.quadraticCurveTo(cx + mx * (1 + bulge) * k + dx, cy + my * (1 + bulge) * k + dy, X(q), Y(q));
  }
  ctx.closePath();
}

// Painted ink: sharp value planes, broken brush strokes and directional hatching.
// Noise is seeded in object space; it never flickers between animation frames.
Object.assign(PAL, {
  steel: {base:'#81a5b5', shadow:'#304b68', light:'#dce8d4'},
  steelDk: {base:'#57768b', shadow:'#263747', light:'#a6c4bd'},
  gold: {base:'#c99248', shadow:'#74452f', light:'#f7d58a'},
  crimson: {base:'#a72c43', shadow:'#4c1835', light:'#ee705d'},
  buzz: {base:'#685044',shadow:'#3b3333'},
});
function inkStroke(ctx, build, width=1.5, color=INK) {
  ctx.beginPath(); build(ctx); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.stroke();
}
function celFill(ctx, build, tones, so=3, hl=1) {
  ctx.save(); ctx.beginPath(); build(ctx); ctx.fillStyle=tones.shadow||tones.base; ctx.fill(); ctx.clip();
  ctx.translate(-so*.55,-so*.8); ctx.beginPath(); build(ctx); ctx.fillStyle=tones.base; ctx.fill();
  ctx.restore();
  if(hl && tones.light) { ctx.save(); ctx.beginPath(); build(ctx); ctx.clip(); ctx.translate(hl*.6,hl);
    ctx.beginPath(); build(ctx); ctx.strokeStyle=tones.light; ctx.lineWidth=hl*2; ctx.stroke(); ctx.restore(); }
}
function polygon(c, pts, fill, stroke=INK, width=1.4) {
  if(pts.length<3)return; c.beginPath(); pathPoly(c,pts); c.fillStyle=fill; c.fill();
  if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}
}
function line(c,pts,color=INK,width=1) {
  if(pts.length<2)return;c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();
}
function brush(c, pts, seed, light='#ffe5ab', count=12, alpha=.13) {
  if(pts.length<3)return;const rnd=makeRng(seed);
  let xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);let x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
  c.save();c.beginPath();pathPoly(c,pts);c.clip();c.globalAlpha*=alpha;
  for(let i=0;i<count;i++){let a=x+rnd()*w,b=y+rnd()*h,l=rnd.range(3,Math.max(4,w*.28));polygon(c,[[a,b],[a+l,b-rnd.range(1,4)],[a+l*.8,b+1],[a-2,b+2]],i%3?light:INK,null);}
  c.restore();
}
function paintedPoly(c,pts,tones,seed=1, lw=1.5, texture=12) {
  const build=k=>pathSoftPoly(k,pts,.08);celFill(c,build,tones,5,1.3);
  brush(c,pts,seed,tones.light||'#dac9a0',texture);inkStroke(c,build,lw);
}
function ellipse(c,x,y,rx,ry,fill,stroke=null,lw=1) {
  c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.fillStyle=fill;c.fill();
  if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
}

