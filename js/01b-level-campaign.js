// Fixed-aircraft campaign configuration and versioned profile storage.
const STAR_GAP=2;
const LEVEL_CONFIG=Array.from({length:30},(_,i)=>{
  const level=i+1,chapter=chapterAt(level),boss=level===30?30:5*(1+i%5);
  const grade=chapter.id-1,p=i/29;
  const pressure={
    speed:.70+.37*p,spawn:1.5-.53*p,warning:1.6-.65*p,
    hp:.75+.45*p,interval:1.42-.46*p,density:Math.round(-1+2*p),
    missileCap:2+Math.round(p),minimumInterval:2.25-.28*p,
    firstWarning:4.5-2.5*p,hazardInterval:1.35-.4*p,score:1+.45*p
  };
  return {level,pressure,aircraft:level,chapter,environment:chapter.weather,target:20+2*grade,boss,
    hp:level===30?180:45+grade*11,pace:1+grade*.065,projectile:1+grade*.05,
    survival:level===30?48:18+grade*3+(boss/5-1)*1.5};
});
const FORGE_CONFIG={
 fuel:{name:'Fuel Tank',prices:[4,8,14],values:[60,90,120,150],describe:v=>v+' seconds per flight'},
 armor:{name:'Armor',prices:[5,9,14],values:[0,70,55,40],describe:v=>v?'Absorbs one hit every '+v+'s':'No impact plating'},
 engine:{name:'Engine',prices:[3,6,10],values:[1,1.04,1.08,1.12],describe:v=>'Turn response '+Math.round(v*100)+'%'},
 weapons:{name:'Weapons',prices:[5,8,13],values:[0,1,2,3],describe:v=>['Aircraft standard','Damage +6%','Paired nose shots, 58% damage each','Paired shots pierce one missile'][v]},
 defense:{name:'Defense',prices:[5,8,12],values:[0,1,2,3],describe:v=>['Standard family ability','Ability also shields for 1s','Ability jams tracking for 2s','Jam for 2s and guard for 1.5s'][v]}
};
const LEVEL_KEY='dw.level-campaign.v2',MIRROR_KEY=LEVEL_KEY+'.mirror';
const quantity=v=>Number.isSafeInteger(v)&&v>=0?v:0;
const legacyDifficulty=v=>['easy','medium','hard'].includes(v);
const profileRanks=raw=>Object.fromEntries(Object.keys(FORGE_CONFIG).map(k=>[k,Math.min(3,quantity(raw?.[k]))]));
function campaignData(raw){
  const completed=Math.min(30,quantity(raw?.completed)),limit=Math.min(30,completed+1);
  const profiles=Array.from({length:30},(_,i)=>profileRanks(i<limit?raw?.planes?.[i]:null));
  const checkpoints=Array.from({length:30},(_,i)=>i<limit&&(raw?.checkpoints?.[i]===true||legacyDifficulty(raw?.checkpoints?.[i])));
  const records=Array.from({length:completed},(_,i)=>{
    const old=raw?.records?.[i];
    return {level:i+1,boss:LEVEL_CONFIG[i].boss,...(legacyDifficulty(old?.mode)?{mode:old.mode}:{}),method:['combat','survival'].includes(old?.method)?old.method:null};
  });
  let flight=raw?.flight&&typeof raw.flight==='object'?{...raw.flight}:null;
  if(flight&&raw.schema===2&&(!legacyDifficulty(flight.mode)||(flight.phase==='boss'&&raw.checkpoints?.[flight.level-1]!==flight.mode)))flight=null;
  if(flight)delete flight.mode;
  return {schema:3,completed,records,selected:Math.min(limit,Math.max(1,quantity(raw?.selected))),wallet:quantity(raw?.wallet),
    lifetime:Math.max(quantity(raw?.wallet),quantity(raw?.lifetime)),planes:profiles,checkpoints,
    flight,core:completed===30};
}
let futureProfile=false;
function loadLevelProfile(){
  const parse=key=>{try{return JSON.parse(localStorage.getItem(key))}catch(_){return null}};
  const pair=[parse(LEVEL_KEY),parse(MIRROR_KEY)];
  futureProfile=pair.some(v=>v?.campaign?.schema>3);
  if(futureProfile)throw Error('A newer campaign save requires a newer game.');
  const intact=v=>v&&Number.isSafeInteger(v.campaign.wallet)&&v.campaign.wallet>=0&&Number.isSafeInteger(v.campaign.lifetime)&&Array.isArray(v.campaign.planes)&&v.campaign.planes.length===30;
  const current=pair.filter(v=>[2,3].includes(v?.campaign?.schema)).sort((a,b)=>Number(intact(b))-Number(intact(a))||quantity(b.revision)-quantity(a.revision));
  const data=current[0]||parse('dw')||parse('dw.flight.backup')||{};
  const loaded={...data,campaign:campaignData(current[0]?.campaign)};
  // Original dw remains readable by the previous build, including its old flight.
  delete loaded.flight;
  return loaded;
}
function writeLevelProfile(data){
  if(futureProfile)throw Error("A newer campaign save is protected");
  data.revision=quantity(data.revision)+1;
  const json=JSON.stringify(data);
  localStorage.setItem(LEVEL_KEY,json);
  try{localStorage.setItem(MIRROR_KEY,json)}catch(_){}
}
function aircraftStats(level){
  const ranks=save.campaign.planes[level-1];
  return Object.fromEntries(Object.entries(FORGE_CONFIG).map(([id,module])=>[id,module.values[ranks[id]]]));
}
function unlockedLevelCount(){return Math.min(30,save.campaign.completed+1)}
function levelOpen(n){return Number.isInteger(n)&&n>0&&n<=unlockedLevelCount()}
