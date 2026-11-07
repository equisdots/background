/*
 * NEXTGEN · ASTRONAUT BLOB TRACKING — sharp palette-reactive xwww scene.
 *
 * Layers:
 *   bg_luma.jpg   atmospheric backdrop, remapped to the palette
 *   base_luma.jpg full artwork luminance, remapped to the palette
 *   base_soft.png original color at 35% alpha, keeps skin/fluid detail
 *   accent.png    red/accent mask, retinted from the palette
 *   scanlines + vignette procedural
 */
const W = 3473;
const H = 2160;

let signature = null;

function channels(hex) {
  const s = hex.replace(/^#/, "");
  return [
    parseInt(s.slice(0, 2), 16) || 0,
    parseInt(s.slice(2, 4), 16) || 0,
    parseInt(s.slice(4, 6), 16) || 0,
  ];
}

function lum(hex) {
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
  out.sort(function (a, b) { return lum(a) - lum(b); });
  return out;
}

function pick(p, i) {
  if (p.colors && p.colors[i] && p.colors[i].hex) return p.colors[i].hex;
  if (p.colors && p.colors[0] && p.colors[0].hex) return p.colors[0].hex;
  return p.foreground.hex;
}

function accent(p) {
  if (p.roles && p.roles.workspaceActive && p.roles.workspaceActive.hex) {
    return p.roles.workspaceActive.hex;
  }
  return pick(p, 1);
}

function accent2(p) {
  if (p.roles && p.roles.accent2 && p.roles.accent2.hex) {
    return p.roles.accent2.hex;
  }
  return pick(p, 5);
}

function dark(p) {
  return mixHex(p.background.hex, "#000000", 0.82);
}

function deep(p) {
  return mixHex(p.background.hex, "#000000", 0.62);
}

function baseRamp(p) {
  return uniqSorted([
    dark(p),
    accent(p),
    accent2(p),
    p.foreground.hex,
  ]);
}

function bgRamp(p) {
  return uniqSorted([
    dark(p),
    mixHex(deep(p), accent(p), 0.55),
    deep(p),
  ]);
}

function draw(ctx) {
  const p = ctx.palette;
  const w = ctx.width, h = ctx.height;

  canvas.clear(p.background.hex);
  canvas.image("bg_luma.jpg", 0, 0, w, h);
  canvas.remap(0, 0, w, h, bgRamp(p), 1.0);

  const s = Math.min(w / W, h / H);
  const iw = W * s, ih = H * s;
  const ix = (w - iw) / 2, iy = (h - ih) / 2;

  canvas.image("base_luma.jpg", ix, iy, iw, ih);
  canvas.remap(ix, iy, iw, ih, baseRamp(p), 1.0);
  canvas.image("base_soft.png", ix, iy, iw, ih);
  canvas.image_tinted("accent.png", ix, iy, iw, ih,
                      withAlpha(accent2(p), 0.38));

  const step = Math.max(3, Math.round(h / 360));
  const lineCol = withAlpha(p.foreground.hex, 0.030);
  canvas.stroke(lineCol, 1);
  for (let y = 0; y < h; y += step) {
    canvas.begin_path();
    canvas.move_to(0, y);
    canvas.line_to(w, y);
    canvas.stroke_path();
  }

  const shade = mixHex(p.background.hex, "#000000", 0.60);
  canvas.radial_gradient(w / 2, h / 2, Math.max(w, h) * 0.68, [
    withAlpha(shade, 0.0),
    withAlpha(shade, 0.08),
    withAlpha(shade, 0.40),
  ]);
  canvas.rect(0, 0, w, h);
}

function render(t, ctx) {
  const p = ctx.palette;
  const sig = [
    p.slug, p.background.hex, p.foreground.hex,
    p.colors.map(function (c) { return c.hex; }).join(","),
    p.roles ? JSON.stringify(p.roles) : "",
  ].join("|");
  if (sig === signature) return;
  draw(ctx);
  signature = sig;
}
