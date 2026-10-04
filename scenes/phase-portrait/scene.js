/*
 * phase-portrait - damped pendulum trajectories in phase space.
 *
 * Thirty-five trajectories (theta, omega) are integrated once in setup and
 * drawn as faint coloured flows over a quiver of the pendulum vector field;
 * one trajectory runs a bright rider particle, with its theta, omega and
 * energy read out live. Corner |_ brackets and the equation close the panel.
 *
 *   xwww scene run scene.js --fps 12 --timeout-ms 2000 --palette equisdots
 */

const DESIGN_W = 2400;
const MATH = "Noto Sans Math";
const MONO = "Space Mono";
const GAMMA = 0.3;
const STEPS = 520;
const H = 0.02;

let TRAJS = null;

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
  if (TRAJS) return;
  TRAJS = [];
  const theta0 = [-3.14, -2.09, -1.05, 0, 1.05, 2.09, 3.14];
  const omega0 = [-2.2, -1.1, 0, 1.1, 2.2];
  for (let a = 0; a < theta0.length; a++) {
    for (let b = 0; b < omega0.length; b++) {
      const pts = [];
      let th = theta0[a], om = omega0[b];
      for (let i = 0; i < STEPS; i++) {
        pts.push([th, om]);
        const dth = om, dom = -GAMMA * om - Math.sin(th);
        th += dth * H;
        om += dom * H;
      }
      TRAJS.push(pts);
    }
  }
}

function render(t, ctx) {
  const k = tokens(ctx.palette);
  const w = ctx.width, h = ctx.height;
  const cx = w / 2, cy = h * 0.47;
  const R = Math.min(w, h) * 0.36;
  const m = s(36);
  const px = (th) => cx + (th / 3.6) * R;
  const py = (om) => cy - (om / 3) * R * 0.9;

  canvas.clear(k.bg);
  canvas.fill("#00000000");

  for (let i = -5; i <= 5; i++) {
    hairline(cx + (i / 5) * R, 0, cx + (i / 5) * R, h, withAlpha(k.border, i % 2 === 0 ? 0.45 : 0.22), 1 * scale);
  }
  for (let j = -3; j <= 3; j++) {
    hairline(0, cy + (j / 3) * R * 0.9, w, cy + (j / 3) * R * 0.9, withAlpha(k.border, j % 2 === 0 ? 0.45 : 0.22), 1 * scale);
  }
  hairline(px(0), cy - R, px(0), cy + R, withAlpha(k.neon[3], 0.35), 1.4 * scale);
  hairline(cx - R, py(0), cx + R, py(0), withAlpha(k.neon[3], 0.35), 1.4 * scale);

  /* Vector field. */
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 7; j++) {
      const th = -3.2 + (6.4 * i) / 10;
      const om = -2.6 + (5.2 * j) / 6;
      const dth = om, dom = -GAMMA * om - Math.sin(th);
      const len = Math.sqrt(dth * dth + dom * dom) || 1;
      const x = px(th), y = py(om);
      const ex = x + (dth / len) * 16 * scale, ey = y - (dom / len) * 16 * scale;
      hairline(x, y, ex, ey, withAlpha(k.neon[(i + j) % k.neon.length], 0.28), 1.2 * scale);
    }
  }

  /* Trajectories. */
  for (let i = 0; i < TRAJS.length; i++) {
    const pts = TRAJS[i];
    const color = withAlpha(k.neon[i % k.neon.length], 0.32);
    let lx = px(pts[0][0]), ly = py(pts[0][1]);
    for (let q = 4; q < pts.length; q += 4) {
      const x = px(pts[q][0]), y = py(pts[q][1]);
      hairline(lx, ly, x, y, color, 1.3 * scale);
      lx = x; ly = y;
    }
  }

  /* Rider on the first trajectory. */
  const rider = TRAJS[0];
  const ri = Math.floor(t * 40) % (rider.length - 1);
  const rp = [px(rider[ri][0]), py(rider[ri][1])];
  const energy = (rider[ri][1] * rider[ri][1]) / 2 - Math.cos(rider[ri][0]);
  /* Comet tail along the trajectory (single dots, no halo). */
  for (let q = 7; q >= 0; q--) {
    const idx = Math.max(0, ri - q * 4);
    canvas.fill(withAlpha(k.neon[6], 0.8 - q * 0.09));
    canvas.circle(px(rider[idx][0]), py(rider[idx][1]), Math.max(1.2, 3.6 - q * 0.3) * scale);
  }

  text("\u03B8 = " + rider[ri][0].toFixed(3) + "  \u03C9 = " + rider[ri][1].toFixed(3), m + s(56), m + s(34), s(20), withAlpha(k.accent, 0.95), MATH);
  text("E = " + energy.toFixed(3), w - m - s(56), m + s(34), s(20), withAlpha(k.neon[5], 0.95), MATH, "end");
  text("35 TRAJECTORIES \u00B7 \u03B3 = " + GAMMA.toFixed(2), m + s(56), h - m - s(24), s(17), withAlpha(k.disabled, 0.9), MONO);

  text("\u03B8\u0308 + \u03B3\u03B8\u0307 + sin \u03B8 = 0", cx, h - m - s(58), s(34), withAlpha(k.neon[4], 0.95), MATH, "middle");
  text("PHASE_PORTRAIT // 06", w - m - s(56), h - m - s(24), s(18), withAlpha(k.secondary, 0.9), MONO, "end");

  corners(w, h, m, s(64), withAlpha(k.neon[3], 0.9));
  canvas.alpha(1.0);
}
