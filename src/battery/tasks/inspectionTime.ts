// Inspection Time — 16 trials, 4 stimulus durations × 4 trials each.
// User identifies which of two vertical lines is longer after a
// backward mask. Score = the longest duration at which accuracy
// falls to ~75% (the threshold), interpolated.

import { buildITTrials } from '../../lib/batteryStimuli';
import type { TaskHandle, TaskScore } from '../taskRunner';

export const inspectionTimeTask: TaskHandle = {
  id: 'inspection_time',
  name: 'Inspection time',
  totalTrials: 16,
  mount(host, onComplete, onAbort) {
    const trials = buildITTrials();
    let i = 0;
    let responses: { duration: number; correct: boolean }[] = [];
    let disposed = false;
    let nextTimer: number | null = null;
    let stimTimer: number | null = null;
    const start = Date.now();

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
    header.appendChild(progress);
    header.appendChild(counter);
    header.appendChild(exitBtn);

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

    const legend = document.createElement('div');
    legend.className = 'battery-it__legend';
    legend.setAttribute('aria-hidden', 'true');
    legend.innerHTML = '<span><kbd>F</kbd> left was longer</span><span><kbd>J</kbd> right was longer</span>';

    host.appendChild(header);
    host.appendChild(stageEl);
    host.appendChild(legend);
    host.appendChild(promptEl);

    function updateProgress() {
      counter.textContent = `${i} / ${trials.length}`;
      progress.style.setProperty('--w', `${(i / trials.length) * 100}%`);
    }

    function showLines(t: { duration: number; leftLonger: boolean }) {
      mask.hidden = true;
      leftLine.hidden = false;
      rightLine.hidden = false;
      leftLine.style.height = t.leftLonger ? '1em' : '0.7em';
      rightLine.style.height = t.leftLonger ? '0.7em' : '1em';
      if (stimTimer) clearTimeout(stimTimer);
      stimTimer = window.setTimeout(() => {
        leftLine.hidden = true;
        rightLine.hidden = true;
        mask.hidden = false;
      }, t.duration);
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
      mask.hidden = true;
      leftLine.hidden = true;
      rightLine.hidden = true;
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = window.setTimeout(() => {
        if (disposed) return;
        showLines(trials[i]);
        updateProgress();
      }, 600);
    }

    function computeScore(): TaskScore {
      const elapsed = Math.round((Date.now() - start) / 1000);
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

    const onKey = (e: KeyboardEvent) => {
      if (disposed) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') { e.preventDefault(); abort(); return; }
      if (k !== 'f' && k !== 'j') return;
      e.preventDefault();
      const trial = trials[i];
      if (!trial) return;
      const expected = trial.leftLonger ? 'f' : 'j';
      const correct = expected === k;
      responses.push({ duration: trial.duration, correct });
      i++;
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = window.setTimeout(next, 300);
    };

    const onExit = () => abort();

    window.addEventListener('keydown', onKey);
    exitBtn.addEventListener('click', onExit);
    updateProgress();
    next();

    return () => {
      disposed = true;
      window.removeEventListener('keydown', onKey);
      exitBtn.removeEventListener('click', onExit);
      if (nextTimer) clearTimeout(nextTimer);
      if (stimTimer) clearTimeout(stimTimer);
      host.innerHTML = '';
    };
  }
};
