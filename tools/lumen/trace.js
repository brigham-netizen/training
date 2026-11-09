// Trace a cut label map into smooth piece outlines with number positions.
const fs = require('fs');
const clampFs = v => Math.max(3.2, Math.min(13, v));
function rdp(pts, eps) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L; if (d > md) { md = d; mi = i; } }
    if (md > eps) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function trace({ W, H, pid: pidArr, pieceColor }) {
  const n = W * H, pid = Int32Array.from(pidArr), np = pieceColor.length;
  const mem = Array.from({ length: np }, () => []);
  for (let i = 0; i < n; i++) if (pid[i] >= 0) mem[pid[i]].push(i);
  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) dist[i] = pid[i] < 0 ? 0 : 1e9;
  for (let i = 0; i < n; i++) { if (pid[i] < 0) continue; const x = i % W, k = pid[i];
    if (i < W || i >= n - W || x === 0 || x === W - 1 || pid[i - W] !== k || pid[i + W] !== k || pid[i - 1] !== k || pid[i + 1] !== k) dist[i] = 1; }
  for (let y = 1; y < H; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (dist[i] <= 1) continue; const k = pid[i];
    for (const [q, w] of [[i - 1, 1], [i - W, 1], [i - W - 1, 1.41], [i - W + 1, 1.41]]) if (pid[q] === k) dist[i] = Math.min(dist[i], dist[q] + w); }
  for (let y = H - 2; y >= 0; y--) for (let x = W - 2; x > 0; x--) { const i = y * W + x; if (dist[i] <= 1) continue; const k = pid[i];
    for (const [q, w] of [[i + 1, 1], [i + W, 1], [i + W + 1, 1.41], [i + W - 1, 1.41]]) if (pid[q] === k) dist[i] = Math.min(dist[i], dist[q] + w); }
  const V = W + 1;
  return mem.map((px, k) => {
    if (!px.length) return null;
    const edges = new Map(), add = (a, b) => { const l = edges.get(a); if (l) l.push(b); else edges.set(a, [b]); };
    let bi = px[0], bd = 0;
    for (const j of px) {
      const x = j % W, y = (j - x) / W;
      if (dist[j] > bd) { bd = dist[j]; bi = j; }
      if (y === 0 || pid[j - W] !== k) add(y * V + x, y * V + x + 1);
      if (x === W - 1 || pid[j + 1] !== k) add(y * V + x + 1, (y + 1) * V + x + 1);
      if (y === H - 1 || pid[j + W] !== k) add((y + 1) * V + x + 1, (y + 1) * V + x);
      if (x === 0 || pid[j - 1] !== k) add((y + 1) * V + x, y * V + x);
    }
    let d = '';
    while (edges.size) {
      const start = edges.keys().next().value, loop = [];
      let cur = start;
      do { loop.push(cur); const l = edges.get(cur), nx = l.pop(); if (!l.length) edges.delete(cur); cur = nx; } while (cur !== start && edges.has(cur));
      if (loop.length < 4) continue;
      let pts = loop.map(v => [v % V, Math.floor(v / V)]);
      pts = pts.filter((p, i) => { const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length]; return !((a[0] === p[0] && p[0] === b[0]) || (a[1] === p[1] && p[1] === b[1])); });
      for (let it = 0; it < 3; it++) { const s = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); } pts = s; }
      pts = rdp(pts, .7);
      if (pts.length < 3) continue;
      d += 'M' + pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('L') + 'Z';
    }
    return d ? [d, pieceColor[k], bi % W, Math.floor(bi / W), +clampFs(bd * 1.05).toFixed(1)] : null;
  }).filter(Boolean);
}
const [, , inp, outp] = process.argv;
const data = JSON.parse(fs.readFileSync(inp, 'utf8'));
const pieces = trace(data);
fs.writeFileSync(outp, JSON.stringify({ palette: data.palette, pieces }));
console.log(outp, pieces.length, 'pieces', fs.statSync(outp).size, 'bytes');
