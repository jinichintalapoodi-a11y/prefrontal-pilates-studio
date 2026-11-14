# Neural Orchard MVP 1.1 — Phase 1 Development & QA Report

**Status:** Isolated development implementation, NOT release-ready. No public deployment, backend analytics activation, real participant data collection, or feedback submission.
**Baseline:** development branch initially at `2bca47d6fa0e888834fa1af3f67e3b23ca566761`. Production `main` checked at `1251c7725b75896c26765adbf77f7a51527b86f4`.
**Branch:** `feature/neural-orchard-mvp-1-1-development`.
**Prior architecture:** `registration/ARCHITECTURE-AND-QA.md` was superseded; mandatory email, password, accounts, Supabase registration, and identity-linked tracking are NOT part of MVP 1.1.

## Implementation inventory

| File | Change |
|---|---|
| `star_gazer.jpeg` | Same-root filename; copied exact corrected asset blob from `main` SHA `8d97450d90e2f87afdf052e46a01058174d95d78`, size 850,953 bytes |
| `Stargaizer.html` | Merged approved hotfix CSS only; added script references for local game metrics, feedback preview and progress store |
| `Sentinel.html` | Minimal local observations at level/watch start, completed watch and early exit; no scoring/difficulty/sound changes; feedback preview hook |
| `index.html` | Loads isolated onboarding/privacy/progress scripts; retains Studio/Breathe/navigational design |
| `neural-orchard-progress.js` | Versioned local sessions, active-time clock, device category, per-game metrics, interrupted-session recovery and confirmed local-history clear |
| `neural-orchard-preferences.js` | Browser-only optional nickname and analytics preference |
| `neural-orchard-ui.js` | Optional first-use onboarding, edit nickname/consent, My Progress, safe data-clearing flow |
| `neural-orchard-feedback.js` | Six-question optional interface, development preview only; no saving or network submission |
| `neural-orchard-stargazer-hooks.js` | Wraps existing engine methods without replacing gameplay; local Stroop, recall, Undo and exit measurements |

The corrected JPEG is an EXACT Git blob match to current `main`; its visual removal of the unwanted diamond, JPEG pixel dimensions and composition still REQUIRE human or automated image inspection. Binary reads and authenticated Codespaces browser capture were not available from the current connection. Preserve existing JPEG filename/URL; perform a private-browser hard reload and network-cache check. Do not infer pixel dimensions from byte size.

## Device-only data dictionary
- Existing keys `stargazerLevel`, `sentinelLevel`, `ppsDailyPracticeV1`: read/display or used by existing game code, never deleted/renamed/overwritten by MVP 1.1 modules.
- `neuralOrchardProfileV1`: local `nickname` and `onboardingSeen` only.
- `neuralOrchardConsentV1`: optional local preference, default OFF. **Not authorization to turn on collection automatically**; request renewed explicit consent when the future production backend actually becomes available.
- `neuralOrchardProgressV1`: device-local bounded session observations (maximum 200 recent sessions, 90 days). Local-only session IDs are used for deduplicating local records; NONE are transmitted.
- `neuralOrchardActiveV1`: **sessionStorage (per browser tab)** unfinished-session checkpoint. A reload/navigation in the same tab can be recorded as `interrupted` when the checkpoint is next read; a fully closed tab usually destroys this checkpoint and may leave an interruption unrecorded. Opening a separate tab cannot falsely mark an ongoing game interrupted.
- No persistent central participant identifier, server event store or telemetry queue is created.

