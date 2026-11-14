> **HISTORICAL / SUPERSEDED FOR MVP 1.1 (2026-11-13):** This mandatory-email registration proposal is retained for reference only. The founder-approved MVP 1.1 product direction has no mandatory email registration or authentication. See [MVP-1.1-ARCHITECTURE-PRIVACY-PLAN.md](MVP-1.1-ARCHITECTURE-PRIVACY-PLAN.md). No registration service is activated.

# Neural Orchard Registration MVP — Technical Audit & Implementation Gates

Status: architecture review; authentication NOT operational.
Base: production `main` at `b94d62c263d606c6ea48d1a33d83f346e890c02d`.
Branch: `feature/registration-mvp-v1`.
No existing game, navigation, artwork, asset, session, or progression files are modified by this document.

## Historical repository audit (2026-11-13)

The production repository has HTML/CSS/JS games with localStorage keys `stargazerLevel`, `sentinelLevel`, `ppsDailyPracticeV1`. No sign-up/login, approved-email list, verification, profiles database, Supabase client, or email service exists among the tracked production files. Historical branches checked: `checkpoint/sentinel-before-mound`, `feature/modular-align`, `feature/nourish-pilot`, `feature/sentinel`, `feature/sentinel-single-emergence`, and `hotfix/stargazer-exit-buttons-v1`. The Nourish pilot has a Cloudflare Access/JWT-protected Worker for an unrelated feature; it is not a participant-registration service. No existing authentication code is replaced.

## Proposed user flow (magic-link / passwordless, pending founder confirmation)

1. Founder privately maintains an exact-email allowlist (email normalized for lookup; invitation status, expiry, revocation).
2. Participant provides full name, preferred username, and approved email. Client validates formats, without displaying whether the email is on the allowlist.
3. Supabase Auth sends an email verification / magic link after a trusted before-user-created admission hook checks the server-side allowlist; subsequent returning login uses `shouldCreateUser:false`.
4. The link returns to an allowlisted preview callback URL using PKCE; client exchanges and checks session, confirmed email, allowlist authorization, and loads its own profile.
5. Name and preferred username are saved in the participant profile only after authenticated confirmation. The backend enforces username uniqueness and normalized constraints.
6. Returning users receive the greeting using the stored preferred username, not arbitrary browser-provided metadata.
7. Sign-out clears auth state. An expired/revoked session returns to the sign-in screen and cannot read protected data.

**Important:** Public GitHub Pages cannot prevent direct access to static `Stargaizer.html` and `Sentinel.html` files, even if `index.html` has an auth gate. To restrict the application itself to invited testers, deploy a separately approved access-controlled beta host (e.g. Cloudflare Access or equivalent) and protect all game HTML/assets. This is distinct from Supabase profile/database authorization. Do not advertise GitHub Pages as a secure private beta.

## Proposed Supabase model

- `private.beta_invites`: normalized email, invite status, issued/expires/revoked timestamps; no Data API access to anon/authenticated.
- `public.participant_profiles`: UUID primary key referencing `auth.users.id`, full_name, preferred_username, username_key (unique case-folded), created_at/updated_at.
- All exposed tables use RLS, explicit grants, and owner-only SELECT/INSERT/UPDATE. No public profile listing. Block authenticated access after invite revocation or if email remains unverified.
- Supabase Before User Created hook checks exact address against a currently active allowlist record; this is server-side, not a browser allowlist.
- Design a separate authorization check for existing sessions/revocation: creation hooks alone do NOT block already-created users.
- Never expose secret/service-role credentials in the browser, repo, GitHub Pages, or logs. Only the Supabase publishable key may appear in client code.
- Confirm email on; disable anonymous auth; allow only exact trusted redirect URLs; enable abuse protection, CAPTCHA and rate limits. Use dedicated transactional SMTP for the beta, not Supabase's restricted test mailer.
- Re-evaluate session expiration/revocation behavior: JWTs can remain valid until expiry; do not claim instantaneous server-side revocation without testing sensitive endpoint checks.
- Do not automatically migrate or attach previously saved progress. Treat `stargazerLevel`, `sentinelLevel`, and `ppsDailyPracticeV1` as device-local legacy data.

## Dependencies and decisions prior to activation

