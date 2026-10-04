/*
 * riemann-sum - the integral of a curve rebuilt by rectangles.
 *
 * f(x) = 1.2 + 0.8 sin(x/1.8) is drawn over [0, 8] with its left Riemann
 * rectangles; the count n steps 4 -> 48 and the area estimate converges
 * towards the analytic value, both shown as readouts together with the error.
 * Corner |_ brackets, a faint axis cross and the formula close the panel.
 *
 *   xwww scene run scene.js --fps 4 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const A = 8;
const EXACT = 1.2 * 8 + 0.8 * 1.8 * (1 - Math.cos(8 / 1.8));

function fn(x) { return 1.2 + 0.8 * Math.sin(x / 1.8); }
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
  const cx = w / 2;
  const m = s(36);
  const plotX = w * 0.10, plotW = w * 0.80;
  const baseY = h * 0.72, topY = h * 0.14;
  const unitY = (baseY - topY) / 2.2;
  const sx = (x) => plotX + (x / A) * plotW;
  const sy = (y) => baseY - y * unitY;

  const n = 4 * (1 + ((Math.floor(t / 2) + 5) % 12));

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* Grid + axes. */
  for (let i = 0; i <= 8; i++) {
    hairline(sx(i), topY, sx(i), baseY, withAlpha(k.border, i % 2 === 0 ? 0.5 : 0.25), 1 * scale);
  }
  for (let j = 0; j <= 4; j++) {
    const y = topY + (j / 4) * (baseY - topY);
    hairline(plotX, y, plotX + plotW, y, withAlpha(k.border, j % 2 === 0 ? 0.5 : 0.25), 1 * scale);
  }
  hairline(plotX, baseY, plotX + plotW, baseY, withAlpha(k.neon[3], 0.45), 1.4 * scale);
  hairline(plotX, topY, plotX, baseY, withAlpha(k.neon[3], 0.45), 1.4 * scale);

  /* Rectangles. */
  const dx = A / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x = i * dx;
    const height = fn(x);
    sum += height * dx;
    const color = k.neon[i % k.neon.length];
    canvas.fill(withAlpha(color, 0.42));
    canvas.rect(sx(x), sy(height), sx(x + dx) - sx(x) - 1.5 * scale, baseY - sy(height));
    hairline(sx(x), sy(height), sx(x + dx), sy(height), withAlpha(color, 0.8), 1 * scale);
  }

  /* Curve on top. */
  let px = sx(0), py = sy(fn(0));
  for (let i = 1; i <= 240; i++) {
    const x = (A * i) / 240;
    hairline(px, py, sx(x), sy(fn(x)), withAlpha(k.accent, 0.95), 2.4 * scale);
    px = sx(x); py = sy(fn(x));
  }

  const error = Math.abs(sum - EXACT);
  text("n = " + n, m + s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MONO);
  text("A_n = " + sum.toFixed(4), cx, h - m - s(96), s(24), withAlpha(k.neon[5], 0.95), MATH, "middle");
  text("ERROR = " + error.toFixed(4) + " \u00B7 EXACT = " + EXACT.toFixed(4), cx, h - m - s(62), s(18), withAlpha(k.secondary, 0.9), MATH, "middle");
  text("\u222B\u2080\u2078 f(x) dx \u2248 \u03A3 f(x\u1D62) \u0394x", cx, h - m - s(22), s(30), withAlpha(k.neon[4], 0.95), MATH, "middle");
  text("RIEMANN_SUM // 04", m + s(56), h - m - s(34), s(18), withAlpha(k.disabled, 0.9), MONO);
  text("LEFT ENDPOINTS", w - m - s(56), m + s(34), s(18), withAlpha(k.secondary, 0.9), MONO, "end");

  corners(w, h, m, s(64), withAlpha(k.neon[1], 0.9));
  canvas.alpha(1.0);
}
