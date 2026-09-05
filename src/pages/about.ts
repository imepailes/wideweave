// /about — what Wideweave actually is.

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
        <h1 class="t-h1">An open lab. Built on published science. Honest about its limits.</h1>
        <p class="t-lead">
          Wideweave is a research product. The lab publishes what it
          measures and how. Where the science is strong, the page says
          so. Where the science is mixed, the page says so. Where the
          platform doesn't know, the platform says so. There is no
          marketing layer that softens the truth.
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
          <h2 class="t-h2">AI is quietly taking cognitive moves the brain evolved to do.</h2>
        </div>
        <div class="about__lead">
          <p>
            The category of cognitive task that LLM tools are most
            directly displacing is the category that brain-training has
            been studying for 60 years: associative retrieval, analogical
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
            <span>What the lab is, and isn't</span>
          </div>
          <h2 class="t-h2">An open lab, not a brain-training company.</h2>
        </div>
        <div class="method__rules">
          <div class="method__rule">
            <span class="method__rule-ix">a</span>
            <h3>An open lab</h3>
            <p>The platform is open-source. The four transfer-battery tasks use published baseline distributions from cited studies (MacLeod 1991, Deary 2010, Shepard &amp; Metzler 1971, Daneman &amp; Carpenter 1980). The "your profile" widget is on the home page for every signed-in user. The numbers are real.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">b</span>
            <h3>Not a brain-training company</h3>
            <p>Wideweave does not sell subscriptions, runs no ads, has no investors. The platform is a research product first, an exercise tool second. It exists to keep the moves alive, not to maximise time-on-task. There is no "you've trained for 100 hours!" celebration screen.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">c</span>
            <h3>Not a clinical tool</h3>
            <p>The transfer battery is built on published mean and SD for each age band, but a 16-trial short battery is not a clinical assessment. If a result is concerning, the right next step is a clinical neuropsychologist, not a retake.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">d</span>
            <h3>Honest about the science</h3>
            <p>The transfer literature on cognitive training is genuinely mixed. Melby-Lervåg &amp; Hulme (2013) and Simonsmeier et al. (2016) disagree about whether working-memory training transfers; Jaeggi et al. (2008) is a positive, the failure-to-replicate (Melby-Lervåg 2016) is a negative. The platform shows the disagreement on the principles page and on the transfer page rather than picking a side.</p>
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
            <span>How the lab is run</span>
          </div>
          <h2 class="t-h2">Small. Open. Self-funded by the build.</h2>
        </div>
        <div class="about__lead">
          <p>
            Wideweave is built and run as an open lab. The source is
            public, the migration scripts are in the repository, and
            anyone can run the platform against their own Supabase
            project by setting the two environment variables. There is
            no paid tier, no premium module, and no data sharing. The
            lab's only metric is the gap between in-app training and
            transfer-battery scores — and the platform will say so when
            the gap is large.
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
