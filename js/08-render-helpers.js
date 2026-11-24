// 08-render-helpers.js: Small canvas drawing helpers
// Classic script (no modules): all files share one global scope and load in numeric order.
function drawSpr(i,al,sc){const im=SPR[i];if(!im.complete||!im.naturalWidth){const scale=PLAYER_DRAW_SCALE*sc;x.globalAlpha=al;x.fillStyle='#fff3e0';x.beginPath();x.moveTo(0,-16*scale);x.lineTo(-10*scale,11*scale);x.lineTo(10*scale,11*scale);x.closePath();x.fill();x.globalAlpha=1;return}
  const k=playerDrawSize()/Math.max(im.naturalWidth,im.naturalHeight)*sc,w=im.naturalWidth*k,h=im.naturalHeight*k;x.globalAlpha=al;x.drawImage(im,-w/2,-h/2,w,h);drawRank(i,w,h);x.globalAlpha=1}
// Small gold service bars distinguish upgrades while retaining the original sprite art.
function drawRank(i,w,h){const rank=STAGES[i].rank;if(rank<2)return;x.fillStyle='#ffe6a0';x.strokeStyle='#754015';x.lineWidth=1;for(let k=0;k<rank-1;k++){x.fillRect(-w*.12,-h*.05+k*5,w*.24,3);x.strokeRect(-w*.12,-h*.05+k*5,w*.24,3)}}
function ctxDot(px,py,r,c){x.fillStyle=c;x.beginPath();x.arc(px,py,r,0,TAU);x.fill()}
function ctxA(a){x.globalAlpha=a}
function ctxT(s,px,py){x.font=canvasFont(17);x.fillText(s,px,py)}
function ctxRR(px,py,w,h){x.beginPath();x.roundRect(px,py,w,h,4);x.fill()}
function flameVariation(){return S==='paused'||S==='countdown'?.5:Math.random()}
function ctxFlame(){ctxDot(-13,0,3+flameVariation()*2,'#ffd166')}
function ctxFin(){ctxDot(10,0,2,'#fff3e0')}
function starAt(px,py,k,r,nog){x.save();x.translate(px,py);x.rotate(r);x.scale(k,k);if(!nog){x.fillStyle='rgba(255,210,80,.12)';x.beginPath();x.arc(0,0,19,0,TAU);x.fill()}x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?7:15;x.lineTo(Math.cos(a)*q,Math.sin(a)*q)}x.closePath();x.fillStyle='#ffd84d';x.strokeStyle='#b8741a';x.lineWidth=2;x.lineJoin='round';x.fill();x.stroke();x.restore()}
function otext(s,px,py,col){x.font=canvasFont(17);x.lineJoin='round';x.lineWidth=4;x.strokeStyle='rgba(10,8,30,.7)';x.strokeText(s,px,py);x.fillStyle=col;x.fillText(s,px,py)}
function ctxStar(px,py,r){starAt(px,py,1,Math.sin(r)*.35)}
function ctxMissile(body,nose){
  x.fillStyle='rgba(255,140,50,.55)';x.beginPath();x.ellipse(-15,0,7+flameVariation()*2,3.5,0,0,TAU);x.fill();ctxDot(-13,0,2.5+flameVariation()*1.5,'#ffd166');
  x.fillStyle=nose;x.beginPath();x.moveTo(-9,-3);x.lineTo(-14,-9);x.lineTo(-3,-4.5);x.closePath();x.fill();x.beginPath();x.moveTo(-9,3);x.lineTo(-14,9);x.lineTo(-3,4.5);x.closePath();x.fill();
  x.fillStyle=body;x.beginPath();x.roundRect(-11,-4.5,22,9,4);x.fill();x.strokeStyle='rgba(30,10,10,.55)';x.lineWidth=1;x.stroke();
  x.fillStyle=nose;x.beginPath();x.moveTo(10,-4.5);x.quadraticCurveTo(19,0,10,4.5);x.closePath();x.fill();
  x.fillStyle='rgba(255,255,255,.45)';x.fillRect(-8,-3,16,1.5)}
