/* Pilot email feedback. Separate service from the deferred D1 founder dashboard.
 * Fail-closed until an approved recipient, Cloudflare Email binding, and
 * private synthetic QA deployment have been configured. No participant identifiers.
 */
import {validateFeedback} from '../feedback-service/src/validate.js';

const HEADERS={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const reply=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...HEADERS,'Content-Type':'application/json;charset=utf-8',...extra}});
const validOrigin=(request,env)=>!!env.ALLOWED_ORIGIN&&request.headers.get('Origin')===env.ALLOWED_ORIGIN;
const cors=(env)=>({'Access-Control-Allow-Origin':env.ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Pilot-QA-Token','Vary':'Origin'});
async function limitedJson(request){
 if(!(request.headers.get('content-type')||'').startsWith('application/json'))throw Error('Expected JSON');
 const bound=Number(request.headers.get('content-length')||0);if(bound>5000)throw Error('Oversized');
 const body=await request.text();if(new TextEncoder().encode(body).byteLength>5000)throw Error('Oversized');
 return validateFeedback(JSON.parse(body));
}
function message(payload,receivedAt){
 const names={stargazer:'Stargazer',sentinel:'Sentinel'};
 return [
  'Neural Orchard — Pilot Feedback',
  'Game: '+names[payload.game],
  'Received (UTC): '+receivedAt,
  '',
  'How much did you enjoy this game?',
  payload.enjoyment,'',
  'How did you find the level of challenge?',
  payload.challenge,'',
  'Would you like to play this game again?',
  payload.replay,'',
  'What did you enjoy most about this game?',
  payload.enjoyed_most||'(blank)','',
  'What would make this game more interesting or enjoyable?',
  payload.improvements||'(blank)','',
  'Was anything confusing, frustrating, or difficult to use?',
  payload.difficulties||'(blank)',
  '',
  'No participant name, nickname, email, device ID, session ID or game history is attached. Written comments may voluntarily identify their author.'
 ].join('\n');
}
export default {
 async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(path!=='/api/pilot-feedback'&&path!=='/api/qa/email')return reply({error:'Not found'},404);
  if(!validOrigin(request,env))return reply({error:'Not authorized'},403);
  const headers=cors(env);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,...headers}});
  if(request.method!=='POST')return reply({error:'Method not allowed'},405,headers);
  const qa=path==='/api/qa/email';
  // QA is forbidden unless the caller knows a separately stored, unlogged secret.
  if(qa){
   if(env.ENABLE_SYNTHETIC_EMAIL_QA!=='true'||!env.QA_TOKEN||request.headers.get('X-Pilot-QA-Token')!==env.QA_TOKEN)return reply({error:'QA disabled'},403,headers);
  }else if(env.ENABLE_EMAIL_FEEDBACK!=='true')return reply({error:'Participant feedback is not enabled'},503,headers);
  if(!env.EMAIL||!env.FEEDBACK_RECIPIENT||!env.FEEDBACK_SENDER||!env.PILOT_RATE_LIMIT)return reply({error:'Email delivery not configured'},503,headers);
  try{
   // Privacy-first coarse GLOBAL throttle. No IP, cookie, fingerprint or user ID key.
   const throttle=await env.PILOT_RATE_LIMIT.limit({key:qa?'synthetic-feedback-qa':'pilot-feedback'});
   if(!throttle.success)return reply({error:'Feedback is busy. Please try later.'},429,headers);
   const answers=await limitedJson(request),receivedAt=new Date().toISOString();
   const subject='Neural Orchard — '+(answers.game==='stargazer'?'Stargazer':'Sentinel')+' pilot feedback'+(qa?' (SYNTHETIC QA)':'');
   const result=await env.EMAIL.send({
    to:env.FEEDBACK_RECIPIENT,
    from:env.FEEDBACK_SENDER,
    subject,
    text:message(answers,receivedAt)
   });
   if(!result||!result.messageId)return reply({error:'Provider did not confirm acceptance. You may retry.'},502,headers);
   // Confirmation means accepted by sending provider, NOT guaranteed inbox delivery.
   return reply({receipt:'accepted_for_delivery'},202,headers);
  }catch(_){
   // Never log comments or secrets. Return no internal provider error details.
   return reply({error:'Feedback was not accepted. Your answers can be retried.'},502,headers);
  }
 }
};
