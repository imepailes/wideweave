// Battery runs — persist and load. One row per completed battery.

import { supabase, SUPABASE_CONFIGURED } from './supabase';
import { getAuthState } from './auth';
import type { AgeBand, Comparison } from './batteryDistributions';
import type { BatteryRun } from '../battery/batteryController';

export type BatteryRunRow = {
  id: number;
  user_id: string;
  age_band: AgeBand | null;
  started_at: string;
  finished_at: string;
  time_s: number;
  scores: Record<string, { raw: number; trials: number; correct?: number; time_s: number; detail?: Record<string, unknown> }>;
  // Honest directional comparison: 'below' | 'within' | 'above' the
  // published healthy-adult range. No fabricated percentile.
  comparisons: Record<string, Comparison>;
  created_at: string;
};

// Detect the "table not found" case from a Supabase error. PostgREST
// returns 404 for missing tables and the client surfaces it with
// code 404 or PGRST116. We treat this as a recoverable state
// (migration not run yet) rather than a real error.
function isMissingTable(err: { code?: string; message?: string; status?: number } | null): boolean {
  if (!err) return false;
  if (err.code === '404' || err.code === 'PGRST116') return true;
  if (err.status === 404) return true;
  if (err.message && /Could not find the table|relation.*does not exist|404/i.test(err.message)) return true;
  return false;
}

export async function saveBatteryRun(run: BatteryRun): Promise<{ ok: boolean; id?: number; error?: string; needsMigration?: boolean }> {
  if (!SUPABASE_CONFIGURED) return { ok: false, error: 'Supabase not configured' };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { ok: false, error: 'Not signed in' };
  const row = {
    user_id: auth.user.id,
    age_band: run.ageBand,
    started_at: new Date(run.startedAt).toISOString(),
    finished_at: new Date(run.finishedAt).toISOString(),
    time_s: Math.round((run.finishedAt - run.startedAt) / 1000),
    scores: run.scores,
    comparisons: run.comparisons
  };
  const { data, error } = await supabase.from('battery_runs').insert(row).select('id').single();
  if (error) {
    if (isMissingTable(error as { code?: string; message?: string; status?: number } | null)) {
      // Don't log loudly — the page surfaces a banner.
      return { ok: false, error: 'battery_runs table missing', needsMigration: true };
    }
    // eslint-disable-next-line no-console
    console.warn('[battery] save failed', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: (data as { id: number } | null)?.id };
}

export async function loadBatteryHistory(limit = 10): Promise<{ rows: BatteryRunRow[]; needsMigration: boolean }> {
  if (!SUPABASE_CONFIGURED) return { rows: [], needsMigration: false };
  const auth = getAuthState();
  if (auth.status !== 'signed-in') return { rows: [], needsMigration: false };
  const { data, error } = await supabase
    .from('battery_runs')
    .select('id, user_id, age_band, started_at, finished_at, time_s, scores, comparisons, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    if (isMissingTable(error as { code?: string; message?: string; status?: number } | null)) {
      return { rows: [], needsMigration: true };
    }
    // eslint-disable-next-line no-console
    console.warn('[battery] load failed', error);
    return { rows: [], needsMigration: false };
  }
  return { rows: (data ?? []) as BatteryRunRow[], needsMigration: false };
}
