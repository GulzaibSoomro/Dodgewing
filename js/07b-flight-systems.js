// 07b-flight-systems.js: Persistent upgrades, checkpoints, signature abilities and world obstacles.
// Classic script: globals are shared with the campaign modules.
const UPGRADES=[
  {id:'eng',n:'Engine tune',d:'+3% flight speed per rank',cost:[40,80,140,220]},
  {id:'shield',n:'Shield core',d:'+1 second shield duration per rank',cost:[45,90,150,230]},
  {id:'magnet',n:'Magnet array',d:'+55 px star pull range per rank',cost:[45,90,150,230]},
  {id:'weapon',n:'Weapon calibrator',d:'+12% weapon damage per rank',cost:[60,120,190,280]}
];
const checkpointLevels=[1,5,10,15,20,25];
const upgradeRank=id=>Math.max(0,Math.min(4,save.upg[id]||0));
const upgradeCost=id=>{const u=UPGRADES.find(q=>q.id===id),r=upgradeRank(id);return u&&r<4?u.cost[r]:0};
const engineBoost=()=>1+upgradeRank('eng')*.03;
const shieldTime=()=>5+upgradeRank('shield');
const magnetRange=()=>260+upgradeRank('magnet')*55;
const weaponBoost=()=>1+upgradeRank('weapon')*.12;
function buyUpgrade(id){const cost=upgradeCost(id);if(!cost||save.coins<cost)return false;save.coins-=cost;save.upg[id]=upgradeRank(id)+1;store();snd('up');buzz(18);hangar();return true}
function upgradeCards(){return UPGRADES.map(u=>{const rank=upgradeRank(u.id),cost=upgradeCost(u.id),max=rank>=4;return '<div class="upgrade-card"><span><b>'+u.n+' · '+rank+'/4</b><small>'+u.d+'</small></span><button '+(max||save.coins<cost?'disabled':'')+' onclick="buyUpgrade(\''+u.id+'\')">'+(max?'MAX':'◈ '+cost)+'</button></div>'}).join('')}

let obs=[],obT=6,wind=0,abilityCd=0,boost=0,over=0,runCoins=0;
const ABILITIES=[
  {key:'G',n:'GUARD PULSE',cd:22},
  {key:'M',n:'STAR PULL',cd:20},
  {key:'T',n:'TIME BRAKE',cd:22},
  {key:'O',n:'OVERDRIVE',cd:24},
  {key:'B',n:'AFTERBURNER',cd:24},
  {key:'N',n:'NOVA WAVE',cd:28}
];
const abilityFor=L=>ABILITIES[Math.min(ABILITIES.length-1,Math.max(0,Math.floor((Math.max(1,L)-1)/5)))];
function syncAbilityButton(){const b=$('ab');if(!b)return;const a=abilityFor(lv);b.textContent=abilityCd>0?Math.ceil(abilityCd)+'s':a.key;b.title=abilityCd>0?a.n+' recharging':a.n;b.setAttribute&&b.setAttribute('aria-label',a.n)}
function useAbility(){if(S!=='play'||abilityCd>0)return false;const a=abilityFor(lv);abilityCd=a.cd;
  if(a.key==='G')shield=Math.max(shield,3+upgradeRank('shield')*.5);
  else if(a.key==='M')mag=Math.max(mag,9);
  else if(a.key==='T')slow=Math.max(slow,7);
  else if(a.key==='O')over=7;
  else if(a.key==='B')boost=6;
  else{let cleared=0;for(let i=ms.length-1;i>=0;i--){const m=ms[i];if(!m.bm&&Math.hypot(m.x-pl.x,m.y-pl.y)<Math.max(W,H)*.34){boom(m.x,m.y,'120,220,255',8);ms.splice(i,1);cleared++}}if(cleared)awardCoins(cleared,pl.x,pl.y);}
  fx.push({x:pl.x,y:pl.y-38,s:a.n,l:1.25,c:'#9fefff'});snd('ability');buzz(14);syncAbilityButton();return true}

function awardCoins(n,px,py){if(!(n>0))return;save.coins+=Math.floor(n);runCoins+=Math.floor(n);if(px!==undefined&&py!==undefined&&n>=8)fx.push({x:px,y:py-28,s:'◈ +'+Math.floor(n),l:1.15,c:'#ffe066'})}
function unlockCheckpoint(L){if(!checkpointLevels.includes(L)||L<=save.cp||L>=LEVEL_COUNT)return;save.cp=L;store();fx.push({x:W/2,y:188,s:'CHECKPOINT · LEVEL '+L,l:1.8,c:'#9fefff'});snd('checkpoint');buzz(20)}
function checkpointCost(){const cp=Math.max(1,save.cp||1);return cp>1?20+(cp/5-1)*10:0}
function refreshContinue(){const b=$('cont'),cost=checkpointCost();if(!b)return;const available=cost>0&&save.coins>=cost;b.classList.toggle('hide',!available);b.textContent=available?'Continue Lv '+save.cp+' · ◈ '+cost:'Continue'}
function continueRun(){const cp=Math.max(1,save.cp||1),cost=checkpointCost();if(cp<=1||save.coins<cost)return false;save.coins-=cost;store();start();lv=cp;prevLv=cp;evoStars=(cp-1)*STARS_PER_LEVEL;peakLv=cp;sp=planeSpeed(cp);skyL=cp;inv=3;hint=0;banT=1.7;banTx='CHECKPOINT · LEVEL '+cp;banC='#9fefff';banIc=0;syncAbilityButton();snd('checkpoint');return true}

