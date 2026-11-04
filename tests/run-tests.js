// Logic tests with a mocked canvas/DOM (no browser). Run: python3 tools/build.py && node tests/run-tests.js
// They cover rules (evolution, hits, modes, bosses, auto-fire weapons, sky, joystick, missions, achievements, save migration).
// They do NOT cover real rendering, touch feel, performance or audio: see TESTING.md.
const fs=require('fs');
let seed=408;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','dodgewing.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0];
let errs=[],calls={drawImage:0};
const store={};
const ctx=new Proxy({},{get:(t,k)=>{if(k==='measureText')return()=>({width:200});if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});if(k==='drawImage')return(...a)=>{calls.drawImage++;calls.last=a};return typeof t[k]==='undefined'?()=>{}:t[k]},set:(t,k,v)=>{t[k]=v;return true}});
const els={};
const el=id=>els[id]||(els[id]={id,textContent:'',innerHTML:'',classList:{toggle(){},add(){},remove(){}},getContext:()=>ctx,addEventListener(){},width:0,height:0});
let _vis=[];global.document={getElementById:el,hidden:false,addEventListener:(t,f)=>{if(t==='visibilitychange')_vis.push(f)}};
global.window=global;global.innerWidth=+process.env.W||390;global.innerHeight=+process.env.H||800;global.devicePixelRatio=2;
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global._ev={};global.addEventListener=(t,f)=>{(_ev[t]=_ev[t]||[]).push(f)};global.setTimeout=()=>{};
global.Image=class{set src(v){this._s=v;this.complete=true;this.naturalWidth=100;this.naturalHeight=120}};
const run0=new Function(js+`
;return {get S(){return S},set S(v){S=v},get lv(){return lv},get stars(){return stars},start,upd,draw,evo,sz,get pl(){return pl},set pl(v){pl=v},get ms(){return ms},set ms(v){ms=v},get st(){return st},set st(v){st=v},get pu(){return pu},set pu(v){pu=v},get save(){return save},set shield(v){shield=v},hangar,pick,buy,get upT(){return upT},get banT(){return banT},get fadeT(){return fadeT},get prevLv(){return prevLv},LV,SPR,lvOf,die,get hint(){return hint},get evoStars(){return evoStars},get B(){return B},rewards,setTrail,dayMis,mEvent,chkAch,MIS,ACH,COS,curTrail,rb,get mag(){return mag},set mag(v){mag=v},get slow(){return slow},set slow(v){slow=v},get trailC(){return trailC},set peak(v){peakLv=v},get PUT(){return PUT},set B(v){B=v},get bonus(){return bonus},set bonus(v){bonus=v},get shield(){return shield},get bossSeen(){return bossSeen},get fx(){return fx},startBoss,endBoss,bossTick,get nmT(){return nmT},set ms3(v){ms=v},set evoStars(v){evoStars=v},get lvStars(){return evoStars%5},cap,M,planeSpeed,get SPRD(){return SPRD},missileKind,normalMissileSkin,RULES,STAGES,LEVEL_COUNT,levelForTier,tierOf,loop,setWH(w,h){W=w;H=h},pauseG,resume,get ms2(){return ms},addStar,get msT(){return msT},get sp(){return sp},get inv(){return inv},get peakLv(){return peakLv},get banTx(){return banTx},set lv(v){lv=v},set inv(v){inv=v},hurt,set msT(v){msT=v},get bl(){return bl},set bl(v){bl=v},WPN,skyAt,nightAmt,get skyL(){return skyL},set skyL(v){skyL=v},set autoFire(v){autoFire=v},setJoy(a){jAng=a},get H(){return H},rs,SKY,STARS}`);
const run=()=>{const r=run0();r.autoFire=false;return r};

