# Neural Orchard / Prefrontal Pilates Studio
# MVP 1.1 Pilot Release Candidate — Founder Review

**Candidate branch:** `release/pilot-mvp-1-1-rc1`
**Prepared from development:** `151f6e51e67c57f9c8f7b6f06870e3cbfe2fca39`
**Production baseline at preparation:** `1251c7725b75896c26765adbf77f7a51527b86f4`
**Release state:** **NOT READY FOR PUBLIC PILOT / NOT DEPLOYED.** Source packaged for review, not merged.
**Approval rule:** Founder review and explicit separate approval before merge, DNS/Cloudflare changes, public endpoint, participant invitation or deployment.

## Scope of review candidate

1. **Stargazer exit** — permanent two-button footer separate from scrollable science farewell and optional six-question feedback:
   - Return to Prefrontal Pilates Studio: `index.html?action=studio`.
   - Return to Neural Orchard: `index.html`.
   - No change to Stargazer recall/Stroop gameplay, original science wording, artwork or local progress.
2. **Sentinel** — five clearer level-specific n-back instruction panels with numbered examples, high-contrast espresso/ivory text, scrollable instruction presentation. Existing game logic, score, music, progress and exit text preserved.
3. **Optional feedback** — six existing questions, three optional written answers, separate explicit consent, skip and navigation, answers preserved on request failure. Client/server remain **OFF** until separate approval.
4. **Local-first pilot experience** — optional nickname, local My Progress, consent preference OFF by default. Do not use nickname/progress when sending feedback.
5. **Email pilot service** — approved recipient `prefrontalpilates.feedback@gmail.com` locked in disabled Worker and example binding. Real feedback OFF and synthetic QA OFF; no Cloudflare account configured, verified recipient or sent email.
6. **Deferred founder dashboard** — D1/dashboard source retained unchanged on the branch; not deployed.

## Automated/source QA evidence

**Performed in connected GitHub source and isolated mocked JavaScript runtime:**
- All three HTML inline scripts and MVP JS modules parsed as JavaScript.
- Stargazer exit HTML contains exactly two prominent navigation buttons in a footer sibling to the scrollable gate; destination handlers use the exact two approved URLs.
- Feedback attachment hooks remain present in both games; separate consent and retry text remain in the participant form; no runtime endpoint configuration is injected by game HTML.
- Sentinel five instruction examples match the actual `sequence[sequence.length-span]` n-back comparison. All five instructions include the task, turn-back prompt, example, matching explanation and do-nothing instruction.
- Email Worker requires the founder-approved recipient, public send is disabled, synthetic QA send is disabled by default. Earlier synthetic Worker mocks accepted Stargazer and Sentinel and rejected invalid input/recipient; **those are mocks and never sent actual email**.
- Historic key `ppsDailyPracticeV1` remains in `pps-session.js`; the original Stargazer/Sentinel level keys remain referenced.
- Regression check source added: `registration/PILOT-RC-STATIC-QA.test.mjs`. Run with `node --test registration/PILOT-RC-STATIC-QA.test.mjs` from the repository root in an isolated clone/Codespace. **The Node command has not been run in a clone during this interaction** because GitHub source retrieval to the local browser environment is unavailable.

**Important limits:** HTML/CSS structure inspection does not establish live button visibility, scrolling, hit target behavior or accessibility on actual mobile devices. The locally available Sentinel instruction images are **layout fixture previews**, not full running game screenshots.

## Hard launch blockers (must pass)

- [ ] Obtain private, nonproduction **Codespaces / local** preview of this exact release candidate. Keep any forwarded port private; do not use public GitHub Pages or publish.
- [ ] Run automated static Node QA on the full candidate checkout and correct any failures.
- [ ] Desktop: validate Stargazer exit, scrolling, both destination buttons and optional feedback in Chrome, Safari or Firefox.
- [ ] Mobile: iPhone/Android widths and landscape orientation; exit controls must remain visible, tappable and keyboard accessible; check safe-area bottom and zoom.
- [ ] Validate Sentinel five level instructions on actual browser at mobile/desktop, gameplay MATCH/no-match, scoring, 30-trial timing, sound and five-match level progression.
- [ ] Verify Stargazer gameplay/recall, science copy, controls, sound and local progress survive reload; confirm corrected `star_gazer.jpeg` visually and separately inspect mobile `star_gazer_mobile.jpeg`.
- [ ] Confirm saved keys `stargazerLevel`, `sentinelLevel`, `ppsDailyPracticeV1` are preserved across upgrade.
- [ ] Ensure feedback skip/consent/no-config behavior causes no network request. Verify answers persist if a synthetic request fails.
- [ ] Cloudflare account prerequisite audit: verified recipient, sender domain, DNS changes, provider costs, logs and message preview. **Do not provision or modify DNS without separate approval.**
- [ ] Send and receive **actual** synthetic Stargazer and Sentinel emails using a private authorized staging Worker; inspect the Gmail inbox. Current source-only mocks do not meet this requirement.
- [ ] Confirm future privacy notice, inbox storage, provider logs and deletion rules; obtain separate founder authorization before enabling real collection.
- [ ] Founder explicitly approves exact set of changes, production merge and deployment; only then prepare the release operation. Do not deploy autonomously.

## Private browser QA instructions (founder/developer)

1. In GitHub Codespaces or a trusted development machine, check out `release/pilot-mvp-1-1-rc1` (do not use `main`).
2. Run `node --test registration/PILOT-RC-STATIC-QA.test.mjs`.
3. Start a private static preview: `python3 -m http.server 8000`. If using Codespaces, forward port 8000 and set visibility to **Private**.
4. Inspect `Stargaizer.html`, `Sentinel.html` and `index.html` in desktop and mobile browser emulation. Complete a real game round before opening the exit screen. Use `?calibrate=1` through `5` only when testing Sentinel calibration; these are special nonstandard gameplay test modes and **cannot substitute for normal gameplay QA**.
5. Capture screenshots with browser viewport/device sizes and network trace of the optional feedback form. Preserve original source and record test outcomes.
6. Keep Cloudflare feedback endpoints OFF; test delivery to Gmail only after the separate infrastructure prerequisite approval.

## Change boundaries

The release candidate has not intentionally changed the base games' scoring, artwork, scientific exit copy, audio or production configuration. The pilot package includes many development-only modules and unactivated infrastructure, which need founder review before selectively shipping.

**No actual pilot invitation should be sent on this release candidate yet.**
