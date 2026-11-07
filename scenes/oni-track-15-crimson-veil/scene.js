/*
 * oni-track-15-crimson-veil — palette-aware xwww scene (generated from the blob-tracking series).
 *
 * Layers, all recoloured from ctx.palette through the equisdots provider:
 *   bg_luma.jpg        atmosphere/washes/grid luminance -> palette ramp
 *   p1/p2.png          halftone / rings / topo / bokeh / diagonal stencils
 *   panel_tex.jpg      material panel (concrete or metal) -> texture ramp
 *   subject_luma.jpg   artwork luminance -> subject ramp
 *   subject_accent.png chromatic details -> accent2
 *   subject_tracks_a/b/dark.png  feature tracks detected ON the artwork
 *   FEATURES           tracked subject points, drawn as rings/crosshairs
 *   CLUSTERS           four tracked regions, drawn as boxes + ID/type labels
 *   HIST/FLOW          feature-response histogram and analysis motion field
 *   hud_mask/contrast  blob-detection and contrast previews
 *   frame / type are procedural so they stay crisp at any output size
 *
 * Change-driven: it returns early unless the palette signature changes.
 *
 *   xwww scene render scene.js -o preview.png --size 1920x1080 --palette equisdots
 *   xwww scene run    scene.js --fps 15 --timeout-ms 2000 --palette equisdots
 */

const TITLE1 = "CRIMSON";
const TITLE2 = "VEIL";
const JP = "紅蓮";
const ZH = "红莲";
const ES = "VELO CARMESÍ";
const SEAL = "紅";
const INDEX = 15;
const ACCENT_SLOT = 1;
const ACCENT2_SLOT = 3;
const RECIPE = 4;
const MIRROR = 0;
const SRC_W = 736;
const SRC_H = 1288;

const DESIGN_W = 1920;
const DESIGN_H = 1080;
const PLATE_TOP = 60;
const PLATE_H = 960;
const PLATE_ASPECT = 0.57142857;
const F1 = 84;
const F2 = 84;
const FRAMES = 48;
const SUBJECT_W = 549;
const SUBJECT_H = 960;
const FEATURES = [{"id": 1, "x": 170.0, "y": 68.0, "r": 12.5, "group": 0, "label": true, "score": 0.618, "vx": 6.42, "vy": -13.56}, {"id": 2, "x": 360.0, "y": 94.0, "r": 13.5, "group": 1, "label": true, "score": 0.836, "vx": 14.77, "vy": -2.63}, {"id": 3, "x": 396.0, "y": 139.0, "r": 13.5, "group": 0, "label": false, "score": 0.798, "vx": 14.81, "vy": -2.35}, {"id": 4, "x": 92.0, "y": 399.0, "r": 12.5, "group": 1, "label": true, "score": 0.625, "vx": -1.52, "vy": -14.92}, {"id": 5, "x": 274.0, "y": 431.0, "r": 12.7, "group": 0, "label": true, "score": 0.656, "vx": 13.87, "vy": -5.7}, {"id": 6, "x": 439.0, "y": 249.0, "r": 12.5, "group": 1, "label": true, "score": 0.622, "vx": 15.0, "vy": 0.35}, {"id": 7, "x": 167.0, "y": 611.0, "r": 12.5, "group": 0, "label": true, "score": 0.619, "vx": -12.01, "vy": -8.98}, {"id": 8, "x": 333.0, "y": 480.0, "r": 12.7, "group": 1, "label": false, "score": 0.653, "vx": 14.77, "vy": 2.63}, {"id": 9, "x": 398.0, "y": 491.0, "r": 11.7, "group": 0, "label": false, "score": 0.482, "vx": 0.26, "vy": 15.0}, {"id": 10, "x": 79.0, "y": 824.0, "r": 12.1, "group": 1, "label": false, "score": 0.544, "vx": -14.8, "vy": -2.46}, {"id": 11, "x": 229.0, "y": 735.0, "r": 11.1, "group": 0, "label": false, "score": 0.369, "vx": -14.88, "vy": -1.86}, {"id": 12, "x": 367.0, "y": 925.0, "r": 11.9, "group": 1, "label": false, "score": 0.518, "vx": -13.45, "vy": 6.65}];
const CLUSTERS = [{"x0": 0.1725, "y0": 0.0125, "x1": 0.9368, "y1": 0.3344, "cx": 0.6216, "cy": 0.1432, "type": "CREST", "area": 4802, "conf": 93, "id": 1}, {"x0": 0.0219, "y0": 0.3406, "x1": 0.881, "y1": 0.5865, "cx": 0.4995, "cy": 0.469, "type": "CORE", "area": 4122, "conf": 97, "id": 2}, {"x0": 0.0383, "y0": 0.5615, "x1": 0.5228, "y1": 0.9333, "cx": 0.2884, "cy": 0.7535, "type": "BASE", "area": 3517, "conf": 93, "id": 3}, {"x0": 0.5046, "y0": 0.8594, "x1": 0.8324, "y1": 0.9875, "cx": 0.6685, "cy": 0.9635, "type": "BASE", "area": 820, "conf": 95, "id": 4}];
const HIST = [1.0, 0.472, 0.414, 0.723, 0.32, 0.3, 0.526, 0.238, 0.217, 0.201, 0.348, 0.159, 0.134, 0.24, 0.104, 0.089, 0.149, 0.065, 0.058, 0.05, 0.085, 0.04, 0.038, 0.063, 0.028, 0.026, 0.048, 0.019, 0.019, 0.017, 0.03, 0.014, 0.013, 0.021, 0.009, 0.008, 0.016, 0.007, 0.005, 0.07];
const FLOW = [[0.1051, 0.0824, 0.1257, 0.0759], [0.2854, 0.077, 0.3006, 0.0655], [0.4026, 0.0617, 0.4513, 0.048], [0.5447, 0.0548, 0.5692, 0.0458], [0.6976, 0.0308, 0.721, 0.0671], [0.9246, 0.0792, 0.9343, 0.1043], [0.0841, 0.1934, 0.0976, 0.1773], [0.23, 0.2019, 0.2724, 0.1775], [0.3711, 0.1938, 0.4137, 0.1732], [0.5445, 0.1623, 0.5672, 0.156], [0.7822, 0.1772, 0.7923, 0.2092], [0.9184, 0.1528, 0.9356, 0.1707], [0.0464, 0.3042, 0.064, 0.2797], [0.2828, 0.3237, 0.2851, 0.3015], [0.4483, 0.2997, 0.4678, 0.2961], [0.5776, 0.2645, 0.6032, 0.3001], [0.7561, 0.2949, 0.7628, 0.3295], [0.9528, 0.3301, 0.951, 0.3586], [0.0453, 0.4514, 0.05, 0.4072], [0.2367, 0.4712, 0.231, 0.4216], [0.4471, 0.477, 0.4468, 0.4554], [0.5466, 0.4128, 0.5864, 0.4457], [0.7266, 0.4393, 0.7422, 0.4619], [0.8826, 0.3987, 0.8843, 0.4434], [0.0701, 0.5932, 0.0764, 0.5655], [0.2189, 0.5824, 0.2078, 0.5661], [0.4749, 0.5382, 0.4249, 0.5263], [0.6278, 0.5289, 0.6095, 0.5751], [0.8042, 0.5252, 0.779, 0.5507], [0.9392, 0.542, 0.9322, 0.5646], [0.1071, 0.6994, 0.0968, 0.6487], [0.2978, 0.7282, 0.2592, 0.7049], [0.4631, 0.6685, 0.4419, 0.6704], [0.6197, 0.7051, 0.5969, 0.7068], [0.7959, 0.7099, 0.7509, 0.7242], [0.9058, 0.6927, 0.9, 0.7112], [0.1117, 0.8, 0.0961, 0.7845], [0.2509, 0.8412, 0.2256, 0.812], [0.4261, 0.8245, 0.3846, 0.833], [0.6343, 0.836, 0.5999, 0.8475], [0.8029, 0.8034, 0.7631, 0.8262], [0.9323, 0.8108, 0.9059, 0.8215], [0.0673, 0.9757, 0.0534, 0.9573], [0.2501, 0.9659, 0.2346, 0.9461], [0.4244, 0.9101, 0.3852, 0.9034], [0.5686, 0.9257, 0.5293, 0.9104], [0.7427, 0.9562, 0.7072, 0.953], [0.9119, 0.9397, 0.8724, 0.947]];
const LINKS = [[0.6216, 0.1432, 0.4995, 0.469], [0.4995, 0.469, 0.2884, 0.7535], [0.2884, 0.7535, 0.6685, 0.9635], [0.6216, 0.1432, 0.6685, 0.9635]];

