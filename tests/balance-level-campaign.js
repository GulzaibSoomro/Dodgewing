const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
const p=await b.newPage({viewport:{width:390,height:844}});await p.goto(pathToFileURL(path.resolve('index.html')).href);
await p.waitForFunction("typeof setupLevel==='function' && $('loading').classList.contains('hide') && $('splash').classList.contains('hide')");
const data=await p.evaluate(()=>{
 renderBlocked=true;save.tutorial=true;save.snd=false;save.music=false;
 const samples=[];
 function fly(level,policy,rank,boss,seed){
   let r=seed+135;Math.random=()=>((r=(Math.imul(r,1664525)+1013904223)>>>0)/4294967296);
   menu();save.campaign=campaignData({completed:level-1});save.campaign.planes[level-1].fuel=rank;
   const equipment=rank===3?3:rank===2?1:0;
   Object.assign(save.campaign.planes[level-1],{armor:equipment,engine:equipment,weapons:level>3?equipment:0,defense:equipment});
   if(boss)save.campaign.checkpoints[level-1]=true;
   if(!beginAttempt(level,boss?'boss':'stars'))throw Error('entry '+level);
   let firstFour=null,frames=0,lastFuel=0;
   while(mission&&frames++<10000){
     lastFuel=mission.fuel;
     // Follow actual pickups and steer a continuous patrol through the cooldown.
     // Steering is bounded by the same turn-rate limit as the joystick.
     const target=st[0],movingCenter={x:W*(.5+.28*Math.cos(t*1.15+(boss?seed*.9:0))),y:H*(.5+.13*Math.sin(t*1.15+(boss?seed*.9:0)))};
     const point=target||movingCenter;
     let dx=point.x-pl.x,dy=point.y-pl.y;
     if(policy==='wrap'){
       dx-=Math.round(dx/W)*W;dy-=Math.round(dy/H)*H;
     }
     let desired=Math.atan2(dy,dx);
     if(policy==='wrap'){
       const gate=obs.find(o=>o.ty==='gate'&&Math.abs(o.y-pl.y)<105&&Math.abs(pl.x-o.gap)>o.gw*.40);
       if(gate)desired=Math.atan2(pl.y>=gate.y?75:-75,gate.gap-pl.x);
     }
     const near=ms.filter(m=>Math.hypot(m.x-pl.x,m.y-pl.y)<(policy==='wrap'?90:63)).sort((a,b)=>Math.hypot(a.x-pl.x,a.y-pl.y)-Math.hypot(b.x-pl.x,b.y-pl.y))[0];
     if(near){if(abilityCd<=0)useAbility();if(!shield&&inv<=0)desired=Math.atan2(pl.y-near.y,pl.x-near.x)}
     if(boss&&B&&Math.hypot(B.x-pl.x,B.y-pl.y)<85)desired=Math.atan2(pl.y-B.y,pl.x-B.x);
     jAng=desired;upd(1/60);
     if(stars>=4&&firstFour===null)firstFour=t;
   }
   const won=boss?save.campaign.completed===level:!!save.campaign.checkpoints[level-1];
   samples.push({level,policy,rank,boss,seed,stars,firstFour,seconds:+t.toFixed(2),end:won?'success':lastFuel<.02?'fuel':'impact'});
 }
 for(const level of [1,5,6,10,15,20,25,26,27,28,29,30])for(const rank of [0,2,3]){
   for(const policy of ['direct','wrap'])for(let seed=1;seed<=4;seed++){
     fly(level,policy,rank,false,seed);fly(level,policy,rank,true,seed);
   }
 }
 // Also measure the first affordable tank before other equipment is installed.
 for(const policy of ['direct','wrap'])for(let seed=1;seed<=4;seed++)fly(1,policy,1,false,seed);
 return samples;
});
fs.writeFileSync('test-results/v21-balance.json',JSON.stringify(data,null,2));
assert.equal(data.length,584);console.log('PASS 584 seeded flights');
}finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});