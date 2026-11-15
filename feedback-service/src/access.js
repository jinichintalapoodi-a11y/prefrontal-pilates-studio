// Cloudflare Access JWT verification. Never trust a client-supplied identity header.
const enc=new TextEncoder();
function decode64(s){
 const decoded=atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'='));
 return Uint8Array.from(decoded,c=>c.charCodeAt(0));
}
export async function requireFounder(request,env){
 if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD||!env.FOUNDER_EMAIL)throw new Error('Admin access not configured');
 const token=request.headers.get('Cf-Access-Jwt-Assertion');
 if(!token)throw new Error('Access token required');
 const parts=token.split('.');
 if(parts.length!==3)throw new Error('Invalid token');
 let header,payload;
 try{header=JSON.parse(new TextDecoder().decode(decode64(parts[0])));payload=JSON.parse(new TextDecoder().decode(decode64(parts[1])))}catch(_){throw new Error('Malformed token')}
 const issuer='https://'+env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//,'').replace(/\/$/,'');
 if(header.alg!=='RS256'||!header.kid||payload.iss!==issuer||!(Array.isArray(payload.aud)?payload.aud.includes(env.ACCESS_AUD):payload.aud===env.ACCESS_AUD)||!payload.exp||Date.now()/1000>=payload.exp||payload.nbf&&Date.now()/1000<payload.nbf||!payload.email||payload.email.toLowerCase()!==env.FOUNDER_EMAIL.trim().toLowerCase())throw new Error('Unauthorized founder');
 const response=await fetch(issuer+'/cdn-cgi/access/certs',{signal:AbortSignal.timeout(5000)});
 if(!response.ok)throw new Error('Cannot validate Access token');
 const jwks=await response.json(),jwk=jwks.keys?.find(k=>k.kid===header.kid&&k.kty==='RSA');
 if(!jwk)throw new Error('Unknown Access signing key');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode64(parts[2]),enc.encode(parts[0]+'.'+parts[1])))throw new Error('Invalid signature');
 return true;
}
