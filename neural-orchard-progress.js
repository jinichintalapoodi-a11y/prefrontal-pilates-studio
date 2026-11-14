/* Neural Orchard MVP 1.1: device-only progress and active-session tracking.
 * No fetch, pixels, cookies, identifiers sent to a server, or legacy-key writes.
 */
(function () {
  'use strict';
  const KEY='neuralOrchardProgressV1', ACTIVE='neuralOrchardActiveV1';
  const MAX=200, AGE=90*86400000, IDLE=120000;
  const games=['stargazer','sentinel'], outcomes=['completed','exited','interrupted'];
  let current=null, timer=null;
  const get=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
  const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
  const del=k=>{try{localStorage.removeItem(k)}catch(_){}};
  // Pending session checkpoints are per-tab; opening another tab must not interrupt active play.
  const activeGet=()=>{try{return sessionStorage.getItem(ACTIVE)}catch(_){return null}};
  const activePut=x=>{try{sessionStorage.setItem(ACTIVE,JSON.stringify(x));return true}catch(_){return false}};
  const activeDel=()=>{try{sessionStorage.removeItem(ACTIVE)}catch(_){}};
  const fresh=()=>({schemaVersion:1,sessions:[],dailyTotals:{},lastUpdatedAt:null});
  const id=()=>{try{return crypto.randomUUID()}catch(_){return String(Date.now())+String(Math.random()).slice(2)}};
  const validDate=s=>Number.isFinite(Date.parse(s));
  const category=()=>{const w=window.innerWidth;return w<=600?'mobile':w<=1024?'tablet':'desktop'};
  function load(){
    try{
      const x=JSON.parse(get(KEY)||'null');
      if(x&&x.schemaVersion===1&&Array.isArray(x.sessions)){
        return {schemaVersion:1,sessions:x.sessions.filter(y=>y&&games.includes(y.game)&&outcomes.includes(y.outcome)&&validDate(y.endTimeISO)&&Number.isFinite(y.elapsedActiveMs)&&y.elapsedActiveMs>=0),dailyTotals:x.dailyTotals||{},lastUpdatedAt:x.lastUpdatedAt||null};
      }
    }catch(_){}
    return fresh();
  }
  function dateOf(s){const d=new Date(s);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
  function writable(){const raw=get(KEY);if(raw===null)return true;try{const x=JSON.parse(raw);return !!(x&&x.schemaVersion===1&&Array.isArray(x.sessions))}catch(_){return false}}
  function commit(entry){
    if(!writable())return false;
    if(!entry||!games.includes(entry.game)||!outcomes.includes(entry.outcome)||!validDate(entry.endTimeISO))return false;
    if(!Number.isFinite(entry.elapsedActiveMs)||entry.elapsedActiveMs<0||entry.elapsedActiveMs>86400000)return false;
    const data=load();
    if(entry.localSessionId&&data.sessions.some(x=>x.localSessionId===entry.localSessionId))return true;
    data.sessions.push({...entry,elapsedActiveMs:Math.round(entry.elapsedActiveMs)});
    const cutoff=Date.now()-AGE;
    data.sessions=data.sessions.filter(x=>Date.parse(x.endTimeISO)>=cutoff).slice(-MAX);
    data.dailyTotals={};
    for(const x of data.sessions){
      const day=dateOf(x.endTimeISO);
      if(!data.dailyTotals[day])data.dailyTotals[day]={stargazer:0,sentinel:0};
      data.dailyTotals[day][x.game]+=x.elapsedActiveMs;
    }
    data.lastUpdatedAt=new Date().toISOString();
    return put(KEY,data);
  }
  function record(x){if(!x||!games.includes(x.game)||!outcomes.includes(x.outcome))return false;return commit({
    localSessionId:x.localSessionId||id(),game:x.game,outcome:x.outcome,
    startTimeISO:x.startTimeISO||null,endTimeISO:x.endTimeISO||new Date().toISOString(),
    elapsedActiveMs:Number(x.elapsedActiveMs),levelAtStart:Number.isSafeInteger(x.levelAtStart)?x.levelAtStart:null,
    levelAtEnd:Number.isSafeInteger(x.levelAtEnd)?x.levelAtEnd:null,
    deviceCategory:x.deviceCategory||category(),metrics:x.metrics||{}
  })}
  function recover(){
    if(current)return;
    try{
      const x=JSON.parse(activeGet()||'null');
      if(x&&games.includes(x.game)&&validDate(x.started)&&!load().sessions.some(y=>y.localSessionId===x.localSessionId)){
        record({localSessionId:x.localSessionId,game:x.game,outcome:'interrupted',startTimeISO:x.started,
          elapsedActiveMs:Math.max(0,Math.min(86400000,Number(x.elapsedActiveMs)||0)),
          levelAtStart:x.levelAtStart,levelAtEnd:x.levelAtEnd,metrics:x.metrics||{},deviceCategory:x.deviceCategory});
      }
    }catch(_){}
    activeDel();
  }
  function checkpoint(){
    if(!current)return;
    activePut({localSessionId:current.localSessionId,game:current.game,started:current.started,
      elapsedActiveMs:elapsed(),levelAtStart:current.levelAtStart,levelAtEnd:current.levelAtEnd,
      metrics:current.metrics,deviceCategory:current.deviceCategory});
  }
  function elapsed(){
    if(!current)return 0;
    const now=performance.now();
    return current.elapsedActiveMs+(current.activeSince===null?0:Math.max(0,Math.min(now,current.lastInteraction+IDLE)-current.activeSince));
  }
  function pause(reason='explicit'){
    if(!current)return;
    if(current.activeSince!==null){current.elapsedActiveMs=elapsed();current.activeSince=null}
    current.holdReason=reason;checkpoint();
  }
  function resume(){
    if(!current||document.hidden||current.activeSince!==null)return;
    current.lastInteraction=performance.now();current.activeSince=current.lastInteraction;current.holdReason=null;checkpoint();
  }
  function activity(){
    if(!current||document.hidden)return;
    const now=performance.now();
    if(current.activeSince!==null&&now>current.lastInteraction+IDLE)pause('idle');
    if(current.activeSince===null&&current.holdReason==='idle')resume();
    current.lastInteraction=now;
  }
  function begin(game,level){
    if(!games.includes(game))return false;
    if(current)finish('interrupted',current.levelAtEnd);
    recover();
    const now=performance.now();
    current={localSessionId:id(),game,started:new Date().toISOString(),levelAtStart:Number.isInteger(level)?level:null,
      levelAtEnd:Number.isInteger(level)?level:null,elapsedActiveMs:0,activeSince:document.hidden?null:now,
      lastInteraction:now,holdReason:document.hidden?'hidden':null,deviceCategory:category(),metrics:{}};
    checkpoint();return true;
  }
  function metric(name,amount=1){if(!current||!/^([a-z][a-z0-9_]{1,35})$/.test(name)||!Number.isFinite(amount)||amount<0)return;
    current.metrics[name]=(current.metrics[name]||0)+amount;checkpoint()}
  function level(value){if(current&&Number.isSafeInteger(value)){current.levelAtEnd=value;checkpoint()}}
  function finish(outcome,endingLevel){
    if(!current||!outcomes.includes(outcome))return false;
    if(Number.isSafeInteger(endingLevel))current.levelAtEnd=endingLevel;
    pause('ended');
    const x={localSessionId:current.localSessionId,game:current.game,outcome,startTimeISO:current.started,
      endTimeISO:new Date().toISOString(),elapsedActiveMs:Math.round(current.elapsedActiveMs),
      levelAtStart:current.levelAtStart,levelAtEnd:current.levelAtEnd,
      deviceCategory:current.deviceCategory,metrics:current.metrics};
    const ok=record(x);
    if(ok){current=null;activeDel()}return ok;
  }
  function summary(){
    const data=load(),result={};
    for(const game of games){
      const ss=data.sessions.filter(s=>s.game===game),ms=ss.reduce((a,s)=>a+s.elapsedActiveMs,0);
      const metrics={};
      for(const x of ss)for(const [k,v] of Object.entries(x.metrics||{}))if(Number.isFinite(v)&&v>=0)metrics[k]=(metrics[k]||0)+v;
      result[game]={recordedSessions:ss.length,activeMs:ms,averageSessionMs:ss.length?Math.round(ms/ss.length):0,
        completed:ss.filter(s=>s.outcome==='completed').length,exited:ss.filter(s=>s.outcome==='exited').length,
        interrupted:ss.filter(s=>s.outcome==='interrupted').length,metrics};
    }
    return {games:result,dailyTotals:data.dailyTotals,historyStartsWithMvp11:true,storageWarning:!writable()};
  }
  function clearHistory(){try{localStorage.removeItem(KEY);sessionStorage.removeItem(ACTIVE);current=null;return true}catch(_){return false}}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('hidden');else if(current&&current.holdReason==='hidden')resume()});
  document.addEventListener('pointerdown',activity,{passive:true});
  document.addEventListener('keydown',activity,{passive:true});
  window.addEventListener('pagehide',()=>{pause('pagehide');checkpoint()});
  timer=setInterval(()=>{if(current&&current.activeSince!==null){const now=performance.now();if(now-current.lastInteraction>=IDLE)pause('idle');else checkpoint()}},15000);
  recover();
  window.NeuralOrchardProgress=Object.freeze({load,record,summary,begin,pause,resume,activity,metric,level,finish,clearHistory,
    getActive:()=>current?{game:current.game,activeMs:elapsed(),level:current.levelAtEnd}:null,IDLE_MS:IDLE});
})();