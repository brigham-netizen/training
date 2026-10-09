// Convert the characters: node scripts/units/build.cjs (with `npx vite --port 5199`
// running and the source FBX files copied into ./cmp/).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')
const fs = require('fs')
const path = require('path')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  page.on('pageerror', (e) => console.log('ERR', e.message))
  await page.goto('http://localhost:5199/scripts/units/convert.html')
  await page.waitForFunction(() => window.ready)
  for (const name of ['Warrior', 'Ranger', 'Rogue', 'Cleric']) {
    const r = await page.evaluate((n) => window.convert(n), name)
    const out = path.join(__dirname, '..', '..', 'src', 'units', `${name.toLowerCase()}.glb`)
    fs.writeFileSync(out, Buffer.from(r.b64, 'base64'))
    console.log(name, `${(fs.statSync(out).size / 1024).toFixed(0)} KB`, 'height', r.height.toFixed(1), 'foot', r.footY.toFixed(1), 'uv', r.uvRange.map((v) => v.toFixed(2)), 'verts', r.verts, 'geom KB', (r.geomBytes / 1024) | 0, 'anim KB', (r.animBytes / 1024) | 0)
  }
  await browser.close()
})()