- Connect a nonproduction Supabase project with permission to configure Auth/SQL/RLS; test separate from production.
- Decide: is beta content private (requires private hosting or access-protected host), or is only participant data private?
- Confirm passwordless magic-link vs password flow, identity-email change/revocation policy, username uniqueness and moderation policy, invitation expiry.
- Configure exact preview domain, callback/redirect URLs and SMTP; secrets only in Supabase or secret storage.
- Verify email verification via actual inbox, unapproved signup rejection, RLS isolation and revocation using two distinct test users before activation.

## Acceptance matrix (currently NOT RUN)

Desktop 1440x900 and mobile 390x844:
- Approved first-time email: form -> email received -> link -> verified -> own profile -> greeting.
- Unapproved, expired, revoked email: generic response; no account activation or private data.
- Returning login -> persistent session on same device -> refresh -> greeting.
- Sign out -> session clears -> protected profile inaccessible; explicit expired/revoked session cases.
- Invalid username/full name, duplicate username, network failure, rate limit, expired/used link, wrong browser/device, stale PKCE.
- Two users cannot SELECT/INSERT/UPDATE each other's profiles, bypass registration, or enumerate invite list.
- Direct URLs to game files must be denied if genuinely private beta is required.
- Stargazer/Sentinel game mechanics, audio, artwork, navigation, localStorage keys and progress remain unaffected.

Release restrictions: no production merge/deploy, no DNS or hosting changes, no claims of operational authentication until E2E verified.


## Founder architecture decision — approved 2026-11-13

**Approved: Option A, account protection only.** The public GitHub Pages game pages and assets remain publicly accessible. Invitation-only admission applies to participant accounts and protected personal data, not to direct access to `Stargaizer.html` or `Sentinel.html`. Do not imply the beta content is private.

**Approved participant experience:** full name, preferred username, approved email; passwordless email verification; remembered authenticated session on the same device until sign-out, expiry or revocation; greeting from the protected participant profile. Do not store passwords or service-role credentials in the browser.

**Explicit release boundary:** this approval authorizes isolated development planning only. No merge to `main`, production deployment, DNS change, live Supabase activation, or unreviewed changes to games.

## Ordered implementation plan and gates

1. **Baseline and hotfix reconciliation (before feature code):** Verify `main` and the existing registration branch against their recorded SHAs. Inspect the Stargazer hotfix commit `16eb9bdede506c230fc0805539721078dc5aa313` (based on `b94d62c263d606c6ea48d1a33d83f346e890c02d`). Incorporate its `Stargaizer.html`-only CSS correction into the registration feature branch via a clean cherry-pick or equivalent reviewed patch. Preserve the exact approved scientific copy, navigation handlers and other game behavior. Confirm the registration branch comparison contains only the architecture/planning documentation and that specific Stargazer hotfix before adding authentication code. Do not touch production `main`. Re-run desktop/mobile exit-screen acceptance tests after integration; earlier testing does not replace regression testing.
2. **Nonproduction infrastructure:** Founder creates or authorizes a development Supabase project. Configure redirect allowlist, PKCE/passwordless email flow, SMTP, rate limits, CAPTCHA as appropriate, and separate dev credentials. No secret/service-role key in client assets. Document configuration without secrets.
3. **Admission and profiles:** Build private invitation allowlist with exact normalized emails and expiry/revocation. Enforce at account creation with a server-side hook, and separately enforce authorization for existing users/sessions. Create participant profiles linked to `auth.users`, with strict RLS, grants and uniqueness checks. Validate profile fields on the trusted side. Avoid account enumeration.
4. **Frontend integration:** Implement registration and returning sign-in as a separate module with loading, expired-link, retry and sign-out states. After verified authentication load only the participant's own profile; show the preferred username. Existing static game URLs stay public by design. No false claims of private game access.
5. **Progress isolation:** Preserve `stargazerLevel`, `sentinelLevel` and `ppsDailyPracticeV1` untouched; do not automatically bind existing local progress to an account. Specify behavior on shared devices and after sign-out.
6. **Acceptance/security gate:** Test approved and unapproved addresses, verified link redemption, refresh/persistent session, sign-out, session expiry/revocation, duplicate username, two-user RLS isolation, direct game URL access, mobile/desktop, and gameplay/audio/progress regression. Document actual screenshots and results; do not mark pending tests passed.
7. **Founder review:** Supply changed-file inventory, security checklist, evidence of test results, and a rollback plan. Seek separate explicit founder approval before any merge or production deployment.

**Unresolved configuration choices:** invitation expiry, username policy, email-change policy, and session lifetime. Use documented conservative development defaults and obtain founder approval before live activation.
