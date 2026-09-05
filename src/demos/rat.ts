// RAT — Remote Associates Test demo.
// Hand-curated triplets with their accepted solutions. Generation only.
// Items are tracked in module_items so the spaced-rep drill can revisit
// them. Each session picks puzzles with priority: due items first, then
// new items. Reviews are recorded per puzzle at session end.

import { saveSession } from '../lib/history';
import { getOrCreateItem, loadDueItems, type DueItem } from '../lib/spacedRecall';
import { RAT_PUZZLES, type RatPuzzle } from '../lib/recallItems';

const PUZZLES: { words: [string, string, string]; solutions: string[] }[] = RAT_PUZZLES.map(p => ({ words: p.words, solutions: p.solutions }));

let ratCleanup: (() => void) | null = null;

export function disposeRAT(): void {
  if (ratCleanup) {
    try { ratCleanup(); } catch { /* noop */ }
    ratCleanup = null;
  }
}

type PickedPuzzle = RatPuzzle & { _dueItemId: number | null; _correct: boolean | null };

// Pick N puzzles: first, items the user has due for review; then unseen
// items. Falls back to in-memory shuffle if the user has no items at all.
async function pickSessionPuzzles(n: number): Promise<PickedPuzzle[]> {
  let due: DueItem[] = [];
  try { due = await loadDueItems('rat', 50); } catch { /* noop */ }
  // Match due items back to the bank by item_key
  const dueByKey = new Map(due.map(d => [d.item_key, d.item_id]));
  const seenKeys = new Set<string>(dueByKey.keys());
  // For due items, the puzzle is in the bank
  const duePuzzles: PickedPuzzle[] = due
    .map(d => RAT_PUZZLES.find(p => p.id === d.item_key))
    .filter((p): p is RatPuzzle => !!p)
    .slice(0, n)
    .map(p => ({ ...p, _dueItemId: dueByKey.get(p.id) ?? null, _correct: null }));
  if (duePuzzles.length >= n) return duePuzzles;
  // Fill with unseen puzzles
  const rest = RAT_PUZZLES.filter(p => !seenKeys.has(p.id));
  // Shuffle the unseen and take the first (n - duePuzzles.length)
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const fillers: PickedPuzzle[] = rest.slice(0, n - duePuzzles.length).map(p => ({ ...p, _dueItemId: null, _correct: null }));
  // Combine and shuffle so the user doesn't see all "due" first
  return [...duePuzzles, ...fillers].sort(() => Math.random() - 0.5);
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
  let revealed = 0;
  let skipped = 0;
  let wrongGuess = 0;
  const start = Date.now();
  const guesses: string[] = [];
  const wordsSeen: string[] = [];
  let saveInflight = false;
  let puzzles: PickedPuzzle[] = [];

  const load = () => {
    const p = puzzles[i];
    if (!p) return;
    wordsSeen.push(...p.words);
    promptEl.innerHTML = p.words
      .map((w) => `<span class="demo-rat__word">${w}</span>`)
      .join(' <span class="demo-rat__sep">·</span> ');
    input!.value = '';
    input!.disabled = false;
    ix!.textContent = `${Math.min(i + 1, puzzles.length)} / ${puzzles.length}`;
    bar!.style.setProperty('--w', `${((i) / puzzles.length) * 100}%`);
    feedback!.innerHTML = 'Type a single word. 90s per puzzle.';
    feedback!.dataset.state = '';
    if (reveal) reveal.hidden = false;
    revealed = 0;
    input!.focus();
  };

  const finalize = async () => {
    if (saveInflight) return;
    saveInflight = true;
    const elapsed = Math.round((Date.now() - start) / 1000);
    const score = solved / puzzles.length;
    try {
      await saveSession({
        module: 'rat',
        score,
        time_s: elapsed,
        trials: puzzles.length,
        detail: { solved, revealed, skipped, words: wordsSeen.slice(), guesses: guesses.slice() }
      });
      // After session saves, upsert items and record reviews for each
      // puzzle the user saw. Review correctness is "solved" if they got
      // the right answer; otherwise "missed" (reveal, skip, or wrong
      // guess that timed out).
      for (const p of puzzles) {
        const correct = p._correct === true;
        const created = await getOrCreateItem('rat', p.id, p.words.join(' · '), {
          words: p.words,
          answer: p.solutions[0],
          solutions: p.solutions
        });
        if (created.ok && created.item) {
          // Lazy import to avoid circular reference
          const { recordReview } = await import('../lib/spacedRecall');
          await recordReview(created.item.id, correct);
        }
      }
    } finally {
      saveInflight = false;
    }
  };

  const check = () => {
    const p = puzzles[i];
    if (!p) return;
    const guess = input!.value.trim().toLowerCase();
    if (!guess) return;
    guesses.push(guess);
    if (p.solutions.includes(guess)) {
      solved++;
      p._correct = true;
      feedback!.innerHTML = `<strong>Linked.</strong> ${p.words.join(' · ')} + <strong>${guess}</strong>.`;
      feedback!.dataset.state = 'ok';
      i++;
      if (i >= puzzles.length) {
        finalize();
      } else {
        setTimeout(load, 1100);
      }
    } else {
      wrongGuess++;
      feedback!.innerHTML = `Not the link. Generation, not selection — try again.`;
      feedback!.dataset.state = 'miss';
      input!.select();
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      check();
    }
  };
  const onSkip = () => {
    const p = puzzles[i];
    if (p) p._correct = false;
    skipped++;
    i++;
    if (i >= puzzles.length) {
      finalize();
    } else {
      load();
    }
  };
  const onReveal = () => {
    if (revealed) return;
    const p = puzzles[i];
    if (p) p._correct = false;
    revealed++;
    feedback!.innerHTML = `Solution: <strong>${p.solutions[0]}</strong> — the move still doesn't count.`;
    feedback!.dataset.state = 'reveal';
    revealed = 1;
    if (reveal) reveal.hidden = true;
  };

  input.addEventListener('keydown', onKey);
  skip.addEventListener('click', onSkip);
  if (reveal) reveal.addEventListener('click', onReveal);

  // 90s timer per puzzle
  const tick = () => {
    if (i >= puzzles.length) return;
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > 90 && i < puzzles.length) {
      const p = puzzles[i];
      if (p) p._correct = false;
      feedback!.innerHTML = `Time. ${90}s is up — next.`;
      i++;
      if (i >= puzzles.length) {
        finalize();
      } else {
        setTimeout(load, 900);
      }
    }
  };
  const interval = window.setInterval(tick, 1000);

  // Pick puzzles async, then call load(). Show a placeholder first.
  promptEl.innerHTML = '<span class="demo-rat__word">…</span>';
  feedback!.innerHTML = 'Picking your puzzles.';
  void (async () => {
    puzzles = await pickSessionPuzzles(6);
    if (puzzles.length === 0) {
      puzzles = PUZZLES.slice(0, 6).map(p => ({
        id: 'fallback',
        words: p.words,
        solutions: p.solutions,
        _dueItemId: null,
        _correct: null
      }));
    }
    load();
  })();

  ratCleanup = () => {
    input.removeEventListener('keydown', onKey);
    skip.removeEventListener('click', onSkip);
    if (reveal) reveal.removeEventListener('click', onReveal);
    window.clearInterval(interval);
  };
}