const g=run();
const ok=(c,m)=>{console.log((c?'PASS':'FAIL')+'  '+m);if(!c)process.exitCode=1};
const star=()=>{g.ms=[];g.pu=[];g.st=[{x:g.pl.x,y:g.pl.y,r:0}];g.upd(0.001)};
const hit=()=>{g.ms=[{x:g.pl.x+1,y:g.pl.y,a:0,life:8,v:0}];g.upd(0.001)};
const toLevel=L=>{g.start();for(let i=0;i<(L-1)*5;i++)star()};
// Current campaign rules replace the retired spreadsheet mode expectations.
for(const mode of ['e','n','f']){g.save.mode=mode;g.start();ok(g.sp===150&&g.M().drop===2&&g.M().mult===2,'legacy mode '+mode+' cannot change campaign rules')}
ok(g.planeSpeed(1)===150&&g.planeSpeed(2)===160&&g.planeSpeed(30)===300,'plane speed scales from 150 at Level 1 to 300 at Level 30')
for(const [w,h] of [[1200,800],[390,800]]){g.setWH(w,h);let previous={cap:0,speed:0};
 for(let L=1;L<=30;L++){g.start();g.lv=L;g.ms=[];g.msT=0;g.inv=99;g.pl.x=1;g.pl.y=1;g.upd(.001);const missile=g.ms[0],factor={standard:1,interceptor:1.3,weaver:1.05,armored:.72}[missile.kind],speed=missile.v/factor;
 ok(g.cap(L)>=previous.cap&&speed>previous.speed,'difficulty curve rises at Level '+L+' ('+w+'px)');previous={cap:g.cap(L),speed};}}
g.setWH(1200,800);
ok(g.LV.length===30&&g.SPR.length===30&&new Set(g.LV).size===30,'30 named stages and sprite mappings');
ok(new Set(g.STAGES.map(s=>s.tier)).size===30&&new Set(g.SPRD).size===30,'all 30 uploaded aircraft sprites are mapped once');
ok(g.STAGES.every((s,i)=>s.n&&s.zone===g.STAGES[Math.floor(i/5)*5].zone),'30 named aircraft span six five-level zones');
for(const [L,r,k] of [[1,.99,'standard'],[8,.9,'interceptor'],[12,.7,'weaver'],[17,.9,'armored'],[30,.99,'armored']])ok(g.missileKind(L,r)===k,'stage '+L+' selects '+k+' missile variant');
ok(g.normalMissileSkin(1)===0&&g.normalMissileSkin(3)===0&&g.normalMissileSkin(4)===1&&g.normalMissileSkin(29)===26&&g.normalMissileSkin(30)===26,'missile skins hold the first design through Level 3, then evolve through Level 29');
g.start();ok(g.st.length===1,'new run has exactly one star');g.addStar();ok(g.st.length===1,'duplicate star spawn is prevented');
for(let L=2;L<=30;L++){for(let n=0;n<5;n++){g.B=null;star();ok(g.st.length<=1,'only one collectible star during progression '+L+'/'+n)}ok(g.lv===L&&g.evoStars===(L-1)*5,'five stars unlock Level '+L);if(g.B){const final=g.B.k==='final';g.endBoss();if(final){ok(g.S==='victory'&&g.st.length===0,'final boss opens the victory screen');g.S='play';g.st=[]}else ok(g.st.length===1,'boss completion restores exactly one star')}}
for(let n=0;n<10;n++){g.B=null;star()}ok(g.lv===30&&g.evoStars===145,'evolution caps at Level 30 / 145 stars');
g.hangar();ok((els.hev.innerHTML.match(/title=/g)||[]).length===30,'Hangar shows 30 evolution entries');
g.S='play';g.inv=0;g.hurt();ok(g.lv===28&&g.evoStars===135,'hit regresses two stages without losing run stars');
for(let n=0;n<10;n++)star();ok(g.lv===30,'ten new stars recover two lost levels');
g.start();g.save.pts=0;for(let n=0;n<4;n++)star();g.die();ok(g.save.pts===40&&g.save.best.play>=40,'campaign scoring retains x2 and has a separate best score');
g.start();g.loop(undefined);ok(Number.isFinite(g.skyL),'missing frame timestamp does not poison sky state');

