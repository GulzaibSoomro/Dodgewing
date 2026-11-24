const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('url'),path=require('path'),assert=require('assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const ready=async()=>{await page.waitForFunction("typeof recoverFlight==='function' && $('splash').classList.contains('hide') && $('loading').classList.contains('hide')");await page.evaluate(()=>renderBlocked=true)};
await page.goto(pathToFileURL(path.resolve('index.html')).href);await ready();
await page.locator('#home-play').click();await page.locator('button[value=hard]').click();
assert(await page.evaluate(()=>runDifficulty==='hard'&&S==='play'));
await page.evaluate(()=>{save.controlMode='touch';show(null)});
await page.mouse.move(150,400);await page.mouse.down();await page.mouse.move(152,401);
assert(await page.evaluate(()=>jAng===null&&dragStrength===0));
await page.mouse.move(245,400);assert(await page.evaluate(()=>dragStrength===1&&Math.abs(jAng)<.1));
await page.mouse.move(80,400);assert(await page.evaluate(()=>Math.abs(jAng)>3));await page.mouse.up();
assert(await page.evaluate(()=>directPointer===null&&jAng===null));const cdp=await page.context().newCDPSession(page);
const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
await touch('touchStart',[{x:140,y:380,id:1}]);
const first=await page.evaluate(()=>directPointer);
await touch('touchStart',[{x:140,y:380,id:1},{x:230,y:450,id:2}]);
await touch('touchMove',[{x:140,y:380,id:1},{x:280,y:420,id:2}]);
assert(await page.evaluate(id=>directPointer===id&&jAng===null,first));
await touch('touchCancel',[]);assert(await page.evaluate(()=>directPointer===null));
for(const hz of [30,60]){
 const sample=await page.evaluate(hz=>{
   start();autoFire=false;pl.a=0;const initial=pl.x;
   const cloud=clouds[1];cloud.x=.5;cloud.y=.2;const y=cloud.y,x0=cloud.x;
   for(let i=0;i<hz;i++)upd(1/hz);
   return {flight:pl.x-initial,vertical:(cloud.y-y)*H/cloud.v,horizontal:(cloud.x-x0)*W/cloud.v}
 },hz);
 assert(Math.abs(sample.flight-150)<.01&&Math.abs(sample.vertical-1.05)<.001&&Math.abs(sample.horizontal+.72)<.001);
}
console.log('PASS multitouch ownership, cancellation, 30/60 FPS flight and sky distance');
console.log('PASS real relative drags, dead zone, reversal and release');
for(const L of [5,10,15,20,25,30]){
 const saved=await page.evaluate(L=>{
  launchCampaign('hard');setFlightLevel(L);renderBlocked=true;inv=999;autoFire=false;proTutorial=-1;clearBossIntro();
  const boss=B;startBoss(L);if(B!==boss||ms.some(m=>m.bossSkin!=null))throw Error('duplicate body');
  const original={x:B.x,y:B.y};let launches=0;
  for(let i=0;i<500;i++){
    const n=ms.length;bossTick(1/60);
    for(const m of ms.slice(n)){const sources=L===25?satellites(B):[B];if(!sources.some(p=>Math.hypot(p.x-m.x,p.y-m.y)<1))throw Error('origin');launches++}
  }
  if(!launches||Math.hypot(B.x-original.x,B.y-original.y)<.01)throw Error('no motion or attacks');
  const m=ms[0];ms=[m];pl.x=m.x;pl.y=m.y;shield=3;inv=0;upd(.0001);
  if(shield!==0)throw Error('missile collision');
  ms=[];pl.x=W*.1;pl.y=H*.85;inv=9;bl=[{x:B.x,y:B.y,a:0,v:0,d:8,life:1,w:2}];
  const before=B.hp;bulletTick(.001);if(B.hp>=before)throw Error('weapon collision');
  evoStars=starStarts[L]+1;stars=1;pauseG();const now=B.t;upd(.5);if(B.t!==now)throw Error('pause');
  return {hp:B.hp,t:now,id:save.flight.id,level:lv};
 },L);
 await page.reload();await ready();await page.locator('#resume-flight').click();
 assert(await page.evaluate(s=>S==='countdown'&&B?.hp===s.hp&&B?.t===s.t&&lv===s.level&&activeRun===s.id&&levelProgress()===1&&runDifficulty==='hard'&&!ms.length,saved));
 assert(await page.evaluate(()=>{upd(2.9);if(S!=='countdown')return false;upd(.11);return S==='play'&&inv>=2}));
 await page.evaluate(()=>{clearBossIntro();for(let i=0;i<80;i++)upd(1/60);ms=[];bl=[{x:B.x,y:B.y,a:0,v:0,d:B.hpMax*5,life:1,w:2}];const before=save.coins,chapterBonus=save.skybound.completed.includes(chapterAt(lv).id)?0:ECONOMY.chapter;upd(.001);endBoss();if(B||save.coins-before!==(lv===30?100:35)+chapterBonus)throw Error('duplicate boss reward')});
 console.log('PASS boss '+L+' collision, launch origin, pause, reload, protected countdown, defeat and single payout');
}
await page.evaluate(()=>{while(S==='play'){st=[{...pl,r:0}];upd(.0001)}if(S!=='victory')throw Error('final victory')});
await page.reload();await ready();assert(await page.locator('#resume-flight').isHidden());console.log('PASS final victory persists');
for(const mode of ['easy','medium','hard']){
 await page.evaluate(mode=>{launchCampaign(mode);t=20;die();if(save.modeBest[mode]<Math.floor(20*modeRules().score))throw Error('mode best')},mode);
 await page.reload();await ready();assert(await page.locator('#resume-flight').isHidden());
}
console.log('PASS terminal crash and difficulty bests across reload');
await page.evaluate(()=>{launchCampaign('medium');inv=100;for(let i=0;i<4;i++){st=[{...pl,r:0}];upd(.001)}menu()});
await page.screenshot({path:'test-results/home-resume.png'});
await page.locator('#home-play').click();assert(await page.getByText(/Starting replaces/).isVisible());await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.locator('#resume-flight').click();assert(await page.evaluate(()=>lv===2&&levelProgress()===0&&stars===4));
await page.evaluate(()=>{upd(3);menu();hangar()});await page.screenshot({path:'test-results/hangar.png'});
await page.evaluate(()=>{localStorage.setItem('dw','{')});await page.reload();await ready();assert(await page.locator('#resume-flight').isVisible());console.log('PASS cancellation, evolution recovery and malformed primary profile fallback');
assert.deepEqual(errors,[]);console.log('PASS clean browser console');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
