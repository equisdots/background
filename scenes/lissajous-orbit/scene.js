/*
 * lissajous-orbit - parametric curves drawing themselves.
 *
 * Three ghost Lissajous ratios hang faintly in the plane while the active
 * ratio (cycling 3:2, 5:4, 7:5, 9:7) is traced by a glowing head with a short
 * trailing arc; the phase delta drifts. Corner |_ brackets, a coordinate
 * readout, the parametric formula and the current ratio sit around the plot.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const RATIOS = [[3, 2], [5, 4], [7, 5], [9, 7]];

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
  const cx = w / 2, cy = h * 0.47;
  const R = Math.min(w, h) * 0.34;
  const m = s(36);

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* Grid + reference box. */
  for (let i = -6; i <= 6; i++) {
    hairline(cx + (i / 6) * R, cy - R * 1.15, cx + (i / 6) * R, cy + R * 1.15, withAlpha(k.border, i % 2 === 0 ? 0.5 : 0.25), 1 * scale);
    hairline(cx - R * 1.15, cy + (i / 6) * R, cx + R * 1.15, cy + (i / 6) * R, withAlpha(k.border, i % 2 === 0 ? 0.5 : 0.25), 1 * scale);
  }
  canvas.stroke(withAlpha(k.neon[3], 0.30), 1.3 * scale);
  canvas.circle(cx, cy, R);
  canvas.circle(cx, cy, R * 0.5);

  const active = Math.floor(t / 8) % RATIOS.length;
  const a = RATIOS[active][0], b = RATIOS[active][1];
  const delta = Math.PI / 4 + Math.PI / 2 * Math.sin(t * 0.2);

  /* Ghost curves for the other ratios. */
  for (let r = 0; r < RATIOS.length; r++) {
    if (r === active) continue;
    const ga = RATIOS[r][0], gb = RATIOS[r][1];
    const color = withAlpha(k.neon[r + 1], 0.22);
    let px = cx, py = cy;
    for (let i = 0; i <= 260; i++) {
      const u = (2 * Math.PI * i) / 260;
      const x = cx + Math.sin(ga * u) * R;
      const y = cy - Math.sin(gb * u + Math.PI / 3) * R;
      if (i > 0) hairline(px, py, x, y, color, 1.1 * scale);
      px = x; py = y;
    }
  }

  /* Active curve + trailing head. */
  const u0 = (t * 0.9) % (2 * Math.PI);
  const tail = 1.9;
  let px = cx + Math.sin(a * (u0 - tail) + delta) * R;
  let py = cy - Math.sin(b * (u0 - tail)) * R;
  for (let i = 1; i <= 70; i++) {
    const u = u0 - tail + (tail * i) / 70;
    const x = cx + Math.sin(a * u + delta) * R;
    const y = cy - Math.sin(b * u) * R;
    hairline(px, py, x, y, withAlpha(k.accent, 0.25 + 0.7 * (i / 70)), 2.3 * scale);
    px = x; py = y;
  }
  canvas.fill(withAlpha(k.neon[6], 0.95));
  canvas.circle(px, py, 3.5 * scale);

  const hx = (px - cx) / R, hy = -(py - cy) / R;
  text("(x, y) = (" + hx.toFixed(3) + ", " + hy.toFixed(3) + ")", cx, cy + R * 1.15 + s(46), s(20), withAlpha(k.text, 0.9), MONO, "middle");
  text("a:b = " + a + ":" + b + " \u00B7 \u03B4 = " + (delta / Math.PI).toFixed(3) + "\u03C0", cx, cy + R * 1.15 + s(76), s(18), withAlpha(k.disabled, 0.9), MONO, "middle");

  text("x = sin(at + \u03B4) \u00B7 y = sin(bt)", cx, h - m - s(58), s(34), withAlpha(k.neon[4], 0.95), MATH, "middle");
  text("LISSAJOUS ORBIT // 02", m + s(56), m + s(34), s(18), withAlpha(k.secondary, 0.9), MONO);
  text("RATIO " + (active + 1) + "/" + RATIOS.length, w - m - s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MONO, "end");

  corners(w, h, m, s(64), withAlpha(k.neon[2], 0.9));
  canvas.alpha(1.0);
}
