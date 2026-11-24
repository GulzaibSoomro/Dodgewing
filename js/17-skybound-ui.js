let hangarTab='aircraft',showroomLevel=1,purchaseReview=0,chapterNoticeTime=0;
const rankNames=['MK-0','MK-I','MK-II','MK-III'];
const uiButton=(label,action,primary=false)=>'<button class="'+(primary?'arcade-primary':'')+'" onclick="'+action+'">'+label+'</button>';
const mapButton=()=>uiButton('Campaign Map','flightMap()');
const forgeButton=()=>uiButton('Upgrade aircraft','hangar(\'forge\')');
function levelStatus(n){
  const c=save.campaign;
  return n<=c.completed?'Completed':n>unlockedLevelCount()?'Locked':c.checkpoints[n-1]?'Boss checkpoint':'Unlocked';
}
let lastMapState='';
function chapterMap(){
  const state=JSON.stringify([save.campaign.completed,save.campaign.checkpoints]);
  if(lastMapState===state&&$('campaign-map').firstChild)return;
  lastMapState=state;
  $('map-progress').textContent=save.campaign.completed+' / 30 cleared';
  $('campaign-map').innerHTML=CHAPTERS.map(c=>'<section class="chapter-card" style="--accent:'+c.accent+'"><small>CHAPTER '+c.id+'</small><h3>'+c.name+'</h3>'+
    LEVEL_CONFIG.filter(row=>row.chapter===c).map(row=>'<button class="mission-card" '+(levelOpen(row.level)?'onclick="selectLevel('+row.level+')"':'disabled')+'><img alt="" src="'+SPRD[row.level-1]+'"><span><b>'+row.level+' · '+LV[row.level-1]+'</b><small>'+row.target+' stars · '+BOSS[row.boss].n+'</small><small>'+levelStatus(row.level)+'</small></span></button>').join('')+'</section>').join('');
}
function selectLevel(level){
  if(!levelOpen(level))return;
  save.campaign.selected=level;store();setupLevel(level);
}
function setupLevel(level,replay=false){
  if(!levelOpen(level))return;
  const c=save.campaign,cfg=cfgFor(level),checkpoint=c.checkpoints[level-1];
  S='menu';show('scores');$('scores').querySelector('h2').textContent='Level '+level;
  const boss=checkpoint&&!replay;
  const setup=boss?'<p>Boss checkpoint · Destroy or evade for '+cfg.survival+'s</p>'+uiButton('Fight Boss','retryLevel()',true):
    '<p>Collect '+cfg.target+' stars · '+aircraftStats(level).fuel+'s fuel</p>'+
    uiButton('Play','launchCampaign()',true);
  $('scorec').innerHTML='<img class="brief-plane" src="'+SPRD[level-1]+'" alt=""><h3>'+LV[level-1]+'</h3><small>'+cfg.chapter.name+' · '+BOSS[cfg.boss].n+'</small>'+ (validFlight(c.flight)?'<p>Starting a new attempt replaces your unfinished flight.</p>':'')+setup+(level<=c.completed&&!replay?uiButton('Replay star mission','setupLevel('+level+',true)'):'')+forgeButton()+mapButton();
}
function chooseFlight(){
  if(flightMode&&S==='paused')return instantRetry();
  if(activeScene()){commitFlight();menu();return setupLevel(save.campaign.selected)}
  flightMap();
}
function showAttemptResult(reason,f,first){
  const n=f.level,c=save.campaign,final=n===LEVEL_COUNT;
  if(reason!=='clear'){
    const title=reason==='fuel'?'Fuel Empty':'Aircraft Destroyed';
    const body='<h3>Lv '+n+' · '+LV[n-1]+'</h3><p>'+ (f.phase==='boss'?'Boss checkpoint retained · Earned '+stars+' ★':'Stars earned this attempt · '+stars)+'</p><p>Wallet ★ '+c.wallet+'</p>';
    S='over';rewardedRescueLevel=n;show('over');$('over').querySelector('h1').textContent=title;
    $('res').innerHTML='<div class="card">'+body+'<small>'+rankNames[c.planes[n-1].fuel]+' tank · '+aircraftStats(n).fuel+'s · Upgrade in Forge</small></div>';
    $('cont').classList.add('hide');$('over-retry').textContent=f.phase==='boss'?'Retry Boss':'Retry';
    $('over-retry').onclick=()=>{if(S==='over')beginAttempt(n,f.phase)};
    refreshRewardedRescue();try{if(window.DodgewingAds?.onGameOver){beginAdBreak();window.DodgewingAds.onGameOver(t,adScreenSerial)}}catch(_){finishAdBreak(adScreenSerial)}
    return;
  }
  S='menu';show('scores');
  $('scores').querySelector('h2').textContent=final?'Campaign Complete':'Level Complete';
  const boss=BOSS[cfgFor(n).boss].n;
  const outcome=f.method==='combat'?'Destroyed':'Outlasted';
  const unlock=first?(final?'Legendary Aircraft Core earned':'Level '+(n+1)+' unlocked · '+LV[n]):'';
  const primary=final?uiButton('Campaign Map','flightMap()',true):uiButton('Next Level','selectLevel('+(n+1)+')',true);
  const animate=save.fx!==false&&!reducedMotion()&&!lowGraphics();
  $('scorec').innerHTML=`<section class="clear-card${animate?' celebrate':''}">
    <div class="clear-emblem"><img src="${SPRD[n-1]}" alt=""></div>
    <small>Level ${n} · ${cfgFor(n).chapter.name}</small>
    <h3>${LV[n-1]}</h3><p>${outcome} ${boss}</p>
    <div class="clear-stats"><span>Flight time <b>${fuelClock(t)}</b></span><span>Wallet <b>★ ${c.wallet}</b></span></div>
    ${unlock?'<p class="clear-unlock">'+unlock+'</p>':''}
  </section>`+primary+uiButton('Replay Level','setupLevel('+n+',true)')+uiButton('Hangar','hangar(\'forge\')')+(final?'':mapButton());
  $('scores').querySelector('.page-content').scrollTop=0;
  snd('win');
}
const previousHangar=hangar;
hangar=function(tab){if(adBreakPending||rewardedRescuePending)return;if(typeof tab==='string')hangarTab=tab;showroomLevel=forgePlane();previousHangar();renderHangarTab()};
function selectHangar(tab){if(['aircraft','forge','paints'].includes(tab)){hangarTab=tab;purchaseReview=0;renderHangarTab()}}
function renderHangarTab(){
  $('hp').textContent='★ '+save.campaign.wallet+(hangarTab==='paints'?' · '+save.pts+' pts':'');
  for(const name of ['aircraft','forge','paints']){$('hangar-'+name).classList.toggle('hide',hangarTab!==name);$('tab-'+name).setAttribute('aria-pressed',String(hangarTab===name))}
  if(hangarTab==='aircraft')renderShowroom();if(hangarTab==='forge')renderForge();
}
function browseAircraft(delta){const n=forgePlane()+delta;if(!levelOpen(n))return;save.campaign.selected=n;store();renderShowroom()}
function renderShowroom(){
  const n=forgePlane(),cfg=cfgFor(n);
  $('aircraft-showroom').innerHTML='<small>LEVEL '+n+' · '+cfg.chapter.name+'</small><h3>'+LV[n-1]+'</h3><div class="showroom-plane"><button aria-label="Previous aircraft" '+(n===1?'disabled':'')+' onclick="browseAircraft(-1)">‹</button><img src="'+SPRD[n-1]+'" alt=""><button aria-label="Next aircraft" '+(n>=unlockedLevelCount()?'disabled':'')+' onclick="browseAircraft(1)">›</button></div><p>'+cfg.target+' stars · '+aircraftStats(n).fuel+'s fuel · '+abilityFor(n).n+'</p>'+uiButton('Open Forge','selectHangar(\'forge\')',true)+uiButton('Level briefing','selectLevel('+n+')');
}
function chooseModule(key){if(Object.hasOwn(FORGE_CONFIG,key)){selectedModule=key;purchaseReview=0;renderForge()}}
function applyForge(level,key,rank){
  if(purchaseReview!==rank){purchaseReview=rank;renderForge();return}purchaseReview=0;
  const ok=buyModule(level,key,rank);renderForge(ok?'Installed on '+LV[level-1]:'Purchase unavailable');
}
function renderForge(message=''){
  const n=forgePlane(),data=save.campaign,ranks=data.planes[n-1],key=selectedModule,m=FORGE_CONFIG[key],r=ranks[key],price=m.prices[r];
  const unavailable=key==='weapons'&&!WPN[n],blocked=unavailable||r===3||data.wallet<price;
  const caption=unavailable?'Unarmed aircraft':r===3?'Maximum rank':data.wallet<price?'Insufficient stars':purchaseReview===r+1?'Confirm upgrade':'Upgrade';
  const slots=Object.entries(FORGE_CONFIG).map(([k,mod])=>'<button aria-pressed="'+(k===key)+'" onclick="chooseModule(\''+k+'\')">'+mod.name+'<small>'+rankNames[ranks[k]]+'</small></button>').join('');
  $('hp').textContent='Wallet ★ '+data.wallet;
  $('hangar-forge').innerHTML='<header><small>LEVEL '+n+' · '+aircraftStats(n).fuel+'s FUEL</small><h3>'+LV[n-1]+'</h3></header><div class="forge-preview"><img src="'+SPRD[n-1]+'" alt=""><canvas id="forge-overlay" width="176" height="176"></canvas></div><div class="forge-slots">'+slots+'</div><section class="forge-detail"><h3>'+m.name+' · '+rankNames[r]+'</h3><p>'+m.describe(m.values[r])+'</p>'+(r<3&&!unavailable?'<small>NEXT · '+rankNames[r+1]+' · ★ '+price+'</small><p>'+m.describe(m.values[r+1])+'</p>':'')+'<button class="forge-install" '+(blocked?'disabled':'')+' onclick="applyForge('+n+',\''+key+'\','+(r+1)+')">'+caption+'</button><small role="status">'+message+'</small></section>'+uiButton('Level briefing','selectLevel('+n+')')+(validFlight(data.flight)?uiButton('Resume Flight','recoverFlight()'):'');
  const ctx=$('forge-overlay').getContext('2d');ctx.save();ctx.translate(88,88);drawLoadout(ctx,146,ranks,data.core,n);ctx.restore();
}
function chapterTint(){
  const c=chapterAt(lv);
  if(S==='menu')return;
  if(c.weather==='gold'||c.weather==='smoke'){
    x.save();x.globalAlpha=c.weather==='gold'?.10:.16;x.fillStyle=c.weather==='gold'?'#ffc16e':'#ce5c3c';x.fillRect(0,0,W,H);
    x.globalAlpha=.23;x.strokeStyle=c.accent;x.beginPath();
    for(let i=0;i<4;i++){const py=H*(.13+i*.15),px=((i*137+t*5)%(W+80))-40;x.moveTo(px,py);x.lineTo(px+30,py-6)}
    x.stroke();x.restore();
  }else if(c.weather==='moon'){
    x.save();x.globalAlpha=.32;x.fillStyle=c.accent;x.beginPath();x.arc(W*.82,H*.21,14,0,TAU);x.fill();x.restore();
  }
}

window.handleFlightBack=function(){
  if(adBreakPending||rewardedRescuePending)return true;
  if(S==='play'||S==='countdown'){pauseG();return true}
  if(S==='paused'){menu();return true}
  if(!$('help').classList.contains('hide')){settings();return true}
  if(!$('menu').classList.contains('hide'))return false;
  menu();return true;
};
