// Live cohort counts — replaces the hardcoded "5,318 active weavers".
// Falls back to a quiet placeholder when Supabase is not configured.

import { loadCohortStats, type CohortStat, type Module } from './history';
import { SUPABASE_CONFIGURED } from './supabase';

export type CohortSnapshot = {
  configured: boolean;
  weavers: number;
  sessions_total: number;
  byModule: Record<Module, CohortStat>;
  fetchedAt: number;
};

let cache: CohortSnapshot | null = null;
let inflight: Promise<CohortSnapshot> | null = null;

const EMPTY: CohortSnapshot = {
  configured: false,
  weavers: 0,
  sessions_total: 0,
  byModule: {
    dat: { module: 'dat', weavers: 0, sessions_total: 0, median_score: 0 },
    rat: { module: 'rat', weavers: 0, sessions_total: 0, median_score: 0 },
    cj: { module: 'cj', weavers: 0, sessions_total: 0, median_score: 0 },
    nb: { module: 'nb', weavers: 0, sessions_total: 0, median_score: 0 },
    stroop: { module: 'stroop', weavers: 0, sessions_total: 0, median_score: 0 }
  },
  fetchedAt: 0
};

export async function refreshCohort(): Promise<CohortSnapshot> {
  if (!SUPABASE_CONFIGURED) return { ...EMPTY };
  if (inflight) return inflight;
  inflight = (async () => {
    const data = await loadCohortStats();
    const snap: CohortSnapshot = {
      configured: true,
      weavers: data.weavers,
      sessions_total: data.sessions_total,
      byModule: data.byModule,
      fetchedAt: Date.now()
    };
    cache = snap;
    return snap;
  })().finally(() => { inflight = null; });
  return inflight;
}

export function getCohort(): CohortSnapshot {
  return cache ?? { ...EMPTY, configured: SUPABASE_CONFIGURED };
}

// "n weavers" with proper pluralization. "1 weaver", "0 weavers", "5,318 weavers"
export function weaversLabel(n: number): string {
  if (n === 1) return '1 weaver';
  return `${n.toLocaleString()} weavers`;
}

// "no sessions yet", "1 session", "5,318 sessions"
export function sessionsLabel(n: number): string {
  if (n === 1) return '1 session';
  return `${n.toLocaleString()} sessions`;
}
