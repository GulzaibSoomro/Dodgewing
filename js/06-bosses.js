// 06-bosses.js: Near-miss, boss encounters (Heavy, Commander, Advanced, Final), effect drawing
// Classic script (no modules): all files share one global scope and load in numeric order.
let B=null,bossSeen={},fx=[],nmT=0,nmCombo=0,bonus=0,mag=0,slow=0,banIc=0,runNew=[],bossBarFor=0,bossBarFill=1,bossBarTrail=1;
const BOSS={9:{k:'heavy',n:'HEAVY MISSILE',skin:0,T:30},17:{k:'cmdr',n:'MISSILE COMMANDER',skin:1,T:35},25:{k:'adv',n:'ADVANCED SEEKER',skin:2,T:35},30:{k:'final',n:'COSMIC OVERLORD',skin:3,T:60}};
const bossHomeY=()=>Math.max(164,Math.min(H*.22,208));
function edge(){const s=Math.random()*4|0,m=30;return{x:s===0?-m:s===1?W+m:rnd(0,W),y:s===2?-m:s===3?H+m:rnd(0,H)}}
function mk(x,y,a,o){const m={x,y,a,life:o.life||M().chase,v:o.v,h:o.h,r:o.r||1,big:o.big,st:o.st,stT:o.stT||0,bm:1,hp:o.hp||1,hp0:o.hp||1,skin:o.skin===undefined?normalMissileSkin(lv):o.skin,bossSkin:o.bossSkin};ms.push(m);return m}
function nearMiss(){nmCombo=nmT>0?nmCombo+1:1;nmT=4;const b=2*Math.min(nmCombo,5);bonus+=b;fx.push({x:pl.x,y:pl.y-34,s:'NEAR MISS +'+b+(nmCombo>1?' x'+nmCombo:''),l:1.2,c:'#ffe066'});snd('nm');save.stat.nm++;mEvent('nm',1);mEvent('bonus',bonus);chkAch()}
function updFx(d){
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];if(!f.global)f.y-=30*d;f.l-=d;if(f.l<=0)fx.splice(i,1)}
  if(pt.length>240)pt.splice(0,pt.length-240)}
function startBoss(L){st=[];obs=[];const c=BOSS[L];bossSeen[L]=true;bossBarFor=L;bossBarFill=1;bossBarTrail=1;B={L,k:c.k,skin:c.skin,t:0,T:c.T,cd:2,ph:0,wn:0,aim:0,x:W/2,y:bossHomeY(),bi:1,attack:'LOCKING ON'};
  banT=3;banTx=L===LEVEL_COUNT?c.n:'BOSS: '+c.n;banC='#ff6b5e';banIc=0;snd('boss');
  if(c.k==='heavy'){const e=edge();mk(e.x,e.y,Math.atan2(pl.y-e.y,pl.x-e.x),{v:sp*.5,h:.55,r:1.9,big:1,bossSkin:0,life:999,st:'chase',stT:3,hp:40})}}
function endBoss(){const fin=B.k==='final',coinReward=fin?100:35;if(fin)save.stat.wins++;else{save.stat.boss++;save.stat.bossK[B.k]=1;mEvent('boss',1)}chkAch();for(const m of ms)if(m.bm)boom(m.x,m.y,'255,120,60',m.big?40:8);ms=ms.filter(m=>!m.bm);
  if(B.k==='cmdr')boom(B.x,B.y,'255,120,60',40);
  bonus+=fin?200:50;awardCoins(coinReward,B.x,B.y);runNew.push('Boss reward: ◈ '+coinReward);
  banT=3;banTx=fin?'VICTORY! +200 bonus':'BOSS DOWN! +50 bonus';banC='#6ee7b7';banIc=0;snd('up');
  B=null;addStar()}
function cfire(){const p=B.ph%3,a=B.aim,v=sp*.6;
  if(p===0)for(let i=0;i<5;i++)mk(B.x,B.y,a+(i-2)*.26,{v,h:0,life:6});
  else if(p===1)for(let i=0;i<10;i++)mk(B.x,B.y,i/10*TAU,{v:v*.8,h:0,life:6});
  else{mk(B.x,B.y,a-.3,{v:sp*.75,h:.8,life:6});mk(B.x,B.y,a+.3,{v:sp*.75,h:.8,life:6})}}
