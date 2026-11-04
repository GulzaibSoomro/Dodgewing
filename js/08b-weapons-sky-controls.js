// 08b-weapons-sky-controls.js: auto-fire weapons per plane level, sky / time of day by level, on-screen joystick
// Classic script (no modules): all files share one global scope and load in numeric order.
// ---- Weapons. Stages 1–3 have no guns; firing begins with the fourth aircraft. e = emitters: r shots/s, d damage, v speed,
// o = [sideways px, forward px, angle offset], c colour, w size, h homing, sp random spread (rad).
const BASE_WPN={
 4:{n:'Nose gun',e:[{r:2.5,d:1,v:520,o:[[0,0]],c:'#ffe27a',w:3}]},
 5:{n:'Twin guns',e:[{r:3,d:1,v:560,o:[[-9,0],[9,0]],c:'#ffe27a',w:3}]},
 6:{n:'Wing guns x4',e:[{r:4,d:1,v:600,o:[[-15,0],[-6,0],[6,0],[15,0]],c:'#ffd24d',w:3}]},
 7:{n:'Jet cannons',e:[{r:3,d:2,v:640,o:[[-8,0],[8,0]],c:'#ff9d4d',w:4}]},
 8:{n:'Rapid cannon',e:[{r:7,d:1.5,v:700,o:[[0,0]],c:'#ff9d4d',w:4,sp:.04}]},
 9:{n:'Vulcan and homing',e:[{r:6,d:1,v:760,o:[[0,0]],c:'#ffe27a',w:3,sp:.04},{h:1,r:.6,d:3,v:380,o:[[-14,0]],c:'#fff',w:5}]},
 10:{n:'Stealth missiles',e:[{r:2.5,d:2,v:700,o:[[0,0]],c:'#9fd0ff',w:4},{h:1,r:.9,d:3,v:400,o:[[-12,0],[12,0]],c:'#fff',w:5}]},
 11:{n:'Vulcan and twin homing',e:[{r:6,d:1,v:780,o:[[-6,0],[6,0]],c:'#ffe27a',w:3,sp:.05},{h:1,r:.8,d:3,v:420,o:[[-14,0],[14,0]],c:'#fff',w:5}]},
 12:{n:'Plasma fan',e:[{r:3,d:1.5,v:700,o:[[0,0,-.2],[0,0,0],[0,0,.2]],c:'#7fe7ff',w:4},{h:1,r:.8,d:3,v:440,o:[[-14,0],[14,0]],c:'#fff',w:5}]},
 13:{n:'Plasma storm',e:[{r:3.5,d:1.5,v:760,o:[[0,0,-.26],[0,0,-.13],[0,0,0],[0,0,.13],[0,0,.26]],c:'#8af0ff',w:4},{h:1,r:1,d:3,v:460,o:[[-14,0],[14,0]],c:'#fff',w:5}]}};
const WPN={};
for(let L=1;L<=LEVEL_COUNT;L++){const base=BASE_WPN[Math.min(13,L)];if(base){const rank=Math.max(0,L-13),rate=1+Math.min(.5,rank*.025),dmg=1+Math.min(.3,rank*.015);WPN[L]={n:base.n+(rank?' Mk '+rank:''),e:base.e.map(e=>({...e,r:e.r*rate,d:e.d*dmg}))}}}
let bl=[],wcd=[],wLv=0,autoFire=true;
function fireTick(d){
  const w=WPN[lv];if(!w||!autoFire){wLv=0;return}
  if(wLv!==lv){wLv=lv;wcd=w.e.map((e,i)=>.3+i*.2)}
  const fx0=Math.cos(pl.a),fy0=Math.sin(pl.a);
  w.e.forEach((e,i)=>{wcd[i]-=d;let n=0;
    while(wcd[i]<=0&&n++<3){wcd[i]+=1/e.r;
      for(const o of e.o){const a=pl.a+(o[2]||0)+(e.sp?rnd(-e.sp,e.sp):0),fw=sz()*.35+(o[1]||0);
        if(bl.length<200)bl.push({x:pl.x+fx0*fw-fy0*o[0],y:pl.y+fy0*fw+fx0*o[0],a,v:e.v,d:e.d,life:e.h?2.2:1.15,h:e.h,c:e.c,w:e.w})}}})}
