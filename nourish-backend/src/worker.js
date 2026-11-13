import {scoreMeal,oneTweak} from "./scoring.js";
const json=(obj,status=200,origin="")=>new Response(JSON.stringify(obj),{status,headers:{"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":origin,"vary":"Origin"}});
const b64url=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(s.length/4)*4,"=")),c=>c.charCodeAt(0));
async function accessUser(request,env){
  const token=request.headers.get("Cf-Access-Jwt-Assertion");if(!token||!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD)throw Error("Access authentication required");
  const parts=token.split(".");if(parts.length!==3)throw Error("Invalid Access token");
  const head=JSON.parse(new TextDecoder().decode(b64url(parts[0]))),payload=JSON.parse(new TextDecoder().decode(b64url(parts[1])));
  if(head.alg!=="RS256"||!head.kid)throw Error("Unsupported token");
  const issuer="https://"+env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//,"").replace(/\/$/,"");
  if(payload.iss!==issuer||!(Array.isArray(payload.aud)?payload.aud.includes(env.ACCESS_AUD):payload.aud===env.ACCESS_AUD)||!payload.sub||!payload.exp||payload.exp<=Date.now()/1000)throw Error("Invalid Access claims");
  const keys=await fetch(issuer+"/cdn-cgi/access/certs");if(!keys.ok)throw Error("Access certificates unavailable");
  const jwks=await keys.json();const jwk=jwks.keys.find(k=>k.kid===head.kid);if(!jwk)throw Error("Access key unavailable");
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
  const valid=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,b64url(parts[2]),new TextEncoder().encode(parts[0]+"."+parts[1]));
  if(!valid)throw Error("Invalid Access signature");
  return payload.sub;
}
export class UsageGate {
  constructor(state,env){this.state=state;this.env=env;}
  async fetch(request){
    const {user}=await request.json();const day=new Date().toISOString().slice(0,10);
    return this.state.blockConcurrencyWhile(async()=>{
      const stored=await this.state.storage.get("usage")||{day,global:0,users:{}};
      const usage=stored.day===day?stored:{day,global:0,users:{}};
      const limit=Math.max(1,Number(this.env.DAILY_GLOBAL_LIMIT||50)),perUser=Math.max(1,Number(this.env.DAILY_USER_LIMIT||5));
      if(usage.global>=limit||(usage.users[user]||0)>=perUser)return json({error:"Daily pilot usage limit reached."},429);
      usage.global++;usage.users[user]=(usage.users[user]||0)+1;await this.state.storage.put("usage",usage);
      return json({ok:true});
    });
  }
}
const prompt=`You are a careful meal-photo observer for Neural Orchard Nourish Me. Return only a JSON object. No medical predictions. Do not estimate precise grams or calories. Never infer hidden oils, whole grains or salt from appearance. Respect cuisines. Output: {"imageUsable":boolean,"completeMeal":boolean,"clinicalOverride":false,"foods":["..."],"domains":{"produce":[integer permitted scores 0..3],"fiber":[integer permitted scores 0..3],"protein":[integer permitted scores 0..2],"fat":[integer permitted scores 0..2]},"uncertainty":"short plain-language reason","strengths":"one factual sentence grounded in visible foods","question":"one high-impact clarification question if necessary, else empty string"}. Domain values are plausible alternatives, not confidence. Produce: 0 none,1 small under 1/6,2 1/6 to under 1/3,3 >=1/3 edible volume; fruit/vegetables only, exclude legumes/starchy roots. Fiber: 0 none/refined only,1 nuts/seeds or minor whole grain/pulses,2 modest whole grain/pulses or substantial intact tuber,3 whole grain/pulses main >=1/4. Protein: 0 none,1 incidental or red/processed meat only,2 substantial legumes/soy/fish/egg/dairy/poultry/plant protein. Fat: 0 confirmed predominant butter/ghee/coconut/palm/animal fat,1 confirmed mixed/dairy-dominant,2 confirmed predominant unsaturated fat OR confirmed low-fat recipe without substantial saturated fat. If cooking fat unknown, include all plausible values. A photo cannot confirm oil identity. If incomplete eating occasion or unidentifiable, completeMeal=false or imageUsable=false. If user supplied clarification, incorporate it without claiming visual proof. If high uncertainty, ask one question. Avoid invented certainty.`;
export default {async fetch(request,env){
  const origin=request.headers.get("Origin")||"";const allowed=env.ALLOWED_ORIGIN||"";
  if(!allowed||origin!==allowed)return json({error:"Origin not allowed"},403);
  if(request.method==="OPTIONS")return new Response(null,{headers:{"access-control-allow-origin":allowed,"access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"content-type","access-control-max-age":"600"}});
  if(request.method!=="POST"||new URL(request.url).pathname!=="/analyze")return json({error:"Not found"},404,allowed);
  let user;try{user=await accessUser(request,env);}catch(e){return json({error:"Pilot sign-in required."},401,allowed);}
  if(!env.GEMINI_API_KEY||!env.USAGE_GATE||env.PILOT_ENABLED!=="true")return json({error:"Pilot backend is not enabled."},503,allowed);
  const len=Number(request.headers.get("content-length")||0);if(len>3_000_000)return json({error:"Image request too large"},413,allowed);
  let input;try{input=await request.json();}catch{return json({error:"Invalid JSON"},400,allowed);}
  if(!["image/jpeg","image/png","image/webp"].includes(input.mimeType)||typeof input.imageBase64!=="string"||input.imageBase64.length>2_500_000||!/^[A-Za-z0-9+/]*={0,2}$/.test(input.imageBase64)||input.imageBase64.length<100)return json({error:"Invalid image"},400,allowed);
  const clarification=typeof input.clarification==="string"?input.clarification.slice(0,400):"";
  const gate=env.USAGE_GATE.get(env.USAGE_GATE.idFromName("pilot-global"));const approved=await gate.fetch("https://usage/check",{method:"POST",body:JSON.stringify({user})});
  if(!approved.ok)return json({error:"Daily pilot usage limit reached."},429,allowed);
  const model=env.GEMINI_MODEL||"gemini-2.5-flash";
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),18000);
  try{
    const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(model)+":generateContent",{method:"POST",signal:controller.signal,headers:{"content-type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt+(clarification?" User clarification: "+clarification:"")},{inline_data:{mime_type:input.mimeType,data:input.imageBase64}}]}],generationConfig:{responseMimeType:"application/json",temperature:0.1,maxOutputTokens:1100}})});
    if(!response.ok)return json({error:"Meal analysis service is temporarily unavailable."},502,allowed);
    const data=await response.json();const raw=data.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("");if(!raw)throw Error("Empty response");
    const observation=JSON.parse(raw);const score=scoreMeal(observation);
    if(score.kind==="clarify"&&!clarification)return json({status:"clarify",question:String(observation.question||"Can you tell us what the main ingredients and cooking fat were?").slice(0,250),foods:observation.foods||[],message:"A detail will help avoid guessing your score."},200,allowed);
    const finalScore=score.kind==="clarify"?{kind:"score-free",reason:"Too much uncertainty remains for a reliable score."}:score;
    const foods=Array.isArray(observation.foods)?observation.foods.filter(x=>typeof x==="string").slice(0,12):[];
    return json({status:"result",score:finalScore,foods,strengths:String(observation.strengths||"Thank you for reflecting on your meal.").slice(0,300),tweak:oneTweak(finalScore,observation),encouragement:"One meal is one moment; your patterns matter more.",disclaimer:"Educational meal-composition reflection; not medical advice or a validated clinical score."},200,allowed);
  }catch(e){return json({error:"We couldn't analyze this photo. Please try again later."},502,allowed);}finally{clearTimeout(timer);}
}};
