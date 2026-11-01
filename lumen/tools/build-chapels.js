const fs=require('fs');
const src=fs.readFileSync(__dirname + '/../index.html','utf8');
const eng=src.split('// ENGINE START')[1].split('// ENGINE END')[0].replace(/^[^\n]*\n/,'');
const me=src.slice(src.indexOf('// MIRROR ENGINE START'), src.indexOf('// MIRROR ENGINE END'));
eval(eng+me+';global.M={genMirrorLevel,mTrace,mCfg,MIRROR_LEVELS};');
const {specFor}=require('./chapels.js');
const specs=[...M.MIRROR_LEVELS, ...Array.from({length:44},(_,k)=>specFor(k))];
const out=[];
specs.forEach((s0,id)=>{ let s=s0, L=null, tries=0, t0=Date.now();
  while(!L && tries<20){ try{ L=M.genMirrorLevel(s,id);}catch(e){ s={...s, seed:s.seed+1000}; tries++; } }
  if(!L){ console.log('FAIL',id,s.name); process.exit(1); }
  const nB=L.windows.length+L.mirrors.filter(m=>!m.fixed).length; let sols=0;
  for(let b=0;b<1<<nB;b++){const r=M.mTrace(L,M.mCfg(L,b)).codes; if(L.targets.every(t=>r[t.i]===t.code)) sols++;}
  if(sols!==1){ console.log('NOT UNIQUE',id); process.exit(1); }
  out.push({ name:s.name, lore:s.lore, W:L.W, H:L.H, windows:L.windows.map(w=>[w.side,w.i,w.c]), pillars:L.pillars,
    mirrors:L.mirrors.map(m=>[m.x,m.y,m.fixed?1:0,m.o]), targets:L.targets.map(t=>[t.i,t.code]), sol:L.sol, start:L.start });
  console.log(String(id+1).padStart(2), s.name.padEnd(28), `${L.W}x${L.H} w${L.windows.length} turn${L.mirrors.filter(m=>!m.fixed).length} fix${L.mirrors.filter(m=>m.fixed).length} p${L.pillars.length}`, 'targets', L.targets.map(t=>t.code).join(''), (Date.now()-t0)+'ms');
});
fs.writeFileSync('chapels.json', JSON.stringify(out));
console.log('bytes', fs.statSync('chapels.json').size);
