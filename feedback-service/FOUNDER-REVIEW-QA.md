# Neural Orchard MVP 1.1 — Secure Feedback Development QA

**Scope:** Founder feedback only, separate from gameplay/aggregate analytics.
**Status:** Source implementation and synthetic mocked-runtime QA complete; **private Cloudflare staging, browser acceptance, MFA validation and deployment NOT completed**.
**Branch:** `feature/neural-orchard-mvp-1-1-development`.
**Base production checked before work:** `1251c7725b75896c26765adbf77f7a51527b86f4`.
**Navigation baseline:** `acf8ae8962cd33347a25bc6896f6a35317d00b95` preserved.
**Production authorization:** none.

## Code changes
- `neural-orchard-feedback.js`: six questions preserved verbatim with all original choice values, optional comments, explicit separate affirmative feedback consent and browser confirmation, game from page URL (Stargaizer/Sentinel only), server-acknowledged receipt, retry preserving answers, pending-submit lock, skip, always-present two navigation buttons. Fails closed with default no endpoint. Only a **private same-origin staging host with a founder QA configuration** may call `/api/qa/seed`. No real production collection configured.
- `feedback-service/migrations/0001_feedback.sql`: separate D1 table for game, three enum ratings, three comments, server-generated feedback ID/date/expiry, no participant/session/installation ID, IP or user agent.
- `feedback-service/src/validate.js`: exact allowlist, 500-character optional comments, rejects all unlisted fields.
- `feedback-service/src/access.js`: signed Cloudflare Access JWT verification (RS256 via JWKS, issuer/audience/expiration/founder email); only admins may access dashboard and QA API. Verify actual MFA application policy separately.
- `feedback-service/src/worker.js`: fail-closed public submission (503), admin JWT-protected dashboard, filtered reads, record deletion, confirmed bulk deletion, authorized CSV, synthetic admin-only QA seed, scheduled 90-day expiry purge.
- `feedback-service/src/dashboard.js`, `dashboard-app.js`, `dashboard-app-asset.js`: responsive standalone founder dashboard, filter by game and 7/30/90-day range, ratings, separately filtered comments, full individual feedback, CSV and deletion. Comments rendered with textContent (no HTML interpretation).
- `feedback-service/wrangler.toml.example`: deliberately non-deployable template with placeholder D1/hostname, Workers subdomain disabled, actual deployment requires explicit account setup.
- `feedback-service/README.md`, `TEST-PLAN.md`, `tests/feedback.test.mjs`: steps, boundaries, test fixtures, security gates.

## Actual tests performed in tool runtime (synthetic mocks, not Cloudflare)
13 checks PASS:
1. Valid synthetic Stargazer payload accepted by validator.
2. Email, nickname, installation ID, session ID, IP fields rejected.
3. Public feedback POST returns 503 when disabled.
4. Unauthenticated dashboard rejected.
5. Unauthenticated admin read rejected.
6. Unauthenticated QA write rejected.
7. Authenticated synthetic QA insertion returns receipt.
8. Insertion with unexpected identity field rejected.
9. Exactly one synthetic row inserted.
10. Filtered founder listing returns expected record.
11. CSV includes expected synthetic data.
12. Authenticated founder dashboard HTML allowed by mocked guard.
13. Record deletion and scheduled expiry both remove expected rows (tested as separate assertions; see testing source).

**Mock limitations:** Access JWT authorization was replaced with a mock returning success/failure; actual RS256/JWKS/MFA and cookie policies were not exercised. D1 prepared statements were modeled in memory; actual D1 transaction semantics, quotas and cron scheduling were not exercised. No actual gameplay/feedback browser integration testing, screenshots, responsive testing or HTTPS hosting was performed.

## Security findings and release blockers
- **Correct design:** Public GitHub Pages cannot securely host the admin dashboard or private feedback. Worker serves it only after signed Access JWT checks plus founder email restriction.
- **Blocked by default:** Real POST /api/feedback responds 503 until `ENABLE_REAL_FEEDBACK=true` is separately authorized. QA POST /api/qa/seed requires authenticated founder AND flag `ENABLE_SYNTHETIC_QA=true`.
- **Unconfigured in this environment:** Cloudflare account, MFA Access policy, D1 binding, deployment hostname, protected session setup, private QA URL, WAF rate limiting, provider logging and backup retention/deletion. Do not interpret source implementation as operational security.
- **Confidentiality caveat:** Voluntary written comments can include identifiers. Founder CSV exports and provider backups can extend retention beyond app-record deletion; founder must define secure export handling and provider backup retention.
- **Duplicate caveat:** One pending client submission at a time; lost server acknowledgement may permit a duplicate retry. No persistent participant or session ID is used to deduplicate across retries.
- **Data minimization:** No nickname, full name, email, phone, gameplay history, local progress key, IP, device fingerprint or raw user-agent is passed in feedback JSON. Admin JWT is for founder only.
- **Cross-origin:** Cross-origin Access authentication and cookie restrictions complicate GitHub Pages -> protected QA Worker. A **private same-origin staging environment** is recommended for full end-to-end tests. Do not use a public QA endpoint to work around this.
- **No live analytics consent coupling:** Feedback send confirmation separate from `neuralOrchardConsentV1`, which is never read by the feedback form.
- **Retention:** Application D1 feedback rows set `expires_at` to 90 days after server receipt, purged by daily cron when configured; backup/export/log handling needs separate audit.

## Pending founder acceptance checklist
- [ ] Founder signs in through real MFA-protected Access URL; unauthorized 403 test, expired JWT test, session expiry test.
- [ ] Private staging D1 created with schema; synthetic valid/invalid requests, exact field audit, rate limits and response codes.
- [ ] Full browser: optional skip, consent checkbox, simulated send/ack, timeout/retry with unchanged answers, duplicate double-click check.
- [ ] Android, iPhone, tablet, desktop: form scrolling and both navigation buttons at 1440×900 and 390×844 at minimum.
- [ ] Dashboard screenshots, filters, ratings, 3 comment panes, protected CSV, confirmation deletion, 90-day scheduled cleanup.
- [ ] Script injection comment displayed literally; CSV formula escaping verified in external spreadsheet application.
- [ ] Verify no real participant feedback or analytics is sent; browser developer network inspection.
- [ ] Verify game audio, scoring, artwork, progress keys and scientific exit wording remain unchanged.
- [ ] Review Cloudflare logs, IP metadata, backups, retention, access roles and billing limits.
- [ ] Separate founder review of preview and authorization for real collection, public endpoint, production merge and deployment.

## Hosting and costs
Cloudflare Workers and D1 have Free plan quotas for low-volume prototypes, subject to account configuration and limits. Current documentation lists Workers Free 100,000 requests/day and D1 Free 5 million rows read/day, 100,000 rows written/day, 5 GB aggregate storage and 10 databases, with limits enforced. A small synthetic beta may fit within these limits but **no cost guarantee or actual account billing check** has been performed. Cloudflare Access MFA, custom-domain requirements and security features should be verified in the founder's own account. Avoid activating paid products without consent.

## Private QA link
**Not available.** No Cloudflare account or private staging deployment was accessed; inventing a URL or describing one as working would be inaccurate. The founder can review the source files in GitHub. A real private dashboard link can only be issued after the founder authorizes and performs private staging provisioning and the required security checks.

## Approval checkpoint
Approve Cloudflare private staging prerequisites (account, isolated D1, Access/MFA policy, QA hostname, provider log controls) to enable actual synthetic browser QA. This does **not** authorize public submission, real participant feedback, production changes, or live analytics.
