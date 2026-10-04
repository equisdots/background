/*
 * complex-veil - the n-th roots of unity on the complex plane.
 *
 * The faint plane becomes the Argand diagram: the unit circle, the spokes to
 * every root, the regular polygon joining them and the n roots themselves all
 * rotate; n steps 3..12, the highlighted root drags a single-dot comet tail
 * and the sum of all roots stays at the origin. Formula and order sit centred
 * below.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const VALS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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
  const cx = w / 2, cy = h * 0.44;
  const R = Math.min(w, h) * 0.30;
  const m = s(36);
  const n = VALS[Math.floor(t / 4) % VALS.length];
  const rot = t * 0.45;
  const root = (idx, angle) => [cx + Math.cos(angle) * R, cy - Math.sin(angle) * R];

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  for (let i = -7; i <= 7; i++) {
    hairline(cx + (i / 7) * R * 1.9, 0, cx + (i / 7) * R * 1.9, h, withAlpha(k.border, i % 2 === 0 ? 0.42 : 0.20), 1 * scale);
    hairline(0, cy + (i / 7) * R * 1.9, w, cy + (i / 7) * R * 1.9, withAlpha(k.border, i % 2 === 0 ? 0.42 : 0.20), 1 * scale);
  }
  hairline(cx - R * 1.25, cy, cx + R * 1.25, cy, withAlpha(k.neon[3], 0.35), 1.4 * scale);
  hairline(cx, cy - R * 1.25, cx, cy + R * 1.25, withAlpha(k.neon[3], 0.35), 1.4 * scale);
  canvas.fill("#00000000");
  canvas.stroke(withAlpha(k.neon[3], 0.55), 1.4 * scale);
  canvas.circle(cx, cy, R);

  /* Spokes to every root. */
  for (let i = 0; i < n; i++) {
    const p = root(i, rot + (2 * Math.PI * i) / n);
    hairline(cx, cy, p[0], p[1], withAlpha(k.neon[i % k.neon.length], 0.28), 1.1 * scale);
  }

  /* Polygon joining the roots. */
  for (let i = 0; i < n; i++) {
    const p = root(i, rot + (2 * Math.PI * i) / n);
    const q = root(i + 1, rot + (2 * Math.PI * (i + 1)) / n);
    hairline(p[0], p[1], q[0], q[1], withAlpha(k.accent, 0.8), 1.8 * scale);
  }

  /* Roots as single dots. */
  for (let i = 0; i < n; i++) {
    const p = root(i, rot + (2 * Math.PI * i) / n);
    canvas.fill(withAlpha(k.neon[i % k.neon.length], 0.95));
    canvas.circle(p[0], p[1], 3.2 * scale);
  }

  /* Highlighted root z0 with a tapering single-dot tail. */
  for (let q = 6; q >= 0; q--) {
    const p = root(0, rot - q * 0.05);
    canvas.fill(withAlpha(k.neon[6], 0.85 - q * 0.10));
    canvas.circle(p[0], p[1], Math.max(1.2, 3.6 - q * 0.34) * scale);
  }
  const head = root(0, rot);
  hairline(cx, cy, head[0], head[1], withAlpha(k.neon[6], 0.7), 1.6 * scale);

  text("n = " + n + " \u00B7 |z\u2096| = 1", m + s(56), m + s(36), s(20), withAlpha(k.accent, 0.95), MATH);
  text("\u03A3 z\u2096 = 0", w - m - s(56), m + s(36), s(20), withAlpha(k.neon[5], 0.95), MATH, "end");
  text("z\u2096 = e^{2\u03C0ik/n}  \u00B7  z\u207F = 1", cx, h - m - s(58), s(34), withAlpha(k.neon[4], 0.95), MATH, "middle");
  text("n-TH ROOTS OF UNITY \u00B7 ROTATING ARGAND DIAGRAM", cx, h - m - s(22), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");
  text("COMPLEX_VEIL // 14", m + s(56), h - m - s(24), s(18), withAlpha(k.disabled, 0.9), MONO);

  corners(w, h, m, s(64), withAlpha(k.neon[6], 0.9));
  canvas.alpha(1.0);
}