const obstacleKind=L=>L<6?'cloud':L<11?'mine':L<16?'gate':L<21?'drone':'asteroid';
function spawnObstacle(){const ty=obstacleKind(lv);if(ty==='gate'){obs.push({ty,y:-20,vy:54+lv*1.4,gap:rnd(W*.28,W*.72),gw:Math.max(78,W*.22),life:15});return}
  const e=edge(),a=Math.atan2(H*.5-e.y,W*.5-e.x)+rnd(-.5,.5),v=ty==='cloud'?45:65+lv*2,r=ty==='cloud'?38:ty==='asteroid'?19:16;
  obs.push({ty,x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r,life:13,ph:rnd(0,TAU)})
}
function obstacleHit(i,o){if(o.ty==='cloud'){wind=Math.max(wind,1.35);fx.push({x:pl.x,y:pl.y-34,s:'TURBULENCE',l:.8,c:'#d8eeff'});obs.splice(i,1);return}
  if(inv>0){obs.splice(i,1);return}
  if(shield>0){shield=0;inv=.8;snd('hit');boom(pl.x,pl.y,'110,200,255',14);obs.splice(i,1);buzz(22);return}
  obs.splice(i,1);if(lv>1)hurt();else die()
}
function updateObstacles(d){if(S!=='play')return;wind=Math.max(0,wind-d);abilityCd=Math.max(0,abilityCd-d);boost=Math.max(0,boost-d);over=Math.max(0,over-d);if(Math.floor((abilityCd+d)*2)!==Math.floor(abilityCd*2))syncAbilityButton();
  obT-=d;const max=lowGraphics()?1:2;if(!B&&obT<=0&&obs.length<max){spawnObstacle();obT=rnd(8.5,12.5)}
  for(let i=obs.length-1;i>=0;i--){const o=obs[i];o.life-=d;if(o.ty==='gate')o.y+=o.vy*d;else{o.x+=o.vx*d;o.y+=o.vy*d}if(o.life<=0||o.y>H+60||o.x<-80||o.x>W+80){obs.splice(i,1);continue}
    const contact=o.ty==='gate'?Math.abs(pl.y-o.y)<10&&Math.abs(pl.x-o.gap)>o.gw*.5:Math.hypot(pl.x-o.x,pl.y-o.y)<o.r+sz()*.24;
    if(contact)obstacleHit(i,o)
  }
}
function drawObstacles(){for(const o of obs){x.save();if(o.ty==='gate'){const y=o.y,g=o.gap,w=o.gw;x.strokeStyle='rgba(255,76,92,.78)';x.shadowColor='rgba(255,60,72,.55)';x.shadowBlur=lowGraphics()?0:10;x.lineWidth=5;x.beginPath();x.moveTo(0,y);x.lineTo(g-w/2,y);x.moveTo(g+w/2,y);x.lineTo(W,y);x.stroke();x.fillStyle='#ffcf81';x.fillRect(g-w/2-8,y-8,8,16);x.fillRect(g+w/2,y-8,8,16)}
    else{x.translate(o.x,o.y);x.rotate(o.ph+(o.ty==='asteroid'?t*.35:0));if(o.ty==='cloud'){x.fillStyle='rgba(230,245,255,.28)';x.beginPath();x.ellipse(0,0,o.r*1.35,o.r*.65,0,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.22)';x.beginPath();x.arc(-o.r*.35,-o.r*.1,o.r*.45,0,TAU);x.arc(o.r*.3,0,o.r*.55,0,TAU);x.fill()}else if(o.ty==='mine'){x.fillStyle='#51465f';for(let k=0;k<8;k++){x.rotate(TAU/8);x.fillRect(o.r*.65,-2,o.r*.55,4)}x.beginPath();x.arc(0,0,o.r*.64,0,TAU);x.fill();x.fillStyle='#ff6b5e';x.beginPath();x.arc(0,0,4,0,TAU);x.fill()}else if(o.ty==='drone'){x.fillStyle='#6ee7f7';x.beginPath();x.moveTo(0,-o.r);x.lineTo(o.r*.9,o.r);x.lineTo(0,o.r*.45);x.lineTo(-o.r*.9,o.r);x.closePath();x.fill();x.fillStyle='#151634';x.fillRect(-4,0,8,5)}else{x.fillStyle='#8a8498';x.beginPath();for(let k=0;k<8;k++){const a=k/8*TAU,q=o.r*(.72+((k*17)%5)*.07);x.lineTo(Math.cos(a)*q,Math.sin(a)*q)}x.closePath();x.fill();x.strokeStyle='#d3c9d8';x.lineWidth=1;x.stroke()}}x.restore()}}
