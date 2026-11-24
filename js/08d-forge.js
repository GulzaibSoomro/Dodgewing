let armorCooldown=0,jammerTime=0,selectedModule='fuel';
const forgeTier=key=>save.campaign.planes[lv-1][key];
const forgePlane=()=>save.campaign.selected;
function buyModule(level,key,rank){
  if(S!=='menu'||flightMode||level!==forgePlane()||!levelOpen(level)||!Object.hasOwn(FORGE_CONFIG,key))return false;
  const c=save.campaign,ranks=c.planes[level-1],module=FORGE_CONFIG[key];
  if(rank!==ranks[key]+1||rank>3||(key==='weapons'&&!WPN[level]))return false;
  const price=module.prices[rank-1];if(c.wallet<price)return false;
  const oldFuel=c.flight?.fuel;
  c.wallet-=price;ranks[key]=rank;
  if(key==='fuel'&&c.flight?.level===level)c.flight.fuel+=module.values[rank]-module.values[rank-1];
  try{writeLevelProfile(save)}catch(e){c.wallet+=price;ranks[key]--;if(oldFuel!==undefined)c.flight.fuel=oldFuel;return false}
  snd('up');return true;
}
const turnFactor=()=>aircraftStats(lv).engine;
function absorbImpact(){
  const tier=forgeTier('armor');
  if(!tier||armorCooldown>0)return false;
  armorCooldown=aircraftStats(lv).armor;inv=.85;shieldFlash=.4;snd('hit');store();
  fx.push({x:pl.x,y:pl.y-30,s:'ARMOR ABSORBED HIT',l:1,c:'#afdcff'});
  return true;
}
function triggerDefense(){
  const tier=forgeTier('defense');
  if(tier===1)shield=Math.max(shield,1);
  if(tier>=2)jammerTime=2;
  if(tier===3)inv=Math.max(inv,1.5);
}
function drawLoadout(ctx,size,equipment,core,level=lv){
  if(!core&&!equipment.engine&&!equipment.armor&&!equipment.weapons&&!equipment.defense)return;
  ctx.save();ctx.scale(size/100,size/100);ctx.lineWidth=2;
  if(equipment.engine){ctx.fillStyle='#75eeff';ctx.beginPath();ctx.moveTo(-3,24);ctx.lineTo(0,31+3*equipment.engine);ctx.lineTo(3,24);ctx.fill()}
  if(equipment.armor){ctx.strokeStyle='#a5c9dd';for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*4,-10);ctx.lineTo(side*8,6);ctx.lineTo(side*5,12);ctx.stroke()}}
  if(equipment.weapons&&WPN[level]){ctx.fillStyle='#b4d2df';for(const side of [-1,1])ctx.fillRect(side*14-1,-8,2,10+equipment.weapons*2)}
  if(equipment.defense||core){ctx.strokeStyle=core?'#ffdc7a':'#74dfff';ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(0,1,31,Math.PI*.18,Math.PI*.82);ctx.stroke()}
  ctx.restore();
}
