// Concept Jump — Wiki-Game traversal over a curated knowledge graph.
// Path scored against BFS shortest path from current to target.

import { saveSession } from '../lib/history';
import { getOrCreateItem, loadDueItems, type DueItem } from '../lib/spacedRecall';
import { CJ_PAIRS, type CjPair } from '../lib/recallItems';

type CJNode = { id: string; n: string[] };

// Compact graph: each line is "id: a, b, c, d" where a..d are neighbours.
// BFS is symmetric — we infer reverse edges at load.
const RAW = [
  'dreaming: sleep, memory, rem, night, brain',
  'sleep: dreaming, rem, rest, bed, night',
  'rem: dreaming, sleep, eye, brain',
  'memory: dreaming, recall, hippocampus, brain, past',
  'recall: memory, past, name, search',
  'hippocampus: memory, brain, plasticity',
  'plasticity: hippocampus, brain, change, learn',
  'brain: hippocampus, plasticity, memory, rem, neuron, prefrontal, cortex, dreaming',
  'night: dreaming, sleep, moon, dark',
  'rest: sleep, peace, calm, body',
  'bed: sleep, rest, morning, sheet',
  'past: memory, recall, history, ancient, future',
  'history: past, ancient, archive, war',
  'name: recall, identity, label, title',
  'search: recall, query, google, find',
  'eye: rem, vision, light, color',
  'neuron: brain, signal, axon, dendrite, plasticity',
  'axon: neuron, signal, nerve, speed',
  'dendrite: neuron, signal, branch, receive',
  'prefrontal: brain, cortex, executive, decision',
  'cortex: brain, prefrontal, layer, surface',
  'change: plasticity, learn, adapt, transform',
  'learn: plasticity, change, study, school, adapt',
  'school: learn, study, teacher, class',
  'study: learn, research, science, school',
  'science: study, research, method, experiment',
  'research: study, science, search, method',
  'moon: night, tide, lunar, satellite',
  'tide: moon, ocean, current, beach',
  'ocean: tide, water, salt, whale, wave, current',
  'water: ocean, river, rain, drink, ice',
  'wave: ocean, water, sound, signal',
  'current: ocean, tide, electric, flow',
  'electric: current, power, charge, lightning',
  'power: electric, energy, force, work, water',
  'energy: power, work, kinetic, heat, light',
  'light: energy, sun, photon, color, eye',
  'sun: light, star, heat, day',
  'star: sun, galaxy, night, sky',
  'sky: star, cloud, blue, atmosphere',
  'cloud: sky, water, rain, weather',
  'rain: water, cloud, weather, season',
  'weather: rain, cloud, season, climate',
  'season: weather, year, cycle, time',
  'time: season, second, hour, day, past',
  'day: time, sun, morning, today',
  'morning: day, sun, coffee, breakfast',
  'coffee: morning, drink, bean, roast',
  'bean: coffee, plant, legume, soy',
  'tree: wood, forest, plant, leaf, fox',
  'wood: tree, forest, oak, pine',
  'forest: wood, tree, animal, mushroom',
  'animal: forest, dog, cat, fox, whale',
  'cat: animal, dog, pet, whisker',
  'dog: animal, pet, bark, friend',
  'fox: animal, tree, palm, den',
  'whale: animal, ocean, mammal, blue',
  'mammal: whale, animal, body, warm',
  'human: mammal, society, culture, language',
  'language: human, word, speak, learn',
  'word: language, name, letter, search',
  'letter: word, alphabet, mail, post',
  'music: note, song, rhythm, sound',
  'note: music, paper, letter, memo',
  'song: music, note, sing, voice',
  'sound: music, noise, wave, hear',
  'noise: sound, city, signal, random',
  'city: noise, building, street, urban',
  'building: city, architecture, brick, story',
  'architecture: building, design, form, space',
  'design: architecture, form, function, sketch',
  'sketch: design, drawing, draft, study',
  'drawing: sketch, art, pencil, line',
  'art: drawing, painting, museum, beauty',
  'museum: art, history, exhibit, gallery',
  'gallery: museum, art, exhibit, frame',
  'color: art, light, eye, paint',
  'paint: color, art, brush, canvas',
  'canvas: paint, art, frame, fabric',
  'frame: canvas, picture, gallery, border',
  'picture: frame, image, photo, camera',
  'photo: picture, image, camera, film',
  'camera: photo, lens, image, focus',
  'lens: camera, eye, focus, glass',
  'glass: lens, window, transparent, mirror',
  'mirror: glass, reflection, image, surface',
  'surface: mirror, top, skin, plane',
  'skin: surface, body, touch, hand',
  'hand: skin, finger, glove, write',
  'write: hand, word, pen, author',
  'pen: write, ink, paper, tool',
  'paper: pen, book, page, document',
  'book: paper, library, author, read',
  'library: book, archive, quiet, shelf',
  'shelf: book, library, row, support',
  'row: shelf, line, boat, sequence',
  'line: row, shape, edge, draw',
  'edge: line, boundary, sharp, graph',
  'graph: edge, node, plot, chart',
  'node: graph, point, vertex, connection',
  'point: node, dot, place, sharp',
  'place: point, space, location, city',
  'space: place, sky, room, outer',
  'room: space, wall, door, floor',
  'door: room, lock, key, entrance',
  'key: door, lock, piano, music',
  'lock: key, door, security, combination',
  'gold: metal, money, mine, ring',
  'metal: gold, iron, copper, alloy',
  'iron: metal, magnet, steel, rust',
  'magnet: iron, attract, north, pole',
  'north: magnet, pole, direction, compass',
  'compass: north, direction, navigate, map',
  'map: compass, territory, navigate, world',
  'world: map, earth, global, human',
  'earth: world, planet, ground, soil',
  'ground: earth, floor, reason, common',
  'floor: ground, room, dance, surface',
  'dance: floor, music, body, rhythm',
  'rhythm: dance, music, beat, pattern',
  'pattern: rhythm, design, repeat, motif',
  'repeat: pattern, again, loop, echo',
  'echo: repeat, sound, mountain, repeat',
  'mountain: echo, peak, climb, snow',
  'snow: mountain, water, ice, white',
  'ice: snow, water, frozen, cold',
  'cold: ice, hot, weather, winter',
  'hot: cold, fire, heat, warm',
  'fire: hot, burn, flame, wood',
  'flame: fire, light, burn, candle',
  'candle: flame, light, wax, birthday',
  'birthday: candle, cake, year, party',
  'cake: birthday, cheese, bake, sweet',
  'cheese: cake, dairy, milk, cottage',
  'cottage: cheese, country, small, home',
  'home: cottage, house, family, return',
  'house: home, family, building, home',
  'family: house, human, relation, parent',
  'parent: family, child, mother, father',
  'mother: parent, family, child, care',
  'father: parent, family, child, work',
  'child: parent, family, young, learn',
  'young: child, new, fresh, age',
  'age: young, old, time, year',
  'old: age, ancient, past, used',
  'ancient: old, past, history, ruin',
  'ruin: ancient, history, broken, decay',
  'decay: ruin, entropy, time, rot',
  'entropy: decay, disorder, physics, heat',
  'physics: entropy, science, math, law',
  'math: physics, number, pattern, proof',
  'number: math, count, prime, digit',
  'prime: number, minister, first, beef',
  'proof: math, evidence, argument, truth',
  'truth: proof, fact, honesty, beauty',
  'beauty: truth, art, pattern, symmetry',
  'symmetry: beauty, pattern, mirror, balance',
  'balance: symmetry, equilibrium, body, scale',
  'body: balance, human, animal, physical',
  'physical: body, material, world, exercise',
  'exercise: physical, body, fit, run',
  'run: exercise, move, race, flow',
  'race: run, compete, speed, ethnic',
  'speed: race, fast, velocity, axon',
  'fast: speed, quick, eat, lent',
  'eat: food, fast, chew, swallow',
  'food: eat, nutrition, plant, meat',
  'plant: food, tree, green, leaf',
  'green: plant, color, env, fresh',
  'leaf: plant, tree, page, book',
  'page: leaf, book, web, paper',
  'web: page, internet, spider, net',
  'internet: web, net, online, search',
  'online: internet, net, web, virtual',
  'virtual: online, real, simulate, machine',
  'machine: virtual, computer, engine, motor',
  'computer: machine, code, screen, keyboard',
  'code: computer, program, cipher, secret',
  'program: code, computer, schedule, show',
  'schedule: program, plan, time, calendar',
  'calendar: schedule, time, date, year',
  'year: calendar, season, time, age',
  'date: calendar, fruit, romantic, time',
  'fruit: date, food, seed, plant',
  'seed: fruit, plant, start, idea',
  'idea: seed, thought, mind, create',
  'thought: idea, mind, think, consider',
  'mind: thought, brain, idea, mental',
  'mental: mind, brain, health, state',
  'health: mental, body, fit, doctor',
  'doctor: health, medicine, hospital, treat',
  'medicine: doctor, drug, herb, treat',
  'hospital: doctor, building, emergency, ward',
  'emergency: hospital, urgent, alarm, exit',
  'alarm: emergency, clock, bell, warn',
  'clock: alarm, time, hour, second',
  'second: clock, minute, time, moment',
  'minute: second, hour, time, quick',
  'hour: minute, time, work, day',
  'work: hour, job, force, art',
  'job: work, task, role, hire',
  'task: job, work, todo, unit',
  'todo: task, list, plan, today',
  'list: todo, item, row, sequence',
  'item: list, thing, unit, detail',
  'thing: item, object, stuff, real',
  'object: thing, 3d, shape, item',
  'shape: object, form, pattern, geometry',
  'geometry: shape, math, space, form',
  'form: geometry, shape, design, function',
  'function: form, code, role, math',
  'role: function, part, job, actor',
  'actor: role, stage, play, perform',
  'stage: actor, scene, theater, phase',
  'scene: stage, view, drama, place',
  'view: scene, sight, opinion, look',
  'look: view, see, eye, appear',
  'appear: look, show, seem, ghost',
  'ghost: appear, spirit, fear, story',
  'story: ghost, tale, book, narrate',
  'tale: story, fiction, myth, legend',
  'myth: tale, story, false, god',
  'god: myth, religion, prayer, divine',
  'religion: god, faith, prayer, church',
  'church: religion, building, priest, bell',
  'priest: church, religion, clergy, robe',
  'bell: church, alarm, sound, ring',
  'ring: bell, circle, gold, finger',
  'finger: ring, hand, digit, point',
  'digit: finger, number, code, binary',
  'binary: digit, code, two, system',
  'system: binary, network, order, design',
  'network: system, web, net, graph',
  'net: network, web, catch, fish',
  'fish: net, animal, swim, ocean',
  'swim: fish, water, move, dive',
  'dive: swim, water, deep, jump',
  'deep: dive, ocean, profound, thought',
  'profound: deep, thought, idea, meaning',
  'meaning: profound, sense, language, sign',
  'sense: meaning, feel, see, hear',
  'feel: sense, touch, emotion, hand',
  'emotion: feel, heart, mood, feel',
  'heart: emotion, body, pump, love',
  'love: heart, emotion, care, family'
];

