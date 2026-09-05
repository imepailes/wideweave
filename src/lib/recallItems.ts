// Per-module item banks for the spaced-rep engine.
//
// RAT — Remote Associates: each entry is a triple of words with one or
// more accepted solutions. The puzzle id is the canonical solution word
// in lower case. The display is the three words joined with " · ".
//
// CJ — Concept Jump: each entry is a (start, target) pair in the
// knowledge graph. The item key is "start→target". The payload includes
// the optimal path so the drill can show it as a hint on a wrong recall.

export type RatPuzzle = {
  id: string;
  words: [string, string, string];
  solutions: string[];   // accepted answers (case-insensitive)
};

export type CjPair = {
  id: string;
  start: string;
  target: string;
  optimal: string[];     // shortest path including start and target
};

export const RAT_PUZZLES: RatPuzzle[] = [
  // Original 6 (kept for compat)
  { id: 'cheese',     words: ['cottage', 'swiss', 'cake'],    solutions: ['cheese'] },
  { id: 'sack',       words: ['sleeping', 'bean', 'bag'],     solutions: ['sack'] },
  { id: 'power',      words: ['water', 'fall', 'house'],      solutions: ['power'] },
  { id: 'tree',       words: ['fox', 'hole', 'palm'],         solutions: ['tree'] },
  { id: 'day',        words: ['dream', 'break', 'light'],     solutions: ['day', 'daybreak', 'daylight'] },
  { id: 'house',      words: ['rocking', 'horse', 'fly'],     solutions: ['house'] },
  // Expanded bank — 18 more, classic RAT and CRAT items
  { id: 'ball',       words: ['foot', 'snow', 'dance'],       solutions: ['ball'] },
  { id: 'line',       words: ['fish', 'hook', 'draw'],        solutions: ['line'] },
  { id: 'time',       words: ['sand', 'glass', 'table'],      solutions: ['time'] },
  { id: 'fly',        words: ['dragon', 'house', 'time'],     solutions: ['fly'] },
  { id: 'man',        words: ['crab', 'spider', 'stick'],     solutions: ['man'] },
  { id: 'ground',     words: ['play', 'common', 'down'],      solutions: ['ground'] },
  { id: 'mother',     words: ['pearl', 'step', 'father'],     solutions: ['mother'] },
  { id: 'star',       words: ['fish', 'sun', 'globe'],        solutions: ['star'] },
  { id: 'spring',     words: ['water', 'air', 'coil'],        solutions: ['spring'] },
  { id: 'frame',      words: ['door', 'key', 'eye'],          solutions: ['frame'] },
  { id: 'light',      words: ['spot', 'sun', 'birth'],        solutions: ['light', 'daylight', 'sunlight'] },
  { id: 'box',        words: ['mail', 'tape', 'shoe'],        solutions: ['box'] },
  { id: 'work',       words: ['fire', 'piece', 'home'],       solutions: ['work'] },
  { id: 'tie',        words: ['neck', 'draw', 'wedding'],     solutions: ['tie'] },
  { id: 'room',       words: ['bed', 'bath', 'living'],       solutions: ['room'] },
  { id: 'leaf',       words: ['fig', 'tea', 'maple'],         solutions: ['leaf'] },
  { id: 'drop',       words: ['rain', 'eye', 'tear'],         solutions: ['drop'] }
];

export const CJ_PAIRS: CjPair[] = [
  // Original 6
  { id: 'dreaming→ocean',       start: 'dreaming', target: 'ocean',       optimal: ['dreaming', 'water', 'ocean'] },
  { id: 'memory→science',       start: 'memory',   target: 'science',     optimal: ['memory', 'brain', 'science'] },
  { id: 'brain→gold',           start: 'brain',    target: 'gold',        optimal: ['brain', 'metal', 'gold'] },
  { id: 'sleep→beach',          start: 'sleep',    target: 'beach',       optimal: ['sleep', 'dream', 'beach'] },
  { id: 'plasticity→music',     start: 'plasticity', target: 'music',     optimal: ['plasticity', 'brain', 'music'] },
  { id: 'tree→electric',        start: 'tree',     target: 'electric',    optimal: ['tree', 'forest', 'electric'] },
  // Expanded bank
  { id: 'language→ocean',       start: 'language', target: 'ocean',       optimal: ['language', 'sound', 'ocean'] },
  { id: 'metal→tree',           start: 'metal',    target: 'tree',        optimal: ['metal', 'iron', 'tree'] },
  { id: 'fire→water',           start: 'fire',     target: 'water',       optimal: ['fire', 'smoke', 'water'] },
  { id: 'light→gold',           start: 'light',    target: 'gold',        optimal: ['light', 'sun', 'gold'] },
  { id: 'eye→beach',            start: 'eye',      target: 'beach',       optimal: ['eye', 'face', 'beach'] },
  { id: 'memory→music',         start: 'memory',   target: 'music',       optimal: ['memory', 'brain', 'music'] },
  { id: 'sound→forest',         start: 'sound',    target: 'forest',      optimal: ['sound', 'tree', 'forest'] },
  { id: 'time→electric',        start: 'time',     target: 'electric',    optimal: ['time', 'clock', 'electric'] },
  { id: 'rain→gold',            start: 'rain',     target: 'gold',        optimal: ['rain', 'water', 'gold'] },
  { id: 'face→ocean',           start: 'face',     target: 'ocean',       optimal: ['face', 'skin', 'ocean'] },
  { id: 'sun→language',         start: 'sun',      target: 'language',    optimal: ['sun', 'light', 'language'] },
  { id: 'glass→music',          start: 'glass',    target: 'music',       optimal: ['glass', 'eye', 'music'] }
];
