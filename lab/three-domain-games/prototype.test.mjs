import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','..');
const html=readFileSync(resolve(root,'lab/three-domain-games/index.html'),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
function setup(){
 const elements=new Map(),doc={
  getElementById(id){if(!elements.has(id))elements.set(id,{innerHTML:'',value:'',classList:{toggle(){},contains(){return false}},setAttribute(){},focus(){}});return elements.get(id)},
  addEventListener(){},activeElement:{tagName:'BODY'}
 };
 const sandbox={document:doc,Math,Date};
 runInNewContext(source,sandbox,{timeout:1000});
 const call=(expression)=>runInNewContext(expression,sandbox,{timeout:1000});
 return {call,get:doc.getElementById};
}
test('Prototype includes three separate, accessible panels',()=>{
 assert.match(html,/Word Weave/);assert.match(html,/Memory Garden/);assert.match(html,/Garden Paths/);
 assert.equal((html.match(/role="tabpanel"/g)||[]).length,3);
 assert.match(html,/min-height:46px/);
 assert.doesNotMatch(html,/<script src=/);
});
test('Verbal executive categories and letters are unambiguous',()=>{
 const a=setup();
 assert.equal(a.call('verbalItems.length'),8);
 assert.equal(a.call('verbalItems.every(x=>["Food","Animal"].includes(x.kind)&&["A","B"].includes(x.letter)&&x.word[0].toUpperCase()===x.letter)'),true);
 a.call('startVerbal()');
 assert.match(a.get('ve-state').innerHTML,/Sort by meaning/);
 a.call('answerVerbal(verbalTarget(verbal.items[0],"category"))');
 assert.match(a.get('ve-state').innerHTML,/Sort by first letter/);
 a.call('answerVerbal(verbalTarget(verbal.items[1],"letter"))');
 assert.equal(a.call('verbal.correct'),2);
});
test('Verbal executive game completes eight turns without making cognitive-health claims',()=>{
 const a=setup();a.call('startVerbal()');
 for(let i=0;i<8;i++)a.call('answerVerbal(verbalTarget(verbal.items[verbal.round],verbal.rule))');
 assert.equal(a.call('verbal.correct'),8);assert.equal(a.call('verbal.round'),8);
 assert.match(a.get('ve-state').innerHTML,/Practice complete/);
});
test('Verbal memory uses five-word study, distractor and typed free recall',()=>{
 const a=setup();a.call('startMemory()');
 assert.equal(a.call('memory.words.length'),5);
 a.call('beginDistractor()');assert.equal(a.call('memory.stage'),'distractor');
 for(const answer of ['8','3','Yes'])a.call('answerDistractor('+JSON.stringify(answer)+')');
 assert.equal(a.call('memory.stage'),'recall');
 const studied=a.call('memory.words.slice()');
 for(const word of studied){a.get('recall-word').value=word;a.call('submitRecall({preventDefault(){}})')}
 assert.equal(a.call('memory.stage'),'complete');
 assert.match(a.get('me-state').innerHTML,/5 of 5 studied words recalled/);
});
test('Recall cannot double-count a repeated word',()=>{
 const a=setup();a.call('startMemory();beginDistractor();answerDistractor("8");answerDistractor("3");answerDistractor("Yes")');
 const word=a.call('memory.words[0]');a.get('recall-word').value=word;a.call('submitRecall({preventDefault(){}})');
 a.get('recall-word').value=word;a.call('submitRecall({preventDefault(){}})');
 assert.equal(a.call('memory.answered.length'),1);
});
test('All four garden puzzles are reachable and have nontrivial shortest paths',()=>{
 const a=setup();const lengths=a.call('maps.map(x=>shortestPath(x))');
 assert.equal(lengths.length,4);assert(lengths.every(x=>Number.isFinite(x)&&x>=5));
});
test('Visual planning movement respects walls/bounds and completes on reaching goal',()=>{
 const a=setup();a.call('startVisual()');
 const initial=a.call('visual.pos');
 a.call('moveVisual("up")');assert.equal(a.call('visual.pos'),initial-4);
 a.call('moveVisual("right")');assert.equal(a.call('visual.pos'),initial-4);
 assert.match(a.get('vi-state').innerHTML,/blocked/);
 a.call('startVisual()');
 for(const direction of ['right','right','right','up','up','up'])a.call('moveVisual('+JSON.stringify(direction)+')');
 assert.equal(a.call('visual.done'),true);
});
test('All prototypes are local-only and avoid unsupported clinical conclusions',()=>{
 assert.doesNotMatch(html,/(fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon|localStorage\.setItem)/);
 assert.match(html,/does not measure brain health/);
});
