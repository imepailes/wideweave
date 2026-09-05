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
  svg.setAttribute('width', '160');
  svg.setAttribute('height', '160');
  svg.setAttribute('aria-hidden', 'true');
  // Palm
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
  // Thumb
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

export const mentalRotationTask: TaskHandle = {
  id: 'mental_rotation',
  name: 'Mental rotation',
  totalTrials: 12,
  mount(host, onComplete, onAbort) {
    const trials: RotationTrial[] = [...ROTATION_TRIALS].sort(() => Math.random() - 0.5);
    let i = 0;
    let correct = 0;
    let disposed = false;
    let nextTimer: number | null = null;
    const start = Date.now();

    const header = document.createElement('div');
    header.className = 'battery-task-head';
    const progress = document.createElement('div');
    progress.className = 'battery-task-head__progress';
    const counter = document.createElement('div');
    counter.className = 'battery-task-head__counter';
    const exitBtn = document.createElement('button');
    exitBtn.type = 'button';
    exitBtn.className = 'battery-task-head__exit';
    exitBtn.textContent = 'Exit battery';
    header.appendChild(progress);
    header.appendChild(counter);
    header.appendChild(exitBtn);

    const wrap = document.createElement('div');
    wrap.className = 'battery-mr__wrap';
    const leftBox = document.createElement('div');
    leftBox.className = 'battery-mr__hand battery-mr__hand--ref';
    const rightBox = document.createElement('div');
    rightBox.className = 'battery-mr__hand battery-mr__hand--target';
    const arrow = document.createElement('div');
    arrow.className = 'battery-mr__arrow';
    arrow.textContent = '→';
    const refHand = handSvg();
    const targetHand = handSvg();
    leftBox.appendChild(refHand);
    rightBox.appendChild(targetHand);
    wrap.appendChild(leftBox);
    wrap.appendChild(arrow);
    wrap.appendChild(rightBox);

    // The question text shows the angle. This is honest — the user
    // needs the angle to know whether the rotation seems plausible.
    const angleLabel = document.createElement('div');
    angleLabel.className = 'battery-mr__angle';

    const prompt = document.createElement('div');
    prompt.className = 'battery-mr__prompt';
    prompt.innerHTML = 'Same hand, rotated? Press <kbd>F</kbd> · Mirror? Press <kbd>J</kbd>';

    host.appendChild(header);
    host.appendChild(wrap);
    host.appendChild(angleLabel);
    host.appendChild(prompt);

    function updateProgress() {
      counter.textContent = `${i} / ${trials.length}`;
      progress.style.setProperty('--w', `${(i / trials.length) * 100}%`);
    }

    function abort() {
      if (disposed) return;
      disposed = true;
      if (onAbort) onAbort();
    }

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
      refHand.setAttribute('style', 'transform: rotate(0deg);');
      if (t.mirror) {
        targetHand.setAttribute('style', `transform: rotate(${t.angle}deg) scaleX(-1); transform-origin: center;`);
      } else {
        targetHand.setAttribute('style', `transform: rotate(${t.angle}deg); transform-origin: center;`);
      }
      angleLabel.textContent = `Rotation: ${t.angle}°`;
      updateProgress();
    }

    const onKey = (e: KeyboardEvent) => {
      if (disposed) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') { e.preventDefault(); abort(); return; }
      if (k !== 'f' && k !== 'j') return;
      e.preventDefault();
      const trial = trials[i];
      if (!trial) return;
      const userSays = k === 'f' ? 'same' : 'mirror';
      if (userSays === trial.correctIs) correct++;
      i++;
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = window.setTimeout(next, 250);
    };

    const onExit = () => abort();

    window.addEventListener('keydown', onKey);
    exitBtn.addEventListener('click', onExit);
    next();

    return () => {
      disposed = true;
      window.removeEventListener('keydown', onKey);
      exitBtn.removeEventListener('click', onExit);
      if (nextTimer) clearTimeout(nextTimer);
      host.innerHTML = '';
    };
  }
};
