# Neural Orchard MVP 1.1 — Architecture, Data Dictionary, Privacy Model & Implementation Plan

**Status:** Founder-approved direction, DESIGN ONLY; implementation, live analytics, data collection and deployment NOT authorized.
**Prepared:** 2026-11-13.
**Source:** production `main` at `b94d62c263d606c6ea48d1a33d83f346e890c02d`.
**Design branch:** `feature/registration-mvp-v1` (historical branch reused for documentation only).
**Previously approved hotfix:** `hotfix/stargazer-exit-buttons-v1` at `16eb9bdede506c230fc0805539721078dc5aa313` — requires reviewed reconciliation into implementation baseline.
**Supersession:** `registration/ARCHITECTURE-AND-QA.md` describes an earlier mandatory-email proposal and is retained as HISTORICAL/SUPERSEDED FOR MVP 1.1. Do not implement that flow for this beta.

## 1. Source audit and limits
- Production `index.html`: no participant identity UI, no signup, no analytics.
- `Stargaizer.html`: existing `stargazerLevel` saved locally when level increases; observation, color challenge and constellation retracing; practice ending and round events must be separately identified.
- `Sentinel.html`: existing `sentinelLevel` saved locally as levels advance; `startWatch`, `endWatch`, retry and explicit exit paths; game-level completion is NOT identical to an overall practice completion.
- `pps-session.js`: key `ppsDailyPracticeV1` stores current date, today's milliseconds and farewellShown, not full session history. Does not establish historical session counts.
- No reliable historical session totals, completion rates or cross-day performance history can be reconstructed. Do not backfill inferred events.
- Historical `feature/nourish-pilot` has `nourish-backend/src/worker.js` with a Cloudflare Access JWT guard and an unrelated Gemini integration. Its security concepts may inform a new, distinct Worker; do not fork runtime code or reuse endpoint, keys, secrets or bindings.

## 2. UX and local-only identity
First visit: preserve Neural Orchard's wisteria landing design, title, tagline **A celebration of becoming.** Add a lightweight onboarding layer: “What would you like us to call you?”, optional nickname, explicit “No email, full name, or password required”, concise privacy link, unchecked opt-in analytics checkbox, primary **Enter Neural Orchard**, and **Skip for now**. Neither nickname nor consent can block entry; blank nickname gets neutral welcome. Preserve existing dashboard cards and disabled Coming Soon experiences.

Returning device/profile: “Welcome back, {nickname}.” only when a saved nickname exists; otherwise “Welcome back.” Nickname is device-local and must never enter telemetry, URLs or logs. Limit and sanitize nickname as text (e.g. max 40 Unicode grapheme clusters), escape as textContent, never HTML.

My Progress: new dashboard entry. Show current Stargazer and Sentinel levels from existing keys as “Previously saved level”; show NEW tracked sessions, totals, daily dates and trends only from new schema. Clear distinction: “Session history is recorded starting with MVP 1.1 on this browser.” Provide empty states and exact calculations; avoid clinical labels. Show privacy controls, consent status, local clear with confirmation. Clearing MVP 1.1 local profile/history must never inadvertently clear `stargazerLevel`, `sentinelLevel`, or `ppsDailyPracticeV1`; if offering a broader erase of legacy game progress, require a separate explicitly labeled opt-in and confirmation.

## 3. Versioned browser storage dictionary

| Key | Type / fields | Purpose / source | Transmission |
|---|---|---|---|
| `stargazerLevel` | existing integer | Historical game level; PRESERVE as-is | Only consensual derived level event, never raw storage |
| `sentinelLevel` | existing integer | Historical game level; PRESERVE as-is | Only consensual derived level event |
| `ppsDailyPracticeV1` | existing `{date,ms,farewellShown}` | Daily wellbeing gate; PRESERVE as-is | Never upload raw object |
| `neuralOrchardProfileV1` | `{schemaVersion:1,nickname:string,onboardingSeen:boolean}` | Optional local display name | NEVER |
| `neuralOrchardConsentV1` | `{schemaVersion:1,analytics:boolean,updatedAt:string,noticeVersion:string}` | Explicit optional analytics choice; default false | Consent status only controls transport; not central participant profile |
| `neuralOrchardProgressV1` | `{schemaVersion:1,sessions:[],dailyTotals:{},lastUpdatedAt}` | NEW accurately measured game sessions and dates | Local data not bulk-uploaded |
| `neuralOrchardAnalyticsV1` | `{schemaVersion:1,installId?:UUID,queue:[],lastConsentVersion:string}` | Created only after affirmative consent; short-lived allowed event queue | Approved schema only |

