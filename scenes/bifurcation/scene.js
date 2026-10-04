/*
 * bifurcation - the logistic map growing its period-doubling tree.
 *
 * For r from 2.5 to 4.0 the attractor of x_{n+1} = r x_n (1 - x_n) is
 * precomputed (22 iterates after a 120-step warm-up) and drawn column by
 * column, revealing the period-doubling cascade into chaos; the current r is
 * marked and read out. Corner |_ brackets and the formula close the panel.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const COLS = 320;
const ITER = 22;
const CYCLE = 16;
const DRAW = 9;
const HOLD = 4;

let ATTRACT = null;

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
  if (ATTRACT) return;
  ATTRACT = [];
  for (let c = 0; c < COLS; c++) {
    const r = 2.5 + (1.5 * c) / (COLS - 1);
    let x = 0.5;
    for (let i = 0; i < 120; i++) x = r * x * (1 - x);
    const ys = [];
    for (let i = 0; i < ITER; i++) {
      x = r * x * (1 - x);
      ys.push(x);
    }
    ATTRACT.push(ys);
  }
}

function render(t, ctx) {
  const k = tokens(ctx.palette);
  const w = ctx.width, h = ctx.height;
  const m = s(36);
  const plotX = w * 0.10, plotW = w * 0.82;
  const baseY = h * 0.80, topY = h * 0.12;
  const plotH = baseY - topY;

  const phase = (t + DRAW + HOLD - 1.0) % CYCLE;
  const reveal = Math.min(1, phase / DRAW);
  const fade = phase > DRAW + HOLD ? Math.max(0.25, 1 - (phase - DRAW - HOLD) / (CYCLE - DRAW - HOLD)) : 1;
  const shownCols = Math.floor(reveal * COLS);

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  for (let i = 0; i <= 6; i++) {
    const x = plotX + (i / 6) * plotW;
    hairline(x, topY, x, baseY, withAlpha(k.border, 0.4), 1 * scale);
    text((2.5 + (1.5 * i) / 6).toFixed(2), x, baseY + s(30), s(16), withAlpha(k.disabled, 0.9), MONO, "middle");
  }
  for (let j = 0; j <= 4; j++) {
    const y = topY + (j / 4) * plotH;
    hairline(plotX, y, plotX + plotW, y, withAlpha(k.border, 0.4), 1 * scale);
    text((1 - j / 4).toFixed(1), plotX - s(18), y + s(6), s(16), withAlpha(k.disabled, 0.9), MONO, "end");
  }
  hairline(plotX, baseY, plotX + plotW, baseY, withAlpha(k.neon[3], 0.5), 1.5 * scale);
  hairline(plotX, topY, plotX, baseY, withAlpha(k.neon[3], 0.5), 1.5 * scale);

  for (let c = 0; c < shownCols; c++) {
    const x = plotX + (c / (COLS - 1)) * plotW;
    const color = k.neon[c % k.neon.length];
    const ys = ATTRACT[c];
    canvas.fill(withAlpha(color, 0.55 * fade));
    for (let i = 0; i < ys.length; i++) {
      canvas.circle(x, baseY - ys[i] * plotH, 1.4 * scale);
    }
  }
  if (shownCols > 0 && shownCols < COLS) {
    const x = plotX + (shownCols / (COLS - 1)) * plotW;
    hairline(x, topY, x, baseY, withAlpha(k.accent, 0.5), 1.4 * scale);
  }

  const rNow = 2.5 + (1.5 * Math.max(0, shownCols - 1)) / (COLS - 1);
  text("r = " + rNow.toFixed(4), m + s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MATH);
  text(ITER + " ITERATES \u00B7 WARM-UP 120", w - m - s(56), m + s(34), s(18), withAlpha(k.secondary, 0.9), MONO, "end");
  text("x\u2099\u208A\u2081 = r x\u2099 (1 \u2212 x\u2099)", w / 2, h - m - s(52), s(32), withAlpha(k.neon[4], 0.95), MATH, "middle");
  text("BIFURCATION // 08 \u00B7 PERIOD DOUBLING \u2192 CHAOS", w / 2, h - m - s(18), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");

  corners(w, h, m, s(64), withAlpha(k.neon[5], 0.9));
  canvas.alpha(1.0);
}
