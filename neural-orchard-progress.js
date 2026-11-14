/* Neural Orchard MVP 1.1 — device-only progress foundation.
 * No network calls, cookies, persistent participant identifiers, or analytics.
 * Integration into game-specific lifecycle is a separate reviewed change.
 */
(function () {
  'use strict';
  const KEY = 'neuralOrchardProgressV1';
  const MAX_SESSIONS = 200;
  const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
  const GAMES = ['stargazer', 'sentinel'];
  const OUTCOMES = ['completed', 'exited', 'interrupted'];
  const empty = () => ({schemaVersion: 1, sessions: [], dailyTotals: {}, lastUpdatedAt: null});
  const safeStorage = {
    read() { try { return localStorage.getItem(KEY); } catch (_) { return null; } },
    write(value) { try { localStorage.setItem(KEY, JSON.stringify(value)); return true; } catch (_) { return false; } }
  };
  function load() {
    try {
      const data = JSON.parse(safeStorage.read() || 'null');
      if (data && data.schemaVersion === 1 && Array.isArray(data.sessions)) {
        return {schemaVersion: 1, sessions: data.sessions, dailyTotals: data.dailyTotals || {}, lastUpdatedAt: data.lastUpdatedAt || null};
      }
    } catch (_) {}
    return empty();
  }
  function localDate(iso) {
    const d = new Date(iso);
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  }
  function record(session) {
    if (!session || !GAMES.includes(session.game) || !OUTCOMES.includes(session.outcome)) return false;
    const duration = Number(session.elapsedActiveMs);
    if (!Number.isFinite(duration) || duration < 0 || duration > 24*60*60*1000) return false;
    const ended = new Date(session.endTimeISO || Date.now());
    if (!Number.isFinite(ended.getTime())) return false;
    const game = session.game;
    const entry = {
      game,
      outcome: session.outcome,
      endTimeISO: ended.toISOString(),
      elapsedActiveMs: Math.round(duration),
      levelAtStart: Number.isSafeInteger(session.levelAtStart) ? session.levelAtStart : null,
      levelAtEnd: Number.isSafeInteger(session.levelAtEnd) ? session.levelAtEnd : null
    };
    const data = load();
    const date = localDate(entry.endTimeISO);
    if (!data.dailyTotals[date]) data.dailyTotals[date] = {stargazer: 0, sentinel: 0};
    data.dailyTotals[date][game] = (Number(data.dailyTotals[date][game]) || 0) + entry.elapsedActiveMs;
    data.sessions.push(entry);
    const cutoff = Date.now() - MAX_AGE_MS;
    data.sessions = data.sessions.filter(s => Date.parse(s.endTimeISO) >= cutoff).slice(-MAX_SESSIONS);
    for (const key of Object.keys(data.dailyTotals)) {
      if (Date.parse(key+'T23:59:59') < cutoff) delete data.dailyTotals[key];
    }
    data.lastUpdatedAt = new Date().toISOString();
    return safeStorage.write(data);
  }
  function summary() {
    const data = load();
    const games = {};
    for (const game of GAMES) {
      const sessions = data.sessions.filter(s => s.game === game);
      const activeMs = Object.values(data.dailyTotals).reduce((sum, day) => sum + (Number(day[game]) || 0), 0);
      games[game] = {
        recordedSessions: sessions.length,
        activeMs,
        averageSessionMs: sessions.length ? Math.round(sessions.reduce((n,s)=>n+s.elapsedActiveMs,0)/sessions.length) : 0,
        completed: sessions.filter(s => s.outcome === 'completed').length,
        exited: sessions.filter(s => s.outcome === 'exited').length,
        interrupted: sessions.filter(s => s.outcome === 'interrupted').length
      };
    }
    return {games, dailyTotals: data.dailyTotals, historyStartsWithMvp11: true};
  }
  window.NeuralOrchardProgress = Object.freeze({load, record, summary});
})();