// ======== Phase 3 ========
{const g=run();g.save.mode='n';
 const S1=()=>{g.ms=[];g.pu=[];g.st=[{x:g.pl.x,y:g.pl.y,r:0}];g.upd(0.001)};
 const to=n=>{g.start();for(let i=0;i<n;i++){g.B=null;S1()}};
 const clean=()=>{g.ms=[];g.pu=[];g.st=[]};
 // near miss
 g.start();g.pl.x=600;g.pl.y=400;g.setWH(1200,800);const nb=g.bonus;
 g.ms=[{x:600+g.sz()*.5,y:400,a:0,life:8,v:0,r:1,h:0}];g.upd(.01);g.ms[0].x=600+g.sz()*2;g.upd(.01);
 ok(g.bonus===nb+2,'near miss: +2 bonus after a close pass ('+(g.bonus-nb)+')');
 g.ms=[{x:600+g.sz()*.5,y:430,a:0,life:8,v:0,r:1,h:0}];g.upd(.01);g.ms[0].x=600+g.sz()*2;g.upd(.01);
 ok(g.bonus===nb+6,'second near miss within 4 s combos to +4 (total '+(g.bonus-nb)+')');
 g.ms=[{x:600+g.sz()*.1,y:400,a:0,life:8,v:0,r:1,h:0}];g.inv=0;g.upd(.01);ok(g.bonus===nb+6,'a hit is not a near miss');
 // boss triggers
 for(const [n,L,k] of [[40,9,'heavy'],[80,17,'cmdr'],[120,25,'adv'],[145,30,'final']]){to(n);ok(g.B&&g.B.k===k&&g.lv===L,'Level '+L+' starts boss "'+k+'"')}
 
 // boss only once per run; no retrigger after drop and re-evolve
 to(40);const f1=g.B&&g.B.k;g.endBoss();ok(g.B===null&&g.bonus>=50,'boss ends: reward +50 bonus (bonus '+g.bonus+')');
 g.save.mode='e';g.inv=0;clean();g.ms=[{x:g.pl.x+1,y:g.pl.y,a:0,life:8,v:0,r:1}];g.upd(.001);ok(g.lv===7,'hit after boss -> Lv7');
 for(let i=0;i<10;i++)S1();ok(g.lv===9&&g.B===null,'re-evolving to Lv9 does not repeat the boss');g.save.mode='n';
 // Heavy missile state machine
 to(40);const hm=g.ms.find(m=>m.big);ok(!!hm&&hm.st==='chase','heavy: big missile spawned in chase state');
 g.pl.x=900;g.pl.y=700;hm.x=100;hm.y=100;const seen=new Set();for(let i=0;i<700;i++){clean2();g.upd(.016);seen.add(hm.st);if(g.S!=='play')break;g.inv=5}
 function clean2(){g.pu=[];g.st=[]}
 ok(seen.has('warn')&&seen.has('dash')&&seen.has('chase'),'heavy cycles chase -> warn -> dash -> chase ('+[...seen]+')');
 // heavy not destroyed while invulnerable; shield absorbs without destroying it
 to(40);const hm2=g.ms.find(m=>m.big);hm2.x=g.pl.x;hm2.y=g.pl.y;g.inv=1;g.upd(.001);ok(g.ms.includes(hm2),'heavy missile survives contact during protection');
 g.inv=0;g.shield=5;hm2.x=g.pl.x;hm2.y=g.pl.y;g.upd(.001);ok(g.ms.includes(hm2)&&g.shield===0&&g.inv>0,'shield absorbs heavy hit, boss missile stays, brief protection');
 g.inv=0;g.shield=0;hm2.x=g.pl.x;hm2.y=g.pl.y;const l0=g.lv;g.upd(.001);ok(g.lv<l0&&g.ms.includes(hm2),'heavy hit drops level ('+l0+' -> '+g.lv+') and boss missile stays');
 // normal missiles reduced during heavy/adv, none during cmdr/final
 to(40);g.ms=g.ms.filter(m=>m.bm);g.pl.x=10;g.pl.y=10;let nn=0;for(let i=0;i<900;i++){g.pu=[];g.st=[];g.ms.forEach(m=>{if(!m.bm){m.v=0;m.x=Math.max(m.x,600);m.y=Math.max(m.y,600)}else{m.x=1000;m.y=700;m.st&&(m.stT=9)}});g.upd(.02);g.B.t=0;nn=Math.max(nn,g.ms.filter(m=>!m.bm).length);if(g.S!=='play')break}
 ok(nn<=Math.floor(g.cap(9)*.4),'heavy boss: regular missiles limited to 40% of cap ('+nn+' <= '+Math.floor(g.cap(9)*.4)+')');
 // Commander patterns
 to(80);ok(g.B.k==='cmdr','commander active');const c0=g.ms.length;g.B.cd=0;g.upd(.016);ok(g.B.wn>0,'commander telegraphs (warning '+g.B.wn.toFixed(2)+' s) before firing');
 g.pl.x=1100;g.pl.y=700;for(let i=0;i<60;i++){g.inv=9;g.upd(.016);g.pu=[];g.st=[]}
 ok(g.ms.filter(m=>m.bm).length>=2,'commander fired a pattern ('+g.ms.filter(m=>m.bm).length+' boss missiles)');
 const kinds=new Set();for(let r=0;r<3;r++){to(80);g.B.ph=r;g.B.aim=1;g.ms=[];g.B.cfire?0:0;}
 // Advanced missile: fast, re-launches, shooting it down gives progress
 to(120);g.B.cd=0;g.upd(.016);const am=g.ms.find(m=>m.adv);ok(!!am&&am.v>g.sp*.85,'advanced missile launched (speed '+(am&&Math.round(am.v))+' vs plane '+Math.round(g.sp)+')');
 const t0=g.B.t;am.hp=1;g.pl.x=1100;g.pl.y=700;g.inv=9;g.bl=[{x:am.x,y:am.y,a:0,v:0,d:3,life:1,w:4,c:'#fff'}];g.upd(.016);ok(g.B.t>t0+5&&!g.ms.includes(am),'shooting the advanced missile destroys it and speeds boss defeat');
 // Final challenge
 to(145);ok(g.B.k==='final','final challenge starts at Level 30');const finalSkins=new Set();for(let i=0;i<3;i++){g.ms=[];g.B.cd=0;g.bossTick(.001);g.ms.forEach(m=>finalSkins.add(m.skin))}ok([27,28,29].every(s=>finalSkins.has(s)),'final enemy waves use the three reserved late-game missile designs ('+[...finalSkins].sort().join(',')+')');g.ms=[];g.pl.x=1100;g.pl.y=700;const bb=g.bonus;let waves=0,mx=0;for(let i=0;i<4400&&g.B;i++){g.pu=[];g.st=[];g.inv=9;g.upd(.016);mx=Math.max(mx,g.ms.length)}
 ok(g.B===null&&g.bonus>=bb+200,'survive 60 s -> VICTORY bonus +200 (bonus '+(g.bonus-bb)+')');
 ok(mx>=8,'final waves spawn many missiles (peak '+mx+')');
 // score includes bonus
 g.save.mode='n';g.start();g.bonus=40;g.save.pts=0;g.die();ok(g.save.pts===(0+40)*2,'bonus counts in points with multiplier ('+g.save.pts+')');
 // render everything
 let de=0;for(const [n] of [[40],[80],[120],[145]]){to(n);for(let i=0;i<30;i++){g.pu=[];g.st=[];g.inv=9;g.upd(.03)}try{g.draw()}catch(e){de++;console.log(e.message)}}ok(de===0,'bosses, telegraphs and floating text render without errors');
}

