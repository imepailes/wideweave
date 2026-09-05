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

export const stroopTask: TaskHandle = {
  id: 'stroop',
  name: 'Stroop',
  mount(host, onComplete) {
    const trials: StroopTrial[] = buildStroopTrials();
    let i = 0;
    let correctCongruent: number[] = [];
    let correctIncongruent: number[] = [];
    let trialStart = 0;
    let disposed = false;
    let keyHandler: ((e: KeyboardEvent) => void) | null = null;
    let nextTimer: number | null = null;
    const start = Date.now();

    const wordEl = document.createElement('div');
    wordEl.className = 'battery-stroop__word';
    wordEl.setAttribute('aria-live', 'polite');
    const promptEl = document.createElement('div');
    promptEl.className = 'battery-stroop__prompt';
    promptEl.textContent = 'Press the key for the COLOR: R · B · G · Y';
    host.appendChild(wordEl);
    host.appendChild(promptEl);

    function showFeedback(state: 'correct' | 'wrong') {
      wordEl.dataset.feedback = state;
      window.setTimeout(() => { delete wordEl.dataset.feedback; }, 200);
    }

    function next() {
      if (disposed) return;
      if (i >= trials.length) {
        const score = computeScore();
        onComplete(score);
        return;
      }
      const t = trials[i];
      wordEl.textContent = t.word;
      wordEl.style.color = t.color;
      trialStart = performance.now();
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
        detail: { congruent_n: correctCongruent.length, incongruent_n: correctIncongruent.length, congruent_mean: Math.round(meanC), incongruent_mean: Math.round(meanI) }
      };
    }

    keyHandler = (e: KeyboardEvent) => {
      if (disposed) return;
      const k = e.key.toLowerCase();
      if (!['r', 'b', 'g', 'y'].includes(k)) return;
      e.preventDefault();
      const t = trials[i];
      if (!t) return;
      const expected = KEY_FOR_HEX[t.color];
      const correct = expected === k;
      const rt = performance.now() - trialStart;
      if (correct) {
        showFeedback('correct');
        if (t.congruent) correctCongruent.push(rt);
        else correctIncongruent.push(rt);
      } else {
        showFeedback('wrong');
      }
      i++;
      // 500ms ITI
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = window.setTimeout(next, 450);
    };

    window.addEventListener('keydown', keyHandler);
    // Start the first trial on next tick so listeners are in place
    nextTimer = window.setTimeout(next, 600);

    return () => {
      disposed = true;
      if (keyHandler) window.removeEventListener('keydown', keyHandler);
      if (nextTimer) clearTimeout(nextTimer);
      host.innerHTML = '';
    };
  }
};
