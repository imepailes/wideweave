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
            <span class="method__rule-ix">a</span>
            <h3>What this page is honest about</h3>
            <p>The principles above are product rules. They are not aspirational — they are the lines in the sand that the platform is built to enforce. Where the platform fails one of them, the failure is the bug, not the rule.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">b</span>
            <h3>What this page is not</h3>
            <p>There are no made-up cohort numbers, no fake retention statistics, no invented "first we tried X, then we tried Y" backstory. The platform is honest about its boundaries; this page is honest about being a single product with a single set of decisions.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">c</span>
            <h3>The transfer battery is the test</h3>
            <p>When the lab is asked "does it work?", the answer is whatever the transfer battery shows, for each user, on a per-task basis. If the in-app graphs go up and the transfer battery doesn't, that is the honest answer. The lab will say so on the /transfer page, every time.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">d</span>
            <h3>What to read next</h3>
            <p>The <a href="/method">method page</a> describes how the four modules are scored. The <a href="/transfer">transfer battery page</a> describes the four research-grade tasks that test whether any of it transfers. The <a href="/about">about page</a> describes who built the platform and the limits of the science it's based on.</p>
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
