# Neural Orchard pilot — email feedback and Sentinel instructions QA

**Not release ready**. No provider-authorized end-to-end email send, private host, or browser screenshots available from source-only development.

| Requirement | Evidence | Status |
|---|---|---|
| Five approved Sentinel n-back instruction texts | Static source and JS syntax | Source PASS |
| All five example rules match `sequence[sequence.length-span]` | Source comparison | Source PASS |
| Portrait instructions accessible, landscape gameplay unchanged | Scoped CSS | Implemented, visual QA pending |
| Existing six feedback questions and option strings | Exact `neural-orchard-feedback.js` content | Source PASS |
| Separately confirmed consent before feedback | Client source | Implemented, browser test pending |
| No real feedback submitted by default | Fail-closed client and disabled Worker flags | Source PASS |
| Strict server-side fields, 500-character comment cap | Existing `feedback-service/src/validate.js` reused | Source PASS |
| Email sending to approved founder address | Missing address/provider setup | BLOCKED |
| Synthetic email delivered end-to-end | Provider not provisioned | NOT TESTED |
| Server global rate limiter | Binding required | Source implemented, Cloudflare QA pending |
| Optional skip, retained answers on network errors | Client source | Browser QA pending |
| Both return buttons after feedback | Existing markup with exact routes | Source PASS |
| iPhone/Android/tablet/desktop visual screenshots | Browser QA needs private runnable preview | NOT TESTED |
| Existing gameplay, audio, saved progress, assets untouched | Sentinel JavaScript outside instruction function byte-identical; other game source unchanged in scoped diff | Source PASS; browser regression pending |
| Production stays unchanged | GitHub ref comparison | Pending final ref check |

## Release gate
Require founder approval of provider, recipient, staging, and any costs before configuring email. Then test secure synthetic inbox delivery and fully test both games at actual mobile/desktop sizes. Require a second explicit approval before any real participant feedback, public endpoint or production release.

## Synthetic source/runtime checks completed 2026-11-15

- Five Sentinel instruction examples verified against actual n-back logic `sequence[sequence.length-span]`: **5/5 passed**. Titles, observation, task, self-check, explanation and no-match instruction present.
- Background `#24160F` with text `#F8EBD7` has computed nominal contrast approximately **14.92:1** before any transparency/overlays. Mobile portrait instruction access is implemented using a scoped `:has(.instruction-card)` selector; actual device rendering remains untested.
- Original Sentinel game JavaScript outside the instruction function matches the pre-change development commit; no logic, audio, progress, match-control handler or scoring function was rewritten.
- Email Worker synthetic mocked tests: **10/10 pass**, covering disabled public route, wrong QA token, untrusted origin, accepted synthetic message, only allowlisted content, injected nickname rejection, invalid choice rejection, overlong comment rejection, missing email-provider receipt, and limiter rejection.
- These tests used a fake provider acknowledgement and fake runtime; **no email was sent and no private staging host exists**. The committed `feedback-email/tests/worker.test.mjs` is a reproducible Node test suite, but actual Cloudflare runtime, binding, inbox delivery, origin and rate limiting still require integration QA.
- No screenshot of actual Sentinel panels has been captured from this isolated Codespaces environment. Do not present mock renderings as actual UI validation.
- Real collection remains disabled in Worker and in the GitHub Pages feedback client by default.

## Provider retention/privacy finding
Cloudflare Email Service's Activity Log may show message metadata, authentication and delivery details. Email preview is reportedly ON by default on newly onboarded sender domains and may retain message content approximately seven days. Disable Email preview unless explicitly needed for synthetic debugging, and document any provider logging/backup retention. Receiving mailbox storage and backups may retain comments much longer; negotiate and implement founder deletion/retention rules before real launch.
Sources: https://developers.cloudflare.com/email-service/observability/logs/ and https://developers.cloudflare.com/email-service/configuration/domains/

## Approval prerequisites
1. Confirm founder's exact approved recipient email address and approved sender domain.
2. Approve Cloudflare Email Service for a single verified destination, including necessary DNS/domain and billing changes (if any).
3. Approve a **private** synthetic-test Worker location and QA credential; **do not** expose QA secrets in public JavaScript.
4. Verify a real synthetic inbox delivery, audit provider logs, test both games at desktop/mobile viewports, capture required screenshots.
5. Explicitly approve public feedback collection and later production deployment separately.
