const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    await page.waitForFunction("typeof initForge==='function' && $('splash').classList.contains('hide')");
    await page.evaluate(()=>hangar('forge'));
    const action=page.locator('.forge-install');
    assert(await action.isDisabled());assert.match(await action.textContent(),/Insufficient/);
    await page.getByRole('button',{name:/^Weapons/}).click();assert.match(await action.textContent(),/armed aircraft/);
    await page.evaluate(()=>{save.coins=99;chooseModule('engine')});
    await action.click();await action.click();assert(await page.evaluate(()=>save.coins===81&&forgeTier('engine')===1));
    assert(await action.isDisabled());assert.match(await action.textContent(),/Reinforced Armor/);
    console.log('PASS insufficient currency, unarmed weapon slot, purchase, locked blueprint and balance');
    await page.evaluate(()=>{menu();launchCampaign('medium');inv=999;save.tutorial=true;proTutorial=-1});
    for(const [w,h] of [[768,1024],[320,480],[390,844]]){
      await page.setViewportSize({width:w,height:h});
      const start=await page.evaluate(()=>t);
      await page.waitForFunction(s=>S==='play'&&t>s+.2,start);
      const pixel=await page.screenshot({clip:{x:2,y:2,width:1,height:1}});
      assert(await page.evaluate(async data=>{
        const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();
        const sample=document.createElement('canvas').getContext('2d');sample.drawImage(image,0,0);
        return W>0&&H>0&&sample.getImageData(0,0,1,1).data[2]>20;
      },pixel.toString('base64')));
    }
    await page.screenshot({path:'test-results/skybound-live-cadet.png'});
    console.log('PASS live frame loop redraws after tablet-to-phone and small-to-standard resizes');
    await page.evaluate(()=>{setFlightLevel(5);B.entry=1;B.t=B.T;inv=50;clearBossIntro()});
    await page.locator('#chapter-notice button').click();
    const state=await page.evaluate(()=>({id:save.flight.id,level:save.flight.level,coins:save.coins,owns:save.skybound.completed.includes(1)}));
    assert.equal(state.level,5);assert(state.owns);
    await page.locator('.forge-resume').click();
    assert(await page.evaluate(s=>activeRun===s.id&&lv===5&&!B&&bossSeen[5]&&save.coins===s.coins,state));
    assert.deepEqual(errors,[]);console.log('PASS chapter-complete Forge button and same encounter-cleared flight resume');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});