// Founder voice guidance refinement — isolated browser speech API simulations.
// Run in a checked-out branch: node --test registration/PPS-GENTLE-VOICE-QA.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=readFileSync(resolve(root,'index.html'),'utf8');
const inline=[...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(Boolean);
function runtime(voices=[]){
 const els={};const get=id=>els[id]??(els[id]={innerHTML:'',style:{},classList:{add(){},remove(){}}});
 const spoken=[],tones=[],events=[];let jobs=[],id=0,available=voices;
 const synth={
  getVoices:()=>available,
  cancel(){events.push({type:'cancel'})},
  speak(utterance){spoken.push(utterance);events.push({type:'speak',text:utterance.text})}
 };
 const window={location:{search:''},speechSynthesis:synth,SpeechSynthesisUtterance:class{},addEventListener(){}};
 const document={getElementById:get,body:{classList:{add(){},remove(){}}}};
 function SpeechSynthesisUtterance(text){this.text=text}
 const schedule=(fn,ms)=>{jobs.push({id:++id,fn,ms});return id},clear=id=>{jobs=jobs.filter(x=>x.id!==id)};
 const context={window,document,setTimeout:schedule,clearTimeout:clear,URLSearchParams,SpeechSynthesisUtterance};
 runInNewContext(inline+';globalThis.__studio=Studio;',context);
 const studio=context.__studio;studio.playTone=(hz,duration)=>{tones.push([hz,duration])};
 return {studio,get,spoken,tones,events,setVoices:v=>available=v,step(){const next=jobs.shift();if(next)next.fn();return next},get pending(){return jobs.length}};
}
const VOICE_HELP='Turn this on to hear a calm, gentle voice guide you through each breathing phase: inhale, hold, and exhale. You can turn it off anytime.';
test('Gentle Voice Guidance is off by default, with exact adjacent explanatory text',()=>{
 const v=runtime();v.studio.selectCycles();
 const html=v.get('bot-tier').innerHTML;
 assert.match(html,/Gentle Voice Guidance: Off/);
 assert.match(html,/aria-pressed="false"/);
 assert.match(html,/aria-describedby="gentle-voice-help"/);
 assert.match(html,/id="gentle-voice-help"/);
 assert(html.indexOf('gentle-voice-help')>html.indexOf('voice-guidance-control'));
 assert(html.includes(VOICE_HELP));
});
test('Voice selection prefers local natural English voice over remote and novelty options',()=>{
 const localCompact={name:'Compact Robot',lang:'en-US',localService:true,default:true};
 const remoteNatural={name:'Premium Natural',lang:'en-US',localService:false,default:true};
 const localNatural={name:'Ava Enhanced',lang:'en-US',localService:true,default:false};
 const localFrench={name:'French Natural',lang:'fr-FR',localService:true,default:false};
 const v=runtime([localCompact,remoteNatural,localFrench,localNatural]);
 assert.equal(v.studio.selectGentleVoice(),localNatural);
 v.studio.toggleVoiceGuidance({setAttribute(){},set textContent(x){}});
 v.studio.speakPhase('Inhale');
 const utter=v.spoken[0];
 assert.equal(utter.voice,localNatural);
 assert.equal(utter.lang,'en-US');
 assert.equal(utter.rate,.82);
 assert.equal(utter.pitch,.98);
 assert.equal(utter.volume,.55);
});
test('No fixed voice is assumed; late voice inventory is used on subsequent phases',()=>{
 const newVoice={name:'Jenny Natural',lang:'en-US',localService:true};
 const v=runtime([]);
 v.studio.toggleVoiceGuidance({setAttribute(){},set textContent(x){}});
 v.studio.speakPhase('Inhale');
 assert.equal(v.spoken[0].voice,undefined);
 v.setVoices([newVoice]);v.studio.speakPhase('Hold');
 assert.equal(v.spoken[1].voice,newVoice);
});
test('Speech does not change phase schedule or tone frequencies and never queues overlaps',()=>{
 const v=runtime([{name:'Local Natural',lang:'en-US',localService:true}]),s=v.studio;
 s.selectCycles();s.toggleVoiceGuidance({setAttribute(){},set textContent(x){}});
 s.beginWave(3);
 assert.match(v.get('bot-tier').innerHTML,/Gentle Voice Guidance: On/);
 assert(v.get('bot-tier').innerHTML.includes(VOICE_HELP));
 assert.match(v.get('mid-tier').innerHTML,/breath-countdown[^>]*>3/);
 for(const count of ['2','1']){const step=v.step();assert.equal(step.ms,1000);assert.match(v.get('mid-tier').innerHTML,new RegExp('breath-countdown[^>]*>'+count));}
 assert.equal(v.step().ms,1000);
 assert.equal(v.spoken[0].text,'Inhale');assert.deepEqual(v.tones[0],[342,4]);
 assert.equal(v.step().ms,4000);
 assert.equal(v.spoken[1].text,'Hold');assert.deepEqual(v.tones[1],[310,4]);
 assert.equal(v.step().ms,4000);
 assert.equal(v.spoken[2].text,'Exhale');assert.deepEqual(v.tones[2],[280,8]);
 assert.equal(v.step().ms,8000);
 assert.equal(v.spoken[3].text,'Inhale');
 for(let i=0;i<v.events.length;i++)if(v.events[i].type==='speak')assert.equal(v.events[i-1]?.type,'cancel');
});
test('Turning voice off stops speech immediately, and visual-only timing continues',()=>{
 const v=runtime(),s=v.studio;s.selectCycles();s.toggleVoiceGuidance({setAttribute(){},set textContent(x){}});
 s.beginWave(3);v.step();v.step();v.step();
 const prior=v.spoken.length;
 s.toggleVoiceGuidance({setAttribute(){},set textContent(x){}});
 assert.equal(s.voiceGuidance,false);
 assert.equal(v.events.at(-1).type,'cancel');
 v.step();assert.equal(v.spoken.length,prior);assert.deepEqual(v.tones,[[342,4],[310,4]]);
 s.cancelBreathing();assert.equal(v.pending,0);
});
test('No speech API falls back to visual-only controls without an exception',()=>{
 const v=runtime();delete v.studio.voiceGuidance; // restore explicit OFF to exercise unsupported fallback
 v.studio.voiceGuidance=false;
 const original=v.studio.voiceSupported;
 v.studio.voiceSupported=()=>false;
 v.studio.selectCycles();
 assert.match(v.get('bot-tier').innerHTML,/Gentle Voice Guidance Unavailable/);
 const button={textContent:'',setAttribute(){}};
 v.studio.toggleVoiceGuidance(button);
 assert.equal(v.studio.voiceGuidance,false);
 v.studio.beginWave(3);v.step();v.step();v.step();
 assert.deepEqual(v.tones,[[342,4]]);assert.equal(v.spoken.length,0);
 v.studio.voiceSupported=original;
});
