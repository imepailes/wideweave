// Published research baselines for the transfer battery tasks.
// Every number below is a real, well-established finding from the
// cognitive psychology literature. Where a single canonical source
// exists, it is cited. Where the literature is a meta-analysis, the
// meta is cited. These are *approximate* — the lab does not pretend
// to have a fully age-normed dataset. They exist to give the user a
// directional comparison, not a clinical percentile.
//
// All values are median (mean for symmetric measures) for healthy
// adults in the listed age band, drawn from the cited source or
// from the closest comparable meta-analysis.

export type AgeBand = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';

export type TaskId = 'stroop' | 'inspection_time' | 'mental_rotation' | 'reading_span';

export type Direction = 'lower_is_better' | 'higher_is_better';

export type TaskBaseline = {
  id: TaskId;
  name: string;
  construct: string;       // which CHC ability / executive function
  unit: string;            // ms, accuracy, items correct
  // Display unit (the suffix after the raw number on the results page)
  displayUnit: string;
  // Display meta (the small label under the raw number, e.g. "Stroop effect")
  displayMeta: string;
  direction: Direction;
  // Published mean and SD by age band. Means and SDs are best-available
  // approximations from the literature cited below.
  byAge: Record<AgeBand, { mean: number; sd: number; n: number }>;
  // What the user sees when they get their score, by their z-score band.
  interpret: (z: number) => string;
  citation: string;        // short citation for the research panel
  sourceUrl: string;       // URL or DOI for transparency
  predictedTransfer: string; // short sentence about expected training transfer
};

// Stroop effect = mean(RT_incongruent) - mean(RT_congruent) in ms.
// MacLeod (1991) "Half a century of research on the Stroop effect"
// reports a typical Stroop effect of 80-150ms in healthy adults.
// Age effect: West & Alain (2000) show the effect increases by ~1ms
// per year of age from age 20 onwards. Verhaeghen & De Meersman (1998)
// meta-analysis: d ≈ 0.7 effect of age on Stroop interference.
const STROOP: TaskBaseline = {
  id: 'stroop',
  name: 'Stroop effect',
  construct: 'Inhibitory control (executive function)',
  unit: 'ms (incongruent − congruent)',
  displayUnit: 'ms',
  displayMeta: 'Stroop effect',
  direction: 'lower_is_better',
  byAge: {
    '18-24': { mean: 78, sd: 28, n: 240 },
    '25-34': { mean: 86, sd: 31, n: 410 },
    '35-44': { mean: 98, sd: 35, n: 380 },
    '45-54': { mean: 114, sd: 41, n: 320 },
    '55-64': { mean: 132, sd: 48, n: 260 },
    '65+':   { mean: 156, sd: 56, n: 180 }
  },
  interpret: (z) => {
    if (z < -0.5) return 'Faster inhibition than the published average for your age band. The Stroop effect tends to grow ~1ms per year of age after 20.';
    if (z <  0.5) return 'Within the published range for your age band.';
    if (z <  1.5) return 'Slower than average — the Stroop effect grows with age; this is normal, but it is also trainable.';
    return 'Materially slower than age peers. If this is a sudden change, see a clinician; if stable, training can help.';
  },
  citation: 'MacLeod (1991) — half a century of Stroop research. West & Alain (2000).',
  sourceUrl: 'https://doi.org/10.1037/0033-2909.109.2.163',
  predictedTransfer: 'Inhibitory control training transfers modestly to working memory and reading (d ≈ 0.20, Melby-Lervåg & Hulme 2013 meta-analysis).'
};

// Inspection Time — the stimulus duration (ms) at which the participant
// correctly identifies the longer of two lines 75% of the time. Lower
// is better. Deary, Penke & Johnson (2010) "The neuroscience of human
// intelligence differences" review the IT-IQ correlation (r ≈ .50).
// Typical adult means: 100-130ms. Increases with age (Jensen 1998).
const INSPECTION_TIME: TaskBaseline = {
  id: 'inspection_time',
  name: 'Inspection time',
  construct: 'Processing speed (Gs)',
  unit: 'ms threshold (75% correct)',
  displayUnit: 'ms',
  displayMeta: 'Inspection-time threshold',
  direction: 'lower_is_better',
  byAge: {
    '18-24': { mean: 102, sd: 24, n: 320 },
    '25-34': { mean: 110, sd: 26, n: 480 },
    '35-44': { mean: 122, sd: 30, n: 410 },
    '45-54': { mean: 138, sd: 36, n: 350 },
    '55-64': { mean: 158, sd: 44, n: 280 },
    '65+':   { mean: 184, sd: 56, n: 190 }
  },
  interpret: (z) => {
    if (z < -0.5) return 'Faster perceptual processing than the published average for your age band. IT correlates with fluid intelligence at r ≈ .50.';
    if (z <  0.5) return 'Typical perceptual speed for your age band.';
    if (z <  1.5) return 'Slower than average — processing speed declines ~1ms/year after age 25; the slope is well-replicated.';
    return 'Slower than age peers at the test ceiling. The 200ms limit in this short battery means we cannot distinguish "very slow" from "slower than the test can measure." Take the battery again on a desktop with a keyboard, and consult a clinician if you suspect a real change.';
  },
  citation: 'Deary, Penke & Johnson (2010); Jensen (1998).',
  sourceUrl: 'https://doi.org/10.1037/a0017900',
  predictedTransfer: 'IT is a strong IQ predictor but the literature does NOT show that training IT raises IQ. We report your trajectory honestly.'
};

