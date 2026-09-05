// /modules/stroop — Stroop training module detail page.

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { initStroop, disposeStroop } from '../demos/stroop';
import { mountHistoryPanel } from '../lib/historyPanel';

export const stroopPage: PageModule = {
  html: /* html */ `
    <section class="page-lead module-detail">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <a href="/#modules">Modules</a>
          <span aria-hidden="true">·</span>
          <span>Stroop</span>
        </div>
        <h1 class="t-h1">The color. Not the word. The color.</h1>
        <p class="t-lead">
          The Stroop task asks you to identify the COLOR of a word that
          spells a different color. The interference between the two
          channels is one of the most replicated effects in cognitive
          psychology. Training it shows a small but real transfer to
          working memory and reading (Kane &amp; Engle 2003,
          d ≈ 0.20).
        </p>
        <div class="page-lead__meta page-lead__chips">
          <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          <span class="meta-line">~5 minutes · 60 trials</span>
          <span class="meta-line">Session mean incongruent RT</span>
          <span class="meta-line">Score: lower is better</span>
        </div>
      </div>
    </section>

    <section class="section module-detail__surface">
      <div class="container">
        <div class="module module--detail module--stroop" id="stroop-demo">
          <div class="module__head">
            <span class="module__num">M·05 · live</span>
            <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          </div>
          <h2 class="module__title">Live training · Stroop</h2>
          <p class="module__desc">
            60 trials per session. The word is always one of RED, BLUE,
            GREEN, or YELLOW. The ink is always one of those four colors.
            Sometimes the word and the ink match (congruent). Usually they
            don't (incongruent). Press the key for the COLOR, not the
            word. Sessions save when you complete at least 30 trials.
          </p>
          <div class="module__body">
            <div class="module__demo module__demo--large">
              <div id="stroop">
                <div id="stroop-mount"></div>
              </div>
            </div>
            <div class="module__research" id="stroop-research">
              <div class="module__research-head">
                <span class="t-eyebrow">Why this is measured</span>
              </div>
              <div class="module__research-item">
                <span class="p pill--proved">Proved</span>
                <div><strong>MacLeod (1991)</strong> — half a century of Stroop research. The interference effect is one of the most robust in experimental psychology.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--proved">Proved</span>
                <div><strong>Kane &amp; Engle (2003)</strong> — individual differences in Stroop interference predict working memory capacity (r ≈ .40).</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>Training reduces the Stroop effect by ~30% in 4 weeks of practice (d ≈ 0.50 on the trained task), but the transfer to <em>unrelated</em> inhibitory tasks is small (d ≈ 0.20, Melby-Lervåg &amp; Hulme 2013).</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>The effect grows with age — ~1ms/year after 20 (West &amp; Alain 2000). A 60-year-old user has a baseline ~40ms larger than a 20-year-old.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Whether reducing your own Stroop effect via training translates to fewer reading errors or better focus under distraction is plausible but not settled.</div>
              </div>
            </div>
            <div class="module__history" id="stroop-history"></div>
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
          <h2 class="t-h2">60 trials, two channels, one score.</h2>
        </div>
        <div class="how__steps">
          <div class="how__step">
            <span class="how__ix">1</span>
            <h3>Generate</h3>
            <p>Read the ink color. The word is irrelevant — even when it shouts the right answer in the wrong color. The hard part is suppressing the reading reflex.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">2</span>
            <h3>Time</h3>
            <p>Each trial is timed to the millisecond. Reaction time is the score, not the answer. The platform stores every per-trial RT so you can see your own curve.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">3</span>
            <h3>Score</h3>
            <p>Mean incongruent RT (correct trials only) is the session score. The Stroop effect (incongruent minus congruent) is reported alongside. Lower incongruent RT is better.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">4</span>
            <h3>Compare to the battery</h3>
            <p>The transfer battery uses the same task but with 16 trials and a published-age-band comparison. After three or four sessions here, take the battery and see whether the training carries over.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section module-next">
      <div class="container">
        <div class="module-next__inner">
          <div>
            <span class="t-eyebrow">Check your transfer</span>
            <h3 class="t-h3">Take the transfer battery.</h3>
            <p>The Stroop task also lives in the transfer battery — a 16-trial, age-band-compared measurement that asks whether any of this actually transfers outside the app. The same metric, the same scoring, the same MacLeod 1991 baseline.</p>
          </div>
          <a class="btn btn--primary" href="/transfer">Open the transfer battery →</a>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());
    initStroop();
    cleanups.push(disposeStroop);
    const host = document.getElementById('stroop-history');
    if (host) {
      const disposeHist = mountHistoryPanel(host, 'stroop');
      cleanups.push(disposeHist);
    }
    return () => cleanups.forEach((c) => c());
  }
};
