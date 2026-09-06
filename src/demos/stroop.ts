// Stroop training module — 60 trials per session, balanced congruent
// and incongruent. The user keys the COLOR (not the word). Per-trial
// feedback (✓/✗ + RT) is shown live, with a running RT chart at the
// bottom. The session saves mean incongruent RT (correct trials only)
// as the score — this is the metric the literature uses and the same
// one the transfer battery reports, so a session here and a battery
// run are directly comparable.

import { saveSession, loadMyHistory, type SessionRow } from '../lib/history';
import { STROOP_COLORS } from '../lib/batteryStimuli';

const KEY_FOR_HEX: Record<string, string> = {
  [STROOP_COLORS[0].hex]: 'r',
  [STROOP_COLORS[1].hex]: 'b',
  [STROOP_COLORS[2].hex]: 'g',
  [STROOP_COLORS[3].hex]: 'y'
};

const KEY_INFO: { key: string; word: string; hex: string }[] = [
  { key: 'r', word: 'RED',    hex: STROOP_COLORS[0].hex },
  { key: 'b', word: 'BLUE',   hex: STROOP_COLORS[1].hex },
  { key: 'g', word: 'GREEN',  hex: STROOP_COLORS[2].hex },
  { key: 'y', word: 'YELLOW', hex: STROOP_COLORS[3].hex }
];

const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW'] as const;
type ColorName = typeof COLOR_NAMES[number];

const TRIALS_PER_SESSION = 60;
const ITI_MIN_MS = 500;
const ITI_MAX_MS = 800;
// MacLeod (1991) review reports typical adult incongruent RTs in
// the 600-900ms range across the studies summarised. We do not have
// an age-stratified mean+SD for 25-34 specifically; using a single
// 720ms number as if it were a precise age-band baseline would be
// false precision. We use the range instead.
const PUBLISHED_RANGE = { minMs: 600, maxMs: 900, citation: 'MacLeod (1991), Psychological Bulletin 109(2), 163-203' };

type Trial = {
  word: ColorName;
  color: string;
  congruent: boolean;
  expected: string;
  correct: boolean | null;
  rt: number | null;
};

function colorNameForHex(hex: string): ColorName | null {
  for (const c of STROOP_COLORS) {
    if (c.hex === hex) return c.word.toUpperCase() as ColorName;
  }
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTrials(difficulty: number): Trial[] {
  const targetIncongruent = Math.round(TRIALS_PER_SESSION * (0.5 + 0.3 * difficulty));
  const targetCongruent = TRIALS_PER_SESSION - targetIncongruent;
  const out: Trial[] = [];
  for (let k = 0; k < targetCongruent; k++) {
    const color = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    const word = colorNameForHex(color.hex) ?? 'RED';
    out.push({ word, color: color.hex, congruent: true, expected: KEY_FOR_HEX[color.hex], correct: null, rt: null });
  }
  for (let k = 0; k < targetIncongruent; k++) {
    let colorHex: string;
    let word: ColorName;
    do {
      colorHex = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)].hex;
      word = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    } while (colorNameForHex(colorHex) === word);
    out.push({ word, color: colorHex, congruent: false, expected: KEY_FOR_HEX[colorHex], correct: null, rt: null });
  }
  return shuffle(out);
}

function itiMs(): number { return ITI_MIN_MS + Math.floor(Math.random() * (ITI_MAX_MS - ITI_MIN_MS)); }
function mean(xs: number[]): number { if (xs.length === 0) return 0; return xs.reduce((a, b) => a + b, 0) / xs.length; }

function computeStats(trials: Trial[]) {
  const completed = trials.filter(t => t.correct != null);
  const correctIncongruent = completed.filter(t => !t.congruent && t.correct);
  const correctCongruent = completed.filter(t => t.congruent && t.correct);
  const incRTs = correctIncongruent.map(t => t.rt!);
  const conRTs = correctCongruent.map(t => t.rt!);
  const meanC = mean(conRTs);
  const meanI = mean(incRTs);
  const stroop = Math.max(0, Math.round(meanI - meanC));
  const incTotal = completed.filter(t => !t.congruent).length;
  const conTotal = completed.filter(t => t.congruent).length;
  return {
    meanC: Math.round(meanC),
    meanI: Math.round(meanI),
    stroop,
    incongruentAcc: incTotal === 0 ? 0 : correctIncongruent.length / incTotal,
    congruentAcc: conTotal === 0 ? 0 : correctCongruent.length / conTotal,
    nIncongruentCorrect: incRTs.length,
    nTotal: completed.length
  };
}

