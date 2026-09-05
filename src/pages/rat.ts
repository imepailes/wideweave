// /modules/remote-associates — RAT detail page.

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { initRAT, disposeRAT } from '../demos/rat';
import { mountHistoryPanel } from '../lib/historyPanel';

export const ratPage: PageModule = {
  html: /* html */ `
    <section class="page-lead module-detail">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <a href="/#modules">Modules</a>
          <span aria-hidden="true">·</span>
          <span>Remote Associates</span>
        </div>
        <h1 class="t-h1">Three words. Generate the fourth that links them.</h1>
        <p class="t-lead">
          The Remote Associates Test (Mednick 1962) is the most
          replicated measure of associative thinking in cognitive
          science. Wideweave runs six hand-curated puzzles with
          generation only — no multiple-choice, no hint button, no
          back-of-the-envelope language model behind the scenes.
        </p>
        <div class="page-lead__meta page-lead__chips">
          <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          <span class="meta-line">6 puzzles · 6 minutes</span>
          <span class="meta-line">Solved: 4.1 / 6</span>
          <span class="meta-line">You: 3 / 6</span>
        </div>
      </div>
    </section>

    <section class="section module-detail__surface">
      <div class="container">
        <div class="module module--detail module--rat" id="rat-demo">
          <div class="module__head">
            <span class="module__num">M·02 · live</span>
            <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          </div>
          <h2 class="module__title">Live demo · Remote Associates</h2>
          <p class="module__desc">
            Read the three words. Generate the fourth that links them. The
            answer is always a single word. If you can't crack a puzzle
            after 90 seconds, skip it — guessing wastes your time.
          </p>
          <div class="module__body">
            <div class="module__demo module__demo--large">
              <div class="demo-rat" id="rat">
                <div class="demo-rat__progress" id="rat-progress">
                  <span class="demo-rat__ix" id="rat-ix">1 / 6</span>
                  <div class="demo-rat__track"><div class="demo-rat__bar" id="rat-bar" style="--w: 16%"></div></div>
                </div>
                <div class="demo-rat__prompt" id="rat-prompt">Loading…</div>
                <input class="demo-rat__input" id="rat-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="The word that links them" maxlength="24" />
                <div class="demo-rat__feedback" id="rat-feedback">Type a single word. 90s per puzzle.</div>
                <div class="demo-rat__actions">
                  <button class="btn btn--ghost demo-rat__skip" id="rat-skip" type="button">Skip →</button>
                  <button class="btn btn--ghost demo-rat__reveal" id="rat-reveal" type="button" hidden>Reveal</button>
                </div>
              </div>
            </div>
            <div class="module__research" id="rat-research">
              <div class="module__research-head">
                <span class="t-eyebrow">Why this is measured</span>
              </div>
              <div class="module__research-item">
                <span class="p pill--proved">Proved</span>
                <div><strong>Mednick (1962)</strong> — the original associative theory of creative thinking, still the most-replicated measure.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--proved">Proved</span>
                <div><strong>Bowden &amp; Jung-Beeman (2003)</strong> — right-hemisphere priming predicts RAT solve rate. Not just verbal fluency.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--proved">Proved</span>
                <div>Performance correlates with self-reported creative achievement across domains (Beaty et al. 2014).</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>Multiple-choice versions inflate scores 30–50% vs free generation. We use generation only.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>Some "solutions" are arguable. We curate puzzles where the unique answer is the dominant response in 50+ raters.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Cross-cultural item equivalence is not fully established (speculative).</div>
              </div>
            </div>
            <div class="module__history" id="rat-history"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section how">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">A</span>
            <span>How it's measured</span>
          </div>
          <h2 class="t-h2">Generation, not recognition.</h2>
        </div>
        <div class="how__steps">
          <div class="how__step">
            <span class="how__ix">1</span>
            <h3>Three words</h3>
            <p>You see three words that share a single answer. "Falling actor dust" → "star".</p>
          </div>
          <div class="how__step">
            <span class="how__ix">2</span>
            <h3>Generate</h3>
            <p>Type the answer as a free word. There is no list to pick from. The hard work is the generation — not the recognition.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">3</span>
            <h3>Score</h3>
            <p>Six puzzles. Score is the solve rate and the median time-to-solve. We keep both because the time signal is as informative as the binary.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">4</span>
            <h3>Track</h3>
            <p>Stored in the RAT skill graph. Your median time-to-solve is the headline metric; the spread across puzzles is the secondary signal.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section module-next">
      <div class="container">
        <div class="module-next__inner">
          <div>
            <span class="t-eyebrow">Next module</span>
            <h3 class="t-h3">Concept Jump</h3>
            <p>Click or type your way from a start concept to a target across a real knowledge graph. Scored against the shortest route.</p>
          </div>
          <a class="btn btn--primary" href="/modules/concept-jump">Open Concept Jump →</a>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());
    initRAT();
    cleanups.push(disposeRAT);
    const host = document.getElementById('rat-history');
    if (host) {
      const disposeHist = mountHistoryPanel(host, 'rat');
      cleanups.push(disposeHist);
    }
    return () => cleanups.forEach((c) => c());
  }
};
