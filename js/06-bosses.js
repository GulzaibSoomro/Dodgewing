// 06-bosses.js: Near-miss, boss encounters (Heavy, Commander, Advanced, Final), effect drawing
// Classic script (no modules): all files share one global scope and load in numeric order.
let B=null,bossSeen={},fx=[],nmT=0,nmCombo=0,bonus=0,mag=0,slow=0,banIc=0,runNew=[];
const BOSS={9:{k:'heavy',n:'HEAVY MISSILE',T:30},17:{k:'cmdr',n:'MISSILE COMMANDER',T:35},25:{k:'adv',n:'ADVANCED MISSILE',T:35},30:{k:'final',n:'FINAL CHALLENGE',T:60}};
function edge(){const s=Math.random()*4|0,m=30;return{x:s===0?-m:s===1?W+m:rnd(0,W),y:s===2?-m:s===3?H+m:rnd(0,H)}}
function mk(x,y,a,o){const m={x,y,a,life:o.life||M().chase,v:o.v,h:o.h,r:o.r||1,big:o.big,st:o.st,stT:o.stT||0,bm:1,hp:o.hp||1,hp0:o.hp||1,skin:o.skin===undefined?normalMissileSkin(lv):o.skin};ms.push(m);return m}
function nearMiss(){nmCombo=nmT>0?nmCombo+1:1;nmT=4;const b=2*Math.min(nmCombo,5);bonus+=b;fx.push({x:pl.x,y:pl.y-34,s:'NEAR MISS +'+b+(nmCombo>1?' x'+nmCombo:''),l:1.2,c:'#ffe066'});snd('nm');save.stat.nm++;mEvent('nm',1);mEvent('bonus',bonus);chkAch()}
function updFx(d){
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.y-=30*d;f.l-=d;if(f.l<=0)fx.splice(i,1)}
  if(pt.length>240)pt.splice(0,pt.length-240)}
function startBoss(L){st=[];const c=BOSS[L];bossSeen[L]=true;B={L,k:c.k,t:0,T:c.T,cd:2,ph:0,wn:0,aim:0,x:W/2,y:64,bi:1};
  banT=3;banTx=L===LEVEL_COUNT?c.n:'BOSS: '+c.n;banC='#ff6b5e';banIc=0;snd('boss');
  if(c.k==='heavy'){const e=edge();mk(e.x,e.y,Math.atan2(pl.y-e.y,pl.x-e.x),{v:sp*.5,h:.55,r:1.9,big:1,life:999,st:'chase',stT:3,hp:40})}}
function endBoss(){const fin=B.k==='final';if(fin)save.stat.wins++;else{save.stat.boss++;save.stat.bossK[B.k]=1;mEvent('boss',1)}chkAch();for(const m of ms)if(m.bm)boom(m.x,m.y,'255,120,60',m.big?40:8);ms=ms.filter(m=>!m.bm);
  if(B.k==='cmdr')boom(B.x,B.y,'255,120,60',40);
  bonus+=fin?200:50;
  banT=3;banTx=fin?'VICTORY! +200 bonus':'BOSS DOWN! +50 bonus';banC='#6ee7b7';banIc=0;snd('up');
  B=null;addStar()}
function cfire(){const p=B.ph%3,a=B.aim,v=sp*.6;
  if(p===0)for(let i=0;i<5;i++)mk(B.x,B.y,a+(i-2)*.26,{v,h:0,life:6});
  else if(p===1)for(let i=0;i<10;i++)mk(B.x,B.y,i/10*TAU,{v:v*.8,h:0,life:6});
  else{mk(B.x,B.y,a-.3,{v:sp*.75,h:.8,life:6});mk(B.x,B.y,a+.3,{v:sp*.75,h:.8,life:6})}}
