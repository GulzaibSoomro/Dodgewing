const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
await page.goto(pathToFileURL(path.resolve('index.html')).href);
await page.waitForFunction("typeof recoverFlight==='function'&&$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
console.log(await page.evaluate(()=>{
 renderBlocked=true;save.tutorial=true;beginAttempt(1,'stars');ms=[];obs=[];pl.x=W/2;pl.y=H/2;
 const all=[],bins=[0,0,0,0];
 for(const heading of [0,Math.PI,Math.PI/2,-Math.PI/2,null]){
  const coords=[];pl.a=heading??0;jAng=heading;sp=heading===null?0:150;
  for(let seed=1;seed<=8;seed++){let x=seed;const rand=()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);
   for(let i=0;i<128;i++){st=[];spawnMissionStar(rand);spawnMissionStar(rand);const q=st[0];
    if(st.length!==1||q.x<24||q.x>W-24||q.y<Math.min(134,H*.3)||q.y>H-24)throw Error('bounds or uniqueness');
    coords.push([q.x,q.y]);if(!all.length)bins[Number(q.x>=W/2)+2*Number(q.y>=(H-24+Math.min(134,H*.3))/2)]++;
   }
  }all.push(JSON.stringify(coords));
 }
 if(new Set(all).size!==1||bins.some(n=>n<160||n>350))throw Error('direction/distribution '+bins);
 st=[];obs=[{ty:'mine',x:W/2,y:H/2,r:2*Math.max(W,H)}];
 spawnMissionStar(()=>.5);if(st.length)throw Error('fully obstructed field');
 obs=[];upd(.001);if(st.length!==1)throw Error('retry after obstruction');
 for(const fps of [30,60]){
  menu();save.campaign=campaignData();start();msT=puT=obT=99;st=[{...pl,r:0}];slow=mag=8;upd(1/fps);
  const fuel=mission.fuel;pauseG();upd(1);if(mission.gap!==2||mission.fuel!==fuel)throw Error('pause');resume();upd(3);
  for(let i=1;i<2*fps;i++){upd(1/fps);if(st.length)throw Error('early')}
  upd(1/fps);if(st.length!==1||save.campaign.wallet!==1||mission.count!==1||Math.abs(fuel-mission.fuel-2)>1e-7)throw Error('timers or wallet');
  menu();
 }return 'PASS 5120 placements, matched direction distributions '+bins+'; pause, fuel and one credit at 30/60 FPS';
}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
