// 07-game.js: Game state, screen navigation, start/die/evolve/hurt, main update and draw
// Classic script (no modules): all files share one global scope and load in numeric order.
let menuOn=true,S='menu',pl={x:0,y:0,a:0},ms=[],st=[],pu=[],pt=[],t=0,stars=0,shield=0,sp=150,msT=0,puT=0,dieT=0,keys={},hint=0;
const clouds=Array.from({length:8},()=>({x:Math.random(),y:Math.random(),s:50+Math.random()*90,v:6+Math.random()*12}));
const rnd=(a,b)=>a+Math.random()*(b-a),wrap=(v,m)=>(v+m)%m,angd=(a,b)=>((a-b+Math.PI*3)%TAU)-Math.PI;

function show(id){menuOn=id==='menu';['menu','over','hangar','pause','rw','help'].forEach(k=>$(k).classList.toggle('hide',k!==id));$('joy').classList.toggle('hide',id!==null);$('pb').classList.toggle('hide',id!==null)}
function pauseG(){if(S==='play'){S='paused';joyRel();show('pause');store()}}
function resume(){if(S==='paused'){S='play';show(null)}}
function menu(){S='menu';show('menu');$('sn').classList.toggle('off',save.snd===false);$('pc').textContent=save.pts;$('thi').src=SPRD[7];layoutShow();$('stats').textContent='Best: '+save.best.play+'  -  Points: '+save.pts+'  -  Missions today: '+dayMis().list.filter(id=>MIS.some(q=>q.id===id)&&save.m.done[id]).length+'/3'}
function hangar(){S='menu';show('hangar');$('hp').innerHTML='<svg class="si"><use href="#i-star"/></svg>'+save.pts;const bl=Math.min(LEVEL_COUNT,Math.max(1,save.stat.bestLv));
  $('hl').innerHTML=PLANES.map((p,i)=>{const own=save.own.includes(i),sel=save.sel===i;
    const b=own?`<button ${sel?'class="on"':''} onclick="pick(${i})">${sel?'Selected':'Select'}</button>`:`<button ${save.pts<p.p?'disabled':''} onclick="buy(${i})">Buy ${p.p}</button>`;
    return `<div class="pc${sel?' sel':''}">${sel?'<span class="rib">Equipped</span>':''}<img src="${SPRD[bl-1]}" style="filter:drop-shadow(0 0 14px ${p.c}) drop-shadow(0 6px 4px rgba(0,0,0,.5))" alt=""><span>${p.n}</span>${b}</div>`}).join('');
  $('hev').innerHTML=LV.map((n,i)=>'<div class="e'+(i<bl?'':' lk')+'" title="'+n+' - '+STAGES[i].zone+'"><img src="'+SPRD[i]+'" alt=""><span>Lv '+(i+1)+'<small>'+(i*5)+' stars</small><small>'+STAGES[i].zone+'</small><small>'+(WPN[i+1]?WPN[i+1].n:'No guns')+'</small></span></div>').join('')}
function pick(i){save.sel=i;store();hangar()}
function buy(i){if(save.pts>=PLANES[i].p){save.pts-=PLANES[i].p;save.own.push(i);save.sel=i;store();hangar()}}

function addStar(){if(st.length||B)return;let px,py;for(let i=0;i<8;i++){px=rnd(40,W-40);py=rnd(Math.min(110,H*.4),Math.max(Math.min(110,H*.4),H-160));if(Math.hypot(px-pl.x,py-pl.y)>120)break}st.push({x:px,y:py,r:rnd(0,TAU)})}
function start(){initAudio();S='play';pl={x:W/2,y:H/2,a:-Math.PI/2};ms=[];st=[];pu=[];pt=[];t=0;stars=0;shield=0;msT=1.5;puT=12;hint=4;lv=1;prevLv=1;upT=0;fadeT=0;banT=0;evoStars=0;inv=0;B=null;bossSeen={};fx=[];bl=[];wcd=[];wLv=0;skyL=1;joyRel();nmCombo=0;nmT=0;bonus=0;mag=0;slow=0;runNew=[];dnT=0;peakLv=1;banTx='';trailC=hexRgb(PLANES[save.sel].c);
  sp=planeSpeed(lv);addStar();show(null)}
