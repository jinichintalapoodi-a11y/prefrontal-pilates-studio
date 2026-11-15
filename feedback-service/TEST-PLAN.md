# Founder feedback QA acceptance matrix — NOT yet end-to-end tested

| Test | Required observation |
|---|---|
| Synthetic valid Stargazer / Sentinel | Accepted by authenticated /api/qa/seed, dashboard counts correct |
| Skip | Both exit navigation buttons available without submission |
| Optional comments blank | Accepted; schema stores empty strings |
| Missing/invalid rating | 400, no DB row |
| Extra fields including nickname, email, device/session ID | 400, no DB row |
| Network failure | Form preserves all entered answers, accessible retry |
| Repeated click | Pending button disabled, only one request; document acknowledgement-loss duplicate risk |
| No endpoint configuration | No fetch, truthful preview-only message |
| Admin absent/invalid/expired JWT | 403 for dashboard HTML, scripts, JSON, CSV and deletions |
| Valid JWT but not authorized founder | 403 |
| Admin filtered views | all / Stargazer / Sentinel and 7,30,90-day date filters |
| Admin XSS safety | A synthetic `<script>` comment displays literally and cannot execute |
| CSV formula injection | Leading =, +, -, @ values escaped; CSV secured with Access |
| Delete one and filtered all | Explicit confirmation, correct records removed |
| Cron expiry | Rows older than exactly 90 days removed; no younger rows removed |
| D1 backup logs | Retention disclosed; restoration/backup deletion policy reviewed |
| Network/body logs | No raw payload, nickname, IP, agent, comment or tokens logged by application |
| Game isolation | Existing audio, scoring, progress, artwork, navigation unaffected |
| Desktop/mobile screenshots | Actual 1440x900 and 390x844 dashboard and feedback images captured |
| Production | main SHA unchanged; no deployment or real feedback requests |

**All live/private-platform tests pending until an authorized Cloudflare staging environment exists.**
