// Seeded, non-proof gameplay probe. Runtime state can still make repeats vary.
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const path=require('path'),{pathToFileURL}=require('url');
const root=process.env.DW_BENCH_ROOT?path.resolve(process.env.DW_BENCH_ROOT):path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const ctx=await browser.newContext({viewport:{width:320,height:480},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/142 Mobile Safari/537.36'});
 const page=await ctx.newPage();await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
 const rows=await page.evaluate(()=>{renderBlocked=true;save.vibe=false;save.tutorial=true;const rows=[];
  for(let L=1;L<=30;L++){const outcomes=[];for(const style of ['straight','alternate','avoid']){
   let seed=1000+L;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);start();lv=L;sp=planeSpeed(L);skyL=L;inv=0;msT=.5;st=[];if(BOSS[L])startBoss(L);
   let overlapFrames=0,peakMissiles=0,steps=0;
   for(;steps<400&&S==='play';steps++){st=[];keys={};jAng=null;
    if(style==='alternate')keys[Math.floor(steps/35)%2?'ArrowLeft':'ArrowRight']=true;
    if(style==='avoid'&&ms.length){let near=ms[0],distance=Infinity;for(const m of ms){const q=Math.hypot(m.x-pl.x,m.y-pl.y);if(q<distance){distance=q;near=m}}jAng=Math.atan2(pl.y-near.y,pl.x-near.x)}
    upd(.05);peakMissiles=Math.max(peakMissiles,ms.length);let overlap=false;for(let i=0;i<ms.length&&!overlap;i++)for(let j=i+1;j<ms.length;j++)if(Math.hypot(ms[i].x-ms[j].x,ms[i].y-ms[j].y)<20*((ms[i].r||1)+(ms[j].r||1))){overlap=true;break}if(overlap)overlapFrames++;
   }outcomes.push({style,survivalSeconds:Number((steps*.05).toFixed(2)),peakMissiles,overlapFrames});
  }rows.push({level:L,boss:!!BOSS[L],outcomes})}return rows});
 for(const row of rows)console.log(JSON.stringify(row));console.log('TOTAL '+rows.length+' levels, '+(rows.length*3)+' simulated runs');await ctx.close();
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
