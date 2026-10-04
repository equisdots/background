/*
 * asymptote-veil - the graph of an asymptote, drawn towards its limit.
 *
 * A faint cartesian plane with dashed asymptotes on both axes. The hyperbola
 * f(x) = 1/x is revealed from the far sides towards x = 0 with a geometric
 * ease, so the stroke slows down as it approaches the vertical asymptote;
 * both branches advance in mirror. The formula and the limits sit below the
 * centre. Thin lines, distinct palette colours, hold and fade cycle.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const CYCLE = 18; /* seconds: 13 approach + 3 hold + 2 fade */
const APPROACH = 13;
const HOLD = 3;
const X_START = 5.6;
const X_END = 0.55;

function channels(hex) {
  const s = hex.replace(/^#/, "");
  return [
    parseInt(s.slice(0, 2), 16) || 0,
    parseInt(s.slice(2, 4), 16) || 0,
    parseInt(s.slice(4, 6), 16) || 0,
  ];
}

function mixHex(a, b, t) {
  const ca = channels(a);
  const cb = channels(b);
  const to = (v) => Math.round(v).toString(16).padStart(2, "0");
  return "#" + to(ca[0] + (cb[0] - ca[0]) * t) + to(ca[1] + (cb[1] - ca[1]) * t) + to(ca[2] + (cb[2] - ca[2]) * t);
}

function withAlpha(hex, alpha) {
  const byte = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return hex.slice(0, 7) + byte.toString(16).padStart(2, "0").toUpperCase();
}

function tokens(palette) {
  const bg = palette.background.hex;
  const fg = palette.foreground.hex;
  const roles = palette.roles || {};
  const colors = palette.colors || [];
  const at = (i, fb) => (colors[i] && colors[i].hex) || fb;
  return {
    bg: bg,
    text: fg,
    secondary: mixHex(bg, fg, 0.58),
    disabled: mixHex(bg, fg, 0.34),
    border: mixHex(bg, fg, 0.12),
    accent: (roles.workspaceActive && roles.workspaceActive.hex) || at(1, fg),
    neon: [at(1, fg), at(2, fg), at(3, fg), at(4, fg), at(5, fg), at(6, fg), at(7, fg), fg],
  };
}

let scale = 1;
let s = (v) => v * scale;

function text(str, x, y, size, color, family, anchor) {
  canvas.text(str, x, y, size, color, { family: family || MONO, anchor: anchor || "start" });
}

function hairline(x1, y1, x2, y2, color, width) {
  canvas.stroke(color, width || 1 * scale);
  canvas.begin_path();
  canvas.move_to(x1, y1);
  canvas.line_to(x2, y2);
  canvas.stroke_path();
}

function dashed(x1, y1, x2, y2, color, width, dash, gap) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  canvas.stroke(color, width);
  let d = 0;
  while (d < len) {
    const e = Math.min(d + dash, len);
    canvas.begin_path();
    canvas.move_to(x1 + ux * d, y1 + uy * d);
    canvas.line_to(x1 + ux * e, y1 + uy * e);
    canvas.stroke_path();
    d = e + gap;
  }
}

function setup(ctx) {
  scale = ctx.width / DESIGN_W;
  s = (v) => v * scale;
  canvas.clear(tokens(ctx.palette).bg);
}

