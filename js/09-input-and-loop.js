// 09-input-and-loop.js: Pointer/keyboard input, visibility pause, main loop, startup
// Classic script (no modules): all files share one global scope and load in numeric order.
let last=performance.now();
function loop(n){if(!Number.isFinite(n))n=performance.now();const d=Math.max(0,Math.min(.05,(n-last)/1000));last=n;upd(d);draw();requestAnimationFrame(loop)}
joyInit();
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseG()});
addEventListener('keydown',e=>{keys[e.key]=true;if(e.key==='p'||e.key==='Escape'){S==='play'?pauseG():resume()}if(e.key===' '){e.preventDefault&&e.preventDefault()}});addEventListener('keyup',e=>{keys[e.key]=false});
if(document.fonts&&document.fonts.load)document.fonts.load("16px Pixelta").then(()=>{if(S==='menu')layoutShow()},()=>{});
addEventListener('resize',()=>{if(S==='menu')layoutShow()});
menu();requestAnimationFrame(loop);
