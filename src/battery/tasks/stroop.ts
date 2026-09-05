// Stroop task — 16 trials, balanced congruent/incongruent.
// User keys the COLOR (not the word). Score = mean(RT_incongruent) -
// mean(RT_congruent) for correct trials, in ms.

import { buildStroopTrials, STROOP_COLORS, type StroopTrial } from '../../lib/batteryStimuli';
import type { TaskHandle, TaskScore } from '../taskRunner';

const KEY_FOR_HEX: Record<string, string> = {
  [STROOP_COLORS[0].hex]: 'r',
  [STROOP_COLORS[1].hex]: 'b',
  [STROOP_COLORS[2].hex]: 'g',
  [STROOP_COLORS[3].hex]: 'y'
};

// Inverse map for displaying
const KEY_INFO: { key: string; word: string; hex: string }[] = [
  { key: 'r', word: 'RED',    hex: STROOP_COLORS[0].hex },
  { key: 'b', word: 'BLUE',   hex: STROOP_COLORS[1].hex },
  { key: 'g', word: 'GREEN',  hex: STROOP_COLORS[2].hex },
  { key: 'y', word: 'YELLOW', hex: STROOP_COLORS[3].hex }
];

export const stroopTask: TaskHandle = {
  id: 'stroop',
  name: 'Stroop',
  totalTrials: 16,
  mount(host, onComplete, onAbort) {
    const trials: StroopTrial[] = buildStroopTrials();
    let i = 0;
    let correctCongruent: number[] = [];
    let correctIncongruent: number[] = [];
    let wrongCount = 0;
    let trialStart = 0;
    let disposed = false;
    let nextTimer: number | null = null;
    const start = Date.now();

    // Build the UI: a header with progress, the word, a legend, an exit.
    const header = document.createElement('div');
    header.className = 'battery-task-head';
    const progress = document.createElement('div');
    progress.className = 'battery-task-head__progress';
    const counter = document.createElement('div');
    counter.className = 'battery-task-head__counter';
    const exitBtn = document.createElement('button');
    exitBtn.type = 'button';
    exitBtn.className = 'battery-task-head__exit';
    exitBtn.textContent = 'Exit battery';
    exitBtn.setAttribute('aria-label', 'Exit battery early');
    header.appendChild(progress);
    header.appendChild(counter);
    header.appendChild(exitBtn);

    const wordEl = document.createElement('div');
    wordEl.className = 'battery-stroop__word';
    wordEl.setAttribute('aria-live', 'polite');
    wordEl.setAttribute('role', 'status');

    // Legend: a key indicator per color. The letter has the color
    // it represents, and the word is the color name. This is the
    // Stroop mapping the user must learn.
    const legend = document.createElement('div');
    legend.className = 'battery-stroop__legend';
    legend.setAttribute('aria-hidden', 'true');
    for (const k of KEY_INFO) {
      const chip = document.createElement('span');
      chip.className = 'battery-stroop__key';
      const keyLbl = document.createElement('kbd');
      keyLbl.textContent = k.key.toUpperCase();
      keyLbl.style.color = k.hex;
      const wordLbl = document.createElement('span');
      wordLbl.textContent = k.word;
      chip.appendChild(keyLbl);
      chip.appendChild(wordLbl);
      legend.appendChild(chip);
    }

    const promptEl = document.createElement('div');
    promptEl.className = 'battery-stroop__prompt';
    promptEl.textContent = 'Press the key for the COLOR — not the word.';

    host.appendChild(header);
    host.appendChild(wordEl);
    host.appendChild(legend);
    host.appendChild(promptEl);

    function updateProgress() {
      const done = i;
      const total = trials.length;
      counter.textContent = `${done} / ${total}`;
      progress.style.setProperty('--w', `${(done / total) * 100}%`);
    }

    function showFeedback(state: 'correct' | 'wrong') {
      wordEl.dataset.feedback = state;
      window.setTimeout(() => { delete wordEl.dataset.feedback; }, 200);
    }

    function abort() {
      if (disposed) return;
      disposed = true;
      if (onAbort) onAbort();
    }

    function next() {
      if (disposed) return;
      if (i >= trials.length) {
        onComplete(computeScore());
        return;
      }
      const t = trials[i];
      wordEl.textContent = t.word;
      wordEl.style.color = t.color;
      trialStart = performance.now();
      updateProgress();
    }

    function computeScore(): TaskScore {
      const elapsed = Math.round((Date.now() - start) / 1000);
      const meanC = correctCongruent.length ? correctCongruent.reduce((a, b) => a + b, 0) / correctCongruent.length : 0;
      const meanI = correctIncongruent.length ? correctIncongruent.reduce((a, b) => a + b, 0) / correctIncongruent.length : 0;
      const stroop = Math.max(0, Math.round(meanI - meanC));
      return {
        raw: stroop,
        trials: trials.length,
        correct: correctCongruent.length + correctIncongruent.length,
        time_s: elapsed,
        detail: {
          congruent_n: correctCongruent.length,
          incongruent_n: correctIncongruent.length,
          congruent_mean: Math.round(meanC),
          incongruent_mean: Math.round(meanI),
          wrong: wrongCount
        }
      };
    }

    const onKey = (e: KeyboardEvent) => {
      if (disposed) return;
      // Don't capture if the user is typing in a text field (the only
      // text field in the battery is the reading-span recall input)
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') { e.preventDefault(); abort(); return; }
      if (!['r', 'b', 'g', 'y'].includes(k)) return;
      e.preventDefault();
      const trial = trials[i];
      if (!trial) return;
      const expected = KEY_FOR_HEX[trial.color];
      const correct = expected === k;
      const rt = performance.now() - trialStart;
      if (correct) {
        showFeedback('correct');
        if (trial.congruent) correctCongruent.push(rt);
        else correctIncongruent.push(rt);
      } else {
        showFeedback('wrong');
        wrongCount++;
      }
      i++;
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = window.setTimeout(next, 450);
    };

    const onExit = () => abort();

    window.addEventListener('keydown', onKey);
    exitBtn.addEventListener('click', onExit);
    nextTimer = window.setTimeout(() => { next(); updateProgress(); }, 500);

    return () => {
      disposed = true;
      window.removeEventListener('keydown', onKey);
      exitBtn.removeEventListener('click', onExit);
      if (nextTimer) clearTimeout(nextTimer);
      host.innerHTML = '';
    };
  }
};