const MONO = "JetBrains Mono";
const DISPLAY = "Space Grotesk";
const SANS = "Inter";
const JPFONT = "Noto Serif CJK JP";
const ZHFONT = "Noto Sans CJK SC";

function channels(hex) {
  const s = hex.replace(/^#/, "");
  return [
    parseInt(s.slice(0, 2), 16) || 0,
    parseInt(s.slice(2, 4), 16) || 0,
    parseInt(s.slice(4, 6), 16) || 0,
  ];
}

function luma(hex) {
  const c = channels(hex);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function withAlpha(hex, a) {
  const byte = Math.round(Math.max(0, Math.min(1, a)) * 255);
  return hex.slice(0, 7) + byte.toString(16).padStart(2, "0").toUpperCase();
}

function mixHex(a, b, t) {
  const ca = channels(a), cb = channels(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return "#" + [r, g, bl].map(function (v) {
    return v.toString(16).padStart(2, "0");
  }).join("");
}

function textOn(hex) {
  return luma(hex) > 145 ? "#0b0b0f" : "#f7f7fb";
}

function readable(color, field, minDiff) {
  const want = minDiff || 80;
  if (Math.abs(luma(color) - luma(field)) >= want) return color;
  const target = luma(field) > 128 ? "#000000" : "#ffffff";
  let out = color;
  for (let i = 0; i < 7; i++) {
    out = mixHex(out, target, 0.22);
    if (Math.abs(luma(out) - luma(field)) >= want) break;
  }
  return out;
}

function mainText(p, field) {
  const cands = [
    p.foreground.hex,
    p.background.hex,
    pick(p, 7, p.foreground).hex,
    pick(p, 15, p.foreground).hex,
  ];
  let best = cands[0];
  let bestDiff = -1;
  for (let i = 0; i < cands.length; i++) {
    const d = Math.abs(luma(cands[i]) - luma(field));
    if (d > bestDiff) { bestDiff = d; best = cands[i]; }
  }
  return best;
}

function uniqSorted(hexes) {
  const seen = {};
  const out = [];
  for (let i = 0; i < hexes.length; i++) {
    const h = hexes[i];
    if (!h) continue;
    const key = h.toLowerCase();
    if (seen[key]) continue;
    seen[key] = 1;
    out.push(h);
  }
  out.sort(function (a, b) { return luma(a) - luma(b); });
  return out;
}

function pick(p, index, fallback) {
  if (p.colors && p.colors.length > index && p.colors[index] && p.colors[index].hex) {
    return p.colors[index];
  }
  return fallback || p.foreground;
}

function accent(p) {
  const c = pick(p, ACCENT_SLOT, null);
  if (c) return c;
  if (p.roles && p.roles.workspaceActive) return p.roles.workspaceActive;
  return p.foreground;
}

function accent2(p) {
  const c = pick(p, ACCENT2_SLOT, null);
  if (c) return c;
  if (p.roles && p.roles.workspaceActive) return p.roles.workspaceActive;
  return p.foreground;
}

function darkest(p) {
  const list = uniqSorted([
    p.background.hex,
    pick(p, 0, p.background).hex,
    pick(p, 8, p.foreground).hex,
    p.foreground.hex,
  ]);
  return { hex: list[0] };
}

function bgRamp(p) {
  return uniqSorted([
    p.background.hex,
    pick(p, 0, p.background).hex,
    pick(p, 8, p.foreground).hex,
    accent(p).hex,
    p.foreground.hex,
  ]);
}

function subjectRamp(p) {
  return uniqSorted([
    pick(p, 0, p.background).hex,
    pick(p, 8, p.foreground).hex,
    accent(p).hex,
    accent2(p).hex,
    p.foreground.hex,
    p.background.hex,
  ]);
}

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

function X(x) {
  return MIRROR ? DESIGN_W - x : x;
}

function WX(x, w) {
  return MIRROR ? DESIGN_W - x - w : x;
}

function A(anchor) {
  if (!MIRROR) return anchor || "start";
  if (anchor === "end") return "start";
  if (anchor === "start") return "end";
  return anchor || "start";
}

let signature = null;

function line(x1, y1, x2, y2, color, width) {
  canvas.stroke(color, width);
  canvas.begin_path();
  canvas.move_to(x1, y1);
  canvas.line_to(x2, y2);
  canvas.stroke_path();
}

function strokeRect(x, y, w, h, color, width) {
  canvas.stroke(color, width);
  canvas.begin_path();
  canvas.move_to(x, y);
  canvas.line_to(x + w, y);
  canvas.line_to(x + w, y + h);
  canvas.line_to(x, y + h);
  canvas.close_path();
  canvas.stroke_path();
}

function dashLine(x1, y1, x2, y2, color, width, dash, gap) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;
  const ux = dx / len, uy = dy / len;
  let p = 0;
  while (p < len) {
    const e = Math.min(len, p + dash);
    line(x1 + ux * p, y1 + uy * p, x1 + ux * e, y1 + uy * e, color, width);
    p = e + gap;
  }
}

function dashedRect(x, y, w, h, color, width, dash, gap) {
  dashLine(x, y, x + w, y, color, width, dash, gap);
  dashLine(x + w, y, x + w, y + h, color, width, dash, gap);
  dashLine(x + w, y + h, x, y + h, color, width, dash, gap);
  dashLine(x, y + h, x, y, color, width, dash, gap);
}

function arrowLine(x1, y1, x2, y2, color, width, head) {
  line(x1, y1, x2, y2, color, width);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = head || 4;
  line(x2, y2, x2 - h * Math.cos(ang - 0.5), y2 - h * Math.sin(ang - 0.5), color, width);
  line(x2, y2, x2 - h * Math.cos(ang + 0.5), y2 - h * Math.sin(ang + 0.5), color, width);
}

function fmt1(v) {
  return (Math.round(v * 10) / 10).toFixed(1);
}

function pad3(n) {
  return n < 10 ? "00" + n : (n < 100 ? "0" + n : String(n));
}

function drawSubjectTracks(ctx, p, plate) {
  canvas.image_tinted("subject_tracks_dark.png", plate.x, plate.y, plate.w, plate.h,
                      withAlpha(p.background.hex, 0.38));
  canvas.image_tinted("subject_tracks_b.png", plate.x, plate.y, plate.w, plate.h,
                      withAlpha(accent2(p).hex, 0.68));
  canvas.image_tinted("subject_tracks_a.png", plate.x, plate.y, plate.w, plate.h,
                      withAlpha(accent(p).hex, 0.78));
}

function drawFeatureMarks(ctx, p, plate) {
  const sx = plate.w / SUBJECT_W, sy = plate.h / SUBJECT_H;
  const sc = Math.max(0.80, Math.min(1.0, plate.w / 640));
  const a = accent(p).hex, b = accent2(p).hex;
  for (let i = 0; i < FEATURES.length; i++) {
    const f = FEATURES[i];
    const x = plate.x + f.x * sx;
    const y = plate.y + f.y * sy;
    const r = Math.max(3.2, f.r * sc * 0.82);
    const col = f.group ? b : a;
    canvas.no_fill();
    canvas.stroke(withAlpha(col, 0.82), 1.5 * sc);
    canvas.circle(x, y, r + 1.2 * sc);
    line(x - r - 5 * sc, y, x + r + 5 * sc, y, withAlpha(col, 0.48), 1 * sc);
    line(x, y - r - 5 * sc, x, y + r + 5 * sc, withAlpha(col, 0.48), 1 * sc);
    canvas.fill(withAlpha(col, 0.95));
    canvas.circle(x, y, 1.5 * sc);

    if (f.label && (f.vx || f.vy)) {
      const vx = f.vx * sc, vy = f.vy * sc;
      const ex = x + vx, ey = y + vy;
      const ang = Math.atan2(vy, vx);
      const hl = 4.0 * sc;
      line(x, y, ex, ey, withAlpha(col, 0.65), 1 * sc);
      line(ex, ey, ex - hl * Math.cos(ang - 0.52), ey - hl * Math.sin(ang - 0.52),
           withAlpha(col, 0.65), 1 * sc);
      line(ex, ey, ex - hl * Math.cos(ang + 0.52), ey - hl * Math.sin(ang + 0.52),
           withAlpha(col, 0.65), 1 * sc);
    }
  }
}

function drawMotionField(ctx, p, plate) {
  const a = accent(p).hex, b = accent2(p).hex;
  for (let i = 0; i < FLOW.length; i++) {
    const f = FLOW[i];
    arrowLine(plate.x + f[0] * plate.w, plate.y + f[1] * plate.h,
              plate.x + f[2] * plate.w, plate.y + f[3] * plate.h,
              withAlpha(a, 0.26), 1, 3.4);
  }
  for (let i = 0; i < LINKS.length; i++) {
    const l = LINKS[i];
    const x1 = plate.x + l[0] * plate.w, y1 = plate.y + l[1] * plate.h;
    const x2 = plate.x + l[2] * plate.w, y2 = plate.y + l[3] * plate.h;
    arrowLine(x1, y1, x2, y2, withAlpha(b, 0.34), 1, 4.5);
    arrowLine(x2, y2, x1, y1, withAlpha(a, 0.22), 1, 4.5);
  }
}

function drawClusterHUD(ctx, p, plate) {
  const fg = p.foreground.hex, a = accent(p).hex, bg = p.background.hex;
  const hs = Math.max(0.78, Math.min(1.0, plate.w / 640));
  const items = [];

  for (let i = 0; i < CLUSTERS.length; i++) {
    const c = CLUSTERS[i];
    const x = plate.x + c.x0 * plate.w;
    const y = plate.y + c.y0 * plate.h;
    const w = (c.x1 - c.x0) * plate.w;
    const h = (c.y1 - c.y0) * plate.h;
    const lw = 128 * hs, lh = 55 * hs;
    let lx = x;
    let ly = c.cy >= 0.50 ? y + h + 8 * hs : y - lh - 8 * hs;
    if (ly + lh > plate.y + plate.h - 3 * hs) ly = y - lh - 8 * hs;
    if (ly < plate.y + 5 * hs) ly = y + h + 8 * hs;
    if (lx + lw > plate.x + plate.w - 4 * hs) lx = x + w - lw;
    if (lx < plate.x + 4 * hs) lx = plate.x + 4 * hs;
    items.push({ c: c, x: x, y: y, w: w, h: h, lw: lw, lh: lh, lx: lx, ly: ly });
  }

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    for (let pass = 0; pass < 8; pass++) {
      let moved = false;
      for (let j = 0; j < i; j++) {
        const o = items[j];
        if (it.lx < o.lx + o.lw && it.lx + it.lw > o.lx
            && it.ly < o.ly + o.lh && it.ly + it.lh > o.ly) {
          it.ly = o.ly + o.lh + 4 * hs;
          moved = true;
        }
      }
      if (!moved) break;
    }
    if (it.ly + it.lh > plate.y + plate.h - 3 * hs) {
      it.ly = Math.max(plate.y + 4 * hs, it.ly - it.lh - 4 * hs);
    }
  }

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const c = it.c, x = it.x, y = it.y, w = it.w, h = it.h;

    dashedRect(x, y, w, h, withAlpha(a, 0.58), 1, 6 * hs, 5 * hs);

    const len = 11 * hs;
    const corners = [
      [x, y, 1, 1], [x + w, y, -1, 1],
      [x, y + h, 1, -1], [x + w, y + h, -1, -1],
    ];
    for (let k = 0; k < corners.length; k++) {
      const cx = corners[k][0], cy = corners[k][1];
      const dx = corners[k][2], dy = corners[k][3];
      line(cx, cy, cx + dx * len, cy, withAlpha(a, 0.95), 2 * hs);
      line(cx, cy, cx, cy + dy * len, withAlpha(a, 0.95), 2 * hs);
    }
    canvas.fill(withAlpha(a, 0.9));
    canvas.rect(x - 2 * hs, y - 2 * hs, 4 * hs, 4 * hs);
    for (let k = 0; k < 4; k++) {
      line(x + 7 * hs, y + h - 9 * hs - k * 4 * hs,
           x + 7 * hs + (18 + k * 7) * hs, y + h - 9 * hs - k * 4 * hs,
           withAlpha(a, 0.20), 1 * hs);
    }

    const cx = plate.x + c.cx * plate.w;
    const cy = plate.y + c.cy * plate.h;
    const ch = 17 * hs;
    line(cx - ch, cy, cx - 4 * hs, cy, withAlpha(a, 0.88), 1.2 * hs);
    line(cx + 4 * hs, cy, cx + ch, cy, withAlpha(a, 0.88), 1.2 * hs);
    line(cx, cy - ch, cx, cy - 4 * hs, withAlpha(a, 0.88), 1.2 * hs);
    line(cx, cy + 4 * hs, cx, cy + ch, withAlpha(a, 0.88), 1.2 * hs);
    canvas.no_fill();
    canvas.stroke(withAlpha(a, 0.95), 1.4 * hs);
    canvas.circle(cx, cy, 7 * hs);
    canvas.fill(withAlpha(a, 0.95));
    canvas.circle(cx, cy, 1.5 * hs);

    const tx = x + w - 5 * hs, ty = y + 13 * hs;
    canvas.text("TRACKING", tx, ty, 10 * hs, withAlpha(a, 0.92),
                { family: MONO, anchor: "end" });
    line(tx - 62 * hs, ty + 3 * hs, tx - 5 * hs, ty + 3 * hs,
         withAlpha(a, 0.45), 1 * hs);

    let yy = c.cy >= 0.50 ? y + h - 22 * hs : y + h + 12 * hs;
    if (yy + 16 * hs > plate.y + plate.h - 3 * hs) yy = y + h - 22 * hs;
    canvas.text("X: " + fmt1(c.cx * 100), x + w, yy, 8.2 * hs,
                withAlpha(a, 0.82), { family: MONO, anchor: "end" });
    canvas.text("Y: " + fmt1(c.cy * 100), x + w, yy + 10 * hs, 8.2 * hs,
                withAlpha(a, 0.82), { family: MONO, anchor: "end" });
  }

  for (let i = 0; i < items.length; i++) {
    const it = items[i], c = it.c, lx = it.lx, ly = it.ly;
    canvas.fill(withAlpha(bg, 0.80));
    canvas.rect(lx, ly, it.lw, it.lh);
    strokeRect(lx, ly, it.lw, it.lh, withAlpha(a, 0.58), 1 * hs);
    const lf = 9.6 * hs;
    canvas.text("ID: " + pad3(c.id), lx + 5 * hs, ly + 12 * hs, lf, a,
                { family: MONO, anchor: "start" });
    canvas.text("TYPE: " + c.type, lx + 5 * hs, ly + 24 * hs, lf, fg,
                { family: MONO, anchor: "start" });
    canvas.text("AREA: " + c.area + "px", lx + 5 * hs, ly + 36 * hs, lf,
                withAlpha(fg, 0.72), { family: MONO, anchor: "start" });
    canvas.text("CONF: " + c.conf + "%", lx + 5 * hs, ly + 48 * hs, lf,
                withAlpha(fg, 0.72), { family: MONO, anchor: "start" });
  }
}

