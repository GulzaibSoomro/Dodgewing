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
const el=id=>els[id]||(els[id]={id,textContent:'',innerHTML:'',classList:{toggle(){},add(){},remove(){}},querySelector(sel){return el(this.id+sel)},setAttribute(){},querySelectorAll(){return []},getContext:()=>ctx,addEventListener(){},width:0,height:0});
let _vis=[];global.document={getElementById:el,hidden:false,addEventListener:(t,f)=>{if(t==='visibilitychange')_vis.push(f)}};
global.window=global;global.innerWidth=+process.env.W||390;global.innerHeight=+process.env.H||800;global.devicePixelRatio=2;
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global._ev={};global.addEventListener=(t,f)=>{(_ev[t]=_ev[t]||[]).push(f)};global.setTimeout=()=>{};
global.Image=class{set src(v){this._s=v;this.complete=true;this.naturalWidth=100;this.naturalHeight=120}};
const run0=new Function(js+`
;return {beginAttempt,get mission(){return mission},LEVEL_CONFIG,loadLevelProfile,campaignData,bulletTick,startFlightMode,instantRetry,flightModes,menu,get flightMode(){return flightMode},BOSS_REQUIREMENTS,get directTarget(){return directTarget},setControlMode,get S(){return S},set S(v){S=v},get lv(){return lv},get stars(){return stars},start,upd,draw,evo,sz,get pl(){return pl},set pl(v){pl=v},get ms(){return ms},set ms(v){ms=v},get st(){return st},set st(v){st=v},get pu(){return pu},set pu(v){pu=v},get save(){return save},set shield(v){shield=v},hangar,pick,buy,get upT(){return upT},get banT(){return banT},get fadeT(){return fadeT},get prevLv(){return prevLv},LV,SPR,lvOf,die,get hint(){return hint},get evoStars(){return evoStars},get B(){return B},rewards,setTrail,dayMis,mEvent,chkAch,MIS,ACH,COS,curTrail,rb,get mag(){return mag},set mag(v){mag=v},get slow(){return slow},set slow(v){slow=v},get trailC(){return trailC},set peak(v){peakLv=v},get PUT(){return PUT},set B(v){B=v},get bonus(){return bonus},set bonus(v){bonus=v},get shield(){return shield},get bossSeen(){return bossSeen},get fx(){return fx},startBoss,endBoss,bossTick,get nmT(){return nmT},set ms3(v){ms=v},set evoStars(v){evoStars=v},get lvStars(){return evoStars%5},cap,M,planeSpeed,get SPRD(){return SPRD},missileKind,normalMissileSkin,BOSS,RULES,STAGES,LEVEL_COUNT,levelForTier,tierOf,loop,setWH(w,h){W=w;H=h},pauseG,resume,get ms2(){return ms},addStar,get msT(){return msT},get sp(){return sp},get inv(){return inv},get peakLv(){return peakLv},get banTx(){return banTx},set lv(v){lv=v},set inv(v){inv=v},hurt,set msT(v){msT=v},get bl(){return bl},set bl(v){bl=v},WPN,MISSILE_DRAW_SIZE,skyAt,nightAmt,get skyL(){return skyL},set skyL(v){skyL=v},set autoFire(v){autoFire=v},setJoy(a){jAng=a},get H(){return H},rs,SKY,STARS,UPGRADES,buyUpgrade,upgradeCost,abilityFor,useAbility,obstacleKind,spawnObstacle,continueRun,requestRewardedRescue,onRewardedRescueResult,refreshRewardedRescue,get rewardedRescueUsed(){return rewardedRescueUsed},get rewardedRescuePending(){return rewardedRescuePending},get obs(){return obs},set obs(v){obs=v},get abilityCd(){return abilityCd},get over(){return over},get runCoins(){return runCoins},get resumeT(){return resumeT},get damageFlash(){return damageFlash},get hudStarPop(){return hudStarPop},get hudCoinPop(){return hudCoinPop},get evolveBurst(){return evolveBurst},reducedMotion,toggleMotion}`);
const run=()=>{const r=run0();r.autoFire=false;return r};

