// Chapter order is also the campaign map and blueprint unlock order.
const CHAPTERS=[
  {name:'Sky Cadet',accent:'#88daff',goal:'Secure the first airspace region',tech:'Reinforced Armor',weather:'morning',pattern:'guided',task:'Collect two stars',event:'star',target:2},
  {name:'Airspace Conflict',accent:'#ffbf72',goal:'Break the hostile missile command network',tech:'Radar Jammer',weather:'gold',pattern:'formation',task:'Evade a missile at close range',event:'near',target:1},
  {name:'Storm Intercept',accent:'#a8cdff',goal:'Cross the storm front and stop the interceptors',tech:'Afterburner',weather:'storm',pattern:'intercept',task:'Shoot down two threats',event:'shot',target:2},
  {name:'Siege Zone',accent:'#ff9785',goal:'Break the defensive blockade',tech:'Piercing Cannon',weather:'smoke',pattern:'armored',task:'Activate your signature ability',event:'ability',target:1},
  {name:'Night Hunters',accent:'#bcc1ff',goal:'Escape the coordinated hunter network',tech:'Phase Shield',weather:'moon',pattern:'hunter',task:'Evade two hunters at close range',event:'near',target:2},
  {name:'Final Horizon',accent:'#a4f3ee',goal:'Reclaim the skies from enemy command',tech:'Legendary Aircraft Core',weather:'cosmic',pattern:'mixed',task:'Intercept three enemy missiles',event:'shot',target:3}
].map((data,i)=>({...data,id:i+1,first:i*5+1,boss:(i+1)*5}));
const chapterAt=level=>CHAPTERS[Math.min(5,Math.max(0,Math.floor((level-1)/5)))];
const stageAt=level=>(level-1)%5;
const stageNames=['Arrival','Development','Special objective','Boss approach','Boss encounter'];
const ECONOMY={level:6,chapter:12,objective:8,costs:[18,40,64]};
function campaignProfile(){
  const state=obj(save.skybound),old=state.version!==1;
  const validLevels=(values,allowed)=>allowed.filter(n=>Array.isArray(values)&&values.includes(n));
  const ids=CHAPTERS.map(c=>c.id);
  state.completed=old?CHAPTERS.filter(c=>save.stat.bestLv>c.boss||Number(save.bossProgress?.[c.boss])>=requiredStars(c.boss)||save.stat.wins>0).map(c=>c.id):validLevels(state.completed,ids);
  state.highestPaid=Math.min(30,Math.max(0,Math.floor(num(state.highestPaid,old?save.stat.bestLv-1:0))));
  state.objectives=ids.map((id,i)=>Math.max(0,Math.min(CHAPTERS[i].target,Math.floor(num(state.objectives?.[i])))));
  state.version=1;
  state.chapter=chapterAt(save.flight?.level||save.stat.bestLv).id;
  save.skybound=state;
}
function chapterTask(event){}
function payStage(level){
  if(flightMode||level<=save.skybound.highestPaid)return;
  save.skybound.highestPaid=level;
  awardCoins(ECONOMY.level);
}
function decorateThreat(m){
  const c=chapterAt(lv),stage=stageAt(lv);
  if(c.pattern==='intercept'){m.kind='interceptor';m.v*=1.07;m.warning+=.12}
  if(c.pattern==='armored'){m.hp=m.hp0=Math.max(3,m.hp);m.v*=.92}
  if(c.pattern==='hunter'){m.h=1.25;m.warning+=.15}
  if(stage>0&&(c.pattern==='formation'||c.pattern==='mixed')&&ms.length<Math.min(cap(lv),levelPressure().missileCap)&&!B){
    const side=m.x<0||m.x>W;
    const wing={...m,x:side?m.x:Math.max(0,Math.min(W,m.x+75)),y:side?Math.max(0,Math.min(H,m.y+75)):m.y,warning:m.warning+.4,h:.45};
    ms.push(wing);
  }
}
function stageBrief(level){
  const c=chapterAt(level);
  return [c.goal,'Watch for '+c.pattern+' threats',c.task,'Boss approaching · '+BOSS[c.boss].n,'Destroy or evade '+BOSS[c.boss].n][stageAt(level)];
}
