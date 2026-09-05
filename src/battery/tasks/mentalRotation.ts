// Mental rotation — 12 trials with 0°-180° rotations.
// We use the "hands" version (Parsons 1987): two stylized hand
// silhouettes, the second rotated by some angle. The user judges
// whether the second is the same hand viewed from a different angle
// (rotated) or is a mirror image (different hand).
//
// Score = number of correct responses out of 12.

import { ROTATION_TRIALS, type RotationTrial } from '../../lib/batteryStimuli';
import type { TaskHandle } from '../taskRunner';

// Build a stylized "right hand" silhouette as inline SVG. The hand
// points up by default. We then rotate it.
function handSvg(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg') as SVGSVGElement;
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('width', '110');
  svg.setAttribute('height', '110');
  svg.setAttribute('aria-hidden', 'true');
  // Palm + 4 fingers + thumb, very simple
  const palm = document.createElementNS(ns, 'rect');
  palm.setAttribute('x', '38');
  palm.setAttribute('y', '40');
  palm.setAttribute('width', '24');
  palm.setAttribute('height', '40');
  palm.setAttribute('rx', '6');
  palm.setAttribute('fill', 'currentColor');
  svg.appendChild(palm);
  // Fingers
  const fingerSpec = [
    { x: 39, y: 18, w: 5, h: 28 },
    { x: 45, y: 12, w: 5, h: 34 },
    { x: 51, y: 14, w: 5, h: 32 },
    { x: 57, y: 22, w: 5, h: 24 }
  ];
  for (const f of fingerSpec) {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', String(f.x));
    r.setAttribute('y', String(f.y));
    r.setAttribute('width', String(f.w));
    r.setAttribute('height', String(f.h));
    r.setAttribute('rx', '2.5');
    r.setAttribute('fill', 'currentColor');
    svg.appendChild(r);
  }
  // Thumb (sticks out to the right at the top of the palm)
  const thumb = document.createElementNS(ns, 'rect');
  thumb.setAttribute('x', '60');
  thumb.setAttribute('y', '38');
  thumb.setAttribute('width', '14');
  thumb.setAttribute('height', '7');
  thumb.setAttribute('rx', '3.5');
  thumb.setAttribute('fill', 'currentColor');
  svg.appendChild(thumb);
  return svg;
}

// Mirror the hand: flip horizontally. The thumb moves to the left.
// (kept as a util for future paper-style figures; not currently used
// because we draw the mirror by applying scaleX(-1) inline)
function _mirrorSvg(src: SVGSVGElement): SVGSVGElement {
  const m = src.cloneNode(true) as SVGSVGElement;
  m.setAttribute('style', 'transform: scaleX(-1);');
  return m;
}
void _mirrorSvg;

export const mentalRotationTask: TaskHandle = {
  id: 'mental_rotation',
  name: 'Mental rotation',
  mount(host, onComplete) {
    const trials: RotationTrial[] = [...ROTATION_TRIALS].sort(() => Math.random() - 0.5);
    let i = 0;
    let correct = 0;
    let disposed = false;
    let nextTimer: number | null = null;
    let keyHandler: ((e: KeyboardEvent) => void) | null = null;
    const start = Date.now();

    const wrap = document.createElement('div');
    wrap.className = 'battery-mr__wrap';
    const leftBox = document.createElement('div');
    leftBox.className = 'battery-mr__hand battery-mr__hand--ref';
    const rightBox = document.createElement('div');
    rightBox.className = 'battery-mr__hand battery-mr__hand--target';
    const prompt = document.createElement('div');
    prompt.className = 'battery-mr__prompt';
    prompt.innerHTML = 'Same hand, rotated? Press <strong>F</strong> · Mirror? Press <strong>J</strong>';
    const refHand = handSvg();
    const targetHandBase = handSvg();
    leftBox.appendChild(refHand);
    rightBox.appendChild(targetHandBase);
    wrap.appendChild(leftBox);
    wrap.appendChild(rightBox);
    host.appendChild(wrap);
    host.appendChild(prompt);

    function next() {
      if (disposed) return;
      if (i >= trials.length) {
        const elapsed = Math.round((Date.now() - start) / 1000);
        onComplete({
          raw: correct,
          trials: trials.length,
          correct,
          time_s: elapsed
        });
        return;
      }
      const t = trials[i];
      // Always start with the right hand pointing up
      refHand.setAttribute('style', `transform: rotate(0deg);`);
      // Target: same hand rotated by t.angle, OR mirror
      if (t.mirror) {
        targetHandBase.setAttribute('style', `transform: rotate(${t.angle}deg) scaleX(-1);`);
      } else {
        targetHandBase.setAttribute('style', `transform: rotate(${t.angle}deg);`);
      }
    }

    keyHandler = (e: KeyboardEvent) => {
      if (disposed) return;
      const k = e.key.toLowerCase();
      if (k !== 'f' && k !== 'j') return;
      e.preventDefault();
      const t = trials[i];
      if (!t) return;
      // 'f' = same (rotated); 'j' = mirror
      const userSays = k === 'f' ? 'same' : 'mirror';
      if (userSays === t.correctIs) correct++;
      i++;
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = window.setTimeout(next, 200);
    };

    window.addEventListener('keydown', keyHandler);
    next();

    return () => {
      disposed = true;
      if (keyHandler) window.removeEventListener('keydown', keyHandler);
      if (nextTimer) clearTimeout(nextTimer);
      host.innerHTML = '';
    };
  }
};
