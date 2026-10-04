/*
 * kepler-veil - an elliptical orbit swept by Kepler's second law.
 *
 * The planet runs an eccentric orbit (r = a(1-e^2)/(1+e cos t)) around the
 * sun at the focus; the wedge swept in constant time widens near aphelion and
 * narrows near perihelion, the radius and velocity vectors update live and
 * the planet leaves a single-dot comet tail. Formula and orbital elements sit
 * centred below, over the usual faint plane.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const ECC = 0.62;
const STEPS = 2600;
const DT = 0.004;
const H_ANG = (2 * Math.PI * Math.sqrt(1 - ECC * ECC)) / (STEPS * DT);

let TH = null;
let RR = null;

function radius(theta) { return (1 - ECC * ECC) / (1 + ECC * Math.cos(theta)); }

function channels(hex) {
  const s = hex.replace(/^#/, "");
  return [parseInt(s.slice(0, 2), 16) || 0, parseInt(s.slice(2, 4), 16) || 0, parseInt(s.slice(4, 6), 16) || 0];
}
function mixHex(a, b, t) {
  const ca = channels(a), cb = channels(b);
  const to = (v) => Math.round(v).toString(16).padStart(2, "0");
  return "#" + to(ca[0] + (cb[0] - ca[0]) * t) + to(ca[1] + (cb[1] - ca[1]) * t) + to(ca[2] + (cb[2] - ca[2]) * t);
}
function withAlpha(hex, alpha) {
  const byte = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return hex.slice(0, 7) + byte.toString(16).padStart(2, "0").toUpperCase();
}
function tokens(palette) {
  const bg = palette.background.hex, fg = palette.foreground.hex;
  const roles = palette.roles || {}, colors = palette.colors || [];
  const at = (i, fb) => (colors[i] && colors[i].hex) || fb;
  return {
    bg: bg, text: fg,
    secondary: mixHex(bg, fg, 0.58), disabled: mixHex(bg, fg, 0.34), border: mixHex(bg, fg, 0.12),
    accent: (roles.workspaceActive && roles.workspaceActive.hex) || at(1, fg),
    neon: [at(1, fg), at(2, fg), at(3, fg), at(4, fg), at(5, fg), at(6, fg), at(7, fg), fg],
  };
}
let scale = 1, s = (v) => v * scale;
function text(str, x, y, size, color, family, anchor) {
  canvas.text(str, x, y, size, color, { family: family || MONO, anchor: anchor || "start" });
}
function hairline(x1, y1, x2, y2, color, width) {
  canvas.stroke(color, width || 1 * scale);
  canvas.begin_path(); canvas.move_to(x1, y1); canvas.line_to(x2, y2); canvas.stroke_path();
}
function corners(w, h, m, len, color) {
  hairline(m, m + len, m, m, color, 4 * scale); hairline(m, m, m + len, m, color, 4 * scale);
  hairline(w - m - len, m, w - m, m, color, 4 * scale); hairline(w - m, m, w - m, m + len, color, 4 * scale);
  hairline(m, h - m, m, h - m - len, color, 4 * scale); hairline(m, h - m - len, m, h - m, color, 4 * scale);
  hairline(w - m, h - m, w - m, h - m - len, color, 4 * scale); hairline(w - m - len, h - m, w - m, h - m, color, 4 * scale);
}

function setup(ctx) {
  scale = ctx.width / DESIGN_W;
  s = (v) => v * scale;
  canvas.clear(tokens(ctx.palette).bg);
  if (TH) return;
  TH = [];
  RR = [];
  let theta = 0;
  for (let i = 0; i < STEPS; i++) {
    const r = radius(theta);
    TH.push(theta);
    RR.push(r);
    theta += (H_ANG / (r * r)) * DT;
  }
}

function render(t, ctx) {
  const k = tokens(ctx.palette);
  const w = ctx.width, h = ctx.height;
  const m = s(36);
  const cx = w / 2 - w * 0.06;
  const cy = h * 0.44;
  const unit = Math.min(w, h) * 0.30;
  const px = (th, r) => cx + Math.cos(th) * r * unit;
  const py = (th, r) => cy - Math.sin(th) * r * unit;
  const idx = (Math.floor(t * 850) + 900) % STEPS;

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  for (let i = -7; i <= 7; i++) {
    hairline(cx + (i / 7) * unit * 1.9, 0, cx + (i / 7) * unit * 1.9, h, withAlpha(k.border, i % 2 === 0 ? 0.42 : 0.20), 1 * scale);
    hairline(0, cy + (i / 7) * unit * 1.9, w, cy + (i / 7) * unit * 1.9, withAlpha(k.border, i % 2 === 0 ? 0.42 : 0.20), 1 * scale);
  }

  /* Full ellipse. */
  let lx = px(0, radius(0)), ly = py(0, radius(0));
  for (let i = 1; i <= 200; i++) {
    const th = (2 * Math.PI * i) / 200;
    const r = radius(th);
    hairline(lx, ly, px(th, r), py(th, r), withAlpha(k.neon[3], 0.45), 1.3 * scale);
    lx = px(th, r); ly = py(th, r);
  }

  /* Swept wedge in constant time (equal areas). */
  const from = Math.max(0, idx - 210);
  canvas.fill(withAlpha(k.accent, 0.12));
  canvas.begin_path();
  canvas.move_to(cx, cy);
  for (let i = from; i <= idx; i++) {
    canvas.line_to(px(TH[i], RR[i]), py(TH[i], RR[i]));
  }
  canvas.close_path();
  canvas.fill_path();
  canvas.fill("#00000000");
  hairline(cx, cy, px(TH[idx], RR[idx]), py(TH[idx], RR[idx]), withAlpha(k.accent, 0.55), 1.4 * scale);

  /* Sun and planet. */
  canvas.fill(withAlpha(k.neon[3], 0.35));
  canvas.circle(cx, cy, 9 * scale);
  canvas.fill(withAlpha(k.neon[3], 0.95));
  canvas.circle(cx, cy, 4 * scale);
  for (let q = 6; q >= 0; q--) {
    const i = Math.max(0, idx - q * 12);
    canvas.fill(withAlpha(k.neon[6], 0.85 - q * 0.10));
    canvas.circle(px(TH[i], RR[i]), py(TH[i], RR[i]), Math.max(1.2, 3.8 - q * 0.36) * scale);
  }

  /* Velocity arrow: perpendicular to the radius, length ~ 1/r. */
  const thN = TH[idx], rN = RR[idx];
  const vx = -Math.sin(thN), vy = Math.cos(thN);
  const vLen = 0.14 / rN;
  const hx = px(thN, rN), hy = py(thN, rN);
  const ex = hx + vx * vLen * unit, ey = hy - vy * vLen * unit;
  hairline(hx, hy, ex, ey, withAlpha(k.neon[5], 0.9), 1.8 * scale);
  hairline(ex, ey, ex - (vx - vy * 0.3) * 12 * scale, ey + (vy + vx * 0.3) * 12 * scale, withAlpha(k.neon[5], 0.9), 1.4 * scale);
  hairline(ex, ey, ex - (vx + vy * 0.3) * 12 * scale, ey + (vy - vx * 0.3) * 12 * scale, withAlpha(k.neon[5], 0.9), 1.4 * scale);

  /* Apsides labels. */
  text("PERIHELION", px(0, radius(0)) + s(18), py(0, radius(0)) + s(6), s(16), withAlpha(k.disabled, 0.9), MONO);
  text("APHELION", px(Math.PI, radius(Math.PI)) - s(18), py(Math.PI, radius(Math.PI)) + s(6), s(16), withAlpha(k.disabled, 0.9), MONO, "end");

  text("e = " + ECC.toFixed(2) + " \u00B7 a = 1.00 AU", m + s(56), m + s(36), s(20), withAlpha(k.accent, 0.95), MATH);
  text("r = " + rN.toFixed(3) + " AU", w - m - s(56), m + s(36), s(20), withAlpha(k.neon[5], 0.95), MATH, "end");
  text("r(\u03B8) = a(1 \u2212 e\u00B2) / (1 + e cos \u03B8)", cx + w * 0.06, h - m - s(58), s(32), withAlpha(k.neon[4], 0.95), MATH, "middle");
  text("EQUAL AREAS IN EQUAL TIMES \u00B7 2ND LAW", cx + w * 0.06, h - m - s(22), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");
  text("KEPLER_VEIL // 13", m + s(56), h - m - s(24), s(18), withAlpha(k.disabled, 0.9), MONO);

  corners(w, h, m, s(64), withAlpha(k.neon[5], 0.9));
  canvas.alpha(1.0);
}
