// /modules/concept-jump — Concept Jump (Wiki Game) detail page.

import type { PageModule } from './types';
import { pageIntro } from '../motion';
import { initCJ, disposeCJ } from '../demos/cj';
import { mountHistoryPanel } from '../lib/historyPanel';

export const cjPage: PageModule = {
  html: /* html */ `
    <section class="page-lead module-detail">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <a href="/#modules">Modules</a>
          <span aria-hidden="true">·</span>
          <span>Concept Jump</span>
        </div>
        <h1 class="t-h1">From start to target, across a real knowledge graph.</h1>
        <p class="t-lead">
          Concept Jump is the Wiki Game with the rules made honest. A
          fixed graph, a fixed start, a fixed target, and your path is
          scored against the shortest route the graph actually admits.
          You can only cheat yourself.
        </p>
        <div class="page-lead__meta page-lead__chips">
          <span class="pill pill--mixed"><span class="dot"></span>Promising</span>
          <span class="meta-line">5–8 minutes · 1 puzzle</span>
          <span class="meta-line">Efficiency: 0.78 (avg)</span>
          <span class="meta-line">You: 0.62 · last 7d</span>
        </div>
      </div>
    </section>

    <section class="section module-detail__surface">
      <div class="container">
        <div class="module module--detail module--cj" id="cj-demo">
          <div class="module__head">
            <span class="module__num">M·03 · live</span>
            <span class="pill pill--mixed"><span class="dot"></span>Promising</span>
          </div>
          <h2 class="module__title">Live demo · Concept Jump</h2>
          <p class="module__desc">
            Click a neighbour chip or type a concept that's adjacent to
            the current one. The path is locked once you commit. Reach
            the target in the fewest hops you can.
          </p>
          <div class="module__body">
            <div class="module__demo module__demo--large">
              <div class="demo-cj" id="cj">
                <div class="demo-cj__row">
                  <div class="demo-cj__prompt" id="cj-prompt">Loading…</div>
                  <div class="demo-cj__stats">
                    <span>Path · <strong id="cj-path-len">0</strong></span>
                    <span>Shortest · <strong id="cj-shortest">—</strong></span>
                    <span>Efficiency · <strong id="cj-eff">—</strong></span>
                  </div>
                </div>
                <div class="demo-cj__path" id="cj-path" aria-label="Your path"></div>
                <input class="demo-cj__input" id="cj-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type a neighbour, or click a chip" maxlength="40" />
                <div class="demo-cj__chips" id="cj-chips" aria-label="Neighbours"></div>
                <div class="demo-cj__legend">
                  Type to search the graph · Tab picks the top chip · Enter commits
                </div>
                <div class="demo-cj__efficiency">
                  <span>Efficiency</span>
                  <div class="bar"><i id="cj-eff-bar" style="width: 0%"></i></div>
                  <span id="cj-eff-text">—</span>
                </div>
              </div>
            </div>
            <div class="module__research" id="cj-research">
              <div class="module__research-head">
                <span class="t-eyebrow">Why this is measured</span>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div><strong>Wiki-Game lineage</strong> — semantic search as a practiced skill, not as a reflex.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>Search-engine users score ~0.6 efficiency; trained participants reach ~0.85 with practice.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--mixed">Mixed</span>
                <div>Concept jump correlates with self-reported research ability, but the construct is broader than "search" (mixed).</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Transfer to actual research workflows (literature review, debugging) is plausible but unmeasured (speculative).</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Whether LLM-assisted paths would generalise is currently unmeasured; it is the next open question for the lab.</div>
              </div>
              <div class="module__research-item">
                <span class="p pill--speculative">Speculative</span>
                <div>Long-term effects of deliberate path-finding on mental search habits (speculative).</div>
              </div>
            </div>
            <div class="module__history" id="cj-history"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section how">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">A</span>
            <span>How it's measured</span>
          </div>
          <h2 class="t-h2">Honest scoring, by construction.</h2>
        </div>
        <div class="how__steps">
          <div class="how__step">
            <span class="how__ix">1</span>
            <h3>Pick a target</h3>
            <p>You see a start concept and a target concept. They are pulled from a hand-built graph of ~120 concepts and ~700 edges.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">2</span>
            <h3>Find the path</h3>
            <p>Each step must be a real edge in the graph. You can click neighbour chips or type a concept that is adjacent to your current node.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">3</span>
            <h3>Score</h3>
            <p>Efficiency = shortest path length / your path length. 1.0 means you found the optimal route. Anything above 0.7 is solid.</p>
          </div>
          <div class="how__step">
            <span class="how__ix">4</span>
            <h3>Track</h3>
            <p>Stored in the Concept Jump skill graph. We track both efficiency and time-to-completion, because both move with practice.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section module-next">
      <div class="container">
        <div class="module-next__inner">
          <div>
            <span class="t-eyebrow">Spaced recall</span>
            <h3 class="t-h3">Each route is an item.</h3>
            <p>Every (start, target) pair you see is recorded as an item in your spaced-recall bank. Routes come back in <a href="/drill">/drill</a> when their half-life elapses. Reaching the target in optimal steps is a correct recall; a longer path or a fail is a missed recall. Take this module a few times and your bank fills up.</p>
          </div>
          <a class="btn btn--primary" href="/drill">Open the drill →</a>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());
    initCJ();
    cleanups.push(disposeCJ);
    const host = document.getElementById('cj-history');
    if (host) {
      const disposeHist = mountHistoryPanel(host, 'cj');
      cleanups.push(disposeHist);
    }
    return () => cleanups.forEach((c) => c());
  }
};
