# Neural Orchard — isolated founder feedback service (NOT DEPLOYED)

## Scope and architecture
- Separate Cloudflare Worker + **dedicated D1 feedback database**, distinct from aggregate game analytics and historical Nourish Me Worker.
- Admin HTML, JS, CSS and APIs are served ONLY after signature-validated Cloudflare Access JWT checking issuer, audience, expiry and allowed founder email. Configure Cloudflare Access with MFA and a single-authorized-user allow policy **before assigning any route**. A hidden URL is not security.
- `GET /founder`, `GET /api/admin/feedback?game=all|stargazer|sentinel&period=all|7d|30d|90d`, `GET /api/admin/export.csv`, `DELETE /api/admin/feedback/:id`, and `DELETE /api/admin/feedback` are private and must pass server-side Access verification.
- `POST /api/qa/seed` accepts **synthetic submissions from the founder only**, under `ENABLE_SYNTHETIC_QA=true`. Never send real participant answers to QA.
- `POST /api/feedback` returns 503 while `ENABLE_REAL_FEEDBACK=false`. **Do not enable or expose a public submission route without separate founder approval**, an updated privacy notice, provider logging review, abuse controls, end-to-end testing, and a new deployment review.
- Daily scheduled handler removes rows `expires_at <= NOW`, 90 days from server receipt; founder can delete earlier. The 90-day policy applies to application table records, **not automatically to D1 backups, provider security logs or downloaded CSV exports**. Review and document those separately.
- `feedback.id` is generated server-side per submission, for administration only. It is NOT a persistent participant/session/installation identifier.
- Database stores only game, three exact choices, three optional written answers, server timestamp and expiration. No nickname, email, phone, local progress, IP, user-agent, raw game sequence, identifier cookie or analytics data.
- Comments may voluntarily contain identifying details. Never promise absolute anonymity; avoid copying comments to third-party services. The founder-auth JWT necessarily identifies the **administrator only**, not participants.
- Static GitHub Pages hosts the game frontend; **never** host this founder dashboard, D1 credentials or Access secrets there.

## Dev/test setup (not yet performed)
1. Obtain explicit approval for **private staging setup**, Cloudflare account access, spending controls, allowed admin account and MFA policy.
2. Create a **new** staging D1 DB, run `migrations/0001_feedback.sql` with Wrangler, configure the D1 binding in a local untracked `wrangler.toml`, and set protected Access configuration. The example is deliberately non-deployable.
3. Configure Cloudflare Access on a staging hostname, restricting all dashboard and admin routes, and ensure Cloudflare Access is in front of the Worker. Verify Access JWT validation using real tokens and verify unauthorized 403 responses.
4. Configure daily cron at `0 3 * * *` UTC; verify expiry with synthetic records, including forced past-date fixtures and backup/log retention.
5. Keep `ENABLE_REAL_FEEDBACK=false`. Use authenticated `POST /api/qa/seed` to add explicitly fabricated records; verify founder dashboard filters, text output escaping, CSV escaping and deletion.
6. In a **private same-origin** browser preview, configure `window.NeuralOrchardFeedbackConfig={enabled:true,syntheticOnly:true,endpoint:'/api/qa/seed'}` before loading the feedback JS. Only Access-authenticated founder QA sessions can submit. GitHub Pages default remains blocked/off.
7. Capture actual desktop/mobile screenshots and network traces. Verify no additional participant or analytics data leave the game, including on skip.
8. Stop. Request founder approval separately before any public submission route, production merge, DNS change, real feedback or analytics activation.

## Known limitations / blockers
- No private Cloudflare QA deployment exists from this branch. **No working private dashboard URL or authentic access test can be claimed.**
- Cloudflare WAF/rate limiting, bot protection, Access MFA, protected hostname and provider log minimization require account-level configuration and testing. CORS alone is not abuse protection or authentication. The public endpoint must remain disabled pending these checks.
- Cross-origin embedding from GitHub Pages with Access authentication may be blocked by third-party cookie restrictions. Prefer a same-origin private QA site; do not relax cookie security.
- Pending replies whose acknowledgement is lost can be re-submitted and may create duplicate records; the UI disables rapid repeated clicks, but server-side deduplication cannot reliably identify true duplicates without storing additional data. This is an intentional privacy tradeoff.
- Dashboard listing currently limits to 1,000 rows; pilot traffic should remain well below this. Avoid claiming full export beyond this cap.
- Fewer than 8–12 participants can be inferred from written text even without participant identifiers. Confidentiality and export-device protection still matter.

## Tests
Run `npm test` in this directory for validator/test-fixture checks. Browser and Cloudflare staging integration tests are required separately. See `TEST-PLAN.md`.
