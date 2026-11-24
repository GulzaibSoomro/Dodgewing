const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
 const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
 const errors=[];p.on('pageerror',e=>{errors.push(e.message);console.error('PAGE',e.message)});
 const ready=async()=>{await p.waitForFunction("typeof setupLevel==='function'&&$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");await p.evaluate(()=>{renderBlocked=true;save.snd=false;save.music=false;save.tutorial=true})};
 const shot=n=>p.screenshot({path:'test-results/'+n+'.png',animations:'disabled'});
 await p.goto(pathToFileURL(path.resolve(process.env.DW_ENTRY||'index.html')).href);await ready();
 await p.locator('#home-play').tap();assert.equal(await p.locator('.mission-card').count(),30);assert.equal(await p.locator('.mission-card:enabled').count(),1);await shot('campaign-map');
 await p.locator('.mission-card').first().tap();await shot('level-briefing');assert(!/easy|medium|hard/i.test(await p.locator('#scorec').innerText()));await p.getByRole('button',{name:'Play',exact:true}).tap();
 const play=await p.evaluate(()=>({S,lv,phase:mission.phase,wallet:save.campaign.wallet,stars:st.length,fuel:mission.fuel}));assert.deepEqual(play,{S:'play',lv:1,phase:'stars',wallet:0,stars:1,fuel:60});
 await p.evaluate(()=>{draw()});await shot('level-1');
 const evalChecks=async(name,fn)=>{await p.evaluate(fn);console.log('PASS '+name)};
 await evalChecks('one pickup, pause, independent timers, locked access',()=>{
   function ok(v){if(!v)throw Error('timing invariant')}
   ok(!beginAttempt(2,'stars'));slow=6;mag=8;st=[{...pl,r:0}];upd(.001);
   ok(mission.count===1&&save.campaign.wallet===1&&mission.gap===2&&!st.length);
   pauseG();const fuel=mission.fuel;upd(4);ok(fuel===mission.fuel&&mission.gap===2);
   resume();upd(3);upd(.5);ok(mission.fuel===fuel-.5&&mission.gap===1.5&&!st.length);draw();
 });
 await shot('star-pickup-cooldown');await p.evaluate(()=>{pauseG();menu()});await p.reload();await ready();await p.locator('#resume-flight').tap();
 await evalChecks('relaunch preserves paid star and remaining cooldown',()=>{
   upd(3);if(st.length||mission.count!==1||save.campaign.wallet!==1||mission.gap!==1.5||slow<=0||mag<=0)throw Error('restore');
   upd(1.499);if(st.length)throw Error('early');upd(.001);if(st.length!==1)throw Error('late');
   for(let i=1;i<8;i++){st=[{...pl,r:0}];upd(.001)}
   mission.fuel=.2;draw();
 });await shot('low-fuel');await p.evaluate(()=>upd(.2));await shot('fuel-empty');
 assert(await p.evaluate(()=>!mission&&S==='over'&&save.campaign.wallet===8));
 await p.locator('#over-retry').tap();assert(await p.evaluate(()=>mission.count===0&&mission.fuel===60));
 await p.evaluate(()=>{pauseG();openFlightForge();chooseModule('fuel')});await p.locator('.forge-install').tap();await p.locator('.forge-install').tap();await shot('aircraft-1-forge');
 await evalChecks('aircraft-specific pricing, failed purchases and saved fuel upgrade',()=>{
   const c=save.campaign;
   if(c.wallet!==4||aircraftStats(1).fuel!==90||aircraftStats(2).fuel!==60||c.flight.fuel!==90||buyModule(1,'fuel',1)||buyModule(1,'fuel',2)||buyModule(1,'weapons',1))throw Error('forge');
   recoverFlight();upd(3);for(let i=0;i<19;i++){st=[{...pl,r:0}];upd(.001)}mission.fuel=.001;st=[{...pl,r:0}];upd(.001);
   if(S!=='play'||mission?.phase!=='boss'||mission.fuel!==90||c.flight?.phase!=='boss'||c.completed||c.wallet!==24||c.checkpoints[0]!==true)throw Error('last-star priority');
 });await shot('automatic-boss-entry');await p.reload();await ready();
 await evalChecks('checkpoint locks star phase, boss retry retains wallet and aircraft',()=>{
   if(beginAttempt(2,'boss')||beginAttempt(1,'stars')||!retryLevel()||B.k!=='heavy'||lv!==1||mission.fuel!==90)throw Error('checkpoint');
   mission.fuel=.001;upd(.001);if(mission||save.campaign.checkpoints[0]!==true||save.campaign.wallet!==24)throw Error('boss failure');
   retryLevel();clearBossIntro();B.entry=1;B.t=B.T-.001;upd(.003);
   if(save.campaign.completed!==1||unlockedLevelCount()!==2||mission||B)throw Error('outlast');
 });await shot('level-complete');await p.evaluate(()=>{selectLevel(2);hangar('forge')});await shot('aircraft-2-forge');
 await evalChecks('30 independent aircraft profiles, persisted purchases, measurable equipment and single difficulty scaling',()=>{
   const check=(v,label)=>{if(!v)throw Error(label)};
   menu();
   save.campaign=campaignData({completed:30,wallet:20000,lifetime:20000});
   save.upg={eng:4,shield:4,magnet:4,weapon:4};
   check(engineBoost()===1&&weaponBoost()===1&&shieldTime()===5&&magnetRange()===260,'legacy stacking');
   for(let level=1;level<=30;level++){
     const c=save.campaign;
     c.selected=level;
     check(Object.values(c.planes[level-1]).every(rank=>rank===0),'initial ranks '+level);
     for(const [key,module] of Object.entries(FORGE_CONFIG)){
       if(key==='weapons'&&!WPN[level]){
         check(!buyModule(level,key,1),'unarmed purchase');continue;
       }
       for(let rank=1;rank<=3;rank++){
         const wallet=c.wallet;
         check(buyModule(level,key,rank)&&!buyModule(level,key,rank),'purchase '+key);
         check(c.wallet===wallet-module.prices[rank-1],'price '+key);
       }
     }
     check(aircraftStats(level).fuel===150,'fuel upgrade');
   }
   const stored=loadLevelProfile().campaign;
   check(JSON.stringify(stored.planes)===JSON.stringify(save.campaign.planes)&&stored.wallet===save.campaign.wallet,'purchase persistence');
   const close=(a,b)=>Math.abs(a-b)<.00001;
   {
     const {speed,spawn,warning}=cfgFor(1).pressure;const final=cfgFor(30).pressure;
     beginAttempt(4,'stars');
     check(mission.fuel===150,'upgraded fuel capacity');
     for(let rank=1;rank<=3;rank++){
       Object.assign(save.campaign.planes[3],{engine:rank,armor:rank,weapons:rank,defense:rank});
       jAng=pl.a+1;const angle=pl.a;upd(.01);
       check(close(pl.a-angle,3.4*.01*[1,1.04,1.08,1.12][rank]),'actual turn '+rank);
       armorCooldown=0;check(absorbImpact()&&!absorbImpact()&&armorCooldown===[0,70,55,40][rank],'armor cooldown');
       abilityCd=shield=jammerTime=inv=0;useAbility();
       check(rank===1?shield>=1:jammerTime===2,'defense');
       if(rank===3)check(inv===1.5,'defense guard');
       autoFire=true;bl=[];wLv=0;fireTick(.31);
       check(bl.length===(rank===1?1:2)&&close(bl[0].d,rank===1?1.06:.58),'weapon behavior '+rank);
       if(rank===3){const b=bl[0];b.v=0;bl=[b];ms=[{x:b.x,y:b.y,hp:2,r:1}];bulletTick(.001);check(bl.length===1,'pierce');ms.push({...ms[0]});bulletTick(.001);check(!bl.length,'pierce limit');}
     }
     menu();beginAttempt(1,'stars');msT=0;upd(.001);
     check(close(ms[0].v,150*.55*speed)&&close(msT,2.8*spawn)&&close(ms[0].warning,.5*warning-.001),'missile scaling');
     menu();save.campaign.checkpoints[29]=true;beginAttempt(30,'boss');
     check(B.hp===Math.round(180*final.hp)&&B.T===48,'final hp/time');
     clearBossIntro();B.entry=1;B.t=17;B.cd=0;bossTick(.001);
     check(B.phase===2&&close(B.wn,.9*final.warning),'phase two warning');
     bossTick(B.wn+.001);
     check(ms.length>0&&close(ms[0].v,sp*.65*cfgFor(30).projectile*final.speed),'boss projectile');
     B.t=34;bossTick(.001);check(B.phase===3,'phase three');
     commitFlight();menu();check(recoverFlight()&&mission.level===30&&B.phase!==0,'recover boss');
     menu();
   }
 });
 await evalChecks('background, malformed snapshots, optional practice isolation and terminal mirrors',()=>{
   menu();save.campaign=campaignData();beginAttempt(1,'stars');upd(.05);
   window.dispatchEvent(new Event('pagehide'));const fuel=mission.fuel;upd(10);
   if(S!=='paused'||mission.fuel!==fuel)throw Error('background fuel');
   menu();const f=save.campaign.flight;
   for(const change of [{level:31},{level:0},{phase:'unknown'},{phase:'boss'},{count:20},{gap:2.01},{fuel:0},{x:Infinity},{armor:-1}]){
     if(validFlight({...f,...change}))throw Error('invalid flight '+JSON.stringify(change));
   }
   const original=JSON.stringify(f);
   save.stat.bestLv=5;
   if(!startFlightMode('practice',5))throw Error('practice entry');
   upd(.05);menu();
   if(JSON.stringify(save.campaign.flight)!==original||!recoverFlight()||lv!==1||mission.phase!=='stars')throw Error('practice damaged saved flight');
   upd(3);die();
   for(const key of [LEVEL_KEY,MIRROR_KEY])if(JSON.parse(localStorage.getItem(key)).campaign.flight!==null)throw Error('terminal save '+key);
 });
 await evalChecks('schema 2 active boss flight and records migrate once without losing equipment or wallet',()=>{
   for(const mode of ['easy','medium','hard']){
     menu();save.campaign=campaignData({completed:4,selected:5,wallet:17,lifetime:35});
     save.campaign.checkpoints[4]=true;save.campaign.planes[4].engine=2;
     beginAttempt(5,'boss');B.t=7;B.hp-=5;commitFlight();menu();
     const legacy=JSON.parse(JSON.stringify(save));legacy.campaign.schema=2;legacy.campaign.difficulty=mode;
     legacy.campaign.flight.mode=mode;legacy.campaign.checkpoints[4]=mode;legacy.modeBest={[mode]:87};legacy.campaign.records[0].mode=mode;
     for(const key of [LEVEL_KEY,MIRROR_KEY])localStorage.setItem(key,JSON.stringify(legacy));
     save=loadLevelProfile();const c=save.campaign;
     if(c.schema!==3||c.completed!==4||c.wallet!==17||c.planes[4].engine!==2||c.checkpoints[4]!==true||'mode' in c.flight||c.records[0].mode!==mode||save.modeBest[mode]!==87||!recoverFlight()||!B||B.t!==7)throw Error('migration '+mode);
     menu();if(loadLevelProfile().campaign.wallet!==17)throw Error('duplicate migration');
   }
 });
 const combinations=await p.evaluate(()=>{
   let rows=0;
   {
    save.campaign=campaignData();menu();
    for(let n=1;n<=30;n++){
     const c=cfgFor(n),type=n===30?30:5*(1+(n-1)%5);
     if(n>1){
       const before=cfgFor(n-1).pressure,now=c.pressure;
       if(!(now.speed>before.speed&&now.spawn<before.spawn&&now.warning<before.warning&&now.interval<before.interval&&now.hp>before.hp&&now.missileCap>=before.missileCap))throw Error('pressure curve '+n);
     }
     if(!beginAttempt(n,'stars')||lv!==n||c.target!==20+2*Math.floor((n-1)/5)||B||st.length!==1)throw Error('entry '+n);
     inv=9999;for(let i=0;i<c.target;i++){if(i){mission.gap=.001;upd(.001)}if(st.length!==1)throw Error('spawn '+n);Object.assign(st[0],{x:pl.x,y:pl.y});upd(.001);if(lv!==n)throw Error('evolution')}
     if(S!=='play'||mission?.phase!=='boss'||save.campaign.completed!==n-1||B.L!==type||B.hp!==Math.round(c.hp*levelPressure().hp)||st.length)throw Error('boss '+n);
     clearBossIntro();bossTick(1.2);if(n%2===0&&WPN[n]){B.hp=.1;bl=[{x:B.x,y:B.y,a:0,v:0,d:3,w:2,life:1}]}else B.t=B.T-.001;
     upd(.002);if(mission||B||save.campaign.completed!==n||unlockedLevelCount()!==Math.min(30,n+1))throw Error('clear '+n);
     rows++;
    }
    if(!save.campaign.core||save.campaign.wallet!==750||beginAttempt(31,'stars'))throw Error('final');
    const wins=save.stat.wins;beginAttempt(30,'boss');B.entry=1;B.hp=0;endBoss();if(save.stat.wins!==wins)throw Error('duplicate final reward');
   }
   return rows;
 });assert.equal(combinations,30);console.log('PASS 30 progressive campaign levels including all aircraft, 750 objective pickups, combat and survival, sequential unlocks, final replay');
 for(const [n,name] of [[1,'boss-1'],[5,'boss-5'],[30,'final-boss']]){
  await p.evaluate(n=>{beginAttempt(n,'boss');clearBossIntro();inv=100;for(let i=0;i<190;i++)upd(1/60);if(n===30){B.t=B.T*.75;upd(.016);if(B.phase!==3)throw Error('phase')}draw()},n);await shot(name);await p.evaluate(()=>menu());
 }
 for(const [width,height] of [[320,480],[360,800],[390,844],[412,915],[768,1024]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>flightMap());const card=p.locator('.mission-card').last();await card.scrollIntoViewIfNeeded();const r=await card.boundingBox();assert(r.width>0&&r.x>=0&&r.x+r.width<=width+1&&r.height>=44);await card.tap();await p.evaluate(()=>hangar('forge'));await p.locator('.forge-install').scrollIntoViewIfNeeded();assert(await p.locator('.forge-install').isVisible());await p.evaluate(()=>{beginAttempt(30,'boss');clearBossIntro();bossTick(1.2);mag=slow=shield=4;mission.fuel=8;draw()});await shot('hud-'+width);await p.evaluate(()=>menu());
 }
 console.log('PASS five viewport sizes, map access, Forge and low-fuel/boss/powers HUD');
 assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
