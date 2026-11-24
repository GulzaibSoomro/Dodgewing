// 11-intro-sequence.js: startup splash and asset-aware loading screen.
// Kept separate so the game can initialize under the screens without delaying input setup.
(()=>{
  if(typeof document==='undefined'||typeof document.querySelector!=='function')return;
  const splash=$('splash'),loading=$('loading'),bar=$('loading-bar'),count=$('loading-count'),copy=$('loading-copy');
  if(!splash||!loading||!bar||!count||!copy)return;
  const pause=ms=>new Promise(done=>setTimeout(done,ms));
  const sources=[...new Set([...(SPRD||[]),typeof MISSILE_SHEET_SRC==='string'?MISSILE_SHEET_SRC:'',typeof BOSS_SHEET_SRC==='string'?BOSS_SHEET_SRC:''].filter(Boolean))],total=sources.length+1;
  let complete=0;
  function progress(message){complete=Math.min(total,complete+1);const percent=Math.round(complete/total*100);bar.style.width=percent+'%';count.textContent=percent+'%';if(message)copy.textContent=message}
  async function loadImage(src){
    const existing=[...SPR,MISSILE_SHEET,BOSS_SHEET].find(img=>img.getAttribute&&img.getAttribute('src')===src);
    const img=existing||new Image();
    await new Promise(done=>{
      let settled=false;
      const finish=error=>{if(settled)return;settled=true;if(error)DWDiagnostics.report('asset',error);progress();done()};
      img.addEventListener('load',()=>finish(),{once:true});
      img.addEventListener('error',()=>finish('image load failed: '+sources.indexOf(src)),{once:true});
      if(!existing)img.src=src;
      if(img.complete)finish(img.naturalWidth?null:'image unavailable: '+sources.indexOf(src));
      setTimeout(()=>finish('image load timed out: '+sources.indexOf(src)),4000);
    });
    if(img.naturalWidth&&img.decode)await Promise.race([img.decode().catch(()=>DWDiagnostics.report('asset','image decode failed: '+sources.indexOf(src))),pause(2000)]);
  }
  const featured=SPRD[Math.min(LEVEL_COUNT-1,29)]||SPRD[0]||'';
  $('loading-plane').src=featured;
  const sprites=Promise.all(sources.map(loadImage));
  const fonts=document.fonts&&document.fonts.load?Promise.all([
    document.fonts.load('700 32px Oxanium'),document.fonts.load('600 22px Oxanium'),
    document.fonts.load('500 16px "Barlow Semi Condensed"'),document.fonts.load('600 18px "Barlow Semi Condensed"')
  ]).then(()=>document.fonts.ready).catch(()=>{}):Promise.resolve();
  // A failed font request keeps the system fallback; it must not block startup.
  const readyFonts=Promise.race([fonts,pause(4000).then(()=>{if(document.fonts&&document.fonts.status==='loading')DWDiagnostics.report('fonts','startup timeout; using fallback')})]);
  readyFonts.then(()=>progress('Calibrating flight controls'));
  async function begin(){
    await pause(1050);
    splash.classList.add('intro-leave');loading.classList.remove('hide');setTimeout(()=>loading.classList.add('intro-show'),16);
    await Promise.all([sprites,readyFonts,pause(700)]);
    complete=total;bar.style.width='100%';count.textContent='100%';copy.textContent='Flight ready';
    await pause(360);
    loading.classList.add('intro-leave');
    await pause(420);
    splash.classList.add('hide');loading.classList.add('hide');
    window.dispatchEvent(new Event('dodgewingready'));
  }
  begin();
})();
