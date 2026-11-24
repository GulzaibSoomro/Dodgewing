const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  for(const file of ['dist/dodgewing.html','android/app/src/main/assets/www/dodgewing.html']){
   const context=await browser.newContext({offline:true,viewport:{width:360,height:740}});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   await page.goto(pathToFileURL(path.resolve(file)).href);
   await page.waitForFunction("typeof recoverFlight==='function'&&$('loading').classList.contains('hide')&&$('splash').classList.contains('hide')");
   const view=await page.evaluate(async()=>{
    const families=await Promise.all([document.fonts.load('600 20px Oxanium'),document.fonts.load('700 20px Oxanium'),document.fonts.load('400 14px Inter'),document.fonts.load('500 14px Inter')]);
    const src=getComputedStyle(document.querySelector('.hangar-scene')).backgroundImage.match(/url\("(.*?)"\)/)[1];
    const image=new Image();image.src=src;await image.decode();
    hangar('forge');return {families:families.map(list=>list.map(f=>f.family)),sky:image.naturalWidth,plane:$('thi').naturalWidth};
   });
   assert(view.families.every(a=>a.length));assert(view.sky>0&&view.plane>0);assert.deepEqual(errors,[]);
   console.log('PASS offline '+file+' '+JSON.stringify(view));await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});