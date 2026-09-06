// Battery controller — drives a full transfer battery run. Handles
// the intro screen, the task sequence, the inter-task rest, and
// the results screen. Persists the run to Supabase on completion.

import { BATTERY_TASKS } from './tasks';
import type { TaskHandle, TaskScore } from './taskRunner';
import { BATTERY, compareToPublished, comparisonText, type Comparison, type AgeBand, type TaskBaseline } from '../lib/batteryDistributions';
import { loadInAppSummary, formatInAppScore, inAppModuleLabel, type InAppSummary } from '../lib/inAppHistory';

export type BatteryRun = {
  ageBand: AgeBand | null;
  startedAt: number;
  finishedAt: number;
  // Map of task id -> score
  scores: Record<string, TaskScore>;
  // Map of task id -> comparison result ('below' / 'within' / 'above')
  comparisons: Record<string, Comparison>;
};

export type BatteryControllerHandle = {
  // Mount the controller UI into the host. The returned function
  // tears it down.
  mount: (host: HTMLElement, ageBand: AgeBand | null, onComplete: (run: BatteryRun) => void) => () => void;
};

function renderInAppBlock(inApp: InAppSummary): string {
  const modules: ('dat' | 'rat' | 'cj' | 'nb' | 'stroop')[] = ['dat', 'rat', 'cj', 'nb', 'stroop'];
  const rows = modules.map(m => {
    const latest = inApp.latest[m];
    const count = inApp.counts[m] ?? 0;
    if (!latest) {
      return `<div class="battery-inapp__row battery-inapp__row--none">
        <span class="battery-inapp__name">${inAppModuleLabel(m)}</span>
        <span class="battery-inapp__latest">no ${m.toUpperCase()} sessions yet</span>
        <span class="battery-inapp__count">—</span>
      </div>`;
    }
    return `<div class="battery-inapp__row">
      <span class="battery-inapp__name">${inAppModuleLabel(m)}</span>
      <span class="battery-inapp__latest">${formatInAppScore(m, latest.score)}</span>
      <span class="battery-inapp__count">${count} run${count === 1 ? '' : 's'}</span>
    </div>`;
  }).join('');
  return `
    <div class="battery-inapp">
      <div class="battery-inapp__head">
        <span class="t-eyebrow">What you've trained</span>
        <span class="battery-inapp__hint">in-app module history, last 200 sessions</span>
      </div>
      <div class="battery-inapp__rows">${rows}</div>
    </div>`;
}

