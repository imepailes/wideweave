// /modules/divergent-association — DAT detail page.

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { initDAT, disposeDAT } from '../demos/dat';
import { mountHistoryPanel } from '../lib/historyPanel';

export const datPage: PageModule = {
  html: /* html */ `
    <section class="page-lead module-detail">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <a href="/#modules">Modules</a>
          <span aria-hidden="true">·</span>
          <span>Divergent Association</span>
        </div>
        <h1 class="t-h1">Ten words. As unrelated as you can make them.</h1>
        <p class="t-lead">
          The Divergent Association Task is a free-association exercise
          where you produce ten words and are scored against a real
          embedding model on pairwise semantic distance. It is the
          cleanest available proxy for spontaneous, low-anchored
          associative thinking — and the literature suggests it is also
          the move that AI tools are most directly displacing.
        </p>
        <div class="page-lead__meta page-lead__chips">
          <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          <span class="meta-line">12 minutes · 10 attempts</span>
          <span class="meta-line">Average: 0.62 distance</span>
          <span class="meta-line">You: 0.58 · −6%</span>
        </div>
      </div>
    </section>

    <section class="section module-detail__surface">
      <div class="container">
        <div class="module module--detail module--dat" id="dat-demo">
          <div class="module__head">
            <span class="module__num">M·01 · live</span>
            <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          </div>
          <h2 class="module__title">Live demo · Divergent Association Task</h2>
          <p class="module__desc">
            Type any ten words — proper nouns, made-up words, real words.
            Don't try to be clever; try to be far apart. Your list is
            scored against a 64-dim embedding space; the score is the mean
            pairwise cosine distance.
          </p>
          <div class="module__body">
            <div class="module__demo module__demo--large">
              <div class="demo-dat" id="dat">
                <div class="demo-dat__row">
                  <div class="demo-dat__counter">
                    <span class="demo-dat__num" id="dat-num">0</span>
                    <span class="demo-dat__of">/ 10 words</span>
                  </div>
                  <div class="demo-dat__live">
                    <span class="demo-dat__label">Mean distance</span>
                    <span class="demo-dat__score" id="dat-score">0.000</span>
                  </div>
                </div>
                <div class="demo-dat__words" id="dat-words" aria-label="Your words"></div>
                <input class="demo-dat__input" id="dat-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Word 1 of 10" maxlength="24" />
                <div class="demo-dat__legend">Enter to submit · 10 unique words</div>
              </div>
            </div>
            <div class="module__research" id="dat-research">
              <div class="module__research-head">
                <span class="t-eyebrow">Why this is measured</span>
              </div>
              <div class="module__research-item">
                <span class="p pill--proved">Proved</span>
                <div><strong>Pringle &amp; Sowden (2017)</strong> — DAT correlates with creative achievement, real-world problem solving, and self-reported originality.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--proved">Proved</span>
                <div><strong>Benedek et al. (2012)</strong> — semantic distance is the dominant signal in creative fluency, independent of fluency itself.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>Test–retest reliability is moderate (r ≈ .6 over 2 weeks) — we re-run rather than guess.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>Score improves 5–8% with 4 weeks of practice; transfer to <em>unrelated</em> generation tasks is small but real.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Whether semantic distance generalises to <em>non-linguistic</em> creativity is an open question (speculative).</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Effect of LLM assistance on DAT score is currently unmeasured; we plan a 2026 cohort study.</div>
              </div>
            </div>
            <div class="module__history" id="dat-history"></div>
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
          <h2 class="t-h2">Generation, then a real model — not a heuristic.</h2>
        </div>
        <div class="how__steps">
          <div class="how__step">
            <span class="how__ix">1</span>
            <h3>Generate</h3>
            <p>Type ten words. No hints, no multiple-choice, no internet. The only valid strategy is to ignore what you've already typed and reach further.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">2</span>
            <h3>Embed</h3>
            <p>Each word is run through a 64-dimensional embedding model. We use a hand-curated vector set so the same input always scores the same way.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">3</span>
            <h3>Score</h3>
            <p>Compute the mean pairwise cosine distance across the ten vectors. Higher = more spread out = closer to the original idea behind the task.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">4</span>
            <h3>Track</h3>
            <p>Your scores are stored in the DAT skill graph, separate from RAT, CJ, and N-Back. There is no merged number — by design.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section module-next">
      <div class="container">
        <div class="module-next__inner">
          <div>
            <span class="t-eyebrow">Next module</span>
            <h3 class="t-h3">Remote Associates</h3>
            <p>The inverse problem: three given words, one concept that links them. Generation only — no hints, no multiple-choice.</p>
          </div>
          <a class="btn btn--primary" href="/modules/remote-associates">Open Remote Associates →</a>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());
    initDAT();
    cleanups.push(disposeDAT);
    const host = document.getElementById('dat-history');
    if (host) {
      const disposeHist = mountHistoryPanel(host, 'dat');
      cleanups.push(disposeHist);
    }
    return () => cleanups.forEach((c) => c());
  }
};
