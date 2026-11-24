// 07-game.js: Game state, screen navigation, start/die/evolve/hurt, main update and draw
// Classic script (no modules): all files share one global scope and load in numeric order.
let menuOn=true,S='menu',pl={x:0,y:0,a:0},ms=[],st=[],pu=[],pt=[],t=0,stars=0,shield=0,sp=150,msT=0,puT=0,dieT=0,keys={},hint=0;
const clouds=Array.from({length:8},(_,i)=>({layer:[.6,1,1.4][i%3],x:Math.random(),y:Math.random(),s:50+Math.random()*90,v:6+Math.random()*12}));
const rnd=(a,b)=>a+Math.random()*(b-a),wrap=(v,m)=>(v+m)%m,angd=(a,b)=>((a-b+Math.PI*3)%TAU)-Math.PI;

let adScreenSerial=0;
let adBreakPending=false,adBreakTimer=null;
function finishAdBreak(serial){if(!adBreakPending||serial!==adScreenSerial)return;adBreakPending=false;if(adBreakTimer!==null){clearTimeout(adBreakTimer);adBreakTimer=null}const over=$('over');if(over&&over.querySelectorAll)over.querySelectorAll('.row button').forEach(b=>b.disabled=false);if(typeof refreshRewardedRescue==='function')refreshRewardedRescue()}
window.onInterstitialDecisionComplete=finishAdBreak;
window.claimInterstitialDecision=function(serial){if(!adBreakPending||serial!==adScreenSerial||S!=='over')return false;if(adBreakTimer!==null){clearTimeout(adBreakTimer);adBreakTimer=null}return true};
function beginAdBreak(){adBreakPending=true;const serial=adScreenSerial,over=$('over');if(over&&over.querySelectorAll)over.querySelectorAll('.row button').forEach(b=>b.disabled=true);adBreakTimer=setTimeout(()=>finishAdBreak(serial),5000)}
function show(id){adScreenSerial++;try{if(window.DodgewingAds&&typeof window.DodgewingAds.setGameScreen==='function')window.DodgewingAds.setGameScreen(id||'play',adScreenSerial)}catch(e){}if(typeof refreshNativeRescue==='function')refreshNativeRescue();menuOn=id==='menu';['menu','over','hangar','pause','resume-countdown','rw','help'].forEach(k=>$(k).classList.toggle('hide',k!==id));$('joy').classList.toggle('hide',id!==null);$('pb').classList.toggle('hide',id!==null);$('ab').classList.toggle('hide',id!==null)}
let pauseSkyTime=0;
function applyPauseVisualState(){$('game-viewport').classList.add('pause-visual')}
function clearPauseVisualState(){$('game-viewport').classList.remove('pause-visual')}
function showPauseModal(){$('pause-forge').hidden=!!flightMode;$('skip-tutorial').hidden=save.tutorial===true;applyPauseVisualState();show('pause')}
function hidePauseModal(){$('pause').classList.add('hide');clearPauseVisualState()}
function pauseG(){if(S==='play'||S==='countdown'){pauseSkyTime=performance.now()/1000;S='paused';stopBuzz();resumeT=0;resumeTick=0;keys={};joyRel();showPauseModal();store()}}
function startResumeCountdown(){if(S!=='paused')return;S='countdown';resumeT=3;resumeTick=3;keys={};joyRel();hidePauseModal();$('resume-count').textContent='3';show('resume-countdown');snd('count')}
function resume(){startResumeCountdown()}
function menu(){if(adBreakPending||rewardedRescuePending)return;if(S!=='menu'&&save.nativeRescueInFlight){delete save.nativeRescueInFlight;store()}S='menu';stopBuzz();resumeT=0;resumeTick=0;keys={};pt=[];engineTrailClock=0;joyRel();hidePauseModal();show('menu');$('sn').classList.toggle('off',save.snd===false);$('pc').textContent=save.pts+' · ◈ '+save.coins;dayMis();layoutShow()}
function hangar(){S='menu';show('hangar');$('hp').innerHTML='<span class="balance"><svg class="si"><use href="#i-star"/></svg><span>'+save.pts+'</span></span><span class="balance"><span aria-label="Coins">◈</span><span>'+save.coins+'</span></span>';const bl=save.campaign.selected;
  $('hl').innerHTML=PLANES.map((p,i)=>{const own=save.own.includes(i),sel=save.sel===i;
    const b=own?`<button ${sel?'class="on" disabled':''} onclick="pick(${i})">${sel?'Equipped':'Equip'}</button>`:`<button ${save.pts<p.p?'disabled':''} onclick="buy(${i})">Buy ${p.p} pts</button>`;
    return `<div class="pc${sel?' sel':''}"><img src="${SPRD[bl-1]}" style="filter:drop-shadow(0 0 14px ${p.c}) drop-shadow(0 6px 4px rgba(0,0,0,.5))" alt=""><span>${p.n}</span><small>${own?'Owned':'Locked'}</small>${b}</div>`}).join('');
}
function pick(i){save.sel=i;store();hangar()}
function buy(i){if(save.pts>=PLANES[i].p){save.pts-=PLANES[i].p;save.own.push(i);save.sel=i;store();hangar()}}

