// Founder QA #2 + #3: consolidated isolated branch regression suite.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const file=p=>readFileSync(resolve(root,p),'utf8');
const script=(html)=>[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(Boolean);
test('Onboarding is bypassed and legacy profile/progress are not cleared',()=>{
 const s=file('neural-orchard-ui.js');
 assert.doesNotMatch(s,/onboarding\(\)/);
 assert.doesNotMatch(s,/const firstVisit/);
 assert.doesNotMatch(s,/function greeting\(/);
 assert.match(s,/My Progress/);
 assert.match(s,/Privacy & Data/);
 assert.doesNotMatch(s,/P\.clearPersonal\(\)(?!\s*\))/); // explicit clear action still allowed
 assert.match(file('neural-orchard-preferences.js'),/neuralOrchardProfileV1/);
 assert.match(file('neural-orchard-progress.js'),/localStorage/);
});
test('PPS and Breathe are active, future choices disabled',()=>{
 const s=file('index.html');
 assert.equal((s.match(/class="studio-btn orchard-choice active-experience"/g)||[]).length,2);
 assert.match(s,/active-experience" onclick="Studio\.enterStudio\(\)"/);
 assert.match(s,/active-experience" onclick="Studio\.selectCycles\(\)"/);
 assert.match(s,/Nourish Me[\s\S]{0,200}Coming Soon/);
 assert.match(s,/Sleep Sanctuary[\s\S]{0,150}Coming Soon/);
 assert.match(s,/#bot-tier \.active-experience/);
});
function createBreathRuntime(){
 const html=file('index.html'),source=script(html);
 const nodes={};const get=id=>nodes[id]??(nodes[id]={innerHTML:'',style:{},classList:{add(){},remove(){}}});
 let scheduled=[],next=0;const spoken=[],tones=[],speech={cancels:0,cancel(){this.cancels++},speak(v){spoken.push(v.text)}};
 const window={location:{search:''},addEventListener(){},speechSynthesis:speech,SpeechSynthesisUtterance:class {}};
 const document={getElementById:get,body:{classList:{add(){},remove(){}}}};
 const timer=(fn,ms)=>{const id=++next;scheduled.push({id,fn,ms});return id};
 const clear=id=>{scheduled=scheduled.filter(x=>x.id!==id)};
 function SpeechSynthesisUtterance(text){this.text=text;}
 const context={window,document,setTimeout:timer,clearTimeout:clear,URLSearchParams,SpeechSynthesisUtterance};
 runInNewContext(source+';globalThis.__testStudio=Studio;',context);
 const studio=context.__testStudio;
 studio.playTone=(hz,seconds)=>{tones.push([hz,seconds])};
 return {studio,get,spoken,tones,speech,advance(){const step=scheduled.shift();if(step)step.fn();return step},pending(){return scheduled.length}};
}
test('Breathe guidance is off by default, opt-in, disabled during play and cancellable',()=>{
 const h=createBreathRuntime(),s=h.studio; s.selectCycles();
 assert.equal(s.voiceGuidance,false);
 assert.match(h.get('bot-tier').innerHTML,/Voice Guidance: Off/);
 s.toggleVoiceGuidance({setAttribute(){},set textContent(v){}});
 assert.equal(s.voiceGuidance,true);
 s.beginWave(3);
 assert.match(h.get('bot-tier').innerHTML,/Voice Guidance: On/);
 assert.match(h.get('mid-tier').innerHTML,/breath-countdown[^>]*>3/);
 h.advance();assert.match(h.get('mid-tier').innerHTML,/breath-countdown[^>]*>2/);
 h.advance();assert.match(h.get('mid-tier').innerHTML,/breath-countdown[^>]*>1/);
 h.advance();assert.deepEqual(h.spoken,['Inhale']);assert.deepEqual(h.tones,[[342,4]]);
 h.advance();assert.deepEqual(h.spoken,['Inhale','Hold']);assert.deepEqual(h.tones,[[342,4],[310,4]]);
 const priorCancel=h.speech.cancels;
 s.toggleVoiceGuidance({setAttribute(){},set textContent(v){}});
 assert.equal(s.voiceGuidance,false);
 assert(h.speech.cancels>priorCancel);
 h.advance();assert.deepEqual(h.spoken,['Inhale','Hold']);assert.deepEqual(h.tones,[[342,4],[310,4],[280,8]]);
 s.cancelBreathing();assert.equal(h.pending(),0);
});
test('Breathe voice is not required and cancel during countdown prevents any phase',()=>{
 const h=createBreathRuntime(),s=h.studio;
 s.selectCycles();s.beginWave(5);h.advance();s.cancelBreathing();
 assert.equal(h.pending(),0);assert.deepEqual(h.spoken,[]);assert.deepEqual(h.tones,[]);
});
test('Stargazer accurately explains ink-color behavior and displays recall prompt only on recall',()=>{
 const s=file('Stargaizer.html');
 assert.match(s,/Answer the question about the ink color shown/);
 assert.match(s,/A different color answer starts a new round/);
 assert.match(s,/Now retrace the constellation/);
 assert.match(s,/Tap the stars in the same order you saw them/);
 assert.match(s,/if \(selectedColorName === this\.correctStroopAnswer\)/);
 assert.match(s,/this\.initializeRecallPhase\(\)/);
 assert.match(s,/initializeRecallPhase\(\) \{[\s\S]{0,240}guidance\.classList\.add\('active'\)/);
 assert.match(s,/evaluateRecallTouch\(coord, element, index\) \{[\s\S]{0,170}guidance\.classList\.remove\('active'\)/);
 assert.match(s,/id="finishStargazer"/);
});
test('Both exits are short with collapsed optional science and distinct return targets',()=>{
 const star=file('Stargaizer.html'),sent=file('Sentinel.html');
 for(const s of [star,sent]){
  assert.match(s,/Thanks for playing!/);
  assert.match(s,/Come back whenever you/);
  assert.match(s,/The science behind this exercise/);
  assert.match(s,/Return to PPS/);
  assert.match(s,/Return to Neural Orchard/);
 }
 assert.match(star,/<details class="exit-science-details">/);
 assert.match(star,/<nav class="exit-navigation" aria-label="Leave Stargazer">/);
 assert.match(star,/confirmStudioExit\(\) \{ window\.location\.href = 'index\.html\?action=studio'; \}/);
 assert.match(star,/returnToOrchard\(\) \{ window\.location\.href = 'index\.html'; \}/);
 assert.match(sent,/<details class="sentinel-science-details">/);
 assert.match(sent,/veil\.appendChild\(exitNav\)/);
 assert.match(sent,/location\.href='index\.html\?action=studio'/);
 assert.match(sent,/location\.href='index\.html'/);
});
test('Sentinel preserves five true memory levels and five-burrow orientation',()=>{
 const sent=file('Sentinel.html');
 const start=sent.indexOf('const SENTINEL_INSTRUCTIONS=['),end=sent.indexOf('function instruction(){',start);
 const info=Function(sent.slice(start,end)+';return SENTINEL_INSTRUCTIONS')();
 assert.equal(info.length,5);
 info.forEach((row,i)=>{const numbers=row.example.split(' → ').map(Number);assert.equal(numbers.at(-1),numbers[numbers.length-i-2]);assert.match(row.task,/burrow/);});
 assert.match(sent,/class="burrow-map"/);
 assert.match(sent,/Only tap MATCH while the meerkat is visible/);
 assert.match(sent,/sequence\[sequence\.length-span\]/);
});
test('No live feedback endpoint or dashboard is activated; legacy keys preserved',()=>{
 const config=file('feedback-email/wrangler.toml.example');
 assert.match(config,/ENABLE_EMAIL_FEEDBACK\s*=\s*"false"/);
 assert.match(config,/ENABLE_SYNTHETIC_EMAIL_QA\s*=\s*"false"/);
 assert.match(file('Stargaizer.html'),/stargazerLevel/);
 assert.match(file('Sentinel.html'),/sentinelLevel/);
 assert.match(file('pps-session.js'),/ppsDailyPracticeV1/);
 const combined=file('index.html')+file('Stargaizer.html')+file('Sentinel.html');
 assert.doesNotMatch(combined,/NeuralOrchardFeedbackConfig\s*=/);
});
