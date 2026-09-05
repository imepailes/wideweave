// /principles — what Wideweave will not do.

import type { PageModule } from './types';
import { pageIntro } from '../motion';

export const principlesPage: PageModule = {
  html: /* html */ `
    <section class="page-lead">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <span>Principles</span>
        </div>
        <h1 class="t-h1">What we will never do.</h1>
        <p class="t-lead">
          The brain-training category has a long history of overclaim.
          Wideweave is built around the moves we have decided to take
          off the table. These are not aspirational. They are the
          product boundaries, written down so they can be enforced.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>The six rules</span>
          </div>
          <h2 class="t-h2">Six product rules, written down so they can be enforced.</h2>
        </div>

        <div class="principles principles__list">
          <div class="principle">
            <h4>1 · No fake "IQ" score</h4>
            <p>There is no merged number. The four modules have independent skill graphs. A user who excels at one and plateaus at another is not a "high IQ" or a "low IQ" user — they are a user whose training has moved on different fronts.</p>
          </div>
          <div class="principle">
            <h4>2 · No hints before generation</h4>
            <p>Every module starts with generation. No autocomplete, no letter-bank, no "the answer starts with…". The hard part is producing — not recognising. Hints exist after a verified attempt and only as a coach view.</p>
          </div>
          <div class="principle">
            <h4>3 · No overclaim</h4>
            <p>Wideweave will not say it "boosts IQ" or "rewires your brain". Where the literature is mixed, we say so. Where the evidence is strong, we cite the study. Where we have no data, we say "we have no data".</p>
          </div>
          <div class="principle">
            <h4>4 · No leaderboard against others</h4>
            <p>Comparison to other users is a known engagement trap and a known motivation trap. Wideweave compares you to your past self. There is no global ranking, no friends list, no "X people beat you today" badge.</p>
          </div>
          <div class="principle">
            <h4>5 · No dark patterns</h4>
            <p>No streak anxiety, no "lose your progress" timers, no fake scarcity, no push-notification punishment. The schedule is friendly: a miss halves the predicted half-life and re-schedules. There is nothing to lose.</p>
          </div>
          <div class="principle">
            <h4>6 · No silent transfer</h4>
            <p>Wideweave will never report an in-app skill gain without checking the transfer battery. If the in-app graph rises but the battery does not, that is reported explicitly. The lab publishes the gap distribution openly.</p>
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
            <span>Cohort notes</span>
          </div>
          <h2 class="t-h2">What each cohort taught the lab.</h2>
        </div>

        <div class="method__rules">
          <div class="method__rule">
            <span class="method__rule-ix">11</span>
            <h3>Cohort 11 · the original</h3>
            <p>The first cohort exposed the "fake IQ" problem. The initial prototype merged the four skills into a single score. Users who trained for 8 weeks reported a feeling of being worse at things, even as the score went up. We removed the merged score in cohort 12.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">12</span>
            <h3>Cohort 12 · honest feedback</h3>
            <p>Replaced the merged score with four independent graphs. Added the per-attempt feedback "you are above / at / below the cohort median" so users had honest context. Cohort retention went from 38% to 51% in 8 weeks — honesty helped.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">13</span>
            <h3>Cohort 13 · the transfer battery</h3>
            <p>Added the five-task quarterly transfer battery. The first run of the battery was the moment we learned that in-app gains were running ~4× larger than transfer gains. We rebuilt the marketing site to be honest about it.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">14</span>
            <h3>Cohort 14 · current</h3>
            <p>The current cohort is the first to train with the gap-aware interface: the lab surfaces the gap explicitly. The cohort retention is 58% at 12 weeks. The lab is collecting LLM-usage data on the side to plan the 2026 LLM-assistance study.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <div class="cta__inner">
          <span class="t-eyebrow">Read the open data</span>
          <h2>Cohort data is published quarterly. Every number on the site is reproducible.</h2>
          <div class="cta__actions">
            <a class="btn btn--primary" href="/transfer">See the transfer battery</a>
            <a class="btn btn--ghost" href="/about">About the lab</a>
          </div>
        </div>
      </div>
    </section>
  `,
  init: async () => pageIntro
};
