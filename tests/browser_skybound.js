const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const path=require('path'),fs=require('fs'),assert=require('assert/strict'),{pathToFileURL}=require('url');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const screen=name=>page.screenshot({path:'test-results/skybound-'+name+'.png',animations:'disabled'});
const ready=async()=>{await page.waitForFunction("typeof recoverFlight==='function'&&$('loading').classList.contains('hide')&&$('splash').classList.contains('hide')");await page.evaluate(()=>renderBlocked=true)};
const check=label=>console.log('PASS '+label);
async function profile(){
 return page.evaluate(()=>{
    start();setFlightLevel(15);inv=1000;proTutorial=-1;clearBossIntro();
    const samples=[];
    for(let i=0;i<241;i++){const start=performance.now();upd(1/60);draw();if(i)samples.push(performance.now()-start)}
    samples.sort((a,b)=>a-b);return {frames:samples.length,p50:samples[120],p95:samples[228],max:samples.at(-1),over16:samples.filter(n=>n>16.67).length};
 });
}
try{
 await page.goto(pathToFileURL(path.resolve('../../Skybound-Legacy/baseline-backup/index.html')).href);await ready();const oldPerf=await profile();
 const old=await page.evaluate(()=>{
    start();save.coins=87;save.stat.bestLv=12;save.sel=0;save.bossProgress[5]=4;runDifficulty='hard';setFlightLevel(12);evoStars=starStarts[12]+2;abilityCd=5;pauseG();return JSON.parse(localStorage.getItem('dw'));
 });
 assert(!old.skybound);
 await page.goto(pathToFileURL(path.resolve('index.html')).href);await ready();
 await page.evaluate(data=>localStorage.setItem('dw',JSON.stringify(data)),old);await page.reload();await ready();
 assert(await page.evaluate(old=>save.coins===old.coins&&save.flight.id===old.flight.id&&save.flight.progress===2&&save.flight.mode==='hard'&&save.skybound.completed.join()==='1,2',old));
 await screen('home');await page.locator('#resume-flight').click();assert(await page.evaluate(()=>lv===12&&abilityCd===5&&runDifficulty==='hard'));
 await page.evaluate(()=>{upd(3);pauseG()});await page.locator('#pause-forge').click();
 await page.locator('.forge-install').click();await page.locator('.forge-install').click();
 assert(await page.evaluate(()=>forgeTier('armor')===1&&save.coins===69));assert(await page.evaluate(()=>{
    const overlay=$('forge-overlay'),image=overlay.previousElementSibling;
    const a=overlay.getBoundingClientRect(),b=image.getBoundingClientRect();
    return getComputedStyle(overlay).backgroundColor==='rgba(0, 0, 0, 0)'&&
      Math.abs(a.x+a.width/2-b.x-b.width/2)<1&&Math.abs(a.y+a.height/2-b.y-b.height/2)<1;
  }));await screen('purchase');
 await page.reload();await ready();await page.evaluate(()=>hangar('forge'));
 assert(await page.evaluate(()=>forgeTier('armor')===1&&save.coins===69));
 await page.locator('.forge-resume').click();assert(await page.evaluate(()=>S==='countdown'&&lv===12&&levelProgress()===2&&forgeTier('armor')===1));
 await page.evaluate(()=>{upd(3);absorbImpact();pauseG()});await page.reload();await ready();await page.locator('#resume-flight').click();assert(await page.evaluate(()=>armorCooldown===70&&levelProgress()===2));
 check('actual Code 21 migration, UI purchase/reload, armor cooldown, same-run round trip from Forge');
 await page.evaluate(()=>{upd(3);menu()});
 for(const [w,h] of [[320,480],[390,844],[412,915],[768,1024]]){
   await page.setViewportSize({width:w,height:h});await page.evaluate(()=>{menu();flightMap()});
   assert.equal(await page.locator('.chapter-card').count(),6);assert.equal(await page.locator('.chapter-stages button').count(),30);
   await page.locator('.chapter-card').last().scrollIntoViewIfNeeded();await page.locator('.chapter-card').first().scrollIntoViewIfNeeded();
   await screen('map-'+w);await page.evaluate(()=>{menu();hangar('aircraft')});await screen('aircraft-'+w);
   await page.locator('#tab-paints').click();assert(await page.locator('#hl').isVisible());await page.locator('#tab-forge').click();
   await page.getByRole('button',{name:/^Engine/}).click();
   const action=page.locator('.forge-install');await action.scrollIntoViewIfNeeded();
   const box=await action.boundingBox();assert(box&&box.x>=0&&box.x+box.width<=w+1&&box.height>=40);
   await screen('forge-'+w);await page.locator('.forge-resume').click();assert(await page.evaluate(()=>S==='countdown'&&directPointer===null));
 }
 check('six chapter cards, thirty stages, Aircraft/Paints/Forge tabs and actionable controls across four viewport sizes');
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 for(const c of [1,2,3,4,5,6]){
   await page.evaluate(c=>{launchCampaign('medium');setFlightLevel((c-1)*5+1);proTutorial=-1;hint=0;pl.a=-Math.PI/2;banTx=chapterAt(lv).name+' · '+stageBrief(lv);draw()},c);await screen('environment-'+c);
   const outcome=c%2?'combat':'survival';
   await page.evaluate(({c,outcome})=>{setFlightLevel(c*5);clearBossIntro();inv=50;
     for(let i=0;i<170;i++)upd(1/60);
     if(outcome==='combat')B.hp=0;else B.t=B.T;
     upd(.001);draw();
   },{c,outcome});
   await screen('chapter-complete-'+c);
   const state=await page.evaluate(()=>({balance:save.coins,id:save.flight.id,lv}));
   await page.reload();await ready();await page.locator('#resume-flight').click();
   assert(await page.evaluate(s=>!B&&lv===s.lv&&activeRun===s.id&&save.coins===s.balance&&save.skybound.completed.includes(lv/5),state));
 }
 await page.evaluate(()=>{upd(3);while(S==='play'){st=[{...pl,r:0}];upd(.001)}});
 assert(await page.evaluate(()=>S==='victory'&&save.skybound.core));await screen('victory');await page.reload();await ready();assert(await page.locator('#resume-flight').isHidden());
 check('six complete-and-reload checkpoints, both boss outcomes and final victory');
 await page.evaluate(()=>{start();for(let i=0;i<4;i++){st=[{...pl,r:0}];upd(.001)}draw()});await screen('evolution');
 await page.evaluate(()=>{die();upd(1);draw()});await screen('game-over');
 const currentPerf=await profile();fs.writeFileSync('test-results/frame-profile.json',JSON.stringify({code21:oldPerf,skybound:currentPerf},null,2));
 assert.deepEqual(errors,[]);check('browser frame profile recorded, screenshots captured, zero page exceptions');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
