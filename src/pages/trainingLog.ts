// /training-log — the most evidence-backed feature of the platform,
// and the least app-like. Self-reported daily values for the four
// non-app interventions that the literature has actually shown
// move the needle on cognition: sleep, aerobic exercise, reading,
// and a brief journal entry.

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { loadTodayLog, loadRecentLog, upsertTodayLog, type TrainingLogEntry } from '../lib/trainingLog';
import { onAuthChange } from '../lib/auth';

export const trainingLogPage: PageModule = {
  html: /* html */ `
    <section class="page-lead">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <span>Training log</span>
        </div>
        <h1 class="t-h1">The four levers the literature actually shows work.</h1>
        <p class="t-lead">
          The in-app training has small, narrow effects. Sleep, exercise,
          reading, and consistent retrieval practice are where the
          literature has the most reliable evidence. This page is
          for tracking them — not because the lab can prove the
          platform's tracking is causal, but because the lab can
          show you the trajectory next to the in-app graph.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>Today</span>
          </div>
          <h2 class="t-h2">Log today.</h2>
          <p class="t-lead">
            Four questions. Five seconds each. The platform does not
            pretend that self-report is a measurement; it is a
            tracking signal. The literature does the measurement
            part — these are the four interventions that have the
            largest meta-analytic effect sizes in the cognitive
            literature.
          </p>
        </div>

        <form class="log-form" data-log-form>
          <fieldset class="log-field">
            <legend class="log-legend">Sleep</legend>
            <p class="log-help">Did you sleep 7+ hours last night?</p>
            <p class="log-cite">Walker (2017); Harvard sleep-and-cognition review. Sleep deprivation drops cognitive test performance by 5–15 IQ points acutely.</p>
            <div class="log-toggle">
              <label class="log-radio"><input type="radio" name="slept_well" value="yes"><span>Yes</span></label>
              <label class="log-radio"><input type="radio" name="slept_well" value="no"><span>No</span></label>
            </div>
          </fieldset>

          <fieldset class="log-field">
            <legend class="log-legend">Aerobic exercise</legend>
            <p class="log-help">Did you do 20+ minutes of moderate aerobic exercise today?</p>
            <p class="log-cite">Smith et al. (2010), Psychological Bulletin meta-analysis, 29 RCTs, n=2049. The most reliable executive-function booster in the literature.</p>
            <div class="log-toggle">
              <label class="log-radio"><input type="radio" name="exercised" value="yes"><span>Yes</span></label>
              <label class="log-radio"><input type="radio" name="exercised" value="no"><span>No</span></label>
            </div>
          </fieldset>

          <fieldset class="log-field">
            <legend class="log-legend">Reading</legend>
            <p class="log-help">Pages read today. Crystallised IQ is the most reliably improvable part of intelligence, and reading is the single best-documented way to do it.</p>
            <p class="log-cite">Ritchie et al. (2018), Understanding Society cohort, n=2,232. Years of cognitively demanding activity, especially reading, are the largest modifiable correlate of adult crystallised IQ.</p>
            <input class="log-input" type="number" name="pages_read" min="0" max="1000" step="1" inputmode="numeric" placeholder="0">
          </fieldset>

          <fieldset class="log-field">
            <legend class="log-legend">Journal</legend>
            <p class="log-help">One line. What's the day like? (Optional.)</p>
            <p class="log-cite">Pennebaker (1997), expressive-writing literature. Small but reliable effects on cognitive performance after stressful events.</p>
            <textarea class="log-textarea" name="journal" maxlength="500" placeholder="(Optional) One line about today."></textarea>
          </fieldset>

          <div class="log-actions">
            <button class="btn btn--primary" type="submit">Save today</button>
            <span class="log-status" data-log-status></span>
          </div>
        </form>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">02</span>
            <span>Last 30 days</span>
          </div>
          <h2 class="t-h2">Trajectory.</h2>
        </div>
        <div data-log-history>
          <p class="t-body log-loading">Loading…</p>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <div class="cta__inner">
          <span class="t-eyebrow">Why this page exists</span>
          <h2>The in-app training is real. The four levers are bigger.</h2>
          <p class="cta__body">
            The most-replicated finding in the cognitive training
            literature is the spacing effect — Cepeda et al. (2006)
            meta-analysis, d ≈ 0.85. The most-replicated modifiable
            correlate of adult cognition is aerobic exercise — Smith
            et al. (2010) meta-analysis, reliable improvement in
            executive function. The largest modifiable correlate of
            adult crystallised IQ is years of reading. The
            in-app modules are the fourth lever, and the most
            narrowly useful. This page exists because the lab
            would rather be honest about that ordering than
            overstate the in-app training.
          </p>
          <div class="cta__actions">
            <a class="btn btn--primary" href="/modules/divergent-association">Start an in-app module</a>
            <a class="btn btn--ghost" href="/library">Read the literature panel</a>
          </div>
        </div>
      </div>
    </section>
  `,

  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());

    const form = document.querySelector<HTMLFormElement>('[data-log-form]');
    const status = document.querySelector<HTMLElement>('[data-log-status]');
    const history = document.querySelector<HTMLElement>('[data-log-history]');
    const setStatus = (text: string) => { if (status) status.textContent = text; };

    async function refresh() {
      const [today, recent] = await Promise.all([loadTodayLog(), loadRecentLog(30)]);
      if (today.entry) fillForm(today.entry);
      if (history) history.innerHTML = renderHistory(recent.rows, recent.needsMigration);
    }

    function fillForm(entry: TrainingLogEntry) {
      if (!form) return;
      const slept = form.elements.namedItem('slept_well');
      if (slept instanceof RadioNodeList) {
        for (const r of slept) (r as HTMLInputElement).checked = (r as HTMLInputElement).value === (entry.sleptWell ? 'yes' : 'no');
      }
      const ex = form.elements.namedItem('exercised');
      if (ex instanceof RadioNodeList) {
        for (const r of ex) (r as HTMLInputElement).checked = (r as HTMLInputElement).value === (entry.exercised ? 'yes' : 'no');
      }
      const pages = form.elements.namedItem('pages_read');
      if (pages instanceof HTMLInputElement) pages.value = String(entry.pagesRead);
      const j = form.elements.namedItem('journal');
      if (j instanceof HTMLTextAreaElement) j.value = entry.journal;
    }

    function readForm(): Omit<TrainingLogEntry, 'logDate'> {
      if (!form) return { sleptWell: false, exercised: false, pagesRead: 0, journal: '' };
      const sleptVal = (form.querySelector<HTMLInputElement>('input[name="slept_well"]:checked')?.value) ?? '';
      const exVal = (form.querySelector<HTMLInputElement>('input[name="exercised"]:checked')?.value) ?? '';
      const pages = parseInt((form.elements.namedItem('pages_read') as HTMLInputElement | null)?.value ?? '0', 10);
      const journal = (form.elements.namedItem('journal') as HTMLTextAreaElement | null)?.value ?? '';
      return {
        sleptWell: sleptVal === 'yes',
        exercised: exVal === 'yes',
        pagesRead: Number.isFinite(pages) ? pages : 0,
        journal: journal.trim()
      };
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entry = readForm();
        setStatus('Saving…');
        const res = await upsertTodayLog(entry);
        if (res.ok) {
          setStatus('Saved. The lab will show this in your profile.');
          await refresh();
        } else if (res.needsMigration) {
          setStatus('Not saved — the training_log table does not exist. Run supabase/migrations/0006_training_log.sql in your Supabase SQL editor.');
        } else {
          setStatus('Save failed: ' + (res.error ?? 'unknown'));
        }
      });
    }

    await refresh();
    const offAuth = onAuthChange(() => { void refresh(); });
    cleanups.push(offAuth);

    return () => cleanups.forEach((c) => c());
  }
};

