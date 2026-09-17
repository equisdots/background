<h1 align="center">equisdots · background</h1>

<p align="center">
  <img src="https://img.shields.io/github/license/equisdots/background?style=flat-square&color=blue" alt="License">
  <img src="https://img.shields.io/github/last-commit/equisdots/background?style=flat-square&color=blueviolet" alt="Last Commit">
  <img src="https://img.shields.io/github/repo-size/equisdots/background?style=flat-square&color=success" alt="Repo Size">
  <img src="https://img.shields.io/badge/wallpapers-4K-FF69B4?style=flat-square" alt="4K">
</p>

<p align="center">
  <em>
  Official wallpaper collection of the equisdots desktop, curated by
  <a href="https://github.com/xscriptor">xscriptor</a> and distributed as a
  release asset.
  </em>
</p>

---

## Overview

This repository hosts the wallpapers shipped with the equisdots desktop. The
images are **not committed to git**: they are packed into `background.zip` and
published as a release asset, so clones stay small and consumers always fetch
one stable URL:

```
https://github.com/equisdots/background/releases/latest/download/background.zip
```

The installer ([`equisdots/dots`](https://github.com/equisdots/dots)) downloads
and unpacks that archive during setup. The wallpaper fetch/apply logic itself
lives in [`equisdots/davincix`](https://github.com/equisdots/davincix).

## Download

Latest collection:

```sh
curl -fLO https://github.com/equisdots/background/releases/latest/download/background.zip
unzip background.zip -d ~/Pictures/equisdots
```

## Releases

| Release | Contents |
|---|---|
| [v1.0.0](https://github.com/equisdots/background/releases/tag/v1.0.0) | 17 optimized 4K JPEG wallpapers |

New collections are published as new releases; the `latest` URL always points
to the current pack.

## Contributing

Wallpapers and documentation are welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md) for image requirements, licensing and the
submission workflow. Please only submit work you own or that is explicitly
licensed for redistribution.

## Related Repos

| Repo | What it provides |
|---|---|
| [dots](https://github.com/equisdots/dots) | Meta installer and updater: clones and wires the whole stack |
| [hyprland](https://github.com/equisdots/hyprland) | Hyprland compositor config (Lua), scripts, installer |
| [shell](https://github.com/equisdots/shell) | Quickshell UI (bar, panels, editor, popups) |
| [davincix](https://github.com/equisdots/davincix) | Wallpaper fetch/apply kernel |
| [login](https://github.com/equisdots/login) | Minimal SDDM login theme |

## License

- **Images and documentation** are licensed under
  [Creative Commons Attribution 4.0 International](LICENSE) (CC BY 4.0): you
  may share and adapt them, including commercially, as long as you give
  appropriate credit to **xscriptor / Equis Dots** and link to the license.
- **Source code** (scripts and tooling added to this repository) is licensed
  under the [MIT License](LICENSE-MIT).

© 2026 xscriptor and contributors.
