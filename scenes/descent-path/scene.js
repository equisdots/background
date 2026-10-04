/*
 * descent-path - gradient descent sliding into a quadratic valley.
 *
 * The contour lines of f(x, y) = 0.5(x^2/4 + y^2) frame the plane while a
 * precomputed gradient-descent path (60 steps) descends to the minimum; a
 * bright rider walks the path, the gradient field points downhill in faint
 * arrows, and loss / learning rate / step are read out. Corner |_ brackets.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const ETA = 0.55;
const STEPS = 60;
const START = [7.4, -4.6];

let PATH = null;

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

function loss(x, y) { return 0.5 * ((x * x) / 4 + y * y); }
function grad(x, y) { return [x / 4, y]; }

function setup(ctx) {
  scale = ctx.width / DESIGN_W;
  s = (v) => v * scale;
  canvas.clear(tokens(ctx.palette).bg);
  if (PATH) return;
  PATH = [];
  let x = START[0], y = START[1];
  for (let i = 0; i < STEPS; i++) {
    PATH.push([x, y]);
    const g = grad(x, y);
    x -= ETA * g[0];
    y -= ETA * g[1];
  }
}

function render(t, ctx) {
  const k = tokens(ctx.palette);
  const w = ctx.width, h = ctx.height;
  const cx = w / 2, cy = h * 0.47;
  const unit = Math.min(w / 18, h / 11);
  const m = s(36);
  const px = (x) => cx + x * unit;
  const py = (y) => cy - y * unit;

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* Grid. */
  for (let i = -9; i <= 9; i++) {
    hairline(px(i), 0, px(i), h, withAlpha(k.border, i % 3 === 0 ? 0.45 : 0.20), 1 * scale);
  }
  for (let j = -5; j <= 5; j++) {
    hairline(0, py(j), w, py(j), withAlpha(k.border, j % 3 === 0 ? 0.45 : 0.20), 1 * scale);
  }
  hairline(cx, 0, cx, h, withAlpha(k.neon[3], 0.30), 1.3 * scale);
  hairline(0, cy, w, cy, withAlpha(k.neon[3], 0.30), 1.3 * scale);

  /* Contours of the quadratic. */
  for (let l = 1; l <= 8; l++) {
    const L = l * 1.1;
    const a = 2 * Math.sqrt(2 * L);
    const b = Math.sqrt(2 * L);
    canvas.stroke(withAlpha(k.neon[l % k.neon.length], 0.30), 1.2 * scale);
    let first = true;
    let sx = 0, sy = 0;
    for (let i = 0; i <= 72; i++) {
      const th = (2 * Math.PI * i) / 72;
      const x = px(a * Math.cos(th)), y = py(b * Math.sin(th));
      if (!first) hairline(sx, sy, x, y, withAlpha(k.neon[l % k.neon.length], 0.30), 1.2 * scale);
      sx = x; sy = y; first = false;
    }
  }

  /* Downhill gradient arrows. */
  for (let i = -7; i <= 7; i += 2) {
    for (let j = -4; j <= 4; j += 2) {
      const g = grad(i, j);
      const len = Math.sqrt(g[0] * g[0] + g[1] * g[1]) || 1;
      const x = px(i), y = py(j);
      hairline(x, y, x - (g[0] / len) * 14 * scale, y + (g[1] / len) * 14 * scale, withAlpha(k.neon[4], 0.35), 1.2 * scale);
    }
  }

  /* Descent path. */
  let lx = px(PATH[0][0]), ly = py(PATH[0][1]);
  for (let i = 1; i < PATH.length; i++) {
    const x = px(PATH[i][0]), y = py(PATH[i][1]);
    hairline(lx, ly, x, y, withAlpha(k.accent, 0.85), 2.2 * scale);
    lx = x; ly = y;
  }
  for (let i = 0; i < PATH.length; i += 2) {
    canvas.fill(withAlpha(k.neon[i % k.neon.length], 0.75));
    canvas.circle(px(PATH[i][0]), py(PATH[i][1]), 2.1 * scale);
  }

  const step = Math.floor(t * 4) % STEPS;
  const cur = PATH[step];
  for (let q = 7; q >= 0; q--) {
    const idx = Math.max(0, step - q);
    canvas.fill(withAlpha(k.neon[6], 0.85 - q * 0.10));
    canvas.circle(px(PATH[idx][0]), py(PATH[idx][1]), Math.max(1.2, 3.8 - q * 0.32) * scale);
  }

  text("LOSS = " + loss(cur[0], cur[1]).toFixed(4), m + s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MATH);
  text("STEP " + step + "/" + STEPS + " \u00B7 \u03B7 = " + ETA.toFixed(2), w - m - s(56), m + s(34), s(20), withAlpha(k.secondary, 0.95), MONO, "end");
  text("x\u2096\u208A\u2081 = x\u2096 \u2212 \u03B7 \u2207f(x\u2096)", cx, h - m - s(52), s(32), withAlpha(k.neon[5], 0.95), MATH, "middle");
  text("DESCENT_PATH // 09 \u00B7 f(x,y) = \u00BD(x\u00B2/4 + y\u00B2)", cx, h - m - s(18), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");

  corners(w, h, m, s(64), withAlpha(k.neon[4], 0.9));
  canvas.alpha(1.0);
}
