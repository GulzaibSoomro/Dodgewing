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
function verify(assert){
  function pickup(){st=[{...pl,r:0}];ms=[];obs=[];inv=2;upd(.001)}
  start();
  for(let level=1;level<=30;level++){
    assert.equal(lv,level);assert.equal(chapterAt(lv).id,Math.ceil(lv/5));assert.equal(stageAt(lv),(lv-1)%5);
    if(B){
      B.entry=1;if(level%10===0)B.t=B.T;else B.hp=0;
      const before=save.coins;endBoss();endBoss();
      assert.equal(save.coins-before,(level===30?100:35)+12);
      assert(save.skybound.completed.includes(level/5));
    }
    for(let i=0;i<requiredStars(level);i++)pickup();
  }
  assert.equal(S,'victory');assert.equal(save.skybound.core,true);assert.equal(save.skybound.completed.length,6);
  console.log('PASS continuous thirty-stage campaign, six first clears by combat or evasion, eighth final star and core');
  const earned=save.coins;menu();
  const totals=ECONOMY.costs.reduce((a,b)=>a+b)*4;
  assert(earned>=totals);
  for(const key of Object.keys(MODULES))for(const tier of [1,2,3]){
    const balance=save.coins;
    assert(forgeTransaction(key,tier,true));assert(!forgeTransaction(key,tier,true));
    assert.equal(save.coins,balance-ECONOMY.costs[tier-1]);assert.equal(forgeTier(key),tier);
  }
  assert.equal(save.coins,earned-totals);
  console.log('PASS all twelve purchases affordable on one campaign, duplicate requests rejected');
  start();setFlightLevel(4);ms=[];autoFire=true;
  for(const tier of [1,2,3]){
    save.skybound.equipped.armor=tier;armorCooldown=0;
    assert(absorbImpact());assert(!absorbImpact());assert.equal(armorCooldown,[0,70,55,40][tier]);
    save.skybound.equipped.engine=tier;
    assert(Math.abs(turnFactor()-(1+[0,.02,.05,.08][tier]))<.00001);
    save.skybound.equipped.defense=tier;shield=0;jammerTime=0;inv=0;abilityCd=0;
    lv=10;assert(useAbility());assert.equal(jammerTime,tier===1?0:2);assert.equal(inv,tier===3?1.5:0);
    if(tier===1)assert(shield>=1);
    lv=4;save.skybound.equipped.weapons=tier;bl=[];wLv=0;fireTick(.31);
    assert.equal(bl.length,tier===1?1:2);
    assert(Math.abs(bl[0].d-(tier===1?1.06:.58))<.00001);
    if(tier===3){
      const b=bl[0];b.v=0;bl=[b];const target={x:b.x,y:b.y,hp:2,r:1};
      ms=[target];bulletTick(.001);assert.equal(bl.length,1);const remaining=target.hp;
      bulletTick(.001);assert.equal(target.hp,remaining);
      ms.push({...target});bulletTick(.001);assert.equal(bl.length,0);
    }
  }
  lv=1;bl=[];fireTick(.5);assert.equal(bl.length,0);
  console.log('PASS equipped armor recovery, capped steering, timed defenses, paired and penetrating fire; unarmed eligibility');
  lv=5;B=null;startBoss(5);B.entry=1;B.t=B.T;const before=save.coins;endBoss();
  assert.equal(save.coins-before,35);assert.equal(save.skybound.completed.length,6);
  lv=3;save.skybound.objectives[0]=0;const wallet=save.coins;
  for(let i=0;i<5;i++)chapterTask('star');assert.equal(save.coins-wallet,8);
  console.log('PASS replay earns standard encounter payout only; bonus objective pays once');
  menu();const snapshot=JSON.stringify(save.skybound);
  startFlightMode('practice',5);B.entry=1;B.hp=0;endBoss();menu();assert.equal(JSON.stringify(save.skybound),snapshot);
  console.log('PASS optional flights isolated from campaign grants');
}
new Function('assert',js+'\n('+verify.toString()+')(assert)')(require('assert/strict'));
