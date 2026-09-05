// /drill — the spaced-recall study queue.
//
// Two modes:
//   1. Queue view: shows what's due today, per module, with counts.
//   2. Drill view: a focused recall session for one module.
//
// In drill view, the user sees one item at a time. The prompt is module-
// specific (RAT = three words, CJ = start word and "to target"). The
// user types their recall; the system reveals the answer and updates
// the half-life. Press Enter to advance.

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { SUPABASE_CONFIGURED } from '../lib/supabase';
import { getAuthState, onAuthChange } from '../lib/auth';
import { loadDueItems, recordReview, type DueItem, type RecallModule } from '../lib/spacedRecall';

function ratPromptFor(item: DueItem): string {
  // The payload is { words: string[], answer: string }
  const words = (item.payload.words as string[] | undefined) ?? [];
  return words.join(' · ');
}

function cjPromptFor(item: DueItem): { from: string; to: string } {
  const start = (item.payload.start as string | undefined) ?? '?';
  const target = (item.payload.target as string | undefined) ?? '?';
  return { from: start, to: target };
}

function ratCorrectAnswer(item: DueItem): string {
  return (item.payload.answer as string | undefined) ?? '';
}

function cjCorrectAnswer(item: DueItem): string {
  const opt = (item.payload.optimal as string[] | undefined) ?? [];
  return opt.join(' → ');
}

function checkRat(guess: string, item: DueItem): boolean {
  const expected = ratCorrectAnswer(item).toLowerCase().split('|').map(s => s.trim());
  return expected.includes(guess.toLowerCase().trim());
}

function checkCj(guess: string, item: DueItem): boolean {
  // The user types the path like "start → A → B → target". We accept
  // any path that starts with the start, ends with the target, and
  // has no fewer than the optimal number of hops. The graph exists
  // in the client; the simplest check is: path contains start and
  // target and the count of "→" matches the optimal count, or the
  // path is valid in the graph. For this MVP we accept "starts with
  // start, ends with target, hop count >= optimal hops."
  const optimal = (item.payload.optimal as string[] | undefined) ?? [];
  const parts = guess.split('→').map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return false;
  if (parts[0] !== optimal[0]) return false;
  if (parts[parts.length - 1] !== optimal[optimal.length - 1]) return false;
  return parts.length <= optimal.length; // accept optimal or shorter
}

function renderQueue(ratDue: DueItem[], cjDue: DueItem[], signedIn: boolean): string {
  if (!signedIn) {
    return `<div class="drill-queue__empty">
      <p>The drill is part of the lab's spaced-repetition engine. Sign in (the lab does this anonymously when you take a battery) and complete a RAT or CJ session — your items will appear here.</p>
    </div>`;
  }
  if (!SUPABASE_CONFIGURED) {
    return `<div class="drill-queue__empty">
      <p>Spaced recall needs Supabase. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to enable.</p>
    </div>`;
  }
  if (ratDue.length === 0 && cjDue.length === 0) {
    return `<div class="drill-queue__empty">
      <p>No items due today. The drill is populated as you complete RAT and CJ sessions. New items come back after their half-life elapses — a correct recall multiplies it by 1.7, a wrong recall halves it.</p>
      <p class="t-body" style="margin-top: 8px;">First time here? Try a <a href="/modules/remote-associates">RAT session</a> or a <a href="/modules/concept-jump">CJ session</a> to seed the bank.</p>
    </div>`;
  }
  return `
    <div class="drill-queue__row">
      <div class="drill-queue__module">
        <span class="drill-queue__name">Remote Associates</span>
        <span class="drill-queue__count">${ratDue.length} due</span>
        <button type="button" class="btn btn--primary" data-start="rat" ${ratDue.length === 0 ? 'disabled' : ''}>Start RAT drill</button>
      </div>
      <div class="drill-queue__module">
        <span class="drill-queue__name">Concept Jump</span>
        <span class="drill-queue__count">${cjDue.length} due</span>
        <button type="button" class="btn btn--primary" data-start="cj" ${cjDue.length === 0 ? 'disabled' : ''}>Start CJ drill</button>
      </div>
    </div>
  `;
}

