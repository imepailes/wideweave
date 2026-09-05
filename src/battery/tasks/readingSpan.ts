// Reading Span (Daneman & Carpenter 1980) — 3 sets of 3 sentences.
// For each sentence: judge T/F, then a letter appears that the
// user must hold in memory. After all 3 sentences in a set, the
// user types the 3 letters in order. Total: 9 letters to recall.
//
// Score = total letters recalled in correct position, out of 9.

import { READING_SPAN_SETS } from '../../lib/batteryStimuli';
import type { TaskHandle } from '../taskRunner';

type SentenceState = { text: string; true_: boolean; judged: boolean | null };
type SetState = {
  letters: string[];
  sentences: SentenceState[];
  recalled: string;
  done: boolean;
};

export const readingSpanTask: TaskHandle = {
  id: 'reading_span',
  name: 'Reading span',
  totalTrials: 9,
  mount(host, onComplete, onAbort) {
    const sets: SetState[] = READING_SPAN_SETS.map((s) => ({
      letters: s.letters.slice(),
      sentences: s.sentences.map(sent => ({ text: sent.text, true_: sent.true_, judged: null })),
      recalled: '',
      done: false
    }));
    let setIdx = 0;
    let sentIdx = 0;
    let totalCorrect = 0;
    let totalJudged = 0;
    let totalJudgedCorrect = 0;
    let disposed = false;
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

    const sentenceEl = document.createElement('div');
    sentenceEl.className = 'battery-rs__sentence';
    const letterEl = document.createElement('div');
    letterEl.className = 'battery-rs__letter';
    const judgmentRow = document.createElement('div');
    judgmentRow.className = 'battery-rs__judge-row';
    const tBtn = document.createElement('button');
    tBtn.type = 'button';
    tBtn.className = 'btn btn--ghost battery-rs__judge';
    tBtn.innerHTML = '<kbd>T</kbd>rue';
    const fBtn = document.createElement('button');
    fBtn.type = 'button';
    fBtn.className = 'btn btn--ghost battery-rs__judge';
    fBtn.innerHTML = '<kbd>F</kbd>alse';
    judgmentRow.appendChild(tBtn);
    judgmentRow.appendChild(fBtn);

    const progressEl = document.createElement('div');
    progressEl.className = 'battery-rs__progress';
    const lettersBox = document.createElement('div');
    lettersBox.className = 'battery-rs__letters';

    const inputRow = document.createElement('div');
    inputRow.className = 'battery-rs__recall';
    const recallInput = document.createElement('input');
    recallInput.type = 'text';
    recallInput.maxLength = 3;
    recallInput.autocapitalize = 'characters';
    recallInput.placeholder = '???';
    recallInput.className = 'demo-rat__input battery-rs__recall-input';
    const recallBtn = document.createElement('button');
    recallBtn.type = 'button';
    recallBtn.className = 'btn btn--primary';
    recallBtn.textContent = 'Submit set';
    inputRow.appendChild(recallInput);
    inputRow.appendChild(recallBtn);

    const setList = document.createElement('ol');
    setList.className = 'battery-rs__setlist';

    host.appendChild(header);
    host.appendChild(progressEl);
    host.appendChild(sentenceEl);
    host.appendChild(letterEl);
    host.appendChild(judgmentRow);
    host.appendChild(lettersBox);
    host.appendChild(inputRow);
    host.appendChild(setList);

    function totalTrialsDone(): number {
      // 3 sentences per set, all sets
      return setIdx * 3 + Math.min(sentIdx, sets[setIdx]?.sentences.length ?? 0);
    }

    function totalTrialsTotal(): number {
      return sets.length * 3;
    }

    function updateProgress() {
      counter.textContent = `${totalTrialsDone()} / ${totalTrialsTotal()}`;
      progress.style.setProperty('--w', `${(totalTrialsDone() / totalTrialsTotal()) * 100}%`);
    }

    function abort() {
      if (disposed) return;
      disposed = true;
      if (onAbort) onAbort();
    }

    function render() {
      if (disposed) return;
      const set = sets[setIdx];
      if (!set) {
        finish();
        return;
      }
      if (sentIdx < set.sentences.length) {
        const r = set.sentences[sentIdx];
        sentenceEl.textContent = r.text;
        letterEl.textContent = '';
        tBtn.hidden = false;
        fBtn.hidden = false;
        inputRow.hidden = true;
        progressEl.textContent = `Set ${setIdx + 1} of ${sets.length} · sentence ${sentIdx + 1} of 3`;
        lettersBox.innerHTML = set.letters.slice(0, sentIdx).map((l, i) =>
          `<span class="battery-rs__held" data-i="${i}">${l}</span>`
        ).join('');
        setList.classList.add('battery-rs__setlist--hidden');
        updateProgress();
      } else {
        sentenceEl.textContent = `Type the 3 letters in order.`;
        letterEl.textContent = `Remembered: ${set.letters.join(' ')}`;
        tBtn.hidden = true;
        fBtn.hidden = true;
        inputRow.hidden = false;
        progressEl.textContent = `Set ${setIdx + 1} of ${sets.length} · recall`;
        lettersBox.innerHTML = '';
        setList.classList.remove('battery-rs__setlist--hidden');
        setList.innerHTML = set.sentences.map((r) => {
          let mark = '–';
          if (r.judged === true) { mark = r.judged === r.true_ ? '✓' : '✗'; }
          return `<li>${mark} ${r.text}</li>`;
        }).join('');
        recallInput.value = '';
        recallInput.focus();
        updateProgress();
      }
    }

    function judge(answer: boolean) {
      const set = sets[setIdx];
      if (!set) return;
      const r = set.sentences[sentIdx];
      r.judged = answer;
      totalJudged++;
      if (answer === r.true_) totalJudgedCorrect++;
      sentIdx++;
      render();
    }

    function submitRecall() {
      const set = sets[setIdx];
      if (!set) return;
      const guess = recallInput.value.trim().toUpperCase();
      set.recalled = guess;
      let correct = 0;
      for (let pos = 0; pos < set.letters.length; pos++) {
        if (guess[pos] === set.letters[pos]) correct++;
      }
      set.done = true;
      totalCorrect += correct;
      setIdx++;
      sentIdx = 0;
      render();
    }

    function finish() {
      if (disposed) return;
      const elapsed = Math.round((Date.now() - start) / 1000);
      onComplete({
        raw: totalCorrect,
        trials: 9,
        correct: totalCorrect,
        time_s: elapsed,
        detail: {
          per_set: sets.map(s => ({ target: s.letters.join(''), recalled: s.recalled })),
          judged_total: totalJudged,
          judged_correct: totalJudgedCorrect
        }
      });
    }

    const onT = () => judge(true);
    const onF = () => judge(false);
    const onSubmit = () => submitRecall();
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t === recallInput) {
        if (e.key === 'Enter') { e.preventDefault(); submitRecall(); return; }
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'escape') { e.preventDefault(); abort(); return; }
      // T/F for sentence judgment
      if (sentIdx < (sets[setIdx]?.sentences.length ?? 0)) {
        if (k === 't' || k === 'y') { e.preventDefault(); judge(true); return; }
        if (k === 'f' || k === 'n') { e.preventDefault(); judge(false); return; }
      }
    };
    const onExit = () => abort();

    tBtn.addEventListener('click', onT);
    fBtn.addEventListener('click', onF);
    recallBtn.addEventListener('click', onSubmit);
    window.addEventListener('keydown', onKey);
    exitBtn.addEventListener('click', onExit);
    render();

    return () => {
      disposed = true;
      tBtn.removeEventListener('click', onT);
      fBtn.removeEventListener('click', onF);
      recallBtn.removeEventListener('click', onSubmit);
      window.removeEventListener('keydown', onKey);
      exitBtn.removeEventListener('click', onExit);
      host.innerHTML = '';
    };
  }
};
