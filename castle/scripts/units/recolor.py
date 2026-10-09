"""Recolour the Quaternius RPG character textures into team colours.

Defenders get blue cloth (gold trim and steel stay as they are); attackers
get drab greys and browns. Skin, hair-dark browns and bare metal are left
alone. Writes small JPEGs into src/units/.

    python3 scripts/units/recolor.py <path to "RPG Characters - Nov 2020/Textures">
"""
import colorsys
import os
import sys

from PIL import Image

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'units')
os.makedirs(OUT, exist_ok=True)
SIZE = 256


def classify(h, s, v):
    deg = h * 360
    if s < 0.16 or v < 0.08:
        return 'metal'  # steel, white linen, near-black
    if 12 <= deg <= 38 and 0.22 <= s <= 0.62 and v >= 0.62:
        return 'skin'
    if 40 <= deg <= 66 and s >= 0.45 and v >= 0.45:
        return 'trim'  # gold and brass
    if 10 <= deg <= 45:
        return 'leather'  # browns: leather, hair, wood
    return 'cloth'  # reds, greens, teals, purples


def recolour(name, team, leather_to_cloth=0.0):
    im = Image.open(os.path.join(SRC, f'{name}.png')).convert('RGB').resize((SIZE, SIZE), Image.LANCZOS)
    px = im.load()
    for y in range(SIZE):
        for x in range(SIZE):
            r, g, b = (c / 255 for c in px[x, y])
            h, s, v = colorsys.rgb_to_hsv(r, g, b)
            kind = classify(h, s, v)
            # Some outfits are mostly brown cloth: let mid browns count as
            # cloth too (dark browns stay as leather and hair).
            if kind == 'leather' and leather_to_cloth and leather_to_cloth > 0 and 0.28 <= v <= 0.62 and s >= 0.3:
                kind = 'cloth_from_leather'
            if team == 'blue':
                if kind == 'cloth':
                    h, s, v = 0.6, min(0.8, max(0.55, s)), min(0.95, max(0.5, v * 1.35))
                elif kind == 'cloth_from_leather':
                    h, s, v = 0.61, min(0.65, s * leather_to_cloth + 0.25), min(0.9, max(0.42, v * 1.3))
            else:
                if kind in ('cloth', 'cloth_from_leather'):
                    h, s, v = 0.08, s * 0.3, min(0.85, v * 1.1)
                elif kind == 'trim':
                    h, s, v = 0.09, s * 0.45, v * 0.75
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            px[x, y] = (int(r * 255), int(g * 255), int(b * 255))
    return im


JOBS = [
    ('Warrior_Texture', 'blue', 0.9, 'warrior_blue'),
    ('Warrior_Texture', 'drab', 0.0, 'warrior_drab'),
    ('Ranger_Texture', 'blue', 0.0, 'ranger_blue'),
    ('Ranger_Texture', 'drab', 0.0, 'ranger_drab'),
    ('Rogue_Texture', 'drab', 0.0, 'rogue_drab'),
    ('Cleric_Texture', 'blue', 0.0, 'cleric_blue'),
]
for src, team, ltc, out in JOBS:
    recolour(src, team, ltc).save(os.path.join(OUT, f'{out}.jpg'), quality=86)
for src, out in [('Warrior_Sword_Texture', 'sword'), ('Ranger_Bow_Texture', 'bow'), ('Rogue_Dagger_Texture', 'dagger'), ('Cleric_Staff_Texture', 'staff')]:
    Image.open(os.path.join(SRC, f'{src}.png')).convert('RGB').resize((128, 128), Image.LANCZOS).save(os.path.join(OUT, f'{out}.jpg'), quality=86)
print('ok')