// ======== Phase 4 ========
{const g=run();g.setWH(1200,800);g.save.mode='n';
 const S1=()=>{g.ms=[];g.pu=[];g.st=[{x:g.pl.x,y:g.pl.y,r:0}];g.upd(0.001)};
 const setM=l=>{g.save.m={day:new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate(),list:l,prog:{},done:{}}};
 // missions: deterministic, 3 distinct, rollover
 g.save.m.day='';const l1=g.dayMis().list.slice(),d1=g.save.m.day;g.save.m.day='';const l2=g.dayMis().list;
 ok(l1.length===3&&new Set(l1).size===3&&JSON.stringify(l1)===JSON.stringify(l2),'daily missions: 3 distinct, same set for the same day ('+l1+')');
 g.save.m.done[l1[0]]=1;g.save.m.day='1999-1-1';const l3=g.dayMis();ok(l3.day!=='1999-1-1'&&Object.keys(l3.done).length===0,'new day: missions regenerate and progress resets');
 // progress + reward
 setM(['stars','nm','lvl']);g.save.pts=0;g.start();for(let i=0;i<14;i++)S1();ok(!g.save.m.done.stars&&g.save.m.prog.stars===14,'mission progress counts stars (14/15)');
 g.B=null;S1();ok(g.save.m.done.stars===1&&g.save.pts>=60,'mission completes at 15 stars, +60 pts ('+g.save.pts+')');
 const p0=g.save.pts;for(let i=0;i<3;i++){g.B=null;S1()}ok(g.save.pts===p0,'completed mission does not pay twice');
 // near-miss mission
 setM(['nm','stars','pu']);g.start();g.pl.x=600;g.pl.y=400;for(let i=0;i<8;i++){g.inv=0;g.ms=[{x:600+g.sz()*.5,y:400,a:0,life:8,v:0,r:1,h:0}];g.upd(.01);g.ms[0].x=600+g.sz()*2;g.upd(.01);g.nmT=0}
 ok(g.save.m.done.nm===1,'near-miss mission completes after 8 near-misses');
 // 'max' type mission (reach level) tracks best in run
 setM(['lvl','stars','nm']);g.start();for(let i=0;i<25;i++){g.B=null;S1()}ok(g.save.m.prog.lvl>=6&&g.save.m.done.lvl===1,'level mission completes at Level 6 (prog '+g.save.m.prog.lvl+')');
 // survival mission on death
 setM(['surv','stars','nm']);g.start();for(let i=0;i<100;i++){g.ms=[];g.inv=999;g.pl.x=10;g.pl.y=10;g.upd(1)}g.inv=0;g.die();ok(g.save.m.done.surv===1,'survive mission completes on game over (>=90 s)');
 // achievements + cosmetics
 g.save.ach={};g.save.cu=[];g.save.stat={runs:0,stars:99,nm:0,shot:0,boss:0,bossK:{},wins:0,mis:0,bestLv:1,bestT:0,pu:0};setM(['pu','nm','shot']);g.start();S1();
 ok(g.save.ach.stars100===1&&g.save.cu.includes('gold'),'achievement: 100 stars unlocks "Star Collector" + Gold trail');
 g.inv=0;g.die();ok(g.save.ach.first===1&&g.save.cu.includes('ice'),'achievement: first run unlocks "First Flight" + Ice trail');
 const n1=g.save.cu.length;g.start();g.save.stat.stars=500;S1();ok(g.save.cu.length===n1,'achievements unlock only once');
 g.save.stat.wins=1;g.chkAch();ok(g.save.cu.includes('rainbow'),'Ace of Aces unlocks Rainbow trail');
 g.save.stat.bossK={heavy:1,cmdr:1,adv:1};g.chkAch();ok(g.save.ach.boss3===1,'Triple Threat needs all 3 bosses');
 // cosmetic trail applies; locked trail ignored
 g.save.ct='gold';ok(g.curTrail()==='255,224,102','selected trail colour is used (gold)');
 g.save.ct='neon';g.save.cu=g.save.cu.filter(x=>x!=='neon');ok(g.curTrail()!=='110,255,200','locked trail cannot be used');
 g.save.ct='rainbow';g.save.cu.push('rainbow');ok(/^\d+,\d+,\d+$/.test(g.curTrail()),'rainbow trail returns a valid colour ('+g.curTrail()+')');
 g.save.ct='auto';
 // power-ups
 const pick=ty=>{g.start();g.pu=[{x:g.pl.x,y:g.pl.y,ty}];g.st=[];g.ms=[];g.upd(.001)};
 pick('s');ok(g.shield>4,'power-up S: shield');
 pick('m');ok(g.mag>7&&g.shield===0,'power-up M: magnet 8 s');
 pick('l');ok(g.slow>5,'power-up L: slow missiles 6 s');
 // magnet pulls stars; slow halves missile speed
 g.start();g.pl.x=600;g.pl.y=400;g.mag=8;g.ms=[];g.pu=[];g.st=[{x:760,y:400,r:0}];g.upd(.1);ok(g.st.length===0||g.st[0].x<760,'magnet pulls nearby stars toward the plane');
 g.start();g.pl.x=1100;g.pl.y=700;g.ms=[{x:100,y:100,a:0,life:8,v:200,r:1,h:0}];g.upd(.5);const dx1=g.ms[0].x-100;
 g.ms=[{x:100,y:100,a:0,life:8,v:200,r:1,h:0}];g.slow=6;g.upd(.5);const dx2=g.ms[0].x-100;ok(Math.abs(dx2/dx1-.55)<.05,'slow power-up: missiles move at 55% speed ('+(dx2/dx1).toFixed(2)+')');
 let kinds=new Set();for(let i=0;i<300;i++)kinds.add(g.PUT[Math.random()*g.PUT.length|0]);ok(kinds.size===3,'all 3 power-up types can spawn (shield, magnet, slow)');
 // rewards screen
 g.save.cu=['gold','ice'];g.save.ct='auto';g.rewards();ok(/Daily missions/.test(els.rwc.innerHTML)&&/Achievements/.test(els.rwc.innerHTML)&&/Gold/.test(els.rwc.innerHTML),'rewards screen lists missions, achievements and trails');
 g.setTrail('ice');ok(g.save.ct==='ice'&&JSON.parse(store.dw).ct==='ice','selecting a trail saves it');
 // render with all effects
 let de=0;g.start();g.mag=5;g.slow=5;g.shield=5;g.pu=[{x:100,y:100,ty:'s'},{x:200,y:100,ty:'m'},{x:300,y:100,ty:'l'}];try{g.draw()}catch(e){de++;console.log(e.message)}ok(de===0,'power-up icons and effect timers render');
}
// old save (before Phase 4) still loads
{store.dw=JSON.stringify({pts:123,best:{e:1,n:7,f:9},own:[0,1],sel:1,mode:'f'});const g=run();
 ok(g.save.pts===123&&g.save.own.length===2&&g.save.best.n===7&&g.save.mode==='f','old save: points, planes, best scores kept');
 ok(g.save.stat.runs===0&&Array.isArray(g.save.cu)&&g.save.ct==='auto'&&g.save.m.list.length===3,'old save: new fields get defaults');
 g.start();ok(g.S==='play','old save: game starts');}

