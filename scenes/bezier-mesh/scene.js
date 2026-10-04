/*
 * bezier-mesh - three cubic Beziers with live control nets.
 *
 * Each mesh is drawn as its control polygon (dashed), its four control points
 * (small squares) and the smooth cubic curve; the control points ride slow
 * sine paths, one de Casteljau point travels the first curve, and the
 * coordinates and parameter are read out below. Corner |_ brackets frame it.
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
function dashed(x1, y1, x2, y2, color, dash) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  canvas.stroke(color, 1.4 * scale);
  let d = 0;
  while (d < len) {
    const e = Math.min(d + dash, len);
    canvas.begin_path(); canvas.move_to(x1 + ux * d, y1 + uy * d); canvas.line_to(x1 + ux * e, y1 + uy * e); canvas.stroke_path();
    d = e + dash * 0.9;
  }
}
function corners(w, h, m, len, color) {
  hairline(m, m + len, m, m, color, 4 * scale); hairline(m, m, m + len, m, color, 4 * scale);
  hairline(w - m - len, m, w - m, m, color, 4 * scale); hairline(w - m, m, w - m, m + len, color, 4 * scale);
  hairline(m, h - m, m, h - m - len, color, 4 * scale); hairline(m, h - m - len, m, h - m, color, 4 * scale);
  hairline(w - m, h - m, w - m, h - m - len, color, 4 * scale); hairline(w - m - len, h - m, w - m, h - m, color, 4 * scale);
}
function bez(p, u) {
  const v = 1 - u;
  return [
    v * v * v * p[0][0] + 3 * v * v * u * p[1][0] + 3 * v * u * u * p[2][0] + u * u * u * p[3][0],
    v * v * v * p[0][1] + 3 * v * v * u * p[1][1] + 3 * v * u * u * p[2][1] + u * u * u * p[3][1],
  ];
}

function setup(ctx) { scale = ctx.width / DESIGN_W; s = (v) => v * scale; canvas.clear(tokens(ctx.palette).bg); }

function render(t, ctx) {
  const k = tokens(ctx.palette);
  const w = ctx.width, h = ctx.height;
  const m = s(36);

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  for (let i = -8; i <= 8; i++) {
    hairline(w / 2 + (i / 8) * w * 0.42, 0, w / 2 + (i / 8) * w * 0.42, h, withAlpha(k.border, i % 2 === 0 ? 0.45 : 0.22), 1 * scale);
  }
  for (let j = -4; j <= 4; j++) {
    hairline(0, h / 2 + (j / 4) * h * 0.40, w, h / 2 + (j / 4) * h * 0.40, withAlpha(k.border, j % 2 === 0 ? 0.45 : 0.22), 1 * scale);
  }

  const sets = [
    { y: h * 0.30, amp: h * 0.10, color: k.neon[1], phase: 0 },
    { y: h * 0.50, amp: h * 0.13, color: k.neon[4], phase: 2.1 },
    { y: h * 0.70, amp: h * 0.11, color: k.neon[5], phase: 4.2 },
  ];
  for (let c = 0; c < sets.length; c++) {
    const st = sets[c];
    const p = [
      [w * 0.14, st.y + Math.sin(t * 0.4 + st.phase) * st.amp * 0.4],
      [w * 0.36, st.y + Math.sin(t * 0.55 + st.phase + 1) * st.amp],
      [w * 0.64, st.y + Math.cos(t * 0.5 + st.phase + 2) * st.amp],
      [w * 0.86, st.y + Math.cos(t * 0.35 + st.phase) * st.amp * 0.4],
    ];
    dashed(p[0][0], p[0][1], p[1][0], p[1][1], withAlpha(st.color, 0.5), s(12));
    dashed(p[1][0], p[1][1], p[2][0], p[2][1], withAlpha(st.color, 0.5), s(12));
    dashed(p[2][0], p[2][1], p[3][0], p[3][1], withAlpha(st.color, 0.5), s(12));

    let prev = p[0];
    for (let i = 1; i <= 140; i++) {
      const q = bez(p, i / 140);
      hairline(prev[0], prev[1], q[0], q[1], withAlpha(st.color, 0.9), 2.2 * scale);
      prev = q;
    }
    for (let i = 0; i < 4; i++) {
      canvas.fill(withAlpha(st.color, 0.95));
      canvas.rect(p[i][0] - 3.5 * scale, p[i][1] - 3.5 * scale, 7 * scale, 7 * scale);
    }
  }

  /* de Casteljau rider on the first mesh. */
  const u = (t * 0.35) % 1;
  const st0 = sets[0];
  const p0 = [
    [w * 0.14, st0.y + Math.sin(t * 0.4) * st0.amp * 0.4],
    [w * 0.36, st0.y + Math.sin(t * 0.55 + 1) * st0.amp],
    [w * 0.64, st0.y + Math.cos(t * 0.5 + 2) * st0.amp],
    [w * 0.86, st0.y + Math.cos(t * 0.35) * st0.amp * 0.4],
  ];
  const q = bez(p0, u);
  for (let s2 = 7; s2 >= 0; s2--) {
    const qt = bez(p0, Math.max(0, u - s2 * 0.012));
    canvas.fill(withAlpha(k.neon[6], 0.85 - s2 * 0.10));
    canvas.circle(qt[0], qt[1], Math.max(1.2, 3.8 - s2 * 0.32) * scale);
  }

  text("t = " + u.toFixed(3), m + s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MONO);
  text("B(t) = \u03A3 C(3,i)(1\u2212t)\u00B3\u207B\u2071 t\u2071 P\u1D62", w / 2, h - m - s(52), s(32), withAlpha(k.neon[3], 0.95), MATH, "middle");
  text("BEZIER_MESH // 05 \u00B7 3 CUBIC MESHES", w / 2, h - m - s(20), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");

  corners(w, h, m, s(64), withAlpha(k.neon[2], 0.9));
  canvas.alpha(1.0);
}