function drawBossArt(skin,size){const im=BOSS_SHEET,cell=180;if(!im||!im.complete||!im.naturalWidth)return false;const s=Math.max(0,Math.min(3,skin|0));x.save();x.shadowColor=s===2?'rgba(194,92,255,.72)':s===3?'rgba(72,224,255,.72)':'rgba(255,114,78,.54)';x.shadowBlur=lowGraphics()?0:10;x.drawImage(im,(s%2)*cell,Math.floor(s/2)*cell,cell,cell,-size/2,-size/2,size,size);x.restore();return true}
function drawBossAt(skin,px,py,size,turn=0){x.save();x.translate(px,py);x.rotate(turn);if(!drawBossArt(skin,size)){x.fillStyle=skin===3?'#48dcff':skin===2?'#a658ff':'#d94040';x.beginPath();x.arc(0,0,size*.26,0,TAU);x.fill()}x.restore()}
const MISSILE_DRAW_SIZE=48;
function drawEnemyMissile(m){if(Number.isFinite(m.bossSkin)){x.save();x.rotate(Math.PI/2);if(!drawBossArt(m.bossSkin,m.bossSkin===0?112:102))ctxMissile(m.adv?'#b05cff':'#d9372f',m.adv?'#5a1fa8':'#7a1010');x.restore();return}const im=MISSILE_SHEET,skin=Math.max(0,Math.min(29,Number.isFinite(m.skin)?m.skin:normalMissileSkin(lv)));if(!im||!im.complete||!im.naturalWidth){ctxMissile(m.adv?'#b05cff':m.big?'#d9372f':m.kind==='armored'?'#8f57d6':m.kind==='weaver'?'#5bc7d5':m.kind==='interceptor'?'#e59646':'#ece8e0',m.adv?'#5a1fa8':m.big?'#7a1010':m.kind==='weaver'?'#185c82':'#e5533d');return}const cols=6,cw=im.naturalWidth/cols,ch=im.naturalHeight/5,k=m.big?1.32:m.adv?1.15:1,size=MISSILE_DRAW_SIZE*k;x.save();x.rotate(Math.PI/2);x.drawImage(im,(skin%cols)*cw,Math.floor(skin/cols)*ch,cw,ch,-size/2,-size/2,size,size);x.restore()}
function glass(px,py,w,h,r){x.save();const g=x.createLinearGradient(0,py,0,py+h);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,.04)');x.fillStyle='rgba(16,14,40,.55)';x.beginPath();x.roundRect(px,py,w,h,r);x.fill();x.fillStyle=g;x.fill();x.strokeStyle='rgba(255,243,224,.24)';x.lineWidth=1;x.stroke();x.restore()}
function pips(px,py,w,h,n,fill){const gap=4,pw=(w-gap*(n-1))/n;for(let i=0;i<n;i++){const bx=px+i*(pw+gap);x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.roundRect(bx,py,pw,h,h/2);x.fill();const f=Math.max(0,Math.min(1,fill-i));if(f>0){x.fillStyle='#4fdca0';x.beginPath();x.roundRect(bx,py,Math.max(h,pw*f),h,h/2);x.fill()}}}
function drawHud(){
  const lw=Math.max(112,Math.min(172,(W-136)*.55)),rx=16+lw+8,rw=W-112-rx,im=SPR[lv-1],starScale=reducedMotion()?1:1+hudStarPop*.12;
  glass(16,14,lw,66,14);
  if(im&&im.complete&&im.naturalWidth){const k=34/Math.max(im.naturalWidth,im.naturalHeight);x.drawImage(im,22+(34-im.naturalWidth*k)/2,22+(34-im.naturalHeight*k)/2,im.naturalWidth*k,im.naturalHeight*k)}
  x.textAlign='left';x.font=canvasFont(18,700,'score');x.fillStyle='#ffd166';x.fillText('Lv '+lv,62,37,lw-54);
  if(mission){x.fillStyle='#c5e9ff';x.font=canvasFont(13);x.fillText(mission.phase==='boss'?'Boss checkpoint':mission.count+'/'+cfgFor(lv).target+' ★',62,55,lw-52);x.font=canvasFont(12);x.fillText('Wallet '+save.campaign.wallet+' ★',24,74,lw-16);glass(rx,14,rw,66,14);x.fillStyle=mission.fuel<=10?'#ffd070':'#fff';x.font=canvasFont(12);x.fillText('FUEL',rx+6,33,rw-12);x.font=canvasFont(17,700,'score');x.fillText(fuelClock(mission.fuel),rx+6,53,rw-12);if(forgeTier('armor')){x.font=canvasFont(10);x.fillText(armorCooldown>0?'Armor '+Math.ceil(armorCooldown)+'s':'Armor ready',rx+5,70,rw-10)}}else{
  pips(62,45,lw-54,7,requiredStars(lv),levelProgress());
  x.font=canvasFont(13);x.fillStyle='rgba(255,243,224,.9)';x.fillText(levelProgress()+'/'+requiredStars(lv)+' STARS',62,70,lw-54);
  glass(rx,14,rw,66,14);
  starAt(rx+17,36,.65*starScale,0,1);x.font=canvasFont(20*starScale,600,'score');x.fillStyle='#fff3e0';x.fillText(String(stars),rx+33,43,rw-39);
  x.font=canvasFont(14,600,'score');x.fillStyle=hudCoinPop>0?'#ffe29a':'#fff3e0';x.fillText('◈ '+runCoins,rx+10,69,rw-20);
  x.font=canvasFont(12);x.fillStyle='#fff3e0';x.textAlign='right';x.fillText(flightScore()+' pts',W-16,79,88);x.textAlign='left';
  }
  const powers=[['Shield',shield,'#6ec8ff'],['Magnet',mag,'#6ee7b7'],['Slow Motion',slow,'#ffdc72']].filter(p=>p[1]>0);
  if(powers.length){const py=86,pw=W-32,step=pw/powers.length;glass(16,py,pw,42,12);x.font=canvasFont(12);powers.forEach(([n,v,c],i)=>{const px=16+i*step+9,barW=Math.max(28,step-56),full=n==='Shield'?shieldTime():n==='Magnet'?8:6,ratio=Math.max(0,Math.min(1,v/full));drawPowerIcon(n==='Shield'?'s':n==='Magnet'?'m':'l',px+8,py+17,20);x.textAlign='left';x.fillStyle='#fff3e0';x.font=canvasFont(12);x.fillText(n+' '+Math.ceil(v)+'s',px+21,py+18,step-34);x.fillStyle='rgba(0,0,0,.36)';x.beginPath();x.roundRect(px+21,py+25,barW,5,3);x.fill();x.fillStyle=v<=1?'#fff':c;x.beginPath();x.roundRect(px+21,py+25,Math.max(4,barW*ratio),5,3);x.fill()})}
}

