# PPS LAB — Consolidated Founder QA Feedback #2 + #3
## Neural Orchard Master Hub — Founder Handoff / Release Hold

**Status:** Seven approved source repairs implemented. **NOT RELEASE READY**: actual application screenshots, complete desktop/mobile browser QA and real-device acceptance have not been performed.

**Repair branch:** `repair/pps-pilot-usability-feedback-2-3`
**Verified base (prior Feedback #1):** `repair/pps-pilot-usability-feedback-1` at `8d3dec5662e940089f917bc035cd47de50a92979`
**Previous draft PR #3:** untouched, open, not merged
**Release authorization:** explicitly **not granted**. Do not merge, deploy, update the active pilot, enable Cloudflare/email collection, change DNS, or incur paid costs.

## Scope and findings

### A. Preferred-name onboarding
`neural-orchard-ui.js`: removed first-visit preferred-name modal, mandatory nickname entry, and personalized welcome greeting. Landing loads directly, showing the current existing `WELCOME TO` heading. **My Progress** and **Privacy & Data** remain accessible. Privacy settings retain optional future aggregate-statistics preference, default off, and explicit local data clearing. The previous profile key is not deleted on entry; stored game levels/progress keys and returning-player level choices remain.

### B. Active landing experiences
`index.html`: PPS and Breathe gain the `active-experience` class, a brighter botanical purple/green fill, stronger outline/contrast and touch dimensions. Nourish Me and Sleep Sanctuary remain visibly subdued, disabled and marked coming soon. Existing destinations are unchanged.

### C. Concise instructions
- **Stargazer** (`Stargaizer.html`): introductory copy accurately explains: watch stars, answer an **ink-color** question, then retrace the original order **if correct**. The proposed “color you saw” wording was corrected after source verification: the implemented task tests ink-color identification. An incorrect color answer starts another round rather than requiring a star recall.
- **Sentinel** (`Sentinel.html`): all five founder-approved memory-level definition objects remain byte-identical to the prior branch. Instruction presentation is shorter, retaining the two-row **five-burrow** diagram, task, each level's turns-back question, its correct numerical example and MATCH/no-match rule. Start button remains outside the scrollable explanation.
- **Breathe** (`index.html`): brief 4-4-8 instructions, stop/pause-if-uncomfortable guidance, existing 3-second visual countdown; 3/5/10 cycle choices are compact on mobile.

### D. Optional voice guidance, Breathe
`index.html` uses built-in **Web Speech API** (`speechSynthesis`) only; no paid API, network credentials or recorded voices. Clearly visible `Voice Guidance: Off` default and on/off toggle before countdown and during activity. When on, `SpeechSynthesisUtterance` says only **Inhale**, **Hold**, **Exhale** on their respective phase boundaries. No seconds counting. Disabling/canceling calls `speechSynthesis.cancel()` and existing `cancelBreathing()` clears pending timers.

**Existing 4,000/4,000/8,000 ms phase scheduling and frequencies 342/310/280 Hz preserved.** Voice playback is best-effort; it does not delay timing. Unsupported browsers display **Voice Guidance Unavailable** while visual prompts and existing tones remain functional. Voice availability, accent, volume, timing latency and consistency depend on installed OS/browser synthesis voices; mobile browsers can restrict speech until a user gesture. No external voice service or charges introduced. Manual voice/audio testing is still outstanding.

### E. Stargazer color-to-recall transition
A text-only `#recall-guidance` status shows **Now retrace the constellation.** / **Tap the stars in the same order you saw them.** immediately upon entering the original `initializeRecallPhase()`. The already-existing 800 ms correct-color delay remains. No extra button, no revealed order, no new phase delay; the message is removed at the first recalled star or Exit. Existing wrong-color path still begins another round, preserving scoring/animations/audio.

### F. Short exits
Both game exit screens now say **Thanks for playing!** / **Come back whenever you're ready.** Default navigation remains **Return to Neural Orchard** (`index.html`) and **Return to PPS** (`index.html?action=studio`). Existing Stargazer exit footer stays outside its scrolling gate. Sentinel now moves the two return buttons to a footer outside the scrolling card when Exit is shown, to keep them reachable on constrained landscape screens. Existing gameplay/exit buttons, completion exit options and safe-area/touch styles are retained from Feedback #1.

### G. Optional neuroscience
Both games now show a native keyboard/screen-reader-friendly collapsed `<details>` section labeled **The science behind this exercise**. The original educational working-memory/spatial-working-memory content remains in this optional section. Added explicit caveat: these are cognitive skills engaged during play; no demonstrated dementia prevention or lasting everyday cognitive improvement for these specific games.

Scientific context: National Institute on Aging advises against assuming commercially available brain-training games share benefits demonstrated by particular cognitive-training studies.
- https://www.nia.nih.gov/health/cognitive-health-and-older-adults/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6688548/

## Requirement-to-evidence checklist

| Charter requirement | Implementation/source evidence | Actual QA evidence / status |
|---|---|---|
| A: no first-visit nickname modal | `neural-orchard-ui.js`, removed onboarding invocation | Source regression pass; browser entry **pending** |
| A: previous scores preserved | No storage migration/deletion added; `stargazerLevel`, `sentinelLevel`, `ppsDailyPracticeV1` intact | Source pass; reload/storage **pending** |
| B: PPS/Breathe prominent | `index.html` two active classes + scoped palette | Source pass; visual/mobile **pending** |
| B: future modules subdued | Disabled state preserved and styled | Source pass; visual/mobile **pending** |
| C: Stargazer concise/accurate | `Stargaizer.html` ink-color introduction | Source/logic inspection pass; first-time comprehension **pending** |
| C: Sentinel five panels | Fixed `SENTINEL_INSTRUCTIONS` dataset unchanged; short rendering and diagram | Five n-back examples pass; live panels **pending** |
| C: Breathe concise and safe | `index.html` preparation copy and 3–2–1 countdown | Simulated runtime pass; actual readability **pending** |
| D: opt-in speech and off default | `index.html` `voiceControl`, `toggleVoiceGuidance` | Mock runtime pass; real audio **pending** |
| D: exact phase words | `speakPhase(p.l)` at each existing phase start | Mock runtime Inhale/Hold/Exhale pass |
| D: disable/cancel, no overlaps | Speech cancellation each phase/off/exit, existing generation guards | Mock pass; real device **pending** |
| D: fallback no speech API | `voiceControl()` unsupported indicator; tones/visuals unchanged | No-Web-Speech mock pass |
| E: retrace prompt after correct color | `#recall-guidance` in `initializeRecallPhase()` | Source pass; animation/visible timing **pending** |
| E: no scoring change | `evaluateStroopChoice` and `verifySequenceAccuracy` preserve existing paths | Before/after static comparison pass |
| F: short exits + destinations | Both HTML game screens, separate navigation footers | Source pass; live tap/scroll **pending** |
| G: optional science collapsed | Native `<details>` in both; navigation outside expanded text | Source pass; keyboard/reader **pending** |
| G: evidence-safe language | Explicit boundary between task engagement and outcome claims | NIA evidence review; copy pass |
| Accessibility / responsive safe areas | Existing 44px controls and repair styles retained; new voice/science focus styles | CSS/source check only; mobile **pending** |
| Progress, game/audio unchanged | Reused existing state, keys, match logic, 4-4-8 tones | Source + mock checks; end-to-end **pending** |
| Costs, deployment, dashboard | No new paid dependency; Cloudflare/dashboard code unchanged/off | Branch comparison/prod checks; no deploy |
| Real screenshots | No running-application screenshots available from isolated branch | **BLOCKER: NOT PERFORMED** |
| Complete browser/device QA | Neither Chromium end-to-end run nor Chrome/Safari real-device run completed | **BLOCKER: NOT PERFORMED** |

## Test results — exact scope

**15/15 regression cases PASS**, with source data retrieved from GitHub and run in a simulated JavaScript test harness. These include the six prior Feedback #1 checks (with only wording-compatible test changes) and nine new Feedback #2/#3 checks. The new cases execute the actual Breathe `Studio` object in a mocked environment and inspect generated countdown/phase text and voice calls. This is **not** `node --test` in a full repo checkout, and it is **not** live browser acceptance.

- No-name landing source gating, active choices and unavailable choices: pass.
- 3-second preflight; untouched 4-second inhale (342 Hz), 4-second hold (310 Hz), 8-second exhale (280 Hz): pass.
- Voice default OFF, toggle ON/OFF, phase labels, cancellation: pass in synthetic speech API.
- No-speech API fallback: pass (visual/tone activity continues).
- Stargazer ink-color correct/wrong paths unchanged, recall cue present: source pass.
- Sentinel one–five-back numerical examples and five positions: source pass.
- Short exits, collapsed science, distinct URLs, old progress keys: source pass.
- Source JavaScript syntax of three pages: pass.

**Not performed:** genuine desktop Chrome/mobile Chrome/mobile Safari/landscape/portrait full journeys; real speech audio quality and overlap; screen-reader/keyboard control operation; actual game completion/progress after reload; live-app screenshots. No claim of real-device or successful pilot usability is warranted.

## Screenshots / visual QA — explicit blocker

**No screenshots of this follow-up branch running as a complete app have been captured.** Previously generated layout fixtures for Feedback #1 do **not** demonstrate these new changes and must not be relabeled. Screenshots required before founder acceptance:
1. First-visit desktop + mobile landing with PPS and Breathe highlighted.
2. Breathe instructions with Voice Guidance Off/On; three-second preparation screen and all three phases.
3. Stargazer first instructions, correct ink-color to recall prompt, short exit with details closed/expanded, exit footer.
4. Sentinel all five level instruction panels; one sample landscape gameplay scene; short exit with science closed/expanded and both footer buttons.
5. Mobile portrait and small landscape at minimum; keyboard focus and touch targets; actual screenshot file paths, browser/viewport evidence.

## Founder / tester private QA procedure

1. Check out the follow-up repair branch in a **private** local browser environment or Codespace, without merging, activating feedback or publishing a public URL. Check usage quota first; Codespaces charges must be separately approved if free allowance is exhausted.
2. Run `node --test registration/PPS-REPAIR-QA.test.mjs registration/PPS-QA-2-3.test.mjs` in that checkout.
3. Open `index.html` as a local static site, clear only a **test browser profile** (never user progress), verify direct landing and both active choices.
4. Navigate to Breathe; toggle speech on and off during phases; check 3–2–1, actual audio, disabled voice fallback if available, exits, 3/5/10 cycles.
5. Run Stargazer. Verify correct ink-color response reveals exact recall prompt, wrong response does not; verify order remains concealed. Test Exit during gameplay and from level completion; science collapsed/expanded; both destinations.
6. Run Sentinel in landscape at all five levels, check burrow diagram, remembered locations, MATCH correctness, readable Begin/Exit, safe-area controls; test portrait Return to Neural Orchard.
7. Check preserved saved levels and daily practice; test reload/back navigation with prior local history still present.
8. Capture actual browser screenshots and record device/browser, OS version, viewport, navigation outcomes, crashes, scroll and accessibility findings.
9. Only after evidence and founder review decide whether to approve a separate pilot release. **Do not merge this draft without explicit approval.**

## Changed files

- `index.html` — active choices, compact Breathe explanation/options, opt-in speech and cancellation.
- `neural-orchard-ui.js` — remove preferred-name onboarding; privacy/progress remain.
- `Stargaizer.html` — correct ink-color instructions, recall prompt, short exit, optional science.
- `Sentinel.html` — concise five-level instructions, short exit, fixed navigation, optional science.
- `registration/PPS-REPAIR-QA.test.mjs` — maintain prior checks with updated approved copy.
- `registration/PPS-QA-2-3.test.mjs` — new consolidated source/runtime tests.
- `registration/PPS-QA-2-3-FOUNDER-HANDOFF.md` — this review document.

`neural-orchard-preferences.js`, `neural-orchard-progress.js`, `pps-session.js`, email Worker, dashboard, Cloudflare configuration, and all three games' mechanics remain unchanged.

## Known limitations and release recommendation

1. Native `speechSynthesis` has OS/browser-dependent voice identity, timing, permission and availability; first user gesture and sound settings can affect speech output. Voice is off by default; no paid fallback.
2. The original game progress/audio/scoring are source-preserved, not proven unchanged through full functional end-to-end QA.
3. Long optional science text and future-enabled feedback may require scrolling within the content area; return buttons are designed outside this area but touch/viewport behavior requires device verification.
4. The existing feedback module itself currently short-circuits before showing the form (`PILOT_FEEDBACK_DISABLED=true`). Real collection stays OFF, as approved.
5. No genuine new-branch gameplay screenshots or real browser/device QA exist.
6. Cost: no paid service activated or deployed. Codespaces/manual testing costs, if any, require explicit founder approval.

**Recommendation: HOLD.** Source implementation and simulated checks can be reviewed through the draft follow-up pull request, but do not mark founder-accepted, merge or deploy until actual running-app QA/screenshots are supplied and separately approved.
