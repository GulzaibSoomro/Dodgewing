const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
await page.goto(pathToFileURL(path.resolve('index.html')).href);
await page.waitForFunction("typeof recoverFlight==='function'&&$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
for(const width of [320,360,390,412]){
 await page.setViewportSize({width,height:width===320?568:800});
 await page.locator('.command-dock button:nth-child(5)').tap();
 assert(!/pilot logs|flight modes/i.test(await page.locator('#setc').innerText()));
 const sound=page.locator('#setc .setting button').first(),old=await sound.getAttribute('aria-pressed');await sound.tap();assert.notEqual(await sound.getAttribute('aria-pressed'),old);
 for(const back of ['button','system']){
  await page.getByRole('button',{name:'How to play'}).tap();
  assert.equal(await page.locator('#help h3').count(),6);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('#help .scroll').scrollWidth<=document.querySelector('#help .scroll').clientWidth+1));
  const button=page.locator('#help>.go');assert((await button.boundingBox()).height>=44);
  if(back==='button'){await page.screenshot({path:'test-results/help-'+width+'.png'});await button.tap()}else assert(await page.evaluate(()=>window.handleFlightBack()));
  assert(await page.locator('#settings').isVisible());
 }
 await page.locator('#settings>.go').tap();assert(await page.locator('#menu').isVisible());
}console.log('PASS help navigation, removed entries, toggle, four mobile widths and Android Back callback');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
