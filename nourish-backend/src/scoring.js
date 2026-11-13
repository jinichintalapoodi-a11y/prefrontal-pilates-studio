// Nourish Score v0.2-research — educational meal-composition heuristic, NOT a validated instrument.
export const DOMAINS = Object.freeze({produce:3,fiber:3,protein:2,fat:2});
export function scoreMeal(observation) {
  if (!observation || observation.completeMeal !== true || observation.imageUsable !== true || observation.clinicalOverride === true) return {kind:"score-free",reason:"Meal suitability or completeness is not established."};
  const ranges = {}; let min=0,max=0;
  for (const [key,limit] of Object.entries(DOMAINS)) {
    const values=observation.domains?.[key];
    if(!Array.isArray(values)||!values.length||values.some(v=>!Number.isInteger(v)||v<0||v>limit)) return {kind:"score-free",reason:"Insufficient reliable information for scoring."};
    const low=Math.min(...values),high=Math.max(...values);ranges[key]=[low,high];min+=low;max+=high;
  }
  // Domain ranges may overstate possible totals when ingredients are correlated.
  // Only display a score when the submitted scenario bounds have been explicitly reviewed.
  if(observation.scenarios?.length){
    const totals=observation.scenarios.map(s=>Object.entries(DOMAINS).reduce((sum,[k,limit])=>{
      const v=s[k];if(!Number.isInteger(v)||v<0||v>limit)throw Error("Invalid scenario");return sum+v;
    },0));
    min=Math.min(...totals);max=Math.max(...totals);
  }
  const width=max-min;
  return {kind:width===0?"exact":width<=2?"range":"clarify",min,max,ranges,reason:observation.uncertainty||"Some ingredients or portions are uncertain."};
}
export function oneTweak(result,observation){
  const r=result.ranges||{};
  if(r.produce?.[1]<2)return "Consider adding a vegetable or whole fruit you enjoy.";
  if(r.fiber?.[1]<2)return "Next time, try adding a fiber-rich staple, such as beans or a whole grain.";
  if(r.fat?.[1]===0)return "When practical, try a liquid plant oil instead of butter or ghee.";
  if(r.protein?.[1]===0)return "Consider including a protein food that suits your preferences.";
  return "Next time, consider trying a different seasonal vegetable you enjoy.";
}
