/*
 * monte-carlo - estimating pi by throwing points at a square.
 *
 * A square with its inscribed circle receives a deterministic stream of
 * points (hash-based, so every render matches); the inside/outside points use
 * two palette colours, and the running estimate 4*inside/total converges
 * towards pi across the cycle, then resets. Corner |_ brackets frame the
 * board and the formula sits below it.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const TOTAL = 3200;
const MASK = 4294967295;

function hash(a, b) {
  let h = Math.imul(a, 2654435761) ^ Math.imul(b, 40503);
  h ^= h >>> 13; h = Math.imul(h, 1274126177); h ^= h >>> 16;
  return h >>> 0;
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
  const side = Math.min(w, h) * 0.60;
  const x0 = w / 2 - side / 2;
  const y0 = h * 0.46 - side / 2;

  const cycle = TOTAL + 500;
  const count = Math.floor((t * 420) % cycle);
  const shown = Math.min(count, TOTAL);

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* Board. */
  hairline(x0, y0, x0 + side, y0, withAlpha(k.neon[3], 0.55), 1.6 * scale);
  hairline(x0, y0 + side, x0 + side, y0 + side, withAlpha(k.neon[3], 0.55), 1.6 * scale);
  hairline(x0, y0, x0, y0 + side, withAlpha(k.neon[3], 0.55), 1.6 * scale);
  hairline(x0 + side, y0, x0 + side, y0 + side, withAlpha(k.neon[3], 0.55), 1.6 * scale);
  canvas.stroke(withAlpha(k.neon[4], 0.7), 1.6 * scale);
  canvas.circle(x0 + side / 2, y0 + side / 2, side / 2);

  /* Points + running estimate. */
  let inside = 0;
  for (let i = 0; i < shown; i++) {
    const u = hash(i, 11) / MASK;
    const v = hash(i, 22) / MASK;
    const dx = u - 0.5, dy = v - 0.5;
    const isIn = dx * dx + dy * dy <= 0.25;
    if (isIn) inside++;
    const x = x0 + u * side, y = y0 + v * side;
    if (shown - i < 60) {
      canvas.fill(withAlpha(isIn ? k.neon[2] : k.neon[0], 0.85));
      canvas.circle(x, y, 2.2 * scale);
    } else {
      canvas.fill(withAlpha(isIn ? k.neon[2] : k.neon[0], 0.38));
      canvas.circle(x, y, 1.3 * scale);
    }
  }

  const estimate = shown > 0 ? (4 * inside) / shown : 0;
  const error = Math.abs(estimate - Math.PI);
  text("N = " + shown + " / " + TOTAL, m + s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MONO);
  text("N_in = " + inside, m + s(56), m + s(68), s(20), withAlpha(k.neon[2], 0.95), MATH);
  text("\u03C0 \u2248 " + estimate.toFixed(5), w / 2, y0 + side + s(64), s(34), withAlpha(k.neon[5], 0.95), MATH, "middle");
  text("\u0394 vs \u03C0 = " + error.toFixed(5) + " \u00B7 4N_in/N", w / 2, y0 + side + s(96), s(18), withAlpha(k.disabled, 0.9), MATH, "middle");
  text("MONTE_CARLO // 07", w - m - s(56), m + s(34), s(18), withAlpha(k.secondary, 0.9), MONO, "end");

  corners(w, h, m, s(64), withAlpha(k.neon[2], 0.9));
  canvas.alpha(1.0);
}
