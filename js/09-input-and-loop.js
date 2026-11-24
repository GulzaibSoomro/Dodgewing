// 09-input-and-loop.js: Pointer/keyboard input, visibility pause, main loop, startup
// Classic script (no modules): all files share one global scope and load in numeric order.
let last=performance.now();
let renderFailures=0,renderBlocked=false,canvasLost=false,lastScene='';
function loop(n){
  try{
    if(!Number.isFinite(n))n=performance.now();
    if(document.hidden||renderBlocked||canvasLost){last=n;return}
    // A paused scene is frozen; redraw at a bounded rate for resize/recovery.
    const interval=S==='menu'?(reducedMotion()?250:100):S==='paused'?100:SAFE_FRAME_MS;
    if(S===lastScene&&interval&&n-last<interval)return;
    const elapsed=Math.max(0,(n-last)/1000),d=Math.min(S==='menu'?.25:.05,elapsed);last=n;lastScene=S;
    const metrics=DWDiagnostics.metricsEnabled(),metricsStart=metrics?performance.now():0;
    upd(d,elapsed);const updateMs=metrics?performance.now()-metricsStart:0;draw();renderFailures=0;
    if(metrics)try{DWDiagnostics.recordFrame(n,updateMs,pt.length,ms.length,S,save.gfx)}catch(_){}
  }catch(error){
    DWDiagnostics.report('frame',error);renderFailures++;
    try{pauseG();cv.width=cv.width;rs()}catch(recoveryError){DWDiagnostics.report('recovery',recoveryError)}
    if(renderFailures>=3){renderBlocked=true;DWDiagnostics.fatal('Rendering failed repeatedly. Please reload the game.')}
  }finally{requestAnimationFrame(loop)}
}
if(cv.addEventListener){
  cv.addEventListener('contextlost',e=>{e.preventDefault();canvasLost=true;pauseG();DWDiagnostics.report('canvas','context lost');DWDiagnostics.fatal('The graphics surface was interrupted.')});
  cv.addEventListener('contextrestored',()=>{canvasLost=false;rs();DWDiagnostics.report('canvas','context restored');const p=$('render-recovery');if(p&&!renderBlocked)p.remove()});
}
joyInit();
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){keys={};pauseG()}else rs()});
addEventListener('keydown',e=>{if(e.key==='p'||e.key==='Escape'){if(!e.repeat){if(S==='play')pauseG();else if(S==='paused')resume()}return}if(S!=='play')return;keys[e.key]=true;if(e.key===' '){e.preventDefault&&e.preventDefault();useAbility()}});addEventListener('keyup',e=>{keys[e.key]=false});
if(document.fonts&&document.fonts.load)document.fonts.load(canvasFont(16)).then(()=>{if(S==='menu')layoutShow()},()=>{});
addEventListener('resize',()=>{if(S==='menu')layoutShow()});
menu();
// The staged WebView loads renderer extensions from later classic scripts.
function startFrameLoop(){last=performance.now();requestAnimationFrame(loop)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startFrameLoop,{once:true});
else startFrameLoop();
