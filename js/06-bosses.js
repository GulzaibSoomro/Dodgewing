// 06-bosses.js: Near-miss, boss encounters (Heavy, Commander, Advanced, Final), effect drawing
// Classic script (no modules): all files share one global scope and load in numeric order.
let B=null,bossSeen={},fx=[],nmT=0,nmCombo=0,bonus=0,mag=0,slow=0,banIc=0,runNew=[];
const BOSS={5:{k:'heavy',n:'HEAVY MISSILE',skin:0,T:30},10:{k:'cmdr',n:'MISSILE COMMANDER',skin:1,T:35},15:{k:'adv',n:'INTERCEPTOR',skin:2,T:35},20:{k:'wall',n:'SIEGE GUARDIAN',skin:null,T:40},25:{k:'orbit',n:'ORBIT HUNTERS',skin:null,T:45},30:{k:'final',n:'COSMIC OVERLORD',skin:3,T:60}};
const bossHomeY=()=>Math.min(H*.49,Math.max(230,H*.3));
function edge(){const s=Math.random()*4|0,m=30;return{x:s===0?-m:s===1?W+m:rnd(0,W),y:s===2?-m:s===3?H+m:rnd(0,H)}}
function mk(x,y,a,o){const m={x,y,a,life:o.life||M().chase,v:o.v,h:o.h,r:o.r||1,big:o.big,st:o.st,stT:o.stT||0,bm:1,hp:o.hp||1,hp0:o.hp||1,skin:o.skin===undefined?normalMissileSkin(lv):o.skin,bossSkin:o.bossSkin};ms.push(m);return m}
function nearMiss(){chapterTask('near');nmCombo=nmT>0?nmCombo+1:1;nmT=4;const b=2*Math.min(nmCombo,5);bonus+=b;fx.push({x:pl.x,y:pl.y-34,s:'NEAR MISS +'+b+(nmCombo>1?' x'+nmCombo:''),l:1.2,c:'#ffe066'});snd('nm');save.stat.nm++;mEvent('nm',1);mEvent('bonus',bonus);chkAch()}
function updFx(d){
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];if(!f.global)f.y-=30*d;f.l-=d;if(f.l<=0)fx.splice(i,1)}
  if(pt.length>240)pt.splice(0,pt.length-240)}
function startBoss(L){st=[];obs=[];const c=BOSS[L];bossSeen[L]=true;B={L,k:c.k,skin:c.skin,t:0,T:c.T,cd:2,ph:0,wn:0,aim:0,x:W/2,y:bossHomeY(),bi:1,attack:'LOCKING ON'};
  banT=3;banTx=L===LEVEL_COUNT?c.n:'BOSS: '+c.n;banC='#ff6b5e';banIc=0;snd('boss');
}
function endBoss(){const fin=B.k==='final',coinReward=fin?100:35;if(!fin){save.stat.boss++;save.stat.bossK[B.k]=1;mEvent('boss',1)}chkAch();for(const m of ms)if(m.bm)boom(m.x,m.y,'255,120,60',m.big?40:8);ms=ms.filter(m=>!m.bm);
  boom(B.x,B.y,'255,120,60',40);
  bonus+=fin?200:50;awardCoins(coinReward,B.x,B.y);runNew.push('Boss reward: ◈ '+coinReward);
  banT=3;banTx=fin?'OVERLORD DOWN! Finish the star meter':'BOSS DOWN! +50 bonus';banC='#6ee7b7';banIc=0;snd('up');
  B=null;addStar()}
function drawFx(){
  if(B){
    drawEncounter();
    const powerOffset=shield>0||mag>0||slow>0?48:0;
    x.textAlign='center';otext(BOSS[B.L].n,W/2,98+powerOffset,'#ffb0a6');
    const warning=B.attack+' · Evade '+Math.ceil(Math.max(0,B.T-B.t))+'s';
    x.font=canvasFont(12);x.lineWidth=3;x.strokeText(warning,W/2,118+powerOffset);
    x.fillStyle='#fff2df';x.fillText(warning,W/2,118+powerOffset);
    x.textAlign='left';
  }
  if(S==='play'||S==='paused'||S==='countdown'){
    const globalFx=fx.filter(f=>f.global||Math.abs(f.x-W/2)<2).slice(0,3),localFx=fx.filter(f=>!(f.global||Math.abs(f.x-W/2)<2)),powers=shield>0||mag>0||slow>0,base=B?188+(powers?48:0):(powers?150:106);
    const drawText=(f,px,py)=>{x.globalAlpha=Math.min(1,f.l*2);x.font=canvasFont(18);x.textAlign='center';x.lineJoin='round';x.lineWidth=4;x.strokeStyle='rgba(0,0,0,.55)';x.strokeText(f.s,px,py);x.fillStyle=f.c;x.fillText(f.s,px,py);x.globalAlpha=1;x.textAlign='left'};
    globalFx.forEach((f,i)=>drawText(f,W/2,base+i*34));localFx.forEach(f=>drawText(f,f.x,f.y));
  }
}
