// Browser-side ad bridge regression; Android SDK callbacks still require device tests.
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const path=require('path'),{pathToFileURL}=require('url');
let count=0;function check(value,label){if(!value)throw Error(label);console.log('PASS '+label);count++}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const ctx=await browser.newContext({viewport:{width:320,height:480},isMobile:true,hasTouch:true});
 await ctx.addInitScript(()=>{window.__ads={screen:'',serial:0,privacy:true,opened:0,requests:0,over:0};window.DodgewingAds={usesNativeInsets:()=>false,setGameScreen:(s,n)=>{__ads.screen=s;__ads.serial=n},isPrivacyOptionsRequired:()=>__ads.privacy,showPrivacyOptions:()=>__ads.opened++,onGameOver:()=>__ads.over++,requestRewardedRescue:()=>__ads.requests++}});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);await page.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
 check(await page.evaluate(()=>__ads.screen==='menu'),'Home reports menu screen');
 check(await page.evaluate(()=>{hangar();return __ads.screen==='hangar'}),'Hangar reports screen');
 check(await page.evaluate(()=>{settings();return __ads.screen==='settings'&&!!document.querySelector('#privacy-options-row button')}),'Settings exposes required privacy control');
 await page.locator('#privacy-options-row button').click();check(await page.evaluate(()=>__ads.opened===1),'privacy control calls native bridge');
 check(await page.evaluate(()=>{__ads.privacy=false;window.onPrivacyOptionsChanged();return !document.querySelector('#privacy-options-row')}),'privacy control is removed when not required');
 check(await page.evaluate(()=>{__ads.privacy=true;window.onPrivacyOptionsChanged();const b=document.querySelector('#privacy-options-row button');b.scrollIntoView();const r=b.getBoundingClientRect();if(r.width<44||r.height<44||r.left<0||r.right>innerWidth)throw Error('Privacy bounds '+JSON.stringify(r)+' viewport '+innerWidth);return true}),'privacy control remains accessible on a small screen');
 check(await page.evaluate(()=>{start();return __ads.screen==='play'&&S==='play'}),'active gameplay reports play');
 check(await page.evaluate(()=>{pauseG();const p=__ads.screen==='pause';resume();return p&&__ads.screen==='resume-countdown'}),'Pause and countdown are non-banner states');
 check(await page.evaluate(()=>{upd(3);t=45;die();upd(1);return S==='over'&&__ads.screen==='over'&&adBreakPending&&__ads.over===1}),'game over starts a guarded interstitial decision');
 check(await page.evaluate(()=>{const s=adScreenSerial;start();menu();return S==='over'&&adScreenSerial===s}),'Retry and Menu cannot race an interstitial decision');
 check(await page.evaluate(()=>{const bad=!window.claimInterstitialDecision(adScreenSerial-1),ok=window.claimInterstitialDecision(adScreenSerial);finishAdBreak(adScreenSerial-1);const locked=adBreakPending;finishAdBreak(adScreenSerial);return bad&&ok&&locked&&!adBreakPending}),'only the matching decision claims and unlocks navigation');
 check(await page.evaluate(()=>{const ok=requestRewardedRescue();return ok&&rewardedRescuePending&&__ads.requests===1&&!requestRewardedRescue()}),'reward is opt-in and duplicate taps are blocked');
 check(await page.evaluate(()=>{start();menu();return S==='over'&&rewardedRescuePending}),'navigation cannot abandon a pending rewarded ad');
 check(await page.evaluate(()=>{onRewardedRescueResult(false);return !rewardedRescuePending&&S==='over'}),'cancelled or failed ad grants no rescue');
 const id='12345678-1234-4123-8123-123456789abc';
 check(await page.evaluate(id=>receiveNativeRescue(id,8)&&receiveNativeRescue(id,8)&&save.nativeRescueCredit.level===8,id),'verified reward delivery is idempotent');
 await page.reload();await page.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
 check(await page.evaluate(id=>save.nativeRescueCredit.id===id&&!$('reward-credit-home').classList.contains('hide'),id),'earned rescue survives WebView reload');
 check(await page.evaluate(()=>{const b=$('reward-credit-home').getBoundingClientRect(),dock=document.querySelector('.command-dock').getBoundingClientRect();return b.width>=44&&b.height>=44&&b.top>=0&&b.bottom<=innerHeight&&b.bottom<=dock.top+1}),'rescue control stays visible above navigation on a small screen');
 check(await page.evaluate(()=>redeemNativeRescue()&&S==='play'&&lv===1&&rewardedRescueUsed&&!save.nativeRescueCredit),'earned rescue is redeemed once at the saved level');
 check(await page.evaluate(id=>receiveNativeRescue(id,8)&&!save.nativeRescueCredit&&!redeemNativeRescue(),id),'replayed reward callback cannot grant another rescue');
 await page.reload();await page.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
 check(await page.evaluate(id=>save.nativeRescueInFlight?.id===id&&!save.nativeRescueCredit&&recoverFlight()&&lv===1&&rewardedRescueUsed,id),'recreation resumes the redeemed flight once at its saved level');
 check(await page.evaluate(()=>{upd(3);die();return !save.nativeRescueInFlight&&!save.nativeRescueCredit}),'completed rescued flight consumes its recovery credit');
 check(errors.length===0,'no browser exceptions: '+errors.join(', '));console.log('TOTAL '+count+' passed');await ctx.close();
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
