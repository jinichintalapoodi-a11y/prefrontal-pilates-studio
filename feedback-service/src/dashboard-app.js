// Dashboard runs only on founder-authenticated Worker origin. All comments use textContent.
const byId=id=>document.getElementById(id);
let last=[];
function element(tag,txt){const e=document.createElement(tag);e.textContent=String(txt);return e}
function status(msg){byId('status').textContent=msg}
function query(){return '?game='+encodeURIComponent(byId('game').value)+'&period='+encodeURIComponent(byId('period').value)}
async function api(url,options={}){
 const response=await fetch(url,{...options,credentials:'same-origin',cache:'no-store',headers:{'Accept':'application/json',...(options.headers||{})}});
 if(!response.ok)throw Error('Server returned '+response.status);
 return response.json()
}
function ratings(key,values,rows){
 const el=byId(key);el.replaceChildren();
 for(const label of values){el.append(element('li',label+': '+rows.filter(r=>r[key]===label).length))}
}
function render(rows){
 last=rows;
 byId('total').textContent=String(rows.length);
 byId('sg').textContent=String(rows.filter(x=>x.game==='stargazer').length);
 byId('sn').textContent=String(rows.filter(x=>x.game==='sentinel').length);
 ratings('enjoyment',['Loved it','Liked it','It was okay',"Didn't enjoy it"],rows);
 ratings('challenge',['Too easy','Just right','Too difficult','Some parts were confusing'],rows);
 ratings('replay',['Yes','Maybe','No'],rows);
 renderComments();
 const list=byId('records');list.replaceChildren();
 for(const r of rows){
 const li=document.createElement('li'),summary=document.createElement('details'),head=document.createElement('summary');
 head.textContent=r.game+' · '+r.submitted_at.slice(0,10)+' · '+r.enjoyment;
 const desc=document.createElement('div');
 for(const [label,key] of [['Challenge','challenge'],['Play again','replay'],['Enjoyed','enjoyed_most'],['Improvements','improvements'],['Difficulties','difficulties']]){
 const p=document.createElement('p');p.append(element('strong',label+': '),document.createTextNode(r[key]||'—'));desc.append(p);
 }
 const del=element('button','Delete this response…');del.className='delete-one';
 del.onclick=async()=>{if(!confirm('Permanently delete this feedback record?'))return;try{await api('/api/admin/feedback/'+encodeURIComponent(r.id),{method:'DELETE'});await refresh()}catch(e){status('Delete failed: '+e.message)}};
 desc.append(del);summary.append(head,desc);li.append(summary);list.append(li)
 }
}
function renderComments(){
 const key=byId('comment-kind').value,list=byId('comments');list.replaceChildren();
 for(const r of last.filter(x=>(x[key]||'').trim())){
 const li=document.createElement('li');
 li.append(element('strong',r.game+' · '+r.submitted_at.slice(0,10)),element('pre',r[key]));
 list.append(li);
 }
 if(!list.children.length)list.append(element('li','No written responses in this view.'));
}
async function refresh(){
 try{status('Loading feedback…');const x=await api('/api/admin/feedback'+query());render(x.records);status('Showing '+x.records.length+' feedback records.')}catch(e){status('Unable to load feedback: '+e.message)}
}
for(const id of ['game','period'])byId(id).onchange=refresh;
byId('reload').onclick=refresh;byId('comment-kind').onchange=renderComments;
byId('delete-all').onclick=async()=>{
 if(!last.length)return;
 if(!confirm('Permanently delete ALL '+last.length+' records currently matching these filters?'))return;
 if(prompt('Type DELETE to confirm:')!=='DELETE')return;
 try{await api('/api/admin/feedback'+query(),{method:'DELETE',headers:{'X-Confirm-Delete':'DELETE'}});await refresh()}catch(e){status('Bulk deletion failed: '+e.message)}
};
byId('export').onclick=async()=>{
 try{
 const response=await fetch('/api/admin/export.csv'+query(),{credentials:'same-origin',cache:'no-store'});
 if(!response.ok)throw Error('Export denied: '+response.status);
 const blob=await response.blob(),link=document.createElement('a'),url=URL.createObjectURL(blob);
 link.href=url;link.download='neural-orchard-feedback.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
 }catch(e){status('Export failed: '+e.message)}
};
refresh();