// Both flight pickups and HUD indicators use this drawing at their own scale.
function drawPowerIcon(kind,cx,cy,size){
  x.save();x.translate(cx,cy);x.scale(size/32,size/32);
  x.lineJoin='round';x.lineCap='round';x.lineWidth=2;
  x.fillStyle='#12314d';x.strokeStyle='#f0fbff';
  x.beginPath();x.arc(0,0,15,0,TAU);x.fill();x.stroke();
  if(kind==='s'){
    x.fillStyle='#57d7ff';x.strokeStyle='#bff4ff';
    x.beginPath();x.moveTo(0,-11);x.lineTo(9,-7);x.lineTo(8,2);
    x.quadraticCurveTo(7,7,0,11);x.quadraticCurveTo(-7,7,-8,2);
    x.lineTo(-9,-7);x.closePath();x.fill();x.stroke();
    x.fillStyle='#2284bf';x.beginPath();x.moveTo(0,-8);x.lineTo(6,-6);x.lineTo(5,2);x.lineTo(0,8);x.closePath();x.fill();
  }else if(kind==='m'){
    x.rotate(.25);x.lineWidth=6;x.strokeStyle='#ff6966';
    x.beginPath();x.moveTo(-7,-7);x.lineTo(-7,2);x.arc(0,2,7,Math.PI,0,true);x.lineTo(7,-7);x.stroke();
    x.fillStyle='#b3f5c7';x.fillRect(-10,-10,6,5);x.fillRect(4,-10,6,5);
  }else{
    x.fillStyle='#ffda68';x.beginPath();x.arc(0,1,10,0,TAU);x.fill();
    x.strokeStyle='#fff2ae';x.lineWidth=3;x.beginPath();x.moveTo(-3,-11);x.lineTo(3,-11);x.stroke();
    x.strokeStyle='#173957';x.beginPath();x.moveTo(0,-5);x.lineTo(0,1);x.lineTo(5,4);x.stroke();
  }
  x.restore();
}
