// 44 new chapels: [name, lore]
const NAMES = [
 ["The Chantry of St. Giles", "A small chantry with one stubborn mirror. Look before you turn."],
 ["The Night Stair", "Monks come down these steps for Matins. Light their way, but keep the tomb dark."],
 ["The Almonry", "Bread is given here at dawn. The relics want warm light."],
 ["The Cloister Walk", "Long beams run the length of the walk. Follow each one to its end."],
 ["The Chapter Steps", "Two beams can share a relic. Their colours mingle there."],
 ["The Infirmary Chapel", "The sick lie close to these relics. Give each its proper light."],
 ["The Slype", "A narrow passage between buildings. Every mirror counts."],
 ["The Lantern Room", "Clear glass adds light without colour. Use it to brighten, not to tint."],
 ["St. Cuthbert's Shrine", "Pilgrims kneel at the shrine. Its tomb must stay in shadow."],
 ["The Song School", "Choristers practise here. The light should fall on every bench."],
 ["The Muniment Room", "Charters are kept here. Keep the old chest dark."],
 ["The Galilee Porch", "The porch faces west. Its windows catch the evening sun."],
 ["The Undercroft", "Low vaults and thick columns. Light has to find its way around."],
 ["The Sacristy Stair", "A turning mirror can serve two relics, if you set it right."],
 ["The Bell Ringers' Loft", "High up under the bells. The ropes cast no shadow, but the columns do."],
 ["The Parlour", "Guests wait here. Make it bright, but never harsh."],
 ["St. Agatha's Altar", "Agatha's relic wants a colour no single window holds."],
 ["The Warming Room", "The only fire in winter. The light here should glow amber."],
 ["The Scriptorium", "Scribes need light on every desk, but the ink store stays dark."],
 ["The Abbot's Oratory", "A private chapel. Every window here has a purpose."],
 ["The Treasury Vault", "Gold and silver line the walls. Mind the reflections."],
 ["The Novices' Chapel", "The young brothers learn here. A fair test, but not an easy one."],
 ["The Rood Loft", "Above the screen, the light is crossed by many beams."],
 ["The Chapel of Bones", "The ossuary must stay dark. The altar beside it must not."],
 ["The Pilgrims' Hall", "Many relics, many windows. Count before you open."],
 ["The South Transept", "The midday sun comes from every side here."],
 ["The North Transept", "Cold, dim light. Make the most of every window."],
 ["The Lady Altar", "Violet for the Lady. Green for the season."],
 ["The Crossing", "Where nave and transept meet, beams cross in every direction."],
 ["The Ambulatory", "A walk around the high altar. The light must go round with you."],
 ["The Martyrs' Chapel", "Red for the martyrs. Their tomb stays in shadow."],
 ["The Reliquary Chamber", "The saint's bones rest here among a crowd of mirrors."],
 ["The Shrine of the Kings", "Three kings, three gifts, three colours of light."],
 ["The Choir Stalls", "Carved stalls on both sides. The light must reach them all."],
 ["The Presbytery", "Only priests may enter. Only true light may fall here."],
 ["The Chapel of the Hours", "Each relic keeps a different hour. Each wants a different light."],
 ["St. Michael's Tower", "The archangel guards this tower. Turn his mirrors with care."],
 ["The Great Sacristy", "The richest vestments in the cathedral. And the most mirrors."],
 ["The Bishop's Tomb", "Light every relic around the tomb. Leave the bishop sleeping in the dark."],
 ["The Lantern Tower", "Windows on every wall. Shut more than you open."],
 ["The Hidden Chapel", "Few know this chapel is here. Fewer still have lit it."],
 ["The Sanctuary", "The holiest ground in the cathedral. Every relic waits for its light."],
 ["The High Altar", "The great feast is tomorrow. The high altar must be perfect."],
 ["The Cathedral Entire", "Every chapel is ready but this one. Make it the finest of all."],
];
function specFor(k) {   // k = 0..43, difficulty rises
  const t = k / 43;
  const W = t < .2 ? 5 + (k % 2) : t < .75 ? 6 : 6 + (k % 2);
  const H = t < .2 ? 6 + (k % 2) : t < .5 ? 7 : 8 + (k % 2 && t > .75 ? 1 : 0);
  const windows = Math.min(6, 3 + Math.floor(t * 3.4) + (k % 3 === 2 ? 1 : 0));
  const mirrors = Math.min(4, 2 + Math.floor(t * 3));
  const fixed = Math.min(4, 1 + Math.floor(t * 3) + (k % 2));
  const pillars = 1 + (k % 3) + Math.floor(t * 2);
  const colors = k < 7 && k % 3 !== 1 ? ['R', 'Y', 'B'] : ['R', 'Y', 'B', 'C'];
  const dark = k % 3 !== 0 || t > .7;
  return { name: NAMES[k][0], lore: NAMES[k][1], W, H, windows, mirrors, fixed, pillars, colors, dark, seed: 200 + k * 17 };
}
module.exports = { NAMES, specFor };
