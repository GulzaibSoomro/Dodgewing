const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
await page.goto(pathToFileURL(path.resolve('index.html')).href);
await page.waitForFunction("typeof recoverFlight==='function'&&$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
await page.evaluate(()=>{renderBlocked=true;save.snd=false;save.music=false;save.tutorial=true;save.campaign=campaignData();});
for(const width of [320,412]){
 await page.setViewportSize({width,height:width===320?568:915});
 await page.evaluate(()=>{menu();save.campaign=campaignData();beginAttempt(1,'stars');for(let i=0;i<8;i++){st=[{...pl,r:0}];upd(.001)}
  mission.fuel=7;shield=mag=slow=4;draw();
  if(mission.count!==8||save.campaign.wallet!==8)throw Error('accounting');
 });
 await page.screenshot({path:'test-results/v21-hud-'+width+'.png'});
 await page.evaluate(()=>{pauseG();openFlightForge();chooseModule('fuel')});
 await page.locator('.forge-install').tap();await page.locator('.forge-install').tap();
 assert(await page.evaluate(()=>save.campaign.flight.count===8&&save.campaign.wallet===4));
 await page.evaluate(()=>{menu();recoverFlight();upd(3);mission.fuel=.001;upd(.001)});
 assert(await page.locator('#over').isVisible());assert.match(await page.locator('#res').innerText(),/Wallet ★ 4/);
 assert.match(await page.locator('#over h1').innerText(),/Fuel Empty/);
 await page.screenshot({path:'test-results/v21-failure-'+width+'.png'});await page.locator('#over-retry').tap();
 assert(await page.evaluate(()=>mission.fuel===90&&mission.count===0&&save.campaign.wallet===4));
}
console.log(await page.evaluate(()=>{menu();save.campaign=campaignData({wallet:26,lifetime:26});for(let i=0;i<4;i++){
 if(!beginAttempt(1,'stars')||mission.fuel!==[60,90,120,150][i])throw Error('capacity '+i);
 menu();if(i<3&&!buyModule(1,'fuel',i+1))throw Error('purchase');
}if(save.campaign.wallet!==0||buyModule(1,'fuel',4)||buyModule(1,'armor',1))throw Error('bounds');
return 'PASS 60/90/120/150 seconds, exact cumulative cost, two small HUDs, retained mission progress after spending, fuel failure and quick retry';
}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