function renderResults(host: HTMLElement, run: BatteryRun, inApp: InAppSummary | null, onSave: () => void, onAgain: () => void) {
  host.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'battery-results';

  // Head
  const head = document.createElement('div');
  head.className = 'battery-results__head';
  head.innerHTML = `<div class="t-eyebrow">Your profile</div><h2 class="t-h2">Your cognitive profile, age band ${run.ageBand ?? '25-34'}.</h2><p class="t-body">Every score is compared to the <strong>published healthy-adult range</strong> from the cited studies — not to a fabricated age-stratified mean. The lab does not compute a composite IQ — each task stands on its own, and the comparison is honest: within, below, or above the published range. Where the literature doesn't stratify by age, we don't either.</p>`;
  wrap.appendChild(head);

  // The 4 task rows
  const list = document.createElement('div');
  list.className = 'battery-results__list';
  for (const baseline of BATTERY) {
    const score = run.scores[baseline.id];
    if (!score) continue;
    const cmp = compareToPublished(baseline, score.raw);
    const cmpText = comparisonText(baseline, score.raw, run.ageBand);
    const row = document.createElement('article');
    row.className = `battery-results__row battery-results__row--${cmp}`;
    // The bar shows the user's position within the published range,
    // extended beyond on either side. We do NOT claim a percentile.
    const range = baseline.published;
    // Visualize score relative to range: 0% = range min, 100% = range max.
    // If score is outside the range, the marker sits at the edge.
    const visualSpan = range.max - range.min;
    const visualMin = range.min - visualSpan * 0.3;
    const visualMax = range.max + visualSpan * 0.3;
    const visualRange = visualMax - visualMin;
    const fillPct = Math.max(0, Math.min(100, ((score.raw - visualMin) / visualRange) * 100));
    const withinPct = ((range.max - range.min) / visualRange) * 100;
    const withinOffsetPct = ((range.min - visualMin) / visualRange) * 100;
    const directionLabel = baseline.direction === 'lower_is_better' ? 'lower is better' : 'higher is better';
    row.innerHTML = `
      <div class="battery-results__row-head">
        <span class="battery-results__name">${baseline.name}</span>
        <span class="battery-results__construct">${baseline.construct}</span>
      </div>
      <div class="battery-results__row-body">
        <div class="battery-results__score">
          <div class="battery-results__raw">${score.raw}<span class="battery-results__unit">${range.unit}</span></div>
          <div class="battery-results__meta">${baseline.displayMeta}</div>
        </div>
        <div class="battery-results__compare">
          <div class="battery-results__cmp battery-results__cmp--${cmp}">${cmp === 'within' ? 'Within published range' : cmp === 'below' ? (baseline.direction === 'lower_is_better' ? 'Faster than published' : 'Below published range') : (baseline.direction === 'lower_is_better' ? 'Slower than published' : 'Better than published')}</div>
          <div class="battery-results__cmp-range">Published healthy-adult range: <strong>${range.min}–${range.max} ${range.unit}</strong></div>
          <div class="battery-results__bar" title="${directionLabel}">
            <div class="battery-results__bar-pub" style="left: ${withinOffsetPct.toFixed(1)}%; width: ${withinPct.toFixed(1)}%"></div>
            <div class="battery-results__bar-z" style="left: ${fillPct.toFixed(1)}%" title="You (${score.raw} ${range.unit})"></div>
          </div>
          <div class="battery-results__bar-labels">
            <span>${visualMin.toFixed(0)}</span>
            <span class="battery-results__bar-label-mean">published range</span>
            <span>${visualMax.toFixed(0)}</span>
          </div>
        </div>
      </div>
      <div class="battery-results__interp">${cmpText}</div>
      <div class="battery-results__cite">${range.citation}${range.ageNote.effect ? ' · ' + range.ageNote.effect + ' (' + range.ageNote.source + ')' : ''} · ${baseline.predictedTransfer}</div>`;
    list.appendChild(row);
  }
  wrap.appendChild(list);

  // In-app training summary, if we have any
  if (inApp && Object.keys(inApp.latest).length > 0) {
    const inAppBlock = document.createElement('div');
    inAppBlock.className = 'battery-results__inapp';
    inAppBlock.innerHTML = renderInAppBlock(inApp);
    wrap.appendChild(inAppBlock);
  }

  // Honest closing note
  const note = document.createElement('div');
  note.className = 'battery-results__note';
  note.innerHTML = `<p class="t-body"><strong>On transfer.</strong> ${BATTERY[0]?.predictedTransfer ?? ''} The lab will compare your next battery against this one and report the delta honestly — including the cases where the in-app modules improve but the transfer battery doesn't.</p>`;
  wrap.appendChild(note);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'battery-results__actions';
  const again = document.createElement('button');
  again.type = 'button';
  again.className = 'btn btn--ghost';
  again.textContent = 'Run again';
  again.addEventListener('click', onAgain);
  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'btn btn--primary';
  save.textContent = 'Save and view history';
  save.addEventListener('click', onSave);
  actions.appendChild(again);
  actions.appendChild(save);
  wrap.appendChild(actions);

  host.appendChild(wrap);
}

function renderIntro(host: HTMLElement, ageBand: AgeBand | null, onStart: () => void) {
  host.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'battery-intro';
  const head = document.createElement('div');
  head.className = 'battery-intro__head';
  head.innerHTML = `
    <div class="t-eyebrow">The transfer battery</div>
    <h2 class="t-h2">Four short tasks. ~5 minutes. Real research numbers.</h2>
    <p class="t-body">These four tasks are not in the lab. The point is to measure what the in-app training actually transfers to, not what the training tests. Your results are compared to the published mean for your age band (${ageBand ?? '25-34 by default'}) and saved across runs so you can see whether anything changes.</p>
    <ul class="battery-intro__list">
      <li><strong>Stroop</strong> — 16 trials. Press the key for the COLOR, not the word. Measures inhibitory control.</li>
      <li><strong>Inspection time</strong> — 16 trials. Identify the longer line after a brief flash. Measures processing speed.</li>
      <li><strong>Mental rotation</strong> — 12 trials. Is the second hand the same hand rotated, or a mirror? Measures visual-spatial processing.</li>
      <li><strong>Reading span</strong> — 3 sets of 3 sentences. Judge each T/F, then recall 3 letters in order. Measures working memory capacity.</li>
    </ul>
    <p class="battery-intro__caveat t-body">The lab does not compute a composite IQ. Each score is shown next to the published mean and the published SD for your age band, drawn from the cited studies.</p>`;
  wrap.appendChild(head);
  const actions = document.createElement('div');
  actions.className = 'battery-intro__actions';
  const start = document.createElement('button');
  start.type = 'button';
  start.className = 'btn btn--primary';
  start.textContent = 'Start the battery';
  start.addEventListener('click', onStart);
  actions.appendChild(start);
  wrap.appendChild(actions);
  host.appendChild(wrap);
}

