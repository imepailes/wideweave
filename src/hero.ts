// Hero — semantic knowledge graph in Three.js.
// Pointer-reactive force modulation, capped DPR, paused offscreen.
// Replaced with a static SVG poster under prefers-reduced-motion or WebGL failure.

import * as THREE from 'three';

type GraphNode = { x: number; y: number; vx: number; vy: number; label: string; r: number };

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

// Hand-authored mini knowledge graph. The labels are real English words
// and the edges are real "appears near" relations (curated, not random —
// we want the graph to *look* like knowledge, not noise).
const NODES: { id: string; r: number }[] = [
  { id: 'dreaming', r: 1.0 },       // center
  { id: 'sleep', r: 0.95 },
  { id: 'memory', r: 0.9 },
  { id: 'ocean', r: 0.95 },         // target-ish
  { id: 'tide', r: 0.75 },
  { id: 'wave', r: 0.7 },
  { id: 'salt', r: 0.6 },
  { id: 'moon', r: 0.7 },
  { id: 'rem', r: 0.55 },
  { id: 'consolidation', r: 0.55 },
  { id: 'hippocampus', r: 0.5 },
  { id: 'schema', r: 0.5 },
  { id: 'water', r: 0.7 },
  { id: 'current', r: 0.6 },
  { id: 'shore', r: 0.55 },
  { id: 'fish', r: 0.5 },
  { id: 'whale', r: 0.5 },
  { id: 'kelp', r: 0.45 },
  { id: 'abyss', r: 0.45 },
  { id: 'coral', r: 0.5 },
  { id: 'attention', r: 0.5 },
  { id: 'recall', r: 0.5 },
  { id: 'habit', r: 0.45 },
  { id: 'plasticity', r: 0.45 },
  { id: 'pattern', r: 0.5 }
];
const EDGES: [string, string][] = [
  ['dreaming', 'sleep'], ['dreaming', 'memory'], ['dreaming', 'rem'],
  ['sleep', 'rem'], ['sleep', 'consolidation'], ['sleep', 'moon'],
  ['memory', 'recall'], ['memory', 'hippocampus'], ['memory', 'consolidation'],
  ['memory', 'schema'], ['memory', 'habit'],
  ['recall', 'attention'], ['attention', 'pattern'], ['pattern', 'habit'],
  ['plasticity', 'hippocampus'], ['plasticity', 'habit'],
  ['ocean', 'tide'], ['ocean', 'wave'], ['ocean', 'water'], ['ocean', 'moon'],
  ['ocean', 'salt'], ['ocean', 'current'], ['ocean', 'shore'], ['ocean', 'fish'],
  ['ocean', 'whale'], ['ocean', 'kelp'], ['ocean', 'abyss'], ['ocean', 'coral'],
  ['tide', 'moon'], ['wave', 'shore'], ['salt', 'water'], ['current', 'water'],
  ['fish', 'whale'], ['coral', 'kelp'], ['coral', 'abyss'],
  // cross-graph bridges (what makes it a knowledge graph, not two clusters)
  ['sleep', 'tide'], ['moon', 'tide'], ['memory', 'current'], ['pattern', 'wave'],
  ['plasticity', 'coral']
];

