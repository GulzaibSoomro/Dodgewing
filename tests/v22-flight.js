const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.DW_PLAYWRIGHT_MODULE || 'playwright');

async function main() {
  const browser = await chromium.launch({executablePath:process.env.CHROME_BINARY || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    const page = await browser.newPage({viewport:{width:320,height:480},hasTouch:true,offline:true});
    const errors = [];
    page.on('pageerror',error=>errors.push(error.message));
    const ready = ()=>page.waitForFunction("typeof recoverFlight==='function' && $('splash').classList.contains('hide') && $('loading').classList.contains('hide')");
    await page.goto(pathToFileURL(path.resolve(process.env.DW_ENTRY || 'android/app/src/main/assets/www/dodgewing.html')).href);
    await ready();
    await page.evaluate(()=>{
      renderBlocked=true;save.snd=false;save.tutorial=true;
      beginAttempt(1,'stars');
      for(let i=1;i<cfgFor(1).target;i++){st=[{...pl,r:0}];upd(.001)}
      pl.x=64;pl.y=240;shield=4;mag=4;mission.fuel=.001;st=[{...pl,r:0}];
    });
    await page.keyboard.down('ArrowRight');
    const transition=await page.evaluate(()=>{
      const serial=adScreenSerial,angle=pl.a,clock=t;
      upd(.001);
      return {
        flying:S==='play' && serial===adScreenSerial && !$('joy').classList.contains('hide'),
        steering:keys.ArrowRight && pl.a>angle && Math.hypot(pl.x-64,pl.y-240)<1,
        powers:shield>3.9 && mag>3.9, clock:t>clock, fuel:mission.fuel,
        mirrors:[LEVEL_KEY,MIRROR_KEY].map(key=>{
          const c=JSON.parse(localStorage.getItem(key)).campaign;
          return [c.wallet,c.flight.phase,c.flight.count,c.checkpoints[0],c.completed];
        })
      };
    });
    assert.deepEqual(transition,{flying:true,steering:true,powers:true,clock:true,fuel:60,
      mirrors:[[20,'boss',20,true,0],[20,'boss',20,true,0]]});
    await page.keyboard.up('ArrowRight');
    await page.reload();await ready();
    await page.evaluate(()=>{
      renderBlocked=true;
      if(!recoverFlight()||B.k!=='heavy'||mission.count!==20)throw Error('checkpoint reload');
      upd(3);clearBossIntro();B.entry=1;
      B.y=bossHomeY();
    });
    const overlay=async()=>{
      await page.evaluate(()=>{x.clearRect(0,0,W,H);drawFx()});
      return page.locator('#'+await page.evaluate(()=>cv.id)).screenshot({animations:'disabled'});
    };
    const full=await overlay();
    await page.evaluate(()=>{B.hp=B.hpMax/2});
    assert(full.equals(await overlay()),'health alone changed the boss overlay');
    await page.evaluate(()=>draw());
    await page.screenshot({path:'test-results/v22-boss-hud.png'});
    await page.evaluate(()=>{B.t=B.T;endBoss()});
    assert.match(await page.locator('.clear-card').innerText(),/Outlasted HEAVY MISSILE/);
    await page.screenshot({path:'test-results/v22-level-clear.png',animations:'disabled'});
    await page.getByRole('button',{name:'Next Level'}).tap();
    assert.equal(await page.locator('#scores h2').innerText(),'Level 2');
    await page.evaluate(()=>{
      menu();save.campaign=campaignData({completed:29,selected:30});
      save.campaign.checkpoints[29]=true;save.motion=true;applyMotion();
      beginAttempt(30,'boss');B.entry=1;B.hp=0;endBoss();
    });
    assert.equal(await page.locator('#scores h2').innerText(),'Campaign Complete');
    assert.match(await page.locator('.clear-card').innerText(),/Destroyed COSMIC OVERLORD/);
    assert.equal(await page.locator('.clear-unlock').innerText(),'Legendary Aircraft Core earned');
    assert.equal(await page.locator('.celebrate').count(),0);
    for(const [width,height] of [[320,480],[844,390]]){
      await page.setViewportSize({width,height});
      const primary=page.locator('#scorec .arcade-primary');
      await primary.scrollIntoViewIfNeeded();
      const box=await primary.boundingBox();
      assert(box.x>=0 && box.x+box.width<=width+1 && box.height>=44);
      await page.screenshot({path:'test-results/final-clear-'+width+'.png'});
    }
    await page.locator('#scorec .arcade-primary').tap();
    assert(await page.locator('#flight-map').isVisible());
    assert(await page.evaluate(()=>{
      menu();const wins=save.stat.wins;
      beginAttempt(30,'boss');B.entry=1;B.hp=0;endBoss();
      const singleAward=save.stat.wins===wins && !document.querySelector('.clear-unlock');
      menu();highScores();
      return singleAward && $('scores').querySelector('h2').textContent==='High scores';
    }));
    console.log('PASS held steering, last fuel tick, both save mirrors, relaunch, HP-independent HUD, victory navigation and final replay');
    await page.setViewportSize({width:390,height:844});
    const sample=await page.evaluate(async()=>{
      menu();save.motion=false;applyMotion();save.gfx='auto';save.snd=false;
      beginAttempt(30,'boss');clearBossIntro();bossTick(1.2);B.t=B.T*.7;
      inv=30;renderBlocked=false;
      const original=draw,times=[],costs=[];let maxParticles=0,maxMissiles=0;
      draw=function(){
        const start=performance.now();original();
        if(S==='play'){times.push(start);costs.push(performance.now()-start);
          maxParticles=Math.max(maxParticles,pt.length);maxMissiles=Math.max(maxMissiles,ms.length)}
      };
      try {await new Promise(resolve=>setTimeout(resolve,6500))}
      finally {draw=original;renderBlocked=true}
      const intervals=times.slice(1).map((value,i)=>value-times[i]).sort((a,b)=>a-b);
      costs.sort((a,b)=>a-b);
      const pct=(values,q)=>Number(values[Math.floor((values.length-1)*q)]?.toFixed(2));
      return {frames:times.length,frameMedianMs:pct(intervals,.5),frameP95Ms:pct(intervals,.95),
        drawP95Ms:pct(costs,.95),framesOver50Ms:intervals.filter(ms=>ms>50).length,
        maxParticles,maxMissiles,particleLimit:particleLimit(),state:S,phase:B?.phase,diagnostics:DWDiagnostics.events};
    });
    fs.writeFileSync('test-results/v22-browser-performance.json',JSON.stringify(sample,null,2)+'\n');
    assert(sample.frames>1 && sample.maxMissiles>0 && sample.maxParticles<=sample.particleLimit);
    assert.equal(sample.state,'play');assert.equal(sample.phase,3);
    assert.deepEqual(sample.diagnostics,[]);assert.deepEqual(errors,[]);
    console.log('PASS live final boss sample '+JSON.stringify(sample));
  } finally {await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1});
