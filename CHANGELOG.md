# Changelog

All notable changes to the wallpaper collection are documented here.
Dates use YYYY-MM-DD.

## [2026-10-02]

### Added

- **Interactive scenes**: directories rendered by the `xwww` scene engine, listed and applied by
  davincix like any other wallpaper.
  - `astro-palette`: astronaut line art on a transparent cutout with live palette swatch cards
    (background, `color0..color15` and foreground, with labels and hex codes).
  - `astro-ascii`: ASCII-art astronaut that keeps its original glyph colors and adds a soft
    foreground tint, with the same live cards.
  - `ascii-astro`: refined ASCII render based on `astro-ascii/base2.jpg`, kept as a separate scene
    so the previous one remains available.
  - `matrix-rain`: palette-driven glyph rain ported from the `ColorRain` effect of
    `@xscriptor/xbackgrounds` (one glyph per column over a fading trail, stepped per cell so the
    characters stay crisp, with colors from `workspaceActive` and `color1..6`).
- `docs/interactive-scenes.md`: scene directory contract, thumbnail rule, palette behaviour,
  catalog and authoring guide.

### Documentation

- README links the interactive scene contract.
- `docs/scene-guide.md`: complete guide to interactive scenes (how they work,
  installation, canvas API, allowed and forbidden features, performance,
  debugging and publishing), linked from the README and the scene contract.
