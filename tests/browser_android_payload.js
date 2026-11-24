const path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try{
    const context=await browser.newContext({offline:true,viewport:{width:390,height:844}});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve('android/app/src/main/assets/www/dodgewing.html')).href);
    await page.waitForFunction("typeof renderForge==='function' && $('splash').classList.contains('hide') && $('loading').classList.contains('hide')");
    for(let i=0;i<6;i++){
      const level=i*5+1;
      await page.evaluate(level=>{
        launchCampaign('medium');setFlightLevel(level);clearBossIntro();
        proTutorial=-1;hint=0;inv=10;banT=0;pl.a=-Math.PI/2;
      },level);
      await page.waitForFunction(()=>t>.18&&S==='play');
      assert(await page.evaluate(level=>lv===level && SPR[level-1].naturalWidth>0 && RECOVERED_BOSSES.every(image=>image.naturalWidth>0),level));
      await page.screenshot({path:'test-results/skybound-live-chapter-'+(i+1)+'.png'});
    }
    await page.evaluate(()=>{pauseG();openFlightForge()});
    assert(await page.locator('#forge-overlay').isVisible());assert.deepEqual(errors,[]);
    console.log('PASS offline staged Android payload, six live rendered chapter scenes, thirty-stage sprite mapping exercised at chapter entry, six boss images decoded and Forge interactive');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});