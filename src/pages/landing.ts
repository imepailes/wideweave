// Landing — the focused index. Hero, module index, two teasers, CTA.

import type { PageModule } from './types';
import { initHero, disposeHero } from '../hero';
import { pageIntro } from '../motion';
import { refreshCohort } from '../lib/cohort';
import { getAuthState, onAuthChange } from '../lib/auth';
import { SUPABASE_CONFIGURED } from '../lib/supabase';
import { loadInAppSummary, inAppModuleLabel, formatInAppScore, type InAppSummary } from '../lib/inAppHistory';
import { loadBatteryHistory } from '../lib/batteryHistory';

function renderYourProfile(inApp: InAppSummary, battery: { rows: number; comparisons: { within: number; below: number; above: number; total: number } | null; latestAt: string | null }): string {
  const totalRuns = Object.values(inApp.counts).reduce((a, b) => a + b, 0);
  const modules: ('dat' | 'rat' | 'cj' | 'nb' | 'stroop')[] = ['dat', 'rat', 'cj', 'nb', 'stroop'];
  const rows = modules.map(m => {
    const latest = inApp.latest[m];
    const count = inApp.counts[m] ?? 0;
    const name = inAppModuleLabel(m);
    if (!latest) {
      return `<div class="profile__row profile__row--none">
        <span class="profile__name">${name}</span>
        <span class="profile__latest">no sessions</span>
        <span class="profile__count">—</span>
      </div>`;
    }
    return `<div class="profile__row">
      <span class="profile__name">${name}</span>
      <span class="profile__latest">${formatInAppScore(m, latest.score)}</span>
      <span class="profile__count">${count} run${count === 1 ? '' : 's'}</span>
    </div>`;
  }).join('');
  const batLine = battery.rows === 0
    ? `<span class="profile__battery-num">—</span><span class="profile__battery-label">no battery yet</span>`
    : battery.comparisons
      ? `<span class="profile__battery-num">${battery.comparisons.within}/${battery.comparisons.total}</span><span class="profile__battery-label">tasks within the published range</span>`
      : `<span class="profile__battery-num">—</span><span class="profile__battery-label">battery on file (older schema)</span>`;
  return `
    <section class="section profile" id="profile">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">00</span>
            <span>Your profile</span>
          </div>
          <h2 class="t-h2">${totalRuns} session${totalRuns === 1 ? '' : 's'} on file. ${battery.rows === 0 ? 'No transfer battery yet.' : 'Transfer battery done ' + battery.rows + ' time' + (battery.rows === 1 ? '' : 's') + '.'}</h2>
          <p class="t-body">A live view of your five training modules and your latest transfer battery result, compared to the published healthy-adult range for each task. No percentile, no composite IQ. Each task stands on its own. Click into the <a href="/library">library</a> for the published ranges and the citations.</p>
        </div>
        <div class="profile__grid">
          <div class="profile__col">
            <span class="t-eyebrow">In-app modules</span>
            <div class="profile__rows">${rows}</div>
          </div>
          <div class="profile__col">
            <span class="t-eyebrow">Transfer battery</span>
            <div class="profile__battery">${batLine}</div>
            <a class="btn btn--ghost profile__battery-cta" href="/transfer">${battery.rows === 0 ? 'Take the transfer battery' : 'See full battery results'} →</a>
          </div>
          <div class="profile__col">
            <span class="t-eyebrow">Spaced recall</span>
            <div class="profile__drill">
              <div class="profile__drill-num" data-drill-due>—</div>
              <div class="profile__drill-label">items due today</div>
            </div>
            <a class="btn btn--ghost profile__battery-cta" href="/drill" data-drill-cta>Open the drill →</a>
          </div>
        </div>
        <div class="profile__rights" data-data-rights>
          <div class="t-eyebrow">Data rights</div>
          <p class="profile__rights-body">The platform stores your sessions, transfer-battery runs, and spaced-recall items. You can export all of it as a single JSON file, or delete all of it. Deletion is final.</p>
          <div class="profile__rights-actions">
            <button class="btn btn--ghost" type="button" data-data-export>Download my data (JSON)</button>
            <button class="btn btn--danger" type="button" data-data-delete>Delete all my data</button>
          </div>
          <p class="profile__rights-status" data-data-rights-status></p>
        </div>
      </div>
    </section>`;
}

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
              A research lab for the mental moves you keep outsourcing to&nbsp;AI.
            </h1>
            <p class="t-lead hero__lead">
              Wideweave is a brain-training platform built around the cognitive
              moves the AI era is quietly eroding: <strong>recalling</strong>,
              <strong>generating</strong>, <strong>connecting</strong>,
              <strong>searching</strong>, and <strong>inhibiting</strong>.
              Every exercise is measured against the published literature,
              never against itself. No composite IQ, no fake percentiles.
            </p>
            <div class="hero__cta">
              <a class="btn btn--primary" href="/modules/divergent-association">Start a 12-minute module</a>
              <a class="btn btn--ghost" href="/method">Read the method</a>
            </div>
            <div class="hero__meta">
              <span><strong>0</strong> composite IQ scores</span>
              <span><strong>5</strong> training modules</span>
              <span><strong>4</strong> transfer-battery tasks</span>
              <span><strong>21</strong> peer-reviewed citations</span>
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

    <section data-landing-profile></section>

    <section class="section module-index" id="modules">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>The five training modules</span>
          </div>
          <h2 class="t-h2">One engine. Five honest exercises.</h2>
          <p class="t-lead">
            Each module keeps its own skill graph. There is no merged "IQ"
            number, by design. Each score is compared to the published
            literature where one exists, or to your own past sessions
            where it doesn't.
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

          <a class="module-index__card" href="/modules/stroop" data-module="stroop">
            <div class="module-index__head">
              <span class="module-index__num">M·05</span>
              <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
            </div>
            <h3 class="module-index__title">Stroop</h3>
            <p class="module-index__desc">
              The color, not the word. 60 trials per session, scored
              against the published mean from MacLeod (1991). The
              interference effect is one of the most replicated in
              experimental psychology.
            </p>
            <div class="module-index__meta">
              <span><strong>MacLeod 1991</strong> · inhibitory control, d ≈ 0.50 trained, d ≈ 0.20 transfer</span>
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
              <li>On-demand novel-task transfer battery</li>
            </ul>
          </a>
          <a class="teaser" href="/transfer">
            <div class="teaser__head">
              <span class="t-eyebrow">Transfer battery</span>
              <span class="teaser__arrow" aria-hidden="true"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
            </div>
            <h3 class="t-h3">If the in-app graphs go up but transfer doesn't, we say so.</h3>
            <p class="t-body">
              Four structurally unrelated tasks you have never seen in the
              app. Stroop, inspection time, mental rotation, reading span.
              Each score is compared to the published mean for your age
              band and shown next to the literature that says whether the
              task is trainable.
            </p>
            <ul class="teaser__list">
              <li>Inhibitory control · MacLeod (1991)</li>
              <li>Processing speed · Deary, Penke &amp; Johnson (2010)</li>
              <li>Visual-spatial · Shepard &amp; Metzler (1971)</li>
              <li>Working memory · Daneman &amp; Carpenter (1980)</li>
            </ul>
          </a>
          <a class="teaser" href="/library">
            <div class="teaser__head">
              <span class="t-eyebrow">The library</span>
              <span class="teaser__arrow" aria-hidden="true"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h10M8 3l4 4-4 4"/></svg></span>
            </div>
            <h3 class="t-h3">Every citation, every instrument, every honest disclaimer.</h3>
            <p class="t-body">
              The reading-first part of the lab. Five long-form essays:
              what the literature actually shows about brain training,
              the modules in detail, the transfer battery in detail,
              the method in detail, and a 20-entry bibliography with
              honest confidence pills.
            </p>
            <ul class="teaser__list">
              <li>21 peer-reviewed papers cited</li>
              <li>Proved / Mixed / Speculative pills</li>
              <li>For the days you want the long version</li>
            </ul>
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
    // Cohort count — only show the count when it's actually meaningful.
    // Below 10 sessions, the count is too small to be useful; we say so.
    // The "Live lab" badge is replaced with "Open lab" because the lab
    // is a self-hosted project, not an ongoing research operation.
    const weaversEl = document.querySelector<HTMLElement>('[data-live="weavers"]');
    const statusEl = document.querySelector<HTMLElement>('[data-live="status"]');
    const fill = (text: string) => { if (weaversEl) weaversEl.textContent = text; };
    if (statusEl) statusEl.textContent = 'Open lab';
    try {
      const snap = await refreshCohort();
      if (!snap.configured) {
        fill('Set VITE_SUPABASE_URL to publish the cohort count');
      } else if (snap.sessions_total < 10) {
        fill('too few sessions in the lab for a meaningful cohort');
      } else if (snap.sessions_total < 50) {
        fill(`${snap.sessions_total} sessions in the lab so far`);
      } else {
        fill(`${snap.sessions_total.toLocaleString()} sessions · ${snap.weavers.toLocaleString()} ${snap.weavers === 1 ? 'weaver' : 'weavers'} in the lab`);
      }
    } catch {
      fill('Cohort count unavailable');
    }

    // Your-profile widget (only renders when signed in)
    const profileHost = document.querySelector<HTMLElement>('[data-landing-profile]');
    async function refreshProfile() {
      if (!profileHost) return;
      const auth = getAuthState();
      if (auth.status !== 'signed-in' || !SUPABASE_CONFIGURED) {
        profileHost.innerHTML = '';
        return;
      }
      const [inApp, bat] = await Promise.all([loadInAppSummary(), loadBatteryHistory(1)]);
      const latestRow = bat.rows[0];
      const latest = latestRow ? latestRow.comparisons : null;
      // Honest summary: how many of the 4 tasks were within / below / above
      // the published range on the user's most recent battery run. This is
      // a count, not a percentile. The mean-percentile number is gone.
      const cmpCounts = latest
        ? { within: 0, below: 0, above: 0, total: 0 }
        : null;
      if (latest && cmpCounts) {
        for (const v of Object.values(latest)) {
          if (v === 'within' || v === 'below' || v === 'above') {
            cmpCounts[v]++;
            cmpCounts.total++;
          }
        }
      }
      profileHost.innerHTML = renderYourProfile(inApp, {
        rows: bat.rows.length,
        comparisons: cmpCounts,
        latestAt: latestRow?.created_at ?? null
      });
      // After render, fill the drill-due count
      const { loadDueItems } = await import('../lib/spacedRecall');
      const [ratDue, cjDue] = await Promise.all([loadDueItems('rat', 50), loadDueItems('cj', 50)]);
      const dueEl = profileHost.querySelector<HTMLElement>('[data-drill-due]');
      if (dueEl) dueEl.textContent = String(ratDue.length + cjDue.length);
      const cta = profileHost.querySelector<HTMLElement>('[data-drill-cta]');
      if (cta) cta.textContent = ratDue.length + cjDue.length === 0 ? 'See the drill →' : 'Open the drill →';

      // Wire the data rights panel. Each click handler is attached
      // freshly after re-render so they survive auth/profile refresh.
      const statusEl = profileHost.querySelector<HTMLElement>('[data-data-rights-status]');
      const setStatus = (text: string) => { if (statusEl) statusEl.textContent = text; };
      const exportBtn = profileHost.querySelector<HTMLButtonElement>('[data-data-export]');
      const deleteBtn = profileHost.querySelector<HTMLButtonElement>('[data-data-delete]');
      const { exportAll, deleteAll, downloadPayload } = await import('../lib/dataRights');
      if (exportBtn) {
        exportBtn.onclick = async () => {
          exportBtn.disabled = true;
          setStatus('Preparing your data…');
          const res = await exportAll();
          exportBtn.disabled = false;
          if (!res.ok) { setStatus('Export failed: ' + (res.error ?? 'unknown')); return; }
          downloadPayload(res.payload!);
          setStatus(`Exported ${res.payload!.sessions.length} sessions, ${res.payload!.battery_runs.length} battery runs, ${res.payload!.spaced_recall_items.length} recall items.`);
        };
      }
      if (deleteBtn) {
        deleteBtn.onclick = async () => {
          if (!confirm('This deletes every session, battery run, and recall item associated with this account. The auth row stays. Continue?')) return;
          deleteBtn.disabled = true;
          exportBtn && (exportBtn.disabled = true);
          setStatus('Deleting…');
          const res = await deleteAll();
          deleteBtn.disabled = false;
          exportBtn && (exportBtn.disabled = false);
          if (!res.ok) { setStatus('Delete failed: ' + (res.error ?? 'unknown')); return; }
          setStatus(`Deleted ${res.deleted!.sessions} sessions, ${res.deleted!.battery_runs} battery runs, ${res.deleted!.spaced_recall_items} recall items. Reloading…`);
          setTimeout(() => window.location.reload(), 1500);
        };
      }
    }
    await refreshProfile();
    const offAuth = onAuthChange(() => { void refreshProfile(); });
    cleanups.push(offAuth);

    return () => cleanups.forEach((c) => c());
  }
};
