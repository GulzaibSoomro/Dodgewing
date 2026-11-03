// Single Play campaign. Legacy save.mode is kept as historical data, never consulted.
const RULES={sp:250,m30:16,v0:.55,v1:.93,turn0:.7,turn1:1,chase:6,s0:2.8,s1:.55,drop:2,prot:1.5,mult:2};
const M=()=>RULES;
const difficulty=L=>Math.max(0,Math.min(1,(L-1)/(LEVEL_COUNT-1)));
const phone=()=>Math.min(W,H)<600;
const cap=L=>{const b=Math.round(2+(M().m30-2)*difficulty(L));return phone()?Math.max(2,Math.round(b*.5)):b};
let lv=1,prevLv=1,upT=0,fadeT=0,banT=0,trailC='255,243,224',evoStars=0,inv=0,dnT=0,peakLv=1,banTx='',banC='#ffe066';
