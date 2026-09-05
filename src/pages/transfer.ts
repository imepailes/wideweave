// /transfer — the assessment battery explained.

import type { PageModule } from './types';
import { pageIntro } from '../motion';

export const transferPage: PageModule = {
  html: /* html */ `
    <section class="page-lead">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <span>Transfer battery</span>
        </div>
        <h1 class="t-h1">A different kind of test, on a different day.</h1>
        <p class="t-lead">
          Every 21 days, Wideweave runs five structurally unrelated
          tasks you have never seen in the app. The score lives in the
          same graph as your in-app skill history — so the comparison
          is real. If the in-app graphs go up but the transfer battery
          doesn't, we say so.
        </p>
        <div class="page-lead__meta page-lead__chips">
          <span class="pill pill--proved"><span class="dot"></span>Quarterly</span>
          <span class="meta-line">5 tasks · ~22 minutes</span>
          <span class="meta-line">Last: 8 days ago</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>The three numbers</span>
          </div>
          <h2 class="t-h2">In-app skill, transfer skill, and the gap.</h2>
        </div>

        <div class="transfer__panel">
          <div class="transfer__copy">
            <h3>The three numbers</h3>
            <p>For each user, we compute three rolling scores: in-app skill (the mean of the four skill graphs), transfer skill (the rolling mean across the five tasks), and the gap (the difference). The gap is the headline metric, not the skill.</p>
            <div class="transfer__when">
              <span class="meta-line">You · last 4 batteries</span>
              <ul>
                <li><strong>In-app skill:</strong> +19% over 12 weeks</li>
                <li><strong>Transfer skill:</strong> +6% over 12 weeks</li>
                <li><strong>Gap:</strong> 13 points</li>
              </ul>
            </div>
            <p class="transfer__note">A 13-point gap is normal at this stage of training. The lab's median user is at 11. Wideweave publishes the distribution openly so you can compare against your cohort.</p>
          </div>
          <div class="transfer__chart" aria-hidden="true">
            <div class="transfer__chart-bars">
              <div class="transfer__chart-row">
                <span>Verbal analogy</span>
                <div class="bar"><i style="width: 72%"></i></div>
                <span class="transfer__chart-num">+8%</span>
              </div>
              <div class="transfer__chart-row">
                <span>Numerical n-back</span>
                <div class="bar"><i style="width: 84%"></i></div>
                <span class="transfer__chart-num">+12%</span>
              </div>
              <div class="transfer__chart-row">
                <span>Sketch interp.</span>
                <div class="bar"><i style="width: 52%"></i></div>
                <span class="transfer__chart-num">+4%</span>
              </div>
              <div class="transfer__chart-row">
                <span>Constraint-finding</span>
                <div class="bar"><i style="width: 36%"></i></div>
                <span class="transfer__chart-num">+1%</span>
              </div>
              <div class="transfer__chart-row">
                <span>Research speedrun</span>
                <div class="bar"><i style="width: 70%"></i></div>
                <span class="transfer__chart-num">+9%</span>
              </div>
            </div>
            <div class="transfer__chart-legend">
              <span>Example distribution · the lab is just getting started</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">02</span>
            <span>The five tasks</span>
          </div>
          <h2 class="t-h2">Five tasks, none of which appear in the app.</h2>
        </div>

        <div class="battery">
          <article class="battery__row">
            <span class="battery__ix">01</span>
            <div>
              <h3 class="t-h4">Verbal analogy</h3>
              <p>Solve novel analogies (word : synonym :: phrase : ?). Items are generated and never reused across the cohort. Pulls on a different lexical-retrieval channel than DAT.</p>
              <span class="battery__cite">Construct: analogical reasoning · independent of DAT or RAT.</span>
            </div>
            <span class="battery__delta">+8%</span>
          </article>
          <article class="battery__row">
            <span class="battery__ix">02</span>
            <div>
              <h3 class="t-h4">Numerical n-back (audio only)</h3>
              <p>Same family as the in-app Dual n-back, but with spoken digits instead of grid cells. Tracks the working-memory claim in a different modality.</p>
              <span class="battery__cite">Construct: modality-independent working memory.</span>
            </div>
            <span class="battery__delta">+12%</span>
          </article>
          <article class="battery__row">
            <span class="battery__ix">03</span>
            <div>
              <h3 class="t-h4">Sketch interpretation</h3>
              <p>You see 8 ambiguous inkblot-style images and write a one-line interpretation for each. Scored by independent raters against a creativity rubric.</p>
              <span class="battery__cite">Construct: divergent production under uncertainty.</span>
            </div>
            <span class="battery__delta">+4%</span>
          </article>
          <article class="battery__row">
            <span class="battery__ix">04</span>
            <div>
              <h3 class="t-h4">Constraint-finding</h3>
              <p>You are given a paragraph of plausibly-true claims and asked to identify the single claim that contradicts the others. Pulls on critical-reading rather than creative production.</p>
              <span class="battery__cite">Construct: critical reading under noise.</span>
            </div>
            <span class="battery__delta">+1%</span>
          </article>
          <article class="battery__row">
            <span class="battery__ix">05</span>
            <div>
              <h3 class="t-h4">Research speedrun</h3>
              <p>A real Wikipedia-style question with a known answer. You navigate the graph manually — no external search. Closest analogue to Concept Jump but on a fresh graph each quarter.</p>
              <span class="battery__cite">Construct: deliberate semantic search.</span>
            </div>
            <span class="battery__delta">+9%</span>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">03</span>
            <span>What we will not claim</span>
          </div>
          <h2 class="t-h2">The honest read on transfer.</h2>
        </div>
        <div class="method__rules">
          <div class="method__rule">
            <span class="method__rule-ix">A</span>
            <h3>Transfer is real but small</h3>
            <p>Across cohorts 11–14, the median in-app gain is +24% over 12 weeks. The median transfer-battery gain is +6%. Wideweave is in the same range as the literature — neither zero nor a "transform your brain" story.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">B</span>
            <h3>Some tasks transfer more</h3>
            <p>Modality-independent working memory (numerical n-back) shows the largest transfer. Critical reading and sketch interpretation show the smallest. The pattern matches the broader literature on near vs far transfer.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">C</span>
            <h3>We publish the gap</h3>
            <p>The lab publishes the gap distribution by module and by cohort. If your in-app graph rises but the gap widens, the lab flags it for you — that is the honest signal.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <div class="cta__inner">
          <span class="t-eyebrow">Run the next battery</span>
          <h2>The transfer battery is open to all weavers every 21 days.</h2>
          <div class="cta__actions">
            <a class="btn btn--primary" href="/modules/divergent-association">Start a 12-minute session</a>
            <a class="btn btn--ghost" href="/method">Read the method</a>
          </div>
        </div>
      </div>
    </section>
  `,
  init: async () => pageIntro
};
