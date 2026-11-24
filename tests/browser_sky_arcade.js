const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const folder='test-results/sky-arcade';
fs.mkdirSync(folder,{recursive:true});
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
    await context.setOffline(true);
    const page=await context.newPage(),errors=[],metrics=[];
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
    const state=fn=>page.evaluate(fn);
    const tap=selector=>page.locator(selector).first().tap();
    const capture=name=>page.screenshot({path:folder+'/'+name+'.png',animations:'disabled'});
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    await page.waitForFunction("typeof recoverFlight==='function' && $('splash').classList.contains('hide') && $('loading').classList.contains('hide')");
    await state(async()=>{await Promise.all([document.fonts.load('700 36px Oxanium'),document.fonts.load('500 14px Inter')]);renderBlocked=true});
    assert(await state(()=>document.fonts.check('700 36px Oxanium')&&document.fonts.check('500 14px Inter')&&getComputedStyle($('home-mission')).fontFamily.includes('Inter')));
    for(const [width,height] of [[320,480],[360,740],[390,844],[412,915],[768,1024]]){
      await page.setViewportSize({width,height});
      await page.waitForTimeout(120);
      const record=async(name,selectors)=>{
        for(const selector of selectors){
          const el=page.locator(selector).first();await el.scrollIntoViewIfNeeded();
          const r=await el.boundingBox();assert(r&&r.width>0&&r.x>=-1&&r.x+r.width<=width+1&&r.y>=-1&&r.y+r.height<=height+1,name+' '+selector+' '+JSON.stringify(r));
        }
        assert(await state(()=>document.documentElement.scrollWidth<=innerWidth+1));
        metrics.push({name,width,height});
        await state(()=>document.querySelectorAll('.page:not(.hide) .page-content,.page:not(.hide) .scroll').forEach(el=>el.scrollTop=0));
        if(width===390||width===320)await capture(name+'-'+width);
      };
      await state(()=>menu());await record('home',['#thi','#home-play','.command-dock']);
      assert(await state(()=>{const i=$('thi');return i.complete&&i.naturalWidth>=i.getBoundingClientRect().width&&getComputedStyle(i).filter==='none'}));
      await tap('.command-dock button:nth-child(2)');await tap('#tab-aircraft');
      await record('hangar-aircraft',['.showroom-plane button:last-of-type','#aircraft-showroom img','#aircraft-showroom .arcade-primary']);
      await tap('#aircraft-showroom .arcade-primary');await record('hangar-forge',['.forge-slots button','.forge-install']);
      await tap('#tab-paints');await record('hangar-paints',['#hl img','#hl button']);
      await tap('#hangar>.go');await tap('.command-dock button:nth-child(4)');await tap('#daily-tab');
      assert.equal(await page.locator('.daily-item').count(),3);await record('rewards-daily',['#daily-tab','.daily-item']);
      await tap('#achievements-tab');assert.equal(await page.locator('.ai').count(),10);await record('rewards-achievements',['#achievements-tab','.ai']);
      await tap('#rw>.go');await tap('.command-dock button:nth-child(5)');
      const sound=await state(()=>save.snd!==false);await tap('#setc .setting button');assert.notEqual(await state(()=>save.snd!==false),sound);await tap('#setc .setting button');
      await record('settings',['#setc h3','#setc .setting button','#settings>.go']);await tap('#settings>.go');
    }
    console.log('PASS 35 screen/viewport combinations with actual touch navigation, font loading, sprite sizing, settings toggle and horizontal bounds');
    await page.setViewportSize({width:390,height:844});
    await state(()=>{launchCampaign('medium');proTutorial=-1;inv=0;ms=[];msT=99;puT=99;banT=hint=0});
    for(const [key,name] of [['s','shield'],['m','magnet'],['l','slow-motion']]){
      const result=await page.evaluate(k=>{
        shield=mag=slow=0;pu=[{...pl,ty:k}];const before=save.stat.pu;upd(.001);
        const duration=k==='s'?shield:k==='m'?mag:slow;
        pu=[{x:pl.x+55,y:pl.y-54,ty:k}];draw();
        return {duration,count:save.stat.pu-before,signal:fx.some(f=>f.s===PUN[k])};
      },key);
      assert(result.duration>0&&result.count===1&&result.signal);await capture('gameplay-'+name);
      const frozen=await page.evaluate(k=>{
        const value=()=>k==='s'?shield:k==='m'?mag:slow;
        const before=value();pauseG();upd(.5);const held=value()===before;
        menu();if(!recoverFlight())return false;upd(3);const restored=value();upd(.025);return held&&Math.abs(restored-before)<.05&&value()<restored;
      },key);
      assert(frozen,name+' pause and recovery');
    }
    const mechanics=await state(()=>{
      ms=[];st=[{x:pl.x+65,y:pl.y,r:0}];mag=8;const sx=st[0].x;upd(.02);const attraction=st[0].x<sx;
      const missile={x:30,y:220,a:0,h:0,v:100,life:10,phase:0,warning:0};
      ms=[{...missile}];slow=6;upd(.05);const slowed=ms[0].x-30;
      ms=[{...missile}];slow=0;upd(.05);const normal=ms[0].x-30;
      inv=0;shield=4;ms=[{...missile,x:pl.x,y:pl.y}];upd(.001);const guarded=S==='play'&&shield<=0;
      shield=mag=slow=.01;upd(.02);return {attraction,ratio:slowed/normal,guarded,expired:shield<=0&&mag===0&&slow===0};
    });
    assert(mechanics.attraction&&mechanics.guarded&&mechanics.expired&&Math.abs(mechanics.ratio-.55)<.001,JSON.stringify(mechanics));

    await state(()=>{menu();save.pts=1200;save.stat.bestLv=6;hangar('paints')});
    const paint=page.locator('#hl .pc').nth(1);
    await paint.locator('button').tap();
    assert(await state(()=>save.own.includes(1)&&save.pts===800));
    if(await paint.locator('button').isEnabled())await paint.locator('button').tap();
    assert(await state(()=>save.sel===1));await capture('paint-equipped');
    await state(()=>{menu();save.campaign.wallet=54;save.campaign.lifetime=54;hangar('forge');chooseModule('engine')});
    await tap('.forge-install');await tap('.forge-install');
    assert(await state(()=>forgeTier('engine')===1&&save.campaign.wallet===51));await capture('forge-installed');
    await state(()=>{menu();rewards();rewardView('daily')});
    const reward=await state(()=>{
      const m=dayMis(),id=m.list.find(key=>!m.done[key]),mission=MIS.find(o=>o.id===id);
      const points=save.pts;mEvent(mission.k,mission.n);mEvent(mission.k,mission.n);rewards();
      return [save.pts-points,mission.r,!!m.done[id]];
    });
    assert(reward[0]===reward[1]&&reward[2]);await capture('daily-completed');
    await state(()=>{menu();start();save.tutorial=true;proTutorial=-1;shield=4;mag=6;slow=3;draw();pauseG();menu()});
    assert(await page.locator('#resume-flight').isVisible());await capture('home-resume');
    await tap('#resume-flight');await state(()=>{upd(3);hint=0;draw()});await capture('combined-powers');
    assert(await state(()=>shield>0&&mag>0&&slow>0));
    console.log('PASS paint purchase/equip, Forge purchase, exactly-once daily payout, Resume Flight with three active powers');
    assert.deepEqual(errors,[]);fs.writeFileSync(folder+'/measurements.json',JSON.stringify({metrics,mechanics,errors},null,2));
    console.log('PASS three collectible collisions, activation feedback, save/pause/resume, shield absorption, star attraction, 55% missile speed and expiration');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