export function initHero(): void {
  const stage = document.getElementById('hero-stage');
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  const numEl = document.getElementById('hero-readout-num');
  const dEl = document.getElementById('hero-readout-d');
  // The values are wired up via the readout cycle further below.
  void numEl; void dEl;
  if (!stage || !canvas) return;

  // Reduced motion: skip the WebGL layer entirely. Render a static SVG poster.
  if (reduced || !hasWebGL()) {
    canvas.style.display = 'none';
    renderPoster(stage);
    return;
  }

  // Layout — force-directed in 2D, then we render in Three as a flat scene
  // with a single orthographic-feeling perspective (we keep z near 0).
  const nodes: GraphNode[] = NODES.map((n) => ({
    x: (Math.random() - 0.5) * 1.4,
    y: (Math.random() - 0.5) * 1.4,
    vx: 0,
    vy: 0,
    label: n.id,
    r: n.r
  }));
  const idIndex = new Map(nodes.map((n, i) => [n.label, i]));
  const edges = EDGES.map(([a, b]) => [idIndex.get(a)!, idIndex.get(b)!] as [number, number]).filter(
    ([a, b]) => a !== undefined && b !== undefined
  );

  // Three.js setup — minimal: orthographic-ish plane, line + circle sprites.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Node sprites — single InstancedMesh of small discs, sized by r.
  const nodeGeom = new THREE.CircleGeometry(1, 24);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x1b1b1b, transparent: true, opacity: 0.92 });
  const inst = new THREE.InstancedMesh(nodeGeom, nodeMat, nodes.length);
  inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(inst);

  // Accent nodes — start and target get the accent color.
  const accentIdx = ['dreaming', 'ocean'].map((id) => idIndex.get(id)!).filter((i) => i !== undefined);
  const accentGeom = new THREE.CircleGeometry(1, 24);
  const accentMat = new THREE.MeshBasicMaterial({ color: 0x5e6ad2, transparent: true, opacity: 1 });
  const accentInst = new THREE.InstancedMesh(accentGeom, accentMat, accentIdx.length);
  scene.add(accentInst);

  // Soft halos for accent nodes
  const haloGeom = new THREE.CircleGeometry(1, 32);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x5e6ad2, transparent: true, opacity: 0.12 });
  const haloInst = new THREE.InstancedMesh(haloGeom, haloMat, accentIdx.length);
  scene.add(haloInst);

  // Edges — one big LineSegments geometry, updated per frame.
  const edgeGeom = new THREE.BufferGeometry();
  const edgePositions = new Float32Array(edges.length * 2 * 3);
  const edgeColors = new Float32Array(edges.length * 2 * 3);
  edgeGeom.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
  edgeGeom.setAttribute('color', new THREE.BufferAttribute(edgeColors, 3));
  const edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55 });
  const edgeLines = new THREE.LineSegments(edgeGeom, edgeMat);
  scene.add(edgeLines);

  // Labels — DOM-based, positioned by projecting 3D points. Cleaner than
  // rendering canvas-baked text and keeps things crisp on retina.
  // We render ALL labels at every viewport, but shrink font and lower
  // opacity on small stages so the graph still reads as a graph rather
  // than two floating dots. On coarse pointers we lower opacity further
  // because labels compete with the readout for limited visual space.
  const labelEls: HTMLDivElement[] = [];
  const stageWidth = () => stage.getBoundingClientRect().width;
  const baseFontForWidth = (w: number) => {
    if (w >= 700) return 11;
    if (w >= 520) return 10;
    if (w >= 380) return 9;
    return 8;
  };
  for (const n of nodes) {
    const el = document.createElement('div');
    el.className = 'hero__label';
    el.textContent = n.label;
    Object.assign(el.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      transform: 'translate(-50%, -50%)',
      font: `500 ${baseFontForWidth(stageWidth())}px Inter, sans-serif`,
      color: 'rgba(74,74,74,0.78)',
      letterSpacing: '0.01em',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
      transition: 'font-size 200ms ease-out, color 200ms ease-out'
    } as CSSStyleDeclaration);
    if (accentIdx.includes(idIndex.get(n.label)!)) {
      el.style.color = '#1B1B1B';
      el.style.fontWeight = '600';
    }
    if (isCoarsePointer) {
      el.style.opacity = '0.6';
    }
    stage.appendChild(el);
    labelEls.push(el);
  }
  // Hide labels on very small stages to avoid clutter.
  const labelContainer = labelEls;

  // Pointer (force modulation only — never breaks layout). Disabled on
  // coarse pointers (touch) where the interaction reads as accidental.
  const pointer = { x: 0, y: 0, active: false };
  const onMove = (e: PointerEvent) => {
    if (isCoarsePointer) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointer.active = true;
  };
  const onLeave = () => {
    pointer.active = false;
  };
  const onBlur = () => {
    pointer.active = false;
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onBlur);

  // Resize
  const resize = () => {
    const rect = stage.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    const size = baseFontForWidth(rect.width);
    labelContainer.forEach((el) => {
      el.style.fontSize = `${size}px`;
      el.style.display = 'block';
    });
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  // Force simulation — O(n²) is fine at 25 nodes.
  const tmp = new THREE.Object3D();
  const simulate = (dt: number) => {
    const k = 0.012;            // spring stiffness along edges
    const repulse = 0.0009;     // Coulomb-like repulsion
    const center = 0.0009;      // gentle pull to origin
    const damping = 0.86;

    // Spring edges
    for (const [a, b] of edges) {
      const A = nodes[a];
      const B = nodes[b];
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const dist = Math.max(0.05, Math.hypot(dx, dy));
      const target = 0.34;      // ideal edge length
      const f = (dist - target) * k;
      const ux = dx / dist;
      const uy = dy / dist;
      A.vx += ux * f;
      A.vy += uy * f;
      B.vx -= ux * f;
      B.vy -= uy * f;
    }
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const A = nodes[i];
        const B = nodes[j];
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const d2 = dx * dx + dy * dy + 0.001;
        const f = repulse / d2;
        const d = Math.sqrt(d2);
        const ux = dx / d;
        const uy = dy / d;
        A.vx -= ux * f;
        A.vy -= uy * f;
        B.vx += ux * f;
        B.vy += uy * f;
      }
    }
    // Pull to center + pointer force
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.vx += -n.x * center;
      n.vy += -n.y * center;
      if (pointer.active) {
        const ddx = pointer.x - n.x;
        const ddy = pointer.y - n.y;
        const d2 = ddx * ddx + ddy * ddy + 0.5;
        const f = 0.0012 / d2;
        n.vx += (ddx / Math.sqrt(d2)) * f;
        n.vy += (ddy / Math.sqrt(d2)) * f;
      }
    }
    // Integrate
    for (const n of nodes) {
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx * dt * 60;
      n.y += n.vy * dt * 60;
    }
  };

  // Render
  const render = () => {
    simulate(0.016);

    // Match aspect: nodes are in roughly [-1, 1] coords. We map to viewport.
    const rect = stage.getBoundingClientRect();
    const minDim = Math.min(rect.width, rect.height);
    const sx = (rect.width / minDim) * 0.42;
    const sy = (rect.height / minDim) * 0.42;

    // Update edge geometry
    for (let i = 0; i < edges.length; i++) {
      const [a, b] = edges[i];
      const A = nodes[a];
      const B = nodes[b];
      edgePositions[i * 6 + 0] = A.x * sx;
      edgePositions[i * 6 + 1] = A.y * sy;
      edgePositions[i * 6 + 2] = 0;
      edgePositions[i * 6 + 3] = B.x * sx;
      edgePositions[i * 6 + 4] = B.y * sy;
      edgePositions[i * 6 + 5] = 0;
      // edge color: faint ink, brighter if either endpoint is accent
      const aIsAccent = accentIdx.includes(a);
      const bIsAccent = accentIdx.includes(b);
      const c = aIsAccent || bIsAccent ? [0.37, 0.42, 0.82] : [0.7, 0.7, 0.7];
      for (let k = 0; k < 2; k++) {
        edgeColors[i * 6 + k * 3 + 0] = c[0];
        edgeColors[i * 6 + k * 3 + 1] = c[1];
        edgeColors[i * 6 + k * 3 + 2] = c[2];
      }
    }
    edgeGeom.attributes.position.needsUpdate = true;
    edgeGeom.attributes.color.needsUpdate = true;

    // Update nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const isAccent = accentIdx.includes(i);
      const radius = (isAccent ? 0.04 : 0.025) * n.r * (minDim / 480);
      tmp.position.set(n.x * sx, n.y * sy, 0);
      tmp.scale.set(radius, radius, 1);
      tmp.updateMatrix();
      inst.setMatrixAt(i, tmp.matrix);
      if (isAccent) {
        const j = accentIdx.indexOf(i);
        const hradius = radius * 4.5;
        const hpos = tmp.position.clone();
        const hscale = new THREE.Vector3(hradius, hradius, 1);
        const m = new THREE.Matrix4().compose(hpos, new THREE.Quaternion(), hscale);
        accentInst.setMatrixAt(j, m);
        haloInst.setMatrixAt(j, m);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    accentInst.instanceMatrix.needsUpdate = true;
    haloInst.instanceMatrix.needsUpdate = true;

    // Update labels
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const el = labelEls[i];
      const cx = (n.x * sx + 1) * 0.5 * rect.width;
      const cy = (-n.y * sy + 1) * 0.5 * rect.height;
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      const isAccent = accentIdx.includes(i);
      const off = isAccent ? 18 : 9;
      el.style.transform = `translate(calc(-50% + ${off}px), -50%)`;
    }

    renderer.render(scene, camera);
  };

  // Animation loop with visibility pause
  let running = true;
  let raf = 0;
  const tick = () => {
    if (!running) return;
    render();
    raf = requestAnimationFrame(tick);
  };
  const onVis = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      tick();
    }
  };
  document.addEventListener('visibilitychange', onVis);
  tick();

  // Readout cycle — pick a concept and a distance every 2.2s
  // Cleanup function (also called on hot reload and on route change)
  const cleanup = () => {
    running = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('blur', onBlur);
    document.removeEventListener('visibilitychange', onVis);
    labelEls.forEach((el) => el.remove());
    edgeGeom.dispose();
    edgeMat.dispose();
    nodeGeom.dispose();
    nodeMat.dispose();
    accentGeom.dispose();
    accentMat.dispose();
    haloGeom.dispose();
    haloMat.dispose();
    renderer.dispose();
    heroCleanup = null;
  };
  if (import.meta.hot) {
    import.meta.hot.dispose(cleanup);
  }
  heroCleanup = cleanup;
}