// ======== Phase 7: auto-fire weapons, sky by level and joystick ========
{const g=run();g.autoFire=true;g.setWH(1200,800);g.save.mode='n';
 const prep=L=>{g.start();g.lv=L;g.ms=[];g.pu=[];g.st=[];g.msT=99;g.inv=99;g.pl.x=300;g.pl.y=400;g.pl.a=0;g.setWH(1200,800)};
 // no guns on the opening three stages; every later aircraft has an auto-fire set
 for(const L of [1,2,3]){prep(L);let n=0;for(let i=0;i<60;i++){g.upd(.03);n=Math.max(n,g.bl.length)}ok(n===0&&!g.WPN[L],'Stage '+L+': no guns, fires nothing')}
 for(let L=4;L<=30;L++){prep(L);let n=0;for(let i=0;i<40;i++){g.pl.x=300;g.pl.y=400;g.upd(.03);n=Math.max(n,g.bl.length)}ok(!!g.WPN[L]&&n>0,'Stage '+L+' ('+g.WPN[L].n+') fires automatically (peak '+n+' shots on screen)')}
 const dps=L=>g.WPN[L].e.reduce((a,e)=>a+e.r*e.d*e.o.length,0);ok(dps(30)>dps(20)&&dps(20)>dps(12),'firepower grows from stage 12 to 30 ('+[12,20,30].map(dps).map(v=>v.toFixed(1))+' dmg/s)');
 ok(g.WPN[9].e.some(e=>e.h)&&g.WPN[30].e.some(e=>e.h)&&!g.WPN[4].e.some(e=>e.h),'later aircraft carry homing weapons; early aircraft use guns');
 // a bullet destroys a missile ahead
 prep(4);g.ms=[{x:700,y:400,a:0,life:8,v:0,r:1,h:0}];const s0=g.save.stat.shot||0;for(let i=0;i<60;i++){g.pl.x=300;g.pl.y=400;g.pl.a=0;g.upd(.02)}
 ok(g.ms.length===0&&g.save.stat.shot===s0+1,'Aircraft tier 4 gun shoots down a missile ahead (shot stat '+g.save.stat.shot+')');
 // homing missile finds a target off to the side
 prep(9);g.ms=[{x:600,y:700,a:0,life:8,v:0,r:1,h:0}];for(let i=0;i<120&&g.ms.length;i++){g.pl.x=300;g.pl.y=400;g.pl.a=0;g.upd(.02)}
 ok(g.ms.length===0,'Aircraft tier 9 homing missile curves to a target that is not straight ahead');
 // boss missile needs many hits; killing it ends the Heavy boss
 prep(4);g.startBoss(9);const hm=g.ms.find(m=>m.big);ok(hm.hp===40,'heavy boss missile has 40 hit points');
 hm.x=600;hm.y=400;hm.v=0;hm.h=0;hm.st=null;hm.hp=2;g.bl=[{x:600,y:400,a:0,v:0,d:1,life:1,w:3,c:'#fff'}];g.upd(.001);ok(g.ms.includes(hm)&&hm.hp===1,'one hit only dents the heavy missile');
 g.bl=[{x:600,y:400,a:0,v:0,d:1,life:1,w:3,c:'#fff'}];g.upd(.001);g.upd(.001);ok(!g.ms.includes(hm)&&g.B===null,'shooting the heavy missile down defeats the boss ('+g.bonus+' bonus)');
 // Commander takes damage from bullets
 prep(7);g.startBoss(17);const bt=g.B.t;g.B.x=600;g.B.y=64;g.bl=[{x:600,y:64,a:0,v:0,d:2,life:1,w:3,c:'#fff'}];g.upd(.001);ok(g.B.t>bt+.2,'bullets hitting the Commander speed up its defeat');
 // levelling up announces the weapon
 g.start();g.save.mode='n';for(let i=0;i<15;i++){g.ms=[];g.pu=[];g.st=[{x:g.pl.x,y:g.pl.y,r:0}];g.upd(.001)}ok(g.lv===4&&/Nose gun/.test(g.banTx),'Stage 4 banner names the new weapon ("'+g.banTx+'")');
 // sky: morning -> night
 ok(g.skyAt(1)[0]!==g.skyAt(15)[0]&&g.skyAt(15)[0]!==g.skyAt(30)[0],'sky colours change level by level');
 const lum=c=>{const m=c.match(/\d+/g).map(Number);return .3*m[0]+.59*m[1]+.11*m[2]};
 ok(lum(g.skyAt(1)[0])>lum(g.skyAt(17)[0])&&lum(g.skyAt(17)[0])>lum(g.skyAt(30)[0])&&lum(g.skyAt(1)[1])>150&&lum(g.skyAt(30)[1])<40,'sky goes from bright morning to dark night (top lum '+[1,17,30].map(L=>Math.round(lum(g.skyAt(L)[0])))+')');
 ok(g.nightAmt(1)===0&&g.nightAmt(5)===0&&g.nightAmt(30)===1&&g.nightAmt(24)>0&&g.nightAmt(24)<1,'stars: none by day, all at Level 30, some at dusk');
 ok(g.STARS.length>=30&&g.STARS.length<=60,'a modest number of white stars ('+g.STARS.length+')');
 g.start();ok(Math.abs(g.skyL-1)<1e-9,'a new run starts in the morning');
 g.lv=5;g.inv=99;g.st=[];for(let i=0;i<200;i++){g.ms=[];g.upd(.03)}ok(Math.abs(g.skyL-5)<.1,'sky eases toward the plane level (skyL '+g.skyL.toFixed(2)+')');
 g.lv=12;g.skyL=12;let de=0;try{g.draw()}catch(e){de++;console.log(e.message)}g.lv=1;g.skyL=1;try{g.draw()}catch(e){de++}ok(de===0,'sky renders at early and middle campaign stages');
 // joystick
 g.start();g.pl.a=-Math.PI/2;g.setJoy(0);g.upd(.1);ok(g.pl.a>-Math.PI/2+.3&&g.pl.a<0,'joystick pushed right turns the plane right (a='+g.pl.a.toFixed(2)+')');
 g.start();g.pl.a=-Math.PI/2;g.setJoy(null);g.upd(.1);ok(Math.abs(g.pl.a+Math.PI/2)<1e-9,'joystick released: plane keeps its heading');
 g.start();g.pl.a=0;g.setJoy(Math.PI);for(let i=0;i<40;i++)g.upd(.03);ok(Math.abs(Math.abs(g.pl.a)-Math.PI)<.2||Math.abs(g.pl.a-Math.PI)<.2,'joystick pushed left turns all the way around');
 // no empty ad strip: the canvas uses the complete viewport
 el('ad').offsetHeight=0;el('st').offsetHeight=0;g.rs();ok(g.H===800,'game area uses the full screen with no blank ad strip (H='+g.H+')');
 el('ad').offsetHeight=0;g.rs();
 // missiles get tougher with level (hit points)
 for(const [L,hp] of [[1,1],[6,1],[7,1],[16,1],[17,2],[24,2],[25,3],[30,3]]){prep(L);g.pl.x=600;g.pl.y=400;g.msT=0;g.upd(.001);const m=g.ms.find(q=>!q.bm);ok(m&&m.hp===hp&&m.hp0===hp,'Aircraft tier '+L+': new missiles have '+hp+' hit point(s)')}
 // damage: a 3 hp missile survives a single hit
 prep(12);const tough={x:700,y:400,a:0,life:8,v:0,r:1,h:0,hp:3,hp0:3};g.ms=[tough];g.bl=[{x:700,y:400,a:0,v:0,d:1.5,life:1,w:3,c:'#fff'}];g.upd(.001);ok(g.ms.includes(tough)&&tough.hp===1.5,'one 1.5 damage shot only half-kills a 3 hp missile');
}

