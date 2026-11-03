// 01-core.js: Canvas, resize, helpers
// Classic script (no modules): all files share one global scope and load in numeric order.
const $=id=>document.getElementById(id),cv=$('c'),x=cv.getContext('2d'),TAU=Math.PI*2;
let W,H;
function rs(){const d=Math.min(devicePixelRatio||1,2),a=$('ad'),s=$('st'),AD=(a&&a.offsetHeight)||0,ST=(s&&s.offsetHeight)||0;W=innerWidth;H=Math.max(200,innerHeight-AD-ST);cv.width=W*d;cv.height=H*d;if(cv.style){cv.style.top=ST+'px';cv.style.height=H+'px'}x.setTransform(d,0,0,d,0,0)}
if(!x.roundRect)x.roundRect=function(a,b,c,e){this.rect(a,b,c,e)};
rs();addEventListener('resize',()=>{rs();try{pl.x=Math.min(pl.x,W);pl.y=Math.min(pl.y,H)}catch(e){}});
