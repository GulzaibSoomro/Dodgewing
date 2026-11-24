// 10-professional-pass.js: presentation, onboarding and end-of-campaign polish.
// This layer builds on the campaign without changing its controls or core difficulty.
const PRO_WORLDS=CHAPTERS.map(c=>({n:c.name.toUpperCase(),c:c.accent}));
const proWorld=L=>PRO_WORLDS[Math.min(PRO_WORLDS.length-1,Math.max(0,Math.floor((L-1)/5)))];
let proShake=0,proShakePower=0,proBossIntro=0,proTutorial=-1,proTutorialT=0;

function highScores(){
  S='menu';show('scores');$('scores').querySelector('h2').textContent='High scores';
  const list=save.top||[];
  $('scorec').innerHTML='<p class="sm">Your five best local flights.</p>'+(list.length?list.map((r,i)=>'<div class="mi rank"><span>#'+(i+1)+' · Level '+Math.max(1,Math.min(LEVEL_COUNT,Number(r.level)||1))+'<small>'+Math.max(0,Number(r.stars)||0)+' stars · '+Math.max(0,Number(r.time)||0)+' s · '+(r.date||'local run')+'</small></span><b class="hot">'+Math.max(0,Number(r.score)||0)+'</b></div>').join(''):'<div class="card"><b>No flights yet</b><small>Finish a run to save a high score here.</small></div>');
}
function settings(){
  S='menu';show('settings');
  const row=(name,value,action,pressed)=>'<div class="setting"><b>'+name+'</b><button aria-label="'+name+': '+value+'" '+(typeof pressed==='boolean'?'aria-pressed="'+pressed+'"':'')+' onclick="'+action+'">'+value+'</button></div>';
  const toggle=(name,on,action)=>row(name,on?'On':'Off',action,on);
  const group=(name,rows)=>'<section class="settings-group"><h3>'+name+'</h3>'+rows.join('')+'</section>';
  const touch=save.controlMode==='touch';
  $('setc').innerHTML=group('Audio',[toggle('Sound effects',save.snd!==false,'toggleSnd();settings()'),toggle('Flight music',save.music!==false,'toggleMusic();settings()')])+
    group('Controls',[row('Steering',touch?'Touch Anywhere':'Joystick',touch?"setControlMode(&quot;joystick&quot;)":"setControlMode(&quot;touch&quot;)"),row('Drag sensitivity',save.sensitivity||'normal','cycleSensitivity()'),row('Steering side',save.left?'Left':'Right','toggleHand();settings()'),toggle('Vibration',save.vibe!==false,'toggleVibration();settings()')])+
    group('Display & motion',[row('Graphics',save.gfx==='battery'?'Low':save.gfx==='smooth'?'High':'Auto','toggleGraphics();settings()'),toggle('Screen effects',save.fx!==false,'toggleFx()'),toggle('Reduced motion',reducedMotion(),'toggleMotion();settings()')])+
    '<button onclick="helpS()">How to play</button>';
}
function updatePrivacyOptions(){
  const row=$('privacy-options-row');if(row&&typeof row.remove==='function')row.remove();
  try{if(window.DodgewingAds&&typeof window.DodgewingAds.isPrivacyOptionsRequired==='function'&&window.DodgewingAds.isPrivacyOptionsRequired()){
    $('setc').insertAdjacentHTML('beforeend','<div class="setting" id="privacy-options-row"><span><b>Privacy options</b><small>Manage your advertising privacy choices.</small></span><button onclick="openPrivacyOptions()">Manage</button></div>');
  }}catch(e){}
}
function openPrivacyOptions(){try{if(window.DodgewingAds&&typeof window.DodgewingAds.showPrivacyOptions==='function')window.DodgewingAds.showPrivacyOptions()}catch(e){}}
window.onPrivacyOptionsChanged=function(){if(!$('settings').classList.contains('hide'))updatePrivacyOptions()};
const settingsWithoutPrivacy=settings;
settings=function(){settingsWithoutPrivacy();updatePrivacyOptions()};
function toggleFx(){save.fx=save.fx===false;store();settings()}
function toggleMusic(){save.music=save.music===false;store()}
function toggleGraphics(){save.gfx=save.gfx==='auto'?'smooth':save.gfx==='smooth'?'battery':'auto';store();applyGraphics()}
function applyGraphics(){if(document.body&&document.body.classList)document.body.classList.toggle('low-graphics',lowGraphics())}
function toggleVibration(){save.vibe=save.vibe===false;store()}
function applyMotion(){if(document.body&&document.body.classList)document.body.classList.toggle('reduce-motion',reducedMotion())}
function toggleMotion(){save.motion=!save.motion;store();applyMotion()}
function applyHand(){if(document.body&&document.body.classList)document.body.classList.toggle('lefty',save.left===true)}
function toggleHand(){save.left=!save.left;store();applyHand()}
applyHand();
applyMotion();
applyGraphics();