function missileKind(L,r){if(L<8)return 'standard';if(L>=17&&r>.82)return 'armored';if(L>=12&&r>.58)return 'weaver';if(r>.25)return 'interceptor';return 'standard'}
function spawnMissile(){const s=Math.random()*4|0,m=30;
  const x=s===0?-m:s===1?W+m:rnd(0,W),y=s===2?-m:s===3?H+m:rnd(0,H),kind=missileKind(lv,Math.random());
  const hp=lv>=25?3:lv>=17?2:1,base=sp*(M().v0+(M().v1-M().v0)*difficulty(lv));
  const cfg={standard:[1,1],interceptor:[1.3,.78],weaver:[1.05,1],armored:[.72,1.3]}[kind];
  ms.push({x,y,a:Math.atan2(pl.y-y,pl.x-x),life:M().chase,v:base*cfg[0],hp,hp0:hp,kind,r:cfg[1],phase:rnd(0,TAU),h:kind==='armored'?.7:kind==='weaver'?1.15:1})}
function boom(x,y,c,n){for(let i=0;i<n;i++){const a=rnd(0,TAU),v=rnd(40,220);pt.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.7,m:.7,c,r:rnd(2,4)})}}
function die(){S='dying';dieT=.8;snd('boom');B=null;bl=[];joyRel();save.stat.runs++;save.stat.bestLv=Math.max(save.stat.bestLv,peakLv);save.stat.bestT=Math.max(save.stat.bestT,Math.floor(t));mEvent('surv',Math.floor(t));mEvent('lvl',peakLv);mEvent('bonus',bonus);chkAch();boom(pl.x,pl.y,'255,179,71',36);
  const earned=(Math.floor(t)+stars*5+bonus)*M().mult,k='play';save.pts+=earned;
  const nb=earned>save.best[k];if(nb)save.best[k]=earned;
  const runId=Date.now()+'-'+Math.random().toString(36).slice(2),entry={id:runId,score:earned,level:peakLv,stars,time:Math.floor(t),date:today()};
  save.top.push(entry);save.top.sort((a,b)=>(b.score||0)-(a.score||0)||(b.level||0)-(a.level||0));save.top=save.top.slice(0,5);store();
  showRes(earned,nb,k)}

