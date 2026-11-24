const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const p=await browser.newPage({viewport:{width:360,height:800},hasTouch:true});
  const ready=async()=>{await p.waitForFunction("typeof recoverFlight==='function'&&$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");await p.evaluate(()=>{renderBlocked=true})};
  await p.goto(pathToFileURL(path.resolve('../../Sky-Arcade/project/index.html')).href);await ready();
  const legacy=await p.evaluate(()=>{save.coins=93;save.pts=496;save.stat.bestLv=11;save.own=[0,1];save.sel=1;save.controlMode='touch';save.skybound.equipped.engine=2;start();pauseG();store();return localStorage.getItem('dw')});
  await p.goto(pathToFileURL(path.resolve('android/app/src/main/assets/www/dodgewing.html')).href);await ready();
  await p.evaluate(old=>{localStorage.clear();localStorage.setItem('dw',old)},legacy);await p.reload();await ready();
  assert(await p.evaluate(old=>localStorage.getItem('dw')===old&&save.campaign.completed===0&&save.campaign.wallet===0&&save.campaign.planes[0].engine===0&&save.coins===93&&save.sel===1&&save.controlMode==='touch'&&!save.campaign.flight,legacy));
  console.log('PASS real Sky Arcade Code 22 serializer into staged WebView build; old save and flight bytes retained');
  for(const fps of [30,60]){
   const r=await p.evaluate(rate=>{
    menu();save.campaign=campaignData();beginAttempt(1,'stars');save.snd=false;msT=puT=obT=90;
    st=[{...pl,r:0}];upd(1/rate);const before=mission.fuel;slow=6;mag=8;
    for(let i=0;i<2*rate-1;i++){upd(1/rate);if(st.length)throw Error('early star at frame '+i)}
    upd(1/rate);if(st.length!==1||mission.count!==1||save.campaign.wallet!==1)throw Error('uniqueness');
    const expected=before-2;if(Math.abs(mission.fuel-expected)>.00001)throw Error('fuel drift');
    // Force the preferred ray to encounter a missile and a mine. The
    // deterministic fallback must search for safe, visible alternatives.
    pl={x:W/2,y:H/2,a:0};ms=[{x:pl.x+65,y:pl.y}];obs=[{ty:'mine',x:pl.x+65,y:pl.y+20,r:20}];st=[];spawnMissionStar(()=>.5);
    const a=st[0];if(!a||Math.hypot(a.x-ms[0].x,a.y-ms[0].y)<45||Math.hypot(a.x-obs[0].x,a.y-obs[0].y)<45||a.y<0||a.y>H||a.x<0||a.x>W)throw Error('unsafe spawn');
    return {rate,elapsed:before-mission.fuel,count:mission.count};
   },fps);
   console.log('PASS '+JSON.stringify(r)+' cooldown, fuel and obstructed spawn');
  }
  await p.evaluate(()=>{save.campaign.checkpoints[0]=true;beginAttempt(1,'boss');clearBossIntro();bossTick(1.2);B.hp-=9;B.t=7.25;pauseG();menu()});
  await p.reload();await ready();assert(await p.evaluate(()=>recoverFlight()&&B.hp===B.hpMax-9&&B.t===7.25&&lv===1));
  await p.evaluate(()=>{upd(3);B.entry=1;B.t=B.T;endBoss()});await p.reload();await ready();
  assert(await p.evaluate(()=>save.campaign.completed===1&&save.campaign.records[0].method==='survival'&&!save.campaign.flight&&unlockedLevelCount()===2));
  console.log('PASS powered boss checkpoint and committed victory survive relaunch without replay grants');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});