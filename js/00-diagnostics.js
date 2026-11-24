// Local, bounded diagnostics; no saved progress, ad IDs or embedded assets.
(()=>{
  const events=[];
  function report(kind,error){
    const message=String(error&&error.message||error||'').replace(/data:[^\s"']+/g,'[asset]').slice(0,240);
    events.push({kind,message,time:Date.now()});if(events.length>40)events.shift();
    console.warn('[Dodgewing] '+kind+': '+message);
  }
  function fatal(message){
    try{if(typeof pauseG==='function')pauseG()}catch(_){/* Startup may not have game state yet. */}
    if(!document.createElement)return;
    let panel=document.getElementById('render-recovery');
    if(!panel){panel=document.createElement('div');panel.id='render-recovery';panel.setAttribute('role','alert');document.body.appendChild(panel)}
    panel.textContent=message+' Your saved progress is retained. ';
    const button=document.createElement('button');button.textContent='Reload game';button.onclick=()=>location.reload();panel.appendChild(button);
  }
  // Opt-in local diagnostics; no storage, network, identifiers or timers.
  let enabled=false,panel=null,lastFrame=0,lastPaint=0,lastState='',samples=[],spikes=0;
  function setMetricsEnabled(value){
    try{
      enabled=!!value;lastFrame=0;lastPaint=0;lastState='';samples=[];spikes=0;
      if(!enabled){if(panel)panel.remove();panel=null;return false}
      if(!document.createElement||!document.getElementById('game-viewport')){enabled=false;return false}
      if(!panel){panel=document.createElement('pre');panel.id='dev-metrics';panel.setAttribute('aria-label','Development performance metrics');document.getElementById('game-viewport').appendChild(panel)}
      return true;
    }catch(_){enabled=false;panel=null;return false}
  }
  function recordFrame(now,updateMs,particles,missiles,state,quality){
    if(!enabled)return;
    try{
      if(state!==lastState){lastFrame=0;lastPaint=0;samples=[];spikes=0;lastState=state}
      const spikeThreshold=state==='menu'?(typeof reducedMotion==='function'&&reducedMotion()?375:150):state==='paused'?150:50;
      if(lastFrame){const dt=now-lastFrame;if(dt>0&&dt<5000){samples.push(dt);if(samples.length>120)samples.shift();if(dt>spikeThreshold)spikes++}}
      lastFrame=now;if(!panel||now-lastPaint<1000)return;lastPaint=now;
      const sorted=samples.slice().sort((a,b)=>a-b),percentile=p=>sorted.length?sorted[Math.floor((sorted.length-1)*p)].toFixed(1):'—',avg=samples.length?samples.reduce((a,b)=>a+b,0)/samples.length:0;
      panel.textContent='DEV METRICS\nFPS: '+(avg?(1000/avg).toFixed(1):'—')+'\nFrame p95 / p99: '+percentile(.95)+' / '+percentile(.99)+' ms\nUpdate: '+updateMs.toFixed(1)+' ms\nParticles / missiles: '+particles+' / '+missiles+'\nGraphics: '+quality+'\nState: '+state+' · spikes: '+spikes+'\nRender events: '+events.filter(e=>e.kind==='canvas'||e.kind==='frame').length;
    }catch(_){setMetricsEnabled(false)}
  }
  window.DWDiagnostics={events,report,fatal,setMetricsEnabled,metricsEnabled:()=>enabled,recordFrame};
  addEventListener('error',e=>{report('uncaught',e.error||e.message);fatal('Dodgewing encountered an unexpected error.')});
  addEventListener('unhandledrejection',e=>{report('promise',e.reason);fatal('Dodgewing could not complete startup or an action.')});
})();
