(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();const Ch=32,Ph=20,Cr=32,Lh=250,ci=10,Ih=1/16,wt={palisade:{label:"Palisade",cost:1,hp:120,height:.9,solid:!0,thin:.3,upgrade:"wall"},wall:{label:"Wall",cost:2,hp:300,height:1,solid:!0,thin:.6,rampart:!0,slots:1,perch:.5,upgrade:"thick"},thick:{label:"Thick wall",cost:5,hp:750,height:1.35,solid:!0,rampart:!0,slots:2,perch:1},gate:{label:"Gate",cost:15,hp:240,height:1.25,solid:!0,rampart:!0,slots:1,perch:.5,gate:!0},tower:{label:"Tower",cost:60,hp:550,height:2.2,solid:!0,rampart:!0,slots:3,perch:1.5,freeArchers:1},moat:{label:"Moat",cost:3,slow:.35,flatOnly:!0},stair:{label:"Stairs",cost:4,stair:!0},pikes:{label:"Pikes",cost:3,hp:110,height:.6,solid:!0,thorns:18},trap:{label:"Spikes",cost:20,dps:22},cottage:{label:"Cottage",cost:30,hp:160,height:.9,solid:!0,village:!0,income:10},farm:{label:"Farm",cost:15,hp:40,village:!0,income:6,trample:90},market:{label:"Market",cost:60,hp:260,height:1,solid:!0,village:!0,income:25}},Eo={hill:1,marsh:2,shallows:3,water:4,tree:2,rock:3},Dh={hp:1.25},en={cost:3,cover:.2,splash:.5,on:["wall","thick","gate","tower"]},Pr={maxPlots:3,marketAfter:3},Uh=.5,Nh=.12,tn={cost:20,hp:50,range:4,fireRate:.9,damage:10,speed:2.4},$e={cost:25,hp:130,dps:20,speed:1.9,guard:4,r:.22},kh=.75,oe={size:3,hp:1e3,height:2.6,slots:2,perch:1.5,archers:2,doorHp:260,guard:22,climb:2.5},nn={raise:1.2,hp:80,push:16,climb:.35,cost:9,regroup:14,reach:["wall","thick"]},Sc=["wall","thick","tower"],Ri={grass:{slow:1},hill:{slow:.7,elev:.55,perch:1},marsh:{slow:.55,noBuild:!0},shallows:{slow:.45,noBuild:!0},water:{blocked:!0}},Yi={raider:{hp:40,speed:1.6,dps:8,siege:1,gold:3,r:.22},ladder:{hp:80,speed:1.25,dps:0,siege:0,gold:6,r:.34,crew:2},brute:{hp:140,speed:.95,dps:16,siege:1.2,gold:8,r:.3},ram:{hp:380,speed:.6,dps:26,siege:3,gold:15,r:.38,noMelee:!0,siegeEngine:!0},bowman:{hp:34,speed:1.3,dps:4,siege:.6,gold:5,r:.2,range:4,rate:.6,shot:6},catapult:{hp:240,speed:.45,dps:0,siege:0,gold:25,r:.42,range:6,rate:.22,boulder:90,splash:35,ammo:10,noMelee:!0,siegeEngine:!0}},Fh=11,Oh=.5;function To(s){return{raider:8+s*3,ladder:1+Math.floor(s/2),brute:s>=2?(s-1)*3:0,ram:s>=4?Math.ceil((s-3)*1.5):0,bowman:s>=3?s-2:0,catapult:s>=5?Math.floor((s-3)/2):0,hpMult:1+(s-1)*.07,spawnCount:s>=7?4:s>=5?3:s>=3?2:1}}function Bh(s){return 50+s*12}function bc(s){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}const wc={grass:"g",hill:"h",marsh:"m",shallows:"s",water:"w"},zh=Object.fromEntries(Object.entries(wc).map(([s,t])=>[t,s]));class Hh{constructor(t=1,e=null){this.w=Ch,this.h=Ph,this.tiles=[],this.reserved=new Uint8Array(this.w*this.h),this.keep={hp:oe.hp,maxHp:oe.hp,x:0,y:0},this.spawns=[],this.dirty=!0,e?this.applyMap(e):this.generate(t)}snapshotMap(){let t="",e="",n="";for(const i of this.tiles)t+=wc[i.terrain],e+=i.type==="tree"?"t":i.type==="rock"||i.rock?"r":".",n+=Math.min(9,Math.floor(i.v*10));return{w:this.w,h:this.h,terrain:t,scenery:e,v:n}}applyMap(t){if(t.w!==this.w||t.h!==this.h)throw new Error("map size mismatch");this.tiles=[];for(let e=0;e<this.w*this.h;e++){const n=t.scenery[e];this.tiles.push({type:n==="t"?"tree":n==="r"?"rock":"grass",terrain:zh[t.terrain[e]]||"grass",hp:0,maxHp:0,v:(Number(t.v[e])+.5)/10,weakened:!1})}this.placeFixtures(),this.dirty=!0}placeFixtures(){const{w:t,h:e}=this,n=Math.floor(t/2)-1,i=Math.floor(e/2)-1,r=n+1,o=i+1;this.keep={hp:oe.hp,maxHp:oe.hp,x:n,y:i,door:this.idx(n+1,i+oe.size-1),step:this.idx(n+1,i+oe.size),doorHp:oe.doorHp,doorMax:oe.doorHp,inside:0},this.spawns=[{x:0,y:o,name:"west"},{x:t-1,y:o-1,name:"east"},{x:r,y:0,name:"north"},{x:r-1,y:e-1,name:"south"}],this.reserved.fill(0);for(let l=i;l<i+oe.size;l++)for(let c=n;c<n+oe.size;c++){const h=this.tiles[this.idx(c,l)];h.type="keep",h.terrain="grass"}const a=this.tiles[this.keep.step];this.reserved[this.keep.step]=1,a.terrain="grass",(a.type==="tree"||a.type==="rock")&&(a.type="grass");for(const l of this.spawns)for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){if(!this.inBounds(l.x+h,l.y+c))continue;const u=this.idx(l.x+h,l.y+c);this.reserved[u]=1;const d=this.tiles[u];d.terrain==="water"&&(d.terrain="shallows"),(d.type==="tree"||d.type==="rock")&&(d.type="grass")}}idx(t,e){return e*this.w+t}inBounds(t,e){return t>=0&&e>=0&&t<this.w&&e<this.h}idxAt(t,e){const n=Math.min(this.w-1,Math.max(0,Math.floor(t))),i=Math.min(this.h-1,Math.max(0,Math.floor(e)));return this.idx(n,i)}isBlocked(t){const e=this.tiles[t];return e.type==="tree"||e.type==="rock"||Ri[e.terrain].blocked===!0}isSolid(t){var n;const e=this.tiles[t];return e.type==="keep"||((n=wt[e.type])==null?void 0:n.solid)===!0}isWalkable(t){return!this.isBlocked(t)&&!this.isSolid(t)}slow(t){const e=this.tiles[t],n=Ri[e.terrain].slow??1;return e.type==="moat"?Math.min(n,wt.moat.slow):n}groundElev(t){return Ri[this.tiles[t].terrain].elev||0}rockHeight(t){return .35+this.tiles[t].v*.3}heightAt(t,e){const n=Math.min(this.w-1,Math.max(0,Math.floor(t))),i=Math.min(this.h-1,Math.max(0,Math.floor(e))),r=Math.min(1,Math.max(0,t-n)),o=Math.min(1,Math.max(0,e-i)),a=r<.5?-1:1,l=o<.5?-1:1,c=Math.abs(r-.5)*2,h=Math.abs(o-.5)*2,u=this.groundAt(n,i),d=(u+this.groundAt(n+a,i))/2,f=(u+this.groundAt(n,i+l))/2,g=this.cornerHeight(n+(a>0?1:0),i+(l>0?1:0));return c>=h?u+c*(d-u)+h*(g-d):u+h*(f-u)+c*(g-f)}groundAt(t,e){return this.inBounds(t,e)?this.groundElev(this.idx(t,e)):0}cornerHeight(t,e){let n=0,i=0;for(const[r,o]of[[t-1,e-1],[t,e-1],[t-1,e],[t,e]])this.inBounds(r,o)&&(n+=this.groundElev(this.idx(r,o)),i++);return i?n/i:0}minGround(t){const e=t%this.w,n=t/this.w|0;let i=this.groundElev(t);for(const[r,o]of[[e,n],[e+1,n],[e,n+1],[e+1,n+1]])i=Math.min(i,this.cornerHeight(r,o));return i}sloped(t){const e=t%this.w,n=t/this.w|0;for(let i=-1;i<=1;i++)for(let r=-1;r<=1;r++)if(this.groundAt(e+r,n+i)!==0)return!0;return!1}elev(t){return this.groundElev(t)}baseElev(t){const e=this.tiles[t];return this.groundElev(t)+(e.rock?this.rockHeight(t):0)}maxHpFor(t,e){var i;const n=((i=wt[e])==null?void 0:i.hp)||0;return Math.round(n*(this.tiles[t].rock?Dh.hp:1))}stairFace(t){const e=t%this.w,n=t/this.w|0;let i=-1,r=9;for(const[o,a]of[[0,-1],[1,0],[0,1],[-1,0]]){if(!this.inBounds(e+o,n+a))continue;const l=this.idx(e+o,n+a);if(!this.isRampart(l))continue;const c=["wall","thick","gate","tower","keep"].indexOf(this.tiles[l].type);c<r&&(r=c,i=l)}return i}isRampart(t){var n;const e=this.tiles[t];return e.type==="keep"||((n=wt[e.type])==null?void 0:n.rampart)===!0}slots(t){var n;const e=this.tiles[t];return e.type==="keep"?oe.slots:((n=wt[e.type])==null?void 0:n.slots)||0}perch(t){var i;const e=this.tiles[t];return(e.type==="keep"?oe.perch:((i=wt[e.type])==null?void 0:i.perch)||0)+(Ri[e.terrain].perch||0)}surface(t){var i;const e=this.tiles[t],n=e.type==="keep"?oe.height:((i=wt[e.type])==null?void 0:i.height)||0;return this.elev(t)+n}surfaceAt(t,e,n){var r;const i=this.tiles[t];return i.type==="wall"||i.type==="thick"||i.type==="palisade"||i.type==="grass"?this.heightAt(e,n)+(((r=wt[i.type])==null?void 0:r.height)||0):this.surface(t)}generate(t){for(let e=0;e<50;e++)if(this.tryGenerate(t+e*7919),this.spawnsConnected())return}tryGenerate(t){const e=bc(t),{w:n,h:i}=this;this.tiles=[];for(let p=0;p<n*i;p++)this.tiles.push({type:"grass",terrain:"grass",hp:0,maxHp:0,v:e(),weakened:!1});this.placeFixtures();const r=this.keep.x+1,o=this.keep.y+1,a=(p,m,v)=>this.spawns.some(x=>Math.abs(p-x.x)+Math.abs(m-x.y)<v),l=(p,m,v,x)=>Math.abs(p-r)<v&&Math.abs(m-o)<x,c=(p,m,v)=>{this.inBounds(p,m)&&(this.tiles[this.idx(p,m)].terrain=v)},h=(p,m)=>this.inBounds(p,m)?this.tiles[this.idx(p,m)].terrain:null,u=(p,m)=>{const v=Math.floor(e()*n),x=Math.floor(e()*i);for(let M=x-4;M<=x+4;M++)for(let A=v-4;A<=v+4;A++){if(!this.inBounds(A,M))continue;const T=Math.hypot(A-v,M-x)+e()*.9;T<p&&m(A,M,T)}},d=3+Math.floor(e()*3);for(let p=0;p<d;p++)u(1.6+e()*1.6,(m,v)=>{l(m,v,3,3)||c(m,v,"hill")});if(e()<.8){const p=e()<.6,m=p?i:n;let v=p?e()<.5?5+Math.floor(e()*3):n-8+Math.floor(e()*3):e()<.5?2+Math.floor(e()*2):i-4-Math.floor(e()*2);const x=p?3:1,M=p?n-5:i-3,A=Math.floor(m*(.15+e()*.25)),T=Math.floor(m*(.6+e()*.25));for(let E=0;E<m;E++){e()<.3&&(v=Math.max(x,Math.min(M,v+(e()<.5?-1:1))));const P=Math.abs(E-A)<=1||Math.abs(E-T)<=1;for(const N of[0,1]){const y=p?v+N:E,b=p?E:v+N;l(y,b,6,5)||c(y,b,P?"shallows":"water")}}}const f=Math.floor(e()*3);for(let p=0;p<f;p++){const m=1.3+e()*1.2;u(m+1,(v,x,M)=>{l(v,x,6,5)||c(v,x,M<m?"water":"shallows")})}const g=1+Math.floor(e()*3);for(let p=0;p<g;p++)u(1.5+e()*1.5,(m,v)=>{!l(m,v,4,3)&&h(m,v)==="grass"&&c(m,v,"marsh")});this.placeFixtures();const _=8+Math.floor(e()*4);for(let p=0;p<_;p++){let m=Math.floor(e()*n),v=Math.floor(e()*i);const x=3+Math.floor(e()*6),M=h(m,v)==="hill",A=e()<(M?.45:.85)?"tree":"rock";for(let T=0;T<x;T++){if(this.inBounds(m,v)&&!l(m,v,6,5)&&!a(m,v,4)){const E=this.tiles[this.idx(m,v)];(E.terrain==="grass"||E.terrain==="hill"||A==="tree"&&E.terrain==="marsh")&&(E.type=A)}m+=Math.floor(e()*3)-1,v+=Math.floor(e()*3)-1}}this.dirty=!0}spawnsConnected(){const t=new Uint8Array(this.w*this.h),e=this.keep,n=[this.idx(e.x,e.y)];for(t[n[0]]=1;n.length;){const i=n.pop(),r=i%this.w,o=i/this.w|0;for(const[a,l]of[[1,0],[-1,0],[0,1],[0,-1]]){const c=r+a,h=o+l;if(!this.inBounds(c,h))continue;const u=this.idx(c,h);t[u]||this.isBlocked(u)||(t[u]=1,n.push(u))}}return this.spawns.every(i=>t[this.idx(i.x,i.y)])}isRough(t){const e=wt[t];return!!(e!=null&&e.solid)&&!e.village}buildProblem(t,e){var r;const n=this.tiles[t];if(this.reserved[t])return"reserved";if(this.isRough(e))return n.type==="grass"||n.type==="tree"||n.type==="rock"?null:"occupied";if(n.type!=="grass")return"occupied";const i=Ri[n.terrain];return i.blocked||i.noBuild||(r=wt[e])!=null&&r.flatOnly&&n.terrain!=="grass"?"terrain":null}canBuild(t,e="wall"){return this.buildProblem(t,e)===null}build(t,e){const n=this.tiles[t];n.type==="rock"&&(n.rock=this.isRough(e)),n.type=e,n.plot=null,n.hp=n.maxHp=this.maxHpFor(t,e),n.weakened=!1,this.dirty=!0}clear(t){const e=this.tiles[t];e.type=e.rock?"rock":"grass",e.rock=!1,e.hoard=!1,e.ladder=null,e.plot=null,e.paid=void 0,e.hp=e.maxHp=0,this.dirty=!0}damage(t,e){const n=this.tiles[t];return n.type==="keep"?(this.keep.hp=Math.max(0,this.keep.hp-e),this.keep.hp<=0):(n.hp-=e,n.hp<=0?(this.clear(t),!0):(n.hp<n.maxHp*.5&&!n.weakened&&(n.weakened=!0,this.dirty=!0),!1))}}const rl=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];class Gh{constructor(){this.items=[]}get size(){return this.items.length}push(t,e){const n=this.items;n.push([e,t]);let i=n.length-1;for(;i>0;){const r=i-1>>1;if(n[r][0]<=n[i][0])break;[n[r],n[i]]=[n[i],n[r]],i=r}}pop(){const t=this.items,e=t[0],n=t.pop();if(t.length){t[0]=n;let i=0;for(;;){const r=i*2+1,o=r+1;let a=i;if(r<t.length&&t[r][0]<t[a][0]&&(a=r),o<t.length&&t[o][0]<t[a][0]&&(a=o),a===i)break;[t[a],t[i]]=[t[i],t[a]],i=a}}return e}}function ol(s,t,e,n){const i=s.tiles[t];if(i.type==="keep")return 1/0;if(s.isSolid(t)){if(Sc.includes(i.type)&&n!=="ram")return i.ladder?e/nn.climb:n==="ladder"&&nn.reach.includes(i.type)?e/nn.climb+nn.cost:1/0;const o=i.type==="gate"?n==="ram"?Nh:Uh:1;return e+Math.max(0,i.hp)*Ih*o}return e/s.slow(t)}function al(s,t,e,n,i){return!n||!i?!0:s.isWalkable(s.idx(t+n,e))&&s.isWalkable(s.idx(t,e+i))}function Ea(s,t="foot"){const{w:e,h:n}=s,i=e*n,r=new Float64Array(i).fill(1/0),o=new Int32Array(i).fill(-1),a=new Gh,l=s.keep.step;for(r[l]=0,a.push(l,0);a.size;){const[c,h]=a.pop();if(c>r[h])continue;const u=h%e,d=h/e|0;for(const[f,g,_]of rl){const p=u-f,m=d-g;if(p<0||m<0||p>=e||m>=n)continue;const v=s.idx(p,m);if(s.isBlocked(v)||s.tiles[v].type==="keep"||!al(s,p,m,f,g))continue;const x=c+ol(s,h,_,t);x<r[v]&&(r[v]=x,a.push(v,x))}}for(let c=0;c<i;c++){if(!isFinite(r[c])||r[c]===0)continue;const h=c%e,u=c/e|0;let d=1/0;for(const[f,g,_]of rl){const p=h+f,m=u+g;if(p<0||m<0||p>=e||m>=n)continue;const v=s.idx(p,m);if(s.isBlocked(v)||!al(s,h,u,f,g))continue;const x=r[v]+ol(s,v,_,t);x<d&&(d=x,o[c]=v)}}return{dist:r,next:o}}function Vh(s){return Ea(s,"ram")}function Wh(s){return Ea(s,"ladder")}const Xh=.75,Lr=.4,qh=60,Ki=[[1,0],[-1,0],[0,1],[0,-1]],ll=1,Ir=["palisade","wall","thick"];class vr{constructor(t=20261006,e=null){this.seed=t,this.reset(t,e)}reset(t=this.seed,e=this.map){this.seed=t,this.map=e,this.world=new Hh(t,e),this.gold=Lh,this.wave=0,this.phase="build",this.enemies=[],this.archers=[],this.swordsmen=[],this.projectiles=[],this.ladders=[],this.fallen=[],this.intruders=[],this.effects=[],this.floaters=[],this.spawnQueue=[],this.waveTime=0,this.time=0,this.nextId=1,this.events=[],this.sounds=[],this.rnd=bc(t^2654435769),this.repath();const n=this.world.keep;for(const[i,r]of[[1,0],[0,2],[2,2]].slice(0,oe.archers))this.addArcher(this.world.idx(n.x+i,n.y+r));this.proposePlots()}emit(t,e={}){this.events.push({type:t,...e})}sfx(t,e,n){this.sounds.length<48&&this.sounds.push({name:t,x:e,y:n})}get nextWave(){return this.wave+1}activeSpawns(t=this.nextWave){return this.world.spawns.slice(0,To(t).spawnCount)}center(t){return[t%this.world.w+.5,(t/this.world.w|0)+.5]}enemyOnTile(t){const e=t%this.world.w,n=t/this.world.w|0;return this.enemies.some(i=>i.x+i.r>e&&i.x-i.r<e+1&&i.y+i.r>n&&i.y-i.r<n+1)}canPlace(t,e){if(this.phase==="won"||this.phase==="lost")return!1;if(e==="archer")return this.canPlaceArcher(t);if(e==="swordsman")return this.canPlaceSwordsman(t);if(e==="upgrade")return this.upgradeInfo(t)!==null&&this.gold>=this.upgradeInfo(t).cost;if(e==="hoard")return this.canHoard(t);if(e==="settle")return this.canSettle(t);const n=this.layOverCost(t,e);return n!==null?this.gold>=n:!(!this.world.canBuild(t,e)||wt[e].stair&&this.stairFace(t)<0||this.gold<this.costAt(t,e)||wt[e].solid&&(this.enemyOnTile(t)||this.swordsmanOnTile(t)))}place(t,e){if(e==="archer")return this.placeArcher(t);if(e==="swordsman")return this.placeSwordsman(t);if(e==="upgrade")return this.upgrade(t);if(e==="hoard")return this.hoard(t);if(e==="settle")return this.settle(t);if(this.layOverCost(t,e)!==null)return this.layOver(t,e);if(!this.canPlace(t,e))return!1;const n=this.costAt(t,e);if(this.gold-=n,this.world.build(t,e),this.world.tiles[t].paid=n,n>wt[e].cost){const[i,r]=this.center(t);this.floaters.push({x:i,y:r,z:this.world.surface(t),text:`-${n}`,t:0,color:"cost"})}for(let i=0;i<(wt[e].freeArchers||0);i++)this.addArcher(t);return this.sfx("build",...this.center(t)),!0}layOverCost(t,e){const n=this.world.tiles[t].type,i=Ir.indexOf(n),r=e==="gate"?Ir.length:Ir.indexOf(e);return i<0||r<=i||this.phase==="won"||this.phase==="lost"?null:Math.max(1,this.costAt(t,e)-this.costAt(t,n))}layOver(t,e){const n=this.layOverCost(t,e);if(n===null||this.gold<n)return!1;this.gold-=n;const i=this.world.tiles[t];i.paid=(i.paid??this.costAt(t,i.type))+n,i.type=e,i.hp=i.maxHp=this.world.maxHpFor(t,e),i.weakened=!1,en.on.includes(e)||(i.hoard=!1),this.world.dirty=!0;const r=this.archers.filter(l=>l.tile===t&&!l.path.length);for(const l of r.slice(this.world.slots(t))){const c=this.rampartPath(l,h=>this.hasRoom(h,l));c?l.path=c:this.rehouse(l)}const[o,a]=this.center(t);return this.floaters.push({x:o,y:a,z:this.world.surface(t),text:`-${n}`,t:0,color:"cost"}),this.sfx("build",o,a),!0}costAt(t,e){const n=wt[e].cost;if(!this.world.isRough(e))return n;const i=this.world.tiles[t],r=(Eo[i.terrain]||1)*(Eo[i.type]||1);return Math.ceil(n*r)}upgradeInfo(t){const e=this.world.tiles[t],n=wt[e.type];if(!n||!n.hp)return null;if(n.upgrade){const i=wt[n.upgrade];return{kind:"upgrade",to:n.upgrade,cost:Math.max(1,i.cost-n.cost)}}if(e.hp<e.maxHp){const i=1-e.hp/e.maxHp;return{kind:"repair",cost:Math.max(1,Math.ceil(n.cost*i))}}return null}upgrade(t){const e=this.upgradeInfo(t);if(!e||this.gold<e.cost||this.phase==="won"||this.phase==="lost")return!1;this.gold-=e.cost;const n=this.world.tiles[t];return e.kind==="upgrade"?(n.paid=(n.paid??wt[n.type].cost)+e.cost,n.type=e.to,n.hp=n.maxHp=this.world.maxHpFor(t,e.to),n.weakened=!1,this.world.dirty=!0):(n.hp=n.maxHp,n.weakened=!1,this.world.dirty=!0),this.floaters.push({x:t%this.world.w+.5,y:(t/this.world.w|0)+.5,z:this.world.surface(t),text:`-${e.cost}`,t:0,color:"cost"}),this.sfx("build",...this.center(t)),!0}refundFor(t){const e=this.world.tiles[t],n=wt[e.type];if(!n)return 0;const i=e.maxHp?e.hp/e.maxHp:1,r=this.phase==="build"?1:.5,o=(e.paid??n.cost)+(e.hoard?en.cost:0);return Math.floor(o*i*r)}demolish(t){const e=this.world.tiles[t];if(e.type==="plot")return this.world.clear(t),!0;if(!wt[e.type])return!1;this.gold+=this.refundFor(t);const n=this.archers.filter(i=>i.tile===t);this.world.clear(t);for(const i of n)this.rehouse(i);return!0}canHoard(t){const e=this.world.tiles[t];return this.phase!=="won"&&this.phase!=="lost"&&en.on.includes(e.type)&&!e.hoard&&this.gold>=en.cost}hoard(t){return this.canHoard(t)?(this.gold-=en.cost,this.world.tiles[t].hoard=!0,this.sfx("build",...this.center(t)),!0):!1}villageCount(t){return this.world.tiles.filter(e=>e.type===t).length}canSettle(t){const e=this.world.tiles[t];return this.phase!=="won"&&this.phase!=="lost"&&e.type==="plot"&&this.gold>=wt[e.plot].cost&&!(wt[e.plot].solid&&this.enemyOnTile(t))}settle(t){if(!this.canSettle(t))return!1;const e=this.world.tiles[t].plot;return this.gold-=wt[e].cost,this.world.build(t,e),this.sfx("build",...this.center(t)),!0}income(){var e;let t=0;for(const n of this.world.tiles)t+=((e=wt[n.type])==null?void 0:e.income)||0;return t}safetyMap(){var l;const{world:t}=this,{w:e,h:n}=t,i=new Uint8Array(e*n),r=[];for(let c=0;c<e*n;c++){const h=c%e,u=c/e|0;(h===0||u===0||h===e-1||u===n-1)&&t.isWalkable(c)&&(i[c]=1,r.push(c))}for(let c=0;c<r.length;c++){const h=r[c],u=h%e,d=h/e|0;for(const[f,g]of Ki){const _=u+f,p=d+g;if(!t.inBounds(_,p))continue;const m=t.idx(_,p);i[m]||!t.isWalkable(m)||(i[m]=1,r.push(m))}}const o=t.keep,a=new Float32Array(e*n).fill(-1/0);for(let c=0;c<e*n;c++){if(!t.canBuild(c,"cottage")||this.tiles_villageBlocked(c))continue;const h=c%e,u=c/e|0;let d=i[c]?0:30;for(let g=Math.max(0,u-4);g<=Math.min(n-1,u+4);g++)for(let _=Math.max(0,h-4);_<=Math.min(e-1,h+4);_++){const p=t.tiles[t.idx(_,g)].type;p==="tower"?d+=2.5:(l=wt[p])!=null&&l.rampart&&(d+=.4)}d-=Math.hypot(h-(o.x+1),u-(o.y+1))*.8;const f=Math.min(h,u,e-1-h,n-1-u);f<3&&(d-=(3-f)*4),t.tiles[c].terrain==="hill"&&(d-=1),a[c]=d}return a}tiles_villageBlocked(t){var r,o;const{world:e}=this,n=t%e.w,i=t/e.w|0;for(const[a,l]of Ki){const c=n+a,h=i+l;if(!e.inBounds(c,h))continue;const u=e.tiles[e.idx(c,h)].type;if(u==="keep"||(r=wt[u])!=null&&r.solid&&!((o=wt[u])!=null&&o.village))return!0}return!1}proposePlots(){const{world:t}=this,e=t.tiles.filter(h=>h.type==="plot").length;if(e>=Pr.maxPlots)return[];const n=this.safetyMap(),i=(h,u)=>{const d=h%t.w,f=h/t.w|0;let g=0;for(const[_,p]of[...Ki,[1,1],[1,-1],[-1,1],[-1,-1]]){if(!t.inBounds(d+_,f+p))continue;const m=t.tiles[t.idx(d+_,f+p)];(u.includes(m.type)||u.includes(m.plot))&&g++}return g},r=h=>{let u=-1,d=-1/0;for(let f=0;f<n.length;f++){if(n[f]===-1/0||t.tiles[f].type!=="grass")continue;const g=n[f]+h(f)+this.rnd()*.5;g>d&&(d=g,u=f)}return u},o=[],a=(h,u)=>{const d=r(u);d<0||(t.tiles[d].type="plot",t.tiles[d].plot=h,o.push(h))},l=this.villageCount("cottage"),c=[];l>=Pr.marketAfter&&!this.villageCount("market")&&!t.tiles.some(h=>h.plot==="market")&&c.push("market"),c.push("cottage"),l>0&&c.push("farm");for(const h of c.slice(0,Pr.maxPlots-e))h==="farm"?a(h,u=>i(u,["cottage","farm"])*6):a(h,u=>i(u,["cottage","market"])*3);return o}occupancy(t,e=null){let n=0;for(const i of this.archers){if(i===e)continue;(i.path.length?i.path[i.path.length-1]:i.tile)===t&&n++}return n}hasRoom(t,e=null){return this.world.isRampart(t)&&this.occupancy(t,e)<this.world.slots(t)}canPlaceArcher(t){return this.phase!=="won"&&this.phase!=="lost"&&this.gold>=tn.cost&&this.hasRoom(t)}placeArcher(t){return this.canPlaceArcher(t)?(this.gold-=tn.cost,this.addArcher(t),this.sfx("recruit",...this.center(t)),!0):!1}addArcher(t){if(!this.hasRoom(t))return null;const{world:e}=this,n={id:this.nextId++,kind:"archer",tile:t,post:t,path:[],hp:tn.hp,maxHp:tn.hp,ox:(this.rnd()-.5)*.3,oy:(this.rnd()-.5)*.3,x:t%e.w+.5,y:(t/e.w|0)+.5,z:e.surface(t),cd:0,think:this.rnd()*Lr,heading:Math.PI/2,flash:0};return n.x+=n.ox,n.y+=n.oy,this.archers.push(n),n}rehouse(t){const{world:e}=this,n=e.keep;for(let i=n.y;i<n.y+oe.size;i++)for(let r=n.x;r<n.x+oe.size;r++){const o=e.idx(r,i);if(this.hasRoom(o,t)){t.tile=t.post=o,t.path=[],t.x=r+.5+t.ox,t.y=i+.5+t.oy,t.z=e.surface(o);return}}this.archers=this.archers.filter(i=>i!==t),this.gold+=tn.cost}range(t){return tn.range+this.world.perch(t)}enemyInRange(t){const[e,n]=this.center(t),i=this.range(t)**2;return this.enemies.some(r=>!r.dead&&(r.x-e)**2+(r.y-n)**2<=i)}rampartPath(t,e){const{world:n}=this,i=new Map([[t.tile,-1]]),r=[t.tile];for(let o=0;o<r.length&&o<qh;o++){const a=r[o];if(a!==t.tile&&e(a)){const h=[];for(let u=a;u!==t.tile;u=i.get(u))h.push(u);return h.reverse()}const l=a%n.w,c=a/n.w|0;for(const[h,u]of Ki){const d=l+h,f=c+u;if(!n.inBounds(d,f))continue;const g=n.idx(d,f);i.has(g)||!n.isRampart(g)||(i.set(g,a),r.push(g))}}return null}updateArcher(t,e){const{world:n}=this;if(!n.isRampart(t.tile)){t.dead=!0;return}if(t.cd-=e,t.think-=e,t.flash=Math.max(0,t.flash-e),t.path.length){const r=t.path[0];if(!n.isRampart(r))t.path=[];else{const o=r%n.w+.5+t.ox,a=(r/n.w|0)+.5+t.oy,l=o-t.x,c=a-t.y,h=Math.hypot(l,c),u=tn.speed*e;t.heading=Math.atan2(c,l),h<=u?(t.x=o,t.y=a,t.tile=t.path.shift()):(t.x+=l/h*u,t.y+=c/h*u);const d=n.surfaceAt(h<.5?r:t.tile,t.x,t.y);t.z+=(d-t.z)*Math.min(1,e*10);return}}t.z+=(n.surfaceAt(t.tile,t.x,t.y)-t.z)*Math.min(1,e*10);const i=this.pickTarget(t.x,t.y,this.range(t.tile));if(i){t.heading=Math.atan2(i.y-t.y,i.x-t.x),t.cd<=0&&(t.cd=1/tn.fireRate,this.shoot(t.x,t.y,t.z+.5,i,tn.damage,!1),this.sfx("bow",t.x,t.y));return}if(!(t.think>0)){if(t.think=Lr,this.phase==="attack"){const r=this.rampartPath(t,o=>this.hasRoom(o,t)&&this.enemyInRange(o));r&&(t.path=r)}else if(t.tile!==t.post){const r=this.rampartPath(t,o=>o===t.post);r?t.path=r:t.post=t.tile}}}troopPassable(t){const e=this.world.tiles[t].type;return this.world.isWalkable(t)||e==="gate"}stairFace(t){return this.world.stairFace(t)}troopNext(t){const{world:e}=this,n=t>>1,i=t&1,r=e.keep,o=n%e.w,a=n/e.w|0,l=[];for(const[c,h]of Ki){const u=o+c,d=a+h;if(!e.inBounds(u,d))continue;const f=e.idx(u,d);i?e.isRampart(f)?l.push(f*2+1):(e.tiles[f].type==="stair"&&this.stairFace(f)===n||n===r.door&&f===r.step)&&l.push(f*2):(this.troopPassable(f)&&l.push(f*2),e.isRampart(f)&&(e.tiles[n].type==="stair"&&this.stairFace(n)===f||n===r.step&&f===r.door)&&l.push(f*2+1))}return l}troopRoute(t,e,n=900){if(t===e)return[];const i=new Map([[t,-1]]),r=[t];for(let o=0;o<r.length&&o<n;o++){const a=r[o];if(a===e){const l=[];for(let c=a;c!==t;c=i.get(c))l.push(c);return l.reverse()}for(const l of this.troopNext(a))i.has(l)||(i.set(l,a),r.push(l))}return null}troopPath(t,e,n=900){const i=this.troopRoute(t*2,e*2,n);return i&&i.map(r=>r>>1)}elevated(t){return t.z-this.world.heightAt(t.x,t.y)>.5}swordsmanOnTile(t){const e=t%this.world.w,n=t/this.world.w|0;return this.swordsmen.some(i=>!i.up&&i.x>e&&i.x<e+1&&i.y>n&&i.y<n+1)}canPlaceSwordsman(t){const{world:e}=this;return this.phase!=="won"&&this.phase!=="lost"&&this.gold>=$e.cost&&(e.isWalkable(t)&&!e.reserved[t]||e.isRampart(t))}placeSwordsman(t){if(!this.canPlaceSwordsman(t))return!1;this.gold-=$e.cost;const[e,n]=this.center(t),i=!this.world.isWalkable(t),r={id:this.nextId++,kind:"swordsman",post:t,postUp:i,up:i,x:e+(this.rnd()-.5)*.3,y:n+(this.rnd()-.5)*.3,z:0,hp:$e.hp,maxHp:$e.hp,r:$e.r,path:[],zone:null,target:null,think:0,heading:Math.PI/2,walk:0,fighting:!1,flash:0};return r.z=this.troopZ(r),this.swordsmen.push(r),this.sfx("recruit",e,n),!0}troopZ(t){const{world:e}=this,n=e.idxAt(t.x,t.y);if(t.up&&e.isRampart(n))return e.surfaceAt(n,t.x,t.y);const i=e.heightAt(t.x,t.y);if(e.tiles[n].type==="stair"){const r=this.stairFace(n);if(r>=0){const[o,a]=this.center(n),[l,c]=this.center(r),h=Math.max(0,Math.min(1,(t.x-o)*(l-o)+(t.y-a)*(c-a)+.5));return i+h*(e.surfaceAt(r,o+(l-o)/2,a+(c-a)/2)-i)}}return i}covers(t,e){const n=t.zone;if(!n){const[r,o]=this.center(t.post);return Math.hypot(e.x-r,e.y-o)<=$e.guard}const i=kh;return e.x>=n.x0-i&&e.x<=n.x1+1+i&&e.y>=n.y0-i&&e.y<=n.y1+1+i}orderSwordsmen(t,e,n=null){const{world:i}=this,r=this.swordsmen.filter(a=>t.includes(a.id));if(!r.length)return!1;let o=[];if(e){for(let a=e.y0;a<=e.y1;a++)for(let l=e.x0;l<=e.x1;l++){const c=i.idx(l,a);i.inBounds(l,a)&&i.isWalkable(c)&&o.push(c)}o.sort((a,l)=>a%i.w-l%i.w||a-l)}else n!==null&&(i.isWalkable(n)||i.isRampart(n))&&(o=[n]);return o.length?(r.forEach((a,l)=>{a.zone=e,a.post=o[Math.floor((l+.5)/r.length*o.length)],a.postUp=!i.isWalkable(a.post),a.think=0}),!0):!1}updateSwordsman(t,e){const{world:n}=this;t.flash=Math.max(0,t.flash-e),t.think-=e;let i=n.idxAt(t.x,t.y);t.up&&!n.isRampart(i)&&(t.up=!1),t.z+=(this.troopZ(t)-t.z)*Math.min(1,e*8);const[r,o]=this.center(t.post),a=i*2+(t.up?1:0),l=t.post*2+(t.postUp?1:0);if(t.think<=0){if(t.think=Lr,t.target=null,this.phase==="attack"){let v=1/0;for(const x of this.enemies){if(x.dead||x.gone||!this.covers(t,x))continue;const M=Math.hypot(x.x-t.x,x.y-t.y);M<v&&(v=M,t.target=x)}}let m=null;if(t.target){const v=t.target,x=n.idxAt(v.x,v.y);m=this.troopRoute(a,x*2+(this.elevated(v)&&n.isRampart(x)?1:0))}m||(t.target=null,m=this.troopRoute(a,l)),t.path=m||[]}const c=t.target;if(c&&!c.dead&&!c.gone&&Math.hypot(c.x-t.x,c.y-t.y)<=t.r+c.r+.3&&Math.abs(c.z-t.z)<.6){t.fighting=!0,t.heading=Math.atan2(c.y-t.y,c.x-t.x),t.walk+=e*8,this.hurt(c,$e.dps*e,!1),Math.random()<e*2&&this.sfx("clash",t.x,t.y);return}t.fighting=!1;const h=$e.speed*(t.up?1:n.slow(i));if(t.path.length){const[m,v]=this.center(t.path[0]>>1),x=m-t.x,M=v-t.y,A=Math.hypot(x,M),T=Math.min(A,h*e);A>1e-6&&(t.heading=Math.atan2(M,x),t.x+=x/A*T,t.y+=M/A*T,t.walk+=T*6),i=n.idxAt(t.x,t.y),i===t.path[0]>>1&&(t.up=!!(t.path[0]&1)),A-T<.3&&t.path.shift();return}let u=r,d=o;c&&!c.dead&&!c.gone&&(u=c.x,d=c.y);const f=u-t.x,g=d-t.y,_=Math.hypot(f,g);if(_<.05)return;const p=Math.min(_,h*e);t.heading=Math.atan2(g,f),t.walk+=p*6,this.tryMove(t,f/_*p,g/_*p)}startWave(){if(this.phase!=="build")return;const t=this.nextWave,e=To(t),n=this.activeSpawns(t),i=[],r=(a,l,c=0)=>{for(let h=0;h<l;h++)i.splice(c+Math.floor(this.rnd()*(i.length-c+1)),0,a)};for(let a=0;a<e.raider;a++)i.push("raider");r("ladder",e.ladder),r("brute",e.brute),r("bowman",e.bowman);const o=Math.floor(i.length/2);r("ram",e.ram,o),r("catapult",e.catapult,o),this.spawnQueue=i.map((a,l)=>({type:a,spawn:n[l%n.length],t:Math.floor(l/n.length)*Xh*Math.min(2,n.length)+1,hpMult:e.hpMult})),this.spawnQueue.sort((a,l)=>a.t-l.t),this.waveTime=0,this.phase="attack",this.emit("waveStart",{wave:t,spawns:n.map(a=>a.name)})}spawnEnemy({type:t,spawn:e,hpMult:n}){const i=this.makeEnemy(t,e.x+.5+(this.rnd()-.5)*.4,e.y+.5+(this.rnd()-.5)*.4,n);return this.enemies.push(i),i}makeEnemy(t,e,n,i=1){const r=Yi[t],o=Math.round(r.hp*i),a={id:this.nextId++,type:t,x:e,y:n,z:this.world.heightAt(e,n),hp:o,maxHp:o,speed:r.speed*(.9+this.rnd()*.2),dps:r.dps,siege:r.siege,gold:r.gold,r:r.r,heading:0,attacking:!1,shooting:!1,fired:-9,cd:.5+this.rnd(),ammo:r.ammo||0,walk:this.rnd()*10,flash:0,dead:!1,stuck:0,raising:0};if(r.crew){a.members=[];for(let l=0;l<r.crew;l++){const c=Math.round(Yi.raider.hp*i);a.members.push({type:"raider",hp:c,maxHp:c})}}return a}update(t){this.time+=t;for(const e of this.floaters)e.t+=t;this.floaters=this.floaters.filter(e=>e.t<1.2);for(const e of this.effects)e.t+=t;this.effects=this.effects.filter(e=>e.t<e.life),this.world.dirty&&this.repath();for(const e of this.archers)this.updateArcher(e,t);for(const e of this.swordsmen)this.updateSwordsman(e,t);if(this.reapDefenders(),this.phase==="attack"){for(this.waveTime+=t;this.spawnQueue.length&&this.spawnQueue[0].t<=this.waveTime;)this.spawnEnemy(this.spawnQueue.shift());for(const e of this.enemies)this.updateEnemy(e,t);this.updateLadders(t),this.regroup(t),this.updateIntruders(t),this.separate(),this.updateTraps(t),this.updateProjectiles(t),this.reapDefenders();for(const e of this.enemies)e.dead&&(this.gold+=e.gold,this.floaters.push({x:e.x,y:e.y,z:e.z,text:`+${e.gold}`,t:0}));if(this.enemies=this.enemies.filter(e=>!e.dead&&!e.gone),this.world.keep.hp<=0){this.phase="lost",this.emit("lost",{wave:this.nextWave});return}!this.spawnQueue.length&&!this.enemies.length&&!this.intruders.length&&this.endWave()}}reapDefenders(){for(const t of[this.archers,this.swordsmen])for(const e of t)(e.dead||e.hp<=0)&&(e.dead=!0,this.sfx("fall",e.x,e.y));this.archers=this.archers.filter(t=>!t.dead),this.swordsmen=this.swordsmen.filter(t=>!t.dead)}repath(){this.flow=Ea(this.world),this.ladderFlow=Wh(this.world),this.ramFlow=Vh(this.world),this.world.dirty=!1}flowFor(t){if(Yi[t.type].siegeEngine)return this.ramFlow;if(t.type==="ladder")return this.ladderFlow;const e=this.world.idxAt(t.x,t.y);return isFinite(this.flow.dist[e])?this.flow:this.ladderFlow}climbs(t){return!Yi[t.type].siegeEngine&&t.type!=="ladder"}endWave(){this.wave++,this.projectiles=[];for(const i of this.ladders)this.world.tiles[i.tile].ladder=null;this.ladders=[],this.fallen=[],this.intruders=[],this.world.keep.doorHp=this.world.keep.doorMax,this.world.keep.inside=0,this.world.dirty=!0;for(const i of[...this.archers,...this.swordsmen])i.hp=i.maxHp;if(this.wave>=ci){this.phase="won",this.emit("won",{wave:this.wave});return}const t=Bh(this.wave),e=this.income();this.gold+=t+e,this.world.keep.hp=this.world.keep.maxHp,this.phase="build";const n=this.proposePlots();this.emit("waveEnd",{wave:this.wave,bonus:t,village:e,plots:n})}blockedAt(t,e,n,i=null){const{world:r}=this;if(t-n<0||e-n<0||t+n>=r.w||e+n>=r.h)return!0;const o=Math.floor(t-n),a=Math.floor(t+n),l=Math.floor(e-n),c=Math.floor(e+n);for(let h=l;h<=c;h++)for(let u=o;u<=a;u++){const d=r.idx(u,h);if(i==="troopUp"){if(!r.isRampart(d))return!0}else if(i==="troop"?!this.troopPassable(d):!r.isWalkable(d)&&!(i==="climb"&&r.tiles[d].ladder))return!0}return!1}tryMove(t,e,n){const i=t.r*.8,r=t.kind==="swordsman"?t.up?"troopUp":"troop":t.kind==="archer"?null:this.climbs(t)?"climb":null;e&&!this.blockedAt(t.x+e,t.y,i,r)&&(t.x+=e),n&&!this.blockedAt(t.x,t.y+n,i,r)&&(t.y+=n)}nearestDefender(t,e,n){let i=null,r=n;for(const o of[this.archers,this.swordsmen])for(const a of o){if(a.dead)continue;const l=Math.hypot(a.x-t,a.y-e);l<=r&&(r=l,i=a)}return i}catapultTarget(t,e){const{world:n}=this;let i=-1,r=1/0;const o=Math.max(0,Math.floor(t.x-e)),a=Math.min(n.w-1,Math.floor(t.x+e)),l=Math.max(0,Math.floor(t.y-e)),c=Math.min(n.h-1,Math.floor(t.y+e));for(let h=l;h<=c;h++)for(let u=o;u<=a;u++){const d=n.idx(u,h);if(!n.isSolid(d)||n.tiles[d].type==="keep")continue;const f=Math.hypot(u+.5-t.x,h+.5-t.y);if(f>e)continue;const g=n.tiles[d].type,_=f+(g==="tower"?-4:0);_<r&&(r=_,i=d)}return i}updateEnemy(t,e){var m,v;const{world:n}=this,i=Yi[t.type];t.flash=Math.max(0,t.flash-e),t.cd-=e;const r=n.idxAt(t.x,t.y),o=n.tiles[r].ladder?n.surfaceAt(r,t.x,t.y):n.heightAt(t.x,t.y);if(t.z+=(o-t.z)*Math.min(1,e*8),t.attacking=!1,t.shooting=!1,t.type==="bowman"){const x=this.nearestDefender(t.x,t.y,i.range);if(x){t.shooting=!0,t.heading=Math.atan2(x.y-t.y,x.x-t.x),t.cd<=0&&(t.cd=1/i.rate,this.shoot(t.x,t.y,t.z+.5,x,i.shot,!0),this.sfx("bow",t.x,t.y));return}}else if(t.type==="catapult"&&t.ammo>0){const x=this.catapultTarget(t,i.range);if(x>=0){t.shooting=!0;const[M,A]=this.center(x);t.heading=Math.atan2(A-t.y,M-t.x),t.cd<=0&&(t.cd=1/i.rate,t.fired=this.time,t.ammo--,this.lob(t,x,i),this.sfx("launch",t.x,t.y));return}}if(!i.noMelee&&i.dps>0){for(const x of this.swordsmen)if(!(x.dead||Math.hypot(x.x-t.x,x.y-t.y)>t.r+x.r+.3||Math.abs(x.z-t.z)>.6)){t.attacking=!0,t.heading=Math.atan2(x.y-t.y,x.x-t.x),t.walk+=e*6,x.hp-=t.dps*e,x.flash=.1;return}if(n.tiles[r].ladder){for(const x of this.archers)if(!(x.dead||Math.hypot(x.x-t.x,x.y-t.y)>t.r+.4)){t.attacking=!0,t.heading=Math.atan2(x.y-t.y,x.x-t.x),t.walk+=e*6,x.hp-=t.dps*e,x.flash=.1;return}}}const a=n.keep,l=a.x+1.5,c=a.y+oe.size;let u=this.flowFor(t).next[r];if(r===a.step||u<0){if(Math.hypot(l-t.x,c-t.y)<=t.r+(a.doorHp>0?.3:.7)){if(t.type==="ladder")return this.splitCrew(t);if(t.type==="catapult")return;t.heading=Math.atan2(c-t.y,l-t.x),a.doorHp>0?(t.attacking=!0,t.walk+=e*6,a.doorHp=Math.max(0,a.doorHp-t.dps*t.siege*e),a.doorHp<=0&&(this.effects.push({type:"dust",x:l,y:c,z:.4,t:0,life:.9,size:.8}),this.sfx("crumble",l,c),this.emit("doorBroken"))):this.climbs(t)&&(t.gone=!0,this.intruders.push({type:t.type,hp:t.hp,maxHp:t.maxHp,dps:t.dps,gold:t.gold,climb:oe.climb}),a.inside=this.intruders.length);return}this.walkToward(t,l,c,r,e);return}const[d,f]=this.center(u),g=n.tiles[u];if(n.isSolid(u)&&!(g.ladder&&this.climbs(t))&&Math.max(Math.abs(d-t.x),Math.abs(f-t.y))<=.5+t.r+.08){if(t.heading=Math.atan2(f-t.y,d-t.x),t.type==="catapult")return;if(t.type==="ladder"){if(g.ladder)return this.splitCrew(t);t.raising+=e,t.raising>=nn.raise&&this.raiseLadder(t,u);return}if(Sc.includes(g.type)&&!i.siegeEngine){t.stuck+=e;return}t.attacking=!0,t.walk+=e*6;const M=(m=wt[g.type])==null?void 0:m.thorns;M&&this.hurt(t,M*e,!1),this.damageStructure(u,t.dps*t.siege*e);return}t.stuck=0,this.walkToward(t,d,f,r,e);const _=n.idxAt(t.x,t.y),p=(v=wt[n.tiles[_].type])==null?void 0:v.trample;p&&this.damageStructure(_,p*e)}walkToward(t,e,n,i,r){const o=e-t.x,a=n-t.y,l=Math.hypot(o,a)||1,c=t.speed*(this.world.tiles[i].ladder?nn.climb:this.world.slow(i)),h=Math.min(l,c*r);t.heading=Math.atan2(a,o),t.walk+=r*c*6,this.tryMove(t,o/l*h,a/l*h)}raiseLadder(t,e){const{world:n}=this,[i,r]=this.center(e),o=i-t.x,a=r-t.y,l=Math.abs(o)>=Math.abs(a)?[Math.sign(o),0]:[0,Math.sign(a)],c={id:this.nextId++,tile:e,dir:l,hp:nn.hp,maxHp:nn.hp};this.ladders.push(c),n.tiles[e].ladder=c,n.dirty=!0,this.sfx("build",i,r),this.splitCrew(t)}splitCrew(t){t.gone=!0,t.members.forEach((e,n)=>{const i=this.makeEnemy(e.type,t.x+(n-.5)*.25,t.y+(n-.5)*.25);i.hp=Math.max(1,Math.round(e.hp*(t.hp/t.maxHp))),i.maxHp=e.maxHp,i.z=t.z,this.enemies.push(i)})}ladderGeom(t){const{world:e}=this,[n,i]=this.center(t.tile),o=e.tiles[t.tile].type==="wall"?wt.wall.thin/2:.5,a=n-t.dir[0]*o,l=i-t.dir[1]*o,c=e.surfaceAt(t.tile,a,l)+.12,h=a-t.dir[0]*.5,u=l-t.dir[1]*.5;return{fx:h,fy:u,fz:e.heightAt(h,u),tx:a,ty:l,tz:c}}updateLadders(t){const{world:e}=this;for(const n of this.ladders){const i=e.tiles[n.tile];nn.reach.includes(i.type)||(n.hp=0);const[r,o]=this.center(n.tile);for(const l of this.archers)!l.dead&&Math.abs(l.x-r)<1.4&&Math.abs(l.y-o)<1.4&&(n.hp-=nn.push*t);if(n.hp>0)continue;n.down=!0,i.ladder===n&&(i.ladder=null),e.dirty=!0;const a=this.ladderGeom(n);this.fallen.push({x:a.fx-n.dir[0]*.4,y:a.fy-n.dir[1]*.4,dir:n.dir}),this.sfx("crumble",r,o);for(const l of this.enemies)l.dead||l.gone||e.idxAt(l.x,l.y)!==n.tile||(l.x=a.fx-n.dir[0]*.2,l.y=a.fy-n.dir[1]*.2,this.hurt(l,25))}this.ladders=this.ladders.filter(n=>!n.down)}regroup(t){const e=this.enemies.filter(n=>!n.dead&&!n.gone&&n.stuck>.5&&(n.type==="raider"||n.type==="brute"));if(!(e.length<2))for(const n of e){if(n.gone)continue;const i=this.fallen.findIndex(a=>Math.hypot(a.x-n.x,a.y-n.y)<2);if(i<0&&n.stuck<nn.regroup)continue;const r=e.find(a=>a!==n&&!a.gone&&Math.hypot(a.x-n.x,a.y-n.y)<2.5);if(!r)continue;i>=0&&this.fallen.splice(i,1),n.gone=r.gone=!0;const o=this.makeEnemy("ladder",(n.x+r.x)/2,(n.y+r.y)/2);o.members=[n,r].map(a=>({type:a.type,hp:a.hp,maxHp:a.maxHp})),o.hp=n.hp+r.hp,o.maxHp=n.maxHp+r.maxHp,o.z=n.z,this.enemies.push(o)}}updateIntruders(t){const e=this.world.keep,n=this.intruders.filter(i=>(i.climb-=t)<=0);if(n.length){const i=this.swordsmen.filter(o=>!o.dead&&o.up&&this.world.tiles[this.world.idxAt(o.x,o.y)].type==="keep"),r=(oe.guard+i.length*$e.dps)/n.length*t;for(const[o,a]of n.entries()){const l=i[o%(i.length||1)];l?(l.hp-=a.dps*t,l.flash=.1,l.fighting=!0):e.hp=Math.max(0,e.hp-a.dps*t),a.hp-=r,a.hp<=0&&(a.dead=!0,this.gold+=a.gold,this.floaters.push({x:e.x+1.5,y:e.y+1.5,z:oe.height+.3,text:`+${a.gold}`,t:0}),this.sfx("fall",e.x+1.5,e.y+1.5))}Math.random()<t*3&&this.sfx("clash",e.x+1.5,e.y+1.5)}this.intruders=this.intruders.filter(i=>!i.dead),e.inside=this.intruders.length}damageStructure(t,e){const n=this.world.tiles[t].type;if(this.world.damage(t,e)&&n!=="keep"){const[i,r]=this.center(t);this.effects.push({type:"dust",x:i,y:r,z:.3,t:0,life:.9,size:1}),this.sfx("crumble",i,r)}}separate(){const t=[...this.enemies,...this.swordsmen];for(let e=0;e<t.length;e++)for(let n=e+1;n<t.length;n++){const i=t[e],r=t[n];if(Math.abs(i.z-r.z)>.5)continue;const o=r.x-i.x,a=r.y-i.y,l=(i.r+r.r)*.85,c=o*o+a*a;if(c>=l*l||c===0)continue;const h=Math.sqrt(c),u=(l-h)*.25,d=o/h,f=a/h;this.tryMove(i,-d*u,-f*u),this.tryMove(r,d*u,f*u)}}updateTraps(t){const{world:e}=this;for(const n of this.enemies)e.tiles[e.idxAt(n.x,n.y)].type==="trap"&&this.hurt(n,wt.trap.dps*t,!1)}hurt(t,e,n=!0){t.hp-=e,n&&(t.flash=.12),t.hp<=0&&(t.dead=!0)}pickTarget(t,e,n){const{world:i}=this;let r=null,o=1/0;for(const a of this.enemies){if(a.dead||(a.x-t)**2+(a.y-e)**2>n*n)continue;let l=this.flowFor(a).dist[i.idxAt(a.x,a.y)];isFinite(l)||(l=1e6),a.type==="catapult"&&(l-=20),l<o&&(o=l,r=a)}return r}coverFor(t){var e;return t.kind!=="archer"?1:(e=this.world.tiles[t.tile])!=null&&e.hoard?en.cover:Oh}shoot(t,e,n,i,r,o){const a=Math.hypot(i.x-t,i.y-e);this.projectiles.push({kind:"arrow",hostile:o,sx:t,sy:e,sz:n,tx:i.x,ty:i.y,tz:i.z+.4,x:t,y:e,z:n,px:t,py:e,pz:n,target:i,t:0,dur:Math.max(.15,a/Fh),dmg:r})}lob(t,e,n){const[i,r]=this.center(e),o=Math.hypot(i-t.x,r-t.y);this.projectiles.push({kind:"boulder",sx:t.x,sy:t.y,sz:t.z+.6,tx:i,ty:r,tz:this.world.surface(e),x:t.x,y:t.y,z:t.z+.6,px:t.x,py:t.y,pz:t.z+.6,tile:e,t:0,dur:.8+o*.12,dmg:n.boulder,splash:n.splash})}updateProjectiles(t){for(const e of this.projectiles){e.kind==="arrow"&&!e.target.dead&&(e.tx=e.target.x,e.ty=e.target.y,e.tz=e.target.z+.4),e.t=Math.min(1,e.t+t/e.dur),e.px=e.x,e.py=e.y,e.pz=e.z,e.x=e.sx+(e.tx-e.sx)*e.t,e.y=e.sy+(e.ty-e.sy)*e.t;const n=e.kind==="boulder"?2.5+e.dur:Math.min(1.5,e.dur*2);if(e.z=e.sz+(e.tz-e.sz)*e.t+Math.sin(e.t*Math.PI)*n,!(e.t<1))if(e.done=!0,e.kind==="boulder"){this.damageStructure(e.tile,e.dmg);for(const i of this.archers)Math.hypot(i.x-e.tx,i.y-e.ty)<.9&&(i.hp-=e.splash*(this.world.tiles[i.tile].hoard?en.splash:1),i.flash=.15);this.effects.push({type:"dust",x:e.tx,y:e.ty,z:e.tz,t:0,life:.7,size:.8}),this.sfx("impact",e.tx,e.ty)}else e.target.dead||(e.hostile?(e.target.hp-=e.dmg*this.coverFor(e.target),e.target.flash=.12):this.hurt(e.target,e.dmg),this.sfx("hit",e.tx,e.ty))}this.projectiles=this.projectiles.filter(e=>!e.done)}serialize(){const{world:t}=this;return{v:ll,seed:this.seed,map:t.snapshotMap(),wave:this.wave,gold:this.gold,types:t.tiles.map(e=>e.type==="tree"||e.type==="rock"||e.type==="grass"?"":e.type),hp:t.tiles.map(e=>Math.round(e.hp||0)),hoard:t.tiles.flatMap((e,n)=>e.hoard?[n]:[]),plots:t.tiles.flatMap((e,n)=>e.type==="plot"?[[n,e.plot]]:[]),archers:this.archers.map(e=>e.post),swordsmen:this.swordsmen.map(e=>({post:e.post,zone:e.zone})),savedAt:Date.now()}}static restore(t){if(!t||t.v!==ll)throw new Error("unsupported save");const e=new vr(t.seed,t.map),{world:n}=e;e.archers=[],n.tiles.forEach((i,r)=>{const o=t.types[r];o&&o!=="keep"&&o!=="plot"?(n.build(r,o),i.hp=Math.min(i.maxHp,t.hp[r]||i.maxHp)):o!=="keep"&&i.type==="plot"&&n.clear(r)});for(const i of t.hoard)n.tiles[i].hoard=!0;for(const[i,r]of t.plots)n.tiles[i].type="plot",n.tiles[i].plot=r;for(const i of t.archers)e.addArcher(i);e.gold=0;for(const i of t.swordsmen)e.gold=$e.cost,e.placeSwordsman(i.post)&&(e.swordsmen[e.swordsmen.length-1].zone=i.zone);return e.gold=t.gold,e.wave=t.wave,e.sounds.length=0,n.dirty=!0,e.repath(),e}}const Ao=Math.PI/180,Wn={elev:90*Ao,theta:0},Dr={elev:30*Ao,theta:45*Ao};let $h=class{constructor(t,e){this.mapW=t,this.mapH=e,this.fx=t/2,this.fy=e/2,this.zoom=1.2,this.minZoom=.4,this.maxZoom=3.5,this.mode="top",this.elev=Wn.elev,this.theta=Wn.theta,this.targetElev=Wn.elev,this.targetTheta=Wn.theta,this.vw=1,this.vh=1,this.sx=0,this.sy=0,this.updateTrig()}setViewport(t,e){this.vw=t,this.vh=e}setMode(t){t!==this.mode&&(this.mode=t,t==="top"?(this.targetTheta=Math.round(this.theta/(2*Math.PI))*2*Math.PI,this.targetElev=Wn.elev):(this.targetTheta=this.theta+Dr.theta,this.targetElev=Dr.elev))}rotateBy(t){this.mode==="iso"&&(this.targetTheta+=t)}twist(t){this.mode==="iso"&&(this.theta+=t,this.targetTheta+=t)}get transitioning(){return Math.abs(this.elev-this.targetElev)>.002||Math.abs(this.theta-this.targetTheta)>.002}update(t){const e=1-Math.exp(-t*7);this.elev+=(this.targetElev-this.elev)*e,this.theta+=(this.targetTheta-this.theta)*e,this.transitioning||(this.elev=this.targetElev,this.theta=this.targetTheta),this.updateTrig()}updateTrig(){this.cosT=Math.cos(this.theta),this.sinT=Math.sin(this.theta),this.sinE=Math.sin(this.elev),this.cosE=Math.cos(this.elev),this.k=Cr*this.zoom}get tilt(){return(Wn.elev-this.elev)/(Wn.elev-Dr.elev)}P(t,e,n=0){const i=t-this.fx,r=e-this.fy,o=i*this.cosT-r*this.sinT,a=i*this.sinT+r*this.cosT;this.sx=this.vw/2+o*this.k,this.sy=this.vh/2+(a*this.sinE-n*this.cosE)*this.k}depth(t,e){return(t-this.fx)*this.sinT+(e-this.fy)*this.cosT}faceVisible(t,e){return this.cosE>.01&&t*this.sinT+e*this.cosT>.001}unproject(t,e){const n=(t-this.vw/2)/this.k,i=(e-this.vh/2)/this.k/this.sinE;return{x:this.fx+n*this.cosT+i*this.sinT,y:this.fy-n*this.sinT+i*this.cosT}}panBy(t,e){const n=this.unproject(0,0),i=this.unproject(t,e);this.fx-=i.x-n.x,this.fy-=i.y-n.y,this.clampFocus()}zoomAt(t,e,n){const i=this.unproject(e,n);this.zoom=Math.min(this.maxZoom,Math.max(this.minZoom,this.zoom*t)),this.updateTrig();const r=this.unproject(e,n);this.fx+=i.x-r.x,this.fy+=i.y-r.y,this.clampFocus()}clampFocus(){this.fx=Math.min(this.mapW,Math.max(0,this.fx)),this.fy=Math.min(this.mapH,Math.max(0,this.fy))}fit(t=160,e=90){const n=(this.vw-t)/(this.mapW*Cr),i=(this.vh-e)/(this.mapH*Cr);return this.minZoom=Math.min(.4,Math.min(n,i)*.8),Math.min(n,i)}};const xe=128;function Ta(s){let t=s;return()=>(t=t*16807%2147483647,t/2147483647)}function un([s,t,e],n){return`rgb(${Math.min(255,s*n)|0},${Math.min(255,t*n)|0},${Math.min(255,e*n)|0})`}function Ec(s,t,e,n,i,r){for(let o=0;o<e;o++)s.fillStyle=un(n,i+t()*(r-i)),s.fillRect(t()*xe,t()*xe,1+t()*2,1+t()*2)}const wn={};function Tc(){if(wn.stone)return wn.stone;const s=document.createElement("canvas");s.width=s.height=xe;const t=s.getContext("2d"),e=Ta(4242),n=[190,182,164];t.fillStyle=un(n,.62),t.fillRect(0,0,xe,xe);const i=4,r=xe/i;for(let o=0;o<i;o++){let a=o%2?-xe/6:0;for(;a<xe;){const l=xe*(.26+e()*.16),c=.86+e()*.24;for(const h of[0,xe]){const u=a-h;t.fillStyle=un(n,c),t.fillRect(u+1.5,o*r+1.5,l-3,r-3),t.fillStyle=un(n,c*1.12),t.fillRect(u+1.5,o*r+1.5,l-3,2),t.fillStyle=un(n,c*.8),t.fillRect(u+1.5,o*r+r-3.5,l-3,2)}a+=l}}return Ec(t,e,420,n,.7,1.15),wn.stone=s,s}function Yh(){if(wn.flag)return wn.flag;const s=document.createElement("canvas");s.width=s.height=xe;const t=s.getContext("2d"),e=Ta(777),n=[184,176,158];t.fillStyle=un(n,.6),t.fillRect(0,0,xe,xe);const i=3,r=xe/i;for(let o=0;o<i;o++)for(let a=0;a<i;a++){const l=.85+e()*.25,c=()=>(e()-.5)*6;t.fillStyle=un(n,l),t.beginPath(),t.moveTo(a*r+2+c(),o*r+2+c()),t.lineTo((a+1)*r-2+c(),o*r+2+c()),t.lineTo((a+1)*r-2+c(),(o+1)*r-2+c()),t.lineTo(a*r+2+c(),(o+1)*r-2+c()),t.closePath(),t.fill()}return Ec(t,e,300,n,.72,1.12),wn.flag=s,s}function Ac(){if(wn.wood)return wn.wood;const s=document.createElement("canvas");s.width=s.height=xe;const t=s.getContext("2d"),e=Ta(99),n=[150,102,58],i=6,r=xe/i;for(let o=0;o<i;o++){const a=.85+e()*.25;t.fillStyle=un(n,a),t.fillRect(o*r,0,r,xe);for(let l=0;l<6;l++)t.fillStyle=un(n,a*(.8+e()*.15)),t.fillRect(o*r+e()*r,0,1,xe);t.fillStyle=un(n,.55),t.fillRect(o*r,0,1.5,xe)}return wn.wood=s,s}const cl=xe,Ro={stone:182,flag:176,wood:108},pt={grass:[[76,114,53],[80,119,56],[73,109,51],[83,123,58]],hillTop:[[96,132,62],[101,138,66]],hillSide:[120,96,64],marsh:[[78,92,52],[72,86,48]],shallows:[92,140,138],water:[44,92,128],moat:[38,78,110],moatEdge:[96,84,66],reed:[120,132,70],wall:{side:[138,132,118],top:[176,168,151]},thick:{side:[128,122,108],top:[170,161,143],walk:[146,139,124]},tower:{side:[125,118,104],top:[170,161,143]},keep:{side:[112,106,95],top:[158,149,132]},palisade:{side:[128,90,52],top:[162,120,74]},pike:[140,100,60],pikeTip:[226,214,186],door:[112,72,40],ladder:[168,124,74],lord:[120,48,120],crown:[236,196,70],bowman:[74,96,52],catapult:[128,92,54],boulder:[128,124,116],shield:[178,146,62],hoard:[122,84,46],plaster:[222,204,168],roof:[150,72,50],soil:[118,88,56],crop:[196,176,74],sprout:[112,150,60],awning:[182,58,48],awningAlt:[236,224,196],rock:{side:[110,108,102],top:[150,147,140]},trunk:[92,60,32],leaf:[44,98,42],leafHi:[62,124,52],dirt:[110,86,58],raider:[205,92,30],brute:[140,40,44],ram:[118,82,48],skin:[226,184,140],banner:[196,48,40],player:[52,92,170]},Ci=(()=>{const e=Math.hypot(-.55,.83);return[-.55/e,.83/e]})(),di=[[0,-1],[1,0],[0,1],[-1,0]],Ur=new Set(["palisade","wall","thick","gate","tower","keep"]);function kt(s,t=1,e=1){const n=Math.min(255,s[0]*t)|0,i=Math.min(255,s[1]*t)|0,r=Math.min(255,s[2]*t)|0;return e===1?`rgb(${n},${i},${r})`:`rgba(${n},${i},${r},${e})`}function he(s,t){return[s[0]*t,s[1]*t,s[2]*t]}const hl=s=>.3*s[0]+.59*s[1]+.11*s[2];function Rs(s,t){return .62+.3*Math.max(0,s*Ci[0]+t*Ci[1])}const Kh=[[0,-1,0,1],[1,0,1,2],[0,1,2,3],[-1,0,3,0]];class Zh{constructor(t,e){this.canvas=t,this.ctx=t.getContext("2d"),this.cam=e,this.dpr=1}resize(){const t=Math.min(2,window.devicePixelRatio||1),e=window.innerWidth,n=window.innerHeight;this.canvas.width=Math.round(e*t),this.canvas.height=Math.round(n*t),this.canvas.style.width=`${e}px`,this.canvas.style.height=`${n}px`,this.dpr=t,this.cam.setViewport(e,n)}poly(t){const{ctx:e,cam:n}=this;e.beginPath();for(let i=0;i<t.length;i+=3)n.P(t[i],t[i+1],t[i+2]),i===0?e.moveTo(n.sx,n.sy):e.lineTo(n.sx,n.sy);e.closePath()}box(t,e,n,i,r,o,a,l,c=0,h=!0,u=null){const{ctx:d,cam:f}=this,g=[t,n,n,t],_=[e,e,i,i],p=typeof r=="function"?g.map((M,A)=>r(M,_[A])):[r,r,r,r],m=typeof o=="function"?g.map((M,A)=>o(M,_[A])):[o,o,o,o],v=u?Ro[u]:0;if(f.cosE>.01)for(let M=0;M<4;M++){if(c&1<<M)continue;const[A,T,E,P]=Kh[M];f.faceVisible(A,T)&&(this.poly([g[E],_[E],p[E],g[P],_[P],p[P],g[P],_[P],m[P],g[E],_[E],m[E]]),u?this.texFace(g[E],_[E],g[P],_[P],u,Rs(A,T)*hl(a)/v):(d.fillStyle=kt(a,Rs(A,T)),d.fill()))}this.poly([t,e,m[0],n,e,m[1],n,i,m[2],t,i,m[3]]);const x=(m[0]+m[1]+m[2]+m[3])/4;u?this.texTop(x,u==="wood"?"wood":"flag",hl(l)/Ro[u==="wood"?"wood":"flag"]):(d.fillStyle=kt(l),d.fill()),h&&(d.strokeStyle="rgba(30,24,16,0.35)",d.lineWidth=1,d.stroke())}pattern(t){if(this.patterns||(this.patterns={}),!this.patterns[t]){const e=t==="stone"?Tc():t==="flag"?Yh():Ac();this.patterns[t]=this.ctx.createPattern(e,"repeat")}return this.patterns[t]}texFace(t,e,n,i,r,o){const{ctx:a,cam:l}=this,c=Math.hypot(n-t,i-e);if(c<1e-6)return;l.P(t,e,0);const h=l.sx,u=l.sy;l.P(n,i,0);const d=(l.sx-h)/c,f=(l.sy-u)/c;l.P(t,e,-1);const g=l.sx-h,_=l.sy-u,p=(t*(n-t)+e*(i-e))/c,m=this.dpr/cl;a.save(),a.setTransform(d*m,f*m,g*m,_*m,this.dpr*(h-d*p),this.dpr*(u-f*p)),a.fillStyle=this.pattern(r),a.fill(),a.restore(),this.shadeFill(o)}texTop(t,e,n){const{ctx:i,cam:r}=this,o=r.k,a=r.cosT*o,l=r.sinT*r.sinE*o,c=-r.sinT*o,h=r.cosT*r.sinE*o,u=r.vw/2-(r.fx*a+r.fy*c),d=r.vh/2-(r.fx*l+r.fy*h)-t*r.cosE*o,f=this.dpr/cl;i.save(),i.setTransform(a*f,l*f,c*f,h*f,this.dpr*u,this.dpr*d),i.fillStyle=this.pattern(e),i.fill(),i.restore(),this.shadeFill(n)}shadeFill(t){const e=Math.max(0,Math.min(.85,1-t));e<.01||(this.ctx.fillStyle=`rgba(16,12,8,${e.toFixed(3)})`,this.ctx.fill())}orientedBox(t,e,n,i,r,o,a,l,c){const{ctx:h,cam:u}=this,d=Math.cos(r),f=Math.sin(r),_=[[n,-i],[n,i],[-n,i],[-n,-i]].map(([p,m])=>[t+p*d-m*f,e+p*f+m*d]);for(let p=0;p<4;p++){const m=_[p],v=_[(p+1)%4];let x=v[1]-m[1],M=-(v[0]-m[0]);const A=Math.hypot(x,M);x/=A,M/=A,u.faceVisible(x,M)&&(this.poly([m[0],m[1],o,v[0],v[1],o,v[0],v[1],a,m[0],m[1],a]),h.fillStyle=kt(l,Rs(x,M)),h.fill())}this.poly(_.flatMap(([p,m])=>[p,m,a])),h.fillStyle=kt(c),h.fill(),h.strokeStyle="rgba(30,20,10,0.4)",h.stroke()}ellipse(t,e,n,i,r){const{ctx:o,cam:a}=this;a.P(t,e,n),o.beginPath(),o.ellipse(a.sx,a.sy,i*a.k,i*a.k*a.sinE,0,0,Math.PI*2),o.fillStyle=r,o.fill()}ball(t,e,n,i,r,o){const{ctx:a,cam:l}=this;l.P(t,e,n),a.beginPath(),a.arc(l.sx,l.sy,Math.max(.5,i*l.k),0,Math.PI*2),a.fillStyle=r,a.fill(),o&&(a.strokeStyle=o,a.lineWidth=Math.max(1,l.k*.03),a.stroke())}line(t,e,n,i,r,o,a,l){const{ctx:c,cam:h}=this;c.beginPath(),h.P(t,e,n),c.moveTo(h.sx,h.sy),h.P(i,r,o),c.lineTo(h.sx,h.sy),c.strokeStyle=a,c.lineWidth=l,c.stroke()}pathQuad(t,e,n,i,r=0){const{ctx:o,cam:a}=this;a.P(t,e,r),o.moveTo(a.sx,a.sy),a.P(n,e,r),o.lineTo(a.sx,a.sy),a.P(n,i,r),o.lineTo(a.sx,a.sy),a.P(t,i,r),o.lineTo(a.sx,a.sy),o.closePath()}onScreen(t,e,n=3){const{cam:i}=this;i.P(t,e,0);const r=n*i.k;return i.sx>-r&&i.sx<i.vw+r&&i.sy>-r*1.5&&i.sy<i.vh+r}render(t,e){const{ctx:n,cam:i}=this,{world:r}=t;n.setTransform(this.dpr,0,0,this.dpr,0,0);const o=n.createLinearGradient(0,0,0,i.vh);o.addColorStop(0,"#1d2a22"),o.addColorStop(1,"#0f1712"),n.fillStyle=o,n.fillRect(0,0,i.vw,i.vh),this.drawGround(r,t.time),e.showGrid&&this.cam.sinE>.97&&this.drawGrid(r),this.drawSpawns(t),e.orders&&this.drawOrders(t,e.orders);const a=new Map,l=(h,u)=>{const d=r.idxAt(h.x,h.y);a.has(d)||a.set(d,[]),a.get(d).push({u:h,kind:u})};for(const h of t.enemies)l(h,0);for(const h of t.archers)l(h,1);for(const h of t.swordsmen)l(h,2);this.openGates=new Set(t.swordsmen.map(h=>r.idxAt(h.x,h.y)));const c=[];for(let h=0;h<r.tiles.length;h++){if(!(r.tiles[h].type!=="grass"||this.slopes[h]||a.has(h)))continue;const f=h%r.w,g=h/r.w|0;this.onScreen(f+.5,g+.5)&&c.push({d:i.depth(f+.5,g+.5),i:h,x:f,y:g})}for(const h of t.ladders){const u=t.ladderGeom(h);c.push({d:i.depth((u.fx+u.tx)/2,(u.fy+u.ty)/2),ladder:u})}for(const h of t.fallen)c.push({d:i.depth(h.x,h.y)-.01,fallen:h});c.sort((h,u)=>h.d-u.d);for(const{i:h,x:u,y:d,ladder:f,fallen:g}of c){if(f){this.drawLadder(f.fx,f.fy,f.fz,f.tx,f.ty,f.tz);continue}if(g){const v=r.heightAt(g.x,g.y)+.03,[x,M]=g.dir;this.drawLadder(g.x+x*.55,g.y+M*.55,v,g.x-x*.55,g.y-M*.55,v);continue}const _=r.groundElev(h);this.slopes[h]&&this.drawSlope(r,h,u,d);const p=r.tiles[h];this.footZ=p.rock?r.baseElev(h):null,this.minFoot=r.minGround(h),p.rock&&this.drawFoundation(u,d,_,this.footZ,p.v),this.drawTile(r,h,u,d,_,t.time),this.footZ=null;const m=a.get(h);if(m){m.sort((v,x)=>i.depth(v.u.x,v.u.y)-i.depth(x.u.x,x.u.y));for(const{u:v,kind:x}of m)x===0?this.drawEnemy(v,t.time):x===1?this.drawArcher(v,t.time):this.drawSwordsman(v)}}for(const h of t.projectiles)h.kind==="boulder"?this.drawBoulder(h):this.drawArrow(h);for(const h of t.effects)this.drawEffect(h);e.preview&&this.drawPreview(t,e.preview),this.drawBars(t),this.drawPlotTags(t),this.drawFloaters(t)}renderOverlay(t,e){const{ctx:n,cam:i}=this,{world:r}=t;n.setTransform(this.dpr,0,0,this.dpr,0,0),n.clearRect(0,0,i.vw,i.vh),e.showGrid&&this.cam.sinE>.97&&this.drawGrid(r),e.orders&&this.drawOrders(t,e.orders);for(const o of t.effects)this.drawEffect(o);e.preview&&this.drawPreview(t,e.preview),this.drawBars(t),this.drawPlotTags(t),this.drawFloaters(t)}groundColor(t){const e=Math.floor(t.v*4);switch(t.terrain){case"marsh":return pt.marsh[e&1];case"shallows":return pt.shallows;case"water":return pt.water;default:return pt.grass[e]}}drawGround(t,e){const{ctx:n}=this,{w:i,h:r}=t,o=t.tiles.map(p=>p.terrain[0]+p.type+(p.rock?"r":"")).join(",");if(o!==this.groundSig){this.groundSig=o,this.bakeGround(t),this.slopes=new Uint8Array(t.tiles.length);for(let p=0;p<t.tiles.length;p++)this.slopes[p]=t.sloped(p)?1:0;this.groundPattern=null}const{cam:a}=this,l=a.k,c=a.cosT*l,h=a.sinT*a.sinE*l,u=-a.sinT*l,d=a.cosT*a.sinE*l,f=a.vw/2-(a.fx*c+a.fy*u),g=a.vh/2-(a.fx*h+a.fy*d),_=this.dpr;n.save(),n.setTransform(_*c,_*h,_*u,_*d,_*f,_*g),n.imageSmoothingEnabled=!0,n.drawImage(this.groundCanvas,0,0,i,r),n.restore(),n.beginPath();for(let p=0;p<t.tiles.length;p++){const m=t.tiles[p];if(m.terrain!=="water"&&m.terrain!=="shallows"&&m.type!=="moat")continue;const v=p%i,x=p/i|0,M=(e*.4+m.v*7)%1,A=x+.2+M*.6,T=v+.2+m.v*.3;this.cam.P(T,A),n.moveTo(this.cam.sx,this.cam.sy),this.cam.P(T+.3,A),n.lineTo(this.cam.sx,this.cam.sy)}n.strokeStyle="rgba(200,230,255,0.25)",n.lineWidth=Math.max(1,l*.04),n.stroke();for(let p=0;p<t.tiles.length;p++){const m=t.tiles[p];if(m.terrain!=="marsh"||m.type!=="grass")continue;const v=p%i,x=p/i|0;for(let M=0;M<3;M++){const A=v+.2+m.v*(M+3)*7%.6,T=x+.2+m.v*(M+5)*11%.6;this.line(A,T,0,A+.03,T,.3,kt(pt.reed),Math.max(1,l*.035))}}}shadowCasters(t){const e=[],n=t.keep;for(let i=0;i<t.tiles.length;i++){const r=t.tiles[i],o=i%t.w,a=i/t.w|0,l=(c,h,u,d,f)=>e.push([o+c,a+h,o+u,a+d,f]);switch(r.type){case"palisade":case"wall":{const c=wt[r.type],h=c.thin/2;l(.5-h,.5-h,.5+h,.5+h,c.height),this.connects(t,o,a,0)&&l(.5-h,0,.5+h,.5,c.height),this.connects(t,o,a,1)&&l(.5,.5-h,1,.5+h,c.height),this.connects(t,o,a,2)&&l(.5-h,.5,.5+h,1,c.height),this.connects(t,o,a,3)&&l(0,.5-h,.5,.5+h,c.height);break}case"thick":case"gate":l(0,0,1,1,wt[r.type].height);break;case"tower":l(.04,.04,.96,.96,wt.tower.height);break;case"keep":o===n.x&&a===n.y&&e.push([o,a,o+3,a+3,oe.height]);break;case"tree":l(.25,.25,.75,.75,1.3);break;case"rock":l(.15,.2,.85,.85,.5);break;case"cottage":l(.18,.24,.82,.76,.8);break;case"market":l(.12,.2,.88,.8,.9);break;case"pikes":l(.1,.3,.9,.7,.45);break}}return e}bakeGround(t){const{w:n,h:i}=t;this.groundW=n;const r=this.groundCanvas||(this.groundCanvas=document.createElement("canvas"));r.width=n*24,r.height=i*24;const o=r.getContext("2d");let a=1;const l=()=>(a=a*16807%2147483647,a/2147483647);for(let f=0;f<t.tiles.length;f++){const g=t.tiles[f],_=f%n*24,p=(f/n|0)*24,m=g.type==="moat"?pt.moatEdge:g.terrain==="hill"?pt.hillTop[0]:this.groundColor(g);if(o.fillStyle=kt(m),o.fillRect(_,p,24,24),a=f*7919+13,g.terrain==="water"||g.terrain==="shallows"){for(let v=0;v<3;v++)o.fillStyle=kt(m,1.08+l()*.1,.5),o.fillRect(_+l()*24,p+l()*24,4+l()*6,1);continue}for(let v=0;v<16;v++){o.fillStyle=kt(m,.8+l()*.38);const x=1+l()*2;o.fillRect(_+l()*24,p+l()*24,x,x)}if(g.terrain==="grass"&&g.type!=="moat"){o.strokeStyle=kt(m,1.22),o.lineWidth=1,o.beginPath();for(let v=0;v<5;v++){const x=_+l()*24,M=p+l()*24;o.moveTo(x,M),o.lineTo(x-1+l()*2,M-3-l()*2)}o.stroke()}else if(g.terrain==="marsh")for(let v=0;v<2;v++)o.fillStyle="rgba(40,60,50,0.35)",o.beginPath(),o.ellipse(_+l()*24,p+l()*24,2+l()*4,1.5+l()*2,0,0,Math.PI*2),o.fill()}o.fillStyle=kt(pt.moat);for(let f=0;f<t.tiles.length;f++){if(t.tiles[f].type!=="moat")continue;const g=f%n,_=f/n|0,p=(T,E)=>{if(!t.inBounds(g+T,_+E))return!1;const P=t.tiles[t.idx(g+T,_+E)];return P.type==="moat"||P.terrain==="water"||P.terrain==="shallows"},m=.14,v=p(-1,0)?g:g+m,x=p(0,-1)?_:_+m,M=p(1,0)?g+1:g+1-m,A=p(0,1)?_+1:_+1-m;o.fillRect(v*24,x*24,(M-v)*24,(A-x)*24)}const c=this.shadowCanvas||(this.shadowCanvas=document.createElement("canvas"));c.width=r.width,c.height=r.height;const h=c.getContext("2d");h.clearRect(0,0,c.width,c.height),h.fillStyle="#000";const u=-Ci[0]*.45,d=-Ci[1]*.45;for(const[f,g,_,p,m]of this.shadowCasters(t)){for(let v=0;v<=1.001;v+=.2){const x=u*m*v,M=d*m*v;h.fillRect((f+x)*24,(g+M)*24,(_-f)*24,(p-g)*24)}h.fillRect((f-.08)*24,(g-.08)*24,(_-f+.16)*24,(p-g+.16)*24)}o.save(),o.globalAlpha=.045;for(let f=-2;f<=2;f++)for(let g=-2;g<=2;g++)o.drawImage(c,g*2,f*2);o.restore()}drawGrid(t){const{ctx:e,cam:n}=this;e.beginPath();for(let i=0;i<=t.w;i++)n.P(i,0),e.moveTo(n.sx,n.sy),n.P(i,t.h),e.lineTo(n.sx,n.sy);for(let i=0;i<=t.h;i++)n.P(0,i),e.moveTo(n.sx,n.sy),n.P(t.w,i),e.lineTo(n.sx,n.sy);e.strokeStyle="rgba(255,255,255,0.07)",e.lineWidth=1,e.stroke(),e.beginPath();for(let i=0;i<t.tiles.length;i++)t.reserved[i]&&this.pathQuad(i%t.w,i/t.w|0,i%t.w+1,(i/t.w|0)+1);e.fillStyle="rgba(200,60,40,0.12)",e.fill()}drawSpawns(t){const e=t.activeSpawns(t.wave+1),n=.5+.5*Math.sin(t.time*4);for(const i of t.world.spawns){const r=e.includes(i),o=i.x+.5,a=i.y+.5;r&&this.ellipse(o,a,0,.7+n*.15,`rgba(220,60,40,${.18+n*.12})`),this.line(o,a,0,o,a,1.6,"#3a2a1a",Math.max(1.5,this.cam.k*.06)),this.poly([o,a,1.6,o+.55,a,1.45,o,a,1.15]),this.ctx.fillStyle=r?kt(pt.banner):"rgba(120,110,100,0.8)",this.ctx.fill(),this.cam.cosE<.05&&this.ball(o,a,0,.22,r?kt(pt.banner):"#777","#2a1a10")}}drawSlope(t,e,n,i){const r=t.groundElev(e),o=[(r+t.groundAt(n,i-1))/2,(r+t.groundAt(n+1,i))/2,(r+t.groundAt(n,i+1))/2,(r+t.groundAt(n-1,i))/2],a=[t.cornerHeight(n,i),t.cornerHeight(n+1,i),t.cornerHeight(n+1,i+1),t.cornerHeight(n,i+1)],l=[[n,i,a[0]],[n+.5,i,o[0]],[n+1,i,a[1]],[n+1,i+.5,o[1]],[n+1,i+1,a[2]],[n+.5,i+1,o[2]],[n,i+1,a[3]],[n,i+.5,o[3]]];if(l.every(h=>h[2]===r)){if(r===0)return;this.groundTri([n,i,r],[n+1,i,r],[n+1,i+1,r],[n,i+1,r]);return}const c=[n+.5,i+.5,r];for(let h=0;h<8;h++)this.groundTri(c,l[h],l[(h+1)%8])}groundTri(...t){const{ctx:e,cam:n}=this,i=t.map(([K,V,ut])=>(n.P(K,V,ut),[n.sx,n.sy])),[r,o,a]=t,[l,c,h]=i,u=(o[0]-r[0])*(a[1]-r[1])-(a[0]-r[0])*(o[1]-r[1]);if(Math.abs(u)<1e-9)return;const d=((c[0]-l[0])*(a[1]-r[1])-(h[0]-l[0])*(o[1]-r[1]))/u,f=((h[0]-l[0])*(o[0]-r[0])-(c[0]-l[0])*(a[0]-r[0]))/u,g=((c[1]-l[1])*(a[1]-r[1])-(h[1]-l[1])*(o[1]-r[1]))/u,_=((h[1]-l[1])*(o[0]-r[0])-(c[1]-l[1])*(a[0]-r[0]))/u,p=l[0]-d*r[0]-f*r[1],m=l[1]-g*r[0]-_*r[1];let v=0,x=0;for(const K of i)v+=K[0]/i.length,x+=K[1]/i.length;e.beginPath(),i.forEach(([K,V],ut)=>{const dt=K-v,ft=V-x,qt=Math.hypot(dt,ft)||1,Kt=K+dt/qt*.6,X=V+ft/qt*.6;ut===0?e.moveTo(Kt,X):e.lineTo(Kt,X)}),e.closePath(),this.groundPattern||(this.groundPattern=e.createPattern(this.groundCanvas,"no-repeat"));const M=this.groundCanvas.width/this.groundW,A=this.dpr/M;e.save(),e.setTransform(d*A,g*A,f*A,_*A,this.dpr*p,this.dpr*m),e.fillStyle=this.groundPattern,e.fill(),e.restore();const T=o[0]-r[0],E=o[1]-r[1],P=o[2]-r[2],N=a[0]-r[0],y=a[1]-r[1],b=a[2]-r[2];let k=E*b-P*y,F=P*N-T*b,G=T*y-E*N;const Y=Math.hypot(k,F,G)||1;G<0&&(k=-k,F=-F);const z=(k*Ci[0]+F*Ci[1])/Y*.9;Math.abs(z)>.01&&(e.fillStyle=z>0?`rgba(255,248,220,${(z*.35).toFixed(3)})`:`rgba(12,18,8,${(-z*.75).toFixed(3)})`,e.fill())}hiddenSides(t,e,n,i){let r=0;for(let o=0;o<4;o++){const a=e+di[o][0],l=n+di[o][1];if(!t.inBounds(a,l))continue;const c=t.idx(a,l);jh(t.tiles[c])+t.elev(c)>=i+t.elev(t.idx(e,n))&&(r|=1<<o)}return r}connects(t,e,n,i){const r=e+di[i][0],o=n+di[i][1];return t.inBounds(r,o)&&Ur.has(t.tiles[t.idx(r,o)].type)}thinWall(t,e,n,i,r,o,a,l,c=!1,h=null){const u=o/2,d=e+.5,f=n+.5,g=[[d-u,f-u,d+u,f+u]];this.connects(t,e,n,0)&&g.push([d-u,n,d+u,f-u]),this.connects(t,e,n,1)&&g.push([d+u,f-u,e+1,f+u]),this.connects(t,e,n,2)&&g.push([d-u,f+u,d+u,n+1]),this.connects(t,e,n,3)&&g.push([e,f-u,d-u,f+u]);const _=this.cam;g.sort((P,N)=>_.depth((P[0]+P[2])/2,(P[1]+P[3])/2)-_.depth((N[0]+N[2])/2,(N[1]+N[3])/2));const p=(P,N)=>(Math.abs(P-d)>=Math.abs(N-f)?t.heightAt(P,f):t.heightAt(d,N))+r,m=this.footZ??((P,N)=>t.heightAt(P,N));for(const P of g)this.box(P[0],P[1],P[2],P[3],m,p,he(a.side,l),he(a.top,l),0,!1,h);if(!c)return;const v=[],x=.06,[M,A,T,E]=g.find(P=>Math.abs(P[2]-P[0]-o)<1e-6&&Math.abs(P[3]-P[1]-o)<1e-6);this.connects(t,e,n,0)||v.push([M,A,T,A+x]),this.connects(t,e,n,1)||v.push([T-x,A,T,E]),this.connects(t,e,n,2)||v.push([M,E-x,T,E]),this.connects(t,e,n,3)||v.push([M,A,M+x,E]);for(const[P,N,y,b]of g){if(P===M&&N===A&&y===T&&b===E)continue;const k=y-P>b-N+1e-6;b-N>y-P+1e-6||v.push([P,N,y,N+x],[P,b-x,y,b]),k||v.push([P,N,P+x,b],[y-x,N,y,b])}this.rails(v,p)}rails(t,e){const n=this.cam,i=typeof e=="function"?e:()=>e;t.sort((r,o)=>n.depth((r[0]+r[2])/2,(r[1]+r[3])/2)-n.depth((o[0]+o[2])/2,(o[1]+o[3])/2));for(const r of t)this.box(r[0],r[1],r[2],r[3],i,(o,a)=>i(o,a)+.3,pt.hoard,he(pt.hoard,1.25),0,!0)}edgeRails(t,e,n,i,r,o){const l=[];o&1&&l.push([t,e,n,e+.07]),o&2&&l.push([n-.07,e,n,i]),o&4&&l.push([t,i-.07,n,i]),o&8&&l.push([t,e,t+.07,i]),this.rails(l,r)}drawTile(t,e,n,i,r,o){const a=t.tiles[e],c=1-(a.maxHp?1-a.hp/a.maxHp:0)*.35;switch(a.type){case"palisade":{const h=wt.palisade;this.thinWall(t,n,i,r,h.height,h.thin,pt.palisade,c,!1,"wood");break}case"wall":{const h=wt.wall;this.thinWall(t,n,i,r,h.height,h.thin,pt.wall,c,a.hoard,"stone");break}case"thick":{const h=wt.thick.height,u=pt.thick,d=(_,p)=>t.heightAt(_,p)+h,f=this.footZ??((_,p)=>t.heightAt(_,p));this.box(n,i,n+1,i+1,f,d,he(u.side,c),he(u.top,c),this.hiddenSides(t,n,i,h),!1,"stone"),this.poly([n+.24,i+.24,d(n+.24,i+.24),n+.76,i+.24,d(n+.76,i+.24),n+.76,i+.76,d(n+.76,i+.76),n+.24,i+.76,d(n+.24,i+.76)]),this.ctx.fillStyle="rgba(0,0,0,0.1)",this.ctx.fill();let g=0;for(let _=0;_<4;_++)this.connects(t,n,i,_)||(g|=1<<_);a.hoard?this.edgeRails(n,i,n+1,i+1,d,g):this.merlons(n,i,n+1,i+1,d,u,g);break}case"tower":{const h=wt.tower.height,u=pt.tower;this.box(n+.04,i+.04,n+.96,i+.96,this.footZ??this.minFoot??r,r+h,he(u.side,c),he(u.top,c),0,!0,"stone"),a.hoard?this.edgeRails(n+.04,i+.04,n+.96,i+.96,r+h,15):this.merlons(n+.04,i+.04,n+.96,i+.96,r+h,u,15);break}case"keep":{const h=t.keep,u=oe.height,d=pt.keep;this.box(n,i,n+1,i+1,r,r+u,d.side,d.top,this.hiddenSides(t,n,i,u),!1,"stone");const f=Math.max(n,h.x+.4),g=Math.max(i,h.y+.4),_=Math.min(n+1,h.x+2.6),p=Math.min(i+1,h.y+2.6);this.poly([f,g,r+u,_,g,r+u,_,p,r+u,f,p,r+u]),this.ctx.fillStyle="rgba(0,0,0,0.12)",this.ctx.fill();let m=0;i===h.y&&(m|=1),n===h.x+2&&(m|=2),i===h.y+2&&(m|=4),n===h.x&&(m|=8),this.merlons(n,i,n+1,i+1,r+u,d,m),e===h.door&&this.drawKeepDoor(h,n,i,r),n===h.x+1&&i===h.y+1&&(this.flag(n+.5,i+.5,r+u,o),this.drawLord(n+.85,i+.8,r+u,h));break}case"pikes":this.drawPikes(t,n,i,this.footZ??r,c);break;case"stair":this.drawStair(t,e,n,i);break;case"gate":this.drawGate(t,e,n,i,r,c);break;case"cottage":this.drawCottage(n,i,r,c);break;case"farm":this.drawFarm(n,i,r,c,a.v);break;case"market":this.drawMarket(n,i,r,c);break;case"plot":this.drawPlot(n,i,r,a.plot,o);break;case"trap":{this.ctx.beginPath(),this.pathQuad(n+.08,i+.08,n+.92,i+.92,r+.01),this.ctx.fillStyle=kt(pt.dirt),this.ctx.fill();for(let h=0;h<3;h++)for(let u=0;u<3;u++){const d=n+.25+u*.25,f=i+.25+h*.25;this.line(d,f,r,d,f,r+.18,"#c9c4b8",Math.max(1,this.cam.k*.05))}break}case"tree":{const h=a.v,u=n+.5+(h-.5)*.2,d=i+.5+(h*7%1-.5)*.2;this.ellipse(u,d,r,.42,"rgba(0,0,0,0.25)"),this.box(u-.07,d-.07,u+.07,d+.07,r,r+.55,pt.trunk,pt.trunk,0,!1),this.ball(u,d,r+.95,.42,kt(pt.leaf,.9+h*.2),"rgba(10,30,10,0.5)"),this.ball(u-.08,d-.08,r+1.25,.26,kt(pt.leafHi,.9+h*.2));break}case"rock":{const h=pt.rock,u=.35+a.v*.3;this.box(n+.12,i+.16,n+.88,i+.86,r,r+u,h.side,h.top);break}}}drawStair(t,e,n,i){const r=t.stairFace(e),o=n+.5,a=i+.5,l=4;let c=0,h=1,u=t.elev(e)+.4;r>=0&&(c=r%t.w-n,h=(r/t.w|0)-i,u=t.surfaceAt(r,o+c*.5,a+h*.5));const d=pt.wall,f=[];for(let p=0;p<l;p++){const m=-.5+p/l,v=-.5+(p+1)/l,x=.3,M=c?o+Math.min(m*c,v*c):o-x,A=c?o+Math.max(m*c,v*c):o+x,T=h?a+Math.min(m*h,v*h):a-x,E=h?a+Math.max(m*h,v*h):a+x;f.push([M,T,A,E,(p+1)/l])}const g=this.cam;f.sort((p,m)=>g.depth((p[0]+p[2])/2,(p[1]+p[3])/2)-g.depth((m[0]+m[2])/2,(m[1]+m[3])/2));const _=(p,m)=>t.heightAt(p,m);for(const[p,m,v,x,M]of f){const A=t.heightAt((p+v)/2,(m+x)/2);this.box(p,m,v,x,_,A+(u-A)*M,d.side,d.top,0,!0,"stone")}}axisX(t,e,n,i){const r=o=>{const a=e+di[o][0],l=n+di[o][1];return t.inBounds(a,l)&&i(t.tiles[t.idx(a,l)].type)};return r(1)||r(3)||!(r(0)||r(2))}drawPikes(t,e,n,i,r){const o=this.axisX(t,e,n,M=>M==="pikes"||Ur.has(M)),a=e+.5,l=n+.5,c=o?1:0,h=o?0:1,u=-h,d=c;this.ellipse(a,l,i,.45,"rgba(0,0,0,0.18)");const f=Math.max(1.5,this.cam.k*.075),g=kt(pt.pike,r),_=kt(pt.pikeTip,r),p=[];for(const M of[-.33,0,.33]){const A=a+c*M,T=l+h*M;for(const E of[1,-1]){const P=A-u*.36*E,N=T-d*.36*E,y=A+u*.42*E,b=T+d*.42*E;p.push([P,N,y,b])}}const m=this.cam;p.sort((M,A)=>m.depth(M[2],M[3])-m.depth(A[2],A[3]));const v=()=>this.orientedBox(a,l,.5,.06,o?0:Math.PI/2,i+.2,i+.32,pt.trunk,he(pt.trunk,1.2));let x=!1;for(const[M,A,T,E]of p){!x&&m.depth(T,E)>m.depth(a,l)&&(v(),x=!0);const P=M+(T-M)*.72,N=A+(E-A)*.72;this.line(M,A,i,P,N,i+.45,g,f),this.line(P,N,i+.45,T,E,i+.62,_,f*.8)}x||v()}drawGate(t,e,n,i,r,o){var _;const a=wt.gate.height,l=pt.thick,c=he(l.side,o),h=he(l.top,o),u=this.axisX(t,n,i,p=>Ur.has(p)),d=this.footZ??this.minFoot??r,f=u?[[n,i+.12,n+.3,i+.88,d,r+a,c,h],[n+.7,i+.12,n+1,i+.88,d,r+a,c,h],[n+.3,i+.12,n+.7,i+.88,r+.85,r+a,c,h]]:[[n+.12,i,n+.88,i+.3,d,r+a,c,h],[n+.12,i+.7,n+.88,i+1,d,r+a,c,h],[n+.12,i+.3,n+.88,i+.7,r+.85,r+a,c,h]];(_=this.openGates)!=null&&_.has(e)||f.push(u?[n+.3,i+.44,n+.7,i+.56,d,r+.85,pt.door,he(pt.door,1.2)]:[n+.44,i+.3,n+.56,i+.7,d,r+.85,pt.door,he(pt.door,1.2)]);const g=this.cam;f.sort((p,m)=>g.depth((p[0]+p[2])/2,(p[1]+p[3])/2)-g.depth((m[0]+m[2])/2,(m[1]+m[3])/2));for(const p of f)this.box(...p,0,!0,p[6]===c?"stone":null);t.tiles[e].hoard&&(u?this.edgeRails(n,i+.12,n+1,i+.88,r+a,5):this.edgeRails(n+.12,i,n+.88,i+1,r+a,10))}drawCottage(t,e,n,i){const{ctx:r,cam:o}=this,a=t+.18,l=t+.82,c=e+.24,h=e+.76,u=n+.42,d=n+.8,f=e+.5;this.ellipse(t+.5,e+.5,n,.45,"rgba(0,0,0,0.18)"),this.box(a,c,l,h,n,u,he(pt.plaster,i),he(pt.plaster,i),0,!1);const g=(v,x)=>{this.poly(v),r.fillStyle=kt(pt.roof,x*i),r.fill(),r.strokeStyle="rgba(40,20,10,0.35)",r.stroke()},_=[a-.04,c-.05,u,l+.04,c-.05,u,l+.04,f,d,a-.04,f,d],p=[a-.04,f,d,l+.04,f,d,l+.04,h+.05,u,a-.04,h+.05,u],m=o.faceVisible(0,1);g(m?_:p,.8);for(const[v,x]of[[a,-1],[l,1]])o.faceVisible(x,0)&&(this.poly([v,c,u,v,h,u,v,f,d]),r.fillStyle=kt(pt.plaster,Rs(x,0)*i),r.fill());g(m?p:_,1),this.box(l-.16,f-.22,l-.06,f-.12,u,d+.08,[120,100,90],[90,80,72],0,!1)}drawFarm(t,e,n,i,r){const{ctx:o}=this;o.beginPath(),this.pathQuad(t+.04,e+.04,t+.96,e+.96,n+.01),o.fillStyle=kt(pt.soil,i),o.fill();const a=Math.max(1.5,this.cam.k*.07),l=r>.5;for(let c=0;c<4;c++){const h=e+.17+c*.22;this.line(t+.12,h,n+.03,t+.88,h,n+.03,kt(l?pt.crop:pt.sprout,i),a);for(const u of[.25,.5,.75])this.line(t+u,h,n,t+u,h,n+.14,kt(l?pt.crop:pt.sprout,i*.9),a*.6)}}drawMarket(t,e,n,i){const{ctx:r}=this;this.ellipse(t+.5,e+.5,n,.48,"rgba(0,0,0,0.18)"),this.box(t+.15,e+.3,t+.85,e+.7,n,n+.35,he(pt.catapult,i),he(pt.catapult,1.15*i),0,!0);const o=Math.max(1.5,this.cam.k*.05);for(const[a,l]of[[.12,.2],[.88,.2],[.12,.8],[.88,.8]])this.line(t+a,e+l,n,t+a,e+l,n+.85,"#4a3220",o);for(let a=0;a<5;a++){const l=t+.08+a*.168,c=l+.168;this.poly([l,e+.14,n+.95,c,e+.14,n+.95,c,e+.86,n+.75,l,e+.86,n+.75]),r.fillStyle=kt(a%2?pt.awningAlt:pt.awning,i),r.fill()}this.ball(t+.35,e+.5,n+.42,.08,kt(pt.crop)),this.ball(t+.62,e+.45,n+.42,.07,"#a83a2a")}drawPlot(t,e,n,i,r){const{ctx:o}=this,a=.55+.25*Math.sin(r*3);o.beginPath(),this.pathQuad(t+.08,e+.08,t+.92,e+.92,n+.01),o.fillStyle=`rgba(240,210,120,${.12+a*.1})`,o.fill(),o.setLineDash([4,4]),o.strokeStyle=`rgba(250,225,150,${a})`,o.lineWidth=1.5,o.stroke(),o.setLineDash([]);const l=Math.max(1.2,this.cam.k*.04);for(const[c,h]of[[.08,.08],[.92,.08],[.92,.92],[.08,.92]])this.line(t+c,e+h,n,t+c,e+h,n+.25,"#e9d9b0",l);o.globalAlpha=.35,i==="cottage"?this.drawCottage(t,e,n,1):i==="farm"?this.drawFarm(t,e,n,1,.2):i==="market"&&this.drawMarket(t,e,n,1),o.globalAlpha=1}drawOrders(t,e){const{ctx:n}=this,i=new Set;for(const r of t.swordsmen){const o=e.selected.has(r.id);if(!r.zone||!e.active&&!o)continue;const a=JSON.stringify(r.zone);if(i.has(a))continue;i.add(a);const l=r.zone;n.beginPath(),this.pathQuad(l.x0,l.y0,l.x1+1,l.y1+1),n.fillStyle=o?"rgba(110,160,255,0.18)":"rgba(110,160,255,0.09)",n.fill(),n.setLineDash([6,5]),n.strokeStyle="rgba(150,190,255,0.85)",n.lineWidth=2,n.stroke(),n.setLineDash([])}for(const r of t.swordsmen){if(!e.selected.has(r.id))continue;const{cam:o}=this;o.P(r.x,r.y,r.z),n.beginPath(),n.ellipse(o.sx,o.sy,.36*o.k,.36*o.k*o.sinE,0,0,Math.PI*2),n.strokeStyle="#f0c24b",n.lineWidth=2.5,n.stroke()}if(e.box){const{x0:r,y0:o,x1:a,y1:l}=e.box;n.beginPath(),this.pathQuad(r,o,a+1,l+1),n.fillStyle=e.selected.size?"rgba(110,160,255,0.22)":"rgba(240,194,75,0.18)",n.fill(),n.strokeStyle=e.selected.size?"rgba(170,205,255,0.95)":"rgba(240,194,75,0.95)",n.lineWidth=2,n.stroke()}}drawFoundation(t,e,n,i,r){const o=pt.rock.side,a=[138,146,112],l=n+(i-n)*(.55+r*.2),c=(r-.5)*.08;this.box(t+.02,e+.03+c,t+.98,e+.97+c,n,l,o,pt.rock.top,0,!0),this.box(t+.1-c,e+.12,t+.9-c,e+.88,l,i,he(o,1.08),a,0,!0)}drawKeepDoor(t,e,n,i){if(!this.cam.faceVisible(0,1))return;const r=n+1.002,o=e+.3,a=e+.7,l=.95;this.poly([o,r,i,a,r,i,a,r,i+l*.8,e+.5,r,i+l,o,r,i+l*.8]);const c=t.doorHp<=0,h=.6+.4*(t.doorHp/t.doorMax);if(this.ctx.fillStyle=c?"rgb(24,18,14)":kt(pt.door,h),this.ctx.fill(),this.ctx.strokeStyle="rgba(30,20,10,0.8)",this.ctx.lineWidth=Math.max(1,this.cam.k*.03),this.ctx.stroke(),c)for(const[u,d,f,g]of[[.32,.2,.42,.55],[.68,.1,.6,.6],[.36,.75,.5,.62]])this.line(e+u,r,i+d,e+f,r,i+g,kt(pt.door,1.1),Math.max(1.5,this.cam.k*.05));else for(const u of[.25,.6])this.line(o,r,i+u,a,r,i+u,"rgba(40,30,20,0.9)",Math.max(1,this.cam.k*.04))}drawLord(t,e,n,i){const r=i.hp<i.maxHp&&i.inside>0;this.ellipse(t,e,n,.14,"rgba(0,0,0,0.3)"),this.ball(t,e,n+.27,.14,r?"#fff":kt(pt.lord),"#2a1030"),this.ball(t,e,n+.5,.09,kt(pt.skin),"rgba(20,10,5,0.6)"),this.cam.P(t,e,n+.6);const o=Math.max(2,this.cam.k*.09),{ctx:a}=this;a.beginPath(),a.moveTo(this.cam.sx-o,this.cam.sy),a.lineTo(this.cam.sx-o,this.cam.sy-o*1.1),a.lineTo(this.cam.sx-o*.5,this.cam.sy-o*.5),a.lineTo(this.cam.sx,this.cam.sy-o*1.2),a.lineTo(this.cam.sx+o*.5,this.cam.sy-o*.5),a.lineTo(this.cam.sx+o,this.cam.sy-o*1.1),a.lineTo(this.cam.sx+o,this.cam.sy),a.closePath(),a.fillStyle=kt(pt.crown),a.fill()}drawLadder(t,e,n,i,r,o){const a=i-t,l=r-e,c=Math.hypot(a,l)||1,h=-l/c*.13,u=a/c*.13,d=Math.max(1.2,this.cam.k*.045),f=kt(pt.ladder),g=kt(pt.ladder,.7),_=6;for(let p=1;p<_;p++){const m=p/_,v=t+a*m,x=e+l*m,M=n+(o-n)*m;this.line(v-h,x-u,M,v+h,x+u,M,g,d*.8)}this.line(t-h,e-u,n,i-h,r-u,o,f,d),this.line(t+h,e+u,n,i+h,r+u,o,f,d)}merlons(t,e,n,i,r,o,a){const h=[],u=(_,p,m,v)=>{for(const x of[0,.5,1])h.push([_+(m-_)*x,p+(v-p)*x])};a&1&&u(t+.2/2,e+.2/2,n-.2/2,e+.2/2),a&2&&u(n-.2/2,e+.2/2,n-.2/2,i-.2/2),a&4&&u(t+.2/2,i-.2/2,n-.2/2,i-.2/2),a&8&&u(t+.2/2,e+.2/2,t+.2/2,i-.2/2);const d=this.cam;h.sort((_,p)=>d.depth(_[0],_[1])-d.depth(p[0],p[1]));const f=he(o.top,1.18),g=typeof r=="function"?r:()=>r;for(const[_,p]of h){const m=g(_,p);this.box(_-.2/2,p-.2/2,_+.2/2,p+.2/2,m,m+.22,o.side,f,0,!0)}}flag(t,e,n,i){const r=n+1.3;this.line(t,e,n,t,e,r,"#2b2016",Math.max(1.5,this.cam.k*.05));const o=Math.sin(i*3)*.08;this.poly([t,e,r,t+.7,e+o,r-.18,t,e,r-.4]),this.ctx.fillStyle=kt(pt.player),this.ctx.fill()}drawEnemy(t,e){const{cam:n}=this,i=t.z;if(t.type==="catapult"){this.drawCatapult(t,e);return}this.ellipse(t.x,t.y,i,t.r*1.1,"rgba(0,0,0,0.3)");const r=t.flash>0;if(t.type==="ram"){const u=r?[255,255,255]:pt.ram;this.orientedBox(t.x,t.y,.45,.26,t.heading,i+.05,i+.42,u,he(u,1.25));const d=t.x+Math.cos(t.heading)*(.45+(t.attacking?Math.abs(Math.sin(t.walk))*.12:0)),f=t.y+Math.sin(t.heading)*.45;this.ball(d,f,i+.25,.1,"#555","#222");return}if(t.type==="ladder"){const u=Math.cos(t.heading),d=Math.sin(t.heading),f=kt(r?[255,255,255]:pt.raider),g=[[.24,0],[-.24,Math.PI]];g.sort((p,m)=>n.depth(t.x+u*p[0],t.y+d*p[0])-n.depth(t.x+u*m[0],t.y+d*m[0]));for(const[p,m]of g){const v=t.x+u*p,x=t.y+d*p,M=Math.abs(Math.sin(t.walk+m))*.05;this.ball(v,x,i+.28+M,.17,f,"rgba(20,10,5,0.7)"),this.ball(v,x,i+.55+M,.1,kt(pt.skin),"rgba(20,10,5,0.6)")}const _=Math.min(1,t.raising/1.2)*.9;this.drawLadder(t.x-u*.5,t.y-d*.5,i+.5,t.x+u*.5,t.y+d*.5,i+.5+_);return}const o=r?[255,255,255]:pt[t.type],a=Math.abs(Math.sin(t.walk))*.06,l=t.type==="brute";if(t.type==="bowman"){this.bow(t.x,t.y,i,t.heading,"#3b2a18"),this.ball(t.x,t.y,i+.28+a,t.r,kt(o),"rgba(20,10,5,0.7)"),this.ball(t.x,t.y,i+.52+a,t.r*.6,kt(he(pt.bowman,.7)),"rgba(20,10,5,0.6)");return}const c=t.attacking?Math.sin(t.walk*2)*.25:0,h=l?.42:.34;this.line(t.x,t.y,i+.38+a,t.x+Math.cos(t.heading+c)*h,t.y+Math.sin(t.heading+c)*h,i+.5+a+c*.3,l?"#3b3b3b":"#cfcfcf",Math.max(1.5,n.k*.06)),this.ball(t.x,t.y,i+.3+a,t.r,kt(o),"rgba(20,10,5,0.7)"),this.ball(t.x,t.y,i+.62+a,t.r*.55,l?"#777":kt(pt.skin),"rgba(20,10,5,0.6)")}drawArcher(t,e){const{cam:n}=this,i=t.z,o=t.path.length>0?Math.abs(Math.sin(e*12+t.id))*.05:0;this.ellipse(t.x,t.y,i,.15,"rgba(0,0,0,0.3)"),this.bow(t.x,t.y,i,t.heading,"#6b4423"),this.ball(t.x,t.y,i+.25+o,.13,t.flash>0?"#fff":kt(pt.player),"#162440"),this.ball(t.x,t.y,i+.47+o,.08,kt(pt.skin),"rgba(20,10,5,0.6)")}bow(t,e,n,i,r){const o=t+Math.cos(i)*.2,a=e+Math.sin(i)*.2,l=-Math.sin(i)*.14,c=Math.cos(i)*.14;this.line(o-l,a-c,n+.25,o+l,a+c,n+.55,r,Math.max(1.2,this.cam.k*.045))}drawSwordsman(t){const{cam:e}=this,n=t.z,i=Math.abs(Math.sin(t.walk))*.05;this.ellipse(t.x,t.y,n,t.r*1.1,"rgba(0,0,0,0.3)");const r=t.fighting?Math.sin(t.walk*2)*.5:.3,o=t.heading;this.line(t.x+Math.cos(o+1.2)*.12,t.y+Math.sin(o+1.2)*.12,n+.4+i,t.x+Math.cos(o+r)*.42,t.y+Math.sin(o+r)*.42,n+.5+i,"#dfe4ea",Math.max(1.5,e.k*.06)),this.ball(t.x,t.y,n+.3+i,t.r,t.flash>0?"#fff":kt(pt.player),"#162440"),this.ball(t.x+Math.cos(o-1.1)*.17,t.y+Math.sin(o-1.1)*.17,n+.32+i,.11,kt(pt.shield),"#4a3a14"),this.ball(t.x,t.y,n+.6+i,t.r*.55,"#9aa3ad","#2a2f36")}drawCatapult(t,e){const n=t.z,i=t.flash>0?[255,255,255]:pt.catapult,r=Math.cos(t.heading),o=Math.sin(t.heading);this.ellipse(t.x,t.y,n,.5,"rgba(0,0,0,0.3)");for(const[x,M]of[[.3,.27],[.3,-.27],[-.3,.27],[-.3,-.27]])this.ball(t.x+r*x-o*M,t.y+o*x+r*M,n+.1,.09,"#3a2a1a");this.orientedBox(t.x,t.y,.42,.24,t.heading,n+.08,n+.26,i,he(i,1.2));const a=-o*.2,l=r*.2,c=n+.7,h=kt(he(i,.75)),u=Math.max(1.5,this.cam.k*.06);this.line(t.x+a,t.y+l,n+.26,t.x,t.y,c,h,u),this.line(t.x-a,t.y-l,n+.26,t.x,t.y,c,h,u);const d=e-t.fired,g=-.45+(d<.18?d/.18:Math.max(0,1-(d-.18)/1.8))*1.9,_=.7,p=t.x-r*Math.cos(g)*_,m=t.y-o*Math.cos(g)*_,v=c+Math.sin(g)*_;this.line(t.x+r*.18,t.y+o*.18,c-Math.sin(g)*.18,p,m,v,kt(he(i,.9)),Math.max(2.5,this.cam.k*.09)),this.ball(p,m,v+.04,.11,d>1.2?kt(pt.boulder):kt(he(i,.6)),"#3a2a1a")}drawBoulder(t){const e=t.sz+(t.tz-t.sz)*t.t;this.ellipse(t.x,t.y,Math.max(0,e-.4),.14,"rgba(0,0,0,0.25)"),this.ball(t.x,t.y,t.z,.14,kt(pt.boulder),"#3d3a36")}drawEffect(t){const{ctx:e,cam:n}=this,i=t.t/t.life;for(let r=0;r<4;r++){const o=r*1.7+t.x*3,a=t.size*(.2+i*.6);n.P(t.x+Math.cos(o)*a*.6,t.y+Math.sin(o)*a*.6,t.z+i*.6),e.beginPath(),e.arc(n.sx,n.sy,Math.max(1,a*.55*n.k),0,Math.PI*2),e.fillStyle=`rgba(170,155,130,${.5*(1-i)})`,e.fill()}}drawArrow(t){const e=t.x-t.px,n=t.y-t.py,i=t.z-t.pz,r=Math.hypot(e,n,i)||1,o=.35,a=t.hostile?"#2a2018":"#f3e6c4";this.line(t.x-e/r*o,t.y-n/r*o,t.z-i/r*o,t.x,t.y,t.z,a,Math.max(1,this.cam.k*.04))}rangeRing(t,e,n,i){const{ctx:r,cam:o}=this;r.beginPath();for(let a=0;a<=48;a++){const l=a/48*Math.PI*2;o.P(t+Math.cos(l)*i,e+Math.sin(l)*i,n),a===0?r.moveTo(o.sx,o.sy):r.lineTo(o.sx,o.sy)}r.fillStyle="rgba(120,180,255,0.08)",r.fill(),r.strokeStyle="rgba(150,200,255,0.6)",r.setLineDash([6,6]),r.stroke(),r.setLineDash([])}drawPreview(t,e){const{ctx:n}=this,{world:i}=t,r=e.i%i.w,o=e.i/i.w|0,l=["archer","upgrade","demolish","hoard"].includes(e.type)?i.surface(e.i)+.02:i.elev(e.i)+.02;n.beginPath(),this.pathQuad(r,o,r+1,o+1,l),n.fillStyle=e.ok?"rgba(120,230,120,0.35)":"rgba(240,80,60,0.35)",n.fill(),n.strokeStyle=e.ok?"rgba(160,255,160,0.9)":"rgba(255,120,100,0.9)",n.lineWidth=2,n.stroke();let c=0;e.type==="tower"?c=tn.range+wt.tower.perch+(Ri[i.tiles[e.i].terrain].perch||0):e.type==="archer"&&i.isRampart(e.i)?c=t.range(e.i):e.type==="swordsman"&&(c=$e.guard),c&&this.rangeRing(r+.5,o+.5,i.elev(e.i),c)}hpBar(t,e,n,i,r=.7){if(i>=1)return;const{ctx:o,cam:a}=this;a.P(t,e,n);const l=r*a.k,c=Math.max(3,a.k*.09);o.fillStyle="rgba(0,0,0,0.6)",o.fillRect(a.sx-l/2-1,a.sy-c/2-1,l+2,c+2),o.fillStyle=i>.5?"#6fcf57":i>.25?"#e8c547":"#e2543b",o.fillRect(a.sx-l/2,a.sy-c/2,l*Math.max(0,i),c)}drawBars(t){const{world:e}=t;for(let i=0;i<e.tiles.length;i++){const r=e.tiles[i];r.maxHp&&r.hp<r.maxHp&&this.hpBar(i%e.w+.5,(i/e.w|0)+.5,e.surface(i)+.45,r.hp/r.maxHp)}const n=e.keep;n.doorHp>0&&n.doorHp<n.doorMax&&this.hpBar(n.x+1.5,n.y+3.05,1.35,n.doorHp/n.doorMax,.6),n.inside>0&&this.insideBadge(n);for(const i of t.enemies)this.hpBar(i.x,i.y,i.z+1,i.hp/i.maxHp,.5);for(const i of[...t.archers,...t.swordsmen])this.hpBar(i.x,i.y,i.z+.95,i.hp/i.maxHp,.4)}insideBadge(t){const{ctx:e,cam:n}=this;n.P(t.x+1.5,t.y+1.5,oe.height+2.1);const i=`⚔ ${t.inside} inside`,r=Math.max(11,Math.min(16,n.k*.38));e.font=`700 ${r}px system-ui, sans-serif`;const o=e.measureText(i).width+r,a=r*1.6;e.fillStyle="rgba(150,30,24,0.92)",e.beginPath(),e.roundRect(n.sx-o/2,n.sy-a/2,o,a,a/2),e.fill(),e.fillStyle="#fff",e.textAlign="center",e.textBaseline="middle",e.fillText(i,n.sx,n.sy+1)}drawPlotTags(t){const{ctx:e,cam:n}=this,{world:i}=t,r=Math.round(Math.max(10,Math.min(14,n.k*.36)));e.font=`700 ${r}px system-ui, sans-serif`,e.textAlign="center",e.textBaseline="middle";for(let o=0;o<i.tiles.length;o++){const a=i.tiles[o];if(a.type!=="plot")continue;const l=wt[a.plot];n.P(o%i.w+.5,(o/i.w|0)+.5,i.elev(o)+1.15);const c=`${l.label} · ${l.cost}`,h=e.measureText(c).width+r*2,u=r*1.7,d=n.sx-h/2,f=n.sy-u/2,g=t.gold>=l.cost;e.fillStyle="rgba(24,20,15,0.88)",e.beginPath(),e.roundRect(d,f,h,u,u/2),e.fill(),e.strokeStyle=g?"rgba(240,194,75,0.9)":"rgba(160,140,110,0.6)",e.lineWidth=1.5,e.stroke(),e.beginPath(),e.arc(d+r*.85,n.sy,r*.32,0,Math.PI*2),e.fillStyle="#f0c24b",e.fill(),e.fillStyle=g?"#f3ead8":"#b9ae98",e.fillText(c,n.sx+r*.5,n.sy+1),e.beginPath(),e.moveTo(n.sx-4,f+u),e.lineTo(n.sx+4,f+u),e.lineTo(n.sx,f+u+5),e.fillStyle="rgba(24,20,15,0.88)",e.fill()}e.textBaseline="alphabetic"}drawFloaters(t){const{ctx:e,cam:n}=this;e.textAlign="center",e.font=`700 ${Math.round(Math.max(11,n.k*.4))}px system-ui, sans-serif`;for(const i of t.floaters)n.P(i.x,i.y,(i.z||0)+1+i.t*1.2),e.fillStyle=i.color==="cost"?`rgba(255,160,120,${1-i.t/1.2})`:`rgba(255,214,90,${1-i.t/1.2})`,e.fillText(i.text,n.sx,n.sy)}}function jh(s){return s.type==="thick"?wt.thick.height:s.type==="gate"?wt.gate.height:s.type==="keep"?oe.height:0}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Aa="169",Jh=0,ul=1,Qh=2,Rc=1,Cc=2,Sn=3,zn=0,Fe=1,rn=2,Fn=0,Ui=1,dl=2,fl=3,pl=4,tu=5,Qn=100,eu=101,nu=102,iu=103,su=104,ru=200,ou=201,au=202,lu=203,Co=204,Po=205,cu=206,hu=207,uu=208,du=209,fu=210,pu=211,mu=212,gu=213,xu=214,Lo=0,Io=1,Do=2,Oi=3,Uo=4,No=5,ko=6,Fo=7,Pc=0,_u=1,vu=2,On=0,Mu=1,yu=2,Su=3,Lc=4,bu=5,wu=6,Eu=7,Ic=300,Bi=301,zi=302,Oo=303,Bo=304,Mr=306,fs=1e3,ei=1001,zo=1002,Ne=1003,Tu=1004,Cs=1005,on=1006,Nr=1007,ni=1008,Tn=1009,Dc=1010,Uc=1011,ps=1012,Ra=1013,oi=1014,dn=1015,bs=1016,Ca=1017,Pa=1018,Hi=1020,Nc=35902,kc=1021,Fc=1022,ln=1023,Oc=1024,Bc=1025,Ni=1026,Gi=1027,La=1028,Ia=1029,zc=1030,Da=1031,Ua=1033,nr=33776,ir=33777,sr=33778,rr=33779,Ho=35840,Go=35841,Vo=35842,Wo=35843,Xo=36196,qo=37492,$o=37496,Yo=37808,Ko=37809,Zo=37810,jo=37811,Jo=37812,Qo=37813,ta=37814,ea=37815,na=37816,ia=37817,sa=37818,ra=37819,oa=37820,aa=37821,or=36492,la=36494,ca=36495,Hc=36283,ha=36284,ua=36285,da=36286,Au=3200,Ru=3201,Gc=0,Cu=1,kn="",Ye="srgb",Gn="srgb-linear",Na="display-p3",yr="display-p3-linear",hr="linear",le="srgb",ur="rec709",dr="p3",fi=7680,ml=519,Pu=512,Lu=513,Iu=514,Vc=515,Du=516,Uu=517,Nu=518,ku=519,gl=35044,Fu=35048,xl="300 es",bn=2e3,fr=2001;class Xi{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,t);t.target=null}}}const Ae=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],kr=Math.PI/180,fa=180/Math.PI;function qi(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ae[s&255]+Ae[s>>8&255]+Ae[s>>16&255]+Ae[s>>24&255]+"-"+Ae[t&255]+Ae[t>>8&255]+"-"+Ae[t>>16&15|64]+Ae[t>>24&255]+"-"+Ae[e&63|128]+Ae[e>>8&255]+"-"+Ae[e>>16&255]+Ae[e>>24&255]+Ae[n&255]+Ae[n>>8&255]+Ae[n>>16&255]+Ae[n>>24&255]).toLowerCase()}function Ee(s,t,e){return Math.max(t,Math.min(e,s))}function Ou(s,t){return(s%t+t)%t}function Fr(s,t,e){return(1-e)*s+e*t}function Zi(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Ue(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}class st{constructor(t=0,e=0){st.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ee(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*i+t.x,this.y=r*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Wt{constructor(t,e,n,i,r,o,a,l,c){Wt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,l,c)}set(t,e,n,i,r,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=i,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],_=i[0],p=i[3],m=i[6],v=i[1],x=i[4],M=i[7],A=i[2],T=i[5],E=i[8];return r[0]=o*_+a*v+l*A,r[3]=o*p+a*x+l*T,r[6]=o*m+a*M+l*E,r[1]=c*_+h*v+u*A,r[4]=c*p+h*x+u*T,r[7]=c*m+h*M+u*E,r[2]=d*_+f*v+g*A,r[5]=d*p+f*x+g*T,r[8]=d*m+f*M+g*E,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+i*r*c-i*o*l}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,g=e*u+n*d+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=u*_,t[1]=(i*c-h*n)*_,t[2]=(a*n-i*o)*_,t[3]=d*_,t[4]=(h*e-i*l)*_,t[5]=(i*r-a*e)*_,t[6]=f*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-i*c,i*l,-i*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Or.makeScale(t,e)),this}rotate(t){return this.premultiply(Or.makeRotation(-t)),this}translate(t,e){return this.premultiply(Or.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Or=new Wt;function Wc(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function pr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Bu(){const s=pr("canvas");return s.style.display="block",s}const _l={};function ar(s){s in _l||(_l[s]=!0,console.warn(s))}function zu(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Hu(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Gu(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const vl=new Wt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ml=new Wt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ji={[Gn]:{transfer:hr,primaries:ur,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s,fromReference:s=>s},[Ye]:{transfer:le,primaries:ur,luminanceCoefficients:[.2126,.7152,.0722],toReference:s=>s.convertSRGBToLinear(),fromReference:s=>s.convertLinearToSRGB()},[yr]:{transfer:hr,primaries:dr,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.applyMatrix3(Ml),fromReference:s=>s.applyMatrix3(vl)},[Na]:{transfer:le,primaries:dr,luminanceCoefficients:[.2289,.6917,.0793],toReference:s=>s.convertSRGBToLinear().applyMatrix3(Ml),fromReference:s=>s.applyMatrix3(vl).convertLinearToSRGB()}},Vu=new Set([Gn,yr]),ne={enabled:!0,_workingColorSpace:Gn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(s){if(!Vu.has(s))throw new Error(`Unsupported working color space, "${s}".`);this._workingColorSpace=s},convert:function(s,t,e){if(this.enabled===!1||t===e||!t||!e)return s;const n=ji[t].toReference,i=ji[e].fromReference;return i(n(s))},fromWorkingColorSpace:function(s,t){return this.convert(s,this._workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this._workingColorSpace)},getPrimaries:function(s){return ji[s].primaries},getTransfer:function(s){return s===kn?hr:ji[s].transfer},getLuminanceCoefficients:function(s,t=this._workingColorSpace){return s.fromArray(ji[t].luminanceCoefficients)}};function ki(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Br(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let pi;class Wu{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{pi===void 0&&(pi=pr("canvas")),pi.width=t.width,pi.height=t.height;const n=pi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=pi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=pr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=ki(r[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ki(e[n]/255)*255):e[n]=ki(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Xu=0;class Xc{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Xu++}),this.uuid=qi(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(zr(i[o].image)):r.push(zr(i[o]))}else r=zr(i);n.url=r}return e||(t.images[this.uuid]=n),n}}function zr(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Wu.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let qu=0;class Ce extends Xi{constructor(t=Ce.DEFAULT_IMAGE,e=Ce.DEFAULT_MAPPING,n=ei,i=ei,r=on,o=ni,a=ln,l=Tn,c=Ce.DEFAULT_ANISOTROPY,h=kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:qu++}),this.uuid=qi(),this.name="",this.source=new Xc(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new st(0,0),this.repeat=new st(1,1),this.center=new st(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Wt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Ic)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case fs:t.x=t.x-Math.floor(t.x);break;case ei:t.x=t.x<0?0:1;break;case zo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case fs:t.y=t.y-Math.floor(t.y);break;case ei:t.y=t.y<0?0:1;break;case zo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ce.DEFAULT_IMAGE=null;Ce.DEFAULT_MAPPING=Ic;Ce.DEFAULT_ANISOTROPY=1;class fe{constructor(t=0,e=0,n=0,i=1){fe.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r;const l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const x=(c+1)/2,M=(f+1)/2,A=(m+1)/2,T=(h+d)/4,E=(u+_)/4,P=(g+p)/4;return x>M&&x>A?x<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(x),i=T/n,r=E/n):M>A?M<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(M),n=T/i,r=P/i):A<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(A),n=E/r,i=P/r),this.set(n,i,r,e),this}let v=Math.sqrt((p-g)*(p-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(v)<.001&&(v=1),this.x=(p-g)/v,this.y=(u-_)/v,this.z=(d-h)/v,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class $u extends Xi{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new fe(0,0,t,e),this.scissorTest=!1,this.viewport=new fe(0,0,t,e);const i={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ce(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Xc(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ai extends $u{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class qc extends Ce{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Ne,this.minFilter=Ne,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Yu extends Ce{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Ne,this.minFilter=Ne,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class we{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(a===1){t[e+0]=d,t[e+1]=f,t[e+2]=g,t[e+3]=_;return}if(u!==_||l!==d||c!==f||h!==g){let p=1-a;const m=l*d+c*f+h*g+u*_,v=m>=0?1:-1,x=1-m*m;if(x>Number.EPSILON){const A=Math.sqrt(x),T=Math.atan2(A,m*v);p=Math.sin(p*T)/A,a=Math.sin(a*T)/A}const M=a*v;if(l=l*p+d*M,c=c*p+f*M,h=h*p+g*M,u=u*p+_*M,p===1-a){const A=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=A,c*=A,h*=A,u*=A}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,o){const a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*u+l*f-c*d,t[e+1]=l*g+h*d+c*u-a*f,t[e+2]=c*g+h*f+a*d-l*u,t[e+3]=h*g-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),u=a(r/2),d=l(n/2),f=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+a+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-i)*f}else if(n>a&&n>u){const f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-a);this._w=(o-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ee(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+i*c-r*l,this._y=i*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+i*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*i+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-e)*h)/c,d=Math.sin(e*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(t=0,e=0,n=0){L.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(yl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(yl.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*i-a*n),h=2*(a*e-r*i),u=2*(r*n-o*e);return this.x=e+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=i+l*u+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Hr.copy(this).projectOnVector(t),this.sub(Hr)}reflect(t){return this.sub(Hr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ee(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Hr=new L,yl=new we;class hi{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(je.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(je.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=je.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,je):je.fromBufferAttribute(r,o),je.applyMatrix4(t.matrixWorld),this.expandByPoint(je);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ps.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ps.copy(n.boundingBox)),Ps.applyMatrix4(t.matrixWorld),this.union(Ps)}const i=t.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,je),je.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ji),Ls.subVectors(this.max,Ji),mi.subVectors(t.a,Ji),gi.subVectors(t.b,Ji),xi.subVectors(t.c,Ji),Cn.subVectors(gi,mi),Pn.subVectors(xi,gi),Xn.subVectors(mi,xi);let e=[0,-Cn.z,Cn.y,0,-Pn.z,Pn.y,0,-Xn.z,Xn.y,Cn.z,0,-Cn.x,Pn.z,0,-Pn.x,Xn.z,0,-Xn.x,-Cn.y,Cn.x,0,-Pn.y,Pn.x,0,-Xn.y,Xn.x,0];return!Gr(e,mi,gi,xi,Ls)||(e=[1,0,0,0,1,0,0,0,1],!Gr(e,mi,gi,xi,Ls))?!1:(Is.crossVectors(Cn,Pn),e=[Is.x,Is.y,Is.z],Gr(e,mi,gi,xi,Ls))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,je).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(je).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(xn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),xn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),xn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),xn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),xn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),xn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),xn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),xn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(xn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const xn=[new L,new L,new L,new L,new L,new L,new L,new L],je=new L,Ps=new hi,mi=new L,gi=new L,xi=new L,Cn=new L,Pn=new L,Xn=new L,Ji=new L,Ls=new L,Is=new L,qn=new L;function Gr(s,t,e,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){qn.fromArray(s,r);const a=i.x*Math.abs(qn.x)+i.y*Math.abs(qn.y)+i.z*Math.abs(qn.z),l=t.dot(qn),c=e.dot(qn),h=n.dot(qn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Ku=new hi,Qi=new L,Vr=new L;class ws{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Ku.setFromPoints(t).getCenter(n);let i=0;for(let r=0,o=t.length;r<o;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Qi.subVectors(t,this.center);const e=Qi.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Qi,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Vr.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Qi.copy(t.center).add(Vr)),this.expandByPoint(Qi.copy(t.center).sub(Vr))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const _n=new L,Wr=new L,Ds=new L,Ln=new L,Xr=new L,Us=new L,qr=new L;class Zu{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,_n)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=_n.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(_n.copy(this.origin).addScaledVector(this.direction,e),_n.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){Wr.copy(t).add(e).multiplyScalar(.5),Ds.copy(e).sub(t).normalize(),Ln.copy(this.origin).sub(Wr);const r=t.distanceTo(e)*.5,o=-this.direction.dot(Ds),a=Ln.dot(this.direction),l=-Ln.dot(Ds),c=Ln.lengthSq(),h=Math.abs(1-o*o);let u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const _=1/h;u*=_,d*=_,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Wr).addScaledVector(Ds,d),f}intersectSphere(t,e){_n.subVectors(t.center,this.origin);const n=_n.dot(this.direction),i=_n.dot(_n)-n*n,r=t.radius*t.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,i=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,i=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,_n)!==null}intersectTriangle(t,e,n,i,r){Xr.subVectors(e,t),Us.subVectors(n,t),qr.crossVectors(Xr,Us);let o=this.direction.dot(qr),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Ln.subVectors(this.origin,t);const l=a*this.direction.dot(Us.crossVectors(Ln,Us));if(l<0)return null;const c=a*this.direction.dot(Xr.cross(Ln));if(c<0||l+c>o)return null;const h=-a*Ln.dot(qr);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class se{constructor(t,e,n,i,r,o,a,l,c,h,u,d,f,g,_,p){se.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,l,c,h,u,d,f,g,_,p)}set(t,e,n,i,r,o,a,l,c,h,u,d,f,g,_,p){const m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=i,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new se().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/_i.setFromMatrixColumn(t,0).length(),r=1/_i.setFromMatrixColumn(t,1).length(),o=1/_i.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const d=o*h,f=o*u,g=a*h,_=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+g*c,e[5]=d-_*c,e[9]=-a*l,e[2]=_-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){const d=l*h,f=l*u,g=c*h,_=c*u;e[0]=d+_*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=_+d*a,e[10]=o*l}else if(t.order==="ZXY"){const d=l*h,f=l*u,g=c*h,_=c*u;e[0]=d-_*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=_-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const d=o*h,f=o*u,g=a*h,_=a*u;e[0]=l*h,e[4]=g*c-f,e[8]=d*c+_,e[1]=l*u,e[5]=_*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const d=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=_-d*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+g,e[10]=d-_*u}else if(t.order==="XZY"){const d=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+_,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=_*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ju,t,Ju)}lookAt(t,e,n){const i=this.elements;return ze.subVectors(t,e),ze.lengthSq()===0&&(ze.z=1),ze.normalize(),In.crossVectors(n,ze),In.lengthSq()===0&&(Math.abs(n.z)===1?ze.x+=1e-4:ze.z+=1e-4,ze.normalize(),In.crossVectors(n,ze)),In.normalize(),Ns.crossVectors(ze,In),i[0]=In.x,i[4]=Ns.x,i[8]=ze.x,i[1]=In.y,i[5]=Ns.y,i[9]=ze.y,i[2]=In.z,i[6]=Ns.z,i[10]=ze.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],_=n[6],p=n[10],m=n[14],v=n[3],x=n[7],M=n[11],A=n[15],T=i[0],E=i[4],P=i[8],N=i[12],y=i[1],b=i[5],k=i[9],F=i[13],G=i[2],Y=i[6],z=i[10],K=i[14],V=i[3],ut=i[7],dt=i[11],ft=i[15];return r[0]=o*T+a*y+l*G+c*V,r[4]=o*E+a*b+l*Y+c*ut,r[8]=o*P+a*k+l*z+c*dt,r[12]=o*N+a*F+l*K+c*ft,r[1]=h*T+u*y+d*G+f*V,r[5]=h*E+u*b+d*Y+f*ut,r[9]=h*P+u*k+d*z+f*dt,r[13]=h*N+u*F+d*K+f*ft,r[2]=g*T+_*y+p*G+m*V,r[6]=g*E+_*b+p*Y+m*ut,r[10]=g*P+_*k+p*z+m*dt,r[14]=g*N+_*F+p*K+m*ft,r[3]=v*T+x*y+M*G+A*V,r[7]=v*E+x*b+M*Y+A*ut,r[11]=v*P+x*k+M*z+A*dt,r[15]=v*N+x*F+M*K+A*ft,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],_=t[7],p=t[11],m=t[15];return g*(+r*l*u-i*c*u-r*a*d+n*c*d+i*a*f-n*l*f)+_*(+e*l*f-e*c*d+r*o*d-i*o*f+i*c*h-r*l*h)+p*(+e*c*u-e*a*f-r*o*u+n*o*f+r*a*h-n*c*h)+m*(-i*a*h-e*l*u+e*a*d+i*o*u-n*o*d+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],_=t[13],p=t[14],m=t[15],v=u*p*c-_*d*c+_*l*f-a*p*f-u*l*m+a*d*m,x=g*d*c-h*p*c-g*l*f+o*p*f+h*l*m-o*d*m,M=h*_*c-g*u*c+g*a*f-o*_*f-h*a*m+o*u*m,A=g*u*l-h*_*l-g*a*d+o*_*d+h*a*p-o*u*p,T=e*v+n*x+i*M+r*A;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const E=1/T;return t[0]=v*E,t[1]=(_*d*r-u*p*r-_*i*f+n*p*f+u*i*m-n*d*m)*E,t[2]=(a*p*r-_*l*r+_*i*c-n*p*c-a*i*m+n*l*m)*E,t[3]=(u*l*r-a*d*r-u*i*c+n*d*c+a*i*f-n*l*f)*E,t[4]=x*E,t[5]=(h*p*r-g*d*r+g*i*f-e*p*f-h*i*m+e*d*m)*E,t[6]=(g*l*r-o*p*r-g*i*c+e*p*c+o*i*m-e*l*m)*E,t[7]=(o*d*r-h*l*r+h*i*c-e*d*c-o*i*f+e*l*f)*E,t[8]=M*E,t[9]=(g*u*r-h*_*r-g*n*f+e*_*f+h*n*m-e*u*m)*E,t[10]=(o*_*r-g*a*r+g*n*c-e*_*c-o*n*m+e*a*m)*E,t[11]=(h*a*r-o*u*r-h*n*c+e*u*c+o*n*f-e*a*f)*E,t[12]=A*E,t[13]=(h*_*i-g*u*i+g*n*d-e*_*d-h*n*p+e*u*p)*E,t[14]=(g*a*i-o*_*i-g*n*l+e*_*l+o*n*p-e*a*p)*E,t[15]=(o*u*i-h*a*i+h*n*l-e*u*l-o*n*d+e*a*d)*E,this}scale(t){const e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,o){return this.set(1,n,r,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,g=r*u,_=o*h,p=o*u,m=a*u,v=l*c,x=l*h,M=l*u,A=n.x,T=n.y,E=n.z;return i[0]=(1-(_+m))*A,i[1]=(f+M)*A,i[2]=(g-x)*A,i[3]=0,i[4]=(f-M)*T,i[5]=(1-(d+m))*T,i[6]=(p+v)*T,i[7]=0,i[8]=(g+x)*E,i[9]=(p-v)*E,i[10]=(1-(d+_))*E,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let r=_i.set(i[0],i[1],i[2]).length();const o=_i.set(i[4],i[5],i[6]).length(),a=_i.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),t.x=i[12],t.y=i[13],t.z=i[14],Je.copy(this);const c=1/r,h=1/o,u=1/a;return Je.elements[0]*=c,Je.elements[1]*=c,Je.elements[2]*=c,Je.elements[4]*=h,Je.elements[5]*=h,Je.elements[6]*=h,Je.elements[8]*=u,Je.elements[9]*=u,Je.elements[10]*=u,e.setFromRotationMatrix(Je),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,i,r,o,a=bn){const l=this.elements,c=2*r/(e-t),h=2*r/(n-i),u=(e+t)/(e-t),d=(n+i)/(n-i);let f,g;if(a===bn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===fr)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,r,o,a=bn){const l=this.elements,c=1/(e-t),h=1/(n-i),u=1/(o-r),d=(e+t)*c,f=(n+i)*h;let g,_;if(a===bn)g=(o+r)*u,_=-2*u;else if(a===fr)g=r*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const _i=new L,Je=new se,ju=new L(0,0,0),Ju=new L(1,1,1),In=new L,Ns=new L,ze=new L,Sl=new se,bl=new we;class pn{constructor(t=0,e=0,n=0,i=pn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(Ee(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ee(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ee(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ee(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ee(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ee(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Sl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Sl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return bl.setFromEuler(this),this.setFromQuaternion(bl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}pn.DEFAULT_ORDER="XYZ";class $c{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Qu=0;const wl=new L,vi=new we,vn=new se,ks=new L,ts=new L,td=new L,ed=new we,El=new L(1,0,0),Tl=new L(0,1,0),Al=new L(0,0,1),Rl={type:"added"},nd={type:"removed"},Mi={type:"childadded",child:null},$r={type:"childremoved",child:null};class Te extends Xi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Qu++}),this.uuid=qi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Te.DEFAULT_UP.clone();const t=new L,e=new pn,n=new we,i=new L(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new se},normalMatrix:{value:new Wt}}),this.matrix=new se,this.matrixWorld=new se,this.matrixAutoUpdate=Te.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Te.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new $c,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return vi.setFromAxisAngle(t,e),this.quaternion.multiply(vi),this}rotateOnWorldAxis(t,e){return vi.setFromAxisAngle(t,e),this.quaternion.premultiply(vi),this}rotateX(t){return this.rotateOnAxis(El,t)}rotateY(t){return this.rotateOnAxis(Tl,t)}rotateZ(t){return this.rotateOnAxis(Al,t)}translateOnAxis(t,e){return wl.copy(t).applyQuaternion(this.quaternion),this.position.add(wl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(El,t)}translateY(t){return this.translateOnAxis(Tl,t)}translateZ(t){return this.translateOnAxis(Al,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(vn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ks.copy(t):ks.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),ts.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?vn.lookAt(ts,ks,this.up):vn.lookAt(ks,ts,this.up),this.quaternion.setFromRotationMatrix(vn),i&&(vn.extractRotation(i.matrixWorld),vi.setFromRotationMatrix(vn),this.quaternion.premultiply(vi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Rl),Mi.child=t,this.dispatchEvent(Mi),Mi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(nd),$r.child=t,this.dispatchEvent($r),$r.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),vn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),vn.multiply(t.parent.matrixWorld)),t.applyMatrix4(vn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Rl),Mi.child=t,this.dispatchEvent(Mi),Mi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ts,t,td),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ts,ed,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));i.material=a}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}Te.DEFAULT_UP=new L(0,1,0);Te.DEFAULT_MATRIX_AUTO_UPDATE=!0;Te.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Qe=new L,Mn=new L,Yr=new L,yn=new L,yi=new L,Si=new L,Cl=new L,Kr=new L,Zr=new L,jr=new L,Jr=new fe,Qr=new fe,to=new fe;class an{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Qe.subVectors(t,e),i.cross(Qe);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){Qe.subVectors(i,e),Mn.subVectors(n,e),Yr.subVectors(t,e);const o=Qe.dot(Qe),a=Qe.dot(Mn),l=Qe.dot(Yr),c=Mn.dot(Mn),h=Mn.dot(Yr),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,yn)===null?!1:yn.x>=0&&yn.y>=0&&yn.x+yn.y<=1}static getInterpolation(t,e,n,i,r,o,a,l){return this.getBarycoord(t,e,n,i,yn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,yn.x),l.addScaledVector(o,yn.y),l.addScaledVector(a,yn.z),l)}static getInterpolatedAttribute(t,e,n,i,r,o){return Jr.setScalar(0),Qr.setScalar(0),to.setScalar(0),Jr.fromBufferAttribute(t,e),Qr.fromBufferAttribute(t,n),to.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(Jr,r.x),o.addScaledVector(Qr,r.y),o.addScaledVector(to,r.z),o}static isFrontFacing(t,e,n,i){return Qe.subVectors(n,e),Mn.subVectors(t,e),Qe.cross(Mn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Qe.subVectors(this.c,this.b),Mn.subVectors(this.a,this.b),Qe.cross(Mn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return an.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return an.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return an.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return an.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return an.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,r=this.c;let o,a;yi.subVectors(i,n),Si.subVectors(r,n),Kr.subVectors(t,n);const l=yi.dot(Kr),c=Si.dot(Kr);if(l<=0&&c<=0)return e.copy(n);Zr.subVectors(t,i);const h=yi.dot(Zr),u=Si.dot(Zr);if(h>=0&&u<=h)return e.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(yi,o);jr.subVectors(t,r);const f=yi.dot(jr),g=Si.dot(jr);if(g>=0&&f<=g)return e.copy(r);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(Si,a);const p=h*g-f*u;if(p<=0&&u-h>=0&&f-g>=0)return Cl.subVectors(r,i),a=(u-h)/(u-h+(f-g)),e.copy(i).addScaledVector(Cl,a);const m=1/(p+_+d);return o=_*m,a=d*m,e.copy(n).addScaledVector(yi,o).addScaledVector(Si,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Yc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Dn={h:0,s:0,l:0},Fs={h:0,s:0,l:0};function eo(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class Yt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ye){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ne.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=ne.workingColorSpace){return this.r=t,this.g=e,this.b=n,ne.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=ne.workingColorSpace){if(t=Ou(t,1),e=Ee(e,0,1),n=Ee(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=eo(o,r,t+1/3),this.g=eo(o,r,t),this.b=eo(o,r,t-1/3)}return ne.toWorkingColorSpace(this,i),this}setStyle(t,e=Ye){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ye){const n=Yc[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ki(t.r),this.g=ki(t.g),this.b=ki(t.b),this}copyLinearToSRGB(t){return this.r=Br(t.r),this.g=Br(t.g),this.b=Br(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ye){return ne.fromWorkingColorSpace(Re.copy(this),t),Math.round(Ee(Re.r*255,0,255))*65536+Math.round(Ee(Re.g*255,0,255))*256+Math.round(Ee(Re.b*255,0,255))}getHexString(t=Ye){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ne.workingColorSpace){ne.fromWorkingColorSpace(Re.copy(this),e);const n=Re.r,i=Re.g,r=Re.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ne.workingColorSpace){return ne.fromWorkingColorSpace(Re.copy(this),e),t.r=Re.r,t.g=Re.g,t.b=Re.b,t}getStyle(t=Ye){ne.fromWorkingColorSpace(Re.copy(this),t);const e=Re.r,n=Re.g,i=Re.b;return t!==Ye?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(Dn),this.setHSL(Dn.h+t,Dn.s+e,Dn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Dn),t.getHSL(Fs);const n=Fr(Dn.h,Fs.h,e),i=Fr(Dn.s,Fs.s,e),r=Fr(Dn.l,Fs.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Re=new Yt;Yt.NAMES=Yc;let id=0;class Es extends Xi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:id++}),this.uuid=qi(),this.name="",this.type="Material",this.blending=Ui,this.side=zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Co,this.blendDst=Po,this.blendEquation=Qn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Yt(0,0,0),this.blendAlpha=0,this.depthFunc=Oi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ml,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fi,this.stencilZFail=fi,this.stencilZPass=fi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ui&&(n.blending=this.blending),this.side!==zn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Co&&(n.blendSrc=this.blendSrc),this.blendDst!==Po&&(n.blendDst=this.blendDst),this.blendEquation!==Qn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Oi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ml&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==fi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==fi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=i(t.textures),o=i(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Kc extends Es{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Yt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=Pc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ge=new L,Os=new st;class Ge{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=gl,this.updateRanges=[],this.gpuType=dn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Os.fromBufferAttribute(this,e),Os.applyMatrix3(t),this.setXY(e,Os.x,Os.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyMatrix3(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyMatrix4(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyNormalMatrix(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.transformDirection(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Zi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ue(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Zi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Zi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Zi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Zi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array),i=Ue(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array),i=Ue(i,this.array),r=Ue(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==gl&&(t.usage=this.usage),t}}class Zc extends Ge{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class jc extends Ge{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ce extends Ge{constructor(t,e,n){super(new Float32Array(t),e,n)}}let sd=0;const qe=new se,no=new Te,bi=new L,He=new hi,es=new hi,ye=new L;class Le extends Xi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:sd++}),this.uuid=qi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Wc(t)?jc:Zc)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Wt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return qe.makeRotationFromQuaternion(t),this.applyMatrix4(qe),this}rotateX(t){return qe.makeRotationX(t),this.applyMatrix4(qe),this}rotateY(t){return qe.makeRotationY(t),this.applyMatrix4(qe),this}rotateZ(t){return qe.makeRotationZ(t),this.applyMatrix4(qe),this}translate(t,e,n){return qe.makeTranslation(t,e,n),this.applyMatrix4(qe),this}scale(t,e,n){return qe.makeScale(t,e,n),this.applyMatrix4(qe),this}lookAt(t){return no.lookAt(t),no.updateMatrix(),this.applyMatrix4(no.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bi).negate(),this.translate(bi.x,bi.y,bi.z),this}setFromPoints(t){const e=[];for(let n=0,i=t.length;n<i;n++){const r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new ce(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new hi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const r=e[n];He.setFromBufferAttribute(r),this.morphTargetsRelative?(ye.addVectors(this.boundingBox.min,He.min),this.boundingBox.expandByPoint(ye),ye.addVectors(this.boundingBox.max,He.max),this.boundingBox.expandByPoint(ye)):(this.boundingBox.expandByPoint(He.min),this.boundingBox.expandByPoint(He.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ws);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){const n=this.boundingSphere.center;if(He.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];es.setFromBufferAttribute(a),this.morphTargetsRelative?(ye.addVectors(He.min,es.min),He.expandByPoint(ye),ye.addVectors(He.max,es.max),He.expandByPoint(ye)):(He.expandByPoint(es.min),He.expandByPoint(es.max))}He.getCenter(n);let i=0;for(let r=0,o=t.count;r<o;r++)ye.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(ye));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)ye.fromBufferAttribute(a,c),l&&(bi.fromBufferAttribute(t,c),ye.add(bi)),i=Math.max(i,n.distanceToSquared(ye))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ge(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new L,l[P]=new L;const c=new L,h=new L,u=new L,d=new st,f=new st,g=new st,_=new L,p=new L;function m(P,N,y){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,N),u.fromBufferAttribute(n,y),d.fromBufferAttribute(r,P),f.fromBufferAttribute(r,N),g.fromBufferAttribute(r,y),h.sub(c),u.sub(c),f.sub(d),g.sub(d);const b=1/(f.x*g.y-g.x*f.y);isFinite(b)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(b),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(b),a[P].add(_),a[N].add(_),a[y].add(_),l[P].add(p),l[N].add(p),l[y].add(p))}let v=this.groups;v.length===0&&(v=[{start:0,count:t.count}]);for(let P=0,N=v.length;P<N;++P){const y=v[P],b=y.start,k=y.count;for(let F=b,G=b+k;F<G;F+=3)m(t.getX(F+0),t.getX(F+1),t.getX(F+2))}const x=new L,M=new L,A=new L,T=new L;function E(P){A.fromBufferAttribute(i,P),T.copy(A);const N=a[P];x.copy(N),x.sub(A.multiplyScalar(A.dot(N))).normalize(),M.crossVectors(T,N);const b=M.dot(l[P])<0?-1:1;o.setXYZW(P,x.x,x.y,x.z,b)}for(let P=0,N=v.length;P<N;++P){const y=v[P],b=y.start,k=y.count;for(let F=b,G=b+k;F<G;F+=3)E(t.getX(F+0)),E(t.getX(F+1)),E(t.getX(F+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ge(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new L,r=new L,o=new L,a=new L,l=new L,c=new L,h=new L,u=new L;if(t)for(let d=0,f=t.count;d<f;d+=3){const g=t.getX(d+0),_=t.getX(d+1),p=t.getX(d+2);i.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,p),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)i.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ye.fromBufferAttribute(t,e),ye.normalize(),t.setXYZ(e,ye.x,ye.y,ye.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let f=0,g=0;for(let _=0,p=l.length;_<p;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let m=0;m<h;m++)d[g++]=c[f++]}return new Ge(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Le,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Pl=new se,$n=new Zu,Bs=new ws,Ll=new L,zs=new L,Hs=new L,Gs=new L,io=new L,Vs=new L,Il=new L,Ws=new L;class ke extends Te{constructor(t=new Le,e=new Kc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const a=this.morphTargetInfluences;if(r&&a){Vs.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(io.fromBufferAttribute(u,t),o?Vs.addScaledVector(io,h):Vs.addScaledVector(io.sub(e),h))}e.add(Vs)}return e}raycast(t,e){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Bs.copy(n.boundingSphere),Bs.applyMatrix4(r),$n.copy(t.ray).recast(t.near),!(Bs.containsPoint($n.origin)===!1&&($n.intersectSphere(Bs,Ll)===null||$n.origin.distanceToSquared(Ll)>(t.far-t.near)**2))&&(Pl.copy(r).invert(),$n.copy(t.ray).applyMatrix4(Pl),!(n.boundingBox!==null&&$n.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,$n)))}_computeIntersections(t,e,n){let i;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const p=d[g],m=o[p.materialIndex],v=Math.max(p.start,f.start),x=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let M=v,A=x;M<A;M+=3){const T=a.getX(M),E=a.getX(M+1),P=a.getX(M+2);i=Xs(this,m,t,n,c,h,u,T,E,P),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){const v=a.getX(p),x=a.getX(p+1),M=a.getX(p+2);i=Xs(this,o,t,n,c,h,u,v,x,M),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const p=d[g],m=o[p.materialIndex],v=Math.max(p.start,f.start),x=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let M=v,A=x;M<A;M+=3){const T=M,E=M+1,P=M+2;i=Xs(this,m,t,n,c,h,u,T,E,P),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){const v=p,x=p+1,M=p+2;i=Xs(this,o,t,n,c,h,u,v,x,M),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}}}function rd(s,t,e,n,i,r,o,a){let l;if(t.side===Fe?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,t.side===zn,a),l===null)return null;Ws.copy(a),Ws.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Ws);return c<e.near||c>e.far?null:{distance:c,point:Ws.clone(),object:s}}function Xs(s,t,e,n,i,r,o,a,l,c){s.getVertexPosition(a,zs),s.getVertexPosition(l,Hs),s.getVertexPosition(c,Gs);const h=rd(s,t,e,n,zs,Hs,Gs,Il);if(h){const u=new L;an.getBarycoord(Il,zs,Hs,Gs,u),i&&(h.uv=an.getInterpolatedAttribute(i,a,l,c,u,new st)),r&&(h.uv1=an.getInterpolatedAttribute(r,a,l,c,u,new st)),o&&(h.normal=an.getInterpolatedAttribute(o,a,l,c,u,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new L,materialIndex:0};an.getNormal(zs,Hs,Gs,d.normal),h.face=d,h.barycoord=u}return h}class Bn extends Le{constructor(t=1,e=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,i,o,2),g("x","z","y",1,-1,t,n,-e,i,o,3),g("x","y","z",1,-1,t,e,n,i,r,4),g("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new ce(c,3)),this.setAttribute("normal",new ce(h,3)),this.setAttribute("uv",new ce(u,2));function g(_,p,m,v,x,M,A,T,E,P,N){const y=M/E,b=A/P,k=M/2,F=A/2,G=T/2,Y=E+1,z=P+1;let K=0,V=0;const ut=new L;for(let dt=0;dt<z;dt++){const ft=dt*b-F;for(let qt=0;qt<Y;qt++){const Kt=qt*y-k;ut[_]=Kt*v,ut[p]=ft*x,ut[m]=G,c.push(ut.x,ut.y,ut.z),ut[_]=0,ut[p]=0,ut[m]=T>0?1:-1,h.push(ut.x,ut.y,ut.z),u.push(qt/E),u.push(1-dt/P),K+=1}}for(let dt=0;dt<P;dt++)for(let ft=0;ft<E;ft++){const qt=d+ft+Y*dt,Kt=d+ft+Y*(dt+1),X=d+(ft+1)+Y*(dt+1),tt=d+(ft+1)+Y*dt;l.push(qt,Kt,tt),l.push(Kt,X,tt),V+=6}a.addGroup(f,V,N),f+=V,d+=K}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Bn(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Vi(s){const t={};for(const e in s){t[e]={};for(const n in s[e]){const i=s[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function Pe(s){const t={};for(let e=0;e<s.length;e++){const n=Vi(s[e]);for(const i in n)t[i]=n[i]}return t}function od(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Jc(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ne.workingColorSpace}const ad={clone:Vi,merge:Pe};var ld=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Hn extends Es{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ld,this.fragmentShader=cd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Vi(t.uniforms),this.uniformsGroups=od(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Qc extends Te{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new se,this.projectionMatrix=new se,this.projectionMatrixInverse=new se,this.coordinateSystem=bn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Un=new L,Dl=new st,Ul=new st;class sn extends Qc{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=fa*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(kr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return fa*2*Math.atan(Math.tan(kr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Un.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Un.x,Un.y).multiplyScalar(-t/Un.z),Un.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Un.x,Un.y).multiplyScalar(-t/Un.z)}getViewSize(t,e){return this.getViewBounds(t,Dl,Ul),e.subVectors(Ul,Dl)}setViewOffset(t,e,n,i,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(kr*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,e-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const wi=-90,Ei=1;class hd extends Te{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new sn(wi,Ei,t,e);i.layers=this.layers,this.add(i);const r=new sn(wi,Ei,t,e);r.layers=this.layers,this.add(r);const o=new sn(wi,Ei,t,e);o.layers=this.layers,this.add(o);const a=new sn(wi,Ei,t,e);a.layers=this.layers,this.add(a);const l=new sn(wi,Ei,t,e);l.layers=this.layers,this.add(l);const c=new sn(wi,Ei,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===bn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===fr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,r),t.setRenderTarget(n,1,i),t.render(e,o),t.setRenderTarget(n,2,i),t.render(e,a),t.setRenderTarget(n,3,i),t.render(e,l),t.setRenderTarget(n,4,i),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class th extends Ce{constructor(t,e,n,i,r,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Bi,super(t,e,n,i,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class ud extends ai{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new th(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:on}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Bn(5,5,5),r=new Hn({name:"CubemapFromEquirect",uniforms:Vi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Fe,blending:Fn});r.uniforms.tEquirect.value=e;const o=new ke(i,r),a=e.minFilter;return e.minFilter===ni&&(e.minFilter=on),new hd(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,i){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(r)}}const so=new L,dd=new L,fd=new Wt;class jn{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=so.subVectors(n,e).cross(dd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(so),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||fd.getNormalMatrix(t),i=this.coplanarPoint(so).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Yn=new ws,qs=new L;class ka{constructor(t=new jn,e=new jn,n=new jn,i=new jn,r=new jn,o=new jn){this.planes=[t,e,n,i,r,o]}set(t,e,n,i,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=bn){const n=this.planes,i=t.elements,r=i[0],o=i[1],a=i[2],l=i[3],c=i[4],h=i[5],u=i[6],d=i[7],f=i[8],g=i[9],_=i[10],p=i[11],m=i[12],v=i[13],x=i[14],M=i[15];if(n[0].setComponents(l-r,d-c,p-f,M-m).normalize(),n[1].setComponents(l+r,d+c,p+f,M+m).normalize(),n[2].setComponents(l+o,d+h,p+g,M+v).normalize(),n[3].setComponents(l-o,d-h,p-g,M-v).normalize(),n[4].setComponents(l-a,d-u,p-_,M-x).normalize(),e===bn)n[5].setComponents(l+a,d+u,p+_,M+x).normalize();else if(e===fr)n[5].setComponents(a,u,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Yn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Yn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Yn)}intersectsSprite(t){return Yn.center.set(0,0,0),Yn.radius=.7071067811865476,Yn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Yn)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if(qs.x=i.normal.x>0?t.max.x:t.min.x,qs.y=i.normal.y>0?t.max.y:t.min.y,qs.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(qs)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function eh(){let s=null,t=!1,e=null,n=null;function i(r,o){e(r,o),n=s.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function pd(s){const t=new WeakMap;function e(a,l){const c=a.array,h=a.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,a),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){const g=u[d],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){const _=u[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(s.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}class ri extends Le{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,u=t/a,d=e/l,f=[],g=[],_=[],p=[];for(let m=0;m<h;m++){const v=m*d-o;for(let x=0;x<c;x++){const M=x*u-r;g.push(M,-v,0),_.push(0,0,1),p.push(x/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let v=0;v<a;v++){const x=v+c*m,M=v+c*(m+1),A=v+1+c*(m+1),T=v+1+c*m;f.push(x,M,T),f.push(M,A,T)}this.setIndex(f),this.setAttribute("position",new ce(g,3)),this.setAttribute("normal",new ce(_,3)),this.setAttribute("uv",new ce(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ri(t.width,t.height,t.widthSegments,t.heightSegments)}}var md=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,gd=`#ifdef USE_ALPHAHASH
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
#endif`,xd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,_d=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Md=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yd=`#ifdef USE_AOMAP
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
#endif`,Sd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,bd=`#ifdef USE_BATCHING
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
#endif`,wd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ed=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Td=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ad=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Rd=`#ifdef USE_IRIDESCENCE
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
#endif`,Cd=`#ifdef USE_BUMPMAP
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
#endif`,Pd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Ld=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Id=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Dd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ud=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Nd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,kd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Fd=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Od=`#define PI 3.141592653589793
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
} // validated`,Bd=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,zd=`vec3 transformedNormal = objectNormal;
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
#endif`,Hd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Gd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Vd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Wd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Xd="gl_FragColor = linearToOutputTexel( gl_FragColor );",qd=`
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
}`,$d=`#ifdef USE_ENVMAP
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
#endif`,Yd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Kd=`#ifdef USE_ENVMAP
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
#endif`,Zd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,jd=`#ifdef USE_ENVMAP
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
#endif`,Jd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Qd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,tf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ef=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,nf=`#ifdef USE_GRADIENTMAP
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
}`,sf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,rf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,of=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,af=`uniform bool receiveShadow;
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
#endif`,lf=`#ifdef USE_ENVMAP
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
#endif`,cf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,hf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,uf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,df=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ff=`PhysicalMaterial material;
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
#endif`,pf=`struct PhysicalMaterial {
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
}`,mf=`
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
#endif`,gf=`#if defined( RE_IndirectDiffuse )
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
#endif`,xf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,_f=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,vf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Mf=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,yf=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Sf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,bf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,wf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Ef=`#if defined( USE_POINTS_UV )
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
#endif`,Tf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Af=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Rf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Cf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Pf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lf=`#ifdef USE_MORPHTARGETS
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
#endif`,If=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Df=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Uf=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Nf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ff=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Of=`#ifdef USE_NORMALMAP
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
#endif`,Bf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,zf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Hf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Gf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Vf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Wf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Xf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,qf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$f=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Yf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Kf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Zf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,jf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Jf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Qf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,tp=`float getShadowMask() {
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
}`,ep=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,np=`#ifdef USE_SKINNING
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
#endif`,ip=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,sp=`#ifdef USE_SKINNING
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
#endif`,rp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,op=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ap=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,lp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,cp=`#ifdef USE_TRANSMISSION
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
#endif`,hp=`#ifdef USE_TRANSMISSION
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
#endif`,up=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,dp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,fp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,pp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const mp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,gp=`uniform sampler2D t2D;
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
}`,xp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_p=`#ifdef ENVMAP_TYPE_CUBE
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
}`,vp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yp=`#include <common>
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
}`,Sp=`#if DEPTH_PACKING == 3200
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
}`,bp=`#define DISTANCE
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
}`,wp=`#define DISTANCE
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
}`,Ep=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Tp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ap=`uniform float scale;
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
}`,Rp=`uniform vec3 diffuse;
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
}`,Cp=`#include <common>
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
}`,Pp=`uniform vec3 diffuse;
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
}`,Lp=`#define LAMBERT
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
}`,Ip=`#define LAMBERT
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
}`,Dp=`#define MATCAP
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
}`,Up=`#define MATCAP
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
}`,Np=`#define NORMAL
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
}`,kp=`#define NORMAL
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
}`,Fp=`#define PHONG
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
}`,Op=`#define PHONG
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
}`,Bp=`#define STANDARD
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
}`,zp=`#define STANDARD
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
}`,Hp=`#define TOON
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
}`,Gp=`#define TOON
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
}`,Vp=`uniform float size;
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
}`,Wp=`uniform vec3 diffuse;
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
}`,Xp=`#include <common>
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
}`,qp=`uniform vec3 color;
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
}`,$p=`uniform float rotation;
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
}`,Yp=`uniform vec3 diffuse;
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
}`,Vt={alphahash_fragment:md,alphahash_pars_fragment:gd,alphamap_fragment:xd,alphamap_pars_fragment:_d,alphatest_fragment:vd,alphatest_pars_fragment:Md,aomap_fragment:yd,aomap_pars_fragment:Sd,batching_pars_vertex:bd,batching_vertex:wd,begin_vertex:Ed,beginnormal_vertex:Td,bsdfs:Ad,iridescence_fragment:Rd,bumpmap_pars_fragment:Cd,clipping_planes_fragment:Pd,clipping_planes_pars_fragment:Ld,clipping_planes_pars_vertex:Id,clipping_planes_vertex:Dd,color_fragment:Ud,color_pars_fragment:Nd,color_pars_vertex:kd,color_vertex:Fd,common:Od,cube_uv_reflection_fragment:Bd,defaultnormal_vertex:zd,displacementmap_pars_vertex:Hd,displacementmap_vertex:Gd,emissivemap_fragment:Vd,emissivemap_pars_fragment:Wd,colorspace_fragment:Xd,colorspace_pars_fragment:qd,envmap_fragment:$d,envmap_common_pars_fragment:Yd,envmap_pars_fragment:Kd,envmap_pars_vertex:Zd,envmap_physical_pars_fragment:lf,envmap_vertex:jd,fog_vertex:Jd,fog_pars_vertex:Qd,fog_fragment:tf,fog_pars_fragment:ef,gradientmap_pars_fragment:nf,lightmap_pars_fragment:sf,lights_lambert_fragment:rf,lights_lambert_pars_fragment:of,lights_pars_begin:af,lights_toon_fragment:cf,lights_toon_pars_fragment:hf,lights_phong_fragment:uf,lights_phong_pars_fragment:df,lights_physical_fragment:ff,lights_physical_pars_fragment:pf,lights_fragment_begin:mf,lights_fragment_maps:gf,lights_fragment_end:xf,logdepthbuf_fragment:_f,logdepthbuf_pars_fragment:vf,logdepthbuf_pars_vertex:Mf,logdepthbuf_vertex:yf,map_fragment:Sf,map_pars_fragment:bf,map_particle_fragment:wf,map_particle_pars_fragment:Ef,metalnessmap_fragment:Tf,metalnessmap_pars_fragment:Af,morphinstance_vertex:Rf,morphcolor_vertex:Cf,morphnormal_vertex:Pf,morphtarget_pars_vertex:Lf,morphtarget_vertex:If,normal_fragment_begin:Df,normal_fragment_maps:Uf,normal_pars_fragment:Nf,normal_pars_vertex:kf,normal_vertex:Ff,normalmap_pars_fragment:Of,clearcoat_normal_fragment_begin:Bf,clearcoat_normal_fragment_maps:zf,clearcoat_pars_fragment:Hf,iridescence_pars_fragment:Gf,opaque_fragment:Vf,packing:Wf,premultiplied_alpha_fragment:Xf,project_vertex:qf,dithering_fragment:$f,dithering_pars_fragment:Yf,roughnessmap_fragment:Kf,roughnessmap_pars_fragment:Zf,shadowmap_pars_fragment:jf,shadowmap_pars_vertex:Jf,shadowmap_vertex:Qf,shadowmask_pars_fragment:tp,skinbase_vertex:ep,skinning_pars_vertex:np,skinning_vertex:ip,skinnormal_vertex:sp,specularmap_fragment:rp,specularmap_pars_fragment:op,tonemapping_fragment:ap,tonemapping_pars_fragment:lp,transmission_fragment:cp,transmission_pars_fragment:hp,uv_pars_fragment:up,uv_pars_vertex:dp,uv_vertex:fp,worldpos_vertex:pp,background_vert:mp,background_frag:gp,backgroundCube_vert:xp,backgroundCube_frag:_p,cube_vert:vp,cube_frag:Mp,depth_vert:yp,depth_frag:Sp,distanceRGBA_vert:bp,distanceRGBA_frag:wp,equirect_vert:Ep,equirect_frag:Tp,linedashed_vert:Ap,linedashed_frag:Rp,meshbasic_vert:Cp,meshbasic_frag:Pp,meshlambert_vert:Lp,meshlambert_frag:Ip,meshmatcap_vert:Dp,meshmatcap_frag:Up,meshnormal_vert:Np,meshnormal_frag:kp,meshphong_vert:Fp,meshphong_frag:Op,meshphysical_vert:Bp,meshphysical_frag:zp,meshtoon_vert:Hp,meshtoon_frag:Gp,points_vert:Vp,points_frag:Wp,shadow_vert:Xp,shadow_frag:qp,sprite_vert:$p,sprite_frag:Yp},ct={common:{diffuse:{value:new Yt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Wt}},envmap:{envMap:{value:null},envMapRotation:{value:new Wt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Wt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Wt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Wt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Wt},normalScale:{value:new st(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Wt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Wt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Wt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Wt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Yt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Yt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0},uvTransform:{value:new Wt}},sprite:{diffuse:{value:new Yt(16777215)},opacity:{value:1},center:{value:new st(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}}},hn={basic:{uniforms:Pe([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.fog]),vertexShader:Vt.meshbasic_vert,fragmentShader:Vt.meshbasic_frag},lambert:{uniforms:Pe([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Yt(0)}}]),vertexShader:Vt.meshlambert_vert,fragmentShader:Vt.meshlambert_frag},phong:{uniforms:Pe([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Yt(0)},specular:{value:new Yt(1118481)},shininess:{value:30}}]),vertexShader:Vt.meshphong_vert,fragmentShader:Vt.meshphong_frag},standard:{uniforms:Pe([ct.common,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.roughnessmap,ct.metalnessmap,ct.fog,ct.lights,{emissive:{value:new Yt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag},toon:{uniforms:Pe([ct.common,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.gradientmap,ct.fog,ct.lights,{emissive:{value:new Yt(0)}}]),vertexShader:Vt.meshtoon_vert,fragmentShader:Vt.meshtoon_frag},matcap:{uniforms:Pe([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,{matcap:{value:null}}]),vertexShader:Vt.meshmatcap_vert,fragmentShader:Vt.meshmatcap_frag},points:{uniforms:Pe([ct.points,ct.fog]),vertexShader:Vt.points_vert,fragmentShader:Vt.points_frag},dashed:{uniforms:Pe([ct.common,ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Vt.linedashed_vert,fragmentShader:Vt.linedashed_frag},depth:{uniforms:Pe([ct.common,ct.displacementmap]),vertexShader:Vt.depth_vert,fragmentShader:Vt.depth_frag},normal:{uniforms:Pe([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,{opacity:{value:1}}]),vertexShader:Vt.meshnormal_vert,fragmentShader:Vt.meshnormal_frag},sprite:{uniforms:Pe([ct.sprite,ct.fog]),vertexShader:Vt.sprite_vert,fragmentShader:Vt.sprite_frag},background:{uniforms:{uvTransform:{value:new Wt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Vt.background_vert,fragmentShader:Vt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Wt}},vertexShader:Vt.backgroundCube_vert,fragmentShader:Vt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Vt.cube_vert,fragmentShader:Vt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Vt.equirect_vert,fragmentShader:Vt.equirect_frag},distanceRGBA:{uniforms:Pe([ct.common,ct.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Vt.distanceRGBA_vert,fragmentShader:Vt.distanceRGBA_frag},shadow:{uniforms:Pe([ct.lights,ct.fog,{color:{value:new Yt(0)},opacity:{value:1}}]),vertexShader:Vt.shadow_vert,fragmentShader:Vt.shadow_frag}};hn.physical={uniforms:Pe([hn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Wt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Wt},clearcoatNormalScale:{value:new st(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Wt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Wt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Wt},sheen:{value:0},sheenColor:{value:new Yt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Wt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Wt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Wt},transmissionSamplerSize:{value:new st},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Wt},attenuationDistance:{value:0},attenuationColor:{value:new Yt(0)},specularColor:{value:new Yt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Wt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Wt},anisotropyVector:{value:new st},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Wt}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag};const $s={r:0,b:0,g:0},Kn=new pn,Kp=new se;function Zp(s,t,e,n,i,r,o){const a=new Yt(0);let l=r===!0?0:1,c,h,u=null,d=0,f=null;function g(v){let x=v.isScene===!0?v.background:null;return x&&x.isTexture&&(x=(v.backgroundBlurriness>0?e:t).get(x)),x}function _(v){let x=!1;const M=g(v);M===null?m(a,l):M&&M.isColor&&(m(M,1),x=!0);const A=s.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function p(v,x){const M=g(x);M&&(M.isCubeTexture||M.mapping===Mr)?(h===void 0&&(h=new ke(new Bn(1,1,1),new Hn({name:"BackgroundCubeMaterial",uniforms:Vi(hn.backgroundCube.uniforms),vertexShader:hn.backgroundCube.vertexShader,fragmentShader:hn.backgroundCube.fragmentShader,side:Fe,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,T,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Kn.copy(x.backgroundRotation),Kn.x*=-1,Kn.y*=-1,Kn.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Kn.y*=-1,Kn.z*=-1),h.material.uniforms.envMap.value=M,h.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Kp.makeRotationFromEuler(Kn)),h.material.toneMapped=ne.getTransfer(M.colorSpace)!==le,(u!==M||d!==M.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=M,d=M.version,f=s.toneMapping),h.layers.enableAll(),v.unshift(h,h.geometry,h.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new ke(new ri(2,2),new Hn({name:"BackgroundMaterial",uniforms:Vi(hn.background.uniforms),vertexShader:hn.background.vertexShader,fragmentShader:hn.background.fragmentShader,side:zn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=ne.getTransfer(M.colorSpace)!==le,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||d!==M.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,u=M,d=M.version,f=s.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function m(v,x){v.getRGB($s,Jc(s)),n.buffers.color.setClear($s.r,$s.g,$s.b,x,o)}return{getClearColor:function(){return a},setClearColor:function(v,x=1){a.set(v),l=x,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,m(a,l)},render:_,addToRenderList:p}}function jp(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null);let r=i,o=!1;function a(y,b,k,F,G){let Y=!1;const z=u(F,k,b);r!==z&&(r=z,c(r.object)),Y=f(y,F,k,G),Y&&g(y,F,k,G),G!==null&&t.update(G,s.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,M(y,b,k,F),G!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(G).buffer))}function l(){return s.createVertexArray()}function c(y){return s.bindVertexArray(y)}function h(y){return s.deleteVertexArray(y)}function u(y,b,k){const F=k.wireframe===!0;let G=n[y.id];G===void 0&&(G={},n[y.id]=G);let Y=G[b.id];Y===void 0&&(Y={},G[b.id]=Y);let z=Y[F];return z===void 0&&(z=d(l()),Y[F]=z),z}function d(y){const b=[],k=[],F=[];for(let G=0;G<e;G++)b[G]=0,k[G]=0,F[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:b,enabledAttributes:k,attributeDivisors:F,object:y,attributes:{},index:null}}function f(y,b,k,F){const G=r.attributes,Y=b.attributes;let z=0;const K=k.getAttributes();for(const V in K)if(K[V].location>=0){const dt=G[V];let ft=Y[V];if(ft===void 0&&(V==="instanceMatrix"&&y.instanceMatrix&&(ft=y.instanceMatrix),V==="instanceColor"&&y.instanceColor&&(ft=y.instanceColor)),dt===void 0||dt.attribute!==ft||ft&&dt.data!==ft.data)return!0;z++}return r.attributesNum!==z||r.index!==F}function g(y,b,k,F){const G={},Y=b.attributes;let z=0;const K=k.getAttributes();for(const V in K)if(K[V].location>=0){let dt=Y[V];dt===void 0&&(V==="instanceMatrix"&&y.instanceMatrix&&(dt=y.instanceMatrix),V==="instanceColor"&&y.instanceColor&&(dt=y.instanceColor));const ft={};ft.attribute=dt,dt&&dt.data&&(ft.data=dt.data),G[V]=ft,z++}r.attributes=G,r.attributesNum=z,r.index=F}function _(){const y=r.newAttributes;for(let b=0,k=y.length;b<k;b++)y[b]=0}function p(y){m(y,0)}function m(y,b){const k=r.newAttributes,F=r.enabledAttributes,G=r.attributeDivisors;k[y]=1,F[y]===0&&(s.enableVertexAttribArray(y),F[y]=1),G[y]!==b&&(s.vertexAttribDivisor(y,b),G[y]=b)}function v(){const y=r.newAttributes,b=r.enabledAttributes;for(let k=0,F=b.length;k<F;k++)b[k]!==y[k]&&(s.disableVertexAttribArray(k),b[k]=0)}function x(y,b,k,F,G,Y,z){z===!0?s.vertexAttribIPointer(y,b,k,G,Y):s.vertexAttribPointer(y,b,k,F,G,Y)}function M(y,b,k,F){_();const G=F.attributes,Y=k.getAttributes(),z=b.defaultAttributeValues;for(const K in Y){const V=Y[K];if(V.location>=0){let ut=G[K];if(ut===void 0&&(K==="instanceMatrix"&&y.instanceMatrix&&(ut=y.instanceMatrix),K==="instanceColor"&&y.instanceColor&&(ut=y.instanceColor)),ut!==void 0){const dt=ut.normalized,ft=ut.itemSize,qt=t.get(ut);if(qt===void 0)continue;const Kt=qt.buffer,X=qt.type,tt=qt.bytesPerElement,St=X===s.INT||X===s.UNSIGNED_INT||ut.gpuType===Ra;if(ut.isInterleavedBufferAttribute){const ht=ut.data,Ut=ht.stride,Dt=ut.offset;if(ht.isInstancedInterleavedBuffer){for(let Ht=0;Ht<V.locationSize;Ht++)m(V.location+Ht,ht.meshPerAttribute);y.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let Ht=0;Ht<V.locationSize;Ht++)p(V.location+Ht);s.bindBuffer(s.ARRAY_BUFFER,Kt);for(let Ht=0;Ht<V.locationSize;Ht++)x(V.location+Ht,ft/V.locationSize,X,dt,Ut*tt,(Dt+ft/V.locationSize*Ht)*tt,St)}else{if(ut.isInstancedBufferAttribute){for(let ht=0;ht<V.locationSize;ht++)m(V.location+ht,ut.meshPerAttribute);y.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ut.meshPerAttribute*ut.count)}else for(let ht=0;ht<V.locationSize;ht++)p(V.location+ht);s.bindBuffer(s.ARRAY_BUFFER,Kt);for(let ht=0;ht<V.locationSize;ht++)x(V.location+ht,ft/V.locationSize,X,dt,ft*tt,ft/V.locationSize*ht*tt,St)}}else if(z!==void 0){const dt=z[K];if(dt!==void 0)switch(dt.length){case 2:s.vertexAttrib2fv(V.location,dt);break;case 3:s.vertexAttrib3fv(V.location,dt);break;case 4:s.vertexAttrib4fv(V.location,dt);break;default:s.vertexAttrib1fv(V.location,dt)}}}}v()}function A(){P();for(const y in n){const b=n[y];for(const k in b){const F=b[k];for(const G in F)h(F[G].object),delete F[G];delete b[k]}delete n[y]}}function T(y){if(n[y.id]===void 0)return;const b=n[y.id];for(const k in b){const F=b[k];for(const G in F)h(F[G].object),delete F[G];delete b[k]}delete n[y.id]}function E(y){for(const b in n){const k=n[b];if(k[y.id]===void 0)continue;const F=k[y.id];for(const G in F)h(F[G].object),delete F[G];delete k[y.id]}}function P(){N(),o=!0,r!==i&&(r=i,c(r.object))}function N(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:P,resetDefaultState:N,dispose:A,releaseStatesOfGeometry:T,releaseStatesOfProgram:E,initAttributes:_,enableAttribute:p,disableUnusedAttributes:v}}function Jp(s,t,e){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),e.update(h,n,1)}function o(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function a(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];e.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_];for(let _=0;_<d.length;_++)e.update(g,n,d[_])}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Qp(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const E=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(E){return!(E!==ln&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){const P=E===bs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==Tn&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==dn&&!P)}function l(E){if(E==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(d===!0){const E=t.get("EXT_clip_control");E.clipControlEXT(E.LOWER_LEFT_EXT,E.ZERO_TO_ONE_EXT)}const f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),v=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),x=s.getParameter(s.MAX_VARYING_VECTORS),M=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),A=g>0,T=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:v,maxVaryings:x,maxFragmentUniforms:M,vertexTextures:A,maxSamples:T}}function tm(s){const t=this;let e=null,n=0,i=!1,r=!1;const o=new jn,a=new Wt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){const g=u.clippingPlanes,_=u.clipIntersection,p=u.clipShadows,m=s.get(u);if(!i||g===null||g.length===0||r&&!p)r?h(null):c();else{const v=r?0:n,x=v*4;let M=m.clippingState||null;l.value=M,M=h(g,d,x,f);for(let A=0;A!==x;++A)M[A]=e[A];m.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,g){const _=u!==null?u.length:0;let p=null;if(_!==0){if(p=l.value,g!==!0||p===null){const m=f+_*4,v=d.matrixWorldInverse;a.getNormalMatrix(v),(p===null||p.length<m)&&(p=new Float32Array(m));for(let x=0,M=f;x!==_;++x,M+=4)o.copy(u[x]).applyMatrix4(v,a),o.normal.toArray(p,M),p[M+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,p}}function em(s){let t=new WeakMap;function e(o,a){return a===Oo?o.mapping=Bi:a===Bo&&(o.mapping=zi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Oo||a===Bo)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new ud(l.height);return c.fromEquirectangularTexture(s,o),t.set(o,c),o.addEventListener("dispose",i),e(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class Fa extends Qc{constructor(t=-1,e=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=i+e,l=i-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Pi=4,Nl=[.125,.215,.35,.446,.526,.582],ti=20,ro=new Fa,kl=new Yt;let oo=null,ao=0,lo=0,co=!1;const Jn=(1+Math.sqrt(5))/2,Ti=1/Jn,Fl=[new L(-Jn,Ti,0),new L(Jn,Ti,0),new L(-Ti,0,Jn),new L(Ti,0,Jn),new L(0,Jn,-Ti),new L(0,Jn,Ti),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class Ol{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){oo=this._renderer.getRenderTarget(),ao=this._renderer.getActiveCubeFace(),lo=this._renderer.getActiveMipmapLevel(),co=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,i,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Hl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(oo,ao,lo),this._renderer.xr.enabled=co,t.scissorTest=!1,Ys(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Bi||t.mapping===zi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),oo=this._renderer.getRenderTarget(),ao=this._renderer.getActiveCubeFace(),lo=this._renderer.getActiveMipmapLevel(),co=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:on,minFilter:on,generateMipmaps:!1,type:bs,format:ln,colorSpace:Gn,depthBuffer:!1},i=Bl(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Bl(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=nm(r)),this._blurMaterial=im(r,t,e)}return i}_compileMaterial(t){const e=new ke(this._lodPlanes[0],t);this._renderer.compile(e,ro)}_sceneToCubeUV(t,e,n,i){const a=new sn(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(kl),h.toneMapping=On,h.autoClear=!1;const f=new Kc({name:"PMREM.Background",side:Fe,depthWrite:!1,depthTest:!1}),g=new ke(new Bn,f);let _=!1;const p=t.background;p?p.isColor&&(f.color.copy(p),t.background=null,_=!0):(f.color.copy(kl),_=!0);for(let m=0;m<6;m++){const v=m%3;v===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):v===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));const x=this._cubeSize;Ys(i,v*x,m>2?x:0,x,x),h.setRenderTarget(i),_&&h.render(g,a),h.render(t,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,t.background=p}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===Bi||t.mapping===zi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Hl()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zl());const r=i?this._cubemapMaterial:this._equirectMaterial,o=new ke(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;Ys(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,ro)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Fl[(i-r-1)%Fl.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,i,"latitudinal",r),this._halfBlur(o,t,n,n,i,"longitudinal",r)}_halfBlur(t,e,n,i,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ke(this._lodPlanes[i],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ti-1),_=r/g,p=isFinite(r)?1+Math.floor(h*_):ti;p>ti&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${ti}`);const m=[];let v=0;for(let E=0;E<ti;++E){const P=E/_,N=Math.exp(-P*P/2);m.push(N),E===0?v+=N:E<p&&(v+=2*N)}for(let E=0;E<m.length;E++)m[E]=m[E]/v;d.envMap.value=t.texture,d.samples.value=p,d.weights.value=m,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;const M=this._sizeLods[i],A=3*M*(i>x-Pi?i-x+Pi:0),T=4*(this._cubeSize-M);Ys(e,A,T,3*M,2*M),l.setRenderTarget(e),l.render(u,ro)}}function nm(s){const t=[],e=[],n=[];let i=s;const r=s-Pi+1+Nl.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);e.push(a);let l=1/a;o>s-Pi?l=Nl[o-s+Pi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,_=3,p=2,m=1,v=new Float32Array(_*g*f),x=new Float32Array(p*g*f),M=new Float32Array(m*g*f);for(let T=0;T<f;T++){const E=T%3*2/3-1,P=T>2?0:-1,N=[E,P,0,E+2/3,P,0,E+2/3,P+1,0,E,P,0,E+2/3,P+1,0,E,P+1,0];v.set(N,_*g*T),x.set(d,p*g*T);const y=[T,T,T,T,T,T];M.set(y,m*g*T)}const A=new Le;A.setAttribute("position",new Ge(v,_)),A.setAttribute("uv",new Ge(x,p)),A.setAttribute("faceIndex",new Ge(M,m)),t.push(A),i>Pi&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Bl(s,t,e){const n=new ai(s,t,e);return n.texture.mapping=Mr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ys(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function im(s,t,e){const n=new Float32Array(ti),i=new L(0,1,0);return new Hn({name:"SphericalGaussianBlur",defines:{n:ti,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Oa(),fragmentShader:`

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
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function zl(){return new Hn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Oa(),fragmentShader:`

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
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Hl(){return new Hn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Oa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Oa(){return`

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
	`}function sm(s){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Oo||l===Bo,h=l===Bi||l===zi;if(c||h){let u=t.get(a);const d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new Ol(s)),u=c?e.fromEquirectangular(a,u):e.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&i(f)?(e===null&&(e=new Ol(s)),u=c?e.fromEquirectangular(a):e.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function i(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function rm(s){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&ar("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function om(s,t,e,n){const i={},r=new WeakMap;function o(u){const d=u.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);for(const g in d.morphAttributes){const _=d.morphAttributes[g];for(let p=0,m=_.length;p<m;p++)t.remove(_[p])}d.removeEventListener("dispose",o),delete i[d.id];const f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,e.memory.geometries++),d}function l(u){const d=u.attributes;for(const g in d)t.update(d[g],s.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const _=f[g];for(let p=0,m=_.length;p<m;p++)t.update(_[p],s.ARRAY_BUFFER)}}function c(u){const d=[],f=u.index,g=u.attributes.position;let _=0;if(f!==null){const v=f.array;_=f.version;for(let x=0,M=v.length;x<M;x+=3){const A=v[x+0],T=v[x+1],E=v[x+2];d.push(A,T,T,E,E,A)}}else if(g!==void 0){const v=g.array;_=g.version;for(let x=0,M=v.length/3-1;x<M;x+=3){const A=x+0,T=x+1,E=x+2;d.push(A,T,T,E,E,A)}}else return;const p=new(Wc(d)?jc:Zc)(d,1);p.version=_;const m=r.get(u);m&&t.remove(m),r.set(u,p)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function am(s,t,e){let n;function i(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){s.drawElements(n,f,r,d*o),e.update(f,n,1)}function c(d,f,g){g!==0&&(s.drawElementsInstanced(n,f,r,d*o,g),e.update(f,n,g))}function h(d,f,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let p=0;for(let m=0;m<g;m++)p+=f[m];e.update(p,n,1)}function u(d,f,g,_){if(g===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<d.length;m++)c(d[m]/o,f[m],_[m]);else{p.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,g);let m=0;for(let v=0;v<g;v++)m+=f[v];for(let v=0;v<_.length;v++)e.update(m,n,_[v])}}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function lm(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function cm(s,t,e){const n=new WeakMap,i=new fe;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(a);if(d===void 0||d.count!==u){let y=function(){P.dispose(),n.delete(a),a.removeEventListener("dispose",y)};var f=y;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,p=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],v=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let M=0;g===!0&&(M=1),_===!0&&(M=2),p===!0&&(M=3);let A=a.attributes.position.count*M,T=1;A>t.maxTextureSize&&(T=Math.ceil(A/t.maxTextureSize),A=t.maxTextureSize);const E=new Float32Array(A*T*4*u),P=new qc(E,A,T,u);P.type=dn,P.needsUpdate=!0;const N=M*4;for(let b=0;b<u;b++){const k=m[b],F=v[b],G=x[b],Y=A*T*4*b;for(let z=0;z<k.count;z++){const K=z*N;g===!0&&(i.fromBufferAttribute(k,z),E[Y+K+0]=i.x,E[Y+K+1]=i.y,E[Y+K+2]=i.z,E[Y+K+3]=0),_===!0&&(i.fromBufferAttribute(F,z),E[Y+K+4]=i.x,E[Y+K+5]=i.y,E[Y+K+6]=i.z,E[Y+K+7]=0),p===!0&&(i.fromBufferAttribute(G,z),E[Y+K+8]=i.x,E[Y+K+9]=i.y,E[Y+K+10]=i.z,E[Y+K+11]=G.itemSize===4?i.w:1)}}d={count:u,texture:P,size:new st(A,T)},n.set(a,d),a.addEventListener("dispose",y)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let g=0;for(let p=0;p<c.length;p++)g+=c[p];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",_),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function hm(s,t,e,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(i.get(u)!==c&&(t.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}class nh extends Ce{constructor(t,e,n,i,r,o,a,l,c,h=Ni){if(h!==Ni&&h!==Gi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Ni&&(n=oi),n===void 0&&h===Gi&&(n=Hi),super(null,i,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:Ne,this.minFilter=l!==void 0?l:Ne,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const ih=new Ce,Gl=new nh(1,1),sh=new qc,rh=new Yu,oh=new th,Vl=[],Wl=[],Xl=new Float32Array(16),ql=new Float32Array(9),$l=new Float32Array(4);function $i(s,t,e){const n=s[0];if(n<=0||n>0)return s;const i=t*e;let r=Vl[i];if(r===void 0&&(r=new Float32Array(i),Vl[i]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function ve(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function Me(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function Sr(s,t){let e=Wl[t];e===void 0&&(e=new Int32Array(t),Wl[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function um(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function dm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ve(e,t))return;s.uniform2fv(this.addr,t),Me(e,t)}}function fm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ve(e,t))return;s.uniform3fv(this.addr,t),Me(e,t)}}function pm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ve(e,t))return;s.uniform4fv(this.addr,t),Me(e,t)}}function mm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(ve(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Me(e,t)}else{if(ve(e,n))return;$l.set(n),s.uniformMatrix2fv(this.addr,!1,$l),Me(e,n)}}function gm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(ve(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Me(e,t)}else{if(ve(e,n))return;ql.set(n),s.uniformMatrix3fv(this.addr,!1,ql),Me(e,n)}}function xm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(ve(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Me(e,t)}else{if(ve(e,n))return;Xl.set(n),s.uniformMatrix4fv(this.addr,!1,Xl),Me(e,n)}}function _m(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function vm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ve(e,t))return;s.uniform2iv(this.addr,t),Me(e,t)}}function Mm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ve(e,t))return;s.uniform3iv(this.addr,t),Me(e,t)}}function ym(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ve(e,t))return;s.uniform4iv(this.addr,t),Me(e,t)}}function Sm(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function bm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ve(e,t))return;s.uniform2uiv(this.addr,t),Me(e,t)}}function wm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ve(e,t))return;s.uniform3uiv(this.addr,t),Me(e,t)}}function Em(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ve(e,t))return;s.uniform4uiv(this.addr,t),Me(e,t)}}function Tm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Gl.compareFunction=Vc,r=Gl):r=ih,e.setTexture2D(t||r,i)}function Am(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||rh,i)}function Rm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||oh,i)}function Cm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||sh,i)}function Pm(s){switch(s){case 5126:return um;case 35664:return dm;case 35665:return fm;case 35666:return pm;case 35674:return mm;case 35675:return gm;case 35676:return xm;case 5124:case 35670:return _m;case 35667:case 35671:return vm;case 35668:case 35672:return Mm;case 35669:case 35673:return ym;case 5125:return Sm;case 36294:return bm;case 36295:return wm;case 36296:return Em;case 35678:case 36198:case 36298:case 36306:case 35682:return Tm;case 35679:case 36299:case 36307:return Am;case 35680:case 36300:case 36308:case 36293:return Rm;case 36289:case 36303:case 36311:case 36292:return Cm}}function Lm(s,t){s.uniform1fv(this.addr,t)}function Im(s,t){const e=$i(t,this.size,2);s.uniform2fv(this.addr,e)}function Dm(s,t){const e=$i(t,this.size,3);s.uniform3fv(this.addr,e)}function Um(s,t){const e=$i(t,this.size,4);s.uniform4fv(this.addr,e)}function Nm(s,t){const e=$i(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function km(s,t){const e=$i(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function Fm(s,t){const e=$i(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function Om(s,t){s.uniform1iv(this.addr,t)}function Bm(s,t){s.uniform2iv(this.addr,t)}function zm(s,t){s.uniform3iv(this.addr,t)}function Hm(s,t){s.uniform4iv(this.addr,t)}function Gm(s,t){s.uniform1uiv(this.addr,t)}function Vm(s,t){s.uniform2uiv(this.addr,t)}function Wm(s,t){s.uniform3uiv(this.addr,t)}function Xm(s,t){s.uniform4uiv(this.addr,t)}function qm(s,t,e){const n=this.cache,i=t.length,r=Sr(e,i);ve(n,r)||(s.uniform1iv(this.addr,r),Me(n,r));for(let o=0;o!==i;++o)e.setTexture2D(t[o]||ih,r[o])}function $m(s,t,e){const n=this.cache,i=t.length,r=Sr(e,i);ve(n,r)||(s.uniform1iv(this.addr,r),Me(n,r));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||rh,r[o])}function Ym(s,t,e){const n=this.cache,i=t.length,r=Sr(e,i);ve(n,r)||(s.uniform1iv(this.addr,r),Me(n,r));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||oh,r[o])}function Km(s,t,e){const n=this.cache,i=t.length,r=Sr(e,i);ve(n,r)||(s.uniform1iv(this.addr,r),Me(n,r));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||sh,r[o])}function Zm(s){switch(s){case 5126:return Lm;case 35664:return Im;case 35665:return Dm;case 35666:return Um;case 35674:return Nm;case 35675:return km;case 35676:return Fm;case 5124:case 35670:return Om;case 35667:case 35671:return Bm;case 35668:case 35672:return zm;case 35669:case 35673:return Hm;case 5125:return Gm;case 36294:return Vm;case 36295:return Wm;case 36296:return Xm;case 35678:case 36198:case 36298:case 36306:case 35682:return qm;case 35679:case 36299:case 36307:return $m;case 35680:case 36300:case 36308:case 36293:return Ym;case 36289:case 36303:case 36311:case 36292:return Km}}class jm{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Pm(e.type)}}class Jm{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Zm(e.type)}}class Qm{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(t,e[a.id],n)}}}const ho=/(\w+)(\])?(\[|\.)?/g;function Yl(s,t){s.seq.push(t),s.map[t.id]=t}function t0(s,t,e){const n=s.name,i=n.length;for(ho.lastIndex=0;;){const r=ho.exec(n),o=ho.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Yl(e,c===void 0?new jm(a,s,t):new Jm(a,s,t));break}else{let u=e.map[a];u===void 0&&(u=new Qm(a),Yl(e,u)),e=u}}}class lr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=t.getActiveUniform(e,i),o=t.getUniformLocation(e,r.name);t0(r,o,this)}}setValue(t,e,n,i){const r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,r=t.length;i!==r;++i){const o=t[i];o.id in e&&n.push(o)}return n}}function Kl(s,t,e){const n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}const e0=37297;let n0=0;function i0(s,t){const e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function s0(s){const t=ne.getPrimaries(ne.workingColorSpace),e=ne.getPrimaries(s);let n;switch(t===e?n="":t===dr&&e===ur?n="LinearDisplayP3ToLinearSRGB":t===ur&&e===dr&&(n="LinearSRGBToLinearDisplayP3"),s){case Gn:case yr:return[n,"LinearTransferOETF"];case Ye:case Na:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",s),[n,"LinearTransferOETF"]}}function Zl(s,t,e){const n=s.getShaderParameter(t,s.COMPILE_STATUS),i=s.getShaderInfoLog(t).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+i+`

`+i0(s.getShaderSource(t),o)}else return i}function r0(s,t){const e=s0(t);return`vec4 ${s}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function o0(s,t){let e;switch(t){case Mu:e="Linear";break;case yu:e="Reinhard";break;case Su:e="Cineon";break;case Lc:e="ACESFilmic";break;case wu:e="AgX";break;case Eu:e="Neutral";break;case bu:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Ks=new L;function a0(){ne.getLuminanceCoefficients(Ks);const s=Ks.x.toFixed(4),t=Ks.y.toFixed(4),e=Ks.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function l0(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(os).join(`
`)}function c0(s){const t=[];for(const e in s){const n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function h0(s,t){const e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(t,i),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function os(s){return s!==""}function jl(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Jl(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const u0=/^[ \t]*#include +<([\w\d./]+)>/gm;function pa(s){return s.replace(u0,f0)}const d0=new Map;function f0(s,t){let e=Vt[t];if(e===void 0){const n=d0.get(t);if(n!==void 0)e=Vt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return pa(e)}const p0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ql(s){return s.replace(p0,m0)}function m0(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function tc(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function g0(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Rc?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===Cc?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Sn&&(t="SHADOWMAP_TYPE_VSM"),t}function x0(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Bi:case zi:t="ENVMAP_TYPE_CUBE";break;case Mr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function _0(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case zi:t="ENVMAP_MODE_REFRACTION";break}return t}function v0(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Pc:t="ENVMAP_BLENDING_MULTIPLY";break;case _u:t="ENVMAP_BLENDING_MIX";break;case vu:t="ENVMAP_BLENDING_ADD";break}return t}function M0(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function y0(s,t,e,n){const i=s.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=g0(e),c=x0(e),h=_0(e),u=v0(e),d=M0(e),f=l0(e),g=c0(r),_=i.createProgram();let p,m,v=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(os).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(os).join(`
`),m.length>0&&(m+=`
`)):(p=[tc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(os).join(`
`),m=[tc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==On?"#define TONE_MAPPING":"",e.toneMapping!==On?Vt.tonemapping_pars_fragment:"",e.toneMapping!==On?o0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Vt.colorspace_pars_fragment,r0("linearToOutputTexel",e.outputColorSpace),a0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(os).join(`
`)),o=pa(o),o=jl(o,e),o=Jl(o,e),a=pa(a),a=jl(a,e),a=Jl(a,e),o=Ql(o),a=Ql(a),e.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===xl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===xl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=v+p+o,M=v+m+a,A=Kl(i,i.VERTEX_SHADER,x),T=Kl(i,i.FRAGMENT_SHADER,M);i.attachShader(_,A),i.attachShader(_,T),e.index0AttributeName!==void 0?i.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function E(b){if(s.debug.checkShaderErrors){const k=i.getProgramInfoLog(_).trim(),F=i.getShaderInfoLog(A).trim(),G=i.getShaderInfoLog(T).trim();let Y=!0,z=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(Y=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,_,A,T);else{const K=Zl(i,A,"vertex"),V=Zl(i,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+b.name+`
Material Type: `+b.type+`

Program Info Log: `+k+`
`+K+`
`+V)}else k!==""?console.warn("THREE.WebGLProgram: Program Info Log:",k):(F===""||G==="")&&(z=!1);z&&(b.diagnostics={runnable:Y,programLog:k,vertexShader:{log:F,prefix:p},fragmentShader:{log:G,prefix:m}})}i.deleteShader(A),i.deleteShader(T),P=new lr(i,_),N=h0(i,_)}let P;this.getUniforms=function(){return P===void 0&&E(this),P};let N;this.getAttributes=function(){return N===void 0&&E(this),N};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=i.getProgramParameter(_,e0)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=n0++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=A,this.fragmentShader=T,this}let S0=0;class b0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new w0(t),e.set(t,n)),n}}class w0{constructor(t){this.id=S0++,this.code=t,this.usedTimes=0}}function E0(s,t,e,n,i,r,o){const a=new $c,l=new b0,c=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.reverseDepthBuffer,f=i.vertexTextures;let g=i.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(y){return c.add(y),y===0?"uv":`uv${y}`}function m(y,b,k,F,G){const Y=F.fog,z=G.geometry,K=y.isMeshStandardMaterial?F.environment:null,V=(y.isMeshStandardMaterial?e:t).get(y.envMap||K),ut=V&&V.mapping===Mr?V.image.height:null,dt=_[y.type];y.precision!==null&&(g=i.getMaxPrecision(y.precision),g!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",g,"instead."));const ft=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,qt=ft!==void 0?ft.length:0;let Kt=0;z.morphAttributes.position!==void 0&&(Kt=1),z.morphAttributes.normal!==void 0&&(Kt=2),z.morphAttributes.color!==void 0&&(Kt=3);let X,tt,St,ht;if(dt){const De=hn[dt];X=De.vertexShader,tt=De.fragmentShader}else X=y.vertexShader,tt=y.fragmentShader,l.update(y),St=l.getVertexShaderID(y),ht=l.getFragmentShaderID(y);const Ut=s.getRenderTarget(),Dt=G.isInstancedMesh===!0,Ht=G.isBatchedMesh===!0,$t=!!y.map,Z=!!y.matcap,C=!!V,rt=!!y.aoMap,it=!!y.lightMap,Q=!!y.bumpMap,ot=!!y.normalMap,Pt=!!y.displacementMap,xt=!!y.emissiveMap,R=!!y.metalnessMap,S=!!y.roughnessMap,O=y.anisotropy>0,q=y.clearcoat>0,j=y.dispersion>0,$=y.iridescence>0,At=y.sheen>0,lt=y.transmission>0,Mt=O&&!!y.anisotropyMap,Zt=q&&!!y.clearcoatMap,et=q&&!!y.clearcoatNormalMap,yt=q&&!!y.clearcoatRoughnessMap,Ot=$&&!!y.iridescenceMap,Bt=$&&!!y.iridescenceThicknessMap,bt=At&&!!y.sheenColorMap,jt=At&&!!y.sheenRoughnessMap,Gt=!!y.specularMap,re=!!y.specularColorMap,I=!!y.specularIntensityMap,_t=lt&&!!y.transmissionMap,W=lt&&!!y.thicknessMap,J=!!y.gradientMap,mt=!!y.alphaMap,vt=y.alphaTest>0,Jt=!!y.alphaHash,me=!!y.extensions;let Ie=On;y.toneMapped&&(Ut===null||Ut.isXRRenderTarget===!0)&&(Ie=s.toneMapping);const Qt={shaderID:dt,shaderType:y.type,shaderName:y.name,vertexShader:X,fragmentShader:tt,defines:y.defines,customVertexShaderID:St,customFragmentShaderID:ht,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:g,batching:Ht,batchingColor:Ht&&G._colorsTexture!==null,instancing:Dt,instancingColor:Dt&&G.instanceColor!==null,instancingMorph:Dt&&G.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:Ut===null?s.outputColorSpace:Ut.isXRRenderTarget===!0?Ut.texture.colorSpace:Gn,alphaToCoverage:!!y.alphaToCoverage,map:$t,matcap:Z,envMap:C,envMapMode:C&&V.mapping,envMapCubeUVHeight:ut,aoMap:rt,lightMap:it,bumpMap:Q,normalMap:ot,displacementMap:f&&Pt,emissiveMap:xt,normalMapObjectSpace:ot&&y.normalMapType===Cu,normalMapTangentSpace:ot&&y.normalMapType===Gc,metalnessMap:R,roughnessMap:S,anisotropy:O,anisotropyMap:Mt,clearcoat:q,clearcoatMap:Zt,clearcoatNormalMap:et,clearcoatRoughnessMap:yt,dispersion:j,iridescence:$,iridescenceMap:Ot,iridescenceThicknessMap:Bt,sheen:At,sheenColorMap:bt,sheenRoughnessMap:jt,specularMap:Gt,specularColorMap:re,specularIntensityMap:I,transmission:lt,transmissionMap:_t,thicknessMap:W,gradientMap:J,opaque:y.transparent===!1&&y.blending===Ui&&y.alphaToCoverage===!1,alphaMap:mt,alphaTest:vt,alphaHash:Jt,combine:y.combine,mapUv:$t&&p(y.map.channel),aoMapUv:rt&&p(y.aoMap.channel),lightMapUv:it&&p(y.lightMap.channel),bumpMapUv:Q&&p(y.bumpMap.channel),normalMapUv:ot&&p(y.normalMap.channel),displacementMapUv:Pt&&p(y.displacementMap.channel),emissiveMapUv:xt&&p(y.emissiveMap.channel),metalnessMapUv:R&&p(y.metalnessMap.channel),roughnessMapUv:S&&p(y.roughnessMap.channel),anisotropyMapUv:Mt&&p(y.anisotropyMap.channel),clearcoatMapUv:Zt&&p(y.clearcoatMap.channel),clearcoatNormalMapUv:et&&p(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:yt&&p(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Ot&&p(y.iridescenceMap.channel),iridescenceThicknessMapUv:Bt&&p(y.iridescenceThicknessMap.channel),sheenColorMapUv:bt&&p(y.sheenColorMap.channel),sheenRoughnessMapUv:jt&&p(y.sheenRoughnessMap.channel),specularMapUv:Gt&&p(y.specularMap.channel),specularColorMapUv:re&&p(y.specularColorMap.channel),specularIntensityMapUv:I&&p(y.specularIntensityMap.channel),transmissionMapUv:_t&&p(y.transmissionMap.channel),thicknessMapUv:W&&p(y.thicknessMap.channel),alphaMapUv:mt&&p(y.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(ot||O),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!z.attributes.uv&&($t||mt),fog:!!Y,useFog:y.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:d,skinning:G.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:qt,morphTextureStride:Kt,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:s.shadowMap.enabled&&k.length>0,shadowMapType:s.shadowMap.type,toneMapping:Ie,decodeVideoTexture:$t&&y.map.isVideoTexture===!0&&ne.getTransfer(y.map.colorSpace)===le,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===rn,flipSided:y.side===Fe,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:me&&y.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(me&&y.extensions.multiDraw===!0||Ht)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Qt.vertexUv1s=c.has(1),Qt.vertexUv2s=c.has(2),Qt.vertexUv3s=c.has(3),c.clear(),Qt}function v(y){const b=[];if(y.shaderID?b.push(y.shaderID):(b.push(y.customVertexShaderID),b.push(y.customFragmentShaderID)),y.defines!==void 0)for(const k in y.defines)b.push(k),b.push(y.defines[k]);return y.isRawShaderMaterial===!1&&(x(b,y),M(b,y),b.push(s.outputColorSpace)),b.push(y.customProgramCacheKey),b.join()}function x(y,b){y.push(b.precision),y.push(b.outputColorSpace),y.push(b.envMapMode),y.push(b.envMapCubeUVHeight),y.push(b.mapUv),y.push(b.alphaMapUv),y.push(b.lightMapUv),y.push(b.aoMapUv),y.push(b.bumpMapUv),y.push(b.normalMapUv),y.push(b.displacementMapUv),y.push(b.emissiveMapUv),y.push(b.metalnessMapUv),y.push(b.roughnessMapUv),y.push(b.anisotropyMapUv),y.push(b.clearcoatMapUv),y.push(b.clearcoatNormalMapUv),y.push(b.clearcoatRoughnessMapUv),y.push(b.iridescenceMapUv),y.push(b.iridescenceThicknessMapUv),y.push(b.sheenColorMapUv),y.push(b.sheenRoughnessMapUv),y.push(b.specularMapUv),y.push(b.specularColorMapUv),y.push(b.specularIntensityMapUv),y.push(b.transmissionMapUv),y.push(b.thicknessMapUv),y.push(b.combine),y.push(b.fogExp2),y.push(b.sizeAttenuation),y.push(b.morphTargetsCount),y.push(b.morphAttributeCount),y.push(b.numDirLights),y.push(b.numPointLights),y.push(b.numSpotLights),y.push(b.numSpotLightMaps),y.push(b.numHemiLights),y.push(b.numRectAreaLights),y.push(b.numDirLightShadows),y.push(b.numPointLightShadows),y.push(b.numSpotLightShadows),y.push(b.numSpotLightShadowsWithMaps),y.push(b.numLightProbes),y.push(b.shadowMapType),y.push(b.toneMapping),y.push(b.numClippingPlanes),y.push(b.numClipIntersection),y.push(b.depthPacking)}function M(y,b){a.disableAll(),b.supportsVertexTextures&&a.enable(0),b.instancing&&a.enable(1),b.instancingColor&&a.enable(2),b.instancingMorph&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),b.dispersion&&a.enable(20),b.batchingColor&&a.enable(21),y.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reverseDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.alphaToCoverage&&a.enable(20),y.push(a.mask)}function A(y){const b=_[y.type];let k;if(b){const F=hn[b];k=ad.clone(F.uniforms)}else k=y.uniforms;return k}function T(y,b){let k;for(let F=0,G=h.length;F<G;F++){const Y=h[F];if(Y.cacheKey===b){k=Y,++k.usedTimes;break}}return k===void 0&&(k=new y0(s,b,y,r),h.push(k)),k}function E(y){if(--y.usedTimes===0){const b=h.indexOf(y);h[b]=h[h.length-1],h.pop(),y.destroy()}}function P(y){l.remove(y)}function N(){l.dispose()}return{getParameters:m,getProgramCacheKey:v,getUniforms:A,acquireProgram:T,releaseProgram:E,releaseShaderCache:P,programs:h,dispose:N}}function T0(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function A0(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function ec(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function nc(){const s=[];let t=0;const e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function o(u,d,f,g,_,p){let m=s[t];return m===void 0?(m={id:u.id,object:u,geometry:d,material:f,groupOrder:g,renderOrder:u.renderOrder,z:_,group:p},s[t]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=f,m.groupOrder=g,m.renderOrder=u.renderOrder,m.z=_,m.group=p),t++,m}function a(u,d,f,g,_,p){const m=o(u,d,f,g,_,p);f.transmission>0?n.push(m):f.transparent===!0?i.push(m):e.push(m)}function l(u,d,f,g,_,p){const m=o(u,d,f,g,_,p);f.transmission>0?n.unshift(m):f.transparent===!0?i.unshift(m):e.unshift(m)}function c(u,d){e.length>1&&e.sort(u||A0),n.length>1&&n.sort(d||ec),i.length>1&&i.sort(d||ec)}function h(){for(let u=t,d=s.length;u<d;u++){const f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:a,unshift:l,finish:h,sort:c}}function R0(){let s=new WeakMap;function t(n,i){const r=s.get(n);let o;return r===void 0?(o=new nc,s.set(n,[o])):i>=r.length?(o=new nc,r.push(o)):o=r[i],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function C0(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new Yt};break;case"SpotLight":e={position:new L,direction:new L,color:new Yt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new Yt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new Yt,groundColor:new Yt};break;case"RectAreaLight":e={color:new Yt,position:new L,halfWidth:new L,halfHeight:new L};break}return s[t.id]=e,e}}}function P0(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let L0=0;function I0(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function D0(s){const t=new C0,e=P0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);const i=new L,r=new se,o=new se;function a(c){let h=0,u=0,d=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let f=0,g=0,_=0,p=0,m=0,v=0,x=0,M=0,A=0,T=0,E=0;c.sort(I0);for(let N=0,y=c.length;N<y;N++){const b=c[N],k=b.color,F=b.intensity,G=b.distance,Y=b.shadow&&b.shadow.map?b.shadow.map.texture:null;if(b.isAmbientLight)h+=k.r*F,u+=k.g*F,d+=k.b*F;else if(b.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(b.sh.coefficients[z],F);E++}else if(b.isDirectionalLight){const z=t.get(b);if(z.color.copy(b.color).multiplyScalar(b.intensity),b.castShadow){const K=b.shadow,V=e.get(b);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,n.directionalShadow[f]=V,n.directionalShadowMap[f]=Y,n.directionalShadowMatrix[f]=b.shadow.matrix,v++}n.directional[f]=z,f++}else if(b.isSpotLight){const z=t.get(b);z.position.setFromMatrixPosition(b.matrixWorld),z.color.copy(k).multiplyScalar(F),z.distance=G,z.coneCos=Math.cos(b.angle),z.penumbraCos=Math.cos(b.angle*(1-b.penumbra)),z.decay=b.decay,n.spot[_]=z;const K=b.shadow;if(b.map&&(n.spotLightMap[A]=b.map,A++,K.updateMatrices(b),b.castShadow&&T++),n.spotLightMatrix[_]=K.matrix,b.castShadow){const V=e.get(b);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,n.spotShadow[_]=V,n.spotShadowMap[_]=Y,M++}_++}else if(b.isRectAreaLight){const z=t.get(b);z.color.copy(k).multiplyScalar(F),z.halfWidth.set(b.width*.5,0,0),z.halfHeight.set(0,b.height*.5,0),n.rectArea[p]=z,p++}else if(b.isPointLight){const z=t.get(b);if(z.color.copy(b.color).multiplyScalar(b.intensity),z.distance=b.distance,z.decay=b.decay,b.castShadow){const K=b.shadow,V=e.get(b);V.shadowIntensity=K.intensity,V.shadowBias=K.bias,V.shadowNormalBias=K.normalBias,V.shadowRadius=K.radius,V.shadowMapSize=K.mapSize,V.shadowCameraNear=K.camera.near,V.shadowCameraFar=K.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=Y,n.pointShadowMatrix[g]=b.shadow.matrix,x++}n.point[g]=z,g++}else if(b.isHemisphereLight){const z=t.get(b);z.skyColor.copy(b.color).multiplyScalar(F),z.groundColor.copy(b.groundColor).multiplyScalar(F),n.hemi[m]=z,m++}}p>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ct.LTC_FLOAT_1,n.rectAreaLTC2=ct.LTC_FLOAT_2):(n.rectAreaLTC1=ct.LTC_HALF_1,n.rectAreaLTC2=ct.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const P=n.hash;(P.directionalLength!==f||P.pointLength!==g||P.spotLength!==_||P.rectAreaLength!==p||P.hemiLength!==m||P.numDirectionalShadows!==v||P.numPointShadows!==x||P.numSpotShadows!==M||P.numSpotMaps!==A||P.numLightProbes!==E)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=p,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=v,n.directionalShadowMap.length=v,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=v,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=M+A-T,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=E,P.directionalLength=f,P.pointLength=g,P.spotLength=_,P.rectAreaLength=p,P.hemiLength=m,P.numDirectionalShadows=v,P.numPointShadows=x,P.numSpotShadows=M,P.numSpotMaps=A,P.numLightProbes=E,n.version=L0++)}function l(c,h){let u=0,d=0,f=0,g=0,_=0;const p=h.matrixWorldInverse;for(let m=0,v=c.length;m<v;m++){const x=c[m];if(x.isDirectionalLight){const M=n.directional[u];M.direction.setFromMatrixPosition(x.matrixWorld),i.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(i),M.direction.transformDirection(p),u++}else if(x.isSpotLight){const M=n.spot[f];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(p),M.direction.setFromMatrixPosition(x.matrixWorld),i.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(i),M.direction.transformDirection(p),f++}else if(x.isRectAreaLight){const M=n.rectArea[g];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(p),o.identity(),r.copy(x.matrixWorld),r.premultiply(p),o.extractRotation(r),M.halfWidth.set(x.width*.5,0,0),M.halfHeight.set(0,x.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(x.isPointLight){const M=n.point[d];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(p),d++}else if(x.isHemisphereLight){const M=n.hemi[_];M.direction.setFromMatrixPosition(x.matrixWorld),M.direction.transformDirection(p),_++}}}return{setup:a,setupView:l,state:n}}function ic(s){const t=new D0(s),e=[],n=[];function i(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function U0(s){let t=new WeakMap;function e(i,r=0){const o=t.get(i);let a;return o===void 0?(a=new ic(s),t.set(i,[a])):r>=o.length?(a=new ic(s),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class N0 extends Es{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Au,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class k0 extends Es{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const F0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,O0=`uniform sampler2D shadow_pass;
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
}`;function B0(s,t,e){let n=new ka;const i=new st,r=new st,o=new fe,a=new N0({depthPacking:Ru}),l=new k0,c={},h=e.maxTextureSize,u={[zn]:Fe,[Fe]:zn,[rn]:rn},d=new Hn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new st},radius:{value:4}},vertexShader:F0,fragmentShader:O0}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new Le;g.setAttribute("position",new Ge(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ke(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Rc;let m=this.type;this.render=function(T,E,P){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||T.length===0)return;const N=s.getRenderTarget(),y=s.getActiveCubeFace(),b=s.getActiveMipmapLevel(),k=s.state;k.setBlending(Fn),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const F=m!==Sn&&this.type===Sn,G=m===Sn&&this.type!==Sn;for(let Y=0,z=T.length;Y<z;Y++){const K=T[Y],V=K.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;i.copy(V.mapSize);const ut=V.getFrameExtents();if(i.multiply(ut),r.copy(V.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/ut.x),i.x=r.x*ut.x,V.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/ut.y),i.y=r.y*ut.y,V.mapSize.y=r.y)),V.map===null||F===!0||G===!0){const ft=this.type!==Sn?{minFilter:Ne,magFilter:Ne}:{};V.map!==null&&V.map.dispose(),V.map=new ai(i.x,i.y,ft),V.map.texture.name=K.name+".shadowMap",V.camera.updateProjectionMatrix()}s.setRenderTarget(V.map),s.clear();const dt=V.getViewportCount();for(let ft=0;ft<dt;ft++){const qt=V.getViewport(ft);o.set(r.x*qt.x,r.y*qt.y,r.x*qt.z,r.y*qt.w),k.viewport(o),V.updateMatrices(K,ft),n=V.getFrustum(),M(E,P,V.camera,K,this.type)}V.isPointLightShadow!==!0&&this.type===Sn&&v(V,P),V.needsUpdate=!1}m=this.type,p.needsUpdate=!1,s.setRenderTarget(N,y,b)};function v(T,E){const P=t.update(_);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new ai(i.x,i.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,s.setRenderTarget(T.mapPass),s.clear(),s.renderBufferDirect(E,null,P,d,_,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,s.setRenderTarget(T.map),s.clear(),s.renderBufferDirect(E,null,P,f,_,null)}function x(T,E,P,N){let y=null;const b=P.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(b!==void 0)y=b;else if(y=P.isPointLight===!0?l:a,s.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0){const k=y.uuid,F=E.uuid;let G=c[k];G===void 0&&(G={},c[k]=G);let Y=G[F];Y===void 0&&(Y=y.clone(),G[F]=Y,E.addEventListener("dispose",A)),y=Y}if(y.visible=E.visible,y.wireframe=E.wireframe,N===Sn?y.side=E.shadowSide!==null?E.shadowSide:E.side:y.side=E.shadowSide!==null?E.shadowSide:u[E.side],y.alphaMap=E.alphaMap,y.alphaTest=E.alphaTest,y.map=E.map,y.clipShadows=E.clipShadows,y.clippingPlanes=E.clippingPlanes,y.clipIntersection=E.clipIntersection,y.displacementMap=E.displacementMap,y.displacementScale=E.displacementScale,y.displacementBias=E.displacementBias,y.wireframeLinewidth=E.wireframeLinewidth,y.linewidth=E.linewidth,P.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const k=s.properties.get(y);k.light=P}return y}function M(T,E,P,N,y){if(T.visible===!1)return;if(T.layers.test(E.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&y===Sn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,T.matrixWorld);const F=t.update(T),G=T.material;if(Array.isArray(G)){const Y=F.groups;for(let z=0,K=Y.length;z<K;z++){const V=Y[z],ut=G[V.materialIndex];if(ut&&ut.visible){const dt=x(T,ut,N,y);T.onBeforeShadow(s,T,E,P,F,dt,V),s.renderBufferDirect(P,null,F,dt,T,V),T.onAfterShadow(s,T,E,P,F,dt,V)}}}else if(G.visible){const Y=x(T,G,N,y);T.onBeforeShadow(s,T,E,P,F,Y,null),s.renderBufferDirect(P,null,F,Y,T,null),T.onAfterShadow(s,T,E,P,F,Y,null)}}const k=T.children;for(let F=0,G=k.length;F<G;F++)M(k[F],E,P,N,y)}function A(T){T.target.removeEventListener("dispose",A);for(const P in c){const N=c[P],y=T.target.uuid;y in N&&(N[y].dispose(),delete N[y])}}}const z0={[Lo]:Io,[Do]:ko,[Uo]:Fo,[Oi]:No,[Io]:Lo,[ko]:Do,[Fo]:Uo,[No]:Oi};function H0(s){function t(){let I=!1;const _t=new fe;let W=null;const J=new fe(0,0,0,0);return{setMask:function(mt){W!==mt&&!I&&(s.colorMask(mt,mt,mt,mt),W=mt)},setLocked:function(mt){I=mt},setClear:function(mt,vt,Jt,me,Ie){Ie===!0&&(mt*=me,vt*=me,Jt*=me),_t.set(mt,vt,Jt,me),J.equals(_t)===!1&&(s.clearColor(mt,vt,Jt,me),J.copy(_t))},reset:function(){I=!1,W=null,J.set(-1,0,0,0)}}}function e(){let I=!1,_t=!1,W=null,J=null,mt=null;return{setReversed:function(vt){_t=vt},setTest:function(vt){vt?St(s.DEPTH_TEST):ht(s.DEPTH_TEST)},setMask:function(vt){W!==vt&&!I&&(s.depthMask(vt),W=vt)},setFunc:function(vt){if(_t&&(vt=z0[vt]),J!==vt){switch(vt){case Lo:s.depthFunc(s.NEVER);break;case Io:s.depthFunc(s.ALWAYS);break;case Do:s.depthFunc(s.LESS);break;case Oi:s.depthFunc(s.LEQUAL);break;case Uo:s.depthFunc(s.EQUAL);break;case No:s.depthFunc(s.GEQUAL);break;case ko:s.depthFunc(s.GREATER);break;case Fo:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}J=vt}},setLocked:function(vt){I=vt},setClear:function(vt){mt!==vt&&(s.clearDepth(vt),mt=vt)},reset:function(){I=!1,W=null,J=null,mt=null}}}function n(){let I=!1,_t=null,W=null,J=null,mt=null,vt=null,Jt=null,me=null,Ie=null;return{setTest:function(Qt){I||(Qt?St(s.STENCIL_TEST):ht(s.STENCIL_TEST))},setMask:function(Qt){_t!==Qt&&!I&&(s.stencilMask(Qt),_t=Qt)},setFunc:function(Qt,De,gn){(W!==Qt||J!==De||mt!==gn)&&(s.stencilFunc(Qt,De,gn),W=Qt,J=De,mt=gn)},setOp:function(Qt,De,gn){(vt!==Qt||Jt!==De||me!==gn)&&(s.stencilOp(Qt,De,gn),vt=Qt,Jt=De,me=gn)},setLocked:function(Qt){I=Qt},setClear:function(Qt){Ie!==Qt&&(s.clearStencil(Qt),Ie=Qt)},reset:function(){I=!1,_t=null,W=null,J=null,mt=null,vt=null,Jt=null,me=null,Ie=null}}}const i=new t,r=new e,o=new n,a=new WeakMap,l=new WeakMap;let c={},h={},u=new WeakMap,d=[],f=null,g=!1,_=null,p=null,m=null,v=null,x=null,M=null,A=null,T=new Yt(0,0,0),E=0,P=!1,N=null,y=null,b=null,k=null,F=null;const G=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,z=0;const K=s.getParameter(s.VERSION);K.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\d)/.exec(K)[1]),Y=z>=1):K.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),Y=z>=2);let V=null,ut={};const dt=s.getParameter(s.SCISSOR_BOX),ft=s.getParameter(s.VIEWPORT),qt=new fe().fromArray(dt),Kt=new fe().fromArray(ft);function X(I,_t,W,J){const mt=new Uint8Array(4),vt=s.createTexture();s.bindTexture(I,vt),s.texParameteri(I,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(I,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Jt=0;Jt<W;Jt++)I===s.TEXTURE_3D||I===s.TEXTURE_2D_ARRAY?s.texImage3D(_t,0,s.RGBA,1,1,J,0,s.RGBA,s.UNSIGNED_BYTE,mt):s.texImage2D(_t+Jt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,mt);return vt}const tt={};tt[s.TEXTURE_2D]=X(s.TEXTURE_2D,s.TEXTURE_2D,1),tt[s.TEXTURE_CUBE_MAP]=X(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),tt[s.TEXTURE_2D_ARRAY]=X(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),tt[s.TEXTURE_3D]=X(s.TEXTURE_3D,s.TEXTURE_3D,1,1),i.setClear(0,0,0,1),r.setClear(1),o.setClear(0),St(s.DEPTH_TEST),r.setFunc(Oi),it(!1),Q(ul),St(s.CULL_FACE),C(Fn);function St(I){c[I]!==!0&&(s.enable(I),c[I]=!0)}function ht(I){c[I]!==!1&&(s.disable(I),c[I]=!1)}function Ut(I,_t){return h[I]!==_t?(s.bindFramebuffer(I,_t),h[I]=_t,I===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=_t),I===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=_t),!0):!1}function Dt(I,_t){let W=d,J=!1;if(I){W=u.get(_t),W===void 0&&(W=[],u.set(_t,W));const mt=I.textures;if(W.length!==mt.length||W[0]!==s.COLOR_ATTACHMENT0){for(let vt=0,Jt=mt.length;vt<Jt;vt++)W[vt]=s.COLOR_ATTACHMENT0+vt;W.length=mt.length,J=!0}}else W[0]!==s.BACK&&(W[0]=s.BACK,J=!0);J&&s.drawBuffers(W)}function Ht(I){return f!==I?(s.useProgram(I),f=I,!0):!1}const $t={[Qn]:s.FUNC_ADD,[eu]:s.FUNC_SUBTRACT,[nu]:s.FUNC_REVERSE_SUBTRACT};$t[iu]=s.MIN,$t[su]=s.MAX;const Z={[ru]:s.ZERO,[ou]:s.ONE,[au]:s.SRC_COLOR,[Co]:s.SRC_ALPHA,[fu]:s.SRC_ALPHA_SATURATE,[uu]:s.DST_COLOR,[cu]:s.DST_ALPHA,[lu]:s.ONE_MINUS_SRC_COLOR,[Po]:s.ONE_MINUS_SRC_ALPHA,[du]:s.ONE_MINUS_DST_COLOR,[hu]:s.ONE_MINUS_DST_ALPHA,[pu]:s.CONSTANT_COLOR,[mu]:s.ONE_MINUS_CONSTANT_COLOR,[gu]:s.CONSTANT_ALPHA,[xu]:s.ONE_MINUS_CONSTANT_ALPHA};function C(I,_t,W,J,mt,vt,Jt,me,Ie,Qt){if(I===Fn){g===!0&&(ht(s.BLEND),g=!1);return}if(g===!1&&(St(s.BLEND),g=!0),I!==tu){if(I!==_||Qt!==P){if((p!==Qn||x!==Qn)&&(s.blendEquation(s.FUNC_ADD),p=Qn,x=Qn),Qt)switch(I){case Ui:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case dl:s.blendFunc(s.ONE,s.ONE);break;case fl:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case pl:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Ui:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case dl:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case fl:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case pl:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}m=null,v=null,M=null,A=null,T.set(0,0,0),E=0,_=I,P=Qt}return}mt=mt||_t,vt=vt||W,Jt=Jt||J,(_t!==p||mt!==x)&&(s.blendEquationSeparate($t[_t],$t[mt]),p=_t,x=mt),(W!==m||J!==v||vt!==M||Jt!==A)&&(s.blendFuncSeparate(Z[W],Z[J],Z[vt],Z[Jt]),m=W,v=J,M=vt,A=Jt),(me.equals(T)===!1||Ie!==E)&&(s.blendColor(me.r,me.g,me.b,Ie),T.copy(me),E=Ie),_=I,P=!1}function rt(I,_t){I.side===rn?ht(s.CULL_FACE):St(s.CULL_FACE);let W=I.side===Fe;_t&&(W=!W),it(W),I.blending===Ui&&I.transparent===!1?C(Fn):C(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),r.setFunc(I.depthFunc),r.setTest(I.depthTest),r.setMask(I.depthWrite),i.setMask(I.colorWrite);const J=I.stencilWrite;o.setTest(J),J&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Pt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?St(s.SAMPLE_ALPHA_TO_COVERAGE):ht(s.SAMPLE_ALPHA_TO_COVERAGE)}function it(I){N!==I&&(I?s.frontFace(s.CW):s.frontFace(s.CCW),N=I)}function Q(I){I!==Jh?(St(s.CULL_FACE),I!==y&&(I===ul?s.cullFace(s.BACK):I===Qh?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):ht(s.CULL_FACE),y=I}function ot(I){I!==b&&(Y&&s.lineWidth(I),b=I)}function Pt(I,_t,W){I?(St(s.POLYGON_OFFSET_FILL),(k!==_t||F!==W)&&(s.polygonOffset(_t,W),k=_t,F=W)):ht(s.POLYGON_OFFSET_FILL)}function xt(I){I?St(s.SCISSOR_TEST):ht(s.SCISSOR_TEST)}function R(I){I===void 0&&(I=s.TEXTURE0+G-1),V!==I&&(s.activeTexture(I),V=I)}function S(I,_t,W){W===void 0&&(V===null?W=s.TEXTURE0+G-1:W=V);let J=ut[W];J===void 0&&(J={type:void 0,texture:void 0},ut[W]=J),(J.type!==I||J.texture!==_t)&&(V!==W&&(s.activeTexture(W),V=W),s.bindTexture(I,_t||tt[I]),J.type=I,J.texture=_t)}function O(){const I=ut[V];I!==void 0&&I.type!==void 0&&(s.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function q(){try{s.compressedTexImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function j(){try{s.compressedTexImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function $(){try{s.texSubImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function At(){try{s.texSubImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function lt(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Mt(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Zt(){try{s.texStorage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function et(){try{s.texStorage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function yt(){try{s.texImage2D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ot(){try{s.texImage3D.apply(s,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Bt(I){qt.equals(I)===!1&&(s.scissor(I.x,I.y,I.z,I.w),qt.copy(I))}function bt(I){Kt.equals(I)===!1&&(s.viewport(I.x,I.y,I.z,I.w),Kt.copy(I))}function jt(I,_t){let W=l.get(_t);W===void 0&&(W=new WeakMap,l.set(_t,W));let J=W.get(I);J===void 0&&(J=s.getUniformBlockIndex(_t,I.name),W.set(I,J))}function Gt(I,_t){const J=l.get(_t).get(I);a.get(_t)!==J&&(s.uniformBlockBinding(_t,J,I.__bindingPointIndex),a.set(_t,J))}function re(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),c={},V=null,ut={},h={},u=new WeakMap,d=[],f=null,g=!1,_=null,p=null,m=null,v=null,x=null,M=null,A=null,T=new Yt(0,0,0),E=0,P=!1,N=null,y=null,b=null,k=null,F=null,qt.set(0,0,s.canvas.width,s.canvas.height),Kt.set(0,0,s.canvas.width,s.canvas.height),i.reset(),r.reset(),o.reset()}return{buffers:{color:i,depth:r,stencil:o},enable:St,disable:ht,bindFramebuffer:Ut,drawBuffers:Dt,useProgram:Ht,setBlending:C,setMaterial:rt,setFlipSided:it,setCullFace:Q,setLineWidth:ot,setPolygonOffset:Pt,setScissorTest:xt,activeTexture:R,bindTexture:S,unbindTexture:O,compressedTexImage2D:q,compressedTexImage3D:j,texImage2D:yt,texImage3D:Ot,updateUBOMapping:jt,uniformBlockBinding:Gt,texStorage2D:Zt,texStorage3D:et,texSubImage2D:$,texSubImage3D:At,compressedTexSubImage2D:lt,compressedTexSubImage3D:Mt,scissor:Bt,viewport:bt,reset:re}}function sc(s,t,e,n){const i=G0(n);switch(e){case kc:return s*t;case Oc:return s*t;case Bc:return s*t*2;case La:return s*t/i.components*i.byteLength;case Ia:return s*t/i.components*i.byteLength;case zc:return s*t*2/i.components*i.byteLength;case Da:return s*t*2/i.components*i.byteLength;case Fc:return s*t*3/i.components*i.byteLength;case ln:return s*t*4/i.components*i.byteLength;case Ua:return s*t*4/i.components*i.byteLength;case nr:case ir:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case sr:case rr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Go:case Wo:return Math.max(s,16)*Math.max(t,8)/4;case Ho:case Vo:return Math.max(s,8)*Math.max(t,8)/2;case Xo:case qo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case $o:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Yo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ko:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case Zo:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case jo:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Jo:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Qo:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case ta:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case ea:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case na:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case ia:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case sa:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case ra:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case oa:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case aa:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case or:case la:case ca:return Math.ceil(s/4)*Math.ceil(t/4)*16;case Hc:case ha:return Math.ceil(s/4)*Math.ceil(t/4)*8;case ua:case da:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function G0(s){switch(s){case Tn:case Dc:return{byteLength:1,components:1};case ps:case Uc:case bs:return{byteLength:2,components:1};case Ca:case Pa:return{byteLength:2,components:4};case oi:case Ra:case dn:return{byteLength:4,components:1};case Nc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function V0(s,t,e,n,i,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new st,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,S){return f?new OffscreenCanvas(R,S):pr("canvas")}function _(R,S,O){let q=1;const j=xt(R);if((j.width>O||j.height>O)&&(q=O/Math.max(j.width,j.height)),q<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const $=Math.floor(q*j.width),At=Math.floor(q*j.height);u===void 0&&(u=g($,At));const lt=S?g($,At):u;return lt.width=$,lt.height=At,lt.getContext("2d").drawImage(R,0,0,$,At),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+$+"x"+At+")."),lt}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),R;return R}function p(R){return R.generateMipmaps&&R.minFilter!==Ne&&R.minFilter!==on}function m(R){s.generateMipmap(R)}function v(R,S,O,q,j=!1){if(R!==null){if(s[R]!==void 0)return s[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let $=S;if(S===s.RED&&(O===s.FLOAT&&($=s.R32F),O===s.HALF_FLOAT&&($=s.R16F),O===s.UNSIGNED_BYTE&&($=s.R8)),S===s.RED_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.R8UI),O===s.UNSIGNED_SHORT&&($=s.R16UI),O===s.UNSIGNED_INT&&($=s.R32UI),O===s.BYTE&&($=s.R8I),O===s.SHORT&&($=s.R16I),O===s.INT&&($=s.R32I)),S===s.RG&&(O===s.FLOAT&&($=s.RG32F),O===s.HALF_FLOAT&&($=s.RG16F),O===s.UNSIGNED_BYTE&&($=s.RG8)),S===s.RG_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RG8UI),O===s.UNSIGNED_SHORT&&($=s.RG16UI),O===s.UNSIGNED_INT&&($=s.RG32UI),O===s.BYTE&&($=s.RG8I),O===s.SHORT&&($=s.RG16I),O===s.INT&&($=s.RG32I)),S===s.RGB_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RGB8UI),O===s.UNSIGNED_SHORT&&($=s.RGB16UI),O===s.UNSIGNED_INT&&($=s.RGB32UI),O===s.BYTE&&($=s.RGB8I),O===s.SHORT&&($=s.RGB16I),O===s.INT&&($=s.RGB32I)),S===s.RGBA_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RGBA8UI),O===s.UNSIGNED_SHORT&&($=s.RGBA16UI),O===s.UNSIGNED_INT&&($=s.RGBA32UI),O===s.BYTE&&($=s.RGBA8I),O===s.SHORT&&($=s.RGBA16I),O===s.INT&&($=s.RGBA32I)),S===s.RGB&&O===s.UNSIGNED_INT_5_9_9_9_REV&&($=s.RGB9_E5),S===s.RGBA){const At=j?hr:ne.getTransfer(q);O===s.FLOAT&&($=s.RGBA32F),O===s.HALF_FLOAT&&($=s.RGBA16F),O===s.UNSIGNED_BYTE&&($=At===le?s.SRGB8_ALPHA8:s.RGBA8),O===s.UNSIGNED_SHORT_4_4_4_4&&($=s.RGBA4),O===s.UNSIGNED_SHORT_5_5_5_1&&($=s.RGB5_A1)}return($===s.R16F||$===s.R32F||$===s.RG16F||$===s.RG32F||$===s.RGBA16F||$===s.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function x(R,S){let O;return R?S===null||S===oi||S===Hi?O=s.DEPTH24_STENCIL8:S===dn?O=s.DEPTH32F_STENCIL8:S===ps&&(O=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===oi||S===Hi?O=s.DEPTH_COMPONENT24:S===dn?O=s.DEPTH_COMPONENT32F:S===ps&&(O=s.DEPTH_COMPONENT16),O}function M(R,S){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==Ne&&R.minFilter!==on?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function A(R){const S=R.target;S.removeEventListener("dispose",A),E(S),S.isVideoTexture&&h.delete(S)}function T(R){const S=R.target;S.removeEventListener("dispose",T),N(S)}function E(R){const S=n.get(R);if(S.__webglInit===void 0)return;const O=R.source,q=d.get(O);if(q){const j=q[S.__cacheKey];j.usedTimes--,j.usedTimes===0&&P(R),Object.keys(q).length===0&&d.delete(O)}n.remove(R)}function P(R){const S=n.get(R);s.deleteTexture(S.__webglTexture);const O=R.source,q=d.get(O);delete q[S.__cacheKey],o.memory.textures--}function N(R){const S=n.get(R);if(R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(S.__webglFramebuffer[q]))for(let j=0;j<S.__webglFramebuffer[q].length;j++)s.deleteFramebuffer(S.__webglFramebuffer[q][j]);else s.deleteFramebuffer(S.__webglFramebuffer[q]);S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer[q])}else{if(Array.isArray(S.__webglFramebuffer))for(let q=0;q<S.__webglFramebuffer.length;q++)s.deleteFramebuffer(S.__webglFramebuffer[q]);else s.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&s.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let q=0;q<S.__webglColorRenderbuffer.length;q++)S.__webglColorRenderbuffer[q]&&s.deleteRenderbuffer(S.__webglColorRenderbuffer[q]);S.__webglDepthRenderbuffer&&s.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const O=R.textures;for(let q=0,j=O.length;q<j;q++){const $=n.get(O[q]);$.__webglTexture&&(s.deleteTexture($.__webglTexture),o.memory.textures--),n.remove(O[q])}n.remove(R)}let y=0;function b(){y=0}function k(){const R=y;return R>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),y+=1,R}function F(R){const S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function G(R,S){const O=n.get(R);if(R.isVideoTexture&&ot(R),R.isRenderTargetTexture===!1&&R.version>0&&O.__version!==R.version){const q=R.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Kt(O,R,S);return}}e.bindTexture(s.TEXTURE_2D,O.__webglTexture,s.TEXTURE0+S)}function Y(R,S){const O=n.get(R);if(R.version>0&&O.__version!==R.version){Kt(O,R,S);return}e.bindTexture(s.TEXTURE_2D_ARRAY,O.__webglTexture,s.TEXTURE0+S)}function z(R,S){const O=n.get(R);if(R.version>0&&O.__version!==R.version){Kt(O,R,S);return}e.bindTexture(s.TEXTURE_3D,O.__webglTexture,s.TEXTURE0+S)}function K(R,S){const O=n.get(R);if(R.version>0&&O.__version!==R.version){X(O,R,S);return}e.bindTexture(s.TEXTURE_CUBE_MAP,O.__webglTexture,s.TEXTURE0+S)}const V={[fs]:s.REPEAT,[ei]:s.CLAMP_TO_EDGE,[zo]:s.MIRRORED_REPEAT},ut={[Ne]:s.NEAREST,[Tu]:s.NEAREST_MIPMAP_NEAREST,[Cs]:s.NEAREST_MIPMAP_LINEAR,[on]:s.LINEAR,[Nr]:s.LINEAR_MIPMAP_NEAREST,[ni]:s.LINEAR_MIPMAP_LINEAR},dt={[Pu]:s.NEVER,[ku]:s.ALWAYS,[Lu]:s.LESS,[Vc]:s.LEQUAL,[Iu]:s.EQUAL,[Nu]:s.GEQUAL,[Du]:s.GREATER,[Uu]:s.NOTEQUAL};function ft(R,S){if(S.type===dn&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===on||S.magFilter===Nr||S.magFilter===Cs||S.magFilter===ni||S.minFilter===on||S.minFilter===Nr||S.minFilter===Cs||S.minFilter===ni)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,V[S.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,V[S.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,V[S.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,ut[S.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,ut[S.minFilter]),S.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,dt[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Ne||S.minFilter!==Cs&&S.minFilter!==ni||S.type===dn&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const O=t.get("EXT_texture_filter_anisotropic");s.texParameterf(R,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function qt(R,S){let O=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",A));const q=S.source;let j=d.get(q);j===void 0&&(j={},d.set(q,j));const $=F(S);if($!==R.__cacheKey){j[$]===void 0&&(j[$]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,O=!0),j[$].usedTimes++;const At=j[R.__cacheKey];At!==void 0&&(j[R.__cacheKey].usedTimes--,At.usedTimes===0&&P(S)),R.__cacheKey=$,R.__webglTexture=j[$].texture}return O}function Kt(R,S,O){let q=s.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(q=s.TEXTURE_2D_ARRAY),S.isData3DTexture&&(q=s.TEXTURE_3D);const j=qt(R,S),$=S.source;e.bindTexture(q,R.__webglTexture,s.TEXTURE0+O);const At=n.get($);if($.version!==At.__version||j===!0){e.activeTexture(s.TEXTURE0+O);const lt=ne.getPrimaries(ne.workingColorSpace),Mt=S.colorSpace===kn?null:ne.getPrimaries(S.colorSpace),Zt=S.colorSpace===kn||lt===Mt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Zt);let et=_(S.image,!1,i.maxTextureSize);et=Pt(S,et);const yt=r.convert(S.format,S.colorSpace),Ot=r.convert(S.type);let Bt=v(S.internalFormat,yt,Ot,S.colorSpace,S.isVideoTexture);ft(q,S);let bt;const jt=S.mipmaps,Gt=S.isVideoTexture!==!0,re=At.__version===void 0||j===!0,I=$.dataReady,_t=M(S,et);if(S.isDepthTexture)Bt=x(S.format===Gi,S.type),re&&(Gt?e.texStorage2D(s.TEXTURE_2D,1,Bt,et.width,et.height):e.texImage2D(s.TEXTURE_2D,0,Bt,et.width,et.height,0,yt,Ot,null));else if(S.isDataTexture)if(jt.length>0){Gt&&re&&e.texStorage2D(s.TEXTURE_2D,_t,Bt,jt[0].width,jt[0].height);for(let W=0,J=jt.length;W<J;W++)bt=jt[W],Gt?I&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,Ot,bt.data):e.texImage2D(s.TEXTURE_2D,W,Bt,bt.width,bt.height,0,yt,Ot,bt.data);S.generateMipmaps=!1}else Gt?(re&&e.texStorage2D(s.TEXTURE_2D,_t,Bt,et.width,et.height),I&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,et.width,et.height,yt,Ot,et.data)):e.texImage2D(s.TEXTURE_2D,0,Bt,et.width,et.height,0,yt,Ot,et.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Gt&&re&&e.texStorage3D(s.TEXTURE_2D_ARRAY,_t,Bt,jt[0].width,jt[0].height,et.depth);for(let W=0,J=jt.length;W<J;W++)if(bt=jt[W],S.format!==ln)if(yt!==null)if(Gt){if(I)if(S.layerUpdates.size>0){const mt=sc(bt.width,bt.height,S.format,S.type);for(const vt of S.layerUpdates){const Jt=bt.data.subarray(vt*mt/bt.data.BYTES_PER_ELEMENT,(vt+1)*mt/bt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,vt,bt.width,bt.height,1,yt,Jt,0,0)}S.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,0,bt.width,bt.height,et.depth,yt,bt.data,0,0)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,W,Bt,bt.width,bt.height,et.depth,0,bt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Gt?I&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,0,bt.width,bt.height,et.depth,yt,Ot,bt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,W,Bt,bt.width,bt.height,et.depth,0,yt,Ot,bt.data)}else{Gt&&re&&e.texStorage2D(s.TEXTURE_2D,_t,Bt,jt[0].width,jt[0].height);for(let W=0,J=jt.length;W<J;W++)bt=jt[W],S.format!==ln?yt!==null?Gt?I&&e.compressedTexSubImage2D(s.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,bt.data):e.compressedTexImage2D(s.TEXTURE_2D,W,Bt,bt.width,bt.height,0,bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Gt?I&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,bt.width,bt.height,yt,Ot,bt.data):e.texImage2D(s.TEXTURE_2D,W,Bt,bt.width,bt.height,0,yt,Ot,bt.data)}else if(S.isDataArrayTexture)if(Gt){if(re&&e.texStorage3D(s.TEXTURE_2D_ARRAY,_t,Bt,et.width,et.height,et.depth),I)if(S.layerUpdates.size>0){const W=sc(et.width,et.height,S.format,S.type);for(const J of S.layerUpdates){const mt=et.data.subarray(J*W/et.data.BYTES_PER_ELEMENT,(J+1)*W/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,J,et.width,et.height,1,yt,Ot,mt)}S.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,yt,Ot,et.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Bt,et.width,et.height,et.depth,0,yt,Ot,et.data);else if(S.isData3DTexture)Gt?(re&&e.texStorage3D(s.TEXTURE_3D,_t,Bt,et.width,et.height,et.depth),I&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,yt,Ot,et.data)):e.texImage3D(s.TEXTURE_3D,0,Bt,et.width,et.height,et.depth,0,yt,Ot,et.data);else if(S.isFramebufferTexture){if(re)if(Gt)e.texStorage2D(s.TEXTURE_2D,_t,Bt,et.width,et.height);else{let W=et.width,J=et.height;for(let mt=0;mt<_t;mt++)e.texImage2D(s.TEXTURE_2D,mt,Bt,W,J,0,yt,Ot,null),W>>=1,J>>=1}}else if(jt.length>0){if(Gt&&re){const W=xt(jt[0]);e.texStorage2D(s.TEXTURE_2D,_t,Bt,W.width,W.height)}for(let W=0,J=jt.length;W<J;W++)bt=jt[W],Gt?I&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,yt,Ot,bt):e.texImage2D(s.TEXTURE_2D,W,Bt,yt,Ot,bt);S.generateMipmaps=!1}else if(Gt){if(re){const W=xt(et);e.texStorage2D(s.TEXTURE_2D,_t,Bt,W.width,W.height)}I&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,yt,Ot,et)}else e.texImage2D(s.TEXTURE_2D,0,Bt,yt,Ot,et);p(S)&&m(q),At.__version=$.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function X(R,S,O){if(S.image.length!==6)return;const q=qt(R,S),j=S.source;e.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+O);const $=n.get(j);if(j.version!==$.__version||q===!0){e.activeTexture(s.TEXTURE0+O);const At=ne.getPrimaries(ne.workingColorSpace),lt=S.colorSpace===kn?null:ne.getPrimaries(S.colorSpace),Mt=S.colorSpace===kn||At===lt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt);const Zt=S.isCompressedTexture||S.image[0].isCompressedTexture,et=S.image[0]&&S.image[0].isDataTexture,yt=[];for(let J=0;J<6;J++)!Zt&&!et?yt[J]=_(S.image[J],!0,i.maxCubemapSize):yt[J]=et?S.image[J].image:S.image[J],yt[J]=Pt(S,yt[J]);const Ot=yt[0],Bt=r.convert(S.format,S.colorSpace),bt=r.convert(S.type),jt=v(S.internalFormat,Bt,bt,S.colorSpace),Gt=S.isVideoTexture!==!0,re=$.__version===void 0||q===!0,I=j.dataReady;let _t=M(S,Ot);ft(s.TEXTURE_CUBE_MAP,S);let W;if(Zt){Gt&&re&&e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,jt,Ot.width,Ot.height);for(let J=0;J<6;J++){W=yt[J].mipmaps;for(let mt=0;mt<W.length;mt++){const vt=W[mt];S.format!==ln?Bt!==null?Gt?I&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,0,0,vt.width,vt.height,Bt,vt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,jt,vt.width,vt.height,0,vt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Gt?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,0,0,vt.width,vt.height,Bt,bt,vt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,jt,vt.width,vt.height,0,Bt,bt,vt.data)}}}else{if(W=S.mipmaps,Gt&&re){W.length>0&&_t++;const J=xt(yt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,jt,J.width,J.height)}for(let J=0;J<6;J++)if(et){Gt?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,yt[J].width,yt[J].height,Bt,bt,yt[J].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,jt,yt[J].width,yt[J].height,0,Bt,bt,yt[J].data);for(let mt=0;mt<W.length;mt++){const Jt=W[mt].image[J].image;Gt?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,0,0,Jt.width,Jt.height,Bt,bt,Jt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,jt,Jt.width,Jt.height,0,Bt,bt,Jt.data)}}else{Gt?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Bt,bt,yt[J]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,jt,Bt,bt,yt[J]);for(let mt=0;mt<W.length;mt++){const vt=W[mt];Gt?I&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,0,0,Bt,bt,vt.image[J]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,jt,Bt,bt,vt.image[J])}}}p(S)&&m(s.TEXTURE_CUBE_MAP),$.__version=j.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function tt(R,S,O,q,j,$){const At=r.convert(O.format,O.colorSpace),lt=r.convert(O.type),Mt=v(O.internalFormat,At,lt,O.colorSpace);if(!n.get(S).__hasExternalTextures){const et=Math.max(1,S.width>>$),yt=Math.max(1,S.height>>$);j===s.TEXTURE_3D||j===s.TEXTURE_2D_ARRAY?e.texImage3D(j,$,Mt,et,yt,S.depth,0,At,lt,null):e.texImage2D(j,$,Mt,et,yt,0,At,lt,null)}e.bindFramebuffer(s.FRAMEBUFFER,R),Q(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,q,j,n.get(O).__webglTexture,0,it(S)):(j===s.TEXTURE_2D||j>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,q,j,n.get(O).__webglTexture,$),e.bindFramebuffer(s.FRAMEBUFFER,null)}function St(R,S,O){if(s.bindRenderbuffer(s.RENDERBUFFER,R),S.depthBuffer){const q=S.depthTexture,j=q&&q.isDepthTexture?q.type:null,$=x(S.stencilBuffer,j),At=S.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,lt=it(S);Q(S)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,lt,$,S.width,S.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,lt,$,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,$,S.width,S.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,At,s.RENDERBUFFER,R)}else{const q=S.textures;for(let j=0;j<q.length;j++){const $=q[j],At=r.convert($.format,$.colorSpace),lt=r.convert($.type),Mt=v($.internalFormat,At,lt,$.colorSpace),Zt=it(S);O&&Q(S)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Zt,Mt,S.width,S.height):Q(S)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Zt,Mt,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,Mt,S.width,S.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ht(R,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(S.depthTexture).__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),G(S.depthTexture,0);const q=n.get(S.depthTexture).__webglTexture,j=it(S);if(S.depthTexture.format===Ni)Q(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,q,0,j):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,q,0);else if(S.depthTexture.format===Gi)Q(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,q,0,j):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,q,0);else throw new Error("Unknown depthTexture format")}function Ut(R){const S=n.get(R),O=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){const q=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),q){const j=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,q.removeEventListener("dispose",j)};q.addEventListener("dispose",j),S.__depthDisposeCallback=j}S.__boundDepthTexture=q}if(R.depthTexture&&!S.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");ht(S.__webglFramebuffer,R)}else if(O){S.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(e.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[q]),S.__webglDepthbuffer[q]===void 0)S.__webglDepthbuffer[q]=s.createRenderbuffer(),St(S.__webglDepthbuffer[q],R,!1);else{const j=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,$=S.__webglDepthbuffer[q];s.bindRenderbuffer(s.RENDERBUFFER,$),s.framebufferRenderbuffer(s.FRAMEBUFFER,j,s.RENDERBUFFER,$)}}else if(e.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=s.createRenderbuffer(),St(S.__webglDepthbuffer,R,!1);else{const q=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,j=S.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,j),s.framebufferRenderbuffer(s.FRAMEBUFFER,q,s.RENDERBUFFER,j)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Dt(R,S,O){const q=n.get(R);S!==void 0&&tt(q.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),O!==void 0&&Ut(R)}function Ht(R){const S=R.texture,O=n.get(R),q=n.get(S);R.addEventListener("dispose",T);const j=R.textures,$=R.isWebGLCubeRenderTarget===!0,At=j.length>1;if(At||(q.__webglTexture===void 0&&(q.__webglTexture=s.createTexture()),q.__version=S.version,o.memory.textures++),$){O.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(S.mipmaps&&S.mipmaps.length>0){O.__webglFramebuffer[lt]=[];for(let Mt=0;Mt<S.mipmaps.length;Mt++)O.__webglFramebuffer[lt][Mt]=s.createFramebuffer()}else O.__webglFramebuffer[lt]=s.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){O.__webglFramebuffer=[];for(let lt=0;lt<S.mipmaps.length;lt++)O.__webglFramebuffer[lt]=s.createFramebuffer()}else O.__webglFramebuffer=s.createFramebuffer();if(At)for(let lt=0,Mt=j.length;lt<Mt;lt++){const Zt=n.get(j[lt]);Zt.__webglTexture===void 0&&(Zt.__webglTexture=s.createTexture(),o.memory.textures++)}if(R.samples>0&&Q(R)===!1){O.__webglMultisampledFramebuffer=s.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let lt=0;lt<j.length;lt++){const Mt=j[lt];O.__webglColorRenderbuffer[lt]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,O.__webglColorRenderbuffer[lt]);const Zt=r.convert(Mt.format,Mt.colorSpace),et=r.convert(Mt.type),yt=v(Mt.internalFormat,Zt,et,Mt.colorSpace,R.isXRRenderTarget===!0),Ot=it(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ot,yt,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.RENDERBUFFER,O.__webglColorRenderbuffer[lt])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(O.__webglDepthRenderbuffer=s.createRenderbuffer(),St(O.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if($){e.bindTexture(s.TEXTURE_CUBE_MAP,q.__webglTexture),ft(s.TEXTURE_CUBE_MAP,S);for(let lt=0;lt<6;lt++)if(S.mipmaps&&S.mipmaps.length>0)for(let Mt=0;Mt<S.mipmaps.length;Mt++)tt(O.__webglFramebuffer[lt][Mt],R,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Mt);else tt(O.__webglFramebuffer[lt],R,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);p(S)&&m(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(At){for(let lt=0,Mt=j.length;lt<Mt;lt++){const Zt=j[lt],et=n.get(Zt);e.bindTexture(s.TEXTURE_2D,et.__webglTexture),ft(s.TEXTURE_2D,Zt),tt(O.__webglFramebuffer,R,Zt,s.COLOR_ATTACHMENT0+lt,s.TEXTURE_2D,0),p(Zt)&&m(s.TEXTURE_2D)}e.unbindTexture()}else{let lt=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(lt=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(lt,q.__webglTexture),ft(lt,S),S.mipmaps&&S.mipmaps.length>0)for(let Mt=0;Mt<S.mipmaps.length;Mt++)tt(O.__webglFramebuffer[Mt],R,S,s.COLOR_ATTACHMENT0,lt,Mt);else tt(O.__webglFramebuffer,R,S,s.COLOR_ATTACHMENT0,lt,0);p(S)&&m(lt),e.unbindTexture()}R.depthBuffer&&Ut(R)}function $t(R){const S=R.textures;for(let O=0,q=S.length;O<q;O++){const j=S[O];if(p(j)){const $=R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:s.TEXTURE_2D,At=n.get(j).__webglTexture;e.bindTexture($,At),m($),e.unbindTexture()}}}const Z=[],C=[];function rt(R){if(R.samples>0){if(Q(R)===!1){const S=R.textures,O=R.width,q=R.height;let j=s.COLOR_BUFFER_BIT;const $=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,At=n.get(R),lt=S.length>1;if(lt)for(let Mt=0;Mt<S.length;Mt++)e.bindFramebuffer(s.FRAMEBUFFER,At.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Mt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,At.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Mt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,At.__webglMultisampledFramebuffer),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,At.__webglFramebuffer);for(let Mt=0;Mt<S.length;Mt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(j|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(j|=s.STENCIL_BUFFER_BIT)),lt){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,At.__webglColorRenderbuffer[Mt]);const Zt=n.get(S[Mt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Zt,0)}s.blitFramebuffer(0,0,O,q,0,0,O,q,j,s.NEAREST),l===!0&&(Z.length=0,C.length=0,Z.push(s.COLOR_ATTACHMENT0+Mt),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Z.push($),C.push($),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,C)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Z))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),lt)for(let Mt=0;Mt<S.length;Mt++){e.bindFramebuffer(s.FRAMEBUFFER,At.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Mt,s.RENDERBUFFER,At.__webglColorRenderbuffer[Mt]);const Zt=n.get(S[Mt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,At.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Mt,s.TEXTURE_2D,Zt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,At.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const S=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[S])}}}function it(R){return Math.min(i.maxSamples,R.samples)}function Q(R){const S=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function ot(R){const S=o.render.frame;h.get(R)!==S&&(h.set(R,S),R.update())}function Pt(R,S){const O=R.colorSpace,q=R.format,j=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||O!==Gn&&O!==kn&&(ne.getTransfer(O)===le?(q!==ln||j!==Tn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),S}function xt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=b,this.setTexture2D=G,this.setTexture2DArray=Y,this.setTexture3D=z,this.setTextureCube=K,this.rebindTextures=Dt,this.setupRenderTarget=Ht,this.updateRenderTargetMipmap=$t,this.updateMultisampleRenderTarget=rt,this.setupDepthRenderbuffer=Ut,this.setupFrameBufferTexture=tt,this.useMultisampledRTT=Q}function W0(s,t){function e(n,i=kn){let r;const o=ne.getTransfer(i);if(n===Tn)return s.UNSIGNED_BYTE;if(n===Ca)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Pa)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Nc)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Dc)return s.BYTE;if(n===Uc)return s.SHORT;if(n===ps)return s.UNSIGNED_SHORT;if(n===Ra)return s.INT;if(n===oi)return s.UNSIGNED_INT;if(n===dn)return s.FLOAT;if(n===bs)return s.HALF_FLOAT;if(n===kc)return s.ALPHA;if(n===Fc)return s.RGB;if(n===ln)return s.RGBA;if(n===Oc)return s.LUMINANCE;if(n===Bc)return s.LUMINANCE_ALPHA;if(n===Ni)return s.DEPTH_COMPONENT;if(n===Gi)return s.DEPTH_STENCIL;if(n===La)return s.RED;if(n===Ia)return s.RED_INTEGER;if(n===zc)return s.RG;if(n===Da)return s.RG_INTEGER;if(n===Ua)return s.RGBA_INTEGER;if(n===nr||n===ir||n===sr||n===rr)if(o===le)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===nr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===rr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===nr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===sr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===rr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ho||n===Go||n===Vo||n===Wo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ho)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Go)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Vo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Wo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Xo||n===qo||n===$o)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Xo||n===qo)return o===le?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===$o)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Yo||n===Ko||n===Zo||n===jo||n===Jo||n===Qo||n===ta||n===ea||n===na||n===ia||n===sa||n===ra||n===oa||n===aa)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Yo)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ko)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Zo)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===jo)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Jo)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Qo)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ta)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ea)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===na)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ia)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===sa)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ra)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===oa)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===aa)return o===le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===or||n===la||n===ca)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===or)return o===le?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===la)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ca)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Hc||n===ha||n===ua||n===da)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===or)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ha)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ua)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===da)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Hi?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}class X0 extends sn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Li extends Te{constructor(){super(),this.isGroup=!0,this.type="Group"}}const q0={type:"move"};class uo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Li,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Li,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Li,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const _ of t.hand.values()){const p=e.getJointPose(_,n),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(q0)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Li;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const $0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Y0=`
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

}`;class K0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const i=new Ce,r=t.properties.get(i);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Hn({vertexShader:$0,fragmentShader:Y0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ke(new ri(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Z0 extends Xi{constructor(t,e){super();const n=this;let i=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null;const _=new K0,p=e.getContextAttributes();let m=null,v=null;const x=[],M=[],A=new st;let T=null;const E=new sn;E.layers.enable(1),E.viewport=new fe;const P=new sn;P.layers.enable(2),P.viewport=new fe;const N=[E,P],y=new X0;y.layers.enable(1),y.layers.enable(2);let b=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let tt=x[X];return tt===void 0&&(tt=new uo,x[X]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function(X){let tt=x[X];return tt===void 0&&(tt=new uo,x[X]=tt),tt.getGripSpace()},this.getHand=function(X){let tt=x[X];return tt===void 0&&(tt=new uo,x[X]=tt),tt.getHandSpace()};function F(X){const tt=M.indexOf(X.inputSource);if(tt===-1)return;const St=x[tt];St!==void 0&&(St.update(X.inputSource,X.frame,c||o),St.dispatchEvent({type:X.type,data:X.inputSource}))}function G(){i.removeEventListener("select",F),i.removeEventListener("selectstart",F),i.removeEventListener("selectend",F),i.removeEventListener("squeeze",F),i.removeEventListener("squeezestart",F),i.removeEventListener("squeezeend",F),i.removeEventListener("end",G),i.removeEventListener("inputsourceschange",Y);for(let X=0;X<x.length;X++){const tt=M[X];tt!==null&&(M[X]=null,x[X].disconnect(tt))}b=null,k=null,_.reset(),t.setRenderTarget(m),f=null,d=null,u=null,i=null,v=null,Kt.stop(),n.isPresenting=!1,t.setPixelRatio(T),t.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(X){if(i=X,i!==null){if(m=t.getRenderTarget(),i.addEventListener("select",F),i.addEventListener("selectstart",F),i.addEventListener("selectend",F),i.addEventListener("squeeze",F),i.addEventListener("squeezestart",F),i.addEventListener("squeezeend",F),i.addEventListener("end",G),i.addEventListener("inputsourceschange",Y),p.xrCompatible!==!0&&await e.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(A),i.renderState.layers===void 0){const tt={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,e,tt),i.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new ai(f.framebufferWidth,f.framebufferHeight,{format:ln,type:Tn,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil})}else{let tt=null,St=null,ht=null;p.depth&&(ht=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,tt=p.stencil?Gi:Ni,St=p.stencil?Hi:oi);const Ut={colorFormat:e.RGBA8,depthFormat:ht,scaleFactor:r};u=new XRWebGLBinding(i,e),d=u.createProjectionLayer(Ut),i.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),v=new ai(d.textureWidth,d.textureHeight,{format:ln,type:Tn,depthTexture:new nh(d.textureWidth,d.textureHeight,St,void 0,void 0,void 0,void 0,void 0,void 0,tt),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),Kt.setContext(i),Kt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function Y(X){for(let tt=0;tt<X.removed.length;tt++){const St=X.removed[tt],ht=M.indexOf(St);ht>=0&&(M[ht]=null,x[ht].disconnect(St))}for(let tt=0;tt<X.added.length;tt++){const St=X.added[tt];let ht=M.indexOf(St);if(ht===-1){for(let Dt=0;Dt<x.length;Dt++)if(Dt>=M.length){M.push(St),ht=Dt;break}else if(M[Dt]===null){M[Dt]=St,ht=Dt;break}if(ht===-1)break}const Ut=x[ht];Ut&&Ut.connect(St)}}const z=new L,K=new L;function V(X,tt,St){z.setFromMatrixPosition(tt.matrixWorld),K.setFromMatrixPosition(St.matrixWorld);const ht=z.distanceTo(K),Ut=tt.projectionMatrix.elements,Dt=St.projectionMatrix.elements,Ht=Ut[14]/(Ut[10]-1),$t=Ut[14]/(Ut[10]+1),Z=(Ut[9]+1)/Ut[5],C=(Ut[9]-1)/Ut[5],rt=(Ut[8]-1)/Ut[0],it=(Dt[8]+1)/Dt[0],Q=Ht*rt,ot=Ht*it,Pt=ht/(-rt+it),xt=Pt*-rt;if(tt.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(xt),X.translateZ(Pt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Ut[10]===-1)X.projectionMatrix.copy(tt.projectionMatrix),X.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{const R=Ht+Pt,S=$t+Pt,O=Q-xt,q=ot+(ht-xt),j=Z*$t/S*R,$=C*$t/S*R;X.projectionMatrix.makePerspective(O,q,j,$,R,S),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function ut(X,tt){tt===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(tt.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(i===null)return;let tt=X.near,St=X.far;_.texture!==null&&(_.depthNear>0&&(tt=_.depthNear),_.depthFar>0&&(St=_.depthFar)),y.near=P.near=E.near=tt,y.far=P.far=E.far=St,(b!==y.near||k!==y.far)&&(i.updateRenderState({depthNear:y.near,depthFar:y.far}),b=y.near,k=y.far);const ht=X.parent,Ut=y.cameras;ut(y,ht);for(let Dt=0;Dt<Ut.length;Dt++)ut(Ut[Dt],ht);Ut.length===2?V(y,E,P):y.projectionMatrix.copy(E.projectionMatrix),dt(X,y,ht)};function dt(X,tt,St){St===null?X.matrix.copy(tt.matrixWorld):(X.matrix.copy(St.matrixWorld),X.matrix.invert(),X.matrix.multiply(tt.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(tt.projectionMatrix),X.projectionMatrixInverse.copy(tt.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=fa*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(X){l=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(y)};let ft=null;function qt(X,tt){if(h=tt.getViewerPose(c||o),g=tt,h!==null){const St=h.views;f!==null&&(t.setRenderTargetFramebuffer(v,f.framebuffer),t.setRenderTarget(v));let ht=!1;St.length!==y.cameras.length&&(y.cameras.length=0,ht=!0);for(let Dt=0;Dt<St.length;Dt++){const Ht=St[Dt];let $t=null;if(f!==null)$t=f.getViewport(Ht);else{const C=u.getViewSubImage(d,Ht);$t=C.viewport,Dt===0&&(t.setRenderTargetTextures(v,C.colorTexture,d.ignoreDepthValues?void 0:C.depthStencilTexture),t.setRenderTarget(v))}let Z=N[Dt];Z===void 0&&(Z=new sn,Z.layers.enable(Dt),Z.viewport=new fe,N[Dt]=Z),Z.matrix.fromArray(Ht.transform.matrix),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.projectionMatrix.fromArray(Ht.projectionMatrix),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert(),Z.viewport.set($t.x,$t.y,$t.width,$t.height),Dt===0&&(y.matrix.copy(Z.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ht===!0&&y.cameras.push(Z)}const Ut=i.enabledFeatures;if(Ut&&Ut.includes("depth-sensing")){const Dt=u.getDepthInformation(St[0]);Dt&&Dt.isValid&&Dt.texture&&_.init(t,Dt,i.renderState)}}for(let St=0;St<x.length;St++){const ht=M[St],Ut=x[St];ht!==null&&Ut!==void 0&&Ut.update(ht,tt,c||o)}ft&&ft(X,tt),tt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:tt}),g=null}const Kt=new eh;Kt.setAnimationLoop(qt),this.setAnimationLoop=function(X){ft=X},this.dispose=function(){}}}const Zn=new pn,j0=new se;function J0(s,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,Jc(s)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,v,x,M){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(p,m):m.isMeshToonMaterial?(r(p,m),u(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m)):m.isMeshStandardMaterial?(r(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,M)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),_(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,v,x):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Fe&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Fe&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);const v=t.get(m),x=v.envMap,M=v.envMapRotation;x&&(p.envMap.value=x,Zn.copy(M),Zn.x*=-1,Zn.y*=-1,Zn.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Zn.y*=-1,Zn.z*=-1),p.envMapRotation.value.setFromMatrix4(j0.makeRotationFromEuler(Zn)),p.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,v,x){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*v,p.scale.value=x*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,v){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Fe&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=v.texture,p.transmissionSamplerSize.value.set(v.width,v.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){const v=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(v.matrixWorld),p.nearDistance.value=v.shadow.camera.near,p.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Q0(s,t,e,n){let i={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,x){const M=x.program;n.uniformBlockBinding(v,M)}function c(v,x){let M=i[v.id];M===void 0&&(g(v),M=h(v),i[v.id]=M,v.addEventListener("dispose",p));const A=x.program;n.updateUBOMapping(v,A);const T=t.render.frame;r[v.id]!==T&&(d(v),r[v.id]=T)}function h(v){const x=u();v.__bindingPointIndex=x;const M=s.createBuffer(),A=v.__size,T=v.usage;return s.bindBuffer(s.UNIFORM_BUFFER,M),s.bufferData(s.UNIFORM_BUFFER,A,T),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,x,M),M}function u(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){const x=i[v.id],M=v.uniforms,A=v.__cache;s.bindBuffer(s.UNIFORM_BUFFER,x);for(let T=0,E=M.length;T<E;T++){const P=Array.isArray(M[T])?M[T]:[M[T]];for(let N=0,y=P.length;N<y;N++){const b=P[N];if(f(b,T,N,A)===!0){const k=b.__offset,F=Array.isArray(b.value)?b.value:[b.value];let G=0;for(let Y=0;Y<F.length;Y++){const z=F[Y],K=_(z);typeof z=="number"||typeof z=="boolean"?(b.__data[0]=z,s.bufferSubData(s.UNIFORM_BUFFER,k+G,b.__data)):z.isMatrix3?(b.__data[0]=z.elements[0],b.__data[1]=z.elements[1],b.__data[2]=z.elements[2],b.__data[3]=0,b.__data[4]=z.elements[3],b.__data[5]=z.elements[4],b.__data[6]=z.elements[5],b.__data[7]=0,b.__data[8]=z.elements[6],b.__data[9]=z.elements[7],b.__data[10]=z.elements[8],b.__data[11]=0):(z.toArray(b.__data,G),G+=K.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,k,b.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(v,x,M,A){const T=v.value,E=x+"_"+M;if(A[E]===void 0)return typeof T=="number"||typeof T=="boolean"?A[E]=T:A[E]=T.clone(),!0;{const P=A[E];if(typeof T=="number"||typeof T=="boolean"){if(P!==T)return A[E]=T,!0}else if(P.equals(T)===!1)return P.copy(T),!0}return!1}function g(v){const x=v.uniforms;let M=0;const A=16;for(let E=0,P=x.length;E<P;E++){const N=Array.isArray(x[E])?x[E]:[x[E]];for(let y=0,b=N.length;y<b;y++){const k=N[y],F=Array.isArray(k.value)?k.value:[k.value];for(let G=0,Y=F.length;G<Y;G++){const z=F[G],K=_(z),V=M%A,ut=V%K.boundary,dt=V+ut;M+=ut,dt!==0&&A-dt<K.storage&&(M+=A-dt),k.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=M,M+=K.storage}}}const T=M%A;return T>0&&(M+=A-T),v.__size=M,v.__cache={},this}function _(v){const x={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(x.boundary=4,x.storage=4):v.isVector2?(x.boundary=8,x.storage=8):v.isVector3||v.isColor?(x.boundary=16,x.storage=12):v.isVector4?(x.boundary=16,x.storage=16):v.isMatrix3?(x.boundary=48,x.storage=48):v.isMatrix4?(x.boundary=64,x.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),x}function p(v){const x=v.target;x.removeEventListener("dispose",p);const M=o.indexOf(x.__bindingPointIndex);o.splice(M,1),s.deleteBuffer(i[x.id]),delete i[x.id],delete r[x.id]}function m(){for(const v in i)s.deleteBuffer(i[v]);o=[],i={},r={}}return{bind:l,update:c,dispose:m}}class tg{constructor(t={}){const{canvas:e=Bu(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const f=new Uint32Array(4),g=new Int32Array(4);let _=null,p=null;const m=[],v=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ye,this.toneMapping=On,this.toneMappingExposure=1;const x=this;let M=!1,A=0,T=0,E=null,P=-1,N=null;const y=new fe,b=new fe;let k=null;const F=new Yt(0);let G=0,Y=e.width,z=e.height,K=1,V=null,ut=null;const dt=new fe(0,0,Y,z),ft=new fe(0,0,Y,z);let qt=!1;const Kt=new ka;let X=!1,tt=!1;const St=new se,ht=new se,Ut=new L,Dt=new fe,Ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let $t=!1;function Z(){return E===null?K:1}let C=n;function rt(w,D){return e.getContext(w,D)}try{const w={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Aa}`),e.addEventListener("webglcontextlost",J,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",vt,!1),C===null){const D="webgl2";if(C=rt(D,w),C===null)throw rt(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let it,Q,ot,Pt,xt,R,S,O,q,j,$,At,lt,Mt,Zt,et,yt,Ot,Bt,bt,jt,Gt,re,I;function _t(){it=new rm(C),it.init(),Gt=new W0(C,it),Q=new Qp(C,it,t,Gt),ot=new H0(C),Q.reverseDepthBuffer&&ot.buffers.depth.setReversed(!0),Pt=new lm(C),xt=new T0,R=new V0(C,it,ot,xt,Q,Gt,Pt),S=new em(x),O=new sm(x),q=new pd(C),re=new jp(C,q),j=new om(C,q,Pt,re),$=new hm(C,j,q,Pt),Bt=new cm(C,Q,R),et=new tm(xt),At=new E0(x,S,O,it,Q,re,et),lt=new J0(x,xt),Mt=new R0,Zt=new U0(it),Ot=new Zp(x,S,O,ot,$,d,l),yt=new B0(x,$,Q),I=new Q0(C,Pt,Q,ot),bt=new Jp(C,it,Pt),jt=new am(C,it,Pt),Pt.programs=At.programs,x.capabilities=Q,x.extensions=it,x.properties=xt,x.renderLists=Mt,x.shadowMap=yt,x.state=ot,x.info=Pt}_t();const W=new Z0(x,C);this.xr=W,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const w=it.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=it.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(w){w!==void 0&&(K=w,this.setSize(Y,z,!1))},this.getSize=function(w){return w.set(Y,z)},this.setSize=function(w,D,B=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=w,z=D,e.width=Math.floor(w*K),e.height=Math.floor(D*K),B===!0&&(e.style.width=w+"px",e.style.height=D+"px"),this.setViewport(0,0,w,D)},this.getDrawingBufferSize=function(w){return w.set(Y*K,z*K).floor()},this.setDrawingBufferSize=function(w,D,B){Y=w,z=D,K=B,e.width=Math.floor(w*B),e.height=Math.floor(D*B),this.setViewport(0,0,w,D)},this.getCurrentViewport=function(w){return w.copy(y)},this.getViewport=function(w){return w.copy(dt)},this.setViewport=function(w,D,B,H){w.isVector4?dt.set(w.x,w.y,w.z,w.w):dt.set(w,D,B,H),ot.viewport(y.copy(dt).multiplyScalar(K).round())},this.getScissor=function(w){return w.copy(ft)},this.setScissor=function(w,D,B,H){w.isVector4?ft.set(w.x,w.y,w.z,w.w):ft.set(w,D,B,H),ot.scissor(b.copy(ft).multiplyScalar(K).round())},this.getScissorTest=function(){return qt},this.setScissorTest=function(w){ot.setScissorTest(qt=w)},this.setOpaqueSort=function(w){V=w},this.setTransparentSort=function(w){ut=w},this.getClearColor=function(w){return w.copy(Ot.getClearColor())},this.setClearColor=function(){Ot.setClearColor.apply(Ot,arguments)},this.getClearAlpha=function(){return Ot.getClearAlpha()},this.setClearAlpha=function(){Ot.setClearAlpha.apply(Ot,arguments)},this.clear=function(w=!0,D=!0,B=!0){let H=0;if(w){let U=!1;if(E!==null){const nt=E.texture.format;U=nt===Ua||nt===Da||nt===Ia}if(U){const nt=E.texture.type,gt=nt===Tn||nt===oi||nt===ps||nt===Hi||nt===Ca||nt===Pa,Tt=Ot.getClearColor(),Rt=Ot.getClearAlpha(),Nt=Tt.r,Ft=Tt.g,Ct=Tt.b;gt?(f[0]=Nt,f[1]=Ft,f[2]=Ct,f[3]=Rt,C.clearBufferuiv(C.COLOR,0,f)):(g[0]=Nt,g[1]=Ft,g[2]=Ct,g[3]=Rt,C.clearBufferiv(C.COLOR,0,g))}else H|=C.COLOR_BUFFER_BIT}D&&(H|=C.DEPTH_BUFFER_BIT,C.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),B&&(H|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",J,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",vt,!1),Mt.dispose(),Zt.dispose(),xt.dispose(),S.dispose(),O.dispose(),$.dispose(),re.dispose(),I.dispose(),At.dispose(),W.dispose(),W.removeEventListener("sessionstart",ja),W.removeEventListener("sessionend",Ja),Vn.stop()};function J(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function mt(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;const w=Pt.autoReset,D=yt.enabled,B=yt.autoUpdate,H=yt.needsUpdate,U=yt.type;_t(),Pt.autoReset=w,yt.enabled=D,yt.autoUpdate=B,yt.needsUpdate=H,yt.type=U}function vt(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function Jt(w){const D=w.target;D.removeEventListener("dispose",Jt),me(D)}function me(w){Ie(w),xt.remove(w)}function Ie(w){const D=xt.get(w).programs;D!==void 0&&(D.forEach(function(B){At.releaseProgram(B)}),w.isShaderMaterial&&At.releaseShaderCache(w))}this.renderBufferDirect=function(w,D,B,H,U,nt){D===null&&(D=Ht);const gt=U.isMesh&&U.matrixWorld.determinant()<0,Tt=Eh(w,D,B,H,U);ot.setMaterial(H,gt);let Rt=B.index,Nt=1;if(H.wireframe===!0){if(Rt=j.getWireframeAttribute(B),Rt===void 0)return;Nt=2}const Ft=B.drawRange,Ct=B.attributes.position;let ie=Ft.start*Nt,ae=(Ft.start+Ft.count)*Nt;nt!==null&&(ie=Math.max(ie,nt.start*Nt),ae=Math.min(ae,(nt.start+nt.count)*Nt)),Rt!==null?(ie=Math.max(ie,0),ae=Math.min(ae,Rt.count)):Ct!=null&&(ie=Math.max(ie,0),ae=Math.min(ae,Ct.count));const de=ae-ie;if(de<0||de===1/0)return;re.setup(U,H,Tt,B,Rt);let Oe,te=bt;if(Rt!==null&&(Oe=q.get(Rt),te=jt,te.setIndex(Oe)),U.isMesh)H.wireframe===!0?(ot.setLineWidth(H.wireframeLinewidth*Z()),te.setMode(C.LINES)):te.setMode(C.TRIANGLES);else if(U.isLine){let Lt=H.linewidth;Lt===void 0&&(Lt=1),ot.setLineWidth(Lt*Z()),U.isLineSegments?te.setMode(C.LINES):U.isLineLoop?te.setMode(C.LINE_LOOP):te.setMode(C.LINE_STRIP)}else U.isPoints?te.setMode(C.POINTS):U.isSprite&&te.setMode(C.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)te.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(it.get("WEBGL_multi_draw"))te.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const Lt=U._multiDrawStarts,be=U._multiDrawCounts,ee=U._multiDrawCount,Ze=Rt?q.get(Rt).bytesPerElement:1,ui=xt.get(H).currentProgram.getUniforms();for(let Be=0;Be<ee;Be++)ui.setValue(C,"_gl_DrawID",Be),te.render(Lt[Be]/Ze,be[Be])}else if(U.isInstancedMesh)te.renderInstances(ie,de,U.count);else if(B.isInstancedBufferGeometry){const Lt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,be=Math.min(B.instanceCount,Lt);te.renderInstances(ie,de,be)}else te.render(ie,de)};function Qt(w,D,B){w.transparent===!0&&w.side===rn&&w.forceSinglePass===!1?(w.side=Fe,w.needsUpdate=!0,As(w,D,B),w.side=zn,w.needsUpdate=!0,As(w,D,B),w.side=rn):As(w,D,B)}this.compile=function(w,D,B=null){B===null&&(B=w),p=Zt.get(B),p.init(D),v.push(p),B.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),w!==B&&w.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),p.setupLights();const H=new Set;return w.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const nt=U.material;if(nt)if(Array.isArray(nt))for(let gt=0;gt<nt.length;gt++){const Tt=nt[gt];Qt(Tt,B,U),H.add(Tt)}else Qt(nt,B,U),H.add(nt)}),v.pop(),p=null,H},this.compileAsync=function(w,D,B=null){const H=this.compile(w,D,B);return new Promise(U=>{function nt(){if(H.forEach(function(gt){xt.get(gt).currentProgram.isReady()&&H.delete(gt)}),H.size===0){U(w);return}setTimeout(nt,10)}it.get("KHR_parallel_shader_compile")!==null?nt():setTimeout(nt,10)})};let De=null;function gn(w){De&&De(w)}function ja(){Vn.stop()}function Ja(){Vn.start()}const Vn=new eh;Vn.setAnimationLoop(gn),typeof self<"u"&&Vn.setContext(self),this.setAnimationLoop=function(w){De=w,W.setAnimationLoop(w),w===null?Vn.stop():Vn.start()},W.addEventListener("sessionstart",ja),W.addEventListener("sessionend",Ja),this.render=function(w,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(D),D=W.getCamera()),w.isScene===!0&&w.onBeforeRender(x,w,D,E),p=Zt.get(w,v.length),p.init(D),v.push(p),ht.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Kt.setFromProjectionMatrix(ht),tt=this.localClippingEnabled,X=et.init(this.clippingPlanes,tt),_=Mt.get(w,m.length),_.init(),m.push(_),W.enabled===!0&&W.isPresenting===!0){const nt=x.xr.getDepthSensingMesh();nt!==null&&Er(nt,D,-1/0,x.sortObjects)}Er(w,D,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(V,ut),$t=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,$t&&Ot.addToRenderList(_,w),this.info.render.frame++,X===!0&&et.beginShadows();const B=p.state.shadowsArray;yt.render(B,w,D),X===!0&&et.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=_.opaque,U=_.transmissive;if(p.setupLights(),D.isArrayCamera){const nt=D.cameras;if(U.length>0)for(let gt=0,Tt=nt.length;gt<Tt;gt++){const Rt=nt[gt];tl(H,U,w,Rt)}$t&&Ot.render(w);for(let gt=0,Tt=nt.length;gt<Tt;gt++){const Rt=nt[gt];Qa(_,w,Rt,Rt.viewport)}}else U.length>0&&tl(H,U,w,D),$t&&Ot.render(w),Qa(_,w,D);E!==null&&(R.updateMultisampleRenderTarget(E),R.updateRenderTargetMipmap(E)),w.isScene===!0&&w.onAfterRender(x,w,D),re.resetDefaultState(),P=-1,N=null,v.pop(),v.length>0?(p=v[v.length-1],X===!0&&et.setGlobalState(x.clippingPlanes,p.state.camera)):p=null,m.pop(),m.length>0?_=m[m.length-1]:_=null};function Er(w,D,B,H){if(w.visible===!1)return;if(w.layers.test(D.layers)){if(w.isGroup)B=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(D);else if(w.isLight)p.pushLight(w),w.castShadow&&p.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||Kt.intersectsSprite(w)){H&&Dt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(ht);const gt=$.update(w),Tt=w.material;Tt.visible&&_.push(w,gt,Tt,B,Dt.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||Kt.intersectsObject(w))){const gt=$.update(w),Tt=w.material;if(H&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Dt.copy(w.boundingSphere.center)):(gt.boundingSphere===null&&gt.computeBoundingSphere(),Dt.copy(gt.boundingSphere.center)),Dt.applyMatrix4(w.matrixWorld).applyMatrix4(ht)),Array.isArray(Tt)){const Rt=gt.groups;for(let Nt=0,Ft=Rt.length;Nt<Ft;Nt++){const Ct=Rt[Nt],ie=Tt[Ct.materialIndex];ie&&ie.visible&&_.push(w,gt,ie,B,Dt.z,Ct)}}else Tt.visible&&_.push(w,gt,Tt,B,Dt.z,null)}}const nt=w.children;for(let gt=0,Tt=nt.length;gt<Tt;gt++)Er(nt[gt],D,B,H)}function Qa(w,D,B,H){const U=w.opaque,nt=w.transmissive,gt=w.transparent;p.setupLightsView(B),X===!0&&et.setGlobalState(x.clippingPlanes,B),H&&ot.viewport(y.copy(H)),U.length>0&&Ts(U,D,B),nt.length>0&&Ts(nt,D,B),gt.length>0&&Ts(gt,D,B),ot.buffers.depth.setTest(!0),ot.buffers.depth.setMask(!0),ot.buffers.color.setMask(!0),ot.setPolygonOffset(!1)}function tl(w,D,B,H){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[H.id]===void 0&&(p.state.transmissionRenderTarget[H.id]=new ai(1,1,{generateMipmaps:!0,type:it.has("EXT_color_buffer_half_float")||it.has("EXT_color_buffer_float")?bs:Tn,minFilter:ni,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ne.workingColorSpace}));const nt=p.state.transmissionRenderTarget[H.id],gt=H.viewport||y;nt.setSize(gt.z,gt.w);const Tt=x.getRenderTarget();x.setRenderTarget(nt),x.getClearColor(F),G=x.getClearAlpha(),G<1&&x.setClearColor(16777215,.5),x.clear(),$t&&Ot.render(B);const Rt=x.toneMapping;x.toneMapping=On;const Nt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),p.setupLightsView(H),X===!0&&et.setGlobalState(x.clippingPlanes,H),Ts(w,B,H),R.updateMultisampleRenderTarget(nt),R.updateRenderTargetMipmap(nt),it.has("WEBGL_multisampled_render_to_texture")===!1){let Ft=!1;for(let Ct=0,ie=D.length;Ct<ie;Ct++){const ae=D[Ct],de=ae.object,Oe=ae.geometry,te=ae.material,Lt=ae.group;if(te.side===rn&&de.layers.test(H.layers)){const be=te.side;te.side=Fe,te.needsUpdate=!0,el(de,B,H,Oe,te,Lt),te.side=be,te.needsUpdate=!0,Ft=!0}}Ft===!0&&(R.updateMultisampleRenderTarget(nt),R.updateRenderTargetMipmap(nt))}x.setRenderTarget(Tt),x.setClearColor(F,G),Nt!==void 0&&(H.viewport=Nt),x.toneMapping=Rt}function Ts(w,D,B){const H=D.isScene===!0?D.overrideMaterial:null;for(let U=0,nt=w.length;U<nt;U++){const gt=w[U],Tt=gt.object,Rt=gt.geometry,Nt=H===null?gt.material:H,Ft=gt.group;Tt.layers.test(B.layers)&&el(Tt,D,B,Rt,Nt,Ft)}}function el(w,D,B,H,U,nt){w.onBeforeRender(x,D,B,H,U,nt),w.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),U.onBeforeRender(x,D,B,H,w,nt),U.transparent===!0&&U.side===rn&&U.forceSinglePass===!1?(U.side=Fe,U.needsUpdate=!0,x.renderBufferDirect(B,D,H,U,w,nt),U.side=zn,U.needsUpdate=!0,x.renderBufferDirect(B,D,H,U,w,nt),U.side=rn):x.renderBufferDirect(B,D,H,U,w,nt),w.onAfterRender(x,D,B,H,U,nt)}function As(w,D,B){D.isScene!==!0&&(D=Ht);const H=xt.get(w),U=p.state.lights,nt=p.state.shadowsArray,gt=U.state.version,Tt=At.getParameters(w,U.state,nt,D,B),Rt=At.getProgramCacheKey(Tt);let Nt=H.programs;H.environment=w.isMeshStandardMaterial?D.environment:null,H.fog=D.fog,H.envMap=(w.isMeshStandardMaterial?O:S).get(w.envMap||H.environment),H.envMapRotation=H.environment!==null&&w.envMap===null?D.environmentRotation:w.envMapRotation,Nt===void 0&&(w.addEventListener("dispose",Jt),Nt=new Map,H.programs=Nt);let Ft=Nt.get(Rt);if(Ft!==void 0){if(H.currentProgram===Ft&&H.lightsStateVersion===gt)return il(w,Tt),Ft}else Tt.uniforms=At.getUniforms(w),w.onBeforeCompile(Tt,x),Ft=At.acquireProgram(Tt,Rt),Nt.set(Rt,Ft),H.uniforms=Tt.uniforms;const Ct=H.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Ct.clippingPlanes=et.uniform),il(w,Tt),H.needsLights=Ah(w),H.lightsStateVersion=gt,H.needsLights&&(Ct.ambientLightColor.value=U.state.ambient,Ct.lightProbe.value=U.state.probe,Ct.directionalLights.value=U.state.directional,Ct.directionalLightShadows.value=U.state.directionalShadow,Ct.spotLights.value=U.state.spot,Ct.spotLightShadows.value=U.state.spotShadow,Ct.rectAreaLights.value=U.state.rectArea,Ct.ltc_1.value=U.state.rectAreaLTC1,Ct.ltc_2.value=U.state.rectAreaLTC2,Ct.pointLights.value=U.state.point,Ct.pointLightShadows.value=U.state.pointShadow,Ct.hemisphereLights.value=U.state.hemi,Ct.directionalShadowMap.value=U.state.directionalShadowMap,Ct.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Ct.spotShadowMap.value=U.state.spotShadowMap,Ct.spotLightMatrix.value=U.state.spotLightMatrix,Ct.spotLightMap.value=U.state.spotLightMap,Ct.pointShadowMap.value=U.state.pointShadowMap,Ct.pointShadowMatrix.value=U.state.pointShadowMatrix),H.currentProgram=Ft,H.uniformsList=null,Ft}function nl(w){if(w.uniformsList===null){const D=w.currentProgram.getUniforms();w.uniformsList=lr.seqWithValue(D.seq,w.uniforms)}return w.uniformsList}function il(w,D){const B=xt.get(w);B.outputColorSpace=D.outputColorSpace,B.batching=D.batching,B.batchingColor=D.batchingColor,B.instancing=D.instancing,B.instancingColor=D.instancingColor,B.instancingMorph=D.instancingMorph,B.skinning=D.skinning,B.morphTargets=D.morphTargets,B.morphNormals=D.morphNormals,B.morphColors=D.morphColors,B.morphTargetsCount=D.morphTargetsCount,B.numClippingPlanes=D.numClippingPlanes,B.numIntersection=D.numClipIntersection,B.vertexAlphas=D.vertexAlphas,B.vertexTangents=D.vertexTangents,B.toneMapping=D.toneMapping}function Eh(w,D,B,H,U){D.isScene!==!0&&(D=Ht),R.resetTextureUnits();const nt=D.fog,gt=H.isMeshStandardMaterial?D.environment:null,Tt=E===null?x.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Gn,Rt=(H.isMeshStandardMaterial?O:S).get(H.envMap||gt),Nt=H.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Ft=!!B.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Ct=!!B.morphAttributes.position,ie=!!B.morphAttributes.normal,ae=!!B.morphAttributes.color;let de=On;H.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(de=x.toneMapping);const Oe=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,te=Oe!==void 0?Oe.length:0,Lt=xt.get(H),be=p.state.lights;if(X===!0&&(tt===!0||w!==N)){const Xe=w===N&&H.id===P;et.setState(H,w,Xe)}let ee=!1;H.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==be.state.version||Lt.outputColorSpace!==Tt||U.isBatchedMesh&&Lt.batching===!1||!U.isBatchedMesh&&Lt.batching===!0||U.isBatchedMesh&&Lt.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Lt.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Lt.instancing===!1||!U.isInstancedMesh&&Lt.instancing===!0||U.isSkinnedMesh&&Lt.skinning===!1||!U.isSkinnedMesh&&Lt.skinning===!0||U.isInstancedMesh&&Lt.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Lt.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Lt.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Lt.instancingMorph===!1&&U.morphTexture!==null||Lt.envMap!==Rt||H.fog===!0&&Lt.fog!==nt||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==et.numPlanes||Lt.numIntersection!==et.numIntersection)||Lt.vertexAlphas!==Nt||Lt.vertexTangents!==Ft||Lt.morphTargets!==Ct||Lt.morphNormals!==ie||Lt.morphColors!==ae||Lt.toneMapping!==de||Lt.morphTargetsCount!==te)&&(ee=!0):(ee=!0,Lt.__version=H.version);let Ze=Lt.currentProgram;ee===!0&&(Ze=As(H,D,U));let ui=!1,Be=!1,Tr=!1;const pe=Ze.getUniforms(),Rn=Lt.uniforms;if(ot.useProgram(Ze.program)&&(ui=!0,Be=!0,Tr=!0),H.id!==P&&(P=H.id,Be=!0),ui||N!==w){Q.reverseDepthBuffer?(St.copy(w.projectionMatrix),Hu(St),Gu(St),pe.setValue(C,"projectionMatrix",St)):pe.setValue(C,"projectionMatrix",w.projectionMatrix),pe.setValue(C,"viewMatrix",w.matrixWorldInverse);const Xe=pe.map.cameraPosition;Xe!==void 0&&Xe.setValue(C,Ut.setFromMatrixPosition(w.matrixWorld)),Q.logarithmicDepthBuffer&&pe.setValue(C,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&pe.setValue(C,"isOrthographic",w.isOrthographicCamera===!0),N!==w&&(N=w,Be=!0,Tr=!0)}if(U.isSkinnedMesh){pe.setOptional(C,U,"bindMatrix"),pe.setOptional(C,U,"bindMatrixInverse");const Xe=U.skeleton;Xe&&(Xe.boneTexture===null&&Xe.computeBoneTexture(),pe.setValue(C,"boneTexture",Xe.boneTexture,R))}U.isBatchedMesh&&(pe.setOptional(C,U,"batchingTexture"),pe.setValue(C,"batchingTexture",U._matricesTexture,R),pe.setOptional(C,U,"batchingIdTexture"),pe.setValue(C,"batchingIdTexture",U._indirectTexture,R),pe.setOptional(C,U,"batchingColorTexture"),U._colorsTexture!==null&&pe.setValue(C,"batchingColorTexture",U._colorsTexture,R));const Ar=B.morphAttributes;if((Ar.position!==void 0||Ar.normal!==void 0||Ar.color!==void 0)&&Bt.update(U,B,Ze),(Be||Lt.receiveShadow!==U.receiveShadow)&&(Lt.receiveShadow=U.receiveShadow,pe.setValue(C,"receiveShadow",U.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Rn.envMap.value=Rt,Rn.flipEnvMap.value=Rt.isCubeTexture&&Rt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&D.environment!==null&&(Rn.envMapIntensity.value=D.environmentIntensity),Be&&(pe.setValue(C,"toneMappingExposure",x.toneMappingExposure),Lt.needsLights&&Th(Rn,Tr),nt&&H.fog===!0&&lt.refreshFogUniforms(Rn,nt),lt.refreshMaterialUniforms(Rn,H,K,z,p.state.transmissionRenderTarget[w.id]),lr.upload(C,nl(Lt),Rn,R)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(lr.upload(C,nl(Lt),Rn,R),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&pe.setValue(C,"center",U.center),pe.setValue(C,"modelViewMatrix",U.modelViewMatrix),pe.setValue(C,"normalMatrix",U.normalMatrix),pe.setValue(C,"modelMatrix",U.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Xe=H.uniformsGroups;for(let Rr=0,Rh=Xe.length;Rr<Rh;Rr++){const sl=Xe[Rr];I.update(sl,Ze),I.bind(sl,Ze)}}return Ze}function Th(w,D){w.ambientLightColor.needsUpdate=D,w.lightProbe.needsUpdate=D,w.directionalLights.needsUpdate=D,w.directionalLightShadows.needsUpdate=D,w.pointLights.needsUpdate=D,w.pointLightShadows.needsUpdate=D,w.spotLights.needsUpdate=D,w.spotLightShadows.needsUpdate=D,w.rectAreaLights.needsUpdate=D,w.hemisphereLights.needsUpdate=D}function Ah(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(w,D,B){xt.get(w.texture).__webglTexture=D,xt.get(w.depthTexture).__webglTexture=B;const H=xt.get(w);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=B===void 0,H.__autoAllocateDepthBuffer||it.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(w,D){const B=xt.get(w);B.__webglFramebuffer=D,B.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(w,D=0,B=0){E=w,A=D,T=B;let H=!0,U=null,nt=!1,gt=!1;if(w){const Rt=xt.get(w);if(Rt.__useDefaultFramebuffer!==void 0)ot.bindFramebuffer(C.FRAMEBUFFER,null),H=!1;else if(Rt.__webglFramebuffer===void 0)R.setupRenderTarget(w);else if(Rt.__hasExternalTextures)R.rebindTextures(w,xt.get(w.texture).__webglTexture,xt.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const Ct=w.depthTexture;if(Rt.__boundDepthTexture!==Ct){if(Ct!==null&&xt.has(Ct)&&(w.width!==Ct.image.width||w.height!==Ct.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(w)}}const Nt=w.texture;(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)&&(gt=!0);const Ft=xt.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Ft[D])?U=Ft[D][B]:U=Ft[D],nt=!0):w.samples>0&&R.useMultisampledRTT(w)===!1?U=xt.get(w).__webglMultisampledFramebuffer:Array.isArray(Ft)?U=Ft[B]:U=Ft,y.copy(w.viewport),b.copy(w.scissor),k=w.scissorTest}else y.copy(dt).multiplyScalar(K).floor(),b.copy(ft).multiplyScalar(K).floor(),k=qt;if(ot.bindFramebuffer(C.FRAMEBUFFER,U)&&H&&ot.drawBuffers(w,U),ot.viewport(y),ot.scissor(b),ot.setScissorTest(k),nt){const Rt=xt.get(w.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+D,Rt.__webglTexture,B)}else if(gt){const Rt=xt.get(w.texture),Nt=D||0;C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,Rt.__webglTexture,B||0,Nt)}P=-1},this.readRenderTargetPixels=function(w,D,B,H,U,nt,gt){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Tt=xt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&gt!==void 0&&(Tt=Tt[gt]),Tt){ot.bindFramebuffer(C.FRAMEBUFFER,Tt);try{const Rt=w.texture,Nt=Rt.format,Ft=Rt.type;if(!Q.textureFormatReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Q.textureTypeReadable(Ft)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=w.width-H&&B>=0&&B<=w.height-U&&C.readPixels(D,B,H,U,Gt.convert(Nt),Gt.convert(Ft),nt)}finally{const Rt=E!==null?xt.get(E).__webglFramebuffer:null;ot.bindFramebuffer(C.FRAMEBUFFER,Rt)}}},this.readRenderTargetPixelsAsync=async function(w,D,B,H,U,nt,gt){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Tt=xt.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&gt!==void 0&&(Tt=Tt[gt]),Tt){const Rt=w.texture,Nt=Rt.format,Ft=Rt.type;if(!Q.textureFormatReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Q.textureTypeReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=w.width-H&&B>=0&&B<=w.height-U){ot.bindFramebuffer(C.FRAMEBUFFER,Tt);const Ct=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,Ct),C.bufferData(C.PIXEL_PACK_BUFFER,nt.byteLength,C.STREAM_READ),C.readPixels(D,B,H,U,Gt.convert(Nt),Gt.convert(Ft),0);const ie=E!==null?xt.get(E).__webglFramebuffer:null;ot.bindFramebuffer(C.FRAMEBUFFER,ie);const ae=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await zu(C,ae,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,Ct),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,nt),C.deleteBuffer(Ct),C.deleteSync(ae),nt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(w,D=null,B=0){w.isTexture!==!0&&(ar("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,w=arguments[1]);const H=Math.pow(2,-B),U=Math.floor(w.image.width*H),nt=Math.floor(w.image.height*H),gt=D!==null?D.x:0,Tt=D!==null?D.y:0;R.setTexture2D(w,0),C.copyTexSubImage2D(C.TEXTURE_2D,B,0,0,gt,Tt,U,nt),ot.unbindTexture()},this.copyTextureToTexture=function(w,D,B=null,H=null,U=0){w.isTexture!==!0&&(ar("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,w=arguments[1],D=arguments[2],U=arguments[3]||0,B=null);let nt,gt,Tt,Rt,Nt,Ft;B!==null?(nt=B.max.x-B.min.x,gt=B.max.y-B.min.y,Tt=B.min.x,Rt=B.min.y):(nt=w.image.width,gt=w.image.height,Tt=0,Rt=0),H!==null?(Nt=H.x,Ft=H.y):(Nt=0,Ft=0);const Ct=Gt.convert(D.format),ie=Gt.convert(D.type);R.setTexture2D(D,0),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,D.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,D.unpackAlignment);const ae=C.getParameter(C.UNPACK_ROW_LENGTH),de=C.getParameter(C.UNPACK_IMAGE_HEIGHT),Oe=C.getParameter(C.UNPACK_SKIP_PIXELS),te=C.getParameter(C.UNPACK_SKIP_ROWS),Lt=C.getParameter(C.UNPACK_SKIP_IMAGES),be=w.isCompressedTexture?w.mipmaps[U]:w.image;C.pixelStorei(C.UNPACK_ROW_LENGTH,be.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,be.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Tt),C.pixelStorei(C.UNPACK_SKIP_ROWS,Rt),w.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,U,Nt,Ft,nt,gt,Ct,ie,be.data):w.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,U,Nt,Ft,be.width,be.height,Ct,be.data):C.texSubImage2D(C.TEXTURE_2D,U,Nt,Ft,nt,gt,Ct,ie,be),C.pixelStorei(C.UNPACK_ROW_LENGTH,ae),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,de),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Oe),C.pixelStorei(C.UNPACK_SKIP_ROWS,te),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Lt),U===0&&D.generateMipmaps&&C.generateMipmap(C.TEXTURE_2D),ot.unbindTexture()},this.copyTextureToTexture3D=function(w,D,B=null,H=null,U=0){w.isTexture!==!0&&(ar("WebGLRenderer: copyTextureToTexture3D function signature has changed."),B=arguments[0]||null,H=arguments[1]||null,w=arguments[2],D=arguments[3],U=arguments[4]||0);let nt,gt,Tt,Rt,Nt,Ft,Ct,ie,ae;const de=w.isCompressedTexture?w.mipmaps[U]:w.image;B!==null?(nt=B.max.x-B.min.x,gt=B.max.y-B.min.y,Tt=B.max.z-B.min.z,Rt=B.min.x,Nt=B.min.y,Ft=B.min.z):(nt=de.width,gt=de.height,Tt=de.depth,Rt=0,Nt=0,Ft=0),H!==null?(Ct=H.x,ie=H.y,ae=H.z):(Ct=0,ie=0,ae=0);const Oe=Gt.convert(D.format),te=Gt.convert(D.type);let Lt;if(D.isData3DTexture)R.setTexture3D(D,0),Lt=C.TEXTURE_3D;else if(D.isDataArrayTexture||D.isCompressedArrayTexture)R.setTexture2DArray(D,0),Lt=C.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,D.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,D.unpackAlignment);const be=C.getParameter(C.UNPACK_ROW_LENGTH),ee=C.getParameter(C.UNPACK_IMAGE_HEIGHT),Ze=C.getParameter(C.UNPACK_SKIP_PIXELS),ui=C.getParameter(C.UNPACK_SKIP_ROWS),Be=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,de.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,de.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Rt),C.pixelStorei(C.UNPACK_SKIP_ROWS,Nt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Ft),w.isDataTexture||w.isData3DTexture?C.texSubImage3D(Lt,U,Ct,ie,ae,nt,gt,Tt,Oe,te,de.data):D.isCompressedArrayTexture?C.compressedTexSubImage3D(Lt,U,Ct,ie,ae,nt,gt,Tt,Oe,de.data):C.texSubImage3D(Lt,U,Ct,ie,ae,nt,gt,Tt,Oe,te,de),C.pixelStorei(C.UNPACK_ROW_LENGTH,be),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ee),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Ze),C.pixelStorei(C.UNPACK_SKIP_ROWS,ui),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Be),U===0&&D.generateMipmaps&&C.generateMipmap(Lt),ot.unbindTexture()},this.initRenderTarget=function(w){xt.get(w).__webglFramebuffer===void 0&&R.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?R.setTextureCube(w,0):w.isData3DTexture?R.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?R.setTexture2DArray(w,0):R.setTexture2D(w,0),ot.unbindTexture()},this.resetState=function(){A=0,T=0,E=null,ot.reset(),re.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return bn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===Na?"display-p3":"srgb",e.unpackColorSpace=ne.workingColorSpace===yr?"display-p3":"srgb"}}class eg extends Te{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pn,this.environmentIntensity=1,this.environmentRotation=new pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class ng extends Ce{constructor(t=null,e=1,n=1,i,r,o,a,l,c=Ne,h=Ne,u,d){super(null,o,a,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class rc extends Ge{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Ai=new se,oc=new se,Zs=[],ac=new hi,ig=new se,ns=new ke,is=new ws;class sg extends ke{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new rc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,ig)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new hi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ai),ac.copy(t.boundingBox).applyMatrix4(Ai),this.boundingBox.union(ac)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new ws),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ai),is.copy(t.boundingSphere).applyMatrix4(Ai),this.boundingSphere.union(is)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(t,e){const n=this.matrixWorld,i=this.count;if(ns.geometry=this.geometry,ns.material=this.material,ns.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),is.copy(this.boundingSphere),is.applyMatrix4(n),t.ray.intersectsSphere(is)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Ai),oc.multiplyMatrices(n,Ai),ns.matrixWorld=oc,ns.raycast(t,Zs);for(let o=0,a=Zs.length;o<a;o++){const l=Zs[o];l.instanceId=r,l.object=this,e.push(l)}Zs.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new rc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ng(new Float32Array(i*this.count),i,this.count,La,dn));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=i*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class lc extends Ce{constructor(t,e,n,i,r,o,a,l,c){super(t,e,n,i,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class mn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,i=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let i=0;const r=n.length;let o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(r-1);const h=n[i],d=n[i+1]-h,f=(o-h)/d;return(i+f)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);const o=this.getPoint(i),a=this.getPoint(r),l=e||(o.isVector2?new st:new L);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new L,i=[],r=[],o=[],a=new L,l=new se;for(let f=0;f<=t;f++){const g=f/t;i[f]=this.getTangentAt(g,new L)}r[0]=new L,o[0]=new L;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Ee(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(i[f],r[f])}if(e===!0){let f=Math.acos(Ee(r[0].dot(r[t]),-1,1));f/=t,i[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],f*g)),o[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class Ba extends mn{constructor(t=0,e=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new st){const n=e,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);const a=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class rg extends Ba{constructor(t,e,n,i,r,o){super(t,e,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function za(){let s=0,t=0,e=0,n=0;function i(r,o,a,l){s=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){i(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,i(o,a,d,f)},calc:function(r){const o=r*r,a=o*r;return s+t*r+e*o+n*a}}}const js=new L,fo=new za,po=new za,mo=new za;class og extends mn{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new L){const n=e,i=this.points,r=i.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=i[(a-1)%r]:(js.subVectors(i[0],i[1]).add(i[0]),c=js);const u=i[a%r],d=i[(a+1)%r];if(this.closed||a+2<r?h=i[(a+2)%r]:(js.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=js),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);_<1e-4&&(_=1),g<1e-4&&(g=_),p<1e-4&&(p=_),fo.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,_,p),po.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,_,p),mo.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,_,p)}else this.curveType==="catmullrom"&&(fo.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),po.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),mo.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(fo.calc(l),po.calc(l),mo.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new L().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function cc(s,t,e,n,i){const r=(n-t)*.5,o=(i-e)*.5,a=s*s,l=s*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*s+e}function ag(s,t){const e=1-s;return e*e*t}function lg(s,t){return 2*(1-s)*s*t}function cg(s,t){return s*s*t}function as(s,t,e,n){return ag(s,t)+lg(s,e)+cg(s,n)}function hg(s,t){const e=1-s;return e*e*e*t}function ug(s,t){const e=1-s;return 3*e*e*s*t}function dg(s,t){return 3*(1-s)*s*s*t}function fg(s,t){return s*s*s*t}function ls(s,t,e,n,i){return hg(s,t)+ug(s,e)+dg(s,n)+fg(s,i)}class ah extends mn{constructor(t=new st,e=new st,n=new st,i=new st){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new st){const n=e,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ls(t,i.x,r.x,o.x,a.x),ls(t,i.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class pg extends mn{constructor(t=new L,e=new L,n=new L,i=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new L){const n=e,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ls(t,i.x,r.x,o.x,a.x),ls(t,i.y,r.y,o.y,a.y),ls(t,i.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class lh extends mn{constructor(t=new st,e=new st){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new st){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new st){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class mg extends mn{constructor(t=new L,e=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new L){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new L){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class ch extends mn{constructor(t=new st,e=new st,n=new st){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new st){const n=e,i=this.v0,r=this.v1,o=this.v2;return n.set(as(t,i.x,r.x,o.x),as(t,i.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class gg extends mn{constructor(t=new L,e=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new L){const n=e,i=this.v0,r=this.v1,o=this.v2;return n.set(as(t,i.x,r.x,o.x),as(t,i.y,r.y,o.y),as(t,i.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class hh extends mn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new st){const n=e,i=this.points,r=(i.length-1)*t,o=Math.floor(r),a=r-o,l=i[o===0?o:o-1],c=i[o],h=i[o>i.length-2?i.length-1:o+1],u=i[o>i.length-3?i.length-1:o+2];return n.set(cc(a,l.x,c.x,h.x,u.x),cc(a,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new st().fromArray(i))}return this}}var ma=Object.freeze({__proto__:null,ArcCurve:rg,CatmullRomCurve3:og,CubicBezierCurve:ah,CubicBezierCurve3:pg,EllipseCurve:Ba,LineCurve:lh,LineCurve3:mg,QuadraticBezierCurve:ch,QuadraticBezierCurve3:gg,SplineCurve:hh});class xg extends mn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ma[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const o=i[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const o=r[i],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(new ma[i.type]().fromJSON(i))}return this}}class ga extends xg{constructor(t){super(),this.type="Path",this.currentPoint=new st,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new lh(this.currentPoint.clone(),new st(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){const r=new ch(this.currentPoint.clone(),new st(t,e),new st(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,o){const a=new ah(this.currentPoint.clone(),new st(t,e),new st(n,i),new st(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new hh(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,i,r,o),this}absarc(t,e,n,i,r,o){return this.absellipse(t,e,n,n,i,r,o),this}ellipse(t,e,n,i,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,r,o,a,l),this}absellipse(t,e,n,i,r,o,a,l){const c=new Ba(t,e,n,i,r,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class Ha extends Le{constructor(t=[new st(0,-.5),new st(.5,0),new st(0,.5)],e=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:i},e=Math.floor(e),i=Ee(i,0,Math.PI*2);const r=[],o=[],a=[],l=[],c=[],h=1/e,u=new L,d=new st,f=new L,g=new L,_=new L;let p=0,m=0;for(let v=0;v<=t.length-1;v++)switch(v){case 0:p=t[v+1].x-t[v].x,m=t[v+1].y-t[v].y,f.x=m*1,f.y=-p,f.z=m*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(_.x,_.y,_.z);break;default:p=t[v+1].x-t[v].x,m=t[v+1].y-t[v].y,f.x=m*1,f.y=-p,f.z=m*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let v=0;v<=e;v++){const x=n+v*h*i,M=Math.sin(x),A=Math.cos(x);for(let T=0;T<=t.length-1;T++){u.x=t[T].x*M,u.y=t[T].y,u.z=t[T].x*A,o.push(u.x,u.y,u.z),d.x=v/e,d.y=T/(t.length-1),a.push(d.x,d.y);const E=l[3*T+0]*M,P=l[3*T+1],N=l[3*T+0]*A;c.push(E,P,N)}}for(let v=0;v<e;v++)for(let x=0;x<t.length-1;x++){const M=x+v*t.length,A=M,T=M+t.length,E=M+t.length+1,P=M+1;r.push(A,T,P),r.push(E,P,T)}this.setIndex(r),this.setAttribute("position",new ce(o,3)),this.setAttribute("uv",new ce(a,2)),this.setAttribute("normal",new ce(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ha(t.points,t.segments,t.phiStart,t.phiLength)}}class Ga extends Ha{constructor(t=1,e=1,n=4,i=8){const r=new ga;r.absarc(0,-e/2,t,Math.PI*1.5,0),r.absarc(0,e/2,t,0,Math.PI*.5),super(r.getPoints(n),i),this.type="CapsuleGeometry",this.parameters={radius:t,length:e,capSegments:n,radialSegments:i}}static fromJSON(t){return new Ga(t.radius,t.length,t.capSegments,t.radialSegments)}}class ii extends Le{constructor(t=1,e=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],d=[],f=[];let g=0;const _=[],p=n/2;let m=0;v(),o===!1&&(t>0&&x(!0),e>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new ce(u,3)),this.setAttribute("normal",new ce(d,3)),this.setAttribute("uv",new ce(f,2));function v(){const M=new L,A=new L;let T=0;const E=(e-t)/n;for(let P=0;P<=r;P++){const N=[],y=P/r,b=y*(e-t)+t;for(let k=0;k<=i;k++){const F=k/i,G=F*l+a,Y=Math.sin(G),z=Math.cos(G);A.x=b*Y,A.y=-y*n+p,A.z=b*z,u.push(A.x,A.y,A.z),M.set(Y,E,z).normalize(),d.push(M.x,M.y,M.z),f.push(F,1-y),N.push(g++)}_.push(N)}for(let P=0;P<i;P++)for(let N=0;N<r;N++){const y=_[N][P],b=_[N+1][P],k=_[N+1][P+1],F=_[N][P+1];t>0&&(h.push(y,b,F),T+=3),e>0&&(h.push(b,k,F),T+=3)}c.addGroup(m,T,0),m+=T}function x(M){const A=g,T=new st,E=new L;let P=0;const N=M===!0?t:e,y=M===!0?1:-1;for(let k=1;k<=i;k++)u.push(0,p*y,0),d.push(0,y,0),f.push(.5,.5),g++;const b=g;for(let k=0;k<=i;k++){const G=k/i*l+a,Y=Math.cos(G),z=Math.sin(G);E.x=N*z,E.y=p*y,E.z=N*Y,u.push(E.x,E.y,E.z),d.push(0,y,0),T.x=Y*.5+.5,T.y=z*.5*y+.5,f.push(T.x,T.y),g++}for(let k=0;k<i;k++){const F=A+k,G=b+k;M===!0?h.push(G,G+1,F):h.push(G+1,G,F),P+=3}c.addGroup(m,P,M===!0?1:2),m+=P}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ii(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Va extends ii{constructor(t=1,e=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Va(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class br extends Le{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};const r=[],o=[];a(i),c(n),h(),this.setAttribute("position",new ce(r,3)),this.setAttribute("normal",new ce(r.slice(),3)),this.setAttribute("uv",new ce(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(v){const x=new L,M=new L,A=new L;for(let T=0;T<e.length;T+=3)f(e[T+0],x),f(e[T+1],M),f(e[T+2],A),l(x,M,A,v)}function l(v,x,M,A){const T=A+1,E=[];for(let P=0;P<=T;P++){E[P]=[];const N=v.clone().lerp(M,P/T),y=x.clone().lerp(M,P/T),b=T-P;for(let k=0;k<=b;k++)k===0&&P===T?E[P][k]=N:E[P][k]=N.clone().lerp(y,k/b)}for(let P=0;P<T;P++)for(let N=0;N<2*(T-P)-1;N++){const y=Math.floor(N/2);N%2===0?(d(E[P][y+1]),d(E[P+1][y]),d(E[P][y])):(d(E[P][y+1]),d(E[P+1][y+1]),d(E[P+1][y]))}}function c(v){const x=new L;for(let M=0;M<r.length;M+=3)x.x=r[M+0],x.y=r[M+1],x.z=r[M+2],x.normalize().multiplyScalar(v),r[M+0]=x.x,r[M+1]=x.y,r[M+2]=x.z}function h(){const v=new L;for(let x=0;x<r.length;x+=3){v.x=r[x+0],v.y=r[x+1],v.z=r[x+2];const M=p(v)/2/Math.PI+.5,A=m(v)/Math.PI+.5;o.push(M,1-A)}g(),u()}function u(){for(let v=0;v<o.length;v+=6){const x=o[v+0],M=o[v+2],A=o[v+4],T=Math.max(x,M,A),E=Math.min(x,M,A);T>.9&&E<.1&&(x<.2&&(o[v+0]+=1),M<.2&&(o[v+2]+=1),A<.2&&(o[v+4]+=1))}}function d(v){r.push(v.x,v.y,v.z)}function f(v,x){const M=v*3;x.x=t[M+0],x.y=t[M+1],x.z=t[M+2]}function g(){const v=new L,x=new L,M=new L,A=new L,T=new st,E=new st,P=new st;for(let N=0,y=0;N<r.length;N+=9,y+=6){v.set(r[N+0],r[N+1],r[N+2]),x.set(r[N+3],r[N+4],r[N+5]),M.set(r[N+6],r[N+7],r[N+8]),T.set(o[y+0],o[y+1]),E.set(o[y+2],o[y+3]),P.set(o[y+4],o[y+5]),A.copy(v).add(x).add(M).divideScalar(3);const b=p(A);_(T,y+0,v,b),_(E,y+2,x,b),_(P,y+4,M,b)}}function _(v,x,M,A){A<0&&v.x===1&&(o[x]=v.x-1),M.x===0&&M.z===0&&(o[x]=A/2/Math.PI+.5)}function p(v){return Math.atan2(v.z,-v.x)}function m(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new br(t.vertices,t.indices,t.radius,t.details)}}class cs extends br{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new cs(t.radius,t.detail)}}class uh extends ga{constructor(t){super(t),this.uuid=qi(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(new ga().fromJSON(i))}return this}}const _g={triangulate:function(s,t,e=2){const n=t&&t.length,i=n?t[0]*e:s.length;let r=dh(s,0,i,e,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,u,d,f;if(n&&(r=bg(s,t,r,e)),s.length>80*e){a=c=s[0],l=h=s[1];for(let g=e;g<i;g+=e)u=s[g],d=s[g+1],u<a&&(a=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return ms(r,o,e,a,l,f,0),o}};function dh(s,t,e,n,i){let r,o;if(i===Ug(s,t,e,n)>0)for(r=t;r<e;r+=n)o=hc(r,s[r],s[r+1],o);else for(r=e-n;r>=t;r-=n)o=hc(r,s[r],s[r+1],o);return o&&wr(o,o.next)&&(xs(o),o=o.next),o}function li(s,t){if(!s)return s;t||(t=s);let e=s,n;do if(n=!1,!e.steiner&&(wr(e,e.next)||ue(e.prev,e,e.next)===0)){if(xs(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function ms(s,t,e,n,i,r,o){if(!s)return;!o&&r&&Rg(s,n,i,r);let a=s,l,c;for(;s.prev!==s.next;){if(l=s.prev,c=s.next,r?Mg(s,n,i,r):vg(s)){t.push(l.i/e|0),t.push(s.i/e|0),t.push(c.i/e|0),xs(s),s=c.next,a=c.next;continue}if(s=c,s===a){o?o===1?(s=yg(li(s),t,e),ms(s,t,e,n,i,r,2)):o===2&&Sg(s,t,e,n,i,r):ms(li(s),t,e,n,i,r,1);break}}}function vg(s){const t=s.prev,e=s,n=s.next;if(ue(t,e,n)>=0)return!1;const i=t.x,r=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=i<r?i<o?i:o:r<o?r:o,u=a<l?a<c?a:c:l<c?l:c,d=i>r?i>o?i:o:r>o?r:o,f=a>l?a>c?a:c:l>c?l:c;let g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&Ii(i,a,r,l,o,c,g.x,g.y)&&ue(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Mg(s,t,e,n){const i=s.prev,r=s,o=s.next;if(ue(i,r,o)>=0)return!1;const a=i.x,l=r.x,c=o.x,h=i.y,u=r.y,d=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<d?h:d:u<d?u:d,_=a>l?a>c?a:c:l>c?l:c,p=h>u?h>d?h:d:u>d?u:d,m=xa(f,g,t,e,n),v=xa(_,p,t,e,n);let x=s.prevZ,M=s.nextZ;for(;x&&x.z>=m&&M&&M.z<=v;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=p&&x!==i&&x!==o&&Ii(a,h,l,u,c,d,x.x,x.y)&&ue(x.prev,x,x.next)>=0||(x=x.prevZ,M.x>=f&&M.x<=_&&M.y>=g&&M.y<=p&&M!==i&&M!==o&&Ii(a,h,l,u,c,d,M.x,M.y)&&ue(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;x&&x.z>=m;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=p&&x!==i&&x!==o&&Ii(a,h,l,u,c,d,x.x,x.y)&&ue(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;M&&M.z<=v;){if(M.x>=f&&M.x<=_&&M.y>=g&&M.y<=p&&M!==i&&M!==o&&Ii(a,h,l,u,c,d,M.x,M.y)&&ue(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function yg(s,t,e){let n=s;do{const i=n.prev,r=n.next.next;!wr(i,r)&&fh(i,n,n.next,r)&&gs(i,r)&&gs(r,i)&&(t.push(i.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),xs(n),xs(n.next),n=s=r),n=n.next}while(n!==s);return li(n)}function Sg(s,t,e,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Lg(o,a)){let l=ph(o,a);o=li(o,o.next),l=li(l,l.next),ms(o,t,e,n,i,r,0),ms(l,t,e,n,i,r,0);return}a=a.next}o=o.next}while(o!==s)}function bg(s,t,e,n){const i=[];let r,o,a,l,c;for(r=0,o=t.length;r<o;r++)a=t[r]*n,l=r<o-1?t[r+1]*n:s.length,c=dh(s,a,l,n,!1),c===c.next&&(c.steiner=!0),i.push(Pg(c));for(i.sort(wg),r=0;r<i.length;r++)e=Eg(i[r],e);return e}function wg(s,t){return s.x-t.x}function Eg(s,t){const e=Tg(s,t);if(!e)return t;const n=ph(e,s);return li(n,n.next),li(e,e.next)}function Tg(s,t){let e=t,n=-1/0,i;const r=s.x,o=s.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){const d=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=r&&d>n&&(n=d,i=e.x<e.next.x?e:e.next,d===r))return i}e=e.next}while(e!==t);if(!i)return null;const a=i,l=i.x,c=i.y;let h=1/0,u;e=i;do r>=e.x&&e.x>=l&&r!==e.x&&Ii(o<c?r:n,o,l,c,o<c?n:r,o,e.x,e.y)&&(u=Math.abs(o-e.y)/(r-e.x),gs(e,s)&&(u<h||u===h&&(e.x>i.x||e.x===i.x&&Ag(i,e)))&&(i=e,h=u)),e=e.next;while(e!==a);return i}function Ag(s,t){return ue(s.prev,s,t.prev)<0&&ue(t.next,s,s.next)<0}function Rg(s,t,e,n){let i=s;do i.z===0&&(i.z=xa(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,Cg(i)}function Cg(s){let t,e,n,i,r,o,a,l,c=1;do{for(e=s,s=null,r=null,o=0;e;){for(o++,n=e,a=0,t=0;t<c&&(a++,n=n.nextZ,!!n);t++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||e.z<=n.z)?(i=e,e=e.nextZ,a--):(i=n,n=n.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;e=n}r.nextZ=null,c*=2}while(o>1);return s}function xa(s,t,e,n,i){return s=(s-e)*i|0,t=(t-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function Pg(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function Ii(s,t,e,n,i,r,o,a){return(i-o)*(t-a)>=(s-o)*(r-a)&&(s-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(i-o)*(n-a)}function Lg(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!Ig(s,t)&&(gs(s,t)&&gs(t,s)&&Dg(s,t)&&(ue(s.prev,s,t.prev)||ue(s,t.prev,t))||wr(s,t)&&ue(s.prev,s,s.next)>0&&ue(t.prev,t,t.next)>0)}function ue(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function wr(s,t){return s.x===t.x&&s.y===t.y}function fh(s,t,e,n){const i=Qs(ue(s,t,e)),r=Qs(ue(s,t,n)),o=Qs(ue(e,n,s)),a=Qs(ue(e,n,t));return!!(i!==r&&o!==a||i===0&&Js(s,e,t)||r===0&&Js(s,n,t)||o===0&&Js(e,s,n)||a===0&&Js(e,t,n))}function Js(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function Qs(s){return s>0?1:s<0?-1:0}function Ig(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&fh(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function gs(s,t){return ue(s.prev,s,s.next)<0?ue(s,t,s.next)>=0&&ue(s,s.prev,t)>=0:ue(s,t,s.prev)<0||ue(s,s.next,t)<0}function Dg(s,t){let e=s,n=!1;const i=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&i<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==s);return n}function ph(s,t){const e=new _a(s.i,s.x,s.y),n=new _a(t.i,t.x,t.y),i=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=i,i.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function hc(s,t,e,n){const i=new _a(s,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function xs(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function _a(s,t,e){this.i=s,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Ug(s,t,e,n){let i=0;for(let r=t,o=e-n;r<e;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}class hs{static area(t){const e=t.length;let n=0;for(let i=e-1,r=0;r<e;i=r++)n+=t[i].x*t[r].y-t[r].x*t[i].y;return n*.5}static isClockWise(t){return hs.area(t)<0}static triangulateShape(t,e){const n=[],i=[],r=[];uc(t),dc(n,t);let o=t.length;e.forEach(uc);for(let l=0;l<e.length;l++)i.push(o),o+=e[l].length,dc(n,e[l]);const a=_g.triangulate(n,i);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function uc(s){const t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function dc(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}class Wa extends Le{constructor(t=new uh([new st(.5,.5),new st(-.5,.5),new st(-.5,-.5),new st(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,i=[],r=[];for(let a=0,l=t.length;a<l;a++){const c=t[a];o(c)}this.setAttribute("position",new ce(i,3)),this.setAttribute("uv",new ce(r,2)),this.computeVertexNormals();function o(a){const l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1;let d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3;const m=e.extrudePath,v=e.UVGenerator!==void 0?e.UVGenerator:Ng;let x,M=!1,A,T,E,P;m&&(x=m.getSpacedPoints(h),M=!0,d=!1,A=m.computeFrenetFrames(h,!1),T=new L,E=new L,P=new L),d||(p=0,f=0,g=0,_=0);const N=a.extractPoints(c);let y=N.shape;const b=N.holes;if(!hs.isClockWise(y)){y=y.reverse();for(let Z=0,C=b.length;Z<C;Z++){const rt=b[Z];hs.isClockWise(rt)&&(b[Z]=rt.reverse())}}const F=hs.triangulateShape(y,b),G=y;for(let Z=0,C=b.length;Z<C;Z++){const rt=b[Z];y=y.concat(rt)}function Y(Z,C,rt){return C||console.error("THREE.ExtrudeGeometry: vec does not exist"),Z.clone().addScaledVector(C,rt)}const z=y.length,K=F.length;function V(Z,C,rt){let it,Q,ot;const Pt=Z.x-C.x,xt=Z.y-C.y,R=rt.x-Z.x,S=rt.y-Z.y,O=Pt*Pt+xt*xt,q=Pt*S-xt*R;if(Math.abs(q)>Number.EPSILON){const j=Math.sqrt(O),$=Math.sqrt(R*R+S*S),At=C.x-xt/j,lt=C.y+Pt/j,Mt=rt.x-S/$,Zt=rt.y+R/$,et=((Mt-At)*S-(Zt-lt)*R)/(Pt*S-xt*R);it=At+Pt*et-Z.x,Q=lt+xt*et-Z.y;const yt=it*it+Q*Q;if(yt<=2)return new st(it,Q);ot=Math.sqrt(yt/2)}else{let j=!1;Pt>Number.EPSILON?R>Number.EPSILON&&(j=!0):Pt<-Number.EPSILON?R<-Number.EPSILON&&(j=!0):Math.sign(xt)===Math.sign(S)&&(j=!0),j?(it=-xt,Q=Pt,ot=Math.sqrt(O)):(it=Pt,Q=xt,ot=Math.sqrt(O/2))}return new st(it/ot,Q/ot)}const ut=[];for(let Z=0,C=G.length,rt=C-1,it=Z+1;Z<C;Z++,rt++,it++)rt===C&&(rt=0),it===C&&(it=0),ut[Z]=V(G[Z],G[rt],G[it]);const dt=[];let ft,qt=ut.concat();for(let Z=0,C=b.length;Z<C;Z++){const rt=b[Z];ft=[];for(let it=0,Q=rt.length,ot=Q-1,Pt=it+1;it<Q;it++,ot++,Pt++)ot===Q&&(ot=0),Pt===Q&&(Pt=0),ft[it]=V(rt[it],rt[ot],rt[Pt]);dt.push(ft),qt=qt.concat(ft)}for(let Z=0;Z<p;Z++){const C=Z/p,rt=f*Math.cos(C*Math.PI/2),it=g*Math.sin(C*Math.PI/2)+_;for(let Q=0,ot=G.length;Q<ot;Q++){const Pt=Y(G[Q],ut[Q],it);ht(Pt.x,Pt.y,-rt)}for(let Q=0,ot=b.length;Q<ot;Q++){const Pt=b[Q];ft=dt[Q];for(let xt=0,R=Pt.length;xt<R;xt++){const S=Y(Pt[xt],ft[xt],it);ht(S.x,S.y,-rt)}}}const Kt=g+_;for(let Z=0;Z<z;Z++){const C=d?Y(y[Z],qt[Z],Kt):y[Z];M?(E.copy(A.normals[0]).multiplyScalar(C.x),T.copy(A.binormals[0]).multiplyScalar(C.y),P.copy(x[0]).add(E).add(T),ht(P.x,P.y,P.z)):ht(C.x,C.y,0)}for(let Z=1;Z<=h;Z++)for(let C=0;C<z;C++){const rt=d?Y(y[C],qt[C],Kt):y[C];M?(E.copy(A.normals[Z]).multiplyScalar(rt.x),T.copy(A.binormals[Z]).multiplyScalar(rt.y),P.copy(x[Z]).add(E).add(T),ht(P.x,P.y,P.z)):ht(rt.x,rt.y,u/h*Z)}for(let Z=p-1;Z>=0;Z--){const C=Z/p,rt=f*Math.cos(C*Math.PI/2),it=g*Math.sin(C*Math.PI/2)+_;for(let Q=0,ot=G.length;Q<ot;Q++){const Pt=Y(G[Q],ut[Q],it);ht(Pt.x,Pt.y,u+rt)}for(let Q=0,ot=b.length;Q<ot;Q++){const Pt=b[Q];ft=dt[Q];for(let xt=0,R=Pt.length;xt<R;xt++){const S=Y(Pt[xt],ft[xt],it);M?ht(S.x,S.y+x[h-1].y,x[h-1].x+rt):ht(S.x,S.y,u+rt)}}}X(),tt();function X(){const Z=i.length/3;if(d){let C=0,rt=z*C;for(let it=0;it<K;it++){const Q=F[it];Ut(Q[2]+rt,Q[1]+rt,Q[0]+rt)}C=h+p*2,rt=z*C;for(let it=0;it<K;it++){const Q=F[it];Ut(Q[0]+rt,Q[1]+rt,Q[2]+rt)}}else{for(let C=0;C<K;C++){const rt=F[C];Ut(rt[2],rt[1],rt[0])}for(let C=0;C<K;C++){const rt=F[C];Ut(rt[0]+z*h,rt[1]+z*h,rt[2]+z*h)}}n.addGroup(Z,i.length/3-Z,0)}function tt(){const Z=i.length/3;let C=0;St(G,C),C+=G.length;for(let rt=0,it=b.length;rt<it;rt++){const Q=b[rt];St(Q,C),C+=Q.length}n.addGroup(Z,i.length/3-Z,1)}function St(Z,C){let rt=Z.length;for(;--rt>=0;){const it=rt;let Q=rt-1;Q<0&&(Q=Z.length-1);for(let ot=0,Pt=h+p*2;ot<Pt;ot++){const xt=z*ot,R=z*(ot+1),S=C+it+xt,O=C+Q+xt,q=C+Q+R,j=C+it+R;Dt(S,O,q,j)}}}function ht(Z,C,rt){l.push(Z),l.push(C),l.push(rt)}function Ut(Z,C,rt){Ht(Z),Ht(C),Ht(rt);const it=i.length/3,Q=v.generateTopUV(n,i,it-3,it-2,it-1);$t(Q[0]),$t(Q[1]),$t(Q[2])}function Dt(Z,C,rt,it){Ht(Z),Ht(C),Ht(it),Ht(C),Ht(rt),Ht(it);const Q=i.length/3,ot=v.generateSideWallUV(n,i,Q-6,Q-3,Q-2,Q-1);$t(ot[0]),$t(ot[1]),$t(ot[3]),$t(ot[1]),$t(ot[2]),$t(ot[3])}function Ht(Z){i.push(l[Z*3+0]),i.push(l[Z*3+1]),i.push(l[Z*3+2])}function $t(Z){r.push(Z.x),r.push(Z.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return kg(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,o=t.shapes.length;r<o;r++){const a=e[t.shapes[r]];n.push(a)}const i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new ma[i.type]().fromJSON(i)),new Wa(n,t.options)}}const Ng={generateTopUV:function(s,t,e,n,i){const r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[i*3],h=t[i*3+1];return[new st(r,o),new st(a,l),new st(c,h)]},generateSideWallUV:function(s,t,e,n,i,r){const o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[i*3],f=t[i*3+1],g=t[i*3+2],_=t[r*3],p=t[r*3+1],m=t[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new st(o,1-l),new st(c,1-u),new st(d,1-g),new st(_,1-m)]:[new st(a,1-l),new st(h,1-u),new st(f,1-g),new st(p,1-m)]}};function kg(s,t,e){if(e.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){const r=s[n];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class mr extends br{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new mr(t.radius,t.detail)}}class gr extends Le{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new L,d=new L,f=[],g=[],_=[],p=[];for(let m=0;m<=n;m++){const v=[],x=m/n;let M=0;m===0&&o===0?M=.5/e:m===n&&l===Math.PI&&(M=-.5/e);for(let A=0;A<=e;A++){const T=A/e;u.x=-t*Math.cos(i+T*r)*Math.sin(o+x*a),u.y=t*Math.cos(o+x*a),u.z=t*Math.sin(i+T*r)*Math.sin(o+x*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),p.push(T+M,1-x),v.push(c++)}h.push(v)}for(let m=0;m<n;m++)for(let v=0;v<e;v++){const x=h[m][v+1],M=h[m][v],A=h[m+1][v],T=h[m+1][v+1];(m!==0||o>0)&&f.push(x,M,T),(m!==n-1||l<Math.PI)&&f.push(M,A,T)}this.setIndex(f),this.setAttribute("position",new ce(g,3)),this.setAttribute("normal",new ce(_,3)),this.setAttribute("uv",new ce(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new gr(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class go extends Es{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Yt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Yt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gc,this.normalScale=new st(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class mh extends Te{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Yt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Fg extends mh{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Te.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Yt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const xo=new se,fc=new L,pc=new L;class Og{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new st(512,512),this.map=null,this.mapPass=null,this.matrix=new se,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ka,this._frameExtents=new st(1,1),this._viewportCount=1,this._viewports=[new fe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;fc.setFromMatrixPosition(t.matrixWorld),e.position.copy(fc),pc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(pc),e.updateMatrixWorld(),xo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(xo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Bg extends Og{constructor(){super(new Fa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class zg extends mh{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Te.DEFAULT_UP),this.updateMatrix(),this.target=new Te,this.shadow=new Bg}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Aa}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Aa);function Hg(s,t=!1){const e=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},o={},a=s[0].morphTargetsRelative,l=new Le;let c=0;for(let h=0;h<s.length;++h){const u=s[h];let d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(t){let f;if(e)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(e){let h=0;const u=[];for(let d=0;d<s.length;++d){const f=s[d].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=s[d].attributes.position.count}l.setIndex(u)}for(const h in r){const u=mc(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){const f=[];for(let _=0;_<o[h].length;++_)f.push(o[h][_][d]);const g=mc(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function mc(s){let t,e,n,i=-1,r=0;for(let c=0;c<s.length;++c){const h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}const o=new t(r),a=new Ge(o,e,n);let l=0;for(let c=0;c<s.length;++c){const h=s[c];if(h.isInterleavedBufferAttribute){const u=l/e;for(let d=0,f=h.count;d<f;d++)for(let g=0;g<e;g++){const _=h.getComponent(d,g);a.setComponent(d+u,g,_)}}else o.set(h.array,l);l+=h.count*e}return i!==void 0&&(a.gpuType=i),a}const It={grass:[5800508,6130240,5471289,6393668],hill:[7313993,7774542],hillSide:8020290,marsh:[5661498,5200949],bedShallow:7310450,bedDeep:2968156,dirt:6047280,water:3963560,stone:12169372,stoneDark:9801084,keep:10656392,wood:9067058,woodLight:11565638,door:6175262,roof:10110514,plaster:14865068,rock:9276035,moss:8161886,trunk:6044447,pine:3104563,leaf:4160058,soil:7755832,crop:13217866,sprout:7313982,awning:11942448,awningAlt:15524036,iron:5592405,banner:12857386,player:3431600,skin:14858380,helmet:10134445,shield:11702846,raider:13458462,brute:9185324,bowman:4874292,ram:7754287,catapult:8411194,boulder:8420468,arrow:15786688,arrowHostile:2760728,ladder:11041866,lord:7876728,crown:15516742,hole:1577488};function Gg(s,t){const e=s.tiles[t];return e.type==="moat"?-.3:e.terrain==="water"?-.32:e.terrain==="shallows"?-.14:e.terrain==="marsh"?-.02:s.groundElev(t)}const ss=new L(0,1,0);function Vg(s){const t=s.attributes.position.array,e=s.attributes.normal.array,n=new Float32Array(t.length/3*2);for(let i=0;i<t.length;i+=9){const r=Math.abs(e[i]+e[i+3]+e[i+6]),o=Math.abs(e[i+1]+e[i+4]+e[i+7]),a=Math.abs(e[i+2]+e[i+5]+e[i+8]);for(let l=0;l<9;l+=3){const c=t[i+l],h=t[i+l+1],u=t[i+l+2],d=(i+l)/3*2;o>=r&&o>=a?(n[d]=c,n[d+1]=u):r>=a?(n[d]=u,n[d+1]=h):(n[d]=c,n[d+1]=h)}}s.setAttribute("uv",new Ge(n,2))}const Wg=new Set(["palisade","wall","thick","gate","tower","keep"]);class Xg{constructor(t){this.canvas=t;const e=new tg({canvas:t,antialias:!0,powerPreference:"high-performance"});e.shadowMap.enabled=!0,e.shadowMap.type=Cc,e.outputColorSpace=Ye,e.toneMapping=Lc,e.toneMappingExposure=1.05,this.renderer=e,this.scene=new eg,this.scene.background=new Yt(1713696),this.camera=new Fa(-1,1,1,-1,.1,400),this.scene.add(new Fg(14674431,3820074,1.1));const n=new zg(16773336,2.2);n.castShadow=!0,n.shadow.mapSize.set(2048,2048),n.shadow.bias=-4e-4,n.shadow.normalBias=.03;const i=n.shadow.camera;i.left=-24,i.right=24,i.top=24,i.bottom=-24,i.near=1,i.far=120,this.sun=n,this.scene.add(n),this.scene.add(n.target),this.terrain=new Li,this.structures=new Li,this.scene.add(this.terrain,this.structures),this.mats={},this.mapSig="",this.structSig="",this.pools={},this.tmp={m:new se,q:new we,s:new L,p:new L,c:new Yt},this.buildPools()}mat(t,e,n={}){return this.mats[t]||(this.mats[t]=new go({color:e,roughness:.9,metalness:0,...n})),this.mats[t]}resize(t,e,n){this.renderer.setPixelRatio(Math.min(2,n)),this.renderer.setSize(t,e,!1)}syncCamera(t){const e=this.camera,n=t.k;e.left=-t.vw/2/n,e.right=t.vw/2/n,e.top=t.vh/2/n,e.bottom=-t.vh/2/n;const i=new L(t.sinT*t.cosE,t.sinE,t.cosT*t.cosE),r=new L(t.cosT,0,-t.sinT),o=new L().crossVectors(i,r),a=new L(t.fx,0,t.fy);e.position.copy(a).addScaledVector(i,120),e.quaternion.setFromRotationMatrix(new se().makeBasis(r,o,i)),e.updateProjectionMatrix()}render(t,e){const{world:n}=t;this.syncCamera(e);const i=n.w/2,r=n.h/2;this.sun.position.set(i-14,26,r+18),this.sun.target.position.set(i,0,r);const o=n.tiles.map(l=>l.terrain[0]+(l.type==="moat"?"m":"")).join("");o!==this.mapSig&&(this.mapSig=o,this.buildTerrain(n));const a=o+(n.keep.doorHp>0?"D":"d")+n.tiles.map(l=>`${l.type}${l.hoard?"h":""}${l.rock?"r":""}${l.plot||""}`).join(",");a!==this.structSig&&(this.structSig=a,this.buildStructures(n)),this.drawUnits(t),this.renderer.render(this.scene,this.camera)}begin(){this.parts={}}add(t,e){var n;((n=this.parts)[t]||(n[t]=[])).push(e.index?e.toNonIndexed():e)}box(t,e,n,i,r,o,a){const l=new Bn(r-e,a-i,o-n);l.translate((e+r)/2,(i+a)/2,(n+o)/2),this.add(t,l)}slab(t,e,n,i,r,o,a){const l=[e,i,i,e],c=[n,n,r,r],h=l.map((p,m)=>typeof o=="function"?o(p,c[m]):o),u=l.map((p,m)=>typeof a=="function"?a(p,c[m]):a),d=[...l.map((p,m)=>[p,h[m],c[m]]),...l.map((p,m)=>[p,u[m],c[m]])],f=[[4,5,6,7],[0,3,2,1],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],g=[];for(const[p,m,v,x]of f)for(const M of[p,v,m,p,x,v])g.push(...d[M]);const _=new Le;_.setAttribute("position",new ce(g,3)),_.setAttribute("uv",new ce(new Float32Array(g.length/3*2),2)),_.computeVertexNormals(),this.add(t,_)}cyl(t,e,n,i,r,o,a=8,l=o){const c=new ii(l,o,r-i,a);c.translate(e,(i+r)/2,n),this.add(t,c)}cone(t,e,n,i,r,o,a=8){const l=new Va(o,r,a);l.translate(e,i+r/2,n),this.add(t,l)}rod(t,e,n,i,r=5){const o=new L(e[0],e[2],e[1]),a=new L(n[0],n[2],n[1]),l=a.clone().sub(o),c=new ii(i,i,l.length(),r);c.applyQuaternion(new we().setFromUnitVectors(ss,l.clone().normalize())),c.translate((o.x+a.x)/2,(o.y+a.y)/2,(o.z+a.z)/2),this.add(t,c)}finish(t,e,{shadows:n=!0}={}){for(const i of[...t.children])t.remove(i),i.geometry.dispose();for(const[i,r]of Object.entries(this.parts)){const o=Hg(r,!1);for(const l of r)l.dispose();if(!o)continue;e[i].map&&Vg(o);const a=new ke(o,e[i]);a.castShadow=n&&!e[i].transparent,a.receiveShadow=!0,t.add(a)}}buildTerrain(t){const{w:e,h:n}=t,i=[],r=[],o=new Yt,a=2*e+1,l=2*n+1,c=new Float32Array(e*n),h=[];for(let M=0;M<e*n;M++){const A=t.tiles[M];c[M]=Gg(t,M);const T=Math.floor(A.v*4),E=A.type==="moat"||A.terrain==="water"?It.bedDeep:A.terrain==="shallows"?It.bedShallow:A.terrain==="marsh"?It.marsh[T&1]:A.terrain==="hill"?It.hill[T&1]:It.grass[T];h.push(new Yt(E))}const u=new Float32Array(a*l),d=[];for(let M=0;M<l;M++)for(let A=0;A<a;A++){const T=A%2?[(A-1)/2]:[A/2-1,A/2],E=M%2?[(M-1)/2]:[M/2-1,M/2];let P=0,N=0;const y=new Yt(0,0,0);for(const b of E)for(const k of T){if(k<0||b<0||k>=e||b>=n)continue;const F=b*e+k;P+=c[F],y.r+=h[F].r,y.g+=h[F].g,y.b+=h[F].b,N++}u[M*a+A]=N?P/N:0,d.push(N?y.multiplyScalar(1/N):y)}const f=[],g=(M,A)=>A*a+M;for(let M=0;M<n;M++)for(let A=0;A<e;A++){const T=2*A+1,E=2*M+1,P=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]].map(([y,b])=>g(T+y,E+b)),N=g(T,E);for(let y=0;y<8;y++)f.push(N,P[(y+1)%8],P[y])}for(let M=0;M<l;M++)for(let A=0;A<a;A++){i.push(A/2,u[g(A,M)],M/2);const T=d[g(A,M)];r.push(T.r,T.g,T.b)}const _=M=>{for(let A=0;A+1<M.length;A++){const[T,E]=M[A],[P,N]=M[A+1],y=i.length/3;o.setHex(It.dirt);for(const[b,k,F]of[[T,E,!0],[P,N,!0],[P,N,!1],[T,E,!1]])i.push(b/2,F?u[g(b,k)]:-.8,k/2),r.push(o.r,o.g,o.b);f.push(y,y+1,y+2,y,y+2,y+3)}},p=(M,A)=>Array.from({length:A},(T,E)=>M(E));_(p(M=>[M,0],a)),_(p(M=>[a-1,M],l)),_(p(M=>[a-1-M,l-1],a)),_(p(M=>[0,l-1-M],l));const m=new Le;m.setAttribute("position",new ce(i,3)),m.setAttribute("color",new ce(r,3)),m.setIndex(f),m.computeVertexNormals();for(const M of[...this.terrain.children])this.terrain.remove(M),M.geometry.dispose();const v=new ke(m,this.mat("land",16777215,{vertexColors:!0,roughness:1}));v.receiveShadow=!0,this.terrain.add(v);const x=new ke(new ri(e,n),this.mat("water",It.water,{transparent:!0,opacity:.78,roughness:.25,metalness:.05}));x.rotation.x=-Math.PI/2,x.position.set(e/2,-.07,n/2),x.receiveShadow=!0,this.terrain.add(x)}texMat(t,e,n){if(!this.mats[t]){const i=n==="wood"?Ac():Tc();if(this.texCache||(this.texCache={}),!this.texCache[n]){const c=new lc(i);c.wrapS=c.wrapT=fs,c.colorSpace=Ye,c.anisotropy=4;const h=new lc(i);h.wrapS=h.wrapT=fs,this.texCache[n]={map:c,bump:h}}const{map:r,bump:o}=this.texCache[n],a=new Yt(e),l=255/Ro[n];a.setRGB(Math.min(1,a.r*l),Math.min(1,a.g*l),Math.min(1,a.b*l)),this.mats[t]=new go({color:a,map:r,bumpMap:o,bumpScale:1.5,roughness:.92,metalness:0})}return this.mats[t]}materials(){return{stone:this.texMat("stone",It.stone,"stone"),stoneDark:this.texMat("stoneDark",It.stoneDark,"stone"),keep:this.texMat("keep",It.keep,"stone"),wood:this.texMat("wood",It.wood,"wood"),woodLight:this.mat("woodLight",It.woodLight),door:this.mat("door",It.door),roof:this.mat("roof",It.roof),plaster:this.mat("plaster",It.plaster),rock:this.mat("rock",It.rock,{flatShading:!0}),moss:this.mat("moss",It.moss,{flatShading:!0}),trunk:this.mat("trunk",It.trunk),pine:this.mat("pine",It.pine,{flatShading:!0}),leaf:this.mat("leaf",It.leaf,{flatShading:!0}),soil:this.mat("soil",It.soil),crop:this.mat("crop",It.crop),sprout:this.mat("sprout",It.sprout),awning:this.mat("awning",It.awning),awningAlt:this.mat("awningAlt",It.awningAlt),iron:this.mat("iron",It.iron,{metalness:.4,roughness:.6}),banner:this.mat("banner",It.banner,{side:rn}),player:this.mat("player",It.player,{side:rn}),ghost:this.mat("ghost",15917744,{transparent:!0,opacity:.32,depthWrite:!1}),stake:this.mat("stake",15325616),hole:this.mat("hole",It.hole,{roughness:1})}}connects(t,e,n,i,r){const o=e+i,a=n+r;return t.inBounds(o,a)&&Wg.has(t.tiles[t.idx(o,a)].type)}merlonRun(t,e,n,i,r,o,a,l=.14,c=.18){for(let h=0;h<a;h++){const u=a===1?.5:h/(a-1),d=e+(i-e)*u,f=n+(r-n)*u,g=typeof o=="function"?o(d,f):o;this.box(t,d-l/2,f-l/2,g,d+l/2,f+l/2,g+c)}}buildStructures(t){this.begin();const e=t.keep;for(let n=0;n<t.tiles.length;n++){const i=t.tiles[n],r=n%t.w,o=n/t.w|0,a=t.elev(n),l=i.rock?t.baseElev(n):t.minGround(n)-.35;switch(i.rock&&this.rockBase(r,o,a,l,i.v),i.type){case"palisade":this.palisade(t,r,o);break;case"wall":this.thinWall(t,r,o,a,l,i.hoard);break;case"thick":this.thickWall(t,r,o,a,l,i.hoard);break;case"gate":this.gate(t,r,o,a,l,i.hoard);break;case"tower":this.tower(t,r,o,a,l,i.hoard);break;case"pikes":this.pikes(t,r,o,l);break;case"stair":this.stair(t,n,r,o);break;case"trap":this.box("soil",r+.08,o+.08,a,r+.92,o+.92,a+.04);for(let c=0;c<3;c++)for(let h=0;h<3;h++)this.cone("iron",r+.25+c*.25,o+.25+h*.25,a+.04,.16,.04,4);break;case"tree":this.tree(r,o,a,i.v);break;case"rock":this.rock(r,o,a,i.v);break;case"cottage":this.cottage(r,o,a,"plaster","roof");break;case"farm":this.farm(r,o,a,i.v);break;case"market":this.market(r,o,a,!1);break;case"plot":this.plot(r,o,a,i.plot);break;case"keep":r===e.x&&o===e.y&&this.keep(t);break}}for(const n of t.spawns)this.spawnFlag(n.x+.5,n.y+.5);this.finish(this.structures,this.materials())}rockBase(t,e,n,i,r){const o=new cs(.62,0);o.scale(1,(i-n+.15)/1,.9),o.rotateY(r*6),o.translate(t+.5,n+(i-n)*.45,e+.5),this.add("rock",o)}rock(t,e,n,i){const r=new cs(.42,0);r.scale(1,.75+i*.4,.85),r.rotateY(i*9),r.translate(t+.5,n+.22+i*.1,e+.5),this.add("rock",r);const o=new cs(.2,0);o.translate(t+.5+(i-.5)*.3,n+.45+i*.2,e+.45),this.add("moss",o)}tree(t,e,n,i){const r=t+.5+(i-.5)*.25,o=e+.5+(i*7%1-.5)*.25;if(this.cyl("trunk",r,o,n,n+.45,.07,6),i<.55)this.cone("pine",r,o,n+.3,.7,.42,7),this.cone("pine",r,o,n+.65,.6,.32,7),this.cone("pine",r,o,n+.95,.5,.22,7);else{const a=new mr(.42,0);a.translate(r,n+.9,o),this.add("leaf",a);const l=new mr(.28,0);l.translate(r+.15,n+1.2,o-.1),this.add("leaf",l)}}palisade(t,e,n){const i=e+.5,r=n+.5,o=[[0,-1],[1,0],[0,1],[-1,0]].filter(([l,c])=>this.connects(t,e,n,l,c)),a=(l,c)=>{const h=t.heightAt(l,c);this.cyl("wood",l,c,h-.2,h+.75,.06,6),this.cone("woodLight",l,c,h+.75,.16,.06,6)};a(i,r);for(const[l,c]of o)for(const h of[.15,.3,.45])a(i+l*h,r+c*h)}thinWall(t,e,n,i,r,o){const a=wt.wall,l=a.thin/2,c=e+.5,h=n+.5,u=(f,g)=>(Math.abs(f-c)>=Math.abs(g-h)?t.heightAt(f,h):t.heightAt(c,g))+a.height;this.slab("stone",c-l,h-l,c+l,h+l,r,u);const d=[[0,-1],[1,0],[0,1],[-1,0]].filter(([f,g])=>this.connects(t,e,n,f,g));for(const[f,g]of d){const _=f?f>0?c+l:e:c-l,p=f?f>0?e+1:c-l:c+l,m=g?g>0?h+l:n:h-l,v=g?g>0?n+1:h-l:h+l;this.slab("stone",_,m,p,v,r,u);const x=o?"wood":"stoneDark",M=(A,T)=>u(A,T)+.3;if(f)for(const A of[h-l+.07,h+l-.07])o?this.slab(x,_,A-.04,p,A+.04,u,M):this.merlonRun(x,_+.08,A,p-.08,A,u,2);else for(const A of[c-l+.07,c+l-.07])o?this.slab(x,A-.04,m,A+.04,v,u,M):this.merlonRun(x,A,m+.08,A,v-.08,u,2)}d.length||this.merlonRun(o?"wood":"stoneDark",c-l+.07,h-l+.07,c+l-.07,h+l-.07,u,2)}thickWall(t,e,n,i,r,o){const a=(h,u)=>t.heightAt(h,u)+wt.thick.height;this.slab("stone",e,n,e+1,n+1,r,a),this.slab("stoneDark",e+.25,n+.25,e+.75,n+.75,a,(h,u)=>a(h,u)+.01);const l=o?"wood":"stoneDark",c=[[[0,-1],e+.08,n+.08,e+.92,n+.08],[[1,0],e+.92,n+.08,e+.92,n+.92],[[0,1],e+.08,n+.92,e+.92,n+.92],[[-1,0],e+.08,n+.08,e+.08,n+.92]];for(const[[h,u],d,f,g,_]of c)this.connects(t,e,n,h,u)||(o?this.slab(l,Math.min(d,g)-.05,Math.min(f,_)-.05,Math.max(d,g)+.05,Math.max(f,_)+.05,a,(p,m)=>a(p,m)+.32):this.merlonRun(l,d,f,g,_,a,3,.16,.22))}gate(t,e,n,i,r,o){const a=i+wt.gate.height;if(this.connects(t,e,n,1,0)||this.connects(t,e,n,-1,0)||!(this.connects(t,e,n,0,1)||this.connects(t,e,n,0,-1)))if(this.box("stone",e,n+.1,r,e+.3,n+.9,a),this.box("stone",e+.7,n+.1,r,e+1,n+.9,a),this.box("stone",e+.3,n+.1,i+.85,e+.7,n+.9,a),this.box("door",e+.3,n+.45,r,e+.7,n+.55,i+.85),o)for(const c of[n+.12,n+.84])this.box("wood",e,c,a,e+1,c+.05,a+.3);else for(const c of[n+.18,n+.82])this.merlonRun("stoneDark",e+.1,c,e+.9,c,a,3);else if(this.box("stone",e+.1,n,r,e+.9,n+.3,a),this.box("stone",e+.1,n+.7,r,e+.9,n+1,a),this.box("stone",e+.1,n+.3,i+.85,e+.9,n+.7,a),this.box("door",e+.45,n+.3,r,e+.55,n+.7,i+.85),o)for(const c of[e+.12,e+.84])this.box("wood",c,n,a,c+.05,n+1,a+.3);else for(const c of[e+.18,e+.82])this.merlonRun("stoneDark",c,n+.1,c,n+.9,a,3)}tower(t,e,n,i,r,o){const a=e+.5,l=n+.5,c=i+wt.tower.height;for(const[h,u]of[[0,-1],[1,0],[0,1],[-1,0]]){if(!this.connects(t,e,n,h,u))continue;const d=t.idx(e+h,n+u),f=t.tiles[d].type;if(f==="tower"||f==="keep")continue;const g=wt[f].height,_=f==="gate"?Math.min(t.elev(d)+g,c):(A,T)=>Math.min(c,(h?t.heightAt(A,l):t.heightAt(a,T))+g);if(f==="palisade"){for(const A of[.3,.45])this.cyl("wood",a+h*A,l+u*A,i,i+.75,.06,6),this.cone("woodLight",a+h*A,l+u*A,i+.75,.16,.06,6);continue}const p=f==="thick"?.5:f==="gate"?.4:wt.wall.thin/2,m=h?h>0?a:e:a-p,v=h?h>0?e+1:a:a+p,x=u?u>0?l:n:l-p,M=u?u>0?n+1:l:l+p;this.slab("stone",m,x,v,M,r,_)}if(this.cyl("stone",a,l,r,c,.47,14,.44),this.cyl("stoneDark",a,l,c-.12,c,.48,14),o)this.cyl("wood",a,l,c,c+.34,.5,14),this.cone("roof",a,l,c+.34,.5,.56,14);else for(let h=0;h<8;h++){const u=h/8*Math.PI*2,d=a+Math.cos(u)*.4,f=l+Math.sin(u)*.4;this.box("stoneDark",d-.08,f-.08,c,d+.08,f+.08,c+.2)}}stair(t,e,n,i){const r=t.stairFace(e),o=n+.5,a=i+.5;let l=0,c=1,h=t.elev(e)+.4;r>=0&&(l=r%t.w-n,c=(r/t.w|0)-i,h=t.surfaceAt(r,o+l*.5,a+c*.5));const u=4,d=.3;for(let f=0;f<u;f++){const g=-.5+f/u,_=-.5+(f+1)/u,p=l?o+Math.min(g*l,_*l):o-d,m=l?o+Math.max(g*l,_*l):o+d,v=c?a+Math.min(g*c,_*c):a-d,x=c?a+Math.max(g*c,_*c):a+d,M=t.heightAt((p+m)/2,(v+x)/2);this.box("stone",p,v,M-.3,m,x,M+(h-M)*((f+1)/u))}}pikes(t,e,n,i){const r=this.connects(t,e,n,1,0)||this.connects(t,e,n,-1,0)||t.tiles[t.idx(Math.min(t.w-1,e+1),n)].type==="pikes"||t.tiles[t.idx(Math.max(0,e-1),n)].type==="pikes",o=e+.5,a=n+.5,[l,c]=r?[1,0]:[0,1],[h,u]=[-c,l];this.rod("trunk",[o-l*.5,a-c*.5,i+.26],[o+l*.5,a+c*.5,i+.26],.06,6);for(const d of[-.33,0,.33]){const f=o+l*d,g=a+c*d;for(const _ of[1,-1]){const p=[f-h*.36*_,g-u*.36*_,i],m=[f+h*.2*_,g+u*.2*_,i+.42],v=[f+h*.42*_,g+u*.42*_,i+.62];this.rod("wood",p,m,.035),this.rod("stake",m,v,.03)}}}cottage(t,e,n,i,r){this.box(i,t+.18,e+.24,n,t+.82,e+.76,n+.44);const o=new uh;o.moveTo(-.33,0),o.lineTo(.33,0),o.lineTo(0,.36),o.closePath();const a=new Wa(o,{depth:.76,bevelEnabled:!1});a.rotateY(Math.PI/2),a.translate(t+.12,n+.44,e+.5),this.add(r,a),i!=="ghost"&&this.box("stoneDark",t+.66,e+.32,n+.5,t+.76,e+.42,n+.95)}farm(t,e,n,i){this.box("soil",t+.04,e+.04,n,t+.96,e+.96,n+.05);const r=i>.5?"crop":"sprout";for(let o=0;o<4;o++){const a=e+.17+o*.22;this.box(r,t+.1,a-.05,n+.05,t+.9,a+.05,n+.18)}}market(t,e,n,i){const r=i?"ghost":"wood";this.box(r,t+.15,e+.3,n,t+.85,e+.7,n+.35);for(const[o,a]of[[.12,.2],[.88,.2],[.12,.8],[.88,.8]])this.cyl(r,t+o,e+a,n,n+.85,.03,5);for(let o=0;o<5;o++){const a=t+.08+o*.168,l=new Bn(.168,.03,.78);l.rotateX(-.28),l.translate(a+.084,n+.86,e+.5),this.add(i?"ghost":o%2?"awningAlt":"awning",l)}}plot(t,e,n,i){for(const[r,o]of[[.08,.08],[.92,.08],[.92,.92],[.08,.92]])this.cyl("stake",t+r,e+o,n,n+.25,.025,4);i==="cottage"?this.cottage(t,e,n,"ghost","ghost"):i==="market"?this.market(t,e,n,!0):this.box("ghost",t+.06,e+.06,n,t+.94,e+.94,n+.12)}keep(t){const e=t.keep,n=oe.height;this.box("keep",e.x,e.y,0,e.x+3,e.y+3,n),this.box("stoneDark",e.x+.35,e.y+.35,n,e.x+2.65,e.y+2.65,n+.02);const i=.1;this.merlonRun("stoneDark",e.x+i,e.y+i,e.x+3-i,e.y+i,n,8,.18,.24),this.merlonRun("stoneDark",e.x+i,e.y+3-i,e.x+3-i,e.y+3-i,n,8,.18,.24),this.merlonRun("stoneDark",e.x+i,e.y+i,e.x+i,e.y+3-i,n,8,.18,.24),this.merlonRun("stoneDark",e.x+3-i,e.y+i,e.x+3-i,e.y+3-i,n,8,.18,.24);for(const[h,u]of[[e.x,e.y],[e.x+3,e.y],[e.x,e.y+3],[e.x+3,e.y+3]])this.cyl("keep",h,u,0,n+.5,.32,10),this.cone("roof",h,u,n+.5,.55,.38,10);const r=e.x+1.5,o=e.y+3;if(e.doorHp>0){this.box("door",r-.22,o-.02,0,r+.22,o+.04,.8),this.cyl("door",r,o+.01,.62,.68,.22,10);for(const h of[.22,.55])this.box("iron",r-.23,o+.03,h,r+.23,o+.05,h+.04)}else this.box("hole",r-.22,o-.02,0,r+.22,o+.02,.85),this.rod("door",[r-.3,o+.25,.02],[r-.05,o+.4,.05],.03),this.rod("door",[r+.1,o+.3,.02],[r+.35,o+.15,.04],.03);const a=e.x+1.5,l=e.y+1.5;this.cyl("trunk",a,l,n,n+1.4,.03,5);const c=new ri(.7,.4);c.translate(a+.35,n+1.2,l),this.add("player",c)}spawnFlag(t,e){this.cyl("trunk",t,e,0,1.6,.03,5);const n=new ri(.55,.32);n.translate(t+.28,1.42,e),this.add("banner",n)}buildPools(){const t=(e,n,i,r={})=>{const o=new go({color:16777215,roughness:.8,...r}),a=new sg(n,o,i);a.castShadow=!0,a.receiveShadow=!0,a.count=0,a.frustumCulled=!1,a.instanceMatrix.setUsage(Fu),this.scene.add(a),this.pools[e]={mesh:a,n:0,max:i}};t("body",new Ga(1,1,3,8),600),t("head",new gr(1,10,8),600),t("rod",new ii(1,1,1,5),900),t("box",new Bn(1,1,1),200),t("ball",new gr(1,8,6),200),t("disc",new ii(1,1,1,10),200)}put(t,e,n,i,r){const o=this.pools[t];if(o.n>=o.max)return;const{m:a,c:l}=this.tmp;a.compose(e,n,i),o.mesh.setMatrixAt(o.n,a),o.mesh.setColorAt(o.n,l.setHex(r)),o.n++}putRod(t,e,n,i){const r=new L(t[0],t[2],t[1]),o=new L(e[0],e[2],e[1]),a=o.clone().sub(r),l=a.length()||.001;this.put("rod",r.add(o).multiplyScalar(.5),new we().setFromUnitVectors(ss,a.divideScalar(l)),new L(n,l,n),i)}figure(t,e,n,i,r,o,a){const l=new we;this.put("body",new L(t,n+r/2,e),l,new L(i,r/3,i),o),this.put("head",new L(t,n+r+i*.45,e),l,new L(i*.6,i*.6,i*.6),a)}drawUnits(t){for(const c of Object.values(this.pools))c.n=0;const e=t.time,n=c=>new we().setFromAxisAngle(ss,-c);for(const c of t.enemies){const h=c.flash>0,u=Math.abs(Math.sin(c.walk))*.05;if(c.type==="ram"){const v=h?16777215:It.ram;this.put("box",new L(c.x,c.z+.26,c.y),n(c.heading),new L(.9,.34,.5),v),this.put("box",new L(c.x,c.z+.5,c.y),n(c.heading),new L(.8,.12,.56),5914148);const x=c.attacking?Math.abs(Math.sin(c.walk))*.12:0;this.put("ball",new L(c.x+Math.cos(c.heading)*(.48+x),c.z+.26,c.y+Math.sin(c.heading)*(.48+x)),new we,new L(.12,.12,.12),It.iron);continue}if(c.type==="catapult"){this.catapult(c,e,h);continue}if(c.type==="ladder"){const v=Math.cos(c.heading),x=Math.sin(c.heading);for(const[A,T]of[[.24,0],[-.24,Math.PI]]){const E=Math.abs(Math.sin(c.walk+T))*.05;this.figure(c.x+v*A,c.y+x*A,c.z+E,.15,.46,h?16777215:It.raider,It.skin)}const M=Math.min(1,c.raising/1.2)*.9;this.ladder([c.x-v*.5,c.y-x*.5,c.z+.52],[c.x+v*.5,c.y+x*.5,c.z+.52+M]);continue}const d=c.type==="brute",f=d?.6:.48,g=h?16777215:It[c.type];this.figure(c.x,c.y,c.z+u,c.r*.8,f,g,d?It.helmet:c.type==="bowman"?3359786:It.skin);const _=c.attacking?Math.sin(c.walk*2)*.5:0,p=d?.42:.34,m=c.z+f*.6+u;c.type==="bowman"?this.bow(c.x,c.y,c.z,c.heading,3877400):this.putRod([c.x,c.y,m],[c.x+Math.cos(c.heading+_)*p,c.y+Math.sin(c.heading+_)*p,m+.1+_*.15],.025,d?3881787:13684944)}for(const c of t.ladders){const h=t.ladderGeom(c);this.ladder([h.fx,h.fy,h.fz],[h.tx,h.ty,h.tz])}for(const c of t.fallen){const h=t.world.heightAt(c.x,c.y)+.04,[u,d]=c.dir;this.ladder([c.x+u*.55,c.y+d*.55,h],[c.x-u*.55,c.y-d*.55,h])}const i=t.world.keep,r=i.x+2.35,o=i.y+2.3,a=oe.height,l=i.inside>0&&Math.sin(e*20)>.6;this.figure(r,o,a,.13,.36,l?16777215:It.lord,It.skin),this.put("disc",new L(r,a+.5,o),new we,new L(.07,.05,.07),It.crown);for(const c of t.archers){const u=c.path.length>0?Math.abs(Math.sin(e*12+c.id))*.04:0;this.figure(c.x,c.y,c.z+u,.11,.3,c.flash>0?16777215:It.player,It.skin),this.bow(c.x,c.y,c.z+u,c.heading,7029795)}for(const c of t.swordsmen){const h=Math.abs(Math.sin(c.walk))*.04;this.figure(c.x,c.y,c.z+h,c.r*.8,.48,c.flash>0?16777215:It.player,It.helmet);const u=c.heading,d=c.fighting?Math.sin(c.walk*2)*.6:.3,f=c.z+.32+h;this.putRod([c.x+Math.cos(u+1.2)*.12,c.y+Math.sin(u+1.2)*.12,f],[c.x+Math.cos(u+d)*.42,c.y+Math.sin(u+d)*.42,f+.12],.022,14673130);const g=c.x+Math.cos(u-1.1)*.17,_=c.y+Math.sin(u-1.1)*.17,p=new we().setFromUnitVectors(ss,new L(Math.cos(u-1.1),0,Math.sin(u-1.1)));this.put("disc",new L(g,c.z+.3+h,_),p,new L(.12,.03,.12),It.shield)}for(const c of t.projectiles){if(c.kind==="boulder"){this.put("ball",new L(c.x,c.z,c.y),new we,new L(.14,.14,.14),It.boulder);continue}const h=c.x-c.px,u=c.y-c.py,d=c.z-c.pz,f=Math.hypot(h,u,d)||1;this.putRod([c.x-h/f*.35,c.y-u/f*.35,c.z-d/f*.35],[c.x,c.y,c.z],.015,c.hostile?It.arrowHostile:It.arrow)}for(const c of Object.values(this.pools))c.mesh.count=c.n,c.mesh.instanceMatrix.needsUpdate=!0,c.mesh.instanceColor&&(c.mesh.instanceColor.needsUpdate=!0)}ladder(t,e){const n=e[0]-t[0],i=e[1]-t[1],r=Math.hypot(n,i)||1,o=-i/r*.13,a=n/r*.13;this.putRod([t[0]-o,t[1]-a,t[2]],[e[0]-o,e[1]-a,e[2]],.025,It.ladder),this.putRod([t[0]+o,t[1]+a,t[2]],[e[0]+o,e[1]+a,e[2]],.025,It.ladder);for(let l=1;l<6;l++){const c=l/6,h=t[0]+n*c,u=t[1]+i*c,d=t[2]+(e[2]-t[2])*c;this.putRod([h-o,u-a,d],[h+o,u+a,d],.018,8018484)}}bow(t,e,n,i,r){const o=t+Math.cos(i)*.18,a=e+Math.sin(i)*.18,l=-Math.sin(i)*.13,c=Math.cos(i)*.13;this.putRod([o-l,a-c,n+.18],[o+l,a+c,n+.48],.015,r)}catapult(t,e,n){const i=n?16777215:It.catapult,r=Math.cos(t.heading),o=Math.sin(t.heading),a=t.z;this.put("box",new L(t.x,a+.17,t.y),new we().setFromAxisAngle(ss,-t.heading),new L(.84,.16,.5),i);for(const[m,v]of[[.3,.27],[.3,-.27],[-.3,.27],[-.3,-.27]])this.put("ball",new L(t.x+r*m-o*v,a+.1,t.y+o*m+r*v),new we,new L(.1,.1,.1),3811866);const l=a+.7,c=-o*.2,h=r*.2;this.putRod([t.x+c,t.y+h,a+.25],[t.x,t.y,l],.03,5914152),this.putRod([t.x-c,t.y-h,a+.25],[t.x,t.y,l],.03,5914152);const u=e-t.fired,f=-.45+(u<.18?u/.18:Math.max(0,1-(u-.18)/1.8))*1.9,g=t.x-r*Math.cos(f)*.7,_=t.y-o*Math.cos(f)*.7,p=l+Math.sin(f)*.7;this.putRod([t.x+r*.18,t.y+o*.18,l-Math.sin(f)*.18],[g,_,p],.035,i),this.put("ball",new L(g,p+.05,_),new we,new L(.1,.1,.1),u>1.2?It.boulder:4863526)}dispose(){this.renderer.dispose()}}const _o=8;class qg{constructor(t,e,n){this.canvas=t,this.cam=e,this.h=n,this.pointers=new Map,this.mode=null,this.lastTile=-1,t.addEventListener("pointerdown",i=>this.down(i)),t.addEventListener("pointermove",i=>this.move(i)),t.addEventListener("pointerup",i=>this.up(i)),t.addEventListener("pointercancel",i=>this.up(i,!0)),t.addEventListener("contextmenu",i=>i.preventDefault()),t.addEventListener("wheel",i=>{i.preventDefault(),this.cam.zoomAt(Math.exp(-i.deltaY*.0015),i.clientX,i.clientY)},{passive:!1})}tileAt(t,e){const n=this.cam.unproject(t,e);return this.h.worldToTile(n.x,n.y)}down(t){if(this.canvas.setPointerCapture(t.pointerId),this.pointers.set(t.pointerId,{x:t.clientX,y:t.clientY,sx:t.clientX,sy:t.clientY}),this.pointers.size===2){this.mode==="tower"&&this.h.preview(null),this.mode==="box"&&this.h.boxCancel(),this.mode="pinch",this.pinch=this.pinchState();return}if(this.pointers.size>2)return;const e=this.h.tool(),n=t.pointerType==="mouse"&&t.button!==0;e==="look"||n?this.mode="pan":this.h.boxTool(e)?(this.mode="box",this.h.boxStart(this.cam.unproject(t.clientX,t.clientY))):this.h.placeOnRelease(e)?(this.mode="tower",this.lastTile=this.tileAt(t.clientX,t.clientY),this.h.preview(this.lastTile)):(this.mode="pending",this.lastTile=-1)}move(t){const e=this.pointers.get(t.pointerId);if(!e){t.pointerType==="mouse"&&this.h.tool()!=="look"&&this.h.preview(this.tileAt(t.clientX,t.clientY));return}const n=t.clientX-e.x,i=t.clientY-e.y;switch(e.x=t.clientX,e.y=t.clientY,this.mode){case"pan":this.cam.panBy(n,i);break;case"box":this.h.boxMove(this.cam.unproject(e.x,e.y));break;case"pending":Math.hypot(e.x-e.sx,e.y-e.sy)>_o&&(this.mode="paint",this.paintTo(this.tileAt(e.sx,e.sy)),this.paintTo(this.tileAt(e.x,e.y)));break;case"paint":this.paintTo(this.tileAt(e.x,e.y));break;case"tower":{const r=this.tileAt(e.x,e.y);r!==this.lastTile&&(this.lastTile=r,this.h.preview(r));break}case"pinch":{const r=this.pinchState();if(!r||!this.pinch)break;this.cam.panBy(r.cx-this.pinch.cx,r.cy-this.pinch.cy),this.cam.zoomAt(r.dist/this.pinch.dist,r.cx,r.cy);let o=r.angle-this.pinch.angle;o>Math.PI&&(o-=Math.PI*2),o<-Math.PI&&(o+=Math.PI*2),this.cam.twist(o),this.pinch=r;break}}}up(t,e=!1){var i,r,o,a;const n=this.pointers.get(t.pointerId);if(n){if(this.pointers.delete(t.pointerId),this.mode==="pinch"){this.pointers.size===0?this.mode=null:this.pinch=null;return}if(this.mode==="box"){e?this.h.boxCancel():this.h.boxEnd(this.cam.unproject(n.x,n.y),Math.hypot(n.x-n.sx,n.y-n.sy)<=_o),this.mode=null;return}!e&&this.mode==="pan"&&Math.hypot(n.x-n.sx,n.y-n.sy)<=_o&&((r=(i=this.h).tapTile)==null||r.call(i,this.tileAt(n.x,n.y))),e||(this.mode==="pending"&&this.paintTo(this.tileAt(n.x,n.y)),this.mode==="tower"&&this.lastTile>=0&&this.h.placeAt(this.lastTile)),this.mode==="tower"&&this.h.preview(null),(a=(o=this.h).strokeEnd)==null||a.call(o),this.mode=null,this.lastTile=-1}}pinchState(){const t=[...this.pointers.values()];if(t.length<2)return null;const[e,n]=t;return{cx:(e.x+n.x)/2,cy:(e.y+n.y)/2,dist:Math.max(10,Math.hypot(n.x-e.x,n.y-e.y)),angle:Math.atan2(n.y-e.y,n.x-e.x)}}paintTo(t){if(!(t<0)){if(this.lastTile<0){this.lastTile=t,this.h.paint(t);return}if(t!==this.lastTile){for(const e of this.h.lineTiles(this.lastTile,t))this.h.paint(e);this.lastTile=t}}}}const Di={chamber:{label:"Castle Chamber",src:"./music/castle-chamber.mp3"},minstrel:{label:"Minstrel Guild",src:"./music/minstrel.mp3"}},$g="./music/heroic.mp3",Yg={bow:.07,hit:.06,clash:.12,build:.05,recruit:.1,crumble:.15,launch:.3,impact:.2,fall:.2};class Kg{constructor(){this.ctx=null,this.musicOn=!0,this.sfxOn=!0,this.tracks={},this.want="build",this.buildTrack="chamber",this.last={};try{const t=JSON.parse(localStorage.getItem("htk-audio")||"{}");t.music===!1&&(this.musicOn=!1),t.sfx===!1&&(this.sfxOn=!1),Di[t.buildTrack]&&(this.buildTrack=t.buildTrack)}catch{}}save(){try{localStorage.setItem("htk-audio",JSON.stringify({music:this.musicOn,sfx:this.sfxOn,buildTrack:this.buildTrack}))}catch{}}unlock(){try{navigator.audioSession&&(navigator.audioSession.type="playback")}catch{}if(this.ctx){this.ctx.state!=="running"&&this.ctx.resume().catch(()=>{}),this.musicOn&&this.setMusic(this.want);return}const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.ctx.resume().catch(()=>{});const e=this.ctx.createBufferSource();e.buffer=this.ctx.createBuffer(1,1,this.ctx.sampleRate),e.connect(this.ctx.destination),e.start(0),this.master=this.ctx.createGain(),this.master.gain.value=.5,this.master.connect(this.ctx.destination);const n=this.ctx.sampleRate;this.noise=this.ctx.createBuffer(1,n,this.ctx.sampleRate);const i=this.noise.getChannelData(0);for(let r=0;r<n;r++)i[r]=Math.random()*2-1;this.tracks.build=this.makeTrack(Di[this.buildTrack].src),this.tracks.battle=this.makeTrack($g),this.setMusic(this.want)}makeTrack(t){const e=new window.Audio;return e.loop=!0,e.preload="auto",e.volume=0,e.setAttribute("playsinline",""),e.addEventListener("error",()=>this.fallbackSource(e,t),{once:!0}),e.src=t,e}nextBuildTrack(){const t=Object.keys(Di);this.buildTrack=t[(t.indexOf(this.buildTrack)+1)%t.length],this.save();const e=this.tracks.build;if(!e)return;e.pause();const n=this.makeTrack(Di[this.buildTrack].src);n.volume=e.volume,this.tracks.build=n,this.musicOn&&this.want==="build"&&n.play().catch(()=>{})}async fallbackSource(t,e){try{const n=await fetch(e);if(!n.ok)return;t.src=URL.createObjectURL(await n.blob()),this.musicOn&&this.setMusic(this.want)}catch{}}get running(){return!!this.ctx&&this.ctx.state==="running"}setMusic(t){if(this.want=t,!this.ctx||!this.musicOn)return;const e=this.tracks[t];e&&e.paused&&e.play().catch(()=>{})}toggleMusic(){if(this.musicOn=!this.musicOn,this.musicOn)this.setMusic(this.want);else for(const t of Object.values(this.tracks))t.pause();this.save()}toggleSfx(){this.sfxOn=!this.sfxOn,this.save()}update(t){for(const[e,n]of Object.entries(this.tracks)){const i=this.musicOn&&e===this.want?.35:0;n.volume=Math.max(0,Math.min(1,n.volume+Math.sign(i-n.volume)*Math.min(Math.abs(i-n.volume),t*.4))),n.volume===0&&!n.paused&&e!==this.want&&n.pause()}}play(t,e=1){if(!this.ctx||!this.sfxOn)return;const n=this.ctx.currentTime;if(n-(this.last[t]||-1)<(Yg[t]||0))return;this.last[t]=n;const i=this[`fx_${t}`];i&&i.call(this,n,e)}env(t,e,n,i){const r=this.ctx.createGain();return r.gain.setValueAtTime(1e-4,t),r.gain.exponentialRampToValueAtTime(i,t+e),r.gain.exponentialRampToValueAtTime(1e-4,t+e+n),r.connect(this.master),r}tone(t,e,n,i,r,o){const a=this.ctx.createOscillator();a.type=e,a.frequency.setValueAtTime(n,t),o&&a.frequency.exponentialRampToValueAtTime(o,t+i),a.connect(this.env(t,.005,i,r)),a.start(t),a.stop(t+i+.05)}hiss(t,e,n,i,r,o=1,a){const l=this.ctx.createBufferSource();l.buffer=this.noise;const c=this.ctx.createBiquadFilter();c.type=i,c.frequency.setValueAtTime(r,t),a&&c.frequency.exponentialRampToValueAtTime(a,t+e),c.Q.value=o,l.connect(c),c.connect(this.env(t,.004,e,n)),l.start(t,Math.random()*.5),l.stop(t+e+.05)}fx_bow(t,e){this.tone(t,"triangle",420+Math.random()*80,.08,.12*e,180),this.hiss(t,.12,.08*e,"bandpass",2400,2,900)}fx_hit(t,e){this.tone(t,"sine",160,.08,.15*e,70)}fx_clash(t,e){const n=1800+Math.random()*900;this.tone(t,"square",n,.09,.05*e,n*.7),this.tone(t,"triangle",n*1.5,.15,.04*e)}fx_build(t,e){this.tone(t,"sine",230+Math.random()*40,.07,.2*e,120),this.hiss(t,.05,.08*e,"lowpass",1400)}fx_recruit(t,e){this.tone(t,"triangle",520,.08,.1*e),this.tone(t+.07,"triangle",780,.12,.1*e)}fx_crumble(t,e){this.hiss(t,.7,.35*e,"lowpass",900,.7,160),this.tone(t,"sine",90,.4,.25*e,40)}fx_launch(t,e){this.tone(t,"sine",120,.2,.25*e,60),this.hiss(t+.05,.5,.12*e,"bandpass",500,1.5,1600)}fx_impact(t,e){this.tone(t,"sine",70,.5,.45*e,30),this.hiss(t,.45,.3*e,"lowpass",700,.7,120)}fx_fall(t,e){this.tone(t,"sawtooth",300,.25,.05*e,120)}fx_horn(t,e){for(const[n,i,r]of[[0,146.8,.7],[.55,196,1.1]]){const o=this.ctx.createOscillator();o.type="sawtooth",o.frequency.setValueAtTime(i*.94,t+n),o.frequency.linearRampToValueAtTime(i,t+n+.12);const a=this.ctx.createBiquadFilter();a.type="lowpass",a.frequency.value=900;const l=this.ctx.createGain();l.gain.setValueAtTime(1e-4,t+n),l.gain.exponentialRampToValueAtTime(.22*e,t+n+.1),l.gain.setValueAtTime(.22*e,t+n+r-.2),l.gain.exponentialRampToValueAtTime(1e-4,t+n+r),o.connect(a),a.connect(l),l.connect(this.master),o.start(t+n),o.stop(t+n+r+.05)}}fx_victory(t,e){[392,494,587,784].forEach((n,i)=>this.tone(t+i*.16,"triangle",n,.5,.15*e))}fx_defeat(t,e){[392,330,262,196].forEach((n,i)=>this.tone(t+i*.28,"triangle",n,.6,.15*e))}fx_waveEnd(t,e){[523,659,784].forEach((n,i)=>this.tone(t+i*.12,"triangle",n,.35,.12*e))}}const gc="htk-progress",rs="htk-maps";class Zg{constructor(){this.db=null,this.uid=null,this.ready=this.init()}async init(){try{const t=window.claude;if(!(t!=null&&t.use))return;const[e,n]=await Promise.all([t.use("db"),t.use("user")]),i=n?await n.id():null;e&&i&&(this.db=e,this.uid=i)}catch{}}get where(){return this.db?"your account":"this browser"}col(){return this.db.collection(`data/users/${this.uid}`)}async saveProgress(t){return await this.ready,this.db?(await this.col().doc("progress").set({kind:"progress",json:JSON.stringify(t)}),!0):vo(gc,t)}async loadProgress(){await this.ready;try{if(this.db){const t=await this.col().doc("progress").get();return t.exists?JSON.parse(t.data().json):null}return tr(gc,null)}catch{return null}}async listMaps(){await this.ready;try{return this.db?(await this.col().where("kind","==","map").get()).docs.map(e=>({id:e.id,...e.data()})).sort((e,n)=>n.savedAt-e.savedAt):tr(rs,[])}catch{return[]}}async saveMap(t,e){await this.ready;const n={kind:"map",name:t,map:e,savedAt:Date.now()};if(this.db)return await this.col().doc(`map-${n.savedAt}`).set(n),!0;const i=tr(rs,[]);return i.unshift({id:`map-${n.savedAt}`,...n}),vo(rs,i)}async deleteMap(t){return await this.ready,this.db?(await this.col().doc(t).delete(),!0):vo(rs,tr(rs,[]).filter(e=>e.id!==t))}}function tr(s,t){try{const e=localStorage.getItem(s);return e?JSON.parse(e):t}catch{return t}}function vo(s,t){try{return localStorage.setItem(s,JSON.stringify(t)),!0}catch{return!1}}const cn={look:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/></svg>',wall:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 9.7h20M2 14.3h20M8 5v4.7M15 5v4.7M5 9.7v4.6M12 9.7v4.6M19 9.7v4.6M8 14.3V19M15 14.3V19"/></svg>',tower:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 22V9h14v13zM5 9V3h3v2.5h2.5V3h3v2.5H16V3h3v6"/><path d="M10 22v-5a2 2 0 0 1 4 0v5"/></svg>',trap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 20h20M4 20l2.5-9L9 20M9.5 20l2.5-12 2.5 12M15 20l2.5-9L20 20"/></svg>',demolish:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c3 0 6 2 7 5-3-1.5-6-1.5-9 0M12 9l-9 9 3 3 9-9"/></svg>',menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',rotate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>',cube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12L3 7M12 12v10"/></svg>',palisade:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 21V8l2-3 2 3v13M10 21V8l2-3 2 3v13M16 21V8l2-3 2 3v13M2 15h20"/></svg>',thick:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 21V7h3V4h3v3h3V4h2v3h3V4h3v3h3v14z"/><path d="M2 12h20M2 16.5h20M8 12v4.5M16 12v4.5M12 16.5V21"/></svg>',archer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3c6 3 6 15 0 18M7 3v18M3 12h17M17 9l3 3-3 3"/></svg>',moat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',pikes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 20L9 4M9 20L3 4M13 20l6-16M19 20L13 4M1 14h22"/></svg>',gate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 21V5h3V3h3v2h8V3h3v2h3v16h-7v-6a3 3 0 0 0-6 0v6z"/><path d="M12 12v9"/></svg>',swordsman:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7L9 22l-2-2L19 8M5 15l4 4M3 17l4 4"/></svg>',upgrade:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M7 21V11h10v10M12 3v10M8 7l4-4 4 4"/></svg>',soundOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',soundOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6"/></svg>',hoard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 21V13h18v8M3 13V7h3v6M9 13V7h3v6M15 13V7h3v6M21 13V7"/><path d="M2 7h20"/></svg>',orders:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V3M5 4h12l-3 4 3 4H5"/><path d="M14 16h7v5h-7z" stroke-dasharray="2 2"/></svg>',settle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 11l9-7 9 7M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',fsOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',fsOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>',stair:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 21h18V4h-4v4.25h-4.5v4.25H8v4.25H3z"/></svg>',feedback:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M12 8v3M12 13.5v.01"/></svg>',grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>'},_s={look:"Look",palisade:"Palisade",wall:"Stone wall",thick:"Thick wall",tower:"Tower",archer:"Archer",moat:"Moat",pikes:"Pikes",gate:"Gate",stair:"Stairs",swordsman:"Swordsman",upgrade:"Upgrade",hoard:"Hoarding",orders:"Orders",settle:"Village",trap:"Spikes",demolish:"Remove"},jg={palisade:"Cheap wood. Archers can't stand on it.",wall:"Archers walk along connected stone.",thick:"Very tough, holds 2 archers.",tower:"Comes with an archer. Height adds range.",archer:"Tap a wall, tower or the keep.",gate:"Your troops walk through; enemies must break it. Drop one into a wall for the difference.",stair:"Build against a wall, tower or keep so swordsmen can climb up.",swordsman:"Guards a spot. Tap a wall or the keep to post one up top.",hoard:"Wooden shields on a stone wall, gate or tower. Archers behind it are much safer.",orders:"Tell swordsmen which area to cover.",upgrade:"Palisade to stone, stone to thick; repairs damage.",settle:"Build the houses and farms the village asks for.",moat:"Enemies wade through slowly.",pikes:"Hurts anyone who attacks it.",trap:"Hurts anyone who walks over it."},Xa=[{id:"look",tools:["look"]},{id:"walls",tools:["palisade","wall","thick","gate","stair","hoard"]},{id:"defend",tools:["tower","archer","swordsman","orders"]},{id:"obstacles",tools:["moat","pikes","trap"]},{id:"improve",tools:["settle","upgrade"]},{id:"demolish",tools:["demolish"]}],Jg=["look","palisade","wall","thick","gate","tower","archer","swordsman","orders","settle"],Qg=new Set(["tower","archer","swordsman","gate"]),vs=s=>{var t;return s==="archer"?tn.cost:s==="swordsman"?$e.cost:s==="hoard"?en.cost:(t=wt[s])==null?void 0:t.cost},zt=s=>document.getElementById(s),qa=()=>Math.floor(Math.random()*1e9);let at=new vr(qa());const fn=new Zg,_e=new $h(at.world.w,at.world.h),si=zt("game"),va=new Zh(si,_e),Ma=zt("game3d");let En=null,Ve="classic";try{localStorage.getItem("htk-gfx")==="3d"&&(Ve="3d")}catch{}function $a(s){if(s==="3d"&&!En)try{En=new Xg(Ma),En.resize(window.innerWidth,window.innerHeight,window.devicePixelRatio||1)}catch{We("3D isn't available on this device<small>Staying with the classic look</small>"),s="classic"}Ve=s,Ma.classList.toggle("hidden",Ve!=="3d");try{localStorage.setItem("htk-gfx",Ve)}catch{}}const Xt=new Kg;"serviceWorker"in navigator&&location.protocol==="https:"&&window.top===window&&navigator.serviceWorker.register("./sw.js").catch(()=>{});window.htk={game:at,audio:Xt,camera:_e,setGfx:s=>$a(s)};for(const s of["pointerdown","pointerup","touchend","click","keydown"])window.addEventListener(s,()=>Xt.unlock(),{capture:!0,passive:!0});const Et={tool:"wall",buildTool:"wall",groupChoice:{walls:"wall",defend:"tower",obstacles:"moat",improve:"settle"},orders:{selected:new Set,box:null,start:null,active:!1},preview:null,showGrid:!0,speed:1,paused:!1};function xc(s,t){return s<0||t<0||s>=at.world.w||t>=at.world.h?-1:at.world.idx(Math.floor(s),Math.floor(t))}function tx(s,t){const e=at.world.w;let n=s%e,i=s/e|0;const r=Math.abs(t%e-n),o=Math.abs((t/e|0)-i),a=t%e>n?1:-1,l=(t/e|0)>i?1:-1,c=[s];for(let h=0,u=0;h<r||u<o;)(.5+h)/r<(.5+u)/o?(n+=a,h++):(i+=l,u++),c.push(i*e+n);return c}function Mo(s,t){const e=i=>Math.max(0,Math.min(at.world.w-1,Math.floor(i))),n=i=>Math.max(0,Math.min(at.world.h-1,Math.floor(i)));return{x0:e(Math.min(s.x,t.x)),x1:e(Math.max(s.x,t.x)),y0:n(Math.min(s.y,t.y)),y1:n(Math.max(s.y,t.y))}}function _c(s,t){const e=[...Et.orders.selected];at.orderSwordsmen(e,s,t)&&(Xt.play("recruit"),We(s?`${e.length} ${e.length===1?"swordsman":"swordsmen"} covering that area`:"Holding that spot",1400),Et.orders.selected=new Set)}function ya(s){const t=at.world.tiles[s];if(!t||t.type!=="plot"||Et.tool==="demolish")return!1;const e=wt[t.plot];return at.place(s,"settle")?We(`${e.label} built<small>+${e.income} gold after every wave</small>`,1800):at.gold<e.cost&&us(),Ke(),!0}let xr=!1;function ex(s){var e;const t=Et.tool;if(!ya(s)){if(t==="demolish")at.demolish(s);else if(t==="upgrade")!at.place(s,"upgrade")&&at.upgradeInfo(s)&&at.gold<at.upgradeInfo(s).cost&&us();else if(t==="settle"||t==="hoard"){const n=at.world.tiles[s],i=t==="hoard"?en.cost:(e=wt[n.plot])==null?void 0:e.cost;!at.place(s,t)&&i&&at.gold<i&&us()}else if(wt[t]){const i=at.layOverCost(s,t)??(at.world.canBuild(s,t)?at.costAt(s,t):null);!at.place(s,t)&&i!==null&&at.gold<i&&us()}Ke()}}function us(){if(xr)return;xr=!0;const s=document.querySelector(".pill.gold");s.classList.remove("flash"),s.offsetWidth,s.classList.add("flash")}new qg(si,_e,{tool:()=>Et.tool,worldToTile:xc,lineTiles:tx,paint:ex,strokeEnd:()=>{xr=!1},placeOnRelease:s=>Qg.has(s),boxTool:s=>s==="orders",boxStart:s=>{Et.orders.start=s,Et.orders.box=Mo(s,s)},boxMove:s=>{Et.orders.start&&(Et.orders.box=Mo(Et.orders.start,s))},boxCancel:()=>{Et.orders.box=Et.orders.start=null},boxEnd:(s,t)=>{const e=Et.orders,n=e.start?Mo(e.start,s):null;if(e.box=e.start=null,t){const i=at.swordsmen.filter(r=>Math.hypot(r.x-s.x,r.y-s.y)<.8);i.length?e.selected=new Set(i.map(r=>r.id)):e.selected.size&&_c(null,xc(s.x,s.y))}else if(n)if(e.selected.size)_c(n,null);else{const i=at.swordsmen.filter(r=>r.x>=n.x0&&r.x<=n.x1+1&&r.y>=n.y0&&r.y<=n.y1+1);e.selected=new Set(i.map(r=>r.id))}Ke()},tapTile:s=>{s>=0&&ya(s)},placeAt:s=>{ya(s)||(!at.place(s,Et.tool)&&at.gold<vs(Et.tool)&&us(),xr=!1,Ke())},preview:s=>{if(s==null||s<0)Et.preview=null;else{const t=Et.tool,e=t==="demolish"?!!wt[at.world.tiles[s].type]:t!=="look"&&at.canPlace(s,t);Et.preview={i:s,ok:e,type:t}}}});const gh=zt("toolbar"),Nn=zt("flyout"),nx=s=>{const t=vs(s);return`${cn[s]}<span>${t?`<span class="cost">${t}</span>`:_s[s]}</span>`};for(const s of Xa){const t=document.createElement("button");t.className=s.tools.length>1?"tool group":"tool",t.dataset.group=s.id,t.addEventListener("click",()=>{const e=Et.groupChoice[s.id]||s.tools[0];s.tools.length>1&&Et.tool===e&&!Nn.classList.contains("hidden")?Ms():(Ya(e),s.tools.length>1?ix(s,t):Ms())}),gh.appendChild(t)}function ix(s,t){Nn.innerHTML="";for(const i of s.tools){const r=document.createElement("button");r.className="tool wide"+(i===Et.tool?" active":""),vs(i)>at.gold&&r.classList.add("poor"),r.innerHTML=`${cn[i]}<span class="tl"><b>${_s[i]}</b><span class="cost">${vs(i)}</span><small>${jg[i]}</small></span>`,r.addEventListener("click",()=>{Et.groupChoice[s.id]=i,Ya(i),Ms()}),Nn.appendChild(r)}const e=t.getBoundingClientRect();Nn.style.left=`${e.right+8}px`,Nn.classList.remove("hidden");const n=Nn.offsetHeight;Nn.style.top=`${Math.max(8,Math.min(window.innerHeight-n-8,e.top+e.height/2-n/2))}px`}function Ms(){Nn.classList.add("hidden")}si.addEventListener("pointerdown",Ms);function Ya(s){s!=="orders"&&(Et.orders.selected=new Set),Et.tool=s,s!=="look"&&s!=="demolish"&&(Et.buildTool=s);for(const t of Xa)t.tools.length>1&&t.tools.includes(s)&&(Et.groupChoice[t.id]=s);Et.preview=null,Ke()}zt("menu-btn").innerHTML=cn.menu;zt("feedback-btn").innerHTML=cn.feedback;zt("feedback-btn").addEventListener("click",()=>Mh(s=>yh(s)));const Sa=zt("sound-btn");function Ka(){const s=Xt.musicOn||Xt.sfxOn;Sa.innerHTML=s?cn.soundOn:cn.soundOff,Sa.setAttribute("aria-label",s?"Mute":"Unmute")}Sa.addEventListener("click",()=>{const s=Xt.musicOn||Xt.sfxOn;s===Xt.musicOn&&Xt.toggleMusic(),s===Xt.sfxOn&&Xt.toggleSfx(),Ka()});Ka();const _r=zt("fs-btn"),sx=document.fullscreenEnabled||document.webkitFullscreenEnabled,ba=()=>document.fullscreenElement||document.webkitFullscreenElement;function yo(){_r.innerHTML=ba()?cn.fsOff:cn.fsOn,_r.setAttribute("aria-label",ba()?"Leave full screen":"Full screen")}sx&&(_r.classList.remove("hidden"),yo(),_r.addEventListener("click",async()=>{var s,t;try{if(ba())await(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const e=document.documentElement;await(e.requestFullscreen||e.webkitRequestFullscreen).call(e,{navigationUI:"hide"}),await((t=(s=screen.orientation)==null?void 0:s.lock)==null?void 0:t.call(s,"landscape").catch(()=>{}))}}catch{We("Full screen isn't available here<small>Open the game in its own browser tab instead</small>")}}),document.addEventListener("fullscreenchange",()=>{yo(),setTimeout(Ss,50)}),document.addEventListener("webkitfullscreenchange",yo));zt("rotate-btn").innerHTML=cn.rotate;zt("wave-total").textContent=ci;zt("view-btn").addEventListener("click",()=>Wi(_e.mode==="top"?"iso":"top"));zt("rotate-btn").addEventListener("click",()=>_e.rotateBy(Math.PI/2));zt("speed-btn").addEventListener("click",()=>{Et.speed=Et.speed===1?2:Et.speed===2?3:1,Ke()});zt("start-btn").addEventListener("click",xh);function xh(){at.phase==="build"&&(_h(),at.startWave())}function _h(){at.phase==="build"&&fn.saveProgress(at.serialize()).catch(()=>{})}zt("menu-btn").addEventListener("click",()=>cx());function Wi(s){_e.setMode(s),Ke()}function Ke(){zt("gold").textContent=Math.floor(at.gold),zt("wave").textContent=Math.min(ci,at.wave+1);const s=at.world.keep.hp/at.world.keep.maxHp,t=zt("keep-fill");t.style.width=`${s*100}%`,t.style.background=s>.5?"linear-gradient(#7fdc63,#4c9c3a)":s>.25?"linear-gradient(#f0d060,#b8922a)":"linear-gradient(#ef6a4c,#a8301c)",zt("archers").textContent=at.archers.length;for(const l of gh.children){const c=Xa.find(d=>d.id===l.dataset.group),h=Et.groupChoice[c.id]||c.tools[0];l.dataset.face!==h&&(l.dataset.face=h,l.innerHTML=nx(h),l.title=_s[h],l.setAttribute("aria-label",_s[h])),l.classList.toggle("active",c.tools.includes(Et.tool));const u=vs(h);l.classList.toggle("poor",!!u&&at.gold<u)}const e=_e.mode==="iso",n=zt("view-btn");n.dataset.mode!==_e.mode&&(n.dataset.mode=_e.mode,n.classList.toggle("iso",e),n.innerHTML=e?`${cn.grid}<span>2D</span>`:`${cn.cube}<span>3D</span>`),zt("rotate-btn").classList.toggle("hidden",!e);const i=at.phase==="build";zt("start-btn").classList.toggle("hidden",!i),zt("speed-btn").classList.toggle("hidden",at.phase!=="attack"),zt("speed-btn").textContent!==`${Et.speed}×`&&(zt("speed-btn").textContent=`${Et.speed}×`);const r=zt("next-info");if(r.classList.toggle("hidden",!i),i){const l=at.wave+1,c=To(l),h=[`${c.raider} raiders`];c.brute&&h.push(`${c.brute} brutes`),c.ram&&h.push(`${c.ram} rams`);const u=at.activeSpawns(l).map(f=>f.name).join(", ");c.bowman&&h.push(`${c.bowman} bowmen`),c.catapult&&h.push(`${c.catapult} catapult${c.catapult>1?"s":""}`);const d=at.income();r.innerHTML=`<b>Wave ${l}</b> from ${u}<br>${h.join(" · ")}${d?`<br>Village: +${d} gold per wave`:""}`}Et.orders.active=Et.tool==="orders";const o=zt("tool-hint"),a=rx();o.classList.toggle("hidden",!a),a&&o.innerHTML!==a&&(o.innerHTML=a),Et.showGrid=i||Et.tool!=="look"}function rx(){const s=(t,e)=>wt[e].cost-wt[t].cost;switch(Et.tool){case"upgrade":return`<b>Upgrade</b>: tap or drag over walls<br>Palisade → stone ${s("palisade","wall")} · Stone → thick ${s("wall","thick")}<br>Damaged thick walls, towers, gates: repair`;case"settle":{const t=at.world.tiles.filter(e=>e.type==="plot").length;return`<b>Village</b>: tap a staked plot to build it<br>Cottage ${wt.cottage.cost} (+${wt.cottage.income}) · Farm ${wt.farm.cost} (+${wt.farm.income}) · Market ${wt.market.cost} (+${wt.market.income})<br>${t?`${t} plot${t>1?"s":""} waiting`:"New plots appear after each wave"}`}case"hoard":return`<b>Hoarding</b> (${en.cost}): tap stone walls, gates, towers<br>Archers behind it take ${Math.round(en.cover*100)}% of arrow damage`;case"orders":{const t=Et.orders.selected.size;return t?`<b>${t} selected</b>: drag over the area to cover,<br>or tap a spot to hold`:"<b>Orders</b>: tap a swordsman, or drag a box around several, to select"}default:if(at.world.isRough(Et.tool)&&at.phase==="build"){const t=Eo,e=Et.tool==="wall"||Et.tool==="thick"?"<br>Paint over a weaker wall to upgrade it for the difference":"";return`<b>${_s[Et.tool]}</b> goes through anything, at a price<br>Marsh ×${t.marsh} · Ford ×${t.shallows} · Water ×${t.water} · Trees ×${t.tree} · Rocks ×${t.rock}${e}`}return""}}let vc=0;function We(s,t=2600){const e=zt("banner");e.innerHTML=s,e.classList.add("show"),clearTimeout(vc),vc=setTimeout(()=>e.classList.remove("show"),t)}function An(s,t,e){zt("modal-title").textContent=s,zt("modal-body").innerHTML=t;const n=zt("modal-actions");n.innerHTML="";for(const i of e){const r=document.createElement("button");r.textContent=i.label,i.primary&&(r.className="go"),r.addEventListener("click",()=>{var o;zt("modal").classList.add("hidden"),Et.paused=!1,(o=i.run)==null||o.call(i)}),n.appendChild(r)}zt("modal").classList.remove("hidden"),Et.paused=!0}const vh=`
  <p>Raiders march on your keep from the red banners to kill your lord. Build a castle that holds.</p>
  <ul>
    <li><b>Walls</b>: drag to paint. Wooden palisades are cheap; stone walls let archers walk along them; thick walls take a beating. Enemies walk around walls if they can. Soldiers on foot can't break stone: they hack through gates and wood, or climb over with ladders.</li>
    <li><b>Towers and archers</b>: drag to aim, release to place. Archers stand on walls, towers and the keep, and walk along connected stone to reach attackers. Height adds range: towers most, then thick walls and hills.</li>
    <li><b>Gates and swordsmen</b>: swordsmen guard the spot you place them and charge enemies that come close. They walk through gates; enemies have to break gates down. Send them out to kill catapults. Drop a gate into an existing wall for the difference in price.</li>
    <li><b>Stairs</b>: build them against a wall, tower or the keep and swordsmen can climb up to fight raiders coming over on ladders. Post swordsmen on the keep (it has its own stairs inside the door) to guard your lord.</li>
    <li><b>Upgrade</b>: tap a palisade to make it stone, or stone to make it thick. Tap damaged thick walls, towers and gates to repair them.</li>
    <li><b>Moats, pikes and spikes</b>: moats slow anyone wading through, pikes hurt anyone attacking them, and spikes hurt anyone walking over them.</li>
    <li><b>Enemies</b>: raiders and brutes hack at gates, palisades and pikes. Pairs of raiders carry <b>ladders</b> to stone walls and climb over; archers on or next to that wall push the ladder off. Rams smash gates and stone, bowmen shoot your troops, and catapults throw boulders from beyond archer range.</li>
    <li><b>The keep and your lord</b>: attackers who reach the keep batter its door, then fight their way up to your lord. His guard fights back, but a crowd will kill him. Masons mend the door after every wave.</li>
    <li><b>Terrain</b>: rivers and lakes block the way except at fords; marsh and fords slow enemies down. Walls, gates, towers and pikes can be built across marsh, water, trees and rocks, but cost more there.</li>
    <li><b>Village</b>: after each wave the village stakes out plots where it feels safe. Tap a plot to build it; it pays gold after every wave.</li>
    <li><b>Remove</b>: full refund between waves, half during an attack.</li>
  </ul>
  <p><b>Two fingers</b> pinch to zoom and drag to pan. In <b>3D</b>, twist two fingers to orbit around your castle.
  The camera tilts to 3D when a wave starts so you can watch it play out, and returns to 2D for building.</p>`,ox='<p class="credits">Music: “Castle Chamber” by brigham773. “Minstrel Guild” and “Heroic Age” by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.</p>';let cr=null;function Mh(s){cr=s}const ax="https://github.com/brigham-netizen/training/issues/new";let Se={kind:"bug",text:"",name:""};try{Se.name=localStorage.getItem("htk-name")||""}catch{}function lx(s,t,e){const n=at.phase==="won"?at.wave:at.nextWave;return[`Hold the Keep: ${s==="bug"?"bug report":"idea"}`,"",t.trim()||"(no description)","",e.trim()?`From: ${e.trim()}`:null,`Build 2026-10-07 8ef7b7b · map ${at.seed} · wave ${n}/${ci} (${at.phase}) · ${at.gold} gold`,`${Ve==="3d"?"3D":"Classic"} graphics · ${window.innerWidth}×${window.innerHeight} · ${navigator.userAgent}`].filter(r=>r!==null).join(`
`)}function yh(s){const t=Se.kind;An("Send feedback",`
    <div class="toggles fb-kind">
      <button data-kind="bug" class="${t==="bug"?"on":""}">Something's wrong</button>
      <button data-kind="idea" class="${t==="idea"?"on":""}">I have an idea</button>
    </div>
    <textarea id="fb-text" class="fb-text" rows="3" maxlength="2000" placeholder="What happened, or what would make it better?">${ys(Se.text)}</textarea>
    <div class="fb-row">
      <input id="fb-name" maxlength="40" placeholder="Your name (optional)" value="${ys(Se.name)}" />
      ${s?'<label class="fb-check"><input type="checkbox" id="fb-shot" checked /> Screenshot</label>':""}
    </div>
    <p class="save-note fb-note">Includes the map number, wave and device so it can be replayed.</p>`,[{label:"Cancel",run:Sh},{label:"Post on GitHub",run:()=>Mc(s,"github")},{label:"Send",primary:!0,run:()=>Mc(s,"share")}]);for(const e of document.querySelectorAll(".fb-kind button"))e.addEventListener("click",()=>{Se.kind=e.dataset.kind;for(const n of document.querySelectorAll(".fb-kind button"))n.classList.toggle("on",n===e)});zt("fb-text").focus()}function Sh(){var s,t;Se.text=((s=zt("fb-text"))==null?void 0:s.value)??Se.text,Se.name=((t=zt("fb-name"))==null?void 0:t.value)??Se.name;try{localStorage.setItem("htk-name",Se.name)}catch{}}async function Mc(s,t){var o,a;Sh();const e=s&&((o=zt("fb-shot"))==null?void 0:o.checked)!==!1,n=lx(Se.kind,Se.text,Se.name),i=`${Se.kind==="bug"?"Bug":"Idea"}: ${Se.text.trim().split(`
`)[0].slice(0,60)||"feedback"}`;if(t==="github"){window.open(`${ax}?title=${encodeURIComponent(i)}&body=${encodeURIComponent(n)}`,"_blank"),Se.text="";return}const r={title:"Hold the Keep feedback",text:n};if(e){const l=new File([s],"hold-the-keep.jpg",{type:"image/jpeg"});(a=navigator.canShare)!=null&&a.call(navigator,{files:[l]})&&(r.files=[l])}try{if(!navigator.share)throw new Error("no share");await navigator.share(r),Se.text="",We("Thanks!<small>Your feedback is on its way.</small>",2e3)}catch(l){if((l==null?void 0:l.name)==="AbortError")return;try{await navigator.clipboard.writeText(n),Se.text="",We("Copied to your clipboard<small>Paste it in a message to whoever sent you the game.</small>",4200)}catch{An("Send feedback",`<p>Copy this and send it to whoever sent you the game:</p><textarea class="fb-copy" rows="8" readonly>${ys(n)}</textarea>`,[{label:"Done",primary:!0}])}}}function cx(){const s=`<div class="toggles">
    <button id="music-toggle" class="${Xt.musicOn?"on":""}">Music: ${Xt.musicOn?"on":"off"}</button>
    <button id="sfx-toggle" class="${Xt.sfxOn?"on":""}">Sound effects: ${Xt.sfxOn?"on":"off"}</button>
    <button id="build-track">Build music: ${Di[Xt.buildTrack].label}</button>
    <button id="test-sound">Test sound</button>
    <button id="gfx-toggle" class="${Ve==="3d"?"on":""}">Graphics: ${Ve==="3d"?"3D (preview)":"Classic"}</button>
    <button id="menu-feedback">Report a bug / suggest an idea</button>
  </div><p class="save-note" id="sound-note"></p>`,t=`<div class="toggles">
    <button id="save-game">Save game</button>
    <button id="load-game">Load save</button>
    <button id="save-map">Save this map</button>
    <button id="my-maps">My maps</button>
  </div><p class="save-note" id="save-note">Saves are kept in ${fn.where}. The game also saves before every wave.</p>`;An("Hold the Keep",s+t+vh+ox,[{label:"New map",run:()=>Fi(qa())},{label:"Restart",run:()=>Fi()},{label:"Resume",primary:!0}])}const er=s=>{const t=zt("save-note");t&&(t.textContent=s)};document.addEventListener("click",async s=>{const t=s.target.id;if(t==="save-game"){if(at.phase!=="build")return er("You can save between waves.");er("Saving…");const e=await fn.saveProgress(at.serialize()).catch(()=>!1);return er(e?`Saved wave ${at.wave+1} to ${fn.where}.`:"Could not save. Try again in a moment.")}if(t==="load-game"){const e=await fn.loadProgress();if(!e)return er("No saved game yet.");wa(),Za(e);return}if(t==="menu-feedback"){wa(),Mh(e=>yh(e));return}if(t==="gfx-toggle"){$a(Ve==="3d"?"classic":"3d"),s.target.classList.toggle("on",Ve==="3d"),s.target.textContent=`Graphics: ${Ve==="3d"?"3D (preview)":"Classic"}`;return}if(t==="build-track"){Xt.unlock(),Xt.nextBuildTrack(),s.target.textContent=`Build music: ${Di[Xt.buildTrack].label}`;return}if(t==="test-sound"){Xt.unlock(),Xt.play("horn"),setTimeout(()=>{const e=zt("sound-note");if(!e)return;const n=Xt.tracks.build,i=[];i.push(Xt.running?"Sound engine is running: you should hear a horn.":"This browser is blocking sound so far. Tap again; if it stays silent, check the volume and the silent switch."),Xt.musicOn?n!=null&&n.error?i.push("The music files could not be loaded here."):n&&!n.paused?i.push("Music is playing."):i.push("Music is still loading."):i.push("Music is turned off."),e.textContent=i.join(" ")},600);return}if(t==="save-map")return hx();if(t==="my-maps")return bh();if(t.startsWith("play-map-")||t.startsWith("del-map-"))return ux(s.target);if(s.target.id==="music-toggle")Xt.toggleMusic();else if(s.target.id==="sfx-toggle")Xt.toggleSfx();else return;s.target.classList.toggle("on"),s.target.textContent=s.target.id==="music-toggle"?`Music: ${Xt.musicOn?"on":"off"}`:`Sound effects: ${Xt.sfxOn?"on":"off"}`,Ka()});function wa(){zt("modal").classList.add("hidden"),Et.paused=!1}function Za(s){try{at=vr.restore(s)}catch{We("That save is from an older version and can't be loaded.");return}window.htk.game=at,Et.orders.selected=new Set,Et.tool=Et.buildTool="wall",Et.speed=1,Wi("top"),Xt.setMusic("build"),We(`Welcome back<small>Wave ${at.wave+1} of ${ci}</small>`),Ke()}let ds=[];function hx(){const s=ds.length;An("Save this map",`<p>Keep this landscape to play again later. Only the land is saved, not your castle.</p>
    <label class="field">Name<input id="map-name" maxlength="32" value="Map ${s+1}" /></label>`,[{label:"Cancel"},{label:"Save map",primary:!0,run:async()=>{var i;const e=(((i=zt("map-name"))==null?void 0:i.value)||"").trim()||`Map ${s+1}`,n=await fn.saveMap(e,at.world.snapshotMap()).catch(()=>!1);We(n?`Saved “${e}”<small>Find it under My maps</small>`:"Could not save the map. Try again in a moment.")}}]);const t=zt("map-name");t==null||t.addEventListener("keydown",e=>e.key==="Enter"&&zt("modal-actions").lastChild.click())}async function bh(){ds=await fn.listMaps();const s=ds.length?ds.map(t=>`<div class="map-row"><span><b>${ys(t.name)}</b><small>${new Date(t.savedAt).toLocaleDateString()}</small></span>
        <button id="play-map-${t.id}" class="go">Play</button><button id="del-map-${t.id}">Delete</button></div>`).join(""):"<p>No saved maps yet. When you find a landscape you like, open the menu and tap <b>Save this map</b>.</p>";An("My maps",`<div class="map-list">${s}</div>`,[{label:"Close",primary:!0}])}async function ux(s){const t=s.id.startsWith("play-map-"),e=s.id.replace(/^(play|del)-map-/,""),n=ds.find(i=>i.id===e);if(n){if(t){wa(),Fi(Math.floor(Math.random()*1e9),n.map),We(`Playing “${ys(n.name)}”`);return}if(s.dataset.confirm!=="1"){s.dataset.confirm="1",s.textContent="Tap again";return}await fn.deleteMap(e).catch(()=>{}),bh()}}function dx(s){const t=s.map(e=>`a ${wt[e].label.toLowerCase()}`);return t.length>1?`${t.slice(0,-1).join(", ")} and ${t.at(-1)}`:t[0]}function ys(s){return String(s).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Fi(s,t){s===void 0?at.reset():at.reset(s,t||null),Xt.setMusic("build"),Et.tool=Et.buildTool="wall",Et.speed=1,Wi("top"),Ke()}function fx(){var s;for(const t of at.events){if(t.type==="waveStart")We(`Wave ${t.wave} incoming!<small>from the ${t.spawns.join(" & ")}</small>`),Wi("iso"),Xt.play("horn"),Xt.setMusic("battle"),Et.tool="look",Ms();else if(t.type==="waveEnd"){const e=t.village?` and +${t.village} from the village`:"",n=(s=t.plots)!=null&&s.length?`<br>The village staked out ${dx(t.plots)}. Tap a plot to build it.`:"";We(`Wave ${t.wave} repelled!<small>+${t.bonus} gold${e}.${n}</small>`,n?5e3:3400),_h(),Wi("top"),Xt.play("waveEnd"),Xt.setMusic("build"),Et.tool=Et.buildTool,Et.speed=1}else t.type==="doorBroken"?We("The keep door is down!<small>Attackers are climbing to your lord.</small>",2600):t.type==="won"?(Xt.play("victory"),Xt.setMusic("build"),An("Victory!",`<p>Your keep stood against all <b>${ci}</b> waves.</p>`,[{label:"Keep looking"},{label:"New map",primary:!0,run:()=>Fi(qa())}])):t.type==="lost"&&(Xt.play("defeat"),Xt.setMusic("build"),An("Your lord has fallen",`<p>You held out until wave <b>${t.wave}</b>.</p>`,[{label:"Look around"},{label:"Start over",run:()=>Fi()},{label:"Retry this wave",primary:!0,run:async()=>{const e=await fn.loadProgress();e?Za(e):Fi()}}]));Ke()}at.events.length=0}window.addEventListener("keydown",s=>{if(s.target.tagName==="INPUT"||s.target.tagName==="TEXTAREA")return;const t="1234567890".indexOf(s.key);t>=0?Ya(Jg[t]):s.key==="v"?Wi(_e.mode==="top"?"iso":"top"):s.key==="r"?_e.rotateBy(Math.PI/2):s.key===" "&&at.phase==="build"&&(s.preventDefault(),xh())});function Ss(){va.resize(),En==null||En.resize(window.innerWidth,window.innerHeight,window.devicePixelRatio||1);const s=_e.fit();Ss.done||(_e.zoom=Math.max(s,Math.min(1.25,_e.vh/(12*32))),_e.updateTrig(),Ss.done=!0)}window.addEventListener("resize",Ss);Ss();Ve==="3d"&&$a("3d");Ke();const So=1/60;let bo=0,yc=performance.now(),wo=0;function wh(s){const t=Math.min(.1,(s-yc)/1e3);if(yc=s,!Et.paused)for(bo+=t*(at.phase==="attack"?Et.speed:1);bo>=So;)at.update(So),bo-=So;_e.update(t),fx();for(const e of at.sounds){const n=Math.hypot(e.x-_e.fx,e.y-_e.fy);Xt.play(e.name,Math.max(.25,1-n/22))}if(at.sounds.length=0,Xt.update(t),wo+=t,wo>.1&&(wo=0,Ke()),Ve==="3d"&&En?(En.render(at,_e),va.renderOverlay(at,Et)):va.render(at,Et),cr){const e=cr;cr=null;try{const n=Math.min(1,1280/si.width),i=document.createElement("canvas");i.width=Math.round(si.width*n),i.height=Math.round(si.height*n);const r=i.getContext("2d");Ve==="3d"&&En&&r.drawImage(Ma,0,0,i.width,i.height),r.drawImage(si,0,0,i.width,i.height),i.toBlob(o=>e(o),"image/jpeg",.82)}catch{e(null)}}requestAnimationFrame(wh)}requestAnimationFrame(wh);try{localStorage.getItem("htk-seen-help")||(localStorage.setItem("htk-seen-help","1"),An("Hold the Keep",vh,[{label:"Start building",primary:!0}]))}catch{}fn.loadProgress().then(s=>{!s||s.wave===0&&!s.types.some(t=>t&&t!=="keep")||zt("modal").classList.contains("hidden")&&An("Welcome back",`<p>You have a castle in progress at <b>wave ${s.wave+1}</b> of ${ci}.</p>`,[{label:"New game"},{label:"Continue",primary:!0,run:()=>Za(s)}])});
