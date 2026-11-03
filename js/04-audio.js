// 04-audio.js: Sound effects (WebAudio, no files)
// Classic script (no modules): all files share one global scope and load in numeric order.
let AC=null;
function initAudio(){try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,ty,v,f2){if(!AC||save.snd===false)return;try{const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;o.type=ty;o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start(n);o.stop(n+d)}catch(e){}}
function snd(k){if(k==='star')tone(880,.12,'sine',.15,1320);else if(k==='pu')tone(400,.3,'triangle',.18,900);else if(k==='hit')tone(300,.25,'square',.12,120);else if(k==='boom')tone(160,.6,'sawtooth',.25,30);else if(k==='dn')tone(240,.3,'sawtooth',.2,70);else if(k==='boss')tone(110,.7,'sawtooth',.25,90);else if(k==='nm')tone(1200,.08,'sine',.1,1600);else if(k==='fl')tone(700,.35,'sawtooth',.1,200);else if(k==='up'){tone(520,.15,'triangle',.18,780);setTimeout(()=>tone(780,.25,'triangle',.18,1170),130)}}
function toggleSnd(){save.snd=(save.snd===false);store();$('sn').classList.toggle('off',save.snd===false);initAudio()}
