// Shared, dependency-free validation for isolated Neural Orchard feedback service.
// Reject unexpected keys, identity fields, and unsupported survey values.
export const ENJOYMENT=['Loved it','Liked it','It was okay',"Didn't enjoy it"];
export const CHALLENGE=['Too easy','Just right','Too difficult','Some parts were confusing'];
export const REPLAY=['Yes','Maybe','No'];
export const GAMES=['stargazer','sentinel'];
export const MAX_COMMENT=500;
const FIELDS=['game','enjoyment','challenge','replay','enjoyed_most','improvements','difficulties'];
export function validateFeedback(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Invalid feedback body');
 const fields=Object.keys(raw);
 if(fields.length>FIELDS.length||fields.some(x=>!FIELDS.includes(x)))throw new Error('Unexpected feedback field');
 if(!GAMES.includes(raw.game))throw new Error('Invalid game');
 const required=[['enjoyment',ENJOYMENT],['challenge',CHALLENGE],['replay',REPLAY]];
 const obj={game:raw.game};
 for(const [key,values] of required){
   if(!values.includes(raw[key]))throw new Error('Choose a valid answer for '+key);
   obj[key]=raw[key];
 }
 for(const key of FIELDS.slice(4)){
   if(raw[key]!==undefined&&typeof raw[key]!=='string')throw new Error('Invalid '+key);
   const val=raw[key]||'';
   if([...val].length>MAX_COMMENT||/\u0000/.test(val))throw new Error('Comment too long or invalid');
   obj[key]=val;
 }
 return obj;
}
export function validFilter(game,period){
 if(!['all',...GAMES].includes(game))throw new Error('Invalid game filter');
 if(!['all','7d','30d','90d'].includes(period))throw new Error('Invalid period filter');
 return {game,period};
}