// Retired mission IDs must be harmless and must not erase stored progress.
{
 const day=new Date(), today=day.getFullYear()+'-'+(day.getMonth()+1)+'-'+day.getDate();
 const legacy={pts:321,best:{e:12,n:34,f:56},own:[0,1],sel:1,mode:'n',m:{day:today,list:['fl','unknown','stars'],prog:{fl:2,stars:14},done:{fl:1}},ach:{first:1},cu:['ice'],ct:'ice'};
 store.dw=JSON.stringify(legacy);const a=run();
 try{a.rewards();ok(true,'retired/unknown missions: rewards opens')}catch(e){ok(false,'retired/unknown missions: '+e.message)}
 ok(a.save.pts===321&&a.save.sel===1&&a.save.own.includes(1)&&a.save.ach.first===1&&a.save.ct==='ice','old save: purchases, points and cosmetics preserved');
 ok(a.save.m.prog.fl===2&&a.save.m.done.fl===1&&a.save.m.prog.stars===14,'retired and active progress retained');
 a.hangar();a.start();a.mEvent('stars',1);ok(a.save.m.done.stars===1&&a.save.pts===381,'active mission still pays exactly once');
 a.mEvent('stars',1);ok(a.save.pts===381,'no duplicate mission reward');
 a.die();a.start();ok(a.S==='play'&&a.st.length>0,'old save: hangar, death and restart work');
 const saved=JSON.parse(store.dw);const b=run();ok(b.save.pts===saved.pts&&b.save.m.prog.fl===2,'LocalStorage reload retains progress');
}

