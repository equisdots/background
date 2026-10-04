/*
 * astro-ascii — the ASCII-art astronaut with live color cards.
 *
 * `ascii.png` is a stencil of the artwork (alpha = ink coverage; generated from
 * `base.jpg`, the cover). The scene paints the canvas with the palette
 * `background`, keeps the original glyph colors and adds a soft foreground tint
 * (ART_BLEND) so the art stays readable on light and dark backgrounds.
 *
 * The static palette block baked into the artwork is covered with a panel that
 * holds the same live swatch cards as astro-palette: one card per color with its
 * label and hex code, restyled within a second of the desktop palette changing.
 *
 * Run with the xwww scene engine:
 *   xwww scene render scene.js -o out.png --size 2400x1350 --palette equisdots
 *   xwww scene run    scene.js --fps 2 --timeout-ms 2000 --palette equisdots
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

/* How much foreground tint to blend over the original glyph colors. */
const ART_BLEND = 0.4;

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

function drawPanel(ctx) {
  const palette = ctx.palette;
  const scale = ctx.width / DESIGN_W;
  const items = paletteItems(palette);
  const rows = Math.ceil(items.length / COLS);

  /* Cover the static block baked into the artwork with the palette background. */
  canvas.fill(palette.background.hex);
  canvas.round_rect(BLOCK.x * scale, BLOCK.y * scale, BLOCK.w * scale, BLOCK.h * scale, 10 * scale);

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

function draw(ctx) {
  const palette = ctx.palette;

  /* The background is exactly the palette background color. */
  canvas.clear(palette.background.hex);

  /* Original glyph colors plus a soft foreground tint for contrast. */
  canvas.image("ascii.png", 0, 0, ctx.width, ctx.height);
  canvas.alpha(ART_BLEND);
  canvas.image_tinted("ascii.png", 0, 0, ctx.width, ctx.height, palette.foreground.hex);
  canvas.alpha(1.0);

  drawPanel(ctx);
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