function drawHudScrim(ctx, p) {
  const w = ctx.width, h = ctx.height;
  const base = p.background.hex;
  const solid = 260 * (w / DESIGN_W);
  const fade = 100 * (w / DESIGN_W);
  if (MIRROR) {
    canvas.fill(withAlpha(base, 0.78));
    canvas.rect(w - solid, 0, solid, h);
    canvas.linear_gradient(w - solid, 0, w - solid - fade, 0,
                           [withAlpha(base, 0.78), withAlpha(base, 0.0)]);
    canvas.rect(w - solid - fade, 0, fade, h);
  } else {
    canvas.fill(withAlpha(base, 0.78));
    canvas.rect(0, 0, solid, h);
    canvas.linear_gradient(solid, 0, solid + fade, 0,
                           [withAlpha(base, 0.78), withAlpha(base, 0.0)]);
    canvas.rect(solid, 0, fade, h);
  }
}

function drawAnalysisHUD(ctx, p) {
  const sx = ctx.width / DESIGN_W, sy = ctx.height / DESIGN_H;
  const s = Math.min(sx, sy);
  const right = MIRROR === 1;
  const fg = p.foreground.hex, a = accent(p).hex, bg = p.background.hex;
  const dim = withAlpha(fg, 0.55);
  const edge = right ? ctx.width - 28 * sx : 28 * sx;
  const anchor = right ? "end" : "start";

  function px(width) {
    return right ? edge - width : edge;
  }

  const hw = 260 * s, hh = 104 * s, hx = px(hw);
  canvas.fill(withAlpha(bg, 0.42));
  canvas.rect(hx, 28 * sy, hw, hh);
  strokeRect(hx, 28 * sy, hw, hh, withAlpha(fg, 0.18), 1 * s);
  canvas.text("FEATURE RESPONSE", right ? hx + hw - 6 * s : hx + 6 * s,
              28 * sy + 12 * s, 7 * s, dim,
              { family: MONO, anchor: anchor });

  const leftPad = right ? 9 * s : 25 * s;
  const rightPad = right ? 25 * s : 9 * s;
  const px0 = hx + leftPad, py0 = 28 * sy + 19 * s;
  const pw = hw - leftPad - rightPad, ph = hh - 32 * s;
  const axisX = right ? px0 + pw : px0;
  line(axisX, py0, axisX, py0 + ph, withAlpha(fg, 0.30), 1 * s);
  line(px0, py0 + ph, px0 + pw, py0 + ph, withAlpha(fg, 0.30), 1 * s);
  for (let i = 0; i <= 3; i++) {
    const yy = py0 + ph * i / 3;
    line(px0, yy, px0 + pw, yy, withAlpha(fg, 0.10), 1 * s);
    canvas.text(String(30 - i * 10), right ? axisX + 4 * s : axisX - 4 * s,
                yy + 2 * s, 5.4 * s, dim,
                { family: MONO, anchor: right ? "start" : "end" });
  }
  const n = HIST.length, bw = pw / n;
  for (let i = 0; i < n; i++) {
    const v = Math.max(0, Math.min(1, HIST[i]));
    if (v < 0.02) continue;
    const bh = ph * v;
    canvas.fill(v > 0.72 ? a : withAlpha(fg, 0.52));
    canvas.rect(px0 + i * bw + 0.3 * s, py0 + ph - bh,
                Math.max(0.7 * s, bw - 0.7 * s), bh);
  }
  for (let i = 0; i <= 4; i++) {
    canvas.text(String(i * 10), px0 + pw * i / 4, py0 + ph + 8 * s, 5.4 * s,
                dim, { family: MONO, anchor: "middle" });
  }

  let yy = 28 * sy + hh + 27 * s;
  if (right) {
    canvas.fill(a);
    canvas.circle(hx + hw - 3 * s, yy - 4 * s, 2.3 * s);
    canvas.text("STATUS: ACTIVE", hx + hw - 11 * s, yy, 12 * s, fg,
                { family: MONO, anchor: "end" });
    canvas.text("SENSITIVITY: 92%", hx + hw, yy + 17 * s, 9.4 * s,
                withAlpha(fg, 0.70), { family: MONO, anchor: "end" });
    canvas.text("NODES: " + FEATURES.length + "  /  TRACKS: 04", hx + hw,
                yy + 31 * s, 9.4 * s, withAlpha(fg, 0.70),
                { family: MONO, anchor: "end" });
  } else {
    canvas.fill(a);
    canvas.circle(hx + 3 * s, yy - 4 * s, 2.3 * s);
    canvas.text("STATUS: ACTIVE", hx + 11 * s, yy, 12 * s, fg,
                { family: MONO, anchor: "start" });
    canvas.text("SENSITIVITY: 92%", hx, yy + 17 * s, 9.4 * s,
                withAlpha(fg, 0.70), { family: MONO, anchor: "start" });
    canvas.text("NODES: " + FEATURES.length + "  /  TRACKS: 04", hx,
                yy + 31 * s, 9.4 * s, withAlpha(fg, 0.70),
                { family: MONO, anchor: "start" });
  }

  const cw = 210 * s, ch = 140 * s;
  const cx0 = px(cw), cy0 = yy + 48 * s;
  canvas.text("ANÁLISIS CONTRASTE", right ? cx0 + cw : cx0, cy0, 7.5 * s,
              dim, { family: MONO, anchor: anchor });
  canvas.image("hud_contrast.jpg", cx0, cy0 + 8 * s, cw, ch);
  strokeRect(cx0, cy0 + 8 * s, cw, ch, withAlpha(a, 0.48), 1 * s);
  const cl = 9 * s;
  if (right) {
    line(cx0 + cw, cy0 + 8 * s, cx0 + cw - cl, cy0 + 8 * s, a, 2 * s);
    line(cx0 + cw, cy0 + 8 * s, cx0 + cw, cy0 + 8 * s + cl, a, 2 * s);
    line(cx0, cy0 + 8 * s + ch, cx0 + cl, cy0 + 8 * s + ch, a, 2 * s);
    line(cx0, cy0 + 8 * s + ch, cx0, cy0 + 8 * s + ch - cl, a, 2 * s);
  } else {
    line(cx0, cy0 + 8 * s, cx0 + cl, cy0 + 8 * s, a, 2 * s);
    line(cx0, cy0 + 8 * s, cx0, cy0 + 8 * s + cl, a, 2 * s);
    line(cx0 + cw, cy0 + 8 * s + ch, cx0 + cw - cl, cy0 + 8 * s + ch, a, 2 * s);
    line(cx0 + cw, cy0 + 8 * s + ch, cx0 + cw, cy0 + 8 * s + ch - cl, a, 2 * s);
  }

  const mw = 110 * s, mh = 165 * s;
  const mx = px(mw), my = ctx.height - (right ? 150 : 115) * sy - mh;
  canvas.text("FPS: 60", right ? mx + mw : mx, my - 22 * s, 13 * s, fg,
              { family: MONO, anchor: anchor });
  canvas.text("BLOB DETECTION ON", right ? mx + mw : mx, my - 8 * s, 8 * s,
              dim, { family: MONO, anchor: anchor });
  canvas.image("hud_mask.png", mx, my, mw, mh);
  strokeRect(mx, my, mw, mh, withAlpha(fg, 0.22), 1 * s);
  const slx = right ? mx - 10 * s : mx + mw + 10 * s;
  line(slx, my, slx, my + mh, withAlpha(fg, 0.24), 3 * s);
  const knob = my + mh * 0.34;
  canvas.fill(a);
  canvas.rect(slx - 4 * s, knob - 6 * s, 8 * s, 12 * s);
  canvas.text("MASK", right ? slx - 7 * s : slx + 7 * s, my + 8 * s, 6.5 * s,
              dim, { family: MONO, anchor: right ? "end" : "start" });

  const fx = right ? 28 * sx : ctx.width - 28 * sx;
  const fa = right ? "start" : "end";
  canvas.text("FPS: 60", fx, 34 * sy, 16 * s, fg, { family: MONO, anchor: fa });
  canvas.text("TRACKING / SUBJECT 01", fx, 52 * sy, 8 * s, dim,
              { family: MONO, anchor: fa });
}

