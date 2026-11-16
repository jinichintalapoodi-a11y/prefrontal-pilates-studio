# PPS Lab — Priority Usability Repair Sprint
## Pilot Feedback #1 · Founder / Neural Orchard Master Hub handoff

**Status:** Source repair implementation complete; private full-game browser acceptance **pending**. **NOT MERGED, NOT DEPLOYED.**
**Repair branch:** `repair/pps-pilot-usability-feedback-1`
**Base:** `release/pilot-mvp-1-1-rc1` at `03049fdf79daa3bd73d938313a1e48624754f980`
**Active public main:** previously verified as `1251c7725b75896c26765adbf77f7a51527b86f4`; recheck on final handoff.
**Pilot and production protection:** No feedback endpoint activation, Cloudflare configuration, email sending, billing, or deployment.

### 1. Stargazer breathing preparation — actual implementation verified

The breathing exercise is implemented in `index.html`, **not** inside `Stargaizer.html`: Stargazer's existing **Take a Breather** control navigates to `index.html?action=breather`. The user can choose 3, 5, or 10 cycles.

The source-defined sequence remains:
- **Inhale:** 4,000 ms, tone frequency 342 Hz.
- **Hold:** 4,000 ms, tone frequency 310 Hz.
- **Exhale:** 8,000 ms, tone frequency 280 Hz.
- **Total:** 16 seconds per cycle (48 seconds, 80 seconds, 160 seconds for 3/5/10 cycles), plus the new **3-second preflight countdown**.

Repair: `selectCycles()` now describes the 4–4–8 rhythm, cycle choices and exit. `beginWave()` shows a visible **3 → 2 → 1** countdown before calling the **unchanged** `runWave()`. Existing `cancelBreathing()` and generation guards cancel the preflight timeout if the user goes back, exits, or changes modes. Original tone/phase code is unchanged.

### 2. Stargazer Exit

- Original gameplay control already called `Engine.exitRoom()`. It is now **Exit Stargazer** with an accessible label and minimum 44 px target in mobile-safe-area-aware HUD styling.
- Existing completion gate previously said **Return to Sanctuary**; now explicitly says **Exit Stargazer · View return options**.
- The dynamic star-increase gate now adds **Exit Stargazer · View return options**, wired to `Engine.exitRoom()` without altering the existing Try/Continue scoring or level choice handlers.
- Existing preserved farewell footer offers `index.html?action=studio` (**Return to Prefrontal Pilates Studio**) and `index.html` (**Return to Neural Orchard**). No attempts to close the browser.

### 3. Sentinel burrow orientation

Source `BURROWS` has exactly **five** coordinates:
- Upper row: 1 left (x=14), 2 center (x=49), 3 right (x=87.5).
- Lower row: 4 left (x=20.5), 5 right (x=78.5).

Each of the **five original level-specific instruction panels** now begins with a simple conceptual two-row five-burrow diagram (1–2–3 above 4–5) and explains the spatial layout. This is a guide; the scenery itself is **not labeled**, and game behavior is not modified.

Five n-back instructional examples remain founder-approved; underlying trial selection and MATCH logic have not changed.

### 4. Sentinel landscape and return navigation

- Top HUD elevated above instruction veil (z-index 120), with safe-area top/side insets, 44 px Exit target, contrast, and narrow landscape adaptation. Label is **Exit Sentinel**.
- Existing sound control and score readout remain; no gameplay HUD positioning or sound functions rewritten.
- Portrait rotation prompt now provides a direct `index.html` **Return to Neural Orchard** link for participants unable to rotate. This uses standard browser navigation, never forced window closure.
- Exit farewell still contains **Return to Prefrontal Pilates Studio** and **Return to Neural Orchard**.

### Files changed / added

- `index.html` — breathing introduction, live countdown and scoped preparation styling.
- `Stargaizer.html` — clearer gameplay/completion Exit labels and touch CSS.
- `Sentinel.html` — five-burrow diagram, portrait return link and safe-area navigation CSS.
- `registration/PPS-REPAIR-QA.test.mjs` — source regression test suite.
- `registration/PPS-USABILITY-REPAIR-FOUNDER-REVIEW.md` — this handoff.

The deferred Cloudflare dashboard, email delivery service, local progress modules and production site remain unchanged.

### Checks actually performed

**PASS (source-level and mock):**
- 6/6 suite checks executed against exact GitHub file contents in isolated JavaScript tool runtime (not Node CLI): valid inline JS; 4–4–8 phases/countdown; Stargazer game and completion exit buttons and return URLs; five Sentinel burrows and one–five-back examples; safe-area/touch/source portrait route; legacy keys and disabled email.
- Separate simulated `Studio` runtime: visible 3,2,1 then first three unchanged tones `[342Hz,4s]`, `[310Hz,4s]`, `[280Hz,8s]`; cancel during preparation did not invoke audio.
- Source before/after comparisons: `Studio.runWave()` identical; Stargazer `verifySequenceAccuracy()` and canvas setup identical; Sentinel `choose()`, `nextTrial()`, and `match.onclick` identical.
- All edited pages' inline JavaScript parsed.
- Five Sentinel examples match actual comparison `sequence[sequence.length-span]`.
- No production, pilot or infrastructure changes.

**Not yet performed:**
- Full-game browser runs from this exact GitHub branch on desktop, iPhone, Android or real tablet; tactile tap-target tests and scroll tests.
- Genuine screenshot captures of the running games. A **separate 15-image labeled layout fixture preview** has been generated for founder design review only; it is NOT a full-game screenshot or device acceptance test.
- Manual audio output listening, screen reader testing, keyboard navigation verification, Safari/Android browser QA, safe-area real device testing.
- Live progress persistence across reload and completion/exit, beyond source key checks.
- Actual sending or receiving synthetic emails at `prefrontalpilates.feedback@gmail.com`. Email collection remains OFF.

### Visual previews

15 offline **layout-fixture screenshots** created outside repository, deliberately marked `ISOLATED LAYOUT PREVIEW · NOT LIVE GAME`:
- Sentinel levels 1–5, each at desktop 1440×900 and mobile portrait 390×844.
- Sentinel level 1 small landscape 667×375.
- Breathe preparation and 3-second preflight screen at 390×844.
- Stargazer farewell footer at 390×844 and 1440×900.

Preview archive is attached in the project conversation, **not committed to GitHub**. It can be reviewed as a design aid, not proof of running-game behavior.

### Founder acceptance and release gates

1. Open **repair branch** in private Codespaces (follow original private Codespaces procedure, replacing branch). Do not use or modify the active pilot.
2. Run `node --test registration/PPS-REPAIR-QA.test.mjs` against a checkout; record actual Node results.
3. On desktop and phones, verify breathing intro, live countdown, phase timing by clock, audio and cancel/exit; verify no overlapping timers.
4. Test Stargazer gameplay exit during every phase, star-increase completion exit, farewell scroll and both destinations.
5. Verify Sentinel five panels, five burrow positions, tapping MATCH only while visible, portrait return, landscape Exit safe area, scroll, audio and levels.
6. Check local progress `stargazerLevel`, `sentinelLevel`, `ppsDailyPracticeV1` across reload/exit; check feedback remains optional and disabled.
7. Capture screenshots of **the actual working games** in desktop/mobile portrait/landscape, document any issues.
8. Founder reviews this package in the Neural Orchard Master Hub and explicitly decides if/when to merge into a **separately approved pilot release**. No automatic deployment.

**Release recommendation:** Review candidate only. **Do not expose to pilot participants until actual browser acceptance passes and founder authorizes a release.**
