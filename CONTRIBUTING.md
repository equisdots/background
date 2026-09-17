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
   `background.zip` release. Every published `background.zip` bundles the
   `LICENSE` text and a `CREDITS.md` file, and the release notes credit each
   author, so attribution travels with the images as CC BY 4.0 requires.

For documentation, open a regular PR adding your Markdown file (English).

## Licensing of contributions

- **Wallpaper images and documentation** you contribute are licensed under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (inbound =
  outbound).
- **Source code** contributions are not covered by CC BY 4.0; code may be
  distributed under the [MIT License](LICENSE-MIT) unless stated otherwise.
- You keep the copyright of your work and are always credited.
- You confirm that you own the rights to the material or have explicit
  permission from the author, and that it does not infringe third-party
  rights. This includes any people or characters depicted in the artwork.
- If you include third-party code, its original license still applies and
  must be kept.
- No trademark rights are granted: the *equisdots* and *xscriptor* names and
  logos remain the property of their owner.
- Submissions with unclear provenance are rejected to keep the project safe
  from DMCA takedowns.

## Style

- English for docs, comments and commit messages.
- Conventional commits: `feat:`, `fix:`, `docs:`, `assets:`.
- Keep the repo clean: `*.zip` is gitignored, never commit release archives.
- Be respectful; harassment or hateful content is not tolerated.