function addStar(){if(st.length||B)return;let px,py;for(let i=0;i<8;i++){px=rnd(40,W-40);py=rnd(Math.min(110,H*.4),Math.max(Math.min(110,H*.4),H-160));if(Math.hypot(px-pl.x,py-pl.y)>120)break}st.push({x:px,y:py,r:rnd(0,TAU)})}
function start(){if(adBreakPending||rewardedRescuePending)return;hidePauseModal();keys={};rewardedRescueUsed=false;rewardedRescuePending=false;initAudio();S='play';pl={x:W/2,y:H/2,a:-Math.PI/2};ms=[];st=[];pu=[];pt=[];engineTrailClock=0;armorCooldown=0;jammerTime=0;obs=[];t=0;stars=0;shield=0;msT=1.5;puT=12;obT=6;wind=0;abilityCd=0;boost=0;over=0;runCoins=0;resumeT=0;resumeTick=0;damageFlash=0;shieldFlash=0;hudStarPop=0;hudCoinPop=0;evolveBurst=0;hint=4;lv=1;prevLv=1;upT=0;fadeT=0;banT=0;evoStars=0;inv=0;B=null;bossSeen={};fx=[];bl=[];wcd=[];wLv=0;skyL=1;joyRel();nmCombo=0;nmT=0;bonus=0;mag=0;slow=0;runNew=[];dnT=0;peakLv=1;banTx='';trailC=hexRgb(PLANES[save.sel].c);
  sp=planeSpeed(lv);addStar();show(null);syncAbilityButton()}
function missileKind(L,r){if(L<8)return 'standard';if(L>=17&&r>.82)return 'armored';if(L>=12&&r>.58)return 'weaver';if(r>.25)return 'interceptor';return 'standard'}
function spawnMissile(){const m=30,kind=missileKind(lv,Math.random());
  const hp=lv>=25?3:lv>=17?2:1,base=sp*levelPressure().speed*(M().v0+(M().v1-M().v0)*difficulty(lv));
  const cfg={standard:[1,1],interceptor:[1.3,.78],weaver:[1.05,1],armored:[.72,1.3]}[kind];
  // Prefer a reaction window without changing projectile speed or hitboxes.
  const minDistance=base*cfg[0]*.65+sz()*.25*cfg[1];let spot=null,best=-1;
  for(let i=0;i<8;i++){const side=Math.random()*4|0,candidate={x:side===0?-m:side===1?W+m:rnd(0,W),y:side===2?-m:side===3?H+m:rnd(0,H)},distance=Math.hypot(candidate.x-pl.x,candidate.y-pl.y);if(distance>best){best=distance;spot=candidate}if(distance>=minDistance)break}
  if(best<minDistance)for(const candidate of [{x:-m,y:0},{x:-m,y:H},{x:W+m,y:0},{x:W+m,y:H}]){const distance=Math.hypot(candidate.x-pl.x,candidate.y-pl.y);if(distance>best){best=distance;spot=candidate}}
  const {x,y}=spot;ms.push({x,y,warning:.5*levelPressure().warning,a:Math.atan2(pl.y-y,pl.x-x),life:M().chase,v:base*cfg[0],hp,hp0:hp,kind,r:cfg[1],phase:rnd(0,TAU),h:kind==='armored'?.7:kind==='weaver'?1.15:1,skin:normalMissileSkin(lv)});decorateThreat(ms[ms.length-1])}