Suggested `sessions[]`: `{sessionId:UUID,game:'stargazer'|'sentinel',startTimeISO,endTimeISO?,elapsedActiveMs?,outcome:'completed'|'exited'|'interrupted',levelAtStart?:number,levelAtEnd?:number}`. Do not count a session as complete based on a finished round alone. Define game-specific completion explicitly and test its triggers. A reload/crash can become local interrupted after next startup, but should not fabricate an exit event. Session timing should pause for hidden tabs and resume on visible state; clock jumps need defensive handling. Define bounded local retention and aggregation (e.g. max 90-day daily buckets and a capped 200-session list); avoid unbounded localStorage.

Migration: never mutate the three legacy keys; read defensively, clamp for display ONLY, add new keys atomically with schema version guards. If malformed new data, show error/recovery and don't erase legacy data. Existing levels are not historical sessions. Clearing browser data or another browser/device loses local information; no verified person identity exists.

## 4. Proposed consent-first event dictionary (not implemented)

`schema_version` integer, required (=1);
`event_id` UUID, required for idempotent ingestion;
`event_type` enum: `game_started`, `game_completed`, `game_exited`, `level_reached`, `usability_error`;
`game` enum `stargazer`|`sentinel`, required;
`occurred_date` YYYY-MM-DD UTC or locally derived day (document which; prefer server-derived UTC);
`level` integer game-validated range;
`duration_bucket` enum `under_1m`|`1_3m`|`3_5m`|`5_10m`|`10m_plus`|null, if measured accurately;
`error_code` fixed allowlist, only for usability_error;
`installation_id` UUID, ONLY if separately needed for opted-in longitudinal analysis; never nickname/email/full name.
No raw constellation selections, sentinel positions, precise event location, precise user-agent, IP, cookies, personal text, raw session timeline or user-supplied arbitrary fields. Use allowlist validator and fixed payload size limits. Consider a session-level UUID only if needed to deduplicate started/completed events; avoid sending it for MVP if aggregate-only counts suffice.

Consent default OFF; on consent, initialize ID only if truly necessary; collect no historical backfill. No outbound analytics POST, keepalive, beacon, image ping or analytics queue before consent. On withdrawal: atomically disable sending, drop queued events, discard installation ID unless needed for deletion request and explicitly retained with consent, and prevent in-flight retries. A request already sent cannot be recalled; a deletion flow should use a server-generated revocation/deletion token or authenticated possession proof, not just a publicly known UUID. Without a durable verification token, promise no guaranteed deletion of prior pseudonymous records. Only store necessary event aggregates.

Illustrative SYNTHETIC payload (never real participant data):
```json
{"schema_version":1,"event_id":"00000000-0000-4000-8000-000000000001","event_type":"game_completed","game":"stargazer","level":3,"duration_bucket":"3_5m"}
```
If longitudinal retention is approved, add a fresh random UUID (not derived from nickname/device fingerprint) after consent; document that this is pseudonymous, not anonymous.

## 5. Backend recommendation

**Recommended:** separate Cloudflare Worker + D1 (or Worker Analytics Engine if only irreversible aggregates are needed), completely separate from Nourish Me deployment. A dedicated route `POST /v1/analytics/events` validates strictly, rate-limits, filters CORS origin, sets no analytics cookies, and writes only permitted fields. Treat CORS as browser boundary, **not authentication**; malicious scripts can fabricate events. Apply abuse caps; use Turnstile only if necessary and with privacy/UX review. Avoid reporting event totals as unique people. Use separate D1 `events` table with scheduled deletion at proposed 30 days and aggregated daily metrics retained 90 days, pending founder review and applicable law. Implement deletion by a secure per-install secret and server-side request protocol if longitudinal data are retained; aggregate-only deletion may be technically impossible after identifier removal.

The founder dashboard is separately hosted behind strong admin authentication (Cloudflare Access or equivalent) with MFA, no admin secret in GitHub Pages. Backend checks authorization on every request before querying D1. For 8–12 testers, default to aggregate overview with no date-by-user paths; suppress count breakouts for any group smaller than 5 (proposed `k=5`), suppress complementary cells, and permit time bucketing weekly instead of daily. If all participants have opted out, show “Insufficient consented data,” not zero usage. Counts describe consenting usage only. Founder screens: consented sessions, game split, completion counts/rates where denominator explicitly defined, level distribution only when cell sizes are safe, repeat *installations* where consented and identifiable only pseudonymously, error categories.

