// Responsive visual/geometry regression. Run with Playwright (or DW_PLAYWRIGHT_MODULE).
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require(process.env.DW_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),phase=process.env.DW_RESPONSIVE_PHASE||'after';
const out=path.join(root,'adaptive-qa',phase);fs.mkdirSync(out,{recursive:true});
const allSizes=[[320,480],[320,568],[360,640],[360,800],[375,667],[393,873],[412,915],[430,932],[540,720],[640,360],[800,360],[915,412]];
const sizes=process.env.DW_TARGET_LANDSCAPE?allSizes.filter(([w,h])=>w>h):allSizes;
const results=[];let server,browser;
function check(ok,label,details){results.push({ok:!!ok,label,details});if(!ok)console.log('FAIL '+label+' '+JSON.stringify(details||''))}
(async()=>{
 server=http.createServer((req,res)=>{let url=decodeURIComponent(req.url.split('?')[0]),base=root;if(url.startsWith('/_baseline/')){url=url.slice(10);const old=path.join(root,'adaptive-qa/baseline',url);if(fs.existsSync(old))base=path.join(root,'adaptive-qa/baseline');url='/'+url}const file=path.resolve(base,'.'+url);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404).end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const [width,height] of sizes)for(const large of [false,true]){
  const banner=large?50:0,scale=large?1.3:1,dpr=large?3:1;
  const tag=width+'x'+height+(large?'-large-banner':'-default');
  const ctx=await browser.newContext({viewport:{width,height:height-banner},deviceScaleFactor:dpr,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/142 Mobile Safari/537.36'});
  const pg=await ctx.newPage(),errors=[];pg.on('pageerror',e=>errors.push(e.message));
  await pg.goto('http://127.0.0.1:'+server.address().port+(phase==='before'?'/_baseline/':'/')+'index.html');
  await pg.waitForFunction("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')");
  await pg.evaluate(({large,scale})=>{
   document.documentElement.style.fontSize=16*scale+'px';
   save.stat.bestLv=large?30:1;save.homeSeenLv=save.stat.bestLv;save.pts=large?123456789012:0;save.coins=large?987654321012:0;save.cp=large?25:1;
   save.own=large?[0,1,2,3]:[0];save.sel=0;save.m={day:today(),list:['bonus','lvl','surv'],prog:{},done:{}};menu();
  },{large,scale});
  const shot=async name=>{await pg.waitForTimeout(260);await pg.screenshot({path:path.join(out,tag+'-'+name+'.png'),scale:'css'})};
  const geometry=async pairs=>pg.evaluate(pairs=>{
   const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
   const visibleRect=el=>{const r=el.getBoundingClientRect().toJSON();for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=p.getBoundingClientRect();if(/hidden|auto|scroll/.test(s.overflowX)){r.left=Math.max(r.left,b.left);r.right=Math.min(r.right,b.right)}if(/hidden|auto|scroll/.test(s.overflowY)){r.top=Math.max(r.top,b.top);r.bottom=Math.min(r.bottom,b.bottom)}}return r};
   return pairs.flatMap(([a,b])=>{const x=document.querySelector(a),y=document.querySelector(b);if(!x||!y||!x.getClientRects().length||!y.getClientRects().length)return[];return overlap(visibleRect(x),visibleRect(y))?[[a,b]]:[]});
  },pairs);
  const horizontal=async id=>pg.evaluate(id=>{const el=$(id);return {width:el.clientWidth,scroll:el.scrollWidth,document:document.documentElement.scrollWidth,viewport:innerWidth}},id);
  const fits=async(id)=>{const r=await horizontal(id);check(r.scroll<=r.width+1&&r.document<=r.viewport+1,tag+' '+id+' no horizontal overflow',r)};
  const reachable=async(selector,boundary)=>{
   const el=pg.locator(selector);await el.scrollIntoViewIfNeeded();
   return pg.evaluate(({selector,boundary})=>{const r=document.querySelector(selector).getBoundingClientRect(),b=document.querySelector(boundary).getBoundingClientRect();return r.top>=b.top-1&&r.bottom<=b.bottom+1&&r.left>=b.left-1&&r.right<=b.right+1},{selector,boundary});
  };
  await shot('home');await fits('menu');
  check(await pg.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect(), brand=r('.command-brand'),plane=r('.home-plane-stage'),title=r('.plane-identity'),content=r('.home-content'),overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;return !overlap(brand,plane)&&!overlap(brand,title)&&!overlap(r('.plane-step.prev'),title)&&!overlap(r('.plane-step.next'),title)&&plane.bottom<=title.top+1&&title.bottom<=content.bottom+1&&plane.height>0}),tag+' Home brand, aircraft and title fit without overlap');
  let collisions=await geometry([['.pilot-card','.command-wallet'],['.command-wallet','#sn'],['.command-top','.command-brand'],['.command-hero','.command-actions'],['.plane-step.prev','.plane-step.next'],['#home-play','.command-dock']]);
  check(!collisions.length,tag+' Home control intersections',collisions);
  check(await reachable('#home-play','#menu'),tag+' Play reachable');
  if(large)check(await pg.evaluate("save.cp===25 && !$('home-resume')"),tag+' checkpoint data retained without Home shortcut');
  collisions=await geometry([['#home-play','.command-dock']]);check(!collisions.length,tag+' Home actions clear dock',collisions);
  await shot('home-play');
  await pg.evaluate('hangar()');await fits('hangar');await shot('hangar');
  const clipped=await pg.evaluate(()=>{const el=$('hp'),bounds=el.getBoundingClientRect(),walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),bad=[];let node;while(node=walker.nextNode()){const range=document.createRange();range.selectNodeContents(node);for(const r of range.getClientRects())if(r.left<bounds.left-1||r.right>bounds.right+1||r.top<bounds.top-1||r.bottom>bounds.bottom+1)bad.push(node.textContent)}return bad});
  check(!clipped.length,tag+' Hangar balances stay inside counter',clipped);
  collisions=await geometry([['#hangar h2','#hp'],['#hl .pc.sel .rib','#hl .pc.sel img']]);check(!collisions.length,tag+' Hangar title/currency/equipped intersections',collisions);
  check(await reachable('#hup .upgrade-card:last-child',phase==='before'?'#hangar .scroll':'#hangar .page-content'),tag+' last upgrade fully reachable');await shot('hangar-upgrades');
  check(await reachable('#hev .e:last-child',phase==='before'?'#hangar .scroll':'#hangar .page-content'),tag+' last evolution card fully reachable');
  collisions=await geometry([['#hangar .scroll','#hangar > button']]);check(!collisions.length,tag+' Back reserves its own space',collisions);
  if(phase!=='before'){
   for(const [fn,id] of [['flightMap','flight-map'],['rewards','rw'],['settings','settings'],['helpS','help'],['highScores','scores']]){
    await pg.evaluate(fn+'()');await fits(id);
    check(await reachable('#'+id+' > button','#'+id),tag+' '+id+' Back reachable');
    const last='#'+id+' .scroll > :last-child';
    check(await reachable(last,'#'+id+' .page-content'),tag+' '+id+' final item reachable');
    await shot(id);await pg.locator('#'+id+' > button').click();check(await pg.evaluate('menuOn'),tag+' '+id+' Back works');
   }
   await pg.evaluate('start();inv=999');
   check(await pg.evaluate("(()=>{const r=cv.getBoundingClientRect();return Math.abs(r.width-W)<1&&Math.abs(r.height-H)<1&&cv.width===Math.round(W*DPR)&&cv.height===Math.round(H*DPR)&&r.top>=0&&r.bottom<=innerHeight+1})()"),tag+' canvas CSS/backing bounds');
   check(await reachable('#joy','#game-viewport')&&await reachable('#pb','#game-viewport')&&await reachable('#ab','#game-viewport'),tag+' gameplay controls inside viewport');
   const joy=await pg.locator('#joy').boundingBox();await pg.mouse.move(joy.x+joy.width/2,joy.y+joy.height/2);await pg.mouse.down();await pg.mouse.move(joy.x+joy.width*.85,joy.y+joy.height/2);
   check(await pg.evaluate('Math.abs(jAng)<.05'),tag+' joystick maps client coordinates');await pg.mouse.up();
   await shot('gameplay');await pg.locator('#pb').click();await fits('pause');check(await reachable('#pause .go','#pause'),tag+' Resume reachable');await shot('pause');
   await pg.evaluate("S='over';show('over');showRes(123456789,false,'play');refreshContinue();refreshRewardedRescue()");await fits('over');check(await reachable('#over .go','#over'),tag+' Retry reachable');await shot('over');
   await pg.evaluate("show('victory');$('vic').innerHTML='<img class=\"victory-plane\" src=\"'+SPRD[29]+'\"><b>Campaign complete</b><span class=\"victory-score\">123456789 points</span>'");await fits('victory');check(await reachable('#victory .go','#victory'),tag+' Victory action reachable');await shot('victory');
  }
  check(!errors.length,tag+' no page errors',errors);await ctx.close();
  console.log('DONE '+phase+' '+tag);
 }
 const failed=results.filter(r=>!r.ok);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
 console.log('TOTAL '+results.length+' checks; '+failed.length+' failures');if(failed.length&&phase!=='before')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));await browser?.close();server?.close()});
