# Interactive scenes

This document covers the directory contract, catalog and authoring summary. The
complete guide (installation, canvas API, allowed and forbidden features,
performance) is [scene-guide.md](scene-guide.md).

Besides still images and videos, the collection can ship **interactive
scenes**: wallpapers rendered by the `xwww` scene engine
([`x-ports/xwww`](https://github.com/x-ports/xwww), `scene` feature). A scene
is a JavaScript file that draws with a small canvas API and reads the active
desktop palette, so every piece restyles itself when the palette changes.

## Directory contract

A scene is a directory inside the wallpaper collection:

```
<scene-name>/
  scene.js     required; the xwww scene script
  base.jpg     required for pure-JS scenes; cover used for the picker thumbnail
  <assets>     optional; stencils or images loaded with canvas.image
```

- `davincix` detects any directory containing `scene.js` and lists it as one
  entry in the wallpaper picker; the thumbnail is rendered from `base.jpg` (or
  `base.jpeg` / `base.png` / `base.webp`). If neither exists the picker shows a
  placeholder, so a cover is strongly recommended.
- Nested media files are also supported by the scanner; a file
  `sub/dir/pic.jpg` becomes the picker entry `sub__dir__pic.jpg`.
- Images and stencils are only loaded from the scene directory (or explicit
  `--asset` paths), never from the network.

## Palette behaviour

Scenes run with `--palette equisdots`, which follows
`~/.config/hypr/settings.json` (`bar.palette`) and the palette files under
`~/.config/hypr/scripts/quickshell/dock/palettes/`. The canvas background is
painted with the palette `background` color and the artwork is tinted with the
palette `foreground` where needed, so light and dark palettes both stay
readable.

## Catalog

The scenes of this collection live under `scenes/` (unlike the picture packs,
they are committed to git and downloaded from the repository, not from a
release asset). Each directory is copied as one entry into the wallpaper
collection. Machine-readable metadata for every scene (slug, name, author,
description, assets, license) lives in
[`scenes/index.json`](../scenes/index.json).

| Scene | Art | Notes |
|---|---|---|
| `astro-palette` | Astronaut line art on a transparent cutout (`astro.png`) | Original static color cards replaced by live swatch cards (`bg`, `color0..color15`, `fg`) with labels and hex codes. |
| `astro-ascii` | ASCII-art astronaut (`ascii.png`, stencil with alpha = ink coverage) | Keeps the original glyph colors and adds a soft foreground tint; includes the same live swatch cards. |
| `ascii-astro` | Refined ASCII render based on `astro-ascii/base2.jpg` | Same system as `astro-ascii`; kept as a separate directory so the previous version remains available and the change stays reversible. |
| `matrix-rain` | Palette-driven glyph rain (`XSCRIPTORDEV` plus geometric glyphs, Hack Nerd Font) | Port of the `ColorRain` effect from `@xscriptor/xbackgrounds`: one glyph per column over a fading trail, stepped per cell so characters stay crisp, with colors from `workspaceActive` and `color1..6`. |
| `kanji-rain` | Matrix-style falling glyphs: Japanese kana/kanji, Chinese characters and `X` (`Noto Sans CJK JP`) | Same cell-stepped trail as `matrix-rain` with a CJK pool; requires the `noto-fonts-cjk` package (characters render as boxes without it). |
| `cartesian-veil` | Faint cartesian plane with symmetric points and a smooth curve | Thirteen sample points mirrored on the y axis share palette colours; a Catmull-Rom curve reveals itself left to right, lights each point as it passes, then holds and fades; the formula sits centred below. |
| `asymptote-veil` | Graph of `f(x) = 1/x` approaching its asymptotes | Dashed asymptotes on both axes, mirrored branches revealed with a geometric ease that slows down near `x = 0`, head labels (`x → 0⁺` / `x → 0⁻`) and the formula plus limits below the centre. |
| `fourier-synth` | Square wave rebuilt from its odd harmonics | Four coloured components, the partial sum sharpening as `N` grows, a `1/n` spectrum and the Gibbs phenomenon read out. |
| `lissajous-orbit` | Parametric Lissajous curves | Ghost ratios hang faintly while a glowing head traces the active `3:2 / 5:4 / 7:5 / 9:7` ratio with a trailing arc and live coordinates. |
| `field-lines` | Rotating vector field `F = (−y, x)` | Lattice quiver, 90 particles on closed orbits with fading tails, value rings, curl/divergence readouts. |
| `riemann-sum` | Left Riemann rectangles under `f(x) = 1.2 + 0.8 sin(x/1.8)` | `n` steps `4 → 48` and the estimate converges to the analytic area with live error. |
| `bezier-mesh` | Three cubic Bézier meshes | Dashed control polygons, live control points, a de Casteljau rider and the Bernstein formula. |
| `phase-portrait` | Damped pendulum in phase space | 35 precomputed trajectories, a vector-field quiver and a rider with `θ/ω/energy` readouts. |
| `monte-carlo` | Estimating `π` by point throwing | 3200 deterministic points over a square and its inscribed circle; `4·N_in/N` converges and resets. |
| `bifurcation` | Logistic map attractor for `r ∈ [2.5, 4]` | Period doubling into chaos revealed column by column with the current `r` marked. |
| `descent-path` | Gradient descent into `f = ½(x²/4 + y²)` | Contour ellipses, downhill arrows, a 60-step path and `loss / η / step` readouts. |
| `interference` | Two coherent point sources | Expanding wavefront rings plus an intensity lattice following `cos(k·Δr − ωt)`, nodal lines drifting with phase. |

## The card block

The scenes draw the swatch block at the same position measured on the original
3840x2160 artwork (`x:1112 y:1104 w:1528 h:604`): a rounded panel in the
palette background with six columns per row, one card per palette entry, the
index in the corner and the palette name and slug in the footer.

## Authoring a scene

1. Create the directory and the script (`scene.js`), then iterate offline:

   ```sh
   xwww scene render scene.js -o preview.png --size 2400x1350 --palette equisdots
   ```

2. Add `base.jpg` (the cover the picker will show).
3. Regenerate thumbnails and test the entry transition:

   ```sh
   davincix thumbs
   davincix set ~/.config/hypr/wallpapers/<scene-name> --transition decrypt
   ```

Palette changes are picked up within about a second; the scene only re-sends a
frame when the canvas actually changes, so idle scenes cost almost no CPU.
