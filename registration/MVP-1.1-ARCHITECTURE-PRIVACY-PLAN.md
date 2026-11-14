# Neural Orchard MVP 1.1 — Architecture, Data Dictionary, Privacy Model & Implementation Plan

**Status:** Founder-selected aggregate-only analytics direction; DESIGN ONLY. Implementation, live analytics, collection of real data, and deployment are NOT authorized.
**Prepared:** 2026-11-13. **Revised:** 2026-11-14 — aggregate-only analytics, no persistent transmitted participant/installation identifiers.
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
| `stargazerLevel` | existing integer | Existing game level; PRESERVE exactly | Never upload raw key/value; may report game-valid level bucket after consent |
| `sentinelLevel` | existing integer | Existing game level; PRESERVE exactly | Never upload raw key/value; may report game-valid level bucket after consent |
| `ppsDailyPracticeV1` | existing `{date,ms,farewellShown}` | Daily-practice gate; PRESERVE exactly | Never upload |
| `neuralOrchardProfileV1` | `{schemaVersion:1,nickname:string,onboardingSeen:boolean}` | Optional local greeting | NEVER |
| `neuralOrchardConsentV1` | `{schemaVersion:1,analytics:boolean,updatedAt:string,noticeVersion:string}` | Explicit optional choice; default OFF | Not uploaded as a participant profile; browser checks before every permitted request |
| `neuralOrchardProgressV1` | `{schemaVersion:1,sessions:[],dailyTotals:{},lastUpdatedAt}` | NEW practice activity recorded on this device | Never bulk-upload; no local history backfill |
| `neuralOrchardAnalyticsV1` | `{schemaVersion:1,noticeVersion:string}` | Non-identifying settings metadata only; **no installId, persistent pseudonym or cross-session event queue** | Never |

Suggested device-only `sessions[]`: `{localSessionId:UUID,game:'stargazer'|'sentinel',startTimeISO,endTimeISO?,elapsedActiveMs?,outcome:'completed'|'exited'|'interrupted',levelAtStart?:number,levelAtEnd?:number}`. **This localSessionId is never transmitted** and is solely for device-local progress accuracy. Complete versus exited versus interrupted require separate, tested game-specific definitions; successful rounds are not completed sessions. On reload/crash an unfinished local session may be recorded as interrupted locally without fabricating a server-side exit. Pause timing while page hidden; protect against clock jumps. Cap device-local history (proposed 90 days of daily totals and 200 recent sessions). Browser data clearance, profile switching and moving devices can remove or separate progress; device-local nickname is not a verified identity.

Migration: leave the three legacy keys byte-for-byte unchanged; read defensively and display valid existing levels distinctly from new session history. Add only separate versioned keys; do not manufacture historical counts, migrate local events to the server, or link local progress to any account. Confirm before clearing MVP 1.1 local profile/history; never erase existing gameplay keys as a side effect. A separate, explicit consent and confirmation would be needed if a future tool offers erasing legacy gameplay progress.

## 4. Proposed consent-first **aggregate-only** event dictionary (NOT IMPLEMENTED)

**Selected policy:** No transmitted persistent installation ID, user ID, session ID, cookie, fingerprint, nickname, email, free text, raw game content or cross-session linkage. No central participant timeline, unique-user metric, per-install return-rate metric or longitudinal retention metric. The backend receives a narrowly validated event and immediately increments an aggregate counter. It does not store an event row. Game-specific local progress remains device-only.

Proposed bounded, consented event payload fields:
| Field | Type and permitted values | Required? | Notes |
|---|---|---|---|
| `schema_version` | integer `1` | Yes | Reject unknown versions |
| `event_type` | `game_started`, `session_completed`, `session_exited`, `usability_error` | Yes | Start/completion/exit counted separately; no crash inferred centrally |
| `game` | `stargazer`, `sentinel` | Yes | No user-provided strings |
| `level_bucket` | `1`, `2`, `3`, `4`, `5`, `unknown` | Optional | Use only when accurately measured; validation per game |
| `duration_bucket` | `under_1m`, `1_3m`, `3_5m`, `5_10m`, `10m_plus`, `unknown` | Optional | Terminal events only, based on active time |
| `error_code` | short enumerated code, e.g. `UI_NAVIGATION`, `MEDIA_LOAD`, `SESSION_SAVE` | Optional | For `usability_error` only; no error messages, stack traces, URL, nickname |
| `period` | **server derived weekly UTC bucket** | Server only | Do not transmit precise user timestamp |

**Synthetic illustrative payload, no identifier:**
```json
{"schema_version":1,"event_type":"session_completed","game":"stargazer","level_bucket":"3","duration_bucket":"3_5m"}
```