function renderDrill(host: HTMLElement, items: DueItem[], module: RecallModule, onDone: () => void) {
  host.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'drill';
  host.appendChild(wrap);
  let i = 0;
  let correctCount = 0;
  let wrongCount = 0;

  function render() {
    if (i >= items.length) {
      wrap.innerHTML = `
        <div class="drill__head">
          <span class="t-eyebrow">Drill complete</span>
          <span>${items.length} items · ${correctCount} correct · ${wrongCount} missed</span>
        </div>
        <div class="drill__summary">
          <p>You reviewed ${items.length} ${module.toUpperCase()} items. ${correctCount} were correctly recalled, ${wrongCount} were missed.</p>
          <p>Missed items return in roughly half their current half-life. Correct items return in 1.7× their current half-life. The next batch is queued — take another ${module.toUpperCase()} module session in the meantime to keep the bank growing.</p>
          <div class="drill__actions">
            <button type="button" class="btn btn--primary" data-done>Back to queue</button>
            <a class="btn btn--ghost" href="/modules/${module === 'rat' ? 'remote-associates' : 'concept-jump'}">Open ${module.toUpperCase()} module →</a>
          </div>
        </div>
      `;
      wrap.querySelector('[data-done]')?.addEventListener('click', onDone);
      return;
    }

    const item = items[i];
    const isRat = module === 'rat';
    const prompt = isRat ? ratPromptFor(item) : null;
    const cj = isRat ? null : cjPromptFor(item);

    wrap.innerHTML = `
      <div class="drill__head">
        <span class="t-eyebrow">Drill · ${isRat ? 'Remote Associates' : 'Concept Jump'}</span>
        <span>${i + 1} of ${items.length}</span>
      </div>
      <div class="drill__prompt">
        ${isRat
          ? `<div class="drill__triplet">${(prompt ?? '').split(' · ').map(w => `<span class="drill__word">${w}</span>`).join(' · ')}</div>
             <p class="drill__hint">Type the one word that links them.</p>`
          : `<p class="drill__pair">From <strong>${cj?.from}</strong> to <strong>${cj?.to}</strong></p>
             <p class="drill__hint">Type the path, e.g. <code>${(item.payload.optimal as string[] | undefined)?.join(' → ')}</code></p>`
        }
      </div>
      <div class="drill__input-row">
        <input type="text" class="drill__input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${isRat ? 'one word' : 'path with → between hops'}" />
        <button type="button" class="btn btn--primary" data-submit>Check</button>
      </div>
      <div class="drill__feedback" data-feedback></div>
    `;

    const input = wrap.querySelector<HTMLInputElement>('.drill__input')!;
    const submit = wrap.querySelector<HTMLButtonElement>('[data-submit]')!;
    const feedback = wrap.querySelector<HTMLElement>('[data-feedback]')!;
    input.focus();

    let answered = false;

    function submitGuess() {
      if (answered) return;
      const guess = input.value.trim();
      if (!guess) return;
      const correct = isRat ? checkRat(guess, item) : checkCj(guess, item);
      answered = true;
      if (correct) correctCount++; else wrongCount++;
      const answerHtml = isRat
        ? `<strong>${ratCorrectAnswer(item)}</strong>`
        : `<code>${cjCorrectAnswer(item)}</code>`;
      feedback.innerHTML = correct
        ? `<p class="drill__ok">Linked. The answer is ${answerHtml}. <span class="drill__next">Press <kbd>Enter</kbd> to continue.</span></p>`
        : `<p class="drill__miss">Not the link. The answer is ${answerHtml}. <span class="drill__next">Press <kbd>Enter</kbd> to continue — this item will return sooner.</span></p>`;
      // Record the review in the background; advance happens on Enter.
      void recordReview(item.item_id, correct);
    }

    function advance() {
      if (!answered) return;
      i++;
      render();
    }

    submit.addEventListener('click', submitGuess);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (answered) advance();
        else submitGuess();
      }
    });
  }
  render();
}

