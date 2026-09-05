// /method — the 6 rules + spaced-repetition + research panel.

import type { PageModule } from './types';
import { pageIntro } from '../motion';

export const methodPage: PageModule = {
  html: /* html */ `
    <section class="page-lead">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <span>The method</span>
        </div>
        <h1 class="t-h1">Practice. Honest feedback. Adaptive difficulty. Self-validating measurement.</h1>
        <p class="t-lead">
          The Wideweave loop is the same for every module. You generate,
          the engine scores, your skill graph updates, and the difficulty
          moves to the edge of your capacity. On demand, you can take a
          structurally unrelated transfer battery that checks whether any
          of it actually generalises. We tell you when it doesn't.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">01</span>
            <span>The loop</span>
          </div>
          <h2 class="t-h2">Four moves, repeated. The single loop.</h2>
        </div>

        <ol class="loop">
          <li class="loop__step">
            <span class="loop__ix">1</span>
            <div>
              <h3 class="t-h4">Generate</h3>
              <p>Every module starts with generation. No hints, no multiple-choice, no autocomplete, no language model behind the scenes. The hard part is the production — not the recognition.</p>
              <span class="loop__cite">Wideweave design rule #1</span>
            </div>
          </li>
          <li class="loop__step">
            <span class="loop__ix">2</span>
            <div>
              <h3 class="t-h4">Score against a real model</h3>
              <p>DAT is scored by an embedding model. CJ is scored by graph shortest-path. RAT is scored by exact string match against curated solutions. N-back is scored by adaptive hit rate. No "AI-judged" proxies.</p>
              <span class="loop__cite">Wideweave design rule #2</span>
            </div>
          </li>
          <li class="loop__step">
            <span class="loop__ix">3</span>
            <div>
              <h3 class="t-h4">Update the skill graph</h3>
              <p>Each attempt appends to a per-module time series: score, time, difficulty, and confidence interval. The graph is the source of truth — not a leaderboard, not a single number.</p>
              <span class="loop__cite">Wideweave design rule #3</span>
            </div>
          </li>
          <li class="loop__step">
            <span class="loop__ix">4</span>
            <div>
              <h3 class="t-h4">Adapt to the edge</h3>
              <p>Difficulty rises when you're accurate and falls when you miss. The target is the zone of proximal development — hard but doable. There is no "easy mode" as a destination, only as a starting point.</p>
              <span class="loop__cite">Wideweave design rule #4</span>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">02</span>
            <span>Spaced repetition</span>
          </div>
          <h2 class="t-h2">Retrieval strength compounds. Decay doesn't get a vote.</h2>
          <p class="t-lead">
            The schedule is built on a per-item half-life, with a boost
            on correct recall and a halve on a miss. The point is not
            to see the same items more often — it is to never let the
            retrievable set shrink. A skill you used to be able to use
            and can no longer use is, by definition, decay.
          </p>
        </div>

        <div class="method__panel">
          <div class="method__panel-row">
            <span class="method__label">Schedule</span>
            <div>
              <strong>Half-life boost/halve</strong> — a simplified Anki-style model. Each item has a half-life in days (default 4 for new items). An item is "due" when its half-life has elapsed since the last recall.
            </div>
          </div>
          <div class="method__panel-row">
            <span class="method__label">Recall target</span>
            <div>
              <strong>Items return at the half-life.</strong> This is not full Ebisu and it doesn't claim to track Bayesian posterior over recall probability. A real Ebisu integration would compute the (α, β) posterior from each review and pick the next due time so the predicted probability of recall sits around 85%. The current engine picks the half-life directly — simpler, but it tracks the right variable: how long until you forget.
            </div>
          </div>
          <div class="method__panel-row">
            <span class="method__label">Failure handling</span>
            <div>
              A correct recall multiplies the half-life by 1.7 (the item comes back later). A missed recall halves it (the item comes back sooner). There is no "I forgot" badge, no streak break, no penalty — just a tighter schedule.
            </div>
          </div>
          <div class="method__panel-row">
            <span class="method__label">Scope</span>
            <div>
              Spaced recall is built for the two modules that have items to recall: <a href="/modules/remote-associates">Remote Associates</a> (puzzle → answer) and <a href="/modules/concept-jump">Concept Jump</a> (start → optimal path). DAT, Dual n-back, and Stroop are training tasks with no per-item recall surface — they track session-level scores, not per-item half-lives. The queue lives at <a href="/drill">/drill</a>.
            </div>
          </div>
          <div class="method__panel-row">
            <span class="method__label">Why not streaks?</span>
            <div>
              Streaks optimise for engagement, not retrieval. The schedule optimises for what you can still do a month from now.
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
            <span class="ix">03</span>
            <span>Adaptive difficulty</span>
          </div>
          <h2 class="t-h2">Quiet, and sitting on a rolling window.</h2>
        </div>

        <div class="method__rules">
          <div class="method__rule">
            <span class="method__rule-ix">A</span>
            <h3>Rolling window</h3>
            <p>Difficulty is computed on the last 20 trials, not the last 3 and not the all-time average. That's the difference between "I just missed one" and "I genuinely can't do this level right now".</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">B</span>
            <h3>Two-threshold step</h3>
            <p>n rises one step on >80% hit rate and falls one step on <50%. Between 50–80%, the level holds. The middle band is wide on purpose.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">C</span>
            <h3>Bounds</h3>
            <p>Every module has explicit min/max bounds. Dual n-back is 2–7. CJ path length is 2–12. DAT is open. The cap is honest about what the task is.</p>
          </div>
          <div class="method__rule">
            <span class="method__rule-ix">D</span>
            <h3>No punishment</h3>
            <p>A fall in difficulty is not a failure to log. The schedule does not show difficulty level to you. The point of difficulty is to keep you in the zone, not to give you a number to chase.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <div class="cta__inner">
          <span class="t-eyebrow">Try the loop</span>
          <h2>One module. 12 minutes. The whole loop, end to end.</h2>
          <div class="cta__actions">
            <a class="btn btn--primary" href="/modules/divergent-association">Start a 12-minute session</a>
            <a class="btn btn--ghost" href="/transfer">See the transfer battery</a>
          </div>
        </div>
      </div>
    </section>
  `,
  init: async () => pageIntro
};
