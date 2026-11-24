const path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(pathToFileURL(path.resolve('index.html')).href);
 await p.waitForFunction("typeof setupLevel==='function'&&$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
 const values=await p.evaluate(()=>{
  function check(v,msg){if(!v)throw Error(msg)}
  renderBlocked=true;save.tutorial=true;save.snd=false;save.music=false;
  save.campaign=campaignData({completed:4,selected:4,wallet:300,lifetime:300});
  const c=save.campaign,stats=[];
  for(let r=0;r<=3;r++){
    menu();c.selected=4;
    if(r){for(const key of Object.keys(FORGE_CONFIG)){
      const before=c.wallet;check(buyModule(4,key,r),'purchase '+key);
      check(c.wallet===before-FORGE_CONFIG[key].prices[r-1]&&!buyModule(4,key,r),'single debit '+key);
    }}
    beginAttempt(4,'stars');const startAngle=pl.a;jAng=0;upd(.05);const turn=pl.a-startAngle;
    check(mission.fuel===aircraftStats(4).fuel-.05,'fuel capacity');
    const absorbed=absorbImpact(),cooldown=armorCooldown;check(absorbed===!!r&&!absorbImpact(),'bounded armor');
    const ability=useAbility();check(ability&&!useAbility(),'finite ability cooldown');
    if(r>=2)check(jammerTime===2,'jam');if(r===3)check(inv>=1.5,'phase defense');
    bl=[];wLv=4;wcd=WPN[4].e.map(()=>0);fireTick(.001);
    stats.push({rank:r,turn,cooldown,shots:bl.length,damage:bl[0].d,pierce:bl[0].pierce||0});
    check(c.planes[3].fuel===r&&c.planes[4].fuel===0,'rank isolation');
  }
  check(stats[1].turn>stats[0].turn&&stats[3].turn>stats[2].turn,'engine actual turn rate');
  check(stats[1].damage>stats[0].damage&&stats[2].shots>stats[1].shots&&stats[3].pierce===1,'ballistics');
  menu();c.selected=1;check(!buyModule(1,'weapons',1),'unarmed gate');
  beginAttempt(1,'stars');pu=[{...pl,ty:'m'},{...pl,ty:'l'},{...pl,ty:'s'}];upd(.001);
  check(shield>0&&mag===8&&slow===6,'three pickups');
  st=[{x:pl.x+75,y:pl.y,r:0}];const sx=st[0].x;upd(.02);check(st[0].x<sx,'magnet');
  const missile={x:30,y:220,a:0,h:0,v:100,life:10,phase:0,warning:0};ms=[{...missile}];upd(.05);const slowed=ms[0].x-30;slow=0;ms=[{...missile}];upd(.05);
  check(Math.abs(slowed/(ms[0].x-30)-.55)<.0001,'slow motion');
  ms=[{...missile,x:pl.x,y:pl.y}];inv=0;upd(.001);check(mission&&shield<=0,'shield consumed once');
  pauseG();const f=mission.fuel;upd(1);check(f===mission.fuel,'paused fuel');
  menu();recoverFlight();upd(3);check(window.handleFlightBack()&&S==='paused','back-to-pause');
  window.dispatchEvent(new Event('pagehide'));check(save.campaign.flight.fuel===mission.fuel,'lifecycle save');
  // A fatal obstacle clears the obstacle array during iteration.
  resume();upd(3);inv=shield=0;obs=[{ty:'mine',x:0,y:0,vx:0,vy:0,life:1,r:10},{ty:'mine',...pl,vx:0,vy:0,life:1,r:10}];upd(.001);check(!mission&&S==='over','fatal obstacle cleanup');
  return stats;
 });
 assert.deepEqual(errors,[]);console.log('PASS all fifteen aircraft-specific prices, actual fuel/turn/armor/fire/defense effects, locked weapons and repeat purchases');
 console.log(JSON.stringify(values));
 console.log('PASS all three real power-up mechanics, active pause/recovery and simulated Android back/pagehide, terminal multi-obstacle collision');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});