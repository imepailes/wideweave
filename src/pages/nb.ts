// /modules/dual-n-back — Dual n-back detail page.

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { initNB, disposeNB } from '../demos/nb';
import { mountHistoryPanel } from '../lib/historyPanel';

export const nbPage: PageModule = {
  html: /* html */ `
    <section class="page-lead module-detail">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <a href="/#modules">Modules</a>
          <span aria-hidden="true">·</span>
          <span>Dual n-back</span>
        </div>
        <h1 class="t-h1">Working-memory pressure, on the edge of "hard but doable".</h1>
        <p class="t-lead">
          Dual n-back is a working-memory task where you track a spatial
          position and an audio letter, and tap when either matches what
          you saw <em>n</em> trials ago. The level of n adapts trial by
          trial to keep you at the edge of your capacity. The literature
          is mixed on transfer — we say so up front.
        </p>
        <div class="page-lead__meta page-lead__chips">
          <span class="pill pill--mixed"><span class="dot"></span>Promising</span>
          <span class="meta-line">20 trials · 2.5s cadence</span>
          <span class="meta-line">Current n · <strong>3</strong></span>
          <span class="meta-line">Hit rate · 78%</span>
        </div>
      </div>
    </section>

    <section class="section module-detail__surface">
      <div class="container">
        <div class="module module--detail module--nb" id="nb-demo">
          <div class="module__head">
            <span class="module__num">M·04 · live</span>
            <span class="pill pill--mixed"><span class="dot"></span>Promising</span>
          </div>
          <h2 class="module__title">Live demo · Dual n-back</h2>
          <p class="module__desc">
            Watch the 3×3 grid and listen to the letter. If the cell lit
            up in the same position <em>n</em> trials ago, tap POSITION.
            If you heard the same letter <em>n</em> trials ago, tap AUDIO.
            The level of n will rise when you're accurate and fall when
            you miss.
          </p>
          <div class="module__body">
            <div class="module__demo module__demo--large">
              <div class="demo-nb" id="nb">
                <div class="demo-nb__head">
                  <span class="demo-nb__level">n-back <strong id="nb-n">2</strong></span>
                  <span class="demo-nb__trial" id="nb-trial">trial 0 / 20</span>
                </div>
                <div class="demo-nb__grid" id="nb-grid" aria-label="Spatial grid">
                  <div class="demo-nb__cell" data-i="0"></div>
                  <div class="demo-nb__cell" data-i="1"></div>
                  <div class="demo-nb__cell" data-i="2"></div>
                  <div class="demo-nb__cell" data-i="3"></div>
                  <div class="demo-nb__cell" data-i="4"></div>
                  <div class="demo-nb__cell" data-i="5"></div>
                  <div class="demo-nb__cell" data-i="6"></div>
                  <div class="demo-nb__cell" data-i="7"></div>
                  <div class="demo-nb__cell" data-i="8"></div>
                </div>
                <div class="demo-nb__letter" id="nb-letter" aria-live="polite">·</div>
                <div class="demo-nb__controls">
                  <div class="demo-nb__btn-row">
                    <button class="demo-nb__btn" id="nb-pos" type="button">Position</button>
                    <button class="demo-nb__btn" id="nb-aud" type="button">Audio</button>
                  </div>
                  <div class="demo-nb__meter">
                    <div class="demo-nb__meter-row">
                      <span>Pos hits</span>
                      <div class="demo-nb__meter-bar"><i id="nb-pos-bar" style="width: 0%"></i></div>
                    </div>
                    <div class="demo-nb__meter-row">
                      <span>Aud hits</span>
                      <div class="demo-nb__meter-bar"><i id="nb-aud-bar" style="width: 0%"></i></div>
                    </div>
                  </div>
                </div>
                <div class="demo-nb__start">
                  <button class="btn btn--primary" id="nb-start" type="button">Start trial · audio on</button>
                  <span class="demo-nb__note">Sound is part of the test. Wear headphones.</span>
                </div>
              </div>
            </div>
            <div class="module__research" id="nb-research">
              <div class="module__research-head">
                <span class="t-eyebrow">Why this is measured</span>
              </div>
              <div class="module__research-item">
                <span class="p pill--proved">Proved</span>
                <div><strong>Jaeggi et al. (2008)</strong> — Dual n-back training improved fluid intelligence in the original 4-week study.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div><strong>Melby-Lervåg &amp; Hulme (2013, 2016)</strong> — meta-analysis suggests working-memory training does not transfer reliably to fluid intelligence.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>Active-control studies (Jaeggi 2010, von Bastian 2013) show smaller effects than the original; replication record is uneven.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>The task itself is well-validated: it loads working memory, and adaptive difficulty works as advertised.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Long-term transfer to "real" cognitive effort is currently unproven. We track it via the transfer battery.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Effect of an LLM on the cognitive cost of n-back is unmeasured — this is a 2026 cohort priority.</div>
              </div>
            </div>
            <div class="module__history" id="nb-history"></div>
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
          <h2 class="t-h2">Adaptive, quiet, and honest about transfer.</h2>
        </div>
        <div class="how__steps">
          <div class="how__step">
            <span class="how__ix">1</span>
            <h3>Track</h3>
            <p>Each trial: a 3×3 cell lights up and a letter plays. Tap POSITION if the cell matches n trials back; AUDIO if the letter does.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">2</span>
            <h3>Adapt</h3>
            <p>Difficulty (n) is adjusted on a 20-trial rolling window: rise if you're above 80% accuracy, fall if below 50%. Bounds 2–7.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">3</span>
            <h3>Score</h3>
            <p>We store the n-reached and the hit/false-alarm rate. The headline is the n you sustain over 20 trials.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">4</span>
            <h3>Track</h3>
            <p>Stored in the n-back skill graph. We treat the transfer question as open and survey it via the quarterly battery.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section module-next">
      <div class="container">
        <div class="module-next__inner">
          <div>
            <span class="t-eyebrow">Back to the start</span>
            <h3 class="t-h3">All four modules</h3>
            <p>Each module is a different mental move. They are not interchangeable, and they do not roll up into a single number.</p>
          </div>
          <a class="btn btn--primary" href="/#modules">See all four modules →</a>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());
    initNB();
    cleanups.push(disposeNB);
    const host = document.getElementById('nb-history');
    if (host) {
      const disposeHist = mountHistoryPanel(host, 'nb');
      cleanups.push(disposeHist);
    }
    return () => cleanups.forEach((c) => c());
  }
};
