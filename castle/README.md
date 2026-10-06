# Hold the Keep

Mobile castle-defense prototype (landscape). Build in a top-down 2D view, then
watch the siege in an isometric 3D view you can orbit.

```
npm install
npm run dev      # serves on your LAN; open the printed URL on your phone
npm test         # pathing + simulation tests (headless, no browser)
npm run build    # dist/ plus dist/hold-the-keep.html (single self-contained file)
```

## Controls

| | |
|---|---|
| One finger (Look) | Pan |
| One finger (Wall / Spikes / Remove) | Paint tiles |
| One finger (Tower) | Drag to aim, release to place |
| Two fingers | Pinch zoom, drag to pan, twist to orbit (3D only) |
| Desktop | Mouse paints, right-drag pans, wheel zooms; keys 1-5 tools, V view, R rotate, Space start |

## Code map

- `src/config.js`: every balance number (costs, HP, enemy stats, wave sizes)
- `src/world.js`: grid, map generation, building/damage
- `src/pathing.js`: flow field to the keep; walls cost extra by HP, so enemies
  go around a gap if one exists and breach the weakest wall if not
- `src/game.js`: simulation (waves, enemies, towers, arrows), no DOM
- `src/camera.js`: one camera that animates between top-down and isometric
- `src/render.js`: canvas renderer (painter's-order boxes, billboards)
- `src/input.js`, `src/main.js`: touch input, HUD, game loop
