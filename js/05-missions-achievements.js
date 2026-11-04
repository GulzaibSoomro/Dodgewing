// 05-missions-achievements.js: Power-up tables, daily missions, achievements, trail rewards, result/showcase/rewards screens
// Classic script (no modules): all files share one global scope and load in numeric order.
const PUT=['s','s','m','l'],PUC={s:['#6ec8ff','S'],m:['#6ee7b7','M'],l:['#c4a1ff','L']},PUN={s:'SHIELD',m:'MAGNET',l:'SLOW MISSILES'};
const MIS=[
 {id:'stars',t:'Collect 15 stars',k:'stars',n:15,r:60},
 {id:'nm',t:'Make 8 near-misses',k:'nm',n:8,r:60},
 {id:'lvl',t:'Reach plane Level 6 in one run',k:'lvl',n:6,r:80},
 {id:'boss',t:'Defeat a boss',k:'boss',n:1,r:100},
 {id:'shot',t:'Shoot down 12 missiles',k:'shot',n:12,r:60},
 {id:'surv',t:'Survive 90 seconds in one run',k:'surv',n:90,r:80},
 {id:'pu',t:'Collect 4 power-ups',k:'pu',n:4,r:50},
 {id:'bonus',t:'Earn 30 bonus points in one run',k:'bonus',n:30,r:70}];
const MAXK={lvl:1,surv:1,bonus:1};
const COS=[{id:'gold',n:'Gold',c:'255,224,102'},{id:'ember',n:'Ember',c:'255,120,60'},{id:'crimson',n:'Crimson',c:'255,70,90'},{id:'ice',n:'Ice',c:'140,210,255'},{id:'neon',n:'Neon',c:'110,255,200'},{id:'spark',n:'Spark',c:'255,255,255'},{id:'aurora',n:'Aurora',c:'170,140,255'},{id:'rainbow',n:'Rainbow',c:'rb'}];
const ACH=[
 {id:'first',n:'First Flight',d:'Finish your first run',cos:'ice',f:()=>save.stat.runs>=1},
 {id:'stars100',n:'Star Collector',d:'Collect 100 stars in total',cos:'gold',f:()=>save.stat.stars>=100},
 {id:'lv6',n:'Evolver',d:'Reach Level 6 in a run',cos:'ember',f:()=>save.stat.bestLv>=6||peakLv>=6},
 {id:'nm25',n:'Daredevil',d:'Make 25 near-misses in total',cos:'spark',f:()=>save.stat.nm>=25},
 {id:'shot50',n:'Sharpshooter',d:'Shoot down 50 missiles in total',cos:'crimson',f:()=>save.stat.shot>=50},
 {id:'boss1',n:'Boss Slayer',d:'Defeat any boss',cos:'neon',f:()=>save.stat.boss>=1},
 {id:'boss3',n:'Triple Threat',d:'Defeat all 3 bosses',cos:'aurora',f:()=>['heavy','cmdr','adv'].every(k=>save.stat.bossK[k])},
 {id:'surv120',n:'Survivor',d:'Survive 120 seconds in a run',cos:null,f:()=>save.stat.bestT>=120},
 {id:'mis5',n:'Mission Maker',d:'Complete 5 daily missions',cos:null,f:()=>save.stat.mis>=5},
 {id:'win',n:'Ace of Aces',d:'Win the Final Challenge',cos:'rainbow',f:()=>save.stat.wins>=1}];
