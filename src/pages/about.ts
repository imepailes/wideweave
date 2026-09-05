// /about — who built Wideweave and why.

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { refreshCohort } from '../lib/cohort';

export const aboutPage: PageModule = {
  html: /* html */ `
    <section class="page-lead">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <span>About the lab</span>
        </div>
        <h1 class="t-h1">A small lab of researchers, builders, and editors.</h1>
        <p class="t-lead">
          Wideweave is an independent research product. The team is
          eleven. The lab is funded by membership, not by ads, not by
          data sales, and not by a parent company with a brain-training
          vertical to defend.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>Why this exists</span>
          </div>
          <h2 class="t-h2">AI is taking cognitive moves that the human brain evolved to do.</h2>
        </div>
        <div class="about__lead">
          <p>
            The category of cognitive task that LLM tools are most directly
            displacing is the category that brain-training has been
            studying for 60 years: associative retrieval, analogical
            search, divergent generation, and working-memory pressure.
            When you outsource a move often enough, the underlying
            ability decays — and the decay is invisible to you because
            you no longer notice what you no longer do.
          </p>
          <p>
            Wideweave exists to keep those four moves alive. The lab is
            explicit about the evidence and explicit about the
            overclaim. The interface is built to make generation easy
            and outsourcing hard, with measurement that tells you the
            truth about whether it is working.
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">02</span>
            <span>The team</span>
          </div>
          <h2 class="t-h2">Eleven people. Four on the science. Five on the build.</h2>
        </div>

        <div class="about__grid">
          <div class="about__card">
            <span class="about__ix">A</span>
            <h3>Dr. R. Okafor</h3>
            <p>Director · cognitive science, attention &amp; associative memory. Background: Edinburgh, MPI. Co-author of the lab's transfer protocol.</p>
          </div>
          <div class="about__card">
            <span class="about__ix">B</span>
            <h3>Dr. M. Carr</h3>
            <p>Science lead · spaced-repetition &amp; retention. Background: ANU, Ebisu maintainer.</p>
          </div>
          <div class="about__card">
            <span class="about__ix">C</span>
            <h3>Dr. L. Park</h3>
            <p>Statistical lead · item response theory, Bayesian decay, transfer-battery scoring.</p>
          </div>
          <div class="about__card">
            <span class="about__ix">D</span>
            <h3>J. Halverson</h3>
            <p>Editor · the marketing site, the cohort reports, the open data. Background: London review desk.</p>
          </div>
          <div class="about__card">
            <span class="about__ix">E</span>
            <h3>A. Ito</h3>
            <p>Build lead · TS, GSAP, Three.js. Background: design tooling, IDE plugins.</p>
          </div>
          <div class="about__card">
            <span class="about__ix">F</span>
            <h3>S. Bauer</h3>
            <p>Data engineer · embedding models, the semantic-distance engine, the lab's private vector store.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">03</span>
            <span>How the lab is funded</span>
          </div>
          <h2 class="t-h2">Membership, not data sales. Not ads. Not investors with a thesis.</h2>
        </div>
        <div class="about__lead">
          <p>
            The lab runs on a flat £9/month membership. Members get the
            full product, the open-data archive, and the quarterly cohort
            report. We do not sell data, do not run ads, do not have an
            investor on the cap table. This is the only way we can be
            honest about transfer — because there is no one on the
            other side of the wall wanting us to be less honest.
          </p>
          <p>
            We have turned down four acquisition offers because the
            acquirers were in adjacent brain-training categories and
            would have had a financial incentive to soften the
            transfer messaging. We will keep turning them down.
          </p>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <div class="cta__inner">
          <span class="t-eyebrow" data-live="status">The lab</span>
          <h2 data-live="cta">A small, open lab. No fake numbers — every count comes from real sessions.</h2>
          <div class="cta__actions">
            <a class="btn btn--primary" href="/modules/divergent-association">Start a 12-minute session</a>
            <a class="btn btn--ghost" href="/method">Read the method</a>
          </div>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    pageIntro();
    // Live count in the CTA heading
    const ctaEl = document.querySelector<HTMLElement>('[data-live="cta"]');
    const statusEl = document.querySelector<HTMLElement>('[data-live="status"]');
    try {
      const snap = await refreshCohort();
      if (statusEl) statusEl.textContent = snap.configured ? 'The lab' : 'The lab · not yet connected';
      if (ctaEl) {
        if (!snap.configured) {
          ctaEl.textContent = 'A small, open lab. Set VITE_SUPABASE_URL to publish live counts.';
        } else if (snap.weavers === 0) {
          ctaEl.textContent = 'A small, open lab. Be the first to train here.';
        } else {
          ctaEl.textContent = `${snap.weavers.toLocaleString()} ${snap.weavers === 1 ? 'weaver' : 'weavers'} in the open lab. ${snap.sessions_total.toLocaleString()} session${snap.sessions_total === 1 ? '' : 's'} so far.`;
        }
      }
    } catch {
      if (ctaEl) ctaEl.textContent = 'A small, open lab. The cohort count is temporarily unavailable.';
    }
  }
};
