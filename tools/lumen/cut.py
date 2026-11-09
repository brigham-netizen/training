# Cut a painting into stained glass: palette from the painting's own colours,
# pieces that follow its edges, flat areas merged into larger panes.
import sys, json, numpy as np
from PIL import Image
from skimage import color, segmentation, restoration, filters
W, H = 400, 560
AX, AW, AT, AB = 20, 360, 20, 548
R = AW / 2
NAMES = {  # glass names by colour
 'Midnight': (20, 26, 60), 'Ultramarine': (40, 80, 165), 'Cobalt': (30, 60, 140), 'Sky': (110, 150, 200), 'Pale blue': (175, 200, 220),
 'Teal': (60, 110, 120), 'Sea green': (80, 130, 110), 'Emerald': (30, 110, 70), 'Moss': (100, 120, 50), 'Olive': (120, 110, 60),
 'Leaf': (70, 95, 40), 'Forest': (30, 50, 35), 'Gold': (220, 170, 50), 'Straw': (230, 205, 120), 'Lemon': (240, 215, 70),
 'Ochre': (175, 125, 50), 'Amber': (215, 120, 40), 'Rust': (160, 70, 35), 'Ruby': (165, 25, 40), 'Rose': (200, 110, 120),
 'Blush': (230, 175, 160), 'Peach': (235, 185, 150), 'Ivory': (240, 230, 205), 'Pearl': (215, 215, 210), 'Silver': (170, 170, 170),
 'Slate': (100, 110, 130), 'Pewter': (80, 80, 85), 'Umber': (95, 65, 40), 'Walnut': (60, 40, 25), 'Jet': (18, 15, 14),
 'Violet': (95, 60, 140), 'Lilac': (160, 140, 175), 'Plum': (90, 40, 70), 'Sienna': (150, 90, 55), 'Sand': (200, 170, 125),
 'Flesh': (225, 175, 135), 'Bronze': (140, 100, 50), 'Coral': (230, 110, 80), 'Ink': (35, 40, 55), 'Cream': (245, 225, 170),
}
def kmeans(X, k, iters=25, seed=1):
    rng = np.random.default_rng(seed)
    C = X[rng.choice(len(X), 1)]
    for _ in range(k - 1):  # k-means++ seeding
        d = ((X[:, None, :] - C[None]) ** 2).sum(-1).min(1)
        C = np.vstack([C, X[rng.choice(len(X), p=d / d.sum())]])
    for _ in range(iters):
        lab = ((X[:, None, :] - C[None]) ** 2).sum(-1).argmin(1)
        C = np.array([X[lab == j].mean(0) if (lab == j).any() else C[j] for j in range(k)])
    return C
def arch_mask():
    yy, xx = np.mgrid[0:H, 0:W]
    inside = (xx >= AX) & (xx < AX + AW) & (yy < AB) & ((yy >= AT + R) | ((xx - (AX + R)) ** 2 + (yy - (AT + R)) ** 2 <= R * R))
    return inside, xx, yy