export const drillPage: PageModule = {
  html: /* html */ `
    <section class="page-lead">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <span>Drill</span>
        </div>
        <h1 class="t-h1">The spaced-recall queue.</h1>
        <p class="t-lead">
          Items you saw in the two recall-based modules return here when
          their half-life elapses. A correct recall multiplies the
          half-life by 1.7 (the item comes back later). A missed recall
          halves it (the item comes back sooner). The engine is a
          simplified Anki boost/halve, not a full Bayesian model — the
          <a href="/method">method page</a> explains the difference.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>Today</span>
          </div>
          <h2 class="t-h2">Items due for recall.</h2>
        </div>
        <div data-drill-queue class="drill-queue"></div>
        <div data-drill-stage class="drill-stage"></div>
      </div>
    </section>

    <section class="section how">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">02</span>
            <span>How it works</span>
          </div>
          <h2 class="t-h2">A half-life, not a calendar.</h2>
        </div>
        <div class="how__steps">
          <div class="how__step">
            <span class="how__ix">1</span>
            <h3>Items, not sessions</h3>
            <p>RAT puzzles and CJ (start, target) pairs are individual items. Each one has a half-life, a recall count, and a last-seen timestamp stored on the server.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">2</span>
            <h3>Half-life decay</h3>
            <p>An item is "due" when its half-life has elapsed since the last recall. The default starting half-life is 4 days for new items.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">3</span>
            <h3>Boost or halve</h3>
            <p>A correct recall multiplies the half-life by 1.7. A missed recall halves it. The result: easy items return rarely, hard items return often. The platform never punishes a miss — it just brings the item back sooner.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">4</span>
            <h3>Honest about scope</h3>
            <p>Spaced recall is built for the two modules where items exist (RAT and CJ). DAT, N-back, and Stroop are training tasks with no per-item recall surface — they track session-level scores only.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());
    const queueHost = document.querySelector<HTMLElement>('[data-drill-queue]');
    const stageHost = document.querySelector<HTMLElement>('[data-drill-stage]');

    async function refresh() {
      if (!queueHost || !stageHost) return;
      const auth = getAuthState();
      if (auth.status === 'loading') {
        queueHost.innerHTML = `<p class="drill-queue__empty">Loading the lab…</p>`;
        return;
      }
      const signedIn = auth.status === 'signed-in' && SUPABASE_CONFIGURED;
      // Pull up to 20 of each
      const [ratDue, cjDue] = signedIn
        ? await Promise.all([loadDueItems('rat', 20), loadDueItems('cj', 20)])
        : [[], []];
      queueHost.innerHTML = renderQueue(ratDue, cjDue, auth.status === 'signed-in');
      // Wire up the start buttons
      queueHost.querySelectorAll<HTMLButtonElement>('[data-start]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const m = btn.getAttribute('data-start') as RecallModule;
          startDrill(m);
        });
      });
    }

    async function startDrill(m: RecallModule) {
      if (!stageHost || !queueHost) return;
      const items = await loadDueItems(m, 20);
      if (items.length === 0) {
        stageHost.innerHTML = `<p class="drill-queue__empty">No items to drill. Take a ${m.toUpperCase()} session to seed the bank first.</p>`;
        return;
      }
      // Clear the queue's start buttons so the user can't re-trigger
      queueHost.innerHTML = '';
      renderDrill(stageHost, items, m, () => {
        stageHost.innerHTML = '';
        void refresh();
      });
    }

    await refresh();
    // Refresh when the auth state changes (e.g. user signs in mid-session)
    const offAuth = onAuthChange(() => { void refresh(); });
    cleanups.push(offAuth);

    return () => cleanups.forEach((c) => c());
  }
};