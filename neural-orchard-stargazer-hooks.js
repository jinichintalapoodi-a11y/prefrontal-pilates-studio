/* Stargazer MVP 1.1 observation hooks; never changes gameplay decisions or persistence. */
(function(){
 'use strict';
 const N=window.NeuralOrchardProgress,E=window.Engine||((typeof Engine!=='undefined')?Engine:null);
 if(!N||!E)return;
 let stroopShownAt=null,sessionRounds=0;
 function patch(method,before,after){
   const original=E[method];if(typeof original!=='function')return;
   E[method]=function(...args){
     if(before)try{before.apply(this,args)}catch(e){console.warn('Local metric unavailable',e)}
     const value=original.apply(this,args);
     if(after)try{after.apply(this,args)}catch(e){console.warn('Local metric unavailable',e)}
     return value;
   };
 }
 patch('initPractice',function(level){sessionRounds=0;N.begin('stargazer',Number(level)||3)});
 patch('generateNewRound',function(){N.level(Number(this.sequenceLength)||3)});
 patch('executeObservationPhase',function(){N.resume()});
 patch('executeStroopPhase',null,function(){stroopShownAt=performance.now()});
 patch('evaluateStroopChoice',function(choice){
   if(!N.getActive())return;
   N.activity();
   N.metric(choice===this.correctStroopAnswer?'stroop_correct':'stroop_incorrect');
   if(stroopShownAt!==null){const ms=performance.now()-stroopShownAt;if(ms>=0&&ms<=30000){N.metric('stroop_response_ms',Math.round(ms));N.metric('stroop_timed_choices')}stroopShownAt=null}
   if(choice!==this.correctStroopAnswer)N.pause();
 });
 patch('evaluateRecallTouch',function(){N.activity();N.metric('recall_taps')});
 patch('undoLastRecallStep',function(){if(this.playerSequence&&this.playerSequence.length)N.metric('recall_undos')});
 patch('verifySequenceAccuracy',function(){
   const coords=this.playerSequence||[],expected=this.generatedSequence||[];
   const correct=coords.length===expected.length&&coords.every((c,i)=>c.x===expected[i].x&&c.y===expected[i].y);
   if(N.getActive()){N.metric(correct?'recall_correct':'recall_incorrect');sessionRounds++}
 },function(){N.pause()});
 patch('recordRoundResult',function(success){N.metric('rounds_attempted');if(success)N.metric('rounds_successful')});
 patch('exitRoom',function(){
   const a=N.getActive();
   if(a){const completed=a.activeMs>=300000&&sessionRounds>=1;N.finish(completed?'completed':'exited',Number(this.sequenceLength)||3)}
 },function(){
   const container=document.querySelector('#exit-goodbye-screen .gate-card');
   if(container&&window.NeuralOrchardFeedback)window.NeuralOrchardFeedback.attach(container);
 });
 patch('takeABreatherRoute',function(){if(N.getActive())N.finish('exited',Number(this.sequenceLength)||3)});
})();