function hitMissile(m,j,dmg){
  if(m.hp===undefined){m.hp=1;m.hp0=1}
  m.hp-=dmg;boom(m.x,m.y,'255,200,90',m.hp>0?2:14);
  if(m.hp>0)return;
  ms.splice(j,1);snd('hit');save.stat.shot=(save.stat.shot||0)+1;mEvent('shot',1);
  if(m.big){bonus+=10;if(B)B.t=B.T}else if(m.adv){bonus+=5;if(B)B.t+=B.T*.2}
  chkAch()}
function bulletTick(d){
  for(let i=bl.length-1;i>=0;i--){const b=bl[i];
    if(b.h){let tg=null,bd=420;for(const m of ms){const q=Math.hypot(m.x-b.x,m.y-b.y);if(q<bd){bd=q;tg=m}}
      if(tg)b.a+=Math.max(-5*d,Math.min(5*d,angd(Math.atan2(tg.y-b.y,tg.x-b.x),b.a)));
      pt.push({x:b.x,y:b.y,vx:0,vy:0,l:.22,m:.22,c:'255,255,255',r:1.8})}
    b.x+=Math.cos(b.a)*b.v*d;b.y+=Math.sin(b.a)*b.v*d;b.life-=d;
    let dead=b.life<=0||b.x<-30||b.x>W+30||b.y<-30||b.y>H+30;
    if(!dead)for(let j=ms.length-1;j>=0;j--){const m=ms[j];if(Math.hypot(m.x-b.x,m.y-b.y)<9*(m.r||1)+b.w){dead=true;hitMissile(m,j,b.d);break}}
    if(!dead&&B&&B.k==='cmdr'&&Math.abs(b.x-B.x)<36&&Math.abs(b.y-B.y)<20){dead=true;B.t+=b.d*.12;boom(b.x,b.y,'255,220,120',3)}
    if(dead)bl.splice(i,1)}}
function drawBullets(){
  x.lineCap='round';
  for(const b of bl){
    if(b.h){x.save();x.translate(b.x,b.y);x.rotate(b.a);x.scale(.5,.5);ctxMissile('#ffffff','#2f6fd6');x.restore()}
    else{const tx=b.x-Math.cos(b.a)*b.w*3.4,ty=b.y-Math.sin(b.a)*b.w*3.4;x.strokeStyle='rgba(50,25,0,.4)';x.lineWidth=b.w*.7+2;x.beginPath();x.moveTo(b.x,b.y);x.lineTo(tx,ty);x.stroke();x.strokeStyle=b.c;x.lineWidth=b.w*.7;x.beginPath();x.moveTo(b.x,b.y);x.lineTo(tx,ty);x.stroke()}}
  x.lineCap='butt';
  for(const m of ms)if(m.hp0>1&&m.hp>0&&m.hp<m.hp0){const w=34*(m.r||1)*.7;x.fillStyle='rgba(0,0,0,.55)';x.fillRect(m.x-w/2-1,m.y-26*(m.r||1)-1,w+2,6);x.fillStyle='#ff6b5e';x.fillRect(m.x-w/2,m.y-26*(m.r||1),w*m.hp/m.hp0,4)}}

