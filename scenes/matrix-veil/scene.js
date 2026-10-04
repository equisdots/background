/*
 * matrix-veil - a live linear map deforming the plane.
 *
 * The transformed grid, the images of the basis vectors, the image of the
 * unit square (area = |det A|) and a rider point with a tail all follow
 * A(t) = [[a, b], [c, d]] while its entries drift on slow sines. The map
 * equations and the current determinant sit below; the original grid stays
 * faint behind. Thin lines, palette colours, corner |_ brackets.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
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
  const cx = w / 2, cy = h * 0.44;
  const unit = Math.min(w / 12, h / 7);
  const m = s(36);
  const a = 1.15 + 0.45 * Math.cos(t * 0.23);
  const b = 0.55 * Math.cos(t * 0.31);
  const c = 0.55 * Math.sin(t * 0.19);
  const d = 0.95 + 0.40 * Math.cos(t * 0.27);
  const det = a * d - b * c;
  const mapX = (x, y) => cx + (a * x + b * y) * unit;
  const mapY = (x, y) => cy - (c * x + d * y) * unit;

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* Original (identity) grid, faint. */
  for (let i = -6; i <= 6; i++) {
    hairline(cx + i * unit, cy - 3 * unit, cx + i * unit, cy + 3 * unit, withAlpha(k.border, i % 2 === 0 ? 0.40 : 0.18), 1 * scale);
    hairline(cx - 6 * unit, cy + i * unit, cx + 6 * unit, cy + i * unit, withAlpha(k.border, i % 2 === 0 ? 0.40 : 0.18), 1 * scale);
  }
  canvas.stroke(withAlpha(k.neon[3], 0.22), 1.2 * scale);
  canvas.circle(cx, cy, unit);
  hairline(cx, 0, cx, h, withAlpha(k.neon[3], 0.26), 1.3 * scale);
  hairline(0, cy, w, cy, withAlpha(k.neon[3], 0.26), 1.3 * scale);

  /* Transformed grid. */
  for (let i = -5; i <= 5; i++) {
    let lx = mapX(i, -5), ly = mapY(i, -5);
    for (let j = -4; j <= 5; j += 0.5) {
      const x = mapX(i, j), y = mapY(i, j);
      hairline(lx, ly, x, y, withAlpha(k.neon[(i + 6) % k.neon.length], 0.42), 1.2 * scale);
      lx = x; ly = y;
    }
    lx = mapX(-5, i); ly = mapY(-5, i);
    for (let j = -4; j <= 5; j += 0.5) {
      const x = mapX(j, i), y = mapY(j, i);
      hairline(lx, ly, x, y, withAlpha(k.neon[(i + 9) % k.neon.length], 0.35), 1.1 * scale);
      lx = x; ly = y;
    }
  }

  /* Image of the unit square: parallelogram, area = |det|. */
  canvas.fill(withAlpha(k.neon[1], 0.14));
  canvas.begin_path();
  canvas.move_to(mapX(0, 0), mapY(0, 0));
  canvas.line_to(mapX(1, 0), mapY(1, 0));
  canvas.line_to(mapX(1, 1), mapY(1, 1));
  canvas.line_to(mapX(0, 1), mapY(0, 1));
  canvas.close_path();
  canvas.fill_path();
  canvas.fill("#00000000");
  hairline(mapX(0, 0), mapY(0, 0), mapX(1, 0), mapY(1, 0), withAlpha(k.neon[1], 0.8), 1.8 * scale);
  hairline(mapX(1, 0), mapY(1, 0), mapX(1, 1), mapY(1, 1), withAlpha(k.neon[1], 0.8), 1.8 * scale);
  hairline(mapX(1, 1), mapY(1, 1), mapX(0, 1), mapY(0, 1), withAlpha(k.neon[1], 0.8), 1.8 * scale);
  hairline(mapX(0, 1), mapY(0, 1), mapX(0, 0), mapY(0, 0), withAlpha(k.neon[1], 0.8), 1.8 * scale);
  text("|det| = " + Math.abs(det).toFixed(3), mapX(0.5, 0.5), mapY(0.5, 0.5) - s(10), s(20), withAlpha(k.neon[1], 0.95), MATH, "middle");

  /* Basis images. */
  hairline(cx, cy, mapX(1, 0), mapY(1, 0), withAlpha(k.accent, 0.95), 2.4 * scale);
  hairline(cx, cy, mapX(0, 1), mapY(0, 1), withAlpha(k.neon[5], 0.95), 2.4 * scale);
  text("A\u00B7e\u2081", mapX(1.06, -0.08), mapY(1.06, -0.08), s(22), withAlpha(k.accent, 0.95), MATH);
  text("A\u00B7e\u2082", mapX(-0.08, 1.06), mapY(-0.08, 1.06), s(22), withAlpha(k.neon[5], 0.95), MATH);

  /* Rider: image of a rotating unit point, single-dot tail. */
  for (let q = 6; q >= 0; q--) {
    const ang = t * 0.8 - q * 0.10;
    const px = Math.cos(ang) * 1.35, py = Math.sin(ang) * 1.35;
    canvas.fill(withAlpha(k.neon[6], 0.85 - q * 0.10));
    canvas.circle(mapX(px, py), mapY(px, py), Math.max(1.2, 3.6 - q * 0.34) * scale);
  }

  text("a = " + a.toFixed(3) + "  b = " + b.toFixed(3) + "  c = " + c.toFixed(3) + "  d = " + d.toFixed(3), m + s(56), m + s(36), s(19), withAlpha(k.accent, 0.95), MATH);
  text("\u2206 = " + det.toFixed(3), w - m - s(56), m + s(36), s(21), Math.abs(det) < 0.12 ? withAlpha(k.neon[0], 0.95) : withAlpha(k.neon[2], 0.95), MATH, "end");
  text("x\u2032 = ax + by \u00B7 y\u2032 = cx + dy", cx, h - m - s(58), s(32), withAlpha(k.neon[4], 0.95), MATH, "middle");
  text("LIVE LINEAR MAP \u00B7 UNIT SQUARE IMAGE = |det A|", cx, h - m - s(22), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");
  text("MATRIX_VEIL // 12", m + s(56), h - m - s(24), s(18), withAlpha(k.disabled, 0.9), MONO);

  corners(w, h, m, s(64), withAlpha(k.neon[3], 0.9));
  canvas.alpha(1.0);
}