## Explicit session definitions (founder review required)
- **Stargazer session starts:** participant activates Begin/Continue. A session is `completed` only if the participant ends practice after at least **5 locally measured active minutes** and at least **one verified constellation recall attempt**. Early deliberate exit is `exited`; crash/reload without explicit finish becomes `interrupted`. A successfully completed round alone is not a session completion.
- **Sentinel session starts:** first actual level/watch start. A session becomes `completed` if at least one level reached its existing five-match milestone before the participant exits. Otherwise the deliberate exit is `exited`; crash/reload is `interrupted`. Levels/retries within one visit are not separate practice sessions.
- The specific definitions above are engineering proposals consistent with observable game mechanics, not separately founder-approved clinical or experimental definitions. Review before participant use.
- **Active duration:** uses high-resolution monotonic time, pauses when tab hidden, on task interstitials/explicit pause, or after 120 seconds without input. Visibility return may resume a hidden game. A session spanning midnight is currently attributed to its local **end date**; time is not divided across dates. Current implementation does NOT reliably attribute elapsed minutes by each intermediate difficulty level; defer that breakdown.
- **Stargazer measures:** color-choice correct/incorrect and response time from Stroop-phase presentation, recall correct/incorrect once verified, Undo taps, rounds attempted/successful, level. No inference about neural improvement.
- **Sentinel measures:** trial count, correct match taps, missed targets, false alarms, unclicked non-targets, matching-tap latency measured from rising-animation start, level milestones, progression. This is not a standardized reaction-time test.
- **Device category:** local viewport-based phone (<=600 CSS px), tablet (601–1024), desktop (>1024). Not a device-model determination; tablets at desktop widths can be misclassified.
- My Progress displays saved game level distinctly from new session history and per-session task observations. No historical minutes or counts are invented.

## Consent and feedback
- Analytics is locally OFF by default; no backend endpoint configured and NO outgoing analytics event code.
- Consent withdrawal changes local preference only; no historical network data exist for this MVP phase.
- Feedback preview: six specified questions with three choice sets and three optional written fields. Preview submission explicitly discards answers; not collected, saved or transmitted. Future actual feedback requires separate affirmative submission consent, protected storage and a retention/deletion policy, independent of the analytics preference.
- The analytics plan remains aggregate-only (no lasting installation ID). If backend approved later, only server-validated aggregate events are allowed; collect no nicknames, exact IP/device model, free-text comments or raw game content.

## Verification completed from available tools
- GitHub source diff and content inspection, including image blob SHA parity: PASS.
- Existing Stargazer scrolling hotfix CSS present and approved exit copy retained: SOURCE CHECK PASS.
- JavaScript syntax compilation for new modules and inline game scripts: PASS.
- Mocked JS runtime tests: initial local stats empty, record and duration, no duplicate finish, hidden tab pause, nickname and consent persisted in local mock, clear only MVP keys, malformed/future progress does not get overwritten, exact legacy values unchanged, no network call paths in new local modules: PASS.
- No actual new participant data used in these synthetic tests.

## NOT verified; blocker before founder acceptance
- Actual screenshot captures at desktop 1440x900, phone 390x844 and tablet.
- Real browser flow: first-time nickname/skip/consent, returning greeting, My Progress scroll and trends, optional feedback visibility and skip, both game task flows, touch interactions, exit button navigation, browser Back/refresh and audio.
- Corrected JPEG visual/content verification and browser-cache behavior in both Stargazer and Orchard.
- Real page lifecycle/idle measurements under tab switching, navigation, multi-tab use, crash/refresh and background suspend. An abrupt tab close may have no terminal record, by design; do not invent an interrupted event.
- Regressions for existing Breathe, all Coming Soon disabled states and preserved game progression.
- Full network inspector verification including no real analytics; security/privacy review; precise feedback form accessibility.
- Provider-side network logs and production policies.
- Any founder dashboard, secure data backend or real submission: NOT IMPLEMENTED and NOT AUTHORIZED in Phase 1.

## Isolated preview steps for founder review
1. In private GitHub Codespaces, run `git status --short`; do not overwrite uncommitted work.
2. `git fetch origin`, `git switch feature/neural-orchard-mvp-1-1-development`, `git pull --ff-only origin feature/neural-orchard-mvp-1-1-development`, `git rev-parse HEAD`.
3. Run `python3 -m http.server 8000` at repository root; keep port visibility **Private**, not Public.
4. Open the private Codespaces forwarded URL. Test `index.html`, `Stargaizer.html`, `Sentinel.html` and game exits at desktop/mobile viewports.
5. Verify `star_gazer.jpeg` resolves to the corrected image and use hard refresh / disable cache in DevTools if necessary; no cache-busting CSS/JS was added.
6. Collect actual screenshots and console/network logs before founder approval.

## Rollback and release boundary
- Do not merge to `main`, deploy GitHub Pages, modify hosting/DNS or activate backend analytics without separate founder authorization.
- Current production content remains directly recoverable from `main` and its known commit `1251c7725b75896c26765adbf77f7a51527b86f4`. Revert feature commits only on the isolated branch after review; never force-push production.
- A safe production release would require visual/interaction acceptance, retention/consent audit and separate founder signoff.