The client emits `game_started` once per actual new session and sends a single terminal event (completed or explicitly exited) if observed. Do not treat a round finish as a session completion. A closed tab, crash or offline failure may produce no terminal report; no centralized crash attribution. If the network retries, **without a transmitted idempotency key duplicate events are possible**. MVP must therefore either disable automated retries or adopt a short-lived **request-scoped** duplicate safeguard after separate privacy review. Counters can be inaccurate due to non-delivery, tab closure and fabricated requests; show this limitation in founder reporting.

**Metrics definition:** 'reported starts' and 'reported terminal outcomes' are independent aggregate counters. A completion share can be defined as completed / (completed + explicitly exited), labeled **'share of reported terminal outcomes'**, not an exact start-to-finish completion rate. Avoid a conventional 'sessions completed / sessions started' claim until end-to-end accounting is validated. Never report unique participants, unique devices or return engagement. Levels are session observations, not demonstrated neurological progress.

**Consent:** OFF by default. No analytics requests, beacons, pings, batch uploads, deferred analytics queues or ID creation before opt-in. After consent, only schema-validated minimal events may be sent. Skip/decline works normally. Withdrawing consent disables future events immediately and cancels queued work; already initiated network requests cannot be recalled. No historical backfill. No analytics cookies. Use strict CSP, minimize third-party dependencies, and test browser request capture.

**Deletion:** Locally stored MVP 1.1 profile/history/consent can be erased on-device with confirmation; game legacy keys require a separate explicitly confirmed action. Aggregate counters without per-person IDs cannot reliably identify and delete one person's previous contributions. Disclose that limitation *before consent*; withdrawal stops future sharing but cannot selectively delete contributions already aggregated. If a legal or security requirement demands individual erasure, revisit architecture before collection. Provider-level network logs, IP handling and backups require a separately audited retention notice.

## 5. Backend recommendation and founder analytics

**Recommended:** new, separate Cloudflare Worker + D1 aggregate-counter table, not the old Nourish Me Worker or Gemini credentials. `POST /v1/analytics/events` accepts *only* the allowlisted event schema after optional participant consent is checked in the browser. Backend validates types, length and enum values, derives a UTC week, applies conservative abuse controls and increments one aggregate row transactionally. **No raw event rows, participant profiles, persistent session keys, installation IDs or per-user timelines in D1.**

A proposed aggregate table can use `(week_utc, game, event_type, level_bucket, duration_bucket, error_code, count)` with strict dimensional restrictions. Limit combinations and avoid exact timestamps in storage. Proposed default retention: 90 days for weekly aggregate rows; automatic scheduled purge with test evidence. **The prior 30-day detailed-event retention proposal is removed** because no detailed-event table is proposed. D1 is chosen for modest volume, controlled schema, timed deletion of aggregate rows and founder reporting. Infrastructure-level logs/backups can still have separate retention periods; verify before privacy statements are released.

**Operational limits:** This is a public submission endpoint, not identity verification. CORS is not authentication and clients could fabricate counters. Use request body caps, origin checks as supplementary protection, abuse throttling/rate limiting without durable visitor fingerprints, bot safeguards only if needed and separately reviewed, and no analytics processing that records raw IP/user-agent by default. Verify Cloudflare's platform logs and network metadata configuration; the network provider will still process IP and TLS/request metadata while serving traffic.

**Founder dashboard:** hosted separately, access-controlled with strong authentication/MFA (e.g. Cloudflare Access) and least-privilege server-side aggregate query. Never embed founder credentials or D1 binding secrets in public GitHub Pages. Proposed measures: total reported starts, completed/explicit-exit terminal counts, game split, broad level/duration buckets, and allowlisted usability-error counts. **Exclude unique participants, repeat visitors, return engagement/retention and personally identified outcomes.** Without a persistent identifier those cannot be measured reliably. For the small 8–12-person pilot, prefer an overall rolling 30/90-day total; avoid daily or participant-level reporting. Avoid interpreting event count thresholds as k-anonymity: many events may come from one consenting participant. Suppress sparse breakdowns and complementary cells, and note insufficient consented data when results are too sparse; defer precise suppression policy and operational thresholds to review.

**Interpretation:** Numbers are events from opted-in browsers only, not all participants. “0 received events” is not “0 practices.” Completion share among reported terminal outcomes is descriptive and susceptible to reporting loss and anonymous event spoofing. Do not present gameplay data as clinical markers or proof of improved cognition.

## 6. Proposed interfaces (text wireframes only; retain current styling)

First visit:
```
WELCOME TO
Neural Orchard
A celebration of becoming.

What would you like us to call you?
[ Preferred nickname (optional) ]
No email address, full name, or password required.

[ ] I agree to share limited aggregate gameplay counts to improve Neural Orchard.
    Optional; no account is created and no return-visit tracking is used.
    Previous contributions to aggregate counts generally cannot be removed individually.
[ Read privacy details ]
[ Enter Neural Orchard ]   [ Skip for now ]
```

Returning Orchard: `Welcome back, Jane.` (or neutral greeting) and `My Progress` plus `Privacy Settings` entries, existing Studio/Nourish Me/Sleep Sanctuary/Breathe navigation unchanged.