function drawSubject(ctx, p) {
  const sy = ctx.height / DESIGN_H;
  const ph = PLATE_H * sy;
  const pw = ph * PLATE_ASPECT;
  const px = (ctx.width - pw) / 2;
  const py = PLATE_TOP * sy;

  canvas.image("subject_luma.jpg", px, py, pw, ph);
  canvas.remap(px, py, pw, ph, subjectRamp(p), 1.0);

  canvas.alpha(0.52);
  canvas.image_tinted("subject_accent.png", px, py, pw, ph, accent2(p).hex);
  canvas.alpha(1.0);

  const plate = { x: px, y: py, w: pw, h: ph, s: sy };
  drawSubjectTracks(ctx, p, plate);
  drawFeatureMarks(ctx, p, plate);
  return plate;
}

function drawFrame(ctx, p, plate) {
  const s = plate.s;
  const dark = darkest(p).hex;
  const a = accent(p).hex;
  const b = accent2(p).hex;
  const x = plate.x, y = plate.y, w = plate.w, h = plate.h;

  canvas.fill(dark);
  strokeRect(x - 2 * s, y - 2 * s, w + 4 * s, h + 4 * s, dark, 3 * s);
  strokeRect(x - 9 * s, y - 9 * s, w + 18 * s, h + 18 * s, a, 2 * s);
  strokeRect(x - 15 * s, y - 15 * s, w + 30 * s, h + 30 * s, withAlpha(b, 0.45), 1 * s);

  /* crop brackets */
  const o = 15 * s, len = 20 * s;
  const pts = [
    [x - o, y - o, 1, 1], [x + w + o, y - o, -1, 1],
    [x - o, y + h + o, 1, -1], [x + w + o, y + h + o, -1, -1],
  ];
  for (let i = 0; i < pts.length; i++) {
    const cx = pts[i][0], cy = pts[i][1], sx = pts[i][2], sy = pts[i][3];
    line(cx, cy, cx + sx * len, cy, a, 2 * s);
    line(cx, cy, cx, cy + sy * len, a, 2 * s);
  }

  /* ruler ticks */
  for (let yy = y; yy <= y + h; yy += 120 * s) {
    line(x - o - 6 * s, yy, x - o, yy, withAlpha(a, 0.4), 1 * s);
    line(x + w + o, yy, x + w + o + 6 * s, yy, withAlpha(a, 0.4), 1 * s);
  }

  /* dimension line (mirrors with the type) */
  const dx = MIRROR ? x + w + 48 * s : x - 48 * s;
  line(dx, y, dx, y + h, withAlpha(a, 0.6), 1 * s);
  line(dx - 6 * s, y, dx + 6 * s, y, withAlpha(a, 0.8), 1 * s);
  line(dx - 6 * s, y + h, dx + 6 * s, y + h, withAlpha(a, 0.8), 1 * s);
  for (let k = 1; k < 8; k++) {
    const yy = y + h * k / 8;
    line(dx - 3 * s, yy, dx + 3 * s, yy, withAlpha(a, 0.45), 1 * s);
  }
}

