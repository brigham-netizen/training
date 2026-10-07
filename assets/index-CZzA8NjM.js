(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=e(i);fetch(i.href,s)}})();const Ih=32,Dh=20,Pr=32,Uh=250,ci=10,Nh=1/16,St={palisade:{label:"Palisade",cost:1,hp:120,height:.9,solid:!0,thin:.3,upgrade:"wall"},wall:{label:"Wall",cost:2,hp:300,height:1,solid:!0,thin:.6,rampart:!0,slots:1,perch:.5,upgrade:"thick"},thick:{label:"Thick wall",cost:5,hp:750,height:1.35,solid:!0,rampart:!0,slots:2,perch:1},gate:{label:"Gate",cost:15,hp:400,height:1.25,solid:!0,rampart:!0,slots:1,perch:.5,gate:!0},tower:{label:"Tower",cost:60,hp:550,height:2.2,solid:!0,rampart:!0,slots:3,perch:1.5,freeArchers:1},moat:{label:"Moat",cost:3,slow:.35,flatOnly:!0},stair:{label:"Stairs",cost:4,stair:!0},pikes:{label:"Pikes",cost:3,hp:110,height:.6,solid:!0,thorns:18},trap:{label:"Spikes",cost:20,dps:22},cottage:{label:"Cottage",cost:30,hp:160,height:.9,solid:!0,village:!0,income:10},farm:{label:"Farm",cost:15,hp:40,village:!0,income:6,trample:90},market:{label:"Market",cost:60,hp:260,height:1,solid:!0,village:!0,income:25}},To={hill:1,marsh:2,shallows:3,water:4,tree:2,rock:3},kh={hp:1.25},en={cost:3,cover:.2,splash:.5,on:["wall","thick","gate","tower"]},Lr={maxPlots:3,marketAfter:3},Fh=.5,Oh=.12,tn={cost:20,hp:50,range:4,fireRate:.9,damage:10,speed:2.4},Ki={near:1.5,close:.9,far:.45},Bh=8,ll={pace:.95,charge:6},$e={cost:25,hp:130,dps:20,speed:1.9,guard:4,r:.22},zh=.75,se={size:3,hp:1e3,height:2.6,slots:2,perch:1.5,archers:2,doorHp:260,guard:30,climb:2.5,stair:2},nn={raise:1.2,hp:80,push:16,climb:.35,cost:9,regroup:14,reach:["wall","thick"]},bc=["wall","thick","tower"],Ci={grass:{slow:1},hill:{slow:.7,elev:.55,perch:1},marsh:{slow:.55,noBuild:!0},shallows:{slow:.45,noBuild:!0},water:{blocked:!0}},di={raider:{hp:40,speed:1.6,dps:8,siege:1,gold:3,r:.22},ladder:{hp:80,speed:1.25,dps:0,siege:0,gold:6,r:.34,crew:2},brute:{hp:140,speed:.95,dps:16,siege:1.2,gold:8,r:.3},ram:{hp:380,speed:.6,dps:26,siege:3,gold:15,r:.38,noMelee:!0,siegeEngine:!0},bowman:{hp:34,speed:1.3,dps:4,siege:.6,gold:5,r:.2,range:4,rate:.6,shot:6},catapult:{hp:240,speed:.45,dps:0,siege:0,gold:25,r:.42,range:6,rate:.22,boulder:90,splash:35,ammo:10,noMelee:!0,siegeEngine:!0}},Hh=11,Gh=.5;function Ao(r){return{raider:8+r*3,ladder:1+Math.floor(r/2),brute:r>=2?(r-1)*3:0,ram:r>=4?Math.ceil((r-3)*1.5):0,bowman:r>=3?r-2:0,catapult:r>=5?Math.floor((r-3)/2):0,hpMult:1+(r-1)*.07,spawnCount:r>=7?4:r>=5?3:r>=3?2:1}}function Vh(r){return 60+r*14}function Ec(r){let t=r>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}const Tc={grass:"g",hill:"h",marsh:"m",shallows:"s",water:"w"},Wh=Object.fromEntries(Object.entries(Tc).map(([r,t])=>[t,r]));class Xh{constructor(t=1,e=null){this.w=Ih,this.h=Dh,this.tiles=[],this.reserved=new Uint8Array(this.w*this.h),this.keep={hp:se.hp,maxHp:se.hp,x:0,y:0},this.spawns=[],this.dirty=!0,e?this.applyMap(e):this.generate(t)}snapshotMap(){let t="",e="",n="";for(const i of this.tiles)t+=Tc[i.terrain],e+=i.type==="tree"?"t":i.type==="rock"||i.rock?"r":".",n+=Math.min(9,Math.floor(i.v*10));return{w:this.w,h:this.h,terrain:t,scenery:e,v:n}}applyMap(t){if(t.w!==this.w||t.h!==this.h)throw new Error("map size mismatch");this.tiles=[];for(let e=0;e<this.w*this.h;e++){const n=t.scenery[e];this.tiles.push({type:n==="t"?"tree":n==="r"?"rock":"grass",terrain:Wh[t.terrain[e]]||"grass",hp:0,maxHp:0,v:(Number(t.v[e])+.5)/10,weakened:!1})}this.placeFixtures(),this.dirty=!0}placeFixtures(){const{w:t,h:e}=this,n=Math.floor(t/2)-1,i=Math.floor(e/2)-1,s=n+1,o=i+1;this.keep={hp:se.hp,maxHp:se.hp,x:n,y:i,door:this.idx(n+1,i+se.size-1),step:this.idx(n+1,i+se.size),doorHp:se.doorHp,doorMax:se.doorHp,inside:0},this.spawns=[{x:0,y:o,name:"west"},{x:t-1,y:o-1,name:"east"},{x:s,y:0,name:"north"},{x:s-1,y:e-1,name:"south"}],this.reserved.fill(0);for(let l=i;l<i+se.size;l++)for(let c=n;c<n+se.size;c++){const h=this.tiles[this.idx(c,l)];h.type="keep",h.terrain="grass"}const a=this.tiles[this.keep.step];this.reserved[this.keep.step]=1,a.terrain="grass",(a.type==="tree"||a.type==="rock")&&(a.type="grass");for(const l of this.spawns)for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){if(!this.inBounds(l.x+h,l.y+c))continue;const u=this.idx(l.x+h,l.y+c);this.reserved[u]=1;const d=this.tiles[u];d.terrain==="water"&&(d.terrain="shallows"),(d.type==="tree"||d.type==="rock")&&(d.type="grass")}}idx(t,e){return e*this.w+t}inBounds(t,e){return t>=0&&e>=0&&t<this.w&&e<this.h}idxAt(t,e){const n=Math.min(this.w-1,Math.max(0,Math.floor(t))),i=Math.min(this.h-1,Math.max(0,Math.floor(e)));return this.idx(n,i)}isBlocked(t){const e=this.tiles[t];return e.type==="tree"||e.type==="rock"||Ci[e.terrain].blocked===!0}isSolid(t){var n;const e=this.tiles[t];return e.type==="keep"||((n=St[e.type])==null?void 0:n.solid)===!0}isWalkable(t){return!this.isBlocked(t)&&!this.isSolid(t)}slow(t){const e=this.tiles[t],n=Ci[e.terrain].slow??1;return e.type==="moat"?Math.min(n,St.moat.slow):n}groundElev(t){return Ci[this.tiles[t].terrain].elev||0}rockHeight(t){return .35+this.tiles[t].v*.3}heightAt(t,e){const n=Math.min(this.w-1,Math.max(0,Math.floor(t))),i=Math.min(this.h-1,Math.max(0,Math.floor(e))),s=Math.min(1,Math.max(0,t-n)),o=Math.min(1,Math.max(0,e-i)),a=s<.5?-1:1,l=o<.5?-1:1,c=Math.abs(s-.5)*2,h=Math.abs(o-.5)*2,u=this.groundAt(n,i),d=(u+this.groundAt(n+a,i))/2,f=(u+this.groundAt(n,i+l))/2,g=this.cornerHeight(n+(a>0?1:0),i+(l>0?1:0));return c>=h?u+c*(d-u)+h*(g-d):u+h*(f-u)+c*(g-f)}groundAt(t,e){return this.inBounds(t,e)?this.groundElev(this.idx(t,e)):0}cornerHeight(t,e){let n=0,i=0;for(const[s,o]of[[t-1,e-1],[t,e-1],[t-1,e],[t,e]])this.inBounds(s,o)&&(n+=this.groundElev(this.idx(s,o)),i++);return i?n/i:0}minGround(t){const e=t%this.w,n=t/this.w|0;let i=this.groundElev(t);for(const[s,o]of[[e,n],[e+1,n],[e,n+1],[e+1,n+1]])i=Math.min(i,this.cornerHeight(s,o));return i}sloped(t){const e=t%this.w,n=t/this.w|0;for(let i=-1;i<=1;i++)for(let s=-1;s<=1;s++)if(this.groundAt(e+s,n+i)!==0)return!0;return!1}elev(t){return this.groundElev(t)}baseElev(t){const e=this.tiles[t];return this.groundElev(t)+(e.rock?this.rockHeight(t):0)}maxHpFor(t,e){var i;const n=((i=St[e])==null?void 0:i.hp)||0;return Math.round(n*(this.tiles[t].rock?kh.hp:1))}stairFace(t){const e=t%this.w,n=t/this.w|0;let i=-1,s=9;for(const[o,a]of[[0,-1],[1,0],[0,1],[-1,0]]){if(!this.inBounds(e+o,n+a))continue;const l=this.idx(e+o,n+a);if(!this.isRampart(l))continue;const c=["wall","thick","gate","tower","keep"].indexOf(this.tiles[l].type);c<s&&(s=c,i=l)}return i}isRampart(t){var n;const e=this.tiles[t];return e.type==="keep"||((n=St[e.type])==null?void 0:n.rampart)===!0}slots(t){var n;const e=this.tiles[t];return e.type==="keep"?se.slots:((n=St[e.type])==null?void 0:n.slots)||0}perch(t){var i;const e=this.tiles[t];return(e.type==="keep"?se.perch:((i=St[e.type])==null?void 0:i.perch)||0)+(Ci[e.terrain].perch||0)}surface(t){var i;const e=this.tiles[t],n=e.type==="keep"?se.height:((i=St[e.type])==null?void 0:i.height)||0;return this.elev(t)+n}surfaceAt(t,e,n){var s;const i=this.tiles[t];return i.type==="wall"||i.type==="thick"||i.type==="palisade"||i.type==="grass"?this.heightAt(e,n)+(((s=St[i.type])==null?void 0:s.height)||0):this.surface(t)}generate(t){for(let e=0;e<50;e++)if(this.tryGenerate(t+e*7919),this.spawnsConnected())return}tryGenerate(t){const e=Ec(t),{w:n,h:i}=this;this.tiles=[];for(let p=0;p<n*i;p++)this.tiles.push({type:"grass",terrain:"grass",hp:0,maxHp:0,v:e(),weakened:!1});this.placeFixtures();const s=this.keep.x+1,o=this.keep.y+1,a=(p,m,_)=>this.spawns.some(v=>Math.abs(p-v.x)+Math.abs(m-v.y)<_),l=(p,m,_,v)=>Math.abs(p-s)<_&&Math.abs(m-o)<v,c=(p,m,_)=>{this.inBounds(p,m)&&(this.tiles[this.idx(p,m)].terrain=_)},h=(p,m)=>this.inBounds(p,m)?this.tiles[this.idx(p,m)].terrain:null,u=(p,m)=>{const _=Math.floor(e()*n),v=Math.floor(e()*i);for(let x=v-4;x<=v+4;x++)for(let T=_-4;T<=_+4;T++){if(!this.inBounds(T,x))continue;const A=Math.hypot(T-_,x-v)+e()*.9;A<p&&m(T,x,A)}},d=3+Math.floor(e()*3);for(let p=0;p<d;p++)u(1.6+e()*1.6,(m,_)=>{l(m,_,3,3)||c(m,_,"hill")});if(e()<.8){const p=e()<.6,m=p?i:n;let _=p?e()<.5?5+Math.floor(e()*3):n-8+Math.floor(e()*3):e()<.5?2+Math.floor(e()*2):i-4-Math.floor(e()*2);const v=p?3:1,x=p?n-5:i-3,T=Math.floor(m*(.15+e()*.25)),A=Math.floor(m*(.6+e()*.25));for(let E=0;E<m;E++){e()<.3&&(_=Math.max(v,Math.min(x,_+(e()<.5?-1:1))));const P=Math.abs(E-T)<=1||Math.abs(E-A)<=1;for(const N of[0,1]){const y=p?_+N:E,w=p?E:_+N;l(y,w,6,5)||c(y,w,P?"shallows":"water")}}}const f=Math.floor(e()*3);for(let p=0;p<f;p++){const m=1.3+e()*1.2;u(m+1,(_,v,x)=>{l(_,v,6,5)||c(_,v,x<m?"water":"shallows")})}const g=1+Math.floor(e()*3);for(let p=0;p<g;p++)u(1.5+e()*1.5,(m,_)=>{!l(m,_,4,3)&&h(m,_)==="grass"&&c(m,_,"marsh")});this.placeFixtures();const M=8+Math.floor(e()*4);for(let p=0;p<M;p++){let m=Math.floor(e()*n),_=Math.floor(e()*i);const v=3+Math.floor(e()*6),x=h(m,_)==="hill",T=e()<(x?.45:.85)?"tree":"rock";for(let A=0;A<v;A++){if(this.inBounds(m,_)&&!l(m,_,6,5)&&!a(m,_,4)){const E=this.tiles[this.idx(m,_)];(E.terrain==="grass"||E.terrain==="hill"||T==="tree"&&E.terrain==="marsh")&&(E.type=T)}m+=Math.floor(e()*3)-1,_+=Math.floor(e()*3)-1}}this.dirty=!0}spawnsConnected(){const t=new Uint8Array(this.w*this.h),e=this.keep,n=[this.idx(e.x,e.y)];for(t[n[0]]=1;n.length;){const i=n.pop(),s=i%this.w,o=i/this.w|0;for(const[a,l]of[[1,0],[-1,0],[0,1],[0,-1]]){const c=s+a,h=o+l;if(!this.inBounds(c,h))continue;const u=this.idx(c,h);t[u]||this.isBlocked(u)||(t[u]=1,n.push(u))}}return this.spawns.every(i=>t[this.idx(i.x,i.y)])}isRough(t){const e=St[t];return!!(e!=null&&e.solid)&&!e.village}buildProblem(t,e){var s;const n=this.tiles[t];if(this.reserved[t])return"reserved";if(this.isRough(e))return n.type==="grass"||n.type==="tree"||n.type==="rock"?null:"occupied";if(n.type!=="grass")return"occupied";const i=Ci[n.terrain];return i.blocked||i.noBuild||(s=St[e])!=null&&s.flatOnly&&n.terrain!=="grass"?"terrain":null}canBuild(t,e="wall"){return this.buildProblem(t,e)===null}build(t,e){const n=this.tiles[t];n.type==="rock"&&(n.rock=this.isRough(e)),n.type=e,n.plot=null,n.hp=n.maxHp=this.maxHpFor(t,e),n.weakened=!1,this.dirty=!0}clear(t){const e=this.tiles[t];e.type=e.rock?"rock":"grass",e.rock=!1,e.hoard=!1,e.ladder=null,e.plot=null,e.paid=void 0,e.hp=e.maxHp=0,this.dirty=!0}damage(t,e){const n=this.tiles[t];return n.type==="keep"?(this.keep.hp=Math.max(0,this.keep.hp-e),this.keep.hp<=0):(n.hp-=e,n.hp<=0?(this.clear(t),!0):(n.hp<n.maxHp*.5&&!n.weakened&&(n.weakened=!0,this.dirty=!0),!1))}}const Ro=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];class Ac{constructor(){this.items=[]}get size(){return this.items.length}push(t,e){const n=this.items;n.push([e,t]);let i=n.length-1;for(;i>0;){const s=i-1>>1;if(n[s][0]<=n[i][0])break;[n[s],n[i]]=[n[i],n[s]],i=s}}pop(){const t=this.items,e=t[0],n=t.pop();if(t.length){t[0]=n;let i=0;for(;;){const s=i*2+1,o=s+1;let a=i;if(s<t.length&&t[s][0]<t[a][0]&&(a=s),o<t.length&&t[o][0]<t[a][0]&&(a=o),a===i)break;[t[a],t[i]]=[t[i],t[a]],i=a}}return e}}function cl(r,t,e,n){const i=r.tiles[t];if(i.type==="keep")return 1/0;if(r.isSolid(t)){if(bc.includes(i.type)&&n!=="ram")return i.ladder?e/nn.climb:n==="ladder"&&nn.reach.includes(i.type)?e/nn.climb+nn.cost:1/0;const o=i.type==="gate"?n==="ram"?Oh:Fh:1;return e+Math.max(0,i.hp)*Nh*o}return e/r.slow(t)}function Co(r,t,e,n,i){return!n||!i?!0:r.isWalkable(r.idx(t+n,e))&&r.isWalkable(r.idx(t,e+i))}function Ra(r,t="foot"){const{w:e,h:n}=r,i=e*n,s=new Float64Array(i).fill(1/0),o=new Int32Array(i).fill(-1),a=new Ac,l=r.keep.step;for(s[l]=0,a.push(l,0);a.size;){const[c,h]=a.pop();if(c>s[h])continue;const u=h%e,d=h/e|0;for(const[f,g,M]of Ro){const p=u-f,m=d-g;if(p<0||m<0||p>=e||m>=n)continue;const _=r.idx(p,m);if(r.isBlocked(_)||r.tiles[_].type==="keep"||!Co(r,p,m,f,g))continue;const v=c+cl(r,h,M,t);v<s[_]&&(s[_]=v,a.push(_,v))}}for(let c=0;c<i;c++){if(!isFinite(s[c])||s[c]===0)continue;const h=c%e,u=c/e|0;let d=1/0;for(const[f,g,M]of Ro){const p=h+f,m=u+g;if(p<0||m<0||p>=e||m>=n)continue;const _=r.idx(p,m);if(r.isBlocked(_)||!Co(r,h,u,f,g))continue;const v=s[_]+cl(r,_,M,t);v<d&&(d=v,o[c]=_)}}return{dist:s,next:o}}function qh(r){return Ra(r,"ram")}function $h(r){return Ra(r,"ladder")}function Yh(r){const{w:t,h:e}=r,n=t*e,i=new Float64Array(n).fill(1/0),s=new Int32Array(n).fill(-1),o=new Ac,a=c=>r.tiles[c].type==="cottage"||r.tiles[c].type==="market"||r.tiles[c].type==="farm",l=(c,h)=>a(c)?h:r.isWalkable(c)?h/r.slow(c):1/0;for(let c=0;c<n;c++)a(c)&&(i[c]=0,o.push(c,0));for(;o.size;){const[c,h]=o.pop();if(c>i[h])continue;const u=h%t,d=h/t|0;for(const[f,g,M]of Ro){const p=u-f,m=d-g;if(p<0||m<0||p>=t||m>=e)continue;const _=r.idx(p,m);if(!r.isWalkable(_)||!Co(r,p,m,f,g))continue;const v=c+l(h,M);v<i[_]&&(i[_]=v,s[_]=h,o.push(_,v))}}return{dist:i,next:s}}const Ir=.4,Kh=60,Zi=[[1,0],[-1,0],[0,1],[0,-1]],Zh=3.2,hl=1,Dr=["palisade","wall","thick"];class Mr{constructor(t=20261006,e=null){this.seed=t,this.reset(t,e)}reset(t=this.seed,e=this.map){this.seed=t,this.map=e,this.world=new Xh(t,e),this.gold=Uh,this.wave=0,this.phase="build",this.enemies=[],this.archers=[],this.swordsmen=[],this.projectiles=[],this.ladders=[],this.fallen=[],this.intruders=[],this.gateLocks=new Map,this.effects=[],this.floaters=[],this.spawnQueue=[],this.waveTime=0,this.time=0,this.nextId=1,this.events=[],this.sounds=[],this.rnd=Ec(t^2654435769),this.repath();const n=this.world.keep;for(const[i,s]of[[1,0],[0,2],[2,2]].slice(0,se.archers))this.addArcher(this.world.idx(n.x+i,n.y+s));this.proposePlots()}emit(t,e={}){this.events.push({type:t,...e})}sfx(t,e,n){this.sounds.length<48&&this.sounds.push({name:t,x:e,y:n})}get nextWave(){return this.wave+1}activeSpawns(t=this.nextWave){return this.world.spawns.slice(0,Ao(t).spawnCount)}center(t){return[t%this.world.w+.5,(t/this.world.w|0)+.5]}enemyOnTile(t){const e=t%this.world.w,n=t/this.world.w|0;return this.enemies.some(i=>i.x+i.r>e&&i.x-i.r<e+1&&i.y+i.r>n&&i.y-i.r<n+1)}canPlace(t,e){if(this.phase==="won"||this.phase==="lost")return!1;if(e==="archer")return this.canPlaceArcher(t);if(e==="swordsman")return this.canPlaceSwordsman(t);if(e==="upgrade")return this.upgradeInfo(t)!==null&&this.gold>=this.upgradeInfo(t).cost;if(e==="hoard")return this.canHoard(t);if(e==="settle")return this.canSettle(t);const n=this.layOverCost(t,e);return n!==null?this.gold>=n:!(!this.world.canBuild(t,e)||St[e].stair&&this.stairFace(t)<0||this.gold<this.costAt(t,e)||St[e].solid&&(this.enemyOnTile(t)||this.swordsmanOnTile(t)))}place(t,e){if(e==="archer")return this.placeArcher(t);if(e==="swordsman")return this.placeSwordsman(t);if(e==="upgrade")return this.upgrade(t);if(e==="hoard")return this.hoard(t);if(e==="settle")return this.settle(t);if(this.layOverCost(t,e)!==null)return this.layOver(t,e);if(!this.canPlace(t,e))return!1;const n=this.costAt(t,e);if(this.gold-=n,this.world.build(t,e),this.world.tiles[t].paid=n,n>St[e].cost){const[i,s]=this.center(t);this.floaters.push({x:i,y:s,z:this.world.surface(t),text:`-${n}`,t:0,color:"cost"})}for(let i=0;i<(St[e].freeArchers||0);i++)this.addArcher(t);return this.sfx("build",...this.center(t)),!0}layOverCost(t,e){const n=this.world.tiles[t].type,i=Dr.indexOf(n),s=e==="gate"?Dr.length:Dr.indexOf(e);return i<0||s<=i||this.phase==="won"||this.phase==="lost"?null:Math.max(1,this.costAt(t,e)-this.costAt(t,n))}layOver(t,e){const n=this.layOverCost(t,e);if(n===null||this.gold<n)return!1;this.gold-=n;const i=this.world.tiles[t];i.paid=(i.paid??this.costAt(t,i.type))+n,i.type=e,i.hp=i.maxHp=this.world.maxHpFor(t,e),i.weakened=!1,en.on.includes(e)||(i.hoard=!1),this.world.dirty=!0;const s=this.archers.filter(l=>l.tile===t&&!l.path.length);for(const l of s.slice(this.world.slots(t))){const c=this.rampartPath(l,h=>this.hasRoom(h,l));c?l.path=c:this.rehouse(l)}const[o,a]=this.center(t);return this.floaters.push({x:o,y:a,z:this.world.surface(t),text:`-${n}`,t:0,color:"cost"}),this.sfx("build",o,a),!0}costAt(t,e){const n=St[e].cost;if(!this.world.isRough(e))return n;const i=this.world.tiles[t],s=(To[i.terrain]||1)*(To[i.type]||1);return Math.ceil(n*s)}upgradeInfo(t){const e=this.world.tiles[t],n=St[e.type];if(!n||!n.hp)return null;if(n.upgrade){const i=St[n.upgrade];return{kind:"upgrade",to:n.upgrade,cost:Math.max(1,i.cost-n.cost)}}if(e.hp<e.maxHp){const i=1-e.hp/e.maxHp;return{kind:"repair",cost:Math.max(1,Math.ceil(n.cost*i))}}return null}upgrade(t){const e=this.upgradeInfo(t);if(!e||this.gold<e.cost||this.phase==="won"||this.phase==="lost")return!1;this.gold-=e.cost;const n=this.world.tiles[t];return e.kind==="upgrade"?(n.paid=(n.paid??St[n.type].cost)+e.cost,n.type=e.to,n.hp=n.maxHp=this.world.maxHpFor(t,e.to),n.weakened=!1,this.world.dirty=!0):(n.hp=n.maxHp,n.weakened=!1,this.world.dirty=!0),this.floaters.push({x:t%this.world.w+.5,y:(t/this.world.w|0)+.5,z:this.world.surface(t),text:`-${e.cost}`,t:0,color:"cost"}),this.sfx("build",...this.center(t)),!0}refundFor(t){const e=this.world.tiles[t],n=St[e.type];if(!n)return 0;const i=e.maxHp?e.hp/e.maxHp:1,s=this.phase==="build"?1:.5,o=(e.paid??n.cost)+(e.hoard?en.cost:0);return Math.floor(o*i*s)}demolish(t){const e=this.world.tiles[t];if(e.type==="plot")return this.world.clear(t),!0;if(!St[e.type])return!1;this.gold+=this.refundFor(t);const n=this.archers.filter(i=>i.tile===t);this.world.clear(t);for(const i of n)this.rehouse(i);return!0}canHoard(t){const e=this.world.tiles[t];return this.phase!=="won"&&this.phase!=="lost"&&en.on.includes(e.type)&&!e.hoard&&this.gold>=en.cost}hoard(t){return this.canHoard(t)?(this.gold-=en.cost,this.world.tiles[t].hoard=!0,this.sfx("build",...this.center(t)),!0):!1}villageCount(t){return this.world.tiles.filter(e=>e.type===t).length}canSettle(t){const e=this.world.tiles[t];return this.phase!=="won"&&this.phase!=="lost"&&e.type==="plot"&&this.gold>=St[e.plot].cost&&!(St[e.plot].solid&&this.enemyOnTile(t))}settle(t){if(!this.canSettle(t))return!1;const e=this.world.tiles[t].plot;return this.gold-=St[e].cost,this.world.build(t,e),this.sfx("build",...this.center(t)),!0}income(){var e;let t=0;for(const n of this.world.tiles)t+=((e=St[n.type])==null?void 0:e.income)||0;return t}safetyMap(){var l;const{world:t}=this,{w:e,h:n}=t,i=new Uint8Array(e*n),s=[];for(let c=0;c<e*n;c++){const h=c%e,u=c/e|0;(h===0||u===0||h===e-1||u===n-1)&&t.isWalkable(c)&&(i[c]=1,s.push(c))}for(let c=0;c<s.length;c++){const h=s[c],u=h%e,d=h/e|0;for(const[f,g]of Zi){const M=u+f,p=d+g;if(!t.inBounds(M,p))continue;const m=t.idx(M,p);i[m]||!t.isWalkable(m)||(i[m]=1,s.push(m))}}const o=t.keep,a=new Float32Array(e*n).fill(-1/0);for(let c=0;c<e*n;c++){if(!t.canBuild(c,"cottage")||this.tiles_villageBlocked(c))continue;const h=c%e,u=c/e|0;let d=i[c]?0:30;for(let g=Math.max(0,u-4);g<=Math.min(n-1,u+4);g++)for(let M=Math.max(0,h-4);M<=Math.min(e-1,h+4);M++){const p=t.tiles[t.idx(M,g)].type;p==="tower"?d+=2.5:(l=St[p])!=null&&l.rampart&&(d+=.4)}d-=Math.hypot(h-(o.x+1),u-(o.y+1))*.8;const f=Math.min(h,u,e-1-h,n-1-u);f<3&&(d-=(3-f)*4),t.tiles[c].terrain==="hill"&&(d-=1),a[c]=d}return a}tiles_villageBlocked(t){var s,o;const{world:e}=this,n=t%e.w,i=t/e.w|0;for(const[a,l]of Zi){const c=n+a,h=i+l;if(!e.inBounds(c,h))continue;const u=e.tiles[e.idx(c,h)].type;if(u==="keep"||(s=St[u])!=null&&s.solid&&!((o=St[u])!=null&&o.village))return!0}return!1}proposePlots(){const{world:t}=this,e=t.tiles.filter(h=>h.type==="plot").length;if(e>=Lr.maxPlots)return[];const n=this.safetyMap(),i=(h,u)=>{const d=h%t.w,f=h/t.w|0;let g=0;for(const[M,p]of[...Zi,[1,1],[1,-1],[-1,1],[-1,-1]]){if(!t.inBounds(d+M,f+p))continue;const m=t.tiles[t.idx(d+M,f+p)];(u.includes(m.type)||u.includes(m.plot))&&g++}return g},s=h=>{let u=-1,d=-1/0;for(let f=0;f<n.length;f++){if(n[f]===-1/0||t.tiles[f].type!=="grass")continue;const g=n[f]+h(f)+this.rnd()*.5;g>d&&(d=g,u=f)}return u},o=[],a=(h,u)=>{const d=s(u);d<0||(t.tiles[d].type="plot",t.tiles[d].plot=h,o.push(h))},l=this.villageCount("cottage"),c=[];l>=Lr.marketAfter&&!this.villageCount("market")&&!t.tiles.some(h=>h.plot==="market")&&c.push("market"),c.push("cottage"),l>0&&c.push("farm");for(const h of c.slice(0,Lr.maxPlots-e))h==="farm"?a(h,u=>i(u,["cottage","farm"])*6):a(h,u=>i(u,["cottage","market"])*3);return o}occupancy(t,e=null){let n=0;for(const i of this.archers){if(i===e)continue;(i.path.length?i.path[i.path.length-1]:i.tile)===t&&n++}return n}hasRoom(t,e=null){return this.world.isRampart(t)&&this.occupancy(t,e)<this.world.slots(t)}canPlaceArcher(t){return this.phase!=="won"&&this.phase!=="lost"&&this.gold>=tn.cost&&this.hasRoom(t)}placeArcher(t){return this.canPlaceArcher(t)?(this.gold-=tn.cost,this.addArcher(t),this.sfx("recruit",...this.center(t)),!0):!1}addArcher(t){if(!this.hasRoom(t))return null;const{world:e}=this,n={id:this.nextId++,kind:"archer",tile:t,post:t,path:[],hp:tn.hp,maxHp:tn.hp,ox:(this.rnd()-.5)*.3,oy:(this.rnd()-.5)*.3,x:t%e.w+.5,y:(t/e.w|0)+.5,z:e.surface(t),cd:0,think:this.rnd()*Ir,heading:Math.PI/2,flash:0};return n.x+=n.ox,n.y+=n.oy,this.archers.push(n),n}rehouse(t){const{world:e}=this,n=e.keep;for(let i=n.y;i<n.y+se.size;i++)for(let s=n.x;s<n.x+se.size;s++){const o=e.idx(s,i);if(this.hasRoom(o,t)){t.tile=t.post=o,t.path=[],t.x=s+.5+t.ox,t.y=i+.5+t.oy,t.z=e.surface(o);return}}this.archers=this.archers.filter(i=>i!==t),this.gold+=tn.cost}range(t){return tn.range+this.world.perch(t)}enemyInRange(t){const[e,n]=this.center(t),i=this.range(t)**2;return this.enemies.some(s=>!s.dead&&(s.x-e)**2+(s.y-n)**2<=i)}rampartPath(t,e){const{world:n}=this,i=new Map([[t.tile,-1]]),s=[t.tile];for(let o=0;o<s.length&&o<Kh;o++){const a=s[o];if(a!==t.tile&&e(a)){const h=[];for(let u=a;u!==t.tile;u=i.get(u))h.push(u);return h.reverse()}const l=a%n.w,c=a/n.w|0;for(const[h,u]of Zi){const d=l+h,f=c+u;if(!n.inBounds(d,f))continue;const g=n.idx(d,f);i.has(g)||!n.isRampart(g)||(i.set(g,a),s.push(g))}}return null}updateArcher(t,e){const{world:n}=this;if(!n.isRampart(t.tile)){t.dead=!0;return}if(t.cd-=e,t.think-=e,t.flash=Math.max(0,t.flash-e),t.path.length){const s=t.path[0];if(!n.isRampart(s))t.path=[];else{const o=s%n.w+.5+t.ox,a=(s/n.w|0)+.5+t.oy,l=o-t.x,c=a-t.y,h=Math.hypot(l,c),u=tn.speed*e;t.heading=Math.atan2(c,l),h<=u?(t.x=o,t.y=a,t.tile=t.path.shift()):(t.x+=l/h*u,t.y+=c/h*u);const d=n.surfaceAt(h<.5?s:t.tile,t.x,t.y);t.z+=(d-t.z)*Math.min(1,e*10);return}}t.z+=(n.surfaceAt(t.tile,t.x,t.y)-t.z)*Math.min(1,e*10);const i=this.pickTarget(t.x,t.y,this.range(t.tile));if(i){t.heading=Math.atan2(i.y-t.y,i.x-t.x),t.cd<=0&&(t.cd=1/tn.fireRate,this.shoot(t.x,t.y,t.z+.5,i,tn.damage,!1,this.hitChance(t,i)),this.sfx("bow",t.x,t.y));return}if(!(t.think>0)){if(t.think=Ir,this.phase==="attack"){const s=this.rampartPath(t,o=>this.hasRoom(o,t)&&this.enemyInRange(o));s&&(t.path=s)}else if(t.tile!==t.post){const s=this.rampartPath(t,o=>o===t.post);s?t.path=s:t.post=t.tile}}}troopPassable(t){const e=this.world.tiles[t].type;return this.world.isWalkable(t)||e==="gate"&&!this.gateLocks.has(t)}updateGateLocks(t){const{world:e}=this;for(const[n,i]of this.gateLocks)i-t<=0||e.tiles[n].type!=="gate"?this.gateLocks.delete(n):this.gateLocks.set(n,i-t);for(const n of this.enemies){if(n.dead||n.gone||this.elevated(n))continue;const i=Zh;for(let s=Math.floor(n.y-i);s<=Math.floor(n.y+i);s++)for(let o=Math.floor(n.x-i);o<=Math.floor(n.x+i);o++){if(!e.inBounds(o,s))continue;const a=e.idx(o,s);e.tiles[a].type==="gate"&&Math.hypot(o+.5-n.x,s+.5-n.y)<=i&&this.gateLocks.set(a,1.5)}}}stairFace(t){return this.world.stairFace(t)}troopNext(t){const{world:e}=this,n=t>>1,i=t&1,s=e.keep,o=n%e.w,a=n/e.w|0,l=[];for(const[c,h]of Zi){const u=o+c,d=a+h;if(!e.inBounds(u,d))continue;const f=e.idx(u,d);i?e.isRampart(f)?l.push(f*2+1):(e.tiles[f].type==="stair"&&this.stairFace(f)===n||n===s.door&&f===s.step)&&l.push(f*2):(this.troopPassable(f)&&l.push(f*2),e.isRampart(f)&&(e.tiles[n].type==="stair"&&this.stairFace(n)===f||n===s.step&&f===s.door)&&l.push(f*2+1))}return l}troopRoute(t,e,n=900){if(t===e)return[];const i=new Map([[t,-1]]),s=[t];for(let o=0;o<s.length&&o<n;o++){const a=s[o];if(a===e){const l=[];for(let c=a;c!==t;c=i.get(c))l.push(c);return l.reverse()}for(const l of this.troopNext(a))i.has(l)||(i.set(l,a),s.push(l))}return null}troopPath(t,e,n=900){const i=this.troopRoute(t*2,e*2,n);return i&&i.map(s=>s>>1)}elevated(t){return t.z-this.world.heightAt(t.x,t.y)>.5}swordsmanOnTile(t){const e=t%this.world.w,n=t/this.world.w|0;return this.swordsmen.some(i=>!i.up&&i.x>e&&i.x<e+1&&i.y>n&&i.y<n+1)}canPlaceSwordsman(t){const{world:e}=this;return this.phase!=="won"&&this.phase!=="lost"&&this.gold>=$e.cost&&(e.isWalkable(t)&&!e.reserved[t]||e.isRampart(t))}placeSwordsman(t){if(!this.canPlaceSwordsman(t))return!1;this.gold-=$e.cost;const[e,n]=this.center(t),i=!this.world.isWalkable(t),s={id:this.nextId++,kind:"swordsman",post:t,postUp:i,up:i,x:e+(this.rnd()-.5)*.3,y:n+(this.rnd()-.5)*.3,z:0,hp:$e.hp,maxHp:$e.hp,r:$e.r,path:[],zone:null,target:null,think:0,heading:Math.PI/2,walk:0,fighting:!1,flash:0};return s.z=this.troopZ(s),this.swordsmen.push(s),this.sfx("recruit",e,n),!0}troopZ(t){const{world:e}=this,n=e.idxAt(t.x,t.y);if(t.up&&e.isRampart(n))return e.surfaceAt(n,t.x,t.y);const i=e.heightAt(t.x,t.y);if(e.tiles[n].type==="stair"){const s=this.stairFace(n);if(s>=0){const[o,a]=this.center(n),[l,c]=this.center(s),h=Math.max(0,Math.min(1,(t.x-o)*(l-o)+(t.y-a)*(c-a)+.5));return i+h*(e.surfaceAt(s,o+(l-o)/2,a+(c-a)/2)-i)}}return i}covers(t,e){const n=t.zone;if(!n){const[s,o]=this.center(t.post);return Math.hypot(e.x-s,e.y-o)<=$e.guard}const i=zh;return e.x>=n.x0-i&&e.x<=n.x1+1+i&&e.y>=n.y0-i&&e.y<=n.y1+1+i}orderSwordsmen(t,e,n=null){const{world:i}=this,s=this.swordsmen.filter(a=>t.includes(a.id));if(!s.length)return!1;let o=[];if(e){for(let a=e.y0;a<=e.y1;a++)for(let l=e.x0;l<=e.x1;l++){const c=i.idx(l,a);i.inBounds(l,a)&&i.isWalkable(c)&&o.push(c)}o.sort((a,l)=>a%i.w-l%i.w||a-l)}else n!==null&&(i.isWalkable(n)||i.isRampart(n))&&(o=[n]);return o.length?(s.forEach((a,l)=>{a.zone=e,a.post=o[Math.floor((l+.5)/s.length*o.length)],a.postUp=!i.isWalkable(a.post),a.think=0}),!0):!1}updateSwordsman(t,e){const{world:n}=this;t.flash=Math.max(0,t.flash-e),t.think-=e;let i=n.idxAt(t.x,t.y);t.up&&!n.isRampart(i)&&(t.up=!1),t.z+=(this.troopZ(t)-t.z)*Math.min(1,e*8);const[s,o]=this.center(t.post),a=i*2+(t.up?1:0),l=t.post*2+(t.postUp?1:0);if(t.think<=0){if(t.think=Ir,t.target=null,this.phase==="attack"){let v=1/0;for(const x of this.enemies){if(x.dead||x.gone||!this.covers(t,x))continue;const T=Math.hypot(x.x-t.x,x.y-t.y);T<v&&(v=T,t.target=x)}}let _=null;if(t.target){const v=t.target,x=n.idxAt(v.x,v.y);_=this.troopRoute(a,x*2+(this.elevated(v)&&n.isRampart(x)?1:0))}_||(t.target=null,_=this.troopRoute(a,l)),t.path=_||[]}const c=t.target;if(c&&!c.dead&&!c.gone&&Math.hypot(c.x-t.x,c.y-t.y)<=t.r+c.r+.3&&Math.abs(c.z-t.z)<.6){t.fighting=!0,t.heading=Math.atan2(c.y-t.y,c.x-t.x),t.walk+=e*8,this.hurt(c,$e.dps*e,!1),Math.random()<e*2&&this.sfx("clash",t.x,t.y);return}t.fighting=!1;const h=$e.speed*(t.up?1:n.slow(i)),u=t.path[0];if(u!==void 0&&!(u&1)&&u>>1!==i&&this.gateLocks.has(u>>1)&&(t.path=[],t.think=Math.min(t.think,.1)),t.path.length){const[_,v]=this.center(t.path[0]>>1),x=_-t.x,T=v-t.y,A=Math.hypot(x,T),E=Math.min(A,h*e);A>1e-6&&(t.heading=Math.atan2(T,x),t.x+=x/A*E,t.y+=T/A*E,t.walk+=E*6),i=n.idxAt(t.x,t.y),i===t.path[0]>>1&&(t.up=!!(t.path[0]&1)),A-E<.3&&t.path.shift();return}let d=s,f=o;c&&!c.dead&&!c.gone&&(d=c.x,f=c.y);const g=d-t.x,M=f-t.y,p=Math.hypot(g,M);if(p<.05)return;const m=Math.min(p,h*e);t.heading=Math.atan2(M,g),t.walk+=m*6,this.tryMove(t,g/p*m,M/p*m)}startWave(){if(this.phase!=="build")return;const t=this.nextWave,e=Ao(t),n=this.activeSpawns(t),i=[],s=(l,c,h=0)=>{for(let u=0;u<c;u++)i.splice(h+Math.floor(this.rnd()*(i.length-h+1)),0,l)};for(let l=0;l<e.raider;l++)i.push("raider");s("ladder",e.ladder),s("brute",e.brute),s("bowman",e.bowman);const o=Math.floor(i.length/2);s("ram",e.ram,o),s("catapult",e.catapult,o);const a=n.map(()=>[]);i.forEach((l,c)=>a[c%n.length].push(l)),this.spawnQueue=[],a.forEach((l,c)=>{const h={raider:4,ladder:3,brute:3,bowman:2,ram:1,catapult:0};l.sort((u,d)=>h[u]-h[d]),l.forEach((u,d)=>this.spawnQueue.push({type:u,spawn:n[c],t:1+c*.5,rank:d,hpMult:e.hpMult}))}),this.spawnQueue.sort((l,c)=>l.t-c.t),this.waveTime=0,this.phase="attack",this.emit("waveStart",{wave:t,spawns:n.map(l=>l.name)})}spawnEnemy({type:t,spawn:e,hpMult:n,rank:i=null}){let s=e.x+.5+(this.rnd()-.5)*.4,o=e.y+.5+(this.rnd()-.5)*.4;i!==null&&([s,o]=this.formationSpot(e,i));const a=this.makeEnemy(t,s,o,n);return i!==null&&!di[t].siegeEngine&&(a.march=!0),this.enemies.push(a),a}formationSpot(t,e){const{world:n}=this,i=t.x===0?1:t.x===n.w-1?-1:0,s=t.y===0?1:t.y===n.h-1?-1:0,o=5,a=Math.floor(e/o),l=e%o-(o-1)/2,c=.1+a*.6;let h=t.x+.5+i*c+(s?l*.6:0),u=t.y+.5+s*c+(i?l*.6:0);for(let d=0;d<10&&this.blockedAt(h,u,.2);d++)h+=(this.rnd()-.5)*.8+i*.25,u+=(this.rnd()-.5)*.8+s*.25;return this.blockedAt(h,u,.2)?[t.x+.5,t.y+.5]:[h,u]}makeEnemy(t,e,n,i=1){const s=di[t],o=Math.round(s.hp*i),a={id:this.nextId++,type:t,x:e,y:n,z:this.world.heightAt(e,n),hp:o,maxHp:o,speed:s.speed*(.9+this.rnd()*.2),dps:s.dps,siege:s.siege,gold:s.gold,r:s.r,heading:0,attacking:!1,shooting:!1,fired:-9,cd:.5+this.rnd(),ammo:s.ammo||0,walk:this.rnd()*10,flash:0,dead:!1,stuck:0,raising:0};if(s.crew){a.members=[];for(let l=0;l<s.crew;l++){const c=Math.round(di.raider.hp*i);a.members.push({type:"raider",hp:c,maxHp:c})}}return a}update(t){this.time+=t;for(const e of this.floaters)e.t+=t;this.floaters=this.floaters.filter(e=>e.t<1.2);for(const e of this.effects)e.t+=t;this.effects=this.effects.filter(e=>e.t<e.life),this.world.dirty&&this.repath(),this.updateGateLocks(t);for(const e of this.archers)this.updateArcher(e,t);for(const e of this.swordsmen)this.updateSwordsman(e,t);if(this.reapDefenders(),this.phase==="attack"){for(this.waveTime+=t;this.spawnQueue.length&&this.spawnQueue[0].t<=this.waveTime;)this.spawnEnemy(this.spawnQueue.shift());for(const e of this.enemies)this.updateEnemy(e,t);this.updateLadders(t),this.regroup(t),this.updateIntruders(t),this.separate(),this.updateTraps(t),this.updateProjectiles(t),this.reapDefenders();for(const e of this.enemies)e.dead&&(this.gold+=e.gold,this.floaters.push({x:e.x,y:e.y,z:e.z,text:`+${e.gold}`,t:0}));if(this.enemies=this.enemies.filter(e=>!e.dead&&!e.gone),this.world.keep.hp<=0){this.phase="lost",this.emit("lost",{wave:this.nextWave});return}!this.spawnQueue.length&&!this.enemies.length&&!this.intruders.length&&this.endWave()}}reapDefenders(){for(const t of[this.archers,this.swordsmen])for(const e of t)(e.dead||e.hp<=0)&&(e.dead=!0,this.sfx("fall",e.x,e.y));this.archers=this.archers.filter(t=>!t.dead),this.swordsmen=this.swordsmen.filter(t=>!t.dead)}repath(){var i;this.flow=Ra(this.world),this.ladderFlow=$h(this.world),this.ramFlow=qh(this.world),this.villageFlow=Yh(this.world);const{world:t}=this,e=t.keep;let n=3;for(let s=0;s<t.tiles.length;s++){const o=t.tiles[s].type;!((i=St[o])!=null&&i.solid)||St[o].village||(n=Math.max(n,Math.hypot(s%t.w+.5-(e.x+1.5),(s/t.w|0)+.5-(e.y+se.size))))}this.castleReach=n,this.world.dirty=!1}flowFor(t){if(di[t.type].siegeEngine)return this.ramFlow;if(t.type==="ladder")return this.ladderFlow;const e=this.world.idxAt(t.x,t.y);return isFinite(this.flow.dist[e])?this.flow:this.ladderFlow}climbs(t){return!di[t.type].siegeEngine&&t.type!=="ladder"}endWave(){this.wave++,this.projectiles=[];for(const i of this.ladders)this.world.tiles[i.tile].ladder=null;this.ladders=[],this.fallen=[],this.intruders=[],this.gateLocks.clear(),this.world.keep.doorHp=this.world.keep.doorMax,this.world.keep.inside=0,this.world.dirty=!0;for(const i of[...this.archers,...this.swordsmen])i.hp=i.maxHp;if(this.wave>=ci){this.phase="won",this.emit("won",{wave:this.wave});return}const t=Vh(this.wave),e=this.income();this.gold+=t+e,this.world.keep.hp=this.world.keep.maxHp,this.phase="build";const n=this.proposePlots();this.emit("waveEnd",{wave:this.wave,bonus:t,village:e,plots:n})}blockedAt(t,e,n,i=null,s=-1){const{world:o}=this;if(t-n<0||e-n<0||t+n>=o.w||e+n>=o.h)return!0;const a=Math.floor(t-n),l=Math.floor(t+n),c=Math.floor(e-n),h=Math.floor(e+n);for(let u=c;u<=h;u++)for(let d=a;d<=l;d++){const f=o.idx(d,u);if(i==="troopUp"){if(!o.isRampart(f))return!0}else if(i==="troop"?!this.troopPassable(f)&&f!==s:!o.isWalkable(f)&&!(i==="climb"&&o.tiles[f].ladder))return!0}return!1}tryMove(t,e,n){const i=t.r*.8,s=t.kind==="swordsman"?t.up?"troopUp":"troop":t.kind==="archer"?null:this.climbs(t)?"climb":null,o=this.world.idxAt(t.x,t.y);e&&!this.blockedAt(t.x+e,t.y,i,s,o)&&(t.x+=e),n&&!this.blockedAt(t.x,t.y+n,i,s,o)&&(t.y+=n)}nearestDefender(t,e,n){let i=null,s=n;for(const o of[this.archers,this.swordsmen])for(const a of o){if(a.dead)continue;const l=Math.hypot(a.x-t,a.y-e);l<=s&&(s=l,i=a)}return i}catapultTarget(t,e){const{world:n}=this;let i=-1,s=1/0;const o=Math.max(0,Math.floor(t.x-e)),a=Math.min(n.w-1,Math.floor(t.x+e)),l=Math.max(0,Math.floor(t.y-e)),c=Math.min(n.h-1,Math.floor(t.y+e));for(let h=l;h<=c;h++)for(let u=o;u<=a;u++){const d=n.idx(u,h);if(!n.isSolid(d)||n.tiles[d].type==="keep")continue;const f=Math.hypot(u+.5-t.x,h+.5-t.y);if(f>e)continue;const g=n.tiles[d].type,M=f+(g==="tower"?-4:0);M<s&&(s=M,i=d)}return i}updateEnemy(t,e){var m,_,v;const{world:n}=this,i=di[t.type];t.flash=Math.max(0,t.flash-e),t.cd-=e;const s=n.idxAt(t.x,t.y),o=n.tiles[s].ladder?n.surfaceAt(s,t.x,t.y):n.heightAt(t.x,t.y);if(t.z+=(o-t.z)*Math.min(1,e*8),t.attacking=!1,t.shooting=!1,t.type==="bowman"){const x=this.nearestDefender(t.x,t.y,i.range);if(x){t.shooting=!0,t.heading=Math.atan2(x.y-t.y,x.x-t.x),t.cd<=0&&(t.cd=1/i.rate,this.shoot(t.x,t.y,t.z+.5,x,i.shot,!0),this.sfx("bow",t.x,t.y));return}}else if(t.type==="catapult"&&t.ammo>0){const x=this.catapultTarget(t,i.range);if(x>=0){t.shooting=!0;const[T,A]=this.center(x);t.heading=Math.atan2(A-t.y,T-t.x),t.cd<=0&&(t.cd=1/i.rate,t.fired=this.time,t.ammo--,this.lob(t,x,i),this.sfx("launch",t.x,t.y));return}}if(!i.noMelee&&i.dps>0){for(const x of this.swordsmen)if(!(x.dead||Math.hypot(x.x-t.x,x.y-t.y)>t.r+x.r+.3||Math.abs(x.z-t.z)>.6)){t.attacking=!0,t.heading=Math.atan2(x.y-t.y,x.x-t.x),t.walk+=e*6,x.hp-=t.dps*e,x.flash=.1;return}if(n.tiles[s].ladder){for(const x of this.archers)if(!(x.dead||Math.hypot(x.x-t.x,x.y-t.y)>t.r+.4)){t.attacking=!0,t.heading=Math.atan2(x.y-t.y,x.x-t.x),t.walk+=e*6,x.hp-=t.dps*e,x.flash=.1;return}}}const a=n.keep,l=a.x+1.5,c=a.y+se.size;if(t.march&&Math.hypot(t.x-l,t.y-c)<this.castleReach+ll.charge&&(t.march=!1),this.plunders(t,s)){const x=this.villageFlow.next[s];if(x<0){t.attacking=!0,t.walk+=e*6,this.damageStructure(s,(((m=St[n.tiles[s].type])==null?void 0:m.trample)||0)*e);return}const[T,A]=this.center(x);if(n.isSolid(x)&&Math.max(Math.abs(T-t.x),Math.abs(A-t.y))<=.5+t.r+.08){t.attacking=!0,t.heading=Math.atan2(A-t.y,T-t.x),t.walk+=e*6,this.damageStructure(x,t.dps*t.siege*e);return}this.walkToward(t,T,A,s,e);return}let u=this.flowFor(t).next[s];if(s===a.step||u<0){if(Math.hypot(l-t.x,c-t.y)<=t.r+(a.doorHp>0?.3:.7)){if(t.type==="ladder")return this.splitCrew(t);if(t.type==="catapult")return;t.heading=Math.atan2(c-t.y,l-t.x),a.doorHp>0?(t.attacking=!0,t.walk+=e*6,a.doorHp=Math.max(0,a.doorHp-t.dps*t.siege*e),a.doorHp<=0&&(this.effects.push({type:"dust",x:l,y:c,z:.4,t:0,life:.9,size:.8}),this.sfx("crumble",l,c),this.emit("doorBroken"))):this.climbs(t)&&(t.gone=!0,this.intruders.push({type:t.type,hp:t.hp,maxHp:t.maxHp,dps:t.dps,gold:t.gold,climb:se.climb}),a.inside=this.intruders.length);return}this.walkToward(t,l,c,s,e);return}const[d,f]=this.center(u),g=n.tiles[u];if(n.isSolid(u)&&!(g.ladder&&this.climbs(t))&&Math.max(Math.abs(d-t.x),Math.abs(f-t.y))<=.5+t.r+.08){if(t.heading=Math.atan2(f-t.y,d-t.x),t.type==="catapult")return;if(t.type==="ladder"){if(g.ladder)return this.splitCrew(t);t.raising+=e,t.raising>=nn.raise&&this.raiseLadder(t,u);return}if(bc.includes(g.type)&&!i.siegeEngine){t.stuck+=e;return}t.attacking=!0,t.walk+=e*6;const T=(_=St[g.type])==null?void 0:_.thorns;T&&this.hurt(t,T*e,!1),this.damageStructure(u,t.dps*t.siege*e);return}t.stuck=0,this.walkToward(t,d,f,s,e);const M=n.idxAt(t.x,t.y),p=(v=St[n.tiles[M].type])==null?void 0:v.trample;p&&this.damageStructure(M,p*e)}plunders(t,e){return!this.climbs(t)||t.type==="bowman"||!this.villageFlow?!1:this.villageFlow.dist[e]<=Bh}walkToward(t,e,n,i,s){const o=e-t.x,a=n-t.y,l=Math.hypot(o,a)||1,h=(t.march?Math.min(t.speed,ll.pace):t.speed)*(this.world.tiles[i].ladder?nn.climb:this.world.slow(i)),u=Math.min(l,h*s);t.heading=Math.atan2(a,o),t.walk+=s*h*6,this.tryMove(t,o/l*u,a/l*u)}raiseLadder(t,e){const{world:n}=this,[i,s]=this.center(e),o=i-t.x,a=s-t.y,l=Math.abs(o)>=Math.abs(a)?[Math.sign(o),0]:[0,Math.sign(a)],c={id:this.nextId++,tile:e,dir:l,hp:nn.hp,maxHp:nn.hp};this.ladders.push(c),n.tiles[e].ladder=c,n.dirty=!0,this.sfx("build",i,s),this.splitCrew(t)}splitCrew(t){t.gone=!0,t.members.forEach((e,n)=>{const i=this.makeEnemy(e.type,t.x+(n-.5)*.25,t.y+(n-.5)*.25);i.hp=Math.max(1,Math.round(e.hp*(t.hp/t.maxHp))),i.maxHp=e.maxHp,i.z=t.z,this.enemies.push(i)})}ladderGeom(t){const{world:e}=this,[n,i]=this.center(t.tile),o=e.tiles[t.tile].type==="wall"?St.wall.thin/2:.5,a=n-t.dir[0]*o,l=i-t.dir[1]*o,c=e.surfaceAt(t.tile,a,l)+.12,h=a-t.dir[0]*.5,u=l-t.dir[1]*.5;return{fx:h,fy:u,fz:e.heightAt(h,u),tx:a,ty:l,tz:c}}updateLadders(t){const{world:e}=this;for(const n of this.ladders){const i=e.tiles[n.tile];nn.reach.includes(i.type)||(n.hp=0);const[s,o]=this.center(n.tile);for(const l of this.archers)!l.dead&&Math.abs(l.x-s)<1.4&&Math.abs(l.y-o)<1.4&&(n.hp-=nn.push*t);if(n.hp>0)continue;n.down=!0,i.ladder===n&&(i.ladder=null),e.dirty=!0;const a=this.ladderGeom(n);this.fallen.push({x:a.fx-n.dir[0]*.4,y:a.fy-n.dir[1]*.4,dir:n.dir}),this.sfx("crumble",s,o);for(const l of this.enemies)l.dead||l.gone||e.idxAt(l.x,l.y)!==n.tile||(l.x=a.fx-n.dir[0]*.2,l.y=a.fy-n.dir[1]*.2,this.hurt(l,25))}this.ladders=this.ladders.filter(n=>!n.down)}regroup(t){const e=this.enemies.filter(n=>!n.dead&&!n.gone&&n.stuck>.5&&(n.type==="raider"||n.type==="brute"));if(!(e.length<2))for(const n of e){if(n.gone)continue;const i=this.fallen.findIndex(a=>Math.hypot(a.x-n.x,a.y-n.y)<2);if(i<0&&n.stuck<nn.regroup)continue;const s=e.find(a=>a!==n&&!a.gone&&Math.hypot(a.x-n.x,a.y-n.y)<2.5);if(!s)continue;i>=0&&this.fallen.splice(i,1),n.gone=s.gone=!0;const o=this.makeEnemy("ladder",(n.x+s.x)/2,(n.y+s.y)/2);o.members=[n,s].map(a=>({type:a.type,hp:a.hp,maxHp:a.maxHp})),o.hp=n.hp+s.hp,o.maxHp=n.maxHp+s.maxHp,o.z=n.z,this.enemies.push(o)}}updateIntruders(t){const e=this.world.keep;for(const i of this.intruders)i.climb-=t;const n=this.intruders.filter(i=>i.climb<=0).slice(0,se.stair);if(n.length){const i=this.swordsmen.filter(o=>!o.dead&&o.up&&this.world.tiles[this.world.idxAt(o.x,o.y)].type==="keep"),s=(se.guard+i.length*$e.dps)/n.length*t;for(const[o,a]of n.entries()){const l=i[o%(i.length||1)];l?(l.hp-=a.dps*t,l.flash=.1,l.fighting=!0):e.hp=Math.max(0,e.hp-a.dps*t),a.hp-=s,a.hp<=0&&(a.dead=!0,this.gold+=a.gold,this.floaters.push({x:e.x+1.5,y:e.y+1.5,z:se.height+.3,text:`+${a.gold}`,t:0}),this.sfx("fall",e.x+1.5,e.y+1.5))}Math.random()<t*3&&this.sfx("clash",e.x+1.5,e.y+1.5)}this.intruders=this.intruders.filter(i=>!i.dead),e.inside=this.intruders.length}damageStructure(t,e){const n=this.world.tiles[t].type;if(this.world.damage(t,e)&&n!=="keep"){const[i,s]=this.center(t);this.effects.push({type:"dust",x:i,y:s,z:.3,t:0,life:.9,size:1}),this.sfx("crumble",i,s)}}separate(){const t=[...this.enemies,...this.swordsmen];for(let e=0;e<t.length;e++)for(let n=e+1;n<t.length;n++){const i=t[e],s=t[n];if(Math.abs(i.z-s.z)>.5)continue;const o=s.x-i.x,a=s.y-i.y,l=(i.r+s.r)*.85,c=o*o+a*a;if(c>=l*l||c===0)continue;const h=Math.sqrt(c),u=(l-h)*.25,d=o/h,f=a/h;this.tryMove(i,-d*u,-f*u),this.tryMove(s,d*u,f*u)}}updateTraps(t){const{world:e}=this;for(const n of this.enemies)e.tiles[e.idxAt(n.x,n.y)].type==="trap"&&this.hurt(n,St.trap.dps*t,!1)}hurt(t,e,n=!0){t.hp-=e,n&&(t.flash=.12),t.hp<=0&&(t.dead=!0)}pickTarget(t,e,n){const{world:i}=this;let s=null,o=1/0;for(const a of this.enemies){if(a.dead||(a.x-t)**2+(a.y-e)**2>n*n)continue;let l=this.flowFor(a).dist[i.idxAt(a.x,a.y)];isFinite(l)||(l=1e6),a.type==="catapult"&&(l-=20),l<o&&(o=l,s=a)}return s}coverFor(t){var e;return t.kind!=="archer"?1:(e=this.world.tiles[t.tile])!=null&&e.hoard?en.cover:Gh}hitChance(t,e){const n=Math.hypot(e.x-t.x,e.y-t.y),i=this.range(t.tile),s=Math.max(0,Math.min(1,(n-Ki.near)/Math.max(.5,i-Ki.near)));return Ki.close+(Ki.far-Ki.close)*s}shoot(t,e,n,i,s,o,a=1){const l=Math.hypot(i.x-t,i.y-e),c=this.rnd()>=a,h=c?.35+this.rnd()*.5:0,u=this.rnd()*Math.PI*2;this.projectiles.push({miss:c,kind:"arrow",hostile:o,sx:t,sy:e,sz:n,tx:i.x+Math.cos(u)*h,ty:i.y+Math.sin(u)*h,tz:c?this.world.heightAt(i.x,i.y):i.z+.4,x:t,y:e,z:n,px:t,py:e,pz:n,target:i,t:0,dur:Math.max(.15,l/Hh),dmg:s})}lob(t,e,n){const[i,s]=this.center(e),o=Math.hypot(i-t.x,s-t.y);this.projectiles.push({kind:"boulder",sx:t.x,sy:t.y,sz:t.z+.6,tx:i,ty:s,tz:this.world.surface(e),x:t.x,y:t.y,z:t.z+.6,px:t.x,py:t.y,pz:t.z+.6,tile:e,t:0,dur:.8+o*.12,dmg:n.boulder,splash:n.splash})}updateProjectiles(t){for(const e of this.projectiles){e.kind==="arrow"&&!e.miss&&!e.target.dead&&(e.tx=e.target.x,e.ty=e.target.y,e.tz=e.target.z+.4),e.t=Math.min(1,e.t+t/e.dur),e.px=e.x,e.py=e.y,e.pz=e.z,e.x=e.sx+(e.tx-e.sx)*e.t,e.y=e.sy+(e.ty-e.sy)*e.t;const n=e.kind==="boulder"?2.5+e.dur:Math.min(1.5,e.dur*2);if(e.z=e.sz+(e.tz-e.sz)*e.t+Math.sin(e.t*Math.PI)*n,!(e.t<1))if(e.done=!0,e.kind==="boulder"){this.damageStructure(e.tile,e.dmg);for(const i of this.archers)Math.hypot(i.x-e.tx,i.y-e.ty)<.9&&(i.hp-=e.splash*(this.world.tiles[i.tile].hoard?en.splash:1),i.flash=.15);this.effects.push({type:"dust",x:e.tx,y:e.ty,z:e.tz,t:0,life:.7,size:.8}),this.sfx("impact",e.tx,e.ty)}else e.miss||e.target.dead||(e.hostile?(e.target.hp-=e.dmg*this.coverFor(e.target),e.target.flash=.12):this.hurt(e.target,e.dmg),this.sfx("hit",e.tx,e.ty))}this.projectiles=this.projectiles.filter(e=>!e.done)}serialize(){const{world:t}=this;return{v:hl,seed:this.seed,map:t.snapshotMap(),wave:this.wave,gold:this.gold,types:t.tiles.map(e=>e.type==="tree"||e.type==="rock"||e.type==="grass"?"":e.type),hp:t.tiles.map(e=>Math.round(e.hp||0)),hoard:t.tiles.flatMap((e,n)=>e.hoard?[n]:[]),plots:t.tiles.flatMap((e,n)=>e.type==="plot"?[[n,e.plot]]:[]),archers:this.archers.map(e=>e.post),swordsmen:this.swordsmen.map(e=>({post:e.post,zone:e.zone})),savedAt:Date.now()}}static restore(t){if(!t||t.v!==hl)throw new Error("unsupported save");const e=new Mr(t.seed,t.map),{world:n}=e;e.archers=[],n.tiles.forEach((i,s)=>{const o=t.types[s];o&&o!=="keep"&&o!=="plot"?(n.build(s,o),i.hp=Math.min(i.maxHp,t.hp[s]||i.maxHp)):o!=="keep"&&i.type==="plot"&&n.clear(s)});for(const i of t.hoard)n.tiles[i].hoard=!0;for(const[i,s]of t.plots)n.tiles[i].type="plot",n.tiles[i].plot=s;for(const i of t.archers)e.addArcher(i);e.gold=0;for(const i of t.swordsmen)e.gold=$e.cost,e.placeSwordsman(i.post)&&(e.swordsmen[e.swordsmen.length-1].zone=i.zone);return e.gold=t.gold,e.wave=t.wave,e.sounds.length=0,n.dirty=!0,e.repath(),e}}const Po=Math.PI/180,Wn={elev:90*Po,theta:0},Ur={elev:30*Po,theta:45*Po};let jh=class{constructor(t,e){this.mapW=t,this.mapH=e,this.fx=t/2,this.fy=e/2,this.zoom=1.2,this.minZoom=.4,this.maxZoom=3.5,this.mode="top",this.elev=Wn.elev,this.theta=Wn.theta,this.targetElev=Wn.elev,this.targetTheta=Wn.theta,this.vw=1,this.vh=1,this.sx=0,this.sy=0,this.updateTrig()}setViewport(t,e){this.vw=t,this.vh=e}setMode(t){t!==this.mode&&(this.mode=t,t==="top"?(this.targetTheta=Math.round(this.theta/(2*Math.PI))*2*Math.PI,this.targetElev=Wn.elev):(this.targetTheta=this.theta+Ur.theta,this.targetElev=Ur.elev))}rotateBy(t){this.mode==="iso"&&(this.targetTheta+=t)}twist(t){this.mode==="iso"&&(this.theta+=t,this.targetTheta+=t)}get transitioning(){return Math.abs(this.elev-this.targetElev)>.002||Math.abs(this.theta-this.targetTheta)>.002}update(t){const e=1-Math.exp(-t*7);this.elev+=(this.targetElev-this.elev)*e,this.theta+=(this.targetTheta-this.theta)*e,this.transitioning||(this.elev=this.targetElev,this.theta=this.targetTheta),this.updateTrig()}updateTrig(){this.cosT=Math.cos(this.theta),this.sinT=Math.sin(this.theta),this.sinE=Math.sin(this.elev),this.cosE=Math.cos(this.elev),this.k=Pr*this.zoom}get tilt(){return(Wn.elev-this.elev)/(Wn.elev-Ur.elev)}P(t,e,n=0){const i=t-this.fx,s=e-this.fy,o=i*this.cosT-s*this.sinT,a=i*this.sinT+s*this.cosT;this.sx=this.vw/2+o*this.k,this.sy=this.vh/2+(a*this.sinE-n*this.cosE)*this.k}depth(t,e){return(t-this.fx)*this.sinT+(e-this.fy)*this.cosT}faceVisible(t,e){return this.cosE>.01&&t*this.sinT+e*this.cosT>.001}unproject(t,e){const n=(t-this.vw/2)/this.k,i=(e-this.vh/2)/this.k/this.sinE;return{x:this.fx+n*this.cosT+i*this.sinT,y:this.fy-n*this.sinT+i*this.cosT}}panBy(t,e){const n=this.unproject(0,0),i=this.unproject(t,e);this.fx-=i.x-n.x,this.fy-=i.y-n.y,this.clampFocus()}zoomAt(t,e,n){const i=this.unproject(e,n);this.zoom=Math.min(this.maxZoom,Math.max(this.minZoom,this.zoom*t)),this.updateTrig();const s=this.unproject(e,n);this.fx+=i.x-s.x,this.fy+=i.y-s.y,this.clampFocus()}clampFocus(){this.fx=Math.min(this.mapW,Math.max(0,this.fx)),this.fy=Math.min(this.mapH,Math.max(0,this.fy))}fit(t=160,e=90){const n=(this.vw-t)/(this.mapW*Pr),i=(this.vh-e)/(this.mapH*Pr);return this.minZoom=Math.min(.4,Math.min(n,i)*.8),Math.min(n,i)}};const xe=128;function Ca(r){let t=r;return()=>(t=t*16807%2147483647,t/2147483647)}function un([r,t,e],n){return`rgb(${Math.min(255,r*n)|0},${Math.min(255,t*n)|0},${Math.min(255,e*n)|0})`}function Rc(r,t,e,n,i,s){for(let o=0;o<e;o++)r.fillStyle=un(n,i+t()*(s-i)),r.fillRect(t()*xe,t()*xe,1+t()*2,1+t()*2)}const bn={};function Cc(){if(bn.stone)return bn.stone;const r=document.createElement("canvas");r.width=r.height=xe;const t=r.getContext("2d"),e=Ca(4242),n=[190,182,164];t.fillStyle=un(n,.62),t.fillRect(0,0,xe,xe);const i=4,s=xe/i;for(let o=0;o<i;o++){let a=o%2?-xe/6:0;for(;a<xe;){const l=xe*(.26+e()*.16),c=.86+e()*.24;for(const h of[0,xe]){const u=a-h;t.fillStyle=un(n,c),t.fillRect(u+1.5,o*s+1.5,l-3,s-3),t.fillStyle=un(n,c*1.12),t.fillRect(u+1.5,o*s+1.5,l-3,2),t.fillStyle=un(n,c*.8),t.fillRect(u+1.5,o*s+s-3.5,l-3,2)}a+=l}}return Rc(t,e,420,n,.7,1.15),bn.stone=r,r}function Jh(){if(bn.flag)return bn.flag;const r=document.createElement("canvas");r.width=r.height=xe;const t=r.getContext("2d"),e=Ca(777),n=[184,176,158];t.fillStyle=un(n,.6),t.fillRect(0,0,xe,xe);const i=3,s=xe/i;for(let o=0;o<i;o++)for(let a=0;a<i;a++){const l=.85+e()*.25,c=()=>(e()-.5)*6;t.fillStyle=un(n,l),t.beginPath(),t.moveTo(a*s+2+c(),o*s+2+c()),t.lineTo((a+1)*s-2+c(),o*s+2+c()),t.lineTo((a+1)*s-2+c(),(o+1)*s-2+c()),t.lineTo(a*s+2+c(),(o+1)*s-2+c()),t.closePath(),t.fill()}return Rc(t,e,300,n,.72,1.12),bn.flag=r,r}function Pc(){if(bn.wood)return bn.wood;const r=document.createElement("canvas");r.width=r.height=xe;const t=r.getContext("2d"),e=Ca(99),n=[150,102,58],i=6,s=xe/i;for(let o=0;o<i;o++){const a=.85+e()*.25;t.fillStyle=un(n,a),t.fillRect(o*s,0,s,xe);for(let l=0;l<6;l++)t.fillStyle=un(n,a*(.8+e()*.15)),t.fillRect(o*s+e()*s,0,1,xe);t.fillStyle=un(n,.55),t.fillRect(o*s,0,1.5,xe)}return bn.wood=r,r}const ul=xe,Lo={stone:182,flag:176,wood:108},pt={grass:[[76,114,53],[80,119,56],[73,109,51],[83,123,58]],hillTop:[[96,132,62],[101,138,66]],hillSide:[120,96,64],marsh:[[78,92,52],[72,86,48]],shallows:[92,140,138],water:[44,92,128],moat:[38,78,110],moatEdge:[96,84,66],reed:[120,132,70],wall:{side:[138,132,118],top:[176,168,151]},thick:{side:[128,122,108],top:[170,161,143],walk:[146,139,124]},tower:{side:[125,118,104],top:[170,161,143]},keep:{side:[112,106,95],top:[158,149,132]},palisade:{side:[128,90,52],top:[162,120,74]},pike:[140,100,60],pikeTip:[226,214,186],door:[112,72,40],ladder:[168,124,74],lord:[120,48,120],crown:[236,196,70],bowman:[74,96,52],catapult:[128,92,54],boulder:[128,124,116],shield:[178,146,62],hoard:[122,84,46],plaster:[222,204,168],roof:[150,72,50],soil:[118,88,56],crop:[196,176,74],sprout:[112,150,60],awning:[182,58,48],awningAlt:[236,224,196],rock:{side:[110,108,102],top:[150,147,140]},trunk:[92,60,32],leaf:[44,98,42],leafHi:[62,124,52],dirt:[110,86,58],raider:[205,92,30],brute:[140,40,44],ram:[118,82,48],skin:[226,184,140],banner:[196,48,40],player:[52,92,170]},Pi=(()=>{const e=Math.hypot(-.55,.83);return[-.55/e,.83/e]})(),fi=[[0,-1],[1,0],[0,1],[-1,0]],Nr=new Set(["palisade","wall","thick","gate","tower","keep"]);function kt(r,t=1,e=1){const n=Math.min(255,r[0]*t)|0,i=Math.min(255,r[1]*t)|0,s=Math.min(255,r[2]*t)|0;return e===1?`rgb(${n},${i},${s})`:`rgba(${n},${i},${s},${e})`}function he(r,t){return[r[0]*t,r[1]*t,r[2]*t]}const dl=r=>.3*r[0]+.59*r[1]+.11*r[2];function Cs(r,t){return .62+.3*Math.max(0,r*Pi[0]+t*Pi[1])}const Qh=[[0,-1,0,1],[1,0,1,2],[0,1,2,3],[-1,0,3,0]];class tu{constructor(t,e){this.canvas=t,this.ctx=t.getContext("2d"),this.cam=e,this.dpr=1}resize(){const t=Math.min(2,window.devicePixelRatio||1),e=window.innerWidth,n=window.innerHeight;this.canvas.width=Math.round(e*t),this.canvas.height=Math.round(n*t),this.canvas.style.width=`${e}px`,this.canvas.style.height=`${n}px`,this.dpr=t,this.cam.setViewport(e,n)}poly(t){const{ctx:e,cam:n}=this;e.beginPath();for(let i=0;i<t.length;i+=3)n.P(t[i],t[i+1],t[i+2]),i===0?e.moveTo(n.sx,n.sy):e.lineTo(n.sx,n.sy);e.closePath()}box(t,e,n,i,s,o,a,l,c=0,h=!0,u=null){const{ctx:d,cam:f}=this,g=[t,n,n,t],M=[e,e,i,i],p=typeof s=="function"?g.map((x,T)=>s(x,M[T])):[s,s,s,s],m=typeof o=="function"?g.map((x,T)=>o(x,M[T])):[o,o,o,o],_=u?Lo[u]:0;if(f.cosE>.01)for(let x=0;x<4;x++){if(c&1<<x)continue;const[T,A,E,P]=Qh[x];f.faceVisible(T,A)&&(this.poly([g[E],M[E],p[E],g[P],M[P],p[P],g[P],M[P],m[P],g[E],M[E],m[E]]),u?this.texFace(g[E],M[E],g[P],M[P],u,Cs(T,A)*dl(a)/_):(d.fillStyle=kt(a,Cs(T,A)),d.fill()))}this.poly([t,e,m[0],n,e,m[1],n,i,m[2],t,i,m[3]]);const v=(m[0]+m[1]+m[2]+m[3])/4;u?this.texTop(v,u==="wood"?"wood":"flag",dl(l)/Lo[u==="wood"?"wood":"flag"]):(d.fillStyle=kt(l),d.fill()),h&&(d.strokeStyle="rgba(30,24,16,0.35)",d.lineWidth=1,d.stroke())}pattern(t){if(this.patterns||(this.patterns={}),!this.patterns[t]){const e=t==="stone"?Cc():t==="flag"?Jh():Pc();this.patterns[t]=this.ctx.createPattern(e,"repeat")}return this.patterns[t]}texFace(t,e,n,i,s,o){const{ctx:a,cam:l}=this,c=Math.hypot(n-t,i-e);if(c<1e-6)return;l.P(t,e,0);const h=l.sx,u=l.sy;l.P(n,i,0);const d=(l.sx-h)/c,f=(l.sy-u)/c;l.P(t,e,-1);const g=l.sx-h,M=l.sy-u,p=(t*(n-t)+e*(i-e))/c,m=this.dpr/ul;a.save(),a.setTransform(d*m,f*m,g*m,M*m,this.dpr*(h-d*p),this.dpr*(u-f*p)),a.fillStyle=this.pattern(s),a.fill(),a.restore(),this.shadeFill(o)}texTop(t,e,n){const{ctx:i,cam:s}=this,o=s.k,a=s.cosT*o,l=s.sinT*s.sinE*o,c=-s.sinT*o,h=s.cosT*s.sinE*o,u=s.vw/2-(s.fx*a+s.fy*c),d=s.vh/2-(s.fx*l+s.fy*h)-t*s.cosE*o,f=this.dpr/ul;i.save(),i.setTransform(a*f,l*f,c*f,h*f,this.dpr*u,this.dpr*d),i.fillStyle=this.pattern(e),i.fill(),i.restore(),this.shadeFill(n)}shadeFill(t){const e=Math.max(0,Math.min(.85,1-t));e<.01||(this.ctx.fillStyle=`rgba(16,12,8,${e.toFixed(3)})`,this.ctx.fill())}orientedBox(t,e,n,i,s,o,a,l,c){const{ctx:h,cam:u}=this,d=Math.cos(s),f=Math.sin(s),M=[[n,-i],[n,i],[-n,i],[-n,-i]].map(([p,m])=>[t+p*d-m*f,e+p*f+m*d]);for(let p=0;p<4;p++){const m=M[p],_=M[(p+1)%4];let v=_[1]-m[1],x=-(_[0]-m[0]);const T=Math.hypot(v,x);v/=T,x/=T,u.faceVisible(v,x)&&(this.poly([m[0],m[1],o,_[0],_[1],o,_[0],_[1],a,m[0],m[1],a]),h.fillStyle=kt(l,Cs(v,x)),h.fill())}this.poly(M.flatMap(([p,m])=>[p,m,a])),h.fillStyle=kt(c),h.fill(),h.strokeStyle="rgba(30,20,10,0.4)",h.stroke()}ellipse(t,e,n,i,s){const{ctx:o,cam:a}=this;a.P(t,e,n),o.beginPath(),o.ellipse(a.sx,a.sy,i*a.k,i*a.k*a.sinE,0,0,Math.PI*2),o.fillStyle=s,o.fill()}ball(t,e,n,i,s,o){const{ctx:a,cam:l}=this;l.P(t,e,n),a.beginPath(),a.arc(l.sx,l.sy,Math.max(.5,i*l.k),0,Math.PI*2),a.fillStyle=s,a.fill(),o&&(a.strokeStyle=o,a.lineWidth=Math.max(1,l.k*.03),a.stroke())}line(t,e,n,i,s,o,a,l){const{ctx:c,cam:h}=this;c.beginPath(),h.P(t,e,n),c.moveTo(h.sx,h.sy),h.P(i,s,o),c.lineTo(h.sx,h.sy),c.strokeStyle=a,c.lineWidth=l,c.stroke()}pathQuad(t,e,n,i,s=0){const{ctx:o,cam:a}=this;a.P(t,e,s),o.moveTo(a.sx,a.sy),a.P(n,e,s),o.lineTo(a.sx,a.sy),a.P(n,i,s),o.lineTo(a.sx,a.sy),a.P(t,i,s),o.lineTo(a.sx,a.sy),o.closePath()}onScreen(t,e,n=3){const{cam:i}=this;i.P(t,e,0);const s=n*i.k;return i.sx>-s&&i.sx<i.vw+s&&i.sy>-s*1.5&&i.sy<i.vh+s}render(t,e){const{ctx:n,cam:i}=this,{world:s}=t;n.setTransform(this.dpr,0,0,this.dpr,0,0);const o=n.createLinearGradient(0,0,0,i.vh);o.addColorStop(0,"#1d2a22"),o.addColorStop(1,"#0f1712"),n.fillStyle=o,n.fillRect(0,0,i.vw,i.vh),this.drawGround(s,t.time),e.showGrid&&this.cam.sinE>.97&&this.drawGrid(s),this.drawSpawns(t),e.orders&&this.drawOrders(t,e.orders);const a=new Map,l=(h,u)=>{const d=s.idxAt(h.x,h.y);a.has(d)||a.set(d,[]),a.get(d).push({u:h,kind:u})};for(const h of t.enemies)l(h,0);for(const h of t.archers)l(h,1);for(const h of t.swordsmen)l(h,2);this.openGates=new Set(t.swordsmen.map(h=>s.idxAt(h.x,h.y))),this.barred=t.gateLocks;const c=[];for(let h=0;h<s.tiles.length;h++){if(!(s.tiles[h].type!=="grass"||this.slopes[h]||a.has(h)))continue;const f=h%s.w,g=h/s.w|0;this.onScreen(f+.5,g+.5)&&c.push({d:i.depth(f+.5,g+.5),i:h,x:f,y:g})}for(const h of t.ladders){const u=t.ladderGeom(h);c.push({d:i.depth((u.fx+u.tx)/2,(u.fy+u.ty)/2),ladder:u})}for(const h of t.fallen)c.push({d:i.depth(h.x,h.y)-.01,fallen:h});c.sort((h,u)=>h.d-u.d);for(const{i:h,x:u,y:d,ladder:f,fallen:g}of c){if(f){this.drawLadder(f.fx,f.fy,f.fz,f.tx,f.ty,f.tz);continue}if(g){const _=s.heightAt(g.x,g.y)+.03,[v,x]=g.dir;this.drawLadder(g.x+v*.55,g.y+x*.55,_,g.x-v*.55,g.y-x*.55,_);continue}const M=s.groundElev(h);this.slopes[h]&&this.drawSlope(s,h,u,d);const p=s.tiles[h];this.footZ=p.rock?s.baseElev(h):null,this.minFoot=s.minGround(h),p.rock&&this.drawFoundation(u,d,M,this.footZ,p.v),this.drawTile(s,h,u,d,M,t.time),this.footZ=null;const m=a.get(h);if(m){m.sort((_,v)=>i.depth(_.u.x,_.u.y)-i.depth(v.u.x,v.u.y));for(const{u:_,kind:v}of m)v===0?this.drawEnemy(_,t.time):v===1?this.drawArcher(_,t.time):this.drawSwordsman(_)}}for(const h of t.projectiles)h.kind==="boulder"?this.drawBoulder(h):this.drawArrow(h);for(const h of t.effects)this.drawEffect(h);e.preview&&this.drawPreview(t,e.preview),this.drawBars(t),this.drawPlotTags(t),this.drawFloaters(t)}renderOverlay(t,e){const{ctx:n,cam:i}=this,{world:s}=t;n.setTransform(this.dpr,0,0,this.dpr,0,0),n.clearRect(0,0,i.vw,i.vh),e.showGrid&&this.cam.sinE>.97&&this.drawGrid(s),e.orders&&this.drawOrders(t,e.orders);for(const o of t.effects)this.drawEffect(o);e.preview&&this.drawPreview(t,e.preview),this.drawBars(t),this.drawPlotTags(t),this.drawFloaters(t)}groundColor(t){const e=Math.floor(t.v*4);switch(t.terrain){case"marsh":return pt.marsh[e&1];case"shallows":return pt.shallows;case"water":return pt.water;default:return pt.grass[e]}}drawGround(t,e){const{ctx:n}=this,{w:i,h:s}=t,o=t.tiles.map(p=>p.terrain[0]+p.type+(p.rock?"r":"")).join(",");if(o!==this.groundSig){this.groundSig=o,this.bakeGround(t),this.slopes=new Uint8Array(t.tiles.length);for(let p=0;p<t.tiles.length;p++)this.slopes[p]=t.sloped(p)?1:0;this.groundPattern=null}const{cam:a}=this,l=a.k,c=a.cosT*l,h=a.sinT*a.sinE*l,u=-a.sinT*l,d=a.cosT*a.sinE*l,f=a.vw/2-(a.fx*c+a.fy*u),g=a.vh/2-(a.fx*h+a.fy*d),M=this.dpr;n.save(),n.setTransform(M*c,M*h,M*u,M*d,M*f,M*g),n.imageSmoothingEnabled=!0,n.drawImage(this.groundCanvas,0,0,i,s),n.restore(),n.beginPath();for(let p=0;p<t.tiles.length;p++){const m=t.tiles[p];if(m.terrain!=="water"&&m.terrain!=="shallows"&&m.type!=="moat")continue;const _=p%i,v=p/i|0,x=(e*.4+m.v*7)%1,T=v+.2+x*.6,A=_+.2+m.v*.3;this.cam.P(A,T),n.moveTo(this.cam.sx,this.cam.sy),this.cam.P(A+.3,T),n.lineTo(this.cam.sx,this.cam.sy)}n.strokeStyle="rgba(200,230,255,0.25)",n.lineWidth=Math.max(1,l*.04),n.stroke();for(let p=0;p<t.tiles.length;p++){const m=t.tiles[p];if(m.terrain!=="marsh"||m.type!=="grass")continue;const _=p%i,v=p/i|0;for(let x=0;x<3;x++){const T=_+.2+m.v*(x+3)*7%.6,A=v+.2+m.v*(x+5)*11%.6;this.line(T,A,0,T+.03,A,.3,kt(pt.reed),Math.max(1,l*.035))}}}shadowCasters(t){const e=[],n=t.keep;for(let i=0;i<t.tiles.length;i++){const s=t.tiles[i],o=i%t.w,a=i/t.w|0,l=(c,h,u,d,f)=>e.push([o+c,a+h,o+u,a+d,f]);switch(s.type){case"palisade":case"wall":{const c=St[s.type],h=c.thin/2;l(.5-h,.5-h,.5+h,.5+h,c.height),this.connects(t,o,a,0)&&l(.5-h,0,.5+h,.5,c.height),this.connects(t,o,a,1)&&l(.5,.5-h,1,.5+h,c.height),this.connects(t,o,a,2)&&l(.5-h,.5,.5+h,1,c.height),this.connects(t,o,a,3)&&l(0,.5-h,.5,.5+h,c.height);break}case"thick":case"gate":l(0,0,1,1,St[s.type].height);break;case"tower":l(.04,.04,.96,.96,St.tower.height);break;case"keep":o===n.x&&a===n.y&&e.push([o,a,o+3,a+3,se.height]);break;case"tree":l(.25,.25,.75,.75,1.3);break;case"rock":l(.15,.2,.85,.85,.5);break;case"cottage":l(.18,.24,.82,.76,.8);break;case"market":l(.12,.2,.88,.8,.9);break;case"pikes":l(.1,.3,.9,.7,.45);break}}return e}bakeGround(t){const{w:n,h:i}=t;this.groundW=n;const s=this.groundCanvas||(this.groundCanvas=document.createElement("canvas"));s.width=n*24,s.height=i*24;const o=s.getContext("2d");let a=1;const l=()=>(a=a*16807%2147483647,a/2147483647);for(let f=0;f<t.tiles.length;f++){const g=t.tiles[f],M=f%n*24,p=(f/n|0)*24,m=g.type==="moat"?pt.moatEdge:g.terrain==="hill"?pt.hillTop[0]:this.groundColor(g);if(o.fillStyle=kt(m),o.fillRect(M,p,24,24),a=f*7919+13,g.terrain==="water"||g.terrain==="shallows"){for(let _=0;_<3;_++)o.fillStyle=kt(m,1.08+l()*.1,.5),o.fillRect(M+l()*24,p+l()*24,4+l()*6,1);continue}for(let _=0;_<16;_++){o.fillStyle=kt(m,.8+l()*.38);const v=1+l()*2;o.fillRect(M+l()*24,p+l()*24,v,v)}if(g.terrain==="grass"&&g.type!=="moat"){o.strokeStyle=kt(m,1.22),o.lineWidth=1,o.beginPath();for(let _=0;_<5;_++){const v=M+l()*24,x=p+l()*24;o.moveTo(v,x),o.lineTo(v-1+l()*2,x-3-l()*2)}o.stroke()}else if(g.terrain==="marsh")for(let _=0;_<2;_++)o.fillStyle="rgba(40,60,50,0.35)",o.beginPath(),o.ellipse(M+l()*24,p+l()*24,2+l()*4,1.5+l()*2,0,0,Math.PI*2),o.fill()}o.fillStyle=kt(pt.moat);for(let f=0;f<t.tiles.length;f++){if(t.tiles[f].type!=="moat")continue;const g=f%n,M=f/n|0,p=(A,E)=>{if(!t.inBounds(g+A,M+E))return!1;const P=t.tiles[t.idx(g+A,M+E)];return P.type==="moat"||P.terrain==="water"||P.terrain==="shallows"},m=.14,_=p(-1,0)?g:g+m,v=p(0,-1)?M:M+m,x=p(1,0)?g+1:g+1-m,T=p(0,1)?M+1:M+1-m;o.fillRect(_*24,v*24,(x-_)*24,(T-v)*24)}const c=this.shadowCanvas||(this.shadowCanvas=document.createElement("canvas"));c.width=s.width,c.height=s.height;const h=c.getContext("2d");h.clearRect(0,0,c.width,c.height),h.fillStyle="#000";const u=-Pi[0]*.45,d=-Pi[1]*.45;for(const[f,g,M,p,m]of this.shadowCasters(t)){for(let _=0;_<=1.001;_+=.2){const v=u*m*_,x=d*m*_;h.fillRect((f+v)*24,(g+x)*24,(M-f)*24,(p-g)*24)}h.fillRect((f-.08)*24,(g-.08)*24,(M-f+.16)*24,(p-g+.16)*24)}o.save(),o.globalAlpha=.045;for(let f=-2;f<=2;f++)for(let g=-2;g<=2;g++)o.drawImage(c,g*2,f*2);o.restore()}drawGrid(t){const{ctx:e,cam:n}=this;e.beginPath();for(let i=0;i<=t.w;i++)n.P(i,0),e.moveTo(n.sx,n.sy),n.P(i,t.h),e.lineTo(n.sx,n.sy);for(let i=0;i<=t.h;i++)n.P(0,i),e.moveTo(n.sx,n.sy),n.P(t.w,i),e.lineTo(n.sx,n.sy);e.strokeStyle="rgba(255,255,255,0.07)",e.lineWidth=1,e.stroke(),e.beginPath();for(let i=0;i<t.tiles.length;i++)t.reserved[i]&&this.pathQuad(i%t.w,i/t.w|0,i%t.w+1,(i/t.w|0)+1);e.fillStyle="rgba(200,60,40,0.12)",e.fill()}drawSpawns(t){const e=t.activeSpawns(t.wave+1),n=.5+.5*Math.sin(t.time*4);for(const i of t.world.spawns){const s=e.includes(i),o=i.x+.5,a=i.y+.5;s&&this.ellipse(o,a,0,.7+n*.15,`rgba(220,60,40,${.18+n*.12})`),this.line(o,a,0,o,a,1.6,"#3a2a1a",Math.max(1.5,this.cam.k*.06)),this.poly([o,a,1.6,o+.55,a,1.45,o,a,1.15]),this.ctx.fillStyle=s?kt(pt.banner):"rgba(120,110,100,0.8)",this.ctx.fill(),this.cam.cosE<.05&&this.ball(o,a,0,.22,s?kt(pt.banner):"#777","#2a1a10")}}drawSlope(t,e,n,i){const s=t.groundElev(e),o=[(s+t.groundAt(n,i-1))/2,(s+t.groundAt(n+1,i))/2,(s+t.groundAt(n,i+1))/2,(s+t.groundAt(n-1,i))/2],a=[t.cornerHeight(n,i),t.cornerHeight(n+1,i),t.cornerHeight(n+1,i+1),t.cornerHeight(n,i+1)],l=[[n,i,a[0]],[n+.5,i,o[0]],[n+1,i,a[1]],[n+1,i+.5,o[1]],[n+1,i+1,a[2]],[n+.5,i+1,o[2]],[n,i+1,a[3]],[n,i+.5,o[3]]];if(l.every(h=>h[2]===s)){if(s===0)return;this.groundTri([n,i,s],[n+1,i,s],[n+1,i+1,s],[n,i+1,s]);return}const c=[n+.5,i+.5,s];for(let h=0;h<8;h++)this.groundTri(c,l[h],l[(h+1)%8])}groundTri(...t){const{ctx:e,cam:n}=this,i=t.map(([K,V,ut])=>(n.P(K,V,ut),[n.sx,n.sy])),[s,o,a]=t,[l,c,h]=i,u=(o[0]-s[0])*(a[1]-s[1])-(a[0]-s[0])*(o[1]-s[1]);if(Math.abs(u)<1e-9)return;const d=((c[0]-l[0])*(a[1]-s[1])-(h[0]-l[0])*(o[1]-s[1]))/u,f=((h[0]-l[0])*(o[0]-s[0])-(c[0]-l[0])*(a[0]-s[0]))/u,g=((c[1]-l[1])*(a[1]-s[1])-(h[1]-l[1])*(o[1]-s[1]))/u,M=((h[1]-l[1])*(o[0]-s[0])-(c[1]-l[1])*(a[0]-s[0]))/u,p=l[0]-d*s[0]-f*s[1],m=l[1]-g*s[0]-M*s[1];let _=0,v=0;for(const K of i)_+=K[0]/i.length,v+=K[1]/i.length;e.beginPath(),i.forEach(([K,V],ut)=>{const dt=K-_,ft=V-v,qt=Math.hypot(dt,ft)||1,Kt=K+dt/qt*.6,X=V+ft/qt*.6;ut===0?e.moveTo(Kt,X):e.lineTo(Kt,X)}),e.closePath(),this.groundPattern||(this.groundPattern=e.createPattern(this.groundCanvas,"no-repeat"));const x=this.groundCanvas.width/this.groundW,T=this.dpr/x;e.save(),e.setTransform(d*T,g*T,f*T,M*T,this.dpr*p,this.dpr*m),e.fillStyle=this.groundPattern,e.fill(),e.restore();const A=o[0]-s[0],E=o[1]-s[1],P=o[2]-s[2],N=a[0]-s[0],y=a[1]-s[1],w=a[2]-s[2];let k=E*w-P*y,F=P*N-A*w,G=A*y-E*N;const Y=Math.hypot(k,F,G)||1;G<0&&(k=-k,F=-F);const z=(k*Pi[0]+F*Pi[1])/Y*.9;Math.abs(z)>.01&&(e.fillStyle=z>0?`rgba(255,248,220,${(z*.35).toFixed(3)})`:`rgba(12,18,8,${(-z*.75).toFixed(3)})`,e.fill())}hiddenSides(t,e,n,i){let s=0;for(let o=0;o<4;o++){const a=e+fi[o][0],l=n+fi[o][1];if(!t.inBounds(a,l))continue;const c=t.idx(a,l);eu(t.tiles[c])+t.elev(c)>=i+t.elev(t.idx(e,n))&&(s|=1<<o)}return s}connects(t,e,n,i){const s=e+fi[i][0],o=n+fi[i][1];return t.inBounds(s,o)&&Nr.has(t.tiles[t.idx(s,o)].type)}thinWall(t,e,n,i,s,o,a,l,c=!1,h=null){const u=o/2,d=e+.5,f=n+.5,g=[[d-u,f-u,d+u,f+u]];this.connects(t,e,n,0)&&g.push([d-u,n,d+u,f-u]),this.connects(t,e,n,1)&&g.push([d+u,f-u,e+1,f+u]),this.connects(t,e,n,2)&&g.push([d-u,f+u,d+u,n+1]),this.connects(t,e,n,3)&&g.push([e,f-u,d-u,f+u]);const M=this.cam;g.sort((P,N)=>M.depth((P[0]+P[2])/2,(P[1]+P[3])/2)-M.depth((N[0]+N[2])/2,(N[1]+N[3])/2));const p=(P,N)=>(Math.abs(P-d)>=Math.abs(N-f)?t.heightAt(P,f):t.heightAt(d,N))+s,m=this.footZ??((P,N)=>t.heightAt(P,N));for(const P of g)this.box(P[0],P[1],P[2],P[3],m,p,he(a.side,l),he(a.top,l),0,!1,h);if(!c)return;const _=[],v=.06,[x,T,A,E]=g.find(P=>Math.abs(P[2]-P[0]-o)<1e-6&&Math.abs(P[3]-P[1]-o)<1e-6);this.connects(t,e,n,0)||_.push([x,T,A,T+v]),this.connects(t,e,n,1)||_.push([A-v,T,A,E]),this.connects(t,e,n,2)||_.push([x,E-v,A,E]),this.connects(t,e,n,3)||_.push([x,T,x+v,E]);for(const[P,N,y,w]of g){if(P===x&&N===T&&y===A&&w===E)continue;const k=y-P>w-N+1e-6;w-N>y-P+1e-6||_.push([P,N,y,N+v],[P,w-v,y,w]),k||_.push([P,N,P+v,w],[y-v,N,y,w])}this.rails(_,p)}rails(t,e){const n=this.cam,i=typeof e=="function"?e:()=>e;t.sort((s,o)=>n.depth((s[0]+s[2])/2,(s[1]+s[3])/2)-n.depth((o[0]+o[2])/2,(o[1]+o[3])/2));for(const s of t)this.box(s[0],s[1],s[2],s[3],i,(o,a)=>i(o,a)+.3,pt.hoard,he(pt.hoard,1.25),0,!0)}edgeRails(t,e,n,i,s,o){const l=[];o&1&&l.push([t,e,n,e+.07]),o&2&&l.push([n-.07,e,n,i]),o&4&&l.push([t,i-.07,n,i]),o&8&&l.push([t,e,t+.07,i]),this.rails(l,s)}drawTile(t,e,n,i,s,o){const a=t.tiles[e],c=1-(a.maxHp?1-a.hp/a.maxHp:0)*.35;switch(a.type){case"palisade":{const h=St.palisade;this.thinWall(t,n,i,s,h.height,h.thin,pt.palisade,c,!1,"wood");break}case"wall":{const h=St.wall;this.thinWall(t,n,i,s,h.height,h.thin,pt.wall,c,a.hoard,"stone");break}case"thick":{const h=St.thick.height,u=pt.thick,d=(M,p)=>t.heightAt(M,p)+h,f=this.footZ??((M,p)=>t.heightAt(M,p));this.box(n,i,n+1,i+1,f,d,he(u.side,c),he(u.top,c),this.hiddenSides(t,n,i,h),!1,"stone"),this.poly([n+.24,i+.24,d(n+.24,i+.24),n+.76,i+.24,d(n+.76,i+.24),n+.76,i+.76,d(n+.76,i+.76),n+.24,i+.76,d(n+.24,i+.76)]),this.ctx.fillStyle="rgba(0,0,0,0.1)",this.ctx.fill();let g=0;for(let M=0;M<4;M++)this.connects(t,n,i,M)||(g|=1<<M);a.hoard?this.edgeRails(n,i,n+1,i+1,d,g):this.merlons(n,i,n+1,i+1,d,u,g);break}case"tower":{const h=St.tower.height,u=pt.tower;this.box(n+.04,i+.04,n+.96,i+.96,this.footZ??this.minFoot??s,s+h,he(u.side,c),he(u.top,c),0,!0,"stone"),a.hoard?this.edgeRails(n+.04,i+.04,n+.96,i+.96,s+h,15):this.merlons(n+.04,i+.04,n+.96,i+.96,s+h,u,15);break}case"keep":{const h=t.keep,u=se.height,d=pt.keep;this.box(n,i,n+1,i+1,s,s+u,d.side,d.top,this.hiddenSides(t,n,i,u),!1,"stone");const f=Math.max(n,h.x+.4),g=Math.max(i,h.y+.4),M=Math.min(n+1,h.x+2.6),p=Math.min(i+1,h.y+2.6);this.poly([f,g,s+u,M,g,s+u,M,p,s+u,f,p,s+u]),this.ctx.fillStyle="rgba(0,0,0,0.12)",this.ctx.fill();let m=0;i===h.y&&(m|=1),n===h.x+2&&(m|=2),i===h.y+2&&(m|=4),n===h.x&&(m|=8),this.merlons(n,i,n+1,i+1,s+u,d,m),e===h.door&&this.drawKeepDoor(h,n,i,s),n===h.x+1&&i===h.y+1&&(this.flag(n+.5,i+.5,s+u,o),this.drawLord(n+.85,i+.8,s+u,h));break}case"pikes":this.drawPikes(t,n,i,this.footZ??s,c);break;case"stair":this.drawStair(t,e,n,i);break;case"gate":this.drawGate(t,e,n,i,s,c);break;case"cottage":this.drawCottage(n,i,s,c);break;case"farm":this.drawFarm(n,i,s,c,a.v);break;case"market":this.drawMarket(n,i,s,c);break;case"plot":this.drawPlot(n,i,s,a.plot,o);break;case"trap":{this.ctx.beginPath(),this.pathQuad(n+.08,i+.08,n+.92,i+.92,s+.01),this.ctx.fillStyle=kt(pt.dirt),this.ctx.fill();for(let h=0;h<3;h++)for(let u=0;u<3;u++){const d=n+.25+u*.25,f=i+.25+h*.25;this.line(d,f,s,d,f,s+.18,"#c9c4b8",Math.max(1,this.cam.k*.05))}break}case"tree":{const h=a.v,u=n+.5+(h-.5)*.2,d=i+.5+(h*7%1-.5)*.2;this.ellipse(u,d,s,.42,"rgba(0,0,0,0.25)"),this.box(u-.07,d-.07,u+.07,d+.07,s,s+.55,pt.trunk,pt.trunk,0,!1),this.ball(u,d,s+.95,.42,kt(pt.leaf,.9+h*.2),"rgba(10,30,10,0.5)"),this.ball(u-.08,d-.08,s+1.25,.26,kt(pt.leafHi,.9+h*.2));break}case"rock":{const h=pt.rock,u=.35+a.v*.3;this.box(n+.12,i+.16,n+.88,i+.86,s,s+u,h.side,h.top);break}}}drawStair(t,e,n,i){const s=t.stairFace(e),o=n+.5,a=i+.5,l=4;let c=0,h=1,u=t.elev(e)+.4;s>=0&&(c=s%t.w-n,h=(s/t.w|0)-i,u=t.surfaceAt(s,o+c*.5,a+h*.5));const d=pt.wall,f=[];for(let p=0;p<l;p++){const m=-.5+p/l,_=-.5+(p+1)/l,v=.3,x=c?o+Math.min(m*c,_*c):o-v,T=c?o+Math.max(m*c,_*c):o+v,A=h?a+Math.min(m*h,_*h):a-v,E=h?a+Math.max(m*h,_*h):a+v;f.push([x,A,T,E,(p+1)/l])}const g=this.cam;f.sort((p,m)=>g.depth((p[0]+p[2])/2,(p[1]+p[3])/2)-g.depth((m[0]+m[2])/2,(m[1]+m[3])/2));const M=(p,m)=>t.heightAt(p,m);for(const[p,m,_,v,x]of f){const T=t.heightAt((p+_)/2,(m+v)/2);this.box(p,m,_,v,M,T+(u-T)*x,d.side,d.top,0,!0,"stone")}}axisX(t,e,n,i){const s=o=>{const a=e+fi[o][0],l=n+fi[o][1];return t.inBounds(a,l)&&i(t.tiles[t.idx(a,l)].type)};return s(1)||s(3)||!(s(0)||s(2))}drawPikes(t,e,n,i,s){const o=this.axisX(t,e,n,x=>x==="pikes"||Nr.has(x)),a=e+.5,l=n+.5,c=o?1:0,h=o?0:1,u=-h,d=c;this.ellipse(a,l,i,.45,"rgba(0,0,0,0.18)");const f=Math.max(1.5,this.cam.k*.075),g=kt(pt.pike,s),M=kt(pt.pikeTip,s),p=[];for(const x of[-.33,0,.33]){const T=a+c*x,A=l+h*x;for(const E of[1,-1]){const P=T-u*.36*E,N=A-d*.36*E,y=T+u*.42*E,w=A+d*.42*E;p.push([P,N,y,w])}}const m=this.cam;p.sort((x,T)=>m.depth(x[2],x[3])-m.depth(T[2],T[3]));const _=()=>this.orientedBox(a,l,.5,.06,o?0:Math.PI/2,i+.2,i+.32,pt.trunk,he(pt.trunk,1.2));let v=!1;for(const[x,T,A,E]of p){!v&&m.depth(A,E)>m.depth(a,l)&&(_(),v=!0);const P=x+(A-x)*.72,N=T+(E-T)*.72;this.line(x,T,i,P,N,i+.45,g,f),this.line(P,N,i+.45,A,E,i+.62,M,f*.8)}v||_()}drawGate(t,e,n,i,s,o){var M,p,m;const a=St.gate.height,l=pt.thick,c=he(l.side,o),h=he(l.top,o),u=this.axisX(t,n,i,_=>Nr.has(_)),d=this.footZ??this.minFoot??s,f=u?[[n,i+.12,n+.3,i+.88,d,s+a,c,h],[n+.7,i+.12,n+1,i+.88,d,s+a,c,h],[n+.3,i+.12,n+.7,i+.88,s+.85,s+a,c,h]]:[[n+.12,i,n+.88,i+.3,d,s+a,c,h],[n+.12,i+.7,n+.88,i+1,d,s+a,c,h],[n+.12,i+.3,n+.88,i+.7,s+.85,s+a,c,h]];(M=this.openGates)!=null&&M.has(e)||f.push(u?[n+.3,i+.44,n+.7,i+.56,d,s+.85,pt.door,he(pt.door,1.2)]:[n+.44,i+.3,n+.56,i+.7,d,s+.85,pt.door,he(pt.door,1.2)]);const g=this.cam;if(f.sort((_,v)=>g.depth((_[0]+_[2])/2,(_[1]+_[3])/2)-g.depth((v[0]+v[2])/2,(v[1]+v[3])/2)),(p=this.barred)!=null&&p.has(e)&&!((m=this.openGates)!=null&&m.has(e))){const _=d+.42;f.push(u?[n+.26,i+.38,n+.74,i+.62,_,_+.1,[70,64,58],[96,90,82]]:[n+.38,i+.26,n+.62,i+.74,_,_+.1,[70,64,58],[96,90,82]])}for(const _ of f)this.box(..._,0,!0,_[6]===c?"stone":null);t.tiles[e].hoard&&(u?this.edgeRails(n,i+.12,n+1,i+.88,s+a,5):this.edgeRails(n+.12,i,n+.88,i+1,s+a,10))}drawCottage(t,e,n,i){const{ctx:s,cam:o}=this,a=t+.18,l=t+.82,c=e+.24,h=e+.76,u=n+.42,d=n+.8,f=e+.5;this.ellipse(t+.5,e+.5,n,.45,"rgba(0,0,0,0.18)"),this.box(a,c,l,h,n,u,he(pt.plaster,i),he(pt.plaster,i),0,!1);const g=(_,v)=>{this.poly(_),s.fillStyle=kt(pt.roof,v*i),s.fill(),s.strokeStyle="rgba(40,20,10,0.35)",s.stroke()},M=[a-.04,c-.05,u,l+.04,c-.05,u,l+.04,f,d,a-.04,f,d],p=[a-.04,f,d,l+.04,f,d,l+.04,h+.05,u,a-.04,h+.05,u],m=o.faceVisible(0,1);g(m?M:p,.8);for(const[_,v]of[[a,-1],[l,1]])o.faceVisible(v,0)&&(this.poly([_,c,u,_,h,u,_,f,d]),s.fillStyle=kt(pt.plaster,Cs(v,0)*i),s.fill());g(m?p:M,1),this.box(l-.16,f-.22,l-.06,f-.12,u,d+.08,[120,100,90],[90,80,72],0,!1)}drawFarm(t,e,n,i,s){const{ctx:o}=this;o.beginPath(),this.pathQuad(t+.04,e+.04,t+.96,e+.96,n+.01),o.fillStyle=kt(pt.soil,i),o.fill();const a=Math.max(1.5,this.cam.k*.07),l=s>.5;for(let c=0;c<4;c++){const h=e+.17+c*.22;this.line(t+.12,h,n+.03,t+.88,h,n+.03,kt(l?pt.crop:pt.sprout,i),a);for(const u of[.25,.5,.75])this.line(t+u,h,n,t+u,h,n+.14,kt(l?pt.crop:pt.sprout,i*.9),a*.6)}}drawMarket(t,e,n,i){const{ctx:s}=this;this.ellipse(t+.5,e+.5,n,.48,"rgba(0,0,0,0.18)"),this.box(t+.15,e+.3,t+.85,e+.7,n,n+.35,he(pt.catapult,i),he(pt.catapult,1.15*i),0,!0);const o=Math.max(1.5,this.cam.k*.05);for(const[a,l]of[[.12,.2],[.88,.2],[.12,.8],[.88,.8]])this.line(t+a,e+l,n,t+a,e+l,n+.85,"#4a3220",o);for(let a=0;a<5;a++){const l=t+.08+a*.168,c=l+.168;this.poly([l,e+.14,n+.95,c,e+.14,n+.95,c,e+.86,n+.75,l,e+.86,n+.75]),s.fillStyle=kt(a%2?pt.awningAlt:pt.awning,i),s.fill()}this.ball(t+.35,e+.5,n+.42,.08,kt(pt.crop)),this.ball(t+.62,e+.45,n+.42,.07,"#a83a2a")}drawPlot(t,e,n,i,s){const{ctx:o}=this,a=.55+.25*Math.sin(s*3);o.beginPath(),this.pathQuad(t+.08,e+.08,t+.92,e+.92,n+.01),o.fillStyle=`rgba(240,210,120,${.12+a*.1})`,o.fill(),o.setLineDash([4,4]),o.strokeStyle=`rgba(250,225,150,${a})`,o.lineWidth=1.5,o.stroke(),o.setLineDash([]);const l=Math.max(1.2,this.cam.k*.04);for(const[c,h]of[[.08,.08],[.92,.08],[.92,.92],[.08,.92]])this.line(t+c,e+h,n,t+c,e+h,n+.25,"#e9d9b0",l);o.globalAlpha=.35,i==="cottage"?this.drawCottage(t,e,n,1):i==="farm"?this.drawFarm(t,e,n,1,.2):i==="market"&&this.drawMarket(t,e,n,1),o.globalAlpha=1}drawOrders(t,e){const{ctx:n}=this,i=new Set;for(const s of t.swordsmen){const o=e.selected.has(s.id);if(!s.zone||!e.active&&!o)continue;const a=JSON.stringify(s.zone);if(i.has(a))continue;i.add(a);const l=s.zone;n.beginPath(),this.pathQuad(l.x0,l.y0,l.x1+1,l.y1+1),n.fillStyle=o?"rgba(110,160,255,0.18)":"rgba(110,160,255,0.09)",n.fill(),n.setLineDash([6,5]),n.strokeStyle="rgba(150,190,255,0.85)",n.lineWidth=2,n.stroke(),n.setLineDash([])}for(const s of t.swordsmen){if(!e.selected.has(s.id))continue;const{cam:o}=this;o.P(s.x,s.y,s.z),n.beginPath(),n.ellipse(o.sx,o.sy,.36*o.k,.36*o.k*o.sinE,0,0,Math.PI*2),n.strokeStyle="#f0c24b",n.lineWidth=2.5,n.stroke()}if(e.box){const{x0:s,y0:o,x1:a,y1:l}=e.box;n.beginPath(),this.pathQuad(s,o,a+1,l+1),n.fillStyle=e.selected.size?"rgba(110,160,255,0.22)":"rgba(240,194,75,0.18)",n.fill(),n.strokeStyle=e.selected.size?"rgba(170,205,255,0.95)":"rgba(240,194,75,0.95)",n.lineWidth=2,n.stroke()}}drawFoundation(t,e,n,i,s){const o=pt.rock.side,a=[138,146,112],l=n+(i-n)*(.55+s*.2),c=(s-.5)*.08;this.box(t+.02,e+.03+c,t+.98,e+.97+c,n,l,o,pt.rock.top,0,!0),this.box(t+.1-c,e+.12,t+.9-c,e+.88,l,i,he(o,1.08),a,0,!0)}drawKeepDoor(t,e,n,i){if(!this.cam.faceVisible(0,1))return;const s=n+1.002,o=e+.3,a=e+.7,l=.95;this.poly([o,s,i,a,s,i,a,s,i+l*.8,e+.5,s,i+l,o,s,i+l*.8]);const c=t.doorHp<=0,h=.6+.4*(t.doorHp/t.doorMax);if(this.ctx.fillStyle=c?"rgb(24,18,14)":kt(pt.door,h),this.ctx.fill(),this.ctx.strokeStyle="rgba(30,20,10,0.8)",this.ctx.lineWidth=Math.max(1,this.cam.k*.03),this.ctx.stroke(),c)for(const[u,d,f,g]of[[.32,.2,.42,.55],[.68,.1,.6,.6],[.36,.75,.5,.62]])this.line(e+u,s,i+d,e+f,s,i+g,kt(pt.door,1.1),Math.max(1.5,this.cam.k*.05));else for(const u of[.25,.6])this.line(o,s,i+u,a,s,i+u,"rgba(40,30,20,0.9)",Math.max(1,this.cam.k*.04))}drawLord(t,e,n,i){const s=i.hp<i.maxHp&&i.inside>0;this.ellipse(t,e,n,.14,"rgba(0,0,0,0.3)"),this.ball(t,e,n+.27,.14,s?"#fff":kt(pt.lord),"#2a1030"),this.ball(t,e,n+.5,.09,kt(pt.skin),"rgba(20,10,5,0.6)"),this.cam.P(t,e,n+.6);const o=Math.max(2,this.cam.k*.09),{ctx:a}=this;a.beginPath(),a.moveTo(this.cam.sx-o,this.cam.sy),a.lineTo(this.cam.sx-o,this.cam.sy-o*1.1),a.lineTo(this.cam.sx-o*.5,this.cam.sy-o*.5),a.lineTo(this.cam.sx,this.cam.sy-o*1.2),a.lineTo(this.cam.sx+o*.5,this.cam.sy-o*.5),a.lineTo(this.cam.sx+o,this.cam.sy-o*1.1),a.lineTo(this.cam.sx+o,this.cam.sy),a.closePath(),a.fillStyle=kt(pt.crown),a.fill()}drawLadder(t,e,n,i,s,o){const a=i-t,l=s-e,c=Math.hypot(a,l)||1,h=-l/c*.13,u=a/c*.13,d=Math.max(1.2,this.cam.k*.045),f=kt(pt.ladder),g=kt(pt.ladder,.7),M=6;for(let p=1;p<M;p++){const m=p/M,_=t+a*m,v=e+l*m,x=n+(o-n)*m;this.line(_-h,v-u,x,_+h,v+u,x,g,d*.8)}this.line(t-h,e-u,n,i-h,s-u,o,f,d),this.line(t+h,e+u,n,i+h,s+u,o,f,d)}merlons(t,e,n,i,s,o,a){const h=[],u=(M,p,m,_)=>{for(const v of[0,.5,1])h.push([M+(m-M)*v,p+(_-p)*v])};a&1&&u(t+.2/2,e+.2/2,n-.2/2,e+.2/2),a&2&&u(n-.2/2,e+.2/2,n-.2/2,i-.2/2),a&4&&u(t+.2/2,i-.2/2,n-.2/2,i-.2/2),a&8&&u(t+.2/2,e+.2/2,t+.2/2,i-.2/2);const d=this.cam;h.sort((M,p)=>d.depth(M[0],M[1])-d.depth(p[0],p[1]));const f=he(o.top,1.18),g=typeof s=="function"?s:()=>s;for(const[M,p]of h){const m=g(M,p);this.box(M-.2/2,p-.2/2,M+.2/2,p+.2/2,m,m+.22,o.side,f,0,!0)}}flag(t,e,n,i){const s=n+1.3;this.line(t,e,n,t,e,s,"#2b2016",Math.max(1.5,this.cam.k*.05));const o=Math.sin(i*3)*.08;this.poly([t,e,s,t+.7,e+o,s-.18,t,e,s-.4]),this.ctx.fillStyle=kt(pt.player),this.ctx.fill()}drawEnemy(t,e){const{cam:n}=this,i=t.z;if(t.type==="catapult"){this.drawCatapult(t,e);return}this.ellipse(t.x,t.y,i,t.r*1.1,"rgba(0,0,0,0.3)");const s=t.flash>0;if(t.type==="ram"){const u=s?[255,255,255]:pt.ram;this.orientedBox(t.x,t.y,.45,.26,t.heading,i+.05,i+.42,u,he(u,1.25));const d=t.x+Math.cos(t.heading)*(.45+(t.attacking?Math.abs(Math.sin(t.walk))*.12:0)),f=t.y+Math.sin(t.heading)*.45;this.ball(d,f,i+.25,.1,"#555","#222");return}if(t.type==="ladder"){const u=Math.cos(t.heading),d=Math.sin(t.heading),f=kt(s?[255,255,255]:pt.raider),g=[[.24,0],[-.24,Math.PI]];g.sort((p,m)=>n.depth(t.x+u*p[0],t.y+d*p[0])-n.depth(t.x+u*m[0],t.y+d*m[0]));for(const[p,m]of g){const _=t.x+u*p,v=t.y+d*p,x=Math.abs(Math.sin(t.walk+m))*.05;this.ball(_,v,i+.28+x,.17,f,"rgba(20,10,5,0.7)"),this.ball(_,v,i+.55+x,.1,kt(pt.skin),"rgba(20,10,5,0.6)")}const M=Math.min(1,t.raising/1.2)*.9;this.drawLadder(t.x-u*.5,t.y-d*.5,i+.5,t.x+u*.5,t.y+d*.5,i+.5+M);return}const o=s?[255,255,255]:pt[t.type],a=Math.abs(Math.sin(t.walk))*.06,l=t.type==="brute";if(t.type==="bowman"){this.bow(t.x,t.y,i,t.heading,"#3b2a18"),this.ball(t.x,t.y,i+.28+a,t.r,kt(o),"rgba(20,10,5,0.7)"),this.ball(t.x,t.y,i+.52+a,t.r*.6,kt(he(pt.bowman,.7)),"rgba(20,10,5,0.6)");return}const c=t.attacking?Math.sin(t.walk*2)*.25:0,h=l?.42:.34;this.line(t.x,t.y,i+.38+a,t.x+Math.cos(t.heading+c)*h,t.y+Math.sin(t.heading+c)*h,i+.5+a+c*.3,l?"#3b3b3b":"#cfcfcf",Math.max(1.5,n.k*.06)),this.ball(t.x,t.y,i+.3+a,t.r,kt(o),"rgba(20,10,5,0.7)"),this.ball(t.x,t.y,i+.62+a,t.r*.55,l?"#777":kt(pt.skin),"rgba(20,10,5,0.6)")}drawArcher(t,e){const{cam:n}=this,i=t.z,o=t.path.length>0?Math.abs(Math.sin(e*12+t.id))*.05:0;this.ellipse(t.x,t.y,i,.15,"rgba(0,0,0,0.3)"),this.bow(t.x,t.y,i,t.heading,"#6b4423"),this.ball(t.x,t.y,i+.25+o,.13,t.flash>0?"#fff":kt(pt.player),"#162440"),this.ball(t.x,t.y,i+.47+o,.08,kt(pt.skin),"rgba(20,10,5,0.6)")}bow(t,e,n,i,s){const o=t+Math.cos(i)*.2,a=e+Math.sin(i)*.2,l=-Math.sin(i)*.14,c=Math.cos(i)*.14;this.line(o-l,a-c,n+.25,o+l,a+c,n+.55,s,Math.max(1.2,this.cam.k*.045))}drawSwordsman(t){const{cam:e}=this,n=t.z,i=Math.abs(Math.sin(t.walk))*.05;this.ellipse(t.x,t.y,n,t.r*1.1,"rgba(0,0,0,0.3)");const s=t.fighting?Math.sin(t.walk*2)*.5:.3,o=t.heading;this.line(t.x+Math.cos(o+1.2)*.12,t.y+Math.sin(o+1.2)*.12,n+.4+i,t.x+Math.cos(o+s)*.42,t.y+Math.sin(o+s)*.42,n+.5+i,"#dfe4ea",Math.max(1.5,e.k*.06)),this.ball(t.x,t.y,n+.3+i,t.r,t.flash>0?"#fff":kt(pt.player),"#162440"),this.ball(t.x+Math.cos(o-1.1)*.17,t.y+Math.sin(o-1.1)*.17,n+.32+i,.11,kt(pt.shield),"#4a3a14"),this.ball(t.x,t.y,n+.6+i,t.r*.55,"#9aa3ad","#2a2f36")}drawCatapult(t,e){const n=t.z,i=t.flash>0?[255,255,255]:pt.catapult,s=Math.cos(t.heading),o=Math.sin(t.heading);this.ellipse(t.x,t.y,n,.5,"rgba(0,0,0,0.3)");for(const[v,x]of[[.3,.27],[.3,-.27],[-.3,.27],[-.3,-.27]])this.ball(t.x+s*v-o*x,t.y+o*v+s*x,n+.1,.09,"#3a2a1a");this.orientedBox(t.x,t.y,.42,.24,t.heading,n+.08,n+.26,i,he(i,1.2));const a=-o*.2,l=s*.2,c=n+.7,h=kt(he(i,.75)),u=Math.max(1.5,this.cam.k*.06);this.line(t.x+a,t.y+l,n+.26,t.x,t.y,c,h,u),this.line(t.x-a,t.y-l,n+.26,t.x,t.y,c,h,u);const d=e-t.fired,g=-.45+(d<.18?d/.18:Math.max(0,1-(d-.18)/1.8))*1.9,M=.7,p=t.x-s*Math.cos(g)*M,m=t.y-o*Math.cos(g)*M,_=c+Math.sin(g)*M;this.line(t.x+s*.18,t.y+o*.18,c-Math.sin(g)*.18,p,m,_,kt(he(i,.9)),Math.max(2.5,this.cam.k*.09)),this.ball(p,m,_+.04,.11,d>1.2?kt(pt.boulder):kt(he(i,.6)),"#3a2a1a")}drawBoulder(t){const e=t.sz+(t.tz-t.sz)*t.t;this.ellipse(t.x,t.y,Math.max(0,e-.4),.14,"rgba(0,0,0,0.25)"),this.ball(t.x,t.y,t.z,.14,kt(pt.boulder),"#3d3a36")}drawEffect(t){const{ctx:e,cam:n}=this,i=t.t/t.life;for(let s=0;s<4;s++){const o=s*1.7+t.x*3,a=t.size*(.2+i*.6);n.P(t.x+Math.cos(o)*a*.6,t.y+Math.sin(o)*a*.6,t.z+i*.6),e.beginPath(),e.arc(n.sx,n.sy,Math.max(1,a*.55*n.k),0,Math.PI*2),e.fillStyle=`rgba(170,155,130,${.5*(1-i)})`,e.fill()}}drawArrow(t){const e=t.x-t.px,n=t.y-t.py,i=t.z-t.pz,s=Math.hypot(e,n,i)||1,o=.35,a=t.hostile?"#2a2018":"#f3e6c4";this.line(t.x-e/s*o,t.y-n/s*o,t.z-i/s*o,t.x,t.y,t.z,a,Math.max(1,this.cam.k*.04))}rangeRing(t,e,n,i){const{ctx:s,cam:o}=this;s.beginPath();for(let a=0;a<=48;a++){const l=a/48*Math.PI*2;o.P(t+Math.cos(l)*i,e+Math.sin(l)*i,n),a===0?s.moveTo(o.sx,o.sy):s.lineTo(o.sx,o.sy)}s.fillStyle="rgba(120,180,255,0.08)",s.fill(),s.strokeStyle="rgba(150,200,255,0.6)",s.setLineDash([6,6]),s.stroke(),s.setLineDash([])}drawPreview(t,e){const{ctx:n}=this,{world:i}=t,s=e.i%i.w,o=e.i/i.w|0,l=["archer","upgrade","demolish","hoard"].includes(e.type)?i.surface(e.i)+.02:i.elev(e.i)+.02;n.beginPath(),this.pathQuad(s,o,s+1,o+1,l),n.fillStyle=e.ok?"rgba(120,230,120,0.35)":"rgba(240,80,60,0.35)",n.fill(),n.strokeStyle=e.ok?"rgba(160,255,160,0.9)":"rgba(255,120,100,0.9)",n.lineWidth=2,n.stroke();let c=0;e.type==="tower"?c=tn.range+St.tower.perch+(Ci[i.tiles[e.i].terrain].perch||0):e.type==="archer"&&i.isRampart(e.i)?c=t.range(e.i):e.type==="swordsman"&&(c=$e.guard),c&&this.rangeRing(s+.5,o+.5,i.elev(e.i),c)}hpBar(t,e,n,i,s=.7){if(i>=1)return;const{ctx:o,cam:a}=this;a.P(t,e,n);const l=s*a.k,c=Math.max(3,a.k*.09);o.fillStyle="rgba(0,0,0,0.6)",o.fillRect(a.sx-l/2-1,a.sy-c/2-1,l+2,c+2),o.fillStyle=i>.5?"#6fcf57":i>.25?"#e8c547":"#e2543b",o.fillRect(a.sx-l/2,a.sy-c/2,l*Math.max(0,i),c)}drawBars(t){const{world:e}=t;for(let i=0;i<e.tiles.length;i++){const s=e.tiles[i];s.maxHp&&s.hp<s.maxHp&&this.hpBar(i%e.w+.5,(i/e.w|0)+.5,e.surface(i)+.45,s.hp/s.maxHp)}const n=e.keep;n.doorHp>0&&n.doorHp<n.doorMax&&this.hpBar(n.x+1.5,n.y+3.05,1.35,n.doorHp/n.doorMax,.6),n.inside>0&&this.insideBadge(n);for(const i of t.enemies)this.hpBar(i.x,i.y,i.z+1,i.hp/i.maxHp,.5);for(const i of[...t.archers,...t.swordsmen])this.hpBar(i.x,i.y,i.z+.95,i.hp/i.maxHp,.4)}insideBadge(t){const{ctx:e,cam:n}=this;n.P(t.x+1.5,t.y+1.5,se.height+2.1);const i=`⚔ ${t.inside} inside`,s=Math.max(11,Math.min(16,n.k*.38));e.font=`700 ${s}px system-ui, sans-serif`;const o=e.measureText(i).width+s,a=s*1.6;e.fillStyle="rgba(150,30,24,0.92)",e.beginPath(),e.roundRect(n.sx-o/2,n.sy-a/2,o,a,a/2),e.fill(),e.fillStyle="#fff",e.textAlign="center",e.textBaseline="middle",e.fillText(i,n.sx,n.sy+1)}drawPlotTags(t){const{ctx:e,cam:n}=this,{world:i}=t,s=Math.round(Math.max(10,Math.min(14,n.k*.36)));e.font=`700 ${s}px system-ui, sans-serif`,e.textAlign="center",e.textBaseline="middle";for(let o=0;o<i.tiles.length;o++){const a=i.tiles[o];if(a.type!=="plot")continue;const l=St[a.plot];n.P(o%i.w+.5,(o/i.w|0)+.5,i.elev(o)+1.15);const c=`${l.label} · ${l.cost}`,h=e.measureText(c).width+s*2,u=s*1.7,d=n.sx-h/2,f=n.sy-u/2,g=t.gold>=l.cost;e.fillStyle="rgba(24,20,15,0.88)",e.beginPath(),e.roundRect(d,f,h,u,u/2),e.fill(),e.strokeStyle=g?"rgba(240,194,75,0.9)":"rgba(160,140,110,0.6)",e.lineWidth=1.5,e.stroke(),e.beginPath(),e.arc(d+s*.85,n.sy,s*.32,0,Math.PI*2),e.fillStyle="#f0c24b",e.fill(),e.fillStyle=g?"#f3ead8":"#b9ae98",e.fillText(c,n.sx+s*.5,n.sy+1),e.beginPath(),e.moveTo(n.sx-4,f+u),e.lineTo(n.sx+4,f+u),e.lineTo(n.sx,f+u+5),e.fillStyle="rgba(24,20,15,0.88)",e.fill()}e.textBaseline="alphabetic"}drawFloaters(t){const{ctx:e,cam:n}=this;e.textAlign="center",e.font=`700 ${Math.round(Math.max(11,n.k*.4))}px system-ui, sans-serif`;for(const i of t.floaters)n.P(i.x,i.y,(i.z||0)+1+i.t*1.2),e.fillStyle=i.color==="cost"?`rgba(255,160,120,${1-i.t/1.2})`:`rgba(255,214,90,${1-i.t/1.2})`,e.fillText(i.text,n.sx,n.sy)}}function eu(r){return r.type==="thick"?St.thick.height:r.type==="gate"?St.gate.height:r.type==="keep"?se.height:0}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Pa="169",nu=0,fl=1,iu=2,Lc=1,Ic=2,Sn=3,zn=0,Fe=1,rn=2,Fn=0,Ni=1,pl=2,ml=3,gl=4,su=5,Qn=100,ru=101,ou=102,au=103,lu=104,cu=200,hu=201,uu=202,du=203,Io=204,Do=205,fu=206,pu=207,mu=208,gu=209,xu=210,vu=211,_u=212,Mu=213,yu=214,Uo=0,No=1,ko=2,Bi=3,Fo=4,Oo=5,Bo=6,zo=7,Dc=0,Su=1,wu=2,On=0,bu=1,Eu=2,Tu=3,Uc=4,Au=5,Ru=6,Cu=7,Nc=300,zi=301,Hi=302,Ho=303,Go=304,yr=306,ps=1e3,ei=1001,Vo=1002,Ne=1003,Pu=1004,Ps=1005,on=1006,kr=1007,ni=1008,Tn=1009,kc=1010,Fc=1011,ms=1012,La=1013,oi=1014,dn=1015,bs=1016,Ia=1017,Da=1018,Gi=1020,Oc=35902,Bc=1021,zc=1022,ln=1023,Hc=1024,Gc=1025,ki=1026,Vi=1027,Ua=1028,Na=1029,Vc=1030,ka=1031,Fa=1033,ir=33776,sr=33777,rr=33778,or=33779,Wo=35840,Xo=35841,qo=35842,$o=35843,Yo=36196,Ko=37492,Zo=37496,jo=37808,Jo=37809,Qo=37810,ta=37811,ea=37812,na=37813,ia=37814,sa=37815,ra=37816,oa=37817,aa=37818,la=37819,ca=37820,ha=37821,ar=36492,ua=36494,da=36495,Wc=36283,fa=36284,pa=36285,ma=36286,Lu=3200,Iu=3201,Xc=0,Du=1,kn="",Ye="srgb",Gn="srgb-linear",Oa="display-p3",Sr="display-p3-linear",ur="linear",le="srgb",dr="rec709",fr="p3",pi=7680,xl=519,Uu=512,Nu=513,ku=514,qc=515,Fu=516,Ou=517,Bu=518,zu=519,vl=35044,Hu=35048,_l="300 es",wn=2e3,pr=2001;class qi{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const s=i.indexOf(e);s!==-1&&i.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let s=0,o=i.length;s<o;s++)i[s].call(this,t);t.target=null}}}const Ae=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Fr=Math.PI/180,ga=180/Math.PI;function $i(){const r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ae[r&255]+Ae[r>>8&255]+Ae[r>>16&255]+Ae[r>>24&255]+"-"+Ae[t&255]+Ae[t>>8&255]+"-"+Ae[t>>16&15|64]+Ae[t>>24&255]+"-"+Ae[e&63|128]+Ae[e>>8&255]+"-"+Ae[e>>16&255]+Ae[e>>24&255]+Ae[n&255]+Ae[n>>8&255]+Ae[n>>16&255]+Ae[n>>24&255]).toLowerCase()}function Ee(r,t,e){return Math.max(t,Math.min(e,r))}function Gu(r,t){return(r%t+t)%t}function Or(r,t,e){return(1-e)*r+e*t}function ji(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function Ue(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}class st{constructor(t=0,e=0){st.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ee(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),s=this.x-t.x,o=this.y-t.y;return this.x=s*n-o*i+t.x,this.y=s*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Wt{constructor(t,e,n,i,s,o,a,l,c){Wt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,s,o,a,l,c)}set(t,e,n,i,s,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=i,h[2]=a,h[3]=e,h[4]=s,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],M=i[0],p=i[3],m=i[6],_=i[1],v=i[4],x=i[7],T=i[2],A=i[5],E=i[8];return s[0]=o*M+a*_+l*T,s[3]=o*p+a*v+l*A,s[6]=o*m+a*x+l*E,s[1]=c*M+h*_+u*T,s[4]=c*p+h*v+u*A,s[7]=c*m+h*x+u*E,s[2]=d*M+f*_+g*T,s[5]=d*p+f*v+g*A,s[8]=d*m+f*x+g*E,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*s*h+n*a*l+i*s*c-i*o*l}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*s,f=c*s-o*l,g=e*u+n*d+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/g;return t[0]=u*M,t[1]=(i*c-h*n)*M,t[2]=(a*n-i*o)*M,t[3]=d*M,t[4]=(h*e-i*l)*M,t[5]=(i*s-a*e)*M,t[6]=f*M,t[7]=(n*l-c*e)*M,t[8]=(o*e-n*s)*M,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-i*c,i*l,-i*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Br.makeScale(t,e)),this}rotate(t){return this.premultiply(Br.makeRotation(-t)),this}translate(t,e){return this.premultiply(Br.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Br=new Wt;function $c(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function mr(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Vu(){const r=mr("canvas");return r.style.display="block",r}const Ml={};function lr(r){r in Ml||(Ml[r]=!0,console.warn(r))}function Wu(r,t,e){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(t,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,e);break;default:n()}}setTimeout(s,e)})}function Xu(r){const t=r.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function qu(r){const t=r.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const yl=new Wt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Sl=new Wt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ji={[Gn]:{transfer:ur,primaries:dr,luminanceCoefficients:[.2126,.7152,.0722],toReference:r=>r,fromReference:r=>r},[Ye]:{transfer:le,primaries:dr,luminanceCoefficients:[.2126,.7152,.0722],toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[Sr]:{transfer:ur,primaries:fr,luminanceCoefficients:[.2289,.6917,.0793],toReference:r=>r.applyMatrix3(Sl),fromReference:r=>r.applyMatrix3(yl)},[Oa]:{transfer:le,primaries:fr,luminanceCoefficients:[.2289,.6917,.0793],toReference:r=>r.convertSRGBToLinear().applyMatrix3(Sl),fromReference:r=>r.applyMatrix3(yl).convertLinearToSRGB()}},$u=new Set([Gn,Sr]),ne={enabled:!0,_workingColorSpace:Gn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!$u.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,t,e){if(this.enabled===!1||t===e||!t||!e)return r;const n=Ji[t].toReference,i=Ji[e].fromReference;return i(n(r))},fromWorkingColorSpace:function(r,t){return this.convert(r,this._workingColorSpace,t)},toWorkingColorSpace:function(r,t){return this.convert(r,t,this._workingColorSpace)},getPrimaries:function(r){return Ji[r].primaries},getTransfer:function(r){return r===kn?ur:Ji[r].transfer},getLuminanceCoefficients:function(r,t=this._workingColorSpace){return r.fromArray(Ji[t].luminanceCoefficients)}};function Fi(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function zr(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let mi;class Yu{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{mi===void 0&&(mi=mr("canvas")),mi.width=t.width,mi.height=t.height;const n=mi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=mi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=mr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),s=i.data;for(let o=0;o<s.length;o++)s[o]=Fi(s[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Fi(e[n]/255)*255):e[n]=Fi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Ku=0;class Yc{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ku++}),this.uuid=$i(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?s.push(Hr(i[o].image)):s.push(Hr(i[o]))}else s=Hr(i);n.url=s}return e||(t.images[this.uuid]=n),n}}function Hr(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?Yu.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Zu=0;class Ce extends qi{constructor(t=Ce.DEFAULT_IMAGE,e=Ce.DEFAULT_MAPPING,n=ei,i=ei,s=on,o=ni,a=ln,l=Tn,c=Ce.DEFAULT_ANISOTROPY,h=kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Zu++}),this.uuid=$i(),this.name="",this.source=new Yc(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new st(0,0),this.repeat=new st(1,1),this.center=new st(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Wt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Nc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ps:t.x=t.x-Math.floor(t.x);break;case ei:t.x=t.x<0?0:1;break;case Vo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ps:t.y=t.y-Math.floor(t.y);break;case ei:t.y=t.y<0?0:1;break;case Vo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ce.DEFAULT_IMAGE=null;Ce.DEFAULT_MAPPING=Nc;Ce.DEFAULT_ANISOTROPY=1;class fe{constructor(t=0,e=0,n=0,i=1){fe.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,s=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*s,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*s,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*s,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*s,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,s;const l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],M=l[2],p=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-M)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+M)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const v=(c+1)/2,x=(f+1)/2,T=(m+1)/2,A=(h+d)/4,E=(u+M)/4,P=(g+p)/4;return v>x&&v>T?v<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(v),i=A/n,s=E/n):x>T?x<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(x),n=A/i,s=P/i):T<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(T),n=E/s,i=P/s),this.set(n,i,s,e),this}let _=Math.sqrt((p-g)*(p-g)+(u-M)*(u-M)+(d-h)*(d-h));return Math.abs(_)<.001&&(_=1),this.x=(p-g)/_,this.y=(u-M)/_,this.z=(d-h)/_,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ju extends qi{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new fe(0,0,t,e),this.scissorTest=!1,this.viewport=new fe(0,0,t,e);const i={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Ce(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Yc(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ai extends ju{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Kc extends Ce{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Ne,this.minFilter=Ne,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ju extends Ce{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Ne,this.minFilter=Ne,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Se{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,s,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=s[o+0],f=s[o+1],g=s[o+2],M=s[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(a===1){t[e+0]=d,t[e+1]=f,t[e+2]=g,t[e+3]=M;return}if(u!==M||l!==d||c!==f||h!==g){let p=1-a;const m=l*d+c*f+h*g+u*M,_=m>=0?1:-1,v=1-m*m;if(v>Number.EPSILON){const T=Math.sqrt(v),A=Math.atan2(T,m*_);p=Math.sin(p*A)/T,a=Math.sin(a*A)/T}const x=a*_;if(l=l*p+d*x,c=c*p+f*x,h=h*p+g*x,u=u*p+M*x,p===1-a){const T=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=T,c*=T,h*=T,u*=T}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,s,o){const a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=s[o],d=s[o+1],f=s[o+2],g=s[o+3];return t[e]=a*g+h*u+l*f-c*d,t[e+1]=l*g+h*d+c*u-a*f,t[e+2]=c*g+h*f+a*d-l*u,t[e+3]=h*g-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,s=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),u=a(s/2),d=l(n/2),f=l(i/2),g=l(s/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],s=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+a+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(o-i)*f}else if(n>a&&n>u){const f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(s+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-n-u);this._w=(s-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-a);this._w=(o-i)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ee(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,s=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+i*c-s*l,this._y=i*h+o*l+s*a-n*c,this._z=s*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-s*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,s=this._z,o=this._w;let a=o*t._w+n*t._x+i*t._y+s*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=i,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*i+e*this._y,this._z=f*s+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-e)*h)/c,d=Math.sin(e*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=s*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(t=0,e=0,n=0){L.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(wl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(wl.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6]*i,this.y=s[1]*e+s[4]*n+s[7]*i,this.z=s[2]*e+s[5]*n+s[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,s=t.elements,o=1/(s[3]*e+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*e+s[4]*n+s[8]*i+s[12])*o,this.y=(s[1]*e+s[5]*n+s[9]*i+s[13])*o,this.z=(s[2]*e+s[6]*n+s[10]*i+s[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,s=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*i-a*n),h=2*(a*e-s*i),u=2*(s*n-o*e);return this.x=e+l*c+o*u-a*h,this.y=n+l*h+a*c-s*u,this.z=i+l*u+s*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[4]*n+s[8]*i,this.y=s[1]*e+s[5]*n+s[9]*i,this.z=s[2]*e+s[6]*n+s[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,s=t.z,o=e.x,a=e.y,l=e.z;return this.x=i*l-s*a,this.y=s*o-n*l,this.z=n*a-i*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Gr.copy(this).projectOnVector(t),this.sub(Gr)}reflect(t){return this.sub(Gr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ee(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Gr=new L,wl=new Se;class hi{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(je.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(je.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=je.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const s=n.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,je):je.fromBufferAttribute(s,o),je.applyMatrix4(t.matrixWorld),this.expandByPoint(je);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ls.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ls.copy(n.boundingBox)),Ls.applyMatrix4(t.matrixWorld),this.union(Ls)}const i=t.children;for(let s=0,o=i.length;s<o;s++)this.expandByObject(i[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,je),je.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Qi),Is.subVectors(this.max,Qi),gi.subVectors(t.a,Qi),xi.subVectors(t.b,Qi),vi.subVectors(t.c,Qi),Cn.subVectors(xi,gi),Pn.subVectors(vi,xi),Xn.subVectors(gi,vi);let e=[0,-Cn.z,Cn.y,0,-Pn.z,Pn.y,0,-Xn.z,Xn.y,Cn.z,0,-Cn.x,Pn.z,0,-Pn.x,Xn.z,0,-Xn.x,-Cn.y,Cn.x,0,-Pn.y,Pn.x,0,-Xn.y,Xn.x,0];return!Vr(e,gi,xi,vi,Is)||(e=[1,0,0,0,1,0,0,0,1],!Vr(e,gi,xi,vi,Is))?!1:(Ds.crossVectors(Cn,Pn),e=[Ds.x,Ds.y,Ds.z],Vr(e,gi,xi,vi,Is))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,je).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(je).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(xn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),xn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),xn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),xn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),xn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),xn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),xn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),xn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(xn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const xn=[new L,new L,new L,new L,new L,new L,new L,new L],je=new L,Ls=new hi,gi=new L,xi=new L,vi=new L,Cn=new L,Pn=new L,Xn=new L,Qi=new L,Is=new L,Ds=new L,qn=new L;function Vr(r,t,e,n,i){for(let s=0,o=r.length-3;s<=o;s+=3){qn.fromArray(r,s);const a=i.x*Math.abs(qn.x)+i.y*Math.abs(qn.y)+i.z*Math.abs(qn.z),l=t.dot(qn),c=e.dot(qn),h=n.dot(qn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Qu=new hi,ts=new L,Wr=new L;class Es{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Qu.setFromPoints(t).getCenter(n);let i=0;for(let s=0,o=t.length;s<o;s++)i=Math.max(i,n.distanceToSquared(t[s]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ts.subVectors(t,this.center);const e=ts.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(ts,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Wr.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ts.copy(t.center).add(Wr)),this.expandByPoint(ts.copy(t.center).sub(Wr))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const vn=new L,Xr=new L,Us=new L,Ln=new L,qr=new L,Ns=new L,$r=new L;class td{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,vn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=vn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(vn.copy(this.origin).addScaledVector(this.direction,e),vn.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){Xr.copy(t).add(e).multiplyScalar(.5),Us.copy(e).sub(t).normalize(),Ln.copy(this.origin).sub(Xr);const s=t.distanceTo(e)*.5,o=-this.direction.dot(Us),a=Ln.dot(this.direction),l=-Ln.dot(Us),c=Ln.lengthSq(),h=Math.abs(1-o*o);let u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=s*h,u>=0)if(d>=-g)if(d<=g){const M=1/h;u*=M,d*=M,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*s+a)),d=u>0?-s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(u=Math.max(0,-(o*s+a)),d=u>0?s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c);else d=o>0?-s:s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Xr).addScaledVector(Us,d),f}intersectSphere(t,e){vn.subVectors(t.center,this.origin);const n=vn.dot(this.direction),i=vn.dot(vn)-n*n,s=t.radius*t.radius;if(i>s)return null;const o=Math.sqrt(s-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,s,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,i=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,i=(t.min.x-d.x)*c),h>=0?(s=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(s=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||s>i||((s>n||isNaN(n))&&(n=s),(o<i||isNaN(i))&&(i=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,vn)!==null}intersectTriangle(t,e,n,i,s){qr.subVectors(e,t),Ns.subVectors(n,t),$r.crossVectors(qr,Ns);let o=this.direction.dot($r),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Ln.subVectors(this.origin,t);const l=a*this.direction.dot(Ns.crossVectors(Ln,Ns));if(l<0)return null;const c=a*this.direction.dot(qr.cross(Ln));if(c<0||l+c>o)return null;const h=-a*Ln.dot($r);return h<0?null:this.at(h/o,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class re{constructor(t,e,n,i,s,o,a,l,c,h,u,d,f,g,M,p){re.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,s,o,a,l,c,h,u,d,f,g,M,p)}set(t,e,n,i,s,o,a,l,c,h,u,d,f,g,M,p){const m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=i,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=g,m[11]=M,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new re().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/_i.setFromMatrixColumn(t,0).length(),s=1/_i.setFromMatrixColumn(t,1).length(),o=1/_i.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*s,e[5]=n[5]*s,e[6]=n[6]*s,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,s=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){const d=o*h,f=o*u,g=a*h,M=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+g*c,e[5]=d-M*c,e[9]=-a*l,e[2]=M-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){const d=l*h,f=l*u,g=c*h,M=c*u;e[0]=d+M*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=M+d*a,e[10]=o*l}else if(t.order==="ZXY"){const d=l*h,f=l*u,g=c*h,M=c*u;e[0]=d-M*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=M-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const d=o*h,f=o*u,g=a*h,M=a*u;e[0]=l*h,e[4]=g*c-f,e[8]=d*c+M,e[1]=l*u,e[5]=M*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const d=o*l,f=o*c,g=a*l,M=a*c;e[0]=l*h,e[4]=M-d*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+g,e[10]=d-M*u}else if(t.order==="XZY"){const d=o*l,f=o*c,g=a*l,M=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+M,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=M*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ed,t,nd)}lookAt(t,e,n){const i=this.elements;return ze.subVectors(t,e),ze.lengthSq()===0&&(ze.z=1),ze.normalize(),In.crossVectors(n,ze),In.lengthSq()===0&&(Math.abs(n.z)===1?ze.x+=1e-4:ze.z+=1e-4,ze.normalize(),In.crossVectors(n,ze)),In.normalize(),ks.crossVectors(ze,In),i[0]=In.x,i[4]=ks.x,i[8]=ze.x,i[1]=In.y,i[5]=ks.y,i[9]=ze.y,i[2]=In.z,i[6]=ks.z,i[10]=ze.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],M=n[6],p=n[10],m=n[14],_=n[3],v=n[7],x=n[11],T=n[15],A=i[0],E=i[4],P=i[8],N=i[12],y=i[1],w=i[5],k=i[9],F=i[13],G=i[2],Y=i[6],z=i[10],K=i[14],V=i[3],ut=i[7],dt=i[11],ft=i[15];return s[0]=o*A+a*y+l*G+c*V,s[4]=o*E+a*w+l*Y+c*ut,s[8]=o*P+a*k+l*z+c*dt,s[12]=o*N+a*F+l*K+c*ft,s[1]=h*A+u*y+d*G+f*V,s[5]=h*E+u*w+d*Y+f*ut,s[9]=h*P+u*k+d*z+f*dt,s[13]=h*N+u*F+d*K+f*ft,s[2]=g*A+M*y+p*G+m*V,s[6]=g*E+M*w+p*Y+m*ut,s[10]=g*P+M*k+p*z+m*dt,s[14]=g*N+M*F+p*K+m*ft,s[3]=_*A+v*y+x*G+T*V,s[7]=_*E+v*w+x*Y+T*ut,s[11]=_*P+v*k+x*z+T*dt,s[15]=_*N+v*F+x*K+T*ft,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],s=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],M=t[7],p=t[11],m=t[15];return g*(+s*l*u-i*c*u-s*a*d+n*c*d+i*a*f-n*l*f)+M*(+e*l*f-e*c*d+s*o*d-i*o*f+i*c*h-s*l*h)+p*(+e*c*u-e*a*f-s*o*u+n*o*f+s*a*h-n*c*h)+m*(-i*a*h-e*l*u+e*a*d+i*o*u-n*o*d+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],M=t[13],p=t[14],m=t[15],_=u*p*c-M*d*c+M*l*f-a*p*f-u*l*m+a*d*m,v=g*d*c-h*p*c-g*l*f+o*p*f+h*l*m-o*d*m,x=h*M*c-g*u*c+g*a*f-o*M*f-h*a*m+o*u*m,T=g*u*l-h*M*l-g*a*d+o*M*d+h*a*p-o*u*p,A=e*_+n*v+i*x+s*T;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const E=1/A;return t[0]=_*E,t[1]=(M*d*s-u*p*s-M*i*f+n*p*f+u*i*m-n*d*m)*E,t[2]=(a*p*s-M*l*s+M*i*c-n*p*c-a*i*m+n*l*m)*E,t[3]=(u*l*s-a*d*s-u*i*c+n*d*c+a*i*f-n*l*f)*E,t[4]=v*E,t[5]=(h*p*s-g*d*s+g*i*f-e*p*f-h*i*m+e*d*m)*E,t[6]=(g*l*s-o*p*s-g*i*c+e*p*c+o*i*m-e*l*m)*E,t[7]=(o*d*s-h*l*s+h*i*c-e*d*c-o*i*f+e*l*f)*E,t[8]=x*E,t[9]=(g*u*s-h*M*s-g*n*f+e*M*f+h*n*m-e*u*m)*E,t[10]=(o*M*s-g*a*s+g*n*c-e*M*c-o*n*m+e*a*m)*E,t[11]=(h*a*s-o*u*s-h*n*c+e*u*c+o*n*f-e*a*f)*E,t[12]=T*E,t[13]=(h*M*i-g*u*i+g*n*d-e*M*d-h*n*p+e*u*p)*E,t[14]=(g*a*i-o*M*i-g*n*l+e*M*l+o*n*p-e*a*p)*E,t[15]=(o*u*i-h*a*i+h*n*l-e*u*l-o*n*d+e*a*d)*E,this}scale(t){const e=this.elements,n=t.x,i=t.y,s=t.z;return e[0]*=n,e[4]*=i,e[8]*=s,e[1]*=n,e[5]*=i,e[9]*=s,e[2]*=n,e[6]*=i,e[10]*=s,e[3]*=n,e[7]*=i,e[11]*=s,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),s=1-n,o=t.x,a=t.y,l=t.z,c=s*o,h=s*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,s*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,s,o){return this.set(1,n,s,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,s=e._x,o=e._y,a=e._z,l=e._w,c=s+s,h=o+o,u=a+a,d=s*c,f=s*h,g=s*u,M=o*h,p=o*u,m=a*u,_=l*c,v=l*h,x=l*u,T=n.x,A=n.y,E=n.z;return i[0]=(1-(M+m))*T,i[1]=(f+x)*T,i[2]=(g-v)*T,i[3]=0,i[4]=(f-x)*A,i[5]=(1-(d+m))*A,i[6]=(p+_)*A,i[7]=0,i[8]=(g+v)*E,i[9]=(p-_)*E,i[10]=(1-(d+M))*E,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let s=_i.set(i[0],i[1],i[2]).length();const o=_i.set(i[4],i[5],i[6]).length(),a=_i.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),t.x=i[12],t.y=i[13],t.z=i[14],Je.copy(this);const c=1/s,h=1/o,u=1/a;return Je.elements[0]*=c,Je.elements[1]*=c,Je.elements[2]*=c,Je.elements[4]*=h,Je.elements[5]*=h,Je.elements[6]*=h,Je.elements[8]*=u,Je.elements[9]*=u,Je.elements[10]*=u,e.setFromRotationMatrix(Je),n.x=s,n.y=o,n.z=a,this}makePerspective(t,e,n,i,s,o,a=wn){const l=this.elements,c=2*s/(e-t),h=2*s/(n-i),u=(e+t)/(e-t),d=(n+i)/(n-i);let f,g;if(a===wn)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===pr)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,s,o,a=wn){const l=this.elements,c=1/(e-t),h=1/(n-i),u=1/(o-s),d=(e+t)*c,f=(n+i)*h;let g,M;if(a===wn)g=(o+s)*u,M=-2*u;else if(a===pr)g=s*u,M=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=M,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const _i=new L,Je=new re,ed=new L(0,0,0),nd=new L(1,1,1),In=new L,ks=new L,ze=new L,bl=new re,El=new Se;class pn{constructor(t=0,e=0,n=0,i=pn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,s=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(Ee(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ee(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ee(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ee(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ee(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ee(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return bl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(bl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return El.setFromEuler(this),this.setFromQuaternion(El,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}pn.DEFAULT_ORDER="XYZ";class Zc{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let id=0;const Tl=new L,Mi=new Se,_n=new re,Fs=new L,es=new L,sd=new L,rd=new Se,Al=new L(1,0,0),Rl=new L(0,1,0),Cl=new L(0,0,1),Pl={type:"added"},od={type:"removed"},yi={type:"childadded",child:null},Yr={type:"childremoved",child:null};class Te extends qi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:id++}),this.uuid=$i(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Te.DEFAULT_UP.clone();const t=new L,e=new pn,n=new Se,i=new L(1,1,1);function s(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new re},normalMatrix:{value:new Wt}}),this.matrix=new re,this.matrixWorld=new re,this.matrixAutoUpdate=Te.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Te.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Zc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Mi.setFromAxisAngle(t,e),this.quaternion.multiply(Mi),this}rotateOnWorldAxis(t,e){return Mi.setFromAxisAngle(t,e),this.quaternion.premultiply(Mi),this}rotateX(t){return this.rotateOnAxis(Al,t)}rotateY(t){return this.rotateOnAxis(Rl,t)}rotateZ(t){return this.rotateOnAxis(Cl,t)}translateOnAxis(t,e){return Tl.copy(t).applyQuaternion(this.quaternion),this.position.add(Tl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Al,t)}translateY(t){return this.translateOnAxis(Rl,t)}translateZ(t){return this.translateOnAxis(Cl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(_n.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Fs.copy(t):Fs.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),es.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?_n.lookAt(es,Fs,this.up):_n.lookAt(Fs,es,this.up),this.quaternion.setFromRotationMatrix(_n),i&&(_n.extractRotation(i.matrixWorld),Mi.setFromRotationMatrix(_n),this.quaternion.premultiply(Mi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Pl),yi.child=t,this.dispatchEvent(yi),yi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(od),Yr.child=t,this.dispatchEvent(Yr),Yr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),_n.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),_n.multiply(t.parent.matrixWorld)),t.applyMatrix4(_n),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Pl),yi.child=t,this.dispatchEvent(yi),yi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(es,t,sd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(es,rd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(t.shapes,u)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(t.materials,this.material[l]));i.material=a}else i.material=s(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(s(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}Te.DEFAULT_UP=new L(0,1,0);Te.DEFAULT_MATRIX_AUTO_UPDATE=!0;Te.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Qe=new L,Mn=new L,Kr=new L,yn=new L,Si=new L,wi=new L,Ll=new L,Zr=new L,jr=new L,Jr=new L,Qr=new fe,to=new fe,eo=new fe;class an{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Qe.subVectors(t,e),i.cross(Qe);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(t,e,n,i,s){Qe.subVectors(i,e),Mn.subVectors(n,e),Kr.subVectors(t,e);const o=Qe.dot(Qe),a=Qe.dot(Mn),l=Qe.dot(Kr),c=Mn.dot(Mn),h=Mn.dot(Kr),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;const d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return s.set(1-f-g,g,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,yn)===null?!1:yn.x>=0&&yn.y>=0&&yn.x+yn.y<=1}static getInterpolation(t,e,n,i,s,o,a,l){return this.getBarycoord(t,e,n,i,yn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,yn.x),l.addScaledVector(o,yn.y),l.addScaledVector(a,yn.z),l)}static getInterpolatedAttribute(t,e,n,i,s,o){return Qr.setScalar(0),to.setScalar(0),eo.setScalar(0),Qr.fromBufferAttribute(t,e),to.fromBufferAttribute(t,n),eo.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(Qr,s.x),o.addScaledVector(to,s.y),o.addScaledVector(eo,s.z),o}static isFrontFacing(t,e,n,i){return Qe.subVectors(n,e),Mn.subVectors(t,e),Qe.cross(Mn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Qe.subVectors(this.c,this.b),Mn.subVectors(this.a,this.b),Qe.cross(Mn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return an.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return an.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,s){return an.getInterpolation(t,this.a,this.b,this.c,e,n,i,s)}containsPoint(t){return an.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return an.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,s=this.c;let o,a;Si.subVectors(i,n),wi.subVectors(s,n),Zr.subVectors(t,n);const l=Si.dot(Zr),c=wi.dot(Zr);if(l<=0&&c<=0)return e.copy(n);jr.subVectors(t,i);const h=Si.dot(jr),u=wi.dot(jr);if(h>=0&&u<=h)return e.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Si,o);Jr.subVectors(t,s);const f=Si.dot(Jr),g=wi.dot(Jr);if(g>=0&&f<=g)return e.copy(s);const M=f*c-l*g;if(M<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(wi,a);const p=h*g-f*u;if(p<=0&&u-h>=0&&f-g>=0)return Ll.subVectors(s,i),a=(u-h)/(u-h+(f-g)),e.copy(i).addScaledVector(Ll,a);const m=1/(p+M+d);return o=M*m,a=d*m,e.copy(n).addScaledVector(Si,o).addScaledVector(wi,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const jc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Dn={h:0,s:0,l:0},Os={h:0,s:0,l:0};function no(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+(t-r)*6*e:e<1/2?t:e<2/3?r+(t-r)*6*(2/3-e):r}class Yt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ye){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ne.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=ne.workingColorSpace){return this.r=t,this.g=e,this.b=n,ne.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=ne.workingColorSpace){if(t=Gu(t,1),e=Ee(e,0,1),n=Ee(n,0,1),e===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+e):n+e-n*e,o=2*n-s;this.r=no(o,s,t+1/3),this.g=no(o,s,t),this.b=no(o,s,t-1/3)}return ne.toWorkingColorSpace(this,i),this}setStyle(t,e=Ye){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let s;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const s=i[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(s,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ye){const n=jc[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Fi(t.r),this.g=Fi(t.g),this.b=Fi(t.b),this}copyLinearToSRGB(t){return this.r=zr(t.r),this.g=zr(t.g),this.b=zr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ye){return ne.fromWorkingColorSpace(Re.copy(this),t),Math.round(Ee(Re.r*255,0,255))*65536+Math.round(Ee(Re.g*255,0,255))*256+Math.round(Ee(Re.b*255,0,255))}getHexString(t=Ye){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ne.workingColorSpace){ne.fromWorkingColorSpace(Re.copy(this),e);const n=Re.r,i=Re.g,s=Re.b,o=Math.max(n,i,s),a=Math.min(n,i,s);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(i-s)/u+(i<s?6:0);break;case i:l=(s-n)/u+2;break;case s:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ne.workingColorSpace){return ne.fromWorkingColorSpace(Re.copy(this),e),t.r=Re.r,t.g=Re.g,t.b=Re.b,t}getStyle(t=Ye){ne.fromWorkingColorSpace(Re.copy(this),t);const e=Re.r,n=Re.g,i=Re.b;return t!==Ye?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(Dn),this.setHSL(Dn.h+t,Dn.s+e,Dn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Dn),t.getHSL(Os);const n=Or(Dn.h,Os.h,e),i=Or(Dn.s,Os.s,e),s=Or(Dn.l,Os.l,e);return this.setHSL(n,i,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,s=t.elements;return this.r=s[0]*e+s[3]*n+s[6]*i,this.g=s[1]*e+s[4]*n+s[7]*i,this.b=s[2]*e+s[5]*n+s[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Re=new Yt;Yt.NAMES=jc;let ad=0;class Ts extends qi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ad++}),this.uuid=$i(),this.name="",this.type="Material",this.blending=Ni,this.side=zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Io,this.blendDst=Do,this.blendEquation=Qn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Yt(0,0,0),this.blendAlpha=0,this.depthFunc=Bi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=xl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=pi,this.stencilZFail=pi,this.stencilZPass=pi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ni&&(n.blending=this.blending),this.side!==zn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Io&&(n.blendSrc=this.blendSrc),this.blendDst!==Do&&(n.blendDst=this.blendDst),this.blendEquation!==Qn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Bi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==xl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==pi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==pi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==pi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(e){const s=i(t.textures),o=i(t.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=e[s].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Jc extends Ts{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Yt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=Dc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ge=new L,Bs=new st;class Ge{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=vl,this.updateRanges=[],this.gpuType=dn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Bs.fromBufferAttribute(this,e),Bs.applyMatrix3(t),this.setXY(e,Bs.x,Bs.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyMatrix3(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyMatrix4(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyNormalMatrix(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.transformDirection(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ji(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ue(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ji(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ji(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ji(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ji(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array),i=Ue(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,s){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array),i=Ue(i,this.array),s=Ue(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==vl&&(t.usage=this.usage),t}}class Qc extends Ge{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class th extends Ge{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ce extends Ge{constructor(t,e,n){super(new Float32Array(t),e,n)}}let ld=0;const qe=new re,io=new Te,bi=new L,He=new hi,ns=new hi,ye=new L;class Le extends qi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ld++}),this.uuid=$i(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new($c(t)?th:Qc)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Wt().getNormalMatrix(t);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return qe.makeRotationFromQuaternion(t),this.applyMatrix4(qe),this}rotateX(t){return qe.makeRotationX(t),this.applyMatrix4(qe),this}rotateY(t){return qe.makeRotationY(t),this.applyMatrix4(qe),this}rotateZ(t){return qe.makeRotationZ(t),this.applyMatrix4(qe),this}translate(t,e,n){return qe.makeTranslation(t,e,n),this.applyMatrix4(qe),this}scale(t,e,n){return qe.makeScale(t,e,n),this.applyMatrix4(qe),this}lookAt(t){return io.lookAt(t),io.updateMatrix(),this.applyMatrix4(io.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bi).negate(),this.translate(bi.x,bi.y,bi.z),this}setFromPoints(t){const e=[];for(let n=0,i=t.length;n<i;n++){const s=t[n];e.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new ce(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new hi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const s=e[n];He.setFromBufferAttribute(s),this.morphTargetsRelative?(ye.addVectors(this.boundingBox.min,He.min),this.boundingBox.expandByPoint(ye),ye.addVectors(this.boundingBox.max,He.max),this.boundingBox.expandByPoint(ye)):(this.boundingBox.expandByPoint(He.min),this.boundingBox.expandByPoint(He.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Es);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){const n=this.boundingSphere.center;if(He.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){const a=e[s];ns.setFromBufferAttribute(a),this.morphTargetsRelative?(ye.addVectors(He.min,ns.min),He.expandByPoint(ye),ye.addVectors(He.max,ns.max),He.expandByPoint(ye)):(He.expandByPoint(ns.min),He.expandByPoint(ns.max))}He.getCenter(n);let i=0;for(let s=0,o=t.count;s<o;s++)ye.fromBufferAttribute(t,s),i=Math.max(i,n.distanceToSquared(ye));if(e)for(let s=0,o=e.length;s<o;s++){const a=e[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)ye.fromBufferAttribute(a,c),l&&(bi.fromBufferAttribute(t,c),ye.add(bi)),i=Math.max(i,n.distanceToSquared(ye))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,s=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ge(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new L,l[P]=new L;const c=new L,h=new L,u=new L,d=new st,f=new st,g=new st,M=new L,p=new L;function m(P,N,y){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,N),u.fromBufferAttribute(n,y),d.fromBufferAttribute(s,P),f.fromBufferAttribute(s,N),g.fromBufferAttribute(s,y),h.sub(c),u.sub(c),f.sub(d),g.sub(d);const w=1/(f.x*g.y-g.x*f.y);isFinite(w)&&(M.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(w),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(w),a[P].add(M),a[N].add(M),a[y].add(M),l[P].add(p),l[N].add(p),l[y].add(p))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let P=0,N=_.length;P<N;++P){const y=_[P],w=y.start,k=y.count;for(let F=w,G=w+k;F<G;F+=3)m(t.getX(F+0),t.getX(F+1),t.getX(F+2))}const v=new L,x=new L,T=new L,A=new L;function E(P){T.fromBufferAttribute(i,P),A.copy(T);const N=a[P];v.copy(N),v.sub(T.multiplyScalar(T.dot(N))).normalize(),x.crossVectors(A,N);const w=x.dot(l[P])<0?-1:1;o.setXYZW(P,v.x,v.y,v.z,w)}for(let P=0,N=_.length;P<N;++P){const y=_[P],w=y.start,k=y.count;for(let F=w,G=w+k;F<G;F+=3)E(t.getX(F+0)),E(t.getX(F+1)),E(t.getX(F+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ge(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new L,s=new L,o=new L,a=new L,l=new L,c=new L,h=new L,u=new L;if(t)for(let d=0,f=t.count;d<f;d+=3){const g=t.getX(d+0),M=t.getX(d+1),p=t.getX(d+2);i.fromBufferAttribute(e,g),s.fromBufferAttribute(e,M),o.fromBufferAttribute(e,p),h.subVectors(o,s),u.subVectors(i,s),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,M),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(M,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)i.fromBufferAttribute(e,d+0),s.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,s),u.subVectors(i,s),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ye.fromBufferAttribute(t,e),ye.normalize(),t.setXYZ(e,ye.x,ye.y,ye.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let f=0,g=0;for(let M=0,p=l.length;M<p;M++){a.isInterleavedBufferAttribute?f=l[M]*a.data.stride+a.offset:f=l[M]*h;for(let m=0;m<h;m++)d[g++]=c[f++]}return new Ge(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Le,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=t(l,n);e.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const i={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(i[l]=h,s=!0)}s&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(e))}const s=t.morphAttributes;for(const c in s){const h=[],u=s[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Il=new re,$n=new td,zs=new Es,Dl=new L,Hs=new L,Gs=new L,Vs=new L,so=new L,Ws=new L,Ul=new L,Xs=new L;class ke extends Te{constructor(t=new Le,e=new Jc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const a=this.morphTargetInfluences;if(s&&a){Ws.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=a[l],u=s[l];h!==0&&(so.fromBufferAttribute(u,t),o?Ws.addScaledVector(so,h):Ws.addScaledVector(so.sub(e),h))}e.add(Ws)}return e}raycast(t,e){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),zs.copy(n.boundingSphere),zs.applyMatrix4(s),$n.copy(t.ray).recast(t.near),!(zs.containsPoint($n.origin)===!1&&($n.intersectSphere(zs,Dl)===null||$n.origin.distanceToSquared(Dl)>(t.far-t.near)**2))&&(Il.copy(s).invert(),$n.copy(t.ray).applyMatrix4(Il),!(n.boundingBox!==null&&$n.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,$n)))}_computeIntersections(t,e,n){let i;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,M=d.length;g<M;g++){const p=d[g],m=o[p.materialIndex],_=Math.max(p.start,f.start),v=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let x=_,T=v;x<T;x+=3){const A=a.getX(x),E=a.getX(x+1),P=a.getX(x+2);i=qs(this,m,t,n,c,h,u,A,E,P),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{const g=Math.max(0,f.start),M=Math.min(a.count,f.start+f.count);for(let p=g,m=M;p<m;p+=3){const _=a.getX(p),v=a.getX(p+1),x=a.getX(p+2);i=qs(this,o,t,n,c,h,u,_,v,x),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,M=d.length;g<M;g++){const p=d[g],m=o[p.materialIndex],_=Math.max(p.start,f.start),v=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let x=_,T=v;x<T;x+=3){const A=x,E=x+1,P=x+2;i=qs(this,m,t,n,c,h,u,A,E,P),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{const g=Math.max(0,f.start),M=Math.min(l.count,f.start+f.count);for(let p=g,m=M;p<m;p+=3){const _=p,v=p+1,x=p+2;i=qs(this,o,t,n,c,h,u,_,v,x),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}}}function cd(r,t,e,n,i,s,o,a){let l;if(t.side===Fe?l=n.intersectTriangle(o,s,i,!0,a):l=n.intersectTriangle(i,s,o,t.side===zn,a),l===null)return null;Xs.copy(a),Xs.applyMatrix4(r.matrixWorld);const c=e.ray.origin.distanceTo(Xs);return c<e.near||c>e.far?null:{distance:c,point:Xs.clone(),object:r}}function qs(r,t,e,n,i,s,o,a,l,c){r.getVertexPosition(a,Hs),r.getVertexPosition(l,Gs),r.getVertexPosition(c,Vs);const h=cd(r,t,e,n,Hs,Gs,Vs,Ul);if(h){const u=new L;an.getBarycoord(Ul,Hs,Gs,Vs,u),i&&(h.uv=an.getInterpolatedAttribute(i,a,l,c,u,new st)),s&&(h.uv1=an.getInterpolatedAttribute(s,a,l,c,u,new st)),o&&(h.normal=an.getInterpolatedAttribute(o,a,l,c,u,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new L,materialIndex:0};an.getNormal(Hs,Gs,Vs,d.normal),h.face=d,h.barycoord=u}return h}class Bn extends Le{constructor(t=1,e=1,n=1,i=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:s,depthSegments:o};const a=this;i=Math.floor(i),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,f=0;g("z","y","x",-1,-1,n,e,t,o,s,0),g("z","y","x",1,-1,n,e,-t,o,s,1),g("x","z","y",1,1,t,n,e,i,o,2),g("x","z","y",1,-1,t,n,-e,i,o,3),g("x","y","z",1,-1,t,e,n,i,s,4),g("x","y","z",-1,-1,t,e,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new ce(c,3)),this.setAttribute("normal",new ce(h,3)),this.setAttribute("uv",new ce(u,2));function g(M,p,m,_,v,x,T,A,E,P,N){const y=x/E,w=T/P,k=x/2,F=T/2,G=A/2,Y=E+1,z=P+1;let K=0,V=0;const ut=new L;for(let dt=0;dt<z;dt++){const ft=dt*w-F;for(let qt=0;qt<Y;qt++){const Kt=qt*y-k;ut[M]=Kt*_,ut[p]=ft*v,ut[m]=G,c.push(ut.x,ut.y,ut.z),ut[M]=0,ut[p]=0,ut[m]=A>0?1:-1,h.push(ut.x,ut.y,ut.z),u.push(qt/E),u.push(1-dt/P),K+=1}}for(let dt=0;dt<P;dt++)for(let ft=0;ft<E;ft++){const qt=d+ft+Y*dt,Kt=d+ft+Y*(dt+1),X=d+(ft+1)+Y*(dt+1),tt=d+(ft+1)+Y*dt;l.push(qt,Kt,tt),l.push(Kt,X,tt),V+=6}a.addGroup(f,V,N),f+=V,d+=K}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Bn(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Wi(r){const t={};for(const e in r){t[e]={};for(const n in r[e]){const i=r[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function Pe(r){const t={};for(let e=0;e<r.length;e++){const n=Wi(r[e]);for(const i in n)t[i]=n[i]}return t}function hd(r){const t=[];for(let e=0;e<r.length;e++)t.push(r[e].clone());return t}function eh(r){const t=r.getRenderTarget();return t===null?r.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ne.workingColorSpace}const ud={clone:Wi,merge:Pe};var dd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,fd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Hn extends Ts{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=dd,this.fragmentShader=fd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Wi(t.uniforms),this.uniformsGroups=hd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class nh extends Te{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new re,this.projectionMatrix=new re,this.projectionMatrixInverse=new re,this.coordinateSystem=wn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Un=new L,Nl=new st,kl=new st;class sn extends nh{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=ga*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Fr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return ga*2*Math.atan(Math.tan(Fr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Un.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Un.x,Un.y).multiplyScalar(-t/Un.z),Un.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Un.x,Un.y).multiplyScalar(-t/Un.z)}getViewSize(t,e){return this.getViewBounds(t,Nl,kl),e.subVectors(kl,Nl)}setViewOffset(t,e,n,i,s,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Fr*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,s=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*i/l,e-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ei=-90,Ti=1;class pd extends Te{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new sn(Ei,Ti,t,e);i.layers=this.layers,this.add(i);const s=new sn(Ei,Ti,t,e);s.layers=this.layers,this.add(s);const o=new sn(Ei,Ti,t,e);o.layers=this.layers,this.add(o);const a=new sn(Ei,Ti,t,e);a.layers=this.layers,this.add(a);const l=new sn(Ei,Ti,t,e);l.layers=this.layers,this.add(l);const c=new sn(Ei,Ti,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,s,o,a,l]=e;for(const c of e)this.remove(c);if(t===wn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===pr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const M=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,s),t.setRenderTarget(n,1,i),t.render(e,o),t.setRenderTarget(n,2,i),t.render(e,a),t.setRenderTarget(n,3,i),t.render(e,l),t.setRenderTarget(n,4,i),t.render(e,c),n.texture.generateMipmaps=M,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class ih extends Ce{constructor(t,e,n,i,s,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:zi,super(t,e,n,i,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class md extends ai{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new ih(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:on}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Bn(5,5,5),s=new Hn({name:"CubemapFromEquirect",uniforms:Wi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Fe,blending:Fn});s.uniforms.tEquirect.value=e;const o=new ke(i,s),a=e.minFilter;return e.minFilter===ni&&(e.minFilter=on),new pd(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,i){const s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(s)}}const ro=new L,gd=new L,xd=new Wt;class jn{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=ro.subVectors(n,e).cross(gd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(ro),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const s=-(t.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:e.copy(t.start).addScaledVector(n,s)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||xd.getNormalMatrix(t),i=this.coplanarPoint(ro).applyMatrix4(t),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Yn=new Es,$s=new L;class Ba{constructor(t=new jn,e=new jn,n=new jn,i=new jn,s=new jn,o=new jn){this.planes=[t,e,n,i,s,o]}set(t,e,n,i,s,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=wn){const n=this.planes,i=t.elements,s=i[0],o=i[1],a=i[2],l=i[3],c=i[4],h=i[5],u=i[6],d=i[7],f=i[8],g=i[9],M=i[10],p=i[11],m=i[12],_=i[13],v=i[14],x=i[15];if(n[0].setComponents(l-s,d-c,p-f,x-m).normalize(),n[1].setComponents(l+s,d+c,p+f,x+m).normalize(),n[2].setComponents(l+o,d+h,p+g,x+_).normalize(),n[3].setComponents(l-o,d-h,p-g,x-_).normalize(),n[4].setComponents(l-a,d-u,p-M,x-v).normalize(),e===wn)n[5].setComponents(l+a,d+u,p+M,x+v).normalize();else if(e===pr)n[5].setComponents(a,u,M,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Yn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Yn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Yn)}intersectsSprite(t){return Yn.center.set(0,0,0),Yn.radius=.7071067811865476,Yn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Yn)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if($s.x=i.normal.x>0?t.max.x:t.min.x,$s.y=i.normal.y>0?t.max.y:t.min.y,$s.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint($s)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function sh(){let r=null,t=!1,e=null,n=null;function i(s,o){e(s,o),n=r.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=r.requestAnimationFrame(i),t=!0)},stop:function(){r.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){r=s}}}function vd(r){const t=new WeakMap;function e(a,l){const c=a.array,h=a.usage,u=c.byteLength,d=r.createBuffer();r.bindBuffer(l,d),r.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=r.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=r.SHORT;else if(c instanceof Uint32Array)f=r.UNSIGNED_INT;else if(c instanceof Int32Array)f=r.INT;else if(c instanceof Int8Array)f=r.BYTE;else if(c instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const h=l.array,u=l.updateRanges;if(r.bindBuffer(c,a),u.length===0)r.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){const g=u[d],M=u[f];M.start<=g.start+g.count+1?g.count=Math.max(g.count,M.start+M.count-g.start):(++d,u[d]=M)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){const M=u[f];r.bufferSubData(c,M.start*h.BYTES_PER_ELEMENT,h,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(r.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:s,update:o}}class ri extends Le{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const s=t/2,o=e/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,u=t/a,d=e/l,f=[],g=[],M=[],p=[];for(let m=0;m<h;m++){const _=m*d-o;for(let v=0;v<c;v++){const x=v*u-s;g.push(x,-_,0),M.push(0,0,1),p.push(v/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let _=0;_<a;_++){const v=_+c*m,x=_+c*(m+1),T=_+1+c*(m+1),A=_+1+c*m;f.push(v,x,A),f.push(x,T,A)}this.setIndex(f),this.setAttribute("position",new ce(g,3)),this.setAttribute("normal",new ce(M,3)),this.setAttribute("uv",new ce(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ri(t.width,t.height,t.widthSegments,t.heightSegments)}}var _d=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Md=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,yd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Sd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,bd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ed=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Td=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ad=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Rd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Cd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Pd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ld=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Id=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Dd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ud=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Nd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,kd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Fd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Od=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Bd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,zd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Hd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Gd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Vd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Wd=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Xd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,$d=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Yd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Kd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Zd=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,jd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Jd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Qd=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,tf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ef=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,nf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,sf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,rf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,of=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,af=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,cf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,hf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,uf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,df=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,ff=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,pf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,mf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,gf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,vf=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,_f=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Mf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,yf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Sf=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,wf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bf=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ef=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Tf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Af=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Rf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Cf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Pf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Lf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,If=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Df=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Uf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Nf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,kf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ff=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Of=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Bf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Gf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Vf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Wf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Xf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,qf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,$f=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Yf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Kf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Zf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,jf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Jf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,tp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ep=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,np=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,ip=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,sp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,rp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,op=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ap=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,lp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,cp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,up=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,dp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,fp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,pp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,mp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,gp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,xp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,vp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const _p=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Mp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ep=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Tp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Ap=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Rp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Cp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Pp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ip=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Dp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Up=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Np=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,kp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Op=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,zp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Hp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Wp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$p=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Yp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Kp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,jp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Jp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Vt={alphahash_fragment:_d,alphahash_pars_fragment:Md,alphamap_fragment:yd,alphamap_pars_fragment:Sd,alphatest_fragment:wd,alphatest_pars_fragment:bd,aomap_fragment:Ed,aomap_pars_fragment:Td,batching_pars_vertex:Ad,batching_vertex:Rd,begin_vertex:Cd,beginnormal_vertex:Pd,bsdfs:Ld,iridescence_fragment:Id,bumpmap_pars_fragment:Dd,clipping_planes_fragment:Ud,clipping_planes_pars_fragment:Nd,clipping_planes_pars_vertex:kd,clipping_planes_vertex:Fd,color_fragment:Od,color_pars_fragment:Bd,color_pars_vertex:zd,color_vertex:Hd,common:Gd,cube_uv_reflection_fragment:Vd,defaultnormal_vertex:Wd,displacementmap_pars_vertex:Xd,displacementmap_vertex:qd,emissivemap_fragment:$d,emissivemap_pars_fragment:Yd,colorspace_fragment:Kd,colorspace_pars_fragment:Zd,envmap_fragment:jd,envmap_common_pars_fragment:Jd,envmap_pars_fragment:Qd,envmap_pars_vertex:tf,envmap_physical_pars_fragment:df,envmap_vertex:ef,fog_vertex:nf,fog_pars_vertex:sf,fog_fragment:rf,fog_pars_fragment:of,gradientmap_pars_fragment:af,lightmap_pars_fragment:lf,lights_lambert_fragment:cf,lights_lambert_pars_fragment:hf,lights_pars_begin:uf,lights_toon_fragment:ff,lights_toon_pars_fragment:pf,lights_phong_fragment:mf,lights_phong_pars_fragment:gf,lights_physical_fragment:xf,lights_physical_pars_fragment:vf,lights_fragment_begin:_f,lights_fragment_maps:Mf,lights_fragment_end:yf,logdepthbuf_fragment:Sf,logdepthbuf_pars_fragment:wf,logdepthbuf_pars_vertex:bf,logdepthbuf_vertex:Ef,map_fragment:Tf,map_pars_fragment:Af,map_particle_fragment:Rf,map_particle_pars_fragment:Cf,metalnessmap_fragment:Pf,metalnessmap_pars_fragment:Lf,morphinstance_vertex:If,morphcolor_vertex:Df,morphnormal_vertex:Uf,morphtarget_pars_vertex:Nf,morphtarget_vertex:kf,normal_fragment_begin:Ff,normal_fragment_maps:Of,normal_pars_fragment:Bf,normal_pars_vertex:zf,normal_vertex:Hf,normalmap_pars_fragment:Gf,clearcoat_normal_fragment_begin:Vf,clearcoat_normal_fragment_maps:Wf,clearcoat_pars_fragment:Xf,iridescence_pars_fragment:qf,opaque_fragment:$f,packing:Yf,premultiplied_alpha_fragment:Kf,project_vertex:Zf,dithering_fragment:jf,dithering_pars_fragment:Jf,roughnessmap_fragment:Qf,roughnessmap_pars_fragment:tp,shadowmap_pars_fragment:ep,shadowmap_pars_vertex:np,shadowmap_vertex:ip,shadowmask_pars_fragment:sp,skinbase_vertex:rp,skinning_pars_vertex:op,skinning_vertex:ap,skinnormal_vertex:lp,specularmap_fragment:cp,specularmap_pars_fragment:hp,tonemapping_fragment:up,tonemapping_pars_fragment:dp,transmission_fragment:fp,transmission_pars_fragment:pp,uv_pars_fragment:mp,uv_pars_vertex:gp,uv_vertex:xp,worldpos_vertex:vp,background_vert:_p,background_frag:Mp,backgroundCube_vert:yp,backgroundCube_frag:Sp,cube_vert:wp,cube_frag:bp,depth_vert:Ep,depth_frag:Tp,distanceRGBA_vert:Ap,distanceRGBA_frag:Rp,equirect_vert:Cp,equirect_frag:Pp,linedashed_vert:Lp,linedashed_frag:Ip,meshbasic_vert:Dp,meshbasic_frag:Up,meshlambert_vert:Np,meshlambert_frag:kp,meshmatcap_vert:Fp,meshmatcap_frag:Op,meshnormal_vert:Bp,meshnormal_frag:zp,meshphong_vert:Hp,meshphong_frag:Gp,meshphysical_vert:Vp,meshphysical_frag:Wp,meshtoon_vert:Xp,meshtoon_frag:qp,points_vert:$p,points_frag:Yp,shadow_vert:Kp,shadow_frag:Zp,sprite_vert:jp,sprite_frag:Jp},ct={common:{diffuse:{value:new Yt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Wt}},envmap:{envMap:{value:null},envMapRotation:{value:new Wt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Wt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Wt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Wt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Wt},normalScale:{value:new st(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Wt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Wt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Wt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Wt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Yt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Yt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0},uvTransform:{value:new Wt}},sprite:{diffuse:{value:new Yt(16777215)},opacity:{value:1},center:{value:new st(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}}},hn={basic:{uniforms:Pe([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.fog]),vertexShader:Vt.meshbasic_vert,fragmentShader:Vt.meshbasic_frag},lambert:{uniforms:Pe([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Yt(0)}}]),vertexShader:Vt.meshlambert_vert,fragmentShader:Vt.meshlambert_frag},phong:{uniforms:Pe([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Yt(0)},specular:{value:new Yt(1118481)},shininess:{value:30}}]),vertexShader:Vt.meshphong_vert,fragmentShader:Vt.meshphong_frag},standard:{uniforms:Pe([ct.common,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.roughnessmap,ct.metalnessmap,ct.fog,ct.lights,{emissive:{value:new Yt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag},toon:{uniforms:Pe([ct.common,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.gradientmap,ct.fog,ct.lights,{emissive:{value:new Yt(0)}}]),vertexShader:Vt.meshtoon_vert,fragmentShader:Vt.meshtoon_frag},matcap:{uniforms:Pe([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,{matcap:{value:null}}]),vertexShader:Vt.meshmatcap_vert,fragmentShader:Vt.meshmatcap_frag},points:{uniforms:Pe([ct.points,ct.fog]),vertexShader:Vt.points_vert,fragmentShader:Vt.points_frag},dashed:{uniforms:Pe([ct.common,ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Vt.linedashed_vert,fragmentShader:Vt.linedashed_frag},depth:{uniforms:Pe([ct.common,ct.displacementmap]),vertexShader:Vt.depth_vert,fragmentShader:Vt.depth_frag},normal:{uniforms:Pe([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,{opacity:{value:1}}]),vertexShader:Vt.meshnormal_vert,fragmentShader:Vt.meshnormal_frag},sprite:{uniforms:Pe([ct.sprite,ct.fog]),vertexShader:Vt.sprite_vert,fragmentShader:Vt.sprite_frag},background:{uniforms:{uvTransform:{value:new Wt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Vt.background_vert,fragmentShader:Vt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Wt}},vertexShader:Vt.backgroundCube_vert,fragmentShader:Vt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Vt.cube_vert,fragmentShader:Vt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Vt.equirect_vert,fragmentShader:Vt.equirect_frag},distanceRGBA:{uniforms:Pe([ct.common,ct.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Vt.distanceRGBA_vert,fragmentShader:Vt.distanceRGBA_frag},shadow:{uniforms:Pe([ct.lights,ct.fog,{color:{value:new Yt(0)},opacity:{value:1}}]),vertexShader:Vt.shadow_vert,fragmentShader:Vt.shadow_frag}};hn.physical={uniforms:Pe([hn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Wt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Wt},clearcoatNormalScale:{value:new st(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Wt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Wt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Wt},sheen:{value:0},sheenColor:{value:new Yt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Wt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Wt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Wt},transmissionSamplerSize:{value:new st},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Wt},attenuationDistance:{value:0},attenuationColor:{value:new Yt(0)},specularColor:{value:new Yt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Wt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Wt},anisotropyVector:{value:new st},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Wt}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag};const Ys={r:0,b:0,g:0},Kn=new pn,Qp=new re;function tm(r,t,e,n,i,s,o){const a=new Yt(0);let l=s===!0?0:1,c,h,u=null,d=0,f=null;function g(_){let v=_.isScene===!0?_.background:null;return v&&v.isTexture&&(v=(_.backgroundBlurriness>0?e:t).get(v)),v}function M(_){let v=!1;const x=g(_);x===null?m(a,l):x&&x.isColor&&(m(x,1),v=!0);const T=r.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,o):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(r.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function p(_,v){const x=g(v);x&&(x.isCubeTexture||x.mapping===yr)?(h===void 0&&(h=new ke(new Bn(1,1,1),new Hn({name:"BackgroundCubeMaterial",uniforms:Wi(hn.backgroundCube.uniforms),vertexShader:hn.backgroundCube.vertexShader,fragmentShader:hn.backgroundCube.fragmentShader,side:Fe,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(T,A,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Kn.copy(v.backgroundRotation),Kn.x*=-1,Kn.y*=-1,Kn.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Kn.y*=-1,Kn.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Qp.makeRotationFromEuler(Kn)),h.material.toneMapped=ne.getTransfer(x.colorSpace)!==le,(u!==x||d!==x.version||f!==r.toneMapping)&&(h.material.needsUpdate=!0,u=x,d=x.version,f=r.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new ke(new ri(2,2),new Hn({name:"BackgroundMaterial",uniforms:Wi(hn.background.uniforms),vertexShader:hn.background.vertexShader,fragmentShader:hn.background.fragmentShader,side:zn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=ne.getTransfer(x.colorSpace)!==le,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||d!==x.version||f!==r.toneMapping)&&(c.material.needsUpdate=!0,u=x,d=x.version,f=r.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function m(_,v){_.getRGB(Ys,eh(r)),n.buffers.color.setClear(Ys.r,Ys.g,Ys.b,v,o)}return{getClearColor:function(){return a},setClearColor:function(_,v=1){a.set(_),l=v,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,m(a,l)},render:M,addToRenderList:p}}function em(r,t){const e=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=d(null);let s=i,o=!1;function a(y,w,k,F,G){let Y=!1;const z=u(F,k,w);s!==z&&(s=z,c(s.object)),Y=f(y,F,k,G),Y&&g(y,F,k,G),G!==null&&t.update(G,r.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,x(y,w,k,F),G!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(G).buffer))}function l(){return r.createVertexArray()}function c(y){return r.bindVertexArray(y)}function h(y){return r.deleteVertexArray(y)}function u(y,w,k){const F=k.wireframe===!0;let G=n[y.id];G===void 0&&(G={},n[y.id]=G);let Y=G[w.id];Y===void 0&&(Y={},G[w.id]=Y);let z=Y[F];return z===void 0&&(z=d(l()),Y[F]=z),z}function d(y){const w=[],k=[],F=[];for(let G=0;G<e;G++)w[G]=0,k[G]=0,F[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:k,attributeDivisors:F,object:y,attributes:{},index:null}}function f(y,w,k,F){const G=s.attributes,Y=w.attributes;let z=0;const K=k.getAttributes();for(const V in K)if(K[V].location>=0){const dt=G[V];let ft=Y[V];if(ft===void 0&&(V==="instanceMatrix"&&y.instanceMatrix&&(ft=y.instanceMatrix),V==="instanceColor"&&y.instanceColor&&(ft=y.instanceColor)),dt===void 0||dt.attribute!==ft||ft&&dt.data!==ft.data)return!0;z++}return s.attributesNum!==z||s.index!==F}function g(y,w,k,F){const G={},Y=w.attributes;let z=0;const K=k.getAttributes();for(const V in K)if(K[V].location>=0){let dt=Y[V];dt===void 0&&(V==="instanceMatrix"&&y.instanceMatrix&&(dt=y.instanceMatrix),V==="instanceColor"&&y.instanceColor&&(dt=y.instanceColor));const ft={};ft.attribute=dt,dt&&dt.data&&(ft.data=dt.data),G[V]=ft,z++}s.attributes=G,s.attributesNum=z,s.index=F}function M(){const y=s.newAttributes;for(let w=0,k=y.length;w<k;w++)y[w]=0}function p(y){m(y,0)}function m(y,w){const k=s.newAttributes,F=s.enabledAttributes,G=s.attributeDivisors;k[y]=1,F[y]===0&&(r.enableVertexAttribArray(y),F[y]=1),G[y]!==w&&(r.vertexAttribDivisor(y,w),G[y]=w)}function _(){const y=s.newAttributes,w=s.enabledAttributes;for(let k=0,F=w.length;k<F;k++)w[k]!==y[k]&&(r.disableVertexAttribArray(k),w[k]=0)}function v(y,w,k,F,G,Y,z){z===!0?r.vertexAttribIPointer(y,w,k,G,Y):r.vertexAttribPointer(y,w,k,F,G,Y)}function x(y,w,k,F){M();const G=F.attributes,Y=k.getAttributes(),z=w.defaultAttributeValues;for(const K in Y){const V=Y[K];if(V.location>=0){let ut=G[K];if(ut===void 0&&(K==="instanceMatrix"&&y.instanceMatrix&&(ut=y.instanceMatrix),K==="instanceColor"&&y.instanceColor&&(ut=y.instanceColor)),ut!==void 0){const dt=ut.normalized,ft=ut.itemSize,qt=t.get(ut);if(qt===void 0)continue;const Kt=qt.buffer,X=qt.type,tt=qt.bytesPerElement,wt=X===r.INT||X===r.UNSIGNED_INT||ut.gpuType===La;if(ut.isInterleavedBufferAttribute){const ht=ut.data,Ut=ht.stride,Dt=ut.offset;if(ht.isInstancedInterleavedBuffer){for(let Ht=0;Ht<V.locationSize;Ht++)m(V.location+Ht,ht.meshPerAttribute);y.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let Ht=0;Ht<V.locationSize;Ht++)p(V.location+Ht);r.bindBuffer(r.ARRAY_BUFFER,Kt);for(let Ht=0;Ht<V.locationSize;Ht++)v(V.location+Ht,ft/V.locationSize,X,dt,Ut*tt,(Dt+ft/V.locationSize*Ht)*tt,wt)}else{if(ut.isInstancedBufferAttribute){for(let ht=0;ht<V.locationSize;ht++)m(V.location+ht,ut.meshPerAttribute);y.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ut.meshPerAttribute*ut.count)}else for(let ht=0;ht<V.locationSize;ht++)p(V.location+ht);r.bindBuffer(r.ARRAY_BUFFER,Kt);for(let ht=0;ht<V.locationSize;ht++)v(V.location+ht,ft/V.locationSize,X,dt,ft*tt,ft/V.locationSize*ht*tt,wt)}}else if(z!==void 0){const dt=z[K];if(dt!==void 0)switch(dt.length){case 2:r.vertexAttrib2fv(V.location,dt);break;case 3:r.vertexAttrib3fv(V.location,dt);break;case 4:r.vertexAttrib4fv(V.location,dt);break;default:r.vertexAttrib1fv(V.location,dt)}}}}_()}function T(){P();for(const y in n){const w=n[y];for(const k in w){const F=w[k];for(const G in F)h(F[G].object),delete F[G];delete w[k]}delete n[y]}}function A(y){if(n[y.id]===void 0)return;const w=n[y.id];for(const k in w){const F=w[k];for(const G in F)h(F[G].object),delete F[G];delete w[k]}delete n[y.id]}function E(y){for(const w in n){const k=n[w];if(k[y.id]===void 0)continue;const F=k[y.id];for(const G in F)h(F[G].object),delete F[G];delete k[y.id]}}function P(){N(),o=!0,s!==i&&(s=i,c(s.object))}function N(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:P,resetDefaultState:N,dispose:T,releaseStatesOfGeometry:A,releaseStatesOfProgram:E,initAttributes:M,enableAttribute:p,disableUnusedAttributes:_}}function nm(r,t,e){let n;function i(c){n=c}function s(c,h){r.drawArrays(n,c,h),e.update(h,n,1)}function o(c,h,u){u!==0&&(r.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function a(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];e.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let M=0;M<u;M++)g+=h[M];for(let M=0;M<d.length;M++)e.update(g,n,d[M])}}this.setMode=i,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function im(r,t,e,n){let i;function s(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const E=t.get("EXT_texture_filter_anisotropic");i=r.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(E){return!(E!==ln&&n.convert(E)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){const P=E===bs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==Tn&&n.convert(E)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==dn&&!P)}function l(E){if(E==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(d===!0){const E=t.get("EXT_clip_control");E.clipControlEXT(E.LOWER_LEFT_EXT,E.ZERO_TO_ONE_EXT)}const f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=r.getParameter(r.MAX_TEXTURE_SIZE),p=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),m=r.getParameter(r.MAX_VERTEX_ATTRIBS),_=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),v=r.getParameter(r.MAX_VARYING_VECTORS),x=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),T=g>0,A=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:M,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:_,maxVaryings:v,maxFragmentUniforms:x,vertexTextures:T,maxSamples:A}}function sm(r){const t=this;let e=null,n=0,i=!1,s=!1;const o=new jn,a=new Wt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){const g=u.clippingPlanes,M=u.clipIntersection,p=u.clipShadows,m=r.get(u);if(!i||g===null||g.length===0||s&&!p)s?h(null):c();else{const _=s?0:n,v=_*4;let x=m.clippingState||null;l.value=x,x=h(g,d,v,f);for(let T=0;T!==v;++T)x[T]=e[T];m.clippingState=x,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,g){const M=u!==null?u.length:0;let p=null;if(M!==0){if(p=l.value,g!==!0||p===null){const m=f+M*4,_=d.matrixWorldInverse;a.getNormalMatrix(_),(p===null||p.length<m)&&(p=new Float32Array(m));for(let v=0,x=f;v!==M;++v,x+=4)o.copy(u[v]).applyMatrix4(_,a),o.normal.toArray(p,x),p[x+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=M,t.numIntersection=0,p}}function rm(r){let t=new WeakMap;function e(o,a){return a===Ho?o.mapping=zi:a===Go&&(o.mapping=Hi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Ho||a===Go)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new md(l.height);return c.fromEquirectangularTexture(r,o),t.set(o,c),o.addEventListener("dispose",i),e(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function s(){t=new WeakMap}return{get:n,dispose:s}}class za extends nh{constructor(t=-1,e=1,n=1,i=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-t,o=n+t,a=i+e,l=i-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Li=4,Fl=[.125,.215,.35,.446,.526,.582],ti=20,oo=new za,Ol=new Yt;let ao=null,lo=0,co=0,ho=!1;const Jn=(1+Math.sqrt(5))/2,Ai=1/Jn,Bl=[new L(-Jn,Ai,0),new L(Jn,Ai,0),new L(-Ai,0,Jn),new L(Ai,0,Jn),new L(0,Jn,-Ai),new L(0,Jn,Ai),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class zl{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){ao=this._renderer.getRenderTarget(),lo=this._renderer.getActiveCubeFace(),co=this._renderer.getActiveMipmapLevel(),ho=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(t,n,i,s),e>0&&this._blur(s,0,0,e),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Gl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ao,lo,co),this._renderer.xr.enabled=ho,t.scissorTest=!1,Ks(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===zi||t.mapping===Hi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ao=this._renderer.getRenderTarget(),lo=this._renderer.getActiveCubeFace(),co=this._renderer.getActiveMipmapLevel(),ho=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:on,minFilter:on,generateMipmaps:!1,type:bs,format:ln,colorSpace:Gn,depthBuffer:!1},i=Hl(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Hl(t,e,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=om(s)),this._blurMaterial=am(s,t,e)}return i}_compileMaterial(t){const e=new ke(this._lodPlanes[0],t);this._renderer.compile(e,oo)}_sceneToCubeUV(t,e,n,i){const a=new sn(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(Ol),h.toneMapping=On,h.autoClear=!1;const f=new Jc({name:"PMREM.Background",side:Fe,depthWrite:!1,depthTest:!1}),g=new ke(new Bn,f);let M=!1;const p=t.background;p?p.isColor&&(f.color.copy(p),t.background=null,M=!0):(f.color.copy(Ol),M=!0);for(let m=0;m<6;m++){const _=m%3;_===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):_===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));const v=this._cubeSize;Ks(i,_*v,m>2?v:0,v,v),h.setRenderTarget(i),M&&h.render(g,a),h.render(t,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,t.background=p}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===zi||t.mapping===Hi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vl()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Gl());const s=i?this._cubemapMaterial:this._equirectMaterial,o=new ke(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=t;const l=this._cubeSize;Ks(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,oo)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Bl[(i-s-1)%Bl.length];this._blur(t,s-1,s,o,a)}e.autoClear=n}_blur(t,e,n,i,s){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,i,"latitudinal",s),this._halfBlur(o,t,n,n,i,"longitudinal",s)}_halfBlur(t,e,n,i,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ke(this._lodPlanes[i],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*ti-1),M=s/g,p=isFinite(s)?1+Math.floor(h*M):ti;p>ti&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${ti}`);const m=[];let _=0;for(let E=0;E<ti;++E){const P=E/M,N=Math.exp(-P*P/2);m.push(N),E===0?_+=N:E<p&&(_+=2*N)}for(let E=0;E<m.length;E++)m[E]=m[E]/_;d.envMap.value=t.texture,d.samples.value=p,d.weights.value=m,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:v}=this;d.dTheta.value=g,d.mipInt.value=v-n;const x=this._sizeLods[i],T=3*x*(i>v-Li?i-v+Li:0),A=4*(this._cubeSize-x);Ks(e,T,A,3*x,2*x),l.setRenderTarget(e),l.render(u,oo)}}function om(r){const t=[],e=[],n=[];let i=r;const s=r-Li+1+Fl.length;for(let o=0;o<s;o++){const a=Math.pow(2,i);e.push(a);let l=1/a;o>r-Li?l=Fl[o-r+Li-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,M=3,p=2,m=1,_=new Float32Array(M*g*f),v=new Float32Array(p*g*f),x=new Float32Array(m*g*f);for(let A=0;A<f;A++){const E=A%3*2/3-1,P=A>2?0:-1,N=[E,P,0,E+2/3,P,0,E+2/3,P+1,0,E,P,0,E+2/3,P+1,0,E,P+1,0];_.set(N,M*g*A),v.set(d,p*g*A);const y=[A,A,A,A,A,A];x.set(y,m*g*A)}const T=new Le;T.setAttribute("position",new Ge(_,M)),T.setAttribute("uv",new Ge(v,p)),T.setAttribute("faceIndex",new Ge(x,m)),t.push(T),i>Li&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Hl(r,t,e){const n=new ai(r,t,e);return n.texture.mapping=yr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ks(r,t,e,n,i){r.viewport.set(t,e,n,i),r.scissor.set(t,e,n,i)}function am(r,t,e){const n=new Float32Array(ti),i=new L(0,1,0);return new Hn({name:"SphericalGaussianBlur",defines:{n:ti,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Ha(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Gl(){return new Hn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ha(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Vl(){return new Hn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ha(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Ha(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function lm(r){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Ho||l===Go,h=l===zi||l===Hi;if(c||h){let u=t.get(a);const d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new zl(r)),u=c?e.fromEquirectangular(a,u):e.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&i(f)?(e===null&&(e=new zl(r)),u=c?e.fromEquirectangular(a):e.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",s),u.texture):null}}}return a}function i(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function cm(r){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&lr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function hm(r,t,e,n){const i={},s=new WeakMap;function o(u){const d=u.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);for(const g in d.morphAttributes){const M=d.morphAttributes[g];for(let p=0,m=M.length;p<m;p++)t.remove(M[p])}d.removeEventListener("dispose",o),delete i[d.id];const f=s.get(d);f&&(t.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,e.memory.geometries++),d}function l(u){const d=u.attributes;for(const g in d)t.update(d[g],r.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const M=f[g];for(let p=0,m=M.length;p<m;p++)t.update(M[p],r.ARRAY_BUFFER)}}function c(u){const d=[],f=u.index,g=u.attributes.position;let M=0;if(f!==null){const _=f.array;M=f.version;for(let v=0,x=_.length;v<x;v+=3){const T=_[v+0],A=_[v+1],E=_[v+2];d.push(T,A,A,E,E,T)}}else if(g!==void 0){const _=g.array;M=g.version;for(let v=0,x=_.length/3-1;v<x;v+=3){const T=v+0,A=v+1,E=v+2;d.push(T,A,A,E,E,T)}}else return;const p=new($c(d)?th:Qc)(d,1);p.version=M;const m=s.get(u);m&&t.remove(m),s.set(u,p)}function h(u){const d=s.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function um(r,t,e){let n;function i(d){n=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function l(d,f){r.drawElements(n,f,s,d*o),e.update(f,n,1)}function c(d,f,g){g!==0&&(r.drawElementsInstanced(n,f,s,d*o,g),e.update(f,n,g))}function h(d,f,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,d,0,g);let p=0;for(let m=0;m<g;m++)p+=f[m];e.update(p,n,1)}function u(d,f,g,M){if(g===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<d.length;m++)c(d[m]/o,f[m],M[m]);else{p.multiDrawElementsInstancedWEBGL(n,f,0,s,d,0,M,0,g);let m=0;for(let _=0;_<g;_++)m+=f[_];for(let _=0;_<M.length;_++)e.update(m,n,M[_])}}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function dm(r){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(e.calls++,o){case r.TRIANGLES:e.triangles+=a*(s/3);break;case r.LINES:e.lines+=a*(s/2);break;case r.LINE_STRIP:e.lines+=a*(s-1);break;case r.LINE_LOOP:e.lines+=a*s;break;case r.POINTS:e.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function fm(r,t,e){const n=new WeakMap,i=new fe;function s(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(a);if(d===void 0||d.count!==u){let y=function(){P.dispose(),n.delete(a),a.removeEventListener("dispose",y)};var f=y;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,M=a.morphAttributes.normal!==void 0,p=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],_=a.morphAttributes.normal||[],v=a.morphAttributes.color||[];let x=0;g===!0&&(x=1),M===!0&&(x=2),p===!0&&(x=3);let T=a.attributes.position.count*x,A=1;T>t.maxTextureSize&&(A=Math.ceil(T/t.maxTextureSize),T=t.maxTextureSize);const E=new Float32Array(T*A*4*u),P=new Kc(E,T,A,u);P.type=dn,P.needsUpdate=!0;const N=x*4;for(let w=0;w<u;w++){const k=m[w],F=_[w],G=v[w],Y=T*A*4*w;for(let z=0;z<k.count;z++){const K=z*N;g===!0&&(i.fromBufferAttribute(k,z),E[Y+K+0]=i.x,E[Y+K+1]=i.y,E[Y+K+2]=i.z,E[Y+K+3]=0),M===!0&&(i.fromBufferAttribute(F,z),E[Y+K+4]=i.x,E[Y+K+5]=i.y,E[Y+K+6]=i.z,E[Y+K+7]=0),p===!0&&(i.fromBufferAttribute(G,z),E[Y+K+8]=i.x,E[Y+K+9]=i.y,E[Y+K+10]=i.z,E[Y+K+11]=G.itemSize===4?i.w:1)}}d={count:u,texture:P,size:new st(T,A)},n.set(a,d),a.addEventListener("dispose",y)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",o.morphTexture,e);else{let g=0;for(let p=0;p<c.length;p++)g+=c[p];const M=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(r,"morphTargetBaseInfluence",M),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function pm(r,t,e,n){let i=new WeakMap;function s(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(i.get(u)!==c&&(t.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(e.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,r.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:s,dispose:o}}class rh extends Ce{constructor(t,e,n,i,s,o,a,l,c,h=ki){if(h!==ki&&h!==Vi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===ki&&(n=oi),n===void 0&&h===Vi&&(n=Gi),super(null,i,s,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:Ne,this.minFilter=l!==void 0?l:Ne,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const oh=new Ce,Wl=new rh(1,1),ah=new Kc,lh=new Ju,ch=new ih,Xl=[],ql=[],$l=new Float32Array(16),Yl=new Float32Array(9),Kl=new Float32Array(4);function Yi(r,t,e){const n=r[0];if(n<=0||n>0)return r;const i=t*e;let s=Xl[i];if(s===void 0&&(s=new Float32Array(i),Xl[i]=s),t!==0){n.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=e,r[o].toArray(s,a)}return s}function _e(r,t){if(r.length!==t.length)return!1;for(let e=0,n=r.length;e<n;e++)if(r[e]!==t[e])return!1;return!0}function Me(r,t){for(let e=0,n=t.length;e<n;e++)r[e]=t[e]}function wr(r,t){let e=ql[t];e===void 0&&(e=new Int32Array(t),ql[t]=e);for(let n=0;n!==t;++n)e[n]=r.allocateTextureUnit();return e}function mm(r,t){const e=this.cache;e[0]!==t&&(r.uniform1f(this.addr,t),e[0]=t)}function gm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;r.uniform2fv(this.addr,t),Me(e,t)}}function xm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(_e(e,t))return;r.uniform3fv(this.addr,t),Me(e,t)}}function vm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;r.uniform4fv(this.addr,t),Me(e,t)}}function _m(r,t){const e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;r.uniformMatrix2fv(this.addr,!1,t),Me(e,t)}else{if(_e(e,n))return;Kl.set(n),r.uniformMatrix2fv(this.addr,!1,Kl),Me(e,n)}}function Mm(r,t){const e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;r.uniformMatrix3fv(this.addr,!1,t),Me(e,t)}else{if(_e(e,n))return;Yl.set(n),r.uniformMatrix3fv(this.addr,!1,Yl),Me(e,n)}}function ym(r,t){const e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;r.uniformMatrix4fv(this.addr,!1,t),Me(e,t)}else{if(_e(e,n))return;$l.set(n),r.uniformMatrix4fv(this.addr,!1,$l),Me(e,n)}}function Sm(r,t){const e=this.cache;e[0]!==t&&(r.uniform1i(this.addr,t),e[0]=t)}function wm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;r.uniform2iv(this.addr,t),Me(e,t)}}function bm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_e(e,t))return;r.uniform3iv(this.addr,t),Me(e,t)}}function Em(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;r.uniform4iv(this.addr,t),Me(e,t)}}function Tm(r,t){const e=this.cache;e[0]!==t&&(r.uniform1ui(this.addr,t),e[0]=t)}function Am(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;r.uniform2uiv(this.addr,t),Me(e,t)}}function Rm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_e(e,t))return;r.uniform3uiv(this.addr,t),Me(e,t)}}function Cm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;r.uniform4uiv(this.addr,t),Me(e,t)}}function Pm(r,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(Wl.compareFunction=qc,s=Wl):s=oh,e.setTexture2D(t||s,i)}function Lm(r,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||lh,i)}function Im(r,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||ch,i)}function Dm(r,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||ah,i)}function Um(r){switch(r){case 5126:return mm;case 35664:return gm;case 35665:return xm;case 35666:return vm;case 35674:return _m;case 35675:return Mm;case 35676:return ym;case 5124:case 35670:return Sm;case 35667:case 35671:return wm;case 35668:case 35672:return bm;case 35669:case 35673:return Em;case 5125:return Tm;case 36294:return Am;case 36295:return Rm;case 36296:return Cm;case 35678:case 36198:case 36298:case 36306:case 35682:return Pm;case 35679:case 36299:case 36307:return Lm;case 35680:case 36300:case 36308:case 36293:return Im;case 36289:case 36303:case 36311:case 36292:return Dm}}function Nm(r,t){r.uniform1fv(this.addr,t)}function km(r,t){const e=Yi(t,this.size,2);r.uniform2fv(this.addr,e)}function Fm(r,t){const e=Yi(t,this.size,3);r.uniform3fv(this.addr,e)}function Om(r,t){const e=Yi(t,this.size,4);r.uniform4fv(this.addr,e)}function Bm(r,t){const e=Yi(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function zm(r,t){const e=Yi(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function Hm(r,t){const e=Yi(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function Gm(r,t){r.uniform1iv(this.addr,t)}function Vm(r,t){r.uniform2iv(this.addr,t)}function Wm(r,t){r.uniform3iv(this.addr,t)}function Xm(r,t){r.uniform4iv(this.addr,t)}function qm(r,t){r.uniform1uiv(this.addr,t)}function $m(r,t){r.uniform2uiv(this.addr,t)}function Ym(r,t){r.uniform3uiv(this.addr,t)}function Km(r,t){r.uniform4uiv(this.addr,t)}function Zm(r,t,e){const n=this.cache,i=t.length,s=wr(e,i);_e(n,s)||(r.uniform1iv(this.addr,s),Me(n,s));for(let o=0;o!==i;++o)e.setTexture2D(t[o]||oh,s[o])}function jm(r,t,e){const n=this.cache,i=t.length,s=wr(e,i);_e(n,s)||(r.uniform1iv(this.addr,s),Me(n,s));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||lh,s[o])}function Jm(r,t,e){const n=this.cache,i=t.length,s=wr(e,i);_e(n,s)||(r.uniform1iv(this.addr,s),Me(n,s));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||ch,s[o])}function Qm(r,t,e){const n=this.cache,i=t.length,s=wr(e,i);_e(n,s)||(r.uniform1iv(this.addr,s),Me(n,s));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||ah,s[o])}function t0(r){switch(r){case 5126:return Nm;case 35664:return km;case 35665:return Fm;case 35666:return Om;case 35674:return Bm;case 35675:return zm;case 35676:return Hm;case 5124:case 35670:return Gm;case 35667:case 35671:return Vm;case 35668:case 35672:return Wm;case 35669:case 35673:return Xm;case 5125:return qm;case 36294:return $m;case 36295:return Ym;case 36296:return Km;case 35678:case 36198:case 36298:case 36306:case 35682:return Zm;case 35679:case 36299:case 36307:return jm;case 35680:case 36300:case 36308:case 36293:return Jm;case 36289:case 36303:case 36311:case 36292:return Qm}}class e0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Um(e.type)}}class n0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=t0(e.type)}}class i0{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let s=0,o=i.length;s!==o;++s){const a=i[s];a.setValue(t,e[a.id],n)}}}const uo=/(\w+)(\])?(\[|\.)?/g;function Zl(r,t){r.seq.push(t),r.map[t.id]=t}function s0(r,t,e){const n=r.name,i=n.length;for(uo.lastIndex=0;;){const s=uo.exec(n),o=uo.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Zl(e,c===void 0?new e0(a,r,t):new n0(a,r,t));break}else{let u=e.map[a];u===void 0&&(u=new i0(a),Zl(e,u)),e=u}}}class cr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=t.getActiveUniform(e,i),o=t.getUniformLocation(e,s.name);s0(s,o,this)}}setValue(t,e,n,i){const s=this.map[e];s!==void 0&&s.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let s=0,o=e.length;s!==o;++s){const a=e[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,s=t.length;i!==s;++i){const o=t[i];o.id in e&&n.push(o)}return n}}function jl(r,t,e){const n=r.createShader(t);return r.shaderSource(n,e),r.compileShader(n),n}const r0=37297;let o0=0;function a0(r,t){const e=r.split(`
`),n=[],i=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let o=i;o<s;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function l0(r){const t=ne.getPrimaries(ne.workingColorSpace),e=ne.getPrimaries(r);let n;switch(t===e?n="":t===fr&&e===dr?n="LinearDisplayP3ToLinearSRGB":t===dr&&e===fr&&(n="LinearSRGBToLinearDisplayP3"),r){case Gn:case Sr:return[n,"LinearTransferOETF"];case Ye:case Oa:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",r),[n,"LinearTransferOETF"]}}function Jl(r,t,e){const n=r.getShaderParameter(t,r.COMPILE_STATUS),i=r.getShaderInfoLog(t).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const o=parseInt(s[1]);return e.toUpperCase()+`

`+i+`

`+a0(r.getShaderSource(t),o)}else return i}function c0(r,t){const e=l0(t);return`vec4 ${r}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function h0(r,t){let e;switch(t){case bu:e="Linear";break;case Eu:e="Reinhard";break;case Tu:e="Cineon";break;case Uc:e="ACESFilmic";break;case Ru:e="AgX";break;case Cu:e="Neutral";break;case Au:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Zs=new L;function u0(){ne.getLuminanceCoefficients(Zs);const r=Zs.x.toFixed(4),t=Zs.y.toFixed(4),e=Zs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function d0(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(as).join(`
`)}function f0(r){const t=[];for(const e in r){const n=r[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function p0(r,t){const e={},n=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(t,i),o=s.name;let a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),e[o]={type:s.type,location:r.getAttribLocation(t,o),locationSize:a}}return e}function as(r){return r!==""}function Ql(r,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function tc(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const m0=/^[ \t]*#include +<([\w\d./]+)>/gm;function xa(r){return r.replace(m0,x0)}const g0=new Map;function x0(r,t){let e=Vt[t];if(e===void 0){const n=g0.get(t);if(n!==void 0)e=Vt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return xa(e)}const v0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ec(r){return r.replace(v0,_0)}function _0(r,t,e,n){let i="";for(let s=parseInt(t);s<parseInt(e);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function nc(r){let t=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?t+=`
#define HIGH_PRECISION`:r.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function M0(r){let t="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===Lc?t="SHADOWMAP_TYPE_PCF":r.shadowMapType===Ic?t="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Sn&&(t="SHADOWMAP_TYPE_VSM"),t}function y0(r){let t="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case zi:case Hi:t="ENVMAP_TYPE_CUBE";break;case yr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function S0(r){let t="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Hi:t="ENVMAP_MODE_REFRACTION";break}return t}function w0(r){let t="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case Dc:t="ENVMAP_BLENDING_MULTIPLY";break;case Su:t="ENVMAP_BLENDING_MIX";break;case wu:t="ENVMAP_BLENDING_ADD";break}return t}function b0(r){const t=r.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function E0(r,t,e,n){const i=r.getContext(),s=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=M0(e),c=y0(e),h=S0(e),u=w0(e),d=b0(e),f=d0(e),g=f0(s),M=i.createProgram();let p,m,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(as).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(as).join(`
`),m.length>0&&(m+=`
`)):(p=[nc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(as).join(`
`),m=[nc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==On?"#define TONE_MAPPING":"",e.toneMapping!==On?Vt.tonemapping_pars_fragment:"",e.toneMapping!==On?h0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Vt.colorspace_pars_fragment,c0("linearToOutputTexel",e.outputColorSpace),u0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(as).join(`
`)),o=xa(o),o=Ql(o,e),o=tc(o,e),a=xa(a),a=Ql(a,e),a=tc(a,e),o=ec(o),a=ec(a),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===_l?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===_l?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const v=_+p+o,x=_+m+a,T=jl(i,i.VERTEX_SHADER,v),A=jl(i,i.FRAGMENT_SHADER,x);i.attachShader(M,T),i.attachShader(M,A),e.index0AttributeName!==void 0?i.bindAttribLocation(M,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(M,0,"position"),i.linkProgram(M);function E(w){if(r.debug.checkShaderErrors){const k=i.getProgramInfoLog(M).trim(),F=i.getShaderInfoLog(T).trim(),G=i.getShaderInfoLog(A).trim();let Y=!0,z=!0;if(i.getProgramParameter(M,i.LINK_STATUS)===!1)if(Y=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,M,T,A);else{const K=Jl(i,T,"vertex"),V=Jl(i,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(M,i.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+k+`
`+K+`
`+V)}else k!==""?console.warn("THREE.WebGLProgram: Program Info Log:",k):(F===""||G==="")&&(z=!1);z&&(w.diagnostics={runnable:Y,programLog:k,vertexShader:{log:F,prefix:p},fragmentShader:{log:G,prefix:m}})}i.deleteShader(T),i.deleteShader(A),P=new cr(i,M),N=p0(i,M)}let P;this.getUniforms=function(){return P===void 0&&E(this),P};let N;this.getAttributes=function(){return N===void 0&&E(this),N};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=i.getProgramParameter(M,r0)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(M),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=o0++,this.cacheKey=t,this.usedTimes=1,this.program=M,this.vertexShader=T,this.fragmentShader=A,this}let T0=0;class A0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new R0(t),e.set(t,n)),n}}class R0{constructor(t){this.id=T0++,this.code=t,this.usedTimes=0}}function C0(r,t,e,n,i,s,o){const a=new Zc,l=new A0,c=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.reverseDepthBuffer,f=i.vertexTextures;let g=i.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(y){return c.add(y),y===0?"uv":`uv${y}`}function m(y,w,k,F,G){const Y=F.fog,z=G.geometry,K=y.isMeshStandardMaterial?F.environment:null,V=(y.isMeshStandardMaterial?e:t).get(y.envMap||K),ut=V&&V.mapping===yr?V.image.height:null,dt=M[y.type];y.precision!==null&&(g=i.getMaxPrecision(y.precision),g!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",g,"instead."));const ft=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,qt=ft!==void 0?ft.length:0;let Kt=0;z.morphAttributes.position!==void 0&&(Kt=1),z.morphAttributes.normal!==void 0&&(Kt=2),z.morphAttributes.color!==void 0&&(Kt=3);let X,tt,wt,ht;if(dt){const De=hn[dt];X=De.vertexShader,tt=De.fragmentShader}else X=y.vertexShader,tt=y.fragmentShader,l.update(y),wt=l.getVertexShaderID(y),ht=l.getFragmentShaderID(y);const Ut=r.getRenderTarget(),Dt=G.isInstancedMesh===!0,Ht=G.isBatchedMesh===!0,$t=!!y.map,Z=!!y.matcap,C=!!V,rt=!!y.aoMap,it=!!y.lightMap,Q=!!y.bumpMap,ot=!!y.normalMap,Pt=!!y.displacementMap,xt=!!y.emissiveMap,R=!!y.metalnessMap,S=!!y.roughnessMap,O=y.anisotropy>0,q=y.clearcoat>0,j=y.dispersion>0,$=y.iridescence>0,At=y.sheen>0,lt=y.transmission>0,Mt=O&&!!y.anisotropyMap,Zt=q&&!!y.clearcoatMap,et=q&&!!y.clearcoatNormalMap,yt=q&&!!y.clearcoatRoughnessMap,Ot=$&&!!y.iridescenceMap,Bt=$&&!!y.iridescenceThicknessMap,bt=At&&!!y.sheenColorMap,jt=At&&!!y.sheenRoughnessMap,Gt=!!y.specularMap,oe=!!y.specularColorMap,I=!!y.specularIntensityMap,vt=lt&&!!y.transmissionMap,W=lt&&!!y.thicknessMap,J=!!y.gradientMap,mt=!!y.alphaMap,_t=y.alphaTest>0,Jt=!!y.alphaHash,me=!!y.extensions;let Ie=On;y.toneMapped&&(Ut===null||Ut.isXRRenderTarget===!0)&&(Ie=r.toneMapping);const Qt={shaderID:dt,shaderType:y.type,shaderName:y.name,vertexShader:X,fragmentShader:tt,defines:y.defines,customVertexShaderID:wt,customFragmentShaderID:ht,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:g,batching:Ht,batchingColor:Ht&&G._colorsTexture!==null,instancing:Dt,instancingColor:Dt&&G.instanceColor!==null,instancingMorph:Dt&&G.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:Ut===null?r.outputColorSpace:Ut.isXRRenderTarget===!0?Ut.texture.colorSpace:Gn,alphaToCoverage:!!y.alphaToCoverage,map:$t,matcap:Z,envMap:C,envMapMode:C&&V.mapping,envMapCubeUVHeight:ut,aoMap:rt,lightMap:it,bumpMap:Q,normalMap:ot,displacementMap:f&&Pt,emissiveMap:xt,normalMapObjectSpace:ot&&y.normalMapType===Du,normalMapTangentSpace:ot&&y.normalMapType===Xc,metalnessMap:R,roughnessMap:S,anisotropy:O,anisotropyMap:Mt,clearcoat:q,clearcoatMap:Zt,clearcoatNormalMap:et,clearcoatRoughnessMap:yt,dispersion:j,iridescence:$,iridescenceMap:Ot,iridescenceThicknessMap:Bt,sheen:At,sheenColorMap:bt,sheenRoughnessMap:jt,specularMap:Gt,specularColorMap:oe,specularIntensityMap:I,transmission:lt,transmissionMap:vt,thicknessMap:W,gradientMap:J,opaque:y.transparent===!1&&y.blending===Ni&&y.alphaToCoverage===!1,alphaMap:mt,alphaTest:_t,alphaHash:Jt,combine:y.combine,mapUv:$t&&p(y.map.channel),aoMapUv:rt&&p(y.aoMap.channel),lightMapUv:it&&p(y.lightMap.channel),bumpMapUv:Q&&p(y.bumpMap.channel),normalMapUv:ot&&p(y.normalMap.channel),displacementMapUv:Pt&&p(y.displacementMap.channel),emissiveMapUv:xt&&p(y.emissiveMap.channel),metalnessMapUv:R&&p(y.metalnessMap.channel),roughnessMapUv:S&&p(y.roughnessMap.channel),anisotropyMapUv:Mt&&p(y.anisotropyMap.channel),clearcoatMapUv:Zt&&p(y.clearcoatMap.channel),clearcoatNormalMapUv:et&&p(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:yt&&p(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Ot&&p(y.iridescenceMap.channel),iridescenceThicknessMapUv:Bt&&p(y.iridescenceThicknessMap.channel),sheenColorMapUv:bt&&p(y.sheenColorMap.channel),sheenRoughnessMapUv:jt&&p(y.sheenRoughnessMap.channel),specularMapUv:Gt&&p(y.specularMap.channel),specularColorMapUv:oe&&p(y.specularColorMap.channel),specularIntensityMapUv:I&&p(y.specularIntensityMap.channel),transmissionMapUv:vt&&p(y.transmissionMap.channel),thicknessMapUv:W&&p(y.thicknessMap.channel),alphaMapUv:mt&&p(y.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(ot||O),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!z.attributes.uv&&($t||mt),fog:!!Y,useFog:y.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:d,skinning:G.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:qt,morphTextureStride:Kt,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:r.shadowMap.enabled&&k.length>0,shadowMapType:r.shadowMap.type,toneMapping:Ie,decodeVideoTexture:$t&&y.map.isVideoTexture===!0&&ne.getTransfer(y.map.colorSpace)===le,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===rn,flipSided:y.side===Fe,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:me&&y.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(me&&y.extensions.multiDraw===!0||Ht)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Qt.vertexUv1s=c.has(1),Qt.vertexUv2s=c.has(2),Qt.vertexUv3s=c.has(3),c.clear(),Qt}function _(y){const w=[];if(y.shaderID?w.push(y.shaderID):(w.push(y.customVertexShaderID),w.push(y.customFragmentShaderID)),y.defines!==void 0)for(const k in y.defines)w.push(k),w.push(y.defines[k]);return y.isRawShaderMaterial===!1&&(v(w,y),x(w,y),w.push(r.outputColorSpace)),w.push(y.customProgramCacheKey),w.join()}function v(y,w){y.push(w.precision),y.push(w.outputColorSpace),y.push(w.envMapMode),y.push(w.envMapCubeUVHeight),y.push(w.mapUv),y.push(w.alphaMapUv),y.push(w.lightMapUv),y.push(w.aoMapUv),y.push(w.bumpMapUv),y.push(w.normalMapUv),y.push(w.displacementMapUv),y.push(w.emissiveMapUv),y.push(w.metalnessMapUv),y.push(w.roughnessMapUv),y.push(w.anisotropyMapUv),y.push(w.clearcoatMapUv),y.push(w.clearcoatNormalMapUv),y.push(w.clearcoatRoughnessMapUv),y.push(w.iridescenceMapUv),y.push(w.iridescenceThicknessMapUv),y.push(w.sheenColorMapUv),y.push(w.sheenRoughnessMapUv),y.push(w.specularMapUv),y.push(w.specularColorMapUv),y.push(w.specularIntensityMapUv),y.push(w.transmissionMapUv),y.push(w.thicknessMapUv),y.push(w.combine),y.push(w.fogExp2),y.push(w.sizeAttenuation),y.push(w.morphTargetsCount),y.push(w.morphAttributeCount),y.push(w.numDirLights),y.push(w.numPointLights),y.push(w.numSpotLights),y.push(w.numSpotLightMaps),y.push(w.numHemiLights),y.push(w.numRectAreaLights),y.push(w.numDirLightShadows),y.push(w.numPointLightShadows),y.push(w.numSpotLightShadows),y.push(w.numSpotLightShadowsWithMaps),y.push(w.numLightProbes),y.push(w.shadowMapType),y.push(w.toneMapping),y.push(w.numClippingPlanes),y.push(w.numClipIntersection),y.push(w.depthPacking)}function x(y,w){a.disableAll(),w.supportsVertexTextures&&a.enable(0),w.instancing&&a.enable(1),w.instancingColor&&a.enable(2),w.instancingMorph&&a.enable(3),w.matcap&&a.enable(4),w.envMap&&a.enable(5),w.normalMapObjectSpace&&a.enable(6),w.normalMapTangentSpace&&a.enable(7),w.clearcoat&&a.enable(8),w.iridescence&&a.enable(9),w.alphaTest&&a.enable(10),w.vertexColors&&a.enable(11),w.vertexAlphas&&a.enable(12),w.vertexUv1s&&a.enable(13),w.vertexUv2s&&a.enable(14),w.vertexUv3s&&a.enable(15),w.vertexTangents&&a.enable(16),w.anisotropy&&a.enable(17),w.alphaHash&&a.enable(18),w.batching&&a.enable(19),w.dispersion&&a.enable(20),w.batchingColor&&a.enable(21),y.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reverseDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.alphaToCoverage&&a.enable(20),y.push(a.mask)}function T(y){const w=M[y.type];let k;if(w){const F=hn[w];k=ud.clone(F.uniforms)}else k=y.uniforms;return k}function A(y,w){let k;for(let F=0,G=h.length;F<G;F++){const Y=h[F];if(Y.cacheKey===w){k=Y,++k.usedTimes;break}}return k===void 0&&(k=new E0(r,w,y,s),h.push(k)),k}function E(y){if(--y.usedTimes===0){const w=h.indexOf(y);h[w]=h[h.length-1],h.pop(),y.destroy()}}function P(y){l.remove(y)}function N(){l.dispose()}return{getParameters:m,getProgramCacheKey:_,getUniforms:T,acquireProgram:A,releaseProgram:E,releaseShaderCache:P,programs:h,dispose:N}}function P0(){let r=new WeakMap;function t(o){return r.has(o)}function e(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function n(o){r.delete(o)}function i(o,a,l){r.get(o)[a]=l}function s(){r=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:s}}function L0(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.z!==t.z?r.z-t.z:r.id-t.id}function ic(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function sc(){const r=[];let t=0;const e=[],n=[],i=[];function s(){t=0,e.length=0,n.length=0,i.length=0}function o(u,d,f,g,M,p){let m=r[t];return m===void 0?(m={id:u.id,object:u,geometry:d,material:f,groupOrder:g,renderOrder:u.renderOrder,z:M,group:p},r[t]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=f,m.groupOrder=g,m.renderOrder=u.renderOrder,m.z=M,m.group=p),t++,m}function a(u,d,f,g,M,p){const m=o(u,d,f,g,M,p);f.transmission>0?n.push(m):f.transparent===!0?i.push(m):e.push(m)}function l(u,d,f,g,M,p){const m=o(u,d,f,g,M,p);f.transmission>0?n.unshift(m):f.transparent===!0?i.unshift(m):e.unshift(m)}function c(u,d){e.length>1&&e.sort(u||L0),n.length>1&&n.sort(d||ic),i.length>1&&i.sort(d||ic)}function h(){for(let u=t,d=r.length;u<d;u++){const f=r[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:i,init:s,push:a,unshift:l,finish:h,sort:c}}function I0(){let r=new WeakMap;function t(n,i){const s=r.get(n);let o;return s===void 0?(o=new sc,r.set(n,[o])):i>=s.length?(o=new sc,s.push(o)):o=s[i],o}function e(){r=new WeakMap}return{get:t,dispose:e}}function D0(){const r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new Yt};break;case"SpotLight":e={position:new L,direction:new L,color:new Yt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new Yt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new Yt,groundColor:new Yt};break;case"RectAreaLight":e={color:new Yt,position:new L,halfWidth:new L,halfHeight:new L};break}return r[t.id]=e,e}}}function U0(){const r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=e,e}}}let N0=0;function k0(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function F0(r){const t=new D0,e=U0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);const i=new L,s=new re,o=new re;function a(c){let h=0,u=0,d=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let f=0,g=0,M=0,p=0,m=0,_=0,v=0,x=0,T=0,A=0,E=0;c.sort(k0);for(let N=0,y=c.length;N<y;N++){const w=c[N],k=w.color,F=w.intensity,G=w.distance,Y=w.shadow&&w.shadow.map?w.shadow.map.texture:null;if(w.isAmbientLight)h+=k.r*F,u+=k.g*F,d+=k.b*F;else if(w.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(w.sh.coefficients[z],F);E++}else if(w.isDirectionalLight){const z=t.get(w);if(z.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){const K=w.shadow,V=e.get(w);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,n.directionalShadow[f]=V,n.directionalShadowMap[f]=Y,n.directionalShadowMatrix[f]=w.shadow.matrix,_++}n.directional[f]=z,f++}else if(w.isSpotLight){const z=t.get(w);z.position.setFromMatrixPosition(w.matrixWorld),z.color.copy(k).multiplyScalar(F),z.distance=G,z.coneCos=Math.cos(w.angle),z.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),z.decay=w.decay,n.spot[M]=z;const K=w.shadow;if(w.map&&(n.spotLightMap[T]=w.map,T++,K.updateMatrices(w),w.castShadow&&A++),n.spotLightMatrix[M]=K.matrix,w.castShadow){const V=e.get(w);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,n.spotShadow[M]=V,n.spotShadowMap[M]=Y,x++}M++}else if(w.isRectAreaLight){const z=t.get(w);z.color.copy(k).multiplyScalar(F),z.halfWidth.set(w.width*.5,0,0),z.halfHeight.set(0,w.height*.5,0),n.rectArea[p]=z,p++}else if(w.isPointLight){const z=t.get(w);if(z.color.copy(w.color).multiplyScalar(w.intensity),z.distance=w.distance,z.decay=w.decay,w.castShadow){const K=w.shadow,V=e.get(w);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,V.shadowCameraNear=K.camera.near,V.shadowCameraFar=K.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=Y,n.pointShadowMatrix[g]=w.shadow.matrix,v++}n.point[g]=z,g++}else if(w.isHemisphereLight){const z=t.get(w);z.skyColor.copy(w.color).multiplyScalar(F),z.groundColor.copy(w.groundColor).multiplyScalar(F),n.hemi[m]=z,m++}}p>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ct.LTC_FLOAT_1,n.rectAreaLTC2=ct.LTC_FLOAT_2):(n.rectAreaLTC1=ct.LTC_HALF_1,n.rectAreaLTC2=ct.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const P=n.hash;(P.directionalLength!==f||P.pointLength!==g||P.spotLength!==M||P.rectAreaLength!==p||P.hemiLength!==m||P.numDirectionalShadows!==_||P.numPointShadows!==v||P.numSpotShadows!==x||P.numSpotMaps!==T||P.numLightProbes!==E)&&(n.directional.length=f,n.spot.length=M,n.rectArea.length=p,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=v,n.pointShadowMap.length=v,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=v,n.spotLightMatrix.length=x+T-A,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=E,P.directionalLength=f,P.pointLength=g,P.spotLength=M,P.rectAreaLength=p,P.hemiLength=m,P.numDirectionalShadows=_,P.numPointShadows=v,P.numSpotShadows=x,P.numSpotMaps=T,P.numLightProbes=E,n.version=N0++)}function l(c,h){let u=0,d=0,f=0,g=0,M=0;const p=h.matrixWorldInverse;for(let m=0,_=c.length;m<_;m++){const v=c[m];if(v.isDirectionalLight){const x=n.directional[u];x.direction.setFromMatrixPosition(v.matrixWorld),i.setFromMatrixPosition(v.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(p),u++}else if(v.isSpotLight){const x=n.spot[f];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(p),x.direction.setFromMatrixPosition(v.matrixWorld),i.setFromMatrixPosition(v.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(p),f++}else if(v.isRectAreaLight){const x=n.rectArea[g];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(p),o.identity(),s.copy(v.matrixWorld),s.premultiply(p),o.extractRotation(s),x.halfWidth.set(v.width*.5,0,0),x.halfHeight.set(0,v.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(v.isPointLight){const x=n.point[d];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(p),d++}else if(v.isHemisphereLight){const x=n.hemi[M];x.direction.setFromMatrixPosition(v.matrixWorld),x.direction.transformDirection(p),M++}}}return{setup:a,setupView:l,state:n}}function rc(r){const t=new F0(r),e=[],n=[];function i(h){c.camera=h,e.length=0,n.length=0}function s(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function O0(r){let t=new WeakMap;function e(i,s=0){const o=t.get(i);let a;return o===void 0?(a=new rc(r),t.set(i,[a])):s>=o.length?(a=new rc(r),o.push(a)):a=o[s],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class B0 extends Ts{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Lu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class z0 extends Ts{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const H0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,G0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function V0(r,t,e){let n=new Ba;const i=new st,s=new st,o=new fe,a=new B0({depthPacking:Iu}),l=new z0,c={},h=e.maxTextureSize,u={[zn]:Fe,[Fe]:zn,[rn]:rn},d=new Hn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new st},radius:{value:4}},vertexShader:H0,fragmentShader:G0}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new Le;g.setAttribute("position",new Ge(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new ke(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Lc;let m=this.type;this.render=function(A,E,P){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||A.length===0)return;const N=r.getRenderTarget(),y=r.getActiveCubeFace(),w=r.getActiveMipmapLevel(),k=r.state;k.setBlending(Fn),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const F=m!==Sn&&this.type===Sn,G=m===Sn&&this.type!==Sn;for(let Y=0,z=A.length;Y<z;Y++){const K=A[Y],V=K.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;i.copy(V.mapSize);const ut=V.getFrameExtents();if(i.multiply(ut),s.copy(V.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/ut.x),i.x=s.x*ut.x,V.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/ut.y),i.y=s.y*ut.y,V.mapSize.y=s.y)),V.map===null||F===!0||G===!0){const ft=this.type!==Sn?{minFilter:Ne,magFilter:Ne}:{};V.map!==null&&V.map.dispose(),V.map=new ai(i.x,i.y,ft),V.map.texture.name=K.name+".shadowMap",V.camera.updateProjectionMatrix()}r.setRenderTarget(V.map),r.clear();const dt=V.getViewportCount();for(let ft=0;ft<dt;ft++){const qt=V.getViewport(ft);o.set(s.x*qt.x,s.y*qt.y,s.x*qt.z,s.y*qt.w),k.viewport(o),V.updateMatrices(K,ft),n=V.getFrustum(),x(E,P,V.camera,K,this.type)}V.isPointLightShadow!==!0&&this.type===Sn&&_(V,P),V.needsUpdate=!1}m=this.type,p.needsUpdate=!1,r.setRenderTarget(N,y,w)};function _(A,E){const P=t.update(M);d.defines.VSM_SAMPLES!==A.blurSamples&&(d.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new ai(i.x,i.y)),d.uniforms.shadow_pass.value=A.map.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,r.setRenderTarget(A.mapPass),r.clear(),r.renderBufferDirect(E,null,P,d,M,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,r.setRenderTarget(A.map),r.clear(),r.renderBufferDirect(E,null,P,f,M,null)}function v(A,E,P,N){let y=null;const w=P.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(w!==void 0)y=w;else if(y=P.isPointLight===!0?l:a,r.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0){const k=y.uuid,F=E.uuid;let G=c[k];G===void 0&&(G={},c[k]=G);let Y=G[F];Y===void 0&&(Y=y.clone(),G[F]=Y,E.addEventListener("dispose",T)),y=Y}if(y.visible=E.visible,y.wireframe=E.wireframe,N===Sn?y.side=E.shadowSide!==null?E.shadowSide:E.side:y.side=E.shadowSide!==null?E.shadowSide:u[E.side],y.alphaMap=E.alphaMap,y.alphaTest=E.alphaTest,y.map=E.map,y.clipShadows=E.clipShadows,y.clippingPlanes=E.clippingPlanes,y.clipIntersection=E.clipIntersection,y.displacementMap=E.displacementMap,y.displacementScale=E.displacementScale,y.displacementBias=E.displacementBias,y.wireframeLinewidth=E.wireframeLinewidth,y.linewidth=E.linewidth,P.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const k=r.properties.get(y);k.light=P}return y}function x(A,E,P,N,y){if(A.visible===!1)return;if(A.layers.test(E.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&y===Sn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,A.matrixWorld);const F=t.update(A),G=A.material;if(Array.isArray(G)){const Y=F.groups;for(let z=0,K=Y.length;z<K;z++){const V=Y[z],ut=G[V.materialIndex];if(ut&&ut.visible){const dt=v(A,ut,N,y);A.onBeforeShadow(r,A,E,P,F,dt,V),r.renderBufferDirect(P,null,F,dt,A,V),A.onAfterShadow(r,A,E,P,F,dt,V)}}}else if(G.visible){const Y=v(A,G,N,y);A.onBeforeShadow(r,A,E,P,F,Y,null),r.renderBufferDirect(P,null,F,Y,A,null),A.onAfterShadow(r,A,E,P,F,Y,null)}}const k=A.children;for(let F=0,G=k.length;F<G;F++)x(k[F],E,P,N,y)}function T(A){A.target.removeEventListener("dispose",T);for(const P in c){const N=c[P],y=A.target.uuid;y in N&&(N[y].dispose(),delete N[y])}}}const W0={[Uo]:No,[ko]:Bo,[Fo]:zo,[Bi]:Oo,[No]:Uo,[Bo]:ko,[zo]:Fo,[Oo]:Bi};function X0(r){function t(){let I=!1;const vt=new fe;let W=null;const J=new fe(0,0,0,0);return{setMask:function(mt){W!==mt&&!I&&(r.colorMask(mt,mt,mt,mt),W=mt)},setLocked:function(mt){I=mt},setClear:function(mt,_t,Jt,me,Ie){Ie===!0&&(mt*=me,_t*=me,Jt*=me),vt.set(mt,_t,Jt,me),J.equals(vt)===!1&&(r.clearColor(mt,_t,Jt,me),J.copy(vt))},reset:function(){I=!1,W=null,J.set(-1,0,0,0)}}}function e(){let I=!1,vt=!1,W=null,J=null,mt=null;return{setReversed:function(_t){vt=_t},setTest:function(_t){_t?wt(r.DEPTH_TEST):ht(r.DEPTH_TEST)},setMask:function(_t){W!==_t&&!I&&(r.depthMask(_t),W=_t)},setFunc:function(_t){if(vt&&(_t=W0[_t]),J!==_t){switch(_t){case Uo:r.depthFunc(r.NEVER);break;case No:r.depthFunc(r.ALWAYS);break;case ko:r.depthFunc(r.LESS);break;case Bi:r.depthFunc(r.LEQUAL);break;case Fo:r.depthFunc(r.EQUAL);break;case Oo:r.depthFunc(r.GEQUAL);break;case Bo:r.depthFunc(r.GREATER);break;case zo:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}J=_t}},setLocked:function(_t){I=_t},setClear:function(_t){mt!==_t&&(r.clearDepth(_t),mt=_t)},reset:function(){I=!1,W=null,J=null,mt=null}}}function n(){let I=!1,vt=null,W=null,J=null,mt=null,_t=null,Jt=null,me=null,Ie=null;return{setTest:function(Qt){I||(Qt?wt(r.STENCIL_TEST):ht(r.STENCIL_TEST))},setMask:function(Qt){vt!==Qt&&!I&&(r.stencilMask(Qt),vt=Qt)},setFunc:function(Qt,De,gn){(W!==Qt||J!==De||mt!==gn)&&(r.stencilFunc(Qt,De,gn),W=Qt,J=De,mt=gn)},setOp:function(Qt,De,gn){(_t!==Qt||Jt!==De||me!==gn)&&(r.stencilOp(Qt,De,gn),_t=Qt,Jt=De,me=gn)},setLocked:function(Qt){I=Qt},setClear:function(Qt){Ie!==Qt&&(r.clearStencil(Qt),Ie=Qt)},reset:function(){I=!1,vt=null,W=null,J=null,mt=null,_t=null,Jt=null,me=null,Ie=null}}}const i=new t,s=new e,o=new n,a=new WeakMap,l=new WeakMap;let c={},h={},u=new WeakMap,d=[],f=null,g=!1,M=null,p=null,m=null,_=null,v=null,x=null,T=null,A=new Yt(0,0,0),E=0,P=!1,N=null,y=null,w=null,k=null,F=null;const G=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,z=0;const K=r.getParameter(r.VERSION);K.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\d)/.exec(K)[1]),Y=z>=1):K.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),Y=z>=2);let V=null,ut={};const dt=r.getParameter(r.SCISSOR_BOX),ft=r.getParameter(r.VIEWPORT),qt=new fe().fromArray(dt),Kt=new fe().fromArray(ft);function X(I,vt,W,J){const mt=new Uint8Array(4),_t=r.createTexture();r.bindTexture(I,_t),r.texParameteri(I,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(I,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Jt=0;Jt<W;Jt++)I===r.TEXTURE_3D||I===r.TEXTURE_2D_ARRAY?r.texImage3D(vt,0,r.RGBA,1,1,J,0,r.RGBA,r.UNSIGNED_BYTE,mt):r.texImage2D(vt+Jt,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,mt);return _t}const tt={};tt[r.TEXTURE_2D]=X(r.TEXTURE_2D,r.TEXTURE_2D,1),tt[r.TEXTURE_CUBE_MAP]=X(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),tt[r.TEXTURE_2D_ARRAY]=X(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),tt[r.TEXTURE_3D]=X(r.TEXTURE_3D,r.TEXTURE_3D,1,1),i.setClear(0,0,0,1),s.setClear(1),o.setClear(0),wt(r.DEPTH_TEST),s.setFunc(Bi),it(!1),Q(fl),wt(r.CULL_FACE),C(Fn);function wt(I){c[I]!==!0&&(r.enable(I),c[I]=!0)}function ht(I){c[I]!==!1&&(r.disable(I),c[I]=!1)}function Ut(I,vt){return h[I]!==vt?(r.bindFramebuffer(I,vt),h[I]=vt,I===r.DRAW_FRAMEBUFFER&&(h[r.FRAMEBUFFER]=vt),I===r.FRAMEBUFFER&&(h[r.DRAW_FRAMEBUFFER]=vt),!0):!1}function Dt(I,vt){let W=d,J=!1;if(I){W=u.get(vt),W===void 0&&(W=[],u.set(vt,W));const mt=I.textures;if(W.length!==mt.length||W[0]!==r.COLOR_ATTACHMENT0){for(let _t=0,Jt=mt.length;_t<Jt;_t++)W[_t]=r.COLOR_ATTACHMENT0+_t;W.length=mt.length,J=!0}}else W[0]!==r.BACK&&(W[0]=r.BACK,J=!0);J&&r.drawBuffers(W)}function Ht(I){return f!==I?(r.useProgram(I),f=I,!0):!1}const $t={[Qn]:r.FUNC_ADD,[ru]:r.FUNC_SUBTRACT,[ou]:r.FUNC_REVERSE_SUBTRACT};$t[au]=r.MIN,$t[lu]=r.MAX;const Z={[cu]:r.ZERO,[hu]:r.ONE,[uu]:r.SRC_COLOR,[Io]:r.SRC_ALPHA,[xu]:r.SRC_ALPHA_SATURATE,[mu]:r.DST_COLOR,[fu]:r.DST_ALPHA,[du]:r.ONE_MINUS_SRC_COLOR,[Do]:r.ONE_MINUS_SRC_ALPHA,[gu]:r.ONE_MINUS_DST_COLOR,[pu]:r.ONE_MINUS_DST_ALPHA,[vu]:r.CONSTANT_COLOR,[_u]:r.ONE_MINUS_CONSTANT_COLOR,[Mu]:r.CONSTANT_ALPHA,[yu]:r.ONE_MINUS_CONSTANT_ALPHA};function C(I,vt,W,J,mt,_t,Jt,me,Ie,Qt){if(I===Fn){g===!0&&(ht(r.BLEND),g=!1);return}if(g===!1&&(wt(r.BLEND),g=!0),I!==su){if(I!==M||Qt!==P){if((p!==Qn||v!==Qn)&&(r.blendEquation(r.FUNC_ADD),p=Qn,v=Qn),Qt)switch(I){case Ni:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case pl:r.blendFunc(r.ONE,r.ONE);break;case ml:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case gl:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Ni:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case pl:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case ml:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case gl:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}m=null,_=null,x=null,T=null,A.set(0,0,0),E=0,M=I,P=Qt}return}mt=mt||vt,_t=_t||W,Jt=Jt||J,(vt!==p||mt!==v)&&(r.blendEquationSeparate($t[vt],$t[mt]),p=vt,v=mt),(W!==m||J!==_||_t!==x||Jt!==T)&&(r.blendFuncSeparate(Z[W],Z[J],Z[_t],Z[Jt]),m=W,_=J,x=_t,T=Jt),(me.equals(A)===!1||Ie!==E)&&(r.blendColor(me.r,me.g,me.b,Ie),A.copy(me),E=Ie),M=I,P=!1}function rt(I,vt){I.side===rn?ht(r.CULL_FACE):wt(r.CULL_FACE);let W=I.side===Fe;vt&&(W=!W),it(W),I.blending===Ni&&I.transparent===!1?C(Fn):C(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),s.setFunc(I.depthFunc),s.setTest(I.depthTest),s.setMask(I.depthWrite),i.setMask(I.colorWrite);const J=I.stencilWrite;o.setTest(J),J&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Pt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?wt(r.SAMPLE_ALPHA_TO_COVERAGE):ht(r.SAMPLE_ALPHA_TO_COVERAGE)}function it(I){N!==I&&(I?r.frontFace(r.CW):r.frontFace(r.CCW),N=I)}function Q(I){I!==nu?(wt(r.CULL_FACE),I!==y&&(I===fl?r.cullFace(r.BACK):I===iu?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ht(r.CULL_FACE),y=I}function ot(I){I!==w&&(Y&&r.lineWidth(I),w=I)}function Pt(I,vt,W){I?(wt(r.POLYGON_OFFSET_FILL),(k!==vt||F!==W)&&(r.polygonOffset(vt,W),k=vt,F=W)):ht(r.POLYGON_OFFSET_FILL)}function xt(I){I?wt(r.SCISSOR_TEST):ht(r.SCISSOR_TEST)}function R(I){I===void 0&&(I=r.TEXTURE0+G-1),V!==I&&(r.activeTexture(I),V=I)}function S(I,vt,W){W===void 0&&(V===null?W=r.TEXTURE0+G-1:W=V);let J=ut[W];J===void 0&&(J={type:void 0,texture:void 0},ut[W]=J),(J.type!==I||J.texture!==vt)&&(V!==W&&(r.activeTexture(W),V=W),r.bindTexture(I,vt||tt[I]),J.type=I,J.texture=vt)}function O(){const I=ut[V];I!==void 0&&I.type!==void 0&&(r.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function q(){try{r.compressedTexImage2D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function j(){try{r.compressedTexImage3D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function $(){try{r.texSubImage2D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function At(){try{r.texSubImage3D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function lt(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Mt(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Zt(){try{r.texStorage2D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function et(){try{r.texStorage3D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function yt(){try{r.texImage2D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ot(){try{r.texImage3D.apply(r,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Bt(I){qt.equals(I)===!1&&(r.scissor(I.x,I.y,I.z,I.w),qt.copy(I))}function bt(I){Kt.equals(I)===!1&&(r.viewport(I.x,I.y,I.z,I.w),Kt.copy(I))}function jt(I,vt){let W=l.get(vt);W===void 0&&(W=new WeakMap,l.set(vt,W));let J=W.get(I);J===void 0&&(J=r.getUniformBlockIndex(vt,I.name),W.set(I,J))}function Gt(I,vt){const J=l.get(vt).get(I);a.get(vt)!==J&&(r.uniformBlockBinding(vt,J,I.__bindingPointIndex),a.set(vt,J))}function oe(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),c={},V=null,ut={},h={},u=new WeakMap,d=[],f=null,g=!1,M=null,p=null,m=null,_=null,v=null,x=null,T=null,A=new Yt(0,0,0),E=0,P=!1,N=null,y=null,w=null,k=null,F=null,qt.set(0,0,r.canvas.width,r.canvas.height),Kt.set(0,0,r.canvas.width,r.canvas.height),i.reset(),s.reset(),o.reset()}return{buffers:{color:i,depth:s,stencil:o},enable:wt,disable:ht,bindFramebuffer:Ut,drawBuffers:Dt,useProgram:Ht,setBlending:C,setMaterial:rt,setFlipSided:it,setCullFace:Q,setLineWidth:ot,setPolygonOffset:Pt,setScissorTest:xt,activeTexture:R,bindTexture:S,unbindTexture:O,compressedTexImage2D:q,compressedTexImage3D:j,texImage2D:yt,texImage3D:Ot,updateUBOMapping:jt,uniformBlockBinding:Gt,texStorage2D:Zt,texStorage3D:et,texSubImage2D:$,texSubImage3D:At,compressedTexSubImage2D:lt,compressedTexSubImage3D:Mt,scissor:Bt,viewport:bt,reset:oe}}function oc(r,t,e,n){const i=q0(n);switch(e){case Bc:return r*t;case Hc:return r*t;case Gc:return r*t*2;case Ua:return r*t/i.components*i.byteLength;case Na:return r*t/i.components*i.byteLength;case Vc:return r*t*2/i.components*i.byteLength;case ka:return r*t*2/i.components*i.byteLength;case zc:return r*t*3/i.components*i.byteLength;case ln:return r*t*4/i.components*i.byteLength;case Fa:return r*t*4/i.components*i.byteLength;case ir:case sr:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case rr:case or:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case Xo:case $o:return Math.max(r,16)*Math.max(t,8)/4;case Wo:case qo:return Math.max(r,8)*Math.max(t,8)/2;case Yo:case Ko:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case Zo:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case jo:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case Jo:return Math.floor((r+4)/5)*Math.floor((t+3)/4)*16;case Qo:return Math.floor((r+4)/5)*Math.floor((t+4)/5)*16;case ta:return Math.floor((r+5)/6)*Math.floor((t+4)/5)*16;case ea:return Math.floor((r+5)/6)*Math.floor((t+5)/6)*16;case na:return Math.floor((r+7)/8)*Math.floor((t+4)/5)*16;case ia:return Math.floor((r+7)/8)*Math.floor((t+5)/6)*16;case sa:return Math.floor((r+7)/8)*Math.floor((t+7)/8)*16;case ra:return Math.floor((r+9)/10)*Math.floor((t+4)/5)*16;case oa:return Math.floor((r+9)/10)*Math.floor((t+5)/6)*16;case aa:return Math.floor((r+9)/10)*Math.floor((t+7)/8)*16;case la:return Math.floor((r+9)/10)*Math.floor((t+9)/10)*16;case ca:return Math.floor((r+11)/12)*Math.floor((t+9)/10)*16;case ha:return Math.floor((r+11)/12)*Math.floor((t+11)/12)*16;case ar:case ua:case da:return Math.ceil(r/4)*Math.ceil(t/4)*16;case Wc:case fa:return Math.ceil(r/4)*Math.ceil(t/4)*8;case pa:case ma:return Math.ceil(r/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function q0(r){switch(r){case Tn:case kc:return{byteLength:1,components:1};case ms:case Fc:case bs:return{byteLength:2,components:1};case Ia:case Da:return{byteLength:2,components:4};case oi:case La:case dn:return{byteLength:4,components:1};case Oc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}function $0(r,t,e,n,i,s,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new st,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,S){return f?new OffscreenCanvas(R,S):mr("canvas")}function M(R,S,O){let q=1;const j=xt(R);if((j.width>O||j.height>O)&&(q=O/Math.max(j.width,j.height)),q<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const $=Math.floor(q*j.width),At=Math.floor(q*j.height);u===void 0&&(u=g($,At));const lt=S?g($,At):u;return lt.width=$,lt.height=At,lt.getContext("2d").drawImage(R,0,0,$,At),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+$+"x"+At+")."),lt}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),R;return R}function p(R){return R.generateMipmaps&&R.minFilter!==Ne&&R.minFilter!==on}function m(R){r.generateMipmap(R)}function _(R,S,O,q,j=!1){if(R!==null){if(r[R]!==void 0)return r[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let $=S;if(S===r.RED&&(O===r.FLOAT&&($=r.R32F),O===r.HALF_FLOAT&&($=r.R16F),O===r.UNSIGNED_BYTE&&($=r.R8)),S===r.RED_INTEGER&&(O===r.UNSIGNED_BYTE&&($=r.R8UI),O===r.UNSIGNED_SHORT&&($=r.R16UI),O===r.UNSIGNED_INT&&($=r.R32UI),O===r.BYTE&&($=r.R8I),O===r.SHORT&&($=r.R16I),O===r.INT&&($=r.R32I)),S===r.RG&&(O===r.FLOAT&&($=r.RG32F),O===r.HALF_FLOAT&&($=r.RG16F),O===r.UNSIGNED_BYTE&&($=r.RG8)),S===r.RG_INTEGER&&(O===r.UNSIGNED_BYTE&&($=r.RG8UI),O===r.UNSIGNED_SHORT&&($=r.RG16UI),O===r.UNSIGNED_INT&&($=r.RG32UI),O===r.BYTE&&($=r.RG8I),O===r.SHORT&&($=r.RG16I),O===r.INT&&($=r.RG32I)),S===r.RGB_INTEGER&&(O===r.UNSIGNED_BYTE&&($=r.RGB8UI),O===r.UNSIGNED_SHORT&&($=r.RGB16UI),O===r.UNSIGNED_INT&&($=r.RGB32UI),O===r.BYTE&&($=r.RGB8I),O===r.SHORT&&($=r.RGB16I),O===r.INT&&($=r.RGB32I)),S===r.RGBA_INTEGER&&(O===r.UNSIGNED_BYTE&&($=r.RGBA8UI),O===r.UNSIGNED_SHORT&&($=r.RGBA16UI),O===r.UNSIGNED_INT&&($=r.RGBA32UI),O===r.BYTE&&($=r.RGBA8I),O===r.SHORT&&($=r.RGBA16I),O===r.INT&&($=r.RGBA32I)),S===r.RGB&&O===r.UNSIGNED_INT_5_9_9_9_REV&&($=r.RGB9_E5),S===r.RGBA){const At=j?ur:ne.getTransfer(q);O===r.FLOAT&&($=r.RGBA32F),O===r.HALF_FLOAT&&($=r.RGBA16F),O===r.UNSIGNED_BYTE&&($=At===le?r.SRGB8_ALPHA8:r.RGBA8),O===r.UNSIGNED_SHORT_4_4_4_4&&($=r.RGBA4),O===r.UNSIGNED_SHORT_5_5_5_1&&($=r.RGB5_A1)}return($===r.R16F||$===r.R32F||$===r.RG16F||$===r.RG32F||$===r.RGBA16F||$===r.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function v(R,S){let O;return R?S===null||S===oi||S===Gi?O=r.DEPTH24_STENCIL8:S===dn?O=r.DEPTH32F_STENCIL8:S===ms&&(O=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===oi||S===Gi?O=r.DEPTH_COMPONENT24:S===dn?O=r.DEPTH_COMPONENT32F:S===ms&&(O=r.DEPTH_COMPONENT16),O}function x(R,S){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==Ne&&R.minFilter!==on?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function T(R){const S=R.target;S.removeEventListener("dispose",T),E(S),S.isVideoTexture&&h.delete(S)}function A(R){const S=R.target;S.removeEventListener("dispose",A),N(S)}function E(R){const S=n.get(R);if(S.__webglInit===void 0)return;const O=R.source,q=d.get(O);if(q){const j=q[S.__cacheKey];j.usedTimes--,j.usedTimes===0&&P(R),Object.keys(q).length===0&&d.delete(O)}n.remove(R)}function P(R){const S=n.get(R);r.deleteTexture(S.__webglTexture);const O=R.source,q=d.get(O);delete q[S.__cacheKey],o.memory.textures--}function N(R){const S=n.get(R);if(R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(S.__webglFramebuffer[q]))for(let j=0;j<S.__webglFramebuffer[q].length;j++)r.deleteFramebuffer(S.__webglFramebuffer[q][j]);else r.deleteFramebuffer(S.__webglFramebuffer[q]);S.__webglDepthbuffer&&r.deleteRenderbuffer(S.__webglDepthbuffer[q])}else{if(Array.isArray(S.__webglFramebuffer))for(let q=0;q<S.__webglFramebuffer.length;q++)r.deleteFramebuffer(S.__webglFramebuffer[q]);else r.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&r.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&r.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let q=0;q<S.__webglColorRenderbuffer.length;q++)S.__webglColorRenderbuffer[q]&&r.deleteRenderbuffer(S.__webglColorRenderbuffer[q]);S.__webglDepthRenderbuffer&&r.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const O=R.textures;for(let q=0,j=O.length;q<j;q++){const $=n.get(O[q]);$.__webglTexture&&(r.deleteTexture($.__webglTexture),o.memory.textures--),n.remove(O[q])}n.remove(R)}let y=0;function w(){y=0}function k(){const R=y;return R>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),y+=1,R}function F(R){const S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function G(R,S){const O=n.get(R);if(R.isVideoTexture&&ot(R),R.isRenderTargetTexture===!1&&R.version>0&&O.__version!==R.version){const q=R.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Kt(O,R,S);return}}e.bindTexture(r.TEXTURE_2D,O.__webglTexture,r.TEXTURE0+S)}function Y(R,S){const O=n.get(R);if(R.version>0&&O.__version!==R.version){Kt(O,R,S);return}e.bindTexture(r.TEXTURE_2D_ARRAY,O.__webglTexture,r.TEXTURE0+S)}function z(R,S){const O=n.get(R);if(R.version>0&&O.__version!==R.version){Kt(O,R,S);return}e.bindTexture(r.TEXTURE_3D,O.__webglTexture,r.TEXTURE0+S)}function K(R,S){const O=n.get(R);if(R.version>0&&O.__version!==R.version){X(O,R,S);return}e.bindTexture(r.TEXTURE_CUBE_MAP,O.__webglTexture,r.TEXTURE0+S)}const V={[ps]:r.REPEAT,[ei]:r.CLAMP_TO_EDGE,[Vo]:r.MIRRORED_REPEAT},ut={[Ne]:r.NEAREST,[Pu]:r.NEAREST_MIPMAP_NEAREST,[Ps]:r.NEAREST_MIPMAP_LINEAR,[on]:r.LINEAR,[kr]:r.LINEAR_MIPMAP_NEAREST,[ni]:r.LINEAR_MIPMAP_LINEAR},dt={[Uu]:r.NEVER,[zu]:r.ALWAYS,[Nu]:r.LESS,[qc]:r.LEQUAL,[ku]:r.EQUAL,[Bu]:r.GEQUAL,[Fu]:r.GREATER,[Ou]:r.NOTEQUAL};function ft(R,S){if(S.type===dn&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===on||S.magFilter===kr||S.magFilter===Ps||S.magFilter===ni||S.minFilter===on||S.minFilter===kr||S.minFilter===Ps||S.minFilter===ni)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(R,r.TEXTURE_WRAP_S,V[S.wrapS]),r.texParameteri(R,r.TEXTURE_WRAP_T,V[S.wrapT]),(R===r.TEXTURE_3D||R===r.TEXTURE_2D_ARRAY)&&r.texParameteri(R,r.TEXTURE_WRAP_R,V[S.wrapR]),r.texParameteri(R,r.TEXTURE_MAG_FILTER,ut[S.magFilter]),r.texParameteri(R,r.TEXTURE_MIN_FILTER,ut[S.minFilter]),S.compareFunction&&(r.texParameteri(R,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(R,r.TEXTURE_COMPARE_FUNC,dt[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Ne||S.minFilter!==Ps&&S.minFilter!==ni||S.type===dn&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const O=t.get("EXT_texture_filter_anisotropic");r.texParameterf(R,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function qt(R,S){let O=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",T));const q=S.source;let j=d.get(q);j===void 0&&(j={},d.set(q,j));const $=F(S);if($!==R.__cacheKey){j[$]===void 0&&(j[$]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,O=!0),j[$].usedTimes++;const At=j[R.__cacheKey];At!==void 0&&(j[R.__cacheKey].usedTimes--,At.usedTimes===0&&P(S)),R.__cacheKey=$,R.__webglTexture=j[$].texture}return O}function Kt(R,S,O){let q=r.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(q=r.TEXTURE_2D_ARRAY),S.isData3DTexture&&(q=r.TEXTURE_3D);const j=qt(R,S),$=S.source;e.bindTexture(q,R.__webglTexture,r.TEXTURE0+O);const At=n.get($);if($.version!==At.__version||j===!0){e.activeTexture(r.TEXTURE0+O);const lt=ne.getPrimaries(ne.workingColorSpace),Mt=S.colorSpace===kn?null:ne.getPrimaries(S.colorSpace),Zt=S.colorSpace===kn||lt===Mt?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Zt);let et=M(S.image,!1,i.maxTextureSize);et=Pt(S,et);const yt=s.convert(S.format,S.colorSpace),Ot=s.convert(S.type);let Bt=_(S.internalFormat,yt,Ot,S.colorSpace,S.isVideoTexture);ft(q,S);let bt;const jt=S.mipmaps,Gt=S.isVideoTexture!==!0,oe=At.__version===void 0||j===!0,I=$.dataReady,vt=x(S,et);if(S.isDepthTexture)Bt=v(S.format===Vi,S.type),oe&&(Gt?e.texStorage2D(r.TEXTURE_2D,1,Bt,et.width,et.height):e.texImage2D(r.TEXTURE_2D,0,Bt,et.width,et.height,0,yt,Ot,null));else if(S.isDataTexture)if(jt.length>0){Gt&&oe&&e.texStorage2D(r.TEXTURE_2D,vt,Bt,jt[0].width,jt[0].height);for(let W=0,J=jt.length;W<J;W++)bt=jt[W],Gt?I&&e.texSubImage2D(r.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,Ot,bt.data):e.texImage2D(r.TEXTURE_2D,W,Bt,bt.width,bt.height,0,yt,Ot,bt.data);S.generateMipmaps=!1}else Gt?(oe&&e.texStorage2D(r.TEXTURE_2D,vt,Bt,et.width,et.height),I&&e.texSubImage2D(r.TEXTURE_2D,0,0,0,et.width,et.height,yt,Ot,et.data)):e.texImage2D(r.TEXTURE_2D,0,Bt,et.width,et.height,0,yt,Ot,et.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Gt&&oe&&e.texStorage3D(r.TEXTURE_2D_ARRAY,vt,Bt,jt[0].width,jt[0].height,et.depth);for(let W=0,J=jt.length;W<J;W++)if(bt=jt[W],S.format!==ln)if(yt!==null)if(Gt){if(I)if(S.layerUpdates.size>0){const mt=oc(bt.width,bt.height,S.format,S.type);for(const _t of S.layerUpdates){const Jt=bt.data.subarray(_t*mt/bt.data.BYTES_PER_ELEMENT,(_t+1)*mt/bt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,_t,bt.width,bt.height,1,yt,Jt,0,0)}S.clearLayerUpdates()}else e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,0,bt.width,bt.height,et.depth,yt,bt.data,0,0)}else e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,W,Bt,bt.width,bt.height,et.depth,0,bt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Gt?I&&e.texSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,0,bt.width,bt.height,et.depth,yt,Ot,bt.data):e.texImage3D(r.TEXTURE_2D_ARRAY,W,Bt,bt.width,bt.height,et.depth,0,yt,Ot,bt.data)}else{Gt&&oe&&e.texStorage2D(r.TEXTURE_2D,vt,Bt,jt[0].width,jt[0].height);for(let W=0,J=jt.length;W<J;W++)bt=jt[W],S.format!==ln?yt!==null?Gt?I&&e.compressedTexSubImage2D(r.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,bt.data):e.compressedTexImage2D(r.TEXTURE_2D,W,Bt,bt.width,bt.height,0,bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Gt?I&&e.texSubImage2D(r.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,Ot,bt.data):e.texImage2D(r.TEXTURE_2D,W,Bt,bt.width,bt.height,0,yt,Ot,bt.data)}else if(S.isDataArrayTexture)if(Gt){if(oe&&e.texStorage3D(r.TEXTURE_2D_ARRAY,vt,Bt,et.width,et.height,et.depth),I)if(S.layerUpdates.size>0){const W=oc(et.width,et.height,S.format,S.type);for(const J of S.layerUpdates){const mt=et.data.subarray(J*W/et.data.BYTES_PER_ELEMENT,(J+1)*W/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,J,et.width,et.height,1,yt,Ot,mt)}S.clearLayerUpdates()}else e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,yt,Ot,et.data)}else e.texImage3D(r.TEXTURE_2D_ARRAY,0,Bt,et.width,et.height,et.depth,0,yt,Ot,et.data);else if(S.isData3DTexture)Gt?(oe&&e.texStorage3D(r.TEXTURE_3D,vt,Bt,et.width,et.height,et.depth),I&&e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,yt,Ot,et.data)):e.texImage3D(r.TEXTURE_3D,0,Bt,et.width,et.height,et.depth,0,yt,Ot,et.data);else if(S.isFramebufferTexture){if(oe)if(Gt)e.texStorage2D(r.TEXTURE_2D,vt,Bt,et.width,et.height);else{let W=et.width,J=et.height;for(let mt=0;mt<vt;mt++)e.texImage2D(r.TEXTURE_2D,mt,Bt,W,J,0,yt,Ot,null),W>>=1,J>>=1}}else if(jt.length>0){if(Gt&&oe){const W=xt(jt[0]);e.texStorage2D(r.TEXTURE_2D,vt,Bt,W.width,W.height)}for(let W=0,J=jt.length;W<J;W++)bt=jt[W],Gt?I&&e.texSubImage2D(r.TEXTURE_2D,W,0,0,yt,Ot,bt):e.texImage2D(r.TEXTURE_2D,W,Bt,yt,Ot,bt);S.generateMipmaps=!1}else if(Gt){if(oe){const W=xt(et);e.texStorage2D(r.TEXTURE_2D,vt,Bt,W.width,W.height)}I&&e.texSubImage2D(r.TEXTURE_2D,0,0,0,yt,Ot,et)}else e.texImage2D(r.TEXTURE_2D,0,Bt,yt,Ot,et);p(S)&&m(q),At.__version=$.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function X(R,S,O){if(S.image.length!==6)return;const q=qt(R,S),j=S.source;e.bindTexture(r.TEXTURE_CUBE_MAP,R.__webglTexture,r.TEXTURE0+O);const $=n.get(j);if(j.version!==$.__version||q===!0){e.activeTexture(r.TEXTURE0+O);const At=ne.getPrimaries(ne.workingColorSpace),lt=S.colorSpace===kn?null:ne.getPrimaries(S.colorSpace),Mt=S.colorSpace===kn||At===lt?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt);const Zt=S.isCompressedTexture||S.image[0].isCompressedTexture,et=S.image[0]&&S.image[0].isDataTexture,yt=[];for(let J=0;J<6;J++)!Zt&&!et?yt[J]=M(S.image[J],!0,i.maxCubemapSize):yt[J]=et?S.image[J].image:S.image[J],yt[J]=Pt(S,yt[J]);const Ot=yt[0],Bt=s.convert(S.format,S.colorSpace),bt=s.convert(S.type),jt=_(S.internalFormat,Bt,bt,S.colorSpace),Gt=S.isVideoTexture!==!0,oe=$.__version===void 0||q===!0,I=j.dataReady;let vt=x(S,Ot);ft(r.TEXTURE_CUBE_MAP,S);let W;if(Zt){Gt&&oe&&e.texStorage2D(r.TEXTURE_CUBE_MAP,vt,jt,Ot.width,Ot.height);for(let J=0;J<6;J++){W=yt[J].mipmaps;for(let mt=0;mt<W.length;mt++){const _t=W[mt];S.format!==ln?Bt!==null?Gt?I&&e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,0,0,_t.width,_t.height,Bt,_t.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,jt,_t.width,_t.height,0,_t.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Gt?I&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,0,0,_t.width,_t.height,Bt,bt,_t.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,jt,_t.width,_t.height,0,Bt,bt,_t.data)}}}else{if(W=S.mipmaps,Gt&&oe){W.length>0&&vt++;const J=xt(yt[0]);e.texStorage2D(r.TEXTURE_CUBE_MAP,vt,jt,J.width,J.height)}for(let J=0;J<6;J++)if(et){Gt?I&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,yt[J].width,yt[J].height,Bt,bt,yt[J].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,jt,yt[J].width,yt[J].height,0,Bt,bt,yt[J].data);for(let mt=0;mt<W.length;mt++){const Jt=W[mt].image[J].image;Gt?I&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,0,0,Jt.width,Jt.height,Bt,bt,Jt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,jt,Jt.width,Jt.height,0,Bt,bt,Jt.data)}}else{Gt?I&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Bt,bt,yt[J]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,jt,Bt,bt,yt[J]);for(let mt=0;mt<W.length;mt++){const _t=W[mt];Gt?I&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,0,0,Bt,bt,_t.image[J]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,jt,Bt,bt,_t.image[J])}}}p(S)&&m(r.TEXTURE_CUBE_MAP),$.__version=j.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function tt(R,S,O,q,j,$){const At=s.convert(O.format,O.colorSpace),lt=s.convert(O.type),Mt=_(O.internalFormat,At,lt,O.colorSpace);if(!n.get(S).__hasExternalTextures){const et=Math.max(1,S.width>>$),yt=Math.max(1,S.height>>$);j===r.TEXTURE_3D||j===r.TEXTURE_2D_ARRAY?e.texImage3D(j,$,Mt,et,yt,S.depth,0,At,lt,null):e.texImage2D(j,$,Mt,et,yt,0,At,lt,null)}e.bindFramebuffer(r.FRAMEBUFFER,R),Q(S)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,q,j,n.get(O).__webglTexture,0,it(S)):(j===r.TEXTURE_2D||j>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,q,j,n.get(O).__webglTexture,$),e.bindFramebuffer(r.FRAMEBUFFER,null)}function wt(R,S,O){if(r.bindRenderbuffer(r.RENDERBUFFER,R),S.depthBuffer){const q=S.depthTexture,j=q&&q.isDepthTexture?q.type:null,$=v(S.stencilBuffer,j),At=S.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,lt=it(S);Q(S)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,lt,$,S.width,S.height):O?r.renderbufferStorageMultisample(r.RENDERBUFFER,lt,$,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,$,S.width,S.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,At,r.RENDERBUFFER,R)}else{const q=S.textures;for(let j=0;j<q.length;j++){const $=q[j],At=s.convert($.format,$.colorSpace),lt=s.convert($.type),Mt=_($.internalFormat,At,lt,$.colorSpace),Zt=it(S);O&&Q(S)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Zt,Mt,S.width,S.height):Q(S)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Zt,Mt,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,Mt,S.width,S.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function ht(R,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(r.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(S.depthTexture).__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),G(S.depthTexture,0);const q=n.get(S.depthTexture).__webglTexture,j=it(S);if(S.depthTexture.format===ki)Q(S)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,q,0,j):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,q,0);else if(S.depthTexture.format===Vi)Q(S)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,q,0,j):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,q,0);else throw new Error("Unknown depthTexture format")}function Ut(R){const S=n.get(R),O=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){const q=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),q){const j=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,q.removeEventListener("dispose",j)};q.addEventListener("dispose",j),S.__depthDisposeCallback=j}S.__boundDepthTexture=q}if(R.depthTexture&&!S.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");ht(S.__webglFramebuffer,R)}else if(O){S.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(e.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer[q]),S.__webglDepthbuffer[q]===void 0)S.__webglDepthbuffer[q]=r.createRenderbuffer(),wt(S.__webglDepthbuffer[q],R,!1);else{const j=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,$=S.__webglDepthbuffer[q];r.bindRenderbuffer(r.RENDERBUFFER,$),r.framebufferRenderbuffer(r.FRAMEBUFFER,j,r.RENDERBUFFER,$)}}else if(e.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=r.createRenderbuffer(),wt(S.__webglDepthbuffer,R,!1);else{const q=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,j=S.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,j),r.framebufferRenderbuffer(r.FRAMEBUFFER,q,r.RENDERBUFFER,j)}e.bindFramebuffer(r.FRAMEBUFFER,null)}function Dt(R,S,O){const q=n.get(R);S!==void 0&&tt(q.__webglFramebuffer,R,R.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),O!==void 0&&Ut(R)}function Ht(R){const S=R.texture,O=n.get(R),q=n.get(S);R.addEventListener("dispose",A);const j=R.textures,$=R.isWebGLCubeRenderTarget===!0,At=j.length>1;if(At||(q.__webglTexture===void 0&&(q.__webglTexture=r.createTexture()),q.__version=S.version,o.memory.textures++),$){O.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(S.mipmaps&&S.mipmaps.length>0){O.__webglFramebuffer[lt]=[];for(let Mt=0;Mt<S.mipmaps.length;Mt++)O.__webglFramebuffer[lt][Mt]=r.createFramebuffer()}else O.__webglFramebuffer[lt]=r.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){O.__webglFramebuffer=[];for(let lt=0;lt<S.mipmaps.length;lt++)O.__webglFramebuffer[lt]=r.createFramebuffer()}else O.__webglFramebuffer=r.createFramebuffer();if(At)for(let lt=0,Mt=j.length;lt<Mt;lt++){const Zt=n.get(j[lt]);Zt.__webglTexture===void 0&&(Zt.__webglTexture=r.createTexture(),o.memory.textures++)}if(R.samples>0&&Q(R)===!1){O.__webglMultisampledFramebuffer=r.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let lt=0;lt<j.length;lt++){const Mt=j[lt];O.__webglColorRenderbuffer[lt]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,O.__webglColorRenderbuffer[lt]);const Zt=s.convert(Mt.format,Mt.colorSpace),et=s.convert(Mt.type),yt=_(Mt.internalFormat,Zt,et,Mt.colorSpace,R.isXRRenderTarget===!0),Ot=it(R);r.renderbufferStorageMultisample(r.RENDERBUFFER,Ot,yt,R.width,R.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+lt,r.RENDERBUFFER,O.__webglColorRenderbuffer[lt])}r.bindRenderbuffer(r.RENDERBUFFER,null),R.depthBuffer&&(O.__webglDepthRenderbuffer=r.createRenderbuffer(),wt(O.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if($){e.bindTexture(r.TEXTURE_CUBE_MAP,q.__webglTexture),ft(r.TEXTURE_CUBE_MAP,S);for(let lt=0;lt<6;lt++)if(S.mipmaps&&S.mipmaps.length>0)for(let Mt=0;Mt<S.mipmaps.length;Mt++)tt(O.__webglFramebuffer[lt][Mt],R,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Mt);else tt(O.__webglFramebuffer[lt],R,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);p(S)&&m(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(At){for(let lt=0,Mt=j.length;lt<Mt;lt++){const Zt=j[lt],et=n.get(Zt);e.bindTexture(r.TEXTURE_2D,et.__webglTexture),ft(r.TEXTURE_2D,Zt),tt(O.__webglFramebuffer,R,Zt,r.COLOR_ATTACHMENT0+lt,r.TEXTURE_2D,0),p(Zt)&&m(r.TEXTURE_2D)}e.unbindTexture()}else{let lt=r.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(lt=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(lt,q.__webglTexture),ft(lt,S),S.mipmaps&&S.mipmaps.length>0)for(let Mt=0;Mt<S.mipmaps.length;Mt++)tt(O.__webglFramebuffer[Mt],R,S,r.COLOR_ATTACHMENT0,lt,Mt);else tt(O.__webglFramebuffer,R,S,r.COLOR_ATTACHMENT0,lt,0);p(S)&&m(lt),e.unbindTexture()}R.depthBuffer&&Ut(R)}function $t(R){const S=R.textures;for(let O=0,q=S.length;O<q;O++){const j=S[O];if(p(j)){const $=R.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,At=n.get(j).__webglTexture;e.bindTexture($,At),m($),e.unbindTexture()}}}const Z=[],C=[];function rt(R){if(R.samples>0){if(Q(R)===!1){const S=R.textures,O=R.width,q=R.height;let j=r.COLOR_BUFFER_BIT;const $=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,At=n.get(R),lt=S.length>1;if(lt)for(let Mt=0;Mt<S.length;Mt++)e.bindFramebuffer(r.FRAMEBUFFER,At.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Mt,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,At.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Mt,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,At.__webglMultisampledFramebuffer),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,At.__webglFramebuffer);for(let Mt=0;Mt<S.length;Mt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(j|=r.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(j|=r.STENCIL_BUFFER_BIT)),lt){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,At.__webglColorRenderbuffer[Mt]);const Zt=n.get(S[Mt]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Zt,0)}r.blitFramebuffer(0,0,O,q,0,0,O,q,j,r.NEAREST),l===!0&&(Z.length=0,C.length=0,Z.push(r.COLOR_ATTACHMENT0+Mt),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Z.push($),C.push($),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,C)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Z))}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),lt)for(let Mt=0;Mt<S.length;Mt++){e.bindFramebuffer(r.FRAMEBUFFER,At.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Mt,r.RENDERBUFFER,At.__webglColorRenderbuffer[Mt]);const Zt=n.get(S[Mt]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,At.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Mt,r.TEXTURE_2D,Zt,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,At.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const S=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[S])}}}function it(R){return Math.min(i.maxSamples,R.samples)}function Q(R){const S=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function ot(R){const S=o.render.frame;h.get(R)!==S&&(h.set(R,S),R.update())}function Pt(R,S){const O=R.colorSpace,q=R.format,j=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||O!==Gn&&O!==kn&&(ne.getTransfer(O)===le?(q!==ln||j!==Tn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),S}function xt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=w,this.setTexture2D=G,this.setTexture2DArray=Y,this.setTexture3D=z,this.setTextureCube=K,this.rebindTextures=Dt,this.setupRenderTarget=Ht,this.updateRenderTargetMipmap=$t,this.updateMultisampleRenderTarget=rt,this.setupDepthRenderbuffer=Ut,this.setupFrameBufferTexture=tt,this.useMultisampledRTT=Q}function Y0(r,t){function e(n,i=kn){let s;const o=ne.getTransfer(i);if(n===Tn)return r.UNSIGNED_BYTE;if(n===Ia)return r.UNSIGNED_SHORT_4_4_4_4;if(n===Da)return r.UNSIGNED_SHORT_5_5_5_1;if(n===Oc)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===kc)return r.BYTE;if(n===Fc)return r.SHORT;if(n===ms)return r.UNSIGNED_SHORT;if(n===La)return r.INT;if(n===oi)return r.UNSIGNED_INT;if(n===dn)return r.FLOAT;if(n===bs)return r.HALF_FLOAT;if(n===Bc)return r.ALPHA;if(n===zc)return r.RGB;if(n===ln)return r.RGBA;if(n===Hc)return r.LUMINANCE;if(n===Gc)return r.LUMINANCE_ALPHA;if(n===ki)return r.DEPTH_COMPONENT;if(n===Vi)return r.DEPTH_STENCIL;if(n===Ua)return r.RED;if(n===Na)return r.RED_INTEGER;if(n===Vc)return r.RG;if(n===ka)return r.RG_INTEGER;if(n===Fa)return r.RGBA_INTEGER;if(n===ir||n===sr||n===rr||n===or)if(o===le)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===ir)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===sr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===rr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===or)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===ir)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===sr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===rr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===or)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Wo||n===Xo||n===qo||n===$o)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Wo)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Xo)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===qo)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===$o)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Yo||n===Ko||n===Zo)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Yo||n===Ko)return o===le?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Zo)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===jo||n===Jo||n===Qo||n===ta||n===ea||n===na||n===ia||n===sa||n===ra||n===oa||n===aa||n===la||n===ca||n===ha)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(n===jo)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Jo)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Qo)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ta)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ea)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===na)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ia)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===sa)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ra)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===oa)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===aa)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===la)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ca)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ha)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ar||n===ua||n===da)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(n===ar)return o===le?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ua)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===da)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Wc||n===fa||n===pa||n===ma)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(n===ar)return s.COMPRESSED_RED_RGTC1_EXT;if(n===fa)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===pa)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ma)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Gi?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:e}}class K0 extends sn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Ii extends Te{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Z0={type:"move"};class fo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ii,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ii,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ii,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const M of t.hand.values()){const p=e.getJointPose(M,n),m=this._getHandJoint(c,M);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Z0)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Ii;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const j0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,J0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Q0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const i=new Ce,s=t.properties.get(i);s.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Hn({vertexShader:j0,fragmentShader:J0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ke(new ri(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class tg extends qi{constructor(t,e){super();const n=this;let i=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null;const M=new Q0,p=e.getContextAttributes();let m=null,_=null;const v=[],x=[],T=new st;let A=null;const E=new sn;E.layers.enable(1),E.viewport=new fe;const P=new sn;P.layers.enable(2),P.viewport=new fe;const N=[E,P],y=new K0;y.layers.enable(1),y.layers.enable(2);let w=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let tt=v[X];return tt===void 0&&(tt=new fo,v[X]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function(X){let tt=v[X];return tt===void 0&&(tt=new fo,v[X]=tt),tt.getGripSpace()},this.getHand=function(X){let tt=v[X];return tt===void 0&&(tt=new fo,v[X]=tt),tt.getHandSpace()};function F(X){const tt=x.indexOf(X.inputSource);if(tt===-1)return;const wt=v[tt];wt!==void 0&&(wt.update(X.inputSource,X.frame,c||o),wt.dispatchEvent({type:X.type,data:X.inputSource}))}function G(){i.removeEventListener("select",F),i.removeEventListener("selectstart",F),i.removeEventListener("selectend",F),i.removeEventListener("squeeze",F),i.removeEventListener("squeezestart",F),i.removeEventListener("squeezeend",F),i.removeEventListener("end",G),i.removeEventListener("inputsourceschange",Y);for(let X=0;X<v.length;X++){const tt=x[X];tt!==null&&(x[X]=null,v[X].disconnect(tt))}w=null,k=null,M.reset(),t.setRenderTarget(m),f=null,d=null,u=null,i=null,_=null,Kt.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(T.width,T.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){s=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(X){if(i=X,i!==null){if(m=t.getRenderTarget(),i.addEventListener("select",F),i.addEventListener("selectstart",F),i.addEventListener("selectend",F),i.addEventListener("squeeze",F),i.addEventListener("squeezestart",F),i.addEventListener("squeezeend",F),i.addEventListener("end",G),i.addEventListener("inputsourceschange",Y),p.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(T),i.renderState.layers===void 0){const tt={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(i,e,tt),i.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),_=new ai(f.framebufferWidth,f.framebufferHeight,{format:ln,type:Tn,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil})}else{let tt=null,wt=null,ht=null;p.depth&&(ht=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,tt=p.stencil?Vi:ki,wt=p.stencil?Gi:oi);const Ut={colorFormat:e.RGBA8,depthFormat:ht,scaleFactor:s};u=new XRWebGLBinding(i,e),d=u.createProjectionLayer(Ut),i.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),_=new ai(d.textureWidth,d.textureHeight,{format:ln,type:Tn,depthTexture:new rh(d.textureWidth,d.textureHeight,wt,void 0,void 0,void 0,void 0,void 0,void 0,tt),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),Kt.setContext(i),Kt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return M.getDepthTexture()};function Y(X){for(let tt=0;tt<X.removed.length;tt++){const wt=X.removed[tt],ht=x.indexOf(wt);ht>=0&&(x[ht]=null,v[ht].disconnect(wt))}for(let tt=0;tt<X.added.length;tt++){const wt=X.added[tt];let ht=x.indexOf(wt);if(ht===-1){for(let Dt=0;Dt<v.length;Dt++)if(Dt>=x.length){x.push(wt),ht=Dt;break}else if(x[Dt]===null){x[Dt]=wt,ht=Dt;break}if(ht===-1)break}const Ut=v[ht];Ut&&Ut.connect(wt)}}const z=new L,K=new L;function V(X,tt,wt){z.setFromMatrixPosition(tt.matrixWorld),K.setFromMatrixPosition(wt.matrixWorld);const ht=z.distanceTo(K),Ut=tt.projectionMatrix.elements,Dt=wt.projectionMatrix.elements,Ht=Ut[14]/(Ut[10]-1),$t=Ut[14]/(Ut[10]+1),Z=(Ut[9]+1)/Ut[5],C=(Ut[9]-1)/Ut[5],rt=(Ut[8]-1)/Ut[0],it=(Dt[8]+1)/Dt[0],Q=Ht*rt,ot=Ht*it,Pt=ht/(-rt+it),xt=Pt*-rt;if(tt.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(xt),X.translateZ(Pt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Ut[10]===-1)X.projectionMatrix.copy(tt.projectionMatrix),X.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{const R=Ht+Pt,S=$t+Pt,O=Q-xt,q=ot+(ht-xt),j=Z*$t/S*R,$=C*$t/S*R;X.projectionMatrix.makePerspective(O,q,j,$,R,S),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function ut(X,tt){tt===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(tt.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(i===null)return;let tt=X.near,wt=X.far;M.texture!==null&&(M.depthNear>0&&(tt=M.depthNear),M.depthFar>0&&(wt=M.depthFar)),y.near=P.near=E.near=tt,y.far=P.far=E.far=wt,(w!==y.near||k!==y.far)&&(i.updateRenderState({depthNear:y.near,depthFar:y.far}),w=y.near,k=y.far);const ht=X.parent,Ut=y.cameras;ut(y,ht);for(let Dt=0;Dt<Ut.length;Dt++)ut(Ut[Dt],ht);Ut.length===2?V(y,E,P):y.projectionMatrix.copy(E.projectionMatrix),dt(X,y,ht)};function dt(X,tt,wt){wt===null?X.matrix.copy(tt.matrixWorld):(X.matrix.copy(wt.matrixWorld),X.matrix.invert(),X.matrix.multiply(tt.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(tt.projectionMatrix),X.projectionMatrixInverse.copy(tt.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=ga*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(X){l=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)},this.hasDepthSensing=function(){return M.texture!==null},this.getDepthSensingMesh=function(){return M.getMesh(y)};let ft=null;function qt(X,tt){if(h=tt.getViewerPose(c||o),g=tt,h!==null){const wt=h.views;f!==null&&(t.setRenderTargetFramebuffer(_,f.framebuffer),t.setRenderTarget(_));let ht=!1;wt.length!==y.cameras.length&&(y.cameras.length=0,ht=!0);for(let Dt=0;Dt<wt.length;Dt++){const Ht=wt[Dt];let $t=null;if(f!==null)$t=f.getViewport(Ht);else{const C=u.getViewSubImage(d,Ht);$t=C.viewport,Dt===0&&(t.setRenderTargetTextures(_,C.colorTexture,d.ignoreDepthValues?void 0:C.depthStencilTexture),t.setRenderTarget(_))}let Z=N[Dt];Z===void 0&&(Z=new sn,Z.layers.enable(Dt),Z.viewport=new fe,N[Dt]=Z),Z.matrix.fromArray(Ht.transform.matrix),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.projectionMatrix.fromArray(Ht.projectionMatrix),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert(),Z.viewport.set($t.x,$t.y,$t.width,$t.height),Dt===0&&(y.matrix.copy(Z.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ht===!0&&y.cameras.push(Z)}const Ut=i.enabledFeatures;if(Ut&&Ut.includes("depth-sensing")){const Dt=u.getDepthInformation(wt[0]);Dt&&Dt.isValid&&Dt.texture&&M.init(t,Dt,i.renderState)}}for(let wt=0;wt<v.length;wt++){const ht=x[wt],Ut=v[wt];ht!==null&&Ut!==void 0&&Ut.update(ht,tt,c||o)}ft&&ft(X,tt),tt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:tt}),g=null}const Kt=new sh;Kt.setAnimationLoop(qt),this.setAnimationLoop=function(X){ft=X},this.dispose=function(){}}}const Zn=new pn,eg=new re;function ng(r,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,eh(r)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,_,v,x){m.isMeshBasicMaterial||m.isMeshLambertMaterial?s(p,m):m.isMeshToonMaterial?(s(p,m),u(p,m)):m.isMeshPhongMaterial?(s(p,m),h(p,m)):m.isMeshStandardMaterial?(s(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,x)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),M(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,_,v):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Fe&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Fe&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);const _=t.get(m),v=_.envMap,x=_.envMapRotation;v&&(p.envMap.value=v,Zn.copy(x),Zn.x*=-1,Zn.y*=-1,Zn.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Zn.y*=-1,Zn.z*=-1),p.envMapRotation.value.setFromMatrix4(eg.makeRotationFromEuler(Zn)),p.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,_,v){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*_,p.scale.value=v*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,_){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Fe&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=_.texture,p.transmissionSamplerSize.value.set(_.width,_.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function M(p,m){const _=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(_.matrixWorld),p.nearDistance.value=_.shadow.camera.near,p.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function ig(r,t,e,n){let i={},s={},o=[];const a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,v){const x=v.program;n.uniformBlockBinding(_,x)}function c(_,v){let x=i[_.id];x===void 0&&(g(_),x=h(_),i[_.id]=x,_.addEventListener("dispose",p));const T=v.program;n.updateUBOMapping(_,T);const A=t.render.frame;s[_.id]!==A&&(d(_),s[_.id]=A)}function h(_){const v=u();_.__bindingPointIndex=v;const x=r.createBuffer(),T=_.__size,A=_.usage;return r.bindBuffer(r.UNIFORM_BUFFER,x),r.bufferData(r.UNIFORM_BUFFER,T,A),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,v,x),x}function u(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(_){const v=i[_.id],x=_.uniforms,T=_.__cache;r.bindBuffer(r.UNIFORM_BUFFER,v);for(let A=0,E=x.length;A<E;A++){const P=Array.isArray(x[A])?x[A]:[x[A]];for(let N=0,y=P.length;N<y;N++){const w=P[N];if(f(w,A,N,T)===!0){const k=w.__offset,F=Array.isArray(w.value)?w.value:[w.value];let G=0;for(let Y=0;Y<F.length;Y++){const z=F[Y],K=M(z);typeof z=="number"||typeof z=="boolean"?(w.__data[0]=z,r.bufferSubData(r.UNIFORM_BUFFER,k+G,w.__data)):z.isMatrix3?(w.__data[0]=z.elements[0],w.__data[1]=z.elements[1],w.__data[2]=z.elements[2],w.__data[3]=0,w.__data[4]=z.elements[3],w.__data[5]=z.elements[4],w.__data[6]=z.elements[5],w.__data[7]=0,w.__data[8]=z.elements[6],w.__data[9]=z.elements[7],w.__data[10]=z.elements[8],w.__data[11]=0):(z.toArray(w.__data,G),G+=K.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,k,w.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(_,v,x,T){const A=_.value,E=v+"_"+x;if(T[E]===void 0)return typeof A=="number"||typeof A=="boolean"?T[E]=A:T[E]=A.clone(),!0;{const P=T[E];if(typeof A=="number"||typeof A=="boolean"){if(P!==A)return T[E]=A,!0}else if(P.equals(A)===!1)return P.copy(A),!0}return!1}function g(_){const v=_.uniforms;let x=0;const T=16;for(let E=0,P=v.length;E<P;E++){const N=Array.isArray(v[E])?v[E]:[v[E]];for(let y=0,w=N.length;y<w;y++){const k=N[y],F=Array.isArray(k.value)?k.value:[k.value];for(let G=0,Y=F.length;G<Y;G++){const z=F[G],K=M(z),V=x%T,ut=V%K.boundary,dt=V+ut;x+=ut,dt!==0&&T-dt<K.storage&&(x+=T-dt),k.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=x,x+=K.storage}}}const A=x%T;return A>0&&(x+=T-A),_.__size=x,_.__cache={},this}function M(_){const v={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(v.boundary=4,v.storage=4):_.isVector2?(v.boundary=8,v.storage=8):_.isVector3||_.isColor?(v.boundary=16,v.storage=12):_.isVector4?(v.boundary=16,v.storage=16):_.isMatrix3?(v.boundary=48,v.storage=48):_.isMatrix4?(v.boundary=64,v.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),v}function p(_){const v=_.target;v.removeEventListener("dispose",p);const x=o.indexOf(v.__bindingPointIndex);o.splice(x,1),r.deleteBuffer(i[v.id]),delete i[v.id],delete s[v.id]}function m(){for(const _ in i)r.deleteBuffer(i[_]);o=[],i={},s={}}return{bind:l,update:c,dispose:m}}class sg{constructor(t={}){const{canvas:e=Vu(),context:n=null,depth:i=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const f=new Uint32Array(4),g=new Int32Array(4);let M=null,p=null;const m=[],_=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ye,this.toneMapping=On,this.toneMappingExposure=1;const v=this;let x=!1,T=0,A=0,E=null,P=-1,N=null;const y=new fe,w=new fe;let k=null;const F=new Yt(0);let G=0,Y=e.width,z=e.height,K=1,V=null,ut=null;const dt=new fe(0,0,Y,z),ft=new fe(0,0,Y,z);let qt=!1;const Kt=new Ba;let X=!1,tt=!1;const wt=new re,ht=new re,Ut=new L,Dt=new fe,Ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let $t=!1;function Z(){return E===null?K:1}let C=n;function rt(b,D){return e.getContext(b,D)}try{const b={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Pa}`),e.addEventListener("webglcontextlost",J,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",_t,!1),C===null){const D="webgl2";if(C=rt(D,b),C===null)throw rt(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let it,Q,ot,Pt,xt,R,S,O,q,j,$,At,lt,Mt,Zt,et,yt,Ot,Bt,bt,jt,Gt,oe,I;function vt(){it=new cm(C),it.init(),Gt=new Y0(C,it),Q=new im(C,it,t,Gt),ot=new X0(C),Q.reverseDepthBuffer&&ot.buffers.depth.setReversed(!0),Pt=new dm(C),xt=new P0,R=new $0(C,it,ot,xt,Q,Gt,Pt),S=new rm(v),O=new lm(v),q=new vd(C),oe=new em(C,q),j=new hm(C,q,Pt,oe),$=new pm(C,j,q,Pt),Bt=new fm(C,Q,R),et=new sm(xt),At=new C0(v,S,O,it,Q,oe,et),lt=new ng(v,xt),Mt=new I0,Zt=new O0(it),Ot=new tm(v,S,O,ot,$,d,l),yt=new V0(v,$,Q),I=new ig(C,Pt,Q,ot),bt=new nm(C,it,Pt),jt=new um(C,it,Pt),Pt.programs=At.programs,v.capabilities=Q,v.extensions=it,v.properties=xt,v.renderLists=Mt,v.shadowMap=yt,v.state=ot,v.info=Pt}vt();const W=new tg(v,C);this.xr=W,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const b=it.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=it.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(b){b!==void 0&&(K=b,this.setSize(Y,z,!1))},this.getSize=function(b){return b.set(Y,z)},this.setSize=function(b,D,B=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=b,z=D,e.width=Math.floor(b*K),e.height=Math.floor(D*K),B===!0&&(e.style.width=b+"px",e.style.height=D+"px"),this.setViewport(0,0,b,D)},this.getDrawingBufferSize=function(b){return b.set(Y*K,z*K).floor()},this.setDrawingBufferSize=function(b,D,B){Y=b,z=D,K=B,e.width=Math.floor(b*B),e.height=Math.floor(D*B),this.setViewport(0,0,b,D)},this.getCurrentViewport=function(b){return b.copy(y)},this.getViewport=function(b){return b.copy(dt)},this.setViewport=function(b,D,B,H){b.isVector4?dt.set(b.x,b.y,b.z,b.w):dt.set(b,D,B,H),ot.viewport(y.copy(dt).multiplyScalar(K).round())},this.getScissor=function(b){return b.copy(ft)},this.setScissor=function(b,D,B,H){b.isVector4?ft.set(b.x,b.y,b.z,b.w):ft.set(b,D,B,H),ot.scissor(w.copy(ft).multiplyScalar(K).round())},this.getScissorTest=function(){return qt},this.setScissorTest=function(b){ot.setScissorTest(qt=b)},this.setOpaqueSort=function(b){V=b},this.setTransparentSort=function(b){ut=b},this.getClearColor=function(b){return b.copy(Ot.getClearColor())},this.setClearColor=function(){Ot.setClearColor.apply(Ot,arguments)},this.getClearAlpha=function(){return Ot.getClearAlpha()},this.setClearAlpha=function(){Ot.setClearAlpha.apply(Ot,arguments)},this.clear=function(b=!0,D=!0,B=!0){let H=0;if(b){let U=!1;if(E!==null){const nt=E.texture.format;U=nt===Fa||nt===ka||nt===Na}if(U){const nt=E.texture.type,gt=nt===Tn||nt===oi||nt===ms||nt===Gi||nt===Ia||nt===Da,Tt=Ot.getClearColor(),Rt=Ot.getClearAlpha(),Nt=Tt.r,Ft=Tt.g,Ct=Tt.b;gt?(f[0]=Nt,f[1]=Ft,f[2]=Ct,f[3]=Rt,C.clearBufferuiv(C.COLOR,0,f)):(g[0]=Nt,g[1]=Ft,g[2]=Ct,g[3]=Rt,C.clearBufferiv(C.COLOR,0,g))}else H|=C.COLOR_BUFFER_BIT}D&&(H|=C.DEPTH_BUFFER_BIT,C.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),B&&(H|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",J,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",_t,!1),Mt.dispose(),Zt.dispose(),xt.dispose(),S.dispose(),O.dispose(),$.dispose(),oe.dispose(),I.dispose(),At.dispose(),W.dispose(),W.removeEventListener("sessionstart",tl),W.removeEventListener("sessionend",el),Vn.stop()};function J(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),x=!0}function mt(){console.log("THREE.WebGLRenderer: Context Restored."),x=!1;const b=Pt.autoReset,D=yt.enabled,B=yt.autoUpdate,H=yt.needsUpdate,U=yt.type;vt(),Pt.autoReset=b,yt.enabled=D,yt.autoUpdate=B,yt.needsUpdate=H,yt.type=U}function _t(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Jt(b){const D=b.target;D.removeEventListener("dispose",Jt),me(D)}function me(b){Ie(b),xt.remove(b)}function Ie(b){const D=xt.get(b).programs;D!==void 0&&(D.forEach(function(B){At.releaseProgram(B)}),b.isShaderMaterial&&At.releaseShaderCache(b))}this.renderBufferDirect=function(b,D,B,H,U,nt){D===null&&(D=Ht);const gt=U.isMesh&&U.matrixWorld.determinant()<0,Tt=Rh(b,D,B,H,U);ot.setMaterial(H,gt);let Rt=B.index,Nt=1;if(H.wireframe===!0){if(Rt=j.getWireframeAttribute(B),Rt===void 0)return;Nt=2}const Ft=B.drawRange,Ct=B.attributes.position;let ie=Ft.start*Nt,ae=(Ft.start+Ft.count)*Nt;nt!==null&&(ie=Math.max(ie,nt.start*Nt),ae=Math.min(ae,(nt.start+nt.count)*Nt)),Rt!==null?(ie=Math.max(ie,0),ae=Math.min(ae,Rt.count)):Ct!=null&&(ie=Math.max(ie,0),ae=Math.min(ae,Ct.count));const de=ae-ie;if(de<0||de===1/0)return;oe.setup(U,H,Tt,B,Rt);let Oe,te=bt;if(Rt!==null&&(Oe=q.get(Rt),te=jt,te.setIndex(Oe)),U.isMesh)H.wireframe===!0?(ot.setLineWidth(H.wireframeLinewidth*Z()),te.setMode(C.LINES)):te.setMode(C.TRIANGLES);else if(U.isLine){let Lt=H.linewidth;Lt===void 0&&(Lt=1),ot.setLineWidth(Lt*Z()),U.isLineSegments?te.setMode(C.LINES):U.isLineLoop?te.setMode(C.LINE_LOOP):te.setMode(C.LINE_STRIP)}else U.isPoints?te.setMode(C.POINTS):U.isSprite&&te.setMode(C.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)te.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(it.get("WEBGL_multi_draw"))te.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const Lt=U._multiDrawStarts,be=U._multiDrawCounts,ee=U._multiDrawCount,Ze=Rt?q.get(Rt).bytesPerElement:1,ui=xt.get(H).currentProgram.getUniforms();for(let Be=0;Be<ee;Be++)ui.setValue(C,"_gl_DrawID",Be),te.render(Lt[Be]/Ze,be[Be])}else if(U.isInstancedMesh)te.renderInstances(ie,de,U.count);else if(B.isInstancedBufferGeometry){const Lt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,be=Math.min(B.instanceCount,Lt);te.renderInstances(ie,de,be)}else te.render(ie,de)};function Qt(b,D,B){b.transparent===!0&&b.side===rn&&b.forceSinglePass===!1?(b.side=Fe,b.needsUpdate=!0,Rs(b,D,B),b.side=zn,b.needsUpdate=!0,Rs(b,D,B),b.side=rn):Rs(b,D,B)}this.compile=function(b,D,B=null){B===null&&(B=b),p=Zt.get(B),p.init(D),_.push(p),B.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),b!==B&&b.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),p.setupLights();const H=new Set;return b.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const nt=U.material;if(nt)if(Array.isArray(nt))for(let gt=0;gt<nt.length;gt++){const Tt=nt[gt];Qt(Tt,B,U),H.add(Tt)}else Qt(nt,B,U),H.add(nt)}),_.pop(),p=null,H},this.compileAsync=function(b,D,B=null){const H=this.compile(b,D,B);return new Promise(U=>{function nt(){if(H.forEach(function(gt){xt.get(gt).currentProgram.isReady()&&H.delete(gt)}),H.size===0){U(b);return}setTimeout(nt,10)}it.get("KHR_parallel_shader_compile")!==null?nt():setTimeout(nt,10)})};let De=null;function gn(b){De&&De(b)}function tl(){Vn.stop()}function el(){Vn.start()}const Vn=new sh;Vn.setAnimationLoop(gn),typeof self<"u"&&Vn.setContext(self),this.setAnimationLoop=function(b){De=b,W.setAnimationLoop(b),b===null?Vn.stop():Vn.start()},W.addEventListener("sessionstart",tl),W.addEventListener("sessionend",el),this.render=function(b,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(x===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(D),D=W.getCamera()),b.isScene===!0&&b.onBeforeRender(v,b,D,E),p=Zt.get(b,_.length),p.init(D),_.push(p),ht.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Kt.setFromProjectionMatrix(ht),tt=this.localClippingEnabled,X=et.init(this.clippingPlanes,tt),M=Mt.get(b,m.length),M.init(),m.push(M),W.enabled===!0&&W.isPresenting===!0){const nt=v.xr.getDepthSensingMesh();nt!==null&&Tr(nt,D,-1/0,v.sortObjects)}Tr(b,D,0,v.sortObjects),M.finish(),v.sortObjects===!0&&M.sort(V,ut),$t=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,$t&&Ot.addToRenderList(M,b),this.info.render.frame++,X===!0&&et.beginShadows();const B=p.state.shadowsArray;yt.render(B,b,D),X===!0&&et.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=M.opaque,U=M.transmissive;if(p.setupLights(),D.isArrayCamera){const nt=D.cameras;if(U.length>0)for(let gt=0,Tt=nt.length;gt<Tt;gt++){const Rt=nt[gt];il(H,U,b,Rt)}$t&&Ot.render(b);for(let gt=0,Tt=nt.length;gt<Tt;gt++){const Rt=nt[gt];nl(M,b,Rt,Rt.viewport)}}else U.length>0&&il(H,U,b,D),$t&&Ot.render(b),nl(M,b,D);E!==null&&(R.updateMultisampleRenderTarget(E),R.updateRenderTargetMipmap(E)),b.isScene===!0&&b.onAfterRender(v,b,D),oe.resetDefaultState(),P=-1,N=null,_.pop(),_.length>0?(p=_[_.length-1],X===!0&&et.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,m.pop(),m.length>0?M=m[m.length-1]:M=null};function Tr(b,D,B,H){if(b.visible===!1)return;if(b.layers.test(D.layers)){if(b.isGroup)B=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(D);else if(b.isLight)p.pushLight(b),b.castShadow&&p.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||Kt.intersectsSprite(b)){H&&Dt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ht);const gt=$.update(b),Tt=b.material;Tt.visible&&M.push(b,gt,Tt,B,Dt.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||Kt.intersectsObject(b))){const gt=$.update(b),Tt=b.material;if(H&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Dt.copy(b.boundingSphere.center)):(gt.boundingSphere===null&&gt.computeBoundingSphere(),Dt.copy(gt.boundingSphere.center)),Dt.applyMatrix4(b.matrixWorld).applyMatrix4(ht)),Array.isArray(Tt)){const Rt=gt.groups;for(let Nt=0,Ft=Rt.length;Nt<Ft;Nt++){const Ct=Rt[Nt],ie=Tt[Ct.materialIndex];ie&&ie.visible&&M.push(b,gt,ie,B,Dt.z,Ct)}}else Tt.visible&&M.push(b,gt,Tt,B,Dt.z,null)}}const nt=b.children;for(let gt=0,Tt=nt.length;gt<Tt;gt++)Tr(nt[gt],D,B,H)}function nl(b,D,B,H){const U=b.opaque,nt=b.transmissive,gt=b.transparent;p.setupLightsView(B),X===!0&&et.setGlobalState(v.clippingPlanes,B),H&&ot.viewport(y.copy(H)),U.length>0&&As(U,D,B),nt.length>0&&As(nt,D,B),gt.length>0&&As(gt,D,B),ot.buffers.depth.setTest(!0),ot.buffers.depth.setMask(!0),ot.buffers.color.setMask(!0),ot.setPolygonOffset(!1)}function il(b,D,B,H){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[H.id]===void 0&&(p.state.transmissionRenderTarget[H.id]=new ai(1,1,{generateMipmaps:!0,type:it.has("EXT_color_buffer_half_float")||it.has("EXT_color_buffer_float")?bs:Tn,minFilter:ni,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ne.workingColorSpace}));const nt=p.state.transmissionRenderTarget[H.id],gt=H.viewport||y;nt.setSize(gt.z,gt.w);const Tt=v.getRenderTarget();v.setRenderTarget(nt),v.getClearColor(F),G=v.getClearAlpha(),G<1&&v.setClearColor(16777215,.5),v.clear(),$t&&Ot.render(B);const Rt=v.toneMapping;v.toneMapping=On;const Nt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),p.setupLightsView(H),X===!0&&et.setGlobalState(v.clippingPlanes,H),As(b,B,H),R.updateMultisampleRenderTarget(nt),R.updateRenderTargetMipmap(nt),it.has("WEBGL_multisampled_render_to_texture")===!1){let Ft=!1;for(let Ct=0,ie=D.length;Ct<ie;Ct++){const ae=D[Ct],de=ae.object,Oe=ae.geometry,te=ae.material,Lt=ae.group;if(te.side===rn&&de.layers.test(H.layers)){const be=te.side;te.side=Fe,te.needsUpdate=!0,sl(de,B,H,Oe,te,Lt),te.side=be,te.needsUpdate=!0,Ft=!0}}Ft===!0&&(R.updateMultisampleRenderTarget(nt),R.updateRenderTargetMipmap(nt))}v.setRenderTarget(Tt),v.setClearColor(F,G),Nt!==void 0&&(H.viewport=Nt),v.toneMapping=Rt}function As(b,D,B){const H=D.isScene===!0?D.overrideMaterial:null;for(let U=0,nt=b.length;U<nt;U++){const gt=b[U],Tt=gt.object,Rt=gt.geometry,Nt=H===null?gt.material:H,Ft=gt.group;Tt.layers.test(B.layers)&&sl(Tt,D,B,Rt,Nt,Ft)}}function sl(b,D,B,H,U,nt){b.onBeforeRender(v,D,B,H,U,nt),b.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),U.onBeforeRender(v,D,B,H,b,nt),U.transparent===!0&&U.side===rn&&U.forceSinglePass===!1?(U.side=Fe,U.needsUpdate=!0,v.renderBufferDirect(B,D,H,U,b,nt),U.side=zn,U.needsUpdate=!0,v.renderBufferDirect(B,D,H,U,b,nt),U.side=rn):v.renderBufferDirect(B,D,H,U,b,nt),b.onAfterRender(v,D,B,H,U,nt)}function Rs(b,D,B){D.isScene!==!0&&(D=Ht);const H=xt.get(b),U=p.state.lights,nt=p.state.shadowsArray,gt=U.state.version,Tt=At.getParameters(b,U.state,nt,D,B),Rt=At.getProgramCacheKey(Tt);let Nt=H.programs;H.environment=b.isMeshStandardMaterial?D.environment:null,H.fog=D.fog,H.envMap=(b.isMeshStandardMaterial?O:S).get(b.envMap||H.environment),H.envMapRotation=H.environment!==null&&b.envMap===null?D.environmentRotation:b.envMapRotation,Nt===void 0&&(b.addEventListener("dispose",Jt),Nt=new Map,H.programs=Nt);let Ft=Nt.get(Rt);if(Ft!==void 0){if(H.currentProgram===Ft&&H.lightsStateVersion===gt)return ol(b,Tt),Ft}else Tt.uniforms=At.getUniforms(b),b.onBeforeCompile(Tt,v),Ft=At.acquireProgram(Tt,Rt),Nt.set(Rt,Ft),H.uniforms=Tt.uniforms;const Ct=H.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Ct.clippingPlanes=et.uniform),ol(b,Tt),H.needsLights=Ph(b),H.lightsStateVersion=gt,H.needsLights&&(Ct.ambientLightColor.value=U.state.ambient,Ct.lightProbe.value=U.state.probe,Ct.directionalLights.value=U.state.directional,Ct.directionalLightShadows.value=U.state.directionalShadow,Ct.spotLights.value=U.state.spot,Ct.spotLightShadows.value=U.state.spotShadow,Ct.rectAreaLights.value=U.state.rectArea,Ct.ltc_1.value=U.state.rectAreaLTC1,Ct.ltc_2.value=U.state.rectAreaLTC2,Ct.pointLights.value=U.state.point,Ct.pointLightShadows.value=U.state.pointShadow,Ct.hemisphereLights.value=U.state.hemi,Ct.directionalShadowMap.value=U.state.directionalShadowMap,Ct.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Ct.spotShadowMap.value=U.state.spotShadowMap,Ct.spotLightMatrix.value=U.state.spotLightMatrix,Ct.spotLightMap.value=U.state.spotLightMap,Ct.pointShadowMap.value=U.state.pointShadowMap,Ct.pointShadowMatrix.value=U.state.pointShadowMatrix),H.currentProgram=Ft,H.uniformsList=null,Ft}function rl(b){if(b.uniformsList===null){const D=b.currentProgram.getUniforms();b.uniformsList=cr.seqWithValue(D.seq,b.uniforms)}return b.uniformsList}function ol(b,D){const B=xt.get(b);B.outputColorSpace=D.outputColorSpace,B.batching=D.batching,B.batchingColor=D.batchingColor,B.instancing=D.instancing,B.instancingColor=D.instancingColor,B.instancingMorph=D.instancingMorph,B.skinning=D.skinning,B.morphTargets=D.morphTargets,B.morphNormals=D.morphNormals,B.morphColors=D.morphColors,B.morphTargetsCount=D.morphTargetsCount,B.numClippingPlanes=D.numClippingPlanes,B.numIntersection=D.numClipIntersection,B.vertexAlphas=D.vertexAlphas,B.vertexTangents=D.vertexTangents,B.toneMapping=D.toneMapping}function Rh(b,D,B,H,U){D.isScene!==!0&&(D=Ht),R.resetTextureUnits();const nt=D.fog,gt=H.isMeshStandardMaterial?D.environment:null,Tt=E===null?v.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Gn,Rt=(H.isMeshStandardMaterial?O:S).get(H.envMap||gt),Nt=H.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Ft=!!B.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Ct=!!B.morphAttributes.position,ie=!!B.morphAttributes.normal,ae=!!B.morphAttributes.color;let de=On;H.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(de=v.toneMapping);const Oe=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,te=Oe!==void 0?Oe.length:0,Lt=xt.get(H),be=p.state.lights;if(X===!0&&(tt===!0||b!==N)){const Xe=b===N&&H.id===P;et.setState(H,b,Xe)}let ee=!1;H.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==be.state.version||Lt.outputColorSpace!==Tt||U.isBatchedMesh&&Lt.batching===!1||!U.isBatchedMesh&&Lt.batching===!0||U.isBatchedMesh&&Lt.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Lt.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Lt.instancing===!1||!U.isInstancedMesh&&Lt.instancing===!0||U.isSkinnedMesh&&Lt.skinning===!1||!U.isSkinnedMesh&&Lt.skinning===!0||U.isInstancedMesh&&Lt.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Lt.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Lt.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Lt.instancingMorph===!1&&U.morphTexture!==null||Lt.envMap!==Rt||H.fog===!0&&Lt.fog!==nt||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==et.numPlanes||Lt.numIntersection!==et.numIntersection)||Lt.vertexAlphas!==Nt||Lt.vertexTangents!==Ft||Lt.morphTargets!==Ct||Lt.morphNormals!==ie||Lt.morphColors!==ae||Lt.toneMapping!==de||Lt.morphTargetsCount!==te)&&(ee=!0):(ee=!0,Lt.__version=H.version);let Ze=Lt.currentProgram;ee===!0&&(Ze=Rs(H,D,U));let ui=!1,Be=!1,Ar=!1;const pe=Ze.getUniforms(),Rn=Lt.uniforms;if(ot.useProgram(Ze.program)&&(ui=!0,Be=!0,Ar=!0),H.id!==P&&(P=H.id,Be=!0),ui||N!==b){Q.reverseDepthBuffer?(wt.copy(b.projectionMatrix),Xu(wt),qu(wt),pe.setValue(C,"projectionMatrix",wt)):pe.setValue(C,"projectionMatrix",b.projectionMatrix),pe.setValue(C,"viewMatrix",b.matrixWorldInverse);const Xe=pe.map.cameraPosition;Xe!==void 0&&Xe.setValue(C,Ut.setFromMatrixPosition(b.matrixWorld)),Q.logarithmicDepthBuffer&&pe.setValue(C,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&pe.setValue(C,"isOrthographic",b.isOrthographicCamera===!0),N!==b&&(N=b,Be=!0,Ar=!0)}if(U.isSkinnedMesh){pe.setOptional(C,U,"bindMatrix"),pe.setOptional(C,U,"bindMatrixInverse");const Xe=U.skeleton;Xe&&(Xe.boneTexture===null&&Xe.computeBoneTexture(),pe.setValue(C,"boneTexture",Xe.boneTexture,R))}U.isBatchedMesh&&(pe.setOptional(C,U,"batchingTexture"),pe.setValue(C,"batchingTexture",U._matricesTexture,R),pe.setOptional(C,U,"batchingIdTexture"),pe.setValue(C,"batchingIdTexture",U._indirectTexture,R),pe.setOptional(C,U,"batchingColorTexture"),U._colorsTexture!==null&&pe.setValue(C,"batchingColorTexture",U._colorsTexture,R));const Rr=B.morphAttributes;if((Rr.position!==void 0||Rr.normal!==void 0||Rr.color!==void 0)&&Bt.update(U,B,Ze),(Be||Lt.receiveShadow!==U.receiveShadow)&&(Lt.receiveShadow=U.receiveShadow,pe.setValue(C,"receiveShadow",U.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Rn.envMap.value=Rt,Rn.flipEnvMap.value=Rt.isCubeTexture&&Rt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&D.environment!==null&&(Rn.envMapIntensity.value=D.environmentIntensity),Be&&(pe.setValue(C,"toneMappingExposure",v.toneMappingExposure),Lt.needsLights&&Ch(Rn,Ar),nt&&H.fog===!0&&lt.refreshFogUniforms(Rn,nt),lt.refreshMaterialUniforms(Rn,H,K,z,p.state.transmissionRenderTarget[b.id]),cr.upload(C,rl(Lt),Rn,R)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(cr.upload(C,rl(Lt),Rn,R),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&pe.setValue(C,"center",U.center),pe.setValue(C,"modelViewMatrix",U.modelViewMatrix),pe.setValue(C,"normalMatrix",U.normalMatrix),pe.setValue(C,"modelMatrix",U.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Xe=H.uniformsGroups;for(let Cr=0,Lh=Xe.length;Cr<Lh;Cr++){const al=Xe[Cr];I.update(al,Ze),I.bind(al,Ze)}}return Ze}function Ch(b,D){b.ambientLightColor.needsUpdate=D,b.lightProbe.needsUpdate=D,b.directionalLights.needsUpdate=D,b.directionalLightShadows.needsUpdate=D,b.pointLights.needsUpdate=D,b.pointLightShadows.needsUpdate=D,b.spotLights.needsUpdate=D,b.spotLightShadows.needsUpdate=D,b.rectAreaLights.needsUpdate=D,b.hemisphereLights.needsUpdate=D}function Ph(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(b,D,B){xt.get(b.texture).__webglTexture=D,xt.get(b.depthTexture).__webglTexture=B;const H=xt.get(b);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=B===void 0,H.__autoAllocateDepthBuffer||it.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,D){const B=xt.get(b);B.__webglFramebuffer=D,B.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(b,D=0,B=0){E=b,T=D,A=B;let H=!0,U=null,nt=!1,gt=!1;if(b){const Rt=xt.get(b);if(Rt.__useDefaultFramebuffer!==void 0)ot.bindFramebuffer(C.FRAMEBUFFER,null),H=!1;else if(Rt.__webglFramebuffer===void 0)R.setupRenderTarget(b);else if(Rt.__hasExternalTextures)R.rebindTextures(b,xt.get(b.texture).__webglTexture,xt.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const Ct=b.depthTexture;if(Rt.__boundDepthTexture!==Ct){if(Ct!==null&&xt.has(Ct)&&(b.width!==Ct.image.width||b.height!==Ct.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(b)}}const Nt=b.texture;(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)&&(gt=!0);const Ft=xt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ft[D])?U=Ft[D][B]:U=Ft[D],nt=!0):b.samples>0&&R.useMultisampledRTT(b)===!1?U=xt.get(b).__webglMultisampledFramebuffer:Array.isArray(Ft)?U=Ft[B]:U=Ft,y.copy(b.viewport),w.copy(b.scissor),k=b.scissorTest}else y.copy(dt).multiplyScalar(K).floor(),w.copy(ft).multiplyScalar(K).floor(),k=qt;if(ot.bindFramebuffer(C.FRAMEBUFFER,U)&&H&&ot.drawBuffers(b,U),ot.viewport(y),ot.scissor(w),ot.setScissorTest(k),nt){const Rt=xt.get(b.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+D,Rt.__webglTexture,B)}else if(gt){const Rt=xt.get(b.texture),Nt=D||0;C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,Rt.__webglTexture,B||0,Nt)}P=-1},this.readRenderTargetPixels=function(b,D,B,H,U,nt,gt){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Tt=xt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&gt!==void 0&&(Tt=Tt[gt]),Tt){ot.bindFramebuffer(C.FRAMEBUFFER,Tt);try{const Rt=b.texture,Nt=Rt.format,Ft=Rt.type;if(!Q.textureFormatReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Q.textureTypeReadable(Ft)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=b.width-H&&B>=0&&B<=b.height-U&&C.readPixels(D,B,H,U,Gt.convert(Nt),Gt.convert(Ft),nt)}finally{const Rt=E!==null?xt.get(E).__webglFramebuffer:null;ot.bindFramebuffer(C.FRAMEBUFFER,Rt)}}},this.readRenderTargetPixelsAsync=async function(b,D,B,H,U,nt,gt){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Tt=xt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&gt!==void 0&&(Tt=Tt[gt]),Tt){const Rt=b.texture,Nt=Rt.format,Ft=Rt.type;if(!Q.textureFormatReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Q.textureTypeReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=b.width-H&&B>=0&&B<=b.height-U){ot.bindFramebuffer(C.FRAMEBUFFER,Tt);const Ct=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,Ct),C.bufferData(C.PIXEL_PACK_BUFFER,nt.byteLength,C.STREAM_READ),C.readPixels(D,B,H,U,Gt.convert(Nt),Gt.convert(Ft),0);const ie=E!==null?xt.get(E).__webglFramebuffer:null;ot.bindFramebuffer(C.FRAMEBUFFER,ie);const ae=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await Wu(C,ae,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,Ct),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,nt),C.deleteBuffer(Ct),C.deleteSync(ae),nt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,D=null,B=0){b.isTexture!==!0&&(lr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,b=arguments[1]);const H=Math.pow(2,-B),U=Math.floor(b.image.width*H),nt=Math.floor(b.image.height*H),gt=D!==null?D.x:0,Tt=D!==null?D.y:0;R.setTexture2D(b,0),C.copyTexSubImage2D(C.TEXTURE_2D,B,0,0,gt,Tt,U,nt),ot.unbindTexture()},this.copyTextureToTexture=function(b,D,B=null,H=null,U=0){b.isTexture!==!0&&(lr("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,b=arguments[1],D=arguments[2],U=arguments[3]||0,B=null);let nt,gt,Tt,Rt,Nt,Ft;B!==null?(nt=B.max.x-B.min.x,gt=B.max.y-B.min.y,Tt=B.min.x,Rt=B.min.y):(nt=b.image.width,gt=b.image.height,Tt=0,Rt=0),H!==null?(Nt=H.x,Ft=H.y):(Nt=0,Ft=0);const Ct=Gt.convert(D.format),ie=Gt.convert(D.type);R.setTexture2D(D,0),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,D.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,D.unpackAlignment);const ae=C.getParameter(C.UNPACK_ROW_LENGTH),de=C.getParameter(C.UNPACK_IMAGE_HEIGHT),Oe=C.getParameter(C.UNPACK_SKIP_PIXELS),te=C.getParameter(C.UNPACK_SKIP_ROWS),Lt=C.getParameter(C.UNPACK_SKIP_IMAGES),be=b.isCompressedTexture?b.mipmaps[U]:b.image;C.pixelStorei(C.UNPACK_ROW_LENGTH,be.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,be.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Tt),C.pixelStorei(C.UNPACK_SKIP_ROWS,Rt),b.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,U,Nt,Ft,nt,gt,Ct,ie,be.data):b.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,U,Nt,Ft,be.width,be.height,Ct,be.data):C.texSubImage2D(C.TEXTURE_2D,U,Nt,Ft,nt,gt,Ct,ie,be),C.pixelStorei(C.UNPACK_ROW_LENGTH,ae),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,de),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Oe),C.pixelStorei(C.UNPACK_SKIP_ROWS,te),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Lt),U===0&&D.generateMipmaps&&C.generateMipmap(C.TEXTURE_2D),ot.unbindTexture()},this.copyTextureToTexture3D=function(b,D,B=null,H=null,U=0){b.isTexture!==!0&&(lr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),B=arguments[0]||null,H=arguments[1]||null,b=arguments[2],D=arguments[3],U=arguments[4]||0);let nt,gt,Tt,Rt,Nt,Ft,Ct,ie,ae;const de=b.isCompressedTexture?b.mipmaps[U]:b.image;B!==null?(nt=B.max.x-B.min.x,gt=B.max.y-B.min.y,Tt=B.max.z-B.min.z,Rt=B.min.x,Nt=B.min.y,Ft=B.min.z):(nt=de.width,gt=de.height,Tt=de.depth,Rt=0,Nt=0,Ft=0),H!==null?(Ct=H.x,ie=H.y,ae=H.z):(Ct=0,ie=0,ae=0);const Oe=Gt.convert(D.format),te=Gt.convert(D.type);let Lt;if(D.isData3DTexture)R.setTexture3D(D,0),Lt=C.TEXTURE_3D;else if(D.isDataArrayTexture||D.isCompressedArrayTexture)R.setTexture2DArray(D,0),Lt=C.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,D.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,D.unpackAlignment);const be=C.getParameter(C.UNPACK_ROW_LENGTH),ee=C.getParameter(C.UNPACK_IMAGE_HEIGHT),Ze=C.getParameter(C.UNPACK_SKIP_PIXELS),ui=C.getParameter(C.UNPACK_SKIP_ROWS),Be=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,de.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,de.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Rt),C.pixelStorei(C.UNPACK_SKIP_ROWS,Nt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Ft),b.isDataTexture||b.isData3DTexture?C.texSubImage3D(Lt,U,Ct,ie,ae,nt,gt,Tt,Oe,te,de.data):D.isCompressedArrayTexture?C.compressedTexSubImage3D(Lt,U,Ct,ie,ae,nt,gt,Tt,Oe,de.data):C.texSubImage3D(Lt,U,Ct,ie,ae,nt,gt,Tt,Oe,te,de),C.pixelStorei(C.UNPACK_ROW_LENGTH,be),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ee),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Ze),C.pixelStorei(C.UNPACK_SKIP_ROWS,ui),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Be),U===0&&D.generateMipmaps&&C.generateMipmap(Lt),ot.unbindTexture()},this.initRenderTarget=function(b){xt.get(b).__webglFramebuffer===void 0&&R.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?R.setTextureCube(b,0):b.isData3DTexture?R.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?R.setTexture2DArray(b,0):R.setTexture2D(b,0),ot.unbindTexture()},this.resetState=function(){T=0,A=0,E=null,ot.reset(),oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return wn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===Oa?"display-p3":"srgb",e.unpackColorSpace=ne.workingColorSpace===Sr?"display-p3":"srgb"}}class rg extends Te{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pn,this.environmentIntensity=1,this.environmentRotation=new pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class og extends Ce{constructor(t=null,e=1,n=1,i,s,o,a,l,c=Ne,h=Ne,u,d){super(null,o,a,l,c,h,i,s,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ac extends Ge{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Ri=new re,lc=new re,js=[],cc=new hi,ag=new re,is=new ke,ss=new Es;class lg extends ke{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new ac(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,ag)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new hi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ri),cc.copy(t.boundingBox).applyMatrix4(Ri),this.boundingBox.union(cc)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Es),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ri),ss.copy(t.boundingSphere).applyMatrix4(Ri),this.boundingSphere.union(ss)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,o=t*s+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(t,e){const n=this.matrixWorld,i=this.count;if(is.geometry=this.geometry,is.material=this.material,is.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ss.copy(this.boundingSphere),ss.applyMatrix4(n),t.ray.intersectsSphere(ss)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,Ri),lc.multiplyMatrices(n,Ri),is.matrixWorld=lc,is.raycast(t,js);for(let o=0,a=js.length;o<a;o++){const l=js[o];l.instanceId=s,l.object=this,e.push(l)}js.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new ac(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new og(new Float32Array(i*this.count),i,this.count,Ua,dn));const s=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=i*t;s[l]=a,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class hc extends Ce{constructor(t,e,n,i,s,o,a,l,c){super(t,e,n,i,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class mn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,i=this.getPoint(0),s=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),s+=n.distanceTo(i),e.push(s),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let i=0;const s=n.length;let o;e?o=e:o=t*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(s-1);const h=n[i],d=n[i+1]-h,f=(o-h)/d;return(i+f)/(s-1)}getTangent(t,e){let i=t-1e-4,s=t+1e-4;i<0&&(i=0),s>1&&(s=1);const o=this.getPoint(i),a=this.getPoint(s),l=e||(o.isVector2?new st:new L);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new L,i=[],s=[],o=[],a=new L,l=new re;for(let f=0;f<=t;f++){const g=f/t;i[f]=this.getTangentAt(g,new L)}s[0]=new L,o[0]=new L;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],a),o[0].crossVectors(i[0],s[0]);for(let f=1;f<=t;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Ee(i[f-1].dot(i[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(i[f],s[f])}if(e===!0){let f=Math.acos(Ee(s[0].dot(s[t]),-1,1));f/=t,i[0].dot(a.crossVectors(s[0],s[t]))>0&&(f=-f);for(let g=1;g<=t;g++)s[g].applyMatrix4(l.makeRotationAxis(i[g],f*g)),o[g].crossVectors(i[g],s[g])}return{tangents:i,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class Ga extends mn{constructor(t=0,e=0,n=1,i=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new st){const n=e,i=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=i;for(;s>i;)s-=i;s<Number.EPSILON&&(o?s=0:s=i),this.aClockwise===!0&&!o&&(s===i?s=-i:s=s-i);const a=this.aStartAngle+t*s;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class cg extends Ga{constructor(t,e,n,i,s,o){super(t,e,n,n,i,s,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Va(){let r=0,t=0,e=0,n=0;function i(s,o,a,l){r=s,t=a,e=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){i(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,h,u){let d=(o-s)/c-(a-s)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,i(o,a,d,f)},calc:function(s){const o=s*s,a=o*s;return r+t*s+e*o+n*a}}}const Js=new L,po=new Va,mo=new Va,go=new Va;class hg extends mn{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new L){const n=e,i=this.points,s=i.length,o=(s-(this.closed?0:1))*t;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,h;this.closed||a>0?c=i[(a-1)%s]:(Js.subVectors(i[0],i[1]).add(i[0]),c=Js);const u=i[a%s],d=i[(a+1)%s];if(this.closed||a+2<s?h=i[(a+2)%s]:(Js.subVectors(i[s-1],i[s-2]).add(i[s-1]),h=Js),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),M=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);M<1e-4&&(M=1),g<1e-4&&(g=M),p<1e-4&&(p=M),po.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,M,p),mo.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,M,p),go.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,M,p)}else this.curveType==="catmullrom"&&(po.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),mo.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),go.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(po.calc(l),mo.calc(l),go.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new L().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function uc(r,t,e,n,i){const s=(n-t)*.5,o=(i-e)*.5,a=r*r,l=r*a;return(2*e-2*n+s+o)*l+(-3*e+3*n-2*s-o)*a+s*r+e}function ug(r,t){const e=1-r;return e*e*t}function dg(r,t){return 2*(1-r)*r*t}function fg(r,t){return r*r*t}function ls(r,t,e,n){return ug(r,t)+dg(r,e)+fg(r,n)}function pg(r,t){const e=1-r;return e*e*e*t}function mg(r,t){const e=1-r;return 3*e*e*r*t}function gg(r,t){return 3*(1-r)*r*r*t}function xg(r,t){return r*r*r*t}function cs(r,t,e,n,i){return pg(r,t)+mg(r,e)+gg(r,n)+xg(r,i)}class hh extends mn{constructor(t=new st,e=new st,n=new st,i=new st){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new st){const n=e,i=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(cs(t,i.x,s.x,o.x,a.x),cs(t,i.y,s.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class vg extends mn{constructor(t=new L,e=new L,n=new L,i=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new L){const n=e,i=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(cs(t,i.x,s.x,o.x,a.x),cs(t,i.y,s.y,o.y,a.y),cs(t,i.z,s.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class uh extends mn{constructor(t=new st,e=new st){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new st){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new st){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class _g extends mn{constructor(t=new L,e=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new L){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new L){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class dh extends mn{constructor(t=new st,e=new st,n=new st){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new st){const n=e,i=this.v0,s=this.v1,o=this.v2;return n.set(ls(t,i.x,s.x,o.x),ls(t,i.y,s.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Mg extends mn{constructor(t=new L,e=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new L){const n=e,i=this.v0,s=this.v1,o=this.v2;return n.set(ls(t,i.x,s.x,o.x),ls(t,i.y,s.y,o.y),ls(t,i.z,s.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class fh extends mn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new st){const n=e,i=this.points,s=(i.length-1)*t,o=Math.floor(s),a=s-o,l=i[o===0?o:o-1],c=i[o],h=i[o>i.length-2?i.length-1:o+1],u=i[o>i.length-3?i.length-1:o+2];return n.set(uc(a,l.x,c.x,h.x,u.x),uc(a,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new st().fromArray(i))}return this}}var va=Object.freeze({__proto__:null,ArcCurve:cg,CatmullRomCurve3:hg,CubicBezierCurve:hh,CubicBezierCurve3:vg,EllipseCurve:Ga,LineCurve:uh,LineCurve3:_g,QuadraticBezierCurve:dh,QuadraticBezierCurve3:Mg,SplineCurve:fh});class yg extends mn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new va[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),i=this.getCurveLengths();let s=0;for(;s<i.length;){if(i[s]>=n){const o=i[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}s++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let i=0,s=this.curves;i<s.length;i++){const o=s[i],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(new va[i.type]().fromJSON(i))}return this}}class _a extends yg{constructor(t){super(),this.type="Path",this.currentPoint=new st,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new uh(this.currentPoint.clone(),new st(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){const s=new dh(this.currentPoint.clone(),new st(t,e),new st(n,i));return this.curves.push(s),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,s,o){const a=new hh(this.currentPoint.clone(),new st(t,e),new st(n,i),new st(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new fh(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,s,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,i,s,o),this}absarc(t,e,n,i,s,o){return this.absellipse(t,e,n,n,i,s,o),this}ellipse(t,e,n,i,s,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,s,o,a,l),this}absellipse(t,e,n,i,s,o,a,l){const c=new Ga(t,e,n,i,s,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class Wa extends Le{constructor(t=[new st(0,-.5),new st(.5,0),new st(0,.5)],e=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:i},e=Math.floor(e),i=Ee(i,0,Math.PI*2);const s=[],o=[],a=[],l=[],c=[],h=1/e,u=new L,d=new st,f=new L,g=new L,M=new L;let p=0,m=0;for(let _=0;_<=t.length-1;_++)switch(_){case 0:p=t[_+1].x-t[_].x,m=t[_+1].y-t[_].y,f.x=m*1,f.y=-p,f.z=m*0,M.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(M.x,M.y,M.z);break;default:p=t[_+1].x-t[_].x,m=t[_+1].y-t[_].y,f.x=m*1,f.y=-p,f.z=m*0,g.copy(f),f.x+=M.x,f.y+=M.y,f.z+=M.z,f.normalize(),l.push(f.x,f.y,f.z),M.copy(g)}for(let _=0;_<=e;_++){const v=n+_*h*i,x=Math.sin(v),T=Math.cos(v);for(let A=0;A<=t.length-1;A++){u.x=t[A].x*x,u.y=t[A].y,u.z=t[A].x*T,o.push(u.x,u.y,u.z),d.x=_/e,d.y=A/(t.length-1),a.push(d.x,d.y);const E=l[3*A+0]*x,P=l[3*A+1],N=l[3*A+0]*T;c.push(E,P,N)}}for(let _=0;_<e;_++)for(let v=0;v<t.length-1;v++){const x=v+_*t.length,T=x,A=x+t.length,E=x+t.length+1,P=x+1;s.push(T,A,P),s.push(E,P,A)}this.setIndex(s),this.setAttribute("position",new ce(o,3)),this.setAttribute("uv",new ce(a,2)),this.setAttribute("normal",new ce(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Wa(t.points,t.segments,t.phiStart,t.phiLength)}}class Xa extends Wa{constructor(t=1,e=1,n=4,i=8){const s=new _a;s.absarc(0,-e/2,t,Math.PI*1.5,0),s.absarc(0,e/2,t,0,Math.PI*.5),super(s.getPoints(n),i),this.type="CapsuleGeometry",this.parameters={radius:t,length:e,capSegments:n,radialSegments:i}}static fromJSON(t){return new Xa(t.radius,t.length,t.capSegments,t.radialSegments)}}class ii extends Le{constructor(t=1,e=1,n=1,i=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;i=Math.floor(i),s=Math.floor(s);const h=[],u=[],d=[],f=[];let g=0;const M=[],p=n/2;let m=0;_(),o===!1&&(t>0&&v(!0),e>0&&v(!1)),this.setIndex(h),this.setAttribute("position",new ce(u,3)),this.setAttribute("normal",new ce(d,3)),this.setAttribute("uv",new ce(f,2));function _(){const x=new L,T=new L;let A=0;const E=(e-t)/n;for(let P=0;P<=s;P++){const N=[],y=P/s,w=y*(e-t)+t;for(let k=0;k<=i;k++){const F=k/i,G=F*l+a,Y=Math.sin(G),z=Math.cos(G);T.x=w*Y,T.y=-y*n+p,T.z=w*z,u.push(T.x,T.y,T.z),x.set(Y,E,z).normalize(),d.push(x.x,x.y,x.z),f.push(F,1-y),N.push(g++)}M.push(N)}for(let P=0;P<i;P++)for(let N=0;N<s;N++){const y=M[N][P],w=M[N+1][P],k=M[N+1][P+1],F=M[N][P+1];t>0&&(h.push(y,w,F),A+=3),e>0&&(h.push(w,k,F),A+=3)}c.addGroup(m,A,0),m+=A}function v(x){const T=g,A=new st,E=new L;let P=0;const N=x===!0?t:e,y=x===!0?1:-1;for(let k=1;k<=i;k++)u.push(0,p*y,0),d.push(0,y,0),f.push(.5,.5),g++;const w=g;for(let k=0;k<=i;k++){const G=k/i*l+a,Y=Math.cos(G),z=Math.sin(G);E.x=N*z,E.y=p*y,E.z=N*Y,u.push(E.x,E.y,E.z),d.push(0,y,0),A.x=Y*.5+.5,A.y=z*.5*y+.5,f.push(A.x,A.y),g++}for(let k=0;k<i;k++){const F=T+k,G=w+k;x===!0?h.push(G,G+1,F):h.push(G+1,G,F),P+=3}c.addGroup(m,P,x===!0?1:2),m+=P}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ii(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class qa extends ii{constructor(t=1,e=1,n=32,i=1,s=!1,o=0,a=Math.PI*2){super(0,t,e,n,i,s,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(t){return new qa(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class br extends Le{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};const s=[],o=[];a(i),c(n),h(),this.setAttribute("position",new ce(s,3)),this.setAttribute("normal",new ce(s.slice(),3)),this.setAttribute("uv",new ce(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(_){const v=new L,x=new L,T=new L;for(let A=0;A<e.length;A+=3)f(e[A+0],v),f(e[A+1],x),f(e[A+2],T),l(v,x,T,_)}function l(_,v,x,T){const A=T+1,E=[];for(let P=0;P<=A;P++){E[P]=[];const N=_.clone().lerp(x,P/A),y=v.clone().lerp(x,P/A),w=A-P;for(let k=0;k<=w;k++)k===0&&P===A?E[P][k]=N:E[P][k]=N.clone().lerp(y,k/w)}for(let P=0;P<A;P++)for(let N=0;N<2*(A-P)-1;N++){const y=Math.floor(N/2);N%2===0?(d(E[P][y+1]),d(E[P+1][y]),d(E[P][y])):(d(E[P][y+1]),d(E[P+1][y+1]),d(E[P+1][y]))}}function c(_){const v=new L;for(let x=0;x<s.length;x+=3)v.x=s[x+0],v.y=s[x+1],v.z=s[x+2],v.normalize().multiplyScalar(_),s[x+0]=v.x,s[x+1]=v.y,s[x+2]=v.z}function h(){const _=new L;for(let v=0;v<s.length;v+=3){_.x=s[v+0],_.y=s[v+1],_.z=s[v+2];const x=p(_)/2/Math.PI+.5,T=m(_)/Math.PI+.5;o.push(x,1-T)}g(),u()}function u(){for(let _=0;_<o.length;_+=6){const v=o[_+0],x=o[_+2],T=o[_+4],A=Math.max(v,x,T),E=Math.min(v,x,T);A>.9&&E<.1&&(v<.2&&(o[_+0]+=1),x<.2&&(o[_+2]+=1),T<.2&&(o[_+4]+=1))}}function d(_){s.push(_.x,_.y,_.z)}function f(_,v){const x=_*3;v.x=t[x+0],v.y=t[x+1],v.z=t[x+2]}function g(){const _=new L,v=new L,x=new L,T=new L,A=new st,E=new st,P=new st;for(let N=0,y=0;N<s.length;N+=9,y+=6){_.set(s[N+0],s[N+1],s[N+2]),v.set(s[N+3],s[N+4],s[N+5]),x.set(s[N+6],s[N+7],s[N+8]),A.set(o[y+0],o[y+1]),E.set(o[y+2],o[y+3]),P.set(o[y+4],o[y+5]),T.copy(_).add(v).add(x).divideScalar(3);const w=p(T);M(A,y+0,_,w),M(E,y+2,v,w),M(P,y+4,x,w)}}function M(_,v,x,T){T<0&&_.x===1&&(o[v]=_.x-1),x.x===0&&x.z===0&&(o[v]=T/2/Math.PI+.5)}function p(_){return Math.atan2(_.z,-_.x)}function m(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new br(t.vertices,t.indices,t.radius,t.details)}}class hs extends br{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=1/n,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new hs(t.radius,t.detail)}}class ph extends _a{constructor(t){super(t),this.uuid=$i(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(new _a().fromJSON(i))}return this}}const Sg={triangulate:function(r,t,e=2){const n=t&&t.length,i=n?t[0]*e:r.length;let s=mh(r,0,i,e,!0);const o=[];if(!s||s.next===s.prev)return o;let a,l,c,h,u,d,f;if(n&&(s=Ag(r,t,s,e)),r.length>80*e){a=c=r[0],l=h=r[1];for(let g=e;g<i;g+=e)u=r[g],d=r[g+1],u<a&&(a=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return gs(s,o,e,a,l,f,0),o}};function mh(r,t,e,n,i){let s,o;if(i===Og(r,t,e,n)>0)for(s=t;s<e;s+=n)o=dc(s,r[s],r[s+1],o);else for(s=e-n;s>=t;s-=n)o=dc(s,r[s],r[s+1],o);return o&&Er(o,o.next)&&(vs(o),o=o.next),o}function li(r,t){if(!r)return r;t||(t=r);let e=r,n;do if(n=!1,!e.steiner&&(Er(e,e.next)||ue(e.prev,e,e.next)===0)){if(vs(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function gs(r,t,e,n,i,s,o){if(!r)return;!o&&s&&Ig(r,n,i,s);let a=r,l,c;for(;r.prev!==r.next;){if(l=r.prev,c=r.next,s?bg(r,n,i,s):wg(r)){t.push(l.i/e|0),t.push(r.i/e|0),t.push(c.i/e|0),vs(r),r=c.next,a=c.next;continue}if(r=c,r===a){o?o===1?(r=Eg(li(r),t,e),gs(r,t,e,n,i,s,2)):o===2&&Tg(r,t,e,n,i,s):gs(li(r),t,e,n,i,s,1);break}}}function wg(r){const t=r.prev,e=r,n=r.next;if(ue(t,e,n)>=0)return!1;const i=t.x,s=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=i<s?i<o?i:o:s<o?s:o,u=a<l?a<c?a:c:l<c?l:c,d=i>s?i>o?i:o:s>o?s:o,f=a>l?a>c?a:c:l>c?l:c;let g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&Di(i,a,s,l,o,c,g.x,g.y)&&ue(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function bg(r,t,e,n){const i=r.prev,s=r,o=r.next;if(ue(i,s,o)>=0)return!1;const a=i.x,l=s.x,c=o.x,h=i.y,u=s.y,d=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<d?h:d:u<d?u:d,M=a>l?a>c?a:c:l>c?l:c,p=h>u?h>d?h:d:u>d?u:d,m=Ma(f,g,t,e,n),_=Ma(M,p,t,e,n);let v=r.prevZ,x=r.nextZ;for(;v&&v.z>=m&&x&&x.z<=_;){if(v.x>=f&&v.x<=M&&v.y>=g&&v.y<=p&&v!==i&&v!==o&&Di(a,h,l,u,c,d,v.x,v.y)&&ue(v.prev,v,v.next)>=0||(v=v.prevZ,x.x>=f&&x.x<=M&&x.y>=g&&x.y<=p&&x!==i&&x!==o&&Di(a,h,l,u,c,d,x.x,x.y)&&ue(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;v&&v.z>=m;){if(v.x>=f&&v.x<=M&&v.y>=g&&v.y<=p&&v!==i&&v!==o&&Di(a,h,l,u,c,d,v.x,v.y)&&ue(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;x&&x.z<=_;){if(x.x>=f&&x.x<=M&&x.y>=g&&x.y<=p&&x!==i&&x!==o&&Di(a,h,l,u,c,d,x.x,x.y)&&ue(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Eg(r,t,e){let n=r;do{const i=n.prev,s=n.next.next;!Er(i,s)&&gh(i,n,n.next,s)&&xs(i,s)&&xs(s,i)&&(t.push(i.i/e|0),t.push(n.i/e|0),t.push(s.i/e|0),vs(n),vs(n.next),n=r=s),n=n.next}while(n!==r);return li(n)}function Tg(r,t,e,n,i,s){let o=r;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Ng(o,a)){let l=xh(o,a);o=li(o,o.next),l=li(l,l.next),gs(o,t,e,n,i,s,0),gs(l,t,e,n,i,s,0);return}a=a.next}o=o.next}while(o!==r)}function Ag(r,t,e,n){const i=[];let s,o,a,l,c;for(s=0,o=t.length;s<o;s++)a=t[s]*n,l=s<o-1?t[s+1]*n:r.length,c=mh(r,a,l,n,!1),c===c.next&&(c.steiner=!0),i.push(Ug(c));for(i.sort(Rg),s=0;s<i.length;s++)e=Cg(i[s],e);return e}function Rg(r,t){return r.x-t.x}function Cg(r,t){const e=Pg(r,t);if(!e)return t;const n=xh(e,r);return li(n,n.next),li(e,e.next)}function Pg(r,t){let e=t,n=-1/0,i;const s=r.x,o=r.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){const d=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=s&&d>n&&(n=d,i=e.x<e.next.x?e:e.next,d===s))return i}e=e.next}while(e!==t);if(!i)return null;const a=i,l=i.x,c=i.y;let h=1/0,u;e=i;do s>=e.x&&e.x>=l&&s!==e.x&&Di(o<c?s:n,o,l,c,o<c?n:s,o,e.x,e.y)&&(u=Math.abs(o-e.y)/(s-e.x),xs(e,r)&&(u<h||u===h&&(e.x>i.x||e.x===i.x&&Lg(i,e)))&&(i=e,h=u)),e=e.next;while(e!==a);return i}function Lg(r,t){return ue(r.prev,r,t.prev)<0&&ue(t.next,r,r.next)<0}function Ig(r,t,e,n){let i=r;do i.z===0&&(i.z=Ma(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==r);i.prevZ.nextZ=null,i.prevZ=null,Dg(i)}function Dg(r){let t,e,n,i,s,o,a,l,c=1;do{for(e=r,r=null,s=null,o=0;e;){for(o++,n=e,a=0,t=0;t<c&&(a++,n=n.nextZ,!!n);t++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||e.z<=n.z)?(i=e,e=e.nextZ,a--):(i=n,n=n.nextZ,l--),s?s.nextZ=i:r=i,i.prevZ=s,s=i;e=n}s.nextZ=null,c*=2}while(o>1);return r}function Ma(r,t,e,n,i){return r=(r-e)*i|0,t=(t-n)*i|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,r|t<<1}function Ug(r){let t=r,e=r;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==r);return e}function Di(r,t,e,n,i,s,o,a){return(i-o)*(t-a)>=(r-o)*(s-a)&&(r-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(s-a)>=(i-o)*(n-a)}function Ng(r,t){return r.next.i!==t.i&&r.prev.i!==t.i&&!kg(r,t)&&(xs(r,t)&&xs(t,r)&&Fg(r,t)&&(ue(r.prev,r,t.prev)||ue(r,t.prev,t))||Er(r,t)&&ue(r.prev,r,r.next)>0&&ue(t.prev,t,t.next)>0)}function ue(r,t,e){return(t.y-r.y)*(e.x-t.x)-(t.x-r.x)*(e.y-t.y)}function Er(r,t){return r.x===t.x&&r.y===t.y}function gh(r,t,e,n){const i=tr(ue(r,t,e)),s=tr(ue(r,t,n)),o=tr(ue(e,n,r)),a=tr(ue(e,n,t));return!!(i!==s&&o!==a||i===0&&Qs(r,e,t)||s===0&&Qs(r,n,t)||o===0&&Qs(e,r,n)||a===0&&Qs(e,t,n))}function Qs(r,t,e){return t.x<=Math.max(r.x,e.x)&&t.x>=Math.min(r.x,e.x)&&t.y<=Math.max(r.y,e.y)&&t.y>=Math.min(r.y,e.y)}function tr(r){return r>0?1:r<0?-1:0}function kg(r,t){let e=r;do{if(e.i!==r.i&&e.next.i!==r.i&&e.i!==t.i&&e.next.i!==t.i&&gh(e,e.next,r,t))return!0;e=e.next}while(e!==r);return!1}function xs(r,t){return ue(r.prev,r,r.next)<0?ue(r,t,r.next)>=0&&ue(r,r.prev,t)>=0:ue(r,t,r.prev)<0||ue(r,r.next,t)<0}function Fg(r,t){let e=r,n=!1;const i=(r.x+t.x)/2,s=(r.y+t.y)/2;do e.y>s!=e.next.y>s&&e.next.y!==e.y&&i<(e.next.x-e.x)*(s-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==r);return n}function xh(r,t){const e=new ya(r.i,r.x,r.y),n=new ya(t.i,t.x,t.y),i=r.next,s=t.prev;return r.next=t,t.prev=r,e.next=i,i.prev=e,n.next=e,e.prev=n,s.next=n,n.prev=s,n}function dc(r,t,e,n){const i=new ya(r,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function vs(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function ya(r,t,e){this.i=r,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Og(r,t,e,n){let i=0;for(let s=t,o=e-n;s<e;s+=n)i+=(r[o]-r[s])*(r[s+1]+r[o+1]),o=s;return i}class us{static area(t){const e=t.length;let n=0;for(let i=e-1,s=0;s<e;i=s++)n+=t[i].x*t[s].y-t[s].x*t[i].y;return n*.5}static isClockWise(t){return us.area(t)<0}static triangulateShape(t,e){const n=[],i=[],s=[];fc(t),pc(n,t);let o=t.length;e.forEach(fc);for(let l=0;l<e.length;l++)i.push(o),o+=e[l].length,pc(n,e[l]);const a=Sg.triangulate(n,i);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}}function fc(r){const t=r.length;t>2&&r[t-1].equals(r[0])&&r.pop()}function pc(r,t){for(let e=0;e<t.length;e++)r.push(t[e].x),r.push(t[e].y)}class $a extends Le{constructor(t=new ph([new st(.5,.5),new st(-.5,.5),new st(-.5,-.5),new st(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,i=[],s=[];for(let a=0,l=t.length;a<l;a++){const c=t[a];o(c)}this.setAttribute("position",new ce(i,3)),this.setAttribute("uv",new ce(s,2)),this.computeVertexNormals();function o(a){const l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1;let d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,M=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3;const m=e.extrudePath,_=e.UVGenerator!==void 0?e.UVGenerator:Bg;let v,x=!1,T,A,E,P;m&&(v=m.getSpacedPoints(h),x=!0,d=!1,T=m.computeFrenetFrames(h,!1),A=new L,E=new L,P=new L),d||(p=0,f=0,g=0,M=0);const N=a.extractPoints(c);let y=N.shape;const w=N.holes;if(!us.isClockWise(y)){y=y.reverse();for(let Z=0,C=w.length;Z<C;Z++){const rt=w[Z];us.isClockWise(rt)&&(w[Z]=rt.reverse())}}const F=us.triangulateShape(y,w),G=y;for(let Z=0,C=w.length;Z<C;Z++){const rt=w[Z];y=y.concat(rt)}function Y(Z,C,rt){return C||console.error("THREE.ExtrudeGeometry: vec does not exist"),Z.clone().addScaledVector(C,rt)}const z=y.length,K=F.length;function V(Z,C,rt){let it,Q,ot;const Pt=Z.x-C.x,xt=Z.y-C.y,R=rt.x-Z.x,S=rt.y-Z.y,O=Pt*Pt+xt*xt,q=Pt*S-xt*R;if(Math.abs(q)>Number.EPSILON){const j=Math.sqrt(O),$=Math.sqrt(R*R+S*S),At=C.x-xt/j,lt=C.y+Pt/j,Mt=rt.x-S/$,Zt=rt.y+R/$,et=((Mt-At)*S-(Zt-lt)*R)/(Pt*S-xt*R);it=At+Pt*et-Z.x,Q=lt+xt*et-Z.y;const yt=it*it+Q*Q;if(yt<=2)return new st(it,Q);ot=Math.sqrt(yt/2)}else{let j=!1;Pt>Number.EPSILON?R>Number.EPSILON&&(j=!0):Pt<-Number.EPSILON?R<-Number.EPSILON&&(j=!0):Math.sign(xt)===Math.sign(S)&&(j=!0),j?(it=-xt,Q=Pt,ot=Math.sqrt(O)):(it=Pt,Q=xt,ot=Math.sqrt(O/2))}return new st(it/ot,Q/ot)}const ut=[];for(let Z=0,C=G.length,rt=C-1,it=Z+1;Z<C;Z++,rt++,it++)rt===C&&(rt=0),it===C&&(it=0),ut[Z]=V(G[Z],G[rt],G[it]);const dt=[];let ft,qt=ut.concat();for(let Z=0,C=w.length;Z<C;Z++){const rt=w[Z];ft=[];for(let it=0,Q=rt.length,ot=Q-1,Pt=it+1;it<Q;it++,ot++,Pt++)ot===Q&&(ot=0),Pt===Q&&(Pt=0),ft[it]=V(rt[it],rt[ot],rt[Pt]);dt.push(ft),qt=qt.concat(ft)}for(let Z=0;Z<p;Z++){const C=Z/p,rt=f*Math.cos(C*Math.PI/2),it=g*Math.sin(C*Math.PI/2)+M;for(let Q=0,ot=G.length;Q<ot;Q++){const Pt=Y(G[Q],ut[Q],it);ht(Pt.x,Pt.y,-rt)}for(let Q=0,ot=w.length;Q<ot;Q++){const Pt=w[Q];ft=dt[Q];for(let xt=0,R=Pt.length;xt<R;xt++){const S=Y(Pt[xt],ft[xt],it);ht(S.x,S.y,-rt)}}}const Kt=g+M;for(let Z=0;Z<z;Z++){const C=d?Y(y[Z],qt[Z],Kt):y[Z];x?(E.copy(T.normals[0]).multiplyScalar(C.x),A.copy(T.binormals[0]).multiplyScalar(C.y),P.copy(v[0]).add(E).add(A),ht(P.x,P.y,P.z)):ht(C.x,C.y,0)}for(let Z=1;Z<=h;Z++)for(let C=0;C<z;C++){const rt=d?Y(y[C],qt[C],Kt):y[C];x?(E.copy(T.normals[Z]).multiplyScalar(rt.x),A.copy(T.binormals[Z]).multiplyScalar(rt.y),P.copy(v[Z]).add(E).add(A),ht(P.x,P.y,P.z)):ht(rt.x,rt.y,u/h*Z)}for(let Z=p-1;Z>=0;Z--){const C=Z/p,rt=f*Math.cos(C*Math.PI/2),it=g*Math.sin(C*Math.PI/2)+M;for(let Q=0,ot=G.length;Q<ot;Q++){const Pt=Y(G[Q],ut[Q],it);ht(Pt.x,Pt.y,u+rt)}for(let Q=0,ot=w.length;Q<ot;Q++){const Pt=w[Q];ft=dt[Q];for(let xt=0,R=Pt.length;xt<R;xt++){const S=Y(Pt[xt],ft[xt],it);x?ht(S.x,S.y+v[h-1].y,v[h-1].x+rt):ht(S.x,S.y,u+rt)}}}X(),tt();function X(){const Z=i.length/3;if(d){let C=0,rt=z*C;for(let it=0;it<K;it++){const Q=F[it];Ut(Q[2]+rt,Q[1]+rt,Q[0]+rt)}C=h+p*2,rt=z*C;for(let it=0;it<K;it++){const Q=F[it];Ut(Q[0]+rt,Q[1]+rt,Q[2]+rt)}}else{for(let C=0;C<K;C++){const rt=F[C];Ut(rt[2],rt[1],rt[0])}for(let C=0;C<K;C++){const rt=F[C];Ut(rt[0]+z*h,rt[1]+z*h,rt[2]+z*h)}}n.addGroup(Z,i.length/3-Z,0)}function tt(){const Z=i.length/3;let C=0;wt(G,C),C+=G.length;for(let rt=0,it=w.length;rt<it;rt++){const Q=w[rt];wt(Q,C),C+=Q.length}n.addGroup(Z,i.length/3-Z,1)}function wt(Z,C){let rt=Z.length;for(;--rt>=0;){const it=rt;let Q=rt-1;Q<0&&(Q=Z.length-1);for(let ot=0,Pt=h+p*2;ot<Pt;ot++){const xt=z*ot,R=z*(ot+1),S=C+it+xt,O=C+Q+xt,q=C+Q+R,j=C+it+R;Dt(S,O,q,j)}}}function ht(Z,C,rt){l.push(Z),l.push(C),l.push(rt)}function Ut(Z,C,rt){Ht(Z),Ht(C),Ht(rt);const it=i.length/3,Q=_.generateTopUV(n,i,it-3,it-2,it-1);$t(Q[0]),$t(Q[1]),$t(Q[2])}function Dt(Z,C,rt,it){Ht(Z),Ht(C),Ht(it),Ht(C),Ht(rt),Ht(it);const Q=i.length/3,ot=_.generateSideWallUV(n,i,Q-6,Q-3,Q-2,Q-1);$t(ot[0]),$t(ot[1]),$t(ot[3]),$t(ot[1]),$t(ot[2]),$t(ot[3])}function Ht(Z){i.push(l[Z*3+0]),i.push(l[Z*3+1]),i.push(l[Z*3+2])}function $t(Z){s.push(Z.x),s.push(Z.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return zg(e,n,t)}static fromJSON(t,e){const n=[];for(let s=0,o=t.shapes.length;s<o;s++){const a=e[t.shapes[s]];n.push(a)}const i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new va[i.type]().fromJSON(i)),new $a(n,t.options)}}const Bg={generateTopUV:function(r,t,e,n,i){const s=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[i*3],h=t[i*3+1];return[new st(s,o),new st(a,l),new st(c,h)]},generateSideWallUV:function(r,t,e,n,i,s){const o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[i*3],f=t[i*3+1],g=t[i*3+2],M=t[s*3],p=t[s*3+1],m=t[s*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new st(o,1-l),new st(c,1-u),new st(d,1-g),new st(M,1-m)]:[new st(a,1-l),new st(h,1-u),new st(f,1-g),new st(p,1-m)]}};function zg(r,t,e){if(e.shapes=[],Array.isArray(r))for(let n=0,i=r.length;n<i;n++){const s=r[n];e.shapes.push(s.uuid)}else e.shapes.push(r.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class gr extends br{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new gr(t.radius,t.detail)}}class xr extends Le{constructor(t=1,e=32,n=16,i=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:s,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new L,d=new L,f=[],g=[],M=[],p=[];for(let m=0;m<=n;m++){const _=[],v=m/n;let x=0;m===0&&o===0?x=.5/e:m===n&&l===Math.PI&&(x=-.5/e);for(let T=0;T<=e;T++){const A=T/e;u.x=-t*Math.cos(i+A*s)*Math.sin(o+v*a),u.y=t*Math.cos(o+v*a),u.z=t*Math.sin(i+A*s)*Math.sin(o+v*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),M.push(d.x,d.y,d.z),p.push(A+x,1-v),_.push(c++)}h.push(_)}for(let m=0;m<n;m++)for(let _=0;_<e;_++){const v=h[m][_+1],x=h[m][_],T=h[m+1][_],A=h[m+1][_+1];(m!==0||o>0)&&f.push(v,x,A),(m!==n-1||l<Math.PI)&&f.push(x,T,A)}this.setIndex(f),this.setAttribute("position",new ce(g,3)),this.setAttribute("normal",new ce(M,3)),this.setAttribute("uv",new ce(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new xr(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class xo extends Ts{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Yt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Yt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xc,this.normalScale=new st(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class vh extends Te{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Yt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Hg extends vh{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Te.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Yt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const vo=new re,mc=new L,gc=new L;class Gg{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new st(512,512),this.map=null,this.mapPass=null,this.matrix=new re,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ba,this._frameExtents=new st(1,1),this._viewportCount=1,this._viewports=[new fe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;mc.setFromMatrixPosition(t.matrixWorld),e.position.copy(mc),gc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(gc),e.updateMatrixWorld(),vo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(vo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(vo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Vg extends Gg{constructor(){super(new za(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Wg extends vh{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Te.DEFAULT_UP),this.updateMatrix(),this.target=new Te,this.shadow=new Vg}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Pa}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Pa);function Xg(r,t=!1){const e=r[0].index!==null,n=new Set(Object.keys(r[0].attributes)),i=new Set(Object.keys(r[0].morphAttributes)),s={},o={},a=r[0].morphTargetsRelative,l=new Le;let c=0;for(let h=0;h<r.length;++h){const u=r[h];let d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;s[f]===void 0&&(s[f]=[]),s[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(t){let f;if(e)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(e){let h=0;const u=[];for(let d=0;d<r.length;++d){const f=r[d].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=r[d].attributes.position.count}l.setIndex(u)}for(const h in s){const u=xc(s[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){const f=[];for(let M=0;M<o[h].length;++M)f.push(o[h][M][d]);const g=xc(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function xc(r){let t,e,n,i=-1,s=0;for(let c=0;c<r.length;++c){const h=r[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=h.count*e}const o=new t(s),a=new Ge(o,e,n);let l=0;for(let c=0;c<r.length;++c){const h=r[c];if(h.isInterleavedBufferAttribute){const u=l/e;for(let d=0,f=h.count;d<f;d++)for(let g=0;g<e;g++){const M=h.getComponent(d,g);a.setComponent(d+u,g,M)}}else o.set(h.array,l);l+=h.count*e}return i!==void 0&&(a.gpuType=i),a}const It={grass:[5800508,6130240,5471289,6393668],hill:[7313993,7774542],hillSide:8020290,marsh:[5661498,5200949],bedShallow:7310450,bedDeep:2968156,dirt:6047280,water:3963560,stone:12169372,stoneDark:9801084,keep:10656392,wood:9067058,woodLight:11565638,door:6175262,roof:10110514,plaster:14865068,rock:9276035,moss:8161886,trunk:6044447,pine:3104563,leaf:4160058,soil:7755832,crop:13217866,sprout:7313982,awning:11942448,awningAlt:15524036,iron:5592405,banner:12857386,player:3431600,skin:14858380,helmet:10134445,shield:11702846,raider:13458462,brute:9185324,bowman:4874292,ram:7754287,catapult:8411194,boulder:8420468,arrow:15786688,arrowHostile:2760728,ladder:11041866,lord:7876728,crown:15516742,hole:1577488};function qg(r,t){const e=r.tiles[t];return e.type==="moat"?-.3:e.terrain==="water"?-.32:e.terrain==="shallows"?-.14:e.terrain==="marsh"?-.02:r.groundElev(t)}const rs=new L(0,1,0);function $g(r){const t=r.attributes.position.array,e=r.attributes.normal.array,n=new Float32Array(t.length/3*2);for(let i=0;i<t.length;i+=9){const s=Math.abs(e[i]+e[i+3]+e[i+6]),o=Math.abs(e[i+1]+e[i+4]+e[i+7]),a=Math.abs(e[i+2]+e[i+5]+e[i+8]);for(let l=0;l<9;l+=3){const c=t[i+l],h=t[i+l+1],u=t[i+l+2],d=(i+l)/3*2;o>=s&&o>=a?(n[d]=c,n[d+1]=u):s>=a?(n[d]=u,n[d+1]=h):(n[d]=c,n[d+1]=h)}}r.setAttribute("uv",new Ge(n,2))}const Yg=new Set(["palisade","wall","thick","gate","tower","keep"]);class Kg{constructor(t){this.canvas=t;const e=new sg({canvas:t,antialias:!0,powerPreference:"high-performance"});e.shadowMap.enabled=!0,e.shadowMap.type=Ic,e.outputColorSpace=Ye,e.toneMapping=Uc,e.toneMappingExposure=1.05,this.renderer=e,this.scene=new rg,this.scene.background=new Yt(1713696),this.camera=new za(-1,1,1,-1,.1,400),this.scene.add(new Hg(14674431,3820074,1.1));const n=new Wg(16773336,2.2);n.castShadow=!0,n.shadow.mapSize.set(2048,2048),n.shadow.bias=-4e-4,n.shadow.normalBias=.03;const i=n.shadow.camera;i.left=-24,i.right=24,i.top=24,i.bottom=-24,i.near=1,i.far=120,this.sun=n,this.scene.add(n),this.scene.add(n.target),this.terrain=new Ii,this.structures=new Ii,this.scene.add(this.terrain,this.structures),this.mats={},this.mapSig="",this.structSig="",this.pools={},this.tmp={m:new re,q:new Se,s:new L,p:new L,c:new Yt},this.buildPools()}mat(t,e,n={}){return this.mats[t]||(this.mats[t]=new xo({color:e,roughness:.9,metalness:0,...n})),this.mats[t]}resize(t,e,n){this.renderer.setPixelRatio(Math.min(2,n)),this.renderer.setSize(t,e,!1)}syncCamera(t){const e=this.camera,n=t.k;e.left=-t.vw/2/n,e.right=t.vw/2/n,e.top=t.vh/2/n,e.bottom=-t.vh/2/n;const i=new L(t.sinT*t.cosE,t.sinE,t.cosT*t.cosE),s=new L(t.cosT,0,-t.sinT),o=new L().crossVectors(i,s),a=new L(t.fx,0,t.fy);e.position.copy(a).addScaledVector(i,120),e.quaternion.setFromRotationMatrix(new re().makeBasis(s,o,i)),e.updateProjectionMatrix()}render(t,e){const{world:n}=t;this.syncCamera(e);const i=n.w/2,s=n.h/2;this.sun.position.set(i-14,26,s+18),this.sun.target.position.set(i,0,s);const o=n.tiles.map(l=>l.terrain[0]+(l.type==="moat"?"m":"")).join("");o!==this.mapSig&&(this.mapSig=o,this.buildTerrain(n));const a=o+(n.keep.doorHp>0?"D":"d")+n.tiles.map(l=>`${l.type}${l.hoard?"h":""}${l.rock?"r":""}${l.plot||""}`).join(",");a!==this.structSig&&(this.structSig=a,this.buildStructures(n)),this.drawUnits(t),this.renderer.render(this.scene,this.camera)}begin(){this.parts={}}add(t,e){var n;((n=this.parts)[t]||(n[t]=[])).push(e.index?e.toNonIndexed():e)}box(t,e,n,i,s,o,a){const l=new Bn(s-e,a-i,o-n);l.translate((e+s)/2,(i+a)/2,(n+o)/2),this.add(t,l)}slab(t,e,n,i,s,o,a){const l=[e,i,i,e],c=[n,n,s,s],h=l.map((p,m)=>typeof o=="function"?o(p,c[m]):o),u=l.map((p,m)=>typeof a=="function"?a(p,c[m]):a),d=[...l.map((p,m)=>[p,h[m],c[m]]),...l.map((p,m)=>[p,u[m],c[m]])],f=[[4,5,6,7],[0,3,2,1],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],g=[];for(const[p,m,_,v]of f)for(const x of[p,_,m,p,v,_])g.push(...d[x]);const M=new Le;M.setAttribute("position",new ce(g,3)),M.setAttribute("uv",new ce(new Float32Array(g.length/3*2),2)),M.computeVertexNormals(),this.add(t,M)}cyl(t,e,n,i,s,o,a=8,l=o){const c=new ii(l,o,s-i,a);c.translate(e,(i+s)/2,n),this.add(t,c)}cone(t,e,n,i,s,o,a=8){const l=new qa(o,s,a);l.translate(e,i+s/2,n),this.add(t,l)}rod(t,e,n,i,s=5){const o=new L(e[0],e[2],e[1]),a=new L(n[0],n[2],n[1]),l=a.clone().sub(o),c=new ii(i,i,l.length(),s);c.applyQuaternion(new Se().setFromUnitVectors(rs,l.clone().normalize())),c.translate((o.x+a.x)/2,(o.y+a.y)/2,(o.z+a.z)/2),this.add(t,c)}finish(t,e,{shadows:n=!0}={}){for(const i of[...t.children])t.remove(i),i.geometry.dispose();for(const[i,s]of Object.entries(this.parts)){const o=Xg(s,!1);for(const l of s)l.dispose();if(!o)continue;e[i].map&&$g(o);const a=new ke(o,e[i]);a.castShadow=n&&!e[i].transparent,a.receiveShadow=!0,t.add(a)}}buildTerrain(t){const{w:e,h:n}=t,i=[],s=[],o=new Yt,a=2*e+1,l=2*n+1,c=new Float32Array(e*n),h=[];for(let x=0;x<e*n;x++){const T=t.tiles[x];c[x]=qg(t,x);const A=Math.floor(T.v*4),E=T.type==="moat"||T.terrain==="water"?It.bedDeep:T.terrain==="shallows"?It.bedShallow:T.terrain==="marsh"?It.marsh[A&1]:T.terrain==="hill"?It.hill[A&1]:It.grass[A];h.push(new Yt(E))}const u=new Float32Array(a*l),d=[];for(let x=0;x<l;x++)for(let T=0;T<a;T++){const A=T%2?[(T-1)/2]:[T/2-1,T/2],E=x%2?[(x-1)/2]:[x/2-1,x/2];let P=0,N=0;const y=new Yt(0,0,0);for(const w of E)for(const k of A){if(k<0||w<0||k>=e||w>=n)continue;const F=w*e+k;P+=c[F],y.r+=h[F].r,y.g+=h[F].g,y.b+=h[F].b,N++}u[x*a+T]=N?P/N:0,d.push(N?y.multiplyScalar(1/N):y)}const f=[],g=(x,T)=>T*a+x;for(let x=0;x<n;x++)for(let T=0;T<e;T++){const A=2*T+1,E=2*x+1,P=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]].map(([y,w])=>g(A+y,E+w)),N=g(A,E);for(let y=0;y<8;y++)f.push(N,P[(y+1)%8],P[y])}for(let x=0;x<l;x++)for(let T=0;T<a;T++){i.push(T/2,u[g(T,x)],x/2);const A=d[g(T,x)];s.push(A.r,A.g,A.b)}const M=x=>{for(let T=0;T+1<x.length;T++){const[A,E]=x[T],[P,N]=x[T+1],y=i.length/3;o.setHex(It.dirt);for(const[w,k,F]of[[A,E,!0],[P,N,!0],[P,N,!1],[A,E,!1]])i.push(w/2,F?u[g(w,k)]:-.8,k/2),s.push(o.r,o.g,o.b);f.push(y,y+1,y+2,y,y+2,y+3)}},p=(x,T)=>Array.from({length:T},(A,E)=>x(E));M(p(x=>[x,0],a)),M(p(x=>[a-1,x],l)),M(p(x=>[a-1-x,l-1],a)),M(p(x=>[0,l-1-x],l));const m=new Le;m.setAttribute("position",new ce(i,3)),m.setAttribute("color",new ce(s,3)),m.setIndex(f),m.computeVertexNormals();for(const x of[...this.terrain.children])this.terrain.remove(x),x.geometry.dispose();const _=new ke(m,this.mat("land",16777215,{vertexColors:!0,roughness:1}));_.receiveShadow=!0,this.terrain.add(_);const v=new ke(new ri(e,n),this.mat("water",It.water,{transparent:!0,opacity:.78,roughness:.25,metalness:.05}));v.rotation.x=-Math.PI/2,v.position.set(e/2,-.07,n/2),v.receiveShadow=!0,this.terrain.add(v)}texMat(t,e,n){if(!this.mats[t]){const i=n==="wood"?Pc():Cc();if(this.texCache||(this.texCache={}),!this.texCache[n]){const c=new hc(i);c.wrapS=c.wrapT=ps,c.colorSpace=Ye,c.anisotropy=4;const h=new hc(i);h.wrapS=h.wrapT=ps,this.texCache[n]={map:c,bump:h}}const{map:s,bump:o}=this.texCache[n],a=new Yt(e),l=255/Lo[n];a.setRGB(Math.min(1,a.r*l),Math.min(1,a.g*l),Math.min(1,a.b*l)),this.mats[t]=new xo({color:a,map:s,bumpMap:o,bumpScale:1.5,roughness:.92,metalness:0})}return this.mats[t]}materials(){return{stone:this.texMat("stone",It.stone,"stone"),stoneDark:this.texMat("stoneDark",It.stoneDark,"stone"),keep:this.texMat("keep",It.keep,"stone"),wood:this.texMat("wood",It.wood,"wood"),woodLight:this.mat("woodLight",It.woodLight),door:this.mat("door",It.door),roof:this.mat("roof",It.roof),plaster:this.mat("plaster",It.plaster),rock:this.mat("rock",It.rock,{flatShading:!0}),moss:this.mat("moss",It.moss,{flatShading:!0}),trunk:this.mat("trunk",It.trunk),pine:this.mat("pine",It.pine,{flatShading:!0}),leaf:this.mat("leaf",It.leaf,{flatShading:!0}),soil:this.mat("soil",It.soil),crop:this.mat("crop",It.crop),sprout:this.mat("sprout",It.sprout),awning:this.mat("awning",It.awning),awningAlt:this.mat("awningAlt",It.awningAlt),iron:this.mat("iron",It.iron,{metalness:.4,roughness:.6}),banner:this.mat("banner",It.banner,{side:rn}),player:this.mat("player",It.player,{side:rn}),ghost:this.mat("ghost",15917744,{transparent:!0,opacity:.32,depthWrite:!1}),stake:this.mat("stake",15325616),hole:this.mat("hole",It.hole,{roughness:1})}}connects(t,e,n,i,s){const o=e+i,a=n+s;return t.inBounds(o,a)&&Yg.has(t.tiles[t.idx(o,a)].type)}merlonRun(t,e,n,i,s,o,a,l=.14,c=.18){for(let h=0;h<a;h++){const u=a===1?.5:h/(a-1),d=e+(i-e)*u,f=n+(s-n)*u,g=typeof o=="function"?o(d,f):o;this.box(t,d-l/2,f-l/2,g,d+l/2,f+l/2,g+c)}}buildStructures(t){this.begin();const e=t.keep;for(let n=0;n<t.tiles.length;n++){const i=t.tiles[n],s=n%t.w,o=n/t.w|0,a=t.elev(n),l=i.rock?t.baseElev(n):t.minGround(n)-.35;switch(i.rock&&this.rockBase(s,o,a,l,i.v),i.type){case"palisade":this.palisade(t,s,o);break;case"wall":this.thinWall(t,s,o,a,l,i.hoard);break;case"thick":this.thickWall(t,s,o,a,l,i.hoard);break;case"gate":this.gate(t,s,o,a,l,i.hoard);break;case"tower":this.tower(t,s,o,a,l,i.hoard);break;case"pikes":this.pikes(t,s,o,l);break;case"stair":this.stair(t,n,s,o);break;case"trap":this.box("soil",s+.08,o+.08,a,s+.92,o+.92,a+.04);for(let c=0;c<3;c++)for(let h=0;h<3;h++)this.cone("iron",s+.25+c*.25,o+.25+h*.25,a+.04,.16,.04,4);break;case"tree":this.tree(s,o,a,i.v);break;case"rock":this.rock(s,o,a,i.v);break;case"cottage":this.cottage(s,o,a,"plaster","roof");break;case"farm":this.farm(s,o,a,i.v);break;case"market":this.market(s,o,a,!1);break;case"plot":this.plot(s,o,a,i.plot);break;case"keep":s===e.x&&o===e.y&&this.keep(t);break}}for(const n of t.spawns)this.spawnFlag(n.x+.5,n.y+.5);this.finish(this.structures,this.materials())}rockBase(t,e,n,i,s){const o=new hs(.62,0);o.scale(1,(i-n+.15)/1,.9),o.rotateY(s*6),o.translate(t+.5,n+(i-n)*.45,e+.5),this.add("rock",o)}rock(t,e,n,i){const s=new hs(.42,0);s.scale(1,.75+i*.4,.85),s.rotateY(i*9),s.translate(t+.5,n+.22+i*.1,e+.5),this.add("rock",s);const o=new hs(.2,0);o.translate(t+.5+(i-.5)*.3,n+.45+i*.2,e+.45),this.add("moss",o)}tree(t,e,n,i){const s=t+.5+(i-.5)*.25,o=e+.5+(i*7%1-.5)*.25;if(this.cyl("trunk",s,o,n,n+.45,.07,6),i<.55)this.cone("pine",s,o,n+.3,.7,.42,7),this.cone("pine",s,o,n+.65,.6,.32,7),this.cone("pine",s,o,n+.95,.5,.22,7);else{const a=new gr(.42,0);a.translate(s,n+.9,o),this.add("leaf",a);const l=new gr(.28,0);l.translate(s+.15,n+1.2,o-.1),this.add("leaf",l)}}palisade(t,e,n){const i=e+.5,s=n+.5,o=[[0,-1],[1,0],[0,1],[-1,0]].filter(([l,c])=>this.connects(t,e,n,l,c)),a=(l,c)=>{const h=t.heightAt(l,c);this.cyl("wood",l,c,h-.2,h+.75,.06,6),this.cone("woodLight",l,c,h+.75,.16,.06,6)};a(i,s);for(const[l,c]of o)for(const h of[.15,.3,.45])a(i+l*h,s+c*h)}thinWall(t,e,n,i,s,o){const a=St.wall,l=a.thin/2,c=e+.5,h=n+.5,u=(f,g)=>(Math.abs(f-c)>=Math.abs(g-h)?t.heightAt(f,h):t.heightAt(c,g))+a.height;this.slab("stone",c-l,h-l,c+l,h+l,s,u);const d=[[0,-1],[1,0],[0,1],[-1,0]].filter(([f,g])=>this.connects(t,e,n,f,g));for(const[f,g]of d){const M=f?f>0?c+l:e:c-l,p=f?f>0?e+1:c-l:c+l,m=g?g>0?h+l:n:h-l,_=g?g>0?n+1:h-l:h+l;this.slab("stone",M,m,p,_,s,u);const v=o?"wood":"stoneDark",x=(T,A)=>u(T,A)+.3;if(f)for(const T of[h-l+.07,h+l-.07])o?this.slab(v,M,T-.04,p,T+.04,u,x):this.merlonRun(v,M+.08,T,p-.08,T,u,2);else for(const T of[c-l+.07,c+l-.07])o?this.slab(v,T-.04,m,T+.04,_,u,x):this.merlonRun(v,T,m+.08,T,_-.08,u,2)}d.length||this.merlonRun(o?"wood":"stoneDark",c-l+.07,h-l+.07,c+l-.07,h+l-.07,u,2)}thickWall(t,e,n,i,s,o){const a=(h,u)=>t.heightAt(h,u)+St.thick.height;this.slab("stone",e,n,e+1,n+1,s,a),this.slab("stoneDark",e+.25,n+.25,e+.75,n+.75,a,(h,u)=>a(h,u)+.01);const l=o?"wood":"stoneDark",c=[[[0,-1],e+.08,n+.08,e+.92,n+.08],[[1,0],e+.92,n+.08,e+.92,n+.92],[[0,1],e+.08,n+.92,e+.92,n+.92],[[-1,0],e+.08,n+.08,e+.08,n+.92]];for(const[[h,u],d,f,g,M]of c)this.connects(t,e,n,h,u)||(o?this.slab(l,Math.min(d,g)-.05,Math.min(f,M)-.05,Math.max(d,g)+.05,Math.max(f,M)+.05,a,(p,m)=>a(p,m)+.32):this.merlonRun(l,d,f,g,M,a,3,.16,.22))}gate(t,e,n,i,s,o){const a=i+St.gate.height;if(this.connects(t,e,n,1,0)||this.connects(t,e,n,-1,0)||!(this.connects(t,e,n,0,1)||this.connects(t,e,n,0,-1)))if(this.box("stone",e,n+.1,s,e+.3,n+.9,a),this.box("stone",e+.7,n+.1,s,e+1,n+.9,a),this.box("stone",e+.3,n+.1,i+.85,e+.7,n+.9,a),this.box("door",e+.3,n+.45,s,e+.7,n+.55,i+.85),o)for(const c of[n+.12,n+.84])this.box("wood",e,c,a,e+1,c+.05,a+.3);else for(const c of[n+.18,n+.82])this.merlonRun("stoneDark",e+.1,c,e+.9,c,a,3);else if(this.box("stone",e+.1,n,s,e+.9,n+.3,a),this.box("stone",e+.1,n+.7,s,e+.9,n+1,a),this.box("stone",e+.1,n+.3,i+.85,e+.9,n+.7,a),this.box("door",e+.45,n+.3,s,e+.55,n+.7,i+.85),o)for(const c of[e+.12,e+.84])this.box("wood",c,n,a,c+.05,n+1,a+.3);else for(const c of[e+.18,e+.82])this.merlonRun("stoneDark",c,n+.1,c,n+.9,a,3)}tower(t,e,n,i,s,o){const a=e+.5,l=n+.5,c=i+St.tower.height;for(const[h,u]of[[0,-1],[1,0],[0,1],[-1,0]]){if(!this.connects(t,e,n,h,u))continue;const d=t.idx(e+h,n+u),f=t.tiles[d].type;if(f==="tower"||f==="keep")continue;const g=St[f].height,M=f==="gate"?Math.min(t.elev(d)+g,c):(T,A)=>Math.min(c,(h?t.heightAt(T,l):t.heightAt(a,A))+g);if(f==="palisade"){for(const T of[.3,.45])this.cyl("wood",a+h*T,l+u*T,i,i+.75,.06,6),this.cone("woodLight",a+h*T,l+u*T,i+.75,.16,.06,6);continue}const p=f==="thick"?.5:f==="gate"?.4:St.wall.thin/2,m=h?h>0?a:e:a-p,_=h?h>0?e+1:a:a+p,v=u?u>0?l:n:l-p,x=u?u>0?n+1:l:l+p;this.slab("stone",m,v,_,x,s,M)}if(this.cyl("stone",a,l,s,c,.47,14,.44),this.cyl("stoneDark",a,l,c-.12,c,.48,14),o)this.cyl("wood",a,l,c,c+.34,.5,14),this.cone("roof",a,l,c+.34,.5,.56,14);else for(let h=0;h<8;h++){const u=h/8*Math.PI*2,d=a+Math.cos(u)*.4,f=l+Math.sin(u)*.4;this.box("stoneDark",d-.08,f-.08,c,d+.08,f+.08,c+.2)}}stair(t,e,n,i){const s=t.stairFace(e),o=n+.5,a=i+.5;let l=0,c=1,h=t.elev(e)+.4;s>=0&&(l=s%t.w-n,c=(s/t.w|0)-i,h=t.surfaceAt(s,o+l*.5,a+c*.5));const u=4,d=.3;for(let f=0;f<u;f++){const g=-.5+f/u,M=-.5+(f+1)/u,p=l?o+Math.min(g*l,M*l):o-d,m=l?o+Math.max(g*l,M*l):o+d,_=c?a+Math.min(g*c,M*c):a-d,v=c?a+Math.max(g*c,M*c):a+d,x=t.heightAt((p+m)/2,(_+v)/2);this.box("stone",p,_,x-.3,m,v,x+(h-x)*((f+1)/u))}}pikes(t,e,n,i){const s=this.connects(t,e,n,1,0)||this.connects(t,e,n,-1,0)||t.tiles[t.idx(Math.min(t.w-1,e+1),n)].type==="pikes"||t.tiles[t.idx(Math.max(0,e-1),n)].type==="pikes",o=e+.5,a=n+.5,[l,c]=s?[1,0]:[0,1],[h,u]=[-c,l];this.rod("trunk",[o-l*.5,a-c*.5,i+.26],[o+l*.5,a+c*.5,i+.26],.06,6);for(const d of[-.33,0,.33]){const f=o+l*d,g=a+c*d;for(const M of[1,-1]){const p=[f-h*.36*M,g-u*.36*M,i],m=[f+h*.2*M,g+u*.2*M,i+.42],_=[f+h*.42*M,g+u*.42*M,i+.62];this.rod("wood",p,m,.035),this.rod("stake",m,_,.03)}}}cottage(t,e,n,i,s){this.box(i,t+.18,e+.24,n,t+.82,e+.76,n+.44);const o=new ph;o.moveTo(-.33,0),o.lineTo(.33,0),o.lineTo(0,.36),o.closePath();const a=new $a(o,{depth:.76,bevelEnabled:!1});a.rotateY(Math.PI/2),a.translate(t+.12,n+.44,e+.5),this.add(s,a),i!=="ghost"&&this.box("stoneDark",t+.66,e+.32,n+.5,t+.76,e+.42,n+.95)}farm(t,e,n,i){this.box("soil",t+.04,e+.04,n,t+.96,e+.96,n+.05);const s=i>.5?"crop":"sprout";for(let o=0;o<4;o++){const a=e+.17+o*.22;this.box(s,t+.1,a-.05,n+.05,t+.9,a+.05,n+.18)}}market(t,e,n,i){const s=i?"ghost":"wood";this.box(s,t+.15,e+.3,n,t+.85,e+.7,n+.35);for(const[o,a]of[[.12,.2],[.88,.2],[.12,.8],[.88,.8]])this.cyl(s,t+o,e+a,n,n+.85,.03,5);for(let o=0;o<5;o++){const a=t+.08+o*.168,l=new Bn(.168,.03,.78);l.rotateX(-.28),l.translate(a+.084,n+.86,e+.5),this.add(i?"ghost":o%2?"awningAlt":"awning",l)}}plot(t,e,n,i){for(const[s,o]of[[.08,.08],[.92,.08],[.92,.92],[.08,.92]])this.cyl("stake",t+s,e+o,n,n+.25,.025,4);i==="cottage"?this.cottage(t,e,n,"ghost","ghost"):i==="market"?this.market(t,e,n,!0):this.box("ghost",t+.06,e+.06,n,t+.94,e+.94,n+.12)}keep(t){const e=t.keep,n=se.height;this.box("keep",e.x,e.y,0,e.x+3,e.y+3,n),this.box("stoneDark",e.x+.35,e.y+.35,n,e.x+2.65,e.y+2.65,n+.02);const i=.1;this.merlonRun("stoneDark",e.x+i,e.y+i,e.x+3-i,e.y+i,n,8,.18,.24),this.merlonRun("stoneDark",e.x+i,e.y+3-i,e.x+3-i,e.y+3-i,n,8,.18,.24),this.merlonRun("stoneDark",e.x+i,e.y+i,e.x+i,e.y+3-i,n,8,.18,.24),this.merlonRun("stoneDark",e.x+3-i,e.y+i,e.x+3-i,e.y+3-i,n,8,.18,.24);for(const[h,u]of[[e.x,e.y],[e.x+3,e.y],[e.x,e.y+3],[e.x+3,e.y+3]])this.cyl("keep",h,u,0,n+.5,.32,10),this.cone("roof",h,u,n+.5,.55,.38,10);const s=e.x+1.5,o=e.y+3;if(e.doorHp>0){this.box("door",s-.22,o-.02,0,s+.22,o+.04,.8),this.cyl("door",s,o+.01,.62,.68,.22,10);for(const h of[.22,.55])this.box("iron",s-.23,o+.03,h,s+.23,o+.05,h+.04)}else this.box("hole",s-.22,o-.02,0,s+.22,o+.02,.85),this.rod("door",[s-.3,o+.25,.02],[s-.05,o+.4,.05],.03),this.rod("door",[s+.1,o+.3,.02],[s+.35,o+.15,.04],.03);const a=e.x+1.5,l=e.y+1.5;this.cyl("trunk",a,l,n,n+1.4,.03,5);const c=new ri(.7,.4);c.translate(a+.35,n+1.2,l),this.add("player",c)}spawnFlag(t,e){this.cyl("trunk",t,e,0,1.6,.03,5);const n=new ri(.55,.32);n.translate(t+.28,1.42,e),this.add("banner",n)}buildPools(){const t=(e,n,i,s={})=>{const o=new xo({color:16777215,roughness:.8,...s}),a=new lg(n,o,i);a.castShadow=!0,a.receiveShadow=!0,a.count=0,a.frustumCulled=!1,a.instanceMatrix.setUsage(Hu),this.scene.add(a),this.pools[e]={mesh:a,n:0,max:i}};t("body",new Xa(1,1,3,8),600),t("head",new xr(1,10,8),600),t("rod",new ii(1,1,1,5),900),t("box",new Bn(1,1,1),200),t("ball",new xr(1,8,6),200),t("disc",new ii(1,1,1,10),200)}put(t,e,n,i,s){const o=this.pools[t];if(o.n>=o.max)return;const{m:a,c:l}=this.tmp;a.compose(e,n,i),o.mesh.setMatrixAt(o.n,a),o.mesh.setColorAt(o.n,l.setHex(s)),o.n++}putRod(t,e,n,i){const s=new L(t[0],t[2],t[1]),o=new L(e[0],e[2],e[1]),a=o.clone().sub(s),l=a.length()||.001;this.put("rod",s.add(o).multiplyScalar(.5),new Se().setFromUnitVectors(rs,a.divideScalar(l)),new L(n,l,n),i)}figure(t,e,n,i,s,o,a){const l=new Se;this.put("body",new L(t,n+s/2,e),l,new L(i,s/3,i),o),this.put("head",new L(t,n+s+i*.45,e),l,new L(i*.6,i*.6,i*.6),a)}drawUnits(t){for(const c of Object.values(this.pools))c.n=0;const e=t.time,n=c=>new Se().setFromAxisAngle(rs,-c);for(const c of t.enemies){const h=c.flash>0,u=Math.abs(Math.sin(c.walk))*.05;if(c.type==="ram"){const _=h?16777215:It.ram;this.put("box",new L(c.x,c.z+.26,c.y),n(c.heading),new L(.9,.34,.5),_),this.put("box",new L(c.x,c.z+.5,c.y),n(c.heading),new L(.8,.12,.56),5914148);const v=c.attacking?Math.abs(Math.sin(c.walk))*.12:0;this.put("ball",new L(c.x+Math.cos(c.heading)*(.48+v),c.z+.26,c.y+Math.sin(c.heading)*(.48+v)),new Se,new L(.12,.12,.12),It.iron);continue}if(c.type==="catapult"){this.catapult(c,e,h);continue}if(c.type==="ladder"){const _=Math.cos(c.heading),v=Math.sin(c.heading);for(const[T,A]of[[.24,0],[-.24,Math.PI]]){const E=Math.abs(Math.sin(c.walk+A))*.05;this.figure(c.x+_*T,c.y+v*T,c.z+E,.15,.46,h?16777215:It.raider,It.skin)}const x=Math.min(1,c.raising/1.2)*.9;this.ladder([c.x-_*.5,c.y-v*.5,c.z+.52],[c.x+_*.5,c.y+v*.5,c.z+.52+x]);continue}const d=c.type==="brute",f=d?.6:.48,g=h?16777215:It[c.type];this.figure(c.x,c.y,c.z+u,c.r*.8,f,g,d?It.helmet:c.type==="bowman"?3359786:It.skin);const M=c.attacking?Math.sin(c.walk*2)*.5:0,p=d?.42:.34,m=c.z+f*.6+u;c.type==="bowman"?this.bow(c.x,c.y,c.z,c.heading,3877400):this.putRod([c.x,c.y,m],[c.x+Math.cos(c.heading+M)*p,c.y+Math.sin(c.heading+M)*p,m+.1+M*.15],.025,d?3881787:13684944)}for(const c of t.gateLocks.keys()){const h=t.world,u=c%h.w+.5,d=(c/h.w|0)+.5,f=this.connects(h,u-.5,d-.5,1,0)||this.connects(h,u-.5,d-.5,-1,0)||!(this.connects(h,u-.5,d-.5,0,1)||this.connects(h,u-.5,d-.5,0,-1)),g=h.minGround(c)+.45;this.put("box",new L(u,g,d),new Se,f?new L(.5,.09,.2):new L(.2,.09,.5),4866104)}for(const c of t.ladders){const h=t.ladderGeom(c);this.ladder([h.fx,h.fy,h.fz],[h.tx,h.ty,h.tz])}for(const c of t.fallen){const h=t.world.heightAt(c.x,c.y)+.04,[u,d]=c.dir;this.ladder([c.x+u*.55,c.y+d*.55,h],[c.x-u*.55,c.y-d*.55,h])}const i=t.world.keep,s=i.x+2.35,o=i.y+2.3,a=se.height,l=i.inside>0&&Math.sin(e*20)>.6;this.figure(s,o,a,.13,.36,l?16777215:It.lord,It.skin),this.put("disc",new L(s,a+.5,o),new Se,new L(.07,.05,.07),It.crown);for(const c of t.archers){const u=c.path.length>0?Math.abs(Math.sin(e*12+c.id))*.04:0;this.figure(c.x,c.y,c.z+u,.11,.3,c.flash>0?16777215:It.player,It.skin),this.bow(c.x,c.y,c.z+u,c.heading,7029795)}for(const c of t.swordsmen){const h=Math.abs(Math.sin(c.walk))*.04;this.figure(c.x,c.y,c.z+h,c.r*.8,.48,c.flash>0?16777215:It.player,It.helmet);const u=c.heading,d=c.fighting?Math.sin(c.walk*2)*.6:.3,f=c.z+.32+h;this.putRod([c.x+Math.cos(u+1.2)*.12,c.y+Math.sin(u+1.2)*.12,f],[c.x+Math.cos(u+d)*.42,c.y+Math.sin(u+d)*.42,f+.12],.022,14673130);const g=c.x+Math.cos(u-1.1)*.17,M=c.y+Math.sin(u-1.1)*.17,p=new Se().setFromUnitVectors(rs,new L(Math.cos(u-1.1),0,Math.sin(u-1.1)));this.put("disc",new L(g,c.z+.3+h,M),p,new L(.12,.03,.12),It.shield)}for(const c of t.projectiles){if(c.kind==="boulder"){this.put("ball",new L(c.x,c.z,c.y),new Se,new L(.14,.14,.14),It.boulder);continue}const h=c.x-c.px,u=c.y-c.py,d=c.z-c.pz,f=Math.hypot(h,u,d)||1;this.putRod([c.x-h/f*.35,c.y-u/f*.35,c.z-d/f*.35],[c.x,c.y,c.z],.015,c.hostile?It.arrowHostile:It.arrow)}for(const c of Object.values(this.pools))c.mesh.count=c.n,c.mesh.instanceMatrix.needsUpdate=!0,c.mesh.instanceColor&&(c.mesh.instanceColor.needsUpdate=!0)}ladder(t,e){const n=e[0]-t[0],i=e[1]-t[1],s=Math.hypot(n,i)||1,o=-i/s*.13,a=n/s*.13;this.putRod([t[0]-o,t[1]-a,t[2]],[e[0]-o,e[1]-a,e[2]],.025,It.ladder),this.putRod([t[0]+o,t[1]+a,t[2]],[e[0]+o,e[1]+a,e[2]],.025,It.ladder);for(let l=1;l<6;l++){const c=l/6,h=t[0]+n*c,u=t[1]+i*c,d=t[2]+(e[2]-t[2])*c;this.putRod([h-o,u-a,d],[h+o,u+a,d],.018,8018484)}}bow(t,e,n,i,s){const o=t+Math.cos(i)*.18,a=e+Math.sin(i)*.18,l=-Math.sin(i)*.13,c=Math.cos(i)*.13;this.putRod([o-l,a-c,n+.18],[o+l,a+c,n+.48],.015,s)}catapult(t,e,n){const i=n?16777215:It.catapult,s=Math.cos(t.heading),o=Math.sin(t.heading),a=t.z;this.put("box",new L(t.x,a+.17,t.y),new Se().setFromAxisAngle(rs,-t.heading),new L(.84,.16,.5),i);for(const[m,_]of[[.3,.27],[.3,-.27],[-.3,.27],[-.3,-.27]])this.put("ball",new L(t.x+s*m-o*_,a+.1,t.y+o*m+s*_),new Se,new L(.1,.1,.1),3811866);const l=a+.7,c=-o*.2,h=s*.2;this.putRod([t.x+c,t.y+h,a+.25],[t.x,t.y,l],.03,5914152),this.putRod([t.x-c,t.y-h,a+.25],[t.x,t.y,l],.03,5914152);const u=e-t.fired,f=-.45+(u<.18?u/.18:Math.max(0,1-(u-.18)/1.8))*1.9,g=t.x-s*Math.cos(f)*.7,M=t.y-o*Math.cos(f)*.7,p=l+Math.sin(f)*.7;this.putRod([t.x+s*.18,t.y+o*.18,l-Math.sin(f)*.18],[g,M,p],.035,i),this.put("ball",new L(g,p+.05,M),new Se,new L(.1,.1,.1),u>1.2?It.boulder:4863526)}dispose(){this.renderer.dispose()}}const _o=8;class Zg{constructor(t,e,n){this.canvas=t,this.cam=e,this.h=n,this.pointers=new Map,this.mode=null,this.lastTile=-1,t.addEventListener("pointerdown",i=>this.down(i)),t.addEventListener("pointermove",i=>this.move(i)),t.addEventListener("pointerup",i=>this.up(i)),t.addEventListener("pointercancel",i=>this.up(i,!0)),t.addEventListener("contextmenu",i=>i.preventDefault()),t.addEventListener("wheel",i=>{i.preventDefault(),this.cam.zoomAt(Math.exp(-i.deltaY*.0015),i.clientX,i.clientY)},{passive:!1})}tileAt(t,e){const n=this.cam.unproject(t,e);return this.h.worldToTile(n.x,n.y)}down(t){if(this.canvas.setPointerCapture(t.pointerId),this.pointers.set(t.pointerId,{x:t.clientX,y:t.clientY,sx:t.clientX,sy:t.clientY}),this.pointers.size===2){this.mode==="tower"&&this.h.preview(null),this.mode==="box"&&this.h.boxCancel(),this.mode="pinch",this.pinch=this.pinchState();return}if(this.pointers.size>2)return;const e=this.h.tool(),n=t.pointerType==="mouse"&&t.button!==0;e==="look"||n?this.mode="pan":this.h.boxTool(e)?(this.mode="box",this.h.boxStart(this.cam.unproject(t.clientX,t.clientY))):this.h.placeOnRelease(e)?(this.mode="tower",this.lastTile=this.tileAt(t.clientX,t.clientY),this.h.preview(this.lastTile)):(this.mode="pending",this.lastTile=-1)}move(t){const e=this.pointers.get(t.pointerId);if(!e){t.pointerType==="mouse"&&this.h.tool()!=="look"&&this.h.preview(this.tileAt(t.clientX,t.clientY));return}const n=t.clientX-e.x,i=t.clientY-e.y;switch(e.x=t.clientX,e.y=t.clientY,this.mode){case"pan":this.cam.panBy(n,i);break;case"box":this.h.boxMove(this.cam.unproject(e.x,e.y));break;case"pending":Math.hypot(e.x-e.sx,e.y-e.sy)>_o&&(this.mode="paint",this.paintTo(this.tileAt(e.sx,e.sy)),this.paintTo(this.tileAt(e.x,e.y)));break;case"paint":this.paintTo(this.tileAt(e.x,e.y));break;case"tower":{const s=this.tileAt(e.x,e.y);s!==this.lastTile&&(this.lastTile=s,this.h.preview(s));break}case"pinch":{const s=this.pinchState();if(!s||!this.pinch)break;this.cam.panBy(s.cx-this.pinch.cx,s.cy-this.pinch.cy),this.cam.zoomAt(s.dist/this.pinch.dist,s.cx,s.cy);let o=s.angle-this.pinch.angle;o>Math.PI&&(o-=Math.PI*2),o<-Math.PI&&(o+=Math.PI*2),this.cam.twist(o),this.pinch=s;break}}}up(t,e=!1){var i,s,o,a;const n=this.pointers.get(t.pointerId);if(n){if(this.pointers.delete(t.pointerId),this.mode==="pinch"){this.pointers.size===0?this.mode=null:this.pinch=null;return}if(this.mode==="box"){e?this.h.boxCancel():this.h.boxEnd(this.cam.unproject(n.x,n.y),Math.hypot(n.x-n.sx,n.y-n.sy)<=_o),this.mode=null;return}!e&&this.mode==="pan"&&Math.hypot(n.x-n.sx,n.y-n.sy)<=_o&&((s=(i=this.h).tapTile)==null||s.call(i,this.tileAt(n.x,n.y))),e||(this.mode==="pending"&&this.paintTo(this.tileAt(n.x,n.y)),this.mode==="tower"&&this.lastTile>=0&&this.h.placeAt(this.lastTile)),this.mode==="tower"&&this.h.preview(null),(a=(o=this.h).strokeEnd)==null||a.call(o),this.mode=null,this.lastTile=-1}}pinchState(){const t=[...this.pointers.values()];if(t.length<2)return null;const[e,n]=t;return{cx:(e.x+n.x)/2,cy:(e.y+n.y)/2,dist:Math.max(10,Math.hypot(n.x-e.x,n.y-e.y)),angle:Math.atan2(n.y-e.y,n.x-e.x)}}paintTo(t){if(!(t<0)){if(this.lastTile<0){this.lastTile=t,this.h.paint(t);return}if(t!==this.lastTile){for(const e of this.h.lineTiles(this.lastTile,t))this.h.paint(e);this.lastTile=t}}}}const Ui={chamber:{label:"Castle Chamber",src:"./music/castle-chamber.mp3"},minstrel:{label:"Minstrel Guild",src:"./music/minstrel.mp3"}},jg="./music/heroic.mp3",Jg={bow:.07,hit:.06,clash:.12,build:.05,recruit:.1,crumble:.15,launch:.3,impact:.2,fall:.2};class Qg{constructor(){this.ctx=null,this.musicOn=!0,this.sfxOn=!0,this.tracks={},this.want="build",this.buildTrack="chamber",this.last={};try{const t=JSON.parse(localStorage.getItem("htk-audio")||"{}");t.music===!1&&(this.musicOn=!1),t.sfx===!1&&(this.sfxOn=!1),Ui[t.buildTrack]&&(this.buildTrack=t.buildTrack)}catch{}}save(){try{localStorage.setItem("htk-audio",JSON.stringify({music:this.musicOn,sfx:this.sfxOn,buildTrack:this.buildTrack}))}catch{}}unlock(){try{navigator.audioSession&&(navigator.audioSession.type="playback")}catch{}if(this.ctx){this.ctx.state!=="running"&&this.ctx.resume().catch(()=>{}),this.musicOn&&this.setMusic(this.want);return}const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.ctx.resume().catch(()=>{});const e=this.ctx.createBufferSource();e.buffer=this.ctx.createBuffer(1,1,this.ctx.sampleRate),e.connect(this.ctx.destination),e.start(0),this.master=this.ctx.createGain(),this.master.gain.value=.5,this.master.connect(this.ctx.destination);const n=this.ctx.sampleRate;this.noise=this.ctx.createBuffer(1,n,this.ctx.sampleRate);const i=this.noise.getChannelData(0);for(let s=0;s<n;s++)i[s]=Math.random()*2-1;this.tracks.build=this.makeTrack(Ui[this.buildTrack].src),this.tracks.battle=this.makeTrack(jg),this.setMusic(this.want)}makeTrack(t){const e=new window.Audio;return e.loop=!0,e.preload="auto",e.volume=0,e.setAttribute("playsinline",""),e.addEventListener("error",()=>this.fallbackSource(e,t),{once:!0}),e.src=t,e}nextBuildTrack(){const t=Object.keys(Ui);this.buildTrack=t[(t.indexOf(this.buildTrack)+1)%t.length],this.save();const e=this.tracks.build;if(!e)return;e.pause();const n=this.makeTrack(Ui[this.buildTrack].src);n.volume=e.volume,this.tracks.build=n,this.musicOn&&this.want==="build"&&n.play().catch(()=>{})}async fallbackSource(t,e){try{const n=await fetch(e);if(!n.ok)return;t.src=URL.createObjectURL(await n.blob()),this.musicOn&&this.setMusic(this.want)}catch{}}get running(){return!!this.ctx&&this.ctx.state==="running"}setMusic(t){if(this.want=t,!this.ctx||!this.musicOn)return;const e=this.tracks[t];e&&e.paused&&e.play().catch(()=>{})}toggleMusic(){if(this.musicOn=!this.musicOn,this.musicOn)this.setMusic(this.want);else for(const t of Object.values(this.tracks))t.pause();this.save()}toggleSfx(){this.sfxOn=!this.sfxOn,this.save()}update(t){for(const[e,n]of Object.entries(this.tracks)){const i=this.musicOn&&e===this.want?.35:0;n.volume=Math.max(0,Math.min(1,n.volume+Math.sign(i-n.volume)*Math.min(Math.abs(i-n.volume),t*.4))),n.volume===0&&!n.paused&&e!==this.want&&n.pause()}}play(t,e=1){if(!this.ctx||!this.sfxOn)return;const n=this.ctx.currentTime;if(n-(this.last[t]||-1)<(Jg[t]||0))return;this.last[t]=n;const i=this[`fx_${t}`];i&&i.call(this,n,e)}env(t,e,n,i){const s=this.ctx.createGain();return s.gain.setValueAtTime(1e-4,t),s.gain.exponentialRampToValueAtTime(i,t+e),s.gain.exponentialRampToValueAtTime(1e-4,t+e+n),s.connect(this.master),s}tone(t,e,n,i,s,o){const a=this.ctx.createOscillator();a.type=e,a.frequency.setValueAtTime(n,t),o&&a.frequency.exponentialRampToValueAtTime(o,t+i),a.connect(this.env(t,.005,i,s)),a.start(t),a.stop(t+i+.05)}hiss(t,e,n,i,s,o=1,a){const l=this.ctx.createBufferSource();l.buffer=this.noise;const c=this.ctx.createBiquadFilter();c.type=i,c.frequency.setValueAtTime(s,t),a&&c.frequency.exponentialRampToValueAtTime(a,t+e),c.Q.value=o,l.connect(c),c.connect(this.env(t,.004,e,n)),l.start(t,Math.random()*.5),l.stop(t+e+.05)}fx_bow(t,e){this.tone(t,"triangle",420+Math.random()*80,.08,.12*e,180),this.hiss(t,.12,.08*e,"bandpass",2400,2,900)}fx_hit(t,e){this.tone(t,"sine",160,.08,.15*e,70)}fx_clash(t,e){const n=1800+Math.random()*900;this.tone(t,"square",n,.09,.05*e,n*.7),this.tone(t,"triangle",n*1.5,.15,.04*e)}fx_build(t,e){this.tone(t,"sine",230+Math.random()*40,.07,.2*e,120),this.hiss(t,.05,.08*e,"lowpass",1400)}fx_recruit(t,e){this.tone(t,"triangle",520,.08,.1*e),this.tone(t+.07,"triangle",780,.12,.1*e)}fx_crumble(t,e){this.hiss(t,.7,.35*e,"lowpass",900,.7,160),this.tone(t,"sine",90,.4,.25*e,40)}fx_launch(t,e){this.tone(t,"sine",120,.2,.25*e,60),this.hiss(t+.05,.5,.12*e,"bandpass",500,1.5,1600)}fx_impact(t,e){this.tone(t,"sine",70,.5,.45*e,30),this.hiss(t,.45,.3*e,"lowpass",700,.7,120)}fx_fall(t,e){this.tone(t,"sawtooth",300,.25,.05*e,120)}fx_horn(t,e){for(const[n,i,s]of[[0,146.8,.7],[.55,196,1.1]]){const o=this.ctx.createOscillator();o.type="sawtooth",o.frequency.setValueAtTime(i*.94,t+n),o.frequency.linearRampToValueAtTime(i,t+n+.12);const a=this.ctx.createBiquadFilter();a.type="lowpass",a.frequency.value=900;const l=this.ctx.createGain();l.gain.setValueAtTime(1e-4,t+n),l.gain.exponentialRampToValueAtTime(.22*e,t+n+.1),l.gain.setValueAtTime(.22*e,t+n+s-.2),l.gain.exponentialRampToValueAtTime(1e-4,t+n+s),o.connect(a),a.connect(l),l.connect(this.master),o.start(t+n),o.stop(t+n+s+.05)}}fx_victory(t,e){[392,494,587,784].forEach((n,i)=>this.tone(t+i*.16,"triangle",n,.5,.15*e))}fx_defeat(t,e){[392,330,262,196].forEach((n,i)=>this.tone(t+i*.28,"triangle",n,.6,.15*e))}fx_waveEnd(t,e){[523,659,784].forEach((n,i)=>this.tone(t+i*.12,"triangle",n,.35,.12*e))}}const vc="htk-progress",os="htk-maps";class tx{constructor(){this.db=null,this.uid=null,this.ready=this.init()}async init(){try{const t=window.claude;if(!(t!=null&&t.use))return;const[e,n]=await Promise.all([t.use("db"),t.use("user")]),i=n?await n.id():null;e&&i&&(this.db=e,this.uid=i)}catch{}}get where(){return this.db?"your account":"this browser"}col(){return this.db.collection(`data/users/${this.uid}`)}async saveProgress(t){return await this.ready,this.db?(await this.col().doc("progress").set({kind:"progress",json:JSON.stringify(t)}),!0):Mo(vc,t)}async loadProgress(){await this.ready;try{if(this.db){const t=await this.col().doc("progress").get();return t.exists?JSON.parse(t.data().json):null}return er(vc,null)}catch{return null}}async listMaps(){await this.ready;try{return this.db?(await this.col().where("kind","==","map").get()).docs.map(e=>({id:e.id,...e.data()})).sort((e,n)=>n.savedAt-e.savedAt):er(os,[])}catch{return[]}}async saveMap(t,e){await this.ready;const n={kind:"map",name:t,map:e,savedAt:Date.now()};if(this.db)return await this.col().doc(`map-${n.savedAt}`).set(n),!0;const i=er(os,[]);return i.unshift({id:`map-${n.savedAt}`,...n}),Mo(os,i)}async deleteMap(t){return await this.ready,this.db?(await this.col().doc(t).delete(),!0):Mo(os,er(os,[]).filter(e=>e.id!==t))}}function er(r,t){try{const e=localStorage.getItem(r);return e?JSON.parse(e):t}catch{return t}}function Mo(r,t){try{return localStorage.setItem(r,JSON.stringify(t)),!0}catch{return!1}}const cn={look:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/></svg>',wall:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 9.7h20M2 14.3h20M8 5v4.7M15 5v4.7M5 9.7v4.6M12 9.7v4.6M19 9.7v4.6M8 14.3V19M15 14.3V19"/></svg>',tower:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 22V9h14v13zM5 9V3h3v2.5h2.5V3h3v2.5H16V3h3v6"/><path d="M10 22v-5a2 2 0 0 1 4 0v5"/></svg>',trap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 20h20M4 20l2.5-9L9 20M9.5 20l2.5-12 2.5 12M15 20l2.5-9L20 20"/></svg>',demolish:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c3 0 6 2 7 5-3-1.5-6-1.5-9 0M12 9l-9 9 3 3 9-9"/></svg>',menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',rotate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>',cube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12L3 7M12 12v10"/></svg>',palisade:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 21V8l2-3 2 3v13M10 21V8l2-3 2 3v13M16 21V8l2-3 2 3v13M2 15h20"/></svg>',thick:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 21V7h3V4h3v3h3V4h2v3h3V4h3v3h3v14z"/><path d="M2 12h20M2 16.5h20M8 12v4.5M16 12v4.5M12 16.5V21"/></svg>',archer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3c6 3 6 15 0 18M7 3v18M3 12h17M17 9l3 3-3 3"/></svg>',moat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',pikes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 20L9 4M9 20L3 4M13 20l6-16M19 20L13 4M1 14h22"/></svg>',gate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 21V5h3V3h3v2h8V3h3v2h3v16h-7v-6a3 3 0 0 0-6 0v6z"/><path d="M12 12v9"/></svg>',swordsman:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7L9 22l-2-2L19 8M5 15l4 4M3 17l4 4"/></svg>',upgrade:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M7 21V11h10v10M12 3v10M8 7l4-4 4 4"/></svg>',soundOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',soundOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6"/></svg>',hoard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 21V13h18v8M3 13V7h3v6M9 13V7h3v6M15 13V7h3v6M21 13V7"/><path d="M2 7h20"/></svg>',orders:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V3M5 4h12l-3 4 3 4H5"/><path d="M14 16h7v5h-7z" stroke-dasharray="2 2"/></svg>',settle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 11l9-7 9 7M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',fsOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',fsOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>',stair:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 21h18V4h-4v4.25h-4.5v4.25H8v4.25H3z"/></svg>',feedback:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M12 8v3M12 13.5v.01"/></svg>',grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>'},_s={look:"Look",palisade:"Palisade",wall:"Stone wall",thick:"Thick wall",tower:"Tower",archer:"Archer",moat:"Moat",pikes:"Pikes",gate:"Gate",stair:"Stairs",swordsman:"Swordsman",upgrade:"Upgrade",hoard:"Hoarding",orders:"Orders",settle:"Village",trap:"Spikes",demolish:"Remove"},ex={palisade:"Cheap wood. Archers can't stand on it.",wall:"Archers walk along connected stone.",thick:"Very tough, holds 2 archers.",tower:"Comes with an archer. Height adds range.",archer:"Tap a wall, tower or the keep.",gate:"Your troops walk through; enemies must break it. Drop one into a wall for the difference.",stair:"Build against a wall, tower or keep so swordsmen can climb up.",swordsman:"Guards a spot. Tap a wall or the keep to post one up top.",hoard:"Wooden shields on a stone wall, gate or tower. Archers behind it are much safer.",orders:"Tell swordsmen which area to cover.",upgrade:"Palisade to stone, stone to thick; repairs damage.",settle:"Build the houses and farms the village asks for.",moat:"Enemies wade through slowly.",pikes:"Hurts anyone who attacks it.",trap:"Hurts anyone who walks over it."},Ya=[{id:"look",tools:["look"]},{id:"walls",tools:["palisade","wall","thick","gate","stair","hoard"]},{id:"defend",tools:["tower","archer","swordsman","orders"]},{id:"obstacles",tools:["moat","pikes","trap"]},{id:"improve",tools:["settle","upgrade"]},{id:"demolish",tools:["demolish"]}],nx=["look","palisade","wall","thick","gate","tower","archer","swordsman","orders","settle"],ix=new Set(["tower","archer","swordsman","gate"]),Ms=r=>{var t;return r==="archer"?tn.cost:r==="swordsman"?$e.cost:r==="hoard"?en.cost:(t=St[r])==null?void 0:t.cost},zt=r=>document.getElementById(r),Ka=()=>Math.floor(Math.random()*1e9);let at=new Mr(Ka());const fn=new tx,ve=new jh(at.world.w,at.world.h),si=zt("game"),Sa=new tu(si,ve),wa=zt("game3d");let En=null,Ve="classic";try{localStorage.getItem("htk-gfx")==="3d"&&(Ve="3d")}catch{}function Za(r){if(r==="3d"&&!En)try{En=new Kg(wa),En.resize(window.innerWidth,window.innerHeight,window.devicePixelRatio||1)}catch{We("3D isn't available on this device<small>Staying with the classic look</small>"),r="classic"}Ve=r,wa.classList.toggle("hidden",Ve!=="3d");try{localStorage.setItem("htk-gfx",Ve)}catch{}}const Xt=new Qg;"serviceWorker"in navigator&&location.protocol==="https:"&&window.top===window&&navigator.serviceWorker.register("./sw.js").catch(()=>{});window.htk={game:at,audio:Xt,camera:ve,setGfx:r=>Za(r)};for(const r of["pointerdown","pointerup","touchend","click","keydown"])window.addEventListener(r,()=>Xt.unlock(),{capture:!0,passive:!0});const Et={tool:"wall",buildTool:"wall",groupChoice:{walls:"wall",defend:"tower",obstacles:"moat",improve:"settle"},orders:{selected:new Set,box:null,start:null,active:!1},preview:null,showGrid:!0,speed:1,paused:!1};function _c(r,t){return r<0||t<0||r>=at.world.w||t>=at.world.h?-1:at.world.idx(Math.floor(r),Math.floor(t))}function sx(r,t){const e=at.world.w;let n=r%e,i=r/e|0;const s=Math.abs(t%e-n),o=Math.abs((t/e|0)-i),a=t%e>n?1:-1,l=(t/e|0)>i?1:-1,c=[r];for(let h=0,u=0;h<s||u<o;)(.5+h)/s<(.5+u)/o?(n+=a,h++):(i+=l,u++),c.push(i*e+n);return c}function yo(r,t){const e=i=>Math.max(0,Math.min(at.world.w-1,Math.floor(i))),n=i=>Math.max(0,Math.min(at.world.h-1,Math.floor(i)));return{x0:e(Math.min(r.x,t.x)),x1:e(Math.max(r.x,t.x)),y0:n(Math.min(r.y,t.y)),y1:n(Math.max(r.y,t.y))}}function Mc(r,t){const e=[...Et.orders.selected];at.orderSwordsmen(e,r,t)&&(Xt.play("recruit"),We(r?`${e.length} ${e.length===1?"swordsman":"swordsmen"} covering that area`:"Holding that spot",1400),Et.orders.selected=new Set)}function ba(r){const t=at.world.tiles[r];if(!t||t.type!=="plot"||Et.tool==="demolish")return!1;const e=St[t.plot];return at.place(r,"settle")?We(`${e.label} built<small>+${e.income} gold after every wave</small>`,1800):at.gold<e.cost&&ds(),Ke(),!0}let vr=!1;function rx(r){var e;const t=Et.tool;if(!ba(r)){if(t==="demolish")at.demolish(r);else if(t==="upgrade")!at.place(r,"upgrade")&&at.upgradeInfo(r)&&at.gold<at.upgradeInfo(r).cost&&ds();else if(t==="settle"||t==="hoard"){const n=at.world.tiles[r],i=t==="hoard"?en.cost:(e=St[n.plot])==null?void 0:e.cost;!at.place(r,t)&&i&&at.gold<i&&ds()}else if(St[t]){const i=at.layOverCost(r,t)??(at.world.canBuild(r,t)?at.costAt(r,t):null);!at.place(r,t)&&i!==null&&at.gold<i&&ds()}Ke()}}function ds(){if(vr)return;vr=!0;const r=document.querySelector(".pill.gold");r.classList.remove("flash"),r.offsetWidth,r.classList.add("flash")}new Zg(si,ve,{tool:()=>Et.tool,worldToTile:_c,lineTiles:sx,paint:rx,strokeEnd:()=>{vr=!1},placeOnRelease:r=>ix.has(r),boxTool:r=>r==="orders",boxStart:r=>{Et.orders.start=r,Et.orders.box=yo(r,r)},boxMove:r=>{Et.orders.start&&(Et.orders.box=yo(Et.orders.start,r))},boxCancel:()=>{Et.orders.box=Et.orders.start=null},boxEnd:(r,t)=>{const e=Et.orders,n=e.start?yo(e.start,r):null;if(e.box=e.start=null,t){const i=at.swordsmen.filter(s=>Math.hypot(s.x-r.x,s.y-r.y)<.8);i.length?e.selected=new Set(i.map(s=>s.id)):e.selected.size&&Mc(null,_c(r.x,r.y))}else if(n)if(e.selected.size)Mc(n,null);else{const i=at.swordsmen.filter(s=>s.x>=n.x0&&s.x<=n.x1+1&&s.y>=n.y0&&s.y<=n.y1+1);e.selected=new Set(i.map(s=>s.id))}Ke()},tapTile:r=>{r>=0&&ba(r)},placeAt:r=>{ba(r)||(!at.place(r,Et.tool)&&at.gold<Ms(Et.tool)&&ds(),vr=!1,Ke())},preview:r=>{if(r==null||r<0)Et.preview=null;else{const t=Et.tool,e=t==="demolish"?!!St[at.world.tiles[r].type]:t!=="look"&&at.canPlace(r,t);Et.preview={i:r,ok:e,type:t}}}});const _h=zt("toolbar"),Nn=zt("flyout"),ox=r=>{const t=Ms(r);return`${cn[r]}<span>${t?`<span class="cost">${t}</span>`:_s[r]}</span>`};for(const r of Ya){const t=document.createElement("button");t.className=r.tools.length>1?"tool group":"tool",t.dataset.group=r.id,t.addEventListener("click",()=>{const e=Et.groupChoice[r.id]||r.tools[0];r.tools.length>1&&Et.tool===e&&!Nn.classList.contains("hidden")?ys():(ja(e),r.tools.length>1?ax(r,t):ys())}),_h.appendChild(t)}function ax(r,t){Nn.innerHTML="";for(const i of r.tools){const s=document.createElement("button");s.className="tool wide"+(i===Et.tool?" active":""),Ms(i)>at.gold&&s.classList.add("poor"),s.innerHTML=`${cn[i]}<span class="tl"><b>${_s[i]}</b><span class="cost">${Ms(i)}</span><small>${ex[i]}</small></span>`,s.addEventListener("click",()=>{Et.groupChoice[r.id]=i,ja(i),ys()}),Nn.appendChild(s)}const e=t.getBoundingClientRect();Nn.style.left=`${e.right+8}px`,Nn.classList.remove("hidden");const n=Nn.offsetHeight;Nn.style.top=`${Math.max(8,Math.min(window.innerHeight-n-8,e.top+e.height/2-n/2))}px`}function ys(){Nn.classList.add("hidden")}si.addEventListener("pointerdown",ys);function ja(r){r!=="orders"&&(Et.orders.selected=new Set),Et.tool=r,r!=="look"&&r!=="demolish"&&(Et.buildTool=r);for(const t of Ya)t.tools.length>1&&t.tools.includes(r)&&(Et.groupChoice[t.id]=r);Et.preview=null,Ke()}zt("menu-btn").innerHTML=cn.menu;zt("feedback-btn").innerHTML=cn.feedback;zt("feedback-btn").addEventListener("click",()=>wh(r=>bh(r)));const Ea=zt("sound-btn");function Ja(){const r=Xt.musicOn||Xt.sfxOn;Ea.innerHTML=r?cn.soundOn:cn.soundOff,Ea.setAttribute("aria-label",r?"Mute":"Unmute")}Ea.addEventListener("click",()=>{const r=Xt.musicOn||Xt.sfxOn;r===Xt.musicOn&&Xt.toggleMusic(),r===Xt.sfxOn&&Xt.toggleSfx(),Ja()});Ja();const _r=zt("fs-btn"),lx=document.fullscreenEnabled||document.webkitFullscreenEnabled,Ta=()=>document.fullscreenElement||document.webkitFullscreenElement;function So(){_r.innerHTML=Ta()?cn.fsOff:cn.fsOn,_r.setAttribute("aria-label",Ta()?"Leave full screen":"Full screen")}lx&&(_r.classList.remove("hidden"),So(),_r.addEventListener("click",async()=>{var r,t;try{if(Ta())await(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const e=document.documentElement;await(e.requestFullscreen||e.webkitRequestFullscreen).call(e,{navigationUI:"hide"}),await((t=(r=screen.orientation)==null?void 0:r.lock)==null?void 0:t.call(r,"landscape").catch(()=>{}))}}catch{We("Full screen isn't available here<small>Open the game in its own browser tab instead</small>")}}),document.addEventListener("fullscreenchange",()=>{So(),setTimeout(ws,50)}),document.addEventListener("webkitfullscreenchange",So));zt("rotate-btn").innerHTML=cn.rotate;zt("wave-total").textContent=ci;zt("view-btn").addEventListener("click",()=>Xi(ve.mode==="top"?"iso":"top"));zt("rotate-btn").addEventListener("click",()=>ve.rotateBy(Math.PI/2));zt("speed-btn").addEventListener("click",()=>{Et.speed=Et.speed===1?2:Et.speed===2?3:1,Ke()});zt("start-btn").addEventListener("click",Mh);function Mh(){at.phase==="build"&&(yh(),at.startWave())}function yh(){at.phase==="build"&&fn.saveProgress(at.serialize()).catch(()=>{})}zt("menu-btn").addEventListener("click",()=>fx());function Xi(r){ve.setMode(r),Ke()}function Ke(){zt("gold").textContent=Math.floor(at.gold),zt("wave").textContent=Math.min(ci,at.wave+1);const r=at.world.keep.hp/at.world.keep.maxHp,t=zt("keep-fill");t.style.width=`${r*100}%`,t.style.background=r>.5?"linear-gradient(#7fdc63,#4c9c3a)":r>.25?"linear-gradient(#f0d060,#b8922a)":"linear-gradient(#ef6a4c,#a8301c)",zt("archers").textContent=at.archers.length;for(const l of _h.children){const c=Ya.find(d=>d.id===l.dataset.group),h=Et.groupChoice[c.id]||c.tools[0];l.dataset.face!==h&&(l.dataset.face=h,l.innerHTML=ox(h),l.title=_s[h],l.setAttribute("aria-label",_s[h])),l.classList.toggle("active",c.tools.includes(Et.tool));const u=Ms(h);l.classList.toggle("poor",!!u&&at.gold<u)}const e=ve.mode==="iso",n=zt("view-btn");n.dataset.mode!==ve.mode&&(n.dataset.mode=ve.mode,n.classList.toggle("iso",e),n.innerHTML=e?`${cn.grid}<span>2D</span>`:`${cn.cube}<span>3D</span>`),zt("rotate-btn").classList.toggle("hidden",!e);const i=at.phase==="build";zt("start-btn").classList.toggle("hidden",!i),zt("speed-btn").classList.toggle("hidden",at.phase!=="attack"),zt("speed-btn").textContent!==`${Et.speed}×`&&(zt("speed-btn").textContent=`${Et.speed}×`);const s=zt("next-info");if(s.classList.toggle("hidden",!i),i){const l=at.wave+1,c=Ao(l),h=[`${c.raider} raiders`];c.brute&&h.push(`${c.brute} brutes`),c.ram&&h.push(`${c.ram} rams`);const u=at.activeSpawns(l).map(f=>f.name).join(", ");c.bowman&&h.push(`${c.bowman} bowmen`),c.catapult&&h.push(`${c.catapult} catapult${c.catapult>1?"s":""}`);const d=at.income();s.innerHTML=`<b>Wave ${l}</b> from ${u}<br>${h.join(" · ")}${d?`<br>Village: +${d} gold per wave`:""}`}Et.orders.active=Et.tool==="orders";const o=zt("tool-hint"),a=cx();o.classList.toggle("hidden",!a),a&&o.innerHTML!==a&&(o.innerHTML=a),Et.showGrid=i||Et.tool!=="look"}function cx(){const r=(t,e)=>St[e].cost-St[t].cost;switch(Et.tool){case"upgrade":return`<b>Upgrade</b>: tap or drag over walls<br>Palisade → stone ${r("palisade","wall")} · Stone → thick ${r("wall","thick")}<br>Damaged thick walls, towers, gates: repair`;case"settle":{const t=at.world.tiles.filter(e=>e.type==="plot").length;return`<b>Village</b>: tap a staked plot to build it<br>Cottage ${St.cottage.cost} (+${St.cottage.income}) · Farm ${St.farm.cost} (+${St.farm.income}) · Market ${St.market.cost} (+${St.market.income})<br>${t?`${t} plot${t>1?"s":""} waiting`:"New plots appear after each wave"}`}case"hoard":return`<b>Hoarding</b> (${en.cost}): tap stone walls, gates, towers<br>Archers behind it take ${Math.round(en.cover*100)}% of arrow damage`;case"orders":{const t=Et.orders.selected.size;return t?`<b>${t} selected</b>: drag over the area to cover,<br>or tap a spot to hold`:"<b>Orders</b>: tap a swordsman, or drag a box around several, to select"}default:if(at.world.isRough(Et.tool)&&at.phase==="build"){const t=To,e=Et.tool==="wall"||Et.tool==="thick"?"<br>Paint over a weaker wall to upgrade it for the difference":"";return`<b>${_s[Et.tool]}</b> goes through anything, at a price<br>Marsh ×${t.marsh} · Ford ×${t.shallows} · Water ×${t.water} · Trees ×${t.tree} · Rocks ×${t.rock}${e}`}return""}}let yc=0;function We(r,t=2600){const e=zt("banner");e.innerHTML=r,e.classList.add("show"),clearTimeout(yc),yc=setTimeout(()=>e.classList.remove("show"),t)}function An(r,t,e){zt("modal-title").textContent=r,zt("modal-body").innerHTML=t;const n=zt("modal-actions");n.innerHTML="";for(const i of e){const s=document.createElement("button");s.textContent=i.label,i.primary&&(s.className="go"),s.addEventListener("click",()=>{var o;zt("modal").classList.add("hidden"),Et.paused=!1,(o=i.run)==null||o.call(i)}),n.appendChild(s)}zt("modal").classList.remove("hidden"),Et.paused=!0}const Sh=`
  <p>Raiders march on your keep from the red banners to kill your lord. Build a castle that holds.</p>
  <ul>
    <li><b>Walls</b>: drag to paint. Wooden palisades are cheap; stone walls let archers walk along them; thick walls take a beating. Enemies walk around walls if they can. Soldiers on foot can't break stone: they hack through gates and wood, or climb over with ladders.</li>
    <li><b>Towers and archers</b>: drag to aim, release to place. Archers stand on walls, towers and the keep, and walk along connected stone to reach attackers. Height adds range: towers most, then thick walls and hills. Arrows rarely miss at the foot of the wall but often miss at long range.</li>
    <li><b>Gates and swordsmen</b>: swordsmen guard the spot you place them and charge enemies that come close. They walk through gates, which are barred while attackers are at them; enemies have to break gates down. Send them out to kill catapults. Drop a gate into an existing wall for the difference in price.</li>
    <li><b>Stairs</b>: build them against a wall, tower or the keep and swordsmen can climb up to fight raiders coming over on ladders. Post swordsmen on the keep (it has its own stairs inside the door) to guard your lord.</li>
    <li><b>Upgrade</b>: tap a palisade to make it stone, or stone to make it thick. Tap damaged thick walls, towers and gates to repair them.</li>
    <li><b>Moats, pikes and spikes</b>: moats slow anyone wading through, pikes hurt anyone attacking them, and spikes hurt anyone walking over them.</li>
    <li><b>Enemies</b>: raiders and brutes hack at gates, palisades and pikes. Pairs of raiders carry <b>ladders</b> to stone walls and climb over; archers on or next to that wall push the ladder off. Rams smash gates and stone, bowmen shoot your troops, and catapults throw boulders from beyond archer range.</li>
    <li><b>Armies</b>: each wave arrives at once, an army massing at each red banner and marching together until it nears your castle. Raiders break off to sack village buildings they can reach without breaking anything, so a village outside your walls is easy pickings.</li>
    <li><b>The keep and your lord</b>: attackers who reach the keep batter its door, then fight their way up its narrow stair, two at a time, to your lord. His guard fights back, but a crowd will wear him down. Masons mend the door after every wave.</li>
    <li><b>Terrain</b>: rivers and lakes block the way except at fords; marsh and fords slow enemies down. Walls, gates, towers and pikes can be built across marsh, water, trees and rocks, but cost more there.</li>
    <li><b>Village</b>: after each wave the village stakes out plots where it feels safe. Tap a plot to build it; it pays gold after every wave.</li>
    <li><b>Remove</b>: full refund between waves, half during an attack.</li>
  </ul>
  <p><b>Two fingers</b> pinch to zoom and drag to pan. In <b>3D</b>, twist two fingers to orbit around your castle.
  The camera tilts to 3D when a wave starts so you can watch it play out, and returns to 2D for building.</p>`,hx='<p class="credits">Music: “Castle Chamber” by brigham773. “Minstrel Guild” and “Heroic Age” by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.</p>';let hr=null;function wh(r){hr=r}const ux="https://github.com/brigham-netizen/training/issues/new";let we={kind:"bug",text:"",name:""};try{we.name=localStorage.getItem("htk-name")||""}catch{}function dx(r,t,e){const n=at.phase==="won"?at.wave:at.nextWave;return[`Hold the Keep: ${r==="bug"?"bug report":"idea"}`,"",t.trim()||"(no description)","",e.trim()?`From: ${e.trim()}`:null,`Build 2026-10-07 9e08947 · map ${at.seed} · wave ${n}/${ci} (${at.phase}) · ${at.gold} gold`,`${Ve==="3d"?"3D":"Classic"} graphics · ${window.innerWidth}×${window.innerHeight} · ${navigator.userAgent}`].filter(s=>s!==null).join(`
`)}function bh(r){const t=we.kind;An("Send feedback",`
    <div class="toggles fb-kind">
      <button data-kind="bug" class="${t==="bug"?"on":""}">Something's wrong</button>
      <button data-kind="idea" class="${t==="idea"?"on":""}">I have an idea</button>
    </div>
    <textarea id="fb-text" class="fb-text" rows="3" maxlength="2000" placeholder="What happened, or what would make it better?">${Ss(we.text)}</textarea>
    <div class="fb-row">
      <input id="fb-name" maxlength="40" placeholder="Your name (optional)" value="${Ss(we.name)}" />
      ${r?'<label class="fb-check"><input type="checkbox" id="fb-shot" checked /> Screenshot</label>':""}
    </div>
    <p class="save-note fb-note">Includes the map number, wave and device so it can be replayed.</p>`,[{label:"Cancel",run:Eh},{label:"Post on GitHub",run:()=>Sc(r,"github")},{label:"Send",primary:!0,run:()=>Sc(r,"share")}]);for(const e of document.querySelectorAll(".fb-kind button"))e.addEventListener("click",()=>{we.kind=e.dataset.kind;for(const n of document.querySelectorAll(".fb-kind button"))n.classList.toggle("on",n===e)});zt("fb-text").focus()}function Eh(){var r,t;we.text=((r=zt("fb-text"))==null?void 0:r.value)??we.text,we.name=((t=zt("fb-name"))==null?void 0:t.value)??we.name;try{localStorage.setItem("htk-name",we.name)}catch{}}async function Sc(r,t){var o,a;Eh();const e=r&&((o=zt("fb-shot"))==null?void 0:o.checked)!==!1,n=dx(we.kind,we.text,we.name),i=`${we.kind==="bug"?"Bug":"Idea"}: ${we.text.trim().split(`
`)[0].slice(0,60)||"feedback"}`;if(t==="github"){window.open(`${ux}?title=${encodeURIComponent(i)}&body=${encodeURIComponent(n)}`,"_blank"),we.text="";return}const s={title:"Hold the Keep feedback",text:n};if(e){const l=new File([r],"hold-the-keep.jpg",{type:"image/jpeg"});(a=navigator.canShare)!=null&&a.call(navigator,{files:[l]})&&(s.files=[l])}try{if(!navigator.share)throw new Error("no share");await navigator.share(s),we.text="",We("Thanks!<small>Your feedback is on its way.</small>",2e3)}catch(l){if((l==null?void 0:l.name)==="AbortError")return;try{await navigator.clipboard.writeText(n),we.text="",We("Copied to your clipboard<small>Paste it in a message to whoever sent you the game.</small>",4200)}catch{An("Send feedback",`<p>Copy this and send it to whoever sent you the game:</p><textarea class="fb-copy" rows="8" readonly>${Ss(n)}</textarea>`,[{label:"Done",primary:!0}])}}}function fx(){const r=`<div class="toggles">
    <button id="music-toggle" class="${Xt.musicOn?"on":""}">Music: ${Xt.musicOn?"on":"off"}</button>
    <button id="sfx-toggle" class="${Xt.sfxOn?"on":""}">Sound effects: ${Xt.sfxOn?"on":"off"}</button>
    <button id="build-track">Build music: ${Ui[Xt.buildTrack].label}</button>
    <button id="test-sound">Test sound</button>
    <button id="gfx-toggle" class="${Ve==="3d"?"on":""}">Graphics: ${Ve==="3d"?"3D (preview)":"Classic"}</button>
    <button id="menu-feedback">Report a bug / suggest an idea</button>
  </div><p class="save-note" id="sound-note"></p>`,t=`<div class="toggles">
    <button id="save-game">Save game</button>
    <button id="load-game">Load save</button>
    <button id="save-map">Save this map</button>
    <button id="my-maps">My maps</button>
  </div><p class="save-note" id="save-note">Saves are kept in ${fn.where}. The game also saves before every wave.</p>`;An("Hold the Keep",r+t+Sh+hx,[{label:"New map",run:()=>Oi(Ka())},{label:"Restart",run:()=>Oi()},{label:"Resume",primary:!0}])}const nr=r=>{const t=zt("save-note");t&&(t.textContent=r)};document.addEventListener("click",async r=>{const t=r.target.id;if(t==="save-game"){if(at.phase!=="build")return nr("You can save between waves.");nr("Saving…");const e=await fn.saveProgress(at.serialize()).catch(()=>!1);return nr(e?`Saved wave ${at.wave+1} to ${fn.where}.`:"Could not save. Try again in a moment.")}if(t==="load-game"){const e=await fn.loadProgress();if(!e)return nr("No saved game yet.");Aa(),Qa(e);return}if(t==="menu-feedback"){Aa(),wh(e=>bh(e));return}if(t==="gfx-toggle"){Za(Ve==="3d"?"classic":"3d"),r.target.classList.toggle("on",Ve==="3d"),r.target.textContent=`Graphics: ${Ve==="3d"?"3D (preview)":"Classic"}`;return}if(t==="build-track"){Xt.unlock(),Xt.nextBuildTrack(),r.target.textContent=`Build music: ${Ui[Xt.buildTrack].label}`;return}if(t==="test-sound"){Xt.unlock(),Xt.play("horn"),setTimeout(()=>{const e=zt("sound-note");if(!e)return;const n=Xt.tracks.build,i=[];i.push(Xt.running?"Sound engine is running: you should hear a horn.":"This browser is blocking sound so far. Tap again; if it stays silent, check the volume and the silent switch."),Xt.musicOn?n!=null&&n.error?i.push("The music files could not be loaded here."):n&&!n.paused?i.push("Music is playing."):i.push("Music is still loading."):i.push("Music is turned off."),e.textContent=i.join(" ")},600);return}if(t==="save-map")return px();if(t==="my-maps")return Th();if(t.startsWith("play-map-")||t.startsWith("del-map-"))return mx(r.target);if(r.target.id==="music-toggle")Xt.toggleMusic();else if(r.target.id==="sfx-toggle")Xt.toggleSfx();else return;r.target.classList.toggle("on"),r.target.textContent=r.target.id==="music-toggle"?`Music: ${Xt.musicOn?"on":"off"}`:`Sound effects: ${Xt.sfxOn?"on":"off"}`,Ja()});function Aa(){zt("modal").classList.add("hidden"),Et.paused=!1}function Qa(r){try{at=Mr.restore(r)}catch{We("That save is from an older version and can't be loaded.");return}window.htk.game=at,Et.orders.selected=new Set,Et.tool=Et.buildTool="wall",Et.speed=1,Xi("top"),Xt.setMusic("build"),We(`Welcome back<small>Wave ${at.wave+1} of ${ci}</small>`),Ke()}let fs=[];function px(){const r=fs.length;An("Save this map",`<p>Keep this landscape to play again later. Only the land is saved, not your castle.</p>
    <label class="field">Name<input id="map-name" maxlength="32" value="Map ${r+1}" /></label>`,[{label:"Cancel"},{label:"Save map",primary:!0,run:async()=>{var i;const e=(((i=zt("map-name"))==null?void 0:i.value)||"").trim()||`Map ${r+1}`,n=await fn.saveMap(e,at.world.snapshotMap()).catch(()=>!1);We(n?`Saved “${e}”<small>Find it under My maps</small>`:"Could not save the map. Try again in a moment.")}}]);const t=zt("map-name");t==null||t.addEventListener("keydown",e=>e.key==="Enter"&&zt("modal-actions").lastChild.click())}async function Th(){fs=await fn.listMaps();const r=fs.length?fs.map(t=>`<div class="map-row"><span><b>${Ss(t.name)}</b><small>${new Date(t.savedAt).toLocaleDateString()}</small></span>
        <button id="play-map-${t.id}" class="go">Play</button><button id="del-map-${t.id}">Delete</button></div>`).join(""):"<p>No saved maps yet. When you find a landscape you like, open the menu and tap <b>Save this map</b>.</p>";An("My maps",`<div class="map-list">${r}</div>`,[{label:"Close",primary:!0}])}async function mx(r){const t=r.id.startsWith("play-map-"),e=r.id.replace(/^(play|del)-map-/,""),n=fs.find(i=>i.id===e);if(n){if(t){Aa(),Oi(Math.floor(Math.random()*1e9),n.map),We(`Playing “${Ss(n.name)}”`);return}if(r.dataset.confirm!=="1"){r.dataset.confirm="1",r.textContent="Tap again";return}await fn.deleteMap(e).catch(()=>{}),Th()}}function gx(r){const t=r.map(e=>`a ${St[e].label.toLowerCase()}`);return t.length>1?`${t.slice(0,-1).join(", ")} and ${t.at(-1)}`:t[0]}function Ss(r){return String(r).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Oi(r,t){r===void 0?at.reset():at.reset(r,t||null),Xt.setMusic("build"),Et.tool=Et.buildTool="wall",Et.speed=1,Xi("top"),Ke()}function xx(){var r;for(const t of at.events){if(t.type==="waveStart")We(`Wave ${t.wave} incoming!<small>from the ${t.spawns.join(" & ")}</small>`),Xi("iso"),Xt.play("horn"),Xt.setMusic("battle"),Et.tool="look",ys();else if(t.type==="waveEnd"){const e=t.village?` and +${t.village} from the village`:"",n=(r=t.plots)!=null&&r.length?`<br>The village staked out ${gx(t.plots)}. Tap a plot to build it.`:"";We(`Wave ${t.wave} repelled!<small>+${t.bonus} gold${e}.${n}</small>`,n?5e3:3400),yh(),Xi("top"),Xt.play("waveEnd"),Xt.setMusic("build"),Et.tool=Et.buildTool,Et.speed=1}else t.type==="doorBroken"?We("The keep door is down!<small>Attackers are climbing to your lord.</small>",2600):t.type==="won"?(Xt.play("victory"),Xt.setMusic("build"),An("Victory!",`<p>Your keep stood against all <b>${ci}</b> waves.</p>`,[{label:"Keep looking"},{label:"New map",primary:!0,run:()=>Oi(Ka())}])):t.type==="lost"&&(Xt.play("defeat"),Xt.setMusic("build"),An("Your lord has fallen",`<p>You held out until wave <b>${t.wave}</b>.</p>`,[{label:"Look around"},{label:"Start over",run:()=>Oi()},{label:"Retry this wave",primary:!0,run:async()=>{const e=await fn.loadProgress();e?Qa(e):Oi()}}]));Ke()}at.events.length=0}window.addEventListener("keydown",r=>{if(r.target.tagName==="INPUT"||r.target.tagName==="TEXTAREA")return;const t="1234567890".indexOf(r.key);t>=0?ja(nx[t]):r.key==="v"?Xi(ve.mode==="top"?"iso":"top"):r.key==="r"?ve.rotateBy(Math.PI/2):r.key===" "&&at.phase==="build"&&(r.preventDefault(),Mh())});function ws(){Sa.resize(),En==null||En.resize(window.innerWidth,window.innerHeight,window.devicePixelRatio||1);const r=ve.fit();ws.done||(ve.zoom=Math.max(r,Math.min(1.25,ve.vh/(12*32))),ve.updateTrig(),ws.done=!0)}window.addEventListener("resize",ws);ws();Ve==="3d"&&Za("3d");Ke();const wo=1/60;let bo=0,wc=performance.now(),Eo=0;function Ah(r){const t=Math.min(.1,(r-wc)/1e3);if(wc=r,!Et.paused)for(bo+=t*(at.phase==="attack"?Et.speed:1);bo>=wo;)at.update(wo),bo-=wo;ve.update(t),xx();for(const e of at.sounds){const n=Math.hypot(e.x-ve.fx,e.y-ve.fy);Xt.play(e.name,Math.max(.25,1-n/22))}if(at.sounds.length=0,Xt.update(t),Eo+=t,Eo>.1&&(Eo=0,Ke()),Ve==="3d"&&En?(En.render(at,ve),Sa.renderOverlay(at,Et)):Sa.render(at,Et),hr){const e=hr;hr=null;try{const n=Math.min(1,1280/si.width),i=document.createElement("canvas");i.width=Math.round(si.width*n),i.height=Math.round(si.height*n);const s=i.getContext("2d");Ve==="3d"&&En&&s.drawImage(wa,0,0,i.width,i.height),s.drawImage(si,0,0,i.width,i.height),i.toBlob(o=>e(o),"image/jpeg",.82)}catch{e(null)}}requestAnimationFrame(Ah)}requestAnimationFrame(Ah);try{localStorage.getItem("htk-seen-help")||(localStorage.setItem("htk-seen-help","1"),An("Hold the Keep",Sh,[{label:"Start building",primary:!0}]))}catch{}fn.loadProgress().then(r=>{!r||r.wave===0&&!r.types.some(t=>t&&t!=="keep")||zt("modal").classList.contains("hidden")&&An("Welcome back",`<p>You have a castle in progress at <b>wave ${r.wave+1}</b> of ${ci}.</p>`,[{label:"New game"},{label:"Continue",primary:!0,run:()=>Qa(r)}])});
