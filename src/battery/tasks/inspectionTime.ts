// Inspection Time — 16 trials, 4 stimulus durations × 4 trials each.
// User identifies which of two vertical lines is longer after a
// backward mask. Score = the longest duration at which accuracy
// falls to ~75% (the threshold), interpolated.

import { buildITTrials } from '../../lib/batteryStimuli';
import type { TaskHandle, TaskScore } from '../taskRunner';

export const inspectionTimeTask: TaskHandle = {
  id: 'inspection_time',
  name: 'Inspection time',
  mount(host, onComplete) {
    const trials = buildITTrials();
    let i = 0;
    let responses: { duration: number; correct: boolean }[] = [];
    let disposed = false;
    let nextTimer: number | null = null;
    let keyHandler: ((e: KeyboardEvent) => void) | null = null;
    let stimTimer: number | null = null;
    let maskTimer: number | null = null;
    const start = Date.now();

    const stageEl = document.createElement('div');
    stageEl.className = 'battery-it__stage';
    const leftLine = document.createElement('div');
    leftLine.className = 'battery-it__line battery-it__line--left';
    const rightLine = document.createElement('div');
    rightLine.className = 'battery-it__line battery-it__line--right';
    const mask = document.createElement('div');
    mask.className = 'battery-it__mask';
    mask.textContent = '▓▓▓▓';
    stageEl.appendChild(leftLine);
    stageEl.appendChild(rightLine);
    stageEl.appendChild(mask);
    const promptEl = document.createElement('div');
    promptEl.className = 'battery-it__prompt';
    promptEl.textContent = 'Press F for LEFT longer · J for RIGHT longer';
    host.appendChild(stageEl);
    host.appendChild(promptEl);

    function showLines(t: { duration: number; leftLonger: boolean }) {
      mask.hidden = true;
      leftLine.hidden = false;
      rightLine.hidden = false;
      // The longer line is 1.0em; the shorter is 0.7em
      leftLine.style.height = t.leftLonger ? '1em' : '0.7em';
      rightLine.style.height = t.leftLonger ? '0.7em' : '1em';
      if (stimTimer) clearTimeout(stimTimer);
      if (maskTimer) clearTimeout(maskTimer);
      stimTimer = window.setTimeout(() => {
        leftLine.hidden = true;
        rightLine.hidden = true;
        mask.hidden = false;
      }, t.duration);
    }

    function next() {
      if (disposed) return;
      if (i >= trials.length) {
        const score = computeScore();
        onComplete(score);
        return;
      }
      mask.hidden = true;
      leftLine.hidden = true;
      rightLine.hidden = true;
      // 700ms blank ISI
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = window.setTimeout(() => {
        if (disposed) return;
        showLines(trials[i]);
      }, 700);
    }

    function computeScore(): TaskScore {
      const elapsed = Math.round((Date.now() - start) / 1000);
      // Group by duration, compute accuracy
      const byDur = new Map<number, { correct: number; total: number }>();
      for (const r of responses) {
        const e = byDur.get(r.duration) ?? { correct: 0, total: 0 };
        e.total += 1;
        if (r.correct) e.correct += 1;
        byDur.set(r.duration, e);
      }
      // Find the threshold: longest duration at which accuracy is < 75%
      const sortedDurs = [...byDur.keys()].sort((a, b) => a - b);
      let threshold = sortedDurs[sortedDurs.length - 1];
      for (const d of sortedDurs) {
        const e = byDur.get(d)!;
        if (e.correct / e.total < 0.75) {
          threshold = d;
          break;
        }
      }
      return {
        raw: threshold,
        trials: trials.length,
        correct: responses.filter(r => r.correct).length,
        time_s: elapsed,
        detail: { by_dur: Object.fromEntries(byDur) }
      };
    }

    keyHandler = (e: KeyboardEvent) => {
      if (disposed) return;
      const k = e.key.toLowerCase();
      if (k !== 'f' && k !== 'j') return;
      e.preventDefault();
      const t = trials[i];
      if (!t) return;
      const expected = t.leftLonger ? 'f' : 'j';
      const correct = expected === k;
      responses.push({ duration: t.duration, correct });
      i++;
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = window.setTimeout(next, 300);
    };

    window.addEventListener('keydown', keyHandler);
    next();

    return () => {
      disposed = true;
      if (keyHandler) window.removeEventListener('keydown', keyHandler);
      if (nextTimer) clearTimeout(nextTimer);
      if (stimTimer) clearTimeout(stimTimer);
      if (maskTimer) clearTimeout(maskTimer);
      host.innerHTML = '';
    };
  }
};
