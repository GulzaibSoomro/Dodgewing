/* Chromium regression checks. Requires Playwright; optional DW_PLAYWRIGHT_MODULE and CHROME_BINARY. */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'repair-qa');fs.mkdirSync(out,{recursive:true});
const binary=process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let browser,server,passed=0;
const timeout=setTimeout(()=>{console.error('Browser suite timed out');browser?.close();process.exit(1)},120000);
function check(value,label){if(!value)throw Error(label);console.log('PASS '+label);passed++}
(async()=>{
 server=require('http').createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
  try{
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    const content=fs.readFileSync(file);
    if(file.endsWith('17-skybound-ui.js'))setTimeout(()=>res.end(content),300);
    else res.end(content);
  }catch{res.writeHead(404).end()}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:binary,headless:true,timeout:20000,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
 const context=await browser.newContext(),page=await context.newPage(),session=await context.newCDPSession(page);
 const send=(method,params={})=>session.send(method,params);
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text+': '+r.exceptionDetails.exception?.description);return r.result.value};
 const until=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(100)}throw Error('Timed out: '+expression)};
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/142 Mobile Safari/537.36'});
 for(const entry of ['index.html','android/app/src/main/assets/www/dodgewing.html']){
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:800,deviceScaleFactor:3,mobile:true});
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+entry);
  await until("typeof S!=='undefined' && $('splash').classList.contains('hide') && $('loading').classList.contains('hide')");
  await evaluate('Promise.all(SPR.map(image=>image.decode()))');
  const startupEvents=await evaluate('DWDiagnostics.events');
  if(startupEvents.length)throw Error(entry+' startup diagnostics '+JSON.stringify(startupEvents));
  check(await evaluate("DWDiagnostics.events.length===0 && SPR.length===30 && SPR.every(i=>i.naturalWidth>0)"),entry+' startup and all aircraft decoded');
  check(await evaluate("$('campaign-map').children.length===0"),'map stays unbuilt at startup');
  check(await evaluate("DPR===1 && cv.width===W && cv.height===H && getComputedStyle(cv).display!=='none'"),'bounded visible Android canvas');
  await evaluate("window.drawCount=0;window.originalDraw=draw;draw=function(){drawCount++;originalDraw()};window.mutations=0;window.observer=new MutationObserver(m=>mutations+=m.length);observer.observe($('menu'),{childList:true,subtree:true})");
  await delay(1100);
  const stats=await evaluate('({draws:drawCount,mutations,hidden:document.hidden,events:DWDiagnostics.events,blocked:renderBlocked})');
  check(stats.draws>=1&&stats.draws<=12&&stats.mutations===0&&!stats.blocked&&stats.events.length===0,'Home render cap and stable DOM: '+JSON.stringify(stats));
  await evaluate('observer.disconnect();draw=originalDraw;save.stat.bestLv=30;menu();flightMap();window.firstMap=$("campaign-map").firstChild;menu();previewHomePlane(-1);flightMap()');
  check(await evaluate("$('campaign-map').querySelectorAll('.mission-card').length===30 && $('campaign-map').firstChild===firstMap"),'30-level map reuses unchanged DOM');
  await evaluate('menu()');
  for(const [width,height] of [[320,480],[360,640],[390,800],[412,915],[540,720],[800,360]]){
   await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:3,mobile:true});
   await until("W===innerWidth && H<=innerHeight && cv.width===W && cv.height===H");
   check(await evaluate("W===innerWidth && H<=innerHeight && cv.width===W && cv.height===H"),'canvas resize '+width+'x'+height);
   await evaluate("$('home-play').scrollIntoView({block:'center'})");
   check(await evaluate("(()=>{const b=$('home-play').getBoundingClientRect(),d=document.querySelector('.command-dock').getBoundingClientRect();return b.left>=0&&b.right<=innerWidth+1&&b.top>=0&&b.bottom<=d.top+1&&d.bottom<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth})()"),'Play reachable above dock '+width+'x'+height);
   const snap=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,entry.startsWith('index')?'source-'+width+'x'+height+'.png':'android-'+width+'x'+height+'.png'),Buffer.from(snap.data,'base64'));
  }
  await evaluate('start();inv=999');await delay(200);
  check(await evaluate("S==='play' && !$('joy').classList.contains('hide')"),'Home to gameplay');
  check(await evaluate("(()=>{const p=x.getImageData(0,0,cv.width,cv.height).data;let lit=0;for(let i=0;i<p.length;i+=400)if(p[i]+p[i+1]+p[i+2]>40)lit++;return lit>100})()"),'gameplay canvas has visible pixels');
  await evaluate('pauseG()');check(await evaluate("S==='paused'"),'pause');
  await evaluate('resume()');await until("S==='play'");check(true,'resume countdown');
  await evaluate('window.adCalls=0;window.DodgewingAds={onGameOver(){adCalls++;finishAdBreak(adScreenSerial)},requestRewardedRescue(){}};die()');await until("S==='over'");
  check(await evaluate('adCalls===1'),'game over notifies native ads once');
  await evaluate('requestRewardedRescue();onRewardedRescueResult(false)');check(await evaluate("S==='over'"),'failed reward never resumes');
  await evaluate('requestRewardedRescue();onRewardedRescueResult(true)');check(await evaluate("S==='play'"),'earned rescue resumes');
  await evaluate('window.goodDraw=draw;window.failOnce=true;draw=function(){if(failOnce){failOnce=false;throw Error("injected transient render failure")}goodDraw()}');await until("S==='paused'");await delay(200);
  check(await evaluate("S==='paused' && !renderBlocked && DWDiagnostics.events.some(e=>e.kind==='frame')"),'transient render exception pauses safely and loop survives');
  await evaluate('draw=goodDraw;cv.dispatchEvent(new Event("contextlost",{cancelable:true}))');
  check(await evaluate('canvasLost && !!$("render-recovery")'),'context loss has visible recovery');
  await evaluate('cv.dispatchEvent(new Event("contextrestored"))');check(await evaluate('!canvasLost && !$("render-recovery")'),'context restoration');
  await evaluate('draw=function(){throw Error("injected persistent render failure")}');await until('renderBlocked');
  check(await evaluate('renderBlocked && !!$("render-recovery")'),'recurring render failures stop and show recovery');
 }
 console.log('TOTAL '+passed+' passed');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{clearTimeout(timeout);await browser?.close();server?.close()});