Host technical reality: GitHub Pages is public; front-end access is not restricted by this design. Hosting/CDN/Cloudflare may still transiently process IP, TLS info and browser headers during requests. Audit and minimize access logs, analytics telemetry, sampling and retention in provider dashboards; do not claim absolutely no provider-side metadata.

Cloudflare's Analytics Engine documented 3-month retention (as of Nov 2026) makes granular deletion unsuitable for a strict deletion promise. Cloudflare D1 can implement per-row deletion with audited SQL if secure possession proof is implemented, but backups and infrastructural log retention must be disclosed.

## 6. Proposed interfaces (text wireframes only; existing styling retained)

Onboarding:
```
WELCOME TO
Neural Orchard
A celebration of becoming.

What would you like us to call you?
[ Preferred nickname (optional)           ]
No email address, full name, or password required.

[ ] I agree to share limited game-use statistics to help improve Neural Orchard.
    Optional. You can change this choice any time.
[ Read privacy details ]
[ Enter Neural Orchard ]    [ Skip for now ]
```

Returning home:
```
Welcome back, Jane.    [ My Progress ] [ Privacy Settings ]
[ Existing Studio / Nourish Me / Sleep Sanctuary / Breathe cards unchanged ]
```

My Progress:
```
My Progress                      [ Return to Neural Orchard ]
Stargazer — saved level 3     Sentinel — saved level 2
Sessions recorded since MVP 1.1: 4
Practice dates: [new observations only]   [recent trends / empty state]
Privacy & Data [Analytics consent: Off] [Clear MVP 1.1 local data…]
```

Founder dashboard: [MFA-protected] aggregate counts, game split, completion rate, level distribution, return *installation* engagement, suppressed small cells, errors, retention notices. Never show nicknames or individual-level timelines.

## 7. Phased implementation gates (NO CODE AUTHORIZED)
1. Founder approves this architecture, precise definitions of completed/exited, data retention, the role of pseudonymous IDs, deletion promises, analytics hosting and consent copy.
2. Reconcile and test `hotfix/stargazer-exit-buttons-v1` into an isolated successor of `feature/registration-mvp-v1` BEFORE game instrumentation; leave production untouched.
3. Build local-only nickname, consent/settings, progress screen and new versioned local store; retain exact legacy keys. Visual review at 1440×900 and 390×844.
4. Add narrowly scoped per-game start/end/level hooks with unit and browser tests; no change to game mechanics. Synthetic local fixtures to validate stats.
5. Implement isolated Worker + D1 in nonproduction, strictly allowlisted event schema, rate limiting, retention, per-install deletion if promised, protected founder reporting; use only synthetic events.
6. Verify no network telemetry before consent, after withdrawal or with nickname; simulate failing endpoints and offline queue, Browser Back/refresh, legacy progress and storage clear.
7. Desktop/mobile screenshots, consent acceptance, security tests, two-user separation where relevant, unauthorized founder access denied, rollback/kill switch; independent founder approval before live event collection or any production deployment.

## 8. Acceptance tests to execute in a real browser
- Initial nickname, blank nickname, returning greeting; safe text rendering and Unicode.
- Preserve all three legacy keys byte-for-byte for a returning device across onboarding/consent.
- Exact completion vs exit vs interruption counts for Stargazer and Sentinel.
- My Progress reads both saved levels, truthful day/session data, no invented historical observations, graphs correct.
- No analytics request in default/declined/skip flows; request starts only after opt-in; stop on withdrawal including queues; consent persisted.
- Network payload contains no nickname, email, raw stars/savanna content, fingerprint or exact user-agent; enforce server-side schema.
- Synthetic analytics and aggregate dashboard with k-suppression, complementary suppression and restricted access; revocation/deletion and TTL.
- Browser cache/localStorage erase; cross-device/profile no transfer.
- Desktop 1440×900 and mobile 390×844 visual testing; real touch, scroll, navigation, audio, gameplay and approved scientific exit messages.
- Production `main` unchanged, no live metrics enabled and no secrets committed.

## 9. Invitation privacy statement — DRAFT, DO NOT DISTRIBUTE BEFORE VERIFIED

"Neural Orchard welcomes you without requiring an email address, full name, or password. You may choose a nickname, or skip it. Your personal practice history is saved in this browser on your device; other participants cannot view it. You can optionally share limited gameplay statistics to help us improve Neural Orchard. This is entirely your choice, and declining does not limit the games. Founder reports show aggregated usage rather than personally identified profiles. You can change your analytics preference at any time. Clearing your browser data may erase your local progress. Review the in-app privacy notice for what is collected, how long it is kept, and deletion limitations."

Do not publish until testing confirms each statement, especially access control and withdrawal/deletion behavior.
