/* Neural Orchard MVP 1.1 — optional feedback, network disabled by default.
 * Founder approval and secure email deployment are required before configuration.
 * No configuration is shipped with GitHub Pages. The deferred D1/dashboard
 * submission endpoint is NOT used by this form.
 */
(function(){
'use strict';
const questions=[
 ['How much did you enjoy this game?',['Loved it','Liked it','It was okay',"Didn't enjoy it"]],
 ['How did you find the level of challenge?',['Too easy','Just right','Too difficult','Some parts were confusing']],
 ['Would you like to play this game again?',['Yes','Maybe','No']]
];
const texts=[
 'What did you enjoy most about this game?',
 'What would make this game more interesting or enjoyable?',
 'Was anything confusing, frustrating, or difficult to use?'
];
const textKeys=['enjoyed_most','improvements','difficulties'],selectKeys=['enjoyment','challenge','replay'];
function gameName(){
 const n=location.pathname.toLowerCase();
 return n.endsWith('/stargaizer.html')?'stargazer':n.endsWith('/sentinel.html')?'sentinel':null;
}
function elt(tag,text){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x}
function attach(parent){
 // Friends-and-family game pilot: hide unfinished in-game feedback, preserve implementation.
 // External survey is distributed independently by the founder.
 const PILOT_FEEDBACK_DISABLED=true;
 if(PILOT_FEEDBACK_DISABLED)return;
 if(!parent||parent.querySelector('.no-feedback'))return;
 const game=gameName();if(!game)return;
 const shell=elt('section');shell.className='no-feedback';shell.style.cssText='width:100%;max-width:480px;margin:16px auto 22px;text-align:left;border:1px solid rgba(247,231,206,.6);border-radius:14px;padding:clamp(10px,3vw,18px);color:#f7e7ce;box-sizing:border-box;';
 const details=elt('details'),summary=elt('summary','Optional '+(game==='stargazer'?'Stargazer':'Sentinel')+' feedback');
 summary.style.cssText='cursor:pointer;min-height:44px;padding:10px;font-size:1rem';details.append(summary);
 const notice=elt('p','Your feedback is anonymous. We do not ask for your name or contact information or link your answers to your gameplay history. Please do not include identifying or sensitive personal details in your comments. Written comments could still identify you if you include personal details. If separately activated, feedback will be emailed to the Neural Orchard team. Mailbox and provider retention will be disclosed before activation. Feedback is optional, separate from gameplay analytics, and cannot be sent during this development preview.');
 notice.style.cssText='font-size:.86rem;line-height:1.45';details.append(notice);
 const form=document.createElement('form');form.autocomplete='off';form.style.cssText='display:flex;flex-direction:column;gap:13px';
 const radios=[];
 questions.forEach(([title,answers],i)=>{
  const field=elt('fieldset');field.style.cssText='min-width:0;border:1px solid rgba(247,231,206,.32);padding:10px;border-radius:10px';
  const legend=elt('legend',title);legend.style.cssText='font-size:.9rem;line-height:1.35';field.append(legend);
  let group=[];
  answers.forEach(answer=>{
   const label=elt('label');label.style.cssText='display:flex;gap:9px;align-items:center;padding:6px 0;font-size:.89rem';
   const input=document.createElement('input');input.type='radio';input.name='feedback_'+i;input.value=answer;group.push(input);
   label.append(input,document.createTextNode(answer));field.append(label);
  });
  radios.push(group);form.append(field);
 });
 const inputs=[];
 texts.forEach(question=>{
  const label=elt('label',question);label.style.cssText='font-size:.9rem;line-height:1.45';
  const area=document.createElement('textarea');area.rows=3;area.maxLength=500;area.placeholder='Optional';area.style.cssText='display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:10px;border-radius:9px;background:rgba(10,10,15,.75);color:#f7e7ce;border:1px solid rgba(247,231,206,.45);font:inherit;font-size:.9rem';
  label.append(area);inputs.push(area);form.append(label);
 });
 const consentLabel=elt('label');consentLabel.style.cssText='display:flex;gap:10px;align-items:flex-start;font-size:.88rem';
 const consent=document.createElement('input');consent.type='checkbox';consent.style.cssText='min-width:20px;min-height:20px';
 consentLabel.append(consent,document.createTextNode('I choose to send these feedback answers privately for product improvement. This choice is separate from gameplay analytics.'));form.append(consentLabel);
 const actions=elt('div');actions.style.cssText='display:flex;gap:10px;flex-wrap:wrap';
 const submit=elt('button','Send feedback');submit.type='submit';
 const skip=elt('button','Skip feedback');skip.type='button';skip.onclick=()=>{details.open=false};
 for(const b of [submit,skip])b.style.cssText='min-height:44px;min-width:120px;padding:10px;border:1px solid #f7e7ce;border-radius:24px;background:rgba(20,15,30,.7);color:#f7e7ce;font:inherit;cursor:pointer';
 actions.append(submit,skip);
 const status=elt('p');status.setAttribute('role','status');status.style.cssText='font-size:.88rem;line-height:1.4';
 form.append(actions,status);
 let pending=false,delivered=false;
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(pending||delivered)return;
  const cfg=window.NeuralOrchardFeedbackConfig;
  if(!cfg||cfg.enabled!==true||cfg.mode!=='email'||typeof cfg.endpoint!=='string'||!/^https:\/\/[^/]+\/api\/pilot-feedback$/.test(cfg.endpoint)){
   status.textContent='Email feedback is not active. This form is a preview; nothing was sent.';return;
  }
  const choices=radios.map(g=>g.find(x=>x.checked)?.value);
  if(choices.some(x=>!x)){status.textContent='Please choose an answer to all three multiple-choice questions.';return}
  if(!consent.checked){status.textContent='Please confirm that you choose to send feedback.';return}
  if(!window.confirm('Send this optional feedback by email to the Neural Orchard team?'))return;
  const body={game};choices.forEach((v,i)=>body[selectKeys[i]]=v);
  inputs.forEach((input,i)=>body[textKeys[i]]=input.value);
  pending=true;submit.disabled=true;status.textContent='Sending feedback…';
  try{
   const res=await fetch(cfg.endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
   if(!res.ok)throw Error('Server returned '+res.status);
   const result=await res.json();if(result.receipt!=='accepted_for_delivery')throw Error('No email-provider acceptance receipt');
   delivered=true;status.textContent='The email service accepted your feedback for delivery. Thank you.';
  }catch(_){status.textContent='Feedback was not confirmed. Your answers are still here; please retry or skip.';submit.disabled=false}
  finally{pending=false}
 });
 details.append(form);shell.append(details);
 const nav=elt('div');nav.style.cssText='display:flex;flex-wrap:wrap;gap:10px;margin-top:15px;justify-content:center';
 [['Return to Neural Orchard','index.html'],['Return to Prefrontal Pilates Studio','index.html?action=studio']].forEach(([label,url])=>{
  const btn=elt('button',label);btn.type='button';
  btn.style.cssText='min-height:44px;padding:11px 16px;border:1px solid #f7e7ce;border-radius:24px;background:rgba(20,15,30,.7);color:#f7e7ce;font:inherit;cursor:pointer';
  btn.onclick=()=>{window.location.href=url};
  nav.append(btn);
 });
 shell.append(nav);parent.append(shell);
}
window.NeuralOrchardFeedback=Object.freeze({attach});
})();
