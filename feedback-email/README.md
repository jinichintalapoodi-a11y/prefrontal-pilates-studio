# Pilot feedback by email — separate, disabled implementation

## Important status
**No recipient address, sending domain or paid service has been approved or configured. No private staging endpoint is running.** This source is not a live submission service. `ENABLE_EMAIL_FEEDBACK` and `ENABLE_SYNTHETIC_EMAIL_QA` are off by default; do not change these without founder authorization.

The earlier `feedback-service/` Cloudflare D1 founder dashboard code remains intact and **deferred/inactive**. Never deploy both submission paths simultaneously. The pilot uses an email-only Worker, without D1 or participant accounts.

## Recommended service and why
Cloudflare Email Service Workers `send_email` binding is preferable to a separate third-party email API for a single founder inbox. Restrict the binding with `destination_address` to the founder's verified approved destination. Use server-side `env.EMAIL.send({to,from,subject,text})`; no API key is present in GitHub Pages code. Cloudflare must verify the sender domain and recipient destination. Verified-destination sends have special free allowances (check current terms and account eligibility); full outbound service may need Workers Paid. Do not make billing commitments without approval.

Sources:
- https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- https://developers.cloudflare.com/email-service/configuration/send-bindings/
- https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

## Data and delivery
- Server-side exact allowed fields: `game`, `enjoyment`, `challenge`, `replay`, `enjoyed_most`, `improvements`, `difficulties`.
- All three comments optional, each at most 500 Unicode code points. No nickname, name, email, gameplay history, installation/device/session ID, location, raw user-agent or IP field.
- The email contains the game, the existing exact participant-facing ratings/questions, optional comments and UTC server receipt time.
- Provider `messageId` proves acceptance for sending, **not inbox delivery**. Browser success says "accepted for delivery" only after response.
- Failed requests preserve participant answers; a retry after a lost acknowledgment can duplicate an email. No cross-session deduplication/participant tracking is introduced.
- No feedback database is used. Email inbox and sending provider retain text/message metadata; review sender/recipient logs, spam folders, mailbox retention, backup policies, security and deletion before real collection.
- HTTPS only after a properly reviewed private staging setup. Browser requests are off until a separately configured trusted endpoint is supplied.
- Reject origins other than the allowlisted frontend; CORS is not authentication or anti-abuse protection. A coarse global rate-limit binding uses a constant key, not IP/user/device. It is only a modest safeguard and is limited per Cloudflare location; additional edge abuse measures require privacy review.

## Synthetic QA (not performed with actual provider)
1. Founder confirms recipient inbox and explicitly approves Cloudflare Email Service. Confirm account, verified destination, domain, billing and recipient restrictions.
2. Approve an isolated private QA hostname, secure `QA_TOKEN` secret and temporary permitted origin. Do not put the QA token in browser code or URLs; perform synthetic tests using an authenticated terminal under controlled conditions.
3. Copy `wrangler.toml.example` locally, replace placeholders in an **untracked** config, set environment secrets and bindings without committing them. Never configure real collection at this stage.
4. Keep `ENABLE_EMAIL_FEEDBACK=false`. Enable `ENABLE_SYNTHETIC_EMAIL_QA=true` only for private synthetic testing after authorization.
5. Send a synthetic, valid POST to `/api/qa/email` with `Origin`, `Content-Type: application/json` and `X-Pilot-QA-Token` (not logged). Verify provider acceptance and the expected synthetic email in the founder's approved test inbox.
6. Test wrong/missing token, missing consent at frontend, malformed/extra fields, failure/retry, correct game labels, rate limit and both return links.
7. Collect real browser screenshots of the five Sentinel instruction panels on desktop 1440×900 and phone 390×844, plus feedback screens. Check mobile portrait instructions and gameplay landscape prompt.
8. Stop for founder approval. Public `/api/pilot-feedback` remains disabled; do not activate real participant feedback or deploy to production.

## Synthetic redacted email sample (NOT actually sent)

Subject: Neural Orchard — Stargazer pilot feedback (SYNTHETIC QA)

Neural Orchard — Pilot Feedback
Game: Stargazer
Received (UTC): 2026-11-15T12:00:00.000Z

How much did you enjoy this game?
Loved it

How did you find the level of challenge?
Just right

Would you like to play this game again?
Yes

What did you enjoy most about this game?
[synthetic: star patterns]

What would make this game more interesting or enjoyable?
[synthetic: clearer starting cue]

Was anything confusing, frustrating, or difficult to use?
[synthetic: no issues]

No participant contact information or game history is attached. This example is mock content, not a delivered email.
