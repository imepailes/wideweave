// RAT — Remote Associates Test demo.
// Hand-curated triplets with their accepted solutions. Generation only.

import { saveSession } from '../lib/history';

const PUZZLES: { words: [string, string, string]; solutions: string[] }[] = [
  { words: ['cottage', 'swiss', 'cake'], solutions: ['cheese'] },
  { words: ['sleeping', 'bean', 'bag'], solutions: ['sack'] },
  { words: ['water', 'fall', 'house'], solutions: ['power'] },
  { words: ['fox', 'hole', 'palm'], solutions: ['tree'] },
  { words: ['dream', 'break', 'light'], solutions: ['day', 'daybreak', 'daylight'] },
  { words: ['rocking', 'horse', 'fly'], solutions: ['house'] }
];

let ratCleanup: (() => void) | null = null;

export function disposeRAT(): void {
  if (ratCleanup) {
    try { ratCleanup(); } catch { /* noop */ }
    ratCleanup = null;
  }
}

export function initRAT(): void {
  disposeRAT();
  const root = document.getElementById('rat');
  if (!root) return;

  const promptEl = document.getElementById('rat-prompt');
  const input = document.getElementById('rat-input') as HTMLInputElement | null;
  const skip = document.getElementById('rat-skip') as HTMLButtonElement | null;
  const reveal = document.getElementById('rat-reveal') as HTMLButtonElement | null;
  const feedback = document.getElementById('rat-feedback');
  const ix = document.getElementById('rat-ix');
  const bar = document.getElementById('rat-bar');
  if (!promptEl || !input || !skip || !feedback || !ix || !bar) return;

  let i = 0;
  let solved = 0;
  let revealed = false;
  const start = Date.now();
  const guesses: string[] = [];
  const wordsSeen: string[] = [];
  let saveInflight = false;

  const load = () => {
    const p = PUZZLES[i % PUZZLES.length];
    wordsSeen.push(...p.words);
    promptEl.innerHTML = p.words
      .map((w) => `<span class="demo-rat__word">${w}</span>`)
      .join(' <span class="demo-rat__sep">·</span> ');
    input.value = '';
    input.disabled = false;
    ix.textContent = `${Math.min(i + 1, PUZZLES.length)} / ${PUZZLES.length}`;
    bar.style.setProperty('--w', `${((i) / PUZZLES.length) * 100}%`);
    feedback.innerHTML = 'Type a single word. 90s per puzzle.';
    feedback.dataset.state = '';
    if (reveal) reveal.hidden = true;
    revealed = false;
    input.focus();
  };

  const finalize = () => {
    if (saveInflight) return;
    saveInflight = true;
    const elapsed = Math.round((Date.now() - start) / 1000);
    const score = solved / PUZZLES.length;
    void saveSession({
      module: 'rat',
      score,
      time_s: elapsed,
      trials: PUZZLES.length,
      detail: { solved, revealed: 0, skipped: 0, words: wordsSeen.slice(), guesses: guesses.slice() }
    }).finally(() => { saveInflight = false; });
  };

  const check = () => {
    const p = PUZZLES[i % PUZZLES.length];
    const guess = input.value.trim().toLowerCase();
    if (!guess) return;
    guesses.push(guess);
    if (p.solutions.includes(guess)) {
      solved++;
      feedback.innerHTML = `<strong>Linked.</strong> ${p.words.join(' · ')} + <strong>${guess}</strong>.`;
      feedback.dataset.state = 'ok';
      i++;
      if (i >= PUZZLES.length) {
        finalize();
      } else {
        setTimeout(load, 1100);
      }
    } else {
      feedback.innerHTML = `Not the link. Generation, not selection — try again.`;
      feedback.dataset.state = 'miss';
      input.select();
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      check();
    }
  };
  const onSkip = () => {
    i++;
    if (i >= PUZZLES.length) {
      finalize();
    } else {
      load();
    }
  };
  const onReveal = () => {
    if (revealed) return;
    const p = PUZZLES[i % PUZZLES.length];
    feedback.innerHTML = `Solution: <strong>${p.solutions[0]}</strong> — the move still doesn't count.`;
    feedback.dataset.state = 'reveal';
    revealed = true;
    if (reveal) reveal.hidden = true;
  };

  input.addEventListener('keydown', onKey);
  skip.addEventListener('click', onSkip);
  if (reveal) reveal.addEventListener('click', onReveal);

  // 90s timer per puzzle
  const tick = () => {
    if (i >= PUZZLES.length) return;
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > 90 && i < PUZZLES.length) {
      feedback.innerHTML = `Time. ${90}s is up — next.`;
      i++;
      if (i >= PUZZLES.length) {
        finalize();
      } else {
        setTimeout(load, 900);
      }
    }
  };
  const interval = window.setInterval(tick, 1000);

  load();

  ratCleanup = () => {
    input.removeEventListener('keydown', onKey);
    skip.removeEventListener('click', onSkip);
    if (reveal) reveal.removeEventListener('click', onReveal);
    window.clearInterval(interval);
  };
}
