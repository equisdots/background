# Contributing

Thanks for your interest in the equisdots desktop. This repository hosts the
wallpaper collection and the documentation around it.

## Ways to contribute

- **Wallpapers** — new images for the official collection.
- **Documentation** — guides, credits or metadata that help others use and
  extend the collection.
- **Bug reports** — broken images, corrupt archives, wrong credits.

## Wallpaper requirements

- **Rights**: submit only images you created or that are explicitly licensed
  for redistribution. Fan art, scraped wallpapers from other artists and
  images with unclear provenance are rejected; this keeps the project safe
  from DMCA takedowns.
- **Format**: JPEG, optimized for size. PNG/WebP are accepted for artwork
  that needs lossless quality.
- **Resolution**: 4K (3840×2160) preferred, 2560×1440 minimum. Horizontal
  16:9 or wider.
- **Size**: keep each file below ~5 MB after optimization.
- **No watermarks or signatures** unless they are part of the artwork.
- **Themes**: anything that fits the equisdots aesthetic — dark, minimal,
  abstract, landscapes, or anime with proper authorization.

## Submission workflow

Wallpapers are distributed as release assets, not tracked in git, so:

1. Open a PR or issue titled `wallpaper: <short name>` and attach the image
   (or link to a lossless copy).
2. Include: author, source (if adapted), license of the image and a short
   description.
3. Maintainers review and optimize the image, then include it in the next
   `background.zip` release. Release notes credit every author.

For documentation, open a regular PR adding your Markdown file (English).

## Licensing of contributions

By submitting a contribution you agree that:

- Images and documentation are licensed under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Source code (scripts, tooling) is licensed under the
  [MIT License](LICENSE-MIT).

You keep the copyright of your work and are always credited.

## Style

- English for docs, comments and commit messages.
- Conventional commits: `feat:`, `fix:`, `docs:`, `assets:`.
- Keep the repo clean: `*.zip` is gitignored, never commit release archives.
- Be respectful; harassment or hateful content is not tolerated.
