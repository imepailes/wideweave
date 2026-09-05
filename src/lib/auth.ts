// Auth — anonymous first, optional email claim later.
// Anonymous sign-in is a real Supabase user (with auth.uid() and RLS
// working) but the user has no email. They can claim one at any time
// by calling claimEmail().

import { supabase, SUPABASE_CONFIGURED } from './supabase';
import type { User } from '@supabase/supabase-js';

export type AuthState =
  | { status: 'unconfigured' }
  | { status: 'loading' }
  | { status: 'signed-in'; user: User; isAnonymous: boolean };

type Listener = (s: AuthState) => void;
const listeners = new Set<Listener>();
let state: AuthState = { status: SUPABASE_CONFIGURED ? 'loading' : 'unconfigured' };

export function getAuthState(): AuthState {
  return state;
}

export function onAuthChange(fn: Listener): () => void {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

function set(s: AuthState): void {
  state = s;
  for (const l of listeners) l(s);
}

export async function initAuth(): Promise<void> {
  if (!SUPABASE_CONFIGURED) {
    set({ status: 'unconfigured' });
    return;
  }
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    const u = data.session.user;
    set({ status: 'signed-in', user: u, isAnonymous: !u.email });
    return;
  }
  // No session — sign in anonymously.
  const res = await supabase.auth.signInAnonymously();
  if (res.error) {
    // eslint-disable-next-line no-console
    console.warn('[auth] signInAnonymously failed', res.error);
    set({ status: 'loading' });
    return;
  }
  if (res.data.user) {
    set({ status: 'signed-in', user: res.data.user, isAnonymous: !res.data.user.email });
  }
}

// Claim an email for the current anonymous user. Supabase sends a magic
// link if email-based auth is enabled; the user clicks it to verify.
// In our deployment the link redirects back to the app.
export async function claimEmail(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: 'Supabase is not configured' };
  if (state.status !== 'signed-in' || !state.isAnonymous) {
    return { ok: false, error: 'Already signed in with an email account' };
  }
  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Listen for auth changes (sign-out, email claim, etc.)
if (SUPABASE_CONFIGURED) {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const u = session.user;
      set({ status: 'signed-in', user: u, isAnonymous: !u.email });
    } else {
      set({ status: 'unconfigured' });
    }
  });
}