function drawType(ctx, p, plate) {
  const sx = ctx.width / DESIGN_W;
  const sy = ctx.height / DESIGN_H;
  const s = Math.min(sx, sy);
  const field = p.background.hex;
  const rawAccent = accent(p).hex;
  const fg = mainText(p, field);
  const acc = readable(rawAccent, field, 85);
  const acc2 = readable(accent2(p).hex, field, 75);
  const dim = readable(mixHex(pick(p, 8, p.foreground).hex, fg, 0.30), field, 105);
  const bg = field;

  function txt(str, x, y, size, color, opts) {
    const o = Object.assign({}, opts || {});
    o.anchor = A(o.anchor || "start");
    const px = X(x) * sx, py = y * sy, fs = size * s, d = 1.4 * s;
    const shade = withAlpha(bg, 0.65);
    canvas.text(str, px - d, py, fs, shade, o);
    canvas.text(str, px + d, py, fs, shade, o);
    canvas.text(str, px, py - d, fs, shade, o);
    canvas.text(str, px, py + d, fs, shade, o);
    canvas.text(str, px, py, fs, color, o);
  }

  /* vertical Japanese */
  const jpN = JP.length;
  const lh = 112;
  const groupH = jpN * lh + 26 + 64;
  const y0 = 495 - groupH / 2;
  for (let i = 0; i < jpN; i++) {
    const cy = y0 + i * lh + lh / 2;
    txt(JP.charAt(i), 150, cy + 0.36 * 96, 96, acc,
        { family: JPFONT, anchor: "middle" });
  }
  const sealY = y0 + jpN * lh + 26;
  canvas.fill(rawAccent);
  canvas.rect(WX(118, 64) * sx, sealY * sy, 64 * sx, 64 * sy);
  canvas.text(SEAL, X(150) * sx, (sealY + 32 + 0.36 * 38) * sy, 38 * s, textOn(rawAccent), {
    family: JPFONT, anchor: "middle", bold: true,
  });

  /* Spanish */
  txt(ES, 1770, 720, 24, dim, { family: SANS, anchor: "end" });

  /* footer left */
  txt("FEATURE TRACK / " + pad2(FRAMES) + " FR · " + FEATURES.length + " PTS · NEAREST NN",
      110, 982, 12, dim, { family: MONO });

  /* HUD */
  canvas.fill(acc2);
  canvas.circle(X(1712) * sx, 140 * sy, 4 * s);
  txt("REC · TRACK 01", 1726, 145, 12, acc2, { family: MONO });
  txt("FR " + pad2(FRAMES) + " / 24 FPS · " + FEATURES.length + " PTS",
      1770, 176, 11, acc, { family: MONO, anchor: "end" });
  txt("DETECT → ASSOCIATE → ID", 1770, 198, 11, dim,
      { family: MONO, anchor: "end" });

  /* kicker + rule */
  txt("CYBERPUNK SERIES · BLOB TRACKING", 1770, 404, 12, dim,
      { family: MONO, anchor: "end" });
  canvas.fill(acc);
  canvas.rect(WX(1630, 140) * sx, 428 * sy, 140 * sx, 2 * sy);

  /* headline */
  txt(TITLE1, 1770, 540, F1, fg, { family: DISPLAY, anchor: "end" });
  txt(TITLE2, 1770, 632, F2, acc,
      { family: DISPLAY, anchor: "end", bold: true });
  canvas.fill(acc);
  canvas.rect(WX(1680, 90) * sx, 668 * sy, 90 * sx, 3 * sy);

  /* vertical Chinese */
  const zhN = ZH.length;
  const zlh = 58;
  const ztop = 470 - zhN * zlh / 2;
  for (let i = 0; i < zhN; i++) {
    const cy = ztop + i * zlh + zlh / 2;
    txt(ZH.charAt(i), 1842, cy + 0.36 * 44, 44, acc2,
        { family: ZHFONT, anchor: "middle" });
  }

  /* footer right */
  txt("PALETTE " + p.slug.toUpperCase() + " · " + rawAccent.replace("#", "").toUpperCase(),
      1770, 944, 11, dim, { family: MONO, anchor: "end" });
  txt("TOKYO · 35.6762N 139.6503E · 2026", 1770, 982, 12, dim,
      { family: MONO, anchor: "end" });

  /* rotated dimension label (side follows MIRROR) */
  const dx = MIRROR ? plate.x + plate.w + 58 * s : plate.x - 58 * s;
  const dy = plate.y + plate.h / 2;
  canvas.push();
  canvas.translate(dx, dy);
  canvas.rotate(MIRROR ? 90 : -90);
  canvas.text("H 960 PX · TRACK", 0, 0, 12 * s, fg,
              { family: MONO, anchor: "middle" });
  canvas.pop();
}

