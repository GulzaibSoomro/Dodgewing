"""Interactive Command Hangar home-screen checks; server must be running.
Usage: python3 tests/browser_command_hangar.py http://127.0.0.1:5500/
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
    executable = os.environ.get('DW_BROWSER_EXECUTABLE') or next(
        filter(None, (shutil.which(name) for name in ('chromium', 'chromium-browser', 'google-chrome'))), None)
    return {'executable_path': executable} if executable else {}


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
        for width, height in [(360, 640), (390, 800), (800, 390), (1280, 800)]:
            page = await browser.new_page(viewport={'width': width, 'height': height}, has_touch=width < 900)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('requestfailed', lambda request: errors.append('request failed: ' + request.url))
            await page.goto(URL)
            await page.wait_for_function("$('splash').classList.contains('hide')&&$('loading').classList.contains('hide')")
            await page.wait_for_function('SPR.every(im=>im.complete&&im.naturalWidth>0)')
            label = f'{width}x{height} '

            await page.evaluate('''()=>{
                save.stat.bestLv=18;save.stat.runs=5;save.homeSeenLv=18;save.pts=1234;save.coins=90;save.cp=10;
                save.top=[{score:7654,level:18,stars:84,time:113,date:today()}];
                save.m={day:today(),list:['stars','boss','pu'],prog:{stars:7,boss:1},done:{boss:1}};
                menu();
            }''')
            await page.wait_for_timeout(80)

            check(await page.evaluate('''()=>{
                const ids=['menu','mh','mb','home-play'],dock=document.querySelector('.command-dock');
                return ids.every(id=>{const r=$(id).getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1})&&
                    (()=>{const r=dock.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()&&document.documentElement.scrollWidth<=innerWidth;
            }'''), label + 'command layout and one-thumb controls fit the viewport')
            check(await page.locator('.command-dock button').count() == 5, label + 'bottom dock has Home, Hangar, Map, Rewards and Settings')
            check(await page.evaluate("$('pilot-rank').textContent==='ACE CAPTAIN'&&$('pilot-call').textContent==='PILOT DW-06'"), label + 'pilot identity reflects campaign rank and run number')
            check(await page.evaluate("$('home-plane-level').textContent.startsWith('LEVEL 18')&&$('thi').getAttribute('src')===SPRD[17]&&$('menu').dataset.world==='3'"), label + 'large hero plane and living world match Level 18')
            check(await page.evaluate("getComputedStyle($('menu')).getPropertyValue('--plane').trim()==='#ffb347'"), label + 'plane paint drives dynamic hangar lighting')
            check(await page.evaluate("$('boss-radar-name').textContent.includes('ADVANCED')&&$('boss-radar-distance').textContent==='7 levels away'"), label + 'radar previews the next boss and distance')
            check(await page.evaluate("$('daily-title').textContent==='Collect 15 stars'&&$('daily-progress').textContent==='7 / 15'&&$('daily-bar').style.width==='47%'"), label + 'daily flight briefing shows mission progress')
            check(await page.evaluate("$('reward-count').textContent==='1 / 3'&&$('reward-crate').classList.contains('ready')"), label + 'reward crate shows completed briefing state')
            check(await page.evaluate("$('stats').textContent.includes('7654 pts')&&$('stats').textContent.includes('Level 18')"), label + 'return card shows the previous best flight')
            check(await page.is_visible('#home-resume') and await page.evaluate("$('home-resume').textContent.includes('LEVEL 10')"), label + 'checkpoint return action appears when affordable')
            check(await page.locator('#home-route .route-node').count() == 6, label + 'compact six-world flight route is present')

            await page.click('#home-plane-stage')
            check(await page.evaluate("$('home-plane-stage').classList.contains('inspect')&&$('plane-inspector').textContent.includes('ENGINE')&&$('plane-inspector').textContent.includes('ABILITY')"), label + 'tapping the aircraft opens engine, weapon and ability inspection')
            await page.evaluate('previewHomePlane(-1)')
            check(await page.evaluate("$('home-plane-level').textContent.startsWith('LEVEL 17')&&$('thi').getAttribute('src')===SPRD[16]"), label + 'aircraft carousel moves through unlocked planes')
            await page.evaluate('previewHomePlane(0,17)')

            await page.click('#boss-radar')
            check(await page.is_visible('#flight-map') and await page.locator('#campaign-map .map-level').count() == 30, label + 'radar opens the complete 30-level campaign map')
            check(await page.locator('#campaign-map .map-level.boss').count() == 4 and await page.locator('#campaign-map .map-level.unlocked').count() == 18, label + 'map marks four bosses and unlocked aircraft')
            await page.locator('#campaign-map .map-level.unlocked').nth(9).click()
            check(await page.is_visible('#menu') and await page.evaluate("$('home-plane-level').textContent.startsWith('LEVEL 10')"), label + 'map selection returns to the chosen plane in the hangar')

            await page.evaluate('save.homeSeenLv=17;save.stat.bestLv=18;menu()')
            check(await page.evaluate("save.homeSeenLv===18&&$('home-plane-stage').classList.contains('unlock-show')&&$('home-unlock-name').textContent.includes('LEVEL 18')"), label + 'new unlock returns with a spotlight celebration')

            await page.mouse.move(width * .75, height * .35)
            check(await page.evaluate("getComputedStyle($('menu')).getPropertyValue('--px').trim()!==''"), label + 'pointer movement drives bounded scene parallax')
            check(await page.evaluate("getComputedStyle($('mh').querySelector('h1')).fontFamily.includes('Oxanium')&&getComputedStyle($('home-play')).fontFamily.includes('Barlow Semi Condensed')"), label + 'display and interface typography keep their intended roles')
            check(await page.evaluate("getComputedStyle(document.querySelector('.plane-aura')).animationName==='hangar-breathe'&&getComputedStyle($('reward-crate').querySelector('svg')).animationName==='crate-ready'"), label + 'hero lighting and ready reward use contextual animation')

            await page.click('#home-play')
            check(await page.evaluate("S==='play'&&AC!==null") and await page.is_visible('#joy'), label + 'Continue Flight transitions ambient home audio into gameplay')
            check(not errors, label + 'has no browser errors: ' + str(errors))
            if width in (390, 800):
                await page.evaluate('menu()')
                await page.wait_for_timeout(2000)
                await page.screenshot(path=f'/tmp/dodgewing-command-{width}x{height}.png')
            await page.close()

        await browser.close()
    print(f'TOTAL {passed} passed, {failed} failed', flush=True)


asyncio.run(main())
sys.exit(bool(failed))
