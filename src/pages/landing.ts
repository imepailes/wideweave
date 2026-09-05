// Landing — the focused index. Hero, module index, two teasers, CTA.

import type { PageModule } from './types';
import { initHero, disposeHero } from '../hero';
import { pageIntro } from '../motion';
import { refreshCohort } from '../lib/cohort';

export const landingPage: PageModule = {
  html: /* html */ `
    <section class="hero">
      <div class="container">
        <div class="hero__grid">
          <div class="hero__copy page-lead">
            <div class="page-lead__meta hero__eyebrow">
              <span class="live" data-live="status">Live lab</span>
              <span aria-hidden="true">·</span>
              <span data-live="weavers">Connecting to the lab…</span>
            </div>
            <h1 class="t-h1">
              A living lab for the mental moves you keep outsourcing to&nbsp;AI.
            </h1>
            <p class="t-lead hero__lead">
              Wideweave is a brain-training platform built around the four moves
              the AI era is quietly eroding: <strong>recalling</strong>,
              <strong>generating</strong>, <strong>connecting</strong>, and
              <strong>searching</strong>. Every exercise is measured against
              the literature, never against itself.
            </p>
            <div class="hero__cta">
              <a class="btn btn--primary" href="/modules/divergent-association">Start a 12-minute session</a>
              <a class="btn btn--ghost" href="/method">Read the method</a>
            </div>
            <div class="hero__meta">
              <span><strong>0</strong> fake IQ scores</span>
              <span><strong>4</strong> independent skill graphs</span>
              <span><strong>1</strong> semantic-distance engine</span>
              <span><strong>1</strong> quarterly transfer battery</span>
            </div>
          </div>

          <div class="hero__stage" id="hero-stage" aria-label="Semantic knowledge graph — live demo">
            <canvas id="hero-canvas" aria-hidden="true"></canvas>
            <div class="hero__stage-corners" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </div>
            <div class="hero__stage-readout" aria-hidden="true">
              <div>
                <div>Nodes · 248 concepts</div>
                <div><strong id="hero-readout-num">Dreaming</strong></div>
              </div>
              <div style="text-align:right">
                <div>Path length · <strong id="hero-readout-d">0.34</strong></div>
                <div>Embeddings · <strong>live</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section module-index" id="modules">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>The four modules</span>
          </div>
          <h2 class="t-h2">One engine. Four honest exercises.</h2>
          <p class="t-lead">
            Each module runs on the same semantic-distance calculator and
            keeps its own independent skill graph. There is no merged "IQ"
            number, by design.
          </p>
        </div>

        <div class="module-index__grid">
          <a class="module-index__card" href="/modules/divergent-association" data-module="dat">
            <div class="module-index__head">
              <span class="module-index__num">M·01</span>
              <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
            </div>
            <h3 class="module-index__title">Divergent association</h3>
            <p class="module-index__desc">
              Ten words. As unrelated as you can make them. Scored against a
              real embedding model on semantic distance, not a novelty
              heuristic.
            </p>
            <div class="module-index__meta">
              <span><strong>Pringle &amp; Sowden 2017</strong> · correlates with creative achievement</span>
            </div>
            <span class="module-index__cta">Open the module<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
          </a>

          <a class="module-index__card" href="/modules/remote-associates" data-module="rat">
            <div class="module-index__head">
              <span class="module-index__num">M·02</span>
              <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
            </div>
            <h3 class="module-index__title">Remote associates</h3>
            <p class="module-index__desc">
              Three words. Generate the fourth that links them. Generation
              only — no multiple-choice, no hint button, no internet.
            </p>
            <div class="module-index__meta">
              <span><strong>Mednick 1962</strong> · the most replicated measure of associative thinking</span>
            </div>
            <span class="module-index__cta">Open the module<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
          </a>

          <a class="module-index__card" href="/modules/concept-jump" data-module="cj">
            <div class="module-index__head">
              <span class="module-index__num">M·03</span>
              <span class="pill pill--mixed"><span class="dot"></span>Promising</span>
            </div>
            <h3 class="module-index__title">Concept jump</h3>
            <p class="module-index__desc">
              Click or type your way from a start concept to a target across
              a real knowledge graph. Scored against the shortest route —
              you can only cheat yourself.
            </p>
            <div class="module-index__meta">
              <span><strong>Wiki-Game lineage</strong> · deliberate practice on semantic search</span>
            </div>
            <span class="module-index__cta">Open the module<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
          </a>

          <a class="module-index__card" href="/modules/dual-n-back" data-module="nb">
            <div class="module-index__head">
              <span class="module-index__num">M·04</span>
              <span class="pill pill--mixed"><span class="dot"></span>Promising</span>
            </div>
            <h3 class="module-index__title">Dual n-back</h3>
            <p class="module-index__desc">
              Working-memory pressure on a 3×3 grid plus audio. Difficulty
              adapts second-by-second to sit right at the edge of "hard
              but doable".
            </p>
            <div class="module-index__meta">
              <span><strong>Jaeggi et al. 2008</strong> · mixed replication record</span>
            </div>
            <span class="module-index__cta">Open the module<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
          </a>
        </div>
      </div>
    </section>

    <section class="section teasers" id="teasers">
      <div class="container">
        <div class="teasers__grid">
          <a class="teaser" href="/method">
            <div class="teaser__head">
              <span class="t-eyebrow">The method</span>
              <span class="teaser__arrow" aria-hidden="true"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
            </div>
            <h3 class="t-h3">How the loop works, end to end.</h3>
            <p class="t-body">
              Practice, honest feedback, adaptive difficulty, and a
              structurally different transfer battery that checks whether
              any of it actually moves the needle outside the app.
            </p>
            <ul class="teaser__list">
              <li>Generation before hints — always</li>
              <li>Spaced-repetition, not streak anxiety</li>
              <li>Adaptive difficulty on a rolling window</li>
              <li>Quarterly novel-task transfer battery</li>
            </ul>
          </a>
          <a class="teaser" href="/transfer">
            <div class="teaser__head">
              <span class="t-eyebrow">Transfer battery</span>
              <span class="teaser__arrow" aria-hidden="true"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
            </div>
            <h3 class="t-h3">If the in-app graphs go up but transfer doesn't, we say so.</h3>
            <p class="t-body">
              Every 21 days, Wideweave runs five structurally unrelated
              tasks you have never seen in the app. The result lives in the
              same graph as your skill history — so the comparison is real.
            </p>
            <div class="teaser__chart" aria-hidden="true">
              <div class="teaser__chart-row">
                <span>Verbal analogy</span>
                <div class="bar"><i style="width: 72%"></i></div>
                <span class="num">+8%</span>
              </div>
              <div class="teaser__chart-row">
                <span>Numerical n-back</span>
                <div class="bar"><i style="width: 84%"></i></div>
                <span class="num">+12%</span>
              </div>
              <div class="teaser__chart-row">
                <span>Sketch interp.</span>
                <div class="bar"><i style="width: 52%"></i></div>
                <span class="num">+4%</span>
              </div>
              <div class="teaser__chart-row">
                <span>Constraint-find.</span>
                <div class="bar"><i style="width: 36%"></i></div>
                <span class="num">+1%</span>
              </div>
              <div class="teaser__chart-row">
                <span>Research speedrun</span>
                <div class="bar"><i style="width: 70%"></i></div>
                <span class="num">+9%</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="cta" id="cta">
      <div class="container">
        <div class="cta__inner">
          <span class="t-eyebrow">Begin</span>
          <h2>Re-practice the moves you keep outsourcing.</h2>
          <p>
            12 minutes. One module. Real measurement. No merged score, no
            overclaim, no streak anxiety — just the next honest attempt.
          </p>
          <div class="cta__actions">
            <a class="btn btn--primary" href="/modules/divergent-association">Start a 12-minute session</a>
            <a class="btn btn--ghost" href="/method">Read the method</a>
          </div>
          <span class="cta__note">Free during the open lab · No credit card · Data stays yours</span>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());
    initHero();
    cleanups.push(disposeHero);
    // Live cohort counts — replace the hardcoded "5,318 weavers" with real numbers.
    const weaversEl = document.querySelector<HTMLElement>('[data-live="weavers"]');
    const statusEl = document.querySelector<HTMLElement>('[data-live="status"]');
    const fill = (text: string) => { if (weaversEl) weaversEl.textContent = text; };
    if (statusEl) statusEl.textContent = 'Live lab';
    try {
      const snap = await refreshCohort();
      if (!snap.configured) {
        fill('Set VITE_SUPABASE_URL to publish the cohort count');
      } else if (snap.weavers === 0) {
        fill('You\'re the first to train here today');
      } else {
        fill(`${snap.weavers.toLocaleString()} ${snap.weavers === 1 ? 'weaver' : 'weavers'}`);
      }
    } catch {
      fill('Cohort count unavailable');
    }
    return () => cleanups.forEach((c) => c());
  }
};