My Progress: saved Stargazer and Sentinel level separately from sessions recorded **since MVP 1.1**; local-only dated practice history and trends, clear empty-state labels, consent controls, local clear with confirmation. No clinical scoring or historical completion fabrication.

Founder dashboard (MFA-protected):
```
NEURAL ORCHARD — Aggregate usage from consented sessions only
Reported starts | Reported completed sessions | Reported explicit exits
Stargazer vs Sentinel | Reported terminal-outcome completion share
Level/duration groupings (only if privacy-safe) | Usability error counts
[Data limitations: no unique users, return rate or cross-session tracking]
```
All interface designs are noninteractive proposals, not implemented screens.

## 7. Phased implementation gates (NO CODE AUTHORIZED)
1. Founder reviews aggregate-only definition, allowed event list, session completion rules, terminal-outcome reporting caveats, disclosure that historic aggregates cannot be individually erased, weekly retention and founder-report suppression.
2. Before feature integration, reconcile and test `hotfix/stargazer-exit-buttons-v1` against an isolated implementation successor; keep production and historical registration documentation unchanged.
3. Implement optional local nickname, consent/settings and truthful My Progress with versioned keys only after separate authorization.
4. Add minimally invasive local per-game start/end/level hooks without changing scoring/audio/navigation; test terminal events and interrupted-session handling with synthetic fixtures.
5. Build isolated Worker + D1 in nonproduction, accepting **synthetic** aggregate-only events with no install ID or raw event table; verify no pre-consent network requests.
6. Implement a protected aggregate founder dashboard; test rate limiting, invalid payload rejection, expiry purges, role restrictions, suppressed reports and accurate denominator labels.
7. Desktop/mobile screenshots and interaction QA; verify all three existing storage keys remain unchanged and both games/exit screens work. Require explicit founder authorization before enabling real collection or deploying anything.

## 8. Acceptance tests to execute in a real browser (NOT YET RUN)
- Nickname, blank nickname, returning greeting, Unicode-safe rendering and no server transmission of nickname.
- Byte-for-byte preservation of `stargazerLevel`, `sentinelLevel`, `ppsDailyPracticeV1` on returning browser profiles.
- Correct local sessions versus level/round completions, with no invented historical session counts.
- My Progress accurate for local history, dates, session outcomes, graphs and empty states.
- Network inspector: **zero analytics requests** before opt-in, when skipped/declined and after consent withdrawal; do not assume an already-sent request can be recalled.
- Payload has **no installation_id, user_id, session_id, nickname, email, IP field, arbitrary text or event timestamp**; strictly validate on server.
- Synthetic backend payloads increment intended aggregate counters exactly once in ordinary conditions; quantify missing-terminal and duplicate-delivery limitations; enforce fixed schema, 90-day TTL and refusal of arbitrary fields.
- Founder dashboard shows aggregate reporting only, omits retention and unique visitor metrics, handles opt-out bias and small-cell suppression, rejects unauthorized access.
- Verify local clear confirmation, retention/deletion explanations, browser data loss and cross-device separation.
- Desktop 1440×900 and mobile 390×844; real scrolling and clicking, all existing game audio, scoring and approved exit text preserved.
- Production `main` and live analytics unchanged; no credentials or new network analytics in public code.

## 9. Invitation privacy statement — DRAFT; DO NOT DISTRIBUTE BEFORE TESTED

"Neural Orchard welcomes you without requiring an email address, full name, or password. You may enter a nickname or skip it. Your personal practice history is saved locally in your browser on this device, so other participants cannot see it through Neural Orchard. Clearing browser data or using another device may mean your history is unavailable.

If you choose, Neural Orchard can share limited, aggregate gameplay statistics—such as game starts and completed sessions—to help us improve the experience. This is optional and you can still use the games if you decline. No nickname or persistent participant identifier is sent with these statistics, and the founder dashboard does not track individual participants or return visits.

You can change your preference at any time to stop future analytics. Once an event has contributed to aggregate statistics, we generally cannot identify and remove that individual contribution. Hosting providers may process routine network information needed to deliver the service. The detailed privacy notice explains data handling, retention and deletion limits."

Publish only after actual consent, transport, retention, dashboard and provider-log behavior have been verified.

 — DRAFT, DO NOT DISTRIBUTE BEFORE VERIFIED

"Neural Orchard welcomes you without requiring an email address, full name, or password. You may choose a nickname, or skip it. Your personal practice history is saved in this browser on your device; other participants cannot view it. You can optionally share limited gameplay statistics to help us improve Neural Orchard. This is entirely your choice, and declining does not limit the games. Founder reports show aggregated usage rather than personally identified profiles. You can change your analytics preference at any time. Clearing your browser data may erase your local progress. Review the in-app privacy notice for what is collected, how long it is kept, and deletion limitations."

Do not publish until testing confirms each statement, especially access control and withdrawal/deletion behavior.
