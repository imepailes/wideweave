// Supabase client wrapper. Falls back to a no-op stub if the project URL
// is not configured, so the demos still work locally without Supabase.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const publishable = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();

export const SUPABASE_CONFIGURED = !!(url && publishable);

let client: SupabaseClient | null = null;

if (SUPABASE_CONFIGURED) {
  client = createClient(url!, publishable!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'wideweave.auth'
    }
  });
}

// Stub client used when Supabase is not configured. Logs warnings once
// per call site to avoid console spam. Every method resolves to a
// benign default so the UI doesn't crash.
type AnyObj = Record<string, unknown>;
function warnOnce(method: string): void {
  if (!warned.has(method)) {
    warned.add(method);
    // eslint-disable-next-line no-console
    console.info(`[supabase] not configured — ${method}() is a no-op. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env to enable persistence.`);
  }
}
const warned = new Set<string>();

const stubAuth = {
  async signInAnonymously() { warnOnce('signInAnonymously'); return { data: { user: null, session: null }, error: new Error('Supabase not configured') }; },
  async updateUser(_: AnyObj) { warnOnce('updateUser'); return { data: { user: null }, error: new Error('Supabase not configured') }; },
  async signOut() { warnOnce('signOut'); return { error: null }; },
  async getSession() { warnOnce('getSession'); return { data: { session: null }, error: null }; },
  async getUser() { warnOnce('getUser'); return { data: { user: null }, error: null }; },
  onAuthStateChange(_: AnyObj) { warnOnce('onAuthStateChange'); return { data: { subscription: { unsubscribe() {} } } }; }
};
const stubFrom = () => ({
  select(): unknown { return this; },
  insert(): unknown { return this; },
  update(): unknown { return this; },
  upsert(): unknown { return this; },
  eq(): unknown { return this; },
  order(): unknown { return this; },
  limit(): unknown { return this; },
  single(): unknown { return Promise.resolve({ data: null, error: new Error('Supabase not configured') }); },
  then(resolve: (v: { data: unknown; error: Error | null }) => void) { resolve({ data: null, error: new Error('Supabase not configured') }); return Promise.resolve({ data: null, error: new Error('Supabase not configured') }); }
});

export const supabase = (client ?? ({
  auth: stubAuth,
  from: stubFrom
} as unknown)) as SupabaseClient;
