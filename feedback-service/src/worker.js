import {validateFeedback,validFilter} from './validate.js';
import {requireFounder} from './access.js';
import {dashboardHTML,dashboardCSS} from './dashboard.js';
import {dashboardApp} from './dashboard-app-asset.js';

const DAY=86400000;
const security={
 'Cache-Control':'no-store, private',
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer',
 'X-Frame-Options':'DENY',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()'
};
function response(body,status=200,type='application/json; charset=utf-8',additional={}){
 return new Response(typeof body==='string'?body:JSON.stringify(body),{status,headers:{...security,'Content-Type':type,...additional}});
}
function error(status,message){return response({error:message},status)}
function allowed(request,env){
 const origin=request.headers.get('Origin');
 if(!origin||!env.PUBLIC_ORIGIN||origin!==env.PUBLIC_ORIGIN)return {};
 return {'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
}
async function parseBody(request){
 if(!(request.headers.get('content-type')||'').startsWith('application/json'))throw Error('JSON required');
 const length=Number(request.headers.get('content-length')||0);if(length>5000)throw Error('Payload too large');
 const reader=request.body?.getReader();if(!reader)throw Error('Missing body');const chunks=[];let total=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>5000)throw Error('Payload too large');chunks.push(value)}}finally{reader.releaseLock()}
 const joined=new Uint8Array(total);let pos=0;for(const chunk of chunks){joined.set(chunk,pos);pos+=chunk.byteLength}
 const body=new TextDecoder('utf-8',{fatal:true}).decode(joined);
 return JSON.parse(body);
}
function expiry(now){return new Date(now+90*DAY).toISOString()}
async function insert(env,payload){
 const entry=validateFeedback(payload),now=Date.now();
 const id=crypto.randomUUID(),date=new Date(now).toISOString(),expires=expiry(now);
 await env.FEEDBACK_DB.prepare('INSERT INTO feedback (id,game,enjoyment,challenge,replay,enjoyed_most,improvements,difficulties,submitted_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
 .bind(id,entry.game,entry.enjoyment,entry.challenge,entry.replay,entry.enjoyed_most,entry.improvements,entry.difficulties,date,expires).run();
 return {receipt:'received'}; // Administrative record ID stays server-side; no participant token returned.
}
function filter(url){
 const u=new URL(url),{game,period}=validFilter(u.searchParams.get('game')||'all',u.searchParams.get('period')||'all');
 let threshold='1970-01-01T00:00:00.000Z';
 if(period!=='all')threshold=new Date(Date.now()-Number(period.slice(0,-1))*DAY).toISOString();
 return {game,threshold};
}
async function list(env,request){
 const {game,threshold}=filter(request.url);
 const {results}=await env.FEEDBACK_DB.prepare("SELECT id,game,enjoyment,challenge,replay,enjoyed_most,improvements,difficulties,submitted_at,expires_at FROM feedback WHERE expires_at > ? AND submitted_at >= ? AND (?='all' OR game=?) ORDER BY submitted_at DESC LIMIT 1000")
 .bind(new Date().toISOString(),threshold,game,game).all();
 return results||[];
}
function csvField(x){
 let value=String(x??'');
 if(/^[\s]*[=+@\-]/.test(value))value="'"+value;
 return '"'+value.replace(/"/g,'""')+'"';
}
function exportCSV(rows){
 const fields=['id','game','enjoyment','challenge','replay','enjoyed_most','improvements','difficulties','submitted_at','expires_at'];
 return '\uFEFF'+fields.join(',')+'\r\n'+rows.map(row=>fields.map(k=>csvField(row[k])).join(',')).join('\r\n');
}
async function deleteFiltered(env,request){
 const {game,threshold}=filter(request.url);
 if(request.headers.get('X-Confirm-Delete')!=='DELETE')return error(400,'Missing confirmation');
 await env.FEEDBACK_DB.prepare("DELETE FROM feedback WHERE expires_at > ? AND submitted_at >= ? AND (?='all' OR game=?)")
  .bind(new Date().toISOString(),threshold,game,game).run();
 return response({deleted:true});
}
const founderPolicy="default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
export default {
 async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(!env.FEEDBACK_DB)return error(503,'Feedback storage not configured');
  if(path==='/api/feedback'&&request.method==='OPTIONS'){
   const h=allowed(request,env);return Object.keys(h).length?new Response(null,{status:204,headers:{...security,...h}}):error(403,'Not allowed');
  }
  if(path==='/api/feedback'&&request.method==='POST'){
   // Fail closed. Founder must approve a distinct activation, anti-abuse rules and privacy notice.
   if(env.ENABLE_REAL_FEEDBACK!=='true')return error(503,'Feedback collection is not enabled');
   const h=allowed(request,env);
   if(!Object.keys(h).length)return error(403,'Origin not allowed');
   try{return response(await insert(env,await parseBody(request)),201,'application/json; charset=utf-8',h)}
   catch(_){return error(400,'Invalid feedback')}
  }
  if(!path.startsWith('/founder')&&!path.startsWith('/api/admin')&&!path.startsWith('/api/qa'))return error(404,'Not found');
  try{await requireFounder(request,env)}catch(_){return error(403,'Access denied')}
  if(['POST','DELETE','PUT','PATCH'].includes(request.method)){
   const origin=request.headers.get('Origin');
   if(origin&&origin!==url.origin)return error(403,'Cross-origin mutation blocked');
  }
  if(path==='/founder'&&request.method==='GET')
   return response(dashboardHTML,200,'text/html; charset=utf-8',{'Content-Security-Policy':founderPolicy});
  if(path==='/founder/style.css'&&request.method==='GET')return response(dashboardCSS,200,'text/css; charset=utf-8');
  if(path==='/founder/app.js'&&request.method==='GET')return response(dashboardApp,200,'text/javascript; charset=utf-8');
  if(path==='/api/admin/feedback'&&request.method==='GET'){
   try{return response({records:await list(env,request)})}catch(_){return error(400,'Invalid filter')}
  }
  if(path==='/api/admin/export.csv'&&request.method==='GET'){
   try{return response(exportCSV(await list(env,request)),200,'text/csv; charset=utf-8',{'Content-Disposition':'attachment; filename="neural-orchard-feedback.csv"'})}catch(_){return error(400,'Invalid filter')}
  }
  if(path==='/api/admin/feedback'&&request.method==='DELETE'){
   try{return await deleteFiltered(env,request)}catch(_){return error(400,'Invalid filter')}
  }
  const single=path.match(/^\/api\/admin\/feedback\/([0-9a-f-]{36})$/);
  if(single&&request.method==='DELETE'){
   await env.FEEDBACK_DB.prepare('DELETE FROM feedback WHERE id=?').bind(single[1]).run();
   return response({deleted:true});
  }
  if(path==='/api/qa/seed'&&request.method==='POST'){
   if(env.ENABLE_SYNTHETIC_QA!=='true')return error(403,'QA seeding disabled');
   try{return response(await insert(env,await parseBody(request)),201)}catch(_){return error(400,'Invalid synthetic record')}
  }
  return error(404,'Not found');
 },
 async scheduled(_controller,env){
   if(!env.FEEDBACK_DB)return;
   await env.FEEDBACK_DB.prepare('DELETE FROM feedback WHERE expires_at <= ?').bind(new Date().toISOString()).run();
 }
};