const particleLimit=()=>lowGraphics()?70:phone()?150:240;
let engineTrailClock=0;
function pushParticle(p){if(pt.length>=particleLimit())return false;pt.push(p);return true}
function engineTail(){const im=SPR[lv-1],h=im&&im.naturalWidth&&im.naturalHeight?playerDrawSize()*im.naturalHeight/Math.max(im.naturalWidth,im.naturalHeight):playerDrawSize();const back=h*.4;return{x:pl.x-Math.cos(pl.a)*back,y:pl.y-Math.sin(pl.a)*back}}
function emitEngineTrail(d){if(save.fx===false||reducedMotion())return;engineTrailClock-=d;if(engineTrailClock>0||pt.length>=particleLimit()*.55)return;engineTrailClock=lowGraphics()?.24:.12;const tail=engineTail(),power=boost>0?1.35:1;pushParticle({x:tail.x,y:tail.y,vx:-Math.cos(pl.a)*24*power,vy:-Math.sin(pl.a)*24*power,l:.35*power,m:.35*power,c:trailC,r:2.1,trail:true})}
function clearFlightTrails(){pt=pt.filter(p=>!p.trail);engineTrailClock=0}
function boom(x,y,c,n){if(n>=8)pushParticle({x,y,vx:0,vy:0,l:.2,m:.2,c,r:5,blast:true});for(let i=0;i<n&&pt.length<particleLimit();i++){const a=rnd(0,TAU),v=rnd(40,220);pushParticle({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.7,m:.7,c,r:rnd(2,4)})}}
function die(){if(save.nativeRescueInFlight)delete save.nativeRescueInFlight;clearFlightTrails();if(typeof clearBossIntro==='function')clearBossIntro();rewardedRescueLevel=lv;S='dying';dieT=.8;damageFlash=1;snd('boom');buzz(55);B=null;bl=[];joyRel();save.stat.runs++;save.stat.bestLv=Math.max(save.stat.bestLv,peakLv);save.stat.bestT=Math.max(save.stat.bestT,Math.floor(t));mEvent('surv',Math.floor(t));mEvent('lvl',peakLv);mEvent('bonus',bonus);chkAch();boom(pl.x,pl.y,'255,179,71',36);
  const earned=flightScore(),k='play';recordModeBest(earned);save.pts+=earned;
  const nb=earned>save.best[k];if(nb)save.best[k]=earned;
  const runId=Date.now()+'-'+Math.random().toString(36).slice(2),entry={id:runId,score:earned,level:peakLv,stars,time:Math.floor(t),date:today()};
  save.top.push(entry);save.top.sort((a,b)=>(b.score||0)-(a.score||0)||(b.level||0)-(a.level||0));save.top=save.top.slice(0,5);store();
  showRes(earned,nb,k);refreshContinue()}

