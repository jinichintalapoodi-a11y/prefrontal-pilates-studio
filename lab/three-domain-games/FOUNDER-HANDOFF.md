# PPS Lab — Three-Domain Game Prototype Handoff

**Status:** ISOLATED LAB PROTOTYPES — not founder-approved for pilot, not validated, not merged or deployed.

**Branch:** `lab/pps-three-domain-game-prototypes`. Based on `repair/pps-breathe-gentle-voice-qa` at `d5cbd1d3791a4c8b22ebc806475bc09ebadf60ec`. Previous Stargazer, Sentinel, Breathe and landing page remain unchanged.

## Prioritization and why

1. **Verbal memory — Memory Garden**. High-priority domain gap, clear mechanism (intentional encoding, intervening distractor, free recall). Strategies and delayed retrieval can be studied in later iterations, but this prototype tests immediate free recall only.
2. **Verbal executive — Word Weave**. Rule-switching between word meaning and initial-letter sorting. The required mental operation is to maintain and switch a verbal decision rule; this is not presently an adequate standalone validated verbal executive assessment. Upcoming versions need less predictable switch schedules, interference controls and a broader language-demand profile.
3. **Visual executive — Garden Paths**. Plan a path, obey obstacles and minimize extra moves. It provides a planning objective but does not by itself establish real-world executive functioning. Later versions should add multi-step constraints, goal hierarchies, rule reversals and preplanned-move scoring.

All three are **prototype mechanics** for user testing, not claims of domain-specific transfer or prevention of dementia.

## Prototype implementation

**Standalone:** `lab/three-domain-games/index.html` — a static, responsive single-file PWA-compatible web prototype with three accessible game tabs. No external JavaScript, analytics, network requests, account collection or production state mutations.

**Game 1 — Word Weave (verbal executive):**
- Eight word-sorting choices. Rule alternates between category (Food/Animal) and first letter (A/B).
- Each item has unambiguous category and initial; participants see the current rule. Correctness per decision is recorded in volatile session state.
- End-of-practice shows number correct and rule changes. No health score and no saved state.

**Game 2 — Memory Garden (verbal memory):**
- Study a fixed five-word list; participant controls study duration.
- Three brief, simple distractor questions before **typed free recall** of the five words in any order; no multiple-choice recognition hints during recall.
- Case-folding, basic ASCII normalization; duplicates excluded; exact matching is conservative. Immediate free recall only; no invented delayed-recall claims.
- End screen shows correct words and omissions. Word set fixed in local source. No names or other identifiers collected.

**Game 3 — Garden Paths (visual executive):**
- Four 4×4 obstacle maps; goal and current cell visible.
- Arrow/touch buttons and keyboard arrow support; undo counts as an extra move; invalid wall/boundary moves do not change position.
- Reaching the gate produces move count and shortest-path target computed by BFS. Boards are confirmed to have a solution.
- Difficulty and planning depth are modest; this is a proof of gameplay loop, not a complete executive curriculum.

## Automated and simulated QA

Source JavaScript syntax and scripted JavaScript mock interactions passed on current branch:
- Eight consecutive verbal rule decisions completed with eight correct choices.
- Verbal memory study → three distractors → typed recall completed.
- Four planning boards reachable (shortest paths: 6, 6, 6, 6); a route from the first start to the first goal completed in six moves.
- Added checked-in Node-compatible test suite: `lab/three-domain-games/prototype.test.mjs`. **Full Node CLI execution in a checked-out GitHub repository has NOT been performed**.

**Not performed:** actual full desktop/mobile browser interaction, touch, screen-reader, true keyboard focus, small portrait/landscape layout verification, participant observation, time-on-task, or cross-session effectiveness testing.

## Scientific research context and claim restrictions

- Executive training reviews show inconsistent transfer across specific tasks and measures: https://pubmed.ncbi.nlm.nih.gov/37822255/
- Verbal episodic memory strategies, including organization and retrieval, are used in older-adult memory training research: https://pmc.ncbi.nlm.nih.gov/articles/PMC3430800/
- Planning tasks such as the Tower of London operationalize a narrower planning construct, not whole-brain health: https://pubmed.ncbi.nlm.nih.gov/26523519/
- The proposed **three 45-minute sessions per week for 10 weeks, then monthly** is a program goal supplied by the founder, **not** yet implemented as a curriculum, schedule, adherence module or efficacy-validated training dose.

A scientist should approve a formal specification for each domain and distinguish task performance, near transfer, far transfer and clinical benefit before language describing training effects is permitted.

## Next design/QA gates

1. Founder plays the prototypes and evaluates enjoyment, confusion, readability, pacing, repeatability.
2. Cognitive-science review: specify construct, contamination, scoring, adaptive parameters and planned training progression.
3. Improve game depth: unpredictable but controlled rule shifts; strategy/retrieval variations; larger visual planning problems with goals and reversals.
4. Design the ten-week curriculum and test multi-session adherence/overload; Breathe may remain an optional break rather than count as a cognitive domain.
5. Independent live browser QA and screenshots, then a founder decision on whether to promote any prototype to a release candidate.
6. Keep production, active pilot, earlier draft PRs, voice selection and feedback collection untouched unless founder separately approves.

**Release recommendation: HOLD.** The branch is for product and scientific review only.