function renderChart(trials: Trial[], maxRT: number): string {
  const W = 600, H = 60, pad = 4;
  const stepX = (W - pad * 2) / Math.max(trials.length, 1);
  const bars = trials.map((t, idx) => {
    if (t.rt == null) return '';
    const x = pad + idx * stepX;
    const h = Math.max(2, (t.rt / maxRT) * (H / 2 - pad));
    const y = t.congruent ? (H / 2 - h) : (H / 2);
    const fill = t.correct ? (t.congruent ? 'var(--ink-3)' : 'var(--ink-1)') : 'var(--danger, #d14b4b)';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(stepX * 0.7).toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" rx="0.5"/>`;
  }).join('');
  return `<svg class="demo-stroop__chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Per-trial reaction time">
    <line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="var(--border-soft)" stroke-width="0.5"/>
    ${bars}
  </svg>`;
}

function buildSummaryHTML(stats: ReturnType<typeof computeStats>, completed: number, elapsed: number, aborted: boolean, prior: SessionRow[], saveStatus: 'saved' | 'skipped' | 'failed', saveError: string | null): string {
  const last5 = prior.slice(0, 5);
  const last5Avg = last5.length > 0 ? mean(last5.map(r => r.score)) : null;
  // Honest comparison to the published range, not a fabricated mean.
  // For Stroop, lower incongruent RT is better. We compare against
  // the published healthy-adult range from MacLeod 1991.
  const inRange = stats.meanI >= PUBLISHED_RANGE.minMs && stats.meanI <= PUBLISHED_RANGE.maxMs;
  const withinText = inRange
    ? `Your mean incongruent RT (${Math.round(stats.meanI)}ms) is within the published healthy-adult range (${PUBLISHED_RANGE.minMs}–${PUBLISHED_RANGE.maxMs}ms).`
    : stats.meanI < PUBLISHED_RANGE.minMs
      ? `Your mean incongruent RT (${Math.round(stats.meanI)}ms) is below the published lower end of the healthy-adult range (${PUBLISHED_RANGE.minMs}–${PUBLISHED_RANGE.maxMs}ms) — faster than the published typical.`
      : `Your mean incongruent RT (${Math.round(stats.meanI)}ms) is above the published upper end of the healthy-adult range (${PUBLISHED_RANGE.minMs}–${PUBLISHED_RANGE.maxMs}ms) — slower than the published typical.`;
  let compare = '';
  if (aborted) {
    compare = `<p>Session ended at trial ${completed}. Sessions save with at least 30 trials and 8 correct incongruent trials. The chart above shows what you got.</p>`;
  } else if (saveStatus === 'failed') {
    const isMigration = (saveError ?? '').includes('check constraint');
    if (isMigration) {
      compare = `<p><strong>Not saved — migration needed.</strong> The <code>sessions</code> table doesn't yet allow the <code>stroop</code> module. Run <code>supabase/migrations/0003_stroop.sql</code> in the Supabase SQL editor to enable persistence. Your result is real and will save on the next session.</p>`;
    } else {
      compare = `<p><strong>Not saved.</strong> Your result is real, but the save failed: <code>${saveError ?? 'unknown'}</code>. Try a session after running the migration.</p>`;
    }
  } else if (last5Avg == null && saveStatus === 'saved') {
    compare = `<p>First saved session. ${withinText} Future sessions will compare against your own past sessions, not against the literature.</p>`;
  } else if (last5Avg != null) {
    const delta = stats.meanI - last5Avg;
    const sign = delta < 0 ? '−' : '+';
    const dir = delta < 0 ? 'faster' : 'slower';
    compare = `<p>You are <strong>${sign}${Math.abs(Math.round(delta))}ms</strong> ${dir} than your last ${last5.length} session${last5.length === 1 ? '' : 's'} average. ${withinText}</p>`;
  } else {
    // saveStatus === 'skipped' — less than 30 trials or too few correct incongruent
    compare = `<p>Session ended with ${completed} trials. Sessions save with at least 30 trials and 8 correct incongruent trials. The chart above shows what you got.</p>`;
  }
  return `
    <div class="demo-stroop__summary-head">
      <span class="t-eyebrow">${aborted ? 'Session ended early' : 'Session complete'}</span>
      <span>${completed} / ${TRIALS_PER_SESSION} trials · ${elapsed}s</span>
    </div>
    <div class="demo-stroop__summary-grid">
      <div class="demo-stroop__stat">
        <span class="demo-stroop__stat-num">${stats.meanI}<span class="demo-stroop__stat-unit">ms</span></span>
        <span class="demo-stroop__stat-label">mean incongruent RT</span>
      </div>
      <div class="demo-stroop__stat">
        <span class="demo-stroop__stat-num">${stats.meanC}<span class="demo-stroop__stat-unit">ms</span></span>
        <span class="demo-stroop__stat-label">mean congruent RT</span>
      </div>
      <div class="demo-stroop__stat">
        <span class="demo-stroop__stat-num">${stats.stroop}<span class="demo-stroop__stat-unit">ms</span></span>
        <span class="demo-stroop__stat-label">Stroop effect</span>
      </div>
      <div class="demo-stroop__stat">
        <span class="demo-stroop__stat-num">${(stats.incongruentAcc * 100).toFixed(0)}<span class="demo-stroop__stat-unit">%</span></span>
        <span class="demo-stroop__stat-label">incongruent accuracy</span>
      </div>
    </div>
    <div class="demo-stroop__summary-note">${compare}</div>
    <div class="demo-stroop__summary-actions">
      <button type="button" class="btn btn--primary" data-restart>Run another session</button>
      <a class="btn btn--ghost" href="/transfer">Compare to the transfer battery →</a>
    </div>
  `;
}