// Module-level handle so the router can dispose the active hero graph
// before mounting the next page. Single active hero at a time.
let heroCleanup: (() => void) | null = null;

export function disposeHero(): void {
  if (heroCleanup) {
    try { heroCleanup(); } catch { /* noop */ }
    heroCleanup = null;
  }
}

// Static SVG poster — used under reduced motion or WebGL failure.
// Authored, not generated, so it composes correctly without a runtime.
function renderPoster(stage: HTMLElement): void {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 600 600');
  svg.classList.add('hero__stage-poster');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Static knowledge graph — animation disabled');

  // Edges
  const edges: [string, string, boolean][] = [
    ['dreaming', 'sleep', true], ['dreaming', 'memory', true], ['dreaming', 'rem', true],
    ['sleep', 'rem', false], ['sleep', 'consolidation', false], ['sleep', 'moon', false],
    ['memory', 'recall', false], ['memory', 'hippocampus', false], ['memory', 'consolidation', false],
    ['memory', 'schema', false], ['memory', 'habit', false],
    ['ocean', 'tide', true], ['ocean', 'wave', true], ['ocean', 'water', true], ['ocean', 'moon', true],
    ['ocean', 'salt', false], ['ocean', 'current', false], ['ocean', 'shore', false], ['ocean', 'fish', false],
    ['ocean', 'whale', false], ['ocean', 'kelp', false], ['ocean', 'abyss', false], ['ocean', 'coral', false],
    ['tide', 'moon', false], ['wave', 'shore', false], ['salt', 'water', false], ['current', 'water', false],
    ['fish', 'whale', false], ['coral', 'kelp', false], ['coral', 'abyss', false],
    ['sleep', 'tide', false], ['moon', 'tide', false], ['memory', 'current', false], ['pattern', 'wave', false]
  ];
  // Hand-placed positions for readability in the static poster.
  const pos: Record<string, [number, number]> = {
    dreaming: [180, 200], sleep: [110, 130], memory: [240, 280], rem: [60, 200],
    consolidation: [180, 380], hippocampus: [320, 200], schema: [350, 320], habit: [420, 200],
    recall: [200, 470], attention: [80, 470], pattern: [420, 470],
    ocean: [430, 150], tide: [500, 230], wave: [520, 90], water: [540, 320], moon: [200, 80],
    salt: [480, 410], current: [430, 500], shore: [560, 460], fish: [380, 540],
    whale: [300, 510], kelp: [510, 540], abyss: [560, 250], coral: [470, 80],
    plasticity: [330, 400]
  };
  for (const [a, b, accent] of edges) {
    const A = pos[a]; const B = pos[b];
    if (!A || !B) continue;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', String(A[0])); line.setAttribute('y1', String(A[1]));
    line.setAttribute('x2', String(B[0])); line.setAttribute('y2', String(B[1]));
    line.setAttribute('stroke', accent ? '#5E6AD2' : '#C4C4C4');
    line.setAttribute('stroke-width', accent ? '1' : '0.75');
    line.setAttribute('opacity', accent ? '0.6' : '0.55');
    svg.appendChild(line);
  }
  for (const [id, [x, y]] of Object.entries(pos)) {
    const isAccent = id === 'dreaming' || id === 'ocean';
    const r = isAccent ? 9 : 5;
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y)); c.setAttribute('r', String(r));
    c.setAttribute('fill', isAccent ? '#5E6AD2' : '#1B1B1B');
    c.setAttribute('opacity', isAccent ? '1' : '0.85');
    svg.appendChild(c);
    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', String(x + 12)); t.setAttribute('y', String(y + 3));
    t.setAttribute('font-family', 'Inter, sans-serif');
    t.setAttribute('font-size', '10');
    t.setAttribute('font-weight', isAccent ? '600' : '500');
    t.setAttribute('fill', isAccent ? '#1B1B1B' : '#7C7C7C');
    t.textContent = id;
    svg.appendChild(t);
  }
  stage.appendChild(svg);
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

