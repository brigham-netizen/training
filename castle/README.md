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
| Gate | 15 | Your swordsmen walk through; archers walk over it. Weaker than stone, so attackers (rams most of all) go for gates first. |
| Hoarding | 3 | Wooden shields on a stone wall, gate or tower. Archers there take 20% of arrow damage (50% without) and half boulder splash. |
| Tower | 60 | Tall and tough, comes with an archer, holds 3, +1.5 range. |
| Archer | 20 | Place on any wall, tower or the keep. Walks the ramparts to reach attackers. Takes half damage from arrows behind battlements. |
| Swordsman | 25 | Guards a spot on open ground; charges enemies within 4 tiles. Enemies stop to fight them. |
| Moat | 3 | Enemies wade through at about a third of their speed. Flat ground only. |
| Pikes | 3 | Blocks the way and hurts anyone attacking it. |
| Spikes | 20 | Floor trap that hurts anyone walking over it. |

**Orders**: tap a swordsman (or drag a box around several) to select, then
drag over the area they should cover, or tap a spot to hold. They charge
anything that enters their zone and return to it afterwards.

**Village**: between waves the village stakes out plots for a cottage
(30 gold, +10 per wave), farm (15, +6) or, after three cottages, a market
(60, +25). You don't pick the spot: it chooses the safest-feeling ground
judged only from your walls, towers and keep (never from where attacks come).
Build plots with the Village tool, or remove ones you don't want. Enemies
trample farms they walk over.

**Saves**: the game saves before every wave (so a lost wave can be retried)
and from the menu. "Save this map" keeps a landscape you like under My maps.
On claude.ai saves go to your private storage on the page and follow you
across devices; elsewhere they stay in the browser.

**Upgrade** turns a palisade into stone (1) and stone into thick wall (3), keeping
archers in place, and repairs damaged top-tier structures for the cost of the damage.

Enemies: raiders, brutes, ladder crews, rams (heavy siege), bowmen (shoot your
archers and swordsmen, from wave 3) and catapults (boulders from beyond archer
range, from wave 5; after 10 boulders the crew abandons the catapult and it
falls apart where it stands).

Archers shoot anyone on a wall or already inside your walls first, then
anyone breaking in (and siege engines), then the rest. When there's a breach
out of their reach, archers hurry along the walls to where they can shoot it.

Soldiers on foot can't damage stone (walls, thick walls, towers). They break
gates, palisades, pikes and village buildings, or get over stone with ladders:
two raiders carry each ladder, set it against a wall or thick wall, then climb
and fight the archers on top. Archers on or beside that wall push the ladder
off, throwing down anyone on it. Soldiers stuck at a wall pick up fallen
ladders, or after a while lash a new one together. Only rams and catapults
break stone.

Archers hit 90% of shots at the foot of the wall, falling to 45% at the edge
of their range. Each wave arrives at once: an army masses at each banner
(siege engines at the back) and marches together until it's close to your
castle, then charges. Raiders break off to sack cottages, farms and markets
they can reach without breaking anything.

Spike pits wear down as enemies cross them (repair with Upgrade) and a ram
rolling over one smashes it. Rams can't cross a moat: they wait at the edge
while foot soldiers wading in fill a tile, then roll over. A moat may never
seal the keep off from the map edge.

Boiling oil (25) and rock buckets (10) go on stone walls, gates and towers and
each let go once per wave: oil scalds everyone at the foot of the wall when a
crowd or a ram arrives; rocks crush ladder climbers (knocking the ladder down)
or attackers right below. Both refill between waves.

Renown is the score: 10 per wave held, plus every wave 3 per cottage, 2 per
farm and 8 per market still standing, and up to 20 more for a healthy lord at
victory. The best score is kept on the device.