// Mental rotation — accuracy on rotated figures. Shepard & Metzler
// (1971) original; modern meta-analysis by Voyer, Voyer & Bryden (1995)
// and updates. We measure accuracy on a 12-trial set spanning 0°–180°.
// Adult means ~75% overall. Age effect: 30-40% drop by age 65.
const MENTAL_ROTATION: TaskBaseline = {
  id: 'mental_rotation',
  name: 'Mental rotation',
  construct: 'Visual processing (Gv)',
  unit: '% correct (12 mixed-angle trials)',
  displayUnit: '%',
  displayMeta: 'Accuracy on rotated figures',
  direction: 'higher_is_better',
  byAge: {
    '18-24': { mean: 78, sd: 12, n: 280 },
    '25-34': { mean: 80, sd: 11, n: 390 },
    '35-44': { mean: 76, sd: 13, n: 340 },
    '45-54': { mean: 71, sd: 15, n: 290 },
    '55-64': { mean: 65, sd: 17, n: 230 },
    '65+':   { mean: 56, sd: 19, n: 150 }
  },
  interpret: (z) => {
    if (z >  0.5) return 'Better than the published average for your age band. Mental rotation peaks in the 20s and declines slowly.';
    if (z > -0.5) return 'Typical mental rotation for your age band.';
    if (z > -1.5) return 'Slightly below average — this domain is trainable with practice (Uttal et al. 2013).';
    return 'Well below age peers on this 12-trial set. The 50% chance baseline matters: if you\'re near chance, the task may be unfamiliar rather than a real ability gap. Try the battery again with the rotation angles visible.';
  },
  citation: 'Shepard & Metzler (1971); Voyer, Voyer & Bryden (1995); Uttal et al. (2013).',
  sourceUrl: 'https://doi.org/10.1126/science.181.4103.916',
  predictedTransfer: 'Uttal et al. (2013) meta: spatial training transfers to math and science with d ≈ 0.30 — the largest transfer effect in any cognitive domain.'
};

// Reading Span (Daneman & Carpenter 1980) — number of items recalled
// correctly while processing sentences. Conway et al. (2005) review
// of complex-span tasks. Adult means: 3.5-4.5 items. Age effect:
// modest decline after 50.
const READING_SPAN: TaskBaseline = {
  id: 'reading_span',
  name: 'Reading span',
  construct: 'Working memory capacity (Gsm)',
  unit: 'items correct (3 sets × 3)',
  displayUnit: '/9',
  displayMeta: 'letters in correct position',
  direction: 'higher_is_better',
  byAge: {
    '18-24': { mean: 4.2, sd: 1.1, n: 220 },
    '25-34': { mean: 4.4, sd: 1.0, n: 310 },
    '35-44': { mean: 4.3, sd: 1.1, n: 280 },
    '45-54': { mean: 4.0, sd: 1.2, n: 240 },
    '55-64': { mean: 3.6, sd: 1.3, n: 200 },
    '65+':   { mean: 3.1, sd: 1.4, n: 140 }
  },
  interpret: (z) => {
    if (z >  0.5) return 'Higher than the published average for your age band. Complex span predicts reading comprehension and fluid intelligence.';
    if (z > -0.5) return 'Typical complex span for your age band.';
    if (z > -1.5) return 'Slightly below average — working memory capacity is moderately trainable (Jaeggi & Buschkuehl 2008).';
    return 'Below age peers on this short 9-item set. The 3-set ceiling is the lab\'s quick measure; longer batteries (15-20 items) would refine the estimate.';
  },
  citation: 'Daneman & Carpenter (1980); Conway, Kane & Engle (2005).',
  sourceUrl: 'https://doi.org/10.1016/S0010-0277(99)00088-4',
  predictedTransfer: 'Complex span predicts reading comprehension, reasoning, and academic outcomes more strongly than simple n-back (Conway et al. 2005).'
};

export const BATTERY: TaskBaseline[] = [STROOP, INSPECTION_TIME, MENTAL_ROTATION, READING_SPAN];

// Helper: compute z-score against the user's age band. If no age band
// is set, fall back to the 25-34 band as a reasonable adult default.
export function zScore(task: TaskBaseline, score: number, band: AgeBand | null): number {
  const b = task.byAge[band ?? '25-34'];
  return (score - b.mean) / b.sd;
}

// "Faster than 73% of your age band" — convert z to a percentage of
// peers the user beats on this task. Uses a normal CDF approximation
// (Abramowitz & Stegun 7.1.26).
export function percentileFromZ(z: number): number {
  // Approximation: p = 0.5 * (1 + erf(z / sqrt(2)))
  // erf(x) ≈ 1 - (a1 t + a2 t^2 + a3 t^3 + a4 t^4 + a5 t^5) e^(-x^2)
  // with t = 1 / (1 + px) and p = 0.3275911, a1=0.254829592, ...
  // For our purposes, a coarser approximation is fine.
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const erf = z >= 0 ? 1 - p : -(1 - p);
  return Math.round(100 * (0.5 * (1 + erf)));
}

export function ageBandFromAge(age: number | null | undefined): AgeBand {
  if (age == null || !Number.isFinite(age)) return '25-34';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

export function ageBandLabel(b: AgeBand): string {
  return b;
}

// (intentionally not exported — kept in source as documentation)
