/*
 * fourier-synth - a square wave being rebuilt from its odd harmonics.
 *
 * The screen is a faint cartesian plane. A dashed reference square wave sits
 * in the background while the first four odd harmonics (coloured) are stacked
 * and their partial sum (accent) sharpens towards the step; the number of
 * harmonics N grows and resets, and a small spectrum of 1/n bars fills the
 * lower band. Corner |_ brackets frame the surface; the formula and the N
 * readout sit below the centre.
 *
 *   xwww scene run scene.js --fps 10 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";

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
  const cx = w / 2, cy = h * 0.48;
  const span = w * 0.42;
  const unitY = h * 0.14;
  const m = s(36);

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* Grid. */
  for (let i = -8; i <= 8; i++) {
    hairline(cx + (i / 8) * span, 0, cx + (i / 8) * span, h, withAlpha(k.border, i % 2 === 0 ? 0.5 : 0.25), 1 * scale);
  }
  for (let j = -4; j <= 4; j++) {
    hairline(0, cy + j * unitY, w, cy + j * unitY, withAlpha(k.border, j % 2 === 0 ? 0.5 : 0.25), 1 * scale);
  }
  hairline(cx, 0, cx, h, withAlpha(k.neon[3], 0.28), 1.3 * scale);
  hairline(0, cy, w, cy, withAlpha(k.neon[3], 0.28), 1.3 * scale);

  const N = 1 + 2 * (Math.floor(t / 0.5) % 16);
  const sx = (x) => cx + (x / Math.PI) * span;
  const sy = (y) => cy - y * unitY;

  /* Reference square wave (dashed). */
  let prevX = sx(-Math.PI), prevY = sy(1);
  for (let i = 1; i <= 120; i++) {
    const x = -Math.PI + (2 * Math.PI * i) / 120;
    const y = Math.sin(x) >= 0 ? 1 : -1;
    hairline(prevX, prevY, sx(x), sy(y), withAlpha(k.disabled, 0.5), 1.2 * scale);
    prevX = sx(x); prevY = sy(y);
  }

  /* Individual odd harmonics 1, 3, 5, 7 (faint, coloured). */
  const shown = [1, 3, 5, 7];
  for (let hIdx = 0; hIdx < shown.length; hIdx++) {
    const n = shown[hIdx];
    if (n > N) continue;
    const color = withAlpha(k.neon[(hIdx + Math.floor(t * 0.4)) % k.neon.length], 0.35);
    let px = sx(-Math.PI), py = sy(0);
    for (let i = 1; i <= 220; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 220;
      const y = (4 / Math.PI) * Math.sin(n * x) / n;
      hairline(px, py, sx(x), sy(y), color, 1.1 * scale);
      px = sx(x); py = sy(y);
    }
  }

  /* Partial sum. */
  const sumColor = k.accent;
  let px = sx(-Math.PI), py = sy(0);
  for (let i = 1; i <= 320; i++) {
    const x = -Math.PI + (2 * Math.PI * i) / 320;
    let y = 0;
    for (let n = 1; n <= N; n += 2) y += Math.sin(n * x) / n;
    y *= 4 / Math.PI;
    hairline(px, py, sx(x), sy(y), sumColor, 2.4 * scale);
    px = sx(x); py = sy(y);
  }

  /* Spectrum bars: 1/n for odd n, active ones coloured. */
  const bars = 16, bw = (w * 0.36) / bars, bx = m + s(40), by = h - m - s(96);
  for (let i = 0; i < bars; i++) {
    const n = 2 * i + 1;
    const bh = (h * 0.10) / n;
    const active = n <= N;
    canvas.fill(active ? withAlpha(k.neon[(i + Math.floor(t * 0.6)) % k.neon.length], 0.85) : withAlpha(k.border, 0.7));
    canvas.rect(bx + i * bw, by - bh, bw * 0.62, bh);
  }
  text("HARMONIC_SPECTRUM \u00B7 1/n", bx, by + s(24), s(16), withAlpha(k.disabled, 0.9), MONO);

  /* Formula + readout. */
  text("S_N(x) = (4/\u03C0) \u03A3 sin(nx)/n", cx, h - m - s(64), s(36), withAlpha(k.neon[5], 0.95), MATH, "middle");
  text("n ODD \u00B7 N = " + N + " \u00B7 GIBBS PHENOMENON", cx, h - m - s(28), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");

  text("FOURIER_SYNTH // 01", m + s(56), m + s(34), s(18), withAlpha(k.secondary, 0.9), MONO);
  text("N = " + N, w - m - s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MONO, "end");

  corners(w, h, m, s(64), withAlpha(k.neon[4], 0.9));
  canvas.alpha(1.0);
}
