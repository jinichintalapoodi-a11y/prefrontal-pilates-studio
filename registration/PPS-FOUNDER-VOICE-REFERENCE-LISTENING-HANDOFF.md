# PPS Lab — Founder Voice Reference / Isolated Listening Comparison

**Status:** Founder direction approved; **audio selection pending**. No application integration, deployment, merge, purchase, or use of third-party video audio.

## Reference boundary
Founder supplied https://www.youtube.com/watch?v=_noquwycq78 only as a creative reference for **general** qualities: soft, quiet, airy, meditative, natural female delivery and relaxed articulation. The reference's audio must **not** be extracted, downloaded, repurposed, voice-cloned or used to target a speaker's identity. We have not relied on the video's actual content.

## Words
Exactly three original prompts: **Inhale**, **Hold**, **Exhale**. They must be spoken once at the beginning of the respective **4-second inhale / 4-second hold / 8-second exhale** phases. Preserve the current 3-second preparation countdown and existing 342/310/280 Hz tones. No voiced numbers or additional guidance.

## Listening comparison
A separate, self-contained, offline HTML audition was created in the founder chat as `pps_breathe_voice_listening_lab.zip`. This is **not integrated** with PPS. It:
- Reads voice names available in the browser using Web Speech API `speechSynthesis.getVoices()`.
- Lets the founder deliberately select **different actual voice identities** for candidates A, B, C. If the device provides fewer than three, it reports that fact; it never presents minor pitch differences as different voices.
- Speaks original phrase samples of the three words using available browser voices (not from video audio), offers a separately timed 4–4–8 cycle demonstration, and captures the chosen voice's name, language and relative settings for review.
- Does not upload data or call an application server or paid service.

**Limitation:** Browser voice inventory has no reliable gender or subjective naturalness metadata; selected output could be robotic, not female, or differ between Chrome and Safari. Browser/OS voices may use their own network synthesis and have separate terms. These samples are generated at playback time, **not distributable MP3 files**. A commercial, natural-sounding original audio pack has not yet been created or licensed. Do not assume the audition gives rights to export or embed browser voice recordings.

A connected premium speech-generation service was checked but requires a paid subscription; it was **not purchased or used**, in compliance with founder restrictions. Offline eSpeak-like voices were available but would not meet the natural/airy quality target, so they were not mislabeled as production candidates.

## Founder acceptance protocol
1. Unzip the chat attachment and open `index.html` in Chrome/Safari in a browser with Web Speech API support. If opening from local files is restricted, serve the folder locally with `python3 -m http.server 8000`; no deployment is involved.
2. Select three **different** named installed voices if available. Audition each speaking the three words.
3. Compare clarity, breathiness without excessive whispering, warmth, speaking rate and comfort; test a full 4–4–8 cycle as a separate verification.
4. Choose a candidate and copy the selection details to the founder review. Voice quality must be checked by ear.
5. If none meets the brief, request founder authorization for a specific licensed synthesis or voice-actor workflow **before any paid service** or external commercial audio generation.
6. Only after explicit approval may a selected, rights-cleared result be incorporated and re-tested on desktop/mobile devices. No merge/deploy.

## Unperformed tests
- No actual natural-voice MP3/WAV candidate exports were produced.
- No live Chrome/Safari audible evaluation and no genuine voice quality comparison by the founder has been recorded.
- The standalone JS syntax was checked, but browser execution in the container was blocked by environment policy; no browser screenshot is presented as evidence.
- No voice rights for downstream PPS audio packaging have been established.

**Release status:** HOLD, audio selection pending.