// v0.13.5 additive campaign rules. Campaign encounter and input integration.
const BOSS_LEVELS=[5,10,15,20,25,30];
const BOSS_REQUIREMENTS={5:4,10:4,15:5,20:6,25:7,30:8};
const RECOVERED_BOSS_PATHS=['assets/bosses/level_5.png','assets/bosses/level_10.png','assets/bosses/level_15.png','assets/bosses/level_20.png','assets/bosses/level_25.png','assets/bosses/level_30.png'];
const RECOVERED_BOSSES=RECOVERED_BOSS_PATHS.map(src=>{const im=new Image();im.src=src;return im});
const bossBodySize=()=>Math.min(136,W*.34,H*.25);
function drawRecoveredBoss(){if(!B)return;const im=RECOVERED_BOSSES[BOSS_LEVELS.indexOf(B.L)];if(!im||!im.complete||!im.naturalWidth)return;const size=bossBodySize(),w=size,h=size*im.naturalHeight/im.naturalWidth;x.save();x.translate(B.x,B.y);if(B.L!==30)x.rotate(Math.PI);x.drawImage(im,-w/2,-h/2,w,h);x.restore()}
save.bossProgress=Object.assign({},obj(save.bossProgress));
for(const L of BOSS_LEVELS)save.bossProgress[L]=Math.max(0,Math.min(BOSS_REQUIREMENTS[L],Math.floor(num(save.bossProgress[L]))));
save.controlMode=save.controlMode==='touch'?'touch':'joystick';
save.stat.bestLv=Math.min(30,save.stat.bestLv);
const initializeBoss = startBoss;
startBoss = function(level) {
  if (B || !BOSS[level]) return;
  initializeBoss(level);
  Object.assign(B, {entry:0, hpMax:Math.round((40+level*5)*levelPressure().hp), x:W/2, y:-80, dash:0, flash:0});
  B.hp=B.hpMax;
  ms=[];
};
function satellites(b) {
  return [0, Math.PI].map(offset => ({x:b.x+Math.cos(b.t*1.4+offset)*bossBodySize()*.62,
    y:b.y+Math.sin(b.t*1.4+offset)*bossBodySize()*.35}));
}
function bossTick(d) {
  const b=B;
  if(b.entry<1) {
    b.entry=Math.min(1,b.entry+d/1.2);
    b.y=-80+(bossHomeY()+80)*b.entry;
    return;
  }
  b.t+=d;
  b.flash=Math.max(0,b.flash-d);
  const phase=b.L===30?1+Math.min(2,Math.floor(3*Math.max(b.t/b.T,1-b.hp/b.hpMax))):1;
  if(phase!==b.phase && phase>1) fx.push({x:b.x,y:b.y,s:'PHASE '+phase,c:'#ffe066',l:1.2});
  b.phase=phase;
  if(b.dash>0) {
    b.dash-=d;
    b.x+=Math.cos(b.aim)*sp*1.35*d;
    b.y+=Math.sin(b.aim)*sp*1.35*d;
  } else {
    const rates={5:.48,10:.7,15:1.35,20:.38,25:.58,30:.55};
    const targetX=(b.L===5||(b.L===15&&b.ph%3===2))?pl.x:W*(.5+.31*Math.sin(b.t*rates[b.L]));
    const targetY=b.L===5?pl.y:bossHomeY()+Math.sin(b.t*rates[b.L]*1.7)*H*.055;
    const follow=1-Math.exp(-d*(b.L===5?.42:2));
    b.x+=(targetX-b.x)*follow;
    b.y+=(targetY-b.y)*follow;
  }
  const margin=bossBodySize()*.52;
  b.x=Math.max(margin,Math.min(W-margin,b.x));
  b.y=Math.max(margin,Math.min(H-margin,b.y));
  if(b.wn>0) {
    b.wn=Math.max(0,b.wn-d);
    if(!b.wn) {
      const launch=(p,angle,homing=0)=>mk(p.x,p.y,angle,{v:sp*.65*(b.projectile||1)*levelPressure().speed,h:homing,life:6,skin:normalMissileSkin(lv)});
      if(b.L===5||b.L===15){b.dash=b.L===5?.65:.42;launch(b,b.aim)}
      else if(b.L===25){for(const p of satellites(b))launch(p,Math.atan2(pl.y-p.y,pl.x-p.x),.3)}
      else {
        const count=Math.max(1,(b.L===20?6:b.L===30?2+b.phase*2:3+b.ph%2)+levelPressure().density);
        if(b.L===30){
          const sweep=Math.sin(b.ph*.8)*.42;
          for(let i=0;i<count;i++){
            const side=i%2?-1:1, spread=.23+Math.floor(i/2)*.22;
            const angle=b.aim+side*spread+(b.phase>=2?sweep:0);
            launch(b,angle,b.phase===1?.18:b.phase===3&&i<2?.24:0);
          }
        }else for(let i=0;i<count;i++)launch(b,b.L===20?b.ph*.4+i*TAU/count:b.aim+(i-(count-1)/2)*.25);
      }
      b.attack=b.L===20?'CORE EXPOSED':'RECOVERING';
      b.cd=(b.L===30?3.8-b.phase*.45:3.2)*levelPressure().interval/(b.pace||1);
    }
  } else if((b.cd-=d)<=0){
    b.ph++;
    b.wn=.9*levelPressure().warning;
    b.aim=Math.atan2(pl.y-b.y,pl.x-b.x);
    b.attack=({5:'GUIDED CHARGE',10:'MISSILE VOLLEY',15:'STRAFE',20:'ROTATING BURST',25:'TWIN HUNT',30:'PHASE '+phase+' VOLLEY'})[b.L];
  }
}
function bossContains(px,py){return Math.hypot((px-B.x)/(.34*bossBodySize()),(py-B.y)/(.33*bossBodySize()))<1}
function drawEncounter(){
  drawRecoveredBoss();
  if(B.L===25)for(const p of satellites(B))ctxDot(p.x,p.y,7,'#ffba69');
  if(B.wn>0||B.flash>0){
    x.save();x.strokeStyle=B.flash>0?'#fff':'#ffab75';x.lineWidth=3;x.beginPath();
    if(B.wn>0){x.moveTo(B.x,B.y);x.lineTo(B.x+Math.cos(B.aim)*100,B.y+Math.sin(B.aim)*100)}
    else x.arc(B.x,B.y,bossBodySize()*.35,0,TAU);
    x.stroke();x.restore();
  }
}
const releaseAddStar=addStar;
addStar=function(){if(mission)return spawnMissionStar();if(!B)return releaseAddStar();if(st.length||levelProgress()>=requiredStars(lv)-1)return;
  const margin=Math.min(40,W*.12,H*.1),top=Math.min(H*.4,180);
  for(let i=0;i<40;i++){const px=rnd(margin,W-margin),py=rnd(top,H-margin);if(bossContains(px,py)||Math.hypot(px-pl.x,py-pl.y)<60||ms.some(m=>Math.hypot(px-m.x,py-m.y)<70))continue;st.push({x:px,y:py,r:0});return}
};
const releaseEndBoss=endBoss;
endBoss=function(){
  if(!B||B.entry<1||(B.hp>0&&B.t<B.T))return;
  const level=B.L;
  releaseEndBoss();
  chapterVictory(level);
  save.bossProgress[level]=BOSS_REQUIREMENTS[level];
  store();
};
const releaseHurt=hurt;
hurt=function(){if(B){const L=B.L;B=null;delete bossSeen[L];st=[];ms=ms.filter(m=>!m.bm);clearBossIntro()}releaseHurt();addStar()};
const releaseUpdate=upd;
upd=function(d){releaseUpdate(d);if(S==='play'&&B){if(B.t<B.T&&B.hp>0&&B.entry>=1&&bossContains(pl.x,pl.y)&&inv<=0){if(shield>0){shield=0;inv=1}else if(!absorbImpact())hurt()}if(B&&!mission)addStar()}};
// Checkpoint/rescue entry must not skip a scheduled encounter.
function ensureBossEntry(){if(!flightMode)return;if(BOSS[lv]&&!B&&!bossSeen[lv])startBoss(lv)}
const releaseContinue=continueRun;
continueRun=function(){const ok=releaseContinue();if(ok)ensureBossEntry();return ok};

