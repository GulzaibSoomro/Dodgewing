"""Font loading and 1.6x aircraft regression checks; server must already be running.
Usage: python3 tests/browser_typography_scale.py http://127.0.0.1:5500/
"""
import asyncio
import os
import pathlib
import shutil
import sys

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = sys.argv[1] if len(sys.argv) > 1 else (ROOT / 'index.html').as_uri()
passed = failed = 0


def browser_options():
    args = ['--js-flags=--jitless'] if os.environ.get('DW_BROWSER_JITLESS') else []
    executable = os.environ.get('DW_BROWSER_EXECUTABLE') or next(
        filter(None, (shutil.which(name) for name in ('chromium', 'chromium-browser', 'google-chrome'))), None)
    return {'args': args, **({'executable_path': executable} if executable else {})}


def check(condition, label):
    global passed, failed
    if condition:
        passed += 1
    else:
        failed += 1
    print(('PASS  ' if condition else 'FAIL  ') + label, flush=True)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(**browser_options())
        for width, height in [(390, 800), (1280, 800)]:
            options = {'viewport': {'width': width, 'height': height}, 'has_touch': width < 900}
            if width == 390:
                options['user_agent'] = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'
            page = await browser.new_page(**options)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('requestfailed', lambda request: errors.append('request failed: ' + request.url))
            await page.add_init_script('window.requestAnimationFrame=()=>0')
            await page.goto(URL)
            await page.wait_for_function('SPR.every(im=>im.complete&&im.naturalWidth>0)', polling=100)
            label = f'{width}x{height} '

            for family, weight in [('Barlow Semi Condensed', 500), ('Barlow Semi Condensed', 600), ('Oxanium', 600), ('Oxanium', 700)]:
                result = await page.evaluate('''async ({family,weight})=>{
                    const spec=weight+' 24px "'+family+'"',loaded=await document.fonts.load(spec,'Dodgewing 0123456789');
                    const unquote=s=>s.replace(/["']/g,'');
                    return loaded.length>0&&document.fonts.check(spec)&&loaded.every(face=>
                        unquote(face.family)===family&&face.status==='loaded'&&Array.from(document.fonts).includes(face));
                }''', {'family': family, 'weight': weight})
                check(result, label + family + ' ' + str(weight) + ' is a loaded registered font face')

            check(await page.evaluate('''()=>{
                const family=selector=>getComputedStyle(document.querySelector(selector)).fontFamily;
                return family('#mh h1').includes('Oxanium')&&family('#menu .go').includes('Barlow Semi Condensed')&&family('#menu .chip').includes('Oxanium');
            }'''), label + 'heading, button and score use their intended font families')

            check(await page.evaluate('''()=>{
                x.save();const text='Flight 1234567890';x.font=canvasFont(20,600);const ui=x.measureText(text).width,uiFont=x.font;
                x.font='600 20px "Barlow Semi Condensed"';const direct=x.measureText(text).width;
                x.font='600 20px monospace';const fallback=x.measureText(text).width;
                x.font=canvasFont(20,700,'score');const score=x.measureText(text).width,scoreFont=x.font;
                x.font='700 20px Oxanium';const directScore=x.measureText(text).width;x.restore();
                return uiFont.includes('Barlow Semi Condensed')&&scoreFont.includes('Oxanium')&&ui>0&&score>0&&Math.abs(ui-direct)<.01&&Math.abs(ui-fallback)>1&&Math.abs(score-directScore)<.01;
            }'''), label + 'canvas text measures with the loaded UI and score fonts')

            check(await page.evaluate('sz()===Math.max(48,Math.min(78,Math.min(W,H)*.11))&&PLAYER_DRAW_SCALE===1.6'), label + 'physics size stays original while artwork uses the requested 1.6x scale')
            for pop in [1, 1.3]:
                dimensions = await page.evaluate('''pop=>{
                    const original=x.drawImage,issues=[];let call=null;
                    x.drawImage=function(...args){call=args};
                    try{for(let i=0;i<30;i++){
                        call=null;drawSpr(i,1,pop);const im=SPR[i],oldScale=sz()/Math.max(im.naturalWidth,im.naturalHeight)*pop;
                        if(!call||call.length!==5||Math.abs(call[3]-im.naturalWidth*oldScale*PLAYER_DRAW_SCALE)>.00001||Math.abs(call[4]-im.naturalHeight*oldScale*PLAYER_DRAW_SCALE)>.00001)issues.push(i+1);
                    }}finally{x.drawImage=original}return issues;
                }''', pop)
                check(not dimensions, label + f'all 30 player sprites are exactly 1.6x at animation scale {pop}: {dimensions}')

            check(await page.evaluate('''()=>{
                start();autoFire=false;st=[];pu=[];obs=[];lv=5;evoStars=20;msT=99;
                const base=sz();ms=[{x:pl.x+base*.3,y:pl.y,a:0,life:8,v:0,h:0,r:1}];upd(0);
                const outside=lv===5&&inv===0;ms[0].x=pl.x+base*.2;upd(0);
                return outside&&lv===3&&inv>0;
            }'''), label + 'missiles hit only inside the original collision core')

            check(await page.evaluate('''()=>{
                start();autoFire=false;ms=[];pu=[];obs=[];msT=99;const base=sz();
                st=[{x:pl.x+base*.45,y:pl.y,r:0}];upd(0);const starOutside=stars===0;
                st[0].x=pl.x+base*.3;upd(0);const starInside=stars===1;st=[];
                pu=[{x:pl.x+base*.5,y:pl.y,ty:'s'}];upd(0);const powerOutside=shield===0;
                pu[0].x=pl.x+base*.3;upd(0);return starOutside&&starInside&&powerOutside&&shield>0;
            }'''), label + 'star and power-up collection distances retain their original boundaries')

            check(await page.evaluate('''()=>{
                start();autoFire=true;lv=6;bl=[];pl={x:W/2,y:H/2,a:.7};wLv=0;fireTick(.3);
                const offsets=[-15,-6,6,15],f=sz()*.35*PLAYER_DRAW_SCALE;
                return bl.length===4&&bl.every((b,i)=>Math.abs(b.x-(pl.x+Math.cos(pl.a)*f-Math.sin(pl.a)*offsets[i]*PLAYER_DRAW_SCALE))<.00001&&Math.abs(b.y-(pl.y+Math.sin(pl.a)*f+Math.cos(pl.a)*offsets[i]*PLAYER_DRAW_SCALE))<.00001);
            }'''), label + 'wing and nose muzzle positions follow the 1.6x aircraft at a rotated heading')

            check(await page.evaluate('''()=>{
                for(let level=1;level<=3;level++){start();lv=level;autoFire=true;fireTick(10);if(bl.length)return false}return true;
            }'''), label + 'opening three levels still do not auto-fire')
            check(await page.evaluate('MISSILE_DRAW_SIZE===48'), label + 'normal missiles retain their 48px draw size')

            await page.wait_for_function("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')&&$('loading-count').textContent==='100%'", polling=100)
            await page.evaluate("save.tutorial=true;start();lv=14;evoStars=65;skyL=14;sp=planeSpeed(lv);pl={x:W/2,y:H*.48,a:-Math.PI/2};st=[{x:W*.65,y:H*.3,r:0}];ms=[];pu=[];obs=[];hint=0;stars=65;runCoins=260;shield=4;mag=6;slow=3;syncAbilityButton();draw()")
            if width == 390:
                await page.screenshot(path='/tmp/dodgewing-fonts-plane.png')
            check(not errors, label + 'no browser errors: ' + str(errors))
            await page.close()

        page = await browser.new_page(viewport={'width': 390, 'height': 800}, has_touch=True)
        fallback_errors = []
        page.on('pageerror', lambda error: fallback_errors.append(str(error)))
        await page.add_init_script('''window.failedFontLoads=0;
            document.fonts.load=()=>{window.failedFontLoads++;return Promise.reject(new Error('Simulated font failure'))};''')
        await page.goto(URL)
        await page.wait_for_function("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')", polling=100)
        menu_visible = await page.is_visible('#menu')
        await page.click('#menu .go')
        check(menu_visible and await page.evaluate("window.failedFontLoads>=4&&S==='play'&&$('menu').classList.contains('hide')") and not fallback_errors,
              'failed font loads still finish startup and leave Play usable without browser errors: ' + str(fallback_errors))
        await page.close()
        await browser.close()
    print(f'TOTAL {passed} passed, {failed} failed', flush=True)


asyncio.run(main())
sys.exit(bool(failed))
