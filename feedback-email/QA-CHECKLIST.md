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
| Existing gameplay, audio, saved progress, assets untouched | Diff review required | Pending final diff |
| Production stays unchanged | GitHub ref comparison | Pending final ref check |

## Release gate
Require founder approval of provider, recipient, staging, and any costs before configuring email. Then test secure synthetic inbox delivery and fully test both games at actual mobile/desktop sizes. Require a second explicit approval before any real participant feedback, public endpoint or production release.