function drawBackdrop(ctx, p) {
  const w = ctx.width, h = ctx.height;
  const sx = w / DESIGN_W, sy = h / DESIGN_H, s = Math.min(sx, sy);
  const left = !MIRROR;
  const acc = accent(p).hex;
  const acc2 = accent2(p).hex;
  const dark = pick(p, 0, p.background).hex;
  const mid = pick(p, 8, p.foreground).hex;
  const fg = p.foreground.hex;
  const base = p.background.hex;

  function rectD(x, y, ww, hh, color) {
    canvas.fill(color);
    canvas.rect(x * sx, y * sy, ww * sx, hh * sy);
  }
  function lineD(x1, y1, x2, y2, color, width) {
    line(x1 * sx, y1 * sy, x2 * sx, y2 * sy, color, width * s);
  }
  function gridD(x0, y0, w0, h0, color, alpha, step) {
    canvas.stroke(withAlpha(color, alpha), 1 * s);
    for (let x = x0; x <= x0 + w0; x += step) {
      canvas.begin_path();
      canvas.move_to(x * sx, y0 * sy);
      canvas.line_to(x * sx, (y0 + h0) * sy);
      canvas.stroke_path();
    }
    for (let y = y0; y <= y0 + h0; y += step) {
      canvas.begin_path();
      canvas.move_to(x0 * sx, y * sy);
      canvas.line_to((x0 + w0) * sx, y * sy);
      canvas.stroke_path();
    }
  }
  function ghostD(str, x, y, size, color, anchor) {
    canvas.text(str, x * sx, y * sy, size * s, color, {
      family: DISPLAY, anchor: anchor || "middle", bold: true,
    });
  }
  function diagonalPanel(dir, topX, botX, color) {
    const bx = dir < 0 ? 1920 : 0;
    canvas.fill(color);
    canvas.begin_path();
    canvas.move_to(bx * sx, 0);
    canvas.line_to((bx + dir * topX) * sx, 0);
    canvas.line_to((bx + dir * botX) * sx, h);
    canvas.line_to(bx * sx, h);
    canvas.close_path();
    canvas.fill_path();
  }

  if (RECIPE === 1) {
    // 01 · halftone split: gradient field + diagonal ink panel + dot stencil
    canvas.linear_gradient(0, 0, w, h, [
      base, withAlpha(acc2, 0.42), withAlpha(acc, 0.24),
    ]);
    canvas.rect(0, 0, w, h);
    gridD(0, 0, 1920, 1080, mid, 0.14, 64);
    diagonalPanel(left ? 1 : -1, 1120, 880, withAlpha(dark, 0.90));
    lineD(left ? 1120 : 800, 0, left ? 880 : 1040, 1080, withAlpha(acc, 0.55), 1.5);
    canvas.image_tinted("p1.png", 0, 0, w, h, withAlpha(acc, 0.60));
    canvas.image_tinted("p2.png", 0, 0, w, h, withAlpha(acc2, 0.45));
    ghostD(pad2(INDEX), left ? 1460 : 460, 780, 430, withAlpha(acc, 0.09));
    lineD(left ? 1380 : 540, 120, left ? 1380 : 540, 980, withAlpha(acc2, 0.45), 1);
  } else if (RECIPE === 2) {
    // 02 · material monolith: hard texture panel against a flat ruled field
    canvas.linear_gradient(0, 0, w, h, [base, withAlpha(acc, 0.18)]);
    canvas.rect(0, 0, w, h);
    gridD(0, 0, 1920, 1080, mid, 0.17, 72);
    const pw = 1037;
    const px0 = left ? 0 : 1920 - pw;
    canvas.image("panel_tex.jpg", px0 * sx, 0, pw * sx, h);
    canvas.remap(px0 * sx, 0, pw * sx, h,
                 uniqSorted([base, dark, mid, fg]), 1.0);
    lineD(px0 + (left ? pw : 0), 0, px0 + (left ? pw : 0), 1080,
          withAlpha(acc, 0.9), 2);
    rectD(px0 + (left ? pw + 12 : -12), 0, 2, 1080, withAlpha(acc2, 0.55));
    ghostD(pad2(INDEX), left ? 1560 : 360, 790, 500, withAlpha(acc, 0.10));
    lineD(left ? 1190 : 730, 180, left ? 1190 : 730, 900, withAlpha(acc2, 0.45), 1);
    for (let i = 0; i < 6; i++) {
      const yy = 180 + i * 150;
      lineD(left ? 1160 : 760, yy, left ? 1220 : 700, yy, withAlpha(acc, 0.5), 1);
    }
  } else if (RECIPE === 3) {
    // 03 · topographic veil: contour lines against negative space + ghost glyph
    canvas.linear_gradient(0, 0, w, h, [base, withAlpha(acc2, 0.24)]);
    canvas.rect(0, 0, w, h);
    gridD(0, 0, 1920, 1080, mid, 0.12, 80);
    canvas.image_tinted("p1.png", 0, 0, w, h, withAlpha(acc, 0.72));
    rectD(left ? 0 : 1900, 0, 20, 1080, withAlpha(acc2, 0.55));
    ghostD(SEAL, left ? 1500 : 420, 560, 540, withAlpha(acc2, 0.10));
    lineD(left ? 1400 : 520, 160, left ? 1400 : 520, 930, withAlpha(acc, 0.35), 1);
    for (let i = 0; i < 5; i++) {
      lineD(left ? 1370 : 550, 200 + i * 170, left ? 1430 : 490, 200 + i * 170,
            withAlpha(acc, 0.4), 1);
    }
  } else if (RECIPE === 4) {
    // 04 · orbital rings: radial glow + concentric stencil + hard diagonal
    const cx = left ? 480 : 1440;
    canvas.radial_gradient(cx * sx, 500 * sy, 1250 * s, [
      withAlpha(acc2, 0.55), withAlpha(acc, 0.20), base,
    ]);
    canvas.rect(0, 0, w, h);
    diagonalPanel(left ? -1 : 1, 780, 640, withAlpha(dark, 0.78));
    lineD(left ? 1140 : 780, 0, left ? 1280 : 640, 1080, withAlpha(acc2, 0.5), 1.5);
    canvas.image_tinted("p1.png", 0, 0, w, h, withAlpha(acc, 0.72));
    canvas.image_tinted("p2.png", 0, 0, w, h, withAlpha(acc2, 0.30));
    canvas.no_fill();
    canvas.stroke(withAlpha(acc, 0.28), 1.5 * s);
    canvas.circle(cx * sx, 500 * sy, 280 * s);
    canvas.circle(cx * sx, 500 * sy, 400 * s);
    ghostD(pad2(INDEX), left ? 1490 : 430, 790, 430, withAlpha(acc, 0.08));
  } else if (RECIPE === 5) {
    // 05 · signal bands: horizontal tonal strata + diagonal texture strip
    canvas.clear(base);
    const cols = [dark, mid, acc, acc2, fg, base];
    const heights = [0.10, 0.07, 0.15, 0.09, 0.13, 0.11, 0.18, 0.17];
    let yy = 0;
    for (let i = 0; i < heights.length; i++) {
      rectD(0, yy * 1080, 1920, heights[i] * 1080 + 1,
            withAlpha(cols[i % cols.length], i % 2 ? 0.10 : 0.22));
      yy += heights[i];
    }
    gridD(0, 0, 1920, 1080, mid, 0.13, 64);
    canvas.image_tinted("p1.png", 0, 0, w, h, withAlpha(acc, 0.58));
    canvas.image_tinted("p2.png", 0, 0, w, h, withAlpha(acc2, 0.28));
    for (let i = 0; i < 4; i++) {
      rectD(0, 120 + i * 250, 1920, 2, withAlpha(acc, 0.55));
    }
    ghostD(pad2(INDEX), left ? 1500 : 420, 570, 480, withAlpha(acc, 0.08));
  } else {
    // 06 · light bloom: soft field + bokeh leak + hard technical panel
    canvas.image("bg_luma.jpg", 0, 0, w, h);
    canvas.remap(0, 0, w, h, bgRamp(p), 0.92);
    canvas.image_tinted("p1.png", 0, 0, w, h, withAlpha(acc, 0.57));
    const pw = 640;
    const px0 = left ? 1920 - pw : 0;
    rectD(px0, 0, pw, 1080, withAlpha(base, 0.90));
    gridD(px0, 0, pw, 1080, acc, 0.24, 54);
    lineD(px0 + (left ? 0 : pw), 0, px0 + (left ? 0 : pw), 1080,
          withAlpha(acc2, 0.65), 2);
    ghostD(pad2(INDEX), px0 + pw / 2, 780, 250, withAlpha(acc, 0.14));
    for (let i = 0; i < 4; i++) {
      lineD(px0 + 24, 160 + i * 210, px0 + pw - 24, 160 + i * 210,
            withAlpha(acc, 0.35), 1);
    }
  }
}

