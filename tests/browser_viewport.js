// Runtime viewport, safe-area, font-scale and progression regressions.
const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'adaptive-qa','runtime');fs.mkdirSync(out,{recursive:true});
let browser,count=0;const ok=(v,s)=>{if(!v)throw Error(s);count++;console.log('PASS '+s)};
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const nativeInsets of [false,true]){
  const ctx=await browser.newContext({viewport:{width:393,height:873},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/142 Mobile Safari/537.36'});
  await ctx.addInitScript(native=>{if(native)window.DodgewingAds={usesNativeInsets:()=>true}},nativeInsets);
  const p=await ctx.newPage();await p.goto('file:///'+root.replaceAll('\\','/')+'/index.html');
  await p.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
  await p.addStyleTag({content:':root{--safe-top:24px;--safe-right:18px;--safe-bottom:20px;--safe-left:12px}'});
  await p.waitForFunction(({native})=>W===(native?393:363)&&H===(native?873:829),{native:nativeInsets});
  ok(await p.evaluate(native=>{const r=cv.getBoundingClientRect();return r.left===(native?0:12)&&r.top===(native?0:24)},nativeInsets),'safe area applied exactly once; native='+nativeInsets);
  ok(await p.evaluate('DPR===1'), 'Android DPR 3 input remains capped at 1');
  await p.evaluate("start();lv=17;evoStars=80;sp=planeSpeed(lv);pl.x=W*.4;pl.y=H*.6;st=[{x:W*.7,y:H*.3,r:0}];pauseG();window.beforeResize={lv,evoStars,sp,x:pl.x/W,y:pl.y/H,starX:st[0].x/W,starY:st[0].y/H};");
  for(const [w,h]of [[393,813],[800,310],[320,480],[393,873]]){
   await p.setViewportSize({width:w,height:h});await p.waitForTimeout(150);
   ok(await p.evaluate(()=>S==='paused'&&lv===beforeResize.lv&&evoStars===beforeResize.evoStars&&sp===beforeResize.sp&&Math.abs(pl.x/W-beforeResize.x)<.001&&Math.abs(pl.y/H-beforeResize.y)<.001&&Math.abs(st[0].x/W-beforeResize.starX)<.001&&Math.abs(st[0].y/H-beforeResize.starY)<.001),'resize/banner/rotation preserves progression and normalized positions '+w+'x'+h);
  }
  // Reset only this fixture's origin-clean flag: file:// image drawing taints
  // readback. The assertion still checks that rs() preserves a painted pixel.
  ok(await p.evaluate(()=>{cv.width=cv.width;x.fillStyle='#ff1234';x.fillRect(0,0,1,1);const a=Array.from(x.getImageData(0,0,1,1).data);rs();return JSON.stringify(a)===JSON.stringify(Array.from(x.getImageData(0,0,1,1).data))}),'unchanged resize does not clear backing bitmap');
  const cdp=await ctx.newCDPSession(p);const dims=await p.evaluate('({W,H})');await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1.5});await p.waitForTimeout(180);
  ok(await p.evaluate(d=>W===d.W&&H===d.H,dims),'pinch zoom does not resize logical world');await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
  await p.setViewportSize({width:320,height:480});await p.evaluate("document.documentElement.style.fontSize='32px';save.stat.bestLv=30;save.homeSeenLv=30;save.pts=123456789012;save.coins=123456789012;PLANES[0].n='Long aircraft paint label';MIS.forEach(m=>m.t='Complete the long flight briefing and collect stars');menu()");
  await p.waitForTimeout(250);
  for(const [fn,id] of [['menu','menu'],['hangar','hangar'],['flightMap','flight-map'],['settings','settings'],['rewards','rw'],['helpS','help'],['highScores','scores']]){
   await p.evaluate(fn+'()');await p.waitForTimeout(260);
   ok(await p.evaluate(id=>$(id).scrollWidth<=$(id).clientWidth+1&&document.documentElement.scrollWidth<=innerWidth,id),'200% text/long labels no horizontal overflow '+id+' native='+nativeInsets);
   const selector=id==='menu'?'#home-play':'#'+id+' > button';await p.locator(selector).scrollIntoViewIfNeeded();
   ok(await p.evaluate(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),b=$('game-viewport').getBoundingClientRect();return r.top>=b.top-1&&r.bottom<=b.bottom+1&&r.left>=b.left-1&&r.right<=b.right+1},selector),'200% text action reachable '+id);
   await p.screenshot({path:path.join(out,(nativeInsets?'native':'web')+'-200pct-'+id+'.png'),scale:'css'});
  }
  await p.evaluate('hangar()');const coins=await p.evaluate('save.coins');await p.locator('#hup .upgrade-card button').first().click();
  ok(await p.evaluate(c=>save.upg.eng===1&&save.coins===c-40,coins),'real Upgrade Bay purchase click works at 200% text');
  ok(await p.evaluate('LEVEL_COUNT===30 && SPR.length===30 && !renderBlocked && DWDiagnostics.events.length===0'),'all levels/assets and rendering safeguards retained');
  await ctx.close();
 }
 const p=await browser.newPage({viewport:{width:540,height:720},deviceScaleFactor:3});await p.goto('file:///'+root.replaceAll('\\','/')+'/index.html');await p.waitForFunction("typeof DPR!=='undefined'");ok(await p.evaluate('DPR===2'),'desktop DPR remains capped at 2');
 console.log('TOTAL '+count+' passed');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});