// Save migration is idempotent and keeps scores and all previously unlocked aircraft.
{store.dw=JSON.stringify({v:2,pts:999,best:{e:10,n:20,f:30},own:[0,1,2],sel:2,mode:'f',stat:{bestLv:12},ach:{win:1},cu:['rainbow'],ct:'rainbow'});
 const a=run();ok(a.save.stat.bestLv===30&&a.save.legacyBestLv===12&&a.save.v===4,'old final aircraft unlock maps to stage 30');
 ok(a.save.pts===999&&a.save.best.f===30&&a.save.own.length===3&&a.save.ct==='rainbow','legacy economy, scores and unlocks preserved');
 a.start();a.die();const before=JSON.stringify(a.save);const b=run();ok(JSON.stringify(b.save)===before,'migration does not repeat on reload');}

// Runtime caps and every upgraded weapon stage, not just lookup table values.
{const a=run();for(const [w,h] of [[390,800],[1200,800]])for(const L of [1,15,30]){
 a.setWH(w,h);a.start();a.lv=L;a.inv=999;a.st=[];a.ms=[];a.msT=0;let maximum=0;
 for(let n=0;n<1000;n++){a.pl.x=10;a.pl.y=10;a.pu=[];for(const m of a.ms){m.x=500;m.y=500;m.v=0;m.life=8}a.upd(.02);maximum=Math.max(maximum,a.ms.length)}
 ok(maximum===a.cap(L),'live missile cap at '+w+'px / stage '+L);
 }
 a.autoFire=true;for(let L=1;L<=30;L++){a.start();a.lv=L;a.inv=999;a.st=[];a.msT=99;let peak=0;for(let n=0;n<30;n++){a.pl.x=180;a.pl.y=300;a.upd(.03);peak=Math.max(peak,a.bl.length)}ok(L<4?peak===0:peak>0,'automatic weapon behavior at stage '+L)}
}

{store.dw=JSON.stringify({v:3,pts:12,best:{play:12},stat:{bestLv:23},top:[]});const g=run();ok(g.save.stat.bestLv===23&&g.save.v===4,'v3 stage progress remains at its unlocked 30-plane stage');}
{store.dw=JSON.stringify({pts:'bad',own:null,sel:999,m:null,stat:null,cu:['missing'],ct:'missing',top:'bad'});const g=run();g.hangar();g.rewards();ok(g.save.pts===0&&g.save.sel===0&&g.save.own.length===1&&Array.isArray(g.save.top),'malformed save falls back without breaking menu screens');}