const proShow=show;
show=function(id){proShow(id);for(const panel of ['scores','settings','victory'])$(panel).classList.toggle('hide',panel!==id);if(id!==null){$('unlock').classList.add('hide');$('chapter-notice').classList.add('hide')}if(id==='menu'||id==='over'||id==='victory')clearBossIntro()};

const proSnd=snd;
snd=function(k){
  if(k==='warn'){tone(180,.13,'square',.17,130);setTimeout(()=>tone(130,.18,'square',.17,95),150);return}
  if(k==='win'){tone(523,.16,'triangle',.2,659);setTimeout(()=>tone(659,.16,'triangle',.2,784),150);setTimeout(()=>tone(784,.42,'triangle',.22,1046),300);return}
  proSnd(k)
};

const proStart=start;
start=function(){proStart();proTutorial=save.tutorial? -1:0;proTutorialT=0;proShake=0;proBossIntro=0;$('unlock').classList.add('hide');$('boss-intro').classList.add('hide')};

function showUnlock(){const card=$('unlock'),weapon=WPN[lv]?WPN[lv].n:'Evasive flying';card.innerHTML='<img src="'+SPRD[lv-1]+'" alt=""><span><b>NEW PLANE · LEVEL '+lv+'</b><small>'+LV[lv-1]+' · '+weapon+' · '+stageBrief(lv)+'</small></span>';card.classList.remove('hide');setTimeout(()=>card.classList.add('hide'),1050)}
const proEvo=evo;
evo=function(){const before=lv;proEvo();if(lv>before){banT=0;showUnlock()}};

function clearBossIntro(){proBossIntro=0;$('boss-intro').classList.add('hide')}
function showBossIntro(){if(!B)return;proBossIntro=1.15;const card=$('boss-intro');card.innerHTML='WARNING: '+BOSS[B.L].n+'<small>Destroy the boss or survive its attack timer</small>';card.classList.remove('hide')}
const proStartBoss=startBoss;
startBoss=function(L){proStartBoss(L);showBossIntro();snd('warn');shake(7)};

function finishVictory(){
  if(S!=='play')return; save.stat.wins++;
  const earned=flightScore(),k='play',isBest=earned>save.best[k];
  recordModeBest(earned);save.pts+=earned;if(isBest)save.best[k]=earned;save.stat.runs++;save.stat.bestLv=Math.max(save.stat.bestLv,peakLv);save.stat.bestT=Math.max(save.stat.bestT,Math.floor(t));mEvent('surv',Math.floor(t));mEvent('lvl',peakLv);mEvent('bonus',bonus);chkAch();
  save.top.push({id:Date.now()+'-'+Math.random().toString(36).slice(2),score:earned,level:peakLv,stars,time:Math.floor(t),date:today()});save.top.sort((a,b)=>(b.score||0)-(a.score||0)||(b.level||0)-(a.level||0));save.top=save.top.slice(0,5);store();
  S='victory';st=[];show('victory');$('vic').innerHTML='<img class="victory-plane" src="'+SPRD[peakLv-1]+'" alt=""><b>Skybound Legacy complete</b><small>Legendary Aircraft Core · Gold flight aura</small><span class="victory-zone">'+proWorld(peakLv).n+'</span><span class="victory-score">'+earned+' points</span><small>Level '+peakLv+' · '+stars+' stars · '+Math.floor(t)+' seconds'+(isBest?' · New best score!':'')+'</small><small>GZS Studio · Thank you for flying</small>';
  snd('win');shake(12)
}
function shake(power){if(save.fx!==false&&!reducedMotion()){proShake=Math.max(proShake,.24);proShakePower=Math.max(proShakePower,lowGraphics()?power*.35:power)}}
const proBoom=boom;
boom=function(px,py,color,count){proBoom(px,py,color,count);if(save.fx!==false&&!reducedMotion()){const extra=lowGraphics()?2:Math.min(10,Math.max(2,Math.floor(count/4)));for(let i=0;i<extra&&pt.length<particleLimit();i++){const a=Math.random()*TAU,v=rnd(70,260);pushParticle({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.35,m:.35,c:'255,240,180',r:rnd(1,3)})}shake(count>=20?6:2)}};

