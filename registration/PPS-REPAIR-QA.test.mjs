// Pilot Feedback #1 — repair-branch source regression checks.
// Run in a checked-out repair branch with node --test registration/PPS-REPAIR-QA.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const inlineJS=html=>[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
test('All three pages contain syntactically valid inline JavaScript',()=>{
 for(const file of ['index.html','Stargaizer.html','Sentinel.html'])for(const js of inlineJS(read(file)))assert.doesNotThrow(()=>new Function(js));
});
test('Breathe retains true 4-second inhale, 4-second hold, 8-second exhale and existing tone frequencies',()=>{
 const s=read('index.html');
 assert.match(s,/\{l:'Inhale',t:4000,f:342\},\{l:'Hold',t:4000,f:310\},\{l:'Exhale',t:8000,f:280\}/);
 assert.match(s,/inhale for 4 seconds, hold for 4 seconds, then exhale for 8 seconds/);
 assert.match(s,/remaining=3/);
 assert.match(s,/if\(generation!==this\.breathGeneration\)return/);
 assert.match(s,/if\(generation===this\.breathGeneration\)this\.runWave\(\)/);
 assert.match(s,/this\.playTone\(p\.f,p\.t\/1000\)/);
 assert.match(s,/if\(immediateAction==='breather'\)Studio\.selectCycles\(\)/);
});
test('Stargazer Exit available in gameplay and level-completion choices',()=>{
 const s=read('Stargaizer.html');
 assert.match(s,/>Exit Stargazer<\/button>/);
 assert.match(s,/id="finishStargazer"/);
 assert.match(s,/document\.getElementById\('finishStargazer'\)\.onclick=\(\)=>this\.exitRoom\(\)/);
 assert.match(s,/Exit Stargazer · View return options/);
 assert.match(s,/\.hud-row-controls \.hud-nav-btn\{min-height:44px/);
 assert.match(s,/confirmStudioExit\(\) \{ window\.location\.href = 'index\.html\?action=studio'; \}/);
 assert.match(s,/returnToOrchard\(\) \{ window\.location\.href = 'index\.html'; \}/);
});
test('Sentinel has exactly five real burrow positions and consistent numbered instructions',()=>{
 const s=read('Sentinel.html');
 const burrows=s.match(/const BURROWS=\{([\s\S]*?)\};\s*const stage=/);
 assert(burrows,'Burrow table not found');
 const labels=[...burrows[1].matchAll(/(?:^|[,\s])(\d):\{x:/g)].map(x=>Number(x[1]));
 assert.deepEqual(labels,[1,2,3,4,5]);
 assert.match(s,/three across the upper row/);
 assert.match(s,/two across the lower row/);
 assert.match(s,/class="burrow-map"/);
 const from=s.indexOf('const SENTINEL_INSTRUCTIONS=['),to=s.indexOf('function instruction(){',from);
 const entries=new Function(s.slice(from,to)+';return SENTINEL_INSTRUCTIONS')();
 assert.equal(entries.length,5);
 entries.forEach((v,i)=>{let seq=v.example.split(' → ').map(Number),n=i+1;assert.equal(seq.at(-1),seq[seq.length-n-1]);});
 assert.match(s,/sequence\[sequence\.length-span\]/);
});
test('Sentinel Exit always has a safe-area-aware 44-pixel target and portrait return link',()=>{
 const s=read('Sentinel.html');
 assert.match(s,/id="exit" type="button" aria-label="Exit Sentinel to return options"/);
 assert.match(s,/\.hud #exit\{[^}]*min-height:44px/);
 assert.match(s,/safe-area-inset-left/);
 assert.match(s,/class="rotate-return" href="index.html"/);
 assert.match(s,/id="exitStudio"/);
 assert.match(s,/id="exitOrchard"/);
});
test('Feedback and historic progress persist without live activation',()=>{
 const st=read('Stargaizer.html'),sen=read('Sentinel.html'),cfg=read('feedback-email/wrangler.toml.example');
 assert.match(st,/neural-orchard-feedback\.js/);
 assert.match(sen,/neural-orchard-feedback\.js/);
 assert.match(cfg,/ENABLE_EMAIL_FEEDBACK = "false"/);
 assert.match(cfg,/ENABLE_SYNTHETIC_EMAIL_QA = "false"/);
 assert.match(read('pps-session.js'),/ppsDailyPracticeV1/);
 assert.match(st,/stargazerLevel/);
 assert.match(sen,/sentinelLevel/);
});
