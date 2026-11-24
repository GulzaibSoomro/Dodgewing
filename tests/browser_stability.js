// Isolated browser regression checks for static paused/countdown rendering.
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const path=require('path'),fs=require('fs'),http=require('http');
const root=process.env.DW_BENCH_ROOT?path.resolve(process.env.DW_BENCH_ROOT):path.resolve(__dirname,'..');
let passed=0;function check(v,label){if(!v)throw Error(label);console.log('PASS '+label);passed++}
(async()=>{const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch(_){res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const context=await browser.newContext({viewport:{width:390,height:800},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/142 Mobile Safari/537.36'});
 const page=await context.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');await page.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");await page.evaluate(()=>document.fonts.ready);
 const pixels=await page.evaluate(()=>{start();inv=999;save.tutorial=true;lv=9;skyL=9;bl=[{x:W*.3,y:H*.3,a:0,v:0,d:1,life:2,h:1,c:'#fff',w:5}];ms=[];pt=[];B=null;pauseG();renderBlocked=true;
  function same(){draw();const first=x.getImageData(0,0,cv.width,cv.height).data;draw();const second=x.getImageData(0,0,cv.width,cv.height).data;let differences=0;for(let i=0;i<first.length;i++)if(first[i]!==second[i])differences++;return differences}
  const paused=same();resume();const countdown=same();return{paused,countdown}});
 check(pixels.paused===0,'paused canvas remains pixel-stable; differing channels='+pixels.paused);
 check(pixels.countdown===0,'countdown canvas remains pixel-stable; differing channels='+pixels.countdown);
 await page.evaluate(()=>{pauseG();renderBlocked=false;window.__drawCount=0;const original=draw;draw=function(){window.__drawCount++;return original()}});
 await page.waitForTimeout(2200);
 const frameCount=await page.evaluate(()=>window.__drawCount);
 check(frameCount>0&&frameCount<=25,'paused scene redraw is bounded over 2.2 seconds: '+frameCount);
 await page.setViewportSize({width:320,height:480});await page.waitForTimeout(400);
 check(await page.evaluate(({previous})=>S==='paused'&&W===320&&H===480&&cv.width===320&&cv.height===480&&window.__drawCount>previous,{previous:frameCount}),'paused scene still redraws after viewport resize');
 check(await page.evaluate(()=>{start();const el=$('joy'),r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:23,clientX:r.left+r.width*.8,clientY:r.top+r.height*.5}));const active=jAng!==null;el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:23}));return active&&jAng===null&&jId===null}),'joystick pointer down/up resets steering');
 check(await page.evaluate(()=>{start();jAng=1;jId=23;keys.ArrowLeft=true;Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));const paused=S==='paused'&&jAng===null&&jId===null&&!keys.ArrowLeft;delete document.hidden;resume();upd(3);return paused&&S==='play'&&jAng===null&&!keys.ArrowLeft}),'background visibility pauses and clears steering through resume');
 console.log('TOTAL '+passed+' passed');await context.close();
 }finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
