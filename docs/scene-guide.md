# Interactive scene guide

This is the complete guide to the interactive wallpapers of the equisdots
desktop: what they are, how the pieces fit together, how to install them and
how to write new ones with the current capabilities of the `xwww` scene engine.

For the directory contract, the collection catalog and the authoring summary,
see [interactive-scenes.md](interactive-scenes.md). This document expands those
topics with the full API reference, installation details, the performance
model and an explicit list of what is and is not possible today.

## Table of contents

1. [Overview](#overview)
2. [How it works](#how-it-works)
3. [Installing](#installing)
4. [Creating a scene](#creating-a-scene)
5. [Canvas API reference](#canvas-api-reference)
6. [Allowed and not allowed](#allowed-and-not-allowed)
7. [Performance guidelines](#performance-guidelines)
8. [Debugging](#debugging)
9. [Publishing a scene to this collection](#publishing-a-scene-to-this-collection)
10. [References](#references)

## Overview

A scene is a directory with a JavaScript file (`scene.js`) that draws a
wallpaper procedurally on a canvas. Scenes are rendered by the `xwww` client
with its scene engine (QuickJS for JavaScript, tiny-skia for rasterization) and
displayed by `xwww-daemon` through a `wlr-layer-shell` background surface, the
same pipeline used for static images.

Scenes are not limited to static artwork: they receive the time on every frame,
react to the active desktop palette, and can load local images as assets. They
cannot receive pointer or keyboard input, so the wallpaper always stays
click-through.

The equisdots stack ties everything together:

- `xwww` renders frames and pushes them to the daemon.
- `xwww-daemon` owns the layer surface and displays frames.
- `davincix` is the wallpaper kernel: it lists scene directories next to images
  and videos, applies them with an entry transition, and stores the active one.
- The Quickshell picker shows scene directories as regular entries, using a
  cover image (`base.jpg`) as the thumbnail.

## How it works

### Components and data flow

```
scene.js ──> xwww scene run ──> rendered frame ──> xwww-daemon ──> layer surface
                 │                                      ▲
                 └── palette provider (1 s polling) ─────┘
```

1. On start, `xwww scene run` asks the daemon for the outputs, creates one
   scene engine per output and renders the first frame. That frame carries the
   entry transition requested by `davincix` (for example `fade` or `wipe`); the
   run loop waits for the transition duration before sending anything else.
2. After that, every frame is sent as an instant transition. Frames are only
   sent when the canvas actually changed since the previous one, so a scene
   that draws once and then waits for input consumes almost no CPU.
3. The daemon receives full frames (LZ4-compressed over a socket, copied into
   shared memory) and commits them to the background surface. There is no
   damage-region protocol: every frame is a full frame.
4. The palette provider re-reads its source at most once per second. When the
   palette changes, the engine requests a repaint, crossfades from the previous
   frame to the new one (`--palette-fade`, 800 ms by default) and the daemon
   receives the blended frames like any other frame.

### Palette handling

`davincix` runs scenes with `--palette equisdots`. That provider reads:

- the active palette slug from `~/.config/hypr/settings.json` (`bar.palette`,
  with the legacy `dock.palette` as fallback, and `x` as the final fallback);
- the palette file itself from
  `~/.config/hypr/scripts/quickshell/dock/palettes/<slug>.json`
  (subdirectories such as `community/` are searched too).

Any scene can also be run manually with another source: `--palette xwww`,
`--palette file:<path>`, `--palette command:<cmd>` or `--palette
equisdots:<slug>`. Any desktop that writes
`$XDG_CONFIG_HOME/xwww/palette.json` can drive scenes without Hyprland.

The palette object exposed to scenes contains `slug`, `name`, `background`,
`foreground`, `colors` (`base16` `color0..color15`) and `roles` (semantic
overrides such as `workspaceActive`). See
[Palette access](#palette-access) for the exact shape.

### Entry transitions

The first frame of a scene uses the transition flags exactly like `xwww img`:
`fade`, `wipe`, `grow`, `outer`, `wave`, `glitch`, `decrypt`, `dissolve`,
`clock`, `zoom`, `pixelate`, `ripple`, `blinds`, `spiral`, `static`,
`parallax` variants, `melt`, `shatter`, `simple`, directional and `random`.
`davincix set <scene-dir>` resolves `random` against that full set. Later
frames are always instant, and the run loop counts the transition from the
moment the first frame is sent, so rendering the scene does not cut the
animation short.

### Performance envelope

Frames are full-screen and travel through the image pipeline, so the cost grows
with the number of frames per second. Measured references on a 1920x1080
display (one core = 100%):

| Scene | Frame rate | Client | Daemon |
|---|---|---|---|
| Static card scene (redraws only on palette change) | 15 fps | 0% between changes | 0% |
| Glyph rain with about 90 columns (matrix-rain) | 15 fps | about 38% | about 13% |
| Same scene asking for 120 fps | about 30-35 fps real | about 80% | about 30% |

Asking for very high frame rates does not make the pipeline faster: the client
stops sleeping and runs as fast as it can, which is roughly 30-35 fps at
1920x1080 on this machine. Animated scenes are usually pleasant at 10-15
fps, and a scene that only redraws when its inputs change costs nothing while
idle. See [Performance guidelines](#performance-guidelines).

### Requirements

- `xwww` 0.13.1 or newer, built with the `scene` feature. The release binaries
  published on GitHub include it; the installer builds with `--features scene`
  as a fallback.
- A compositor with `wlr-layer-shell` (Hyprland in the equisdots desktop).
- No GPU or shader support is involved: everything is rasterized on the CPU.

## Installing

### Installing xwww

The recommended path is the installer from the dots repository, which downloads
the checksum-verified release for the machine architecture and installs the
client and daemon in `/usr/local/bin`:

```sh
# from a clone of equisdots/dots
./scripts/install-xwww.sh
```

The version defaults to `v0.13.1` and can be overridden, for example with an
older release: `XWWW_VERSION=v0.12.1 ./scripts/install-xwww.sh`. The hyprland
repository ships an equivalent installer (`install.sh`, `XWWW_VERSION=...`).

`davincix` resolves the binaries in this order: `DAVINCIX_XWWW` /
`DAVINCIX_XWWW_DAEMON` environment variables, then `~/.local/bin`, then the
`PATH` (where `/usr/local/bin` lives). A development build can therefore live
in `~/.local/bin` without touching the system copy.

### Installing a scene

A scene is just a directory; installing it means putting it where the wallpaper
collection lives:

```sh
cp -r my-scene ~/.config/hypr/wallpapers/
```

`davincix import` copies loose image or video files and prepares their
thumbnails; scene directories are installed by copying them (or by cloning this
collection).

The directory must contain `scene.js`; a `base.jpg` cover is strongly
recommended because it is what the picker shows. `davincix` scans recursively,
so nested media files also appear (flattened as `sub__dir__pic.jpg`).

Apply it like any wallpaper:

```sh
davincix set ~/.config/hypr/wallpapers/my-scene
davincix set ~/.config/hypr/wallpapers/my-scene --transition decrypt
```

The scene also appears in the Quickshell picker; selecting its card applies it
with the configured entry transition. `davincix current` reports
`<dir>/scene.js` while a scene is running, and the last frame is cached to
`current_wallpaper.png` for the lock screen and SDDM.

The frame rate used by `davincix` defaults to 15 fps and can be changed per
invocation:

```sh
DAVINCIX_SCENE_FPS=30 davincix set ~/.config/hypr/wallpapers/my-scene
```

### Thumbnails

`davincix thumbs` prepares the picker thumbnails. For scenes, the thumbnail is
rendered from `base.jpg` (or `base.jpeg`, `base.png`, `base.webp`); without a
cover the picker shows a placeholder. The cached thumbnail is named
`scn_<name>.jpg`.

### Running a scene directly (development)

The scene engine can be used without the kernel, which is the fastest way to
iterate:

```sh
xwww scene check  scene.js                                  # compile only
xwww scene render scene.js -o preview.png --size 1920x1080  # one frame
xwww scene run    scene.js --fps 15 --palette equisdots     # live
```

Useful flags: `--palette <source>`, `--timeout-ms <ms>` (default 100, davincix
uses 2000), `--asset <path>` (extra asset directory, repeatable),
`--palette-fade <ms>` and the entry transition flags. During development it is
often enough to run the client against the live daemon with a low frame rate
and watch `xwww scene run` output.

## Creating a scene

### Directory contract

```
my-scene/
  scene.js     required; the JavaScript scene
  base.jpg     recommended; cover used for the picker thumbnail
  <assets>     optional; images loaded with canvas.image
```

### Lifecycle

A scene is a single plain JavaScript file with two optional top-level
functions:

```js
function setup(ctx) {
  // Runs once before the first frame, and again if the engine reloads.
  // Useful for computing geometry from ctx.width and ctx.height.
}

function render(t, ctx) {
  // Runs once per frame. t is the elapsed time in seconds since the scene
  // started; ctx is rebuilt for every frame. Must be synchronous and must
  // finish inside the frame budget.
}
```

Module-level variables persist between frames and are the right place for
scene state (particles, positions, cached signatures). A frame that throws or
exceeds the timeout is discarded and the previous frame stays on screen, so a
bug does not blank the wallpaper.

### Context object

`ctx` is read-only and rebuilt per frame:

```js
{
  width, height,   // output size in physical pixels
  frame,           // monotonically increasing frame counter
  now,             // wall clock in milliseconds since the Unix epoch
  palette: {
    slug: "x",
    name: "X",
    background: { hex: "#050505", r: 5, g: 5, b: 5 },
    foreground: { hex: "#f7f1ff", r: 247, g: 241, b: 255 },
    colors: [ /* base16 color0..color15 as { hex, r, g, b } */ ],
    roles: { workspaceActive: { hex: "#eab308", r: 234, g: 179, b: 8 } },
  },
  events: [],      // always empty today; event providers are not implemented
}
```

There is no device pixel ratio to apply: `ctx.width` and `ctx.height` are
already the physical pixels of the output surface. Scenes that must look the
same at any resolution should scale their geometry from these values (for
example, a design width constant mapped to `ctx.width`).

### Palette access

```js
function render(t, ctx) {
  const { background, foreground, colors, roles } = ctx.palette;
  const accent = roles.workspaceActive || colors[1] || foreground;

  canvas.clear(background.hex);
  canvas.linear_gradient(0, 0, ctx.width, ctx.height,
                         [background.hex, accent.hex]);
  canvas.rect(0, 0, ctx.width, ctx.height);
}
```

`roles` only contains the entries present in the palette file; always provide a
fallback such as `colors[1]` or `foreground`. Palettes are polled once per
second, so a change is reflected in the scene within about a second, with the
crossfade controlled by `--palette-fade` (`0` disables it).

### Assets

Images are loaded from the scene's own directory (and from any extra `--asset`
directory). Only those paths are allowed; anything else is rejected at runtime.

```js
function render(t, ctx) {
  canvas.clear(ctx.palette.background.hex);

  // Draw an image scaled into a box.
  canvas.image("astro.png", 0, 0, ctx.width, ctx.height);

  // Stencil: paint an image with a flat color, keeping its alpha.
  canvas.image_tinted("astro.png", 0, 0, ctx.width, ctx.height, "#eab308");

  // Recolor a region: luminance to a gradient of colors, blended by strength.
  canvas.remap(0, 0, ctx.width, ctx.height, ["#000000", "#5ad4e6"], 0.8);
}
```

Assets are decoded once and cached per size and tint, so repeated calls are
cheap. Images are never fetched from the network.

### Animation patterns

Time-based motion uses `t` directly; there are no timers:

```js
const SPEED = 160; // pixels per second

function render(t, ctx) {
  canvas.clear(ctx.palette.background.hex);
  const y = (SPEED * t) % (ctx.height + 40) - 20;
  canvas.fill(ctx.palette.foreground.hex);
  canvas.circle(ctx.width / 2, y, 12);
}
```

Scenes that only change occasionally should redraw only when their inputs
change. The engine sends a frame only when the canvas changed, so an idle scene
is free:

```js
let signature = null;

function render(t, ctx) {
  const next = ctx.palette.background.hex + "|" + ctx.palette.slug;
  if (next === signature) {
    return; // nothing to do this frame
  }
  signature = next;

  canvas.clear(ctx.palette.background.hex);
  canvas.fill(ctx.palette.foreground.hex);
  canvas.text("ready", 40, 80, 32, ctx.palette.foreground.hex, {
    family: "Noto Sans",
    anchor: "start",
  });
}
```

Text layout goes through the font stack (resvg) and is the most expensive
drawing call, but results are cached per glyph, size, family, anchor and color.
Draw text once per palette change rather than every frame. For trails of
characters (glyph rain), advance the head cell by cell and draw each glyph
once; this keeps characters crisp and the cost low.

For interactive-looking motion without input, use a synthetic attractor or a
periodic field. Mouse and keyboard events are not available.

## Canvas API reference

All calls are methods of the global `canvas` object, except `log`, which is a
global function. Colors are `"#rgb"`, `"#rrggbb"`, `"#rrggbbaa"` strings or
`[r, g, b]` / `[r, g, b, a]` arrays (components 0-255). Named CSS colors and
`rgb()` / `hsl()` strings are not accepted.

| Call | Notes |
|---|---|
| `canvas.clear(color)` | Overwrites the whole surface, no blending. |
| `canvas.fill(color)` / `canvas.no_fill()` | Fill paint for the next shapes and paths. |
| `canvas.stroke(color, width)` / `canvas.no_stroke()` | Stroke paint; `width` defaults to 2. |
| `canvas.alpha(value)` | Opacity multiplier for subsequent paints (0.0-1.0). |
| `canvas.rect(x, y, w, h)` | Rectangle. |
| `canvas.circle(cx, cy, r)` | Circle. |
| `canvas.round_rect(x, y, w, h, r)` | Rounded rectangle. |
| `canvas.begin_path()` | Starts a path. |
| `canvas.move_to(x, y)` | Path cursor. |
| `canvas.line_to(x, y)` | Line segment. |
| `canvas.quad_to(cx, cy, x, y)` | Quadratic curve. |
| `canvas.cubic_to(c1x, c1y, c2x, c2y, x, y)` | Cubic curve. |
| `canvas.close_path()` | Closes the path. |
| `canvas.fill_path()` / `canvas.stroke_path()` | Draws the current path. |
| `canvas.linear_gradient(x0, y0, x1, y1, colors)` | Evenly spaced stops. |
| `canvas.radial_gradient(cx, cy, r, colors)` | Evenly spaced stops. |
| `canvas.image(path, x, y, w, h)` | Asset scaled into the box. |
| `canvas.image_tinted(path, x, y, w, h, color)` | Asset painted with a flat color, alpha kept. |
| `canvas.remap(x, y, w, h, colors, strength)` | Luminance-to-gradient recolor of a region. |
| `canvas.push()` / `canvas.pop()` | Transform stack. |
| `canvas.translate(x, y)` | Transform stack. |
| `canvas.rotate(degrees)` | Transform stack. |
| `canvas.scale(x, y)` | Transform stack. |
| `canvas.text(str, x, y, size, color, options)` | Text with system fonts. |
| `log(...values)` | Writes to stderr with a `[scene]` prefix. |

`canvas.text` options: `{ family, anchor, bold }`. `anchor` is `"start"`,
`"middle"` or `"end"`; `bold` is a boolean. The baseline is at `x, y`.

### Hard limits

- Rendering runs one frame at a time and must be synchronous.
- Per-frame execution budget: `--timeout-ms` (100 ms by default, 2000 ms under
  davincix). A frame that exceeds it is discarded.
- JavaScript memory is limited to 32 MB and the stack to 1 MB.
- There is no filesystem, network, process or module access; `require` and
  `import` of external files do not exist. `Math`, `JSON` and `Date` are
  available.

## Allowed and not allowed

This section is written against `xwww` 0.13.1. A scene will run unmodified only
if it stays inside the supported subset.

### Allowed

- Procedural 2D drawing with the canvas API above: shapes, paths, curves,
  gradients, transforms, alpha, text and local image assets.
- Reacting to the active palette, the wall clock and the elapsed time.
- Module-level state that persists between frames.
- Any resolution: read `ctx.width` and `ctx.height` and scale from them.
- Change-driven redraw, so static scenes cost no CPU while idle.

### Not allowed, with alternatives

| Not available | Why | Alternative |
|---|---|---|
| `requestAnimationFrame`, `setInterval`, `setTimeout` | The engine drives frames; JavaScript timers are not exposed. | Compute everything from `t` and `ctx.frame`. |
| Canvas 2D context (`getContext("2d")`, `fillStyle`, `fillRect`, `fillText`, `globalAlpha`, `save()`/`restore()`) | This is a custom API, not the browser canvas. | Use `canvas.fill`, `canvas.rect`, `canvas.text`, `canvas.alpha`, `canvas.push()`/`pop()`. |
| `Path2D`, `measureText` | Not exposed. | Build paths with `begin_path`/`move_to`/`line_to`/curves; estimate text metrics or anchor with `start`/`middle`/`end`. |
| Gradient stops with offsets (`addColorStop`) | Gradients accept a plain color array with evenly spaced stops. | Pre-interpolate colors and pass more entries, or draw several bands. |
| Gradient strokes | Strokes take a single solid color. | Split the path into short segments and set a color per segment. |
| Blend modes (`globalCompositeOperation`), shadows (`shadowBlur`), filters (`filter: blur()`) | Not exposed by the canvas API. | Approximate with layered draws and `canvas.alpha`; there is no true additive or blur compositing. |
| `getImageData` / `putImageData` | No pixel buffers are exposed to scenes. | Use `canvas.remap`, `canvas.image` and `canvas.image_tinted`; there is no per-pixel access. |
| WebGL, WebGPU, shaders, three.js | Scenes are CPU 2D only. | Rewrite the effect with canvas 2D, or use a video wallpaper through `davincix` and `mpvpaper`. |
| DOM, HTML, CSS, SVG | There is no browser environment. | Draw with the canvas API. |
| `import`, `require`, npm packages | A scene is a single plain script. | Inline the code you need. |
| `fetch`, `XMLHttpRequest`, `new Image()` with a URL | No network access. | Ship assets inside the scene directory and use `canvas.image`. |
| `async` / `await`, Promises, `queueMicrotask` | Promises are not awaited; a frame must be synchronous. | Keep `render` synchronous; precompute in `setup`. |
| Mouse, keyboard, touch and scroll events | Scenes are click-through by design. | React to palette and time; a future event provider is not implemented yet. |
| Video and GIF playback | Not part of the scene engine. | Use `davincix` with a video file (rendered by `mpvpaper`). |
| Filesystem, process or environment access | Sandboxed runtime, no standard modules. | Use local assets and the palette; read nothing else. |

### Examples

A frame that would work in a browser but must be adapted:

```js
// Browser style (does not run)
const ctx2d = document.querySelector("canvas").getContext("2d");
function animate() {
  ctx2d.fillStyle = "#000000";
  ctx2d.fillRect(0, 0, width, height);
  ctx2d.globalAlpha = 0.5;
  ctx2d.fillText("hello", 10, 20);
  requestAnimationFrame(animate);
}
animate();

// Scene style (runs)
function render(t, ctx) {
  canvas.clear("#000000");
  canvas.alpha(0.5);
  canvas.text("hello", 10, 20, 16, "#ffffff", { family: "Noto Sans" });
  // No loop to schedule: the engine calls render again.
}
```

A WebGL or shader effect cannot be ported:

```js
// Not possible: requires a GL context and a shader pipeline.
const gl = canvas.getContext("webgl");
```

A local asset instead of a remote image:

```js
// Browser style (blocked)
const img = new Image();
img.src = "https://example.com/texture.png";

// Scene style (allowed)
canvas.image("texture.png", 0, 0, ctx.width, ctx.height);
```

A gradient stroke, which is not directly available:

```js
// Not available: strokes take one color.
canvas.stroke("#5ad4e6", 4);
canvas.begin_path();
canvas.move_to(0, 100);
canvas.line_to(ctx.width, 100);
canvas.stroke_path();

// Workaround: draw the line as colored segments.
const stops = ["#fc618d", "#948ae3", "#5ad4e6"];
for (let i = 0; i < 120; i++) {
  const x0 = (ctx.width * i) / 120;
  const x1 = (ctx.width * (i + 1)) / 120;
  const color = stops[Math.floor((i / 120) * stops.length) % stops.length];
  canvas.stroke(color, 4);
  canvas.begin_path();
  canvas.move_to(x0, 100);
  canvas.line_to(x1, 100);
  canvas.stroke_path();
}
```

## Performance guidelines

- Push only when needed. The engine already skips identical frames; a scene
  that returns early when nothing changed runs at 0% between updates.
- Prefer one frame rate that looks right: 10-15 fps for most animated scenes.
  Higher rates cost linearly and hit the full-frame pipeline ceiling long
  before the display refresh rate.
- Keep per-frame drawing light. Text is cached, but thousands of unique draws
  per frame are still expensive; use module-level state to redraw only what
  changed, step by cell instead of redrawing glyphs, and reuse geometry.
- Prefer `canvas.remap` and image assets over per-pixel work; there is no
  pixel API and CPU rasterization of large areas every frame is slow.
- Remember that a full frame is about 8 MB before compression at 1080p and is
  copied to the daemon every time something changes.

## Debugging

- `log(...)` writes to stderr with a `[scene]` prefix; when running under
  `davincix` the output goes to the kernel log
  (`$XDG_RUNTIME_DIR/quickshell/logs/xwww_debug.log` in the equisdots desktop).
- `xwww scene check scene.js` reports syntax errors.
- `xwww scene render scene.js -o out.png --size 1920x1080` renders one frame
  offline, which is much faster to iterate on than the live wallpaper.
- Common runtime errors:
  - `invalid color: ...`: use `#rgb`, `#rrggbb`, `#rrggbbaa` or an RGB/RGBA
    array.
  - `asset outside the allowed directories`: reference an asset that lives in
    the scene directory or pass `--asset`.
  - `exceeded the frame budget`: the render body is too slow; move work to
    `setup` or reduce it.
  - Empty or stale frames: a thrown error keeps the previous frame; check
    `log` output.
- Remember that a scene directory applied through `davincix` runs from its
  installed location, so edit the copy under the wallpaper directory (or
  re-import after editing).

## Publishing a scene to this collection

1. Add the directory under `scenes/`, for example `scenes/my-scene/` with
   `scene.js` and `base.jpg`.
2. Add a row to the catalog in
   [interactive-scenes.md](interactive-scenes.md) describing the art and the
   palette behaviour.
3. Add an entry to `CHANGELOG.md` under the current dated section.
4. Regenerate thumbnails and test the entry transition locally:

   ```sh
   davincix thumbs
   davincix set ~/.config/hypr/wallpapers/my-scene --transition decrypt
   ```

5. Open a pull request. Documentation and code in this repository are covered
   by the licenses described in the README; only submit artwork you own or that
   is explicitly redistributable.

## References

- [interactive-scenes.md](interactive-scenes.md): directory contract, catalog
  and authoring summary for this collection.
- [xwww scene engine documentation](https://github.com/x-ports/xwww/blob/main/docs/scene.md):
  full engine scope, providers roadmap and internal architecture.
- [davincix interactive scenes](https://github.com/equisdots/davincix/blob/main/docs/interactive-scenes.md):
  kernel integration, state and restore.
- [xwww source](https://github.com/x-ports/xwww): CLI reference and releases.