let stroopCleanup: (() => void) | null = null;

export function disposeStroop(): void {
  if (stroopCleanup) {
    try { stroopCleanup(); } catch { /* noop */ }
    stroopCleanup = null;
  }
}

export function initStroop(): () => void {
  disposeStroop();
  const root = document.getElementById('stroop');
  if (!root) return () => {};
  const baseMount = root.querySelector<HTMLElement>('#stroop-mount');
  if (!baseMount) return () => {};

  let difficulty = 0;
  let trials: Trial[] = [];
  let i = 0;
  let running = false;
  let disposed = false;
  let saveInflight = false;
  let trialStart = 0;
  let itiTimer: number | null = null;
  let startedAt = 0;
  let rts: number[] = [];
  let history: SessionRow[] = [];

  function refreshHistory() {
    void loadMyHistory('stroop', 30).then((rows) => { history = rows; });
  }
  refreshHistory();

  function mountStage() {
    baseMount!.innerHTML = `
      <div class="demo-stroop">
        <div class="demo-stroop__row">
          <div class="demo-stroop__counter">
            <span class="demo-stroop__num" data-i>0</span>
            <span class="demo-stroop__of">/ ${TRIALS_PER_SESSION} trials</span>
          </div>
          <div class="demo-stroop__live">
            <span class="demo-stroop__label">Session mean (incongruent)</span>
            <span class="demo-stroop__score" data-rt>—</span>
          </div>
        </div>
        <div class="demo-stroop__stage">
          <div class="demo-stroop__word" data-word>Press SPACE to start</div>
        </div>
        <div class="demo-stroop__legend" aria-hidden="true">
          ${KEY_INFO.map(k => `<span class="demo-stroop__key"><kbd style="color: ${k.hex}">${k.key.toUpperCase()}</kbd><span>${k.word}</span></span>`).join('')}
        </div>
        <div class="demo-stroop__chart-wrap" data-chart></div>
        <div class="demo-stroop__legend-row">Press <kbd>R</kbd> <kbd>B</kbd> <kbd>G</kbd> <kbd>Y</kbd> for the COLOR — not the word. <span class="demo-stroop__esc">Press <kbd>Esc</kbd> to end the session.</span></div>
      </div>
    `;
  }
  mountStage();

  const $word = () => baseMount!.querySelector<HTMLElement>('[data-word]')!;
  const $i = () => baseMount!.querySelector<HTMLElement>('[data-i]')!;
  const $rt = () => baseMount!.querySelector<HTMLElement>('[data-rt]')!;
  const $chart = () => baseMount!.querySelector<HTMLElement>('[data-chart]')!;

  function updateLiveStats() {
    $i().textContent = String(i);
    const inc = trials.slice(0, i).filter(t => !t.congruent && t.correct && t.rt != null).map(t => t.rt!);
    $rt().textContent = inc.length > 0 ? `${Math.round(mean(inc))} ms` : '—';
    const maxRT = Math.max(200, ...rts);
    $chart().innerHTML = renderChart(trials.slice(0, i), maxRT);
  }

  function showNext() {
    if (disposed) return;
    const trial = trials[i];
    if (!trial) return;
    const w = $word();
    w.textContent = trial.word;
    w.style.color = trial.color;
    w.dataset.feedback = '';
    trialStart = performance.now();
  }

  function startSession() {
    running = true;
    startedAt = Date.now();
    i = 0;
    rts = [];
    trials = buildTrials(difficulty);
    updateLiveStats();
    if (itiTimer) clearTimeout(itiTimer);
    itiTimer = window.setTimeout(showNext, 600);
  }

  async function showSummary(aborted: boolean) {
    if (saveInflight) return;
    const completed = trials.slice(0, i);
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    const stats = computeStats(completed);
    const enoughForSave = completed.length >= 30 && stats.nIncongruentCorrect >= 8;
    let saveStatus: 'saved' | 'skipped' | 'failed' = 'skipped';
    let saveError: string | null = null;
    if (!aborted && enoughForSave) {
      saveInflight = true;
      const res = await saveSession({
        module: 'stroop',
        score: stats.meanI,
        score_secondary: stats.incongruentAcc,
        time_s: elapsed,
        trials: completed.length,
        detail: {
          per_trial: completed.map(t => ({
            word: t.word, color: t.color, congruent: t.congruent,
            correct: !!t.correct, rt: Math.round(t.rt ?? 0)
          })),
          mean_congruent_ms: stats.meanC,
          mean_incongruent_ms: stats.meanI,
          stroop_effect_ms: stats.stroop,
          incongruent_acc: stats.incongruentAcc,
          congruent_acc: stats.congruentAcc,
          difficulty
        }
      });
      saveInflight = false;
      if (res.ok) {
        saveStatus = 'saved';
        refreshHistory();
      } else {
        saveStatus = 'failed';
        saveError = res.error ?? 'unknown';
      }
    }
    const summary = document.createElement('div');
    summary.className = 'demo-stroop__summary';
    summary.innerHTML = buildSummaryHTML(stats, completed.length, elapsed, aborted, history, saveStatus, saveError);
    baseMount!.innerHTML = '';
    baseMount!.appendChild(summary);
    summary.querySelector<HTMLButtonElement>('[data-restart]')?.addEventListener('click', () => {
      mountStage();
      trials = []; i = 0; rts = []; running = false;
    });
  }

  function endSession(aborted: boolean) {
    if (!running) return;
    running = false;
    if (itiTimer) { clearTimeout(itiTimer); itiTimer = null; }
    void showSummary(aborted);
  }

  const onKey = (e: KeyboardEvent) => {
    if (disposed) return;
    const t = e.target as HTMLElement;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { e.preventDefault(); endSession(true); return; }
    if (!running) {
      if (k === ' ' || k === 'enter') { e.preventDefault(); startSession(); }
      return;
    }
    if (!['r', 'b', 'g', 'y'].includes(k)) return;
    e.preventDefault();
    const trial = trials[i];
    if (!trial) return;
    const correct = trial.expected === k;
    const rt = performance.now() - trialStart;
    trial.correct = correct;
    trial.rt = rt;
    rts.push(rt);
    i++;
    updateLiveStats();
    if (i >= trials.length) {
      endSession(false);
    } else {
      if (itiTimer) clearTimeout(itiTimer);
      itiTimer = window.setTimeout(showNext, itiMs());
    }
  };

  window.addEventListener('keydown', onKey);
  stroopCleanup = () => {
    disposed = true;
    window.removeEventListener('keydown', onKey);
    if (itiTimer) clearTimeout(itiTimer);
  };
  return stroopCleanup;
}
