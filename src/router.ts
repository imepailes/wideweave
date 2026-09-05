// Tiny client-side router.
// Intercepts internal <a data-link> clicks, mounts the matching page,
// and runs the page's init. History API for back/forward.

import { renderHeader, renderFooter, initHeaderScroll, initLiveCounts } from './chrome';
import { scrollToTop } from './motion';
import type { PageModule } from './pages/types';

const routes: Record<string, () => Promise<PageModule>> = {
  '/': () => import('./pages/landing').then((m) => m.landingPage),
  '/modules/divergent-association': () => import('./pages/dat').then((m) => m.datPage),
  '/modules/remote-associates': () => import('./pages/rat').then((m) => m.ratPage),
  '/modules/concept-jump': () => import('./pages/cj').then((m) => m.cjPage),
  '/modules/dual-n-back': () => import('./pages/nb').then((m) => m.nbPage),
  '/method': () => import('./pages/method').then((m) => m.methodPage),
  '/transfer': () => import('./pages/transfer').then((m) => m.transferPage),
  '/principles': () => import('./pages/principles').then((m) => m.principlesPage),
  '/about': () => import('./pages/about').then((m) => m.aboutPage)
};

let currentDispose: (() => void) | null = null;
let currentPath: string = '/';

function resolvePath(href: string): string {
  // Strip origin if any, keep path + search
  try {
    const u = new URL(href, location.origin);
    return u.pathname + u.search;
  } catch {
    return href;
  }
}

function matchRoute(path: string): string {
  // Try exact match first
  if (routes[path]) return path;
  // Try with trailing slash normalised
  const norm = path.replace(/\/+$/, '') || '/';
  if (routes[norm]) return norm;
  // Fallback: landing
  return '/';
}

export async function mount(path: string, push = true): Promise<void> {
  const route = matchRoute(path);
  const loader = routes[route];
  if (!loader) return;
  const page = await loader();

  // Reset scroll BEFORE tearing down so Lenis (still alive) tracks to 0
  scrollToTop(true);

  // Tear down previous page
  if (currentDispose) {
    try { currentDispose(); } catch { /* noop */ }
    currentDispose = null;
  }

  // Build the document frame
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = renderHeader(route) + `<main id="main">${page.html}</main>` + renderFooter(route);

  // Update browser URL + history
  if (push) {
    if (route !== currentPath || location.pathname !== route) {
      history.pushState({ path: route }, '', route);
    }
  }
  currentPath = route;
  // Belt-and-braces: also reset native scroll after DOM swap.
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // Page-specific init
  const dispose = await page.init();
  currentDispose = dispose ?? null;

  // Chrome (header scroll state)
  initHeaderScroll();
  initLiveCounts();

  // Tell the console which page is live
  console.info(`[wideweave] mounted ${route}`);
}

export function startRouter(): void {
  // Initial mount
  mount(location.pathname, false);

  // Back / forward
  window.addEventListener('popstate', () => {
    mount(location.pathname, false);
  });

  // Click delegation
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement)?.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // Skip external, mail, tel, hash, target=_blank, modifier keys
    if (a.target === '_blank') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (href.startsWith('#')) return; // in-page anchors
    const path = resolvePath(href);
    if (path === currentPath) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    mount(path, true);
  });
}