function renderRest(host: HTMLElement, next: TaskHandle, baseline: TaskBaseline, onContinue: () => void) {
  host.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'battery-rest';
  wrap.innerHTML = `
    <div class="t-eyebrow">Next up · Task ${BATTERY_TASKS.findIndex(t => t.id === next.id) + 1} of ${BATTERY_TASKS.length}</div>
    <h3 class="t-h3">${next.name}</h3>
    <p class="t-body">${baseline.construct}. ${next.totalTrials} trials. Take a breath. There is no score for this rest, and no streak to keep. Press the button when you're ready.</p>`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary';
  btn.textContent = `Begin ${next.name}`;
  btn.addEventListener('click', onContinue);
  wrap.appendChild(btn);
  host.appendChild(wrap);
}

export const batteryController: BatteryControllerHandle = {
  mount(host, ageBand, onComplete) {
    let taskIdx = 0;
    const scores: Record<string, TaskScore> = {};
    const startedAt = Date.now();
    const taskHost = document.createElement('div');
    taskHost.className = 'battery-controller__task';
    host.appendChild(taskHost);
    let activeTeardown: (() => void) | null = null;
    let inAppCache: InAppSummary | null = null;

    function loadInAppBg() {
      void loadInAppSummary().then(s => { inAppCache = s; });
    }

    function runNext() {
      if (activeTeardown) { activeTeardown(); activeTeardown = null; }
      if (taskIdx >= BATTERY_TASKS.length) {
        const finishedAt = Date.now();
        const comparisons: Record<string, Comparison> = {};
        for (const t of BATTERY_TASKS) {
          const s = scores[t.id];
          const baseline = BATTERY.find(b => b.id === t.id)!;
          if (s) {
            comparisons[t.id] = compareToPublished(baseline, s.raw);
          }
        }
        const run: BatteryRun = { ageBand, startedAt, finishedAt, scores, comparisons };
        // Pull a fresh in-app summary for the comparison block
        void loadInAppSummary(true).then((s) => {
          inAppCache = s;
          renderResults(taskHost, run, inAppCache, () => onComplete(run), () => {
            taskIdx = 0;
            for (const k of Object.keys(scores)) delete scores[k];
            taskHost.innerHTML = '';
            renderIntro(taskHost, ageBand, () => runNext());
          });
        });
        return;
      }
      const t = BATTERY_TASKS[taskIdx];
      taskHost.innerHTML = '';
      const taskMount = document.createElement('div');
      taskMount.className = 'battery-controller__mount';
      taskHost.appendChild(taskMount);
      activeTeardown = t.mount(taskMount, (s) => {
        scores[t.id] = s;
        taskIdx++;
        if (taskIdx < BATTERY_TASKS.length) {
          renderRest(taskHost, BATTERY_TASKS[taskIdx], BATTERY.find(b => b.id === BATTERY_TASKS[taskIdx].id)!, () => runNext());
        } else {
          runNext();
        }
      }, () => {
        // Aborted: re-render intro
        if (activeTeardown) { activeTeardown(); activeTeardown = null; }
        taskHost.innerHTML = '';
        renderIntro(taskHost, ageBand, () => runNext());
      });
    }

    // Background load of in-app summary
    loadInAppBg();

    // Start with the intro screen
    renderIntro(taskHost, ageBand, () => runNext());

    return () => {
      if (activeTeardown) activeTeardown();
      taskHost.innerHTML = '';
    };
  }
};
