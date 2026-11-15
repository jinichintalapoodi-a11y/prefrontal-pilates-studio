import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const ORIGIN='https://private-test.example';
const SAMPLE={game:'stargazer',enjoyment:'Loved it',challenge:'Just right',replay:'Yes',enjoyed_most:'Synthetic star pattern',improvements:'Synthetic clarity suggestion',difficulties:''};
function env(overrides={}){
 const sent=[];
 return {sent,ALLOWED_ORIGIN:ORIGIN,ENABLE_EMAIL_FEEDBACK:'false',
  ENABLE_SYNTHETIC_EMAIL_QA:'true',QA_TOKEN:'qa-unit-test-only',
  FEEDBACK_RECIPIENT:'approved-test-inbox@example.invalid',
  FEEDBACK_SENDER:'pilot@example.invalid',
  PILOT_RATE_LIMIT:{async limit({key}){return{success:key==='synthetic-feedback-qa'}}},
  EMAIL:{async send(message){sent.push(message);return{messageId:'synthetic-provider-ack'}}},
  ...overrides};
}
const request=(path,body,token='qa-unit-test-only',origin=ORIGIN)=>new Request('https://qa.example'+path,{
 method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Pilot-QA-Token':token},
 body:JSON.stringify(body)
});
test('real participant feedback fails closed',async()=>{
 const e=env();const res=await worker.fetch(request('/api/pilot-feedback',SAMPLE),e);
 assert.equal(res.status,503);assert.equal(e.sent.length,0);
});
test('synthetic QA requires correct token and exact Origin',async()=>{
 const e=env();
 assert.equal((await worker.fetch(request('/api/qa/email',SAMPLE,'wrong'),e)).status,403);
 assert.equal((await worker.fetch(request('/api/qa/email',SAMPLE,'qa-unit-test-only','https://untrusted.example'),e)).status,403);
 assert.equal(e.sent.length,0);
});
test('accepted synthetic QA sends only approved fields and server timestamp',async()=>{
 const e=env();const res=await worker.fetch(request('/api/qa/email',SAMPLE),e);
 assert.equal(res.status,202);assert.equal((await res.json()).receipt,'accepted_for_delivery');
 assert.equal(e.sent.length,1);
 assert.equal(e.sent[0].to,e.FEEDBACK_RECIPIENT);
 assert.match(e.sent[0].text,/Game: Stargazer/);
 assert.match(e.sent[0].text,/Received \(UTC\): /);
 assert.match(e.sent[0].text,/Synthetic star pattern/);
 assert.doesNotMatch(e.sent[0].text,/stargazerLevel|ppsDailyPracticeV1|localStorage/);
});
test('rejects identity additions, invalid ratings and excessive comments',async()=>{
 const e=env();
 for(const payload of [
   {...SAMPLE,nickname:'SyntheticName'},
   {...SAMPLE,email:'someone@example.invalid'},
   {...SAMPLE,session_id:'identifier'},
   {...SAMPLE,enjoyment:'Unknown'},
   {...SAMPLE,difficulties:'x'.repeat(501)}
 ]) assert.equal((await worker.fetch(request('/api/qa/email',payload),e)).status,400);
 assert.equal(e.sent.length,0);
});
test('missing provider acknowledgement is never presented as success',async()=>{
 const e=env({EMAIL:{async send(){return{}}}});
 const res=await worker.fetch(request('/api/qa/email',SAMPLE),e);
 assert.equal(res.status,502);assert.notEqual((await res.json()).receipt,'accepted_for_delivery');
});
test('rate-limiter failure blocks email before send',async()=>{
 const e=env({PILOT_RATE_LIMIT:{async limit(){return{success:false}}}});
 assert.equal((await worker.fetch(request('/api/qa/email',SAMPLE),e)).status,429);
 assert.equal(e.sent.length,0);
});