function bossTick(d){B.t+=d;B.cd-=d;const k=B.k;
  if(k==='heavy'){B.attack=(ms.find(m=>m.big)||{}).st==='dash'?'DASH STRIKE':'TRACKING'}
  else if(k==='cmdr'){B.x=W/2+Math.sin(B.t*.6)*W*.27;B.y=bossHomeY();B.attack=['FAN VOLLEY','RING BURST','TWIN HUNT'][B.ph%3];
    if(B.cd<=0){B.ph++;B.cd=3.4*B.bi;B.wn=.9;B.aim=Math.atan2(pl.y-B.y,pl.x-B.x)}
    if(B.wn>0){if(B.wn>.25)B.aim=Math.atan2(pl.y-B.y,pl.x-B.x);B.wn-=d;if(B.wn<=0)cfire()}}
  else if(k==='adv'){B.attack='SEEKER DRONES';if(B.cd<=0){B.cd=4.8*B.bi;if(ms.filter(m=>m.adv).length<2){const e=edge(),m=mk(e.x,e.y,Math.atan2(pl.y-e.y,pl.x-e.x),{v:sp*.9,h:1.6,life:9,r:1.15,hp:10,bossSkin:2});m.adv=1}}}
  else if(k==='final'){B.x=W/2+Math.sin(B.t*.55)*W*.12;B.y=bossHomeY()+Math.sin(B.t*1.2)*5;if(B.cd<=0){B.cd=3.6;B.ph++;const w=B.ph%3,skin=27+w;B.attack=['WALL WAVE','ORBIT SWARM','HUNTER PAIR'][w];
    if(w===1){const hz=Math.random()<.5,gap=rnd(.15,.85);for(let i=0;i<9;i++){const u=(i+.5)/9;if(Math.abs(u-gap)<.11)continue;if(hz)mk(u*W,-120,Math.PI/2,{v:sp*.55,h:0,life:8,skin});else mk(-120,u*H,0,{v:sp*.55,h:0,life:10,skin})}}
    else if(w===2){const R=Math.max(W,H)*.6;for(let i=0;i<10;i++){const a=i/10*TAU+Math.random()*.3;mk(pl.x+Math.cos(a)*R,pl.y+Math.sin(a)*R,a+Math.PI,{v:sp*.5,h:0,life:9,skin})}}
    else for(let i=0;i<3;i++){const e=edge();mk(e.x,e.y,Math.atan2(pl.y-e.y,pl.x-e.x),{v:sp*.7,h:1,life:7,skin})}}}}
function drawFx(){
  if(B){
    if(B.k==='cmdr'){drawBossAt(1,B.x,B.y,108);const w=B.wn>0;
      if(w){x.strokeStyle='rgba(255,60,60,.55)';x.lineWidth=2;const p=B.ph%3;x.beginPath();
        if(p===0)for(let i=0;i<5;i++){x.moveTo(B.x,B.y);x.lineTo(B.x+Math.cos(B.aim+(i-2)*.26)*600,B.y+Math.sin(B.aim+(i-2)*.26)*600)}
        else if(p===1)x.arc(B.x,B.y,40+(1-B.wn/.9)*80,0,TAU);
        else for(const sd of[-.3,.3]){x.moveTo(B.x,B.y);x.lineTo(B.x+Math.cos(B.aim+sd)*600,B.y+Math.sin(B.aim+sd)*600)}
        x.stroke()}}
    else if(B.k==='adv'){for(const m of ms)if(m.adv){x.save();x.globalAlpha=reducedMotion()?.45:.35+.2*Math.sin(t*8);x.strokeStyle='#d28cff';x.lineWidth=2;x.beginPath();x.arc(m.x,m.y,28,0,TAU);x.stroke();x.restore()}}
    else if(B.k==='final')drawBossAt(3,B.x,B.y,132);
    const powerOffset=shield>0||mag>0||slow>0?48:0,bw=Math.min(W-32,340),bx=(W-bw)/2,by=104+powerOffset,target=Math.max(0,1-B.t/B.T);
    if(bossBarFor!==B.L){bossBarFor=B.L;bossBarFill=target;bossBarTrail=target}
    if(reducedMotion()){bossBarFill=target;bossBarTrail=target}else{bossBarFill+=(target-bossBarFill)*.2;bossBarTrail+=(bossBarFill-bossBarTrail)*.045}
    x.textAlign='center';otext(BOSS[B.L].n,W/2,98+powerOffset,'#ffb0a6');x.font='12px Pixelta,monospace';x.fillStyle='#ffd3ca';x.fillText('DANGER · '+B.attack,W/2,by+31);
    x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.roundRect(bx,by,bw,16,8);x.fill();x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=1;x.stroke();
    const bar=(v,col)=>{if(v<=0)return;x.fillStyle=col;x.beginPath();x.roundRect(bx+2,by+2,Math.max(12,(bw-4)*v),12,6);x.fill()};bar(bossBarTrail,'rgba(255,166,74,.58)');const bg=x.createLinearGradient(0,by+2,0,by+14);bg.addColorStop(0,'#ff9a8f');bg.addColorStop(1,'#e5392a');bar(bossBarFill,bg);x.textAlign='left'
  }
  if(S==='play'||S==='paused'||S==='countdown'){
    const globalFx=fx.filter(f=>f.global||Math.abs(f.x-W/2)<2).slice(0,3),localFx=fx.filter(f=>!(f.global||Math.abs(f.x-W/2)<2)),powers=shield>0||mag>0||slow>0,base=B?188+(powers?48:0):(powers?150:106);
    const drawText=(f,px,py)=>{x.globalAlpha=Math.min(1,f.l*2);x.font='18px Pixelta,monospace';x.textAlign='center';x.lineJoin='round';x.lineWidth=4;x.strokeStyle='rgba(0,0,0,.55)';x.strokeText(f.s,px,py);x.fillStyle=f.c;x.fillText(f.s,px,py);x.globalAlpha=1;x.textAlign='left'};
    globalFx.forEach((f,i)=>drawText(f,W/2,base+i*34));localFx.forEach(f=>drawText(f,f.x,f.y));
  }
}
