// Reading Span (Daneman & Carpenter 1980) — 3 sets of 3 sentences.
// For each sentence: judge T/F, then a letter appears that the
// user must hold in memory. After all 3 sentences in a set, the
// user types the 3 letters in order. Total: 9 letters to recall.
//
// Score = total letters recalled in correct position, out of 9.
// We surface a 0-9 scale.

import { READING_SPAN_SETS } from '../../lib/batteryStimuli';
import type { TaskHandle } from '../taskRunner';

type SetState = {
  letters: string[];            // the 3 letters to remember
  responses: { sentence: string; true_: boolean; judged: boolean }[];
  recalled: string;             // user's typed recall
  done: boolean;
};

export const readingSpanTask: TaskHandle = {
  id: 'reading_span',
  name: 'Reading span',
  mount(host, onComplete) {
    const sets: SetState[] = READING_SPAN_SETS.map((s) => ({
      letters: s.letters.slice(),
      responses: s.sentences.map(sent => ({ sentence: sent.text, true_: sent.true_, judged: false })),
      recalled: '',
      done: false
    }));
    let setIdx = 0;
    let sentIdx = 0;
    let totalCorrect = 0;
    let disposed = false;
    const start = Date.now();

    const sentenceEl = document.createElement('div');
    sentenceEl.className = 'battery-rs__sentence';
    const letterEl = document.createElement('div');
    letterEl.className = 'battery-rs__letter';
    const tBtn = document.createElement('button');
    tBtn.type = 'button';
    tBtn.className = 'btn btn--ghost battery-rs__judge';
    tBtn.textContent = 'True';
    const fBtn = document.createElement('button');
    fBtn.type = 'button';
    fBtn.className = 'btn btn--ghost battery-rs__judge';
    fBtn.textContent = 'False';
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
    const setList = document.createElement('ol');
    setList.className = 'battery-rs__setlist';
    inputRow.appendChild(recallInput);
    inputRow.appendChild(recallBtn);
    host.appendChild(sentenceEl);
    host.appendChild(letterEl);
    host.appendChild(tBtn);
    host.appendChild(fBtn);
    host.appendChild(progressEl);
    host.appendChild(lettersBox);
    host.appendChild(inputRow);
    host.appendChild(setList);

    function render() {
      if (disposed) return;
      const set = sets[setIdx];
      if (!set) {
        finish();
        return;
      }
      if (sentIdx < set.responses.length) {
        // Mid-set: show sentence + True/False
        const r = set.responses[sentIdx];
        sentenceEl.textContent = r.sentence;
        letterEl.textContent = '';
        tBtn.hidden = false;
        fBtn.hidden = false;
        inputRow.hidden = true;
        progressEl.textContent = `Set ${setIdx + 1} of ${sets.length} · sentence ${sentIdx + 1} of 3`;
        lettersBox.innerHTML = set.letters.slice(0, sentIdx).map((l, i) =>
          `<span class="battery-rs__held" data-i="${i}">${l}</span>`
        ).join('');
        setList.classList.add('battery-rs__setlist--hidden');
      } else {
        // End of set: show recall input
        sentenceEl.textContent = `Type the 3 letters in order.`;
        letterEl.textContent = `Remembered: ${set.letters.join(' ')}`;
        tBtn.hidden = true;
        fBtn.hidden = true;
        inputRow.hidden = false;
        progressEl.textContent = `Set ${setIdx + 1} of ${sets.length} · recall`;
        lettersBox.innerHTML = '';
        setList.classList.remove('battery-rs__setlist--hidden');
        // Build a recap of the user's T/F responses
        setList.innerHTML = set.responses.map((r) =>
          `<li>${r.judged ? (r.judged === r.true_ ? '✓' : '✗') : '–'} ${r.sentence}</li>`
        ).join('');
        recallInput.value = '';
        recallInput.focus();
      }
    }

    function judge(answer: boolean) {
      const set = sets[setIdx];
      if (!set) return;
      const r = set.responses[sentIdx];
      r.judged = answer;
      sentIdx++;
      render();
    }

    function submitRecall() {
      const set = sets[setIdx];
      if (!set) return;
      const guess = recallInput.value.trim().toUpperCase();
      set.recalled = guess;
      // Score: count positions correct
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
      const elapsed = Math.round((Date.now() - start) / 1000);
      onComplete({
        raw: totalCorrect,
        trials: sets.length * 3,
        correct: totalCorrect,
        time_s: elapsed,
        detail: { per_set: sets.map(s => ({ target: s.letters.join(''), recalled: s.recalled })) }
      });
    }

    const onT = () => judge(true);
    const onF = () => judge(false);
    const onSubmit = () => submitRecall();
    const onKey = (e: KeyboardEvent) => {
      if (sentIdx >= sets[setIdx]?.responses.length && e.key === 'Enter') {
        e.preventDefault();
        submitRecall();
      }
    };
    tBtn.addEventListener('click', onT);
    fBtn.addEventListener('click', onF);
    recallBtn.addEventListener('click', onSubmit);
    window.addEventListener('keydown', onKey);
    render();

    return () => {
      disposed = true;
      tBtn.removeEventListener('click', onT);
      fBtn.removeEventListener('click', onF);
      recallBtn.removeEventListener('click', onSubmit);
      window.removeEventListener('keydown', onKey);
      host.innerHTML = '';
    };
  }
};