let directPointer=null,directTarget=null,dragStrength=1;
function setControlMode(mode){save.controlMode=mode==='touch'?'touch':'joystick';joyRel();store();settings()}
function touchPoint(e){const r=cv.getBoundingClientRect();return{x:Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)),y:Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height))}}
function steerDrag(point){
  const dx=point.x-directTarget.x,dy=point.y-directTarget.y,distance=Math.hypot(dx,dy);
  const range=({low:90,normal:60,high:40})[save.sensitivity]||60;
  dragStrength=Math.max(0,Math.min(1,(distance-5)/range));
  jAng=dragStrength?Math.atan2(dy,dx):null;
}
function cycleSensitivity(){
  const levels=['low','normal','high'];
  save.sensitivity=levels[(levels.indexOf(save.sensitivity||'normal')+1)%3];
  store();settings();
}
const releaseJoyRel=joyRel;
joyRel=function(){directPointer=null;directTarget=null;dragStrength=1;releaseJoyRel()};
cv.addEventListener('pointerdown',e=>{if(S!=='play'||save.controlMode!=='touch'||directPointer!==null||e.button>0)return;directPointer=e.pointerId;directTarget=touchPoint(e);steerDrag(directTarget);try{cv.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
cv.addEventListener('pointermove',e=>{if(e.pointerId===directPointer){steerDrag(touchPoint(e));e.preventDefault()}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])cv.addEventListener(name,e=>{if(e.pointerId===directPointer)joyRel()});
addEventListener('blur',()=>{keys={};joyRel();pauseG()});
addEventListener('resize',()=>joyRel());
const releaseShow=show;
show=function(id){releaseShow(id);if(id!==null)joyRel();if(id===null&&save.controlMode==='touch')$('joy').classList.add('hide')};
