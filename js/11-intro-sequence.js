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
  function loadImage(src){return new Promise(done=>{const img=new Image();let settled=false,finish=()=>{if(settled)return;settled=true;progress();done()};img.onload=finish;img.onerror=finish;img.src=src;setTimeout(finish,2800)})}
  const featured=SPRD[Math.min(LEVEL_COUNT-1,29)]||SPRD[0]||'';
  $('loading-plane').src=featured;
  const sprites=Promise.all(sources.map(loadImage));
  const fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
  fonts.then(()=>progress('Calibrating flight controls'),()=>progress('Calibrating flight controls'));
  async function begin(){
    await pause(1050);
    splash.classList.add('intro-leave');loading.classList.remove('hide');setTimeout(()=>loading.classList.add('intro-show'),16);
    await Promise.all([sprites,fonts,pause(700)]);
    complete=total;bar.style.width='100%';count.textContent='100%';copy.textContent='Flight ready';
    await pause(360);
    loading.classList.add('intro-leave');
    await pause(420);
    splash.classList.add('hide');loading.classList.add('hide');
    window.dispatchEvent(new Event('dodgewingready'));
  }
  begin();
})();
