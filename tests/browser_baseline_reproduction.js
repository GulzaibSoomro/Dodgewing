const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const assert=require('assert/strict'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(pathToFileURL(path.resolve('../backup/index.html')).href);
 await page.waitForFunction("typeof setFlightLevel==='function'&&$('splash').classList.contains('hide')");
 const evidence=await page.evaluate(()=>{
  renderBlocked=true;start();inv=99;for(let i=0;i<4;i++){st=[{...pl,r:0}];upd(.0001)}
  const fourth={lv,evoStars};setFlightLevel(5);clearBossIntro();B.entry=1;
  const before=B.x;for(let i=0;i<120;i++)bossTick(1/60);
  return {fourth,legacyBodies:ms.filter(m=>m.big&&m.bossSkin===0).length,bodyMoved:B.x!==before,barFraction:1-B.t/B.T,hpFraction:B.hp/B.hpMax,
    resumeAvailable:typeof recoverFlight==='function'};
 });
 assert.equal(evidence.fourth.lv,1);assert.equal(evidence.fourth.evoStars,4);
 assert.equal(evidence.legacyBodies,1);assert.equal(evidence.bodyMoved,false);assert(evidence.barFraction<evidence.hpFraction);assert.equal(evidence.resumeAvailable,false);
 console.log('PASS reproduced reported baseline defects',JSON.stringify(evidence));
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
