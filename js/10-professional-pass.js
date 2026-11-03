// 10-professional-pass.js: presentation, onboarding and end-of-campaign polish.
// This layer builds on the campaign without changing its controls or core difficulty.
const PRO_WORLDS=[
  {n:'SUNRISE SKIES',c:'#ffe29a'},
  {n:'STORM FRONT',c:'#a9d6ff'},
  {n:'SUNSET RUN',c:'#ffbd78'},
  {n:'MIDNIGHT FLIGHT',c:'#c1b2ff'},
  {n:'DEEP SPACE',c:'#8fe7ff'},
  {n:'COSMIC FINALE',c:'#ff8cf2'}
];
const proWorld=L=>PRO_WORLDS[Math.min(PRO_WORLDS.length-1,Math.max(0,Math.floor((L-1)/5)))];
let proShake=0,proShakePower=0,proBossIntro=0,proTutorial=-1,proTutorialT=0;

function highScores(){S='menu';show('scores');const list=save.top||[];$('scorec').innerHTML='<p class="sm">Your five best local flights.</p>'+(list.length?list.map((r,i)=>'<div class="mi rank"><span>#'+(i+1)+' · Level '+Math.max(1,Math.min(LEVEL_COUNT,Number(r.level)||1))+'<small>'+Math.max(0,Number(r.stars)||0)+' stars · '+Math.max(0,Number(r.time)||0)+' s · '+(r.date||'local run')+'</small></span><b class="hot">'+Math.max(0,Number(r.score)||0)+'</b></div>').join(''):'<div class="card"><b>No flights yet</b><small>Finish a run to save a high score here.</small></div>')}
function settings(){S='menu';show('settings');const sound=save.snd===false?'Off':'On',effects=save.fx===false?'Reduced':'On';$('setc').innerHTML='<div class="setting"><span><b>Sound</b><small>Stars, upgrades, boss warnings and victory.</small></span><button class="'+(sound==='On'?'on':'')+'" onclick="toggleSnd();settings()">'+sound+'</button></div><div class="setting"><span><b>Screen effects</b><small>Camera shake and enhanced sparks.</small></span><button class="'+(effects==='On'?'on':'')+'" onclick="toggleFx()">'+effects+'</button></div><div class="card"><b>Controls</b><small>Arrow keys or A / D on a keyboard. On touch screens, drag the steering circle.</small></div>'}
function toggleFx(){save.fx=save.fx===false;store();settings()}

const proShow=show;
show=function(id){proShow(id);for(const panel of ['scores','settings','victory'])$(panel).classList.toggle('hide',panel!==id)};

const proSnd=snd;
snd=function(k){
  if(k==='warn'){tone(180,.13,'square',.17,130);setTimeout(()=>tone(130,.18,'square',.17,95),150);return}
  if(k==='win'){tone(523,.16,'triangle',.2,659);setTimeout(()=>tone(659,.16,'triangle',.2,784),150);setTimeout(()=>tone(784,.42,'triangle',.22,1046),300);return}
  proSnd(k)
};

const proStart=start;
start=function(){proStart();proTutorial=save.tutorial? -1:0;proTutorialT=0;proShake=0;proBossIntro=0;$('unlock').classList.add('hide');$('boss-intro').classList.add('hide')};

function showUnlock(){const card=$('unlock'),weapon=WPN[lv]?WPN[lv].n:'Evasive flying';card.innerHTML='<img src="'+SPRD[lv-1]+'" alt=""><span><b>NEW PLANE · LEVEL '+lv+'</b><small>'+LV[lv-1]+' · '+weapon+' · '+proWorld(lv).n+'</small></span>';card.classList.remove('hide');setTimeout(()=>card.classList.add('hide'),2600)}
const proEvo=evo;
evo=function(){const before=lv;proEvo();if(lv>before)showUnlock()};

function showBossIntro(){if(!B)return;proBossIntro=2.6;const card=$('boss-intro');card.innerHTML='WARNING: '+BOSS[B.L].n+'<small>Survive the encounter or destroy its threat</small>';card.classList.remove('hide')}
const proStartBoss=startBoss;
startBoss=function(L){proStartBoss(L);showBossIntro();snd('warn');shake(7)};

function finishVictory(){
  const earned=(Math.floor(t)+stars*5+bonus)*M().mult,k='play',isBest=earned>save.best[k];
  save.pts+=earned;if(isBest)save.best[k]=earned;save.stat.runs++;save.stat.bestLv=Math.max(save.stat.bestLv,peakLv);save.stat.bestT=Math.max(save.stat.bestT,Math.floor(t));mEvent('surv',Math.floor(t));mEvent('lvl',peakLv);mEvent('bonus',bonus);chkAch();
  save.top.push({id:Date.now()+'-'+Math.random().toString(36).slice(2),score:earned,level:peakLv,stars,time:Math.floor(t),date:today()});save.top.sort((a,b)=>(b.score||0)-(a.score||0)||(b.level||0)-(a.level||0));save.top=save.top.slice(0,5);store();
  S='victory';st=[];show('victory');$('vic').innerHTML='<img class="victory-plane" src="'+SPRD[peakLv-1]+'" alt=""><b>Campaign complete</b><span class="victory-zone">'+proWorld(peakLv).n+'</span><span class="victory-score">'+earned+' points</span><small>Level '+peakLv+' · '+stars+' stars · '+Math.floor(t)+' seconds'+(isBest?' · New best score!':'')+'</small>';
  snd('win');shake(12)
}
const proEndBoss=endBoss;
endBoss=function(){const finalBoss=!!(B&&B.k==='final');proEndBoss();if(finalBoss)finishVictory()};

