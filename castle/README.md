# Hold the Keep

Mobile castle-defense prototype (landscape). Build in a top-down 2D view, then
watch the siege in an isometric 3D view you can orbit.

```
npm install
npm run dev      # serves on your LAN; open the printed URL on your phone
npm test         # pathing + simulation tests (headless, no browser)
npm run build    # dist/ plus dist/hold-the-keep.html (single self-contained file)
```

## What you can build

| | Cost | Notes |
|---|---|---|
| Palisade | 1 | Cheap wooden wall. Archers can't stand on it. |
| Stone wall | 2 | Thin wall; archers walk along connected stone. |
| Thick wall | 5 | Full-block wall, very tough, holds 2 archers, +1 range. |
| Gate | 15 | Your swordsmen walk through; enemies must break it. Archers walk over it. |
| Tower | 60 | Tall and tough, comes with an archer, holds 3, +1.5 range. |
| Archer | 20 | Place on any wall, tower or the keep. Walks the ramparts to reach attackers. Takes half damage from arrows behind battlements. |
| Swordsman | 25 | Guards a spot on open ground; charges enemies within 4 tiles. Enemies stop to fight them. |
| Moat | 3 | Enemies wade through at about a third of their speed. Flat ground only. |
| Pikes | 3 | Blocks the way and hurts anyone attacking it. |
| Spikes | 20 | Floor trap that hurts anyone walking over it. |

**Upgrade** turns a palisade into stone (1) and stone into thick wall (3), keeping
archers in place, and repairs damaged top-tier structures for the cost of the damage.

Enemies: raiders, brutes, rams (heavy siege), bowmen (shoot your archers and
swordsmen, from wave 3) and catapults (boulders from beyond archer range,
from wave 5; after 10 boulders they roll forward into range).

Terrain: hills (+1 archer range, slow to climb), marsh and fords (slow, no
building), rivers and lakes (impassable). Every map is random; "New map" in
the menu rolls another.

## Controls

| | |
|---|---|
| One finger (Look) | Pan |
| One finger (Wall / Spikes / Remove) | Paint tiles |
| One finger (Tower, Archer) | Drag to aim, release to place |
| Two fingers | Pinch zoom, drag to pan, twist to orbit (3D only) |
| Desktop | Mouse paints, right-drag pans, wheel zooms; keys 1-9 and 0 pick tools, V view, R rotate, Space start |

## Music

"Minstrel Guild" (building) and "Heroic Age" (battle) by Kevin MacLeod
(incompetech.com), licensed under Creative Commons: By Attribution 4.0
(https://creativecommons.org/licenses/by/4.0/). Re-encoded to mono 80 kbps in
`public/music/`. Sound effects are synthesized in `src/audio.js`.

## Code map

- `src/config.js`: every balance number (costs, HP, enemy stats, wave sizes)
- `src/world.js`: grid, terrain generation, building/damage
- `src/pathing.js`: flow field to the keep; walls cost extra by HP, so enemies
  go around a gap if one exists and breach the weakest wall if not
- `src/game.js`: simulation (waves, enemies, archers, arrows), no DOM
- `src/camera.js`: one camera that animates between top-down and isometric
- `src/render.js`: canvas renderer (painter's-order boxes, billboards)
- `src/audio.js`: synthesized sound effects and music crossfading
- `src/input.js`, `src/main.js`: touch input, HUD, game loop
