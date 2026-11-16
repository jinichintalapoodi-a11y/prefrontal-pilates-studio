// Pilot MVP 1.1 RC static regression checks — run with node --test
// Intentionally dependency-free. These checks cannot substitute for live browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const file=name=>readFileSync(join(root,name),'utf8');
const html=name=>file(name);
const checkScripts=src=>{for(const [,body] of src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(body.trim())new Function(body)}};
test('HTML inline JavaScript has no syntax errors',()=>{
 for(const name of ['index.html','Stargaizer.html','Sentinel.html'])checkScripts(html(name));
});
test('Stargazer navigation footer remains visible independently of long farewell copy',()=>{
 const st=html('Stargaizer.html');
 const begin=st.indexOf('<div id="exit-goodbye-screen"'),end=st.indexOf('<script src="pps-session.js',begin);
 assert(begin>=0&&end>begin);
 const section=st.slice(begin,end);
 assert.match(section,/<\/div>\s*<nav class="exit-navigation" aria-label="Leave Stargazer">/);
 assert.equal((section.match(/<button\b/g)||[]).length,2);
 assert.match(section,/Return to Prefrontal Pilates Studio/);
 assert.match(section,/Return to Neural Orchard/);
 assert.match(st,/#exit-goodbye-screen > \.exit-navigation/);
 assert.match(st,/#exit-goodbye-screen \.gate-card\s*\{[^}]*overflow-y:auto/s);
 assert.match(st,/confirmStudioExit\(\)\s*\{\s*window\.location\.href\s*=\s*'index\.html\?action=studio'/);
 assert.match(st,/returnToOrchard\(\)\s*\{\s*window\.location\.href\s*=\s*'index\.html'/);
});
test('Both games provide optional feedback and return navigation',()=>{
 const st=html('Stargaizer.html'),se=html('Sentinel.html'),hooks=file('neural-orchard-stargazer-hooks.js'),feedback=file('neural-orchard-feedback.js');
 assert.match(hooks,/NeuralOrchardFeedback\.attach\(container\)/);
 assert.match(se,/NeuralOrchardFeedback\.attach\(card\)/);
 assert.match(st,/neural-orchard-feedback\.js/);
 assert.match(se,/neural-orchard-feedback\.js/);
 assert.match(feedback,/index\.html\?action=studio/);
 assert.match(feedback,/\['Return to Neural Orchard','index\.html'\]/);
 assert.match(feedback,/if\(!consent\.checked\)/);
 assert.match(feedback,/Your answers are still here/);
});
test('All Sentinel examples demonstrate the implemented n-back comparison',()=>{
 const se=html('Sentinel.html');
 const begin=se.indexOf('const SENTINEL_INSTRUCTIONS=[');
 const end=se.indexOf('function instruction(){',begin);
 assert(begin>=0&&end>begin);
 const entries=Function(se.slice(begin,end)+';return SENTINEL_INSTRUCTIONS')();
 assert.equal(entries.length,5);
 entries.forEach((item,i)=>{
   const n=i+1,seq=item.example.split(' → ').map(Number);
   assert(seq.length>n, 'Too few turns for level '+n);
   assert.equal(seq.at(-1),seq[seq.length-n-1], 'Incorrect n-back example level '+n);
   for(const key of ['title','watch','task','ask','explain','otherwise'])assert(item[key], 'Missing '+key+' for level '+n);
 });
 assert.match(se,/sequence\[sequence\.length-span\]/);
 assert.match(se,/Only tap MATCH while the meerkat is visible/);
});
test('Real feedback and synthetic sender remain disabled by default',()=>{
 const config=file('feedback-email/wrangler.toml.example');
 assert.match(config,/ENABLE_EMAIL_FEEDBACK\s*=\s*"false"/);
 assert.match(config,/ENABLE_SYNTHETIC_EMAIL_QA\s*=\s*"false"/);
 assert.match(config,/destination_address\s*=\s*"prefrontalpilates\.feedback@gmail\.com"/);
 const worker=file('feedback-email/src/worker.js');
 assert.match(worker,/env\.FEEDBACK_RECIPIENT!==APPROVED_RECIPIENT/);
 assert.match(worker,/env\.ENABLE_EMAIL_FEEDBACK!=='true'/);
 const feedback=file('neural-orchard-feedback.js');
 assert.match(feedback,/cfg\.enabled!==true/);
 assert.doesNotMatch(html('index.html')+html('Stargaizer.html')+html('Sentinel.html'),/NeuralOrchardFeedbackConfig\s*=/);
});
test('Legacy level and daily-practice keys remain referenced, not renamed',()=>{
 const progress=file('neural-orchard-progress.js'),st=html('Stargaizer.html'),se=html('Sentinel.html');
 assert.match(st,/stargazerLevel/);
 assert.match(se,/sentinelLevel/);
 assert.match(progress+st+se,/ppsDailyPracticeV1/);
});
