// /transfer — your cognitive profile. The transfer battery is a
// 4-task mini-assessment, taken in ~5 minutes, that measures what
// the in-app training transfers to. Tasks are NOT in the main app
// (that's the point — you can't practice them).

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { batteryController, type BatteryRun } from '../battery/batteryController';
import { saveBatteryRun, loadBatteryHistory, type BatteryRunRow } from '../lib/batteryHistory';
import { getStoredAgeBand, setStoredAgeBand } from '../lib/userSettings';
import { type AgeBand, BATTERY } from '../lib/batteryDistributions';
import { getAuthState } from '../lib/auth';
import { SUPABASE_CONFIGURED } from '../lib/supabase';

const AGE_BANDS: AgeBand[] = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

function renderAgeSelect(current: AgeBand | null): string {
  return `
    <div class="battery-age">
      <span class="battery-age__label">Your age band</span>
      <div class="battery-age__row">
        ${AGE_BANDS.map(b => `<button type="button" data-band="${b}" class="battery-age__btn${current === b ? ' is-on' : ''}">${b}</button>`).join('')}
      </div>
      <p class="battery-age__note">Used to compare your score to the published mean. Stored locally; never sent to the server without an explicit sync. Default: 25-34.</p>
    </div>`;
}

function renderHistory(rows: BatteryRunRow[]): string {
  if (rows.length === 0) return '';
  // Build a per-task trajectory
  const trajByTask: Record<string, { raw: number; created_at: string }[]> = {};
  // Newest first → reverse for sparkline
  for (const r of [...rows].reverse()) {
    for (const t of BATTERY) {
      const s = (r.scores as Record<string, { raw: number }>)[t.id];
      if (!s) continue;
      trajByTask[t.id] = trajByTask[t.id] ?? [];
      trajByTask[t.id].push({ raw: s.raw, created_at: r.created_at });
    }
  }
  const taskBlocks = BATTERY.filter(t => trajByTask[t.id]?.length).map(t => {
    const series = trajByTask[t.id];
    const W = 200, H = 40, pad = 4;
    const vals = series.map(s => s.raw);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const stepX = (W - pad * 2) / Math.max(series.length - 1, 1);
    const points = series.map((s, i) => `${pad + i * stepX},${pad + (1 - (s.raw - min) / range) * (H - pad * 2)}`);
    const last = series[series.length - 1];
    const lastX = pad + (series.length - 1) * stepX;
    const lastY = pad + (1 - (last.raw - min) / range) * (H - pad * 2);
    const svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Your last ${series.length} ${t.name} scores"><polyline points="${points.join(' ')}" fill="none" stroke="#1B1B1B" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${lastX}" cy="${lastY}" r="2.5" fill="#1B1B1B"/></svg>`;
    return `
      <div class="battery-history__row">
        <div class="battery-history__row-head">
          <span class="battery-history__name">${t.name}</span>
          <span class="battery-history__latest">latest: ${last.raw}${t.unit.startsWith('ms') ? 'ms' : t.unit.startsWith('%') ? '%' : ''}</span>
        </div>
        <div class="battery-history__chart">${svg}</div>
        <div class="battery-history__count">${series.length} run${series.length === 1 ? '' : 's'}</div>
      </div>`;
  }).join('');
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">02</span>
            <span>Your battery history</span>
          </div>
          <h2 class="t-h2">${rows.length} battery run${rows.length === 1 ? '' : 's'} on file.</h2>
          <p class="t-body">Each dot is a real session, not a fitted curve. The lab shows your actual trajectory — including the runs where nothing changed.</p>
        </div>
        <div class="battery-history">${taskBlocks}</div>
      </div>
    </section>`;
}

function renderMethodBlock(): string {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">04</span>
            <span>How the comparison works</span>
          </div>
          <h2 class="t-h2">Published means, honest numbers.</h2>
        </div>
        <div class="method__rules">
          <div class="method__rule">
            <span class="method__rule-ix">A</span>
            <h3>What "compared to your age band" means</h3>
            <p>Every score is converted to a <em>z-score</em> against the published mean and SD for your age band, drawn from the cited studies. A z of 0 is exactly average; +1 is one SD above (≈ 84th percentile).</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">B</span>
            <h3>What the lab does <em>not</em> claim</h3>
            <p>The lab does not compute a composite score. The lab does not claim any of these tasks "boost your IQ." The published literature on cognitive training transfer is mixed; the lab reports your trajectory next to the literature, not above it.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">C</span>
            <h3>What the lab will say when transfer fails</h3>
            <p>If your in-app modules improve and the transfer battery doesn't, the lab says so. That is the honest signal — and the design of the platform treats the transfer battery as the more important of the two numbers.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">D</span>
            <h3>Sources</h3>
            <ul class="battery-cites">
              <li>MacLeod (1991) — half a century of Stroop research.</li>
              <li>Deary, Penke &amp; Johnson (2010) — neuroscience of human intelligence differences.</li>
              <li>Jensen (1998) — inspection time meta-analysis.</li>
              <li>Shepard &amp; Metzler (1971) — mental rotation original.</li>
              <li>Voyer, Voyer &amp; Bryden (1995) — mental rotation meta-analysis.</li>
              <li>Uttal et al. (2013) — spatial training transfer meta-analysis.</li>
              <li>Daneman &amp; Carpenter (1980) — reading span original.</li>
              <li>Conway, Kane &amp; Engle (2005) — complex span review.</li>
              <li>Jaeggi &amp; Buschkuehl (2008) — working memory training.</li>
              <li>Melby-Lervåg &amp; Hulme (2013) — working memory training meta-analysis.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>`;
}

