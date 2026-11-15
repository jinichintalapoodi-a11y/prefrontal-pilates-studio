import test from 'node:test';
import assert from 'node:assert/strict';
import {validateFeedback,validFilter} from '../src/validate.js';
import worker from '../src/worker.js';
const sample={game:'stargazer',enjoyment:'Loved it',challenge:'Just right',replay:'Yes',enjoyed_most:'Constellations'};
const req=(url,method='GET',body,headers={})=>new Request('https://private-qa.example'+url,{method,headers:{...(body?{'content-type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});
function mockDB(){
 const rows=[];
 return {rows,prepare(sql){let params=[];
 return {bind(...x){params=x;return this},async run(){
  if(sql.startsWith('INSERT'))rows.push({id:params[0],game:params[1],enjoyment:params[2],challenge:params[3],replay:params[4],enjoyed_most:params[5],improvements:params[6],difficulties:params[7],submitted_at:params[8],expires_at:params[9]});
  else if(sql.includes('WHERE id=?')){const idx=rows.findIndex(x=>x.id===params[0]);if(idx>=0)rows.splice(idx,1)}
  else if(sql.startsWith('DELETE')){const cutoff=params[0];for(let i=rows.length-1;i>=0;i--)if(sql.includes('expires_at <=')?rows[i].expires_at<=cutoff:true)rows.splice(i,1)}
  return {success:true}
 },async all(){return {results:rows.filter(x=>x.expires_at>params[0]&&x.submitted_at>=params[1]&&(params[2]==='all'||x.game===params[2])).sort((a,b)=>b.submitted_at.localeCompare(a.submitted_at))}}}
 }};
}
test('strict schema accepts only game, ratings, optional comments',()=>{
 assert.equal(validateFeedback(sample).enjoyment,'Loved it');
 assert.equal(validateFeedback({...sample,game:'sentinel'}).game,'sentinel');
 assert.equal(validateFeedback(sample).difficulties,'');
 for(const key of ['nickname','email','installation_id','session_id','user_agent','ip'])assert.throws(()=>validateFeedback({...sample,[key]:'not allowed'}));
 for(const key of ['enjoyment','challenge','replay'])assert.throws(()=>validateFeedback({...sample,[key]:'INVALID'}));
 assert.throws(()=>validateFeedback({...sample,improvements:'x'.repeat(501)}));
 assert.throws(()=>validFilter('hacker','all'));
});
test('public collection stays disabled even with valid input',async()=>{
 const res=await worker.fetch(req('/api/feedback','POST',sample,{origin:'https://test.example'}),{FEEDBACK_DB:mockDB(),ENABLE_REAL_FEEDBACK:'false',PUBLIC_ORIGIN:'https://test.example'});
 assert.equal(res.status,503);
});
test('founder dashboard and admin API reject unauthenticated access',async()=>{
 const env={FEEDBACK_DB:mockDB(),ENABLE_SYNTHETIC_QA:'true',ACCESS_TEAM_DOMAIN:'example.cloudflareaccess.com',ACCESS_AUD:'fake',FOUNDER_EMAIL:'founder@example.com'};
 for(const path of ['/founder','/founder/app.js','/api/admin/feedback','/api/admin/export.csv']){
 const res=await worker.fetch(req(path),env);assert.equal(res.status,403);
 }
 const seed=await worker.fetch(req('/api/qa/seed','POST',sample),env);
 assert.equal(seed.status,403);assert.equal(env.FEEDBACK_DB.rows.length,0);
});
test('cron deletes expired rows only',async()=>{
 const env={FEEDBACK_DB:mockDB()};
 env.FEEDBACK_DB.rows.push({id:'past',expires_at:'2020-01-01T00:00:00Z'}, {id:'future',expires_at:'2099-01-01T00:00:00Z'});
 await worker.scheduled({},env);assert.deepEqual(env.FEEDBACK_DB.rows.map(r=>r.id),['future']);
});
