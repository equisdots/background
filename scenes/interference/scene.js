/*
 * interference - the field of two coherent wave sources.
 *
 * Two point sources emit expanding wavefront rings while the whole plane is
 * sampled as a lattice of dots whose brightness follows
 * cos(k(r1 - r2) - wt), so the hyperbolic nodal lines drift and breathe.
 * Palette colours separate the two sources; corner |_ brackets frame the
 * field and the wave equation sits below it.
 *
 *   xwww scene run scene.js --fps 10 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const GAP = 0.26;

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
  const cy = h * 0.44;
  const gap = w * GAP;
  const s1 = [w / 2 - gap / 2, cy];
  const s2 = [w / 2 + gap / 2, cy];
  const lambda = s(110);
  const kk = (2 * Math.PI) / lambda;
  const omega = 2.6;
  const fieldTop = m + s(40);
  const fieldBottom = h - m - s(150);

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* Intensity lattice. */
  const step = s(30);
  for (let x = m + s(20); x < w - m - s(20); x += step) {
    for (let y = fieldTop; y < fieldBottom; y += step) {
      const r1 = Math.sqrt((x - s1[0]) * (x - s1[0]) + (y - s1[1]) * (y - s1[1]));
      const r2 = Math.sqrt((x - s2[0]) * (x - s2[0]) + (y - s2[1]) * (y - s2[1]));
      const intensity = 0.5 + 0.5 * Math.cos(kk * (r1 - r2) - omega * t);
      canvas.fill(withAlpha(k.neon[4], 0.07 + 0.38 * intensity));
      canvas.circle(x, y, 1.8 * scale);
    }
  }

  /* Expanding wavefronts around each source (distinct colours). */
  canvas.fill("#00000000");
  const maxR = Math.sqrt(w * w + h * h) * 0.75;
  for (let src = 0; src < 2; src++) {
    const color = src === 0 ? k.neon[0] : k.neon[2];
    const cx = src === 0 ? s1[0] : s2[0];
    const cyy = src === 0 ? s1[1] : s2[1];
    for (let i = 0; i < 7; i++) {
      const radius = ((t * s(46) + i * lambda) % maxR);
      const alpha = 0.30 * (1 - radius / maxR);
      if (alpha <= 0.01) continue;
      canvas.stroke(withAlpha(color, alpha), 1.4 * scale);
      canvas.circle(cx, cyy, radius);
    }
  }

  /* Sources. */
  for (let src = 0; src < 2; src++) {
    const color = src === 0 ? k.neon[0] : k.neon[2];
    const x = src === 0 ? s1[0] : s2[0];
    canvas.fill(withAlpha(color, 0.95));
    canvas.circle(x, s1[1], 4 * scale);
  }

  text("\u03BB = " + lambda.toFixed(0) + "px \u00B7 d = " + gap.toFixed(0) + "px", m + s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MATH);
  text("S1", s1[0] - s(34), s1[1] + s(6), s(18), withAlpha(k.neon[0], 0.95), MONO, "end");
  text("S2", s2[0] + s(34), s1[1] + s(6), s(18), withAlpha(k.neon[2], 0.95), MONO);
  text("\u03C8 = cos(kr\u2081 \u2212 \u03C9t) + cos(kr\u2082 \u2212 \u03C9t)", w / 2, h - m - s(52), s(32), withAlpha(k.neon[5], 0.95), MATH, "middle");
  text("INTERFERENCE // 10 \u00B7 NODAL LINES DRIFT WITH PHASE", w / 2, h - m - s(18), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");

  corners(w, h, m, s(64), withAlpha(k.neon[1], 0.9));
  canvas.alpha(1.0);
}
