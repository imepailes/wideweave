// Stimuli for the transfer battery tasks. Curated to be short, clean,
// and unambiguous for an English-reading adult.

// Reading span: 3 sets of 3 sentences, each followed by a 3-letter
// item to remember. The user must judge each sentence true/false,
// then recall the 3 letters in order. Total: 9 sentences + 9 letters.
export const READING_SPAN_SETS: { sentences: { text: string; true_: boolean }[]; letters: string[] }[] = [
  {
    letters: ['K', 'B', 'P'],
    sentences: [
      { text: 'A week has seven days.', true_: true },
      { text: 'A triangle has four sides.', true_: false },
      { text: 'Birds have feathers.', true_: true }
    ]
  },
  {
    letters: ['M', 'T', 'D'],
    sentences: [
      { text: 'Snow is usually cold.', true_: true },
      { text: 'The sun rises in the west.', true_: false },
      { text: 'An octopus has eight arms.', true_: true }
    ]
  },
  {
    letters: ['F', 'R', 'L'],
    sentences: [
      { text: 'A piano has black and white keys.', true_: true },
      { text: 'Gold is heavier than helium.', true_: false },
      { text: 'A hexagon has six sides.', true_: true }
    ]
  }
];

// Mental rotation: 12 trials, each with a 3D shape pair and a
// rotation angle. We use the 2D "hands" version (Parsons 1987) for
// simplicity — no image assets required, just draw the hands.
// The user judges "same hand, different rotation" vs "mirror image".
export type RotationTrial = { angle: number; mirror: boolean; correctIs: 'same' | 'mirror' };
export const ROTATION_TRIALS: RotationTrial[] = [
  { angle: 0,   mirror: false, correctIs: 'same' },
  { angle: 60,  mirror: false, correctIs: 'same' },
  { angle: 120, mirror: false, correctIs: 'same' },
  { angle: 180, mirror: false, correctIs: 'same' },
  { angle: 30,  mirror: true,  correctIs: 'mirror' },
  { angle: 90,  mirror: true,  correctIs: 'mirror' },
  { angle: 150, mirror: true,  correctIs: 'mirror' },
  { angle: 45,  mirror: false, correctIs: 'same' },
  { angle: 75,  mirror: true,  correctIs: 'mirror' },
  { angle: 135, mirror: true,  correctIs: 'mirror' },
  { angle: 105, mirror: false, correctIs: 'same' },
  { angle: 165, mirror: false, correctIs: 'same' }
];

// Stroop: words and colors. Four colors, balanced congruent/incongruent.
export const STROOP_COLORS = [
  { word: 'RED',    hex: '#D14B4B' },
  { word: 'BLUE',   hex: '#3B6CD1' },
  { word: 'GREEN',  hex: '#3FA34D' },
  { word: 'YELLOW', hex: '#C8A23A' }
] as const;

// 16 trials: 8 congruent, 8 incongruent. The display shows a word in
// a color; the user keys the COLOR (not the word). We use keys R, B, G, Y.
export type StroopTrial = { word: string; color: string; congruent: boolean };
export function buildStroopTrials(): StroopTrial[] {
  const trials: StroopTrial[] = [];
  // Alternate congruent / incongruent, randomized word and color
  const sequence: ('congruent' | 'incongruent')[] = [
    'congruent', 'incongruent', 'incongruent', 'congruent',
    'incongruent', 'congruent', 'congruent', 'incongruent',
    'congruent', 'incongruent', 'congruent', 'incongruent',
    'incongruent', 'congruent', 'incongruent', 'congruent'
  ];
  for (const kind of sequence) {
    const wordIdx = Math.floor(Math.random() * 4);
    let colorIdx = Math.floor(Math.random() * 4);
    if (kind === 'congruent') {
      // color = word
    } else {
      // color != word
      while (colorIdx === wordIdx) colorIdx = (colorIdx + 1) % 4;
    }
    trials.push({
      word: STROOP_COLORS[wordIdx].word,
      color: STROOP_COLORS[colorIdx].hex,
      congruent: kind === 'congruent'
    });
  }
  return trials;
}

// Inspection Time: 4 stimulus durations, 4 trials each = 16 trials.
// The user identifies which of two vertical lines was longer.
// Threshold: the longest duration at which they get ≤ 75% correct.
export const IT_DURATIONS = [50, 90, 140, 200]; // ms
export function buildITTrials(): { duration: number; leftLonger: boolean }[] {
  const trials: { duration: number; leftLonger: boolean }[] = [];
  for (const d of IT_DURATIONS) {
    for (let i = 0; i < 4; i++) {
      trials.push({ duration: d, leftLonger: Math.random() < 0.5 });
    }
  }
  return trials;
}
