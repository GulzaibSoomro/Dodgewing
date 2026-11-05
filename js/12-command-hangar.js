// 12-command-hangar.js: interactive home hangar, campaign route and briefing.
// The moving sky stays on the existing canvas; the bounded DOM scene remains
// lightweight on Android WebViews and is fully disabled by Reduced Motion.
(()=>{
  if(typeof document==='undefined'||typeof document.querySelector!=='function')return;

  const menuEl=$('menu'),stageEl=$('home-plane-stage');
  if(!menuEl||!stageEl)return;
  const bossLevels=[9,17,25,30];
  let homePreview=Math.max(0,Math.min(LEVEL_COUNT-1,(save.stat.bestLv||1)-1));
  let homePinnedPreview=false,homeMusicT=.4,dragStart=null,dragMoved=false,suppressHomeClick=false;
  const clampLevel=n=>Math.max(1,Math.min(LEVEL_COUNT,Math.floor(Number(n)||1)));
  const unlockedLevel=()=>clampLevel(save.stat.bestLv||1);
  const worldFor=L=>Math.max(0,Math.min(5,Math.floor((clampLevel(L)-1)/5)));
  const worldName=i=>(PRO_WORLDS[i]&&PRO_WORLDS[i].n)||ZONES[i]||'FLIGHT ZONE';
  const weaponName=L=>(WPN[L]&&WPN[L].n)||'Evasive flying';

  function pilotRank(L){
    if(L>=30)return['Ω','LEGEND OF THE SKIES'];
    if(L>=26)return['C','FLIGHT COMMANDER'];
    if(L>=21)return['W','WING COMMANDER'];
    if(L>=16)return['A','ACE CAPTAIN'];
    if(L>=11)return['A','COMBAT ACE'];
    if(L>=6)return['W','WING PILOT'];
    return['R','ROOKIE WING'];
  }
  function currentMission(){
    const daily=dayMis(),items=daily.list.map(id=>MIS.find(m=>m.id===id)).filter(Boolean);
    return items.find(m=>!daily.done[m.id])||items[0]||MIS[0];
  }
  function inspectorText(L){
    const ability=typeof abilityFor==='function'?abilityFor(L):null;
    return 'ENGINE: '+planeSpeed(L)+' · WEAPON: '+weaponName(L).toUpperCase()+' · ABILITY: '+(ability?ability.n:'EVASIVE FLIGHT');
  }
  function renderRoute(L){
    const active=worldFor(L),bestWorld=worldFor(unlockedLevel());
    $('home-route').innerHTML=PRO_WORLDS.map((world,i)=>{
      const target=Math.min(unlockedLevel()-1,i*5+Math.min(4,Math.max(0,L-1-i*5)));
      const cls=(i<=bestWorld?' done':'')+(i===active?' current':'');
      return '<button class="route-node'+cls+'" onclick="previewHomePlane(0,'+Math.max(0,target)+')" aria-label="'+world.n+'"><small>'+(i+1)+'</small></button>';
    }).join('');
  }
  function renderBossRadar(best){
    const next=bossLevels.find(L=>L>best),button=$('boss-radar');
    if(!next){$('boss-radar-name').textContent='CAMPAIGN CLEAR';$('boss-radar-distance').textContent='Final route secured';button.classList.add('clear');return}
    button.classList.remove('clear');$('boss-radar-name').textContent=BOSS[next]?BOSS[next].n.toUpperCase():'UNKNOWN THREAT';
    $('boss-radar-distance').textContent=(next-best)+' level'+(next-best===1?'':'s')+' away';
  }
  function renderBriefing(){
    const daily=dayMis(),mission=currentMission(),progress=Math.min(mission.n,Number(daily.prog[mission.id])||0),done=!!daily.done[mission.id],complete=daily.list.filter(id=>daily.done[id]).length;
    $('daily-title').textContent=mission.t;$('daily-progress').textContent=done?'COMPLETE':progress+' / '+mission.n;
    $('daily-bar').style.width=Math.round((done?mission.n:progress)/mission.n*100)+'%';
    $('reward-count').textContent=complete+' / '+daily.list.length;$('reward-crate').classList.toggle('ready',complete>0);
  }
  function renderLastFlight(){
    const card=$('stats'),last=Array.isArray(save.top)&&save.top.length?save.top[0]:null;
    card.innerHTML=last?'<span>BEST FLIGHT</span><b>'+Math.max(0,Number(last.score)||0)+' pts · Level '+clampLevel(last.level)+'</b><em>Flight log ›</em>':'<span>LAST FLIGHT</span><b>No flight recorded</b><em>Start your first run ›</em>';
  }
  function renderMap(){
    const best=unlockedLevel(),bossSet=new Set(bossLevels),panel=$('campaign-map');
    $('map-progress').textContent='LEVEL '+best+' / '+LEVEL_COUNT;
    panel.innerHTML=PRO_WORLDS.map((world,w)=>{
      const levels=Array.from({length:5},(_,q)=>w*5+q+1).map(L=>{
        const cls=(L<=best?' unlocked':'')+(L===best?' current':'')+(bossSet.has(L)?' boss':'');
        return '<button class="map-level'+cls+'" onclick="openHomePlane('+(L-1)+')"><img src="'+SPRD[L-1]+'" alt=""><b>Lv '+L+'</b><small>'+weaponName(L)+'</small></button>';
      }).join('');
      return '<section class="map-world"><header><b>'+world.n+'</b><small>LEVELS '+(w*5+1)+'–'+(w*5+5)+'</small></header><div class="map-levels">'+levels+'</div></section>';
    }).join('')+'<p class="map-legend">Tap an unlocked aircraft to inspect it in the Command Hangar. Red markers identify boss encounters.</p>';
  }
  function celebrateUnlock(best){
    if((save.homeSeenLv||1)>=best)return;
    save.homeSeenLv=best;store();homePreview=best-1;
    $('home-unlock-name').textContent='LEVEL '+best+' · '+LV[best-1];
    stageEl.classList.remove('unlock-show');void stageEl.offsetWidth;stageEl.classList.add('unlock-show');
    if(AC)snd('up');setTimeout(()=>stageEl.classList.remove('unlock-show'),1900);
  }
  function refreshHome(celebrate=false){
    const best=unlockedLevel();homePreview=Math.max(0,Math.min(best-1,homePreview));const L=homePreview+1,world=worldFor(L),rank=pilotRank(best),missionTarget=Math.min(LEVEL_COUNT,best+1),paint=PLANES[save.sel]||PLANES[0];
    menuEl.dataset.world=String(world);menuEl.style.setProperty('--plane',paint.c);stageEl.classList.toggle('engine-on',L>=4);
    $('thi').src=SPRD[homePreview];$('thi').alt='Level '+L+' '+LV[homePreview];
    $('home-plane-level').textContent='LEVEL '+L+' · '+weaponName(L).toUpperCase();$('home-plane-name').textContent=LV[homePreview];$('home-plane-world').textContent=worldName(world);
    $('plane-inspector').textContent=inspectorText(L);$('pilot-badge').textContent=rank[0];$('pilot-rank').textContent=rank[1];
    $('pilot-call').textContent='PILOT DW-'+String(Math.max(1,(save.stat.runs||0)+1)).padStart(2,'0');
    $('pc').textContent=Math.max(0,save.pts||0)+' · ◈ '+Math.max(0,save.coins||0);
    $('home-play-title').textContent=best>=LEVEL_COUNT?'REPLAY FINAL CAMPAIGN':'CONTINUE FLIGHT';
    $('home-play-sub').textContent=best>=LEVEL_COUNT?'Level 30 secured · Chase a new record':'New run · Next target Level '+missionTarget;
    const resume=$('home-resume'),cost=checkpointCost(),canResume=(save.cp||1)>1&&save.coins>=cost;
    resume.classList.toggle('hide',!canResume);resume.textContent=canResume?'RETURN TO CHECKPOINT · LEVEL '+save.cp+' · ◈ '+cost:'';
    const prev=stageEl.parentElement.querySelector('.plane-step.prev'),next=stageEl.parentElement.querySelector('.plane-step.next');prev.disabled=homePreview<=0;next.disabled=homePreview>=best-1;
    renderRoute(L);renderBossRadar(best);renderBriefing();renderLastFlight();renderMap();
    if(celebrate)celebrateUnlock(best);
  }
  function enterHangar(){
    menuEl.classList.remove('command-enter');void menuEl.offsetWidth;menuEl.classList.add('command-enter');
    setTimeout(()=>menuEl.classList.remove('command-enter'),900);
  }
  function changePreview(delta,absolute){
    const best=unlockedLevel(),next=absolute===undefined?homePreview+delta:Number(absolute);
    homePreview=Math.max(0,Math.min(best-1,Math.floor(next)||0));stageEl.classList.remove('inspect');refreshHome(false);
  }
  function toggleInspection(){stageEl.classList.toggle('inspect')}
  function openHomePlane(index){homePreview=Math.max(0,Math.min(unlockedLevel()-1,Math.floor(index)||0));homePinnedPreview=true;menu()}
  function homeCheckpoint(){if(!continueRun())start()}
  function flightMap(){S='menu';show('flight-map');renderMap()}
  function homeSkyLevel(){return homePreview+1}
  function homeMusicTick(d){
    if(save.snd===false||save.music===false||!AC)return;
    homeMusicT-=d;if(homeMusicT>0)return;homeMusicT=2.7;
    const notes=[[98,147],[92,138],[110,165],[82,123],[73,110],[65,98]][worldFor(homePreview+1)],n=notes[(Math.floor(performance.now()/2500))%notes.length];
    tone(n,.55,'sine',.012,n*1.12);
  }

  window.previewHomePlane=changePreview;window.openHomePlane=openHomePlane;window.homeCheckpoint=homeCheckpoint;window.flightMap=flightMap;window.homeSkyLevel=homeSkyLevel;
  document.body.classList.toggle('safe-render',SAFE_RENDER);

  const commandShow=show;
  show=function(id){commandShow(id);$('flight-map').classList.toggle('hide',id!=='flight-map')};
  const commandMenu=menu;
  menu=function(){commandMenu();if(!homePinnedPreview)homePreview=unlockedLevel()-1;homePinnedPreview=false;refreshHome(true);enterHangar()};
  const commandStart=start;
  start=function(){if(S==='menu'){homeMusicT=0;snd('fl')}commandStart()};
  const commandUpdate=upd;
  upd=function(d){commandUpdate(d);if(S==='menu'&&menuOn)homeMusicTick(d)};
  // The DOM hero owns the aircraft presentation; canvas keeps the moving sky.
  showcase=function(){};

  stageEl.addEventListener('pointerdown',e=>{if(e.target.closest('.plane-hotspot'))return;dragStart={x:e.clientX,y:e.clientY};dragMoved=false;try{stageEl.setPointerCapture(e.pointerId)}catch(_){}});
  stageEl.addEventListener('pointermove',e=>{if(!dragStart)return;const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;dragMoved=dragMoved||Math.abs(dx)>8||Math.abs(dy)>8;stageEl.style.setProperty('--tilt-x',String(Math.max(-1,Math.min(1,dx/70))));stageEl.style.setProperty('--tilt-y',String(Math.max(-1,Math.min(1,dy/70))))});
  const release=e=>{if(!dragStart)return;const dx=e.clientX-dragStart.x;stageEl.style.setProperty('--tilt-x','0');stageEl.style.setProperty('--tilt-y','0');suppressHomeClick=Math.abs(dx)>42;if(suppressHomeClick)changePreview(dx<0?1:-1);dragStart=null};
  stageEl.addEventListener('pointerup',release);stageEl.addEventListener('pointercancel',()=>{dragStart=null;stageEl.style.setProperty('--tilt-x','0');stageEl.style.setProperty('--tilt-y','0')});
  stageEl.addEventListener('click',e=>{if(e.target.closest('.plane-hotspot'))return;if(suppressHomeClick){suppressHomeClick=false;return}toggleInspection()});
  stageEl.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();changePreview(-1)}else if(e.key==='ArrowRight'){e.preventDefault();changePreview(1)}else if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleInspection()}});
  menuEl.addEventListener('pointermove',e=>{if(reducedMotion())return;const r=menuEl.getBoundingClientRect();menuEl.style.setProperty('--px',((e.clientX-r.left)/Math.max(1,r.width)-.5).toFixed(2));menuEl.style.setProperty('--py',((e.clientY-r.top)/Math.max(1,r.height)-.5).toFixed(2))},{passive:true});
  menuEl.addEventListener('pointerleave',()=>{menuEl.style.setProperty('--px','0');menuEl.style.setProperty('--py','0')});
  menuEl.addEventListener('pointerdown',()=>initAudio(),{passive:true});
  addEventListener('dodgewingready',()=>{refreshHome(true);enterHangar()});
  refreshHome(false);
})();
