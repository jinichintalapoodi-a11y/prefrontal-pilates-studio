# Nourish Me — protected pilot deployment (NOT YET DEPLOYED)

The `feature/nourish-pilot` branch includes a photo UI, optional device-only score history, proposed deterministic Nourish Score v0.2-research logic, and a Cloudflare Worker implementation that calls Gemini server-side. The live GitHub Pages site remains unchanged.

## Important security and billing gates

1. Create a separate Cloudflare account/project and a Cloudflare Worker for the pilot. The Worker must be covered by **Cloudflare Access** with an explicit allow policy for individually invited testers. Protect the entire Worker hostname; do not publish the endpoint without Access.
2. Configure `ACCESS_TEAM_DOMAIN` (e.g. `team.cloudflareaccess.com`) and `ACCESS_AUD` (the Access application AUD tag) as Worker variables. The Worker cryptographically validates Access JWT signatures against the team's JWKS and checks audience, issuer, expiration and subject.
3. Store the Gemini key only with `npx wrangler secret put GEMINI_API_KEY` (from the `nourish-backend` directory). **Never commit a key.**
4. Verify `ALLOWED_ORIGIN` matches the actual GitHub Pages origin, currently `https://jinichintalapoodi-a11y.github.io`. Origin checking is additional browser protection, not authentication.
5. Cloudflare Durable Object `UsageGate` atomically enforces global and per-user request limits (defaults 50/day global, 5/day per tester). A clarification request counts as another request. Requests are charged against quota before calling Gemini. It is a usage ceiling, **not a hard dollar cap**. Check Cloudflare and Google billing separately.
6. Start with `PILOT_ENABLED=false`. Confirm Access works and unauthorized users are rejected, check actual Gemini model/pricing/quotas and available budget controls, then explicitly set `PILOT_ENABLED=true`.
7. After securing and deploying the Worker, replace `const ENDPOINT='';` in `NourishMe.html` with the Access-protected HTTPS Worker origin. Never add the Gemini key to frontend code. Access sign-in and cross-origin cookies may require testing in mobile browsers; consider a same-site reverse proxy if cookies are blocked.
8. Deploy the GitHub Pages frontend **only after** backend smoke tests, privacy review and approval.

## Pilot behavior

- Upload/camera → browser JPEG resize (1280px maximum dimension) → explicit consent → Worker → Gemini photo observations → deterministic four-domain score → reflection.
- If score uncertainty is greater than 2 points, request one clarification; unresolved uncertainty returns score-free feedback.
- Score breakdown A 0–3 produce, B 0–3 fiber-rich staples, C 0–2 protein source, D 0–2 fat composition. Proposed UX heuristic, **not validated clinical score**.
- Device-only opt-in history stores dates and exact scores/ranges, **not photos**. Trends currently show count, average of exact scores, and most recent reflection. They do not represent all meals eaten or population trends.
- The scoring function accepts permissible integer ranges and optional correlated scenarios. The Gemini prompt currently supplies domain ranges, not enumerated correlated scenarios, so conservative bounds can be wider than the actual feasible scenario range. This needs validation against labeled meals before expanding beyond pilot.
- Suggestions are rule-based, not currently personalized to dietary restrictions. **Do not use with known allergies or therapeutic diets without additional safeguards.** A clinical override flag must not be trusted as medical screening; the app is for general wellness only.
- The pilot currently provides fixed encouragement rather than fully personalized Gemini prose. The first version prioritizes reproducible scoring and controlled costs.

## Verification checklist

- Unauthenticated request → HTTP 401 / Cloudflare Access block.
- Incorrect origin → HTTP 403.
- Disabled pilot → HTTP 503.
- Invalid image → HTTP 400.
- Per-user/global limit → HTTP 429.
- No image retained in localStorage or Worker logs.
- 24 constructed meal fixtures and cultural fairness tests from the scientific foundation report must be independently checked.
- Verify Gemini model ID and request format against current Google API docs at deployment.
- Verify Cloudflare Worker runtime, Access JWKS verification, CORS/preflight, mobile camera and browser sign-in.
- Verify actual spend controls, rate-limit failure behavior, and incident shutdown.
- Do not assume repository code has been deployed or end-to-end tested.