// ---- Sky: morning at Level 1 -> night at Level 30. Each level has 4 colours (top -> horizon).
const SKY=[
 ['#7ec4f2','#a9d9f5','#ffe3b8','#ffc99a'],['#5eb0ee','#8fd0f6','#d6ecf5','#ffe9c2'],['#3f9ae8','#6fbdf3','#a9dcf7','#d4eefb'],
 ['#2f86dc','#58aef0','#8ccbf6','#bfe3fa'],['#3a84d0','#6aa9e0','#aacbe6','#f3dcae'],['#4a79c0','#8aa3d0','#e8c796','#f7b977'],
 ['#3d4f9a','#8a5fa0','#ee7f5a','#ffb35c'],['#262e72','#5a3b86','#b8527a','#f07a5a'],['#161a52','#35306f','#6d3f82','#b05a7e'],
 ['#0c1038','#1a1f5a','#2e2f78','#54407f'],['#070a2a','#0e1442','#181c58','#272766'],['#04061c','#0a0f34','#10164a','#1a2058']
].map(a=>a.map(h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16))));
const CLD=[[255,255,255,.46],[255,255,255,.46],[255,255,255,.44],[255,255,255,.42],[255,250,240,.4],[255,222,180,.38],[255,196,160,.34],[210,150,190,.26],[150,120,190,.18],[110,110,180,.12],[90,95,165,.09],[80,85,150,.07]];
const lerpN=(a,b,f)=>Array.isArray(a)?a.map((v,i)=>lerpN(v,b[i],f)):a+(b-a)*f;
const lvMix=(A,L)=>{const i=Math.max(0,Math.min(A.length-1,Math.floor(L-1))),j=Math.min(A.length-1,i+1);return lerpN(A[i],A[j],Math.max(0,Math.min(1,L-1-i)))};
const skyAt=L=>lvMix(SKY,1+difficulty(L)*11).map(c=>'rgb('+c.map(Math.round).join(',')+')');
const nightAmt=L=>Math.max(0,Math.min(1,(1+difficulty(L)*11-6.8)/5.2));
const STARS=Array.from({length:32},()=>({x:Math.random(),y:Math.random()*.8,s:.8+Math.random()*1.4,p:Math.random()*6.28,th:Math.random()}));
let skyL=1,smokeC='95,95,120',cloudC='rgba(255,255,255,.4)',lastSkyT='';
function updateSky(d){skyL+=((S==='menu'?1:lv)-skyL)*Math.min(1,d*1.1);smokeC=(1+difficulty(skyL)*11)<6.8?'95,95,120':'205,205,220';}
function drawSky(){
  const c=skyAt(skyL),g=x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,c[0]);g.addColorStop(.38,c[1]);g.addColorStop(.7,c[2]);g.addColorStop(1,c[3]);
  x.fillStyle=g;x.fillRect(0,0,W,H);
  if(c[0]!==lastSkyT){lastSkyT=c[0];const e=$('st');if(e&&e.style)e.style.background=c[0]}
  const n=nightAmt(skyL);
  if(n>0){const tm=performance.now()/1000;x.fillStyle='#ffffff';
    for(const s of STARS){const a=Math.max(0,Math.min(1,(n-s.th*.85)/.12));if(a<=0)continue;x.globalAlpha=a*(.72+.28*Math.sin(tm*1.5+s.p));x.beginPath();x.arc(s.x*W,s.y*H,s.s,0,TAU);x.fill()}
    x.globalAlpha=1}
  const k=lvMix(CLD,1+difficulty(skyL)*11);cloudC='rgba('+Math.round(k[0])+','+Math.round(k[1])+','+Math.round(k[2])+','+k[3].toFixed(3)+')'}

// ---- Joystick (bottom centre). Push in a direction and the plane turns to head that way. Let go: it keeps flying straight.
let jAng=null,jId=null;
function joyAng(e){const j=$('joy'),r=j.getBoundingClientRect(),R=r.width/2,dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R),d=Math.hypot(dx,dy),m=Math.min(d,R*.62),k=$('jk');
  jAng=d>R*.18?Math.atan2(dy,dx):null;
  if(k&&k.style)k.style.transform=d>1?'translate('+(dx/d*m).toFixed(1)+'px,'+(dy/d*m).toFixed(1)+'px)':'translate(0,0)'}
function joyRel(){jAng=null;jId=null;const k=$('jk'),j=$('joy');if(k&&k.style)k.style.transform='translate(0,0)';if(j&&j.classList)j.classList.remove('act')}
function joyInit(){const j=$('joy');
  j.addEventListener('pointerdown',e=>{e.preventDefault();jId=e.pointerId;try{j.setPointerCapture(e.pointerId)}catch(_){}j.classList.add('act');joyAng(e)});
  j.addEventListener('pointermove',e=>{if(e.pointerId===jId)joyAng(e)});
  const up=e=>{if(e.pointerId===jId)joyRel()};
  j.addEventListener('pointerup',up);j.addEventListener('pointercancel',up);j.addEventListener('lostpointercapture',up)}
