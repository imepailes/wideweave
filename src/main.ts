// Entry — start the router. The router mounts pages and runs each
// page's init (which in turn sets up motion + the page's modules).
import './styles.css';
import { startRouter } from './router';
import { initAuth } from './lib/auth';

// Kick off auth in parallel with the first route mount. Pages can use
// getAuthState() to know if the user is signed in. We don't gate the
// page on auth — anonymous users see a banner offering email claim.
initAuth().catch((err) => {
  // eslint-disable-next-line no-console
  console.warn('[auth] init failed', err);
});

startRouter();
