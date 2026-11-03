// 02-save-and-assets.js: Plane skins, save data (localStorage key "dw"), plane names, sprite loading
// Classic script (no modules): all files share one global scope and load in numeric order.
const PLANES=[{n:'Scout',c:'#ffb347',p:0,w:1},{n:'Dart',c:'#6ee7b7',p:400,w:.7},{n:'Comet',c:'#f472b6',p:1200,w:1.15},{n:'Phantom',c:'#a5b4fc',p:3000,w:.9}];
const saveDefaults={v:2,pts:0,best:{e:0,n:0,f:0},own:[0],sel:0,mode:'n',m:{day:'',list:[],prog:{},done:{}},ach:{},stat:{runs:0,stars:0,nm:0,shot:0,boss:0,bossK:{},wins:0,mis:0,bestLv:1,bestT:0,pu:0},cu:[],ct:'auto',fx:true,tutorial:false};
let save=Object.assign({},saveDefaults);
try{const loaded=JSON.parse(localStorage.getItem('dw')||'{}');if(loaded&&typeof loaded==='object'&&!Array.isArray(loaded))Object.assign(save,loaded)}catch(e){}
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
save.v=Math.max(0,Math.floor(num(save.v,2)));save.pts=Math.max(0,Math.floor(num(save.pts)));
save.best=Object.assign({e:0,n:0,f:0,play:0},obj(save.best));for(const k of ['e','n','f','play'])save.best[k]=Math.max(0,Math.floor(num(save.best[k])));
save.own=Array.isArray(save.own)?[...new Set(save.own.map(v=>Math.floor(num(v,-1))).filter(v=>v>=0&&v<PLANES.length))]:[];if(!save.own.includes(0))save.own.unshift(0);
save.sel=Math.floor(num(save.sel));if(!save.own.includes(save.sel))save.sel=0;save.mode=['e','n','f'].includes(save.mode)?save.mode:'n';
save.m=Object.assign({day:'',list:[],prog:{},done:{}},obj(save.m));save.m.day=typeof save.m.day==='string'?save.m.day:'';save.m.list=Array.isArray(save.m.list)?save.m.list.filter(v=>typeof v==='string'):[];save.m.prog=obj(save.m.prog);save.m.done=obj(save.m.done);
save.ach=obj(save.ach);save.stat=Object.assign({runs:0,stars:0,nm:0,shot:0,boss:0,bossK:{},wins:0,mis:0,bestLv:1,bestT:0,pu:0},obj(save.stat));for(const k of ['runs','stars','nm','shot','boss','wins','mis','bestT','pu'])save.stat[k]=Math.max(0,Math.floor(num(save.stat[k])));save.stat.bestLv=Math.max(1,Math.floor(num(save.stat.bestLv,1)));save.stat.bossK=obj(save.stat.bossK);
save.cu=Array.isArray(save.cu)?[...new Set(save.cu.filter(v=>typeof v==='string'))]:[];save.ct=typeof save.ct==='string'?save.ct:'auto';save.top=Array.isArray(save.top)?save.top.filter(v=>v&&typeof v==='object'):[];save.fx=save.fx!==false;save.tutorial=save.tutorial===true;
function store(){try{localStorage.setItem('dw',JSON.stringify(save))}catch(e){}}

const AIRCRAFT=["Wooden Glider", "Early Biplane", "Classic Biplane", "Marked Biplane", "Red Triplane", "Camouflage Fighter", "Prop Fighter", "Prop Fighter II", "Single-Wing Fighter", "Camouflage Fighter II", "Early Warplane", "Classic Fighter", "Navy Fighter", "Classic Jet", "Red Star Jet", "Roundel Jet", "Delta Jet", "Strike Jet", "Supersonic Jet", "Stealth Jet", "Delta Jet II", "Twin-Tail Jet", "Twin-Engine Jet", "Advanced Jet", "Modern Fighter", "Heavy Fighter", "Stealth Bomber", "Super Fighter", "Futuristic Jet", "Plasma Jet"];
const BASE_SPRD=["assets/planes/plane_01.png", "assets/planes/plane_02.png", "assets/planes/plane_03.png", "assets/planes/plane_04.png", "assets/planes/plane_05.png", "assets/planes/plane_06.png", "assets/planes/plane_07.png", "assets/planes/plane_08.png", "assets/planes/plane_09.png", "assets/planes/plane_10.png", "assets/planes/plane_11.png", "assets/planes/plane_12.png", "assets/planes/plane_13.png", "assets/planes/plane_14.png", "assets/planes/plane_15.png", "assets/planes/plane_16.png", "assets/planes/plane_17.png", "assets/planes/plane_18.png", "assets/planes/plane_19.png", "assets/planes/plane_20.png", "assets/planes/plane_21.png", "assets/planes/plane_22.png", "assets/planes/plane_23.png", "assets/planes/plane_24.png", "assets/planes/plane_25.png", "assets/planes/plane_26.png", "assets/planes/plane_27.png", "assets/planes/plane_28.png", "assets/planes/plane_29.png", "assets/planes/plane_30.png"];
const BASE_SPR=BASE_SPRD.map(u=>{const i=new Image();i.src=u;return i});
const sz=()=>Math.max(48,Math.min(78,Math.min(W,H)*.11));
const LEVEL_COUNT=30, STARS_PER_LEVEL=5;
const tierOf=L=>Math.max(1,Math.min(LEVEL_COUNT,Math.floor(L)||1));
// Old 12-plane saves unlock the first stage where each legacy aircraft appeared.
const levelForTier=T=>1+Math.ceil((Math.max(1,Math.min(12,T))-1)*(LEVEL_COUNT-1)/11);
const ZONES=['Sunrise Skies','Storm Front','Sunset Run','Midnight Flight','Deep Space','Cosmic Finale'];
const STAGES=AIRCRAFT.map((n,i)=>({tier:i+1,rank:1,n,zone:ZONES[Math.floor(i/5)]}));
const LV=STAGES.map(s=>s.n),SPRD=BASE_SPRD.slice(),SPR=BASE_SPR.slice();
const lvOf=n=>Math.min(LEVEL_COUNT,1+Math.floor(Math.max(0,n)/STARS_PER_LEVEL));
// Preserve legacy scores and record the original milestone before expanding its unlocks.
if(save.v<3){save.legacyBestLv=save.stat.bestLv;save.stat.bestLv=levelForTier(Math.max(1,Math.min(12,save.stat.bestLv)));save.v=3}
if(save.v<4){if(save.legacyBestLv!==undefined)save.stat.bestLv=levelForTier(save.legacyBestLv);else save.stat.bestLv=Math.max(1,Math.min(LEVEL_COUNT,save.stat.bestLv));save.v=4}
save.best.play=Math.max(0,Math.floor(num(save.best.play)));

const hexRgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)).join(',');
