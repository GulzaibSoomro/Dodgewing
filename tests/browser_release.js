const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('url'),path=require('path'),fs=require('fs'),assert=require('assert');
let passed=0;const check=(v,m)=>{assert(v,m);console.log('PASS '+m);passed++};
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{fs.mkdirSync('test-results',{recursive:true});
for(const [width,height] of [[320,480],[390,844],[768,1024],[844,390]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await context.setOffline(true);await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
 check(await page.evaluate(()=>SPR.every(im=>im.complete&&im.naturalWidth>0)&&BOSS_SHEET.naturalWidth===360&&RECOVERED_BOSSES.length===6&&RECOVERED_BOSSES.every(im=>im.complete&&im.naturalWidth>1000)),'offline aircraft and six recovered boss assets '+width+'x'+height);
 await page.evaluate(()=>{renderBlocked=true;start();save.controlMode='touch';show(null);});
 const before=await page.evaluate(()=>({x:pl.x,y:pl.y}));
 await page.evaluate(()=>cv.dispatchEvent(new PointerEvent('pointerdown',{pointerId:41,clientX:W*.8,clientY:H*.7,bubbles:true,cancelable:true})));
 check(await page.evaluate(p=>pl.x===p.x&&pl.y===p.y,before),'touch press never teleports '+width);
 check(await page.evaluate(()=>{const p={...pl};upd(.016);return Math.hypot(pl.x-p.x,pl.y-p.y)<=sp*.016+.01&&directPointer===41}),'direct touch displacement bounded by flight speed '+width);
 await page.evaluate(()=>cv.dispatchEvent(new PointerEvent('pointercancel',{pointerId:41})));
 check(await page.evaluate(()=>directTarget===null&&directPointer===null),'touch cancellation releases '+width);
 await page.evaluate(()=>{save.controlMode='joystick';show(null)});const joy=await page.locator('#joy').boundingBox();
 await page.mouse.move(joy.x+joy.width*.8,joy.y+joy.height*.5);await page.mouse.down();
 check(await page.evaluate(()=>jId!==null&&jAng!==null),'joystick captures real pointer '+width);await page.mouse.up();
 check(await page.evaluate(()=>jId===null&&jAng===null),'joystick real pointer release '+width);
 await page.evaluate(()=>{save.stat.bestLv=30;settings()});await page.screenshot({path:'test-results/settings-'+width+'.png'});
 await page.evaluate(()=>{flightModes();startFlightMode('practice',10);renderBlocked=false});await page.waitForTimeout(2800);await page.screenshot({path:'test-results/boss-'+width+'.png'});
 if(width===390)for(const L of [5,10,15,20,25,30]){await page.evaluate(L=>{menu();startFlightMode('practice',L);inv=99;renderBlocked=true;for(let i=0;i<180;i++)upd(1/60);draw()},L);await page.screenshot({path:'test-results/recovered-boss-'+L+'.png'})}
 check(errors.length===0,'no runtime errors '+width+': '+errors.join(', '));await context.close();
}
const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();await page.goto(pathToFileURL(path.resolve('dist/dodgewing.html')).href);await page.waitForFunction("$('loading').classList.contains('hide')&&$('splash').classList.contains('hide')");
check(await page.evaluate(()=>SPR.every(i=>i.naturalWidth>0)),'standalone build embeds aircraft');await context.close();
console.log('TOTAL '+passed+' passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
