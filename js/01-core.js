// 01-core.js: Canvas, resize, helpers
// Classic script (no modules): all files share one global scope and load in numeric order.
const $=id=>document.getElementById(id),cv=$('c'),x=cv.getContext('2d',{alpha:false,desynchronized:false}),TAU=Math.PI*2;
if(!x)throw new Error('Canvas 2D context unavailable');
const GAME_FONTS={ui:'Inter,Arial,sans-serif',display:'Oxanium,sans-serif',score:'Oxanium,sans-serif'};
const canvasFont=(size,weight=600,role='ui')=>weight+' '+size+'px '+GAME_FONTS[role];
// Android WebViews with some GPU drivers can leave stale black texture tiles behind
// canvas text and sprites. Keep their canvas deliberately small and predictable.
const SAFE_RENDER=typeof navigator!=='undefined'&&/Android/i.test(navigator.userAgent||''),SAFE_FRAME_MS=SAFE_RENDER?25:0;
x.imageSmoothingEnabled=true;if('imageSmoothingQuality'in x)x.imageSmoothingQuality='medium';
let W,H,DPR=1;
const gameViewport=$('game-viewport');
// Native insets are consumed by the Activity outside its WebView. Browser/PWA
// safe areas are applied once by #game-viewport instead.
if(typeof window.DodgewingAds?.usesNativeInsets==='function'&&window.DodgewingAds.usesNativeInsets())document.documentElement.classList.add('native-insets');
function rs(){
  const oldW=W,oldH=H,d=DPR=Math.max(1,Math.min(Number(devicePixelRatio)||1,SAFE_RENDER?1:2));
  const vv=window.visualViewport,style=gameViewport&&gameViewport.style;
  const set=(key,value)=>{if(style&&style.setProperty&&style.getPropertyValue(key)!==value)style.setProperty(key,value)};
  // At scale 1, follow transient visual-viewport changes (e.g. browser bars).
  // Pinch zoom magnifies the existing logical game; it must not resize the world.
  const visual=vv&&Math.abs(vv.scale-1)<.01;
  set('--viewport-width',(visual?vv.width:innerWidth)+'px');set('--viewport-height',(visual?vv.height:innerHeight)+'px');
  set('--viewport-x',(visual?vv.offsetLeft:0)+'px');set('--viewport-y',(visual?vv.offsetTop:0)+'px');
  const rect=gameViewport&&gameViewport.getBoundingClientRect?gameViewport.getBoundingClientRect():null;
  W=Math.max(1,Math.floor(rect?rect.width:innerWidth));H=Math.max(1,Math.floor(rect?rect.height:innerHeight));
  set('--view-height',H+'px');
  const width=Math.round(W*d),height=Math.round(H*d);
  // Assigning unchanged dimensions also clears the bitmap and drawing state.
  if(cv.width!==width)cv.width=width;if(cv.height!==height)cv.height=height;
  if(cv.style){cv.style.width=W+'px';cv.style.height=H+'px'}
  x.imageSmoothingEnabled=true;if('imageSmoothingQuality'in x)x.imageSmoothingQuality=SAFE_RENDER?'low':'medium';x.setTransform(d,0,0,d,0,0);
  if(oldW&&oldH&&(oldW!==W||oldH!==H)){
    // Keep scene positions visible on rotation without restarting the run or
    // changing speeds, collision radii, timers, progression or saved data.
    try{
      for(const object of [pl,...st,...pu,...ms,...bl,...obs,...pt,...fx]){
        if(Number.isFinite(object.x))object.x*=W/oldW;
        if(Number.isFinite(object.y))object.y*=H/oldH;
        if(Number.isFinite(object.gap)){object.gap*=W/oldW;object.gw*=W/oldW}
      }
      if(B){if(Number.isFinite(B.x))B.x*=W/oldW;if(Number.isFinite(B.y))B.y*=H/oldH}
      joyRel();
    }catch(error){if(typeof DWDiagnostics!=='undefined')DWDiagnostics.report('resize',error)}
  }
}
function frame(){x.setTransform(DPR,0,0,DPR,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.setLineDash([]);x.lineCap='butt';x.lineJoin='miter';x.textAlign='left';x.textBaseline='alphabetic';x.shadowBlur=0;x.shadowOffsetX=0;x.shadowOffsetY=0}
if(!x.roundRect)x.roundRect=function(a,b,c,e){this.rect(a,b,c,e)};
let viewportResizePending=false;
function scheduleViewportResize(){if(viewportResizePending)return;viewportResizePending=true;requestAnimationFrame(()=>{viewportResizePending=false;rs()})}
rs();addEventListener('resize',scheduleViewportResize);
if(window.visualViewport){visualViewport.addEventListener('resize',scheduleViewportResize);visualViewport.addEventListener('scroll',scheduleViewportResize)}
if(typeof ResizeObserver!=='undefined'&&gameViewport)new ResizeObserver(scheduleViewportResize).observe(gameViewport);
