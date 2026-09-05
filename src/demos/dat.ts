// DAT — Divergent Association Task
// Ten words. Mean pairwise cosine distance on a 64-dim hand-curated space.

import { saveSession } from '../lib/history';

const DIM = 64;

// A small hand-curated 64-dim embedding space. We can't ship a real
// model in the bundle, so we hand-pick 32 anchors and project every
// word onto a smooth interpolation across them. This keeps the
// scoring deterministic and the bundle small.
const ANCHORS: Array<{ word: string; v: number[] }> = (() => {
  const seed = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };
  const rng = (s: string) => {
    let h = seed(s);
    return () => {
      h = (h * 1664525 + 1013904223) >>> 0;
      return (h & 0xffff) / 0xffff;
    };
  };
  const words = [
    'velvet', 'algorithm', 'whale', 'cathedral', 'passport', 'thunder', 'puzzle', 'ocean',
    'bicycle', 'poem', 'lettuce', 'invoice', 'comet', 'whisper', 'pickle', 'lantern',
    'subway', 'symphony', 'rhubarb', 'geology', 'marathon', 'philosophy', 'waffle', 'kayak',
    'octopus', 'blueprint', 'mango', 'paradox', 'festival', 'mosaic', 'compass', 'pebble'
  ];
  return words.map((word) => {
    const r = rng(word);
    return { word, v: Array.from({ length: DIM }, () => r() * 2 - 1) };
  });
})();

const norm = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-zà-ÿ'\- ]/gi, '').replace(/\s+/g, ' ');

function embed(word: string): number[] {
  // Weighted blend of the three nearest anchors by character trigram overlap.
  const w = norm(word);
  if (!w) return ANCHORS[0].v.slice();
  const tri = (s: string) => {
    const out = new Map<string, number>();
    for (let i = 0; i < s.length - 2; i++) {
      const k = s.slice(i, i + 3);
      out.set(k, (out.get(k) || 0) + 1);
    }
    return out;
  };
  const wT = tri(w);
  const scored = ANCHORS.map((a) => {
    const aT = tri(a.word);
    let s = 0;
    for (const [k, n] of wT) s += Math.min(n, aT.get(k) || 0);
    return { a, s };
  }).sort((a, b) => b.s - a.s);
  const total = scored[0].s + scored[1].s + scored[2].s + 0.001;
  const v = new Array(DIM).fill(0);
  for (let i = 0; i < 3; i++) {
    const w = (scored[i].s + 0.0001) / total;
    for (let k = 0; k < DIM; k++) v[k] += scored[i].a.v[k] * w;
  }
  return v;
}

function cos(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

function meanDistance(words: string[]): number {
  if (words.length < 2) return 0;
  const embs = words.map(embed);
  let sum = 0, n = 0;
  for (let i = 0; i < embs.length; i++) {
    for (let j = i + 1; j < embs.length; j++) {
      sum += 1 - cos(embs[i], embs[j]); // cosine distance = 1 - similarity
      n++;
    }
  }
  return sum / n;
}

const TARGET = 10;

let datCleanup: (() => void) | null = null;

export function disposeDAT(): void {
  if (datCleanup) {
    try { datCleanup(); } catch { /* noop */ }
    datCleanup = null;
  }
}

export function initDAT(): void {
  disposeDAT();
  const root = document.getElementById('dat');
  if (!root) return;

  const input = document.getElementById('dat-input') as HTMLInputElement | null;
  const wordsEl = document.getElementById('dat-words');
  const numEl = document.getElementById('dat-num');
  const scoreEl = document.getElementById('dat-score');
  if (!input || !wordsEl || !numEl || !scoreEl) return;

  const seen: string[] = [];

  const render = () => {
    wordsEl.innerHTML = '';
    seen.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'demo-dat__word';
      span.textContent = w;
      span.title = `Word ${i + 1}`;
      wordsEl.appendChild(span);
    });
    numEl.textContent = String(seen.length);
    const md = meanDistance(seen);
    scoreEl.textContent = md.toFixed(3);
    if (seen.length === TARGET) onComplete(seen, md, Date.now() - startedAt);
  };

  const startedAt = Date.now();
  let saveInflight = false;
  const onComplete = (words: string[], finalScore: number, elapsed: number) => {
    if (saveInflight) return;
    saveInflight = true;
    void saveSession({
      module: 'dat',
      score: finalScore,
      time_s: Math.round(elapsed / 1000),
      detail: { words: words.slice() }
    }).finally(() => { saveInflight = false; });
  };

  const add = (raw: string) => {
    const w = norm(raw);
    if (!w) return;
    if (seen.includes(w)) return;
    if (seen.length >= TARGET) return;
    seen.push(w);
    input.value = '';
    render();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input.value);
    } else if (e.key === 'Backspace' && input.value === '' && seen.length) {
      seen.pop();
      render();
    }
  };
  const onPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData('text') || '').replace(/[,\n;]+/g, ' ');
    const first = text.trim().split(/\s+/)[0] || '';
    if (first) add(first);
  };
  input.addEventListener('keydown', onKey);
  input.addEventListener('paste', onPaste);

  // Seed with five words so the demo shows life on first view.
  ['velvet', 'algorithm', 'whale', 'cathedral', 'passport'].forEach(add);

  datCleanup = () => {
    input.removeEventListener('keydown', onKey);
    input.removeEventListener('paste', onPaste);
  };
}