const proCtxStar=ctxStar;
ctxStar=function(px,py,rot){proCtxStar(px,py,rot);if(save.fx===false||reducedMotion())return;const pulse=1+Math.sin(t*6+rot)*.18;x.save();x.translate(px,py);x.globalAlpha=.35;x.strokeStyle='#fff4b0';x.lineWidth=1.5;x.beginPath();x.moveTo(-18*pulse,0);x.lineTo(18*pulse,0);x.moveTo(0,-18*pulse);x.lineTo(0,18*pulse);x.stroke();x.restore()};
function drawWorldAtmosphere(){const menuLevel=typeof homeSkyLevel==='function'?homeSkyLevel():1,world=proWorld(Math.round(S==='menu'?menuLevel:lv));if(world.n==='STORM INTERCEPT'){x.save();x.strokeStyle='rgba(205,232,255,.22)';x.lineWidth=1;for(let i=0;i<(lowGraphics()?10:26);i++){const q=(i*73+(reducedMotion()?0:t*180))%Math.max(1,W+H),px=(q%W),py=(q*1.7%H);x.beginPath();x.moveTo(px,py);x.lineTo(px-14,py+32);x.stroke()}if(S==='play'&&!lowGraphics()&&!reducedMotion()&&t>8&&t%23<.08){x.fillStyle='rgba(235,248,255,.06)';x.fillRect(0,0,W,H)}x.restore()}else if(world.n==='NIGHT HUNTERS'||world.n==='FINAL HORIZON'){x.save();const g=x.createRadialGradient(W*.78,H*.2,0,W*.78,H*.2,W*.32);g.addColorStop(0,world.n==='FINAL HORIZON'?'rgba(255,105,220,.2)':'rgba(80,218,255,.16)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);x.restore()}}
const proDrawSky=drawSky;
drawSky=function(){proDrawSky();drawWorldAtmosphere()};

function updateTutorial(d){if(proTutorial<0||S!=='play')return;if(proTutorial===0&&(jAng!==null||keys.ArrowLeft||keys.ArrowRight||keys.a||keys.d))proTutorial=1;if(proTutorial===1&&stars>0)proTutorial=2;if(proTutorial===2&&(ms.length>0||t>8)){proTutorial=3;proTutorialT=4.5}if(proTutorial===3){proTutorialT-=d;if(proTutorialT<=0){save.tutorial=true;store();proTutorial=-1}}}
function tutorialLayout(){const lines=[['MOVE · Use arrows or A / D',save.controlMode==='touch'?'Drag anywhere to turn':'Or drag the steering circle'],['COLLECT · Fly into','the glowing star'],['DODGE · Keep away','from red missiles'],['Collect the target before fuel runs out','Boss warning? Fight or evade. Pause to save.']][proTutorial]||[];const w=Math.min(W-28,420),h=lines.length>1?72:44,px=(W-w)/2,py=Math.max(132,H-h-148);return{lines,w,h,px,py,font:Math.max(13,Math.min(17,(w-28)/(Math.max(1,...lines.map(line=>line.length))*.57)))}}
function drawTutorial(){if(proTutorial<0||S!=='play')return;const box=tutorialLayout(),gap=24;glass(box.px,box.py,box.w,box.h,14);x.font=canvasFont(box.font);x.textAlign='center';x.fillStyle=proTutorial===2?'#ffb0a6':'#fff3e0';box.lines.forEach((line,i)=>x.fillText(line,W/2,box.py+(box.h-(box.lines.length-1)*gap)/2+6+i*gap));x.textAlign='left'}
const proUpd=upd;
upd=function(d){const frozen=S==='paused'||S==='countdown';proUpd(d);if(frozen)return;proShake=Math.max(0,proShake-d*2.8);proBossIntro=Math.max(0,proBossIntro-d);if(proBossIntro<=0)$('boss-intro').classList.add('hide');updateTutorial(d)};
const proDraw=draw;
draw=function(){if(S!=='paused'&&S!=='countdown'&&proShake>0&&save.fx!==false&&!reducedMotion()){const force=proShakePower*proShake/.24;x.save();x.translate((Math.random()-.5)*force,(Math.random()-.5)*force);proDraw();x.restore()}else proDraw();drawTutorial()};

const proRewards=rewards;
rewards=function(){proRewards();const panel=$('rwc');if(!panel||typeof panel.querySelectorAll!=='function'||typeof document.createElement!=='function')return;const icons=['✈','★','▲','✦','◎','⚔','◆','⌛','✓','♛'];panel.querySelectorAll('.ai').forEach((card,i)=>{const medal=document.createElement('i');medal.className='medal';medal.textContent=icons[i]||'★';card.insertBefore(medal,card.firstChild)})};
