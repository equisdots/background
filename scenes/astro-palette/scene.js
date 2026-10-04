/*
 * astro-palette — the astronaut wallpaper with live color cards.
 *
 * The artwork background is whatever the active palette says: the canvas is
 * painted with `ctx.palette.background` and the line-art cutout (`astro.png`,
 * transparent background) is drawn on top, so switching palettes changes the
 * whole background exactly to the palette background color.
 *
 * The cutout keeps the original line colors; for contrast on light backgrounds
 * a copy tinted with the palette foreground is drawn underneath and the
 * original colors are blended back at ART_BLEND.
 *
 * Run with the xwww scene engine:
 *   xwww scene render scene.js -o out.png --size 2400x1350 --palette equisdots
 *   xwww scene run    scene.js --fps 2 --timeout-ms 2000 --palette equisdots
 *
 * The script only redraws when the palette signature changes; between changes
 * the engine keeps the last canvas, so text layout happens once per palette.
 */

const FONT = "Noto Sans";

/* Geometry measured on the 3840x2160 base image (the original card block). */
const DESIGN_W = 3840;
const BLOCK = { x: 1112, y: 1104, w: 1528, h: 604 };

const COLS = 6;
const PAD = 10;
const GAP = 4;
const RADIUS = 8;
const FOOTER = 80;

/* How much of the original line color to blend over the foreground tint. */
const ART_BLEND = 0.55;

let signature = null;

function channels(hex) {
  const s = hex.replace(/^#/, "");
  return [
    parseInt(s.slice(0, 2), 16) || 0,
    parseInt(s.slice(2, 4), 16) || 0,
    parseInt(s.slice(4, 6), 16) || 0,
  ];
}

function luma(hex) {
  const [r, g, b] = channels(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function withAlpha(hex, alpha) {
  const byte = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return hex.slice(0, 7) + byte.toString(16).padStart(2, "0").toUpperCase();
}

/* Readable text color for a card of the given color. */
function textOn(hex, foreground) {
  if (luma(hex) > 150) {
    return "#15171c";
  }
  return luma(foreground) > 150 ? foreground : "#f2f2f2";
}

function paletteItems(palette) {
  const items = [{ label: "bg", hex: palette.background.hex, index: null }];
  for (let i = 0; i < palette.colors.length; i++) {
    items.push({ label: "color" + i, hex: palette.colors[i].hex, index: i });
  }
  items.push({ label: "fg", hex: palette.foreground.hex, index: null });
  return items;
}

function drawCard(x, y, w, h, item, palette, scale) {
  canvas.fill(item.hex);
  canvas.round_rect(x, y, w, h, RADIUS * scale);

  const color = textOn(item.hex, palette.foreground.hex);
  const labelSize = h * 0.30;
  const hexSize = h * 0.20;

  if (item.index !== null) {
    canvas.text(String(item.index), x + w - 10 * scale, y + h * 0.16, h * 0.16, withAlpha(color, 0.6), {
      family: FONT,
      anchor: "end",
    });
  }

  canvas.text(item.label, x + w / 2, y + h * 0.52, labelSize, color, {
    family: FONT,
    anchor: "middle",
    bold: true,
  });
  canvas.text(item.hex, x + w / 2, y + h * 0.80, hexSize, withAlpha(color, 0.92), {
    family: FONT,
    anchor: "middle",
  });
}

function draw(ctx) {
  const palette = ctx.palette;
  const scale = ctx.width / DESIGN_W;

  /* The background is exactly the palette background color. */
  canvas.clear(palette.background.hex);

  /* Line art with contrast on any background: foreground tint first, original
     colors blended back on top. */
  canvas.image_tinted("astro.png", 0, 0, ctx.width, ctx.height, palette.foreground.hex);
  canvas.alpha(ART_BLEND);
  canvas.image("astro.png", 0, 0, ctx.width, ctx.height);
  canvas.alpha(1.0);

  /* Cover the original static cards with the active palette background. */
  canvas.fill(palette.background.hex);
  canvas.round_rect(BLOCK.x * scale, BLOCK.y * scale, BLOCK.w * scale, BLOCK.h * scale, 10 * scale);

  const items = paletteItems(palette);
  const rows = Math.ceil(items.length / COLS);
  const gridW = BLOCK.w * scale - 2 * PAD * scale;
  const gridH = BLOCK.h * scale - 2 * PAD * scale - FOOTER * scale;
  const cardW = (gridW - (COLS - 1) * GAP * scale) / COLS;
  const cardH = (gridH - (rows - 1) * GAP * scale) / rows;

  for (let i = 0; i < items.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = BLOCK.x * scale + PAD * scale + col * (cardW + GAP * scale);
    const y = BLOCK.y * scale + PAD * scale + row * (cardH + GAP * scale);
    drawCard(x, y, cardW, cardH, items[i], palette, scale);
  }

  /* Footer inside the panel: palette name and code. */
  const captionX = (BLOCK.x + BLOCK.w / 2) * scale;
  const captionY = (BLOCK.y + BLOCK.h) * scale;
  canvas.text(palette.name, captionX, captionY - 50 * scale, 38 * scale, palette.foreground.hex, {
    family: FONT,
    anchor: "middle",
    bold: true,
  });
  canvas.text(palette.slug + " · base16 · xwww scene", captionX, captionY - 16 * scale, 22 * scale, withAlpha(palette.foreground.hex, 0.75), {
    family: FONT,
    anchor: "middle",
  });
}

function render(t, ctx) {
  const palette = ctx.palette;
  const next = [
    palette.slug,
    palette.name,
    palette.background.hex,
    palette.foreground.hex,
    palette.colors.map((color) => color.hex).join(","),
    palette.roles ? Object.keys(palette.roles).join(",") : "",
  ].join("|");

  if (next === signature) {
    return;
  }
  draw(ctx);
  signature = next;
}
