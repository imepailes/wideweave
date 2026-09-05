// In-app module history — surfaces the user's recent sessions for the
// four core modules. Used on the /transfer page to compare "what you
// trained" against "what transfers".

import { supabase, SUPABASE_CONFIGURED } from './supabase';
import { getAuthState } from './auth';
import type { Module } from './history';

export type InAppLatest = Partial<Record<Module, {
  score: number;
  time_s: number;
  created_at: string;
}>>;

export type InAppSummary = {
  latest: InAppLatest;
  counts: Record<Module, number>;
  loadedAt: number;
};

let cache: InAppSummary | null = null;
let inflight: Promise<InAppSummary> | null = null;

const EMPTY_COUNTS: Record<Module, number> = { dat: 0, rat: 0, cj: 0, nb: 0 };

export async function loadInAppSummary(force = false): Promise<InAppSummary> {
  if (!SUPABASE_CONFIGURED) return { latest: {}, counts: { ...EMPTY_COUNTS }, loadedAt: Date.now() };
  if (cache && !force && Date.now() - cache.loadedAt < 5000) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const auth = getAuthState();
    if (auth.status !== 'signed-in') {
      return { latest: {}, counts: { ...EMPTY_COUNTS }, loadedAt: Date.now() };
    }
    // Pull the user's last 200 sessions, group by module, keep newest
    const { data, error } = await supabase
      .from('sessions')
      .select('module, score, time_s, created_at')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      return { latest: {}, counts: { ...EMPTY_COUNTS }, loadedAt: Date.now() };
    }
    const rows = (data ?? []) as { module: Module; score: number; time_s: number; created_at: string }[];
    const latest: InAppLatest = {};
    const counts: Record<Module, number> = { ...EMPTY_COUNTS };
    for (const r of rows) {
      counts[r.module] = (counts[r.module] ?? 0) + 1;
      if (!latest[r.module]) {
        latest[r.module] = { score: r.score, time_s: r.time_s, created_at: r.created_at };
      }
    }
    const out: InAppSummary = { latest, counts, loadedAt: Date.now() };
    cache = out;
    return out;
  })().finally(() => { inflight = null; });
  return inflight;
}

// Format a score for a module in a human-readable way.
export function formatInAppScore(module: Module, score: number): string {
  switch (module) {
    case 'dat': return `mean distance ${score.toFixed(3)}`;
    case 'rat': return `${(score * 6).toFixed(1)} / 6 solved`;
    case 'cj': return `${(score * 100).toFixed(0)}% efficient`;
    case 'nb': return `n-back ${score.toFixed(0)}${score >= 7 ? ' (capped)' : ''}`;
  }
}

export function inAppModuleLabel(module: Module): string {
  switch (module) {
    case 'dat': return 'Divergent Association';
    case 'rat': return 'Remote Associates';
    case 'cj': return 'Concept Jump';
    case 'nb': return 'Dual n-back';
  }
}
