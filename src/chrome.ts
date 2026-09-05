// Shared chrome — header and footer rendered by the router.
// Active link gets aria-current="page".

type Route = string;

function isActive(route: Route, target: string): boolean {
  if (target === '/') return route === '/';
  return route === target || route.startsWith(target + '/');
}

export function renderHeader(currentRoute: Route): string {
  const links: Array<[string, string]> = [
    ['/modules/divergent-association', 'Modules'],
    ['/method', 'Method'],
    ['/transfer', 'Transfer battery'],
    ['/principles', 'Principles'],
    ['/about', 'About']
  ];
  const navLinks = links.map(([href, label]) => {
    const active = isActive(currentRoute, href);
    return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');

  return `
    <header class="header" id="header" data-scrolled="false">
      <div class="container header__inner">
        <a class="header__brand" href="/" aria-label="Wideweave — home">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="10" cy="12" r="2.4" fill="currentColor"/>
            <circle cx="22" cy="12" r="2.4" fill="currentColor"/>
            <circle cx="16" cy="22" r="2.4" fill="currentColor"/>
            <line x1="10" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1"/>
            <line x1="10" y1="12" x2="16" y2="22" stroke="currentColor" stroke-width="1"/>
            <line x1="22" y1="12" x2="16" y2="22" stroke="currentColor" stroke-width="1"/>
          </svg>
          <span>Wideweave</span>
        </a>
        <nav class="header__nav" aria-label="Primary">
          ${navLinks}
        </nav>
        <div class="header__cta">
          <a class="btn btn--ghost hide-mobile" href="/method">Read the method</a>
          <a class="btn btn--primary" href="/modules/divergent-association">Start a session</a>
        </div>
      </div>
    </header>
  `;
}

export function renderFooter(currentRoute: Route): string {
  void currentRoute;
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div>
            <a class="header__brand" href="/" aria-label="Wideweave — home">
              <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
                <circle cx="10" cy="12" r="2.4" fill="currentColor"/>
                <circle cx="22" cy="12" r="2.4" fill="currentColor"/>
                <circle cx="16" cy="22" r="2.4" fill="currentColor"/>
                <line x1="10" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1"/>
                <line x1="10" y1="12" x2="16" y2="22" stroke="currentColor" stroke-width="1"/>
                <line x1="22" y1="12" x2="16" y2="22" stroke="currentColor" stroke-width="1"/>
              </svg>
              <span>Wideweave</span>
            </a>
            <p class="t-body" style="margin-top: 14px; font-size: var(--fs-15); color: var(--ink-3); max-width: 32ch;">
              A living lab for the mental moves people are increasingly and
              invisibly outsourcing to AI tools.
            </p>
          </div>
          <div>
            <h4>Modules</h4>
            <ul>
              <li><a href="/modules/divergent-association">Divergent association</a></li>
              <li><a href="/modules/remote-associates">Remote associates</a></li>
              <li><a href="/modules/concept-jump">Concept jump</a></li>
              <li><a href="/modules/dual-n-back">Dual n-back</a></li>
              <li><a href="/modules/stroop">Stroop</a></li>
            </ul>
          </div>
          <div>
            <h4>Lab</h4>
            <ul>
              <li><a href="/method">The method</a></li>
              <li><a href="/transfer">Transfer battery</a></li>
              <li><a href="/principles">What we won't do</a></li>
              <li><a href="/about">About the lab</a></li>
            </ul>
          </div>
          <div>
            <h4>Open the lab</h4>
            <ul>
              <li><a href="/modules/divergent-association">Start a 12-min session</a></li>
              <li><a href="/about">About the open lab</a></li>
              <li><a href="/method">Research panel</a></li>
              <li><a href="/principles">Open data · FAQ</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__meta">
          <span>© Wideweave Lab · A research product, not a brain game.</span>
          <span data-live="weavers">v0.5 · open lab</span>
        </div>
      </div>
    </footer>
  `;
}

export function initHeaderScroll(): void {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => {
    header.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Update the live cohort counts shown in the footer. The cohort
// loader falls back to a quiet placeholder when Supabase is unconfigured.
import { refreshCohort } from './lib/cohort';
export function initLiveCounts(): void {
  void refreshCohort().then((snap) => {
    const weaversEls = document.querySelectorAll<HTMLElement>('[data-live="weavers"]');
    weaversEls.forEach((el) => {
      if (!snap.configured) {
        el.textContent = 'v0.5 · lab not yet connected';
      } else if (snap.weavers === 0) {
        el.textContent = 'v0.5 · the lab is open · be the first';
      } else {
        el.textContent = `v0.5 · ${snap.weavers.toLocaleString()} ${snap.weavers === 1 ? 'weaver' : 'weavers'} in the lab`;
      }
    });
  }).catch(() => {
    document.querySelectorAll<HTMLElement>('[data-live="weavers"]').forEach((el) => {
      el.textContent = 'v0.5 · cohort count unavailable';
    });
  });
}
