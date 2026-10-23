(()=>{
const KEY='ppsDailyPracticeV1',TARGET=300000;
let activeSince=null,continueFn=null,overlay=null;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function load(){let s={date:today(),ms:0,farewellShown:false};try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.date===today())s=x}catch(e){}return s}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function addElapsed(){if(activeSince===null)return;const s=load();s.ms+=Math.max(0,Date.now()-activeSince);activeSince=null;save(s)}
function start(){if(document.hidden||activeSince!==null)return;activeSince=Date.now()}
function pause(){addElapsed()}
function due(){const s=load();return s.ms>=TARGET&&!s.farewellShown}
function build(){
 if(overlay)return;
 const style=document.createElement('style');style.textContent=`
 #pps-bloom-farewell{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(rgba(36,18,48,.42),rgba(28,15,38,.62)),url('wisteria_path.jpg') center/cover no-repeat;color:#fff4df;font-family:Georgia,'Times New Roman',serif}
 #pps-bloom-farewell.show{display:flex}.pps-bloom-dim{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,rgba(116,73,137,.08),rgba(20,10,29,.48))}
 .pps-vine{position:absolute;top:-8%;width:15%;height:58%;transform-origin:top center;opacity:0;filter:drop-shadow(0 8px 10px rgba(25,10,35,.28));animation:ppsGrow 2.4s cubic-bezier(.2,.8,.25,1) forwards}
 .pps-vine:before,.pps-vine:after{content:'✦  ✿  ❀  ✦  ❀  ✿  ✦';position:absolute;inset:0;color:#caa6dd;font-size:clamp(20px,3vw,48px);line-height:1.42;letter-spacing:8px;text-shadow:0 0 14px rgba(239,214,255,.5);writing-mode:vertical-rl}
 .pps-vine:after{left:35%;top:9%;color:#e0c2e9;transform:scale(.82)}
 .v1{left:3%;animation-delay:.15s}.v2{left:17%;height:46%;animation-delay:.5s}.v3{right:18%;height:49%;animation-delay:.35s}.v4{right:3%;height:61%;animation-delay:.7s}
 .pps-butterfly{position:absolute;font-family:Arial,sans-serif;font-size:clamp(20px,2.4vw,34px);opacity:0;animation:ppsFly 7s ease-in-out forwards}.b1{left:8%;top:62%;animation-delay:1s}.b2{right:12%;top:30%;animation-delay:1.8s}.b3{left:72%;top:72%;animation-delay:2.5s}
 .pps-farewell-card{position:relative;z-index:3;width:min(82vw,650px);padding:42px 44px;text-align:center;border:1px solid rgba(255,238,211,.52);border-radius:34px;background:rgba(48,27,61,.66);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 18px 60px rgba(15,8,22,.32);opacity:0;transform:translateY(12px);animation:ppsCard 1.3s ease 2.1s forwards}
 .pps-farewell-card .eyebrow{font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.82;margin-bottom:14px}.pps-farewell-card h2{font-size:clamp(27px,4vw,42px);font-weight:500;margin:0 0 20px}.pps-farewell-card p{font-family:Arial,sans-serif;font-size:clamp(15px,1.7vw,19px);line-height:1.65;margin:0 auto 26px;max-width:540px;color:rgba(255,247,232,.94)}.pps-farewell-card strong{font-weight:600;color:#fff4df}
 .pps-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}.pps-actions button{min-height:46px;padding:11px 22px;border-radius:28px;border:1px solid rgba(255,239,213,.62);background:rgba(255,247,232,.08);color:#fff4df;font:500 14px Arial,sans-serif;cursor:pointer}.pps-actions button:hover{background:rgba(255,247,232,.16)}
 @keyframes ppsGrow{0%{opacity:0;transform:scaleY(.08)}55%{opacity:1}100%{opacity:.96;transform:scaleY(1)}}@keyframes ppsCard{to{opacity:1;transform:none}}@keyframes ppsFly{0%{opacity:0;transform:translate(0,20px) rotate(-8deg)}15%{opacity:.85}50%{transform:translate(42px,-38px) rotate(8deg)}85%{opacity:.75}100%{opacity:0;transform:translate(92px,-75px) rotate(-4deg)}}
 @media(max-width:600px){.pps-farewell-card{width:86vw;padding:30px 22px}.pps-vine{width:22%}.pps-actions{flex-direction:column}.pps-actions button{width:100%}}
 @media(prefers-reduced-motion:reduce){.pps-vine,.pps-butterfly,.pps-farewell-card{animation:none!important;opacity:1!important;transform:none!important}.pps-butterfly{display:none}}
 `;document.head.appendChild(style);
 overlay=document.createElement('div');overlay.id='pps-bloom-farewell';overlay.innerHTML='<div class="pps-bloom-dim"></div><div class="pps-vine v1"></div><div class="pps-vine v2"></div><div class="pps-vine v3"></div><div class="pps-vine v4"></div><div class="pps-butterfly b1">🦋</div><div class="pps-butterfly b2">🦋</div><div class="pps-butterfly b3">🦋</div><section class="pps-farewell-card" role="dialog" aria-modal="true" aria-labelledby="pps-farewell-title"><div class="eyebrow">Neural Orchard</div><h2 id="pps-farewell-title">You showed up for yourself today.</h2><p>Five focused minutes of Prefrontal Pilates — <strong>your cognitive core is stronger for it.</strong><br><br>Keep tending to your Neural Orchard.<br><strong>The rest of the day is yours.</strong></p><div class="pps-actions"><button id="pps-return">Return to Neural Orchard</button><button id="pps-stay">Stay a little longer</button></div></section>';
 document.body.appendChild(overlay);
 overlay.querySelector('#pps-return').addEventListener('click',()=>{location.href='index.html'});
 overlay.querySelector('#pps-stay').addEventListener('click',()=>{overlay.classList.remove('show');const fn=continueFn;continueFn=null;if(fn)fn()});
}
function show(onContinue){pause();const s=load();s.farewellShown=true;save(s);continueFn=onContinue||null;build();overlay.classList.add('show')}
function naturalStop(onContinue){pause();if(due()){show(onContinue);return true}return false}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
window.addEventListener('pagehide',pause);
window.PPSDaily={start,pause,due,naturalStop,show,getState:load};
})();