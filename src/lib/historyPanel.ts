// History panel — shows the user's recent sessions for a single module.
// Renders a small sparkline + last 10 sessions in a compact list.
// Falls back to a "Sign in to see your history" prompt when not signed in,
// and to a "Complete a session to see your history" message when empty.

import { loadMyHistory, type Module, type SessionRow } from './history';
import { getAuthState } from './auth';
import { SUPABASE_CONFIGURED } from './supabase';

const SCORE_FORMAT: Record<Module, (r: SessionRow) => string> = {
  dat: (r) => `mean distance ${r.score.toFixed(3)}`,
  rat: (r) => `${r.detail.solved as number ?? 0}/6 solved`,
  cj: (r) => `${(r.score * 100).toFixed(0)}% efficient`,
  nb: (r) => `n-back reached ${r.score.toFixed(0)}${r.score_secondary != null ? ` · ${(r.score_secondary * 100).toFixed(0)}% acc` : ''}`,
  stroop: (r) => `${Math.round(r.score)}ms incongruent${r.score_secondary != null ? ` · ${(r.score_secondary * 100).toFixed(0)}% acc` : ''}`
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  if (ms < 7 * 86_400_000) return `${Math.round(ms / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function renderSparkline(rows: SessionRow[], module: Module): string {
  if (rows.length === 0) return '';
  // Reverse so left = oldest, right = newest.
  const ordered = rows.slice().reverse();
  const W = 200;
  const H = 40;
  const pad = 4;
  const min = Math.min(...ordered.map(r => r.score));
  const max = Math.max(...ordered.map(r => r.score));
  const range = max - min || 1;
  // For "higher is better" modules, top of chart = max. For "lower is better"
  // (NB, STROOP), top of chart = min — so the line goes UP when you improve.
  const invertY = module === 'nb' || module === 'stroop';
  const yMap = invertY
    ? (s: number) => pad + ((s - min) / range) * (H - pad * 2)
    : (s: number) => pad + (1 - (s - min) / range) * (H - pad * 2);
  const stepX = (W - pad * 2) / Math.max(ordered.length - 1, 1);
  const points = ordered.map((r, i) => `${pad + i * stepX},${yMap(r.score)}`);
  const line = `<polyline points="${points.join(' ')}" fill="none" stroke="#1B1B1B" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"/>`;
  const last = ordered[ordered.length - 1];
  const lastX = pad + (ordered.length - 1) * stepX;
  const lastY = yMap(last.score);
  const dot = `<circle cx="${lastX}" cy="${lastY}" r="2.5" fill="#1B1B1B"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Your last ${ordered.length} ${module} sessions">${line}${dot}</svg>`;
}

export function mountHistoryPanel(host: HTMLElement, module: Module): () => void {
  const render = (rows: SessionRow[]) => {
    const auth = getAuthState();
    if (auth.status === 'unconfigured' || !SUPABASE_CONFIGURED) {
      host.innerHTML = `
        <div class="history-panel history-panel--empty">
          <div class="history-panel__head">Your history</div>
          <div class="history-panel__body">
            History is local-only until Supabase is configured. The lab still scores every session honestly.
          </div>
        </div>`;
      return;
    }
    if (auth.status === 'loading') {
      host.innerHTML = `
        <div class="history-panel history-panel--loading">
          <div class="history-panel__head">Your history</div>
          <div class="history-panel__body">Loading…</div>
        </div>`;
      return;
    }
    if (auth.status === 'signed-in' && auth.isAnonymous) {
      host.innerHTML = `
        <div class="history-panel history-panel--empty">
          <div class="history-panel__head">Your history</div>
          <div class="history-panel__body">You're signed in anonymously. Sessions are saved. <a href="#" data-claim>Claim an email</a> to keep this across devices.</div>
        </div>`;
      return;
    }
    if (rows.length === 0) {
      host.innerHTML = `
        <div class="history-panel history-panel--empty">
          <div class="history-panel__head">Your history</div>
          <div class="history-panel__body">No ${module.toUpperCase()} sessions yet. Complete one above to start the graph.</div>
        </div>`;
      return;
    }
    const spark = renderSparkline(rows, module);
    const list = rows.slice(0, 10).map(r => `
      <li>
        <span class="history-panel__time">${timeAgo(r.created_at)}</span>
        <span class="history-panel__score">${SCORE_FORMAT[module](r)}</span>
        <span class="history-panel__detail">${r.trials ?? 1} trial${r.trials === 1 ? '' : 's'} · ${r.time_s}s</span>
      </li>`).join('');
    host.innerHTML = `
      <div class="history-panel">
        <div class="history-panel__head">
          <span>Your ${module.toUpperCase()} history</span>
          <span class="history-panel__count">${rows.length} session${rows.length === 1 ? '' : 's'}</span>
        </div>
        <div class="history-panel__chart">${spark}</div>
        <ul class="history-panel__list">${list}</ul>
      </div>`;
  };

  let rows: SessionRow[] = [];
  render([]);

  // Initial load
  if (SUPABASE_CONFIGURED) {
    void loadMyHistory(module).then(r => { rows = r; render(rows); });
  }

  // Refresh every 8s while mounted, so a freshly-completed session
  // appears in the list without a full page reload.
  const interval = window.setInterval(() => {
    if (SUPABASE_CONFIGURED) {
      void loadMyHistory(module).then(r => { rows = r; render(rows); });
    }
  }, 8000);

  // Also refresh on auth state change
  let prevAuth = getAuthState();
  const onAuthTick = window.setInterval(() => {
    const cur = getAuthState();
    if (cur.status !== prevAuth.status || (cur.status === 'signed-in' && prevAuth.status === 'signed-in' && cur.user.id !== prevAuth.user.id)) {
      prevAuth = cur;
      if (SUPABASE_CONFIGURED) void loadMyHistory(module).then(r => { rows = r; render(rows); });
    }
  }, 500);

  return () => {
    window.clearInterval(interval);
    window.clearInterval(onAuthTick);
    host.innerHTML = '';
  };
}