// Build symmetric adjacency map
const G: Record<string, CJNode> = (() => {
  const m: Record<string, Set<string>> = {};
  for (const line of RAW) {
    const [id, rest] = line.split(':').map((s) => s.trim());
    const ns = rest.split(',').map((s) => s.trim());
    if (!m[id]) m[id] = new Set();
    for (const n of ns) {
      m[id].add(n);
      if (!m[n]) m[n] = new Set();
      m[n].add(id);
    }
  }
  const out: Record<string, CJNode> = {};
  for (const [id, set] of Object.entries(m)) {
    out[id] = { id, n: Array.from(set) };
  }
  return out;
})();

const PAIRS_FALLBACK: { start: string; target: string; optimal: string[] }[] = CJ_PAIRS.slice(0, 6).map(p => ({ start: p.start, target: p.target, optimal: p.optimal }));

let cjCleanup: (() => void) | null = null;

export function disposeCJ(): void {
  if (cjCleanup) {
    try { cjCleanup(); } catch { /* noop */ }
    cjCleanup = null;
  }
}

type PickedPair = { id: string; start: string; target: string; optimal: string[]; _correct: boolean | null };

async function pickSessionPairs(n: number): Promise<PickedPair[]> {
  let due: DueItem[] = [];
  try { due = await loadDueItems('cj', 50); } catch { /* noop */ }
  const dueByKey = new Map(due.map(d => [d.item_key, d.item_id]));
  const seenKeys = new Set<string>(dueByKey.keys());
  const duePairs: PickedPair[] = due
    .map(d => CJ_PAIRS.find(p => p.id === d.item_key))
    .filter((p): p is CjPair => !!p)
    .slice(0, n)
    .map(p => ({ id: p.id, start: p.start, target: p.target, optimal: p.optimal, _correct: null }));
  if (duePairs.length >= n) return duePairs;
  const rest = CJ_PAIRS.filter(p => !seenKeys.has(p.id));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const fillers: PickedPair[] = rest.slice(0, n - duePairs.length).map(p => ({ id: p.id, start: p.start, target: p.target, optimal: p.optimal, _correct: null }));
  return [...duePairs, ...fillers].sort(() => Math.random() - 0.5);
}

