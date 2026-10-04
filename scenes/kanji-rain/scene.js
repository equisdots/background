/*
 * kanji-rain - the matrix-rain effect with an East Asian charset.
 *
 * Same falling-cell effect as `matrix-rain` (one glyph per column, trail from
 * darkening the previous frame, palette colors), but the glyph pool is
 * Japanese kana and kanji, Chinese characters and the letter X, drawn with
 * Noto Sans CJK. The head jumps to the next cell when it crosses it, so every
 * character stays crisp instead of stacking sub-pixel copies. Run it with:
 *
 *   xwww scene run scene.js --fps 15 --timeout-ms 2000 --palette equisdots
 *
 * Requires a CJK font (Noto Sans CJK, from `noto-fonts-cjk`); without it the
 * characters render as empty boxes.
 */

const GLYPHS =
  "X" +
  "\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD" +
  "\u30BF\u30C1\u30C4\u30C6\u30C8\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF\u30D2\u30D5\u30D8\u30DB" +
  "\u30DE\u30DF\u30E0\u30E1\u30E2\u30E4\u30E6\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED\u30EF\u30F2" +
  "\u30F3\u3042\u3044\u3046\u3048\u304A\u304B\u304D\u304F\u3051\u3053\u3055\u3057\u3059\u305B" +
  "\u305D\u305F\u3061\u3064\u3066\u3068\u306A\u306B\u306C\u306D\u306E\u306F\u3072\u3075\u3078" +
  "\u307B\u307E\u307F\u3080\u3081\u3082\u3084\u3086\u3088\u3089\u308A\u308B\u308C\u308D\u308F" +
  "\u3092\u3093" +
  "\u96E8\u7A7A\u661F\u6708\u65E5\u5149\u5F71\u98A8\u6C34\u706B\u6728\u91D1\u571F\u5FC3\u5922" +
  "\u9F8D\u4F8D\u5200\u685C\u82B1\u9CE5\u5C71\u5DDD\u6D77\u96F2\u96EA\u591C\u671D\u6625\u590F" +
  "\u79CB\u51AC" +
  "\u5929\u5730\u7384\u9EC4\u5B87\u5B99\u6D2A\u8352\u65E5\u6708\u76C8\u6603\u8FB0\u5BBF\u5217" +
  "\u5F35\u5BD2\u4F86\u6691\u5F80\u79CB\u6536\u51AC\u85CF\u958F\u9918\u6210\u6B72\u5F8B\u5442" +
  "\u8ABF\u967D\u96F2\u9A30\u81F4\u96E8\u9732\u7D50\u70BA\u971C\u91D1\u751F\u9E97\u6C34\u7389" +
  "\u51FA\u5D11\u5CA1\u528D\u865F\u5DE8\u95D5\u73E0\u7A31\u591C\u5149\u679C\u73CD\u674E\u594E" +
  "\u83DC\u91CD\u82A5\u8591\u6D77\u9E79\u6CB3\u6DE1\u9C57\u6F5B\u7FBD\u7FD4\u9F8D\u5E2B\u706B" +
  "\u5E1D\u9CE5\u5B98\u4EBA\u7687\u59CB\u5236\u6587\u5B57\u4E43\u670D\u8863\u88F3\u63A8\u4F4D" +
  "\u8B93\u570B\u6709\u865E\u9676\u5510X";
const FONT = "Noto Sans CJK JP";
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
  size = Math.max(12, Math.round((FONT_SIZE * ctx.width) / DESIGN_WIDTH));
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
