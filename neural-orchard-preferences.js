/* Local-only nickname and optional future analytics preference. No network. */
(function(){
 'use strict';
 const PROFILE='neuralOrchardProfileV1',CONSENT='neuralOrchardConsentV1';
 function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
 function write(k,obj){try{localStorage.setItem(k,JSON.stringify(obj));return true}catch(_){return false}}
 function profile(){const o=read(PROFILE);return o&&o.schemaVersion===1?{schemaVersion:1,nickname:typeof o.nickname==='string'?o.nickname:'',onboardingSeen:!!o.onboardingSeen}:{schemaVersion:1,nickname:'',onboardingSeen:false}}
 function nickname(v){return Array.from(String(v||'').normalize('NFC').trim()).slice(0,40).join('').replace(/[\u0000-\u001F\u007F]/g,'')}
 function saveProfile(name,seen=true){return write(PROFILE,{schemaVersion:1,nickname:nickname(name),onboardingSeen:!!seen})}
 function consent(){const o=read(CONSENT);return o&&o.schemaVersion===1&&o.analytics===true?true:false}
 function saveConsent(enabled){return write(CONSENT,{schemaVersion:1,analytics:enabled===true,updatedAt:new Date().toISOString(),noticeVersion:'mvp11-aggregate-draft-1'})}
 function clearPersonal(){try{localStorage.removeItem(PROFILE);localStorage.removeItem(CONSENT);return true}catch(_){return false}}
 window.NeuralOrchardPreferences=Object.freeze({profile,nickname,saveProfile,consent,saveConsent,clearPersonal});
})();