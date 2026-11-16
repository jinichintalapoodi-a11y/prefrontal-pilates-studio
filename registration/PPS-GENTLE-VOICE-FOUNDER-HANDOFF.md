# PPS Lab — Breathe Gentle Voice Guidance refinement
## Founder browser QA handoff · Review only

**Status:** Implemented and simulated-test verified; **release held pending real browser/audio QA**.
**Source branch:** `repair/pps-breathe-gentle-voice-qa`
**Base branch:** `repair/pps-pilot-usability-feedback-2-3` at `5450eb3ef260f024c49883d0462a03ccc6952e11`.
**Release authorization:** Not granted. No merge, production/pilot update, paid service, feedback activation, DNS or deployment.

### What changed

**Only `index.html` behavior and scoped styles** plus this handoff and a new voice-specific test file.

1. The Breathe toggle now displays **Gentle Voice Guidance: Off** by default, changing to **Gentle Voice Guidance: On** when enabled. If browser speech synthesis is unavailable, it displays **Gentle Voice Guidance Unavailable**. It retains native button accessibility (`aria-pressed`).
2. The following founder-approved paragraph appears immediately below the toggle (including on cycle selection, preparation countdown and active phase screens):

   > Turn this on to hear a calm, gentle voice guide you through each breathing phase: inhale, hold, and exhale. You can turn it off anytime.

   It is associated with the toggle using `aria-describedby` and receives mobile-responsive styling.
3. Voice settings changed from `rate=.88, pitch=1, volume=.8` to **`rate=.82, pitch=.98, volume=.55`**. Those settings aim for an unhurried, quieter delivery; they are not guaranteed to sound identical across devices.
4. `selectGentleVoice()` asks `speechSynthesis.getVoices()` on every phase to accommodate a voice list that populates late. It considers English voices only (`en-*`), prioritizes those with `localService===true` over browser-provided remote voices, then favors names suggesting natural/enhanced/premium/neural voices, with additional lower-weight familiar names and a penalty for novelty/compact voices. Local voice quality names are heuristics, not formal quality assurance. If no suitable English voice list is available, leave `utterance.voice` unset and use the browser default. No voice package is downloaded or specified by the app.
5. `speakPhase()` still announces **one short word at the start of each unchanged phase** (`Inhale`, `Hold`, `Exhale`), cancels the earlier announcement before beginning a new one, and never awaits voice callbacks. Turning guidance off or exiting calls `speechSynthesis.cancel()`.

### Preserved mechanics

The existing Breathe `runWave()` phase list and tone engine retain:
- `Inhale`: **4,000 ms**, 342 Hz.
- `Hold`: **4,000 ms**, 310 Hz.
- `Exhale`: **8,000 ms**, 280 Hz.
- Existing **3 → 2 → 1** preparation countdown.
- 3, 5 or 10 cycle options, cancellation generation check, visual phase labels and independent Web Audio tones.

No changes to Stargazer, Sentinel, progress/history storage, native voices installed on a device, account information, feedback sending or dashboard.

### Automated evidence and test execution

**21/21 checks passed in an isolated JavaScript harness against the current GitHub branch source**:
- **6/6 new voice refinement tests** in `registration/PPS-GENTLE-VOICE-QA.test.mjs`: exact button/helper copy and OFF state, preference for a local enhanced English voice over a remote/novelty option, no fixed voice assumptions and late-loaded voice list, exact `.82/.98/.55` utterance settings, unchanged countdown and 4–4–8/342–310–280 timing, cancel/turn-off with no subsequent speech, and visual/audio fallback when speech support is unavailable.
- **15/15 inherited tests** in `registration/PPS-REPAIR-QA.test.mjs` and `registration/PPS-QA-2-3.test.mjs`: previously repaired experience, navigation, Sentinel/Stargazer logic, progress, disabled feedback.

**Important:** The 21 passing results were executed via an isolated JavaScript test harness with simulated DOM/speech/clock. They were **not** invoked as `node --test` on a full checked-out repository, nor did they play sound or run the real app in a browser. Run this command in a private checkout:

```sh
node --test registration/PPS-REPAIR-QA.test.mjs registration/PPS-QA-2-3.test.mjs registration/PPS-GENTLE-VOICE-QA.test.mjs
```

### Browser speech API facts and limitations

- The standard `speechSynthesis.getVoices()` list depends on OS/browser voice installations and may initially be empty; voice inventory can change during the session. The refinement requests it for each phase rather than pinning a name to one platform.
- The `localService` property identifies locally synthesized voices where provided. A voice name containing “Natural” or “Enhanced” does not guarantee subjective naturalness.
- `speechSynthesis.speak()` queues utterances; `speechSynthesis.cancel()` clears the queue and stops current speech. The app cancels before each phase to minimize overlap, but browser scheduling/latency remains device-dependent.
- An operating system/browser's default voice, even if selected when no suitable local English voice appears, is controlled by that platform; local/remote processing characteristics can vary. There is **no added third-party/paid voice provider**.
- Speech may be unavailable or silent because of browser autoplay restrictions, muted audio, installed voices, user settings or unsupported APIs. The visual-only experience and existing tones continue. The app does not promise an identical voice to every participant.

Standards/documentation:
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel

### Outstanding QA — explicitly unperformed

**No actual desktop Chrome or mobile Safari/Chrome listening tests were performed** on the updated code; this private GitHub branch was not made available in the local Chromium container. No screenshots, microphone/audio recordings, voice inventory lists, or platform-specific subjective quality observations have been collected.

Before founder acceptance, perform:
- [ ] Desktop Chrome: first-visit button/off state, helper text under toggle, test 3/5/10 cycles, listen with voice on and off.
- [ ] Mobile Chrome Android: inspect available voice names, mobile-screen spacing, voice quality, switching and cancellation.
- [ ] Mobile Safari iOS: verify gesture activation, voice availability, quality, timing and silence when disabled; inspect safe-area/portrait/landscape.
- [ ] Time by stopwatch: 3-second countdown then 4/4/8 phases; listen for no overlapping or late words.
- [ ] Test with only basic/robotic installed voices and an empty speech API, confirming non-speech fallback remains usable.
- [ ] Verify 44px touch toggle, correct `aria-pressed`, keyboard screen-reader explanation, and live voice toggle during a phase.
- [ ] Confirm no change to prior pilot source/regression and no network requests to a new speech service.

**Recommendation:** Keep as draft and hold deployment. Review/test naturalness in real Chrome/Safari before claiming improved perceptual quality. No approval to merge or deploy.