function shake(power){if(save.fx!==false){proShake=Math.max(proShake,.24);proShakePower=Math.max(proShakePower,power)}}
const proBoom=boom;
boom=function(px,py,color,count){proBoom(px,py,color,count);if(save.fx!==false){const extra=Math.min(10,Math.max(2,Math.floor(count/4)));for(let i=0;i<extra;i++){const a=Math.random()*TAU,v=rnd(70,260);pt.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.35,m:.35,c:'255,240,180',r:rnd(1,3)})}shake(count>=20?6:2)}};

const proCtxStar=ctxStar;
ctxStar=function(px,py,rot){proCtxStar(px,py,rot);if(save.fx===false)return;const pulse=1+Math.sin(t*6+rot)*.18;x.save();x.translate(px,py);x.globalAlpha=.35;x.strokeStyle='#fff4b0';x.lineWidth=1.5;x.beginPath();x.moveTo(-18*pulse,0);x.lineTo(18*pulse,0);x.moveTo(0,-18*pulse);x.lineTo(0,18*pulse);x.stroke();x.restore()};
const proDrawSpr=drawSpr;
drawSpr=function(i,alpha,scale){if((S==='play'||S==='paused')&&save.fx!==false){x.save();x.globalAlpha=alpha*.9;const flame=18*scale+Math.random()*9;x.fillStyle='#ff7b42';x.beginPath();x.moveTo(-sz()*.38,0);x.lineTo(-sz()*.38-flame,-5);x.lineTo(-sz()*.38-flame,5);x.closePath();x.fill();x.fillStyle='#ffe27a';x.beginPath();x.moveTo(-sz()*.38,0);x.lineTo(-sz()*.38-flame*.62,-2.4);x.lineTo(-sz()*.38-flame*.62,2.4);x.closePath();x.fill();x.restore()}proDrawSpr(i,alpha,scale)};

function drawWorldAtmosphere(){const world=proWorld(Math.round(S==='menu'?1:lv));if(world.n==='STORM FRONT'){x.save();x.strokeStyle='rgba(205,232,255,.28)';x.lineWidth=1;for(let i=0;i<26;i++){const q=(i*73+t*180)%Math.max(1,W+H),px=(q%W),py=(q*1.7%H);x.beginPath();x.moveTo(px,py);x.lineTo(px-14,py+32);x.stroke()}if(Math.sin(t*2.7)> .986){x.fillStyle='rgba(235,248,255,.16)';x.fillRect(0,0,W,H)}x.restore()}else if(world.n==='DEEP SPACE'||world.n==='COSMIC FINALE'){x.save();const g=x.createRadialGradient(W*.78,H*.2,0,W*.78,H*.2,W*.32);g.addColorStop(0,world.n==='COSMIC FINALE'?'rgba(255,105,220,.2)':'rgba(80,218,255,.16)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);x.restore()}}
const proDrawSky=drawSky;
drawSky=function(){proDrawSky();drawWorldAtmosphere()};

function updateTutorial(d){if(proTutorial<0||S!=='play')return;if(proTutorial===0&&(jAng!==null||keys.ArrowLeft||keys.ArrowRight||keys.a||keys.d))proTutorial=1;if(proTutorial===1&&stars>0)proTutorial=2;if(proTutorial===2&&(ms.length>0||t>8)){proTutorial=3;proTutorialT=4.5}if(proTutorial===3){proTutorialT-=d;if(proTutorialT<=0){save.tutorial=true;store();proTutorial=-1}}}
function drawTutorial(){if(proTutorial<0||S!=='play')return;const copy=['MOVE · Use arrows, A / D, or the steering circle','COLLECT · Fly into the glowing star','DODGE · Keep away from red missiles','READY · Evolve every five stars!'][proTutorial];const w=Math.min(W-28,420),h=44,px=(W-w)/2,py=H>500?H-112:Math.max(142,H-90);glass(px,py,w,h,14);x.font='17px Pixelta,monospace';x.textAlign='center';x.fillStyle=proTutorial===2?'#ffb0a6':'#fff3e0';x.fillText(copy,W/2,py+28);x.textAlign='left'}
const proUpd=upd;
upd=function(d){proUpd(d);proShake=Math.max(0,proShake-d*2.8);proBossIntro=Math.max(0,proBossIntro-d);if(proBossIntro<=0)$('boss-intro').classList.add('hide');updateTutorial(d)};
const proDraw=draw;
draw=function(){if(proShake>0&&save.fx!==false){const force=proShakePower*proShake/.24;x.save();x.translate((Math.random()-.5)*force,(Math.random()-.5)*force);proDraw();x.restore()}else proDraw();drawTutorial()};

const proRewards=rewards;
rewards=function(){proRewards();const panel=$('rwc');if(!panel||typeof panel.querySelectorAll!=='function'||typeof document.createElement!=='function')return;const icons=['✈','★','▲','✦','◎','⚔','◆','⌛','✓','♛'];panel.querySelectorAll('.ai').forEach((card,i)=>{const medal=document.createElement('i');medal.className='medal';medal.textContent=icons[i]||'★';card.insertBefore(medal,card.firstChild)})};