function drawTextScrim(ctx, p) {
  const w = ctx.width, h = ctx.height;
  const base = p.background.hex;
  const lw = w * 0.29, rw = w * 0.29;
  canvas.linear_gradient(0, 0, lw, 0,
                         [withAlpha(base, 0.62), withAlpha(base, 0.0)]);
  canvas.rect(0, 0, lw, h);
  canvas.linear_gradient(w, 0, w - rw, 0,
                         [withAlpha(base, 0.62), withAlpha(base, 0.0)]);
  canvas.rect(w - rw, 0, rw, h);
}

function draw(ctx) {
  const p = ctx.palette;
  canvas.clear(p.background.hex);
  drawBackdrop(ctx, p);
  drawTextScrim(ctx, p);

  const plate = drawSubject(ctx, p);
  drawMotionField(ctx, p, plate);
  drawClusterHUD(ctx, p, plate);
  drawFrame(ctx, p, plate);
  drawType(ctx, p, plate);
  drawHudScrim(ctx, p);
  drawAnalysisHUD(ctx, p);
}

function render(t, ctx) {
  const p = ctx.palette;
  const next = [
    p.slug, p.background.hex, p.foreground.hex,
    p.colors.map(function (c) { return c.hex; }).join(","),
    p.roles ? JSON.stringify(p.roles) : "",
  ].join("|");
  if (next === signature) {
    return;
  }
  draw(ctx);
  signature = next;
}
