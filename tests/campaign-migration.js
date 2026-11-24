const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const sources=['js/08c-chapters.js','js/01b-level-campaign.js'].map(read).join('\n');
const data=new Map(),s={localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}};
vm.createContext(s);vm.runInContext(sources,s);const run=exp=>vm.runInContext(exp,s);
const load=()=>run('loadLevelProfile()'),key='dw.level-campaign.v2',mirror=key+'.mirror';
const fresh=load();assert.equal(fresh.campaign.wallet,0);assert.equal(fresh.campaign.planes.length,30);
console.log('PASS fresh profile with 30 independent zeroed loadouts');
for(const version of [2,4]){
 data.clear();const legacy={v:version,coins:147,pts:603,sel:1,own:[0,1],upg:{eng:3},skybound:{equipped:{fuel:3,engine:3,armor:2}},flight:{level:26},ach:{boss1:1},stat:{stars:304,bestLv:26},controlMode:'touch',snd:false};
 const original=JSON.stringify(legacy);data.set('dw',original);const profile=load();
 assert.equal(profile.coins,147);assert.equal(profile.campaign.completed,0);assert.equal(profile.campaign.wallet,0);assert.equal(profile.campaign.flight,null);assert.equal(profile.campaign.planes[0].engine,0);
 assert.equal(profile.ach.boss1,1);assert.equal(profile.sel,1);assert.equal(profile.controlMode,'touch');assert.equal(profile.snd,false);
 profile.campaign.wallet=profile.campaign.lifetime=8;s.p=profile;run('writeLevelProfile(p)');assert.equal(load().campaign.wallet,8);assert.equal(data.get('dw'),original);
 console.log('PASS legacy v'+version+' currency/cosmetics/achievements/preferences preserved, no retroactive unlock or duplicate compensation');
}
data.set(key,'{');assert.equal(load().campaign.wallet,8);
const good=data.get(mirror),partial=JSON.parse(good);partial.revision++;delete partial.campaign.wallet;data.set(key,JSON.stringify(partial));assert.equal(load().campaign.wallet,8);
data.set(key,good);const newer=JSON.parse(good);newer.revision++;newer.campaign.wallet=3;data.set(mirror,JSON.stringify(newer));assert.equal(load().campaign.wallet,3);
data.clear();data.set('dw','{');data.set('dw.flight.backup','{"v":2,"coins":18}');assert.equal(load().coins,18);
const normalized=run("campaignData({wallet:-3,lifetime:'invalid',completed:-2,planes:[{engine:-4,fuel:99}]})");assert.equal(normalized.wallet,0);assert.equal(normalized.planes[0].engine,0);assert.equal(normalized.planes[0].fuel,3);assert.equal(normalized.planes[1].fuel,0);
data.set(key,'{"campaign":{"schema":9}}');assert.throws(load);assert.throws(()=>run('writeLevelProfile(p)'));assert.equal(data.get(key),'{"campaign":{"schema":9}}');
console.log('PASS partial/malformed values, missing fields, backup recovery, newest coherent revision and future-schema overwrite protection');