function render(t, ctx) {
  const k = tokens(ctx.palette);
  const w = ctx.width;
  const h = ctx.height;
  const cx = w / 2;
  const cy = h / 2;
  const unitX = w * 0.082;
  const unitY = h * 0.145;

  /* t=0 lands in the hold phase so the scene renders complete for covers. */
  const phase = (t + APPROACH + HOLD - 1.5) % CYCLE;
  const reveal = Math.min(1, phase / APPROACH);
  const fade = phase > APPROACH + HOLD ? Math.max(0, 1 - (phase - APPROACH - HOLD) / (CYCLE - APPROACH - HOLD)) : 1;

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* ── Faint grid ── */
  for (let i = -7; i <= 7; i++) {
    const x = cx + i * unitX;
    hairline(x, 0, x, h, withAlpha(k.border, i % 2 === 0 ? 0.55 : 0.30), 1 * scale);
  }
  for (let j = -5; j <= 5; j++) {
    const y = cy + j * unitY;
    hairline(0, y, w, y, withAlpha(k.border, j % 2 === 0 ? 0.55 : 0.30), 1 * scale);
  }

  /* ── Dashed asymptotes on both axes ── */
  const asym = withAlpha(k.neon[5], 0.55);
  dashed(cx, 0, cx, h - s(150), asym, 1.4 * scale, 14 * scale, 12 * scale);
  dashed(0, cy, w, cy, asym, 1.4 * scale, 14 * scale, 12 * scale);
  text("x = 0", cx + s(14), s(44), s(18), withAlpha(k.neon[5], 0.75), MONO);
  text("y = 0", w - s(28), cy - s(14), s(18), withAlpha(k.neon[5], 0.75), MONO, "end");

  /* ── Sparse tick numbers ── */
  for (let i = -6; i <= 6; i++) {
    if (i === 0) continue;
    const x = cx + i * unitX;
    hairline(x, cy - s(7), x, cy + s(7), withAlpha(k.secondary, 0.35), 1.2 * scale);
    if (i % 2 === 0) {
      text(String(i), x, cy + s(30), s(16), withAlpha(k.disabled, 0.8), MONO, "middle");
    }
  }

  /* ── f(x) = 1/x, revealed towards the vertical asymptote ── */
  const ratio = X_END / X_START;
  const xNow = X_START * Math.pow(ratio, reveal);
  const rightColor = withAlpha(k.accent, 0.9 * fade);
  const leftColor = withAlpha(k.neon[5], 0.9 * fade);

  const STEPS = 90;
  let prevRX = cx + X_START * unitX;
  let prevRY = cy - (1 / X_START) * unitY;
  let prevLX = cx - X_START * unitX;
  let prevLY = cy + (1 / X_START) * unitY;
  for (let i = 1; i <= STEPS; i++) {
    const u = i / STEPS;
    const x = X_START + (xNow - X_START) * u;
    const y = 1 / x;
    const sx = cx + x * unitX;
    const sy = cy - y * unitY;
    hairline(prevRX, prevRY, sx, sy, rightColor, 2.2 * scale);
    hairline(prevLX, prevLY, cx - x * unitX, cy + y * unitY, leftColor, 2.2 * scale);
    prevRX = sx;
    prevRY = sy;
    prevLX = cx - x * unitX;
    prevLY = cy + y * unitY;
  }

  /* Leading dots + limit labels at both heads. */
  const hx = cx + xNow * unitX;
  const hy = cy - (1 / xNow) * unitY;
  const lx = cx - xNow * unitX;
  const ly = cy + (1 / xNow) * unitY;
  /* Comet tail behind each head (single dots, no halo). */
  for (let q = 7; q >= 0; q--) {
    const xq = X_START * Math.pow(ratio, Math.max(0, reveal - q * 0.012));
    const rad = Math.max(1.2, 3.6 - q * 0.3) * scale;
    canvas.fill(withAlpha(k.accent, (0.8 - q * 0.09) * fade));
    canvas.circle(cx + xq * unitX, cy - (1 / xq) * unitY, rad);
    canvas.fill(withAlpha(k.neon[5], (0.8 - q * 0.09) * fade));
    canvas.circle(cx - xq * unitX, cy + (1 / xq) * unitY, rad);
  }
  if (reveal > 0.55) {
    text("x \u2192 0\u207A", hx + s(20), hy + s(6), s(18), withAlpha(k.accent, 0.9), MATH);
    text("x \u2192 0\u207B", lx - s(20), ly + s(6), s(18), withAlpha(k.neon[5], 0.9), MATH, "end");
  }

  /* ── Formula + limits, centred below the origin ── */
  text("f(x) = 1/x", cx, h - s(120), s(40), withAlpha(k.neon[3], 0.95 * fade + 0.05), MATH, "middle");
  text("ASYMPTOTES: x = 0 \u00B7 y = 0", cx, h - s(78), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");

  canvas.alpha(1.0);
}
