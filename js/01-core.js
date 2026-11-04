// 01-core.js: Canvas, resize, helpers
// Classic script (no modules): all files share one global scope and load in numeric order.
const $=id=>document.getElementById(id),cv=$('c'),x=cv.getContext('2d',{alpha:false,desynchronized:false}),TAU=Math.PI*2;
x.imageSmoothingEnabled=true;if('imageSmoothingQuality'in x)x.imageSmoothingQuality='medium';
let W,H,DPR=1;
function rs(){const mobile=typeof navigator!=='undefined'&&/Android/i.test(navigator.userAgent||''),d=DPR=Math.min(devicePixelRatio||1,mobile?1.5:2),a=$('ad'),s=$('st'),AD=(a&&a.offsetHeight)||0,ST=(s&&s.offsetHeight)||0;W=innerWidth;H=Math.max(200,innerHeight-AD-ST);cv.width=W*d;cv.height=H*d;if(cv.style){cv.style.top=ST+'px';cv.style.height=H+'px'}if('imageSmoothingQuality'in x)x.imageSmoothingQuality=mobile?'low':'medium';x.setTransform(d,0,0,d,0,0)}
function frame(){x.setTransform(DPR,0,0,DPR,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.setLineDash([]);x.lineCap='butt';x.lineJoin='miter';x.textAlign='left';x.textBaseline='alphabetic';x.shadowBlur=0;x.shadowOffsetX=0;x.shadowOffsetY=0}
if(!x.roundRect)x.roundRect=function(a,b,c,e){this.rect(a,b,c,e)};
rs();addEventListener('resize',()=>{rs();try{pl.x=Math.min(pl.x,W);pl.y=Math.min(pl.y,H)}catch(e){}});