function evo(){}
function hurt(){prevLv=lv;evoStars=Math.max(0,starStarts[Math.max(1,lv-M().drop)]);lv=lvOf(evoStars);sp=planeSpeed(lv);upT=0;dnT=1;fadeT=.5;damageFlash=.75;inv=M().prot;banT=2.4;banTx='HIT! Back to Level '+lv+': '+LV[lv-1];banC='#ff6b5e';banIc=1;snd('dn');buzz(35);boom(pl.x,pl.y,'255,107,94',22);syncAbilityButton()}
function upd(d){
  if(S==='paused')return;
  if(S==='countdown'){resumeT=Math.max(0,resumeT-d);const tick=Math.ceil(resumeT);if(tick>0&&tick<resumeTick){resumeTick=tick;$('resume-count').textContent=String(tick);snd('count')}if(resumeT<=0){S='play';resumeTick=0;keys={};show(null);snd('up')}return}
  updateSky(d);
  damageFlash=Math.max(0,damageFlash-d*1.7);shieldFlash=Math.max(0,shieldFlash-d*2);hudStarPop=Math.max(0,hudStarPop-d*2.8);hudCoinPop=Math.max(0,hudCoinPop-d*2.8);evolveBurst=Math.max(0,evolveBurst-d*1.2);
  if(S==='play'){
    if(chapterNoticeTime>0&&(chapterNoticeTime-=d)<=0)$('chapter-notice').classList.add('hide');
    t+=d;musicTick(d);hint-=d;upT=Math.max(0,upT-d);fadeT=Math.max(0,fadeT-d);banT=Math.max(0,banT-d);inv=Math.max(0,inv-d);dnT=Math.max(0,dnT-d);nmT=Math.max(0,nmT-d);mag=Math.max(0,mag-d);slow=Math.max(0,slow-d);trailC=curTrail();updFx(d);if(B){if(proBossIntro>0)inv=Math.max(inv,.2);else{bossTick(d);if(B&&(B.t>=B.T||B.hp<=0))endBoss()}}if(S!=='play')return;updateObstacles(d);if(S!=='play')return;
    armorCooldown=Math.max(0,armorCooldown-d);jammerTime=Math.max(0,jammerTime-d);
    const tr=3.4*d*turnFactor()*(directPointer===null?1:dragStrength);
    if(keys.ArrowLeft||keys.a)pl.a-=tr;if(keys.ArrowRight||keys.d)pl.a+=tr;
    if(jAng!==null)pl.a+=Math.max(-tr,Math.min(tr,angd(jAng,pl.a)));
    const flightSpeed=sp*engineBoost()*(boost>0?1.25:wind>0?.72:1);pl.x=wrap(pl.x+Math.cos(pl.a)*flightSpeed*d,W);pl.y=wrap(pl.y+Math.sin(pl.a)*flightSpeed*d,H);emitEngineTrail(d);fireTick(d);bulletTick(d);
    if(B&&B.hp<=0){endBoss();if(S!=='play')return}
    if(shield>0)shield-=d;
    msT-=d;
    if(msT<=0){
      const pressure=levelPressure();
      const maxThreats=mission?Math.min(pressure.missileCap,cap(lv)):cap(lv);
      const bossAllowance=B?(B.k==='heavy'||B.k==='adv'?.4:0):1;
      if(ms.filter(m=>!m.bm).length<Math.floor(maxThreats*bossAllowance))spawnMissile();
      const minimumInterval=mission?pressure.minimumInterval:0;
      msT=Math.max(minimumInterval,M().s0+(M().s1-M().s0)*difficulty(lv))*levelPressure().spawn;
    }
    puT-=d;if(puT<=0){pu.push({x:rnd(60,W-60),y:rnd(80,H-60),ty:PUT[Math.random()*PUT.length|0]});puT=rnd(11,17)}
    for(let i=st.length-1;i>=0;i--){const s=st[i];s.r+=d*2;if(mag>0){const q=Math.hypot(pl.x-s.x,pl.y-s.y);if(q<magnetRange()&&q>1){s.x+=(pl.x-s.x)/q*300*d;s.y+=(pl.y-s.y)/q*300*d}}if(Math.hypot(s.x-pl.x,s.y-pl.y)<sz()*.36){st.splice(i,1);stars++;hudStarPop=1;snd('star');buzz(10);if(mission)collectMissionStar();else evo();awardCoins(4,s.x,s.y);save.stat.stars++;mEvent('stars',1);chkAch();boom(s.x,s.y,'255,224,102',8);if(!mission&&!B&&S==='play')addStar()}}
    if(S!=='play')return;
    for(let i=pu.length-1;i>=0;i--)if(Math.hypot(pu[i].x-pl.x,pu[i].y-pl.y)<sz()*.4){const ty=pu[i].ty||'s';pu.splice(i,1);snd('pu');fx.push({x:pl.x,y:pl.y-34,s:PUN[ty],l:1,c:PUC[ty][0]});if(ty==='m')mag=8;else if(ty==='l')slow=6;else{shield=shieldTime();shieldFlash=.4}save.stat.pu++;mEvent('pu',1)}
    for(let i=ms.length-1;i>=0;i--){const m=ms[i],hh=m.h===undefined?1:m.h,tr2=(1.3+.9*difficulty(lv))*(M().turn0+(M().turn1-M().turn0)*difficulty(lv))*d*hh;
      if(B&&proBossIntro>0&&m.bm)continue;
      if(m.warning>0){m.warning-=d;continue}
      let tx=pl.x,ty=pl.y,v=m.v;if(m.kind==='weaver'){tx+=Math.sin(t*4+m.phase)*95;ty+=Math.cos(t*3+m.phase)*65}
      if(m.st){m.stT-=d;
        if(m.st==='chase'){if(m.stT<=0){m.st='warn';m.stT=1.2}}
        else if(m.st==='warn'){v=0;if(m.stT>.3)m.a=Math.atan2(ty-m.y,tx-m.x);if(m.stT<=0){m.st='dash';m.stT=1.3}}
        else{v=m.v*3;if(m.stT<=0){m.st='chase';m.stT=4.5}}}
      if(!jammerTime&&hh&&m.st!=='warn'&&m.st!=='dash')m.a+=Math.max(-tr2,Math.min(tr2,angd(Math.atan2(ty-m.y,tx-m.x),m.a)));
      if(slow>0)v*=.55;m.x+=Math.cos(m.a)*v*d;m.y+=Math.sin(m.a)*v*d;m.life-=d;
      m.smokeT=(m.smokeT||0)-d;if(m.smokeT<=0){m.smokeT=lowGraphics()?.2:.1;if(pt.length<particleLimit()*.55)pushParticle({x:m.x-Math.cos(m.a)*10,y:m.y-Math.sin(m.a)*10,vx:0,vy:0,l:.42,m:.42,c:m.adv?'165,165,215':smokeC,r:m.big?3.5:2.5,trail:true,owner:m})}
      if(m.life<=0){boom(m.x,m.y,'200,200,210',6);ms.splice(i,1);continue}
      const dd=Math.hypot(m.x-pl.x,m.y-pl.y),keep=m.big||m.adv;
      if(dd<sz()*.25*(m.r||1)){
        if(inv>0){if(!keep){boom(m.x,m.y,'200,200,210',8);ms.splice(i,1)}}
        else if(shield>0){shield=0;inv=.8;shieldFlash=.4;snd('hit');buzz(22);boom(m.x,m.y,'110,200,255',20);if(keep)inv=.8;else ms.splice(i,1)}
        else if(absorbImpact()){ms.splice(i,1)}
        else if(lv>1){hurt();if(!keep&&ms[i]===m)ms.splice(i,1);break}
        else{die();break}}
      else if(dd<sz()*.75*(m.r||1)){m.nmIn=1}
      else if(m.nmIn&&!m.nm){m.nm=1;nearMiss()}}
  }
  if(S==='dying'){dieT-=d;if(dieT<=0){S='over';show('over');refreshRewardedRescue();try{if(window.DodgewingAds&&typeof window.DodgewingAds.onGameOver==='function'){if(typeof window.DodgewingAds.setGameScreen==='function')beginAdBreak();window.DodgewingAds.onGameOver(t,adScreenSerial)}}catch(e){finishAdBreak(adScreenSerial)}}}
  for(let i=pt.length-1;i>=0;i--){const p=pt[i];p.x+=p.vx*d;p.y+=p.vy*d;p.l-=d;if(p.l<=0||(p.owner&&!ms.includes(p.owner)))pt.splice(i,1)}
  const particleCap=particleLimit();if(pt.length>particleCap)pt.splice(0,pt.length-particleCap);
  for(const c of clouds){c.x-=c.v*.72*d/W;c.y+=c.v*1.05*c.layer*d/H;if(c.x<-.2)c.x=1.2;if(c.y>1.25)c.y-=1.5}
}

