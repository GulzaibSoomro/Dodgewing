"""30-stage campaign integration and viewport checks. No real device testing.
DW_BROWSER_JITLESS=1 python3 tests/browser_campaign.py [url]
"""
import asyncio, os, pathlib, sys, shutil
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
URL=sys.argv[1] if len(sys.argv)>1 else (ROOT/'index.html').as_uri()
passed=failed=0
def browser_options():
 args=['--js-flags=--jitless'] if os.environ.get('DW_BROWSER_JITLESS') else []
 executable=os.environ.get('DW_BROWSER_EXECUTABLE') or next(filter(None,(shutil.which(name) for name in ('chromium','chromium-browser','google-chrome'))),None)
 return {'args':args,**({'executable_path':executable} if executable else {})}
def check(condition,label):
 global passed,failed
 if condition: passed+=1
 else: failed+=1
 print(('PASS  ' if condition else 'FAIL  ')+label,flush=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(**browser_options())
  for width,height in [(360,640),(390,800),(412,915),(800,390),(1280,800)]:
   page=await browser.new_page(viewport={'width':width,'height':height},has_touch=width<900)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   # Deterministic stepping; real pointer interaction is covered by browser_smoke.py.
   await page.add_init_script('window.requestAnimationFrame=()=>0')
   await page.goto(URL);await page.evaluate('document.fonts.ready');await page.wait_for_function('BASE_SPR.every(i=>i.complete&&i.naturalWidth)')
   # This suite freezes animation scheduling for deterministic campaign stepping.
   # The real splash/loading sequence is exercised in browser_smoke.py.
   await page.evaluate("$('splash').classList.add('hide');$('loading').classList.add('hide')")
   label=f'{width}x{height}'
   check(await page.evaluate("(()=>{const r=$('mb').getBoundingClientRect();return (r.top>=$('mh').getBoundingClientRect().bottom||r.left>=$('mh').getBoundingClientRect().right)&&r.bottom<=$('ad').getBoundingClientRect().top&&document.documentElement.scrollWidth<=innerWidth})()"),label+' menu fits above ad strip')
   await page.evaluate('layoutShow();draw()')
   if width==390:await page.screenshot(path='/tmp/dw-menu.png')
   await page.evaluate('hangar()')
   check(await page.locator('#hev .e').count()==30,label+' Hangar has all 30 stages')
   await page.locator('#hev .e').last.scroll_into_view_if_needed()
   check(await page.locator('#hev .e').last.is_visible(),label+' final stage is reachable by scrolling')
   if width==390:await page.screenshot(path='/tmp/dw-hangar.png')
   await page.evaluate('start();autoFire=false;inv=999')
   result=await page.evaluate('''()=>{const issues=[],bosses=[];for(let n=1;n<=145;n++){
    if(st.length!==1){issues.push('star count before '+n);break}
    pl.x=st[0].x;pl.y=st[0].y;ms=[];pu=[];upd(0);draw();
    if(lv!==Math.min(30,1+Math.floor(n/5)))issues.push('level '+n);
    let final=false;if(B){bosses.push([lv,B.k]);if(st.length!==0)issues.push('boss stars');final=B.k==='final';endBoss();if(final&&S!=='victory')issues.push('victory screen')}
    if(!final&&st.length!==1)issues.push('star count after '+n);
   }return {issues,bosses,lv,stars,evoStars,victory:S==='victory'}}''')
   check(result['issues']==[] and result['lv']==30 and result['stars']==145,label+' complete 145-star / 30-stage campaign '+str(result['issues']))
   check(result['bosses']==[[9,'heavy'],[17,'cmdr'],[25,'adv'],[30,'final']],label+' four bosses trigger in order')
   check(result['victory'],label+' final challenge opens victory screen')
   await page.evaluate('skyL=30;draw()')
   if width==390:await page.screenshot(path='/tmp/dw-level30.png')
   check(await page.evaluate('nightAmt(skyL)===1'),label+' final stage reaches night sky')
   await page.evaluate("S='play';st=[{x:pl.x,y:pl.y,r:0}]")
   await page.evaluate('hurt();draw()')
   check(await page.evaluate('lv===28&&st.length===1'),label+' damage regresses two levels without duplicating star')
   await page.evaluate('die();upd(1);draw()')
   check(await page.is_visible('#over'),label+' game-over summary opens')
   check(await page.evaluate("(()=>{const r=$('over').querySelector('.row').getBoundingClientRect();return r.bottom<=$('ad').getBoundingClientRect().top&&r.top>=0})()"),label+' Retry/Menu controls fit')
   await page.evaluate('start();draw()');check(await page.evaluate('lv===1&&stars===0&&st.length===1'),label+' restart resets campaign')
   check(not errors,label+' no JavaScript exceptions '+str(errors))
   await page.close()
  await browser.close()
 print(f'TOTAL {passed} passed, {failed} failed')
asyncio.run(main());sys.exit(bool(failed))
