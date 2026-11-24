// Optional flights use a disposable save, so practice cannot unlock the campaign.
let flightMode=null,lastFlightMode=null,modeCampaignSave=null;
const modeStore=store;
store=function(){if(!modeCampaignSave)return modeStore();return;};
function leaveFlightMode(){if(modeCampaignSave){save=modeCampaignSave;modeCampaignSave=null}flightMode=null;}
function finishFlightMode(won){if(!flightMode||!modeCampaignSave)return;const key=flightMode.kind+':'+flightMode.level,score=Math.floor(t)+stars*5+bonus;
  const real=modeCampaignSave;real.flightRecords=obj(real.flightRecords);const old=obj(real.flightRecords[key]);real.flightRecords[key]={best:Math.max(num(old.best),score),wins:num(old.wins)+(won?1:0),runs:num(old.runs)+1};
  if(won&&flightMode.kind==='rush'&&!real.cu.includes('aurora'))real.cu.push('aurora');
  save=real;modeCampaignSave=null;store();
}
function setFlightLevel(L){lv=L;prevLv=L;peakLv=L;evoStars=starStarts[L];sp=planeSpeed(L);skyL=L;st=[];ms=[];obs=[];bl=[];B=null;pl.x=W/2;pl.y=H*.7;inv=3;syncAbilityButton();if(BOSS[L])startBoss(L);else addStar()}
const modeStart=start;
start=function(){if(typeof adBreakPending!=='undefined'&&(adBreakPending||rewardedRescuePending))return;leaveFlightMode();lastFlightMode=null;modeStart()};
function startFlightMode(kind,level=5){if(!['practice','rush','challenge'].includes(kind))return false;if(typeof adBreakPending!=='undefined'&&(adBreakPending||rewardedRescuePending))return false;
  if(kind!=='challenge'&&!BOSS[level])return false;if(kind==='practice'&&level>save.stat.bestLv)return false;
  leaveFlightMode();modeCampaignSave=save;save=JSON.parse(JSON.stringify(save));modeStart();flightMode={kind,level:kind==='rush'?5:kind==='challenge'?1:level,index:0,elapsed:0};lastFlightMode={...flightMode};setFlightLevel(flightMode.level);proTutorial=-1;return true;
}
function instantRetry(){const last=lastFlightMode?{...lastFlightMode}:null;if(last)startFlightMode(last.kind,last.level);else start()}
const modeMenu=menu;
menu=function(){if(typeof adBreakPending!=='undefined'&&(adBreakPending||rewardedRescuePending))return;leaveFlightMode();modeMenu()};
const modeDie=die;
die=function(){if(S!=='play')return;modeDie();finishFlightMode(false)};
const modeEndBoss=endBoss;
endBoss=function(){if(!flightMode||!B||B.entry<1||(B.hp>0&&B.t<B.T))return modeEndBoss();
  if(flightMode.kind==='challenge')return modeEndBoss();
  if(flightMode.kind==='rush'&&flightMode.index<5){flightMode.index++;setFlightLevel(BOSS_LEVELS[flightMode.index]);return}
  finishFlightMode(true);B=null;ms=[];st=[];bl=[];S='victory';show('victory');$('vic').innerHTML='<b>Flight complete</b><small>'+ (flightMode.kind==='rush'?'Six encounters cleared. Aurora trail unlocked.':'Practice complete. Campaign progress preserved.')+'</small>';snd('win');
};
const modeUpdate=upd;
upd=function(d){const active=S==='play';if(active&&flightMode&&flightMode.kind==='challenge'){flightMode.elapsed+=d;const phase=Math.floor(flightMode.elapsed/15)%3;if(phase===0)mag=Math.max(mag,.2);if(phase===1)slow=Math.max(slow,.2);if(phase===2)over=Math.max(over,.2)}modeUpdate(d);
  if(active&&S==='play'&&flightMode&&flightMode.kind==='challenge'&&flightMode.elapsed>=60){finishFlightMode(true);B=null;ms=[];st=[];S='victory';show('victory');$('vic').innerHTML='<b>Challenge complete</b><small>60 seconds survived. Best result saved in Flight Modes.</small>';snd('win')}
};
function flightModes(){S='menu';show('scores');$('scorec').innerHTML='<h2>Flight modes</h2><p class="sm">Practice keeps campaign unlocks and currency unchanged. Destroy the boss or survive its attack timer.</p>'+BOSS_LEVELS.map(L=>'<button '+(L>save.stat.bestLv?'disabled':'')+' onclick="startFlightMode(\'practice\','+L+')">Practice Lv '+L+' · '+BOSS[L].n+'</button>').join('')+'<button onclick="startFlightMode(\'rush\')">Boss Rush · Six encounters</button><button onclick="startFlightMode(\'challenge\')">Challenge Flight · Survive 60 seconds</button><p class="sm">Challenge modifiers rotate every 15 seconds: Magnet, Slow Time, Overdrive. Boss Rush unlocks the existing Aurora trail.</p><button onclick="pilotLog()">Pilot logs & aircraft lore</button>'+Object.entries(obj(save.flightRecords)).map(([k,r])=>'<p class="sm">'+k.replace(/[^a-z0-9:]/gi,'')+' · Best '+Math.floor(num(r.best))+' · Wins '+Math.floor(num(r.wins))+'</p>').join('')}
function pilotLog(){S='menu';show('scores');$('scorec').innerHTML='<h2>Pilot log</h2><p class="sm">Best run '+save.best.play+' · '+save.stat.runs+' flights · '+save.stat.wins+' campaign victories</p>'+AIRCRAFT.map((n,i)=>'<div class="card"><b>Lv '+(i+1)+' · '+n+'</b><small>'+(i+1<=save.stat.bestLv?ZONES[Math.floor(i/5)]+' fleet. '+(i<3?'Unarmed: master evasion before entering combat.':WPN[i+1].n+' supports this aircraft’s survival role.')+' Signature ability: '+abilityFor(i+1).n+'.':'Reach this level to open its flight record.')+'</small></div>').join('')}
