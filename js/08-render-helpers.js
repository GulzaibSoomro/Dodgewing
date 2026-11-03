// 08-render-helpers.js: Small canvas drawing helpers
// Classic script (no modules): all files share one global scope and load in numeric order.
function drawSpr(i,al,sc){const im=SPR[i];if(!im.complete||!im.naturalWidth){x.globalAlpha=al;x.fillStyle='#fff3e0';x.beginPath();x.moveTo(0,-16);x.lineTo(-10,11);x.lineTo(10,11);x.closePath();x.fill();x.globalAlpha=1;return}
  const k=sz()/Math.max(im.naturalWidth,im.naturalHeight)*sc,w=im.naturalWidth*k,h=im.naturalHeight*k;x.globalAlpha=al;x.drawImage(im,-w/2,-h/2,w,h);drawRank(i,w,h);x.globalAlpha=1}
// Small gold service bars distinguish upgrades while retaining the original sprite art.
function drawRank(i,w,h){const rank=STAGES[i].rank;if(rank<2)return;x.fillStyle='#ffe6a0';x.strokeStyle='#754015';x.lineWidth=1;for(let k=0;k<rank-1;k++){x.fillRect(-w*.12,-h*.05+k*5,w*.24,3);x.strokeRect(-w*.12,-h*.05+k*5,w*.24,3)}}
function ctxDot(px,py,r,c){x.fillStyle=c;x.beginPath();x.arc(px,py,r,0,TAU);x.fill()}
function ctxA(a){x.globalAlpha=a}
function ctxT(s,px,py){x.font='17px Pixelta,monospace';x.fillText(s,px,py)}
function ctxRR(px,py,w,h){x.beginPath();x.roundRect(px,py,w,h,4);x.fill()}
function ctxFlame(){ctxDot(-13,0,3+Math.random()*2,'#ffd166')}
function ctxFin(){ctxDot(10,0,2,'#fff3e0')}
function starAt(px,py,k,r,nog){x.save();x.translate(px,py);x.rotate(r);x.scale(k,k);if(!nog){x.fillStyle='rgba(255,210,80,.12)';x.beginPath();x.arc(0,0,19,0,TAU);x.fill()}x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?7:15;x.lineTo(Math.cos(a)*q,Math.sin(a)*q)}x.closePath();x.fillStyle='#ffd84d';x.strokeStyle='#b8741a';x.lineWidth=2;x.lineJoin='round';x.fill();x.stroke();x.restore()}
function otext(s,px,py,col){x.font='17px Pixelta,monospace';x.lineJoin='round';x.lineWidth=4;x.strokeStyle='rgba(10,8,30,.7)';x.strokeText(s,px,py);x.fillStyle=col;x.fillText(s,px,py)}
function ctxStar(px,py,r){starAt(px,py,1,Math.sin(r)*.35)}
function ctxMissile(body,nose){
  x.fillStyle='rgba(255,140,50,.55)';x.beginPath();x.ellipse(-15,0,7+Math.random()*2,3.5,0,0,TAU);x.fill();ctxDot(-13,0,2.5+Math.random()*1.5,'#ffd166');
  x.fillStyle=nose;x.beginPath();x.moveTo(-9,-3);x.lineTo(-14,-9);x.lineTo(-3,-4.5);x.closePath();x.fill();x.beginPath();x.moveTo(-9,3);x.lineTo(-14,9);x.lineTo(-3,4.5);x.closePath();x.fill();
  x.fillStyle=body;x.beginPath();x.roundRect(-11,-4.5,22,9,4);x.fill();x.strokeStyle='rgba(30,10,10,.55)';x.lineWidth=1;x.stroke();
  x.fillStyle=nose;x.beginPath();x.moveTo(10,-4.5);x.quadraticCurveTo(19,0,10,4.5);x.closePath();x.fill();
  x.fillStyle='rgba(255,255,255,.45)';x.fillRect(-8,-3,16,1.5)}
function glass(px,py,w,h,r){x.save();const g=x.createLinearGradient(0,py,0,py+h);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,.04)');x.fillStyle='rgba(16,14,40,.55)';x.beginPath();x.roundRect(px,py,w,h,r);x.fill();x.fillStyle=g;x.fill();x.strokeStyle='rgba(255,243,224,.24)';x.lineWidth=1;x.stroke();x.restore()}
function pips(px,py,w,h,n,fill){const gap=4,pw=(w-gap*(n-1))/n;for(let i=0;i<n;i++){const bx=px+i*(pw+gap);x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.roundRect(bx,py,pw,h,h/2);x.fill();const f=Math.max(0,Math.min(1,fill-i));if(f>0){x.fillStyle='#4fdca0';x.beginPath();x.roundRect(bx,py,Math.max(h,pw*f),h,h/2);x.fill()}}}
function drawHud(){
  const bw=40,lw=Math.max(150,Math.min(190,W-16-16-bw-8-100-8)),rx=16+lw+8,rw=Math.max(84,W-16-bw-8-rx),im=SPR[lv-1];
  glass(16,14,lw,66,14);
  if(im&&im.complete&&im.naturalWidth){const k=50/Math.max(im.naturalWidth,im.naturalHeight);x.drawImage(im,26+(50-im.naturalWidth*k)/2,22+(50-im.naturalHeight*k)/2,im.naturalWidth*k,im.naturalHeight*k)}
  x.textAlign='left';x.font='20px Pixelta,monospace';x.fillStyle='#ffd166';x.fillText('Lv '+lv,86,38);
  pips(86,46,lw-82,8,5,lv>=LEVEL_COUNT?5:evoStars%5);
  x.font='13px Pixelta,monospace';x.fillStyle='rgba(255,243,224,.8)';x.fillText(lv>=LEVEL_COUNT?'MAX':(evoStars%5)+' of 5 stars',86,71);
  glass(rx,14,rw,66,14);
  starAt(rx+24,38,.85,0,1);x.font='22px Pixelta,monospace';x.fillStyle='#fff3e0';x.fillText(String(stars),rx+44,45);
  x.font='13px Pixelta,monospace';x.fillStyle=bonus>0?'#6ee7b7':'rgba(255,243,224,.8)';x.fillText(Math.floor(t)+' s   +'+bonus,rx+12,70);
  let ey=H-150;for(const [n,v,c] of [['Shield',shield,'#6ec8ff'],['Magnet',mag,'#6ee7b7'],['Slow',slow,'#c4a1ff']])if(v>0){glass(16,ey-20,128,28,10);ctxDot(31,ey-6,5,c);x.font='14px Pixelta,monospace';x.fillStyle='#fff3e0';x.fillText(n+' '+Math.ceil(v)+' s',44,ey-1);ey-=34}
}
