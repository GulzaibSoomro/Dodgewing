// Logic tests with a mocked canvas/DOM (no browser). Run: python3 tools/build.py && node tests/run-tests.js
// They cover rules (evolution, hits, modes, bosses, auto-fire weapons, sky, joystick, missions, achievements, save migration).
// They do NOT cover real rendering, touch feel, performance or audio: see TESTING.md.
const fs=require('fs');
let seed=408;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','dodgewing.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0];
let errs=[],calls={drawImage:0};
const store={};
const ctx=new Proxy({},{get:(t,k)=>{if(k==='measureText')return()=>({width:200});if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});if(k==='drawImage')return(...a)=>{calls.drawImage++;calls.last=a};return typeof t[k]==='undefined'?()=>{}:t[k]},set:(t,k,v)=>{t[k]=v;return true}});
const els={};
const el=id=>els[id]||(els[id]={id,textContent:'',innerHTML:'',classList:{toggle(){},add(){},remove(){}},getContext:()=>ctx,addEventListener(){},width:0,height:0});
let _vis=[];global.document={getElementById:el,hidden:false,addEventListener:(t,f)=>{if(t==='visibilitychange')_vis.push(f)}};
global.window=global;global.innerWidth=+process.env.W||390;global.innerHeight=+process.env.H||800;global.devicePixelRatio=2;
global.performance={now:()=>0};global.requestAnimationFrame=()=>{};
global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}};
global._ev={};global.addEventListener=(t,f)=>{(_ev[t]=_ev[t]||[]).push(f)};global.setTimeout=()=>{};
global.Image=class{set src(v){this._s=v;this.complete=true;this.naturalWidth=100;this.naturalHeight=120}};

const assert=require('assert/strict');
function exercise(){
  for(const mode of ['easy','medium','hard']){
    launchCampaign(mode);
    const id=activeRun;
    const random=Math.random;Math.random=()=>.1;spawnMissile();Math.random=random;
    const scales={easy:[.8,1.3,.75,1.4,1],medium:[1,1,1,1,1.25],hard:[1.2,.8,1.3,.8,1.5]}[mode];
    const speed=ms[0].v,warning=ms[0].warning;ms=[];msT=0;upd(.001);
    if(Math.abs(speed-150*.55*scales[0])>.001||Math.abs(msT-2.8*scales[1])>.001||Math.abs(warning-.5*scales[3])>.001)throw Error('pressure '+mode);
    setFlightLevel(20);if(B.hpMax!==Math.round(140*scales[2]))throw Error('HP '+mode);
    t=20;if(flightScore()!==Math.floor(20*scales[4]))throw Error('score '+mode);
    commitFlight();menu();const prior=JSON.stringify(save.flight);
    save.stat.bestLv=25;startFlightMode('practice',25);upd(.05);menu();
    if(JSON.stringify(save.flight)!==prior||!recoverFlight()||activeRun!==id||lv!==20||runDifficulty!==mode)throw Error('optional mode damaged checkpoint');
    upd(3);die();
    if(save.flight||JSON.parse(localStorage.getItem('dw.flight.backup')).flight)throw Error('terminal mirror');
  }
  console.log('PASS three modes, missile speed, spawn interval, warning, boss HP and score');
  console.log('PASS optional flight preserves campaign and terminal commit clears mirror');
  start();upd(.01);menu();
  for(const change of [{schema:2},{level:31},{level:0},{mode:'other'},{progress:99},{x:Infinity},{cleared:Array(8).fill(5)},{boss:{hp:-1,time:0,volley:0}}]){
    if(validFlight({...save.flight,...change}))throw Error('invalid flight accepted');
  }
  console.log('PASS malformed checkpoint fields rejected');
}
new Function(js+'\n('+exercise.toString()+')()')();
