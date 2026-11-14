/* Neural Orchard MVP 1.1 — local-only onboarding and progress overlays. */
(function(){
'use strict';
const P=window.NeuralOrchardPreferences,N=window.NeuralOrchardProgress;
if(!P||!N)return;
const css=`
.no-personalized-greeting{white-space:normal!important;overflow-wrap:anywhere;text-transform:none!important;letter-spacing:1px!important;line-height:1.25!important;font-size:clamp(.8rem,2vw,1rem)!important}
.no-tools{position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:50000;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;max-width:90vw}
.no-tools[hidden]{display:none!important}
.no-tools button,.no-modal button{font-family:'Playfair Display',Georgia,serif;font-style:italic;background:rgba(29,18,43,.85);color:#f7e7ce;border:1px solid rgba(247,231,206,.8);border-radius:24px;min-height:44px;padding:9px 15px;cursor:pointer}
.no-tools button:focus-visible,.no-modal button:focus-visible,.no-modal input:focus-visible{outline:2px solid #fff;outline-offset:3px}
.no-modal-wrap{position:fixed;inset:0;z-index:90000;background:rgba(12,8,20,.77);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}
.no-modal-wrap[hidden]{display:none!important}
.no-modal{position:relative;overflow-y:auto;overscroll-behavior:contain;max-height:min(93dvh,960px);width:min(92vw,630px);box-sizing:border-box;border-radius:46% 46% 20px 20px/13% 13% 20px 20px;border:2px solid rgba(247,231,206,.8);padding:clamp(48px,9vh,82px) clamp(18px,4vw,38px) 30px;background:linear-gradient(rgba(30,17,45,.91),rgba(27,15,40,.96));box-shadow:0 15px 60px #0a0615;text-align:center;color:#f7e7ce;font-family:'Playfair Display',Georgia,serif;font-style:italic}
.no-modal h2{font-size:clamp(1.45rem,3.2vw,2rem);margin:7px 0 18px;color:#f7e7ce}
.no-modal h3{font-size:1.1rem;margin:18px 0 8px}
.no-modal p{font-size:.95rem;line-height:1.5}
.no-modal input[type=text]{width:100%;max-width:380px;box-sizing:border-box;background:rgba(12,7,24,.7);color:#fff4de;border:1px solid #bda7c9;border-radius:12px;padding:13px;font:inherit;font-size:1rem}
.no-modal label.no-check{display:flex;gap:10px;align-items:flex-start;text-align:left;font-size:.88rem;line-height:1.5;margin:13px auto;max-width:460px}
.no-modal input[type=checkbox]{width:20px;height:20px;flex:0 0 auto;accent-color:#9c79bf}
.no-modal-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:20px auto}
.no-modal .no-muted{opacity:.82;font-size:.85rem}
.no-modal table{width:100%;border-collapse:collapse;text-align:left;font-size:.91rem}
.no-modal td,.no-modal th{padding:9px 5px;border-bottom:1px solid rgba(247,231,206,.28)}
.no-modal .no-panel{margin:14px auto;padding:12px;border:1px solid rgba(247,231,206,.32);border-radius:12px;text-align:left}
@media(max-width:480px){.no-tools{top:auto;bottom:max(8px,env(safe-area-inset-bottom));left:8px;right:8px;justify-content:center}.no-tools button{font-size:.77rem;padding:8px 11px}.no-modal{max-height:94dvh;padding:44px 14px 20px}.no-modal h2{font-size:1.35rem}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
const tools=document.createElement('nav');tools.className='no-tools';tools.setAttribute('aria-label','Personal progress and privacy');
const progressBtn=document.createElement('button');progressBtn.textContent='My Progress';
const privacyBtn=document.createElement('button');privacyBtn.textContent='Privacy & Nickname';
tools.append(progressBtn,privacyBtn);document.body.appendChild(tools);
function updateToolbar(){
 const welcome=document.getElementById('welcome-text');
 tools.hidden=document.body.classList.contains('show-studio-grid')||!!(welcome&&welcome.style.display==='none');
}
const welcome=document.getElementById('welcome-text');
if(welcome)new MutationObserver(updateToolbar).observe(welcome,{attributes:true,attributeFilter:['style']});
new MutationObserver(updateToolbar).observe(document.body,{attributes:true,attributeFilter:['class']});
updateToolbar();
const wrap=document.createElement('div');wrap.className='no-modal-wrap';wrap.hidden=true;
const panel=document.createElement('section');panel.className='no-modal';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Neural Orchard personal settings and progress');wrap.appendChild(panel);document.body.appendChild(wrap);
let previousFocus=null;
const firstVisit=!P.profile().onboardingSeen;
const elt=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const btn=(text,fn)=>{const e=elt('button',text);e.type='button';e.addEventListener('click',fn);return e};
function open(){previousFocus=document.activeElement;wrap.hidden=false;panel.scrollTop=0;panel.tabIndex=-1;panel.focus()}
function close(){wrap.hidden=true;panel.replaceChildren();if(previousFocus&&previousFocus.focus)previousFocus.focus()}
function actions(...children){const d=elt('div',undefined,'no-modal-actions');d.append(...children);return d}
function greeting(){
 const w=document.getElementById('welcome-text');if(!w)return;
 const nick=P.profile().nickname;
 w.textContent=firstVisit?(nick?'Welcome, '+nick+'.':'WELCOME TO'):(nick?'Welcome back, '+nick+'.':'Welcome back.');
 w.classList.toggle('no-personalized-greeting',!!nick);
}
function notice(){const p=elt('p','Your practice history stays in this browser. Optional aggregate gameplay analytics are off by default. No data will be transmitted during this development phase. After a separately approved launch, sharing would require your choice and would not use a persistent participant ID. You can stop future sharing, but past aggregate counts generally cannot be individually removed. Clearing your browser data can erase local history.','no-muted');return p}
function check(initial){const label=elt('label',undefined,'no-check'),input=document.createElement('input');input.type='checkbox';input.checked=!!initial;label.append(input,document.createTextNode('Optional: allow future aggregate gameplay statistics after backend activation. Declining does not affect the games.'));return {label,input}}
function nicknameField(value){
 const input=document.createElement('input');input.type='text';input.maxLength=80;input.autocomplete='off';input.value=value||'';input.placeholder='Preferred nickname (optional)';input.setAttribute('aria-label','Preferred nickname (optional)');return input
}
function onboarding(){
 panel.replaceChildren(elt('p','WELCOME TO','no-muted'),elt('h2','Neural Orchard'),elt('p','A celebration of becoming.'),elt('h3','What would you like us to call you?'));
 const name=nicknameField('');panel.append(name,elt('p','No email address, full name, or password required.','no-muted'),notice());
 const c=check(false);panel.append(c.label);
 const save=()=>{const ok=P.saveProfile(name.value)&&P.saveConsent(c.input.checked);if(ok){greeting();close()}else window.alert('This browser could not save your preferences. You can still enter Neural Orchard without saving a nickname.')};
 panel.append(actions(btn('Enter Neural Orchard',save),btn('Skip for now',()=>{P.saveProfile('');P.saveConsent(false);greeting();close()})));open();
}
function settings(){
 const pf=P.profile();panel.replaceChildren(elt('h2','Privacy & Nickname'),elt('p','What would you like us to call you?'));
 const name=nicknameField(pf.nickname),c=check(P.consent());panel.append(name,notice(),c.label);
 panel.append(actions(btn('Save preferences',()=>{if(P.saveProfile(name.value)&&P.saveConsent(c.input.checked)){greeting();close()}else window.alert('Unable to save your preferences in this browser.')}),btn('Cancel',close)));
 const wipe=elt('div',undefined,'no-panel');wipe.append(elt('h3','Clear local MVP 1.1 information'),elt('p','This removes your nickname, analytics preference and newly tracked practice history. Your existing Stargazer and Sentinel levels and the daily-practice key are preserved.'));
 wipe.append(btn('Clear MVP 1.1 data…',()=>{if(window.confirm('Clear your local nickname, consent choice and newly recorded history? Existing game levels will be kept.')){if(N.clearHistory()&&P.clearPersonal()){greeting();close()}else window.alert('Some local information could not be cleared. Please check browser storage permissions.')}}));
 panel.append(wipe);open();
}
const minutes=ms=>(Math.round((ms||0)/60000*10)/10).toFixed(1);
function savedLevel(key){try{const n=Number(localStorage.getItem(key));return Number.isInteger(n)&&n>0&&n<=5?String(n):'Not saved'}catch(_){return 'Unavailable'}}
function progress(){
 const d=N.load(),s=N.summary(),st=s.games.stargazer,se=s.games.sentinel;
 panel.replaceChildren(elt('h2','My Progress'),elt('p','Your practice history is recorded on this browser starting with MVP 1.1.','no-muted'));
 if(s.storageWarning)panel.append(elt('p','An unsupported or damaged local progress record was found. It has not been overwritten. Clear MVP 1.1 data through Privacy & Nickname to start fresh.','no-muted'));
 const t=document.createElement('table'),tbody=document.createElement('tbody');
 for(const row of [['','Stargazer','Sentinel'],['Saved level',savedLevel('stargazerLevel'),savedLevel('sentinelLevel')],['Newly tracked sessions',st.recordedSessions,se.recordedSessions],['Active practice minutes',minutes(st.activeMs),minutes(se.activeMs)],['Average active session minutes',minutes(st.averageSessionMs),minutes(se.averageSessionMs)],['Completed sessions',st.completed,se.completed],['Explicit exits',st.exited,se.exited],['Interrupted sessions',st.interrupted,se.interrupted]]){
 const tr=document.createElement('tr');row.forEach((cell,i)=>tr.appendChild(elt(i===0?'th':'td',String(cell))));tbody.appendChild(tr)}
 t.appendChild(tbody);panel.append(t,elt('p','Combined active practice: '+minutes(st.activeMs+se.activeMs)+' minutes.'));
 const recent=Object.keys(s.dailyTotals).sort().reverse().slice(0,14),box=elt('div',undefined,'no-panel');
 box.append(elt('h3','Recent practice dates'));
 if(!recent.length)box.append(elt('p','No new sessions recorded yet. Your previously saved game levels remain available.'));
 for(const day of recent){const v=s.dailyTotals[day];box.append(elt('p',day+': Stargazer '+minutes(v.stargazer)+' min · Sentinel '+minutes(v.sentinel)+' min'))}
 panel.append(box);
 const recentSessions=d.sessions.slice().sort((a,b)=>Date.parse(b.endTimeISO)-Date.parse(a.endTimeISO)).slice(0,8);
 const trends=elt('div',undefined,'no-panel');trends.append(elt('h3','Recent sessions and task trends'));
 if(!recentSessions.length)trends.append(elt('p','Accuracy and difficulty trends will appear once new practice sessions have been recorded.'));
 for(const x of recentSessions){
   const m=x.metrics||{},which=x.game==='stargazer'?'Stargazer':'Sentinel';
   let detail='';
   if(x.game==='stargazer'){
     const color=(m.stroop_correct||0)+(m.stroop_incorrect||0),recall=(m.recall_correct||0)+(m.recall_incorrect||0);
     detail=' · color choices '+(color?(m.stroop_correct||0)+'/'+color:'not recorded')+' · recall '+(recall?(m.recall_correct||0)+'/'+recall:'not recorded');
   }else detail=' · matches '+(m.matches_hit||0)+' · missed '+(m.matches_missed||0)+' · false alarms '+(m.false_alarms||0);
   const level=x.levelAtEnd==null?'unknown':x.levelAtStart+' → '+x.levelAtEnd;
   trends.append(elt('p',x.endTimeISO.slice(0,10)+' · '+which+' · level '+level+' · '+minutes(x.elapsedActiveMs)+' min · '+x.outcome+detail));
 }
 trends.append(elt('p','Task figures summarize responses recorded in this browser; they are not clinical cognitive measurements.','no-muted'));
 panel.append(trends);
 for(const [label,key] of [['Stargazer',st],['Sentinel',se]]){const m=key.metrics||{};const p=elt('div',undefined,'no-panel');p.append(elt('h3',label+' task observations'));
 if(label==='Stargazer'){p.append(elt('p','Color choices: '+(m.stroop_correct||0)+' correct, '+(m.stroop_incorrect||0)+' incorrect. Recall rounds: '+(m.recall_correct||0)+' correct, '+(m.recall_incorrect||0)+' incorrect.'))}
 else p.append(elt('p','Spatial matches: '+(m.matches_hit||0)+' detected; missed '+(m.matches_missed||0)+'; false alarms '+(m.false_alarms||0)+'.'));
 p.append(elt('p','Task counts reflect recorded gameplay only; they are not clinical cognitive scores.','no-muted'));panel.append(p)}
 panel.append(actions(btn('Privacy & Nickname',settings),btn('Return to Neural Orchard',close)));open();
}
progressBtn.addEventListener('click',progress);privacyBtn.addEventListener('click',settings);
wrap.addEventListener('click',e=>{if(e.target===wrap)close()});
wrap.addEventListener('keydown',e=>{
 if(e.key==='Escape'){close();return}
 if(e.key!=='Tab')return;
 const focusable=[...panel.querySelectorAll('button,input,select,textarea,a[href]')].filter(x=>!x.disabled&&x.offsetParent!==null);
 if(!focusable.length){e.preventDefault();panel.focus();return}
 const first=focusable[0],last=focusable[focusable.length-1];
 if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
greeting();
const param=new URLSearchParams(location.search);if(!P.profile().onboardingSeen&&!param.has('action'))onboarding();
})();