function bossTick(d){B.t+=d;B.cd-=d;const k=B.k;
  if(k==='cmdr'){B.x=W/2+Math.sin(B.t*.6)*W*.34;B.y=64;
    if(B.cd<=0){B.ph++;B.cd=3.4*B.bi;B.wn=.9;B.aim=Math.atan2(pl.y-B.y,pl.x-B.x)}
    if(B.wn>0){if(B.wn>.25)B.aim=Math.atan2(pl.y-B.y,pl.x-B.x);B.wn-=d;if(B.wn<=0)cfire()}}
  else if(k==='adv'){if(B.cd<=0){B.cd=4.8*B.bi;if(ms.filter(m=>m.adv).length<2){const e=edge(),m=mk(e.x,e.y,Math.atan2(pl.y-e.y,pl.x-e.x),{v:sp*.9,h:1.6,life:9,r:1.15,hp:10});m.adv=1}}}
  else if(k==='final'&&B.cd<=0){B.cd=3.6;B.ph++;const w=B.ph%3,skin=27+w;
    if(w===1){const hz=Math.random()<.5,gap=rnd(.15,.85);for(let i=0;i<9;i++){const u=(i+.5)/9;if(Math.abs(u-gap)<.11)continue;if(hz)mk(u*W,-120,Math.PI/2,{v:sp*.55,h:0,life:8,skin});else mk(-120,u*H,0,{v:sp*.55,h:0,life:10,skin})}}
    else if(w===2){const R=Math.max(W,H)*.6;for(let i=0;i<10;i++){const a=i/10*TAU+Math.random()*.3;mk(pl.x+Math.cos(a)*R,pl.y+Math.sin(a)*R,a+Math.PI,{v:sp*.5,h:0,life:9,skin})}}
    else for(let i=0;i<3;i++){const e=edge();mk(e.x,e.y,Math.atan2(pl.y-e.y,pl.x-e.x),{v:sp*.7,h:1,life:7,skin})}}}
function drawFx(){
  if(B){
    if(B.k==='cmdr'){const w=B.wn>0;x.fillStyle=w&&Math.floor(B.wn*14)%2?'#ffffff':'#8c1d2b';x.fillRect(B.x-34,B.y-16,68,32);x.fillStyle='#4a0f18';x.fillRect(B.x-8,B.y+10,16,16);
      if(w){x.strokeStyle='rgba(255,60,60,.55)';x.lineWidth=2;const p=B.ph%3;x.beginPath();
        if(p===0)for(let i=0;i<5;i++){x.moveTo(B.x,B.y);x.lineTo(B.x+Math.cos(B.aim+(i-2)*.26)*600,B.y+Math.sin(B.aim+(i-2)*.26)*600)}
        else if(p===1)x.arc(B.x,B.y,40+(1-B.wn/.9)*80,0,TAU);
        else for(const sd of[-.3,.3]){x.moveTo(B.x,B.y);x.lineTo(B.x+Math.cos(B.aim+sd)*600,B.y+Math.sin(B.aim+sd)*600)}
        x.stroke()}}
    const powerOffset=shield>0||mag>0||slow>0?36:0,bw=Math.min(W-32,340),bx=(W-bw)/2,by=104+powerOffset;x.textAlign='center';otext(BOSS[B.L].n,W/2,98+powerOffset,'#ffb0a6');
    x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.roundRect(bx,by,bw,16,8);x.fill();x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=1;x.stroke();const bf=Math.max(0,1-B.t/B.T);if(bf>0){const bg=x.createLinearGradient(0,by+2,0,by+14);bg.addColorStop(0,'#ff9a8f');bg.addColorStop(1,'#e5392a');x.fillStyle=bg;x.beginPath();x.roundRect(bx+2,by+2,Math.max(12,(bw-4)*bf),12,6);x.fill()}
    x.textAlign='left'}
  if(S==='play'||S==='paused')for(const f of fx){x.globalAlpha=Math.min(1,f.l*2);x.font='18px Pixelta,monospace';x.textAlign='center';x.lineJoin='round';x.lineWidth=4;x.strokeStyle='rgba(0,0,0,.55)';x.strokeText(f.s,f.x,f.y);x.fillStyle=f.c;x.fillText(f.s,f.x,f.y);x.globalAlpha=1;x.textAlign='left'}}