def main(src, out, cx=.5, cy=.5, k=16, zoom=1.0, squash=1.0, lift=.85, sat=1.35, spacing=24, min_region=40, min_piece=55, merge=11):
    im = Image.open(src).convert('RGB')
    iw, ih = im.size
    # Crop to the window's shape around the chosen focus.
    tr = AW / (AB - AT)
    tr = tr / squash  # squash < 1 takes a wider crop and narrows it into the window
    cw, ch = (ih * tr, ih) if iw / ih > tr else (iw, iw / tr)
    cw, ch = cw / zoom, ch / zoom
    x0 = min(max(cx * iw - cw / 2, 0), iw - cw); y0 = min(max(cy * ih - ch / 2, 0), ih - ch)
    im = im.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((AW, AB - AT), Image.LANCZOS)
    canvas = np.zeros((H, W, 3), float); canvas[AT:AB, AX:AX + AW] = np.asarray(im) / 255.
    inside, xx, yy = arch_mask()
    sm = restoration.denoise_bilateral(canvas, sigma_color=.08, sigma_spatial=4, channel_axis=-1)
    lab = color.rgb2lab(sm)
    # Glass glows: lift the darks and deepen the colour.
    lab[..., 0] = 100 * (np.clip(lab[..., 0], 0, 100) / 100) ** lift
    lab[..., 1:] *= sat
    pts = lab[inside]
    rng = np.random.default_rng(3)
    C = kmeans(pts[rng.choice(len(pts), min(25000, len(pts)), replace=False)], k)
    # Merge glass colours too close to tell apart.
    while True:
        D = ((C[:, None] - C[None]) ** 2).sum(-1) ** .5 + np.eye(len(C)) * 1e9
        i, j = np.unravel_index(D.argmin(), D.shape)
        if D[i, j] > merge or len(C) <= 8: break
        C = np.delete(np.vstack([C, (C[i] + C[j]) / 2]), [i, j], axis=0)
    q = np.full((H, W), -1, int)
    q[inside] = ((pts[:, None, :] - C[None]) ** 2).sum(-1).argmin(1)
    # Majority filter to clean speckle.
    for _ in range(2):
        q2 = q.copy()
        for y in range(1, H - 1):
            blk = np.stack([q[y + dy, 1 + dx:W - 1 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1)])
            for x in range(1, W - 1):
                if q[y, x] < 0: continue
                v = blk[:, x - 1]; v = v[v >= 0]
                vals, cnt = np.unique(v, return_counts=True)
                if cnt.max() >= 5: q2[y, x] = vals[cnt.argmax()]
        q = q2
    from scipy import ndimage
    st4 = [[0, 1, 0], [1, 1, 1], [0, 1, 0]]
    dist = ndimage.distance_transform_edt(inside)
    band = inside & (dist <= 11); inner = inside & (dist > 11)
    q[~inner] = -1
    # Absorb colour specks into the surrounding colour so outlines stay clean.
    for _ in range(3):
        for c in range(len(C)):
            comp, m = ndimage.label(q == c, structure=st4)
            if not m: continue
            sizes = ndimage.sum(np.ones_like(q), comp, range(1, m + 1))
            for lab_i in np.where(sizes < min_region)[0] + 1:
                region = comp == lab_i
                ring = ndimage.binary_dilation(region, structure=st4) & ~region & (q >= 0)
                if ring.any(): q[region] = np.bincount(q[ring]).argmax()
    # Glazier's cuts: a jittered lattice splits each colour area into pieces.
    rng2 = np.random.default_rng(11)
    gx, gy = int(np.ceil(W / spacing)), int(np.ceil(H / spacing))
    sx = (np.arange(gx)[None, :] + .15 + rng2.random((gy, gx)) * .7) * spacing
    sy = (np.arange(gy)[:, None] + .15 + rng2.random((gy, gx)) * .7) * spacing
    best = np.full((H, W), np.inf); site = np.zeros((H, W), int)
    ci, cj = (xx // spacing).astype(int), (yy // spacing).astype(int)
    for dj in (-1, 0, 1):
        for di in (-1, 0, 1):
            a2, b2 = np.clip(ci + di, 0, gx - 1), np.clip(cj + dj, 0, gy - 1)
            d = (sx[b2, a2] - xx) ** 2 + (sy[b2, a2] - yy) ** 2
            upd = d < best; best[upd] = d[upd]; site[upd] = (b2 * gx + a2)[upd]
    combo = np.where(q >= 0, site * 64 + q, -1)
    pid = np.full((H, W), -1, int); nid = 0
    for val in np.unique(combo[combo >= 0]):
        comp, m = ndimage.label(combo == val, structure=st4)
        if m: pid[comp > 0] = comp[comp > 0] - 1 + nid; nid += m
    flat = pid.ravel(); idx = np.where(flat >= 0)[0]
    pcol = np.zeros(nid, int); pcol[flat[idx]] = q.ravel()[idx]
    area = np.bincount(flat[idx], minlength=nid).astype(float)
    def adjacency(pid):
        A = {}
        for a3, b3 in ((pid[:, :-1], pid[:, 1:]), (pid[:-1, :], pid[1:, :])):
            m = (a3 >= 0) & (b3 >= 0) & (a3 != b3)
            u = np.minimum(a3[m], b3[m]); v = np.maximum(a3[m], b3[m])
            keys, cnt = np.unique(u * 1000003 + v, return_counts=True)
            for kk, cc in zip(keys, cnt): A[(kk // 1000003, kk % 1000003)] = cc
        return A
    parent = list(range(nid))
    def find(x):
        while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
        return x
    A = adjacency(pid)
    # Slivers too small to cut join the neighbour they share most edge with,
    # preferring one of the same colour.
    for _ in range(3):
        nb = {}
        for (u, v), w in A.items():
            ru, rv = find(u), find(v)
            if ru == rv: continue
            nb.setdefault(ru, []).append((w, rv)); nb.setdefault(rv, []).append((w, ru))
        for r in sorted(nb, key=lambda r: area[r]):
            if find(r) != r or area[r] >= min_piece: continue
            cands = [(w + (10000 if pcol[find(o)] == pcol[r] else 0), find(o)) for w, o in nb[r] if find(o) != r]
            if not cands: continue
            w, o = max(cands)
            parent[r] = o; area[o] += area[r]
    roots = np.array([find(i) for i in range(nid)])
    pid = np.where(pid >= 0, roots[np.maximum(pid, 0)], -1)
    # Jewelled frame around the arch
    fb = np.full((H, W), -1, int)
    ang = np.where(yy < AT + R, (np.arctan2(yy - (AT + R), xx - (AX + R)) + np.pi) * R, 0)
    pos = np.where(yy < AT + R, ang, np.where(xx < W / 2, (AT + R - yy), 1000 + (yy - AT - R)))
    pos = np.where(yy >= AB - 12, 3000 + xx, pos)
    bucket = (pos // 15).astype(int)
    darkest = int(np.argmin(C[:, 0])); goldish = int(np.argmax(C[:, 1] * 0 + C[:, 2] + C[:, 0] * .3))
    framecol = [darkest, goldish]
    # Final renumbering
    uniq = np.unique(pid[pid >= 0])
    remap = {u: i for i, u in enumerate(uniq)}
    final = np.full((H, W), -1, int)
    m = pid >= 0
    final[m] = np.vectorize(remap.get)(pid[m])
    colors = [int(pcol[u]) for u in uniq]
    nb0 = len(uniq)
    bm = band
    bks = np.unique(bucket[bm])
    for i, bk in enumerate(bks):
        final[bm & (bucket == bk)] = nb0 + i
        colors.append(framecol[i % 2])
    rgb = (color.lab2rgb(C[None])[0] * 255).clip(0, 255).astype(int)
    used = sorted(set(colors))
    names, taken = {}, set()
    for j in used:
        r, g, b = rgb[j]
        order = sorted(NAMES, key=lambda nm: sum((a - c) ** 2 for a, c in zip(NAMES[nm], (r, g, b))))
        nm = next((x for x in order if x not in taken), order[0]); taken.add(nm); names[j] = nm
    json.dump({'W': W, 'H': H, 'pid': final.ravel().tolist(), 'pieceColor': colors,
               'palette': {str(j): ['#%02x%02x%02x' % tuple(rgb[j]), names[j]] for j in used}}, open(out, 'w'))
    print(out, 'pieces', len(colors), 'colours', len(used))
if __name__ == '__main__':
    a = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    main(sys.argv[1], sys.argv[2], **a)