const assert=require('assert');let passed=0;
function check(v,m){assert(v,m);console.log('PASS '+m);passed++}
const g=run();
check(JSON.stringify(Object.keys(g.BOSS))==='["5","10","15","20","25","30"]','six boss slots at five-level intervals');
for(let L=1;L<=30;L++){
  const c=g.LEVEL_CONFIG[L-1];check(c.aircraft===L&&c.target===20+2*Math.floor((L-1)/5),'fixed aircraft and chapter target '+L);
  check(g.beginAttempt(L,'stars'),'sequential entry '+L);
  for(let i=0;i<c.target;i++){g.st=[{...g.pl,r:0}];g.upd(.001);check(g.lv===L,'fixed model through pickup '+L+'/'+i)}
  check(g.mission.phase==='boss'&&g.save.campaign.flight.phase==='boss'&&g.save.campaign.completed===L-1,'live checkpoint before unlock '+L);
  check(g.S==='play'&&g.B.L===c.boss,'automatic intended boss '+L);
  g.B.entry=1;g.B.t=g.B.T;g.endBoss();check(!g.B&&g.save.campaign.completed===L,'survival unlock '+L);
}
check(g.SPRD.length===30&&new Set(g.SPRD).size===30,'30 aircraft mapped without duplicate paths');
const hashes=g.SPRD.map(p=>require('crypto').createHash('sha256').update(p.startsWith('data:')?Buffer.from(p.split(',')[1],'base64'):fs.readFileSync(p)).digest('hex'));
check(new Set(hashes).size===30,'30 distinct aircraft asset contents');
for(let L=1;L<=30;L++)check(L<4?!g.WPN[L]:g.WPN[L].e.length>0,'weapon progression '+L);
check(g.WPN[30].e.some(e=>e.h),'advanced aircraft have homing weapons');
for(const L of [5,10,15,20,25,30]){
 g.beginAttempt(L,'boss');g.hurt();check(!g.B&&!g.mission&&g.save.campaign.checkpoints[L-1]===true,'boss failure retains checkpoint '+L);
}
for(const size of [[320,480],[390,844],[768,1024],[844,390]]){
 g.setWH(...size);g.beginAttempt(1,'stars');const before={...g.pl};g.setControlMode('touch');g.upd(.016);
 check(Number.isFinite(g.pl.x)&&Math.hypot(g.pl.x-before.x,g.pl.y-before.y)<10,'bounded flight at '+size.join('x'));
}
check(g.save.controlMode==='touch','control choice persisted');
for(const L of [5,10,15,20,25,30]){
 g.menu();g.B=null;g.startBoss(L);g.B.entry=1;for(let i=0;i<120;i++)g.bossTick(.05);
 check(g.ms.some(m=>m.bm),'boss '+L+' launches collidable threats');check(g.B.hp>0&&g.B.hpMax===g.B.hp,'boss '+L+' has damageable health');
 g.inv=99;g.upd(1.2);g.ms=[];const health=g.B.hp;g.bl=[{x:g.B.x,y:g.B.y,a:0,v:0,d:5,life:1,w:3}];g.bulletTick(.001);check(g.B.hp===health-5,'weapon collision damages boss '+L);
}
g.menu();const real=g.save,level=real.stat.bestLv,coins=real.coins;
check(g.startFlightMode('practice',5),'practice starts unlocked encounter');g.save.coins+=999;g.save.stat.bestLv=30;g.die();
check(g.save===real&&g.save.coins===coins&&g.save.stat.bestLv===level,'practice never writes campaign coins or unlocks');
check(g.save.flightRecords['practice:5'].runs===1,'practice result persists separately');
g.instantRetry();check(g.flightMode.kind==='practice'&&g.lv===5,'instant retry retains selected practice');g.menu();
check(g.startFlightMode('rush'),'boss rush starts');
for(let i=0;i<6;i++){g.B.entry=1;g.B.t=g.B.T;g.endBoss()}
check(g.S==='victory'&&g.save===real&&g.save.cu.includes('aurora'),'boss rush completes six fights and unlocks existing cosmetic');
g.menu();g.startFlightMode('challenge');g.inv=999;for(let i=0;i<61;i++){g.ms=[];g.obs=[];g.upd(1)}
check(g.S==='victory'&&g.save===real&&g.save.flightRecords['challenge:1'].wins===1,'challenge time, modifiers and isolated result');
for(const prior of [{v:2,stat:{bestLv:12},pts:4321,coins:72,own:[0,2],sel:2},{v:4,stat:{bestLv:26},cp:25,coins:150},{v:4,stat:{bestLv:8},controlMode:'touch'}]){
 delete store['dw.level-campaign.v2'];delete store['dw.level-campaign.v2.mirror'];store.dw=JSON.stringify(prior);const migrated=run();check(migrated.save.stat.bestLv>=prior.stat.bestLv,'old progress survives schema '+prior.v);check(migrated.save.coins===(prior.coins||0),'old coins survive schema '+prior.v);check(migrated.save.v===4,'five-star save version remains compatible');
}
console.log('TOTAL '+passed+' passed');

