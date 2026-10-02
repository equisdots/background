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

| Scene | Art | Notes |
|---|---|---|
| `astro-palette` | Astronaut line art on a transparent cutout (`astro.png`) | Original static color cards replaced by live swatch cards (`bg`, `color0..color15`, `fg`) with labels and hex codes. |
| `astro-ascii` | ASCII-art astronaut (`ascii.png`, stencil with alpha = ink coverage) | Keeps the original glyph colors and adds a soft foreground tint; includes the same live swatch cards. |
| `ascii-astro` | Refined ASCII render based on `astro-ascii/base2.jpg` | Same system as `astro-ascii`; kept as a separate directory so the previous version remains available and the change stays reversible. |
| `matrix-rain` | Palette-driven glyph rain (`XSCRIPTORDEV` plus geometric glyphs, Hack Nerd Font) | Port of the `ColorRain` effect from `@xscriptor/xbackgrounds`: one glyph per column over a fading trail, stepped per cell so characters stay crisp, with colors from `workspaceActive` and `color1..6`. |

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
