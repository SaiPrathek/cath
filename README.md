# Cath’s Great Pretzel Rescue

A warm, deadpan Roman-bakery pixel-art mini-adventure for Catherine, published at [saiprathek.com/cath](https://saiprathek.com/cath/).

The no-build game contains a condensed five-panel prologue, three classic side-scrolling acts, five Pretzel People rescues, and a final two-phase showdown with Emperor Prathek.

## Controls

- Move: `A` / `D` or arrow keys
- Jump: `Space`, `W`, `K`, or up arrow
- Fire the Egg Sling: `J`, `X`, or `Enter`
- Pause: `Esc` or `P`
- Mute: `M`
- Mobile: landscape-only multitouch controls mounted in side rails outside the playfield

Progress, the mute preference, and the highest unlocked act are saved locally under `cath-save-v2`.

## Assets

Production character, story, background, and gate atlases remain bespoke. The supplemental gameplay-effects atlas is deterministic and can be regenerated without replacing those assets:

```sh
python3 scripts/build-pixel-assets.py
```

The included GitHub Actions workflow deploys this repository to GitHub Pages.