export const transferPage: PageModule = {
  html: /* html */ `
    <section class="page-lead">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <span>Cognitive profile</span>
        </div>
        <h1 class="t-h1">Does the training transfer to anything real?</h1>
        <p class="t-lead">
          The transfer battery is a 4-task mini-assessment, taken in
          about 5 minutes, that measures what the in-app training
          actually transfers to. The tasks are not in the main lab
          — you can't practice them — and the results are compared
          to the published mean for your age band, drawn from the
          cited studies.
        </p>
        <div class="page-lead__meta page-lead__chips" data-battery-meta>
          <span class="pill pill--proved"><span class="dot"></span>Research-grade</span>
          <span class="meta-line">4 tasks · ~5 min</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>Take the battery</span>
          </div>
          <h2 class="t-h2">The lab will set the comparison honestly. You set the age band.</h2>
        </div>
        <div id="transfer-age-select" data-transfer-age></div>
        <div id="transfer-battery" class="battery-mount"></div>
      </div>
    </section>

    <section class="section" data-transfer-history></section>

    ${renderMethodBlock()}

    <section class="cta">
      <div class="container">
        <div class="cta__inner">
          <span class="t-eyebrow">Train the lab</span>
          <h2>The four core modules are where the practice lives. The battery is where the question gets answered.</h2>
          <div class="cta__actions">
            <a class="btn btn--primary" href="/modules/divergent-association">Start a 12-minute session</a>
            <a class="btn btn--ghost" href="/method">Read the method</a>
          </div>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());

    // Age band: stored locally
    const storedBand = getStoredAgeBand();
    const ageContainer = document.getElementById('transfer-age-select');
    if (ageContainer) {
      ageContainer.innerHTML = renderAgeSelect(storedBand);
      ageContainer.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement)?.closest('[data-band]') as HTMLElement | null;
        if (!target) return;
        const band = target.dataset.band as AgeBand;
        setStoredAgeBand(band);
        // Update active class
        ageContainer.querySelectorAll('.battery-age__btn').forEach(b => b.classList.remove('is-on'));
        target.classList.add('is-on');
        // Re-render the battery with the new age band
        mountBatteryWith(band);
      });
    }

    let activeDispose: (() => void) | null = null;

    function mountBatteryWith(band: AgeBand | null) {
      if (activeDispose) { activeDispose(); activeDispose = null; }
      const host = document.getElementById('transfer-battery');
      if (!host) return;
      host.innerHTML = '';
      activeDispose = batteryController.mount(host, band, async (run: BatteryRun) => {
        // Save and refresh history
        const res = await saveBatteryRun(run);
        if (!res.ok && res.needsMigration) {
          // Show a banner inside the controller host
          const banner = document.createElement('div');
          banner.className = 'battery-migration battery-migration--inline';
          banner.innerHTML = `
            <div class="t-eyebrow">Not saved</div>
            <p>Your results are shown above, but the <code>battery_runs</code> table doesn't exist yet. Run <code>supabase/migrations/0002_battery.sql</code> in the Supabase SQL editor to enable persistence. Refresh the page after running it.</p>`;
          host.appendChild(banner);
        } else if (!res.ok) {
          // eslint-disable-next-line no-console
          console.info('[transfer] battery save skipped:', res.error);
        }
        await refreshHistory();
        // After save, the controller has already shown the results — keep them visible.
        const meta = document.querySelector('[data-battery-meta]');
        if (meta) {
          const lastRun = `${run.finishedAt - run.startedAt < 60 ? '< 1m' : `${Math.round((run.finishedAt - run.startedAt) / 60)}m`}`;
          const lastSpan = meta.querySelector('[data-battery-last]') as HTMLElement | null;
          if (lastSpan) lastSpan.textContent = `Last: just now · ${lastRun}`;
        }
      });
    }

    async function refreshHistory() {
      const histHost = document.querySelector<HTMLElement>('[data-transfer-history]');
      if (!histHost) return;
      const auth = getAuthState();
      if (auth.status !== 'signed-in' || !SUPABASE_CONFIGURED) {
        histHost.innerHTML = `
          <div class="container">
            <div class="battery-history-empty">
              History will appear here after you sign in and complete a battery. Without an account, runs are not saved.
            </div>
          </div>`;
        return;
      }
      const { rows, needsMigration } = await loadBatteryHistory(10);
      if (needsMigration) {
        histHost.innerHTML = `
          <div class="container">
            <div class="battery-migration">
              <div class="t-eyebrow">One-time setup</div>
              <h3 class="t-h4">Battery persistence isn't enabled yet.</h3>
              <p>The transfer battery works in the browser, but runs are not being saved because the <code>battery_runs</code> table doesn't exist in your Supabase project. To enable persistence, run this in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run):</p>
              <pre class="battery-migration__sql">create table if not exists public.battery_runs (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  age_band text check (age_band in ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  time_s int not null,
  scores jsonb not null,
  zscores jsonb not null,
  percentiles jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists battery_runs_user_created_idx
  on public.battery_runs (user_id, created_at desc);

alter table public.battery_runs enable row level security;

drop policy if exists "battery_read_own" on public.battery_runs;
create policy "battery_read_own" on public.battery_runs
  for select using (user_id = auth.uid());

drop policy if exists "battery_insert_own" on public.battery_runs;
create policy "battery_insert_own" on public.battery_runs
  for insert with check (user_id = auth.uid());</pre>
              <p class="battery-migration__sub">Until then, your results are still computed and shown — they just don't carry across reloads.</p>
            </div>
          </div>`;
        return;
      }
      if (rows.length === 0) {
        histHost.innerHTML = `
          <div class="container">
            <div class="battery-history-empty">
              No battery runs yet. Take the battery above and your first run will appear here.
            </div>
          </div>`;
        return;
      }
      histHost.innerHTML = renderHistory(rows);
    }

    // Initial mount
    mountBatteryWith(storedBand);
    await refreshHistory();

    cleanups.push(() => { if (activeDispose) activeDispose(); });
    return () => cleanups.forEach((c) => c());
  }
};