export function initCJ(): void {
  disposeCJ();
  const root = document.getElementById('cj');
  if (!root) return;

  const promptEl = document.getElementById('cj-prompt');
  const pathEl = document.getElementById('cj-path');
  const chipsEl = document.getElementById('cj-chips');
  const input = document.getElementById('cj-input') as HTMLInputElement | null;
  const pathLenEl = document.getElementById('cj-path-len');
  const shortestEl = document.getElementById('cj-shortest');
  const effEl = document.getElementById('cj-eff');
  const effBar = document.getElementById('cj-eff-bar') as HTMLElement | null;
  const effText = document.getElementById('cj-eff-text');
  if (!promptEl || !pathEl || !chipsEl || !input || !pathLenEl || !shortestEl || !effEl || !effBar || !effText) return;

  let pairIdx = 0;
  let current = '';
  let target = '';
  const trail: string[] = [];
  let optimal: string[] | null = null;
  let advanceTimer: number | null = null;
  const startedAt = Date.now();
  const pairs: { start: string; target: string; userLen: number; optimalLen: number; reached: boolean; _correct: boolean | null; _picked: PickedPair }[] = [];
  let saveInflight = false;
  let pickedPairs: PickedPair[] = [];

  const renderChips = () => {
    const adj = (G[current]?.n || []).slice(0, 10);
    chipsEl.innerHTML = adj
      .map((w) => {
        const isTarget = w === target;
        return `<button type="button" data-w="${w}" data-target="${isTarget ? 'true' : 'false'}">${w}${isTarget ? ' ★' : ''}</button>`;
      })
      .join('');
  };

  const render = () => {
    promptEl.innerHTML = `From <strong>${current}</strong> to <strong>${target}</strong>`;
    pathEl.innerHTML = trail
      .map((w, i) => {
        const cls = i === 0 ? 'start' : i === trail.length - 1 ? 'target' : '';
        return `<span class="demo-cj__node ${cls}" data-w="${w}">${w}</span>${i < trail.length - 1 ? '<span class="demo-cj__arrow">→</span>' : ''}`;
      })
      .join('');

    const userLen = trail.length - 1;
    const optimalLen = optimal ? optimal.length - 1 : 1;
    pathLenEl.textContent = String(userLen);
    shortestEl.textContent = String(optimalLen);

    if (trail[trail.length - 1] === target) {
      const effVal = optimalLen > 0 ? Math.max(0, Math.min(1, optimalLen / Math.max(userLen, 1))) : 1;
      effBar.style.width = `${(effVal * 100).toFixed(0)}%`;
      effText.textContent = `${(effVal * 100).toFixed(0)}%`;
      effEl.textContent = `${(effVal * 100).toFixed(0)}%`;
      chipsEl.innerHTML = `<span class="demo-cj__win">Reached ${target} in ${userLen} step${userLen === 1 ? '' : 's'} (optimal: ${optimalLen}).</span>`;
      const picked = pickedPairs[pairIdx];
      const reached = userLen <= optimalLen;
      pairs.push({ start: picked?.start ?? current, target, userLen, optimalLen, reached: true, _correct: reached, _picked: picked ?? null });
      if (advanceTimer) clearTimeout(advanceTimer);
      advanceTimer = window.setTimeout(() => {
        if (pairIdx + 1 >= pickedPairs.length) {
          finalize();
        } else {
          nextPair();
        }
      }, 1800);
    } else {
      renderChips();
      effBar.style.width = '0%';
      effText.textContent = '—';
      effEl.textContent = '—';
    }
  };

  const finalize = async () => {
    if (saveInflight) return;
    if (pairs.length === 0) return; // nothing to save
    saveInflight = true;
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    const meanEff = pairs.reduce((s, p) => s + (p.optimalLen > 0 ? Math.max(0, Math.min(1, p.optimalLen / Math.max(p.userLen, 1))) : 0), 0) / pairs.length;
    try {
      await saveSession({
        module: 'cj',
        score: meanEff,
        time_s: elapsed,
        trials: pairs.length,
        detail: { pairs: pairs.map(p => ({ start: p.start, target: p.target, userLen: p.userLen, optimalLen: p.optimalLen, reached: p.reached })) }
      });
      // After save, upsert items and record per-pair reviews.
      for (const p of pairs) {
        const picked = p._picked;
        if (!picked) continue;
        const correct = !!p._correct;
        const created = await getOrCreateItem('cj', picked.id, `${picked.start} → ${picked.target}`, {
          start: picked.start,
          target: picked.target,
          optimal: picked.optimal
        });
        if (created.ok && created.item) {
          const { recordReview } = await import('../lib/spacedRecall');
          await recordReview(created.item.id, correct);
        }
      }
    } finally {
      saveInflight = false;
    }
  };

  const nextPair = () => {
    if (advanceTimer) clearTimeout(advanceTimer);
    pairIdx = (pairIdx + 1);
    const p = pickedPairs[pairIdx];
    if (!p) return finalize();
    current = p.start;
    target = p.target;
    trail.length = 0;
    trail.push(current);
    optimal = p.optimal.slice();
    render();
  };

  const move = (next: string) => {
    if (next === current) return;
    if (!G[next]) {
      chipsEl.innerHTML = `<span class="demo-cj__hint">"${next}" isn't in this graph. Click a neighbour of "${current}" instead.</span>`;
      return;
    }
    const last = trail[trail.length - 1];
    if (G[last].n.includes(next)) {
      trail.push(next);
      current = next;
    } else {
      chipsEl.innerHTML = `<span class="demo-cj__hint">"${next}" isn't a neighbour of "${last}". Try a chip below.</span>`;
      return;
    }
    render();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = input.value.trim().toLowerCase();
      if (v) move(v);
      input.value = '';
    }
  };
  const onChipsClick = (e: MouseEvent) => {
    const t = (e.target as HTMLElement).closest('button');
    if (!t) return;
    const w = t.dataset.w;
    if (w) move(w);
  };
  const onPathClick = (e: MouseEvent) => {
    const t = (e.target as HTMLElement).closest('span');
    if (!t) return;
    const w = (t as HTMLElement).dataset.w;
    if (w && t.classList.contains('demo-cj__node') && !t.classList.contains('start') && !t.classList.contains('target')) {
      const i = trail.indexOf(w);
      if (i >= 0) {
        trail.length = i + 1;
        current = w;
        if (advanceTimer) clearTimeout(advanceTimer);
        render();
      }
    }
  };

  input.addEventListener('keydown', onKey);
  chipsEl.addEventListener('click', onChipsClick);
  pathEl.addEventListener('click', onPathClick);

  // Initial pair (loaded async)
  void (async () => {
    pickedPairs = await pickSessionPairs(6);
    if (pickedPairs.length === 0) pickedPairs = PAIRS_FALLBACK.map(p => ({ id: 'fallback', start: p.start, target: p.target, optimal: p.optimal, _correct: null }));
    const p = pickedPairs[0];
    current = p.start;
    target = p.target;
    trail.length = 0;
    trail.push(current);
    optimal = p.optimal.slice();
    render();
  })();

  cjCleanup = () => {
    input.removeEventListener('keydown', onKey);
    chipsEl.removeEventListener('click', onChipsClick);
    pathEl.removeEventListener('click', onPathClick);
    if (advanceTimer) clearTimeout(advanceTimer);
  };
}