function evo(){evoStars=Math.min((LEVEL_COUNT-1)*STARS_PER_LEVEL,evoStars+1);const n=lvOf(evoStars);if(n>lv){prevLv=lv;lv=n;sp=planeSpeed(lv);peakLv=Math.max(peakLv,lv);upT=1.4;dnT=0;fadeT=.5;banT=2.4;banTx='LEVEL '+lv+': '+LV[lv-1]+(WPN[lv]?' - '+WPN[lv].n:'')+(lv%5===1&&lv>1?' - '+STAGES[lv-1].zone:'');banC='#ffe066';banIc=1;snd('up');boom(pl.x,pl.y,trailC,24);boom(pl.x,pl.y,'255,224,102',14);if(BOSS[lv]&&!bossSeen[lv]&&!B)startBoss(lv);mEvent('lvl',lv);chkAch()}}
function hurt(){prevLv=lv;evoStars=Math.max(0,evoStars-5*M().drop);lv=lvOf(evoStars);sp=planeSpeed(lv);upT=0;dnT=1;fadeT=.5;inv=M().prot;banT=2.4;banTx='HIT! Back to Level '+lv+': '+LV[lv-1];banC='#ff6b5e';banIc=1;snd('dn');boom(pl.x,pl.y,'255,107,94',22)}
function upd(d){
  updateSky(d);
  if(S==='play'){
    t+=d;hint-=d;upT=Math.max(0,upT-d);fadeT=Math.max(0,fadeT-d);banT=Math.max(0,banT-d);inv=Math.max(0,inv-d);dnT=Math.max(0,dnT-d);nmT=Math.max(0,nmT-d);mag=Math.max(0,mag-d);slow=Math.max(0,slow-d);trailC=curTrail();updFx(d);if(B){bossTick(d);if(B&&B.t>=B.T)endBoss()}
    const tr=3.4*d;
    if(keys.ArrowLeft||keys.a)pl.a-=tr;if(keys.ArrowRight||keys.d)pl.a+=tr;
    if(jAng!==null)pl.a+=Math.max(-tr,Math.min(tr,angd(jAng,pl.a)));
    pl.x=wrap(pl.x+Math.cos(pl.a)*sp*d,W);pl.y=wrap(pl.y+Math.sin(pl.a)*sp*d,H);fireTick(d);bulletTick(d);
    if(shield>0)shield-=d;
    msT-=d;if(msT<=0){const cf=B?(B.k==='heavy'||B.k==='adv'?.4:0):1;if(ms.filter(m=>!m.bm).length<Math.floor(cap(lv)*cf))spawnMissile();msT=M().s0+(M().s1-M().s0)*difficulty(lv)}
    puT-=d;if(puT<=0){pu.push({x:rnd(60,W-60),y:rnd(80,H-60),ty:PUT[Math.random()*PUT.length|0]});puT=rnd(11,17)}
    for(let i=st.length-1;i>=0;i--){const s=st[i];s.r+=d*2;if(mag>0){const q=Math.hypot(pl.x-s.x,pl.y-s.y);if(q<260&&q>1){s.x+=(pl.x-s.x)/q*300*d;s.y+=(pl.y-s.y)/q*300*d}}if(Math.hypot(s.x-pl.x,s.y-pl.y)<sz()*.36){st.splice(i,1);stars++;snd('star');evo();save.stat.stars++;mEvent('stars',1);chkAch();boom(s.x,s.y,'255,224,102',8);if(!B)addStar()}}
    for(let i=pu.length-1;i>=0;i--)if(Math.hypot(pu[i].x-pl.x,pu[i].y-pl.y)<sz()*.4){const ty=pu[i].ty||'s';pu.splice(i,1);snd('pu');fx.push({x:pl.x,y:pl.y-34,s:PUN[ty],l:1,c:PUC[ty][0]});if(ty==='m')mag=8;else if(ty==='l')slow=6;else shield=5;save.stat.pu++;mEvent('pu',1)}
    for(let i=ms.length-1;i>=0;i--){const m=ms[i],hh=m.h===undefined?1:m.h,tr2=(1.3+.9*difficulty(lv))*(M().turn0+(M().turn1-M().turn0)*difficulty(lv))*d*hh;
      let tx=pl.x,ty=pl.y,v=m.v;if(m.kind==='weaver'){tx+=Math.sin(t*4+m.phase)*95;ty+=Math.cos(t*3+m.phase)*65}
      if(m.st){m.stT-=d;
        if(m.st==='chase'){if(m.stT<=0){m.st='warn';m.stT=1.2}}
        else if(m.st==='warn'){v=0;if(m.stT>.3)m.a=Math.atan2(ty-m.y,tx-m.x);if(m.stT<=0){m.st='dash';m.stT=1.3}}
        else{v=m.v*3;if(m.stT<=0){m.st='chase';m.stT=4.5}}}
      if(hh&&m.st!=='warn'&&m.st!=='dash')m.a+=Math.max(-tr2,Math.min(tr2,angd(Math.atan2(ty-m.y,tx-m.x),m.a)));
      if(slow>0)v*=.55;m.x+=Math.cos(m.a)*v*d;m.y+=Math.sin(m.a)*v*d;m.life-=d;
      pt.push({x:m.x-Math.cos(m.a)*10,y:m.y-Math.sin(m.a)*10,vx:0,vy:0,l:.5,m:.5,c:smokeC,r:3});
      if(m.life<=0){boom(m.x,m.y,'200,200,210',6);ms.splice(i,1);continue}
      const dd=Math.hypot(m.x-pl.x,m.y-pl.y),keep=m.big||m.adv;
      if(dd<sz()*.25*(m.r||1)){
        if(inv>0){if(!keep){boom(m.x,m.y,'200,200,210',8);ms.splice(i,1)}}
        else if(shield>0){shield=0;snd('hit');boom(m.x,m.y,'110,200,255',20);if(keep)inv=.8;else ms.splice(i,1)}
        else if(lv>1){hurt();if(!keep)ms.splice(i,1)}
        else{die();break}}
      else if(dd<sz()*.75*(m.r||1)){m.nmIn=1}
      else if(m.nmIn&&!m.nm){m.nm=1;nearMiss()}}
  }
  if(S==='dying'){dieT-=d;if(dieT<=0){S='over';show('over')}}
  for(let i=pt.length-1;i>=0;i--){const p=pt[i];p.x+=p.vx*d;p.y+=p.vy*d;p.l-=d;if(p.l<=0)pt.splice(i,1)}
  for(const c of clouds){c.x-=c.v*d/W;if(c.x<-.2)c.x=1.2}
}

