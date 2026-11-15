/* Synthetic-only optional feedback preview. Never saves or transmits answers. */
(function(){
 'use strict';
 const q=[['How much did you enjoy this game?',['Loved it','Liked it','It was okay',"Didn't enjoy it"]],
 ['How did you find the level of challenge?',['Too easy','Just right','Too difficult','Some parts were confusing']],
 ['Would you like to play this game again?',['Yes','Maybe','No']]];
 const free=['What did you enjoy most about this game?','What would make this game more interesting or enjoyable?','Was anything confusing, frustrating, or difficult to use?'];
 function attach(parent){
   if(!parent||parent.querySelector('.no-feedback'))return;
   const details=document.createElement('details');details.className='no-feedback';details.style.cssText='width:100%;max-width:440px;margin:15px auto 22px;text-align:left;border:1px solid rgba(247,231,206,.6);border-radius:14px;padding:12px;color:#f7e7ce';
   const summary=document.createElement('summary');summary.textContent='Optional feedback preview';summary.style.cssText='cursor:pointer;min-height:44px;padding:10px;font-size:1rem';details.appendChild(summary);
   const note=document.createElement('p');note.textContent='This is a development preview. Answers are not saved or sent. Free-text answers are optional. Feedback consent will be requested separately before any future submission.';note.style.cssText='font-size:.85rem;line-height:1.45';details.appendChild(note);
   const form=document.createElement('form');form.autocomplete='off';form.style.cssText='display:flex;flex-direction:column;gap:13px';
   q.forEach(([label,options],i)=>{let field=document.createElement('fieldset');field.style.cssText='min-width:0;border:1px solid rgba(247,231,206,.32);padding:10px;border-radius:10px';
     const legend=document.createElement('legend');legend.textContent=label;legend.style.cssText='font-size:.87rem;line-height:1.35';field.appendChild(legend);
     options.forEach(opt=>{const row=document.createElement('label');row.style.cssText='display:flex;gap:9px;align-items:center;padding:5px 0;font-size:.85rem';
       const input=document.createElement('input');input.type='radio';input.name='answer'+i;input.value=opt;
       row.append(input,document.createTextNode(opt));field.appendChild(row)});
     form.appendChild(field)});
   free.forEach((label,i)=>{const wrap=document.createElement('label');wrap.textContent=label;wrap.style.cssText='font-size:.86rem';
     const area=document.createElement('textarea');area.rows=2;area.maxLength=500;area.placeholder='Optional';area.style.cssText='display:block;width:100%;margin-top:6px;padding:9px;border-radius:9px;box-sizing:border-box;background:rgba(10,10,15,.75);color:#f7e7ce;border:1px solid rgba(247,231,206,.45);font:inherit;font-size:.88rem';
     wrap.appendChild(area);form.appendChild(wrap)});
   const submit=document.createElement('button');submit.type='submit';submit.textContent='Test feedback form (no submission)';submit.style.cssText='padding:12px;border:1px solid #f7e7ce;border-radius:24px;background:rgba(20,15,30,.7);color:#f7e7ce;min-height:44px;font:inherit';
   const result=document.createElement('p');result.setAttribute('role','status');result.style.cssText='font-size:.85rem';
   form.append(submit,result);form.addEventListener('submit',e=>{e.preventDefault();result.textContent='Preview only — nothing was saved or sent.';form.reset()});details.appendChild(form);
   const navigation=document.createElement('div');
   navigation.style.cssText='display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;justify-content:center';
   [['Return to Neural Orchard','index.html'],['Return to Prefrontal Pilates Studio','index.html?action=studio']].forEach(([label,url])=>{
     const button=document.createElement('button');
     button.type='button';button.textContent=label;
     button.style.cssText='min-height:44px;padding:11px 16px;border:1px solid #f7e7ce;border-radius:24px;background:rgba(20,15,30,.7);color:#f7e7ce;font:inherit;cursor:pointer';
     button.addEventListener('click',()=>{window.location.href=url});
     navigation.appendChild(button);
   });
   details.appendChild(navigation);parent.appendChild(details);
 }
 window.NeuralOrchardFeedback=Object.freeze({attach});
})();