/*
 * matrix-rain - the ColorRain effect from @xscriptor/xbackgrounds as an xwww scene.
 *
 * One glyph per column falls cell by cell over a fading background (the trail), with the colors
 * taken from the active palette: the workspace accent plus the vivid base16 entries, so the rain
 * follows the desktop theme. The head jumps to the next cell when it crosses it, so every
 * character stays crisp instead of stacking sub-pixel copies. Run it with a decent rate:
 *
 *   xwww scene run scene.js --fps 15 --timeout-ms 2000 --palette equisdots
 *
 * The character set matches the web component; speed is ~160 px/s at the 26 px design size with a
 * 6% trail per frame, drawn with a Nerd Font so every glyph is covered.
 */

const GLYPHS = "XSCRIPTORDEVX\u25A3\u25C8\u25C7\u25CE\u25CF\u25C9\u2726\u2727\u2B21\u25A5\u25A3\u25B3\u25BD\u25B2\u25BC\u25C6\u25CB\u25CC\u25CD\u25D0\u25D1\u25D2\u25D3\u2713\u2715\u2716\u25C6\u25C7\u25CB\u25CE\u25B6\u25B7\u25B8\u25B9\u25BA\u25BB\u25BC\u25BD\u25BE\u25BF\u25C0\u25C1\u25C2\u25C3\u25C4\u25C5";
const FONT = "Hack Nerd Font";
const DESIGN_WIDTH = 2400;
const FONT_SIZE = 26;
const SPEED = 160;
const FADE = 0.06;

let columns = 0;
let starts = [];
let cells = [];
let size = FONT_SIZE;

function hash(a, b) {
  let h = Math.imul(a, 2654435761) ^ Math.imul(b, 40503);
  h ^= h >>> 13;
  h = Math.imul(h, 1274126177);
  h ^= h >>> 16;
  return h >>> 0;
}

function withAlpha(hex, alpha) {
  const byte = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return hex.slice(0, 7) + byte.toString(16).padStart(2, "0").toUpperCase();
}

function paletteColors(palette) {
  const colors = [];
  const roles = palette.roles || {};
  if (roles.workspaceActive) {
    colors.push(roles.workspaceActive.hex);
  }
  for (let i = 1; i < Math.min(palette.colors.length, 7); i++) {
    colors.push(palette.colors[i].hex);
  }
  if (colors.length === 0) {
    colors.push(palette.foreground.hex);
  }
  return colors;
}

function setup(ctx) {
  size = Math.max(10, Math.round((FONT_SIZE * ctx.width) / DESIGN_WIDTH));
  columns = Math.max(1, Math.floor(ctx.width / size));
  starts = [];
  cells = [];
  for (let i = 0; i < columns; i++) {
    starts.push((hash(i, 0x5eed) % 1000) / 1000);
    cells.push(-1000000);
  }
  canvas.clear(ctx.palette.background.hex);
}

function render(t, ctx) {
  const palette = ctx.palette;
  const colors = paletteColors(palette);

  /* Trail: darken the previous frame with the palette background. */
  canvas.fill(withAlpha(palette.background.hex, FADE));
  canvas.rect(0, 0, ctx.width, ctx.height);

  const margin = size * 2;
  const span = ctx.height + margin * 2;
  const speed = (SPEED * size) / FONT_SIZE;
  canvas.alpha(0.95);

  for (let i = 0; i < columns; i++) {
    const travelled = starts[i] * span + speed * t;
    const cycle = Math.floor(travelled / span);
    const pos = travelled - cycle * span;
    const cell = Math.floor((pos - margin) / size);
    if (cell === cells[i]) {
      continue;
    }
    cells[i] = cell;
    if (cell < 0) {
      continue;
    }
    const color = colors[hash(i, cycle + 1) % colors.length];
    const glyph = GLYPHS.charAt(hash(i, cycle * 131 + cell) % GLYPHS.length);
    canvas.text(glyph, i * size, cell * size, size, color, { family: FONT });
  }

  canvas.alpha(1.0);
}
