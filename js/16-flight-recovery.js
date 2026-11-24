// One campaign attempt owns the fixed aircraft, clocks and persisted checkpoint.
let mission=null, checkpointAge=0, inMissionTick=false, pendingWrite=false;
const baseStart=start,baseTick=upd,baseDie=die,baseHurt=hurt,baseEnd=endBoss,baseMenu=menu,baseStore=store;
const cfgFor=n=>LEVEL_CONFIG[n-1];
const activeScene=()=>['play','paused','countdown'].includes(S);
const bounded=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
function validFlight(f){
  if(!f||!levelOpen(f.level)||!['stars','boss'].includes(f.phase))return false;
  const c=cfgFor(f.level);
  if(!Number.isInteger(f.count)||!bounded(f.count,0,c.target)||!bounded(f.fuel,.0000001,aircraftStats(f.level).fuel)||!bounded(f.gap,0,STAR_GAP))return false;
  if(f.phase==='boss'&&(!save.campaign.checkpoints[f.level-1]||f.count!==c.target))return false;
  if(f.phase==='stars'&&f.count>=c.target)return false;
  return ['x','y'].every(k=>bounded(f[k],0,1))&&bounded(f.angle,-Math.PI,Math.PI)&&
    ['time','shield','mag','slow','ability','boost','over','armor','jam','bonus','earned'].every(k=>bounded(f[k],0,1e8))&&
    (!f.star||bounded(f.star.x,0,1)&&bounded(f.star.y,0,1))&&
    (f.phase!=='boss'||f.boss&&bounded(f.boss.hp,.000001,1000)&&bounded(f.boss.time,0,c.survival)&&Number.isInteger(f.boss.volley)&&bounded(f.boss.volley,0,1000));
}
function snapshot(){
  return {...mission,saved:Date.now(),rescued:rewardedRescueUsed,x:pl.x/W,y:pl.y/H,angle:Math.atan2(Math.sin(pl.a),Math.cos(pl.a)),
    time:t,shield:Math.max(0,shield),mag,slow,ability:abilityCd,boost,over,armor:armorCooldown,jam:jammerTime,bonus,earned:stars,
    star:st.length?{x:st[0].x/W,y:st[0].y/H}:null,boss:B?{hp:B.hp,time:B.t,volley:B.ph}:null};
}
store=function(){
  if(modeCampaignSave)return;
  if(inMissionTick){pendingWrite=true;return}
  if(mission&&activeScene())save.campaign.flight=snapshot();
  baseStore();
};
function commitFlight(){if(mission&&activeScene())store()}
function spawnMissionStar(random=Math.random){
  if(!mission||mission.phase!=='stars'||st.length||mission.gap>0)return;
  const left=24,right=W-24,top=Math.max(24,Math.min(134,H-50)),bottom=H-24;
  const canvas=cv.getBoundingClientRect?.();
  const controls=['joy','ab','pb'].map(id=>$(id).getBoundingClientRect?.()).filter(r=>r?.width&&r.height&&canvas?.width&&canvas.height);
  function place(x,y){
    if(Math.hypot(x-pl.x,y-pl.y)<32)return false;
    if(controls.some(r=>x>(r.left-canvas.left)*W/canvas.width-14&&x<(r.right-canvas.left)*W/canvas.width+14&&y>(r.top-canvas.top)*H/canvas.height-14&&y<(r.bottom-canvas.top)*H/canvas.height+14))return false;
    if(ms.some(m=>Math.hypot(m.x-x,m.y-y)<45))return false;
    if(obs.some(o=>o.ty==='gate'?Math.abs(o.y-y)<33&&Math.abs(o.gap-x)>o.gw/2-16:Math.hypot(o.x-x,o.y-y)<(o.r||20)+25))return false;
    st.push({x,y,r:0});return true;
  }
  for(let i=0;i<32;i++)if(place(left+random()*(right-left),top+random()*(bottom-top)))return;
  // A fully obstructed field is retried on the next active update.
  for(let row=0;row<10;row++)for(let col=0;col<10;col++){
    if(place(left+(col+.5)*(right-left)/10,top+(row+.5)*(bottom-top)/10))return;
  }
}
function enterCampaignBoss(){
  const config=cfgFor(lv);
  mission.phase='boss';
  mission.gap=0;
  mission.fuel=aircraftStats(lv).fuel;
  bl=[];
  msT=levelPressure().firstWarning;
  startBoss(config.boss);
  B.hp=B.hpMax=Math.round(config.hp*levelPressure().hp);
  B.T=config.survival;
  B.pace=config.pace;
  B.projectile=config.projectile;
  banT=0;
  hint=0;
  proTutorial=-1;
}
function beginAttempt(level,phase,recovering=false){
  if(!levelOpen(level)||!['stars','boss'].includes(phase)||adBreakPending||rewardedRescuePending)return false;
  const data=save.campaign,checkpoint=data.checkpoints[level-1];
  if(phase==='boss'&&!checkpoint)return false;
  if(recovering!==true&&phase==='stars'&&checkpoint&&level>data.completed)return false;
  mission=null;leaveFlightMode();baseStart();
  const c=cfgFor(level);
  lv=prevLv=peakLv=skyL=level;sp=planeSpeed(level);st=[];ms=[];obs=[];bl=[];B=null;
  data.selected=level;msT=levelPressure().firstWarning;
  mission={level,phase,count:phase==='boss'?c.target:0,fuel:aircraftStats(level).fuel,gap:0};
  if(phase==='boss')enterCampaignBoss();
  else{spawnMissionStar();banTx=c.chapter.name+' · Collect '+c.target+' stars';banT=1.8}
  syncAbilityButton();checkpointAge=0;
  if(recovering!==true)commitFlight();return true;
}
function collectMissionStar(){
  if(!mission||mission.phase!=='stars')return;
  mission.count++;save.campaign.wallet++;save.campaign.lifetime++;mission.gap=STAR_GAP;pendingWrite=true;
  if(mission.count===cfgFor(lv).target){
    save.campaign.checkpoints[lv-1]=true;
    enterCampaignBoss();
  }
}
upd=function(d,elapsed=d){
  if(!mission||S!=='play')return baseTick(d);
  const flight=mission,active=Math.min(elapsed,flight.fuel);
  inMissionTick=true;
  try{
    flight.fuel=Math.max(0,flight.fuel-active);
    if(flight.phase==='stars'&&!st.length){
      flight.gap=Math.max(0,flight.gap-active);
      if(flight.gap<1e-10){flight.gap=0;spawnMissionStar()}
    }
    baseTick(Math.min(d,active));
    if(mission===flight&&flight.fuel<=1e-9)finishAttempt('fuel');
  }finally{
    inMissionTick=false;checkpointAge+=active;
    if(pendingWrite||checkpointAge>=5){pendingWrite=false;checkpointAge=0;store()}
  }
};
function finishAttempt(reason){
  if(!mission)return;
  const f=mission,data=save.campaign,c=cfgFor(lv),cleared=reason==='clear',first=cleared&&data.completed===lv-1;
  mission=null;data.flight=null;delete save.nativeRescueInFlight;B=null;st=[];ms=[];bl=[];obs=[];pu=[];joyRel();clearBossIntro();stopBuzz();
  if(cleared){
    bonus+=50;save.stat.boss++;save.stat.bossK[BOSS[c.boss].k]=1;mEvent('boss',1);
    if(first){data.records.push({level:lv,boss:c.boss,method:f.method});data.completed=lv;save.stat.bestLv=Math.max(save.stat.bestLv,unlockedLevelCount());
      if(lv===30){data.core=true;save.stat.wins++}}
  }
  const score=flightScore();recordModeBest(score);save.stat.runs++;save.stat.bestT=Math.max(save.stat.bestT,Math.floor(t));
  save.best.play=Math.max(save.best.play,score);save.pts+=score;save.top.push({score,level:lv,stars,time:Math.floor(t),date:today()});save.top.sort((a,b)=>b.score-a.score);save.top=save.top.slice(0,5);
  mEvent('surv',Math.floor(t));mEvent('lvl',lv);mEvent('bonus',bonus);
  chkAch();pendingWrite=true;
  showAttemptResult(reason,f,first);store();
}
endBoss=function(){if(!mission)return baseEnd();if(B&&B.entry>=1&&(B.hp<=0||B.t>=B.T)){mission.method=B.hp<=0?'combat':'survival';finishAttempt('clear')}};
die=function(){if(!mission)return baseDie();if(S==='play')finishAttempt('destroyed')};
hurt=function(){if(mission)return die();return baseHurt()};
function recoverFlight(){
  const f=save.campaign.flight;if(S!=='menu'||!validFlight(f))return false;
  if(!beginAttempt(f.level,f.phase,true))return false;
  Object.assign(mission,{count:f.count,fuel:f.fuel,gap:f.gap});
  pl={x:f.x*W,y:f.y*H,a:f.angle};t=f.time;stars=f.earned;bonus=f.bonus;
  shield=f.shield;mag=f.mag;slow=f.slow;abilityCd=f.ability;boost=f.boost;over=f.over;armorCooldown=f.armor;jammerTime=f.jam;
  st=f.phase==='stars'&&f.star&&f.gap===0?[{x:f.star.x*W,y:f.star.y*H,r:0}]:[];
  if(B){B.hp=Math.min(B.hpMax,f.boss.hp);B.t=f.boss.time;B.ph=f.boss.volley}
  rewardedRescueUsed=f.rescued===true;inv=2.2;pauseG();resume();return true;
}
function refreshResume(){
  const f=save.campaign.flight,button=$('resume-flight');button.classList.toggle('hide',!validFlight(f));
  if(validFlight(f))button.innerHTML='<b>Resume Flight</b><small>Lv '+f.level+' · '+(f.phase==='boss'?'Boss':f.count+'/'+cfgFor(f.level).target+' stars')+' · Fuel '+fuelClock(f.fuel)+'</small>';
}
menu=function(){if(adBreakPending||rewardedRescuePending)return;commitFlight();mission=null;baseMenu();refreshResume()};
function openFlightForge(){if(flightMode)return;if(activeScene())pauseG();menu();hangar('forge')}
function fuelClock(v){const s=Math.ceil(Math.max(0,v));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
start=()=>retryLevel();
function launchCampaign(){return beginAttempt(save.campaign.selected,'stars')}
function retryLevel(){const c=save.campaign,n=c.selected,check=c.checkpoints[n-1];return beginAttempt(n,check?'boss':'stars')}
instantRetry=function(){if(lastFlightMode)return startFlightMode(lastFlightMode.kind,lastFlightMode.level);return retryLevel()};
addEventListener('pagehide',()=>{if(activeScene()){pauseG();commitFlight()}});
if(!validFlight(save.campaign.flight))save.campaign.flight=null;
refreshResume();store();