function today(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function dayMis(){const td=today();if(save.m.day!==td){let h=0;for(const ch of td)h=(Math.imul(h,31)+ch.charCodeAt(0))>>>0;const pick=[];while(pick.length<3){h=(Math.imul(h,1664525)+1013904223)>>>0;const id=MIS[(h>>>8)%MIS.length].id;if(!pick.includes(id))pick.push(id)}save.m={day:td,list:pick,prog:{},done:{}};store()}return save.m}
function mEvent(k,n){const m=dayMis();for(const id of m.list){const o=MIS.find(q=>q.id===id);if(!o||o.k!==k||m.done[id])continue;m.prog[id]=MAXK[k]?Math.max(m.prog[id]||0,n):(m.prog[id]||0)+n;
  if(m.prog[id]>=o.n){m.done[id]=1;save.pts+=o.r;save.stat.mis++;fx.push({x:W/2,y:170,s:'MISSION COMPLETE +'+o.r+' pts',l:3,c:'#6ee7b7'});runNew.push('Mission: '+o.t+' (+'+o.r+' pts)');snd('up');store();chkAch()}}}
function chkAch(){for(const a of ACH){if(save.ach[a.id]||!a.f())continue;save.ach[a.id]=1;let tx='ACHIEVEMENT: '+a.n;if(a.cos&&!save.cu.includes(a.cos)){save.cu.push(a.cos);tx+=' (new trail!)'}fx.push({x:W/2,y:200,s:tx,l:3.2,c:'#ffe066'});runNew.push(tx.replace('ACHIEVEMENT: ','Achievement: '));snd('up');store()}}
function rb(){const h=(t*200)%360,f=n=>{const k=(n+h/60)%6;return Math.round(255*(1-Math.max(0,Math.min(k,4-k,1))))};return f(5)+','+f(3)+','+f(1)}
function curTrail(){const c=COS.find(o=>o.id===save.ct&&save.cu.includes(o.id));return c?(c.c==='rb'?rb():c.c):hexRgb(PLANES[save.sel].c)}
function setTrail(id){if(id==='auto'||(save.cu.includes(id)&&COS.some(o=>o.id===id))){save.ct=id;store();rewards()}}
function helpS(){S='menu';show('help')}
function showRes(earned,nb,k){const r=(a,b)=>'<div class="pl"><span>'+a+'</span><b>'+b+'</b></div>';
  $('res').innerHTML='<div class="card"><img class="gi" src="'+SPRD[peakLv-1]+'" alt=""><b>Best plane: Lv '+peakLv+' '+LV[peakLv-1]+'</b>'+r('Time survived',Math.floor(t)+' s')+r('Stars ('+stars+' x 5)',stars*5)+r('Flight coins','◈ '+runCoins)+r('Near-miss and boss bonus',bonus)+r('Points multiplier',M().mult+'x')+r('Points earned','<span class="hot">'+earned+'</span>')+(nb?'<div class="nb">New best score!</div>':r('Best campaign score',save.best[k]))+(runNew.length?'<b>Unlocked this run</b>'+runNew.map(q=>'<small>'+q+'</small>').join(''):'')+'</div>'}
let shY=0,shMax=260;
function layoutShow(){if(W>H&&innerHeight<500){shY=H*.63;shMax=100;return}try{const a=$('mh').getBoundingClientRect(),b=$('mb').getBoundingClientRect();shY=(a.bottom+b.top)/2-10-cv.getBoundingClientRect().top;shMax=Math.max(110,b.top-a.bottom-60)}catch(e){shY=0}if(!(shY>0)){shY=H*.4;shMax=260}}
function showcase(){const bl=Math.min(LEVEL_COUNT,Math.max(1,save.stat.bestLv)),im=SPR[bl-1];if(!im.complete||!im.naturalWidth)return;const cx=W>H&&innerHeight<500?W*.25:W/2,tm=performance.now()/1000,cy=shY||H*.4,sc=Math.min(sz()*2.6,shMax*.85),k=sc/Math.max(im.naturalWidth,im.naturalHeight),w=im.naturalWidth*k,h=im.naturalHeight*k,fy=cy+Math.sin(tm*1.6)*7;
  const rg=x.createRadialGradient(cx,cy,0,cx,cy,sc*.95);rg.addColorStop(0,'rgba(255,190,90,.38)');rg.addColorStop(1,'rgba(255,190,90,0)');x.fillStyle=rg;x.beginPath();x.arc(cx,cy,sc*.95,0,TAU);x.fill();
  x.save();x.setLineDash([4,7]);x.strokeStyle='rgba(255,243,224,.28)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,sc*.82,tm*.2,tm*.2+TAU);x.stroke();x.restore();
  x.save();x.translate(cx,fy);x.rotate(Math.sin(tm*.8)*.07-.1);x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=18;x.shadowOffsetY=14;x.drawImage(im,-w/2,-h/2,w,h);x.restore();
  const lb='Lv '+bl+'  '+LV[bl-1];x.font='16px Pixelta,monospace';const lw=x.measureText(lb).width+30;glass(cx-lw/2,cy+sc*.58,lw,32,12);x.fillStyle='#fff3e0';x.textAlign='center';x.fillText(lb,cx,cy+sc*.58+21);x.textAlign='left'}
function rewards(){S='menu';show('rw');save.cu=save.cu.filter(id=>COS.some(o=>o.id===id));if(!['auto'].concat(save.cu).includes(save.ct))save.ct='auto';const m=dayMis(),ck='<svg class="ck"><use href="#i-check"/></svg>';
  const h='<b class="sec">Daily missions</b>'+m.list.filter(id=>MIS.some(q=>q.id===id)).map(id=>{const o=MIS.find(q=>q.id===id),p=Math.min(o.n,m.prog[id]||0),d=m.done[id];return '<div class="mi"><span>'+o.t+'<small>+'+o.r+' pts</small></span>'+(d?ck:'<span class="mp">'+p+' / '+o.n+'</span>')+'<div class="bar"><i style="width:'+Math.round((d?o.n:p)/o.n*100)+'%"></i></div></div>'}).join('')
   +'<b class="sec">Achievements</b>'+ACH.map(a=>{const g=save.ach[a.id];return '<div class="mi ai'+(g?' got':'')+'"><span>'+a.n+'<small>'+a.d+(a.cos?' - trail: '+COS.find(c=>c.id===a.cos).n:'')+'</small></span>'+(g?ck:'')+'</div>'}).join('')
   + '<b class="sec">Best runs</b>'+(save.top.length?save.top.map((q,i)=>'<div class="mi rank"><span>#'+(i+1)+' - Level '+Math.max(1,Math.min(30,Number(q.level)||1))+'<small>'+Math.max(0,Number(q.stars)||0)+' stars - '+Math.max(0,Number(q.time)||0)+' s</small></span><b>'+Math.max(0,Number(q.score)||0)+'</b></div>').join(''):'<small>No runs yet. Start a flight!</small>')+'<b class="sec">Trails</b><div class="trs">'+['auto'].concat(save.cu).map(id=>{const c=id==='auto'?null:COS.find(o=>o.id===id),bg=id==='auto'?PLANES[save.sel].c:c.c==='rb'?'conic-gradient(#f44,#fd4,#4f8,#4df,#84f,#f4a,#f44)':'rgb('+c.c+')';return '<button '+(save.ct===id?'class="on"':'')+' onclick="setTrail(\''+id+'\')"><i class="sw" style="background:'+bg+'"></i>'+(id==='auto'?'Plane colour':c.n)+'</button>'}).join('')+'</div>';
  $('rwc').innerHTML=h}