function renderHistory(rows: TrainingLogEntry[], needsMigration: boolean): string {
  if (needsMigration) {
    return `<div class="log-migration">
      <span class="t-eyebrow">Migration needed</span>
      <p class="t-body">The <code>training_log</code> table doesn't exist in your Supabase project. Run <code>supabase/migrations/0006_training_log.sql</code> in the SQL editor to enable the log.</p>
    </div>`;
  }
  if (rows.length === 0) {
    return `<p class="t-body">No entries yet. Save today to start the trajectory.</p>`;
  }
  // 30-day summary
  const sleptCount = rows.filter(r => r.sleptWell).length;
  const exercisedCount = rows.filter(r => r.exercised).length;
  const pagesTotal = rows.reduce((sum, r) => sum + r.pagesRead, 0);
  const pagesAvg = rows.length ? Math.round(pagesTotal / rows.length) : 0;
  const journalCount = rows.filter(r => r.journal.length > 0).length;

  const recent = rows.slice(0, 14);
  return `
    <div class="log-summary">
      <div class="log-summary__stat">
        <div class="log-summary__num">${sleptCount}/${rows.length}</div>
        <div class="log-summary__label">days with 7+ hrs sleep</div>
      </div>
      <div class="log-summary__stat">
        <div class="log-summary__num">${exercisedCount}/${rows.length}</div>
        <div class="log-summary__label">days with 20+ min aerobic exercise</div>
      </div>
      <div class="log-summary__stat">
        <div class="log-summary__num">${pagesTotal}</div>
        <div class="log-summary__label">pages read · ${pagesAvg}/day avg</div>
      </div>
      <div class="log-summary__stat">
        <div class="log-summary__num">${journalCount}</div>
        <div class="log-summary__label">journal entries</div>
      </div>
    </div>
    <table class="log-table">
      <thead>
        <tr><th>Date</th><th>Sleep</th><th>Exercise</th><th>Pages</th><th>Journal</th></tr>
      </thead>
      <tbody>
        ${recent.map(r => `<tr>
          <td>${r.logDate}</td>
          <td>${r.sleptWell ? '✓' : '—'}</td>
          <td>${r.exercised ? '✓' : '—'}</td>
          <td>${r.pagesRead > 0 ? r.pagesRead : '—'}</td>
          <td class="log-journal">${r.journal ? escapeHtml(r.journal) : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
