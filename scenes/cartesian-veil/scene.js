/*
 * cartesian-veil - a quiet cartesian plane that draws a curve through
 * symmetric points.
 *
 * The whole screen is a faint cartesian grid with axes crossing at the
 * centre. Thirteen points sit symmetrically around the y axis on a damped
 * even function; a smooth Catmull-Rom curve reveals itself from left to
 * right, lighting each point as it passes, then holds and fades before the
 * next pass. The formula sits centred below the origin. Every element uses a
 * different palette colour, lines stay thin and tenuous.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const CYCLE = 16; /* seconds: 10 connect + 3 hold + 3 fade */
const CONNECT = 10;
const HOLD = 3;

const XS = [0, 0.7, 1.4, 2.3, 3.3, 4.4, 5.5];

function fn(x) {
  return Math.cos(1.25 * x) * Math.exp(-(x * x) / 10);
}

const POINTS = [];
for (let i = XS.length - 1; i >= 1; i--) {
  POINTS.push([-XS[i], fn(XS[i])]);
}
for (let i = 0; i < XS.length; i++) {
  POINTS.push([XS[i], fn(XS[i])]);
}

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

function catmull(p0, p1, p2, p3, u) {
  const u2 = u * u;
  const u3 = u2 * u;
  return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
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
  const phase = (t + CONNECT + HOLD - 1.5) % CYCLE;
  const reveal = Math.min(1, phase / CONNECT);
  const fade = phase > CONNECT + HOLD ? Math.max(0, 1 - (phase - CONNECT - HOLD) / (CYCLE - CONNECT - HOLD)) : 1;

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  /* ── Faint grid: minor every unit, major every two ── */
  for (let i = -7; i <= 7; i++) {
    const x = cx + i * unitX;
    hairline(x, 0, x, h, withAlpha(k.border, i % 2 === 0 ? 0.55 : 0.30), 1 * scale);
  }
  for (let j = -5; j <= 5; j++) {
    const y = cy + j * unitY;
    hairline(0, y, w, y, withAlpha(k.border, j % 2 === 0 ? 0.55 : 0.30), 1 * scale);
  }

  /* ── Axes: very thin and tenuous ── */
  const axisColor = withAlpha(k.neon[3], 0.34);
  hairline(cx, 0, cx, h, axisColor, 1.4 * scale);
  hairline(0, cy, w, cy, axisColor, 1.4 * scale);

  /* Ticks + sparse numbers. */
  for (let i = -6; i <= 6; i++) {
    if (i === 0) continue;
    const x = cx + i * unitX;
    hairline(x, cy - s(7), x, cy + s(7), axisColor, 1.2 * scale);
    if (i % 2 === 0) {
      text(String(i), x, cy + s(30), s(16), withAlpha(k.disabled, 0.8), MONO, "middle");
    }
  }
  for (let j = -4; j <= 4; j++) {
    if (j === 0) continue;
    const y = cy + j * unitY;
    hairline(cx - s(7), y, cx + s(7), y, axisColor, 1.2 * scale);
    if (j % 2 === 0) {
      text(String(-j), cx + s(26), y + s(6), s(16), withAlpha(k.disabled, 0.8), MONO);
    }
  }
  text("x", w - s(26), cy - s(16), s(20), withAlpha(k.secondary, 0.8), MATH, "end");
  text("y", cx + s(18), s(34), s(20), withAlpha(k.secondary, 0.8), MATH);

  /* ── Curve: Catmull-Rom through the points, revealed left to right ── */
  const screen = POINTS.map((p) => [cx + p[0] * unitX, cy - p[1] * unitY]);
  const segments = screen.length - 1;
  const curveColor = withAlpha(k.accent, 0.85 * fade);
  const drawn = reveal * segments;

  canvas.stroke(curveColor, 2.2 * scale);
  for (let i = 0; i < segments; i++) {
    let from;
    if (i + 1 <= drawn) {
      from = 1;
    } else if (i < drawn) {
      from = drawn - i;
    } else {
      break;
    }
    const p0 = screen[Math.max(0, i - 1)];
    const p1 = screen[i];
    const p2 = screen[i + 1];
    const p3 = screen[Math.min(segments, i + 2)];
    const steps = 18;
    let px = p1[0];
    let py = p1[1];
    for (let j = 1; j <= steps; j++) {
      const u = (j / steps) * from;
      const x = catmull(p0[0], p1[0], p2[0], p3[0], u);
      const y = catmull(p0[1], p1[1], p2[1], p3[1], u);
      canvas.begin_path();
      canvas.move_to(px, py);
      canvas.line_to(x, y);
      canvas.stroke_path();
      px = x;
      py = y;
    }
  }

  /* ── Symmetric points: each pair shares a palette colour ── */
  const half = (screen.length - 1) / 2;
  for (let i = 0; i < screen.length; i++) {
    const reach = reveal * segments;
    const dist = Math.abs(i - half);
    const lit = Math.max(0, Math.min(1, (reach - (half - dist)) / 1.2));
    if (lit <= 0) continue;
    const color = k.neon[(dist + Math.floor(t * 0.35)) % k.neon.length];
    canvas.fill(withAlpha(color, 0.8 * fade * lit));
    canvas.circle(screen[i][0], screen[i][1], (2.4 + 1.6 * lit) * scale);
  }

  /* Comet tail behind the reveal head (single dots, no halo). */
  if (reveal < 1) {
    const g = reveal * segments;
    for (let q = 7; q >= 0; q--) {
      const gq = Math.max(0, g - q * 0.22);
      const i = Math.min(segments - 1, Math.floor(gq));
      const p0 = screen[Math.max(0, i - 1)];
      const p1 = screen[i];
      const p2 = screen[i + 1];
      const p3 = screen[Math.min(segments, i + 2)];
      const u = gq - i;
      canvas.fill(withAlpha(k.neon[6], 0.85 - q * 0.10));
      canvas.circle(
        catmull(p0[0], p1[0], p2[0], p3[0], u),
        catmull(p0[1], p1[1], p2[1], p3[1], u),
        Math.max(1.2, 3.4 - q * 0.3) * scale
      );
    }
  }

  /* ── Formula, centred just below the origin ── */
  text("f(x) = e^(\u2212x\u00B2/10) \u00B7 cos(1.25x)", cx, cy + h * 0.30, s(34), withAlpha(k.neon[5], 0.95 * fade + 0.05), MATH, "middle");
  text("EVEN FUNCTION \u00B7 SYMMETRIC SAMPLING", cx, cy + h * 0.30 + s(38), s(17), withAlpha(k.disabled, 0.9), MONO, "middle");

  canvas.alpha(1.0);
}
