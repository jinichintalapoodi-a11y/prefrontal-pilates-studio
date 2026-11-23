# Physical Movement lab review

## Architecture and integration

Draft [PR #1](https://github.com/jinichintalapoodi-a11y/neural-orchard-mvp-qa/pull/1) originally changed only `index.html`. The reviewed head was `6cb617bfa4df31c29c6f7b87756b8678f8086c07`, based on `main` at `11f19f82ab9dbae81ddc1c2f0caf9e444ab806de`. GitHub reported the PR as mergeable at inspection. The repository is a static site. At inspection, the only remote heads were main and the movement feature branch. No workflow files were present in either checkout.

The entrance mounts a movement view inside the existing portal and uses the shared arch geometry. Category buttons are in reading order across the two doors. Returning from a collection restores focus to its category, and returning home restores focus to the entrance. The module depends on the existing home entrance, content portal and breathing cancellation method. Serve the repository using an HTTP static server because the movement script imports a JavaScript module.

The four founder-selected records live in `physical-movement-content.js`. Each record keeps the display label, original title, creator attribution, official watch URL, neutral description and review status. Only records marked `approved` with a reviewer, review date and a limitations list appear in the collection. Use ISO dates and record any outstanding limitations in the review entry. Use an empty limitations list only when the reviewer has none to record.

## Eyes, Head & Body review status

The four videos are founder-selected and pending full review for publication. The official watch pages returned the listed titles, publisher name Eligned, and the same channel ID (`UC11ddaJlgx3-iQRgh42rYGw`). The collection attributes the creator as Eligned Movement.

| Display label | Official video | Duration | Focus of pending review |
| --- | --- | --- | --- |
| Cerebellar Movement | [CEREBELLUM UPGRAGE](https://www.youtube.com/watch?v=U1HsnRQyJ2U) | 23:53 | Identify the movements and screen for claims about cerebellar function. |
| Neuro-Lymph Movement | [NEURO-LYMPH 2.0](https://www.youtube.com/watch?v=lZSN2UET1GQ) | 15:38 | Check whether the movements fit the collection and flag any drainage or detox claims. |
| Movement for Hormonal Transitions | [Neuro-movement for hormonal brains](https://www.youtube.com/watch?v=BnnBt67tuqE) | 23:57 | Review the movement sequence and flag claims about menopause symptoms or brain fog. The description marks movement around 4:00. |
| Morning Brain & Body Wake-Up | [TURN YOUR BRAIN ON](https://www.youtube.com/watch?v=Pju2LEAOG9w) | 30:47 | Check how the ball is used, the required space and balance, possible seated options, and any claims about brain function. |

### Checklist for each video

- [x] Match the official watch URL, publisher and exact source title.
- [ ] Watch the entire video and record the movement sequence, pace, difficulty, equipment, support and space requirements.
- [ ] Check for dizziness, fall risk or other safety concerns and document precautions, modifications and seated options as appropriate.
- [ ] Check captions for accuracy and completeness and verify that spoken and visual cues communicate the movements.
- [ ] Review scientific and medical claims. Seek qualified review for clinical claims or higher-risk movements.
- [ ] Record the reviewer, date, decision, and outstanding limitations. Keep the entry pending until the review supports publication.

Metadata verification covered identity and watch links. Playback, caption quality, specific movements and claims remain unverified. The category displays **Collection in Development** while all records are pending. Once approved, a session appears as a choice and opens a separate view with a short description and its official YouTube link.

## Evidence and source shortlist

| Category | Candidate source or content | Evidence and limits |
| --- | --- | --- |
| Strength for Tomorrow | [NHS Strength exercises](https://www.nhs.uk/live-well/exercise/strength-exercises/), including sit-to-stand and wall press-up | WHO supports muscle-strengthening activity in adults. LIFTMOR studied supervised high-intensity training in selected postmenopausal women with low bone mass. Its findings on bone density and physical function do not establish the safety or efficacy of an unsupervised app routine. |
| Balance Before You Need It | [NHS Balance exercises](https://www.nhs.uk/live-well/exercise/balance-exercises/), screen supported static and stepping options individually | The Cochrane review found a 23% lower fall rate across exercise programs in community-dwelling older adults (rate ratio 0.77, 95% CI 0.71–0.83). This is evidence for that population and those programs. It cannot predict decades-later fall risk from midlife participation. |
| Eyes, Head & Body | Eligned candidate shortlist above and Hall et al. for the clinical boundary | Hall et al. addresses diagnosed peripheral vestibular hypofunction. General coordination is a separate use case. Transfer to daily attention, relief of perimenopausal brain fog and prevention of vestibular disease remain unestablished here. |
| Move Through Space | [NHS Balance exercises](https://www.nhs.uk/live-well/exercise/balance-exercises/), screen the sideways walking option first | Directional stepping fits functional practice. Evidence from multicomponent older-adult programs is indirect for any single spatial drill, midlife outcomes and cognitive transfer. Review crossing and backward stepping separately for fall risk. |
| Heart & Brain Movement | [NHS Walking for health](https://www.nhs.uk/live-well/exercise/walking-for-health/) and [CDC activity intensity guidance](https://www.cdc.gov/physical-activity-basics/measuring/index.html) | Aerobic activity is established public-health guidance. The talk test can communicate relative intensity. The sources do not validate a Neural Orchard dose or demonstrate dementia prevention. |
| Flow & Restore | [NHS Flexibility exercises](https://www.nhs.uk/live-well/exercise/flexibility-exercises/), screen comfortable seated options first | This is a source for gentle mobility content. Long-term functional or cognitive benefit from any proposed app routine remains an evidence gap. |

### Core references

- World Health Organization. *WHO guidelines on physical activity and sedentary behaviour*. Geneva, 2020. ISBN 9789240015128. [WHO](https://www.who.int/publications/i/item/9789240015128/)
- Sherrington C, Fairhall NJ, Wallbank GK, et al. Exercise for preventing falls in older people living in the community. *Cochrane Database Syst Rev*. 2019;1:CD012424. [DOI](https://doi.org/10.1002/14651858.CD012424.pub2)
- Hall CD, Herdman SJ, Whitney SL, et al. Vestibular Rehabilitation for Peripheral Vestibular Hypofunction. *J Neurol Phys Ther*. 2022;46(2):118–177. [PubMed](https://pubmed.ncbi.nlm.nih.gov/34864777/)
- Watson SL, Weeks BK, Weis LJ, Harding AT, Horan SA, Beck BR. High-Intensity Resistance and Impact Training Improves Bone Mineral Density and Physical Function in Postmenopausal Women With Osteopenia and Osteoporosis. *J Bone Miner Res*. 2018;33(2):211–220. [DOI](https://doi.org/10.1002/jbmr.3284)

These sources support the design scope. They do not establish effectiveness or safety of the app itself. All six guided collections remain in development pending content review.

## Verification and remaining gates

- Headless Chromium through Playwright tested the checkout at 1440 × 900, 390 × 844, 320 × 568 and 844 × 390. Each passed entrance activation, paired row geometry, six destination headings, safety copy, collection status, the external channel link target, return actions and keyboard focus restoration.
- At each size the PPS doorway opened, Stargazer and Sentinel were enabled, and Breathe started and exited. Nourish Me and Sleep Sanctuary retained their existing unavailable states. At desktop size both games launched their own pages. Direct studio and Breathe entry URLs were smoke-tested.
- The regression run caught movement initialization on direct Breathe entry, where the home menu has already been replaced. The fix skips attaching an event listener when the movement entrance is absent. The subsequent run passed.
- Static assets were served from the checkout through Playwright request routing. The test used fallback fonts. It did not cover real mobile devices, screen readers, full game sessions, or YouTube playback.
- JavaScript syntax checks and the Git whitespace check passed. The movement module adds no external scripts, embeds, tracking, credentials, or personal data collection. The channel link opens a separate tab with opener protection.
- Before public release, review full videos and verify accessible instructions, caption quality, safety and attribution. Clinical claims or higher-risk movements need qualified review. Complete assistive technology and real-device checks before requesting release approval.

## Eyes, Head & Body collection QA — November 18, 2026

- Chromium through Playwright passed all six categories, pending-video visibility, the creator channel link, keyboard entry and return focus, the PPS doorway, and Breathe start and exit at 1440 × 900, 390 × 844, 320 × 568 and 844 × 390. Stargazer and Sentinel each launched on desktop.
- An isolated browser fixture passed all four cards at 1440 × 900, 390 × 844 and 320 × 568. It checked display labels, original titles, attribution, official watch URLs, separate-tab and opener protection attributes, keyboard focus, 44px link heights and horizontal fit. A record marked approved without a review record stayed hidden. The fixture approvals were applied in memory for testing only. All four committed records remain pending.
- Captured a mobile comparison of the current draft and the simulated approved layout. Browser checks used local assets through request routing and fallback fonts. They did not cover YouTube playback, screen readers or real devices.
- JavaScript syntax and Git whitespace checks passed. No browser test failures were observed in the completed run.

### Arch layout follow-up

The Eyes, Head & Body doorway now has one introductory sentence and session buttons. Each approved session opens its own view with a brief description, the official YouTube link, creator credit and a short safety cue. Back restores focus to the last session button. The scrollable content starts inside the arch curve.

Chromium passed pending-menu, simulated approved-menu and separate video-view checks at 1440 × 900, 390 × 844, 320 × 568 and 844 × 390. The checks covered horizontal fit, clipping at interactive elements, keyboard activation, focus restoration, and matching YouTube URLs with separate-tab and opener-protection attributes. PPS and Breathe smoke checks passed on desktop. Approvals were simulated only in the browser.

### Dance session under Move Through Space

The Dance session lives under Move Through Space. The list displays any approved records with category ID `dance`. Review a beginner-friendly routine with low-impact options before selecting a video. The rationale is based on repeated dance programs in older adults, not a single session. A review found better balance and mobility and fewer falls in dance-based mind-motor programs. Cognitive transfer and advantages over other exercise remain uncertain. [Falls and mobility review](https://pubmed.ncbi.nlm.nih.gov/32975570/) · [Cognitive outcomes review](https://academic.oup.com/ageing/article/50/4/1084/6041778)

### Strength and dance curation

Both collections group reviewed videos by Beginner, Intermediate, and Advanced. Levels are proposed for this audience and reflect coordination, pace, loading, or prior experience. All nine candidates remain pending. Official YouTube metadata matched the titles, creators, runtimes, and IDs and listed at least one English captions track for each. Caption accuracy and the quality of instructions throughout each full video still need review.

| Collection | Proposed level | Official video | Why it made the shortlist / what to check |
| --- | --- | --- | --- |
| Strength | Beginner | [National Institute on Aging strength workout](https://www.youtube.com/watch?v=JejTelL05Qw) | Designed for older adults. Check cueing, equipment and modifications throughout. |
| Strength | Intermediate | [yes2next intermediate strength](https://www.youtube.com/watch?v=8ohMPoJ9QQk) | Trainer April Hattori lists exercises and easier options. Review lunges, swings and cues. [Instructor background](https://yes2next.com/pages/about-us) |
| Strength | Advanced | [SeniorShape Strength & Pilates](https://www.youtube.com/watch?v=o-fjNgAGrW4) | Standing and floor work with weights plus warm-up and cooldown. The trainer reports ACE certification. Review floor transitions, cues and any supplement or menopause claims before approving. [Trainer background](https://www.youtube.com/@SeniorShapeFitness) |
| Dance | Beginner | [English National Ballet absolute beginner barre](https://www.youtube.com/watch?v=xSEN8teK6Zc) | James Muller teaches an adult beginner class. Check stability of home barre substitutes and consider the full class length. |
| Dance | Beginner | [Zumba Latin basics](https://www.youtube.com/watch?v=e5rW7qjd3BY) | Licensed instructor Mauricio Camargo breaks down four styles. Review turning, pace and low-impact options. [Instructor listing](https://www.zumba.com/es-ES/p/zjmauricio) |
| Dance | Beginner | [BBC Sport Bollywood Part 1](https://www.youtube.com/watch?v=3NomZw-KD34) | Choreographer Nisha Nath teaches the first section step by step. Review the practice pace and cue clarity. [BBC instructor and series notes](https://www.bbc.co.uk/sport/get-inspired/30518516) |
| Dance | Beginner | [Ailey Extension West African dance](https://www.youtube.com/watch?v=AeJlb-n89LA) | Maguette Camara teaches fundamentals with drum rhythms. Verify that the pace and impact fit the proposed level. [Ailey faculty bio](https://pressroom.ailey.org/the-ailey-extension/faculty/maguette-camara) |
| Dance | Intermediate | [BodyKinect contemporary combination](https://www.youtube.com/watch?v=VsPsy12RNS4) | The tutorial breaks down the combination before a practice run with counts and a run with music. The description asks viewers to warm up separately. Verify presenter attribution from the full video and review range of motion and transitions. |
| Dance | Advanced | [Kathryn Morgan Swan Lake barre](https://www.youtube.com/watch?v=RAXCbDOaSoY) | Former professional soloist. The creator labels it intermediate/advanced and emphasizes balance and alignment. Review combinations, prior ballet experience and barre setup. [Instructor bio](https://kathrynmorganonline.com/about/) |

The strength rationale uses the supervised [LIFTMOR trial](https://pubmed.ncbi.nlm.nih.gov/28975661/) and includes [adaptation guidance for osteoporosis](https://doi.org/10.1136/bjsports-2021-104634). These links describe the evidence and adaptation principles. The selected videos require their own review for cueing, equipment, pace and modifications before release.