function draw(){
  frame();
  drawSky();x.fillStyle=cloudC;
  for(const c of clouds){x.beginPath();x.ellipse(c.x*W,c.y*H,c.s,c.s*.28,0,0,TAU);x.fill();x.beginPath();x.ellipse(c.x*W,c.y*H,c.s*.65,c.s*.18,0,0,TAU);x.fill()}
  for(const s of st){ctxStar(s.x,s.y,s.r)}
  for(const p of pu){const k=PUC[p.ty||'s'];x.fillStyle='rgba(16,14,40,.65)';x.beginPath();x.arc(p.x,p.y,15,0,TAU);x.fill();x.strokeStyle=k[0];x.lineWidth=3;x.beginPath();x.arc(p.x,p.y,15,0,TAU);x.stroke();x.fillStyle=k[0];x.font='15px Pixelta,monospace';x.textAlign='center';x.fillText(k[1],p.x,p.y+5);x.textAlign='left'}
  for(const p of pt){ctxDot(p.x,p.y,p.r,'rgba('+p.c+','+Math.max(0,p.l/p.m)+')')}
  for(const m of ms){x.save();x.translate(m.x,m.y);x.rotate(m.a);
    if(m.r>1)x.scale(m.r,m.r);ctxMissile(m.adv?'#b05cff':m.big?'#d9372f':m.kind==='armored'?'#8f57d6':m.kind==='weaver'?'#5bc7d5':m.kind==='interceptor'?'#e59646':'#ece8e0',m.adv?'#5a1fa8':m.big?'#7a1010':m.kind==='weaver'?'#185c82':'#e5533d');if(m.st==='warn'){x.strokeStyle='rgba(255,60,60,'+(m.stT<.3?.9:.45)+')';x.lineWidth=3;x.beginPath();x.moveTo(20,0);x.lineTo(700,0);x.stroke()}x.restore()}
  drawBullets();drawFx();
  if(S==='menu'&&menuOn)showcase();
  if(S==='play'||S==='paused'){x.save();x.translate(pl.x,pl.y);x.rotate(pl.a+Math.PI/2);
    x.shadowColor='rgba('+trailC+',.8)';x.shadowBlur=10;
    const pop=1+.3*Math.sin(Math.min(1,upT/1.4)*Math.PI),ia=inv>0&&Math.floor(t*14)%2?.35:1;
    if(fadeT>0){const f=fadeT/.5;drawSpr(prevLv-1,f*ia,pop);drawSpr(lv-1,(1-f)*ia,pop)}else drawSpr(lv-1,ia,pop);
    x.shadowBlur=0;
    if(shield>0){const sa=shield<1.5?.5+.5*Math.sin(t*20):1;x.fillStyle='rgba(110,200,255,'+.12*sa+')';x.beginPath();x.arc(0,0,sz()*.4,0,TAU);x.fill();x.shadowColor='rgba(110,200,255,.9)';x.shadowBlur=14;x.strokeStyle='rgba(150,220,255,'+sa+')';x.lineWidth=2.5;x.beginPath();x.arc(0,0,sz()*.4,0,TAU);x.stroke();x.shadowBlur=0}
    x.restore();
    drawHud();
    if(upT>0){const p=upT/1.4;x.strokeStyle='rgba(255,224,102,'+p+')';x.lineWidth=4;x.beginPath();x.arc(pl.x,pl.y,sz()*(.4+(1-p)*1.6),0,TAU);x.stroke()}
    if(dnT>0){x.strokeStyle='rgba(255,107,94,'+dnT+')';x.lineWidth=4;x.beginPath();x.arc(pl.x,pl.y,sz()*(.4+(1-dnT)*1.2),0,TAU);x.stroke()}
    if(banT>0){const a=Math.min(1,banT/.5),tx=banTx;const ic=banIc?40:0,fs=Math.max(12,Math.min(22,Math.floor((W-60-ic)/(tx.length*.5))));x.font=fs+'px Pixelta,monospace';x.textAlign='center';const w=x.measureText(tx).width+36+ic;x.globalAlpha=a;x.fillStyle='rgba(20,18,50,.85)';x.beginPath();x.roundRect(W/2-w/2,130,w,40,12);x.fill();x.strokeStyle='rgba(255,243,224,.28)';x.lineWidth=1;x.stroke();if(ic){const im=SPR[lv-1];if(im.complete&&im.naturalWidth){const k=34/Math.max(im.naturalWidth,im.naturalHeight);x.drawImage(im,W/2-w/2+8,133+(34-im.naturalHeight*k)/2,im.naturalWidth*k,im.naturalHeight*k)}}x.fillStyle=banC;x.fillText(tx,W/2+ic/2,158);x.globalAlpha=1;x.textAlign='left';x.font='20px Pixelta,monospace'}
    if(hint>0&&(typeof proTutorial==='undefined'||proTutorial<0)){x.textAlign='center';ctxA(Math.min(1,hint));otext(phone()?'Drag the circle to steer':'Drag the circle, or use arrow keys / A, D',W/2,H-172,'#fff3e0');ctxA(1);x.textAlign='left'}}
}
