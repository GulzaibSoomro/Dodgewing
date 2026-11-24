// Pause modal, frozen gameplay, countdown and viewport regression checks.
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const path=require('path'),fs=require('fs'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'adaptive-qa','pause-ui');fs.mkdirSync(out,{recursive:true});
let passed=0;function check(value,label){if(!value)throw Error(label);console.log('PASS '+label);passed++}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{for(const [width,height,scale] of [[320,480,1],[320,430,1.3],[390,800,1],[800,310,1.3],[915,412,1]]){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2});const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
 await page.evaluate(async scale=>{document.documentElement.style.fontSize=16*scale+'px';start();inv=999;await new Promise(requestAnimationFrame);pauseG();renderBlocked=true;},scale);
 await page.waitForTimeout(300);
 const tag=width+'x'+height+'@'+scale;
 const geometry=await page.evaluate(()=>{const a=$('pause').getBoundingClientRect(),b=document.querySelector('.pause-card').getBoundingClientRect(),buttons=[...document.querySelectorAll('.pause-actions button')].map(e=>e.getBoundingClientRect());return {a:a.toJSON(),b:b.toJSON(),buttons:buttons.map(r=>r.toJSON()),state:S,hidden:$('pause').classList.contains('hide')}});
 const {a,b,buttons}=geometry;check(geometry.state==='paused'&&!geometry.hidden&&Math.abs((a.top+a.bottom-b.top-b.bottom)/2)<2&&Math.abs((a.left+a.right-b.left-b.right)/2)<2&&buttons.every(r=>r.top>=a.top&&r.bottom<=a.bottom&&r.left>=a.left&&r.right<=a.right&&r.height>=44),tag+' modal centered and buttons visible '+JSON.stringify(geometry));
 check(await page.evaluate(()=>{document.body.classList.add('safe-render');const style=getComputedStyle($('pause'));const ok=(style.backdropFilter==='none'||!style.backdropFilter)&&style.backgroundColor!=='rgba(0, 0, 0, 0)';document.body.classList.remove('safe-render');return ok}),tag+' safe-render dim fallback');
 check(await page.evaluate(()=>{document.body.classList.add('low-graphics');const style=getComputedStyle($('pause'));const ok=(style.backdropFilter==='none'||!style.backdropFilter)&&style.backgroundColor!=='rgba(0, 0, 0, 0)';document.body.classList.remove('low-graphics');return ok}),tag+' low-graphics dim fallback');
 await page.screenshot({path:path.join(out,tag+'.png'),scale:'css'});
 check(await page.evaluate(()=>{pt=[{x:17,y:21,vx:7,vy:8,l:2,m:2,c:'255,255,255',r:2}];ms=[{x:12,y:14,a:0,life:8,v:5}];st=[{x:100,y:100,r:1}];const before=JSON.stringify({pl,ms,st,pt,t,clouds,skyL});upd(1);return JSON.stringify({pl,ms,st,pt,t,clouds,skyL})===before}),tag+' paused world frozen');
 await page.locator('.pause-resume').click();
 check(await page.evaluate(()=>S==='countdown'&&resumeT===3&&$('pause').classList.contains('hide')&&!$('resume-countdown').classList.contains('hide')&&$('joy').classList.contains('hide')&&$('pb').classList.contains('hide')&&$('resume-count').textContent==='3'&&!$('game-viewport').classList.contains('pause-visual')),tag+' countdown begins with controls hidden');
 check(await page.evaluate(()=>{const a=$('game-viewport').getBoundingClientRect(),b=$('resume-count').getBoundingClientRect();return Math.abs((a.left+a.right-b.left-b.right)/2)<2&&Math.abs((a.top+a.bottom-b.top-b.bottom)/2)<25}),tag+' countdown centered');
 check(await page.evaluate(()=>{resume();return S==='countdown'&&resumeT===3}),tag+' repeated resume ignored');
 check(await page.evaluate(()=>{const before=JSON.stringify({pl,ms,st,pt,t,clouds,skyL});upd(1);const two=$('resume-count').textContent==='2';upd(1);return two&&$('resume-count').textContent==='1'&&JSON.stringify({pl,ms,st,pt,t,clouds,skyL})===before}),tag+' countdown 2, 1 keeps world frozen');
 check(await page.evaluate(()=>{const before=JSON.stringify({pl,ms,st,pt,t,clouds,skyL});upd(1);return S==='play'&&$('resume-countdown').classList.contains('hide')&&!$('joy').classList.contains('hide')&&JSON.stringify({pl,ms,st,pt,t,clouds,skyL})===before}),tag+' resumes after countdown without a gameplay jump');
 await page.evaluate(()=>{pauseG();resume();pauseG()});await page.locator('.pause-menu').click();
 check(await page.evaluate(()=>S==='menu'&&$('pause').classList.contains('hide')&&$('resume-countdown').classList.contains('hide')&&!$('game-viewport').classList.contains('pause-visual')&&resumeT===0),tag+' repeated pause and menu clean up');
 check(errors.length===0,tag+' no page errors: '+errors.join(', '));await ctx.close();
 }console.log('TOTAL '+passed+' passed');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