The map is 40×26 and can have a sea coast in one corner (behind a beach),
mountain ranges (impassable, can't be built through), and dense forests.
Walls, towers and the keep are taller and units are drawn at 70% size.

The goal is your lord. Attackers who reach the keep batter its door (south
face), then climb the keep's narrow stair, two at a time, to fight him and his guard
(the Lord bar). Catapults
no longer bombard the keep. The door and the lord recover between waves.

Walls, gates, towers and pikes can be built over marsh (×2 cost), fords (×3),
water (×4), trees (×2, cleared) and rocks (×3). A rock stays as a natural
base the wall rises out of (same top height; only hills lift walls): +25% HP,
and it's still there if the wall falls.

Paint a stronger wall over a weaker one (stone over palisade, thick over
either) to upgrade it in place for the difference in price.
A gate can be dropped into any wall the same way.
Gates are barred while an enemy is within about 3 tiles of them (a beam
shows across the door), so swordsmen guarding nearby hold inside instead of
charging out. They open again a moment after the attackers are gone.

Stairs (4) go against a wall, gate, tower or the keep. Swordsmen use them to
climb onto the ramparts, walk along connected walls, and fight raiders coming
over on ladders. Tap a wall or the keep with the Swordsman tool to post one up
there directly. The keep has stairs inside its door: swordsmen posted on the
keep fight beside the lord's guard and take the blows meant for him.

The speech-bubble button (top right, also in the menu) sends a bug report or
idea: it opens the phone's share sheet with the note, a screenshot, and the
build, map number, wave and device, or posts it as a GitHub issue.

Terrain: hills (+1 archer range, slow to climb), marsh and fords (slow, no
building), rivers and lakes (impassable). Hills slope smoothly into the
ground around them, and walls built across a slope follow it. Every map is random; "New map" in
the menu rolls another.

## Playing on a phone

The `gh-pages` branch holds the built game (`npm run build`, then the contents
of `dist/`), served by GitHub Pages at
https://brigham-netizen.github.io/training/. Open it in Safari or Chrome and
use Share → Add to Home Screen (iPhone) or ⋮ → Add to Home screen / Install
(Android): it opens full screen in landscape and works offline. Saves are kept
on each device.

## Controls

| | |
|---|---|
| One finger (Look) | Pan |
| One finger (Wall / Spikes / Remove) | Paint tiles |
| One finger (Tower, Archer) | Drag to aim, release to place |
| Two fingers | Pinch zoom, drag to pan, twist to orbit (3D only) |
| Desktop | Mouse paints, right-drag pans, wheel zooms; keys 1-9 and 0 pick tools, V view, R rotate, Space start |

## Music

"Castle Chamber" (building, default) by brigham773, made with Suno.
"Minstrel Guild" (building, switchable in the menu) and "Heroic Age" (battle) by Kevin MacLeod
(incompetech.com), licensed under Creative Commons: By Attribution 4.0
(https://creativecommons.org/licenses/by/4.0/). Re-encoded to mono 80 kbps in
`public/music/`. Sound effects are synthesized in `src/audio.js`.

## Ground textures

Photographic CC0 textures, shrunk to 256 px tiles in `src/tex/`:
grass, grassLight and meadow from ambientCG (Grass001, Grass004, Ground037);
hill, marsh, earth and bed from Poly Haven (rocky_terrain_02,
brown_mud_leaves_01, forest_ground_04, grass_path_2). `src/terrain.js` paints
them across the map with organic, noise-roughened edges, plus baked sunlight
on hillsides for the classic view; the 3D view drapes the same painting over
its terrain mesh.

## Trees and rocks

`src/flora.js` builds them from photographs: leaves from ambientCG leaf sets
(LeafSet004, 014, 024, 007; packed into `src/tex/leaves.webp`) are scattered
by the hundred into shaded canopy clumps at load time; firs get needle tiers
(and a needle star seen from above); rocks use Poly Haven's rock_boulder_dry,
lichen_rock and mossy_rock, trunks bark_brown_02 and pine_bark. Each tile
gets its own seeded layout: species (more firs on hills), size, lean and
clump arrangement for trees; a main boulder plus a few stones for rocks.
The classic view draws clump and faceted-boulder sprites; the 3D view uses
camera-facing leaf sprites (with hidden blobs to cast canopy shadows),
bark-textured trunks and noise-displaced 3D boulders.

## Code map

- `src/config.js`: every balance number (costs, HP, enemy stats, wave sizes)
- `src/world.js`: grid, terrain generation, building/damage
- `src/pathing.js`: flow fields to the keep door for foot soldiers, ladder
  crews and siege engines; breakable things cost extra by HP, so enemies go
  around a gap if one exists and breach the weakest point if not
- `src/game.js`: simulation (waves, enemies, archers, arrows), no DOM
- `src/camera.js`: one camera that animates between top-down and isometric
- `src/render.js`: classic canvas renderer (painter's-order boxes, baked
  textured ground with soft shadows); also draws the UI overlay in 3D mode
- `src/render3d.js`: 3D preview renderer (three.js): lit, shadowed low-poly
  models; its orthographic camera matches `camera.js`, so input is shared.
  Toggle with Graphics in the menu.
- `src/audio.js`: synthesized sound effects and music crossfading
- `src/saves.js`: progress and map saves (artifact db, or localStorage)
- `src/input.js`, `src/main.js`: touch input, HUD, game loop
