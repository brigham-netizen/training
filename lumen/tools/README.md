# Cutting a painting into glass

The Glazier's Workshop masterpieces are cut offline from images of
public-domain paintings, then embedded in `index.html` as `MASTERPIECES`.

Requirements: Python 3 with numpy, Pillow, scipy and scikit-image; Node.js.

1. Download an image (Wikimedia Commons `Special:FilePath/<file>?width=960`).
2. Cut it into pieces (crop focus, colour count and contrast are per painting):

       python3 cut.py painting.jpg painting.json '{"cx":0.45,"cy":0.42,"zoom":1.2}'

   Options: `cx`/`cy` crop focus (0-1), `zoom`, `squash` (below 1 fits a wider
   crop into the window), `k` and `merge` (palette size and how close two
   colours may be before they merge), `sat` and `lift` (colour and brightness),
   `spacing` (cut lattice), `min_region`, `min_piece`.
3. Trace outlines and number positions:

       node trace.js painting.json painting.glass.json

4. Add `{ name, artist, palette, pieces }` from the result to `MASTERPIECES`.

Settings used: Starry Night `{"cx":0.45,"squash":0.68,"k":22,"merge":8,"sat":1.5}`,
Great Wave `{"cx":0.42,"squash":0.62}`, Sunflowers `{"k":22,"merge":7,"sat":1.6}`,
Girl with a Pearl Earring `{"cx":0.45,"cy":0.42,"zoom":1.2}`,
Birth of Venus `{"squash":0.78}`.
