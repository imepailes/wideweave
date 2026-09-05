// Dual n-back — adaptive working-memory demo.
// Trial every 2.5s. Difficulty rises if rolling accuracy > 80%, falls
// below 50%, stays otherwise. Honest scoring — no gamey bonuses.

import { saveSession } from '../lib/history';

const N_MAX = 7;
const N_MIN = 2;
const TRIAL_MS = 2500;
const WINDOW = 20;

type Trial = { pos: number; aud: string; t: number };

const LETTERS = ['B', 'C', 'D', 'G', 'K', 'P', 'T', 'V'];

let nbCleanup: (() => void) | null = null;

export function disposeNB(): void {
  if (nbCleanup) {
    try { nbCleanup(); } catch { /* noop */ }
    nbCleanup = null;
  }
}

export function initNB(): void {
  disposeNB();
  const root = document.getElementById('nb');
  if (!root) return;

  const grid = document.getElementById('nb-grid');
  const nEl = document.getElementById('nb-n');
  const trialEl = document.getElementById('nb-trial');
  const letterEl = document.getElementById('nb-letter');
  const posBtn = document.getElementById('nb-pos');
  const audBtn = document.getElementById('nb-aud');
  const posBar = document.getElementById('nb-pos-bar') as HTMLElement | null;
  const audBar = document.getElementById('nb-aud-bar') as HTMLElement | null;
  const startBtn = document.getElementById('nb-start') as HTMLButtonElement | null;
  const startWrap = root.querySelector('.demo-nb__start') as HTMLElement | null;
  if (!grid || !nEl || !trialEl || !letterEl || !posBtn || !audBtn || !posBar || !audBar || !startBtn || !startWrap) return;

  const cells = Array.from(grid.querySelectorAll<HTMLElement>('.demo-nb__cell'));
  let audioCtx: AudioContext | null = null;
  let n = 2;
  let finalN = 2;
  const history: Trial[] = [];
  const posResults: boolean[] = [];
  const audResults: boolean[] = [];
  let pendingPos = false;
  let pendingAud = false;
  let timer = 0;
  let running = false;
  let trialCount = 0;
  let startedAt = 0;
  let saveInflight = false;

  const ensureAudio = () => {
    if (audioCtx) return audioCtx;
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      audioCtx = null;
    }
    return audioCtx;
  };

  const beep = (freq: number) => {
    const ctx = audioCtx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g).connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    o.start(now);
    o.stop(now + 0.2);
  };

  const draw = (trial: Trial | null) => {
    cells.forEach((c) => {
      c.removeAttribute('data-active');
      c.textContent = '';
    });
    if (!trial) return;
    cells[trial.pos].setAttribute('data-active', 'pos');
    cells[trial.pos].textContent = '●';
    letterEl.textContent = trial.aud;
  };

  const playTrial = (trial: Trial) => {
    draw(trial);
    const idx = LETTERS.indexOf(trial.aud);
    if (idx >= 0) beep(440 * Math.pow(2, idx / 12));
  };

  const nextTrial = (): Trial => {
    const pos = Math.floor(Math.random() * 9);
    const aud = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    return { pos, aud, t: performance.now() };
  };

  const tick = () => {
    if (!running) return;
    const trial = nextTrial();
    history.push(trial);
    if (history.length > N_MAX + 1) history.shift();
    pendingPos = false;
    pendingAud = false;
    posBtn.setAttribute('data-pressed', 'false');
    audBtn.setAttribute('data-pressed', 'false');
    playTrial(trial);
    trialCount++;
    trialEl.textContent = `trial ${trialCount} / ${WINDOW}`;
    timer = window.setTimeout(evaluate, TRIAL_MS);
  };

  const evaluate = () => {
    const last = history[history.length - 1];
    const ref = history.length - 1 - n;
    let posCorrect = false;
    let audCorrect = false;
    if (ref >= 0) {
      posCorrect = last.pos === history[ref].pos;
      audCorrect = last.aud === history[ref].aud;
    }
    const posMatch = pendingPos === posCorrect;
    const audMatch = pendingAud === audCorrect;
    posResults.push(posMatch);
    audResults.push(audMatch);
    if (posResults.length > WINDOW) posResults.shift();
    if (audResults.length > WINDOW) audResults.shift();

    const posAcc = posResults.filter(Boolean).length / posResults.length;
    const audAcc = audResults.filter(Boolean).length / audResults.length;
    const acc = (posAcc + audAcc) / 2;

    if (posResults.length >= 8) {
      if (acc > 0.80 && n < N_MAX) n++;
      else if (acc < 0.50 && n > N_MIN) n--;
    }

    nEl.textContent = String(n);
    posBar.style.width = `${(posAcc * 100).toFixed(0)}%`;
    audBar.style.width = `${(audAcc * 100).toFixed(0)}%`;

    if (trialCount >= WINDOW) {
      running = false;
      finalN = n;
      trialEl.textContent = `done · n reached ${n}`;
      startWrap.hidden = false;
      startBtn.textContent = 'Run again';
      finalize();
      return;
    }

    timer = window.setTimeout(tick, 250);
  };

  const finalize = () => {
    if (saveInflight) return;
    saveInflight = true;
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    const posAcc = posResults.length ? posResults.filter(Boolean).length / posResults.length : 0;
    const audAcc = audResults.length ? audResults.filter(Boolean).length / audResults.length : 0;
    const trialAcc = (posAcc + audAcc) / 2;
    void saveSession({
      module: 'nb',
      score: finalN,
      score_secondary: trialAcc,
      time_s: elapsed,
      trials: WINDOW,
      detail: { finalN, posAcc, audAcc, trialAcc }
    }).finally(() => { saveInflight = false; });
  };

  const onPos = () => { pendingPos = true; posBtn.setAttribute('data-pressed', 'true'); };
  const onAud = () => { pendingAud = true; audBtn.setAttribute('data-pressed', 'true'); };
  const onKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.code === 'Space' || e.key === 'f' || e.key === 'F') { e.preventDefault(); onPos(); }
    else if (e.key === 'j' || e.key === 'J') { e.preventDefault(); onAud(); }
  };
  const onVis = () => {
    if (document.hidden) {
      running = false;
      clearTimeout(timer);
    } else if (running) {
      tick();
    }
  };
  const onStart = () => {
    ensureAudio();
    n = 2;
    finalN = 2;
    history.length = 0;
    posResults.length = 0;
    audResults.length = 0;
    trialCount = 0;
    startedAt = Date.now();
    running = true;
    startWrap.hidden = true;
    nEl.textContent = '2';
    posBar.style.width = '0%';
    audBar.style.width = '0%';
    tick();
  };

  posBtn.addEventListener('click', onPos);
  audBtn.addEventListener('click', onAud);
  startBtn.addEventListener('click', onStart);
  window.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', onVis);

  // Initial UI
  nEl.textContent = '2';
  trialEl.textContent = 'ready';

  nbCleanup = () => {
    running = false;
    clearTimeout(timer);
    posBtn.removeEventListener('click', onPos);
    audBtn.removeEventListener('click', onAud);
    startBtn.removeEventListener('click', onStart);
    window.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVis);
    audioCtx?.close().catch(() => {});
    audioCtx = null;
  };
}
