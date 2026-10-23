(()=>{
const KEY='ppsDailyPracticeV1',TARGET=300000;
let activeSince=null,continueFn=null,overlay=null,lifeTimers=[];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function load(){let s={date:today(),ms:0,farewellShown:false};try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.date===today())s=x}catch(e){}return s}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function addElapsed(){if(activeSince===null)return;const s=load();s.ms+=Math.max(0,Date.now()-activeSince);activeSince=null;save(s)}
function start(){if(document.hidden||activeSince!==null)return;activeSince=Date.now()}
function pause(){addElapsed()}
function due(){const s=load();return s.ms>=TARGET&&!s.farewellShown}
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function flower(kind,cls,delay,x,y,scale=1,flip=1){
 const palettes={
  wist:['#eadcff','#c8a8ed','#9b72cf','#7652ad','#f4eaff'],
  blush:['#fff0ef','#f3c2c8','#d990a2','#fff7f1','#b96f86'],
  ivory:['#fffdf1','#f3e7c8','#e2c88f','#fffaf0','#c9a95d'],
  blue:['#edf2ff','#b9c9ef','#8da8dc','#dce6ff','#7189be']
 },p=palettes[kind]||palettes.wist;
 const petals=kind==='wist'?8:10;
 let shapes='';
 if(kind==='wist'){
  for(let i=0;i<petals;i++){const row=Math.floor(i/2),side=i%2?1:-1,cx=50+side*(9+row*2),cy=18+row*15,rx=13-row*.7,ry=16-row*.7;shapes+=`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${p[i%4]}" transform="rotate(${side*18} ${cx} ${cy})"/>`}
  shapes+='<path d="M50 3 C47 28 53 55 49 96" stroke="#71865b" stroke-width="2.2" fill="none"/><circle cx="49" cy="91" r="6" fill="'+p[4]+'"/>';
 }else{
  for(let i=0;i<petals;i++){const a=i*360/petals,rad=i%2?22:28,cx=50+Math.cos(a*Math.PI/180)*rad,cy=50+Math.sin(a*Math.PI/180)*rad,rot=a+90;shapes+=`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="17" ry="28" fill="${p[i%4]}" transform="rotate(${rot} ${cx} ${cy})"/>`}
  shapes+='<circle cx="50" cy="50" r="15" fill="'+p[4]+'"/><circle cx="50" cy="50" r="7" fill="#e8c56f"/>';
 }
 return `<svg class="pps-botanical pps-${kind} ${cls}" style="--d:${delay}s;--x:${x}%;--y:${y}%;--s:${scale};--f:${flip}" viewBox="0 0 100 100" aria-hidden="true">${shapes}</svg>`;
}
function vine(cls,path,delay){
 return `<svg class="pps-vine ${cls}" style="--d:${delay}s" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true"><path class="vine-stem" pathLength="1" d="${path}"/><path class="vine-glow" pathLength="1" d="${path}"/></svg>`;
}
function clearLife(){lifeTimers.forEach(clearTimeout);lifeTimers=[]}
function schedule(fn,min,max){if(reduced())return;const t=setTimeout(()=>{fn();schedule(fn,min,max)},min+Math.random()*(max-min));lifeTimers.push(t)}
function releasePetal(){
 if(!overlay||!overlay.classList.contains('show'))return;
 const el=document.createElement('i');el.className='pps-drift-petal';el.style.setProperty('--sx',(Math.random()*100)+'vw');el.style.setProperty('--dx',(-90+Math.random()*180)+'px');el.style.setProperty('--dur',(7+Math.random()*7)+'s');el.style.setProperty('--rot',(180+Math.random()*540)+'deg');el.style.background=['#efd2df','#e6d7f5','#fff2df','#c9d5f0'][Math.floor(Math.random()*4)];overlay.querySelector('.pps-particles').appendChild(el);el.addEventListener('animationend',()=>el.remove());
}
function releaseButterfly(){
 if(!overlay||!overlay.classList.contains('show'))return;
 const el=document.createElement('span');el.className='pps-live-butterfly';const left=Math.random()<.5;el.style.setProperty('--start',left?'-8vw':'108vw');el.style.setProperty('--end',left?'108vw':'-8vw');el.style.setProperty('--fy',(18+Math.random()*62)+'vh');el.style.setProperty('--lift',(-70+Math.random()*140)+'px');el.style.setProperty('--dur',(10+Math.random()*8)+'s');if(!left)el.classList.add('reverse');el.innerHTML='<i></i><b></b>';overlay.querySelector('.pps-particles').appendChild(el);el.addEventListener('animationend',()=>el.remove());
}
function occasionalBloom(){
 if(!overlay||!overlay.classList.contains('show'))return;
 const candidates=overlay.querySelectorAll('.pps-botanical');if(!candidates.length)return;const el=candidates[Math.floor(Math.random()*candidates.length)];el.classList.remove('pps-pulse');void el.offsetWidth;el.classList.add('pps-pulse');
}
function startLife(){clearLife();if(reduced())return;schedule(releasePetal,1800,4200);schedule(releaseButterfly,9000,17000);schedule(occasionalBloom,5500,11000)}
function build(){
 if(overlay)return;
 const style=document.createElement('style');style.textContent=`
 #pps-bloom-farewell{--champagne:#f7e7ce;--glass:rgba(25,15,35,.45);position:fixed;inset:0;z-index:2147483000;display:none;overflow:hidden;background:#050706;color:var(--champagne);font-family:'Playfair Display',Georgia,serif;font-style:italic}
 #pps-bloom-farewell.show{display:block}.pps-orchard-bg{position:absolute;inset:0;background:url('wisteria_path.jpg') center/cover no-repeat;transform:scale(1.015);opacity:0;animation:ppsGardenIn 1.4s ease forwards}
 .pps-orchard-shade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,rgba(23,12,31,.02) 0 31%,rgba(16,9,21,.12) 66%,rgba(9,5,12,.2));z-index:1}
 .pps-botanical-layer,.pps-particles,.pps-light-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}.pps-rear{z-index:2}.pps-major{z-index:3}.pps-foreground{z-index:6}.pps-particles{z-index:7}.pps-light-layer{z-index:3}
 .pps-vine{position:absolute;inset:-2%;width:104%;height:104%;overflow:visible}.vine-stem{fill:none;stroke:#557348;stroke-width:8;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;filter:drop-shadow(0 2px 2px rgba(12,20,8,.25));animation:ppsGrow 2.3s cubic-bezier(.22,.7,.18,1) var(--d) forwards}.vine-glow{fill:none;stroke:rgba(255,225,153,.8);stroke-width:2.4;stroke-linecap:round;stroke-dasharray:.08 .92;stroke-dashoffset:1;opacity:0;animation:ppsGlowTravel 5.8s ease-in-out calc(var(--d) + 3.8s) infinite}
 .pps-botanical{position:absolute;left:var(--x);top:var(--y);width:clamp(70px,8vw,150px);height:auto;overflow:visible;opacity:0;transform-origin:50% 8%;filter:drop-shadow(0 8px 8px rgba(28,14,34,.2));transform:translate(-50%,-10%) scale(.16) scaleX(var(--f)) rotate(-4deg);animation:ppsBloom 2.25s cubic-bezier(.16,.8,.24,1) var(--d) forwards,ppsLivingSway var(--sway,8s) ease-in-out calc(var(--d) + 2.3s) infinite alternate}
 .pps-wist{height:clamp(120px,14vw,240px);width:clamp(68px,7vw,130px)}.pps-blush,.pps-ivory,.pps-blue{width:clamp(78px,9vw,170px)}
 .pps-rear .pps-botanical{filter:drop-shadow(0 6px 8px rgba(28,14,34,.16));opacity:.92}.pps-foreground .pps-botanical{width:clamp(95px,11vw,210px);filter:drop-shadow(0 10px 14px rgba(22,10,28,.28))}
 .pps-pulse{animation:ppsSoftPulse 2.4s ease-in-out!important;opacity:1!important}
 .pps-farewell-arch{position:absolute;z-index:5;bottom:0;left:50%;transform:translateX(-50%);width:min(48vw,980px);max-width:980px;height:min(88vh,900px);border-radius:46% 46% 0 0/20% 20% 0 0;border:2px solid rgba(247,231,206,.8);border-bottom:none;background:var(--glass);backdrop-filter:blur(25px);-webkit-backdrop-filter:blur(25px);display:flex;align-items:center;justify-content:center;padding:8% 9% 5%;text-align:center;box-shadow:0 -8px 40px rgba(18,8,25,.12)}
 .pps-farewell-copy{width:min(72%,620px);opacity:0;transform:translateY(12px);animation:ppsCopy 1.1s ease 2.6s forwards;text-shadow:0 1px 2px rgba(20,12,25,.3)}.pps-farewell-copy .eyebrow{font-size:.82rem;letter-spacing:4px;text-transform:uppercase;font-weight:500;margin-bottom:18px}.pps-farewell-copy h2{font-size:clamp(2rem,3.2vw,3.15rem);line-height:1.12;margin:0 0 24px;font-weight:700}.pps-farewell-copy p{font-size:clamp(1rem,1.35vw,1.25rem);line-height:1.62;margin:0 auto 30px;font-weight:500}.pps-farewell-copy strong{font-weight:700}
 .pps-actions{display:flex;flex-direction:column;gap:13px;align-items:center}.pps-actions button{width:min(100%,410px);min-height:52px;padding:13px 25px;border-radius:40px;border:1px solid rgba(247,231,206,.58);background:rgba(247,231,206,.055);color:var(--champagne);font:italic 600 1rem 'Playfair Display',Georgia,serif;cursor:pointer;text-shadow:0 1px 2px rgba(20,12,25,.28);transition:.35s ease}.pps-actions button:hover{border-color:var(--champagne);background:rgba(247,231,206,.12);box-shadow:0 0 16px rgba(247,231,206,.18)}
 .pps-drift-petal{position:absolute;left:var(--sx);top:-5vh;width:13px;height:9px;border-radius:80% 20% 75% 25%;opacity:.9;filter:drop-shadow(0 2px 2px rgba(30,15,30,.15));animation:ppsPetalFall var(--dur) linear forwards}
 .pps-live-butterfly{position:absolute;left:var(--start);top:var(--fy);width:34px;height:22px;animation:ppsButterflyPath var(--dur) cubic-bezier(.3,.05,.7,.95) forwards}.pps-live-butterfly.reverse{transform:scaleX(-1)}.pps-live-butterfly i,.pps-live-butterfly b{position:absolute;top:2px;width:18px;height:20px;background:linear-gradient(135deg,#f4c56c,#9c6db4 65%,#6e4a83);border:1px solid rgba(72,45,70,.45);border-radius:85% 20% 70% 28%;transform-origin:100% 55%;animation:ppsWing .34s ease-in-out infinite alternate}.pps-live-butterfly i{left:0}.pps-live-butterfly b{right:0;transform:scaleX(-1);transform-origin:0 55%}
 @keyframes ppsGardenIn{to{opacity:1;transform:scale(1)}}@keyframes ppsGrow{to{stroke-dashoffset:0}}@keyframes ppsGlowTravel{0%,18%,100%{opacity:0;stroke-dashoffset:1}35%{opacity:.85}70%{opacity:.12;stroke-dashoffset:-.2}}
 @keyframes ppsBloom{0%{opacity:0;transform:translate(-50%,-10%) scale(.16) scaleX(var(--f)) rotate(-6deg)}58%{opacity:1;transform:translate(-50%,0) scale(calc(var(--s)*1.07)) scaleX(var(--f)) rotate(1deg)}100%{opacity:1;transform:translate(-50%,0) scale(var(--s)) scaleX(var(--f)) rotate(0)}}@keyframes ppsLivingSway{from{margin-left:-3px;rotate:-1.2deg}to{margin-left:4px;rotate:1.5deg}}@keyframes ppsSoftPulse{0%,100%{scale:1}45%{scale:1.035}70%{scale:.995}}
 @keyframes ppsPetalFall{0%{transform:translate3d(0,-5vh,0) rotate(0);opacity:0}8%{opacity:.85}55%{transform:translate3d(var(--dx),55vh,0) rotate(calc(var(--rot)*.55))}100%{transform:translate3d(calc(var(--dx)*.45),110vh,0) rotate(var(--rot));opacity:0}}@keyframes ppsButterflyPath{0%{left:var(--start);opacity:0;translate:0 0}8%{opacity:.9}35%{translate:0 var(--lift)}72%{translate:0 calc(var(--lift)*-.35);opacity:.9}100%{left:var(--end);translate:0 20px;opacity:0}}@keyframes ppsWing{to{transform:scaleX(.22) rotate(8deg)}}@keyframes ppsCopy{to{opacity:1;transform:none}}
 @media(max-width:899px){.pps-farewell-arch{width:min(88vw,680px);height:min(86vh,780px);padding:12% 8% 5%}.pps-farewell-copy{width:82%}.pps-botanical{width:clamp(58px,13vw,110px)}.pps-wist{height:clamp(100px,22vw,180px)}}
 @media(max-width:480px){.pps-orchard-bg{background-image:url('wisteria_mobile.jpeg')}.pps-farewell-arch{width:min(88vw,680px);height:min(86vh,780px);border-radius:46% 46% 0 0/16% 16% 0 0;padding:18% 7% 5%}.pps-farewell-copy{width:90%}.pps-farewell-copy .eyebrow{font-size:.68rem}.pps-farewell-copy h2{font-size:1.85rem}.pps-farewell-copy p{font-size:.93rem;line-height:1.5}.pps-actions button{min-height:48px}.mobile-hide{display:none}}
 @media(prefers-reduced-motion:reduce){.pps-orchard-bg,.pps-vine path,.pps-botanical,.pps-farewell-copy{animation:none!important;opacity:1!important}.vine-stem{stroke-dashoffset:0!important}.vine-glow,.pps-particles{display:none!important}.pps-botanical{transform:translate(-50%,0) scale(var(--s)) scaleX(var(--f))!important}}
 `;document.head.appendChild(style);
 overlay=document.createElement('div');overlay.id='pps-bloom-farewell';
 const rear=[
  flower('wist','',.7,5,-2,1.2),flower('wist','',1.0,14,1,.95,-1),flower('wist','',1.35,24,-4,1.15),flower('wist','',.9,76,-3,1.1,-1),flower('wist','',1.2,87,2,.95),flower('wist','',1.55,96,-2,1.25,-1),
  flower('wist','mobile-hide',1.75,33,-7,.9),flower('wist','mobile-hide',1.65,67,-7,.9,-1)
 ].join('');
 const major=[
  flower('wist','',2.0,8,20,1.1),flower('wist','',2.25,92,22,1.1,-1),flower('wist','',2.5,18,38,.9,-1),flower('wist','',2.75,82,40,.9),
  flower('blush','',3.6,7,52,.95),flower('ivory','',3.85,16,67,.78),flower('blue','',4.1,91,55,.9),flower('blush','',4.35,84,70,.8),
  flower('ivory','mobile-hide',4.6,27,8,.72),flower('blue','mobile-hide',4.85,72,10,.72)
 ].join('');
 const front=[
  flower('blush','',4.2,2,78,1.0),flower('blue','',4.55,10,88,.95),flower('ivory','',4.8,96,80,1.0),flower('blush','',5.05,89,91,.95),
  flower('wist','mobile-hide',3.1,3,35,1.25),flower('wist','mobile-hide',3.35,97,38,1.25,-1)
 ].join('');
 overlay.innerHTML='<div class="pps-orchard-bg"></div><div class="pps-orchard-shade"></div><div class="pps-botanical-layer pps-rear">'+vine('','M-20 110 C170 40 270 145 390 82 S650 25 1020 105',.25)+rear+'</div><div class="pps-botanical-layer pps-major">'+vine('','M30 620 C120 420 75 300 220 210 S360 115 470 70',.7)+vine('','M970 620 C875 430 925 310 785 220 S650 120 535 72',.9)+major+'</div><div class="pps-light-layer"></div><section class="pps-farewell-arch" role="dialog" aria-modal="true" aria-labelledby="pps-farewell-title"><div class="pps-farewell-copy"><div class="eyebrow">Neural Orchard</div><h2 id="pps-farewell-title">You showed up for yourself today.</h2><p>Five focused minutes of Prefrontal Pilates —<br><strong>your cognitive core is stronger for it.</strong><br><br>Keep tending to your Neural Orchard.<br><strong>The rest of the day is yours.</strong></p><div class="pps-actions"><button id="pps-return">Return to Neural Orchard</button><button id="pps-stay">Stay a little longer</button></div></div></section><div class="pps-botanical-layer pps-foreground">'+front+'</div><div class="pps-particles"></div>';
 document.body.appendChild(overlay);
 overlay.querySelector('#pps-return').addEventListener('click',()=>{clearLife();location.href='index.html'});
 overlay.querySelector('#pps-stay').addEventListener('click',()=>{clearLife();overlay.classList.remove('show');const fn=continueFn;continueFn=null;if(fn)fn()});
}
function show(onContinue){pause();const s=load();s.farewellShown=true;save(s);continueFn=onContinue||null;build();overlay.classList.remove('show');void overlay.offsetWidth;overlay.classList.add('show');setTimeout(startLife,6200)}
function naturalStop(onContinue){pause();if(due()){show(onContinue);return true}return false}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
window.addEventListener('pagehide',pause);
window.PPSDaily={start,pause,due,naturalStop,show,getState:load};
})();