function draw(){
  frame();
  drawSky();chapterTint();x.fillStyle=cloudC;
  for(const c of clouds){x.beginPath();x.ellipse(c.x*W,c.y*H,c.s,c.s*.28,0,0,TAU);x.fill();x.beginPath();x.ellipse(c.x*W,c.y*H,c.s*.65,c.s*.18,0,0,TAU);x.fill()}
  const homeScene=S==='menu'&&menuOn;
  if(!homeScene){
  for(const s of st){ctxStar(s.x,s.y,s.r)}
  for(const p of pu)drawPowerIcon(p.ty||'s',p.x,p.y,30);
  drawObstacles();
  for(const p of pt){if(p.blast){x.save();x.globalAlpha=Math.max(0,p.l/p.m)*.6;x.strokeStyle='rgb('+p.c+')';x.lineWidth=2;x.beginPath();x.arc(p.x,p.y,p.r+(1-p.l/p.m)*15,0,TAU);x.stroke();x.restore()}else ctxDot(p.x,p.y,p.r,'rgba('+p.c+','+Math.max(0,p.l/p.m)+')')}
  for(const m of ms){if(m.warning>0){const ex=Math.max(12,Math.min(W-12,m.x)),ey=Math.max(12,Math.min(H-12,m.y));ctxDot(ex,ey,10,"#98351f");x.fillStyle="#fff";x.font=canvasFont(15);x.textAlign="center";x.fillText("!",ex,ey+5);x.textAlign="left";continue}x.save();x.translate(m.x,m.y);x.rotate(m.a);
    if(m.r>1&&!Number.isFinite(m.bossSkin))x.scale(m.r,m.r);drawEnemyMissile(m);if(m.st==='warn'){x.strokeStyle='rgba(255,60,60,'+(m.stT<.3?.9:.45)+')';x.lineWidth=3;x.beginPath();x.moveTo(20,0);x.lineTo(700,0);x.stroke()}x.restore()}
  drawBullets();
  }
  if(homeScene)showcase();
  if(S==='play'||S==='paused'||S==='countdown'){x.save();x.translate(pl.x,pl.y);x.rotate(pl.a+Math.PI/2);
    x.shadowColor='rgba('+trailC+',.8)';x.shadowBlur=lowGraphics()?0:10;
    const pop=reducedMotion()?1:1+.3*Math.sin(Math.min(1,upT/1.4)*Math.PI),ia=inv>0&&!reducedMotion()&&Math.floor(t*14)%2?.35:1;
    if(fadeT>0){const f=fadeT/.5;drawSpr(prevLv-1,f*ia,pop);drawSpr(lv-1,(1-f)*ia,pop)}else drawSpr(lv-1,ia,pop);
    x.shadowBlur=0;
    drawLoadout(x,playerDrawSize(),save.campaign.planes[lv-1],save.campaign.core);
    if(shield>0){const sa=shield<1.5&&!reducedMotion()?.5+.5*Math.sin(t*20):1;x.fillStyle='rgba(110,200,255,'+.12*sa+')';x.beginPath();x.arc(0,0,playerDrawSize()*.4,0,TAU);x.fill();x.shadowColor='rgba(110,200,255,.9)';x.shadowBlur=lowGraphics()?0:14;x.strokeStyle='rgba(150,220,255,'+sa+')';x.lineWidth=2.5;x.beginPath();x.arc(0,0,playerDrawSize()*.4,0,TAU);x.stroke();x.shadowBlur=0}
    x.restore();
    drawHud();drawFx();
    if(upT>0){const p=upT/1.4;x.strokeStyle='rgba(255,224,102,'+p+')';x.lineWidth=4;x.beginPath();x.arc(pl.x,pl.y,playerDrawSize()*(.4+(1-p)*1.6),0,TAU);x.stroke()}
    if(dnT>0){x.strokeStyle='rgba(255,107,94,'+dnT+')';x.lineWidth=4;x.beginPath();x.arc(pl.x,pl.y,playerDrawSize()*(.4+(1-dnT)*1.2),0,TAU);x.stroke()}
    if(evolveBurst>0&&!reducedMotion()){x.save();x.globalAlpha=evolveBurst*.55;x.strokeStyle='#ffe066';x.lineWidth=2;x.setLineDash([5,7]);x.beginPath();x.arc(pl.x,pl.y,playerDrawSize()*(.6+(1-evolveBurst)*2.2),0,TAU);x.stroke();x.restore()}
    if(damageFlash>0){x.save();x.globalAlpha=damageFlash*.28;x.fillStyle='#ff423c';const e=Math.max(18,Math.min(W,H)*.055);x.fillRect(0,0,W,e);x.fillRect(0,H-e,W,e);x.fillRect(0,0,e,H);x.fillRect(W-e,0,e,H);x.restore()}
    if(shieldFlash>0){x.save();x.globalAlpha=shieldFlash*.18;x.fillStyle='#67d5ff';x.fillRect(0,0,W,H);x.restore()}
    if(banT>0){const a=Math.min(1,banT/.5),tx=banTx,py=B?220+(shield>0||mag>0||slow>0?48:0):(shield>0||mag>0||slow>0?152:108);const ic=banIc?40:0,fs=Math.max(12,Math.min(22,Math.floor((W-60-ic)/(tx.length*.5))));x.font=canvasFont(fs);x.textAlign='center';const w=x.measureText(tx).width+36+ic;x.globalAlpha=a;x.fillStyle='rgba(20,18,50,.78)';x.beginPath();x.roundRect(W/2-w/2,py,w,40,12);x.fill();x.strokeStyle='rgba(255,243,224,.28)';x.lineWidth=1;x.stroke();if(ic){const im=SPR[lv-1];if(im.complete&&im.naturalWidth){const k=34/Math.max(im.naturalWidth,im.naturalHeight);x.drawImage(im,W/2-w/2+8,py+3+(34-im.naturalHeight*k)/2,im.naturalWidth*k,im.naturalHeight*k)}}x.fillStyle=banC;x.fillText(tx,W/2+ic/2,py+28);x.globalAlpha=1;x.textAlign='left';x.font=canvasFont(20)}
    if(hint>0&&(typeof proTutorial==='undefined'||proTutorial<0)){x.textAlign='center';ctxA(Math.min(1,hint));otext(save.controlMode==='touch'?'Drag to steer':phone()?'Drag the circle to steer':'Drag the circle, or use arrow keys / A, D',W/2,H-172,'#fff3e0');ctxA(1);x.textAlign='left'}}
}
