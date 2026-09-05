// Motion — Lenis smooth scroll + GSAP choreography.
// Single Lenis engine. Re-initable on route change so each page
// gets its own intro + scroll reveals, and old ScrollTriggers are
// killed when we navigate away.

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let lenisTickerFn: ((time: number) => void) | null = null;

// Scroll to top of the page. Uses Lenis if it's active so the smooth
// scroll engine and the native scroll stay in sync. Called on every
// route change BEFORE the new page mounts.
export function scrollToTop(immediate = true): void {
  if (lenis) {
    lenis.scrollTo(0, { immediate });
  } else {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}

export function initMotion(): () => void {
  // Header entrance
  const header = document.querySelector('.header');
  if (header && !reduced) {
    gsap.set(header, { y: -8, opacity: 0 });
    gsap.to(header, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
  } else if (header) {
    (header as HTMLElement).style.opacity = '1';
  }

  // Lenis — single smooth-scroll engine
  if (!reduced) {
    lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenisTickerFn = (time: number) => {
      lenis?.raf(time * 1000);
    };
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(lenisTickerFn);
    gsap.ticker.lagSmoothing(0);
  }

  return () => {
    if (lenisTickerFn) {
      gsap.ticker.remove(lenisTickerFn);
      lenisTickerFn = null;
    }
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.killTweensOf('*');
  };
}

// Page-specific intro + reveals. Called by each page's init().
export function pageIntro(): () => void {
  const triggers: ScrollTrigger[] = [];

  // Hero / page-lead intro
  const h1 = document.querySelector('.page-lead h1');
  const lead = document.querySelector('.page-lead .t-lead, .page-lead .t-body');
  const meta = document.querySelector('.page-lead .page-lead__meta');
  const stage = document.getElementById('hero-stage');

  if (h1 && !reduced) {
    const original = h1.innerHTML;
    const parts = original.split(/(\s+|<br\s*\/?>)/gi);
    const wrapped = parts
      .map((p) => (/^\s+$/.test(p) || /^<br/i.test(p)) ? p : `<span class="reveal-word">${p}</span>`)
      .join('');
    h1.innerHTML = wrapped;
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    if (meta) tl.fromTo(meta, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 }, 0);
    tl.to(h1.querySelectorAll('.reveal-word'), { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 }, 0.1);
    if (lead) tl.fromTo(lead, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 }, 0.45);
    if (stage) tl.fromTo(stage, { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.15);
  } else {
    [h1, lead, stage].forEach((el) => {
      if (el) (el as HTMLElement).style.opacity = '1';
    });
  }

  // Generic reveals
  const targets = gsap.utils.toArray<HTMLElement>('.reveal-block, .t-h2, .t-lead, .module, .principle, .skill, .loop__step, .battery__row, .honesty__row, .module-index__card, .module-detail__demo, .module-detail__research, .method__rule, .transfer__panel, .principle-row, .about__card');
  if (reduced) {
    gsap.set(targets, { opacity: 1, y: 0 });
  } else {
    gsap.set(targets, { opacity: 0, y: 14 });
    ScrollTrigger.batch(targets, {
      start: 'top 90%',
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.04 });
      },
      once: true
    });
  }
  // Track for cleanup
  triggers.push(...ScrollTrigger.getAll());

  // Section heads: stagger meta + heading
  gsap.utils.toArray<HTMLElement>('.section-head').forEach((head) => {
    const m = head.querySelector('.section-head__meta');
    const h2 = head.querySelector('.t-h2');
    const lead = head.querySelector('.t-lead, .t-body');
    if (reduced) {
      gsap.set([m, h2, lead].filter(Boolean) as HTMLElement[], { opacity: 1, y: 0 });
      return;
    }
    gsap.set([m, h2, lead].filter(Boolean) as HTMLElement[], { opacity: 0, y: 12 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: head, start: 'top 90%', once: true }
    });
    if (m) tl.to(m, { opacity: 1, y: 0, duration: 0.5 }, 0);
    if (h2) tl.to(h2, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
    if (lead) tl.to(lead, { opacity: 1, y: 0, duration: 0.6 }, 0.25);
    triggers.push(...ScrollTrigger.getAll());
  });

  // Font load refresh
  let refreshTimer: number | null = null;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  }
  const onResize = () => {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  window.addEventListener('resize', onResize);

  return () => {
    triggers.forEach((t) => t.kill());
    window.removeEventListener('resize', onResize);
    if (refreshTimer) clearTimeout(refreshTimer);
  };
}

// Keep the legacy initMotion export so main.ts can call it for the first mount.
export { initMotion as defaultInitMotion };
