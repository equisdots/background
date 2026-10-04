/*
 * field-lines - a rotating vector field with orbiting particles.
 *
 * A quiver of short arrows samples F(x, y) = (-y, x) on a lattice while
 * ninety particles ride closed circular orbits (closed-form positions, so
 * every frame is deterministic); each particle leaves a short fading tail.
 * Reference rings show the field magnitude, and the curl/divergence readouts
 * and formula close the panel. Corner |_ brackets frame the surface.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const COLS = 15;
const ROWS = 8;
const PARTICLES = 90;

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
function arrow(x, y, dx, dy, color, width) {
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len, uy = dy / len;
  const ex = x + ux * len * 22 * scale, ey = y + uy * len * 22 * scale;
  hairline(x, y, ex, ey, color, width);
  const hx = ex - ux * 7 * scale, hy = ey - uy * 7 * scale;
  hairline(ex, ey, hx - uy * 4 * scale, hy + ux * 4 * scale, color, width);
  hairline(ex, ey, hx + uy * 4 * scale, hy - ux * 4 * scale, color, width);
}

function setup(ctx) { scale = ctx.width / DESIGN_W; s = (v) => v * scale; canvas.clear(tokens(ctx.palette).bg); }

function render(t, ctx) {
  const k = tokens(ctx.palette);
  const w = ctx.width, h = ctx.height;
  const cx = w / 2, cy = h * 0.47;
  const R = Math.min(w, h) * 0.36;
  const m = s(36);

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* Magnitude rings. */
  canvas.stroke(withAlpha(k.neon[3], 0.22), 1.2 * scale);
  canvas.circle(cx, cy, R);
  canvas.circle(cx, cy, R * 0.66);
  canvas.circle(cx, cy, R * 0.33);
  hairline(cx - R, cy, cx + R, cy, withAlpha(k.border, 0.8), 1 * scale);
  hairline(cx, cy - R, cx, cy + R, withAlpha(k.border, 0.8), 1 * scale);

  /* Lattice quiver of F = (-y, x). */
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const x = cx - R + (2 * R * i) / (COLS - 1);
      const y = cy - R * 0.72 + (1.44 * R * j) / (ROWS - 1);
      const dx = -(y - cy), dy = x - cx;
      const size = Math.sqrt(dx * dx + dy * dy) || 1;
      const norm = Math.min(1, (size / R) * 1.4 + 0.25);
      const color = withAlpha(k.neon[(i + j) % k.neon.length], 0.22 + 0.25 * norm);
      arrow(x, y, (dx / size) * norm, (dy / size) * norm, color, 1.2 * scale);
    }
  }

  /* Particles on closed circular orbits with short tails. */
  for (let i = 0; i < PARTICLES; i++) {
    const r = (0.10 + 0.88 * (i / PARTICLES)) * R;
    const phase = (hash(i, 5) / 4294967295) * 2 * Math.PI;
    const speed = 0.55 / (0.4 + (r / R) * 1.2);
    const color = k.neon[(i + Math.floor(t * 0.5)) % k.neon.length];
    let px = 0, py = 0;
    for (let q = 0; q < 3; q++) {
      const ang = phase + speed * (t - 0.09 * q);
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r * 0.72;
      if (q === 0) { px = x; py = y; }
      else {
        hairline(px, py, x, y, withAlpha(color, 0.40 - 0.12 * q), 1.4 * scale);
        px = x; py = y;
      }
    }
    canvas.fill(withAlpha(color, 0.95));
    canvas.circle(px, py, 2.2 * scale);
  }

  text("\u2207 \u00D7 F = 2.00", m + s(56), h - m - s(96), s(22), withAlpha(k.neon[2], 0.95), MATH);
  text("\u2207 \u00B7 F = 0.00", m + s(56), h - m - s(62), s(22), withAlpha(k.neon[4], 0.95), MATH);
  text("F(x, y) = (\u2212y, x)", cx, h - m - s(58), s(34), withAlpha(k.neon[5], 0.95), MATH, "middle");
  text("PURE ROTATION \u00B7 " + PARTICLES + " ORBITS", cx, h - m - s(24), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");

  text("FIELD_LINES // 03", m + s(56), m + s(34), s(18), withAlpha(k.secondary, 0.9), MONO);
  text("CURL 2.0", w - m - s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MONO, "end");

  corners(w, h, m, s(64), withAlpha(k.neon[1], 0.9));
  canvas.alpha(1.0);
}
