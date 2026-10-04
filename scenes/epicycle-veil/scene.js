/*
 * epicycle-veil - a chain of rotating circles projecting a square wave.
 *
 * Fifteen odd Fourier terms ride as circles on the left; their imaginary part
 * is projected onto the plane on the right, traced revolution after
 * revolution into a square wave. The chain, the dashed projection connector,
 * the wave and its single-dot tracer share the palette; the series and the
 * harmonic count sit centred below.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const HARMONICS = 15;
const AMP = (i) => 4 / (Math.PI * (2 * i + 1));

function part(theta) {
  let re = 0, im = 0;
  for (let i = 0; i < HARMONICS; i++) {
    const n = 2 * i + 1, r = AMP(i), a = n * theta;
    re += r * Math.cos(a);
    im += r * Math.sin(a);
  }
  return [re, im];
}

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

function setup(ctx) { scale = ctx.width / DESIGN_W; s = (v) => v * scale; canvas.clear(tokens(ctx.palette).bg); }

function render(t, ctx) {
  const k = tokens(ctx.palette);
  const w = ctx.width, h = ctx.height;
  const m = s(36);
  const theta = t * 1.1;
  const chainCx = w * 0.26, chainCy = h * 0.42;
  const chainScale = Math.min(w, h) * 0.072;
  const waveX = w * 0.40, waveW = w * 0.52;
  const waveAmp = h * 0.15;

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  for (let i = -7; i <= 7; i++) {
    hairline(w / 2 + (i / 7) * w * 0.44, 0, w / 2 + (i / 7) * w * 0.44, h, withAlpha(k.border, i % 2 === 0 ? 0.42 : 0.20), 1 * scale);
    hairline(0, chainCy + (i / 7) * h * 0.30, w, chainCy + (i / 7) * h * 0.30, withAlpha(k.border, i % 2 === 0 ? 0.42 : 0.20), 1 * scale);
  }
  hairline(0, chainCy, w, chainCy, withAlpha(k.neon[3], 0.28), 1.3 * scale);

  /* Projected square wave (the imaginary part of the chain). */
  let prev = part(theta - 2 * Math.PI)[1];
  let prevX = waveX, prevY = chainCy - prev * waveAmp;
  for (let i = 1; i <= 240; i++) {
    const a = theta - 2 * Math.PI + (2 * Math.PI * i) / 240;
    const v = part(a)[1];
    const x = waveX + (waveW * i) / 240;
    const y = chainCy - v * waveAmp;
    hairline(prevX, prevY, x, y, withAlpha(k.accent, 0.20 + 0.60 * (i / 240)), 1.8 * scale);
    prevX = x; prevY = y;
  }

  /* Chain of rotating circles (units: square-wave coefficients). */
  let chainX = 0, chainY = 0;
  for (let i = 0; i < HARMONICS; i++) {
    const n = 2 * i + 1;
    const r = AMP(i) * chainScale;
    const cxp = chainCx + chainX * chainScale;
    const cyp = chainCy - chainY * chainScale;
    canvas.fill("#00000000");
    canvas.stroke(withAlpha(k.neon[i % k.neon.length], 0.35), 1.1 * scale);
    canvas.circle(cxp, cyp, r);
    const nx = chainX + AMP(i) * Math.cos(n * theta);
    const ny = chainY + AMP(i) * Math.sin(n * theta);
    hairline(cxp, cyp, chainCx + nx * chainScale, chainCy - ny * chainScale, withAlpha(k.accent, 0.65 - i * 0.02), 1.4 * scale);
    chainX = nx;
    chainY = ny;
  }
  const tipX = chainCx + chainX * chainScale;
  const tipY = chainCy - chainY * chainScale;

  /* Projection connector: chain tip -> wave head. */
  const headV = part(theta)[1];
  const headX = waveX + waveW;
  const headY = chainCy - headV * waveAmp;
  hairline(tipX, tipY, headX, headY, withAlpha(k.neon[4], 0.35), 1.3 * scale);

  /* Tracer on the wave with a single-dot tail. */
  for (let q = 6; q >= 0; q--) {
    const a = theta - q * 0.035;
    const v = part(a)[1];
    const x = headX - (q * 0.035 * waveW) / (2 * Math.PI);
    canvas.fill(withAlpha(k.neon[6], 0.85 - q * 0.10));
    canvas.circle(x, chainCy - v * waveAmp, Math.max(1.2, 3.6 - q * 0.34) * scale);
  }

  text("N = " + HARMONICS + " HARMONICS \u00B7 ODD 1..29", m + s(56), m + s(36), s(20), withAlpha(k.accent, 0.95), MONO);
  text("GIBBS \u2248 8.95%", w - m - s(56), m + s(36), s(20), withAlpha(k.neon[5], 0.95), MATH, "end");
  text("f(t) = \u03A3 (4/\u03C0n) sin(n\u03C9t)", w / 2, h - m - s(58), s(34), withAlpha(k.neon[4], 0.95), MATH, "middle");
  text("EPICYCLE CHAIN PROJECTED ONTO THE TIME AXIS", w / 2, h - m - s(22), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");
  text("EPICYCLE_VEIL // 11", m + s(56), h - m - s(24), s(18), withAlpha(k.disabled, 0.9), MONO);

  corners(w, h, m, s(64), withAlpha(k.neon[1], 0.9));
  canvas.alpha(1.0);
}
