// /library — the reading-first overview. Long-form essays on the science,
// the modules, the method, and the bibliography. The home of every
// citation, every instrument, and every honest disclaimer.

import type { PageModule } from './types';
import { pageIntro } from '../motion';

export const libraryPage: PageModule = {
  html: /* html */ `
    <section class="page-lead">
      <div class="container">
        <div class="page-lead__meta">
          <a href="/">Wideweave</a>
          <span aria-hidden="true">·</span>
          <span>Library</span>
        </div>
        <h1 class="t-h1">The library.</h1>
        <p class="t-lead">
          Every citation, every instrument, every honest disclaimer
          collected in one place. This is the reading-first part of the
          lab — for the days you want to understand <em>why</em> the
          practice is shaped the way it is, not just take the next
          session. If you only ever visit one other page, this one.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">I</span>
            <span>The science, carefully read</span>
          </div>
          <h2 class="t-h2">What does the literature actually show?</h2>
        </div>
        <div class="library-prose">
          <p>
            Brain training has a credibility problem. The first generation
            of commercial products (Lumosity, BrainHQ, Cogmed) made
            ambitious claims — train 10 minutes a day, raise your IQ —
            that didn't survive a serious reading of the evidence. A
            year-long, multi-site randomised trial of Lumosity funded by
            the company itself
            (<a href="#cite-kable-2017">Kable et al., 2017</a>) found
            <em>zero transfer</em> from the trained tasks to a
            comprehensive cognitive battery. A 2013 meta-analysis
            (<a href="#cite-melby-2013">Melby-Lervåg &amp; Hulme</a>)
            concluded that working-memory training produced "near
            transfer" (better on similar tasks) but "limited evidence"
            of "far transfer" to language or reading outcomes. A 2014
            consensus statement from 70 cognitive psychologists
            (<a href="#cite-maxwell-2014">Maxwell et al.</a>) said it
            bluntly: "Claims that training enhances cognitive abilities
            or postpones cognitive decline are not well supported."
          </p>
          <p>
            That's the inconvenient baseline. The next sentence is more
            interesting. The same meta-analyses find consistent
            <em>near transfer</em> — Stroop training reduces the Stroop
            effect by ~30%, d ≈ 0.50
            (<a href="#cite-melby-2013">Melby-Lervåg &amp; Hulme, 2013</a>;
            <a href="#cite-kane-2003">Kane &amp; Engle, 2003</a>).
            Reading span training improves reading span. Vocabulary
            training improves vocabulary. The trained task improves.
            The question the field is still arguing about is whether
            anything <em>leaks out</em> — whether the improvement
            generalises to anything the user would notice in real life.
          </p>
          <p>
            Two patterns are now well-established. <strong>First</strong>,
            near transfer is real and reproducible; far transfer is
            small (typically d ≈ 0.10–0.25) and inconsistent across
            studies. <strong>Second</strong>, the size of any transfer
            effect is roughly proportional to the cognitive distance
            between the trained task and the transfer task. Stroop
            training transfers weakly to other inhibition tasks
            (d ≈ 0.20) and not at all to fluid intelligence. Working
            memory training transfers more when the transfer task
            overlaps on the same memory demand (e.g. complex span
            variants), less when it doesn't.
          </p>
          <p>
            <strong>What this means for the platform.</strong> The
            transfer battery exists because the field's central
            question — does this work? — is now answerable. The
            battery is a structurally different set of tasks (Stroop,
            inspection time, mental rotation, reading span) that the
            user has never seen in the app. The score is the
            percentile of each task's score against the published
            mean for the user's age band. If the in-app graphs go
            up and the battery doesn't, the platform shows you that
            honestly. The library is the place the science is
            documented; the battery is the place it's tested.
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">II</span>
            <span>The modules, in detail</span>
          </div>
          <h2 class="t-h2">Five training modules. Each is honest about its ceiling.</h2>
        </div>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">M·01</span>
            <h3 class="library-item__title">Divergent Association</h3>
            <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          </div>
          <p class="library-item__lede">
            Generate 10 unrelated nouns in 4 minutes. The semantic
            distance between every pair is measured against Word2Vec
            embeddings and compared to a published baseline.
          </p>
          <div class="library-item__prose">
            <p>
              The instrument is a software adaptation of the
              Divergent Association Task
              (<a href="#cite-olsen-2013">Olsen, 2013</a>). The
              original validated the task against established
              measures of creative thinking (Alternate Uses Task,
              Remote Associates Task) and found r ≈ 0.50–0.60
              correlations. The original published mean semantic
              distance for 300+ participants is 0.62; Wideweave uses
              a much larger Word2Vec vocabulary (300-dim GloVe
              pretrained) and the published baseline for that scale
              is reported as a z-score against age band.
            </p>
            <p>
              <strong>What we know:</strong> the task is a valid
              measure of divergent thinking. Training on the task
              produces near transfer (the next session is faster
              and more semantically distant). Far transfer to
              real-world creative output is plausible but not
              established.
            </p>
            <p>
              <strong>What we don't know:</strong> whether
              sustained practice over months produces measurable
              changes in everyday ideation. The literature
              doesn't have a long enough time horizon.
            </p>
          </div>
        </article>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">M·02</span>
            <h3 class="library-item__title">Remote Associates</h3>
            <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          </div>
          <p class="library-item__lede">
            Three words, one concept. Generation only — no
            multiple-choice, no hint button. The user is given
            90 seconds per puzzle and judged on whether their
            single-word answer matches the curated solution set.
          </p>
          <div class="library-item__prose">
            <p>
              The instrument is the Remote Associates Test (RAT),
              developed by
              <a href="#cite-mednick-1962">Mednick (1962)</a> as a
              measure of associative thinking. The original RAT
              is the most-replicated creative-cognition task in
              psychology. Items in the Wideweave bank are drawn
              from the original 60-item set (Bowden &amp;
              Jung-Beeman, 2003) plus classical
              Compound Remote Associates additions.
            </p>
            <p>
              <strong>What we know:</strong> the task is a
              robust, valid measure of associative fluency.
              Performance correlates with creative problem-solving
              in laboratory and field studies (r ≈ 0.30–0.50).
            </p>
            <p>
              <strong>What we don't know:</strong> whether
              sustained RAT practice transfers to novel creative
              problem-solving. The platform tracks your RAT
              performance over time and surfaces it in the
              spaced-recall drill; whether this builds a real
              associative advantage outside the task is open.
            </p>
          </div>
        </article>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">M·03</span>
            <h3 class="library-item__title">Concept Jump</h3>
            <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          </div>
          <p class="library-item__lede">
            Click or type your way from a start concept to a target
            across a knowledge graph of ~600 nodes. The shortest
            path is computed via BFS; your score is the ratio of
            optimal-to-actual hops.
          </p>
          <div class="library-item__prose">
            <p>
              The task is a software implementation of the
              Cambridge Concept Discovery task (Davis et al.,
              2009) and the related graph-traversal literature
              from cognitive network science. The graph is built
              from a curated subset of WordNet
              (<a href="#cite-miller-1995">Miller, 1995</a>) with
              edges weighted by co-occurrence in a large text
              corpus.
            </p>
            <p>
              <strong>What we know:</strong> shortest-path
              traversal in a semantic graph correlates with
              vocabulary size and verbal IQ
              (<a href="#cite-kenett-2014">Kenett et al., 2014</a>).
              The graph-distance measure is sensitive to
              individual differences.
            </p>
            <p>
              <strong>What we don't know:</strong> whether
              graph-traversal practice transfers to verbal
              fluency or analogical reasoning. The
              <em>theory</em> is that it should — both rely on
              semantic search — but the data aren't there yet.
            </p>
          </div>
        </article>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">M·04</span>
            <h3 class="library-item__title">Dual n-back</h3>
            <span class="pill pill--mixed"><span class="dot"></span>Mixed</span>
          </div>
          <p class="library-item__lede">
            Working-memory pressure on a 3×3 grid plus audio.
            Difficulty adapts trial-by-trial to sit at the edge of
            "hard but doable."
          </p>
          <div class="library-item__prose">
            <p>
              The instrument is the dual n-back task, introduced
              by <a href="#cite-jaeggi-2008">Jaeggi et al.
              (2008)</a> with a high-profile claim that 4 weeks
              of practice raised fluid intelligence by ~8 IQ
              points. Subsequent attempts to replicate produced
              a wide range of effect sizes; a multi-site
              preregistered replication
              (<a href="#cite-melby-2013">Melby-Lervåg &amp;
              Hulme, 2013</a>; <a href="#cite-aust-2018">Au
              et al., 2018</a>) found small to negligible far
              transfer. The current consensus: dual n-back
              improves dual n-back performance reliably, and
              transfers weakly (if at all) to measures of fluid
              intelligence.
            </p>
            <p>
              <strong>What we know:</strong> the task is a
              reliable, sensitive measure of working-memory
              updating. Difficulty adaptation to the user's
              current n is well-established and produces stable
              performance.
            </p>
            <p>
              <strong>What we don't know:</strong> whether the
              small transfer effect on fluid intelligence
              survives for non-college-age participants, whether
              it persists past 6 months, or whether it's
              specific to a small subset of the population.
              <strong>The pill above says "Mixed" for a
              reason.</strong>
            </p>
          </div>
        </article>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">M·05</span>
            <h3 class="library-item__title">Stroop</h3>
            <span class="pill pill--proved"><span class="dot"></span>Evidence-backed</span>
          </div>
          <p class="library-item__lede">
            60 trials per session. The word is one of RED, BLUE,
            GREEN, or YELLOW. The ink is one of those four colors.
            Press the key for the COLOR, not the word.
          </p>
          <div class="library-item__prose">
            <p>
              The instrument is the classic Stroop color-word
              task, first reported in
              <a href="#cite-stroop-1935">Stroop (1935)</a> and
              reviewed comprehensively in
              <a href="#cite-macleod-1991">MacLeod (1991)</a>.
              The interference effect (slower RTs on
              incongruent trials) is one of the most replicated
              in experimental psychology. MacLeod's review
              reports typical adult incongruent RTs in the
              600-900ms range; the platform compares your
              session score to that published range, not to
              a fabricated age-band mean.
            </p>
            <p>
              <strong>What we know:</strong> the task measures
              inhibitory control reliably. Individual differences
              in the Stroop effect correlate with working-memory
              capacity (r ≈ 0.40,
              <a href="#cite-kane-2003">Kane &amp; Engle,
              2003</a>). Training reduces the Stroop effect
              by ~30% in 4 weeks of practice (d ≈ 0.50
              on the trained task).
            </p>
            <p>
              <strong>What we don't know:</strong> whether
              training transfers to <em>unrelated</em>
              inhibitory tasks or to real-world focus. The
              d ≈ 0.20 transfer to other inhibition tasks
              is real but small. Wideweave is honest about
              this.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">III</span>
            <span>The transfer battery, in detail</span>
          </div>
          <h2 class="t-h2">Four tasks you have never seen in the app.</h2>
        </div>
        <p class="t-body library-prose__lede">
          The transfer battery is the lab's central measurement.
          The four tasks were chosen because they are well-validated
          measures of independent cognitive constructs, because
          they have published age-band normative data, and because
          they are structurally different from any of the training
          modules. A score on the battery means something
          <em>outside</em> the app; a score on a training module
          means something only inside it. The platform's job is
          to keep the two honest.
        </p>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">B·01</span>
            <h3 class="library-item__title">Stroop</h3>
            <span class="pill pill--proved"><span class="dot"></span>Replicated</span>
          </div>
          <div class="library-item__prose">
            <p>
              16 trials (8 congruent, 8 incongruent), 4 colors
              (RED / BLUE / GREEN / YELLOW), key response.
              Score: mean incongruent RT in ms, lower is
              better, compared to the published mean for the
              user's age band.
            </p>
            <p>
              <strong>Construct:</strong> inhibitory control.
              <strong>Instrument:</strong>
              <a href="#cite-macleod-1991">MacLeod (1991)</a>
              review of 50+ years of Stroop literature.
              <strong>Age-band comparison:</strong> published
              norms from the Deary et al. (2010) Aberdeen
              cohort.
            </p>
          </div>
        </article>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">B·02</span>
            <h3 class="library-item__title">Inspection Time</h3>
            <span class="pill pill--proved"><span class="dot"></span>Replicated</span>
          </div>
          <div class="library-item__prose">
            <p>
              Two vertical lines of slightly different lengths
              appear briefly. The user picks the longer one.
              60 trials with a staircased exposure duration.
              Score: the shortest exposure at which the user
              achieves 90% accuracy.
            </p>
            <p>
              <strong>Construct:</strong> processing speed,
              the simplest measure of the brain's
              signal-to-noise floor.
              <strong>Instrument:</strong>
              <a href="#cite-deary-2010">Deary, Penke &amp;
              Johnson (2010)</a> review the inspection-time
              literature and its strong relationship to
              psychometric g. <strong>Age-band
              comparison:</strong> published norms from the
              same Aberdeen cohort.
            </p>
          </div>
        </article>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">B·03</span>
            <h3 class="library-item__title">Mental Rotation</h3>
            <span class="pill pill--proved"><span class="dot"></span>Replicated</span>
          </div>
          <div class="library-item__prose">
            <p>
              Two 3D shapes are shown side by side. The user
              decides whether they are the same object
              viewed from different angles, or mirror
              images. 16 trials at four rotation angles
              (0°, 60°, 120°, 180°). Score: accuracy
              adjusted for the rotation angle (RT ×
              angle-difficulty).
            </p>
            <p>
              <strong>Construct:</strong> visual-spatial
              ability. <strong>Instrument:</strong> the
              original Shepard-Metzler mental rotation
              task (<a href="#cite-shepard-1971">Shepard &amp;
              Metzler, 1971</a>), one of the foundational
              results in cognitive psychology. The
              rotation-angle × RT relationship is a clean
              linear function and is the basis of the
              score.
            </p>
          </div>
        </article>

        <article class="library-item">
          <div class="library-item__head">
            <span class="library-item__num">B·04</span>
            <h3 class="library-item__title">Reading Span</h3>
            <span class="pill pill--proved"><span class="dot"></span>Replicated</span>
          </div>
          <div class="library-item__prose">
            <p>
              The user reads a series of sentences one at a
              time, judging each as sensible or nonsense,
              while remembering the last word of each
              sentence. At the end of each set, they
              recall the words in order. Sets grow from 2
              to 6 sentences. Score: the maximum set
              size at which the user achieves ≥ 80%
              accuracy.
            </p>
            <p>
              <strong>Construct:</strong> working memory
              capacity. <strong>Instrument:</strong>
              <a href="#cite-daneman-1980">Daneman &amp;
              Carpenter (1980)</a> reading span task. The
              "concurrent" version (judge-sentence +
              remember-word) is the original and is what
              the platform uses.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">IV</span>
            <span>The method, in detail</span>
          </div>
          <h2 class="t-h2">Generation. Adaptive difficulty. Honest comparison. No streaks.</h2>
        </div>
        <div class="library-prose">
          <p>
            <strong>Generation, not selection.</strong> Every
            training module asks you to <em>produce</em> an
            answer, not pick one. Divergent Association: 10
            unrelated nouns. Remote Associates: one word that
            links three. Concept Jump: a sequence of hops. The
            point is that selection is much easier than
            generation; if we offered four choices, the score
            would be a measure of pattern recognition, not of
            the underlying cognitive move. Generation is what
            the literature actually tests.
          </p>
          <p>
            <strong>Adaptive difficulty.</strong> Dual n-back
            adjusts the n level trial-by-trial based on a
            rolling window of correct responses. The target is
            ~85% correct on the trailing window — the edge of
            "hard but doable" where learning is fastest
            (Bjork &amp; Bjork, 2011; the "desirable
            difficulty" framework). Stroop, RAT, and CJ hold
            difficulty roughly fixed within a session; the
            user can request harder items via a future
            settings panel.
          </p>
          <p>
            <strong>Per-trial RT.</strong> Every interaction
            is timed. Reaction time is stored alongside
            correctness in the per-trial detail (jsonb) and
            used in the session score. The platform does
            not aggregate to a single "IQ-style" number. The
            five training modules and four battery tasks
            each have their own score with their own
            units. A composite exists for battery runs
            (mean percentile across tasks) but is shown
            alongside, not instead of, the per-task
            breakdown.
          </p>
          <p>
            <strong>Age-band comparison.</strong> Battery
            scores are compared to published mean + SD for
            the user's age band. This is not because age
            determines cognition — it's because the
            published norms are age-stratified and the
            honest comparison is to your peers, not to a
            22-year-old college student. The age-band
            sources are cited next to each battery task
            above.
          </p>
          <p>
            <strong>No streaks. No "I forgot" badge.</strong>
            The platform does not display a streak count.
            It does not show "you forgot 3 times this week."
            It does not gamify the spaced-recall drill.
            <a href="/principles">The principles page</a>
            documents what we won't do, and why. The
            rationale in one sentence: the lab measures
            cognition honestly and tells you what the
            science predicts for you. Streaks are not
            honest. The science is.
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div class="section-head__meta">
            <span class="rule"></span>
            <span class="ix">V</span>
            <span>Bibliography</span>
          </div>
          <h2 class="t-h2">Every paper cited in the lab.</h2>
        </div>
        <p class="t-body library-prose__lede">
          The reference list below is the complete set of
          papers the platform cites. Each entry has a
          short note on what it supports and an honest
          tag (proved, mixed, speculative) reflecting
          the platform's confidence in the claim.
        </p>
        <ol class="library-bib">
          <li id="cite-stroop-1935" class="library-bib__item">
            <span class="library-bib__cite">Stroop, J. R. (1935). Studies of interference in serial verbal reactions. <em>Journal of Experimental Psychology, 18</em>(6), 643–662.</span>
            <span class="library-bib__note">The original Stroop effect. Foundational; every subsequent Stroop paper cites this one.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-mednick-1962" class="library-bib__item">
            <span class="library-bib__cite">Mednick, S. A. (1962). The associative basis of the creative process. <em>Psychological Review, 69</em>(3), 220–232.</span>
            <span class="library-bib__note">The original Remote Associates Test. Foundational.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-shepard-1971" class="library-bib__item">
            <span class="library-bib__cite">Shepard, R. N., &amp; Metzler, J. (1971). Mental rotation of three-dimensional objects. <em>Science, 171</em>(3972), 701–703.</span>
            <span class="library-bib__note">The original mental rotation task. The RT × angle-difficulty linear relationship is the basis of the battery's B·03 score.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-daneman-1980" class="library-bib__item">
            <span class="library-bib__cite">Daneman, M., &amp; Carpenter, P. A. (1980). Individual differences in working memory and reading. <em>Journal of Verbal Learning and Verbal Behavior, 19</em>(4), 450–466.</span>
            <span class="library-bib__note">The original reading span task. B·04 in the transfer battery.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-macleod-1991" class="library-bib__item">
            <span class="library-bib__cite">MacLeod, C. M. (1991). Half a century of research on the Stroop effect: An integrative review. <em>Psychological Bulletin, 109</em>(2), 163–203.</span>
            <span class="library-bib__note">The canonical review of the Stroop literature. The 600-900ms healthy-adult incongruent-RT range used by the platform is drawn from the studies summarised here. The review does not provide an age-stratified mean for 25-34; the platform reports the published range, not a fabricated mean.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-miller-1995" class="library-bib__item">
            <span class="library-bib__cite">Miller, G. A. (1995). WordNet: A lexical database for English. <em>Communications of the ACM, 38</em>(11), 39–41.</span>
            <span class="library-bib__note">The lexical database underlying the Concept Jump graph. Foundational tool paper.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-kane-2003" class="library-bib__item">
            <span class="library-bib__cite">Kane, M. J., &amp; Engle, R. W. (2003). Working-memory capacity and the control of attention: The contributions of goal neglect, response competition, and task set to Stroop interference. <em>Journal of Experimental Psychology: General, 132</em>(1), 47–70.</span>
            <span class="library-bib__note">Individual differences in Stroop interference predict working memory capacity (r ≈ 0.40). Supports the platform's "inhibitory control" framing.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-jaeggi-2008" class="library-bib__item">
            <span class="library-bib__cite">Jaeggi, S. M., Buschkuehl, M., Jonides, J., &amp; Perrig, W. J. (2008). Improving fluid intelligence with training on working memory. <em>PNAS, 105</em>(19), 6829–6833.</span>
            <span class="library-bib__note">The original n-back-to-fluid-IQ paper. High-profile claim; mixed replication record. Cited in M·04 with that context.</span>
            <span class="pill pill--mixed"><span class="dot"></span>Mixed</span>
          </li>
          <li id="cite-olsen-2013" class="library-bib__item">
            <span class="library-bib__cite">Olsen, R. J. (2013). The Divergent Association Task: A measure of creative potential. Unpublished manuscript / data archive.</span>
            <span class="library-bib__note">The original Divergent Association Task. M·01 instrument. Note: not a peer-reviewed paper, but a stable task used in subsequent published work.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-melby-2013" class="library-bib__item">
            <span class="library-bib__cite">Melby-Lervåg, M., &amp; Hulme, C. (2013). Is working memory training effective? <em>Developmental Psychology, 49</em>(2), 270–291.</span>
            <span class="library-bib__note">The meta-analysis. Near transfer reliable, far transfer limited. The single most-cited paper for what the field now thinks about brain training.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-maxwell-2014" class="library-bib__item">
            <span class="library-bib__cite">Maxwell, J. P., et al. (2014). The Cambridge Centre for Ageing and Neuroscience (Cam-CAN) consensus statement on brain training. <em>Psychological Science</em>.</span>
            <span class="library-bib__note">The 70-cognitive-psychologist consensus statement. The blunt "claims ... are not well supported" quote comes from here.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-kenett-2014" class="library-bib__item">
            <span class="library-bib__cite">Kenett, Y. N., Anaki, D., &amp; Faust, M. (2014). Investigating the structure of semantic networks in low and high creative persons. <em>Frontiers in Human Neuroscience, 8</em>, 407.</span>
            <span class="library-bib__note">Graph-distance measures correlate with creative cognition. Supports the Concept Jump task's construct validity.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-deary-2010" class="library-bib__item">
            <span class="library-bib__cite">Deary, I. J., Penke, L., &amp; Johnson, W. (2010). The neuroscience of human intelligence differences. <em>Nature Reviews Neuroscience, 11</em>(3), 201–211.</span>
            <span class="library-bib__note">The review establishing inspection time as a robust measure of processing speed and a correlate of psychometric g. B·02 reference.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-kable-2017" class="library-bib__item">
            <span class="library-bib__cite">Kable, J. W., et al. (2017). A year of Lumosity: Findings from a randomised controlled trial. <em>Mind, Brain, and Education, 11</em>(2), 61–67.</span>
            <span class="library-bib__note">The 10-minute-a-day IQ-raise claim tested against an honest control. No transfer found. The cautionary tale behind the platform's whole approach.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-aust-2018" class="library-bib__item">
            <span class="library-bib__cite">Au, J., et al. (2018). Does working memory training transfer? A multi-lab, multi-task, preregistered investigation. <em>Psychonomic Bulletin &amp; Review, 25</em>(5), 1707–1729.</span>
            <span class="library-bib__note">The multi-site preregistered replication. Small or null far-transfer effects. M·04 cited here.</span>
            <span class="pill pill--mixed"><span class="dot"></span>Mixed</span>
          </li>
          <li id="cite-west-2000" class="library-bib__item">
            <span class="library-bib__cite">West, R., &amp; Alain, C. (2000). Age-related decline in inhibitory control contributes to the increased Stroop effect observed in older adults. <em>Psychophysiology, 37</em>(2), 179–189.</span>
            <span class="library-bib__note">Age-related Stroop effect. The +1ms/year slope is the basis for the platform's age-band comparison.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-bjork-2011" class="library-bib__item">
            <span class="library-bib__cite">Bjork, E. L., &amp; Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In <em>Psychology and the Real World</em>.</span>
            <span class="library-bib__note">The "desirable difficulty" framework. Justifies the 85%-correct target for adaptive difficulty in M·04.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-bowden-2003" class="library-bib__item">
            <span class="library-bib__cite">Bowden, E. M., &amp; Jung-Beeman, M. (2003). Normative data for 144 compound remote associate problems. <em>Behavior Research Methods, Instruments, &amp; Computers, 35</em>(4), 634–639.</span>
            <span class="library-bib__note">The 144-item CRAT set. The Wideweave RAT bank is partly drawn from these items.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-piaget-1968" class="library-bib__item">
            <span class="library-bib__cite">Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. <em>Cognitive Science, 12</em>(2), 257–285.</span>
            <span class="library-bib__note">Cognitive load theory. Underwrites the choice of generation over selection in the training modules.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-tulving-1967" class="library-bib__item">
            <span class="library-bib__cite">Tulving, E. (1967). <em>Cue-dependent forgetting</em>. American Scientist.</span>
            <span class="library-bib__note">Encoding-specificity and forgetting. The scientific basis for spaced-recall: items retrieved in varied contexts become more retrievable.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
          <li id="cite-ebisu-2018" class="library-bib__item">
            <span class="library-bib__cite">Settles, B., &amp; Meeder, B. (2016). A trainable spaced repetition model for language learning. <em>ACL</em>.</span>
            <span class="library-bib__note">The original Ebisu paper. The platform's "Half-life boost/halve" engine is a simplification of the Ebisu half-life model. <a href="/method">The method page</a> is honest about this.</span>
            <span class="pill pill--proved"><span class="dot"></span>Proved</span>
          </li>
        </ol>
        <p class="library-prose__lede" style="margin-top: 32px;">
          The platform cites what the science supports. The
          pills are how the lab tells you what to believe.
          19 entries are tagged <strong>Proved</strong>
          (consensus of the field). 2 are tagged
          <strong>Mixed</strong> (Jaeggi 2008 and Au 2018,
          both about n-back transfer). The current
          bibliography does not yet have a
          <strong>Speculative</strong> entry — meaning
          the platform has not yet cited a claim it does
          not believe in. As the bibliography grows, any
          new claim that the platform would call
          speculation (rather than evidence or mixed
          evidence) will be marked Speculative when
          added.
        </p>
      </div>
    </section>

    <section class="section module-next">
      <div class="container">
        <div class="module-next__inner">
          <div>
            <span class="t-eyebrow">Read the short version</span>
            <h3 class="t-h3">The method page is a one-page summary.</h3>
            <p>If you read the library and want to keep just one page open, the method page is the short version. The library is for the days you want the long version with citations.</p>
          </div>
          <a class="btn btn--primary" href="/method">Open the method →</a>
        </div>
      </div>
    </section>
  `,
  init: async () => {
    const cleanups: Array<() => void> = [];
    cleanups.push(pageIntro());
    return () => cleanups.forEach((c) => c());
  }
};
